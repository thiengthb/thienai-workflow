# Tính năng nào thật sự được dùng

Mỗi buổi học và mỗi lượt ôn thẻ thêm một dòng, do script ghi (`artifacts/lesson/after-lesson.mjs --write` và `artifacts/review/apply-review.mjs`), không gõ tay. Số là số lần dùng trong buổi đó; "-" là trang không có tính năng đó ("Xem Claude làm" chỉ có ở bài có sân khấu, "Tình huống thêm" không có ở bài chiến tranh).

Dùng ở mốc 2026-12-13 (xem "Mốc kiểm tra" trong [README.md](README.md)): chạy `node artifacts/kit/usage.mjs learning/usage.md` để xem mỗi tính năng dùng ở bao nhiêu buổi. Tính năng gần như không ai bấm thì bỏ khỏi trang cho gọn, tính năng dùng nhiều thì làm tốt thêm.

| Ngày | Trang | Phút | Hỏi Claude | Claude giải thích câu sai | Claude nhận xét, chấm | Nói thay gõ | Xem Claude làm | Nghe | Tình huống thêm | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-14 | war-04-sandtable lúc 15:27 | 27 | 1 | 0 | 1 | 0 | - | - | - | - |
| 2026-11-15 | frontend-06 lúc 07:50 | 311 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | xem bản mẫu trước khi viết |
| 2026-11-15 | war-05 lúc 01:02 | 952 | 0 | 0 | 0 | 0 | 0 | 0 | - | - |
