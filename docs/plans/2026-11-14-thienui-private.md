# Chuyển repo thienui sang riêng tư

Trạng thái: xong · Duyệt: 2026-11-14 · Cập nhật: 2026-11-17 · Thread: [Chuyển thienui sang riêng tư an toàn](https://claude.ai/code/project/chan_01TWjpyDUPatD4TgSaGkK3GV?thread=cmsg_01TWjpyDUPatD4TgSaGkK3GVDxSvhHTsmVLvK7FafqhunR) · nick tnt024

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: xong cả 3 checkpoint (2026-11-15). PR #73 ở thienai-workflow đã merge.
- Còn thiếu: [chưa kiểm] PR #7 ở thienui đã merge chưa (phiên 2026-11-17 không có quyền đọc thienui).
- thien cần làm: merge PR #7 ở thienui nếu còn mở.

## Mục tiêu
Người ngoài không xem, không clone được gu giao diện, component, luật và skill của thien trong repo [thienui](https://github.com/thiengthb/thienui), mà AI ở cả 3 nick vẫn đọc được như cũ.

## Không làm
- Viết lại lịch sử git của thienui: không có mật khẩu hay token nào trong 27 commit, nên không cần. Thứ duy nhất nhạy cảm là email cá nhân ở tên người commit, và repo riêng tư thì người ngoài không thấy nữa.
- Xoá repo rồi tạo lại: mất PR, lịch sử, không giấu thêm được gì.
- Đổi giấy phép MIT: repo riêng tư thì không ai lấy được bản mới; bản ai đã clone trước đây vẫn là MIT, đổi bây giờ cũng không lấy lại được.

## AI đã soát gì (2026-11-14)
| Chỗ | Kết quả | Sau khi riêng tư |
|---|---|---|
| thienui trên GitHub | Đang **công khai**. 0 sao, 0 fork, không có trang GitHub Pages, không có GitHub Actions, không có luật nhánh, không có package trên npm, không có trong danh mục registry của shadcn | Không có gì hỏng ở phía GitHub |
| Lượt clone 14 ngày qua | 71 lần, 31 nơi khác nhau (phần lớn có lẽ là các phiên AI của chính thien, mỗi phiên cloud là một máy mới; không phân biệt được) | Bản đã bị clone thì không lấy lại được |
| Lịch sử commit | Không có mật khẩu, token, khoá. Có email cá nhân `tranngocthien628@...` ở 10 commit, và `thien@sakubun.app` trong nội dung | Người ngoài không thấy nữa |
| Registry component (`shadcn add @thienui/...`) | Đọc qua `raw.githubusercontent.com/thiengthb/thienui/...`, không cần đăng nhập | **Hỏng** với ai không có quyền. Cách mới ở [README của thienui](https://github.com/thiengthb/thienui#project-sau-tiêu-thụ-thế-nào): AI chép từ bản clone, không cần token |
| Các phiên Claude ở 3 nick | Đọc `docs/taste.md` và token để dựng trang | Chỉ đọc được khi GitHub của nick cho phép repo thienui (bước 1) |
| Repo thienai-workflow | Đã riêng tư. Có `artifacts/design-system/brand-book.md` tóm từ `taste.md`, và link tới thienui | Không lộ gì; link chỉ mở được khi đăng nhập |
| Action đồng bộ AGENTS (`SYNC_TOKEN`) | Không đụng thienui (thienui không nằm trong `life/tracked-repos.md`) | Không cần đổi |
| Trang "Bộ màu thienui" trên claude.ai (https://claude.ai/artifact/2kM7som4ok6kmh7QaCSXZJ) | Trang claude.ai mặc định riêng tư; AI không xem được trang đã bật chia sẻ hay chưa | thien kiểm ở bước 4 |
| Repo sakubun | **Công khai**. Có bản chép 37 luật và token ([tooling/thienui-guards](https://github.com/thiengthb/sakubun/tree/main/tooling/thienui-guards), [app/globals.css](https://github.com/thiengthb/sakubun/blob/main/app/globals.css), [docs/ui-standard.md](https://github.com/thiengthb/sakubun/blob/main/docs/ui-standard.md)), và email `tranngocthien628@...` ở 60 commit | Vẫn lộ; thien chọn để sau (checkpoint 3) |

## Các bước cho thien
Đã thử ngày 2026-11-14: chưa bước nào, vì cả 5 bước cần tài khoản của bạn. Mình viết theo [tài liệu GitHub về đổi chế độ repo](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), đọc ngày 2026-11-14.

**Bước 1. Cho Claude đọc được thienui khi đã riêng tư** (làm trước bước 2) (chưa thử)
1. Mở https://github.com/settings/installations.
2. Ở dòng **Claude**, bấm **Configure**.
3. Kéo xuống mục **Repository access**. Nếu đang chọn **All repositories** thì không cần làm gì, sang bước 2. Nếu đang chọn **Only select repositories**: bấm **Select repositories**, gõ `thienui`, chọn `thiengthb/thienui`, rồi bấm **Save** ở cuối trang.
4. Thấy là đúng: `thiengthb/thienui` nằm trong danh sách repo bên dưới ô chọn.
- Dễ nhầm: trang có nút **Save** ở cuối, không bấm thì không lưu.

**Bước 2. Đổi thienui sang riêng tư** (chưa thử)
1. Mở https://github.com/thiengthb/thienui/settings (tab **General**).
2. Kéo xuống cuối trang, khung viền đỏ **Danger Zone**, dòng **Change repository visibility**, bấm **Change visibility**, chọn **Change to private**.
3. Hộp thoại hiện ra: bấm lần lượt **I want to make this repository private**, **I have read and understand these effects**, rồi **Make this repository private**. GitHub có thể hỏi lại mật khẩu hoặc mã 2 lớp.
4. Thấy là đúng: cạnh tên repo ở đầu trang có nhãn **Private**. Mở https://github.com/thiengthb/thienui trong cửa sổ ẩn danh (Ctrl+Shift+N) thì thấy trang 404.
- Đổi lại công khai được bất cứ lúc nào, cùng chỗ này.

**Bước 3. Giấu email cá nhân trong các commit sau này** (chưa thử)
1. Mở https://github.com/settings/emails.
2. Tick ô **Keep my email addresses private** và ô **Block command line pushes that expose my email**.
3. Thấy là đúng: dưới ô đầu hiện một địa chỉ dạng `136480142+thiengthb@users.noreply.github.com`.
- Dễ nhầm: việc này không xoá email khỏi commit cũ của sakubun, chỉ chặn từ nay về sau.

**Bước 4. Kiểm trang "Bộ màu thienui" chưa bị chia sẻ công khai** (chưa thử)
1. Mở https://claude.ai/artifact/2kM7som4ok6kmh7QaCSXZJ bằng nick tnt024.
2. Bấm **Share** ở góc trên bên phải.
3. Thấy là đúng: trang chỉ mình bạn xem được (không có link công khai đang bật). Nếu đang bật link công khai thì tắt đi.

**Bước 5. Thử đọc từ từng nick** (chưa thử)
Ở mỗi nick (tnt024, tnt628, tnt697), mở project "Claude", gửi:
```text
Đọc docs/taste.md của repo thiengthb/thienui rồi nói cho mình 3 ý đầu.
```
Thấy là đúng: Claude trả lời đúng nội dung (bo góc 8px, font Onest...). Nếu Claude báo không đọc được: vào Settings > Connectors > GitHub của nick đó, cho phép thêm repo `thienui`.

Xong thì nhắn trong thread này "xong", AI tick và cập nhật `docs/STATUS.md`.

## Checkpoint

### 1. Soát và chuẩn bị (AI)
Xong khi: bảng soát ở trên đủ, PR sửa cách cài registry của thienui và PR này đã mở.
- [x] Soát thienui, sakubun, thienai-workflow, Action đồng bộ, trang claude.ai (thread này)
- [x] Thêm thienui vào danh sách repo GitHub phải cho phép ở `profile/SETUP.md` (PR này)
- [ ] Sửa README và `registry.config.mjs` của thienui cho repo riêng tư (PR ở thienui)

### 2. Đổi chế độ (thien)
Xong khi: mở thienui ở cửa sổ ẩn danh thấy 404, và cả 3 nick đọc được `docs/taste.md`.
- [x] Bước 1 đến 5 ở trên: thien báo xong 2026-11-15. AI kiểm: GitHub báo thienui `private`, link raw không đăng nhập trả 404, phiên nick tnt024 vẫn fetch được repo

### 3. sakubun
Xong khi: thien đã chọn cách làm với sakubun.
- [x] 2026-11-14 thien chọn: chỉ chuyển thienui, sakubun để công khai, tính sau (màu và chữ của app đang chạy ai cũng xem được trong CSS)

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
