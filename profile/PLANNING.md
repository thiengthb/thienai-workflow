# Khi AI lập kế hoạch và theo dõi kế hoạch

Áp dụng cho mọi kế hoạch thien đã duyệt (tính năng, nghiên cứu, sửa quy trình), ở mọi project, tài khoản, model. Lộ trình học không nằm ở đây: nó ở `learning/roadmap.md`.

## Vì sao có file này

- thien đọc và duyệt kế hoạch xong thì không biết nó đang chạy tới đâu. Checklist trong thread chỉ thấy khi mở đúng thread, và mất khi thread bắt đầu việc mới. Thread hết usage giữa chừng còn bị hiện là "lỗi" dù việc đã xong (thread "Nhắc việc dở", 2026-11-12). Nên phải có một file kế hoạch nằm trong repo, là chỗ duy nhất đúng.
- Anthropic thấy Claude làm việc dài qua nhiều phiên hay mắc 3 lỗi: làm quá nhiều một lúc rồi bỏ dở không ghi lại, tưởng đã xong cả việc khi mới xong một phần, và đánh dấu xong khi chưa kiểm hết. Cách sửa của họ: một danh sách việc có ô đạt hay chưa, một file tiến độ đọc đầu mỗi phiên, làm từng việc một, chỉ đánh dấu đạt sau khi kiểm như người dùng thật ([Anthropic, 2025](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents), đã đọc 2026-11-12).
- Việc chưa xong cứ lởn vởn trong đầu và làm giảm sức tập trung cho việc khác. Chỉ cần viết ra một kế hoạch cụ thể cho việc đó là hết, dù chưa làm ([Masicampo và Baumeister, 2011](https://pubmed.ncbi.nlm.nih.gov/21688924/), đã đọc tóm tắt). Nên mỗi việc dở phải có dòng "bước tiếp theo" rõ ràng, để thien yên tâm bỏ qua.
- Mẫu kế hoạch chuẩn có những mục mà kế hoạch của AI hay thiếu: việc không làm (design doc của Google: thứ có thể là mục tiêu nhưng chủ động không chọn, [Ubl, 2020](https://www.industrialempathy.com/posts/design-docs-at-google/), đã đọc đoạn trích), thời gian chịu bỏ ra và chỗ dễ sa lầy (Shape Up, [Basecamp](https://basecamp.com/shapeup/3.4-chapter-13), đã đọc đoạn trích).

## Kế hoạch khi gửi thien duyệt

1. **Mục tiêu** một hai câu, bằng lời của thien nếu có.
2. **Không làm:** những thứ nghe hợp lý nhưng lần này không làm.
3. **Các phương án đã xét**, mỗi cái kèm lý do mạnh nhất để không chọn (luật ở `PROFILE.md`).
4. **Checkpoint**, mỗi cái ghi **xong khi** thien kiểm được bằng mắt hoặc tay: "thien mở trang trên điện thoại thấy được X", không phải "AI đã viết xong".
5. **Thời gian dự kiến** tính bằng số phiên hoặc số tin nhắn của thien, và **chỗ dễ sa lầy**.
6. **Câu hỏi** chỉ những câu mà câu trả lời làm đổi việc. Mỗi câu có sẵn đề xuất, để thien trả lời "ok" là chạy được.

## Sau khi thien duyệt

- Ngay trong phiên đó, ghi kế hoạch vào `docs/plans/<ngày>-<tên-tiếng-anh>.md` theo `templates/PLAN.template.md`, và thêm một dòng vào bảng "Kế hoạch đang chạy" của `docs/STATUS.md`. Project không có repo thì ghi vào memory của project.
- Ghi vào file kế hoạch trong cùng PR với việc đang làm, không mở PR riêng chỉ để tick.
- **Tick** một việc khi đã có bằng chứng: PR đã merge, test chạy, thien đã thử. PR còn mở thì để trống và ghi "(chờ merge PR #…)".
- **Đổi bước** so với bản đã duyệt: thêm một dòng vào bảng "Đã đổi" (đổi gì, vì sao), và nói thien một câu trong tin nhắn kế tiếp. Đổi cả mục tiêu thì phải hỏi trước.
- **Lỗi** làm mất hơn khoảng 10 phút, hoặc lỗi thien đã nhìn thấy: thêm một dòng vào bảng "Lỗi gặp", kèm đã xử lý thế nào.
- **Cuối mỗi phiên** sửa mục "Đang ở đâu" ở đầu file: đang ở checkpoint nào, còn thiếu gì, thien cần làm gì. Ba dòng, không hơn.
- Xong hay bỏ kế hoạch: đổi trạng thái ở đầu file, xoá dòng trong bảng của STATUS. File giữ lại làm lịch sử.

## Trang tiến độ

- Mỗi repo có một trang tiến độ, và có một trang tổng quan cho các repo trong `life/tracked-repos.md`. Trang sinh ra từ `docs/STATUS.md` và `docs/plans/` bằng `templates/progress-page.mjs`; một lệnh `node templates/publish-progress.mjs overview|repo|roadmap` dựng lại và ghi `publish.json` để AI đăng đè đúng trang cũ. Link trang ghi ở dòng đầu `docs/STATUS.md`. Trang tổng quan đăng kèm `capabilities: {"db": {}}` để ô tick của thien lưu được; trước khi sửa STATUS, AI đọc db `ticks/overview` của trang đó (việc thien đã tick), kiểm lại rồi bỏ việc đã xong.
- Sửa STATUS hay file kế hoạch thì cuối phiên chạy lại script và đăng lại trang. Tài khoản khác hoặc Codex không đăng lại được thì thôi, chỉ cần sửa file; trang có ghi giờ lấy dữ liệu để thien biết trang cũ tới đâu.
