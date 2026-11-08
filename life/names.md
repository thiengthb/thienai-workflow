# Tên đã thống nhất

Tên mà thien đã đặt hoặc AI đã đặt cho token, project, biến, trigger, tài khoản test. AI đọc file này trước khi viết hướng dẫn có bước đặt tên (luật trong [`../profile/GUIDES.md`](../profile/GUIDES.md), mục 3), để dùng lại đúng tên và không phải hỏi lại thien.

Thêm một dòng mỗi khi có tên mới. Tên do thien tự đặt thì giữ nguyên, ghi "thien đặt" ở cột Ghi chú.

| Ở đâu | Thứ gì | Tên | Dùng cho | Ghi chú |
|---|---|---|---|---|
| GitHub, Fine-grained tokens | Token | `morning brief` | Bản tin sáng đọc `docs/STATUS.md` của các repo | thien đặt ngày 08/11/2026. Quyền Contents: Read-only. Hạn 1 năm |
| Google Apps Script | Project | `morning-brief` | Bản tin sáng | |
| Apps Script `morning-brief`, Script properties | Biến | `GITHUB_TOKEN` | Chứa token `morning brief` | |
| Apps Script `morning-brief`, Script properties | Biến | `BRIEF_TO` | Địa chỉ nhận mail, không bắt buộc | Chưa đặt thì gửi về Gmail đang dùng |
| GitHub, Fine-grained tokens | Token | `workflow-sync` | Action `Sync AGENTS.md` mở PR vào các repo project | Đặt ngày 08/11/2026. All repositories; Contents và Pull requests: Read and write. Hạn 1 năm |
| Repo `thienai-workflow`, Actions secrets | Secret | `SYNC_TOKEN` | Chứa token `workflow-sync` | |
