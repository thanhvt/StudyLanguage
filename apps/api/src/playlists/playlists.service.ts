/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface cho việc tạo playlist mới
 */
export interface CreatePlaylistDto {
  name: string;
  description?: string;
}

/**
 * Interface cho việc cập nhật playlist
 */
export interface UpdatePlaylistDto {
  name?: string;
  description?: string;
}

/**
 * Interface cho việc thêm item vào playlist
 */
export interface AddPlaylistItemDto {
  topic: string;
  conversation: { speaker: string; text: string }[];
  duration: number;
  numSpeakers: number;
  category?: string;
  subCategory?: string;
  audioUrl?: string; // URL audio đã sinh (nếu có)
  audioTimestamps?: object[]; // Timestamps (nếu có)
}

/**
 * Interface cho việc sắp xếp lại items
 */
export interface ReorderItemsDto {
  items: { id: string; position: number }[];
}

/**
 * PlaylistsService - Service xử lý CRUD cho Playlists
 *
 * Mục đích: Quản lý playlists và playlist items của user trong Supabase
 * Tham số đầu vào: userId và các DTOs
 * Tham số đầu ra: Dữ liệu từ Supabase
 * Khi nào sử dụng: Được inject vào PlaylistsController
 */
@Injectable()
export class PlaylistsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Lấy danh sách playlists của user
   *
   * @param userId - ID của user hiện tại
   * @returns Danh sách playlists kèm số lượng items
   */
  async getPlaylists(userId: string) {
    // Lấy playlists
    const { data: playlists, error: playlistsError } = await this.supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (playlistsError) {
      console.error('[PlaylistsService] Lỗi lấy playlists:', playlistsError);
      throw playlistsError;
    }

    // Lấy số lượng items cho mỗi playlist
    const playlistsWithCount = await Promise.all(
      (playlists || []).map(async (playlist) => {
        const { count } = await this.supabase
          .from('playlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('playlist_id', playlist.id);

        return {
          ...playlist,
          itemCount: count || 0,
        };
      }),
    );

    return {
      success: true,
      playlists: playlistsWithCount,
    };
  }

  /**
   * Tạo playlist mới
   *
   * @param userId - ID của user hiện tại
   * @param dto - Dữ liệu playlist cần tạo
   * @returns Playlist vừa tạo
   */
  async createPlaylist(userId: string, dto: CreatePlaylistDto) {
    const { data, error } = await this.supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name: dto.name,
        description: dto.description,
      })
      .select()
      .single();

    if (error) {
      console.error('[PlaylistsService] Lỗi tạo playlist:', error);
      throw error;
    }

    return {
      success: true,
      playlist: data,
    };
  }

  /**
   * Cập nhật playlist
   *
   * @param userId - ID của user hiện tại
   * @param playlistId - ID của playlist cần cập nhật
   * @param dto - Dữ liệu cập nhật
   * @returns Playlist đã cập nhật
   */
  async updatePlaylist(
    userId: string,
    playlistId: string,
    dto: UpdatePlaylistDto,
  ) {
    const { data, error } = await this.supabase
      .from('playlists')
      .update({
        name: dto.name,
        description: dto.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playlistId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[PlaylistsService] Lỗi cập nhật playlist:', error);
      throw error;
    }

    return {
      success: true,
      playlist: data,
    };
  }

  /**
   * Xóa playlist
   *
   * @param userId - ID của user hiện tại
   * @param playlistId - ID của playlist cần xóa
   * @returns Kết quả xóa
   */
  async deletePlaylist(userId: string, playlistId: string) {
    const { error } = await this.supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', userId);

    if (error) {
      console.error('[PlaylistsService] Lỗi xóa playlist:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa playlist',
    };
  }

  /**
   * Lấy chi tiết playlist kèm items
   *
   * @param userId - ID của user hiện tại
   * @param playlistId - ID của playlist
   * @returns Playlist kèm danh sách items
   */
  async getPlaylistWithItems(userId: string, playlistId: string) {
    // Lấy playlist
    const { data: playlist, error: playlistError } = await this.supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (playlistError) {
      console.error('[PlaylistsService] Lỗi lấy playlist:', playlistError);
      throw playlistError;
    }

    // Lấy items
    const { data: items, error: itemsError } = await this.supabase
      .from('playlist_items')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (itemsError) {
      console.error('[PlaylistsService] Lỗi lấy playlist items:', itemsError);
      throw itemsError;
    }

    return {
      success: true,
      playlist: {
        ...playlist,
        items: items || [],
      },
    };
  }

  /**
   * Thêm item vào playlist
   *
   * @param userId - ID của user hiện tại
   * @param playlistId - ID của playlist
   * @param dto - Dữ liệu item cần thêm
   * @returns Item vừa thêm
   */
  async addItemToPlaylist(
    userId: string,
    playlistId: string,
    dto: AddPlaylistItemDto,
  ) {
    // Kiểm tra playlist thuộc về user
    const { data: playlist, error: checkError } = await this.supabase
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (checkError || !playlist) {
      throw new Error('Playlist không tồn tại hoặc không thuộc về bạn');
    }

    // Lấy position cao nhất hiện tại
    const { data: maxPositionData } = await this.supabase
      .from('playlist_items')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPositionData?.[0]?.position ?? -1) + 1;

    // Thêm item
    const { data, error } = await this.supabase
      .from('playlist_items')
      .insert({
        playlist_id: playlistId,
        topic: dto.topic,
        conversation: dto.conversation,
        duration: dto.duration,
        num_speakers: dto.numSpeakers,
        category: dto.category,
        sub_category: dto.subCategory,
        audio_url: dto.audioUrl,
        audio_timestamps: dto.audioTimestamps,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error('[PlaylistsService] Lỗi thêm item vào playlist:', error);
      throw error;
    }

    return {
      success: true,
      item: data,
    };
  }

  /**
   * Xóa item khỏi playlist
   *
   * @param userId - ID của user hiện tại
   * @param playlistId - ID của playlist
   * @param itemId - ID của item cần xóa
   * @returns Kết quả xóa
   */
  async removeItemFromPlaylist(
    userId: string,
    playlistId: string,
    itemId: string,
  ) {
    // Kiểm tra playlist thuộc về user
    const { data: playlist, error: checkError } = await this.supabase
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (checkError || !playlist) {
      throw new Error('Playlist không tồn tại hoặc không thuộc về bạn');
    }

    // Xóa item
    const { error } = await this.supabase
      .from('playlist_items')
      .delete()
      .eq('id', itemId)
      .eq('playlist_id', playlistId);

    if (error) {
      console.error('[PlaylistsService] Lỗi xóa item khỏi playlist:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa khỏi playlist',
    };
  }

  /**
   * Sắp xếp lại items trong playlist
   *
   * @param userId - ID của user hiện tại
   * @param playlistId - ID của playlist
   * @param dto - Dữ liệu sắp xếp mới
   * @returns Kết quả sắp xếp
   */
  async reorderItems(userId: string, playlistId: string, dto: ReorderItemsDto) {
    // Kiểm tra playlist thuộc về user
    const { data: playlist, error: checkError } = await this.supabase
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (checkError || !playlist) {
      throw new Error('Playlist không tồn tại hoặc không thuộc về bạn');
    }

    // Cập nhật position cho từng item
    for (const item of dto.items) {
      await this.supabase
        .from('playlist_items')
        .update({ position: item.position })
        .eq('id', item.id)
        .eq('playlist_id', playlistId);
    }

    return {
      success: true,
      message: 'Đã sắp xếp lại playlist',
    };
  }
}
