# Các hành động giữa thien và AI còn thiếu luật

Trạng thái: đang chạy · Duyệt: 2026-11-17 · Cập nhật: 2026-11-17 · nick tnt697 · Báo cáo gốc: [Rà soát quy trình làm việc thien và Claude](https://claude.ai/artifact/PWo1UdCofcZ49baViSbe6Q) (mở ở nick tnt697)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đợt 1 trong PR này (merge sau PR #103).
- Còn thiếu: kiểm đợt 1 ở 3 chat kế tiếp; đợt 2 cùng buổi học kế tiếp; đợt 3 ở mốc 2026-12-01.
- thien cần làm: merge PR #103 rồi PR này; chọn một trong hai câu mẫu báo cáo ở mô tả PR.

## Mục tiêu
Những gì thien nói với AI (chê, khen, chọn, giao việc) đi tới đúng file và được làm, mà thien không phải nhắc lại hay duyệt thêm.

## Đã biết (chi tiết và nguồn ở báo cáo gốc)
- Quy trình có 32 hành động giữa thien và AI: 7 thien đã nêu, 18 đã làm mà thien chưa nêu, 7 chưa có luật. Bốn cái xảy ra hằng ngày mà chưa có luật: ủy quyền, nhận việc, báo cáo khi xong việc, gom góp ý.
- Luật có lệnh kiểm thì được làm (STATUS, nhật ký buổi học, link nội bộ, trang học); luật chỉ ghi chữ thì trôi: `glossary.md` một lần sửa (08/11), `SKILL-LEVEL.md` chưa chấm lại từ 05/11, `taste.md` của thienui không đổi từ 07/11, 3/3 quyết định để trống phần tóm tắt của thien.
- Luật "mỗi milestone" không có ngày nên không bao giờ tới lượt; luật có ngày (22/11, 01/12, 13/12) thì nằm trong STATUS và kế hoạch.

## Không làm
- Không sửa những gì kế hoạch [`2026-11-17-workflow-review.md`](2026-11-17-workflow-review.md) đã nhận: khởi động, đường beta, nhắc việc dở, ngưỡng đổi chat, tự động hoá phần học.
- Không thêm script mới; chỉ sửa `after-lesson.mjs` có sẵn.
- Không đổi khung 7 bước của buổi học.
- Không dựng quy trình làm việc nhóm trước khi capstone bắt đầu.
- Không thêm luật mới từ sau đợt 2 tới 2026-12-01, trừ khi có lỗi thật chặn việc (thien chọn 2026-11-17).

## Các phương án đã xét
| Phương án | Lý do mạnh nhất để không chọn |
|---|---|
| Làm hết trong một PR lớn | Vượt luật 3 thay đổi, đụng file của PR đang mở và của đợt 5 kế hoạch review |
| Chỉ dọn luật trùng, không thêm hành động | Việc nhắn "merge giúp mình" và góp ý bị trôi vẫn còn mỗi ngày |
| Mỗi hành động một skill | Ba hành động này ngắn và xảy ra ở mọi chat; skill phải tải lên 3 nick |
| Ba đợt nhỏ, đợt 3 gộp vào mốc 01/12 (chọn) | Chậm: tới 13/12 mới xong hết |

## Checkpoint

### 0. thien đọc và chọn
Xong khi: thien trả lời 4 câu hỏi của báo cáo và PR #102 đã merge.
- [x] thien trả lời "ok" cho cả 4 câu (2026-11-17 15:35): nhánh cải thiện workflow là kế hoạch review; ủy quyền merge như đề xuất; ngừng thêm luật sau đợt 2 tới 01/12; gu từ buổi học gom 2 tuần một PR vào thienui
- [x] PR #102 merge (2026-11-17)
- [x] Ghi kế hoạch này và dòng ở STATUS (PR này, chờ merge)

### 1. Ủy quyền, nhận việc, báo cáo
Xong khi: ở 3 chat kế tiếp có PR thuộc dòng đầu của `profile/DELEGATION.md`, thien không phải nhắn "merge giúp mình"; tin cuối của mỗi chat có đủ kết quả, việc thien cần làm, việc tiếp theo; thien đọc bộ tình huống dưới thấy mỗi ca ra đúng một hành vi.
- [ ] `profile/DELEGATION.md`; `AGENTS.md` mục Sửa repo trỏ tới nó; một dòng ở `profile/MAP.md` (chờ merge PR này)
- [ ] `profile/CHATS.md` mục Đầu chat: dòng mục tiêu ba phần cho việc nhiều bước, chỉ hỏi lại khi câu trả lời đổi thứ sẽ ra (chờ merge PR này)
- [ ] `profile/VOICE.md` mục "Báo cáo khi xong việc"; `PROFILE.md` (bản tóm tắt 2 phút) và `skills/start-project/STEPS.md` trỏ tới mục đó (chờ merge PR này)
- [ ] thien chọn một câu mẫu báo cáo, thêm vào bảng câu mẫu của `VOICE.md`
- [ ] Kiểm ở 3 chat kế tiếp

### 2. Đường chảy cho góp ý (cùng buổi học kế tiếp)
Xong khi: PR sau buổi kế tiếp có dòng bảng thuật ngữ (hay "không có từ mới") và câu gu đã vào hàng chờ của thienui; bỏ một trong hai thì `after-lesson --check` báo thiếu; thien mở `taste.md` thấy mục "Đang thử" có gu từ các buổi frontend.
- [ ] `after-lesson.mjs`: in câu gu của buổi và nơi ghi; `--check` đòi file bài có dòng "Từ mới:" và các từ đó có trong `glossary.md`. Ghi một dòng vào "Đã đổi" của [`2026-11-15-lean-learning.md`](2026-11-15-lean-learning.md) để checkpoint 4 ở đó giữ phần kiểm này
- [ ] `learning/README.md` mục Sau buổi thêm bước "từ mới vào bảng thuật ngữ, câu gu vào hàng chờ thienui"; `profile/MAP.md` thêm dòng "Góp ý của thien" trỏ bảng file đích
- [ ] Bù một lần: từ mới của 18 buổi vào `glossary.md`; gu từ nhật ký frontend 1–9 vào `taste.md` mục "Đang thử" qua một PR vào thienui (thien duyệt từng dòng)
- [ ] Trước buổi BA 5: sửa lỗi tên trục đè thẻ ở lưới 2×2 (PR kit riêng)

### 3. Cho luật "mỗi milestone" một ngày thật (mốc 2026-12-01)
Xong khi: STATUS có hai mốc 01/12 và 13/12, mỗi mốc kèm danh sách việc; thien duyệt luật "3 thay đổi" mới; `SKILL-LEVEL.md` có ngày chấm mới sau 13/12.
- [ ] `README.md` mục Sửa quy trình: milestone là các mốc ghi trong STATUS; "tối đa 3 luật mới mỗi mốc, sửa chỗ ghi sai không tính"
- [ ] Mốc 01/12 thêm: review code theo giai đoạn cho các PR sau 24/11 (phạm vi theo quyết định 003); câu hỏi "AI có đổi ý chỉ vì thien nói mạnh hơn không"; dọn luật ngôn ngữ về `VOICE.md`; skill `viet-de-hieu` vào repo hay bỏ; ba mức nghiên cứu và bảng công cụ trong `RESEARCH.md`; ghi lịch nhắc thứ Hai, thứ Năm (ở nick tnt628) vào `ACCOUNTS.md`; xem lại bảng ủy quyền. Gộp phần đụng mẫu AGENTS chung vào đợt 5 của kế hoạch review để chỉ sinh một PR đồng bộ
- [ ] Mốc 13/12: chấm lại `SKILL-LEVEL.md` (AI soạn từ nhật ký, thien duyệt)
- [ ] Trong vòng học sau 22/11: một buổi kiểu "Viết luật cho thienui"

Thời gian: đợt 1 một chat; đợt 2 một chat cộng một PR kit nhỏ, kiểm ở buổi học kế tiếp; đợt 3 một chat ngày 01/12, một chat ngắn ngày 13/12.

Chỗ dễ sa lầy: bảng ủy quyền phình thành danh sách từng trường hợp (giới hạn 8 vùng); kiểm "từ mới" phiền vì cứ phải ghi "không có" (sau 3 buổi đều "không có" thì bỏ kiểm đó); dọn luật ở đợt 3 trượt thành viết lại toàn bộ.

## Bộ tình huống mẫu (kiểm đợt 1 bằng cách đọc)
| Tình huống | Hành vi đúng | Luật quyết định |
|---|---|---|
| PR sau buổi chỉ sửa file trong `learning/` và STATUS, CI xanh, bot không còn góp ý chưa trả lời | AI tự merge, mô tả PR có dòng tự merge, báo một dòng | `DELEGATION.md` dòng 1 |
| PR sửa `artifacts/kit/` hay `profile/`, CI xanh | Báo thien, chờ thien merge hay nhắn "merge" | `DELEGATION.md` dòng 4 |
| thien nhắn "merge rồi nghiên cứu X" ở project bản cũ | Câu đầu: "Mục tiêu: … · Sẽ ra: … · Xong khi: …" kèm thứ tự (merge trước, nghiên cứu sau) | `CHATS.md` Đầu chat |
| Xong một PR sửa 5 file | Tin cuối có kết quả kèm link PR, việc thien cần làm (hay "Không có"), việc tiếp theo; không kể lại từng bước | `VOICE.md` Báo cáo khi xong việc |

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-17 | Dòng mục tiêu ba phần chỉ cho project bản cũ; mẫu báo cáo là nội dung phải có, không ép ba mục ở bản beta; bảng ủy quyền chỉ cho repo này; đợt 2 ghi một dòng vào kế hoạch học nhẹ dần | Ba chỗ chỉnh của nick tnt628 ở PR #103 (mục "Phối hợp với kế hoạch song song" của kế hoạch review) |
| 2026-11-17 | Bộ tình huống của đợt 1 để trong file này, không thêm vào kế hoạch review | File kế hoạch review đang được sửa ở PR #103 |
| 2026-11-17 | Lịch nhắc thứ Hai, thứ Năm: không còn là câu hỏi, chỉ cần ghi vào `ACCOUNTS.md` ở đợt 3 | Nick tnt628 xác nhận lịch nằm ở nick đó, vẫn chạy (lần gần nhất 2026-11-16) |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
| 2026-11-17 | Lần gắn repo đầu bị bộ duyệt quyền chặn vì tin mở đầu không có tên repo; báo cáo nháp đầu dựa trên bản đồng bộ knowledge chậm hơn main khoảng 2 ngày | thien cho phép gắn repo; viết lại báo cáo trên main `e83e308` |
