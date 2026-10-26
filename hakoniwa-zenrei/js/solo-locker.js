/* 箱庭シミュレーター: 媚薬ロッカー（R18）
   媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて脱出できるか。
   一人のとき・三人以上のときは locker-crowd.js（LK.crowd）で進める。
   感度が上がると、堪え性のない人から手を出し始める。乗るか嗜めるかは関係と性格しだい。
   拘束されたままなら生殺し、動けるなら狭い中での焦らしセックス。脱出後にベッドで続きをすることも */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, ST = HK.Story, clamp = HK.clamp;
  /* 表・数の見出しの言葉（全年齢版は「高鳴り」） */
  var W_CL = '高鳴り';
  /* r18:begin */
  W_CL = '絶頂';
  /* r18:end */
  if (!LK || !ST) return;

  /* 体の関係の相手を固定している人の説明（全年齢版の言い方） */
  var W_SEXL = '心に決めた相手を';
  /* r18:begin */
  W_SEXL = '性行為の相手を';
  /* r18:end */
  var scen = {
    id: 'locker', name: '媚薬ロッカー', kicker: '1〜6人・R18', solo: true, maxCast: 6, minCast: 1,
    /* r18:begin */
    desc: '媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて無事に脱出できるか。手を出すのは誰か、乗るのか嗜めるのか、拘束されたまま生殺しか、狭い中で焦らしセックスか。出たあと、目の前のベッドで続きをするかも。一人なら、ひとりきりで耐えるか慰めるか、見回りの人に見つかるか。三人以上なら、倉庫に並ぶロッカーに分かれて押し込まれ、誰と誰がくっつくかは運しだい。※成人キャラクター向け',
    /* r18:end */
    note: '※登場人物はすべて成人として扱います。',
    unit: 'コマ', simulate: function (input) { return run(input); },
    castHint: '1〜6人。2人のときが本筋で、二人の関係（恋人・主従・ライバルなど）は「既存の関係」から決まります。まれに、自分から望んで閉じ込められている人がいます（役割で指定もできます。2人のときだけ）。1人なら一人きりのロッカー、3人以上なら倉庫のロッカーに二人ずつ・三人ずつ分かれて閉じ込められます。',
    env: [
      { id: 'bind', label: '拘束', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'both', label: '二人とも手錠' }, { v: 'one', label: '片方だけ手錠' }, { v: 'none', label: '拘束なし' }] },
      { id: 'dose', label: '媚薬の濃さ', min: 0, max: 100, def: 65, lo: 'ほのか', hi: '理性が飛ぶ' },
      { id: 'diff', label: '仕掛けの難しさ', min: 0, max: 100, def: 50, lo: '簡単', hi: '激ムズ' },
      { id: 'turns', label: '制限時間', min: 6, max: 14, def: 12, lo: '30分', hi: '70分', desc: '5分ごとに区切る。時間切れになると扉は開くが……' },
      { id: 'ev', label: 'ハプニングの頻度', min: 0, max: 100, def: 45, lo: 'たまに', hi: '頻繁' },
      { id: 'layout', label: 'ロッカーの分け方（3人以上）', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'big', label: '大きなロッカーに三人ずつ' }, { v: 'split', label: '二人ずつ別のロッカーに' }], desc: '3人以上のとき、誰と誰が同じロッカーになるかは運しだい。余った人は一人のロッカーに' },
      { id: 'finder', label: '見回りの人（1人のとき）', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（運しだい）' }, { v: 'mob', label: '来る' }, { v: 'none', label: '来ない（自力で出る）' }], desc: '1人のとき、外から扉を開けてくれる人が来るか' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'ぼかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ],
    stats: [
      { id: 'gaman', label: '我慢', desc: '高いほど媚薬に耐え、理性が長くもつ' },
      { id: 'dex', label: '器用さ', desc: '高いほど仕掛けを解くのが早い（謎解きはエゴグラムのAも効く）' },
      { id: 'luck', label: '運', desc: '高いほど、外から扉が開くなどの幸運が起きやすい' }
    ],
    actions: [
      { id: 'solve', label: '脱出に集中する', fit: function (t) { return t.a * 0.5 + t.cp * 0.4; } },
      { id: 'calm', label: '相手を落ち着かせる', fit: function (t) { return t.np * 0.8; } },
      { id: 'flow', label: '流れに任せる', fit: function (t) { return t.fc * 0.5 + t.ac * 0.4; } }
    ],
    goals: [
      { id: 'out', label: '一刻も早く出る', fit: function (t) { return t.cp * 0.5 + t.caution * 0.5; } },
      { id: 'safe', label: '相手を守る', fit: function (t) { return t.np * 0.7; } },
      { id: 'want', label: '本当は少し期待している', fit: function (t) { return t.fc * 0.4 + t.impulse * 0.4; } }
    ],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（まれに自分から閉じ込められている）', options: [{ id: 'normal', label: '巻き込まれた' }, { id: 'plotter', label: '自分から望んで閉じ込められた' }] }],
    events: []
  };
  HK.SCENARIOS.locker = scen;
  LK.SCEN = scen;
  HK.SCEN_ORDER.push('locker');

  var LV = ['touch', 'kiss', 'grope', 'oral', 'sex'];
  var REL = { lover: 'lover', mate: 'lover', fated: 'lover', fwb: 'fwb', master: 'master', crush: 'crush', friend: 'friend', best: 'friend', childhood: 'friend', buddy: 'friend', senpai: 'friend', colleague: 'colleague', classmate: 'classmate', boss: 'boss', worship: 'worship', fond: 'friend', blind: 'worship', benefactor: 'benefactor', relative: 'relative', acq: 'friend', almost: 'almost', rival: 'tension', bad: 'tension', enemy: 'tension', ex: 'ex', sibling: 'friend' };
  var REL_LABEL = { lover: '恋人', fwb: 'セフレ', master: '主従', crush: '片想い', mutual: '両片想い', friend: '知り合い', almost: '友達以上恋人未満', tension: '険悪', ex: '元恋人', stranger: '初対面', colleague: '同僚', classmate: '同級生', boss: '上司と部下', worship: '執着（信仰）', benefactor: '恩人', relative: '親族' };

  var LK_HATE_LEAD = ['狭いロッカーの中で、{b}は{a}の胸に、そっと額を預けた。', '{b}は、触れ合った{a}の手を、そのまま握ろうとした。', '{b}は、熱に浮かされた目で、{a}の顔を見上げた。'];
  function run(input) {
    /* 一人・三人以上は locker-crowd.js へ */
    if (input && input.chars && input.chars.length !== 2 && LK.crowd) return LK.crowd(input);
    var S = ST.state(input, 'locker'), rng = S.rng, env = S.env, P = S.P, lew = env.lewd || 'mid', V = HK.Voice;
    var A = P[0], B = P[1];
    var pk = function (arr) { return LK.pick(S, arr); };
    /* R18に参加しない人（noR18）の文から、喘ぎ・発情など性的な言い回しの候補を外す（残らなければ元のまま） */
    var soft = function (arr, p) { if (!p || !p.noR18 || !arr || !arr.filter) return arr; var f = arr.filter(function (l) { return !/喘ぎ|発情|濡れ|疼/.test(typeof l === 'string' ? l : l.t || ''); }); return f.length ? f : arr; };
    if (!B) { B = A; }
    /* 関係 */
    /* 同じ二人に関係を重ねられる（セフレで片想い など）。代表の関係は強いものから */
    var PRIO = ['mate', 'fated', 'lover', 'master', 'worship', 'blind', 'fwb', 'ex', 'crush', 'yan', 'almost', 'best', 'buddy', 'childhood', 'rival', 'enemy', 'bad', 'senpai', 'mentor', 'teacher', 'benefactor', 'boss', 'fond', 'colleague', 'classmate', 'friend', 'acq', 'relative', 'pparent', 'parent', 'sibprot', 'sibling', 'sibclose', 'sibbad'];
    /* 並びの表にない関係（執着など）は後ろに（先頭に来て、恋人の二人が「知り合い」になっていた） */
    var pr = function (t) { var k = PRIO.indexOf(t.type); return k < 0 ? 999 : k; };
    var tieL = (input.ties || []).filter(function (t) { return (t.a === A.i && t.b === B.i) || (t.a === B.i && t.b === A.i); }).sort(function (x, y) { return pr(x) - pr(y); });
    var tie = tieL[0];
    var rel = tie ? REL[tie.type] || REL[(HK.TIES[tie.type] || {}).like] || 'friend' : 'stranger';
    /* 表示の名前：「知り合い」に寄せた関係（親友・幼馴染・執着など）は、その関係の名前で出す */
    var RL = Object.assign({}, REL_LABEL);
    if (tie && rel === 'friend' && !/^(friend|acq)$/.test(tie.type) && HK.TIES[tie.type]) RL.friend = HK.TIES[tie.type].label;
    var master = null, servant = null, crusher = null;
    var mtie = tieL.filter(function (t) { return t.type === 'master'; })[0];
    if (mtie) { master = P[mtie.a]; servant = P[mtie.b]; }
    var crushL = tieL.filter(function (t) { return t.type === 'crush'; });
    if (crushL.length) crusher = P[crushL[0].a];
    /* 新しい関係（同僚・同級生・上司と部下・執着（信仰）・恩人・親族）：locker-ties.js（LK.TIES）。
       信仰する側は、崇める相手に自分から触れない（従者の耐え方に倣う。文と許しの出方は信仰される側の気持ちで変わる） */
    var NT = LK.TIES, nt = NT ? NT.setup(S, A, B, tieL) : null, svW = false, SV = LK.SERVANT;
    if (!mtie && nt && nt.type === 'worship') { servant = nt.u; master = nt.d; svW = true; SV = NT.sv(nt); }
    /* 両片想い：どちらからも片想いがある二人（ties.js が向きを逆にした片想い二本に開く）。片想いの枝より先に、両片想いの枝へ */
    var mutualCrush = crushL.length > 1 && crushL.some(function (t) { return t.a !== crushL[0].a; });
    if (rel === 'crush' && mutualCrush) rel = 'mutual';
    var fwbAll = tieL.some(function (t) { return t.type === 'fwb'; });
    var intimate = fwbAll || rel === 'lover';
    /* セフレで片想い：相手の気持ちで三つに分かれる */
    var fcKind = fwbAll && crusher ? (crushL.length > 1 ? 'mutual' : crushL[0].cold ? 'cold' : 'pulse') : null;
    /* 自分から閉じ込められた人 */
    var plotter = null;
    P.forEach(function (p) { var pk = (input.perChar && input.perChar[p.i] && input.perChar[p.i].pick || {}).role; if (pk === 'plotter') plotter = p; });
    if (!plotter && rng() < 0.1) plotter = crusher || (rng() < 0.5 ? A : B);
    /* 恋愛・R18にしない二人：相手を落とすために自分から閉じ込められる人はいない（役割の指定があっても、巻き込まれた側として扱う） */
    /* 恋愛相手の固定が食い違うだけで、体の関係は許されている二人（engine.js の HK.lockSexOnly）は、恋愛・R18にしない組として扱わない */
    var ngP = !!(HK.ngPair && HK.ngPair(A, B)) && !(HK.lockSexOnly && HK.lockSexOnly(A, B));
    /* 親族（恋愛：なし）・信仰（恋愛に発展：しない。支配しているとき以外）も、恋愛・R18にしない組として扱う */
    var tieNL = !ngP && !!(nt && nt.noLove), nlWhy = tieNL ? nt.nlWhy : '';
    /* きょうだい・親子など家族の関係で「恋愛：なし」の二人（ties.js の HK.tieNoLove。fam-kin.js で恋愛・R18にしない相手にも入る）も同じ。
       恋愛の関係を重ねている二人・「恋愛：あり」の家族は今までどおり */
    var famT = tieL.some(function (t) { return /^(lover|mate|fated|fwb|crush|almost|ex|master)$/.test(t.type); }) ? null : tieL.filter(function (t) { return HK.tieNoLove && HK.tieNoLove(t); })[0];
    if (famT) { tieNL = true; nlWhy = ((HK.TIES[famT.type] || {}).label || '家族') + '（恋愛にしない関係）'; }
    if (tieNL) ngP = true;
    /* R18に参加しない人（キャラの設定 noR18）がいる二人も、恋愛・R18にしない組として扱う（媚薬の熱も、性的な言い回しにしない：lockHeatSoft） */
    var r18No = A.noR18 ? A : B.noR18 ? B : null;
    if (r18No && !ngP) { ngP = true; tieNL = true; nlWhy = r18No.name + 'はR18に参加しない'; }
    /* 性行為の相手を別の人に固定している（または固定した相手がこの箱庭にいない）：体の関係にならない（pos.js の向きの判定で clash になる） */
    var sexP = !ngP && !!(HK.sexNG && HK.sexNG(A, B)), sexWho = sexP ? (HK.sexLockOut(A, B) ? A : B) : null;
    var sexWhy = sexP ? sexWho.name + 'は、' + W_SEXL + (input.chars[sexWho.sexLock] ? input.chars[sexWho.sexLock].name + 'に' : 'ほかの人に') + '決めている' : '';
    if (ngP) plotter = null;
    /* 拘束 */
    var bind = env.bind === 'random' ? rng.pick(['both', 'one', 'none', 'both']) : env.bind;
    P.forEach(function (p) {
      var o = p === A ? B : A;
      p.o = o;
      p.bound = bind === 'both';
      p.m = { heat: plotter === p ? 25 : 0, reason: clamp(70 + p.tr.cp * 15 + p.stats.gaman * 3, 40, 100), plea: 0, esc: 0 };
      p.cnt = { make: 0, refuse: 0, accept: 0, climax: 0, solve: 0, hold: 0 };
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = pick(scen.actions, pc.action, p); p.goal = pick(scen.goals, pc.goal, p);
      p.roleLabel = (plotter === p ? '自分から閉じ込められた人' : '閉じ込められた人') + '・' + RL[rel] + (svW || (nt && !mtie) ? NT.role(nt, p) : servant === p ? '（従者）' : master === p ? '（主）' : '');
      p.sens = (0.6 + (6 - (p.stats.gaman || 3)) * 0.1 - p.tr.cp * 0.15) * (0.7 + rng() * 0.7);
    });
    function pick(list, id, p) { if (id && id !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return HK.weighted(rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); }); }
    var boundOne = null;
    /* 受け攻め：向きの決まらない二人（攻め×攻めなど）は体の関係にならない。女性どうしは、いちもつの描写を使わない */
    var Pos = HK.Pos, clash = !!(Pos && Pos.clash(A, B)) || tieNL, ff = !!(Pos && Pos.ff(A, B)), R18 = !HK.SAFE_ON;
    /* 敵対している二人（関係がライバル・不仲・敵対）：攻めの側から強引に手を出し、受けは口では嫌がるが、まんざらではない応じ方をする（hate-sex-r18.js。R18版のみ） */
    if (!S.ties) S.ties = (HK.Story && HK.Story.tiesOk ? HK.Story.tiesOk(S.P, input.ties) : input.ties || []);
    var HSX = R18 && HK.HateSex, hateP = !!(HSX && rel === 'tension' && !ngP && !clash && HSX.hostile(S, A, B));
    function hardTop(p) { return !!(Pos && Pos.hardTop(p, p && p.o)); }
    if (bind === 'one') {
      boundOne = plotter ? plotter.o : rng() < 0.5 ? A : B;
      /* 自分で攻めを選んだ人は、片方だけの拘束の側にしない（拘束されて何かをされる側にしない）。二人とも攻めなら二人とも手錠に */
      if (hardTop(boundOne)) { if (!hardTop(boundOne.o)) boundOne = boundOne.o; else { bind = 'both'; boundOne = null; A.bound = B.bound = true; } }
      if (boundOne) boundOne.bound = true;
    }
    var keys = ['heat', 'reason', 'plea', 'esc'];

    /* 仕掛けの順番 */
    var gimmicks = [];
    if (bind !== 'none') gimmicks.push(LK.GIMMICK.filter(function (g) { return g.bind; })[0]);
    var others = LK.GIMMICK.filter(function (g) { return !g.bind && !(ngP && g.lewd); });   /* 恋愛・R18にしない二人には「キスで開く扉」を出さない */
    var first = rng.pick(others); gimmicks.push(first);
    if (rng() < 0.5 + env.diff / 200) gimmicks.push(rng.pick(others.filter(function (g) { return g !== first; })));
    var gi = 0, prog = 0, escaped = false, escTurn = -1, how = '';
    var pair = { level: -1, sexIn: false, acts: 0, refusedHard: false };
    var v0 = { a: A.name, b: B.name };

    /* 拘束の文：最初の仕掛けは「手錠の鍵」なので、手錠と書いてある文を優先する */
    function bindLines() { var l = LK.BIND[bind], c = l.filter(function (x) { return /手錠/.test(x); }); return bind === 'none' || !c.length ? l : c; }
    /* ---------- 目覚め ---------- */
    ST.step(S, '閉じ込められた');
    ST.budget(S, 3);
    ST.say(S, { actors: [A, B], tag: '目覚め', text: ST.fmt(pk(LK.INTRO), v0) + ST.fmt(pk(bindLines()), boundOne ? { a: boundOne.name, b: boundOne.o.name } : v0) + (HK.Attr && HK.Attr.raceIntro ? HK.Attr.raceIntro([A, B], 'trapped', S) : ''), why: '二人の関係：' + RL[rel] + '／拘束：' + { both: '二人とも', one: boundOne ? boundOne.name + 'だけ' : '', none: 'なし' }[bind] });
    ST.say(S, { kind: 'phase', text: pk(LK.SPEAKER) + '（仕掛け：' + gimmicks.map(function (g) { return g.name; }).join('→') + '）' });
    /* 体の関係にならない二人・相手が自分で攻めを選んだ人のときは、手を取って触れさせる文を使わない */
    var plotPush = plotter ? LK.PLOT.push.filter(function (l) { return !((clash || (hardTop(plotter.o) && !hardTop(plotter))) && /胸に押し当て|腰に回させ|任せて/.test(l)); }) : [];
    if (nt) NT.wake(S, nt);
    if (plotter) { var o = ST.say(S, { actors: [plotter], tag: '思惑', text: ST.fmt(pk(plotPush.length ? plotPush : LK.PLOT.push), { a: plotter.name, b: plotter.o.name }), why: plotter.name + 'は、自分から望んでここにいる' + (rel === 'mutual' ? '（' + plotter.o.name + 'への片想い。実は向こうも同じ）' : crusher === plotter ? '（' + plotter.o.name + 'への片想い）' : ''), mag: 20 }); ST.key(S, o, plotter.name + 'の思惑'); }
    ST.snap(S, keys);

    function stage(p) { return p.m.heat >= 85 ? 3 : p.m.heat >= 60 ? 2 : p.m.heat >= 35 ? 1 : 0; }
    /* 攻めの声（受けの喘ぎを攻めに使わない）。k は moan／edge／hush */
    function topV(p, k) {
      var T = LK.TOPV && LK.TOPV[k];
      if (T && k === 'moan') T = T[ff ? 'ff' : Pos && Pos.isF(p) ? 'fm' : 'ins'];
      return T ? T[p.persona] || T.gentle : null;
    }
    /* top：その人が攻めとして果てる */
    /* R18の描写の設定（lewd-unify.js）：男性向けは、相手が応じた行為（accept）と、扉が開いたあとの夜だけ（eroNow の間）。♡の喘ぎ（ero-kit.js） */
    var LX = HK.Lewd, lcf = LX && LX.conf('locker'), eroOn = !!(lcf && HK.Ero && HK.Ero.on(S) && HK.ThickEro && lew !== 'low'), eroNow = false;
    /* 小説調の果てる声は喘ぎの辞書（moan-engine.js の HK.Moan.say。R18版だけ）から。ロッカーの中は声を殺す場面（open＝扉が開いたあとの寝台）。
       HK.Moan が無い（全年齢版）・ぼかすときは元の表（Voice.CLIMAX・攻めの声） */
    function moan(p, top, open) {
      if (eroOn && eroNow) { var d0 = p.eroDom; p.eroDom = !!top; var m = HK.Ero.moan(S, p, top ? 1 : 2); p.eroDom = d0; return p.name + '「' + m + '」'; }
      var l = lew === 'low' || !V ? null : top ? topV(p, 'moan') : V.CLIMAX[p.persona];
      if (lew !== 'low' && HK.Moan && HK.Moan.say) { var mv = HK.Moan.say(S, p, top ? 'top' : 'climax', { hush: !open, novel: true, top: top ? null : p.o }, l && l.length ? l : null); return mv ? p.name + '「' + mv + '」' : ''; }
      return l && l.length ? p.name + '「' + pk(l) + '」' : '';
    }
    function say2(p, T) { var l = T[p.persona] || T.gentle; return p.name + pk(l); }
    function climax(p, t, top) { p.cnt.climax++; p.m.plea = 25; p.m.heat = clamp(p.m.heat - 10, 0, 100); return t + moan(p, top); }
    function canHands(p) { return !p.bound; }
    /* ロッカーの中でいちばん進んだ段階の名前（女性どうしは「挿入」と呼ばない） */
    function actLabel(lv) { var k = LV[lv]; return ff && LK.FF_ACT && LK.FF_ACT[k] && LK.FF_ACT[k].label || LK.ACT[k].label; }
    /* 向きの決まらない二人：手が伸びかけても、性格に合わせたやり方で踏みとどまる */
    function clashType(p) {
      var t = p.tr, sc = { solve: t.cp * 0.6 + t.a * 0.3 + (p.goal && p.goal.id === 'out' ? 0.2 : 0) + (p.action && p.action.id === 'solve' ? 0.15 : 0), care: t.np * 0.85 + (p.goal && p.goal.id === 'safe' ? 0.2 : 0), shy: t.ac * 0.85, joke: t.fc * 0.8, endure: 0.5 };
      return Object.keys(sc).reduce(function (x, k) { return sc[k] > sc[x] ? k : x; }, 'endure');
    }
    function holdClash(a, b) {
      a.cnt.hold++; a.m.reason = clamp(a.m.reason + 3, 0, 100); a.m.plea = clamp(a.m.plea + 8, 0, 90);
      if (a.cnt.hold > 3 && rng() < 0.5) return;
      var ty = clashType(a), C = LK.CLASH;
      ST.sayB(S, { actors: [a, b], tag: C.tag[ty], text: ST.fmt(pk(C.hold[ty]), { a: a.name, b: b.name }) + (rng() < 0.5 ? ST.fmt(pk(C.reply), { a: a.name, b: b.name }) : ''), why: a.name + 'は発情していた（' + Math.round(a.m.heat) + '）が、' + b.name + (ngP ? 'とは' + (tieNL ? nlWhy + 'の二人' : '恋愛・R18にしない組') + 'なので、手は出さなかった（' : sexP ? 'とは体の関係にならない（' + sexWhy + '）ので、手は出さなかった（' : 'とは受け攻めの向きが合わない二人なので、手は出さなかった（') + { solve: 'CP・A', care: 'NP', shy: 'AC', joke: 'FC', endure: '我慢' }[ty] + '）', mag: 16 }, a.name + 'は手を出さずに耐えた', a.cnt.hold === 1);
    }
    /* 女性の攻め（t）×男性の受け（u）か：女性が跨る書き方にする */
    function fmPair(t, u) { return !!(Pos && !ff && Pos.isF(t) && !Pos.isF(u)); }
    /* 手錠の人に、手を使う文（H:攻めの手／B:受けの手）を使わない */
    /* 手錠の人の手を使う文（応じる・嗜める・なだめる）は使わない。全部消えるときは元のまま */
    function hands(arr, a, b) {
      var r = arr.filter(function (l) { return !(a.bound && /\{a\}の(手|指)/.test(l)) && !(b.bound && (/\{b\}の(手|指)/.test(l) || /\{b\}は[^。「]*(手で|手を|指で|手首を|両手)/.test(l))); });
      return r.length ? r : arr;
    }
    function hb(arr, tp, bt) { return arr.filter(function (l) { return !(/^H:/.test(l) && tp.bound) && !(/^B:/.test(l) && bt.bound); }).map(function (l) { return l.replace(/^[HB]:/, ''); }); }
    function contPool(k, tp, bt) { var C = LK.CONT, m = ff ? 'ff' : fmPair(tp, bt) ? 'fm' : 'ins'; return hb((C[m][k] || []).concat(C.any[k] || []), tp, bt); }
    /* ロッカーの中で繋がる（一回目・二回目）。繋がっているあいだは、5分ごとに一つだけ「続き」の出来事を書く */
    function startConn(tp) { pair.conn = true; pair.top = tp; pair.bot = tp.o; pair.rounds = (pair.rounds || 0) + 1; pair.done = false; pair.hushed = false; pair.lowT = 0; }
    function contTurn() {
      var tp = pair.top, bt = pair.bot, C = LK.CONT, ph, vv = { a: tp.name, b: bt.name };
      if (pair.done) ph = 'after';
      else {
        bt.m.plea += (14 + rng() * 12) * bt.sens; tp.m.plea += (10 + rng() * 10) * tp.sens;
        P.forEach(function (p) { p.m.heat = clamp(p.m.heat + 3, 0, 100); });
        ph = bt.m.plea >= 100 || tp.m.plea >= 100 ? 'climax' : !pair.hushed && rng() < 0.3 ? 'hush' : bt.m.plea >= 70 ? 'edge' : 'move';
        /* ぼかすときは、一コマ置いてすぐ果てる（ぼかした文を何コマも並べない） */
        if (lew === 'low') { ph = pair.lowT ? 'climax' : 'move'; pair.lowT = 1; }
      }
      var t = lew === 'low' ? pk(C.low) : ST.fmt(pk(contPool(ph, tp, bt)), vv);
      if (ph === 'hush') {
        pair.hushed = true; bt.m.reason = clamp(bt.m.reason + 4, 0, 100);
        var hl = lew !== 'low' && rng() < 0.65 && topV(tp, 'hush');
        if (hl) t += tp.name + '「' + pk(hl) + '」';
      } else if (ph === 'edge' && lew !== 'low' && V && V.EDGE && V.EDGE[bt.persona] && rng() < 0.6) t += bt.name + '「' + pk(V.EDGE[bt.persona]) + '」';
      else if (ph === 'climax') { t = climax(tp, climax(bt, t), true); pair.done = true; }
      else if (ph === 'after') { pair.conn = false; pair.done = false; pair.rest = 1 + rng.int(2); P.forEach(function (p) { p.m.reason = clamp(p.m.reason + 8, 0, 100); p.rxCool = true; }); }
      var tag = ff && ph === 'move' ? '肌を重ねたまま' : C.tag[ph];
      ST.sayB(S, { actors: [tp, bt], tag: tag, text: t, why: { move: '繋がったまま、狭い箱の中で', hush: '外の物音に、二人とも動きを止めた', edge: bt.name + 'が限界に近い', climax: 'ロッカーの中で、二人とも果てた', after: '一度果てて、少しだけ正気が戻った（理性 +8）' }[ph] + '（快感 ' + tp.name + ' ' + Math.round(Math.min(100, tp.m.plea)) + '・' + bt.name + ' ' + Math.round(Math.min(100, bt.m.plea)) + '）', mag: ph === 'climax' ? 34 : 18, kind: 'climax' }, tp.name + 'と' + bt.name + '：' + tag, ph === 'climax');
    }
    /* 自分から閉じ込められた人が、打ち明ける／見抜かれる */
    function plotEvent() {
      var po = plotter.o, caught = (plotter.sabotage || 0) >= 1 && rng() < 0.15 + po.tr.a * 0.3;
      if (!caught && rng() > 0.18) return;
      pair.plotShown = true;
      var soft = (!caught && ({ lover: 1, almost: 1, fwb: 1, mutual: 1 }[rel] || crusher === po || po.m.heat >= 65)) || !!(nt && NT.plotSoft(nt, po)), v = { a: plotter.name, b: po.name };
      var rv = (caught ? LK.PLOT.caught : LK.PLOT.reveal).filter(function (l) { return !plotter.bound || !/手を|指を/.test(l); });
      if (soft) po.m.heat = clamp(po.m.heat + 8, 0, 100); else { po.m.reason = clamp(po.m.reason + 15, 0, 100); plotter.sabotage = 99; pair.plotMad = true; }
      ST.key(S, ST.sayB(S, { actors: [plotter, po], tag: caught ? '見抜かれた' : '打ち明けた', text: ST.fmt(pk(rv), v) + ST.fmt(pk(LK.PLOT.react[soft ? 'soft' : 'mad']), v), why: caught ? po.name + 'は、' + plotter.name + 'の細工に気づいた（A）' : plotter.name + 'は、自分から仕組んだことを打ち明けた', mag: 26 }, '', true), caught ? plotter.name + 'の細工がばれた' : plotter.name + 'が仕組んだと打ち明けた');
    }

    /* ---------- 5分ごと ---------- */
    for (var turn = 0; turn < env.turns && !escaped; turn++) {
      ST.step(S, ((turn + 1) * 5) + '分');
      S.step = turn;
      ST.budget(S, 3);
      var logAt = S.log.length;
      /* ハプニング */
      if (rng() < env.ev / 100 * 0.5) {
        var calm = rng() < 0.3;
        /* 冷める出来事：応じ方の段階を下げてよい（このあと拒んでも、はっきり拒む文でよい） */
        if (calm) P.forEach(function (p) { p.m.reason = clamp(p.m.reason + 12, 0, 100); p.m.heat = clamp(p.m.heat - 6, 0, 100); p.rxCool = true; });
        else P.forEach(function (p) { p.m.heat = clamp(p.m.heat + 10, 0, 100); });
        ST.sayB(S, { actors: [A, B], tag: calm ? '一息' : 'ハプニング', text: ST.fmt(pk(calm ? LK.CALM : LK.SURGE), v0), why: calm ? '理性 +12' : '二人とも発情 +10' }, calm ? '少しだけ正気に戻った' : 'ガスが濃くなった');
      }
      /* ガスが回る */
      P.forEach(function (p) {
        /* 発情の段階の知らせは、これまでに知らせたいちばん上の段階を超えたときだけ（いったん冷めて、また上がっても繰り返さない） */
        var before = Math.max(stage(p), p.gasShown || 0);
        p.m.heat = clamp(p.m.heat + (4 + env.dose * 0.1 + rng() * 4) * p.sens, 0, 100);
        p.m.reason = clamp(p.m.reason - (3 + p.m.heat * 0.13 - (p.stats.gaman || 3) * 0.7 - p.tr.cp * 2), 0, 100);
        var after = stage(p);
        if (after > before) p.gasShown = after;
        if (after > before) ST.sayB(S, { actors: [p], tag: ['', '火照り', '発情', '限界'][after], text: ST.fmt(pk(((p.noR18 || !LK.GAS) && LK.GAS_SOFT ? LK.GAS_SOFT : LK.GAS)[after]), { a: p.name, b: p.o.name }), why: p.name + 'の発情 ' + Math.round(p.m.heat) + '・理性 ' + Math.round(p.m.reason) + '（我慢 ' + p.stats.gaman + '）', mag: after * 6 }, p.name + 'の発情が進んだ', after >= 3);
      });
      /* 敵視（hate-kit.js）：狭いロッカーの中で、一方が近づき、一方が嫌悪する */
      if (HK.HateKit && rng() < 0.3) {
        if (!S.ties) S.ties = (HK.Story && HK.Story.tiesOk ? HK.Story.tiesOk(S.P, input.ties) : input.ties || []);
        var HKt = HK.HateKit, hp = HKt.pairs(S, [A, B])[0];
        if (hp) {
          var hr = hp.st === 'love' ? HKt.loveGap(S, hp.a, hp.b, ST.fmt(pk(LK_HATE_LEAD), { a: hp.a.name, b: hp.b.name })) : hp.st === 'hate' ? HKt.quarrel(S, hp.a, hp.b) : HKt.style(hp.a) === 'active' ? HKt.harass(S, hp.a, hp.b) : HKt.snub(S, hp.a, hp.b);
          /* 嫌悪している側は、理性で踏みとどまる。近づいた側は、拒まれて熱を持て余す */
          hp.a.m.reason = clamp(hp.a.m.reason + 6, 0, 100);
          if (hp.st === 'love') hp.b.m.heat = clamp(hp.b.m.heat + 4, 0, 100);
          ST.sayB(S, { actors: [hp.a, hp.b], tag: hp.st === 'love' ? '片恋と嫌悪' : '敵視', text: hr.text, why: hr.why + '（' + hp.a.name + 'の理性 +6）' }, hp.a.name + 'と' + hp.b.name + 'が揉めた');
        }
      }
      if (plotter && !pair.plotShown && turn >= 2 && !pair.conn) plotEvent();
      /* 両片想い：お互いに想っているのに、相手は何とも思っていないと思い込んで、すれ違う（一度だけ） */
      if (rel === 'mutual' && LK.MUT && !pair.mutShown && turn >= 1 && !pair.conn && rng() < 0.4) {
        pair.mutShown = true;
        var mf = rng() < 0.5 ? A : B;
        ST.sayB(S, { actors: [A, B], tag: '両片想い', text: ST.fmt(pk(LK.MUT.inside), { a: mf.name, b: mf.o.name }), why: '両片想い：二人とも相手を想っているのに、相手は自分を何とも思っていないと思い込んでいる', mag: 14 }, A.name + 'と' + B.name + 'がすれ違った');
      }
      /* 新しい関係：閉じ込められたときの反応・関係を保つ・発展させる（locker-ties.js）。恩返しは仕掛けを進める */
      if (nt) { var ntE = NT.turn(S, nt, { turn: turn, pair: pair, ngP: ngP }); if (ntE && ntE.prog && gimmicks[gi] && !gimmicks[gi].lewd) prog = clamp(prog + ntE.prog, 0, 99); }
      /* 手を出す（一コマに受け入れる出来事は一つまで。繋がっているあいだは、その続きだけ） */
      var lewdNow = false;
      var order = rng() < 0.5 ? [A, B] : [B, A];
      if (pair.conn) { contTurn(); lewdNow = true; order = []; }
      else if (pair.rest > 0) { pair.rest--; order = []; }
      for (var k = 0; k < order.length; k++) {
        var a = order[k], b = a.o;
        var urge = (a.goal && a.goal.id === 'want' ? 0.12 : a.goal && a.goal.id === 'out' ? -0.08 : 0) + (a.action && a.action.id === 'flow' ? 0.08 : a.action && a.action.id === 'solve' ? -0.06 : 0) + a.m.heat / 100 + a.tr.impulse * 0.35 + a.tr.fc * 0.15 - a.m.reason / 130 - a.tr.cp * 0.12 + (plotter === a ? 0.45 : 0) + ({ lover: 0.15, fwb: 0.2, almost: 0.1, crush: crusher === a ? 0.2 : 0, mutual: 0.2, tension: -0.1 }[rel] || 0) + (fwbAll && rel !== 'fwb' ? 0.2 : 0) + (crusher === a && rel !== 'crush' && rel !== 'mutual' ? 0.15 : 0);
        /* 敵対している二人：攻めの側は、苛立ちごとぶつけるように手を出しやすい */
        if (hateP && HSX.order(S, a, b)[0] === a) urge += 0.35;
        if (nt) urge += NT.urge(nt, a);
        /* 本命がほかにいる人は、一途に踏みとどまる（媚薬の熱が限界なら妥協する） */
        if (a.honmei != null && a.honmei !== b.i) urge -= HK.honmeiDesperate && HK.honmeiDesperate(null, a) ? 0.05 : 0.3;
        /* 従者は主に手を出さないよう耐える */
        if (servant === a && plotter !== a) {
          var order2 = !clash && !a.ordered && master.m.heat > 70 && master.tr.cp + master.tr.fc > (svW ? NT.ordTh(nt) : 0.8) && rng() < 0.5;
          if (order2) { a.ordered = true; a.m.reason = 0; ST.sayB(S, { actors: [a, b], tag: svW ? (nt.dom ? '命令' : '許し') : '主の許し', text: ST.fmt(pk(SV.order), { a: a.name, b: b.name }), why: (svW ? '信仰される側の' : '主の') + b.name + 'も発情していた（' + Math.round(b.m.heat) + '）', mag: 26 }, b.name + 'が' + (svW && nt.dom ? '命じた' : '許しを与えた'), true); urge += 0.6; }
          else if (urge > 0.4 && a.m.reason > 8 + a.tr.ac * 10) {
            a.cnt.hold++; a.m.reason = clamp(a.m.reason - 6, 0, 100);
            if (a.cnt.hold <= 2) ST.sayB(S, { actors: [a, b], tag: svW ? '崇める相手に触れない' : '耐える従者', text: ST.fmt(pk(SV.hold), { a: a.name, b: b.name }), why: (svW ? '信仰（崇める相手には、許されるまで触れない' : '主への忠誠（CP') + '・理性 ' + Math.round(a.m.reason) + '）', mag: 20 }, a.name + 'は耐えた', a.cnt.hold === 1);
            continue;
          } else if (urge > 0.4 && clash) { holdClash(a, b); continue; }
          else if (urge > 0.4 && !a.broke) { a.broke = true; ST.key(S, ST.sayB(S, { actors: [a, b], tag: '理性が切れた', text: ST.fmt(pk(SV.break.filter(function (l) { return !hardTop(b) || !/押しつけ/.test(l); })), { a: a.name, b: b.name }), why: a.name + 'の理性が尽きた（耐えた回数 ' + a.cnt.hold + '）', mag: 34 }, '', true), a.name + (svW ? 'が崇める相手に手を伸ばした' : 'が主に手を出した')); urge += 0.3; }
        }
        /* 片方だけ発情 */
        if (a.m.heat >= 70 && b.m.heat < 40 && urge > 0.5 && rng() < 0.6) {
          var kind = b.tr.np > 0.6 ? 'give' : b.m.heat > 25 || b.tr.fc > 0.6 ? 'tempted' : 'help';
          /* 手で楽にするのは、体の関係になれる二人で、楽にされる側が自分で攻めを選んだ人でないときだけ */
          if (kind === 'give' && (clash || hardTop(a))) kind = 'help';
          if (kind === 'tempted' && ngP) kind = 'help';   /* 恋愛・R18にしない二人は、つられない */
          if (kind === 'tempted') b.m.heat = clamp(b.m.heat + 15, 0, 100);
          /* 恋愛・R18にしない二人は、抱き寄せる・胸に手を当てさせる・額を合わせる・耳元で囁く なだめ方をしない */
          var onePool = LK.ONE[kind].filter(function (l) { return !ngP || !/抱き寄せ|胸に当て|額を合わせ|耳元/.test(l); });
          var tt = ST.fmt(pk(hands(onePool.length ? onePool : LK.ONE[kind], a, b)), { a: a.name, b: b.name });
          if (kind === 'give') { a.m.plea += 50; if (a.m.plea >= 100) tt = climax(a, tt); pair.acts++; lewdNow = true; }
          ST.sayB(S, { actors: [a, b], tag: { help: 'なだめる', give: '手で楽に', tempted: 'つられる' }[kind], text: tt, why: a.name + 'だけが発情していた（' + Math.round(a.m.heat) + ' 対 ' + Math.round(b.m.heat) + '）／' + b.name + 'の' + (kind === 'give' ? 'NP' : kind === 'tempted' ? '揺らぎ' : '冷静さ'), mag: 18 }, b.name + 'が' + a.name + 'を' + { help: 'なだめた', give: '手で楽にした', tempted: 'つられかけた' }[kind]);
          continue;
        }
        /* 恋愛相手を別に決めている人は、ほとんど手を出さない */
        if (HK.lockOut(a, b)) { urge -= 0.45; if (urge > 0.3 && !a.lockSaid) { a.lockSaid = true; ST.sayB(S, { actors: [a, b], tag: '心に決めた人', text: ST.fmt(pk(LK.LOCKED || ['{a}は{b}の肩を押し返した。「……ごめん。心に決めた人がいるから」']), { a: a.name, b: b.name }), why: a.name + 'は恋愛の相手を決めている（' + b.name + 'ではない）', mag: 18 }); continue; } }
        if (urge < 0.36 + rng() * 0.3) continue;
        /* 受け攻め：向きの決まらない二人は、手を出さずに耐える */
        if (clash) { holdClash(a, b); continue; }
        /* どこまでするか */
        /* セフレや恋人は、段階を飛ばしやすい（慣れた相手） */
        var lv = Math.min(pair.level + (intimate && pair.level >= 0 && rng() < 0.5 ? 2 : 1), LK.MAXLV || 4);
        if (!canHands(a) && !canHands(b) && lv >= 2) {
          var nm = Pos ? Pos.order(a, b, [a, b]) : [a, b];
          pair.nama = (pair.nama || 0) + 1;
          if (pair.nama > 2 && rng() < 0.5) break;
          /* 攻めの声は攻めの言い回しで（受けの「やめろ」を攻めに言わせない） */
          var ed = a === nm[0] ? topV(a, 'edge') : V && V.EDGE && V.EDGE[a.persona];
          ST.sayB(S, { actors: [a, b], tag: '生殺し', text: ST.fmt(pk(LK.NAMA), { a: nm[0].name, b: nm[1].name }) + (ed && lew !== 'low' ? a.name + '「' + pk(ed) + '」' : ''), why: '二人とも拘束されたまま発情（' + Math.round(a.m.heat) + '・' + Math.round(b.m.heat) + '）', mag: 24 }, '二人は生殺し');
          a.m.plea = clamp(a.m.plea + 20, 0, 95); b.m.plea = clamp(b.m.plea + 20, 0, 95); lewdNow = true;
          break;
        }
        /* ロッカーの中で一度果てたあと：もう一度（二回まで）か、名残だけ */
        if (pair.sexIn && lv === 4) {
          var tq = pair.top, bq = pair.bot;
          if ((pair.rounds || 0) >= 2 || lew === 'low') {
            if (pair.lingerAt != null && turn - pair.lingerAt < 2 || rng() < 0.5) continue;
            pair.lingerAt = turn; lewdNow = true;
            ST.sayB(S, { actors: [tq, bq], tag: LK.CONT.tag.linger, text: ST.fmt(pk(contPool('linger', tq, bq)), { a: tq.name, b: bq.name }), why: '媚薬はまだ効いていたが、体の方が先に限界だった' }, tq.name + 'と' + bq.name + 'は寄り添っていた');
            break;
          }
          var wq = b.m.heat / 100 + ({ lover: 0.5, fwb: 0.45, almost: 0.3 }[rel] || 0.1) - b.m.reason / 160 + (rng() - 0.5) * 0.3;
          if (wq < 0.4) { a.m.reason = clamp(a.m.reason + 6, 0, 100); continue; }
          startConn(tq); lewdNow = true; pair.acts++;
          ST.sayB(S, { actors: [tq, bq], tag: LK.CONT.tag.again, text: ST.fmt(pk(contPool('again', tq, bq)), { a: tq.name, b: bq.name }), why: '一度果てても、媚薬の熱は引かなかった（' + a.name + 'の発情 ' + Math.round(a.m.heat) + '）', mag: 28, kind: 'climax' }, tq.name + 'と' + bq.name + '：もう一度', true);
          break;
        }
        /* これ以上先へ進めない段階（全年齢版の「抱きしめる」など）を、毎コマ繰り返さない */
        if (lv <= pair.level && pair.lastAct != null && turn - pair.lastAct < 2 && rng() < 0.7) continue;
        var act = LK.ACT[LV[lv]];
        a.cnt.make++;
        var w = b.m.heat / 100 + ({ lover: 0.5, fwb: 0.45, almost: 0.3, crush: crusher === b ? 0.45 : -0.05, mutual: 0.45, friend: 0, tension: -0.3, ex: 0.05, stranger: -0.1, master: servant === b ? 0.35 : 0.2 }[rel] || 0) + b.tr.np * 0.15 + b.tr.ac * 0.1 - b.tr.cp * 0.25 - b.m.reason / 160 + (plotter === b ? 0.8 : 0) + (fwbAll && rel !== 'fwb' ? 0.35 : 0) + (fcKind === 'mutual' ? 0.2 : 0) + (crusher === b && rel !== 'crush' && rel !== 'mutual' ? 0.2 : 0) + (rng() - 0.5) * 0.3;
        if (HK.lockOut(b, a)) w -= 0.5;
        if (nt) w += NT.accW(nt, a, b);
        var resp = w > 0.55 ? 'accept' : w > 0.32 ? 'passive' : 'refuse';
        /* 受け攻め：挿入では、仕掛けた側が攻めか受けかで書き分ける */
        var aTop = !Pos || Pos.order(a, b, LV[lv] === 'sex' ? Pos.fbFor(a, b) : [a, b])[0] === a;
        /* 仕掛けたのが受けの側で、相手が「自分で攻めを選んだ人」・女性どうし・手の使えない攻め（挿入）のときは、
           受けは誘うだけにして、そこから先は攻めが動く（攻めを受け身にしない／拘束された攻めに跨らない） */
        /* 女性の攻め×男性の受けで、受けの男性から仕掛けた挿入も、女性が跨る形に（男性を跨らせない） */
        var swap = R18 && !aTop && ((lv >= 2 && (hardTop(b) || ff)) || (lv === 4 && (b.bound || fmPair(b, a))) || (hardTop(b) && b.bound));
        var ax = swap ? b : a, bx = swap ? a : b, axTop = swap || aTop;   /* 実際に動く側・受ける側 */
        var FFA = ff && LK.FF_ACT && LK.FF_ACT[LV[lv]];
        var FMA = !FFA && LV[lv] === 'sex' && axTop && fmPair(ax, bx) && LK.FM_ACT && LK.FM_ACT.sex;
        var actPool = FFA ? (ax.bound ? FFA.bound : FFA.t) : FMA ? (ax.bound ? FMA.bound : FMA.t) : LV[lv] === 'sex' ? (ax.bound ? (axTop ? act.boundTop : act.bound) : (axTop ? act.t : act.ride)) : (ax.bound ? act.bound : act.t);
        /* ノリノリの受けは、自分から跨る・誘う（相手が拘束されていないときだけ） */
        var noriAct = !swap && !FFA && LV[lv] === 'sex' && !aTop && !b.bound && Pos && Pos.nori(a) && rng() < 0.6 && (a.bound ? act.noriBound : act.nori);
        if (noriAct) actPool = noriAct;
        var vA = { a: ax.name, b: bx.name }, vT = { a: a.name, b: b.name };
        var t = swap ? ST.fmt(pk(LK.TEMPT), vT) : ST.fmt(pk(actPool), vA);
        /* 敵対している二人で、攻めの側から仕掛けたとき：受けは口では嫌がるが、拒みきらない */
        var hateNow = hateP && !swap && aTop && resp !== 'accept' && b.m.heat >= 15;
        if (hateNow) resp = 'passive';
        if (resp === 'refuse') {
          b.cnt.refuse++; a.m.reason = clamp(a.m.reason + 6, 0, 100);
          /* 一度は応じた相手が、冷める出来事なしに拒むときは「ここから先だけ止める」文に（応じ方を行ったり来たりさせない） */
          var lateR = b.rxLv >= 1 && !b.rxCool && LK.REFUSE_LATE;
          t += ST.fmt(pk(hands(lateR ? LK.REFUSE_LATE : LK.REFUSE, a, b)), { a: a.name, b: b.name }) + (rng() < 0.7 ? say2(b, lateR && LK.REFUSE_SAY_LATE ? LK.REFUSE_SAY_LATE : LK.REFUSE_SAY) : '');
          if (b.cnt.refuse >= 2 && lv >= 2) pair.refusedHard = true;
          /* 信仰する側は、崇める相手に拒まれても想いを捨てない */
          if (nt) t += NT.refused(S, nt, a, b);
          ST.sayB(S, { actors: [a, b], tag: '嗜めた', text: t, why: a.name + 'が「' + actLabel(lv) + '」を仕掛けた（発情 ' + Math.round(a.m.heat) + '）／' + b.name + (lateR ? 'は、そこから先だけ止めた（さっきは応じていた／理性 ' : 'は嗜めた（理性 ') + Math.round(b.m.reason) + '・CP）', mag: 18 }, b.name + 'が嗜めた', pair.acts === 0);
          continue;
        }
        b.cnt.accept++; pair.level = lv; pair.acts++; pair.lastAct = turn; lewdNow = true;
        /* 応じ方の段階（1 流される・2 乗る）。一度乗った相手が流されるときは、拒みかける文ではなく応じる文で書く */
        var rxNow = resp === 'accept' ? 2 : 1, rx0 = b.rxCool ? 0 : b.rxLv || 0, giveIn = !swap && b.cnt.refuse > 0 && !b.gaveIn && LK.GIVEIN;
        var rxText = !swap && resp === 'passive' && rx0 >= 2 ? 'accept' : resp;
        b.rxLv = Math.max(rx0, rxNow); b.rxCool = false; if (giveIn) b.gaveIn = true;
        eroNow = resp === 'accept';
        if (swap) t += ST.fmt(pk(LK.TAKE[b.bound ? 'bound' : 'free']), vT) + ST.fmt(pk(actPool), vA);
        else if (hateNow) t += HSX.react(S, a, b, lv);
        else t += (giveIn ? ST.fmt(pk(hands(giveIn, a, b)), { a: a.name, b: b.name }) : '') + ST.fmt(pk(hands((rxText === 'accept' ? LK.ACCEPT : LK.PASSIVE).filter(function (x) { return (aTop && !ff && !fmPair(a, b)) || !/受け入れ/.test(x); }), a, b)), { a: a.name, b: b.name }) + (resp === 'accept' && rng() < 0.6 ? say2(b, LK.ACCEPT_SAY) : '');
        /* キスの最中の声（R18版のみ。moan-engine.js の共通の声 k0。言葉のない声）：受ける側が一つ。描写「ぼかす」・全年齢では足さない */
        if (R18 && lew !== 'low' && LV[lv] === 'kiss' && HK.Moan && HK.Moan.pick && !bx.noR18 && rng() < 0.6) t += bx.name + '「' + HK.Moan.pick(S, bx, 'k0', {}) + '」';
        /* 最初の一回は、二人の関係で受け止め方が変わる */
        var RF = LK.REL && LK.REL.first[rel];
        if (pair.acts === 1 && RF && rng() < 0.75) t += ST.fmt(pk(RF), { a: a.name, b: b.name, c: (crusher || a).name, o: (crusher || a).o.name, u: nt ? nt.u.name : '', d: nt ? nt.d.name : '' });
        var gain = [15, 20, 30, 40, 50][lv];
        ax.m.plea += gain * ax.sens * 0.8; bx.m.plea += gain * bx.sens;
        a.m.heat = clamp(a.m.heat + 4, 0, 100); b.m.heat = clamp(b.m.heat + 8, 0, 100);
        /* 焦らしの文は、攻め（動く側）を {a} に */
        var tp = axTop ? ax : bx;
        if (lv === 4) { pair.sexIn = true; startConn(tp); t += ST.fmt(pk(ff && LK.FF_ACT ? LK.FF_ACT.tease : fmPair(tp, tp.o) && LK.FM_ACT ? LK.FM_ACT.tease : LK.TEASE), { a: tp.name, b: tp.o.name }); }
        /* セフレで片想い：いつもの体なのに、想う側の心だけが違う */
        if (lv >= 3 && fcKind && LK.FC && !pair.fcShown) { pair.fcShown = true; t += ST.fmt(pk(LK.FC.inside[fcKind]), { c: crusher.name, o: crusher.o.name }); }
        if (lew === 'low' && lv >= 3) t = ST.fmt(pk(actPool), vA).replace(/。.*$/, '。') + pk(LK.FADE || ['――その先は、ロッカーの扉の隙間からも見えなかった。']);
        /* 男性向け：相手が応じたときの口・繋がる行為に、狭いロッカーならではの段落を足す（thick-sex-ero.js の喘ぎ・擬音） */
        else if (eroOn && eroNow && lv >= 3 && LK.ERO_ACT && LK.ERO_ACT[lv]) {
          /* 口（3）は元の文と同じ向き（ax が bx に）、繋がる（4）は攻め {a} が受けに */
          var eg = lv === 3 ? ax : tp, er = lv === 3 ? bx : tp.o;
          /* 女性の攻め×男性の受けの「繋がる」は跨る文（LK.ERO_ACT_FM）、男性が口で受けるときは男性の体の文（LK.ERO_ACT_MB） */
          var eroL = ff && LK.ERO_ACT_FF && LK.ERO_ACT_FF[lv] ? LK.ERO_ACT_FF[lv] : lv === 4 && fmPair(eg, er) && LK.ERO_ACT_FM ? LK.ERO_ACT_FM[4] : lv === 3 && !ff && Pos && !Pos.isF(er) && LK.ERO_ACT_MB ? LK.ERO_ACT_MB[3] : LK.ERO_ACT[lv];
          t += HK.ThickEro.fill(S, pk(eroL), eg, er).replace(/\{a\}/g, eg.name).replace(/\{b\}/g, er.name);
        }
        /* 新しい関係ならではの最中（R18版のみ。locker-ties-r18.js） */
        if (nt && NT.r18Act && R18 && lew !== 'low' && lv === 4 && !nt.r18In) { nt.r18In = true; t += NT.r18Act(S, nt, tp, tp.o, { moan: moan }); }
        /* 夜の性格（R18版のみ。locker-night.js）：キス〜口（1〜3）は動く側→受ける側、繋がる（4）は攻め→受けに。同じ組で各段階一回だけ。
           swap のときは ax＝b（誘われて動いた攻め）。描写「ぼかす」・全年齢版では足さない */
        var nightL = '';
        if (R18 && lew !== 'low' && LK.nightLine && lv >= 1 && (lv === 4 ? !pair.nightDeep : !pair.nightEarly)) {
          var nT = lv === 4 ? tp : ax, nB = lv === 4 ? tp.o : bx;
          var nR = LK.nightLine(S, nT, nB, lv === 4 ? 'deep' : 'early', { mode: ff ? 'ff' : fmPair(nT, nB) ? 'fm' : 'mf' });
          if (nR && nR.text) { t += nR.text; nightL = nR.label; if (lv === 4) pair.nightDeep = true; else pair.nightEarly = true; }
        }
        /* 夜の性格の短い一言（R18版のみ。locker-night-light.js）：early の文を出し終えた組の、キス・まさぐる（1・2）に。
           同じコマで early の文を出したときと、敵対して口では嫌がっているときは足さない。攻めの文か受けの文のどちらか一つ */
        if (R18 && lew !== 'low' && LK.nightLight && (lv === 1 || lv === 2) && pair.nightEarly && !nightL && !hateNow && rng() < 0.5) {
          var nLt = LK.nightLight(S, ax, bx, {});
          if (nLt && nLt.text) { t += nLt.text; nightL = nLt.label; }
        }
        /* 自分で攻めを選んだ人は、相手に「イかされる」側にしない */
        /* 繋がった瞬間には果てさせない（そこからの数コマを、続きの出来事で書く） */
        if (lv === 4) { ax.m.plea = Math.min(ax.m.plea, 55); bx.m.plea = Math.min(bx.m.plea, 60); }
        if (bx.m.plea >= 100) { if (hardTop(bx)) bx.m.plea = 95; else t = climax(bx, t, !axTop); }
        var topC = tp.cnt.climax;
        if (ax.m.plea >= 100) t = climax(ax, t, axTop);
        /* 繋がってすぐ攻めが果てたら、次のコマは余韻から */
        if (pair.conn && tp.cnt.climax > topC) pair.done = true;
        /* キスで開く扉（キスより先のことをしている最中なら、その最中に開く） */
        var G = gimmicks[gi];
        if (G && G.lewd && lv >= 1) { prog = 100; t += ST.fmt(pk(lv >= 2 && LK.KISS_MID ? LK.KISS_MID : G.ok), { a: a.name, b: b.name }); }
        eroNow = false;
        var o2 = ST.sayB(S, { actors: [a, b], tag: actLabel(lv), text: t, why: a.name + 'が「' + actLabel(lv) + '」を仕掛けた（発情 ' + Math.round(a.m.heat) + '）／' + b.name + 'は' + (swap ? '誘いに乗って、自分から動いた（' + (hardTop(b) ? '攻め' : '動く側') + '）' : resp === 'accept' ? '乗った' : hateNow ? '口では嫌がったが、拒みきらなかった' : '流された') + '（関係：' + RL[rel] + '・' + b.name + 'の発情 ' + Math.round(b.m.heat) + '）' + (nightL ? '／夜の性格：' + nightL : ''), mag: 18 + lv * 5, kind: 'climax' }, a.name + '→' + b.name + '：' + actLabel(lv), lv >= 3 || pair.acts === 1);
        if (o2 && pair.acts === 1) ST.key(S, o2, '最初に手を出したのは' + a.name);
        if (o2 && lv === 4 && !pair.keySex) { pair.keySex = true; ST.key(S, o2, ff ? 'ロッカーの中で肌を重ねた' : 'ロッカーの中で繋がった'); }
        break;
      }
      /* 仕掛けを解く */
      var G2 = gimmicks[gi];
      if (G2 && prog < 100) {
        var workers = P.filter(function (p) { return p !== plotter && p.m.reason > 10 && !(G2.bind ? false : p.bound); });
        if (plotter && (plotter.sabotage || 0) < 2 && !pair.conn && rng() < 0.4) {
          ST.sayB(S, { actors: [plotter], tag: '細工', text: ST.fmt(pk(LK.PLOT.hide[G2.id] || LK.PLOT.hide.code), { a: plotter.name, b: plotter.o.name }), why: plotter.name + 'は脱出したくない', mag: 16 }, plotter.name + 'は仕掛けを妨害した');
          prog = Math.max(0, prog - 15); plotter.sabotage = (plotter.sabotage || 0) + 1;
        }
        /* 繋がっているあいだは、仕掛けに手が回らない */
        if (pair.conn && !G2.lewd) { /* 何もしない */ }
        else if (workers.length && !G2.lewd) {
          /* 片方だけ手錠のときは、自由な方が相手の鍵を外す */
          var free = G2.bind && bind === 'one' ? workers.filter(function (p) { return !p.bound; }) : [];
          var GT = free.length && LK.CUFF1 ? LK.CUFF1 : G2;
          if (free.length) workers = free;
          var wk = workers.slice().sort(function (x, y) { return (y.stats.dex * G2.dex + y.tr.a * 5 * G2.brain) - (x.stats.dex * G2.dex + x.tr.a * 5 * G2.brain); })[0];
          var pw = 10 + (wk.stats.dex || 3) * 6 * G2.dex + wk.tr.a * 30 * G2.brain + rng() * 28 + workers.length * 6 - G2.diff * 0.25 - env.diff * 0.2 - (lewdNow ? 14 : 0) - wk.m.heat * 0.12;
          prog = clamp(prog + Math.max(4, pw), 0, 100);
          var ok = prog >= 100;
          ST.sayB(S, { actors: [wk], tag: G2.name, text: ST.fmt(pk(soft(GT.try, wk)), { a: wk.name, b: wk.o.name }) + ST.fmt(pk(soft(ok ? GT.ok : GT.ng, wk)), { a: wk.name, b: wk.o.name }), why: '進み具合 ' + Math.round(prog) + '％（' + wk.name + 'の器用さ ' + wk.stats.dex + (G2.brain > 0.5 ? '・A' : '') + (lewdNow ? '・いちゃついていて集中できない' : '') + '）', mag: ok ? 22 : 10 }, wk.name + '：' + G2.name + ' ' + Math.round(prog) + '％', ok);
          if (ok) wk.cnt.solve++;
        } else if (G2.lewd && rng() < 0.05 + (A.m.heat + B.m.heat) / 450 + ({ lover: 0.3, fwb: 0.25, almost: 0.2, tension: -0.15 }[rel] || 0)) {
          prog = 100;
          ST.sayB(S, { actors: [A, B], tag: G2.name, text: ST.fmt(pk(pair.conn || pair.level >= 2 ? LK.KISS_MID : LK.KISS_DUTY && HK.Pos && HK.Pos.genderOK && !HK.Pos.genderOK(A, B) ? LK.KISS_DUTY : LK.KISS_OK), v0), why: '脱出のためにキスをした（発情 ' + Math.round(A.m.heat) + '・' + Math.round(B.m.heat) + '）', mag: 24 }, '', true);
        } else if (G2.lewd && !pair.conn && rng() < 0.3) {
          ST.sayB(S, { actors: [A, B], tag: G2.name, text: ST.fmt(pk(G2.try), v0) + ST.fmt(pk(G2.ng), v0), why: 'キスしないと開かない' }, 'キスの扉は開かないまま');
        }
      }
      if (prog >= 100) {
        if (G2 && G2.bind) { P.forEach(function (p) { p.bound = false; }); }
        gi++; prog = 0;
        if (gi >= gimmicks.length) { escaped = true; escTurn = turn; how = 'solve'; }
      }
      /* 外からの幸運 */
      if (!escaped && turn >= 2 && rng() < 0.005 + ((A.stats.luck || 3) + (B.stats.luck || 3)) * 0.0035) {
        escaped = true; escTurn = turn; how = 'luck';
        ST.sayB(S, { actors: [A, B], tag: '幸運', text: pk(LK.OUTSIDE), why: '二人の運（' + A.stats.luck + '・' + B.stats.luck + '）' }, '', true);
      }
      P.forEach(function (p) { p.m.esc = Math.round((gi + prog / 100) / gimmicks.length * 100); p.m.plea = clamp(p.m.plea, 0, 100); });
      ST.flushShort(S, 'ほかに：');
      if (S.log.length === logAt) ST.say(S, { kind: 'phase', actors: [A.i, B.i], text: ST.fmt(pk(LK.QUIET), rng() < 0.5 ? v0 : { a: B.name, b: A.name }) });
      ST.snap(S, keys);
    }
    if (!escaped) { how = 'timeout'; escTurn = env.turns; }

    /* ---------- 脱出のあと ---------- */
    ST.step(S, how === 'timeout' ? '時間切れ' : '脱出');
    ST.budget(S, 6);
    var both = A.m.heat >= 60 && B.m.heat >= 60;
    /* 自分から閉じ込められた人の思惑：ロッカーの中で最後まで行けたなら成功。打ち明けて怒られたら失敗 */
    var plotOk = plotter && !pair.plotMad && (pair.sexIn || (plotter.o.m.heat >= 50 && plotter.o.cnt.refuse <= 1));
    var bed = (both && A.m.heat + B.m.heat >= 140 && (A.cnt.accept + B.cnt.accept >= 1 || (A.m.heat >= 85 && B.m.heat >= 85)) && !pair.refusedHard && rng() < 0.85) || (plotter && plotOk && rng() < 0.8);
    if (bed && !plotter && Math.max(A.m.reason, B.m.reason) > 18 && (A.tr.cp + B.tr.cp) / 2 + rng() * 0.6 > 0.75) bed = false;
    if (servant && servant.cnt.hold >= 2 && !servant.broke && master.m.heat < 70) bed = false;
    /* 向きの決まらない二人は、ベッドを前にしても一線を越えない（耐え抜く展開に） */
    var endure = bed && clash;
    if (endure) bed = false;
    var outcome, bedLabels = [];
    if (bed) {
      outcome = 'bed';
      var x = plotter || (A.cnt.make >= B.cnt.make ? A : B), y = x.o;
      /* 受け攻め：ベッドでは攻めを {a} に（ロッカーの中と同じ向き） */
      if (HK.Pos && HK.Pos.order(x, y, [x, y])[0] !== x) { y = x; x = x.o; }
      var vv = { a: x.name, b: y.name };
      var tone = nt ? NT.tone(nt, rng) : rel === 'tension' || rel === 'ex' ? 'rough' : rel === 'lover' || rel === 'almost' || rel === 'crush' || rel === 'mutual' ? 'sweet' : rng() < 0.5 ? 'rough' : 'sweet';
      /* ベッドの展開は solo-locker-bed.js（誘い方・最中の展開・結び） */
      /* 扉が開いたあとの夜：描写の長さ（短く＝一段落版）と、男性向け（企みのある夜は除く） */
      eroNow = eroOn && !plotter;
      bedLabels = LK.bed(S, { short: !!(lcf && LX.short(env, rng)), ero: eroNow, A: A, B: B, x: x, y: y, rel: rel, tone: tone, how: how, plotter: plotter, servant: svW ? null : servant, master: svW ? null : master, nt: nt, lew: lew, dose: env.dose, pair: pair, moan: function (p, top) { return moan(p, top, true); }, REL_LABEL: RL, ff: ff });
      A.cnt.climax += 2 + rng.int(3); B.cnt.climax += 2 + rng.int(3);
    } else if (endure) {
      outcome = 'endure';
      /* 理性の残っていた方が、性格に合わせたやり方で二人を引き離す */
      var ke = A.m.reason >= B.m.reason ? A : B, tye = clashType(ke);
      ST.key(S, ST.say(S, { actors: [A, B], tag: '耐え抜いた', text: (how === 'timeout' ? LK.BED.timeout[0].replace(/そこには、大きなベッドが置かれていた。$/, '') : '') + ST.fmt(pk(LK.CLASH.bed[tye]), { a: ke.name, b: ke.o.name }), why: '二人とも発情していた（' + Math.round(A.m.heat) + '・' + Math.round(B.m.heat) + '）が、' + (tieNL ? nlWhy + 'の二人なので' : sexP ? '体の関係にならない二人（' + sexWhy + '）なので' : '受け攻めの向きが合わない二人なので') + '、ベッドには行かなかった（' + ke.name + 'の理性 ' + Math.round(ke.m.reason) + '）', mag: 30 }), '結末');
    } else {
      /* ロッカーの中で最後までした二人は「怒りの脱出」にしない（そのあと受け入れている） */
      outcome = how === 'timeout' ? 'rescue' : plotter && !plotOk ? 'plotfail' : pair.refusedHard && pair.acts >= 1 && !pair.sexIn ? 'angry' : pair.acts >= 1 ? 'awkward' : (A.cnt.make + B.cnt.make) > 0 || (clash && A.cnt.hold + B.cnt.hold > 0) ? 'near' : 'clean';
      var who0 = outcome === 'angry' ? (A.cnt.refuse >= B.cnt.refuse ? B : A) : outcome === 'plotfail' ? plotter : outcome === 'near' ? (A.cnt.make + A.cnt.hold >= B.cnt.make + B.cnt.hold ? A : B) : pair.sexIn && pair.top ? pair.top : A;
      var AF = LK.AFTER, ak = pair.sexIn && outcome === 'awkward' && AF.awkwardSex ? 'awkwardSex' : pair.sexIn && outcome === 'rescue' && AF.rescueSex ? 'rescueSex' : outcome;
      var aft = AF[ak].filter(function (l) { return (A.cnt.refuse + B.cnt.refuse > 0 || !/嗜め/.test(l)) && (ak !== 'rescueSex' || (ff ? !/繋が/.test(l) : !/脚を絡め合った/.test(l)) && (pair.conn || !/まだ(繋が|脚を絡め)/.test(l))); });
      var tA = ST.fmt(pk(aft.length ? aft : AF[outcome]), { a: who0.name, b: who0.o.name });
      /* 何かあった二人は、関係ごとの一文を添える。思惑どおりに行った人は、こっそり満足する */
      var RA = LK.REL && LK.REL.after[rel];
      if (RA && pair.acts >= 1 && outcome !== 'angry' && outcome !== 'plotfail' && rng() < 0.7) tA += ST.fmt(pk(RA), { a: who0.name, b: who0.o.name, c: (crusher || A).name, o: (crusher || A).o.name, u: nt ? nt.u.name : '', d: nt ? nt.d.name : '' });
      if (nt) tA += NT.afterNote(S, nt, outcome, plotter);
      if (plotter && plotOk && pair.acts >= 1) tA += ST.fmt(pk(AF.plotwin.filter(function (l) { return !/ベッド|眠|寝顔/.test(l); })), { a: plotter.name, b: plotter.o.name });
      ST.key(S, ST.say(S, { actors: [A, B], tag: { clean: '無事に脱出', near: '踏みとどまった', awkward: '気まずい脱出', angry: '怒りの脱出', plotfail: '計画失敗', rescue: '時間切れ' }[outcome], text: tA, why: '手を出した回数 ' + pair.acts + '・嗜めた回数 ' + (A.cnt.refuse + B.cnt.refuse) + '・発情 ' + Math.round(A.m.heat) + '／' + Math.round(B.m.heat), mag: 30 }), '結末');
    }

    /* ---------- 結末 ---------- */
    P.forEach(function (p) {
      var f;
      if (plotter === p) f = outcome === 'bed' ? '相手をモノにした' : pair.sexIn && outcome !== 'plotfail' ? 'ロッカーの中で相手をモノにした' : pair.acts >= 1 && outcome !== 'plotfail' ? '少しだけ思いを遂げた' : '計画が空回りした';
      else if (svW && servant === p) f = NT.fate(nt, p);
      else if (servant === p) f = p.broke ? '主に手を出してしまった' : p.ordered ? '主の許しで身を委ねた' : p.cnt.hold ? '主に手を出さず耐えきった' : '主に身を委ねた';
      else if (clash && (p.cnt.hold || outcome === 'endure')) f = '触れずに耐え抜いた';
      else if (p.cnt.make >= 2 && p.cnt.make === p.o.cnt.make && p.o !== plotter && p.o !== servant) f = '一緒に堕ちた';
      else if (p.cnt.make >= 2 && p.cnt.make > p.o.cnt.make) f = '先に堕ちた';
      else if (p.cnt.refuse >= 2 && outcome !== 'bed' && !p.cnt.accept) f = '最後まで嗜めた';
      else if (p.cnt.refuse >= 1 && p.cnt.accept >= 1) f = '嗜めきれずに流された';
      else if (p.cnt.accept >= 1) f = '流された';
      else f = p.m.reason > 30 ? '理性を保ちきった' : 'ぎりぎりで踏みとどまった';
      p.fate = f + (outcome === 'bed' ? '・ベッドで激しく' : '');
      p.notes.push('発情 ' + Math.round(p.m.heat) + '・理性 ' + Math.round(p.m.reason) + '・' + W_CL + ' ' + p.cnt.climax + '回');
      p.notes.push('仕掛けた ' + p.cnt.make + '回・応じた ' + p.cnt.accept + '回・嗜めた ' + p.cnt.refuse + '回' + (p.cnt.hold ? '・耐えた ' + p.cnt.hold + '回' : '') + (p.cnt.solve ? '・仕掛けを解いた ' + p.cnt.solve + '回' : ''));
    });
    var mins = (escTurn + 1) * 5;
    var title = { bed: (how === 'timeout' ? '時間切れで扉が開いたが、' : mins + '分で脱出したが、') + '二人は部屋を出ずにベッドへ直行した。', clean: mins + '分で無事に脱出。何も起きなかった。', near: mins + '分で脱出。危ない瞬間はあったが、二人は踏みとどまった。', awkward: mins + '分で脱出。' + (pair.sexIn ? 'ロッカーの中で' + (ff ? '肌を重ねた' : '一線を越えた') + 'ことは、ガスのせいにした。' : 'ロッカーの中のことは、ガスのせいにした。'), angry: mins + '分で脱出。' + (A.cnt.refuse >= B.cnt.refuse ? A.name : B.name) + 'の怒りは収まらなかった。', plotfail: mins + '分で脱出。' + (plotter ? plotter.name : '') + 'の計画は空回りした。', rescue: '制限時間内に脱出できず、扉は時間切れで開いた。' + (pair.conn ? 'そのとき二人は、まだ' + (ff ? '肌を重ねたままだった。' : '繋がったままだった。') : pair.sexIn ? 'ロッカーの中で何があったかは、二人だけが知っている。' : ''), endure: (how === 'timeout' ? '時間切れで扉が開いた。' : mins + '分で脱出。') + '目の前のベッドには目もくれず、二人は媚薬が抜けるまで耐え抜いた。' }[outcome];
    var lines = P.map(function (p) { return p.name + '：' + p.fate; });
    lines.push('仕掛け：' + gimmicks.map(function (g, i) { return g.name + (i < gi ? '（解除）' : ''); }).join('→') + (how === 'luck' ? '（外から開いた）' : ''));
    if (pair.level >= 0) lines.push('ロッカーの中でいちばん進んだのは「' + actLabel(pair.level) + '」');
    if (bedLabels.length) lines.push('ベッドでは：' + bedLabels.join('→'));
    if (fcKind && LK.FC) lines.push(ST.fmt(pk(LK.FC.end[fcKind]), { c: crusher.name, o: crusher.o.name }));
    /* 両片想い：何かあった二人は「……こっちの台詞」と通じる。何もなかった二人は、すれ違ったまま */
    if (nt) { var ntL = NT.endLine(S, nt); if (ntL) lines.push(ntL); }
    if (rel === 'mutual' && LK.MUT) lines.push(ST.fmt(pk(LK.MUT.end[outcome === 'bed' || (pair.acts >= 1 && outcome !== 'angry' && outcome !== 'plotfail') ? 'told' : 'miss']), v0));
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [Math.round(p.m.heat) + '', Math.round(p.m.reason) + '', String(p.cnt.make), String(p.cnt.refuse), String(p.cnt.climax), String(p.cnt.solve), p.fate] }; });
    return ST.result(S, input, {
      ending: { title: title, kind: outcome === 'clean' ? 'ok' : 'over', lines: lines },
      estats: [['脱出まで', how === 'timeout' ? '時間切れ' : mins + '分'], ['関係', RL[rel]], ['受け入れた', pair.acts + '回'], [W_CL, (A.cnt.climax + B.cnt.climax) + '回']],
      table: { title: '二人の状態', hint: '発情が高く理性が低いほど手を出しやすい。乗るか嗜めるかは関係と性格しだい。', cols: ['発情', '理性', '仕掛けた', '嗜めた', W_CL, '解いた', '結末'], rows: rows },
      meters: [{ label: '発情', color: '--love' }, { label: '理性', color: '--accent' }, { label: '快感', color: '--pine', dash: true }, { label: '脱出', color: '--partner', dash: true }],
      meta: RL[rel] + '・拘束' + { both: 'あり', one: '片方', none: 'なし' }[bind] + '・媚薬' + env.dose,
      summary: '媚薬ロッカー：' + title
    });
  }
})();
