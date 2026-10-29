/* 箱庭シミュレーター: 語尾の設定（かんたん）（HK.Ending）
   住人ごとに、語尾（ふだん・問い）・驚いたときの言葉・短い笑い声・前置き・言い切りの多さを決めると、
   口調の辞書（tone-engine.js の形式）を作って、その住人の台詞に当てる。設計は docs/reports/2026-10-25/tone-engine-design.md の 20 章。
   ■ 保存の値 c.ending（住人ごと。ui.js の normChar → attr.js の A.norm → E.norm）
     { base: ''（その人の口調）| 'K' | 'F' | 'P' | 口調の鍵, plain: 'ですぞ', ask: 'ですかな', surprise: 'なんと！', laugh: 'フハハ', lead: 'ふむ', flat: ''（なし）| 'some' | 'often', off: true（使わない） }
     以前の「語尾の付け替え」（toneCustom の文字列）が残っていれば、読み込みのときに plain に写して空にする
     c.toneDict（4000字まで）…「口調の辞書（上級）」（旧「辞書を直接書く（上級）」）。住人ごとの辞書の書き方（tone-engine.js の形式。[口調 …] の見出しは省いてよい）。
       語尾の設定と両方あれば、直接書いた [文末]・[語彙]・[規則]・[効果] を、語尾の設定で作った辞書の上に重ねる（同じ項目は直接書いたほうが勝つ）。off は両方を止める
   ■ 作り方（E.toDict(c) → 辞書の文字列）
     ・ベースの口調の辞書（語彙・規則・効果）を土台にする。語尾を決めたら、ベースの口調の文末の項目は使わない（問いの語尾だけ決めたときは、問いの項目だけ差し替える）
     ・語尾が「です・ます」で始まれば敬語（P）の型（です=ですぞ、ます=ますぞ、ません=ませんぞ…。組み込みの otaku の並び）
     ・それ以外は常体の型：名詞の後ろ（だ・だよ・だね→だぜ）と動詞・形容詞の後ろ（よ・ね・ぞ→ぜ）に分けて当てる（組み込みの kohai・honwaka の並び）。
       ベースの口調が敬語なら、敬語の台詞を常体に崩してから当てる（kohai の「っす」と同じ形）
     ・言い切り：なし（文末の語尾をいつも付ける）／たまに（0.3。語尾のない文には半分だけ付ける）／よく（0.6。語尾のない文には付けない）
   ■ 実行時：鍵は「e:」＋辞書の中身から作る名前（同じ設定なら同じ鍵）。E.toneOf(c) が辞書を登録して鍵を返す。
     HK.TONES・HK.TONE_EXTRA に辞書だけの口調（dictOnly）として載せる（選択欄の並び HK.TONE_KEYS には足さない）。
     台詞の話し手の口調にこの鍵を入れるのは voice.js の processResult と ui-gear.js の見本だけ（箱庭の文面の表はベースの口調のまま） */
(function () {
  'use strict';
  var HK = window.HK, T = HK && HK.Tone;
  if (!HK || !T) return;
  var E = HK.Ending = {};
  function hash(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x).toString(36); }
  var FIELDS = { plain: 12, ask: 12, surprise: 40, laugh: 40, lead: 40 };
  var FORM_TONE = { K: 'gentle', F: 'stern', P: 'polite' };
  var FORM_LABEL = { K: 'くだけた常体', F: '硬い常体', P: '敬語' };

  /* ---------- 値を整える ---------- */
  function cleanText(v, n) { return String(v == null ? '' : v).replace(/[=＝\[\]［］「」『』{}｜|\r\n#＃]/g, '').replace(/^[\s　]+|[\s　]+$/g, '').slice(0, n); }
  /* 語尾：頭の「〜」と終わりの「。」を外す */
  function bare(v) { return String(v || '').replace(/^[〜～~ー\s　]+/, '').replace(/[。\s　]+$/, ''); }
  E.clean = function (e) {
    var o = {};
    if (!e || typeof e !== 'object') return o;
    Object.keys(FIELDS).forEach(function (k) { var v = cleanText(e[k], FIELDS[k]); if (v) o[k] = v; });
    var b = typeof e.base === 'string' ? e.base : '';
    if (b && (FORM_TONE[b] || (HK.toneValid && HK.toneValid(b) && !/^e:/.test(b)))) o.base = b;
    if (e.flat === 'some' || e.flat === 'often') o.flat = e.flat;
    if (e.off) o.off = true;
    return o;
  };
  E.active = function (e) { return !!(e && !e.off && (e.plain || e.ask || e.surprise || e.laugh || e.lead || e.flat)); };
  var DICT_MAX = 4000;
  function dictText(c) { return c && typeof c.toneDict === 'string' ? c.toneDict.replace(/^\s+|\s+$/g, '') : ''; }
  /* 語尾の設定か直接書いた辞書のどちらかを使う住人か */
  E.on = function (c) { return !!(c && !(c.ending && c.ending.off) && (E.active(c.ending) || dictText(c))); };
  /* 古い「語尾の付け替え」（です→っす、だ→だぜ）から、ふだんの語尾を一つ選ぶ */
  function fromCustom(v) {
    var rows = HK.Voice && HK.Voice.toneCustomRows ? HK.Voice.toneCustomRows(v) : [];
    var pick = rows.filter(function (r) { return r[1] && /^(?:です|ます|だ|よ)$/.test(r[0]); })[0] || rows.filter(function (r) { return r[1]; })[0];
    return pick ? cleanText(pick[1], FIELDS.plain) : '';
  }
  /* ui.js normChar（attr.js の A.norm から） */
  E.norm = function (c) {
    var e = E.clean(c.ending);
    if (typeof c.toneCustom === 'string' && c.toneCustom) {
      if (!e.plain) { var p = fromCustom(c.toneCustom); if (p) e.plain = p; }
      c.toneCustom = '';
    }
    c.ending = e;
    c.toneDict = typeof c.toneDict === 'string' ? c.toneDict.slice(0, DICT_MAX) : '';
    return c;
  };
  /* 書き出し・シミュレーションへの受け渡し（値のあるときだけ） */
  E.exportTo = function (o, c) { var e = E.clean(c.ending); if (Object.keys(e).length) o.ending = e; if (dictText(c)) o.toneDict = c.toneDict.slice(0, DICT_MAX); return o; };
  E.importFrom = function (c, o) { if (o && o.ending && typeof o.ending === 'object') c.ending = E.clean(o.ending); if (o && typeof o.toneDict === 'string') c.toneDict = o.toneDict.slice(0, DICT_MAX); };
  E.toInput = function (o, c) { if (!E.on(c)) return o; var e = E.clean(c.ending); if (E.active(e)) o.ending = e; if (dictText(c)) o.toneDict = c.toneDict.slice(0, DICT_MAX); return o; };

  /* ---------- ベースの口調 ---------- */
  function baseTone(c) {
    var b = c && c.ending && c.ending.base;
    if (b && FORM_TONE[b]) return FORM_TONE[b];
    if (b && HK.toneValid && HK.toneValid(b)) return b;
    return HK.toneOf ? HK.toneOf(c) : (c && c.tone) || 'gentle';
  }
  E.baseTone = baseTone;
  function formOf(tone) { return T.baseOf ? T.baseOf(tone, false) : 'K'; }

  /* ---------- 辞書の文字列にする（ベースの口調の辞書を書き戻す） ---------- */
  var RULE_JA = { neg: '否定', prog: '進行', copula: '断定', drop: '助詞落とし', contract: '縮約', emph: '強調語', emphRate: '強調語の割合', exist: '存在', shortCasual: '短い文はため口', mixK: 'ため口を混ぜる',
    lead: '前置き', leadRate: '前置きの割合', surprise: '驚き', laugh: '笑い', flat: '言い切り', shaken: '動揺', shakenRate: '動揺の割合' };
  var FX_JA = { bangOff: '感嘆符を落とす', stretch: '伸ばす', bangOn: '言い切りに！', short: '短くする', stammer: '言いよどみ', dots: '前に……', pause: '間を置く' };
  function endLine(e) { return e[0] + (e[2] ? '(' + e[2].source.replace(/\$$/, '') + ')' : '') + '=' + e[1].join('／'); }
  function ruleVal(k, v) { return Array.isArray(v) ? v.join('／') : v === true ? 'はい' : String(v); }
  var ASK_FROM = /(?:か|かな|かね|かい|の)[？?]?$|[？?]$/;

  /* ---------- 文末の型 ---------- */
  /* 常体の語尾を、名詞の後ろ（n）・動詞と形容詞の後ろ（v）・「〜んだ」の言い換え（x）に分ける */
  var COP = ['でござんす', 'でございます', 'でござる', 'であります', 'でやんす', 'でごわす', 'である', 'なの', 'だ', 'や', 'じゃ'];
  function kParts(e) {
    var c = '', s = e;
    if (/^の/.test(e)) return { n: 'な' + e, v: e, x: e };
    for (var i = 0; i < COP.length; i++) if (e.indexOf(COP[i]) === 0) { c = COP[i]; s = e.slice(c.length); break; }
    if (!c) {
      /* 「っす」「さ」・カタカナの語尾（ナリ）は、名詞の後ろにもそのまま付ける。それ以外（ぜ・わ・にゃ）は「だ」を挟む */
      /* 「〜んだ」の言い換え：っす→んす、さ→んさ。カタカナの語尾（ナリ）は「ん」を挟まない（だったナリ） */
      if (/^[っッさァ-ヶ]/.test(e)) return { n: e, v: e, x: /^[ァ-ヶ]/.test(e) ? e : 'ん' + e.replace(/^[っッ]/, '') };
      c = 'だ';
    }
    if (c === 'なの') return { n: 'なの' + s, v: 'の' + s, x: 'の' + s };
    if (c === 'である') return { n: 'である' + s, v: s, x: 'のである' + s };
    if (/^で/.test(c)) return { n: c + s, v: c + s, x: 'の' + c + s };
    return { n: c + s, v: s, x: 'ん' + c + s };
  }
  /* 問いの語尾を、名詞の後ろ（n）・動詞の後ろ（v）・「の」の後ろ（o）に分ける */
  function qParts(q) {
    if (/^なの/.test(q)) return { n: q, v: q.slice(1), o: q.slice(1) };
    if (/^の/.test(q)) return { n: 'な' + q, v: q, o: q };
    if (/^か/.test(q)) return { n: q, v: q, o: 'の' + q };
    /* 「っすか」「ナリか」：「の」を挟まない（いいの？→いいっすか？） */
    if (/^[っッァ-ヶ]/.test(q)) return { n: q, v: q, o: q };
    return { n: q, v: q, o: 'の' + q };
  }
  /* 動詞・形容詞の終わり（「よろしく」「楽しく」の く、「いよう」「そう」「ありがとう」の う は除く） */
  var VERB = '(?:[るつむぬぶぐたい]|(?<![まで])す|[一-鿿々]んだ|(?<!し)く|(?<![おこごそぞとどのほぼぽもよょろ])う)', VERBQ = '(?:[るつむぬぶぐたい]|(?<![まで])す|(?<!し)く|(?<![おこごそぞとどのほぼぽもよょろ])う)';
  /* 名詞の後ろの「だ」：「飲んだ」（漢字＋んだ の過去）・「まだ」「ただ」（副詞）には当てない。条件の正規表現には「=」を書けない（辞書の「元=先」の区切り） */
  var NOUN_DA = '(?:[^はもがをに、\\s　…‥][また]|[^んまた]|[ぁ-ゖァ-ヶ]ん)';
  var PAST_TA = '[っいしきちにみりびぎえけげせぜてでねべめれ]';
  /* 候補の並び：言い切りが「たまに」なら元のままも混ぜる */
  function alts(to, from, flat, always) {
    if (always || !flat || to === from) return [to];
    return flat === 'often' ? [to, from, from] : [to, from];
  }
  function kEnds(plain, flat) {
    var p = kParts(plain), out = [];
    var add = function (from, cond, to, always) { out.push(from + (cond ? '(' + cond + ')' : '') + '=' + alts(to, from, flat, always).join('／')); };
    ['だよね', 'だよ', 'だね', 'だな', 'だぞ', 'だぜ', 'だわ', 'だ'].forEach(function (f) { add(f, NOUN_DA, p.n, true); });
    ['んだよね', 'んだよ', 'んだね', 'んだな', 'んだぞ', 'んだ'].forEach(function (f) { add(f, '[るたいなうくつ]', p.x, true); });
    ['のだよ', 'のだぞ', 'のだな', 'のだ', 'のよね', 'のよ', 'のね'].forEach(function (f) { add(f, '[るたいなうくつ]', p.x, true); });
    if (p.v) {
      /* 「よね」は念押しなので、語尾が「わ」「す」で終わるなら「よね」を残す（分かるわよね・分かるっすよね）。それ以外は語尾だけ（分かるぜ） */
      add('よね', VERB, /(?:わ|す)$/.test(p.v) ? p.v + 'よね' : p.v, true);
      ['わよ', 'わね', 'じゃん', 'よ', 'ね', 'ぞ', 'ぜ', 'わ', 'さ'].forEach(function (f) { add(f, VERB, p.v, true); });
      add('な', '(?:ている|でいる|てる|でる|ていた|でいた|しい|ない)', p.v, true);
      /* 語尾のない文（なるほど・知っている・助かった）：言い切り「なし」ならいつも、「たまに」なら半分、「よく」なら付けない */
      if (flat !== 'often') {
        var bareAdd = function (from, cond) { out.push(from + (cond ? '(' + cond + ')' : '') + '=' + (flat ? [from + p.v, from] : [from + p.v]).join('／')); };
        bareAdd('ない'); bareAdd('たい'); bareAdd('しい'); bareAdd('いい'); bareAdd('ごい'); bareAdd('る'); bareAdd('た', PAST_TA);
      }
    }
    /* 名詞の後ろの「じゃん」（普通じゃん→普通だぜ）。動詞・形容詞の後ろ（冷たいじゃん）は上の項目が先に当たる */
    add('じゃん', NOUN_DA, p.n, true);
    return out;
  }
  /* 問いの「〜た？」：漢字一字の語幹（寝た・見た・来た・出た）も過去として拾う */
  var PAST_TA_Q = '(?:' + PAST_TA + '|[一-鿿々])';
  /* くだけた常体の問いの形を、問いの語尾に書き換える。長い項目から当たる（tone-engine.js の並べ替え）。
     ・「の」を挟む形（の？・のかな？・んでしょ？・んだ？）は o、名詞の後ろ（なの？・だよね？・本当？）は n、動詞・形容詞の後ろは v
     ・頼みごとの「〜てくれる？」「〜もらえる？」も同じに付ける（敬語の「くれますかな？」と揃える） */
  function kAsk(ask) {
    var q = qParts(ask), out = [];
    var add = function (from, cond, to) { out.push(from + (cond ? '(' + cond + ')' : '') + '=' + to); };
    ['の？', 'のか？', 'のかな？', 'のかい？', 'のかね？', 'んでしょ？', 'んでしょう？', 'んだよね？', 'んだね？'].forEach(function (f) { add(f, '', q.o + '？'); });
    add('のか', '', q.o);
    /* 名詞の後ろの「なの？」（本当なの？→本当かな？・本当っす？）。「みんなの？」は除く */
    add('なの？', '(?:^|[^ん])', q.n + '？');
    /* 「どうしたんだ？」（動詞の後ろの「んだ」）は「の」の形、「読んだ？」（漢字＋んだ の過去）は動詞の形 */
    add('んだ？', '[一-鿿々]', 'んだ' + q.v + '？');
    add('んだ？', VERBQ, q.o + '？');
    /* 「〜か」で始まる問いの語尾（かね・かい）なら、？のない問い（嘘をつけるか）にも付ける */
    if (/^か/.test(q.n)) add('か', VERBQ, q.v);
    /* 念押し・同意を求める問い（分かるでしょ？・そうだよね？・いいじゃん？）も、問いの語尾に置き換える */
    ['か？', 'かな？', 'かい？', 'でしょ？', 'でしょう？', 'よね？', 'ね？', 'じゃん？'].forEach(function (f) { add(f, VERBQ, q.v + '？'); add(f, '', q.n + '？'); });
    ['だよね？', 'だね？'].forEach(function (f) { add(f, NOUN_DA, q.n + '？'); });
    add('る？', '', 'る' + q.v + '？');
    ['ない？', 'たい？', 'しい？', 'いい？', 'つ？', 'す？', 'む？', 'ぶ？', 'ぐ？'].forEach(function (f) { add(f, '', f.slice(0, -1) + q.v + '？'); });
    add('く？', '(?<!し)', 'く' + q.v + '？'); add('う？', '(?<![おこごそぞとどのほぼぽもよょろ])', 'う' + q.v + '？');
    add('た？', PAST_TA_Q, 'た' + q.v + '？');
    /* 形容詞（痛い？・寒い？）。「かい？」「だい？」と、返事の「はい？」は除く */
    add('い？', '[一-鿿々ぁ-ゖ](?<![かだ])(?<!^は)', 'い' + q.v + '？');
    /* 名詞だけの問い（本当？・大丈夫？・ほんと？）：漢字で終わる語と「ほんと」。カタカナ（名前・マジ）は呼びかけ・驚きが多いので当てない */
    add('？', '(?:[一-鿿々]|ほんと)', q.n + '？');
    return out;
  }
  var P_FORMS = ['ませんでした', 'ましたよ', 'ましたね', 'ました', 'ませんよ', 'ませんね', 'ません', 'ますよね', 'ますよ', 'ますね', 'ます', 'でしたよ', 'でしたね', 'でした', 'ですよね', 'ですよ', 'ですね', 'です', 'ましょうね', 'ましょう', 'ございます'];
  function pEnds(plain, flat) {
    var sx = plain.replace(/^(?:です|ます)/, ''), out = [];
    P_FORMS.forEach(function (f) {
      var stem = f.replace(/(?:よね|よ|ね)$/, ''), to = stem + sx;
      if (/^ましょう/.test(f) && /^[ぞなわね]/.test(sx) === false) return;
      out.push(f + '=' + alts(to, f, flat).join('／'));
    });
    return out;
  }
  function pAsk(ask) {
    var out = [];
    if (/^(?:です|ます)/.test(ask) || /^か/.test(ask)) {
      var qx = ask.replace(/^(?:です|ます)/, '');
      if (!/^か/.test(qx)) qx = /^の/.test(qx) ? qx : 'か' + qx;
      [['ですか', 'です'], ['ますか', 'ます'], ['ましたか', 'ました'], ['ませんか', 'ません'], ['でしたか', 'でした'], ['でしょうか', 'です']].forEach(function (x) {
        out.push(x[0] + '？=' + x[1] + qx + '？'); out.push(x[0] + '=' + x[1] + qx);
      });
      [['です？', 'です'], ['ます？', 'ます'], ['ました？', 'ました']].forEach(function (x) { out.push(x[0] + '=' + x[1] + qx + '？'); });
      return out;
    }
    /* 常体の問い（〜なのかしら・〜にゃ）：丁寧形の語幹を活用させて付ける */
    var q = qParts(ask);
    out.push('ですか？=' + q.n + '？', 'ですか=' + q.n, 'でしょうか？=' + q.n + '？', 'ますか？={る}' + q.v + '？', 'ますか={る}' + q.v, 'ましたか？={た}' + q.v + '？', 'ませんか？={ない}' + q.v + '？', 'です？=' + q.n + '？', 'ます？={る}' + q.v + '？');
    return out;
  }
  function isP(s) { return /^(?:です|ます)/.test(s); }

  /* ---------- 辞書を作る ---------- */
  function splitList(v) { return String(v || '').split(/[／\/]/).map(function (x) { return x.replace(/^[\s　]+|[\s　]+$/g, ''); }).filter(Boolean).slice(0, 4); }
  E.labelOf = function (e) { var w = e && (e.plain || e.ask); return '語尾の設定（' + (w ? '〜' + bare(w).replace(/[？?]+$/, '') : 'かんたん') + '）'; };
  /* 住人の画面・要約に出す名前（直接書いた辞書の 名前= があればそれ） */
  E.labelFor = function (c) {
    var u = dictText(c) ? parseUser(dictText(c)) : null, nm = u && u.d && u.d.label;
    if (nm) return nm;
    if (E.active(c && c.ending)) return E.labelOf(c.ending) + (u ? '＋辞書' : '');
    return '自作の辞書（住人ごと）';
  };
  /* 直接書いた辞書を読む：[口調 …] の見出しは外して（中身だけとして扱う）、仮の見出しを付けて T.parse に通す。エラーの行番号は書いた文字列の行に直す */
  var ucache = {};
  function parseUser(text) {
    if (ucache[text]) return ucache[text];
    var n = 0, lines = text.split(/\r?\n/).map(function (l) { if (/^\s*[\[［]\s*口調(?:[\s　][^\]］]*)?[\]］]\s*$/.test(l)) { n++; return ''; } return l; });
    var p = T.parse('[口調 e:tmp]\n' + lines.join('\n'), false), d = p.dicts['e:tmp'] || null;
    var errs = p.errors.map(function (m) { return m.replace(/^(\d+)行目/, function (x, k) { return (+k - 1) + '行目'; }); });
    if (n > 1) errs.push('[口調] は一つ分だけ書けます（見出しを外して、一つの口調として読みました）');
    var bm = text.match(/^\s*ベース\s*[=＝]\s*([KFPkfp])\s*$/m);
    var r = { d: d, errors: errs, base: bm ? bm[1].toUpperCase() : '' };
    if (Object.keys(ucache).length > 30) ucache = {};
    ucache[text] = r;
    return r;
  }
  /* 辞書の本文と、使う情報（鍵・ベース・ベースの口調） */
  function build(c) {
    var e = E.clean(c && c.ending), bt = baseTone(c), f0 = formOf(bt);
    var plain = bare(e.plain), ask = bare(e.ask).replace(/[？?]+$/, '');
    var base = plain ? (isP(plain) ? 'P' : f0 === 'P' ? 'K' : f0) : ask && isP(ask) ? 'P' : f0;
    /* 常体の語尾で敬語の問い（「〜ですかな」）なら、問いも常体に寄せる（かな）。その逆（敬語に「〜かね」）はそのまま */
    if (base !== 'P' && isP(ask)) ask = ask.replace(/^(?:です|ます)/, '');
    var bd = T.dictOf(bt), same = bd && bd.base === base;
    var ends = [], words = [], rules = {}, fx = {};
    if (same) {
      bd.ends.forEach(function (x) { var q = ASK_FROM.test(x[0]); if ((plain && !q) || (ask && q)) return; ends.push(endLine(x)); });
      bd.words.forEach(function (w) { words.push(w[0] + '=' + w[1].join('／')); });
      Object.keys(bd.rules || {}).forEach(function (k) { if (RULE_JA[k] && bd.rules[k] != null && bd.rules[k] !== false) rules[k] = ruleVal(k, bd.rules[k]); });
      Object.keys(bd.effects || {}).forEach(function (k) { if (FX_JA[k] && bd.effects[k]) fx[k] = 'はい'; });
    }
    var flat = e.flat || '';
    if (plain) ends = (base === 'P' ? pEnds(plain, flat) : kEnds(plain, flat)).concat(ends);
    if (ask) ends = (base === 'P' ? pAsk(ask) : kAsk(ask)).concat(ends);
    if (e.surprise) rules.surprise = splitList(e.surprise).join('／');
    if (e.laugh) rules.laugh = splitList(e.laugh).join('／');
    if (e.lead) { rules.lead = splitList(e.lead).join('／'); rules.leadRate = '0.3'; }
    /* 言い切りは、いつも書く（0 でも書く：問いに言い切りの語尾を当てない細かい整え方が効くように） */
    rules.flat = flat === 'often' ? '0.6' : flat === 'some' ? '0.3' : (same && bd.rules && bd.rules.flat != null ? String(bd.rules.flat) : '0');
    /* 直接書いた辞書を上に重ねる：文末・語彙は前に置き（先に当たる）、同じ元の文末は語尾の設定の項目を外す。規則・効果は上書き */
    var ut = e.off ? '' : dictText(c), u = ut ? parseUser(ut) : null, ud = u && u.d, head = [], label = E.active(e) ? E.labelOf(e) : '自作の辞書（住人ごと）';
    if (ud) {
      if (u.base) base = u.base;
      var bareFrom = function (k) { return k.replace(/\(.*\)$/, ''); }, mine = {};
      ud.ends.forEach(function (x) { mine[x[0]] = 1; });
      ends = ud.ends.map(endLine).concat(ends.filter(function (l) { return !mine[bareFrom(l.split('=')[0])]; }));
      words = ud.words.map(function (w) { return w[0] + '=' + w[1].join('／'); }).concat(words);
      Object.keys(ud.rules || {}).forEach(function (k) { if (RULE_JA[k] && ud.rules[k] != null && ud.rules[k] !== false) rules[k] = ruleVal(k, ud.rules[k]); });
      Object.keys(ud.effects || {}).forEach(function (k) { if (FX_JA[k]) { if (ud.effects[k]) fx[k] = 'はい'; else delete fx[k]; } });
      if (ud.fp) head.push('一人称=' + [ud.fp.m, ud.fp.f, ud.fp.x].join('|'));
      if (ud.you) head.push('二人称=' + ud.you);
      if (ud.persona) head.push('態度=' + ud.persona);
      if (ud.label) label = ud.label;
    }
    var body = head.concat(['ベース=' + base, '[文末]'], ends, ['[語彙]'], words, ['[規則]'], Object.keys(rules).map(function (k) { return RULE_JA[k] + '=' + rules[k]; }), ['[効果]'], Object.keys(fx).map(function (k) { return FX_JA[k] + '=' + fx[k]; }));
    var key = 'e:' + hash(bt + '#' + label + '#' + body.join('\n'));
    return { key: key, base: base, tone: bt, e: e, label: label, uerr: u ? u.errors : [], text: ['[口調 ' + key + ']', '名前=' + label].concat(body).join('\n') };
  }
  E.toDict = function (c) { return build(c).text; };

  /* ---------- 登録 ---------- */
  var cache = {};
  var SKIP = { derive: 1, noBang: 1, sample: 1, sampleF: 1, sampleM: 1, neutral: 1, axis: 1, label: 1, desc: 1, dictOnly: 1 };
  function register(b) {
    if (cache[b.key]) return cache[b.key];
    var p = T.setEnding(b.key, b.text), d = p.dicts[b.key];
    var r = { key: b.key, errors: p.errors, ok: !!d };
    cache[b.key] = r;
    if (!d) return r;
    var bi = (HK.toneInfo && HK.toneInfo(b.tone)) || {}, info = {};
    if (!HK.PERSONA[b.tone]) Object.keys(bi).forEach(function (k) { if (!SKIP[k]) info[k] = bi[k]; });
    info.label = b.label;
    info.desc = 'ベースの口調「' + ((bi && bi.label) || b.tone) + '」の文面で、設定した語尾で話します（住人の設定の「語尾の設定（かんたん）」「口調の辞書（上級）」）';
    info.base = d.persona || (HK.PERSONA[b.tone] ? b.tone : bi.base);
    if (d.fp) info.fp = d.fp;
    if (!info.top && HK.TONE_TOP && HK.TONE_TOP[b.tone]) info.top = HK.TONE_TOP[b.tone];
    /* 一人称の既定（住人の一人称の欄が空のとき）：ベースの口調のもの（基本の口調は態度ごとの表 voice.js の FP_DEF から） */
    if (!info.fp && HK.Voice && HK.Voice.fpDefault && HK.PERSONA[b.tone]) info.fp = { m: HK.Voice.fpDefault({ persona: b.tone, gender: 'm' }), f: HK.Voice.fpDefault({ persona: b.tone, gender: 'f' }), x: HK.Voice.fpDefault({ persona: b.tone, gender: 'x' }) };
    info.group = b.base === 'P' ? 'polite' : bi.group === 'polite' ? 'soft' : bi.group;
    info.dictOnly = true;
    info.endingOf = b.tone;
    /* 設定した語尾は、性別の語尾の仕上げ（〜ぜ→〜よ など）で直さない */
    info.axis = { polite: b.base === 'P' ? 2 : 0, attitude: bi.firm ? 'firm' : 'plain', ending: 'm' };
    if (HK.TONES) HK.TONES[b.key] = info;
    if (HK.TONE_EXTRA) HK.TONE_EXTRA[b.key] = info;
    if (HK.TONE_YOU) { var y = d.you || HK.TONE_YOU[b.tone]; if (y) HK.TONE_YOU[b.key] = y; }
    return r;
  }
  /* 台詞の話し手の口調：語尾の設定を使う住人は e:… の鍵、使わない住人はいつもの口調 */
  E.toneOf = function (c) {
    if (E.on(c)) { var r = register(build(c)); if (r.ok) return r.key; }
    return HK.toneOf ? HK.toneOf(c) : (c && c.tone) || '';
  };
  E.check = function (c) { var b = build(c), r = register(b); return { key: b.key, text: b.text, errors: b.uerr.concat(b.uerr.length ? [] : r.errors) }; };

  /* ---------- 見本（住人の設定の画面） ---------- */
  /* 長めの3文：箱庭で実際に使われている台詞をもとにした（rel-core-extra.js の食料を譲る場面・白い部屋の幼なじみの場面、mini-serifu.js の al_hold）。
     気遣い（言い切り）・言い合い（！）・謝って問いかける（？）の3種で、驚き・笑い・前置き・問い・言い切りの効き方を見る */
  E.LONG = [
    '{n}「こういうの、もうやめて。あなたが倒れたら意味がない｜こういうのは、もうやめろ。あなたが倒れたら意味がない｜こういうの、もうやめてください。あなたが倒れたら意味がありません」',
    '{n}「こっちの台詞。子どものころ物置に閉じ込められたのも、あなたのせいだった！｜こちらの台詞だ。子どものころ物置に閉じ込められたのも、あなたのせいだった！｜こちらの台詞です。子どものころ物置に閉じ込められたのも、あなたのせいでした！」',
    '{n}「{o}、あのときは疑ってごめん。……まだ、私と組んでてくれる？｜{o}、あのときは疑ってすまなかった。……まだ、私と組んでくれるか？｜{o}さん、あのときは疑ってすみません。……まだ、私と組んでいてくれますか？」'
  ];
  E.preview = function (c, o) {
    var V = HK.Voice, out = { lines: [], errors: [] };
    if (!V || !V.processText || !c) return out;
    var on = E.on(c), chk = on ? E.check(c) : null;
    if (chk) out.errors = chk.errors;
    o = o || { name: '相手', gender: '' };
    var me = { name: c.name, fp: c.fp || '', you: c.you || '', marks: c.marks || '', gender: c.gender || '', tone: E.toneOf(c), persona: HK.personaOf ? HK.personaOf({ tone: c.tone, eg: c.eg }) : 'gentle' };
    var ppl = [me, { name: o.name, fp: '', gender: o.gender || '', tone: '', persona: 'gentle' }];
    var nm = new RegExp('^' + String(c.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    /* 名前に「$&」などがあっても置き換えの記号として読まないよう、関数で差し込む */
    out.lines = (HK.TONE_SAMPLE || []).concat(E.LONG).map(function (t) { return V.processText(t.replace(/\{n\}/g, function () { return c.name; }).replace(/\{o\}/g, function () { return o.name; }), ppl).replace(nm, ''); });
    return out;
  };

  /* ---------- 辞書のサンプル（「サンプルを入れる」。住人の「辞書を直接書く」から） ----------
     head は [口調 …] の見出しつきで使うときの見出し（住人の欄では見出しなし。箱庭全体の辞書は廃止）。足すときはこの並びに一つ足す */
  E.SAMPLES = [
    { id: 'gozaru', label: 'ござる（侍）', head: '[口調 ござる]\n名前=ござる（侍）', text: [
      '# 「〜でござる」の侍の口調の見本。# で始まる行は説明で、辞書としては読み飛ばされます',
      '# ベース：どの文を土台にするか（K＝くだけた常体、F＝硬い常体、P＝敬語）。ござるは敬語の文の「です・ます」を置き換えて作る',
      'ベース=P',
      '# 一人称・二人称：住人の設定の欄が空のときに使う（「男|女|その他」の順で3つ書いてもよい）',
      '一人称=拙者',
      '二人称=そなた',
      '# 文末：文の終わり（。！？の手前）だけに効く「元=先」。／で候補を並べると、くじで一つ選ぶ。長い項目が先に当たる',
      '# 「？」付きの項目は問いの文だけに当たる。{る}{た}{ない}{よう} は「ます」の前を活用させる印（帰りましょう→帰ろう）',
      '[文末]',
      'ですか？=でござるか？',
      'ですか=でござるか',
      'ですね=でござるな',
      'ですよ=でござるよ',
      'んですよ=のでござるよ',
      'んです=のでござる',
      'でした=でござった',
      'でしょうか=でござろうか',
      'でしょう=でござろう',
      'です=でござる',
      'ますか？=まするか？',
      'ますか=まするか',
      'ていますね=ておるな',
      'ていますか=ておりまするか',
      'ています=ておりまする',
      'ますね=まするな',
      'ますよ=まするぞ',
      'ました=ましたぞ／申した',
      'ませんでした=ませなんだ',
      'ません=ませぬ',
      'ましょう={よう}ぞ',
      'ます=まする',
      'ください=くだされ',
      'てください=てくだされ',
      'ないでください=ないでくだされ',
      '# 語彙：文のどこでも効く言葉の置き換え（長い言葉から当たる）',
      '[語彙]',
      'ありがとうございます=かたじけない',
      'ありがとう=かたじけない',
      'すみません=面目ない',
      'ごめんなさい=申し訳ござらぬ',
      'すごい=見事',
      '本当に=まことに',
      '# 規則：前置き（台詞の頭の一言）・驚き（え・うそ などを置き換え）・笑い（はは・ふふ などを置き換え）・言い切り（よ・ね を落とす割合）',
      '[規則]',
      '前置き=ふむ。／して、',
      '前置きの割合=0.3',
      '驚き=なんと！／むむっ……',
      '笑い=はっはっは',
      '言い切り=0.2'
    ].join('\n') }
  ];
  E.sampleDict = function (id, withHead) { var x = E.SAMPLES.filter(function (s) { return s.id === id; })[0]; return x ? (withHead ? x.head + '\n' : '') + x.text + '\n' : ''; };
  E.sampleSel = function (attr) { return '<select ' + attr + ' aria-label="入れるサンプル">' + E.SAMPLES.map(function (x) { return '<option value="' + escH(x.id) + '">' + escH(x.label) + '</option>'; }).join('') + '</select>'; };
  /* 欄に入れる（中身があれば置き換えるか確かめる）。入れたら input を出して、保存と見本の描き直しを各画面の入力の処理に任せる */
  E.insertSample = function (ta, id, withHead) {
    if (!ta) return false;
    var v = E.sampleDict(id, withHead);
    if (!v) return false;
    if (ta.value.replace(/\s+/g, '') && typeof window.confirm === 'function' && !window.confirm('いまの内容を置き換えますか？')) return false;
    ta.value = v;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };
  if (typeof document !== 'undefined') document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('[data-endact="sample"]');
    if (!b) return;
    var box = b.closest('.gendict'), sel = box && box.querySelector('[data-endsel]');
    E.insertSample(box && box.querySelector('[data-gf="end:dict"]'), sel ? sel.value : 'gozaru', false);
  });

  /* ---------- 画面の欄（ui-gear.js の話し方の節から） ---------- */
  var css = '.gend{margin:10px 0 0;border:1px solid var(--line);border-radius:var(--r-card,6px);padding:6px 10px}.gend summary{cursor:pointer;font-size:13px;color:var(--muted)}.gend summary b{color:var(--ink);font-weight:600}.gend .gendon{font-size:12px;margin-left:6px;color:var(--accent)}.gend .gendsub{font-size:11.5px;margin-left:8px;color:var(--muted)}.gendict .endsample{margin-top:10px}' +
    '.gend .gearrow input[type=text]{width:11em}.gend .enderr{color:#D7263D;color:var(--hot,#D7263D);font-size:12px;line-height:1.6;margin:4px 0 0}.gend .endsample .tsl{display:block}.gendb{font-size:11px;color:var(--ink);border:1px solid var(--ink);border-radius:3px;padding:0 6px;white-space:nowrap}';
  if (typeof document !== 'undefined' && document.head) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  function escH(s) { return (HK.escape || function (x) { return String(x); })(s); }
  function sampleHtml(c, o) {
    var p = E.preview(c, o), err = p.errors.length ? '辞書の読み込みで問題があります：' + p.errors.join(' / ') : '';
    return { err: err, html: '<span class="tsh">' + (E.on(c) ? '語尾の設定・辞書で言い換えた見本（' + escH(E.labelFor(c)) + '）' : '語尾を決めるか辞書を書くと、ここに見本が出ます（いまはふだんの口調）') + '</span>' + p.lines.map(function (l) { return '<span class="tsl">' + escH(l) + '</span>'; }).join('') };
  }
  /* 折りたたみの開閉：住人ごとに、この画面を開いているあいだ覚える（性別などを変えて設定の窓を描き直しても閉じないように）。
     既定は、語尾の設定は使っているとき、口調の辞書（上級）は辞書を書いているときに開く */
  var openK = {};
  function isOpen(c, k, def) { var v = openK[(c && c.id) + ':' + k]; return v == null ? def : v; }
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('toggle', function (ev) {
    var d = ev.target;
    if (d && d.getAttribute && d.getAttribute('data-endk') && d.getAttribute('data-cid')) openK[d.getAttribute('data-cid') + ':' + d.getAttribute('data-endk')] = d.open;
  }, true);
  E.badge = function (c) { return '<span class="gendb" id="endbadge"' + (E.on(c) ? '' : ' hidden') + '>語尾の設定を使う</span>'; };
  /* h.part：'easy' は語尾の設定（かんたん）だけ、'dict' は口調の辞書（上級）と読み込みの問題だけ、無ければ両方。
     住人タブの「口調・喘ぎの設定」は easy と dict を続けて、⚙設定の「口調」は easy だけを出す（ui-voice.js の VS.basicHtml。2026-10-28 担当LI） */
  E.gearHtml = function (c, o, h) {
    var e = c.ending || {}, opt = h.opt, esc = h.esc;
    var keys = (HK.TONE_KEYS || []).filter(function (k) { return !/^e:/.test(k); });
    var cur = HK.toneOf ? HK.toneOf(c) : c.tone;
    var baseSel = '<select data-gf="end:base" aria-label="語尾の設定のベースの口調">' + opt('', 'この人の口調（' + ((HK.toneInfo && HK.toneInfo(cur) || {}).label || cur) + '）', e.base || '') +
      ['K', 'F', 'P'].map(function (k) { return opt(k, '文の形：' + FORM_LABEL[k], e.base || ''); }).join('') +
      keys.map(function (k) { var t = HK.toneInfo && HK.toneInfo(k); return t ? opt(k, t.label, e.base || '') : ''; }).join('') + '</select>';
    var inp = function (k, label, ph, title) { return '<label' + (title ? ' title="' + esc(title) + '"' : '') + '>' + label + ' <input type="text" data-gf="end:' + k + '" value="' + esc(e[k] || '') + '" maxlength="' + FIELDS[k] + '" placeholder="' + esc(ph) + '"></label>'; };
    var st0 = function (on) { return on ? '使う' : e.off ? '使わない' : '未設定'; };
    var cid = esc(c.id || '');
    var easy = '<details class="gend" data-endk="e" data-cid="' + cid + '"' + (isOpen(c, 'e', E.active(e)) ? ' open' : '') + '><summary><b>語尾の設定（かんたん）</b><span class="gendon">' + st0(E.active(e)) + '</span></summary>' +
      '<p class="gearhint">例文の語尾を、同じ法則で書き換えます（です→ですぞ・ます→ますぞ・ません→ませんぞ、だ・だよ→だぜ・よ・ね→ぜ のように）。決めた欄だけが効き、空の欄はベースの口調のままです。一人称・二人称は上の欄を使います。</p>' +
      '<div class="gearrow"><label>ベースの口調 ' + baseSel + '</label><label title="語尾の設定と「口調の辞書（上級）」の両方を止めます（書いた中身は残ります）"><input type="checkbox" data-gf="end:off"' + (e.off ? ' checked' : '') + '> いまは使わない</label></div>' +
      '<div class="gearrow">' + inp('plain', '語尾（ふだん）', '例：〜ですぞ／〜だぜ／〜なのよ', '「です・ます」で始まれば敬語の語尾、それ以外は常体の語尾として扱います') + inp('ask', '語尾（問い）', '例：〜ですかな？／〜か？／〜なのかしら？') + '</div>' +
      '<div class="gearrow">' + inp('surprise', '驚いたとき', '例：なんと！／うわ、まじで', '文頭の「え」「うそ」「マジ」などを置き換えます。／で区切ると候補を4つまで') + inp('laugh', '短い笑い声', '例：フハハ／ふふ／にしし', '「はは」「ふふ」などを置き換えます') + '</div>' +
      '<div class="gearrow">' + inp('lead', '前置き（任意）', '例：やれやれ／ふむ', '台詞の頭にときどき付ける一言（3回に1回くらい）') +
      '<label>言い切り <select data-gf="end:flat" aria-label="言い切りを使う">' + opt('', 'なし（語尾をいつも付ける）', e.flat || '') + opt('some', 'たまに', e.flat || '') + opt('often', 'よく', e.flat || '') + '</select></label></div>' +
      '</details>';
    if (h.part === 'easy') return easy;
    var s = sampleHtml(c, o);
    var dict =
      /* 口調の辞書（上級）：住人ごとの辞書を直接書く欄（語尾の設定の上に重ねる）と、語尾の設定・辞書で言い換えた台詞の見本（全文）。
         見本は上の「台詞の見本」（1行ずつ切り替わる）と重なるので、辞書の欄と一緒に折りたたむ（既定は閉じる。辞書を書いている住人は開く。2026-10-27 の利用者の要望） */
      '<details class="gend gendict" data-endk="d" data-cid="' + cid + '"' + (isOpen(c, 'd', !!dictText(c)) ? ' open' : '') + '><summary><b>口調の辞書（上級）</b><span class="gendon gdon">' + st0(!!dictText(c) && !e.off) + '</span><span class="gendsub">辞書を直接書く・言い換えた台詞の見本</span></summary>' +
      '<p class="gearhint">この住人だけの口調の辞書を書けます（住人ごとの辞書の書き方。[口調 …] の見出しと名前は省けます）。語尾の設定と両方あるときは、ここに書いた [文末]・[語彙]・[規則]・[効果] を上に重ね、同じ項目はこちらが勝ちます。</p>' +
      '<p class="gearhint" style="white-space:pre-wrap">' + esc(T.help ? T.help() : '') + '</p>' +
      '<div class="gearrow"><label>サンプル ' + E.sampleSel('data-endsel') + '</label><button type="button" class="btn ghost small" data-endact="sample">サンプルを入れる</button><span class="gearhint" style="margin:0"># で始まる行は説明です（読み飛ばされます）</span></div>' +
      '<textarea data-gf="end:dict" rows="8" maxlength="' + DICT_MAX + '" spellcheck="false" aria-label="この住人の口調の辞書" style="width:100%;font-size:13px;font-family:inherit" placeholder="' + esc('[文末]\nです=でござる\nます=まする\n[語彙]\nありがとう=かたじけない\n[規則]\n前置き=さて') + '">' + esc(c.toneDict || '') + '</textarea>' +
      '<div class="tonesample endsample" id="endsample" aria-live="polite">' + s.html + '</div></details>' +
      /* 辞書の読み込みの問題は、閉じていても見えるように折りたたみの外に */
      '<p class="enderr" id="enderr"' + (s.err ? '' : ' hidden') + '>' + esc(s.err) + '</p>';
    return h.part === 'dict' ? dict : easy + dict;
  };
  /* 欄の入力。扱った欄なら true */
  E.gearField = function (c, f, t, isInput, changed, refresh, other) {
    if (!/^end:/.test(f || '')) return false;
    var k = f.slice(4), e = c.ending || {};
    if (k === 'dict') { c.toneDict = String(t.value).slice(0, DICT_MAX); }
    else if (k === 'off') { if (isInput) return true; e.off = !!t.checked; }
    else if (k === 'base' || k === 'flat') { if (isInput) return true; e[k] = t.value; }
    else if (FIELDS[k]) e[k] = String(t.value).slice(0, FIELDS[k]);
    else return true;
    c.ending = isInput ? e : E.clean(e);
    changed(false);
    var s = sampleHtml(c, other);
    /* 書き換えるのは、入力した欄のある画面（[data-vroot]：⚙設定の「口調」か「口調・喘ぎの設定」）の中だけ（両方に同じ欄があるため） */
    var root = (t && t.closest && t.closest('[data-vroot]')) || document;
    var box = root.querySelector('#endsample'), er = root.querySelector('#enderr'), bd = root.querySelector('#endbadge');
    if (box) box.innerHTML = s.html;
    if (er) { er.textContent = s.err; er.hidden = !s.err; }
    if (bd) bd.hidden = !E.on(c);
    var la = root.querySelector('.gend[data-endk="e"] .gendon'), ld = root.querySelector('.gend[data-endk="d"] .gendon'), ce = E.clean(e), st1 = function (on) { return on ? '使う' : ce.off ? '使わない' : '未設定'; };
    if (la) la.textContent = st1(E.active(ce));
    if (ld) ld.textContent = st1(!!dictText(c) && !ce.off);
    if (refresh) refresh();
    return true;
  };
})();
