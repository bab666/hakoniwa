/* @event-ok 長い場面の流れを段階で管理する（既にある山場の組み立てを包むだけ。新しい出来事ではない。2026-11-03） */
/* 箱庭シミュレーター（R18版のみ）: 長いエッチの場面の流れを、場面の状態で管理する（HK.SexFlow）
   設計：docs/reports/2026-11-03/sex-flow-design.md（利用者のフィードバック docs/reports/2026-11-03/sex-flow-feedback.md）
   ■ 何をするか：長い場面（thick-sex.js の HK.ThickSex.scene・thick-sex-ero.js の HK.ThickEro.scene。出られない部屋・合コン・関係の夜・新婚部屋など）は、
     本体の組み立てのあとに、夜の性格（attr-r18.js）・夜の主導（pos-lead-r18.js）・能動性の型（ero-initiative-r18.js）・攻めの台詞（ero-top-lines-r18.js）などの
     包みが段を差し込んで出来上がる。差し込む側どうしは互いを知らないので、同じ動き・同じ台詞の二度出し、挿入のあとの「脱がせる」、
     受けが上に乗った直後の「真上から押さえつけたまま」、言葉責めのあとのリアクションの欠け、が起きていた。
     ここでは、いちばん外側の包みとして出来上がった本文を段（部品）に分け、場面の状態
       stage（lead→undress→foreplay→insert→play→climax→after）・posture（体位）・heatTop／heatBottom（性感）・used（出した台詞と動き）・pending（応答待ちの台詞）
     を前から順に進めながら、状態に合わない部品を直す：
       (a) 段階の逆戻り … 前の段階の部品（挿入後の脱がせる・山場後の挿入）は、その段階の位置へ移す（移せない飾りの部品は外す）
       (b) 体位の矛盾   … 体位を変える部品を挟まずに体位が変わるなら、つなぎの段（HK.SexFlowText.BRIDGE）を前に入れる
       (c) 二度出し     … 同じ台詞・同じ動き（突き倒す・手首を押さえる など）の二度目は、飾りの部品ごと外すか、その一文を外す
       (d) 応答待ち     … 応答を求める台詞（言え・呼べ・声を出せ）のあとに受けのリアクションが無ければ、受けの態度 9 種のリアクションを入れる
       (e) 性感         … 山場は受けの heat が 60 以上（攻めが男性の体・女性の攻め×男性なら攻めも 50 以上）・焦らしの直後でないときだけ。届かなければ追い上げの段を前に入れる
     2026-11-04：文ごとの状態（挿入中か・指・目隠し・体位・場所・終わりの台詞）で (i)〜(n) も見て直す（F.walk。設計の 7 章）
     そのうえで、段階ごとの段数の上限（下の CAP。描写の長さ「厚く」は少し多め）と、似た役割の部品（夜の主導・夜の性格・焦らし）の重ねを 1 回までにする。
   ■ 夜の主導（誘い受け・襲い受け）は「傾向」（2026-11-03 利用者の指示）：長い場面のたびに、その夜に受けから始めるかを確率で決め（F.leadTonight）、
     場面のあいだだけ HK.Pos.leadOf をその夜の値に差し替える（夜の主導の段・能動性の型の両方に効く）。嫉妬・強引・愛憎・攻めのサド／意地悪の夜は攻めから。
   ■ 乱数：本筋の乱数は使わない（二人の名前と本文から決まる乱数）。直す必要のない場面は本文を変えない。全年齢（HK.SAFE_ON）では何もしない
   ■ 点検：hakoniwa-tools/tone-check/sex-flow-audit.js（F.analyze と F.check で (a)〜(e) を数える）。F.off = true で直さずに通す（変更前の数字を出すため）
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.SexFlow) return;
  var F = HK.SexFlow = { off: false, log: null, cur: null };
  function TX() { return HK.SexFlowText || {}; }

  /* ---------- 乱数（本筋の乱数を使わない） ---------- */
  function hashOf(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngOf(seed) { var h = seed >>> 0; return function () { h = (h + 0x6D2B79F5) >>> 0; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- 文の判定（{a}＝攻め・{b}＝受けに名前をそろえた本文で見る） ---------- */
  var RE = F.RE = {
    /* 山場：果てる・達する（寸前で止める・許さない文は除く。文ごとに見る） */
    climax: /果て(?:た|る|て|ると)|達し(?:た|て)|達する|絶頂|イっ(?:た|て)|イき(?:続|果て)|熱を(?:注|吐き出|叩きつけ|放)|精を(?:注|吐|放)|白く弾け|昇りつめ|上り詰め|びゅく|びゅるる|びゅーっ|どぷっ|中に出し|注ぎ込|射精し|吐精|波に呑まれ|強ばり、それからほどけ|限界を(?:越|超)え|熱が[^。]{0,8}弾け|長く震え|頭の中が真っ白にな/,
    notClimax: /寸前|直前|手前|させない|許さ|お預け|止め|まだ(?:だめ|イ)|させてあげない|堪え/,
    /* 挿入（いま挿れる動き。「〜したまま」は続きなので数えない） */
    insert: /一息に(?:奥|沈|貫|根元)|挿れ(?:た|る|て|られ)(?!たまま)|挿入|貫(?:いた|かれた|く)(?!まま)|押し入(?:った|る)|腰を沈め(?:た|る|て)(?!まま)|(?:奥|根元)まで(?:沈め|埋め|貫|呑み込|突き入れ|迎え入れ)(?:た|る|ん|て|ま)(?!まま)|迎え入れ(?:た|る)|\{男性器\}を[^。]{0,12}(?:沈め|埋め|呑み込)(?:た|る|ん|て)|呑み込ま(?:れ|せ)|腰を(?:深く)?落と(?:し|す)(?!たまま)|繋がっ(?:た|て)(?!まま)|突き入れ|(?:奥|根元|中)(?:まで|へ|に)[^。]{0,6}(?:押し込|ねじ込|埋め)(?:んだ|む|み|ま)|一つにな(?:った|る)|ひとつにな(?:った|る)|深く(?:入っ|迎え|繋が)|(?:奥|中|\{ナカ\}|深く)[^。]{0,4}入っ(?:た|てく)|ぜんぶ入っ|全部入っ|中に沈め|奥へ沈め|迎えては/,
    /* 繋がっているしるし（挿入の文が無くても、これがあれば繋がったあと） */
    inside: /\{ナカ\}|奥を(?:突|擦|抉|叩)|打ちつけ|打ち込|突き上げ|律動|抽送|腰を(?:振|打ち|揺さぶ|くねら|擦りつけ)|締めつけ(?:た|る|られ)|締め上げ|搾|揺さぶ|突かれ|貫かれ|腰の動き|動き出し|沈められ|腰を揺ら|奥まで届|深いところ(?:に|まで)[^。]{0,6}届|肌がぶつか|ベッドが軋|寝床が軋|軋む音|擦り上げ|突(?:く|い)たび|繋がったまま|繋がった(?:ところ|場所)/,
    /* 繋がったあとに出すと逆戻りになる前戯（口・手・指で入れる。胸や口づけは最中にもある） */
    foreHard: /舌を(?:這わせ|ねじ込)|舐め(?:上げ|回|た|る|て)|吸い上げ|咥え|扱(?:い|く|か)|しごい|指(?:を|で)[^。]{0,10}(?:沈め|差し入れ|入れ|かき回)|顔の上に跨/,
    oralOnly: /咥|喉|口に含|舌|唇に押しつけ/,
    /* 脱がせる */
    undress: /服を(?:脱が|はだけ|剥|たくし上げ)|脱がせ|脱がされ|ボタンを外|下着を(?:下ろ|ずら|剥ぎ|脱が)|シャツを(?:たくし上げ|脱が|はだけ)|はだけ(?:させ|られ)|裸に(?:し|され)|服は一枚ずつ/,
    /* 挿入の前の下ごしらえ（ほぐす・慣らす） */
    prep: /(?:入口|中|\{ナカ\}|奥|後ろ|\{女性器\}|\{後孔\})を[^。]{0,8}ほぐ|指で[^。]{0,8}ほぐ|慣らし|慣らす/,
    /* 二回目（同じ場面の中のもう一度）：山場のあとの挿入を、新しい回の始まりとして扱う */
    again: /もう一度|もう一回|二回戦|二度目|再び|ふたたび|休む間もなく|息が整う(?:のも|より)/,
    softPart: /乳首|\{胸\}|胸の先|首筋|耳|唇を|鎖骨/,
    /* 前戯 */
    fore: /舌を這わせ|舐め(?:上げ|回|た|る|て)|吸い上げ|咥え|指(?:を|で)[^。]{0,10}(?:なぞ|沈め|差し入れ|入れ|探|かき回)|愛撫|花芯|胸の先/,
    /* 焦らし（達することを許さない） */
    tease: /寸止め|寸前で(?:止|引|手を)|ストップ|お預け|イかせ(?:ない|てあげない)|焦らし|焦らす|わざと(?:動きを|手を)?(?:止め|緩め|離)/,
    /* 受けのリアクション（地の文） */
    react: /\{b\}[はが][^。]{0,40}(?:首を(?:振|横)|唇を噛|顔を(?:背け|逸ら|覆|隠|埋め)|言え(?:ず|な)|口に(?:し|出)|呟|囁|答え|頷|目を(?:開け|逸ら|伏せ|閉じ)|声を(?:上げ|漏ら|堪え|噛み殺|こぼ)|名前を呼|名前が)/
  };
  /* 応答を求める台詞（攻めの台詞の最初の言い回しで見る） */
  var DEMAND = F.DEMAND = [
    ['name', /名前(?:を|、)?(?:呼|言)|呼んで(?:みろ|みて|ごらん|よ)|呼べ/],
    ['say', /言[えっ]て(?:みろ|みて|ごらん|ほしい)|言え[。！？]?$|言え[。！？]|言いな(?:さい)?[。！？]?|口に(?:しろ|して|出して)|ねだって(?:みろ|みて|ごらん)|おねだり(?:して|しろ)|欲しいって(?:言|顔)|お願いして(?:みろ|みて|ごらん)|どこが(?:いい|気持ちいい)(?:か|の)?[、。？]|何が欲しい/],
    ['show', /声[^」。]{0,6}(?:出せ|出して|聞かせ|我慢する?な|抑え(?:る)?な|殺すな)|顔(?:を|、)?(?:見せ|隠すな|上げ|伏せるな)|目(?:を|、)?(?:逸らすな|開け|閉じるな)|こっち(?:を)?見(?:ろ|て)/]
  ];
  /* 同じ動き（一回の場面で一度だけ） */
  var MOTION = F.MOTION = {
    throwDown: /突き倒|(?:敷布|ベッド|シーツ)(?:へ|に|の上へ|の上に)(?:乱暴に)?(?:転が|放り|投げ)|押し倒|引き倒/,
    wristPin: /手首を[^。]{0,14}(?:掴(?:み|ん)|押さえ(?:つけ|込)(?!たまま)|縫いとめ(?!たまま)|まとめ(?:て掴|上げ))/,
    hairGrab: /髪を(?:掴|鷲掴|引)/,
    chinGrab: /顎を(?:掴|持ち上げ|すくい)/,
    flipRear: /うつ伏せに(?:返|させ)|四つん這いにさせ/,
    legsUp: /両脚を(?:抱え上げ|肩に)/,
    hipPull: /腰を[^。]{0,10}(?:掴んで引き戻|骨が軋む)/,
    stop: /ストップ|寸前で(?:止|引)/
  };
  var MOVE_TO = { throwDown: 'aUp', flipRear: 'rear', legsUp: 'aUp' };
  /* 指を入れた段落・指を抜く文・挿入（点検 audit/misc.js の FI と同じ見方） */
  var FIN = /指(?:を|が)(?:[^。]{0,12})(?:ねじ込|挿れ|挿し|差し入れ|入れ|沈め|埋め|潜り込|滑り込|突き入れ)|指で(?:[^。]{0,10})(?:掻き回|かき回|ほぐ|擦|こす|責め|突)|指(?:を|が)(?:[^。]{0,8})(?:動か|曲げ|抜き差し|出し入れ)/;
  var FOUT = /指を(?:[^。]{0,8})(?:抜|引き抜|離)|指が(?:[^。]{0,6})(?:抜け|抜か|離れ)|舐め取|指を(?:[^。]{0,8})(?:見せ|突きつけ|口に)/;
  var INS2 = /突き入れ|挿入|貫い|貫か|繋が(?:っ|る|り)|腰を沈め|(?:先端|切っ先|熱|もの|それ)を(?:[^。]{0,10})(?:押し当て|宛てが|あてが|埋め|沈め|押し込)|奥まで(?:[^。]{0,6})(?:押し込|沈め|呑み込|突き)|ゆっくりと(?:[^。]{0,6})入って/;
  /* 体位：変える動き（chg）と、体位を前提にした言い回し（at）。aUp＝攻めが上（女性の攻め×男性で攻めが跨るのも含む）・rear＝後ろから・bUp＝受けが上・sit＝座位 */
  var POS = F.POS = {
    chg: {
      aUp: /\{b\}を[^。{]{0,20}(?:押し倒|組み敷|仰向けに|突き倒|転がし|ベッドに(?:押しつけ|沈め|横たえ)|シーツに(?:押しつけ|沈め))|組み敷(?:き直|いた(?!まま))|寝かせ直|(?:敷布|ベッド)へ(?:乱暴に)?(?:転がし|突き倒)|両脚を(?:抱え上げ|肩に)|face>/,
      rear: /うつ伏せに(?:返|させ|押し|し)|四つん這いに(?:させ|な)|後ろを向かせ|腰だけを引き上げ|背後から(?:覆|抱き|のしかか)|背中を向けて跨り直し|背を向けるように体を返し、改めて腰の上に跨り直し|back>/,
      bUp: /\{b\}[はが](?:[^。「]{0,30})(?:跨が(?!らせ)|跨っ|跨り|跨い|またが(?!らせ)|またい|馬乗り|上に乗(?!せ)|上になっ|乗り上げ)|\{b\}を[^。]{0,14}(?:上に乗せ|腰の上(?:へ|に)|跨がらせ)|\{a\}を[^。{]{0,12}(?:押し倒|仰向けに|組み敷)|ride>/,
      sit: /膝の上(?:へ|に)(?:座らせ|乗せ|抱き上げ|乗り上げ|跨(?:っ|が|り)?)|向かい合わせに膝|膝をまたが|対面座位|lap>/
    },
    at: {
      aUp: /真上から|組み敷(?:いた|かれた)まま|覆いかぶさ(?:った|られた)まま|頭の上で(?:押さえつけ|縫いとめ)たまま|仰向けの\{b\}/,
      rear: /後ろから(?:深く|突|貫|打ち|揺さぶ|抉)|四つん這いのまま|うつ伏せのまま|背中に覆いかぶさ/,
      bUp: /\{b\}が(?:上で)?腰を(?:落と|上下)|\{b\}は[^。]{0,10}跨ったまま|\{a\}は[^。]{0,16}下から突き上げ/,
      sit: /膝の上で揺/
    }
  };
  /* 女性の攻め×男性（fm）：攻めが跨る文は攻めが上 */
  var FM_AUP = /\{a\}[はが](?:[^。「]{0,30})(?:跨が|跨っ|跨り|馬乗り|上に乗|腰を落と)|\{b\}[はが][^。]{0,24}\{a\}を[^。]{0,12}(?:上に乗せ|上へ)/;

  function narrOf(s) { return String(s).replace(/\uE3A0[^\uE3A1]*\uE3A1/g, '').replace(/「[^」]*」/g, '').replace(/『[^』]*』/g, ''); }
  function sentences(s) {
    var out = [], d = 0, st = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '「' || c === '『') d++;
      else if (c === '」' || c === '』') d = Math.max(0, d - 1);
      else if (!d && (c === '。' || c === '！' || c === '？')) { out.push(s.slice(st, i + 1)); st = i + 1; }
    }
    if (st < s.length) out.push(s.slice(st));
    return out.filter(function (x) { return /\S/.test(x); });
  }
  /* 文ごとに：山場（寸前で止める文は除く） */
  function hasClimax(narr) { return sentences(narr).some(function (x) { return RE.climax.test(x) && !RE.notClimax.test(x); }); }
  /* 台詞の取り出し：{ who: 'a'|'b'|'', s: 最初の言い回し, raw, at } */
  function linesOf(t) {
    var out = [], re = /(\{[ab]\})?「([^」]*)」(?:\uE3A0[^\uE3A1]*\uE3A1)?/g, m;
    while ((m = re.exec(t))) {
      var who = m[1] ? m[1].charAt(1) : '';
      if (!who) {
        var pre = t.slice(Math.max(0, m.index - 40), m.index), k = pre.lastIndexOf('。'), seg = k >= 0 ? pre.slice(k + 1) : pre;
        var ia = seg.lastIndexOf('{a}は'), ib = seg.lastIndexOf('{b}は');
        if (ia >= 0 || ib >= 0) who = ia > ib ? 'a' : 'b';
      }
      var s = m[2].split('｜')[0].replace(/＠[^＠]*＠/g, '');
      out.push({ who: who, s: s, raw: m[0], at: m.index, end: m.index + m[0].length });
    }
    return out;
  }
  function normLine(s) { return String(s).replace(/[\s　、。…・！？!?♡ー〜~っッ―—]/g, ''); }
  /* 喘ぎだけの台詞（言葉にならない声）は二度出しに数えない */
  function moanOnly(s) { var n = normLine(s); return n.length < 6 || !/[一-鿿ァ-ヺ]/.test(n); }
  function clausesOf(s) { return String(s).split(/[。！？!?　]/).map(normLine).filter(function (x) { return x.length >= 6; }); }

  /* ---------- 本文を段（部品）に分ける ---------- */
  var SPEECH = /^(?:\{[ab]\})?「/, CONT = /^(?:そのまま|それから|そして|それでも|すると|やがて)/;
  function speechPara(p) { if (!SPEECH.test(p)) return false; var n = narrOf(p).replace(/\{[ab]\}|[\s　―…—]/g, ''); return n.length <= 15; }
  /* 名前を {a}{b} にそろえる */
  function normNames(t, a, b) {
    t = String(t);
    var an = a && a.name, bn = b && b.name;
    if (an && bn && an !== bn) {
      var A0 = '\u0001A\u0001', B0 = '\u0001B\u0001';
      if (an.length >= bn.length) t = t.split(an).join(A0).split(bn).join(B0); else t = t.split(bn).join(B0).split(an).join(A0);
      t = t.split(A0).join('{a}').split(B0).join('{b}');
    }
    return t;
  }
  /* 本文 → { units: [{ paras: [...] }], tail: [...]（呼ぶ側の事後の段：判定しない） } */
  F.split = function (text, after) {
    var t = String(text), tail = '';
    if (after) {
      var k = t.lastIndexOf(after);
      if (k > 0 && t.slice(k).length <= after.length + 400) { tail = t.slice(k); t = t.slice(0, k).replace(/\n+$/, ''); }
    }
    var ps = t.split(/\n\n+/), units = [];
    ps.forEach(function (p, i) {
      if (!units.length || (!speechPara(p) && !CONT.test(p))) units.push({ paras: [p] });
      else units[units.length - 1].paras.push(p);
    });
    return { units: units, tail: tail ? tail.split(/\n\n+/) : [] };
  };
  /* 段の特徴 */
  /* 流れを整える段（つなぎ・追い上げ・攻めが迫る段・リアクション）は、本文からも見分ける（点検が本文だけを見ても同じ数え方になるように） */
  var FLOWT = null;
  /* 場所の語を言い換えても（シーツ→クッションなど。(l) の直し）同じ段と見分けられるように、寝床の語をそろえて比べる */
  function normPl(x) { return String(x).replace(/シーツ|クッション|ラグ|敷布|ベッド|ソファ|寝床|布団/g, '□'); }
  function flowKind(p) {
    var X = TX();
    if (!FLOWT) {
      FLOWT = { exact: {}, pre: [] };
      var put = function (o, kind) { if (!o) return; Object.keys(o).forEach(function (k) { var v = o[k]; if (Array.isArray(v)) v.forEach(function (x) { FLOWT.exact[normPl(x)] = kind; }); else put(v, kind); }); };
      put(X.BRIDGE, 'bridge'); put(X.MOVE, 'move'); put(X.BUILD, 'build'); put(X.BUILD_PRE, 'build'); put(X.PRESS, 'press');
      var pr = function (o) { if (!o) return; Object.keys(o).forEach(function (k) { var v = o[k]; if (Array.isArray(v)) v.forEach(function (x) { FLOWT.pre.push(normPl(x)); }); else pr(v); }); };
      pr(X.REACT);
      if (!X.BRIDGE) FLOWT = null;
      if (!FLOWT) return '';
    }
    p = normPl(p);
    if (FLOWT.exact[p]) return FLOWT.exact[p];
    for (var i = 0; i < FLOWT.pre.length; i++) if (p.indexOf(FLOWT.pre[i]) === 0) return 'react';
    return '';
  }
  F.flowKind = flowKind;
  function feat(u, mode) {
    var t = u.paras.join('\n\n'), n = narrOf(t), f = { t: t, n: n };
    if (!u.flow && u.paras.length === 1) { var fk = flowKind(u.paras[0]); if (fk) u.flow = fk; }
    f.lines = linesOf(t);
    f.climax = hasClimax(n);
    f.insert = mode !== 'ff' && sentences(n).some(function (x) { return RE.insert.test(x) && !RE.oralOnly.test(x); });
    f.inside = mode !== 'ff' && sentences(n).some(function (x) { return RE.inside.test(x) && !/指|舌|口で|唇で|玩具|ローター/.test(x); });
    f.foreHard = !f.inside && !f.insert && sentences(n).some(function (x) { return RE.foreHard.test(x) && !RE.softPart.test(x); });
    f.again = RE.again.test(n);
    f.undress = RE.undress.test(n);
    f.prep = RE.prep.test(n);
    f.fore = RE.fore.test(n);
    f.tease = RE.tease.test(t) && !f.climax;
    /* 体位：変える動き・前提の言い回し（どちらも文の中の位置で並べ、いちばん後ろの変える動きが今の体位） */
    var chg = [], at = [];
    Object.keys(POS.chg).forEach(function (k) {
      if (k === 'bUp' && mode === 'fm') return;
      var re = new RegExp(POS.chg[k].source, 'g'), m; while ((m = re.exec(n))) chg.push({ k: k, i: m.index + m[0].length });
    });
    if (mode === 'fm') { var re2 = new RegExp(FM_AUP.source, 'g'), m2; while ((m2 = re2.exec(n))) chg.push({ k: 'aUp', i: m2.index + m2[0].length - 0.5, fm: true }); }
    Object.keys(POS.at).forEach(function (k) {
      if (k === 'bUp' && mode === 'fm') return;
      var re = new RegExp(POS.at[k].source, 'g'), m; while ((m = re.exec(n))) at.push({ k: k, i: m.index, s: m[0] });
    });
    chg.sort(function (x, y) { return x.i - y.i; }); at.sort(function (x, y) { return x.i - y.i; });
    f.chg = chg; f.at = at;
    f.motions = [];
    Object.keys(MOTION).forEach(function (k) { var m = MOTION[k].exec(n); if (m) f.motions.push({ k: k, s: m[0] }); });
    /* 応答を求める台詞（攻めの台詞） */
    f.demands = [];
    f.lines.forEach(function (l) {
      if (l.who !== 'a') return;
      if (/次|また|今度|いつか|気が向/.test(l.s)) return;
      for (var i = 0; i < DEMAND.length; i++) if (DEMAND[i][1].test(l.s)) { f.demands.push({ kind: DEMAND[i][0], at: l.end, s: l.s }); break; }
    });
    return f;
  }
  F.feat = feat;
  /* 文の位置 i 以降に、受けのリアクション（受けの台詞・リアクションの地の文）があるか */
  function reactAfter(t, from, limitSent, anyB) {
    var rest = t.slice(from);
    if (limitSent) { var ss = sentences(rest); rest = ss.slice(0, limitSent).join(''); }
    if (RE.react.test(rest)) return true;
    var ls = linesOf(rest);
    for (var i = 0; i < ls.length; i++) { if (ls[i].who === 'b') return true; if (ls[i].who === 'a' && !anyB) return false; }
    return false;
  }

  /* 始まり方：頭の段で、先に相手へ手を出したのはどちらか（'a'＝攻めから・'b'＝受けから・''＝どちらともなく） */
  var ST_A = /\{a\}[はが](?:[^。「]{0,30})\{b\}(?:を|に|の)/, ST_B = /\{b\}[はが](?:[^。「]{0,30})\{a\}(?:を|に|の)/;
  F.starter = function (t) {
    var n = narrOf(t), ma = ST_A.exec(n), mb = ST_B.exec(n);
    if (ma && (!mb || ma.index <= mb.index)) return 'a';
    if (mb) return 'b';
    return '';
  };
  /* ---------- 文ごとの状態（2026-11-04。看病・新婚の遊んで確かめた報告）：挿入中か・指が入っているか・目隠し中か・場所・終わりの台詞を出したか ----------
     段の中の文を前から順に読み、状態に合わない文を数える（F.check の最後で、呼ぶ側の事後の段 ext.tail も含めて見る）。
       (i) 挿入の状態：入れていない・抜いたあとの「抜かないまま」「繋がったまま」、指を入れていないのに「指を抜く」
       (j) 目隠し中に、受けが見る・攻めが「こっちを見ろ」
       (k) 後ろからの体位のまま、顔を見つめる・目を合わせる・額をつける
       (l) 場所の飛び：場面の中で場所の語が変わるのに、移る文（運ぶ・立たせる・もつれ込む…）が無い
       (m) 終わりの台詞（「じゃあな」「先に帰る」など、その場を切り上げる台詞）のあとに、会話や寄り添う文が続く
       (n) 体の組に合わない語：男性器の無い人の男性器・女性どうしの場面の男性器の語・受けが入れる側になる文 */
  var ST2 = F.ST2 = {
    needIn: /抜かないまま|抜かずに|抜かれる前に|抜こうとすると|繋がったまま|(?:挿れ|入れ|沈め|埋め|呑み込ん|咥え込ん)たまま(?![^。]{0,4}(?:指|舌))|中で締めつけたまま/,
    wd: /引き抜|抜け出(?:す|し|た|る)|ずるりと抜|ぬるりと抜|(?:\{男性器\}|もの|自身|それ|腰)を(?:[^。]{0,4})抜(?:き|い|く)|体を離(?:し|す|した)|腰を浮かせて[^。]{0,12}抜/,
    fin: /指(?:を|が)[^。「」]{0,16}(?:ねじ込|挿|差し入|入れ|入っ|沈|埋|潜り込|滑り込|突き入|咥え|呑み込|抜き差し|出し入れ)|指で[^。「」]{0,12}(?:ほぐ|掻き回|かき回|抉|擦|こす|責め|突)|指(?:を|が)[^。「」]{0,8}(?:動か|曲げ)|指が一本|指を[一二三]本/,
    /* 点検 misc の FI と同じく、髪に指を差し入れる文だけを除く */
    finNot: /髪に指|指を絡/,
    fout: /指を[^。「」]{0,10}(?:抜|引き抜)|指が[^。「」]{0,6}(?:抜け|抜か)/,
    blOn: /目隠し(?:を|で)?[^。]{0,8}(?:し|させ|され|巻|結|つけ|付け|当て|覆)|(?:布|ネクタイ|タオル|手のひら|リボン)で[^。]{0,8}目(?:を|元を)?(?:覆|塞)/,
    blOff: /目隠しを?[^。]{0,8}(?:外|取|解|ずら|ほど|剥)/,
    look: /\{b\}[はが][^。「]{0,30}(?:見つめ|見上げ|目を合わせ|見返|睨|見下ろ|見入|視線を(?:合わせ|向け|上げ)|目で追|見て(?:い|しま))/,
    /* 2026-11-05：「目を見て」「顔を見せて」「見つめて」も（電車の報告の申し送り。目隠しのあとの見る台詞） */
    lookLine: /(?:こっち|こちら|私|前)を?見(?:ろ|て|な|よ|なさい|るんだ)|目を(?:開け|逸らす|見て|見ろ|閉じるな)|目、見て|見つめ(?:て|ろ|返して)|顔(?:を|、)?(?:見せ|上げ|よく見せ)(?:て|ろ|な|なさい)|顔(?:を|、)?隠す(?:な|んじゃない)/,
    rearFace: /(?:顔|目|瞳)を[^。]{0,6}(?:じっと)?(?:見つめ|覗き込|のぞき込|見下ろ|のぞ)|見つめ合|目を合わせ|視線を合わせ|視線が絡|額を(?:つけ|合わせ|くっつけ|押し当て|寄せ)|額と額|額をこつん|鼻先を(?:すり|擦|寄せ)|まぶたに|唇を重ね/,
    rearOk: /振り向|振り返|肩越し|鏡|横顔|首をひね|後ろを向かせ(?:たまま)?顔|体を返|向き合|仰向け|向かい合|(?:シーツ|枕|敷布|布団|壁|腕)に額/,
    move: /運(?:ん|び|ぶ|ば)|連れ(?:て|込|出)|移(?:っ|し|動|ろ|る)|向か(?:っ|い|う)|抱き上げ|抱え上げ|抱えて|もつれ(?:る|込)|(?:へ|まで)[^。]{0,6}(?:行|戻|導|誘)|倒れ込|場所を変え|起き上が|降ろ|下ろ|立たせ|立ち上が|引っ張|手を引|押し倒|押しつけ|押し付け|座らせ|寝かせ|横たえ|押し込|引き倒|追い込|崩れ落ち|たどり着|から上が|戻っ|降り/,
    bye: /じゃあ(?:な|ね)|それじゃ(?:あ|、|。|ね)|^では[。、]?$|(?:先に|もう)(?:帰|行|戻|上が)|失礼(?:する|します)|帰って(?:いい|くれ)|出て(?:いけ|って)/,
    stay: /寄り添|抱き(?:寄せ|しめ|合|直)|腕枕|毛布|くるま|話し込|語り合|髪を(?:撫|梳)|胸に(?:頬|顔)|指を絡|肩を寄せ|頭を(?:預|撫)|腕の中|寝息|眠りに|微睡|まどろ/,
    mWord: /\{(?:男性器|亀頭|竿|陰嚢|先走り|精液|カリ)\}|射精|吐精|びゅるる|びゅくっ|どぷっ/
  };
  var PLACE = F.PLACE = [
    ['bed', /ベッド|寝床|布団|寝台|シーツ|敷布|寝室/],
    ['sofa', /ソファ|長椅子/],
    ['kitchen', /台所|キッチン|調理台|シンク|流し台/],
    ['bath', /浴室|風呂(?!上が)|湯船|浴槽|シャワー|脱衣所|洗面台/],
    ['desk', /机|デスク|テーブル/],
    ['wall', /壁(?:際|に(?:手|背|押し|もた|預け|つ|両手|額|胸|頬)|へ(?:押し|追い)|を背|に向か)/],
    ['door', /玄関|ドアに|扉に/],
    ['floor', /(?:^|[^寝敷])床(?:に|へ|の上)(?![^。]{0,6}(?:落ち|散ら|脱ぎ|放|投げ|置))|ラグの上|畳の上|絨毯/]
  ];
  var PLACE_JA = F.PLACE_JA = { bed: 'ベッド', sofa: 'ソファ', kitchen: '台所', bath: '浴室', desk: '机', wall: '壁際', door: '玄関', floor: '床' };
  function placeOf(n) {
    var out = [];
    PLACE.forEach(function (p) { var re = new RegExp(p[1].source, 'g'), m; while ((m = re.exec(n))) { if (n.substr(m.index + m[0].length, 2) === 'より') continue; out.push({ k: p[0], i: m.index }); break; } });
    out.sort(function (x, y) { return x.i - y.i; });
    return out;
  }
  F.placeOf = placeOf;
  function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\  /* ---------- 状態を進めながら、段ごとの食い違いを数える ---------- */'); }
  /* all：段（最後に呼ぶ側の事後の段があれば ext.tailAt 以降）。戻り値：食い違いの配列（k: i〜n、i: 段の番号、s: 文、line: 台詞） */
  function walk(all, mode, ext) {
    ext = ext || {};
    var v = [], st = { inside: false, finger: false, blind: false, place: null, moves: 0, bye: null, climax: false, posture: null };
    var aM = ext.aM != null ? ext.aM : mode !== 'ff' && mode !== 'fm', bM = ext.bM != null ? ext.bM : mode === 'fm';
    var seen = {};
    var add = function (x) { var key = x.k + '|' + x.i + '|' + (x.s || '') + '|' + (x.line ? x.line.raw : ''); if (seen[key]) return; seen[key] = 1; v.push(x); };
    for (var i = 0; i < all.length; i++) {
      var u = all[i], ss = [].concat.apply([], u.paras.map(sentences));
      for (var j = 0; j < ss.length; j++) {
        var s = ss[j], n = narrOf(s), ls = linesOf(s);
        /* 体位（段をまたいで続く。変える動きのある文で切り替える） */
        var chg = [];
        Object.keys(POS.chg).forEach(function (k) { if (k === 'bUp' && mode === 'fm') return; var m = POS.chg[k].exec(n); if (m) chg.push({ k: k, i: m.index }); });
        if (mode === 'fm' && FM_AUP.test(n)) chg.push({ k: 'aUp', i: 0 });
        chg.sort(function (x, y) { return x.i - y.i; });
        var rearBefore = st.posture === 'rear' && !chg.length;
        if (chg.length) st.posture = chg[chg.length - 1].k;
        /* (i) 挿入の状態 */
        var isIns = mode !== 'ff' && (RE.insert.test(n) && !RE.oralOnly.test(n) || RE.inside.test(n) && !/指|舌|口で|唇で|玩具|ローター/.test(n));
        var finIn = ST2.fin.test(n.replace(/髪に指[^。]*/g, '').replace(/指を絡[^。]*/g, ''));
        var mNeed = ST2.needIn.exec(n);
        if (mNeed && !st.inside && !isIns && !(st.finger || finIn) && !/指|舌/.test(n.slice(Math.max(0, mNeed.index - 12), mNeed.index + mNeed[0].length + 4)) && !/(?:顔|頬|額|鼻|唇|口)を[^。]{0,4}$/.test(n.slice(0, mNeed.index))) {
          add({ k: 'i', i: i, s: s, why: '入れていない（抜いたあとの）「' + mNeed[0] + '」', sub: mNeed[0], again: st.wasIn });
        }
        if (ST2.fout.test(n) && !st.finger && !finIn && !(mode === 'ff' && st.inside)) add({ k: 'i', i: i, s: s, why: '指を入れていないのに指を抜く' });
        if (finIn) { st.finger = true; if (mode === 'ff') st.inside = true; }
        if (isIns) { st.inside = true; st.wasIn = true; }
        if (ST2.fout.test(n)) { st.finger = false; if (mode === 'ff') st.inside = false; }
        if (ST2.wd.test(n) && !/指|舌/.test(n.slice(Math.max(0, n.search(ST2.wd) - 10), n.search(ST2.wd) + 8))) st.inside = false;
        /* (j) 目隠し */
        if (ST2.blOff.test(n)) st.blind = false;
        else if (ST2.blOn.test(n)) st.blind = true;
        else if (st.blind) {
          if (ST2.look.test(n)) add({ k: 'j', i: i, s: s, why: '目隠し中に受けが見る' });
          ls.forEach(function (l) { if (l.who && ST2.lookLine.test(l.s)) add({ k: 'j', i: i, s: s, line: l, why: '目隠し中に「' + l.s + '」' }); });
        }
        /* (k) 後ろからの体位のまま、顔を合わせる */
        if (rearBefore && ST2.rearFace.test(n) && !ST2.rearOk.test(n)) add({ k: 'k', i: i, s: s, why: '後ろからの体位のまま「' + ST2.rearFace.exec(n)[0] + '」' });
        /* (l) 場所 */
        var pl = /(?:余裕|暇)も(?:な|無)|ないまま/.test(n) ? [] : placeOf(n);
        /* 山場のあと（事後・翌朝）は場所が変わってよい */
        if (st.climax) { if (pl.length) st.place = pl[pl.length - 1].k; pl = []; }
        if (pl.length) {
          var mv = ST2.move.test(n);
          pl.forEach(function (p) {
            if (!st.place) { st.place = p.k; st.placeS = s; st.placeI = i; st.placeFirst = true; return; }
            if (p.k === st.place) return;
            if (mv && st.moves < 2) { st.moves++; st.place = p.k; st.placeS = s; st.placeI = i; st.placeFirst = false; return; }
            add({ k: 'l', i: i, s: s, why: '場所が「' + PLACE_JA[st.place] + '」から「' + PLACE_JA[p.k] + '」へ飛ぶ', from: st.place, to: p.k, from0: st.placeS, fromI: st.placeI, first: st.placeFirst });
            st.placeFirst = false;
          });
        }
        /* (m) 終わりの台詞のあと */
        if (hasClimax(n) && !RE.notClimax.test(n)) { st.climax = true; st.posture = null; st.blind = false; }
        if (st.bye) {
          if (ls.length || ST2.stay.test(n)) add({ k: 'm', i: st.bye.i, s: st.bye.s, line: st.bye.line, why: '終わりの台詞「' + st.bye.line.s + '」のあとに' + (ls.length ? '会話' : '寄り添う文') + '：' + n.slice(0, 30) });
          if (ls.length || ST2.stay.test(n)) st.bye = null;
        }
        if (st.climax) ls.forEach(function (l) { if (l.who && ST2.bye.test(l.s.replace(/[…―]+/g, ''))) st.bye = { i: i, s: s, line: l }; });
        /* (n) 体の組に合わない語 */
        if (mode === 'ff' && ST2.mWord.test(n)) add({ k: 'n', i: i, s: s, why: '女性どうしの場面で男性器の語「' + ST2.mWord.exec(n)[0] + '」' });
        else {
          if (!aM && /\{a\}の(?:[^。、{]{0,4})\{(?:男性器|亀頭|竿|陰嚢|先走り|カリ)\}/.test(n)) add({ k: 'n', i: i, s: s, why: '男性器の無い攻めの男性器' });
          if (!bM && /\{b\}の(?:[^。、{]{0,4})\{(?:男性器|亀頭|竿|陰嚢|先走り|カリ)\}/.test(n)) add({ k: 'n', i: i, s: s, why: '男性器の無い受けの男性器' });
          if (mode !== 'fm' && aM && (/\{b\}の[^。、]{0,4}\{男性器\}を[^。]{0,12}\{a\}の[^。]{0,10}(?:中|\{ナカ\}|奥|\{後ろ\}|\{女性器\})/.test(n) || /\{a\}[はが][^。]{0,24}\{b\}の[^。、]{0,4}\{男性器\}を[^。]{0,16}(?:呑みこ|呑み込|迎え入れ|受け入れ)/.test(n) || /\{b\}[はが][^。]{0,16}\{a\}の(?:\{ナカ\}|\{後ろ\}|\{女性器\}|中|奥)(?:へ|に|を)[^。]{0,8}(?:突き入れ|沈め|穿|埋め|ねじ込)/.test(n))) add({ k: 'n', i: i, s: s, why: '受けが入れる側になる文' });
        }
      }
    }
    return v;
  }
  F.walk = walk;
  /* ---------- 状態を進めながら、段ごとの食い違いを数える ---------- */
  var HEAT = { move: [0, 0], lead: [5, 5], undress: [5, 5], fore: [20, 10], insert: [15, 20], play: [20, 20], climax: [0, 0], flow: [10, 5], build: [25, 25], bridge: [5, 5], react: [10, 5], press: [5, 5] };
  var TH_B = 60, TH_T = 50;
  F.TH = { b: TH_B, t: TH_T };
  /* units：F.split の段（feat 済みでなくてよい）。戻り値：{ v: [{ k: 'a'|'b'|'c'|'d'|'e', i: 段の番号, why, ... }], st: 最後の状態, stages: [段ごとの段階] } */
  /* play：エッチの型（play-r18.js の HK.Play）。{ prop, lock（型の体位の posture）, posT（型の繋がる段の頭の段落） }。あれば型の矛盾（h）も数える */
  F.check = function (units, mode, play, ext) {
    var posIdx = -1;
    if (play && play.posT) for (var pi0 = 0; pi0 < units.length; pi0++) if (units[pi0].paras.join('\n\n').indexOf(play.posT) >= 0) { posIdx = pi0; break; }
    var st = { stage: 'lead', insert: false, climax: false, posture: null, heatB: 0, heatT: 0, hold: false, used: { lines: {}, motions: {}, mpos: {} }, pending: null, posPrev: null }, v = [], stages = [];
    for (var i = 0; i < units.length; i++) {
      var u = units[i], f = u.f || (u.f = feat(u, mode)), sg;
      /* (d) 前の段の応答待ち：この段の頭（最初の 2 文か、受けの台詞の段）にリアクションが無い */
      if (st.pending) {
        var p0 = u.paras[0], ok = u.flow === 'react' || (SPEECH.test(p0) && /^\{b\}「/.test(p0)) || reactAfter(f.t, 0, 2);
        if (!ok) v.push({ k: 'd', i: i, why: '応答待ち（' + st.pending.kind + '：' + st.pending.s + '）のあとにリアクションが無い' });
        st.pending = null;
      }
      /* (a) 段階の逆戻り */
      if (f.undress && st.insert && !f.climax) v.push({ k: 'a', i: i, why: '挿入のあとに脱がせる', re: RE.undress });
      else if (f.prep && st.insert && !f.climax && !f.inside) v.push({ k: 'a', i: i, why: '挿入のあとに下ごしらえ', re: RE.prep });
      else if (f.foreHard && st.insert && !f.climax) v.push({ k: 'a', i: i, why: '挿入のあとに前戯', re: RE.foreHard });
      else if (f.insert && st.climax && !f.climax && !f.again) v.push({ k: 'a', i: i, why: '山場のあとに挿入', re: RE.insert });
      /* 同じ場面の中のもう一度：新しい回の始まり（繋がった・性感はまだ残っている） */
      if (st.climax && (f.again || f.insert) && !f.climax) { st.climax = false; st.heatB = Math.max(st.heatB, 35); st.heatT = Math.max(st.heatT, 35); }
      /* (b) 体位：変える動きより前にある前提の言い回しが、今の体位と違う */
      st.posPrev = st.posture;
      var pos = st.posture, ci = 0;
      for (var j = 0; j < f.at.length; j++) {
        var x = f.at[j];
        while (ci < f.chg.length && f.chg[ci].i <= x.i) { pos = f.chg[ci].k; ci++; }
        if (pos && x.k !== pos) { v.push({ k: 'b', i: i, why: '体位「' + pos + '」のまま「' + x.s + '」（' + x.k + '）', to: x.k, from: pos, s: x.s }); pos = x.k; }
        else if (!pos) pos = x.k;
      }
      while (ci < f.chg.length) { pos = f.chg[ci].k; ci++; }
      st.posture = pos;
      /* (c) 二度出し：台詞（言い回しの節が同じ）・動き */
      f.lines.forEach(function (l) {
        if (moanOnly(l.s)) return;
        clausesOf(l.s).forEach(function (c) {
          if (st.used.lines[c] != null && st.used.lines[c] !== i) v.push({ k: 'c', i: i, why: '同じ台詞「' + l.s + '」', line: l, first: st.used.lines[c] });
          else st.used.lines[c] = i;
        });
      });
      f.motions.forEach(function (m) {
        /* 体位を変える動き（突き倒す・うつ伏せに返す）は、あいだに体位が変わっていれば二度目でもよい */
        if (m.k === 'flipRear' || m.k === 'legsUp') return;
        var tg = MOVE_TO[m.k], same = !tg || st.used.mpos[m.k] === tg && st.posPrev === tg;
        if (st.used.motions[m.k] != null && st.used.motions[m.k] !== i && same) v.push({ k: 'c', i: i, why: '同じ動き「' + m.s + '」（' + m.k + '）', motion: m, first: st.used.motions[m.k] });
        else { st.used.motions[m.k] = i; st.used.mpos[m.k] = tg || ''; }
      });
      /* 段階と性感 */
      var ins = f.insert || (f.inside && !st.insert);
      sg = f.climax ? 'climax' : u.flow ? 'flow' : ins && !st.insert ? 'insert' : st.insert || (mode === 'ff' && st.stage === 'play') ? 'play' : f.fore || f.prep || f.foreHard ? 'fore' : f.undress ? 'undress' : i === 0 ? 'lead' : st.stage === 'fore' ? 'fore' : st.stage === 'lead' || st.stage === 'undress' ? 'lead' : 'play';
      if (mode === 'ff' && sg === 'fore' && i > 0 && units.slice(0, i).some(function (w) { return w.f && w.f.fore; }) && st.heatB >= 20) sg = 'play';
      if (sg === 'climax' && !st.lastClimax) {
        if (st.heatB < TH_B || (mode !== 'ff' && st.heatT < TH_T) || st.hold) v.push({ k: 'e', i: i, why: '性感が閾値の前の山場（受け ' + st.heatB + '・攻め ' + st.heatT + (st.hold ? '・焦らしの直後' : '') + '）', hold: st.hold });
      }
      var hv = (sg === 'flow' && HEAT[u.flow]) || HEAT[sg] || HEAT.play;
      st.heatB += hv[0]; st.heatT += hv[1];
      if (f.tease) { st.heatB += 5; st.hold = true; } else if (sg !== 'climax') st.hold = false;
      if (sg === 'climax') { st.climax = true; st.heatB = 0; st.heatT = 0; }
      if (sg !== 'flow') st.lastClimax = sg === 'climax';
      if (ins || (f.climax && mode !== 'ff')) st.insert = true;
      if (sg !== 'flow') st.stage = sg === 'insert' ? 'play' : sg;
      stages.push(sg);
      /* この段の応答待ち：最後の応答を求める台詞のあと、同じ段にリアクションが無い */
      if (f.demands.length) {
        var dm = f.demands[f.demands.length - 1];
        if (!reactAfter(f.t, dm.at, 0, true)) st.pending = dm;
      }
    }
    if (st.pending) v.push({ k: 'd', i: units.length, why: '応答待ち（' + st.pending.kind + '：' + st.pending.s + '）で場面が終わる' });
    /* (h) 型の矛盾：着衣なのに脱がせる／型の体位の段のあと（山場まで）に別の体位へ変える動き */
    if (play) {
      var clx = false;
      for (var hi = 0; hi < units.length; hi++) {
        var hf = units[hi].f || (units[hi].f = feat(units[hi], mode));
        if (play.prop === 'chakui' && hf.undress) v.push({ k: 'h', i: hi, why: '着衣の型なのに脱がせる', re: RE.undress });
        if (hf.climax) clx = true;
        /* 女性の攻め×男性で攻めが腰を落とす言い回し（FM_AUP）は、どの体位でも使うので数えない */
        if (play.lock && posIdx >= 0 && hi > posIdx && !clx) {
          for (var hj = 0; hj < hf.chg.length; hj++) if (hf.chg[hj].k !== play.lock && !hf.chg[hj].fm) { v.push({ k: 'h', i: hi, why: '型の体位（' + play.lock + '）のあとに別の体位（' + hf.chg[hj].k + '）', re: POS.chg[hf.chg[hj].k], from: play.lock, to: hf.chg[hj].k }); break; }
        }
      }
    }
    /* (i)〜(n) 文ごとの状態（ext を渡したときだけ。ext.tail は呼ぶ側の事後の段） */
    if (ext) walk(ext.tail ? units.concat([ext.tail]) : units, mode, ext).forEach(function (x) { v.push(x); });
    return { v: v, st: st, stages: stages, posIdx: posIdx };
  };
  /* 体の組（男性器のある人）と呼ぶ側の事後の段 */
  /* 男性器のある人：体の設定（性器の欄）があればそれ、なければ場面の組（mf＝攻め・fm＝受け。オメガバースの女性のαの攻めは mf）か性別 */
  function extOf(a, b, tail, mode) {
    var P = HK.Pos;
    var hm = function (c, byMode) { if (P && P.genSet && P.genSet(c)) return !!P.hasM(c); if (byMode) return true; return P && P.hasM ? !!P.hasM(c) : !!c && c.gender === 'm'; };
    return { aM: hm(a, mode === 'mf'), bM: hm(b, mode === 'fm'), tail: tail && tail.length ? { paras: tail, tail: true } : null };
  }
  F.extOf = extOf;
  /* 本文を見る（点検用）：{ units, tail, check } */
  F.analyze = function (text, a, b, mode, after, play) {
    var t = normNames(text, a, b), af = after ? normNames(after, a, b) : '';
    var sp = F.split(t, af);
    sp.check = F.check(sp.units, mode || 'mf', play || null, extOf(a, b, sp.tail, mode || 'mf'));
    return sp;
  };

  /* ---------- 段数の上限（段階ごと。描写の長さ「厚く」は少し多め） ---------- */
  var CAP = F.CAP = {
    std: { lead: 2, undress: 1, fore: 2, insert: 1, play: 3, climax: 2 },
    thick: { lead: 2, undress: 1, fore: 2, insert: 1, play: 4, climax: 2 }
  };

  /* ---------- 直す ---------- */
  /* 一回の遊び（シミュレーション）のあいだ、使った文を覚えて避ける（F.memo.used。全部使ったら、いちばん前に使ったものから戻す） */
  function pickFrom(R, arr, used) {
    if (!arr || !arr.length) return '';
    if (HK.SexSpot && HK.SexSpot.cur) arr = HK.SexSpot.filter(arr, HK.SexSpot.cur);
    var M = F.memo || (F.memo = {}), U = M.used || (M.used = {}), best = Infinity, sub = [];
    M.usedN = M.usedN || 0;
    arr.forEach(function (x) { var v = used[x] ? 1e9 : U[x] == null ? -1 : U[x]; if (v < best) { best = v; sub = [x]; } else if (v === best) sub.push(x); });
    var s = sub[Math.floor(R() * sub.length)];
    used[s] = 1; U[s] = ++M.usedN;
    return s;
  }
  function psOf(c) { var b = (HK.personaOf ? HK.personaOf(c) : c && c.persona) || (c && c.persona) || 'gentle'; if (HK.Attr && HK.Attr.psNight) b = HK.Attr.psNight(c, null, b) || b; return /^(proud|stern|tsun|gentle|devoted|cool|free|shy|polite)$/.test(b) ? b : 'gentle'; }
  var NOM = /根元|竿|\{男性器\}|\{亀頭\}|ものが|ものを|硬く|吐き出|射精|搾/;
  var FACE = /胸に顔|首に腕|見上げ|見つめ|目を合わせ|鼻先|頬を両手|肩に額|顔をのぞ|見下ろ/;
  function noM(b) { var P = HK.Pos; return P && P.hasM ? !P.hasM(b) : false; }
  function flowUnit(text, kind) { return { paras: [text], flow: kind }; }
  /* 段の中で、その言い回しを含む一文を外す（外したあとに地の文が残るときだけ）。外せたら true */
  function cutSentence(u, re) {
    for (var k = 0; k < u.paras.length; k++) {
      var p = u.paras[k], ss = sentences(p);
      for (var j = 0; j < ss.length; j++) {
        if (!re.test(narrOf(ss[j]))) continue;
        var drop = [j];
        /* 直後の短い文（「指が食い込むほど強く。」など）は、外した文の続きなので一緒に外す */
        if (j + 1 < ss.length && narrOf(ss[j + 1]).length <= 14 && !/「/.test(ss[j + 1])) drop.push(j + 1);
        /* 外したあとに主語の無い文が頭に来るなら外さない（「後ろから舌を這わせ……」のように誰の動きか分からなくなる） */
        var nx = ss[drop[drop.length - 1] + 1];
        if (nx && (j === 0 || /[。」]$/.test(ss[j - 1] || '') && !/\{[ab]\}/.test(ss[j - 1] || '')) && !/^[^。]{0,16}(?:\{[ab]\}|二人|ふたり)/.test(narrOf(nx))) return false;
        var rest = ss.filter(function (x, q) { return drop.indexOf(q) < 0; }).join('');
        var others = u.paras.filter(function (x, q) { return q !== k; }).join('');
        if (narrOf(rest + others).replace(/\{[ab]\}|[\s　]/g, '').length < 20) return false;
        if (/\S/.test(rest)) u.paras[k] = rest; else u.paras.splice(k, 1);
        delete u.f;
        return true;
      }
    }
    return false;
  }
  /* 台詞を外す（台詞だけの段落は段落ごと） */
  function cutLine(u, raw) {
    for (var k = 0; k < u.paras.length; k++) {
      var p = u.paras[k], q = p.indexOf(raw);
      if (q < 0) continue;
      var np = (p.slice(0, q) + p.slice(q + raw.length)).replace(/^\s+|\s+$/g, '');
      if (!narrOf(np).replace(/\{[ab]\}|[\s　]/g, '')) u.paras.splice(k, 1); else u.paras[k] = np;
      delete u.f;
      return true;
    }
    return false;
  }
  /* 差し込まれた部品（夜の性格・夜の主導・能動性の型・攻めの台詞）を本文から外す */
  /* 部品の照合：そのままの文で見つからなければ、印（{男性器}・喘ぎの印・＠名前＠）を外した文で比べ、段落の大部分がその部品なら段落ごと */
  function bare(t) { return String(t).replace(/\uE3A0[^\uE3A1]*\uE3A1/g, '').replace(/＠[^＠]*＠/g, '').replace(/\{[^{}]*\}/g, '').replace(/[\s　]/g, ''); }
  function fuzzyIn(para, part) {
    var bp = bare(part), bq = bare(para);
    if (bp.length < 15) return false;
    var head = bp.slice(0, 15);
    return bq.indexOf(head) >= 0 && bp.length >= bq.length * 0.8;
  }
  function cutPart(units, part) {
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      for (var k = 0; k < u.paras.length; k++) {
        var q = u.paras[k].indexOf(part);
        if (q < 0 && fuzzyIn(u.paras[k], part)) { u.paras.splice(k, 1); if (!u.paras.length) units.splice(i, 1); else delete u.f; return true; }
        if (q < 0) continue;
        var np = (u.paras[k].slice(0, q) + u.paras[k].slice(q + part.length)).replace(/^\s+|\s+$/g, '');
        if (np) u.paras[k] = np; else u.paras.splice(k, 1);
        if (!u.paras.length) units.splice(i, 1); else delete u.f;
        return true;
      }
    }
    return false;
  }
  function partOf(parts, u, re) {
    var t = u.paras.join('\n\n');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].t;
      if (p && (t.indexOf(p) >= 0 || u.paras.some(function (x) { return fuzzyIn(x, p); })) && (!re || re.test(narrOf(p)))) return parts[i];
    }
    return null;
  }
  /* 段のほとんど（7 割以上）が差し込まれた部品なら、その部品（段ごと外してよい） */
  function partMostly(parts, u) {
    var p = partOf(parts, u); if (!p) return null;
    var bu = bare(narrOf(u.paras.join(''))), bp = bare(narrOf(p.t));
    return bp.length >= bu.length * 0.7 ? p : null;
  }
  function isCore(units, i, mode) {
    var u = units[i];
    if (u && u.keep) return true;
    if (i === 0 || !u.f) return i === 0;
    if (u.f.climax) return true;
    if (u.f.insert || u.f.inside) { for (var j = 0; j < i; j++) if (units[j].f && (units[j].f.insert || units[j].f.inside)) return false; return true; }
    return false;
  }
  /* ---------- (i)〜(n) を直す（2026-11-04） ----------
     言い換え（抜いたあとの「抜かないまま」→「もう一度沈め直して」など）→ 移る段（場所）→ その一文を外す、の順。挿入・山場の一文は外さない */
  var SUB = F.SUB = {
    i: [['抜かないまま、', 'もう一度奥まで沈め直して、'], ['抜かないまま', 'もう一度沈め直して'], ['抜かずに', 'もう一度沈め直して'], ['抜かれる前に、', 'もう一度沈め直すと、'], ['抜かれる前に', 'もう一度沈め直すと'],
      ['繋がったまま', 'もう一度繋がって'], ['挿れたまま', '挿れ直して'], ['入れたまま', '入れ直して'], ['沈めたまま', '沈め直して'], ['埋めたまま', '埋め直して'], ['呑み込んだまま', '呑み込み直して'], ['咥え込んだまま', '咥え込み直して']],
    j: [['{a}を見上げ', '{a}のほうへ顔を上げ'], ['見上げ', '顔を上げ'], ['涙目で睨み返すと', '涙声で首を振ると'], ['睨み返すと', '首を振ると'], ['睨み返し', '首を振り'], ['{a}を睨んだ', '顔を背けた']],
    k: [['見つめ合ったまま', '指を絡め合ったまま'], ['額を合わせたまま', '肌を重ねたまま'], ['{b}の額に、頬に、まぶたに、', '{b}のうなじに、肩に、背中に、'], ['鼻先をすり寄せて、笑いかける', '背中に頬をすり寄せて、小さく笑う']],
    /* 場所：寝床の語を、ソファ・床の場面の語に */
    l: { sofa: [['シーツ', 'クッション'], ['敷布', 'クッション'], ['ベッド', 'ソファ'], ['寝床', 'ソファ'], ['布団', 'ソファ']], floor: [['シーツ', 'ラグ'], ['敷布', 'ラグ'], ['ベッド', '床'], ['寝床', '床'], ['布団', 'ラグ']] }
  };
  function unitAt(S, i) { return i < S.units.length ? S.units[i] : S.tailU; }
  /* 段 i の手前の状態（場所・目隠し）。差し込む文（つなぎ・リアクション・追い上げ）を選ぶときに、合わない文を外すため */
  function stateAt(S, i) {
    var o = { place: null, blind: false };
    for (var j = 0; j < i && j < S.units.length; j++) S.units[j].paras.forEach(function (p) {
      sentences(p).forEach(function (x) { var n = narrOf(x), q = placeOf(n); if (q.length) o.place = q[q.length - 1].k; if (ST2.blOff.test(n)) o.blind = false; else if (ST2.blOn.test(n)) o.blind = true; });
    });
    return o;
  }
  function fitCand(S, i, list) {
    if (!list || !list.length) return list;
    var o = stateAt(S, i), all = S.units.map(function (u) { return u.paras.join('\n\n'); }).join('\n\n');
    var out = list.filter(function (t) {
      /* 本文にもう出ている文は選ばない（直し直しの二回目に、同じ追い上げの段を重ねないように） */
      if (all.indexOf(normNames(t, S.a, S.b)) >= 0 || all.indexOf(t) >= 0) return false;
      var n = narrOf(t), q = placeOf(n);
      if (o.place && q.some(function (z) { return z.k !== o.place; })) return false;
      if (HK.SexSpot && HK.SexSpot.cur && !HK.SexSpot.fitsSub(t, HK.SexSpot.cur)) return false;
      if (o.blind && (ST2.look.test(n) || /見上げ|見つめ|睨|目を合わせ|見下ろ/.test(n))) return false;
      return true;
    });
    return out.length ? out : list;
  }
  /* 段の中の文 s の中の from を to に（一つだけ） */
  function subIn(u, s, from, to) {
    for (var k = 0; k < u.paras.length; k++) {
      var q = u.paras[k].indexOf(s); if (q < 0) continue;
      var r = s.indexOf(from); if (r < 0) return false;
      u.paras[k] = u.paras[k].slice(0, q) + s.slice(0, r) + to + s.slice(r + from.length) + u.paras[k].slice(q + s.length);
      delete u.f;
      return true;
    }
    return false;
  }
  /* 段の中の文 s をそのまま外す（挿入・山場の文は外さない）。段が空になれば段ごと（呼ぶ側の事後の段は空のまま） */
  function cutExact(S, i, s) {
    var u = unitAt(S, i); if (!u) return false;
    var n = narrOf(s);
    if (hasClimax(n) || RE.insert.test(n)) return false;
    for (var k = 0; k < u.paras.length; k++) {
      var q = u.paras[k].indexOf(s); if (q < 0) continue;
      var np = (u.paras[k].slice(0, q) + u.paras[k].slice(q + s.length)).replace(/^[\s　]+|[\s　]+$/g, '').replace(/^――/, '');
      if (!narrOf(np).replace(/\{[ab]\}|[\s　―…]/g, '') && !/「/.test(np)) u.paras.splice(k, 1); else u.paras[k] = np;
      if (!u.paras.length && u !== S.tailU) S.units.splice(i, 1);
      delete u.f;
      return true;
    }
    return false;
  }
  function domPlace(S) {
    var cnt = {}, first = {}, k = 0, done = false;
    S.units.forEach(function (u) { if (done) return; u.paras.forEach(function (p) { sentences(p).forEach(function (x) { if (done) return; var n = narrOf(x); if (hasClimax(n) && !RE.notClimax.test(n)) { done = true; return; } placeOf(n).forEach(function (q) { cnt[q.k] = (cnt[q.k] || 0) + 1; if (first[q.k] == null) first[q.k] = k++; }); }); }); });
    var best = null; Object.keys(cnt).forEach(function (q) { if (!best || cnt[q] > cnt[best] || cnt[q] === cnt[best] && first[q] < first[best]) best = q; });
    return best;
  }
  function fitPlace(list, to) { var o = list.filter(function (t) { return placeOf(narrOf(t)).every(function (q) { return q.k === to; }); }); return o.length ? o : list; }
  function fixWalk(S, x) {
    var u = unitAt(S, x.i), T = TX();
    if (!u) return false;
    /* 流れを整える段（つなぎ・リアクション・追い上げ・迫る段・移る段）は、寝床の語の言い換えのほかは書き換えずに段ごと外す
       （本文だけを見る点検が、同じ段として見分けられるように）。要る段はあとで選び直す */
    if (!u.flow && u !== S.tailU && u.paras.length === 1) { var fk0 = flowKind(u.paras[0]); if (fk0) u.flow = fk0; }
    if (u.flow && u !== S.tailU) {
      var lf = x.k === 'l' && x.to === 'bed' && SUB.l[x.from] ? SUB.l[x.from].filter(function (p) { return x.s.indexOf(p[0]) >= 0; })[0] : null;
      if (lf && subIn(u, x.s, lf[0], lf[1])) { u.flow = flowKind(u.paras[0]) || u.flow; return true; }
      S.units.splice(x.i, 1); return true;
    }
    if (x.k === 'i' && x.sub) {
      if (x.again) { var si = SUB.i.filter(function (p) { return x.s.indexOf(p[0]) >= 0; })[0]; if (si && subIn(u, x.s, si[0], si[1])) return true; }
      return cutExact(S, x.i, x.s);
    }
    if (x.k === 'm') {
      /* 終わりの台詞（攻めの一言の部品なら部品ごと）を外す */
      var pm = partOf(S.parts, u);
      if (pm && pm.t.indexOf(x.line.raw.replace(/^\{[ab]\}/, '')) >= 0 && pm.t.length < 200) { cutPart(S.units, pm.t); S.parts.splice(S.parts.indexOf(pm), 1); return true; }
      return cutLine(u, x.line.raw) || cutExact(S, x.i, x.s);
    }
    if (x.k === 'j' && x.line) return cutLine(u, x.line.raw);
    if (x.k === 'j' || x.k === 'k') {
      var sl = SUB[x.k].filter(function (p) { return x.s.indexOf(p[0]) >= 0; })[0];
      if (sl && subIn(u, x.s, sl[0], sl[1])) return true;
      return cutExact(S, x.i, x.s);
    }
    if (x.k === 'l') {
      /* 場面の主な場所（山場までに場所の語がいちばん多く出る場所）。少ないほうの場所の文を直す */
      var D = S.domPlace || (S.domPlace = domPlace(S));
      var mv = T.MOVE && T.MOVE[x.to];
      var canMove = mv && !S.moved && x.i < S.units.length && !(S.units[x.i - 1] && S.units[x.i - 1].flow === 'move');
      var addMove = function () { S.moved = true; S.units.splice(x.i, 0, flowUnit(pickFrom(S.R, fitPlace(mv, x.to), S.usedText), 'move')); return true; };
      if (x.to === D && x.from !== D) {
        /* 主な場所へ戻る：場面の始まりが別の場所なら移る段を入れる。途中に挟まった別の場所の文なら、その文を外す */
        if (x.first && canMove) return addMove();
        if (x.from0 && x.fromI != null && cutExact(S, x.fromI, x.from0)) return true;
        if (canMove) return addMove();
      }
      /* 寝床の語 → その場面の語（ソファ・床） */
      var ls = x.to === 'bed' && SUB.l[x.from] ? SUB.l[x.from].filter(function (p) { return x.s.indexOf(p[0]) >= 0; })[0] : null;
      if (ls && subIn(u, x.s, ls[0], ls[1])) return true;
      if (cutExact(S, x.i, x.s)) return true;
      if (canMove) return addMove();
      return false;
    }
    return cutExact(S, x.i, x.s);
  }
  /* 一つの食い違いを直す。直せたら true */
  function fixOne(S, x) {
    var units = S.units, mode = S.mode, R = S.R, T = TX(), u = units[x.i];
    if (/^[i-n]$/.test(x.k)) return fixWalk(S, x);
    if (x.k === 'a') {
      var pt = partOf(S.parts, u, x.re);
      if (pt) {
        cutPart(units, pt.t);
        S.parts.splice(S.parts.indexOf(pt), 1);
        /* 夜の性格の部品は、まだ出ていなければ挿入の前へ移す（出ていれば外すだけ） */
        if (x.why.indexOf('山場') < 0 && !S.roleSeen(pt.role, pt.t)) {
          var at = S.firstInsert();
          if (at >= 0) { units.splice(at, 0, { paras: [pt.t], moved: true }); S.parts.push(pt); }
        }
        return true;
      }
      var tgt = x.why.indexOf('山場') >= 0 ? S.firstClimax() : S.firstInsert();
      /* エッチの型が組み替えた段（u.keep）は外さないが、挿入の前へ移すのはよい */
      if ((u.keep || !isCore(units, x.i, mode)) && tgt >= 0 && tgt < x.i) { units.splice(x.i, 1); units.splice(tgt, 0, u); u.moved = true; delete u.f; return true; }
      if (cutSentence(u, x.re)) return true;
      if (!isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
      return false;
    }
    if (x.k === 'h') {
      if (x.re && cutSentence(u, x.re)) return true;
      var ph = partOf(S.parts, u);
      if (ph && !u.keep) { cutPart(units, ph.t); S.parts.splice(S.parts.indexOf(ph), 1); return true; }
      if (!isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
      return false;
    }
    /* 型の体位のあと（山場まで）は、つなぎの段で別の体位へ戻さず、その言い回しの一文か部品を外す */
    if (x.k === 'b' && S.lock && S.posIdx >= 0 && x.i > S.posIdx && !S.climaxBefore(x.i)) {
      var lp = partOf(S.parts, u);
      if (cutSentence(u, new RegExp(x.s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))) return true;
      if (lp && !u.keep) { cutPart(units, lp.t); S.parts.splice(S.parts.indexOf(lp), 1); return true; }
      if (!isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
    }
    if (x.k === 'b') {
      var l = (T.BRIDGE && T.BRIDGE[x.to] && T.BRIDGE[x.to][mode]) || null;
      if (l && !(units[x.i - 1] && units[x.i - 1].flow === 'bridge')) {
        var cand = l;
        if (mode === 'fm' && noM(S.b)) cand = l.filter(function (s) { return !NOM.test(s); });
        units.splice(x.i, 0, flowUnit(pickFrom(R, fitCand(S, x.i, cand.length ? cand : l), S.usedText), 'bridge'));
        return true;
      }
      /* つなぎの段が無い体位（女性の攻め×男性で受けが上 など）：その言い回しの一文を外す */
      if (cutSentence(u, new RegExp(x.s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))) return true;
      if (!isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
      return false;
    }
    if (x.k === 'c') {
      var first = units[x.first], pf = first && partOf(S.parts, first, x.motion ? MOTION[x.motion.k] : null), pl = partOf(S.parts, u, x.motion ? MOTION[x.motion.k] : null);
      /* 飾りの部品（夜の性格・夜の主導・能動性の型・攻めの一言）なら、部品ごと外す（後ろの部品から。後ろが本体の段なら前の部品） */
      if (pl) { cutPart(units, pl.t); S.parts.splice(S.parts.indexOf(pl), 1); return true; }
      if (pf && !(x.line && first.paras.join('').indexOf(x.line.raw) < 0)) { cutPart(units, pf.t); S.parts.splice(S.parts.indexOf(pf), 1); return true; }
      if (x.line && cutLine(u, x.line.raw)) return true;
      if (x.motion) {
        var mre = MOTION[x.motion.k], keep = function (uu) { return sentences(narrOf(uu.paras.join(''))).some(function (z) { return mre.test(z) && (RE.insert.test(z) || hasClimax(z)); }); };
        if (!keep(u) && cutSentence(u, mre)) return true;
        if (first && !keep(first) && cutSentence(first, mre)) return true;
        if (!keep(u) && !isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
        if (first && !keep(first) && !isCore(units, x.first, mode)) { units.splice(x.first, 1); return true; }
        return false;
      }
      if (!isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
      return false;
    }
    if (x.k === 'd') {
      var prev = units[x.i - 1], dm = prev && prev.f && prev.f.demands.length ? prev.f.demands[prev.f.demands.length - 1] : null;
      var kind = dm ? dm.kind : 'say', ps = psOf(S.b), RT = T.REACT && T.REACT[kind] ? T.REACT[kind] : null;
      if (!RT) return false;
      var lst = RT[ps] || RT.gentle;
      if (S.posture === 'rear') { var nf = lst.filter(function (s) { return !FACE.test(s); }); if (nf.length) lst = nf; }
      /* 声を求められたのか、顔・目を求められたのかで合うほうを */
      if (kind === 'show' && dm) { var wv = /声/.test(dm.s), lk = /顔|目|見/.test(dm.s), nf3 = lst.filter(function (s) { var r0 = s.split('」').slice(-2).join(''); return wv ? /声/.test(s) && !/顔を上げ|目を開|見つめ/.test(s.split('{b}「')[0]) : lk ? /顔|目|見/.test(s.split('{b}「')[0] + s.split('」').pop()) : true; }); if (nf3.length) lst = nf3; }
      var ph = S.insertBefore(x.i) || mode === 'ff' && S.foreBefore(x.i) ? 'post' : 'pre';
      var tl = T.TAIL && T.TAIL[mode] ? T.TAIL[mode][ph] : [];
      if (mode === 'fm' && noM(S.b)) tl = tl.filter(function (s) { return !NOM.test(s); });
      units.splice(x.i, 0, flowUnit(pickFrom(R, fitCand(S, x.i, lst), S.usedText) + (tl.length ? pickFrom(R, fitCand(S, x.i, tl), S.usedText) : ''), 'react'));
      return true;
    }
    if (x.k === 'e') {
      /* 山場が口・手だけのとき（繋がっていない）だけ、繋がる前の追い上げ */
      var pre = mode !== 'ff' && !S.insertBefore(x.i) && RE.oralOnly.test(narrOf(u.paras.join('')));
      var bl = pre ? T.BUILD_PRE && T.BUILD_PRE[mode] : T.BUILD && T.BUILD[mode];
      if (!bl) return false;
      var c2 = bl;
      if (mode === 'fm' && noM(S.b)) c2 = c2.filter(function (s) { return !NOM.test(s); });
      if (S.posture === 'rear') { var nf2 = c2.filter(function (s) { return !FACE.test(s); }); if (nf2.length) c2 = nf2; }
      if (!c2.length) c2 = bl;
      /* 追い上げの段は一つの山場の前に二つまで */
      var nb = 0; for (var q = x.i - 1; q >= 0 && units[q].flow; q--) if (units[q].flow === 'build') nb++;
      if (nb >= 2) return false;
      units.splice(x.i, 0, flowUnit(pickFrom(R, fitCand(S, x.i, c2), S.usedText), 'build'));
      return true;
    }
    return false;
  }
  /* 似た役割の重ね・段数の上限 */
  function capUnits(S) {
    var units = S.units, mode = S.mode, cap = S.thick ? CAP.thick : CAP.std, changed = false;
    /* 夜の性格の部品・夜の主導の部品は一回まで（能動性の型の主導の段は、夜の主導の段があれば外す） */
    var seen = {};
    S.parts.slice().forEach(function (p) {
      var role = p.role === 'ini-lead' ? 'lead' : p.role;
      if (role !== 'night' && role !== 'lead') return;
      var pn = narrOf(p.t);
      if (RE.insert.test(pn) || RE.inside.test(pn) || hasClimax(pn)) return;
      var present = units.some(function (u) { return u.paras.join('\n\n').indexOf(p.t) >= 0; });
      if (!present) return;
      if (seen[role]) { cutPart(units, p.t); S.parts.splice(S.parts.indexOf(p), 1); changed = true; }
      else seen[role] = 1;
    });
    /* 焦らしは一回まで（厚くは二回まで）。本体の段（挿入・山場）は外さない */
    var nt = 0, tmax = S.thick ? 2 : 1;
    for (var i = 0; i < units.length; i++) {
      var f = units[i].f || (units[i].f = feat(units[i], mode));
      if (!f.tease) continue;
      if (++nt > tmax) {
        var pt = partOf(S.parts, units[i], RE.tease), ok2 = false;
        if (pt && !isCore(units, i, mode)) ok2 = cutPart(units, pt.t);
        if (!ok2) ok2 = cutSentence(units[i], RE.tease);
        if (!ok2 && !isCore(units, i, mode)) { units.splice(i, 1); ok2 = true; }
        if (ok2) { changed = true; i--; nt--; }
      }
    }
    /* 段階ごとの段数（つなぎ・リアクション・追い上げの段は、その前の段と組なので数えない） */
    var ck = F.check(units, mode), cnt = {}, idx = {};
    ck.stages.forEach(function (sg, i2) { if (sg === 'flow' || units[i2].keep) return; cnt[sg] = (cnt[sg] || 0) + 1; (idx[sg] = idx[sg] || []).push(i2); });
    var drop = [];
    Object.keys(cap).forEach(function (sg) {
      var over = (cnt[sg] || 0) - cap[sg];
      if (over <= 0) return;
      /* 外す候補：本体の段でないもの。差し込まれた部品の段を先に、そのあと後ろから */
      var cands = (idx[sg] || []).filter(function (i3) {
        var uf = units[i3].f || {};
        if (isCore(units, i3, mode) || units[i3].flow || units[i3].keep || uf.insert || uf.inside || uf.climax) return false;
        /* 差し込まれた部品の段か、繋がったあとの最中の段だけを外す（段階の読み取りが外れても本筋の段を落とさない） */
        if (partMostly(S.parts, units[i3])) return true;
        /* 本筋の最中の段は、台詞の無い地の文だけの段で、山場のすぐ前でないものだけ */
        var nx = units[i3 + 1], nxf = nx && (nx.f || (nx.f = feat(nx, mode)));
        return sg === 'play' && ck.st.insert && !uf.lines.length && !(nxf && nxf.climax);
      });
      cands.sort(function (x, y) { var px = partMostly(S.parts, units[x]) ? 0 : 1, py = partMostly(S.parts, units[y]) ? 0 : 1; return px - py || y - x; });
      drop = drop.concat(cands.slice(0, over));
    });
    if (drop.length) {
      drop.sort(function (x, y) { return y - x; }).forEach(function (i4) {
        /* 外す段のすぐ後ろのリアクション・つなぎの段も一緒に */
        var n = 1; while (units[i4 + n] && units[i4 + n].flow === 'react') n++;
        units.splice(i4, n);
      });
      changed = true;
    }
    return changed;
  }
  /* 場面を直す。text：本文、info：{ a, b, mode, after, thick, parts } */
  F.fix = function (text, info) {
    var a = info.a, b = info.b, mode = info.mode || 'mf';
    var hadPh = /\{[ab]\}/.test(text);
    var t = normNames(text, a, b), af = info.after ? normNames(info.after, a, b) : '';
    var sp = F.split(t, af);
    var S = {
      units: sp.units, mode: mode, a: a, b: b, thick: !!info.thick, usedText: {}, play: info.play || null, lock: info.play && info.play.lock || null, posIdx: -1,
      parts: (info.parts || []).map(function (p) { return { role: p.role, t: normNames(p.t, a, b) }; }).filter(function (p) { return p.t && p.t.length >= 8; }),
      R: rngOf(hashOf((a && a.name) + '|' + (b && b.name) + '|' + t.length + '|' + t.slice(0, 60)))
    };
    S.firstInsert = function () { for (var i = 0; i < S.units.length; i++) { var f = S.units[i].f || (S.units[i].f = feat(S.units[i], mode)); if (f.insert || f.inside || f.climax) return i; } return -1; };
    S.firstClimax = function () { for (var i = 0; i < S.units.length; i++) { var f = S.units[i].f || (S.units[i].f = feat(S.units[i], mode)); if (f.climax) return i; } return -1; };
    S.insertBefore = function (i) { for (var j = 0; j < i && j < S.units.length; j++) { var f = S.units[j].f || (S.units[j].f = feat(S.units[j], mode)); if (f.insert || f.inside) return true; } return false; };
    S.foreBefore = function (i) { for (var j = 0; j < i && j < S.units.length; j++) { var f = S.units[j].f || (S.units[j].f = feat(S.units[j], mode)); if (f.fore) return true; } return false; };
    S.roleSeen = function (role, except) { return S.units.some(function (u) { var tt = u.paras.join('\n\n'); return S.parts.some(function (p) { return p.role === role && p.t !== except && tt.indexOf(p.t) >= 0; }); }); };
    /* エッチの型（play-r18.js）が組み替えた段は守る（外さない・段数に数えない） */
    var keepL = (info.keep || []).map(function (k) { return normNames(k, a, b); });
    var markKeep = function () { S.units.forEach(function (u) { var tt = u.paras.join('\n\n'); u.keep = keepL.some(function (k) { return tt.indexOf(k) >= 0; }); }); };
    if (keepL.length) markKeep();
    S.climaxBefore = function (i) { for (var j = 0; j < i && j < S.units.length; j++) { var f = S.units[j].f || (S.units[j].f = feat(S.units[j], mode)); if (f.climax) return true; } return false; };
    S.ext = extOf(a, b, sp.tail, mode); S.tailU = S.ext.tail;
    var before = F.check(S.units, mode, S.play, S.ext), n0 = S.units.length, fixed = 0;
    var capped = capUnits(S);
    if (!before.v.length && !capped && !keepL.length && !(info.press && F.starter(S.units[0] ? S.units[0].paras.join('') : '') === 'b')) return { text: text, changed: false, before: before.v.length };
    var TR = F.trace ? [] : null;
    var runLoop = function (lim) {
    for (var it = 0; it < lim; it++) {
      if (keepL.length) markKeep();
      var ck = F.check(S.units, mode, S.play, S.ext);
      S.posIdx = ck.posIdx;
      if (!ck.v.length) break;
      S.posture = ck.st.posture;
      var done = false;
      for (var q = 0; q < ck.v.length && !done; q++) {
        /* 体位は、直す段の前の体位で選ぶ */
        var x = ck.v[q];
        S.posture = x.from || null;
        done = fixOne(S, x);
        if (TR) TR.push(x.k + (done ? '✓' : '✗') + ' ' + String(x.why).slice(0, 80));
      }
      if (!done) break;
      fixed++;
      if (it === 30) capUnits(S);
    }
    };
    runLoop(60);
    /* きっかけが攻めの主導を決める夜：受けから始める部品（夜の主導・能動性の型の主導の段）は外す */
    if (info.press) S.parts.slice().forEach(function (p) { if ((p.role === 'lead' || p.role === 'ini-lead') && cutPart(S.units, p.t)) S.parts.splice(S.parts.indexOf(p), 1); });
    /* きっかけが攻めの主導を決める夜（嫉妬・強引・愛憎・攻めのサド／意地悪）に、頭の段で受けが先に手を出していたら、攻めが迫る段を頭に置く */
    if (info.press && S.units.length && F.starter(S.units[0].paras.join('')) === 'b') {
      var PR = TX().PRESS, pl0 = PR && (PR[info.press] || PR.rough);
      /* 場面の場所（最初に出る場所の語）と違う場所の文は選ばない（2026-11-04） */
      var pl1 = null; S.units.some(function (u) { var q0 = placeOf(narrOf(u.paras.join(''))); if (q0.length) { pl1 = q0[0].k; return true; } return false; });
      var prc = pl0 && pl0[mode] ? pl0[mode].filter(function (x) { return placeOf(narrOf(x)).every(function (q1) { return !pl1 || q1.k === pl1; }); }) : [];
      if (pl0 && pl0[mode]) { S.units.unshift(flowUnit(pickFrom(S.R, prc.length ? prc : pl0[mode], S.usedText), 'press')); fixed++; runLoop(30); }
    }
    /* 段を外したり動かしたりして、指を入れた段落のすぐ次が挿入になったら、指を抜く一文を足す（thick-sex.js の T.fingerOut と同じ文） */
    var ps = [].concat.apply([], S.units.map(function (u) { return u.paras; }));
    for (var pi = 0; pi < ps.length - 1; pi++) {
      var mk2 = function (x) { return narrOf(x).replace(/\{(?![ab]\})[^{}]{1,6}\}/g, '〇〇'); };
      var n0 = mk2(ps[pi]);
      /* 髪・頬などに指を差し入れる文は数えない（指を入れていないのに「指を抜く」一文が付いていた。2026-11-04） */
      var n0h = n0.replace(/髪に指[^。]*/g, '');
      if (!(FIN.test(n0h) || ST2.fin.test(n0h)) || FOUT.test(n0)) continue;
      var nj = pi + 1; while (nj < ps.length && speechPara(ps[nj])) nj++;
      if (nj >= ps.length) break;
      var n1 = mk2(ps[nj]);
      if (!INS2.test(n1) || FOUT.test(n1)) continue;
      var FO = HK.ThickSex && HK.ThickSex.FINGER_OUT, fl = FO ? FO[info.ero ? 'ero' : 'novel'] : ['{a}は濡れた指を、ゆっくりと引き抜いた。'];
      ps[pi] = ps[pi] + fl[n0.length % fl.length];
    }
    if (TR) TR.push('END ' + F.check(S.units, mode, S.play, S.ext).v.map(function (x) { return x.k + ':' + String(x.why).slice(0, 60); }).join(' / '));
    var out = ps.concat(S.tailU ? S.tailU.paras : sp.tail).join('\n\n');
    if (!hadPh) out = out.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
    if (F.log) F.log.push({ a: a.name, b: b.name, mode: mode, before: before.v.length, after: F.check(S.units, mode, S.play, S.ext).v.length, units0: n0, units1: S.units.length });
    /* 直したあとの本文を段に分け直して（点検と同じ見方で）もう一度見る。段の切れ目が変わって残った食い違いがあれば、もう一回だけ直す */
    if (!(info._depth >= 2)) {
      var ck2 = F.check(F.split(normNames(out, a, b), af).units, mode, S.play, extOf(a, b, F.split(normNames(out, a, b), af).tail, mode));
      if (ck2.v.length) {
        var fx2 = F.fix(out, Object.assign({}, info, { _depth: (info._depth || 0) + 1 }));
        if (fx2.changed) return { text: fx2.text, changed: true, before: before.v.length, trace: TR && fx2.trace ? TR.concat(['── もう一回'], fx2.trace) : TR };
      }
    }
    return { text: out, changed: true, before: before.v.length, trace: TR };
  };

  /* ---------- 夜の主導は傾向（その夜に受けから始めるか） ---------- */
  var FORCE_TOP = /^(sadist|mean)$/;
  /* 攻めが迫るきっかけ：'jealous'（嫉妬）・'rough'（強引・愛憎・攻めのサド／意地悪）・''。受けが攻め指定の組（向きの決まらない組）は '' */
  F.pressOf = function (T, U, opt) {
    opt = opt || {};
    if (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(U, T)) return '';
    if (opt.jealous) return 'jealous';
    if (opt.force || opt.hate || opt.rel === 'hate' || opt.rel === 'enemy') return 'rough';
    var kd = HK.Attr && HK.Attr.nightKind ? HK.Attr.nightKind(T, U) : '';
    return FORCE_TOP.test(kd || '') ? 'rough' : '';
  };
  /* opt：場面の呼び出しの opt。戻り値：受けの夜の主導（'sasoi'｜'osoi'）のまま→その値、今夜は受けから始めない→''、決めていない→null（差し替えない） */
  F.leadTonight = function (T, U, opt) {
    var P = HK.Pos, lo = P && P.leadOf;
    F.lastWhy = '';
    if (!lo || HK.SAFE_ON || F.off) return null;
    var base = lo(U);
    if (base !== 'sasoi' && base !== 'osoi') return null;
    opt = opt || {};
    var why = '';
    /* きっかけが主導を決める：攻めの嫉妬・強引・愛憎・攻めのサド／意地悪の夜は攻めから */
    var kd = HK.Attr && HK.Attr.nightKind ? HK.Attr.nightKind(T, U) : '';
    if (opt.jealous) why = 'jealous';
    else if (opt.force) why = 'force';
    else if (opt.hate || opt.rel === 'hate' || opt.rel === 'enemy') why = 'hate';
    else if (FORCE_TOP.test(kd || '')) why = 'topNight';
    if (why) { F.lastWhy = why; return ''; }
    /* 受けの側のきっかけ（呼ぶ側が opt.leadB を渡す） */
    if (opt.leadB) { F.lastWhy = 'leadB'; return base; }
    var p = 0.55, lib = P.libOf ? P.libOf(U) : '';
    if (lib === 'high') p += 0.1; else if (lib === 'low') p -= 0.15;
    var ps = psOf(U);
    if (/^(free|proud|devoted)$/.test(ps)) p += 0.05; else if (/^(shy|stern)$/.test(ps)) p -= 0.05;
    var memo = F.memo || (F.memo = {}), k = U.name || '', m = memo[k] || (memo[k] = { n: 0, last: null });
    if (m.last === true) p -= 0.2;
    var r = rngOf(hashOf(k + '|' + (T && T.name) + '|' + m.n + '|' + (F.seed || 0)))();
    m.n++;
    var on = r < p;
    m.last = on;
    F.lastWhy = on ? 'tendency' : 'notTonight';
    return on ? base : '';
  };

  /* ---------- 組み立ての包み ---------- */
  function modeOf(r, a, b) { if (r && /^(mf|ff|fm)$/.test(r.mode)) return r.mode; var P = HK.Pos, fem = P && P.isF; return fem && fem(a) && fem(b) ? 'ff' : fem && fem(a) ? 'fm' : 'mf'; }
  function thickOf(opt) { var S = opt.ctx || opt.S, env = S && (S.env || (S.S && S.S.env)); return !!(env && env.lewdLen === 'thick'); }
  /* ---------- 相手がモブの場面の呼びかけ（2026-11-05。電車の報告 3 の直しを本体へ） ----------
     モブ（HK.Mob で作った人・箱庭の乗客や客。c.mob）は住人の名前を知らない。共通の台詞は相手を {a}／{b} の名前で呼ぶので、
     住人が話し手でない台詞の中の住人の名前（印 tok と名前 rn）は、話し手の二人称（あなた。口調の辞書が言い換える）に、台詞の頭の呼びかけ（「ミナト、……」）は外す。
     地の文の「名前を呼んだ」は「囁いた」に（モブの名前も住人は知らない）。住人が話し手の台詞（「＠住人＠」・住人が主語の文の台詞・「{b}「…」」）は変えない */
  function escR(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  F.mobName = function (t, rn, tok) {
    if (!t || !rn) return t;
    var keys = [tok, rn].filter(Boolean), kre = keys.map(escR).join('|');
    var self = new RegExp('(?:^|[。」\\n])[\\s　]*(?:' + kre + ')(?:$|[はがも、]|「$)'), selfQ = new RegExp('^＠(?:' + kre + ')＠');
    var inQ = new RegExp('(' + kre + ')(?:さん|くん|ちゃん|様)?([、,…‥]*)', 'g');
    t = String(t).replace(/([^。」\n]*)「([^」]*)」/g, function (all, pre, q) {
      if (!keys.some(function (k) { return q.indexOf(k) >= 0; })) return all;
      if (selfQ.test(q) || self.test(pre) || new RegExp('(?:' + kre + ')$').test(pre)) return all;
      var mk = /^＠[^＠]*＠/.exec(q), head = mk ? mk[0] : '', body = q.slice(head.length);
      body = body.replace(inQ, function (w, nm, pun, i) { return i === 0 || /^[…‥\s　]*$/.test(body.slice(0, i)) ? '' : 'あなた' + pun; });
      return pre + '「' + head + body + '」';
    });
    return t.replace(/名前を呼ぼうとして/g, '何か言おうとして').replace(/私の名前を[、]?呼んで/g, 'もっと声を聞かせて').replace(/名前で呼んで/g, '声を聞かせて').replace(/名前をひとつ呼んだ/g, '短く囁いた').replace(/名前をもう一度呼んだ/g, 'もう一度囁いた').replace(/名前を呼んだ/g, '囁いた').replace(/名前を呼ばれ/g, '囁かれ').replace(/名前を呼ぶ/g, '囁く').replace(/名前を呼び/g, '囁き');
  };
  /* 場面のあいだだけ関数を差し替えて、差し込まれた部品を覚える */
  function tap(obj, key, fn) { if (!obj || typeof obj[key] !== 'function') return null; var f0 = obj[key]; obj[key] = fn(f0); return function () { obj[key] = f0; }; }
  function makeWrap(sc0, obj) {
    var f = function (opt) {
      /* 場所（opt.spot。sex-spot-r18.js の HK.SexSpot）：場面のあいだだけ候補を絞り、組み立てたあとに残った言い回しを直す */
      var SPK = HK.SexSpot, spot = SPK && !HK.SAFE_ON && opt ? SPK.of(opt) : '';
      var rs0;
      if (spot && !F.cur) {
        var sp0 = SPK.cur, o2 = {};
        Object.keys(opt).forEach(function (k) { o2[k] = opt[k]; });
        o2.pick = SPK.pick(opt.pick, spot);
        SPK.cur = spot;
        try { rs0 = f0.call(this, o2); if (rs0 && typeof rs0.text === 'string') rs0.text = SPK.fix(rs0.text, spot); } finally { SPK.cur = sp0; }
      } else rs0 = f0.apply(this, arguments);
      /* 相手がモブ（見知らぬ乗客・施術師・客など）：モブは住人の名前を知らないので、台詞の中の住人の名前は二人称に（F.mobName） */
      if (rs0 && typeof rs0.text === 'string' && opt && opt.a && opt.b && !opt.a.mob !== !opt.b.mob && !HK.SAFE_ON) {
        var res = opt.a.mob ? opt.b : opt.a;
        rs0.text = F.mobName(rs0.text, res.name, opt.a.mob ? '{b}' : '{a}');
      }
      return rs0;
    };
    var f0 = function (opt) {
      if (F.off || F.cur || HK.SAFE_ON || !opt || !opt.a || !opt.b) return sc0.apply(this, arguments);
      var a = opt.a, b = opt.b, parts = [], undo = [], P = HK.Pos, self = this;
      var lt = F.leadTonight(a, b, opt), whyL = F.lastWhy;
      var st = F.cur = { a: a, b: b, parts: parts, lead: lt, why: whyL };
      if (opt.ctx && typeof opt.ctx === 'object') opt.ctx._flow = st;
      var push = function (role) { return function (s) { if (typeof s === 'string' && s) parts.push({ role: role, t: s }); return s; }; };
      try {
        if (lt != null && P) undo.push(tap(P, 'leadOf', function (f0) { return function (c) { return c === b ? lt : f0.apply(this, arguments); }; }));
        undo.push(tap(HK.Attr, 'nightText', function (f0) { var rec = push('night'); return function () { return rec(f0.apply(this, arguments)); }; }));
        undo.push(tap(HK.PosLead, 'text', function (f0) { var rec = push('lead'); return function () { return rec(f0.apply(this, arguments)); }; }));
        undo.push(tap(HK.EroTop, 'say', function (f0) { var rec = push('tsay'); return function () { return rec(f0.apply(this, arguments)); }; }));
        undo.push(tap(HK.Initiative, 'apply', function (f0) {
          return function (text) {
            var r0 = f0.apply(this, arguments);
            if (typeof r0 === 'string' && typeof text === 'string') {
              var old = {}; text.split(/\n\n+/).forEach(function (p) { old[p] = 1; });
              var seenIns = false;
              r0.split(/\n\n+/).forEach(function (p, pi) {
                if (old[p]) { if (RE.insert.test(narrOf(p))) seenIns = true; return; }
                var pn = narrOf(p);
                parts.push({ role: !seenIns && pi <= 3 && F.starter(p) === 'b' && !RE.insert.test(pn) && !RE.inside.test(pn) ? 'ini-lead' : 'ini', t: p });
              });
            }
            return r0;
          };
        }));
        var r = sc0.apply(self, arguments);
        if (!r || typeof r.text !== 'string') return r;
        if (HK.SexSpot && HK.SexSpot.cur) r.text = HK.SexSpot.fix(r.text, HK.SexSpot.cur);
        var pressK = F.pressOf(a, b, opt), md = modeOf(r, a, b);
        /* エッチの型（play-r18.js の HK.Play）：入り方・主な責め・道具・体位・終わり方に沿って本文を組み替え、性格が目立つ行為の段を足す */
        var pl = null;
        if (HK.Play && HK.Play.apply) { try { pl = HK.Play.apply(r.text, { a: a, b: b, mode: md, opt: opt, ero: obj === HK.ThickEro, parts: parts, press: pressK, lead: lt }); } catch (e) { pl = null; if (F.log) F.log.push({ err: String(e) }); } }
        if (pl && pl.act) parts.push({ role: 'act', t: pl.act });
        var t1 = pl ? pl.text : r.text;
        if (HK.SexSpot && HK.SexSpot.cur) t1 = HK.SexSpot.fix(t1, HK.SexSpot.cur);
        var fx = F.fix(t1, { a: a, b: b, mode: md, after: opt.after || '', thick: thickOf(opt), parts: parts, press: pressK, ero: obj === HK.ThickEro, play: pl && pl.play, keep: pl && pl.keep });
        r.text = fx.changed ? fx.text : t1;
        if (fx.trace) r._trace = fx.trace;
        r.flow = { play: pl ? { entry: pl.play.entry, focus: pl.play.focus, prop: pl.play.prop, pos: pl.play.pos, finish: pl.play.finish, scene: pl.play.scene || '', posT: pl.play.posT, lock: pl.play.lock, act: pl.play.act || '' } : null, lead: lt, why: whyL, parts: parts.map(function (p) { return p.role; }), partT: parts.filter(function (p) { return p.role === 'lead' || p.role === 'ini-lead'; }).map(function (p) { return { role: p.role, t: p.t }; }) };
        return r;
      } finally {
        undo.forEach(function (u) { if (u) u(); });
        F.cur = null;
        if (opt.ctx && typeof opt.ctx === 'object') opt.ctx._flow = null;
      }
    };
    /* 内側の包みの印を引き継ぐ（ほかのファイルが二度包まないように） */
    Object.keys(sc0).forEach(function (k) { if (k.charAt(0) === '_') f[k] = sc0[k]; });
    f._flowTop = true;
    return f;
  }
  var LAST = 2e9;
  function install() {
    [HK.ThickSex, HK.ThickEro].forEach(function (obj) {
      if (!obj || typeof obj.scene !== 'function' || obj.scene._flowTop) return;
      if (HK.wrap) HK.wrap(obj, 'scene', function (sc0) { return typeof sc0 === 'function' ? makeWrap(sc0, obj) : sc0; }, LAST);
      else obj.scene = makeWrap(obj.scene, obj);
    });
  }
  F.install = install;
  /* 包むのは毎回のシミュレーションの直前（ほかの包みが最初のシミュレーションの前に包むので、それより内側の HK.simulate の包みから＝いちばん最後に包む） */
  if (HK.simulate && HK.wrap && !HK.simulate._flow) HK.wrap(HK, 'simulate', function (sim0) {
    var g = function (input) { install(); F.memo = {}; F.seed = (input && input.seed) >>> 0 || 0; return sim0.apply(this, arguments); };
    g._flow = true;
    return g;
  }, 1);
})();
