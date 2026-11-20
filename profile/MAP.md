# Đọc gì cho việc gì

Bản đồ để AI chỉ đọc file cần cho việc đang làm, không mở cả `profile/` cho mọi câu hỏi. File này không đặt luật mới: mỗi dòng trỏ tới chỗ luật đã nằm. Hai chỗ nói khác nhau thì báo thien để sửa một bên, đừng tự chọn im lặng. Đường dẫn là của repo thienai-workflow, trừ chỗ ghi "(repo project)".

## Tầng 1: mọi phiên
- Project instructions (đã có sẵn trong phiên), `AGENTS.md` và `docs/STATUS.md` (repo project).
- Phiên đầu của thread: chạy `templates/start-session.mjs` (cách gọi ở project instructions và mục "AI kiểm gì, lúc nào" của SETUP.md). Lệnh in kết quả kiểm setup, `AGENTS.md`, sổ bàn giao, phần cần của STATUS, nhánh chưa merge và luật đổi chat (lệnh tự trích từ CHATS.md, khoảng 2 KB), nên không phải mở từng file. Setup báo thiếu thì lệnh in sẵn đoạn cần dán.
- Câu hỏi trả lời xong trong một lượt (giải thích, tra một chỗ): dừng ở đây, cộng mục "Ngôn ngữ" của `profile/PROFILE.md` và `profile/VOICE.md` khi viết cho thien.

## Tầng 2: theo việc
| thien nói hay việc là | Đọc | Chạy | Ghi khi xong |
|---|---|---|---|
| Giao việc mới | `profile/PROFILE.md` mục "Nhắc việc dở" | phần sổ bàn giao và nhánh chưa merge đã in bởi `templates/start-session.mjs` (chạy lại nếu đã lâu), danh sách PR | (chưa ghi gì tới khi thien chọn) |
| thien chê, khen, chọn, sửa câu (góp ý) | bảng "Góp ý của thien đi đâu" dưới | `artifacts/lesson/after-lesson.mjs` (sau buổi học in sẵn câu gu và kiểm từ mới) | file đích theo bảng, trong PR của việc đang làm |
| Merge PR, xoá nhánh, việc AI được tự làm | `profile/DELEGATION.md` | | dòng `Tự merge theo profile/DELEGATION.md` trong mô tả PR |
| Xong mục tiêu của chat, hay việc lớn mới trong chat đã xong mục tiêu | `profile/CHATS.md` | skill `explain-usage` chỉ khi có kế hoạch đang đo | một dòng `docs/usage-log.md` khi có đo |
| "tiếp tục" | `profile/HANDOFF.md`, `profile/ACCOUNTS.md` khi việc do nick khác ghi | `templates/start-session.mjs --claim` (đọc sổ, nhận việc, so nhánh) | sổ bàn giao ở các mốc khó khôi phục |
| "học" | gói buổi in bởi `artifacts/lesson/prepare-lesson.mjs` (buổi kế tiếp, khung một buổi, hồ sơ môn, 3 thẻ đến hạn, nhánh mở), `profile/TUTOR.md`, `artifacts/lesson/README.md` | `artifacts/lesson/prepare-lesson.mjs`, `artifacts/lesson/make-lesson.mjs`, `artifacts/review/make-review.mjs` | mục "Sau buổi" của `learning/README.md` (`after-lesson.mjs`), rồi PR |
| Dạy hay giải thích để thien học | `profile/TUTOR.md`, `skills/viet-de-hieu/SKILL.md` (10 quy tắc viết dễ hiểu) | | |
| "mở lại bài …" (xem lại bài đăng ở nick khác) | `learning/reopen.md` | `artifacts/lesson/make-lesson.mjs --no-check` | không ghi gì |
| Duyệt giao diện, chọn phương án có hình | `artifacts/README.md` rồi README của đúng mẫu: `artifacts/compare/README.md` hay `artifacts/decide/README.md` | `artifacts/compare/make-round.mjs`, `artifacts/decide/make-decision.mjs` | kết quả nguyên văn vào PR hay kế hoạch |
| Quyết định khó sửa lại | mục "Ai quyết" trong `templates/AGENTS.template.md`, `templates/DECISION.template.md` | `artifacts/decide/make-decision.mjs` nếu có hình | `docs/decisions/` (repo project) |
| Lập hay theo dõi kế hoạch | `profile/PLANNING.md`, `templates/PLAN.template.md` | `templates/publish-progress.mjs` | `docs/plans/` và STATUS (repo project) |
| Hướng dẫn cài đặt, test tay | `profile/GUIDES.md`, `life/names.md` | | `docs/manual-test/` (repo project) |
| Tra cứu trên mạng | `profile/RESEARCH.md` | | |
| Slide, thuyết trình | `slides/RULES.md`, `skills/make-slides/STEPS.md` | `slides/starter/check.mjs` | |
| Project mới, xem lại quy trình | `skills/start-project/STEPS.md` | | |
| Sửa chính repo thienai-workflow | `AGENTS.md` mục "Sửa repo", `README.md` mục "Sửa quy trình" | test như `.github/workflows/test.yml`, `.github/scripts/check-links.mjs` | PR, STATUS |

## Tầng 3: chỉ mở khi cần
- Theo nhu cầu: `learning/teaching/README.md` (chọn kiểu bài), `learning/roadmap.md` (khi tick chặng), `learning/glossary.md`, `learning/usage.md`, `profile/SKILL-LEVEL.md` (khi chọn độ khó), các quyết định cũ trong `docs/decisions/`.
- Không đọc cả file, dùng lệnh thay: trang học `learning/*/pages/*.html` (nguồn 15–40 KB, trang cũ trước 2026-11-14 tới vài trăm KB; `make-lesson.mjs`, `after-lesson.mjs` đọc giúp), dữ liệu trận `learning/war/battles/*.json`, `templates/progress-page.mjs`, `artifacts/*/*.js`. Cần một chỗ thì tìm (`grep`) rồi đọc đúng đoạn đó.

## Một việc đi qua những đâu
| Luồng | Bắt đầu | Công cụ | Đầu ra | Cập nhật |
|---|---|---|---|---|
| Buổi học | gói buổi của `artifacts/lesson/prepare-lesson.mjs` | `artifacts/lesson/make-lesson.mjs` → Artifact | trang học, `sessions/` trong db trang | `artifacts/lesson/after-lesson.mjs --write`, nhật ký môn, `cards.md`, `roadmap.md`, "Trạng thái", PR; `--check <id>` ra toàn ✓ |
| Ôn thẻ | `learning/cards.md` | `artifacts/review/make-review.mjs` → link cố định | kết quả trong db trang | `artifacts/review/apply-review.mjs`, `usage.md` |
| Đổi nick giữa chừng | sổ ở nhánh `handoff` | `templates/handoff.mjs` | file `tasks/<việc>.md` | sổ ở các mốc, `done` khi PR merge |
| Setup nick và project | `profile/SETUP.md`, sổ nick `profile/ACCOUNTS.md` | `templates/setup-check.mjs` | danh sách việc thien bấm | `SETUP.md` qua PR khi đổi chuẩn |
| Luật chung tới project khác | `templates/AGENTS.template.md` | Action `.github/workflows/sync-agents-md.yml` | PR vào từng repo trong `life/tracked-repos.md` | thien merge ở từng repo |
| Trang tiến độ | `docs/STATUS.md`, `docs/plans/`, mục "Mở nhanh" của `README.md` | `templates/publish-progress.mjs` | `publish.json` | đăng đè link cũ |

## Góp ý của thien đi đâu
| thien nói về | File đích | Khi nào ghi |
|---|---|---|
| Gu giao diện | `learning/frontend/taste-queue.md`, 2 tuần một PR vào thienui `docs/taste.md` mục "Đang thử" | sau buổi frontend, hay lúc thien chọn bố cục |
| Câu chữ, từ đã chê, câu mẫu | `profile/VOICE.md` | ngay khi thien sửa câu của AI |
| Từ tiếng Anh chưa học | `learning/glossary.md` | lần đầu dùng; sau buổi học kiểm bằng `after-lesson --check` |
| Lỗi trang học | mục "Chưa làm" của `artifacts/it/README.md` (bài frontend, BA); môn khác ghi vào "Buổi tiếp theo" của `learning/<môn>.md` | trong PR sau buổi |
| Nhịp học, độ dài, kiểu buổi | `learning/<môn>.md` mục "Buổi tiếp theo", `learning/README.md` | sau buổi |
| AI làm sai | bảng "Lỗi gặp" của kế hoạch đang chạy, không chèn thêm vào luật | ngay khi gặp |

## Giữ bản đồ này đúng
- Thêm, đổi tên hay bỏ một file luật, mẫu hay lệnh: sửa bảng ở đây trong cùng PR. CI chạy `.github/scripts/check-links.mjs`, đường dẫn trong file này sai là CI đỏ.
- Nhắm dưới 60 dòng; chi tiết nằm ở file được trỏ tới, không chép vào đây, không nối dài câu cho đủ số dòng.
- `.github/scripts/reading-cost.mjs` đọc bảng ở đây và in mỗi việc phải đọc bao nhiêu KB (tầng 1 cộng cột "Đọc"; lệnh `.mjs` ở cột "Đọc" là thứ AI đọc phần in ra, đo bằng `--reading-cost` của lệnh đó). CI đỏ khi một việc quá 120 KB: lúc đó tách file nặng nhất hay chuyển phần lịch sử (nhật ký cũ) ra file riêng, đừng nâng ngân sách.
