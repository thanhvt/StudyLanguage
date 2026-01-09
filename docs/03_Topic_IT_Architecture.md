# Topic: IT Architecture & System Design (20 Scenarios)
**Chủ đề**: Kiến trúc hệ thống, DevOps, Cloud
**Target**: Senior Dev, Architect, CTO, DevOps Engineer.

---

## 💡 Cách Sử Dụng
Prompt chung cho các bài tập này:
> "Act as a CTO. I am a System Architect. We are in a design review meeting.
> Topic: Scenario #[Number] - [Scenario Name].
> Debating specific trade-offs (Cost vs Performance, Speed vs Stability).
> Please ask tough technical questions."

---

## 📋 List 20 Kịch Bản Thiết Kế Hệ Thống

### Group 1: Architecture Patterns (Mô hình kiến trúc)
1.  **Monolith vs Microservices**: Tranh luận gay gắt việc có nên đập hệ thống ra Microservices không. (Classic debate).
2.  **Event-Driven Architecture**: Thiết kế hệ thống xử lý bất đồng bộ dùng Kafka/RabbitMQ.
3.  **Serverless vs Containers**: Chọn AWS Lambda hay Kubernetes (K8s) cho dự án mới.
4.  **GraphQL vs REST API**: Team Mobile đòi dùng GraphQL, Team Backend muốn giữ REST.
5.  **Multi-tenant Architecture**: Thiết kế Database cho SaaS (Chung DB hay tách DB cho mỗi khách hàng).

### Group 2: Database & Data (Dữ liệu)
6.  **SQL vs NoSQL (Postgres vs MongoDB)**: *(Kịch bản mẫu đã có)*.
7.  **Caching Strategy**: Chọn chiến lược cache (Write-through vs Write-back) dùng Redis/Memcached.
8.  **Data Warehousing**: Thiết kế luồng Data Pipeline từ App sang Data Warehouse (Snowflake/BigQuery).
9.  **Database Sharding**: Giải quyết bài toán Database quá lớn (10TB+), chia shard như thế nào.
10. **Disaster Recovery (DR) Plan**: Kế hoạch khôi phục khi Data Center bị cháy/sập.

### Group 3: Cloud & DevOps (Hạ tầng)
11. **CI/CD Pipeline Design**: Thiết kế luồng Deploy tự động. Bàn về Blue-Green Deployment vs Canary Release.
12. **Container Orchestration**: Thảo luận về khó khăn khi vận hành Kubernetes.
13. **Cloud Cost Optimization**: Sếp chửi vì bill AWS tháng này cao quá. Tìm cách giảm chi phí.
14. **Infrastructure as Code (IaC)**: Chuyển đổi manual setup sang Terraform/Ansible.
15. **Monitoring & Observability**: Chọn ELK Stack hay Prometheus/Grafana để theo dõi hệ thống.

### Group 4: Advanced Topics (Nâng cao)
16. **Authentication System (OAuth2/OIDC)**: Tự build hệ thống login hay dùng Auth0/Cognito/Keycloak.
17. **Real-time Chat Architecture**: Thiết kế backend cho ứng dụng chat hàng triệu user (như Zalo/Telegram).
18. **Video Streaming Architecture**: Thiết kế hệ thống stream video như Netflix/YouTube (CDN, Transcoding).
19. **Rate Limiting & Anti-DDoS**: Thiết kế Gateway để chặn spam request.
20. **AI/ML Integration**: Tích hợp module AI vào hệ thống hiện tại (Latency concerns).

---

## 🎙️ Sample Vocabulary for Architects
- **Single Point of Failure (SPOF)**: Điểm chết duy nhất (nếu chết là sập cả hệ thống).
- **Scalability (Vertical/Horizontal)**: Khả năng mở rộng.
- **High Availability (HA)**: Tính sẵn sàng cao.
- **Latency vs Throughput**: Độ trễ và Lưu lượng xử lý.
- **Trade-off**: Sự đánh đổi (Được cái này mất cái kia).
