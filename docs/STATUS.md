# Tiến độ

Cập nhật lần cuối: 2026-11-17 · Claude nick tnt697 (project Claude, chat dựng BA 5) · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ quy trình chung, bộ khung artifact (4 mẫu, dựng bằng một lệnh) và hệ thống học 3 môn xoay vòng đều đang dùng hằng ngày. Kế hoạch sửa sau review 2026-11-17 đã merge đợt 0–3 (PR #98–#103); đợt 4, 5 đang làm sớm để CodeRabbit kịp review trước 2026-11-24.

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| [Sửa quy trình sau review 2026-11-17](plans/2026-11-17-workflow-review.md) | 0–3 đã merge (PR #98–#103); 5: phần làm được đã làm sớm, còn đối chiếu với tính năng mới của Claude ở 2026-12-01; 4: phần máy xong (bước ôn tự sinh), chờ đo ở hai buổi học kế tiếp | 21/22 |
| [Học càng nhiều, repo không nặng thêm](plans/2026-11-15-lean-learning.md) | 0–2 xong; 3: phần máy xong (bước ôn tự sinh, sau buổi tự ghi kết quả ôn), chờ đo ở hai buổi học kế tiếp; 4 bỏ (thien chọn 2026-11-17) | 8/11 |
| [Các hành động giữa thien và AI còn thiếu luật](plans/2026-11-17-action-gaps.md) | 1 đã merge (PR #104), đang kiểm ở 3 chat; 2: lệnh, bảng file đích, thuật ngữ đã merge (PR #106), gu đã vào thienui (PR #8), sửa tên trục đã merge (PR #110); 3 ở mốc 01/12 | 11/16 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Thử CodeRabbit CLI gói Free (3 lần mỗi giờ) | quyết định 002 | 2026-11-14 | Sau 24/11; [chưa kiểm] chạy không cần trình duyệt có cần Agentic API key và Usage-based add-on không |

## Vừa xong
- Chiến tranh 7 (bất ngờ và lừa địch, giấu pháo ở Điện Biên Phủ), buổi đầu dùng bước ôn tự sinh: ôn 4/4, thien chấm "khó". Số lượt dựng bài không tách được, vì cùng chat còn làm đợt 2 rà soát hành động (PR #106).
- Frontend 9, buổi mốc so sánh mù (sớm hơn mốc 2026-11-22): xong chặng 1 frontend, chọn học a11y trước ở chặng 3.
- Sửa quy trình sau review: đợt 0–2 (PR #98); sakubun nhận phần chung mới của `AGENTS.md` (sakubun PR #327).
- Kế hoạch dùng Claude tốn ít usage hơn: xong cả 4 checkpoint, luật đổi chat theo số lượt (PR #97), xem lại 2026-12-01.

## Việc tiếp theo
1. Buổi học kế tiếp: Frontend 10 mở chặng 2, rồi Chiến tranh 8. BA 5 đã học (PR của nhánh `claude/ba-05-acceptance-criteria`, chờ thien merge); BA 6 cần ngắn lại (BA 5 tốn 60 phút, "dài", "khó"). BA 5 là lần đo bước ôn tự sinh còn lại (checkpoint 3 của kế hoạch học gọn): ôn 3 thẻ tự sinh chạy đúng, đúng 3/3. Trước buổi chiến tranh kế tiếp: sửa "Xem Claude làm" lấy nhầm track của bài khác (`learning/war.md`).
2. Dùng mẫu so sánh cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.
3. sakubun: thêm `.gitattributes` và chép lại `scripts/check-status.mjs` bản đọc được CRLF (bản cũ ở đó vẫn hỏng trên Windows).

## Đang chờ thien
- Xoá nhánh đã merge `claude/war-07-artillery`, `claude/action-gaps-batch-2` (AI không xoá được qua proxy).

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
