# 🗣️ Speaking - Test Scenarios

> **Module:** Speaking
> **Phase:** MVP → Enhanced → Advanced
> **Ref:** `docs/mobile/features/03_Speaking.md`

---

## MVP Phase

### 1. Topic Selection

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-MVP-HP-001 | ✅ | Mở Speaking screen | 1. Tap 🗣️ Luyện nói từ Dashboard | Topic selection screen hiển thị danh sách topics | 🔴 |
| MOB-SPK-MVP-HP-002 | ✅ | Chọn topic & bắt đầu | 1. Chọn topic "Tech"<br>2. Tap "Start Practice" | Load sentences, hiện practice screen với câu đầu tiên | 🔴 |
| MOB-SPK-MVP-ERR-001 | ❌ | API load topics lỗi | 1. Server timeout khi load topics | Hiện error + Retry, không blank screen | 🔴 |

### 2. Practice Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-MVP-HP-003 | ✅ | Hiển thị câu target | 1. Vào practice session | Câu tiếng Anh hiển thị rõ, font size đủ lớn | 🔴 |
| MOB-SPK-MVP-HP-004 | ✅ | IPA toggle | 1. Tap toggle "Show IPA" | Hiện/ẩn phiên âm IPA bên dưới mỗi từ | 🟡 |
| MOB-SPK-MVP-HP-005 | ✅ | Word stress display | 1. Bật "Show Stress" | Highlight stressed syllables trong câu | 🟡 |
| MOB-SPK-MVP-HP-006 | ✅ | Nghe AI đọc mẫu | 1. Tap 🔊 bên cạnh câu target | AI TTS phát âm câu mẫu | 🟡 |

### 3. Recording (Hold-to-Record)

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-MVP-HP-007 | ✅ | Giữ nút mic để ghi âm | 1. Long press nút 🎤 | Haptic medium → waveform animation → đang ghi | 🔴 |
| MOB-SPK-MVP-HP-008 | ✅ | Thả tay để dừng ghi | 1. Release nút 🎤 | Haptic light → ghi âm dừng → gửi lên server | 🔴 |
| MOB-SPK-MVP-HP-009 | ✅ | Max duration 15s | 1. Giữ nút mic > 15 giây | Tự động dừng recording ở 15s | 🟡 |
| MOB-SPK-MVP-HP-010 | ✅ | Microphone permission lần đầu | 1. Tap mic lần đầu | OS popup xin quyền microphone. Allow → sẵn sàng ghi | 🔴 |
| MOB-SPK-MVP-ERR-001 | ❌ | Microphone permission denied | 1. Deny quyền mic<br>2. Tap nút mic | Hiện hướng dẫn bật quyền trong Settings, không crash | 🔴 |
| MOB-SPK-MVP-ERR-002 | ❌ | Upload audio thất bại | 1. Ghi âm xong<br>2. Mất mạng khi upload | Hiện error "Không thể gửi, thử lại?" + Retry button | 🔴 |
| MOB-SPK-MVP-EC-001 | ⚠️ | Ghi âm trong môi trường ồn | 1. Ghi âm khi có tiếng ồn xung quanh | AI vẫn xử lý được, feedback có thể mention noise | 🟡 |
| MOB-SPK-MVP-EC-002 | ⚠️ | Ghi âm rất ngắn (<1s) | 1. Tap nhanh nút mic (< 1 giây) | Hiện message "Hãy giữ lâu hơn để ghi âm" hoặc không gửi | 🟡 |

### 4. AI Feedback

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-MVP-HP-011 | ✅ | Hiển thị overall score | 1. Ghi âm → chờ AI xử lý | Score 0-100 hiển thị với grade (A/B/C/D), loading → result | 🔴 |
| MOB-SPK-MVP-HP-012 | ✅ | Word-by-word score | 1. Xem feedback section | Mỗi từ có score + color coding (green ≥85, yellow ≥70, red <70) | 🟡 |
| MOB-SPK-MVP-HP-013 | ✅ | AI tips | 1. Xem tips section | Suggestion text từ AI hiển thị rõ ràng | 🟡 |
| MOB-SPK-MVP-HP-014 | ✅ | Next sentence | 1. Swipe right sau khi xem feedback | Chuyển sang câu tiếp theo | 🔴 |
| MOB-SPK-MVP-HP-015 | ✅ | Retry cùng câu | 1. Swipe left / Tap "Retry" | Quay lại practice mode cho cùng câu, score cũ lưu | 🟡 |
| MOB-SPK-MVP-ERR-003 | ❌ | AI analysis timeout | 1. Ghi âm → server timeout | Hiện error "AI đang bận, thử lại?" + Retry | 🔴 |
| MOB-SPK-MVP-EC-003 | ⚠️ | Score = 100 (perfect) | 1. Phát âm perfect | Confetti/celebration animation + haptic heavy impact | 🟢 |
| MOB-SPK-MVP-EC-004 | ⚠️ | Score = 0 (hoàn toàn sai) | 1. Nói tiếng Việt hoặc im lặng | Score hiển thị thấp, tips khuyến khích "Thử nói chậm lại" | 🟡 |

### 5. Onboarding Overlay

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-MVP-HP-016 | ✅ | User mới lần đầu vào Speaking | 1. Mở Speaking lần đầu | Onboarding overlay chỉ dẫn cách dùng mic, swipe | 🟢 |
| MOB-SPK-MVP-HP-017 | ✅ | Dismiss onboarding | 1. Tap "Got it" hoặc bên ngoài | Overlay biến mất, không hiện lại lần sau | 🟢 |

---

## Enhanced Phase

### 6. Recording UX Enhanced

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ENH-HP-001 | ✅ | Countdown 3→2→1→GO! | 1. Tap nút mic | Animated countdown 3→2→1→GO! → auto-start recording | 🟡 |
| MOB-SPK-ENH-HP-002 | ✅ | Swipe-to-cancel recording | 1. Đang ghi âm<br>2. Swipe up | Recording hủy, haptic warning, quay về trạng thái sẵn sàng | 🟡 |
| MOB-SPK-ENH-HP-003 | ✅ | Preview before submit | 1. Thả tay (dừng ghi)<br>2. Nghe lại bản ghi<br>3. Tap "Submit" hoặc "Re-record" | Nghe lại audio vừa ghi → quyết định gửi hoặc ghi lại | 🟡 |
| MOB-SPK-ENH-EC-001 | ⚠️ | Cancel countdown giữa chừng | 1. Countdown đang chạy<br>2. Tap "Cancel" | Countdown dừng, quay về idle state | 🟢 |

### 7. Conversation Coach

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ENH-HP-004 | ✅ | Setup Coach session | 1. Chọn mode "Coach"<br>2. Chọn topic + duration (5 min)<br>3. Tap "Start" | Session bắt đầu, AI nói câu đầu tiên, timer đếm ngược | 🔴 |
| MOB-SPK-ENH-HP-005 | ✅ | Voice input → AI response | 1. Tap mic → nói → release<br>2. Chờ AI transcribe & respond | User text hiển thị → AI thinking → AI response (text + audio) | 🔴 |
| MOB-SPK-ENH-HP-006 | ✅ | Text input toggle | 1. Toggle sang "Text" mode<br>2. Gõ text → Send | Text gửi đi, AI respond bình thường | 🟡 |
| MOB-SPK-ENH-HP-007 | ✅ | Pronunciation alert inline | 1. Nói sai từ "usually"<br>2. AI phản hồi | Inline alert hiện: ⚠️ "usually" → /ˈjuːʒuəli/ + tip | 🟡 |
| MOB-SPK-ENH-HP-008 | ✅ | Session timer auto-end | 1. Timer chạy hết | Session kết thúc tự động, hiện summary screen | 🟡 |
| MOB-SPK-ENH-HP-009 | ✅ | Suggested responses | 1. Không biết trả lời gì | 3 suggested responses hiện bên dưới, tap để dùng | 🟡 |
| MOB-SPK-ENH-HP-010 | ✅ | Session transcript | 1. Session kết thúc | Full transcript hiển thị: User vs AI, pronunciation notes | 🟡 |
| MOB-SPK-ENH-ERR-001 | ❌ | STT transcribe thất bại | 1. Nói → server không transcribe được | Hiện "Không nghe rõ, thử lại?" + Re-record option | 🟡 |
| MOB-SPK-ENH-EC-002 | ⚠️ | Exit Coach session giữa chừng | 1. Tap Back khi đang session | Confirm dialog "Kết thúc sớm? Progress sẽ được lưu" | 🟡 |

### 8. Shadowing Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ENH-HP-011 | ✅ | Shadowing basic | 1. Chọn mode "Shadowing"<br>2. AI phát mẫu<br>3. User nói theo | Waveform so sánh: AI vs User, similarity score | 🟡 |
| MOB-SPK-ENH-HP-012 | ✅ | Delay control | 1. Set delay = 2s | Sau khi AI nói xong, đợi 2s mới tự động ghi âm user | 🟡 |
| MOB-SPK-ENH-HP-013 | ✅ | Speed control cho shadowing | 1. Set speed = 0.8x | AI mẫu phát chậm hơn 20% | 🟡 |

### 9. Custom Speaking Scenarios

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ENH-HP-014 | ✅ | Tạo custom scenario | 1. Tap "Create"<br>2. Nhập name + description<br>3. Save | Scenario mới thêm vào list | 🟡 |
| MOB-SPK-ENH-HP-015 | ✅ | Favorite custom scenario | 1. Tap ⭐ | Scenario đánh dấu favorite | 🟢 |
| MOB-SPK-ENH-HP-016 | ✅ | Delete custom scenario | 1. Swipe left → Delete | Scenario xóa + undo toast | 🟡 |

### 10. Phoneme Heatmap

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ENH-HP-017 | ✅ | Hiển thị phoneme heatmap | 1. Xem feedback<br>2. Scroll đến heatmap | Các âm hiển thị: 🟢 (giỏi), 🟡 (OK), 🔴 (yếu) | 🟡 |
| MOB-SPK-ENH-HP-018 | ✅ | Tap weak sound → Practice | 1. Tap âm 🔴 /θ/ | Navigate đến practice cho âm đó | 🟡 |

---

## Advanced Phase

### 11. Roleplay

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ADV-HP-001 | ✅ | Chọn roleplay scenario | 1. Chọn mode "Roleplay"<br>2. Chọn "Restaurant" scenario | Setup screen: Character assignment, context display | 🟡 |
| MOB-SPK-ADV-HP-002 | ✅ | Multi-turn roleplay | 1. Bắt đầu session<br>2. AI nói turn 1<br>3. User respond | Turn-by-turn interaction, score mỗi turn | 🟡 |
| MOB-SPK-ADV-HP-003 | ✅ | Roleplay overall feedback | 1. Hoàn thành tất cả turns | Summary: total turns, overall score, improvement tips | 🟡 |

### 12. Tongue Twister

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ADV-HP-004 | ✅ | Chọn phoneme category | 1. Chọn /θ/ vs /ð/ | Load tongue twisters cho category đó | 🟡 |
| MOB-SPK-ADV-HP-005 | ✅ | Speed challenge | 1. Ghi âm tongue twister<br>2. Xem speed + accuracy | Score bao gồm speed + accuracy | 🟢 |
| MOB-SPK-ADV-HP-006 | ✅ | Leaderboard | 1. Xem leaderboard tab | Ranking users theo score, highlight vị trí user | 🟢 |

### 13. Gamification

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ADV-HP-007 | ✅ | Daily goal progress | 1. Hoàn thành 3/10 câu | Progress bar cập nhật: 3/10, 30% | 🟡 |
| MOB-SPK-ADV-HP-008 | ✅ | Badge unlock | 1. Đạt 100 câu speaking | Badge "🎤 Speaker" unlock + haptic + animation | 🟢 |
| MOB-SPK-ADV-HP-009 | ✅ | Weekly report | 1. Vào Progress Dashboard | Radar chart, calendar heatmap, weak sounds, trend | 🟡 |
| MOB-SPK-ADV-HP-010 | ✅ | Confetti khi score ≥90 | 1. Đạt score 92 | Confetti animation bung ra + success haptic | 🟢 |

### 14. Save & Share

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ADV-HP-011 | ✅ | Share result card | 1. Tap 📤 Share<br>2. Chọn platform (IG/FB) | Image card đẹp export, OS share sheet mở | 🟡 |
| MOB-SPK-ADV-HP-012 | ✅ | Recording history timeline | 1. Vào recordings history | So sánh recording cũ vs mới cùng câu | 🟡 |

### 15. AI Voice Clone

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SPK-ADV-HP-013 | ✅ | Nghe AI corrected version | 1. Tap "🤖 AI Clone" trong feedback | Nghe version AI sửa phát âm của user | 🟡 |
| MOB-SPK-ADV-HP-014 | ✅ | Before/After comparison | 1. Tap "Compare" | Phát lần lượt: bản gốc user → bản AI sửa | 🟡 |
