# API TEST CASES (COMPREHENSIVE)
**Project:** StudyLanguage
**Base URL:** `/api` (NestJS) & Supabase URL
**Updated:** 12/01/2026

---

## 1. AI SERVICES (NESTJS BACKEND)
*Focus: Custom Logic, OpenAI Integration, Data Validation*

### 1.1 Conversation Generation (`/api/ai`)

| ID | Endpoint | Method | Test Scenario | Input Body (JSON) | Expected Status | Expected Output (JSON) | Prioriy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-AI-001** | `/generate-conversation` | POST | **Happy Path:** Generate basic conversation | `{ "topic": "Travel", "durationMinutes": 2 }` | 200 OK | `{ "script": [{ "speaker": "A", "text": "..." }, ...] }` | Critical |
| **API-AI-002** | `/generate-conversation` | POST | **Boundary:** Zero duration | `{ "topic": "Travel", "durationMinutes": 0 }` | 400 Bad Request | `{ "message": "Duration must be positive" }` | Medium |
| **API-AI-003** | `/generate-conversation` | POST | **Boundary:** Missing Topic | `{ "durationMinutes": 2 }` | 400 Bad Request | `{ "message": "Topic is required" }` | High |
| **API-AI-004** | `/generate-interactive-conversation` | POST | **Happy Path:** Generate with context | `{ "topic": "Job Interview", "contextDescription": "Software Engineer role" }` | 200 OK | `{ "scenario": "...", "script": [..., { "isUserTurn": true }] }` | High |
| **API-AI-005** | `/continue-conversation` | POST | **Happy Path:** AI replies to User | `{ "conversationHistory": [...], "userInput": "I have 5 years experience", "topic": "Job Interview" }` | 200 OK | `{ "response": "That is impressive...", "shouldEnd": false }` | High |

### 1.2 Audio Processing (STT & TTS)

| ID | Endpoint | Method | Test Scenario | Input Data | Expected Status | Expected Output | Prioriy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-AI-006** | `/transcribe` | POST | **Happy Path:** Valid Audio File | `FormData: { audio: <valid_mp3_file> }` | 200 OK | `{ "text": "Hello world..." }` | Critical |
| **API-AI-007** | `/transcribe` | POST | **Negative:** Invalid File Type | `FormData: { audio: <text_file.txt> }` | 400/415 | `{ "message": "Invalid file type" }` | Medium |
| **API-AI-008** | `/transcribe` | POST | **Negative:** No File | `FormData: {}` | 400 Bad Request | `{ "message": "File is required" }` | High |
| **API-AI-009** | `/text-to-speech` | POST | **Happy Path:** Short Text | `{ "text": "Hello", "voice": "alloy" }` | 200 OK | `{ "audio": "<base64_string>", "contentType": "audio/mpeg" }` | Critical |
| **API-AI-010** | `/text-to-speech` | POST | **Validation:** Empty Text | `{ "text": "" }` | 400 Bad Request | `{ "message": "Text cannot be empty" }` | High |

### 1.3 Evaluation & Scoring

| ID | Endpoint | Method | Test Scenario | Input Body | Expected Status | Expected Output | Prioriy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-AI-011** | `/evaluate-pronunciation` | POST | **Happy Path:** Perfect Match | `{ "originalText": "Hello", "userTranscript": "Hello" }` | 200 OK | `{ "overallScore": 100, "feedback": [] }` | High |
| **API-AI-012** | `/evaluate-pronunciation` | POST | **Happy Path:** Imperfect Match | `{ "originalText": "Hello world", "userTranscript": "Hello word" }` | 200 OK | `{ "overallScore": 90, "feedback": [{ "word": "word", "error": "mispronounced" }] }` | High |
| **API-AI-013** | `/evaluate-pronunciation` | POST | **Edge Case:** Empty User Input | `{ "originalText": "Hello", "userTranscript": "" }` | 200 OK | `{ "overallScore": 0, "feedback": "No input detected" }` | Medium |

---

## 2. SUPABASE INTEGRATION (CLIENT-SIDE API)
*Focus: Verify standard CRUD and Auth flows used in the app.*

| ID | Service | Function | Test Scenario | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **API-SUP-001** | **Auth** | `signInWithOAuth` | Login with valid Provider | Session established, User object returned. |
| **API-SUP-002** | **Auth** | `signOut` | Logout active session | Session cleared, `user` becomes null. |
| **API-SUP-003** | **Database** | `from('user_activities').insert({...})` | Insert valid activity record | Row created, ID returned. |
| **API-SUP-004** | **Database** | `from('user_activities').select('*')` | Query with permission | Returns array of user's rows. |
| **API-SUP-005** | **Storage** | `storage.from('recordings').upload(...)` | Upload file | File accessible via public URL or signed URL. |

---

## 3. SECURITY & PERFORMANCE CHECKS

| ID | Category | Test Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| **API-SEC-001** | **Rate Limiting** | Spam request `/generate-conversation` 50 times/sec | Return `429 Too Many Requests`. |
| **API-SEC-002** | **Payload Size** | Send JSON body > 1MB to `/generate-text` | Return `413 Payload Too Large` to prevent DOS. |
| **API-SEC-003** | **Injection** | Send payload `{ "topic": "DROP TABLE users;" }` | AI treats it as a topic string, DOES NOT execute SQL. |
| **API-PERF-001** | **Latency** | Request TTS for short sentence | Response time < 2000ms (2s). |
| **API-PERF-002** | **Concurrency** | 5 Concurrent Users request Transcription | All 5 requests succeed without server crashing. |
