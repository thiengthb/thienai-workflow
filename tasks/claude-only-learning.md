# Học chỉ bằng Claude: bỏ phần Codex, kế hoạch tối ưu usage cho Claude

Repo: thiengthb/thienai-workflow · Nhánh: main · PR: không
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBW5weWV4ugkXKSFq8g · Cập nhật: 2026-11-15T11:40Z

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
- Nhánh `docs/measure-start-session` đã vào main (commit 7cfaa68, f60c04a); nhánh đã xoá trên origin. Kiểm 2026-11-15 17:25.
- Chat 17:20: `--claim` có ngoặc bị báo nhầm là sổ sai mẫu. Đã sửa `start-session.mjs` và thêm test, ghi vào "Lỗi gặp" của kế hoạch: nhánh `fix/claim-format`, PR #84. Test node chạy trên máy đều qua. CodeRabbit góp 2 ý: sửa 1 (commit trên nhánh), giữ 1 (đã trả lời trên PR). Đã merge theo lời thien (squash cf82f16), nhánh tự xoá.
- Thí nghiệm 2 lần 2, dừng khoảng 10 phút, mốc trước (17:3x, chat session_01WXAvBZ…): `explain-usage` 27 lượt, ghi cache 76.782, đọc lại 4.867.157, viết ra 17.361 (quy đổi khoảng 727 nghìn). Chưa có số Settings.
- Thí nghiệm 2 lần 2, mốc trước sau reset phiên (17:51): Settings phiên 0%, tuần 44%. `explain-usage` 31 lượt, ghi cache 80.788, đọc lại 5.696.100, viết ra 20.707 (quy đổi khoảng 835 nghìn). Từ mốc 27 lượt tới đây (4 lượt, có hai lần dừng khoảng 6 và 12 phút) ghi cache chỉ tăng 4.006. thien bắt đầu dừng khoảng 10 phút sau tin này.
- Thí nghiệm 2 lần 2, dừng 11 phút (17:52–18:03): 34 lượt, ghi cache 84.223 (chỉ tăng 3.435 qua 3 lượt), đọc lại 6.332.028, viết ra 22.953. Settings 18:03: phiên 0%, tuần 44%. Đã ghi vào bảng "Kết quả đo": nhánh `docs/measure-pause-10min-2`, PR #85. CodeRabbit góp 1 ý (thí nghiệm 1 lần 1 thiếu số Settings trước), đã sửa; CI xanh.
- Settings 18:10: phiên 2%, tuần 44% sau khoảng 11 lượt từ lúc reset (khoảng 300 nghìn quy đổi): 1% phiên khoảng 120–200 nghìn. Đã thêm một dòng "Thang Settings" vào bảng, cùng PR #85. PR #85 đã merge theo lời thien (18:13).

- Thí nghiệm 3 lần 1 (chat mới 18:25, connector Figma, Claude in Chrome, sakubun bản claude.ai đã tắt): 3 lượt, đọc lại 0,42 triệu, quy đổi khoảng 98 nghìn, hướng dẫn hệ thống 77%; Settings phiên 4% → 5%, tuần 45%. Gần như bằng lúc bật connector: tắt không giúp thấy được. Đã ghi vào bảng "Kết quả đo" và STATUS: nhánh `docs/measure-connectors`, PR #86. CodeRabbit góp 2 ý (ghi rõ "không thấy giảm, mới một lần"; thêm một lần thí nghiệm 1 đủ số vào phần còn thiếu), đã sửa cả hai. Đã merge theo lời thien (squash ab948ea) lúc 18:3x.- Thí nghiệm 2 lần 2, dừng hơn 65 phút, mốc trước (18:3x, chat session_01WXAvBW5weWV4ugkXKSFq8g bắt đầu 18:25): `explain-usage` 19 lượt, ghi cache 56.928, đọc lại 3.191.933, viết ra 13.389 (quy đổi khoảng 500 nghìn). Settings 18:40: phiên 8%, tuần 45%. Thêm 2 lượt (ghi sổ, trả lời) trước khi thien bắt đầu nghỉ khoảng 18:41.

## Bước tiếp theo
0. **Thí nghiệm 2 lần 2 (dừng hơn 65 phút) ngay trong chat này** (session_01WXAvBW5weWV4ugkXKSFq8g, bắt đầu 18:25): chạy `explain-usage` làm mốc trước, thien chụp Settings rồi nghỉ hơn 65 phút, không dùng Claude ở đâu. Quay lại: gửi tin ngắn kèm ảnh Settings, chạy `explain-usage`, so phần ghi cache tăng. Sau đó: thí nghiệm 3 lần 2 (bật lại connector, chụp Settings, mở chat mới nói "tiếp tục", đo ngay khi nhận việc), lần này cũng là lần thứ hai thí nghiệm 1 đủ số.
1. Khi tiện: lần 2 của thí nghiệm 2 (dừng hơn 65 phút); thí nghiệm 4 (sau buổi học).

## Đang chờ thien
- Các lần đo còn lại cần thien chụp Settings (xem Bước tiếp theo).
- Dán instructions v3 ở 2 nick còn lại (tnt024, tnt628) nếu chưa dán.

## Lưu ý
- Làm ở chat mới (luật `profile/CHATS.md`), không gộp với buổi học BA 3.
- Đừng hứa con số tiết kiệm trước khi đo một buổi thật theo giai đoạn.
