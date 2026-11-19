# 003. Claude làm người review PR

Ngày: 2026-11-14 · Trạng thái: Bỏ (cùng ngày) · Người quyết: thien

## Cần quyết gì
CodeRabbit hết dùng thử ngày 2026-11-24; gói Free của nó không review code trên PR ([002](002-coderabbit-one-review.md)). Gemini Code Assist bản miễn phí trên GitHub đã tắt từ 2026-07-17. Từ tháng 12 thien chỉ dùng Claude. Có nên để Claude review mọi PR không?

## Các phương án đã xét
| Phương án | Lúc nào nó là lựa chọn tốt | Lý do mạnh nhất để không chọn |
|---|---|---|
| A. Review trong phiên: agent mới review trước khi PR sẵn sàng, CI báo đỏ PR thiếu mục `## Review` | Gần như mọi PR do Claude mở trong phiên | Mỗi lượt khoảng 120 nghìn token (đo bên dưới), gần như không phụ thuộc diff to hay nhỏ |
| B. Claude GitHub Action tự review khi PR chuyển sẵn sàng | Muốn tự động như CodeRabbit | Tốn token như A, cộng phút GitHub Actions ở repo riêng tư |
| C. A, cộng gọi Claude trên GitHub bằng `@claude` khi cần | Muốn thêm một lối review độc lập | Tốn như A, cộng một lần cài |
| D. Không review trong lúc làm; review và tối ưu theo giai đoạn khi thien nhờ | Đang cần dồn usage cho phát triển và học | Lỗi nằm trên main lâu hơn, tới lần review giai đoạn |

## Đã thử (2026-11-14, trên PR #66 và sakubun#316)
thien chọn C, AI chọn A; đã dựng xong rồi chạy thử. Ba lượt agent review: khoảng 126, 123 và 118 nghìn token, mỗi lượt 2,6 đến 4,2 phút. Phần lớn token đi vào đọc luật và chạy thử, không phải đọc diff. Các lượt này bắt được lỗi thật (10, 10 và 7 ý, không có ý nặng), nhưng chính các PR đó là công cụ review.

## thien chọn
D, ngày 2026-11-14: "review liên tục thế này sẽ rất tốn token và không đủ lượng cho mình phát triển". Dùng CodeRabbit tới khi hết dùng thử, sau đó gói Free khi nào được thì dùng. Hết một giai đoạn thì thien nhờ Claude review và tối ưu, lúc đó dựng một quy trình review và sửa sẵn.

## AI chọn
Trước khi thien chọn D, AI đề xuất chia ba mức (không review giao diện thuần và tài liệu; review nhẹ bằng model rẻ hơn; review đầy đủ cho luật dùng chung, script đụng git, dữ liệu và đăng nhập). D rẻ hơn hẳn. Chỗ cần nhớ khi review theo giai đoạn: soi trước những vùng hỏng thì đắt (sakubun: `userDb`, `recordReviews`, migration, đăng nhập; thienai-workflow: script đụng git và sổ bàn giao).

## Kết luận
Không review PR bằng Claude trong lúc làm. Đã gỡ `profile/REVIEW.md`, `check-review.mjs`, `review-check.yml`, `claude.yml` khỏi PR #66 và sakubun#316 trước khi merge. Bản đã dựng còn trong lịch sử git của hai PR đó (thienai-workflow commit 299bdaa, sakubun d26efac) nếu sau này cần lấy lại.

## Review theo giai đoạn (thien chọn 2026-11-19, KH8 câu 3)
Từ sau 2026-11-24 (CodeRabbit hết dùng thử), mỗi mốc trong `docs/STATUS.md` có một lượt review bằng một phiên Claude riêng, không phải phiên đã viết code. Lượt đó chỉ soi các PR đã merge từ mốc trước mà đụng: lệnh xoá hay ghi đè file, lệnh git, token hay secret, đồng bộ sang repo khác. PR chỉ sửa chữ, giao diện hay bài học thì bỏ qua. Lỗi tìm được thành PR sửa riêng.

## Tóm tắt bằng lời của thien
<thien tự viết, hoặc "bỏ qua">
