# 第 12 批：六個真人操作引導語音。依實際發聲點把開頭靜音修到約 0.3 秒，統一 -18 LUFS，AAC 單聲道 44.1kHz。
# 原始檔保留在 voice-original/guidance/（檔名＝程式識別碼）。用法：python3 tools/process-guide-voice.py <含六個 m4a 的資料夾>
import sys,os,subprocess,re,shutil,json
SRC=sys.argv[1];R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP={'152b9b29':('listen_carefully','請仔細聽'),'4bcbffcb':('what_is_this','這是什麼'),'4c24af8d':('your_turn','換你說囉'),'65e1a54b':('repeat_after_me','請跟我說一次'),'a614f271':('speak_louder','請大聲一點點喔'),'a97ebb55':('find_it','請找找看')}
os.makedirs(R+'/voice-original/guidance',exist_ok=True);rep=[]
for f in sorted(os.listdir(SRC)):
    k=f[:8]
    if k not in MAP or not f.endswith('.m4a'):continue
    idn,txt=MAP[k];src=os.path.join(SRC,f);bk=f'{R}/voice-original/guidance/{idn}.m4a'
    if not os.path.exists(bk):shutil.copy(src,bk)
    o=subprocess.run(['ffmpeg','-hide_banner','-i',src,'-af','silencedetect=noise=-42dB:d=0.03','-f','null','-'],capture_output=True,text=True).stderr
    se=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)];ss=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)]
    dur=float(re.search(r'Duration: (\d+):(\d+):([\d.]+)',o).expand(r'\1')) if False else float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src]))
    onset=se[0] if se and ss and ss[0]<0.01 else 0.0
    end=ss[-1] if ss and ss[-1]>onset+0.2 else dur
    start=max(0,onset-0.30-0.0);stop=min(dur,end+0.15)
    out=f'{R}/voice/guidance/{idn}.m4a'
    subprocess.run(['ffmpeg','-y','-v','error','-i',src,'-af',f'atrim=start={start:.3f}:end={stop:.3f},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-2:LRA=7','-ac','1','-ar','44100','-c:a','aac','-b:a','96k','-movflags','+faststart',out],check=True)
    nd=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out]))
    rep.append(dict(id=idn,text=txt,orig_file=f,orig_dur=round(dur,2),onset=round(onset,2),new_dur=round(nd,2),file=f'voice/guidance/{idn}.m4a'));print(rep[-1])
json.dump(rep,open(R+'/voice/guidance/guide-voice-map.json','w'),ensure_ascii=False,indent=1)
