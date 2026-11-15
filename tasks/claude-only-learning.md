# Học chỉ bằng Claude: bỏ phần Codex, kế hoạch tối ưu usage cho Claude

Repo: thiengthb/thienai-workflow · Nhánh: docs/measure-start-session · PR: chưa mở (thien mở bằng link)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBaTiwVbajAKjvsBg5W · Cập nhật: 2026-11-15T10:03Z

## thien muốn gì
"bây giờ mình chỉ học bằng claude nên bạn có thể bỏ phần codex đi, và chỉ tối ưu cho claude thôi, vì chỉ có mỗi claude làm thỏa mãn phần giao diện artifact cho mình. Nên bạn lên kế hoạch có thể tập trung tối ưu phần này. Và chắc chắn bạn đã nghiên cứu và lên phương án đủ kĩ để tối ưu chưa" (2026-11-15)
Tiếp đó: "nghiên cứu xem là mỗi chat nếu chỉ làm một mục tiêu rồi đổi chat liên tục vậy có hiệu quả không [...] phải dựa trên nghiên cứu và thử nghiệm" (2026-11-15). Nguyên văn đủ ở `docs/plans/2026-11-15-claude-usage.md`.

## Đã xong
- PR #81 đã merge (đợt 2 học nhẹ dần).
- Kế hoạch `docs/plans/2026-11-15-claude-usage.md` (PR #82): điều đã biết, số đo, 4 thí nghiệm, hướng đề xuất. Bỏ Codex là checkpoint 3 của kế hoạch đó.
- Thí nghiệm 1, lần 1 (chat mới 2026-11-15 14:40, nick tnt697): khởi động tới lúc nhận việc xong là 12 lượt; đọc lại 1,83 triệu token (khoảng 153 nghìn mỗi lượt), ghi cache 46 nghìn, viết ra 3,9 nghìn; quy đổi khoảng 295 nghìn (khoảng 25 nghìn mỗi lượt). Hướng dẫn hệ thống chiếm 76%. Thiếu số Settings > Usage trước khi mở chat. Chưa ghi vào kế hoạch (cần PR).
- Thí nghiệm 2, mốc trước (14:50, 2026-11-15): Settings phiên 71%, tuần 40%. Mốc 68% lúc 14:45 bỏ, vì lúc đó chat ở project sakubun cùng nick vẫn đang chạy (thien đã dừng). `explain-usage` lúc này: 18 lượt, ghi cache 54.233, đọc lại 2.887.571, viết ra 8.718 token (quy đổi khoảng 441 nghìn). Bước kế: thien dừng tới sau 15:00, không dùng Claude ở đâu, gửi tin ngắn kèm ảnh Settings, chạy `explain-usage` lại và so phần ghi cache tăng.
- Thí nghiệm 2, dừng khoảng 11 phút (14:51 tới 15:02), lần 1: `explain-usage` sau khi quay lại là 21 lượt, ghi cache 57.957, đọc lại 3.437.747, viết ra 11.122. So mốc trước: 3 lượt (2 trước khi dừng, 1 sau), ghi cache chỉ tăng 3.724 (lịch sử khoảng 180 nghìn token không bị ghi lại), mỗi lượt vẫn khoảng 25 nghìn quy đổi. Nghĩa là bộ nhớ tạm sống qua 11 phút, nên claude.ai nhiều khả năng giữ cache 1 giờ [chưa kiểm: cần lần 2 và lần dừng hơn 65 phút]. Settings lúc 15:04: phiên 72%, tuần 41% (từ 71% / 40% lúc 14:50, qua khoảng 5 lượt gồm cả lượt đo; số làm tròn nên 1% phiên chỉ ước được rất thô, khoảng vài lượt).
- Thí nghiệm 2, dừng hơn 65 phút, mốc trước (15:06): `explain-usage` 26 lượt, ghi cache 63.357, đọc lại 4.384.048, viết ra 15.476 (quy đổi khoảng 643 nghìn). Settings gần nhất 72% / 41% lúc 15:04. thien nghỉ khoảng 1 tiếng.
- Thí nghiệm 2, dừng khoảng 68 phút (15:07 tới 16:15), lần 1: 29 lượt, ghi cache 67.014, đọc lại 4.967.928, viết ra 18.000. So mốc 15:06: 3 lượt, ghi cache chỉ tăng 3.657, lịch sử khoảng 195 nghìn token vẫn được đọc lại từ cache, không bị ghi lại. Settings 16:15: phiên 73%, tuần 41% (từ 72% / 41%). Nghĩa là dừng 68 phút cũng không đắt; giả thuyết 4 của kế hoạch (dừng lâu mới đắt) sai ở mốc này. Khoản ghi cache 0,87 triệu của chat A (dừng 311 phút) cần giải thích khác [chưa kiểm]. Lưu ý: số đo lấy từ phiên chạy kiểu Claude Code trên cloud gắn với project, chính sách cache của chat thường trên claude.ai có thể khác.

- Checkpoint 2: nhánh `feat/start-session` commit 2eb17e5 (lệnh, test, CI, chuẩn setup v3, HANDOFF/MAP/AGENTS.template/README/STATUS, số thí nghiệm 1–2 trong kế hoạch). Mọi test CI qua ở máy. Chưa có PR (gh không đăng nhập được; thien mở bằng link).
- Checkpoint 3: nhánh `feat/drop-codex-learning` commit 4bb6fd1, dòng usage-log của chat này ở commit sau đó, xếp chồng trên `feat/start-session`. Mọi test CI qua.

- Thí nghiệm 1, lần 2 (chat mới 2026-11-15 16:49, nick tnt697, chuẩn v3, `--claim`): 3 lượt tới lúc nhận việc xong, quy đổi khoảng 103 nghìn (từ 12 lượt, 295 nghìn). Settings trước: phiên 84%, tuần 43%. Đã ghi vào bảng "Kết quả đo", tick checkpoint 2, sửa STATUS: nhánh `docs/measure-start-session`.
- Cùng nhánh: `setup-check.mjs` đọc được `--sync` dạng JSON dán nguyên từ project_info (trước đó báo nhầm "knowledge chưa đồng bộ"); knowledge của project Claude đã đúng chuẩn.

## Bước tiếp theo
1. thien mở PR nhánh `docs/measure-start-session` rồi merge.
2. Lần 2 của thí nghiệm 2 (dừng 10 phút, hơn 65 phút) khi tiện; thí nghiệm 3 (connector), 4 (sau buổi học).

## Đang chờ thien
- Mở PR và merge nhánh `docs/measure-start-session`: https://github.com/thiengthb/thienai-workflow/pull/new/docs/measure-start-session
- Dán instructions v3 ở 2 nick còn lại (tnt024, tnt628) nếu chưa dán.

## Lưu ý
- Làm ở chat mới (luật `profile/CHATS.md`), không gộp với buổi học BA 3.
- Đừng hứa con số tiết kiệm trước khi đo một buổi thật theo giai đoạn.
