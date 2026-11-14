# Chuẩn setup cho mọi nick và project Claude

Phiên bản chuẩn: **1**

thien dùng 3 nick Claude, nick nào cũng có các project giống nhau (project "Claude" gắn repo thienai-workflow, project "sakubun" gắn repo sakubun), cộng vài project riêng. Setting của nick và của project không tự đồng bộ giữa các nick: mỗi nick, mỗi project phải được cài tay. File này là chuẩn chung, và AI tự kiểm theo nó ở đầu mỗi phiên, nên đổi chuẩn ở đây một lần là mọi nick tự nhắc thien cập nhật ở lần mở tiếp theo.

## AI kiểm gì, lúc nào
- Đầu phiên đầu tiên của một thread, trước khi làm việc thien giao. Chạy:
  `node templates/setup-check.mjs --project "<tên project>" --instructions <file chứa project instructions thấy được, none nếu project không có, unseen nếu phiên không thấy> --repos <các repo đang gắn, cách nhau bằng dấu phẩy> --skills <các skill thấy được> --sync "<bộ lọc đồng bộ, dạng đường-dẫn:include, cách nhau bằng dấu phẩy>"`
- Lấy số liệu từ công cụ, không đoán: instructions và bộ lọc đồng bộ đọc bằng công cụ Projects (`project_info`) nếu phiên có; không có thì `--instructions unseen` và bỏ `--sync`, lệnh sẽ ghi là "chưa kiểm" chứ không báo thiếu. Lệnh so từng dòng của đoạn instructions, không chỉ số `vN`.
- Thiếu gì thì nói với thien **trước khi làm việc**, kèm đúng đoạn cần dán và chỗ bấm. thien làm xong (hay nói "bỏ qua") thì làm tiếp. Đủ rồi thì không nói gì.
- Project chưa có trong bảng dưới: hỏi thien có thêm vào chuẩn không (qua PR sửa bảng này).

## Thứ AI thấy được và không thấy được
| Thứ | AI kiểm được không |
|---|---|
| Project instructions của project đang mở | Được: AI đọc được, so số phiên bản với dòng "Phiên bản chuẩn" ở trên |
| Repo đang gắn vào project | Được |
| Quyền đọc các repo trên GitHub | Được (lệnh kiểm thử đọc từng repo) |
| Skill đã tải lên nick | Được: skill hiện trong danh sách skill của phiên |
| Ô hướng dẫn ở Settings > Your Claude | **Không**: phiên trong project không thấy ô này. Vì vậy mọi luật quan trọng nằm ở project instructions và AGENTS.md, không chỉ ở ô này |
| Đang ở nick nào | **Không**. Mỗi project tự kiểm chính nó, nên không cần biết |

## Một lần cho mỗi nick
1. Nối GitHub: Settings > Connectors > GitHub, cho phép các repo `thienai-workflow`, `sakubun`, `tiktok`.
2. Skill: Settings bật "Code execution and file creation", rồi Customize > Skills tải lên từng file zip, tải ở [start-project.zip](https://github.com/thiengthb/thienai-workflow/releases/download/skills/start-project.zip) và [make-slides.zip](https://github.com/thiengthb/thienai-workflow/releases/download/skills/make-slides.zip). Link luôn là bản mới nhất, xem README bước 3.
3. (Chỉ cho chat thường, ngoài project) Settings > Your Claude: đoạn ở README, mục "Cài cho một tài khoản Claude".

## Mỗi project, ở mỗi nick
| Project | Repo phải gắn |
|---|---|
| `Claude` | `thiengthb/thienai-workflow` |
| `sakubun` | `thiengthb/sakubun`, `thiengthb/thienai-workflow` |

Gắn repo: mở project > Project settings > Repositories > thêm từng repo trong bảng.

Project instructions: Project settings > Instructions, xoá bản cũ rồi dán đoạn dưới, thay `<tên project>` bằng tên ở cột đầu bảng trên:

```text
chuẩn setup v1 · project: <tên project>
Mình là thien. Repo là nguồn sự thật duy nhất. Mình có 3 nick Claude dùng chung các repo, nhưng không dùng chung chat, thread hay memory, nên chuyện gì quan trọng đều phải ghi vào repo.
Đầu mỗi phiên: đọc AGENTS.md của repo project, rồi kiểm setup theo profile/SETUP.md của repo thienai-workflow. Thiếu gì thì nhắc mình làm trước, kèm đoạn cần dán và chỗ bấm.
Khi mình nói "tiếp tục": làm theo profile/HANDOFF.md của repo thienai-workflow.
Khi mình giao việc mới: nhắc việc còn dở trước, theo mục "Nhắc việc dở" trong profile/PROFILE.md.
Trả lời bằng tiếng Việt tự nhiên.
```

## Đồng bộ repo vào knowledge
Project settings > GitHub (nút đồng bộ repo vào knowledge của project): chỉ tích phần chữ mà AI cần đọc. Ngày 2026-11-14 project `Claude` đồng bộ cả repo, đã dùng khoảng 69% dung lượng knowledge (1,39 triệu trên 2 triệu), phần lớn là trang HTML, JSON trận đánh, font và script. Knowledge to quá thì Claude phải tìm từng đoạn (RAG) thay vì đọc hết, dễ sót luật. Các phần dưới chỉ khoảng 12% repo; phần còn lại AI đọc bằng lệnh khi cần (`profile/MAP.md`, tầng 3).

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

Repo khác (sakubun) cũng vậy: tích tài liệu và luật, bỏ ảnh, build, dữ liệu. Sau khi merge PR đổi luật, bấm đồng bộ lại để knowledge có bản mới; trong lúc chưa đồng bộ, đọc file trong repo (connector GitHub hay clone) chứ không tin knowledge.

## Đổi chuẩn
- Đổi đoạn project instructions: sửa qua PR, **tăng số "Phiên bản chuẩn"** và số `vN` trong đoạn đó cùng lúc (test trong CI kiểm hai số khớp nhau). Đổi phần khác (bảng repo, mục đồng bộ knowledge) thì không tăng số, để thien không phải dán lại instructions y hệt ở mọi nick; `setup-check.mjs` vẫn kiểm các phần đó mỗi phiên.
- Không cần nhớ đã sửa ở nick nào: ở mỗi nick, phiên đầu tiên sau khi merge sẽ thấy project instructions còn số cũ và nhắc thien dán bản mới.

## Lịch sử
- 2026-11-14, vẫn v1: thêm mục "Đồng bộ repo vào knowledge"; `setup-check.mjs` so từng dòng instructions và có `--instructions unseen`, `--sync`.
- v1 (2026-11-14): chuẩn đầu tiên có kiểm tự động. Thêm luật "tiếp tục" (sổ bàn giao) và repo thienai-workflow cho project sakubun.
