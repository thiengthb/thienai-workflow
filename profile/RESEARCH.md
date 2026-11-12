# Khi AI tra cứu cho thien

Áp dụng mỗi khi AI tìm thông tin trên mạng để trả lời, viết tài liệu hay đề xuất cho thien.

Vì sao có file này: các công cụ AI đưa ra 5–18% đường dẫn không mở được, 3–13% là bịa hẳn ([Rao và cộng sự, 2026](https://arxiv.org/abs/2604.03173)). Ngay cả khi trang có thật, AI vẫn có thể gán cho trang một điều nó không nói.

## 5 quy tắc

1. **Chỉ trích nguồn đã mở và đọc.** Nguồn chỉ thấy qua kết quả tìm kiếm thì ghi rõ "chưa đọc". Công cụ tìm kiếm chỉ trả về tiêu đề không phải là nguồn.
2. **Con số nào cũng kèm nguồn, ngày của nguồn và điều kiện đo.** Ví dụ: "sai 60%" chỉ đúng với bài kiểm tra tìm lại bài báo gốc từ một đoạn trích, không phải tra cứu thường.
3. **Ưu tiên nguồn gốc.** Bài nghiên cứu, tài liệu chính thức, mã nguồn. Báo và blog chỉ dùng để lần ra nguồn gốc. Điều quan trọng thì đối chiếu ít nhất hai nguồn độc lập.
4. **Việc cần thông tin mới thì lấy bản mới.** Firecrawl có thể trả bản lưu từ trước: đặt `maxAge: 0` khi ngày tháng quan trọng. Trang cần đăng nhập thì nói là không vào được, không đoán nội dung.
5. **Gắn nhãn mỗi nhận định:** đã kiểm chứng (có nguồn đã đọc), suy luận của AI, hay chưa kiểm.

Cuối mỗi bài nghiên cứu có danh sách nguồn đã đọc, kèm ngày đọc. Nguồn chỉ thấy qua đoạn trích thì để riêng.

## Chọn công cụ

| Cần gì | Dùng gì | Ghi chú |
|---|---|---|
| Tìm đường dẫn | Công cụ tìm kiếm có sẵn của Claude, hoặc tìm kiếm của Firecrawl | Tìm xong vẫn phải mở trang |
| Đọc nội dung một trang, PDF | Firecrawl (connector) | Free 1.000 credit mỗi tháng: 1 trang 1 credit, 10 kết quả tìm 2 credit (giá đọc 2026-11-07) |
| Chụp màn hình trang thật | Firecrawl (`formats: ["screenshot"]`, `mobile: true`) hoặc Playwright | Dùng cho buổi học và khi tự chê bố cục |
| Tài liệu thư viện khi code | Context7 (connector), nếu đã bật | Thay cho trí nhớ của model, vốn có thể cũ |
| Bài nghiên cứu | Công cụ tìm bài của Firecrawl | Đọc ít nhất phần tóm tắt, ghi rõ chỉ đọc tóm tắt hay cả bài |

- Thiếu công cụ cho việc đang làm thì nói ra và đề xuất cái cần thêm, kèm giá và giới hạn. Không đoán thay.
- Không thêm công cụ trùng việc với cái đã có: nhiều nguồn làm cùng một việc chỉ làm AI phân vân.
- Bảng này cũ đi khi đổi connector: bật hay bỏ một connector thì sửa bảng trong cùng PR.

## Khi thien hỏi "có nên thêm plugin, skill hay connector này không"

thien tự nhận hay bị FOMO khi thấy marketplace có nhiều thứ mới. AI (và thien) xét theo 4 câu, theo thứ tự, gặp câu nào trả lời "không" thì dừng ở đó và bỏ:

1. **Có việc đau thật không?** Trong 2 tuần qua có việc nào thien làm từ 2 lần trở lên mà thấy mệt, chậm hay hay quên không, và thứ này giải đúng việc đó? Chỉ "nghe hay" thì không tính.
2. **Đã có cái làm việc này chưa?** Xem bảng công cụ ở trên, `profile/TUTOR.md` (dạy học), memory của project và `docs/STATUS.md` (nhớ việc), skill trong `skills/`. Có rồi thì bỏ, vì hai thứ cùng làm một việc chỉ làm AI phân vân.
3. **Chạy được ở chỗ thien dùng không?** thien dùng Claude desktop và claude.ai, thỉnh thoảng Codex. Thứ chỉ chạy trong Claude Code (hook, lệnh `/`, statusline) hay cần MCP phải tự dựng thì bỏ.
4. **Ai làm và nó đụng tới gì?** Ưu tiên Anthropic hoặc đối tác. Plugin cộng đồng có quyền rộng (đọc mọi phiên, hook chạy mỗi lượt) thì chỉ cài khi câu 1 rất rõ.

Qua đủ 4 câu thì thử 1 tuần. Hết tuần không dùng tới thì gỡ. Thứ chưa qua câu 1 thì ghi một dòng vào cuối file này kèm ngày; 30 ngày sau không ai nhắc lại thì xoá dòng đó.

### Đã xét
| Ngày | Thứ đã xét | Kết luận | Vì sao |
|---|---|---|---|
| 2026-11-12 | Tutor, learning-tutor, Ágora Learning | Bỏ | Trùng `profile/TUTOR.md`, vốn đã chỉnh theo thien qua 10 buổi |
| 2026-11-12 | Cognee Memory, memory-agent, memory-toolkit, oak-memory, Exit Memory Update | Bỏ | Trùng memory của project và `docs/STATUS.md`; phần lớn dựa vào hook của Claude Code |
| 2026-11-12 | Productivity | Bỏ | Cần Notion, Asana, Slack; thien không dùng |
| 2026-11-12 | Design (Anthropic) | Giữ | Đã bật, dùng `accessibility-review` khi làm giao diện; các connector Slack, Notion đi kèm thì kệ |
