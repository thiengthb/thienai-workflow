# Học chỉ bằng Claude: bỏ phần Codex, kế hoạch tối ưu usage cho Claude

Repo: thiengthb/thienai-workflow · Nhánh: chưa có (tạo từ main) · PR: #82 đã merge
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXa9oobQMtaPoFn5rm · Cập nhật: 2026-11-15T07:51Z

## thien muốn gì
"bây giờ mình chỉ học bằng claude nên bạn có thể bỏ phần codex đi, và chỉ tối ưu cho claude thôi, vì chỉ có mỗi claude làm thỏa mãn phần giao diện artifact cho mình. Nên bạn lên kế hoạch có thể tập trung tối ưu phần này. Và chắc chắn bạn đã nghiên cứu và lên phương án đủ kĩ để tối ưu chưa" (2026-11-15)
Tiếp đó: "nghiên cứu xem là mỗi chat nếu chỉ làm một mục tiêu rồi đổi chat liên tục vậy có hiệu quả không [...] phải dựa trên nghiên cứu và thử nghiệm" (2026-11-15). Nguyên văn đủ ở `docs/plans/2026-11-15-claude-usage.md`.

## Đã xong
- PR #81 đã merge (đợt 2 học nhẹ dần).
- Kế hoạch `docs/plans/2026-11-15-claude-usage.md` (PR #82): điều đã biết, số đo, 4 thí nghiệm, hướng đề xuất. Bỏ Codex là checkpoint 3 của kế hoạch đó.
- Thí nghiệm 1, lần 1 (chat mới 2026-11-15 14:40, nick tnt697): khởi động tới lúc nhận việc xong là 12 lượt; đọc lại 1,83 triệu token (khoảng 153 nghìn mỗi lượt), ghi cache 46 nghìn, viết ra 3,9 nghìn; quy đổi khoảng 295 nghìn (khoảng 25 nghìn mỗi lượt). Hướng dẫn hệ thống chiếm 76%. Thiếu số Settings > Usage trước khi mở chat. Chưa ghi vào kế hoạch (cần PR).
- Thí nghiệm 2, mốc trước (14:50, 2026-11-15): Settings phiên 71%, tuần 40%. Mốc 68% lúc 14:45 bỏ, vì lúc đó chat ở project sakubun cùng nick vẫn đang chạy (thien đã dừng). `explain-usage` lúc này: 18 lượt, ghi cache 54.233, đọc lại 2.887.571, viết ra 8.718 token (quy đổi khoảng 441 nghìn). Bước kế: thien dừng tới sau 15:00, không dùng Claude ở đâu, gửi tin ngắn kèm ảnh Settings, chạy `explain-usage` lại và so phần ghi cache tăng.

## Bước tiếp theo
1. Ghi số thí nghiệm 1 lần 1 vào bảng của kế hoạch (PR). Làm thí nghiệm 2 ở chính chat này: chạy `explain-usage`, thien dừng 10 phút rồi gửi tin ngắn, chạy lại. Thí nghiệm 1 lần 2 ở chat mới sau, nhớ ghi Settings > Usage trước khi mở.
2. Rồi checkpoint 2 (lệnh khởi động một lần gọi) và 3 (bỏ Codex), mỗi cái một PR.

## Đang chờ thien
Không.

## Lưu ý
- Làm ở chat mới (luật `profile/CHATS.md`), không gộp với buổi học BA 3.
- Đừng hứa con số tiết kiệm trước khi đo một buổi thật theo giai đoạn.
