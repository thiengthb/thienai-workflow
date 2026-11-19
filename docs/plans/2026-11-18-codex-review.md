# KH5 · Sửa theo review của Codex ngày 17/11

Trạng thái: xong (đóng sớm 2026-11-19, thien quyết ở KH8) · Duyệt: 2026-11-18 (thien bấm "Duyệt, bỏ Bảng học tuần" trên thẻ hỏi) · Cập nhật: 2026-11-18 · nick tnt628 · Thread: [Phản biện review Codex và lên kế hoạch](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvRQpMiaEPExtTy4gXkaYnx4n)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đã đóng. Đóng 2026-11-19: buổi xem lại làm sớm ở KH8 trả lời từng ý (câu 1, 3, 6).
- Còn thiếu: không; việc chưa làm ghi "đóng sớm" hay chỗ chuyển tới ngay ở dòng việc đó.
- thien cần làm: không có (PR luật #153, PR mã #154 nằm ở KH8).

## Mục tiêu
Sửa những chỗ review của Codex (commit `721a116`, 17/11) chỉ ra mà kiểm lại thấy đúng, ưu tiên hai lệnh có thể xoá hay ghi đè dữ liệu, mà không thêm luật mới hay script mới trước mốc 01/12.

## Kiểm từng ý
Lúc kiểm (2026-11-18, `git ls-remote`), main là `721a116`, đúng bản Codex review. Bảng dưới ghi trạng thái lúc đó; phần sửa đã vào main ở PR #121. CI `Test` trên commit đó xanh ([lượt chạy](https://github.com/thiengthb/thienai-workflow/actions/runs/44116199219)).

| Ý của Codex | Mình kiểm thấy | Đồng ý? | Làm gì |
|---|---|---|---|
| 2.1 `publish-progress.mjs` xoá thư mục có sẵn | [Đã kiểm, chạy thật] Dựng một thư mục có `repos/sakubun/my-notes.txt` và `index.html` của mình, chạy `publish-progress.mjs overview --out` vào đó: `my-notes.txt` mất, `index.html` bị ghi đè. Chỉ xảy ra khi truyền `--out`; mặc định là `build/` (đã gitignore) nên an toàn. | Đồng ý | Đợt 1 |
| 2.2 Nhánh `chore/sync-agents-md` bị đặt lại bằng `force: true` | [Đã kiểm] Đúng ở dòng 69 của `.github/scripts/sync-agents-md.mjs`. Nhưng mỗi lần đồng bộ dựng lại cả file từ main của repo đích, nên commit bị mất trên nhánh đó chỉ là sửa phần riêng của project, mà phần đó vốn phải sửa ở main. Chưa có lần nào mất việc. Ngày 12/11 ý "kiểm nhánh chỉ có commit của bot" đã bị gạt (review Codex thứ hai). | Một phần | Đợt 1: chỉ thêm một câu vào mô tả PR bot mở: "Nhánh do bot quản lý, đừng đẩy commit lên, lần đồng bộ sau sẽ ghi đè". Không thêm phần kiểm |
| 2.3 `check-open-work.mjs` gọi PR đang conflict là "nhánh cũ" | [Đã kiểm] Dòng 84–85 in "đã đóng hay đang conflict: nhánh cũ, xem PR rồi xoá nhánh nếu không cần"; `start-session.mjs` dòng 58 cũng nói "đã đóng (hay đang conflict)". Phiên cloud không có `gh` đăng nhập, repo riêng tư nên API công khai không đọc được, vậy chỉ sửa được lời báo. | Đồng ý | Đợt 1 |
| 2.4 CI xanh chưa chứng minh main được bảo vệ | [Fact] Repo riêng tư gói Free của GitHub không có bảo vệ nhánh (cần gói Pro hay để công khai; thien chọn riêng tư ngày 12/11). Repo cũng không chỗ nào ghi là CI chặn merge, nên không có câu sai cần sửa. Chưa thấy lần nào AI merge khi CI đỏ. | Một phần | Không sửa giờ. Ghi một dòng vào bảng ủy quyền ở mốc 01/12 (đợt 3) |
| 3.1 Tự merge chưa ổn định, nên đo cho đủ rồi mới sửa luật | [Đã kiểm, đọc mô tả các PR từ #104] PR đủ điều kiện tự merge: #107 (công cụ chặn), #114, #115, #119, #120 (AI tự merge), #117 (AI quên, thien phải nhắn). Bốn trên sáu lần đúng. Kế hoạch [`action-gaps`](2026-11-17-action-gaps.md) mới ghi hai lần trượt, chưa ghi bốn lần đúng. Mọi PR tự merge đều chỉ sửa file trong vùng cho phép. | Đồng ý | Đợt 2 ghi đủ sáu lần; quyết sửa gì ở mốc 01/12 |
| 3.2 Đầu kế hoạch `action-gaps` còn ghi chờ merge PR #110 | [Đã kiểm] Dòng 8, 10, 56 còn ghi chờ; #110 đã merge 17/11. `start-session` chỉ dò chữ "chờ PR" trong STATUS, không dò ở kế hoạch. | Đồng ý | Đợt 2 sửa chữ; đợt 1 cho `start-session` dò cả mục "Đang ở đâu" của kế hoạch (dùng lại hàm có sẵn) |
| 3.3 Lộ trình học có câu cũ | [Đã kiểm] `learning/roadmap.md` dòng 22 "Bắt đầu sau mốc 2026-11-22" mà buổi 10 đã mở chặng 2 ngày 17/11; dòng 96 "khoảng 5 buổi nữa (ý 6, 7, 8, 9, 10)" mà ý 6 đã học, còn 4 ý. Mục "Bài đã học" thiếu trang Chiến tranh 6, 7. | Đồng ý | Đợt 2, rồi đăng lại trang lộ trình |
| 3.4 Link "Bảng học tuần" đã chết | [Đã kiểm] Còn ở `README.md`, `artifacts/README.md`, `artifacts/lesson/README.md`, `learning/README.md`. Đang chờ thien chọn dựng lại hay bỏ. | Đồng ý | Câu hỏi 2, làm ở đợt 2 |
| 3.5 Trang tổng hợp nên ghi lúc dựng và báo "chưa lấy được" | [Đã kiểm] Đã có: đầu trang ghi "Lấy từ repo lúc …, trang không tự cập nhật" (`progress-page.mjs` dòng 699), repo không đọc được ghi "chưa đọc được", PR không lấy được ghi "Không lấy được danh sách PR" (dòng 387). Chỉ thiếu mã commit. | Phần lớn đã có | Không làm thêm |
| 4 Cột "Phút" là thời gian mở trang, không phải thời gian học | [Đã kiểm] `after-lesson.mjs` dòng 231 lấy lúc xong trừ lúc mở; hai dòng 311 và 952 phút trong `learning/usage.md`. Số này đã được dùng để quyết (BA 5 "60 phút" nên BA 6 cần ngắn), dù lần đó có thêm lời thien chê "dài". | Đồng ý | Đợt 2: ghi rõ ý nghĩa cột ở đầu `usage.md`, đánh dấu hai dòng quá 60 phút. Không làm bộ đếm thời gian thật |
| 4 Bảng sáu chỉ số theo mục tiêu | Thêm một bảng báo cáo mới để AI phải nhớ cập nhật, đúng loại luật hay trôi mà kế hoạch `action-gaps` đã thấy. Hai thứ trong đó đáng đo và đo được không cần bảng: số lần thien phải nhắc merge (đọc từ mô tả PR), và nick khác tiếp tục được từ sổ bàn giao không. | Một phần | Đợt 3, gộp vào mốc 01/12 |
| 4 Một chat dùng 1/4 chat khác chưa chứng minh tiết kiệm 75% | `docs/usage-log.md` dòng 8 chỉ ghi "khoảng 1/4 chat đo lần đầu", không ghi là tiết kiệm. | Đúng nguyên tắc, nhưng repo không nói vậy | Không sửa |
| 6 Review theo rủi ro sau 24/11 | Mốc 01/12 đã có việc "review code theo giai đoạn cho các PR sau 24/11" (`action-gaps` checkpoint 3). Ý mới đáng lấy là danh sách vùng soi trước: lệnh xoá hay ghi file, git, token, đồng bộ sang repo khác. | Một phần | Đợt 3 thêm danh sách vùng đó vào việc ở mốc 01/12 |
| 6 Ghim action bằng mã commit, rà chuỗi cung ứng | Đã gạt ngày 12/11 (review Codex thứ nhất): làm quá tay cho repo một người. Không có gì mới. | Không | Không làm |
| 1 "Repo là nguồn sự thật duy nhất" nên hiểu là nguồn hồ sơ chính | Câu đó nói AI không được giữ trạng thái ở chỗ riêng (memory, lịch sử chat); PR và CI nằm ngay trên GitHub của repo. Đổi chữ không đổi hành vi nào. | Không | Không làm |

Thêm một chỗ Codex không nêu: thread cũ "Cải thiện workflow AI từ review của Codex" (12/11) vẫn hiện "chờ thien" trên Overview, nhưng kế hoạch của nó ([`2026-11-12-silent-tools-fix.md`](2026-11-12-silent-tools-fix.md)) đã xong từ 17/11 (thien chạy thử trên laptop). Thread đó chỉ cần đóng.

## Không làm
- Không thêm luật mới, không thêm script mới (thien chốt ngừng thêm luật tới 01/12; sửa chỗ ghi sai không tính).
- Không kiểm "nhánh sync chỉ có commit của bot", không ghim action bằng mã commit, không làm bảng chỉ số riêng, không làm bộ đếm thời gian học thật: lý do ở bảng trên.
- Không mua gói GitHub Pro chỉ để có bảo vệ nhánh: chưa có lần AI merge khi CI đỏ.
- Không sửa trang tổng quan để thêm mã commit.

## Các phương án đã xét
| Phương án | Lý do mạnh nhất để không chọn |
|---|---|
| Làm theo đúng ba đợt của Codex, mỗi ý một việc | Năm ý trong đó đã có sẵn hay đã bị gạt có lý do; làm lại tốn công và thêm thứ phải nhớ |
| Gộp hết vào đợt 5 của kế hoạch review 17/11 ở mốc 01/12 | Hai lệnh xoá và ghi đè dữ liệu nằm thêm hai tuần, và lỡ lượt review của CodeRabbit (hết dùng thử 24/11) |
| Một PR cho mọi thứ | PR trộn script với file học thì thien phải merge cả, mất phần tự merge cho file học; CI cũng từng không cho một PR vừa đổi bài vừa đổi kit (PR #113) |
| Hai PR: script trước, chữ sau; phần đo gộp vào mốc 01/12 (chọn) | Thien vẫn phải merge tay PR script, vì nó sửa `templates/` và `.github/` |

## Checkpoint

### 1. Hai lệnh không còn xoá hay ghi đè dữ liệu
Xong khi: CI có test dựng một thư mục chứa file của người dùng rồi chạy `publish-progress --out` vào đó, lệnh dừng và file còn nguyên; thien đọc dòng `check-open-work` cho PR không còn ref merge thấy chữ "chưa rõ, mở PR xem trước", không thấy "xoá nhánh"; CodeRabbit đã review và mọi ý đã được trả lời.
- [x] `publish-progress.mjs`: chỉ xoá hay ghi vào thư mục chưa có, rỗng, nằm trong `build/` hay có file dấu do chính lệnh tạo; thư mục khác có file thì dừng. Test trong `.github/scripts/publish-progress.test.mjs` (PR #121, merge 2026-11-18)
- [x] `check-open-work.mjs` và `start-session.mjs`: PR không còn ref merge thì báo "chưa rõ: đã merge, đã đóng, hay đang mở nhưng conflict", bảo mở PR xem trước, không gọi là nhánh cũ (PR #121, merge 2026-11-18)
- [x] `start-session.mjs`: dò thêm mục "Đang ở đâu" của các kế hoạch đang chạy; chỉ xét vế câu có chữ chờ, để số PR cũ cùng dòng không bị báo nhầm (PR #121, merge 2026-11-18)
- [x] `sync-agents-md.mjs`: mô tả PR bot mở có câu "nhánh do Action quản lý, đừng đẩy commit lên" (PR #121, merge 2026-11-18)

### 2. Chỗ ghi sai được sửa
Xong khi: thien mở kế hoạch `action-gaps`, `learning/roadmap.md`, `learning/usage.md` không thấy câu nào trái với STATUS; trang lộ trình trên điện thoại khớp file.
- [x] Kế hoạch `action-gaps`: bỏ chữ "chờ merge PR #110"; bảng sáu lần kiểm tự merge (PR #121, merge 2026-11-18)
- [x] `learning/roadmap.md`: câu chặng 2 frontend, số buổi còn lại môn chiến tranh, trang Chiến tranh 6, 7 trong "Bài đã học" (PR #121, merge 2026-11-18)
- [x] Đăng lại trang lộ trình sau khi merge (2026-11-18, https://claude.ai/artifact/Vubbj6ghT9L7eKYegTfT9n)
- [x] `learning/usage.md`: ý nghĩa cột "Phút", ghi chú hai dòng 311 và 952 (PR #121, merge 2026-11-18)
- [x] Bảng học tuần: bỏ link ở `README.md`, `artifacts/README.md`, `learning/README.md`; `artifacts/lesson/README.md` giữ cách dựng lại (PR #121, merge 2026-11-18)
- [x] Dòng kế hoạch này trong STATUS, STATUS vẫn 40 dòng (PR #121, merge 2026-11-18)

### 3. Gộp phần đo vào mốc 01/12 (không có việc riêng)
Xong khi: danh sách việc ở mốc 01/12 (kế hoạch `action-gaps`, checkpoint 3) có các ý dưới, và buổi xem lại 01/12 trả lời được từng ý.
- [x] Ghi vào danh sách mốc 01/12: quyết phần tự merge từ bảng "Kiểm đợt 1"; vùng soi trước khi review theo giai đoạn; dòng "CI không tự chặn merge" cho bảng ủy quyền; thử sổ bàn giao lần tới thien nói "tiếp tục" (PR #121, merge 2026-11-18)
- [x] Buổi xem lại 01/12 trả lời từng ý (làm sớm 2026-11-19 ở KH8: tự merge câu 1, vùng soi câu 3, sổ bàn giao câu 6)

Thời gian: đợt 1 và 2 làm trong thread này, một PR (#121) thien merge. Đợt 3 không tốn thêm phiên.

Chỗ dễ sa lầy: phần dừng của `publish-progress` làm phiền khi AI chạy lại vào chính `build/` (phải nhận ra thư mục do lệnh tạo lần trước); sửa lời báo PR rồi trượt sang gọi API GitHub (phiên cloud không có `gh` đăng nhập, không làm).

## Câu hỏi (thien đã trả lời 2026-11-18: duyệt, bỏ Bảng học tuần)
1. Duyệt kế hoạch và làm đợt 1, 2 ngay để CodeRabbit kịp review trước 24/11? Đề xuất: có.
2. Bảng học tuần (trang đã bị xoá): dựng lại hay bỏ? Đề xuất: bỏ trang và bỏ link ở bốn file, giữ lệnh `learning-week.mjs` để dựng lại khi cần. Lý do: trang loại Data phải có AI tải số liệu lên tay mỗi Chủ nhật, việc nhớ theo lịch kiểu này hay trôi; gói buổi và trang ôn thẻ đã có thẻ đến hạn. Lý do mạnh nhất để không bỏ: ngày 17/11 bạn học 7 buổi, quá nhịp 4 buổi một tuần, mà không chỗ nào khác cho thấy số buổi trong tuần. Nếu cần thấy số đó, mình sẽ đưa ý "gói buổi in số buổi tuần này" vào mốc 01/12 thay vì dựng lại trang.

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-18 | Một PR (#121) thay cho hai: script và phần sửa chữ đi chung, thien merge cả | Phiên cloud chỉ đẩy được một nhánh của mình; PR sửa chữ cũng đụng `README.md`, `artifacts/` (bỏ link Bảng học tuần) nên đằng nào thien cũng merge |
| 2026-11-18 | Ba việc đo ghi thẳng vào danh sách mốc 01/12 của kế hoạch `action-gaps`, không để ở đây | Một chỗ cho mọi việc của mốc 01/12 |
| 2026-11-18 | `start-session` chỉ xét vế câu có chữ chờ, cả với STATUS | Thử trên kế hoạch `action-gaps` thì số PR cũ cùng dòng (#107, thienui PR #8) bị báo nhầm |
| 2026-11-19 | Đóng kế hoạch | thien chọn "Làm nốt rồi đóng" (KH8, `2026-11-19-close-plans.md`): đang có quá nhiều kế hoạch; mốc 01/12 làm sớm, việc cần số đo thật ghi đóng sớm thay vì tick đạt |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
