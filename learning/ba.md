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
| 5 | Điều kiện hoàn thành | Thế nào thì coi là xong, để không ai cãi nhau lúc nghiệm thu | |
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
| 2 | 2026-11-12 | Hỏi chuyện người dùng, phỏng vấn sakubun mô phỏng (Codex) | Khoảng 6 phút; nhớ lại đúng, chọn câu về lần cụ thể và câu hỏi tiếp, đúng câu hỏi nhanh. Tự nói lại: "bạn bị mắc vấn đề gì, tại sao lại vậy"; chưa nhắc đến một lần cụ thể và tránh dẫn dắt. Thấy hơi dài, độ khó vừa; nhiều chữ, ít hình, dẫn dắt kém, không biết luồng đi. thien chê giao diện trang của Codex kém hơn các trang trước (không theo khung chung, không theo thienui), nên Claude làm lại trang ([lesson-02.html](ba/pages/lesson-02.html), bản Codex giữ ở [lesson-02-codex.html](ba/pages/lesson-02-codex.html)): bản đồ 4 chặng phỏng vấn, sổ ghi chép dữ kiện thật và lời đoán, 5 cái bẫy khi hỏi, bắt lỗi một đoạn phỏng vấn. Buổi làm lại (Claude, 25 phút): ôn đúng 3/3. Phỏng vấn đúng chặng 1 và 3, nhưng chặng 2 rơi vào bẫy gợi sẵn giải pháp; có bấm thử một câu khác để xem lời đáp. Bắt lỗi đoạn phỏng vấn được 2/3 chỗ, câu hỏi nhanh đúng 2/2. Tự nói lại chỉ còn "bạn mắc vấn đề gì", ngắn hơn bản ở Codex. thien thấy bản này tốt hơn bản Codex, độ dài và độ khó vừa, mạch "tạm được", hứng thú "bình thường", nhưng nói thẳng: "hôm nay học quá nhiều nên không theo được nữa" (cùng ngày đã học BA 1, BA 2 bản Codex rồi bản làm lại). Chỗ cần chắc lại: nghe người dùng kể xong thì hỏi tiếp về chuyện đã xảy ra, chưa đưa giải pháp ra hỏi. |
| 3 | 2026-11-16 | Các bên liên quan: lưới quyền và quan tâm cho app điểm danh của trường ([bài](ba/lessons/03-stakeholders.md)) | 15 phút, độ dài "vừa", độ khó "khó", bảng dán "như nhau" so với trang cũ. Ôn đúng 3/3, kể cả B6 (bẫy gợi sẵn giải pháp của BA 2), và hỏi phòng đào tạo chọn ngay câu về lần xét cấm thi gần nhất, mở ra phòng công tác SV. Xếp đúng 5/7: IT vào "Bàn kỹ" thay vì "Giữ hài lòng", phòng công tác SV vào "Báo tin đều" thay vì "Bàn kỹ"; có bấm xem Claude làm mẫu. Câu hỏi nhanh chọn sinh viên "vì dùng nhiều nhất" thay vì IT: thien đang xếp theo ai dùng nhiều, ai hay xuất hiện, chưa theo ai chặn được. Tình huống thêm (thu ngân quán cà phê) lại chọn câu gợi sẵn giải pháp: tránh được bẫy ở câu quen, sang bối cảnh mới thì chưa. Tự nói lại có "dựa trên quan tâm và quyền lực, gặp sớm người có quyền chặn" (xem bản mẫu trước khi viết), chưa có cách tìm ra người bị sót. Không trả lời câu "điều gì làm buổi BA hấp dẫn hơn" |
| 4 | 2026-11-17 | User story: Hà, người dùng sakubun (mô phỏng), xin "thêm chế độ tối" ([bài](ba/lessons/04-user-stories.md)) | 14 phút, độ dài và độ khó "vừa", tình huống sakubun "như nhau" so với app điểm danh. Ôn đúng 3/4: B7 lại sai, chọn gặp IT "cuối dự án, lúc cần nối dữ liệu" (lần thứ hai vướng chỗ "ai chặn được"). Hỏi Hà chọn ngay câu về lần học gần nhất: lần này tránh được bẫy gợi sẵn giải pháp ở bối cảnh lạ. Ghép story 5/7: để "Người dùng" vào ô "Là" và "Nền màu #121212" vào ô "Để". Câu hỏi nhanh 2/2, kể cả câu tìm giải pháp nằm lẫn trong story (đúng chỗ thẻ B2 từng sai hai lần); tình huống thêm (chị Lan, app chi tiêu) đúng. Tự nói lại viết trước khi xem bản mẫu: tách được nhu cầu khỏi giải pháp, tự nghĩ ra cách khác (giảm sáng sau 10 giờ, chế độ nghe); chưa viết thành câu story, chưa nói story giúp biết khi nào là xong, và cuối cùng vẫn chọn chế độ tối "vì ít công" mà chưa so với phần "để". Góp ý lớn: ý hoàn toàn mới như user story mà vào thử ngay thì ngượng, không biết phải làm gì; thien muốn một đoạn giới thiệu ngắn trước khi thử, thử xong mới đi sâu. Đã đưa vào khung chung (bước 3 của `README.md`) |

## Chỗ còn vướng
AI ghi sau mỗi buổi (nháp từ `artifacts/lesson/after-lesson.mjs`), xóa dòng khi thien đã làm đúng ở buổi sau. Trang buổi tới đưa các dòng này cho Claude khi thien hỏi, và AI dùng chúng cho phần nhớ lại.

- 2026-11-17, buổi 4: câu ôn “App đặt phòng lab cần lấy danh sách lớp từ hệ thống của trường. IT bảo không quan tâm app. Gặp IT lúc nào?” chọn “Cuối dự án, lúc cần nối dữ liệu”, đúng là “Ngay từ đầu, vì họ chặn được việc lấy dữ liệu” (sai lần hai, sau câu hỏi nhanh buổi 3: thien xếp IT theo lúc cần tới họ, chưa theo việc họ chặn được)
- 2026-11-17, buổi 4: bảng ghép story để “Người dùng” vào ô “Là” (đúng là người cụ thể kèm hoàn cảnh) và “Nền màu #121212” vào ô “Để” (đúng là bỏ ra ngoài, vì là chi tiết làm)
- 2026-11-17, buổi 4: tự nói lại tách được nhu cầu và giải pháp nhưng chưa viết thành câu story, và vẫn chọn chế độ tối “vì ít công” mà chưa xét nó có đạt phần “để” không

## Buổi tiếp theo
- Buổi BA 5: điều kiện hoàn thành (acceptance criteria). Nối thẳng từ story của Hà: "thế nào thì coi là màn không chói, con không thức?". Đây là chỗ tự nói lại buổi 4 còn thiếu.
- Mở bằng đoạn giới thiệu ngắn (khoảng 1 phút: điều kiện hoàn thành là gì, một ví dụ, việc sắp làm), rồi mới thử. thien xin điều này sau buổi 4 vì user story là ý hoàn toàn mới mà bài cho thử ngay; giờ là luật ở bước 3 của khung chung.
- Ôn "ai chặn được" lần ba bằng một tình huống khác hẳn (không phải IT trường), vì thien vẫn xếp theo lúc cần tới họ.
- Nhắc lại khi chọn giải pháp: so từng cách với phần "để" trước, rồi mới xét cách nào ít công.
- Giữ khoảng 15 phút, độ khó "vừa" là đúng mức. Bảng không có tên trục ở buổi 4 không còn lỗi chữ đè thẻ; lưới 2×2 có trục vẫn chưa sửa (README của `artifacts/it/`, mục "Chưa làm").
