---
name: start-project
description: Dùng khi thien bắt đầu một project mới, một repo mới chưa có AGENTS.md, khi thien nói "xem lại quy trình" hay vừa xong một milestone, hoặc khi thien muốn thêm hay bỏ một repo khỏi bản tin sáng. Hỏi thien có áp quy trình chung không; chỉ áp khi thien đồng ý.
---

# Bắt đầu project với quy trình chung của thien

Nguồn duy nhất của quy trình là repo `github.com/thiengthb/thienai-workflow` (hồ sơ của thien trong thư mục `profile/`, các file mẫu trong thư mục `templates/`). Skill này chỉ chỉ đường, không chứa luật.

## Khi bắt đầu project mới
Skill có thể được gọi ở coordinator hoặc ở một thread. Khi nói với thien, gọi là "quy trình chung", không nhắc tên skill.

0. Đọc memory của project trước. Nếu đã ghi thien chọn gì cho project này thì làm theo, không hỏi lại.
1. Hỏi một câu, có lựa chọn: "Áp quy trình chung của bạn cho project này không? Có / Không / Chỉ dùng hồ sơ." Có thẻ quyết định thì dùng thẻ. Thien trả lời xong thì ghi ngay vào memory của project ("Quy trình chung: Có/Không/Chỉ dùng hồ sơ, ngày ..."), để thread khác không hỏi lại.
2. Thien chọn Không hoặc không trả lời: dừng, không hỏi lại trong project này.
3. Thien chọn "Chỉ dùng hồ sơ": đọc `profile/PROFILE.md` và làm việc theo đó, không tạo file nào trong repo của project.
4. Thien chọn Có:
   - Đọc `profile/PROFILE.md` và các file trong `templates/` của repo thienai-workflow.
   - Về quy trình, hỏi tối đa hai câu: project thuộc loại nào (web app, đồ án học thuật, BA, ghi chú...), repo nào. Câu hỏi về yêu cầu của app là việc của project, hỏi riêng sau bước này.
   - Trong repo của project, qua một PR: tạo `AGENTS.md` (từ mẫu, thêm phần riêng của project), `CLAUDE.md` chỉ có một dòng `@AGENTS.md`, `docs/STATUS.md` (từ mẫu) và `docs/decisions/` (chép mẫu ghi quyết định vào). Lý do có `CLAUDE.md`: Claude Code chỉ tự đọc `AGENTS.md` khi repo không có `CLAUDE.md`, và có phiên không đọc `AGENTS.md`; dòng `@AGENTS.md` bảo Claude nạp luật từ `AGENTS.md`. Repo đã có `CLAUDE.md` thì thêm dòng đó vào đầu file, không ghi đè.
   - Trong một PR vào repo thienai-workflow, thêm repo này vào `life/tracked-repos.md` để bản tin sáng theo dõi. Không hỏi thêm; báo ở bước 5 để thien bỏ nếu không muốn.
   - Nếu là đồ án, bài môn học, hoặc project nhóm cần khai báo AI: chép thêm `templates/AI-LOG.template.md` vào `docs/ai-log.md` trong cùng PR đó.
   - Bước này hay bị quên: đưa thien đoạn sau để dán vào hướng dẫn của project (AI không tự sửa cài đặt được): "Project này theo quy trình thienai-workflow. Trước khi làm, đọc AGENTS.md và docs/STATUS.md trong repo <tên repo>."
   - Nếu lưu hồ sơ vào memory của project, ghi rõ đó là bản sao, bản gốc ở repo thienai-workflow.
5. Báo lại trong 3 dòng: đã tạo gì, PR nào, thien cần làm gì.

## Khi thien muốn thêm hay bỏ repo khỏi bản tin sáng
Ở bất kỳ project nào, bất kỳ lúc nào: mở một PR vào repo thienai-workflow sửa bảng trong `life/tracked-repos.md`. Đã đủ 6 repo thì hỏi thien bỏ repo nào trước.

## Khi xem lại quy trình (hết milestone, hoặc thien yêu cầu)
1. Đọc lại hồ sơ và các lần thien phải nhắc lại hoặc chê trong milestone vừa qua.
2. Đề xuất tối đa 3 thay đổi cho `profile/PROFILE.md` hoặc `templates/AGENTS.template.md`, mỗi thay đổi kèm lý do và lý do mạnh nhất để không đổi.
3. Giữ giới hạn: `profile/PROFILE.md` và phần chung của `templates/AGENTS.template.md` mỗi file dưới 60 dòng. Thêm một ý thì bỏ hoặc gộp một ý khác.
4. Thien chọn cái nào, AI mở một PR vào repo thienai-workflow. Không tự sửa.
