/* 箱庭シミュレーター: 催眠 ― 「暗示の方向：エッチなものだけ」で性的な暗示がかからない人の事前の表示（両ビルド共通。2026-10-31 担当SA）
   利用者の不具合報告「催眠の箱庭で催眠の内容をエッチのみにしていても、エッチな内容にならなくなった」への対応。
   本番（solo-saimin.js）は、性的な暗示をかけられない人に、診断の段で理由の一文（SM.noSexNote）を出す。ここでは、動かす前に同じ判定を箱庭タブで知らせる。
   ■ HK.SaiminNote.preview(input)：この顔ぶれ・この設定で、かけられる人ごとに { rows: [{ a: かける人, b: かけられる人, t: 理由, fix: 直し方, solo: 体を重ねない暗示だけかかるか }] }
     判定は本番と同じ：住人どうしは HK.Pos.okSex（＋理由は HK.Pos.noSexInfo。受け攻めの向きだけが決まらない組は、体を重ねない暗示だけ）、
     モブがかけるときは HK.State.mobSexOk・恋愛対象（かける人の性別が決まっていれば）、合意のない展開が切なら 性欲「なし」・夜の起こりやすさ 0・かける相手「恨み」「ストーカー」
   ■ 箱庭タブで催眠を選び、暗示の方向が「エッチなものだけ」のときだけ、環境値の欄の上（#saimin-note）に体の関係にならない組の帯（ui-env.js の HK.NgBand.html）で出す。
     全年齢版・全年齢モードでは出さない（性的な暗示がもともと無いため）
   画面の部品（ui.js・view*.js・index.html）は触らず、箱庭タブの書き換え・入力の変更を見て、自分の表示だけを足し替える（locker-note.js と同じ見張り方） */
/* @event-ok 催眠の「エッチなものだけ」の事前の表示（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK && HK.Story;
  if (!HK || !ST) return;
  var N = HK.SaiminNote = { preview: function () { return null; }, noteHtml: function () { return ''; } };
  /* r18:begin */
  N.preview = function (input) {
    if (HK.SAFE_ON || !input || !input.chars || !input.chars.length || !HK.Pos) return null;
    var env = input.env || {};
    if (env.mode !== 'lewd') return null;
    var inp = JSON.parse(JSON.stringify(input)), prev = ST._cur;
    try {
      var S = ST.state(inp, 'saimin'), P = S.P.slice(0, 2), Pz = HK.Pos, ties = inp.ties || [];
      var gate = !!HK.Content && !HK.Content.ok(S, 'force'), night0 = Pz.nightK ? Pz.nightK(S) <= 0 : false;
      var role = function (p) { return ((inp.perChar && inp.perChar[p.i] && inp.perChar[p.i].pick) || {}).role; };
      var HY = P.filter(function (p) { return role(p) === 'hypno'; })[0] || null;
      if (HY && P.length === 1) HY = null;
      if (!HY && P.length === 2) HY = role(P[1]) !== 'target' ? P[1] : role(P[0]) !== 'target' ? P[0] : P[1];
      var who = env.who || 'random', SM = HK.SAIMIN || {}, TM = SM.TIEMAP || {}, out = [];
      var BADT = { grudge: '恨みを持った相手', stalker: 'ストーカー' };
      /* かける側の種類（本番の solo-saimin.js と同じ決め方のうち、乱数によらない分）。おまかせで関係のない二人・モブは、「エッチなものだけ」なら恨み・ストーカーにならない */
      var tyOf = function (p) {
        if (who !== 'random') return who;
        if (!HY) return '';
        var tt = ties.filter(function (t) { return (t.a === HY.i && t.b === p.i) || (t.a === p.i && t.b === HY.i); })[0];
        if (!tt) return '';
        if (tt.type === 'yan') return tt.cold === 'accept' || tt.cold === 'mutual' ? 'lover' : tt.a === HY.i ? 'stalker' : tt.cold === 'afraid' || tt.cold === 'hate' ? 'grudge' : 'friend';
        if (HK.TIES && HK.TIES[tt.type] && HK.TIES[tt.type].family) return 'friend';
        if (tt.type === 'crush') return tt.a === HY.i ? 'stalker' : 'friend';
        var ty = TM[tt.type] || TM[((HK.TIES || {})[tt.type] || {}).like] || '';
        return ty === 'grudge' && /^(enemy|rival)$/.test(tt.type) ? 'friend' : ty;
      };
      P.forEach(function (p) {
        if (p === HY) return;
        var o = { a: HY ? HY.name : 'かける人（モブ）', b: p.name, solo: false, t: '', fix: '' };
        var ty = tyOf(p), bad = gate && !!BADT[ty] && !(HY && ty === 'stalker' && HK.ngPair && HK.ngPair(HY, p));
        var badT = '合意のない展開が切で、かける側が「' + BADT[ty] + '」', badF = '内容のスイッチ「合意のない展開」を入にするか、環境値「かける相手」' + (who === 'random' ? 'を選ぶ（または二人の関係を変える）' : 'を変える');
        if (!HY) {
          var hs = env.hsex === 'm' || env.hsex === 'f' ? env.hsex : '';
          if (p.noR18) { o.t = p.name + 'が「R18に参加しない」'; o.fix = p.name + 'の「R18に参加しない」を外す'; }
          else if (HK.State && !HK.State.mobSexOk(p)) { o.t = p.name + 'は性行為の相手を固定していて、知らない相手とは関係を持たない'; o.fix = p.name + 'の「性行為の相手の固定」を見直す'; }
          else if (hs && Pz.genderOK && !Pz.genderOK(p, { name: 'かける人', gender: hs, mob: true })) { o.t = p.name + 'の恋愛対象に、かける人（' + (hs === 'f' ? '女性' : '男性') + '）が合わない'; o.fix = '環境値「かける人の性別」を「おまかせ」にする'; }
          else if (bad) { o.t = badT; o.fix = badF; }
        } else if (!Pz.okSex(HY, p)) {
          var r = Pz.noSexInfo ? Pz.noSexInfo(HY, p, { ctx: { chars: S.P }, ties: ties, lib: false }) : null;
          o.t = r ? r.t : '受け攻めか恋愛対象が合わない'; o.fix = r ? r.fix || '' : '';
          if (r && r.k === 'pos' && !bad) o.solo = true;
          if (r && r.k === 'pos' && bad) { o.t += '。' + badT; }
        } else if (bad) { o.t = badT; o.fix = badF; }
        else if (gate && Pz.libOf && (Pz.libOf(p) === 'none' || Pz.libOf(HY) === 'none')) { var x = Pz.libOf(p) === 'none' ? p : HY; o.t = x.name + 'の性欲の強さが「なし」（合意のない展開が切のとき）'; o.fix = x.name + 'の「性欲の強さ」を「ふつう」などにするか、内容のスイッチ「合意のない展開」を入にする'; }
        else if (gate && night0) { o.t = '夜の起こりやすさが 0'; o.fix = '環境値「夜の起こりやすさ」を上げる'; }
        if (o.solo && gate && (night0 || (Pz.libOf && (Pz.libOf(p) === 'none' || Pz.libOf(HY) === 'none')))) { o.solo = false; o.t += night0 ? '。夜の起こりやすさも 0' : '。性欲の強さが「なし」の人もいる'; }
        if (o.t) out.push(o);
      });
      return { rows: out };
    } catch (e) { return null; } finally { ST._cur = prev; }
  };
  N.noteHtml = function (r) {
    if (!r || !r.rows.length || !HK.NgBand) return '';
    var ng = r.rows.filter(function (o) { return !o.solo; }), so = r.rows.filter(function (o) { return o.solo; });
    var h = '';
    if (ng.length) h += HK.NgBand.html({ title: 'エッチな暗示がかからない組', rows: ng.map(function (o) { return { a: o.a, b: o.b, t: o.t, fix: o.fix }; }),
      lead: '暗示の方向は「エッチなものだけ」ですが、この組には性的な暗示がかかりません（平和な暗示になります。結果の診断の段にも理由が出ます）。',
      foot: '「○○の設定」を押すと、その人の設定が開きます（直すと、この表示も書き換わります）。' });
    if (so.length) h += HK.NgBand.html({ title: '体を重ねない暗示だけになる組', rows: so.map(function (o) { return { a: o.a, b: o.b, t: o.t, fix: o.fix }; }),
      lead: '受け攻めの向きが決まらないので、かける側と体を重ねる暗示はかかりません。触れずにかける暗示（感度・発情・声・合図など）だけかかります。' });
    return h;
  };
  /* r18:end */

  /* ---------- 箱庭タブの表示 ---------- */
  if (typeof document === 'undefined' || !document.addEventListener || typeof MutationObserver === 'undefined') return;
  var timer = null, busy = false, lastKey = '', lastText = '';
  function schedule() { if (busy) return; clearTimeout(timer); timer = setTimeout(update, 250); }
  /* 置き場所：環境値の欄の上。描き直しで消えたら、入れ直す */
  function update() {
    try {
      var UI = HK.UI, S = UI && UI.state ? UI.state() : null, old = document.getElementById('saimin-note');
      var sel = S && S.scenId === 'saimin' ? document.getElementById('env-mode') : null;
      if (!sel || !UI.buildInput) { if (old) { busy = true; old.parentNode.removeChild(old); setTimeout(function () { busy = false; }, 0); } return; }
      var input = UI.buildInput(0), key = JSON.stringify({ c: input.chars, p: input.perChar, t: input.ties, e: input.env, s: !!HK.SAFE_ON });
      var t = key === lastKey ? lastText : N.noteHtml(N.preview(input));
      lastKey = key; lastText = t;
      var grid = sel.closest && sel.closest('.envgrid'), host = grid ? grid.parentNode : (sel.closest && sel.closest('.envitem')) || sel.parentNode;
      busy = true;
      if (old && (old.parentNode !== host || (grid && old.nextSibling !== grid))) { old.parentNode.removeChild(old); old = null; }
      if (!t) { if (old) old.parentNode.removeChild(old); }
      else {
        if (!old) { old = document.createElement('div'); old.id = 'saimin-note'; old.setAttribute('aria-live', 'polite'); if (grid) host.insertBefore(old, grid); else host.appendChild(old); }
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
