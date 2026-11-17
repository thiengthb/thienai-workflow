# Học BA: hồ sơ và trạng thái

File này để tài khoản nào, model nào cũng dạy tiếp được cho thien. Đọc hết trước khi soạn buổi BA mới. Cập nhật mục "Nhật ký" và "Buổi tiếp theo" sau mỗi buổi. Vòng xoay giữa các môn và khung một buổi ở [`README.md`](README.md); luật dạy chung ở `profile/TUTOR.md`.

## Mục tiêu
- BA là môn mở rộng trong vòng xoay (khoảng 1 buổi mỗi tuần), cũng là một trong 3 mục tiêu 6 tháng của thien.
- thien muốn dùng BA để: làm PO đồ án capstone tốt hơn, giao việc cho AI rõ hơn, hiểu người dùng app mình làm, đi làm BA thật sau này, hiểu sếp và khách hàng muốn gì. Lời của thien: "hiểu được người dùng, từ đó biết cách đưa ra frontend hợp lý và một hệ thống sử dụng đủ chứ không thừa chức năng mà chả giải quyết vấn đề gì".
- Đã biết (thien tự chọn, buổi 1): user story, use case, phỏng vấn người dùng, xếp ưu tiên ở mức "nghe qua"; vẽ luồng công việc "chưa". Khớp với `profile/SKILL-LEVEL.md` (user story, phỏng vấn người dùng ở mức chưa tự đánh giá được).

## Bản đồ 10 ý lớn
Thứ tự học. 3 ý đầu do thien chọn ở buổi 1; 7 ý sau AI xếp theo độ gần với việc PO capstone, thien đổi được bất cứ lúc nào.

| Thứ tự | Ý | Một dòng | Trạng thái |
|---|---|---|---|
| 1 | Yêu cầu và nhu cầu | Tìm vấn đề thật đằng sau điều người ta nhờ | Đã học buổi 1 |
| 2 | Hỏi chuyện người dùng | Hỏi sao cho họ kể chuyện thật, không nói điều họ nghĩ bạn muốn nghe | Đã học buổi 2 |
| 3 | Các bên liên quan | Ai dùng, ai trả tiền, ai quyết định, ai bị ảnh hưởng | Đã học buổi 3 |
| 4 | User story | Viết một nhu cầu thành câu "Là…, tôi muốn…, để…" | Đã học buổi 4 |
| 5 | Điều kiện hoàn thành | Thế nào thì coi là xong, để không ai cãi nhau lúc nghiệm thu | Đã học buổi 5 |
| 6 | Vẽ luồng công việc | Các bước người dùng đi qua, chỗ nào hay tắc | |
| 7 | Xếp ưu tiên | Không đủ thời gian thì làm gì trước, bỏ gì | |
| 8 | Use case | Ai làm gì với hệ thống, kể cả khi có lỗi | |
| 9 | Yêu cầu không ai nói ra | Nhanh, an toàn, dễ dùng: người dùng không nhờ nhưng sẽ phàn nàn | |
| 10 | Dữ liệu nhìn từ nghiệp vụ | Các "thứ" trong hệ thống và quan hệ giữa chúng | |

## Cách dạy môn này

Phỏng vấn mô phỏng và chọn câu hỏi để thấy lời đáp thay đổi; sau đó rút ra cách hỏi. Dùng câu mở, trung tính, hỏi về trải nghiệm cụ thể và hỏi tiếp theo điều người dùng kể ([GOV.UK: phỏng vấn chuyên sâu](https://www.gov.uk/service-manual/user-research/using-in-depth-interviews); [hỏi về hành vi](https://userresearch.blog.gov.uk/2014/07/11/what-makes-a-good-user-research-facilitator/)). Một cuộc phỏng vấn tạo giả thuyết, chưa đủ chứng minh nhu cầu phổ biến. Kết hợp các tình huống của sakubun và capstone; thể hiện luồng bằng hình, ít chữ, cho biết đang ở bước nào.

## Kiểu buổi
Từ buổi 3, trang có bảng dán (`artifacts/it/`): xếp thẻ người hay thẻ việc vào ô hoặc vào luồng, bấm thẻ để nghe người đó nói. Kiểu 2, 4, 5 dưới đây làm trên bảng thay cho đoạn văn.

Khung chung ở `README.md`. Phần "thử trước" của BA (AI đề xuất, mới thử kiểu 1 và 2):
1. **Chọn câu hỏi lại** (buổi 1): một lời nhờ trong nhóm, thien chọn câu BA nên hỏi đầu tiên.
2. **Xếp thẻ** (buổi 1): bấm từng thẻ để xếp vào hai nhóm, ví dụ nhu cầu hay giải pháp.
3. **Đóng vai phỏng vấn**: AI đóng người dùng, thien chọn câu hỏi tiếp theo, câu trả lời đổi theo câu thien chọn.
4. **Tìm chỗ thiếu**: một user story hay một luồng bị thiếu bước hoặc thiếu điều kiện, thien bấm vào chỗ thiếu.
5. **Kéo thành luồng**: sắp các bước rời thành luồng công việc, rồi tìm chỗ hay tắc.

Lấy tình huống từ việc thật của thien khi có thể: đồ án capstone, app sakubun, todo. thien thấy BA "bình thường" sau buổi 1 (frontend thì "thích"), nên tình huống càng gần việc của thien càng tốt.

## Nhật ký
Nhật ký cũ hơn ở [ba/log.md](ba/log.md).

| Buổi | Ngày | Ý chính | Kết quả |
|---|---|---|---|
| 3 | 2026-11-16 | Các bên liên quan: lưới quyền và quan tâm cho app điểm danh của trường ([bài](ba/lessons/03-stakeholders.md)) | 15 phút, độ dài "vừa", độ khó "khó", bảng dán "như nhau" so với trang cũ. Ôn đúng 3/3, kể cả B6 (bẫy gợi sẵn giải pháp của BA 2), và hỏi phòng đào tạo chọn ngay câu về lần xét cấm thi gần nhất, mở ra phòng công tác SV. Xếp đúng 5/7: IT vào "Bàn kỹ" thay vì "Giữ hài lòng", phòng công tác SV vào "Báo tin đều" thay vì "Bàn kỹ"; có bấm xem Claude làm mẫu. Câu hỏi nhanh chọn sinh viên "vì dùng nhiều nhất" thay vì IT: thien đang xếp theo ai dùng nhiều, ai hay xuất hiện, chưa theo ai chặn được. Tình huống thêm (thu ngân quán cà phê) lại chọn câu gợi sẵn giải pháp: tránh được bẫy ở câu quen, sang bối cảnh mới thì chưa. Tự nói lại có "dựa trên quan tâm và quyền lực, gặp sớm người có quyền chặn" (xem bản mẫu trước khi viết), chưa có cách tìm ra người bị sót. Không trả lời câu "điều gì làm buổi BA hấp dẫn hơn" |
| 4 | 2026-11-17 | User story: Hà, người dùng sakubun (mô phỏng), xin "thêm chế độ tối" ([bài](ba/lessons/04-user-stories.md)) | 14 phút, độ dài và độ khó "vừa", tình huống sakubun "như nhau" so với app điểm danh. Ôn đúng 3/4: B7 lại sai, chọn gặp IT "cuối dự án, lúc cần nối dữ liệu" (lần thứ hai vướng chỗ "ai chặn được"). Hỏi Hà chọn ngay câu về lần học gần nhất: lần này tránh được bẫy gợi sẵn giải pháp ở bối cảnh lạ. Ghép story 5/7: để "Người dùng" vào ô "Là" và "Nền màu #121212" vào ô "Để". Câu hỏi nhanh 2/2, kể cả câu tìm giải pháp nằm lẫn trong story (đúng chỗ thẻ B2 từng sai hai lần); tình huống thêm (chị Lan, app chi tiêu) đúng. Tự nói lại viết trước khi xem bản mẫu: tách được nhu cầu khỏi giải pháp, tự nghĩ ra cách khác (giảm sáng sau 10 giờ, chế độ nghe); chưa viết thành câu story, chưa nói story giúp biết khi nào là xong, và cuối cùng vẫn chọn chế độ tối "vì ít công" mà chưa so với phần "để". Góp ý lớn: ý hoàn toàn mới như user story mà vào thử ngay thì ngượng, không biết phải làm gì; thien muốn một đoạn giới thiệu ngắn trước khi thử, thử xong mới đi sâu. Đã đưa vào khung chung (bước 3 của `README.md`) |
| 5 | 2026-11-17 | Điều kiện hoàn thành cho story của Hà: lưới "kiểm được" × "bám phần để" ([bài](ba/lessons/05-acceptance-criteria.md)) | 60 phút trên trang, góp ý "dài" và "khó" (dài gấp 4 buổi 4); đoạn giới thiệu đầu bài "đủ để bắt đầu"; lưới có tên trục "như nhau" so với bảng không trục. Ôn đúng 4/4, kể cả câu "ai chặn được" lần ba ở tình huống khác hẳn (hội đồng capstone): lần này xếp theo quyền chặn, không theo lúc xuất hiện. Hỏi Hà chọn ngay câu kể lại tối qua, mở được thẻ ẩn tiếng "ting". Bảng 3/7: đưa "Màn không chói" và "Nền #121212" vào "Dùng làm điều kiện", còn "độ sáng tự hạ sau 22 giờ" và "Hà dùng thử 3 tối" vào "Viết lại cho rõ": trục "kiểm được" bị đảo, điều mơ hồ coi là dùng được, điều đo được lại coi là cần viết lại; #121212 lần hai bị coi như thứ Hà cần. Có xem Claude làm mẫu trên bảng. Câu hỏi nhanh 2/2, kể cả câu so ba cách với điều kiện trước khi xét công (chỗ vướng buổi 4). Bài tự nói lại lưu lại trùng nguyên văn bản của Claude, nên buổi này chưa biết thien tự viết điều kiện được tới đâu |

## Chỗ còn vướng
AI ghi sau mỗi buổi (nháp từ `artifacts/lesson/after-lesson.mjs`), xóa dòng khi thien đã làm đúng ở buổi sau. Trang buổi tới đưa các dòng này cho Claude khi thien hỏi, và AI dùng chúng cho phần nhớ lại.

- 2026-11-17, buổi 4: bảng ghép story để “Người dùng” vào ô “Là” (đúng là người cụ thể kèm hoàn cảnh) và “Nền màu #121212” vào ô “Để” (đúng là bỏ ra ngoài, vì là chi tiết làm)
- 2026-11-17, buổi 5: bảng điều kiện để “Nền màu #121212” vào “Dùng làm điều kiện” (đúng là “Cách làm, để sau”): lần hai coi chi tiết làm như điều người dùng cần, sau ô “Để” ở buổi 4
- 2026-11-17, buổi 5: bảng điều kiện đảo trục “kiểm được”: “Màn không chói” vào “Dùng làm điều kiện” (đúng là “Viết lại cho rõ”), còn “độ sáng tự hạ sau 22 giờ” và “Hà dùng thử 3 tối” vào “Viết lại cho rõ” (đúng là dùng thẳng, vì đã đo được)
- 2026-11-17, buổi 5: bài tự nói lại trùng nguyên văn bản của Claude, chưa có câu điều kiện nào do thien tự viết

## Buổi tiếp theo
- Buổi BA 6: vẽ luồng công việc (ý 6 trên bản đồ), kiểu "kéo thành luồng" trên bảng dán `.zones.flow`. Lấy tiếp tình huống Hà và sakubun: các bước một tối Hà học, chỗ nào tắc (kéo độ sáng, tiếng "ting").
- Ngắn lại: BA 5 tốn 60 phút, thien chấm "dài" và "khó". Bảng tối đa 5 thẻ, bỏ một bước nghe hay hỏi nếu bài đã có bảng; nhắm lại 15 phút.
- Phần nhớ lại: một câu ôn trục "kiểm được": cho hai điều kiện, một mơ hồ ("app mượt"), một đo được ("mở bài trong 2 giây"), hỏi cái nào dùng thẳng được. Thêm một thẻ là chi tiết làm (mã màu, tên thư viện) để tách khỏi điều kiện lần ba.
- Tự nói lại: nhắc trong đề là trả lời bằng lời của mình, vì bản lưu buổi 5 trùng nguyên văn bản mẫu.
- Đoạn giới thiệu đầu bài "đủ để bắt đầu": giữ cho ý mới. Lưới có trục không hơn bảng không trục, nên chỉ dùng trục khi trục chính là thứ đang học.
