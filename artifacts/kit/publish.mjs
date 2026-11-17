// Ghi sẵn thông số đăng artifact cho các script dựng trang (make-round, make-decision, make-lesson, publish-progress).
// Ra <out>/publish.json đúng các tham số của công cụ Artifact, để AI đăng bằng một lần gọi, không phải tự gõ lại.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Writes <out>/publish.json and returns the lines to print.
 * file_path defaults to <out>/index.html; url (an existing artifact) makes it an update in place instead of a new page.
 */
export function writePublish(out, { file_path, url, files, capabilities, icon, description }) {
  mkdirSync(out, { recursive: true });
  const params = { file_path: file_path || join(out, 'index.html'), ...(url ? { url } : {}), ...(files && Object.keys(files).length ? { files } : {}), capabilities, ...(url ? {} : { icon }), description };
  writeFileSync(join(out, 'publish.json'), JSON.stringify(params, null, 2) + '\n');
  return [
    `Đăng: gọi Artifact với đúng các tham số trong ${join(out, 'publish.json')} (${url ? 'cập nhật trang cũ ' + url : 'artifact mới'}).`,
    // Project bản beta không có công cụ Artifact, đăng bằng các lệnh của server claude-artifacts (đo 2026-11-17, buổi BA 4 mất 4 lượt đi tìm).
    `Project bản beta: publish_files với files [{as: "index.html", path: "${params.file_path}"}]${url ? ', slug và base_version của trang cũ (get_artifact)' : `, title "${description}", icon "${icon}"`}, rồi read_declaration và declare_capabilities với capabilities trong publish.json.`,
    ...(file_path ? [] : [`Mở thử trên máy: ${join(out, 'preview.html')}`]),
  ];
}
