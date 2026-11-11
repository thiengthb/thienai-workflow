# Bộ quy tắc làm slide của thien

File này do thien sở hữu. AI đọc trước khi làm bất kỳ bài thuyết trình nào, dù làm bằng web, Canva hay PDF. Các bước làm nằm ở [`skills/make-slides/STEPS.md`](../skills/make-slides/STEPS.md); file này là luật, file kia là quy trình.

Nguồn của luật: hai bộ slide web thien đã làm (MLN122 nhóm 9 và PRM393 Attendo, tháng 11/2026), các nghiên cứu và hướng dẫn ghi ở cuối file. Luật có mã (S1, S2...) để thien chê hay sửa thì chỉ cần nói mã.

## Gốc

Slide là để người nghe **bám theo lời mình nói**, không phải tài liệu để đọc. Người nghe nhìn slide vài giây để biết đang ở đâu và cần nhớ gì; phần giải thích nằm trong lời nói. Muốn có tài liệu để đọc thì làm riêng (báo cáo, phụ lục), đừng nhồi vào slide.

## 1. Trước khi làm

- **S1. Có bản tóm tắt bài trước khi dựng slide nào.** Năm dòng: ai nghe, ai chấm và chấm theo gì (rubric, đề, lời dặn của thầy), được nói bao nhiêu phút, nói ở đâu (máy chiếu, online, màn to), và **một câu** người nghe phải nhớ khi ra về. Mẫu ở [`BRIEF.template.md`](BRIEF.template.md).
- **S2. Câu cần nhớ phải là một ý kiến, không phải chủ đề.** "Đi tắt được công nghệ, không đi tắt được năng lực" (MLN) là ý kiến. "Firebase trong app điểm danh" là chủ đề. Chưa viết được câu này thì chưa hiểu bài đủ để làm slide.
- **S3. Luật của người chấm đứng trước gu của mình.** Đọc kỹ rubric, đề và FAQ của môn trước; thứ dễ mất điểm (thời lượng, nguồn, khai báo AI) ghi thành dòng kiểm tra trong bản tóm tắt.

## 2. Mạch bài

- **S4. Dàn ý bằng chữ trước, thiết kế sau.** Dàn ý là danh sách tiêu đề slide, mỗi tiêu đề kèm một câu lời nói. Đọc liền các tiêu đề phải ra được câu chuyện của cả bài. thien duyệt dàn ý một lần trước khi dựng (PRM làm vậy và không phải dựng lại).
- **S5. Mở bằng một câu hỏi hoặc một tình huống người nghe gặp thật**, rồi mới nêu ý chính. Đóng bài bằng cách quay lại đúng câu hỏi đó. Cách kể "hiện tại thế này, có thể tốt hơn thế kia" (Duarte) hợp với bài thuyết phục; bài báo cáo kỹ thuật thì đi theo "vấn đề, cách làm, bằng chứng, giới hạn".
- **S6. Ba phần, mỗi phần chốt bằng một câu nối về ý chính.** Bài nhóm thì mỗi người một phần liền mạch, cuối phần có câu nối sang người sau bằng nội dung, không chỉ "em mời bạn X".
- **S7. Một slide, một ý.** Hai ý thì tách hai slide. Slide nhiều nhưng mỗi slide nói nhanh vẫn dễ theo hơn ít slide mà dày chữ.
- **S8. Slide dự phòng để ở phụ lục.** Thứ chỉ cần khi bị hỏi (bảng số chi tiết, mô hình dữ liệu, cấu hình) để sau slide kết, không chiếm giờ nói.

## 3. Chữ trên slide

- **S9. Tiêu đề là một câu khẳng định**, nói luôn điều cần nhớ, tối đa hai dòng. "Business flow", "State machine" (PRM) là nhãn; "Mỗi buổi học đi qua bốn trạng thái, chỉ giảng viên được chốt" là câu khẳng định. Nghiên cứu của Garner và Alley (2013) cho thấy sinh viên học bằng slide có tiêu đề là câu khẳng định kèm hình hiểu sâu hơn và nhớ lâu hơn slide kiểu chủ đề kèm gạch đầu dòng.
- **S10. Ngoài tiêu đề, chữ trên slide dưới khoảng 30 từ.** Phần còn lại thuộc về lời nói. Máy kiểm tra báo khi vượt.
- **S11. Không viết lên slide câu mình sắp đọc.** Người nghe vừa đọc vừa nghe cùng một câu thì hiểu kém hơn chỉ nghe kèm hình (nguyên tắc trùng lặp của Mayer). Slide giữ từ khóa, con số, hình; câu đầy đủ nằm trong lời nói.
- **S12. Gạch đầu dòng chỉ dùng khi các ý thật sự song song** (cùng loại, cùng cấp, thứ tự không quan trọng): tối đa 4 dòng, mỗi dòng một dòng chữ, không có gạch đầu dòng cấp hai. Ý có trước có sau thì vẽ thành các bước; ý so sánh thì làm hai cột; ý có quan hệ thì vẽ sơ đồ.
- **S13. Mỗi con số đi kèm đơn vị, năm và một câu nói nó nghĩa là gì.** So hai số thì phải cùng thước đo, cùng năm (bài học slide 13 của MLN).
- **S14. Từ ngữ trên slide là từ người nghe đã biết.** Thuật ngữ của môn thì giải thích bằng lời thường ngay lần đầu nói. Không dùng từ tự đặt hay dịch sát tiếng Anh (danh sách từ thien đã chê ở `profile/VOICE.md`).

## 4. Lời nói và ghi chú người nói

Ghi chú người nói là kịch bản để **nói thành tiếng**, không phải đoạn văn để đọc. Mẫu tốt nhất là đoạn thien tự viết lại cho slide 6 đến 9 của MLN (commit `36a52b2`, ngày 09/11/2026).

- **S15. Mỗi dòng là một hơi nói.** Xuống dòng ở chỗ sẽ ngắt hơi; đoạn trống ở chỗ đổi ý. Nhìn lướt là biết đang ở câu nào.
- **S16. Nói như đang kể cho bạn cùng lớp.** Câu ngắn, có hư từ nối (thì, nên, nhưng mà, vậy thì), có câu hỏi tu từ, có ví dụ đời thường ("Máy móc có thể nhập về trong một chuyến hàng. Nhưng năng lực giải quyết vấn đề thì không nhập cùng chuyến hàng đó được.").
- **S17. Lời nói không đọc lại slide.** Lời nói giải thích, kể ví dụ, chỉ vào hình ("nhìn cột bên trái"), còn slide giữ thứ để nhìn.
- **S18. Câu chuyển ở cuối mỗi slide dẫn sang slide sau** bằng một câu hỏi hoặc một ý còn treo. Không dùng "tiếp theo là phần...".
- **S19. Chỉ dẫn sân khấu để trong ngoặc vuông**: `[Bấm.]`, `[Dừng một nhịp.]`, `[Chờ 5 giây, mời một bạn.]`, `[Nói chậm.]`. Câu cần nhấn thì in đậm. Ngoặc vuông không tính vào thời lượng.
- **S20. Bài môn học có luật về AI thì AI chỉ viết dàn ý và câu chuyển**, người nói tự viết lại lời bằng giọng mình, và mỗi lần AI viết hộ đều ghi vào nhật ký AI của project. MLN122 coi "AI viết toàn bộ kịch bản" là vi phạm. Không có luật đó thì AI viết đủ lời, người nói vẫn đọc lại và sửa cho hợp miệng.

## 5. Hình, sơ đồ, ảnh, biểu đồ

- **S21. Mỗi slide một hình chính**, chiếm phần lớn khung. Hình phải làm được việc mà chữ làm kém: cho thấy quan hệ, thứ tự, so sánh, quy mô.
- **S22. Chọn hình theo loại ý:**

  | Ý muốn nói | Dùng |
  |---|---|
  | Một con số gây chú ý | Con số thật to + một câu nghĩa của nó |
  | So sánh vài con số | Thanh ngang, nhãn ghi thẳng cạnh thanh, một màu nhấn cho thứ cần chú ý, còn lại màu xám |
  | Thay đổi theo thời gian | Đường hoặc trục thời gian, mốc quan trọng ghi chữ ngay trên hình |
  | Các bước, quy trình | Hộp nối mũi tên, hiện từng bước theo lời nói |
  | Ai làm gì | Sơ đồ làn (swimlane), mỗi làn một vai |
  | Trạng thái và chuyển trạng thái | Sơ đồ trạng thái, mũi tên ghi hành động |
  | Hai lựa chọn | Hai cột, cột được chọn có viền màu nhấn |
  | Tỷ lệ trong tổng thể | Lưới 100 ô hoặc 100 hình nhỏ (MLN slide 11), không dùng biểu đồ tròn nhiều miếng |
  | Sản phẩm, giao diện | Ảnh chụp màn hình thật, cắt đúng vùng đang nói, khoanh chỗ cần nhìn |

- **S23. Sơ đồ tự vẽ bằng SVG** theo màu và font của bài. Không dán ảnh sơ đồ chụp từ công cụ khác có font và màu lệch.
- **S24. Ảnh thật trước, ảnh minh họa sau.** Ảnh chụp sản phẩm, ảnh có nguồn và giấy phép, hình nét đơn sắc tự vẽ. Không dùng ảnh stock chung chung, emoji, clip art. Ảnh AI chỉ khi môn cho phép và không phải người thật; không bao giờ tạo ảnh AI về lãnh tụ hay nhân vật có thật.
- **S25. Hình ví von không mang số liệu mới.** Bánh răng, bậc thang, sợi chỉ chỉ để kể; số trên hình phải là số đã có nguồn. Hình không được gợi nghĩa sai (vòng tròn tô màu làm người xem hiểu là phần trăm hoàn thành, như slide 18 của MLN).
- **S26. Biểu đồ ghi nhãn ngay trên hình**, không bắt người xem dò chú thích. Không 3D, không bóng đổ, không lưới đậm.

## 6. Giao diện

Gu chung theo repo `thienui` (`docs/taste.md`): tối giản, thanh lịch, đồng bộ trước đẹp sau. Riêng cho slide:

- **S27. Khung 1600×900 (16:9)**, lề 88px, dòng nguồn ở chân trái, số slide ở chân phải, ngoài ra không gì ở góc.
- **S28. Cỡ chữ cho máy chiếu.** Trên khung 1600×900: tiêu đề khoảng 64px, chữ nội dung tối thiểu 30px (bằng khoảng 18pt trên slide PowerPoint, mức tối thiểu mà Đại học Cambridge khuyên), nhãn và dòng nguồn tối thiểu 22px. Slide MLN dùng chữ 15px, tức khoảng 9pt: đẹp trên laptop, nhưng ngồi cuối lớp nhìn máy chiếu là không đọc được.
- **S29. Tương phản đủ cho máy chiếu.** Chữ phụ cũng phải đạt ít nhất 4.5:1 với nền; máy chiếu làm nhạt màu. Không để màu là cách duy nhất phân biệt hai thứ; thêm vị trí, hình dạng hoặc gạch chéo.
- **S30. Một font cho cả bài** (Onest). Muốn nhấn thì to hơn, đậm hơn, không đổi font.
- **S31. Một màu chủ đạo, tối đa thêm một màu thứ hai, và mỗi màu giữ một nghĩa cho cả bài.** MLN: xanh là công nghệ, cam là năng lực con người. Màu chủ đạo lấy theo sản phẩm hay chủ đề (PRM dùng màu của app Attendo).
- **S32. Một ý hình xuyên suốt cả bài** là chỗ để sáng tạo: một hình ảnh gắn với câu cần nhớ, xuất hiện ở bìa, ở các chỗ chuyển phần và ở slide kết ("sợi chỉ" của MLN). Sáng tạo là lệch nhỏ trong khuôn khổ đó, không phải mỗi slide một kiểu.
- **S33. Có một hai khoảnh khắc đáng nhớ**, không phải slide nào cũng phải "wow". Bài 15 slide thường chỉ cần một slide làm người nghe dừng lại nhìn (một con số lớn hiện ra, một sơ đồ tự lắp, một demo thật).

## 7. Chuyển động

- **S34. Mỗi chuyển động phải nói một điều lời nói đang nói** (hiện bước đang kể, tô thứ đang chỉ). Không có chuyển động chỉ để trang trí.
- **S35. Người nói chỉ bấm một phím để sang nhịp**, dùng được bút trình chiếu. Hình tự chạy sau mỗi nhịp; không có thứ phải rê chuột, bấm trúng chỗ, hay bấm để lật.
- **S36. Bước đang nói thì sáng, bước đã qua thì mờ đi** (nguyên tắc làm nổi bật của Mayer).
- **S37. Cảnh chuyển động xong trong khoảng 12 giây**, và người xem chọn giảm chuyển động thì hiện ngay trạng thái cuối.
- **S38. Đã thử và bị bỏ, không làm lại:** lật trang 3D, phóng gần cả slide, hiệu ứng bấm để hiện. Ở MLN, một ngày có hơn 30 commit chỉ để thêm rồi gỡ hiệu ứng; công sức đó nên dành cho lời nói và tập dượt.

## 8. Nguồn và bằng chứng

- **S39. Không đưa lên slide số liệu hay trích dẫn nào chưa mở nguồn gốc.** Không mở được thì ghi "chưa kiểm chứng" và không dùng. Theo `profile/RESEARCH.md`.
- **S40. Con số có nguồn thì bấm được để xem nguồn** (phím K của MLN và PRM), để trả lời phản biện ngay trên slide. Dòng nguồn ở chân slide ghi ngắn; slide tài liệu tham khảo ghi đủ theo chuẩn môn yêu cầu (thường là APA 7).
- **S41. Bài kỹ thuật thì bằng chứng là thứ đã chạy thật**: ảnh console, số test lấy từ CI, link PR. Chưa có thì ghi "chưa có", không để chỗ trống trông như đã có.

## 9. Thời lượng và tập dượt

- **S42. Đặt ngân sách thời gian cho từng slide** (`data-min`) và cho cả bài (`data-budget`). Ước tính ở 150 tiếng mỗi phút (nói chậm, có dừng). Lời nói vượt ngân sách thì cắt ý, không nói nhanh hơn. MLN được nói 20 phút nhưng kịch bản lúc nộp ước tính 27 phút; phần của thien một mình 8,8 phút cho 4 slide.
- **S43. Tập thành tiếng ít nhất ba lần, bấm giờ thật**, lần cuối đứng nói với slide toàn màn hình. Ghi lại thời gian thật vào bản tóm tắt để lần sau ước tính sát hơn.
- **S44. Chuẩn bị câu hỏi phản biện**: AI soạn 10 đến 15 câu khó nhất người chấm có thể hỏi, mỗi câu kèm ý trả lời và slide hay nguồn để chỉ vào. Người nói tự trả lời thành tiếng không nhìn tài liệu.

## 10. Ngày trình bày

- **S45. Slide chạy không cần mạng**: một thư mục có HTML, font, ảnh; chép vào USB là chạy. Mang thêm bản PDF phòng máy lớp không mở được.
- **S46. Thử trên máy chiếu thật hoặc màn to trước ngày nói**, đứng ở cuối phòng nhìn lại. Kiểm tra màu nhạt, chữ nhỏ, bút trình chiếu.
- **S47. Có link công khai** (GitHub Pages) để gửi thầy và người nghe xem lại.

## 11. Bài nhóm

- **S48. Khung chung do một người giữ**: câu cần nhớ, thứ tự slide, phân công người nói, giao diện. Thành viên được sửa lời nói và nội dung slide của mình, không sửa khung. Quy trình nhiều người sửa của MLN (phiếu phản biện, PR bắt buộc) bị nới sau hai ngày vì thành viên và AI của họ bị chặn; giữ luật ít nhưng có máy kiểm tra.

## Nguồn

- Garner, J., & Alley, M. (2013). How the design of presentation slides affects audience comprehension: A case for the assertion–evidence approach. *International Journal of Engineering Education, 29*(6), 1564–1579. Tóm tắt đã đọc: https://ctl.wustl.edu/in-powerpoint-its-the-headline-that-makes-the-difference/ (mở 11/11/2026).
- Mayer, R. E., 12 nguyên tắc học đa phương tiện (trùng lặp, làm nổi bật, gọn, gần nhau trong không gian và thời gian, giọng thân mật). Bản tóm tắt đã đọc: https://services.dartmouth.edu/TDClient/1806/Portal/KB/PrintArticle?ID=171655 (mở 11/11/2026).
- Duarte, phép thử nhìn lướt ("Glance Test"): người xem phải hiểu slide trong khoảng 3 giây. https://www.duarte.com/resources/guides-tools/the-glance-test/ (chưa mở toàn văn, chỉ thấy trong kết quả tìm kiếm).
- University of Cambridge, Slide accessibility guidance: chữ tối thiểu 18pt, tương phản cho máy chiếu, không dùng màu là cách phân biệt duy nhất. https://www.cctl.cam.ac.uk/slide-accessibility-guidance (mở 11/11/2026).
- Repo `thiengthb/mln122-nhom9`: `docs/quy-trinh/giao-dien.md`, `docs/quy-trinh/noi-dung.md`, `docs/HISTORY.md`. Repo `thiengthb/PRM393_Lab03_SE190533`: `docs/slides/DAN-Y.md`, `slides/`.
