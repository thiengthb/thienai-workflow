# KH9 · Kit lắp ghép, bố cục theo nội dung

Trạng thái: đang chạy · Duyệt: 2026-11-19 (thien: "ok, theo cả 4 đề xuất") · Cập nhật: 2026-11-20 · nick tnt697 · Chat: https://claude.ai/code/session_01WXAvBYqmwzr7tB4gqM4F6T · Trang: https://claude.ai/artifact/9f8VSi8ttTr7u4STJSLTz5 (nick tnt697)

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: ga 4, vòng gu 6 (20/11): trang ôn thẻ và trang học, mỗi trang A hiện nay, B và C mới, chụp ở 860px và 950px. Trang chọn hai câu https://claude.ai/artifact/6HmX4EYH3dsuLjUNpUzs9v, trang bấm thử https://claude.ai/artifact/3bh7mbjckhWm2zqoUSBMk3 (nick tnt697). Nguồn ở `docs/plans/2026-11-18-visual-workflow/round-6/`.
- Còn thiếu: thien chọn; bản chọn vào `artifacts/review/` và `artifacts/lesson/`; luật vòng gu hai tuần một lần vào `artifacts/README.md`.
- thien cần làm: chọn hai câu trên trang chọn.

## Mục tiêu
Các mẫu artifact thành một bộ lắp ghép: mỗi trang chọn khối hợp với nội dung của nó, thay vì mỗi mẫu là một khung cố định áp mãi. Kit lớn dần mỗi ngày, có thứ mới để làm mới mắt, nhưng mỗi trang chỉ mang khối nó dùng.

Lời thien (2026-11-19 20:40, ghi chú kèm câu trả lời KH8): "bạn phải tối ưu các artifact như các bộ lắp ghép chứ, chứ đâu cứ phải đưa nó thành một khung rồi áp dụng mãi, nó là bộ kit mà ... giúp tôi sáng tạo thêm bố cục của artifact kế hoạch, lẫn cả các artifact khác cho phù hợp với nội dung ... Như vậy thì cũng sẽ nặng kit lên từng ngày nhưng mà đổi lại là luôn có cái mới refresh."

## Không làm
- Không dựng lại trang đã đăng của bài học cũ (bài đóng băng).
- Không đổi bộ màu, font, bo góc gốc; đổi gu vẫn qua vòng thử gu, thien chọn.
- Không bắt mọi trang có "chi tiết thử"; chỉ có khi trang có thứ mới thật (đã thành tuỳ chọn ở KH8).
- Không thêm mẫu thứ chín: thứ mới là khối hay bố cục trong kit.

## Kiểm sơ bộ (2026-11-19, ảnh chụp của `check-pages` ở 390, 820, 1180px)
- **Khối viết lại ở nhiều mẫu thay vì nằm trong kit:** câu hỏi có nút (`.q`, `.opt`) ở 4 mẫu (decide, lesson, plan, war); ô trả lời gửi Claude (`.reply`, `.acts`, `.status`) ở 3–4 mẫu (flow, plan, review, decide); núm (`.knob`) ở compare, it, plan; khung ảnh (`.shot`) ở compare, decide, it. Đây là lý do mỗi mẫu trông như một khung riêng: sửa một chỗ không đi sang chỗ khác. (Sửa lại khi bắt tay làm, 2026-11-19: `.q`, `.opt`, núm, khung ảnh là trùng tên chứ không trùng khối; khối trùng thật là chép và gửi ở bốn mẫu kế hoạch, luồng, chọn phương án, ôn thẻ, và chi tiết thử ở kế hoạch, luồng. Xem "Đã đổi".)
- **Mỗi mẫu một bố cục cố định:** trang kế hoạch luôn là "Đang ở đâu, tuyến ga, phương án, câu hỏi, góp ý" dù kế hoạch đang chờ duyệt, đang chạy hay vừa đóng; trang luồng luôn là chữ trái, sơ đồ phải.
- **Màn rộng bỏ trống nhiều:** trang ôn thẻ ở 1180px là một thẻ nhỏ góc trái; trang học là một cột 560px.
- **Điện thoại:** thanh mục lục trên trang kế hoạch bị cắt chữ ở mép phải (390px); sơ đồ luồng cuộn ngang theo thiết kế, nhưng nhãn mũi tên sát mép bị cắt.
- **Chi tiết thử:** có ở trang kế hoạch và trang luồng theo mặc định tới 19/11 (đã sửa ở PR #154).
- Lỗi chức năng: không thấy; `check-pages` 0 lỗi ở 10 trang x 3 khổ x 2 chế độ.

## Checkpoint

### 1. Rút khối dùng chung vào kit (xong 2026-11-20: thien đã xem trang mẫu thành phần)
Xong khi: trang mẫu thành phần có đủ các khối trùng thật (khối gửi, nút chọn một, chi tiết thử); mọi mẫu từng tự viết các khối đó (kế hoạch, luồng, chọn phương án, ôn thẻ) dùng khối của kit, `check-pages` 0 lỗi, và thien mở trang mẫu thành phần thấy từng khối một lần.
Ước: 1–2 phiên
- [x] Khối câu hỏi có nút, ô trả lời gửi Claude, núm, khung ảnh vào `kit/` (CSS và JS), có tên trong trang mẫu thành phần (đổi sau khi kiểm kỹ, xem "Đã đổi": khối gửi `Kit.sendBox` + `.kit-send`, nút chọn một `.choice`, chi tiết thử `.trial`, HTML ở `kit/blocks.mjs`; trang mẫu thành phần có hai mục mới; PR #156, đã merge 2026-11-19; trang mẫu thành phần đăng lại https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst, nick tnt697)
- [x] Bốn mẫu đang tự viết các khối đó chuyển sang dùng khối của kit; bài đã học không đổi (trang kế hoạch, luồng, chọn phương án, ôn thẻ dùng `Kit.sendBox`; ảnh chụp trước và sau trùng từng điểm ảnh; PR #156)

### 2. Trang dựng từ danh sách khối
Xong khi: một trang kế hoạch và một trang luồng dựng từ danh sách khối khai báo trong file nguồn (không còn khung HTML cố định); bỏ một khối khỏi danh sách thì trang không còn khối đó và không nặng thêm; `check-pages` báo khi một trang nặng hơn cỡ gốc của nó quá 20%.
Ước: 2 phiên
- [x] Lệnh dựng đọc danh sách khối (thứ tự, khối nào) từ file kế hoạch hay luồng; mặc định chọn theo nội dung (kế hoạch: dòng `Khối: … · Vì: …`, luồng: `"blocks"` và `"blocksWhy"`; thiếu lý do thì báo lệch; PR #158, đã merge 2026-11-19)
- [x] `kit/pack.mjs` bỏ CSS, JS của khối trang không dùng, như đang bỏ icon thừa (vùng `/* @block … */` trong `kit.css`, template và JS của trang kế hoạch, trang luồng; trang mẫu kế hoạch bỏ 4 khối nhẹ đi 21%, trang luồng bỏ sơ đồ nhẹ đi 63%; ảnh chụp 10 trang mẫu mặc định trùng với main)
- [x] `check-pages` báo khi một trang vượt cỡ gốc cộng 20% (câu 4); cỡ gốc là cỡ của trang mẫu đó dựng từ main lúc bắt đầu checkpoint này, ghi vào một file trong `artifacts/kit/`, đổi khi thien duyệt một bố cục mới (`artifacts/kit/sizes.json`, đo từ main f45b0be; mục 8 của check-pages; `--write-sizes` ghi lại; mọi trang mẫu nay nhẹ hơn gốc 3–22%)

### 3. Vòng gu bố cục cho trang kế hoạch
Xong khi: thien chọn bố cục cho ba loại kế hoạch trên một trang chọn có hình; trang của chính KH9 được dựng lại và đăng đè theo bố cục đã chọn (câu 3), và trang kế hoạch kế tiếp dựng theo bố cục đó.
Ước: 1 phiên
- [x] Ba loại nội dung, mỗi loại 2–3 bố cục: chờ duyệt (nhiều câu hỏi: dạng phiếu hỏi), đang chạy (theo dõi: dạng bảng tiến độ, tuyến ga), đã đóng (tổng kết: dạng thẻ kết quả, việc chuyển đi) (vòng 5 ở `docs/plans/2026-11-18-visual-workflow/round-5/`: mỗi loại A hiện nay, chờ duyệt B phiếu hỏi trước, C hỏi bên cạnh; đang chạy B bảng tiến độ, C tuyến ngang; đã đóng B thẻ kết quả, C ba cột tổng kết. Trang chọn ba câu https://claude.ai/artifact/EzRQAqCHdyNTsEnrgJaRwG, trang bấm thử https://claude.ai/artifact/UrAYhZsa14BVWWkfLtCvPP, nick tnt697, 2026-11-19)
- [x] thien chọn trên trang `decide/`, câu vì sao vào hàng chờ gu (2026-11-19 23:38, comment trên trang chọn: B cả ba câu, đề xuất là C cả ba; chưa ghi vì sao, ghi chú xin sửa ô hỏi Claude và thêm trợ năng phóng to, phím trái phải; đã ghi vào `learning/frontend/taste-queue.md`)
- [x] Dựng lại trang KH9 bằng bố cục đã chọn, đăng đè link trong dòng "Trang:" (câu 3) (2026-11-20: `make-plan.mjs` chọn bố cục theo trạng thái, `pickLayout`; dòng `Bố cục: <tên> · Vì: …` đổi được; trang mẫu đang chạy và đã đóng vào `check-pages`; trang KH9 đăng đè ở link trên, bố cục bảng tiến độ; PR #163)

### 4. Bố cục mới cho các mẫu khác, đều đặn
Xong khi: mỗi hai tuần có một bố cục mới cho một mẫu (trang học, ôn thẻ, luồng, so sánh), thien chọn giữ hay bỏ; kit ghi rõ khối nào mới, khối nào bỏ.
Ước: mốc
- [ ] Vòng đầu: trang ôn thẻ và trang học ở màn rộng (đang bỏ trống nhiều) (vòng 6 ở `docs/plans/2026-11-18-visual-workflow/round-6/`, 20/11: ôn thẻ B thẻ và hàng chờ, C hai nửa thẻ; trang học B tuyến bước, C theo nội dung; B và C của trang học cùng đưa sân khấu lên cạnh chữ từ 760px. Trang chọn https://claude.ai/artifact/6HmX4EYH3dsuLjUNpUzs9v, trang bấm thử https://claude.ai/artifact/3bh7mbjckhWm2zqoUSBMk3, nick tnt697. Chờ thien chọn)
- [ ] Luật vòng thử gu hai tuần một lần (chuyển từ KH6) vào `artifacts/README.md` ở mốc sau

## Câu hỏi (thien đã trả lời 2026-11-19 21:15 bằng nút trên trang: "ok, theo cả 4 đề xuất")
1. Làm KH9 trước hay kế hoạch MCP cho nhóm SEP490 trước?
   - KH9 trước: kit lắp ghép là thứ nhóm sẽ dùng qua MCP, nên làm gọn trước rồi mới chia sẻ (đề xuất)
   - MCP trước, KH9 sau
   - Làm song song, mỗi phiên một kế hoạch
2. Ai chọn bố cục cho mỗi trang?
   - Lệnh dựng chọn mặc định theo nội dung (ví dụ kế hoạch có câu hỏi chưa trả lời thì dạng phiếu hỏi), AI được đổi nhưng phải ghi một dòng lý do (đề xuất)
   - AI tự chọn mỗi lần, không có mặc định
   - Luôn hỏi thien
3. Trang kế hoạch của chính KH9 dựng thế nào?
   - Dựng bằng mẫu hiện tại để bạn trả lời ngay; checkpoint 3 sẽ dựng lại nó bằng bố cục bạn chọn (đề xuất)
   - Chờ có bố cục mới rồi mới gửi
4. Kit nặng dần: đặt giới hạn không?
   - Không giới hạn kit, nhưng mỗi trang chỉ mang khối nó dùng (checkpoint 2); `check-pages` báo khi một trang vượt cỡ hiện tại cộng 20% (đề xuất)
   - Giới hạn cả kit ở một cỡ cố định

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-20 | Vòng 6 chụp ở 860px và 950px thay vì 1180px và điện thoại; điện thoại giữ như hiện nay ở mọi bản | thien hay mở trang ở nửa màn hình cạnh chat hay 2/3 màn hình (00:59); điện thoại hai trang này đã ổn |
| 2026-11-20 | Bảng tiến độ bản 2: ga đang chạy là thẻ lớn bên trái, "Chưa tới" và "Xong" là dòng gập mở ở cột bên, cột trống không vẽ; trang dùng bề ngang tới 1000px, chia hai cột từ 820px; bản đồ gọn nổi chỉ còn ở bố cục một cột | thien 00:59: "bố cục checkpoint vẫn chưa hợp ý", trang hay mở ở nửa màn hình cạnh chat (khoảng 860px) hay 2/3 màn hình (khoảng 950px) nên ba cột bằng nhau quá hẹp. Bỏ bản đồ gọn nổi là Claude tự quyết (đọc nhầm câu "menu đè lên nội dung", xem "Lỗi gặp"): ở bảng tiến độ nó nổi trên cột mà không giúp gì |
| 2026-11-20 | Ba bản B viết lại gọn trong `artifacts/plan/`, khác bản phác ở bốn chỗ: mục tiêu gập có nút "Đọc hết mục tiêu" (bản phác bấm vào chữ, chữ có link thì bấm nhầm); ô "Bạn cần làm" giữ dòng đầy đủ ở Đang ở đâu (bản phác ẩn dòng đó, ô chỉ hiện 120 chữ); thẻ kết quả có việc con gập mở và ngày xong; ga "Ước: mốc" không tính vào số phiên còn lại. Ô số tròn đen chữ trắng ở nền sáng, ngược lại ở nền tối | Giữ đủ thông tin khi gập; trắng đen thì phân biệt bằng viền và độ đậm |
| 2026-11-19 | Bộ màu của kit đổi sang trắng đen (PR #161): nền và thẻ trắng tinh, nhấn gần đen, mực hình thành ba mức xám, màu chỉ để báo xong, lỗi, cảnh báo. Mục "Không làm" ghi không đổi bộ màu gốc; lần này thien quyết thẳng, không qua vòng gu | thien 23:56: "màu chính là màu trắng, mình không muốn chạy đua với màu sắc nữa", chọn "Trắng đen, màu chỉ để báo". Ba bố cục B của ga 3 dựng theo bộ màu này |
| 2026-11-19 | Ga 3: trang `decide/` hỏi được nhiều câu trên một trang (`parts`), thay vì ba trang chọn | Kế hoạch ghi "một trang chọn có hình" cho ba loại; mỗi loại cần đề xuất ẩn và ảnh riêng, nên mẫu chọn phương án cần chọn nhiều câu |
| 2026-11-19 | Ga 2: mặc định "theo nội dung" chỉ quyết khối nào có (khối có nội dung thì có), giữ thứ tự như trước | Đổi thứ tự hay bố cục theo loại kế hoạch là vòng gu của ga 3, thien chọn; ga 2 chỉ làm phần máy, nên trang mặc định không đổi so với main |
| 2026-11-19 | Checkpoint 1 rút khối gửi, `.choice`, `.trial` thay vì câu hỏi, núm, khung ảnh | Đọc từng chỗ thì `.q`, `.opt` là trùng tên chứ không trùng khối (thẻ phương án, dòng lựa chọn, câu trắc nghiệm là ba thứ khác nhau); núm và khung ảnh cũng khác theo mẫu. Khối trùng thật là chép và gửi (bốn bản) và chi tiết thử (hai bản) |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
| 2026-11-20 | Bảng tiến độ rộng 960px nhưng cột mục lục bên trái vẫn đặt cho cột đọc 760px: từ khoảng 1366px, chữ "Tiến độ" và thanh tiến độ đè lên ô số (thien gửi ảnh 01:16). Lần đầu Claude đọc nhầm thành bản đồ gọn | Cột mục lục tính vị trí từ bề ngang cột đọc (`--main-w`, lớp `wide` ở bố cục bảng tiến độ); test `plan-layout.test.mjs` đo mục lục và cột đọc ở 1160–1920px cho cả ba bố cục, chạy trong job pages |
| 2026-11-19 | Trang chọn phương án: ô hỏi Claude dính sát viền thẻ (không có lề), icon khoá và bóng đèn hiện thành ô vuông đặc (lớp `.ic` của kit là icon mặt nạ từ PR #127, đè lên svg); ảnh bé ở khung 760–999px; phóng to chỉ vừa khung, không đổi bản được (thien báo 23:38) | PR #160: ô hỏi có lề và nhãn; icon đổi lớp `.ri`; khung vừa xếp ảnh trên chữ dưới; hộp phóng to có nấc 100–300%, kéo, bấm đúp, Ctrl + lăn, ← → đổi bản, vuốt trên điện thoại; ← → ở màn chọn thường |
