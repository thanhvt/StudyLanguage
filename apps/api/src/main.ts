import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS để frontend có thể gọi API
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8081'], // Web & Mobile
    credentials: true,
  });

  // Prefix /api cho tất cả routes
  app.setGlobalPrefix('api');

  // Chạy trên port 3001 (Web chạy 3000)
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API đang chạy tại http://localhost:${port}/api`);
}
void bootstrap();

