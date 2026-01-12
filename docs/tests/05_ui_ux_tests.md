# UI/UX & DETAILED VISUAL TEST CASES
**Project:** StudyLanguage
**Focus:** Visual Design, Interaction, Mobile Experience
**Updated:** 12/01/2026

---

## 1. DESIGN SYSTEM & VISUAL VERIFICATION
*Mục đích: Đảm bảo giao diện tuân thủ chính xác thiết kế "Visual Delight".*

### 1.1 Color Palette & Themes
| ID | Element | Detailed Check | Expected Result |
| :--- | :--- | :--- | :--- |
| **UI-VIS-001** | **Theme Switching** | Toggle Light/Dark mode | Check màu nền, màu chữ. Dark Mode background phải là `#000000` hoặc gray cực đậm, không phải xám nhạt. |
| **UI-VIS-002** | **Accent Colors** | Chọn bộ "Fresh Greens" (#4caf50) | Các thành phần: Primary Button, Active Tab, Highlight Text chuyển sang mã màu `#4caf50` chính xác. |
| **UI-VIS-003** | **Contrast Ratio** | Check text reading với tool (Lighthouse/WCAG) | Tỷ lệ tương phản đạt chuẩn AA (ít nhất 4.5:1) để dễ đọc. |

### 1.2 Typography & Glassmorphism
| ID | Element | Detailed Check | Expected Result |
| :--- | :--- | :--- | :--- |
| **UI-VIS-004** | **Font Family** | Inspect Element trên Body | Font phải là `Inter` hoặc `Outfit` (nếu đã config), không fallback về `sans-serif` mặc định. |
| **UI-VIS-005** | **Glass Effect** | Kiểm tra thẻ Bài học (Learning Card) | Phải có CSS: `backdrop-filter: blur(...)`, `background: rgba(..., 0.X)` tạo hiệu ứng kính mờ. |
| **UI-VIS-006** | **Spacing** | Kiểm tra margin/padding các đoạn văn | Không dính chùm. Line-height tối thiểu 1.5. |

---

## 2. INTERACTION & ANIMATIONS (MICRO-INTERACTIONS)
*Mục đích: Đảm bảo cảm giác "Smooth Motion" và phản hồi xúc giác.*

### 2.1 Buttons & Actives
| ID | Element | Action | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **UI-INT-001** | **Primary Button** | Hover chuột (Web) | Button sáng lên hoặc nổi lên (`transform: translateY(-2px)`). |
| **UI-INT-002** | **Primary Button** | Click/Tap (Active) | Button lún xuống hoặc có hiệu ứng Ripple lan tỏa. |
| **UI-INT-003** | **Navigation Link** | Hover vào menu item | Màu chữ thay đổi hoặc có underline animation chạy ra. |

### 2.2 Loading & States
| ID | Component | Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **UI-INT-004** | **AI Generating** | Khi chờ AI sinh bài mới (2-5s) | Hiển thị Skeleton Loading (khung xám nhấp nháy) hoặc Animation "AI đang nghĩ" (dots jumping). Không để màn hình trắng trơn. |
| **UI-INT-005** | **Speaking Analysis** | Khi đang gửi file ghi âm lên server | Nút Record chuyển trạng thái xoay vòng (Spinner) hoặc Disable. |

### 2.3 Delight Features
| ID | Feature | Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **UI-DEL-001** | **Confetti** | Hoàn thành bài học đạt điểm > 80 | Hiệu ứng pháo giấy (Confetti) bung ra toàn màn hình. |
| **UI-DEL-002** | **Waveform** | Khi AI đang nói (TTS) | Hiển thị sóng âm (Audio Waveform) nhảy múa theo nhịp điệu giọng nói. |

---

## 3. MOBILE-FIRST EXPERIENCE (THUMB-FRIENDLY)
*Mục đích: Đảm bảo thao tác trên điện thoại thuận tiện bằng 1 tay.*

### 3.1 Gestures & Touch Targets
| ID | Element | Check Info | Expected Result |
| :--- | :--- | :--- | :--- |
| **UI-MOB-001** | **Touch Target** | Kích thước các nút bấm quan trọng (Play/Record) | Tối thiểu 44x44px (iOS guideline) hoặc 48x48dp (Android). Không quá bé khó bấm. |
| **UI-MOB-002** | **Thumb Zone** | Vị trí nút CTA chính (Tiếp tục, Hoàn thành) | Nằm ở vùng dưới màn hình (Bottom Reachable Zone), dễ bấm bằng ngón cái. |
| **UI-MOB-003** | **Swipe Action** | Vuốt ngang thẻ bài học | Chuyển bài (nếu hỗ trợ carousel) hoặc Back (vuốt từ cạnh trái). Mượt mà, không khựng. |

### 3.2 Responsive Layout
| ID | Viewport | Check Info | Expected Result |
| :--- | :--- | :--- | :--- |
| **UI-MOB-004** | **iPhone SE (Small)** | Mở trang Dashboard | Không bị vỡ layout, không thanh cuộn ngang, text không đè lên nhau. |
| **UI-MOB-005** | **Tablet/iPad** | Mở trang Dashboard | Layout tận dụng không gian rộng (Grid 2-3 cột) thay vì list dọc dài ngoằng như mobile. |
| **UI-MOB-006** | **Keyboard Avoid** | Focus vào ô Chat/Input | Bàn phím ảo hiện lên -> Input field phải được đẩy lên (Not covered by keyboard). |

---

## 4. ERROR STATES & EMPTY STATES
*Mục đích: Không để người dùng hoang mang khi có lỗi hoặc chưa có dữ liệu.*

| ID | Screen/Flow | Scenario | Expected UI |
| :--- | :--- | :--- | :--- |
| **UI-ERR-001** | **History** | User mới chưa học bài nào | Hiện hình minh họa dễ thương + Nút "Học bài đầu tiên". Không hiện trang trắng "No Data". |
| **UI-ERR-002** | **Form Input** | Nhập sai email | Viền ô input đỏ. Hiện text lỗi "Email không hợp lệ" ngay bên dưới. |
| **UI-ERR-003** | **Connection** | Mất mạng | Hiện Toast/Banner màu đỏ/cam báo "Mất kết nối". Nút Retry xuất hiện. |
| **UI-ERR-004** | **404 Page** | Vào link bậy | Trang 404 Custom đẹp mắt, có nút "Về trang chủ". |
