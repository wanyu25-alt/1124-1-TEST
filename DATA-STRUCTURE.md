# DATA-STRUCTURE｜第01階段共用資料結構

資料版本 `S.dv = 3`（原 v2 為單一個案）。儲存位置沿用 IndexedDB `trafficHero/kv`，key `'s'`（整份狀態）與 `'zya'`（自訂音檔）。升級前備份：key `backup-pre-dv3`。

## 1. 個案 `S.lrn`
```
S.lrn = { cur:'L001', list:[個案…], store:{ <個案ID>: 該個案的隔離資料 } }
```
**使用中個案的隔離資料直接放在 `S.rw / S.logs / S.recs / S.mst / S.quits / S.rounds / S.rv`**（原有程式不用改）；其他個案的同名資料收在 `S.lrn.store[id]`。切換個案時互換。

個案欄位：`id, name(暱稱), age(選填), stage(1–6), goal1, goal2, scope(教材範圍: all|c:<分類ID>|mk|wk), oralDiff, spellDiff, listenDiff(1–3), hint{u,cost,n,free}(注音提示), hl{w,c,p,f,a}(語音／注音按鈕開關), wait(等待秒數), judge(A開口/B老師確認/C語音辨識), note, stageDiff{1..6}, archived, created, modified, ext{}`
個人化鼓勵錄音：`S.cx` 之外，存在 `zya` 鍵 `P:<個案ID>:<ok|retry|cheer|pass|again>`。

## 2. 詞彙／教材
既有圖卡 `S.cards[]`（id, text, zy, img, audio, cats…）**不變**（網站教材更新會整個取代圖卡物件，所以擴充資料另放）。
擴充 `S.cx[圖卡ID] = { pos, sem, scene, rel{verbs,nouns,feats}, alts[], gimgs[{id,img,note}], pv[{id,label,key}] }`
`WD.word(card)` 組合成完整詞彙物件：`id, text, zy, tones[], pos, sem, scene, images[{id,kind:'original'|'generalized'}], recording, partialVoice[], rel, alts, review`。未設定＝`null`／空陣列（未知）。
圖片 ID：原始 `IMG-<圖卡ID>-o`；類化 `IMG-<圖卡ID>-g<序號>`。部分語音提示音檔：`zya` 鍵 `H:<圖卡ID>:<序號>`。
教學／複習紀錄（每位個案）：`S.rv[圖卡ID] = {teach, assess, ok, last, lastOutcome}`。

## 3. 作答紀錄 `S.recs[]`（每次作答一筆，`sv:1`）
| 欄位 | 說明 |
|---|---|
| id, learnerId | 作答紀錄ID、個案ID |
| taskId, taskVer | 學習任務（S1.key／S1.listen／S1.spell／S2.speak）與版本 |
| itemId, itemKind, itemText | 詞彙（未來可為短語）ID |
| stage, game, indicators[] | 學習階段、遊戲類型、對應能力指標（暫定 M1–M7） |
| qImgId | 題目圖片ID（無圖＝null） |
| purpose | teach／assess／unknown（老師指定） |
| first{answer,result}, final{answer,result} | 首次／最終作答內容與結果（打字：輸入到第一個錯誤為止） |
| outcome | correct／wrong／no_response／unconfirmed／skipped／tech_error |
| hints[{order,type,at,stages?,cost?,deducted?}] | 提示種類與順序（zy_stage, zy_full, zy_full_direct, voice_word, voice_char, voice_prompt, adult, zy_legacy） |
| rtBeforeHint, rtAfterHint, rtFirstInput, durMs | 反應時間（毫秒）；無提示＝null |
| tries, attempts | 錯誤次數、作答次數 |
| asr[{text,alts,matched,at}], asrEngine, manual{used,choices,retries} | 語音辨識結果、人工確認 |
| independent | 是否獨立完成（無提示、無大人協助） |
| novelCombo, newImage, unk{} | 新組合／新圖片；**null＝未知或不適用**，`unk` 寫明原因（單詞階段無組合） |
| ts, iso, dev | 時間、裝置類型 |
| reward{starsGained,starsSpent,station} | 獲得的遊戲獎勵 |
| tech[{code,msg,at}] | 技術事件（麥克風、語音辨識錯誤…） |
| ext{} | 預留未來欄位（目前放學習模式、再聽次數、V2 口語細節） |

結果判定：正確＝輸入完整答對；錯誤＝離開前有輸入錯誤；無反應＝離開前沒有任何輸入；未確認＝語音有辨識／重試但沒被確認；跳過＝按「⏭ 跳過」；技術異常＝發生麥克風／語音辨識／音訊錯誤且無有效作答。

舊版 `S.logs[]` 照舊寫入（原有「紀錄」頁面與 CSV 不受影響）。

## 4. 遷移與回復
- 第一次開啟新版：備份到 `backup-pre-dv3` → 建立「預設個案 L001」→ 既有資料原封不動歸入 → `S.mig` 記錄升級。可重複執行。
- 匯出入：完整備份 ZIP 新增 `learners.json`（所有個案資料）、`word-ext.json`（進階教材欄位）；匯入舊版備份仍可用（紀錄歸入使用中個案）。
- 回復：還原 `backup/vocabulary-express-v2.1-stable.zip`，或以個案頁下載的 `backup-pre-dv3` 為準。


## 第02階段新增欄位（資料版本仍為 3，全部可選、向下相容）
- 教材擴充 `S.cx[詞彙ID]`：新增 `use`（物品用途）、`approx`（可理解的近似說法）；既有 `pos`、`scene`、`alts`、`gimgs`、`pv` 為各題型所需。
- 個案設定 `LRN.list[i].ps`：`pkN`（選項數 2–4）、`pkDist`（mix／near／far）、`sw`（等待秒數）、`auto`（最高自動提示）、`zyAb`（是否會注音）、`hints`（提示順序）、`hon`（個別提示啟用）、`flow`（整合流程步驟）、`fw`（每輪詞數）、`fg`（重測間隔題數）、`fade`（是否提示褪除）。
- 全域 `S.set.rvi`：間隔複習天數（預設 `0,1,3,7,14`）。`S.set.pks`／`S.set.sps`：目前選圖／說詞題型。
- 作答紀錄 `S.recs[]` 新增：`sub`（題型）、`kind`（normal／retest／review）、`retestOf`、`retestFrom`、`maxHint`（0–4）、`indepRetrieval`、`contentCorrect`、`clarity`、`confusions`、`pk{n,dist,correctPos,opts,choices,replays}`、`sp{cls,label,evs,by,matchedBy,evidence,imitated}`、`fadeScheduled`、`reward.kind`（independent／hinted／participation／none）。
- 提示類型 `hints[].type`：`P1`、`P2`、`P3_voice`、`P3_zy`、`P4_voice`、`P4_zy`、`P4_show`（選圖時標示答案），另附 `level`。
- 複習狀態 `S.rv[詞彙ID].sr`：`base`、`step`、`due`、`reasons[]`、`hist[]`、`mastered`；`S.rv[詞彙ID].fade{n,indep}`；`S.rv[詞彙ID].exposed`。
- `sp.cls` 值：`ok_indep`、`ok_prompted`、`ok_imitated`、`attempt`、`wrong`、`none`、`unrecognized`。


## 第03階段新增欄位（資料版本仍為 3，全部可選）
- `S.cb[]`（共用教材）組合：`{id, rel, parts[詞彙ID×2–3], text, zy, ctx, ok(是否合理), alts, approx, img, mx:{id,r,c}|null}`。`rel` 為 act_obj／need_obj／refuse_obj／feat_obj／person_act／obj_loc／act_place／state／again_end。
- `S.mx[]`（共用教材）矩陣：`{id, name, rel, rows[], cols[], cells:{ "列詞ID|欄詞ID": {plan:'teach'|'assess'|''} }}`；每格對應一個 `S.cb`（`mx` 欄位指回矩陣）。
- 詞彙卡 `part:true`＝詞彙零件（文字車廂），不進一般練習題庫。
- 個案設定 `LRN.list[i].p3`：`{rels:[關係順序], on:{關係:0|1}}`；`S.set.cbScope`（all／untaught／taught）、`S.set.cbRel`。
- **各個案組合狀態** `S.rv[組合ID].cmb`：`{taught, taughtAt, taughtBy, demo(是否播過完整短語示範), demoAt, demoBy, demoSrc, firstNew:{recId,ts,channel,game,outcome,independent,hints,first}, firstNewBy:{compose|oral|literacy}, hist[], oralIndep}`。`firstNew` 只在組合仍為未教過、且題目有實際操作時寫入一次。
- 作答紀錄新增：`itemKind:'combo'`（`itemId`＝組合ID）、`channel`（compose／oral／literacy）、`compCorrect`（圖片組合正確）、`oralCorrect`、`oralIndependent`、`spontaneous`、`oralParts[]`、`novelCombo`（題目開始時是否未教過）、`combo{id,rel,relName,parts[{cid,text,role}],matrix,taughtBefore,demoBefore,novel,swap,validCombo}`、`cg`（車廂題選項／選擇／排列結果）。`game` 值：cbm／cbc／cbo（車廂）、speak（口語，`sub`＝cbs／cbx）、spell／listen（短語打字）。
- `taskId`：S3.cbt／S3.cbm／S3.cbc／S3.sub.v／S3.sub.o／S4.cbo／S4.cbs／S4.cbx／S4.cbp／S4.cbl。


## 第04階段新增欄位（資料版本仍為 3，全部可選）
- `S.se[]`（共用教材）語句：`{id, pat(句型), chain[層級，由短到長], text(完整句), parts[車廂], orders[其他合理語序], ctx(情境線索), img, alts, approx, core(關鍵詞), variants[{id,img,kind:image|person|scene|combo,label}], ok}`。每一層都是合理答案。
- `S.sc[]`（共用教材）生活情境：`{id, name, emoji, vis, intent(request|refuse|help|rest|feel|again|share|find), ctx, prompt(系統問句), expected[可接受說法，第一個供示範], core[關鍵詞], approx, img, variants[], builtin, custom, on}`。
- **各個案狀態** `S.rv[語句／情境ID].se`：`{taught, demo, demoSrc, firstNew(只寫一次), firstNewBy{channel}, hist[], lvTop(擴展階梯), seenVar[], oralIndep}`。完整示範（示範教學、P4 語音、拼打聽打看過整句）後不再是「未直接教過」。
- 個案設定 `LRN.list[i].p4`：`{cx(是否開啟較複雜句型), pat{句型:0|1}, sc{情境:0|1}, scOrder[], aq(等待兩輪後自動問一次，預設關)}`；`S.set.p4Gen`（orig／variant／noimg）、`S.set.seScope`。
- **`S.ob[]` 生活觀察紀錄（與 `S.recs` 完全分開）**：`{id, learnerId, ts, iso, text, setting(home|school|other), settingNote, partner, purpose, initiated(y|n|u), prompted(none|partial|full|u), mode(oral|gesture|card|mixed), observer, note, newContext(真實生活類化), src:'real_life'}`。
- 作答紀錄新增：`itemKind:'sentence'|'scene'`、`channel`（compose／oral／literacy）、`comm{type:spontaneous|responded|prompted|imitated|aac|none, questionAsked, questionSrc, altKind, adultHelped, needMet, lvTarget, lvReached, lvSrc, expanded, fullSentence}`、`spontaneous`、`initiated`、`sentence{id,pattern,chain,targetLevel,taughtBefore,demoBefore,novel}`、`scene{id,name,intent,acceptedBy}`、`generalization{inGame:true, realLife:false, kinds[different_image…|person|scene|combo|untaught_sentence|no_original_image], variantId}`、`novelSentence`、`eg`（車廂作答細節）。
- `taskId`：S5.sxt／S5.sxc／S5.sxo／S5.sxs／S5.sxe／S5.sxx／S5.sxp／S5.sxl／S6.scn／S6.scq／S6.scc。`game` 為實際模式（口語題為 `speak`，題型在 `sub`／`sp`）。
- 溝通類型判定：無內容提示且未被問 → `spontaneous`；系統／成人問句後無內容提示 → `responded`；P2／P3 → `prompted`；P4（完整語音或完整注音）→ `imitated`；手勢／圖卡 → `aac`（非口語，如實記錄，不計入口語指標）；其餘 → `none`。P1（慢慢想）不含內容，不改變類型。看圖命名（sxs 等）永遠不計入主動溝通。
- 材料匯出入：語句／情境／觀察紀錄包含在「完整備份」（整份狀態）；單獨的教材匯出（圖卡、分類）格式不變。


## 第05階段新增欄位（資料版本仍為 3，全部可選）
- `S.as`（只在教師調整規則或做人工修正時才建立；計算報告本身不寫入任何資料）：
  - `ver`：規則版本字串 `1.0.N`；`rules`：與預設不同的門檻（`minN`、`minNWord`、`unk`、`delayH`、`confMin`、`maxAnHint`）。
  - `log[]`：`{ver, ts, by, note, changes{欄位:{from,to}}, rules}`，每次調整一筆。
  - `fix{ 作答紀錄ID: [ {id, ts, by, reason, set{outcome|purpose|exclude|independent}, orig{outcome,purpose,independent}, revoke} ] }`：人工修正疊加層，**不改 `S.recs` 原始紀錄**；最後一筆非撤銷者生效，撤銷也是一筆歷程。
- 生活觀察 `S.ob[].purpose` 新增值：`comment`（評論）、`ask`（提問）、`name`（實物命名）；舊值 `share` 保留（舊紀錄含評論）。
- 報告物件（`AS.calc()` 回傳，不儲存）：`meta{spec,rules,counts,…}`、`c1`–`c7`、`lit`；每個指標 `{label, num, den, unc, pct, status('ok'|'low'|'none'), note}`。
- 使用的作答紀錄欄位：`taskId, itemKind, itemId, game, sub, channel, purpose, outcome, first.result, independent, hints[].level／type, maxHint, kind(retest), rtFirstInput, ts, ext.closedBy, pk.sub/n, newImage, novelCombo/novelSentence, combo{swap,taughtBefore,demoBefore,parts}, sentence{taughtBefore,demoBefore}, comm{type,expanded}, spontaneous, generalization{kinds}`。

## 第06階段：教師後台（v6.0）
- `S.acl`：`{salt,it,h(PBKDF2式雜湊),rsalt,rh(復原碼雜湊),fails,lockUntil,ts,audit[{ts,action,note}]}`；無 `h` 代表尚未設定密碼。
- `S.as.err{ 作答ID:{cat,ts,by,note,prev} }`、`S.as.errLog[]`：教師對錯誤類型的確認（可撤銷）。
- 個案 `p.ext.goals[]`：`{id,text,pri,key,base{num,den,pct,ver},status,notes[],ts}`；`p.ext.cfgLog[]`：`{ts,field,from,to}`；`p.ext.excl[]`：此個案排除的教材ID。
- 儀表板、熱力表、趨勢、報表皆即時由紀錄計算，不儲存。

## 第07階段：推薦與每日任務（v7.0）
- 全域 `S.rc`：`{ver:'1.0.N', rules:{門檻覆寫}, log:[{ts,ver,note,changes{欄位:{from,to}}}]}`（規則版本與調整紀錄）。
- 個案 `p.ext.rc`：`ia{skip{步驟:{ts,note}}, sup{步驟:{lvl:can|part|not,note,ts}}, started}`、`mins`（每日分鐘，0=預設）、`zy`（auto|yes|no）、`need`（R04–R07 或空）、`lit`、`active{1,2:推薦}`、`cancelled{規則:ts}`、`lastSug`、`log[]`（系統建議／接受／修改／取消／階段變更；推薦快照含 why、practice、minutes、parent、ind{label,target,base}、evidence[]、rule、ver、ts）、`wordStage{詞彙ID:階段}`、`daily{date,t0,mins,sig,items[{id,state,n0,target,launch,rule}],cur,lastSync,rewarded,paused,evs[]}`。
- 推薦、進階判斷、最近進步皆由紀錄即時計算，不儲存結果（只儲存教師決定與當時快照）。

## v8.0 新增（皆為可選欄位，資料版本仍為 3）
- `S.set.inputPicked`（布林）：使用者／教師是否明確選過輸入方式。未選過時，`S.set.input` 的 `'phys'` 視為「自動判斷」。
- `S.set.micRem`、`S.set.micLaterAt`（毫秒時間戳）：麥克風提醒最後一次互動／按「稍後再設定」的時間。
- `LRN.cur().ext.rs`：斷點接續快照 `{v:1,ts,rid,set:{mode,mix,theme,src,order,lm,pks,sps},ids:[剩餘題目卡片id],done,total,lid}`。每位個案各自一份；12 小時過期；題目卡片不存在即不提供；完成一輪（arrive）即清除；只支援看圖打字／聽音打字／看字拼音／看圖說詞／聽詞選圖／聽詞認識，詞組與語句情境類不支援。


## v9.0 新增（皆為可選欄位，資料版本仍為 3）
| 位置 | 內容 |
|---|---|
| `p.ext.fl` | 個案上次的選擇：`mode`、`n`（5/10/15/20）、`star`（鍵 `模式:站號` → 1–5，各站各模式獨立）、`range`（`rec`/`rv`/`pick`）、`cat`、`veh` |
| `p.ext.pref` | 個案個別化設定快照（`vol vv recRate ttsRate aps keySnd sound vf ap hintMode adult waitSec autoNext anim fx uiSize uiAid mv music`…）；沒有的欄位＝用預設。切換個案時自動套用；「恢復預設」會刪除它 |
| `p.ext.recSt` | 老師勾選的推薦站（最多兩個，1–6） |
| `p.ps.pkN` | 圖片選項數量（沿用既有欄位，設定頁可改） |
| `S.set.flbk` | 練習進行中的暫存備份（開始前的 src/n/theme/hl/pks/sps/p4Gen/order）。正常離開、完成、開機時會還原並刪除 |
| `S.set.legacyCost` | 舊版「提示扣星」相容開關，預設不存在＝關閉，只給回歸測試用 |
| 作答紀錄 `rec.ext.aid` | 當題實際輔助：`hint hl adult wait autoPlay symVoice pkN autoNext recRate ttsRate vol vv sound teacherVoice anim size look input forced` |
| 作答紀錄 `rec.ext.fl` | `st mode star act range` |
| 作答紀錄 `rec.reward.kind='encourage'` | 該題只拿到 1 顆鼓勵星（有效嘗試但未完成） |
| 範圍 `S.set.src` 暫時值 | `rec`（系統推薦）、`rv`（複習學過的詞彙）只在練習中存在；存入個案 `scope` 時會回到 `all` |
| `STG[1].n` | 站名改為「詞彙練習站」（站號不變，舊紀錄不受影響） |

**遷移**：不需要。舊資料沒有這些欄位時一律使用預設；匯出入沿用既有格式（個案資料含 `ext`）。
**復原到 v8.0**：`git checkout v8.0-ui-phase01`；v9.0 新增欄位在 v8.0 會被忽略，不會損壞資料。


## v10.0 新增（皆為可選欄位，資料版本仍為 3）
| 位置 | 內容 |
|---|---|
| `S.set.keyVoice` | 注音按鍵發音開關（預設開；個案設定快照 `p.ext.pref.keyVoice` 會覆蓋） |
| `S.set.cfBy` | 成人確認時預設的確認者（成人／家長／老師／治療師／其他） |
| `rec.session` | `{id（練習場次＝本輪 id）, learnerId, idx（第幾題）, n}` |
| `rec.sp.attempt` | 是否有可觀察的口語嘗試（辨識有結果、偵測到聲音或大人確認有開口） |
| `rec.sp.asrUsed`、`rec.sp.asrFail` | 是否使用語音辨識；辨識失敗次數（不算答錯） |
| `rec.sp.demoType`、`rec.sp.hintTypes` | 完整示範的實際類型（voice／zhuyin／text）、本題實際提示類型清單 |
| `rec.sp.cls` 新值 | `partial`（部分口語表達）、`tech`（技術問題） |
| `rec.confirm` | `{source, final, by, ts, iso, history:[{choice,label,by,ts,at,prev?,late?}], revisions, late?}`；沒有人工確認為 `null`。**不覆蓋 `rec.asr`、`rec.first`、`rec.outcome`** |
| 作答 `man[]`（暫存於 RE.cur） | 每筆 `{choice, by:'adult', role, at, ts}`，`choice` 可為 correct/partial/attempt/wrong/none/tech |

**口語十種結果對照**：自主正確＝`ok_indep`；部分提示後＝`ok_prompted`（P2/P3，或完整注音／文字）；完整示範後仿說＝`ok_imitated`（P4 語音）；部分口語＝`partial`；有效嘗試＝`attempt`；確認錯誤＝`wrong`；未出現口語＝`none`；辨識失敗待確認＝`unrecognized`（outcome `unconfirmed`）；技術異常＝outcome `tech_error`；跳過＝outcome `skipped`。
**遷移**：不需要。舊紀錄沒有 `confirm/session/sp.attempt`，指標會用既有欄位保守計算。
**復原到 v9.0**：`git checkout v9.0-phase02`。

## v11.0 新增（皆為可選欄位，資料版本仍為 3）
個案 `LRN.cur().ext.vp`（每位個案各自一份）：
- `rules`：教師調整過的規則參數（只存與預設不同者）；預設 `famN 3、famSess 2、recentK 4、recentFail 1、stableGap 7、stableN 1、minEv 3、gaps [0,1,3,7,14,30]、immN 2`。
- `rh`：規則版本紀錄 `[{ver,ts,by,changes[]}]`；目前版本＝`1.0` 加 `-t<次數>`。
- `sm`：出題設定 `{ratio:{fam,need,new}, newPause, on, il:'auto|block|inter', per:0|1|2, assigned:[詞彙id], carry}`。
- `snap`：每個詞彙×能力上次的狀態字串（用來偵測狀態變更）；`log`：狀態變更紀錄（最近 400 筆）`{ts,w,t,ab,from,to,ver,basis[]}`。
- `notes`：生活口語運用觀察 `{id,w,kind:'spont|asked|none',txt,by,ts}`（只有 spont／asked 會成為證據）。
- `plans`：最近 40 次出題 `{id,ts,n,ab,ver,ratio,target,actual,pct,avail,fallback[],note,baseline?,kind?,words[{id,t,b}]}`。

每筆作答紀錄 `rec.ext.vp`：`{rv:規則版本, imm:是否剛聽過答案立即作答, sm:{pid,b}|null, note?}`；`rec.sp.imm`（口語題）。

履歷本身**不另存**：`VP.prof(詞彙id)` 由 `S.recs`、`S.rv.*.exposed` 與 `notes` 推算 `{ab:{lc,pi,si,sp,zy,dc,ph,se,gn,dl}:{state,flag,regressed,cap,c:{I,P,D,A,F},basis[],sch:{step,due,why},last}, last, next}`。
表現等級：I 獨立、P 部分提示／修正後、D 完整示範後（含剛聽完答案立即作答）、A 有嘗試、F 確認錯誤；技術異常、未確認、沒有回應、跳過、辨識失敗不列入。
能力對應：聽詞選圖→圖片辨認（3 張以上或相似干擾也算聽詞理解）；不同圖片／用途選圖、情境說詞→不同圖片及情境；看圖說詞→自主說詞＋提示後說詞（完整示範後只算示範後）；注音／拼打→注音拼打（畫面有注音提示時只算提示後）；聽打→詞彙聽打；組合紀錄→短語組合（依組合內各詞）；句子紀錄→語句表達（以句子文字出現的詞彙推算，單字詞不推算）。
遷移：舊資料沒有 `ext.vp` 時 `VP.ext()` 補預設；舊作答紀錄沒有 `ext.vp` 時視為非立即作答。

## v12.0 新增（皆為可選欄位，資料版本仍為 3）
**靜態資料（不進資料庫）**：`vocab/vocabulary.json`（詞彙：`id,word,zhuyin,category,categoryId,images[],primaryImage,hasImage,reviewStatus,pronunciationReview`）、`vocab/categories.json`（`id,name,count,withImages`）、`vocab/manifest.json`、`vocab/images/VOCxxxx_NN.webp`。對應：`word→text`、`zhuyin→zy`、`categoryId→cats`（經 `S.lib.cm` 對照到本機分類）、`id` 原樣保留。

**`S.lib`（老師資料，與靜態資料分開）**
- `ver`：詞彙庫版本；`en{id:1}`：已啟用；`cm{CATxx:本機分類ID}`：分類對照（同名既有分類→合併，否則 `LIB-CATxx`）；`merged{CATxx:既有分類ID}`。
- `ov{id}`：老師對單一詞彙的修改——`zy`（注音）、`zyRev`（`pending／ok／edited`）、`rv`（`pending／approved`，圖片審核）、`primary`（主要圖片）、`hide[]`（隱藏的內建圖片路徑）、`add[{d,ts}]`（老師新增圖片，data URL）、`cats[]`（額外分類）、`audio`（老師錄音，停用時暫存）。
- `upd{v,c,ts}`：匯入的更新（與靜態資料合併成有效詞彙庫）；`log[]`：最近 200 筆操作。
**卡片（`S.cards`，啟用時產生）**：`{id:'VOCxxxx',text,zy,img,imgs[],libPrim,libRv,lib:1,audio,cats,…}`。`img` 是相對網址（`vocab/images/…`）；**未審核或無圖時 `img` 為空字串**，所以所有既有看圖題型自然排除它。`imgs[]` 為全部圖片。
**個案 `ext.lib`**：`{mode:'fixed|rotate|random',rot{id:n},last{id:url},use{id:{檔名:次數}}}`；**`ext.libSel`**：該學生使用的內建詞彙 ID（缺省＝全部已啟用）。
**匯出 `library.json`**：`{kind:'library',en,ov,cm,upd,merged}`；cards.json／categories.json 不含內建詞彙與內建分類（匯入時由 library.json 還原）。
**遷移**：沒有需要遷移的舊資料；沒有 `S.lib` 的舊備份可直接匯入；取代式匯入若檔案沒有 library.json，會清除本機的詞彙庫設定（符合「取代」）。
