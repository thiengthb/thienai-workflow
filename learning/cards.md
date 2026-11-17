# Thẻ ôn của mọi môn

Đầu mỗi buổi, AI lấy 3 thẻ đến hạn (cột "Hỏi lại" là hôm nay hoặc đã qua), ưu tiên thẻ quá hạn lâu nhất, môn nào cũng được. thien trả lời trước, rồi mới xem đáp án trong file bài.

Sau khi hỏi, sửa hai cột cuối (buổi học: `artifacts/lesson/after-lesson.mjs --write` tự sửa; trang ôn thẻ: `apply-review.mjs`):
- Trả lời đúng: lên một hộp. Hộp 1 hỏi lại sau 1 ngày, hộp 2 sau 3 ngày, hộp 3 sau 1 tuần, hộp 4 sau 2 tuần, hộp 5 sau 1 tháng.
- Trả lời sai hoặc quên: về hộp 1.

Sau mỗi buổi, AI thêm 2–3 thẻ mới từ buổi đó, bắt đầu ở hộp 1, mỗi thẻ kèm một câu trắc nghiệm trong [cards-quiz.json](cards-quiz.json) để trang buổi sau tự sinh phần ôn.

Ôn ngoài buổi học: [trang ôn thẻ](https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu) hiện các thẻ đến hạn. Kết quả ôn ở đó ghi vào bảng này bằng `node artifacts/review/apply-review.mjs` (xem [`artifacts/review/`](../artifacts/review/README.md)). Giữ đúng các cột của bảng, vì script đọc theo tên cột.

| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |
|---|---|---|---|---|---|
| F1 | Frontend | Hai nút cùng cỡ, cùng màu đặt cạnh nhau thì sao? | [bài 1](frontend/lessons/01-one-focal-point.md) | 3 | 2026-11-24 |
| F2 | Frontend | Muốn nút chính nổi hơn mà không thêm màu mới thì làm gì? | [bài 1](frontend/lessons/01-one-focal-point.md) | 3 | 2026-11-24 |
| F3 | Frontend | Ngoài cỡ chữ, màu và thứ tự, còn hai cách nào để tạo bậc chữ? | [bài 2](frontend/lessons/02-type-hierarchy.md) | 3 | 2026-11-24 |
| F4 | Frontend | Trong nhóm các dòng cách nhau 8px. Giữa hai nhóm nên bao nhiêu? | [bài 3](frontend/lessons/03-spacing-groups.md) | 3 | 2026-11-24 |
| F5 | Frontend | Vì sao nhiều design system chỉ cho dùng 4, 8, 12, 16, 24, 32? | [bài 3](frontend/lessons/03-spacing-groups.md) | 3 | 2026-11-24 |
| F6 | Frontend | Màn thanh toán có hai nút đặc "Thanh toán" và "Thêm mã giảm giá". Sửa thế nào? | [bài 4](frontend/lessons/04-fix-a-whole-screen.md) | 3 | 2026-11-24 |
| B1 | BA | Khách nhờ "thêm nút xuất Excel". Câu nào nên hỏi đầu tiên? | [BA bài 1](ba/lessons/01-requests-vs-needs.md) | 3 | 2026-11-24 |
| B2 | BA | "Thêm thông báo đẩy lúc 8 giờ tối" là nhu cầu hay giải pháp? | [BA bài 1](ba/lessons/01-requests-vs-needs.md) | 1 | 2026-11-16 |
| B3 | BA | Vì sao không nên làm ngay đúng thứ được nhờ? | [BA bài 1](ba/lessons/01-requests-vs-needs.md) | 2 | 2026-11-19 |
| F7 | Frontend | Thanh đầu trang cùng màu đặc với nút chính thì sao? | [bài 5](frontend/lessons/05-one-accent-colour.md) | 3 | 2026-11-24 |
| F8 | Frontend | Thẻ trạng thái "Đã thanh toán" nên đặc hay nhạt, vì sao? | [bài 5](frontend/lessons/05-one-accent-colour.md) | 2 | 2026-11-18 |
| W4 | Chiến tranh | Theo Tống sử, vì sao Quách Quỳ rút quân năm 1077? | [bài 2](war/lessons/02-ly-song-war-1075-1077.md) | 3 | 2026-11-24 |
| W5 | Chiến tranh | Quảng Nguyên về lại với Đại Việt bằng cách nào? | [bài 2](war/lessons/02-ly-song-war-1075-1077.md) | 2 | 2026-11-19 |
| W6 | Chiến tranh | Thắng trận và đạt mục tiêu chính trị khác nhau thế nào? Cho một ví dụ. | [bài 2](war/lessons/02-ly-song-war-1075-1077.md) | 2 | 2026-11-20 |
| W7 | Chiến tranh | Phá Khâm, Liêm rồi vây thành Ung hơn 40 ngày là tầng chiến lược, chiến dịch hay chiến thuật? | [bài 3](war/lessons/03-three-levels-dien-bien-phu.md) | 2 | 2026-11-20 |
| W8 | Chiến tranh | Vì sao Đại tướng Võ Nguyên Giáp hoãn trận đánh Điện Biên Phủ ngày 26/1/1954? | [bài 3](war/lessons/03-three-levels-dien-bien-phu.md) | 2 | 2026-11-18 |
| W9 | Chiến tranh | Vì sao "hoãn vài ngày rồi đánh theo kế hoạch cũ" vẫn chưa đủ? | [bài 3](war/lessons/03-three-levels-dien-bien-phu.md) | 2 | 2026-11-20 |
| W10 | Chiến tranh | Khi đổi sang "đánh chắc tiến chắc", đạn và gạo tăng bao nhiêu lần? Thứ nào tăng mạnh hơn, vì sao? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 2 | 2026-11-17 |
| W12 | Chiến tranh | Gánh bộ đường xa, để 1 kg gạo tới mặt trận thì dọc đường ăn mất bao nhiêu? Xe đạp thồ giảm con số đó bằng cách nào? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 2 | 2026-11-18 |
| W13 | Chiến tranh | Chỉ huy Pháp tính sai điều gì về hậu cần của bên ta ở Điện Biên Phủ? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 2 | 2026-11-20 |
| W14 | Chiến tranh | Ở ải Chi Lăng năm 1427, lòng ải hẹp làm đạo quân đông của Liễu Thăng bất lợi ở điểm nào? | [bài 5](war/lessons/05-terrain-chi-lang-1427.md) | 1 | 2026-11-16 |
| W15 | Chiến tranh | Vì sao chỉ có địa hình hiểm thôi thì chưa đủ để thắng ở Chi Lăng? | [bài 5](war/lessons/05-terrain-chi-lang-1427.md) | 1 | 2026-11-16 |
| W16 | Chiến tranh | Ở Xương Giang có mưa to gió lớn. Vì sao trận mưa đè nặng lên quân Minh hơn quân ta? | [bài 5](war/lessons/05-terrain-chi-lang-1427.md) | 1 | 2026-11-16 |
| W11 | Chiến tranh | Vì sao hậu cần Điện Biên Phủ không dồn hết vào xe ô tô? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 2 | 2026-11-20 |
| F9 | Frontend | Ngoài khối màu to, hai thứ nhỏ nào cũng hay giành mắt mà dễ bị bỏ sót? | [bài 5](frontend/lessons/05-one-accent-colour.md) | 2 | 2026-11-18 |
| W1 | Chiến tranh | Theo Toàn thư, vì sao thuyền Nam Hán bị lật ở Bạch Đằng năm 938? | [bài 1](war/lessons/01-bach-dang-938.md) | 2 | 2026-11-20 |
| W2 | Chiến tranh | Vì sao Ngô Quyền không đem thuyền ra chặn thẳng ở cửa biển? | [bài 1](war/lessons/01-bach-dang-938.md) | 2 | 2026-11-18 |
| W3 | Chiến tranh | Toàn thư và sử Trung Quốc chép khác nhau thế nào về cái chết của Hoằng Tháo? | [bài 1](war/lessons/01-bach-dang-938.md) | 2 | 2026-11-20 |
| W17 | Chiến tranh | Him Lam là cụm rất kiên cố. Vì sao Đại tướng Võ Nguyên Giáp vẫn chọn đánh nó đầu tiên ở Điện Biên Phủ? | [bài 6](war/lessons/06-weak-point-dien-bien-phu.md) | 1 | 2026-11-18 |
| W18 | Chiến tranh | Đợt 1 Điện Biên Phủ (13–17/3/1954) đánh những cứ điểm nào, và mở ra được gì? | [bài 6](war/lessons/06-weak-point-dien-bien-phu.md) | 1 | 2026-11-18 |
| W19 | Chiến tranh | Ở Điện Biên Phủ, sao Đại tướng không đặt pháo hẳn sau núi cho an toàn? | [bài 7](war/lessons/07-surprise-hidden-guns-dien-bien-phu.md) | 1 | 2026-11-18 |
| W20 | Chiến tranh | Pháp tính "pháo ta bắn, lộ chỗ, bị diệt". Hầm sâu và trận địa giả đánh vào bước nào? | [bài 7](war/lessons/07-surprise-hidden-guns-dien-bien-phu.md) | 1 | 2026-11-18 |
| B4 | BA | Hỏi thế nào để biết người dùng đã xử lý việc quên ôn ra sao? | [BA bài 2](ba/lessons/02-user-interviews.md) | 2 | 2026-11-20 |
| B5 | BA | Vì sao tránh hỏi “bạn cũng thấy thông báo là tốt nhất đúng không?” | [BA bài 2](ba/lessons/02-user-interviews.md) | 2 | 2026-11-20 |
| B6 | BA | Người dùng vừa kể bỏ ôn 4 ngày. Hỏi tiếp “có nút ôn nhanh 5 phút thì bạn dùng không?” sai ở đâu, và nên hỏi gì? | [BA bài 2](ba/lessons/02-user-interviews.md) | 2 | 2026-11-19 |
| B7 | BA | Capstone cần nối vào cổng đăng nhập của trường. Ai cần gặp sớm nhất, vì sao? | [BA bài 3](ba/lessons/03-stakeholders.md) | 1 | 2026-11-18 |
| B8 | BA | Làm sao tìm ra một bên liên quan mà chưa ai nhắc tới? | [BA bài 3](ba/lessons/03-stakeholders.md) | 1 | 2026-11-17 |
| B9 | BA | Người dùng nhắn "thêm chế độ tối đi". Viết thẳng "tôi muốn có nút chế độ tối" vào story thì mất gì? | [BA bài 4](ba/lessons/04-user-stories.md) | 1 | 2026-11-18 |
| B10 | BA | Ba phần của một user story là gì, và phần nào thường chỉ lộ ra khi hỏi về một lần cụ thể? | [BA bài 4](ba/lessons/04-user-stories.md) | 1 | 2026-11-18 |
| B11 | BA | Một điều kiện hoàn thành tốt phải qua hai câu nào? | [BA bài 5](ba/lessons/05-acceptance-criteria.md) | 1 | 2026-11-18 |
| B12 | BA | Story "màn không chói để con không thức". "Nền app màu #121212" có nên là điều kiện hoàn thành không, vì sao? | [BA bài 5](ba/lessons/05-acceptance-criteria.md) | 1 | 2026-11-18 |
| B13 | BA | "Màn không chói" đã dùng làm điều kiện hoàn thành được chưa? Viết lại thế nào? | [BA bài 5](ba/lessons/05-acceptance-criteria.md) | 1 | 2026-11-18 |
| F10 | Frontend | App ngân hàng có tiền vào màu xanh lá, tiền ra màu đỏ. Màu nhấn nên tránh màu nào, vì sao? | [bài 6](frontend/lessons/06-colour-for-a-whole-app.md) | 1 | 2026-11-16 |
| F11 | Frontend | Người mù màu đỏ-lục phân biệt tiền vào và tiền ra nhờ gì? Chuẩn nào bắt điều đó? | [bài 6](frontend/lessons/06-colour-for-a-whole-app.md) | 1 | 2026-11-16 |
| F12 | Frontend | Thiết kế cho người 70 tuổi, cặp màu nào dễ lẫn và nên làm gì? | [bài 6](frontend/lessons/06-colour-for-a-whole-app.md) | 1 | 2026-11-16 |
| F13 | Frontend | Màn giỏ hàng có "Xóa giỏ hàng" và "Thanh toán" là hai nút đặc cùng màu, cùng cỡ. Lỗi gì, sửa thế nào? | [bài 7](frontend/lessons/07-fix-four-mistakes.md) | 1 | 2026-11-18 |
| F14 | Frontend | Gặp một màn cấn mắt, câu hỏi đầu tiên trước khi kiểm điểm nhấn, chữ, khoảng cách, màu là gì? | [bài 7](frontend/lessons/07-fix-four-mistakes.md) | 1 | 2026-11-18 |
| F15 | Frontend | Danh bạ: tên và số của một người cách nhau 16, hai người cũng cách nhau 16. Sửa thành bao nhiêu? | [bài 7](frontend/lessons/07-fix-four-mistakes.md) | 1 | 2026-11-18 |
| F16 | Frontend | Tên tác giả cách sách của nó 10, cách cuốn bên dưới 6. Mắt thấy gì, sửa theo luật nào? | [bài 8](frontend/lessons/08-copy-a-screen-spacing-scale.md) | 1 | 2026-11-18 |
| F17 | Frontend | Một màn dùng bốn khoảng 13, 15, 17, 19. Vì sao nên đổi, đổi thế nào? | [bài 8](frontend/lessons/08-copy-a-screen-spacing-scale.md) | 1 | 2026-11-18 |
| F18 | Frontend | Hai nút đặc cùng cỡ, cùng màu đứng cạnh nhau ("Get Started" và "Download"). Đó là lỗi gì? | [bài 9](frontend/lessons/09-blind-comparison-milestone.md) | 1 | 2026-11-18 |
| F19 | Frontend | Màn đặt lịch có năm khối màu trông vui mắt hơn bản một màu xanh. Vì sao bản một màu vẫn tốt hơn? | [bài 9](frontend/lessons/09-blind-comparison-milestone.md) | 1 | 2026-11-18 |
| F20 | Frontend | Một bạn hỏi "sao phải sửa màn này?". Câu trả lời thuyết phục cần ba thứ gì? | [bài 9](frontend/lessons/09-blind-comparison-milestone.md) | 1 | 2026-11-18 |
