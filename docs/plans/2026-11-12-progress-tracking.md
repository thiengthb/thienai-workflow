# Theo dõi tiến độ kế hoạch và lộ trình học

Trạng thái: đang chạy · Duyệt: 2026-11-12 · Cập nhật: 2026-11-12 · Thread: [Theo dõi tiến độ các kế hoạch đã duyệt](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvR1jxNiHJob8uUW8r9JhndVb)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: checkpoint 2 đến 4 đã làm xong trong PR #31, chờ thien xem.
- Còn thiếu: thien xem 3 trang trên điện thoại và laptop, merge PR #31. Lần nhắc đầu tiên chạy tối nay 18:47.
- thien cần làm: mở 3 trang trong tin nhắn của thread, rồi merge [PR #31](https://github.com/thiengthb/thienai-workflow/pull/31).

## Mục tiêu
Khi thien mở lại sau vài ngày, trong 2 phút biết kế hoạch nào đã duyệt và đang chạy, đang ở checkpoint nào, đã tick gì, gặp lỗi gì, đổi bước nào, và việc tiếp theo của thien. Cùng lúc có một lộ trình học riêng cho từng môn.

## Không làm
- Không dùng GitHub Issues hay Projects: thêm một công cụ phải trông.
- Không kiểm soát gắt: không chấm giờ, không báo cáo hằng ngày.
- Không làm lại luật nhắc việc dở (PR #28, #29), chỉ nối vào.

## Checkpoint

### 1. Nghiên cứu và kế hoạch
Xong khi: thien duyệt kế hoạch nghiên cứu.
- [x] Gửi kế hoạch nghiên cứu, thien duyệt (2026-11-12)
- [x] Nghiên cứu cách theo dõi tiến độ, cách làm lộ trình học, tự phản biện cách AI lập kế hoạch

### 2. Luật và mẫu
Xong khi: PR merge, mẫu có trong `templates/`.
- [ ] `profile/PLANNING.md`, `templates/PLAN.template.md`, bảng "Kế hoạch đang chạy" trong mẫu STATUS (chờ merge PR #31)
- [ ] Nối vào mẫu AGENTS và `PROFILE.md` (chờ merge PR #31)
- [ ] Script kiểm file kế hoạch đủ mục, chạy trong CI (chờ merge PR #31)

### 3. Trang tiến độ
Xong khi: thien mở được trang của repo này và trang tổng quan trên cả điện thoại lẫn laptop.
- [ ] Script `templates/progress-page.mjs` sinh trang từ STATUS và file kế hoạch (chờ merge PR #31)
- [ ] Trang tiến độ của repo thienai-workflow
- [ ] Trang tổng quan các repo đang áp quy trình

### 4. Lộ trình học
Xong khi: thien mở trang và thấy mỗi môn đang ở chặng nào, buổi tới học gì, nguồn học ở đâu.
- [ ] `learning/roadmap.md` cho frontend, BA, chiến tranh (chờ merge PR #31)
- [ ] Trang lộ trình học

### 5. Nhắc theo lịch
Xong khi: thien nhận được lần nhắc đầu tiên, hoặc chọn không cần.
- [x] thien chọn bật, hai lần mỗi tuần (2026-11-12)
- [x] Đặt lịch nhắc thứ Hai và thứ Năm, 18:47
- [ ] thien nhận lần nhắc đầu tiên (tối 2026-11-12)

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-12 | Thêm phần lộ trình học, nằm riêng khỏi mọi kế hoạch | thien yêu cầu sau khi đọc kế hoạch nghiên cứu |
| 2026-11-12 | Mỗi project một trang tiến độ riêng, repo workflow một trang, thêm một trang tổng quan | thien trả lời câu hỏi 1 |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
