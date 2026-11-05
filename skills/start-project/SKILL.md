---
name: start-project
description: Dùng khi thien bắt đầu một project mới, một repo mới chưa có AGENTS.md, hoặc khi thien nói "xem lại quy trình" hay vừa xong một milestone. Hỏi thien có áp quy trình chung không; chỉ áp khi thien đồng ý.
---

# Bắt đầu project với quy trình chung của thien

Nguồn duy nhất của quy trình là repo `github.com/thiengthb/thienai-workflow` (các file `PROFILE.md`, `AGENTS.template.md`, `STATUS.template.md`, `DECISION.template.md`). Skill này chỉ chỉ đường, không chứa luật.

## Khi bắt đầu project mới
1. Hỏi một câu, có lựa chọn: "Áp quy trình chung của bạn cho project này không? Có / Không / Chỉ dùng hồ sơ." Có thẻ quyết định thì dùng thẻ.
2. Thien chọn Không hoặc không trả lời: dừng, không hỏi lại trong project này.
3. Thien chọn "Chỉ dùng hồ sơ": đọc `PROFILE.md` và làm việc theo đó, không tạo file nào trong repo của project.
4. Thien chọn Có:
   - Đọc bốn file trong repo thienai-workflow.
   - Hỏi tối đa hai câu: project thuộc loại nào (web app, đồ án học thuật, BA, ghi chú...), repo nào.
   - Trong repo của project, qua một PR: tạo `AGENTS.md` (từ mẫu, thêm phần riêng của project), `docs/STATUS.md` (từ mẫu) và `docs/decisions/` (chép mẫu ghi quyết định vào).
   - Đưa thien đoạn sau để dán vào hướng dẫn của project (AI không tự sửa cài đặt được): "Project này theo quy trình thienai-workflow. Trước khi làm, đọc AGENTS.md và docs/STATUS.md trong repo <tên repo>."
   - Nếu lưu hồ sơ vào memory của project, ghi rõ đó là bản sao, bản gốc ở repo thienai-workflow.
5. Báo lại trong 3 dòng: đã tạo gì, PR nào, thien cần làm gì.

## Khi xem lại quy trình (hết milestone, hoặc thien yêu cầu)
1. Đọc lại hồ sơ và các lần thien phải nhắc lại hoặc chê trong milestone vừa qua.
2. Đề xuất tối đa 3 thay đổi cho `PROFILE.md` hoặc `AGENTS.template.md`, mỗi thay đổi kèm lý do và lý do mạnh nhất để không đổi.
3. Giữ giới hạn: `PROFILE.md` và phần chung của `AGENTS.template.md` mỗi file dưới 60 dòng. Thêm một ý thì bỏ hoặc gộp một ý khác.
4. Thien chọn cái nào, AI mở một PR vào repo thienai-workflow. Không tự sửa.
