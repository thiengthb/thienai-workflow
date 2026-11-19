# KH8 · Đóng KH1–KH7, làm sớm buổi xem lại 01/12

Trạng thái: đang chạy · Duyệt: 2026-11-19 (thien: "ok, theo cả 10 đề xuất") · Cập nhật: 2026-11-19 · nick tnt697 · Chat: https://claude.ai/code/session_01WXAvBXnyzCdSkEXzr2kthH · Trang: https://claude.ai/artifact/AZyzE1wW6dwEvC758uDgna (nick tnt697)

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: checkpoint 1 xong (20:40, ok cả 10 đề xuất); đang làm checkpoint 2 (PR luật, PR mã) và 3.
- Còn thiếu: PR luật và PR mã cho thien merge; đóng bảy kế hoạch.
- thien cần làm: merge hai PR khi báo.

## Mục tiêu
Đóng cả bảy kế hoạch đang chạy trong một đợt: việc còn làm được thì làm, phần cần số đo thật thì ghi "thien quyết đóng sớm" kèm việc còn lại. Sau đó mới bàn kế hoạch MCP cho nhóm capstone SEP490 (thien 2026-11-19: "cần bàn thêm sau khi đóng các kế hoạch trước").

Lời thien (2026-11-19 20:21): đang có quá nhiều kế hoạch, muốn duyệt cho Claude làm cho xong, tận dụng token trước khi reset, rồi thêm một kế hoạch MCP để người khác trong nhóm dùng mà không lộ đồ riêng. thien chọn "Làm nốt rồi đóng".

## Không làm
- Không tick "đạt" cho điều kiện cần số đo thật (thien kể lại, thien chấm sau BA 6, số token mỗi checkpoint). Những việc đó ghi "đóng sớm theo quyết định thien, còn lại: …", để sau này nhìn lại không tưởng cách làm đã được chứng minh.
- Không thêm luật nào ngoài các câu hỏi dưới.
- Không bắt đầu kế hoạch MCP trong đợt này.

## Checkpoint

### 1. thien trả lời câu hỏi
Xong khi: mọi câu hỏi dưới có câu trả lời chép nguyên văn vào file này.
- [x] Trả lời các câu hỏi trên trang (2026-11-19 20:40, gửi file từ trang: ok cả 10 đề xuất, nguyên văn ở mục Câu hỏi)

### 2. Một PR luật cho cả đợt
Xong khi: thien đọc một PR gom mọi dòng luật đã chọn ở checkpoint 1 và merge.
- [ ] PR sửa `profile/`, `README.md`, `artifacts/README.md` (và mã nhỏ nếu câu 6, 7 chọn sửa) theo câu trả lời

### 3. Đóng bảy kế hoạch
Xong khi: STATUS không còn bảng "Kế hoạch đang chạy" cho KH1–KH7; mỗi file kế hoạch có dòng "Trạng thái: đóng" và phần còn lại ghi rõ.
- [ ] Mỗi kế hoạch: tick việc có bằng chứng, việc còn lại ghi "đóng sớm", "Đã đổi" ghi quyết định này
- [ ] STATUS: bỏ bảy dòng, thêm dòng KH8; việc còn sống (mốc 01/12 chuyển private, mốc 13/12 chấm `SKILL-LEVEL.md`) sang "Việc tiếp theo"

## Câu hỏi (thien đã trả lời 2026-11-19 20:40 bằng nút trên trang: "ok, theo cả 10 đề xuất")
Mỗi câu có đề xuất; bấm "ok" là theo đề xuất.

1. Phần tự merge (KH2 ga 1, KH5): kiểm ở 6 chat thì 2 lần trượt vì công cụ chặn lệnh merge hay AI quên. Hôm nay AI tự merge #150, #151 trơn tru; lệnh merge sakubun #339 bị công cụ chặn vì thien chỉ nhắn merge #149. Sửa thế nào?
   - Sửa luật: thêm hai dòng vào `DELEGATION.md`: "CI không tự chặn merge, AI tự xem CI xanh trước khi merge"; "lệnh merge bị công cụ chặn thì báo thien một dòng kèm link PR, không thử cách khác" (đề xuất)
   - Để nguyên, không thêm dòng nào
2. Luật "tối đa 3 luật mới mỗi mốc, sửa chỗ ghi sai không tính" (KH2 ga 3) vào `README.md` mục Sửa quy trình? Đợt này tự nó đã thêm khoảng 6 dòng.
   - Có; coi đợt này là mốc 01/12 làm sớm, giới hạn 3 áp từ mốc sau (đề xuất)
   - Có, và áp ngay: đợt này chỉ giữ 3 dòng quan trọng nhất
   - Không thêm luật giới hạn
3. Review code sau khi CodeRabbit hết dùng thử 24/11 (quyết định 003, chọn D): làm thế nào?
   - Mỗi mốc một lượt review bằng một phiên Claude riêng, chỉ soi PR đụng lệnh xoá hay ghi file, git, token, đồng bộ sang repo khác; ghi vào mục "Review theo giai đoạn" của quyết định 003 (đề xuất)
   - Không review gì thêm tới khi thien nhờ
4. Skill `viet-de-hieu` (10 quy tắc viết dễ hiểu, đang là skill riêng của tài khoản, không có trong repo): vào repo hay bỏ?
   - Đưa vào repo ở `skills/viet-de-hieu/`, `VOICE.md` trỏ tới nó; nhóm SEP490 dùng lại được qua kế hoạch MCP sau này (đề xuất)
   - Bỏ, chép 3–4 quy tắc chưa có vào `VOICE.md`
   - Để nguyên như bây giờ
5. Luật ngôn ngữ đang nằm ba chỗ (`PROFILE.md` mục Ngôn ngữ, `VOICE.md` dòng đầu, mẫu AGENTS chung). Dọn về một chỗ?
   - `VOICE.md` giữ bản đủ; `PROFILE.md` chỉ còn một dòng trỏ sang; mẫu AGENTS giữ nguyên vì nó đồng bộ sang mọi repo (đề xuất)
   - Để nguyên
6. Sổ bàn giao khi thien nói "tiếp tục" (ý cuối của KH5): hôm nay chạy được, nhưng lệnh nhận việc mới nhất trong sổ là việc U4 ở repo sakubun chưa gắn vào phiên, đẩy sổ hỏng, rồi báo "một nick khác có thể vừa nhận việc này" (sai lý do). Sửa lệnh?
   - Sửa `start-session.mjs`: việc ở repo chưa gắn vào phiên thì không nhận, báo "gắn repo X rồi chạy lại" và gợi `--task` cho việc khác; kèm test (đề xuất)
   - Để nguyên
7. Nút "Nghe" và "Nói thay gõ" trong mục "Thêm" của trang học (KH6, hẹn quyết 13/12): 12 buổi 14–17/11 dùng 0 lần.
   - Bỏ hẳn khỏi mẫu học ngay; bài đã học giữ nguyên vì đóng băng (đề xuất)
   - Giữ, quyết lại 13/12
8. Phần đo còn lại của KH1 (hai buổi dựng theo cách mới có ít lượt hơn, áp cho BA và chiến tranh), KH4 (đối chiếu với tính năng mới của Claude), KH7 (số token mỗi checkpoint ở sakubun): làm gì?
   - Đóng sớm cả ba, ghi kết luận đã có (ôn tự sinh giữ; số lượt dựng chưa giảm; ba luật thread giữ mà chưa đo); việc đối chiếu tính năng Claude gộp vào kế hoạch MCP (đề xuất)
   - Giữ các kế hoạch đó mở tới khi đủ số đo
9. Ô tự kể lại trên trang luồng: thien kể ba lần đều chép tên khối. Sửa mẫu?
   - Ô kể lại hỏi thẳng "Luồng rẽ ở đâu? Quay lại ở đâu?" và gợi "viết bằng lời của bạn, đừng chép tên khối" (đề xuất)
   - Để nguyên
10. Hai việc học trong KH2 (mốc 13/12 chấm lại `SKILL-LEVEL.md`; một buổi kiểu "Viết luật cho thienui"): làm gì?
   - Chuyển sang "Việc tiếp theo" của STATUS và lộ trình học, không giữ kế hoạch mở vì chúng (đề xuất)
   - Bỏ cả hai

## Ghi chú của thien kèm câu trả lời (nguyên văn)
"sao tôi thấy trong mẫu kế hoạch nào cũng có phần chi tiết thử trang này mãi vậy. tôi đã không đụng nó mấy kế hoạch trở lại đây rồi, bạn phải tối ưu các artifact như các bộ lắp ghép chứ, chứ đâu cứ phải đưa nó thành một khung rồi áp dụng mãi, nó là bộ kit mà, mà bộ kit là bạn có thể lấy bất kì thứ nào tốt đã có sẵn rồi ghép vào, có đúng không. Vậy tính ra hiện tại các artiact vẫn chưa được ổn lắm, tôi cũng chưa kiểm tra kĩ cần bạn phải kiểm tra kĩ. Và hơn nữa giúp tôi sáng tạo thêm bố cục của artifact kế hoạch, lẫn cả các artifact khác cho phù hợp với nội dung không phải khi nào cũng cứng ngắc một khung mãi. Như vậy thì cũng sẽ nặng kit lên từng ngày nhưng mà đổi lại là luôn có cái mới refresh."

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-19 | Luật "một chi tiết thử mỗi trang" (KH6 ga 5) không đưa vào `artifacts/README.md`; chi tiết thử thành tuỳ chọn, mặc định tắt ở lệnh dựng trang kế hoạch và trang luồng (PR mã của đợt này). Việc làm lại các mẫu thành kit lắp ghép, kiểm kỹ, và bố cục theo nội dung tách thành kế hoạch riêng (KH9), soạn sau khi đóng đợt này | Ghi chú của thien ở trên: chi tiết thử lặp ở mọi trang, mấy kế hoạch gần đây không đụng tới; mẫu phải là bộ lắp ghép chứ không phải một khung áp mãi |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
