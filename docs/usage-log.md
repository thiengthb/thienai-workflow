# Usage từng chat

Mỗi chat xong mục tiêu thì AI ghi một dòng, theo [`profile/CHATS.md`](../profile/CHATS.md). Số lấy từ skill `explain-usage`: tổng của cả chat, không tách theo việc, nên chat làm nhiều việc thì ghi rõ ở cột Mục tiêu. Đọc lại là token đọc lại từ cache (tính khoảng 0,1 lần), ghi cache tính khoảng 2 lần, viết ra khoảng 5 lần so với token thường. Các cột % là phần usage ước tính, vì usage đo theo lượt chứ không theo công cụ.

| Ngày | Nick | Mục tiêu | Lượt gọi | Đọc lại (triệu) | Ghi cache (triệu) | Viết ra (nghìn) | Ngữ cảnh % | Lệnh, file % | Web % | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-15 | tnt697 | Ba việc trong một chat: kế hoạch học nhẹ dần và PR #77, #78; mở lại bài chiến tranh 3, 4; dựng và ghi buổi Frontend 6 (PR #79) | 157 | 44,8 | 0,87 | 121 | 55 | 30 | 8 | Số đo đầu tiên, trước khi có luật một chat một mục tiêu |
| 2026-11-15 | tnt697 | Đợt 2 học nhẹ dần: gói buổi `prepare-lesson.mjs`, nhật ký 3 dòng (một việc, một PR) | 51 | 11,4 | 0,18 | 67 | 57 | 38 | 0 | Chat một mục tiêu đầu tiên: khoảng 1/4 chat đo lần đầu |
| 2026-11-15 | tnt697 | Kế hoạch usage: đo thí nghiệm 1, 2 (lần 1), checkpoint 2 `start-session.mjs` và chuẩn setup v3, checkpoint 3 bỏ Codex (hai PR) | 64 | 13,7 | 0,23 | 60 | 63 | 25 | 0 | Khởi động 12 lượt; hai lần dừng 11 và 68 phút không làm ghi cache tăng; có cả các lượt đo |
| 2026-11-16 | tnt697 | Học BA 3: soạn và dựng trang, sau buổi trong cùng chat (PR #91) | 41 | 8,33 | 0,14 | 29 | 67 | 23 | 0 | Thí nghiệm 4 lần 1; khởi động lỗi vì lần gắn repo đầu bị chặn |
| 2026-11-17 | tnt697 | Sau buổi Frontend 7 ở chat mới (PR #92) | 24 | 5,40 | 0,15 | 20 | 55 | 22 | 0 | Thí nghiệm 4 lần 2, mốc b; 18% là một lần đọc cả trang học không cần |
| 2026-11-17 | tnt697 | Sau buổi Frontend 8 ở chat mới (PR #97), rồi kiểm bản ghi của cả 4 lần thí nghiệm 4 | 18 | 3,16 | 0,09 | 16 | 58 | 30 | 0 | Thí nghiệm 4 lần 4, mốc b (đo trước khi mở PR); Settings: phiên 9% → 15% (03:08) |
