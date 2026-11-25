import sys,os,subprocess,json,shutil
sys.path.insert(0,'/home/claude/v2')
import numpy as np
from proc2 import analyse
SRC='/home/claude/rec2';GEN='/home/claude/v2/gen_orig';P='/mnt/user-data/outputs/vocabulary-express'
Z={'ㄅ':'b','ㄆ':'p','ㄇ':'m','ㄈ':'f','ㄉ':'d','ㄊ':'t','ㄋ':'n','ㄌ':'l','ㄍ':'g','ㄎ':'k','ㄏ':'h','ㄐ':'j','ㄑ':'q','ㄒ':'x','ㄓ':'zh','ㄔ':'ch','ㄕ':'sh','ㄖ':'r','ㄗ':'z','ㄘ':'c','ㄙ':'s','ㄚ':'a','ㄛ':'o','ㄜ':'e','ㄝ':'eh','ㄞ':'ai','ㄟ':'ei','ㄠ':'ao','ㄡ':'ou','ㄢ':'an','ㄣ':'en','ㄤ':'ang','ㄥ':'eng','ㄦ':'er','ㄧ':'i','ㄨ':'u','ㄩ':'yu'}
G={'再試試看 你可以的':'retry_try','星星不夠囉 請再聽一次':'no_stars','沒有聽清楚 請再說一次喔':'no_hear','沒關係 請慢慢來':'slow'}
LEAD=0.30
jobs=[]
for f in sorted(os.listdir(SRC)):
    n=f[:-4]
    if n in Z: jobs.append((os.path.join(SRC,f),f'zhuyin/zy_{Z[n]}.m4a',n))
    elif n in G: jobs.append((os.path.join(SRC,f),f'guidance/{G[n]}.m4a',n))
for g in ['ok','retry','cheer','again','pass']: jobs.append((f'{GEN}/{g}.m4a',f'{g}.m4a',g))
os.makedirs(P+'/voice-original/zhuyin',exist_ok=True);os.makedirs(P+'/voice-original/guidance',exist_ok=True);os.makedirs(P+'/voice-original/generic',exist_ok=True)
rep=[]
for src,rel,name in jobs:
    a=analyse(src);a2=None
    onset=a['onset']
    # 更敏感的偵測（floor+6 dB）：若比標準偵測早，採用較早者，確保氣音不被剪
    d=a['d'];fr=a['fr'];sr=a['sr'];thr=max(a['floor']+6,-60)
    if name not in ('ok','retry','cheer','again','pass'):
      for i in range(len(d)-2):
        if d[i]>thr and d[i+1]>thr and d[i+2]>thr: onset=min(onset,i*fr/sr);break
    start=max(0,onset-LEAD);end=min(a['dur'],a['end']+0.15)
    # backup original
    bk={'zhuyin':'voice-original/zhuyin','guidance':'voice-original/guidance'}.get(rel.split('/')[0],'voice-original/generic')
    dst_bk=f'{P}/{bk}/'+os.path.basename(rel)
    if not os.path.exists(dst_bk): shutil.copy(src,dst_bk)
    out=f'{P}/voice/{rel}'
    af=f"atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-2:LRA=7"
    r=subprocess.run(['ffmpeg','-y','-v','error','-i',src,'-af',af,'-ac','1','-ar','44100','-c:a','aac','-b:a','96k','-movflags','+faststart',out],capture_output=True,text=True)
    b=analyse(out)
    # 驗證：被剪掉的前段（0..start）最大音量必須在底噪等級
    x=a['x'];head=x[:int(start*sr)];hp=20*np.log10(np.abs(head).max()+1e-9) if len(head) else -99
    rep.append(dict(name=name,file=rel,orig=round(a['dur'],2),new=round(b['dur'],3),lead_file=round(b['onset'],3),lead_play=round(b['onset']/1.25,3),removed_head_peak_db=round(float(hp),1),floor=round(float(a['floor']),1),err=r.stderr.strip()))
json.dump(rep,open('/home/claude/v2/rep3.json','w'),ensure_ascii=False,indent=1)
for r in rep: print(r['name'],r['orig'],'->',r['new'],'lead',r['lead_file'],'play',r['lead_play'],'headpeak',r['removed_head_peak_db'],'floor',r['floor'],r['err'][:60])
