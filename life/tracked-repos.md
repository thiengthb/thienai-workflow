# Repo trong bản tin sáng

Bản tin sáng của trợ lý (Project `life` trên Claude) đọc `docs/STATUS.md` của các repo dưới đây, rồi báo cho thien
mỗi sáng repo nào đang chờ thien, việc gì.

Thêm hoặc bỏ một repo: thien nói trong bất kỳ project nào ("đưa repo X vào bản tin sáng", "bỏ repo X khỏi bản tin
sáng"), AI mở một PR sửa bảng này. Project mới áp quy trình chung thì được thêm vào trong cùng PR tạo `AGENTS.md`.
Tối đa 6 repo: thêm một repo khi đã đủ 6 thì AI hỏi thien bỏ repo nào.

| Repo | Ghi chú | Thêm ngày |
|---|---|---|
| `thiengthb/sakubun` | App học tiếng Nhật | 2026-11-05 |
| `thiengthb/capstone-hub` | Code đồ án capstone | 2026-11-05 |
| `thiengthb/ccp-docs` | Tài liệu BA đồ án capstone | 2026-11-05 |
| `thiengthb/PRM393_Lab03_SE190533` | Lab đang làm môn PRM393 | 2026-11-05 |

Repo chưa có `docs/STATUS.md` thì bản tin ghi "chưa có file tiến độ" thay vì đoán.
