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
- Dựng trang từ mẫu `artifacts/lesson/` (xem README ở đó), làm trên điện thoại. Từ buổi 6, trang có bàn thử (`artifacts/it/`): màn app thật, núm vặn, soi, dòng CSS sáng lên. Mỗi buổi ít nhất một bước tự vặn trên bàn thử.
- 7 bước: mở đầu, nhớ lại 1 câu, chấm 2 màn cùng loại (chưa biết là app nào) theo 5 tiêu chí + điểm chung, so điểm với AI và học một ý, 3 câu kiến thức + 1 câu về gu (không đúng sai), tự nói lại ý chính rồi mới xem bản của AI, góp ý độ dài và độ khó.
- Màn hình: kiểu 1 và 3 chụp trang thật ở cỡ điện thoại bằng Firecrawl (`mobile: true`, `formats: ["screenshot"]`), mỗi buổi đổi loại màn và phong cách.
- Kết quả: trang lưu vào db của artifact, collection `sessions`; AI đọc lại bằng công cụ đọc db. Lưu không được thì thien bấm "Chép kết quả" rồi dán vào chat.
- Giọng người kèm học thân thiện, tiếng Việt tự nhiên. Không giao bài thực hành nặng; thang bài tập ở tài liệu "Cách học cùng AI cho thien".
- Cuối tuần 2: 15 phút so sánh mù lại các màn đã xem, làm mốc đầu tiên.

## Cách dạy môn này
Tìm hiểu ngày 2026-11-12 (bước 0 trong `README.md`). Phần frontend đang học là con mắt thiết kế giao diện; phần kỹ thuật (trình duyệt, TypeScript, kiến trúc, a11y, hiệu năng, test) sẽ bàn thêm ở mốc 2026-11-22.

- **Đây là kỹ năng nhìn, nên học bằng nhiều lượt nhìn ngắn có phản hồi ngay.** Chuyên gia nhận ra vấn đề trên màn bằng mắt trước khi giải thích được. Nghiên cứu về "học nhận biết" cho thấy kỹ năng này lên nhanh nhờ nhiều lượt phân loại ngắn, mỗi lượt có phản hồi, thay vì đọc luật ([Kellman, Massey và Son, 2010](https://pubmed.ncbi.nlm.nih.gov/25163790/), toán; về sau áp cả cho đọc phim X-quang và da liễu). Vì vậy mỗi buổi nên có ít nhất 6 lượt chọn, chạm hay chỉnh nhanh, không phải một bài lớn.
- **Người dạy giỏi làm thế nào.** Erik Kennedy (Learn UI Design) bắt học viên nói ra vì sao một màn đẹp, vì mỗi điều nói ra được là một luật dùng lâu dài, rồi chép lại từng điểm ảnh một màn tốt để học mẹo ([5 bài tập học UI](https://learnui.design/blog/5-practical-exercises-learn-ui-design-free.html)). Josh Comeau cho chỉnh thẳng trong bài và hỏi đoán trước khi đổi. Refactoring UI dạy bằng cặp trước và sau kèm con số cụ thể. Trò Can't Unsee cho chọn giữa hai bản gần giống nhau.
- **Người mới hay sai ở đâu.** Muốn một thứ nổi thì thêm màu, bóng, viền cho nó, thay vì hạ mọi thứ khác xuống. Chọn số và màu tùy hứng thay vì theo thang. Chọn màu theo sở thích thay vì theo nghĩa của nó trên màn.
- **Áp vào buổi học.** Dùng kiểu 1, 2, 3, 7 trong `teaching/README.md`, cùng "Tìm chỗ khác" và "Chọn bản sửa" đã thử. Phần hiểu sau luôn có cặp trước và sau với con số. Khi thien đã quen 5–6 ý, cứ khoảng 2 tuần thêm một bài chép lại nhỏ: chỉnh các con số của một màn cho giống bản gốc, rồi nói ra mẹo vừa thấy.

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
Nhật ký cũ hơn ở [frontend/log.md](frontend/log.md).

| Buổi | Ngày | Ý chính | Kết quả |
|---|---|---|---|
| 8 | 2026-11-17 | Chép lại một màn bằng mắt: thứ càng thuộc về nhau càng gần, mỗi tầng gấp ít nhất 2 lần tầng trong, số lấy từ thang 4, 8, 16, 24, 32 ([bài](frontend/lessons/08-copy-a-screen-spacing-scale.md): màn "Sách của tôi" của app thư viện, bản của Vy) | 13 phút, độ dài và độ khó "vừa"; chép lại một màn so với sửa lỗi như buổi 7 "thích hơn"; tự nói lại bằng cách trả lời Vy so với câu hỏi chung "dễ hơn" (cách mới chọn ở buổi 7 có tác dụng). Ôn 5/5, gồm đúng cả hai chỗ vướng buổi 7: hai nút đặc là lỗi điểm nhấn, câu hỏi đầu là người dùng mở màn để làm gì. Câu hỏi 7/7. Bàn thử đạt 100% sau 21 lần vặn (buổi 6: 4 lần), có thử cả số sai (2; 24; 48; lề 32) trước khi về đúng. Độ khó thien chấm "vừa", nên số lần vặn nhiều có thể chỉ là thử cho chắc (AI suy ra). Tự nói lại viết trước khi xem bản mẫu và lần đầu có thang số 4, 8, 16, 32 (vướng từ buổi 3 đã gỡ); còn thiếu lý do trong nhỏ hơn ngoài và chuyện cụ thể trên màn (tác giả trông như thuộc cuốn dưới), câu trả lời chưa gắn vào màn của Vy. Không hỏi Claude lần nào |
| 9 | 2026-11-17 | Buổi mốc, so sánh mù: chấm lại hai màn thật của buổi 1, năm cặp màn cũ mỗi cặp một ý, một màn chưa gặp trên bàn thử ([bài](frontend/lessons/09-blind-comparison-milestone.md)) | 11 phút, độ khó "vừa" nhưng độ dài "dài" (lần đầu chấm dài: 12 bước); so sánh mù so với học ý mới "như nhau"; sau mốc muốn gặp nhiều nhất kiểu "chọn bản sửa". Ôn 5/5, gồm cả hai câu nhớ lại buổi 8. Màn chưa gặp: thử 2 giá trị mỗi núm rồi chốt đúng hệt bản của Claude (chữ, 20, 24), tức mắt đã tự áp được ba ý lên màn mới. Năm cặp: chọn đúng bản tốt 4/5, gọi đúng tên ý 3/5. Chọn bản đặt lịch năm màu là bản tốt hơn, rồi vẫn gọi đúng tên ý "Màu" và nhờ Claude giải thích: màu vui mắt vẫn kéo mắt (AI suy ra, hợp với chuyện thích không khí màu của TickTick ở buổi 1). Hai nút đặc cạnh nhau gọi là "mục đích của màn" (buổi 7 gọi là màu), cặp "Hủy đơn" nổi gọi là "điểm nhấn": hai ý này còn lẫn vào nhau. Chấm lại buổi 1: điểm chung giờ nghiêng về Todoist (5 so với 4), điểm nhấn Todoist lên 3 → 4 nhưng TickTick vẫn 5 như ngày 7/11, nên hai nút cạnh nhau của TickTick vẫn chưa bị thấy là chia đôi điểm nhấn. Câu hỏi 2/2. Tự nói lại có "hai nút tranh nhau" và "khoảng cách tách nhóm" nhưng lần thứ ba vẫn thiếu người dùng mở màn để làm gì, con số và vì sao. Chọn học dễ truy cập (a11y) trước ở chặng 3 |
| 10 | 2026-11-17 | Chọn bản sửa trên màn thật của sakubun ("Xong buổi ôn"): muốn một thứ nổi thì hạ thứ khác xuống, đừng thêm màu; "mở màn để làm gì" quyết định thứ gì được to ([bài](frontend/lessons/10-pick-a-fix-session-summary.md)) | Trang mở 72 phút (tính cả lúc rời trang). Độ dài, độ khó "vừa" (buổi 9 "dài": rút còn 9 bước có tác dụng); chọn bản sửa trên màn sakubun so với các buổi trước "như nhau"; khung 3 ý "bình thường". Ôn 5/5, gồm hai câu nhớ lại buổi 9: hai nút đặc gọi đúng là điểm nhấn (gỡ chỗ vướng buổi 9), chọn đúng thẻ một màu. Nhìn 5 giây: mắt "đi khắp màn", đúng lỗi của màn gốc. Chọn bản B (băng chuỗi ngày, bản đẹp mà sai mục đích) nhưng lý do viết lại tả bản C ("nhìn được con số chính"). Câu hỏi 1/2: muốn số "Nhớ" nổi thì chọn tô màu xanh lá, nên "nổi = thêm màu" vẫn còn dù nhận ra được màn nhiều màu. Bàn thử: thử đủ mọi núm, chốt một số to, trắng, cỡ 18 (có thể do nút "Đặt bản C, số 18" đặt lại cỡ; lỗi trang, AI suy ra). Tự nói lại theo khung, viết trước khi xem bản mẫu: lần đầu sau ba buổi có "vì sao" (mắt dừng ở thứ khác biệt); mục đích còn chung ("quá trình mình đang ở đâu"), chưa gọi tên chỗ trên màn, chưa có con số. Với sakubun thật: "để sau, xem thêm các màn khác" |

## Chỗ còn vướng
AI ghi sau mỗi buổi (nháp từ `artifacts/lesson/after-lesson.mjs`), xóa dòng khi thien đã làm đúng ở buổi sau. Trang buổi tới đưa các dòng này cho Claude khi thien hỏi, và AI dùng chúng cho phần nhớ lại.
- 2026-11-17, buổi 10: tự nói lại có khung 3 ý lần đầu có "vì sao" (mắt dừng trước ở thứ khác biệt), nhưng mục đích còn chung ("xem quá trình mình đang ở đâu"), chưa gọi tên chỗ trên màn và vẫn chưa có con số (buổi 7, 8, 9, 10)
- 2026-11-17, buổi 10: muốn số "Nhớ" nổi giữa ba ô thì chọn "tô màu xanh lá" thay vì làm to và hạ hai số kia; cùng gốc với buổi 9 chọn bản năm màu: còn nghĩ "nổi = thêm màu", dù đã nhận ra màn nhiều màu kéo mắt
- 2026-11-17, buổi 10: chọn bản B (băng chuỗi ngày, đẹp mà nhấn việc phụ) nhưng lý do viết tả bản C; chưa rõ lẫn số chuỗi ngày với số chính hay bấm nhầm. Cùng kiểu cặp "Hủy đơn" buổi 9: mục đích của màn vẫn là ý yếu nhất khi bản sai đẹp hơn

## Buổi tiếp theo
- Chặng 2 tiếp (áp vào app của mình). thien muốn xem thêm các màn khác của sakubun trước khi sửa thật, nên buổi 11 lấy một màn khác: gợi ý thanh chấm thẻ (Quên đỏ, Nhớ đặc, Dễ xanh) để học khi nào màu đúng (màu mang nghĩa) và khi nào là thêm cho nổi, nhắm thẳng chỗ vướng "nổi = thêm màu".
- Kiểu bài: thien chấm "chọn bản sửa" như các kiểu khác, nên luân phiên: buổi 11 dùng "tự chỉnh trên màn" (bàn thử là chính) hoặc "tìm chỗ khác", giữ khoảng 8–9 bước.
- Tự nói lại: bỏ khung 3 ý như đã hẹn (thien chấm "bình thường"), nhưng tình huống phải đòi con số (người hỏi hỏi thẳng "to bao nhiêu?") và hỏi về đúng một chỗ trên màn. Nếu mất lại "vì sao" thì quay về khung.
- Phần nhớ lại: hỏi lại bản B và C buổi 10 bằng một câu (con số chính của màn là số nào), và một câu "muốn nổi" mà lựa chọn tô màu trông hợp lý.
- Sửa ở bộ mẫu: bản "Claude làm mẫu" trên bàn thử không biết đáp án của bài nên buổi 10 tự vặn lên 56, lệch với 34 trang chốt; bước có đáp án số nên truyền đáp án vào ngữ cảnh làm mẫu.
- Giữ: bàn thử, bản "đẹp hơn mà sai", màn thật dựng lại từ code sakubun có ghi nguồn, tự nói lại theo tình huống có người hỏi đòi lý do.
- Quyết định tự nói lại theo tình huống (thien chọn 2026-11-17, phương án C), lý do của thien: "câu hỏi chung chung đúng là làm mình bí thật, tình huống cụ thể sẽ làm mình tự tổng hợp kiến thức nhanh hơn". Khung 3 ý thử ở buổi 10 (thien chọn đầu buổi), chấm "bình thường".
