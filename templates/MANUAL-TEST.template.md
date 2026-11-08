# Test tay: [tên tính năng hoặc luồng]

<!-- Mẫu hướng dẫn test tay. Luật viết ở profile/GUIDES.md trong repo thienai-workflow. Chép vào docs/manual-test/ của project. Xoá các dòng chú thích trước khi gửi. -->

Test này kiểm [luồng gì, từ đâu đến đâu]. Mất khoảng [số] phút. Bản code: commit `[sha]` hoặc nhánh `[tên nhánh]`.

Đã thử ngày [YYYY-MM-DD]: ca [TC..] đến [TC..]. Ca có ghi `(chưa thử)` là AI chưa chạy được trên máy thật.

## Chuẩn bị

Làm hết các ô dưới đây trước khi bắt đầu. Mỗi ô có cách kiểm.

- [ ] [Server chạy]: mở [link health check], thấy `[nội dung]`.
- [ ] [Dữ liệu mẫu đã nạp]: chạy `[lệnh]`, thấy `[dòng in ra]`.
- [ ] [Không còn dữ liệu cũ gây nhiễu]: [cách kiểm].

## Tài khoản và dữ liệu test

Tài khoản: [`test-accounts.csv`](link-tới-file). Mật khẩu chung `[mật khẩu giả]`, chỉ dùng ở môi trường local hoặc demo.

| Mã | Tài khoản | Dùng ở ca |
|---|---|---|
| A1 | `[email]` | TC01, TC02 |
| A2 | `[email]` | TC04 (tài khoản bị khoá) |

Dữ liệu mẫu:

| File hoặc giá trị | Dùng ở ca | Có gì bên trong |
|---|---|---|
| [`sample.csv`](link) | TC02 | [40 dòng, 2 dòng trùng email để test lỗi] |

## Ca test đường chính

### TC01. [Tên ca, ví dụ: Giảng viên đăng nhập]

Tài khoản: A1.

1. Mở [tên trang](link).
2. Ở [vị trí], điền:

   | Ô | Điền |
   |---|---|
   | Email | `[email]` |
   | Mật khẩu | `[mật khẩu]` |

3. Bấm **[Đăng nhập]**.

**Kết quả mong đợi:** [cụ thể, so được bằng mắt: trang chuyển tới /dashboard, góc phải hiện "Demo Lecturer", danh sách lớp có 1 dòng SWD392].

**Dễ nhầm:** [chỉ ghi khi có].

### TC02. [...]

## Ca lỗi

<!-- Mỗi ca lỗi một mục như trên. Kết quả mong đợi là chữ báo lỗi cụ thể và hệ thống không làm gì sai. -->

### TC10. [Nhập sai mật khẩu]

...

**Kết quả mong đợi:** hiện "[chữ báo lỗi]", không nói tài khoản có tồn tại hay không. [Cảnh báo phụ nếu có, ví dụ: sai 5 lần sẽ khoá 5 phút, nên chỉ thử 1 lần.]

## Dọn dẹp sau khi test

1. [Đăng xuất, tắt server, xoá dữ liệu tạm, kèm lệnh nếu có]

## Bảng kết quả

Điền `Đạt` hoặc `Sai`. Sai thì ghi bước nào và thấy gì thay vì kết quả mong đợi. Xong thì nhắn AI "đã test xong", AI đọc bảng này để sửa.

| Ca | Kết quả | Ghi chú |
|---|---|---|
| TC01 | | |
| TC02 | | |
| TC10 | | |

Người test: [tên] · Ngày: [YYYY-MM-DD] · Máy và trình duyệt: [ví dụ Windows 11, Chrome 131]
