/* 箱庭シミュレーター: 箱庭のタグ（カードの札と、箱庭を選ぶ一覧の絞り込み。全年齢版・R18版共通。late）
   2026-11-07 の利用者の指示「箱庭についているタグを本体を含めて整理したい。全部を絞り込みに使えるタグにする。似たものは語を揃える。
   3P 可・4P 可は必ず示す。恋人推奨を足す。W デートは 4P とは別」で、肩見出しの分類（kicker）・人数・「関係が中心」などの対応機能の札・
   絞りの 5 分類（すべて／日常／極限／ひとり用／R-18 のみ）を、一つの語彙（下の DEF）にまとめた。設計と判定の根拠は docs/reports/2026-11-07/scen-tags.md。
   ・本体の箱庭のタグは下の TABLE に書く。追加パックの箱庭は自分のファイルで HK.ScenTags.add(id, [...])（本体に箱庭の id を書かない）。
     build が TABLE（パックは add した分）を目録の tags に写すので、まだ読み込んでいない箱庭も目録のタグで出せる（HK.Load.meta(id).tags）。
   ・箱庭の情報から決まるタグ（ひとりでも可＝最少 1 人・大人数＝上限 8 人以上・R18 専用・R18 の場面あり・全年齢でも可）は、表に書かずにここで決める。
   ・カード：必ず見せる札（恋人推奨・3P 可・4P 可・W デート）と形の札を肩の行に（keyHtml）、全部の札を説明の下に（html）。押すと説明（ui.js の data-act="ftag"）。
   ・絞り込み：複数選択の札（bar）。同じ段（形・人数・関係・内容…）の中はどれか一つに当たれば、段をまたぐと全部に当たる箱庭だけを出す（match）。
     PC の上の一覧（ui-box-list.js）とスマホの窓（#bxpick。ui-filter.js が札の行を置く）で同じ選択を使い、ブラウザに残す（鍵 hakoniwa:scentags）。
   ・R18 の語（3P 可・4P 可・合意なし・妊娠・モブとの夜・夜の温度・夜の性格・R18 の札）は r18 の印の中。全年齢モードでは出さない。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || (HK.ScenTags && HK.ScenTags.v === 2)) return;
  var TG = HK.ScenTags = { v: 2 };
  var esc0 = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  /* 段（絞り込みの見出し）。同じ段の中は「どれか」、段をまたぐと「全部」 */
  var GROUPS = [['kind', '形'], ['cast', '人数・組み合わせ'], ['rel', '関係'], ['ct', '内容'], ['len', '長さ'], ['set', '効く設定']];
  /* タグの定義（label は短く。desc は押したときの説明。key：カードの肩に必ず出す。r18：R18 モードだけ。top：絞り込みの最初の行に出す。as：同じ札として数える元の id） */
  var DEF = {
    daily: { g: 'kind', label: '日常', top: 1, desc: '恋愛や暮らしなど、日常の舞台の箱庭です（命がけの展開はありません）。' },
    extreme: { g: 'kind', label: '極限', top: 1, desc: 'サバイバル・ホラー・デスゲーム・冒険など、命がけの舞台の箱庭です。' },
    closed: { g: 'kind', label: '閉じ込め', desc: '部屋・ロッカー・館・島・船など、出られない場所に閉じ込められる箱庭です。' },
    relCore: { g: 'kind', label: '関係重視', desc: '設定した関係が出来事の中心になります。恋愛・嫉妬・仲良しの場面が多く出て、関係図も大きく動きます。' },
    horror: { g: 'kind', label: 'ホラー', desc: '怪異・ゾンビなど、怖さが中心の箱庭です（死・失踪の描写があります）。' },
    story: { g: 'kind', label: '出来事重視', desc: '物語の骨組み（探索・推理・番組の進行など）が決まっている箱庭です。設定した関係は初期値・呼び方と、ところどころの場面に効きます。関係の出来事が少なめなのは仕様です。' },
    solo1: { g: 'cast', label: 'ひとりでも可', top: 1, desc: '住人ひとりから遊べます（相手役はモブや仕掛けが受け持ちます）。' },
    duo: { g: 'cast', label: 'ふたり向け', top: 1, desc: '二人の関係をじっくり眺める作りの箱庭です（三人目・四人目を入れられる箱庭もあります）。' },
    crowd: { g: 'cast', label: '大人数', top: 1, desc: '8 人以上で遊べます。' },
    wdate: { g: 'cast', label: 'W デート', key: 1, top: 1, desc: '4 人のとき、二組のカップルで一緒に出かけるダブルデートになります（4 人の夜とは別の仕組みです）。' },
    lover: { g: 'rel', label: '恋人推奨', key: 1, top: 1, desc: '恋人・夫婦の二人で始めると本領の箱庭です（ほかの関係でも遊べますが、恋愛の結末や二人の場面が少なくなります）。' },
    jealous: { g: 'rel', label: '嫉妬・三角関係', desc: '嫉妬・三角関係・取り合いの出来事が起きます（三人以上で恋愛の矢印が重なったとき）。' },
    death: { g: 'ct', label: '死ネタあり', warn: 1, desc: '途中で死んだ人・連れ去られた人・いなくなった人は、その後の出来事に出ません（不具合ではありません）。「展開の重さ」を穏やかにすると起こりにくくなります。' },
    parody: { g: 'ct', label: 'パロディ', desc: '既存の作品や二次創作の設定を下敷きにしたパロディです（下敷きの作品は説明の注意書きに）。' },
    exit: { g: 'ct', label: '途中退場あり', warn: 1, desc: '先に脱出した人は、その後の出来事に出ません（不具合ではありません）。' },
    short: { g: 'len', label: '短時間', desc: '一晩・数時間・一回の番組など、一日のうちで終わる箱庭です。' },
    long: { g: 'len', label: '長期', desc: '月ごとに進み、一年ほどの長い時間を眺める箱庭です。' },
    job: { g: 'set', label: '職業', desc: '住人ごとに職業を選べます（おまかせは気質から決めます）。職業で出来事・台詞・結末が変わります。' },
    race: { g: 'set', label: '種族・体格', desc: '住人の「体と設定」の種族（獣人・吸血鬼・天使など）と体格が、二人の穏やかな場面に一文で出ます。決めていない人には何も付きません。' },
    undead: { g: 'set', label: '不死・吸血鬼', desc: '特殊役職「不死」と、種族「吸血鬼」が効きます。死んでも次の区切りに蘇り、吸血鬼は三日に一度、人の血を吸います。' },
    food: { g: 'set', label: '好物', desc: '「体と設定」の好きな食べ物・嫌いな食べ物が、食事・差し入れ・デートの場面に出ます。' },
    drink: { g: 'set', label: 'お酒', desc: '住人の「お酒の強さ」が、酒の席の出来事に効きます。' },
    birthday: { g: 'set', label: '誕生月', desc: 'プロフィールの誕生月に合わせて、誕生日の出来事が起きます。' },
    season: { g: 'set', label: '季節・行事', desc: '季節や月の行事（お花見・夏祭り・クリスマス・バレンタインなど）の出来事が起きます。' },
    will: { g: 'set', label: '心の強さ', desc: '「体と設定」の心の強さが、かかりやすさ・流されやすさに効きます。' }
  };
  /* r18:begin */
  DEF.p3 = { g: 'cast', label: '3P 可', key: 1, top: 1, r18: 1, desc: '三人の夜（3P）が起きる箱庭です。住人の「三人の場面（3P）：する／しない」と固定した相手で変わります。' };
  DEF.p4 = { g: 'cast', label: '4P 可', key: 1, top: 1, r18: 1, desc: '四人の夜（4P）が起きる箱庭です。性的に対象になる組がすべて恋人・夫婦など（互いに選び合った相手）のとき起きます。' };
  DEF.r18only = { g: 'ct', label: 'R18 専用', top: 1, r18: 1, desc: 'R18版にしかない、成人向けが中心の箱庭です。' };
  DEF.r18opt = { g: 'ct', label: 'R18 の場面あり', r18: 1, desc: '描写の設定しだいで R18 の場面が入る箱庭です（条件はカードの札に出ます）。' };
  DEF.allok = { g: 'ct', label: '全年齢でも可', r18: 1, desc: '全年齢版・全年齢モードでも遊べる箱庭です。' };
  DEF.force = { g: 'ct', label: '合意なしあり', r18: 1, desc: '内容のスイッチ「合意のない展開」（R18 が中心の箱庭では題材そのもの）で、合意のない場面が起きる箱庭です。' };
  DEF.preg = { g: 'ct', label: '妊娠の描写', r18: 1, desc: '内容のスイッチ「妊娠・孕む描写」を入れると、孕む・妊娠が分かる場面が起きる箱庭です。' };
  DEF.mobnight = { g: 'ct', label: 'モブとの夜', r18: 1, desc: '住人でない人物（モブ）との夜の場面があります。住人の「相手ごとの設定」の「モブには」と、「R18に参加しない」「性行為の相手の固定」で決まります。' };
  DEF.heat = { g: 'ct', label: '夜の温度', r18: 1, desc: '二人の関係とその日の気分で、夜の場面の温度（初々しい・甘い・じゃれ合い・ドライ・荒い・歪んだ）が決まり、きっかけ・抱き方・事後が変わる箱庭です。' };
  DEF.night = { g: 'set', label: '夜の性格', r18: 1, desc: '住人の「体と設定」の夜の性格（サド・マゾ・意地悪・甘々・恥じらい）が、夜の場面の文と抱き方に出ます。' };
  DEF.raceNight = { g: 'set', label: '種族・体格', as: 'race', r18: 1, desc: 'この箱庭では、種族・体格の一文は夜の場面にだけ出ます。' };
  DEF.will.desc = '「体と設定」の心の強さが、催眠のかかりやすさ・堕ちやすさに効きます（体が流されても心は折れない書き方になります）。';
  DEF.race.desc = '住人の「体と設定」の種族（獣人・吸血鬼・天使など）と体格が、二人の穏やかな場面と夜の場面に一文で出ます。決めていない人には何も付きません。';
  /* r18:end */
  TG.DEF = DEF; TG.GROUPS = GROUPS;
  /* 本体の箱庭（形・人数・関係・内容・長さ・効く設定の順。判定は設計書の表。R18 の語は全年齢版では DEF に無いので出ない） */
  var T = TG.TABLE = {};
  function put(id, s) { T[id] = s.split(' ').filter(function (k) { return DEF[k]; }); }   /* 全年齢版は R18 の語を表にも持たない */
  put('goukon', 'daily relCore jealous force preg short race night food drink');
  put('whiteroom', 'closed relCore p3 jealous death exit force preg short race night drink');
  put('futari', 'daily relCore duo p3 p4 jealous heat race night food season');
  put('classroom', 'daily relCore jealous long race food birthday season');
  put('island', 'extreme closed relCore jealous death force preg race night food');
  put('br', 'extreme relCore death parody race');
  put('trial', 'extreme relCore death parody race');
  put('zombie', 'extreme horror relCore jealous death force preg mobnight race night undead');
  put('omega', 'daily relCore jealous parody force preg mobnight long race night job food drink');
  put('ship', 'extreme closed story death force mobnight long race night undead food');
  put('jashin', 'extreme horror story death force preg mobnight short race night job undead food drink');
  put('yakata', 'extreme closed story p3 jealous death force mobnight race night undead');
  put('rpg', 'extreme story death race job undead');
  put('jinro', 'extreme story death force race night');
  put('locker', 'closed story p3 force mobnight short raceNight night');
  put('saimin', 'daily story duo force preg short raceNight will');
  put('massage', 'daily story duo force mobnight short raceNight');
  put('dungeon', 'extreme story p3 force mobnight short raceNight will');
  put('hole', 'closed story force mobnight short raceNight will');
  put('kaihen', 'daily story force mobnight short raceNight will');
  put('train', 'daily story duo mobnight heat short raceNight will');
  put('succubus', 'story force mobnight short raceNight');
  put('variety', 'story force short raceNight');
  /* 追加パックの箱庭：パックのファイルから。同じ id に何度呼んでも足すだけ（重なりは除く） */
  TG.add = function (id, list) {
    if (!id || !list) return;
    var cur = T[id] || (T[id] = []);
    [].concat(list).forEach(function (k) { if (k && DEF[k] && cur.indexOf(k) < 0) cur.push(k); });
  };

  /* ---------- 箱庭ごとのタグ ---------- */
  function meta(id) { return (HK.SCENARIOS && HK.SCENARIOS[id]) || (HK.Load && HK.Load.meta && HK.Load.meta(id)) || null; }
  function adultOf(s, id) {
    if (HK.SAFE_ON || !s) return false;
    return /R-?18/.test(s.kicker || '') || (s.env || []).some(function (e) { return e && (e.id === 'lewd' || /R-?18/.test(e.label || '')); }) || !!(((HK.ScenMeta || {}).r18plot || {})[id]);
  }
  var memo = {}, memoKey = '';
  function key0() { var n = 0; for (var k in T) n += T[k].length; return (HK.Load ? HK.Load.gen : 0) + '|' + !!HK.SAFE_ON + '|' + n; }
  /* 表示するタグの id の並び（DEF の順） */
  TG.ids = function (id) {
    var k = key0();
    if (k !== memoKey) { memo = {}; memoKey = k; }
    if (memo[id]) return memo[id];
    var s = meta(id), base = T[id] || (s && Array.isArray(s.tags) ? s.tags : []), have = {};
    base.forEach(function (x) { if (DEF[x]) have[x] = 1; });
    if (s) {
      var mn = s.minCast || 2, mx = Math.min(12, s.maxCast || 12), r18o = ((HK.ScenMeta || {}).r18only || []).indexOf(id) >= 0;
      if (mn <= 1) have.solo1 = 1;
      if (mx >= 8) have.crowd = 1;
      if (DEF.r18only && !HK.SAFE_ON) {
        if (r18o) have.r18only = 1;
        else { have.allok = 1; if (adultOf(s, id)) have.r18opt = 1; }
      }
    }
    return (memo[id] = ORDER().filter(function (x) { return have[x] && !(DEF[x].r18 && HK.SAFE_ON); }));
  };
  /* 並び：段の順（GROUPS）、段の中は DEF に書いた順（R18 の語は r18 の印の中で後から足すので、段ごとに並べ直す） */
  var ord = null;
  function ORDER() {
    if (!ord) { var ks = Object.keys(DEF), gi = function (k) { for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i][0] === DEF[k].g) return i; return 99; }; ord = ks.slice().sort(function (a, b) { return gi(a) - gi(b) || ks.indexOf(a) - ks.indexOf(b); }); }
    return ord;
  }
  function canon(x) { return (DEF[x] && DEF[x].as) || x; }
  TG.has = function (id, k) { return TG.ids(id).some(function (x) { return canon(x) === k; }); };
  /* 注意書きの札（ui.js の cardInfo。※死の描写・ホラー表現・パロディ）が、タグ（死ネタあり・ホラー・パロディ）と同じなら札を重ねない */
  TG.covers = function (id, note) { return (/死|殺/.test(note) && TG.has(id, 'death')) || (/ホラー/.test(note) && TG.has(id, 'horror')) || (/パロディ/.test(note) && TG.has(id, 'parody')); };
  /* 古い形（[{ k, label, desc }]） */
  TG.of = function (id) { return TG.ids(id).map(function (k) { return { k: k, label: DEF[k].label, desc: DEF[k].desc }; }); };

  /* ---------- カードの中身 ---------- */
  /* 肩の行：必ず見せる札（W デート・恋人推奨・3P 可・4P 可）と、形の札（日常・極限・閉じ込めのうち一つと、関係重視／出来事重視） */
  TG.keyHtml = function (id, esc) {
    esc = esc || esc0;
    var ids = TG.ids(id), kind = ids.filter(function (x) { return x === 'daily' || x === 'extreme' || x === 'closed'; }).slice(0, 1).concat(ids.filter(function (x) { return x === 'relCore' || x === 'story'; }));
    return ids.filter(function (x) { return DEF[x].key; }).map(function (x) { return '<span class="sck hot" title="' + esc(DEF[x].desc) + '">' + esc(DEF[x].label) + '</span>'; }).join('') +
      kind.map(function (x) { return '<span class="sck">' + esc(DEF[x].label) + '</span>'; }).join('');
  };
  /* 全部の札（選んだ箱庭のカード・窓の右の説明・窓のカード）。pre は先頭に足す札 [{ html, text, title, warn }]（R18 の描写の条件・注意書き）。
     選んでいないカードはタグを 1 行だけ見せる：いちばん狭いカード（190px）の 1 行に入る数を字数から見積もり、残りは「+n」の札にまとめる */
  var FIT = 158;
  function est(text) { var w = 16; for (var i = 0; i < text.length; i++) w += text.charCodeAt(i) < 0x7f ? 6.3 : 10.5; return w; }
  TG.html = function (id, esc, pre) {
    esc = esc || esc0;
    var items = (pre || []).map(function (p) { return { html: p.html, title: p.title, warn: p.warn, k: 'note', w: est(p.text || '') + (p.extra || 0) }; })
      .concat(TG.ids(id).map(function (k) { var d = DEF[k]; return { html: esc(d.label), title: d.desc, warn: !!d.warn, hot: !!d.key, k: k, w: est(d.label) }; }));
    if (!items.length) return '';
    var n = items.length, used = 0, fit = 0;
    for (var i = 0; i < n; i++) {
      var w = items[i].w + (i ? 4 : 0), more = i < n - 1 ? 4 + est('+' + (n - i - 1)) : 0;
      if (i && used + w + more > FIT) break;
      used += w; fit = i + 1;
    }
    return '<div class="tags">' + items.map(function (t, j) {
      return '<span class="ftag' + (t.warn ? ' warn' : '') + (t.hot ? ' hot' : '') + (j >= fit ? ' tx' : '') + '" data-act="ftag" data-k="' + t.k + '" title="' + esc(t.title || '') + '" role="button" tabindex="0">' + t.html + '</span>';
    }).join('') + (fit < n ? '<span class="ftag ftmore" aria-hidden="true">+' + (n - fit) + '</span>' : '') + '</div>';
  };

  /* ---------- 絞り込み ---------- */
  var SK = HK.STORE && HK.STORE.key ? HK.STORE.key : function (k) { return k; };
  var KEY = SK('hakoniwa:scentags'), st = { sel: [], more: false };
  try {
    var sv = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (sv && Array.isArray(sv.sel)) { st.sel = sv.sel.filter(function (x) { return typeof x === 'string'; }); st.more = sv.more === true; }
    else {
      /* 前の版の絞り（PC の一覧の分類。hakoniwa:boxlist の cat）を一度だけ写す */
      var ov = JSON.parse(localStorage.getItem(SK('hakoniwa:boxlist')) || 'null'), mp = { daily: 'daily', extreme: 'extreme', solo: 'solo1', r18: 'r18only' };
      if (ov && mp[ov.cat]) st.sel = [mp[ov.cat]];
    }
  } catch (e) { /* 読めなければ既定 */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 残せなくても使える */ } }
  function selNow() { return st.sel.filter(function (x) { return DEF[x] && !DEF[x].as && !(DEF[x].r18 && HK.SAFE_ON); }); }
  TG.sel = selNow;
  /* 選んだ札に当たるか（同じ段の中はどれか、段をまたぐと全部） */
  TG.match = function (id) {
    var sel = selNow();
    if (!sel.length) return true;
    var ids = TG.ids(id).map(canon), by = {};
    sel.forEach(function (x) { (by[DEF[x].g] = by[DEF[x].g] || []).push(x); });
    return Object.keys(by).every(function (g) { return by[g].some(function (x) { return ids.indexOf(x) >= 0; }); });
  };
  /* 札の行の HTML（list：数える箱庭の並び） */
  TG.bar = function (list) {
    list = list || [];
    var sel = selNow(), cnt = {}, shown = 0;
    list.forEach(function (id) { TG.ids(id).forEach(function (x) { x = canon(x); cnt[x] = (cnt[x] || 0) + 1; }); if (TG.match(id)) shown++; });
    var chip = function (x) {
      return '<button type="button" class="sctc' + (DEF[x].key ? ' hot' : '') + '" data-sctf="' + x + '" aria-pressed="' + (sel.indexOf(x) >= 0) + '" title="' + esc0(DEF[x].desc) + '">' + esc0(DEF[x].label) + '<span class="fn">' + (cnt[x] || 0) + '</span></button>';
    };
    var real = function (x) { return !DEF[x].as && !(DEF[x].r18 && HK.SAFE_ON) && (cnt[x] || sel.indexOf(x) >= 0); };
    var top = ORDER().filter(function (x) { return real(x) && (DEF[x].top || sel.indexOf(x) >= 0); });
    var rows = GROUPS.map(function (g) {
      var ks = ORDER().filter(function (x) { return real(x) && DEF[x].g === g[0]; });
      return ks.length ? '<div class="sctg" role="group" aria-label="' + g[1] + '"><span class="sctgh">' + g[1] + '</span>' + ks.map(chip).join('') + '</div>' : '';
    }).join('');
    /* 「ほかのタグ」は「すべて」のすぐ後ろ（スマホの横に流れる行でも、最初に見える） */
    return '<div class="sctf"><div class="sctm" role="group" aria-label="タグで絞り込む"><button type="button" class="sctc sctall" data-sctf-clr aria-pressed="' + !sel.length + '">すべて<span class="fn">' + list.length + '</span></button>' +
      '<button type="button" class="sctmore" data-sctf-more aria-expanded="' + st.more + '">' + (st.more ? 'タグを閉じる' : 'ほかのタグ') + '</button>' + top.map(chip).join('') +
      (sel.length ? '<span class="sctn" aria-live="polite">' + (shown ? shown + '件' : '当てはまる箱庭がありません') + '</span>' : '') + '</div>' +
      '<div class="scta"' + (st.more ? '' : ' hidden') + '>' + rows + '<p class="sctnote">同じ段の札はどれかに当たるもの、段をまたぐと全部に当たるものを出します。</p></div></div>';
  };
  /* 選択を変えたら：PC の一覧と窓の札の行・カードを合わせる */
  TG.apply = function () {
    if (HK.BoxList && HK.BoxList.apply) HK.BoxList.apply();
    if (HK.ScenFilter && HK.ScenFilter.sync) HK.ScenFilter.sync();
  };
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest('[data-sctf],[data-sctf-clr],[data-sctf-more]');
    if (!t) return;
    var box = t.closest('.bxlist,.bxpick'), q = t.hasAttribute('data-sctf') ? '[data-sctf="' + t.getAttribute('data-sctf') + '"]' : t.hasAttribute('data-sctf-clr') ? '[data-sctf-clr]' : '[data-sctf-more]';
    if (t.hasAttribute('data-sctf-more')) st.more = !st.more;
    else if (t.hasAttribute('data-sctf-clr')) st.sel = [];
    else { var k = t.getAttribute('data-sctf'), i = st.sel.indexOf(k); if (i >= 0) st.sel.splice(i, 1); else st.sel.push(k); }
    save(); TG.apply();
    /* 描き直した行で、押した札にフォーカスを戻す */
    var f = box && box.querySelector(q);
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
  });

  /* ---------- 見た目（札・絞り込みの行。色は画面の色の鍵なので、ダークでもそのまま） ---------- */
  var V = '#view-box';
  var css =
    '.scen .k:has(.sck),' + V + ' .bxk:has(.sck){flex-wrap:wrap;white-space:normal;row-gap:3px}' +
    '.scen .k .kt.sckr{overflow:visible;text-transform:none;letter-spacing:0}' +
    '.sckr{display:inline-flex;flex-wrap:wrap;gap:3px;align-items:center}.sckr:empty{display:none}' +
    '.sck{display:inline-block;padding:0 6px;border:1px solid var(--ui-line2,var(--line2,#ccc));border-radius:9px;font-size:10.5px;line-height:16px;font-weight:400;letter-spacing:0;color:var(--ui-muted,var(--muted2));background:var(--ui-card,var(--paper));white-space:nowrap;font-family:inherit}' +
    '.sck.hot{border-color:var(--ui-hot-line,var(--ink));background:var(--ui-hot-soft,var(--paper));color:var(--ui-ink,var(--ink));font-weight:700}' +
    V + ' .bxlk.sckr{white-space:normal;overflow:visible;display:flex}' +
    '.scen .ftag.hot,' + V + ' .bxsel .ftag.hot,' + V + ' .bxpick-s .ftag.hot{border-color:var(--ui-hot-line,var(--ink));color:var(--ui-ink,var(--ink));font-weight:700}' +
    /* 選んだ箱庭のカード・窓の右の説明は札を全部出すので「+n」は出さない。スマホの説明の板にも札を出す（PC の右の説明と同じ） */
    V + ' .bxsel .ftmore,' + V + ' .bxpick-s .ftmore{display:none!important}' +
    V + ' .bxkick{margin-right:.6em;font-weight:700;font-size:.92em;color:var(--ui-muted,var(--muted))}' +
    /* 絞り込みの行（PC の一覧・窓） */
    '.sctf{display:flex;flex-direction:column;gap:8px;min-width:0;flex:1 1 100%}' +
    '.sctm{display:flex;flex-wrap:wrap;align-items:center;gap:6px}' +
    '.sctc,.sctmore{height:32px;padding:0 12px;border:1px solid var(--ui-line2,var(--line2));border-radius:16px;background:var(--ui-card,var(--paper));color:var(--ui-ink,var(--ink));font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}' +
    '.sctc:hover,.sctmore:hover{border-color:var(--ui-ink,var(--ink))}' +
    '.sctc.hot{border-color:var(--ui-hot-line,var(--ui-line2))}' +
    '.sctc[aria-pressed="true"]{border-color:var(--ui-primary,var(--ink));background:var(--ui-primary,var(--ink));color:var(--ui-primary-ink,var(--paper));font-weight:700}' +
    '.sctc .fn{margin-left:4px;font-size:11px;opacity:.8;font-family:var(--f-num,inherit)}' +
    '.sctmore{border-style:dashed;color:var(--ui-muted,var(--muted))}' +
    '.sctc:focus-visible,.sctmore:focus-visible{outline:2px solid var(--ui-accent2,var(--ink));outline-offset:2px}' +
    '.sctn{font-size:12px;color:var(--ui-muted,var(--muted))}' +
    '.scta[hidden]{display:none}.scta{display:flex;flex-direction:column;gap:6px;padding:8px 0 2px;border-top:1px dashed var(--ui-line,var(--line))}' +
    '.sctg{display:flex;flex-wrap:wrap;align-items:center;gap:6px}' +
    '.sctgh{flex:0 0 9.5em;font-size:11.5px;font-weight:700;color:var(--ui-muted,var(--muted))}' +
    '.sctnote{margin:2px 0 0;font-size:11px;color:var(--ui-muted,var(--muted))}' +
    V + ' .bxlf.sctw{flex:1 1 100%;display:block;order:5}' +
    V + ' .bxpick .scfilt{display:block;overflow:visible}' +
    '@media (max-width:600px){' + V + ' .bxpick-s .tags{display:flex;gap:4px}' + V + ' .bxpick-s .ftag{font-size:11px;padding:1px 8px}' + V + ' .bxpick .scfilt{max-height:46vh;overflow-y:auto}.sctm{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.sctm::-webkit-scrollbar{display:none}.sctc,.sctmore{flex:0 0 auto;height:34px}.sctgh{flex:1 1 100%}}';
  var el = document.createElement('style'); el.id = 'scen-tags'; el.textContent = css; document.head.appendChild(el);
})();
