---
name: start-project
description: Dùng khi thien bắt đầu một project mới, một repo mới chưa có AGENTS.md, khi phiên đang ở một project chưa có project instructions "chuẩn setup" hay chưa gắn repo nào (kể cả project cũ), khi thien nói "xem lại quy trình" hay vừa xong một milestone, hoặc khi thien muốn thêm hay bỏ một repo khỏi danh sách đồng bộ AGENTS.md. Hỏi thien có áp quy trình chung không; chỉ áp khi thien đồng ý. (bản 1)
---

# Bắt đầu project với quy trình chung của thien

Skill này chỉ chỉ đường. Các bước nằm trong repo để sửa một chỗ là mọi tài khoản dùng được ngay, không phải tải lại skill.

1. Đọc bản mới nhất của các bước, theo cách đầu tiên làm được:
   - Dùng GitHub connector (hoặc GitHub MCP) đọc file `skills/start-project/STEPS.md`, repo `thiengthb/thienai-workflow`, nhánh `main`.
   - Hoặc, nếu đang ở máy có `gh` đã đăng nhập: `gh api repos/thiengthb/thienai-workflow/contents/skills/start-project/STEPS.md -H "Accept: application/vnd.github.raw"`.
   - Repo này để riêng tư, nên link `raw.githubusercontent.com` không mở được khi chưa đăng nhập.
2. Làm đúng theo các bước trong file đó. File đó thắng mọi thứ bạn nhớ về skill này.
3. Không đọc được: nói thẳng với thien là chưa mở được repo quy trình (thường do tài khoản này chưa nối GitHub) nên chưa áp gì, chỉ hỏi một câu "Áp quy trình chung của bạn cho project này không? Có / Không / Chỉ dùng hồ sơ", rồi chờ. Không tự đoán các bước còn lại.
