// Ghi sẵn thông số đăng artifact cho các script dựng trang (make-round, make-decision).
// Ra <out>/publish.json đúng các tham số của công cụ Artifact, để AI đăng bằng một lần gọi, không phải tự gõ lại.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Writes <out>/publish.json and returns the lines to print. */
export function writePublish(out, { files, capabilities, icon, description }) {
  const params = { file_path: join(out, 'index.html'), files, capabilities, icon, description };
  writeFileSync(join(out, 'publish.json'), JSON.stringify(params, null, 2) + '\n');
  return [
    `Đăng: gọi Artifact với đúng các tham số trong ${join(out, 'publish.json')} (artifact mới cho mỗi vòng).`,
    `Mở thử trên máy: ${join(out, 'preview.html')}`,
  ];
}
