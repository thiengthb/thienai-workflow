# Hướng dẫn review cho repo thienai-workflow

Viết mọi góp ý bằng tiếng Việt tự nhiên. Tên hàm, tên file, lệnh giữ nguyên tiếng Anh.

## Repo này là gì
Bộ quy trình làm việc giữa thien và AI: luật (`AGENTS.md`, `templates/AGENTS.template.md`, `profile/`), script Node không phụ thuộc (`templates/*.mjs`, `artifacts/**/*.mjs`, `.github/scripts/`), và trang học HTML tự chứa (`learning/**/pages/*.html`, `artifacts/`).

## Ưu tiên khi review
1. Mất dữ liệu hay ghi đè việc của người khác: lệnh git chạm vào thư mục làm việc (`reset --hard`, `checkout -f`, xoá file), ghi đè sổ bàn giao, đẩy nhầm nhánh.
2. Script báo thành công khi chưa kiểm gì: lỗi bị nuốt, `catch` rỗng làm kết quả "ổn" sai, test không chạy tới phép kiểm.
3. Trang học: nút không bấm được bằng bàn phím, chữ khó đọc, trạng thái lưu nháp và mở lại sai.
4. Luật mâu thuẫn nhau giữa `AGENTS.md`, `templates/AGENTS.template.md` và `profile/`; link hỏng.

## Không cần góp ý
- Văn phong tiếng Việt trong tài liệu (đã có `profile/VOICE.md`), trừ khi câu sai nghĩa.
- Đổi sang thư viện ngoài: script cố ý không có phụ thuộc.
- Trang trong `learning/**/pages/` đã học xong: giữ nguyên như lúc học, không đề nghị sửa lại.

## Giới hạn đã biết
- `docs/STATUS.md` tối đa 40 dòng, tối đa 3 việc chờ thien.
- Phần chung của `templates/AGENTS.template.md` dưới 60 dòng.
