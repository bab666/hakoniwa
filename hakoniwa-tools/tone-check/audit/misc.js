/* 文の崩れの判定（judge misc。2026-10-29 担当MQ）：使われなくなった小さな道具（text-audit・punct-audit・stage-audit・emo-audit・daily-audit）の
   判定のうち、今の仕様でも価値のあるものを一つにまとめ、audit-all の全部のパスの回に当てる（自分のパスは持たない）。
   どの項目も、統合前の各道具の既定の回（2026-10-29 の HEAD）で 0 件だったもの。正規表現は元の道具のまま
     T1  置き換え漏れ（{a} {place} など・undefined・NaN・null・[object）。記録の本文・理由・結末の行（text-audit の T1。daily-audit の D3・emo-audit の E4 の {a} もここに。小文字の {…} はすべて数える）
     T2  空の記録（text-audit の T2）
     T3  かぎかっこ・！？の重なり（」」 「「 ！！！！ ？？？。text-audit の T3。。。・、、は P3 にまとめた）
     T5  全年齢（全年齢モード・全年齢版）で性的な語（text-audit の T5。orient の O5 より語が広い）
     T8  迷宮の語がダンジョン・RPG 以外の箱庭に出た（text-audit の T8）
     T9  その箱庭にしかないはずの語が、ほかの箱庭の文に出た（text-audit の T9）
     T10 体の語の印（{男性器} など）が結果に残った（text-audit の T10）
     P1〜P5 文頭の句読点・画面の行頭の句読点（HK.fmtLong のあと）・句読点の重なり・文頭の台詞のあとの句点・句点のすぐあとの記号（punct-audit）
     FI  性的な場面（登場人物が住人二人）で、指を動かしている段落のすぐ次に、指を抜かずに挿入が始まる（stage-audit の F>I）。A>P（事後のあとに絶頂）は語の拾い方に誤判定が多いので参考
     E1  悲しみの深い人（grief が HK.Emo.LOVE_BLOCK 以上）が恋愛の出来事の主役になった（emo-audit の E1。記録の直前に見る）
     E2  気分の一句（HK.Emo の句）が、一つの区切りの中に二度出た（emo-audit の E2）
     E4  全年齢で「火照り」の句／値（emo-audit の E4。置き換え漏れは T1）
     D2・D4 日常の場面（daily-kit.js）の場所と時間帯の矛盾・家族の日常が恋愛になった（daily-audit）。D3（置き換え漏れ）は T1 に、
         D5（その場にいない人）は state の S1・S25・S26 にまとめた。D1（同じ日常の文の重複の割合）は参考 */
'use strict';
const JUDGE = function (HK, opt) {
  const SAFE = !!HK.SAFE_ON;
  const KEYS = ['T1', 'T2', 'T3', 'T5', 'T8', 'T9', 'T10', 'P1', 'P2', 'P3', 'P4', 'P5', 'FI', 'E1', 'E2', 'E4', 'D2', 'D4'];
  const out = { n: {}, ex: {}, runs: 0, info: { AP: 0, lewdEv: 0, dailyLines: 0, dailyDup: 0 }, apEx: [] };
  KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
  let curRun = null;
  /* text-audit の hit と同じ形（k, 箱庭, 回, 文） */
  function hit(k, sc, s, t) { out.n[k]++; if (out.ex[k].length < 4) out.ex[k].push(sc + '#' + s + '（' + (curRun ? curRun.pass : '') + '） | ' + String(t).replace(/\n/g, ' ').slice(0, 240)); }
  /* ---- text-audit ---- */
    const LMK = /\{(?:男性器|亀頭|女性器|陰核|ナカ|胸|乳首|尻|後ろ|精液|愛液|股間)\}/;
    /* T9：その箱庭にしかないはずの語が、ほかの箱庭の文に出た（出られない部屋の前提の文の混入など）。語の右は、出てもよい箱庭 */
    const FOREIGN = [
      [/脱出の条件|部屋の条件|出られない部屋|木箱の道具/, ['whiteroom']],
      [/白い部屋/, ['whiteroom', 'hole']],
      [/冒険者|宝箱|ダンジョン|迷宮|魔物/, ['dungeon', 'rpg', 'hole']],
      [/宇宙船|コールドスリープ/, ['ship']],
      [/無人島に漂着|筏/, ['island']],
      [/ゾンビ|避難キャンプ/, ['zombie']],
      [/邪神|御神酒/, ['jashin']],
      [/吹雪の館/, ['yakata']],
      [/媚薬ガス|媚薬ロッカー/, ['locker', 'variety']],
      [/施術台|施術/, ['massage', 'kaihen']],
      [/遮断穴/, ['hole']],
      /* 宇宙船の星の生命体（岩甲羅など）の「発情期」は、その星の生き物の話なので宇宙船でも出てよい（2026-10-29 担当MQ。group の配役の回で出た） */
      [/発情期/, ['omega', 'ship']], [/抑制剤/, ['omega']],
      [/合コン/, ['goukon']],
      [/常識改変/, ['kaihen']],
      [/サキュバス/, ['succubus']],
      [/人狼ゲーム|処刑の投票/, ['jinro', 'trial']],
      [/被告人|裁判長/, ['trial']],
      [/支給品/, ['br']],
      [/担任|学年/, ['classroom', 'br']],
      [/催眠術|暗示を/, ['saimin']]
    ];
    const DUNGEON_RE = /迷宮|魔物|冒険者|次の部屋|罠の部屋/;
    const PH = /\{(?:a|b|c|d|x|y|t|m|n|p|v|w|sensei|name|o|h|s|sa|sb|T|U|place|kind|ue|shita|yobi|oya|ko|oyayobi|shin|note|bw|L|S|race|like|hate|taste|dish)\}|\{[a-z]+\}|undefined|NaN|\bnull\b|\[object /;
    const PUNCT = /」」(?!」)|「「|！！！！|？？？/;   /* 。。・、、 は P3 で見る（2026-10-29 担当MQ：重なりを一つに） */
    const SEX = /挿入|挿れ|射精|精液|愛液|ちんぽ|喘ぎ|腰を振|フェラ|絶頂|イっ|イく|中に出|(?<!殺人を|罪を|過ちを|ミスを|法を|規則を|禁を)犯[さし]|セックス|性交|乳首|秘部|膣|陰茎|肉棒|勃起|♡|淫ら|快楽堕ち|種付け|孕ま/;
  /* ---- punct-audit（P4 の名前は回ごとに住人の名前で作る） ---- */
    const RE = {
      P1: /(?:^|[\n 　「『])…*[。、]/,
      P3: /[。、][。、]/,
      P4: /。」。|(?<=^|[。！？）\s―…])(?:アキラ|ミナト|ユキノ|カオル|ハルカ|レンジ|ソウタ|カエデ)?(?:「[^「」\n]*」)+。/,
      P5: /。(?=[！？!?・）)〜～])/
    };
  const P4of = names => new RegExp('。」。|(?<=^|[。！？）\\s―…])(?:' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')?(?:「[^「」\\n]*」)+。');
  /* ---- stage-audit ---- */
    const FINGER = /指(?:を|が)(?:[^。]{0,12})(?:ねじ込|挿れ|挿し|差し入れ|入れ|沈め|埋め|潜り込|滑り込|突き入れ)|指で(?:[^。]{0,10})(?:掻き回|かき回|ほぐ|擦|こす|責め|突)|指(?:を|が)(?:[^。]{0,8})(?:動か|曲げ|抜き差し|出し入れ)/;
    const OUT = /指を(?:[^。]{0,8})(?:抜|引き抜|離)|指が(?:[^。]{0,6})(?:抜け|抜か|離れ)|舐め取|指を(?:[^。]{0,8})(?:見せ|突きつけ|口に)/;
    const INS = /突き入れ|挿入|貫い|貫か|繋が(?:っ|る|り)|腰を沈め|(?:先端|切っ先|熱|もの|それ)を(?:[^。]{0,10})(?:押し当て|宛てが|あてが|埋め|沈め|押し込)|奥まで(?:[^。]{0,6})(?:押し込|沈め|呑み込|突き)|ゆっくりと(?:[^。]{0,6})入って/;
    const AFTER = /息が整|息を整え|呼吸が整|腕の中で(?:[^。]{0,6})(?:眠|まどろ|微睡)|胸に頬を(?:寄せ|預け)|眠りに落ち|寝息|後始末|後片づけ|後片付け|シーツを(?:[^。]{0,6})(?:かけ|掛け|引き上げ)|汗ばんだ額を合わせ/;
    const PEAKN = /果て(?:た|る|て)|達し(?:た|て)|絶頂|イった|イかされ|中に出|注が(?:れ|れた)|びゅ|どぷ|どくどく/;
    const PEAKQ = /イ(?:ク|く|っちゃ|っく)|いっちゃ|いく(?:っ|ぅ|う)|イっ|でちゃ|出ちゃ|出る(?:っ|ぅ)/;
    const ROUND = /もう一回|もう一度|二回戦|二度目|再び|続きを|まだ(?:[^。]{0,6})足りな|一度果てても|また(?:[^。]{0,8})(?:手を伸ば|求め|抱き寄せ)/;
    const strip = s => s.replace(/「[^」]*」/g, '');
  /* OUT に「指が抜かれ」を足した（stage-audit は「指が抜け」だけで、「指が抜かれた空虚を、すぐに熱が埋めた」を指を抜かない挿入と数えていた。2026-10-29 担当MQ） */
  const MOBFI = /何本もの|無数の|幾つもの|いくつもの|触手|魔物|男たち|客たち|客の|群れ|スライム|ゴブリン|オーク|蔦|植物|獣|誰かの|見知らぬ|スタッフ|施術師|審査員/;
  /* ---- emo-audit ---- */
  const X = HK.Emo;
  let ALLRE = null, LUSTRE = null;
  if (X && X.WORDS) {
    const ALL = [];
    Object.keys(X.WORDS).forEach(at => Object.keys(X.WORDS[at]).forEach(m => X.WORDS[at][m].forEach(t => ALL.push(t))));
    if (X.WORDS_LUST) Object.keys(X.WORDS_LUST).forEach(at => X.WORDS_LUST[at].forEach(t => ALL.push(t)));
    const LUSTW = X.WORDS_LUST ? [].concat.apply([], Object.keys(X.WORDS_LUST).map(k => X.WORDS_LUST[k])) : [];
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    /* 句の一覧を、{a} を名前の並びにした一つの正規表現にする（回ごとに名前を入れて作る） */
    ALLRE = names => { const nm = '(?:' + names.map(esc).join('|') + ')'; return new RegExp(ALL.map(t => esc(t).replace(/\\\{a\\\}/g, nm)).join('|'), 'g'); };
    LUSTRE = names => LUSTW.length ? new RegExp(LUSTW.map(t => esc(t).replace(/\\\{a\\\}/g, '(?:' + names.map(esc).join('|') + ')')).join('|')) : null;
    /* E1：記録に残った恋愛の出来事の主役の悲しみを、記録の時点で見る */
    const Ctx = HK.Ctx;
    if (Ctx && !Ctx.prototype.say._miscE1) {
      const say0 = Ctx.prototype.say;
      Ctx.prototype.say = function (o) {
        const a = o && o.actors && o.actors[0];
        const gr = a && a.emo ? a.emo.grief : 0;
        const e = say0.apply(this, arguments);
        if (curRun && e && !e.skipped && o.cat === 'romance' && (o.kind || 'phase') !== 'phase' && gr >= X.LOVE_BLOCK) hit('E1', curRun.sc, curRun.s, a.name + '（悲しみ ' + Math.round(gr) + '）' + String(o.text).slice(0, 120));
        return e;
      };
      Ctx.prototype.say._miscE1 = true;
    }
  }
  /* ---- daily-audit ---- */
  const Dd = HK.Daily;
  let FULL = null, TK = null, BAD = null, PHD = null, KIN = null;
  if (Dd && Dd.PLACES) {
    const D = Dd;
    FULL = {}; Object.keys(D.PLACES).forEach(g => Object.keys(D.PLACES[g].spots).forEach(k => { FULL[D.PLACES[g].spots[k].full] = g + '.' + k; }));
    TK = { '朝': 'morning', '昼': 'day', '夕方': 'evening', '夜': 'night' };
    BAD = {
      morning: /夕飯|夕食|晩ごはん|夕日|終電|深夜|寝る前|おやすみ|夜風|夜空|放課後|残業|始発を待|花火/,
      day: /朝食|朝ごはん|目覚まし|寝坊|夕飯|夕食|夕日|終電|深夜|おやすみ|夜風|夜空|放課後|花火/,
      evening: /朝食|朝ごはん|寝坊|目覚まし|深夜|終電|始発|昼休み|夜空|予鈴/,
      night: /朝食|朝ごはん|寝坊|目覚まし|昼休み|昼ごはん|午後の日差し|朝の光|予鈴|授業|放課後|日差し|日だまり|木漏れ日/
    };
    PHD = /\{[a-z]+\}|undefined|NaN|\[object /;
    KIN = /^(sibling|sibprot|sibclose|sibbad|parent|pparent|relative|stepsib)$/;
  }
  /* 記録を書いた時点の呼び出し元（P1〜P5 の例に付ける。崩れた文のときだけスタックを取る） */
  const STK = new WeakMap();
  const anyBad = t => typeof t === 'string' && (RE.P1.test(t) || RE.P3.test(t) || /。」。/.test(t) || RE.P5.test(t));
  const grab = e => { if (e && typeof e === 'object' && anyBad(e.text)) STK.set(e, String(new Error().stack || '').split('\n').slice(3, 9).map(l => { const m = l.match(/at (\S+) \(/); return m ? m[1] : ''; }).filter(x => x && !/^(?:Object\.say|Ctx\.say|HK\.Ctx\.say|Array\.forEach)$/.test(x)).slice(0, 3).join(' ← ')); };
  if (HK.Ctx && !HK.Ctx.prototype.say._miscP) { const s0 = HK.Ctx.prototype.say; HK.Ctx.prototype.say = function (o) { const e = s0.apply(this, arguments); if (curRun && e && o && e.text === o.text) grab(e); return e; }; HK.Ctx.prototype.say._miscP = 1; }
  if (HK.Story && HK.Story.say && !HK.Story.say._miscP) { const s1 = HK.Story.say; HK.Story.say = function (S, o) { const e = s1.apply(this, arguments); if (curRun) grab(e); return e; }; HK.Story.say._miscP = 1; }
  const phit = (k, sc, s, e, t, m) => { const st = STK.get(e); hit(k, sc, s, '「' + m + '」 [' + (e.kind || '') + '/' + (e.cat || '') + (e.tag ? '/' + e.tag : '') + '] ' + t.slice(Math.max(0, t.indexOf(m) - 40), t.indexOf(m) + m.length + 40) + (st ? ' ← ' + st : '')); };
  return {
    begin(run) { curRun = run; },
    after() { curRun = null; },
    end(run, res) {
      const sc = run.sc, s = run.s, scen = HK.SCENARIOS[sc], env = run.input.env || {}, chars = run.input.chars || [];
      const names = chars.map(c => c.name), P4 = P4of(names);
      out.runs++;
      const L = res.log || [];
      /* ---- text-audit の T1〜T10（T4・T6・T7 を除く） ---- */
      L.forEach((e, k) => {
          const t = e && e.text;
          if (t == null || (typeof t === 'string' && !t.trim())) { if (!(e && /phase|step/.test(e.kind || '') && !t)) hit('T2', sc, s, JSON.stringify(e).slice(0, 160)); return; }
          if (typeof t !== 'string') return;
          if (PH.test(t)) hit('T1', sc, s, t.match(PH)[0] + ' ← ' + t);
          if (PH.test(e.why || '')) hit('T1', sc, s, 'why: ' + e.why);
          if (LMK.test(t + ' ' + (e.why || ''))) hit('T10', sc, s, (t + ' ' + (e.why || '')).match(LMK)[0] + ' ← ' + t);
          const tp = t.replace(/「「[^「」]*」」/g, '「』');
          if (PUNCT.test(tp)) hit('T3', sc, s, tp.match(PUNCT)[0] + ' ← ' + t);
          if (SAFE && SEX.test(t)) hit('T5', sc, s, t.match(SEX)[0] + ' ← ' + t);
          /* 感覚遮断穴の「場所：ダンジョンの罠部屋」は迷宮の中なので除く */
          /* 宇宙船の星の名前「紫の迷宮」など（ship.js の PN_COLOR＋PN_NOUN）は迷宮の語ではないので除く（理由 why の星の名前も。2026-10-29 担当MQ） */
          const t9 = sc === 'ship' ? t.replace(/(?:赤|青|白|黒|金|銀|翠|紫|灰|琥珀|瑠璃|薄紅)の迷宮/g, '') : t;
          FOREIGN.forEach(([re, ok]) => { if (ok.indexOf(sc) < 0 && re.test(t9)) hit('T9', sc, s, t9.match(re)[0] + ' ← ' + t); });
          if (sc !== 'dungeon' && sc !== 'rpg' && !(sc === 'hole' && env.place === 'dungeon') && DUNGEON_RE.test(t9 + ' ' + (sc === 'ship' ? String(e.why || '').replace(/(?:赤|青|白|黒|金|銀|翠|紫|灰|琥珀|瑠璃|薄紅)の迷宮/g, '') : (e.why || '')))) hit('T8', sc, s, (t + ' ' + (e.why || '')).match(DUNGEON_RE)[0] + ' ← ' + t);
        /* ---- punct-audit の P1〜P5 ---- */
        let m;
        if ((m = t.match(RE.P1))) phit('P1', sc, s, e, t, m[0]);
        if ((m = t.match(RE.P3))) phit('P3', sc, s, e, t, m[0]);
        if ((m = t.match(P4))) phit('P4', sc, s, e, t, m[0].slice(-2));
        if ((m = t.match(RE.P5))) phit('P5', sc, s, e, t, m[0]);
        if (HK.fmtLong) {
          let d = '';
          try { d = HK.fmtLong(t, names, e.seg); } catch (err) { d = ''; }
          const DL = d.split('\n').filter(l => l.trim()), k2 = DL.findIndex(l => /^\s*…*[。、]/.test(l));
          if (k2 >= 0) hit('P2', sc, s, (k2 ? DL[k2 - 1].slice(-30) : '') + '⏎' + DL[k2].trim());
        }
      });
      try { if (HK.Endings && HK.Endings.build && !scen.solo && res.pairs) { const E = HK.Endings.build(res); (E.lines || []).concat([E.headline || ''], (E.last || []).map(x => x && x.text)).forEach(l => { if (typeof l === 'string' && PH.test(l)) hit('T1', sc, s, 'ending: ' + l); if (typeof l === 'string' && LMK.test(l)) hit('T10', sc, s, 'ending: ' + l); if (SAFE && typeof l === 'string' && SEX.test(l)) hit('T5', sc, s, 'ending: ' + l); }); } } catch (e) { hit('T7', sc, s, 'Endings.build: ' + e.message); }
      const end = res.ending || res.end; if (end && Array.isArray(end.lines)) end.lines.forEach(l => { if (typeof l === 'string' && PH.test(l)) hit('T1', sc, s, 'ending: ' + l); if (typeof l === 'string' && LMK.test(l)) hit('T10', sc, s, 'ending: ' + l); if (SAFE && typeof l === 'string' && SEX.test(l)) hit('T5', sc, s, 'ending: ' + l); });
      /* ---- stage-audit の F>I（A>P は参考） ---- */
      if (!SAFE && HK.lewdEvent) {
        const NAMES = names, id = sc, o = { FI: 0, AP: 0 };
        const outS = { samples: { 'F>I': [], 'A>P': [] } }, SHOW = 4;
        L.forEach(e => {
          if (!e || typeof e.text !== 'string' || !HK.lewdEvent(e)) return;
          out.info.lewdEv++;
          /* stage-audit は恋人の二人だけで回していた。登場人物が住人二人の場面だけを見る（モブ・三人以上の場面は、指でほぐす人と挿れる人が別のことがある） */
          if (!Array.isArray(e.actors) || e.actors.length !== 2) return;
          const paras = e.text.split(/\n+/).map(x => x.trim()).filter(Boolean);
          /* F>I：指の段落の次の地の文の段落 */
          for (let i = 0; i < paras.length; i++) {
            const pi = strip(paras[i]);
            if (!FINGER.test(pi) || OUT.test(pi) || INS.test(pi)) continue;
            let j = i + 1; while (j < paras.length && !strip(paras[j]).replace(/[\s―…・、。]/g, '').replace(new RegExp(NAMES.join('|'), 'g'), '')) j++;
            if (j >= paras.length) continue;
            const pj = strip(paras[j]);
            /* 相手が複数・モブ（何本もの手・触手・魔物 など）の場面は、指でほぐす人と挿れる人が別なので数えない（stage-audit は恋人の二人だけで回していた） */
            if (MOBFI.test(paras[i] + paras[j])) continue;
            /* 次の段落が玩具を当てる・挿れる場面（「震える先端を花芯に押し当てた」）は、指のあとの挿入ではない（2026-10-29 担当MQ） */
            if (/玩具|ローター|バイブ|張り型|張形|ディルド/.test(paras[j])) continue;
            if (INS.test(pj) && !OUT.test(pj) && !FINGER.test(pj)) {
              o.FI++;
              if (outS.samples['F>I'].length < SHOW) outS.samples['F>I'].push(id + '#' + s + '：' + paras[i].slice(0, 70) + ' ／→ ' + paras[j].slice(0, 70));
            }
          }
          /* A>P：事後の段落のあと、新しい挿入・もう一回なしに絶頂 */
          let afterAt = -1, peaked = false;
          for (let i = 0; i < paras.length; i++) {
            const pi = strip(paras[i]);
            if (afterAt >= 0 && (INS.test(pi) || ROUND.test(paras[i]))) afterAt = -1;
            if (afterAt >= 0) {
              const qs = (paras[i].match(/「[^」]*」/g) || []).join('');
              if (PEAKN.test(pi) || (PEAKQ.test(qs) && /♡|っ/.test(qs))) {
                o.AP++;
                if (outS.samples['A>P'].length < SHOW) outS.samples['A>P'].push(id + '#' + s + '：' + paras[afterAt].slice(0, 60) + ' ／→ ' + paras[i].slice(0, 80));
                afterAt = -1;
              }
            }
            if (peaked && AFTER.test(pi) && !INS.test(pi) && !PEAKN.test(pi)) afterAt = i;
            if (PEAKN.test(pi)) peaked = true;
          }
        });
        if (o.FI) { out.n.FI += o.FI; outS.samples['F>I'].forEach(x => { if (out.ex.FI.length < 4) out.ex.FI.push(x + '（' + run.pass + '）'); }); }
        if (o.AP) { out.info.AP += o.AP; outS.samples['A>P'].forEach(x => { if (out.apEx.length < 4) out.apEx.push(x); }); }
      }
      /* ---- emo-audit の E2・E4 ---- */
      if (X && ALLRE && scen && (!scen.solo || (X.STORY_EMO && X.STORY_EMO[sc]))) {
        const RA = ALLRE(names), RL = SAFE ? LUSTRE(names) : null, per = {};
        let stepK = 0;
        L.forEach(e => {
          if (!e || typeof e.text !== 'string') return;
          if (e.kind === 'step') { stepK++; return; }
          const k = scen.solo ? stepK : (e.step != null ? e.step : stepK);
          RA.lastIndex = 0; const c = (e.text.match(RA) || []).length;
          if (c) { per[k] = (per[k] || 0) + c; if (per[k] >= 2 && !per['h' + k]) { per['h' + k] = 1; hit('E2', sc, s, '区切り ' + (e.label || k) + ' | ' + e.text.slice(0, 120)); } }
          if (RL && RL.test(e.text)) hit('E4', sc, s, '全年齢で火照りの句 | ' + e.text.slice(0, 120));
        });
        const LL = scen.solo ? (res.heroes || []) : (res.chars || []);
        if (SAFE && LL.some(c => c.emo && c.emo.lust)) hit('E4', sc, s, '全年齢で火照りの値 | ' + LL.map(c => c.name).join('・'));
      }
      /* ---- daily-audit の D2・D4（D1 は参考） ---- */
      if (FULL) {
        const ties = run.input.ties || [], D = Dd;
        const kinPair = {}; ties.forEach(t => { if (KIN.test(t.type)) kinPair[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)] = 1; });
        const seen = {}, dead = {};
        const hide = t => { let x = t; chars.forEach(c => { x = x.split(c.name).join('＊'); }); return x; };
        const PH = PHD;
        L.forEach(e => {
          /* 死の記録の主役（actors の一人目）だけを死んだ人にする（daily-audit は登場人物の全員だった。殺した側も入るので、ほかのパスの死の回に当てたとき誤判定になる）。蘇生の記録で戻す */
          if (e && e.kind === 'death' && e.actors && e.actors.length) dead[e.actors[0]] = 1;
          if (e && (e.tag === '蘇生' || /蘇生/.test(String(e.why || '')))) (e.actors || []).forEach(i => { delete dead[i]; });
          if (!e || !e.text) return;
          const m = /^日常（(朝|昼|夕方|夜)・([^）]+)）：/.exec(e.why || '');
          if (!m) return;
          out.info.dailyLines++;
          const time = TK[m[1]], spot = FULL[m[2]], S = spot && D.spot(spot), t = e.text;
          /* D1：文ごと（名前を伏せる） */
          const sents = hide(t).split(/(?<=。|」)/).map(x => x.trim()).filter(x => x.length >= 10);
          if (sents.some(x => seen[x])) out.info.dailyDup++; sents.forEach(x => { seen[x] = 1; });
          /* D2：場所と時間帯 */
          if (!S) hit('D2', sc, s, '場所が表にない: ' + m[2]);
          else {
            if (!(S.time[time] > 0)) hit('D2', sc, s, m[1] + 'に' + S.label + ': ' + t);
            const mo = /^(\d{1,2})月/.exec(e.label || ''); if (S.months && mo && S.months.indexOf(+mo[1]) < 0) hit('D2', sc, s, mo[1] + '月に' + S.label + ': ' + t);
            if (BAD[time].test(t)) hit('D2', sc, s, m[1] + '「' + t.match(BAD[time])[0] + '」: ' + t);
            if (spot === 'work.school' && time === 'night') hit('D2', sc, s, '夜の学校: ' + t);
            if (spot === 'town.night' && time === 'morning') hit('D2', sc, s, '朝の夜の街: ' + t);
          }
          /* D4：家族の場面 */
          const ac = (e.actors || []).slice(0, 2);
          if (ac.length === 2 && kinPair[Math.min(ac[0], ac[1]) + '-' + Math.max(ac[0], ac[1])] && e.cat === 'romance') hit('D4', sc, s, e.text);
          if (/（日常・(?:義理の)?(?:兄弟|姉妹|姉弟|兄妹|きょうだい|親子|親族)）$/.test(e.why || '') && (e.cat === 'romance' || /頬を赤|見とれ|惹かれ|ときめ|恋/.test(t))) hit('D4', sc, s, e.text);
        });
      }
    },
    finish() { return out; }
  };
};
function summarize(r) {
  const items = {}, ex = {};
  Object.keys(r.n || {}).forEach(k => { items[k] = r.n[k]; ex[k] = (r.ex[k] || []).slice(0, 3); });
  const i = r.info || {};
  return { items, ex, info: { 回: r.runs, '性的な場面': i.lewdEv, '参考 A>P': i.AP, '日常の行': i.dailyLines, '参考 日常の重複': i.dailyDup }, err: 0 };
}
const LABEL = { T1: '置き換え漏れ（{a}・undefined など）', T2: '空の記録', T3: 'かぎかっこ・！？の重なり', T5: '全年齢で性的な語', T8: '迷宮の語がほかの箱庭に', T9: 'その箱庭だけの語がほかの箱庭に', T10: '体の語の印の残り', P1: '文頭の句読点', P2: '画面の行頭の句読点', P3: '句読点の重なり', P4: '文頭の台詞のあとの句点', P5: '句点のすぐあとの記号', FI: '指の段落の次にいきなり挿入', E1: '悲しみの深い人が恋愛の主役', E2: '気分の一句が同じ区切りに二度', E4: '気分の句の置き換え漏れ・全年齢の火照り', D2: '日常の場所と時間帯の矛盾', D4: '家族の日常が恋愛に' };
module.exports = { passes: {}, judges: { misc: JUDGE }, summarize, LABEL };
