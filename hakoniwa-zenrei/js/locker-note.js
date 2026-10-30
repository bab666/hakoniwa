/* 箱庭シミュレーター: 媚薬ロッカー ― 組の成り立ちの事前の表示・結末の但し書き・夜と恋愛の起こりやすさ（両ビルド共通。2026-10-30 担当LK）
   利用者の指示「媚薬ロッカーも同じように条件を表示して。環境値に夜の起こりやすさ、恋愛起こりやすさを設定できつつ、
   出られない部屋とエッチの発生条件（あがりやすさとかは箱庭ごとでいいけど）を揃えてください」への対応。
   ■ 起こりやすさの倍率（solo-locker.js・locker-crowd.js・locker-ties.js が使う）
     ・LK.nightK(S)：環境値 night の倍率（50 で 1・100 で 1.7・0 で 0）。R18版の R18 モードは pos.js の HK.Pos.nightK をそのまま使う。
       全年齢版・全年齢モードは HK.Pos.nightK が 1 を返すので、同じ形の倍率をここで出す（抱き合う場面の起こりやすさとして効かせる）
     ・LK.loveK(S)：環境値 romance の倍率（同じ形）。恋に変わる・両片想いが通じる・恋のきっかけ・「気になる相手」の見込みに掛ける。
       0 のときは solo-story-kit.js の HK.canLove の包みが恋愛そのものを止める
     ・LK.loveOKSex(a, b)：体の関係の門で見る恋愛（恋愛の起こりやすさを見ない LK.loveOK）。体の関係は夜の起こりやすさで決まる
   ■ HK.LockerNote.preview(input)：動かす前に、この顔ぶれ・この設定で成り立つ組を調べる。本番と同じ判定（locker-crowd.js の LK.crowdGate：
     HK.Pos.okSex・HK.ngPair／HK.State.freeSex・HK.sexBlocked・恋愛（HK.canLove を両方向）・恋愛にしない関係・HK.State.r18ok・HK.Pos.libOK）を、
     本番と同じ住人の写し（HK.Story.state）で使う。返り値 { n, safe, night0, pairs: [{ a, b, sex, love, body, force, t, fix }], trios: [{ names, hub }], big }
   ■ 箱庭タブで媚薬ロッカーを選んでいれば、環境値の欄の上（#locker-note）に、出られない部屋と同じ見た目で出す：
     体の関係にならない組の帯（ui-env.js の HK.NgBand.html。理由と直し方・⚙）と、薄い一行（成り立つ組・体だけの組・恋愛になれる組・三人のロッカーで成り立つ三人）。
     全年齢版・全年齢モードでは帯は出さず、恋愛になれる組だけを薄い一行で出す
   ■ HK.LockerNote.ending(res)：結末の但し書き（ui-env.js の HK.NgBand.ending から呼ぶ）。記録の入力（res.input）を読むだけで、記録は書き換えない・回し直さない
   画面の部品（ui.js・view*.js・index.html）は触らず、箱庭タブの書き換え・入力の変更を見て、自分の表示だけを足し替える（room-trio-note.js と同じ見張り方） */
/* @event-ok 媚薬ロッカーの事前の表示・結末の但し書きと、夜・恋愛の起こりやすさの倍率（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK, LK = HK && HK.LOCKER, ST = HK && HK.Story;
  if (!LK || !ST) return;
  var clamp = HK.clamp || function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  if (typeof document !== 'undefined' && document.createElement && document.head) {
    var st = document.createElement('style');
    st.textContent = '#locker-note{margin:0 0 4px}#locker-note .desc{margin:0 0 8px;font-size:12px;color:var(--muted2)}';
    document.head.appendChild(st);
  }

  /* ---------- 起こりやすさの倍率 ---------- */
  function kOf(v) {
    if (v == null || v === '' || isNaN(+v)) return 1;
    v = clamp(+v, 0, 100);
    return v === 50 ? 1 : v <= 0 ? 0 : 0.3 + v / 50 * 0.7;
  }
  LK.nightK = function (S) {
    if (!HK.SAFE_ON) return HK.Pos && HK.Pos.nightK ? HK.Pos.nightK(S) : kOf(S && S.env ? S.env.night : null);
    return kOf(S && S.env ? S.env.night : null);
  };
  LK.loveK = function (S) { return kOf(S && S.env ? S.env.romance : null); };
  LK.loveOKSex = function (a, b) {
    var S = ST._cur, e = S && S.env;
    if (!e || +e.romance !== 0 || e.romance === '') return LK.loveOK(a, b);
    var r = e.romance;
    e.romance = 50;
    try { return LK.loveOK(a, b); } finally { e.romance = r; }
  };

  /* ---------- 組の成り立ち ---------- */
  var N = HK.LockerNote = {};
  function nm(p) { return p.name; }
  /* 理由と直し方（R18版の R18 モードは pos.js の HK.Pos.noSexInfo。当たらなければロッカーの判定から） */
  function whyOf(S, a, b, ties, G) {
    var P = HK.Pos, r = null;
    if (P && P.noSexInfo) { try { r = P.noSexInfo(a, b, { ctx: { chars: S.P }, room: false, ties: ties }); } catch (e) { r = null; } }
    if (r) return { t: r.t, fix: r.fix || (HK.NgBand && HK.NgBand.fixOf ? HK.NgBand.fixOf({ a: a.name, b: b.name, t: r.t }) : '') };
    if (G.noLoveTie(S, a, b)) return { t: a.name + 'と' + b.name + 'は恋愛にしない関係（「恋愛：なし」の家族・信仰）', fix: '二人の関係の「恋愛」を「あり」にする' };
    if (!G.love(S, a, b) && !G.free(S, a, b)) return { t: a.name + 'と' + b.name + 'は恋愛にならない組（関係の「恋愛：なし」など）で、体だけの関係の設定もない', fix: '二人の関係の「恋愛」を「あり」にする' };
    return { t: '受け攻めか恋愛対象が合わない', fix: '受け攻め・恋愛対象を見直す' };
  }
  N.preview = function (input) {
    var G = LK.crowdGate;
    if (!G || !input || !input.chars) return null;
    var inp = JSON.parse(JSON.stringify(input)), prev = ST._cur, S;
    try {
      S = ST.state(inp, 'locker');
      S.ties = ST.tiesOk ? ST.tiesOk(S.P, inp.ties) : inp.ties || [];
      var P = S.P, out = { n: P.length, safe: !!HK.SAFE_ON, night0: LK.nightK(S) <= 0, love0: LK.loveK(S) <= 0, pairs: [], trios: [], big: (S.env.layout || 'random') !== 'split' };
      for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
        var a = P[i], b = P[j], sex = !!G.consent0(S, a, b), love = !!G.love(S, a, b), o = { a: a.name, b: b.name, sex: sex, love: love, body: sex && !love, force: !sex && !HK.SAFE_ON && !!G.host(S, a, b) };
        if (!sex && !HK.SAFE_ON) { var w = whyOf(S, a, b, inp.ties || [], G); o.t = w.t; o.fix = w.fix; }
        out.pairs.push(o);
      }
      /* 三人の場面（大きなロッカーの三人・三人で閉じ込められたときの扉が開いたあとのベッド。locker-crowd.js・locker-trio-bed.js の trioOk から、
         本命の熱の条件を除いたもの。R18版の R18 モードだけ） */
      if (!HK.SAFE_ON && P.length >= 3 && (out.big || P.length === 3)) {
        for (var x = 0; x < P.length; x++) for (var y = x + 1; y < P.length; y++) for (var z = y + 1; z < P.length; z++) {
          var m = [P[x], P[y], P[z]], pl = G.trio(S, m);
          if (pl) out.trios.push({ names: m.map(nm), hub: pl.all ? '' : pl.hub ? pl.hub.name : '' });
        }
      }
      return out;
    } catch (e) { return null; } finally { ST._cur = prev; }
  };

  /* ---------- 表示の文 ---------- */
  function joinPairs(L) { return L.map(function (o) { return o.a + '×' + o.b; }).join('・'); }
  function lineOf(r) {
    if (!r || r.n < 2) return '';
    var lv = r.pairs.filter(function (o) { return o.love; });
    var t = r.love0 ? '恋愛の起こりやすさが 0 なので、新しい恋は始まりません。' : lv.length ? '恋愛になれる組：' + joinPairs(lv) + '（' + lv.length + ' 組）。' : '恋愛になれる組：なし（恋愛対象・関係の「恋愛」・固定の設定から）。';
    if (r.safe) return t + (r.night0 ? '抱き合う場面の起こりやすさが 0 なので、誰も手を伸ばさず、我慢で進みます。' : '');
    var s = '';
    /* r18:begin */
    var ok = r.pairs.filter(function (o) { return o.sex; }), body = ok.filter(function (o) { return o.body; }), fo = r.pairs.filter(function (o) { return o.force; });
    s = r.night0 ? '夜の起こりやすさが 0 なので、合意の上では体の関係になりません（媚薬の場面は我慢で進みます）。' : '';
    s += ok.length ? '体の関係が成り立つ組：' + joinPairs(ok) + '（' + ok.length + ' 組）' + (body.length ? '。うち恋愛にはならない体だけの組：' + joinPairs(body) : '') + '。' : '';
    if (fo.length) s += '合意のない展開（内容のスイッチ）のときだけ体の関係になる組：' + joinPairs(fo) + '。';
    if (r.n >= 3 && (r.big || r.n === 3)) s += (r.trios.length ? '三人の場面（' + [r.big ? '大きなロッカーに三人で入ったとき' : '', r.n === 3 ? '扉が開いたあとのベッド' : ''].filter(Boolean).join('・') + '）で成り立つ三人：' + r.trios.slice(0, 4).map(function (o) { return o.names.join('・') + (o.hub ? '（' + o.hub + 'を真ん中に）' : ''); }).join('、') + (r.trios.length > 4 ? '、ほか ' + (r.trios.length - 4) + ' 組' : '') + '（熱が限界のときに三人の場面になります）。' : '三人の場面で成り立つ三人：なし（二組以上が体の関係を持てる三人がいると、三人の場面になります）。');
    /* r18:end */
    return s + t;
  }
  N.lineOf = lineOf;
  function noteHtml(r) {
    if (!r || r.n < 2) return '';
    var h = '', NB = HK.NgBand;
    /* r18:begin */
    var ng = r.pairs.filter(function (o) { return !o.sex; }), none = !r.pairs.some(function (o) { return o.sex; });
    if (NB && !r.safe && ng.length) {
      h = NB.html({ title: '体の関係にならない組', rows: ng.slice(0, 10).map(function (o) { return { a: o.a, b: o.b, t: o.t + (o.force ? '（合意のない展開が入なら、敵対の場面でだけ持てる）' : ''), fix: o.fix }; }),
        notes: ng.length > 10 ? ['ほかに ' + (ng.length - 10) + ' 組あります。'] : [],
        lead: none ? 'この顔ぶれでは体の関係になりません（媚薬の場面は我慢・暗転で進みます）。' : 'この組は同じロッカーに入っても手を出し合わず、我慢で進みます。',
        foot: '「○○の設定」を押すと、その人の設定が開きます（直すと、この表示も書き換わります）。' });
    }
    /* r18:end */
    var t = lineOf(r);
    return h + (t ? '<div class="desc trioinfo">' + HK.escape(t) + '</div>' : '');
  }
  N.noteHtml = noteHtml;

  /* ---------- 結末の但し書き（ui-env.js の HK.NgBand.ending から） ---------- */
  N.ending = function () { return ''; };
  /* r18:begin */
  N.ending = function (res) {
    if (!res || !res.input || HK.SAFE_ON || !HK.NgBand) return '';
    var r = N.preview(res.input);
    if (!r || r.n < 2) return '';
    /* 実際に触れ合った組（二人以上の場面の記録）は外す */
    var met = {};
    (res.log || []).forEach(function (e) { var A = e && e.kind === 'climax' ? e.actors || [] : []; for (var i = 0; i < A.length; i++) for (var j = 0; j < A.length; j++) if (i !== j) met[A[i] + '-' + A[j]] = 1; });
    var ix = {}; (res.chars || []).forEach(function (c) { ix[c.name] = c.i; });
    var ng = r.pairs.filter(function (o) { return !o.sex && !met[ix[o.a] + '-' + ix[o.b]]; });
    if (!ng.length && !r.night0) return '';
    return HK.NgBand.html({ title: '体の関係にならなかった組', rows: ng.slice(0, 10).map(function (o) { return { a: o.a, b: o.b, t: o.t, fix: o.fix }; }),
      notes: (r.night0 ? ['夜の起こりやすさが 0 だったので、合意の上では誰も体の関係になりませんでした（直し方：環境値「夜の起こりやすさ」を上げる）。'] : []).concat(ng.length > 10 ? ['ほかに ' + (ng.length - 10) + ' 組。'] : []),
      lead: ng.length ? 'この組は、設定のため体の関係になりませんでした（媚薬の場面は我慢で終わりました）。' : '',
      foot: '「○○の設定」を押すと、その人の設定が開きます。直すと次に動かすときに効きます（この記録は変わりません）。' });
  };
  /* r18:end */

  /* ---------- 箱庭タブの表示 ---------- */
  if (typeof document === 'undefined' || !document.addEventListener || typeof MutationObserver === 'undefined') return;
  var timer = null, busy = false, lastKey = '', lastText = '';
  function schedule() { if (busy) return; clearTimeout(timer); timer = setTimeout(update, 250); }
  /* 置き場所：環境値の欄の上。描き直しで消えたら、入れ直す */
  function update() {
    try {
      var UI = HK.UI, S = UI && UI.state ? UI.state() : null, old = document.getElementById('locker-note');
      var sel = S && S.scenId === 'locker' ? document.getElementById('env-dose') : null;
      if (!sel || !UI.buildInput) { if (old) { busy = true; old.parentNode.removeChild(old); setTimeout(function () { busy = false; }, 0); } return; }
      var input = UI.buildInput(0), key = JSON.stringify({ c: input.chars, t: input.ties, e: input.env, s: !!HK.SAFE_ON });
      var t = key === lastKey ? lastText : noteHtml(N.preview(input));
      lastKey = key; lastText = t;
      var grid = sel.closest && sel.closest('.envgrid'), host = grid ? grid.parentNode : (sel.closest && sel.closest('.envitem')) || sel.parentNode;
      busy = true;
      if (old && (old.parentNode !== host || (grid && old.nextSibling !== grid))) { old.parentNode.removeChild(old); old = null; }
      if (!t) { if (old) old.parentNode.removeChild(old); }
      else {
        if (!old) { old = document.createElement('div'); old.id = 'locker-note'; old.setAttribute('aria-live', 'polite'); if (grid) host.insertBefore(old, grid); else host.appendChild(old); }
        if (old._h !== t) { old.innerHTML = t; old._h = t; }
      }
      setTimeout(function () { busy = false; }, 0);
    } catch (e) { busy = false; /* 表示できなくても、箱庭は動かせる */ }
  }
  N.update = update;
  document.addEventListener('change', schedule, true);
  document.addEventListener('input', schedule, true);
  var start = function () { try { new MutationObserver(schedule).observe(document.body || document.documentElement, { childList: true, subtree: true }); } catch (e) { /* 見張れなくても、入力の変更で書き換える */ } schedule(); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
