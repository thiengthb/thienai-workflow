# Hàng chờ gu cho thienui

Câu gu thien nói trong buổi học frontend, chờ vào thienui `docs/taste.md` mục "Đang thử". Sau mỗi buổi frontend, `artifacts/lesson/after-lesson.mjs` in câu gu của buổi; AI chép câu nào đúng là gu vào bảng dưới, giữ lời của thien. Khoảng 2 tuần một lần, AI gom các dòng chưa vào thành một PR vào thienui, thien duyệt từng dòng (thien chọn 2026-11-17, kế hoạch [`docs/plans/2026-11-17-action-gaps.md`](../../docs/plans/2026-11-17-action-gaps.md)). Dòng đã vào thì ghi số PR ở cột cuối (PR chưa merge thì ghi "chờ merge"; merge rồi thì bỏ chữ đó); thien bỏ dòng nào thì ghi "bỏ".

Năm dòng đầu là phần bù một lần, rút từ file bài frontend 1–5; thien duyệt ngày 2026-11-17 (bỏ dòng 1, gộp dòng 3 với 4).

| Ngày | Buổi | Lời thien (theo file bài) | Đề xuất dòng cho taste.md | Đã vào thienui |
|---|---|---|---|---|
| 2026-11-07 | [Frontend 1](lessons/01-one-focal-point.md) | Thích không khí màu xanh nhẹ của TickTick, dù thấy bố cục Todoist tốt hơn | Thích nền và màu nhấn xanh nhẹ, dịu; nhưng bố cục rõ đứng trước màu | bỏ |
| 2026-11-07 | [Frontend 2](lessons/02-type-hierarchy.md) | Chọn cách dùng chữ của Slack, và nhận ra nhờ học xong | Thứ bậc chữ rõ kiểu Slack: ít cỡ chữ, độ đậm và khoảng cách làm phần việc chính | thienui PR #8 |
| 2026-11-11 | [Frontend 3](lessons/03-spacing-groups.md) | Chọn "thoáng", vì cái nhìn đầu tiên quyết định; thông tin dày và dính sát làm mất thiện cảm ngay | Mặc định thoáng; không dồn sát thông tin ở màn đầu tiên người dùng thấy | gộp vào dòng dưới, thienui PR #8 |
| 2026-11-11 | [Frontend 4](lessons/04-fix-a-whole-screen.md) | App nhiều thông tin thì gọn chặt nhưng bố cục vẫn rõ; app học từ vựng thì thoáng hơn, vì ít thông tin mỗi lần mới dễ nhớ | Độ dày theo loại app: app nhiều dữ liệu gọn chặt mà vẫn chia nhóm rõ; app học thoáng | thienui PR #8 (gộp cả dòng trên) |
| 2026-11-12 | [Frontend 5](lessons/05-one-accent-colour.md) | Màu chính chỉ xuất hiện ở tác vụ chính của màn, phần khác không dùng để tranh chú ý (tự nói lại; có thể là luật hơn là gu) | Màu nhấn chỉ cho việc chính của màn (có thể đã có trong taste.md, AI kiểm trước khi đưa) | thienui PR #8 |
| 2026-11-17 | Sơ đồ hệ thống trong README (không phải buổi học) | "sơ đồ khối giống drawio bình thường thôi", bản cũ "có màu và cả bóng nên mình mới thấy xấu không hợp với github" | Sơ đồ trong tài liệu: khối trơn kiểu draw.io, viền mảnh, mũi tên, không tô màu, không bóng | |
