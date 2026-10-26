/* 箱庭診断: 〇〇しないと出られない部屋（ルールを組み立てられる密室） */
(function () {
  'use strict';
  var HK = window.HK;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }

  /* ---------- 条件の部品 ---------- */
  var K = {
    hand: { type: 'act', lvl: 1, noun: '手を繋ぐ', obj: '手', unit: '回', fin: function (n) { return n > 1 ? '手を' + n + '回繋がないと' : '手を繋がないと'; }, mid: function (n) { return n > 1 ? '手を' + n + '回繋いで' : '手を繋いで'; } },
    hug: { type: 'act', lvl: 2, noun: 'ハグ', unit: '回', fin: function (n) { return n > 1 ? 'ハグを' + n + '回しないと' : 'ハグしないと'; }, mid: function (n) { return n > 1 ? 'ハグを' + n + '回して' : 'ハグして'; } },
    lap: { type: 'act', lvl: 2, noun: '膝枕', unit: '回', fin: function (n) { return n > 1 ? '膝枕を' + n + '回しないと' : '膝枕しないと'; }, mid: function (n) { return n > 1 ? '膝枕を' + n + '回して' : '膝枕して'; } },
    kiss: { type: 'act', lvl: 3, noun: 'キス', unit: '回', fin: function (n) { return n > 1 ? 'キスを' + n + '回しないと' : 'キスしないと'; }, mid: function (n) { return n > 1 ? 'キスを' + n + '回して' : 'キスして'; } },
    h: { type: 'act', lvl: 5, noun: 'エッチ', unit: '回', fin: function (n) { return n > 1 ? 'エッチを' + n + '回しないと' : 'エッチしないと'; }, mid: function (n) { return n > 1 ? 'エッチを' + n + '回して' : 'エッチして'; } },
    love: { type: 'word', mode: 'both', noun: '「好き」', unit: '回', fin: function (n) { return n > 1 ? '「好き」と' + n + '回ずつ言い合わないと' : '「好き」と言い合わないと'; }, mid: function (n) { return n > 1 ? '「好き」と' + n + '回ずつ言い合って' : '「好き」と言い合って'; } },
    honne: { type: 'word', mode: 'both', noun: '本音', unit: 'つ', fin: function (n) { return n > 1 ? '本音を' + n + 'つずつ打ち明け合わないと' : '本音を打ち明け合わないと'; }, mid: function (n) { return n > 1 ? '本音を' + n + 'つずつ打ち明け合って' : '本音を打ち明け合って'; } },
    praise: { type: 'word', mode: 'sum', noun: 'いいところ', unit: '個', fin: function (n) { return '相手のいいところを' + n + '個言わないと'; }, mid: function (n) { return '相手のいいところを' + n + '個言って'; } },
    aphro: { type: 'consume', item: '媚薬', unit: '本', fin: function (n) { return '媚薬を' + n + '本飲み切らないと'; }, mid: function (n) { return '媚薬を' + n + '本飲み切って'; } },
    sake: { type: 'consume', item: '酒', unit: '杯', fin: function (n) { return '酒を' + n + '杯飲み干さないと'; }, mid: function (n) { return '酒を' + n + '杯飲み干して'; } },
    spicy: { type: 'consume', item: '激辛ラーメン', unit: '杯', fin: function (n) { return '激辛ラーメンを' + n + '杯完食しないと'; }, mid: function (n) { return '激辛ラーメンを' + n + '杯完食して'; } },
    pill: { type: 'consume', item: '謎の錠剤', unit: '錠', fin: function (n) { return '謎の錠剤を' + n + '錠飲み切らないと'; }, mid: function (n) { return '謎の錠剤を' + n + '錠飲み切って'; } },
    one: { type: 'one', fin: function () { return '一人しか'; }, mid: function () { return ''; } },
    /* 誰かを殺さないと出られない（全年齢版は「気絶させる」：誰かを気絶させると、ほかの人が出られる） */
    kill: { type: 'kill', noun: '誰かの命', unit: '人', fin: function (n) { return (HK.SAFE_ON ? '誰かを' + (n > 1 ? n + '人' : '') + '気絶させないと' : '誰かを' + (n > 1 ? n + '人' : '') + '殺さないと'); }, mid: function (n) { return HK.SAFE_ON ? '誰かを気絶させて' : '誰かを殺して'; } }
  };
  var KLABEL = {
    h: 'エッチ', kiss: 'キス', hug: 'ハグ', hand: '手を繋ぐ', lap: '膝枕', love: '「好き」と言い合う', honne: '本音を打ち明け合う', praise: '相手のいいところを言う',
    aphro: '媚薬を飲み切る', sake: '酒を飲み干す', spicy: '激辛ラーメンを完食', pill: '謎の錠剤を飲み切る', one: '一人しか出られない', kill: '誰かを殺す（全年齢では気絶させる）'
  };
  HK.ROOM_KINDS = K;
  /* 部屋全体で数える条件か（飲む・殺す・お題（room-games.js の task：風船・ロシアンルーレットなど）） */
  function isGlob(T) { return !!T && (T.type === 'consume' || T.type === 'kill' || T.type === 'task'); }
  /* 二人の組で数える条件か（行為・言葉・傷つける・三人で） */
  function isPairT(T) { return !!T && (T.type === 'act' || T.type === 'word' || T.type === 'hurt' || T.type === 'trio'); }
  /* この版・このモードに無い条件（R18版の全年齢モードや全年齢版で、R18向けの条件を選んだ保存を開いたとき）は、近い条件に置き換える */
  var ALT = { water: 'sake', gasballoon: 'balloon' };
  function fixKind(k) { return K[k] ? k : ALT[k] && K[ALT[k]] ? ALT[k] : 'h'; }
  /* 回数・本数の数字（くすぐりの秒・水の ml のように、数字に掛ける単位 mul を持つ条件がある） */
  function nOf(k, v) { return Math.max(1, +v || 1) * (K[k].mul || 1); }
  function rulesOf(env) {
    var c1 = fixKind(env.cond || 'h'), c2 = env.cond2 && env.cond2 !== 'none' ? fixKind(env.cond2) : null;
    /* 条件1で「一人しか出られない」、条件2にほかの条件：条件2を満たすと扉が開き、くぐれるのは一人だけ（only1 と同じ。2026-10-26 順164） */
    if (c1 === 'one' && c2 && c2 !== 'one') return [{ k: c2, n: nOf(c2, env.n2) }];
    var r = [{ k: c1, n: nOf(c1, env.n1) }];
    if (c1 !== 'one' && c2 && c2 !== c1) r.push({ k: c2, n: nOf(c2, env.n2) });
    return r;
  }
  /* 一人しか出られない（ほかの条件と併用）：only1 があり、または条件1が「一人しか」で条件2がある */
  function oneWith(env) { return env.only1 === 'on' || (env.cond === 'one' && rulesOf(env)[0].k !== 'one'); }
  /* 条件を満たした人と一緒に、残りの全員も出られる（env.allout。一人しか出られない部屋では働かない。2026-10-26 順26） */
  function allOutEnv(env) { return env.allout === 'on' && rulesOf(env)[0].k !== 'one' && !oneWith(env); }
  /* 部屋の名前に並べる条件の名詞（「キス3回」「媚薬2本」「「好き」の言い合い」など） */
  var NOUN_N = { hand: '手繋ぎ', hug: 'ハグ', lap: '膝枕', kiss: 'キス', h: 'エッチ', love: '「好き」の言い合い', honne: '本音の打ち明け合い' };
  function nounN(r) {
    var T = K[r.k], n = r.n;
    if (T.nounN) return T.nounN(n);
    if (T.type === 'consume') return T.item + n + T.unit;
    if (T.type === 'kill') return (HK.SAFE_ON ? '誰かの気絶' : '誰かの命') + (n > 1 ? n + '人分' : '');
    if (r.k === 'praise') return '相手のいいところ' + n + '個';
    return (NOUN_N[r.k] || T.noun) + (n > 1 ? n + T.unit + (T.type === 'word' ? 'ずつ' : '') : '');
  }
  HK.roomLabel = function (env) { return HK.roomLabelOf(env, rulesOf(env)); };
  /* 条件の並び r から部屋の名前を作る（三人で、の条件が成り立たずに別の条件に替わったとき（room-games.js）も、これで付け直す） */
  HK.roomLabelOf = function (env, r) {
    if (env.label && String(env.label).trim()) return String(env.label).trim();
    if (r[0].k === 'one') return '一人しか出られない部屋';
    /* 条件が二つ：順番あり（seq）は「〇〇したあとに、××しないと」、どちらからでもは「〇〇と××、両方を済ませないと」（2026-10-26 順77） */
    var s = r.length < 2 ? K[r[0].k].fin(r[0].n)
      : env.order === 'seq' ? K[r[0].k].mid(r[0].n).replace(/て$/, 'た').replace(/で$/, 'だ') + 'あとに、' + K[r[1].k].fin(r[1].n)
      : nounN(r[0]) + 'と' + nounN(r[1]) + '、両方を済ませないと';
    /* 「一人しか出られない」をほかの条件と併用（env.only1）：条件を満たしても、扉をくぐれるのは一人 */
    /* 条件1に「一人しか出られない」・条件2にほかの条件、を選んだときも同じ（順164）。全員で出られる（env.allout）は、その旨を添える（順26） */
    return s + (oneWith(env) ? '出られない部屋（ただし、出られるのは一人だけ）' : allOutEnv(env) ? '出られない部屋（ただし、条件を満たした人と一緒に、ほかの全員も出られる）' : '出られない部屋');
  };
  /* 「一人しか出られない」：条件1で選ぶ（ほかの条件なし）か、ほかの条件と併用する（env.only1、または条件1に選んで条件2を足す） */
  HK.roomOnlyOne = function (env) { return rulesOf(env)[0].k === 'one' || oneWith(env); };
  HK.roomAllOut = allOutEnv;
  HK.roomRules = rulesOf;

  var options = Object.keys(KLABEL).map(function (k) { return { v: k, label: KLABEL[k] }; });
  /* 条件を足す（room-games.js・room-games-r18.js）：部品・見出し・条件1と条件2の選択肢に、末尾に足す（既存の選択肢の並びは変えない） */
  function addKind(k, def, label) {
    if (K[k]) return;
    K[k] = def; KLABEL[k] = label;
    options.push({ v: k, label: label });
    (scen.env || []).forEach(function (e) { if (e.id === 'cond2' && e.options !== options) e.options.push({ v: k, label: label }); });
  }
  /* 回数・本数の説明に、単位の注意を足す（くすぐりは10秒、水は100mlを「1」として数える、など） */
  function noteN(s) { (scen.env || []).forEach(function (e) { if (e.id === 'n1' || e.id === 'n2') e.desc = (e.desc ? e.desc + '。' : '') + s; }); }

  /* ---------- 進捗 ---------- */
  function prog(ctx, a, b) { var k = key(a, b); return (ctx.flags.prog[k] = ctx.flags.prog[k] || { act: {}, said: {} }); }
  /* 誰かを殺す（気絶させる）条件で数える人数：住人の手で死んだ人と、気絶させられた人 */
  function killCount(ctx) { return ctx.chars.filter(function (c) { return (c.alive === false && c.killedBy != null) || c.flags.knocked; }).length; }
  /* 条件の生の数（二人の組なら [a の分, b の分]） */
  function rawOf(ctx, rule, a, b) {
    var T = K[rule.k];
    if (T.type === 'consume' || T.type === 'task') return [(ctx.flags.consumed[rule.k] || 0), 0];
    if (T.type === 'kill') return [killCount(ctx), 0];
    var p = prog(ctx, a, b);
    if (T.type === 'act' || T.type === 'hurt' || T.type === 'trio') return [p.act[rule.k] || 0, 0];
    if (T.type === 'word') return [p.said[rule.k + a.i] || 0, p.said[rule.k + b.i] || 0];
    return [0, 0];
  }
  /* 条件の順番（env.order が seq）：条件2は、条件1を満たしたあとの分だけ数える。満たした時点の数を基準として覚えておく */
  function seqOn(ctx) { return ctx.env.order === 'seq' && ctx.rules.length === 2; }
  function effOf(ctx, rule, a, b) {
    if (!seqOn(ctx) || rule !== ctx.rules[1]) return rawOf(ctx, rule, a, b);
    var T = K[rule.k], glob = isGlob(T), r0glob = isGlob(K[ctx.rules[0].k]);
    if (glob) { if (!ctx.flags.seqOpen && !(r0glob && ruleDone(ctx, ctx.rules[0], a, b))) return null; }
    else if (!ruleDone(ctx, ctx.rules[0], a, b)) return null;
    /* 条件1を満たした最初の時点で、それまでに数えた条件2の分を0に戻す（先に満たした条件2は数えない） */
    if (glob) {
      if (!ctx.flags.seqResetG) { ctx.flags.seqResetG = true; if (T.type === 'consume' || T.type === 'task') ctx.flags.consumed[rule.k] = 0; else ctx.flags.killBase = killCount(ctx); }
    } else {
      var p = prog(ctx, a, b);
      if (!p.seqReset) { p.seqReset = true; p.act[rule.k] = 0; p.said[rule.k + a.i] = 0; p.said[rule.k + b.i] = 0; }
    }
    var v = rawOf(ctx, rule, a, b);
    if (T.type === 'kill') v[0] = Math.max(0, v[0] - (ctx.flags.killBase || 0));
    return v;
  }
  function ruleDone(ctx, rule, a, b) {
    var T = K[rule.k];
    if (T.type === 'one') return false;
    var v = effOf(ctx, rule, a, b);
    if (!v) return false;
    var ok = T.type === 'word' ? (T.mode === 'sum' ? v[0] + v[1] >= rule.n : v[0] >= rule.n && v[1] >= rule.n) : v[0] >= rule.n;
    if (ok && seqOn(ctx) && rule === ctx.rules[0]) ctx.flags.seqOpen = true;
    return ok;
  }
  /* 条件の順番あり（seq）で、この二人の条件1がまだ済んでいないあいだの条件2（行為・言葉）。
     そのあいだの行為・言葉は数えない（p.pre に残すだけ）。起きにくくし、起きたら「まだ数えない」と書く（2026-10-26 順77） */
  function seqWait(ctx, rule, a, b) {
    if (!seqOn(ctx) || rule !== ctx.rules[1] || !a || !b) return false;
    return isPairT(K[rule.k]) && !ruleDone(ctx, ctx.rules[0], a, b);
  }
  /* 「まだ数えない」の一文 */
  function waitNote(ctx, rule, a, b) {
    var r0 = ctx.rules[0];
    /* 二人の名前は入れない。条件1がエッチのときは、その語も出さない（体の関係になれない組の記録に、性的な語を並べないため） */
    return '扉の紙は、今の' + (FL_NOUN[rule.k] || K[rule.k].noun) + 'を数えなかった。条件の順番では、' + (r0.k === 'h' ? '一つ目の条件を先に満たさないと' : '先に' + K[r0.k].fin(r0.n)) + '、数えてもらえない。';
  }
  /* 行為の条件を進める（inc だけ足す／to にする）。条件1を待っている条件2なら数えずに p.pre に足して false を返す。
     条件1が済んだあとは、条件2の数え直し（effOf の基準）を先に済ませてから足す（同じ場面で足した分が 0 に戻らないように）。cap が偽なら上限で止めない */
  /* 条件1が済んだあとの条件2の数え直し（effOf の基準）を、数を足す前に済ませる */
  function seqFlush(ctx, r, a, b) { if (seqOn(ctx) && r === ctx.rules[1]) effOf(ctx, r, a, b); }
  function bumpAct(ctx, r, a, b, inc, to, cap) {
    var p = prog(ctx, a, b);
    if (seqWait(ctx, r, a, b)) { p.pre = p.pre || {}; p.pre[r.k] = (p.pre[r.k] || 0) + (to != null ? to : inc || 1); return false; }
    seqFlush(ctx, r, a, b);
    var v = to != null ? to : (p.act[r.k] || 0) + (inc || 1);
    p.act[r.k] = cap === false ? v : Math.min(r.n, v);
    return true;
  }
  /* 部屋全体で数える条件（飲む・殺す）の残り。順番があって条件1がまだなら、条件2の飲む条件は始めない（0 を返す） */
  function globLeft(ctx, r) {
    var v = effOf(ctx, r, null, null);
    return v ? Math.max(0, r.n - v[0]) : 0;
  }
  function globDone(ctx, r) { var v = effOf(ctx, r, null, null); return !!v && v[0] >= r.n; }
  HK.roomGlobLeft = function (ctx, r) { return globLeft(ctx, r); };
  /* 直前の出来事で新しく満たされた条件と、部屋を出た人がいるか（e.goal・e.goalExit） */
  function markGoals(ctx, e) {
    var seen = ctx.flags.goalSeen, got = [];
    ctx.rules.forEach(function (r) {
      var T = K[r.k], lab = (T.goal || KLABEL[r.k]) + (r.n > 1 ? ' ' + r.n + T.unit : '');
      if (T.type === 'one') return;
      if (isGlob(T)) {
        if (!seen[r.k] && globDone(ctx, r)) { seen[r.k] = 1; got.push(lab); }
        return;
      }
      ctx.chars.forEach(function (a) {
        ctx.chars.forEach(function (b) {
          if (a.i >= b.i || !ctx.flags.prog[key(a, b)]) return;
          var sk = r.k + ':' + key(a, b);
          if (seen[sk] || !ruleDone(ctx, r, a, b)) return;
          seen[sk] = 1;
          got.push(lab + (ctx.chars.length > 2 ? '（' + (HK.pairNameOf ? HK.pairNameOf(a, b) : a.name + '×' + b.name) + '）' : ''));
        });
      });
    });
    var outN = ctx.chars.filter(function (c) { return c.out; }).length;
    if (got.length) e.goal = got;
    if (outN > ctx.flags.goalOut) e.goalExit = true;
    ctx.flags.goalOut = outN;
  }
  /* 二人にとって、まだ足りないもの（扉が開かない理由を本文に出す） */
  function leftText(ctx, a, b) {
    var out = [];
    ctx.rules.forEach(function (r) {
      if (ruleDone(ctx, r, a, b)) return;
      var T = K[r.k], v0 = effOf(ctx, r, a, b) || [0, 0];
      /* 順番があって条件1がまだのときは、条件2は「そのあと」として全部の数を出す */
      var p = { act: {}, said: {} }; p.act[r.k] = v0[0]; p.said[r.k + a.i] = v0[0]; p.said[r.k + b.i] = v0[1];
      if (seqOn(ctx) && r === ctx.rules[1] && !ruleDone(ctx, ctx.rules[0], a, b)) { out.push('そのあと' + (T.type === 'consume' ? T.item + 'を' + r.n + T.unit : T.type === 'kill' ? '誰かの命' : T.noun + (r.n > 1 ? 'を' + r.n + T.unit : ''))); return; }
      /* 足した条件（room-games.js）：残りの言い方を条件の側が持つ（left：部屋全体の残り／leftP：この組の残り） */
      if (T.type === 'task') { out.push(T.left ? T.left(globLeft(ctx, r)) : T.noun + 'があと' + globLeft(ctx, r) + T.unit); return; }
      if (T.type === 'hurt' || T.type === 'trio') { out.push(T.leftP ? T.leftP(r.n - (p.act[r.k] || 0), r.n) : T.noun); return; }
      if (T.type === 'act') out.push(T.noun + (r.n > 1 ? 'があと' + (r.n - (p.act[r.k] || 0)) + T.unit : ''));
      else if (T.type === 'word' && T.mode === 'both') {
        var who = [a, b].filter(function (c) { return (p.said[r.k + c.i] || 0) < r.n; }).map(function (c) { return c.name; });
        var whoN = [a, b].filter(function (c) { return (p.said[r.k + c.i] || 0) < r.n; });
        if (r.n > 1) out.push(whoN.map(function (c) { return c.name + 'の' + T.noun + 'があと' + (r.n - (p.said[r.k + c.i] || 0)) + T.unit; }).join('、'));
        else out.push((who.length > 1 ? 'お互いの' : who[0] + 'の') + T.noun);
      } else if (T.type === 'word') out.push(T.noun + 'があと' + (r.n - (p.said[r.k + a.i] || 0) - (p.said[r.k + b.i] || 0)) + T.unit);
      else if (T.type === 'consume') out.push(T.item + 'があと' + globLeft(ctx, r) + T.unit);
      else if (T.type === 'kill') out.push(HK.SAFE_ON ? '誰かを気絶させること' : '誰かの命');
    });
    return out.join('、');
  }
  /* この二人の、言葉か行為の条件が片づいて、残りが別の条件だけのとき */
  function pairOnlyWait(ctx, a, b) {
    var left = ctx.rules.filter(function (r) { return !ruleDone(ctx, r, a, b); });
    return left.length > 0 && left.length < ctx.rules.length;
  }
  function pairDone(ctx, a, b) { return ctx.rules.every(function (r) { return ruleDone(ctx, r, a, b); }); }
  /* 回数の表示の頭：3人以上の部屋では、条件は組ごとに数えるので「誰と誰の分」かを添える（組が変わると数が戻ったように見えるため） */
  function pairTag(ctx, a, b) { return ctx.chars.length > 2 ? (HK.pairNameOf ? HK.pairNameOf(a, b) : a.name + '×' + b.name) + 'の' : ''; }
  /* 回数の表示。条件の順番があって条件1がまだの条件2は、満たした時点で数が戻る（先の分は数えない）ので、数の代わりにそう書く */
  function cntTag(ctx, r, a, b, cnt) {
    /* 条件1を待っている条件2：回数によらず「まだ数えない」と書く */
    if (seqWait(ctx, r, a, b)) return waitNote(ctx, r, a, b);
    if (r.n <= 1) return '';
    if (seqOn(ctx) && r === ctx.rules[1] && !ruleDone(ctx, ctx.rules[0], a, b)) return '（' + pairTag(ctx, a, b) + K[r.k].noun + 'は条件1のあとから数える）';
    return '（' + pairTag(ctx, a, b) + K[r.k].noun + ' ' + cnt + '/' + r.n + '）';
  }
  function hasPairRule(ctx) { return ctx.rules.some(function (r) { return isPairT(K[r.k]); }); }
  /* 条件を満たした人と一緒に、残りの全員も出られる部屋か（順26） */
  function allOut(ctx) { return !ctx.flags.isOne && !ctx.flags.oneCond && ctx.env.allout === 'on'; }
  /* 扉が開いたとき、条件を満たした人（g）と一緒に、部屋に残っていた人も出る（倒れている人は担がれて出る）。出た記録（ctx.flags.exits の最後）に along を足し、文を返す */
  var ALONG = ['扉が開くと、{L}も{G}のあとについて外へ出た。何もしていないのに出られたことに、{L}は少しだけ申し訳なさそうな顔をした。', '開いた扉の前で、{G}は振り返って{L}を手招きした。この部屋は、誰かが条件を満たせば全員が出られる部屋だった。{L}は顔を見合わせてから、扉をくぐった。', '鍵の外れる音を聞いて、{L}も立ち上がった。{G}が開けた扉から、部屋にいた全員が外へ出た。'];
  function bringAlong(ctx, g) {
    if (!allOut(ctx)) return '';
    var L = ctx.present().filter(function (c) { return g.indexOf(c) < 0 && !c.out; });
    if (!L.length) return '';
    var gn = g.map(function (c) { return c.name; }).join('と');
    L.forEach(function (c) { c.out = true; c.fate = '脱出'; c.fateNote = gn + 'が条件を満たして開いた扉から、一緒に部屋を出た' + (c.flags.down ? '（倒れていたので、担がれて出た）' : ''); });
    var ex = ctx.flags.exits || [], last = ex[ex.length - 1];
    if (last) last.along = (last.along || []).concat(L.map(function (c) { return c.i; }));
    var down = L.filter(function (c) { return c.flags.down; });
    return ctx.pick(ALONG).replace(/\{L\}/g, names(L)).replace(/\{G\}/g, gn) + (down.length ? names(down) + 'は倒れたままだったので、' + gn + 'が肩を貸して運び出した。' : '');
  }

  /* 円満な三人（三人とも互いに恋人どうし：room-trio.js）の二人だけが先に条件を満たしたとき、もう一人の恋人を部屋に残して出ていかない。
     三人で満たせる部屋なら二人とも残って三人で出るのを待ち、二人ずつの部屋なら一人が残ってもう一人の恋人に付き添う */
  function loveThird(ctx, a, b) {
    var H = HK.RoomTrio && HK.RoomTrio.harmony;
    if (!H || ctx.flags.isOne) return null;
    return ctx.present().filter(function (c) { return c !== a && c !== b && !c.out && c.alive !== false && c.flags.cagePair == null && H(ctx, [a, b, c]) && !(pairDone(ctx, a, c) && pairDone(ctx, b, c)); })[0] || null;
  }
  /* a と b が、部屋にいるもう一人と円満な三人になっているか */
  function loveTrioOf(ctx, a, b) { var H = HK.RoomTrio && HK.RoomTrio.harmony; return !!H && ctx.present().some(function (c) { return c !== a && c !== b && H(ctx, [a, b, c]); }); }
  function loveWaitKey(a, b) { return Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i); }
  /* 二人とも残って三人で出るのを待っている（一度知らせたら、区切りごとの見回りで出さない） */
  function loveWaiting(ctx, a, b) { return !!(ctx.flags.loveWait && ctx.flags.loveWait[loveWaitKey(a, b)] && loveThird(ctx, a, b)); }
  /* 一人しか出られない（併用）：扉が開いても、くぐれるのは一人。優しい人は相手を押し出し、ドライな人は先に出る */
  function oneDoor(ctx, list, text, why, night) {
    /* もう一人が出たあとは、扉は二度と開かない */
    if (ctx.flags.oneOut) return { cat: 'escape', mag: 10, text: text + '扉は、もう開かなかった。', why: why + '／一人しか出られない部屋。もう一人が出たあとだった' };
    var rng = ctx.rng, L = list.filter(function (c) { return !c.out && c.alive !== false; });
    if (!L.length) return { cat: 'escape', mag: 10, text: text, why: why };
    if (night && L.length === 2 && okSex(L[0], L[1])) ctx.pair(L[0], L[1]).night = true;
    var giver = ctx.most(L, function (c) { var others = L.filter(function (o) { return o !== c; }); return c.tr.np * 1.2 + (others.length ? Math.max.apply(null, others.map(function (o) { return ctx.R(c, o).aff; })) / 80 : 0) - c.tr.cold * 0.4; });
    var taker = ctx.most(L, function (c) { return c.tr.cold * 0.7 + c.tr.aggr * 0.5 + c.stress / 200 - c.tr.np * 0.4; });
    var gv = giver.tr.np * 1.2 + (L.length > 1 ? Math.max.apply(null, L.filter(function (o) { return o !== giver; }).map(function (o) { return ctx.R(giver, o).aff; })) / 80 : 0);
    var go, how, t;
    if (L.length > 1 && gv > 0.95 && rng() < 0.7) {
      var cand = L.filter(function (o) { return o !== giver; });
      go = cand.slice().sort(function (x, y) { return ctx.R(giver, y).aff - ctx.R(giver, x).aff; })[0]; how = 'sacrifice';
      t = ctx.t(ctx.pick(['扉の鍵が外れた。けれど紙の下には、小さな字で「ただし、一人だけ」と足されていた。{a}は迷わず{b}の背中を押した。「先に行って｜先に行け｜先に行ってください」', '扉が開いた。誰が出るのか、と誰もが黙った。{a}が{b}の手を取って、扉の前まで連れていった。「{b}が出て。私はいい｜{b}が出ろ。私はいい｜{b}が出てください。私はいいです」', '鍵の外れる音のあと、扉の上の文字が光った。「一人だけ」――{a}は{b}を振り返り、笑ってみせた。「行きなよ｜行け｜行ってください」']), giver, go);
      giver.fate = '残った'; giver.fateNote = go.name + 'を先に出した';
      ctx.mod2(giver, go, { aff: 10 }, { aff: 25, trust: 25, att: 10 });
    } else {
      go = L.length > 1 ? taker : L[0]; how = 'grab';
      var rest = L.filter(function (o) { return o !== go; });
      t = rest.length ? ctx.t(ctx.pick(['扉の鍵が外れた。「一人だけ」と書き足された紙を読むより早く、{a}は扉に手をかけていた。{b}の声に、{a}は振り返らなかった。', '扉が開いた瞬間、{a}は{b}を押しのけて外へ出た。扉は、すぐに閉まった。', '「一人しか出られないなら｜一人しか出られないのなら｜一人しか出られないのでしたら」{a}はそれだけ言って、扉をくぐった。残された{b}は、閉まった扉を見つめていた。']), go, rest[0]) : ctx.t('扉の鍵が外れた。{a}は一人で、扉をくぐった。', go);
      rest.forEach(function (o) { ctx.mod(o, go, { aff: -25, ten: 30, trust: -35 }); });
    }
    go.out = true; go.fate = '脱出'; go.fateNote = how === 'sacrifice' ? giver.name + 'に背中を押されて一人で出た' : '一人で扉をくぐった';
    ctx.flags.oneOut = true;
    (ctx.flags.exits = ctx.flags.exits || []).push({ a: go.i, b: (how === 'sacrifice' ? giver : (L.filter(function (o) { return o !== go; })[0] || go)).i, label: ctx.label, how: how });
    return { cat: how === 'sacrifice' ? 'help' : 'betray', mag: 45, text: text + t, why: why + '／一人しか出られない部屋（' + (how === 'sacrifice' ? giver.name + 'の優しさ' : go.name + 'のドライさ') + '）' };
  }
  function exitPair(ctx, a, b, text, why, night) {
    if (ctx.flags.oneCond) return oneDoor(ctx, [a, b], text, why, night);
    /* 全員で出られる部屋（順26）では、三人目の恋人を待つ・付き添うために残る必要がない（その人も一緒に出る） */
    var stay = null, lt = allOut(ctx) ? null : loveThird(ctx, a, b);
    if (lt) {
      var multiOk = (ctx.env.multi || 'open') !== 'no' && ctx.flags.multiKnown;
      if (multiOk) {
        var W = ctx.flags.loveWait = ctx.flags.loveWait || {}, key = loveWaitKey(a, b);
        if (W[key]) return { cat: 'romance', mag: 6, text: text + a.name + 'と' + b.name + 'は、' + lt.name + 'と三人で出るまで、扉の前を素通りした。', why: why + '／三人で出るのを待っている' };
        W[key] = true;
        ctx.mod(lt, a, { trust: 4, aff: 3 }); ctx.mod(lt, b, { trust: 4, aff: 3 });
        return { cat: 'romance', mag: 24, text: text + ctx.t(ctx.pick([
          '扉の鍵が外れる音がした。けれど{a}と{b}は、立ち上がらなかった。{b}が{c}に手を伸ばした。{b}「三人で来たんだから、三人で出よう｜三人で来たのだから、三人で出よう｜三人で来たのですから、三人で出ましょう」',
          '扉の鍵が外れた。{a}は扉を一度だけ見て、それから{c}の隣に座り直した。{a}「{c}を置いていくわけないでしょ｜{c}を置いていくわけがないだろう｜{c}を置いていくわけがありません」――{b}も、黙って{c}の反対側に座った。',
          '鍵の外れる音に、{c}が顔を上げた。{c}「……行っていいよ｜……行っていい｜……行ってください」{a}と{b}は同時に首を振った。三人は恋人どうしだった。誰か一人を置いて出る扉なら、くぐる理由がなかった。'
        ]), a, b, lt), why: why + '／' + lt.name + 'も二人の恋人。円満な三人なので、二人だけで先に出ず、三人で出るのを待つ', with: [lt] };
      }
      /* 二人ずつしか認めない部屋：一人は先に出て、もう一人は残って三人目の恋人に付き添う */
      stay = HK.RoomTrio && (pairDone(ctx, a, lt) ? b : pairDone(ctx, b, lt) ? a : (a.tr.np >= b.tr.np ? a : b));
      var go0 = stay === a ? b : a;
      go0.out = true; go0.fate = '脱出'; go0.fateNote = stay.name + 'と条件を満たして出た（' + stay.name + 'は、' + lt.name + 'のために残った）';
      stay.flags.stayed = (stay.flags.stayed || 0) + 1;
      (ctx.flags.exits = ctx.flags.exits || []).push({ a: go0.i, b: stay.i, label: ctx.label, night: !!night, stay: stay.i });
      if (night && okSex(a, b)) ctx.pair(a, b).night = true;
      ctx.mod2(stay, lt, { trust: 6, aff: 4 }, { trust: 6, aff: 4 });
      return { cat: 'romance', mag: 30, text: text + ctx.t(ctx.pick([
        '扉の鍵が外れた。{a}は{b}の背中を押した。{a}「先に出て、待ってて。{c}と一緒に行くから｜先に出て、待っていろ。{c}と一緒に行く｜{c}と一緒に行きますから、先に出て待っていてください」――{b}は振り返りながら扉をくぐった。',
        '扉の鍵が外れた。{b}だけが外に出て、{a}は{c}の隣に残った。{a}「一人にはしないよ｜一人にはしない｜一人にはしません」――扉の向こうで、{b}が「待ってる｜待っている｜待っています」と言った。',
        '扉の鍵が外れた。{a}と{b}は短く口づけを交わし、{b}が先に出た。{a}は{c}の手を握った。{a}「次は、私たちの番｜次は、私たちの番だ｜次は、私たちの番です」'
      ]), stay, go0, lt), why: why + '／' + lt.name + 'も二人の恋人。二人ずつしか出られない部屋なので、' + stay.name + 'が残って付き添う' };
    }
    /* 体の関係を持てない組（三人の場面で数えられただけの二人など）は、夜を過ごしたことにしない */
    if (night && !okSex(a, b)) night = false;
    if (night && ctx.present().length >= 3 && !allOut(ctx)) {
      [a, b].forEach(function (c) { if (!stay && eager(ctx, c) > 0.68 && ctx.rng() < 0.5) stay = c; });
    }
    if (stay) {
      var go = stay === a ? b : a;
      go.out = true; go.fate = '脱出'; go.fateNote = stay.name + 'と条件を満たして出た（' + stay.name + 'は残った）';
      stay.flags.stayed = (stay.flags.stayed || 0) + 1;
      (ctx.flags.exits = ctx.flags.exits || []).push({ a: go.i, b: stay.i, label: ctx.label, night: true, stay: stay.i });
      ctx.pair(a, b).night = true;
      ctx.mod(go, stay, { ten: 6 });
      return { cat: 'romance', mag: 30, text: text + '扉の鍵が外れた。' + go.name + 'は出ていったが、' + stay.name + 'は「もうちょっといる｜もう少しいる｜もう少しいます」と言って、残っている人たちの方を振り返った。', why: why + '／' + stay.name + 'の積極性（' + Math.round(eager(ctx, stay) * 100) + '）' };
    }
    a.out = b.out = true;
    (ctx.flags.exits = ctx.flags.exits || []).push({ a: a.i, b: b.i, label: ctx.label, night: !!night });
    var pfx = ctx.pair(a, b);
    if (night) pfx.nights = Math.max(pfx.nights || 0, prog(ctx, a, b).act.h || 1);
    if (night && !pfx.forced && HK.FWB && HK.FWB.decide(ctx, a, b)) { HK.FWB.mark(ctx, a, b); text += HK.FWB.after(ctx, a, b) + '扉の鍵が外れる音がした。'; return finishExit(ctx, a, b, text, why, night); }
    return finishExit(ctx, a, b, text + '扉の鍵が外れる音がした。', why, night);
  }
  function finishExit(ctx, a, b, text, why, night) {
    a.fate = b.fate = '脱出';
    a.fateNote = b.name + 'と一緒に部屋を出た'; b.fateNote = a.name + 'と一緒に部屋を出た';
    if (night) ctx.pair(a, b).night = true;
    ctx.mod2(a, b, { trust: 8 }, { trust: 8 });
    /* 全員で出られる部屋（順26）：部屋に残っていた人も、一緒に出る */
    var al = bringAlong(ctx, [a, b]);
    return { cat: 'escape', mag: 35, text: text + al, why: why + (al ? '／条件を満たした人と一緒に、ほかの全員も出られる部屋' : '') };
  }
  /* 条件の数え方は出来事ごとに散らばっている（会話・三人・口論の中の行為など）。
     区切りの終わりに、条件がそろったのにまだ部屋にいる組があれば、その場で扉を開ける */
  function sweepExits(ctx) {
    if (ctx.flags.isOne || (ctx.flags.oneCond && ctx.flags.oneOut)) return;
    if (!hasPairRule(ctx)) {
      if (ctx.present().length && ctx.rules.every(function (r) { return globDone(ctx, r); })) exitAll(ctx);
      return;
    }
    var P = ctx.present(), night = ctx.rules.some(function (r) { return r.k === 'h'; });
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      var a = P[i], b = P[j];
      if (a.out || b.out || !pairDone(ctx, a, b) || loveWaiting(ctx, a, b)) continue;
      var ex = exitPair(ctx, a, b, '扉の紙を見ると、' + a.name + 'と' + b.name + 'の分の数字が、いつの間にかそろっていた。', a.name + 'と' + b.name + 'の条件が、ほかの出来事の中でそろった', night);
      ctx.say({ kind: 'event', cat: 'escape', actors: [a, b], text: ex.text + (a.out && b.out ? a.name + 'と' + b.name + 'は、扉をくぐった。' : ''), why: ex.why, mag: ex.mag || 30 });
    }
  }
  /* 部屋全体の条件の最後の一つ（「最後の一杯が空になった」。水・風船などは条件の側の last） */
  function lastOf(r) { var T = K[r.k]; return T.last ? T.last(r.n) : '最後の一' + T.unit + 'が空になった'; }
  function exitAll(ctx) {
    var P = ctx.present().filter(function (c) { return !c.flags.knocked; });
    if (!P.length) return;
    var kr = ctx.rules.some(function (r) { return r.k === 'kill'; });
    var vic = kr ? ctx.chars.filter(function (c) { return (c.alive === false && c.killedBy != null) || c.flags.knocked; }) : [];
    if (ctx.flags.oneCond) { var od = oneDoor(ctx, P, '', '部屋全体の条件がそろった'); ctx.say({ kind: 'event', cat: od.cat, actors: P, text: od.text, why: od.why, mag: od.mag }); return; }
    var vn = names(vic);
    P.forEach(function (c) { c.out = true; c.fate = '脱出'; c.fateNote = kr ? (HK.SAFE_ON ? vn + 'を気絶させて開いた扉から、部屋を出た' : vn + 'の命と引き換えに開いた扉から、部屋を出た') : '条件を満たし、全員で部屋を出た'; });
    (ctx.flags.exits = ctx.flags.exits || []).push({ group: P.map(function (c) { return c.i; }), label: ctx.label });
    var et = kr ? ctx.pick(HK.SAFE_ON ? ['扉の鍵が外れる音がした。' + names(P) + 'は、床に倒れた' + vn + 'を振り返り、それから外へ出た。', '扉が開いた。' + names(P) + 'は、まだ目を覚まさない' + vn + 'を残して、扉をくぐった。'] : ['扉の鍵が外れる音がした。' + names(P) + 'は、' + vn + 'のほうを見ないようにして外へ出た。', '扉が音もなく開いた。' + names(P) + 'は、誰も口をきかないまま、' + vn + 'を残して部屋を出た。'])
      : lastOf(ctx.rules[0]) + '瞬間、扉が音もなく開いた。' + names(P) + 'は、顔を見合わせてから外へ出た。';
    ctx.say({ kind: 'event', cat: 'escape', actors: P, text: et, why: '部屋全体の条件を満たした', mag: 30 });
  }
  /* 進捗が動いたあと、出られる組がいれば出す */
  function checkExit(ctx, a, b) {
    if (ctx.flags.oneCond && ctx.flags.oneOut) return null;
    if (!hasPairRule(ctx)) {
      if (ctx.rules.every(function (r) { return globDone(ctx, r); })) exitAll(ctx);
      return null;
    }
    if (a && b && !a.out && !b.out && pairDone(ctx, a, b) && !loveWaiting(ctx, a, b)) return true;
    return null;
  }

  /* ---------- 行為の文 ---------- */
  var ACT_TEXT = {
    hand: {
      will: ['{a}が黙って手を差し出した。{b}は少し迷ってから、その指に自分の指を絡めた。', '{a}と{b}は壁にもたれて、肩を並べたまま手を繋いだ。', '{b}の手は思ったより冷たかった。{a}はそれを温めるように握り直した。', '「……ほら｜……ほら｜……どうぞ」{a}が手を伸ばすと、{b}は照れ隠しに鼻を鳴らして、それでも握った。', '繋いだ手の中で、{a}の親指が{b}の手の甲をそっと撫でた。'],
      des: ['{a}と{b}は、目を合わせないまま手を繋いだ。握手のような繋ぎ方だった。', '{a}と{b}は「条件だから｜条件だ｜条件ですから」と言い合って、指先だけを触れ合わせた。', '{a}が{b}の手首を掴んだ。それでも扉の紙は、手を繋いだと認めたらしい。']
    },
    hug: {
      will: ['{a}が両腕を広げた。{b}は一瞬だけ笑って、その中に収まった。', '{b}の背中に回した腕に、{a}は思ったより力を込めていた。', '抱き合ったまま、{a}は{b}の髪の匂いに気づいてしまった。', '「長くない？｜長くないか？｜長くないですか？」と{b}が言った。{a}は「数えてない｜数えていない｜数えていません」と答えて、腕をほどかなかった。', '{a}は{b}を抱きしめた。心臓の音がどちらのものか分からなかった。'],
      des: ['{a}と{b}は、肩を叩き合うようなハグをして、すぐに離れた。', '「三秒でいいだろ｜三秒でいいだろう｜三秒でいいでしょう」{a}はそう言って{b}を引き寄せ、本当に三秒で離した。', '{a}と{b}は、背中に手を回すだけの、ぎこちないハグをした。']
    },
    lap: {
      will: ['{b}の膝に頭を乗せた{a}は、天井を見上げたまま「重くない？｜重くないか？｜重くないですか？」と訊いた。', '{a}は膝の上の{b}の髪を、指先で何度も梳いた。', '{b}の膝の上で、{a}はいつの間にか本当に眠っていた。', '膝枕をされたまま、{a}は{b}の顔を下から見上げて、何か言いかけてやめた。'],
      des: ['{a}は{b}の膝に、頭の重さを預けないように首を浮かせていた。', '{a}と{b}は、時計を見ながら膝枕をした。{a}「何秒？｜何秒だ？｜何秒ですか？」{b}「知らない｜＝｜知りません」']
    },
    kiss: {
      will: ['{a}が{b}の頬に手を添えた。唇が触れて、離れて、もう一度触れた。', '{b}の方が先に目を閉じた。{a}はそれに気づいて、ほんの少し笑ってから口づけた。', '{a}と{b}の額がこつんと当たって、二人して笑ったあと、静かにキスをした。', '{a}は{b}にもう一度唇を寄せた。{b}「数えてる？｜数えているか？｜数えていますか？」{a}「数えてない｜数えていない｜数えていません」', '{a}は{b}の襟を掴んで引き寄せた。乱暴な仕草とは裏腹に、触れた唇はひどく慎重だった。', '{b}の唇は少し震えていた。{a}は離れる前に、そっと親指でそれをなぞった。'],
      des: ['{a}と{b}は目を固く閉じたまま、一瞬だけ唇を重ねた。', '「事故だと思って｜事故だと思え｜事故だと思ってください」{a}はそう言って、{b}の唇に軽く触れた。', '{a}と{b}は、ぶつかるような短いキスをして、同時に袖で口元を拭った。', '{b}が「早く済ませて｜早く済ませろ｜早く済ませてください」と言った。{a}はその通りにした。']
    },
    h: {
      will: ['{a}と{b}は、言葉少なに互いを確かめ合った。――そのあとのことは、二人だけが知っている。', '{b}が{a}のシャツのボタンに指をかけた。{a}はその手を止めずに、自分の手を重ねた。――照明が、気を利かせたように一段落ちた。', '「嫌だったら、すぐ言って｜嫌なら、すぐ言え｜嫌だったら、すぐ言ってください」{a}の言葉に、{b}は答えの代わりに{a}を引き寄せた。――', '{a}と{b}は、ベッドの縁に並んで座ったまま、しばらく何も言わなかった。先に手を伸ばしたのは{b}だった。――', '{a}が{b}の名前を呼んだ。それだけで、{b}には十分だった。――'],
      des: ['{a}と{b}は、何も言わずに条件を呑んだ。――終わったあとも、しばらくどちらも口をきかなかった。', '「出るためだ｜＝｜出るためです」と{a}は言った。{b}は頷いて、照明のスイッチを探した。――', '{a}と{b}は背中合わせで服を脱いだ。どちらも、相手の顔を見なかった。――']
    }
  };
  /* 木箱の道具（エッチ・キスの条件のとき） */
  /* 木箱の道具：誰が・何を・誰にどう使ったかが一文で分かるように */
  var TOOLS = [
    { n: '目隠し', t: ['{a}は木箱から黒い布の目隠しを取り出して、{b}の目にそっと巻いた。「見えない方が、恥ずかしくないでしょ｜見えない方が、恥ずかしくないだろう｜見えない方が、恥ずかしくないでしょう」――', '{a}は木箱の目隠しで{b}の目を覆った。何も見えなくなった{b}は、{a}の指がどこに触れるのか分からずに、何度も肩を跳ねさせた。――'] },
    /* r18:begin */
    { n: 'ローション', t: ['{a}は木箱に入っていたローションの小瓶を手に取り、中身を手のひらで温めた。「…こういうの、使ったことある？｜…こういうものを、使ったことはあるか？｜…こういうもの、使ったことはありますか？」{b}は首を横に振った。――', '{a}は木箱のローションを手に出そうとして、瓶を逆さにしすぎた。こぼれたローションを見て、{a}と{b}は二人とも吹き出した。それで少し、緊張がほどけた。――'] },
    /* r18:end */
    { n: '手錠', t: ['{a}は木箱から毛皮つきの手錠を取り出して、指でくるくる回した。「{b}、これつける？｜{b}、これをつけるか？｜{b}、これをつけますか？」{b}は「…片方だけなら｜…片方だけならいい｜…片方だけなら、いいです」と手首を差し出した。――', '{a}は木箱の手錠を、冗談めかして{b}の手首にかけた。{b}は笑っていたが、{a}はその手錠を外さないまま{b}を抱き寄せた。――'] },
    /* r18:begin */
    { n: '玩具', t: ['{a}は木箱の中からローターを取り出して、真顔になった。「…説明書まで入ってる｜…説明書まで入っている｜…説明書まで入っています」{b}は耳まで赤くなった。――', '{a}は木箱のローターのスイッチを入れ、自分で低い振動音に驚いた。{b}は最初こそ笑っていたが、{a}がそれを{b}の肌に当てると、笑わなくなった。――'] },
    /* r18:end */
    { n: 'ロープ', t: ['{a}は木箱の柔らかい縄を手に、{b}の顔を窺った。「縛ってもいい？嫌なら言って｜縛ってもいいか？嫌なら言え｜縛ってもいいですか？嫌なら言ってください」{b}は黙って両手首を差し出した。――', '{a}は木箱の縄で、{b}の両手首を器用に結んだ。{b}「…なんでそんなに慣れてるの｜…なぜそんなに慣れているんだ｜…どうしてそんなに慣れているんですか」{a}「秘密｜秘密だ｜秘密です」――'] },
    { n: '媚薬入りのオイル', t: ['{a}は木箱の媚薬入りオイルを{b}の背中に垂らし、手のひらで塗り広げた。塗られたところから、{b}の肌にじわじわと熱が広がった。――'] }
  ];
  var REPEAT = ['{a}と{b}は、それからも条件の回数を一つずつ重ねていった。', '「もう一回｜もう一回だ｜もう一回しましょう」と{a}が言い、{b}は頷いた。', '扉の紙の残りの数字が一つ減るたび、{a}と{b}の間の照れも少しずつ減っていった。', '何回目かのときには、{b}の方から{a}に手を伸ばした。', '扉の紙の回数を数えるのは、途中から{a}の役目になった。'];

  var PRAISE = ['笑うと目尻に皺が寄るところ', '嘘をつくとき耳を触る癖', '字がきれいなところ', '絶対に人の悪口を言わないところ', '寝起きの声が低いところ', '箸の持ち方がきれいなところ', '人の話を最後まで聞くところ', '怒ると黙るところ', '意外と涙もろいところ', '靴をきちんと揃えるところ', '歌が下手なのを気にしないところ', '背中が広いところ', '手が温かいところ', '負けず嫌いなところ', '誰にでも同じ態度なところ', '料理の味見を必ずするところ', '約束の五分前に来るところ', '名前を呼ぶときの声', '困ってる人を放っておけないところ', 'ちゃんと謝れるところ'];

  /* 相手のエゴグラムから「いいところ」を選ぶ（高い因子の長所・低い因子の裏返し） */
  var PRAISE_EG = {
    CP: { hi: ['筋を通すところ', '約束を絶対に守るところ', '嫌なことを嫌って言えるところ', '責任から逃げないところ', '人を本気で叱れるところ', '背筋がいつも伸びてるところ'], lo: ['細かいことで怒らないところ', '人のミスを笑って流せるところ', '決めつけないところ', '型にはまらないところ'] },
    NP: { hi: ['困ってる人を放っておけないところ', '人の話を最後まで聞くところ', '弱ってるときに真っ先に気づくところ', '自分より人の分を先に取り分けるところ', '声が優しいところ', '褒め方が上手いところ'], lo: ['ほどよく距離を置いてくれるところ', '余計なお節介をしないところ', '人に流されないところ', '甘やかさないところ'] },
    A: { hi: ['どんなときも冷静なところ', '話が分かりやすいところ', '感情的にならずに考えられるところ', '段取りが完璧なところ', '物知りなところ', '状況をすぐ整理してくれるところ'], lo: ['理屈より気持ちで動けるところ', '勘がいいところ', '計算しないで飛び込めるところ', '考えすぎないところ'] },
    FC: { hi: ['笑うと場が明るくなるところ', '楽しいことを見つける天才なところ', '好きなものの話をするとき目が輝くところ', '思ったことを素直に言えるところ', '一緒にいると退屈しないところ', 'ノリがいいところ'], lo: ['落ち着いてるところ', 'はしゃがない大人っぽさ', '感情を顔に出さないところ', '一緒にいると静かに安心できるところ'] },
    AC: { hi: ['気配りが細かいところ', '空気を読んで先回りしてくれるところ', 'ちゃんと謝れるところ', '人に合わせるのが上手いところ', '遠慮がちなところが可愛いところ', '頼まれごとを断らないところ'], lo: ['自分の意見をはっきり言うところ', '誰にでも同じ態度なところ', '人の顔色で動かないところ', '堂々としてるところ'] }
  };
  function praiseFor(ctx, a, b, n) {
    var out = [], eg = b.eg, F = ['CP', 'NP', 'A', 'FC', 'AC'];
    var cand = [];
    F.forEach(function (f) {
      if (eg[f] >= 13) PRAISE_EG[f].hi.forEach(function (x) { cand.push({ t: x, w: eg[f] - 10, src: f + '高' }); });
      if (eg[f] <= 7) PRAISE_EG[f].lo.forEach(function (x) { cand.push({ t: x, w: 10 - eg[f], src: f + '低' }); });
    });
    PRAISE.forEach(function (x) { cand.push({ t: x, w: 1.2 + a.tr.a * 2, src: '' }); });
    for (var i = 0; i < n && cand.length; i++) {
      var c = HK.weighted(ctx.rng, cand, function (x) { return x.w; });
      out.push(c.t); cand.splice(cand.indexOf(c), 1);
      if (c.src) ctx.flags.praiseSrc = c.src;
    }
    return out.join('、');
  }

  var ITEM = {
    aphro: {
      fit: function (c) { return c.tr.np * 0.35 + c.tr.impulse * 0.45 + c.tr.cold * 0.3 + (c.goal.id === 'quick' ? 0.4 : 0); },
      lines: {
        np: ['「誰かに飲ませるくらいなら、私が飲む」{a}はそう言って、媚薬の瓶を{n}本空けた。', '{a}は震える手で{n}本目の封を切った。「大丈夫、まだ平気」', '{a}は残りの本数を数えて、自分の分を多めに引き寄せた。'],
        fc: ['「どうせ全部飲むんでしょ」{a}は笑いながら{n}本を立て続けに空けた。', '{a}は瓶を光にかざして「ピンクだ」と面白がり、そのまま{n}本飲み干した。', '{a}は乾杯の真似をして、{n}本を一息に呷った。'],
        cold: ['「効率の問題だ」{a}は表情も変えずに{n}本を空けた。', '{a}は残りの本数と時間を計算して、黙々と{n}本飲んだ。', '{a}は{n}本を並べ、薬を飲むように一本ずつ流し込んだ。'],
        ac: ['{a}は皆の顔を見回して、誰も手を伸ばさないのを確かめてから、{n}本を手に取った。', '{a}は「私が飲めば、みんなは」と小さく言って、{n}本を飲んだ。']
      },
      effect: function (ctx, c, n) {
        c.flags.aphro = (c.flags.aphro || 0) + n;
        c.flags.aphroTotal = (c.flags.aphroTotal || 0) + n;
        var lim = 3 + ctx.stat(c, 'hp') * 1.6;
        if (c.flags.aphro > lim && ctx.rng() < 0.25 + (c.flags.aphro - lim) * 0.15) { c.flags.down = 2 + (ctx.stat(c, 'hp') <= 2 ? 1 : 0); c.flags.justDown = true; c.hp -= 15; c.flags.aphro *= 0.6; }
        c.tr.impulse = HK.clamp(c.tr.impulse + 0.06 * n); c.tr.honesty = HK.clamp(c.tr.honesty + 0.05 * n);
        ctx.others(c).forEach(function (o) { ctx.mod(c, o, { att: 5 * n }); });
        ctx.stress(c, 6 * n);
      },
      state: function (c) {
        if (c.flags.justDown) { c.flags.justDown = false; return '次の瞬間、{a}の膝が崩れた。{a}の体は飲んだ媚薬の量に耐えきれず、{a}は床に倒れ込んだまま動けなくなった。'; }
        var x = c.flags.aphro || 0; return x >= 8 ? '{a}の目は焦点が合っておらず、熱い息だけが漏れていた。' : x >= 5 ? '{a}の呼吸は浅く、肌が熱を帯びていた。' : x >= 3 ? '{a}の頬がはっきりと赤い。' : '';
      }
    },
    sake: {
      fit: function (c) { return c.tr.fc * 0.5 + c.tr.impulse * 0.3 + c.tr.cold * 0.2 + ctx0(c); },
      lines: {
        np: ['{a}は「つまみがないのが惜しいね」と笑って、{n}杯空けた。', '{a}は皆の分まで引き受けるように、{n}杯を飲み干した。'],
        fc: ['「一気！一気！」{a}は自分で囃し立てて{n}杯空けた。', '{a}は{n}杯目で歌い始めた。', '{a}は「これ、いい酒だ」と目を輝かせて{n}杯呷った。'],
        cold: ['{a}は水でも飲むように{n}杯空けた。顔色ひとつ変わらない。', '{a}は「分担しよう。俺はあと{n}杯」と事務的に言って、その通りにした。'],
        ac: ['{a}は勧められるまま、断れずに{n}杯飲んだ。', '{a}は「私、強くないんだけど……」と言いながら{n}杯空けた。'],
        /* キャラの設定「お酒」が弱い（1・2）／強い（4・5）人 */
        weak: ['{a}は「お酒、弱いんだけど｜酒には弱いんだ｜お酒は弱いんです」と前置きして、{n}杯を少しずつ流し込んだ。もう頬が赤い。', '{a}は鼻をつまむようにして{n}杯飲んだ。一杯目の途中で、もう目が潤んでいた。', '{a}は{n}杯空けると、壁に手をついて深く息を吐いた。「……回るの、早すぎ｜……回るのが、早すぎる｜……回るのが、早すぎます」'],
        strong: ['{a}は「任せて。酒なら強い｜任せろ。酒なら強い｜任せてください。お酒なら強いです」と言って、{n}杯を涼しい顔で空けた。', '{a}は水でも飲むように{n}杯飲み干し、「次｜次だ｜次をください」と杯を差し出した。', '{a}は{n}杯空けても顔色ひとつ変えず、皆の残りの杯数を数え直した。']
      },
      effect: function (ctx, c, n) { c.flags.drunk = (c.flags.drunk || 0) + n * 12 * (1.4 - ctx.stat(c, 'hp') * 0.12) * HK.drunkRate(c); if (c.flags.drunk > 70 + ctx.stat(c, 'hp') * 8 && ctx.rng() < 0.4) { c.flags.down = 2; c.flags.justDown = true; c.flags.drunk *= 0.5; } c.tr.honesty = HK.clamp(c.tr.honesty + 0.05 * n); c.tr.impulse = HK.clamp(c.tr.impulse + 0.04 * n); ctx.stress(c, -4 * n); },
      state: function (c) { if (c.flags.justDown) { c.flags.justDown = false; return '{a}はそのまま床に突っ伏して、寝息を立て始めた。'; } var x = c.flags.drunk || 0; return x >= 60 ? '{a}の呂律が回らなくなってきた。' : x >= 30 ? '{a}の目元が赤い。' : ''; }
    },
    spicy: {
      fit: function (c) { return c.tr.cp * 0.4 + c.tr.fc * 0.4 + c.tr.np * 0.2; },
      lines: {
        np: ['{a}は涙を流しながら、{n}杯目を完食した。「みんなの分、少しでも減らしたくて」', '{a}は汗だくで{n}杯を平らげ、残りのスープまで飲んだ。'],
        fc: ['「辛っ！でもうまっ！」{a}は叫びながら{n}杯をかき込んだ。', '{a}はなぜか楽しそうに{n}杯完食して、舌を出してみせた。'],
        cold: ['{a}は無言で{n}杯を食べ切った。唇だけが真っ赤だった。', '{a}は一口ごとに水を飲む配分まで計算して、{n}杯を処理した。'],
        cp: ['「この程度で音を上げるか」{a}は意地で{n}杯を平らげた。', '{a}は誰にも負けたくない一心で、{n}杯を完食した。']
      },
      effect: function (ctx, c, n) { ctx.stress(c, 7 * n); c.hp -= 3 * n; c.flags.spicy = (c.flags.spicy || 0) + n; if (ctx.rng() < 0.25 + n * 0.1 - ctx.stat(c, 'hp') * 0.04) c.flags.belly = 2 + ctx.rng.int(3); },
      state: function (c) { return c.stress > 70 ? '{a}は床に倒れ込んで、天井を見上げていた。' : ''; }
    },
    pill: {
      fit: function (c) { return c.tr.np * 0.5 + c.tr.impulse * 0.4 + c.tr.cold * 0.2; },
      lines: {
        np: ['{a}は「毒見だと思えば」と言って、{n}錠を水で流し込んだ。', '{a}は自分が先に飲んで、何も起きないことを皆に見せた。{n}錠。'],
        fc: ['{a}は錠剤をラムネのように口に放り込んだ。{n}錠。', '「何が起きるか見てみたい」{a}は{n}錠を一度に飲んだ。'],
        cold: ['{a}は錠剤の刻印を確かめてから、{n}錠飲んだ。', '{a}は一錠ずつ時間を空けて、効果を観察しながら{n}錠を飲んだ。'],
        ac: ['{a}は目を瞑って、{n}錠を飲み込んだ。']
      },
      effect: function (ctx, c, n) {
        var r = ctx.rng();
        if (r < 0.35) { ctx.others(c).forEach(function (o) { ctx.mod(c, o, { att: 4 * n }); }); c.flags.pillfx = 'heat'; }
        else if (r < 0.65) { ctx.stress(c, -8 * n); c.flags.pillfx = 'calm'; }
        else { ctx.stress(c, 8 * n); c.tr.honesty = HK.clamp(c.tr.honesty + 0.08 * n); c.flags.pillfx = 'truth'; }
      },
      state: function (c) { return { heat: '{a}の視線が、熱っぽく揺れている。', calm: '{a}はやけに穏やかな顔をしている。', truth: '{a}は、聞かれてもいないことを話し始めた。' }[c.flags.pillfx] || ''; }
    }
  };
  function ctx0() { return 0; }

  function topKey(c) {
    var t = c.tr, best = 'np', bv = -1;
    [['np', t.np], ['fc', t.impulse], ['cold', t.cold], ['ac', t.ac], ['cp', t.cp]].forEach(function (x) { if (x[1] > bv) { bv = x[1]; best = x[0]; } });
    return best;
  }

  /* 条件の重さ：手を繋ぐ・膝枕は軽く、キス・エッチは重い */
  var LVL_ATT = [0, -8, 4, 26, 36, 42];
  var LVL_TRUST = [0, -10, -2, 6, 12, 16];
  /* 既存の関係による抵抗感（足される惹かれの壁）。家族は軽い行為以外ほぼ不可 */
  /* 執着（信仰）で「恋愛に発展：しない」かつ支配（dominate）でない組は、キス以上・夜（体の関係）にしない */
  function wsNoSex(ctx, a, b) {
    if (!ctx || !ctx.tiesAll || !HK.Ties || !a || !b || a === b) return false;
    /* 家族（きょうだい・親子・親族など）で「恋愛：なし」の組も、キス以上・夜（体の関係）・三人の場面にしない */
    return HK.Ties.all(ctx, a, b).some(function (t) { return (t.type === 'worship' && HK.tieOptNoLove && HK.tieOptNoLove(t) && t.cold !== 'dominate') || (HK.tieNoLove && HK.tieNoLove(t)); });
  }
  HK.roomWsNoSex = wsNoSex;
  function tieWall(ctx, a, b, lvl) {
    if (wsNoSex(ctx, a, b)) return lvl >= 3 ? 999 : 0;
    /* 本命がほかにいる人：キス以上は壁が高い。焦りが限界・媚薬が強いときは妥協して低くなる */
    var hw = 0; [a, b].forEach(function (c, k) { var o = k ? a : b; if (c.honmei != null && c.honmei !== o.i && lvl >= 3) hw += HK.honmeiDesperate(ctx, c) ? 6 : 28; });
    if (hw) return hw + (function () { var t0 = HK.Ties ? HK.Ties.get(ctx, a, b) : null; return t0 && HK.TIES[t0.type] && !HK.TIES[t0.type].family ? ({ enemy: 20, rival: 12, ex: 6, lover: -30, fwb: -35, almost: -15, crush: -8, best: -4, childhood: -4 }[t0.type] || 0) : 0; })();
    var t = HK.Ties ? HK.Ties.get(ctx, a, b) : null;
    if (!t) return 0;
    var D = HK.TIES[t.type];
    /* 家族：「恋愛：なし」はキス以上は不可。「恋愛：あり」・擬似親子は、ほかの組と同じ（壁を足さない） */
    if (D.family) return !HK.tieNoLove(t) ? 0 : lvl >= 3 ? 999 : 0;
    return { enemy: 20, rival: 12, ex: 6, lover: -30, fwb: -35, almost: -15, crush: -8, best: -4, childhood: -4 }[t.type] || 0;
  }
  function posClash(a, b) { return !!(HK.Pos && HK.Pos.clash && HK.Pos.clash(a, b)); }
  function clashH(ctx, a, b) { return posClash(a, b) && ctx.rules.some(function (r) { return r.k === 'h'; }); }
  /* 体の関係を持ってよい組か（受け攻めの指定と恋愛対象から。攻め×攻めなどは、恋人でも、焦りが限界でも、媚薬でも、しない） */
  function okSex(a, b) { return (!HK.Pos || HK.Pos.okSex(a, b)) && !wsNoSex(HK._curCtx, a, b); }
  /* a が b に対して攻め（動く側）に回れる向きがあるか（向きの記憶は動かさずに確かめる） */
  function canLead(a, b) { return !HK.Pos || HK.Pos.orients(a, b).some(function (o) { return o[0] === a; }); }
  /* 自分で「受け」を選んだ二人（受けとリバも好む設定などで、組として成り立つとき）：どちらが動くか（{a}=覚悟を決めて動く側） */
  function bothBottom(a, b) { var P = HK.Pos; return !!(P && P.explicit(a, b) && P.explicit(b, a) && P.isBottom(a, b) && P.isBottom(b, a) && P.okSex(a, b)); }
  var CLASH_BOTTOM = {
    cp: ['{a}と{b}は、どちらも相手がリードするものだと思っていた。気まずい沈黙のあと、{a}が仕方なさそうに、乱暴に袖をまくった。','{a}と{b}は、どちらも自分から動く気はなかった。見かねた{a}が、ため息をついて{b}の肩を押した。', '「普通、そっちがリードするところだろ」――{a}と{b}は同時に同じことを言った。睨み合いに負けたのは、{a}のほうだった。'],
    cold: ['{a}と{b}は、どちらも抱かれる側のつもりだった。このままでは埒が明かないと判断した{a}が、慣れない手つきで{b}に触れ始めた。', '{a}は時計を見上げ、「このまま待っても進まない」と淡々と言った。それから、自分が動くほうを引き受けた。', '{a}と{b}は、どちらが動くかを理屈で決めようとして、結論が出なかった。{a}は小さく息を吐き、黙って{b}の上着に手をかけた。'],
    fc: ['{a}と{b}は、どちらがリードするかでじゃんけんをした。負けた{a}は、照れ笑いしながら{b}に覆いかぶさった。','{a}と{b}は、お互いに相手が動くのを待って、しばらく見つめ合ったまま笑ってしまった。先に手を伸ばしたのは、{a}だった。', '{a}は「じゃあ今回だけ、こっちがやってみる」と言って袖をまくった。{b}は「初心者マークつけといて」と笑った。'],
    np: ['{a}と{b}は、どちらも相手に委ねたいほうだった。{b}の不安そうな顔を見て、{a}が覚悟を決めた。', '{a}は{b}の手が震えているのに気づいて、「いいよ、こっちがする」と静かに言った。', '{a}は{b}を毛布でくるんでから、「慣れてないけど、優しくするから」と言って、そっと隣に横になった。'],
    ac: ['{a}と{b}は、どちらも自分から動けなかった。長い沈黙のあと、震える指で先に触れたのは、{a}のほうだった。', '{a}と{b}は、ベッドの端と端に座ったまま、何分も動けなかった。先に「……じゃあ」と言ったのは{a}で、言った途端に耳まで赤くなった。', '{a}は消え入りそうな声で「下手でも、笑わないで」と言ってから、おそるおそる{b}の肩に触れた。']
  };
  function clashText(ctx, a, b) {
    var o = HK.Pos.order(a, b, [a, b]), y = o[0], t = y.tr;
    var k = [['cp', t.cp], ['cold', t.cold || 0], ['fc', t.fc], ['np', t.np], ['ac', t.ac]].sort(function (x, z) { return z[1] - x[1]; })[0][0];
    return { text: ctx.t(ctx.pick(CLASH_BOTTOM[k]), o[0], o[1]), why: 'どちらも受け。' + y.name + 'が覚悟を決めた' };
  }

  var scen = {
    id: 'whiteroom', name: '出られない部屋', kicker: '密室・関係性',
    desc: '目覚めると白い部屋。扉の紙には脱出条件。条件は自由に組み立てられる（例：媚薬を10本飲み切って、エッチしないと出られない部屋）。',
    unit: '時間', preRel: 0, lethal: false,
    /* 脱出条件そのものが恋愛・性的な行為なので、「恋愛の起こりやすさ」0や恋愛対象で止めない（部屋の側の嫌がり方で扱う） */
    romanceCore: true,
    catBias: { romance: 1.5, escape: 1.2 }, decay: 0.995, miniShare: 0.75, priBoost: 3,
    derived: ['caution', 'honesty', 'impulse', 'cold'],
    exclude: ['take_charge'],
    env: [
      { id: 'cond', label: '条件1', type: 'select', def: 'h', options: options },
      { id: 'n1', label: '条件1の回数・本数', min: 1, max: 100, def: 1, lo: '1', hi: '100', desc: '「キスを10回」「媚薬を10本」の数字' },
      { id: 'cond2', label: '条件2（任意）', type: 'select', def: 'none', options: [{ v: 'none', label: 'なし' }].concat(options.filter(function (o) { return o.v !== 'one'; })) },
      { id: 'n2', label: '条件2の回数・本数', min: 1, max: 100, def: 1, lo: '1', hi: '100' },
      { id: 'order', label: '条件の順番', type: 'select', def: 'any', options: [{ v: 'any', label: 'どちらからでも（同時に数える）' }, { v: 'seq', label: '条件1を満たしてから条件2（先に満たした条件2は数えない）' }], desc: 'どちらからでも：「媚薬2本とキス、両方を済ませないと出られない部屋」。条件1から：「媚薬を2本飲み切ったあとに、キスしないと出られない部屋」（条件1の前の条件2は、起きにくく、起きても数えない）' },
      { id: 'only1', label: '一人しか出られない（ほかの条件と併用）', type: 'select', def: 'off', options: [{ v: 'off', label: 'なし' }, { v: 'on', label: 'あり：条件を満たしても、扉をくぐれるのは一人だけ' }], desc: '条件1に「一人しか出られない」、条件2にキスなどを選んでも同じになる（条件2を満たすと扉が開き、くぐれるのは一人）。三人以上で一緒に満たしたときも一人だけ' },
      { id: 'allout', label: '条件を満たした人と一緒に、全員出られる', type: 'select', def: 'off', options: [{ v: 'off', label: 'なし（条件を満たした人だけが出る）' }, { v: 'on', label: 'あり：誰かが条件を満たして扉が開けば、何もしていない人も一緒に出られる' }], desc: '例：二人が条件を満たして扉が開いたとき、部屋に残っていた三人目もついでに出られる。「一人しか出られない」部屋では働かない' },
      { id: 'label', label: '部屋の名前（空欄なら自動）', type: 'text', def: '', placeholder: '例：媚薬を10本飲み切らないと出られない部屋' },
      { id: 'hours', label: '閉じ込められる時間', min: 4, max: 240, def: 10, lo: '4時間', hi: '10日', unit: '時間', desc: '48時間を超えると、経過は数時間ごとにまとめ、結果は重要な出来事だけの短縮版で表示する' },
      { id: 'pressure', label: '部屋の圧', min: 0, max: 100, def: 50, lo: '居心地がいい', hi: '息苦しい', desc: '高いほど焦りが溜まり、覚悟が早く決まる' }
    ],
    stats: [{ id: 'exp', label: '恋愛経験', desc: '高いほど条件への抵抗が小さい' }, { id: 'hp', label: '体力', desc: '媚薬・酒・激辛に耐える力。低い人が飲みすぎると倒れる' }],
    actions: [
      { id: 'inspect', label: '扉と壁を調べ尽くす', fit: function (t) { return t.a; }, bias: { escape: 2, solo: 1.3 } },
      { id: 'calm', label: '相手を落ち着かせる', fit: function (t) { return t.np; }, bias: { help: 1.8, bond: 1.3 } },
      { id: 'still', label: '壁際で動かない', fit: function (t) { return t.ac * 0.7 + t.caution * 0.3; }, bias: { solo: 1.8, romance: 0.7 } },
      { id: 'rip', label: '条件の紙を破り捨てる', fit: function (t) { return t.cp * 0.6 + t.aggr * 0.4; }, bias: { conflict: 1.6, romance: 0.6 } },
      { id: 'fun', label: '状況を面白がる', fit: function (t) { return t.fc; }, bias: { bond: 1.4, romance: 1.3 } }
    ],
    goals: [
      { id: 'noway', label: '条件を満たさずに出る方法を探す', fit: function (t) { return t.cp * 0.5 + t.a * 0.5; }, bias: { escape: 1.8, romance: 0.5 } },
      { id: 'respect', label: '相手の意思を最優先する', fit: function (t) { return t.np; }, bias: { help: 1.8, romance: 0.9 } },
      { id: 'quick', label: 'さっさと条件を満たす', fit: function (t) { return t.cold * 0.5 + t.impulse * 0.5; }, bias: { romance: 1.7, escape: 1.4 } },
      { id: 'know', label: '相手の本心を知りたい', fit: function (t) { return t.honesty * 0.5 + t.jealous * 0.5; }, bias: { bond: 1.6, romance: 1.2 } }
    ],
    steps: function (env) {
      var s = ['目覚め'], H = +env.hours, st = Math.max(1, Math.ceil(H / 48));
      function lab(h) { return h < 24 ? h + '時間後' : Math.floor(h / 24) + '日' + (h % 24 ? (h % 24) + '時間' : '') + '後'; }
      for (var h = st; h < H; h += st) s.push(lab(h));
      s.push(lab(H) + '（限界）');
      return s;
    },
    longRun: function (env) { return +env.hours > 48; },
    setup: function (ctx) {
      ctx.place = '白い部屋';
      ctx.rules = rulesOf(ctx.env);
      ctx.flags.prog = {}; ctx.flags.consumed = {}; ctx.flags.drank = {};
      ctx.flags.roomLabel = HK.roomLabel(ctx.env);
      ctx.flags.romantic = ctx.rules.some(function (r) { var T = K[r.k]; return (T.type === 'act' && T.lvl >= 2) || r.k === 'love' || r.k === 'aphro'; });
      ctx.flags.hasAphroRule = ctx.rules.some(function (r) { return r.k === 'aphro'; });
      ctx.flags.isOne = ctx.rules[0].k === 'one';
      /* 「一人しか出られない」をほかの条件と併用：条件を満たした組（全員の条件なら全員）のうち、扉をくぐれるのは一人 */
      ctx.flags.oneCond = !ctx.flags.isOne && oneWith(ctx.env);
      ctx.flags.toolbox = ctx.rules.some(function (r) { return r.k === 'h' || r.k === 'kiss'; });
      ctx.chars.forEach(function (c) { c.baseTr = JSON.parse(JSON.stringify(c.tr)); c.hp = 40 + ctx.stat(c, 'hp') * 12; });
      ctx.stepsTotal = scen.steps(ctx.env).length;
      ctx.stepH = Math.max(1, Math.ceil(+ctx.env.hours / 48));
      /* 条件を満たした出来事・扉が開いた出来事に印をつける（経過の画面で色を変えて示す。view.js） */
      ctx.flags.goalSeen = {}; ctx.flags.goalOut = 0;
      var say0 = ctx.say;
      ctx.say = function (o) { var e = say0.call(this, o); markGoals(ctx, e); return e; };
    },
    phase: function (ctx, s, n) {
      if (s === 0) {
        var cons = ctx.rules.filter(function (r) { return K[r.k].type === 'consume'; });
        ctx.say({ text: names(ctx.present()) + 'は白い部屋で目を覚ました。扉には一枚の紙。「' + ctx.flags.roomLabel.replace(/部屋$/, '') + '」' + (cons.length ? '部屋の隅のテーブルには、' + cons.map(function (r) { return K[r.k].table ? K[r.k].table(r.n) : K[r.k].item + 'が' + r.n + K[r.k].unit; }).join('、') + '並んでいる。' : '') + (ctx.flags.toolbox ? 'ベッドの脇には、中身を想像したくない木箱が一つ置かれていた。' : '') + (HK.Attr && HK.Attr.raceIntro ? HK.Attr.raceIntro(ctx.present(), 'trapped', ctx) : '') });
      }
      if (s === n - 1 && ctx.present().length > 1) ctx.say({ text: '照明が一段暗くなった。残された時間は少ない。' });
    },
    after: function (ctx) {
      countFlavor(ctx);
      sweepExits(ctx);
      var P = ctx.present();
      P.forEach(function (c) { c.stress = HK.clamp(c.stress + ctx.env.pressure / 100 * 12 + 4, 0, 100); });
      /* 二人きりは話す時間が長い：毎時間、少しずつ距離が縮む */
      if (P.length === 2) ctx.mod2(P[0], P[1], { trust: 2.5, att: ctx.flags.romantic ? 2 : 0.5, ten: -1 }, { trust: 2.5, att: ctx.flags.romantic ? 2 : 0.5, ten: -1 });
      P.forEach(function (c) {
        if (c.flags.partner != null && ctx.chars[c.flags.partner].out) c.flags.partner = null;
        if (c.flags.down > 0) { c.flags.down--; if (!c.flags.down) ctx.say({ text: c.name + 'がようやく起き上がった。', actors: [c] }); }
        if (c.flags.aphro) c.flags.aphro = Math.max(0, c.flags.aphro - 0.15 * (ctx.stepH || 1));
        if (c.flags.belly > 0) c.flags.belly = Math.max(0, c.flags.belly - 1);
      });
    },
    end: function (ctx) { return ctx.flags.oneOut || ctx.present().filter(function (c) { return !c.flags.knocked; }).length <= (hasPairRule(ctx) ? 1 : 0); },
    finish: function (ctx) {
      sweepExits(ctx);
      /* 気絶した人は present() に入らないので、部屋に残った人として別に足す */
      ctx.present().concat(ctx.chars.filter(function (c) { return c.alive !== false && !c.out && c.flags && c.flags.knocked; })).forEach(function (c) {
        /* 条件を満たしたのに、自分の意思で残った人（exitPair の stay）は「取り残された」ではない */
        if (c.flags.stayed) { c.fate = '自分から残った'; c.fateNote = '条件を満たしたが、自分の意思で部屋に残った'; return; }
        c.fate = '取り残された';
        c.fateNote = c.flags.knocked ? (c.flags.knockedBy != null ? ctx.chars[c.flags.knockedBy].name + 'に' : '') + '気絶させられ、部屋に残された' : (ctx.flags.isOne || ctx.flags.oneCond) && ctx.flags.oneOut ? '扉はもう開かなかった' : '最後まで条件を満たせなかった';
      });
      ctx.flags.outcome = ctx.flags.roomLabel;
      /* まだ部屋の中にいる人の結末を選ぶ（room-left.js。記録に書くのは、room-know.js の結末の締めのあと） */
      if (HK.RoomLeft) HK.RoomLeft.decide(ctx);
    },
    events: []
  };

  var EV = scen.events;

  /* 条件の行為が、ほかの出来事の中で起きたときも数える（暗闇で手を繋いだ、など） */
  var ACT_RE = { hand: /手を(繋|つな|握)|手を探り当て|指を絡/, hug: /抱きしめ|抱き合|ハグ/, lap: /膝枕/, kiss: /キスを?し|唇を重ね|口づけ/ };
  var NO_RE = /身を引いた|振り払った|振りほどいた|手を引っ込め|払いのけ|拒んだ/;
  var FL_NOUN = { hand: '手繋ぎ' };
  function snip(t) { t = String(t); return t.length > 28 ? t.slice(0, 27) + '…' : t; }
  /* ほかの出来事の中の条件2の行為・言葉（条件の順番で、まだ数えない）：数えずに残し、組と条件ごとに一度だけ「まだ数えない」と書く */
  function preSeen(ctx, r, a, b, e) {
    var p = prog(ctx, a, b);
    p.pre = p.pre || {}; p.pre[r.k] = (p.pre[r.k] || 0) + 1;
    if ((p.preNote = p.preNote || {})[r.k]) return;
    p.preNote[r.k] = 1;
    ctx.say({ kind: 'event', cat: 'escape', actors: [a, b], text: waitNote(ctx, r, a, b), why: '「' + snip(e.text) + '」の中の' + (FL_NOUN[r.k] || K[r.k].noun) + 'は、条件の順番（条件1を満たしてから条件2）で、まだ数えない', mag: 4 });
  }
  function countFlavor(ctx) {
    var from = ctx.flags.scan || 0, L = ctx.log;
    ctx.flags.scan = L.length;
    if (ctx.flags.isOne) return;
    for (var i = from; i < L.length; i++) {
      var e = L[i], ac = e.actors || [];
      if (ac.length !== 2 || !e.text || /扉|\d+\/\d+）/.test(e.text)) continue;
      var a = typeof ac[0] === 'number' ? ctx.chars[ac[0]] : ac[0], b = typeof ac[1] === 'number' ? ctx.chars[ac[1]] : ac[1];
      if (!a || !b || a.out || b.out || a === b) continue;
      /* 亡くなった人（心中など）・死の場面の文は数えない（「抱きしめたまま」の心中をハグと数えて、亡くなった二人が部屋を出ないように） */
      if (a.alive === false || b.alive === false || e.cat === 'kill' || e.cat === 'death') continue;
      /* 会話の中で「好き」と言った（先に名前の出た方が言ったものとして数える） */
      ctx.rules.forEach(function (r) {
        if (r.k !== 'love' || a.out || ruleDone(ctx, r, a, b) || !/「[^」]*好き(?!な|に|じゃな)[^」]*」/.test(e.text)) return;
        if (seqWait(ctx, r, a, b)) { preSeen(ctx, r, a, b, e); return; }
        seqFlush(ctx, r, a, b);
        var p = prog(ctx, a, b);
        if ((p.said['love' + a.i] || 0) >= r.n) return;
        p.said['love' + a.i] = (p.said['love' + a.i] || 0) + 1;
        if (a.flags.partner == null) a.flags.partner = b.i;
        if (b.flags.partner == null) b.flags.partner = a.i;
        if (pairDone(ctx, a, b)) {
          var ex = exitPair(ctx, a, b, '扉の紙が、今の「好き」を数えた。', '「' + snip(e.text) + '」の中で、条件の「好き」が揃った', false);
          ctx.say({ kind: 'event', cat: 'escape', actors: [a, b], text: ex.text, why: ex.why, mag: 30 });
        } else ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: '扉の紙が、' + a.name + 'の今の「好き」を数えた。残っているのは、' + leftText(ctx, a, b) + '。', why: '「' + snip(e.text) + '」の中で、条件の言葉が出た', mag: 6 });
      });
      ctx.rules.forEach(function (r) {
        if (a.out || K[r.k].type !== 'act' || !ACT_RE[r.k] || ruleDone(ctx, r, a, b) || !ACT_RE[r.k].test(e.text) || NO_RE.test(e.text)) return;
        if (seqWait(ctx, r, a, b)) { preSeen(ctx, r, a, b, e); return; }
        var p = prog(ctx, a, b);
        bumpAct(ctx, r, a, b, 1);
        var note = '扉の紙が、今の' + (FL_NOUN[r.k] || K[r.k].noun) + 'を数えた' + cntTag(ctx, r, a, b, p.act[r.k]) + '。';
        if (pairDone(ctx, a, b)) {
          var ex = exitPair(ctx, a, b, note, '「' + snip(e.text) + '」の中で、条件の' + (FL_NOUN[r.k] || K[r.k].noun) + 'が済んでいた', false);
          ctx.say({ kind: 'event', cat: 'escape', actors: [a, b], text: ex.text, why: ex.why, mag: 30 });
        } else if (p.act[r.k] >= r.n) ctx.say({ kind: 'event', cat: 'escape', actors: [a, b], text: note + '扉はまだ開かない。' + a.name + 'と' + b.name + 'に残っているのは、' + leftText(ctx, a, b) + '。', why: '「' + snip(e.text) + '」の中で、条件の一つが済んだ', mag: 8 });
      });
    }
    ctx.flags.scan = ctx.log.length;
  }

  /* この二人が今できる行為の条件（まだ済んでいない・向きが決まる・気持ちか焦りがある） */
  function actElig(ctx, a, b) {
    return ctx.rules.filter(function (x) { var T = K[x.k]; return T.type === 'act' && !ruleDone(ctx, x, a, b) && !(T.lvl >= 5 && !okSex(a, b)) && (willing(ctx, a, b, T.lvl) || desperate(ctx, a, b, T.lvl)); });
  }
  /* 行為（手を繋ぐ〜エッチ） */
  EV.push({
    id: 'doact', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (a.flags.down || b.flags.down) return false;
      return ctx.rules.some(function (r) {
        var T = K[r.k];
        if (T.type !== 'act' || ruleDone(ctx, r, a, b)) return false;
        if (T.lvl >= 5 && !okSex(a, b)) return false;   /* 向きの決まらない組は、条件がエッチでも満たせない（取り残される） */
        if (T.lvl >= 3 && (exclOther(ctx, a, b) || exclOther(ctx, b, a))) return false;
        return willing(ctx, a, b, T.lvl) || desperate(ctx, a, b, T.lvl);
      });
    },
    w: function (ctx, a, b) {
      var lv = ctx.rules.reduce(function (m, r) { return K[r.k].type === 'act' ? Math.min(m, K[r.k].lvl) : m; }, 5);
      var w = 2 + (5 - lv) * 0.7 + R(ctx, a, b).att / 40 + (ctx.present().length === 2 ? 1 : 0);
      if (crowd(ctx)) {
        [[a, b], [b, a]].forEach(function (x) { var p = x[0].flags.partner; if (p != null) w *= p === x[1].i ? 2.2 : 0.35; });
        w *= 0.6 + eager(ctx, a);
      }
      /* 条件の順番あり：できる行為が、条件1を待っている条件2だけなら、起きにくくする（数えないので） */
      var el = actElig(ctx, a, b);
      if (el.length && el.every(function (x) { return seqWait(ctx, x, a, b); })) w *= 0.15;
      return w;
    },
    run: function (ctx, a, b) {
      /* 条件1を待っていない条件を先に選ぶ */
      var el = actElig(ctx, a, b), r = el.filter(function (x) { return !seqWait(ctx, x, a, b); })[0] || el[0];
      var T = K[r.k], p = prog(ctx, a, b), wl = willing(ctx, a, b, T.lvl), wait = seqWait(ctx, r, a, b);
      var first = !p.act[r.k] && !(p.pre && p.pre[r.k]);
      var span = Math.max(3, ctx.stepsTotal * 0.55);
      var inc = r.n > 3 ? Math.max(1, Math.round(r.n / span * (wl ? 1.3 : 0.8) * (0.6 + ctx.rng() * 0.8) * (6 - T.lvl) / 3)) : 1 + (wl && r.n > 1 && ctx.rng() < 0.5 ? 1 : 0);
      bumpAct(ctx, r, a, b, inc);
      var g = T.lvl * 2.5;
      ctx.mod2(a, b, { att: wl ? g + 2 : g / 2, aff: wl ? g / 2 : 0, trust: 2 }, { att: wl ? g + 2 : g / 2, aff: wl ? g / 2 : 0, trust: 2 });
      var pool = ACT_TEXT[r.k][wl ? 'will' : 'des'];
      var LW = HK.RoomLewd, isH = r.k === 'h' && LW;
      /* はじめてのエッチの前置き：仕方なくなら必ず、望んでなら半分の確率で（場面の文は LW.scene） */
      var text = isH ? (first && (!wl || ctx.rng() < 0.5) ? ctx.t(ctx.pick(pool), a, b).replace(/――.*$/, '') : '') + LW.scene(ctx, a, b, first ? (wl ? 'will' : 'des') : 'repeat')
        : first ? ctx.t(ctx.pick(pool), a, b)
        : LW && LW.repeat[r.k] && ctx.rng() < 0.8 ? ctx.t(ctx.pick(LW.repeat[r.k]), a, b) : ctx.t(ctx.pick(REPEAT), a, b);
      var user = ctx.most([a, b], function (c) { return c.tr.fc * 0.5 + c.tr.impulse * 0.3 + (ctx.stat(c, 'exp') - 3) * 0.1 + eager(ctx, c) * 0.3; });
      /* 木箱の道具を相手に使うのは、受け攻めの指定で動く側（自分で攻めを選んだ人に、縛る・玩具を当てる、はしない）。体の関係を持てない組は使わない */
      if (HK.Pos && okSex(a, b)) user = HK.Pos.order(a, b, [user, user === a ? b : a])[0];
      if (ctx.flags.toolbox && okSex(a, b) && (r.k === 'h' || r.k === 'kiss') && ctx.rng() < 0.22 + user.tr.fc * 0.25 + (ctx.stat(user, 'exp') - 3) * 0.06 + (a.flags.aphro || 0) * 0.03) {
        var tool = ctx.pick(TOOLS), other = user === a ? b : a;
        var tt = ctx.t(ctx.pick(tool.t), user, other);
        text = isH ? LW.scene(ctx, user, other, wl ? 'will' : 'des', { toolText: tt, lead: true }) : tt.replace(/――$/, '') + ctx.t(ctx.pick(ACT_TEXT.kiss.will), user, other);
        if (r.n > 1) bumpAct(ctx, r, a, b, 1);
        ctx.mod2(user, other, { att: 4 }, { att: other.tr.fc > 0.5 ? 5 : 1, ten: other.tr.cp > 0.65 ? 4 : 0 });
        ctx.flags.toolUsed = (ctx.flags.toolUsed || 0) + 1;
      }
      /* キスの最中の声（R18版のみ。moan-engine.js の共通の声 k0。言葉のない声）：受ける側（受け攻めの受け）が一つ。体の関係を持てない組・R18に参加しない人・全年齢では足さない */
      if (r.k === 'kiss' && !HK.SAFE_ON && HK.Moan && HK.Moan.pick && HK.Pos && okSex(a, b) && !a.noR18 && !b.noR18 && ctx.rng() < 0.6) {
        var kv = HK.Pos.order(a, b, [a, b])[1];
        text += kv.name + '「' + HK.Moan.pick(ctx, kv, 'k0', {}) + '」';
      }
      /* 敵対の強さで嫌っていて、強引な性格の側がいれば、ちょっと乱暴に（R18版の描写は room-lewd.js） */
      var HKr = HK.HateKit, rough = HKr && (r.k === 'h' || r.k === 'kiss') ? HKr.forcer(ctx, a, b) : null;
      if (rough && !isH) {
        var rv = rough === a ? b : a;
        text = rough.name + 'は' + rv.name + 'の手首を掴んで、乱暴に壁へ押しつけた。' + HK.TL.line(rough, 'H_ROUGH', rv) + text;
      }
      var cl = r.k === 'h' && first && bothBottom(a, b) ? clashText(ctx, a, b) : null;
      if (cl) text = cl.text + text;
      /* 「誰とでも可」の人と固定外の相手（HK.State.freeSex。free-sex.js）：はじめてのエッチに「恋ではない」一文。体だけの関係の印（恋人にはしない） */
      var fsx = r.k === 'h' && HK.State.freeSex && HK.State.freeSex(ctx, a, b);
      if (fsx) { if (first) text = HK.FreeSex.lead(ctx, a, b) + text; HK.FreeSex.mark(ctx, a, b); if (first) HK.FreeSex.jealous(ctx, a, b); }
      text += cntTag(ctx, r, a, b, p.act[r.k]);
      var whyT = (wait ? '条件の順番：条件1のあとから数える（今のは数えない）／' : '') + (cl ? cl.why + '／' : '') + (rough ? rough.name + 'は' + (rough === a ? b : a).name + 'を敵視している（嫌悪 ' + Math.round(HKr.level(ctx, rough, rough === a ? b : a)) + '）・強引な性格。条件のために、乱暴に' : wl ? '互いの惹かれ（' + Math.round(R(ctx, a, b).att) + '／' + Math.round(R(ctx, b, a).att) + '）と信頼' : '焦りと諦め（' + Math.round(a.stress) + '／' + Math.round(b.stress) + '）。気持ちより状況が先だった');
      if (checkExit(ctx, a, b)) return exitPair(ctx, a, b, text, whyT, r.k === 'h');
      if (!wait && p.act[r.k] >= r.n) text += '扉はまだ開かない。' + a.name + 'と' + b.name + 'に残っているのは、' + leftText(ctx, a, b) + '。';
      return { text: text, why: whyT, mag: first ? 15 : 5 };
    }
  });
  /* 体の関係への積極性（0〜1）：衝動・奔放・経験・媚薬で上がり、AC・CPで下がる */
  function eager(ctx, c) {
    return HK.clamp(c.tr.impulse * 0.45 + c.tr.fc * 0.25 + (ctx.stat(c, 'exp') - 3) * 0.08 + (c.flags.aphro || 0) * 0.05 - c.tr.ac * 0.15 - c.tr.cp * 0.15 + 0.2, 0, 1);
  }
  HK.roomEager = eager;
  function heavyRule(ctx) { return ctx.rules.some(function (r) { return K[r.k].type === 'act' && K[r.k].lvl >= 3; }); }
  function crowd(ctx) { return ctx.present().length >= 3 && heavyRule(ctx); }
  /* 「相手は一人だけ」と決めた a が、決めた相手以外の b とキス以上をしない（時間が経って b への惹かれが育つか、説得されるまで） */
  function exclOther(ctx, a, b) {
    if (!a.flags.excl || a.flags.exclOpen || a.flags.partner == null || a.flags.partner === b.i) return false;
    var p = ctx.chars[a.flags.partner];
    if (!p || p.out || p.flags.down) return false;
    var el = ctx.stepIndex - (a.flags.partnerAt || 0);
    if (el >= 3 && R(ctx, a, b).att >= 35 && R(ctx, a, b).att > R(ctx, a, p).att) return false;
    return true;
  }
  function willing(ctx, a, b, lvl) {
    if (lvl >= 5 && HK.RoomReluct && HK.RoomReluct.blocks(ctx, a, b)) return false;   /* 恋人でも場所を渋っている（room-reluct.js） */
    if (lvl >= 5 && !okSex(a, b)) return false;   /* 攻め×攻めなど向きの決まらない組は、エッチをしない */
    var exp = (ctx.stat(a, 'exp') + ctx.stat(b, 'exp') - 6) * 3 + (ctx.present().length === 2 ? 4 : 0) - tieWall(ctx, a, b, lvl);
    var ab = R(ctx, a, b), ba = R(ctx, b, a);
    return ab.att + exp > LVL_ATT[lvl] && ba.att + exp > LVL_ATT[lvl] && ab.trust > LVL_TRUST[lvl] && ba.trust > LVL_TRUST[lvl] && ab.ten < 55 && ba.ten < 55;
  }
  function desperate(ctx, a, b, lvl) {
    if (lvl >= 5 && HK.RoomReluct && HK.RoomReluct.blocks(ctx, a, b)) return false;
    if (lvl >= 5 && !okSex(a, b)) return false;   /* 焦りが限界でも、どちらかが折れて受けに回ることはない */
    var wall = tieWall(ctx, a, b, lvl);
    if (wall >= 999) return false;
    var des = 10 + lvl * 10 + Math.max(0, wall) * 0.6;
    var ab = R(ctx, a, b), ba = R(ctx, b, a);
    return (a.flags.resign || a.stress > des) && (b.flags.resign || b.stress > des) && ab.trust > LVL_TRUST[lvl] - 18 && ba.trust > LVL_TRUST[lvl] - 18 && ab.ten < 60 && ba.ten < 60;
  }

  /* この二人が今言える言葉の条件 */
  function wordElig(ctx, a, b) {
    return ctx.rules.filter(function (x) { return K[x.k].type === 'word' && !(x.k === 'love' && HK.ngPair(a, b)) && !ruleDone(ctx, x, a, b) && (K[x.k].mode === 'sum' || (prog(ctx, a, b).said[x.k + a.i] || 0) < x.n); });
  }
  /* 言葉（好き／本音／いいところ） */
  EV.push({
    id: 'doword', cat: 'bond', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return ctx.rules.some(function (r) { return K[r.k].type === 'word' && !(r.k === 'love' && HK.ngPair(a, b)) && !ruleDone(ctx, r, a, b) && (K[r.k].mode === 'sum' || (prog(ctx, a, b).said[r.k + a.i] || 0) < r.n); }); },
    w: function (ctx, a, b) {
      var w = 1.6 + a.tr.honesty * 0.8 + a.stress / 80 + Math.max(0, R(ctx, a, b).trust) / 60 - (a.tr.cp > 0.7 ? 0.3 : 0) + (ctx.present().length === 2 ? 1 : 0);
      /* 言い合う条件：先に言われた側は、言い返しやすい */
      var p = prog(ctx, a, b);
      if (ctx.rules.some(function (r) { return K[r.k].type === 'word' && K[r.k].mode === 'both' && (p.said[r.k + b.i] || 0) > (p.said[r.k + a.i] || 0); })) w *= 3.5;
      if (a.flags.partner != null) w *= a.flags.partner === b.i ? 1.8 : 0.6;
      /* 条件の順番あり：言える言葉が、条件1を待っている条件2だけなら、起きにくくする（数えないので） */
      var el = wordElig(ctx, a, b);
      if (el.length && el.every(function (x) { return seqWait(ctx, x, a, b); })) w *= 0.15;
      return w;
    },
    run: function (ctx, a, b) {
      /* 恋愛・R18にしない二人は、「好き」と言い合う条件には手をつけない（ほかの言葉の条件だけ）。条件1を待っていない条件を先に選ぶ */
      var el = wordElig(ctx, a, b), r = el.filter(function (x) { return !seqWait(ctx, x, a, b); })[0] || el[0];
      var p = prog(ctx, a, b), rr = R(ctx, a, b), text, whyT, cat = 'bond', wait = seqWait(ctx, r, a, b);
      var inc = r.k === 'praise' ? 1 + ctx.rng.int(Math.max(1, Math.ceil(r.n / 4))) : r.n > 3 ? Math.max(1, Math.round(r.n / Math.max(3, ctx.stepsTotal * 0.5) * (0.6 + ctx.rng() * 0.8))) : 1;
      /* 条件1を待っている言葉は数えない（p.pre に残す）。条件1が済んだあとは、数え直しを先に済ませてから足す */
      if (wait) { p.pre = p.pre || {}; p.pre[r.k] = (p.pre[r.k] || 0) + inc; }
      else { seqFlush(ctx, r, a, b); p.said[r.k + a.i] = (p.said[r.k + a.i] || 0) + inc; }
      if (r.k === 'love') {
        cat = 'romance';
        var sincere = rr.att > 40 && rr.aff > 25;
        if (sincere) { text = ctx.pick(['{a}は{b}に言った。「好きだよ｜好きだ｜好きです」声は、思ったより震えていた。', '{a}は{b}の目をまっすぐ見て「好き」と言った。言ってから、自分で驚いた顔をした。', '「好き。……条件とか関係なく｜好きだ。……条件とは関係なく｜好きです。……条件とは関係ありません」{a}は{b}に小さく付け足した。', '{a}は{b}の耳元で、聞こえるか聞こえないかの声で「好き」と言った。']); ctx.mod(b, a, { att: 10, aff: 8 }); }
        else if (a.tr.cold > 0.6) { text = ctx.pick(['「好き。……これでいい？｜好きだ。……これでいいか？｜好きです。……これでいいですか？」{a}は{b}ではなく扉を見たまま言った。', '{a}は{b}に棒読みで「好き」と言い、紙の方を確認した。', '「好き好き好き」{a}は{b}に早口で三回言って、肩をすくめた。']); ctx.mod(b, a, { ten: 6, aff: -3 }); }
        else { text = ctx.pick(['{a}は{b}から目を逸らしたまま、「好き」と小さく言った。', '{a}は{b}の前で何度か口を開けては閉じて、ようやく「……好き｜……好きだ｜……好きです」と絞り出した。', '「す、好き｜す、好きだ｜す、好きです」{a}は噛んだ。{b}が吹き出した。']); ctx.mod(b, a, { att: 4 }); }
        whyT = sincere ? '本心（惹かれ ' + Math.round(rr.att) + '）' : a.name + 'の' + (a.tr.cold > 0.6 ? 'ドライさ' : '焦り') + '。言葉だけが先に出た';
      } else if (r.k === 'honne') {
        var what;
        if (rr.att > 35 && !HK.ngPair(a, b)) { what = ctx.pick(['{a}は、ずっと{b}に惹かれていたと打ち明けた。', '{a}は{b}に「本当は私、最初に会ったときから気になってた｜本当は私、最初に会ったときから気になっていた｜本当は私、最初に会ったときから気になっていました」と言った。']); ctx.mod(b, a, { att: 8, aff: 6 }); }
        else if (rr.ten > 30) { what = ctx.pick(['{a}は、{b}のことが苦手だったと正直に言った。', '{a}は{b}に「あのときの一言、私、まだ根に持ってる｜あのときの一言を、私はまだ根に持っている｜あのときの一言、私、まだ根に持っています」と打ち明けた。']); ctx.mod(b, a, { ten: 6, trust: 6 }); }
        else if (a.stress > 50) { what = ctx.pick(['{a}は{b}にだけ、本当はずっと怖かったと口にした。', '{a}は{b}に、ここに来る前から眠れていなかったと話した。']); ctx.mod(b, a, { aff: 6, trust: 8 }); }
        else { what = ctx.pick(['{a}は{b}に、誰にも話したことのない昔の話をした。', '{a}は{b}に、家族とずっと口をきいていないことを打ち明けた。', '{a}は{b}に、本当は今の仕事を辞めたいのだと言った。']); ctx.mod(b, a, { trust: 10 }); }
        ctx.mod(a, b, { trust: 6 });
        text = what; whyT = a.name + 'の本音の出やすさ（' + Math.round(a.tr.honesty * 100) + '）';
      } else {
        var pr = praiseFor(ctx, a, b, inc);
        text = ctx.pick(['{a}は{b}に「' + pr + '」', '{a}は少し考えてから「' + pr + '」と言った。', '「' + pr + '」と{a}が言うと、{b}は「そんなとこ見てたの｜そんなところを見ていたのか｜そんなところを見ていたんですか」と目を丸くした。', '{a}は指を折りながら、{b}のいいところを「' + pr + '」と挙げた。']);
        ctx.mod(b, a, { aff: 3, att: 2 });
        whyT = a.name + 'の観察（' + (a.tr.np > a.tr.a ? 'NP' : 'A') + '）' + (ctx.flags.praiseSrc ? '／' + b.name + 'の' + ctx.flags.praiseSrc + 'から' : '');
        ctx.flags.praiseSrc = null;
      }
      if (text.indexOf('{b}') < 0) text = '（' + b.name + 'に）' + text;
      text = ctx.t(text, a, b);
      var T = K[r.k];
      if (T.mode === 'both' && a.flags.partner == null) { a.flags.partner = b.i; if (b.flags.partner == null) b.flags.partner = a.i; }
      var cnt = T.mode === 'sum' ? (p.said[r.k + a.i] || 0) + (p.said[r.k + b.i] || 0) : p.said[r.k + a.i];
      text += cntTag(ctx, r, a, b, cnt);
      if (checkExit(ctx, a, b)) return exitPair(ctx, a, b, text, whyT, false);
      if (pairOnlyWait(ctx, a, b)) text += '扉はまだ開かない。' + a.name + 'と' + b.name + 'に残っているのは、' + leftText(ctx, a, b) + '。';
      return { cat: cat, text: text, why: whyT };
    }
  });

  /* 消費（媚薬・酒・激辛・錠剤） */
  EV.push({
    id: 'consume', cat: 'escape', scope: 'solo', pri: true,
    when: function (ctx, a) { return !a.flags.down && ctx.rules.some(function (r) { return K[r.k].type === 'consume' && globLeft(ctx, r) > 0; }); },
    w: function (ctx, a) {
      var r = ctx.rules.filter(function (x) { return K[x.k].type === 'consume' && globLeft(ctx, x) > 0; })[0];
      /* 酒は、お酒に強い人ほど進んで引き受ける（キャラの設定「お酒」） */
      /* wb：飲み物ごとの起きやすさの上乗せ（水など。room-games-r18.js） */
      return 0.8 + ITEM[r.k].fit(a) * 1.5 + a.stress / 120 + ctx.stepIndex / Math.max(4, ctx.env.hours) * 1.5 + (r.k === 'sake' && a.alcohol ? (a.alcohol - 3) * 0.3 : 0) + (ITEM[r.k].wb || 0);
    },
    run: function (ctx, a) {
      var r = ctx.rules.filter(function (x) { return K[x.k].type === 'consume' && globLeft(ctx, x) > 0; })[0];
      var I = ITEM[r.k], left = globLeft(ctx, r);
      var boss = ctx.most(ctx.present(), function (c) { return c.tr.cp * (1 - c.tr.np); });
      var drinker = a, forced = false, HKt = HK.HateKit;
      /* 敵対の強さで嫌っている相手がいて、強引な性格なら、その相手に無理やり飲ませる */
      var foe = HKt ? ctx.most(ctx.others(a).filter(function (o) { return HKt.forceful(ctx, a, o) && !o.flags.down; }), function (o) { return HKt.level(ctx, a, o); }) : null;
      if (foe && ctx.rng() < 0.65) { drinker = foe; forced = 'hate'; }
      else if (boss === a && a.tr.cp > 0.7 && a.tr.np < 0.4 && ctx.rng() < 0.5) {
        var meek = ctx.most(ctx.others(a), function (o) { return o.tr.ac; });
        if (meek && meek.tr.ac > 0.6) { drinker = meek; forced = true; }
      }
      /* mult：一度に飲む量の倍率（水は ml で数えるので、一度に多めに飲む。room-games-r18.js） */
      var scale = Math.max(1, Math.round(r.n / Math.max(4, ctx.stepsTotal * 1.2) * (I.mult || 1)));
      if (I.round) scale = Math.max(I.round, Math.round(scale / I.round) * I.round);
      var n = Math.min(left, (1 + (drinker.tr.impulse > 0.6 ? ctx.rng.int(3) : ctx.rng.int(2))) * scale);
      ctx.flags.consumed[r.k] = (ctx.flags.consumed[r.k] || 0) + n;
      var dk = ctx.flags.drank[drinker.i] = ctx.flags.drank[drinker.i] || {};
      dk[r.k] = (dk[r.k] || 0) + n;
      I.effect(ctx, drinker, n);
      var tk = topKey(drinker);
      var al = r.k === 'sake' && drinker.alcohol ? (drinker.alcohol <= 2 ? I.lines.weak : drinker.alcohol >= 4 ? I.lines.strong : null) : null;
      var lines = al || I.lines[tk] || I.lines.np;
      var text;
      if (forced === 'hate') {
        var resist = drinker.tr.cp * 0.4 + drinker.tr.aggr * 0.3 - drinker.tr.ac * 0.2 > 0.35 && ctx.rng() < 0.5;
        text = a.name + 'は' + K[r.k].item + 'を掴むと、' + drinker.name + 'の顎を押さえつけた。' + HK.TL.line(a, 'H_FORCE_DRINK', drinker) + HK.TL.line(drinker, 'R_FORCED', a) +
          (resist ? drinker.name + 'は身をよじり、半分を床にこぼしながらも、残りを飲み下させられた。' : drinker.name + 'は咳き込みながら、' + n + K[r.k].unit + '分を飲み下させられた。');
        ctx.mod(drinker, a, { ten: 18, trust: -14, aff: -8 });
        if (HKt) HKt.shift(ctx, drinker, a, 10);
      } else if (forced) {
        text = a.name + 'は' + drinker.name + 'の前に' + K[r.k].item + 'を押しやった。「飲め｜＝｜飲んでください」' + drinker.name + 'は逆らわずに' + n + K[r.k].unit + '空けた。';
        ctx.mod(drinker, a, { ten: 14, trust: -10 });
      } else text = ctx.t(ctx.pick(lines), drinker).replace(/\{n\}/g, String(n));
      var st = I.state(drinker);
      if (st) text += ctx.t(st, drinker);
      var total = r.n - globLeft(ctx, r);
      text += '（' + K[r.k].item + ' ' + total + '/' + r.n + K[r.k].unit + '）';
      var whyT = forced === 'hate' ? a.name + 'は' + drinker.name + 'を敵視している（嫌悪 ' + Math.round(HKt.level(ctx, a, drinker)) + '）・強引な性格。自分では飲まずに、無理やり飲ませた（' + drinker.name + 'の嫌悪も上がった）' : forced ? a.name + 'のCP高・NP低／' + drinker.name + 'のAC（断れない）' : drinker.name + 'の' + { np: 'NP（自分が引き受ける）', fc: '衝動性（面白がる）', cold: 'ドライさ（効率）', ac: 'AC（空気を読んで）', cp: 'CP（負けず嫌い）' }[tk];
      var e = { text: text, why: whyT, with: drinker !== a ? [drinker] : null, mag: 6 };
      if (total >= r.n) {
        ctx.say({ kind: 'event', cat: 'escape', actors: drinker !== a ? [a, drinker] : [a], text: text, why: whyT, mag: 10 });
        if (!hasPairRule(ctx)) { checkExit(ctx); return null; }
        ctx.say({ text: lastOf(r) + '。だが扉はまだ開かない。紙の残りの一文が、まだ残っている。' });
        ctx.present().forEach(function (x) {
          ctx.present().forEach(function (y) {
            /* 一人しか出られない部屋で、もう一人が出たあとは扉は開かない（組ごとに「開かなかった」を重ねない） */
            if (x.i < y.i && !x.out && !y.out && !ctx.flags.oneOut && pairDone(ctx, x, y)) {
              var actR = ctx.rules.filter(function (q) { return K[q.k].type !== 'consume'; })[0];
              var ex = exitPair(ctx, x, y, x.name + 'と' + y.name + 'は、もう一つの条件をすでに満たしていた。' + (actR && HK.RoomLewd ? HK.RoomLewd.recap(ctx, x, y, actR.k, 0) : ''), '条件がすべて揃った', false);
              ctx.say({ kind: 'event', cat: 'escape', actors: [x, y], text: ex.text, why: ex.why, mag: 30 });
            }
          });
        });
        return null;
      }
      return e;
    }
  });

  /* 媚薬が回った人への周囲の反応 */
  EV.push({
    id: 'aphro_react', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return (b.flags.aphro || 0) >= 2; },
    w: function (ctx, a, b) { return 0.6 + a.tr.np * 0.8 + R(ctx, a, b).att / 60; },
    run: function (ctx, a, b) {
      var r = R(ctx, a, b);
      if (a.tr.np > 0.55) { ctx.mod2(a, b, { att: 3 }, { trust: 12, aff: 8 }); ctx.stress(b, -6); return { text: ctx.t(ctx.pick(['{a}は水を汲んで{b}に渡し、手の届かない距離に座り直した。「辛かったら言って｜辛かったら言え｜辛かったら言ってください」', '{a}は自分の上着を脱いで、熱っぽい{b}の肩にかけた。', '{a}は{b}の額に濡らした布を当てた。「無理しないで｜無理をするな｜無理しないでください」', '{a}は{b}の隣で、ただ黙って時間が過ぎるのを待った。']), a, b), why: a.name + 'のNP：相手の意思を待つ' }; }
      if (r.att > 35 && !HK.ngPair(a, b)) { ctx.mod2(a, b, { att: 9 }, { att: 6 }); return { cat: 'romance', text: ctx.t(ctx.pick(['{a}は、潤んだ目の{b}から視線を外せなくなっていた。', '{b}が袖を掴んできた。{a}はその手を振りほどけなかった。', '{a}は{b}の熱い指先が自分の手首に触れるのを、黙って許した。']), a, b), why: a.name + 'の元々の惹かれ（' + Math.round(r.att) + '）' }; }
      if (a.tr.cp > 0.6) { ctx.mod(a, b, { ten: 6 }); return { cat: 'conflict', text: ctx.t(ctx.pick(['「考えなしに飲むからだよ｜考えなしに飲むからだ｜考えなしに飲むからです」{a}は壁際から動かなかった。', '{a}は{b}から一番遠い隅に移って、背中を向けた。']), a, b), why: a.name + 'のCP' }; }
      return { text: ctx.t(ctx.pick(['{a}はどうしていいか分からず、{b}の背中をぎこちなくさすった。', '{a}は{b}の様子を気にしながら、紙の文面を何度も読み返していた。']), a, b), why: '戸惑い' };
    }
  });

  /* 複数人で閉じ込められたときの積極性の違い */
  EV.push({
    id: 'pick_one', cat: 'bond', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return crowd(ctx) && a.flags.partner == null && !HK.ngPair(a, b) && eager(ctx, a) < 0.42 && R(ctx, a, b).trust > -5 && ctx.stepIndex >= 1 && !loveTrioOf(ctx, a, b); },   /* 恋愛・R18にしない相手を「相手」に選ばない。円満な三人（room-trio.js）の中では、一人だけを選ばない */
    w: function (ctx, a, b) { return 0.5 + (0.5 - eager(ctx, a)) + (R(ctx, a, b).trust + R(ctx, a, b).aff) / 80; },
    run: function (ctx, a, b) {
      a.flags.partner = b.i; a.flags.excl = true; a.flags.partnerAt = ctx.stepIndex;   /* 「相手は一人」と決めた（room-trio.js で三人を始める条件に使う） */
      var mutual = b.flags.partner == null && eager(ctx, b) < 0.55;
      if (mutual) { b.flags.partner = a.i; b.flags.excl = true; b.flags.partnerAt = ctx.stepIndex; }
      ctx.mod2(a, b, { trust: 8, att: 4 }, { trust: mutual ? 8 : 3, att: mutual ? 4 : 1 });
      return { text: ctx.t(ctx.pick(['{a}は{b}の袖を引いた。「…するなら、私は{b}がいい。他の人とは無理｜…するなら、私は{b}がいい。他の者とは無理だ｜…するなら、私は{b}がいいです。他の人とは無理です」', '{a}は皆に聞こえないように{b}に言った。「揉めたくない。だから、相手は{b}だけって決めていい？｜揉めたくない。だから、相手は{b}だけと決めていいか？｜揉めたくありません。だから、相手は{b}だけと決めていいですか？」', '{a}は{b}の隣に座って、それ以上誰とも目を合わせなかった。', '{a}「私、こういうのは一人とだけって決めてる｜私は、こういうことは一人とだけと決めている｜私、こういうことは一人とだけと決めています」{a}は{b}の方だけを見ていた。']), a, b) + (mutual ? ctx.t('{b}は小さく頷いた。', a, b) : ''), why: a.name + 'は積極性が低く（' + Math.round(eager(ctx, a) * 100) + '）、面倒を避けて相手を一人に決めた' };
    }
  });
  EV.push({
    id: 'decline_more', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return crowd(ctx) && b.flags.partner != null && b.flags.partner !== a.i && !HK.ngPair(a, b) && eager(ctx, a) > 0.55 && R(ctx, a, b).att > 15; },
    w: function (ctx, a) { return 0.6 + eager(ctx, a); },
    run: function (ctx, a, b) {
      var p = ctx.chars[b.flags.partner];
      ctx.mod2(a, b, { att: 2, ten: 3 }, { ten: 8 });
      if (p && !p.out) ctx.mod(p, a, { ten: 8 });
      return { text: ctx.t(ctx.pick(['{a}が{b}に「こっちでもいいじゃん｜こっちでもいいだろう｜こちらでもいいでしょう」と囁いた。{b}は首を振って、{c}の隣に戻った。', '{a}は{b}の肩に手を回した。{b}は「…ごめん、決めてるから｜…すまない、決めているんだ｜…ごめんなさい、もう決めているんです」とその手を外した。', '{a}「三人の方が早く済むかもよ？｜三人の方が早く済むのではないか？｜三人の方が、早く済むかもしれませんよ？」{b}「そういう問題じゃない｜そういう問題ではない｜そういう問題ではありません」']).replace(/\{c\}/g, p ? p.name : '相手'), a, b), why: b.name + 'はもう相手を決めている。' + a.name + 'の積極性（' + Math.round(eager(ctx, a) * 100) + '）' };
    }
  });
  EV.push({
    id: 'multi_flirt', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return crowd(ctx) && eager(ctx, a) > 0.6 && (a.flags.partner == null || a.flags.partner !== b.i) && HK.canLove(a, b) && !clashH(ctx, a, b); },
    w: function (ctx, a) { return 0.5 + eager(ctx, a) * 1.2; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { att: 7 }, { att: eager(ctx, b) > 0.5 ? 6 : 2, ten: eager(ctx, b) > 0.5 ? 0 : 4 });
      var jealous = ctx.present().filter(function (o) { return o !== a && o !== b && R(ctx, o, a).att > 30 && (!HK.Obsess || HK.Obsess.jealOk(ctx, o, a)); })[0];
      if (jealous) { ctx.pair(jealous, a).jealous++; ctx.mod(jealous, a, { ten: 8 }); if (HK.Obsess) HK.Obsess.feed(ctx, jealous, a, 6); }
      return { text: ctx.t(ctx.pick(['{a}は{b}の隣に移って、指先で{b}の手の甲をなぞった。「次は{b}の番かな｜次は{b}の番か｜次は{b}の番でしょうか」', '{a}「どうせなら、全員と仲良くなっといた方が早くない？｜どうせなら、全員と仲良くなっておいた方が早くないか？｜どうせなら、全員と仲良くなっておいた方が早くないですか？」{b}は返事に困った。', '{a}は誰かと話しながらも、ずっと{b}に視線を送っていた。', '{a}は{b}の耳元で「あとで、ね｜あとでだ｜あとでにしましょう」と囁いた。']), a, b) + (jealous ? ctx.t('それを見ていた{c}の顔が、少し曇った。', a, b, jealous) : ''), why: a.name + 'の積極性（' + Math.round(eager(ctx, a) * 100) + '）：一人に決めず、何人とでも' };
    }
  });
  /* みんなで：積極的な人たちのうち、どの二人も体の関係を持ってよい組だけで輪を作る（攻め×攻めの二人は同じ輪に入らない） */
  function groupOf(ctx, a) {
    if (eager(ctx, a) <= 0.55 || a.flags.partner != null) return null;
    var G = [a];
    ctx.present().filter(function (c) { return c !== a && eager(ctx, c) > 0.55 && c.flags.partner == null; })
      .sort(function (x, y) { return eager(ctx, y) - eager(ctx, x); })
      .forEach(function (c) { if (G.length < 4 && G.every(function (g) { return okSex(g, c); })) G.push(c); });
    return G.length >= 3 ? G : null;
  }
  EV.push({
    id: 'group_h', cat: 'romance', sex: true, scope: 'solo', pri: true,
    when: function (ctx, a) {
      if (!ctx.rules.some(function (r) { return r.k === 'h'; }) || ctx.flags.groupDone) return false;
      return ctx.present().length >= 3 && eager(ctx, a) > 0.7 && !!groupOf(ctx, a);
    },
    w: function (ctx, a) { return 0.4 + eager(ctx, a); },
    run: function (ctx, a) {
      var G = groupOf(ctx, a);
      if (!G) return null;
      ctx.flags.groupDone = true;
      var others = ctx.present().filter(function (c) { return G.indexOf(c) < 0; });
      /* 条件の順番あり：条件1を待っている組のエッチは数えない（rh＝エッチの条件。数えない組があれば、最後に「まだ数えない」と書く） */
      var rh = ctx.rules.filter(function (r) { return r.k === 'h'; })[0], gWait = null;
      G.forEach(function (x) { G.forEach(function (y) { if (x.i < y.i) { ctx.pair(x, y).night = true; ctx.mod2(x, y, { att: 8, aff: 4 }, { att: 8, aff: 4 }); if (!bumpAct(ctx, rh, x, y, 1, null, false) && !gWait) gWait = [x, y]; } }); });
      others.forEach(function (o) { G.forEach(function (g) { ctx.mod(o, g, { ten: 6 }); }); ctx.stress(o, 8); });
      /* 輪の中心は、自分で攻めを選んだ人がいればその人（受ける側には回さない） */
      var lead = (HK.Pos && G.filter(function (c) { return HK.Pos.hardTopIn(c, G); })[0]) || a, g2 = G.filter(function (c) { return c !== lead; });
      /* 輪の中の文は R18 の文（全年齢版では抜いて、照明を落とす一文にする） */
      var groupLine = null;
      /* r18:begin */
      groupLine = function () {
        /* 受け攻めの指定どおりに：跨るのは受け、交互に抱くのは二人に対して攻めに回れる人、背後から触れられるのは攻めを選んでいない人 */
        var tb = HK.Pos ? HK.Pos.order(lead, g2[0], [lead, g2[0]]) : [lead, g2[0]];
        var both = !HK.Pos || (HK.Pos.order(lead, g2[0], [lead, g2[0]])[0] === lead && HK.Pos.order(lead, g2[1], [lead, g2[1]])[0] === lead);
        var gl = ['ride'];
        if (!HK.Pos || !HK.Pos.hardTopIn(lead, G)) gl.push('{a}は{b}に口づけながら、背後から伸びてきた{c}の手を拒まなかった。');
        if (both) gl.push('{a}は{b}と{c}を交互に抱き寄せ、二人を順番にイカせた。');
        var pk = ctx.pick(gl);
        return pk === 'ride' ? ctx.t('{b}が{a}の上に跨がり、{c}がその背中を抱きすくめた。誰の声なのか、もう分からなかった。', tb[0], tb[1], g2[1]) : ctx.t(pk, lead, g2[0], g2[1]);
      };
      /* r18:end */
      var text = ctx.t('{a}が「もう、みんなでいいじゃん｜もう、みんなでいいだろう｜もう、みんなでいいじゃないですか」と笑った。', a) + names(G) + 'は顔を見合わせ、誰からともなく手を伸ばした。' +
        (groupLine ? groupLine() : ctx.t('{a}が照明を落とすと、{b}と{c}も黙って身を寄せた。その先のことは、輪の中にいた者だけが知っている。', lead, g2[0], g2[1])) +
        (G.length > 3 ? names(G.slice(3)) + 'も、すぐに輪の中に引き込まれた。' : '') + '――' + (others.length ? names(others) + 'は部屋の隅で、背中を向けて耳を塞いでいた。' : '');
      var exitTxt = [];
      /* 三人以上での同時達成が認められていれば、全員そろって出る（room-trio.js） */
      if (HK.RoomTrio && (ctx.env.multi || 'note') !== 'no' && G.every(function (x) { return G.every(function (y) { return x === y || pairDone(ctx, x, y); }); })) {
        ctx.flags.multiKnown = true;
        return HK.RoomTrio.exitGroup(ctx, G, text, names(G) + 'の積極性が揃った。但し書き：三人以上で同時なら全員分', true, 'free');
      }
      G.forEach(function (x) { G.forEach(function (y) { if (x.i < y.i && !x.out && !y.out && pairDone(ctx, x, y)) { var ex = exitPair(ctx, x, y, '', '複数人で条件を満たした', true); exitTxt.push(ex.text); } }); });
      if (gWait) text += waitNote(ctx, rh, gWait[0], gWait[1]);
      return { text: text + (exitTxt.length ? exitTxt[0] : ''), why: names(G) + 'の積極性が揃った（' + G.map(function (c) { return Math.round(eager(ctx, c) * 100); }).join('・') + '）', mag: 35 };
    }
  });

  /* スピード型：相手の隙をついて拘束し、さっさと条件を満たして出る */
  function speedy(c) { return c.tr.cold * 0.45 + c.tr.aggr * 0.3 + c.tr.impulse * 0.25 - c.tr.np * 0.35; }
  EV.push({
    id: 'speedrun', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (a.flags.down || b.flags.down || ctx.pair(a, b).speedTried || speedy(a) < 0.38 || ctx.stepIndex < 1) return false;
      if (b.flags.partner != null && b.flags.partner !== a.i) return false;
      if (clashH(ctx, a, b)) return false;
      /* 縛るのは、その組で攻めに回れる側だけ。自分で攻めを選んだ人を縛ることはない */
      if (HK.Pos && (HK.Pos.hardTop(b, a) || !canLead(a, b))) return false;
      return ctx.rules.some(function (r) { return K[r.k].type === 'act' && K[r.k].lvl >= 2 && !ruleDone(ctx, r, a, b) && !seqWait(ctx, r, a, b); }) && tieWall(ctx, a, b, 3) < 999 && HK.canLove(a, b);
    },
    w: function (ctx, a) { return (speedy(a) - 0.25) * 3 + a.stress / 120 + (a.goal.id === 'quick' ? 0.8 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b); pf.speedTried = true;
      var lockedOther = HK.Pos && okSex(a, b) && HK.Pos.order(a, b, [a, b])[0] !== a;
      var tool = ctx.flags.toolbox ? ctx.pick(['手錠', 'ロープ', '木箱の革ベルト']) : ctx.pick(['ネクタイ', 'ベルト', 'シーツを裂いた紐']);
      var dodge = b.tr.caution * 0.4 + b.tr.cp * 0.3 + b.tr.a * 0.2 + ctx.rng() * 0.5 + Math.max(0, tieWall(ctx, a, b, 3)) / 60;
      if (dodge > 0.75 || lockedOther) {
        ctx.mod2(a, b, { ten: 6 }, { ten: 22, trust: -20 });
        return { cat: 'conflict', text: ctx.t(ctx.pick(['{a}が{b}の背後に回り込んだ瞬間、{b}は振り向きざまに{a}の手首を掴んだ。「…何するつもり？｜…何をするつもりだ？｜…何をするつもりですか？」{a}は' + tool + 'を後ろ手に隠した。', '{a}は' + tool + 'を手に{b}の隙を窺っていたが、{b}は最後まで背中を見せなかった。', '{b}は{a}の手元の' + tool + 'に気づいて、部屋の反対側まで下がった。「近づかないで｜近づくな｜近づかないでください」']), a, b), why: a.name + 'のスピード型（ドライさ・攻撃性・衝動）／' + b.name + 'の慎重さが上回った' };
      }
      pf.night = pf.night || ctx.rules.some(function (r) { return r.k === 'h'; });
      pf.forced = a.i;
      var p = prog(ctx, a, b);
      var waited = [];
      ctx.rules.forEach(function (r) { if (K[r.k].type === 'act' && !bumpAct(ctx, r, a, b, 0, r.n)) waited.push(r); });
      var liked = R(ctx, b, a).att > 35;
      ctx.mod2(a, b, { att: 4, trust: -4 }, liked ? { att: 6, ten: 10, trust: -6 } : { ten: 35, trust: -35, aff: -20 });
      var text = ctx.t(ctx.pick(['{b}が扉の紙を読み返している隙に、{a}は' + tool + 'で{b}の手首を縛った。「すぐ終わらせるから。恨むなら部屋を恨んで｜すぐ終わらせる。恨むなら部屋を恨め｜すぐ終わらせます。恨むなら部屋を恨んでください」――', '{a}は何の前置きもなく{b}をベッドに押し倒し、' + tool + 'で両手をまとめた。「話し合ってたら日が暮れる｜話し合っていたら日が暮れる｜話し合っていたら日が暮れます」――', '{a}は「ちょっと手、貸して｜少し手を貸せ｜ちょっと手を貸してください」と言って、差し出された{b}の両手を' + tool + 'で縛った。――{a}は時計も見ずに、手際よく条件を片づけた。', '{a}は{b}が眠りかけた瞬間を逃さず、' + tool + 'で{b}の両手首を縛った。結び目は、驚くほど手慣れていた。――']), a, b);
      if (liked && HK.RoomLewd && ctx.rules.some(function (r) { return r.k === 'h'; })) text = text.replace(/――$/, '') + HK.RoomLewd.scene(ctx, a, b, 'speed', { lead: true });
      else if (!ctx.rules.some(function (r) { return r.k === 'h'; })) {
        var SPD = { kiss: ['{a}は縛った{b}の顎を持ち上げ、条件の数だけ、手早く唇を重ねた。', '{a}は身動きの取れない{b}に、息つく暇もなくキスを繰り返した。'], hug: ['{a}は縛った{b}を正面から抱きすくめ、条件の回数だけ腕に力を込めた。', '{a}は{b}を後ろから抱え込み、「はい、一回、二回」と数えながら締めつけた。'], hand: ['{a}は縛られた{b}の指に、自分の指を無理やり絡めた。'], lap: ['{a}は{b}の頭を自分の膝に押しつけて、条件の時間が過ぎるまで離さなかった。'] };
        ctx.rules.forEach(function (r) { if (SPD[r.k]) text += ctx.t(ctx.pick(SPD[r.k]), a, b); });
      }
      text += liked ? ctx.t('{b}は解かれた手首をさすりながら「…強引すぎ｜…強引すぎる｜…強引すぎます」とだけ言った。耳が赤かった。', a, b) : ctx.t('{b}は解かれた手首をさすったまま、{a}と一度も目を合わせなかった。', a, b);
      if (waited.length) text += waitNote(ctx, waited[0], a, b);
      var whyT = a.name + 'のスピード型（ドライさ ' + Math.round(a.tr.cold * 100) + '・攻撃性 ' + Math.round(a.tr.aggr * 100) + '・NP低）';
      if (checkExit(ctx, a, b)) return exitPair(ctx, a, b, text, whyT, pf.night);
      return { text: text, why: whyT, mag: 30 };
    }
  });

  /* 媚薬が回りきった人：迫る・襲う・一線を越える */
  EV.push({
    id: 'aphro_heat', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) { return !a.flags.down && (a.flags.aphro || 0) >= 2.5 + ctx.stat(a, 'hp') * 0.5 && !ctx.pair(a, b).heatDone; },
    w: function (ctx, a, b) {
      var w = 0.4 + (a.flags.aphro || 0) / 4 + R(ctx, a, b).att / 60 + (b.flags.aphro ? 0.4 : 0);
      /* 条件の順番あり：抱き合っても数えない間（条件2のエッチ・キス・ハグが条件1を待っている）は、踏みとどまりやすい */
      var hr = ctx.rules.filter(function (r) { return r.k === 'h' || r.k === 'kiss' || r.k === 'hug'; });
      if (hr.length && hr.every(function (r) { return seqWait(ctx, r, a, b); })) w *= 0.35;
      return w;
    },
    run: function (ctx, a, b) {
      var ab = R(ctx, a, b), ba = R(ctx, b, a), pf = ctx.pair(a, b);
      var heat = (a.flags.aphro || 0) + (a.flags.aphroTotal || 0) * 0.3;
      var mutual = (ba.att > 28 || (b.flags.aphro || 0) >= 3) && ba.ten < 55 && !(HK.Ties && HK.tieNoLove(HK.Ties.get(ctx, a, b)));
      var wild = a.tr.aggr + a.tr.impulse - a.tr.np + heat / 10;
      var text, why, cat = 'romance';
      /* 体の関係を持てない組（攻め×攻めなど）は、媚薬が回っても抱き合わない */
      if (mutual && okSex(a, b) && (heat > 6 || ab.att + ba.att > 70)) {
        pf.heatDone = true; pf.night = true;
        ctx.mod2(a, b, { att: 14, aff: 6 }, { att: 12, aff: 5 });
        text = ctx.t(ctx.pick(['{a}の熱い指が{b}の頬に触れた。{b}はその手を払わなかった。', '「ごめん、私、もう無理｜すまない、私はもう無理だ｜ごめんなさい、私、もう無理です」{a}が掠れた声で言った。{b}は「…いいよ｜…構わない｜…構いません」とだけ答えて、{a}を引き寄せた。', '{b}も同じくらい熱かった。どちらからともなく唇が重なった。', '{a}は{b}の首筋に顔を埋めた。{b}の手が、ためらいながら{a}の背中に回った。']), a, b) + (HK.RoomLewd ? HK.RoomLewd.scene(ctx, a, b, 'aphro') : '――');
        why = '媚薬の量（' + Math.round(heat) + '）と、' + b.name + 'の側の惹かれ（' + Math.round(ba.att) + '）';
        var hr = ctx.rules.filter(function (r) { return r.k === 'h' || r.k === 'kiss' || r.k === 'hug'; });
        /* 条件の順番あり：条件1を待っている条件2は数えない（「まだ数えない」と書く） */
        var hw = hr.filter(function (r) { return !bumpAct(ctx, r, a, b, 1); });
        if (hw.length) { text += waitNote(ctx, hw[0], a, b); why += '／条件の順番：条件1のあとから数える（今のは数えない）'; }
        if (hr.length && checkExit(ctx, a, b)) return exitPair(ctx, a, b, text, why, true);
        return { text: text, why: why, mag: 25 };
      }
      if (wild > 1.0 && heat > 4) {
        pf.heatDone = true;
        var third = ctx.most(ctx.others(a).filter(function (o) { return o !== b && !o.flags.down; }), function (o) { return o.tr.np + o.tr.cp * 0.5; });
        var stop = b.tr.cp * 0.6 + b.tr.a * 0.3 + (third ? third.tr.np * 0.5 + third.tr.cp * 0.4 : 0) + ctx.rng() * 0.6;
        cat = 'conflict';
        /* 押し倒せるのは、体の関係を持ってよい組で、受け攻めの指定で a が攻めに回れるときだけ。ほかは必ず止められる */
        var mayForce = okSex(a, b) && canLead(a, b) && (!HK.Pos || HK.Pos.order(a, b, [a, b])[0] === a);
        /* 押し倒してしまう文は R18 の文（全年齢版では抜くので、必ず止められる側になる） */
        var FORCED = null;
        /* r18:begin */
        FORCED = ['媚薬に呑まれた{a}が、{b}を床に押し倒した。{b}の抵抗は、途中で弱くなった。――あとに残ったのは、気まずい沈黙だけだった。', '{a}はもう、言葉を聞いていなかった。{b}は拒みきれなかった。――', '{a}が{b}に覆いかぶさった。止める者は誰もいなかった。――'];
        /* r18:end */
        if (stop > 0.7 || !mayForce || !FORCED) {
          ctx.mod2(a, b, { ten: 10 }, { ten: 30, trust: -30, aff: -15 });
          text = ctx.t(HK.Pos && HK.Pos.hardTop(b, a) ? '媚薬に呑まれた{a}が、{b}に掴みかかった。{b}はその手首を掴み返して、壁際まで押し戻した。' : '媚薬に呑まれた{a}が、{b}を床に押し倒した。', a, b) + (third && third.tr.np + third.tr.cp > b.tr.cp ? ctx.t('{c}が{a}を引き剥がした。「しっかりしろ！｜＝｜しっかりしてください！」', a, b, third) : ctx.t(ctx.pick(['{b}は{a}の肩を突き返した。「目を覚まして｜目を覚ませ｜目を覚ましてください」', '{b}は{a}の手首を掴んで止めた。「それは、違う｜＝｜それは、違います」']), a, b));
          if (third) ctx.mod(b, third, { trust: 15, aff: 8 });
          why = a.name + 'の攻撃性・衝動と媚薬（' + Math.round(heat) + '）。' + (third ? third.name + 'が止めた' : b.name + 'が拒んだ');
          a.flags.shame = true;
        } else {
          pf.night = true; pf.forced = a.i;
          ctx.mod2(a, b, { att: 8 }, { ten: 35, trust: -35, att: 4 });
          text = ctx.t(ctx.pick(FORCED), a, b);
          why = a.name + 'の攻撃性・衝動と媚薬（' + Math.round(heat) + '）。' + b.name + 'は止めきれなかった';
        }
        return { cat: cat, text: text, why: why, mag: 30 };
      }
      ctx.mod2(a, b, { att: 6 }, { att: ba.att > 15 ? 5 : 0, ten: ba.att > 15 ? 0 : 6 });
      return { sex: false, text: ctx.t(ctx.pick(['{a}は熱に浮かされた目で{b}を見つめて、「ねえ｜なあ｜あの」と呼んだ。', '{a}は{b}の袖を掴んだまま離さなかった。指先が熱い。', '{a}は{b}の肩に額を押しつけて、荒い息を整えようとしていた。', '{a}は自分の手を太腿に押しつけて、{b}に触れまいと耐えていた。']), a, b), why: '媚薬が回っている（' + Math.round(heat) + '）' };
    }
  });
  /* 倒れた人の介抱 */
  EV.push({
    id: 'down_care', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return b.flags.down > 0 && !a.flags.down; },
    w: function (ctx, a, b) { return 1 + a.tr.np + R(ctx, a, b).aff / 50; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { aff: 4 }, { aff: 10, trust: 12 });
      return { text: ctx.t(ctx.pick(['{a}は倒れた{b}を横向きに寝かせ、水を少しずつ口に含ませた。', '{a}は{b}の頭を自分の膝に乗せて、呼吸が落ち着くのを待った。', '{a}「飲みすぎだよ、ばか｜飲みすぎだ、ばか｜ばかですね。飲みすぎです」{a}は{b}の額の汗を拭った。', '{a}は{b}の脈を測って、ほっと息をついた。']), a, b), why: a.name + 'のNP。' + b.name + 'は体力が尽きて倒れている' };
    }
  });
  /* 激辛の後遺症 */
  EV.push({
    id: 'spicy_after', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return a.flags.belly > 0 || (a.flags.spicy && ctx.rng() < 0.3); },
    w: function (ctx, a) { return 1.2 + (a.flags.belly || 0) * 0.4; },
    run: function (ctx, a) {
      var o = ctx.others(a)[0];
      if (a.flags.belly > 0) {
        ctx.stress(a, 10); a.hp -= 4;
        if (o) ctx.mod(o, a, { aff: 1 });
        return { text: ctx.t(ctx.pick(['{a}のお腹が、聞いたことのない音を立てた。{a}は部屋の隅の仕切りへ駆け込んだ。', '{a}「…ちょっと、向こう向いてて。しばらく｜…しばらく、向こうを向いていろ｜…しばらく、向こうを向いていてください」', '{a}は脂汗を浮かべて、お腹を抱えてうずくまった。「辛いのって、二回来るんだ…｜辛いものは、二回来るのか…｜辛いものって、二回来るんですね…」', '{a}は仕切りの向こうから「絶対に聞かないで｜絶対に聞くな｜絶対に聞かないでください」と三回言った。', '{a}は三度目のトイレから戻って、無言で床に倒れた。']), a), why: '激辛でお腹を壊した（体力 ' + ctx.stat(a, 'hp') + '）' };
      }
      return { text: ctx.t(ctx.pick(['{a}の唇はまだ腫れていた。「たらこみたい｜たらこのようだ｜たらこみたいです」と言われて、{a}は口を押さえた。', '{a}は「牛乳…牛乳が欲しい…｜＝｜牛乳…牛乳が欲しいです…」と天井に向かって呟いた。', '{a}のしゃっくりが止まらない。', '{a}は汗が止まらず、シャツの襟をばたばたさせた。']), a), why: '激辛の後遺症' };
    }
  });

  /* 誰かを殺さないと出られない（全年齢版・全年齢モードは、気絶させる）。ドライで攻撃的な人ほど踏み切り、優しい人・相手を想う人は踏みとどまる */
  function killRule(ctx) { return ctx.rules.filter(function (r) { return r.k === 'kill'; })[0]; }
  EV.push({
    id: 'cond_kill', cat: 'betray', dk: 'kill', scope: 'pair', pri: true,
    /* 憎悪を持っても殺さない相手（attr.js の HK.Attr.spare）には、この出来事を選ばない（文を先に書いてから kill を呼ぶ作りなので、選ぶ段階で外す。全年齢の「気絶させる」も同じ） */
    when: function (ctx, a, b) { var r = killRule(ctx); return !!r && !globDone(ctx, r) && ctx.stepIndex > 0 && !a.flags.down && !b.flags.knocked && b.alive !== false && a.stress > 40 && !(HK.Attr && HK.Attr.spare && HK.Attr.spare(ctx, b, a)); },
    w: function (ctx, a, b) { return Math.max(0.02, a.tr.cold * 0.6 + a.tr.aggr * 0.5 - a.tr.np * 0.6 + a.stress / 140 - Math.max(0, ctx.R(a, b).aff) / 120 - 0.3); },
    run: function (ctx, a, b) {
      var will = a.tr.cold * 0.6 + a.tr.aggr * 0.5 + a.stress / 160 - a.tr.np * 0.5 - Math.max(0, ctx.R(a, b).aff) / 90;
      var safe = HK.SAFE_ON;
      if (ctx.rng() > HK.clamp(will, 0.05, 0.9)) {
        ctx.stress(a, 10); ctx.mod(b, a, { ten: 12, trust: -10 });
        return { mag: 20, text: ctx.t(ctx.pick(safe ? ['{a}は{b}の背後で拳を握りしめた。……けれど、振り下ろせなかった。', '{a}は{b}の首筋に手を伸ばしかけて、震える指を引っ込めた。', '「……できるわけ、ないだろ｜……できるわけが、ないだろう｜……できるわけ、ありません」{a}は扉の紙を睨んで、床に座り込んだ。'] : ['{a}は{b}の背後で、割れた照明の破片を握りしめた。……けれど、振り下ろせなかった。', '{a}は眠る{b}の首に手をかけて、そのまま動けなくなった。指先が、ひどく冷たかった。', '「……できるわけ、ないだろ｜……できるわけが、ないだろう｜……できるわけ、ありません」{a}は扉の紙を握りつぶして、壁に背を預けた。']), a, b), why: a.name + 'は条件を満たそうとして、踏みとどまった（優しさ・' + b.name + 'への好意）' };
      }
      if (safe) {
        b.flags.knocked = true; b.flags.down = 999; b.flags.knockedBy = a.i;
        ctx.mod(b, a, { aff: -40, ten: 40, trust: -50 }); ctx.others(a).forEach(function (o) { if (o !== b) ctx.mod(o, a, { ten: 20, trust: -25 }); });
        return { mag: 45, text: ctx.t(ctx.pick(['{a}は{b}の背後に回り、首筋を強く打った。{b}は声もなく崩れ落ちた。扉の紙の文字が、一つ消えた。', '{a}は{b}の口元に、部屋の隅にあった薬を染み込ませた布を押し当てた。{b}の体から、ゆっくりと力が抜けていった。', '揉み合いになった末、{b}は壁に頭を打ちつけて動かなくなった。息はある。{a}は扉の紙を見上げた。']), a, b), why: a.name + 'は条件のために、' + b.name + 'を気絶させた（ドライさ・攻撃性・焦り）' };
      }
      ctx.kill(b, a, '部屋の条件のために');
      ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: -40, ten: 45, trust: -60 }); });
      return { mag: 60, text: ctx.t(ctx.pick(['{a}は{b}の背後に回り、迷いを振り切るように腕に力を込めた。{b}がもがくのをやめたとき、扉の紙の文字が一つ消えた。', '{a}は割れた照明の破片を、{b}の胸に突き立てた。{b}は信じられないものを見る目で、{a}を見上げた。', '「ごめん｜すまない｜ごめんなさい」――それが、{a}が{b}にかけた最後の言葉だった。']), a, b), why: a.name + 'は条件のために、' + b.name + 'を手にかけた（ドライさ・攻撃性・焦り）' };
    }
  });

  /* 一人しか出られない */
  EV.push({
    id: 'sacrifice', cat: 'help', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return ctx.flags.isOne && R(ctx, a, b).aff > 40 && ctx.stepIndex > 0; },
    w: function (ctx, a, b) { return a.tr.np * 1.2 + R(ctx, a, b).aff / 80 - 0.5; },
    run: function (ctx, a, b) {
      b.out = true; b.fate = '脱出'; b.fateNote = a.name + 'に背中を押されて一人で出た';
      a.fate = '残った'; a.fateNote = b.name + 'を先に出した';
      ctx.flags.oneOut = true;
      (ctx.flags.exits = ctx.flags.exits || []).push({ a: b.i, b: a.i, label: ctx.label, how: 'sacrifice' });
      ctx.mod2(a, b, { aff: 10 }, { aff: 25, trust: 25, att: 10 });
      return { mag: 45, text: ctx.t(ctx.pick(['{a}は{b}を扉の外へ押し出した。「先に行って｜先に行け｜先に行ってください」扉は二度と開かなかった。', '{a}は{b}の背中を叩いた。「あなたが出て。私はいい｜あなたが出ろ。私はいい｜あなたが出てください。私はいいです」閉まる扉の隙間で、{a}は笑っていた。', '「私、待ってるから｜私は、待っている｜私、待っています」と{a}は言った。それが嘘だと、{b}にも分かっていた。']), a, b), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）と' + b.name + 'への好意（' + Math.round(R(ctx, a, b).aff) + '）' };
    }
  });
  EV.push({
    id: 'grab', cat: 'betray', scope: 'pair', pri: true,
    when: function (ctx, a) { return ctx.flags.isOne && a.stress > 30; },
    /* 一人で抜け駆けするのはドライで攻撃的な人。NPが高い人はまずしない */
    w: function (ctx, a) { return Math.max(0.01 + a.stress / 1200, a.tr.cold * 0.7 + a.tr.aggr * 0.5 - a.tr.np * 0.4 - a.tr.ac * 0.25 - 0.3); },
    run: function (ctx, a, b) {
      a.out = true; a.fate = '脱出'; a.fateNote = '一人で扉をくぐった';
      ctx.flags.oneOut = true;
      (ctx.flags.exits = ctx.flags.exits || []).push({ a: a.i, b: b.i, label: ctx.label, how: 'grab' });
      ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: -30, ten: 35, trust: -40 }); });
      return { mag: 45, text: ctx.t(ctx.pick(['{b}が目を離した隙に、{a}は一人で扉をくぐった。振り返らなかった。', '{a}は{b}の手を振りほどいて、閉まりかけた扉に体を滑り込ませた。', '眠ったふりをしていた{a}は、皆が寝静まるのを待って、扉に手をかけた。']), a, b), why: a.name + 'のドライさ（A高・NP低）と攻撃性。焦り ' + Math.round(a.stress) };
    }
  });

  /* 部屋の基本行動 */
  EV.push({
    id: 'inspect', cat: 'escape', scope: 'solo',
    w: function (ctx, a) { return 0.3 + a.tr.a * 0.9 + (a.goal.id === 'noway' ? 0.6 : 0); },
    run: function (ctx, a) {
      ctx.stress(a, a.tr.a > 0.6 ? -4 : 6);
      return { text: ctx.t(ctx.pick(['{a}は壁を一枚ずつ叩いて回った。どこにも継ぎ目はない。', '{a}は扉の紙を何度も読み返した。抜け道になりそうな言い回しは見つからない。', '{a}は天井の照明を見上げて、何か仕掛けがないか考えていた。', '{a}は床に這いつくばって、扉の下の隙間に指を入れようとした。', '{a}は部屋の歩数を数えた。縦十二歩、横九歩。', '{a}は換気口の格子に耳を当てて、外の音を探した。']), a), why: a.name + 'のA（' + Math.round(a.eg.A) + '）' };
    }
  });
  EV.push({
    id: 'panic', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return a.stress > 45; },
    w: function (ctx, a) { return a.tr.ac * 0.6 + a.tr.impulse * 0.4; },
    run: function (ctx, a) {
      ctx.others(a).forEach(function (o) { ctx.stress(o, 4); });
      return { text: ctx.t(ctx.pick(['{a}が扉を拳で叩いた。返事はない。', '{a}は「出して｜出せ｜出してください」と叫んで、扉にもたれたまま座り込んだ。', '{a}は壁に爪を立てた。白い壁に、薄く線が残った。', '{a}は自分の腕を抱いて、浅い呼吸を繰り返していた。']), a), why: '焦り（' + Math.round(a.stress) + '）と' + a.name + 'の衝動性' };
    }
  });
  EV.push({
    id: 'discuss', cat: 'bond', scope: 'pair',
    w: function (ctx, a) { return 0.4 + a.tr.a * 0.4 + a.tr.honesty * 0.3; },
    run: function (ctx, a, b) {
      if (b.tr.cp > 0.65 && ctx.flags.romantic) {
        ctx.mod2(a, b, { ten: 6, trust: 2 }, { ten: 8 });
        return { text: ctx.t(ctx.pick(['{a}が条件の話を切り出すと、{b}は「ふざけてる｜ふざけている｜ふざけています」と吐き捨てた。', '{b}は紙を指で弾いた。「私はこんなものに従う気はない｜＝｜私はこんなものに従う気はありません」', '「話し合う余地なんてある？｜話し合う余地なんかあるか｜話し合う余地なんてありますか」{b}は{a}の言葉を遮った。']), a, b), why: b.name + 'のCP（' + Math.round(b.eg.CP) + '）：理不尽なルールへの反発' };
      }
      ctx.mod2(a, b, { trust: 7, att: ctx.flags.romantic ? 3 : 0 }, { trust: 7, att: ctx.flags.romantic ? 3 : 0 });
      return { text: ctx.t(ctx.pick(['{a}と{b}は、紙の条件について真面目に話し合った。話すほど、相手の考え方が見えてきた。', '{a}と{b}は、条件の文言を一語ずつ分解して検討した。', '「もし出られなかったら、どうする？｜もし出られなかったら、どうする｜もし出られなかったら、どうしますか」{a}の問いに、{b}は長いこと考えてから答えた。', '{a}は{b}に、どこまでなら平気かを率直に訊いた。{b}も率直に答えた。']), a, b), why: a.name + 'のA（状況を言語化する）' };
    }
  });
  EV.push({
    id: 'consent', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return ctx.flags.romantic && !HK.ngPair(a, b) && R(ctx, a, b).att > 20; },
    w: function (ctx, a) { return a.tr.np * 1.2 + (a.goal.id === 'respect' ? 0.8 : 0); },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { trust: 5 }, { trust: 14, aff: 8, att: 5 });
      ctx.stress(b, -10);
      return { text: ctx.t(ctx.pick(['「嫌なら、私は他の方法を探す。時間はある｜＝｜嫌なら、私は他の方法を探します。時間はあります」{a}は{b}にそう言った。', '{a}は{b}の正面に座って、目線を合わせた。「どっちでもいい。決めるのはあなた｜どちらでもいい。決めるのはあなただ｜どちらでも構いません。決めるのはあなたです」', '{a}は「止めてほしくなったら、肩を叩いて｜止めてほしくなったら、肩を叩け｜止めてほしくなったら、肩を叩いてください」と合図を決めた。', '{a}は{b}が落ち着くまで、何も急かさなかった。']), a, b), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）：相手の意思を先に確かめる' };
    }
  });
  EV.push({
    id: 'push', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return hasPairRule(ctx) && a.stress > 35 && !(HK.ngPair(a, b) && ctx.rules.some(function (r) { return K[r.k].type === 'act' || r.k === 'love'; })); },   /* 恋愛・R18にしない相手に、触れ合う・「好き」の条件を満たそうと詰め寄らない */
    w: function (ctx, a) { return a.tr.lead * 0.6 + (a.goal.id === 'quick' ? 0.8 : 0); },
    run: function (ctx, a, b) {
      if (R(ctx, b, a).att > 35) {
        ctx.mod2(a, b, { att: 5 }, { att: 6, trust: 2 });
        return { cat: 'romance', text: ctx.t(ctx.pick(['{a}が「さっさと済ませよう｜＝｜さっさと済ませましょう」と言った。{b}は反論しなかった。むしろ少し、待っていたような顔をした。', '「いい加減、決めよう｜＝｜いい加減、決めましょう」{a}の言葉に、{b}は小さく頷いた。']), a, b), why: a.name + 'の主導性と、' + b.name + 'の側の惹かれ' };
      }
      ctx.mod2(a, b, { ten: 6 }, { ten: 16, trust: -12, aff: -6 });
      return { text: ctx.t(ctx.pick(['{a}が条件を満たそうと詰め寄った。{b}は壁際まで下がって首を振った。', '「いつまでこうしてる気だ｜いつまでこうしている気だ｜いつまでこうしているつもりですか」{a}の苛立った声に、{b}は耳を塞いだ。', '{a}は{b}の腕を掴みかけて、振り払われた。']), a, b), why: a.name + 'の焦り（' + Math.round(a.stress) + '）。' + b.name + 'はまだその気がない' };
    }
  });
  EV.push({
    id: 'close', cat: 'romance', scope: 'pair',
    when: function (ctx) { return ctx.flags.romantic; },
    w: function (ctx, a, b) { return 0.35 + R(ctx, a, b).att / 70 + a.stress / 150; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { att: 6, trust: 3 }, { att: 6, trust: 3 });
      return { text: ctx.t(ctx.pick(['狭い部屋で、{a}と{b}の肩が触れ合う距離に座っていた。どちらも離れなかった。', '照明が落ちた数分間、{a}は{b}の呼吸の音だけを聞いていた。', '{a}は{b}の横顔を盗み見た。意識しないようにするほど、意識した。', '{a}が身じろぎするたびに、{b}の膝に膝が当たった。', '{b}の髪から、知らないシャンプーの匂いがした。{a}はそれを知ってしまったことを後悔した。', '{a}と{b}は背中合わせに座っていた。背中越しに体温が伝わってくる。']), a, b), why: '逃げ場のない距離。二人の間の相性（化学反応）' };
    }
  });
  EV.push({
    id: 'resign', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return a.stress > 50 && !a.flags.resign && !ctx.flags.isOne && hasPairRule(ctx); },
    w: function (ctx, a) { return 0.6 + a.tr.a * 0.4; },
    run: function (ctx, a) {
      a.flags.resign = true;
      return { text: ctx.t(ctx.pick(['{a}は長いため息をついた。「……わかった。ここで終わるよりはいい｜＝｜……わかりました。ここで終わるよりはいいです」', '{a}は紙を見つめたまま、静かに覚悟を決めた顔になった。', '「もう、いい｜＝｜もう、いいです」{a}は呟いた。何を諦めたのかは言わなかった。']), a), why: '焦りが限界を越えた。' + a.name + 'の覚悟が決まった' };
    }
  });

  HK.SCENARIOS.whiteroom = scen;
  HK.SCEN_ORDER.splice(1, 0, 'whiteroom');
  /* 追加の展開（room-trio.js など）から使う部品 */
  HK.RoomAPI = { K: K, EV: EV, scen: scen, prog: prog, ruleDone: ruleDone, seqWait: seqWait, seqFlush: seqFlush, bumpAct: bumpAct, waitNote: waitNote, pairDone: pairDone, leftText: leftText, eager: eager, willing: willing, desperate: desperate, tieWall: tieWall, names: names, hasPairRule: hasPairRule, finishExit: finishExit, exitPair: exitPair,
    /* 条件を足す側（room-games.js・room-games-r18.js）から使う部品 */
    KLABEL: KLABEL, ITEM: ITEM, ACT_TEXT: ACT_TEXT, addKind: addKind, noteN: noteN, isGlob: isGlob, globLeft: globLeft, globDone: globDone, checkExit: checkExit, exitAll: exitAll, oneDoor: oneDoor, allOut: allOut, bringAlong: bringAlong, lastOf: lastOf, okSex: okSex, exclOther: exclOther, cntTag: cntTag };
})();
