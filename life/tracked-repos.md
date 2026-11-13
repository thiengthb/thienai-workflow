# Repo theo quy trình chung

Các repo dưới đây đã áp quy trình chung. Khi mẫu `templates/AGENTS.template.md` đổi, Action `Sync AGENTS.md`
(`.github/workflows/sync-agents-md.yml`) tự mở PR vào từng repo để cập nhật phần chung của `AGENTS.md`, giữ nguyên phần
riêng của project.

Thêm hoặc bỏ một repo: thien nói trong bất kỳ project nào, AI mở một PR sửa bảng này. Token `workflow-sync` chỉ có quyền trên các repo trong bảng, nên khi thêm repo, AI đưa thien hướng dẫn thêm repo đó vào token (GitHub > Settings > Developer settings > Fine-grained tokens > `workflow-sync` > Edit > Repository access); thiếu bước này thì Action báo lỗi ở repo mới. Project mới áp quy trình chung
thì được thêm vào trong cùng lúc tạo `AGENTS.md`.

Trang tổng quan tiến độ của các repo trong bảng (và chính repo thienai-workflow): https://claude.ai/artifact/SZGp85NU46SDp9k6i7Lb9n. AI đăng lại bằng `node templates/publish-progress.mjs overview` (rồi gọi Artifact với `publish.json` nó ghi) khi sửa STATUS hay kế hoạch của một repo trong bảng; luật ở `profile/PLANNING.md`.

| Repo | Ghi chú | Thêm ngày |
|---|---|---|
| `thiengthb/sakubun` | App học tiếng Nhật | 2026-11-05 |
| `thiengthb/tiktok` | Kênh TikTok riêng (nghiên cứu, nội dung) | 2026-11-12 |
