// Chép bộ khung chung (kit.css, kit.js) vào một trang học. Chạy lại được nhiều lần: thay bản cũ.
// node learning/teaching/kit/apply-kit.mjs learning/war/pages/lesson-02.html [lesson-id]
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const file=process.argv[2];if(!file){console.error('Cần đường dẫn trang');process.exit(1);}
const id=process.argv[3]||(()=>{const m=file.replace(/\\/g,'/').match(/learning\/([^/]+)\/pages\/lesson-(\d+)/);return m?m[1]+'-'+m[2]:path.basename(file,'.html');})();
let s=fs.readFileSync(file,'utf8');
const css=fs.readFileSync(path.join(here,'kit.css'),'utf8'),js=fs.readFileSync(path.join(here,'kit.js'),'utf8');
s=s.replace(/<style id="lesson-kit-css">[\s\S]*?<\/style>\n?/,'').replace(/<script id="lesson-kit">[\s\S]*?<\/script>\n?/,'')
 .replace(/<meta name="lesson-id"[^>]*>\n?/,'').replace(/<meta name="color-scheme"[^>]*>\n?/,'');
s=s.replace(/<meta name="viewport"[^>]*>/,m=>m+'\n<meta name="color-scheme" content="light dark">\n<meta name="lesson-id" content="'+id+'">');
s=s.replace('</head>','<style id="lesson-kit-css">\n'+css+'</style>\n</head>');
const i=s.lastIndexOf('</body>');s=s.slice(0,i)+'<script id="lesson-kit">\n'+js+'</script>\n'+s.slice(i);
fs.writeFileSync(file,s);console.log('Đã gắn bộ khung vào',file,'(id '+id+')');
