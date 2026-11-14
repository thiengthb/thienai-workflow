# 003. Claude làm người review PR

Ngày: 2026-11-14 · Trạng thái: Đã chọn · Người quyết: thien

## Cần quyết gì
CodeRabbit hết dùng thử ngày 2026-11-24; gói Free của nó không review code trên PR ([002](002-coderabbit-one-review.md)). Gemini Code Assist bản miễn phí trên GitHub đã tắt từ 2026-07-17. Từ tháng 12 thien chỉ dùng Claude (nick Codex hết hạn), không muốn trả thêm tiền, và chấp nhận tốn usage Claude của chính mình. Cần một cách review lâu dài bằng Claude.

## Các phương án đã xét
| Phương án | Lúc nào nó là lựa chọn tốt | Lý do mạnh nhất để không chọn |
|---|---|---|
| A. Review trong phiên: agent mới review trước khi PR sẵn sàng, CI chặn PR thiếu mục `## Review` | Gần như mọi PR do Claude mở trong phiên | Cùng một nick vừa làm vừa review: nick sắp hết usage thì lượt review có thể bị cắt; agent mới cùng phiên ít độc lập hơn bot ở môi trường khác; PR thien tự mở không có ai review |
| B. Claude GitHub Action tự review khi PR chuyển sẵn sàng, chạy bằng token gói Claude | Muốn tự động hoàn toàn như CodeRabbit, review cả PR thien tự mở | Tốn phút GitHub Actions ở repo riêng tư (thienai-workflow tuần 7–14/11 đã có 168 lượt CI, khoảng 300 phút chạy, có thể gần giới hạn 2.000 phút mỗi tháng của gói Free [suy luận]); token gắn với một nick, nick đó hết usage thì review lỗi; phải cài một lần trên laptop |
| C. Kết hợp: A mặc định, Action chỉ chạy khi có người comment `@claude` | Muốn A, cộng một lối review độc lập cho PR thien tự mở hay lượt review lại sau sửa lớn | Vẫn phải cài như B, hai chỗ cấu hình |
| Bỏ review | PR toàn tài liệu | Số liệu ở 002: review bắt được lỗi thật mà test không bắt, ví dụ `reset --hard` ở #62 |

## thien chọn
C, trong chat ngày 2026-11-14, không ghi lý do.

## AI chọn
A. Từ tháng 12 gần như mọi PR do Claude mở trong phiên, nên A phủ hầu hết; phần Action của C thêm một lần cài và một token gắn với một nick cho một tính năng chắc ít dùng. AI đã đánh giá thấp hai chỗ C hơn A: PR thien tự mở không có phiên nào review, và lượt review lại sau sửa lớn nên thật độc lập với nick vừa làm.

## Kết luận
Làm C:
- Cách làm: [`profile/REVIEW.md`](../../profile/REVIEW.md). Agent mới (không kèm lịch sử phiên) review diff theo luật của repo; AI sửa hay trả lời từng ý rồi ghi mục `## Review` vào mô tả PR.
- CI: `templates/check-review.mjs` chạy trong `.github/workflows/review-check.yml` (vài giây, chỉ chạy bước này), chặn PR không còn nháp mà thiếu mục `## Review` hay mục đó trống.
- `@claude`: `.github/workflows/claude.yml` chỉ chạy khi có comment chứa `@claude` của người có quyền ghi. thien cài một lần: app Claude trên GitHub và secret `CLAUDE_CODE_OAUTH_TOKEN` (tạo bằng `claude setup-token` trên laptop, nick nào cũng được).
- CodeRabbit vẫn chạy theo 002 tới 2026-11-24, rồi thien gỡ app. Áp ở thienai-workflow và sakubun.

## Xem lại khi
- 2026-12-14 (một tháng chỉ dùng Claude): đếm lỗi lọt qua review trong phiên và số lần gọi `@claude`. Hầu như không gọi `@claude` thì bỏ phần Action; lọt nhiều lỗi thì cân nhắc B.

## Tóm tắt bằng lời của thien
<thien tự viết, hoặc "bỏ qua">
