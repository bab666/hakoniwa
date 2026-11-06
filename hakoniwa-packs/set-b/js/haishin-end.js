/* 配信の部屋（set-b-haishin）：目標・結末・後日談・結果欄（両方のビルド。2026-11-06 担当 P3。設計 docs/reports/2026-11-06/haishin-design.md の 8・9 章）
   ■ HK.HaishinEnd（＝ HK.Haishin.end。haishin.js（P1）が読み終えたあとに足す）
     ・init(ctx)：開始時（S.on・S.off・S.top・S.bot が決まったあと）に呼ぶ。二人の短期・長期の目標（S.goal）、親しさの基準（S.rel0E）、目標の数え（S.goalHit）を置き、
       結果の「目標」の欄（c.goal）を書く。住人ごとの欄 sgoal・lgoal（選択肢は T.GOAL_OPT）を選んだ人は必ずその種
     ・goalOpts(kind)：perFields の選択肢（{ id, label, group }。kind 's'|'l'）
     ・decide(ctx)：結末の鍵（S.endK：big・slow・small・quit・ban・wed・maboroshi）を決める（設計 9.1。何度呼んでも同じ）
     ・epilogue(ctx)：後日談（必ず出す。kind:'phase'、e.tag='後日談'）を記録に足す。最後の区切りのあと（scen.end か最後の区切り）で一度だけ呼ぶ。結末のあとに出来事を続けない
     ・finish(ctx)：scen.finish から呼ぶ。結末・目標の判定・称号・登録者の増減を ctx.flags.haishin に写し、住人ごとの「その後」（c.fate・c.fateNote）と ctx.flags.outcome を書く。
       後日談がまだなら、ここで出す（予備）
     ・titles(S)・subs(ctx)・goalJudge(ctx)・chart(series)：称号（12。上から 3 つまで）・登録者の増減・目標の判定（S.goalRes）・推移のグラフ（SVG の文字列）
   ■ 読む状態（ctx.hs＝S。無い欄は 0・空として読む）：kind・form・size・sc・N（区切りの数）・on・off・top・bot・v・v0・vPeak・scSum・scMax・stage・cap・stall・mid・
     leak・leakFate・sexDone・ended・beh{serve,shy,jeal,sunao,odd}・kiss・series[{t,v,sc,sum,st}]・asleep・used・cookFail・gameWin・sleepFirst・wedCm（haishin-cm.js が数える）
   ■ 結果欄 HK.Endings['set-b-haishin']：headline・stats・lines・after（同接とスパチャ累計の推移。HK.Chart.line があれば使い、無ければ書き下しの SVG） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var ID = 'set-b-haishin';
  var SIZE_N = { s10: 10, s100: 100, s1k: 1000, s10k: 10000 };
  var KIND_NAME = { zatsu: '雑談', cook: '料理', game: 'ゲーム', neochi: '寝落ち' };
  var SIZE_NAME = { s10: '10人くらい', s100: '100人くらい', s1k: '1,000人くらい', s10k: '1万人くらい' };
  var SC_NAME = { few: '少なめ', mid: 'ふつう', whale: '太客がいる' };
  var SC_LINE = { few: 3000, mid: 30000, whale: 200000 };
  var END_NAME = { big: '人気配信者への道（大ブレイク）', slow: '人気配信者への道（じわじわ伸びる）', small: '常連の小さな箱', quit: '配信をやめて二人だけに', ban: 'アカウント停止で笑い話', wed: 'リスナーの前で結婚報告', maboroshi: '幻の配信（途中終了）' };
  var STAGE_NAME = ['', '一般', '質問', 'ちょっと踏み込んだ質問', '踏み込んだ要求', '', ''];
/* r18:begin */
  STAGE_NAME[5] = 'すごく踏み込んだ要求'; STAGE_NAME[6] = 'エロい要求';
/* r18:end */
  var RES_NAME = { ok: '叶った', ng: '叶わなかった', near: '近づいた', same: '変わらない', far: '遠のいた' };
  var MID_SEEN = { notice: 1, come: 1, punish: 1 };

  function TX() { return HK.HaishinText || {}; }
  function CMT() { return HK.HaishinCm || {}; }
  function CM() { return HK.HaishinCmKit || (HK.Haishin && HK.Haishin.cm) || null; }
  function st(ctx) { return (HK.Haishin && HK.Haishin.st ? HK.Haishin.st(ctx) : null) || (ctx && ctx.hs) || null; }
  function rnd(ctx) { return ctx && ctx.rng ? ctx.rng() : Math.random(); }
  function pickOf(ctx, a) { return a && a.length ? a[Math.floor(rnd(ctx) * a.length)] : null; }
  function arr(x) { return Array.isArray(x) ? x : x == null ? [] : [x]; }
  function num(x) { return +x || 0; }
  function onList(S) { return arr(S && S.on).filter(Boolean); }
  function solo(S) { return S && (S.form === 'solo' || onList(S).length < 2); }
  function pair(S) { var on = onList(S), a = on[0] || null, b = on[1] || S.off || null; return [a, b]; }
  function sizeN(S) { return SIZE_N[S && S.size] || 100; }
  function per(c) { return HK.PairReact && HK.PairReact.per ? HK.PairReact.per(c) : 'gentle'; }
  function comma(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function yenStr(n) { return '¥' + comma(n); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function married(ctx, S) { var K = CM(); if (K && K.married) return K.married(ctx, S); return S && (S.married || S.rk === 'spouse'); }
  function beh(S, k) { return num(S && S.beh && S.beh[k]); }
  function spread(S) { return !!(S && S.leak && S.leakFate === 'spread'); }
  /* 切り忘れを誰も保存していなかった回（T.LEAKNEWS.none）：そのあとの評判・投稿・SNS に「切り抜き」「アーカイブ」の文を続けない（切り抜きが広まるのは spread の回だけ。C.SNS.spread も同じ） */
  function noClip(S) { return !!(S && S.leak && S.leakFate === 'none'); }
  function clipOk(S, f) { var nc = noClip(S); return function (x) { var t = typeof x === 'string' ? x : x && x.t; return (!f || f(x)) && !(nc && /切り抜き|アーカイブ/.test(t || '')); }; }
  /* 文を埋める（{a}{b} は本体の ctx.t、台詞の目印は HK.PairKit.fill。{ch}・{peak} などの数は ex で） */
  function fill(ctx, t, a, b, ex) {
    if (!t) return '';
    var S = st(ctx), K = CM();
    ex = ex || {};
    if (ex.ch == null) ex.ch = K && K.chName ? K.chName(ctx) : (a ? a.name : '');
    if (ex.peak == null) ex.peak = comma(S && S.vPeak);
    Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return HK.PairKit && HK.PairKit.fill ? HK.PairKit.fill(ctx, t, a, b) : ctx.t(t, a, b);
  }
  /* 住人の文は一回の遊びで一度（S.used。使い切ったら使った文から） */
  function pickT(ctx, list, filt) {
    var S = st(ctx), U = S.used = S.used || {}, p = arr(list).filter(function (x) { var t = typeof x === 'string' ? x : x && x.t; return t && (!filt || filt(x)); });
    if (!p.length) return '';
    var q = p.filter(function (x) { return !U[typeof x === 'string' ? x : x.t]; }), x = pickOf(ctx, q.length ? q : p), t = typeof x === 'string' ? x : x.t;
    U[t] = 1;
    return t;
  }
  function formOk(S) { return function (x) { return typeof x === 'string' || !x.form || x.form === (solo(S) ? 'solo' : 'couple'); }; }

  /* ---------- 目標（設計 8 章） ---------- */
  function goalOpts(kind) { var T = TX(), G = T.GOAL_GRP || {}; return ((T.GOAL_OPT || {})[kind] || []).map(function (o) { return { id: o[1], label: o[2], group: G[o[0]] || '' }; }); }
  function optOf(kind, k) { return ((TX().GOAL_OPT || {})[kind] || []).filter(function (o) { return o[1] === k; })[0] || null; }
  /* その配信の設定で成り立つ種か（合わない種はおまかせとして扱う） */
  function seedOk(S, k, side) {
    switch (k) {
      case 'cook': return S.kind === 'cook';
      case 'clear': return S.kind === 'game';
      case 'awake': return S.kind === 'neochi';
      case 'boast': case 'tease': return !solo(S) && side === 'on';
      case 'aitai': return solo(S) && side === 'off';
      case 'viewers': case 'money': case 'kind': return side === 'on';
      default: return true;
    }
  }
  function userPick(ctx, c, kind) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i], v = p && p.pick ? p.pick[kind === 's' ? 'sgoal' : 'lgoal'] : ''; return v && optOf(kind, v) ? v : ''; }
  function goalOf(ctx, S, c, side, kind) {
    var T = TX(), base = ((kind === 's' ? T.GOAL_S : T.GOAL_L) || {})[side] || {}, all = [], rel = [];
    Object.keys(base).forEach(function (k) { all = all.concat(base[k] || []); });
    if (kind === 's') { var R = (T.GOAL_SR || {})[side] || {}; [solo(S) ? 'solo' : 'couple', S.kind].forEach(function (k) { rel = rel.concat(R[k] || []); }); }
    else rel = ((T.GOAL_LR || {})[married(ctx, S) ? 'spouse' : 'lover']) || [];
    var ok = function (g) { return g && seedOk(S, g.k, side); };
    var want = userPick(ctx, c, kind);
    if (want && seedOk(S, want, side)) {
      var pool = (base[per(c)] || []).concat(rel).filter(function (g) { return g.k === want; });
      if (!pool.length) pool = all.concat(rel).filter(function (g) { return g.k === want; });
      var g0 = pickOf(ctx, pool) || { t: (optOf(kind, want) || [])[2] || '', k: want };
      return { t: g0.t.replace(/（[^）]*）$/, ''), k: want, user: true };
    }
    var own = (base[per(c)] || []).filter(ok), rl = rel.filter(ok);
    var list = rl.length && (rnd(ctx) < 0.45 || !own.length) ? rl : own;
    if (!list.length) list = all.filter(ok);
    var g = pickOf(ctx, list);
    return g ? { t: g.t, k: g.k } : null;
  }
  function goalLabel(c, G, res) {
    if (!G) return;
    var r = res || {};
    c.goal = { id: 'hs', label: '短期「' + (G.s ? G.s.t : '') + '」' + (G.s && G.s.user ? '（選んだ目標）' : '') + (r.s ? '（' + RES_NAME[r.s] + '）' : '') +
      '／長期「' + (G.l ? G.l.t : '') + '」' + (G.l && G.l.user ? '（選んだ目標）' : '') + (r.l ? '（' + RES_NAME[r.l] + '）' : '') };
  }
  function relSum(ctx, a, b) { var r = ctx.rel && ctx.rel[a.i] && ctx.rel[a.i][b.i]; return r ? num(r.aff) : 0; }
  function init(ctx) {
    var S = st(ctx); if (!S || S.goal) return;
    var p = pair(S), a = p[0], b = p[1];
    S.goal = {}; S.goalHit = S.goalHit || {}; S.rel0E = {};
    if (!a) return;
    [a, b].forEach(function (c) {
      if (!c) return;
      var side = solo(S) && c === S.off ? 'off' : 'on';
      S.goal[c.i] = { side: side, s: goalOf(ctx, S, c, side, 's'), l: goalOf(ctx, S, c, side, 'l') };
      goalLabel(c, S.goal[c.i]);
    });
    if (a && b) { S.rel0E[a.i] = relSum(ctx, a, b); S.rel0E[b.i] = relSum(ctx, b, a); }
  }
  /* 親しさの伸び（二人の好意の始まりからの増え方の平均） */
  function affUp(ctx, S) {
    var p = pair(S), a = p[0], b = p[1];
    if (!a || !b || !S.rel0E || S.rel0E[a.i] == null) return 0;
    return ((relSum(ctx, a, b) - S.rel0E[a.i]) + (relSum(ctx, b, a) - S.rel0E[b.i])) / 2;
  }
  function shortOk(ctx, S, k, c) {
    var v0 = Math.max(1, num(S.v0)), Vp = num(S.vPeak) || v0;
    switch (k) {
      case 'viewers': return Vp >= v0 * 1.5;
      case 'money': return num(S.scSum) >= (SC_LINE[S.sc] || 30000);
      case 'kiss': return num(S.kiss) > 0;
      case 'safe': return num(S.stage) < 5 && !S.sexDone && !S.leak;
      case 'boast': return !solo(S) && num(S.stage) >= 3 && S.ended !== 'stall';
      case 'kind': return S.ended !== 'stall' && beh(S, 'jeal') < 2;
      /* 最後まで＝予定の時間どおりに閉じた回だけ（切ってから・切り忘れで早く終わった回は未達） */
      case 'last': return S.ended === 'time';
      case 'cook': return S.kind === 'cook' && !S.cookFail;
      case 'clear': return S.kind === 'game' && !!(S.gameWin || S.gameRes === 'win');
      case 'awake': return S.kind === 'neochi' && S.sleepFirst !== c && !(S.sleepFirst && S.sleepFirst.i === c.i);
      case 'tease': return beh(S, 'shy') >= 2;
      case 'aitai': return !!MID_SEEN[S.mid] || !!S.offCame;
      default: return false;
    }
  }
  function longRes(ctx, S, k) {
    var d = affUp(ctx, S), e = S.endK, base = d >= 15 ? 'near' : d < 0 ? 'far' : 'same';
    switch (k) {
      case 'pop': return e === 'big' || e === 'slow' ? 'near' : e === 'ban' || e === 'maboroshi' || e === 'quit' ? 'far' : 'same';
      case 'public': return e === 'wed' || (!solo(S) && num(S.stage) >= 3) ? 'near' : e === 'ban' ? 'far' : 'same';
      case 'wed': return e === 'wed' ? 'near' : base === 'near' ? 'same' : base;
      case 'quit': return e === 'quit' ? 'near' : e === 'big' ? 'far' : 'same';
      case 'sunao': return beh(S, 'sunao') > 0 ? 'near' : base;
      case 'hitori': return beh(S, 'jeal') > 0 || e === 'quit' ? 'near' : e === 'big' ? 'far' : base;
      case 'kinen': return e === 'wed' ? 'near' : e === 'maboroshi' || e === 'ban' ? 'far' : base === 'far' ? 'same' : base;
      default: return base;
    }
  }
  function goalJudge(ctx) {
    var S = st(ctx); if (!S) return {};
    init(ctx); decide(ctx);
    if (S.goalRes) return S.goalRes;
    var R = S.goalRes = {};
    pair(S).forEach(function (c) {
      var G = c && S.goal[c.i]; if (!G) return;
      R[c.i] = { s: G.s ? (shortOk(ctx, S, G.s.k, c) ? 'ok' : 'ng') : '', l: G.l ? longRes(ctx, S, G.l.k) : '' };
    });
    return R;
  }
  function shortHits(ctx, S) {
    /* 結末の点に使う短期の達成の数（結末を決める前に数えるので、結末に頼らない短期だけ） */
    var n = 0;
    pair(S).forEach(function (c) { var G = c && S.goal && S.goal[c.i]; if (G && G.s && shortOk(ctx, S, G.s.k, c)) n++; });
    return n;
  }

  /* ---------- 結末の決め方（設計 9.1） ---------- */
  function decide(ctx) {
    var S = st(ctx); if (!S) return '';
    if (S.endK) return S.endK;
    init(ctx);
    var k;
    if (S.ended === 'stall') k = 'maboroshi';
    else if (S.leak && S.leakFate === 'ban') k = 'ban';
    else {
      var v0 = Math.max(1, num(S.v0)), Vp = Math.max(v0, num(S.vPeak)), lg = function (x) { return Math.log(x) / Math.LN10; };
      var gl = function (key) { return pair(S).some(function (c) { var G = c && S.goal && S.goal[c.i]; return G && G.l && G.l.k === key; }); };
      var pop = 30 * lg(Vp / v0) + 10 * lg(1 + num(S.scSum) / 1000) + shortHits(ctx, S) * 10 + (spread(S) ? 15 : 0);
      /* 係数は 2026-11-06 P15b の計測（500 回）で直した：長期目標「結婚の報告」はおまかせで選ばれやすく、+40 だと目標だけで結婚報告が半分を占めた。
         目標の重みを下げ、配信の中で実際にあったこと（キス・親しさ・お祝いのコメント・嫉妬・素に戻る）の重みを上げる。
         嫉妬・素に戻るは 3 回までで数える（12・24 時間の配信で回数が積み上がり、やめて二人だけにばかりになったため） */
      var quit = Math.min(3, beh(S, 'jeal')) * 15 + Math.min(3, beh(S, 'sunao')) * 8 + (gl('quit') ? 40 : 0) + (spread(S) ? 10 : 0);
      var wed = (affUp(ctx, S) >= 15 ? 14 : 0) + (gl('wed') ? 24 : 0) + num(S.kiss) * 7 + num(S.wedCm) * 4;
      S.endScore = { pop: Math.round(pop), quit: Math.round(quit), wed: Math.round(wed) };
      /* 同点は wed → pop → quit の順（0 点どうしは続ける） */
      k = wed > 0 && wed >= pop && wed >= quit ? 'wed' : quit > pop && quit > 0 ? 'quit' : 'pop';
      /* 常連の小さな箱は、同接が千人に届かない配信だけ（規模 1 万で同接 7 千人の配信に「少人数だからこそ」の文が出ないように。2026-11-06 P15b） */
      if (k === 'pop') { var n = sizeN(S); k = Vp >= n * 5 || Vp >= 10000 ? 'big' : Vp >= n * 1.5 || Vp >= 1000 ? 'slow' : 'small'; }
    }
    S.endK = k;
    S.subs = subsOf(ctx, S, k);
    return k;
  }
  function subsOf(ctx, S, k) {
    var n = sizeN(S), Vp = Math.max(num(S.vPeak), num(S.v0), 1), r = function (lo, hi) { return lo + rnd(ctx) * (hi - lo); }, d;
    switch (k) {
      case 'ban': return null;
      case 'big': d = Math.max(n * r(2, 5), Vp * 0.5); break;
      case 'slow': d = Vp * r(0.3, 0.6) + 1; break;
      case 'small': d = Math.max(1, Vp * r(0.05, 0.15)); break;
      case 'quit': d = Vp * 0.2 + 1; break;
      case 'wed': d = Vp * r(0.5, 1) + 1; break;
      default: d = Math.max(1, num(S.v0)) * r(-0.05, 0.05); break;
    }
    if (spread(S) && k !== 'maboroshi') d += n * r(1, 3);
    return Math.round(d);
  }
  function subs(ctx) { var S = st(ctx); decide(ctx); return S ? S.subs : null; }

  /* ---------- 称号（設計 9.4。条件の上から 3 つまで） ---------- */
  function titles(S, endK) {
    var V = num(S.vPeak), Y = num(S.scSum), n = sizeN(S), k = endK || S.endK, out = [];
    var T = [
      ['伝説の配信', V >= 10000 && Y >= 1000000],
      ['放送事故の伝説', !!S.leak && (S.leakFate === 'spread' || S.leakFate === 'ban')],
      ['幻の配信', S.ended === 'stall' || (!!S.leak && S.leakFate === 'none')],
      ['神回', V >= n * 5 || (V >= 1000 && Y >= 100000)],
      ['無銭の神回', V >= 1000 && Y < 5000],
      ['公開プロポーズ', k === 'wed'],
      ['太客の夜', S.sc === 'whale' && num(S.scMax) >= 50000],
      ['身内の宴', V < 50 && Y >= 30000],
      ['嫉妬の配信', beh(S, 'jeal') >= 3],
      ['耐久の英雄', num(S.N) >= 24 && S.ended === 'time'],
      ['寝落ちの守り人', S.kind === 'neochi' && num(S.asleep) >= 4 && num((arr(S.series).slice(-1)[0] || {}).v || S.v) >= num(S.v0) / 2],
      ['静かな良配信', V < 100 && num(S.stage) < 4 && S.ended !== 'stall']
    ];
    T.forEach(function (x) { if (x[1] && out.length < 3) out.push(x[0]); });
    return out;
  }

  /* ---------- 後日談（設計 9.2。必ず出す。結末のあとに出来事を続けない） ---------- */
  function endList(ctx, S, k) {
    var E = (TX().END || {})[k];
    if (E && !Array.isArray(E)) E = E[married(ctx, S) ? 'spouse' : 'lover'] || E.lover || [];
    return E || [];
  }
  function snsLines(ctx, S, k, A) {
    var C0 = CMT().SNS || {}, K = CM(), n = 3 + Math.floor(rnd(ctx) * 3), U = S.cmUsed = S.cmUsed || {}, used = {}, out = [];
    var src = [[C0[k] || [], n]];
    if (spread(S) && C0.spread) src.unshift([C0.spread, 2]);
    if (S.leak && S.leakFate === 'none' && k !== 'maboroshi' && C0.maboroshi) src.unshift([C0.maboroshi, 1]);
    src.forEach(function (s) {
      var nc = noClip(S), pool = s[0].filter(function (it) { var t = typeof it === 'string' ? it : it && it.t; return t && !U[t] && !(nc && /切り抜き|アーカイブ/.test(t)) && (!K || !K.okFor || K.okFor(ctx, it, A)); });
      for (var i = 0; i < s[1] && pool.length && out.length < n; i++) {
        var it = pool.splice(Math.floor(rnd(ctx) * pool.length), 1)[0], t = typeof it === 'string' ? it : it.t;
        U[t] = (U[t] || 0) + 1;
        var h = K && K.handle ? K.handle(ctx, used) : '名無しのリスナー';
        for (var hi = 0; nc && hi < 4 && K && K.handle && /切り抜き|アーカイブ/.test(h); hi++) h = K.handle(ctx, used);
        if (nc && /切り抜き|アーカイブ/.test(h)) h = '名無しのリスナー';
        out.push(h + '：' + (K && K.fill ? K.fill(ctx, t, A) : t));
      }
    });
    return out;
  }
  function epilogue(ctx) {
    var S = st(ctx); if (!S || S.epiDone) return;
    var p = pair(S), A = p[0], B = p[1];
    if (!A) return;
    S.epiDone = true;
    var k = decide(ctx), T = TX(), why = '配信の部屋：後日談（' + END_NAME[k] + '）';
    goalJudge(ctx);
    var sub = S.subs, ex = { subs: comma(Math.abs(sub || 0)), pm: (sub > 0 ? '+' : sub < 0 ? '−' : '±') + comma(Math.abs(sub || 0)) };
    /* 1. 評判（切り忘れはここで初めて知る）・予定より早く終わった・登録者の増減 */
    /* @event scen=set-b-haishin id=hs_end_big cat=phase tie=- label=後日談：配信が大ブレイクする */
    /* @event scen=set-b-haishin id=hs_end_slow cat=phase tie=- label=後日談：登録者がじわじわ伸びる */
    /* @event scen=set-b-haishin id=hs_end_small cat=phase tie=- label=後日談：常連の集まる小さな配信 */
    /* @event scen=set-b-haishin id=hs_end_quit cat=phase tie=- label=後日談：配信をやめて二人だけに */
    /* @event scen=set-b-haishin id=hs_end_wed cat=phase tie=- label=後日談：リスナーの前で結婚報告 */
    /* @event scen=set-b-haishin id=hs_end_maboroshi cat=phase tie=- label=後日談：途中で終わった幻の配信 */
    var t1 = '';
    if (S.leak && (S.leakFate === 'spread' || S.leakFate === 'none')) t1 += fill(ctx, pickT(ctx, (T.LEAKNEWS || {})[S.leakFate]), A, B, ex);
    t1 += fill(ctx, pickT(ctx, endList(ctx, S, k), clipOk(S, formOk(S))), A, B, ex);
    if (S.ended === 'cut') t1 += fill(ctx, pickT(ctx, T.EARLY), A, B, ex);
    t1 += fill(ctx, pickT(ctx, (T.SUBS || {})[k]), A, B, ex);
    if (!t1) t1 = fill(ctx, '配信から数日が経った。{a}と{b}は、あの夜のことを思い出しては、ときどき笑い合った。', A, B, ex);
    var e1 = ctx.say({ kind: 'phase', cat: 'phase', actors: B ? [A, B] : [A], text: t1, why: why, mag: 0 });
    if (e1) e1.tag = '後日談';
    /* 2. 視聴者の SNS（3〜5 本。コメントタブには入れない） */
    var sl = snsLines(ctx, S, k, A);
    if (sl.length) { var e2 = ctx.say({ kind: 'phase', cat: 'phase', actors: [], text: 'SNSには、あの配信の話がいくつも流れていた。\n' + sl.join('\n'), why: '配信の部屋：後日談（SNS の反応）', mag: 0, lewd: false }); if (e2) e2.tag = '後日談'; }
    /* 3. 二人自身の投稿・二人の一言・目標の一文（物語の文で 1〜2 文。目標をかぎかっこで並べない） */
    var sp = !solo(S) && B && rnd(ctx) < 0.5 ? B : A, ot = sp === A ? B : A;
    var t3 = fill(ctx, pickT(ctx, (T.POST || {})[k], clipOk(S)), A, B, ex);
    t3 += fill(ctx, pickT(ctx, ((T.LAST || {})[k] || {})[per(sp)] || ((T.LAST || {})[k] || {}).gentle), sp, ot, ex);
    t3 += goalStory(ctx, S);
    if (t3) { var e3 = ctx.say({ kind: 'phase', cat: 'phase', actors: B ? [A, B] : [A], text: t3, why: '配信の部屋：後日談（二人の一言）', mag: 0 }); if (e3) e3.tag = '後日談'; }
  }
/* r18:begin */
  /* @event scen=set-b-haishin id=hs_end_ban cat=phase tie=- tags=night label=後日談：アカウント停止で笑い話 */
/* r18:end */
  function goalStory(ctx, S) {
    var R = S.goalRes || {}, T = TX(), J = T.GOAL_JUDGE || {}, out = '', p = pair(S);
    /* 短期は叶ったかの分かりやすい一人（配信する人を先に）、長期は動いた（近づいた・遠のいた）一人だけ */
    var sh = p.filter(function (c) { return c && R[c.i] && R[c.i].s && S.goal[c.i].s; })[0];
    if (sh) {
      var o = sh === p[0] ? p[1] : p[0], g = S.goal[sh.i].s, r = R[sh.i].s;
      var t = pickT(ctx, (J[g.k] || {})[r]) || pickT(ctx, ((T.GOAL_RES || {})[r] || {})[per(sh)]);
      if (t) out += fill(ctx, t, sh, o);
    }
    var lg = p.filter(function (c) { return c && R[c.i] && (R[c.i].l === 'near' || R[c.i].l === 'far') && S.goal[c.i].l; })[0];
    if (lg) {
      var o2 = lg === p[0] ? p[1] : p[0], g2 = S.goal[lg.i].l, r2 = R[lg.i].l;
      var t2 = pickT(ctx, (J[g2.k] || {})[r2]) || pickT(ctx, (T.GOAL_LRES || {})[r2]);
      if (t2) out += fill(ctx, t2, lg, o2);
    }
    return out;
  }

  /* ---------- finish（scen.finish から） ---------- */
  function finish(ctx) {
    var S = st(ctx); if (!S) return;
    var p = pair(S), A = p[0], B = p[1];
    if (!A) return;
    init(ctx);
    var k = decide(ctx), R = goalJudge(ctx);
    if (!S.epiDone) epilogue(ctx);
    var w = married(ctx, S), tl = titles(S, k), F = ctx.flags.haishin = ctx.flags.haishin || {};
    var series = arr(S.series).map(function (x) { return { t: x.t || '', v: Math.round(num(x.v)), sum: Math.round(num(x.sum)), st: num(x.st) }; });
    var g = function (c) { var G = c && S.goal[c.i], r = c && R[c.i] || {}; return G ? { s: G.s ? G.s.t : '', l: G.l ? G.l.t : '', rs: r.s ? RES_NAME[r.s] : '', rl: r.l ? RES_NAME[r.l] : '', side: G.side } : null; };
    var hrs = series.length ? series.length / 2 : num(S.N) / 2;
    Object.assign(F, {
      a: A.i, b: B ? B.i : null, form: solo(S) ? 'solo' : 'couple', on: onList(S).map(function (c) { return c.i; }), off: S.off ? S.off.i : null,
      kind: S.kind, size: S.size, sc: S.sc, hours: num(S.N) / 2, hoursReal: hrs, married: !!w,
      v0: Math.round(num(S.v0)), vPeak: Math.round(num(S.vPeak)), scSum: Math.round(num(S.scSum)), scMax: Math.round(num(S.scMax)), stage: num(S.stage) || 1,
      subs: S.subs, endK: k, end: endName(k, w), titles: tl, series: series, leak: S.leak || null, leakFate: S.leakFate || null, ended: S.ended || null,
      kiss: num(S.kiss), jeal: beh(S, 'jeal'), sunao: beh(S, 'sunao'), sex: (S.sexDone ? 1 : 0) + (S.again ? 1 : 0), score: S.endScore || null,
      ch: CM() && CM().chName ? CM().chName(ctx) : '', goals: [g(A), g(B)]
    });
    /* 住人ごとの「その後」 */
    var FT = (TX().FATE || {})[k] || [];
    [A, B].forEach(function (c, i) {
      if (!c) return;
      var o = i ? A : B;
      c.fate = k === 'wed' ? (w ? '改めて夫婦の報告をした' : '結婚を報告した') : (w ? '夫婦のまま' : '恋人のまま');
      var t = FT.length ? FT[(i + Math.floor(rnd(ctx) * FT.length)) % FT.length] : '';
      c.fateNote = (solo(S) ? (c === S.off ? '画面の外から配信を見守った。' : '一人で配信した。') : '二人で配信した。') + (t ? t.split('{b}').join(o ? o.name : '') : '');
      goalLabel(c, S.goal[c.i], R[c.i]);
    });
    ctx.flags.outcome = (F.ch ? '『' + F.ch + '』の' : '') + (KIND_NAME[S.kind] || '') + '配信――' + endName(k, w) + (tl[0] ? '（' + tl[0] + '）' : '');
  }
  function endName(k, w) { return k === 'wed' && w ? 'リスナーの前で改めての報告' : END_NAME[k] || ''; }

  /* ---------- 推移のグラフ（HK.Chart.line、無ければ書き下しの SVG。色は CSS の変数） ---------- */
  function nice(m) { if (m <= 0) return 1; var e = Math.pow(10, Math.floor(Math.log(m) / Math.LN10)), f = m / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; }
  function short(n) { return n >= 10000 ? (Math.round(n / 1000) / 10) + '万' : comma(n); }
  function chart(series) {
    var Sr = arr(series);
    if (Sr.length < 2) return '';
    var labels = Sr.map(function (x) { return x.t; }), V = Sr.map(function (x) { return num(x.v); }), Y = Sr.map(function (x) { return num(x.sum); });
    var aria = '同接とスパチャ累計の推移（最高同接 ' + comma(Math.max.apply(null, V)) + '人・スパチャ累計 ' + yenStr(Y[Y.length - 1]) + '）';
    if (HK.Chart && HK.Chart.line) {
      try {
        var h = HK.Chart.line([{ name: '同接', values: V, axis: 'left', unit: '人' }, { name: 'スパチャ累計', values: Y, axis: 'right', unit: '円' }], { left: '同接', right: 'スパチャ累計', labels: labels, aria: aria });
        if (typeof h === 'string' && h) return h;
      } catch (e) { /* 書き下しに落とす */ }
    }
    var W = 640, H = 180, pl = 42, pr = 56, pt = 10, pb = 24, iw = W - pl - pr, ih = H - pt - pb, n = Sr.length - 1;
    var mV = nice(Math.max.apply(null, V)), mY = nice(Math.max.apply(null, Y));
    var x = function (i) { return pl + iw * i / n; }, yv = function (v) { return pt + ih * (1 - Math.min(1, v / mV)); }, yy = function (v) { return pt + ih * (1 - Math.min(1, v / mY)); };
    var path = function (a, f) { return a.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + f(v).toFixed(1); }).join(''); };
    var NS = ' vector-effect="non-scaling-stroke"';
    var grid = [0, 0.5, 1].map(function (r) {
      var gy = (pt + ih * (1 - r)).toFixed(1);
      return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + gy + '" y2="' + gy + '" stroke="var(--line)" stroke-width="1"' + NS + '/>' +
        '<text x="' + (pl - 6) + '" y="' + (+gy + 4) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + esc(short(mV * r)) + '</text>' +
        '<text x="' + (W - pr + 6) + '" y="' + (+gy + 4) + '" text-anchor="start" font-size="10" fill="var(--muted)">' + esc(r ? '¥' + short(mY * r) : '0') + '</text>';
    }).join('');
    var ticks = [0, Math.round(n / 2), n].filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (i) {
      return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? 'start' : i === n ? 'end' : 'middle') + '" font-size="10" fill="var(--muted)">' + esc(labels[i]) + '</text>';
    }).join('');
    return '<figure class="dggauge hsgauge"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(aria) + '">' + grid + ticks +
      '<path d="' + path(Y, yy) + '" fill="none" stroke="var(--love)" stroke-width="2" stroke-dasharray="5 3"' + NS + '/>' +
      '<path d="' + path(V, yv) + '" fill="none" stroke="var(--accent)" stroke-width="2.4"' + NS + '/></svg>' +
      '<figcaption class="legend"><span><i style="background:var(--accent)"></i>同接（左の目盛り・人）</span><span><i style="background:var(--love)"></i>スパチャ累計（右の目盛り・点線）</span></figcaption></figure>';
  }

  /* ---------- 結果欄（設計 9.3） ---------- */
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.haishin, lines = [];
    if (!R || !R.endK) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = R.b != null ? X.nm(R.b) : '', tl = R.titles || [];
    lines.push((R.ch ? '『' + R.ch + '』の' : '') + (KIND_NAME[R.kind] || '') + '配信（' + (R.form === 'solo' ? a + 'のソロ配信' + (b ? '・画面の外に' + b : '') : a + 'と' + b + 'のカップル配信') + '・' + (R.married ? '夫婦' : '恋人') + '）');
    lines.push('リスナーの規模：' + (SIZE_NAME[R.size] || '') + '／スパチャ：' + (SC_NAME[R.sc] || '') + '／配信時間：' + R.hours + '時間' + (R.hoursReal && R.hoursReal !== R.hours ? '（実際は' + R.hoursReal + '時間）' : ''));
    var ev = [];
    if (R.kiss) ev.push('キス ' + R.kiss + '回');
    if (R.jeal) ev.push('嫉妬 ' + R.jeal + '回');
    if (R.sunao) ev.push('素に戻った ' + R.sunao + '回');
    if (!HK.SAFE_ON && R.sex) ev.push('エッチ ' + R.sex + '回' + (R.leak ? '（切り忘れ）' : ''));
    if (ev.length) lines.push(ev.join('／'));
    (R.goals || []).forEach(function (g, i) { if (g && (g.s || g.l)) lines.push((i ? b : a) + 'の目標：短期「' + g.s + '」' + (g.rs ? '（' + g.rs + '）' : '') + '／長期「' + g.l + '」' + (g.rl ? '（' + g.rl + '）' : '')); });
    lines.push('結末：' + R.end + (tl.length ? '　称号：' + tl.join('・') : ''));
    X.C.forEach(function (c) { c.afterDone = true; });
    var subsT = R.subs == null ? 'アカウントごと消えた' : (R.subs > 0 ? '+' : R.subs < 0 ? '−' : '±') + comma(Math.abs(R.subs)) + '人';
    var stats = [['最高同接', comma(R.vPeak) + '人'], ['スパチャ累計', yenStr(R.scSum)], ['一回の最大額', yenStr(R.scMax)], ['登録者の増減', subsT],
      ['配信時間', (R.hoursReal || R.hours) + '時間'], ['要求の段', (STAGE_NAME[R.stage] || STAGE_NAME[1]) + '（段' + R.stage + '）'], ['称号', tl.length ? tl.join('・') : 'なし']];
    var after = '';
    try { after = chart(R.series); } catch (e) { after = ''; }
    return { headline: (tl[0] ? tl[0] + ' ― ' : '') + R.end + '。', stats: stats, lines: lines, after: after };
  };

  var E = HK.HaishinEnd = { init: init, goalOpts: goalOpts, decide: decide, epilogue: epilogue, finish: finish, titles: titles, subs: subs, goalJudge: goalJudge, chart: chart, endName: endName, END_NAME: END_NAME, STAGE_NAME: STAGE_NAME };
  HK.Haishin = HK.Haishin || {};
  HK.Haishin.end = E;
})();
