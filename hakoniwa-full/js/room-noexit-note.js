/* 箱庭シミュレーター: 出られない部屋 ― 「この状況では脱出できません」の事前の表示（両ビルド共通。2026-10-28 担当LM）
   利用者の指示「出られない部屋（媚薬とエッチ）で、この条件だと絶対に出られない、と分かりきっているときには、環境値に……できないと赤字で示してほしい」への対応。
   ■ HK.RoomNoExit.judge(ctx)：準備（scen.setup）が済んだ部屋で、扉の条件を誰も満たせないと「確実に」言えるかを調べる。
     返り値は null（満たせる見込みがある・確実には言えない）か { n: 部屋にいる人数, items: [{ lead, rows: [{ a, b, who, t, fix }], more, notes }] }。
     偽陽性を出さない（迷ったら出さない）。見るのは次の三つだけ：
       1. 二人で数える条件（行為・言葉・傷つける・三人で）があるのに、部屋にいるのが一人
       2. 条件「エッチ」：部屋にいるどの二人も体の関係を持てない（HK.Pos.okSex と性欲 HK.Pos.libOK。内容のスイッチ「合意のない展開」が入なら
          HK.Pos.forceOpen の中で見る＝性欲「なし」・恋愛対象「なし」でも止めない）。部屋の中でエッチを数える出来事（scenario-room.js の act・group_h・
          speedrun・媚薬の熱、room-tie-r18*.js、hate-sex-room-r18.js、solo-room-jealous.js、room-games.js と room-trio.js の三人の場面）は、
          どれもこの判定（か、より厳しい判定）を通る組でしか起きない。三人の場面の「直接は触れ合わない組」は数えられることがあるが、持てる組が二つ要るので、
          持てる組が一つもなければ起きない。恋愛にしない関係（HK.roomWsNoSex）は見ない（合意のない展開の出来事が見ないため。見逃すほうに倒す）
       3. 条件「誰かを殺す（全年齢では気絶させる）」：人数が、部屋にいる人数−1（二人で数える条件もあれば −2）を超える（扉をくぐる人が残らない）
     見ないもの（起きにくいだけ・ほかの出来事の中で数えられることがある）：キス・ハグ・手を繋ぐ・膝枕（体の関係を持てない組でも、焦りで満たせる）、
     「好き」と言い合う（恋愛にならない組でも、会話の中の「好き」を数える）、本音・いいところ・飲む・お題・傷つける・一人しか出られない、
     三人で（成り立つ三人がいなければ「三人で抱き合う」、二人なら「ハグ」に替わる。room-games.js の setup のあとの条件で見る）。
     条件が二つ（どちらからでも／条件1のあとに条件2）なら、扉が開くのはどちらも満たした組だけ（scenario-room.js の pairDone・exitAll）なので、
     どちらか一つでも満たせなければ脱出できない。「一人しか出られない」との併用・「全員出られる」も、誰かが条件を満たさないと扉は開かない
   ■ HK.RoomNoExit.preview(input)：入力の写しで HK.simulate を区切り0個で回し（room-trio-note.js と同じ仕組み）、judge の結果を返す
   ■ 箱庭タブで出られない部屋を選んでいるとき、環境値の欄の上（#noexit-note。「三人で」の表示 #trio-note のさらに上）に赤い帯（ui-env.js の
     HK.NgBand.html の red）で出す。住人のオン／オフ・設定・条件の変更で書き換える（room-trio-note.js と同じ見張り方）。記録・結果には効かない */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.RoomAPI, scen = A && A.scen;
  if (!scen) return;
  var K = A.K, NX = HK.RoomNoExit = {};
  function isPairT(T) { return !!T && (T.type === 'act' || T.type === 'word' || T.type === 'hurt' || T.type === 'trio'); }
  function hereOf(ctx) { return ctx.chars.filter(function (c) { return HK.State && HK.State.here ? HK.State.here(c) : c.alive !== false && !c.out; }); }
  /* 条件の呼び名（「条件1「エッチ」」。条件の順番ありの条件2は「（条件1のあと）」を添える） */
  function condName(ctx, r) {
    var e = ctx.env || {}, k1 = e.cond || 'h', lab = r.k === 'kill' ? (HK.SAFE_ON ? '誰かを気絶させる' : '誰かを殺す') : (A.KLABEL && A.KLABEL[r.k]) || r.k;
    var no = r.k === k1 ? '条件1' : r.k === e.cond2 ? '条件2' : '条件';
    var seq = e.order === 'seq' && ctx.rules.length === 2 && r === ctx.rules[1] ? '（条件1のあと）' : '';
    return no + '「' + lab + '」' + seq;
  }

  /* ---------- 体の関係を持てる組か（部屋のエッチを数える出来事の、いちばん緩い判定） ---------- */
  function canH(ctx, a, b) {
    var P = HK.Pos;
    if (!P || !P.okSex) return true;
    var f = function () { return P.okSex(a, b) && (!P.libOK || P.libOK([a, b])); };
    return P.forceOpen ? !!P.forceOpen(ctx, [a, b], f) : !!f();
  }
  /* 誰とも持てない人の理由（その人の設定） */
  function personWhy(c, force) {
    var P = HK.Pos, o = null;
    /* r18:begin */
    if (c.noR18) o = { t: '「R18に参加しない」になっている', fix: c.name + 'の「R18に参加しない」を外す' };
    else if (!HK.SAFE_ON && !force && P.libOf && P.libOf(c) === 'none') o = { t: '性欲の強さが「なし」', fix: c.name + 'の「性欲の強さ」を「ふつう」などにする' };
    else if (!HK.SAFE_ON && c.likes === 'none' && P.sexLikeOf && P.sexLikeOf(c) === 'none') o = { t: '恋愛対象が「なし」で、体の関係の相手も「なし」', fix: c.name + 'の「体の関係の相手」を選ぶ' };
    /* r18:end */
    if (!o && c.likes === 'none' && (!P.sexLikeOf || P.sexLikeOf(c) === 'none')) o = { t: '恋愛対象が「なし」', fix: c.name + 'の「恋愛対象」を変える' };
    return o;
  }
  /* 二人の組の理由（全年齢の言葉。R18版の R18 モードは HK.Pos.noSexInfo の文を使う） */
  var LIKE_JA = { m: '男性', f: '女性' }, POS_JA = { top: '攻め', bottom: '受け', riba: 'リバ' };
  function likeMiss(x, y) { var v = x.likes; return !!(LIKE_JA[v] && LIKE_JA[y.gender] && v !== y.gender); }
  function pairWhy(ctx, a, b, force) {
    var P = HK.Pos, r = null, i, x, y, pr = [[a, b], [b, a]];
    /* 二人とも、相手が恋愛対象に合わない（片方だけ直しても持てないので、二人の名前を出す） */
    if (likeMiss(a, b) && likeMiss(b, a)) return { t: a.name + '（恋愛対象「' + LIKE_JA[a.likes] + '」）と' + b.name + '（恋愛対象「' + LIKE_JA[b.likes] + '」）は、どちらも相手が恋愛対象に合わない', fix: a.name + 'と' + b.name + 'の「恋愛対象」を変える' };
    /* r18:begin */
    if (!HK.SAFE_ON && P.noSexInfo) r = P.noSexInfo(a, b, { ctx: ctx, lib: !force, room: false });
    /* r18:end */
    if (r) return { t: r.t, fix: r.fix };
    for (i = 0; i < 2; i++) { x = pr[i][0]; y = pr[i][1]; if (likeMiss(x, y)) return { t: x.name + 'の恋愛対象「' + LIKE_JA[x.likes] + '」に、' + y.name + '（' + LIKE_JA[y.gender] + '）が合わない', fix: x.name + 'の「恋愛対象」を変える' }; }
    for (i = 0; i < 2; i++) { x = pr[i][0]; y = pr[i][1]; if (x.ng && x.ng.indexOf(y.i) >= 0) return { t: x.name + 'が' + y.name + 'を「恋愛にしない相手」にしている', fix: x.name + 'の「恋愛にしない相手」から' + y.name + 'を外す' }; }
    if ((a.coNG && a.coNG.indexOf(b.i) >= 0) || (b.coNG && b.coNG.indexOf(a.i) >= 0)) return { t: '同じ人の恋人どうし', fix: '二人のあいだに恋愛の関係を足すか、恋人の関係を見直す' };
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return { t: 'どちらかが相手を固定している（恋愛相手の固定など）', fix: '相手の固定を見直す' };
    var lab = function (c, o) { return P.explicit && P.explicit(c, o) ? POS_JA[P.of(c, o)] || 'おまかせ' : 'おまかせ'; };
    return { t: '受け攻めが合わない（' + a.name + '：' + lab(a, b) + '・' + b.name + '：' + lab(b, a) + '）', fix: '受け攻めを、どちらかが受けかリバに回れるようにする' };
  }
  var MAXROW = 5;
  function hItem(ctx, r, C) {
    var P = HK.Pos, force = !!(P && P.forceOn && P.forceOn(ctx)), i, j;
    for (i = 0; i < C.length; i++) for (j = i + 1; j < C.length; j++) if (canH(ctx, C[i], C[j])) return null;
    var rows = [], out = {}, more = 0;
    C.forEach(function (c) { var o = personWhy(c, force); if (o) { out[c.i] = 1; rows.push({ a: c.name, who: c.name, t: o.t + '（誰とも体の関係になりません）', fix: o.fix }); } });
    for (i = 0; i < C.length; i++) for (j = i + 1; j < C.length; j++) {
      if (out[C[i].i] || out[C[j].i]) continue;
      if (rows.length >= MAXROW) { more++; continue; }
      var w = pairWhy(ctx, C[i], C[j], force);
      rows.push({ a: C[i].name, b: C[j].name, t: w.t, fix: w.fix });
    }
    return { lead: condName(ctx, r) + 'を満たせる二人がいません（この顔ぶれでは、どの二人も体の関係になりません）。', rows: rows, more: more,
      notes: ['直し方：下のどれかを直すか、体の関係の要らない条件（キス・ハグなど）に替える'] };
  }
  NX.judge = function (ctx) {
    var rules = ctx && ctx.rules;
    if (!rules || !rules.length || !K[rules[0].k] || rules[0].k === 'one') return null;
    var C = hereOf(ctx), N = C.length, pairR = rules.filter(function (r) { return isPairT(K[r.k]); }), items = [];
    if (pairR.length && N < 2) items.push({ lead: condName(ctx, pairR[0]) + 'は二人で満たす条件ですが、部屋にいるのは' + N + '人です。', rows: [], notes: ['直し方：住人を二人以上にする'] });
    else rules.forEach(function (r) {
      var T = K[r.k];
      if (r.k === 'h') { var it = hItem(ctx, r, C); if (it) items.push(it); }
      else if (T && T.type === 'kill') {
        var keep = pairR.length ? 2 : 1, max = N - keep;
        if (r.n > max) items.push({ lead: condName(ctx, r) + 'の人数（' + r.n + '人）が多すぎます。部屋にいるのは' + N + '人なので、' + (keep > 1 ? 'もう一つの条件を満たす二人' : '扉をくぐる人') + 'が残りません。', rows: [],
          notes: ['直し方：' + (max > 0 ? '人数を' + max + '人以下にするか、' : '') + '住人を増やす'] });
      }
    });
    return items.length ? { n: N, items: items } : null;
  };

  /* ---------- 動かす前に調べる ---------- */
  /* 区切りを0個にした回（room-trio-note.js の HK._trioPrev）のうち、ここから頼んだ回（box.noexit === true）だけ、準備のあとの部屋を調べる。
     scen.steps は準備の中（scenario-room.js）と準備のあと（engine.js）に呼ばれるので、最後の結果（準備がすべて済んだあと）を残す */
  var steps0 = scen.steps;
  scen.steps = function () {
    var box = HK._trioPrev;
    if (box && box.noexitAsk && HK._curCtx && HK._curCtx.rules) { try { box.noexit = NX.judge(HK._curCtx); } catch (e) { box.noexit = null; } }
    return steps0.apply(this, arguments);
  };
  NX.preview = function (input) {
    var box = { noexitAsk: true }, prev = HK._trioPrev;
    HK._trioPrev = box;
    try { HK.simulate(JSON.parse(JSON.stringify(input))); } catch (e) { box.noexit = null; } finally { HK._trioPrev = prev || null; }
    return box.noexit || null;
  };
  /* 表示の HTML（赤い帯。理由の行は1行1組・1人で、その人の ⚙設定を開くボタンつき） */
  NX.html = function (res) {
    if (!res || !res.items || !res.items.length || !HK.NgBand) return '';
    var rows = [], notes = [], more = 0;
    res.items.forEach(function (it) { rows = rows.concat(it.rows || []); more += it.more || 0; notes = notes.concat(it.notes || []); });
    if (more) notes.unshift('ほか' + more + '組も、同じく体の関係になりません');
    return HK.NgBand.html({ red: true, count: false, title: 'この状況では脱出できません', lead: res.items.map(function (it) { return it.lead; }).join(''), rows: rows, notes: notes,
      foot: '扉は最後まで開かず、時間切れになります（そのあとの結末で、救助などで外に出ることはあります）。' });
  };

  /* ---------- 箱庭タブの表示 ---------- */
  if (typeof document === 'undefined' || !document.addEventListener || typeof MutationObserver === 'undefined') return;
  var timer = null, busy = false, lastKey = '', lastHtml = '';
  function schedule() { if (busy) return; clearTimeout(timer); timer = setTimeout(update, 250); }
  function drop(old) { if (old && old.parentNode) { busy = true; old.parentNode.removeChild(old); setTimeout(function () { busy = false; }, 0); } }
  /* 置き場所：環境値の欄の上。「三人で」の表示（#trio-note）があれば、そのさらに上。描き直しで消えたら、入れ直す */
  function update() {
    try {
      var UI = HK.UI, S = UI && UI.state ? UI.state() : null, old = document.getElementById('noexit-note');
      var sel = S && S.scenId === 'whiteroom' ? document.getElementById('env-cond') : null;
      if (!sel || !UI.buildInput) { drop(old); return; }
      var input = UI.buildInput(0), key = JSON.stringify({ s: !!HK.SAFE_ON, i: input, n: (S.chars || []).map(function (c) { return c.name; }) });
      var h = key === lastKey ? lastHtml : NX.html(NX.preview(input));
      lastKey = key; lastHtml = h;
      var grid = sel.closest && sel.closest('.envgrid'), host = grid ? grid.parentNode : (sel.closest && sel.closest('.envitem')) || sel.parentNode;
      var trio = document.getElementById('trio-note'), anchor = trio && trio.parentNode === host ? trio : grid;
      if (!h) { drop(old); return; }
      busy = true;
      if (old && (old.parentNode !== host || (anchor && old.nextSibling !== anchor))) { old.parentNode.removeChild(old); old = null; }
      if (!old) { old = document.createElement('div'); old.id = 'noexit-note'; old.setAttribute('aria-live', 'polite'); if (anchor) host.insertBefore(old, anchor); else host.appendChild(old); }
      if (old._h !== h) { old.innerHTML = h; old._h = h; }
      setTimeout(function () { busy = false; }, 0);
    } catch (e) { busy = false; /* 表示できなくても、箱庭は動かせる */ }
  }
  NX.update = update;
  document.addEventListener('change', schedule, true);
  document.addEventListener('input', schedule, true);
  var start = function () { try { new MutationObserver(schedule).observe(document.body || document.documentElement, { childList: true, subtree: true }); } catch (e) { /* 見張れなくても、入力の変更で書き換える */ } schedule(); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
