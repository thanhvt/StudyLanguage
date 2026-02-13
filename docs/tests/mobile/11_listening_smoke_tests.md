# 🔥 Listening — Smoke Test Checklist

> **Mục đích:** Chạy nhanh (~10 phút) trên device thật SAU MỖI BẢN BUILD để xác nhận core flows hoạt động.
> **Khi nào chạy:** Mỗi lần build mới, trước khi test chi tiết.
> **Thiết bị:** iOS (iPhone) + Android (Pixel/Samsung)

---

## Quy ước

- ✅ = Pass
- ❌ = Fail (ghi bug ngay, block release)
- ⏭️ = Skip (ghi lý do)

---

## Checklist

| # | Bước | Kết quả mong đợi | iOS | Android | Ghi chú |
|:-:|------|-------------------|:---:|:-------:|---------|
| 1 | Mở app → Tap **🎧 Luyện nghe** từ Dashboard | Config screen hiển thị, có Topic + Duration + Level | | | |
| 2 | Chọn Topic → tap 1 topic bất kỳ | Topic hiện chip/tag selected, nút "Bắt đầu" active | | | |
| 3 | Chọn Duration → tap **10 phút** | Pill "10" highlighted, các pill khác unhighlight | | | |
| 4 | Chọn Duration → tap ✏️ Custom → chọn **25 phút** từ picker | Picker mở smooth, chọn → đóng, badge "25 phút" hiện | | | |
| 5 | Chọn Speakers → tap **3** | Speaker pill "3" highlighted | | | |
| 6 | Nhập Keywords → gõ "coffee, meeting" | Text hiển thị đúng trong input | | | |
| 7 | Tap **Bắt đầu nghe** | Loading spinner hiện → chuyển sang PlayerScreen | | | |
| 8 | PlayerScreen → kiểm tra transcript hiện | Danh sách câu hội thoại hiện, có speaker name + text | | | |
| 9 | PlayerScreen → kiểm tra bản dịch tiếng Việt | Mỗi câu có dòng tiếng Việt bên dưới (nếu enable) | | | |
| 10 | Tap ▶️ Play (nếu có audio) | Audio phát, progress bar chạy | | | |
| 11 | Tap ⏸️ Pause | Audio dừng, progress bar dừng | | | |
| 12 | Long press 1 câu trong transcript | Câu được bookmark (icon ⭐ hiện) + haptic feedback | | | |
| 13 | Long press lại câu đã bookmark | Bỏ bookmark (icon ⭐ mất) | | | |
| 14 | Tap nút **Back** | Quay về Config screen, config giữ nguyên | | | |
| 15 | Chọn Scenario chip (VD: "Restaurant") | Loading → chuyển sang PlayerScreen với kịch bản nhà hàng | | | |
| 16 | Tắt mạng → tap **Bắt đầu** | Thông báo lỗi "Cần kết nối mạng" hiện rõ ràng | | | |
| 17 | Bật lại mạng → tap **Bắt đầu** | Hoạt động bình thường | | | |

---

## Kết quả

| Ngày | Build | iOS | Android | Người test | Bugs |
|------|-------|:---:|:-------:|------------|------|
| | | /17 | /17 | | |

---

## Lưu ý quan trọng

> [!CAUTION]
> Nếu bất kỳ bước nào từ **1-7** FAIL → **BLOCK release**, báo dev ngay.
> Bước 8-17 fail → ghi bug nhưng có thể tiếp tục test.
