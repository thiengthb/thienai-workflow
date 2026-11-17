# Học nhiều môn: vòng xoay và trạng thái

File này cho biết buổi tới học môn gì. Khi thien nhắn "học" (nick nào, model nào cũng vậy), AI chạy `artifacts/lesson/prepare-lesson.mjs`: gói buổi in buổi kế tiếp, khung một buổi và phần cần của file này, nên không phải đọc cả file. Mở file này khi sửa nó (sau buổi) hay khi gói ghi "chưa kiểm".

thien chỉ học bằng Claude (từ 2026-11-15, vì chỉ trang học artifact của Claude vừa ý), nên luồng học không còn phần cho Codex hay công cụ khác. Gói buổi có in nhánh chưa merge đụng môn đó (tự chạy `node templates/check-open-work.mjs learning/`): nhánh nào chưa merge mà có buổi học thì bảng "Trạng thái" dưới đây còn thiếu buổi đó, đọc nhánh đó trước. `make-lesson.mjs` tự kiểm việc này cho môn của trang và dừng nếu có nhánh chưa merge sửa bài của môn đó (sau lỗi 2026-11-13: dựng lại bài chiến tranh 4 trong khi PR #44 đã có).

Kế hoạch đầy đủ và lý do nằm ở tài liệu "Kế hoạch học nhiều lĩnh vực song song" (https://claude.ai/artifact/QJwWL3z4pTjZerq5U3Fb9G), thien đồng ý ngày 2026-11-12.

## Vì sao học kiểu này

- Trộn các môn không liên quan trong cùng một buổi không làm học tốt hơn. Học xen kẽ chỉ có lợi khi các thứ được trộn giống nhau và dễ nhầm ([Brunmair và Richter, 2019](https://pubmed.ncbi.nlm.nih.gov/31556629/)). Nên chỉ trộn bên trong một môn.
- Lợi ích thật của xoay vòng là mỗi môn được học cách quãng vài ngày. Muốn nhớ vài tuần thì khoảng cách tốt nhất giữa hai lần học là khoảng 20% thời gian đó ([Cepeda và cộng sự, 2008](https://eric.ed.gov/?id=ED505660)).
- Tự trả lời câu hỏi giúp nhớ tốt hơn đọc lại ([Adesope và cộng sự, 2017](https://journals.sagepub.com/doi/10.3102/0034654316689306)). Nên phần trộn nhiều môn là 3 câu ôn đầu buổi.
- Đổi việc giữa chừng thì đầu óc còn vướng việc cũ ([Leroy, 2009](https://www.sciencedirect.com/science/article/pii/S0749597809000399)). Nên một buổi chỉ một môn.

## Môn đang học

Tối đa 3 môn cùng lúc. Thêm một môn thì phải cho một môn nghỉ.

| Môn | Vai | File môn | Trạng thái |
|---|---|---|---|
| Frontend | Môn chính, một nửa số buổi | [frontend.md](frontend.md) | Đã học 8 buổi |
| BA | Môn mở rộng | [ba.md](ba.md) | Đã học 4 buổi |
| Chiến tranh | Môn mở rộng | [war.md](war.md) | Đã học 5 buổi |

Hàng chờ: testing, kinh tế, chính trị. Tiếng Nhật đã có app sakubun nên không nằm trong vòng.

**TikTok học ở project riêng, không nằm trong vòng.** Bài học TikTok chỉ do repo [tiktok](https://github.com/thiengthb/tiktok) soạn (xem `learning/README.md` bên đó). Ở đây không soạn bài TikTok, không tính TikTok vào giới hạn 3 môn. Khi thien nhắn "học", AI ở đây mở `learning/README.md` của repo tiktok, xem bảng "Trạng thái": nếu tuần này chưa đủ số buổi TikTok ghi ở đó, nhắc thien một dòng "Đến lịch học TikTok, mở project Tiktok để học", rồi vẫn mở buổi kế tiếp của vòng như thường (thien chốt 2026-11-12).

## Vòng xoay

**Frontend → BA → Frontend → Chiến tranh → lặp lại**

- Không gắn với thứ trong tuần. thien nhắn "học" thì mở buổi kế tiếp. Lỡ mấy hôm thì vòng dừng lại chờ, không có buổi nào bị nợ.
- thien muốn học môn khác vì đang hứng thú thì cứ học môn đó, vòng đi tiếp từ môn đó.
- Mục tiêu 4 buổi mỗi tuần, ít nhất 3, tối 19–23h, tối nào cũng được. Một tối tối đa 2 buổi, 2 môn khác nhau.
- Khoảng 2 tuần một lần, thay một buổi thường bằng một buổi nối hai môn (ví dụ viết một user story rồi chọn màn hình hợp với nó).

## Trạng thái

Bảng học tuần (số buổi mỗi tuần, thẻ đến hạn, chỗ còn vướng): https://claude.ai/artifact/LijnAF7tSR4gBMrspPuQtV. AI làm mới số liệu mỗi Chủ nhật, cách làm trong [`artifacts/lesson/README.md`](../artifacts/lesson/README.md).

| Buổi gần nhất | Ngày | Môn | Buổi kế tiếp |
|---|---|---|---|
| Frontend 9 (buổi mốc, so sánh mù) | 2026-11-17 | Frontend | **Chiến tranh 7**, rồi BA 5 |

## Khung một buổi, chung cho mọi môn

1. **Ôn trộn (2 phút):** 3 thẻ đến hạn trong [cards.md](cards.md), môn nào cũng được; thiếu thẻ đến hạn thì thêm thẻ hạn sớm nhất của môn khác. thien trả lời trước rồi mới lật. Các thẻ đến hạn còn lại ôn ở [trang ôn thẻ](https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu) lúc nào cũng được, không chờ buổi học: trước khi mở buổi, AI dựng lại trang đó từ `cards.md` và ghi kết quả ôn lần trước (xem [`artifacts/review/`](../artifacts/review/README.md)). Trên trang học, phần này do `make-lesson.mjs` tự sinh từ `cards.md` và câu trắc nghiệm của từng thẻ trong [cards-quiz.json](cards-quiz.json) (thien chọn giữ trắc nghiệm, 2026-11-17); thẻ chưa có câu thì lệnh dừng và in dòng cần thêm.
2. **Nhớ lại buổi trước của môn này (1 phút):** một hình, một câu.

Hai phần ôn này chỉ dành cho lần học đầu: trong trang, bọc chúng bằng `data-part="review"`, nút đi tiếp bị khóa bởi chúng thì thêm `data-review-gate`. Học xong, lần mở sau trang tự ẩn phần ôn, chỉ còn nội dung và câu hỏi của chính bài đó (thien yêu cầu 2026-11-12). Xem "Bộ khung chung" trong [teaching/README.md](teaching/README.md).
3. **Thử trước (5–6 phút):** bấm, kéo, chọn, sắp xếp. Chưa có lý thuyết. Ý hoàn toàn mới (thien chưa biết hay chỉ "nghe qua", xem hồ sơ môn) thì mở bằng một đoạn giới thiệu khoảng 1 phút: nó là gì, một ví dụ, việc sắp làm; chưa giải thích vì sao (thien xin sau BA 4, 2026-11-17: vào thử ngay một thứ chưa biết thì ngượng, không biết phải làm gì). Chọn kiểu bài trong [teaching/README.md](teaching/README.md).
4. **Hiểu sau (3 phút):** giải thích ý chính, có số liệu hoặc ví dụ cụ thể, nhắc lại đúng lựa chọn thien vừa làm.
5. **Câu hỏi nhanh (2 phút).**
6. **Tự nói lại ý chính** rồi mới xem bản của AI. Đề là một tình huống cụ thể: một người hỏi về chính màn hay tình huống vừa làm, thien trả lời người đó (thien chọn 2026-11-17, cách viết ở `artifacts/lesson/README.md`). Đừng hỏi chung chung.
7. **Góp ý** độ dài và độ khó.

Trang dựng từ mẫu `artifacts/lesson/`: bấm "Xong buổi học" là kết quả được lưu và gửi cho Claude.

**Sau buổi**, theo thứ tự:
1. Đọc kết quả trong db của trang (`sessions/<id>-<thời điểm>`; lấy slug bằng `get_artifact`, đừng đọc cả trang vì nguồn trang đã có trong repo), lưu ra file JSON, rồi chạy `node artifacts/lesson/after-lesson.mjs <file.json> --write`. Lệnh in nháp (số liệu, dòng nhật ký, chỗ còn vướng, thẻ mới, dòng "Trạng thái") và tự ghi: các dòng mới vào mục "Chỗ còn vướng" của `learning/<môn>.md` (câu ôn sai của thẻ môn khác thì vào file của môn đó), dòng nhật ký nháp, một dòng vào [usage.md](usage.md), và kết quả 3 thẻ ôn đầu buổi vào cột Hộp, Hỏi lại của `cards.md`. File môn chỉ giữ 3 dòng nhật ký gần nhất: dòng cũ hơn lệnh tự chuyển sang `learning/<môn>/log.md`, file AI không đọc mỗi buổi.
2. Từ nháp, viết: phần `<…>` của dòng nhật ký trong `learning/<môn>.md` (chỗ thien đổi cách nhìn, không ghi như bảng điểm), file bài trong `learning/<môn>/lessons/`, 2–3 thẻ trong `cards.md`, mỗi thẻ kèm một câu trắc nghiệm trong `cards-quiz.json` (2–3 lựa chọn, lời giải thích lấy từ bài), bảng "Trạng thái" ở trên, tick chặng trong [roadmap.md](roadmap.md) kèm link bài, mục "Buổi tiếp theo". Góp ý của thien trong buổi đi tới file đích (bảng "Góp ý của thien đi đâu" trong `profile/MAP.md`): file bài có dòng `Từ mới: a, b` (hay `Từ mới: không có`), từ nào chưa có thì thêm vào [glossary.md](glossary.md); câu gu của buổi frontend (nháp in sẵn) chép vào [frontend/taste-queue.md](frontend/taste-queue.md), 2 tuần một lần gom thành một PR vào thienui. Đọc lại mục "Chỗ còn vướng": gọn lại (tối đa 6 dòng), xóa dòng thien đã làm đúng ở buổi này.
3. `node artifacts/lesson/after-lesson.mjs --check <lesson-id>` phải ra toàn ✓, rồi mở PR để thien merge. CI chạy `--check-all` để bài nào cũng có nhật ký, thẻ và roadmap, và file môn nào cũng gọn (tối đa 3 dòng nhật ký, 6 dòng chỗ còn vướng).

Trang không lưu được vào db thì dán kết quả thien chép (nút "Chép kết quả") vào file JSON (phần trong khối json của tin nhắn). Luật dạy chung ở `profile/TUTOR.md`.

**Chỗ còn vướng** ở cuối mỗi file môn là cầu nối giữa các buổi: AI dùng nó cho phần "Nhớ lại" và "Thử trước" của buổi sau, và `make-lesson.mjs` đưa 6 dòng mới nhất vào trang để Claude trong trang biết khi thien hỏi hay nhờ nhận xét.

## Bắt đầu một môn mới

0. **Tìm cách dạy hợp với môn, trước buổi làm quen.** AI tự làm, thien không cần nhắc. Tìm xem người dạy giỏi và nghiên cứu về dạy môn đó làm thế nào: môn này hiểu bằng hình gì (kinh tế dùng đồ thị cung cầu, ngôn ngữ dùng nghe và nhắc lại, luật dùng tình huống thật), người mới hay hiểu sai ở đâu, nên luyện kiểu gì. Ghi kết quả vào mục "Cách dạy môn này" trong `learning/<môn>.md`, có nguồn, không quá một màn hình. Đối chiếu với 8 kiểu bài trong [teaching/README.md](teaching/README.md): kiểu nào hợp thì dùng, môn cần kiểu mới thì dựng thêm vào `teaching/patterns.html` và bảng gợi ý theo môn. Môn đang học mà chưa có mục này thì làm trước buổi kế tiếp của môn đó.
1. **Buổi làm quen (10 phút):** nói thien nghe 2–3 dòng về cách sẽ dạy môn này và vì sao. hỏi thien đã biết gì và muốn dùng môn này để làm gì. Đưa ra **bản đồ 10 ý lớn** ở mức người mới, là những điều cần biết để nói chuyện được với dân trong nghề, không phải mục lục giáo trình. thien sắp thứ tự theo ý thích. Tạo `learning/<môn>.md` theo khung của `frontend.md`.
2. **10 buổi đầu:** mỗi buổi một ý trên bản đồ. Từ buổi thứ 4, phần thử trước trộn các ý đã học với nhau.
3. **Sau khoảng 10 buổi:** thien quyết định đào sâu, giữ ở mức ôn, hay cho môn nghỉ để môn trong hàng chờ lên.

Gợi ý phần "thử trước" cho từng môn (AI đề xuất, chưa thử với BA và chiến tranh):

| Môn | Phần thử trước |
|---|---|
| Frontend | Chọn bản sửa, tìm chỗ khác, tự chỉnh trên màn và thấy đổi ngay |
| BA | Kéo thẻ yêu cầu vào nhóm, tìm chỗ thiếu trong user story, sắp các bước thành luồng |
| Chiến tranh | Làm chỉ huy trên bản đồ trận đánh có thật: chọn nước đi, rồi xem chuyện thật đã xảy ra; kéo sự kiện vào dòng thời gian |
| Testing | Đoán test nào bắt được lỗi, bấm thử một màn có lỗi giấu sẵn để tìm lỗi |

## Mốc kiểm tra

AI tự nhắc khi tới mốc, thien không cần nhớ.

- **Chủ nhật 2026-11-22:** 15 phút so sánh mù lại các màn frontend đã xem, chốt thử nghiệm frontend. Đã làm sớm ở buổi Frontend 9 (2026-11-17): không cần làm lại, tới ngày đó chỉ xem chặng 2 đã bắt đầu chưa.
- **Chủ nhật 2026-12-13:** 15 phút làm lại câu hỏi cũ của cả 3 môn mà không xem trước, rồi quyết định giữ hay đổi môn. Cùng lúc xem `node artifacts/kit/usage.mjs learning/usage.md`: tính năng nào của trang gần như không dùng (hỏi Claude, nói thay gõ…) thì hỏi thien trước khi bỏ: có thấy nút đó không, có hiểu nó làm gì không. Ít bấm có thể vì khó tìm (làm rõ nút), vì đang lỗi (sửa), hay vì thien không cần (lúc đó mới bỏ).

Luật tự điều chỉnh:

| Dấu hiệu | Việc làm |
|---|---|
| 2 tuần liền dưới 2 buổi mỗi tuần | Bớt còn 2 môn, môn mở rộng còn lại vào hàng chờ |
| Một môn bị chấm "chán" hoặc bỏ qua 3 lần | Đổi kiểu buổi của môn đó; vẫn chán thì đổi môn |
| Thẻ ôn của một môn sai quá nửa | Buổi kế của môn đó là buổi ôn, chưa sang ý mới |
| Có việc gấp cần một môn (đồ án, bài lab) | Mở đợt ngắn 1–2 tuần cho môn đó, vòng xoay dừng lại chờ |
| 4 tuần liền đều 5 buổi mỗi tuần | Có thể thêm môn thứ 4 |
