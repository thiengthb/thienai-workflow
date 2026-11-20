# KH10 MCP cho nhóm SEP490: chờ thien tạo repo thienai-core

Repo: thiengthb/thienai-workflow · Nhánh: kh10-nuc · PR: #165 đã merge (26abd88), #166 chờ thien merge
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYqmwzr7tB4gqM4F6T · Cập nhật: 2026-11-20T04:28Z

## thien muốn gì
Nhóm SEP490 (5 người, dùng Claude web/desktop) dùng được quy trình chung và lệnh dựng trang qua một connector, không lộ đồ riêng; 20/11 10:41 thêm: "control cái thienai workflow mà vẫn cho người khác sử dụng được ... chỉ ẩn nhất để không bị mất công nghệ lỗi [lõi] thôi". Duyệt hướng hai lớp 10:46: "ok bạn hãy làm theo đề xuất".

## Đã xong
- 20/11 10:34: hỏi 4 câu bằng nút; thien chọn Claude web/desktop, quy trình chung + lệnh dựng trang + đề xuất của Claude (bỏ trang học), ghi repo đồ án, tách repo mới.
- Kế hoạch `docs/plans/2026-11-20-team-mcp.md`, trang https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD (nick tnt697), PR #165 nháp, STATUS có dòng KH10 và việc chờ thien.
- 10:46 sửa theo hướng hai lớp (6e6d2ed): repo lõi private, chỉ MCP mở ra ngoài; ga 2 đo CPU trên Workers (miễn phí 10 ms) và MCP Apps; câu hỏi 2, 3, 5 viết lại; nghiên cứu các hướng khác ở mục "Nghiên cứu".
- 20/11 11:02 thien duyệt trên trang (comment, thread báo not found nên trả lời trong chat): "ok, theo cả 5 đề xuất." Chép nguyên văn vào "Câu hỏi đã chốt", trạng thái đang chạy. thien hỏi thêm: cấu trúc repo, và host MCP trên miniserver sẵn có. Đã trả lời trong chat: hai repo (thienai-workflow, thienai-core với mã MCP ở `mcp/`) cộng connector "SEP490 Kit" (không phải repo); miniserver được, qua Cloudflare Tunnel. Ghi câu hỏi host vào kế hoạch.
- CodeRabbit: ga 2 thiếu đăng nhập → chuyển đăng nhập GitHub vào ga 2, trả lời trên PR. CI xanh. Lệnh tự merge #165 bị công cụ chặn → báo thien, không thử cách khác.
- 20/11 11:15 thien chốt host: miniserver qua Cloudflare Tunnel, Workers dự phòng ("ok, theo cả 1 đề xuất."). Ga 2 sửa theo, commit 4956b45, trang đăng lại.
- 20/11 11:17 thien bảo merge (#165 merge 26abd88) và đọc repo `nuc-infra`. Đã gắn và đọc: NUC Essential 14, N150, RAM 8GB, Ubuntu 26.04, 24/7; đã có Cloudflare Tunnel `*.thientnse.site` → Traefik, quy trình thêm app `runbooks/02-add-app.md`, route Internet là risk:high (thien merge, `nuc-approve`), việc ngoài milestone phải đề xuất. Ga 2 sửa theo, PR #166 (CI xanh); lệnh tự merge bị công cụ chặn.

## Bước tiếp theo
1. thien merge #166.
2. thien tạo repo private trống `thiengthb/thienai-core`; gắn repo đó (quyền ghi) rồi làm ga 1: danh sách file lõi, lệnh đồng bộ một chiều bằng GitHub Action, bước quét chặn `profile/`, `learning/`, `life/`, lớp mỏng cho nhóm.
3. Trước ga 2: viết đề xuất milestone "SEP490 Kit" trong `nuc-infra/plans/` theo AGENTS.md bên đó (mảng `process`, risk high, thien duyệt).

## Đang chờ thien
- Merge PR #166: https://github.com/thiengthb/thienai-workflow/pull/166
- Tạo repo private trống `thiengthb/thienai-core`.

## Lưu ý
- Câu 4 đã chốt ("Tách repo mới") hiểu là repo **private**; đừng tạo repo public.
- Thread comment trên trang có thể báo "not found" khi đọc; khi đó trả lời trong chat.

- `nuc-infra` có luật riêng (AGENTS.md): nhánh `agent/<tên>/<số-issue>-...`, commit có dòng `Agent: <tên>`, không ghi tên model; đọc trước khi mở PR bên đó.
