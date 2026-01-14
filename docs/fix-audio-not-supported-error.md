# Fix Lỗi Audio "The element has no supported sources"

## Mô tả lỗi
Khi sử dụng tính năng "Sinh Audio" cho hội thoại, sau khi quá trình sinh hoàn tất, nhấn play thì gặp lỗi:
`Runtime NotSupportedError: The element has no supported sources.`

## Nguyên nhân
Audio hội thoại được ghép từ nhiều audio segment nhỏ (mỗi file tương ứng với một câu thoại). Trước đây, code sử dụng phương pháp nối buffer đơn giản (`Buffer.concat`) để ghép các file MP3 này lại. 

Tuy nhiên, MP3 là định dạng nén có cấu trúc (header + frames). Việc nối trực tiếp các bytes của nhiều file MP3 lại với nhau sẽ tạo ra một file hỏng (corrupted), chứa nhiều header lặp lại mà trình duyệt không thể decode được.

## Giải pháp
Chuyển sang sử dụng thư viện **FFmpeg** để xử lý việc merge file audio. FFmpeg sẽ decode các segments và encode lại thành một file MP3 hợp lệ duy nhất.

## Các thay đổi đã thực hiện

1.  **Cài đặt dependencies mới cho Backend (`apps/api`):**
    -   `fluent-ffmpeg`: Wrapper cho FFmpeg trên Node.js.
    -   `@ffmpeg-installer/ffmpeg`: Cung cấp binary FFmpeg static, không cần cài đặt FFmpeg thủ công trên hệ điều hành.
    -   `@types/fluent-ffmpeg`: Type definitions cho TypeScript.

2.  **Cập nhật `AiService` (`apps/api/src/ai/ai.service.ts`):**
    -   Thêm phương thức `mergeAudios` sử dụng `fluent-ffmpeg` để merge các buffer audio thông qua file tạm.
    -   Cập nhật logic trong `generateConversationAudio` và `generateConversationAudioWithProgress` để sử dụng `mergeAudios` thay vì `Buffer.concat`.
    -   Thêm cơ chế dọn dẹp file tạm sau khi xử lý xong.

## Hướng dẫn kiểm tra (Verify)
Do có cài đặt thêm package mới và sửa đổi backend, cần thực hiện các bước sau:

1.  **Restart Backend:** Tắt và chạy lại `pnpm dev:api` (hoặc restart process đang chạy).
2.  **Test lại:** Vào lại trang Listening, chọn một đoạn hội thoại và nhấn "Sinh Audio".
3.  **Kết quả:** Audio sau khi sinh sẽ được phát bình thường, không còn lỗi.
