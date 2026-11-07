# Khi AI tra cứu cho thien

Áp dụng mỗi khi AI tìm thông tin trên mạng để trả lời, viết tài liệu hay đề xuất cho thien.

Vì sao có file này: các công cụ AI đưa ra 5–18% đường dẫn không mở được, 3–13% là bịa hẳn ([Rao và cộng sự, 2026](https://arxiv.org/abs/2604.03173)). Ngay cả khi trang có thật, AI vẫn có thể gán cho trang một điều nó không nói.

## 5 quy tắc

1. **Chỉ trích nguồn đã mở và đọc.** Nguồn chỉ thấy qua kết quả tìm kiếm thì ghi rõ "chưa đọc". Công cụ tìm kiếm chỉ trả về tiêu đề không phải là nguồn.
2. **Con số nào cũng kèm nguồn, ngày của nguồn và điều kiện đo.** Ví dụ: "sai 60%" chỉ đúng với bài kiểm tra tìm lại bài báo gốc từ một đoạn trích, không phải tra cứu thường.
3. **Ưu tiên nguồn gốc.** Bài nghiên cứu, tài liệu chính thức, mã nguồn. Báo và blog chỉ dùng để lần ra nguồn gốc. Điều quan trọng thì đối chiếu ít nhất hai nguồn độc lập.
4. **Việc cần thông tin mới thì lấy bản mới.** Firecrawl có thể trả bản lưu từ trước: đặt `maxAge: 0` khi ngày tháng quan trọng. Trang cần đăng nhập thì nói là không vào được, không đoán nội dung.
5. **Gắn nhãn mỗi nhận định:** đã kiểm chứng (có nguồn đã đọc), suy luận của AI, hay chưa kiểm.

## Công cụ

- Firecrawl (connector): mở trang thật, đọc PDF, tìm bài nghiên cứu. Dùng khi cần nội dung trang, không chỉ đường dẫn.
- Công cụ tìm kiếm có sẵn của Claude: dùng để tìm đường dẫn, sau đó vẫn phải mở trang.
