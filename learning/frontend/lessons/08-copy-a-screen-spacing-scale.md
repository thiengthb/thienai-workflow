# Bài 8: Chép lại một màn, đo khoảng cách bằng mắt

Học ngày 2026-11-17 · Trang tương tác: [`../pages/lesson-08.html`](../pages/lesson-08.html) (nguồn; bản đăng ở nick tnt697: https://claude.ai/artifact/SNn544T5RTNcd6APZtHnCd)

## Ý chính

**Thứ càng thuộc về nhau thì càng gần, và mỗi số lấy từ một thang có sẵn.** Mắt đọc khoảng trắng trước khi đọc chữ: hai thứ gần nhau thì mắt coi là một nhóm. Nên khoảng cách phải cho thấy màn có mấy tầng, và tầng trong luôn nhỏ hơn tầng ngoài.

1. **Trong nhỏ hơn ngoài, gấp ít nhất 2 lần.** Màn "Sách của tôi": 4 giữa tên sách và tác giả (một cuốn), 16 giữa các cuốn trong một nhóm, 32 giữa hai nhóm "Đang mượn" và "Đặt trước". 16 gấp 4 lần 4, 32 gấp 2 lần 16.
2. **Lấy số từ thang 4, 8, 16, 24, 32**, không nghĩ ra từng chỗ. Hai số cạnh nhau trong thang luôn khác rõ (8 và 16, không phải 14 và 16), và cả app dùng chung một nhịp.
3. **Lề màn bằng khoảng giữa các cuốn (16)**, để mép màn không lấn chỗ của nhóm.

**Lỗi của Vy không sửa bằng số đẹp hơn.** Vy để 10 trong một cuốn, 6 giữa các cuốn: tên tác giả "Nguyễn Nhật Ánh" cách sách của nó 10 mà cách cuốn dưới chỉ 6, nên trông như đi với "Clean Code". Sửa bằng cách giữ đúng thứ tự trong nhỏ hơn ngoài.

## Ví dụ đã xem

- App thư viện trường, màn "Sách của tôi" (bàn thử, màn tự dựng). Bản của Vy: 10 trong một cuốn, 6 giữa các cuốn, 14 giữa hai nhóm, lề 10. Bản thiết kế: 4, 16, 32, 16. Chữ và màu giống hệt, chỉ khác khoảng trắng.
- Bấm "Tự thấy": đặt lại hai số trong cùng của Vy, tên tác giả trông như thuộc cuốn bên dưới.
- Bốn màn khác: danh sách tin nhắn (đều 8 → 4 trong một người, 16 giữa hai người), bốn khoảng 13, 15, 17, 19 (sát nhau quá, mắt thấy như một số), app giao đồ ăn hai nút đặc "Hủy đơn" và "Theo dõi đơn" (lỗi điểm nhấn), tên sách 16 và tác giả 15 (hai bậc chữ gần bằng nhau, nên khoảng 13).

## Con số để nhớ

| Chuyện | Con số |
|---|---|
| Thang khoảng cách | 4, 8, 16, 24, 32 (bội số 4 và 8, quy ước nghề) |
| Mỗi tầng so với tầng trong | gấp ít nhất 2 lần: 4 → 16 → 32 |
| Lề màn | bằng khoảng giữa các mục (16) |
| Bậc chữ cạnh nhau | khác khoảng 1,2–1,3 lần (16 thì bậc dưới khoảng 13) |

## Tự kiểm

1. Tên tác giả cách sách của nó 10, cách cuốn bên dưới 6. Mắt thấy gì, sửa theo luật nào?
   <details><summary>Đáp án</summary>Mắt ghép tác giả với cuốn bên dưới, vì nó gần cuốn đó hơn. Sửa theo luật trong nhỏ hơn ngoài: ví dụ 4 trong một cuốn, 16 giữa các cuốn.</details>
2. Một màn dùng bốn khoảng 13, 15, 17, 19. Vì sao nên đổi, đổi thế nào?
   <details><summary>Đáp án</summary>Bốn số sát nhau trông như một, nên màn không có tầng. Lấy từ thang 4, 8, 16, 24, 32 để mỗi bậc khác rõ.</details>
3. Danh sách tin nhắn: tên người và dòng tin cách 8, hai người cũng cách 8. Sửa thành bao nhiêu?
   <details><summary>Đáp án</summary>4 trong một người, 16 giữa hai người. Đều 12 cho thoáng thì vẫn không thấy tin nào của ai.</details>

## Bạn đã nói

Đề: Vy nhắn "Mình để 10, 6, 14 cho dễ nhìn mà. Sao bạn bảo đổi sang 4, 16, 32? Nhìn có khác mấy đâu."

> Vì khoảng cách các phần này không rõ và nên theo khoảng 4 8 16 32

Viết trước khi mở bản của Claude. Đã nói được thang số (chỗ vướng từ buổi 3 và buổi 7). Còn thiếu lý do "trong nhỏ hơn ngoài" và chuyện cụ thể trên màn: tên tác giả trông như thuộc cuốn bên dưới. Bản của Claude: người dùng mở màn để xem cuốn nào sắp phải trả; bản của Vy để tác giả cách sách 10 mà cách cuốn dưới 6, nên "Nguyễn Nhật Ánh" như đi với "Clean Code"; lấy số từ thang, mỗi tầng gấp ít nhất 2 lần tầng trong: 4, 16, 32.

Trên bàn thử: đạt 100% giống bản thiết kế sau 21 lần vặn (buổi 6: 4 lần), có thử 2, 10, 24, 48 trước khi về đúng số.

## Nguồn và mức chắc chắn

- Có nghiên cứu: mắt gom những thứ ở gần nhau thành một nhóm (luật gần nhau của tâm lý học Gestalt); kỹ năng nhìn lên nhanh nhờ nhiều lượt chọn ngắn có phản hồi ngay ([Kellman, Massey và Son, 2010](https://pubmed.ncbi.nlm.nih.gov/25163790/)).
- Quy ước nghề: thang khoảng cách theo bội số 4 và 8 ([Material Design](https://m2.material.io/design/layout)); thang có bậc cách xa nhau thay vì chọn từng số (Refactoring UI).
- Cách học: chép lại từng con số của một màn tốt rồi nói ra mẹo là bài tập của Erik Kennedy ([5 bài tập học UI](https://learnui.design/blog/5-practical-exercises-learn-ui-design-free.html)). Màn thư viện và bản của Vy là màn tự dựng.
