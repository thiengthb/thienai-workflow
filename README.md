# thienai-workflow

Bộ quy trình chung khi thien làm việc với AI. Áp vào project mới chỉ khi thien đồng ý ở đầu project.

## Có gì trong repo

```text
profile/      Về thien: AI đọc ở mọi project
templates/    File mẫu, chép vào repo của từng project
skills/       Skill tải lên tài khoản Claude
life/         Cấu hình trợ lý cuộc sống (Project `life`)
```

| Thư mục | File | Dùng để |
|---|---|---|
| `profile/` | `PROFILE.md` | Hồ sơ của thien: cách làm việc, cách ra quyết định với AI, ngôn ngữ, gu UI, trình độ. Gu UI chi tiết ở repo [thienui](https://github.com/thiengthb/thienui), file `docs/taste.md` |
| | `SKILL-LEVEL.md` | Trình độ từng kỹ năng và cách AI dựa vào đó |
| `templates/` | `AGENTS.template.md` | Mẫu `AGENTS.md` cho mỗi project, đọc được bởi Claude, Codex, Gemini. Mỗi project có thêm `CLAUDE.md` chỉ một dòng `@AGENTS.md` |
| | `STATUS.template.md` | Mẫu `docs/STATUS.md`: project đang ở đâu, việc tiếp theo, đang chờ ai |
| | `DECISION.template.md` | Mẫu ghi quyết định khó sửa lại, trong `docs/decisions/` |
| | `AI-LOG.template.md` | Mẫu nhật ký dùng AI cho đồ án, môn học, project nhóm, trong `docs/ai-log.md` |
| `skills/` | `start-project/` | Skill hỏi thien có áp quy trình không, rồi chép các file mẫu vào project |
| `life/` | `tracked-repos.md` | Danh sách repo mà bản tin sáng đọc `docs/STATUS.md` |

File mẫu giữ đuôi `.template.md` để không bị nhầm thành luật thật: Codex và Claude Code tự nạp file tên `AGENTS.md` hoặc `CLAUDE.md` khi làm việc trong thư mục chứa nó.

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

Chỉ qua PR vào repo này, thien duyệt. Mỗi milestone AI đề xuất tối đa 3 thay đổi. `profile/PROFILE.md` và phần chung của `templates/AGENTS.template.md` mỗi file dưới 60 dòng: thêm một ý thì bỏ hoặc gộp một ý khác. Sửa skill thì phải tải lại file zip lên từng tài khoản.
