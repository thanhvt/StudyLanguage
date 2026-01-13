import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { HistoryModule } from './history/history.module';
import { LessonsModule } from './lessons/lessons.module';
import { ListenLaterModule } from './listen-later/listen-later.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { LoggingModule } from './common/logging/logging.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    // Load .env file để đọc OPENAI_API_KEY
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule, // [FIX API-AUTH-01] Module xác thực Supabase
    LoggingModule,
    AiModule,
    HistoryModule, // Module quản lý lịch sử học tập
    LessonsModule, // Module tạo bài học mới
    ListenLaterModule, // Module tính năng Nghe Sau
    PlaylistsModule, // Module tính năng Playlists
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
