/* 箱庭シミュレーター: 箱庭をまたいで同じ意味の能力値・欄を住人ごとに一つにまとめる（全年齢版・R18版共通。ui.js の前に読む）
   箱庭ごとの能力値（scen.stats）と住人ごとの欄（scen.perFields）のうち、同じ意味のものを「共通の項目」として住人に持たせる。
   ・値は住人の c.ab { 項目: 値 } に一つだけ持つ（能力値は '1'〜'5'、欄は選択肢の id。空＝ランダム／おまかせ）。
     酒の強さだけは、住人の設定の「お酒」（c.alcohol）をそのまま使う（合コンの「酒の強さ」と同じ 1〜5）
   ・箱庭の表で変えると c.ab が変わり、ほかの箱庭の同じ項目も同じ値で表示される。住人の設定（⚙️）の「箱庭の能力」でも変えられる
   ・箱庭ごとの保存（S.per[住人][箱庭].stats / pick）は、表示と実行の前に SH.apply で c.ab から写す（古い保存は SH.migrate で c.ab へ）
   ・役割・職業・配役など、箱庭ごとに意味の違う欄はまとめない（無人島の担当、館の役割、人狼の配役 など）
   この版にない箱庭は数えない。二つ以上の箱庭にある項目だけを住人の設定に出す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var SH = HK.Shared = {};
  /* k：項目、label：住人の設定での名前、m：{ 箱庭: その箱庭での id }、pick：住人ごとの欄（perFields）のとき true、
     d：能力値（1〜5）の意味（「1＝…、5＝…」。⚙️設定の「箱庭の能力」と、箱庭の表の列の見出しの説明に出す。SH.scale） */
  SH.GROUPS = [
    { k: 'hp', label: '体力', m: { island: 'hp', whiteroom: 'hp', zombie: 'hp', jashin: 'stamina', ship: 'hp', br: 'hp' }, d: '1＝すぐにばてて倒れやすい、5＝タフで倒れにくい' },
    { k: 'luck', label: '運', m: { island: 'luck', zombie: 'luck', locker: 'luck', rpg: 'luck', jashin: 'luck' }, d: '1＝不運続き、5＝強運で切り抜けやすい' },
    { k: 'fight', label: '腕っぷし', m: { rpg: 'str', dungeon: 'fight' }, d: '1＝喧嘩はからきし、5＝戦いに強い' },
    { k: 'sport', label: '運動', m: { classroom: 'sport', br: 'agi' }, d: '1＝運動は苦手、5＝運動神経抜群' },
    { k: 'int', label: '知能', m: { rpg: 'int', jinro: 'int' }, d: '1＝考えるのは苦手、5＝頭が切れる' },
    { k: 'wit', label: '推理力', m: { yakata: 'wit', trial: 'brain' }, d: '1＝見落としが多い、5＝小さな手がかりにも気づく' },
    { k: 'gaman', label: '我慢', m: { variety: 'gaman', locker: 'gaman' }, d: '1＝すぐ音を上げる、5＝我慢強い' },
    { k: 'sense', label: '感じやすさ', m: { massage: 'sense', hole: 'sense', kaihen: 'sens', saimin: 'sens' }, d: '1＝鈍くて反応が薄い、5＝敏感で反応が大きい' },
    { k: 'exp', label: '経験（恋愛・夜）', m: { whiteroom: 'exp', massage: 'exp' }, d: '1＝恋愛に不慣れでうぶ、5＝場数を踏んでいて慣れている' },
    { k: 'charm', label: '魅力・色気', m: { succubus: 'charm', variety: 'iro' }, d: '1＝控えめで目立たない、5＝人目を引き、誘うのがうまい' },
    { k: 'tech', label: '技巧', m: { succubus: 'tech', variety: 'tech' }, d: '1＝不器用、5＝手慣れていて器用' },
    { k: 'drink', label: '酒の強さ', m: { goukon: 'drink' }, alc: true, d: '1＝すぐ酔う、5＝ザル' },
    { k: 'special', label: '特殊役職', m: { zombie: 'special', rpg: 'special', jashin: 'special', yakata: 'special', ship: 'special' }, pick: true },
    { k: 'life', label: '生い立ち', m: { br: 'life', trial: 'life' }, pick: true },
    { k: 'know', label: '検死の知識', m: { yakata: 'know', trial: 'know' }, pick: true }
  ];
  var BY = {};
  SH.GROUPS.forEach(function (g) { BY[g.k] = g; });
  /* その箱庭のその欄が共通の項目なら、その項目（なければ null） */
  SH.groupOf = function (sid, id, pick) {
    for (var i = 0; i < SH.GROUPS.length; i++) {
      var g = SH.GROUPS[i];
      if (!!g.pick === !!pick && g.m[sid] === id) return g;
    }
    return null;
  };
  /* この版にある箱庭だけで数えた、その項目の箱庭 */
  function scensOf(g) { return Object.keys(g.m).filter(function (sid) { return HK.SCENARIOS && HK.SCENARIOS[sid]; }); }
  function fieldOf(g, sid) { return ((HK.SCENARIOS[sid] || {}).perFields || []).filter(function (f) { return f.id === g.m[sid]; })[0] || null; }
  /* 欄の選択肢（最初の箱庭の perField から） */
  function optsOf(g) {
    var sid = scensOf(g)[0], f = sid && fieldOf(g, sid);
    return f ? { auto: f.auto || 'おまかせ', options: f.options || [] } : { auto: 'おまかせ', options: [] };
  }
  function okStat(v) { v = +v; return v >= 1 && v <= 5 && Math.floor(v) === v; }
  function okVal(g, v) {
    if (v == null || v === '' || v === 'auto' || v === 'random') return false;
    if (!g.pick) return okStat(v);
    return optsOf(g).options.some(function (o) { return o.id === v; });
  }
  /* 住人の設定に出す項目：この版で二つ以上の箱庭にあるもの（酒の強さは「お酒」の欄があるので出さない） */
  SH.shown = function () { return SH.GROUPS.filter(function (g) { return !g.alc && scensOf(g).length >= 2; }); };
  /* その項目が出てくる箱庭の名前 */
  SH.where = function (g) { return scensOf(g).map(function (sid) { return HK.SCENARIOS[sid].name; }); };

  /* ui.js normChar：c.ab を整える（選択肢の分からない欄は、箱庭が揃ってから整うよう値の形だけ見る） */
  SH.norm = function (c) {
    var src = c.ab && typeof c.ab === 'object' ? c.ab : {}, ab = {};
    Object.keys(src).forEach(function (k) {
      var g = BY[k], v = src[k];
      if (!g || g.alc || v == null || v === '') return;
      if (g.pick ? typeof v === 'string' && /^[\w-]{1,24}$/.test(v) : okStat(v)) ab[k] = String(v);
    });
    c.ab = ab;
    /* abM：古い保存（箱庭ごとの値）からの移し替えを済ませた印。済んだあとは、消した値が古い保存から戻らないようにする */
    c.abM = !!c.abM;
    return c;
  };
  function get(c, g) { return g.alc ? (HK.ALC_OK && HK.ALC_OK(c.alcohol) ? String(c.alcohol) : '') : (c.ab && c.ab[g.k]) || ''; }
  function put(c, g, v) {
    if (g.alc) { c.alcohol = okStat(v) ? String(+v) : ''; return; }
    c.ab = c.ab || {};
    if (okVal(g, v)) c.ab[g.k] = String(v); else delete c.ab[g.k];
  }
  /* 古い保存：箱庭ごとに入っていた値を c.ab へ（まだ c.ab にない項目だけ。箱庭の並び順で先に見つかった値） */
  SH.migrate = function (c, per) {
    if (!c || c.abM) return;
    c.abM = true;
    if (!per || typeof per !== 'object') return;
    c.ab = c.ab || {};
    /* 感覚遮断穴の「精神力」（1〜5）は、住人の「心の強さ」（弱い／ふつう／強い）に移す（attr.js の will。決めていない人だけ） */
    var hm = per.hole && per.hole.stats && per.hole.stats.mind;
    if (!c.will && hm >= 1 && hm <= 5) c.will = hm <= 2 ? 'weak' : hm >= 4 ? 'strong' : 'avg';
    var order = (HK.SCEN_ORDER || []).concat(Object.keys(per));
    SH.GROUPS.forEach(function (g) {
      if (get(c, g)) return;
      for (var i = 0; i < order.length; i++) {
        var sid = order[i], p = per[sid], id = g.m[sid];
        if (!p || !id) continue;
        var v = g.pick ? p.pick && p.pick[id] : p.stats && p.stats[id];
        if (v != null && v !== '' && v !== 'auto' && v !== 'random' && (g.pick ? !HK.SCENARIOS[sid] || okVal(g, v) : okStat(v))) { put(c, g, v); return; }
      }
    });
  };
  /* ui.js per()：その箱庭の保存に、住人の共通の値を写す（ないときは箱庭の値も消してランダム／おまかせに） */
  SH.apply = function (c, sid, pp) {
    SH.GROUPS.forEach(function (g) {
      var id = g.m[sid];
      if (!id) return;
      var v = get(c, g);
      if (g.pick) {
        pp.pick = pp.pick || {};
        if (v) pp.pick[id] = v; else delete pp.pick[id];
      } else {
        if (v) pp.stats[id] = +v; else delete pp.stats[id];
      }
    });
    return pp;
  };
  /* ui.js：箱庭の表で変えたとき。共通の項目なら c.ab（酒の強さは c.alcohol）を変えて true */
  SH.set = function (c, sid, id, v, pick) {
    var g = SH.groupOf(sid, id, pick);
    if (!g) return false;
    put(c, g, v);
    return true;
  };
  /* 能力値の 1〜5 の意味（その箱庭のその能力値が共通の項目で、意味を書いてあれば「1〜5：1＝…、5＝…。」。なければ ''） */
  SH.scale = function (sid, id) { var g = SH.groupOf(sid, id, false); return g && g.d ? '1〜5：' + g.d + '。' : ''; };
  /* 箱庭の表の見出しに添える説明（共通の項目だけ） */
  SH.headNote = function (sid, id, pick) {
    var g = SH.groupOf(sid, id, pick);
    if (!g) return '';
    if (g.alc) return '住人の設定の「お酒」と同じ値です（1 弱い〜5 ザル）。';
    var others = SH.where(g).filter(function (n) { return n !== HK.SCENARIOS[sid].name; });
    return others.length ? '住人ごとに共通の値です。' + others.join('・') + 'の「' + g.label + '」も同じ値になります（住人の設定の「箱庭の能力」でも変えられます）。' : '';
  };

  /* ---------- 住人の設定（⚙️）の「箱庭の能力」の節 ---------- */
  SH.gearHtml = function (c, h) {
    var gs = SH.shown();
    if (!gs.length) return '';
    var rows = gs.map(function (g) {
      var v = get(c, g), title = h.esc(SH.where(g).join('・'));
      var sel;
      if (g.pick) {
        var o = optsOf(g);
        sel = '<select data-gf="ab" data-k="' + g.k + '" aria-label="' + h.esc(g.label) + '">' + h.opt('', o.auto, v) + o.options.map(function (x) { return h.opt(x.id, x.label, v); }).join('') + '</select>';
      } else {
        sel = '<select data-gf="ab" data-k="' + g.k + '" aria-label="' + h.esc(g.label) + '">' + h.opt('', 'ランダム', v) + [1, 2, 3, 4, 5].map(function (n) { return h.opt(String(n), String(n), v); }).join('') + '</select>';
      }
      return '<label title="' + (g.d ? h.esc(g.d) + '（' + title + '）' : title) + '">' + h.esc(g.label) + ' ' + sel + '</label>';
    }).join('');
    /* 1〜5 の意味（閉じておく） */
    var sc = gs.filter(function (g) { return !g.pick && g.d; });
    return '<div class="gearrow">' + rows + '</div>' + (sc.length ? '<details class="gego" style="margin-top:6px"><summary>1〜5 の意味</summary><ul>' + sc.map(function (g) { return '<li><b>' + h.esc(g.label) + '</b>：' + h.esc(g.d) + '</li>'; }).join('') + '</ul></details>' : '');
  };
  SH.scope = function () {
    return '効く箱庭：' + SH.shown().map(function (g) { return g.label + '（' + SH.where(g).join('・') + '）'; }).join('、') + '。箱庭の「住人ごとの初動と目標」の表と同じ値で、どちらで変えても揃います。';
  };
  /* 住人の行の要約（決めた項目だけ） */
  SH.summary = function (c) {
    return SH.shown().filter(function (g) { return get(c, g); }).map(function (g) {
      var v = get(c, g);
      if (!g.pick) return g.label + '：' + v;
      var o = optsOf(g).options.filter(function (x) { return x.id === v; })[0];
      return g.label + '：' + (o ? o.label : v);
    });
  };
  /* ui-gear.js onField から。扱ったら true */
  SH.gearField = function (c, f, t, isInput, changed) {
    if (f !== 'ab') return false;
    if (isInput) return true;
    var g = BY[t.dataset.k];
    if (!g) return true;
    put(c, g, t.value);
    changed(false);
    return true;
  };
  /* 書き出し・読み込み（rosterJSON / importJSON） */
  SH.exportTo = function (o, c) { if (c.ab && Object.keys(c.ab).length) o.ab = JSON.parse(JSON.stringify(c.ab)); if (c.abM) o.abM = true; return o; };
  SH.importFrom = function (c, o) { if (o.ab && typeof o.ab === 'object') c.ab = JSON.parse(JSON.stringify(o.ab)); c.abM = !!o.abM; };
})();
