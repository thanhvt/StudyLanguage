import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

import { LoggingService } from './common/logging/logging.service';

async function bootstrap() {
  // Buffer logs during startup until logger is available (optional but good)
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use our custom logger (resolve() vì LoggingService có scope TRANSIENT)
  const logger = await app.resolve(LoggingService);
  app.useLogger(logger);

  // [SECURITY - OWASP A03] Helmet: Bảo vệ HTTP headers khỏi các lỗ hổng phổ biến
  app.use(helmet());

  // [SECURITY - OWASP A01/A03] Global Validation Pipe: Validate và sanitize tất cả input
  // whitelist: Tự động loại bỏ các property không có trong DTO (chống Mass Assignment)
  // forbidNonWhitelisted: Nếu có property lạ, ném lỗi BadRequest
  // transform: Tự động chuyển đổi kiểu dữ liệu
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Bật CORS để frontend có thể gọi API
  // Đọc từ biến môi trường CORS_ORIGINS, fallback về localhost cho development
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8081',
      ];

  app.enableCors({
    origin: corsOrigins, // Web & Mobile
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
  logger.log(`🚀 API đang chạy tại http://localhost:${port}/api`);
  logger.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}
void bootstrap();
