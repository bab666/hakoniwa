/* @event-ok 一人用の箱庭（催眠・マッサージ・感覚遮断穴・ダンジョン・常識改変・サキュバス・バラエティ）の既にある山場に、プレイの段（HK.EroPlay）・能動性の型（HK.Initiative）・箱庭専用の組み合わせの段を差すだけ（新しい出来事ではない。2026-10-31 担当E3a） */
/* 箱庭シミュレーター（R18版のみ）: 一人用の箱庭の山場への取り付け（HK.SoloEro3）
   ■ 何をするか：一人用の箱庭は共通の山場（HK.ThickSex など）を通らず、自前で山場の段落を組んでいるので、E1 の HK.EroPlay（前立腺・結腸・乳首・喉奥）と
     E2 の HK.Initiative（攻めの展開・体位・受けの返し・受けが主導のときだけの誘い方と型の変化）がそのままでは効かない。
     ここで箱庭ごとの山場の組み立てを包み、段落の配列に
       ・前戯の段（EroPlay の fore）… 繋がる段の前
       ・最中の段（EroPlay の mid・箱庭専用の段・Initiative の mid）… 果てる段の前
       ・果てる段の頭の一文（EroPlay の peak）
       ・受けの誘い方（Initiative の lead。受けの夜の主導が誘い受け・襲い受けのときだけ）… 始まりの段のあと
       ・役割の入れ替え（Initiative の end。二人とも住人で、二人とも攻めを選んでいない組だけ）… 果てる段のあと
     を差す。既存の文は消さない。
   ■ 箱庭専用の段（HK.SoloEro3.SP[箱庭]）：箱庭ごとの状況に合わせた組み合わせ（催眠の「命じられて自分から跨る」など）。文は箱庭ごとの R18 専用ファイル（<箱庭>-ero3-r18.js）。
     一つの段は［きっかけの一文］［攻めの一言（3本の台詞）］［組ごとの地の文（男×女・女×女・女攻め×男。小説調／男性向け）］［攻めの進め方（夜の性格か態度 9 種）］
     ［受けの反応（夜の性格か態度 9 種）］［受けの喘ぎ（HK.Moan）］で組む。
   ■ 守ること：攻め（T）・受け（U）は箱庭の山場が決めた向きのまま（受けが攻めを選んだ人なら何もしない）。体の組に合わないプレイ・段は出さない。
     強い行為（喉奥・結腸）は、箱庭ごとの決まり（CFG の strong：合意のない展開が入、または合意のある住人どうし）を越えない。
     モブ・魔物が相手の場面では役割の入れ替えをしない。受けの誘い方・型の変化は Initiative の判定どおり（受け本人の夜の主導だけ）。
   ■ 乱数：本筋の乱数（S.rng）は使わない。入力の seed・二人の名前・場面の番号から作る別の乱数で選ぶので、差さない回の結果はこれまでとまったく同じ。
   ■ 点検用：HK.SoloEro3.log に配列を入れると、差した場面を記録する（{ scen, src, t, u, mode, ero, keys, sp, ini, anat, hardTopU, text }）。
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var S3 = HK.SoloEro3 = HK.SoloEro3 || {};
  S3.SP = S3.SP || {};
  if (S3.log === undefined) S3.log = null;
  S3.errs = S3.errs || [];
  function L(s) { return s.split('|'); }
  function P() { return HK.Pos; }
  function EPo() { return HK.EroPlay; }
  function INI() { return HK.Initiative; }

  /* ---------- 一回の遊びの状態（HK.simulate を包んで覚える） ---------- */
  var CUR = { env: {}, scen: '', seed: '', n: 0, chars: [], ties: [], used: {}, last: {}, cnt: {}, memo: {}, seen: {}, mT: null };
  if (HK.simulate && HK.wrap && !HK.simulate._e3) HK.wrap(HK, 'simulate', function (sim0) {
    var f = function (input) {
      var prev = CUR;
      CUR = { env: (input && input.env) || {}, scen: (input && input.scenId) || '', seed: String(input && input.seed != null ? input.seed : ''), n: 0,
        chars: (input && input.chars) || [], ties: (input && input.ties) || [], used: {}, last: {}, cnt: {}, memo: {}, seen: {}, mT: null };
      try { return sim0.apply(this, arguments); } finally { CUR = prev; }
    };
    for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) f[k] = sim0[k];
    f._e3 = true;
    return f;
  });
  function hstr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mkRng(key) {
    var h = hstr(key) || 1;
    var r = function () { h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x6D2B79F5) >>> 0; h ^= h >>> 13; return (h >>> 8) / 16777216; };
    r.int = function (m) { return Math.floor(r() * m); };
    r.pick = function (a) { return a[r.int(a.length)]; };
    return r;
  }
  function rngFor(T, U, tag) { CUR.n++; return mkRng('e3|' + CUR.seed + '|' + CUR.scen + '|' + CUR.n + '|' + (tag || '') + '|' + (T && T.name) + '|' + (U && U.name)); }
  /* 一回の結果の中で同じ文を続けない */
  function pickF(R, arr) {
    if (!arr || !arr.length) return '';
    var u = CUR.used, free = arr.filter(function (x) { return !u[x]; });
    var x = (free.length ? free : arr)[R.int((free.length ? free : arr).length)];
    u[x] = 1;
    return x;
  }
  function ct(tag) { return !!(HK.Content && HK.Content.on && HK.Content.on(CUR.env, tag, CUR.scen)); }
  S3.ct = ct;
  S3.cur = function () { return CUR; };
  function ero() { return !!(HK.Lewd && HK.Lewd.ero && HK.Lewd.ero(CUR.env)); }
  function lewdLv() { return HK.Lewd && HK.Lewd.lv ? HK.Lewd.lv(CUR.env) : CUR.env.lewd; }
  S3.ero = ero;
  function err(e) { var s = String(e && e.stack || e).slice(0, 400); S3.errs.push(s); if (S3.log) S3.log.push({ err: s }); }

  /* ---------- 体と設定 ---------- */
  function hasM(c) { var Q = P(); return Q && Q.hasM ? Q.hasM(c) : (c && c.gender) === 'm'; }
  function hasF(c) { var Q = P(); return Q && Q.hasF ? Q.hasF(c) : (c && c.gender) === 'f'; }
  function isF(c) { var Q = P(); return Q && Q.isF ? Q.isF(c) : (c && c.gender) === 'f'; }
  S3.hasM = hasM; S3.hasF = hasF; S3.isF = isF;
  /* 名前の見えない印（話し手の印など）を外す */
  function bare(n) { return String(n || '').replace(/[\u2060-\u2064\u200b-\u200d\ufeff]/g, ''); }
  /* 住人（入力の住人と同じ名前）か */
  function resIdx(c) {
    if (!c || c.mob || !c.name) return -1;
    var nm = bare(c.name);
    for (var i = 0; i < CUR.chars.length; i++) if (CUR.chars[i] && bare(CUR.chars[i].name) === nm) return i;
    return -1;
  }
  S3.isRes = function (c) { return resIdx(c) >= 0; };
  /* 二人の関係（入力の関係の恋人・体だけ）。住人どうしでなければ '' */
  function relOf(T, U) {
    var a = resIdx(T), b = resIdx(U);
    if (a < 0 || b < 0) return '';
    var r = '';
    (CUR.ties || []).forEach(function (t) { if (t && ((t.a === a && t.b === b) || (t.a === b && t.b === a))) { if (/^(lover|mate|fated|honmei)$/.test(t.type)) r = 'lover'; else if (/fwb|sefure|casual/.test(t.type) && !r) r = 'casual'; } });
    return r;
  }
  /* モブ・魔物の代わりの人（名前・体・態度だけ。設定は持たない） */
  S3.mob = function (name, g) { return { name: name || '相手', gender: g === 'f' ? 'f' : 'm', mob: true, persona: 'gentle', eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }, tr: {} }; };

  /* ---------- 攻めの進め方・受けの反応（夜の性格の種類 4 種＋態度 9 種。EroPlay の態度の表に、恥じらいと種類の表を足す） ---------- */
  var MAN_X = {
    shy: L('{a}は耳まで赤くしながら、それでも手を止めずに、おそるおそる{spot}に触れ続けた。|{a}は{b}と目が合うたびに視線を逸らし、ぎこちない手つきのまま{spot}を確かめていった。'),
    sadist: L('{a}は{b}が音を上げるまで許さないとでも言うように、{spot}ばかりを執拗に責め立てた。|{a}は{b}の乱れた顔を見下ろして、どこが弱いのか自分の口で言わせるまで{spot}を責め続けた。'),
    mean: L('{a}は{b}が欲しがるたびにわざと手を止め、焦れきったところで、また{spot}に触れた。|{a}は意地悪く笑いながら、いちばん欲しいところの手前で{spot}をなぞるだけにした。'),
    sweet: L('{a}は{b}の顔をのぞき込み、気持ちいいかと何度も確かめながら、{spot}をやさしく愛でた。|{a}は{b}が強張るたびに手をゆるめ、ほどけるのを待ってから、また{spot}に触れた。')
  };
  var REA_X = {
    shy: L('{b}は顔を両手で隠したまま、見ないで、とかすれた声で繰り返した。|{b}は声が漏れるたびに唇を噛み、真っ赤になって身を縮めた。'),
    maso: L('{b}はもっと強くしてほしいとねだるように、自分から{spot}を押しつけた。|{b}は苦しいほどの快感に涙をにじませながら、それでもやめないでと首を振った。'),
    sweet: L('{b}は{a}の名前を甘く呼び、されるがままに体を預けていった。|{b}は{a}の手に自分の手を重ね、もっと、と小さくねだった。'),
    mean: L('{b}は感じてなんかいないと言いたげに睨み返したが、その強がりは長く続かなかった。|{b}は調子に乗るなと悪態をつきかけて、そのまま声を震わせた。')
  };
  /* 相手のいない段（魔物・罠・壁の向こう）の受けの反応：相手の名前を出さない書き方（態度 9 種＋夜の性格の種類） */
  var SOLO_R = {
    proud: L('{b}は屈してなるものかと歯を食いしばったが、{spot}から広がる熱に、その顔が少しずつ崩れていった。|{b}は負けを認めまいと前を睨んだが、体は正直に震えていた。'),
    stern: L('{b}は声を殺そうと唇を引き結んだが、{spot}を責められるうちに、その堅い表情がほどけていった。|{b}は乱れまいと呼吸を数えようとして、そのたびに数を見失った。'),
    tsun: L('{b}は感じてなんかいないと心の中で言い張りながら、それでも甘い声を漏らした。|{b}は顔を背けて平気なふりをしたが、腰の震えだけはごまかせなかった。'),
    gentle: L('{b}は抗うのをやめ、{spot}から広がる熱に、ゆっくりと身を委ねていった。|{b}は細く長い息を吐き、波が引くのを待つことさえ忘れていった。'),
    devoted: L('{b}は苦しいほどの快感さえ拒みきれずに、健気に受け止めてしまった。|{b}は震えながらも、与えられる熱を一つずつ受け入れていった。'),
    cool: L('{b}は自分の反応を冷静に分析しかけて、その思考ごと快感に押し流されていった。|{b}の澄ました顔は、{spot}を責められるうちに少しずつ崩れていった。'),
    free: L('{b}は思わず笑いかけたが、その笑い声はすぐに甘い悲鳴に変わった。|{b}は恥じらうこともなく、感じるままに声を上げた。'),
    shy: L('{b}は誰にも見られていないことだけを祈りながら、真っ赤になって身を縮めた。|{b}は声が漏れるたびに唇を噛み、両手で顔を覆った。'),
    polite: L('{b}は乱れた声のあとで、誰にともなく小さく詫びた。|{b}は丁寧な言葉で自分を保とうとして、途中で言葉にならなくなった。'),
    maso: L('{b}はもっと強く責められたいと、自分から{spot}を差し出すように背を反らせた。|{b}は苦しいほどの快感に涙をにじませながら、それでも終わらないでほしいと願っていた。'),
    sweet: L('{b}は抗う気持ちを手放し、甘い熱にとろけるように身を任せた。|{b}は熱に浮かされたまま、もっと、と小さく呟いた。'),
    mean: L('{b}はこんなものでと悪態をつきかけて、そのまま声を震わせた。|{b}は強がりを口にしようとしたが、出てきたのは甘い声だけだった。')
  };
  function manKey(T, U) { var E = EPo(); return E && E.mKey ? E.mKey(T, U) : 'gentle'; }
  function reaKey(U, T) { var E = EPo(); return E && E.rKey ? E.rKey(U, T) : 'gentle'; }
  function manner(R, T, U, spot) {
    var E = EPo(), k = manKey(T, U), l = MAN_X[k] || (E && E.GEN_M && E.GEN_M[k]) || (E && E.GEN_M && E.GEN_M.gentle) || MAN_X.sweet;
    return pickF(R, l).replace(/\{spot\}/g, spot);
  }
  function react(R, T, U, spot) {
    var E = EPo(), k = reaKey(U, T);
    if (!T) return pickF(R, SOLO_R[k] || SOLO_R.gentle).replace(/\{spot\}/g, spot);
    var l = REA_X[k] || (E && E.GEN_R && E.GEN_R[k]) || (E && E.GEN_R && E.GEN_R.gentle) || REA_X.sweet;
    return pickF(R, l).replace(/\{spot\}/g, spot);
  }
  S3.manner = manner; S3.react = react;
  /* 喘ぎ（HK.Moan。態度・口調・濁点・♡・小説調は♡なし） */
  function moan(R, U, T, kind, e) {
    var M = HK.Moan, fb = function () { return kind === 'climax' ? 'あ、ぁ……っ' : 'ん、ぅ……っ'; };
    var host = { rng: R, _eroSeen: CUR.seen };
    var v = M && M.say ? M.say(host, U, kind, { novel: !e, top: T && !T.mob ? T : null }, fb) : fb();
    return v || fb();
  }
  S3.moan = moan;

  /* ---------- 箱庭専用の段（文の表は箱庭ごとのかたまりの HK.ERO3_<箱庭>。S3.SP[箱庭] に置けばそちらが先） ---------- */
  /* sp = { id, label, modes: ['mf','ff','fm'] か体 ['f','m']（solo：相手が魔物・罠）, ins（繋がっている場面だけ）, ok(T, U, o), w,
           why: [きっかけの一文]、say: [攻めの一言（3本の台詞）]、tx: { 組: { n: [小説調], e: [男性向け] } }、spot: 責める場所の語（関数でもよい） } */
  /* 文の組の鍵：相手のいない段は受けの体（f／m）、男×男（受けが男性器だけ）の文があればそれ（mm）、なければ場面の組 */
  function spKey(sp, U, o) {
    if (sp.solo) return isF(U) ? 'f' : 'm';
    if (o.mode === 'mf' && sp.tx.mm && hasM(U) && !hasF(U)) return 'mm';
    return o.mode;
  }
  function spPick(R, scen, T, U, o) {
    var list = (S3.SP[scen] || HK['ERO3_' + String(scen).toUpperCase()] || []).filter(function (sp) {
      var key = spKey(sp, U, o), mk = sp.solo ? key : o.mode;
      if (!!sp.solo !== !!o.solo) return false;
      /* 相手のいない段：女性の体の文は女性器のある人、男性の体の文は男性器のある人だけ */
      if (sp.solo && (key === 'f' ? !hasF(U) : !hasM(U))) return false;
      if ((sp.modes || []).indexOf(mk) < 0 || !sp.tx[key]) return false;
      if (sp.ins && !o.ins) return false;
      if (sp.kinds && sp.kinds.indexOf(o.kind || '') < 0) return false;
      return !sp.ok || sp.ok(T, U, o);
    });
    if (!list.length) return null;
    var pk = (T ? T.name : '') + '\u0001' + U.name, last = CUR.last[pk + '#sp'];
    var c2 = list.filter(function (sp) { return sp.id !== last; });
    if (c2.length) list = c2;
    /* この回でまだ使っていない段を先に */
    var un = list.filter(function (sp) { return !CUR.used['#sp' + sp.id]; });
    if (un.length) list = un;
    var s = 0; list.forEach(function (sp) { s += sp.w || 1; });
    var x = R() * s;
    for (var i = 0; i < list.length; i++) { x -= list[i].w || 1; if (x < 0) return list[i]; }
    return list[list.length - 1];
  }
  function spBuild(R, sp, T, U, o) {
    var key = spKey(sp, U, o), e = !!o.ero, tx = sp.tx[key];
    var spot = typeof sp.spot === 'function' ? sp.spot(T, U, o) : sp.spot && typeof sp.spot === 'object' ? sp.spot[key] || sp.spot[o.mode] || '{b}の体' : sp.spot || '{b}の体';
    var t = pickF(R, sp.why);
    if (sp.say && T && !sp.solo) t += '{a}「' + pickF(R, sp.say) + '」';
    t += pickF(R, (e ? tx.e : tx.n) || tx.n);
    if (T && !sp.solo) t += manner(R, T, U, spot);
    t += react(R, T, U, spot);
    if (!/\{b\}「/.test(t.slice(-60))) t += '{b}「{mb}」';
    CUR.used['#sp' + sp.id] = 1;
    return t;
  }
  /* 女攻め×男（fm）：攻めの体の中を場所にした言い回し（「{a}の中で」など）を、攻めが包み込む言い回しに（攻めを選んだ女性が受ける文に読めないように） */
  function fmFix(t) {
    return t.replace(/\{a\}の中にいる/g, '{a}に咥え込まれた').replace(/\{a\}の(?:中|\{ナカ\})で(?!、)/g, '{a}に咥え込まれたまま')
      .replace(/\{a\}の(?:中|\{ナカ\})に(?=どくどく|どぷどぷ|びゅる)/g, '{a}に包まれたまま').replace(/\{a\}の(?:中|\{ナカ\})へ/g, '{a}へ');
  }
  function fillT(t, R, T, U, e, mode) {
    if (mode === 'fm') t = fmFix(String(t));
    return String(t).replace(/\{mb\}/g, function () { return moan(R, U, T, 'mid', e); })
      .replace(/\{mc\}/g, function () { return moan(R, U, T, 'climax', e); })
      .replace(/\{s:(\w+)\}/g, function (m, k) { if (!e) return ''; var l = HK.Ero && HK.Ero.SFX && HK.Ero.SFX[k]; return l && l.length ? l[R.int(l.length)] : ''; })
      /* 攻め（{a}）の体の中を主語にしない言い回しに（女性の攻めが自分で攻めを選んでいるとき、受ける文に読めないように） */
      .replace(/\{a\}の\{ナカ\}に包まれたまま/g, '{a}に包み込まれたまま').replace(/\{a\}の\{ナカ\}で大きく脈打った/g, '{a}に咥え込まれたまま大きく脈打った')
      .replace(/。。/g, '。');
  }

  /* ---------- 差し込みの本体 ----------
     paras：段落の配列（そのまま書き換える）。pos = { lead: 誘い方を置く前の番号, fore: 前戯の段を置く前の番号, climax: 果てる段の番号 }
     o = { mode: 'mf'|'ff'|'fm', ero, allow: [プレイ], strong（喉奥・結腸を許す）, ini: true|false, iniOpt, mob（相手がモブ・魔物）, rel, heat, ins（繋がっている場面か）,
           kind（箱庭の型）, spP（専用の段の起こりやすさ）, tok: { T: 攻めの書き方, U: 受けの書き方 }, src, solo（相手のいない場面：魔物・罠。U だけ） } */
  S3.run = function (scen, T, U, paras, pos, o) {
    if (HK.SAFE_ON || !U || !paras || !paras.length) return paras;
    o = o || {};
    var Q = P(), E = EPo(), I = INI();
    if (T && Q && Q.hardTop && Q.hardTop(U, T)) return paras;   /* 受けが攻めを選んだ人なら何もしない */
    if (T && HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U)) return paras;
    var e = o.ero != null ? !!o.ero : ero(), R = rngFor(T, U, o.src);
    var pk = (T ? T.name : '') + '\u0001' + U.name;
    CUR.cnt[pk] = (CUR.cnt[pk] || 0) + 1;
    var nth = CUR.cnt[pk];
    var tok = o.tok || { T: T ? T.name : '', U: U.name };
    /* 住人でない相手（客・獲物などのモブ）の長い呼び名は、段落の中で二度目からは「相手」にする（台詞の話し手の印の前はそのまま） */
    var thinT = !!T && resIdx(T) < 0 && tok.T.charAt(0) !== '{', thinU = resIdx(U) < 0 && tok.U.charAt(0) !== '{';
    var paint = function (t) {
      var seen = {};
      return String(t).replace(/\{([ab])\}(「)?/g, function (m, k, q) {
        var nm = k === 'a' ? tok.T : tok.U, thin = k === 'a' ? thinT : thinU;
        if (q) return nm + q;
        if (thin && seen[k]) return '相手';
        seen[k] = 1;
        return nm;
      });
    };
    var rec = { scen: scen, src: o.src || '', kind: o.kind || '', ins: !!o.ins, t: T ? bare(T.name) : '', u: bare(U.name), mode: o.mode || '', ero: e, keys: [], sp: '', ini: null, anat: true, hardTopU: !!(T && Q && Q.hardTop && Q.hardTop(U, T)), tMob: !!T && resIdx(T) < 0, uMob: resIdx(U) < 0, trig: [], parts: [] };
    var ins = { lead: [], fore: [], epMid: [], mid: [], end: [], peak: '' };
    /* 1. プレイの段（EroPlay） */
    if (E && T && !o.solo && o.allow && o.allow.length) {
      var allow = o.allow.filter(function (k) { return (k !== 'throat' && k !== 'colon') || o.strong; });
      var plan = E.plan(T, U, { mode: o.mode || 'mf', ero: e, force: false, heat: o.heat || '', rel: o.rel || '', nth: nth, lewd: lewdLv(), R: R, place: o.place || '' });
      if (plan) {
        var lastK = CUR.last[pk + '#ep'] || [];
        plan.keys = plan.keys.filter(function (k) { return allow.indexOf(k) >= 0 && lastK.indexOf(k) < 0 && E.anatOk(k, T, U, plan.mode); });
        if (plan.keys.length) {
          var b = E.build(T, U, plan, { ero: e, R: R, place: o.place || '' });
          ins.fore = b.fore.slice(); ins.epMid = b.mid.slice(); ins.peak = b.peak || '';
          rec.keys = plan.keys.slice(); rec.init = plan.init;
          rec.anat = plan.keys.every(function (k) { return E.anatOk(k, T, U, plan.mode); });
          CUR.last[pk + '#ep'] = plan.keys.slice();
          rec.trig.push('ep');
        }
      }
    }
    /* 2. 箱庭専用の段 */
    var sp = null;
    if (o.spP && R() < o.spP) {
      sp = spPick(R, scen, T, U, o);
      if (sp) {
        ins.mid.push(spBuild(R, sp, T, U, o));
        rec.sp = sp.id; CUR.last[pk + '#sp'] = sp.id; rec.trig.push('sp');
      }
    }
    /* 3. 能動性の型（Initiative） */
    if (I && T && !o.solo && o.ini !== false && I.plan) {
      var joined = paras.join('\n');
      var st = { mode: o.mode || 'mf', ero: e, drug: o.heat === 'drug', heat: o.heat === 'omega', nth: nth, memo: CUR.memo, r: I.rngFor(T, U, joined + '|' + scen + '|' + CUR.n), ini: o.iniOpt || null };
      var pl = I.plan(null, T, U, st);
      if (pl) {
        /* モブ・魔物が相手・住人でない人がいる組では役割の入れ替えをしない（主導だけが移る形にする） */
        if (pl.change === 'swap' && (o.mob || o.noSwap || resIdx(T) < 0 || resIdx(U) < 0)) pl.change = 'shift';
        /* 箱庭専用の段がすでに受けを上に乗せた（騎乗）なら、型の変化と攻めの体位の段は重ねない */
        if (sp && sp.pose === 'ride') { if (pl.change === 'ride_b' || pl.change === 'shift') { pl.change = ''; pl.why = ''; } pl.dev = ''; }
        if (pl.dev || pl.react || pl.lsty || pl.change) {
          var pp = I.parts(pl);
          if (pp.lead) ins.lead.push(pp.lead);
          if (pp.mid) ins.mid.push(pp.mid);
          if (pp.end) ins.end.push(pp.end);
          rec.ini = { dev: pl.dev, pose: pl.pose, react: pl.react, lsty: pl.lsty, change: pl.change, why: pl.why, lead: pl.lead, kind: pl.kind, kindU: pl.kindU, att: pl.att, attU: pl.attU, H: pl.H };
          if (pl.lsty || pl.change) rec.trig.push('ini');
        }
      }
    }
    if (!ins.fore.length && !ins.epMid.length && !ins.mid.length && !ins.lead.length && !ins.end.length && !ins.peak) { if (S3.log) S3.log.push(rec); return paras; }
    rec.insTx = [];
    var F = function (t) { var x = paint(fillT(t, R, T, U, e, o.mode)); rec.insTx.push(x); return x; };
    /* 後ろから差す（番号がずれないように） */
    var ci = Math.max(0, Math.min(paras.length - 1, pos.climax == null ? paras.length - 1 : pos.climax));
    if (ins.end.length) paras.splice.apply(paras, [ci + 1, 0].concat(ins.end.map(F)));
    if (ins.peak) paras[ci] = F(ins.peak) + paras[ci];
    if (ins.mid.length) paras.splice.apply(paras, [ci, 0].concat(ins.mid.map(F)));
    var fi = Math.max(0, Math.min(ci, pos.fore == null ? 0 : pos.fore));
    /* プレイの繋がる段は、果てる段の一つ前の段落の前（元の段落を一つ挟んで、果てる段の頭の一文と続かないように） */
    if (ins.epMid.length) { var mi = Math.max(fi, Math.min(ci, pos.mid == null ? ci - 1 : pos.mid)); paras.splice.apply(paras, [mi, 0].concat(ins.epMid.map(F))); }
    if (ins.fore.length) paras.splice.apply(paras, [fi, 0].concat(ins.fore.map(F)));
    var li = Math.max(0, Math.min(fi, pos.lead == null ? fi : pos.lead));
    if (ins.lead.length) paras.splice.apply(paras, [li, 0].concat(ins.lead.map(F)));
    /* 指で責めている段落のすぐ次に、指を抜かずに挿れる段落が来ないように（点検 misc の FI。Initiative の apply と同じ一文） */
    if (T && o.mode !== 'ff') {
      var FING = /指(?:を|が)(?:[^。]{0,12})(?:ねじ込|挿れ|挿し|差し入れ|入れ|沈め|埋め|潜り込|滑り込|突き入れ)|指で(?:[^。]{0,10})(?:掻き回|かき回|ほぐ|擦|こす|責め|突)|指(?:を|が)(?:[^。]{0,8})(?:動か|曲げ|抜き差し|出し入れ)/;
      var OUTF = /指を(?:[^。]{0,8})(?:抜|引き抜|離)|指が(?:[^。]{0,6})(?:抜け|抜か|離れ)/;
      var INSF = /突き入れ|挿入|貫い|貫か|繋が(?:っ|る|り)|腰を沈め|奥まで(?:[^。]{0,6})(?:押し込|沈め|呑み込|突き)|ゆっくりと(?:[^。]{0,6})入って|を(?:[^。]{0,10})(?:押し当て|宛てが|あてが|埋め|沈め|押し込)/;
      var st0 = function (x) { return String(x).replace(/「[^」]*」/g, ''); };
      for (var q = 0; q + 1 < paras.length; q++) {
        if (rec.insTx.indexOf(paras[q]) < 0 && rec.insTx.indexOf(paras[q + 1]) < 0) continue;
        var a0 = st0(paras[q]), b0 = st0(paras[q + 1]);
        if (FING.test(a0) && !OUTF.test(a0) && !INSF.test(a0) && INSF.test(b0) && !OUTF.test(b0) && !/指/.test(b0)) paras[q] += tok.T + 'は濡れた指を、ゆっくりと引き抜いた。';
      }
    }
    rec.parts = ['lead', 'fore', 'epMid', 'mid', 'end'].filter(function (k) { return ins[k].length; }).concat(ins.peak ? ['peak'] : []);
    rec.text = paras.join('\n\n');
    if (S3.log) S3.log.push(rec);
    return paras;
  };
  /* 果てる段の番号：start 以降で、果てる・達する語のある最後の段（台詞は除く）。無ければ最後の段 */
  var PEAK = /果て(?:た|る|て)|達し(?:た|て)|絶頂|イっ|イく|弾け|注ぎ込|吐き出|搾り取|上り詰め|昇りつめ/;
  S3.climaxIdx = function (paras, start, lastFirst) {
    var hit = -1;
    for (var i = start || 0; i < paras.length; i++) if (PEAK.test(String(paras[i]).replace(/「[^」]*」/g, ''))) { hit = i; if (!lastFirst) break; }
    return hit >= 0 ? hit : paras.length - 1;
  };

  /* ---------- 箱庭ごとの決まり ---------- */
  /* 型（kind）→ 体の組（mode）と、繋がっている場面か。'in'＝T が U の中へ／'ride'＝竿のない T が U に跨る／'ff'＝指と舌 */
  function modeOfKind(kind, T, U) {
    if (kind === 'in') return hasM(T) ? { mode: 'mf', ins: true } : null;
    if (kind === 'ride') return !hasM(T) && hasM(U) ? { mode: 'fm', ins: true } : null;
    if (kind === 'ff') return { mode: 'ff', ins: false, ff: true };
    return null;
  }
  S3.modeOfKind = modeOfKind;
  var ALL = ['pros', 'colon', 'nip', 'throat'];
  S3.CFG = {
    /* 催眠：かけられた人の同意は暗示の中なので、強い行為は「合意のない展開」が入のときだけ */
    saimin: function (T, U, mk) { return { allow: mk.ins ? ALL : ['nip'], strong: ct('force'), ini: true, spP: 0.45, rel: relOf(T, U) }; },
    /* マッサージ：住人の施術者と客の組は合意のある関係として扱う。モブの施術者なら強い行為は「合意のない展開」が入のときだけ */
    massage: function (T, U, mk) { var res = S3.isRes(T) && S3.isRes(U); return { allow: mk.ins ? ALL : ['nip'], strong: res || ct('force'), ini: true, spP: 0.45, rel: relOf(T, U) }; },
    /* 感覚遮断穴：壁の向こうからは下半身しか見えない（乳首・喉奥は出さない）。誘い方・型の変化も出さない */
    hole: function (T, U, mk) { return { allow: ['pros', 'colon'], strong: ct('force'), ini: false, spP: 0.5, rel: '' }; },
    /* ダンジョン（仲間どうしの暴走）：迷宮の熱に呑まれた場面なので、強い行為は「合意のない展開」が入のときだけ。誘い方・型の変化は出さない */
    dungeon: function (T, U, mk) { return { allow: mk.ins ? ALL : ['nip'], strong: ct('force'), ini: true, iniOpt: { lead: false, change: '' }, spP: 0, rel: relOf(T, U), heat: '' }; },
    /* 常識改変：改変された常識の中の行為なので、強い行為は「合意のない展開」が入のときだけ */
    kaihen: function (T, U, mk) { return { allow: mk.ins ? ALL : ['nip'], strong: ct('force'), ini: true, spP: 0.45, rel: relOf(T, U) }; },
    /* サキュバス：獲物はモブ。強い行為は「合意のない展開」が入のときだけ */
    succubus: function (T, U, mk) { return { allow: mk.ins ? ALL : ['nip'], strong: ct('force'), ini: true, spP: 0.5, rel: '' }; },
    /* バラエティ：同点最下位の罰ゲーム（pair）は番組の命令なので強い行為は「合意のない展開」が入のときだけ。楽屋に消えた二人（gone）は合意の上 */
    variety: function (T, U, mk, k) { return { allow: mk.ins ? ALL : ['nip'], strong: k === 'gone' || ct('force'), ini: true, spP: 0.45, rel: relOf(T, U) }; }
  };
  function cfgOf(scen, T, U, mk, k) { var f = S3.CFG[scen]; if (!f) return null; var o = f(T, U, mk, k); o.mode = mk.mode; o.ins = !!mk.ins; o.mob = (T && resIdx(T) < 0) || resIdx(U) < 0; o.kind = k || ''; return o; }
  S3.cfgOf = cfgOf;

  /* ---------- 取り付け ---------- */
  function mark(f, k) { f[k] = true; return f; }
  /* (1) 小説調の山場（solo-thick4.js の HK.Thick4.scene）：催眠（暗示の厚い場面・我に返ったあと流される）・常識改変・サキュバス */
  function t4(S, o, r) {
    var id = S && S.scen && S.scen.id;
    if (!S3.CFG[id] || typeof r !== 'string' || !o || !o.dom || !o.sub || !o.dom.name || !o.sub.name) return r;
    var T = o.dom, U = o.sub, kind = HK.Thick4.kindFor(o.kind || 'in', T, U), mk = modeOfKind(kind, T, U);
    var paras = r.split('\n\n');
    if (paras.length < 4) return r;
    var lp = o.lead ? String(o.lead).split('\n\n').length : 0;
    var cf = mk ? cfgOf(id, T, U, mk, kind) : null;
    if (!cf) {
      /* 手・口だけの場面：繋がっていない場面でも出せる専用の段だけ */
      if (!/^(serve|kneel|touch)/.test(kind)) return r;
      var Q = P(), mode = isF(T) && isF(U) ? 'ff' : isF(T) && !isF(U) ? 'fm' : 'mf';
      cf = cfgOf(id, T, U, { mode: mode, ins: false }, kind); cf.allow = []; cf.ini = false;
    }
    cf.src = 'T4'; cf.ero = false;
    S3.run(id, T, U, paras, { lead: lp, fore: lp, climax: paras.length - 2 }, cf);
    return paras.join('\n\n');
  }
  function installT4() {
    var T4 = HK.Thick4;
    if (!T4 || !T4.scene || T4.scene._e3) return;
    HK.wrap(T4, 'scene', function (s0) {
      return mark(function (S, o) { var r = s0.apply(this, arguments); try { r = t4(S, o, r); } catch (e) { err(e); } return r; }, '_e3');
    });
  }
  /* (2) 催眠の盛り上がった本番・完堕ち（solo-saimin-thick.js の sexParas が SM.ero3 を呼ぶ。段落は［体］［暗示の言葉と声］［律動］［崩れ方］［絶頂］） */
  function installSaimin() {
    var SM = HK.SAIMIN;
    if (!SM || SM.ero3) return;
    SM.ero3 = function (S, p, ro, out, E) {
      try {
        if (!ro || !ro.dom || !ro.sub || !Array.isArray(out) || out.length < 5) return out;
        var T = ro.dom, U = ro.sub, mk = modeOfKind(ro.kind, T, U), cf;
        if (mk) cf = cfgOf('saimin', T, U, mk, ro.kind);
        else {
          var mode = isF(T) && isF(U) ? 'ff' : isF(T) && !isF(U) ? 'fm' : 'mf';
          cf = cfgOf('saimin', T, U, { mode: mode, ins: false }, ro.kind); cf.allow = []; cf.ini = false;
        }
        cf.src = 'big'; cf.ero = !!E; cf.tok = { T: '{T}', U: '{B}' };
        S3.run('saimin', T, U, out, { lead: 0, fore: 0, climax: out.length - 1 }, cf);
      } catch (e) { err(e); }
      return out;
    };
  }
  /* (3) マッサージの最後の体位（solo-massage.js の thick → HK.ThickVM.voice(rng, 文, 客, 客)）：文がどの型（MassageThick の fall／fallLady／…）かで向きを決める。
     施術者が住人なら HK.MassageCast.cast の住人、モブなら名前の印 {m} のモブ */
  var MT_KEY = null;
  function mtKey(t) {
    var MT = HK.MassageThick;
    if (!MT) return '';
    if (!MT_KEY || MT_KEY._n !== Object.keys(MT).reduce(function (s, k) { return s + (Array.isArray(MT[k]) ? MT[k].length : 0); }, 0)) {
      MT_KEY = {}; var n = 0;
      ['fall', 'fallLady', 'fallFF', 'top', 'topF', 'topFF', 'topSad'].forEach(function (k) { (MT[k] || []).forEach(function (sc) { if (sc && sc.t) MT_KEY[sc.t] = k; }); });
      Object.keys(MT).forEach(function (k) { if (Array.isArray(MT[k])) n += MT[k].length; });
      MT_KEY._n = n;
    }
    return MT_KEY[t] || '';
  }
  var INS_RE = /呑み込|沈め|押し入|貫|根元まで|奥まで|繋が|腰を落と|突き上げ|突き入/;
  function massage(text, h, out) {
    var key = mtKey(text);
    if (!key || CUR.scen !== 'massage' || !h || typeof out !== 'string') return out;
    var top = /^top/.test(key);
    var tg = key === 'fall' || key === 'top' || key === 'topSad' ? (top ? (isF(h) ? 'f' : 'm') : 'm') : key === 'topF' ? 'm' : 'f';
    var th = CUR.mT && CUR.mT.name ? CUR.mT : S3.mob('施術者', tg);
    var T = top ? h : th, U = top ? th : h;
    var mode = key === 'fallFF' || key === 'topFF' ? 'ff' : key === 'fallLady' || key === 'topF' ? 'fm' : 'mf';
    if (mode === 'mf' && !hasM(T)) return out;
    if (mode === 'fm' && (hasM(T) || !hasM(U))) return out;
    var ins = mode !== 'ff' && INS_RE.test(text);
    var cf = cfgOf('massage', T, U, { mode: mode, ins: ins }, key);
    if (!ins) { cf.allow = mode === 'ff' ? ['nip'] : []; }
    if (!ins && mode !== 'ff') cf.ini = false;
    cf.src = 'MT:' + key; cf.tok = { T: top ? '{a}' : '{m}', U: top ? '{m}' : '{a}' };
    var paras = out.split('\n\n');
    if (paras.length < 3) return out;
    var ci = S3.climaxIdx(paras, 2, false);
    S3.run('massage', T, U, paras, { lead: 1, fore: 1, climax: ci }, cf);
    return paras.join('\n\n');
  }
  function installMassage() {
    var TV = HK.ThickVM, MC = HK.MassageCast;
    if (TV && TV.voice && !TV.voice._e3) HK.wrap(TV, 'voice', function (v0) {
      return mark(function (rng, text, bot, top) { var r = v0.apply(this, arguments); try { r = massage(text, bot, r); } catch (e) { err(e); } return r; }, '_e3');
    });
    if (MC && MC.cast && !MC.cast._e3) HK.wrap(MC, 'cast', function (c0) {
      return mark(function (input) { var c = c0.apply(this, arguments); CUR.mT = c && c.mode === 'res' && c.T ? c.T : null; return c; }, '_e3');
    });
  }
  /* (4) バラエティ：同点最下位の罰ゲーム（pair）・楽屋に消えた二人（gone）の山場（solo-variety.js の thick → VA.thickVoice(rng, 文, 受け, 攻め)） */
  var VA_KEY = null;
  function vaKey(t) {
    var TH = HK.VARIETY && HK.VARIETY.THICK;
    if (!TH) return '';
    if (!VA_KEY) { VA_KEY = {}; Object.keys(TH).forEach(function (k) { if (Array.isArray(TH[k])) TH[k].forEach(function (x) { if (typeof x === 'string') VA_KEY[x] = k; }); }); }
    return VA_KEY[t] || '';
  }
  function variety(text, bot, top, out) {
    var key = vaKey(text);
    if (!key || CUR.scen !== 'variety' || !bot || !top || bot === top || typeof out !== 'string' || !/^(pair|gone)/.test(key)) return out;
    var k = /^pair/.test(key) ? 'pair' : 'gone';
    var T = top, U = bot, mode = /FF$/.test(key) ? 'ff' : /FM$/.test(key) ? 'fm' : 'mf';
    if (mode === 'mf' && !hasM(T)) return out;
    if (mode === 'fm' && (hasM(T) || !hasM(U))) return out;
    var ins = mode !== 'ff' && INS_RE.test(text);
    var cf = cfgOf('variety', T, U, { mode: mode, ins: ins }, k);
    if (!ins && mode !== 'ff') { cf.allow = []; cf.ini = false; }
    if (mode === 'ff') cf.allow = ['nip'];
    cf.src = 'VA:' + key; cf.tok = { T: '{t}', U: '{b}' };
    var paras = out.split('\n\n');
    if (paras.length < 3) return out;
    var ci = S3.climaxIdx(paras, 2, false);
    S3.run('variety', T, U, paras, { lead: 1, fore: 1, climax: ci }, cf);
    return paras.join('\n\n');
  }
  function installVariety() {
    var VA = HK.VARIETY;
    if (!VA || !VA.thickVoice || VA.thickVoice._e3) return;
    HK.wrap(VA, 'thickVoice', function (v0) {
      return mark(function (rng, text, bot, top) { var r = v0.apply(this, arguments); try { r = variety(text, bot, top, r); } catch (e) { err(e); } return r; }, '_e3');
    });
  }
  /* (5) 感覚遮断穴：感覚が戻ったあとの壁の向こうの住人の行為（hole-thick.js の HK.HoleThick.doer(S, 型, はまっている人, 住人)）。
     段落は［行為］［声］［崩れ方］［絶頂］（濃い：［もう一度］）。壁越しなので前立腺・結腸と専用の段だけ */
  function hole(S, kind, h, b, o, out) {
    if (!out || typeof out !== 'string' || !h || !b || (o && o.topMe)) return out;
    var T = b, U = h, mode, ins;
    if (kind === 'pen') { if (!hasM(T)) return out; mode = 'mf'; ins = true; }
    else if (kind === 'ride') { if (hasM(T) || !hasM(U)) return out; mode = 'fm'; ins = true; }
    else if (kind === 'finger') { mode = isF(T) ? (isF(U) ? 'ff' : 'fm') : 'mf'; ins = false; }
    else if (kind === 'tease') { mode = isF(T) ? (isF(U) ? 'ff' : 'fm') : 'mf'; ins = false; }
    else return out;
    var cf = cfgOf('hole', T, U, { mode: mode, ins: ins }, kind);
    if (kind === 'finger') cf.allow = ['pros'];
    else if (kind === 'tease') cf.allow = [];
    else if (kind === 'ride') cf.allow = ['pros'];
    cf.src = 'HT:' + kind;
    var paras = out.split('\n\n');
    if (paras.length < 4) return out;
    S3.run('hole', T, U, paras, { lead: 0, fore: 0, climax: 3 }, cf);
    return paras.join('\n\n');
  }
  /* 感覚の山場（HK.HoleThick.peak：遮断が壊れた・いちばん大きな波・甘イキの連続・助け出された瞬間）。壁の向こうの相手は見えないので、はまっている人だけの段（専用の段の solo）。
     段落は［戻ってきた感触］［高まり］［声］［崩れ方］［絶頂］（濃い：［もう一度］） */
  function holePeak(S, kind, h, o, out) {
    if (!out || typeof out !== 'string' || !h || CUR.scen !== 'hole' || (o && o.topMe)) return out;
    var paras = out.split('\n\n');
    if (paras.length < 5) return out;
    var cf = { mode: '', solo: true, spP: kind === 'sweet' ? 0.35 : 0.5, ini: false, allow: [], src: 'HT:peak:' + kind, kind: kind };
    S3.run('hole', null, h, paras, { lead: 4, fore: 4, climax: 4 }, cf);
    return paras.join('\n\n');
  }
  function installHole() {
    var HT = HK.HoleThick;
    if (HT && HT.peak && !HT.peak._e3) HK.wrap(HT, 'peak', function (p0) {
      return mark(function (S, kind, h, o) { var r = p0.apply(this, arguments); try { r = holePeak(S, kind, h, o, r); } catch (e) { err(e); } return r; }, '_e3');
    });
    if (!HT || !HT.doer || HT.doer._e3) return;
    HK.wrap(HT, 'doer', function (d0) {
      return mark(function (S, kind, h, b, o) { var r = d0.apply(this, arguments); try { r = hole(S, kind, h, b, o, r); } catch (e) { err(e); } return r; }, '_e3');
    });
  }
  /* (6) ダンジョン：仲間どうしの暴走（dungeon-lewd.js の DG.mateEro。男性向け）と、魔物・罠に責められる陥落・絶頂の段落（DG.lewdHook のあと） */
  function mate(S, a, b, out) {
    if (!out || typeof out !== 'string' || out.indexOf('\n\n') !== 0) return out;
    var T = a, U = b, mode = isF(T) ? (isF(U) ? 'ff' : 'fm') : 'mf';
    if (mode === 'mf' && !hasM(T)) return out;
    if (mode === 'fm' && (hasM(T) || !hasM(U))) return out;
    var cf = cfgOf('dungeon', T, U, { mode: mode, ins: mode !== 'ff' }, 'mate');
    if (mode === 'ff') cf.allow = ['nip'];
    cf.src = 'DG:mate'; cf.ero = true;
    var paras = out.slice(2).split('\n\n');
    if (paras.length < 2) return out;
    S3.run('dungeon', T, U, paras, { lead: 0, fore: 0, climax: 1 }, cf);
    return '\n\n' + paras.join('\n\n');
  }
  function dgMon(S, o) {
    if (!o || typeof o.text !== 'string' || o._e3) return;
    var X = HK.Lewd, h = S.lwWho || S.h;
    if (!h || !X || X.lv(S.env) === 'low' || (HK.DG.isTop && HK.DG.isTop(h)) || (P() && P().noGen && P().noGen(h))) return;
    var fall = o.kind === 'sys' && o.tag === '陥落', cl = o.kind === 'climax' && o.tag === '絶頂';
    if (!(fall || cl) || o.text.indexOf('\n\n') < 0) return;
    o._e3 = true;
    var paras = o.text.split('\n\n');
    var cf = { mode: '', solo: true, spP: fall ? 0.5 : 0.2, ini: false, allow: [], src: fall ? 'DG:fall' : 'DG:climax', ero: ero(), kind: S.themeKey || '' };
    var ci = S3.climaxIdx(paras, 1, false);
    S3.run('dungeon', null, h, paras, { lead: ci, fore: ci, climax: ci }, cf);
    o.text = paras.join('\n\n');
  }
  function installDungeon() {
    var DG = HK.DG;
    if (!DG) return;
    if (DG.mateEro && !DG.mateEro._e3) HK.wrap(DG, 'mateEro', function (m0) {
      return mark(function (S, a, b) { var r = m0.apply(this, arguments); try { r = mate(S, a, b, r); } catch (e) { err(e); } return r; }, '_e3');
    });
    if (DG.lewdHook && !DG.lewdHook._e3) HK.wrap(DG, 'lewdHook', function (l0) {
      return mark(function (S, o) { var r = l0.apply(this, arguments); try { if (S && CUR.scen === 'dungeon' && !HK.SAFE_ON) dgMon(S, o); } catch (e) { err(e); } return r; }, '_e3');
    });
  }
  function install() {
    if (HK.SAFE_ON === true && !HK.R18) { /* 全年齢版にはこのファイルは無い。全年齢モードは S3.run が何もしない */ }
    installT4(); installSaimin(); installMassage(); installVariety(); installHole(); installDungeon();
  }
  install();
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(install);
  S3.install = install;
})();
