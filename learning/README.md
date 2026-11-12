# Học nhiều môn: vòng xoay và trạng thái

File này cho biết buổi tới học môn gì. Khi thien nhắn "học" (tài khoản nào, model nào cũng vậy), AI đọc file này trước, mở buổi cho môn kế tiếp trong vòng, rồi cập nhật bảng "Trạng thái" sau buổi.

Học ở Codex hay công cụ khác Claude (ví dụ khi hết quota) thì vẫn theo file này, đọc thêm [codex.md](codex.md) cho phần khác. Trước khi mở buổi, ở công cụ nào cũng vậy, xem có PR buổi học nào chưa merge không: có thì bảng "Trạng thái" dưới đây còn thiếu buổi đó.

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
| Frontend | Môn chính, một nửa số buổi | [frontend.md](frontend.md) | Đã học 5 buổi |
| BA | Môn mở rộng | [ba.md](ba.md) | Đã học 1 buổi |
| Chiến tranh | Môn mở rộng | [war.md](war.md) | Đã học 3 buổi |

Hàng chờ: testing, kinh tế, chính trị. Tiếng Nhật đã có app sakubun nên không nằm trong vòng.

## Vòng xoay

**Frontend → BA → Frontend → Chiến tranh → lặp lại**

- Không gắn với thứ trong tuần. thien nhắn "học" thì mở buổi kế tiếp. Lỡ mấy hôm thì vòng dừng lại chờ, không có buổi nào bị nợ.
- thien muốn học môn khác vì đang hứng thú thì cứ học môn đó, vòng đi tiếp từ môn đó.
- Mục tiêu 4 buổi mỗi tuần, ít nhất 3, tối 19–23h, tối nào cũng được. Một tối tối đa 2 buổi, 2 môn khác nhau.
- Khoảng 2 tuần một lần, thay một buổi thường bằng một buổi nối hai môn (ví dụ viết một user story rồi chọn màn hình hợp với nó).

## Trạng thái

| Buổi gần nhất | Ngày | Môn | Buổi kế tiếp |
|---|---|---|---|
| Chiến tranh 3 (ba tầng, Điện Biên Phủ 26/1/1954) | 2026-11-12 | Chiến tranh | **BA 2 (hỏi chuyện người dùng)**, rồi Frontend 6, rồi Chiến tranh 4 (hậu cần). thien chọn học chiến tranh trước BA 2 nên vòng vẫn chờ ở BA 2 |

## Khung một buổi, chung cho mọi môn

1. **Ôn trộn (2 phút):** 3 thẻ đến hạn trong [cards.md](cards.md), môn nào cũng được. thien trả lời trước rồi mới lật.
2. **Nhớ lại buổi trước của môn này (1 phút):** một hình, một câu.

Hai phần ôn này chỉ dành cho lần học đầu: trong trang, bọc chúng bằng `data-part="review"`, nút đi tiếp bị khóa bởi chúng thì thêm `data-review-gate`. Học xong, lần mở sau trang tự ẩn phần ôn, chỉ còn nội dung và câu hỏi của chính bài đó (thien yêu cầu 2026-11-12). Xem "Bộ khung chung" trong [teaching/README.md](teaching/README.md).
3. **Thử trước (5–6 phút):** bấm, kéo, chọn, sắp xếp. Chưa có lý thuyết. Chọn kiểu bài trong [teaching/README.md](teaching/README.md).
4. **Hiểu sau (3 phút):** giải thích ý chính, có số liệu hoặc ví dụ cụ thể, nhắc lại đúng lựa chọn thien vừa làm.
5. **Câu hỏi nhanh (2 phút).**
6. **Tự nói lại ý chính** rồi mới xem bản của AI.
7. **Góp ý** độ dài và độ khó.

Sau buổi: ghi nhật ký vào `learning/<môn>.md`, lưu bài vào `learning/<môn>/`, thêm 2–3 thẻ vào `cards.md`, cập nhật bảng "Trạng thái" ở trên, và tick chặng trong [roadmap.md](roadmap.md) kèm link bài. Buổi học ngoài Claude thì ghi tên công cụ vào nhật ký, ví dụ "(Codex)". Xong thì mở PR để thien merge. Luật dạy chung ở `profile/TUTOR.md`.

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

- **Chủ nhật 2026-11-22:** 15 phút so sánh mù lại các màn frontend đã xem, chốt thử nghiệm frontend.
- **Chủ nhật 2026-12-13:** 15 phút làm lại câu hỏi cũ của cả 3 môn mà không xem trước, rồi quyết định giữ hay đổi môn.

Luật tự điều chỉnh:

| Dấu hiệu | Việc làm |
|---|---|
| 2 tuần liền dưới 2 buổi mỗi tuần | Bớt còn 2 môn, môn mở rộng còn lại vào hàng chờ |
| Một môn bị chấm "chán" hoặc bỏ qua 3 lần | Đổi kiểu buổi của môn đó; vẫn chán thì đổi môn |
| Thẻ ôn của một môn sai quá nửa | Buổi kế của môn đó là buổi ôn, chưa sang ý mới |
| Có việc gấp cần một môn (đồ án, bài lab) | Mở đợt ngắn 1–2 tuần cho môn đó, vòng xoay dừng lại chờ |
| 4 tuần liền đều 5 buổi mỗi tuần | Có thể thêm môn thứ 4 |
