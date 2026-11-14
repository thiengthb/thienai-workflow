# Review PR bằng Claude

Quyết định: [`docs/decisions/003-claude-as-reviewer.md`](../docs/decisions/003-claude-as-reviewer.md). Mỗi PR có hai lớp:
1. **Review trong phiên** (mặc định, mọi PR do AI mở): agent mới review trước khi PR chuyển sẵn sàng. CI chặn PR đã sẵn sàng mà mô tả thiếu mục `## Review`.
2. **`@claude` trên GitHub** (khi cần mắt độc lập): Claude GitHub Action chỉ chạy khi có người comment `@claude ...` trên PR. Dùng cho PR thien tự mở, hay lượt review lại sau một bản sửa lớn.

## Review trong phiên
1. PR còn nháp. Xong việc, test như CI qua, nhánh đã đẩy.
2. Gọi **một agent mới** (subagent, không phải fork, không kèm lịch sử phiên), đưa đúng đoạn dưới, thay `<repo>`, `<nhánh>`, `<số PR>`. Không kể cho agent đã làm gì hay vì sao, để nó đọc như người ngoài.
3. Sửa từng ý đúng; ý không sửa thì ghi lý do. Sửa lớn (đổi logic khác chỗ được chỉ, thêm file hay hàm mới) thì gọi agent mới khác review lại phần sửa.
4. Ghi mục `## Review` vào mô tả PR (mẫu dưới), rồi mới chuyển sẵn sàng và báo thien.
5. Nick sắp hết usage: ghi sổ bàn giao "chưa review" trước khi gọi agent, vì lượt review có thể bị cắt giữa chừng.

```text
Bạn review một pull request, như một người ngoài đọc lần đầu. Repo <repo>, nhánh <nhánh>, PR #<số PR>.
Lấy diff: git fetch origin main && git diff origin/main...HEAD (chạy trong thư mục repo).
Đọc luật của repo trước: AGENTS.md, CLAUDE.md (nếu có), và file luật chúng trỏ tới khi diff đụng tới.
Tìm, theo thứ tự ưu tiên: (1) mất dữ liệu, ghi đè việc của người khác, lộ dữ liệu giữa người dùng, secret;
(2) sai logic, lỗi bị nuốt, script báo thành công khi chưa kiểm gì, test không chạy tới phép kiểm;
(3) phá luật của repo; (4) truy cập (bàn phím, tương phản) nếu có giao diện; (5) link hỏng, tài liệu nói khác code.
Bỏ qua gu văn phong và đổi tên cho đẹp. Chạy thử khi nghi ngờ thay vì đoán.
Trả về tối đa 10 ý, mỗi ý: mức (Nặng/Vừa/Nhẹ), file:dòng, chuyện gì xảy ra với đầu vào cụ thể nào, cách sửa.
Không có gì đáng nêu thì nói rõ đã đọc những file nào. Viết tiếng Việt. Không sửa file, không đẩy, không comment lên GitHub.
```

## Mẫu mục Review trong mô tả PR
```markdown
## Review
- Ai: agent mới trong phiên (<model>), <ngày>. Lượt 2 nếu có: <ai, vì sao>.
- Đã sửa: <ý> (<commit>), ...
- Không sửa: <ý>, vì <lý do>. Hoặc "không có".
```
PR chỉ đổi `docs/STATUS.md` hay nhật ký học được ghi `- Bỏ qua: <lý do>`; CI chấp nhận miễn mục không trống.

## `@claude` trên GitHub
- Comment trên PR: `@claude review PR này theo profile/REVIEW.md của thienai-workflow, mục Review trong phiên` (hay một yêu cầu cụ thể hơn).
- Chạy bằng token gói Claude của một nick (secret `CLAUDE_CODE_OAUTH_TOKEN`), trừ vào usage của nick đó; nick đó hết usage thì lượt chạy báo lỗi, không chặn merge.
- Chỉ người có quyền ghi vào repo gọi được. Không có lượt chạy tự động, nên không tốn phút Actions khi không ai gọi.
- Comment của AI đăng bằng tài khoản của thien, nên AI không viết chữ `@claude` trong comment trừ khi muốn gọi; nói về nó thì viết "lệnh gọi Claude".
- Cài một lần mỗi repo: app [Claude](https://github.com/apps/claude) và secret `CLAUDE_CODE_OAUTH_TOKEN` (Settings > Secrets and variables > Actions), tạo bằng `claude setup-token` trên laptop.
