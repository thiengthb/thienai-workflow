# Bài 4: User story

Học ngày 2026-11-17 với Claude (nick tnt628) · [Trang tương tác](../pages/lesson-04.html) · [Bản đăng](https://claude.ai/artifact/NQVEqtKfmyTf9vvXrWwDW5)

User story là một câu ba phần ghi lại nhu cầu của một người dùng:

| Phần | Ghi gì | Tránh |
|---|---|---|
| Là… | Người cụ thể và hoàn cảnh của họ | "Người dùng" (ai cũng đúng nên không giúp chọn gì) |
| Tôi muốn… | Điều họ muốn làm được | Nút, màu, công nghệ (đó là cách làm, chốt sau) |
| Để… | Lý do thật, thường chỉ lộ ra khi hỏi về một lần cụ thể | Lý do nhóm tự đoán ("để app đẹp hơn") |

**Ví dụ (mô phỏng):** Hà, người dùng sakubun, nhắn "thêm chế độ tối đi". Hỏi "lần gần nhất chị học, ở đâu, lúc mấy giờ?" thì Hà kể học lúc 11 giờ đêm, nằm cạnh con, màn sáng làm con cựa mình nên phải tắt máy giữa chừng. Story:

> **Là** người đi làm, học lúc tối muộn trong phòng tối, **tôi muốn** học được khi phòng tắt đèn mà màn không chói, **để** xong bài 15 phút mà con không thức giấc.

Có phần "để" rồi, nhóm so được nhiều cách: chế độ tối, tự giảm sáng sau 10 giờ, chế độ nghe không cần nhìn màn. So từng cách với phần "để" trước, rồi chọn cách ít công nhất trong số những cách đạt. Ghi sẵn "thêm nút chế độ tối" thì mất hết các lựa chọn đó.

Story không phải bản đặc tả. Nó là lời nhắc để nói chuyện tiếp với người dùng, rồi chốt "thế nào thì coi là xong" (buổi BA 5).

## Tự kiểm

1. Người dùng nhắn "thêm chế độ tối đi". Viết thẳng "tôi muốn có nút chế độ tối" vào story thì mất gì?
<details><summary>Đáp án</summary>Mất lý do thật và mất các cách khác. Chế độ tối là giải pháp người dùng tự nghĩ ra. Hỏi về một lần cụ thể để ra phần "để" (ví dụ: không làm con thức), rồi mới so chế độ tối với các cách khác như tự giảm sáng.</details>

2. Ba phần của một user story là gì, và phần nào thường chỉ lộ ra khi hỏi về một lần cụ thể?
<details><summary>Đáp án</summary>"Là…" (người cụ thể và hoàn cảnh), "tôi muốn…" (điều họ muốn làm được, chưa phải nút nào), "để…" (lý do thật). Phần "để" thường chỉ lộ ra khi hỏi về một lần làm thật gần đây.</details>

3. "Là sinh viên, tôi muốn nhận thông báo đẩy lúc 8 giờ tối, để không quên ôn bài." Phần nào là giải pháp đã chốt sẵn?
<details><summary>Đáp án</summary>"Nhận thông báo đẩy lúc 8 giờ tối". Sửa: "tôi muốn được nhắc ôn vào lúc tôi hay rảnh".</details>

## Bạn đã nói

Nam (bạn cùng nhóm) hỏi: "Hà bảo thêm chế độ tối thì làm chế độ tối thôi, viết story làm gì?"

> Chưa chắc chế độ tối là chế độ người dùng cần, vì cần phải dựa vào lý do hành động mà họ muốn làm nữa, giống như họ là mẹ bỉm sữa, con nhỏ, hay đọc app vào lúc tối, sau khi con ngủ, màn sáng thì con cựa quậy, nên cần có cách nào để giải quyết vấn đề này, không nhất thiết phải là chế độ tối, có thể là giảm sáng tự động sau 10h, chế độ nghe thay vì đọc, ... . Nhưng giải pháp cần luôn phải khả thi và tối ưu, tốn ít công sức, nên chế độ tối mới được ưu tiên

Đã tách được nhu cầu khỏi giải pháp và tự nghĩ ra cách khác. Còn thiếu: viết điều đó thành câu story, và chọn cách ít công nhất trong số những cách đạt phần "để", chứ không chọn chế độ tối chỉ vì ít công.

Nguồn: câu mẫu "Là…, tôi muốn…, để…" phổ biến qua sách [User Stories Applied](https://www.mountaingoatsoftware.com/books/user-stories-applied) của Mike Cohn (2004). Story là lời nhắc để nói chuyện: Ron Jeffries, [Card, Conversation, Confirmation](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/) (2001). Hà, Nam và sakubun trong bài là mô phỏng.
