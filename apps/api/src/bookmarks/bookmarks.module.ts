import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

/**
 * BookmarksModule - Module cho tính năng Sentence Bookmarks
 *
 * Mục đích: Đăng ký controller + service cho bookmark câu trong bài nghe
 * Khi nào sử dụng: Import vào AppModule
 */
@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
