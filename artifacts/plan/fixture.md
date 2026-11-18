# Kế hoạch mẫu để kiểm trang

Trạng thái: chờ duyệt · Duyệt: 2026-11-20 · Cập nhật: 2026-11-20 · nick tnt697 · Chat: https://claude.ai/code/session_example

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow.

## Đang ở đâu
- Đang ở: chờ thien duyệt
- Còn thiếu: mọi checkpoint
- thien cần làm: trả lời 2 câu hỏi ở cuối trang

## Mục tiêu
Một kế hoạch nhỏ, đủ mọi mục, để `make-plan.mjs` và `check-pages.mjs` kiểm trang kế hoạch.

## Không làm
- Không đổi luật.

## Các phương án đã xét
| Phương án | Hợp khi | Lý do không chọn |
|---|---|---|
| A. Làm tay mỗi lần | ít kế hoạch | gõ lại nhiều |
| **B. Sinh từ file (chọn)** | | file viết lệch mẫu thì lệnh báo |

## Checkpoint

### 1. Dựng trang
Xong khi: thien mở trang trên điện thoại, thấy tuyến ga.
Ước: 1 phiên
- [x] Lệnh dựng (2026-11-20)
- [ ] Trang mẫu

### 2. Trả lời bằng nút
Xong khi: thien bấm trả lời, không gõ lại.
Ước: 1–2 phiên
- [ ] Nút chọn
- [ ] Lưu vào db

### 3. Gom luật vào mốc 01/12
Xong khi: thien duyệt các dòng luật.
- [ ] Viết luật

## Câu hỏi
1. Làm checkpoint 1 ngay không? Đề xuất: có. Lý do: nhỏ, xong trong một phiên.
2. Trang đặt ở đâu?
   - Trong `artifacts/plan/` (đề xuất)
   - Trong `templates/`

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
