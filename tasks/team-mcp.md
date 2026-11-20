# KH10 MCP cho nhóm SEP490: ga 1, chờ thien tạo deploy key

Repo: thiengthb/thienai-workflow · Nhánh: core-sync · PR: #167 (sẵn sàng, 5 ý CodeRabbit đã sửa và trả lời)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYqmwzr7tB4gqM4F6T · Cập nhật: 2026-11-20T04:48Z

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
- 20/11 11:31 thien bảo merge (#166 merge c9d03a3) và đã tạo repo `thienai-core`. Claude đẩy commit đầu vào thienai-core main (`991dd6c`, repo trống nên không có PR): `AGENTS.md`, `CLAUDE.md`, `README.md`, `team/AGENTS.md` (luật mẫu cho repo đồ án, bỏ mọi link profile/), `upstream/` (lần chép đầu, 33 file). PR #167 ở thienai-workflow: `templates/core-files.txt`, `templates/sync-core.mjs` (quét rồi chép), test trong CI, Action `sync-core.yml` (cần secret `CORE_DEPLOY_KEY`). Kế hoạch tick 2 việc ga 1.

## Bước tiếp theo
1. thien tạo deploy key và secret (ba bước ở ga 1 của kế hoạch), merge #167. Sau merge, Action chạy lần đầu: kiểm có commit "sync: thienai-workflow@..." ở thienai-core, tick việc "Danh sách file lõi và lệnh đồng bộ".
2. Ga 2 bắt đầu bằng đề xuất milestone "SEP490 Kit" trong `nuc-infra/plans/` (luật AGENTS.md bên đó, thien duyệt).

## Đang chờ thien
- Deploy key `sync-core` (thienai-core, có quyền ghi) và secret `CORE_DEPLOY_KEY` (thienai-workflow): ba bước ở ga 1 của `docs/plans/2026-11-20-team-mcp.md`.
- Merge PR #167: https://github.com/thiengthb/thienai-workflow/pull/167

## Lưu ý
- Câu 4 đã chốt ("Tách repo mới") hiểu là repo **private**; đừng tạo repo public.
- Thread comment trên trang có thể báo "not found" khi đọc; khi đó trả lời trong chat.

- `nuc-infra` có luật riêng (AGENTS.md): nhánh `agent/<tên>/<số-issue>-...`, commit có dòng `Agent: <tên>`, không ghi tên model; đọc trước khi mở PR bên đó.
