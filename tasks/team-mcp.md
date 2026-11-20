# KH10 MCP cho nhóm SEP490: ga 2, viết máy chủ MCP trong thienai-core/mcp/

Repo: thiengthb/thienai-workflow · Nhánh: agent/claude/154-sep490-kit-milestone (nuc-infra) · PR: nuc-infra#155 (risk:high, thien merge); thienai-workflow #169 đã merge (de21044)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBaWbaWTa8usSfceZqS · Cập nhật: 2026-11-20T06:06Z

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
- 20/11 12:06 thien tạo xong deploy key và secret, bảo merge: #167 merge 950ce56. Action chạy lần đầu đỏ (run 44678809847): "Load key: error in libcrypto", nghi khoá dán từ Windows có \r. PR #168: bỏ \r, kiểm đầu cuối và ssh-keygen -y, thêm file Action vào paths để merge là chạy lại. CI xanh.
- 20/11 12:20 #168 merge c39d293. Run 44680379911 đỏ với lỗi mới: CORE_DEPLOY_KEY không có dòng BEGIN/END của khoá riêng (dán nhầm file .pub hay thiếu dòng). Đã nhờ thien dán lại bằng `Get-Content sync-core -Raw | Set-Clipboard`.
- 20/11 12:23 thien dán lại secret; chạy lại run 44680379911 → xanh, thienai-core có `2d02db7` "sync: thienai-workflow@c39d293". PR #169 tick ga 1; CodeRabbit nhắc ga chỉ đóng khi thien kiểm repo → sửa "Đang ở đâu" và STATUS. Job pages đỏ một lần do test trình duyệt chập chờn (bảng dán 390px), chạy lại xanh.
- 20/11 12:42 thien: "ok bạn giúp tôi và tôi đã đọc lướt qua repo rồi" → ghi vào kế hoạch, ga 1 xong, merge #169 (de21044), đăng lại trang kế hoạch.
- Ga 2 việc 1: issue nuc-infra#154 và PR nuc-infra#155 (`plans/M5-sep490-kit.md` + dòng M5 trong `docs/roadmap.md`), nhãn risk:high, area:process, agent:claude. `scripts/verify` trên máy làm việc PASS. CI của nuc-infra không chạy: "recent account payments have failed or your spending limit needs to be increased" (repo private hết phút Actions).
- 20/11 12:57 thien đồng ý bắt đầu viết `mcp/` trong lúc chờ duyệt M5, làm ở chat mới.

## Bước tiếp theo
1. (Chat mới) Gắn repo `thiengthb/thienai-core` (ghi) và `thiengthb/thienai-workflow`. Viết `thienai-core/mcp/` theo ga 2 của `docs/plans/2026-11-20-team-mcp.md`: Node, MCP streamable HTTP; đăng nhập GitHub OAuth cho mọi lần gọi, danh sách tài khoản do thien giữ; tool đọc luật theo chủ đề (trả từng đoạn, mô tả tool ngắn) và dựng trang kế hoạch, luồng, chọn phương án từ `upstream/`; trang hiện bằng MCP Apps (câu 5); Dockerfile non-root, healthcheck `/health`, GitHub Actions build lên `ghcr.io/thiengthb/thienai-core-mcp`. Mọi thay đổi qua nhánh và PR trong thienai-core (luật ở `AGENTS.md` bên đó). Không đụng NUC tới khi M5 được duyệt.
2. Khi thien merge nuc-infra#155: tick việc "Đề xuất milestone" ở KH10 và làm bước 2 của M5 (mảng `sep490-kit` trong `docs/ownership.md`).

## Đang chờ thien
- Duyệt milestone M5: https://github.com/thiengthb/nuc-infra/pull/155
- CI của nuc-infra không chạy vì billing GitHub Actions (repo private).

## Lưu ý
- Câu 4 đã chốt ("Tách repo mới") hiểu là repo **private**; đừng tạo repo public.
- Thread comment trên trang có thể báo "not found" khi đọc; khi đó trả lời trong chat.

- `nuc-infra` có luật riêng (AGENTS.md): nhánh `agent/<tên>/<số-issue>-...`, commit có dòng `Agent: <tên>`, không ghi tên model; đọc trước khi mở PR bên đó.
