import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { LoggingService } from './common/logging/logging.service';

async function bootstrap() {
  // Buffer logs during startup until logger is available (optional but good)
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use our custom logger (resolve() vì LoggingService có scope TRANSIENT)
  const logger = await app.resolve(LoggingService);
  app.useLogger(logger);

  // Bật CORS để frontend có thể gọi API
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8081'], // Web & Mobile
    credentials: true,
  });

  // Prefix /api cho tất cả routes
  app.setGlobalPrefix('api');

  // Cấu hình Swagger UI - giao diện thân thiện để test/debug API
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StudyLanguage API')
    .setDescription('API cho ứng dụng học ngôn ngữ với AI')
    .setVersion('1.0')
    .addBearerAuth() // Hỗ trợ JWT token cho các API cần xác thực
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true, // Lưu token khi refresh trang
      tagsSorter: 'alpha', // Sắp xếp tags theo thứ tự ABC
      operationsSorter: 'alpha', // Sắp xếp operations theo thứ tự ABC
    },
  });

  // Chạy trên port 3001 (Web chạy 3000)
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API đang chạy tại http://localhost:${port}/api`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}
void bootstrap();
