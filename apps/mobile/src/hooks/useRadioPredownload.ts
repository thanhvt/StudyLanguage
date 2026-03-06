/**
 * useRadioPredownload — Hook tải trước audio cho tất cả tracks trong playlist
 *
 * Mục đích: T-25 — Background pre-download toàn bộ tracks audio (không chỉ N+1)
 * Tham số đầu vào: playlist (RadioPlaylistResult | null)
 * Tham số đầu ra: { downloadedCount, total, isDownloading }
 * Khi nào sử dụng: RadioScreen gọi sau khi playlist ready (radioState === 'ready' | 'playing')
 */
import {useState, useEffect, useRef, useCallback} from 'react';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi} from '@/services/api/listening';
import {radioApi} from '@/services/api/radio';
import type {RadioPlaylistResult, RadioPlaylistItem} from '@/services/api/radio';

interface PredownloadState {
  /** Số tracks đã download xong */
  downloadedCount: number;
  /** Tổng số tracks */
  total: number;
  /** Đang download hay không */
  isDownloading: boolean;
  /** Set tracks đã có audio (bao gồm cả cached lẫn mới download) */
  downloadedIds: Set<string>;
}

/**
 * Mục đích: Hook pre-download audio cho toàn bộ playlist tracks
 * Tham số đầu vào:
 *   - playlist: RadioPlaylistResult | null
 *   - onTrackDownloaded: callback khi 1 track download xong (optional)
 * Tham số đầu ra: PredownloadState
 * Khi nào sử dụng: RadioScreen sau khi generate playlist xong
 */
export function useRadioPredownload(
  playlist: RadioPlaylistResult | null,
  onTrackDownloaded?: (index: number, audioUrl: string) => void,
) {
  const [state, setState] = useState<PredownloadState>({
    downloadedCount: 0,
    total: 0,
    isDownloading: false,
    downloadedIds: new Set(),
  });

  const abortRef = useRef<AbortController | null>(null);
  // Guard ref: tránh trùng lặp download cùng playlist
  const currentPlaylistIdRef = useRef<string | null>(null);

  // TTS settings từ Listening store
  const randomVoice = useListeningStore(s => s.randomVoice);
  const voicePerSpeaker = useListeningStore(s => s.voicePerSpeaker);
  const multiTalker = useListeningStore(s => s.multiTalker);
  const multiTalkerPairIndex = useListeningStore(s => s.multiTalkerPairIndex);
  const ttsEmotion = useListeningStore(s => s.ttsEmotion);
  const ttsPitch = useListeningStore(s => s.ttsPitch);
  const ttsRate = useListeningStore(s => s.ttsRate);
  const ttsVolume = useListeningStore(s => s.ttsVolume);
  const randomEmotion = useListeningStore(s => s.randomEmotion);

  /**
   * Mục đích: Download audio cho 1 track
   * Tham số đầu vào: item, playlistId
   * Tham số đầu ra: audioUrl string hoặc null nếu lỗi
   * Khi nào sử dụng: downloadAllTracks() gọi tuần tự cho mỗi track
   */
  const downloadTrackAudio = useCallback(
    async (item: RadioPlaylistItem, playlistId: string): Promise<string | null> => {
      // Đã có audio → skip
      if (item.audioUrl) {
        return item.audioUrl;
      }

      try {
        // Sinh audio TTS (dùng cùng settings với useRadioPlayer)
        const audioResult = await listeningApi.generateConversationAudio(
          item.conversation.map(c => ({speaker: c.speaker, text: c.text})),
          {
            provider: 'azure',
            randomVoice,
            ...(Object.keys(voicePerSpeaker).length > 0 && {voicePerSpeaker}),
            multiTalker,
            multiTalkerPairIndex,
            emotion: ttsEmotion,
            pitch: ttsPitch,
            rate: ttsRate,
            volume: ttsVolume,
            randomEmotion,
          },
        );

        // Cache audio URL vào DB (T-03)
        await radioApi.updateTrackAudio(
          playlistId,
          item.id,
          audioResult.audioUrl,
          audioResult.timestamps?.map((t: any) => ({
            startTime: t.startTime,
            endTime: t.endTime,
          })),
        ).catch((err: any) => {
          console.warn('⚠️ [Pre-download] Lỗi cache audio URL:', err?.message);
        });

        return audioResult.audioUrl;
      } catch (error: any) {
        console.warn(`⚠️ [Pre-download] Lỗi track "${item.topic}":`, error?.message);
        return null; // Skip track lỗi, tiếp tục track khác
      }
    },
    [randomVoice, voicePerSpeaker, multiTalker, multiTalkerPairIndex,
     ttsEmotion, ttsPitch, ttsRate, ttsVolume, randomEmotion],
  );

  // Main effect: bắt đầu pre-download khi có playlist mới
  useEffect(() => {
    if (!playlist?.items?.length || !playlist.playlist?.id) {
      // Reset state khi không có playlist
      setState({downloadedCount: 0, total: 0, isDownloading: false, downloadedIds: new Set()});
      return;
    }

    const playlistId = playlist.playlist.id;

    // Guard: không download trùng playlist
    if (currentPlaylistIdRef.current === playlistId) {
      return;
    }
    currentPlaylistIdRef.current = playlistId;

    // Cancel download trước đó
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Đếm tracks đã có audio sẵn
    const alreadyCached = new Set<string>();
    playlist.items.forEach(item => {
      if (item.audioUrl) {
        alreadyCached.add(item.id);
      }
    });

    setState({
      downloadedCount: alreadyCached.size,
      total: playlist.items.length,
      isDownloading: true,
      downloadedIds: new Set(alreadyCached),
    });

    console.log(`📥 [Pre-download] Bắt đầu: ${alreadyCached.size}/${playlist.items.length} đã có audio`);

    // Download tuần tự (tránh overload API)
    (async () => {
      for (let i = 0; i < playlist.items.length; i++) {
        if (controller.signal.aborted) {
          console.log('📥 [Pre-download] Đã hủy');
          break;
        }

        const item = playlist.items[i];

        // Skip nếu đã có audio
        if (item.audioUrl || alreadyCached.has(item.id)) {
          continue;
        }

        console.log(`📥 [Pre-download] Track ${i + 1}/${playlist.items.length}: ${item.topic}`);
        const audioUrl = await downloadTrackAudio(item, playlistId);

        if (controller.signal.aborted) break;

        if (audioUrl) {
          alreadyCached.add(item.id);
          setState(prev => ({
            ...prev,
            downloadedCount: alreadyCached.size,
            downloadedIds: new Set(alreadyCached),
          }));
          onTrackDownloaded?.(i, audioUrl);
        }
      }

      if (!controller.signal.aborted) {
        setState(prev => ({...prev, isDownloading: false}));
        console.log(`✅ [Pre-download] Hoàn thành: ${alreadyCached.size}/${playlist.items.length}`);
      }
    })();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist?.playlist?.id, downloadTrackAudio]);

  /**
   * Mục đích: Cancel tất cả downloads đang chạy
   * Khi nào sử dụng: User xóa playlist hoặc tạo playlist mới
   */
  const cancelDownload = useCallback(() => {
    abortRef.current?.abort();
    currentPlaylistIdRef.current = null;
    setState(prev => ({...prev, isDownloading: false}));
  }, []);

  return {
    ...state,
    cancelDownload,
    /** Kiểm tra 1 track đã download chưa */
    isTrackDownloaded: (trackId: string) => state.downloadedIds.has(trackId),
  };
}
