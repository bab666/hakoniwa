/* 箱庭診断: 結末の要約（一目で分かる見出し・数字・箇条書き） */
(function () {
  'use strict';
  var HK = window.HK;
  var E = (HK.Endings = {});
  var CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';

  function ctxOf(res) {
    var C = res.chars;
    var nm = function (i) { return C[i].name; };
    var pair = function (a, b) {
      var lo = Math.min(a, b), hi = Math.max(a, b);
      return res.pairs.filter(function (p) { return p.a === lo && p.b === hi; })[0];
    };
    var names = function (list, k) {
      k = k || 10;
      var arr = list.map(function (c) { return typeof c === 'number' ? nm(c) : c.name; });
      return arr.length > k ? arr.slice(0, k).join('・') + 'ほか' + (arr.length - k) + '人（計' + arr.length + '人）' : arr.join('・');
    };
    var byFate = function (re) { return C.filter(function (c) { return re.test(c.fate); }); };
    var withLabel = function (ids) { return res.pairs.filter(function (p) { return ids.indexOf(p.label) >= 0; }); };
    var pn = function (p) { return nm(p.a) + '×' + nm(p.b); };
    /* 組の表記は攻め×受けの順（pair-name.js）。pn2 は番号で */
    if (HK.pairName) pn = function (p) { return HK.pairName(res, p); };
    var pn2 = function (a, b) { return pn({ a: a, b: b }); };
    return { C: C, nm: nm, pair: pair, names: names, byFate: byFate, withLabel: withLabel, pn: pn, pn2: pn2 };
  }

  function mainPairs(res, X, skip) {
    return res.pairs.filter(function (p) { return p.label !== 'strangers' && (!skip || !skip(p)); })
      .sort(function (a, b) { return b.intensity - a.intensity; }).slice(0, 3)
      .map(function (p) { return X.pn(p) + '＝' + (p.tie ? p.tie.label + '→' : '') + p.name + (p.surprise ? '（意外）' : ''); });
  }

  function deathLines(res, X) {
    var dead = X.C.filter(function (c) { return !c.alive && c.deathLabel; });
    dead.sort(function (a, b) {
      var ia = res.log.findIndex ? res.log.findIndex(function (e) { return e.kind === 'death' && e.actors[0] === a.i; }) : 0;
      var ib = res.log.findIndex ? res.log.findIndex(function (e) { return e.kind === 'death' && e.actors[0] === b.i; }) : 0;
      return ia - ib;
    });
    var lines = dead.map(function (c, k) {
      return (CIRC.charAt(k) || '・') + ' ' + c.deathLabel + '　' + c.name + '　' + (c.killedBy != null ? X.nm(c.killedBy) + 'の手で。' : '') + (c.deathHow || '');
    });
    var late = X.C.filter(function (c) { return !c.alive && !c.deathLabel; });
    if (late.length) lines.push((CIRC.charAt(dead.length) || '・') + ' 最後に　' + (late.length > 10 ? '残っていた' + late.length + '人全員' : X.names(late)) + '　' + (late[0].fateNote || ''));
    return lines;
  }

  E.deathLines = function (res, X) { return deathLines(res, X); };
  E.ctxOf = ctxOf;
  E.build = function (res) {
    var f = E[res.scenId];
    var X = ctxOf(res);
    var out = f ? f(res, X) : { headline: res.outcome || '', stats: [], lines: [] };
    (res.end.notes || []).forEach(function (l) { out.lines.push(l); });
    if (HK.Dark && HK.Dark.note(res)) out.lines.push(HK.Dark.note(res));   /* 展開の重さ（mood-dial.js）：ふつう以外なら一行 */
    var mp = mainPairs(res, X);
    if (mp.length) out.lines.push('主な関係：' + mp.join('、'));
    if (HK.Epilogue) HK.Epilogue.build(res, out);   /* その後・最期の言葉（epilogue.js） */
    return out;
  };

  /* ---------- オメガバース ---------- */
  E.omega = function (res, X) {
    var O = res.end.omega || {}, SX = { a: 'α', b: 'β', o: 'Ω' }, lines = [], EN = O.ending;
    var head = EN ? '結末「' + EN.title + '」――' + EN.text + (EN.timeout ? '（3年見守っても、それ以上は動かなかった）' : '') : '';
    (EN && EN.others || []).forEach(function (o) { lines.push(o.text); });
    X.C.forEach(function (c, i) { lines.push(c.name + '　' + SX[O.orig[i]] + (O.orig[i] !== O.sex[i] ? '→' + SX[O.sex[i]] : '') + '・' + O.job[i] + '　' + c.fate); });
    (O.quit || []).forEach(function (i) { lines.push(X.nm(i) + '：スイッチで' + SX[O.sex[i]] + 'になり、' + O.job[i] + 'を辞めることになった。'); });
    var dates = O.dates || [];
    if (dates.length) {
      var last = {};
      dates.forEach(function (d) { last[d.a + '-' + d.b] = d; });
      Object.keys(last).slice(0, 3).forEach(function (k) { var d = last[k]; lines.push(X.pn2(d.a, d.b) + 'の最近のデート：' + d.place); });
    }
    if ((O.gifts || []).length) { var g = O.gifts[O.gifts.length - 1]; lines.push('最後の贈り物：' + X.nm(g.from) + '→' + X.nm(g.to) + '「' + g.name + '」'); }
    if (O.cases) lines.push('探偵と助手が解決した事件：' + O.cases + '件');
    return {
      headline: head,
      stats: [['結末まで', O.months + 'か月'], ['カップル', (O.couples || []).length + '組'], ['番', (O.couples || []).filter(function (c) { return c[2]; }).length + '組'], ['愛咬', (O.amagami || 0) + '回'], ['デート', dates.length + '回'], ['発情期', (O.heats || 0) + '回']],
      lines: lines
    };
  };

  /* ---------- 出られない部屋 ---------- */
  E.whiteroom = function (res, X) {
    var ex = res.end.exits, room = res.end.room || {};
    /* 最後に取り残された人の結末（room-left.js）。あとから助け出された人は、最初に出た人と分けて数える */
    var LF = room.left && HK.RoomLeft ? room.left : null, later = LF && LF.rescued ? LF.who : [];
    var isLater = function (c) { return later.indexOf(c.i) >= 0; };
    var out = X.byFate(/脱出/).filter(function (c) { return !isLater(c); });
    var stayed = X.C.filter(function (c) { return /自分から残った/.test(c.fate) || (isLater(c) && LF.stayed.indexOf(c.i) >= 0); });
    var left = X.C.filter(function (c) { return stayed.indexOf(c) < 0 && (!/脱出/.test(c.fate) || isLater(c)); });
    var isOne = HK.roomOnlyOne ? HK.roomOnlyOne(res.env) : HK.roomRules(res.env)[0].k === 'one';
    var headline, lines = ['部屋：「' + (room.label || HK.roomLabel(res.env)) + '」'];
    if (isOne) {
      var e = ex[0];
      if (!e) headline = '誰も扉をくぐれなかった。全員がまだ部屋の中にいる。';
      else if (e.how === 'sacrifice') headline = X.nm(e.b) + 'が' + X.nm(e.a) + 'を外へ逃がし、自分は部屋に残った。';
      else headline = X.nm(e.a) + 'だけが、' + X.names(left) + 'を置いて部屋を出た。';
      if (e) lines.push(e.label + '　' + (e.how === 'sacrifice' ? X.nm(e.b) + 'が' + X.nm(e.a) + 'の背中を押した' : X.nm(e.a) + 'が' + X.nm(e.b) + 'の隙をついた'));
    } else {
      var pairs = ex.filter(function (e) { return e.group == null; }), group = ex.filter(function (e) { return e.group != null && !e.trio; })[0];
      var trios = ex.filter(function (e) { return e.trio; });
      if (group) headline = '条件を満たし、' + X.names(group.group) + 'が全員で部屋を出た。';
      else if (trios.length) headline = trios.map(function (e) { return X.names(e.group) + 'の' + (['', '', '二人', '三人', '四人', '五人'][e.group.length] || e.group.length + '人'); }).join('と') + 'が、一緒に条件を満たして部屋を出た。' + (pairs.length ? 'ほかに' + pairs.map(function (e) { return X.nm(e.a) + '×' + X.nm(e.b); }).join('、') + 'も脱出。' : '') + (left.length ? X.names(left) + 'は取り残された。' : '');
      else if (pairs.length) headline = pairs.map(function (e) { return X.pn2(e.a, e.b); }).join('、') + (pairs.length > 1 ? ' の' + pairs.length + '組' : '') + 'が成立して脱出。' + (left.length ? X.names(left) + 'は取り残された。' : '');
      else headline = '誰も条件を満たせず、' + (left.length > 2 ? '全員' : X.names(left)) + 'が部屋に取り残された。';
      if (stayed.length) headline += X.names(stayed) + 'は条件を満たしたが、自分から部屋に残った。';
      ex.forEach(function (e) {
        if (e.trio) { lines.push(e.label + '　' + X.names(e.group) + '　' + (['', '', '二人', '三人', '四人', '五人'][e.group.length] || e.group.length + '人') + 'で一緒に条件を満たして脱出。部屋を出たあとは「' + (e.bondLabel || '―') + '」'); return; }
        if (e.group != null) return;
        var p = X.pair(e.a, e.b);
        lines.push(e.label + '　' + X.pn2(e.a, e.b) + '　条件を満たして' + (e.stay != null ? X.nm(e.a) + 'が脱出（' + X.nm(e.stay) + 'は自分から残った）' : '脱出') + '。部屋を出たあとの関係は「' + (p ? p.name : '―') + '」');
      });
      if (group) lines.push(group.label + '　全員で脱出');
    }
    if (LF) {
      headline += (out.length ? '脱出は' + out.length + '人。' : '') + HK.RoomLeft.note(res, X);
      lines.push('取り残された人の結末：' + LF.title + (LF.id === 'friend' && LF.by && LF.by.length ? '（' + X.nm(LF.by[0]) + 'が外から扉を開けた）' : ''));
      (LF.vows || []).forEach(function (v) { lines.push(X.nm(v.a) + '：' + X.nm(v.b) + 'に' + { hate: '借りを返すと誓った', obsess: '必ず会いに行くと決めた', lovehate: 'もう一度会うと誓った（愛憎）', abandon: '置いていかれた恨みを忘れないと誓った' }[v.k]); });
    }
    (room.consumed || []).forEach(function (c) {
      lines.push(c.item + '：' + c.total + '/' + c.n + c.unit + (c.by.length ? '（' + c.by.map(function (x) { return X.nm(x.i) + ' ' + x.n + c.unit; }).join('・') + '）' : ''));
    });
    left.forEach(function (c) {
      var best = res.pairs.filter(function (p) { return (p.a === c.i || p.b === c.i) && p.label !== 'strangers'; }).sort(function (a, b) { return b.intensity - a.intensity; })[0];
      lines.push(c.name + '：' + (isLater(c) ? c.fateNote : c.fate) + (best ? '。最後に残った感情は' + X.nm(best.a === c.i ? best.b : best.a) + 'への「' + best.name + '」' : ''));
    });
    if (LF) HK.RoomLeft.afterLines(res).forEach(function (l) { lines.push(l); });
    var con = (room.consumed || [])[0];
    return {
      headline: headline,
      stats: [['脱出', out.length + '人' + (later.length ? '＋あとから' + later.length + '人' : '')], ['成立したペア', (function () { var pn = ex.filter(function (e) { return e.group == null && !e.how; }).length, tn = ex.filter(function (e) { return e.trio; }).length; return tn ? (pn ? pn + '組＋' : '') + '三人で' + tn + '組' : pn + '組'; })()], ['取り残し', left.length + '人']].concat(con ? [[con.item, con.total + '/' + con.n + con.unit]] : [['経過', res.stepCount + '時間']]),
      lines: lines
    };
  };

  /* ---------- 合コン ---------- */
  E.goukon = function (res, X) {
    var tg = res.end.together, lines = [];
    var couples = X.withLabel(['lovers']);
    var night = tg.filter(function (t) { return t.night; });
    var headline = tg.length
      ? tg.map(function (t) { return X.pn2(t.a, t.b); }).join('、') + 'が二人で店を出た' + (night.length ? '（うち' + night.length + '組はお持ち帰り）' : '') + '。'
      : '誰も二人きりでは帰らなかった。';
    if (couples.length) headline += 'カップル成立：' + couples.map(X.pn).join('、') + '。';
    tg.forEach(function (t) {
      var p = X.pair(t.a, t.b);
      lines.push(X.pn2(t.a, t.b) + '　' + (t.night ? 'お持ち帰り' : '一緒に帰った') + '。関係は「' + (p ? p.name : '―') + '」');
    });
    var solo = X.byFate(/一人で帰った/), crushed = X.byFate(/潰れた/);
    if (solo.length) lines.push('一人で帰った：' + X.names(solo));
    if (crushed.length) lines.push('潰れた：' + X.names(crushed));
    var ones = X.withLabel(['oneway']);
    if (ones.length) lines.push('片想いのまま：' + ones.map(function (p) { return X.nm(p.dir) + '→' + X.nm(p.dir === p.a ? p.b : p.a); }).join('、'));
    return {
      headline: headline,
      stats: [['カップル成立', couples.length + '組'], ['一緒に帰った', tg.length + '組'], ['一人で帰った', solo.length + '人'], ['潰れた', crushed.length + '人']],
      lines: lines
    };
  };

  /* ---------- クラスメイト ---------- */
  E.classroom = function (res, X) {
    var lovers = X.withLabel(['lovers']), rivals = X.withLabel(['rivals', 'dislike']), friends = X.withLabel(['friends', 'partners']);
    var F = res.factions && res.factions.final, R = HK.Factions ? HK.Factions.REGIME : {};
    var span = res.env.span === 'term' ? '一学期' : '一年';
    var headline = span + 'が終わり、' + (lovers.length ? lovers.map(X.pn).join('、') + 'が付き合い始めた' : '恋人は生まれなかった') + '。' +
      (F ? 'クラスは「' + R[F.regime] + '」' + (F.groups.length ? '（' + F.groups.map(function (g) { return X.nm(g.leader) + '派'; }).join('・') + '）' : '') + 'に落ち着いた。' : '');
    var lines = [];
    if (rivals.length) lines.push('犬猿の仲：' + rivals.map(X.pn).join('、'));
    var ones = X.withLabel(['oneway', 'pining']);
    if (ones.length) lines.push('言えなかった想い：' + ones.map(function (p) { return p.label === 'pining' ? X.pn(p) + '（両片想い）' : X.nm(p.dir) + '→' + X.nm(p.dir === p.a ? p.b : p.a); }).join('、'));
    var absent = X.byFate(/休みがち/), nogo = X.byFate(/不登校/);
    if (absent.length) lines.push('三学期、教室にいないことが増えた：' + X.names(absent));
    if (nogo.length) headline += X.names(nogo) + 'は、最後まで教室に戻らなかった。';
    if (F && F.loners.length && F.groups.length) lines.push('どの派閥にも属さなかった：' + X.names(F.loners));
    return {
      headline: headline,
      stats: [['恋人', lovers.length + '組'], ['友人・相棒', friends.length + '組'], ['犬猿', rivals.length + '組'], ['不登校', nogo.length + '人'], ['体制', F ? R[F.regime] : '―']],
      lines: lines
    };
  };

  /* ---------- 無人島 ---------- */
  E.island = function (res, X) {
    var n = X.C.length;
    var rescued = X.byFate(/救助/), raft = X.byFate(/イカダ/), dead = X.C.filter(function (c) { return !c.alive; }), stay = X.byFate(/島に残った/);
    var solo = X.C.filter(function (c) { return c.alive && /抜け出した|助けを呼びに/.test(c.fate); });
    var home = rescued.length + raft.length + solo.length;
    var how = [rescued.length ? '救助' + rescued.length : '', raft.length ? 'イカダ' + raft.length : '', solo.length ? '単独' + solo.length : ''].filter(Boolean).join('・');
    var headline = n + '人中' + home + '人が帰還' + (home ? '（' + how + '）' : '') +
      (dead.length ? '、' + dead.length + '人が島で死亡' : '') + (stay.length ? '、' + stay.length + '人が島に残った' : '') + '。';
    if (!dead.length && home === n) headline = '全員が生きて島を出た（' + how + '）。';
    var lines = [];
    if (home) lines.push('帰還：' + X.names(rescued.concat(raft)));
    solo.forEach(function (c) { lines.push((/助けを呼びに/.test(c.fate) ? '先に島を出た：' : '抜け駆け：') + c.name + '（' + c.fateNote + '）'); });
    if (res.end.raft) {
      var r = res.end.raft, onboard = r.crew;
      var behind = X.C.filter(function (c) { return onboard.indexOf(c.i) < 0 && c.alive; });
      var mates = onboard.filter(function (i) { return i !== r.by; });
      lines.push(r.label + '　' + (mates.length ? X.nm(r.by) + 'がイカダに' + X.names(mates) + 'を乗せて島を離れた' : X.nm(r.by) + 'が一人でイカダを漕ぎ出した') + (behind.length ? '。' + X.names(behind) + 'は浜に残された' : ''));
    }
    if (res.end.radio) lines.push('壊れた無線機が直り、外と連絡がついた。');
    deathLines(res, X).forEach(function (l) { lines.push(l); });
    if (stay.length) lines.push('島に残った：' + stay.map(function (c) { return c.name + '（' + c.fateNote + '）'; }).join('、'));
    var lead = X.C.filter(function (c) { return c.leader; });
    if (lead.length) lines.push('まとめ役：' + X.names(lead));
    var I = res.end.isl;
    if (I) {
      lines.push('拠点：' + ['野宿のまま', '雨よけの屋根まで', '寝床つきの小屋まで', '快適な拠点まで'][Math.min(3, Math.floor(I.base / 34))] + '整えた');
      var top = I.dishes.slice().sort(function (a, b) { return b.q - a.q; })[0];
      if (top) lines.push('いちばんの御馳走：' + X.nm(top.by) + 'の「' + top.dish + '」');
      if (I.ate) lines.push('飢えの果てに、口にしてはならないものを口にした者がいた。');
      (I.slain || []).forEach(function (x) { lines.push('討伐：' + X.nm(x.hero) + 'たちが' + x.b + 'を仕留めた'); });
      if (I.weapons && I.weapons.length) lines.push('作った武器：' + I.weapons.map(function (w) { return w.n; }).join('・'));
    }
    var F = res.factions && res.factions.final;
    if (F && F.groups.length) lines.push('最後の体制：' + HK.Factions.REGIME[F.regime] + '（' + F.groups.map(function (g) { return X.nm(g.leader) + '派' + g.members.length + '人'; }).join('・') + (F.loners.length ? '・無所属' + F.loners.length + '人' : '') + '）');
    return {
      headline: headline,
      stats: [['帰還', home + '/' + n + '人'], ['死亡', dead.length + '人'], ['島に残った', stay.length + '人'], ['経過', res.stepCount + '日']],
      lines: lines
    };
  };

  /* ---------- 裁判デスゲーム ---------- */
  E.trial = function (res, X) {
    var cases = res.end.cases, n = X.C.length;
    var wrong = cases.filter(function (c) { return !c.solved; })[0];
    /* 黒幕が宿泊客（住人）だったときは、生き残りに数えず、見出しで正体を書く */
    var mm = X.byFate(/^黒幕（/)[0], bust = X.byFate(/黒幕を暴いて/);
    var alive = X.C.filter(function (c) { return c.alive && c !== mm; });
    var days = Math.ceil(res.stepCount / 4);
    var rebels = X.byFate(/黒幕を倒して脱出/);
    var headline;
    if (bust.length) headline = (cases.length ? cases.length + '件の事件のあと、' : '') + '黒幕の正体を暴いた。黒幕は宿泊客の' + mm.name + 'だった。' + X.names(bust) + 'がホテルを出た。';
    else if (rebels.length) headline = (cases.length ? cases.length + '件の事件のあと、' : '') + '黒幕への反撃に成功した。' + X.names(rebels) + 'が、黒幕からゲームの鍵を奪ってホテルを脱出した。';
    else if (wrong) {
      var grads = X.byFate(/生還|卒業/);
      headline = cases.length + '件目の裁判で投票を外した。犯人の' + X.nm(wrong.killer) + (grads.length > 1 ? 'と共犯の' + X.nm(wrong.acc) : '') + 'だけが生きて帰り、ほかの全員が処刑された。';
    } else if (!cases.length) headline = days + '日間、一度も殺人は起きなかった。' + X.names(alive) + 'は' + (res.env.endrule === 'out' ? '全員でホテルを出た。' : 'ホテルに残った。');
    else if (!alive.length) headline = cases.length + '件の事件の末、宿泊客は一人も残らなかった。';
    else headline = cases.length + '件の事件をすべて解き明かし、生き残った' + X.names(alive) + 'が' + (res.env.endrule === 'out' ? 'ホテルを出た。' : 'ホテルに残った。');
    if (mm && !bust.length) headline += /最後に/.test(mm.fate) ? '最後に、黒幕が宿泊客の' + mm.name + 'だったと明かされた。' : '黒幕は宿泊客の' + mm.name + 'だった。';
    var lines = cases.map(function (c, k) {
      /* 被害者が複数いる事件（口封じ・共犯者の始末・返り討ち）は全員を並べる */
      var vs = c.victims && c.victims.length ? c.victims : [c.victim];
      var first = c.prior ? '　最初の犯行：' + X.nm(c.prior.killer) + 'が' + X.nm(c.prior.victim) + 'を殺害' : '';
      return (CIRC.charAt(k) || '・') + ' ' + c.label.replace(/・(学級)?裁判/, '') + '　被害者：' + vs.map(X.nm).join('・') + first + '　犯人：' + X.nm(c.killer) + (c.acc != null ? '（共犯：' + X.nm(c.acc) + '）' : '') + '　動機：' + c.motive + '　→ ' +
        (c.solved ? '見破られて処刑' + (c.det != null ? '（決め手は' + X.nm(c.det) + 'の推理）' : '') : '見破れず。' + X.nm(c.wrong) + 'に票が集まった');
    });
    /* 事件の被害者でも裁判の処刑でもない死（黒幕による処刑・裁判に至らなかった殺人） */
    var inCase = {};
    cases.forEach(function (c) { (c.victims && c.victims.length ? c.victims : [c.victim]).forEach(function (v) { inCase[v] = 1; }); if (c.prior) inCase[c.prior.victim] = 1; });
    X.C.forEach(function (c) {
      if (c.alive || inCase[c.i] || /裁判で/.test(c.fateNote || '')) return;
      var how = String(c.fateNote || '').replace(/^[^、]*、/, '');
      lines.push((/黒幕|見せしめ/.test(how) && c.killedBy == null ? '黒幕による処刑：' : '死亡：') + c.name + '（' + how + '）');
    });
    var dets = {};
    cases.forEach(function (c) { if (c.solved && c.det != null) dets[c.det] = (dets[c.det] || 0) + 1; });
    var top = Object.keys(dets).sort(function (a, b) { return dets[b] - dets[a]; })[0];
    if (top != null) lines.push('探偵役：' + X.nm(+top) + '（' + dets[top] + '件の決め手）');
    return {
      headline: headline,
      stats: [['事件', cases.length + '件'], ['正しい投票', cases.filter(function (c) { return c.solved; }).length + '/' + cases.length], (!rebels.length && !wrong && res.env.endrule !== 'out' ? ['ホテルに残った', alive.length + '/' + n + '人'] : ['生還', (rebels.length ? rebels.length : wrong ? X.byFate(/生還|卒業/).length : alive.length) + '/' + n + '人']), ['経過', days + '日']],
      lines: lines
    };
  };

  /* ---------- バトルロワイヤル ---------- */
  E.br = function (res, X) {
    var n = X.C.length;
    var win = X.byFate(/優勝/)[0], esc = X.byFate(/脱出/), home = X.byFate(/生還|生存/);
    var dead = X.C.filter(function (c) { return !c.alive; });
    var headline;
    if (win) headline = '優勝は' + win.name + '。' + (win.kills ? win.kills + '人を手にかけて' : '一人も殺さずに') + '最後の一人になった。';
    else if (esc.length) headline = X.names(esc) + 'が首輪を外して会場から脱出した。' + (dead.length ? '死者' + dead.length + '人。' : '');
    else if (home.length) headline = '時間切れまで生き延びた' + X.names(home) + 'が生還した。';
    else headline = '時間切れ。生き残っていた全員の首輪が作動し、生還者はいなかった。';
    var lines = deathLines(res, X);
    var killers = X.C.filter(function (c) { return c.kills; }).sort(function (a, b) { return b.kills - a.kills; });
    if (killers.length) lines.push('手にかけた人数：' + killers.map(function (c) { return c.name + ' ' + c.kills + '人'; }).join('、'));
    var nk = X.C.filter(function (c) { return !c.kills && /誰も殺さない/.test(c.goal); });
    if (nk.length) lines.push('「誰も殺さない」を貫いた：' + X.names(nk));
    return {
      headline: headline,
      stats: [['生還', (win ? 1 : 0) + esc.length + home.length + '/' + n + '人'], ['死亡', dead.length + '人'], ['殺害', killers.reduce(function (s, c) { return s + c.kills; }, 0) + '件'], ['経過', res.stepCount + '区切り']],
      lines: lines
    };
  };
})();
