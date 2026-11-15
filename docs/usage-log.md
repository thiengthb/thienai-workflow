# Usage từng chat

Mỗi chat xong mục tiêu thì AI ghi một dòng, theo [`profile/CHATS.md`](../profile/CHATS.md). Số lấy từ skill `explain-usage`: tổng của cả chat, không tách theo việc, nên chat làm nhiều việc thì ghi rõ ở cột Mục tiêu. Đọc lại là token đọc lại từ cache (tính khoảng 0,1 lần), ghi cache tính khoảng 2 lần, viết ra khoảng 5 lần so với token thường. Các cột % là phần usage ước tính, vì usage đo theo lượt chứ không theo công cụ.

| Ngày | Nick | Mục tiêu | Lượt gọi | Đọc lại (triệu) | Ghi cache (triệu) | Viết ra (nghìn) | Ngữ cảnh % | Lệnh, file % | Web % | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-15 | tnt697 | Ba việc trong một chat: kế hoạch học nhẹ dần và PR #77, #78; mở lại bài chiến tranh 3, 4; dựng và ghi buổi Frontend 6 (PR #79) | 157 | 44,8 | 0,87 | 121 | 55 | 30 | 8 | Số đo đầu tiên, trước khi có luật một chat một mục tiêu |
