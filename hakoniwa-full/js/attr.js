/* 箱庭シミュレーター: 住人の共通の属性（体格・胸・種族・夜の性格・心の強さ・同一人物）（全年齢版・R18版共通。pos.js の直後に読む）
   住人の設定（⚙️）の「体と設定」で決め、どの箱庭でも同じに効く。箱庭ごとの役（perFields）とは別の、住人そのものの見た目・性格。
   ・build 体格：''（おまかせ＝ふつう扱い）／small 小柄／avg ふつう／large 大柄。二人の差で文を差し替える（HK.Attr.sizeDiff）
   ・bust 胸（R18版・女性だけ）：''／s 控えめ／m ふつう／l 豊か。R18 の地の文の差し替え語（HK.Attr.bustWord）
   ・race 種族：''（人間）／human／vampire 吸血鬼／beast 獣人／demon 魔族／angel 天使／ghost 幽霊／other その他（raceNote に自由記入）。
     文の飾り（耳・尾・牙・翼）。死のある箱庭の「特殊役職：吸血鬼」と同じ扱いにする（special.js の SP.setup。両方が吸血鬼でも一人分）
   ・night 夜の性格（R18版だけ）：''（おまかせ＝気質から）／sadist サド／maso マゾ／mean 意地悪／sweet 甘々／shy 恥じらい／none 表と同じ。
     nightFor { 相手の番号: night } があれば、その相手にはそちらを優先する。R18 の山場の型（style）より優先する（attr-r18.js）。
     maso は受け攻めを変えない（攻め指定が優先。受けに回ったときの崩れ方だけを変える）。全年齢では無視する
   ・will 心の強さ：''／weak 弱い／avg ふつう／strong 強い。快楽堕ち・催眠・常識改変・遮断穴の「堕ちる」判定に掛ける（HK.Attr.willK）。
     strong は体が堕ちても心は折れない文を添える（HK.Attr.hold）
   ・same 同一人物：相手の番号。二人は恋愛・R18にしない（HK.ngPair・住人の ng に足す）。「鏡を見るような」共通の場面 3 本と、結果の関係名「もう一人の自分」
   画面の欄（ui.js の mk・normChar・rosterJSON・import・buildInput、ui-gear.js の描画と入力）は、ここの関数を呼ぶだけにしてある。
   実行時の住人への写しは HK.charFlags（engine.js）から HK.Attr.copy を一度だけ呼ぶ（エンジン・物語型・SoloKit・ダンジョン・穴で共通）。
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var A = HK.Attr = {};
  A.BUILD = [['', 'おまかせ'], ['small', '小柄'], ['avg', 'ふつう'], ['large', '大柄']];
  A.BUST = [['', 'おまかせ'], ['s', '控えめ'], ['m', 'ふつう'], ['l', '豊か']];
  A.RACE = [['', 'おまかせ（人間）'], ['human', '人間'], ['vampire', '吸血鬼'], ['beast', '獣人'], ['demon', '魔族'], ['angel', '天使'], ['ghost', '幽霊'], ['other', 'その他']];
  A.NIGHT = [['', 'おまかせ（気質から）'], ['sadist', 'サド'], ['maso', 'マゾ'], ['mean', '意地悪'], ['sweet', '甘々'], ['shy', '恥じらい'], ['none', '表と同じ']];
  A.WILL = [['', 'おまかせ'], ['weak', '弱い'], ['avg', 'ふつう'], ['strong', '強い']];
  function has(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return true; return false; }
  function val(list, v) { v = v == null ? '' : String(v); return has(list, v) ? v : ''; }
  function lab(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return list[i][1]; return ''; }
  function note(v) { return typeof v === 'string' ? v.replace(/[「」『』{}<>]/g, '').trim().slice(0, 12) : ''; }
  A.label = function (k, v) { return lab({ build: A.BUILD, bust: A.BUST, race: A.RACE, night: A.NIGHT, will: A.WILL }[k] || [], v); };
  var SIMPLE = ['build', 'bust', 'race', 'night', 'will'];
  function listOf(k) { return { build: A.BUILD, bust: A.BUST, race: A.RACE, night: A.NIGHT, will: A.WILL }[k]; }

  /* ---------- 画面の住人（S.chars。相手は id で持つ） ---------- */
  /* ui.js mk：写すときにこの欄も写す */
  A.mk = function (o, c) {
    c = c || {};
    SIMPLE.forEach(function (k) { o[k] = val(listOf(k), c[k]); });
    o.raceNote = note(c.raceNote);
    o.nightFor = c.nightFor && typeof c.nightFor === 'object' ? JSON.parse(JSON.stringify(c.nightFor)) : {};
    o.same = typeof c.same === 'string' ? c.same : '';
    return o;
  };
  /* ui.js normChar：値を確かめる */
  A.norm = function (c) {
    SIMPLE.forEach(function (k) { c[k] = val(listOf(k), c[k]); });
    c.raceNote = note(c.raceNote);
    var nf = {};
    if (c.nightFor && typeof c.nightFor === 'object') Object.keys(c.nightFor).forEach(function (k) { var v = val(A.NIGHT, c.nightFor[k]); if (v) nf[k] = v; });
    c.nightFor = nf;
    c.same = typeof c.same === 'string' ? c.same : '';
    return c;
  };
  /* ui.js normRefs：今いる住人だけに絞る（同一人物は両方に書く） */
  A.normRefs = function (c, ids, list) {
    if (!ids[c.same] || c.same === c.id) c.same = '';
    Object.keys(c.nightFor || {}).forEach(function (k) { if (!ids[k] || k === c.id) delete c.nightFor[k]; });
    if (c.same && list) list.forEach(function (o) { if (o.id === c.same && !o.same) o.same = c.id; });
  };
  /* ui.js rosterJSON：書き出し（相手は ref で番号に） */
  A.exportTo = function (o, c, ref) {
    SIMPLE.forEach(function (k) { if (c[k]) o[k] = c[k]; });
    if (c.raceNote) o.raceNote = c.raceNote;
    if (c.same && ref(c.same) != null) o.same = ref(c.same);
    if (c.nightFor) { var nf = {}; Object.keys(c.nightFor).forEach(function (k) { if (ref(k) != null && c.nightFor[k]) nf[ref(k)] = c.nightFor[k]; }); if (Object.keys(nf).length) o.nightFor = nf; }
    return o;
  };
  /* ui.js importJSON：読み込み（相手は全員を読んだあとで A.importRefs） */
  A.importFrom = function (c, o) {
    SIMPLE.forEach(function (k) { if (o[k] != null) c[k] = val(listOf(k), o[k]); });
    if (o.raceNote != null) c.raceNote = note(String(o.raceNote));
    c._atSame = o.same; c._atNf = o.nightFor;
  };
  A.importRefs = function (c, ref) {
    if (c._atSame != null && c._atSame !== '') { var s = ref(c._atSame); c.same = s && s !== c.id ? s : ''; }
    if (c._atNf && typeof c._atNf === 'object') { c.nightFor = c.nightFor || {}; Object.keys(c._atNf).forEach(function (k) { var id = ref(k), v = val(A.NIGHT, c._atNf[k]); if (id && id !== c.id && v) c.nightFor[id] = v; }); }
    delete c._atSame; delete c._atNf;
  };
  /* ui.js buildInput：シミュレーションへ渡す（相手は箱庭に出る人の番号に） */
  A.toInput = function (o, c, ids) {
    SIMPLE.forEach(function (k) { if (c[k]) o[k] = c[k]; });
    if (c.raceNote) o.raceNote = c.raceNote;
    var si = c.same ? ids.indexOf(c.same) : -1;
    if (si >= 0) o.same = si;
    if (c.nightFor) { var nf = {}, n = 0; Object.keys(c.nightFor).forEach(function (k) { var i = ids.indexOf(k); if (i >= 0 && c.nightFor[k]) { nf[i] = c.nightFor[k]; n++; } }); if (n) o.nightFor = nf; }
    return o;
  };
  /* ui-gear.js：住人の行の要約に足す */
  A.summary = function (c, byId) {
    var bits = [];
    if (c.build) bits.push('体格：' + lab(A.BUILD, c.build));
    if (!HK.SAFE_ON && c.bust && c.gender === 'f') bits.push('胸：' + lab(A.BUST, c.bust));
    if (c.race && c.race !== 'human') bits.push('種族：' + lab(A.RACE, c.race) + (c.raceNote ? '（' + c.raceNote + '）' : ''));
    if (!HK.SAFE_ON && c.night) bits.push('夜：' + lab(A.NIGHT, c.night));
    if (c.will) bits.push('心の強さ：' + lab(A.WILL, c.will));
    var sm = c.same && byId(c.same);
    if (sm) bits.push('同一人物：' + sm.name);
    return bits;
  };
  /* ui-gear.js：「体と設定」の折りたたみ節。h = { esc, opt, selOf }。R18版だけの欄（胸・夜の性格・相手ごとの夜の性格）は濁点喘ぎと同じく SAFE_ON で隠す */
  var openNow = false;
  if (typeof document !== 'undefined' && document.head) { var st = document.createElement('style'); st.textContent = 'details.gattr{margin:8px 0 0;border:1px solid var(--line);border-radius:8px;padding:6px 10px}details.gattr summary{cursor:pointer;font-size:13px;color:var(--muted)}details.gattr .gakn{font-size:12px;margin-left:4px;color:var(--ink)}details.gattr[open] summary{margin-bottom:4px}'; document.head.appendChild(st); }
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('toggle', function (e) { if (e.target && e.target.classList && e.target.classList.contains('gattr')) openNow = e.target.open; }, true);
  A.gearHtml = function (c, others, h) {
    var esc = h.esc, sel = function (k) { return h.selOf('at_' + k, listOf(k), c[k] || ''); };
    var n = A.summary(c, function (id) { return others.filter(function (o) { return o.id === id; })[0]; }).length;
    var nf = !HK.SAFE_ON && others.length ? '<div class="gearrow"><span class="gearhint" style="flex:1 1 100%;margin:0">相手ごとの夜の性格（決めた相手には、上の夜の性格よりこちらを優先します）</span>' + others.map(function (o) {
      return '<label>' + esc(o.name) + 'には <select data-gf="at_nf" data-o="' + esc(o.id) + '" aria-label="' + esc(o.name) + 'への夜の性格">' + A.NIGHT.map(function (x) { return h.opt(x[0], x[0] ? x[1] : '上と同じ', (c.nightFor || {})[o.id] || ''); }).join('') + '</select></label>';
    }).join('') + '</div>' : '';
    var same = others.length ? '<label title="別の世界・別の時間の同じ人のように扱います。二人は恋愛・R18にならず、鏡を見るような場面が起きます">同一人物 <select data-gf="at_same" aria-label="同一人物"><option value="">なし</option>' + others.map(function (o) { return h.opt(o.id, o.name, c.same || ''); }).join('') + '</select></label>' : '';
    return '<details class="gattr"' + (openNow ? ' open' : '') + '><summary>体と設定 <span class="gakn">' + (n ? n + '件' : 'なし') + '</span></summary>' +
      '<div class="gearrow"><label title="二人の体格の差で、見上げる・抱き上げるといった文が変わります">体格 ' + sel('build') + '</label>' +
      (!HK.SAFE_ON && c.gender === 'f' ? '<label title="R18の場面の地の文で、胸の書き方が変わります">胸 ' + sel('bust') + '</label>' : '') +
      '<label title="耳・尾・牙・翼などの文の飾りが付きます。死のある箱庭では、吸血鬼は特殊役職の吸血鬼と同じ扱いになります">種族 ' + sel('race') + '</label>' +
      (c.race === 'other' ? '<label>種族の名前 <input type="text" data-gf="at_raceNote" value="' + esc(c.raceNote || '') + '" maxlength="12" placeholder="例：人魚" style="width:7em"></label>' : '') +
      (!HK.SAFE_ON ? '<label title="R18の場面での振る舞い。作風（山場の書き方）より優先します。マゾは受け攻めを変えません（攻めを選んだ人は攻めのまま）">夜の性格 ' + sel('night') + '</label>' : '') +
      '<label title="快楽堕ち・催眠・常識改変・感覚遮断穴などで、堕ちやすさが変わります。強いと、体は流されても心は折れません">心の強さ ' + sel('will') + '</label>' + same + '</div>' + nf + '</details>';
  };
  /* ui-gear.js の入力：この欄なら処理して true を返す。changed(rerender) は ui-gear.js の保存 */
  A.gearField = function (c, f, t, isInput, changed, byId) {
    if (!/^at_/.test(f || '')) return false;
    var k = f.slice(3);
    if (k === 'raceNote') { c.raceNote = note(t.value); changed(false); return true; }
    if (isInput) return true;
    if (listOf(k)) { c[k] = val(listOf(k), t.value); changed(k === 'race' || k === 'night'); return true; }
    if (k === 'nf') { c.nightFor = c.nightFor || {}; var v = val(A.NIGHT, t.value); if (v) c.nightFor[t.dataset.o] = v; else delete c.nightFor[t.dataset.o]; changed(false); return true; }
    if (k === 'same') {
      var old = c.same && byId(c.same), o = t.value && byId(t.value);
      if (old && old.same === c.id) old.same = '';
      if (o && o.same) { var o2 = byId(o.same); if (o2 && o2.same === o.id) o2.same = ''; }
      c.same = o ? o.id : '';
      if (o) o.same = c.id;
      changed(true); return true;
    }
    return true;
  };

  /* ---------- 実行時の住人（相手は番号 i で持つ） ---------- */
  /* src = input.chars[i]（画面から渡った住人）、dst = 箱庭の住人。値のある欄だけ写す（何も決めていない人は、これまでと同じ住人のまま） */
  A.copy = function (dst, src) {
    if (!dst || !src) return dst;
    var b = val(A.BUILD, src.build), r = val(A.RACE, src.race), w = val(A.WILL, src.will);
    if (b) dst.build = b;
    if (r) { dst.race = r; if (r === 'other' && note(src.raceNote)) dst.raceNote = note(src.raceNote); }
    if (w) dst.will = w;
    if (!HK.SAFE_ON) {
      var bu = val(A.BUST, src.bust), nt = val(A.NIGHT, src.night);
      if (bu) dst.bust = bu;
      if (nt) dst.night = nt;
      if (src.nightFor && typeof src.nightFor === 'object') {
        var nf = null;
        Object.keys(src.nightFor).forEach(function (k) { var v = val(A.NIGHT, src.nightFor[k]); if (v && /^\d+$/.test(k)) (nf = nf || {})[+k] = v; });
        if (nf) dst.nightFor = nf;
      }
    }
    var sm = src.same;
    if (sm !== '' && sm != null && !isNaN(+sm) && +sm >= 0 && +sm !== dst.i) {
      dst.same = +sm;
      /* 恋愛・R18にしない相手（engine.js の ngPairHard・ngExplicit・sexBlocked が読む ng）にも足す */
      dst.ng = Array.isArray(dst.ng) ? dst.ng : [];
      if (dst.ng.indexOf(+sm) < 0) dst.ng.push(+sm);
    }
    return dst;
  };
  function isRes(c) { return !!c && typeof c.i === 'number'; }
  /* 同一人物の二人か（どちらに書かれていても） */
  A.samePair = function (a, b) { return !!(isRes(a) && isRes(b) && a !== b && ((a.same != null && a.same === b.i) || (b.same != null && b.same === a.i))); };
  /* 夜の性格：a が b に向けるもの（相手ごとの指定が優先。'none'＝表と同じは '' と同じ扱い）。全年齢では常に '' */
  A.nightOf = function (a, b) {
    if (HK.SAFE_ON || !a) return '';
    var v = (isRes(b) && a.nightFor && a.nightFor[b.i]) || a.night || (a.src && a.src.night) || '';
    return v === 'none' ? '' : v;
  };
  /* 山場の型（thick-sex.js などの style）：夜の性格があれば、気質から決めた型より優先する */
  A.STYLE = { sadist: 'rough', mean: 'tease', sweet: 'gentle', shy: 'clumsy' };
  A.styleFor = function (night, base) { return A.STYLE[night] || base; };
  /* 第二性（オメガバースの c.om.sex。ほかの箱庭では ''。将来の Dom/Sub などは c.attr.second に足す） */
  A.second = function (c) { return (c && c.om && c.om.sex) || (c && c.attr && c.attr.second) || ''; };
  A.raceOf = function (c) { var r = c && (c.race || (c.src && c.src.race)); return r && r !== 'human' ? r : ''; };
  A.isVampire = function (c) { return A.raceOf(c) === 'vampire'; };
  /* 体格の差：'a>b'（a のほうが大きい）／'b>a'／''。おまかせはふつうとして比べる。二人とも決めていなければ '' */
  var RANK = { small: 0, avg: 1, large: 2 };
  A.sizeDiff = function (a, b) {
    if (!a || !b || (!a.build && !b.build)) return '';
    var x = RANK[a.build] != null ? RANK[a.build] : 1, y = RANK[b.build] != null ? RANK[b.build] : 1;
    return x > y ? 'a>b' : y > x ? 'b>a' : '';
  };
  /* 胸の差し替え語（R18版・女性だけ。決めていなければ ''） */
  A.BUST_WORD = { s: L('控えめな胸|小ぶりな胸|慎ましい胸'), m: L('形のいい胸|柔らかな胸|手に馴染む胸'), l: L('豊かな胸|たわわな胸|大きな胸') };
  A.bustWord = function (c, pick) {
    if (HK.SAFE_ON || !c || !c.bust || !HK.Pos || !HK.Pos.isFBody(c)) return '';
    var l = A.BUST_WORD[c.bust]; if (!l) return '';
    return pick ? pick(l) : l[0];
  };
  /* 心の強さ：堕ちる速さの倍率（弱い 1.3・強い 0.7） */
  A.willK = function (c) { var w = c && c.will; return w === 'weak' ? 1.3 : w === 'strong' ? 0.7 : 1; };
  A.strong = function (c) { return !!c && c.will === 'strong'; };
  /* 結末の状態（遮断穴など）：強い人は「堕ちた」を「崩れ落ちた」（心は折れない）にし、弱い人は堕ち度 77 から「堕ちた」にする。o = { fall: [堕ちた状態], down: 崩れた状態 } */
  A.fallState = function (h, st, o) {
    if (!h || !h.will) return st;
    if (A.strong(h) && o.fall.indexOf(st) >= 0) { h.willHeld = true; return o.down; }
    if (h.will === 'weak' && st === o.down && (h.corrupt || 0) >= 77) return o.fall[0];
    return st;
  };
  /* 心の強さを 0〜1 の意志に足す分（ダンジョンの will()）：弱い −0.2・強い +0.2 */
  A.willAdd = function (c) { var w = c && c.will; return w === 'weak' ? -0.2 : w === 'strong' ? 0.2 : 0; };

  /* ---------- 文の飾り（種族・体格）。{c} はその人、{note} はその他の種族の名前 ---------- */
  /* kind：touch（体の感触）／look（ふだんの見た目・仕草）／hold（抱き寄せる・抱き上げる） */
  var RACE_FL = {
    touch: {
      vampire: L('{c}の肌はひんやりとしていて、触れたところから少しずつ温もりを移されていった。|{c}の唇の端から、小さな牙がのぞいた。噛みつく代わりに、{c}はそこへ口づけだけを落とした。|{c}の赤い瞳が、薄暗がりの中でかすかに光っていた。'),
      beast: L('{c}の耳がぴくりと震え、尻尾が落ち着きなく揺れた。|{c}の尻尾が、無意識のうちに{o}の脚へ絡みついた。|{c}の耳の付け根に指が触れると、{c}は喉の奥で小さく鳴いた。'),
      demon: L('{c}の角の根元に指が触れると、{c}は小さく肩を跳ねさせた。|{c}の細い尾が、熱に浮かされたように{o}の腰に巻きついた。|{c}の瞳孔が、獣のように細く絞られた。'),
      angel: L('{c}の背の白い羽が、ひとひら、ふたひら、敷布に落ちた。|{c}の翼が、{o}を包み込むように大きく広がった。|{c}の羽の付け根を撫でられて、{c}の背中がふるりと震えた。'),
      ghost: L('{c}の体は、触れるたびにほんの少し透けて、また輪郭を取り戻した。|{c}の指先は冷たく、それでいて確かにそこにあった。|{c}の吐息だけが、不思議なほど温かかった。'),
      other: L('{c}の体には、{note}ならではの手触りがあった。|触れるたびに、{c}の{note}らしい体が小さく応えた。|{c}は{note}らしいしぐさで、{o}の手に身をすり寄せた。')
    },
    look: {
      vampire: L('{c}は日の差し込む窓辺を避けて、影のほうに腰を下ろした。|{c}が笑うと、口元に小さな牙がのぞいた。|{c}の赤い瞳が、灯りを映してきらりと光った。'),
      beast: L('{c}の耳が、話し声のするほうへぴくりと向いた。|{c}の尻尾が、機嫌よさそうにゆらゆらと揺れていた。|{c}は鼻をひくつかせて、遠くの匂いを確かめていた。'),
      demon: L('{c}は角が引っかからないよう、少し首を傾けて戸口をくぐった。|{c}の細い尾が、話の合間に床をとんと叩いた。|{c}の影は、灯りの加減でほんの少しだけ大きく見えた。'),
      angel: L('{c}の背の翼が、ふわりと畳まれた。|{c}が身じろぎすると、白い羽が一枚、ひらりと舞った。|{c}のまわりだけ、空気が少し明るく見えた。'),
      ghost: L('{c}の足元は、光の加減で少しだけ透けて見えた。|{c}は気づくと、音もなくすぐそばに立っていた。|{c}の座った椅子は、まったく軋まなかった。'),
      other: L('{c}の{note}らしい仕草に、思わず目が留まった。|{c}は{note}らしく、少し変わった癖で身なりを整えた。|{c}の{note}らしい姿は、どこにいても目を引いた。')
    },
    hold: {
      vampire: L('{c}の腕はひんやりとしていたが、抱き寄せる力は優しかった。|{c}は{o}の首筋に顔を寄せ、牙を立てずに、ただ脈の音を聞いていた。|{c}の冷たい胸に、{o}の体温が少しずつ移っていった。'),
      beast: L('{c}の尻尾が、ふわりと{o}の腰に巻きついた。|{c}は{o}の肩口に鼻先をうずめて、匂いを確かめるように深く息を吸った。|{c}の耳が、抱き寄せた{o}の頬をくすぐった。'),
      demon: L('{c}の尾が、離さないとでも言うように{o}の足首に絡んだ。|{c}は角が当たらないよう、少し首を傾けて{o}を抱き寄せた。|{c}の腕の中は、思いのほか熱かった。'),
      angel: L('{c}は翼を広げて、{o}をすっぽりと包み込んだ。|{c}の羽が、抱き寄せた{o}の背中をやわらかく撫でた。|{c}の翼の内側は、陽だまりのように温かかった。'),
      ghost: L('{c}の腕は、抱き寄せるたびにほんの少しだけ透けた。|{c}は確かめるように、{o}の背中に何度も手を当て直した。|{c}の抱擁は、冷たいのにどこか懐かしかった。'),
      other: L('{c}の{note}らしい体が、{o}をそっと包んだ。|{c}は{note}らしい力加減で、{o}を抱き寄せた。|{c}の腕の中には、{note}ならではのぬくもりがあった。')
    }
  };
  /* 体格の差（{L} 大きいほう、{S} 小さいほう）。touch・hold は {a}＝主導する側（攻め）・{b}＝受ける側で、向きを分けて書く */
  var SIZE_FL = {
    touch: {
      big: L('体格の差で、{b}の体は{a}の腕の中にすっぽりと収まった。|{a}の大きな掌が、{b}の背中をほとんど覆ってしまった。|{a}は{b}の小さな体を、壊れものを扱うように抱き寄せた。'),
      small: L('{a}は自分よりずっと大きな{b}の体に、下から腕を回した。|見上げるほどの{b}の体が、{a}の指先ひとつで震えた。|{a}は背伸びをするようにして、大きな{b}の首筋に唇を寄せた。')
    },
    hold: {
      big: L('{a}は{b}を軽々と抱き上げ、膝の上に座らせた。|{a}は{b}を胸に抱き込んで、すっぽりと覆い隠した。|{a}は少し身をかがめて、小柄な{b}を両腕で包み込んだ。'),
      small: L('{a}は自分より大きな{b}を見上げ、その首に腕を回して引き寄せた。|{a}は{b}の広い背中に、精いっぱい腕を回した。|{a}は大きな{b}の胸に額を押し当てて、そのまま離れなかった。')
    },
    look: L('{S}は{L}を見上げて話した。並ぶと、背の差がいっそう目立った。|{L}は少しかがんで、{S}と目の高さを合わせた。|{L}は{S}の歩幅に合わせて、いつもよりゆっくり歩いた。|{S}は{L}の隣に立つと、肩のあたりにしか届かなかった。')
  };
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  /* 一人分の種族の一句（無ければ ''）。pick を渡さなければ先頭の文。o は相手（{o}） */
  A.flavor = function (c, kind, pick, o) {
    var r = A.raceOf(c), T = RACE_FL[kind] || RACE_FL.look, l = r && T[r];
    if (!l || (r === 'other' && !c.raceNote)) return '';
    return fill(pick ? pick(l) : l[0], { c: c.name, note: c.raceNote || '', o: (o && o.name) || '相手' });
  };
  /* 二人の場面に差し込む一文（体格の差・二人の種族・胸の中から一つ）。a＝主導する側（攻め）・b＝受ける側。
     どちらも何も決めていなければ乱数を使わずに '' を返す（決めていない人の結果は、これまでと変わらない） */
  A.pairLine = function (a, b, kind, pick) {
    if (!a || !b) return '';
    var c = [], sd = A.sizeDiff(a, b), v = { a: a.name, b: b.name };
    if (sd) {
      if (kind === 'look') c.push(fill(pick(SIZE_FL.look), sd === 'a>b' ? { L: a.name, S: b.name } : { L: b.name, S: a.name }));
      else c.push(fill(pick(SIZE_FL[kind === 'hold' ? 'hold' : 'touch'][sd === 'a>b' ? 'big' : 'small']), v));
    }
    [a, b].forEach(function (x) { var f = A.flavor(x, kind, pick, x === a ? b : a); if (f) c.push(f); });
    if (kind === 'touch' && A.bustLine) { var bl = A.bustLine(a, b, pick); if (bl) c.push(bl); }
    if (!c.length) return '';
    return c.length === 1 ? c[0] : pick(c);
  };
  /* tie-rel.js（ふだんの場面）から：二人のどちらかに種族・体格があれば、ときどき見た目の一文を添える */
  A.daily = function (ctx, a, b, r, cat) {
    if (!r || typeof r.text !== 'string' || !a || !b || !/^(?:bond|help)$/.test(r.cat || cat || '')) return r;
    if (!A.sizeDiff(a, b) && !A.raceOf(a) && !A.raceOf(b)) return r;
    if (ctx.rng() >= 0.35) return r;
    var t = A.pairLine(a, b, 'look', function (l) { return ctx.pick(l); });
    if (t) r.text += t;
    return r;
  };

  /* ---------- 心の強さ：堕ちても心は折れない（kind ごとの文。R18 の箱庭の文は attr-r18.js が足す） ---------- */
  A.HOLD = {
    saimin: L('暗示の心地よさを体がどれほど覚えていても、{c}は心の芯までは明け渡さなかった。|{c}の体は、まだ暗示の余韻に揺れていた。それでも{c}の目は、最後まで自分のものだった。|{c}は震える指を握りしめた。体が何を覚えていようと、決めるのは自分だ――その一点だけは、揺らがなかった。|流されたのは体だけだった。{c}は深く息を吸い、自分の名前を、自分の声で確かめた。')
  };
  /* strong の人だけ、その箱庭の「心は折れない」一文を返す（ほかの人には乱数を使わずに ''） */
  A.hold = function (pick, c, kind) {
    if (!A.strong(c)) return '';
    var l = A.HOLD[kind] || A.HOLD.saimin;
    return fill(pick(l), { c: c.name });
  };

  /* ---------- 判定への組み込み ---------- */
  /* 同一人物の二人は恋愛・R18にしない（住人の ng にも足してあるが、ng を写さない住人のために ngPair も包む） */
  if (HK.ngPair && !HK.ngPair._attr) {
    var ng0 = HK.ngPair;
    HK.ngPair = function (a, b) { return ng0.apply(this, arguments) || A.samePair(a, b); };
    HK.ngPair._attr = true;
  }
  /* 嗜虐的な攻め（ero-kit.js の HK.Ero.sadist）：夜の性格がサドなら通す（受けが攻め指定なら通さない）。甘々・恥じらい・マゾは通さない */
  if (HK.Ero && HK.Ero.sadist && !HK.Ero.sadist._attr) {
    var sad0 = HK.Ero.sadist;
    HK.Ero.sadist = function (top, bot) {
      var n = A.nightOf(top, bot);
      if (n === 'sadist') return !(bot && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot));
      if (n === 'sweet' || n === 'shy' || n === 'maso') return false;
      return sad0.apply(this, arguments);
    };
    HK.Ero.sadist._attr = true;
  }

  /* ---------- 同一人物：鏡を見るような共通の場面 3 本（エンジン型の箱庭） ---------- */
  var MIRROR = {
    talk: L('{a}が言いかけた言葉を、{b}がそのまま続けた。二人は顔を見合わせ、同じ間で黙り込んだ。{a}「……やめよう、これ」{b}「……やめよう、これ」|{a}と{b}は、同じところで笑い、同じところで眉をひそめた。話しているというより、鏡に向かって独り言を言っているようだった。|{b}「次に何を言うか、当ててあげようか」{a}「当てなくていい。私も、そっちの答えが分かってるから」――二人は同時に小さく息をついた。|{a}は{b}の顔を見ていると、鏡の前に立っているような気がした。違うのは、鏡のほうが先に口を開くことだけだった。'),
    habit: L('{a}と{b}は、何も言わずに同じものへ手を伸ばし、同じ速さで手を引っ込めた。{b}「……どうぞ」{a}「いや、そっちが」|{a}が考えごとをするときの癖――指先で唇を叩く仕草を、{b}もまったく同じようにしていた。二人とも、それに気づいて手を下ろした。|{a}は{b}の荷物の詰め方を見て、思わず笑った。何をどこに入れるか、順番まで自分と同じだった。|{a}と{b}は同じ席を選び、同じ姿勢で座り、同じタイミングで足を組み替えた。周りの誰かが、小さく吹き出した。'),
    clash: L('{b}の言い訳を聞いているうちに、{a}は苛立ちを抑えられなくなった。それは、自分がいちばん言いたくない言い訳だった。{a}「……その言い方、やめて」|{a}は{b}の弱さを責めかけて、口をつぐんだ。責めた言葉は、そのまま自分に返ってくる気がした。|{b}「自分のこと、嫌いでしょう」{a}「……そっちこそ」――図星を突き合った二人は、しばらく目を逸らしたままだった。|{a}は{b}の中に、見ないふりをしてきた自分の嫌なところを全部見つけてしまった。{b}も、同じ顔をしていた。')
  };
  var MW = {
    talk: '鏡の中の自分と話すように',
    habit: '癖まで同じ二人',
    clash: '自分の嫌なところを見せつけられる'
  };
  function mirrorEv(k, w, cat, fx) {
    return {
      id: 'attr_mirror_' + k, cat: cat, scope: 'pair',
      when: function (ctx, a, b) { return A.samePair(a, b); },
      w: function () { return w; },
      run: function (ctx, a, b) {
        ctx.mod2(a, b, fx[0], fx[1]);
        return { cat: cat, text: ctx.t(ctx.pick(MIRROR[k]), a, b), why: a.name + 'と' + b.name + 'は同一人物：' + MW[k] };
      }
    };
  }
  if (HK.COMMON) {
    HK.COMMON.push(mirrorEv('talk', 1.6, 'bond', [{ aff: 3, trust: 4 }, { aff: 3, trust: 4 }]));
    HK.COMMON.push(mirrorEv('habit', 1.3, 'bond', [{ aff: 2, trust: 3 }, { aff: 2, trust: 3 }]));
    HK.COMMON.push(mirrorEv('clash', 1, 'conflict', [{ ten: 5, aff: -1 }, { ten: 5, aff: -1 }]));
  }

  /* ---------- 結果の関係名「もう一人の自分」（tie-rel.js の結末の分類を包む） ---------- */
  var MIRROR_SOFT = /^(friends|partners|strangers|awkward|guard|accomplice|oneway|pining)$/;
  if (HK.LABELS && !HK.LABELS.mirror) HK.LABELS.mirror = { name: 'もう一人の自分', cls: 'friend', pol: 1 };
  var TR = HK.TieRel;
  if (TR && TR.refine && !TR.refine._attr) {
    var rf0 = TR.refine;
    TR.refine = function (ctx, A0, B0, pf, cl) {
      if (cl && A.samePair(A0, B0) && MIRROR_SOFT.test(cl.id) && !pf.kill) return { id: 'mirror', base: cl.id };
      return rf0.apply(this, arguments);
    };
    TR.refine._attr = true;
  }
  if (TR && TR.pairText && !TR.pairText._attr) {
    var pt0 = TR.pairText;
    TR.pairText = function (ctx, A0, B0, cl) {
      if (cl && cl.id === 'mirror') {
        if (/^(friends|partners|guard|accomplice)$/.test(cl.base || '')) return '鏡の中の自分と手を取り合うように、二人は互いのいちばんの理解者になった。';
        if (/^(awkward|oneway)$/.test(cl.base || '')) return '同じ顔、同じ癖。二人は最後まで、もう一人の自分との距離をつかみかねていた。';
        return '同じ人が二人いる。そのことに、二人とも少しずつ慣れていった。';
      }
      return pt0.apply(this, arguments);
    };
    TR.pairText._attr = true;
  }
})();
