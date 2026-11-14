# thienai-workflow

Bộ quy trình chung khi thien làm việc với AI. Áp vào project mới chỉ khi thien đồng ý ở đầu project.

## Có gì trong repo

`AGENTS.md` ở gốc repo là luật cho AI làm việc ngay trong repo này (Codex tự nạp, `CLAUDE.md` trỏ tới nó).

```text
profile/      Về thien: AI đọc ở mọi project
templates/    File mẫu, chép vào repo của từng project
skills/       Skill tải lên tài khoản Claude
life/         Tên đã thống nhất và danh sách repo theo quy trình chung
learning/     Hồ sơ và trạng thái từng môn thien đang học cùng AI
artifacts/    Mẫu artifact thien đã thích, dùng lại ở mọi project và tài khoản
slides/       Bộ quy tắc làm slide và khung slide web dùng lại
docs/         Tiến độ và kế hoạch đang chạy của chính repo này
```

| Thư mục | File | Dùng để |
|---|---|---|
| `profile/` | `PROFILE.md` | Hồ sơ của thien: cách làm việc, cách ra quyết định với AI, ngôn ngữ, gu UI, trình độ. Gu UI chi tiết ở repo [thienui](https://github.com/thiengthb/thienui), file `docs/taste.md` |
| | `SKILL-LEVEL.md` | Trình độ từng kỹ năng và cách AI dựa vào đó |
| | `RESEARCH.md` | 5 quy tắc khi AI tra cứu trên mạng, để không trích nguồn bịa hay nguồn chưa đọc, và bảng chọn công cụ |
| | `VOICE.md` | Giọng văn tiếng Việt, câu mẫu, từ thien đã chê, và cách AI phản biện thien |
| | `GUIDES.md` | Cách viết hướng dẫn cài đặt và hướng dẫn test tay: link, vị trí nút, form điền sẵn, kết quả cần thấy, dữ liệu test |
| | `PLANNING.md` | Cách AI viết kế hoạch gửi thien duyệt, rồi ghi và cập nhật kế hoạch trong repo |
| | `SETUP.md` | Chuẩn setup chung cho mọi nick và project Claude, có số phiên bản; AI tự kiểm đầu phiên và nhắc khi thiếu |
| | `HANDOFF.md` | Sổ bàn giao giữa các nick Claude: ghi việc dở sau mỗi bước, nick khác nghe "tiếp tục" là làm tiếp |
| | `REVIEW.md` | Cách review PR bằng Claude: agent mới review trong phiên trước khi PR sẵn sàng, mục `## Review` trong mô tả PR (CI báo đỏ nếu thiếu), `@claude` khi cần mắt độc lập |
| | `TUTOR.md` | Cách AI dạy thien ở mọi môn: thử trước, giải thích sau, ghi nhật ký; đứng đúng vai khi làm việc |
| `templates/` | `AGENTS.template.md` | Mẫu `AGENTS.md` cho mỗi project, đọc được bởi Claude, Codex, Gemini. Mỗi project có thêm `CLAUDE.md` chỉ một dòng `@AGENTS.md` |
| | `STATUS.template.md` | Mẫu `docs/STATUS.md`: project đang ở đâu, việc tiếp theo, đang chờ ai |
| | `check-review.mjs` | Script báo đỏ PR đã sẵn sàng mà mô tả thiếu mục `## Review` (`profile/REVIEW.md`). Chép vào `scripts/` của project, chạy bằng một workflow riêng như `.github/workflows/review-check.yml` |
| | `check-status.mjs` | Script kiểm `docs/STATUS.md` tối đa 40 dòng và tối đa 3 việc chờ thien. Chép vào `scripts/` của project, chạy trong CI |
| | `PLAN.template.md` | Mẫu ghi kế hoạch đã duyệt vào `docs/plans/`: đang ở đâu, checkpoint có tick, bước đã đổi, lỗi gặp. Luật ở `profile/PLANNING.md` |
| | `progress-page.mjs` | Sinh trang tiến độ (một repo, hoặc tổng quan nhiều repo) và trang lộ trình học, để AI đăng thành artifact |
| | `publish-progress.mjs` | Một lệnh dựng lại trang tổng quan, tiến độ repo hay lộ trình học, ghi `publish.json` để đăng đè trang cũ |
| | `DECISION.template.md` | Mẫu ghi quyết định khó sửa lại, trong `docs/decisions/` |
| | `SETUP-GUIDE.template.md` | Mẫu hướng dẫn cài đặt theo `profile/GUIDES.md` |
| | `MANUAL-TEST.template.md` | Mẫu hướng dẫn test tay: chuẩn bị, tài khoản test, ca test có mã, bảng kết quả. Chép vào `docs/manual-test/` |
| | `test-accounts.template.csv` | Mẫu danh sách tài khoản test, chỉ mật khẩu giả |
| | `AI-LOG.template.md` | Mẫu nhật ký dùng AI cho đồ án, môn học, project nhóm, trong `docs/ai-log.md` |
| `.github/` | `workflows/test.yml` | Chạy test của script đồng bộ, script kiểm STATUS và kế hoạch, và script sinh trang tiến độ ở mỗi PR, để lỗi bị chặn trước khi merge |
| | `workflows/sync-agents-md.yml` | Mẫu `AGENTS.md` đổi thì tự mở PR vào từng repo trong `life/tracked-repos.md` để cập nhật phần chung, giữ nguyên phần riêng của project. Cần secret `SYNC_TOKEN` |
| `skills/` | `start-project/` | Skill hỏi thien có áp quy trình không, rồi chép các file mẫu vào project. `SKILL.md` chỉ trỏ tới `STEPS.md`; sửa các bước thì sửa `STEPS.md` |
| | `make-slides/` | Skill làm slide: tóm tắt bài, dàn ý, dựng, kiểm, tập dượt, đăng. `SKILL.md` chỉ trỏ tới `STEPS.md` |
| `slides/` | `RULES.md` | Bộ quy tắc làm slide (S1 đến S48), đọc trước mọi bài thuyết trình |
| | `BRIEF.template.md`, `starter/` | Mẫu tóm tắt bài và khung slide web có máy kiểm tra, chép vào project. Xem `slides/README.md` |
| `learning/` | `codex.md` | Học ở Codex hay công cụ khác khi hết quota Claude: chỗ nào khác, đưa trang và lấy kết quả thế nào, ghi lại ra sao |
| | `README.md` | Vòng xoay nhiều môn: buổi tới học môn gì, khung một buổi, cách bắt đầu môn mới, mốc kiểm tra. thien nhắn "học" thì AI đọc file này trước |
| | `roadmap.md` | Lộ trình học từng môn: các chặng từ người mới đến khá, đã học tới đâu, bài đã học, nguồn học, lộ trình đã đổi |
| | `cards.md` | Thẻ ôn của mọi môn, hỏi 3 thẻ đến hạn ở đầu mỗi buổi |
| | `frontend.md` | Đang học frontend tới đâu, buổi tiếp theo dạy gì, để tài khoản khác dạy tiếp |
| | `glossary.md` | Bảng tra thuật ngữ tiếng Anh, AI thêm khi dùng từ thien chưa học |
| `artifacts/` | `README.md` | Danh sách mẫu artifact thien thích và khi nào dùng; mỗi mẫu là một file HTML |
| `life/` | `names.md` | Tên token, project, biến đã thống nhất, để AI dùng lại mà không hỏi lại thien |
| | `tracked-repos.md` | Danh sách repo đã áp quy trình chung, để Action đồng bộ `AGENTS.md` |

File mẫu giữ đuôi `.template.md` để không bị nhầm thành luật thật: Codex và Claude Code tự nạp file tên `AGENTS.md` hoặc `CLAUDE.md` khi làm việc trong thư mục chứa nó.

## Cài cho một tài khoản Claude (làm một lần cho mỗi tài khoản)

Chuẩn setup cho nick và cho từng project (project instructions, repo phải gắn, skill) nằm ở [`profile/SETUP.md`](profile/SETUP.md), có số phiên bản. AI tự kiểm theo chuẩn đó ở đầu mỗi phiên và nhắc khi thiếu hay cũ, nên các nick tự đồng bộ dần mà thien không phải nhớ đã sửa ở nick nào. Các bước dưới đây là phần cho cả nick.

1. (Cho chat thường, ngoài project; phiên trong project không đọc ô này) Settings > Your Claude, dán vào ô hướng dẫn cho Claude:
   ```text
   Mình là thien. Quy trình làm việc chung của mình ở repo github.com/thiengthb/thienai-workflow.
   Khi bắt đầu project mới, dùng skill start-project: hỏi mình trước, mình đồng ý mới áp.
   Trả lời bằng tiếng Việt tự nhiên, không tự chế từ, không dịch sát chữ từ tiếng Anh.
   Khi mình giao việc mới, trước khi làm hãy nhắc mình các việc còn dở (thread chưa xong, PR còn mở, câu hỏi chờ mình) kèm mức quan trọng, rồi hỏi có giải quyết trước không.
   Khi mình nói "tiếp tục": làm theo profile/HANDOFF.md của repo thienai-workflow (đọc sổ bàn giao ở nhánh handoff của các repo) và làm tiếp việc dở, kể cả việc nick khác đang làm.
   ```
   Dòng thứ tư là bản ngắn của mục "Nhắc việc dở" trong `profile/PROFILE.md`; dòng cuối là luật bàn giao giữa các nick (`profile/HANDOFF.md`). Trong project thì luật nằm ở project instructions theo `profile/SETUP.md`.
2. Nối GitHub cho tài khoản đó (Settings > Connectors > GitHub), cho phép các repo `thienai-workflow`, `sakubun`, `tiktok`. Repo này để riêng tư, nên không nối thì skill không đọc được các bước.
3. Bật "Code execution and file creation" (Settings), rồi vào Customize > Skills, tải lên từng file zip: [start-project.zip](https://github.com/thiengthb/thienai-workflow/releases/download/skills/start-project.zip), [make-slides.zip](https://github.com/thiengthb/thienai-workflow/releases/download/skills/make-slides.zip). Link mở được khi trình duyệt đang đăng nhập GitHub của thien. Các file này nằm ở release [`skills`](https://github.com/thiengthb/thienai-workflow/releases/tag/skills), do Action `Skill zips` tự đóng gói lại mỗi khi một skill đổi trên main, nên link luôn trỏ tới bản mới nhất.
4. Mỗi project: gắn repo và dán project instructions theo `profile/SETUP.md`. Quên thì phiên đầu tiên trong project đó sẽ nhắc.

Codex và Gemini đọc luật qua file trong repo của project, không cần skill:
- Codex tự đọc `AGENTS.md`.
- Gemini: thien hiện chỉ dùng bản web miễn phí để hỏi, nên không đọc được luật trong repo. Nếu sau này dùng Gemini CLI (bản miễn phí cho cá nhân đã ngừng từ 2026-06-18): CLI mặc định chỉ đọc `GEMINI.md`. Muốn nó đọc `AGENTS.md` thì thêm `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` vào `.gemini/settings.json` của repo project.
- Link trong `AGENTS.md` trỏ về repo này chỉ mở được nếu công cụ đó đã nối với tài khoản GitHub của thien, vì repo để riêng tư.

## Sửa quy trình

Chỉ qua PR vào repo này, thien duyệt. Mỗi milestone AI đề xuất tối đa 3 thay đổi. `profile/PROFILE.md` và phần chung của `templates/AGENTS.template.md` mỗi file dưới 60 dòng: thêm một ý thì bỏ hoặc gộp một ý khác. Các bước của skill nằm ở `skills/start-project/STEPS.md` và được đọc từ repo mỗi lần chạy, nên sửa file đó là đủ. Chỉ khi sửa một file nằm trong zip (mọi file trong `skills/<tên>/` trừ `STEPS.md`) mới phải tải lại file zip (link ở bước 3 phần trên) lên từng tài khoản. Thêm skill mới thì chỉ cần tạo thư mục `skills/<tên>/` có `SKILL.md` (dòng `name:` trùng tên thư mục và dòng `description:` có nội dung); Action tự tạo `<tên>.zip`.
