# Bài 5: Điều kiện hoàn thành

Học ngày 2026-11-17 với Claude (nick tnt697) · [Trang tương tác](../pages/lesson-05.html) · [Bản đăng](https://claude.ai/artifact/AhriFJ3Yo1QixeRKFG7FB7)

Từ mới: acceptance criteria

Điều kiện hoàn thành (acceptance criteria) là vài dòng đi kèm một user story, nói rõ làm tới đâu thì coi là xong. Mỗi điều kiện phải qua hai câu:

| Câu hỏi | Nghĩa là | Ví dụ không qua |
|---|---|---|
| Kiểm được không? | Ai thử cũng ra cùng một kết quả, nên lúc nghiệm thu không ai cãi | "Màn không chói": Nam bảo đạt, Hà bảo chưa |
| Bám phần "để" không? | Đạt nó là tiến gần tới lý do thật của người dùng | "Nền màu #121212": đo được, nhưng nền tối mà máy để sáng hết cỡ thì vẫn chói |

Điều gì bám "để" mà còn mơ hồ thì giữ ý, viết lại cho đo được. Điều gì là cách làm (nút, mã màu, công nghệ) thì để sau, lúc chọn cách. Hay viết theo mẫu **Khi** … **làm** … **thì** … (Given/When/Then).

**Ví dụ (mô phỏng):** story của Hà từ buổi 4:

> **Là** người đi làm, học lúc tối muộn trong phòng tối, **tôi muốn** học được khi phòng tắt đèn mà màn không chói, **để** xong bài 15 phút mà con không thức giấc.

Hỏi Hà kể lại tối qua thì lộ thêm chuyện tiếng "ting" lúc trả lời đúng làm con giật mình. Ba điều kiện:

1. Mở app sau 22 giờ: độ sáng tự hạ về mức thấp nhất, Hà không phải chỉnh.
2. Sau 22 giờ, app không phát tiếng, không rung.
3. Hà dùng thử 3 tối, tối nào cũng làm hết bài 15 phút, không tắt máy giữa chừng.

Có điều kiện rồi thì so được các cách: chế độ tối không hạ độ sáng và vẫn kêu "ting"; chế độ nghe thì phát tiếng. Tự hạ sáng và tắt tiếng sau 22 giờ qua được hai điều máy kiểm, rồi mới thử với Hà. So với điều kiện trước, xét công sau.

## Tự kiểm

1. Một điều kiện hoàn thành tốt phải qua hai câu nào?
<details><summary>Đáp án</summary>Kiểm được (ai thử cũng ra cùng kết quả) và bám phần "để" (đạt nó là tiến gần tới lý do thật của người dùng).</details>

2. Story "màn không chói để con không thức". "Nền app màu #121212" có nên là điều kiện hoàn thành không?
<details><summary>Đáp án</summary>Không. Nó đo được nhưng là cách làm: nền tối mà máy để sáng hết cỡ vẫn chói. Điều kiện nói điều phải đạt, ví dụ độ sáng tự về mức thấp nhất sau 22 giờ.</details>

3. "Màn không chói" đã dùng làm điều kiện được chưa?
<details><summary>Đáp án</summary>Chưa. Mỗi người hiểu "chói" một kiểu. Giữ ý, viết lại: "mở app sau 22 giờ, độ sáng tự về mức thấp nhất, Hà không phải chỉnh".</details>

## Bạn đã nói

Linh (bạn lo test của nhóm) hỏi: "Story của Hà ghi 'màn không chói'. Mình test kiểu gì để biết là xong?"

> Linh ơi, "không chói" thì ai test cũng cãi được, nên mình chốt ba điều. Mở app sau 22 giờ thì độ sáng tự về mức thấp nhất, Hà không phải chỉnh. Sau 22 giờ app không kêu, không rung, vì tiếng "ting" cũng làm con Hà giật mình. Cuối cùng cho Hà dùng thử 3 tối, tối nào cũng làm hết bài 15 phút mà không tắt máy. Qua cả ba mới coi là xong, kể cả khi nhóm có làm thêm chế độ tối.

Bản lưu trùng nguyên văn bản của Claude, nên chưa biết bạn tự viết điều kiện được tới đâu. Trên bảng, bạn đưa "Màn không chói" và "Nền #121212" vào ô điều kiện, còn hai điều đã đo được thì để vào ô viết lại: chỗ cần ôn là câu "kiểm được không?".

Nguồn: story gồm thẻ, cuộc nói chuyện và phần xác nhận (confirmation), tức các phép thử nghiệm thu: Ron Jeffries, [Card, Conversation, Confirmation](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/) (2001). Mẫu Given/When/Then: Dan North, [Introducing BDD](https://dannorth.net/introducing-bdd/) (2006). Hà, Linh và sakubun trong bài là mô phỏng.
