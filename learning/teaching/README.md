# Dạy học trực quan: nghiên cứu và cách áp dụng

Kết quả nghiên cứu ngày 2026-11-12 (thread "Nâng cấp cách dạy học trực quan"), để mọi buổi học sau, ở tài khoản hay model nào, dạy theo cùng một cách.

**Kết luận ngắn:** hình và hoạt họa không tự làm học tốt hơn. Thứ giúp nhớ lâu là **mỗi lần bấm bắt người học phải nghĩ**: đoán trước, tự điều khiển một biến và thấy kết quả ngay, tự sắp xếp, tự tìm lỗi. Hình chỉ có ích khi nó là chính nội dung cần học. Hoạt họa chỉ có ích khi nội dung vốn chuyển động, và người học phải tự dừng, tự tua được.

- Trang mẫu 8 kiểu bài, làm thử được: [`patterns.html`](patterns.html)
- Bài kiểm tự động trước khi gửi trang: [`check-page.cjs`](check-page.cjs)

## Nghiên cứu nói gì

| Điều | Bằng chứng | Áp vào bài |
|---|---|---|
| Hoạt họa chỉ hơn hình tĩnh một chút | Tổng hợp 61 thí nghiệm, hơn 7.000 người: mức hơn nhỏ, g = 0,23 ([Berney và Bétrancourt, 2016](https://tecfa.unige.ch/perso/sandra/pdf/Earli2016_berney_betrancourt_FINAL.pdf)) | Không mặc định làm hoạt họa |
| Hoạt họa có ích khi nó *là* nội dung | Hoạt họa thể hiện đúng thứ cần học hơn hình tĩnh, d = 0,40; hoạt họa trang trí thì không hơn, d = -0,05 ([Höffler và Leutner, 2007](https://www.sciencedirect.com/science/article/abs/pii/S0959475207001077)) | Chỉ cho chuyển động với luồng, quá trình, trận đánh |
| Chi tiết hấp dẫn mà lạc đề làm học kém đi | Tổng hợp 39 thí nghiệm: nhớ kém đi ở mức nhỏ tới vừa, áp dụng kém đi ở mức vừa ([Rey, 2012](https://www.sciencedirect.com/science/article/abs/pii/S1747938X12000413)) | Bỏ hình minh hoạ chỉ để đẹp, bỏ chuyện bên lề |
| Cách người học dùng hình quan trọng hơn hình đẹp cỡ nào | Tổng hợp 24 nghiên cứu về hình minh hoạ thuật toán ([Hundhausen và cộng sự, 2002](https://www.sciencedirect.com/science/article/abs/pii/S1045926X02902375)) | Mỗi hình phải đi kèm một việc phải làm với nó |
| Tự tạo ra thứ gì đó học sâu hơn chỉ bấm theo | Khung ICAP: cùng nhau tạo ra > tự tạo ra > làm theo > chỉ xem ([Chi và Wylie, 2014](https://education.asu.edu/sites/g/files/litvpz656/files/lcl/chiwylie2014icap_2.pdf)) | Bấm "Tiếp" không tính là tương tác. Phải đoán, chọn, xếp, giải thích |
| Đoán trước khi học, kể cả đoán sai, giúp nhớ hơn | Tổng quan về hỏi trước khi học ([Pan và Carpenter, 2023](https://link.springer.com/article/10.1007/s10648-023-09814-5)) | Mở bài bằng một câu đoán |
| Thử giải trước rồi mới được giảng | Tổng hợp: hơn ở mức vừa, g = 0,36; lên 0,37–0,58 khi lời giảng dựa vào chính lời giải của người học ([Sinha và Kapur, 2021](https://eric.ed.gov/?id=EJ1308129)) | Giải thích phải nhắc tới lựa chọn người học vừa làm |
| Chia nhỏ, người học tự bấm qua | Tổng hợp 56 nghiên cứu: hơn ở mức nhỏ tới vừa ([Rey và cộng sự, 2019](https://maria-wirzberger.de/wp-content/uploads/2019/01/Rey2019_Article_AMeta-analysisOfTheSegmentingE.pdf)) | Sơ đồ hiện từng bước, có nút lùi |
| Tô nổi đúng chỗ đang nói | Tổng hợp 103 nghiên cứu: nhớ hơn g = 0,53, áp dụng hơn g = 0,33 ([Schneider và cộng sự, 2018](https://www.sciencedirect.com/science/article/abs/pii/S1747938X17300581)) | Một màu nhấn cho thứ đang nói tới |
| Đi từ thứ thật tới ký hiệu một cách từ từ | Tổng quan về "concreteness fading" trong toán và khoa học ([Fyfe và cộng sự, 2014](https://www.researchgate.net/publication/262943993_Concreteness_Fading_in_Mathematics_and_Science_Instruction_A_Systematic_Review)) | Màn thật → khối → code, cùng màu nối ba mức |
| Tự vẽ, tự giải thích | 8 cách học có hiệu quả rõ, trong đó có vẽ và tự giải thích ([Fiorella và Mayer, 2016](https://bootcampmilitaryfitnessinstitute.com/wp-content/uploads/2016/01/eight-ways-to-promote-generative-learning-fiorella-mayer-2015.pdf)) | Cuối buổi tự nói lại; kiểu bài vẽ dự đoán |
| Mô phỏng giúp học khoa học | Tổng hợp 59 nghiên cứu: có lợi so với không dùng mô phỏng ([D'Angelo và cộng sự, 2014](https://www.sri.com/wp-content/uploads/2021/12/simulations-for-stem-learning-full-report.pdf)) | Dùng cho môn có hệ thống chạy được (chiến tranh, kinh tế) |

Một điều đi ngược trực giác: hoạt họa *tự chạy* lại hơn hoạt họa người học điều khiển trong tổng hợp của Berney và Bétrancourt. Nhưng tổng hợp về chia đoạn của Rey cho thấy chia nhỏ có lợi. Cách mình hiểu: cho chạy một đoạn ngắn có chủ đích, nhưng luôn có nút dừng và thanh thời gian để xem lại. Điều này chưa chắc, cần xem lại sau vài buổi.

## Học được gì từ các mô hình tiêu biểu

**Brilliant** (nguồn: [cách Brilliant vào một tiết học](https://brilliant.org/help/schools-and-educators/how-brilliant-fits-into-a-math-lesson/), [blog về cách họ làm bài](https://blog.brilliant.org/hand-crafted-machine-made/), [Peter Cho, trưởng thiết kế](https://uxdesign.cc/the-key-to-learning-math-and-science-online-is-interactive-play-6ea68ce167fe))

- Một bài 5–10 phút, khoảng 5 bài tương tác rồi 3 câu kiểm. Khớp với buổi 15 phút của mình.
- **Mô hình trực quan trước, ký hiệu sau.** Ví dụ: cái cân thăng bằng trước, phương trình sau. Đây đúng là điều bạn thích.
- **Thấy hậu quả thay vì đọc lời chê.** Họ lấy ví dụ Mario: nhảy sớm thì rơi xuống hố, không có hộp chữ "bạn nhảy sớm quá". Sai thì cho thấy chuyện gì xảy ra với lựa chọn đó.
- Mỗi ý cần khoảng 20 bài, độ khó tăng dần và có cả trường hợp đặc biệt. Mình không làm nổi 20 bài mỗi ý, nhưng thẻ ôn và phần trộn ý cũ bù một phần.
- 4 "tự do" lấy từ game: tự do thử, tự do sai, tự do thử vai, tự do chọn mức cố gắng (xin gợi ý, xem đáp án).
- Phần mình **không** học theo: các hoạt họa mừng chuỗi ngày học, huy hiệu. Chúng giữ chân người dùng, không làm hiểu sâu hơn.

**Nicky Case** ([cách làm một bài giải thích chơi được](https://blog.ncase.me/how-i-make-an-explorable-explanation/)): mở bằng một câu hỏi khiến người học tò mò, bắt đầu bằng trải nghiệm cụ thể rồi leo dần lên ý trừu tượng, nối các bước bằng "nhưng" và "vì vậy" thay vì "rồi thì", kết thúc bằng một sân chơi tự do để người học tự hỏi câu của mình.

**Bret Victor** ([lên xuống thang trừu tượng](http://worrydream.com/LadderOfAbstraction/)): cho người học điều khiển một biến (thời gian, một tham số), rồi đưa lên một hình tóm tắt mọi giá trị, rồi cho chạm vào hình tóm tắt để quay xuống một trường hợp cụ thể. Hiểu nảy ra ở chỗ đi lên đi xuống.

**Josh Comeau** ([hướng dẫn Flexbox tương tác](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/)): mỗi khái niệm CSS đi kèm một ô chỉnh được ngay trong bài; dùng ẩn dụ bằng hình (xiên thịt cho trục chính); trước khi đổi một thuộc tính thì hỏi "bạn nghĩ chuyện gì sẽ xảy ra?". Mẫu tốt nhất cho môn frontend.

**PhET** ([nghiên cứu của Đại học Colorado](https://www.per-central.org/items/detail.cfm?ID=16318)): dẫn dắt mà người học không thấy bị dẫn. Không viết hướng dẫn dài, mà giới hạn những gì bấm được và cho phản hồi bằng hình, nên người học tự đi đúng hướng.

## 8 kiểu bài

Đều có trong [`patterns.html`](patterns.html), mỗi kiểu một ví dụ thật. Khi soạn buổi, chép phần HTML, CSS và JS của kiểu đó rồi thay nội dung.

| Kiểu | Hợp với | Ví dụ trong trang mẫu |
|---|---|---|
| 1. Đoán rồi xem | Quy tắc hay bị làm theo cảm tính | Tách hai nhóm cài đặt: kẻ đường, đổi màu hay thêm khoảng trống |
| 2. Kéo thanh trượt, thấy đổi ngay | Một con số, tỉ lệ, công thức khô khan | Độ tương phản 4.5:1 |
| 3. Từ hình thật tới ký hiệu | Ký hiệu, công thức, đoạn code | Thẻ hồ sơ → khối → CSS `gap` |
| 4. Sơ đồ hiện từng bước | Luồng, chuỗi nguyên nhân, quy trình | Hỏi "để làm gì" tới vấn đề thật |
| 5. Xếp thứ tự bằng cách chạm | Quy trình, trình tự sự kiện | Các bước xử lý một lời nhờ của khách |
| 6. Làm chỉ huy rồi xem chuyện thật | Lịch sử, chiến tranh, chuyện diễn ra theo thời gian | Trận Cannae, kéo thời gian từng giai đoạn |
| 7. Chạm vào chỗ sai | Luyện mắt bắt lỗi | Ba nút cùng màu trên màn sản phẩm |
| 8. Vẽ dự đoán rồi so | Số liệu thật | Đường quên của Ebbinghaus |

Gợi ý cho từng môn:

| Môn | Kiểu nên dùng nhiều |
|---|---|
| Frontend | 1, 2, 3, 7. Mỗi khái niệm CSS nên có một ô chỉnh được như Josh Comeau |
| BA | 4, 5, 7 (tìm chỗ thiếu trong user story), và đóng vai phỏng vấn |
| Chiến tranh | 6, 5 (xếp sự kiện vào dòng thời gian), 8 (quân số, thương vong) |
| Testing, kinh tế, chính trị (hàng chờ) | 2 và 8 cho kinh tế; 7 cho testing |

## Đặt vào khung buổi học

Khung 7 bước trong [`../README.md`](../README.md) giữ nguyên. Thay đổi:

- **Bước "Thử trước"** dùng kiểu 1, 2, 5, 6, 7 hoặc 8. Câu đoán phải có trước khi hiện bất cứ lời giải thích nào.
- **Bước "Hiểu sau"** dùng kiểu 3 hoặc 4, và câu giải thích nhắc lại đúng lựa chọn người học vừa làm ("bạn chọn kẻ đường, nên…").
- Mỗi buổi tối đa 2 kiểu, để không phải học cách dùng giao diện thay vì học nội dung.
- Thanh trượt, bản đồ, biểu đồ phải có chữ đi kèm nói kết quả, không chỉ đổi màu.

## Kiểm trước khi gửi trang

1. Chạy `node learning/teaching/check-page.cjs <trang.html>`. Nó mở trang ở khổ iPhone 13 và laptop 1366px, rồi báo lỗi khi: có lỗi JavaScript, trang tràn ngang, vùng bấm nhỏ hơn 24px, hoặc bấm một nút mà ảnh chụp màn hình trước và sau giống hệt nhau (lỗi của buổi BA 1). Trang nhiều bước thì các bước bị giấu sẽ được hiện ra để kiểm (mặc định lớp `.step`, đổi bằng `--show=<selector>`).
2. Xem bằng mắt ảnh chụp cả hai khổ mà nó lưu lại.
3. Tự làm bài một lượt trên khổ điện thoại, kể cả chọn sai.

Bài kiểm không bắt được: nội dung sai, chữ khó hiểu, thao tác kéo trên biểu đồ. Nó cũng chỉ bấm các nút có sẵn lúc mới mở trang, mỗi nút trên một trang vừa tải lại, nên bỏ qua nút đang được chọn, nút bị khóa lúc đầu (như "Kiểm tra" khi chưa xếp xong) và nút chỉ có tác dụng sau một bước khác (như "Làm lại"; gắn thuộc tính `data-reset` cho loại nút này để bài kiểm bỏ qua, không báo nhầm). Trang có hiệu ứng chạy liên tục thì ảnh trước và sau luôn khác nhau, nên nút hỏng trên trang đó cũng lọt qua. Những thứ đó vẫn phải tự bấm thử trên cả khổ điện thoại lẫn laptop.

## Chưa chắc, cần xem lại

- Trang mẫu mới được AI dựng và kiểm, chưa được bạn học thật. Buổi Frontend 5 (màu) là buổi đầu dùng các kiểu này.
- Hầu hết nghiên cứu ở trên làm với học sinh, sinh viên và bài khoa học; áp vào BA hay chiến tranh là suy luận.
- Ở mốc 2026-12-13, so số câu nhớ được giữa các buổi kiểu cũ và kiểu mới. Ít buổi nên chỉ coi là dấu hiệu.
