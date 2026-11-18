# Làm mới kit: nút, icon, thành phần mới, vòng gu 2 bảng màu

Repo: thiengthb/thienai-workflow · Nhánh: kit-refresh (chồng lên visual-diagram-layer) · PR: #127 (nháp, base là nhánh của #126)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYey4CuVVfhKvuPEUY · Cập nhật: 2026-11-18T16:28Z

## thien muốn gì
"bạn hãy đổi một pallet màu mới giúp mình, màu nền mình muốn màu nào phù hợp với nhiều loại tài liệu hơn, và chỉnh lại các icon giúp mình, có phần icon của chip hay badge đang bị lệch, phần nút mình muốn hiện nổi như app fap mới đây của mình, hiện thành phần trang học này nó hơi có viền dày. và nếu được bạn có thể mở rộng thành phần, animation, ..." (18/11, 23:03). Trả lời câu hỏi: nhánh mới chồng lên #126; bảng màu "3 bản cho mình chọn"; mở rộng cả bốn: chuyển động, thành phần mới, trạng thái trống và đang tải, bộ icon dùng chung.

## Đã xong
- Nút viền 1px, nút đặc nổi có gờ dưới 2px, bấm lún lò xo; thẻ, ô nhập, dòng đáp án về 1px (kit.css, lesson.css)
- Icon Lucide: `artifacts/kit/make-icons.mjs` (cần `npm pack lucide-static`), 30 icon trong khối ICONS cuối kit.css; thay ? ▶ ✓ ! cũ
- Thành phần mới và chuyển động (kit.css mục "Thành phần mở rộng", kit.js Kit.icon/tabs/reveal), trang mẫu có mục cho từng cái
- Vòng gu 2: `docs/plans/2026-11-18-visual-workflow/round-2/` (palettes.css, shoot.mjs, decision.json); trang mẫu đăng đè có nút đổi A/B/C; trang chọn đã đăng; commit 7ca8024 trên kit-refresh, PR #127
- Kiểm: check-pages 0 lỗi (mẫu, ba bảng màu, trang chọn), mọi test CI

## Bước tiếp theo
1. Khi thien chọn: đọc `decisions/visual-workflow-taste-r2` trong db trang chọn (hay câu thien nhắn), chép câu vì sao nguyên văn vào `learning/frontend/taste-queue.md`
2. Chép khối màu của bản được chọn từ `round-2/palettes.css` vào ba khối :root (sáng, tối theo máy, tối ép) của `artifacts/kit/kit.css`, giữ `--line-strong`; xem có cần đổi `artifacts/design-system` không; dựng lại trang mẫu không có --palettes và đăng đè (slug dfe76dad-d260-4a9b-bb21-129c93256d0b)
3. Chạy check-tokens, check-pages, test CI; chuyển PR #127 sẵn sàng sau khi #126 merge (PR tự trỏ về main)

## Đang chờ thien
- Trang: https://claude.ai/artifact/Ci6FBx4ThzEEh4SYZESph7 (mở ở nick tnt697) · Hỏi gì: bảng màu nào làm nền chung (A Giấy trắng, B Slate lạnh, C Trắng tinh xanh petrol); đề xuất ẩn là B
- Trang mẫu để bấm thử: https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst (mở ở nick tnt697)
- Đăng lại: `node docs/plans/2026-11-18-visual-workflow/round-2/shoot.mjs` rồi `node artifacts/decide/make-decision.mjs docs/plans/2026-11-18-visual-workflow/round-2/decision.json <out>`, đăng preview.html làm index.html kèm img/

## Lưu ý
- Tooltip của kit là `data-hint`, không phải `data-tip` (trang so sánh có data-tip riêng; trùng tên làm trang tràn ngang)
- File JS gắn vào trang không được chứa chữ `</script>`
