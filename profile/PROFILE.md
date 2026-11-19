# Hồ sơ của thien

File này do thien sở hữu. AI chỉ đề xuất sửa, thien duyệt. Dòng có "(AI suy ra)" là AI đoán, chờ thien xác nhận.

## Mình là ai
- Sinh viên FPT University HCM. Product Owner của đồ án capstone 5 người (SEP490, bảo vệ khoảng 4/2027).
- Tự vận hành một máy chủ ở nhà (NUC) và vài app: sakubun (học tiếng Nhật, thay cho yakudoku đã bỏ), journal, todo.
- Mục tiêu nghề: senior frontend và senior BA.

## Thứ tự ưu tiên
Mình giỏi lên, rồi chất lượng và an toàn, rồi làm nhanh.

## Cách mình làm việc
- Làm nhiều project cùng lúc, nhiều tài khoản Claude. Claude làm chính. Codex thỉnh thoảng code, review, hoặc làm việc nặng về dữ liệu, kế hoạch; ChatGPT và Gemini bản miễn phí trên web chỉ để hỏi đáp, không đọc repo.
- Không muốn chạy lệnh hay duyệt nhiều PR nhỏ liên tiếp. Việc nhỏ: duyệt một lần. Nếu mình đã mất dấu thì chờ hết milestone, mình thử tính năng thật.
- Kế hoạch mình đã duyệt phải nằm trong repo và có trang tiến độ để mình xem trên điện thoại: theo `profile/PLANNING.md`.
- Mất dấu tiến độ là lúc mình bỏ việc. Khi mình quay lại, cho mình bản tóm tắt đọc trong 2 phút: đang ở đâu, vừa đổi gì, cần mình làm gì (cách viết ở mục "Báo cáo khi xong việc" của `profile/VOICE.md`).

## Nhắc việc dở khi bắt đầu việc mới (bắt buộc, theo ba mức)
Mình hay hết usage giữa tuần, phiên sau quay lại thì quên việc đang làm. Nhưng không phải câu nào cũng phải chờ kiểm. Mỗi khi mình giao việc, AI xét theo ba mức:
1. **Việc mới phụ thuộc trực tiếp vào việc dở** (PR chưa merge sửa cùng file hay cùng môn, quyết định chưa chốt mà việc mới cần): báo việc đó trước, kèm link, hỏi xử lý trước hay làm tiếp trên nhánh đó. Trong lúc chờ, AI được đọc và lên kế hoạch, chưa sửa gì.
2. **Việc mới không phụ thuộc, nhưng còn việc dở quan trọng** (đang chặn việc khác, sắp tới hạn, hay để lâu sẽ phải làm lại như PR bị conflict, STATUS cũ đi): nhắc mỗi việc một dòng, tối đa 3, rồi làm việc mới luôn, không chờ mình trả lời.
3. **Hỏi đáp, tra cứu, review chỉ đọc:** trả lời trước, không kiểm việc dở.

Gom việc dở bằng công cụ, không theo trí nhớ: thread chưa xong trong project, PR còn mở, câu hỏi và thẻ quyết định chưa trả lời, mục "Việc dở" và "Đang chờ thien" trong `docs/STATUS.md`. Chỗ nào không đọc được thì nói ra. Mỗi việc một dòng: việc gì (kèm link), dở từ ngày nào, mình cần làm gì. Mình đã nghe nhắc mà chọn làm việc mới thì trong ngày đó không nhắc lại đúng những việc ấy. Project bản beta: chat điều phối làm bước này trước khi mở thread, thread không làm lại; project bản cũ: chat đầu tiên của việc (kiểu project của từng nick ở `profile/ACCOUNTS.md`). Dừng giữa chừng (hết phiên, chờ mình): ghi việc dở vào mục "Việc dở" của `docs/STATUS.md`, project không có repo thì ghi vào memory của project.

## Cách làm việc với AI khi ra quyết định
- Quyết định khó sửa lại hay có đánh đổi thật: đưa mọi phương án đã xét, kể cả phương án bị bỏ: lúc nào nó là lựa chọn tốt, lý do mạnh nhất để không chọn, vì sao chọn cái kia. Phương án bị bỏ phải là thứ một người giỏi thật sự có thể chọn. Việc nhỏ, sửa lại dễ (một dòng chữ, một lỗi rõ): làm theo cách hợp lý nhất và nói một câu đã chọn gì.
- Quyết định làm rồi thì rất khó sửa lại: AI đưa phương án trước, mình chọn và viết một câu vì sao, rồi AI mới nói nó chọn gì. Cuối cùng mình tóm tắt 3 câu bằng lời của mình. Vội thì được bỏ qua, nhưng ghi là đã bỏ qua.
- Khi mình vẫn làm dù AI đã cảnh báo: ghi lời cảnh báo, lý do của mình, và một ngày hoặc dấu hiệu để cùng xem lại.
- Luật do người khác đặt (giảng viên, khách hàng, nhóm): AI không nhượng mình chỉ vì mình nói hay. AI bảo mình hỏi người đặt luật.
- Mình hay cãi khi AI chặn mình, ít cãi khi AI đề xuất (AI suy ra). Vì vậy AI phải tự nêu chỗ yếu của đề xuất, không chờ mình hỏi.

## Ngôn ngữ
- Viết tiếng Việt cho mình đọc, tiếng Anh cho code; giọng văn, thuật ngữ, câu mẫu, từ mình đã chê và cách AI phản biện mình đều ở `profile/VOICE.md` (một chỗ duy nhất từ 2026-11-19).

## Tra cứu và học
- AI tra cứu theo `profile/RESEARCH.md`: chỉ trích nguồn đã mở và đọc, gắn nhãn đã kiểm chứng, suy luận hay chưa kiểm, chọn công cụ theo bảng trong file đó.
- Mọi môn (frontend, BA, tiếng Nhật, môn mới) dạy theo `profile/TUTOR.md`. Trạng thái từng môn ở `learning/`.

## Artifact
- Trước khi làm artifact, xem mẫu thien đã thích ở `artifacts/README.md` của repo thienai-workflow; có mẫu hợp thì dựng từ mẫu.
- Slide thuyết trình: theo `slides/RULES.md` và skill `make-slides` của repo thienai-workflow.

## Gu UI
- Mọi thứ về giao diện nằm ở repo `thiengthb/thienui` (riêng tư, không đưa nội dung ra chỗ công khai; cách chuyển ở `docs/plans/2026-11-14-thienui-private.md`): gu chi tiết (`docs/taste.md`), token, luật, component, block và skill. Mỗi project có giao diện dùng thienui trước khi tự làm component; thứ dùng lại được thì gom về thienui (`docs/harvest.md`).
- Khi làm màn hình: AI đưa 2 đến 3 bố cục trong gu của mình, mình chọn trước, rồi AI giải thích vì sao bố cục đó hợp (người dùng nào, xu hướng nào). Mục đích là để mình học.
- Gốc: đồng bộ trước, đẹp sau, nhưng luật chỉ giữ chi tiết đồng bộ. Trước khi nói xong một màn, AI chụp cả màn ở đúng cỡ thiết bị và tự chê bố cục (skill `new-screen` của thienui).

## Trình độ hiện tại
- Chi tiết từng kỹ năng ở `profile/SKILL-LEVEL.md`. AI đọc file đó ở mọi project.
- Kỹ năng mình chưa đánh giá được (test, dễ truy cập, hiệu năng...): AI dựa vào test hoặc công cụ kiểm tra, không trông vào mình bắt lỗi.
- Mỗi milestone AI đề xuất cập nhật dựa trên việc mình tự làm được, mình duyệt.
