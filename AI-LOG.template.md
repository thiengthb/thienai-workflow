# Nhật ký dùng AI

Dùng cho đồ án, bài môn học, hoặc project nhóm cần khai báo AI. Chép vào `docs/ai-log.md` của project.

Khuôn này lấy từ yêu cầu của các môn FPT gần đây (MLN122, PRM323, PRM393): khai báo công cụ, ghi từng lần dùng, người kiểm gì, quyết định có lý do, bằng chứng. Môn nào có mẫu riêng thì theo mẫu của môn, giữ các cột dưới đây nếu mẫu đó thiếu.

## Khai báo công cụ

| Công cụ | Tài khoản của ai | Dùng vào việc gì | Không dùng vào việc gì |
|---|---|---|---|
| Claude | ... | ... | Ví dụ: không dùng để giả lập người dùng, không trả lời phần hỏi đáp |

## Nhật ký

| Mã | Ngày | Người | Công cụ | Việc | Prompt chính hoặc link phiên | Kết quả AI | Người kiểm gì | Quyết định | Bằng chứng |
|---|---|---|---|---|---|---|---|---|---|
| AI-01 | | | | | | | | | |

- **AI điền** mọi cột trừ "Người kiểm gì" và "Quyết định", cuối mỗi phiên, một dòng cho mỗi việc đáng kể.
- **Người điền** hai cột còn lại. "Người kiểm gì": kiểm cụ thể cái gì, bằng cách nào (đọc lại nguồn gốc, chạy test, so với đề). "Quyết định": Accept, Modify hoặc Reject, kèm một câu lý do.
- AI không tự điền hai cột đó, kể cả khi được nhờ. Dòng nào còn trống hai cột này thì chưa được coi là xong.
- "Bằng chứng": commit, PR, ảnh, hoặc link phiên chat.

## Vì sao người phải tự điền
Cột kiểm chứng là thứ giảng viên chấm: dùng AI mà không kiểm hoặc không giải thích được thì bị điểm 0 phần đó (MLN122). Nhật ký dài mà cột này trống còn tệ hơn không có nhật ký, vì nó cho thấy AI làm hết.
