/* Bộ khung chung cho trang học (xem learning/teaching/README.md, mục "Bộ khung chung").
   1. Tự lưu chỗ đang học: ghi lại từng lần bấm và chữ đã gõ, lưu vào máy (localStorage) và vào db của trang (drafts/<id>).
      Mở lại, tải lại, hay trang được đăng bản sửa: bấm lại đúng thứ tự để về chỗ cũ.
   2. Học lại: sau khi bấm "Xong buổi học", lần mở sau ẩn phần [data-part~="review"] (ôn đầu buổi) và mở khóa nút [data-review-gate].
   Không cần sửa gì trong trang, chỉ cần các id chuẩn: #finish, #copy. */
(()=>{
const ID=(document.querySelector('meta[name="lesson-id"]')||{}).content||document.title;
const LK='lesson-kit:'+ID, DOC='drafts/'+ID.replace(/[^a-z0-9-]/gi,'-');
const btns=()=>[...document.querySelectorAll('button:not(#kit-bar button)')], tas=()=>[...document.querySelectorAll('textarea')];
const FP=btns().length+'b'+tas().length+'t';
const lab=b=>(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,60); /* chữ trên nút, để khi bấm lại biết đúng nút cũ */
const ctx=b=>{const p=b.parentElement;return p?(p.textContent||'').replace(/\s+/g,' ').trim().slice(0,120):'';}; /* chữ quanh nút: phân biệt hai nút "Chưa" ở hai câu khác nhau */
let S={fp:FP,log:[],finished:false,everDone:false,doneAt:null,start:new Date().toISOString(),ts:0};
let replaying=false,acted=false,timer=null,writing=false,again=false,db=null;
const bar=document.createElement('div');bar.id='kit-bar';bar.setAttribute('role','status');document.body.appendChild(bar);
function say(msg,withReset){bar.innerHTML='<span></span>'+(withReset?'<button type="button" data-k="reset">Học lại từ đầu</button>':'')+'<button type="button" class="x" data-k="x" aria-label="Đóng">✕</button>';
 bar.firstChild.textContent=msg;bar.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>bar.classList.remove('on'),9000);}
bar.addEventListener('click',e=>{const k=e.target.dataset.k;if(k==='x')bar.classList.remove('on');if(k==='reset'){S.log=[];S.finished=false;S.ts=Date.now();flush(true).then(()=>location.reload());}});
function local(){try{return JSON.parse(localStorage.getItem(LK)||'null');}catch(e){return null;}}
function flush(now){clearTimeout(timer);try{localStorage.setItem(LK,JSON.stringify(S));}catch(e){}
 if(!db)return Promise.resolve();if(writing){again=true;return Promise.resolve();}writing=true;
 return Promise.race([db.doc(DOC).set(S),new Promise(r=>setTimeout(r,8000))]).catch(()=>{}).then(()=>{writing=false;if(again){again=false;flush();}});}
function save(){clearTimeout(timer);timer=setTimeout(flush,700);}
function rec(a){if(replaying)return;acted=true;S.log.push(a);S.ts=Date.now();save();}
document.addEventListener('click',e=>{if(!e.isTrusted)return;const b=e.target.closest('button');if(!b||b.closest('#kit-bar')||b.id==='copy')return;
 if(b.id==='finish'){acted=true;S.finished=true;S.everDone=true;S.doneAt=new Date().toISOString();S.ts=Date.now();flush(true);return;}
 const i=btns().indexOf(b);if(i>=0)rec({c:i,x:lab(b),y:ctx(b)});},true);
document.addEventListener('input',e=>{if(replaying||!e.isTrusted||e.target.tagName!=='TEXTAREA')return;const i=tas().indexOf(e.target),last=S.log[S.log.length-1];
 if(last&&last.t===i)last.v=e.target.value;else rec({t:i,v:e.target.value,p:e.target.placeholder});acted=true;S.ts=Date.now();save();},true);
function reviewOff(){document.documentElement.classList.add('kit-review-off');document.querySelectorAll('[data-review-gate]').forEach(b=>b.disabled=false);
 if(typeof R!=='undefined'&&R)R.mode='hoc-lai';}
/* trả lại chữ đã gõ theo ô (tìm bằng placeholder), kể cả khi đã xóa trống, rồi ghi lại vào S.log để tải lại không mất */
function keepText(log){const last=new Map();for(const a of log)if('t' in a&&typeof a.v==='string'){const t=tas().find(x=>x.placeholder===a.p);if(t)last.set(t,a.v);}
 for(const [t,v] of last){t.value=v;t.dispatchEvent(new Event('input',{bubbles:true}));S.log.push({t:tas().indexOf(t),v,p:t.placeholder});}}
function apply(d){if(!d)return false;S.everDone=!!d.everDone;S.doneAt=d.doneAt||null;if(S.everDone)reviewOff();
 if(d.finished||!d.log||!d.log.length){return false;}
 if(d.fp!==FP){ /* trang đã đổi số nút: chỉ trả lại chữ đã gõ */
  S.log=[];keepText(d.log);S.start=d.start||S.start;S.ts=Date.now();save();
  say('Trang vừa được sửa nên mình chỉ giữ lại được chữ bạn đã gõ.',false);return true;}
 replaying=true;let n=0,cut=false;try{for(const a of d.log){if('c' in a){const b=btns()[a.c];
   if((a.x!==undefined&&(!b||lab(b)!==a.x))||(a.y!==undefined&&(!b||ctx(b)!==a.y))){cut=true;break;} /* nút ở chỗ đó đã khác (trang đổi thứ tự, hay xáo đáp án): dừng, không bấm nhầm */
   if(b&&!b.disabled)b.click();}else{const t=tas()[a.t];if(t){t.value=a.v;t.dispatchEvent(new Event('input',{bubbles:true}));}}n++;}}catch(e){}
 replaying=false;
 if(cut){S.log=d.log.slice(0,n);keepText(d.log.slice(n));S.start=d.start||S.start;S.ts=Date.now();save();
  say('Trang đã đổi nên mình chỉ mở lại được tới chỗ còn khớp, kèm chữ bạn đã gõ.',true);return true;}
 S.log=d.log;S.start=d.start||S.start;S.ts=d.ts||Date.now();
 if(typeof R!=='undefined'&&R&&d.start)R.start=d.start;
 say('Đã mở lại đúng chỗ bạn đang học.',true);return true;}
const L=local();const usedL=apply(L);
(async()=>{try{const dbp=window.claude&&window.claude.use?window.claude.use('db'):null;db=dbp?await Promise.race([dbp,new Promise(r=>setTimeout(()=>r(null),10000))]):null;}catch(e){db=null;}
 if(!db)return;let d=null;try{const snap=await Promise.race([db.doc(DOC).get(),new Promise(r=>setTimeout(()=>r(null),8000))]);d=snap&&(typeof snap.data==='function'?snap.data():snap.data!==undefined?snap.data:snap);}catch(e){d=null;}
 if(d&&!acted&&(!L||(d.ts||0)>(L.ts||0))){ /* bản trên db mới hơn: nếu đã bấm lại bản trong máy thì nạp lại trang từ bản db, để không bấm chồng hai lần */
  if(usedL){try{localStorage.setItem(LK,JSON.stringify(d));location.reload();}catch(e){say('Có bản lưu mới hơn ở máy khác nhưng chưa mở được. Trang giữ chỗ bạn đang học trên máy này.',false);}return;}apply(d);}else if(d&&d.everDone&&!S.everDone){S.everDone=true;S.doneAt=d.doneAt;reviewOff();}
 if(acted)save();})();
})();
