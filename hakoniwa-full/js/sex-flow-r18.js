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
      bUp: /\{b\}[はが](?:[^。「]{0,30})(?:跨が(?!らせ)|跨っ|跨り|馬乗り|上に乗(?!せ)|上になっ|乗り上げ)|\{b\}を[^。]{0,14}(?:上に乗せ|腰の上(?:へ|に)|跨がらせ)|\{a\}を[^。{]{0,12}(?:押し倒|仰向けに|組み敷)|ride>/,
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
  function flowKind(p) {
    var X = TX();
    if (!FLOWT) {
      FLOWT = { exact: {}, pre: [] };
      var put = function (o, kind) { if (!o) return; Object.keys(o).forEach(function (k) { var v = o[k]; if (Array.isArray(v)) v.forEach(function (x) { FLOWT.exact[x] = kind; }); else put(v, kind); }); };
      put(X.BRIDGE, 'bridge'); put(X.BUILD, 'build'); put(X.BUILD_PRE, 'build'); put(X.PRESS, 'press');
      var pr = function (o) { if (!o) return; Object.keys(o).forEach(function (k) { var v = o[k]; if (Array.isArray(v)) v.forEach(function (x) { FLOWT.pre.push(x); }); else pr(v); }); };
      pr(X.REACT);
      if (!X.BRIDGE) FLOWT = null;
      if (!FLOWT) return '';
    }
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
    if (mode === 'fm') { var re2 = new RegExp(FM_AUP.source, 'g'), m2; while ((m2 = re2.exec(n))) chg.push({ k: 'aUp', i: m2.index + m2[0].length - 0.5 }); }
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
  /* ---------- 状態を進めながら、段ごとの食い違いを数える ---------- */
  var HEAT = { lead: [5, 5], undress: [5, 5], fore: [20, 10], insert: [15, 20], play: [20, 20], climax: [0, 0], flow: [10, 5], build: [25, 25], bridge: [5, 5], react: [10, 5], press: [5, 5] };
  var TH_B = 60, TH_T = 50;
  F.TH = { b: TH_B, t: TH_T };
  /* units：F.split の段（feat 済みでなくてよい）。戻り値：{ v: [{ k: 'a'|'b'|'c'|'d'|'e', i: 段の番号, why, ... }], st: 最後の状態, stages: [段ごとの段階] } */
  F.check = function (units, mode) {
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
    return { v: v, st: st, stages: stages };
  };
  /* 本文を見る（点検用）：{ units, tail, check } */
  F.analyze = function (text, a, b, mode, after) {
    var t = normNames(text, a, b), af = after ? normNames(after, a, b) : '';
    var sp = F.split(t, af);
    sp.check = F.check(sp.units, mode || 'mf');
    return sp;
  };

  /* ---------- 段数の上限（段階ごと。描写の長さ「厚く」は少し多め） ---------- */
  var CAP = F.CAP = {
    std: { lead: 2, undress: 1, fore: 2, insert: 1, play: 3, climax: 2 },
    thick: { lead: 2, undress: 1, fore: 2, insert: 1, play: 4, climax: 2 }
  };

  /* ---------- 直す ---------- */
  function pickFrom(R, arr, used) {
    if (!arr || !arr.length) return '';
    var free = arr.filter(function (x) { return !used[x]; }), l = free.length ? free : arr, s = l[Math.floor(R() * l.length)];
    used[s] = 1;
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
    if (i === 0 || !u.f) return i === 0;
    if (u.f.climax) return true;
    if (u.f.insert || u.f.inside) { for (var j = 0; j < i; j++) if (units[j].f && (units[j].f.insert || units[j].f.inside)) return false; return true; }
    return false;
  }
  /* 一つの食い違いを直す。直せたら true */
  function fixOne(S, x) {
    var units = S.units, mode = S.mode, R = S.R, T = TX(), u = units[x.i];
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
      if (!isCore(units, x.i, mode) && tgt >= 0 && tgt < x.i) { units.splice(x.i, 1); units.splice(tgt, 0, u); u.moved = true; delete u.f; return true; }
      if (cutSentence(u, x.re)) return true;
      if (!isCore(units, x.i, mode)) { units.splice(x.i, 1); return true; }
      return false;
    }
    if (x.k === 'b') {
      var l = (T.BRIDGE && T.BRIDGE[x.to] && T.BRIDGE[x.to][mode]) || null;
      if (l && !(units[x.i - 1] && units[x.i - 1].flow === 'bridge')) {
        var cand = l;
        if (mode === 'fm' && noM(S.b)) cand = l.filter(function (s) { return !NOM.test(s); });
        units.splice(x.i, 0, flowUnit(pickFrom(R, cand.length ? cand : l, S.usedText), 'bridge'));
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
      units.splice(x.i, 0, flowUnit(pickFrom(R, lst, S.usedText) + (tl.length ? pickFrom(R, tl, S.usedText) : ''), 'react'));
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
      units.splice(x.i, 0, flowUnit(pickFrom(R, c2, S.usedText), 'build'));
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
    ck.stages.forEach(function (sg, i2) { if (sg === 'flow') return; cnt[sg] = (cnt[sg] || 0) + 1; (idx[sg] = idx[sg] || []).push(i2); });
    var drop = [];
    Object.keys(cap).forEach(function (sg) {
      var over = (cnt[sg] || 0) - cap[sg];
      if (over <= 0) return;
      /* 外す候補：本体の段でないもの。差し込まれた部品の段を先に、そのあと後ろから */
      var cands = (idx[sg] || []).filter(function (i3) {
        var uf = units[i3].f || {};
        if (isCore(units, i3, mode) || units[i3].flow || uf.insert || uf.inside || uf.climax) return false;
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
      units: sp.units, mode: mode, b: b, thick: !!info.thick, usedText: {},
      parts: (info.parts || []).map(function (p) { return { role: p.role, t: normNames(p.t, a, b) }; }).filter(function (p) { return p.t && p.t.length >= 8; }),
      R: rngOf(hashOf((a && a.name) + '|' + (b && b.name) + '|' + t.length + '|' + t.slice(0, 60)))
    };
    S.firstInsert = function () { for (var i = 0; i < S.units.length; i++) { var f = S.units[i].f || (S.units[i].f = feat(S.units[i], mode)); if (f.insert || f.inside || f.climax) return i; } return -1; };
    S.firstClimax = function () { for (var i = 0; i < S.units.length; i++) { var f = S.units[i].f || (S.units[i].f = feat(S.units[i], mode)); if (f.climax) return i; } return -1; };
    S.insertBefore = function (i) { for (var j = 0; j < i && j < S.units.length; j++) { var f = S.units[j].f || (S.units[j].f = feat(S.units[j], mode)); if (f.insert || f.inside) return true; } return false; };
    S.foreBefore = function (i) { for (var j = 0; j < i && j < S.units.length; j++) { var f = S.units[j].f || (S.units[j].f = feat(S.units[j], mode)); if (f.fore) return true; } return false; };
    S.roleSeen = function (role, except) { return S.units.some(function (u) { var tt = u.paras.join('\n\n'); return S.parts.some(function (p) { return p.role === role && p.t !== except && tt.indexOf(p.t) >= 0; }); }); };
    var before = F.check(S.units, mode), n0 = S.units.length, fixed = 0;
    var capped = capUnits(S);
    if (!before.v.length && !capped && !(info.press && F.starter(S.units[0] ? S.units[0].paras.join('') : '') === 'b')) return { text: text, changed: false, before: before.v.length };
    for (var it = 0; it < 60; it++) {
      var ck = F.check(S.units, mode);
      if (!ck.v.length) break;
      S.posture = ck.st.posture;
      var done = false;
      for (var q = 0; q < ck.v.length && !done; q++) {
        /* 体位は、直す段の前の体位で選ぶ */
        var x = ck.v[q];
        S.posture = x.from || null;
        done = fixOne(S, x);
      }
      if (!done) break;
      fixed++;
      if (it === 30) capUnits(S);
    }
    /* きっかけが攻めの主導を決める夜：受けから始める部品（夜の主導・能動性の型の主導の段）は外す */
    if (info.press) S.parts.slice().forEach(function (p) { if ((p.role === 'lead' || p.role === 'ini-lead') && cutPart(S.units, p.t)) S.parts.splice(S.parts.indexOf(p), 1); });
    /* きっかけが攻めの主導を決める夜（嫉妬・強引・愛憎・攻めのサド／意地悪）に、頭の段で受けが先に手を出していたら、攻めが迫る段を頭に置く */
    if (info.press && S.units.length && F.starter(S.units[0].paras.join('')) === 'b') {
      var PR = TX().PRESS, pl0 = PR && (PR[info.press] || PR.rough);
      if (pl0 && pl0[mode]) { S.units.unshift(flowUnit(pickFrom(S.R, pl0[mode], S.usedText), 'press')); fixed++; }
    }
    /* 段を外したり動かしたりして、指を入れた段落のすぐ次が挿入になったら、指を抜く一文を足す（thick-sex.js の T.fingerOut と同じ文） */
    var ps = [].concat.apply([], S.units.map(function (u) { return u.paras; }));
    for (var pi = 0; pi < ps.length - 1; pi++) {
      var mk2 = function (x) { return narrOf(x).replace(/\{(?![ab]\})[^{}]{1,6}\}/g, '〇〇'); };
      var n0 = mk2(ps[pi]);
      if (!FIN.test(n0) || FOUT.test(n0)) continue;
      var nj = pi + 1; while (nj < ps.length && speechPara(ps[nj])) nj++;
      if (nj >= ps.length) break;
      var n1 = mk2(ps[nj]);
      if (!INS2.test(n1) || FOUT.test(n1)) continue;
      var FO = HK.ThickSex && HK.ThickSex.FINGER_OUT, fl = FO ? FO[info.ero ? 'ero' : 'novel'] : ['{a}は濡れた指を、ゆっくりと引き抜いた。'];
      ps[pi] = ps[pi] + fl[n0.length % fl.length];
    }
    var out = ps.concat(sp.tail).join('\n\n');
    if (!hadPh) out = out.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
    if (F.log) F.log.push({ a: a.name, b: b.name, mode: mode, before: before.v.length, after: F.check(S.units, mode).v.length, units0: n0, units1: S.units.length });
    return { text: out, changed: true, before: before.v.length };
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
  /* 場面のあいだだけ関数を差し替えて、差し込まれた部品を覚える */
  function tap(obj, key, fn) { if (!obj || typeof obj[key] !== 'function') return null; var f0 = obj[key]; obj[key] = fn(f0); return function () { obj[key] = f0; }; }
  function makeWrap(sc0, obj) {
    var f = function (opt) {
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
        var pressK = F.pressOf(a, b, opt);
        var fx = F.fix(r.text, { a: a, b: b, mode: modeOf(r, a, b), after: opt.after || '', thick: thickOf(opt), parts: parts, press: pressK, ero: obj === HK.ThickEro });
        if (fx.changed) r.text = fx.text;
        r.flow = { lead: lt, why: whyL, parts: parts.map(function (p) { return p.role; }), partT: parts.filter(function (p) { return p.role === 'lead' || p.role === 'ini-lead'; }).map(function (p) { return { role: p.role, t: p.t }; }) };
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
