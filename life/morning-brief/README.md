# Bản tin sáng

Mỗi sáng khoảng 6:30, Google gửi vào Gmail của thien một mail gồm ba phần:
- lịch hôm nay trong Google Calendar,
- task quá hạn và tới hạn hôm nay trong Google Tasks, kèm số task còn lại,
- tiến độ từng repo trong [`../tracked-repos.md`](../tracked-repos.md), đọc từ `docs/STATUS.md`. Repo nào đang chờ thien thì xếp lên đầu.

Script chạy bằng Google Apps Script nên miễn phí, và không dùng Claude. Hết quota hay đổi tài khoản Claude thì bản tin vẫn tới. Phần "nghĩ" nằm ở `docs/STATUS.md`: AI nào làm trong repo cũng phải cập nhật file này vào cuối phiên (luật trong `templates/AGENTS.template.md`).

## Cài một lần (khoảng 15 phút)

Viết theo luật trong [`profile/GUIDES.md`](../../profile/GUIDES.md). Tên dùng ở đây đã ghi trong [`life/names.md`](../names.md).

Các bước dưới đây đều cần tài khoản Google và GitHub của bạn nên mình chưa tự bấm thử được, nên bước nào cũng có ghi `(chưa thử)`. Mình viết theo [tài liệu token của GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) đọc ngày 08/11/2026 và theo lần bạn cài ngày 08/11/2026. Bước nào màn hình khác thì nhắn mình số bước để mình sửa file này.

| Thứ gì | Tên |
|---|---|
| Project Apps Script | `morning-brief` |
| Token GitHub | `morning brief` |
| Biến chứa token | `GITHUB_TOKEN` |

### Bước 1. Tạo project Apps Script (chưa thử)

Mở [script.google.com/create](https://script.google.com/create). Trang này tạo luôn một project mới tên **Untitled project**.

Bấm vào chữ **Untitled project** ở góc trái trên cùng. Hộp thoại **Rename project** hiện ra:

| Ô | Điền |
|---|---|
| Project title | `morning-brief` |

Bấm **Rename**.

**Thấy gì là đúng:** góc trái trên cùng ghi `morning-brief`, giữa màn hình là file `Code.gs` có sẵn vài dòng `function myFunction() {}`.

### Bước 2. Dán code (chưa thử)

Mở [bản raw của Code.gs](https://raw.githubusercontent.com/thiengthb/thienai-workflow/main/life/morning-brief/Code.gs) ở tab mới, bấm Ctrl+A rồi Ctrl+C.

Quay lại tab Apps Script, bấm vào giữa vùng code, bấm Ctrl+A rồi Ctrl+V để thay hết code mẫu. Bấm Ctrl+S để lưu.

**Thấy gì là đúng:** dòng thứ hai của code là `* Morning brief for thien`, ô chọn hàm trên thanh công cụ (cạnh nút **Debug**) có `setup` và `sendMorningBrief`. Tên file `Code.gs` ở thanh bên trái không còn dấu chấm tròn chưa lưu.

**Dễ nhầm:** quên Ctrl+A trước khi dán thì code mẫu còn nằm lại, lúc chạy sẽ báo lỗi cú pháp.

### Bước 3. Bật Google Tasks API (chưa thử)

Ở cột bên trái của màn hình code, mục **Services**, bấm dấu **+**. Hộp thoại **Add a service** hiện ra.

| Ô | Chọn |
|---|---|
| Danh sách dịch vụ | **Google Tasks API** |
| Version | Để nguyên `v1` |
| Identifier | Để nguyên `Tasks` |

Bấm **Add**.

**Thấy gì là đúng:** dưới mục **Services** có dòng `Tasks`.

**Dễ nhầm:** Identifier phải đúng `Tasks`, viết hoa chữ T. Đổi tên khác thì phần task trong mail sẽ báo lỗi đỏ.

### Bước 4. Tạo token GitHub (chưa thử)

Mở [trang tạo fine-grained token](https://github.com/settings/personal-access-tokens/new). GitHub có thể hỏi lại mật khẩu hoặc mã 2FA.

| Ô | Điền hoặc chọn |
|---|---|
| Token name | `morning brief` |
| Description | `Morning brief reads docs/STATUS.md` |
| Resource owner | `thiengthb` |
| Expiration | Chọn **Custom**, rồi chọn ngày cách hôm nay đúng 1 năm |
| Repository access | Chọn **Only select repositories** |
| Select repositories | Tick đủ 5 repo: `thienai-workflow`, `sakubun`, `capstone-hub`, `ccp-docs`, `PRM393_Lab03_SE190533` |

Phần **Permissions**: nếu thấy nút **Add permissions** thì bấm, gõ `Contents`, tick **Contents**. Nếu thấy sẵn danh sách **Repository permissions** thì tìm dòng **Contents**. Ở dòng **Contents**, chọn **Read-only**. Không đổi quyền nào khác. Dòng **Metadata** tự thành **Read-only**, cứ để vậy.

Kéo xuống cuối trang, bấm **Generate token**. Nếu hộp thoại xác nhận hiện ra thì bấm **Generate token** lần nữa.

**Thấy gì là đúng:** trang hiện một dãy bắt đầu bằng `github_pat_`, cạnh có biểu tượng copy. Bấm biểu tượng copy.

**Dễ nhầm:** token chỉ hiện một lần. Đóng trang trước khi dán vào bước 5 thì phải tạo token mới.

**Thêm một việc:** mở [Google Calendar](https://calendar.google.com), tạo sự kiện vào ngày token hết hạn, tên `Tạo lại token morning brief`.

Repo mới thêm vào [`tracked-repos.md`](../tracked-repos.md) sau này thì phải sửa token: mở [danh sách token](https://github.com/settings/personal-access-tokens), bấm `morning brief`, bấm **Edit**, tick thêm repo, bấm **Update**.

### Bước 5. Dán token vào Apps Script (chưa thử)

Quay lại tab Apps Script. Ở thanh biểu tượng sát mép trái, bấm biểu tượng bánh răng **Project Settings**. Kéo xuống cuối trang tới mục **Script Properties**, bấm **Add script property**.

| Ô | Điền |
|---|---|
| Property | `GITHUB_TOKEN` |
| Value | Dán token vừa copy ở bước 4 |

Muốn mail gửi tới địa chỉ khác Gmail đang dùng thì bấm **Add script property** lần nữa, Property là `BRIEF_TO`, Value là địa chỉ mail đó. Không cần thì bỏ qua.

Bấm **Save script properties**.

**Thấy gì là đúng:** mục **Script Properties** có dòng `GITHUB_TOKEN`, phần giá trị bị che.

**Dễ nhầm:** gõ sai tên `GITHUB_TOKEN` (thiếu chữ, có dấu cách) thì script không thấy token. Repo private sẽ hiện "chưa có file tiến độ" thay vì báo lỗi, nên rất khó nhận ra.

### Bước 6. Chạy thử một lần (chưa thử)

Ở thanh biểu tượng bên trái, bấm biểu tượng **<>** (**Editor**) để quay lại màn hình code. Trên thanh công cụ, ở ô chọn hàm (cạnh nút **Debug**), chọn `sendMorningBrief`. Bấm **Run**.

Lần đầu Google sẽ hỏi quyền, bấm lần lượt:

1. Hộp thoại **Authorization required**: bấm **Review permissions**.
2. Chọn tài khoản Google của bạn.
3. Trang **Google hasn't verified this app**: bấm chữ **Advanced** ở góc dưới bên trái, rồi bấm **Go to morning-brief (unsafe)**. Đây là script của chính bạn nên không sao.
4. Trang liệt kê quyền: nếu có ô **Select all** thì tick, rồi bấm **Allow** (hoặc **Continue**).

**Thấy gì là đúng:** khung **Execution log** ở dưới màn hình code hiện `Execution started` rồi `Execution completed`. Mở [Gmail](https://mail.google.com), có mail tên `Bản tin sáng` kèm thứ và ngày hôm nay, gồm ba phần: Lịch hôm nay, Task cần làm, Repo.

**Nếu lỗi:**
- Execution log báo đỏ `ReferenceError: Tasks is not defined`: làm lại bước 3.
- Trong mail, phần Repo có chữ đỏ `GitHub trả 401`: token sai hoặc đã hết hạn, làm lại bước 4 và 5.
- Trong mail, một repo hiện "chưa có file tiến độ" mà bạn biết repo đó có `docs/STATUS.md`: token chưa tick repo đó ở bước 4.
- Không thấy mail: xem thư mục Spam, rồi xem lại có `BRIEF_TO` gõ sai địa chỉ không.

### Bước 7. Bật gửi tự động (chưa thử)

Vẫn ở màn hình code, ở ô chọn hàm chọn `setup`. Bấm **Run**.

**Thấy gì là đúng:** Execution log hiện `Execution completed`. Ở thanh biểu tượng bên trái, bấm biểu tượng đồng hồ **Triggers**: có đúng một dòng, cột Function là `sendMorningBrief`, cột Event là `Time-based`.

**Dễ nhầm:** chạy `setup` nhiều lần không sao, vì mỗi lần nó xoá trigger cũ trước khi tạo cái mới.

### Kiểm tra cuối

Sáng hôm sau, khoảng 6:30 đến 6:45, mở Gmail. Có mail `Bản tin sáng` thì xong. Không có thì vào **Triggers**, bấm dấu ba chấm ở dòng trigger, chọn **Executions**, chụp màn hình gửi mình.

## Cần biết

- Giờ gửi không chính xác tới từng phút: Google chạy trong khoảng 15 phút quanh 6:30.
- Phần nào lỗi (token hết hạn, repo đổi tên) thì riêng phần đó hiện chữ đỏ, các phần khác vẫn gửi bình thường.
- Sửa `tracked-repos.md` thì không cần đụng vào script, vì sáng nào script cũng đọc lại file đó.
- Sửa `Code.gs` trong repo thì phải dán lại vào Apps Script. Script không tự lấy bản mới.
- Kiểm phần đọc file bằng Node: `node life/morning-brief/test.js`.
