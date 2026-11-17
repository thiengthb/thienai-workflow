# Tính năng nào thật sự được dùng

Mỗi buổi học và mỗi lượt ôn thẻ thêm một dòng, do script ghi (`artifacts/lesson/after-lesson.mjs --write` và `artifacts/review/apply-review.mjs`), không gõ tay. Số là số lần dùng trong buổi đó; "-" là trang không có tính năng đó ("Xem Claude làm" chỉ có ở bài có sân khấu, "Tình huống thêm" không có ở bài chiến tranh).

Dùng ở mốc 2026-12-13 (xem "Mốc kiểm tra" trong [README.md](README.md)): chạy `node artifacts/kit/usage.mjs learning/usage.md` để xem mỗi tính năng dùng ở bao nhiêu buổi. Tính năng gần như không ai bấm thì bỏ khỏi trang cho gọn, tính năng dùng nhiều thì làm tốt thêm.

| Ngày | Trang | Phút | Hỏi Claude | Claude giải thích câu sai | Claude nhận xét, chấm | Nói thay gõ | Xem Claude làm | Nghe | Tình huống thêm | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-14 | war-04-sandtable lúc 15:27 | 27 | 1 | 0 | 1 | 0 | - | - | - | - |
| 2026-11-15 | frontend-06 lúc 07:50 | 311 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | xem bản mẫu trước khi viết |
| 2026-11-15 | war-05 lúc 01:02 | 952 | 0 | 0 | 0 | 0 | 0 | 0 | - | - |
| 2026-11-16 | ba-03 lúc 23:04 | 15 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | xem bản mẫu trước khi viết |
| 2026-11-17 | frontend-07 lúc 23:46 | 15 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | - |
| 2026-11-17 | war-06 lúc 01:35 | 14 | 0 | 0 | 1 | 0 | 0 | 0 | - | - |
| 2026-11-17 | frontend-08 lúc 02:35 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | - |
| 2026-11-17 | ba-04 lúc 10:42 | 14 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | - |
| 2026-11-17 | frontend-09 lúc 11:56 | 11 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | - |
| 2026-11-17 | war-07 lúc 16:50 | 12 | 0 | 0 | 1 | 0 | 1 | 0 | - | - |
| 2026-11-17 | ba-05 lúc 18:33 | 60 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | - |
| 2026-11-17 | frontend-10 lúc 20:53 | 72 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | - |
