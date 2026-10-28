/* 箱庭シミュレーター: エロバラエティ番組（R18）
   複数人が深夜のお色気バラエティに出演し、ランダムに選ばれた企画（約50種）で得点を競う。
   企画の形式（一人ずつ挑戦・観覧客の投票・全員同時の耐久・一対一の対決・二チーム対抗）ごとに展開が変わり、
   ハプニング・罰ゲーム・恋の芽生え・下剋上を経て、最後に優勝者が決まる */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event-table scen=variety path=VARIETY.KIKAKU label=企画 cat=夜 */
/* @event-table scen=variety path=VARIETY.EVENTS label=収録中のハプニング cat=ハプニング */
/* @event-table scen=variety path=VARIETY.CHAR_EV label=出演者ごとの出来事 cat=solo */
/* @event scen=variety id=vr_show cat=夜 tie=- tags=night,force label=企画に挑む（一人ずつ・投票・耐久・対決・チーム戦） */
/* @event scen=variety id=vr_kin cat=bond tie=parent,sibling,sibbad,sibclose,sibprot,pparent label=家族の共演（親子・きょうだい。性的な場面にしない） */
/* @event scen=variety id=vr_penalty cat=夜 tags=night,force label=罰ゲーム */
(function () {
  'use strict';
  var HK = window.HK, VA = HK.VARIETY, ST = HK.Story, clamp = HK.clamp;
  if (!VA || !ST) return;

  var scen = {
    id: 'variety', name: 'エロバラエティ番組', kicker: '2〜8人・R18', solo: true, maxCast: 8, minCast: 2,
    desc: '深夜のお色気バラエティに出演して、手コキカラオケ・69早イキ対決・ローション騎乗位ロデオなど、ランダムに選ばれる約60の企画で得点を競う。脱衣早押しクイズ・二人羽織・王様くじなどの新企画は、企画の指定で必ず入れることもできる。ハプニングに罰ゲーム、恋の芽生えや下剋上も。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: 'コマ', simulate: function (input) { return run(input); },
    castHint: '2〜8人が出演して得点を競います。テク・我慢・色気は住人ごとに設定でき、企画によって効く能力が変わります（頭はA、運はランダム）。',
    env: [
      { id: 'corners', label: '企画の数', min: 2, max: 5, def: 3, lo: '2本', hi: '5本', unit: '本' },
      { id: 'mix', label: '企画の傾向', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'each', label: '一人ずつ挑戦が多め' }, { v: 'duel', label: '対決が多め' }, { v: 'endure', label: '耐久が多め' }, { v: 'vote', label: '投票が多め' }, { v: 'pair', label: 'ペアで挑戦が多め' }, { v: 'new', label: '新企画が多め' }] },
      { id: 'pick', label: '必ず入れる企画', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }].concat((VA.PLUS || []).map(function (k) { return { v: k.name, label: k.name }; })) },
      { id: 'ev', label: 'ハプニングの頻度', min: 0, max: 100, def: 55, lo: 'たまに', hi: '毎企画' },
      { id: 'penalty', label: '罰ゲームの頻度', min: 0, max: 100, def: 50, lo: 'なし', hi: '毎回' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'ぼかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ],
    stats: [
      { id: 'tech', label: 'テク', desc: '相手をイかせる企画に効く' },
      { id: 'gaman', label: '我慢', desc: 'イったら負けの企画に効く' },
      { id: 'iro', label: '色気', desc: '投票や見せる企画に効く' }
    ],
    actions: [
      { id: 'win', label: 'ガチで勝ちにいく', fit: function (t) { return t.cp * 0.5 + t.lead * 0.5; } },
      { id: 'fun', label: '番組を盛り上げる', fit: function (t) { return t.fc * 0.8 + 0.1; } },
      { id: 'safe', label: '目立たず無難に', fit: function (t) { return t.ac * 0.6 + t.caution * 0.4; } }
    ],
    goals: [
      { id: 'prize', label: '優勝賞品が欲しい', fit: function (t) { return t.cp * 0.4 + t.a * 0.3; } },
      { id: 'fame', label: '有名になりたい', fit: function (t) { return t.fc * 0.6 + 0.1; } },
      { id: 'love', label: '共演者が気になる', fit: function (t) { return t.np * 0.5 + t.ac * 0.3; } }
    ],
    events: []
  };
  HK.SCENARIOS.variety = scen;
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  if (HK.SCEN_ORDER.indexOf('variety') < 0) HK.SCEN_ORDER.push('variety');

  var PTS = [30, 20, 15, 10, 8, 6, 4, 2];
  var STAT_TB = { gaman: '我慢', brain: '頭', pop: '人気', luck: '運' };
  var TYPE = { guess: '当てっこ', each: '一人ずつ挑戦', vote: '観覧客の投票', endure: '全員で耐久', duel: '一対一の対決', team: 'チーム対抗', pair: 'ペアで挑戦' };
  var STAT = { tech: 'テク', gaman: '我慢', iro: '色気', brain: '頭', luck: '運' };

  function resolve(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rng.int(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function run(input) {
    var S = ST.state(input, 'variety'), rng = S.rng, env = S.env, P = S.P, lew = env.lewd || 'mid', V = HK.Voice;
    /* 同じ結果の中で、同じ文・台詞を繰り返さない：まだ使っていない文から選び、使い切ったら、いちばん前に使った文から戻す */
    var lru = { n: 0, at: {} };
    function pkv(arr) {
      if (!arr || !arr.length) return '';
      var best = [], bv = Infinity;
      for (var i = 0; i < arr.length; i++) { var a = lru.at['$' + arr[i]] || 0; if (a < bv) { bv = a; best = [arr[i]]; } else if (a === bv) best.push(arr[i]); }
      var x = best[rng.int(best.length)];
      lru.at['$' + x] = ++lru.n;
      return x;
    }
    /* 昂りの段階（0 平常／1 一度イかされて敏感なまま／2 何度も果てて取り繕えない）。イった回数と昂りの値から決め、番組の中では下げない。
       上がったら、その人が出る次の場面の終わりに、変わり目の一文を足す */
    var V_UP = {
      1: ['一度イかされてから、{a}の体はずっと敏感なままだった。カメラが寄るだけで、膝が小さく震える。', '{a}の頬の赤みは、もう引かなくなっていた。生放送のライトが、やけに熱く感じる。', '{a}は平静を装っていたが、さっきの余韻で、息がまだ少しだけ浅かった。', '{a}は次の企画の説明を聞きながら、そっと内腿を擦り合わせた。さっきの熱が、まだ体の奥に残っている。', 'さっきイかされたばかりの{a}は、衣装が肌に擦れるだけで小さく息を呑んだ。'],
      2: ['何度も果てさせられた{a}は、もう取り繕う余裕もなかった。触れられる前から、腰がひくひくと疼いている。', '{a}の目は、すっかりとろんと潤んでいた。番組の残り時間より、自分の体のほうが持ちそうにない。', '{a}は立っているのもやっとだった。スタジオの熱気に、体の芯まで溶かされている。', '{a}の声は、普通に喋るだけで甘く掠れるようになっていた。何度も果てた体は、もう番組のペースについていけない。', 'カメラを向けられても、{a}はもう表情を作れなかった。火照りきった体が、次の刺激を待っている。']
    };
    function heatV(p) {
      var raw = p.m.arouse < 40 ? 0 : p.m.arouse < 70 ? 1 : 2, st = Math.max(p.cnt.climax >= 3 ? 2 : p.cnt.climax >= 1 ? 1 : 0, raw), old = p.hs || 0;
      if (st > old) { p.hs = st; if (lew !== 'low') p._hup = ST.fmt(pkv(V_UP[st]), { a: p.name }); }
      if (HK._rxT) HK._rxT.push({ sc: 'variety', k: 'heat', who: p.name, raw: raw, st: p.hs || 0 });
    }
    function withHeat(o) {
      (o.actors || []).forEach(function (p) { if (p && typeof p === 'object' && p._hup) { o.text = (o.text || '') + p._hup; p._hup = ''; } });
      return o;
    }
    function sayV(o) { return ST.say(S, withHeat(o)); }
    function sayBV(o, sh, f) { return ST.sayB(S, withHeat(o), sh, f); }
    /* 一人ずつ挑戦で、企画の説明の文を使い切ったら、二人目からは短いつなぎにする */
    var NEXT_UP = ['続いて{a}が、同じ課題に挑んだ。', '次は{a}の番だった。', '{a}も、前の挑戦者と同じ課題に臨んだ。', '{a}は深呼吸をひとつしてから、同じ課題に向かった。', 'スタジオの視線が、次の挑戦者の{a}に集まった。'];
    var show = rng.pick(VA.SHOWS), mc = rng.pick(VA.MCS);
    S.v = { mc: mc };
    var rating = 6 + rng() * 4;
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      p.m = { score: 0, arouse: 0, shame: 0, pop: 20 };
      p.cnt = { first: 0, climax: 0, penalty: 0, accident: 0, last: 0 };
      p.att = {}; p.roleLabel = '出演者'; p.titles = []; p.away = 0;
      /* 企画への向き合い方：恥じらい派／ノリノリ派（途中で順応することもある） */
      p.mood = p.tr.ac > 0.58 && p.tr.fc < 0.62 ? 'shy' : (p.tr.fc > 0.6 || p.tr.impulse > 0.66) ? 'nori' : '';
    });
    /* 企画中のひとこと（恥じらい・ノリノリ） */
    function att(p, pr) {
      if (!VA.ATT || !p.mood || rng() > pr) return '';
      return fill(pkv(VA.ATT[p.mood]), p);
    }
    /* 同率の人をまとめて名前で */
    function nmList(L0) { var n = L0.map(function (p) { return p.name; }); return n.length > 2 ? n.join('・') : n.join('と'); }
    /* 人数に合わせる：三人以上なら「二人」を人数に、二人用の文があれば三人以上用に差し替える */
    var KNUM = ['', '一人', '二人', '三人', '四人', '五人', '六人', '七人', '八人', '九人', '十人'];
    function poolN(name, n) { return n > 2 && VA[name + '_M'] ? VA[name + '_M'] : VA[name]; }
    function numFix(t, n) { if (n <= 2) return t; var k = KNUM[n] || n + '人'; return t.replace(/二人一組/g, '全員まとめて').replace(/二人分/g, k + '分').replace(/二人/g, k).replace(/両者/g, '全員').replace(/どちらが先/g, '誰が先').replace(/どちらだった/g, '誰だった'); }
    function fmtN(name, L0, extra) { var v = { n: nmList(L0), mc: mc, k: KNUM[L0.length] || L0.length + '人' }; if (extra) Object.keys(extra).forEach(function (x) { v[x] = extra[x]; }); return numFix(ST.fmt(pkv(poolN(name, L0.length)), v), L0.length); }
    var keys = ['score', 'arouse', 'shame', 'pop'];
    /* みんなで性的な罰ゲームをしてよい顔ぶれか（攻めの指定の人がいない・全員の組が okSex） */
    var grpOk = function (L0) { if (L0.some(function (x) { return PO ? PO.hardTopIn(x, L0) : hTop(x); })) return false; for (var i = 0; i < L0.length; i++) for (var j = i + 1; j < L0.length; j++) if (!okS(L0[i], L0[j])) return false; return true; };
    var tie = function (a, b) { var t = (input.ties || []).filter(function (x) { return (x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i); })[0]; return t ? t.type : ''; };
    /* 両片想い（どちらからも片想い。恋人・番になっていない二人） */
    var pinTie = function (a, b) {
      var L0 = (input.ties || []).filter(function (x) { return (x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i); });
      if (L0.some(function (x) { return /^(lover|mate|fated)$/.test(x.type); })) return false;
      var ab = L0.some(function (x) { return x.type === 'crush' && x.a === a.i; }), ba = L0.some(function (x) { return x.type === 'crush' && x.a === b.i; });
      return (ab && ba) || L0.some(function (x) { return x.type === 'crush' && x.cold === 'mutual'; });
    };

    /* 受け攻め：自分で攻めを選んだ人は、企画でも罰ゲームでも「される」側にしない。住人どうしの性的な企画は、向きの決まる組（okSex）だけ */
    var PO = HK.Pos;
    function hTop(p) { return !!(PO && PO.hardTop(p)); }
    /* モブ（アシスタント・スタッフ）が相手のときの攻め：攻めの指定でも「モブには受け」なら受ける */
    function hTopN(p) { return !!(PO && (PO.hardTopNpc ? PO.hardTopNpc(p) : PO.hardTop(p))); }
    /* 血縁（恋愛：なし）の二人は、性的な企画で組まない（関係で「恋愛：あり」にした組と、擬似親子は別） */
    function kinTie(a, b) { var L0 = (input.ties || []).filter(function (x) { return (x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i); }); for (var i = 0; i < L0.length; i++) { var D = HK.TIES && HK.TIES[L0[i].type]; if (D && D.family) return L0[i]; } return null; }
    function kinBlock(a, b) { var t = kinTie(a, b); return !!(t && HK.tieNoLove(t)); }
    /* 住人どうしの組：受け攻め・恋愛対象（okSex）、恋愛やR18にしない組、性行為の相手の固定（固定した相手だけ・固定した相手＋モブ。HK.sexBlocked） */
    function okS(a, b) { return !kinBlock(a, b) && (!PO || PO.okSex(a, b)) && !(HK.ngSexPair && HK.ngSexPair(a, b)) && !(HK.sexBlocked && HK.sexBlocked(a, b)); }
    function ord(a, b) { return PO ? PO.order(a, b, [a, b]) : [a, b]; }
    /* いちもつのある人（男性と、ふたなりの女性）。男性器前提の企画・当てっこは、ふたなりがいても外さない */
    function hasP(p) { return PO ? (PO.hasM ? PO.hasM(p) : !PO.isF(p)) : p.gender === 'm'; }
    /* アシスタントを選ぶ：いちもつ前提の企画や、女性の挑戦者が受ける企画では男性のアシスタントにする（女性どうしにしない） */
    function assist(p, K) {
      var pool = VA.ASSIST;
      if ((VA.ASSIST_NEED_M && VA.ASSIST_NEED_M.indexOf(K.name) >= 0) || ((PO && PO.genSet && PO.genSet(p) ? !PO.hasM(p) : p.gender === 'f') && VA.ASSIST_FF_OK && VA.ASSIST_FF_OK.indexOf(K.name) < 0 && !K.ffok)) pool = pool.filter(function (x) { return !VA.ASSIST_F_RE.test(x); });
      return rng.pick(pool.length ? pool : VA.ASSIST);
    }
    function skill(p, st) {
      var s = p.stats, t = p.tr;
      var v = st === 'tech' ? s.tech * 13 + t.a * 8 + t.np * 6 : st === 'gaman' ? s.gaman * 13 + t.cp * 10 + t.caution * 6 - p.m.arouse * 0.25 : st === 'iro' ? s.iro * 13 + t.fc * 9 + t.np * 5 + p.m.pop * 0.1 : st === 'brain' ? t.a * 45 + t.fc * 10 + 8 : 32;
      v += p.action.id === 'win' ? 6 : p.action.id === 'safe' ? -4 : 0;
      return v + rng() * 45;
    }
    function quote(p, T) { var l = T[p.persona] || T.gentle; return p.name + pkv(l); }
    /* R18の描写の設定（lewd-unify.js）：男性向けなら ♡ の喘ぎ（ero-kit.js）・山場に段落を足す、濃いなら延長戦・もう一度。テンポを重視するので、描写の長さの設定はない */
    var LX = HK.Lewd, lcf = LX && LX.conf('variety'), ero = !!(lcf && HK.Ero && HK.Ero.on(S) && lew !== 'low'), high = !!(lcf && lew === 'high');
    /* 小説調の果てる声は喘ぎの辞書（moan-engine.js の HK.Moan.say の小説調）から。元の表（Voice.CLIMAX）も4割ほど残る */
    function moan(p) {
      if (ero) return p.name + '「' + HK.Ero.moan(S, p, 2) + '」';
      if (lew === 'low' || !V || !V.CLIMAX[p.persona]) return '';
      return p.name + '「' + (HK.Moan && HK.Moan.say ? HK.Moan.say(S, p, 'climax', { novel: true }, function () { return pkv(V.CLIMAX[p.persona]); }) : pkv(V.CLIMAX[p.persona])) + '」';
    }
    /* 山場の厚い場面（R18版・描写が「ぼかす」以外。solo-variety-thick.js）。tb＝[攻める側, 受ける側] */
    function thick(kind, tb) {
      var TH = VA.THICK, TV = HK.ThickVM;
      if (HK.SAFE_ON || lew === 'low' || !TH || !TV) return '';
      var t = tb[0], b = tb[1], key = kind;
      if (kind === 'pair' || kind === 'gone') {
        /* ふたなり（HK.Pos.futa）が攻めに回るときは男性の体で書く（M）。受ける側は体の性別のまま */
        var tf = PO ? PO.isF(t) : t.gender === 'f', bf = PO ? PO.isFBody(b) : b.gender === 'f';
        key = kind + (tf && bf ? 'FF' : tf ? 'FM' : 'M');
        if (kind === 'gone' && key === 'goneM' && TV.sad(rng, t, b)) key = 'goneSad';
      }
      var l = TH[key];
      if (!l || !l.length) return '';
      var out = (VA.thickVoice || TV.voice)(rng, pkv(l), b, t), pk = function (a) { return pkv(a); };
      if (ero && VA.THICK_ERO && VA.THICK_ERO[key]) out += '\n\n' + HK.Ero.fill(S, pk(VA.THICK_ERO[key]), b);
      if (high) {
        if ((kind === 'pair' || kind === 'gone') && HK.ThickEro) out += '\n\n' + HK.ThickEro.again(S, pk, t, b, ero, false).replace(/\{a\}/g, t.name).replace(/\{b\}/g, b.name);
        else if (VA.THICK_AGAIN && VA.THICK_AGAIN[key]) out += '\n\n' + pk(VA.THICK_AGAIN[key]);
      }
      return ST.fmt(out, { a: t.name, t: t.name, b: b.name, mc: mc });
    }
    /* 男性向け：段落に分けない（数行で短く）場面にも、男性向けの一段を足す */
    function eroAdd(kind, tb) {
      if (!ero || !VA.THICK_ERO) return '';
      var t = tb[0], b = tb[1], key = kind;
      if (kind === 'pair' || kind === 'gone') { var tf = PO ? PO.isF(t) : t.gender === 'f', bf = PO ? PO.isFBody(b) : b.gender === 'f'; key = kind + (tf && bf ? 'FF' : tf ? 'FM' : 'M'); }
      var l = VA.THICK_ERO[key];
      return l && l.length ? ST.fmt(HK.Ero.fill(S, pkv(l), b), { a: t.name, t: t.name, b: b.name, mc: mc }) : '';
    }
    function fill(t, a, b) { return ST.fmt(t, { a: a ? a.name : '', b: b ? (b.name || b) : rng.pick(VA.ASSIST), mc: mc }); }
    function sayIf(o) { if (S.room == null || S.room > 0) { if (S.room != null) S.room--; sayV(o); } }
    function mcr(tag, pr) { return VA.MCR && VA.MCR[tag] && rng() < (pr == null ? 0.5 : pr) ? '――' + mc + pkv(VA.MCR[tag]) + (VA.CATCH && VA.CATCH[mc] && rng() < 0.12 ? 'お決まりの' + VA.CATCH[mc] + 'も飛び出した。' : '') : ''; }
    function giveTitle(p, K, i) { var T = VA.TITLES && VA.TITLES[K.name]; if (p && T && T[i] && p.titles.indexOf(T[i]) < 0) p.titles.push(T[i]); }
    function addPts(p, n, dbl) { p.m.score += n * (dbl ? 2 : 1); }
    function climax(p, n) { p.cnt.climax += n || 1; p.m.arouse = 20; p.m.shame = clamp(p.m.shame + 6, 0, 100); p.m.pop = clamp(p.m.pop + 3, 0, 100); rating += 0.3;  heatV(p); }

    /* ---------- オープニング ---------- */
    ST.step(S, 'オープニング');
    sayV({ kind: 'phase', text: '深夜のお色気バラエティ「' + show + '」、生放送スタート！　' + mc + 'の呼び込みで、' + P.map(function (p) { return p.name; }).join('・') + 'がスタジオに登場した。' + (VA.MC_OPEN ? mc + pkv(VA.MC_OPEN) : '') });
    ST.budget(S, 2);
    var intro = shuffle(rng, P).slice(0, 2);
    /* 血縁で出演している組は、オープニングで紹介する */
    if (VA.INTRO_KIN) {
      var kinDone = {};
      P.forEach(function (a) { P.forEach(function (b) {
        if (a === b || kinDone[a.i] || kinDone[b.i]) return;
        var t = kinTie(a, b);
        if (!t || t.a !== a.i) return;
        var D = HK.TIES[t.type], k = VA.INTRO_KIN[t.type] ? t.type : VA.INTRO_KIN[D.like] ? D.like : 'sibling';
        kinDone[a.i] = kinDone[b.i] = 1;
        var mk = VA.INTRO_KIN_MC ? (VA.INTRO_KIN_MC[k] || (/^sib/.test(t.type) ? VA.INTRO_KIN_MC.sibling : VA.INTRO_KIN_MC[D.like]) || VA.INTRO_KIN_MC.sibling) : null;
        var tx = (mk ? ST.fmt(pkv(mk), { a: a.name, b: b.name, mc: mc }) : '') + ST.fmt(pkv(VA.INTRO_KIN[k]), { a: a.name, b: b.name, mc: mc });
        var bt = b.eg && HK.egoType ? HK.egoType(b.eg).top : '';
        if (VA.KIN_REACT && VA.KIN_REACT[bt] && rng() < 0.6) tx += ST.fmt(pkv(VA.KIN_REACT[bt]), { a: a.name, b: b.name, mc: mc });
        if (kinBlock(a, b) && VA.INTRO_KIN_NOTE) tx += ST.fmt(pkv(VA.INTRO_KIN_NOTE), { a: a.name, b: b.name, mc: mc });
        /* 関係の表示名は、きょうだいなら二人の性別・年齢で「姉弟」など（HK.tieLabel）。続柄の印は sib-word.js で解く */
        var lb = HK.tieLabel ? HK.tieLabel(t) || D.label : D.label;
        if (HK.Sib) tx = HK.Sib.fill(tx, a, b, null, S);
        sayV({ actors: [a, b], tag: lb + 'で出演', text: tx, why: '関係「' + lb + '」の二人が出演' + (kinBlock(a, b) ? '（血縁なので、二人を組ませる企画はない）' : ''), mag: 16 });
      }); });
    }
    intro.forEach(function (p) {
      sayV({ actors: [p], tag: '意気込み', text: VA.introLine ? VA.introLine(S, p, P, mc) : p.name + 'は' + ({ win: '「優勝しか見てない」と言い切った。', fun: '「楽しんだもん勝ちでしょ！」とカメラに手を振った。', safe: '緊張で顔がこわばっていた。' }[p.action.id]), why: '方針「' + p.action.label + '」・目標「' + p.goal.label + '」' });
    });
    ST.snap(S, keys);

    /* 企画を選ぶ（重複なし） */
    var pool = VA.KIKAKU.slice(), used = [];
    function pickK(nAct) {
      /* 企画の指定（新企画）：最初の企画で必ず出す */
      if (env.pick && env.pick !== 'auto' && !used.length) {
        var fk = pool.filter(function (x) { return x.name === env.pick; })[0];
        if (fk) { pool.splice(pool.indexOf(fk), 1); used.push(fk); return fk; }
      }
      var k = HK.weighted(rng, pool, function (x) {
        var w = 1;
        if (x.type === 'guess' && (nAct || P.length) < 3) return 0;
        if (x.type === 'guess') w *= 1.6;
        if (env.mix !== 'random' && x.type === env.mix) w *= 3.5;
        if (env.mix === 'new' && x.plus) w *= 3.5;
        if (x.type === 'duel' && P.length < 2) w = 0;
        if (VA.NO_TOP && VA.NO_TOP.indexOf(x.name) >= 0 && P.some(function (p) { return !p.away && hTop(p); })) w = 0;
        if (VA.NEED_PENIS && VA.NEED_PENIS.indexOf(x.name) >= 0 && P.some(function (p) { return !hasP(p); })) w = 0;
        if (x.type === 'team' && P.length < 4) w *= 0.15;
        if (used.length && used[used.length - 1].type === x.type) w *= 0.45;
        return w;
      });
      pool.splice(pool.indexOf(k), 1); used.push(k);
      return k;
    }

    for (var c = 0; c < env.corners; c++) {
      var AP0 = P.filter(function (p) { return !p.away; });
      var K = pickK(AP0.length), dbl = false;
      ST.step(S, '第' + (c + 1) + '企画');
      S.step = c;
      ST.budget(S, 3);
      var AP = P.filter(function (p) { return !p.away; });
      if (AP.length < 2) { P.forEach(function (p) { p.away = 0; }); AP = P.slice(); }
      var hid = null;
      if (K.type === 'guess') {
        var males = AP.filter(hasP);
        if (/ちんちん/.test(K.name) && !males.length) {
          var alt = pool.filter(function (x) { return x.type === 'guess'; })[0];
          used.pop();
          if (alt) { pool.splice(pool.indexOf(alt), 1); used.push(alt); K = alt; }
          else { K = pickK(1); }
        }
        /* 当てられる側：攻めの指定の人は選ばない。触って確かめられる共演者（okSex で、触る側が攻めになる組）が多い人を選ぶ */
        if (K.type === 'guess') {
          var hc = (/ちんちん/.test(K.name) ? males : AP).filter(function (x) { return !hTop(x); });
          if (!hc.length) { used.pop(); pool.push(K); K = pickK(1); }
          else {
            var hv = function (x) { return AP.filter(function (g) { return g !== x && okS(g, x) && ord(g, x)[0] === g; }).length + rng() * 0.5; };
            hid = hc.map(function (x) { return { x: x, v: hv(x) }; }).sort(function (a2, b2) { return b2.v - a2.v; })[0].x;
          }
        }
      }
      sayV({ kind: 'phase', text: '【' + K.name + '】（' + (TYPE[K.type] || '当てっこ') + '・' + STAT[K.stat] + 'が効く）' + ST.fmt(Array.isArray(K.rule) ? pkv(K.rule) : K.rule, { mc: mc, h: hid ? hid.name : '' }) + (P.length > AP.length ? '（' + P.filter(function (p) { return p.away; }).map(function (p) { return p.name; }).join('・') + 'は楽屋から戻ってこないまま）' : '') });
      /* ハプニング（企画の前） */
      if (rng() < env.ev / 100 * 0.6) {
        var e = HK.weighted(rng, VA.EVENTS, function (x) { return (c === 0 && /retry|reverse|tears|guest/.test(x.id) ? 0 : 1) / (1 + (S.flags['ev_' + x.id] || 0) * 3); });
        S.flags['ev_' + e.id] = (S.flags['ev_' + e.id] || 0) + 1;
        var a = rng.pick(AP.filter(function (x) { return x !== hid; }).length ? AP.filter(function (x) { return x !== hid; }) : AP), b = rng.pick(AP.filter(function (x) { return x !== a && x !== hid; }).length ? AP.filter(function (x) { return x !== a && x !== hid; }) : P.filter(function (x) { return x !== a; })), fx = e.fx;
        /* 楽屋に消える二人は、体の関係を持ってよい組（okSex）だけ。いなければ甘々ボイスに */
        if (fx.dressing && (AP.length < 4 || !AP.some(function (x) { return x !== hid && AP.some(function (y) { return y !== x && y !== hid && okS(x, y) && !HK.lockBlocks(x, y); }); }))) { e = VA.EVENTS.filter(function (x) { return x.id === 'amaama'; })[0] || e; fx = e.fx; }
        /* 気になる相手も、恋愛になりうる組から */
        /* 両片想いの二人がいれば、その二人に（片想いの「気になる」ではなく、すれ違いの文に） */
        if (fx.crush && !pinTie(a, b)) {
          var pp = [];
          AP.forEach(function (x) { AP.forEach(function (y) { if (x !== y && x !== hid && y !== hid && pinTie(x, y)) pp.push([x, y]); }); });
          if (pp.length && rng() < 0.75) { var pq = rng.pick(pp); a = pq[0]; b = pq[1]; }
        }
        if (fx.crush && pinTie(a, b) && VA.CRUSH_PINING) e = { id: e.id, t: VA.CRUSH_PINING, fx: fx, pin: 1 };
        else if (fx.crush && !okS(a, b)) {
          var cb = AP.filter(function (x) { return x !== a && x !== hid && okS(a, x); });
          if (cb.length) b = rng.pick(cb); else { e = VA.EVENTS.filter(function (x) { return x.id === 'rating'; })[0] || e; fx = e.fx; }
        }
        if (fx.dressing) {
          var bestv = -1;
          AP.forEach(function (x) { AP.forEach(function (y) { if (x.i < y.i && x !== hid && y !== hid && okS(x, y) && !HK.lockBlocks(x, y)) { var v = (x.att[y.i] || 0) + (y.att[x.i] || 0) + (/lover|mate|fwb/.test(tie(x, y)) ? 4 : 0) + rng() * 2; if (v > bestv) { bestv = v; a = x; b = y; } } }); });
          a.away = 1; b.away = 1; a.wentAway = b.i; b.wentAway = a.i;
          a.att[b.i] = (a.att[b.i] || 0) + 3; b.att[a.i] = (b.att[a.i] || 0) + 3;
          if (a.titles.indexOf('楽屋に消えた人') < 0) a.titles.push('楽屋に消えた人');
          if (b.titles.indexOf('楽屋に消えた人') < 0) b.titles.push('楽屋に消えた人');
          rating += 1.5;
          AP = AP.filter(function (x) { return !x.away; });
        }
        if (fx.amaama) { AP.forEach(function (x) { if (x !== a) x.m.arouse = clamp(x.m.arouse + 22, 0, 100); }); a.m.pop = clamp(a.m.pop + 10, 0, 100); rating += 1; if (a.titles.indexOf('甘々ボイスの破壊神') < 0) a.titles.push('甘々ボイスの破壊神'); }
        if (fx.double) dbl = true;
        if (fx.shame) { a.m.shame = clamp(a.m.shame + fx.shame, 0, 100); a.cnt.accident++; }
        if (fx.pop) a.m.pop = clamp(a.m.pop + fx.pop, 0, 100);
        if (fx.score) a.m.score += fx.score;
        if (fx.rating) rating += fx.rating;
        if (fx.arouse) { a.m.arouse = clamp(a.m.arouse + fx.arouse, 0, 100); heatV(a); }
        if (fx.crush) { a.att[b.i] = (a.att[b.i] || 0) + 2; b.att[a.i] = (b.att[a.i] || 0) + 1; }
        if (fx.fight) { a.att[b.i] = (a.att[b.i] || 0) - 1; }
        var low = null;
        if (fx.underdog) { low = P.slice().sort(function (x, y) { return x.m.score - y.m.score; })[0]; low.m.score += fx.underdog; }
        var et = (fx.amaama && VA.AMA_FRAME ? ST.fmt(pkv(VA.AMA_FRAME), { a: a.name, q: a.name + pkv(VA.AMA[a.persona] || VA.AMA.gentle), s: VA.STIR ? pkv(VA.STIR) : '共演者たちがざわついた' }) : fill(pkv(e.t), a, b)) + (fx.dressing ? mcr('away', 1) : fx.amaama ? mcr('amaama', 0.8) : fx.shame ? mcr('accident', 0.6) : '');
        sayV({ actors: fx.double || fx.underdog ? (low ? [low] : []) : fx.crush || fx.fight || fx.dressing ? [a, b] : [a], tag: fx.dressing ? '楽屋から戻らない' : fx.amaama ? '甘々ボイス' : 'ハプニング', text: et + (low ? low.name + 'に二十点が入った。' : ''), why: e.pin ? '両片想いの二人（どちらも、相手は自分を何とも思っていないと思っている）' : fx.double ? 'この企画の得点は二倍' : fx.score ? '+' + fx.score + '点' : fx.underdog ? '最下位救済' : fx.dressing ? '企画で何度も絡んだ二人（この企画は欠場）' : fx.amaama ? '共演者全員の興奮 +22（我慢が効く企画で不利に）' : '', mag: fx.dressing ? 32 : 18 });
      }
      var res = playCorner(K, dbl, AP, hid);
      /* 性格が見える出来事 */
      if (VA.CHAR_EV && rng() < 0.4) {
        var ce = HK.weighted(rng, VA.CHAR_EV, function (x) { return 1 / (1 + (S.flags['ce_' + x.id] || 0) * 4); });
        var cAct = P.filter(function (p) { return !p.away; });
        if (ce.id === 'sore') cAct = cAct.filter(function (x) { return x !== res.first; });
        var who = cAct.slice().sort(function (x, y) { return ce.fit(y.tr, y) - ce.fit(x.tr, x); })[0];
        if (who && ce.fit(who.tr, who) > 0.45 && !(ce.id === 'flirt' && !cAct.some(function (x) { return x !== who && okS(who, x); }))) {
          S.flags['ce_' + ce.id] = (S.flags['ce_' + ce.id] || 0) + 1;
          var oth = rng.pick(cAct.filter(function (x) { return x !== who && (ce.id !== 'flirt' || okS(who, x)); })) || who;
          if (ce.id === 'kind' && res.last && res.last !== who) oth = res.last;
          var cf = ce.fx;
          if (cf.score) who.m.score += cf.score;
          if (cf.pop) who.m.pop = clamp(who.m.pop + cf.pop, 0, 100);
          if (cf.shame) who.m.shame = clamp(who.m.shame + cf.shame, 0, 100);
          if (cf.attB) { who.att[oth.i] = (who.att[oth.i] || 0) + cf.attB; if (cf.attB > 0) oth.att[who.i] = (oth.att[who.i] || 0) + 1; }
          if (cf.rivalArouse) oth.m.arouse = clamp(oth.m.arouse + cf.rivalArouse, 0, 100);
          if (ce.title && who.titles.indexOf(ce.title) < 0) who.titles.push(ce.title);
          sayBV({ actors: oth !== who ? [who, oth] : [who], tag: ce.title, text: ST.fmt(pkv(ce.t), { a: who.name, b: oth.name, mc: mc }), why: '性格が出た：' + ce.why + (cf.score ? '／+' + cf.score + '点' : ''), mag: 16 }, who.name + '：' + ce.title, true);
        }
      }
      /* 罰ゲーム */
      var lasts = (res.lasts || (res.last ? [res.last] : [])).filter(function (x) { return x !== hid; });
      /* 罰ゲームの頻度：「毎回」（100）なら必ず。最下位の決まらない企画（全員が脱落せず・当てられる側が最下位など）は、ここまでの得点がいちばん低い人 */
      var penOn = env.penalty >= 100 || rng() < env.penalty / 100 * 0.7, penWhy = 'この企画の最下位';
      if (penOn && !lasts.length && !(res.last && res.last !== hid)) {
        var low = AP.filter(function (x) { return x !== hid; }).sort(function (a2, b2) { return a2.m.score - b2.m.score; })[0];
        if (low) { res.last = low; penWhy = 'この企画では最下位が決まらず、ここまでの得点がいちばん低い'; }
      }
      if (lasts.length > 1 && VA.PENALTY_PAIR && penOn) {
        var l2 = lasts.slice(), safe2 = !grpOk(l2);
        l2.forEach(function (x) { x.cnt.penalty++; x.m.shame = clamp(x.m.shame + 18, 0, 100); x.m.pop = clamp(x.m.pop + 6, 0, 100); });
        rating += 0.8;
        sayBV({ actors: l2, tag: '罰ゲーム', text: fmtN(safe2 ? 'PENALTY_SAFE' : 'PENALTY_PAIR', l2) + (rng() < 0.6 ? quote(l2[0], VA.LOSE) : '') + mcr('penalty', 0.45), why: 'この企画の同率最下位', mag: 24 }, nmList(l2) + 'は罰ゲーム', true);
      } else if (res.last && res.last !== hid && penOn) {
        var lp = res.last;
        lp.cnt.penalty++; lp.m.shame = clamp(lp.m.shame + 18, 0, 100); lp.m.pop = clamp(lp.m.pop + 6, 0, 100); rating += 0.5;
        /* 新企画は、その企画専用の罰ゲーム（攻めの指定の人には受けない罰。モブには受けの人は、スタッフの罰を受ける） */
        var kpen = K.pen && rng() < 0.85 ? (hTopN(lp) ? K.penTop || null : K.pen) : null;
        sayBV({ actors: [lp], tag: '罰ゲーム', text: fill(kpen ? pkv(kpen) : pkv(hTop(lp) ? VA.PENALTY.filter(function (x) { return !VA.PENALTY_RECV_RE.test(x); }).concat(VA.PENALTY_TOP) : VA.PENALTY), lp) + (rng() < 0.5 ? quote(lp, VA.LOSE) : '') + mcr('penalty', 0.45), why: penWhy, mag: 22 }, lp.name + 'は罰ゲーム', true);
      }
      if (rng() < 0.25) sayIf({ kind: 'phase', text: fill(pkv(VA.MC_SAY)) });
      ST.flushShort(S, 'ほかの結果：');
      /* 楽屋から戻ってくる */
      var pairDone = {};
      P.forEach(function (p) {
        if (!p.away || pairDone[p.i]) return;
        var q = P[p.wentAway]; pairDone[p.i] = 1; if (q) pairDone[q.i] = 1;
        if (!p.awayDone && rng() < 0.35 && c < env.corners - 1) { p.awayDone = true; if (q) q.awayDone = true; return; }
        p.away = 0; p.awayDone = false; if (q) { q.away = 0; q.awayDone = false; }
        sayV({ actors: q ? [p, q] : [p], tag: '楽屋から戻った', text: ST.fmt(pkv(VA.RETURN), { a: p.name, b: q ? q.name : '', mc: mc }) + (function () { var lv = P.filter(function (x) { return x !== p && x !== q && ((/lover|mate/.test(tie(x, p))) || (q && /lover|mate/.test(tie(x, q)))); })[0]; return lv ? lv.name + 'は、恋人が楽屋で何をしていたのか察した。顔は笑っていたが、目は笑っていなかった。' : ''; })(), why: '楽屋にいたあいだの企画は欠場（得点なし）', mag: 20 });
      });
      sayV({ kind: 'phase', actors: P.map(function (p) { return p.i; }), text: '途中経過：' + P.slice().sort(function (x, y) { return y.m.score - x.m.score; }).map(function (p) { return p.name + ' ' + Math.round(p.m.score) + '点'; }).join('／') });
      P.forEach(function (p) { p.m.arouse = clamp(p.m.arouse - 8, 0, 100); heatV(p); });
      /* 恥じらい派が、途中で番組に順応する */
      P.forEach(function (p) {
        if (p.mood === 'shy' && c >= 1 && !p.away && VA.ATT && rng() < 0.12 + p.tr.fc * 0.35 + p.cnt.climax * 0.04) {
          p.mood = 'nori'; p.adapted = true; if (p.titles.indexOf('順応の早い人') < 0) p.titles.push('順応の早い人');
          sayIf({ actors: [p], tag: '順応', text: fill(pkv(VA.ATT.adapt), p), why: '恥じらっていたが、FC（' + Math.round(p.eg.FC) + '）と場の熱に流された', mag: 16 });
        }
      });
      ST.snap(S, keys);
    }

    /* ---------- 企画ごとの進行 ---------- */
    function playCorner(K, dbl, P, hid) {
      var out = { last: null };
      if (K.type === 'guess') return guessCorner(K, dbl, P, hid);
      if (K.mode === 'tally') return tallyCorner(K, dbl, P);
      if (K.type === 'pair') return pairCorner(K, dbl, P);
      if (K.type === 'each' || K.type === 'vote') {
        var rows = P.map(function (p) { return { p: p, v: skill(p, K.stat) + (K.type === 'vote' ? p.m.pop * 0.25 : 0) }; }).sort(function (x, y) { return y.v - x.v; });
        /* 同率：表示する点（四捨五入）が同じなら同じ順位・同じ得点 */
        rows.forEach(function (r) { r.rv = Math.round(r.v); });
        rows.forEach(function (r) { r.rk = 1 + rows.filter(function (q) { return q.rv > r.rv; }).length; });
        var minRv = rows[rows.length - 1].rv, allTie = rows.every(function (r) { return r.rv === rows[0].rv; });
        var usedPlay = {};
        var tops = rows.filter(function (r) { return r.rk === 1; }), bots = allTie ? [] : rows.filter(function (r) { return r.rv === minRv; });
        rows.forEach(function (r, i) {
          var top = r.rk === 1, bot = !allTie && r.rv === minRv, p = r.p, good = top ? r.v >= 40 : bot && rows.length > 2 ? false : r.v >= 58;
          var oc = /告白|アクリル|密着/.test(K.name) ? P.filter(function (x) { return x !== p && okS(p, x); }) : [];
          var other = oc.length ? rng.pick(oc) : null;
          /* 攻めの指定の人が「される」企画：アシスタントを相手に、責める側でこなす */
          var fl = hTop(p) && VA.TOP_SIDE && VA.TOP_SIDE[K.name];
          if (other) { p.att[other.i] = (p.att[other.i] || 0) + (good ? 2 : 1); if (good) other.att[p.i] = (other.att[p.i] || 0) + 1; }
          var bn = other ? other.name : assist(p, K);
          var pl0 = pkv((fl && fl.play) || K.play), t = att(p, 0.3) + ST.fmt(usedPlay[pl0] ? pkv(NEXT_UP) : pl0, { a: p.name, b: bn, mc: mc }) + ST.fmt(pkv(good ? (fl && fl.hit) || K.hit : (fl && fl.miss) || K.miss), { a: p.name, b: bn, mc: mc });
          usedPlay[pl0] = 1;
          var climaxed = !fl && (K.stat === 'gaman' && !good && K.name !== '連続絶頂記録') || (K.name === '連続絶頂記録' && good) || (/イキ顔|実況|喘ぎ声|フェラ当て/.test(K.name) && rng() < 0.6);
          if (climaxed) { climax(p, K.name === '連続絶頂記録' ? 3 + rng.int(6) : 1); t += moan(p); }
          if (top) t += quote(p, climaxed && VA.WIN_HOT ? VA.WIN_HOT : VA.WIN) + mcr('win'); else if (bot && rng() < 0.6) t += quote(p, VA.LOSE) + mcr('lose', 0.4); else if (climaxed) t += mcr('climax', 0.35);
          if (top) { giveTitle(p, K, 0); if (!out.first) out.first = p; } if (bot && rows.length > 1) giveTitle(p, K, 1);
          var pt = PTS[r.rk - 1] || 0;
          addPts(p, pt, dbl);
          if (top && tops.length > 1 && r === tops[0] && VA.TIE_TOP) t += fmtN('TIE_TOP', tops.map(function (x) { return x.p; }));
          if (bot && bots.length > 1 && r === bots[bots.length - 1] && VA.TIE_BOTTOM) t += fmtN('TIE_BOTTOM', bots.map(function (x) { return x.p; }));
          if (top) p.cnt.first++;
          if (bot) p.cnt.last++;
          if (good) p.m.pop = clamp(p.m.pop + 4, 0, 100);
          else p.m.shame = clamp(p.m.shame + 6, 0, 100);
          var rl = r.rk + '位' + (rows.filter(function (q) { return q.rk === r.rk; }).length > 1 ? '（同率）' : '');
          sayBV({ actors: [p], tag: rl, text: t, why: K.name + '：' + STAT[K.stat] + 'の出来 ' + r.rv + '／+' + pt * (dbl ? 2 : 1) + '点', mag: top ? 28 : 14, kind: climaxed ? 'climax' : 'event' }, p.name + ' ' + rl + (climaxed ? '（撃沈）' : ''), top || (bot && rows.length > 2));
        });
        out.last = rows[rows.length - 1].p;
        out.lasts = bots.length ? bots.map(function (x) { return x.p; }) : [out.last];
        return out;
      }
      if (K.type === 'endure') {
        /* 攻めの指定の人は、体を責められる耐久には乗らず、別の形で番組に参加する */
        /* 新企画（K.etop）は、モブには受けの人なら耐久に乗る（hardTopNpc） */
        var ET = K.etop || (VA.ENDURE_TOP && VA.ENDURE_TOP[K.name]), eTop = K.etop ? hTopN : hTop;
        var outs = ET && ET.out ? P.filter(eTop) : [];
        outs.forEach(function (p) {
          addPts(p, 10, dbl);
          sayBV({ actors: [p], tag: '別枠で参加', text: fill(pkv(ET.out), p) + mcr('win', 0.3), why: '攻めの指定：責められる側の耐久には乗らない／+' + 10 * (dbl ? 2 : 1) + '点', mag: 18 }, p.name + 'は別枠', true);
        });
        var P2 = P.filter(function (p) { return outs.indexOf(p) < 0; });
        if (!P2.length) return out;
        var order = P2.map(function (p) { return { p: p, v: skill(p, K.stat) }; }).sort(function (x, y) { return x.v - y.v; });
        sayIf({ kind: 'phase', text: fill(pkv(K.play)) });
        /* 同率：粘り（四捨五入）が同じなら、同時に脱落／同時優勝 */
        order.forEach(function (r) { r.rv = Math.round(r.v); });
        var maxRv = order[order.length - 1].rv, minRv2 = order[0].rv;
        var winners = order.filter(function (r) { return r.rv === maxRv; }), firstOut = maxRv === minRv2 ? [] : order.filter(function (r) { return r.rv === minRv2; });
        order.forEach(function (r, i) {
          var p = r.p, win = r.rv === maxRv, rank = 1 + order.filter(function (q) { return q.rv > r.rv; }).length;
          var tp = eTop(p) && ET ? (win ? ET.hit : ET.miss) : null;
          var t = att(p, 0.22) + fill(pkv(tp || (win ? K.hit : K.miss)), p);
          if (win && winners.length > 1) t = att(p, 0.22) + (r === winners[0] ? fmtN('ENDURE_TIE', winners.map(function (x) { return x.p; })) : '');
          if (!win && firstOut.length > 1 && r === firstOut[0] && VA.ENDURE_TIE_OUT) t += fmtN('ENDURE_TIE_OUT', firstOut.map(function (x) { return x.p; }));
          if (eTop(p) && ET) { /* 攻めの指定：責められて果てる文にしない */ }
          else if (K.plus && win) { /* 新企画の耐久：最後まで残った人はイっていない */ }
          else if ((K.stat === 'gaman' && !/笑|吹き出|拒否/.test(t)) || (K.stat !== 'gaman' && rng() < 0.3 && /喘|声|果て|イっ|達/.test(t))) { climax(p, 1); if (!win) t += (K.plus ? plusCl(p) : '') + moan(p) + (K.plus ? plusEro(K.ero, p) : ''); }
          if (win) { t += numFix(quote(p, winners.length > 1 && VA.WIN_TIE ? VA.WIN_TIE : VA.WIN), winners.length) + mcr(winners.length === 2 ? 'draw' : 'win'); p.cnt.first++; giveTitle(p, K, 0); if (!out.first) out.first = p; }
          var isFirstOut = !win && r.rv === minRv2;
          if (isFirstOut) { giveTitle(p, K, 1); if (!tp) t += mcr('climax', 0.4); }
          var pts = win ? 30 : rank === 2 ? 18 : rank === 3 ? 10 : 2;
          addPts(p, pts, dbl);
          if (isFirstOut) p.cnt.last++;
          sayBV({ actors: [p], tag: win ? (winners.length > 1 ? '同時優勝' : '優勝') : rank + '位で脱落' + (order.filter(function (q) { return q.rv === r.rv; }).length > 1 ? '（同着）' : ''), text: t, why: K.name + '：' + STAT[K.stat] + 'の粘り ' + Math.round(r.v) + '／+' + pts * (dbl ? 2 : 1) + '点', mag: win ? 30 : 12, kind: 'climax' }, p.name + (win ? '優勝' : '脱落'), win || i === 0);
        });
        out.last = order[0].p;
        out.lasts = firstOut.length ? firstOut.map(function (x) { return x.p; }) : [out.last];
        if (!firstOut.length) out.last = null;
        return out;
      }
      if (K.type === 'duel') {
        /* 組み合わせ：体の関係を持ってよい組（okSex）を優先して組む */
        var rest = shuffle(rng, P), sh = [], worst = null, wv = 1e9;
        while (rest.length > 1) {
          var a0 = rest.shift(), j0 = 0;
          for (var q = 0; q < rest.length; q++) if (okS(a0, rest[q])) { j0 = q; break; }
          sh.push(a0, rest.splice(j0, 1)[0]);
        }
        var bye = rest.length ? rest[0] : null;
        if (bye) { addPts(bye, 5, dbl); sayBV({ actors: [bye], tag: 'シード', text: bye.name + 'はくじ引きでシードになり、高みの見物を決め込んだ。', why: '+5点' }, bye.name + 'はシード'); }
        for (var i = 0; i < sh.length; i += 2) {
          var a = sh[i], b = sh[i + 1], va = skill(a, K.stat), vb = skill(b, K.stat);
          var w = va >= vb ? a : b, l = w === a ? b : a, draw = Math.abs(va - vb) < 5;
          var t = fill(pkv(K.play), a, b);
          var ty = tie(a, b);
          if (ty === 'lover' || ty === 'mate' || ty === 'fwb') t += 'まさかの恋人同士の対決に、スタジオが沸いた。';
          else if (ty === 'rival' || ty === 'enemy') t += '因縁の二人の対決に、スタジオの空気が張り詰めた。';
          /* 向きの決まらない組：アシスタントを相手に、別々に同じ勝負をする */
          if (!okS(a, b) && VA.DUEL_NG) {
            t = fill(pkv(VA.DUEL_NG.play), a, b);
            if (draw) { t += fill(pkv(VA.DUEL_NG.draw), a, b); addPts(a, 10, dbl); addPts(b, 10, dbl); sayBV({ actors: [a, b], tag: '引き分け', text: t, why: K.name + '（別々に対戦）：' + a.name + ' ' + Math.round(va) + ' 対 ' + b.name + ' ' + Math.round(vb) + '／両者+10点', mag: 18 }, a.name + '×' + b.name + '＝引き分け', i === 0); continue; }
            t += fill(pkv(VA.DUEL_NG.hit), w, l) + quote(w, VA.WIN) + (rng() < 0.5 ? quote(l, VA.LOSE) : '');
            addPts(w, 25, dbl); addPts(l, 3, dbl); w.cnt.first++;
            if (Math.min(va, vb) < wv) { wv = Math.min(va, vb); worst = l; }
            if (!out.best || Math.max(va, vb) > out.bv) { out.best = w; out.bv = Math.max(va, vb); }
            sayBV({ actors: [w, l], tag: w.name + 'の勝ち', text: t, why: K.name + '（別々に対戦）：' + a.name + ' ' + Math.round(va) + ' 対 ' + b.name + ' ' + Math.round(vb) + '／勝者+25点', mag: 22 }, w.name + '○－●' + l.name, i === 0);
            continue;
          }
          a.att[b.i] = (a.att[b.i] || 0) + 1; b.att[a.i] = (b.att[a.i] || 0) + 1;
          /* 向きの決まっている組：攻め（HK.Pos.order の先頭）が責め、受けが耐える。受けが勝つのは耐えきったとき */
          var DP = PO && PO.fixed(a, b) && VA.DUEL_POS && VA.DUEL_POS[K.name];
          if (DP) {
            var oT = ord(a, b), T0 = oT[0], B0 = oT[1], vT = T0 === a ? va : vb, vB = T0 === a ? vb : va;
            t = fill(pkv(DP.play), T0, B0) + (ty === 'lover' || ty === 'mate' || ty === 'fwb' ? 'まさかの恋人同士の対決に、スタジオが沸いた。' : ty === 'rival' || ty === 'enemy' ? '因縁の二人の対決に、スタジオの空気が張り詰めた。' : '');
            if (draw) {
              t += fill(pkv(VA.DUEL_POS_DRAW), T0, B0);
              addPts(a, 10, dbl); addPts(b, 10, dbl);
              sayBV({ actors: [T0, B0], tag: '引き分け', text: t, why: K.name + '：' + a.name + ' ' + Math.round(va) + ' 対 ' + b.name + ' ' + Math.round(vb) + '／両者+10点', mag: 22 }, a.name + '×' + b.name + '＝引き分け', i === 0);
              continue;
            }
            var tw = vT >= vB;
            w = tw ? T0 : B0; l = tw ? B0 : T0;
            t += fill(pkv(tw ? DP.win : DP.hold), T0, B0);
            if (tw && K.stat !== 'brain' && K.stat !== 'luck') { climax(B0, 1); t += moan(B0); }
            t += quote(w, VA.WIN) + (rng() < 0.5 ? quote(l, VA.LOSE) : '');
            addPts(w, 25, dbl); addPts(l, 3, dbl); w.cnt.first++;
            if (i === 0) t += mcr(Math.abs(va - vb) > 30 ? 'win' : 'climax', 0.6);
            if (Math.min(va, vb) < wv) { wv = Math.min(va, vb); worst = l; }
            if (!out.best || Math.max(va, vb) > out.bv) { out.best = w; out.bv = Math.max(va, vb); }
            sayBV({ actors: [w, l], tag: w.name + 'の勝ち', text: t, why: K.name + '：' + a.name + ' ' + Math.round(va) + ' 対 ' + b.name + ' ' + Math.round(vb) + '／勝者+25点（責めるのは' + T0.name + '）', mag: 26, kind: tw ? 'climax' : 'event' }, w.name + '○－●' + l.name, i === 0);
            continue;
          }
          if (draw) {
            t += fill(pkv(K.miss), a, b);
            if (K.stat !== 'brain') { climax(a, 1); climax(b, 1); t += moan(a); }
            addPts(a, 10, dbl); addPts(b, 10, dbl); t += mcr('draw', 0.7);
            sayBV({ actors: [a, b], tag: '引き分け', text: t, why: K.name + '：' + a.name + ' ' + Math.round(va) + ' 対 ' + b.name + ' ' + Math.round(vb) + '／両者+10点', mag: 22, kind: 'climax' }, a.name + '×' + b.name + '＝引き分け', i === 0);
          } else {
            t += fill(pkv(K.hit), w, l);
            if (K.stat !== 'brain' && K.stat !== 'luck') { climax(l, 1); t += moan(l); }
            t += quote(w, VA.WIN) + (rng() < 0.5 ? quote(l, VA.LOSE) : '');
            addPts(w, 25, dbl); addPts(l, 3, dbl); w.cnt.first++;
            if (i === 0) t += mcr(Math.abs(va - vb) > 30 ? 'win' : 'climax', 0.6);
            var lv = Math.min(va, vb), hv = Math.max(va, vb);
            if (lv < wv) { wv = lv; worst = l; }
            if (!out.best || hv > out.bv) { out.best = w; out.bv = hv; }
            sayBV({ actors: [w, l], tag: w.name + 'の勝ち', text: t, why: K.name + '：' + a.name + ' ' + Math.round(va) + ' 対 ' + b.name + ' ' + Math.round(vb) + '／勝者+25点', mag: 26, kind: 'climax' }, w.name + '○－●' + l.name, i === 0);
          }
        }
        if (worst) { worst.cnt.last++; giveTitle(worst, K, 1); }
        if (out.best) { giveTitle(out.best, K, 0); out.first = out.best; }
        out.last = worst;
        return out;
      }
      /* チーム対抗 */
      /* 体を寄せ合う企画もあるので、血縁（恋愛：なし）の二人は別々のチームに分ける */
      var A = [], B = [], kinIn = function (T0) { return T0.some(function (x) { return T0.some(function (y) { return x !== y && kinBlock(x, y); }); }); };
      for (var tries = 0; tries < 30; tries++) {
        var sh2 = shuffle(rng, P); A = []; B = [];
        sh2.forEach(function (p, i) { (i % 2 ? B : A).push(p); });
        if (!kinIn(A) && !kinIn(B)) break;
      }
      var nA = 'チーム' + A[0].name, nB = 'チーム' + B[0].name;
      var sA = A.reduce(function (s, p) { return s + skill(p, K.stat); }, 0) / A.length, sB = B.reduce(function (s, p) { return s + skill(p, K.stat); }, 0) / B.length;
      var W = sA >= sB ? A : B, Lo = W === A ? B : A, nW = W === A ? nA : nB, nL = W === A ? nB : nA;
      var tt = ST.fmt(pkv(K.play), { A: nA, B: nB, mc: mc }) + ST.fmt(pkv(K.hit), { A: nW, B: nL, mc: mc }) + ST.fmt(pkv(K.miss), { A: nW, B: nL, mc: mc });
      W.forEach(function (p) { addPts(p, 18, dbl); p.cnt.first++; });
      Lo.forEach(function (p) { addPts(p, 4, dbl); if (K.stat === 'tech' && rng() < 0.4) climax(p, 1); });
      giveTitle(W[0], K, 0); out.first = W[0];
      sayBV({ actors: P, tag: nW + 'の勝ち', text: tt + quote(W[0], VA.WIN) + mcr('team', 0.7), why: K.name + '：' + nA + '（' + A.map(function (p) { return p.name; }).join('・') + '）' + Math.round(sA) + ' 対 ' + nB + '（' + B.map(function (p) { return p.name; }).join('・') + '）' + Math.round(sB) + '／勝ったチームは一人+18点', mag: 26 }, '', true);
      var lw = Lo.slice().sort(function (x, y) { return x.m.score - y.m.score; })[0];
      lw.cnt.last++; giveTitle(lw, K, 1);
      out.last = lw;
      return out;
    }

    /* ---------- 新企画（solo-variety-plus.js）の部品 ---------- */
    function kan(n) { var KAN = ['ゼロ', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五']; return KAN[n] != null ? KAN[n] : String(n); }
    /* イったときの反応（態度9種）。描写が「ぼかす」なら出さない */
    function plusCl(p) { if (lew === 'low' || !VA.PLUS_CLIMAX) return ''; return fill(pkv(VA.PLUS_CLIMAX[p.persona] || VA.PLUS_CLIMAX.gentle), p); }
    /* 男性向けの作風：イった場面に足す段（who＝受けてイった人。{a}{b} は vars で） */
    function plusEro(l, who, vars) {
      if (!ero || !l || !l.length) return '';
      return ST.fmt(HK.Ero.fill(S, pkv(l), who), vars || { a: who.name, mc: mc });
    }
    /* 数で競う企画：数＝能力の出来から（最低 min・最高 max）。点＝数×per、一位にボーナス */
    function tallyCorner(K, dbl, P) {
      /* 「ほかの結果」のまとめ（一文に複数人が並ぶ）には、性的な語を入れない */
      var out = { last: null }, T = K.tally, usedPlay = {};
      var rows = P.map(function (p) {
        var v = skill(p, K.stat) + (K.type === 'vote' ? p.m.pop * 0.25 : 0);
        return { p: p, v: v, n: clamp(Math.round((v - 12) / 85 * T.max), T.min || 0, T.max) };
      }).sort(function (x, y) { return y.n - x.n || y.v - x.v; });
      rows.forEach(function (r) { r.rk = 1 + rows.filter(function (q) { return q.n > r.n; }).length; });
      var minN = rows[rows.length - 1].n, allTie = rows.every(function (r) { return r.n === rows[0].n; });
      var tops = rows.filter(function (r) { return r.rk === 1; }), bots = allTie ? [] : rows.filter(function (r) { return r.n === minN; });
      rows.forEach(function (r) {
        var p = r.p, top = r.rk === 1, bot = !allTie && r.n === minN;
        var band = r.n >= T.hi ? 'hit' : r.n <= T.lo ? 'miss' : 'mid';
        /* 攻めの指定の人（モブには受けの人を除く）：アシスタントを責める側でこなす。受ける文の段（mid）は使わない */
        var fl = K.top && hTopN(p) ? K.top : null;
        var bn = assist(p, K), v0 = { a: p.name, b: bn, mc: mc, n: kan(r.n), w: kan(T.max - r.n), n1: kan(r.n + 1) };
        var pl0 = pkv(fl ? fl.play : K.play);
        var res0 = fl ? (band === 'miss' ? fl.miss : fl.hit) : K[band];
        var t = att(p, 0.3) + ST.fmt(usedPlay[pl0] ? pkv(NEXT_UP) : pl0, v0) + ST.fmt(pkv(res0), v0);
        usedPlay[pl0] = 1;
        var climaxed = !fl && !!K.cl && band === 'miss';
        if (climaxed) { climax(p, 1); t += plusCl(p) + moan(p) + plusEro(K.ero, p); }
        if (top) t += quote(p, climaxed && VA.WIN_HOT ? VA.WIN_HOT : VA.WIN) + mcr('win'); else if (bot && rng() < 0.6) t += quote(p, VA.LOSE) + mcr('lose', 0.4); else if (climaxed) t += mcr('climax', 0.35);
        if (top) { giveTitle(p, K, 0); if (!out.first) out.first = p; } if (bot && rows.length > 1) giveTitle(p, K, 1);
        var pt = r.n * T.per + (top ? T.bonus || 0 : 0);
        addPts(p, pt, dbl);
        if (top && tops.length > 1 && r === tops[0] && VA.TIE_TOP) t += fmtN('TIE_TOP', tops.map(function (x) { return x.p; }));
        if (bot && bots.length > 1 && r === bots[bots.length - 1] && VA.TIE_BOTTOM) t += fmtN('TIE_BOTTOM', bots.map(function (x) { return x.p; }));
        if (top) p.cnt.first++;
        if (bot) p.cnt.last++;
        if (band !== 'miss') p.m.pop = clamp(p.m.pop + 4, 0, 100); else p.m.shame = clamp(p.m.shame + 6, 0, 100);
        var rl = r.rk + '位' + (rows.filter(function (q) { return q.rk === r.rk; }).length > 1 ? '（同率）' : '');
        sayBV({ actors: [p], tag: rl, text: t, why: K.name + '：' + T.lab + ' ' + r.n + (T.ctr || T.unit) + '（' + STAT[K.stat] + 'の出来 ' + Math.round(r.v) + '）／' + r.n + '×' + T.per + '点' + (top && T.bonus ? '＋一位' + T.bonus + '点' : '') + '＝+' + pt * (dbl ? 2 : 1) + '点' + (fl ? '／攻めの指定：アシスタントを責める側' : ''), mag: top ? 28 : 14, kind: climaxed ? 'climax' : 'event' }, p.name + ' ' + rl + (climaxed ? '（撃沈）' : ''), top || (bot && rows.length > 2));
      });
      out.last = rows[rows.length - 1].p;
      out.lasts = bots.length ? bots.map(function (x) { return x.p; }) : [out.last];
      return out;
    }
    /* 二人一組の企画：住人どうしは okSex の組だけ（攻め＝手を動かす側）。組めない人はアシスタントと組む */
    function pairCorner(K, dbl, P) {
      var out = { last: null }, rest = shuffle(rng, P), units = [];
      while (rest.length) {
        var a0 = rest.shift(), j0 = -1;
        for (var q = 0; q < rest.length; q++) if (okS(a0, rest[q])) { j0 = q; break; }
        if (j0 < 0) { units.push({ s: a0, m: [a0] }); continue; }
        var b0 = rest.splice(j0, 1)[0], o = ord(a0, b0);
        units.push({ t: o[0], b: o[1], m: [o[0], o[1]] });
      }
      units.forEach(function (u) { u.v = u.s ? skill(u.s, K.stat) : (skill(u.t, K.stat) + skill(u.b, K.stat)) / 2; });
      units.sort(function (x, y) { return y.v - x.v; });
      var UP = [25, 15, 10, 6, 4, 3, 2, 2];
      units.forEach(function (u, i) {
        var good = u.v >= 55, king = ST.fmt(rng.pick(VA.PLUS_KING || ['王様役のゲスト']), { mc: mc }), pt = UP[i] || 2, t, actors, climaxed = false, why = '';
        /* 同じ番号の play・hit・miss をつなげる */
        var pick3 = function (G) { var pl = pkv(G.play), j = G.play.indexOf(pl), R = good ? G.hit : G.miss; return [pl, R[j % R.length]]; };
        if (u.s) {
          var p = u.s, tp = hTopN(p), G = tp ? (K.ngT || K.ng) : K.ng, bn = assist(p, K), v0 = { a: p.name, b: bn, mc: mc, k: king }, pr = pick3(G);
          t = att(p, 0.25) + ST.fmt(pr[0], v0) + ST.fmt(pr[1], v0);
          climaxed = !tp && !!G.cl && (K.clOn === 'hit' ? good : !good);
          if (climaxed) { climax(p, 1); t += plusCl(p) + moan(p) + plusEro(K.ero && K.ero.S, p, v0); }
          actors = [p]; why = tp ? '攻めの指定：アシスタントを相手に、手を動かす側' : '組める共演者がいないので、アシスタントと組む';
        } else {
          var T0 = u.t, B0 = u.b, key = PO ? (PO.isF(T0) ? (PO.isFBody(B0) ? 'FF' : 'FM') : 'M') : (T0.gender === 'f' ? (B0.gender === 'f' ? 'FF' : 'FM') : 'M');
          var G2 = K[key] || K.M, v1 = { a: T0.name, b: B0.name, mc: mc, k: king }, pr2 = pick3(G2), ty = tie(T0, B0);
          t = ST.fmt(pr2[0], v1) + (/lover|mate|fwb/.test(ty) ? 'まさかの恋人同士のペアに、スタジオが沸いた。' : '') + ST.fmt(pr2[1], v1);
          climaxed = K.clOn === 'hit' ? good : !good;
          if (climaxed) { climax(B0, 1); t += plusCl(B0) + moan(B0) + plusEro(K.ero && K.ero[key], B0, v1); }
          T0.att[B0.i] = (T0.att[B0.i] || 0) + (good ? 2 : 1); B0.att[T0.i] = (B0.att[T0.i] || 0) + (good ? 2 : 1);
          actors = [T0, B0]; why = '手を動かすのは' + T0.name;
        }
        /* 勝ったペアのひとこと：イった人がいれば、その人の息の上がった声 */
        if (i === 0) t += (climaxed && VA.WIN_HOT ? quote(u.b || u.s, VA.WIN_HOT) : quote(u.m[0], VA.WIN)) + mcr('win', 0.6);
        else if (i === units.length - 1 && units.length > 1 && rng() < 0.6) t += quote(u.m[u.m.length - 1], VA.LOSE) + mcr('lose', 0.4);
        u.m.forEach(function (x) { addPts(x, pt, dbl); if (good) x.m.pop = clamp(x.m.pop + 4, 0, 100); else x.m.shame = clamp(x.m.shame + 6, 0, 100); });
        if (i === 0) { u.m.forEach(function (x) { x.cnt.first++; giveTitle(x, K, 0); }); out.first = u.m[0]; }
        if (i === units.length - 1 && units.length > 1) u.m.forEach(function (x) { x.cnt.last++; giveTitle(x, K, 1); });
        var nm = u.m.map(function (x) { return x.name; }).join('×');
        sayBV({ actors: actors, tag: (i + 1) + '位' + (good ? '（成功）' : '（失敗）'), text: t, why: K.name + '：' + STAT[K.stat] + 'の出来 ' + Math.round(u.v) + '／' + why + '／一人+' + pt * (dbl ? 2 : 1) + '点', mag: i === 0 ? 28 : 16, kind: climaxed ? 'climax' : 'event' }, nm + ' ' + (i + 1) + '位' + (climaxed ? '（撃沈）' : ''), i === 0 || i === units.length - 1);
      });
      var lu = units[units.length - 1];
      out.last = lu.m[lu.m.length - 1];
      out.lasts = lu.m.slice();
      return out;
    }

    /* ---------- 当てっこ（共演者のちんちん当てなど） ---------- */
    function guessCorner(K, dbl, P, H) {
      var out = { last: null }, G = P.filter(function (p) { return p !== H; });
      var v0 = { h: H.name, mc: mc };
      sayBV({ actors: [H], tag: '当てられる側', text: ST.fmt(pkv(K.setup), v0), why: H.name + 'がくじで「当てられる側」に選ばれた' }, '', true);
      var rows = G.map(function (p) {
        var ty = tie(p, H), bonus = (p.att[H.i] || 0) * 5 + (/lover|mate|fwb/.test(ty) ? 25 : /childhood|best|sibling/.test(ty) ? 10 : 0);
        return { p: p, v: skill(p, 'brain') * 0.6 + skill(p, 'tech') * 0.4 + bonus, ty: ty };
      }).sort(function (x, y) { return y.v - x.v; });
      var nCorrect = 0, wrong = 0;
      var schemer = null;
      if (/ちんちん/.test(K.name) && VA.PRODUCER) {
        var cands = G.filter(function (p) { return ['shy', 'devoted', 'gentle', 'tsun'].indexOf(p.persona) < 0; }).map(function (p) { return { p: p, v: p.tr.cp * 0.35 + p.tr.a * 0.25 + p.tr.cold * 0.25 + p.tr.lead * 0.15 + (p.goal.id === 'fame' || p.goal.id === 'prize' ? 0.15 : 0) }; }).sort(function (x, y) { return y.v - x.v; });
        if (cands[0] && cands[0].v > 0.5 && rng() < 0.65) schemer = cands[0].p;
      }
      /* 触って確かめてよいのは、当てられる側と okSex で、触る側が攻めになる組だけ。ほかの人は見るだけで当てる */
      var touchN = 0;
      rows.forEach(function (r, i) {
        var p = r.p, touch = okS(p, H) && ord(p, H)[0] === p, ok = (touch ? r.v : r.v * 0.75) >= 60;
        if (p === schemer) {
          wrong++;
          p.m.score += 15; p.m.pop = clamp(p.m.pop - 3, 0, 100);
          if (p.titles.indexOf('プロデューサーのお気に入り') < 0) p.titles.push('プロデューサーのお気に入り');
          p.producer = true;
          sayBV({ actors: [p], tag: 'プロデューサーに媚びた', text: ST.fmt(pkv(VA.PRODUCER), { a: p.name }) + '――' + mc + '「ちょっと！　当てるのは' + H.name + 'さんのです！　誰のを当ててるんですか！」', why: p.name + 'の野心（CP・A・ドライさ・目標「' + p.goal.label + '」）／正解はしなかったが、プロデューサー特別点+15', mag: 26 }, p.name + 'はプロデューサーに媚びた', true);
          return;
        }
        if (touch) touchN++;
        var t = ST.fmt(pkv(touch ? K.play : VA.GUESS_LOOK), { a: p.name, h: H.name }) + ST.fmt(pkv(touch ? (ok ? K.hit : K.miss) : (ok ? VA.GUESS_LOOK_HIT : VA.GUESS_LOOK_MISS)), { a: p.name, h: H.name });
        if (/lover|mate|fwb/.test(r.ty)) t += ok ? '恋人のものを外すわけにはいかなかった。' : '恋人のものを外した。' + H.name + 'の目が据わっていた。';
        var pts = ok ? (nCorrect === 0 ? 30 : 20) : 0;
        if (ok) { nCorrect++; p.att[H.i] = (p.att[H.i] || 0) + 1; } else wrong++;
        addPts(p, pts, dbl);
        if (ok && nCorrect === 1) { p.cnt.first++; giveTitle(p, K, 0); out.first = p; t += quote(p, VA.WIN) + mcr('guess', 0.6); }
        if (!ok && i === rows.length - 1) { p.cnt.last++; giveTitle(p, K, 1); t += mcr('lose', 0.5); out.last = p; }
        sayBV({ actors: [p, H], tag: ok ? '正解' : '不正解', text: t, why: K.name + '：見抜く力 ' + Math.round(r.v) + (r.ty ? '（' + H.name + 'との関係で補正）' : '') + '／+' + pts * (dbl ? 2 : 1) + '点', mag: ok ? 24 : 14 }, p.name + (ok ? '正解' : '不正解'), (ok && nCorrect === 1) || (!ok && i === rows.length - 1));
      });
      /* 当てられる側 */
      addPts(H, wrong * 6, dbl);
      var cl = touchN ? Math.max(1, Math.floor(touchN / 2) + (rng() < 0.5 ? 1 : 0)) : 0;
      var ht = ST.fmt(pkv(touchN ? K.tease : VA.GUESS_NOTOUCH.tease), v0);
      if (cl && K.stat) { climax(H, cl); ht += moan(H); if (VA.TITLE_HIDE && VA.TITLE_HIDE[K.name] && H.titles.indexOf(VA.TITLE_HIDE[K.name]) < 0) H.titles.push(VA.TITLE_HIDE[K.name]); }
      ht += ST.fmt(pkv(touchN ? K.reveal : VA.GUESS_NOTOUCH.reveal), v0) + (cl ? mcr('climax', 0.5) : '');
      sayBV({ actors: [H], tag: '壁の向こう', text: ht, why: '見抜かれなかった人数 ' + wrong + '人×6点／触られて' + cl + '回イった', mag: 26, kind: 'climax' }, '', true);
      if (!out.last) out.last = H;
      return out;
    }

    /* ---------- 結果発表 ---------- */
    ST.step(S, '結果発表');
    ST.budget(S, 6);
    var rank = P.slice().sort(function (x, y) { return y.m.score - x.m.score || y.m.pop - x.m.pop; });
    P.forEach(function (p) { p.m.score = Math.round(p.m.score); });
    var topS = rank[0].m.score, coTop = rank.filter(function (p) { return p.m.score === topS; });
    var champ = rank[0], prize = rng.pick(VA.PRIZES), tbText = '';
    /* 同点優勝：同点決勝で決める */
    if (coTop.length > 1 && VA.TIEBREAK) {
      var tbl = VA.TIEBREAK.filter(function (x) { return x.stat !== 'gaman' || !coTop.some(hTop); });
      var tb = rng.pick(tbl.length ? tbl : VA.TIEBREAK);
      var tv = function (p) { return (tb.stat === 'pop' ? p.m.pop : tb.stat === 'luck' ? 0 : skill(p, tb.stat)) + rng() * (tb.stat === 'luck' ? 100 : 18); };
      var sc = coTop.map(function (p) { return { p: p, v: tv(p) }; }).sort(function (x, y) { return y.v - x.v; });
      champ = sc[0].p;
      var loser = sc[1].p;
      tbText = numFix(ST.fmt(pkv(tb.t), { w: champ.name, l: nmList(coTop.filter(function (p) { return p !== champ; })), mc: mc }), coTop.length);
      ST.key(S, sayV({ actors: coTop, tag: '同点決勝', text: nmList(coTop) + 'が' + topS + '点で並んだ。' + mc + '「同点です！　優勝は同点決勝で決めます！　種目は「' + tb.name + '」！」' + tbText + quote(loser, VA.LOSE), why: '最終得点が同点（' + topS + '点）／決め手：' + STAT_TB[tb.stat], mag: 34 }), '同点決勝で' + champ.name + 'が勝った');
      champ.titles.push('同点決勝の勝者');
      champ.tbWin = true; coTop.forEach(function (p) { if (p !== champ) p.tbLose = true; });
    }
    rank = P.slice().sort(function (x, y) { return (y.m.score + (y === champ ? 0.5 : 0)) - (x.m.score + (x === champ ? 0.5 : 0)) || y.m.pop - x.m.pop; });
    var key0 = function (p) { return p.m.score + (p === champ ? 0.5 : 0); };
    rank.forEach(function (p) { p.rank = 1 + rank.filter(function (q) { return key0(q) > key0(p); }).length; p.rankTie = rank.filter(function (q) { return q !== p && key0(q) === key0(p); }).length > 0; });
    var minS = rank[rank.length - 1].m.score, lasts0 = rank.filter(function (p) { return p !== champ && p.m.score === minS; }), last = lasts0[lasts0.length - 1] || rank[rank.length - 1];
    ST.key(S, sayV({ actors: [champ], tag: '優勝', text: '優勝は' + champ.name + '（' + Math.round(champ.m.score) + '点）！　紙吹雪の中、' + champ.name + 'には「' + prize + '」が贈られた。' + quote(champ, VA.WIN_CHAMP || VA.WIN), why: '企画1位 ' + champ.cnt.first + '回・絶頂 ' + champ.cnt.climax + '回', mag: 40 }), champ.name + 'が優勝');
    if (rank[1] && !champ.tbWin && rank[1].m.score >= champ.m.score - 8) sayV({ actors: [rank[1]], tag: '準優勝', text: rank[1].name + 'はわずか' + Math.round(champ.m.score - rank[1].m.score) + '点差で優勝を逃した。' + quote(rank[1], VA.LOSE), why: '接戦' });
    if (P.length >= 3 && lasts0.length > 1 && VA.FINAL_PAIR) {
      var fs = !grpOk(lasts0);
      lasts0.forEach(function (x) { x.cnt.penalty++; x.m.shame = clamp(x.m.shame + 20, 0, 100); if (!fs) climax(x, lew === 'low' ? 1 : 3); x.finalPen = true; });
      var pairTx = !fs && lasts0.length === 2 && okS(lasts0[0], lasts0[1]) ? thick('pair', ord(lasts0[0], lasts0[1])) : '';
      sayV({ actors: lasts0, tag: '最終罰ゲーム', text: pairTx || (fmtN(fs ? 'FINAL_SAFE' : 'FINAL_PAIR', lasts0) + (fs ? '' : lasts0.slice(0, 3).map(moan).join('') + (lasts0.length === 2 && okS(lasts0[0], lasts0[1]) ? eroAdd('pair', ord(lasts0[0], lasts0[1])) : ''))), why: '同点最下位（' + minS + '点）', mag: 32, kind: fs ? 'event' : 'climax' });
    } else if (P.length >= 3) {
      last.cnt.penalty++; last.finalPen = true; last.m.shame = clamp(last.m.shame + 20, 0, 100);
      /* 共演者が責める罰ゲームは、全員が last と okSex で、責める側が攻めになるときだけ */
      var costarOk = P.every(function (x) { return x === last || (okS(x, last) && ord(x, last)[0] === x); });
      var lt = hTop(last);
      var fpool = lt ? VA.FINAL_PENALTY_TOP : VA.FINAL_PENALTY.filter(function (x) { return costarOk || !/共演者/.test(x); });
      var finTx = thick(lt ? 'finalTop' : 'final', [last, last]);
      sayV({ actors: [last], tag: '最終罰ゲーム', text: finTx || (fill(pkv(fpool), last) + (lt ? '' : moan(last)) + eroAdd(lt ? 'finalTop' : 'final', [last, last])), why: '最下位（' + Math.round(last.m.score) + '点）' + (lt ? '／攻めの指定：罰ゲームでも責められる側には回らない' : ''), mag: 30, kind: lt ? 'event' : 'climax' });
      if (!lt) climax(last, lew === 'low' ? 1 : 3);
    }
    /* 恋の芽生え */
    var couples = [];
    var cand = [], usedC = {};
    P.forEach(function (a) { P.forEach(function (b) { if (a.i < b.i) { var lov = /lover|mate|fwb/.test(tie(a, b)); cand.push({ a: a, b: b, v: (a.att[b.i] || 0) + (b.att[a.i] || 0) + (lov ? 3 : 0) + (a.wentAway === b.i ? 4 : 0) + rng() * 2, lov: lov, gone: a.wentAway === b.i }); } }); });
    cand.sort(function (x, y) { return y.v - x.v; }).forEach(function (cd) {
      if (couples.length >= 2 || cd.v < 5 || usedC[cd.a.i] || usedC[cd.b.i] || HK.lockBlocks(cd.a, cd.b) || !okS(cd.a, cd.b)) return;
      usedC[cd.a.i] = usedC[cd.b.i] = 1; couples.push([cd.a, cd.b]);
      var a = cd.a, b = cd.b;
      var tx = cd.gone ? pkv(['楽屋に消えた' + a.name + 'と' + b.name + 'は、エンディングのあとも楽屋から出てこなかった。翌朝、清掃のスタッフが二人を起こした。', a.name + 'と' + b.name + 'は、番組の打ち上げにも来なかった。二人の楽屋には「起こさないでください」の札がかかっていた。'])
        : kinTie(a, b) ? pkv(['収録後、' + a.name + 'と' + b.name + 'は家族の顔に戻って、並んで家路についた。……繋いだ手だけは、最後まで離さなかった。', 'エンディングで' + mc + 'に「ご家族で出演、ありがとうございました！」と言われ、' + a.name + 'と' + b.name + 'は目を合わせずに頭を下げた。耳まで赤いのは、二人とも同じだった。', '打ち上げを抜けた' + a.name + 'と' + b.name + 'は、「家で続きね」と小声で言い合って、同じ家に帰っていった。'])
        : cd.lov ? pkv(['エンディングの最中、' + a.name + 'が' + b.name + 'の手を握った。恋人同士の公開いちゃつきに、' + mc + 'が「お幸せにー！」と叫んだ。', '収録後、' + a.name + 'と' + b.name + 'は「今日のは仕事だから」と言い合いながら、同じ家に帰っていった。'])
        : pkv(['収録後の楽屋で、' + a.name + 'は' + b.name + 'に連絡先を渡した。「……今日の企画、忘れられなくて」', 'エンディングのあと、' + a.name + 'と' + b.name + 'は二人で同じタクシーに乗り込んだ。スタッフは見て見ぬふりをした。', '翌週の週刊誌に、' + a.name + 'と' + b.name + 'の熱愛記事が載った。きっかけはあの番組だった。']);
      if (cd.gone) { var gTx = thick('gone', ord(a, b)); if (gTx) tx = gTx; else tx += eroAdd('gone', ord(a, b)); }
      ST.key(S, sayV({ actors: [a, b], tag: 'カップル成立', text: tx, why: cd.gone ? '楽屋に消えた二人' : cd.lov ? '恋人同士' : '企画やハプニングで何度も絡んだ二人', mag: 30 }), a.name + 'と' + b.name + 'がカップルに');
    });
    P.forEach(function (p) { if (p.producer && VA.PRODUCER_AFTER) sayV({ actors: [p], tag: '収録後', text: ST.fmt(pkv(VA.PRODUCER_AFTER), { a: p.name }), why: 'ちんちん当てでプロデューサーに媚びた' }); });
    rating = Math.round(rating * 10) / 10;
    sayV({ kind: 'phase', text: '番組の最高視聴率は' + rating + '％。' + (rating >= 15 ? '深夜帯としては異例の大ヒットだった。' : rating >= 11 ? '上々の数字に、プロデューサーは胸をなでおろした。' : '数字はいまひとつだったが、SNSでは一部が熱狂していた。') + (VA.MC_END ? mc + pkv(VA.MC_END) : '') });

    /* 称号 */
    function title(p) {
      var t = [];
      if (p === champ) t.push('チャンピオン');
      if (p.cnt.climax >= 6) t.push('絶頂王');
      if (p.cnt.accident >= 1 || p.m.shame >= 70) t.push('放送事故の常連');
      if (p.m.pop >= 70) t.push('お茶の間の人気者');
      if (p.cnt.penalty >= 2) t.push('罰ゲーム職人');
      if (p.cnt.first >= 3 && p !== champ) t.push('企画荒らし');
      var own = p.titles.slice(-2);
      var all = (p === champ ? ['チャンピオン'] : []).concat(own, t.filter(function (x) { return x !== 'チャンピオン'; }));
      if (!all.length) all.push(p.cnt.climax === 0 ? '鉄の我慢' : '堅実派');
      return all.filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 3).join('・');
    }
    P.forEach(function (p) {
      p.title = title(p);
      p.fate = p === champ ? '優勝（' + prize + '）' + (p.tbWin ? '・同点決勝で勝利' : '') : p.rank + '位' + (p.rankTie ? '（同率）' : '') + (p.tbLose ? '（同点決勝で惜敗）' : '') + (p.finalPen ? '（最終罰ゲーム）' : '');
      p.notes.push(Math.round(p.m.score) + '点・企画1位 ' + p.cnt.first + '回・最下位 ' + p.cnt.last + '回');
      p.notes.push('絶頂 ' + p.cnt.climax + '回・罰ゲーム ' + p.cnt.penalty + '回・羞恥 ' + Math.round(p.m.shame) + '・人気 ' + Math.round(p.m.pop));
      p.notes.push('称号「' + p.title + '」・方針「' + p.action.label + '」・目標「' + p.goal.label + '」');
    });
    var rows = rank.map(function (p) { return { i: p.i, rank: p.rank + '位' + (p.rankTie ? 'タイ' : ''), cells: [Math.round(p.m.score) + '点', String(p.cnt.first), String(p.cnt.climax), String(p.cnt.penalty), String(Math.round(p.m.pop)), p.title] }; });
    var lines = rank.map(function (p) { return p.rank + '位' + (p.rankTie ? '（同率）' : '') + ' ' + p.name + '　' + Math.round(p.m.score) + '点' + (p.tbWin ? '（同点決勝で勝利）' : p.tbLose ? '（同点決勝で惜敗）' : '') + '・称号「' + p.title + '」'; });
    lines.push('企画：' + used.map(function (k) { return k.name; }).join('→'));
    couples.forEach(function (cp) { lines.push('カップル成立：' + (HK.pairNameOf ? HK.pairNameOf(cp[0], cp[1]) : cp[0].name + '×' + cp[1].name)); });
    return ST.result(S, input, {
      ending: { title: '「' + show + '」優勝は' + champ.name + '。', kind: 'ok', lines: lines },
      estats: [['優勝', champ.name], ['最高得点', Math.round(champ.m.score) + '点'], ['企画', env.corners + '本'], ['視聴率', rating + '％']],
      table: { title: '最終成績', hint: '企画ごとの順位で得点が入る（1位30点・2位20点…、対決の勝ちは25点、チームの勝ちは18点）。ボーナスチャンスでは二倍。', cols: ['得点', '企画1位', '絶頂', '罰ゲーム', '人気', '称号'], rows: rows },
      meters: [{ label: '得点', color: '--accent', max: 200, unit: '点' }, { label: '興奮', color: '--pine', dash: true }, { label: '羞恥', color: '--warn', dash: true }, { label: '人気', color: '--love' }],
      meta: '「' + show + '」・企画' + env.corners + '本',
      summary: '「' + show + '」優勝：' + champ.name + '（' + rank.map(function (p) { return p.name + ' ' + Math.round(p.m.score); }).join('、') + '）'
    });
  }
})();
