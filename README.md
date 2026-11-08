# thienai-workflow

Bộ quy trình chung khi thien làm việc với AI. Áp vào project mới chỉ khi thien đồng ý ở đầu project.

## Có gì trong repo

```text
profile/      Về thien: AI đọc ở mọi project
templates/    File mẫu, chép vào repo của từng project
skills/       Skill tải lên tài khoản Claude
life/         Bản tin sáng và cấu hình trợ lý cuộc sống
learning/     Hồ sơ và trạng thái từng môn thien đang học cùng AI
artifacts/    Mẫu artifact thien đã thích, dùng lại ở mọi project và tài khoản
```

| Thư mục | File | Dùng để |
|---|---|---|
| `profile/` | `PROFILE.md` | Hồ sơ của thien: cách làm việc, cách ra quyết định với AI, ngôn ngữ, gu UI, trình độ. Gu UI chi tiết ở repo [thienui](https://github.com/thiengthb/thienui), file `docs/taste.md` |
| | `SKILL-LEVEL.md` | Trình độ từng kỹ năng và cách AI dựa vào đó |
| | `RESEARCH.md` | 5 quy tắc khi AI tra cứu trên mạng, để không trích nguồn bịa hay nguồn chưa đọc, và bảng chọn công cụ |
| | `VOICE.md` | Giọng văn tiếng Việt, câu mẫu, từ thien đã chê, và cách AI phản biện thien |
| | `GUIDES.md` | Cách viết hướng dẫn cài đặt và hướng dẫn test tay: link, vị trí nút, form điền sẵn, kết quả cần thấy, dữ liệu test |
| | `TUTOR.md` | Cách AI dạy thien ở mọi môn: thử trước, giải thích sau, ghi nhật ký; đứng đúng vai khi làm việc |
| `templates/` | `AGENTS.template.md` | Mẫu `AGENTS.md` cho mỗi project, đọc được bởi Claude, Codex, Gemini. Mỗi project có thêm `CLAUDE.md` chỉ một dòng `@AGENTS.md` |
| | `STATUS.template.md` | Mẫu `docs/STATUS.md`: project đang ở đâu, việc tiếp theo, đang chờ ai |
| | `DECISION.template.md` | Mẫu ghi quyết định khó sửa lại, trong `docs/decisions/` |
| | `SETUP-GUIDE.template.md` | Mẫu hướng dẫn cài đặt theo `profile/GUIDES.md` |
| | `MANUAL-TEST.template.md` | Mẫu hướng dẫn test tay: chuẩn bị, tài khoản test, ca test có mã, bảng kết quả. Chép vào `docs/manual-test/` |
| | `test-accounts.template.csv` | Mẫu danh sách tài khoản test, chỉ mật khẩu giả |
| | `AI-LOG.template.md` | Mẫu nhật ký dùng AI cho đồ án, môn học, project nhóm, trong `docs/ai-log.md` |
| `.github/` | `workflows/sync-agents-md.yml` | Mẫu `AGENTS.md` đổi thì tự mở PR vào từng repo trong `life/tracked-repos.md` để cập nhật phần chung, giữ nguyên phần riêng của project. Cần secret `SYNC_TOKEN` |
| `skills/` | `start-project/` | Skill hỏi thien có áp quy trình không, rồi chép các file mẫu vào project |
| `learning/` | `frontend.md` | Đang học frontend tới đâu, buổi tiếp theo dạy gì, để tài khoản khác dạy tiếp |
| | `glossary.md` | Bảng tra thuật ngữ tiếng Anh, AI thêm khi dùng từ thien chưa học |
| `artifacts/` | `README.md` | Danh sách mẫu artifact thien thích và khi nào dùng; mỗi mẫu là một file HTML |
| `life/` | `names.md` | Tên token, project, biến đã thống nhất, để AI dùng lại mà không hỏi lại thien |
| | `tracked-repos.md` | Danh sách repo mà bản tin sáng đọc `docs/STATUS.md` |
| | `morning-brief/` | Script Google Apps Script gửi bản tin sáng qua mail: lịch, Google Tasks, tiến độ repo. Miễn phí, không dùng Claude |

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
