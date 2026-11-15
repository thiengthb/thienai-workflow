# Học chỉ bằng Claude: bỏ phần Codex, kế hoạch tối ưu usage cho Claude

Repo: thiengthb/thienai-workflow · Nhánh: chưa có (tạo từ main sau khi PR #81 merge) · PR: chưa có
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXNLQf4kZZBQiEFV6R · Cập nhật: 2026-11-15T07:14Z

## thien muốn gì
"bây giờ mình chỉ học bằng claude nên bạn có thể bỏ phần codex đi, và chỉ tối ưu cho claude thôi, vì chỉ có mỗi claude làm thỏa mãn phần giao diện artifact cho mình. Nên bạn lên kế hoạch có thể tập trung tối ưu phần này. Và chắc chắn bạn đã nghiên cứu và lên phương án đủ kĩ để tối ưu chưa" (2026-11-15)

## Đã xong
- Chưa làm gì. Chat cũ (đợt 2, PR #81) đã trả lời thẳng là chưa nghiên cứu đủ, kèm các chỗ hổng ở "Bước tiếp theo".

## Bước tiếp theo
1. Viết kế hoạch mới (theo `profile/PLANNING.md`) thay cho đợt 3–5 của `docs/plans/2026-11-15-lean-learning.md`, chỉ cho Claude trên claude.ai. Đo trước rồi mới đổi. Chỗ phải nghiên cứu và đo:
   - **Đo một buổi thật chia theo giai đoạn** (đọc luật, soạn, viết trang, sửa lỗi, đăng, sau buổi), mỗi giai đoạn bao nhiêu lượt gọi. Đây là ô đợt 0 còn trống. Hai lần `explain-usage` đều cho thấy khoảng 55–57% usage là phần đọc lại mỗi lượt, nên **số lượt gọi** quan trọng ngang với số KB.
   - **Phần cố định mỗi lượt mà repo không điều khiển được:** hướng dẫn hệ thống, danh sách công cụ, connector đang bật (Figma, sakubun, Chrome… có trong mọi chat của project Claude). [chưa kiểm] tắt connector không dùng khi học thì phần này giảm bao nhiêu; [chưa kiểm] knowledge đồng bộ từ GitHub (134 KB) có vào ngữ cảnh mỗi lượt không.
   - **Phần viết ra** (đắt gấp khoảng 5 lần): trang bài 20–35 KB. Đợt 3 cũ (khung tự sinh) nhắm đúng chỗ này; cân nhắc làm trước.
   - **Lượt sửa lỗi:** đếm bao nhiêu lượt `make-lesson` báo lỗi rồi sửa ở các buổi gần đây; nếu nhiều, kiểm sớm hơn trong lệnh dựng.
   - Tra tài liệu Anthropic về cách claude.ai tính usage, prompt cache trong một chat, project knowledge (dùng `profile/RESEARCH.md`).
2. Bỏ Codex khỏi luồng học (làm trong cùng PR): `learning/codex.md`, bước 3 "học" trong `AGENTS.md`, hàng "học" trong `profile/MAP.md`, dòng Codex trong gói `prepare-lesson.mjs`, câu "Buổi học ngoài Claude" trong `learning/README.md`, phần Codex trong `learning/README.md` và `profile/TUTOR.md` nếu có. Giữ luật repo dùng chung cho Codex khi sửa code (AGENTS phần chung), chỉ bỏ phần học. Lưu ý: Claude vốn không đọc `codex.md`, nên bỏ nó làm `reading-cost` giảm 6,5 KB nhưng usage thật gần như không đổi.
3. Trình thien kế hoạch trước khi làm phần lớn.

## Đang chờ thien
- Merge PR #81 trước (việc này làm trên main sau khi merge).

## Lưu ý
- Làm ở chat mới (luật `profile/CHATS.md`), không gộp với buổi học BA 3.
- Đừng hứa con số tiết kiệm trước khi đo một buổi thật theo giai đoạn.
