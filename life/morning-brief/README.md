# Bản tin sáng

Mỗi sáng khoảng 6:30, Google gửi vào Gmail của thien một mail gồm ba phần:
- lịch hôm nay trong Google Calendar,
- task quá hạn và tới hạn hôm nay trong Google Tasks, kèm số task còn lại,
- tiến độ từng repo trong [`../tracked-repos.md`](../tracked-repos.md), đọc từ `docs/STATUS.md`. Repo nào đang chờ thien thì xếp lên đầu.

Script chạy bằng Google Apps Script nên miễn phí, và không dùng Claude. Hết quota hay đổi tài khoản Claude thì bản tin vẫn tới. Phần "nghĩ" nằm ở `docs/STATUS.md`: AI nào làm trong repo cũng phải cập nhật file này vào cuối phiên (luật trong `templates/AGENTS.template.md`).

## Cài một lần (khoảng 10 phút)

1. Vào [script.google.com](https://script.google.com), bấm **New project**, đặt tên `morning-brief`.
2. Xoá code mẫu, dán toàn bộ [`Code.gs`](Code.gs) vào.
3. Bên trái, bấm dấu **+** cạnh **Services**, chọn **Google Tasks API**, bấm **Add**.
4. Tạo token GitHub để đọc repo private: vào [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).
   - **Repository access**: chọn "Only select repositories", rồi chọn các repo trong `tracked-repos.md` và `thienai-workflow`.
   - **Permissions** > **Contents**: Read-only. Không cấp gì thêm.
   - **Expiration**: đặt 1 năm, rồi ghi ngày hết hạn vào Google Calendar để nhớ tạo lại.
5. Trong Apps Script, vào **Project Settings** (bánh răng) > **Script properties**, thêm `GITHUB_TOKEN` và dán token vào. Muốn gửi tới địa chỉ khác Gmail đang dùng thì thêm `BRIEF_TO`.
6. Chọn hàm `sendMorningBrief` rồi bấm **Run**. Google sẽ hỏi quyền. Nếu hiện "Google hasn't verified this app", bấm **Advanced** > **Go to morning-brief**. Đây là script của chính bạn nên không sao. Xong thì mở Gmail xem mail thử.
7. Chọn hàm `setup` rồi bấm **Run** một lần. Từ đó mail sẽ tự gửi mỗi sáng.

## Cần biết

- Giờ gửi không chính xác tới từng phút: Google chạy trong khoảng 15 phút quanh 6:30.
- Phần nào lỗi (token hết hạn, repo đổi tên) thì riêng phần đó hiện chữ đỏ, các phần khác vẫn gửi bình thường.
- Sửa `tracked-repos.md` thì không cần đụng vào script, vì sáng nào script cũng đọc lại file đó.
- Sửa `Code.gs` trong repo thì phải dán lại vào Apps Script. Script không tự lấy bản mới.
- Kiểm phần đọc file bằng Node: `node life/morning-brief/test.js`.
