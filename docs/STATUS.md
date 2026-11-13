# Tiến độ

Cập nhật lần cuối: 2026-11-14 · Claude (project Claude, thread "Hoàn thiện bộ khung artifact và dùng thật") · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu.
Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ khung artifact đủ 4 mẫu: so sánh (đang làm gọn lại), tổng quan, chọn phương án, buổi học (PR #47, #48). Luật dùng mẫu đã vào AGENTS chung để mọi project tự dùng. Bộ quy trình chung đã dùng được: luật, mẫu, skill start-project, học nhiều môn xoay vòng (frontend 5 buổi, BA 2, chiến tranh 3), theo dõi kế hoạch và lộ trình học (PR #31 đã merge). Bản tin sáng qua mail đã bỏ (PR #24).

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| [Theo dõi tiến độ và lộ trình học](plans/2026-11-12-progress-tracking.md) | 5/5: chờ thien mở thử 3 trang | 13/13 |
| [Sửa công cụ kiểm tra báo thành công khi chưa kiểm gì](plans/2026-11-12-silent-tools-fix.md) | 1/2: chờ thien chạy thử trên laptop | 5/5 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Cài dòng Settings mới cho từng tài khoản Claude | README, bước 1 | 2026-11-12 | thien tự làm, AI không kiểm được |
| Làm gọn mẫu so sánh theo bản A, ảnh rộng tự xem từng bản | `feat/compare-tidy` | 2026-11-14 | thien xem thử rồi merge PR |

## Vừa xong
- Mẫu buổi học `artifacts/lesson/` và luật dùng mẫu ở mọi project (PR #48); luật luôn trả lời tiếng Việt (PR #49)
- Mẫu chọn phương án `artifacts/decide/`: một ảnh lớn mỗi lần trên khung rộng, thẻ trên điện thoại (PR #47)

## Việc tiếp theo
1. Buổi học kế tiếp: Frontend 6 (chọn màu cho app), buổi đầu dựng từ mẫu `artifacts/lesson/`.
2. Dùng mẫu so sánh mới cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.

## Đang chờ thien
- Mở 3 trang (link trong file kế hoạch) trên điện thoại và laptop; trên laptop chạy `node templates/check-status.mjs docs/STATUS.md`, thấy "ổn" là xong.
- Chép dòng Settings mới (README, bước 1) vào từng tài khoản Claude; tải lại 2 file zip skill nếu chưa.
- Merge sakubun PR #301 (luật AGENTS mới); xem thử mẫu so sánh mới rồi merge PR của nó.

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
