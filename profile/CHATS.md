# Một chat, một mục tiêu

Luật cho mọi chat của thien với AI, ở mọi project và mọi nick. Thêm ngày 2026-11-15, sau số đo đầu tiên ở đợt 0 của [`docs/plans/2026-11-15-lean-learning.md`](../docs/plans/2026-11-15-lean-learning.md): 55% usage của một chat dài là phần AI đọc lại toàn bộ chat ở mỗi lượt, nên chat càng dài thì mỗi bước sau càng đắt. AI không tự đóng hay tự mở chat được; luật này là cách gần nhất.

## Đầu chat
- Câu trả lời đầu tiên có một dòng mục tiêu: "Mục tiêu chat này: <việc>". Mục tiêu là một việc có điểm xong rõ: một PR, một buổi học, một câu hỏi.
- Buổi học là một mục tiêu gồm cả dựng trang lẫn phần "sau buổi", vì kết quả bấm "Xong buổi học" quay về đúng chat đã dựng trang. Nên mở chat mới cho buổi học, đừng nhắn "học" ở cuối một chat đã làm việc khác.

## Khi xong mục tiêu
Xong là khi PR đã mở, buổi học đã ghi và mở PR, hay câu hỏi đã trả lời. Lúc đó AI tự làm, thien không phải nhắc:
1. Đo usage: phiên có skill `explain-usage` thì chạy nó (tốn khoảng một lượt, ở chat dài cỡ 1–2% usage của cả chat). Không có thì ghi "chưa đo".
2. Ghi một dòng vào `docs/usage-log.md` của repo đang làm, trong chính PR của việc đó (repo chưa có file thì tạo theo mẫu ở [`../docs/usage-log.md`](../docs/usage-log.md)). Không có PR (chỉ hỏi đáp) thì bỏ qua bước này.
3. Còn việc dở thì ghi sổ bàn giao như [`HANDOFF.md`](HANDOFF.md).
4. Kết câu trả lời bằng một dòng: "Xong mục tiêu chat này. Việc tiếp theo: <việc>. Mở chat mới và nhắn "tiếp tục"." Chat mới đọc sổ bàn giao và STATUS nên tự biết làm gì, thien không phải dán gì.

## thien giao việc mới trong chat đã xong mục tiêu
- Việc nhỏ (một câu hỏi, sửa một dòng, mở một link): làm luôn.
- Việc lớn (nhiều bước, một PR mới, một buổi học): ghi việc đó vào sổ bàn giao với lời của thien ở mục "thien muốn gì", rồi trả một dòng: "Việc này nên làm ở chat mới cho đỡ tốn. Mình đã ghi vào sổ, chat mới nhắn "tiếp tục"." thien vẫn muốn làm ở đây thì làm.
