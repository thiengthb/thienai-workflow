# 001. Tự bàn giao việc khi một nick Claude hết usage

Ngày: 2026-11-14 · Trạng thái: Đã chọn · Người quyết: thien

## Cần quyết gì
thien dùng nhiều nick Claude. Một nick hết usage (phiên hay tuần) giữa chừng thì nick khác chỉ cần nghe "tiếp tục" là làm tiếp được, kể cả khi việc đang dừng ở bước chờ thien chọn trên một artifact. Phần sổ bàn giao làm giống nhau ở mọi phương án; cái cần chọn là cách giữ artifact khi đổi nick.

## Phần chung cho mọi phương án
- **Sổ bàn giao**: nhánh `handoff` trong repo của từng project, mỗi việc dở một file `tasks/<slug>.md`: repo, nhánh hay PR, đang ở bước nào, bước tiếp theo cụ thể, artifact đang chờ (link, file nguồn, `publish.json`, đang hỏi thien gì), nick nào ghi, lúc nào. Nhánh này không bao giờ merge vào main, AI đẩy thẳng không qua PR, nên không phải chờ thien.
- **Ghi liên tục**: không có tín hiệu nào báo trước là sắp hết usage [Fact: claude.ai và phiên cloud không có hook như vậy]. Nên AI ghi sổ và đẩy nhánh làm việc ngay sau mỗi bước, và ngay sau mỗi lần đăng artifact chờ thien. Hết usage giữa chừng thì mất nhiều nhất một bước.
- **Luật "tiếp tục"** trong phần chung của AGENTS (tự đồng bộ sang mọi repo): đọc nhánh `handoff`, liệt kê việc dở mới nhất trước, làm tiếp từ "bước tiếp theo". Việc dừng ở bước chọn thì đưa thien link trang để chọn.
- **Một lần cho mỗi nick**: project của nick đó gắn repo thienai-workflow (và repo đang làm), thêm một dòng vào ô hướng dẫn cho Claude.

## Giới hạn nói thẳng
- Nick mới không đọc được chat, thread hay memory của nick cũ. Nó chỉ biết cái đã ghi vào repo.
- Chỉ việc làm trong Project có gắn repo (có quyền đẩy) mới tự bàn giao được. Chat thường trên claude.ai không tự ghi được [Suy luận: connector GitHub ở chat chỉ để đọc].
- Trang của nick A mở bằng nick B (khi được mời) thì phần dùng Claude trên trang (hỏi Claude, Gửi cho Claude, Claude chấm) không chạy [Fact: trang Share artifacts của Anthropic].

## Các phương án đã xét
| Phương án | Lúc nào nó là lựa chọn tốt | Lý do mạnh nhất để không chọn |
|---|---|---|
| 0. Như hiện nay: ghi STATUS cuối phiên | Không bao giờ hết usage giữa chừng | Hết usage thì không có "cuối phiên", việc dở mất hẳn |
| A. Sổ bàn giao, nick mới đăng lại trang từ repo | Muốn không phải cài gì | Link trang đổi mỗi lần đổi nick; lựa chọn đã bấm mà chưa gửi thì phải bấm lại |
| B. A, cộng mời các nick khác vào những trang link cố định | Có vài trang dùng lâu (tổng quan, ôn thẻ) cần giữ một link | Mỗi trang cố định thien phải bấm Share mời một lần; trang có phần Claude thì phần đó không chạy ở nick được mời |
| C. A, cộng Cloudflare Pages và Worker | Muốn một link mở được ở mọi nick, mọi trình duyệt, và lựa chọn lưu chung | Cài khoảng 45 phút, giữ token, mất phần dùng Claude trên trang; thien đã gác ý này ngày 2026-11-12 |

## thien chọn
A, trên trang chọn phương án https://claude.ai/artifact/9SNTkS9pFjKfqA7vhH486B (2026-11-14 10:07 UTC), không ghi chú.

## AI chọn
B. Phần lớn giá trị nằm ở sổ bàn giao, có ở mọi phương án. Trang chọn phương án đăng lại chỉ mất vài giây và bấm lại một lựa chọn là đủ, nên không đáng dựng Cloudflare. Nhưng trang tổng quan đang kẹt ở nick khác (chỉ nick đó đăng đè được), nên mời các nick vào vài trang cố định là chữa đúng chỗ đau với một lần bấm cho mỗi trang.

## Kết luận
Làm bản A: sổ bàn giao trên nhánh `handoff` của từng repo, lệnh `templates/handoff.mjs`, luật ở `profile/HANDOFF.md` và phần chung của AGENTS. Trang chờ thien được dựng lại từ nguồn trong repo khi đổi nick.

Khác với AI ở chỗ: AI chọn B vì trang tổng quan đang chỉ đăng đè được từ nick khác. Với A, nick nào cũng đăng lại được trang tổng quan, chỉ là ra link mới. Nếu sau này đổi link thấy phiền thì thêm phần mời nick của B, không phải sửa gì ở A.

## Tóm tắt bằng lời của thien
<thien tự viết, hoặc "bỏ qua">

## Đã đổi
- 2026-11-14: ban đầu một sổ chung ở thienai-workflow. thien hỏi project sakubun làm sao biết, và ghi ở hai nơi có thành hai nguồn sự thật không. Đổi thành mỗi repo giữ sổ của mình, `list` đọc mọi repo trong `life/tracked-repos.md`; thêm luật sổ chỉ là dấu trang, lệch thì repo thắng.
