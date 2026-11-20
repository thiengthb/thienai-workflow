# KH10 MCP cho nhóm SEP490: ga 2, viết máy chủ MCP trong thienai-core/mcp/

Repo: thiengthb/thienai-workflow · Nhánh: mcp-server (thienai-core) · PR: thienai-core#1 (thien merge); nuc-infra#155 (risk:high, thien merge)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBaWbaWTa8usSfceZqS · Cập nhật: 2026-11-20T06:56Z

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

- 20/11 13:00 (chat này, tnt697): gắn thienai-core, viết `mcp/` theo ga 2, PR thienai-core#1. `npm test` 14/14 xanh (GitHub giả, client MCP thật); `test/shell.browser.mjs` trong Chrome thật: trang hiện, "Gửi cho Claude" tới host bằng `ui/message`. Chạy thử bản giống image: `/health` ok. Chưa kiểm: `docker build` (máy không có Docker daemon), connector trên claude.ai thật.

- 20/11 13:25 thien bảo merge và đổi tên: merge thienai-core#1 (1ff9b6f) và thienai-workflow#170 (1097e75) theo lời thien (CI thienai-core không chạy vì billing, test máy làm việc xanh). thien chọn tên "Team Kit" bằng nút. Đổi tên: thienai-core#2 (kèm hướng dẫn `mcp/docs/github-oauth-app.md`, bỏ scope read:user), thienai-workflow#171 (kế hoạch, STATUS, names.md), nuc-infra#155 (file thành `plans/M5-team-kit.md`, callback GitHub đúng, bỏ SQLite; `scripts/verify` PASS). Lệnh tự merge PR đổi tên bị công cụ chặn: thien merge.

- 20/11 13:44 thien: "ok bạn merge giúp mình mình đã tạo oauth app như trên". Sửa góp ý CodeRabbit (bỏ đường dẫn life/ trong hướng dẫn), merge thienai-core#2 (e987339), thienai-workflow#171 (a360580). M5: thien bấm "Nhờ Claude merge" → nuc-infra#155 merge c780647. Mở: nuc-infra#158 (mảng team-kit, sửa M5 bỏ .snapshot; risk:high), nuc-infra#159 (apps/team-kit compose, env, README; risk:medium, cần phiên khác review), thienai-core#3 (tag sha-, ghim action), thienai-workflow#172 (tick M5).

## Bước tiếp theo
1. Image: thien chọn build trên máy (20/11); hướng dẫn `mcp/docs/build-image-local.md` ở thienai-core#3. Thien báo đã push thì kiểm package, rồi làm hướng dẫn bước 4 của M5.
2. nuc-infra#159 cần một phiên khác review (`Review: OK`), merge sau #158.
3. Có image và #159 merge: viết hướng dẫn bước 4 của M5 cho thien (mkdir /opt/apps/team-kit, .env, allowlist, compose up --wait, .autodeploy, component interactive), rồi PR route bước 5 (risk:high).
4. Sau khi chạy: thien thêm connector bằng nick khác để kiểm "Xong khi" ga 2; trang "Gắn connector"; Workers dự phòng sau cùng.

## Đang chờ thien
- Build image trên máy theo `mcp/docs/build-image-local.md` (thienai-core, PR #3), thien chọn 20/11.
- Merge nuc-infra#158, thienai-core#3, thienai-workflow#172.

## Lưu ý
- Câu 4 đã chốt ("Tách repo mới") hiểu là repo **private**; đừng tạo repo public.
- Thread comment trên trang có thể báo "not found" khi đọc; khi đó trả lời trong chat.

- `nuc-infra` có luật riêng (AGENTS.md): nhánh `agent/<tên>/<số-issue>-...`, commit có dòng `Agent: <tên>`, không ghi tên model; đọc trước khi mở PR bên đó.
