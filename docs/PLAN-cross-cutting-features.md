# PLAN: Cross-Cutting Features (Speaking Module)

> **Task**: Refactor & implement 6 cross-cutting features cho Speaking module
> **Doc**: [06_CrossCuttingFeatures.md](./mobile/features/speaking/06_CrossCuttingFeatures.md)
> **Screens**: `docs/mobile/features/speaking/screens_v2/` (03, 04, 27, 28, 29)
> **Created**: 2026-03-10

---

## 🎯 Scope

| Feature | Code hiện tại | Mức độ refactor | Priority |
|---|---|---|---|
| C2. TTS Settings | `SpeakingTtsSheet.tsx` (390L) | **Medium** — thêm emotion/pitch/random | P0-P1 |
| C3. Gamification Dashboard | `ProgressDashboardScreen.tsx` (181L) | **Medium** — thêm weekly report, edit dialog | P0-P1 |
| C4. Recording History | `RecordingHistoryScreen.tsx` (234L) | **Large** — refactor FlatList→SectionList, play, compare | P0-P1 |
| C5. AI Voice Clone | `VoiceCloneReplay.tsx` (268L) | **Medium** — thêm A/B compare, IPA word diff | P0-P1 |
| C6. Share Result | `ShareResultCard.tsx` (181L) | **Large** — redesign card, image capture, QR, social | P1-P2 |
| C7. Onboarding | `OnboardingOverlay.tsx` (209L) | **Small** — update content, keep card style (P2) | P2 |

---

## 📋 Task Breakdown

### Phase 1: Store & Types (Foundation)
- [ ] Mở rộng `TtsSettings` interface (emotion, pitch, randomVoice, autoEmotion)
- [ ] Thêm actions & defaults tương ứng trong `useSpeakingStore`

### Phase 2: Component Implementation
- [ ] **C2** `SpeakingTtsSheet` — Emotion pills, Pitch slider, Random toggle
- [ ] **C3** `ProgressDashboardScreen` — Radar 4 axes, Weekly Report, Edit Goal dialog, Weak Sounds navigate
- [ ] **C4** `RecordingHistoryScreen` — SectionList grouped by date, Play audio, Filter bottom tabs, Compare FAB
- [ ] **C5** `VoiceCloneReplay` — A/B compare card, Auto-loop, Word IPA diff, Score badge
- [ ] **C6** `ShareResultCard` → Refactor thành **ShareResultScreen** — Gradient card, Score ring, QR, Social grid, Capture
- [ ] **C7** `OnboardingOverlay` — Update steps content

### Phase 3: API & Service
- [ ] Thêm mock endpoints (dashboard, daily-goal, badges, history, compare)
- [ ] Install dependencies nếu cần (qrcode-svg, view-shot, share)

### Phase 4: Testing
- [ ] Update TTS tests (emotion, pitch)
- [ ] New test file `crossCuttingFeatures.test.ts`
- [ ] Chạy full test suite

---

## 🤖 Agent Assignments

| Agent | Responsibility |
|---|---|
| `mobile-developer` | Primary — React Native components, navigation, store |
| `frontend-specialist` | UI/UX review — mockup compliance, design patterns |
| `test-engineer` | Unit tests — Jest, data integrity, logic |

---

## ✅ Verification Checklist

- [ ] TTS: mở sheet → thấy emotion + pitch + random
- [ ] Dashboard: radar 4 axes, weekly report, tap weak sound → navigate
- [ ] History: grouped by date, play audio, filter, compare mode
- [ ] Voice Clone: 3 cards (gốc/AI/A-B), word IPA diff
- [ ] Share: gradient card, score ring, QR, social icons
- [ ] Onboarding: 5 steps, skip, persist flag
- [ ] Jest tests: all pass
