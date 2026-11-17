# Chuẩn setup cho mọi nick và project Claude

Phiên bản chuẩn: **5**

thien dùng 3 nick Claude (tên ngắn và việc của từng nick ở [`ACCOUNTS.md`](ACCOUNTS.md)), nick nào cũng có các project giống nhau (project "Claude" gắn repo thienai-workflow, project "sakubun" gắn repo sakubun), cộng vài project riêng. Setting của nick và của project không tự đồng bộ giữa các nick: mỗi nick, mỗi project phải được cài tay. File này là chuẩn chung, và AI tự kiểm theo nó ở đầu mỗi phiên, nên đổi chuẩn ở đây một lần là mọi nick tự nhắc thien cập nhật ở lần mở tiếp theo.

## Hai kiểu project
Claude có hai kiểu project, mỗi nick chỉ có một kiểu (bảng ở [`ACCOUNTS.md`](ACCOUNTS.md), mục "Kiểu project ở từng nick"), nên chuẩn này có hai đoạn instructions:
- **Bản beta** (một chat điều phối mở nhiều thread): mỗi thread là một phiên Claude Code trên cloud, repo của project đã được clone sẵn, `CLAUDE.md` (dòng `@AGENTS.md`) tự nạp `AGENTS.md`, project instructions và project memory tự tới mọi thread mới. Không có công cụ `project_info`, không có knowledge đồng bộ, không chạy hook trong `.claude/settings.json` ([tài liệu Claude Projects](https://code.claude.com/docs/en/claude-projects), đọc 2026-11-17).
- **Bản cũ** (mỗi chat riêng): repo đồng bộ vào knowledge, AI clone repo bằng lệnh, đọc instructions và bộ lọc đồng bộ bằng `project_info`.

## Chuẩn này tới mọi project bằng cách nào
- Project đã setup (có instructions, gắn repo): `AGENTS.md` tự được nạp và có luật kiểm setup. Đổi chuẩn ở file này là phiên sau tự nhắc. Repo trong `life/tracked-repos.md` nhận `AGENTS.md` mới qua Action đồng bộ.
- Project chưa setup (quên gắn repo, chưa dán instructions, kể cả project cũ): `AGENTS.md` không được đọc, nên skill `start-project` (đã tải lên mỗi nick, có mặt ở mọi project của nick) là cổng bắt nó. Không có API để tự đẩy instructions vào project trên claude.ai, nên dán instructions và gắn repo vẫn là thien làm tay; AI chỉ nhắc đúng chỗ.

## AI kiểm gì, lúc nào
- Đầu phiên đầu tiên của một thread, trước khi làm việc thien giao, bằng `node templates/start-session.mjs` (cùng tham số dưới, thêm `--claim` khi thien nói "tiếp tục"): một lệnh chạy kiểm setup, sổ bàn giao, STATUS và nhánh chưa merge (bản cũ in cả AGENTS.md), nên khởi động chỉ tốn 3 lượt ở bản cũ (kế hoạch `docs/plans/2026-11-15-claude-usage.md`, chat đo ngày 2026-11-15 tốn 12 lượt khi làm từng bước). Bản beta thêm `--beta`: không in lại AGENTS.md (đã tự nạp), không kiểm knowledge. Chỉ kiểm setup thì chạy:
  `node templates/setup-check.mjs --project "<tên project>" --instructions <file chứa project instructions thấy được, none nếu project không có, unseen nếu phiên không thấy> --repos <các repo đang gắn, cách nhau bằng dấu phẩy> --skills <các skill thấy được, dạng tên@số bản> [--beta] [--sync "<bộ lọc đồng bộ, dạng đường-dẫn:include, cách nhau bằng dấu phẩy>"]`
- Lấy số liệu từ công cụ, không đoán. Bản beta: instructions nằm sẵn trong phiên (khối project instructions ở đầu cuộc trò chuyện); không thấy thì `--instructions unseen`. Bản cũ: instructions và bộ lọc đồng bộ đọc bằng công cụ Projects (`project_info`); không có thì `--instructions unseen` và bỏ `--sync`. Lệnh ghi phần không thấy là "chưa kiểm" chứ không báo thiếu, và so từng dòng của đoạn instructions, không chỉ số `vN`.
- Số bản của skill là `(bản N)` ở cuối phần mô tả skill trong danh sách skill của phiên. Không có số thì ghi tên trơn: lệnh coi đó là bản cũ.
- Project chưa có instructions, chưa gắn repo vẫn phải kiểm: gắn repo thienai-workflow vào phiên rồi chạy. Lỗi đã gặp 2026-11-14: project "Claude" ở nick tnt024 chưa có instructions và chưa gắn repo, nên luật kiểm (nằm trong instructions và AGENTS.md) không bao giờ chạy, AI không nhắc gì cả.
- Tin mở đầu khi muốn làm tiếp ở bản cũ: "tiếp tục, gắn repo thienai-workflow quyền ghi" (có tên repo và quyền). Chỉ "tiếp tục" thì lần gắn repo đầu hay bị bộ duyệt quyền chặn, tốn thêm 1–2 lượt; tin có tên repo đã qua ngay lần đầu một lần, chưa đủ để chắc lần nào cũng qua (chat 2026-11-17 00:42, nick tnt697; xem "Lỗi gặp" trong `docs/plans/2026-11-15-claude-usage.md`).
- Từ v5, lần gắn đầu ở bản cũ mà bị chặn thì AI hỏi ngay bằng câu hỏi có nút bấm, chờ thien cho phép rồi gắn lại trong cùng lượt; không thử clone hay tìm qua Project, không dừng để báo lỗi (thien chê cách dừng rồi báo lỗi ở chat BA 5, 2026-11-17: hai lần thien nói rõ việc gắn thì đều qua).
- Dòng `nhắc: AI tự làm: ...` là việc của AI (thêm dòng vào sổ nick), không phải việc của thien.
- Thiếu gì thì nói với thien **trước khi làm việc**, kèm đúng đoạn cần dán và chỗ bấm. thien làm xong (hay nói "bỏ qua") thì làm tiếp. Đủ rồi thì không nói gì.
- Project chưa có trong bảng dưới: hỏi thien có thêm vào chuẩn không (qua PR sửa bảng này).

## Thứ AI thấy được và không thấy được
| Thứ | AI kiểm được không |
|---|---|
| Project instructions của project đang mở | Được: bản beta có sẵn trong phiên, bản cũ đọc bằng `project_info`; so số phiên bản với dòng "Phiên bản chuẩn" ở trên |
| Repo đang gắn vào project | Được |
| Quyền đọc các repo trên GitHub | Được (lệnh kiểm thử đọc từng repo) |
| Skill đã tải lên nick, và bản nào | Được: skill hiện trong danh sách skill của phiên, số `(bản N)` ở cuối mô tả so với `skills/<tên>/SKILL.md` |
| Ô hướng dẫn ở Settings > Your Claude | **Không**: phiên trong project không thấy ô này. Vì vậy mọi luật quan trọng nằm ở project instructions và AGENTS.md, không chỉ ở ô này |
| Đang ở nick nào | Chỉ qua chữ `nick: tntXXX` ở dòng đầu project instructions. AI không tự biết, nên mỗi nick phải ghi đúng tên của mình |

## Một lần cho mỗi nick
1. Nối GitHub: Settings > Connectors > GitHub, cho phép các repo `thienai-workflow`, `sakubun`, `tiktok`, `thienui`. thienui là repo riêng tư (từ 2026-11-14), nên thiếu bước này thì AI không đọc được gu giao diện. Kiểm cả ở https://github.com/settings/installations > **Claude** > **Configure**: mục **Repository access** phải có `thienui` (hoặc chọn **All repositories**).
2. Skill: Settings bật "Code execution and file creation", rồi Customize > Skills tải lên từng file zip, tải ở [start-project.zip](https://github.com/thiengthb/thienai-workflow/releases/download/skills/start-project.zip) và [make-slides.zip](https://github.com/thiengthb/thienai-workflow/releases/download/skills/make-slides.zip). Link luôn là bản mới nhất, xem README bước 3.
3. (Chỉ cho chat thường, ngoài project) Settings > Your Claude: đoạn ở README, mục "Cài cho một tài khoản Claude".

## Mỗi project, ở mỗi nick
| Project | Repo phải gắn |
|---|---|
| `Claude` | `thiengthb/thienai-workflow` |
| `sakubun` | `thiengthb/sakubun`, `thiengthb/thienai-workflow` |

Gắn repo:
- Bản beta: Project settings > Environment > thêm từng repo trong bảng (hay nhờ Claude trong chat điều phối thêm repo vào project).
- Bản cũ: mở trang project trên [claude.ai/projects](https://claude.ai/projects), ở ô **Project knowledge** (cột phải) bấm **+** > **GitHub** (hay **Add from GitHub**), dán link repo, tích file theo mục "Đồng bộ repo vào knowledge" dưới đây, rồi bấm **Add**. Làm lại cho từng repo trong bảng. Giao diện nào có sẵn **Project settings > Repositories** thì thêm repo ở đó cũng được.

Project instructions: xoá bản cũ rồi dán đúng đoạn của kiểu project, thay `<tên project>` bằng tên ở cột đầu bảng trên và `<tên nick>` bằng tên nick đang dùng trong [`ACCOUNTS.md`](ACCOUNTS.md) (ví dụ `tnt024`). Instructions chỉ tới thread hay chat mở sau lúc dán; thread đang chạy vẫn giữ bản cũ.

Bản beta, dán ở Project settings > Memory > Project instructions:

```text
chuẩn setup v5 beta · project: <tên project> · nick: <tên nick>
Mình là thien. Repo là nguồn sự thật duy nhất. Mình có 3 nick Claude dùng chung các repo, nhưng không dùng chung project, thread hay memory, nên chuyện gì quan trọng đều phải ghi vào repo.
Thread mới: repo của project đã được clone sẵn và AGENTS.md đã tự nạp, nên không clone lại, không tìm project_info. Lượt đầu, trong thư mục repo thienai-workflow, chạy node templates/start-session.mjs --beta --project (tên ở dòng đầu) --instructions "(cả đoạn này)" --repos (các repo của project) --skills (skill@số bản). Lệnh in kết quả kiểm setup, sổ bàn giao, STATUS và nhánh chưa merge. Thiếu setup thì nhắc mình làm trước, kèm đoạn cần dán và chỗ bấm.
Việc dở: chat điều phối nhắc trước khi mở thread, theo mục "Nhắc việc dở" trong profile/PROFILE.md; thread không hỏi lại.
Khi mình nói "tiếp tục": thêm --claim "Claude (nick ở dòng đầu), (link thread)" vào lệnh trên, rồi làm tiếp theo profile/HANDOFF.md.
Mọi commit, PR, sổ bàn giao và link trang đều ghi tên nick ở dòng đầu, theo profile/ACCOUNTS.md.
Trả lời bằng tiếng Việt tự nhiên.
```

Bản cũ, dán ở Project settings > Instructions:

```text
chuẩn setup v5 · project: <tên project> · nick: <tên nick>
Mình là thien. Repo là nguồn sự thật duy nhất. Mình có 3 nick Claude dùng chung các repo, nhưng không dùng chung chat, thread hay memory, nên chuyện gì quan trọng đều phải ghi vào repo.
Đầu mỗi phiên, khởi động trong 3 lượt, không đọc file repo qua công cụ Project (file đồng bộ từ GitHub không đọc theo tên được). Lượt 1: gọi project_info và gắn repo thiengthb/thienai-workflow cùng lúc. Lượt 2: một lệnh Bash clone repo đó (--depth 1) rồi chạy node templates/start-session.mjs --project (tên ở dòng đầu) --instructions "(cả đoạn này)" --repos (các repo đang gắn) --skills (skill@số bản) --sync "(bộ lọc đồng bộ của project_info)". Lượt 3: làm việc.
Gắn repo bị chặn thì không thử cách khác và không kết thúc lượt: hỏi mình ngay bằng câu hỏi có nút bấm (AskUserQuestion) "Cho gắn repo thienai-workflow quyền ghi?", mình bấm cho phép thì gắn lại rồi đi tiếp.
Lệnh đó in kết quả kiểm setup, AGENTS.md, sổ bàn giao, STATUS và nhánh chưa merge. Thiếu setup thì nhắc mình làm trước, kèm đoạn cần dán và chỗ bấm. Khi mình giao việc mới: nhắc việc còn dở trước, theo mục "Nhắc việc dở" trong profile/PROFILE.md, dùng chính phần lệnh đã in.
Khi mình nói "tiếp tục": thêm --claim "Claude (nick ở dòng đầu), (link chat)" vào lệnh ở lượt 2, rồi làm tiếp theo profile/HANDOFF.md.
Mọi commit, PR, sổ bàn giao và link trang đều ghi tên nick ở dòng đầu, theo profile/ACCOUNTS.md.
Trả lời bằng tiếng Việt tự nhiên.
```

## Đồng bộ repo vào knowledge
Chỉ cho bản cũ (bản beta clone repo, không có knowledge đồng bộ). Ô **Project knowledge** ở cột phải trang project: bấm vào repo đã thêm để chọn lại file (nút **Update**), bấm **Sync now** để lấy bản mới. Chỉ tích phần chữ mà AI cần đọc. Ngày 2026-11-14 project `Claude` đồng bộ cả repo, đã dùng khoảng 69% dung lượng knowledge (1,39 triệu trên 2 triệu), phần lớn là trang HTML, JSON trận đánh, font và script. Knowledge to quá thì Claude phải tìm từng đoạn (RAG) thay vì đọc hết, dễ sót luật. Các phần dưới chỉ khoảng 12% repo; phần còn lại AI đọc bằng lệnh khi cần (`profile/MAP.md`, tầng 3).

Tích:
- `AGENTS.md`
- `README.md`
- `profile/`
- `docs/`
- `life/`
- `learning/`
- `artifacts/README.md`
- `artifacts/lesson/README.md`
- `templates/AGENTS.template.md`
- `slides/RULES.md`
- `skills/`

Bỏ tích bên trong `learning/`:
- bỏ `learning/frontend/pages/`
- bỏ `learning/ba/pages/`
- bỏ `learning/war/pages/`
- bỏ `learning/war/battles/`
- bỏ `learning/teaching/patterns.html`

Repo khác (sakubun) cũng vậy: tích tài liệu và luật, bỏ ảnh, build, dữ liệu. Riêng sakubun (2026-11-15: `docs/plans/` nặng 14 MB, gần hết là ảnh PNG trong các thư mục con; file `.md` chỉ khoảng 350 KB): tích `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/`; bên trong `docs/plans/` bỏ tích mọi thư mục con, giữ các file `.md`. Code AI đọc bằng lệnh khi cần. Sau khi merge PR đổi luật, bấm đồng bộ lại để knowledge có bản mới; trong lúc chưa đồng bộ, đọc file trong repo (connector GitHub hay clone) chứ không tin knowledge.

## Đổi chuẩn
- Đổi đoạn project instructions: sửa qua PR, **tăng số "Phiên bản chuẩn"** và số `vN` trong cả hai đoạn cùng lúc (test trong CI kiểm các số khớp nhau). Đổi phần khác (bảng repo, mục đồng bộ knowledge) thì không tăng số, để thien không phải dán lại instructions y hệt ở mọi nick; `setup-check.mjs` vẫn kiểm các phần đó mỗi phiên.
- Không cần nhớ đã sửa ở nick nào: ở mỗi nick, phiên đầu tiên sau khi merge sẽ thấy project instructions còn số cũ và nhắc thien dán bản mới.

## Lịch sử
- v5 (2026-11-17): bản cũ thêm một dòng: gắn repo bị chặn thì hỏi thien ngay bằng câu hỏi có nút bấm, chờ cho phép rồi gắn lại, không dừng để báo lỗi. Bản beta chỉ đổi số (không gắn repo lúc khởi động). Lỗi gặp ở `docs/plans/2026-11-15-claude-usage.md`.
- v4 (2026-11-17): thêm đoạn riêng cho project bản beta (không `project_info`, không clone, `start-session --beta` không in lại AGENTS.md); bản cũ đổi số, nội dung giữ nguyên. Gắn repo ở bản cũ qua ô Project knowledge (lấy lại từ PR #74 đã đóng), thêm danh sách tích cho sakubun. Kế hoạch `docs/plans/2026-11-17-workflow-review.md`.
- v3 (2026-11-15): khởi động 3 lượt bằng `templates/start-session.mjs` (kiểm setup, AGENTS.md, sổ bàn giao, STATUS, nhánh chưa merge trong một lệnh; `--claim` khi "tiếp tục"); không đọc file repo qua công cụ Project.
- 2026-11-14, vẫn v2: thêm mục "Đồng bộ repo vào knowledge"; `setup-check.mjs` so từng dòng instructions và có `--instructions unseen`, `--sync`.
- v2 (2026-11-14): thêm tên nick vào dòng đầu (`nick: tntXXX`) và luật ghi nick vào commit, PR, sổ bàn giao; skill có số bản để biết khi nào phải tải lại; skill `start-project` bắt cả project cũ chưa setup; sổ nick `profile/ACCOUNTS.md`.
- v1 (2026-11-14): chuẩn đầu tiên có kiểm tự động. Thêm luật "tiếp tục" (sổ bàn giao) và repo thienai-workflow cho project sakubun.
