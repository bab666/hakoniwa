/* 場面の辻褄の判定（judge cons。2026-11-07。利用者の指示「喘ぎ声のミスとか、辻褄のミスは頻繁に起きているため、点検内容に今後も整合性チェックを加えて」）
   audit-all の既定の一式で、misc と同じく全部のパスの回に当てる（自分のパスは持たない。新しい道具・パスは足していない）。
   記録の本文・理由（why）・札（tag）・区切り（step）から機械的に決まるものだけを数える。誤判定を抑えるため、どれも「語の組」で絞る（下の各項の除外を参照）。
   seg（話し手の区分）・misc（置き換え漏れ・句読点・FI の指と挿入・E2 の気分の句）とは見るものが重ならない。
     C1  二人が離れている段（電話・通話の段：札が電話・理由が電話越し／声だけ／来られない／会えない夜、か本文の頭が電話越し・電話の向こう）で、
         その二人の一方がもう一方の体に触れる（「AはBの膝を立てさせ」「BはAの唇に指を這わせ」「AがBを押し倒し」）、隣に立つ・抱き寄せる。
         除外：相手が来た・電話を切った段（来てくれて・帰ってきた・駆けつけ・合鍵・お仕置きのあと・甘やかされたあと・電話が終わると…）、
         声・電話・想像の文（「Bの息づかいを聞きながら」「Bの名前を呼んだ」「Bを思い浮かべ」）、願い・仮定（〜たい・〜たら・〜ように）
     C2  直前の記録に無いキスへの言及：「キスきた」「キス長くない？」「今のキスで」「さっきのキス」が、それより前の記録（コメント欄は同じ区切り（step）の中、ほかは前の 20 件）・
         同じ記録の前の部分にキス・口づけ・唇の語が無いのに出た（配信のコメント欄など）。「カメラにキスして」のような頼みの文は数えない
     C3  帰宅の無い「ただいまのキス／口づけ」：同じ記録の前の部分と、その前の 3 つの記録（本文・理由・札）に帰宅の語（帰ってきた・ただいま・おかえり・玄関・出迎え…）が無い
     C4  寝ていない場面の「誰が起きていいって言った」「起きていいとは」：同じ記録の前の部分に、寝かせる・押し倒す・身を起こす の語（押し倒・組み敷・仰向け・ベッド・敷布・起き上が…）が無い
     C5  つかまる物の飛び：同じ区切りの同じ人が「手すり」を握っていたのに、手を離す語なしに「吊り革」に縋る（逆も）。主語が住人の名前の文だけ（周りの乗客の吊り革は数えない）。
         持ち物：「スマホを握ったまま」の同じ文・次の文で「両手で」（置く・肩と耳で挟む・スピーカーにする があれば数えない）
     C6  場所の語の矛盾：車内の記録（吊り革・車内・乗客・電車の揺れ…）に、ベッド・シーツ・「明かりを暗く」「灯りを消して」。寝台車・個室・降りたあと・部屋・宿の記録
         （「扉が閉まると」「車内の熱が、まだ」）は数えない
     C7  不穏な場面（cat が conflict・betray・combat・death、本文の不安・口論・涙・素っ気ない、理由の不安・喧嘩・嫉妬・静か・すれ違い）の最後の一文
         （かぎかっこの外）が、嬉しい系の飾り（嬉しそうに・楽しげに・はしゃ・上機嫌・弾んだ声・浮かれ・満面の笑み）。安心・仲直り・無理に・寂しげ・苦笑 などの文は数えない
     K1  台詞の敬語化の崩れ：「もしかしてください」「どうしてください」（問い・推量の副詞＋ください）、「〜ですだ」「〜ませんだった」「〜でしたっす」
   --why（audit-all.js）で各項の例を 10 件まで出す */
'use strict';
const JUDGE = function (HK, opt) {
  const KEYS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'K1'];
  const SHOW = 12;
  const out = { n: {}, ex: {}, runs: 0, bySc: {}, info: { apart: 0, kissRef: 0, tadaima: 0, okite: 0, grip: 0, vehicle: 0, dark: 0 } };
  KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
  const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const one = s => String(s == null ? '' : s).replace(/\n+/g, '⏎');
  let cur = null;
  function hit(k, sc, s, msg) {
    out.n[k]++;
    const b = out.bySc[sc] = out.bySc[sc] || {}; b[k] = (b[k] || 0) + 1;
    if (out.ex[k].length < SHOW) out.ex[k].push(sc + '#' + s + '（' + (cur ? cur.pass : '') + '） | ' + one(msg).slice(0, 320));
  }
  const around = (t, i, w) => one(t.slice(Math.max(0, i - (w || 80)), i + (w || 80)));
  const sents = t => String(t).split(/(?<=[。！？!?])(?![」』）])/);
  /* ---- C1：離れた二人 ---- */
  const APART_TAG = /^(?:電話|通話)$/;
  const APART_WHY = /電話越し|画面の外の相手に電話|電話をかけ|通話をつない|通話が切れ|電話の相手|声だけで|来られず|会えない夜/;
  const APART_TXT = /^[^。\n]{0,30}(?:電話越し|電話の向こう|受話口|受話器の向こう|スマホ越し|通話の向こう)/;
  const ARRIVE = /来てくれ|来てくれた|帰ってき|帰ってく|戻ってき|駆けつけ|家に来|来訪|合鍵|お仕置きのあと|甘やかされ|甘やかし|電話を切|電話が終わ|通話を終え|通話が終わ|ドアが開|扉が開|玄関|見つかって/;
  const FAR = /声|想像|思い浮か|思い描|息づかい|聞き|聞こえ|名前を呼|想って|思い出|まぶたの裏|夢/;
  const WISH = /たくな|たくて|つもり|ように(?:願|祈)|ればいい/;
  const PART = '(?:唇|胸|腰|肩|髪|頬|首|首筋|膝|脚|太腿|内腿|手|手首|背|背中|指|後ろ|{?ナカ}?|中|奥|乳首|耳|口|尻|お尻|秘所|秘部|肉芽|花芯|男根|肉棒|体|身体|腕|額|顎)';
  const TOUCH_W = /隣に(?:立|座|腰を下ろ)|抱き寄せ|抱きしめ|抱きすくめ|肩を抱|唇を重ね|押し倒|組み敷|覆いかぶさ/;
  /* ---- C2：キスの言及 ---- */
  const KISS_REF = /(?:キス|ちゅー|チュー)(?:きた|キタ|来た|長|多すぎ|しすぎ|の音|顔|して(?:る|た)(?:[！!？?w]|$))|(?:さっき|今|(?<!ただ)いま)の(?:キス|ちゅー|チュー|口づけ)/;
  const KISS_ASK = /(?:カメラ|画面|レンズ)に(?:キス|ちゅー)|キス(?:して|ちょうだい|を(?:せが|ねだ))|キスを?ちょうだい/;
  const KISS_ANY = /キス|ちゅ[っう]|チュー|口づけ|唇|口移し/;
  /* ---- C3：ただいまの口づけ ---- */
  const TADAIMA = /ただいまの(?:キス|口づけ|ちゅー)/;
  const HOME = /自宅|部屋に着|家に着|帰り着|ドアが閉ま|扉が閉ま|帰宅|帰って(?:き|来|く)|帰り(?:を待|が遅|道)|戻って(?:き|来)|ただいま(?!の)|おかえり|お帰り|玄関|出迎え|仕事から|鍵を開け|ドアを開け|扉を開け|帰る(?:なり|と)|遅く帰/;
  /* ---- C4：起きていい ---- */
  const OKITE = /誰が起きていい|起きていいとは|起きていいなんて|起きていいって言/;
  const LIE = /押し倒|突き倒|組み敷|仰向け|うつ伏せ|横たえ|寝かせ|転が|ベッド|寝台|敷布|シーツ|布団|身を起こ|起き上が|覆いかぶさ|寝そべ|横にな|伏せ|台に/;
  /* ---- C5：つかまる物・持ち物 ---- */
  const GRIP = /(手すり|吊り革|つり革)(?:を|に)(?:[^。]{0,6})(?:握|掴|つか|すが|縋|しがみ)/g;
  const RELEASE = /手を離|手が離れ|離し|持ち替|手を伸ばし|移っ|次の駅|扉が開|降り|乗り換/;
  const PHONE_HOLD = /(?:スマホ|スマートフォン|携帯|端末)を(?:[^。]{0,6})(?:持った|握った|握りしめた|構えた|耳に当てた|頬に当てた)まま/;
  const PHONE_FREE = /置い|置き|下ろ|離|放|肩と耳で挟|耳と肩で挟|スピーカー|伏せ/;
  /* ---- C6：車内の場所の語 ---- */
  const VEH = /吊り革|つり革|車内|車両|電車の揺れ|乗客|満員電車|扉のガラス|ドアのガラス/;
  const VEH_OK = /寝台|個室|コンパートメント|降りた|降りて|扉が閉まると|部屋(?:に|の|で|へ)|ホテル|宿の|宿に|自宅|家に着|家に帰|まだ[^。]{0,10}残|思い出|あの(?:夜|日)/;
  const BED = /ベッド|シーツ|布団|(?<![のな])(?:明かり|灯り)[^。」]{0,10}(?:暗く|消して|落として|を消|を落と)|電気を消/;
  /* ---- C7：不穏な場面の嬉しい飾り ---- */
  const DARK_RE = /不安|不穏|胸騒ぎ|素っ気なかった|素っ気ない(?:返事|態度|声)|いつになく静か|黙り込ん|冷たい(?:声|態度|返事|目)|気まず|言い合いに|言い合いの|口論|泣いて|泣き出|涙をこぼ|落ち込ん|苛立|怯え|別れ話|距離を感じ|噛み合わ/;
  const DARK_WHY = /喧嘩|ケンカ|口論|言い合い|不安|素っ気ない|嫉妬|別れ|すれ違|静か(?:だった|な夜|すぎ)|悲しみ|恐れ|恐怖|怯え/, SOFT_WHY = /仲直り|笑い話|決まり|一緒に何とか|和らぎ|安心/;
  const HAPPY = /嬉しそうに|うれしそうに|楽しげに|楽しそうに|はしゃい|はしゃぎ|はしゃぐ|上機嫌|弾んだ声|声を弾ませ|浮かれ|うきうき|満面の笑み|声を上げて笑/;
  const HAPPY_OK = /安心|ほっと|仲直り|ようやく|やっと|無理に|作り笑|ぎこちな|寂し|苦笑|強が|ごまか|それでも|でも|けれど|けど|のに|ふり|装|取り繕|ように見え|ないまま|泣き笑|が、/;
  const DARK_SKIP = /発狂|幻覚|狂気|正気/;
  /* ---- K1：敬語化の崩れ ---- */
  const KEIGO = /(?:もしかして|どうして|なんで|なぜ|まさか|やっぱり|やはり|たぶん|多分|きっと|わざと|せっかく|ひょっとして|もしや|なんとなく)(?:ください|くださ[いる]|くれます)|(?:です|ます|ません|ました|でした|ませんでした)(?:だ|だった|だよ|だね|っす)(?=[。、！？!?…‥」\s　♡〜ー]|$)|ませんだ|ますだった|ですだった/;
  return {
    begin(run) { cur = run; },
    after() { cur = null; },
    end(run, res) {
      out.runs++;
      const sc = run.sc, s = run.s, L = res.log || [];
      const names = ((res.chars && res.chars.length ? res.chars : (run.input && run.input.chars)) || []).map(c => c && c.name).filter(n => typeof n === 'string' && n.trim());
      const nameOf = i => typeof i === 'number' ? names[i] : (i && i.name);
      L.forEach((e, k) => {
        if (!e || typeof e.text !== 'string' || !e.text) return;
        const t = e.text, why = String(e.why || ''), tag = String(e.tag || '');
        /* ---- C1 ---- */
        const apart = (APART_TAG.test(tag) || APART_WHY.test(why) || APART_TXT.test(t)) && !ARRIVE.test(why) && !ARRIVE.test(tag);
        if (apart) {
          out.info.apart++;
          const ac = (e.actors || []).map(nameOf).filter(Boolean).slice(0, 2);
          const pair = ac.length === 2 ? ac : names.length === 2 ? names : null;
          let pre = '';
          sents(t).some(x => {
            const body = x.replace(/「[^」]*」/g, '');
            if (ARRIVE.test(pre + body)) return true;   /* 来た・切ったあとの文は見ない */
            pre += body;
            if (FAR.test(body) || WISH.test(body)) return false;
            let m = null;
            if (pair) {
              const [A, B] = pair.map(esc);
              const re = new RegExp('(?:' + A + '|' + B + ')(?:は|が)(?:[^。]{0,24})(?:' + A + '|' + B + ')(?:の' + PART + '|を(?:抱|押し倒|組み敷|引き寄せ|膝に|撫で|見下ろ))');
              const mm = body.match(re);
              if (mm) { const who = mm[0].match(new RegExp(A + '|' + B, 'g')) || []; if (who.length >= 2 && who[0] !== who[who.length - 1]) m = mm; }
            }
            if (!m && TOUCH_W.test(body)) m = body.match(TOUCH_W);
            if (m) { hit('C1', sc, s, '[' + (tag || e.kind || '') + '／' + why.slice(0, 40) + '] 「' + m[0] + '」 ' + around(body, m.index)); return true; }
            return false;
          });
        }
        /* ---- C2 ---- */
        {
          const m = t.match(KISS_REF);
          if (m && !KISS_ASK.test(t.slice(Math.max(0, m.index - 12), m.index + m[0].length + 6))) {
            out.info.kissRef++;
            let ok = KISS_ANY.test(t.slice(0, m.index).replace(/「[^」]*(?:カメラ|画面)に(?:キス|ちゅー)[^」]*」/g, ''));
            /* コメント欄（札「コメント」）は同じ区切りの中だけ、ほかの記録（「さっきのキス」）は前の区切りも含めて 20 件まで遡る */
            const cm = /コメント/.test(tag);
            for (let j = k - 1; !ok && j >= 0 && j >= k - (cm ? 14 : 20); j--) {
              const x = L[j]; if (!x) continue;
              if (cm && e.step != null && x.step != null && x.step !== e.step) break;
              if (KISS_ANY.test(String(x.text || '')) || KISS_ANY.test(String(x.tag || '')) || KISS_ANY.test(String(x.why || '')) || /kiss/i.test(String(x.ev || ''))) ok = true;
            }
            if (!ok) hit('C2', sc, s, '[' + (tag || e.kind || '') + '／' + (e.label || '') + '] 「' + m[0] + '」 ' + around(t, m.index, 60) + ' ←前：' + L.slice(Math.max(0, k - 3), k).map(x => x && one(x.text).slice(0, 40)).join('｜'));
          }
        }
        /* ---- C3 ---- */
        {
          const m = t.match(TADAIMA);
          if (m) {
            out.info.tadaima++;
            let ok = HOME.test(t.slice(0, m.index)) || HOME.test(why) || HOME.test(tag);
            for (let j = k - 1; !ok && j >= 0 && j >= k - 3; j--) { const x = L[j]; if (x && (HOME.test(String(x.text || '')) || HOME.test(String(x.why || '')) || HOME.test(String(x.tag || '')))) ok = true; }
            if (!ok) hit('C3', sc, s, '「' + m[0] + '」 [' + (tag || e.kind || '') + '／' + why.slice(0, 40) + '] ' + around(t, m.index));
          }
        }
        /* ---- C4 ---- */
        {
          const m = t.match(OKITE);
          if (m) { out.info.okite++; if (!LIE.test(t.slice(0, m.index))) hit('C4', sc, s, '「' + m[0] + '」 [' + (tag || e.kind || '') + '／' + why.slice(0, 40) + '] ' + around(t, m.index)); }
        }
        /* ---- C5（持ち物：同じ記録の中） ---- */
        {
          const ss = sents(t);
          ss.forEach((x, i) => {
            const m = x.match(PHONE_HOLD); if (!m) return;
            const rest = x.slice(m.index + m[0].length) + (ss[i + 1] || '');
            if (/両手/.test(rest) && !PHONE_FREE.test(rest.slice(0, rest.indexOf('両手')))) hit('C5', sc, s, '持ち物：' + one(x + (ss[i + 1] || '')).slice(0, 200));
          });
        }
        /* ---- C6 ---- */
        if (VEH.test(t) && !VEH_OK.test(t) && !/寝台|夜行/.test(why + tag)) {
          out.info.vehicle++;
          const m = t.match(BED);
          if (m) hit('C6', sc, s, '[' + (tag || e.kind || '') + '／' + why.slice(0, 40) + '] 「' + m[0] + '」 ' + around(t, m.index));
        }
        /* ---- C7：場面が不穏（札・理由・cat で決まる）で、最後の一文が住人を主語にした嬉しい系の飾り。その前の一文が和らいだ・持ち直した文なら数えない ---- */
        {
          const W = why + '\n' + tag;
          const body = t.replace(/「[^」]*」/g, '「」');
          const ss = sents(body).filter(x => x.replace(/[「」\s⏎]/g, ''));
          const dark = ss.length >= 2 && DARK_RE.test(ss.slice(0, -1).join('')) && (/^(?:conflict|betray|combat|death)$/.test(e.cat || '') || (DARK_WHY.test(W) && !SOFT_WHY.test(W))) && !DARK_SKIP.test(W);
          if (dark && names.length) {
            out.info.dark++;
            const last = ss[ss.length - 1], prev = ss[ss.length - 2];
            const m = last.match(HAPPY);
            const subj = new RegExp('^[⏎\\s]*(?:' + names.map(esc).join('|') + ')(?:は|が|も)').test(last);
            if (m && subj && !HAPPY_OK.test(last) && !HAPPY_OK.test(prev) && !SOFT_WHY.test(prev) && !HAPPY.test(prev)) hit('C7', sc, s, '[' + (e.cat || '') + '／' + (tag || '') + '／' + why.slice(0, 40) + '] ' + one(prev).slice(-80) + ' ／→ ' + one(last));
          }
        }
        /* ---- K1 ---- */
        {
          const qs = t.match(/「[^」]*」/g) || [];
          qs.forEach(q => { const m = q.match(KEIGO); if (m) hit('K1', sc, s, '「' + m[0] + '」 ' + q.slice(0, 120)); });
        }
      });
      /* ---- C5（つかまる物：同じ記録か、すぐ次の同じ区切りの記録で、同じ人が手を離す語なしに別の物を握る。「〜に手すりを握らせ」は相手が握るので数えない） ---- */
      if (names.length) {
        const NM = names.map(esc).join('|');
        const FIRST = new RegExp('^[^。]*?(' + NM + ')(?:は|が|の(?:手|指|両手))');
        let H = {}, prevK = -2, prevSt = null;
        L.forEach((e, k) => {
          if (!e || typeof e.text !== 'string') return;
          if (!(k === prevK + 1 && e.step === prevSt)) H = {};
          prevK = k; prevSt = e.step;
          const Hn = {};
          sents(e.text.replace(/「[^」]*」/g, '')).forEach(x => {
            const f = x.match(FIRST); if (!f) return;
            const who = f[1];
            if (RELEASE.test(x)) { delete H[who]; delete Hn[who]; }
            let m; GRIP.lastIndex = 0;
            while ((m = GRIP.exec(x))) {
              if (m.index < x.indexOf(who)) continue;   /* 主語より前のつかまる物（「吊り革を握る乗客の間で、ミナトは」） */
              if (/^[^。]{0,8}(?:握らせ|掴ませ|つかませ|すがらせ)/.test(x.slice(m.index + m[1].length))) continue;
              const obj = m[1] === 'つり革' ? '吊り革' : m[1];
              out.info.grip++;
              const was = Hn[who] || H[who];
              if (was && was.obj !== obj) hit('C5', sc, s, 'つかまる物：' + who + 'が「' + was.obj + '」→「' + obj + '」 ' + one(was.x).slice(0, 80) + ' ／→ ' + one(x).slice(0, 120));
              Hn[who] = { obj, x };
            }
          });
          Object.keys(Hn).forEach(w => { H[w] = Hn[w]; });
        });
      }
    },
    finish() { return out; }
  };
};
function summarize(r) {
  const items = {}, ex = {};
  Object.keys(r.n || {}).forEach(k => { items[k] = r.n[k]; ex[k] = (r.ex[k] || []).slice(0, 12); });
  const i = r.info || {};
  return { items, ex, info: { 回: r.runs, '離れた段': i.apart, 'キスの言及': i.kissRef, 'ただいまの口づけ': i.tadaima, '起きていい': i.okite, 'つかまる物': i.grip, '車内の記録': i.vehicle, '不穏な記録': i.dark, '箱庭ごと': r.bySc }, err: 0 };
}
const LABEL = {
  C1: '離れている二人（電話の段）に体の接触', C2: '直前に無いキスへの言及（キスきた・さっきのキス）', C3: '帰宅の無い「ただいまの口づけ」', C4: '寝ていない場面の「起きていい」',
  C5: 'つかまる物・持ち物の飛び（手すり→吊り革・スマホを持ったまま両手）', C6: '車内にベッド・明かりの語', C7: '不穏な場面の最後に嬉しい飾り', K1: '台詞の敬語化の崩れ（もしかしてください・ですだ）'
};
module.exports = { passes: {}, judges: { cons: JUDGE }, summarize, LABEL };
