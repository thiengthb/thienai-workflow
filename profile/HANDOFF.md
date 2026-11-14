# Bàn giao giữa các nick Claude

thien dùng nhiều nick Claude. Nick đang làm có thể hết usage (phiên hay tuần) bất cứ lúc nào, và không có tín hiệu nào báo trước. Nick khác không đọc được chat, thread hay memory của nick cũ, chỉ đọc được repo. Nên việc dở được ghi vào một sổ bàn giao trong repo **sau mỗi bước**, không đợi cuối phiên. Quyết định ở [`docs/decisions/001-account-handoff.md`](../docs/decisions/001-account-handoff.md) (thien chọn bản A ngày 2026-11-14).

## Sổ nằm ở đâu
- Mỗi project giữ sổ của mình trong repo của chính nó: nhánh `handoff`, mỗi việc dở một file `tasks/<việc>.md`. Việc của sakubun nằm ở repo sakubun, việc của thienai-workflow nằm ở thienai-workflow.
- Nhánh này không bao giờ merge vào main. AI đẩy thẳng lên đó, không mở PR, không chờ thien. Đây là ngoại lệ duy nhất của luật "mọi thay đổi qua PR".
- Lệnh: `templates/handoff.mjs` của repo thienai-workflow (gắn repo đó vào phiên rồi chạy). `list` đọc sổ của thienai-workflow và mọi repo trong `life/tracked-repos.md`, nên nói "tiếp tục" ở project nào cũng thấy việc dở của mọi project.

| Việc | Lệnh |
|---|---|
| Bắt đầu một việc | `node templates/handoff.mjs new <owner/repo> <việc> "<tên việc>" > <việc>.md`, điền rồi `save` (đẩy vào repo ghi ở dòng `Repo:`) |
| Ghi sau mỗi bước | sửa file rồi `node templates/handoff.mjs save <việc>.md`. Nick khác đã sửa cùng việc từ lúc mình đọc thì lệnh từ chối, không ghi đè; `show <owner/repo> <việc> > <việc>.md` lấy bản mới rồi gộp |
| Xem việc dở | `node templates/handoff.mjs list` (mọi repo) hay `list <owner/repo>`; chi tiết bằng `show <owner/repo> <việc>` |
| Xong việc | `node templates/handoff.mjs done <owner/repo> <việc>` |

## Sổ không phải nguồn sự thật thứ hai
- Sự thật về project vẫn là repo đó: code, PR, `docs/STATUS.md`, kế hoạch, quyết định. Sổ chỉ là dấu trang: việc nào đang dở giữa chừng, dừng ở bước nào, bước tiếp theo là gì.
- Sổ không chép lại nội dung (kết quả, quyết định, code); nó trỏ tới chỗ đã ghi (nhánh, commit, PR, file).
- Lệch nhau thì repo thắng: tin STATUS, git và PR, rồi sửa sổ cho khớp.
- Sổ sống ngắn: xong việc thì xoá. Việc tạm gác lâu thì chuyển sang mục "Việc dở" của STATUS (qua PR như thường) rồi xoá khỏi sổ.

## Khi nào ghi
- Ngay khi nhận một việc nhiều bước (một câu hỏi trả lời xong trong một lượt thì không cần).
- Sau mỗi bước trong checklist: trước hết commit và đẩy nhánh làm việc, rồi sửa "Đã xong" và "Bước tiếp theo", rồi `save`.
- Ngay sau khi đăng một trang chờ thien (chọn phương án, duyệt giao diện, buổi học): ghi vào "Đang chờ thien" link trang, câu hỏi, và **lệnh dựng lại trang từ repo**. File nguồn của trang (ví dụ `decision.json`, ảnh, trang học) phải nằm trong nhánh làm việc đã đẩy, không để ở `/tmp`, vì nick khác không thấy máy của nick cũ.
- Khi thien trả lời hay chọn: chép kết quả vào repo (PR, kế hoạch, quyết định) rồi mới sửa sổ.
- Xong hẳn (PR merge, hay thien nói thôi): `done`.

## Khi thien nói "tiếp tục"
1. Chạy `list`. Repo nào phiên chưa đọc được thì lệnh báo tên; gắn repo đó vào phiên rồi chạy lại. Một việc thì làm luôn; nhiều việc thì kể ra (mới nhất trước, kèm việc nào đang chờ thien) và làm việc mới nhất, trừ khi thien nói việc khác.
2. `show` việc đó, gắn repo và nhánh ghi trong sổ, `git pull`, đọc `docs/STATUS.md` của repo đó.
3. Việc đang chờ thien chọn trên trang: link cũ chỉ mở được ở nick cũ. Chạy lệnh dựng lại ghi trong sổ, đăng thành trang mới, gửi thien link mới, ghi link mới vào sổ. Lựa chọn thien đã bấm mà chưa gửi trên trang cũ thì mất; thien bấm lại.
4. Làm tiếp từ "Bước tiếp theo", và ghi sổ sau mỗi bước như trên.

## Giới hạn
- Hết usage giữa chừng thì mất nhiều nhất phần làm từ lần `save` gần nhất.
- Chỉ việc làm ở nơi có quyền đẩy lên repo (project có gắn repo, Claude Code, Codex) mới ghi sổ được. Chat thường trên claude.ai không ghi được.
- Trang tổng quan và các trang link cố định: nick khác đăng lại thì ra link mới. Muốn giữ một link cho mọi nick thì thien mời các nick vào trang đó (Share, mời email, quyền sửa); phần dùng Claude trên trang không chạy ở nick được mời.
