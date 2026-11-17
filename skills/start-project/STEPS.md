# Các bước của skill start-project

File này là phần thân của skill `start-project`. `SKILL.md` chỉ trỏ tới đây, nên sửa file này thì không phải tải lại skill lên các tài khoản Claude.

## Khi project đã có nhưng chưa setup (chưa có instructions "chuẩn setup", chưa gắn repo)
Đây là cổng duy nhất bắt được project quên setup, vì khi chưa gắn repo thì AGENTS.md không được đọc. Lỗi đã gặp 2026-11-14: project "Claude" ở nick tnt024 thiếu instructions và repo mà không ai nhắc.
- Project nằm trong bảng của `profile/SETUP.md`: kiểm theo mục "AI kiểm gì, lúc nào" ở đó (gắn repo thienai-workflow vào phiên nếu được rồi chạy `templates/setup-check.mjs`), nhắc thien đoạn cần dán và chỗ bấm, rồi làm việc thien giao. Không hỏi lại câu "áp quy trình chung không".
- Project không có trong bảng: làm như mục dưới (project mới).

## Khi bắt đầu project mới
Skill có thể được gọi ở coordinator hoặc ở một thread. Khi nói với thien, gọi là "quy trình chung", không nhắc tên skill.

0. Trước mọi câu hỏi: nhắc thien việc dở theo mục "Nhắc việc dở" của `profile/PROFILE.md` (PR còn mở, thread chưa xong ở các project khác nếu đọc được). Rồi đọc memory của project. Nếu đã ghi thien chọn gì cho project này thì làm theo, không hỏi lại.
1. Hỏi một câu, có lựa chọn: "Áp quy trình chung của bạn cho project này không? Có / Không / Chỉ dùng hồ sơ." Có thẻ quyết định thì dùng thẻ. Thien trả lời xong thì ghi ngay vào memory của project ("Quy trình chung: Có/Không/Chỉ dùng hồ sơ, ngày ..."), để thread khác không hỏi lại.
2. Thien chọn Không hoặc không trả lời: dừng, không hỏi lại trong project này.
3. Thien chọn "Chỉ dùng hồ sơ": đọc `profile/PROFILE.md` và làm việc theo đó, không tạo file nào trong repo của project.
4. Thien chọn Có:
   - Đọc `profile/PROFILE.md` và các file trong `templates/` của repo thienai-workflow.
   - Về quy trình, hỏi tối đa hai câu: project thuộc loại nào (web app, đồ án học thuật, BA, ghi chú...), repo nào. Câu hỏi về yêu cầu của app là việc của project, hỏi riêng sau bước này.
   - Trong repo của project, qua một PR: tạo `AGENTS.md` (từ mẫu, thêm phần riêng của project), `CLAUDE.md` chỉ có một dòng `@AGENTS.md`, `docs/STATUS.md` (từ mẫu) và `docs/decisions/` (chép mẫu ghi quyết định vào). Lý do có `CLAUDE.md`: Claude Code chỉ tự đọc `AGENTS.md` khi repo không có `CLAUDE.md`, và có phiên không đọc `AGENTS.md`; dòng `@AGENTS.md` bảo Claude nạp luật từ `AGENTS.md`. Repo đã có `CLAUDE.md`:
     - `CLAUDE.md` chỉ có vài dòng riêng: chuyển các dòng đó vào phần riêng của `AGENTS.md`, rồi để `CLAUDE.md` còn một dòng `@AGENTS.md`.
     - `CLAUDE.md` đã chứa bộ luật riêng, nhất là luật nạp từ repo khác (ví dụ sakubun lấy luật từ nuc-infra): không chuyển, không ghi đè. Thêm dòng `@AGENTS.md` vào đầu `CLAUDE.md`, và ghi ở đầu phần riêng của `AGENTS.md`: "Luật riêng của repo này nằm ở `CLAUDE.md`, đọc file đó trước." để Codex và Gemini cũng biết.
   - Chép `templates/check-status.mjs` vào `scripts/check-status.mjs` của project. Project có CI thì thêm bước `node scripts/check-status.mjs`; chưa có CI thì báo thien ở bước 5. Lý do: luật "STATUS dưới 40 dòng, tối đa 3 việc chờ" chỉ ghi bằng chữ thì phiên khác bỏ qua (sakubun, 7/11: chưa đầy một giờ file đã dài lại 100 dòng).
   - Chép `templates/gitattributes.template` thành `.gitattributes` ở gốc repo của project, trong cùng PR. Repo đã có `.gitattributes` thì đặt dòng `* text=auto eol=lf` ở **đầu** file (luật đứng sau thắng, nên các ngoại lệ sẵn có như `*.bat text eol=crlf` phải nằm sau nó), rồi kiểm bằng `git check-attr -a <một file .bat>`. Repo đã có file từ trước: trong cùng PR chạy `git add --renormalize .` và commit, để file đã lỡ lưu CRLF cũng thành LF; người đã clone thì làm theo mục "Máy Windows (làm một lần)" trong README của thienai-workflow (cần `git status` sạch). Lý do: git trên Windows đổi file thành CRLF, script đọc Markdown như `check-status.mjs` và `handoff.mjs` tìm không thấy mục (lỗi thật trên laptop của thien, thienai-workflow PR #69).
   - Trong một PR vào repo thienai-workflow, thêm repo này vào `life/tracked-repos.md` để phần chung của `AGENTS.md` được đồng bộ khi mẫu đổi. Không hỏi thêm; báo ở bước 5 để thien bỏ nếu không muốn. Kèm hướng dẫn thêm repo vào token `workflow-sync` theo `life/tracked-repos.md`.
   - Nếu là đồ án, bài môn học, hoặc project nhóm cần khai báo AI: chép thêm `templates/AI-LOG.template.md` vào `docs/ai-log.md` trong cùng PR đó.
   - Bước này hay bị quên: trong PR vào thienai-workflow, thêm project vào bảng "Mỗi project, ở mỗi nick" của `profile/SETUP.md`, rồi đưa thien đúng đoạn project instructions trong file đó (bản beta hay bản cũ, theo kiểu project của nick ở `profile/ACCOUNTS.md`) kèm chỗ dán. AI không tự sửa cài đặt được. Chỉ một đoạn chuẩn, để `setup-check.mjs` kiểm được ở mọi project.
   - Nếu lưu hồ sơ vào memory của project, ghi rõ đó là bản sao, bản gốc ở repo thienai-workflow.
5. Báo lại trong 3 dòng: đã tạo gì, PR nào, thien cần làm gì.

## Khi thien muốn thêm hay bỏ repo khỏi danh sách đồng bộ
Ở bất kỳ project nào, bất kỳ lúc nào: mở một PR vào repo thienai-workflow sửa bảng trong `life/tracked-repos.md`.

## Khi xem lại quy trình (hết milestone, hoặc thien yêu cầu)
1. Đọc lại hồ sơ và các lần thien phải nhắc lại hoặc chê trong milestone vừa qua.
2. Đề xuất tối đa 3 thay đổi cho `profile/PROFILE.md` hoặc `templates/AGENTS.template.md`, mỗi thay đổi kèm lý do và lý do mạnh nhất để không đổi.
3. Giữ giới hạn: `profile/PROFILE.md` và phần chung của `templates/AGENTS.template.md` mỗi file dưới 60 dòng. Thêm một ý thì bỏ hoặc gộp một ý khác.
4. Thien chọn cái nào, AI mở một PR vào repo thienai-workflow. Không tự sửa.
