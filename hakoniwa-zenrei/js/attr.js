/* 箱庭シミュレーター: 住人の共通の属性（体格・胸・種族・夜の性格・心の強さ・同一人物）（全年齢版・R18版共通。pos.js の直後に読む）
   住人の設定（⚙️）の「体と設定」で決め、どの箱庭でも同じに効く。箱庭ごとの役（perFields）とは別の、住人そのものの見た目・性格。
   ・build 体格：''（おまかせ＝ふつう扱い）／small 小柄／avg ふつう／large 大柄。二人の差で文を差し替える（HK.Attr.sizeDiff）
   ・bust 胸（R18版・女性だけ）：''／s 控えめ／m ふつう／l 豊か。R18 の地の文の差し替え語（HK.Attr.bustWord）
   ・genital 性器（R18版だけ。全年齢版では保存だけ）：''（おまかせ＝性別どおり）／m 男性器／f 女性器／mf 両方／none なし。
     体の描写の判定は pos.js（HK.Pos.hasM・hasF・noGen）。none の人は受けのとき口まで、攻めのとき指と玩具だけ（pos-nogen.js）
   ・race 種族：''（人間）／human／vampire 吸血鬼／beast 獣人／demon 魔族／angel 天使／ghost 幽霊／other その他（raceNote に自由記入）。
     文の飾り（耳・尾・牙・翼）。死のある箱庭の「特殊役職：吸血鬼」と同じ扱いにする（special.js の SP.setup。両方が吸血鬼でも一人分）
   ・night 夜の性格（R18版だけ）：''（おまかせ＝気質から）／sadist サド／maso マゾ／mean 意地悪／sweet 甘々／shy 恥じらい／none 表と同じ。
     nightFor { 相手の番号: night } があれば、その相手にはそちらを優先する。R18 の山場の型（style）より優先する（attr-r18.js）。
     maso は受け攻めを変えない（攻め指定が優先。受けに回ったときの崩れ方だけを変える）。全年齢では無視する
   ・will 心の強さ：''／weak 弱い／avg ふつう／strong 強い。快楽堕ち・催眠・常識改変・遮断穴の「堕ちる」判定に掛ける（HK.Attr.willK）。
     strong は体が堕ちても心は折れない文を添える（HK.Attr.hold）
   ・same 同一人物：相手の番号。「鏡を見るような」共通の場面 3 本と、結果の関係名「もう一人の自分」。恋愛・体の関係は縛らない
     （避けたいときは「恋愛・R18にしない相手」loveNG や性行為の相手の固定で決める）
   ・sameDark 同一人物の「闇堕ちVer」（真偽。同一人物を選んだ人だけ）：同一人物の相手を苛む、闇に堕ちた自分。判定は A.isDark(c)・A.darkOf(a, b)
     （a・b が同一人物の組で、片方だけ闇堕ちならその人。出来事は出られない部屋の側で使う）
   ・noKillFor 憎悪を持っても殺さない相手（相手の id の配列。片方に付ければ両方向に効く。画面の欄は ui-gear.js の「相手ごとの設定」）。
     実行時は dst.noKill（相手の番号の配列）。判定は A.noKillPair(a, b)。エンジン型の Ctx.kill を包み、殺す代わりに「思いとどまる」出来事にする
     （opt.force・殺し合いが本筋の箱庭 scen.killMain・殺す側が発狂中／ゾンビ化などで正気でないときは殺す）
   ・posFor 相手ごとの受け攻め（全年齢版・R18版共通）：{ 相手: 'top'|'bottom'|'riba' }。空・不正な値は持たない。nightFor と同じ経路で保存・書き出し・入力に渡す。
     実行時は pos.js の P.of(c, 相手)・P.explicit(c, 相手)・P.hardTop(c, 相手) が全体の受け攻め（pos）より優先して読む。
     画面の欄は「相手ごとの設定」の行（A.forHtml。夜の性格の相手ごとの指定 nightFor も同じ行）
   ・youFor / fpFor 相手ごとの二人称・一人称：{ 相手: 'あなた'|'きみ'|… } / { 相手: '私'|'俺'|… }（自由記入も可・8文字まで）。
     相手が分かる台詞では、ふだんの二人称・一人称より優先する（voice.js の V.processText。名前で引けるように A.voiceFor で写す）。
     画面の欄は「相手ごとの設定」の行（呼び方の隣。A.voiceForHtml）
   ・foodLike 好きな食べ物／foodHate 嫌いな食べ物：自由記入（読点区切りで5つまで・1つ12文字まで）。taste 好きな味：甘い／しょっぱい／辛い／酸っぱい／苦い／あっさり／こってり
     （いくつでも。読点区切りで持つ）。実行時は配列で写す。使い方は food.js（HK.Food：料理の味・食べた人の反応・好物の一句）
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
  /* 性器（値は全年齢版でも保存・読み込みのために残す。見出しの語は R18版だけ） */
  A.GENITAL = [['', 'おまかせ（性別どおり）'], ['m', ''], ['f', ''], ['mf', '両方'], ['none', 'なし']];
  /* r18:begin */
  A.GENITAL[1][1] = '男性器'; A.GENITAL[2][1] = '女性器';
  /* r18:end */
  function has(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return true; return false; }
  function val(list, v) { v = v == null ? '' : String(v); return has(list, v) ? v : ''; }
  function lab(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return list[i][1]; return ''; }
  function note(v) { return typeof v === 'string' ? v.replace(/[「」『』{}<>]/g, '').trim().slice(0, 12) : ''; }
  A.label = function (k, v) { return lab({ build: A.BUILD, bust: A.BUST, race: A.RACE, night: A.NIGHT, will: A.WILL, genital: A.GENITAL }[k] || [], v); };
  var SIMPLE = ['build', 'bust', 'race', 'night', 'will', 'genital'];
  /* 相手ごとの二人称・一人称（VF：欄の名前） */
  var VF = ['youFor', 'fpFor'];
  A.YOU_OPTS = ['あなた', 'きみ', 'おまえ', 'あんた', 'そっち'];
  A.FP_OPTS = ['私', '俺', '僕', 'あたし'];
  function word(v) { return typeof v === 'string' ? v.replace(/[「」『』{}<>\s\u2060-\u2064]/g, '').slice(0, 8) : ''; }
  function wmap(m, keyOk) { var o = {}; if (m && typeof m === 'object') Object.keys(m).forEach(function (k) { var w = word(m[k]); if (w && (!keyOk || keyOk(k))) o[k] = w; }); return o; }
  /* 相手ごとの受け攻め（posFor）の値 */
  A.POSFOR = [['', 'おまかせ（全体に従う）'], ['top', '攻め'], ['bottom', '受け'], ['riba', 'リバ']];
  function posv(v) { return v === 'top' || v === 'bottom' || v === 'riba' ? v : ''; }
  function pmap(m, keyOk) { var o = {}; if (m && typeof m === 'object') Object.keys(m).forEach(function (k) { var v = posv(m[k]); if (v && (!keyOk || keyOk(k))) o[k] = v; }); return o; }
  function listOf(k) { return { build: A.BUILD, bust: A.BUST, race: A.RACE, night: A.NIGHT, will: A.WILL, genital: A.GENITAL }[k]; }
  /* 好きな食べ物・嫌いな食べ物（自由記入）と好きな味（決まった7つから複数）。画面と書き出しは読点区切りの文字列、実行時は配列 */
  A.TASTES = ['甘い', 'しょっぱい', '辛い', '酸っぱい', '苦い', 'あっさり', 'こってり'];
  var FOODK = ['foodLike', 'foodHate'];
  A.foodWords = function (v) {
    var src = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[、,，・\/／\n]+/) : [], out = [];
    src.forEach(function (w) { w = typeof w === 'string' ? w.replace(/[「」『』{}<>\u2060-\u2064]/g, '').trim().slice(0, 12) : ''; if (w && out.indexOf(w) < 0 && out.length < 5) out.push(w); });
    return out;
  };
  A.tasteList = function (v) {
    var src = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[、,，・\/／\s]+/) : [];
    return A.TASTES.filter(function (t) { return src.indexOf(t) >= 0; });
  };
  function fstr(v) { return A.foodWords(v).join('、'); }
  /* 相手の id の並び（画面の住人。重複・空を除く） */
  function idl(v) { var o = []; if (Array.isArray(v)) v.forEach(function (k) { if (typeof k === 'string' && k && o.indexOf(k) < 0) o.push(k); }); return o; }
  function tstr(v) { return A.tasteList(v).join('、'); }

  /* ---------- 画面の住人（S.chars。相手は id で持つ） ---------- */
  /* ui.js mk：写すときにこの欄も写す */
  A.mk = function (o, c) {
    c = c || {};
    SIMPLE.forEach(function (k) { o[k] = val(listOf(k), c[k]); });
    o.raceNote = note(c.raceNote);
    o.nightFor = c.nightFor && typeof c.nightFor === 'object' ? JSON.parse(JSON.stringify(c.nightFor)) : {};
    o.posFor = pmap(c.posFor);
    o.same = typeof c.same === 'string' ? c.same : '';
    o.sameDark = !!(o.same && c.sameDark);
    o.noKillFor = idl(c.noKillFor);
    VF.forEach(function (k) { o[k] = wmap(c[k]); });
    FOODK.forEach(function (k) { o[k] = fstr(c[k]); });
    o.taste = tstr(c.taste);
    return o;
  };
  /* ui.js normChar：値を確かめる */
  A.norm = function (c) {
    SIMPLE.forEach(function (k) { c[k] = val(listOf(k), c[k]); });
    c.raceNote = note(c.raceNote);
    var nf = {};
    if (c.nightFor && typeof c.nightFor === 'object') Object.keys(c.nightFor).forEach(function (k) { var v = val(A.NIGHT, c.nightFor[k]); if (v) nf[k] = v; });
    c.nightFor = nf;
    c.posFor = pmap(c.posFor);
    c.same = typeof c.same === 'string' ? c.same : '';
    c.sameDark = !!c.sameDark;   /* 同一人物が無ければ normRefs・importRefs で外す（読み込みでは相手が後で決まるので、ここでは外さない） */
    c.noKillFor = idl(c.noKillFor);
    VF.forEach(function (k) { c[k] = wmap(c[k]); });
    FOODK.forEach(function (k) { c[k] = fstr(c[k]); });
    c.taste = tstr(c.taste);
    /* 語尾の設定（かんたん）：c.ending。古い「語尾の付け替え」（toneCustom）はここで ending.plain に写す（tone-ending.js） */
    if (HK.Ending) HK.Ending.norm(c);
    return c;
  };
  /* ui.js normRefs：今いる住人だけに絞る（同一人物は両方に書く） */
  A.normRefs = function (c, ids, list) {
    if (!ids[c.same] || c.same === c.id) c.same = '';
    Object.keys(c.nightFor || {}).forEach(function (k) { if (!ids[k] || k === c.id) delete c.nightFor[k]; });
    Object.keys(c.posFor || {}).forEach(function (k) { if (!ids[k] || k === c.id) delete c.posFor[k]; });
    VF.forEach(function (f) { Object.keys(c[f] || {}).forEach(function (k) { if (!ids[k] || k === c.id) delete c[f][k]; }); });
    if (c.same && list) list.forEach(function (o) { if (o.id === c.same && !o.same) o.same = c.id; });
    if (!c.same) c.sameDark = false;
    /* 殺さない相手：今いる住人だけ。片方に書かれていれば、もう片方にも書く */
    c.noKillFor = idl(c.noKillFor).filter(function (k) { return ids[k] && k !== c.id; });
    if (c.noKillFor.length && list) list.forEach(function (o) { if (c.noKillFor.indexOf(o.id) >= 0) { o.noKillFor = idl(o.noKillFor); if (o.noKillFor.indexOf(c.id) < 0) o.noKillFor.push(c.id); } });
  };
  /* ui.js rosterJSON：書き出し（相手は ref で番号に） */
  A.exportTo = function (o, c, ref) {
    SIMPLE.forEach(function (k) { if (c[k]) o[k] = c[k]; });
    if (c.raceNote) o.raceNote = c.raceNote;
    FOODK.forEach(function (k) { if (fstr(c[k])) o[k] = fstr(c[k]); });
    if (tstr(c.taste)) o.taste = tstr(c.taste);
    if (c.same && ref(c.same) != null) { o.same = ref(c.same); if (c.sameDark) o.sameDark = true; }
    var nk = idl(c.noKillFor).map(ref).filter(function (x) { return x != null; });
    if (nk.length) o.noKillFor = nk;
    if (c.nightFor) { var nf = {}; Object.keys(c.nightFor).forEach(function (k) { if (ref(k) != null && c.nightFor[k]) nf[ref(k)] = c.nightFor[k]; }); if (Object.keys(nf).length) o.nightFor = nf; }
    if (c.posFor) { var pf = {}; Object.keys(c.posFor).forEach(function (k) { if (ref(k) != null && posv(c.posFor[k])) pf[ref(k)] = c.posFor[k]; }); if (Object.keys(pf).length) o.posFor = pf; }
    VF.forEach(function (f) { if (!c[f]) return; var m = {}; Object.keys(c[f]).forEach(function (k) { if (ref(k) != null && word(c[f][k])) m[ref(k)] = word(c[f][k]); }); if (Object.keys(m).length) o[f] = m; });
    if (HK.Ending) HK.Ending.exportTo(o, c);
    return o;
  };
  /* ui.js importJSON：読み込み（相手は全員を読んだあとで A.importRefs） */
  A.importFrom = function (c, o) {
    SIMPLE.forEach(function (k) { if (o[k] != null) c[k] = val(listOf(k), o[k]); });
    if (o.raceNote != null) c.raceNote = note(String(o.raceNote));
    FOODK.forEach(function (k) { if (o[k] != null) c[k] = fstr(o[k]); });
    if (o.taste != null) c.taste = tstr(o.taste);
    if (o.sameDark != null) c.sameDark = !!o.sameDark;
    if (HK.Ending) HK.Ending.importFrom(c, o);
    c._atNk = o.noKillFor;
    c._atSame = o.same; c._atNf = o.nightFor; c._atPf = o.posFor; c._atYf = o.youFor; c._atFf = o.fpFor;
  };
  A.importRefs = function (c, ref) {
    if (c._atSame != null && c._atSame !== '') { var s = ref(c._atSame); c.same = s && s !== c.id ? s : ''; }
    if (c._atNf && typeof c._atNf === 'object') { c.nightFor = c.nightFor || {}; Object.keys(c._atNf).forEach(function (k) { var id = ref(k), v = val(A.NIGHT, c._atNf[k]); if (id && id !== c.id && v) c.nightFor[id] = v; }); }
    if (c._atPf && typeof c._atPf === 'object') { c.posFor = c.posFor || {}; Object.keys(c._atPf).forEach(function (k) { var id = ref(k), v = posv(c._atPf[k]); if (id && id !== c.id && v) c.posFor[id] = v; }); }
    delete c._atPf;
    [['_atYf', 'youFor'], ['_atFf', 'fpFor']].forEach(function (x) {
      var m = c[x[0]];
      if (m && typeof m === 'object') { c[x[1]] = c[x[1]] || {}; Object.keys(m).forEach(function (k) { var id = ref(k), w = word(m[k]); if (id && id !== c.id && w) c[x[1]][id] = w; }); }
      delete c[x[0]];
    });
    if (Array.isArray(c._atNk)) { c.noKillFor = []; c._atNk.forEach(function (k) { var id = ref(k); if (id && id !== c.id && c.noKillFor.indexOf(id) < 0) c.noKillFor.push(id); }); }
    delete c._atNk;
    if (!c.same) c.sameDark = false;
    delete c._atSame; delete c._atNf;
  };
  /* ui.js buildInput：シミュレーションへ渡す（相手は箱庭に出る人の番号に） */
  A.toInput = function (o, c, ids) {
    SIMPLE.forEach(function (k) { if (c[k]) o[k] = c[k]; });
    if (c.raceNote) o.raceNote = c.raceNote;
    FOODK.forEach(function (k) { if (fstr(c[k])) o[k] = fstr(c[k]); });
    if (tstr(c.taste)) o.taste = tstr(c.taste);
    var si = c.same ? ids.indexOf(c.same) : -1;
    if (si >= 0) { o.same = si; if (c.sameDark) o.sameDark = true; }
    var nk = [];
    idl(c.noKillFor).forEach(function (k) { var i = ids.indexOf(k); if (i >= 0 && nk.indexOf(i) < 0) nk.push(i); });
    if (nk.length) o.noKillFor = nk;
    if (c.nightFor) { var nf = {}, n = 0; Object.keys(c.nightFor).forEach(function (k) { var i = ids.indexOf(k); if (i >= 0 && c.nightFor[k]) { nf[i] = c.nightFor[k]; n++; } }); if (n) o.nightFor = nf; }
    if (c.posFor) { var pf = {}, n2 = 0; Object.keys(c.posFor).forEach(function (k) { var i = ids.indexOf(k); if (i >= 0 && posv(c.posFor[k])) { pf[i] = c.posFor[k]; n2++; } }); if (n2) o.posFor = pf; }
    VF.forEach(function (f) { if (!c[f]) return; var m = {}, k2 = 0; Object.keys(c[f]).forEach(function (k) { var i = ids.indexOf(k), w = word(c[f][k]); if (i >= 0 && w) { m[i] = w; k2++; } }); if (k2) o[f] = m; });
    /* 語尾の設定（使うときだけ。台詞の話し手の口調は voice.js の processResult で HK.Ending.toneOf） */
    if (HK.Ending) HK.Ending.toInput(o, c);
    return o;
  };
  /* ui-gear.js：住人の行の要約に足す */
  A.summary = function (c, byId) {
    var bits = [];
    if (c.build) bits.push('体格：' + lab(A.BUILD, c.build));
    if (!HK.SAFE_ON && c.bust && c.gender === 'f') bits.push('胸：' + lab(A.BUST, c.bust));
    if (c.race && c.race !== 'human') bits.push('種族：' + lab(A.RACE, c.race) + (c.raceNote ? '（' + c.raceNote + '）' : ''));
    if (!HK.SAFE_ON && c.night) bits.push('夜：' + lab(A.NIGHT, c.night));
    /* r18:begin */
    if (!HK.SAFE_ON && c.genital) bits.push('性器：' + lab(A.GENITAL, c.genital));
    /* r18:end */
    if (c.will) bits.push('心の強さ：' + lab(A.WILL, c.will));
    if (fstr(c.foodLike)) bits.push('好物：' + fstr(c.foodLike));
    if (fstr(c.foodHate)) bits.push('苦手な食べ物：' + fstr(c.foodHate));
    if (tstr(c.taste)) bits.push('好きな味：' + tstr(c.taste));
    var sm = c.same && byId(c.same);
    if (sm) bits.push('同一人物：' + sm.name + (c.sameDark ? '（闇堕ちVer）' : ''));
    var nkl = idl(c.noKillFor).map(byId).filter(Boolean);
    if (nkl.length) bits.push('殺さない：' + nkl.map(function (o) { return o.name; }).join('・'));
    var pfl = Object.keys(c.posFor || {}).map(function (id) { var o = byId(id); return o && posv(c.posFor[id]) ? o.name + 'に' + lab(A.POSFOR, c.posFor[id]) : ''; }).filter(Boolean);
    if (pfl.length) bits.push('相手ごとの受け攻め：' + pfl.join('・'));
    /* r18:begin */
    var nfl = HK.SAFE_ON ? [] : Object.keys(c.nightFor || {}).map(function (id) { var o = byId(id); return o && val(A.NIGHT, c.nightFor[id]) ? o.name + 'に' + lab(A.NIGHT, c.nightFor[id]) : ''; }).filter(Boolean);
    if (nfl.length) bits.push('相手ごとの夜の性格：' + nfl.join('・'));
    /* r18:end */
    return bits;
  };
  /* ui-gear.js：「体と設定」の節の中身（見出しと「どの箱庭に効くか」の注意書きは ui-gear.js）。h = { esc, opt, selOf }。
     R18版だけの欄（胸・性器）は SAFE_ON で隠す。夜の性格は「恋愛と夜」の節（A.nightHtml）と、相手ごとの設定の行（A.forHtml）に置く */
  A.gearHtml = function (c, others, h) {
    var esc = h.esc, sel = function (k) { return h.selOf('at_' + k, listOf(k), c[k] || ''); };
    var lw = HK.SAFE_ON ? '恋愛' : '恋愛・R18';
    var same = others.length ? '<label title="別の世界・別の時間の同じ人のように扱います。鏡を見るような場面が起きます。' + lw + 'も、ほかの二人と同じように起こりえます（避けたいときは「' + lw + 'にしない相手」に印を付けます）">同一人物 <select data-gf="at_same" aria-label="同一人物"><option value="">なし</option>' + others.map(function (o) { return h.opt(o.id, o.name, c.same || ''); }).join('') + '</select></label>' +
      (c.same ? '<label title="同一人物の相手を苛む、闇に堕ちた自分。エゴグラムの欠点が際立ち、愛憎より悪質に振る舞います。いまは出られない部屋だけで効きます"><input type="checkbox" data-gf="at_sameDark"' + (c.sameDark ? ' checked' : '') + '> 闇堕ちVer</label>' : '') : '';
    return '<div class="gearrow"><label title="二人の体格の差で、見上げる・抱き上げるといった文が変わります">体格 ' + sel('build') + '</label>' +
      /* r18:begin */
      (!HK.SAFE_ON && c.gender === 'f' ? '<label title="R18の場面の地の文で、胸の書き方が変わります">胸 ' + sel('bust') + '</label>' : '') +
      /* r18:end */
      '<label title="耳・尾・牙・翼などの文の飾りが付きます。死のある箱庭（ゾンビの街・邪神村RTA・吹雪の館・宇宙船漂流記・ダンジョンRPG）では、吸血鬼は死んでも蘇り、三日に一度人の血を吸います">種族 ' + sel('race') + '</label>' +
      (c.race === 'other' ? '<label>種族の名前 <input type="text" data-gf="at_raceNote" value="' + esc(c.raceNote || '') + '" maxlength="12" placeholder="例：人魚" style="width:7em"></label>' : '') +
      /* r18:begin */
      (!HK.SAFE_ON ? '<label title="R18の場面の体の書き方が、性別ではなくこちらに従います。「なし」にすると、受けのときは口まで、攻めのときは指と玩具だけになります">性器 ' + sel('genital') + '</label>' : '') +
      /* r18:end */
      '<label title="快楽堕ち・催眠・常識改変・感覚遮断穴などで、堕ちやすさが変わります。強いと、体は流されても心は折れません">心の強さ ' + sel('will') + '</label>' + same + '</div>' + food(c, esc);
  };
  /* 「恋愛と夜」の節に置く、全体の夜の性格（R18版だけ。相手ごとに決めていない相手・モブが相手のとき） */
  A.nightHtml = function (c, h) {
    var out = '';
    /* r18:begin */
    if (!HK.SAFE_ON) out = '<label title="R18の場面での振る舞い。作風（山場の書き方）より優先します。相手ごとの設定で決めた相手には、そちらを優先します。マゾは受け攻めを変えません（攻めを選んだ人は攻めのまま）">夜の性格（全体） ' + h.selOf('at_night', A.NIGHT, c.night || '') + '</label>';
    /* r18:end */
    return out;
  };
  /* 「相手ごとの設定」の行に並べる欄（ui-gear.js）：この相手への受け攻め（posFor）と、R18版だけ夜の性格（nightFor） */
  A.forHtml = function (c, o, h) {
    var esc = h.esc, pv = (c.posFor || {})[o.id] || '';
    var out = '<label title="この相手との恋愛・夜の場面での向きだけを変えます。おまかせなら、恋愛と夜の節の受け攻めに従います（ほかの相手・モブには全体の受け攻めのまま）">受け攻め <select data-gf="at_pf" data-o="' + esc(o.id) + '" aria-label="' + esc(o.name) + 'への受け攻め">' + A.POSFOR.map(function (x) { return h.opt(x[0], x[1], pv); }).join('') + '</select></label>';
    /* r18:begin */
    if (!HK.SAFE_ON) out += '<label title="この相手との夜の場面での振る舞い。「全体と同じ」なら、恋愛と夜の節の夜の性格のまま">夜の性格 <select data-gf="at_nf" data-o="' + esc(o.id) + '" aria-label="' + esc(o.name) + 'への夜の性格">' + A.NIGHT.map(function (x) { return h.opt(x[0], x[0] ? x[1] : '全体と同じ', (c.nightFor || {})[o.id] || ''); }).join('') + '</select></label>';
    /* r18:end */
    return out;
  };
  /* 相手ごとの受け攻めの注意（全体の指定と食い違うとき・二人の向きが決まらないとき）。何もなければ '' */
  var PLAB = { top: '攻め', bottom: '受け', riba: 'リバ' };
  A.forNote = function (c, o) {
    var P = HK.Pos, pv = (c.posFor || {})[o.id] || '', rv = (o.posFor || {})[c.id] || '';
    if (!pv && !rv) return '';
    var bits = [];
    if (pv && c.pos !== pv) bits.push(c.name + 'は全体では' + (PLAB[c.pos] || 'おまかせ') + 'ですが、' + o.name + 'には' + PLAB[pv] + 'になります（ほかの相手・モブには全体のまま）');
    if (rv) bits.push(o.name + 'の設定では、' + c.name + 'に' + PLAB[rv] + 'を選んでいます');
    try {
      var a = { i: 0, name: c.name, gender: c.gender || '', likes: c.likes || '', pos: c.pos || '', posLike: c.posLike || '', posFor: pv ? { 1: pv } : null };
      var b = { i: 1, name: o.name, gender: o.gender || '', likes: o.likes || '', pos: o.pos || '', posLike: o.posLike || '', posFor: rv ? { 0: rv } : null };
      if (P && P.genderOK(a, b) && !P.orients(a, b).length) bits.push('この二人は受け攻めの向きが決まらないので、恋愛・夜の場面になりません（攻めどうしなど）');
    } catch (e) { /* 注意が出せなくても欄はそのまま */ }
    return bits.join('。');
  };
  /* 「体と設定」の食べ物の行：好きな食べ物・嫌いな食べ物（自由記入）と好きな味（いくつでも） */
  function food(c, esc) {
    var tl = A.tasteList(c.taste);
    return '<div class="gearrow"><label title="食事・差し入れ・デートなどの場面で、好物として名前が出ます。読点（、）で区切って5つまで">好きな食べ物 <input type="text" data-gf="at_foodLike" value="' + esc(fstr(c.foodLike)) + '" maxlength="64" placeholder="例：唐揚げ、プリン" aria-label="好きな食べ物" style="width:10em"></label>' +
      '<label title="出されると、態度によって隠して食べたり、正直に苦手だと言ったりします。読点（、）で区切って5つまで">嫌いな食べ物 <input type="text" data-gf="at_foodHate" value="' + esc(fstr(c.foodHate)) + '" maxlength="64" placeholder="例：ピーマン" aria-label="嫌いな食べ物" style="width:8em"></label></div>' +
      '<div class="gearrow"><span class="gearhint" style="flex:1 1 100%;margin:0">好きな味（料理の味付けがこの味だと喜び、反対の味だと顔をしかめます。いくつでも）</span>' +
      A.TASTES.map(function (t) { return '<label><input type="checkbox" data-gf="at_taste" data-v="' + esc(t) + '"' + (tl.indexOf(t) >= 0 ? ' checked' : '') + '> ' + esc(t) + '</label>'; }).join('') + '</div>';
  }
  /* ui-gear.js の入力：この欄なら処理して true を返す。changed(rerender) は ui-gear.js の保存 */
  A.gearField = function (c, f, t, isInput, changed, byId) {
    if (!/^at_/.test(f || '')) return false;
    var k = f.slice(3);
    if (k === 'raceNote') { c.raceNote = note(t.value); changed(false); return true; }
    if (k === 'foodLike' || k === 'foodHate') { c[k] = fstr(t.value); changed(false); return true; }
    if (k === 'taste') { var tl = A.tasteList(c.taste), tv = t.dataset.v; if (A.TASTES.indexOf(tv) >= 0) { tl = tl.filter(function (x) { return x !== tv; }); if (t.checked) tl.push(tv); c.taste = tstr(tl); changed(false); } return true; }
    if (k === 'yf' || k === 'ff') { var vk = k === 'yf' ? 'youFor' : 'fpFor', w = word(t.value); c[vk] = c[vk] || {}; if (w) c[vk][t.dataset.o] = w; else delete c[vk][t.dataset.o]; changed(false); return true; }
    if (isInput) return true;
    if (listOf(k)) { c[k] = val(listOf(k), t.value); changed(k === 'race' || k === 'night'); return true; }
    if (k === 'pf') { c.posFor = c.posFor || {}; var pv = posv(t.value); if (pv) c.posFor[t.dataset.o] = pv; else delete c.posFor[t.dataset.o]; changed(true); return true; }
    if (k === 'sameDark') { c.sameDark = !!(t.checked && c.same); changed(true); return true; }
    if (k === 'nf') { c.nightFor = c.nightFor || {}; var v = val(A.NIGHT, t.value); if (v) c.nightFor[t.dataset.o] = v; else delete c.nightFor[t.dataset.o]; changed(false); return true; }
    if (k === 'same') {
      var old = c.same && byId(c.same), o = t.value && byId(t.value);
      if (old && old.same === c.id && old !== o) { old.same = ''; old.sameDark = false; }
      if (o && o.same && o.same !== c.id) { var o2 = byId(o.same); if (o2 && o2.same === o.id) { o2.same = ''; o2.sameDark = false; } }
      c.same = o ? o.id : '';
      if (!o) c.sameDark = false;
      if (o) o.same = c.id;
      changed(true); return true;
    }
    return true;
  };

  /* 「相手ごとの設定」の行に並べる欄（ui-gear.js）：二人称・一人称（候補は datalist、自由記入も可） */
  A.voiceForHtml = function (c, o, esc) {
    lists();
    var y = (c.youFor || {})[o.id] || '', f = (c.fpFor || {})[o.id] || '';
    return '<label title="この相手に話しかける台詞の二人称。空なら「話し方」の二人称のまま">二人称 <input type="text" data-gf="at_yf" data-o="' + esc(o.id) + '" value="' + esc(y) + '" maxlength="8" list="hk-you-opts" placeholder="' + esc(c.you || '口調から') + '" style="width:5em"></label>' +
      '<label title="この相手に話しかける台詞の一人称。空なら「話し方」の一人称のまま">一人称 <input type="text" data-gf="at_ff" data-o="' + esc(o.id) + '" value="' + esc(f) + '" maxlength="8" list="hk-fp-opts" placeholder="' + esc(c.fp || '口調から') + '" style="width:5em"></label>';
  };
  /* 相手ごとの二人称・一人称・受け攻め・夜の性格を決めてある相手か（関係がなくても、相手の行を出す） */
  A.hasVoiceFor = function (c, id) { return !!((c.youFor && c.youFor[id]) || (c.fpFor && c.fpFor[id]) || (c.posFor && c.posFor[id]) || (c.nightFor && c.nightFor[id])); };
  function lists() {
    if (typeof document === 'undefined' || !document.body) return;
    [['hk-you-opts', A.YOU_OPTS], ['hk-fp-opts', A.FP_OPTS]].forEach(function (x) {
      if (document.getElementById(x[0])) return;
      var dl = document.createElement('datalist'); dl.id = x[0];
      x[1].forEach(function (v) { var op = document.createElement('option'); op.value = v; dl.appendChild(op); });
      document.body.appendChild(dl);
    });
  }
  /* voice.js の processResult：台詞の話し手 p（名前で相手を引く）に、相手ごとの二人称・一人称を名前で写す。c = input.chars[i]（相手は番号） */
  A.voiceFor = function (p, c, chars) {
    VF.forEach(function (f) {
      if (!c || !c[f] || typeof c[f] !== 'object') return;
      var m = null;
      Object.keys(c[f]).forEach(function (k) { var o = /^\d+$/.test(k) ? chars[+k] : null, w = word(c[f][k]); if (o && o !== c && o.name && w) (m = m || {})[o.name] = w; });
      if (m) p[f] = m;
    });
    return p;
  };

  /* ---------- 実行時の住人（相手は番号 i で持つ） ---------- */
  /* src = input.chars[i]（画面から渡った住人）、dst = 箱庭の住人。値のある欄だけ写す（何も決めていない人は、これまでと同じ住人のまま） */
  A.copy = function (dst, src) {
    if (!dst || !src) return dst;
    var b = val(A.BUILD, src.build), r = val(A.RACE, src.race), w = val(A.WILL, src.will);
    if (b) dst.build = b;
    if (r) { dst.race = r; if (r === 'other' && note(src.raceNote)) dst.raceNote = note(src.raceNote); }
    if (w) dst.will = w;
    FOODK.forEach(function (k) { var l = A.foodWords(src[k]); if (l.length) dst[k] = l; });
    var tl = A.tasteList(src.taste);
    if (tl.length) dst.taste = tl;
    if (!HK.SAFE_ON) {
      var bu = val(A.BUST, src.bust), nt = val(A.NIGHT, src.night), gn = val(A.GENITAL, src.genital);
      if (bu) dst.bust = bu;
      if (gn) dst.genital = gn;
      if (nt) dst.night = nt;
      if (src.nightFor && typeof src.nightFor === 'object') {
        var nf = null;
        Object.keys(src.nightFor).forEach(function (k) { var v = val(A.NIGHT, src.nightFor[k]); if (v && /^\d+$/.test(k)) (nf = nf || {})[+k] = v; });
        if (nf) dst.nightFor = nf;
      }
    }
    VF.forEach(function (f) { var m = wmap(src[f], function (k) { return /^\d+$/.test(k) && +k !== dst.i; }); if (Object.keys(m).length) dst[f] = m; });
    /* 相手ごとの受け攻め（全年齢版でも効く。恋愛の向き） */
    var pfm = pmap(src.posFor, function (k) { return /^\d+$/.test(k) && +k !== dst.i; });
    if (Object.keys(pfm).length) dst.posFor = pfm;
    var sm = src.same;
    if (sm !== '' && sm != null && !isNaN(+sm) && +sm >= 0 && +sm !== dst.i) {
      /* 同一人物（恋愛・体の関係は縛らない。縛りたいときは「恋愛・R18にしない相手」で決める） */
      dst.same = +sm;
      if (src.sameDark) dst.sameDark = true;
    }
    /* 憎悪を持っても殺さない相手（相手の番号） */
    if (Array.isArray(src.noKillFor)) {
      var nk = [];
      src.noKillFor.forEach(function (k) { if (/^\d+$/.test(String(k)) && +k !== dst.i && nk.indexOf(+k) < 0) nk.push(+k); });
      if (nk.length) dst.noKill = nk;
    }
    return dst;
  };
  function isRes(c) { return !!c && typeof c.i === 'number'; }
  /* 相手の番号（実行時の住人は .i、入力の住人は .src.i。pos.js と同じ） */
  function idxOf(o) { return !o ? null : typeof o.i === 'number' ? o.i : o.src && typeof o.src.i === 'number' ? o.src.i : typeof o._pi === 'number' ? o._pi : null; }
  function sameOf(c) { var v = c && (c.same != null ? c.same : c.src ? c.src.same : null); return v === '' || v == null || isNaN(+v) ? null : +v; }
  /* 同一人物の二人か（どちらに書かれていても） */
  A.samePair = function (a, b) {
    if (!a || !b || a === b) return false;
    var ia = idxOf(a), ib = idxOf(b);
    if (ia == null || ib == null || ia === ib) return false;
    return sameOf(a) === ib || sameOf(b) === ia;
  };
  /* 同一人物の「闇堕ちVer」か */
  A.isDark = function (c) { return !!(c && (c.sameDark || (c.src && c.src.sameDark)) && sameOf(c) != null); };
  /* a・b が同一人物の組で、片方だけ闇堕ちならその人（両方・どちらでもなければ null） */
  A.darkOf = function (a, b) {
    if (!A.samePair(a, b)) return null;
    var da = A.isDark(a), db = A.isDark(b);
    return da && !db ? a : db && !da ? b : null;
  };
  /* 憎悪を持っても殺さない組か（どちらかが相手を「殺さない」にしていれば真）。実行時の dst.noKill、入力の住人は .src の noKill／noKillFor（番号） */
  function nkList(c) {
    if (!c) return null;
    if (Array.isArray(c.noKill)) return c.noKill;
    if (c.src && Array.isArray(c.src.noKill)) return c.src.noKill;
    if (c.src && Array.isArray(c.src.noKillFor)) return c.src.noKillFor;
    return null;
  }
  function nkHas(l, i) { if (!l) return false; for (var k = 0; k < l.length; k++) if (l[k] === i || (typeof l[k] === 'string' && /^\d+$/.test(l[k]) && +l[k] === i)) return true; return false; }
  A.noKillPair = function (a, b) {
    if (!a || !b || a === b) return false;
    var ia = idxOf(a), ib = idxOf(b);
    if (ia == null || ib == null || ia === ib) return false;
    return nkHas(nkList(a), ib) || nkHas(nkList(b), ia);
  };
  /* 殺さない設定を越えて殺すとき：殺し合いが本筋の箱庭（scen.killMain）か、殺す側が正気でない（発狂中・ゾンビ化など、もう生きていない） */
  A.killForced = function (ctx, killer) {
    if (ctx && ((ctx.scen && ctx.scen.killMain) || ctx.killForce)) return true;
    return !!(killer && (killer.alive === false || killer.mad || (killer.flags && (killer.flags.mad || killer.flags.berserk))));
  };
  /* 殺す出来事を起こす前に見る（物語型・キットの出来事から）：killer が victim を殺さないなら真 */
  A.spare = function (ctx, victim, killer) { return !!(victim && killer && victim !== killer && !A.killForced(ctx, killer) && A.noKillPair(victim, killer)); };
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
  /* r18:begin */
  /* 胸の差し替え語（R18版・女性だけ。決めていなければ ''） */
  A.BUST_WORD = { s: L('控えめな胸|小ぶりな胸|慎ましい胸'), m: L('形のいい胸|柔らかな胸|手に馴染む胸'), l: L('豊かな胸|たわわな胸|大きな胸') };
  /* r18:end */
  A.bustWord = function (c, pick) {
    if (HK.SAFE_ON || !c || !c.bust || (c.gender || (c.src && c.src.gender)) !== 'f') return '';
    var l = A.BUST_WORD[c.bust]; if (!l) return '';
    return pick ? pick(l) : l[0];
  };
  /* 心の強さ：堕ちる速さの倍率（弱い 1.3・強い 0.7） */
  A.willK = function (c) { var w = c && c.will; return w === 'weak' ? 1.3 : w === 'strong' ? 0.7 : 1; };
  A.strong = function (c) { return !!c && c.will === 'strong'; };
  /* 感覚遮断穴の「精神力」（1〜5）：心の強さから。弱い 1・ふつう 3・強い 5。決めていなければ乱数で 1〜5（以前の能力値の振り方と同じ） */
  A.mindOf = function (c, rng) { var w = c && (c.will || (c.src && c.src.will)); return w === 'weak' ? 1 : w === 'avg' ? 3 : w === 'strong' ? 5 : 1 + rng.int(5); };
  A.willLabel = function (c) { var w = c && (c.will || (c.src && c.src.will)); return w === 'weak' ? '弱い' : w === 'strong' ? '強い' : 'ふつう'; };
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
  /* 同一人物の二人の恋愛・体の関係は縛らない（以前は HK.ngPair を包んで止めていた。止めたいときは住人の「恋愛・R18にしない相手」で決める） */
  /* 嗜虐的な攻め（ero-kit.js の HK.Ero.sadist）：夜の性格がサドなら通す（受けが攻め指定なら通さない）。甘々・恥じらい・マゾは通さない */
  if (HK.Ero && HK.Ero.sadist && !HK.Ero.sadist._attr) {
    var sad0 = HK.Ero.sadist;
    HK.Ero.sadist = function (top, bot) {
      var n = A.nightOf(top, bot);
      if (n === 'sadist') return !(bot && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot, top));
      if (n === 'sweet' || n === 'shy' || n === 'maso') return false;
      return sad0.apply(this, arguments);
    };
    HK.Ero.sadist._attr = true;
  }

  /* ---------- 憎悪を持っても殺さない（エンジン型の Ctx.kill・Ctx.fight を包む） ---------- */
  /* {a}＝殺しかけた側、{b}＝殺されかけた側。台詞は 3 本（くだけた常体｜硬い常体｜敬語） */
  A.NOKILL = L('{a}の手が、{b}の喉元の寸前で止まった。憎しみは、少しも薄れていなかった。{a}「……できない。あなたを殺すなんて、私にはできない｜……できない。あなたを殺すことは、私にはできない｜……できません。あなたを殺すなんて、私にはできません」{a}は震える手を下ろし、{b}から目を逸らした。|' +
    '{a}は振り上げた手を、そのまま下ろした。握っていたものが、乾いた音を立てて足元に落ちた。{a}「……行って。気が変わらないうちに｜……行け。気が変わらないうちに｜……行ってください。気が変わらないうちに」{b}が去るまで、{a}は一度も顔を上げなかった。|' +
    '{a}は{b}に背を向けた。最後の一線だけは、どうしても越えられなかった。{a}「次に会ったら、どうなるか分からないよ｜次に会ったら、どうなるか分からない｜次に会ったら、どうなるか分かりませんよ」{b}は息を詰めたまま、遠ざかる背中を見ていた。|' +
    '{a}は{b}を見下ろしたまま、長いあいだ動かなかった。やがて、深く息を吐いた。{a}「……あなたを殺したら、私はもう戻れない気がする｜……あなたを殺せば、私はもう戻れない｜……あなたを殺したら、私はもう戻れない気がします」{a}はそれ以上何も言わずに、その場を離れた。');
  var Ctx = HK.Ctx;
  if (Ctx && Ctx.prototype.kill && !Ctx.prototype.kill._attrNk) {
    var kill0 = Ctx.prototype.kill;
    /* opt.force：殺さない設定を越えて殺す（殺し合いが本筋の箱庭・やむを得ない場合）。止めたときは null を返す（殺された人はそのまま生きている） */
    Ctx.prototype.kill = function (v, killer, how, opt) {
      if (v && v.alive && killer && killer !== v && !(opt && opt.force) && this._nkFight !== 'force' && A.spare(this, v, killer)) {
        var ctx = this;
        if (typeof v.hp === 'number' && v.hp < 8) v.hp = 8;
        var pf = ctx.pair ? ctx.pair(v, killer) : null;
        if (pf) pf.noKillStop = killer.i;
        ctx.mod2(killer, v, { ten: 6, aff: 2 }, { ten: 14, trust: -6 });
        var text = ctx.t(ctx.pick(A.NOKILL), killer, v), why = killer.name + 'は' + v.name + 'を「憎悪を持っても殺さない」相手にしている（相手ごとの設定）';
        if (ctx._nkFight && typeof ctx._nkFight === 'object') { ctx._nkFight.text = text; ctx._nkFight.why = why; return null; }
        ctx.pending = ctx.pending || [];
        ctx.pending.push({ kind: 'event', cat: 'conflict', actors: [killer, v], text: text, why: why, mag: 30 });
        return null;
      }
      return kill0.apply(this, arguments);
    };
    Ctx.prototype.kill._attrNk = true;
  }
  /* 戦いでとどめを刺す場面：止めたら、とどめを刺さなかった結果に書き換える（opt.force は kill に渡す） */
  if (Ctx && Ctx.prototype.fight && !Ctx.prototype.fight._attrNk) {
    var fight0 = Ctx.prototype.fight;
    Ctx.prototype.fight = function (a, b, opt) {
      var prev = this._nkFight, box = {};
      this._nkFight = opt && opt.force ? 'force' : box;
      var res;
      try { res = fight0.apply(this, arguments); } finally { this._nkFight = prev; }
      if (res && box.text && res.loser && res.loser.alive) {
        res.killed = false; res.spared = true; res.noKill = true;
        res.text = box.text; res.why = (res.why ? res.why + '／' : '') + box.why;
      }
      return res;
    };
    Ctx.prototype.fight._attrNk = true;
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
  /* 恋愛の結末（恋人・両片想い・片想いなど）はそのまま出す（同一人物でも恋愛は縛らない） */
  var MIRROR_SOFT = /^(friends|partners|strangers|awkward|guard|accomplice)$/;
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
        if (/^(awkward)$/.test(cl.base || '')) return '同じ顔、同じ癖。二人は最後まで、もう一人の自分との距離をつかみかねていた。';
        return '同じ人が二人いる。そのことに、二人とも少しずつ慣れていった。';
      }
      return pt0.apply(this, arguments);
    };
    TR.pairText._attr = true;
  }
})();
