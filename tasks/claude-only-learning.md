# Học chỉ bằng Claude: bỏ phần Codex, kế hoạch tối ưu usage cho Claude

Repo: thiengthb/thienai-workflow · Nhánh: chưa có (tạo từ main) · PR: #82 đã merge
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXNLQf4kZZBQiEFV6R · Cập nhật: 2026-11-15T07:39Z

## thien muốn gì
"bây giờ mình chỉ học bằng claude nên bạn có thể bỏ phần codex đi, và chỉ tối ưu cho claude thôi, vì chỉ có mỗi claude làm thỏa mãn phần giao diện artifact cho mình. Nên bạn lên kế hoạch có thể tập trung tối ưu phần này. Và chắc chắn bạn đã nghiên cứu và lên phương án đủ kĩ để tối ưu chưa" (2026-11-15)
Tiếp đó: "nghiên cứu xem là mỗi chat nếu chỉ làm một mục tiêu rồi đổi chat liên tục vậy có hiệu quả không [...] phải dựa trên nghiên cứu và thử nghiệm" (2026-11-15). Nguyên văn đủ ở `docs/plans/2026-11-15-claude-usage.md`.

## Đã xong
- PR #81 đã merge (đợt 2 học nhẹ dần).
- Kế hoạch `docs/plans/2026-11-15-claude-usage.md` (PR #82): điều đã biết, số đo, 4 thí nghiệm, hướng đề xuất. Bỏ Codex là checkpoint 3 của kế hoạch đó.

## Bước tiếp theo
1. PR #82 đã merge 2026-11-15. Làm checkpoint 1 (đo) theo kế hoạch; thí nghiệm 1 làm ngay đầu chat mới đó (chạy `explain-usage` sau khi nhận việc xong).
2. Rồi checkpoint 2 (lệnh khởi động một lần gọi) và 3 (bỏ Codex), mỗi cái một PR.

## Đang chờ thien
Không.

## Lưu ý
- Làm ở chat mới (luật `profile/CHATS.md`), không gộp với buổi học BA 3.
- Đừng hứa con số tiết kiệm trước khi đo một buổi thật theo giai đoạn.
