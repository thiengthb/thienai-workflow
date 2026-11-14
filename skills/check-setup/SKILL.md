---
name: check-setup
description: Dùng ở đầu MỌI thread hay cuộc trò chuyện mới của thien, trong mọi project cũ hay mới và ở mọi nick Claude, trước khi làm việc thien giao, kể cả khi project chưa có project instructions hay chưa gắn repo. Kiểm project và nick đã đúng chuẩn setup chung chưa (instructions, tên nick, repo, skill) rồi nhắc thien sửa. (bản 1)
---

# Kiểm setup đầu phiên

Skill này là chỗ duy nhất chạy được ở mọi project của một nick, kể cả project cũ chưa có instructions, nên luật kiểm setup nằm ở đây chứ không chỉ trong instructions. Nó chỉ chỉ đường: các bước nằm trong repo, sửa một chỗ là mọi nick dùng được ngay, không phải tải lại skill.

1. Đọc bản mới nhất của `profile/SETUP.md` trong repo `thiengthb/thienai-workflow`, nhánh `main`, theo cách đầu tiên làm được:
   - Phiên có thể gắn repo (Claude Code, thread trong project): gắn `thiengthb/thienai-workflow` vào phiên rồi đọc file.
   - Dùng GitHub connector đọc file đó.
   - Máy có `gh` đã đăng nhập: `gh api repos/thiengthb/thienai-workflow/contents/profile/SETUP.md -H "Accept: application/vnd.github.raw"`.
2. Làm đúng mục "AI kiểm gì, lúc nào" trong file đó (chạy `templates/setup-check.mjs` khi chạy được lệnh; không chạy được thì tự so theo file). File đó thắng mọi thứ bạn nhớ về skill này.
3. Thiếu gì thì nói với thien trước khi làm việc, kèm đúng đoạn cần dán và chỗ bấm. Đủ rồi thì không nói gì, làm việc thien giao.
4. Không đọc được repo: nói thẳng với thien một câu là nick này chưa đọc được repo quy trình (thường do chưa nối GitHub ở Settings > Connectors), rồi làm việc thien giao.
