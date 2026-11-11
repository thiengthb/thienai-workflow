# Bài 3: Khoảng cách là cách nhóm

Học ngày 2026-11-11 · Trang tương tác: [`../pages/lesson-03.html`](../pages/lesson-03.html)

## Ý chính

Mắt người tự gom những thứ **đứng gần nhau** thành một nhóm. Dân thiết kế gọi đây là luật *proximity*: gần nhau thì là một nhóm. Vì vậy khoảng cách không chỉ để cho thoáng, mà để nói **cái gì đi với cái gì**.

Quy tắc: **khoảng cách giữa các nhóm phải lớn hơn hẳn khoảng cách trong một nhóm**, thường gấp 2 đến 3 lần. Mọi khoảng đều lấy từ một thang số cố định, ví dụ 4, 8, 16, 24, 32, để các khoảng lặp lại thành nhịp.

## Ví dụ đã xem

Ba cặp màn tự dựng, mỗi cặp chỉ khác một chỗ:

- **Form đăng ký:** nhãn "Email" cách ô của nó bằng đúng khoảng cách tới ô phía trên, nên mắt không biết nhãn thuộc ô nào. Sửa: nhãn sát ô của mình (6px), các cặp nhãn và ô cách nhau xa hơn (22px).
- **Màn cài đặt:** chữ dính sát mép thẻ, các dòng ép vào nhau nên nhìn bí và khó bấm. Sửa: thêm khoảng đệm trong thẻ (*padding*) 16px, mỗi dòng cao khoảng 48px.
- **Trang giới thiệu:** khoảng giữa hai phần nhỏ hơn khoảng giữa tiêu đề và đoạn văn của chính nó, nên các phần dính vào nhau. Sửa: trong phần 8px, giữa phần 30px.

## Tự kiểm

1. Nhãn cách ô phía trên 14px và cách ô của nó cũng 14px. Vì sao rối?
   <details><summary>Đáp án</summary>Mắt nhóm theo khoảng cách. Hai bên bằng nhau thì không biết nhãn thuộc ô nào. Tỷ lệ quan trọng hơn con số.</details>
2. Trong nhóm các dòng cách nhau 8px. Giữa hai nhóm nên bao nhiêu?
   <details><summary>Đáp án</summary>Khoảng 24px. 10px so với 8px thì mắt gần như không thấy khác.</details>
3. Vì sao nhiều design system chỉ cho dùng 4, 8, 12, 16, 24, 32?
   <details><summary>Đáp án</summary>Để các khoảng lặp lại có nhịp, và hai khoảng khác nhau thì khác hẳn, không lưng chừng.</details>

## Bạn đã nói

> Khoảng cách là cách nhóm thông tin được phân biệt với nhau thông qua khoảng trắng trên màn hình, giúp người dùng dễ phân biệt các phần với nhau, và không gây sự khó hiểu.

Về gu: bạn chọn "thoáng", vì cái nhìn đầu tiên quyết định; thông tin dày và dính sát làm người dùng mất thiện cảm ngay từ đầu.
