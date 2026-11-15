# Tiến độ

Cập nhật lần cuối: 2026-11-15 · Claude nick tnt697 (project Claude, chat học nhẹ dần đợt 2) · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ khung artifact đủ 4 mẫu: so sánh, tổng quan, chọn phương án, buổi học (PR #47, #48, #50); mẫu nào cũng dựng bằng một lệnh (PR #52). Bài học có thêm sa bàn chiến tranh (PR #53), sân khấu IT cho frontend và BA (PR #54), và tự hỏi Claude ngay trên trang (PR #55). Đang làm các đề xuất nâng cấp: đợt 1 CI mở từng trang trong trình duyệt (PR #56), đợt 2 trang ôn thẻ (https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu, PR #57), đợt 3 việc sau buổi học bằng một lệnh, chỗ còn vướng mang sang buổi sau, ghi tính năng được dùng (PR #58), đợt 4 tự lưu theo tên nút, một bộ màu, trang mẫu thành phần (https://claude.ai/artifact/HuyQj149mQAYpicvQrY7Ne), kiểm truy cập (PR #61), đợt 5a Claude làm mẫu trên sân khấu, tình huống thêm, nút Nghe (PR #63), đợt 5b trang tổng quan gom việc chờ bạn, bảng học tuần (https://claude.ai/artifact/LijnAF7tSR4gBMrspPuQtV), bộ màu thienui trên claude.ai (https://claude.ai/artifact/2kM7som4ok6kmh7QaCSXZJ). Luật dùng mẫu đã vào AGENTS chung để mọi project tự dùng. Bộ quy trình chung đã dùng được: luật, mẫu, skill start-project, học nhiều môn xoay vòng (frontend 5 buổi, BA 2, chiến tranh 4), theo dõi kế hoạch và lộ trình học (PR #31 đã merge). Bản tin sáng qua mail đã bỏ (PR #24).

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| [Sửa công cụ kiểm tra báo thành công khi chưa kiểm gì](plans/2026-11-12-silent-tools-fix.md) | 1/2: chờ thien chạy thử trên laptop | 5/5 |
| [Chuyển repo thienui sang riêng tư](plans/2026-11-14-thienui-private.md) | 3/3: xong, chờ merge PR | 4/5 |
| [Học càng nhiều, repo không nặng thêm](plans/2026-11-15-lean-learning.md) | 2/6 xong; đợt 2 (gói buổi, nhật ký 3 dòng) đã merge (PR #81) | 6/12 |
| [Dùng Claude tốn ít usage hơn: đo trước, đổi sau](plans/2026-11-15-claude-usage.md) | 1/4 đang đo (thí nghiệm 2 xong: dừng 10 hay hơn 65 phút đều không đắt thêm; 1 và 3 có một lần đủ số: tắt connector không thấy giảm, mới một lần với số làm tròn); 2/4 xong (khởi động còn 3 lượt, từ 12); 3/4 bỏ Codex xong | 3/7 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Xoá nhánh `docs/cross-account-handoff` | PR #60 đã đóng, phần cần đã vào #62 | 2026-11-14 | thien bấm Delete branch; còn thì `check-open-work` cứ báo là việc chưa merge |
| Thử CodeRabbit CLI gói Free (3 lần mỗi giờ) | quyết định 002 | 2026-11-14 | Sau 24/11; [chưa kiểm] chạy không cần trình duyệt có cần Agentic API key và Usage-based add-on không |

## Vừa xong
- Gói buổi `artifacts/lesson/prepare-lesson.mjs` thay cho việc đọc cả README, file môn và thẻ khi nhắn "học"; file môn chỉ giữ 3 dòng nhật ký, dòng cũ sang `learning/<môn>/log.md`. Luồng "học" 78,7 KB còn 64,0 KB và không tăng theo số buổi (đợt 2, PR #81)

## Việc tiếp theo
1. Buổi học kế tiếp: BA 3 (các bên liên quan), dựng từ mẫu bảng dán `artifacts/it/template-ba.html` (nội dung mẫu chính là nháp buổi này). Buổi đầu dùng gói buổi: AI chạy `prepare-lesson.mjs` thay vì đọc cả các file. Mở chat mới cho buổi học, rồi chat mới nữa cho phần sau buổi (đợt 0 của kế hoạch học nhẹ dần).
2. Dùng mẫu so sánh mới cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.
3. sakubun: thêm `.gitattributes` và chép lại `scripts/check-status.mjs` bản đọc được CRLF (bản cũ ở đó vẫn hỏng trên Windows).

## Đang chờ thien
- Trên laptop Windows: làm mục "Máy Windows (làm một lần)" trong `README.md`, lệnh cuối in "ổn" là xong.
- Ở từng nick (tnt024, tnt628, tnt697): dán project instructions bản v3 (khởi động 3 lượt) có tên nick, gắn repo, tải lại 2 skill, và chọn lại phần đồng bộ knowledge, theo `profile/SETUP.md`.
- Merge sakubun PR #301 (luật AGENTS mới).

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
