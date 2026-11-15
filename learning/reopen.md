# Mở lại bài cũ ở nick đang dùng

Đọc khi thien nhắn "mở lại bài …". Để riêng file này cho luồng "học" khỏi dài thêm (`docs/plans/2026-11-15-lean-learning.md`).

Trang đăng ở nick nào thì chỉ nick đó mở được. Muốn xem lại một bài mà không đổi nick, thien nhắn "mở lại bài <môn> <buổi>" ở nick đang dùng:
1. AI tìm trong Artifact của nick này trước (`list_artifacts` với tên bài). Có rồi thì đưa link đó, không đăng thêm.
2. Chưa có thì dựng từ nguồn trong repo: `node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html --no-check --ack-open` rồi đăng bản trong `build/` theo `publish.json`, kèm khai báo `capabilities`. Trang khung cũ (trước 2026-11-14, không có thẻ `kit-js`) thì đăng thẳng file nguồn.
3. Trả link kèm tên nick. Không ghi link này vào repo: link chỉ dùng được ở nick đó, và Artifact của nick vẫn tìm lại được. Kết quả làm lại ở trang mới nằm trong db của trang mới; muốn ghi vào nhật ký thì thien bấm gửi như buổi thường.

Chỉ cần đọc, không cần lưu kết quả hay hỏi Claude: chủ trang mở Share, mời email của nick khác (beta, quyền "Can view"). Người được mời từ tài khoản khác không dùng được phần hỏi Claude và không ghi được kết quả ([Share artifacts](https://support.claude.com/en/articles/9547008-share-artifacts)).
