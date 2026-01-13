import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import {
  PlaylistsService,
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddPlaylistItemDto,
  ReorderItemsDto,
} from './playlists.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * PlaylistsController - Controller xử lý API cho Playlists
 * 
 * Mục đích: Expose các endpoints cho CRUD Playlists và Playlist Items
 * Khi nào sử dụng: Frontend gọi API để quản lý playlists
 */
@ApiTags('Playlists')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  /**
   * Lấy danh sách playlists của user
   * 
   * GET /playlists
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách playlists' })
  async getPlaylists(@Req() req: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.getPlaylists(userId);
    } catch (error) {
      console.error('[PlaylistsController] GET error:', error);
      throw new HttpException(
        error.message || 'Lỗi lấy danh sách playlists',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tạo playlist mới
   * 
   * POST /playlists
   */
  @Post()
  @ApiOperation({ summary: 'Tạo playlist mới' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'My Listening Playlist' },
        description: { type: 'string', example: 'Các bài nghe yêu thích' },
      },
      required: ['name'],
    },
  })
  async createPlaylist(@Req() req: any, @Body() dto: CreatePlaylistDto) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.createPlaylist(userId, dto);
    } catch (error) {
      console.error('[PlaylistsController] POST error:', error);
      throw new HttpException(
        error.message || 'Lỗi tạo playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy chi tiết playlist kèm items
   * 
   * GET /playlists/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết playlist kèm items' })
  @ApiParam({ name: 'id', description: 'ID của playlist' })
  async getPlaylistWithItems(@Req() req: any, @Param('id') id: string) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.getPlaylistWithItems(userId, id);
    } catch (error) {
      console.error('[PlaylistsController] GET :id error:', error);
      throw new HttpException(
        error.message || 'Lỗi lấy chi tiết playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật playlist
   * 
   * PUT /playlists/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật playlist' })
  @ApiParam({ name: 'id', description: 'ID của playlist' })
  async updatePlaylist(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.updatePlaylist(userId, id, dto);
    } catch (error) {
      console.error('[PlaylistsController] PUT error:', error);
      throw new HttpException(
        error.message || 'Lỗi cập nhật playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa playlist
   * 
   * DELETE /playlists/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa playlist' })
  @ApiParam({ name: 'id', description: 'ID của playlist' })
  async deletePlaylist(@Req() req: any, @Param('id') id: string) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.deletePlaylist(userId, id);
    } catch (error) {
      console.error('[PlaylistsController] DELETE error:', error);
      throw new HttpException(
        error.message || 'Lỗi xóa playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Thêm item vào playlist
   * 
   * POST /playlists/:id/items
   */
  @Post(':id/items')
  @ApiOperation({ summary: 'Thêm item vào playlist' })
  @ApiParam({ name: 'id', description: 'ID của playlist' })
  async addItemToPlaylist(
    @Req() req: any,
    @Param('id') playlistId: string,
    @Body() dto: AddPlaylistItemDto,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.addItemToPlaylist(userId, playlistId, dto);
    } catch (error) {
      console.error('[PlaylistsController] POST items error:', error);
      throw new HttpException(
        error.message || 'Lỗi thêm item vào playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa item khỏi playlist
   * 
   * DELETE /playlists/:id/items/:itemId
   */
  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Xóa item khỏi playlist' })
  @ApiParam({ name: 'id', description: 'ID của playlist' })
  @ApiParam({ name: 'itemId', description: 'ID của item' })
  async removeItemFromPlaylist(
    @Req() req: any,
    @Param('id') playlistId: string,
    @Param('itemId') itemId: string,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.removeItemFromPlaylist(userId, playlistId, itemId);
    } catch (error) {
      console.error('[PlaylistsController] DELETE item error:', error);
      throw new HttpException(
        error.message || 'Lỗi xóa item khỏi playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sắp xếp lại items trong playlist
   * 
   * PUT /playlists/:id/reorder
   */
  @Put(':id/reorder')
  @ApiOperation({ summary: 'Sắp xếp lại items trong playlist' })
  @ApiParam({ name: 'id', description: 'ID của playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              position: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async reorderItems(
    @Req() req: any,
    @Param('id') playlistId: string,
    @Body() dto: ReorderItemsDto,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Không tìm thấy user', HttpStatus.UNAUTHORIZED);
      }

      return await this.playlistsService.reorderItems(userId, playlistId, dto);
    } catch (error) {
      console.error('[PlaylistsController] PUT reorder error:', error);
      throw new HttpException(
        error.message || 'Lỗi sắp xếp lại playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
