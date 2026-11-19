# Mẫu trang luồng chạy

Trang kể một luồng (quy trình, kiến trúc, nghiệp vụ) bằng một sơ đồ và chữ từng bước, để thien nắm luồng bằng mắt rồi tự kể lại được mà không mở file luật. Kế hoạch: `docs/plans/2026-11-18-visual-workflow.md`, checkpoint 3. Ba lựa chọn thien chốt ngày 19/11 (bấm trên trang kế hoạch): nội dung từ một file JSON mỗi luồng; sơ đồ dính trên, chữ cuộn dưới, khối đang đọc sáng lên; cuối trang có ô tự kể lại gửi Claude.

## Trang làm được gì

- Đầu trang: tên, một đoạn mở, nhãn số bước, có vòng lặp, có rẽ nhánh, ngày cập nhật.
- Sơ đồ dính: điện thoại và máy tính bảng là dải trên cùng, sơ đồ luôn ngang và tự cuộn ngang theo khối đang đọc; từ 1024px là cột bên phải, sơ đồ tự chọn ngang hay dọc theo cột. Hết phần các bước thì dải sơ đồ trôi đi, để ô kể lại không bị nhìn sơ đồ.
- Cuộn tới bước nào thì khối đó sáng lên, dòng dưới sơ đồ ghi "Bước 3/7 · tên khối". Chạm một khối thì nhảy tới bước đó.
- Mỗi bước: chữ chính (`note`), chữ phụ (`more`), tên file hay lệnh (`chips`), và mũi tên của sơ đồ viết lại bằng chữ: "Tiếp: …", "thiếu: quay lại …", "Nhận từ … (3 thẻ đến hạn)". Hình luôn đi kèm chữ.
- Khối không phải bước (file, kho dữ liệu) nằm ở "Ngoài luồng chính", kèm `note` của nó.
- Tự kể lại: ô hỏi thẳng "Luồng rẽ ở đâu? Quay lại ở đâu?" và dặn kể bằng lời mình, không chép tên khối (thien kể ba lần đều chép tên khối, KH8 câu 9, 2026-11-19); ô chữ lưu vào máy và db của trang ở `flows/<id>`; "Gửi cho Claude" gửi comment, không gửi được thì tự chép.
- Khối đã đọc qua viền xanh mực, số có tick nhỏ (nay là mặc định). Chi tiết thử (Thích, Không) chỉ có khi truyền `--trial "..."`: thien thấy trang nào cũng một chi tiết thử là khung lặp (2026-11-19).

## File luồng viết thế nào

Mỗi luồng một file JSON, đúng định dạng `Diagram.mount` của kit (`artifacts/kit/diagram.js`), nên dùng lại được trong trang học hay trang mẫu. Các trường thêm của trang (`intro`, `updated`, `sources`, `page`, `more`, `chips`) thì `Diagram.mount` bỏ qua. Luồng của repo này ở `docs/flows/`; luồng của repo khác (kiến trúc sakubun) để ở `docs/flows/` của repo đó.

```json
{
  "title": "Một buổi học đi qua những đâu",
  "intro": "Một đoạn mở, cho `code`, **đậm** và [link](https://...)",
  "updated": "2026-11-19",
  "sources": ["learning/README.md"],              ← file luật mà luồng tóm, link ở chân trang
  "page": "https://claude.ai/artifact/...",        ← điền sau lần đăng đầu, lần sau tự đăng đè
  "nodes": [{ "id": "prep", "label": "Gói buổi", "kind": "k1" }, { "id": "cards", "label": "Thẻ ôn", "note": "khối phụ cần note" }],
  "edges": [["prep", "make"], ["check", "after", "thiếu"]],    ← [từ, tới, nhãn?]; tới một bước đứng trước là vòng lặp
  "steps": [{ "id": "prep", "note": "chữ chính", "more": "chữ phụ", "chips": ["artifacts/lesson/prepare-lesson.mjs"] }]
}
```

`kind`: `k1` viền xanh cho công cụ, file, dữ liệu; `k2` viền cam cho việc của thien (mực hình của kit). `id` chỉ dùng chữ không dấu, số, `_`, `-`.

## Cách AI dựng một trang

1. Viết hay sửa file luồng, rồi `node artifacts/flow/make-flow.mjs docs/flows/<luồng>.json /tmp/flow` (thêm `--repo owner/repo` cho repo khác, `--url <link>` để đăng đè, `--trial "..."` khi có thứ mới cần thien thử; mặc định không có). Lệnh in chỗ sai: "lỗi" chặn dựng (id trùng, mũi tên trỏ tới khối không có, không có bước), "lệch" chỉ báo (bước chưa có chữ, khối không nối).
2. Gọi Artifact với đúng tham số trong `/tmp/flow/publish.json`. Mở thử: `/tmp/flow/preview.html`. Trang mới thì điền `"page"` vào file luồng.
3. Khi thien gửi bản kể lại: đọc comment và `flows/<id>` (ArtifactData), so với các bước, chỉ chỗ thiếu hay sai thứ tự. Kết quả vào kế hoạch hay PR của việc đang làm.

Chỉ kiểm: `node artifacts/flow/make-flow.mjs --check docs/flows` (thoát 1 khi có lỗi).

## File

| File | Là gì |
|---|---|
| `make-flow.mjs` | Kiểm file luồng, dựng thân trang, gộp kit, dagre, `diagram.js`, ghi `publish.json`; `--check` để chỉ kiểm |
| `template.html` | Khung và CSS của trang (chỉ dùng tên màu trong kit) |
| `flow.js` | Sơ đồ sáng theo chỗ đang đọc, chạm khối để nhảy, ô kể lại, lưu và gửi |
| `fixture.json` | Luồng mẫu cho test và `kit/check-pages.mjs` |
