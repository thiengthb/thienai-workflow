# Một chat, một mục tiêu

Luật cho mọi chat của thien với AI, ở mọi project và mọi nick. Thêm ngày 2026-11-15; đổi ngày 2026-11-17 theo số đo ở [`docs/plans/2026-11-15-claude-usage.md`](../docs/plans/2026-11-15-claude-usage.md) (thien chọn phương án B: đổi chat theo ngưỡng bằng số). AI không tự đóng hay tự mở chat được; luật này là cách gần nhất.

Phạm vi: các mục từ "Căn cứ" tới "Việc kế tiếp" là cho **project bản cũ** (mỗi chat riêng), đo ở một nick (tnt697). Bảng ngưỡng là hướng dẫn đang thử tới lần xem lại, không phải luật cứng. **Project bản beta** theo mục "Project bản beta" ở cuối file.

## Căn cứ (số đo 2026-11-15 tới 2026-11-17, nick tnt697)
- Mở chat mới tốn khoảng 3 lượt, khoảng 1% phiên (khoảng 100 nghìn quy đổi).
- Mỗi lượt đọc lại cả chat, nên chat càng dài thì mỗi lượt càng đắt: sau khoảng 28 lượt, mỗi lượt đắt hơn chat mới khoảng 7 nghìn quy đổi [chưa kiểm ở chat khác]. Nên đổi chat chỉ có lời khi chat đã dài và việc kế tiếp còn hơn khoảng 15 lượt.
- Dừng lâu (11 tới 79 phút) không làm tốn thêm, nên dừng lâu không phải lý do để đổi chat. Tắt connector không giảm usage.
- Làm phần "sau buổi" ngay trong chat dựng bài rẻ hơn chat mới khoảng 2–3% phiên mỗi buổi; bản ghi đủ ý như nhau.

## Đầu chat
- Câu trả lời đầu tiên có một dòng mục tiêu. Mục tiêu là một việc có điểm xong rõ: một PR, một buổi học, một câu hỏi. Việc xong trong một lượt: "Mục tiêu chat này: <việc>". Việc nhiều bước: "Mục tiêu: <việc> · Sẽ ra: <PR, trang, doc...> · Xong khi: <thien thấy gì>"; tin của thien gộp nhiều việc thì nói thêm thứ tự sẽ làm.
- Chỉ hỏi lại khi câu trả lời đổi thứ sẽ ra: tối đa 2 câu, mỗi câu có lựa chọn và một lựa chọn mặc định để thien trả lời "ok". Lý do: có lần AI hiểu sai ý (2026-11-17, sau buổi Frontend 7) mà không hỏi lại.
- Buổi học là một mục tiêu gồm cả dựng trang lẫn phần "sau buổi", vì kết quả bấm "Xong buổi học" quay về đúng chat đã dựng trang. Làm "sau buổi" ngay trong chat đó, không mở chat mới.

## Khi xong mục tiêu
Xong là khi PR đã mở, buổi học đã ghi và mở PR, hay câu hỏi đã trả lời. Lúc đó AI tự làm, thien không phải nhắc:
1. Đo usage, chỉ khi có kế hoạch đang đo (hiện là đợt 3 của [`docs/plans/2026-11-17-workflow-review.md`](../docs/plans/2026-11-17-workflow-review.md): chat dựng bài và sau buổi của hai buổi học kế tiếp). Phiên có skill `explain-usage` thì chạy nó; không có thì ghi tổng số lượt và bước nào lâu nhất. Ngoài lúc đó bỏ qua bước 1 và 2: đo cũng tốn lượt.
2. Có đo thì ghi một dòng vào `docs/usage-log.md` của repo đang làm, trong chính PR của việc đó (repo chưa có file thì tạo theo mẫu ở [`../docs/usage-log.md`](../docs/usage-log.md)).
3. Còn việc dở thì ghi sổ bàn giao như [`HANDOFF.md`](HANDOFF.md).
4. Kết câu trả lời bằng một dòng việc tiếp theo, theo bảng ở mục dưới: ở lại thì "Xong mục tiêu chat này. Việc tiếp theo: <việc>, làm tiếp ở đây được."; đổi thì "Xong mục tiêu chat này. Việc tiếp theo: <việc>. Mở chat mới và nhắn "tiếp tục"." Chat mới đọc sổ bàn giao và STATUS nên tự biết làm gì, thien không phải dán gì.

## Việc kế tiếp: ở lại hay mở chat mới
Không ước số lượt bằng cảm giác. Tra số lượt của việc kế tiếp trong bảng (số đo thật ở `docs/usage-log.md`), so với độ dài chat đang có:

| Việc kế tiếp | Số lượt đã đo | Ở lại hay đổi |
|---|---|---|
| Hỏi đáp, sửa một dòng, mở một link | dưới 5 | ở lại |
| PR nhỏ, 1–2 file | khoảng 10 | ở lại |
| Dựng một buổi học mới | 22–30 | mở chat mới nếu chat đang quá 30 lượt |
| PR nhiều file, lập hay sửa kế hoạch | hơn 15 | mở chat mới nếu chat đang quá 30 lượt |
| Sau buổi của buổi vừa dựng | 15–20 | luôn ở lại chat dựng bài |

- Chat chưa quá 30 lượt thì ở lại, kể cả việc mới.
- Claude bắt đầu tự tóm tắt chat (chat quá dài) thì mở chat mới, dù việc nhỏ.
- Việc phải đổi chat: ghi việc đó vào sổ bàn giao với lời của thien ở mục "thien muốn gì", rồi trả một dòng: "Việc này nên làm ở chat mới cho đỡ tốn (chat đã <số> lượt). Mình đã ghi vào sổ, chat mới nhắn "tiếp tục"." thien vẫn muốn làm ở đây thì làm.
- Loại việc chưa có trong bảng: đo lần đầu rồi thêm một dòng.

## Project bản beta
Nguồn: [tài liệu Claude Projects](https://code.claude.com/docs/en/claude-projects), mục "Choose models and let Claude manage context" và "Usage and cost" (đọc 2026-11-17). Đây là cách Claude đã làm sẵn, nên không thêm ngưỡng hay bước đo riêng.
- Một thread một việc; việc mới thì chat điều phối mở thread mới. Không cần dòng "Mục tiêu chat này": tên thread đã nói việc.
- Thread tự nén khi dài, không phải tự quản ngữ cảnh, nên không có ngưỡng 30 lượt.
- Thread nghỉ quá khoảng 1 giờ (thời gian giữ cache của gói Pro, Max) mà nhận tin mới thì đọc lại cả cuộc trò chuyện trước khi làm. Việc mới thì mở thread mới, thường rẻ hơn hồi sinh một thread cũ lớn.
- Thread đang theo dõi PR sẽ thức dậy và tốn usage mỗi khi có CI hay comment trên PR đó. PR đã xong thì bảo thread thôi theo dõi.
- Xem usage ở Project settings > Usage: token theo từng thread, từng model, và phần của chat điều phối. Đây là chỗ đo cho đợt 3 ở bản beta, không cần `explain-usage` hay chụp màn.
- Thread mặc định chạy Opus với effort cao, tốn usage nhanh nhất; đổi ở Project settings > General. Chọn model nào là việc của thien.
- Buổi học: dựng trang và "sau buổi" trong cùng thread như bản cũ. [Chưa kiểm ở beta] kết quả bấm "Xong buổi học" có quay về đúng thread đã dựng trang không.

## Xem lại luật này
Sau 10 dòng mới trong `docs/usage-log.md` hoặc ngày 2026-12-01, mốc nào tới trước: so các chat theo luật này với số cũ, sửa bảng nếu số lượt đổi. Chỗ chưa chắc: con số 7 nghìn mỗi lượt mới tính từ một chat; Settings làm tròn tới 1%; mọi số đo ở một nick và một kiểu phiên (bản cũ). Mục "Project bản beta" xem lại khi tài liệu Claude Projects đổi.
