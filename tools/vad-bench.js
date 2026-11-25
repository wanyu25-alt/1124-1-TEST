#!/usr/bin/env node
/* 自適應 VAD 對照測試：同一組「合成」測試音訊，比較舊版固定門檻與新版自適應 VAD。
   用法：node tools/vad-bench.js [index.html 路徑]   （直接從 index.html 擷取實際出貨的 VAD 程式碼）
   ⚠ 這是合成訊號（諧波＋共振峰＋音節起伏）模擬，不是真人錄音，也不是語音辨識；
      真實學生聲音、iPad、各瀏覽器的結果仍需實機驗證。ASR 成功率無法在此量測，故不報告。 */
const fs=require('fs'),path=require('path');
const file=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null)||path.join(__dirname,'..','index.html');
const src=fs.readFileSync(file,'utf8');const a=src.indexOf('/*MV-CORE-BEGIN*/'),b=src.indexOf('/*MV-CORE-END*/');
if(a<0||b<0){console.error('找不到 MV-CORE');process.exit(1)}
const {MVC,mvFeat,MVAD}=new Function(src.slice(a,b)+';return{MVC,mvFeat,MVAD}')();
const SR=48000,N=1024,HOP=800;            /* 60 fps */
let seed=12345;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=rnd();return (u-3)/Math.sqrt(.5)};
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let len=2;len<=n;len<<=1){const ang=-2*Math.PI/len,wr=Math.cos(ang),wi=Math.sin(ang);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const ur=re[i+k],ui=im[i+k],vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci,vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;re[i+k]=ur+vr;im[i+k]=ui+vi;re[i+k+len/2]=ur-vr;im[i+k+len/2]=ui-vi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}}
const dbA=d=>Math.pow(10,d/20);
/* ---- 信號產生（回傳 Float32Array，單位為滿刻度 1.0） ---- */
function speech(durS,dB,f0=160){const n=Math.round(durS*SR),x=new Float32Array(n),F=[[700,90],[1200,110],[2600,160]];let ph=0;
 for(let i=0;i<n;i++){const t=i/SR,f=f0*(1+.06*Math.sin(2*Math.PI*3*t));ph+=2*Math.PI*f/SR;let v=0;for(let h=1;h<=30;h++){const fh=f*h;if(fh>4500)break;let g=0;for(const [fc,bw] of F)g+=Math.exp(-Math.pow((fh-fc)/bw,2));v+=g*Math.sin(ph*h)/Math.pow(h,.4)}
  const env=.55+.45*Math.sin(2*Math.PI*3.5*t-1.2);x[i]=v*Math.max(.12,env)}
 let s=0;for(const v of x)s+=v*v;const k=dbA(dB)/Math.sqrt(s/n);for(let i=0;i<n;i++)x[i]*=k;return x}
function wnoise(durS,dB){const n=Math.round(durS*SR),x=new Float32Array(n);for(let i=0;i<n;i++)x[i]=gauss();let s=0;for(const v of x)s+=v*v;const k=dbA(dB)/Math.sqrt(s/n);for(let i=0;i<n;i++)x[i]*=k;return x}
function lownoise(durS,dB){const x=wnoise(durS,0),y=new Float32Array(x.length);let a=0,b=0;for(let i=0;i<x.length;i++){a=a*.985+x[i]*.015;b=b*.985+a*.015;y[i]=b}let s=0;for(const v of y)s+=v*v;const k=dbA(dB)/Math.sqrt(s/y.length);for(let i=0;i<y.length;i++)y[i]*=k;return y}   /* 風扇／冷氣 */
function burst(durS,dB,decay,lowFreq){const n=Math.round(durS*SR),x=new Float32Array(n);let lp=0;for(let i=0;i<n;i++){let v=gauss();if(lowFreq){lp=lp*.9+v*.1;v=lp*3}x[i]=v*Math.exp(-i/SR/decay)}let s=0;for(const v of x)s+=v*v;const k=dbA(dB)/Math.sqrt(s/n);for(let i=0;i<n;i++)x[i]*=k;return x}
function music(durS,dB){const n=Math.round(durS*SR),x=new Float32Array(n),nt=[262,330,392,523];for(let i=0;i<n;i++){const t=i/SR,f=nt[Math.floor(t*3)%4];x[i]=Math.sin(2*Math.PI*f*t)+.3*Math.sin(2*Math.PI*2*f*t)}let s=0;for(const v of x)s+=v*v;const k=dbA(dB)/Math.sqrt(s/n);for(let i=0;i<n;i++)x[i]*=k;return x}
const sil=d=>new Float32Array(Math.round(d*SR));
const cat=(...a)=>{const n=a.reduce((s,x)=>s+x.length,0),o=new Float32Array(n);let p=0;for(const x of a){o.set(x,p);p+=x.length}return o};
const mix=(a,b)=>{const n=Math.max(a.length,b.length),o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=(a[i]||0)+(b[i]||0);return o};
const at=(x,t,len)=>{const o=new Float32Array(len);o.set(x,Math.round(t*SR));return o};
/* ---- 舊版（固定門檻）：與 v3.2 micLoop 同公式：byte 取樣、rms*2.8*4 平滑 0.7/0.3 後 > .12，說話結束 1200ms ---- */
function oldDetect(sig,gain=2.8){let sm=0,ev=[],on=false,t0=0,last=0;const out=[];
 for(let p=0;p+N<=sig.length;p+=HOP){let s=0;for(let i=0;i<N;i++){const v=Math.round(sig[p+i]*127)/128;s+=v*v}const rms=Math.sqrt(s/N),lv=Math.min(1,rms*gain*4);sm=sm*.7+lv*.3;const t=p/SR*1000;
  if(sm>.12){if(!on){on=true;t0=t}last=t}else if(on&&t-last>1200){out.push({t0,t1:last});on=false}}
 if(on)out.push({t0,t1:last});return out}
/* ---- 新版 ---- */
function newDetect(sig,opt={}){const v=new MVAD(opt.cfg);const out=[];let st=null;let curT=0,cAt=0;v.on={start:t=>{cAt=curT},end:e=>{if(!e.rejected)out.push({t0:e.t0,t1:e.t1,conf:cAt})}};
 if(opt.floor!=null){v.floor=opt.floor;v.thr=v.target()}
 const re=new Float64Array(N),im=new Float64Array(N),spec=new Float32Array(N/2),time=new Float32Array(N),win=new Float64Array(N);for(let i=0;i<N;i++)win[i]=.5-.5*Math.cos(2*Math.PI*i/(N-1));
 for(let p=0;p+N<=sig.length;p+=HOP){for(let i=0;i<N;i++){time[i]=sig[p+i];re[i]=sig[p+i]*win[i];im[i]=0}fft(re,im);for(let k=0;k<N/2;k++)spec[k]=10*Math.log10((re[k]*re[k]+im[k]*im[k])/(N*N)*4+1e-14);
  curT=p/SR*1000;v.process(mvFeat(time,spec,SR),curT,true)}
 v.process({db:-140,br:0,fl:1,lo:0},sig.length/SR*1000+4000,true);return{ev:out,vad:v}}
const cover=(ev,a,b)=>ev.some(e=>e.t0<=b&&e.t1>=a);
/* ---- 測項 ---- */
const R=[];function row(name,old,nw,unit){R.push({name,old,nw,unit})}
const NF=-60;                                            /* 安靜教室的環境噪音 */
function utterTrial(dB,{noise=NF,slow=false,pause=0,seedOff=0}){seed=1000+seedOff;const lead=3.2,w=slow?1.4:.7;let parts=[sil(lead),speech(w,dB,150+rnd()*100)];if(pause)parts.push(sil(pause),speech(w,dB,150+rnd()*100));parts.push(sil(3));const s=cat(...parts),tot=s.length/SR,x=mix(s,wnoise(tot,noise));const a=lead,b=lead+w+(pause?pause+w:0);return{x,a:a*1000,b:b*1000,tot}}
function detRate(dB,o){let po=0,pn=0,lat=0,nl=0;const T=30;for(let k=0;k<T;k++){const t=utterTrial(dB,{...o,seedOff:k});if(cover(oldDetect(t.x),t.a,t.b))po++;const nd=newDetect(t.x);const c=nd.ev.find(e=>e.t0<=t.b&&e.t1>=t.a);if(c){pn++;lat+=Math.max(0,c.conf-t.a);nl++}}
 return{old:po/T,nw:pn/T,lat:nl?lat/nl:null}}
for(const [lbl,dB] of [['一般音量（−22 dBFS）',-22],['小聲（−34 dBFS）',-34],['非常小聲（−44 dBFS）',-44]]){const r=detRate(dB,{});row('語音偵測率 · '+lbl,r.old,r.nw,'ratio');row('VAD 延遲 ms · '+lbl,null,r.lat,'ms')}
{const r=detRate(-34,{noise:-50});row('小聲 −34 dBFS＋較吵環境 −50 dBFS 偵測率',r.old,r.nw,'ratio')}
{const r=detRate(-30,{slow:true,pause:1.6});
 /* 詞中停頓 1.6 秒：新版要「一段」連續涵蓋兩個字；舊版 1.2 秒就會斷 */
 let po=0,pn=0;for(let k=0;k<30;k++){const t=utterTrial(-30,{slow:true,pause:1.6,seedOff:k});const o=oldDetect(t.x),n=newDetect(t.x).ev;if(o.some(e=>e.t0<=t.a+300&&e.t1>=t.b-300))po++;if(n.some(e=>e.t0<=t.a+300&&e.t1>=t.b-300))pn++}
 row('慢速說話（每字 1.4 s、字間停 1.6 s，−30 dBFS）整段不被切斷',po/30,pn/30,'ratio')}
/* 誤觸發：每種 60 秒（2×30 次試驗取平均每分鐘觸發數） */
function falseRate(name,gen){let fo=0,fn=0;const T=10;for(let k=0;k<T;k++){seed=777+k;const x=gen();fo+=oldDetect(x).length;fn+=newDetect(x).ev.length}row('誤觸發 次/分鐘 · '+name,fo/T,fn/T,'perMin')}
falseRate('安靜環境底噪 −60 dBFS',()=>wnoise(60,-60));
falseRate('風扇／冷氣（低頻持續）−38 dBFS',()=>mix(lownoise(60,-38),wnoise(60,-62)));
falseRate('剛開啟的風扇（第 10 秒起 −36 dBFS 持續）',()=>cat(wnoise(10,-60),mix(lownoise(50,-36),wnoise(50,-62))));
falseRate('敲桌聲（每 6 秒一次，−20 dBFS）',()=>{const L=60*SR;let x=wnoise(60,-60);for(let t=5;t<58;t+=6)x=mix(x,at(burst(.25,-20,.03,true),t,L));return x});
falseRate('拍手（每 7 秒一次，−18 dBFS）',()=>{const L=60*SR;let x=wnoise(60,-60);for(let t=5;t<58;t+=7)x=mix(x,at(burst(.2,-18,.02,false),t,L));return x});
falseRate('咳嗽（每 9 秒一次，−26 dBFS，0.3 s）',()=>{const L=60*SR;let x=wnoise(60,-60);for(let t=5;t<58;t+=9)x=mix(x,at(burst(.3,-26,.1,false),t,L));return x});
falseRate('背景音樂洩漏（持續 −35 dBFS）',()=>mix(music(60,-35),wnoise(60,-60)));
/* 校準 */
{const x=mix(lownoise(4,-52),wnoise(4,-58));const r=newDetect(x);row('環境底噪校準結果（真值約 −51 dBFS）',null,+r.vad.floor.toFixed(1),'dB')}
console.log('合成訊號 VAD 對照（舊＝v3.2 固定門檻；新＝自適應）。⚠ 非真人錄音、非語音辨識。\n');
const f=(v,u)=>v==null?'—':u==='ratio'?(v*100).toFixed(0)+'%':u==='ms'?Math.round(v)+' ms':u==='perMin'?v.toFixed(1):u==='dB'?v+' dB':v;
const w=Math.max(...R.map(r=>[...r.name].length))+2;console.log('項目'.padEnd(w)+'舊版'.padEnd(10)+'新版');
for(const r of R)console.log(r.name.padEnd(w)+f(r.old,r.unit).padEnd(10)+f(r.nw,r.unit));
if(process.argv.includes('--json'))fs.writeFileSync(path.join(__dirname,'vad-bench.json'),JSON.stringify(R,null,1));
/* 產生真實瀏覽器端到端用的假麥克風音檔（Chromium --use-file-for-fake-audio-capture）：node tools/vad-bench.js --wav out.wav */
const wi=process.argv.indexOf('--wav');if(wi>0){seed=4242;const out=process.argv[wi+1]||'fake.wav';
 const seg=[sil(3),speech(1.2,-30),sil(3.5),speech(1.2,-42),sil(3.5),burst(.25,-20,.03,true),sil(3.5),speech(1.0,-28),sil(.8),speech(1.0,-28),sil(3.5)],x=mix(cat(...seg),wnoise(seg.reduce((s,a)=>s+a.length,0)/SR,-58));
 const buf=Buffer.alloc(44+x.length*2);buf.write('RIFF',0);buf.writeUInt32LE(36+x.length*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(x.length*2,40);
 for(let i=0;i<x.length;i++)buf.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(x[i]*32767))),44+i*2);fs.writeFileSync(out,buf);console.log('wrote',out,(x.length/SR).toFixed(1)+'s')}
