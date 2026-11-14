# So sánh CodeRabbit và Gemini Code Assist (2026-11-14 đến 2026-11-24)

CodeRabbit hết dùng thử ngày 2026-11-24; gói Free không review code trên PR. thien ưu tiên miễn phí nên chạy song song Gemini Code Assist (miễn phí) trên thienai-workflow và sakubun để chọn bằng số liệu. Lý do và luật: `docs/decisions/002-coderabbit-one-review.md`.

## Cách ghi
- Mỗi PR có ít nhất một bot review: AI thêm một dòng khi đã sửa hay trả lời hết góp ý.
- "Lỗi thật" là góp ý dẫn tới sửa code hay tài liệu. Góp ý sai, trùng với bot kia, hay chỉ là gu thì đếm vào "Bỏ qua".
- "Trùng" là số lỗi thật cả hai bot cùng chỉ ra.
- Phút: từ lúc PR chuyển sẵn sàng (hay lúc gọi review) tới lúc bot đăng xong.

| Ngày | Repo | PR | CodeRabbit: lỗi thật / bỏ qua / phút | Gemini: lỗi thật / bỏ qua / phút | Trùng | Lỗi đáng giá nhất chỉ một bot thấy |
|---|---|---|---|---|---|---|

## Chốt (trước 2026-11-24)
<AI tổng hợp: tổng lỗi thật mỗi bot, lỗi chỉ một bot thấy, thời gian chờ. thien chọn: giữ Gemini, trả tiền CodeRabbit, hay cách khác.>
