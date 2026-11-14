// Chỉ cho trang học CŨ (dựng trước artifacts/lesson/, 2026-11-14): chép phần tự lưu (autosave.js) và lớp chế độ tối cho trang cũ
// (legacy.css) vào trang. Trang mới dựng bằng artifacts/lesson/make-lesson.mjs, không dùng lệnh này. Chạy lại được: thay bản cũ.
// node artifacts/kit/apply-kit.mjs learning/war/pages/lesson-02.html [lesson-id]
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const file=process.argv[2];if(!file){console.error('Cần đường dẫn trang');process.exit(1);}
const id=process.argv[3]||(()=>{const m=file.replace(/\\/g,'/').match(/learning\/([^/]+)\/pages\/lesson-(\d+)/);return m?m[1]+'-'+m[2]:path.basename(file,'.html');})();
let s=fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n');
const css=fs.readFileSync(path.join(here,'legacy.css'),'utf8'),js=fs.readFileSync(path.join(here,'autosave.js'),'utf8');
s=s.replace(/<style id="lesson-kit-css">[\s\S]*?<\/style>\n?/,'').replace(/<script id="lesson-kit">[\s\S]*?<\/script>\n?/,'')
 .replace(/<meta name="lesson-id"[^>]*>\n?/,'').replace(/<meta name="color-scheme"[^>]*>\n?/,'');
s=s.replace(/<meta name="viewport"[^>]*>/,m=>m+'\n<meta name="color-scheme" content="light dark">\n<meta name="lesson-id" content="'+id+'">');
s=s.replace('</head>','<style id="lesson-kit-css">\n'+css+'</style>\n</head>');
const i=s.lastIndexOf('</body>');s=s.slice(0,i)+'<script id="lesson-kit">\n'+js+'</script>\n'+s.slice(i);
fs.writeFileSync(file,s);console.log('Đã gắn bộ khung vào',file,'(id '+id+')');
