# Các nick Claude của thien

thien dùng nhiều nick Claude trên cùng các repo. Các nick không nhìn thấy nhau: chat, thread, memory và trang (artifact) của nick nào chỉ nick đó mở được. Repo là chỗ duy nhất mọi nick cùng đọc, nên sổ này nằm ở đây. Mở ra là biết có bao nhiêu nick đang chạy, nick nào dựng project nào, ở chuẩn setup bản mấy, và một việc đã làm thì chat, memory của nó nằm ở nick nào.

## Đặt tên
- Dạng `tnt` + số: số đuôi email nếu có, không thì một số bất kỳ chưa dùng. Không bao giờ ghi email vào repo.
- Tên nick ghi ở dòng đầu project instructions của mỗi project (`chuẩn setup vN · project: X · nick: tntXXX`, xem [`SETUP.md`](SETUP.md)). AI không tự biết mình ở nick nào; nó đọc tên ở đó.

## Sổ nick
| Nick | Trạng thái | Từ ngày | Project đã dựng | Chuẩn setup | Ghi chú |
|---|---|---|---|---|---|
| `tnt024` | đang dùng | 2026-11 | `Claude`, `sakubun` | Claude: chưa dán | |
| `tnt628` | đang dùng | 2026-11 | `Claude`, `sakubun` | chưa kiểm | |
| `tnt697` | đang dùng | 2026-11 | `Claude`, `sakubun` | Claude v2 (kiểm 2026-11-15), sakubun chưa kiểm | |

Trạng thái: `đang dùng`, `tạm nghỉ` (hết usage lâu, chưa bỏ), `đã nghỉ`. Cột "Chuẩn setup" ghi bản đã dán ở từng project, ví dụ `Claude v2, sakubun v1`.

AI sửa sổ này khi lần kiểm setup báo (`nhắc: AI tự làm: ...`), hoặc khi thien dán xong instructions bản mới: gộp vào PR đang làm của thread đó, không có thì mở PR nhỏ. Nick nào ở bản thấp hơn [`SETUP.md`](SETUP.md) là nick đó chưa đồng bộ.

## Kiểu project ở từng nick
Claude có hai kiểu project, và một nick chỉ có một kiểu. Bản mới (beta) chỉ mở dần cho nick chưa có project cũ, nên nick đã có project cũ thì ở lại bản cũ tới khi Anthropic chuyển (không mất gì khi chuyển).

| Nick | Kiểu project | Biết từ đâu |
|---|---|---|
| tnt024 | beta: một chat điều phối mở nhiều thread | PR của nick này đến từ thread (nhánh `claude/project-thread-...`) |
| tnt628 | beta: một chat điều phối mở nhiều thread | thien nói 2026-11-15 |
| tnt697 | cũ: mỗi chat riêng, không có thread | thien nói 2026-11-15; chat trong project vẫn chạy lệnh, đẩy nhánh, mở PR được |

| Bản cũ | Bản beta |
|---|---|
| Mỗi chat một ngữ cảnh riêng; knowledge đồng bộ repo nằm sẵn trong mọi chat | Một chat điều phối, mỗi việc một thread (một phiên Claude Code riêng, nhánh riêng) |
| Bước "Nhắc việc dở" làm ở chat đầu tiên của việc | Chat điều phối làm bước đó trước khi mở thread; thread không hỏi lại |
| Một việc một lúc, nhẹ usage: hợp với học, ôn thẻ, review, sửa nhỏ | Chạy song song nhưng mỗi thread tính như một phiên đầy đủ, gói Pro hết usage nhanh: để cho việc lớn chia được nhiều phần |
| Không có màn Overview: việc dở nằm ở sổ bàn giao và mục "Việc dở" của STATUS | Overview cho thấy thread nào xong, chờ review hay chờ thien |
| Knowledge có thể chậm hơn main vài phút sau khi merge: đọc file trong repo | Mỗi thread clone repo mới |

Nick đổi kiểu (Anthropic chuyển lên beta, hay thien vào danh sách chờ) thì sửa bảng trên qua PR.

## Việc nằm ở nick nào
- Commit: dòng `Claude-Nick: tntXXX` ở cuối. Tìm việc của một nick: `git log --grep "Claude-Nick: tnt024" --oneline`.
- PR: dòng `Nick: tntXXX` trong mô tả.
- Sổ bàn giao: dòng `Ghi bởi: Claude tntXXX, <link thread>`. `handoff.mjs list` in nick của từng việc.
- Link trang: luôn kèm "(mở ở nick tntXXX)", vì trang chỉ mở được ở nick tạo ra nó.
- Memory và chat của project nằm ở nick đã làm. Chỉ để ở đó chuyện ngắn hạn; điều gì cần nhớ lâu phải ghi vào repo, vì nick khác không đọc được memory.

## Nhiều nick làm cùng một repo
- Giữ chỗ: trước khi làm tiếp một việc trong sổ bàn giao mà dòng "Ghi bởi" là nick khác (hay "nick chưa rõ", coi như nick khác) và cập nhật trong 24 giờ qua, hỏi thien trước (có thể nick kia còn đang làm). thien nói "tiếp tục" là đồng ý cho nick này nhận việc; ghi lại dòng "Ghi bởi" bằng nick mới.
- Một việc, một nhánh, một nick tại một lúc. Hai nick không cùng đẩy lên một nhánh; cần thì mở nhánh mới từ nhánh kia.
- Đổi chuẩn ([`SETUP.md`](SETUP.md)) hay luật chung: mỗi nick tự nhận ra ở phiên đầu tiên sau đó, nhờ số phiên bản. Không cần nhớ đã sửa ở nick nào.

## Thêm nick mới
1. Chọn tên `tntXXX`, thêm một dòng vào bảng trên (AI làm qua PR).
2. Làm mục "Một lần cho mỗi nick" trong [`SETUP.md`](SETUP.md): nối GitHub, tải skill.
3. Tạo từng project trong bảng của `SETUP.md`, gắn repo, dán instructions có tên nick mới.
4. Mở một thread trong project đó: lần kiểm setup đầu tiên báo thiếu gì.

## Thêm project mới
- Thêm project vào bảng trong [`SETUP.md`](SETUP.md) (qua PR), rồi dựng nó ở từng nick muốn dùng. Mỗi nick dựng xong thì AI ghi project vào dòng của nick đó ở sổ trên. Nhìn cột "Project đã dựng" là biết project có ở những nick nào.

## Cho một nick nghỉ
1. `node templates/handoff.mjs list`: việc nào "Ghi bởi" nick đó thì chuyển sang nick khác (nói "tiếp tục" ở nick mới).
2. Trang còn cần (trang tổng quan, trang đang chờ chọn): đăng lại ở nick mới theo lệnh dựng lại trong sổ.
3. Đổi trạng thái thành `đã nghỉ`, ghi ngày. Không xoá dòng, để lịch sử commit vẫn tra được.
