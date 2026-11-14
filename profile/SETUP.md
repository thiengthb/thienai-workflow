# Chuẩn setup cho mọi nick và project Claude

Phiên bản chuẩn: **1**

thien dùng 3 nick Claude, nick nào cũng có các project giống nhau (project "Claude" gắn repo thienai-workflow, project "sakubun" gắn repo sakubun), cộng vài project riêng. Setting của nick và của project không tự đồng bộ giữa các nick: mỗi nick, mỗi project phải được cài tay. File này là chuẩn chung, và AI tự kiểm theo nó ở đầu mỗi phiên, nên đổi chuẩn ở đây một lần là mọi nick tự nhắc thien cập nhật ở lần mở tiếp theo.

## AI kiểm gì, lúc nào
- Đầu phiên đầu tiên của một thread, trước khi làm việc thien giao. Chạy:
  `node templates/setup-check.mjs --project "<tên project>" --instructions <file chứa project instructions thấy được, hoặc none> --repos <các repo đang gắn, cách nhau bằng dấu phẩy> --skills <các skill thấy được>`
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
2. Skill: Settings bật "Code execution and file creation", rồi Customize > Skills tải lên từng file zip, tải ở https://github.com/thiengthb/thienai-workflow/releases/download/skills/<tên skill>.zip (`start-project.zip`, `make-slides.zip`). Link luôn là bản mới nhất, xem README bước 3.
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

## Đổi chuẩn
- Sửa file này qua PR, **tăng số "Phiên bản chuẩn"** và số `vN` trong đoạn instructions cùng lúc (test trong CI kiểm hai số khớp nhau).
- Không cần nhớ đã sửa ở nick nào: ở mỗi nick, phiên đầu tiên sau khi merge sẽ thấy project instructions còn số cũ và nhắc thien dán bản mới.

## Lịch sử
- v1 (2026-11-14): chuẩn đầu tiên có kiểm tự động. Thêm luật "tiếp tục" (sổ bàn giao) và repo thienai-workflow cho project sakubun.
