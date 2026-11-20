# KH10 MCP cho nhóm SEP490: đã duyệt, chờ merge #165

Repo: thiengthb/thienai-workflow · Nhánh: team-mcp-plan · PR: #165 (sẵn sàng, chờ thien merge)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYqmwzr7tB4gqM4F6T · Cập nhật: 2026-11-20T04:16Z

## thien muốn gì
Nhóm SEP490 (5 người, dùng Claude web/desktop) dùng được quy trình chung và lệnh dựng trang qua một connector, không lộ đồ riêng; 20/11 10:41 thêm: "control cái thienai workflow mà vẫn cho người khác sử dụng được ... chỉ ẩn nhất để không bị mất công nghệ lỗi [lõi] thôi". Duyệt hướng hai lớp 10:46: "ok bạn hãy làm theo đề xuất".

## Đã xong
- 20/11 10:34: hỏi 4 câu bằng nút; thien chọn Claude web/desktop, quy trình chung + lệnh dựng trang + đề xuất của Claude (bỏ trang học), ghi repo đồ án, tách repo mới.
- Kế hoạch `docs/plans/2026-11-20-team-mcp.md`, trang https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD (nick tnt697), PR #165 nháp, STATUS có dòng KH10 và việc chờ thien.
- 10:46 sửa theo hướng hai lớp (6e6d2ed): repo lõi private, chỉ MCP mở ra ngoài; ga 2 đo CPU trên Workers (miễn phí 10 ms) và MCP Apps; câu hỏi 2, 3, 5 viết lại; nghiên cứu các hướng khác ở mục "Nghiên cứu".
- 20/11 11:02 thien duyệt trên trang (comment, thread báo not found nên trả lời trong chat): "ok, theo cả 5 đề xuất." Chép nguyên văn vào "Câu hỏi đã chốt", trạng thái đang chạy. thien hỏi thêm: cấu trúc repo, và host MCP trên miniserver sẵn có. Đã trả lời trong chat: hai repo (thienai-workflow, thienai-core với mã MCP ở `mcp/`) cộng connector "SEP490 Kit" (không phải repo); miniserver được, qua Cloudflare Tunnel. Ghi câu hỏi host vào kế hoạch.
- CodeRabbit: ga 2 thiếu đăng nhập → chuyển đăng nhập GitHub vào ga 2, trả lời trên PR. CI xanh. Lệnh tự merge #165 bị công cụ chặn → báo thien, không thử cách khác.
- 20/11 11:15 thien chốt host: miniserver qua Cloudflare Tunnel, Workers dự phòng ("ok, theo cả 1 đề xuất."). Ga 2 sửa theo, commit 4956b45, trang đăng lại.

## Bước tiếp theo
1. thien merge #165.
2. Trước ga 2: hỏi thien miniserver là máy gì, bật 24/7 không, có tên miền chưa.
3. Ga 1: tạo repo private `thienai-core` (cần thien tạo hay cho quyền tạo repo), lệnh đồng bộ một chiều và bước quét chặn `profile/`, `learning/`, `life/`.

## Đang chờ thien
- Merge PR #165: https://github.com/thiengthb/thienai-workflow/pull/165
- Trước ga 2: miniserver là máy gì, bật 24/7 không, có tên miền chưa. Trang kế hoạch https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD (nick tnt697). Đăng lại trang: `node artifacts/plan/make-plan.mjs docs/plans/2026-11-20-team-mcp.md <out> --url https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD`.

## Lưu ý
- Câu 4 đã chốt ("Tách repo mới") hiểu là repo **private**; đừng tạo repo public.
- Thread comment trên trang có thể báo "not found" khi đọc; khi đó trả lời trong chat.
