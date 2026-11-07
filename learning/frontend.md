# Học frontend: hồ sơ và trạng thái

File này để tài khoản nào, model nào cũng dạy tiếp được cho thien. Đọc hết trước khi soạn buổi mới. Cập nhật mục "Nhật ký" và "Buổi tiếp theo" sau mỗi buổi.

## Mục tiêu và nhịp
- Mục tiêu: nhìn ra vì sao một màn hình đẹp hay cấn mắt ở mức cả màn (bố cục, điểm nhấn, chữ, màu, khoảng trắng), để dần làm giàu thienui. Bài học gốc: luật chỉ đồng bộ chi tiết, không làm cả màn đẹp (thua app why i buy).
- Kiểu khóa: thói quen dài hạn. 3 buổi mỗi tuần, tối 19–23h, thứ 2, 4, 6 (hoặc chủ nhật), mỗi buổi khoảng 15 phút.
- Sau frontend sẽ học BA, rồi chiến tranh, cùng cách này.

## Cách một buổi chạy
- Dựng trang từ mẫu `artifacts/lesson-page.html`, làm trên điện thoại.
- 7 bước: mở đầu, nhớ lại 1 câu, chấm 2 màn cùng loại (chưa biết là app nào) theo 5 tiêu chí + điểm chung, so điểm với AI và học một ý, 3 câu kiến thức + 1 câu về gu (không đúng sai), tự nói lại ý chính rồi mới xem bản của AI, góp ý độ dài và độ khó.
- Màn hình: chụp trang thật ở cỡ điện thoại bằng Firecrawl (`mobile: true`, `formats: ["screenshot"]`), mỗi buổi đổi loại màn và phong cách.
- Kết quả: trang lưu vào db của artifact, collection `sessions`; AI đọc lại bằng công cụ đọc db. Lưu không được thì thien dán kết quả vào chat.
- Giọng người kèm học thân thiện, tiếng Việt tự nhiên. Không giao bài thực hành nặng; thang bài tập ở tài liệu "Cách học cùng AI cho thien".
- Cuối tuần 2: 15 phút so sánh mù lại các màn đã xem, làm mốc đầu tiên.

## Tâm thế người kèm học
- thien là người học, AI là tutor. Điểm chấm và câu trả lời của thien khác AI là chuyện bình thường, tutor chờ sẵn điều đó. Việc của tutor là hiểu vì sao thien nghĩ vậy, rồi dẫn tới lúc thien tự nhận ra, không chấm là "hụt" hay "sai".
- Khoảnh khắc thien đánh giá cao nhất (buổi 2): tự chấm Slack thấp vì chưa hiểu, xem giải thích rồi tự nhận ra vì sao AI chấm 5. Giữ nhịp "tự cảm nhận trước, xem giải thích sau, tự nhận ra" ở mọi kiểu buổi.
- Nhật ký ghi chỗ thien đổi cách nhìn và chỗ nên dẫn tiếp, không ghi như bảng điểm.

## Các kiểu buổi để luân phiên
Khung 7 bước giữ nguyên (nhớ lại, phần chính, học một ý, câu hỏi, tự nói lại, góp ý); chỉ đổi phần chính. Mỗi tuần nên có ít nhất 2 kiểu khác nhau. Đây là đề xuất của AI (AI suy ra), chưa thử kiểu nào ngoài kiểu 1; thử xong ghi vào nhật ký kiểu đó có hợp không.

1. **Chấm mù rồi so** (đã dùng buổi 1, 2). Chấm 2 màn thật, rồi xem điểm và giải thích của AI. Chỗ yếu: dùng mãi sẽ quen tay chấm theo cảm giác.
2. **Tìm chỗ khác**. Hai bản gần như giống hệt của cùng một màn (AI tự dựng lại bằng HTML), chỉ khác một chi tiết như khoảng cách, độ đậm hay một màu. thien chọn bản dễ nhìn hơn trước, rồi mới tìm xem khác ở đâu. Luyện mắt bắt chi tiết nhỏ. Chỗ yếu: màn dựng lại không phải màn thật, phải nói rõ.
3. **Chạm vào chỗ mắt nhìn trước**. Ảnh màn thật hiện 2 giây rồi mờ đi, thien chạm vào chỗ nhớ được đầu tiên, rồi chạm tiếp chỗ thứ 2, thứ 3. AI so với thứ bậc mà màn đó muốn tạo ra. Hợp với điểm nhấn, thứ bậc chữ, màu. Chỗ yếu: cần dựng phần chạm cẩn thận cho điện thoại.
4. **Chọn bản sửa**. Một màn có một chỗ cấn mắt, kèm 3 bản sửa. thien chọn bản tốt nhất và nói một câu vì sao; có bản sửa trông đẹp hơn nhưng sai mục đích. Gần nhất với việc thật khi làm thienui. Chỗ yếu: khó hơn, nên dùng sau khi đã học đủ 3–4 ý.
5. **Soi app của mình**. thien chụp một màn của app mình dùng hằng ngày hoặc app tự làm (sakubun, journal, todo), tự chấm trước, AI chấm sau, cùng chọn một chỗ sửa nhỏ. Nối thẳng việc học với thienui. Chỗ yếu: thien phải tự chụp, thêm một bước làm thien ngại.
6. **Viết luật cho thienui** (khoảng 2 tuần một lần). Từ các ý đã học, thien tự viết 1 luật ngắn; AI đưa 2 màn thật, một màn làm đúng luật mà vẫn xấu, để thien sửa luật cho chặt hơn. Đúng với bài học gốc "luật chỉ đồng bộ chi tiết". Chỗ yếu: nặng đầu óc hơn, không hợp buổi tối mệt.

## Nhật ký
| Buổi | Ngày | Ý chính | Kết quả |
|---|---|---|---|
| 1 | 2026-11-07 | Một điểm nhấn (Todoist và TickTick, trang chủ) | 12 phút, độ dài và độ khó "vừa", đúng 4/4. Tự nói lại đúng. Cho TickTick 5 điểm về điểm nhấn, Todoist 3 (AI: 2 và 5). Về gu thích không khí xanh nhẹ của TickTick dù khen bố cục Todoist |
| 2 | 2026-11-07 | Thứ bậc chữ (Slack và Linear, trang giá) | 13 phút, độ dài và độ khó "vừa", đúng 4/4. Câu nhớ lại chọn "một chỗ số 1, còn lại xếp bậc", tức đã hiểu đúng ý buổi 1. Chấm thứ bậc chữ Slack 3, Linear 3 (AI: 5 và 3). Xem giải thích xong thì tự nhận ra vì sao Slack đáng 5, và thien nói đây là cách học rất hợp. Tự nói lại có cỡ chữ, màu và thứ tự; độ đậm, khoảng cách và ý "ít bậc, mỗi bậc khác hẳn nhau" chưa nhắc tới, nên dẫn tiếp ở buổi 3. Về gu chọn cách dùng chữ của Slack, nói là nhờ học xong mới nhận ra |

## Buổi tiếp theo
- Buổi 3: khoảng trắng và nhịp khoảng cách, thử kiểu buổi 2 "Tìm chỗ khác" (hợp vì khoảng cách là chi tiết nhỏ, dễ dựng hai bản chỉ khác nhau ở đó). Câu nhớ lại hỏi về độ đậm hoặc khoảng cách như một cách tạo bậc chữ, vì buổi 2 thien chưa nhắc tới. Có thể dùng lại khoảng trống lớn trong thẻ giá Slack làm ví dụ mở đầu. Hai màn khác loại buổi 1 và 2, ví dụ màn đăng ký, màn cài đặt hoặc màn chi tiết sản phẩm.
- Cuối tuần 2: 15 phút so sánh mù lại các màn đã xem, làm mốc đầu tiên.
