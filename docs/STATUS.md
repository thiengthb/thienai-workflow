# Tiến độ

Cập nhật lần cuối: 2026-11-14 · Claude (project Claude, thread nâng cấp bài học và kiểm trang tự động) · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu.
Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ khung artifact đủ 4 mẫu: so sánh, tổng quan, chọn phương án, buổi học (PR #47, #48, #50); mẫu nào cũng dựng bằng một lệnh (PR #52). Bài học có thêm sa bàn chiến tranh (PR #53), sân khấu IT cho frontend và BA (PR #54), và tự hỏi Claude ngay trên trang (PR #55). Đang làm các đề xuất nâng cấp, đợt 1: CI mở từng trang trong trình duyệt. Luật dùng mẫu đã vào AGENTS chung để mọi project tự dùng. Bộ quy trình chung đã dùng được: luật, mẫu, skill start-project, học nhiều môn xoay vòng (frontend 5 buổi, BA 2, chiến tranh 3), theo dõi kế hoạch và lộ trình học (PR #31 đã merge). Bản tin sáng qua mail đã bỏ (PR #24).

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
| Bài chiến tranh 4 (hậu cần) | PR #44 | 2026-11-12 | Dựng trên khung cũ, chưa có sa bàn; dựng lại khi tới buổi |
| Các đề xuất nâng cấp, đợt 2 đến 5 | [tài liệu đề xuất](https://claude.ai/artifact/FrUscTcs6BWMVBJGzJTYqF) | 2026-11-14 | Làm lần lượt sau đợt 1 |

## Vừa xong
- Bài frontend và BA có sân khấu như sa bàn chiến tranh: bàn thử (núm vặn, soi, dòng CSS sáng lên) và bảng dán (xếp thẻ, nghe người nói), mẫu ở `artifacts/it/` (PR này)
- Mỗi mẫu artifact dùng lại bằng một lệnh và một lần đăng (`publish.json`): so sánh `shoot.mjs`, chọn phương án tự chụp, buổi học tự kiểm, trang tiến độ `publish-progress.mjs` (PR #52)

## Việc tiếp theo
1. Buổi học kế tiếp: Frontend 6 (chọn màu cho app), dựng từ mẫu bàn thử `artifacts/it/` (bài mẫu trong đó chính là nháp buổi 6).
2. Dùng mẫu so sánh mới cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.

## Đang chờ thien
- Mở 3 trang (link trong file kế hoạch) trên điện thoại và laptop; trên laptop chạy `node templates/check-status.mjs docs/STATUS.md`, thấy "ổn" là xong.
- Chép dòng Settings mới (README, bước 1) vào từng tài khoản Claude; tải lại 2 file zip skill nếu chưa.
- Merge sakubun PR #301 (luật AGENTS mới).

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
