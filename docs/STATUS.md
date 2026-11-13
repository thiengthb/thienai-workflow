# Tiến độ

Cập nhật lần cuối: 2026-11-13 · Claude (project Claude, thread "Xây bộ khung artifact so sánh giao diện") · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu.
Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Đang làm bộ khung artifact và trang tổng quan mới, chờ thien xem rồi merge PR #46. Bộ quy trình chung đã dùng được: luật, mẫu, skill start-project, học nhiều môn xoay vòng (frontend 5 buổi, BA 2, chiến tranh 3), theo dõi kế hoạch và lộ trình học (PR #31 đã merge). Bản tin sáng qua mail đã bỏ (PR #24).

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
| Bộ khung artifact: lõi chung + mẫu so sánh giao diện | `feat/artifact-kit-compare` | 2026-11-13 | PR #46: thien xem bản tổng quan mới (chia tab, thẻ repo kiểu dòng thời gian có thanh bước) rồi merge |

## Vừa xong
- BA 2: học với Codex, rồi Claude làm lại trang theo góp ý về giao diện và luồng (PR #39)
- Môn chiến tranh buổi 3 (ba tầng, Điện Biên Phủ), luật gọi tên người cho đúng văn hóa (PR #38)
- Codex dạy học được qua repo: `AGENTS.md` ở gốc, `learning/codex.md` (PR #36, #37)

## Việc tiếp theo
1. Sau khi merge PR #46: làm mẫu trang quyết định, rồi đưa trang học lên lõi chung (kế hoạch: [Bộ khung artifact](https://claude.ai/artifact/L8JZzcaU2ZXKiweA4KFJNd)).
2. Buổi học kế tiếp: Frontend 6 (chọn màu cho app), theo `learning/README.md`.

## Đang chờ thien
- Mở 3 trang (link trong file kế hoạch) trên điện thoại và laptop; trên laptop chạy `node templates/check-status.mjs docs/STATUS.md`, thấy "ổn" là xong.
- Chép dòng Settings mới (README, bước 1) vào từng tài khoản Claude; tải lại 2 file zip skill nếu chưa.
- Xem [bản tổng quan mới](https://claude.ai/artifact/1MXtcXLeyvzYHNnyMfu3RW) trong khung claude.ai; ổn thì merge [PR #46](https://github.com/thiengthb/thienai-workflow/pull/46).

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
