# Bài 5: Một màu nhấn cho mỗi màn

Học ngày 2026-11-12 · Trang tương tác: [`../pages/lesson-05.html`](../pages/lesson-05.html)

## Ý chính

**Mắt nhìn trước vào chỗ có màu đặc, đậm nhất.** Nên mỗi màn chỉ để một chỗ như vậy: việc chính người dùng cần làm. Đầu trang, tên, biểu tượng để đen, trắng, xám.

**Màu khác chỉ dùng khi nó mang nghĩa** (xanh lá là ổn, đỏ là lỗi hay hết, vàng cam là cần chú ý), và khi đó dùng nền nhạt, chữ đậm cùng tông, luôn có chữ đi kèm.

"Một màu nhấn" không có nghĩa là cấm mọi màu. Cùng một màu nhấn có thể dùng cho liên kết, ô đang chọn, nút chính, miễn chỉ nút chính là khối đặc to nhất.

## Ví dụ đã xem

Màn đặt lịch khám (tự dựng). Bản gốc có 5 chỗ màu đặc giành mắt với nút "Đặt lịch": thanh đầu trang xanh trùng màu nút, tên bác sĩ tím, thẻ "Còn 3 chỗ" xanh lá đặc, nhãn "Giảm 20%" cam đặc, trái tim đỏ đặc.

Bản sửa: đầu trang nền trắng, tên chữ đen, thẻ "Còn 3 chỗ" xanh lá nhạt (vẫn giữ vì đây là tin giúp quyết định đặt), nhãn giảm giá nhạt hoặc xám, tim viền xám.

## Con số để nhớ

| Chuyện | Con số |
|---|---|
| Màu nhấn | 1 màu cho mỗi app, chỉ một khối đặc mỗi màn |
| Sắc xám | Một màn tốt thường có 8–10 sắc xám cho chữ, viền, nền |
| Độ tương phản chữ | Chữ nhỏ ít nhất 4,5:1, chữ to ít nhất 3:1 (WCAG) |
| Thẻ đặc và thẻ nhạt | Chữ trắng trên xanh lá đặc 3,3:1 (chưa đạt). Chữ xanh đậm trên nền xanh nhạt 6,5:1 (đạt). Thẻ nhạt vừa yên vừa dễ đọc hơn |
| Mù màu | Khoảng 5–8% nam giới khó phân biệt đỏ và xanh lá, nên màu không được nói một mình |

## Tự kiểm

1. Màn có thanh đầu trang cùng màu với nút chính. Sao lại không ổn?
   <details><summary>Đáp án</summary>Hai khối cùng màu đặc thì mắt không biết khối nào là chỗ bấm, và thanh đầu trang to hơn nên còn giành mắt mạnh hơn. Để đầu trang nền trắng hoặc xám rất nhạt.</details>
2. Thẻ trạng thái "Đã thanh toán" trong bảng đơn hàng nên trông thế nào?
   <details><summary>Đáp án</summary>Nền xanh lá nhạt, chữ xanh lá đậm, có chữ. Thẻ đặc lặp lại hàng chục dòng sẽ giành hết mắt; chấm màu không chữ thì người mù màu không đọc được.</details>
3. Nút "Xóa tài khoản" ở màn cài đặt nên làm thế nào?
   <details><summary>Đáp án</summary>Chữ đỏ hoặc nút viền đỏ, để ở cuối. Nút đỏ đặc chỉ dùng ở bước xác nhận xóa, vì lúc đó xóa mới là việc chính.</details>

## Bạn đã nói

> Màu chính của app sẽ chỉ được xuất hiện trong tác vụ chính của màn để biết hành động đó, không được để các phần khác dùng màu này để tranh phần chú ý. Nhưng cũng không có nghĩa một màu là một màu chỉ được sử dụng trong màn đó, cần có các màu trạng thái, nhưng nên để nhạt hoặc là màu xám.

Mong muốn: tìm hiểu sâu hơn về màu, màu nào hợp với tính năng nào, app nào, người dùng nào, độ tuổi nào.
