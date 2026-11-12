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
| 3 | Các bên liên quan | Ai dùng, ai trả tiền, ai quyết định, ai bị ảnh hưởng | |
| 4 | User story | Viết một nhu cầu thành câu "Là…, tôi muốn…, để…" | |
| 5 | Điều kiện hoàn thành | Thế nào thì coi là xong, để không ai cãi nhau lúc nghiệm thu | |
| 6 | Vẽ luồng công việc | Các bước người dùng đi qua, chỗ nào hay tắc | |
| 7 | Xếp ưu tiên | Không đủ thời gian thì làm gì trước, bỏ gì | |
| 8 | Use case | Ai làm gì với hệ thống, kể cả khi có lỗi | |
| 9 | Yêu cầu không ai nói ra | Nhanh, an toàn, dễ dùng: người dùng không nhờ nhưng sẽ phàn nàn | |
| 10 | Dữ liệu nhìn từ nghiệp vụ | Các "thứ" trong hệ thống và quan hệ giữa chúng | |

## Cách dạy môn này

Phỏng vấn mô phỏng và chọn câu hỏi để thấy lời đáp thay đổi; sau đó rút ra cách hỏi. Dùng câu mở, trung tính, hỏi về trải nghiệm cụ thể và hỏi tiếp theo điều người dùng kể ([GOV.UK: phỏng vấn chuyên sâu](https://www.gov.uk/service-manual/user-research/using-in-depth-interviews); [hỏi về hành vi](https://userresearch.blog.gov.uk/2014/07/11/what-makes-a-good-user-research-facilitator/)). Một cuộc phỏng vấn tạo giả thuyết, chưa đủ chứng minh nhu cầu phổ biến. Kết hợp các tình huống của sakubun và capstone; thể hiện luồng bằng hình, ít chữ, cho biết đang ở bước nào.

## Kiểu buổi
Khung chung ở `README.md`. Phần "thử trước" của BA (AI đề xuất, mới thử kiểu 1 và 2):
1. **Chọn câu hỏi lại** (buổi 1): một lời nhờ trong nhóm, thien chọn câu BA nên hỏi đầu tiên.
2. **Xếp thẻ** (buổi 1): bấm từng thẻ để xếp vào hai nhóm, ví dụ nhu cầu hay giải pháp.
3. **Đóng vai phỏng vấn**: AI đóng người dùng, thien chọn câu hỏi tiếp theo, câu trả lời đổi theo câu thien chọn.
4. **Tìm chỗ thiếu**: một user story hay một luồng bị thiếu bước hoặc thiếu điều kiện, thien bấm vào chỗ thiếu.
5. **Kéo thành luồng**: sắp các bước rời thành luồng công việc, rồi tìm chỗ hay tắc.

Lấy tình huống từ việc thật của thien khi có thể: đồ án capstone, app sakubun, todo. thien thấy BA "bình thường" sau buổi 1 (frontend thì "thích"), nên tình huống càng gần việc của thien càng tốt.

## Nhật ký
| Buổi | Ngày | Ý chính | Kết quả |
|---|---|---|---|
| 1 | 2026-11-12 | Làm quen, yêu cầu và nhu cầu (nút xuất Excel trong nhóm capstone) | 13 phút, độ dài và độ khó "vừa". Ôn frontend đúng 3/3. Chọn đúng câu hỏi lại "để làm gì", xếp đúng 5/5 thẻ nhu cầu và giải pháp, câu hỏi đúng 2/2. Tự nói lại có ý "vấn đề nằm sâu trong nhu cầu, giải pháp không hẳn là thứ họ muốn", chưa nhắc tới cách làm là hỏi "để làm gì" vài lần. Thấy BA "bình thường". Trang lỗi nút chọn không đổi màu lần đầu, đã sửa trong buổi |

| 2 | 2026-11-12 | Hỏi chuyện người dùng, phỏng vấn sakubun mô phỏng (Codex) | Khoảng 6 phút; nhớ lại đúng, chọn câu về lần cụ thể và câu hỏi tiếp, đúng câu hỏi nhanh. Tự nói lại: "bạn bị mắc vấn đề gì, tại sao lại vậy"; chưa nhắc đến một lần cụ thể và tránh dẫn dắt. Thấy hơi dài, độ khó vừa; nhiều chữ, ít hình, dẫn dắt kém, không biết luồng đi. |

## Buổi tiếp theo
- Buổi BA 3: các bên liên quan. Dùng sơ đồ người liên quan trong capstone; thể hiện rõ bước hiện tại và đích của luồng, ít chữ, tình huống trực quan. Nhắc lại cách hỏi về một lần cụ thể và tránh gợi sẵn đáp án.
- Ghi chú buổi đã học: Buổi BA 2: ý "Hỏi chuyện người dùng", kiểu 3 "Đóng vai phỏng vấn" để có phần bấm và thấy kết quả đổi ngay. Câu nhớ lại hỏi cách làm của buổi 1 (hỏi "để làm gì" 2–3 lần), vì thien chưa nói ra.
- Tình huống nên lấy từ đồ án capstone hoặc sakubun, vì sau buổi 1 thien thấy BA "bình thường". Hỏi thêm một câu ngắn ở cuối buổi: điều gì làm buổi BA hấp dẫn hơn.
