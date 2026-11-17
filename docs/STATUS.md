# Tiến độ

Cập nhật lần cuối: 2026-11-17 · Claude nick tnt697 (project Claude, chat rà soát hành động) · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ quy trình chung, bộ khung artifact (4 mẫu, dựng bằng một lệnh) và hệ thống học 3 môn xoay vòng đều đang dùng hằng ngày. Kế hoạch sửa sau review 2026-11-17 đã xong đợt 0–2 (PR #98): luật áp theo điều kiện, chuẩn setup v4 có đoạn riêng cho project bản beta. Đợt 3 đo hai buổi học kế tiếp.

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| [Sửa quy trình sau review 2026-11-17](plans/2026-11-17-workflow-review.md) | 0–3 xong: đo BA 4 (15,8 triệu token) và Frontend 9 (23,1 triệu), đã sửa các lượt phí tìm ra; 4 chờ thien chọn | 19/21 |
| [Học càng nhiều, repo không nặng thêm](plans/2026-11-15-lean-learning.md) | 2/6 xong; đợt 3–4 chỉ làm khi số đo buổi học cho thấy đáng | 6/12 |
| [Các hành động giữa thien và AI còn thiếu luật](plans/2026-11-17-action-gaps.md) | 1/3 trong PR chờ merge (ủy quyền, nhận việc, báo cáo); 2 cùng buổi học kế tiếp; 3 ở mốc 01/12 | 3/16 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Thử CodeRabbit CLI gói Free (3 lần mỗi giờ) | quyết định 002 | 2026-11-14 | Sau 24/11; [chưa kiểm] chạy không cần trình duyệt có cần Agentic API key và Usage-based add-on không |

## Vừa xong
- Frontend 9, buổi mốc so sánh mù (sớm hơn mốc 2026-11-22): xong chặng 1 frontend, chọn học a11y trước ở chặng 3.
- Sửa quy trình sau review: đợt 0–2 (PR #98); sakubun nhận phần chung mới của `AGENTS.md` (sakubun PR #327).
- Kế hoạch dùng Claude tốn ít usage hơn: xong cả 4 checkpoint, luật đổi chat theo số lượt (PR #97), xem lại 2026-12-01.
- Tự nói lại theo tình huống cụ thể (PR #93); Frontend 7, 8, BA 3, Chiến tranh 6 đã ghi sau buổi (PR #91, #92, #95, #97).

## Việc tiếp theo
1. Buổi học kế tiếp: Chiến tranh 7, rồi BA 5. Frontend 10 mở chặng 2 (áp vào app của mình). Đợt 3 của kế hoạch review đo xong số lượt hai buổi; xem số đó có đủ để làm đợt 4 không.
2. Dùng mẫu so sánh cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.
3. sakubun: thêm `.gitattributes` và chép lại `scripts/check-status.mjs` bản đọc được CRLF (bản cũ ở đó vẫn hỏng trên Windows).

## Đang chờ thien
- Chọn làm đợt 4 của kế hoạch review (tự sinh khung bài học) ngay, hay để tới lần xem lại 2026-12-01: thẻ hỏi trong thread "Review sâu và tối ưu thienai-workflow".

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
