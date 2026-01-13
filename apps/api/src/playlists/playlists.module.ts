import { Module } from '@nestjs/common';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';

/**
 * PlaylistsModule - Module quản lý tính năng Playlists
 * 
 * Mục đích: Bundle controller và service cho Playlists
 * Khi nào sử dụng: Import vào AppModule
 */
@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
