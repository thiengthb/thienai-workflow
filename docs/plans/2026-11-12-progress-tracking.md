# Theo dõi tiến độ kế hoạch và lộ trình học

Trạng thái: đang chạy · Duyệt: 2026-11-12 · Cập nhật: 2026-11-12 (sau PR #43) · Thread: [Theo dõi tiến độ các kế hoạch đã duyệt](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvR1jxNiHJob8uUW8r9JhndVb)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đã tick đủ 13/13 việc. Lần nhắc đầu tiên đã chạy tối 2026-11-12 và 3 trang đã đăng lại với dữ liệu mới.
- Còn thiếu: thien xác nhận mở được 3 trang trên điện thoại và laptop (điều kiện "xong khi" của checkpoint 3 và 4); sau đó chuyển kế hoạch sang "xong".
- thien cần làm: mở [trang tiến độ](https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4), [trang tổng quan](https://claude.ai/artifact/SZGp85NU46SDp9k6i7Lb9n), [trang lộ trình học](https://claude.ai/artifact/Vubbj6ghT9L7eKYegTfT9n) bằng tài khoản đã đăng chúng.

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
- [x] `profile/PLANNING.md`, `templates/PLAN.template.md`, bảng "Kế hoạch đang chạy" trong mẫu STATUS (PR #31, merge 2026-11-12)
- [x] Nối vào mẫu AGENTS và `PROFILE.md` (PR #31, merge 2026-11-12)
- [x] Script kiểm file kế hoạch đủ mục, chạy trong CI (PR #31, merge 2026-11-12)

### 3. Trang tiến độ
Xong khi: thien mở được trang của repo này và trang tổng quan trên cả điện thoại lẫn laptop.
- [x] Script `templates/progress-page.mjs` sinh trang từ STATUS và file kế hoạch (PR #31, merge 2026-11-12)
- [x] Trang tiến độ của repo thienai-workflow: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4 (đăng trong PR #31)
- [x] Trang tổng quan các repo đang áp quy trình: https://claude.ai/artifact/SZGp85NU46SDp9k6i7Lb9n (đăng trong PR #31)

### 4. Lộ trình học
Xong khi: thien mở trang và thấy mỗi môn đang ở chặng nào, buổi tới học gì, nguồn học ở đâu.
- [x] `learning/roadmap.md` cho frontend, BA, chiến tranh (PR #31, merge 2026-11-12)
- [x] Trang lộ trình học: https://claude.ai/artifact/Vubbj6ghT9L7eKYegTfT9n (đăng trong PR #31)

### 5. Nhắc theo lịch
Xong khi: thien nhận được lần nhắc đầu tiên, hoặc chọn không cần.
- [x] thien chọn bật, hai lần mỗi tuần (2026-11-12)
- [x] Đặt lịch nhắc thứ Hai và thứ Năm, 18:47
- [x] Lần nhắc đầu tiên chạy, đăng lại trang tổng quan và nhắn thien 4 việc dở (2026-11-12 18:48)

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-12 | Thêm phần lộ trình học, nằm riêng khỏi mọi kế hoạch | thien yêu cầu sau khi đọc kế hoạch nghiên cứu |
| 2026-11-12 | Mỗi project một trang tiến độ riêng, repo workflow một trang, thêm một trang tổng quan | thien trả lời câu hỏi 1 |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
