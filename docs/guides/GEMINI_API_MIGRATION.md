# Hướng dẫn chuyển từ OpenAI sang Gemini API

Tài liệu này hướng dẫn cách tối ưu chi phí bằng việc sử dụng **Gemini API (Free Tier)** thay cho OpenAI cho phần text generation.

> [!IMPORTANT]
> Chỉ chuyển phần **Chat/Text Generation**. Phần TTS và STT vẫn giữ nguyên OpenAI vì Gemini không có API tương đương tốt.

---

## Tổng quan thay đổi

| Tính năng | Trước (OpenAI) | Sau (Gemini) | Chi phí |
|-----------|---------------|--------------|---------|
| `generateText()` | GPT-4o-mini | Gemini 1.5 Flash | **FREE** |
| `generateConversation()` | GPT-4o-mini | Gemini 1.5 Flash | **FREE** |
| `textToSpeech()` | OpenAI TTS | OpenAI TTS | Giữ nguyên |
| `transcribeAudio()` | Whisper | Whisper | Giữ nguyên |

---

## Step 1: Lấy Google AI API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Click **"Get API Key"** ở góc trên bên phải
4. Click **"Create API Key"**
5. Copy API key (dạng `AIzaSy...`)

> [!TIP]
> Free tier cho phép **15 requests/phút** và **1 triệu tokens/ngày** - đủ cho hầu hết các use case.

---

## Step 2: Cài đặt Google AI SDK

Chạy lệnh sau trong thư mục `apps/api`:

```bash
cd apps/api
pnpm add @google/generative-ai
```

---

## Step 3: Thêm environment variable

Thêm vào file `.env`:

```bash
# Google AI (Gemini) - for text generation
GOOGLE_AI_API_KEY=AIzaSy...your-api-key...

# OpenAI - giữ nguyên cho TTS/STT
OPENAI_API_KEY=sk-...your-openai-key...
```

---

## Step 4: Cập nhật ai.service.ts

Mở file `apps/api/src/ai/ai.service.ts` và thực hiện các thay đổi sau:

### 4.1. Thêm import

```typescript
// Thêm ở đầu file, sau các import khác
import { GoogleGenerativeAI } from '@google/generative-ai';
```

### 4.2. Thêm Gemini client

Trong class `AiService`, thêm property và khởi tạo:

```typescript
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly gemini: GoogleGenerativeAI; // Thêm dòng này

  constructor(private readonly storageService: StorageService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Thêm khởi tạo Gemini
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
  }
```

### 4.3. Cập nhật method generateText()

Thay thế method `generateText()` bằng phiên bản dùng Gemini:

```typescript
/**
 * Sinh văn bản bằng Gemini (thay thế GPT)
 */
async generateText(prompt: string, systemPrompt?: string): Promise<string> {
  this.logger.log('Đang gọi Gemini để sinh văn bản...');

  try {
    const model = this.gemini.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt || 
        'Bạn là trợ lý học tiếng Anh, giúp tạo nội dung học tập chất lượng cao.',
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    this.logger.log('Đã sinh văn bản thành công');
    return text;
  } catch (error) {
    this.logger.error('Lỗi khi gọi Gemini:', error);
    throw error;
  }
}
```

---

## Step 5: Test thay đổi

### 5.1. Chạy server development

```bash
cd apps/api
pnpm dev
```

### 5.2. Test API endpoint

```bash
curl -X POST http://localhost:3001/api/ai/generate-conversation \
  -H "Content-Type: application/json" \
  -d '{"topic": "ordering coffee", "durationMinutes": 2}'
```

### 5.3. Kiểm tra logs

Logs nên hiển thị:
```
[AiService] Đang gọi Gemini để sinh văn bản...
[AiService] Đã sinh văn bản thành công
```

---

## Step 6: Deploy lên production

### 6.1. Thêm environment variable trên Railway/Render

| Variable | Value |
|----------|-------|
| `GOOGLE_AI_API_KEY` | `AIzaSy...your-key...` |

### 6.2. Redeploy

```bash
git add .
git commit -m "chore: migrate text generation to Gemini API"
git push
```

---

## Xử lý lỗi thường gặp

### Lỗi: "API key not valid"

**Nguyên nhân**: API key sai hoặc chưa được enable

**Giải pháp**: 
1. Kiểm tra lại API key trong Google AI Studio
2. Đảm bảo đã enable Generative Language API trong Google Cloud Console

### Lỗi: "Resource exhausted"

**Nguyên nhân**: Vượt quá rate limit (15 RPM)

**Giải pháp**:
1. Thêm retry logic với exponential backoff
2. Hoặc upgrade lên paid tier nếu cần nhiều requests hơn

### Lỗi: "Model not found"

**Nguyên nhân**: Tên model sai

**Giải pháp**: Sử dụng đúng tên model:
- `gemini-1.5-flash` (nhanh, rẻ)
- `gemini-1.5-pro` (thông minh hơn)

---

## Fallback về OpenAI (nếu cần)

Nếu gặp vấn đề với Gemini, bạn có thể thêm fallback:

```typescript
async generateText(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    // Thử Gemini trước
    return await this.generateTextWithGemini(prompt, systemPrompt);
  } catch (error) {
    this.logger.warn('Gemini failed, falling back to OpenAI:', error);
    // Fallback về OpenAI
    return await this.generateTextWithOpenAI(prompt, systemPrompt);
  }
}
```

---

## Chi phí ước tính sau khi migrate

| Tháng | Trước (OpenAI) | Sau (Gemini + OpenAI TTS/STT) |
|-------|----------------|-------------------------------|
| 100K tokens chat | ~$0.015 | **$0** |
| 1M tokens chat | ~$0.15 | **$0** |
| TTS + STT | ~$5-10 | ~$5-10 (giữ nguyên) |

**Tiết kiệm**: 100% chi phí text generation!

---

## Câu hỏi thường gặp

### Q: Chất lượng Gemini có tốt bằng GPT không?

**A**: Gemini 1.5 Flash có chất lượng tương đương GPT-4o-mini cho các task đơn giản như sinh hội thoại. Đủ tốt cho learning app.

### Q: Free tier có giới hạn gì?

**A**: 
- 15 requests/phút
- 1 triệu tokens/ngày
- Đủ cho ~100-200 users đồng thời

### Q: Có cần thay đổi frontend không?

**A**: Không. API response format giữ nguyên, frontend không cần thay đổi gì.

---

> Tạo bởi Antigravity - Cập nhật: Tháng 1/2026
