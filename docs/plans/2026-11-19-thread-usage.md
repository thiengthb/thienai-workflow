# Làm kế hoạch dài trong project bản beta mà không tốn usage vô ích

Trạng thái: tạm dừng · Chờ thien duyệt · Viết: 2026-11-19 · nick tnt628 · Thread: [Tối ưu token khi làm kế hoạch dài trong thread](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvRHS9xoyPanZaP9rntnrf9nJ) · Đầu vào: câu hỏi của thien 2026-11-19, ảnh Settings > Usage (tuần đã dùng 55%, thread "Tiếp tục làm Sakubun" 176,6 triệu token)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: chờ thien duyệt kế hoạch và trả lời 2 câu hỏi ở cuối file.
- Còn thiếu: checkpoint 1 (sửa luật) chỉ làm sau khi thien duyệt.
- thien cần làm: đọc mục "Ý kiến của mình" và "Câu hỏi", trả lời trong thread.

## thien hỏi gì
"tôi không biết là chia kế hoạch rồi hoàn thiện kế hoạch đó trong một thread có ok không, nhưng thread đó đã nặng khoảng hơn 170 M token rồi [...] hiện tại tôi thấy là chưa, vì kế hoạch dài cần phải chia ra để tối ưu token. Bạn nghĩ như thế nào. Hãy nghiên cứu kĩ." (2026-11-19)

## Mục tiêu
Biết bằng số đo khi nào một kế hoạch dài nên sang thread mới ở project bản beta, rồi sửa đúng chỗ luật đang sai (`profile/CHATS.md`, mục "Project bản beta"). Không thêm công cụ mới: dùng lại cách bàn giao đã có (lệnh khởi động 3 lượt, sổ bàn giao, file kế hoạch).

## Cách bàn giao của nick tnt697 đã vào repo chưa
Đã vào cả, và chạy được ở bản beta:
- `templates/start-session.mjs` làm khởi động còn 3 lượt (đo ở kế hoạch `2026-11-15-claude-usage.md`, checkpoint 2). Thread beta đang chạy nó với `--beta`.
- Sổ bàn giao (`profile/HANDOFF.md`) và mục "Đang ở đâu" của file kế hoạch giữ được việc dở giữa hai phiên. Sổ hiện có việc U4 của sakubun, ghi bởi nick tnt628.
- `profile/CHATS.md` có ngưỡng "quá 30 lượt thì mở chat mới", nhưng chỉ cho project bản cũ.

Chỗ còn hổng: mục "Project bản beta" của `CHATS.md` (mình viết ngày 17/11) ghi "thread tự nén khi dài, không phải tự quản ngữ cảnh, nên không có ngưỡng". Câu đó đúng về chuyện thread không bị đầy, nhưng sai về chuyện tốn usage, như số đo dưới đây cho thấy.

## Số đo (đọc 2026-11-19)
Số lấy từ bản ghi kết quả của từng thread (công cụ `list_events`, sự kiện `result`), là số Claude Code tự ghi, không phải ước lượng. Giá quy đổi theo bảng giá API của Opus 5.5 trên mỗi triệu token: đọc lại từ cache 0,20 USD, ghi cache loại 1 giờ 8 USD, viết ra 20 USD. claude.ai không công bố cách quy usage của gói Pro, nên USD ở đây chỉ là thước để so các phần với nhau [chưa kiểm hệ số thật].

| Thread (project Claude, nick tnt628) | Tổng token | Đọc lại cache | Ghi cache | Viết ra | Quy ra USD | Phần tiền: đọc lại / ghi / viết ra |
|---|---|---|---|---|---|---|
| Học luân phiên nhiều môn (11/11 tới 16/11) | 137,3 triệu | 133,2 triệu (97%) | 3,57 triệu | 0,48 triệu | khoảng 65 | 41% / 44% / 15% |
| Review sâu và tối ưu thienai-workflow (17/11) | 112 triệu | 110,7 triệu (99%) | 1,29 triệu | 0,35 triệu | khoảng 39 | 56% / 26% / 18% |
| Thread này, sau 17 lần gọi | 2,1 triệu | 2,0 triệu | 0,14 triệu | 7 nghìn | khoảng 1,6 | 25% / 69% / 6% |

Rút ra:
1. **Con số token trên Settings > Usage dễ làm hoảng.** Tổng token của thread (137,3 triệu của "Học luân phiên" khớp đúng số trên trang Usage) gần như toàn là phần đọc lại từ cache, mà phần này rẻ hơn ghi cache 40 lần. Nên 176 triệu token không có nghĩa là 176 triệu token "đắt". Phần ghi cache tuy ít token nhưng chiếm gần nửa tiền.
2. **Đánh thức một thread lớn đã nghỉ lâu là khoản đắt nhất.** Thread "Học luân phiên" nghỉ 2 ngày rồi được gọi lại ngày 16/11 để trả lời 3 dòng: lượt đó tốn khoảng 4,5 USD, trong đó 3,9 USD (86%) là ghi lại cache 484 nghìn token, vì cache đã hết hạn. Một lần gọi bình thường ở thread cỡ 275 nghìn token chỉ khoảng 0,05 tới 0,07 USD. Vậy một lần đánh thức bằng khoảng 55 tới 75 lần gọi bình thường. Tài liệu Claude Projects nói đúng điều này: thread nghỉ quá thời gian giữ cache (1 giờ với Pro, Max) thì đọc lại cả cuộc trò chuyện trước khi làm, và việc mới thì mở thread mới có thể rẻ hơn hồi sinh thread cũ lớn.
3. **Thread không phình tới 1 triệu.** Máy của thread đặt sẵn `CLAUDE_CODE_AUTO_COMPACT_WINDOW=500000`, nên thread tự tóm tắt khi ngữ cảnh tới khoảng 400 tới 500 nghìn token. Trong lúc làm liên tục, một thread dài và nhiều thread ngắn tốn gần như nhau mỗi lần gọi: ngữ cảnh trung bình chỉ chênh khoảng 30%, nên tổng chỉ chênh khoảng 15% [suy luận từ số trên, chưa đo trực tiếp].
4. **Thread mới có giá vào cửa.** Lần gọi đầu của thread này đọc 84 nghìn token nền (hướng dẫn, danh sách công cụ), trong đó khoảng 40 nghìn phải ghi cache mới. Cộng 3 lượt khởi động và đọc lại các file cần cho việc, một thread mới tốn khoảng 1 tới 1,5 USD trước khi làm được gì [suy luận]. So với khoản đánh thức ở ý 2 (số token ngữ cảnh nhân 8 USD mỗi triệu), hai bên hòa nhau khi thread cũ có ngữ cảnh khoảng 150 nghìn token. Thread làm xong một checkpoint thường đã quá mức này: "Review sâu" lúc cuối khoảng 275 nghìn, thread này sau 17 lần gọi đã 177 nghìn.

## Ý kiến của mình
Bạn đúng là kế hoạch dài nên chia ra nhiều thread, nhưng chỗ chia không phải theo độ dài mà theo **lúc phải chờ bạn**. Tiền bị đốt nhiều nhất khi một thread lớn ngồi chờ bạn duyệt trang, chọn phương án hay merge PR qua vài giờ, rồi được gọi dậy: lúc đó cả ngữ cảnh 300 tới 500 nghìn token phải ghi lại từ đầu. Trong lúc làm liên tục thì cứ để thread tự tóm tắt, chia nhỏ hơn không lời bao nhiêu mà còn mất giá vào cửa.

Cụ thể mình đề xuất ba điều, đều dựa trên tính năng sẵn có của Claude Projects:
1. **Một thread cho một checkpoint của kế hoạch.** Checkpoint vốn là chỗ bạn kiểm bằng mắt hay bằng tay (`profile/PLANNING.md`), tức là chỗ phải chờ bạn. Xong checkpoint thì thread sửa "Đang ở đâu" của file kế hoạch và sổ bàn giao rồi báo kết quả. Bạn trả lời trong vòng 1 giờ thì thread làm tiếp checkpoint sau ngay tại chỗ, vì cache còn sống nên không tốn khoản đánh thức. Quá 1 giờ thì checkpoint sau sang thread mới, như luật 2. Đây cũng là cách tài liệu Claude Projects mô tả việc lớn: chia thành nhiều thread, mỗi thread một phần.
2. **Tin của bạn tới sau hơn 1 giờ thì sang thread mới.** Chat điều phối là chỗ quyết gửi tin vào thread nào. Khi thread đích đã nghỉ hơn 1 giờ và đã xong ít nhất một checkpoint hay một PR, chat điều phối mở thread mới đọc kế hoạch và sổ bàn giao, thay vì gửi vào thread cũ. Tin tới trong vòng 1 giờ (câu hỏi nhanh, hay bảo làm tiếp checkpoint sau) thì vẫn gửi thread cũ.
3. **Thread thôi theo dõi PR khi chỉ còn chờ bạn merge.** Thread đang theo dõi PR thức dậy mỗi lần có comment, CI hay merge, và lần thức sau hơn 1 giờ là một lần ghi lại cả ngữ cảnh. Khi CodeRabbit đã xong và PR chỉ còn chờ bạn, thread ghi "chờ merge PR #…" vào kế hoạch và thôi theo dõi. Việc dọn sau merge (tick kế hoạch, sửa STATUS) đã có luật gộp vào PR kế tiếp.

Với thread "Tiếp tục làm Sakubun" bây giờ: theo sổ bàn giao, việc U4 đang chờ bạn chọn cách tô vạch ở vòng 3. Chọn xong thì bạn nhắn ở chat điều phối của Sakubun "mở thread mới làm tiếp U4 từ sổ bàn giao", đừng trả lời vào thread 176 triệu kia. Việc này làm được ngay, không cần chờ kế hoạch được duyệt.

## Các phương án đã xét
| Phương án | Lý do mạnh nhất để không chọn |
|---|---|
| A. Giữ nguyên: một thread làm cả kế hoạch, để thread tự tóm tắt | Mỗi lần bạn quay lại sau vài giờ là một lần ghi lại 300 tới 500 nghìn token (số đo ý 2). Với cách bạn làm (duyệt trên điện thoại, cách nhau nhiều giờ), lần đánh thức xảy ra ở hầu hết checkpoint. Tóm tắt nhiều lần cũng làm mất chi tiết. |
| B. Một thread cho mỗi checkpoint, sang thread mới khi phải chờ bạn lâu (đề xuất) | Thread mới tốn khoảng 1 tới 1,5 USD vào cửa, và thread mới không nhớ những gì chưa ghi vào repo. Đỡ được vì kế hoạch, sổ bàn giao và PR đã giữ đủ; thí nghiệm 4 của nick tnt697 cho thấy chat mới không làm bản ghi thiếu ý. Còn lại: checkpoint quá ngắn (dưới khoảng 15 lần gọi) thì tách ra không lời. Luật đã tính chỗ này: bạn trả lời trong 1 giờ thì checkpoint sau làm tiếp trong cùng thread, chỉ sang thread mới khi quá 1 giờ. |
| C. Chia nhỏ hơn nữa: mỗi bước, mỗi PR nhỏ một thread | Mỗi thread trả giá vào cửa, và thí nghiệm 4 ở bản cũ cho thấy tách các bước nhỏ ra chat riêng đắt hơn làm tiếp tại chỗ. |
| D. Đặt ngưỡng tự tóm tắt thấp hơn (ví dụ 250 nghìn) bằng biến môi trường của project | Chỉ đỡ phần đọc lại khi làm liên tục, khoảng 15% [suy luận], mà tóm tắt nhiều lần làm mất chi tiết. Chưa biết biến mình đặt có thắng được biến máy đã đặt sẵn không [chưa kiểm]. Không chữa được khoản đánh thức, là khoản lớn nhất. |
| E. Dùng Sonnet 5.5 cho thread | Giá mọi loại token bằng nửa Opus 5.5, nên tiết kiệm nhiều nhất và không phải đổi quy trình. Nhưng chất lượng giao diện và kế hoạch là thứ bạn đặt lên trước tiết kiệm, và chọn model là việc của bạn (`CHATS.md`). Mình để thành câu hỏi, không đưa vào luật. |
| F. Hạ effort của thread từ "high" xuống | Phần viết ra (gồm cả phần suy nghĩ) chỉ chiếm 15 tới 18% tiền, nên tiết kiệm ít, mà dễ làm sai rồi phải làm lại. |
| G. Dùng subagent cho việc đọc nhiều | Subagent có phần nền riêng và cache chỉ sống 5 phút, chỉ lời khi phải đọc một đống dữ liệu lớn một lần (log dài). Không phải chỗ tốn của bạn. |
| H. Tự viết công cụ đo hay giới hạn số lượt | Trái nguyên tắc dùng tính năng sẵn có: trang Usage và bản ghi kết quả của thread đã đủ để đo. |

## Không làm
- Không viết lệnh hay script mới; không đổi `start-session.mjs` hay sổ bàn giao.
- Không đổi ngưỡng tự tóm tắt hay effort của project.
- Không đổi model; đó là câu hỏi 2.
- Không đụng luật của project bản cũ trong `CHATS.md`.

## Checkpoint

### 1. Sửa luật (một PR)
Xong khi: bạn đọc mục "Project bản beta" mới của `profile/CHATS.md` trên GitHub và thấy ba điều ở mục "Ý kiến của mình", kèm số đo làm căn cứ; chat điều phối ở các project beta đã biết luật số 2 (theo câu hỏi 1).
- [ ] `profile/CHATS.md` mục "Project bản beta": bỏ câu "nên không có ngưỡng", thêm ba luật và hai dòng số đo. Giữ dưới khoảng 15 dòng.
- [ ] Đưa luật số 2 tới chat điều phối theo cách bạn chọn ở câu hỏi 1.
- [ ] `docs/STATUS.md`: thêm dòng kế hoạch này vào "Kế hoạch đang chạy" (STATUS đang đủ 40 dòng, nên gộp hay bớt một dòng cũ cho vừa).

### 2. Thử ở sakubun và đo
Xong khi: bảng "Kết quả đo" có số của ít nhất 2 checkpoint làm theo luật mới, đặt cạnh số mỗi checkpoint của thread "Tiếp tục làm Sakubun"; bạn xem và thấy cách mới có rẻ hơn mỗi checkpoint không.
- [ ] Mức nền: thread đầu tiên ở project Sakubun đọc bản ghi kết quả của thread "Tiếp tục làm Sakubun" (ở project đó mới đọc được), đếm số checkpoint thread đó đã xong theo dấu tick trong kế hoạch U4, rồi chia tổng USD cho số checkpoint. Bản ghi chỉ có tổng cộng dồn sau mỗi lượt, nên chia theo checkpoint là ước lượng; không đếm được thì ghi rõ trong cột "Ghi chú" và chỉ so tổng.
- [ ] Checkpoint kế tiếp của việc U4 (sakubun) làm ở thread mới. Lúc xong, thread đọc bản ghi kết quả của chính nó và ghi: tổng token, phần ghi cache, số lần đánh thức sau hơn 1 giờ, số USD quy đổi.
- [ ] Một checkpoint nữa, bất kỳ kế hoạch nào, cũng ghi như vậy.
- [ ] Ghi số vào bảng "Kết quả đo" của file này và một dòng vào `docs/usage-log.md`.

### 3. Xem lại ở mốc 01/12
Xong khi: ở buổi xem lại chung ngày 01/12, luật được giữ, sửa hay bỏ dựa trên bảng số ở checkpoint 2.
- [ ] Gộp vào danh sách xem lại 01/12 của kế hoạch `2026-11-17-workflow-review.md`.

## Thời gian và chỗ dễ sa lầy
- Checkpoint 1: một phiên, khoảng 15 lần gọi.
- Checkpoint 2: không tốn phiên riêng, đo kèm khi làm việc thật trong khoảng một tuần.
- Dễ sa lầy: mải đo mà không làm việc thật. Mỗi thread chỉ đọc bản ghi một lần lúc xong, không đo giữa chừng.

## Câu hỏi
1. **Đưa luật số 2 tới chat điều phối bằng cách nào?** Đề xuất: (A) thêm một câu vào đoạn chuẩn setup bản beta (`profile/SETUP.md`, lên v6), bạn dán lại ở các project beta một lần; lệnh khởi động sẽ nhắc project nào còn bản cũ. Cách khác: (B) bạn nhắn câu đó ở chat điều phối của từng project, Claude tự ghi vào memory của project đó; nhanh hơn nhưng không chắc nguyên văn và không đồng bộ giữa các project.
2. **Có thử Sonnet 5.5 cho thread làm code theo kế hoạch đã duyệt không?** Đề xuất: chưa, đo checkpoint 2 với Opus trước. Nếu tuần sau vẫn hết usage giữa tuần thì thử một checkpoint bằng Sonnet.

## Kết quả đo
| Ngày | Thread | Việc | Số checkpoint | Tổng token | Ghi cache | Số lần đánh thức sau hơn 1 giờ | Quy ra USD | USD mỗi checkpoint | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|

## Nguồn (đọc 2026-11-19)
- Claude Code docs, [Projects](https://code.claude.com/docs/en/claude-projects): mục "Choose models and let Claude manage context", "What draws on your plan", "See and reduce a project's usage" (thread nghỉ quá 1 giờ đọc lại cả cuộc trò chuyện; thread theo dõi PR tự thức; mở thread mới có thể rẻ hơn hồi sinh thread lớn).
- Claude Code docs, [How Claude Code uses prompt caching](https://code.claude.com/docs/en/prompt-caching): cache theo phần đầu giống nhau, cache 1 giờ cho phiên chính trên gói Pro và Max, tóm tắt làm mất cache phần hội thoại, subagent dùng cache 5 phút.
- Claude Code docs, [Manage costs effectively](https://code.claude.com/docs/en/costs): mục "Why usage climbs in a long session" và "Reduce token usage".
- Claude Code docs, [Model configuration](https://code.claude.com/docs/en/model-config): mục "Default auto-compact thresholds".
- Anthropic, [Pricing](https://platform.claude.com/docs/en/about-claude/pricing): giá Opus 5.5 và Sonnet 5.5.
- Claude Help Center, [Understanding usage and length limits](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits).
- Số đo của mình: bản ghi kết quả của thread "Học luân phiên nhiều môn", "Review sâu và tối ưu thienai-workflow" và thread này; kế hoạch [`2026-11-15-claude-usage.md`](2026-11-15-claude-usage.md) (bản cũ, nick tnt697).
