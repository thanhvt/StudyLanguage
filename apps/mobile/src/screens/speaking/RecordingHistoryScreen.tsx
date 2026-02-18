import React, {useEffect, useState} from 'react';
import {View, FlatList, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

const speakingColor = SKILL_COLORS.speaking.dark;

// =======================
// Types
// =======================

interface RecordingItem {
  id: string;
  sentence: string;
  score: number;
  pronunciation: number;
  fluency: number;
  pace: number;
  date: string;
  mode: 'practice' | 'shadowing' | 'roleplay' | 'tongue-twister';
}

// =======================
// Mock data
// =======================

const MOCK_RECORDINGS: RecordingItem[] = [
  {id: '1', sentence: 'The quick brown fox jumps over the lazy dog.', score: 85, pronunciation: 88, fluency: 82, pace: 85, date: '2026-02-18', mode: 'practice'},
  {id: '2', sentence: 'She sells seashells by the seashore.', score: 72, pronunciation: 68, fluency: 75, pace: 73, date: '2026-02-18', mode: 'tongue-twister'},
  {id: '3', sentence: 'How are you doing today?', score: 92, pronunciation: 95, fluency: 90, pace: 91, date: '2026-02-17', mode: 'practice'},
  {id: '4', sentence: 'I would like to book a room for two nights.', score: 78, pronunciation: 80, fluency: 75, pace: 79, date: '2026-02-17', mode: 'roleplay'},
  {id: '5', sentence: 'The weather is beautiful this morning.', score: 88, pronunciation: 90, fluency: 86, pace: 88, date: '2026-02-16', mode: 'shadowing'},
  {id: '6', sentence: 'Peter Piper picked a peck of pickled peppers.', score: 65, pronunciation: 60, fluency: 70, pace: 65, date: '2026-02-16', mode: 'tongue-twister'},
  {id: '7', sentence: 'Can you tell me the way to the nearest station?', score: 80, pronunciation: 82, fluency: 78, pace: 80, date: '2026-02-15', mode: 'roleplay'},
  {id: '8', sentence: 'I have been learning English for three years.', score: 91, pronunciation: 93, fluency: 88, pace: 92, date: '2026-02-15', mode: 'practice'},
];

const MODE_LABELS: Record<string, {emoji: string; label: string}> = {
  practice: {emoji: '🎙️', label: 'Luyện tập'},
  shadowing: {emoji: '🎧', label: 'Shadowing'},
  roleplay: {emoji: '🎭', label: 'Roleplay'},
  'tongue-twister': {emoji: '👅', label: 'Tongue Twister'},
};

/**
 * Mục đích: Lấy màu dựa trên score
 * Tham số đầu vào: score (0-100)
 * Tham số đầu ra: string — hex
 * Khi nào sử dụng: Tô màu score badge
 */
function getScoreColor(score: number) {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
}

// =======================
// Screen
// =======================

/**
 * Mục đích: Lịch sử ghi âm và kết quả đánh giá
 * Tham số đầu vào: không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → navigate RecordingHistory
 *   Hiển thị danh sách sessions cũ + filter theo mode
 */
export default function RecordingHistoryScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();

  const [filter, setFilter] = useState<string>('all');
  const [recordings] = useState<RecordingItem[]>(MOCK_RECORDINGS);

  const filtered = filter === 'all'
    ? recordings
    : recordings.filter(r => r.mode === filter);

  /**
   * Mục đích: Render 1 recording item
   * Tham số đầu vào: item (RecordingItem)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderItem = ({item}: {item: RecordingItem}) => {
    const scoreColor = getScoreColor(item.score);
    const modeInfo = MODE_LABELS[item.mode] || {emoji: '🎙️', label: item.mode};

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.card, {backgroundColor: colors.surface}]}
        onPress={() => {
          console.log('📂 [RecordingHistory] Mở chi tiết:', item.id);
        }}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <AppText variant="body" className="text-foreground" numberOfLines={2} raw>
              {item.sentence}
            </AppText>
            <View style={styles.metaRow}>
              <AppText variant="caption" className="text-neutrals400" raw>
                {modeInfo.emoji} {modeInfo.label}
              </AppText>
              <AppText variant="caption" className="text-neutrals400 ml-3" raw>
                📅 {item.date}
              </AppText>
            </View>
          </View>

          <View style={[styles.scoreBadge, {backgroundColor: `${scoreColor}15`}]}>
            <AppText variant="heading3" weight="bold" style={{color: scoreColor}} raw>
              {item.score}
            </AppText>
          </View>
        </View>

        {/* Mini sub-scores */}
        <View style={styles.subRow}>
          <AppText variant="caption" className="text-neutrals400" raw>
            🎯 {item.pronunciation}
          </AppText>
          <AppText variant="caption" className="text-neutrals400" raw>
            💬 {item.fluency}
          </AppText>
          <AppText variant="caption" className="text-neutrals400" raw>
            ⚡ {item.pace}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost" size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">📂 Lịch sử</AppText>
        </View>
        <View className="w-9" />
      </View>

      {/* Filter */}
      <View className="flex-row px-4 mb-3 gap-2" style={{flexWrap: 'wrap'}}>
        {[
          {key: 'all', label: 'Tất cả'},
          {key: 'practice', label: '🎙️ Luyện'},
          {key: 'shadowing', label: '🎧 Shadow'},
          {key: 'roleplay', label: '🎭 RP'},
          {key: 'tongue-twister', label: '👅 TW'},
        ].map(f => (
          <AppButton
            key={f.key}
            variant={filter === f.key ? 'primary' : 'outline'}
            size="sm"
            style={filter === f.key ? {backgroundColor: speakingColor} : undefined}
            onPress={() => setFilter(f.key)}>
            {f.label}
          </AppButton>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <AppText variant="body" className="text-neutrals400" raw>
              Chưa có bản ghi nào
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.12)',
  },
});
