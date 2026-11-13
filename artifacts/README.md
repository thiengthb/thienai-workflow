# Mẫu artifact thien thích

Các trang artifact thien đã dùng và khen. Ở project nào, tài khoản nào, model nào cũng vậy: trước khi làm một artifact mới, AI xem danh sách dưới đây. Có mẫu hợp thì dựng từ mẫu, chỉ thay nội dung, giữ bố cục và cách tương tác.

## Danh sách mẫu

| Mẫu | Dùng khi | thien khen gì |
|---|---|---|
| [`compare/`](compare/README.md) | Mọi vòng duyệt giao diện: so cũ và mới (hoặc nhiều phác), ghim comment đúng chỗ, OK / Cần sửa | Mới, thử lần đầu 2026-11-13 với trang tổng quan |
| [`lesson-page.html`](lesson-page.html) | Một buổi học ngắn khoảng 15 phút: nhớ lại, chấm hoặc quan sát, học một ý, câu hỏi nhanh, tự nói lại, góp ý | "Rất thích" (2026-11-07, buổi học frontend 1). Đủ dài, độ khó vừa, làm trọn trên điện thoại |

## Lõi chung

`kit/kit.css` và `kit/kit.js` là phần dùng chung cho mọi mẫu mới: màu và chữ theo gu ở dưới, nút, thanh tiến độ, thông báo, lưu nháp vào máy và db, chép kết quả, gửi cho Claude. Mẫu mới dựng trên lõi này; sửa lõi một lần là mọi mẫu đổi theo. Trang học vẫn dùng `learning/teaching/kit/` cho tới khi chuyển sang lõi chung.

## Điểm chung của các mẫu đã được khen

- Làm trên điện thoại trước: cột nội dung tối đa khoảng 460px, nút cao 52px bo tròn hẳn, vùng bấm lớn.
- Mỗi màn chỉ một bước, có thanh tiến độ và số bước ("3/7") ở trên cùng.
- Chưa làm xong bước thì nút "Tiếp" mờ đi, không bắt đọc hướng dẫn dài.
- Kết quả tự lưu vào db của artifact để AI đọc lại; thien chỉ cần nhắn "xong". Lưu không được thì có nút chép kết quả.
- Font Onest, nền trắng ngà, chữ gần đen, một màu nhấn (xanh teal) cho thứ đúng hoặc quan trọng. Theo gu ở repo [thienui](https://github.com/thiengthb/thienui), file `docs/taste.md`.
- Tiếng Việt tự nhiên, giọng người kèm học thân thiện, thuật ngữ tiếng Anh giữ nguyên và giải thích một lần.

## Thêm hoặc bỏ mẫu

- Khi thien nói thích một artifact, AI đề xuất lưu nó thành mẫu ở đây qua PR, kèm một dòng "thien khen gì".
- Mẫu mới thay thế mẫu cũ cùng loại, không giữ cả hai. Tối đa 8 mẫu.
- Ảnh và dữ liệu thật không lưu trong mẫu, chỉ để chỗ trống (ví dụ `__A__`).
