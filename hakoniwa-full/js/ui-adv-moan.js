/* 箱庭シミュレーター（R18版のみ）: 全体の口調・喘ぎの設定（もとの高度設定）の「喘ぎの辞書」の欄（moan-engine.js の HK.Moan を ui-adv.js の節として登録）
   2026-10-28 担当LD：
   ・説明文を見出し・箇条書き・表（場面｜段階）で組む（ui-adv.js の sec.descFmt。場面と段階の表は M.MODES から作るので、場面を足せば説明にも出る）
   ・「全場面の見出しを引き込む」（HK.MoanPull）：辞書の欄に、全場面×全段階の見出し（受け・攻め・台詞の場面・小説調）を、範囲（共通／口調=／態度=／住人=）付きで入れ、
     各見出しの下に組み込みの今の声を 1〜3 行（書き換えられる普通の行として）入れる。声は箱庭と同じ HK.Moan.pick（台詞の場面は HK.Moan.lineFor、小説調は HK.Moan.demo）から、
     利用者の辞書・住人の欄を外して引く。{名}（相手の呼び方）・{p}（相手の性器の呼び方）は印のまま入れる（使うときに埋まる）。
       範囲ごとに、その範囲で効く声を入れる：共通 … 言葉と混ぜる場面は言葉のない声だけ（言葉の分は態度の基盤のまま）・ほかは「穏やか」の声（口調の語尾は付けない）／
       態度=X … その態度の声（言葉と混ぜる場面は言葉のある声）／口調=X … その口調の人の声／住人=X … その住人の声（夜の性格・喘ぎの口調も込み）
     ・欄に文があるときは確かめてから（OK＝末尾に足す。そのとき、同じ範囲・場面の見出しがもうある場面は飛ばす／キャンセル→もう一度確かめて置き換える）
     ・「追加」の形（見出しの末尾に「追加」）も選べる。欄の上限（全体 20000 字・住人 4000 字）に収まるよう、入らなければ声の行数を減らす
     ・住人ごとの辞書（ui-gear-moan.js の受け・攻めの欄）でも同じ（範囲はその住人。HK.MoanPull.toOwn）
   登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Adv, M = HK && HK.Moan;
  if (!A || !M || HK.SAFE_ON) return;
  var esc = A.esc, ADV_MAX = 20000;
  var NOVEL = [['始まり', 'n0'], ['最中', 'n1'], ['果てる', 'n2']];
  var GROUPS = [
    { label: '受け', f: function (x) { return !x.top && !x.line; } },
    { label: '攻め', f: function (x) { return !!x.top && !x.line; } },
    { label: '台詞の場面', f: function (x) { return !!x.line; } }
  ];
  function modesOf(f) { return Object.keys(M.MODES).filter(function (m) { return f(M.MODES[m]); }); }
  function tblRows(f) { return modesOf(f).map(function (m) { var x = M.MODES[m]; return x.label + '｜' + x.stages.map(function (s, i) { return (i + 1) + ' ' + s; }).join('／'); }).join('\n'); }
  function toneLabel(k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA && HK.PERSONA[k]; return t && t.label ? t.label : k; }
  function psLabel(k) { return HK.PERSONA && HK.PERSONA[k] ? HK.PERSONA[k].label : k; }
  function plainName(n) { return String(n || '').replace(/[⁠-⁤]/g, ''); }
  function chars() { var S = HK.UI && HK.UI.state ? HK.UI.state() : null; return S && S.chars ? S.chars : []; }

  /* ---------- 引き込む見出しの一覧 ---------- */
  /* side：'' 全部（全体の辞書）／'r' 受けの欄／'t' 攻めの欄（住人の辞書）。{ key, head（範囲の後ろ）, grp, note（段階の名前） } */
  function entries(side) {
    var out = [];
    GROUPS.forEach(function (g) {
      modesOf(g.f).forEach(function (m) {
        var x = M.MODES[m];
        if ((side === 'r' && x.top) || (side === 't' && !x.top)) return;
        x.stages.forEach(function (s, i) { out.push({ key: m + i, head: x.label + ' ' + (i + 1), grp: g.label, note: x.label + ' ' + (i + 1) + '：' + s, line: !!x.line }); });
      });
    });
    if (side !== 't') NOVEL.forEach(function (n) { out.push({ key: n[1], head: '小説 ' + n[0], grp: '小説調', note: '小説調：' + n[0], novel: true }); });
    return out;
  }

  /* ---------- 組み込みの今の声 ---------- */
  var PARTNER = { name: '{名}', gender: '' };
  function seedOf(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h % 2147483647; }
  function rngOf(seed) { var x = seed, R = function () { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; R.int = function (m) { return Math.floor(R() * m); }; return R; }
  function clean(s) { return String(s == null ? '' : s).replace(/[⁠-⁤]/g, '').replace(/[|｜]/g, '／').replace(/^[\s　]+|[\s　]+$/g, ''); }
  /* 範囲ごとの、声を引く見本の人と引き方。sc：{ k: 'c'|'t'|'p'|'w', v } */
  function whoFor(sc) {
    var eg = { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 };
    if (sc.k === 'w' && sc.c) { var w = Object.assign({}, sc.c); delete w.moanDict; delete w.moanDictT; return w; }
    return { name: '見本', tone: sc.k === 't' || sc.k === 'p' ? sc.v : 'gentle', gender: '', eg: eg };
  }
  function oneLine(S, who, e, sc) {
    if (e.line) {
      var L = M.lineFor ? M.lineFor(S, who, e.key, { kind: '', bname: '{名}' }) : null;
      if (!L || !L.q) return '';
      /* 3本の台詞（くだけた｜硬い｜敬語）は、1本目（くだけた常体）を入れる。使うときに話し手の口調へ言い換える */
      return String(L.q).replace(/^「|」$/g, '').split('｜')[0];
    }
    if (e.novel) {
      var d = M.demo(e.key, { who: who, style: 'novel', n: 1, seed: S.rng.int(2147483000) });
      return d && d[0] && d[0].indexOf('相手') < 0 ? d[0] : '';
    }
    var KK = M.KEY_KIND || { words: {}, mix: {} }, ctx = { top: PARTNER, p: '{p}' };
    /* 共通：口調の語尾・口調ごとの喘ぎを混ぜず、言葉と混ぜる場面は言葉のない声だけ（共通の行が置き換えるのは言葉のない分） */
    if (sc.k === 'c') { ctx.toneRate = 0; ctx.toneMoanRate = 0; if (KK.mix[e.key]) ctx.talk = 0; }
    /* 態度=：口調の語尾を混ぜず、言葉と混ぜる場面は言葉のある声（態度= の行が置き換えるのは言葉の分） */
    else if (sc.k === 'p') { ctx.toneRate = 0; ctx.toneMoanRate = 0; if (KK.mix[e.key]) ctx.talk = 9; }
    else if (sc.k === 't' && KK.mix[e.key]) ctx.talk = 9;
    return M.pick(S, who, e.key, ctx);
  }
  /* list の各見出しに、組み込みの声を n 行まで（重なりなし）。利用者の辞書・住人の欄・体の組の表・呼び方の設定を外して引く（終われば元に戻す） */
  function voicesOf(list, sc, n) {
    var who = whoFor(sc), sv = { user: M.user, own: M.own, map: M.map, nmap: M.nmap, kindOf: M.kindOf, callName: M.callName }, res = {};
    M.user = null; M.own = null;
    if (sc.k === 'w' && sc.c) { M.map = {}; if (sc.c.moanTone) M.map[who.name] = sc.c.moanTone; M.nmap = {}; M.nmap[who.name] = { i: 0, night: sc.c.night || '', nightFor: null }; }
    M.kindOf = function () { return ''; };
    M.callName = function (w, p) { return p && p.name ? p.name : ''; };
    try {
      list.forEach(function (e) {
        var S = { rng: rngOf(seedOf(e.key + '|' + sc.k + '|' + (sc.v || ''))), log: [] }, got = [];
        for (var i = 0; i < n * 6 && got.length < n; i++) {
          var s = '';
          try { s = clean(oneLine(S, who, e, sc)); } catch (x) { s = ''; }
          if (s && !/^[#＃\[［]/.test(s) && got.indexOf(s) < 0) got.push(s);
        }
        res[e.key] = got;
      });
    } finally { M.user = sv.user; M.own = sv.own; M.map = sv.map; M.nmap = sv.nmap; M.kindOf = sv.kindOf; M.callName = sv.callName; }
    return res;
  }

  /* ---------- 文にする ---------- */
  function scopeText(sc) { return sc.k === 'c' ? '共通' : sc.k === 't' ? '口調=' + toneLabel(sc.v) : sc.k === 'p' ? '態度=' + psLabel(sc.v) : '住人=' + plainName(sc.c.name); }
  function scopeId(sc) { return sc.k === 'c' ? 'c::' : sc.k === 't' ? 't:' + sc.v + ':' : sc.k === 'p' ? 'p:' + sc.v + ':' : sc.k === 'o' ? 'o:' : 'w:' + plainName(sc.c.name) + ':'; }
  function build(list, sc, vs, add, n, notes) {
    var out = [], grp = '', own = sc.k === 'o';
    list.forEach(function (e) {
      if (e.grp !== grp) { grp = e.grp; if (out.length) out.push(''); out.push('# ―― ' + grp + ' ――'); }
      if (notes) out.push('# ' + e.note);
      out.push('[' + (own ? '' : '喘ぎ ' + scopeText(sc) + ' ') + e.head + (add ? ' 追加' : '') + ']');
      (vs[e.key] || []).slice(0, n).forEach(function (v) { out.push(v); });
    });
    return out.join('\n');
  }
  /* 欄の上限に収まる形（声 3 行 → 2 行 → 1 行 → 段階の名前の行なし → 見出しだけ）。収まらなければ null */
  function compose(list, sc, vs, add, room) {
    var plans = [[3, true], [2, true], [1, true], [1, false], [0, false]];
    for (var i = 0; i < plans.length; i++) { var t = build(list, sc, vs, add, plans[i][0], plans[i][1]); if (t.length <= room) return { text: t, n: plans[i][0] }; }
    return null;
  }
  /* 書いてある見出し → 範囲と鍵の印（足すときに、同じ見出しの場面を飛ばす） */
  function idsOf(text, own) {
    var ids = {};
    String(text || '').split(/\r?\n/).forEach(function (l) {
      l = l.replace(/^\s+|\s+$/g, '');
      if (!/^[\[［].*[\]］]$/.test(l)) return;
      if (own) { Object.keys(M.parseOwn(l + '\nx').d).forEach(function (k) { ids['o:' + k] = 1; }); return; }
      var p = M.parse(l + '\nx');
      Object.keys(p.shared).forEach(function (k) { ids['c::' + k] = 1; });
      [['t', p.tone], ['p', p.persona], ['w', p.who]].forEach(function (b) { Object.keys(b[1]).forEach(function (s) { Object.keys(b[1][s]).forEach(function (k) { ids[b[0] + ':' + s + ':' + k] = 1; }); }); });
    });
    return ids;
  }
  /* 欄の文に引き込む。cur：今の文、sc：見出しの範囲（'o' は住人の欄。範囲を書かない）、vsc：声を引く範囲（省けば sc）、max：上限。
     { text 新しい文, msg } か { error }。確かめてやめたら null */
  function pull(cur, sc, vsc, add, side, max, label) {
    var mode = 'rep', has = String(cur || '').replace(/^\s+|\s+$/g, '') !== '';
    if (has) {
      if (window.confirm(label + 'には、もう文があります。\n\n［OK］今の文を残して、末尾に全場面の見出しを足す（同じ範囲・場面の見出しがもうある場面は飛ばします）\n［キャンセル］足さない（次に「置き換える」かを聞きます）')) mode = 'add';
      else if (window.confirm(label + 'の今の文を消して、全場面の見出しで置き換えますか？（元に戻せません）\n\n［OK］置き換える\n［キャンセル］何もしない')) mode = 'rep';
      else return null;
    }
    var all = entries(side), have = mode === 'add' ? idsOf(cur, sc.k === 'o') : {}, sid = scopeId(sc);
    var list = all.filter(function (e) { return !have[sid + e.key]; }), skip = all.length - list.length;
    if (!list.length) return { error: 'どの場面にも、もう同じ範囲の見出しがあります（足すものがありません）。' };
    var base = mode === 'add' ? String(cur).replace(/\s+$/, '') + '\n\n' : '';
    var r = compose(list, sc, voicesOf(list, vsc || sc, 3), add, max - base.length);
    if (!r) return { error: '欄の文字数の上限（' + max + '字）を超えるので入れられません。今の文を減らすか、置き換えてください。' };
    return {
      text: base + r.text,
      msg: '見出し ' + list.length + ' 個（範囲：' + (sc.k === 'o' ? 'この住人' : scopeText(sc)) + (add ? '・追加の形' : '') + '）と、組み込みの今の声を' + (r.n ? '各 ' + r.n + ' 行まで' : '入れずに見出しだけ') + (mode === 'add' ? '末尾に足しました' : '入れました') +
        (skip ? '（見出しがもうある ' + skip + ' 場面は飛ばしました）' : '') + (r.n < 3 ? '。欄の上限に収めるため、声の行を減らしました' : '') +
        '。行を書き換えると、すぐその声に変わります' + (add ? '（組み込みの声と混ぜて使います）' : '（その場面の声は、見出しの下の行だけになります）') + '。組み込みのままにしたい場面は、行を消して見出しだけ残してください。'
    };
  }
  var P = HK.MoanPull = { entries: entries, voicesOf: voicesOf, build: build, idsOf: idsOf };
  /* 範囲の選択（全体の辞書）：値 'c' 共通 ／ 't:口調' ／ 'p:態度' ／ 'w:住人の id' */
  var pick0 = 'c';
  function scopeOpts() {
    var o = function (v, l, dis) { return '<option value="' + esc(v) + '"' + (v === pick0 ? ' selected' : '') + (dis ? ' disabled' : '') + '>' + esc(l) + '</option>'; };
    var cs = chars();
    return o('c', '共通（全員）') +
      '<optgroup label="口調ごと">' + (HK.TONE_KEYS || []).map(function (k) { return o('t:' + k, '口調=' + toneLabel(k)); }).join('') + '</optgroup>' +
      '<optgroup label="態度ごと">' + (HK.PERSONA_KEYS || []).map(function (k) { return o('p:' + k, '態度=' + psLabel(k)); }).join('') + '</optgroup>' +
      (cs.length ? '<optgroup label="住人ごと">' + cs.map(function (c) { var bad = /[\s　\[\]［］]/.test(plainName(c.name)); return o('w:' + c.id, '住人=' + plainName(c.name) + (bad ? '（名前に空白か括弧があるので使えません）' : ''), bad); }).join('') + '</optgroup>' : '');
  }
  function scopeOfVal(v) {
    var k = String(v || 'c').charAt(0), x = String(v || '').slice(2);
    if (k === 't' && HK.toneValid && HK.toneValid(x)) return { k: 't', v: x };
    if (k === 'p' && HK.PERSONA && HK.PERSONA[x]) return { k: 'p', v: x };
    if (k === 'w') { var c = chars().filter(function (y) { return y.id === x; })[0]; if (c) return { k: 'w', v: c.id, c: c }; }
    return { k: 'c' };
  }
  function msgTo(id, s) { var el = document.getElementById(id); if (el) el.textContent = s || ''; }
  /* 全体の辞書へ */
  P.toAdv = function () {
    var sel = document.getElementById('mp-scope'), ad = document.getElementById('mp-add'), ta = document.querySelector('textarea[data-f="adv"][data-k="moan"]');
    pick0 = sel ? sel.value : 'c';
    var sc = scopeOfVal(pick0), r = pull(ta ? ta.value : A.get('moan'), sc, null, !!(ad && ad.checked), '', ADV_MAX, '喘ぎの辞書');
    if (!r) return;
    if (r.error) { msgTo('mp-msg', r.error); return; }
    if (ta) { ta.value = r.text; A.onInput(ta); } else A.set('moan', r.text);
    msgTo('mp-msg', r.msg);
  };
  /* 住人の辞書（受けの欄 side 'r'／攻めの欄 side 't'）へ。欄の入力として流す（ui-voice.js の入力の処理 → ui-gear-moan.js が c.moanDict／c.moanDictT に保存） */
  P.toOwn = function (c, side) {
    side = side === 't' ? 't' : 'r';
    var f = side === 't' ? 'moanDictT' : 'moanDict', ta = document.querySelector('#vs-panel textarea[data-gf="' + f + '"]'), ad = document.getElementById('gm-pull-add-' + side);
    if (!c) return;
    var sc = { k: 'o', c: c }, vsc = { k: 'w', v: c.id, c: c };
    var cur = ta ? ta.value : c[f] || '', label = c.name + 'の喘ぎの辞書（' + (side === 't' ? '攻め' : '受け') + 'のとき）';
    /* 声は住人= と同じ引き方（その住人の口調・態度・夜の性格・喘ぎの口調）。見出しは範囲なし */
    var r = pull(cur, sc, vsc, !!(ad && ad.checked), side, M.OWN_MAX || 4000, label);
    if (!r) return;
    if (r.error) { msgTo('gm-pull-msg-' + side, r.error); return; }
    if (ta) {
      ta.value = r.text;
      var ev; try { ev = new Event('input', { bubbles: true }); } catch (x) { ev = document.createEvent('Event'); ev.initEvent('input', true, true); }
      ta.dispatchEvent(ev);
      if (A.grow) A.grow(ta);
    } else c[f] = r.text;
    msgTo('gm-pull-msg-' + side, r.msg);
  };

  A.add({
    id: 'moan', title: '喘ぎの辞書（男性向けの作風）', rows: 14, grow: true, descFmt: true,
    /* 説明文（ui-adv.js の A.fmt の書式：■ 見出し・中黒の箇条書き・全角の縦棒で区切った表の行）。場面と段階の表は M.MODES から */
    desc: '言葉のない喘ぎ（短い声・吐息・鼻声・リズム）は、全口調で使い回しています。気に入らなければ、場面と段階ごとに書き換えられます。\n' +
      '■ 書き方\n' +
      '・見出し [喘ぎ 共通 乗り気 1] の下に、声を1行に1つ（「|」で区切って並べても可）。\n' +
      '・見出しの末尾に「追加」を付けると、置き換えずに足します（口調=・態度=・住人= では、組み込みの声と半々で混ぜます）。\n' +
      '・見出しだけで下に行が無い場面は、組み込みのままです。「#」で始まる行はメモとして読み飛ばします。\n' +
      '・下の「全場面の見出しを引き込む」で、全場面の見出しと、組み込みの今の声をまとめて入れられます。そのまま書き換えてください。\n' +
      '■ 範囲（見出しの2つ目）\n' +
      '共通｜全員（言葉と混ぜる場面では、言葉のない声の分）\n' +
      '口調=ギャル｜その口調の人だけ（口調の名前で書きます）\n' +
      '態度=強気｜その態度の人だけ（言葉と混ぜる場面では、言葉のある声の分）\n' +
      '住人=名前｜その住人だけ\n' +
      '・住人ごとに書くなら、上の「対象」でその住人を選んだ「喘ぎ」の「喘ぎの辞書（この住人だけ）」がいちばん優先です。\n' +
      '■ 場面と段階（受け）\n' + tblRows(GROUPS[0].f) + '\n' +
      '・{p} は相手の性器の呼び方、{名} は相手の呼び方になります（相手に無いときは、その行を使いません）。\n' +
      '・「激しく」が空なら、短い声を組み合わせて作ります。\n' +
      '■ 場面と段階（攻め）\n' + tblRows(GROUPS[1].f) + '\n' +
      '■ 台詞の場面（言葉責め・焦らし・攻めの崩れ・言い返し）\n' + tblRows(GROUPS[2].f) + '\n' +
      '・例：[喘ぎ 態度=強気 言葉責め 1]。1行に1つの台詞を書くと、組み込みの台詞より先に使います。\n' +
      '・ふだんの台詞と同じ口調の言い換えを通します（快感で遮られた形には崩しません）。\n' +
      '■ 小説調（描写の作風）\n' +
      '小説｜始まり／最中／果てる\n' +
      '・例：[喘ぎ 共通 小説 最中]。小説調の交わりの場面の声を置き換えます（範囲は同じ。嫌がる場面には使わず、♡は落とします）。\n' +
      '・小説調でも、上の男性向けの場面の行は、喘ぎの辞書から引く分（4〜6割）に効きます。\n' +
      '■ 口調との関係\n' +
      '・言葉のある喘ぎは、態度の基盤を素の言葉で出します。口調の色は薄め（咄嗟の声は素に戻る）で、敬語やお嬢様の口調でも「〜ですわ」「〜ます」は付けず、ときどき口調の語尾が付く程度です。\n' +
      '・口調らしい喘ぎにしたいときは [喘ぎ 口調=…] か [喘ぎ 住人=…] で書けば、そちらが優先されます。\n' +
      '・書いた行は「喘ぎ声の調整」の区分では直しませんが、ふだんの台詞と同じ口調の言い換え（一人称・二人称・語尾）は通ります。',
    placeholder: '[喘ぎ 共通 乗り気 1]\nにゃ……っ|にゃあ……っ\n[喘ぎ 口調=ギャル 嫌がる 1]\nマジ無理、やめて……っ！\n[喘ぎ 住人=アキラ 懇願 1]\nもっと……おねがい……♡\n[喘ぎ 共通 小説 最中]\nあ……っ、そこ……',
    apply: function (text) { return M.setUser(text); },
    tools: function () {
      return '<label>範囲 <select id="mp-scope" aria-label="引き込む見出しの範囲">' + scopeOpts() + '</select></label>' +
        '<label title="見出しの末尾に「追加」を付けます。組み込みの声を消さずに、書いた行を足して使います"><input type="checkbox" id="mp-add"> 「追加」の形で</label>' +
        '<button type="button" class="mini" data-act="adv:moan-pull">全場面の見出しを引き込む</button>' +
        '<p class="advmsg" id="mp-msg" aria-live="polite"></p>';
    },
    onAct: function (act) { if (act === 'adv:moan-pull') P.toAdv(); },
    /* 見本は上の「喘ぎ声の調整」の節（ui-adv-moan-fit.js。口調・性別・夜の性格・場面で出す。この辞書の行も「利用者の辞書」として出る） */
    extra: function () {
      return '<div class="desc" style="font-size:12px;color:var(--muted);margin-top:4px">見本は上の「喘ぎ声の調整」のいちばん下で、作風・口調・性別・夜の性格・場面を選んで出せます（この辞書の行も「利用者の辞書」と出ます）。住人ひとりの声は、上の「対象」でその住人を選んだ「喘ぎ」の「この住人の声を出してみる」で。</div>';
    }
  });
})();
