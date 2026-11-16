# Sửa công cụ kiểm tra báo thành công khi chưa kiểm gì

Trạng thái: xong · Duyệt: 2026-11-12 · Cập nhật: 2026-11-17 (thien chạy thử trên laptop) · Thread: Cải thiện workflow AI từ review của Codex

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: xong cả 2 checkpoint. 2026-11-17 02:16, thien chạy trên laptop Windows (PowerShell, bản clone `Documents\Codex\2026-11-14\...\work\repo`, sau `git pull` và đọc lại file theo mục "Máy Windows" của `README.md`): `docs/STATUS.md: ổn`.
- Còn thiếu: không.
- thien cần làm: không.

## Mục tiêu
Công cụ kiểm tra không bao giờ báo thành công khi chưa kiểm gì (từ review thứ hai của Codex, commit a7421d0).

## Không làm
- Chạy CI thêm trên Windows: test chạy trong thư mục có dấu tiếng Việt và dấu cách đã bắt đúng lỗi này.
- Kiểm nhánh đồng bộ có commit lạ trước khi ghi đè: nhánh đó chỉ máy dùng.
- Gộp các file trạng thái, rút gọn số file AI phải đọc: chưa có số liệu, chờ khi thien phải nhắc lại cùng một việc.

## Checkpoint

### 1. Hai script chạy đúng ở mọi thư mục
Xong khi: thien chạy `node templates/check-status.mjs docs/STATUS.md` trên laptop Windows và thấy dòng "ổn" hoặc danh sách lỗi.
- [x] `check-status.mjs` và `progress-page.mjs` so đường dẫn thật thay vì chuỗi URL (PR #43)
- [x] Test chạy hai script từ thư mục "thư mục có dấu" (PR #43)

### 2. Đồng bộ AGENTS.md báo lỗi thật
Xong khi: test trên GitHub xanh, trong đó có ca repo không đọc được phải báo lỗi.
- [x] Repo không đọc được là lỗi đỏ, kèm gợi ý kiểm quyền token (PR #43)
- [x] Kiểm kết quả lệnh đặt lại nhánh, đọc nhánh chính, xem PR đang mở (PR #43)
- [x] Test giả lập GitHub trả lỗi quyền, lỗi đặt lại nhánh, PR đã có sẵn (PR #43)

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
