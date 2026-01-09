# Topic: IT Feature Development (20 Scenarios)
**Chủ đề**: Cuộc họp phát triển tính năng sản phẩm
**Target**: Developer, Tech Lead, Product Owner, QA.

---

## 💡 Cách Sử Dụng
Dưới đây là 20 kịch bản họp phần mềm phổ biến nhất.
Với mỗi kịch bản, hãy dùng Prompt sau với AI:
> "Let's roleplay Scenario #[Number]: [Scenario Name].
> You act as [Role A] and [Role B]. I act as [My Role].
> Discuss the critical details for 20 minutes. Challenge me with difficult questions."

---

## 📋 List 20 Kịch Bản Thực Chiến

### Group 1: Agile Ceremonies (Các cuộc họp Agile)
1.  **Daily Stand-up Update**: Báo cáo nhanh việc hôm qua, hôm nay và blocker. (Focus: Past/Present tenses).
2.  **Sprint Planning - Estimation**: Tranh luận về Story Points. Sếp ép làm nhanh, Dev đòi tăng point. (Focus: Negotiation).
3.  **Sprint Retrospective - Blameless Culture**: Thảo luận về một production incident. Tìm nguyên nhân gốc rễ (Root cause) mà không đổ lỗi.
4.  **Backlog Grooming/Refinement**: Làm rõ yêu cầu của User Story thiếu chi tiết. Hỏi PO các edge cases.
5.  **Demo Day Presentation**: Show tính năng mới cho Stakeholders. Giải thích cách nó hoạt động (Demo flow).

### Group 2: Technical Discussions (Họp kỹ thuật)
6.  **Database Schema Review**: Tranh luận về quan hệ bảng (1-1 hay 1-n), đặt Index ở đâu.
7.  **API Contract Negotiation**: Front-end chê API trả về thiếu field, Back-end bảo vệ quan điểm về performance.
8.  **Third-party Integration**: Bàn về việc tích hợp cổng thanh toán Stripe/PayPal. Xử lý webhook như thế nào.
9.  **Handling Technical Debt**: Thuyết phục PM cho thời gian để Refactor code cũ thay vì làm tính năng mới.
10. **Fixing a Critical Bug**: Họp khẩn cấp (War room) để fix lỗi nghiêm trọng đang ảnh hưởng user.

### Group 3: Specific Features (Tính năng cụ thể)
11. **Implementing Role-Based Access Control (RBAC)**: Bàn về phân quyền Admin, Editor, Viewer.
12. **Real-time Notification System**: Thiết kế tính năng thông báo (Websocket vs Polling).
13. **Search Functionality Optimization**: Cải thiện tốc độ tìm kiếm (Elasticsearch vs SQL Like).
14. **File Upload & Processing**: Xử lý upload ảnh, resize ảnh, lưu vào S3.
15. **Offline Mode Support**: Bàn giải pháp cho Mobile App khi mất mạng (Local database).
16. **Multi-language Support (i18n)**: Kế hoạch hỗ trợ đa ngôn ngữ cho hệ thống.

### Group 4: Performance & Security
17. **Performance Bottleneck Analysis**: API bị chậm. Team bàn cách Caching (Redis) hoặc Optimize query.
18. **Security Audit Response**: Fix các lỗ hổng bảo mật sau khi nhận report từ Pentester.
19. **Scalability Planning for Black Friday**: Chuẩn bị hệ thống cho lượng traffic tăng đột biến.
20. **Legacy Code Migration**: Kế hoạch chuyển đổi module cũ từ PHP sang Node.js (Ví dụ).

---

## 🎙️ Kịch Bản Mẫu Chi Tiết: Scenario #2 (Estimation)
*(Đã có ở phiên bản trước, bro dùng prompt trên để tạo 19 cái còn lại nhé)*
