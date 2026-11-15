# Dùng Claude tốn ít usage hơn: đo trước, đổi sau

Trạng thái: đang chạy · Duyệt: chưa (chờ thien) · Cập nhật: 2026-11-15 · nick tnt697 (đo thí nghiệm 1, 2; checkpoint 2) · Đầu vào: câu hỏi của thien 2026-11-15, số đo ở `docs/usage-log.md`

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: checkpoint 1 (đo): thí nghiệm 1 và 2 có lần 1 (bảng "Kết quả đo"). Checkpoint 2: lệnh `start-session.mjs` xong, chờ merge rồi đo lại. Chưa đổi luật `profile/CHATS.md`.
- Còn thiếu: lần 2 của thí nghiệm 1, 2; thí nghiệm 3, 4.
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
4. ~~**Dừng lâu rồi quay lại chat dài mới là lúc đắt.**~~ Thí nghiệm 2 lần 1 cho thấy sai ở mốc 11 và 68 phút: quay lại không phải ghi lại lịch sử (bảng "Kết quả đo"). Khoản ghi cache 0,87 triệu token của chat A (dừng 311 phút) cần giải thích khác: dừng lâu hơn nữa, hay Claude tự tóm tắt chat dài [chưa kiểm].

## Kết quả đo
Số của `explain-usage` (cộng dồn cả chat) và Settings > Usage (số tròn phần trăm, gộp mọi chat của nick). Chat đo: project Claude, nick tnt697, 2026-11-15, phiên chạy kiểu Claude Code trên cloud; chat thường trên claude.ai có thể giữ cache khác.

| Thí nghiệm | Lần | Đo được | Settings | Kết luận |
|---|---|---|---|---|
| 1. Giá khởi động | 1 | 12 lượt tới lúc nhận việc xong; đọc lại 1,83 triệu, ghi cache 46 nghìn, viết ra 3,9 nghìn; quy đổi khoảng 295 nghìn (khoảng 25 nghìn mỗi lượt); hướng dẫn hệ thống 76% | không có mốc trước (phiên đang gộp chat khác) | 12 lượt, cần còn tối đa 4 (checkpoint 2) |
| 2. Dừng khoảng 10 phút | 1 | dừng 11 phút (14:51–15:02): 3 lượt quanh lần dừng, ghi cache chỉ tăng 3,7 nghìn; lịch sử khoảng 180 nghìn token vẫn đọc từ cache | 71% → 72% qua khoảng 5 lượt | không đắt thêm |
| 2. Dừng hơn 65 phút | 1 | dừng 68 phút (15:07–16:15): 3 lượt quanh lần dừng, ghi cache chỉ tăng 3,7 nghìn; lịch sử khoảng 195 nghìn token vẫn đọc từ cache | 72% → 73% qua 3 lượt | không đắt thêm; cache sống ít nhất 68 phút ở phiên này |

## Hướng đề xuất (giả thuyết, đổi luật chỉ sau khi đo)
- **Một chat cho một giai đoạn làm liền mạch**, không phải cho một việc nhỏ. Giữ chat khi đang làm liên tục và bước sau cần những gì đã có trong chat. Đổi chat khi sắp dừng lâu (đi học trên trang, đi ngủ, sang ngày khác), khi bước sau gần như không cần lịch sử, hay khi chat đã rất dài (Claude bắt đầu tự tóm tắt).
- **Khởi động trong 2–3 lượt thay vì 17:** lệnh mới `start-session.mjs` (chưa có, sẽ để trong `templates/`) làm trong một lần gọi: kiểm setup, đọc sổ, chọn và nhận việc mới nhất, in STATUS, PR đang mở. Project instructions bỏ bước đọc file qua Project (luôn lỗi), đi thẳng tới clone. Đây là thứ làm cho việc đổi chat đáng làm.
- **Ít lượt hơn trong lúc làm:** gộp lệnh vào một lần gọi khi chúng không phụ thuộc nhau, dùng script thay cho nhiều lần đọc file.
- **Tắt connector không dùng** khi học hay khi sửa repo (Figma, sakubun, Chrome…), nếu thí nghiệm 3 cho thấy phần nền giảm.
- **Bỏ Codex khỏi luồng học.** Làm cho gọn, không phải để tiết kiệm: Claude vốn không đọc `learning/codex.md`.

## Không làm
- Không đổi luật `profile/CHATS.md` trước khi có số đo của checkpoint 1.
- Không tối ưu thêm số KB file đọc: sau đợt 2, phần đó nhỏ so với phần nền mỗi lượt.
- Không đổi khung 7 bước hay tính năng nào của trang học.

## Checkpoint

### 1. Đo (4 thí nghiệm, mỗi cái ít nhất 2 lần)
Xong khi: bảng trong file này có số của cả 4 thí nghiệm, mỗi cái ít nhất 2 lần. Mỗi lần có **mức Settings > Usage trước và sau** (số thật của claude.ai, vì hệ số quy đổi của `explain-usage` chưa chắc đúng ở claude.ai), cộng số của `explain-usage` để biết phần nào tốn. Hai số xếp hạng khác nhau thì tin Settings > Usage.
- [ ] Thí nghiệm 1, giá khởi động: ở chat mới, ngay sau khi nhận việc xong thì chạy `explain-usage`, ghi số lượt và usage quy đổi. (Lần đo lại với lệnh khởi động mới nằm ở checkpoint 2.)
- [ ] Thí nghiệm 2, dừng lâu: trong một chat đang làm, chạy `explain-usage`, rồi dừng hẳn (không gửi gì trong chat đó, không chạy việc khác ở project đó), gửi một tin ngắn, chạy lại; phần ghi cache tăng bao nhiêu so với lịch sử của chat. Làm với hai khoảng dừng: khoảng 10 phút và hơn 65 phút, vì claude.ai có thể dùng cache 5 phút hay 1 giờ.
- [ ] Thí nghiệm 3, connector: cùng một việc khởi động khi bật và khi tắt các connector không dùng; so phần đọc lại trung bình mỗi lượt.
- [ ] Thí nghiệm 4, sau buổi học: hai buổi làm "sau buổi" ngay trong chat dựng bài, hai buổi làm ở chat mới; so usage quy đổi và chất lượng ghi (thien chấm bản ghi có đủ ý không).

### 2. Khởi động rẻ
Xong khi: thí nghiệm 1 lặp lại cho thấy khởi động còn tối đa 4 lượt.
- [ ] lệnh mới `start-session.mjs` (chưa có, sẽ để trong `templates/`) và test, rồi làm lại thí nghiệm 1 với lệnh này; sửa đoạn project instructions (tăng số chuẩn setup) để đi thẳng tới clone và lệnh này. Đã có lệnh, test và chuẩn setup v3 (nhánh `feat/start-session`); còn đo lại sau khi thien dán v3.

### 3. Bỏ Codex khỏi luồng học
Xong khi: không file nào trong luồng học còn trỏ tới `learning/codex.md`; CI xanh.
- [ ] Xóa `learning/codex.md`, bước 3 của "học" trong `AGENTS.md`, phần Codex ở `profile/MAP.md`, gói buổi, `learning/README.md`

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
| 2026-11-15 | Bản clone `--depth 1` mới, lần fetch nhánh đầu tiên trong `start-session.mjs` báo không so được nhánh chưa merge; chạy lại thì được | `start-session.mjs` thử lại một lần sau 5 giây |

## Nguồn (đọc 2026-11-15)
- Anthropic, [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): hệ số ghi và đọc cache, thời gian sống, dùng chung cache theo phần đầu giống nhau.
- Claude Help Center, [Understanding usage and length limits](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits): chat dài và tự tóm tắt tốn usage hơn, connector tốn token.
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): ngân sách chú ý, tóm tắt, ghi chú ngoài ngữ cảnh.
- Chroma, [Context rot](https://research.trychroma.com/context-rot) (chỉ đọc qua bài tóm tắt); Liu và cộng sự, [Lost in the middle](https://arxiv.org/abs/2307.03172) (chỉ đọc qua bài tóm tắt).
- Số đo của mình: `docs/usage-log.md`, hai dòng ngày 2026-11-15.
