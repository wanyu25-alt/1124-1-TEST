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
