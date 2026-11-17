# Bàn giao giữa các nick Claude

thien dùng nhiều nick Claude. Nick đang làm có thể hết usage (phiên hay tuần) bất cứ lúc nào, và không có tín hiệu nào báo trước. Nick khác không đọc được chat, thread hay memory của nick cũ, chỉ đọc được repo. Nên việc dở được ghi vào một sổ bàn giao trong repo **ở những mốc khó khôi phục**, không đợi cuối phiên. Quyết định ở [`docs/decisions/001-account-handoff.md`](../docs/decisions/001-account-handoff.md) (thien chọn bản A ngày 2026-11-14).

## Sổ nằm ở đâu
- Mỗi project giữ sổ của mình trong repo của chính nó: nhánh `handoff`, mỗi việc dở một file `tasks/<việc>.md`. Việc của sakubun nằm ở repo sakubun, việc của thienai-workflow nằm ở thienai-workflow.
- Nhánh này không bao giờ merge vào main. AI đẩy thẳng lên đó, không mở PR, không chờ thien. Đây là ngoại lệ duy nhất của luật "mọi thay đổi qua PR".
- Lệnh: `templates/handoff.mjs` của repo thienai-workflow (gắn repo đó vào phiên rồi chạy). `list` đọc sổ của thienai-workflow và mọi repo trong `life/tracked-repos.md`, nên nói "tiếp tục" ở project nào cũng thấy việc dở của mọi project.

| Việc | Lệnh |
|---|---|
| Bắt đầu một việc | `node templates/handoff.mjs new <owner/repo> <việc> "<tên việc>" --out <việc>.md`, điền rồi `save` (đẩy vào repo ghi ở dòng `Repo:`) |
| Ghi ở mỗi mốc | sửa file rồi `node templates/handoff.mjs save <việc>.md`. Nick khác đã sửa cùng việc từ lúc mình đọc thì lệnh từ chối, không ghi đè; `show <owner/repo> <việc> --out <việc>.new.md` lấy bản mới vào file riêng, gộp phần của mình vào đó, đổi tên về `<việc>.md` rồi `save` |
| Xem việc dở | `node templates/handoff.mjs list` (mọi repo) hay `list <owner/repo>`; chi tiết bằng `show <owner/repo> <việc>` |
| Xong việc | `node templates/handoff.mjs done <owner/repo> <việc>` |

Dùng `--out <file>` thay cho `> file`: trên Windows PowerShell 5, `>` ghi file UTF-16 (lệnh vẫn đọc được, nhưng công cụ khác thì không). Lệnh đọc được file xuống dòng kiểu Windows (CRLF).

## Sổ không phải nguồn sự thật thứ hai
- Sự thật về project vẫn là repo đó: code, PR, `docs/STATUS.md`, kế hoạch, quyết định. Sổ chỉ là dấu trang: việc nào đang dở giữa chừng, dừng ở bước nào, bước tiếp theo là gì.
- Sổ không chép lại nội dung (kết quả, quyết định, code); nó trỏ tới chỗ đã ghi (nhánh, commit, PR, file).
- Lệch nhau thì repo thắng: tin STATUS, git và PR, rồi sửa sổ cho khớp.
- Sổ sống ngắn: xong việc thì xoá. Việc tạm gác lâu thì chuyển sang mục "Việc dở" của STATUS (qua PR như thường) rồi xoá khỏi sổ.

## Khi nào ghi
- Ngay khi nhận một việc nhiều bước (một câu hỏi trả lời xong trong một lượt thì không cần).
- Ở mốc có nghĩa: sau một commit đã đẩy mà nick khác khó tự dựng lại, ngay khi đang chờ thien (trang, câu hỏi), và trước một thao tác dài (dựng trang lớn, chạy test lâu). Trước hết commit và đẩy nhánh làm việc, rồi sửa "Đã xong" (kèm mã commit đã đẩy) và "Bước tiếp theo", rồi `save`. Việc ngắn (khoảng dưới 10 lượt) gộp nhiều bước vào một lần ghi. Ghi sổ không bảo đảm không mất việc: phần chưa đẩy vẫn mất khi hết usage.
- Không ghi token, mật khẩu, dữ liệu bài học thô hay chuyện riêng: sổ nằm trong lịch sử git cả khi đã `done`. `save` từ chối chuỗi giống token, nhưng đó chỉ là lưới an toàn.
- Ngay sau khi đăng một trang chờ thien (chọn phương án, duyệt giao diện, buổi học): ghi vào "Đang chờ thien" link trang, câu hỏi, và **lệnh dựng lại trang từ repo**. File nguồn của trang (ví dụ `decision.json`, ảnh, trang học) phải nằm trong nhánh làm việc đã đẩy, không để ở `/tmp`, vì nick khác không thấy máy của nick cũ. Ảnh nén JPG, mỗi ảnh vài trăm KB; trang phác để đuôi `.txt` cho khỏi bị build; có `docs/plans/` thì để cạnh kế hoạch của bước, ví dụ `docs/plans/<ngày>-<bước>/round2/`.
- Khi thien trả lời hay chọn: chép **nguyên văn** kết quả vào repo (mục "Kết quả" của kế hoạch, PR, hay quyết định) rồi mới sửa sổ.
- Xong hẳn (PR merge, hay thien nói thôi): `done`.

## Khi thien nói "tiếp tục"
Bước 1 và 3 nằm sẵn trong lệnh khởi động: `node templates/start-session.mjs ... --claim "Claude tntXXX, <link chat>"` (cách gọi ở `profile/SETUP.md`) đọc sổ mọi repo, nhận việc mới nhất (hay việc ghi ở `--task <owner/repo>:<việc>`), in nó ra và so nhánh với sổ. Lệnh báo "Chưa nhận được" thì dừng hỏi thien như bước 3.

1. Chạy `list`. Repo nào phiên chưa đọc được thì lệnh báo tên; gắn repo đó vào phiên rồi chạy lại. Một việc thì làm luôn; nhiều việc thì kể ra (mới nhất trước, kèm việc nào đang chờ thien) và làm việc mới nhất, trừ khi thien nói việc khác.
2. `show` việc đó, gắn repo và nhánh ghi trong sổ, `git pull`, đọc `docs/STATUS.md` của repo đó. So sổ với git: commit cuối của nhánh (`git log -1`) và PR có khớp "Đã xong" không. Nhánh đi trước sổ (nick cũ hết usage sau khi đẩy, trước khi `save`) thì tin nhánh và sửa sổ; sổ ghi commit mà nhánh không có thì commit đó chưa đẩy, coi như mất.
3. Nhận việc trước khi làm: "Ghi bởi" là nick khác và cập nhật trong 24 giờ qua thì làm theo mục "Nhiều nick" ở dưới. Rồi sửa "Ghi bởi" thành nick và link thread của mình (project cũ không có thread thì ghi link chat; "Claude nick chưa rõ" khi project instructions chưa có dòng `nick:`) và `save` ngay; `save` tự ghi giờ hiện tại vào "Cập nhật", nên mốc 24 giờ tính từ lúc nhận. `save` bị từ chối vì sổ vừa đổi nghĩa là một nick khác cũng vừa nhận việc này: dừng lại hỏi thien.
4. Việc đang chờ thien chọn trên trang: link cũ chỉ mở được ở nick cũ. Chạy lệnh dựng lại ghi trong sổ, đăng thành trang mới, gửi thien link mới, ghi link mới vào sổ. Lựa chọn thien đã bấm mà chưa gửi trên trang cũ thì mất; thien bấm lại.
5. Làm tiếp từ "Bước tiếp theo", và ghi sổ ở các mốc như trên.

## Nhiều nick
- Dòng "Ghi bởi" luôn có tên nick (`Ghi bởi: Claude tnt024, <link thread hoặc link chat>`), và link trang ghi "(mở ở nick tntXXX)". `list` in nick của từng việc.
- Việc mà nick khác ghi trong 24 giờ qua: hỏi thien trước khi nhận, trừ khi thien đã nói "tiếp tục". Luật đủ ở [`ACCOUNTS.md`](ACCOUNTS.md).

## Giới hạn
- Hết usage giữa chừng thì mất phần chưa commit và đẩy. Sổ có thể chậm hơn nhánh một bước (đã đẩy nhưng chưa kịp `save`), nên nick sau luôn so với git như bước 2 ở trên.
- Sổ chống ghi đè lên chính nó, không khóa code: hai nick vẫn có thể cùng sửa một nhánh nếu bỏ qua bước nhận việc.
- Ghi sổ được ở mọi phiên chạy được lệnh và có quyền đẩy lên repo: thread của project beta, chat trong project cũ có chạy lệnh (như nick tnt697), Claude Code, Codex. Phiên chỉ đọc repo mà không chạy được lệnh thì không ghi được: nói với thien việc đang dở và bước tiếp theo để thien mở phiên khác ghi.
- Trang tổng quan và các trang link cố định: nick khác đăng lại thì ra link mới. Muốn giữ một link cho mọi nick thì thien mời các nick vào trang đó (Share, mời email, quyền sửa); phần dùng Claude trên trang không chạy ở nick được mời.
