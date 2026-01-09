# Topic: IT Architecture & System Design Meeting
**Chủ đề**: Họp thiết kế kiến trúc hệ thống
**Độ khó**: Advanced (Technical Jargon heavy)

---

## 1. Prompt Luyện Tập
> "Act as a CTO (Chief Technology Officer). I am the System Architect. We are debating whether to use a **Relational Database (PostgreSQL)** or a **NoSQL Database (MongoDB)** for the new logging system.
> **Constraint**: We expect high write throughput but complex analytical queries later.
> **Goal**: We need to reach a decision by the end of the discussion.
> **Tone**: Professional, technical, constructive debate."

---

## 2. Kịch Bản Mẫu: "Choosing the Database for Audit Logs"

### 📌 Context
Team đang xây dựng hệ thống "Audit Log" để lưu lại mọi hành động của User. Dự kiến dữ liệu rất lớn (High Volume).

### 👥 Characters
- **Mark (CTO)**: Quan tâm chi phí, tốc độ develop, sự ổn định lâu dài.
- **Thanh (You - Architect)**: Đề xuất giải pháp tối ưu về hiệu năng và mở rộng (Scaling).

### 📜 Dialogue (Excerpt)

**Mark**: Okay Thanh, let's settle the database choice for the Audit Log service. I see you proposed **MongoDB** (NoSQL). Why not just stick to **PostgreSQL**? Our team is already familiar with it.

**Thanh**: I understand the familiarity factor. However, for Audit Logs, we are dealing with a **write-heavy workload**. We might hit 10,000 requests per second during peak hours. MongoDB's **sharding** capabilities allow us to scale writes horizontally much easier than Postgres.

**Mark**: True, but what about **data consistency**? And later on, the Data Team wants to run complex SQL queries to analyze user behavior. JSON queries in Mongo can be a pain.

**Thanh**: That's a valid point. But remember, audit logs are mostly **unstructured data**. The payload varies for every event. If we use Postgres, we’d end up using a `JSONB` column anyway, which defeats the purpose of strong relational schemas.

**Mark**: Good point regarding the schema-less nature. But I'm worried about **operational complexity**. Who is going to manage the Mongo cluster? We don't have a dedicated DBA for Mongo.

**Thanh**: We could use a managed service like **MongoDB Atlas** or AWS DocumentDB. It offloads the maintenance burden. It might cost a bit more, but it saves engineering time.

**Mark**: Hmm. What if we use **TimescaleDB**? It’s based on Postgres but optimized for time-series data.

**Thanh**: I considered that. It's great for metrics (CPU, RAM usage), but for *event logs* with variable structures, I still think a Document Store is better. Plus, if we need to purge old data, Mongo's TTL (Time-To-Live) indexes are very convenient.

**Mark**: Okay, you convinced me on the **write throughput** and **flexibility**. But let's agree on this: We will stream the logs to a Data Warehouse (like Snowflake) for the complex analytics. Mongo is just for ingestion and simple retrieval.

**Thanh**: Absolutely. That follows the **CQRS pattern** (Command Query Responsibility Segregation). Mongo for writing, Data Warehouse for reading complex reports.

**Mark**: Approved. Let's write up the **ADR (Architecture Decision Record)** and share it with the team. Good job on the research.

---

## 3. Vocabulary & Concepts
- **Write-heavy workload**: Tác vụ ghi dữ liệu nhiều (khác với Read-heavy).
- **Horizontal Scaling (Scaling Out)**: Mở rộng bằng cách thêm nhiều server (dễ hơn với NoSQL).
- **Vertical Scaling (Scaling Up)**: Mở rộng bằng cách nâng cấp CPU/RAM cho 1 server (đắt đỏ).
- **Schema-less**: Không cần định nghĩa cấu trúc bảng trước.
- **Operational Complexity**: Độ phức tạp khi vận hành/bảo trì.
- **ADR (Architecture Decision Record)**: Tài liệu ghi lại vì sao chọn công nghệ này mà không chọn cái kia.
- **Bottleneck**: Điểm nghẽn cổ chai (làm chậm cả hệ thống).
