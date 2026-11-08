# Repo trong bản tin sáng

Bản tin sáng (Google Apps Script, xem [`morning-brief/`](morning-brief/README.md)) đọc `docs/STATUS.md` của các repo dưới đây,
rồi gửi mail cho thien mỗi sáng: repo nào đang chờ thien, việc gì. Sửa bảng này là đủ, không phải sửa script.

Thêm hoặc bỏ một repo: thien nói trong bất kỳ project nào ("đưa repo X vào bản tin sáng", "bỏ repo X khỏi bản tin
sáng"), AI mở một PR sửa bảng này. Project mới áp quy trình chung thì được thêm vào trong cùng PR tạo `AGENTS.md`.
Tối đa 6 repo: thêm một repo khi đã đủ 6 thì AI hỏi thien bỏ repo nào.

| Repo | Ghi chú | Thêm ngày | File tiến độ |
|---|---|---|---|
| `thiengthb/sakubun` | App học tiếng Nhật | 2026-11-05 | |

Cột "File tiến độ" để trống thì bản tin đọc `docs/STATUS.md`. Repo đã có file tiến độ riêng (ví dụ repo nhóm) thì ghi đường dẫn file đó, trong dấu backtick. Không có file thì bản tin ghi "chưa có file tiến độ" thay vì đoán; file không theo mẫu STATUS thì bản tin đưa link để mở xem.
