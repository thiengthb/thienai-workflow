# Tên đã thống nhất

Tên mà thien đã đặt hoặc AI đã đặt cho token, project, biến, trigger, tài khoản test. AI đọc file này trước khi viết hướng dẫn có bước đặt tên (luật trong [`../profile/GUIDES.md`](../profile/GUIDES.md), mục 3), để dùng lại đúng tên và không phải hỏi lại thien.

Thêm một dòng mỗi khi có tên mới. Tên do thien tự đặt thì giữ nguyên, ghi "thien đặt" ở cột Ghi chú.

| Ở đâu | Thứ gì | Tên | Dùng cho | Ghi chú |
|---|---|---|---|---|
| GitHub, Fine-grained tokens | Token | `workflow-sync` | Action `Sync AGENTS.md` mở PR vào các repo project | Đặt ngày 08/11/2026, hạn 1 năm. Chỉ cho các repo trong `tracked-repos.md` (thu hẹp ngày 12/11/2026). Thêm repo vào danh sách thì thêm vào token |
| Repo `thienai-workflow`, Actions secrets | Secret | `SYNC_TOKEN` | Chứa token `workflow-sync` | |
| GitHub, Settings → Developer settings → OAuth Apps | OAuth App | `Team Kit` | Đăng nhập connector Team Kit (KH10), callback `https://team-kit.thientnse.site/oauth/github/callback` | Đặt ngày 20/11/2026, thien tạo xong 20/11; hướng dẫn `mcp/docs/github-oauth-app.md` của thienai-core |
| Trình quản lý mật khẩu của thien | Mục lưu | `team-kit-github-oauth` | Client ID (ô username) và Client secret (ô password) của OAuth App `Team Kit` | Chờ dán vào env trên miniserver |
| Miniserver, file env của app | Biến | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `PUBLIC_URL` | Máy chủ Team Kit; `PUBLIC_URL` là `https://team-kit.thientnse.site` | Danh sách đủ ở `mcp/README.md` của thienai-core |
| Cloudflare Tunnel, Traefik | Tên miền con | `team-kit.thientnse.site` | Link connector `https://team-kit.thientnse.site/mcp` | Trước 20/11 13:25 là `sep490-kit` |
