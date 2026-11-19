# KH7 · Dùng project bản beta tốn ít usage hơn: thread, lịch nhắc, theo dõi PR

Trạng thái: xong (đóng sớm 2026-11-19, thien quyết ở KH8) · Duyệt: 2026-11-19 · Trang: https://claude.ai/artifact/S9H1zuVfHSZhSs5DfdURjZ (nick tnt628) · Viết: 2026-11-19 · Cập nhật: 2026-11-19 · nick tnt628 · Thread: [Tối ưu token khi làm kế hoạch dài trong thread](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvRHS9xoyPanZaP9rntnrf9nJ)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đã đóng. Đóng sớm 2026-11-19 (KH8 câu 8): ba luật thread giữ mà chưa đo; số đo ở project Sakubun không đọc được từ phiên này.
- Còn thiếu: không; việc chưa làm ghi "đóng sớm" hay chỗ chuyển tới ngay ở dòng việc đó.
- thien cần làm: không có (PR luật #153, PR mã #154 nằm ở KH8).

## Mục tiêu
Quy trình thienai-workflow ở project bản beta không đốt usage vào những chỗ không làm ra gì: đánh thức thread lớn đã nghỉ lâu, lịch nhắc chạy trong thread cũ, thread thức dậy vì PR chỉ còn chờ merge. Dùng đúng tính năng sẵn có của Claude Projects, không viết thêm công cụ.

## Không làm
- Không viết lệnh hay script mới; không đổi `start-session.mjs` hay sổ bàn giao.
- Không đổi ngưỡng tự tóm tắt hay effort của project.
- Không đổi model; đó là câu hỏi 3, bạn quyết.
- Không đụng luật của project bản cũ trong `profile/CHATS.md`.
- Không đổi luật buổi học: dựng bài và "sau buổi" vẫn ở một thread (lý do ở mục "Ý kiến của mình").

## Các phương án đã xét
| Phương án | Hợp khi | Lý do không chọn |
|---|---|---|
| A. Giữ nguyên: một thread làm cả kế hoạch, để thread tự tóm tắt | bạn trả lời liền trong vài phút | Mỗi lần bạn quay lại sau vài giờ là một lần ghi lại 300 tới 500 nghìn token. Với cách bạn làm (duyệt trên điện thoại, cách nhau nhiều giờ), chuyện này xảy ra ở gần như mọi checkpoint. Tóm tắt nhiều lần cũng làm mất chi tiết. |
| **B. Chia ở chỗ phải chờ bạn: thread theo checkpoint, lịch nhắc ở phiên mới, thôi theo dõi PR khi chỉ chờ merge (chọn)** | việc có checkpoint, bạn trả lời cách quãng | Thread mới tốn khoảng 1 tới 1,5 USD vào cửa và không nhớ gì chưa ghi vào repo. Đỡ được vì kế hoạch, sổ bàn giao và PR đã giữ đủ, và thí nghiệm 4 của nick tnt697 cho thấy chat mới không làm bản ghi thiếu ý. Checkpoint ngắn thì tách không lời, nên trả lời trong 1 giờ vẫn làm tiếp tại chỗ. |
| C. Chia nhỏ hơn: mỗi bước, mỗi PR nhỏ một thread | các bước không liên quan nhau | Mỗi thread trả giá vào cửa; thí nghiệm 4 ở bản cũ cho thấy tách bước nhỏ ra chat riêng đắt hơn làm tiếp tại chỗ. |
| D. Hạ ngưỡng tự tóm tắt (ví dụ 250 nghìn) bằng biến môi trường | làm liên tục rất lâu trong một thread | Chỉ đỡ phần đọc lại, khoảng 15% [suy luận]; tóm tắt nhiều lần làm mất chi tiết; chưa biết biến mình đặt có thắng biến máy đặt sẵn không [chưa kiểm]. Không chữa khoản đánh thức, là khoản lớn nhất. |
| E. Dùng Sonnet 5.5 cho thread | việc làm theo kế hoạch đã duyệt rõ | Rẻ bằng nửa Opus 5.5 cho mọi loại token, nhưng chất lượng là thứ bạn đặt trước tiết kiệm, và chọn model là việc của bạn. Để thành câu hỏi 3. |
| F. Hạ effort của thread | việc lặt vặt | Phần viết ra (gồm cả suy nghĩ) chỉ chiếm 11 tới 18% tiền, tiết kiệm ít mà dễ làm sai phải làm lại. |
| G. Subagent cho việc đọc nhiều | đọc log rất dài một lần | Subagent có phần nền riêng và cache chỉ sống 5 phút; không phải chỗ tốn của bạn. |
| H. Tự viết công cụ đo hay giới hạn số lượt | không có công cụ sẵn | Bản ghi kết quả của thread (`list_events`) và trang Usage đã đủ để đo. |

## Checkpoint

### 1. Sửa luật thread và PR
Xong khi: bạn mở `profile/CHATS.md` trên GitHub, mục "Project bản beta" có ba luật ở mục "Ý kiến của mình" kèm số đo làm căn cứ; chat điều phối ở các project beta đã có luật số 2 (theo câu hỏi 1).
Ước: 1 phiên
- [x] `profile/CHATS.md` mục "Project bản beta": bỏ câu "nên không có ngưỡng", thêm ba luật và hai dòng số đo, giữ dưới khoảng 15 dòng
- [x] Đưa luật số 2 tới chat điều phối theo cách bạn chọn ở câu hỏi 1: dòng mới trong khối bản beta của `profile/SETUP.md`, chuẩn lên v6 (đã sửa trong PR #139); PR #139 merge 2026-11-19, thien đã dán lại ở mọi project cùng ngày (cả project cũ, để mọi project cùng một số chuẩn)
- [x] `docs/STATUS.md`: thêm dòng kế hoạch này vào "Kế hoạch đang chạy" (STATUS đang đủ 40 dòng, nên gộp hay bớt một dòng cũ cho vừa)

### 2. Lịch nhắc việc dở chạy ở phiên mới
Xong khi: lần nhắc thứ Hai hay thứ Năm kế tiếp chạy ở một thread mới trong project Claude, tin nhắn tới bạn như cũ, và bản ghi của lần chạy đó không còn khoản ghi lại lịch sử cũ.
Ước: 0,5 phiên
- [x] Tạo lại lịch nhắc thành lịch của project, mỗi lần chạy mở thread mới, với lời nhắc đầy đủ không cần lịch sử (theo câu hỏi 2); tắt lịch cũ `trig_01QirWvTiZFgoeBm5Ah3LCdt`. Đã làm 2026-11-19: lịch mới `trig_01TtaWWBuGbCC6JscBSV7xL8`, cùng giờ 18:47 thứ Hai và thứ Năm; lịch cũ đã tắt (chưa xoá, để còn lịch sử chạy). Lời nhắc mới thêm một bước: ghi số dùng của lần chạy vào project memory, file `reminder-runs.md`
- [ ] Ghi số của lần chạy đầu vào bảng "Kết quả đo" (đóng sớm 2026-11-19, KH8)

### 3. Thử ở sakubun và đo
Xong khi: bảng "Kết quả đo" có số của ít nhất 2 checkpoint làm theo luật mới, đặt cạnh số mỗi checkpoint của thread "Tiếp tục làm Sakubun"; bạn xem và thấy cách mới có rẻ hơn mỗi checkpoint không.
Ước: 1 phiên
- [ ] Mức nền: thread đầu tiên ở project Sakubun đọc bản ghi kết quả của thread "Tiếp tục làm Sakubun" (chỉ đọc được từ project đó), đếm số checkpoint thread đó đã xong theo dấu tick trong kế hoạch U4, rồi chia tổng USD cho số checkpoint. Bản ghi chỉ có tổng cộng dồn sau mỗi lượt, nên chia theo checkpoint là ước lượng; không đếm được thì ghi rõ ở cột "Ghi chú" và chỉ so tổng (đóng sớm 2026-11-19, KH8)
- [ ] Checkpoint kế tiếp của việc U4 (sakubun) làm ở thread mới. Lúc xong, thread đọc bản ghi kết quả của chính nó và ghi: tổng token, phần ghi cache, số lần đánh thức sau hơn 1 giờ, số USD quy đổi (đóng sớm 2026-11-19, KH8)
- [ ] Một checkpoint nữa, bất kỳ kế hoạch nào, cũng ghi như vậy (đóng sớm 2026-11-19, KH8)
- [ ] Ghi số vào bảng "Kết quả đo" của file này và một dòng vào `docs/usage-log.md` (đóng sớm 2026-11-19, KH8)

### 4. Xem lại ở mốc 01/12
Xong khi: ở buổi xem lại chung ngày 01/12, luật được giữ, sửa hay bỏ dựa trên bảng số ở checkpoint 2 và 3.
Ước: mốc
- [x] Gộp vào danh sách xem lại 01/12 của kế hoạch `2026-11-17-workflow-review.md` (mục đối chiếu tính năng mới của Claude) (gộp vào kế hoạch MCP cùng việc đối chiếu tính năng, KH8 câu 8)

## Câu hỏi (thien đã trả lời 2026-11-19 bằng nút trên trang: "ok, theo cả 3 đề xuất")
1. Đưa luật số 2 (tin tới sau hơn 1 giờ thì mở thread mới) tới chat điều phối bằng cách nào?
   - Thêm một câu vào đoạn chuẩn setup bản beta (lên v6), bạn dán lại ở các project beta một lần; lệnh khởi động tự nhắc project nào còn bản cũ (đề xuất)
   - Bạn nhắn câu đó ở chat điều phối từng project, Claude tự ghi vào memory của project đó; nhanh hơn nhưng không chắc nguyên văn và không đồng bộ giữa các project
2. Lịch nhắc thứ Hai, thứ Năm chuyển sang chạy ở thread mới mỗi lần không? Đề xuất: có. Lý do: lần chạy 16/11 tốn 1,87 USD, trong đó 87% là ghi lại 204 nghìn token lịch sử của thread cũ mà lời nhắc không cần.
3. Thử Sonnet 5.5 cho thread làm code theo kế hoạch đã duyệt không? Đề xuất: chưa. Lý do: đo checkpoint 3 với Opus trước; nếu tuần sau vẫn hết usage giữa tuần thì thử một checkpoint bằng Sonnet.

## Ý kiến của mình
Bạn đúng là kế hoạch dài nên chia ra nhiều thread, nhưng chỗ chia không phải theo độ dài mà theo **lúc phải chờ bạn**. Tiền bị đốt nhiều nhất khi một thread lớn ngồi chờ bạn duyệt trang, chọn phương án hay merge PR qua vài giờ, rồi được gọi dậy: lúc đó cả ngữ cảnh 300 tới 500 nghìn token phải ghi lại từ đầu. Trong lúc làm liên tục thì cứ để thread tự tóm tắt; chia nhỏ hơn không lời bao nhiêu mà còn mất giá vào cửa.

Ba luật đề xuất, đều dựa trên tính năng sẵn có:
1. **Một thread cho một checkpoint của kế hoạch.** Checkpoint vốn là chỗ bạn kiểm bằng mắt hay bằng tay (`profile/PLANNING.md`), tức là chỗ phải chờ bạn. Xong checkpoint thì thread sửa "Đang ở đâu" của file kế hoạch và sổ bàn giao rồi báo kết quả. Bạn trả lời trong vòng 1 giờ thì thread làm tiếp checkpoint sau ngay tại chỗ, vì cache còn sống nên không tốn khoản đánh thức. Quá 1 giờ thì checkpoint sau sang thread mới, như luật 2. Đây cũng là cách tài liệu Claude Projects mô tả việc lớn: chia thành nhiều thread, mỗi thread một phần.
2. **Tin của bạn tới sau hơn 1 giờ thì sang thread mới.** Chat điều phối là chỗ quyết gửi tin vào thread nào. Khi thread đích đã nghỉ hơn 1 giờ và đã xong ít nhất một checkpoint hay một PR, chat điều phối mở thread mới đọc kế hoạch và sổ bàn giao, thay vì gửi vào thread cũ. Tin tới trong vòng 1 giờ (câu hỏi nhanh, hay bảo làm tiếp checkpoint sau) thì vẫn gửi thread cũ.
3. **Thread thôi theo dõi PR khi chỉ còn chờ bạn merge.** Thread đang theo dõi PR thức dậy mỗi lần có comment, CI hay merge, và lần thức sau hơn 1 giờ là một lần ghi lại cả ngữ cảnh. Khi CodeRabbit đã xong, CI xanh và PR chỉ còn chờ bạn, thread ghi "chờ merge PR #…" vào kế hoạch và thôi theo dõi. Việc dọn sau merge (tick kế hoạch, sửa STATUS) đã có luật gộp vào PR kế tiếp.

Thêm một chỗ ngoài thread: **lịch nhắc thứ Hai, thứ Năm** đang chạy trong thread cũ "Theo dõi tiến độ các kế hoạch đã duyệt", nên mỗi lần chạy là một lần đánh thức thread đó sau 3 tới 4 ngày nghỉ. Chạy ở thread mới thì không phải mang lịch sử cũ.

Buổi học giữ nguyên một thread cho cả dựng bài và "sau buổi": lúc gửi trang, thread mới khoảng 150 tới 200 nghìn token, nên đánh thức nó (khoảng 1,2 tới 1,6 USD) gần bằng mở thread mới, mà luật hiện có đơn giản hơn.

Với thread "Tiếp tục làm Sakubun" bây giờ: theo sổ bàn giao, việc U4 đang chờ bạn chọn cách tô vạch ở vòng 3. Chọn xong thì bạn nhắn ở chat điều phối của Sakubun "mở thread mới làm tiếp U4 từ sổ bàn giao", đừng trả lời vào thread 176 triệu kia. Việc này làm được ngay, không cần chờ kế hoạch được duyệt.

## Cách bàn giao của nick tnt697 đã vào repo chưa
Đã vào cả, và chạy được ở bản beta:
- `templates/start-session.mjs` làm khởi động còn 3 lượt (kế hoạch `2026-11-15-claude-usage.md`, checkpoint 2). Thread beta chạy nó với `--beta`.
- Sổ bàn giao (`profile/HANDOFF.md`) và mục "Đang ở đâu" của file kế hoạch giữ việc dở giữa hai phiên, kể cả giữa hai nick.
- `profile/CHATS.md` có ngưỡng "quá 30 lượt thì mở chat mới", nhưng chỉ cho project bản cũ.

Chỗ còn hổng: mục "Project bản beta" của `CHATS.md` (mình viết ngày 17/11) ghi "thread tự nén khi dài, không phải tự quản ngữ cảnh, nên không có ngưỡng". Câu đó đúng về chuyện thread không bị đầy, nhưng sai về chuyện tốn usage, như số đo dưới đây cho thấy.

## Số đo (đọc 2026-11-19)
Số lấy từ bản ghi kết quả của từng thread (công cụ `list_events`, sự kiện `result`), là số Claude Code tự ghi, không phải ước lượng. Giá quy đổi theo bảng giá API của Opus 5.5 trên mỗi triệu token: đọc lại từ cache 0,20 USD, ghi cache loại 1 giờ 8 USD, viết ra 20 USD. claude.ai không công bố cách quy usage của gói Pro, nên USD ở đây chỉ là thước để so các phần với nhau [chưa kiểm hệ số thật].

| Thread (project Claude, nick tnt628) | Tổng token | Đọc lại cache | Ghi cache | Viết ra | Quy ra USD | Phần tiền: đọc lại / ghi / viết ra |
|---|---|---|---|---|---|---|
| Học luân phiên nhiều môn (11/11 tới 16/11) | 137,3 triệu | 133,2 triệu (97%) | 3,57 triệu | 0,48 triệu | khoảng 65 | 41% / 44% / 15% |
| Review sâu và tối ưu thienai-workflow (17/11) | 112 triệu | 110,7 triệu (99%) | 1,29 triệu | 0,35 triệu | khoảng 39 | 56% / 26% / 18% |
| Theo dõi tiến độ các kế hoạch đã duyệt (cả lịch nhắc) | 44,7 triệu | 43,7 triệu (98%) | 0,97 triệu | 0,10 triệu | khoảng 18,5 | 47% / 42% / 11% |
| Thread này, sau 17 lần gọi | 2,1 triệu | 2,0 triệu | 0,14 triệu | 7 nghìn | khoảng 1,6 | 25% / 69% / 6% |

Rút ra:
1. **Con số token trên Settings > Usage dễ làm hoảng.** Tổng token của thread (137,3 triệu của "Học luân phiên" khớp đúng số trên trang Usage) gần như toàn là phần đọc lại từ cache, mà phần này rẻ hơn ghi cache 40 lần. Nên 176 triệu token không có nghĩa là 176 triệu token "đắt". Phần ghi cache tuy ít token nhưng chiếm gần nửa tiền.
2. **Đánh thức một thread lớn đã nghỉ lâu là khoản đắt nhất.** Thread "Học luân phiên" nghỉ 2 ngày rồi bị một lần merge PR đánh thức ngày 16/11 để trả lời 3 dòng: lượt đó tốn khoảng 4,5 USD, trong đó 3,9 USD (86%) là ghi lại cache 484 nghìn token. Lần chạy lịch nhắc cùng ngày trong thread "Theo dõi tiến độ" tốn 1,87 USD, trong đó 1,63 USD (87%) là ghi lại 204 nghìn token. Một lần gọi bình thường ở thread cỡ 275 nghìn token chỉ khoảng 0,05 tới 0,07 USD, nên một lần đánh thức thread lớn bằng khoảng 55 tới 75 lần gọi bình thường. Tài liệu Claude Projects nói đúng điều này: thread nghỉ quá thời gian giữ cache (1 giờ với Pro, Max) thì đọc lại cả cuộc trò chuyện, và việc mới thì mở thread mới có thể rẻ hơn hồi sinh thread cũ lớn.
3. **Thread không phình tới 1 triệu.** Máy của thread đặt sẵn `CLAUDE_CODE_AUTO_COMPACT_WINDOW=500000`, nên thread tự tóm tắt khi ngữ cảnh tới khoảng 400 tới 500 nghìn token. Trong lúc làm liên tục, một thread dài và nhiều thread ngắn tốn gần như nhau mỗi lần gọi: ngữ cảnh trung bình chỉ chênh khoảng 30%, nên tổng chỉ chênh khoảng 15% [suy luận từ số trên, chưa đo trực tiếp].
4. **Thread mới có giá vào cửa.** Lần gọi đầu của thread này đọc 84 nghìn token nền (hướng dẫn, danh sách công cụ), trong đó khoảng 40 nghìn phải ghi cache mới. Cộng 3 lượt khởi động và đọc lại các file cần cho việc, một thread mới tốn khoảng 1 tới 1,5 USD trước khi làm được gì [suy luận]. So với khoản đánh thức ở ý 2 (số token ngữ cảnh nhân 8 USD mỗi triệu), hai bên hòa nhau khi thread cũ có ngữ cảnh khoảng 150 nghìn token. Thread làm xong một checkpoint thường đã quá mức này: "Review sâu" lúc cuối khoảng 275 nghìn, thread này sau 17 lần gọi đã 177 nghìn.

## Thời gian và chỗ dễ sa lầy
- Checkpoint 1 và 2: một phiên, khoảng 20 lần gọi.
- Checkpoint 3: không tốn phiên riêng, đo kèm khi làm việc thật trong khoảng một tuần.
- Dễ sa lầy: mải đo mà không làm việc thật. Mỗi thread chỉ đọc bản ghi một lần lúc xong, không đo giữa chừng.

## Kết quả đo
| Ngày | Thread | Việc | Số checkpoint | Tổng token | Ghi cache | Số lần đánh thức sau hơn 1 giờ | Quy ra USD | USD mỗi checkpoint | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-19 | Lịch nhắc mới tự ghi số dùng của mỗi lần chạy vào project memory (`reminder-runs.md`) | Thread này không phải thức dậy để đo, đúng luật 2; checkpoint 3 đọc file đó |
| 2026-11-19 | Mở rộng từ "chia thread" sang cả lịch nhắc và theo dõi PR; thêm checkpoint 2 (lịch nhắc) và câu hỏi 2 | thien nhờ nghiên cứu kỹ thêm cả quy trình với project beta; số đo cho thấy lịch nhắc cũng đánh thức thread cũ mỗi lần chạy |
| 2026-11-19 | Đóng kế hoạch | thien chọn "Làm nốt rồi đóng" (KH8, `2026-11-19-close-plans.md`): đang có quá nhiều kế hoạch; mốc 01/12 làm sớm, việc cần số đo thật ghi đóng sớm thay vì tick đạt |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|

## Nguồn (đọc 2026-11-19)
- Claude Code docs, [Projects](https://code.claude.com/docs/en/claude-projects): mục "When to use a project", "Choose models and let Claude manage context", "What draws on your plan", "See and reduce a project's usage", "Give a project standing context".
- Claude Code docs, [How Claude Code uses prompt caching](https://code.claude.com/docs/en/prompt-caching): cache theo phần đầu giống nhau, cache 1 giờ cho phiên chính trên gói Pro và Max, tóm tắt làm mất cache phần hội thoại, subagent dùng cache 5 phút.
- Claude Code docs, [Manage costs effectively](https://code.claude.com/docs/en/costs): mục "Why usage climbs in a long session" và "Reduce token usage".
- Claude Code docs, [Model configuration](https://code.claude.com/docs/en/model-config): mục "Default auto-compact thresholds".
- Anthropic, [Pricing](https://platform.claude.com/docs/en/about-claude/pricing): giá Opus 5.5 và Sonnet 5.5.
- Claude Help Center, [Understanding usage and length limits](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits).
- Số đo của mình: bản ghi kết quả của 4 thread ở bảng trên; lịch nhắc `trig_01QirWvTiZFgoeBm5Ah3LCdt` (chạy trong thread cũ, lần chạy cuối 16/11); kế hoạch [`2026-11-15-claude-usage.md`](2026-11-15-claude-usage.md) (bản cũ, nick tnt697).
