import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { HistoryModule } from './history/history.module';
import { LessonsModule } from './lessons/lessons.module';
import { ListenLaterModule } from './listen-later/listen-later.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { RadioModule } from './radio/radio.module';
import { CustomScenariosModule } from './custom-scenarios/custom-scenarios.module';
import { FeedbackModule } from './feedback/feedback.module';
import { LoggingModule } from './common/logging/logging.module';
import { ConversationGeneratorModule } from './conversation-generator/conversation-generator.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { UserModule } from './user/user.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { ReadingModule } from './reading/reading.module';
import { SpeakingModule } from './speaking/speaking.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SyncModule } from './sync/sync.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';

@Module({
  imports: [
    // Load .env file để đọc OPENAI_API_KEY
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // [SECURITY - OWASP A04] Rate Limiting: Chống tấn công Brute Force, DOS
    // Default: 100 requests / 60 seconds (tăng từ 10 để dev dễ hơn)
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 60 giây
          limit: 100, // 100 requests mỗi 60 giây
        },
      ],
    }),

    AuthModule, // [FIX API-AUTH-01] Module xác thực Supabase
    LoggingModule,
    AiModule,
    HistoryModule, // Module quản lý lịch sử học tập
    LessonsModule, // Module tạo bài học mới
    ListenLaterModule, // Module tính năng Nghe Sau
    PlaylistsModule, // Module tính năng Playlists
    RadioModule, // Module tính năng Radio Mode
    CustomScenariosModule, // Module tính năng Custom Scenarios
    FeedbackModule, // Module tính năng Góp ý/Phản hồi
    ConversationGeneratorModule, // Module sinh hội thoại tiếng Anh với Groq API
    UserModule, // Module quản lý user: profile, gamification, settings
    DictionaryModule, // Module tra từ điển (Free Dictionary API)
    ReadingModule, // Module reading: generate articles, saved words
    SpeakingModule, // Module speaking: tongue twisters, stats, voice clone
    NotificationsModule, // Module push notifications
    SyncModule, // Module offline sync
    BookmarksModule, // Module bookmark câu trong bài nghe
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // [SECURITY - OWASP A04] Global ThrottlerGuard: Áp dụng rate limiting cho tất cả routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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
