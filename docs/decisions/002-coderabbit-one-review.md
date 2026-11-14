# 002. CodeRabbit review một lần mỗi PR, khi PR đã sẵn sàng

Ngày: 2026-11-14 · Trạng thái: Đã chọn · Người quyết: thien

## Cần quyết gì
CodeRabbit (bot review PR) bắt được nhiều lỗi thật, nhưng mỗi lần đẩy nó review mất 5–11 phút, gần gấp đôi thời gian CI (khoảng 4 phút). AI chờ review xong mới báo thien, rồi sửa xong lại phải chờ thêm một vòng, nên thien thấy AI làm chậm đi. Luật bàn giao mới (đẩy nhánh sau mỗi bước, PR #62) còn làm số lần đẩy tăng lên.

## Số liệu (PR #50 đến #65, lấy bằng GitHub API ngày 2026-11-14)
- Góp ý của CodeRabbit phần lớn dẫn tới sửa code: #53 (11/12 góp ý được sửa), #59 (gần hết, mấy ý còn lại có giải thích vì sao giữ nguyên), #62 (7/7), #63 (6 ý đã sửa, 3 ý chưa trả lời vì PR còn mở), #65 (8/9). Có những lỗi test chưa bắt: ở #62, lệnh sổ bàn giao có thể `reset --hard` lên chính thư mục làm việc, làm mất code chưa commit; ở #65, link tải trong `profile/SETUP.md` bị cắt hỏng.
- Thời gian một lượt review: 5–11 phút. Một PR có thể chịu 2–3 lượt, vì mỗi lần đẩy bản sửa lại có một lượt mới.
- PR #52, #55, #57, #61 được merge trước khi review xong, nên không có góp ý nào. #61 đổi lõi tự lưu (828 dòng) mà không được review.
- PR có nhiều lần đẩy liên tiếp thì CodeRabbit tự dừng review (#53: "Reviews paused").

## Các phương án đã xét
| Phương án | Lúc nào nó là lựa chọn tốt | Lý do mạnh nhất để không chọn |
|---|---|---|
| A. Giữ như cũ: review mỗi lần đẩy, AI chờ xong mới báo | Không vội, PR ít lần đẩy | Chậm nhất. Luật bàn giao đẩy sau mỗi bước thì gần như lần đẩy nào cũng bị review, tốn lượt và dễ bị dừng review |
| B. PR nháp trong lúc làm, review một lần khi sẵn sàng; sửa lớn mới gọi review lại | Muốn giữ phần lớn lỗi bot bắt được mà chỉ chờ một lượt mỗi PR | Bản sửa nhỏ sau review không được soi lại. Ở #62, vòng hai từng bắt thêm một lỗi nặng (ghi đè sổ bằng bản cũ) |
| C. Không chờ: CI xanh là báo merge, góp ý đến sau thì sửa ở PR sau | Việc gấp, thay đổi nhỏ, dễ hoàn tác | Như #61: có PR vào main mà chưa ai soi, lỗi nằm trên main tới PR sau |
| D. Bỏ CodeRabbit, chỉ dựa vào test và CI | Repo nhỏ, test phủ kín | Mất hẳn những lỗi test chưa nghĩ tới, như vụ `reset --hard` ở #62 |

## thien chọn
Bỏ qua bước này: thien nhờ AI chọn ("theo bạn cái nào ổn nhất"), 2026-11-14.

## AI chọn
B. Lượt review đầu tiên trên một PR đã hoàn chỉnh bắt được phần lớn lỗi, nên chỉ cần chờ một lượt mỗi PR thay vì 2–3. PR nháp làm luật bàn giao (đẩy sau mỗi bước) không còn sinh ra lượt review cho bản làm dở. Chỗ yếu của B (bản sửa sau review không được soi lại) được bù một phần bằng luật: bản sửa lớn thì gọi review lại. C và D bỏ đi đúng loại lỗi đáng giá nhất mà số liệu cho thấy.

## Kết luận
Làm B:
- `.coderabbit.yaml`: không review PR nháp (`drafts: false`, vốn là mặc định), không tự review lại sau mỗi lần đẩy (`auto_incremental_review: false`), bỏ qua nhật ký học, thẻ ôn, lộ trình và số liệu dùng tính năng trong `learning/`.
- Cách làm PR ghi ở `AGENTS.md`, mục "Sửa repo":
  1. Mở PR ở dạng nháp.
  2. Xong và test như CI qua thì chuyển sang sẵn sàng. CodeRabbit tự review một lần [đã kiểm ở PR #66: chuyển sẵn sàng lúc 13:18 UTC, review chạy ngay, xong sau 3,5 phút]. Không comment `@coderabbitai review` thêm, vì sẽ thành hai lượt cho cùng một bản (góp ý của CodeRabbit ở PR #66). Chỉ gọi tay khi 2 phút sau vẫn chưa thấy check CodeRabbit chạy.
  3. Chờ đúng một lượt, sửa hay trả lời từng ý, rồi báo thien. Bản sửa lớn (đổi logic khác chỗ bot chỉ, thêm file hay hàm mới) thì gọi review lại; sửa nhỏ đúng chỗ bot chỉ thì không cần.
- Áp ở thienai-workflow và sakubun (sakubun qua PR riêng). Luật nằm ở phần chung của `templates/AGENTS.template.md` (dòng "Repo có bot review"), chỉ có hiệu lực ở repo có `.coderabbit.yaml`.
- Gemini Code Assist: bỏ. AI đề xuất dựa trên bài viết năm 2025 mà không kiểm lại, thien cài ngày 2026-11-14. CodeRabbit chỉ ra (PR #66) và AI đã kiểm: bản miễn phí trên GitHub ngừng cài từ 2026-06-18 và tắt hẳn từ 2026-07-17 (trang Deprecations của Google). Bản enterprise vẫn chạy nhưng phải cài qua Google Cloud, đang Preview, và Google đang chuyển người dùng sang Antigravity, nên không chọn.
- Còn lại để chọn trước 2026-11-24 (thien ưu tiên miễn phí): CodeRabbit CLI của gói Free (3 lần mỗi giờ, AI chạy trong phiên trước khi chuyển PR sẵn sàng) [chưa kiểm: chạy không cần trình duyệt phải dùng Agentic API key, và tài liệu bảo bật Usage-based add-on]; AI tự review bằng một agent mới (không tốn tiền, tốn usage Claude); Codex review nếu thien đã có ChatGPT Plus; Qodo Merge miễn phí 75 lượt mỗi tháng (không đủ cho mọi PR).
- Gói CodeRabbit của thien [đã kiểm, ảnh trang Billing thien gửi 2026-11-14]: dùng thử Advanced, hết hạn 2026-11-24, sau đó tự về gói Free và không bị tính tiền. Gói Free chỉ tóm tắt PR, không review code trên PR (theo trang Plans của CodeRabbit). thien ưu tiên miễn phí, nên trước 2026-11-24 phải chọn công cụ thay. Repo này có 66 PR trong khoảng 10 ngày, nên công cụ thay phải chịu được vài PR mỗi ngày.

## Xem lại khi
- Trước 2026-11-24 (CodeRabbit hết dùng thử): chọn công cụ review thay thế trong các lựa chọn ở mục Kết luận.
- Mốc 2026-11-22. Đếm số lỗi phát hiện sau merge mà một vòng review lại có thể bắt được. Từ 2 lỗi trở lên thì cân nhắc quay về A cho PR đổi lõi dùng chung (`artifacts/kit/`, `templates/`).

## Tóm tắt bằng lời của thien
<thien tự viết, hoặc "bỏ qua">
