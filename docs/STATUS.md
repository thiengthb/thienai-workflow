# Tiến độ

Cập nhật lần cuối: 2026-11-14 · Claude (project Claude, thread "Hoàn thiện bộ khung artifact và dùng thật") · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu.
Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ khung artifact đủ 4 mẫu: so sánh, tổng quan, chọn phương án (PR #47), buổi học (đang chờ duyệt). Luật dùng mẫu đã vào AGENTS chung để mọi project tự dùng. Bộ quy trình chung đã dùng được: luật, mẫu, skill start-project, học nhiều môn xoay vòng (frontend 5 buổi, BA 2, chiến tranh 3), theo dõi kế hoạch và lộ trình học (PR #31 đã merge). Bản tin sáng qua mail đã bỏ (PR #24).

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
| Bộ khung artifact: mẫu buổi học, luật dùng mẫu ở mọi project | `feat/artifact-kit-lesson` | 2026-11-14 | thien duyệt vòng so cũ/mới rồi merge PR |

## Vừa xong
- Mẫu chọn phương án `artifacts/decide/`: một ảnh lớn mỗi lần trên khung rộng, thẻ trên điện thoại (PR #47)
- Bộ khung artifact: lõi chung `artifacts/kit/`, mẫu so sánh `artifacts/compare/`, trang tổng quan chia tab (PR #46)
- BA 2: học với Codex, rồi Claude làm lại trang theo góp ý về giao diện và luồng (PR #39)

## Việc tiếp theo
1. Buổi học kế tiếp: Frontend 6 (chọn màu cho app), buổi đầu dựng từ mẫu `artifacts/lesson/`.
2. Sau khi merge: Action mở PR cập nhật AGENTS.md vào sakubun và tiktok; nhắc thien merge.

## Đang chờ thien
- Mở 3 trang (link trong file kế hoạch) trên điện thoại và laptop; trên laptop chạy `node templates/check-status.mjs docs/STATUS.md`, thấy "ổn" là xong.
- Chép dòng Settings mới (README, bước 1) vào từng tài khoản Claude; tải lại 2 file zip skill nếu chưa.
- Duyệt [vòng so trang học cũ và mới](https://claude.ai/artifact/EAYTdP7Np9475iSMM7L7zo), học thử [buổi mẫu](https://claude.ai/artifact/89uVdfKpQgLU1oEbhviPSr); ổn thì merge PR mẫu buổi học và sakubun PR #299.

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
