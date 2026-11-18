# Quy trình nhìn được, và gu lớn dần theo ngày

Trạng thái: đang chạy · Duyệt: 2026-11-18 (thien: "ok, duyệt theo cả 4 đề xuất") · Cập nhật: 2026-11-18 · nick tnt697 · Chat: https://claude.ai/code/session_01WXAvBWDbXVGqmzESXaXn7P, https://claude.ai/code/session_01WXAvBX3kxdpafP9q92LUbo · Bản duyệt: https://claude.ai/artifact/7hVBYXwyHZbfVp7mL4GsV4 (nick tnt697)

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: checkpoint 0 xong, sắp vào 1. Trang chọn của vòng gu 1 đã đăng: https://claude.ai/artifact/7sM41GEbSa4kw3hxGwbqMK (nick tnt697). Nguồn ba bản, decision.json và lệnh chụp ở `docs/plans/2026-11-18-visual-workflow/round-1/`.
- Còn thiếu: checkpoint 1 tới 5. Ở ga 2 thử lấy riêng bản đồ ga theo ngày và núm vặn của bản C làm chi tiết thử, không lấy nền tối và chữ khổng lồ.
- thien đã chọn "B · Một nấc" (2026-11-18, giống đề xuất), vì sao: "mình cảm thấy hiện tại 3 bản thì bản một nấc, không đi quá xa, có phần quen thuộc cũng như mới lạ nho nhỏ, nhưng phần C thì quá mới làm mình chưa thích ứng". Checkpoint 0 xong; tiếp theo checkpoint 1 (lớp sơ đồ dùng chung).
- thien cần làm: merge PR #124 khi CodeRabbit xong.

## Mục tiêu
Hoàn thiện các mẫu artifact đang có và thêm mẫu, công cụ để quy trình giữa thien và Claude dễ nắm bắt bằng hình, bố cục, sơ đồ, luồng và tương tác; kèm một vòng thử gu đều đặn để gu của thien đi lên từng nấc, nhất quán mà không đứng yên (lời thien 2026-11-18: gu "phát triển và hoàn thiện theo từng ngày, chứ không giữ vĩnh viễn").

## Không làm
- Không thêm nút hỏi Claude, đọc to hay nói thay gõ vào mẫu mới: 12 buổi 14–17/11 thì "Hỏi Claude" dùng 1 lần, "Nghe" và "Nói thay gõ" 0 lần, còn "Xem Claude làm" dùng ở 6/11 buổi (`learning/usage.md`).
- Không đổi bộ màu hay font gốc; đổi gu chỉ đi qua vòng thử gu, thien chọn.
- Không dựng lại trang học cũ (bài đã học là bài đóng băng).
- Không bỏ chữ: hình luôn đi kèm câu ngắn đặt ngay cạnh.
- Không tự dựng thứ claude.ai đã có (Whiteboard, Slides, Docs); dùng Whiteboard khi cần cùng vẽ kiến trúc hay brainstorm.
- Không làm sơ đồ 3D hay chuyển động chỉ để đẹp.

## Các phương án đã xét
| Phương án | Hợp khi | Lý do không chọn |
|---|---|---|
| A. Làm lại cả kit theo gu mới một lần | gu đã chốt, nhiều thời gian | gu đang đổi; nhảy xa một lần dễ mất cảm giác quen (Hekkert và cộng sự, 2003), đụng bài đã đóng băng, tốn rất nhiều lượt |
| B. Chỉ đánh bóng mẫu học | tuần bận | không chạm chỗ đau lớn nhất là quy trình toàn chữ, không có cách đẩy gu lên |
| C. Dùng hẳn loại trang sẵn có của claude.ai | không muốn giữ code | không tự đọc file repo, không theo gu, Docs vẫn là chữ; vẫn dùng Whiteboard một phần |
| **D. Ba nhánh nhỏ trên một lớp sơ đồ chung (chọn)** | | Chỗ yếu: chạm trần 8 mẫu; lệnh đọc file kế hoạch dễ vỡ khi file viết lệch mẫu; vòng gu cần thien khoảng 5 phút mỗi hai tuần |

## Quyết định lúc duyệt
thien chọn cả 4 đề xuất (2026-11-18):
1. Mẫu quy trình trước (checkpoint 1, 2, 3); đánh bóng mẫu học ghép vào buổi học đã có lịch.
2. Làm phần dựng (mẫu, lệnh, trang) ngay; mọi dòng luật gom vào mốc 01/12, giữ luật "không thêm luật tới 01/12" của `2026-11-17-action-gaps.md`.
3. Vòng thử gu hai tuần một lần, cùng nhịp PR gu sang thienui.
4. Hướng "thật xa" ở vòng đầu do Claude chọn, kèm ví dụ thật và một câu "để ý chỗ này".

Chi tiết thử của trang duyệt (checkpoint vẽ như tuyến tàu): thien chọn "Thích", chưa ghi vì sao. Đã vào `learning/frontend/taste-queue.md`.

## Checkpoint

### 0. Vòng thử gu đầu tiên
Xong khi: thien mở trang chọn trên điện thoại, chọn một trong ba hướng (quen, một nấc, thật xa) cho màn "trang kế hoạch" và viết một câu vì sao; câu đó nằm trong `learning/frontend/taste-queue.md`.
- [x] Ba bản của cùng một màn, dựng bằng `artifacts/decide/`; trang duyệt kế hoạch này là bản "một nấc" (2026-11-18, `round-1/`, trang chọn đã đăng)
- [x] 3 ví dụ thật cho hướng "thật xa", mỗi cái một câu để ý (The Pudding, Ciechanowski, R2D3; `decide` thêm trường `links` để hiện ví dụ)
- [x] Ghi kết quả vào hàng chờ gu (2026-11-18, B · Một nấc, câu vì sao chép nguyên văn)

### 1. Lớp sơ đồ dùng chung
Xong khi: trang mẫu thành phần (`artifacts/kit/gallery.html`) có mục Sơ đồ; thien mở trên điện thoại, bấm qua một luồng 5 bước, không khối nào tràn hay đè chữ.
- [ ] File mới diagram.js trong kit: khối trơn viền mảnh, mũi tên, không tô màu, không bóng (lời thien 2026-11-17 trong hàng chờ gu)
- [ ] Xếp chỗ tự động bằng thư viện có sẵn, hạn một phiên; quá hạn thì xếp theo lưới
- [ ] Bấm từng bước: khối sáng lên, chữ chú thích hiện cạnh khối
- [ ] Qua `check-tokens.mjs` và `check-pages.mjs`

### 2. Mẫu kế hoạch nhìn được
Xong khi: kế hoạch kế tiếp được gửi thien duyệt bằng trang sinh từ file `docs/plans/`, và thien trả lời câu hỏi bằng nút trên trang, không gõ lại.
- [ ] Lệnh mới make-plan.mjs trong thư mục mới artifacts/plan đọc file theo `templates/PLAN.template.md`, dựng tuyến checkpoint, phương án, câu hỏi
- [ ] Câu trả lời lưu vào db của trang để Claude đọc, có nút chép làm đường lui
- [ ] Thử trên mọi file đang có trong `docs/plans/`; file lệch mẫu thì lệnh báo rõ chỗ lệch
- [ ] Trang tổng quan dẫn sang trang này thay vì file markdown

### 3. Mẫu luồng chạy
Xong khi: thien xem luồng "một buổi học đi qua những đâu" và tự kể lại bằng lời mà không mở `profile/MAP.md`.
- [ ] Mẫu mới ở thư mục artifacts/flow: một sơ đồ, đi từng bước; trên điện thoại sơ đồ dính trên, chữ cuộn dưới
- [ ] Dùng cho: quy trình vừa đổi gì, kiến trúc sakubun, luồng nghiệp vụ trong bài BA
- [ ] Sau mẫu này là 8/8 mẫu; mẫu sau phải thay mẫu cũ

### 4. Đánh bóng mẫu học (ghép vào buổi học)
Xong khi: sau BA 6 và Frontend 11, thien không còn chấm bảng dán là "chưa thỏa mãn", và số lượt dựng một trang học không tăng.
- [ ] Bảng dán BA: một vòng so sánh cũ và mới trước BA 6
- [ ] Màn kết có hình cho mọi buổi (quy luật đỉnh và kết)
- [ ] Hai màn cạnh nhau để so trước và sau trên bàn thử
- [ ] Giữ đồng hồ "nhìn N giây" khi tải lại trang
- [ ] Nút Nghe và Nói thay gõ vào mục "Thêm"; bỏ hẳn hay không quyết ở mốc 13/12

### 5. Gom luật vào mốc 01/12
Xong khi: thien duyệt các dòng luật ở mốc 01/12, và vòng thử gu thứ hai chạy khoảng 02/12 theo luật mới.
- [ ] `artifacts/README.md`: thêm hai mẫu mới, luật "một chi tiết thử mỗi trang" (có nút Thích, Không)
- [ ] Vòng thử gu hai tuần một lần; dòng "Đang thử" trong thienui có ngày xem lại sau 4 tuần
- [ ] `profile/VOICE.md`: giải thích luồng hay báo việc nhiều bước trong chat thì vẽ sơ đồ ngay trong chat
- [ ] `profile/MAP.md`, STATUS cập nhật theo

## Thời gian và chỗ dễ sa lầy
Khoảng 8 phiên, 18/11 tới 09/12: tuần 18–23/11 checkpoint 0 và 1; tuần 24–30/11 checkpoint 2 và 4 (ghép BA 6); tuần 01–07/12 checkpoint 5, 3 và vòng gu 2; 08–13/12 checkpoint 4 (ghép Frontend 11) và mốc số đo 13/12.

Dễ sa lầy: tự viết thuật toán xếp sơ đồ; đọc markdown kế hoạch viết lệch mẫu; đẹp trên laptop nhưng vỡ trên điện thoại; hiểu "một nấc mới" thành đổi màu (một nấc chỉ là bố cục và cách kể).

## Nghiên cứu dùng cho kế hoạch
Đọc 2026-11-18. Nhãn theo `profile/RESEARCH.md`.
- Chữ đi với hình học tốt hơn chữ suông, d trung vị 1,67; đặt chữ gần hình d = 0,79; bỏ thứ thừa d = 0,70; chia đoạn do người học bấm d = 0,70 ([Mayer, 2017](https://doi.org/10.1111/jcal.12197), đọc tóm tắt).
- Dạy khớp "kiểu học" của từng người gần như không có bằng chứng ([Pashler và cộng sự, 2008](https://pubmed.ncbi.nlm.nih.gov/26162104/), đọc tóm tắt). Nên hình đi kèm chữ cho mọi trang, không thay chữ.
- Toàn cảnh trước, phóng to và lọc, chi tiết khi cần ([Shneiderman, 1996](https://drum.lib.umd.edu/items/155a868e-fb83-4115-9899-9187ea8c0498/full), đọc tóm tắt).
- Phần ít dùng để lớp thứ hai ([Nielsen Norman Group](https://www.nngroup.com/videos/progressive-disclosure/), đọc đoạn trích); bằng chứng thực nghiệm riêng cho cách này còn mỏng (chưa kiểm nguồn gốc của nhận định này).
- Cho người đọc vặn giả định và thấy kết quả ngay ([Victor, 2011](https://worrydream.com/ExplorableExplanations/), đọc đoạn trích).
- Kể bằng cuộn trang: hứng thú hơn, nhẹ đầu hơn, hiểu ngang văn bản, N = 454, đọc chính sách quyền riêng tư ([arXiv 2603.04367](https://arxiv.org/abs/2603.04367), đọc tóm tắt).
- Nhớ đỉnh và kết của trải nghiệm ([Kahneman và cộng sự, 1993](https://en.wikipedia.org/wiki/Peak%E2%80%93end_rule), đọc đoạn trích qua Wikipedia).
- Đẹp làm người dùng tha lỗi nhỏ và che lỗi khi thử ([Nielsen Norman Group](https://www.nngroup.com/articles/aesthetic-usability-effect/), đọc đoạn trích). Nên vòng duyệt hỏi "làm được việc chưa" trước "có đẹp không".
- Người ta thích cái mới khi nó không làm mất cảm giác quen; quen và mới ngang nhau và kìm nhau ([Hekkert và cộng sự, 2003](https://research.vu.nl/en/publications/most-advanced-yet-acceptable-typicality-and-novelty-as-joint-pred/), đọc tóm tắt). Ghế mới vừa phải được chấm đẹp nhất ([IJDesign](https://ijdesign.org/index.php/IJDesign/article/view/1146/479), đọc tóm tắt). Người học mỹ thuật đổi thứ mình thích ([Gartus và cộng sự, 2020](https://ui.adsabs.harvard.edu/abs/2020Symm...12..707G), đọc tóm tắt).
- Suy luận của AI: gu đi lên khi chỗ "mới vừa đủ" dịch dần; cách đẩy là mỗi lần đưa thứ xa hơn một nấc, không nhảy hẳn ra xa.

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
