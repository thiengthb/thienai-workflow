# Mẫu artifact thien thích

Các trang artifact thien đã dùng và khen. Ở project nào, tài khoản nào, model nào cũng vậy: trước khi làm một artifact mới, AI xem danh sách dưới đây. Có mẫu hợp thì dựng từ mẫu, chỉ thay nội dung, giữ bố cục và cách tương tác.

## Danh sách mẫu

| Mẫu | Dùng khi | thien khen gì |
|---|---|---|
| [`compare/`](compare/README.md) | Mọi vòng duyệt giao diện: so cũ và mới (hoặc nhiều phác), ghim comment đúng chỗ, OK / Cần sửa | Mới, thử lần đầu 2026-11-13 với trang tổng quan |
| [`decide/`](decide/README.md) | Cần thien chọn 1 trong 2–4 cách có hình (bố cục, kiến trúc, công cụ); đề xuất của AI ẩn tới khi thien chọn | Bố cục do thien chọn 2026-11-14: bảng so sánh trên khung rộng, thẻ trên điện thoại |
| [`lesson/`](lesson/README.md) | Một buổi học khoảng 15 phút theo khung 7 bước; xong buổi tự lưu và gửi kết quả cho Claude | Kiểu trang học "rất thích" từ buổi frontend 1 (2026-11-07): đủ dài, độ khó vừa, làm trọn trên điện thoại. Chuyển lên lõi chung 2026-11-14 |

## Lõi chung

`kit/kit.css` và `kit/kit.js` là phần dùng chung cho mọi mẫu mới: màu và chữ theo gu ở dưới, nút, thanh tiến độ, thông báo, lưu nháp vào máy và db, chép kết quả, gửi cho Claude. Mẫu mới dựng trên lõi này; sửa lõi một lần là mọi mẫu đổi theo. Trang học mới dựng từ `lesson/` (đã trên lõi chung, kèm phần tự lưu của `learning/teaching/kit/`); trang học cũ giữ nguyên như lúc học.

## Điểm chung của các mẫu đã được khen

- Làm trên điện thoại trước: cột nội dung hẹp (trang học khoảng 560px), vùng chạm 44px, một bo góc 8px cho nút, ô, thẻ.
- Mỗi màn chỉ một bước, có thanh tiến độ và số bước ("3/7") ở trên cùng.
- Chưa làm xong bước thì nút "Tiếp" mờ đi, không bắt đọc hướng dẫn dài.
- Kết quả tự lưu vào db của artifact và gửi cho Claude bằng nút "Gửi cho Claude" (hay "Xong buổi học"); không gửi được thì có nút chép kết quả.
- Font Onest, nền trắng ngà, chữ gần đen, một màu nhấn (xanh teal) cho thứ đúng hoặc quan trọng. Theo gu ở repo [thienui](https://github.com/thiengthb/thienui), file `docs/taste.md`.
- Tiếng Việt tự nhiên, giọng người kèm học thân thiện, thuật ngữ tiếng Anh giữ nguyên và giải thích một lần.

## Thêm hoặc bỏ mẫu

- Khi thien nói thích một artifact, AI đề xuất lưu nó thành mẫu ở đây qua PR, kèm một dòng "thien khen gì".
- Mẫu mới thay thế mẫu cũ cùng loại, không giữ cả hai. Tối đa 8 mẫu.
- Ảnh và dữ liệu thật không lưu trong mẫu, chỉ để chỗ trống (ví dụ `__A__`).
