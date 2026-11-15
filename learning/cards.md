# Thẻ ôn của mọi môn

Đầu mỗi buổi, AI lấy 3 thẻ đến hạn (cột "Hỏi lại" là hôm nay hoặc đã qua), ưu tiên thẻ quá hạn lâu nhất, môn nào cũng được. thien trả lời trước, rồi mới xem đáp án trong file bài.

Sau khi hỏi, AI sửa hai cột cuối:
- Trả lời đúng: lên một hộp. Hộp 1 hỏi lại sau 1 ngày, hộp 2 sau 3 ngày, hộp 3 sau 1 tuần, hộp 4 sau 2 tuần, hộp 5 sau 1 tháng.
- Trả lời sai hoặc quên: về hộp 1.

Sau mỗi buổi, AI thêm 2–3 thẻ mới từ buổi đó, bắt đầu ở hộp 1.

Ôn ngoài buổi học: [trang ôn thẻ](https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu) hiện các thẻ đến hạn. Kết quả ôn ở đó ghi vào bảng này bằng `node artifacts/review/apply-review.mjs` (xem [`artifacts/review/`](../artifacts/review/README.md)). Giữ đúng các cột của bảng, vì script đọc theo tên cột.

| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |
|---|---|---|---|---|---|
| F1 | Frontend | Hai nút cùng cỡ, cùng màu đặt cạnh nhau thì sao? | [bài 1](frontend/lessons/01-one-focal-point.md) | 2 | 2026-11-15 |
| F2 | Frontend | Muốn nút chính nổi hơn mà không thêm màu mới thì làm gì? | [bài 1](frontend/lessons/01-one-focal-point.md) | 2 | 2026-11-15 |
| F3 | Frontend | Ngoài cỡ chữ, màu và thứ tự, còn hai cách nào để tạo bậc chữ? | [bài 2](frontend/lessons/02-type-hierarchy.md) | 2 | 2026-11-15 |
| F4 | Frontend | Trong nhóm các dòng cách nhau 8px. Giữa hai nhóm nên bao nhiêu? | [bài 3](frontend/lessons/03-spacing-groups.md) | 2 | 2026-11-15 |
| F5 | Frontend | Vì sao nhiều design system chỉ cho dùng 4, 8, 12, 16, 24, 32? | [bài 3](frontend/lessons/03-spacing-groups.md) | 2 | 2026-11-15 |
| F6 | Frontend | Màn thanh toán có hai nút đặc "Thanh toán" và "Thêm mã giảm giá". Sửa thế nào? | [bài 4](frontend/lessons/04-fix-a-whole-screen.md) | 2 | 2026-11-15 |
| B1 | BA | Khách nhờ "thêm nút xuất Excel". Câu nào nên hỏi đầu tiên? | [BA bài 1](ba/lessons/01-requests-vs-needs.md) | 2 | 2026-11-15 |
| B2 | BA | "Thêm thông báo đẩy lúc 8 giờ tối" là nhu cầu hay giải pháp? | [BA bài 1](ba/lessons/01-requests-vs-needs.md) | 1 | 2026-11-16 |
| B3 | BA | Vì sao không nên làm ngay đúng thứ được nhờ? | [BA bài 1](ba/lessons/01-requests-vs-needs.md) | 1 | 2026-11-13 |
| F7 | Frontend | Thanh đầu trang cùng màu đặc với nút chính thì sao? | [bài 5](frontend/lessons/05-one-accent-colour.md) | 2 | 2026-11-15 |
| F8 | Frontend | Thẻ trạng thái "Đã thanh toán" nên đặc hay nhạt, vì sao? | [bài 5](frontend/lessons/05-one-accent-colour.md) | 2 | 2026-11-18 |
| W4 | Chiến tranh | Theo Tống sử, vì sao Quách Quỳ rút quân năm 1077? | [bài 2](war/lessons/02-ly-song-war-1075-1077.md) | 2 | 2026-11-15 |
| W5 | Chiến tranh | Quảng Nguyên về lại với Đại Việt bằng cách nào? | [bài 2](war/lessons/02-ly-song-war-1075-1077.md) | 1 | 2026-11-13 |
| W6 | Chiến tranh | Thắng trận và đạt mục tiêu chính trị khác nhau thế nào? Cho một ví dụ. | [bài 2](war/lessons/02-ly-song-war-1075-1077.md) | 1 | 2026-11-13 |
| W7 | Chiến tranh | Phá Khâm, Liêm rồi vây thành Ung hơn 40 ngày là tầng chiến lược, chiến dịch hay chiến thuật? | [bài 3](war/lessons/03-three-levels-dien-bien-phu.md) | 1 | 2026-11-15 |
| W8 | Chiến tranh | Vì sao Đại tướng Võ Nguyên Giáp hoãn trận đánh Điện Biên Phủ ngày 26/1/1954? | [bài 3](war/lessons/03-three-levels-dien-bien-phu.md) | 2 | 2026-11-18 |
| W9 | Chiến tranh | Vì sao "hoãn vài ngày rồi đánh theo kế hoạch cũ" vẫn chưa đủ? | [bài 3](war/lessons/03-three-levels-dien-bien-phu.md) | 1 | 2026-11-13 |
| W10 | Chiến tranh | Khi đổi sang "đánh chắc tiến chắc", đạn và gạo tăng bao nhiêu lần? Thứ nào tăng mạnh hơn, vì sao? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 2 | 2026-11-17 |
| W12 | Chiến tranh | Gánh bộ đường xa, để 1 kg gạo tới mặt trận thì dọc đường ăn mất bao nhiêu? Xe đạp thồ giảm con số đó bằng cách nào? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 1 | 2026-11-15 |
| W13 | Chiến tranh | Chỉ huy Pháp tính sai điều gì về hậu cần của bên ta ở Điện Biên Phủ? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 1 | 2026-11-15 |
| W11 | Chiến tranh | Vì sao hậu cần Điện Biên Phủ không dồn hết vào xe ô tô? | [bài 4](war/lessons/04-logistics-dien-bien-phu.md) | 1 | 2026-11-13 |
| F9 | Frontend | Ngoài khối màu to, hai thứ nhỏ nào cũng hay giành mắt mà dễ bị bỏ sót? | [bài 5](frontend/lessons/05-one-accent-colour.md) | 2 | 2026-11-18 |
| W1 | Chiến tranh | Theo Toàn thư, vì sao thuyền Nam Hán bị lật ở Bạch Đằng năm 938? | [bài 1](war/lessons/01-bach-dang-938.md) | 1 | 2026-11-13 |
| W2 | Chiến tranh | Vì sao Ngô Quyền không đem thuyền ra chặn thẳng ở cửa biển? | [bài 1](war/lessons/01-bach-dang-938.md) | 1 | 2026-11-13 |
| W3 | Chiến tranh | Toàn thư và sử Trung Quốc chép khác nhau thế nào về cái chết của Hoằng Tháo? | [bài 1](war/lessons/01-bach-dang-938.md) | 1 | 2026-11-13 |
| B4 | BA | Hỏi thế nào để biết người dùng đã xử lý việc quên ôn ra sao? | [BA bài 2](ba/lessons/02-user-interviews.md) | 1 | 2026-11-13 |
| B5 | BA | Vì sao tránh hỏi “bạn cũng thấy thông báo là tốt nhất đúng không?” | [BA bài 2](ba/lessons/02-user-interviews.md) | 1 | 2026-11-13 |
| B6 | BA | Người dùng vừa kể bỏ ôn 4 ngày. Hỏi tiếp “có nút ôn nhanh 5 phút thì bạn dùng không?” sai ở đâu, và nên hỏi gì? | [BA bài 2](ba/lessons/02-user-interviews.md) | 1 | 2026-11-13 |
| F10 | Frontend | App ngân hàng có tiền vào màu xanh lá, tiền ra màu đỏ. Màu nhấn nên tránh màu nào, vì sao? | [bài 6](frontend/lessons/06-colour-for-a-whole-app.md) | 1 | 2026-11-16 |
| F11 | Frontend | Người mù màu đỏ-lục phân biệt tiền vào và tiền ra nhờ gì? Chuẩn nào bắt điều đó? | [bài 6](frontend/lessons/06-colour-for-a-whole-app.md) | 1 | 2026-11-16 |
| F12 | Frontend | Thiết kế cho người 70 tuổi, cặp màu nào dễ lẫn và nên làm gì? | [bài 6](frontend/lessons/06-colour-for-a-whole-app.md) | 1 | 2026-11-16 |
