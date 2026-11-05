# thienai-workflow

Bộ quy trình chung khi thien làm việc với AI. Áp vào project mới chỉ khi thien đồng ý ở đầu project.

## Có gì trong repo

| File | Dùng để |
|---|---|
| `PROFILE.md` | Hồ sơ của thien: cách làm việc, cách ra quyết định với AI, ngôn ngữ, gu UI, trình độ |
| `UI-TASTE.md` | Gu UI chi tiết: font, cỡ, màu, icon, chuyển động, lỗi thien ghét |
| `SKILL-LEVEL.md` | Trình độ từng kỹ năng và cách AI dựa vào đó |
| `AGENTS.template.md` | Mẫu `AGENTS.md` cho mỗi project, đọc được bởi Claude, Codex, Gemini |
| (không có mẫu) | Mỗi project có thêm `CLAUDE.md` chỉ một dòng `@AGENTS.md`, để Claude Code chắc chắn đọc `AGENTS.md` |
| `STATUS.template.md` | Mẫu `docs/STATUS.md`: project đang ở đâu, việc tiếp theo, đang chờ ai |
| `DECISION.template.md` | Mẫu ghi quyết định khó sửa lại, trong `docs/decisions/` |
| `AI-LOG.template.md` | Mẫu nhật ký dùng AI cho đồ án, môn học, project nhóm, trong `docs/ai-log.md` |
| `skills/start-project/` | Skill hỏi thien có áp quy trình không, rồi tạo các file trên trong project |

## Cài cho một tài khoản Claude (làm một lần cho mỗi tài khoản)

1. Settings > Your Claude, dán vào ô hướng dẫn cho Claude:
   ```text
   Mình là thien. Quy trình làm việc chung của mình ở repo github.com/thiengthb/thienai-workflow.
   Khi bắt đầu project mới, dùng skill start-project: hỏi mình trước, mình đồng ý mới áp.
   Trả lời bằng tiếng Việt tự nhiên, không tự chế từ, không dịch sát chữ từ tiếng Anh.
   ```
2. Bật "Code execution and file creation" (Settings), rồi vào Customize > Skills, tải lên file zip của thư mục `skills/start-project/`.
3. Mở một project mới: coordinator sẽ hỏi có áp quy trình không.

Codex, Gemini và người khác không cần cài gì: họ đọc `AGENTS.md` và `docs/STATUS.md` trong repo của project.

## Sửa quy trình

Chỉ qua PR vào repo này, thien duyệt. Mỗi milestone AI đề xuất tối đa 3 thay đổi. `PROFILE.md` và phần chung của `AGENTS.template.md` mỗi file dưới 60 dòng: thêm một ý thì bỏ hoặc gộp một ý khác. Sửa skill thì phải tải lại file zip lên từng tài khoản.
