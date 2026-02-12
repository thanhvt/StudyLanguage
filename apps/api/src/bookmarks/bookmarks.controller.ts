/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

/**
 * BookmarksController - Controller quản lý sentence bookmarks
 *
 * Mục đích: Xử lý các request liên quan đến bookmark câu trong bài nghe
 * Tham số đầu vào: Request từ client với JWT token
 * Tham số đầu ra: JSON response với dữ liệu bookmarks
 * Khi nào sử dụng: Được gọi từ mobile khi user long press câu để bookmark
 */
@ApiTags('Bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
@UseGuards(SupabaseAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  /**
   * Tạo bookmark mới cho 1 câu
   *
   * Mục đích: Lưu bookmark khi user long press câu trong transcript
   * Tham số đầu vào: Body với sentenceIndex, speaker, sentenceText, etc.
   * Tham số đầu ra: Bookmark vừa tạo + flag alreadyExists
   * Khi nào sử dụng: POST /bookmarks → User long press câu
   */
  @Post()
  @ApiOperation({ summary: 'Tạo bookmark câu mới' })
  async createBookmark(
    @Req() req: any,
    @Body()
    body: {
      historyEntryId?: string;
      sentenceIndex: number;
      speaker: string;
      sentenceText: string;
      sentenceTranslation?: string;
      topic?: string;
    },
  ) {
    const userId = req.user.id;
    return this.bookmarksService.createBookmark(userId, body);
  }

  /**
   * Lấy danh sách bookmarks của user
   *
   * Mục đích: Hiển thị tất cả bookmarks cho user xem lại
   * Tham số đầu vào: Query params page, limit
   * Tham số đầu ra: Danh sách bookmarks + pagination
   * Khi nào sử dụng: GET /bookmarks → Bookmark list screen (tương lai)
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bookmarks' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getBookmarks(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    return this.bookmarksService.getBookmarks(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * Lấy bookmarks theo session cụ thể
   *
   * Mục đích: Load bookmark state khi user mở lại 1 session đã có
   * Tham số đầu vào: historyEntryId (path param)
   * Tham số đầu ra: Danh sách bookmarks của session đó
   * Khi nào sử dụng: GET /bookmarks/session/:id → PlayerScreen resume
   */
  @Get('session/:historyEntryId')
  @ApiOperation({ summary: 'Lấy bookmarks theo session' })
  async getBookmarksBySession(
    @Req() req: any,
    @Param('historyEntryId') historyEntryId: string,
  ) {
    const userId = req.user.id;
    return this.bookmarksService.getBookmarksBySession(userId, historyEntryId);
  }

  /**
   * Xóa bookmark theo ID
   *
   * Mục đích: User bỏ bookmark 1 câu
   * Tham số đầu vào: bookmarkId (path param)
   * Tham số đầu ra: Kết quả xóa
   * Khi nào sử dụng: DELETE /bookmarks/:id → User long press lại câu đã bookmark
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bookmark' })
  async deleteBookmark(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.bookmarksService.deleteBookmark(userId, id);
  }

  /**
   * Xóa bookmark theo sentence index trong session
   *
   * Mục đích: Toggle bookmark off — mobile gửi index thay vì ID
   * Tham số đầu vào: Body với historyEntryId (nullable), sentenceIndex
   * Tham số đầu ra: Kết quả xóa
   * Khi nào sử dụng: POST /bookmarks/remove-by-index → Toggle off trên PlayerScreen
   */
  @Post('remove-by-index')
  @ApiOperation({ summary: 'Xóa bookmark theo sentence index' })
  async deleteBookmarkByIndex(
    @Req() req: any,
    @Body() body: { historyEntryId?: string; sentenceIndex: number },
  ) {
    const userId = req.user.id;
    return this.bookmarksService.deleteBookmarkByIndex(
      userId,
      body.historyEntryId || null,
      body.sentenceIndex,
    );
  }
}
