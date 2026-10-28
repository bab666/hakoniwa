/* 箱庭シミュレーター: 媚薬ロッカー（R18版のみ）― 主従の「命令」・家族の「立場」・恋人の照れの型（HK.TieOrder）をつなぐ（2026-10-28 担当LJ）
   tie-order-r18.js（HK.TieOrder）を、locker-tie-more-r18.js のつなぎ口（LK.TIES2_R18.hesHook／introHook）と、solo-locker.js の扉が開いたあとに差し込む。
   ■ 二人の夜の型は locker-tie-more-r18.js と同じ（LK.TIES2_R18.groupOf：関係の強い順で最初に型に入る関係）
     master（主従）：扉が開いてベッドへ行く前に、主の命令の型を決める（LK.bedGate。solo-locker.js が呼ぶ）。
       合意（従の反応 mutual／cling／obey／defy／cond／free）→ ベッドの誘いの段を、主の命令とその反応（scene の open）に差し替え（LK.bed の o.lead）、
         ためらいの段は命令のあとの一文（BRIDGE）に。山場は既存の LK.bed のまま。事後の段の終わりに命令の結び（scene の after）。
         主が攻めなら「命令だ、私に抱かれろ」（take）、従が攻めなら「私を抱け」（give）。ベッドの攻め（HK.Pos.order）に合わせる
       通らない（refuse 対等に近い主従が笑って断る／decline 従が望まず主が引く／rebuff 仲が険悪で撥ねつける。物語型なので rebel は rebuff）
         → その場面だけを書いて、ベッドへ行かない（solo-locker.js の「起きない」流れ）
       命令でねじ伏せる（obeyF など。内容のスイッチ「合意のない展開」が入・HK.Pos.forceOn・HK.Pos.okForce・主が攻めに回れる組・従が主を想っていない組）
         → ベッドの代わりに HK.TieOrder.forceBody の一場面（理由に HK.Pos.FORCE_MARK）
       ロッカーの中で繋がったとき（LK.TIES2.r18Act）：主の命令の短い一言を一度だけ（IN_CMD。主が攻め／受けで書き分け、態度9種）
       solo-locker.js の「主の許し」（SV.order）とは同じ回に重ねない（pair.svOrd が立っていれば命令の型を出さず、命令の型を出したら pair.toOrd で主の許しを止める）
     fam（家族。「恋愛：あり」の組だけ＝HK.TieOrder.famOk）：立場の型。push（上が立場で押す）／plead（下が家族を持ち出してねだる）→ 戸惑いつつ受け入れる（誘いの段に）。
       deny（片方だけが想っている）→ 想われた側が家族の暮らしを理由に拒み、その夜は起きない
     love（恋人・夫婦・許嫁・番・運命の番）：locker-tie-more-r18.js の照れの一言（ためらいの段）はそのままに、
       導入の段に HK.TieOrder.react(…,'auto') の一言を一本足す（照れの一言と別の人が話す。照れの一言と同じ言葉＝カメラ／恥ずかしいが重なれば、もう一方の向き（cam⇔shy）に。それでも重なれば足さない）
   ■ 惹かれ（opt.fond）と好意（opt.aff）：ロッカーには数値の好意がないので、ロッカーの中の値から作る。
     惹かれ＝体の熱（発情・応じた回数・仕掛けた回数・嗜めた回数。最大 40）＋関係（恋人・番・友達以上・セフレ、想う側の片想い・本命・信仰・盲信・執着・慕う：+35、仲 良い +10／険悪 -25）
     好意＝40＋関係（同じ）。発情が限界（85 以上）の人は、夜に乗れる（opt.willing）
   ■ 乱数は S.rng。起きるかどうかは peek（乱数を使わない）で見てから、本番の plan を引く
   ■ 文の決まり：台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。登場人物はすべて成人として扱う。全年齢版にはこのファイルはない */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=locker id=lk_to_master cat=夜 tie=master tags=night label=主の命令で始まる夜（抱け・抱かれろ） */
/* @event scen=locker id=lk_to_master_no cat=conflict tie=master label=主の命令が通らない（断る・撥ねつける） */
/* @event scen=locker id=lk_to_master_force cat=夜 tie=master tags=night,force label=主が命令で従の抵抗をねじ伏せる */
/* @event scen=locker id=lk_to_master_in cat=夜 tie=master tags=night label=ロッカーの中で主が命じる一言 */
/* @event scen=locker id=lk_to_fam cat=夜 tie=sibling,sibprot,sibclose,sibbad,relative,parent,pparent tags=night label=家族の立場で押す・ねだる夜 */
/* @event scen=locker id=lk_to_fam_deny cat=conflict tie=sibling,sibprot,sibclose,sibbad,relative,parent,pparent label=家族の一線を越えようとして拒まれる */
/* @event scen=locker id=lk_to_love cat=夜 tie=lover,fiance,mate,fated tags=night label=恋人が場所に照れる・警戒する一言 */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, ST = HK.Story;
  if (!LK || !LK.bed || !LK.TIES2 || !LK.TIES2_R18 || !ST) return;
  var R18 = LK.TIES2_R18;
  function TO() { return HK.TieOrder; }
  function L(s) { return s.split('|'); }
  function P9(o) { var r = {}; for (var k in o) r[k] = L(o[k]); return r; }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = HK.personaOf ? HK.personaOf(c) : c.persona; return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function pick(S, arr) { return LK.pick(S, arr); }
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  /* 点検・計測用の記録（道具が HK.LockerTOLog = [] を置いたときだけ） */
  function note(k, p) { if (HK.LockerTOLog) HK.LockerTOLog.push({ k: k, type: p ? p.type : '', kind: p ? p.kind : '', react: p ? p.react || '' : '' }); }

  /* ---------- 場所の語（扉が開いたあとの部屋。{paper} は「媚薬のせいにしよう」の媚薬） ---------- */
  var PL_BED = { room: 'ガスの残る部屋', door: '部屋の扉', paper: '媚薬', bed: 'ベッド', here: 'この部屋' };
  var PL_LOVE = { room: 'この部屋', door: '部屋の扉', paper: '媚薬', bed: 'ベッド', here: 'この部屋' };
  var PL_IN = { room: 'ロッカー', door: 'ロッカーの扉', paper: '媚薬', bed: 'ベッド', here: 'このロッカー' };

  /* ---------- 命令・立場のあとの一文（ためらいの段。地の文。{u}＝主・上、{l}＝従・下） ---------- */
  var BRIDGE = {
    take: L('命じた声の余韻が消えないうちに、主と従者の線は、その夜だけ脇へ置かれた。|{u}の手つきは、命じたときの声よりも、ずっと静かだった。|{l}は、命令の言葉を胸の中で繰り返しながら、{u}に身を預けた。'),
    give: L('命じられたとおりに、{l}は主に触れた。その手が震えていることに、{u}だけが気づいていた。|主を抱く日が来るとは、{l}は思ってもいなかった。命令が、その最後の迷いを消した。|{u}は{l}の首に腕を回し、命令の続きを目だけで伝えた。'),
    stand: L('家族の顔は、もう二人のどちらにも残っていなかった。|子どものころから知っている手が、知らない熱を帯びていた。|ためらいは、家族として過ごした年月の分だけ長かった。それでも、二人は手を離さなかった。')
  };
  /* ---------- ロッカーの中の主の命令の一言（「」の中身。take＝主が攻め、give＝主が受け。主の態度9種） ---------- */
  var IN_CMD = {
    take: P9({
      proud: '声を殺して。これは命令｜声を殺せ。これは命令だ｜声を殺しなさい。これは命令です|……私だけを見て。命令だよ｜……私だけを見ろ。命令だ｜……私だけを見なさい。命令です',
      stern: '動かないで。私が許すまで｜動くな。私が許すまで｜動かないでください。私が許すまで|声を出さないで。外に聞こえる｜声を出すな。外に聞こえる｜声を出さないでください。外に聞こえます',
      tsun: 'め、命令だから。……我慢しないで｜め、命令だ。……我慢するな｜め、命令です。……我慢しないでください|か、勘違いしないで。命令だから、こうしてるの｜か、勘違いするな。命令だから、こうしているんだ｜か、勘違いなさらないで。命令だから、こうしているんです',
      gentle: '力を抜いて。……主の命令、聞けるよね｜力を抜け。……主の命令は聞けるな｜力を抜いてください。……主の命令、聞けますね|怖くないよ。今だけは、命令に従って｜怖くはない。今だけは、命令に従え｜怖くありませんよ。今だけは、命令に従ってください',
      devoted: '主として命じる。……私に、全部預けて｜主として命じる。……私に、全部預けろ｜主として命じます。……私に、全部預けてください|あなたは私の従者。……だから、私だけのもの｜あなたは私の従者だ。……だから、私だけのものだ｜あなたは私の従者です。……ですから、私だけのものです',
      cool: '命令。声は殺して｜命令だ。声は殺せ｜命令です。声は殺してください|外に聞かれたら困る。……命令、分かってるね｜外に聞かれたら困る。……命令は分かっているな｜外に聞かれたら困ります。……命令、分かっていますね',
      free: '命令ってことにしとこう。……逃げないでね｜命令ということにしておく。……逃げるなよ｜命令ということにしておきましょう。……逃げないでくださいね|主の命令。今は、私のことだけ考えて｜主の命令だ。今は、私のことだけ考えろ｜主の命令です。今は、私のことだけ考えてください',
      shy: 'め、命令……だから。……こっち、見て｜め、命令……だ。……こちらを見ろ｜め、命令……です。……こちらを、見てください|そ、その……命令、だから。我慢しなくて、いい｜そ、その……命令、だ。我慢しなくて、いい｜そ、その……命令、ですから。我慢しなくて、いいです',
      polite: '命令だよ。……少しだけ、声を抑えて｜命令だ。……少しだけ、声を抑えろ｜命令です。……少しだけ、声を抑えてください|今だけは、主の言うことを聞いて｜今だけは、主の言うことを聞け｜今だけは、主の言うことを聞いてください'
    }),
    give: P9({
      proud: '止まらないで。命令だよ｜止まるな。命令だ｜止まらないでください。命令です|……もっと。主の命令が聞けないの？｜……もっとだ。主の命令が聞けないのか｜……もっと。主の命令が聞けないのですか',
      stern: '遠慮はいらない。命令だから｜遠慮はいらない。命令だ｜遠慮はいりません。命令ですから|そのまま続けて。止まれとは言っていない｜そのまま続けろ。止まれとは言っていない｜そのまま続けてください。止まれとは申していません',
      tsun: 'と、止まったら、許さないから。命令｜と、止まったら、許さない。命令だ｜と、止まったら、許しません。命令です|べ、別に……命令だから、続けて｜べ、別に……命令だから、続けろ｜べ、別に……命令ですから、続けてください',
      gentle: 'いいよ、そのまま。……命令だと思って｜いい、そのままで。……命令だと思え｜いいですよ、そのまま。……命令だと思ってください|遠慮しないで。これは、主のお願い……ううん、命令｜遠慮するな。これは、主の頼み……いや、命令だ｜遠慮しないでください。これは、主のお願い……いいえ、命令です',
      devoted: 'あなたになら、全部あげる。……命令だよ、やめないで｜あなたになら、全部やる。……命令だ、やめるな｜あなたになら、全部差し上げます。……命令です、やめないでください|主の命令。……あなたの好きにして｜主の命令だ。……あなたの好きにしろ｜主の命令です。……あなたの好きにしてください',
      cool: '続けて。命令｜続けろ。命令だ｜続けてください。命令です|声は私が殺す。あなたは止まらないで｜声は私が殺す。あなたは止まるな｜声は私が殺します。あなたは止まらないでください',
      free: 'いいね、その調子。……命令、追加ね｜いいな、その調子だ。……命令を追加する｜いいですね、その調子です。……命令を追加しますね|止まったら、命令違反だよ｜止まったら、命令違反だ｜止まったら、命令違反ですよ',
      shy: 'や、やめないで……め、命令……｜や、やめるな……め、命令だ……｜や、やめないでください……め、命令、です……|そ、そのまま……命令、だから｜そ、そのまま……命令、だ｜そ、そのまま……命令、ですから',
      polite: 'そのまま、続けて。……命令だよ｜そのまま、続けろ。……命令だ｜そのまま、続けてください。……命令です|遠慮はいらないよ。主が許すから｜遠慮はいらない。主が許す｜遠慮はいりませんよ。主が許しますから'
    })
  };
  /* 従者の結末（solo-locker.js の結末の欄。p.toFate） */
  var FATE = { refuse: '主の命令を笑って断った', decline: '主の命令を断り、主が引いた', rebuff: '主の命令を撥ねつけた', force: '主の命令でねじ伏せられた', take: '主の命令で身を委ねた', give: '主の命令で主を抱いた' };

  /* ---------- 惹かれ・好意（ロッカーの中の値から） ---------- */
  var LOVE_T = /^(lover|mate|fated|almost|fwb)$/, PINE_T = /^(crush|honmei|worship|blind|yan|fond)$/;
  function tiesOf(S, a, b) { return (S.ties || []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); }); }
  function relB(S, ties, x) {
    var v = 0;
    ties.forEach(function (t) {
      if (LOVE_T.test(t.type) || (PINE_T.test(t.type) && S.P && S.P[t.a] === x)) v += 35;
      if (t.cold === 'good') v += 10; else if (t.cold === 'bad') v -= 25;
    });
    return v;
  }
  function fondOf(S, ties, x) {
    var c = x.cnt || {}, m = x.m || {};
    var body = Math.min(40, 8 + (m.heat || 0) * 0.25 + Math.min(2, c.accept || 0) * 6 + Math.min(2, c.make || 0) * 5 - Math.min(2, c.refuse || 0) * 10);
    return clamp(body + relB(S, ties, x));
  }
  function optOf(S, A, B, peek, place) {
    var ties = tiesOf(S, A, B);
    var o = { peek: !!peek, place: place || PL_BED, ties: ties,
      fond: function (x) { return fondOf(S, ties, x); },
      aff: function (x) { return clamp(40 + relB(S, ties, x)); },
      willing: function (x) { return !!(x && x.m && x.m.heat >= 85); } };
    /* 合意のない展開は、内容のスイッチ（HK.Pos.forceOn）が入のときだけキットに任せる */
    if (!(HK.Pos && HK.Pos.forceOn && HK.Pos.forceOn(S))) o.force = false;
    return o;
  }
  /* 二人の型（主従・家族）を決める。r＝{ g, p（plan）, sc（scene）, x, y } か null */
  function align(r, x, y) {
    var p = r.p, T = TO();
    if (!p.sex || p.force) return;
    if (p.type === 'order') p.kind = x === p.up ? 'take' : 'give';
    p.top = x; p.bot = y; p.why = T.why(p);
    r.x = x; r.y = y;
  }
  function planFor(S, A, B, x, y, pair) {
    var T = TO();
    if (!T || HK.SAFE_ON || !R18.groupOf) return null;
    var gi = R18.groupOf(S, x, y);
    if (!gi || !gi.e || !gi.e.t || (gi.g !== 'master' && gi.g !== 'fam')) return null;
    if (gi.g === 'master' && pair && pair.svOrd) return null;
    if (gi.g === 'fam' && !T.famOk(gi.e.t)) return null;
    var f = T.find(S, x, y, { tie: gi.e.t });
    if (!f || (gi.g === 'master' ? 'order' : 'stand') !== f.type) return null;
    /* 起きる見込み（乱数を使わない） */
    var o0 = optOf(S, A, B, true); o0.find = f;
    if (!T.plan(S, x, y, o0)) return null;
    var o1 = optOf(S, A, B, false); o1.find = f;
    var p = T.plan(S, x, y, o1);
    if (!p) return null;
    var r = { g: gi.g, p: p, x: x, y: y };
    align(r, x, y);
    r.sc = T.scene(S, p, { place: PL_BED });
    return r;
  }

  /* ---------- 扉が開いたあと、ベッドへ行く前（solo-locker.js が呼ぶ）。真を返せばベッドへ行かない ---------- */
  LK.bedGate = function (S, o) {
    if (HK.SAFE_ON || !TO() || !o || !o.pair || !o.A || !o.B || o.pair.toTried) return false;
    var pair = o.pair, A = o.A, B = o.B;
    pair.toTried = true;
    /* ベッドの攻め（solo-locker.js と同じ決め方） */
    var x = o.plotter || (A.cnt.make >= B.cnt.make ? A : B), y = x === A ? B : A;
    if (HK.Pos && HK.Pos.order(x, y, [x, y])[0] !== x) { var t0 = x; x = y; y = t0; }
    var r = planFor(S, A, B, x, y, pair);
    if (!r) return false;
    var p = r.p;
    /* 時間切れの扉が開いたとき、まだ繋がったままの二人は、拒む・断る場面にしない（結末の「繋がったまま」と食い違うので、今の夜の流れのまま） */
    if (!p.sex && pair.conn) return false;
    pair.toPlan = r;
    if (p.type === 'order') pair.toOrd = true;
    if (p.sex) return false;
    note('no', p);
    /* 命令が通らない・家族の線を越えない：その場面だけ */
    var ev = ST.say(S, { actors: [A, B], tag: p.type === 'order' ? '主の命令' : '家族の一線', text: r.sc.open, why: p.why, mag: 24 });
    ST.key(S, ev, p.type === 'order' ? p.up.name + 'の命令は通らなかった' : p.h.name + 'が家族の線を守った');
    if (p.type === 'order' && o.servant === p.down && FATE[p.react]) p.down.toFate = FATE[p.react];
    return true;
  };

  /* ---------- 命令でねじ伏せる夜（ベッドの代わりの一場面） ---------- */
  function forceBed(S, o, r) {
    var p = r.p, pre = o.how === 'timeout' && LK.BED && LK.BED.timeout ? LK.BED.timeout[0] : '';
    var text = TO().forceBody(S, p.top, p.bot, pre + r.sc.open, r.sc.after || '', { place: PL_BED, fade: r.sc.fade });
    var ev = ST.say(S, { actors: [o.A, o.B], tag: '主の命令', text: text, why: p.why + '／' + p.top.name + 'が攻め', mag: 45, kind: 'climax' });
    ST.key(S, ev, p.up.name + 'が命令でねじ伏せた');
    note('force', p);
    if (o.pair) o.pair.forced = (o.pair.forced || 0) + 1;
    if (o.servant === p.down) p.down.toFate = FATE.force;
    return ['主の命令でねじ伏せる'];
  }

  /* ---------- 扉が開いたあとのベッド（いちばん外側の包み。locker-thick.js が呼び直すときは o.lkoDone で素通し） ---------- */
  var bed1 = LK.bed;
  LK.bed = function (S, o) {
    if (!o || o.lkoDone || HK.SAFE_ON || !o.x || !o.y || !TO()) return bed1.apply(this, arguments);
    var pair = o.pair || {}, r = pair.toPlan || null;
    /* 三人以上の回の二人きりのベッドなど、solo-locker.js の入口を通らない回：合意の夜になる型だけ使う */
    if (!r && !pair.toTried) {
      pair.toTried = true;
      r = planFor(S, o.A, o.B, o.x, o.y, pair);
      if (r && (!r.p.sex || r.p.force)) r = null;
      if (r) { pair.toPlan = r; if (r.p.type === 'order') pair.toOrd = true; }
    }
    if (!r || !r.p.sex) return bed1.apply(this, arguments);
    var p = r.p;
    if (p.force) return forceBed(S, o, r);
    /* 攻めの向きがずれたら、命令の向き（抱け／抱かれろ）を合わせ直す */
    if (r.x !== o.x) { align(r, o.x, o.y); r.sc = TO().scene(S, p, { place: PL_BED }); }
    var o2 = Object.assign({}, o, { lkoDone: true, noOrder: true, lead: { text: r.sc.open, label: p.type === 'order' ? '主の命令' : '家族の立場', why: p.why } });
    var start = S.log.length, res;
    note('bed', p);
    S.lkTOcur = r;
    try { res = bed1.call(this, S, o2); } finally { S.lkTOcur = null; }
    if (p.type === 'order') {
      /* 事後の段の終わりに、命令の結び */
      var es = S.log.slice(start).filter(function (q) { return q && typeof q.text === 'string' && q.kind !== 'step' && q.kind !== 'phase'; });
      var fin = es[es.length - 1];
      if (r.sc.after && fin && es.length > 1 && o.lew !== 'low') fin.text += (/\n\n/.test(fin.text) ? '\n\n' : '') + r.sc.after;
      if (o.servant === p.down && !p.down.broke) p.down.toFate = FATE[p.kind === 'give' ? 'give' : 'take'];
    }
    return res;
  };

  /* ---------- つなぎ口 ---------- */
  /* ためらいの段：命令・立場の型の夜は、命令のあとの一文（命令とその反応は誘いの段に入れてある） */
  R18.hesHook = function (S, c) {
    var r = S.lkTOcur;
    if (!r || !r.p.sex || r.p.force) return '';
    var p = r.p, k = c.g === 'master' && p.type === 'order' ? (p.kind === 'give' ? 'give' : 'take') : c.g === 'fam' && p.type === 'stand' ? 'stand' : '';
    return k ? ST.fmt(pick(S, BRIDGE[k]), { u: p.up.name, l: p.down.name }) : '';
  };
  /* 導入の段：恋人たちに、場所への照れ・警戒の一言（照れの一言と別の人が、別の向きで） */
  R18.introHook = function (S, c) {
    if (c.g !== 'love' || HK.SAFE_ON || !TO() || !c.x || !c.y) return '';
    var hs = c.hes || '', sp = null;
    [c.x, c.y].slice().sort(function (p, q) { return q.name.length - p.name.length; }).forEach(function (p) { if (!sp && hs.indexOf(p.name + '「') === 0) sp = p; });
    var s1 = sp ? (sp === c.x ? c.y : c.x) : (S.rng() < 0.5 ? c.x : c.y), s2 = s1 === c.x ? c.y : c.x;
    /* 照れの一言と同じ言葉（カメラ・恥ずかしい）を重ねない：重なれば、もう一方の向き（cam⇔shy）に。どちらも重なれば足さない */
    var share = function (l) { return (/カメラ/.test(l) && /カメラ/.test(hs)) || (/恥ずかし/.test(l) && /恥ずかし/.test(hs)); };
    var line = TO().react(S, s1, s2, 'auto', { place: PL_LOVE });
    if (share(line)) line = TO().react(S, s1, s2, /^(proud|stern|cool|free|polite)$/.test(ps(s1)) ? 'shy' : 'cam', { place: PL_LOVE });
    if (share(line)) return '';
    note('love', null);
    return (c.intro || '') + line;
  };

  /* ---------- ロッカーの中で繋がったとき：主の命令の一言（一度だけ） ---------- */
  var act0 = LK.TIES2.r18Act;
  LK.TIES2.r18Act = function (S, tp, bt, pair) {
    var t = act0.apply(this, arguments) || '';
    if (HK.SAFE_ON || !pair || pair.svOrd || pair.toIn || !TO() || !R18.groupOf || !tp || !bt) return t;
    var gi = R18.groupOf(S, tp, bt);
    if (!gi || gi.g !== 'master' || !gi.e || !gi.e.t) return t;
    var f = TO().find(S, tp, bt, { tie: gi.e.t });
    if (!f || f.type !== 'order') return t;
    var o0 = optOf(S, tp, bt, true, PL_IN); o0.find = f;
    var p0 = TO().plan(S, tp, bt, o0);
    if (!p0 || !p0.sex || p0.force || S.rng() >= 0.6) return t;
    pair.toIn = true; pair.toOrd = true;
    note('in', p0);
    var M = f.up;
    return t + M.name + '「' + pick(S, IN_CMD[tp === M ? 'take' : 'give'][ps(M)]) + '」';
  };
  R18.ORDER_COUNT = function () { var n = 0; Object.keys(BRIDGE).forEach(function (k) { n += BRIDGE[k].length; }); ['take', 'give'].forEach(function (k) { PS.forEach(function (p) { n += IN_CMD[k][p].length; }); }); return n; };
})();
