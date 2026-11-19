# KH6 · Quy trình nhìn được, và gu lớn dần theo ngày

Trạng thái: đang chạy · Duyệt: 2026-11-18 (thien: "ok, duyệt theo cả 4 đề xuất") · Cập nhật: 2026-11-19 · nick tnt697 · Chat: https://claude.ai/code/session_01WXAvBWDbXVGqmzESXaXn7P, https://claude.ai/code/session_01WXAvBX3kxdpafP9q92LUbo · Bản duyệt: https://claude.ai/artifact/7hVBYXwyHZbfVp7mL4GsV4 (nick tnt697) · Trang: https://claude.ai/artifact/WtTcEXfkxQkTckRan5J28v (nick tnt697)

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: checkpoint 0, 1 xong; 2 xong (thien trả lời 3 câu hỏi bằng nút trên trang; trang tổng quan đăng lại 19/11 từ nick tnt628); 3: mẫu `artifacts/flow/` đã dựng, trang luồng "một buổi học đi qua những đâu" đã đăng https://claude.ai/artifact/S9B86U6MGpnkYTa8enDtVM (nick tnt697); thien kể lại đúng bước 1–4 (phần của thien), nửa sau là việc của Claude: checkpoint 3 xong (thien quyết 19/11 09:51, PR #140 merge cùng ngày); checkpoint 4: thien chọn làm phần máy trước buổi học (19/11 10:53); đồng hồ nhìn N giây, màn kết, bảng dán tuyến ga (vòng 4, thien chọn B) đã xong; còn hai màn so trước và sau trên bàn thử, nút Nghe và Nói (13/12); rồi 5. Lớp sơ đồ: `artifacts/kit/diagram.js` và mục Sơ đồ trong trang mẫu thành phần https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst (nick tnt697). Trang chọn của vòng gu 1 đã đăng: https://claude.ai/artifact/7sM41GEbSa4kw3hxGwbqMK (nick tnt697). Nguồn ba bản, decision.json và lệnh chụp ở `docs/plans/2026-11-18-visual-workflow/round-1/`.
- Vòng gu 2 (bảng màu) chạy sớm theo lời thien 18/11: trang chọn https://claude.ai/artifact/Ci6FBx4ThzEEh4SYZESph7 (nick tnt697), nguồn ở `round-2/`. thien chọn C trên trang, rồi nhắn "à tôi muốn giấy trắng với xanh petrol": kit dùng nền của A với màu nhấn của C (đã vào `kit.css`). Cùng đợt: nút mới, icon Lucide, chuyển động, thành phần mới, trang nhẹ (`kit/pack.mjs`). PR #126 và #127 đã merge (19/11, thien nhắn "merge").
- Vòng gu 3 (19/11, thien hỏi mang style slide MLN122 vào trang học): trang chọn https://claude.ai/artifact/RMSfapmLBg7FvoQ5PFDgad, trang mẫu bấm A/B/C https://claude.ai/artifact/9tkpy5E3vqvs5AXqnWJor2 (cả hai nick tnt697); nguồn ở `round-3/` (PR #131). thien chọn "A · Thêm mực cam" (01:11, đề xuất là B): không kẻ ô, giữ bo góc, giấy trắng; vì sao đã chép nguyên văn vào hàng chờ gu. Mực hình đã vào kit ở PR #131.
- Checkpoint 1 xong (19/11): mục Sơ đồ trong trang mẫu chỉ có một luồng, chính là luồng 5 bước "một buổi học đi qua những đâu"; thien nhắn "mình đã bấm sơ đồ trên điện thoại và nó không bị lỗi UI nào". Câu vì sao của bảng màu đã vào hàng chờ gu.
- Còn thiếu: phần còn lại của checkpoint 4 (hai màn so trước và sau trên bàn thử, nút Nghe và Nói), rồi checkpoint 5.
- thien đã chọn "B · Một nấc" (2026-11-18, giống đề xuất), vì sao: "mình cảm thấy hiện tại 3 bản thì bản một nấc, không đi quá xa, có phần quen thuộc cũng như mới lạ nho nhỏ, nhưng phần C thì quá mới làm mình chưa thích ứng". Checkpoint 0 xong.
- thien cần làm: không có việc mới. Muốn link "Mở trang kế hoạch" mở được từ nick khác thì mời các nick vào trang kế hoạch (Share, quyền xem).

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

### 1. Lớp sơ đồ dùng chung (xong 2026-11-19: thien bấm trên điện thoại, "không bị lỗi UI nào")
Xong khi: trang mẫu thành phần (`artifacts/kit/gallery.html`) có mục Sơ đồ; thien mở trên điện thoại, bấm qua một luồng 5 bước, không khối nào tràn hay đè chữ.
- [x] File mới diagram.js trong kit: khối trơn viền mảnh, mũi tên, không tô màu, không bóng (lời thien 2026-11-17 trong hàng chờ gu) (2026-11-18, `artifacts/kit/diagram.js`, CSS ở mục Sơ đồ của `kit.css`)
- [x] Xếp chỗ tự động bằng thư viện có sẵn, hạn một phiên; quá hạn thì xếp theo lưới (2026-11-18, dagre 3.1.3 MIT gắn sẵn ở `artifacts/kit/vendor/`, 49 KB; trang không gắn dagre thì xếp theo tầng, vòng lặp đi vòng ngoài; khung hẹp tự chuyển dọc)
- [x] Bấm từng bước: khối sáng lên, chữ chú thích hiện cạnh khối (2026-11-18: bắt đầu ở toàn cảnh; chú thích mở ngay dưới tên trong khối, sơ đồ xếp lại nên không đè khối khác)
- [x] Qua `check-tokens.mjs` và `check-pages.mjs` (2026-11-18: 0 lỗi, trang mẫu thành phần không có cảnh báo ở 3 khổ, sáng và tối)

### 2. Mẫu kế hoạch nhìn được
Xong khi: kế hoạch kế tiếp được gửi thien duyệt bằng trang sinh từ file `docs/plans/`, và thien trả lời câu hỏi bằng nút trên trang, không gõ lại.
Ước: 2 phiên
- [x] Lệnh mới make-plan.mjs trong thư mục mới artifacts/plan đọc file theo `templates/PLAN.template.md`, dựng tuyến checkpoint, phương án, câu hỏi (PR #135, merge 2026-11-19)
- [x] Câu trả lời lưu vào db của trang để Claude đọc, có nút chép làm đường lui (PR #135; thien gửi thử từ trang 19/11 và Claude nhận được)
- [x] Thử trên mọi file đang có trong `docs/plans/`; file lệch mẫu thì lệnh báo rõ chỗ lệch (`make-plan.mjs --check docs/plans`, test chạy cả 10 file, PR #135; file không có `## Checkpoint` thì lệnh coi là viết trước mẫu, in "bỏ qua" và không kiểm thêm)
- [x] Trang tổng quan dẫn sang trang này thay vì file markdown (code đã merge ở PR #137: dòng `Trang:` ở đầu file kế hoạch; nick tnt628 đăng lại trang tổng quan 19/11, thien báo đã đăng; bản dựng từ main có nút "Mở trang kế hoạch")
- [x] Mẫu dựng từ bản B nên mang theo 7 ý review của CodeRabbit ở PR #124 (bản nguồn `round-1/mot-nac.html` giữ nguyên như thien đã xem): chừa chỗ thanh mục lục khi nhảy tới một ga, thẻ nhánh là link `#...` để Tab đi đúng, kết quả thanh trượt có `role="status"`, nhãn vùng khớp ngưỡng, không ghi đè phần thien đã gõ, xoá chữ "Đã chép" khi câu đổi, mục lục bỏ sáng khi không còn mục nào; nếu lấy núm vặn của C: mốc 01/12 đứng yên thật, chọn lại ga khi cuộn ngược (PR #135; vùng "trễ" bỏ hẳn)

### 3. Mẫu luồng chạy
Xong khi: thien xem luồng "một buổi học đi qua những đâu" và tự kể lại bằng lời mà không mở `profile/MAP.md`.
Ước: 1–2 phiên
- [x] Mẫu mới ở thư mục artifacts/flow: một sơ đồ, đi từng bước; trên điện thoại sơ đồ dính trên, chữ cuộn dưới (2026-11-19, `make-flow.mjs`, file luồng JSON đúng định dạng `Diagram.mount`, ô tự kể lại lưu ở `flows/<id>`; từ 1024px sơ đồ dính bên phải; check-pages 0 lỗi; luồng đầu tiên `docs/flows/lesson.json`)
- [ ] Dùng cho: quy trình vừa đổi gì, kiến trúc sakubun, luồng nghiệp vụ trong bài BA (đã có: một buổi học; luồng nghiệp vụ BA "từ một lời nhờ tới việc giao được" gom bài BA 1–5 theo chuyện của Hà, `docs/flows/ba-request-to-story.json`, trang https://claude.ai/artifact/QBi7zKgMnEWsAKj6ygBnHw, nick tnt697, 2026-11-19; không vẽ các bước một tối Hà học để khỏi lộ bài "kéo thành luồng" của BA 6; còn kiến trúc sakubun, làm ở repo sakubun)
- Lần kể lại đầu (thien gửi từ trang 2026-11-19 09:20), nguyên văn: "mình nhắn học, claude tìm kiến thức cần ôn tập, chuẩn bị kiến thức mới, soạn, rồi chuẩn bị kit, tạo thành phẩm artifact đưa cho mình, mình học, trả lời câu hỏi, đánh giá, rồi gửi cho claude". Khớp bước 1–4 (nhắn học, gói buổi, dựng trang, học trên trang); thiếu bước 5–7 (ghi sau buổi, kiểm toàn ✓ và vòng quay lại khi thiếu, PR và merge) và vòng thẻ mới sang buổi sau. thien quyết (09:51): "coi nửa sau là việc của Claude và tính checkpoint 3 là xong". Xong khi đạt; hai việc còn mở (luồng sakubun, BA; 8/8 mẫu) làm khi tới việc đó và ở checkpoint 5.
- Kể lại luồng BA (thien gửi từ trang 2026-11-19 10:24), nguyên văn: "Hà nhờ một thứ -> Hỏi để làm gì -> Hỏi về một lần cụ thể -> Ai liên quan -> Viết user story -> Điều kiện hoàn thành -> Qua hai câu chưa -> So cách, thử với Hà". Đủ 8 bước, đúng thứ tự, nhưng là tên các khối chép lại; thiếu hai vòng lặp (điều kiện mơ hồ thì viết lại; Hà vẫn tắt máy thì quay lại hỏi) và ngăn "để sau". Giống bản tự nói lại BA 5 trùng nguyên văn: ô kể lại nên gợi viết bằng lời mình, đưa vào việc "mẫu sau phải thay mẫu cũ" hoặc mốc 01/12.
- [ ] Sau mẫu này là 8/8 mẫu; mẫu sau phải thay mẫu cũ

### 4. Đánh bóng mẫu học (ghép vào buổi học)
Xong khi: sau BA 6 và Frontend 11, thien không còn chấm bảng dán là "chưa thỏa mãn", và số lượt dựng một trang học không tăng.
Ước: 2 phiên
- [x] Bảng dán BA: một vòng so sánh cũ và mới trước BA 6 (2026-11-19, vòng 4: ba bản A · Bảng đang dùng, B · Tuyến ga, C · Làn bơi trên luồng báo vắng của BA 3; trang chọn https://claude.ai/artifact/VaxABzqfhzqqF98sgFye2L, trang bấm thử https://claude.ai/artifact/4oPPXDxqm7jSgtAiYmn3yy, nick tnt697, nguồn `round-4/`. thien chọn **B · Tuyến ga** (11:08, giống đề xuất), ô ghi chú trống. Đã chuyển vào kit: `.zones.flow.line`, `.filled` trong `it-stage.js`, bảng `inked` với thẻ `data-kind`; `template-ba.html` dùng bản này. Làn bơi (C) để dành khi thien đã quen vẽ luồng một hàng)
- [x] Màn kết có hình cho mọi buổi (quy luật đỉnh và kết) (2026-11-19: bấm "Xong buổi học" thì hiện tuyến các bước đã đi qua, ga lần lượt có tick rồi tới ga "Xong", số câu ôn và câu hỏi nhanh đúng, số phút, câu tự nói lại; `lesson.js` tự dựng, bài không soạn thêm; test `end-card.test.mjs`)
- [ ] Hai màn cạnh nhau để so trước và sau trên bàn thử
- [x] Giữ đồng hồ "nhìn N giây" khi tải lại trang (2026-11-19: giờ bắt đầu ghi trong máy, tải lại giữa lúc đếm thì đếm tiếp số giây còn lại; máy khác vẫn coi như đã xem; test trong `autosave.test.mjs`)
- [ ] Nút Nghe và Nói thay gõ vào mục "Thêm"; bỏ hẳn hay không quyết ở mốc 13/12

### 5. Gom luật vào mốc 01/12
Xong khi: thien duyệt các dòng luật ở mốc 01/12, và vòng thử gu thứ hai chạy khoảng 02/12 theo luật mới.
Ước: mốc
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
- Vòng gu 3 (đọc 2026-11-19). Xanh với cam là cặp an toàn nhất cho người mù màu: mù đỏ thấy xanh và ô liu, mù lục thấy xanh và cam ([Datawrapper](https://www.datawrapper.de/blog/colorblindness-part2), đọc đoạn trích); bảng Okabe-Ito và Paul Tol đều có cặp này ([Tol 2021](https://personal.sron.nl/~pault/data/colourschemes.pdf), đọc qua tài liệu gói khroma). Tô màu theo nghĩa giúp học: 42 sinh viên học lập trình qua video, bản tô màu cho tải nhận thức thấp hơn và kết quả tốt hơn bản xám ([Liu và cộng sự, 2021](https://doi.org/10.3389/fpsyg.2021.773328), đọc tóm tắt). Màu ấm kéo mắt hơn màu lạnh trong một thử nghiệm theo dõi mắt ([SPIE 2013](https://medicalimaging.spiedigitallibrary.org/conference-proceedings-of-spie/8651/86510W/Investigation-of-eye-catching-colors-using-eye-tracking/10.1117/12.2001141.full), đọc tóm tắt), nên cam dành cho chỗ cần nhìn. Bộ kiểm màu biểu đồ (skill dataviz, sáu mục): xanh petrol #0e7490 có độ rực 0,094, dưới ngưỡng 0,10, tô cột trông hơi xám; mực hình #0b6fa0/#c2480f/#7a5bc7 (sáng) và #3a9fd0/#e0703a/#8a74e0 (tối) đạt cả sáu, cặp gần nhất khi mù màu ΔE 19,4.

## Câu hỏi (thien đã trả lời 2026-11-19 02:53 bằng nút trên trang: "ok, theo cả 3 đề xuất")
Cho checkpoint 3 (mẫu luồng chạy). Nguyên văn câu trả lời gửi từ trang: "ok, theo cả 3 đề xuất. 1. Mỗi luồng lấy nội dung từ đâu? → Một file JSON nhỏ mỗi luồng, đúng định dạng Diagram.mount của kit: vẽ được rẽ nhánh, vòng lặp, chú thích từng bước (đề xuất) 2. Trên điện thoại đi từng bước kiểu nào? → Sơ đồ dính trên, chữ từng bước cuộn bên dưới, khối đang đọc sáng lên (đề xuất) 3. Cuối trang luồng có ô để bạn tự kể lại luồng không? → Đồng ý: có, gõ vài câu rồi gửi, Claude đọc và chỉ chỗ thiếu (đề xuất)"; chi tiết thử bản đồ ga theo ngày: "Thích".
1. Mỗi luồng lấy nội dung từ đâu?
   - Một file JSON nhỏ mỗi luồng, đúng định dạng `Diagram.mount` của kit: vẽ được rẽ nhánh, vòng lặp, chú thích từng bước (đề xuất)
   - Đọc thẳng bảng "Một việc đi qua những đâu" trong `profile/MAP.md`: không gõ lại, nhưng mỗi luồng chỉ có 4 ô xếp thẳng
2. Trên điện thoại đi từng bước kiểu nào?
   - Sơ đồ dính trên, chữ từng bước cuộn bên dưới, khối đang đọc sáng lên (đề xuất)
   - Bấm Trước, Tiếp, mỗi lần một bước, không cuộn
3. Cuối trang luồng có ô để bạn tự kể lại luồng không? Đề xuất: có, gõ vài câu rồi gửi, Claude đọc và chỉ chỗ thiếu. Đó cũng là cách kiểm "Xong khi" của checkpoint 3, không cần mở `profile/MAP.md`.

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-18 | Vòng thử gu 2 (bảng màu) chạy ngay, không chờ khoảng 02/12; cùng đợt sửa nút (viền 1px, nút đặc nổi có gờ dưới), thay icon ký tự bằng Lucide, thêm chuyển động và thành phần mới (tab, gập mở, thanh bước, gợi ý, thẻ số, đang tải, màn rỗng, báo trong dòng) | thien nhắn 23:03: muốn nền hợp nhiều loại tài liệu, nút nổi như app FAP vì viền đang dày, icon chip và huy hiệu lệch; chọn "3 bản cho mình chọn" và mở rộng cả bốn hướng |
| 2026-11-19 | Vòng gu 3: style slide MLN122 (hai mực xanh, cam có nghĩa cố định; giấy kẻ ô; khung nét mực; nhãn mono) áp vào trang học, ba mức A thêm mực, B giấy kỹ thuật cho vùng hình, C thay hẳn; `diagram.js` thêm `kind` để tô viền khối theo mực | thien: "rút ra style đó ... áp dụng vào các sơ đồ, hình ảnh, biểu đồ, background ... Adapt hoặc thay thế tùy theo đề xuất của bạn, hãy nghiên cứu kĩ" |
| 2026-11-19 | Thêm bước đóng gói trang (`artifacts/kit/pack.mjs`) vào mọi lệnh dựng trang; trau chuốt tab, gập mở, nút chỉ có icon (`.btn.icon`) | thien: "trau chuốt component và tối ưu để không bị nặng khi bạn generate ra tài liệu"; phần kit của trang học từ 102 KB còn 74 KB |
| 2026-11-19 | Trang kế hoạch: mục lục thành cột bên trái ở màn rộng (từ 1160px); bản đồ ga theo ngày không dính nữa, cuộn qua thì hiện bản gọn (chấm và tên ga đang đọc) cách mục lục 8px; trên điện thoại thanh mục lục tự ẩn khi cuộn xuống, hiện khi cuộn lên (thien chọn cách a, 02:30) | thien bấm Thích chi tiết thử bản đồ ngày, ghi chú muốn sidebar, bản đồ dính bớt sát và gọn lại khi lướt (nguyên văn trong hàng chờ gu) |
| 2026-11-19 | Điều kiện "Xong khi" của checkpoint 2 kiểm bằng ba câu hỏi của checkpoint 3 đặt ngay trên trang của kế hoạch này, thay vì chờ một kế hoạch mới | thien nhắn "bạn thực hiện cho xong nốt đi để tiến tới các phần tiếp theo" (02:48); câu hỏi của ga 3 là thật, trả lời đổi cách làm ga 3 |
| 2026-11-19 | Trang luồng: màn rộng (từ 1024px) đặt sơ đồ dính bên phải thay vì dải trên; mũi tên của sơ đồ viết lại thành chữ dưới mỗi bước; khối không phải bước nằm ở "Ngoài luồng chính" | Dải trên cùng ở màn rộng phải cuộn ngang mới thấy hết 7 bước; "không bỏ chữ" nên rẽ nhánh và vòng lặp cũng có chữ |
| 2026-11-18 | Checkpoint 2 thêm một việc: mang các ý review PR #124 vào mẫu kế hoạch | Bản nguồn của vòng gu giữ đúng như thien đã xem, nên sửa ở mẫu mới chứ không sửa bản cũ |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
| 2026-11-18 | Tooltip chung đặt sẵn chữ ẩn trên mọi `[data-tip]`, đụng tooltip riêng của trang so sánh: chữ ẩn làm trang rộng 414px trên điện thoại (check-pages bắt) | Đổi tên thành `data-hint`, chỉ dựng chữ lúc trỏ hay focus |
| 2026-11-19 | Trang luồng đặt tên lớp `.steps`, `.step` trùng thanh bước của kit: chữ canh giữa, số đếm tự thêm, điện thoại tràn 535px | Đổi thành `.beats`, `.beat`; tên lớp mới của mẫu nên tìm trong `kit.css` trước |
| 2026-11-18 | Chú thích đầu `diagram.js` có chữ `</script>`: chép vào trang thì thẻ script đóng sớm, sơ đồ không vẽ, không báo lỗi JavaScript | Bỏ chữ đó khỏi chú thích; file JS gắn vào trang không được chứa `</script>` |
