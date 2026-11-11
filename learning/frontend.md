# Học frontend: hồ sơ và trạng thái

File này để tài khoản nào, model nào cũng dạy tiếp được cho thien. Đọc hết trước khi soạn buổi mới. Cập nhật mục "Nhật ký" và "Buổi tiếp theo" sau mỗi buổi.

## Mục tiêu và nhịp
- Mục tiêu: nhìn ra vì sao một màn hình đẹp hay cấn mắt ở mức cả màn (bố cục, điểm nhấn, chữ, màu, khoảng trắng), để dần làm giàu thienui. Bài học gốc: luật chỉ đồng bộ chi tiết, không làm cả màn đẹp (thua app why i buy).
- Kiểu khóa: thói quen dài hạn, mỗi buổi khoảng 15 phút, tối 19–23h.
- Lịch: từ 2026-11-12 frontend là môn chính trong vòng xoay nhiều môn, chiếm khoảng một nửa số buổi (vòng, nhịp tuần và mốc ở `learning/README.md`). Lỡ thì thôi, không dồn nợ ([Lally và cộng sự, 2010](https://doi.org/10.1002/ejsp.674)).
- Thử nghiệm kết thúc chủ nhật 2026-11-22 bằng 15 phút so sánh mù lại các màn đã xem. Sau đó thành thói quen: giữ các kiểu buổi thien thích, khoảng 2 tuần một buổi áp vào việc thật (kiểu 5 hoặc 6).
- Bài đã học lưu ở `learning/frontend/` (file đọc nhanh và trang làm lại); thêm bài sau mỗi buổi.
- Học song song với BA và chiến tranh theo vòng Frontend → BA → Frontend → Chiến tranh.

## Cách một buổi chạy
- Dựng trang từ mẫu `artifacts/lesson-page.html`, làm trên điện thoại.
- 7 bước: mở đầu, nhớ lại 1 câu, chấm 2 màn cùng loại (chưa biết là app nào) theo 5 tiêu chí + điểm chung, so điểm với AI và học một ý, 3 câu kiến thức + 1 câu về gu (không đúng sai), tự nói lại ý chính rồi mới xem bản của AI, góp ý độ dài và độ khó.
- Màn hình: kiểu 1 và 3 chụp trang thật ở cỡ điện thoại bằng Firecrawl (`mobile: true`, `formats: ["screenshot"]`), mỗi buổi đổi loại màn và phong cách.
- Kết quả: trang lưu vào db của artifact, collection `sessions`; AI đọc lại bằng công cụ đọc db. Lưu không được thì thien dán kết quả vào chat.
- Giọng người kèm học thân thiện, tiếng Việt tự nhiên. Không giao bài thực hành nặng; thang bài tập ở tài liệu "Cách học cùng AI cho thien".
- Cuối tuần 2: 15 phút so sánh mù lại các màn đã xem, làm mốc đầu tiên.

## Tâm thế người kèm học
- Luật dạy chung cho mọi môn ở `profile/TUTOR.md`; mục này là phần riêng của frontend.
- thien là người học, AI là tutor. Điểm chấm và câu trả lời của thien khác AI là chuyện bình thường, tutor chờ sẵn điều đó. Việc của tutor là hiểu vì sao thien nghĩ vậy, rồi dẫn tới lúc thien tự nhận ra, không chấm là "hụt" hay "sai".
- Khoảnh khắc thien đánh giá cao nhất (buổi 2): tự chấm Slack thấp vì chưa hiểu, xem giải thích rồi tự nhận ra vì sao AI chấm 5. Giữ nhịp "tự cảm nhận trước, xem giải thích sau, tự nhận ra" ở mọi kiểu buổi.
- Nhật ký ghi chỗ thien đổi cách nhìn và chỗ nên dẫn tiếp, không ghi như bảng điểm.

## Các kiểu buổi để luân phiên
Khung 7 bước giữ nguyên (nhớ lại, phần chính, học một ý, câu hỏi, tự nói lại, góp ý); chỉ đổi phần chính. Mỗi tuần nên có ít nhất 2 kiểu khác nhau. Đây là đề xuất của AI (AI suy ra), đã thử kiểu 1 (buổi 1, 2) và kiểu 2 (buổi 3, thien thích hơn kiểu 1), các kiểu khác chưa thử; thử xong ghi vào nhật ký kiểu đó có hợp không.

1. **Chấm mù rồi so** (đã dùng buổi 1, 2). Chấm 2 màn thật, rồi xem điểm và giải thích của AI. Chỗ yếu: dùng mãi sẽ quen tay chấm theo cảm giác.
2. **Tìm chỗ khác** (đã dùng buổi 3). Hai bản gần như giống hệt của cùng một màn (AI tự dựng lại bằng HTML), chỉ khác một chi tiết như khoảng cách, độ đậm hay một màu. thien chọn bản dễ nhìn hơn trước, rồi mới tìm xem khác ở đâu. Luyện mắt bắt chi tiết nhỏ. Chỗ yếu: màn dựng lại không phải màn thật, phải nói rõ.
3. **Chạm vào chỗ mắt nhìn trước**. Ảnh màn thật hiện 2 giây rồi mờ đi, thien chạm vào chỗ nhớ được đầu tiên, rồi chạm tiếp chỗ thứ 2, thứ 3. AI so với thứ bậc mà màn đó muốn tạo ra. Hợp với điểm nhấn, thứ bậc chữ, màu. Chỗ yếu: cần dựng phần chạm cẩn thận cho điện thoại.
4. **Chọn bản sửa**. Một màn có một chỗ cấn mắt, kèm 3 bản sửa. thien chọn bản tốt nhất và nói một câu vì sao; có bản sửa trông đẹp hơn nhưng sai mục đích. Gần nhất với việc thật khi làm thienui. Chỗ yếu: khó hơn, nên dùng sau khi đã học đủ 3–4 ý.
5. **Soi app của mình**. thien chụp một màn của app mình dùng hằng ngày hoặc app tự làm (sakubun, journal, todo), tự chấm trước, AI chấm sau, cùng chọn một chỗ sửa nhỏ. Nối thẳng việc học với thienui. Chỗ yếu: thien phải tự chụp, thêm một bước làm thien ngại.
6. **Viết luật cho thienui** (khoảng 2 tuần một lần). Từ các ý đã học, thien tự viết 1 luật ngắn; AI đưa 2 màn thật, một màn làm đúng luật mà vẫn xấu, để thien sửa luật cho chặt hơn. Đúng với bài học gốc "luật chỉ đồng bộ chi tiết". Chỗ yếu: nặng đầu óc hơn, không hợp buổi tối mệt.

## Nhật ký
| Buổi | Ngày | Ý chính | Kết quả |
|---|---|---|---|
| 1 | 2026-11-07 | Một điểm nhấn (Todoist và TickTick, trang chủ) | 12 phút, độ dài và độ khó "vừa", đúng 4/4. Tự nói lại đúng. Cho TickTick 5 điểm về điểm nhấn, Todoist 3 (AI: 2 và 5). Về gu thích không khí xanh nhẹ của TickTick dù khen bố cục Todoist |
| 2 | 2026-11-07 | Thứ bậc chữ (Slack và Linear, trang giá) | 13 phút, độ dài và độ khó "vừa", đúng 4/4. Câu nhớ lại chọn "một chỗ số 1, còn lại xếp bậc", tức đã hiểu đúng ý buổi 1. Chấm thứ bậc chữ Slack 3, Linear 3 (AI: 5 và 3). Xem giải thích xong thì tự nhận ra vì sao Slack đáng 5, và thien nói đây là cách học rất hợp. Tự nói lại có cỡ chữ, màu và thứ tự; độ đậm, khoảng cách và ý "ít bậc, mỗi bậc khác hẳn nhau" chưa nhắc tới, nên dẫn tiếp ở buổi 3. Về gu chọn cách dùng chữ của Slack, nói là nhờ học xong mới nhận ra |
| 3 | 2026-11-11 | Khoảng cách là cách nhóm, kiểu "Tìm chỗ khác" (3 cặp màn tự dựng: form đăng ký, màn cài đặt, trang giới thiệu) | 14 phút, độ dài và độ khó "vừa". Chọn đúng bản giãn và tìm đúng chỗ khác cả 3 cặp, đúng 4/4 câu hỏi; câu nhớ lại nhận ra độ đậm và khoảng cách. Thích kiểu "Tìm chỗ khác" hơn kiểu chấm. Tự nói lại có ý khoảng trắng tách các phần, chưa có ý "khoảng giữa nhóm lớn hơn hẳn khoảng trong nhóm" và thang số cố định. Về gu chọn "thoáng": cái nhìn đầu tiên quyết định, thông tin dày và dính sát làm người dùng mất thiện cảm (khác ý "gọn như công cụ dân chuyên" ở sakubun, cần hỏi lại là tùy loại app hay đã đổi). Góp ý: hai buổi trước cách lâu nên hơi quên; buổi vừa sức nhưng kiến thức chưa đủ sâu |
| 4 | 2026-11-11 | Sửa theo mục đích của màn, kiểu "Chọn bản sửa" (màn chi tiết đơn hàng tự dựng: vòng điểm nhấn, vòng bậc chữ, rồi tự chỉnh khoảng cách) | Học cùng tối với buổi 3. Độ dài, độ khó "vừa", độ sâu "vừa đủ", thẻ ôn nhanh "có giúp", thích kiểu này hơn "tìm chỗ khác". Chọn đúng bản đúng mục đích cả 2 vòng, lý do viết dài và đúng ý (nhấn sai chỗ ở nút Hủy, chủ app không muốn khách dễ hủy; tổng tiền là thứ người dùng cần xác nhận). Tự chỉnh khoảng cách chọn ngay 8 và 24. Đúng 3/3 câu sửa. Câu nhớ lại chọn 10px cho khoảng giữa nhóm, tức mắt làm đúng nhưng ý "gấp 2–3 lần" chưa thành lời, nhắc lại ở buổi sau. Tự nói lại đủ ý "bắt đầu từ chức năng chính" và "bản đẹp chưa chắc đúng". Về gu: app nhiều thông tin (ngân hàng, ghi chú, bảng việc) thì gọn chặt nhưng phải có bố cục rõ; app học từ vựng thì thoáng; như vậy gu "thoáng" ở buổi 3 và "gọn như công cụ dân chuyên" ở sakubun không mâu thuẫn mà tùy loại app. Góp ý: rất thỏa mãn vì tương tác cao, mỗi buổi có sáng tạo riêng; muốn học bằng mắt và tay nhiều hơn chữ (xem, bấm, chỉnh, minh họa), "thử trước, ý nghĩa sau khi đã nắm được ý"; nhờ nghiên cứu thêm cách học |

## Buổi tiếp theo
- Giữ từ buổi 4: thẻ ôn nhanh đầu buổi, phần con số cụ thể, bài tập ở bậc "sửa" chứ không chỉ "nhận ra".
- Theo góp ý buổi 4: mỗi buổi phải có ít nhất một phần học bằng tay, nơi thien bấm, kéo hay chỉnh và thấy màn đổi ngay (như phần tự chỉnh khoảng cách). Chữ giải thích đi sau khi thien đã tự thấy. Đổi kiểu buổi để mỗi buổi có một trò mới.
- Buổi 5: ý mới là màu (một màu nhấn, nền và chữ trung tính, màu nhấn chỉ cho thứ quan trọng nhất), kiểu 3 "Chạm vào chỗ mắt nhìn trước" kết hợp một phần tự chỉnh màu. Câu nhớ lại hỏi lại tỷ lệ khoảng cách giữa nhóm và trong nhóm, vì buổi 4 câu này còn chọn 10px.
- Việc riêng cho AI: nghiên cứu thêm các cách học bằng mắt và tay cho thiết kế giao diện (thien nhờ ở buổi 4), đề xuất vài kiểu buổi mới.
- Chủ nhật 2026-11-22: 15 phút so sánh mù lại các màn đã xem, chốt thử nghiệm.
