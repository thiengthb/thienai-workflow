# Dùng Claude tốn ít usage hơn: đo trước, đổi sau

Trạng thái: đang chạy · Duyệt: chưa (chờ thien) · Cập nhật: 2026-11-16 · nick tnt697 (xong thí nghiệm 1, 2, 3; checkpoint 2, 3 xong) · Đầu vào: câu hỏi của thien 2026-11-15, số đo ở `docs/usage-log.md`

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: checkpoint 1 (đo): thí nghiệm 1 xong (4 lần có đủ số Settings, gần nhất 2026-11-16 22:39 và 22:45); thí nghiệm 2 xong; thí nghiệm 3 xong (lần 3 đo bật và tắt cùng ngày, mỗi nửa tăng 1% phiên; bảng "Kết quả đo"). Còn thí nghiệm 4. Checkpoint 2 xong: khởi động theo v3 còn 3 lượt (đo 2026-11-15 16:49). Checkpoint 3 xong. Chưa đổi luật `profile/CHATS.md`.
- Còn thiếu: thí nghiệm 4.
- thien cần làm: duyệt kế hoạch; khi mở chat mới thì để AI chạy `explain-usage` ở những chỗ ghi trong thí nghiệm.

## thien hỏi gì
"bây giờ mình chỉ học bằng claude nên bạn có thể bỏ phần codex đi, và chỉ tối ưu cho claude thôi" và "nghiên cứu xem là mỗi chat nếu chỉ làm một mục tiêu rồi đổi chat liên tục vậy có hiệu quả không, tại vì mỗi lần mở chat mới lại tốn thời gian đọc lệnh hệ thống và refresh lại context [...] những việc quan trọng cần context đủ dài để làm đủ và xuyên suốt một giai đoạn thì sao. [...] phải nghiên cứu hướng tối ưu chứ không phải là hướng nghe hợp lý nhất, và phải dựa trên nghiên cứu và thử nghiệm" (2026-11-15).

## Mục tiêu
Biết bằng số đo khi nào nên giữ một chat và khi nào nên mở chat mới, rồi đổi luật `profile/CHATS.md` theo số đó. Làm cho việc mở chat mới rẻ, để khi cần đổi chat thì không mất nhiều.

## Đã biết (nguồn ở cuối file)

**Usage tính thế nào.** claude.ai không công bố cách quy đổi. Ở API: phần đọc lại từ cache rất rẻ (0,1 lần giá thường; Opus 5.5 là 0,05 lần), ghi vào cache đắt hơn giá thường (1,25 lần với cache 5 phút, 2 lần với cache 1 giờ), chữ viết ra đắt nhất. Cache sống 5 phút và được làm mới mỗi lần dùng. Các request có cùng phần đầu thì dùng chung cache được, kể cả ở hai cuộc trò chuyện khác nhau. Trang hỗ trợ của Claude ghi: chat dài tốn usage hơn, khi chạm giới hạn ngữ cảnh thì Claude tự tóm tắt và việc đó tốn thêm usage, công cụ và connector tốn nhiều token. [chưa kiểm] claude.ai dùng cache 5 phút hay 1 giờ, và hệ số thật là bao nhiêu.

**Chất lượng khi chat dài.** Nghiên cứu "Context rot" của Chroma (18 model, có Claude 4) và "Lost in the middle" cho thấy độ chính xác giảm dần khi ngữ cảnh dài ra, nhất là khi có thông tin gần giống mà sai. Anthropic gọi ngữ cảnh là "ngân sách chú ý" có hạn. Họ khuyên: việc nhiều trao đổi qua lại thì tóm tắt để giữ mạch; việc có mốc rõ thì ghi chú ra ngoài (như sổ bàn giao, STATUS) rồi bắt đầu lại từ ghi chú. Nghĩa là không có đáp án "luôn giữ" hay "luôn đổi"; tùy loại việc.

**Số đo của chính mình** (`explain-usage`, cùng cách quy đổi 0,1 / 2 / 5):

| Chat | Lượt gọi | Đọc lại trung bình mỗi lượt | Usage quy đổi mỗi lượt | Ghi chú |
|---|---|---|---|---|
| A: ba việc trong một chat (2026-11-15) | 157 | khoảng 285 nghìn token | khoảng 43 nghìn | dài, có lúc dừng lâu (trang học mở 311 phút) |
| B: một việc, đợt 2 (2026-11-15) | 51 | khoảng 224 nghìn token | khoảng 36 nghìn | chat mới |

Rút ra (còn phải kiểm bằng thí nghiệm):
1. **Số lượt gọi quyết định nhiều nhất.** Mỗi lượt tốn gần như cùng một mức: chat dài gấp ba chỉ làm mỗi lượt đắt hơn khoảng 20%. Mức nền rất lớn, vì ngay ở chat mới mỗi lượt đã đọc lại khoảng 224 nghìn token. Phần lớn số đó là hướng dẫn hệ thống, danh sách công cụ và connector, không phải nội dung repo.
2. **Đổi chat hiện đang đắt vì phần khởi động dài.** Ở chat B, khoảng 17 trên 51 lượt (một phần ba) là khởi động: đọc instructions, thử đọc file qua Project (3 lần lỗi, vì file đồng bộ từ GitHub không đọc theo tên được), gắn repo, clone, kiểm setup, đọc sổ, nhận việc. thien đoán đúng: với cách khởi động hiện nay, đổi chat liên tục là tốn.
3. **Mở chat mới không làm ghi lại toàn bộ phần nền.** Cả chat B chỉ ghi cache 177 nghìn token, ít hơn phần đọc lại mỗi lượt. Nên phần nền phần lớn đã có sẵn trong cache (dùng chung giữa các chat). Cái giá thật của chat mới là các lượt khởi động, không phải việc nạp lại hướng dẫn.
4. ~~**Dừng lâu rồi quay lại chat dài mới là lúc đắt.**~~ Thí nghiệm 2 (2 lần mỗi mốc) cho thấy sai ở mốc 11, 68 và 79 phút: quay lại không phải ghi lại lịch sử (bảng "Kết quả đo"). Khoản ghi cache 0,87 triệu token của chat A (dừng 311 phút) cần giải thích khác: dừng lâu hơn nữa, hay Claude tự tóm tắt chat dài [chưa kiểm].

## Kết quả đo
Số của `explain-usage` (cộng dồn cả chat) và Settings > Usage (số tròn phần trăm, gộp mọi chat của nick). Chat đo: project Claude, nick tnt697, 2026-11-15, phiên chạy kiểu Claude Code trên cloud; chat thường trên claude.ai có thể giữ cache khác.

| Thí nghiệm | Lần | Đo được | Settings | Kết luận |
|---|---|---|---|---|
| 1. Giá khởi động | 1 | 12 lượt tới lúc nhận việc xong; đọc lại 1,83 triệu, ghi cache 46 nghìn, viết ra 3,9 nghìn; quy đổi khoảng 295 nghìn (khoảng 25 nghìn mỗi lượt); hướng dẫn hệ thống 76% | không có mốc trước (phiên đang gộp chat khác) | 12 lượt, cần còn tối đa 4 (checkpoint 2) |
| 1. Giá khởi động | 2 (lệnh `start-session.mjs`, chuẩn v3) | 3 lượt tới lúc nhận việc xong (chat mới 16:49, có `--claim`); đọc lại 0,42 triệu, ghi cache 26 nghìn, viết ra 1,8 nghìn; quy đổi khoảng 103 nghìn (khoảng 34 nghìn mỗi lượt); hướng dẫn hệ thống 78%, lệnh khởi động 6%, gắn repo 4% (gắn 2 lần vì xin quyền ghi bị chặn) | trước: phiên 84%, tuần 43% (16:49); sau: 87%, 43% (17:14), nhưng gộp cả các lượt làm việc sau khi nhận việc (đo, sửa knowledge, ghi PR), nên phần riêng của khởi động dưới 3% | đạt: 12 → 3 lượt, usage quy đổi giảm khoảng 65%. Mỗi lượt đắt hơn (34 so với 25 nghìn) vì lệnh in nhiều chữ một lần |
| 2. Dừng khoảng 10 phút | 1 | dừng 11 phút (14:51–15:02): 3 lượt quanh lần dừng, ghi cache chỉ tăng 3,7 nghìn; lịch sử khoảng 180 nghìn token vẫn đọc từ cache | 71% → 72% qua khoảng 5 lượt | không đắt thêm |
| 2. Dừng khoảng 10 phút | 2 | chat 17:20 (nick tnt697, cùng phiên kiểu Claude Code trên cloud), dừng 11 phút (17:52–18:03) ngay sau lúc phiên Settings reset: 3 lượt quanh lần dừng, ghi cache chỉ tăng 3,4 nghìn; đọc lại khoảng 212 nghìn mỗi lượt, gần như toàn bộ lịch sử vẫn đọc từ cache; quy đổi khoảng 27 nghìn mỗi lượt, bằng trung bình cả chat. Trước đó trong cùng chat, hai lần dừng khoảng 6 và 12 phút (4 lượt) ghi cache cũng chỉ tăng 4 nghìn | trước: phiên 0% (vừa reset), tuần 44% (17:51); sau: 0%, 44% (18:03) | không đắt thêm; lần 2 khớp lần 1 |
| Thang Settings (phụ) | 1 | chat 17:20, từ lúc phiên Settings reset (khoảng 17:50) tới 18:10: khoảng 11 lượt (đo, mở PR #85, chờ CodeRabbit, sửa, ghi sổ), quy đổi khoảng 300 nghìn (ước từ hai lần `explain-usage` 17:51 và 18:03 cộng các lượt sau) | phiên 0% → 2%, tuần 44% → 44% | 1% phiên khoảng 120–200 nghìn quy đổi, tức khoảng 5–7 lượt ở chat cỡ này [chưa kiểm: Settings làm tròn, hệ số quy đổi của claude.ai chưa biết] |
| 2. Dừng hơn 65 phút | 1 | dừng 68 phút (15:07–16:15): 3 lượt quanh lần dừng, ghi cache chỉ tăng 3,7 nghìn; lịch sử khoảng 195 nghìn token vẫn đọc từ cache | 72% → 73% qua 3 lượt | không đắt thêm; cache sống ít nhất 68 phút ở phiên này |
| 2. Dừng hơn 65 phút | 2 | chat 18:25 (nick tnt697, cùng phiên kiểu Claude Code trên cloud), dừng khoảng 79 phút (18:41–20:00), lúc quay lại gửi từ app điện thoại nên danh sách công cụ đổi: 5 lượt từ mốc trước (2 trước khi dừng, 3 sau), ghi cache chỉ tăng 4,9 nghìn; lịch sử khoảng 200 nghìn token vẫn đọc từ cache (đọc lại khoảng 188 nghìn mỗi lượt); quy đổi khoảng 23 nghìn mỗi lượt, bằng trung bình cả chat (khoảng 26 nghìn) | trước: phiên 8%, tuần 45% (18:40); sau: 8%, 45% (20:00) | ghi cache cho thấy lịch sử không bị ghi lại; lần 2 khớp lần 1, kể cả khi đổi thiết bị giữa chừng. Settings làm tròn tới 1% nên không cho biết phần tăng nhỏ, và chưa có lần đối chứng không dừng |
| 3. Connector (tắt Figma, Claude in Chrome, sakubun bản claude.ai; giữ GitHub, sakubun-v2) | 1 | chat mới 18:25 (nick tnt697, chuẩn v3, `--claim`), đo ngay sau khi nhận việc: 3 lượt; đọc lại 0,42 triệu (khoảng 140 nghìn mỗi lượt), ghi cache 24 nghìn, viết ra 1,9 nghìn; quy đổi khoảng 98 nghìn (khoảng 33 nghìn mỗi lượt); hướng dẫn hệ thống 77%, lệnh khởi động 7%, gắn repo 5% (vẫn gắn 2 lần vì xin quyền ghi bị chặn) | trước: phiên 4%, tuần 45% (18:25); sau: 5%, 45% (18:28), gồm cả lượt `explain-usage` | gần như bằng thí nghiệm 1 lần 2 lúc còn bật connector (0,42 triệu, 78%): tắt connector không làm phần nền nhỏ đi thấy được. Có thể vì công cụ connector vốn nạp hoãn, chỉ tốn tên [chưa kiểm]. Lần này cũng là thí nghiệm 1 có đủ số Settings: khởi động 3 lượt tốn khoảng 1% phiên |
| 3. Connector (bật lại Figma, Claude in Chrome, sakubun bản claude.ai) | 2 | chat mới 2026-11-16 21:54 (nick tnt697, chuẩn v3, `--claim`), đo ngay sau khi nhận việc: 2 lượt; đọc lại 0,27 triệu (khoảng 135 nghìn mỗi lượt), ghi cache 20 nghìn, viết ra 1,7 nghìn; quy đổi khoảng 75 nghìn (khoảng 37 nghìn mỗi lượt); hướng dẫn hệ thống 74%, lệnh khởi động 9%, gắn repo 4% (lần này chỉ gắn 1 lần) | trước: phiên 8%, tuần 47% (21:54); sau: 12%, 48% (21:58), tính cả lượt `explain-usage` và lượt trả lời | Hai cách đo cho kết quả khác nhau. Theo `explain-usage`, mỗi lượt gần bằng lần 1 (37 so với 33 nghìn), tức bật connector không đắt hơn. Theo Settings, phiên tăng 4% so với 1% ở lần 1, qua số lượt gần như nhau. Nhưng thien cho biết lúc đó có một chat khác cùng nick chạy ở ngoài project. Kiểm lại sau khi tắt chat đó: từ 21:58 tới 22:02, khoảng 10 lượt trong chat này (quy đổi khoảng 290–350 nghìn) đưa phiên từ 12% lên 14%, khớp thang 1% bằng khoảng 120–200 nghìn. Vậy phần tăng 4% chủ yếu do chat kia, nên số Settings của lần này không dùng để so được. Chỉ còn số `explain-usage`, mà số đó cho thấy bật connector không đắt hơn. Cần lần 3 có số Settings sạch |
| 3. Connector, cùng ngày, nửa bật (Figma, Claude in Chrome, Filesystem, GitHub, sakubun đều bật) | 3a | chat mới 2026-11-16 22:39 (nick tnt697, chuẩn v3, `--claim`; thien xác nhận không chat nào khác cùng nick đang chạy), đo ngay sau khi nhận việc: 4 lượt; đọc lại 564.553, ghi cache 32.612, viết ra 2.783; quy đổi khoảng 136 nghìn (khoảng 34 nghìn mỗi lượt); hướng dẫn hệ thống 62%, tin của thien 15% (2 ảnh), lệnh 14%, gắn repo 6% (gắn 2 lần vì xin quyền ghi bị chặn) | trước: phiên 18%, tuần 49% (22:39); sau: 19%, 49% (22:43), tính cả lượt `explain-usage` và lượt trả lời | xem dòng 3b |
| 3. Connector, cùng ngày, nửa tắt (tắt Claude in Chrome, sakubun; Figma không còn trong danh sách; giữ Filesystem, GitHub) | 3b | chat mới 2026-11-16 22:45 (nick tnt697, chuẩn v3, `--claim`; phiên không có công cụ Chrome, Figma, sakubun), đo ngay sau khi nhận việc: 3 lượt; đọc lại 414.419, ghi cache 20.437, viết ra 2.012; quy đổi khoảng 92 nghìn (khoảng 31 nghìn mỗi lượt); hướng dẫn hệ thống 66,5%, tin của thien 18% (3 ảnh), lệnh 7,5%, gắn repo 5,6% (vẫn gắn 2 lần) | trước: phiên 20%, tuần 49% (22:45); sau: 21%, 49% (22:48), tính cả lượt `explain-usage` và lượt trả lời | Hai nửa đo cùng cách, cùng ngày, không chat khác chạy. Cả hai tăng đúng 1% phiên. Mỗi lượt chỉ chênh khoảng 10% (31 so với 34 nghìn), nằm trong sai số vì số lượt và số ảnh khác nhau. Khớp lần 1 và lần 2: tắt connector không làm usage giảm thấy được. Hai nửa cũng là hai lần thí nghiệm 1 có đủ số Settings: khởi động tốn khoảng 1% phiên |
| 4. Sau buổi trong chat dựng bài (BA 3) | 1 | chat mới 2026-11-16 22:59 (nick tnt697, chuẩn v3, không `--claim`). Khởi động lỗi: lần gắn repo đầu bị chặn, thien bảo gắn lại. (a) Lúc gửi trang học: 22 lượt; đọc lại 3,96 triệu, ghi cache 89 nghìn, viết ra 12,9 nghìn; quy đổi khoảng 640 nghìn (khoảng 29 nghìn mỗi lượt); hướng dẫn hệ thống 61%, lệnh và file 21%, tìm trong project 7% (lúc chưa có repo). (b) Lúc mở PR #91 sau buổi: 41 lượt; đọc lại 8,33 triệu, ghi cache 138 nghìn, viết ra 29,3 nghìn; quy đổi khoảng 1,26 triệu. Riêng phần sau buổi (19 lượt: đọc kết quả, ghi file, kiểm, mở PR) khoảng 616 nghìn (khoảng 32 nghìn mỗi lượt), gần bằng phần soạn và dựng bài | mở chat: phiên 24%, tuần 50% (22:59); (a) 28%, 51% (23:05); học xong trên trang: 29%, 51% (23:18); (b) 33%, 51% (23:25), tính cả lượt `explain-usage`. Phần sau buổi tốn khoảng 4% phiên, bằng phần soạn và dựng bài | Làm sau buổi trong cùng chat tốn gần bằng soạn bài, vì mỗi lượt phải đọc lại cả lịch sử dựng bài (khoảng 200 nghìn token). Cần lần 2 ở chat mới để so. Buổi học trên trang chỉ tốn khoảng 1% phiên, gồm một lần xem Claude làm mẫu và một tình huống thêm |
| 4. Sau buổi ở chat mới (Frontend 7) | 2 | Chat học 2026-11-16 23:38 (nick tnt697): (a) lúc gửi trang 30 lượt, quy đổi khoảng 1,07 triệu. Chat "sau buổi" mới 2026-11-17 00:04 (nick tnt697, chuẩn v3, không `--claim`), (b) lúc mở PR #92: 24 lượt cả chat, gồm khởi động; đọc lại 5,40 triệu, ghi cache 146 nghìn, viết ra 20 nghìn; quy đổi khoảng 930 nghìn (khoảng 39 nghìn mỗi lượt); hướng dẫn hệ thống 55%, lệnh và file 22%, trang artifact 18% (một lần đọc cả trang học khoảng 150 KB bằng `read_artifact`, không cần: chỉ cần slug để đọc db, nguồn trang đã có trong repo) | mở chat học: phiên 35%, tuần 52% (23:38); nhận trang: 43%, 53% (23:47); mở chat sau buổi: 45%, 53% (00:04); sau PR: chờ ảnh của thien | Tạm, chờ số Settings sau PR. Theo `explain-usage`, chat mới không rẻ hơn lần 1 (930 so với 616 nghìn), vì gồm khởi động (khoảng 100 nghìn) và lần đọc trang không cần (khoảng 165 nghìn). Bỏ hai phần đó thì còn khoảng 665 nghìn, gần bằng lần 1 [chưa kiểm: ước bằng phần trăm của `explain-usage`]. Chất lượng bản ghi: thien chấm |

## Hướng đề xuất (giả thuyết, đổi luật chỉ sau khi đo)
- **Một chat cho một giai đoạn làm liền mạch**, không phải cho một việc nhỏ. Giữ chat khi đang làm liên tục và bước sau cần những gì đã có trong chat. Đổi chat khi sắp dừng lâu (đi học trên trang, đi ngủ, sang ngày khác), khi bước sau gần như không cần lịch sử, hay khi chat đã rất dài (Claude bắt đầu tự tóm tắt).
- **Khởi động trong 2–3 lượt thay vì 17:** lệnh mới `start-session.mjs` (chưa có, sẽ để trong `templates/`) làm trong một lần gọi: kiểm setup, đọc sổ, chọn và nhận việc mới nhất, in STATUS, PR đang mở. Project instructions bỏ bước đọc file qua Project (luôn lỗi), đi thẳng tới clone. Đây là thứ làm cho việc đổi chat đáng làm.
- **Ít lượt hơn trong lúc làm:** gộp lệnh vào một lần gọi khi chúng không phụ thuộc nhau, dùng script thay cho nhiều lần đọc file.
- ~~**Tắt connector không dùng** khi học hay khi sửa repo (Figma, sakubun, Chrome…), nếu thí nghiệm 3 cho thấy phần nền giảm.~~ Thí nghiệm 3 (3 lần) không thấy giảm, nên không cần tắt để tiết kiệm.
- **Bỏ Codex khỏi luồng học.** Làm cho gọn, không phải để tiết kiệm: Claude vốn không đọc learning/codex.md.

## Không làm
- Không đổi luật `profile/CHATS.md` trước khi có số đo của checkpoint 1.
- Không tối ưu thêm số KB file đọc: sau đợt 2, phần đó nhỏ so với phần nền mỗi lượt.
- Không đổi khung 7 bước hay tính năng nào của trang học.

## Checkpoint

### 1. Đo (4 thí nghiệm, mỗi cái ít nhất 2 lần)
Xong khi: bảng trong file này có số của cả 4 thí nghiệm, mỗi cái ít nhất 2 lần. Mỗi lần có **mức Settings > Usage trước và sau** (số thật của claude.ai, vì hệ số quy đổi của `explain-usage` chưa chắc đúng ở claude.ai), cộng số của `explain-usage` để biết phần nào tốn. Hai số xếp hạng khác nhau thì tin Settings > Usage.
- [x] Thí nghiệm 1, giá khởi động (xong 2026-11-16: 3 tới 4 lượt, khoảng 75–136 nghìn quy đổi, khoảng 1% phiên; đủ số Settings ở 2026-11-15 18:25, 2026-11-16 22:39 và 22:45): ở chat mới, ngay sau khi nhận việc xong thì chạy `explain-usage`, ghi số lượt và usage quy đổi. (Lần đo lại với lệnh khởi động mới nằm ở checkpoint 2.)
- [x] Thí nghiệm 2, dừng lâu (xong 2026-11-15: dừng khoảng 10 phút 2 lần, hơn 65 phút 2 lần; ở cả 4 lần, ghi cache cho thấy lịch sử không bị ghi lại sau khi dừng): trong một chat đang làm, chạy `explain-usage`, rồi dừng hẳn (không gửi gì trong chat đó, không chạy việc khác ở project đó), gửi một tin ngắn, chạy lại; phần ghi cache tăng bao nhiêu so với lịch sử của chat. Làm với hai khoảng dừng: khoảng 10 phút và hơn 65 phút, vì claude.ai có thể dùng cache 5 phút hay 1 giờ.
- [x] Thí nghiệm 3, connector (xong 2026-11-16: 3 lần, theo `explain-usage` và Settings đều không thấy tắt connector giảm usage): cùng một việc khởi động khi bật và khi tắt các connector không dùng; so phần đọc lại trung bình mỗi lượt.
- [ ] Thí nghiệm 4, sau buổi học: hai buổi làm "sau buổi" ngay trong chat dựng bài, hai buổi làm ở chat mới; so usage quy đổi và chất lượng ghi (thien chấm bản ghi có đủ ý không).

### 2. Khởi động rẻ
Xong khi: thí nghiệm 1 lặp lại cho thấy khởi động còn tối đa 4 lượt.
- [x] lệnh mới `start-session.mjs` (chưa có, sẽ để trong `templates/`) và test, rồi làm lại thí nghiệm 1 với lệnh này; sửa đoạn project instructions (tăng số chuẩn setup) để đi thẳng tới clone và lệnh này. Đã có lệnh, test và chuẩn setup v3 (nhánh `feat/start-session`); Đo lại 2026-11-15 16:49: 3 lượt (bảng "Kết quả đo").

### 3. Bỏ Codex khỏi luồng học
Xong khi: không file nào trong luồng học còn trỏ tới learning/codex.md; CI xanh.
- [x] Xóa learning/codex.md, bước 3 của "học" trong `AGENTS.md`, phần Codex ở `profile/MAP.md`, gói buổi, `learning/README.md` (cả `learning/frontend.md`, bảng README); luật thẻ bù chuyển vào "Khung một buổi" của `learning/README.md`. Bài và trang cũ học ở Codex giữ nguyên làm lịch sử.

### 4. Đổi luật chat theo số đo
Xong khi: `profile/CHATS.md` ghi luật mới kèm số đo làm căn cứ, thien duyệt.
- [ ] Sửa `profile/CHATS.md`

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-15 | Giả thuyết 4 (dừng lâu mới đắt) gạch đi; làm checkpoint 2 trong lúc chờ lần đo thứ hai | Thí nghiệm 2 lần 1: dừng 68 phút không phải ghi lại lịch sử. Checkpoint 2 không phụ thuộc số đo |
| 2026-11-15 | Checkpoint 1 cần số Settings > Usage; đo lại khởi động chuyển sang checkpoint 2; thí nghiệm 2 thêm khoảng dừng hơn 65 phút | Góp ý của CodeRabbit ở PR #82: hệ số quy đổi chưa chắc đúng ở claude.ai; checkpoint 1 không được phụ thuộc lệnh của checkpoint 2; cache có thể sống 1 giờ |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
| 2026-11-15 | Chat 17:20 (nick tnt697): AI chép nguyên dấu ngoặc của project instructions vào `--claim "Claude (tnt697), …"`; lệnh báo "Sổ bàn giao chưa đúng mẫu… một nick khác có thể vừa nhận việc", nên dừng hỏi thien dù sổ không sai. Tốn thêm 2 lượt | `start-session.mjs` nhận dạng có ngoặc, `--claim` thiếu nick thì báo rõ và không đụng sổ; lỗi mẫu không còn bị báo là nick khác (nhánh `fix/claim-format`) |
| 2026-11-17 | Chat "sau buổi" Frontend 7: AI đọc cả trang học bằng `read_artifact` (khoảng 150 KB, 18% usage của chat) chỉ để lấy slug và xem nội dung, trong khi `after-lesson.mjs` đọc nguồn trang trong repo | Ghi vào bước 1 "Sau buổi" của `learning/README.md`: lấy slug bằng `get_artifact`, đừng đọc cả trang |
| 2026-11-15 | Bản clone `--depth 1` mới, lần fetch nhánh đầu tiên trong `start-session.mjs` báo không so được nhánh chưa merge; chạy lại thì được | `start-session.mjs` thử lại một lần sau 5 giây |

## Nguồn (đọc 2026-11-15)
- Anthropic, [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): hệ số ghi và đọc cache, thời gian sống, dùng chung cache theo phần đầu giống nhau.
- Claude Help Center, [Understanding usage and length limits](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits): chat dài và tự tóm tắt tốn usage hơn, connector tốn token.
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): ngân sách chú ý, tóm tắt, ghi chú ngoài ngữ cảnh.
- Chroma, [Context rot](https://research.trychroma.com/context-rot) (chỉ đọc qua bài tóm tắt); Liu và cộng sự, [Lost in the middle](https://arxiv.org/abs/2307.03172) (chỉ đọc qua bài tóm tắt).
- Số đo của mình: `docs/usage-log.md`, hai dòng ngày 2026-11-15.
