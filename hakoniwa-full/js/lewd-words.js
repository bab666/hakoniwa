/* 箱庭シミュレーター: 性的な語の印（R18版のみ）
   R18の文では、性器などの語を {男性器} {亀頭} {女性器} {陰核} {ナカ} {胸} {乳首} {尻} {後ろ} {精液} {愛液} {股間} の印で書く。
   結果の文を仕上げるとき（HK.Voice.processResult のあと。part-words.js の言い換えより前）に、印を語に置き換える。
   ■ 列（表 TABLE の n＝小説調、e＝男性向け。d＝直接／s＝やわらか／b＝ぼかす、m＝医学的）
     ・地の文：描写の作風（env.style。novel／ero）× 描写の有無（env.lewd。low＝ぼかす／mid＝やわらか／high＝直接）
     ・台詞：話し手の態度（HK.personaOf の9種）。shy・tsun＝ぼかす、devoted・gentle・polite＝やわらか、proud・free＝直接、
       cool・stern＝小説調では医学的・男性向けでは直接。作風が男性向けなら男性向けの列。話し手の分からない台詞（モブなど）は地の文と同じ
     ・住人の設定「性器の呼び方」（partWords：soft＝ぼかす／direct＝直接／medical＝医学的）があれば、台詞は話し手の、
       地の文はその体の持ち主（「名前の{男性器}」のいちばん近い「名前の」）の設定を優先。自由記入（partM・partF）は {男性器}・{女性器} に使う
     ・（2026-10-27）「名前の」のない地の文は、文と場から持ち主を推し量る（guessOwner：その場の住人でその体を持つ人がただ一人なら、その人。
       住人でない人の語がある文・「〇〇の」と住人でない人の体と分かる印には当てない）。台詞の話し手は「名前「」の形のほか、台詞の区分（e._sq）からも取る。
       自由記入は、台詞でも地の文でも、その人の体の語にだけ使う（台詞の中の持ち主は quoteOwner）
   ■ 同じ文の同じ印は同じ語にする。候補が二つ以上あれば、文から決まる番号（hash）から始めて、その回でまだ使っていない語を選ぶ（emotion.js の X.word と同じ考え方）
   ■ 点検のときは HK.LewdWords.MODE = 'direct' で、いつも「直接」の列を使う（ぼかした語だと pos-audit が性器の取り違えを見逃すため）
   ■ V10（pos-audit）：{男性器}・{亀頭} の印なのに、その場の住人の誰にも男性器がない／{女性器}・{陰核} なのに誰にも女性器がない、を HK.LewdWords.V10 にためる
   ■ 印が残ったときの後始末（全年齢モード・この表がないとき）は両ビルド共通の lewd-mark.js
   書き方の決まりは docs/reports/2026-10-26/lewd-words.md */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!HK) return;
  /* 語の表。各マスは「／」区切りで1〜3語。どの語も「の・を・が・に」に続けられる名詞。「お」の付け外しは語の側で持つ */
  var T = {
    '男性器': { nd: '肉棒／男根', ns: '昂り／熱いもの', nb: 'もの', ed: 'ちんぽ／肉棒', es: '肉棒／竿', eb: 'モノ', m: '陰茎／ペニス' },
    '亀頭': { nd: '亀頭', ns: '先端', nb: '先端', ed: '亀頭', es: '亀頭／先っぽ', eb: '先っぽ', m: '亀頭' },
    '女性器': { nd: '秘所／秘裂', ns: '秘めたところ／脚の間', nb: 'そこ', ed: 'まんこ／おまんこ', es: 'おまんこ／割れ目', eb: 'あそこ', m: '膣／陰部' },
    '陰核': { nd: '陰核／肉芽', ns: '花芯', nb: '敏感な芽', ed: 'クリ／クリトリス', es: 'クリ', eb: '敏感なところ', m: '陰核' },
    'ナカ': { nd: 'ナカ', ns: '中', nb: '奥', ed: 'ナカ', es: 'ナカ', eb: '中', m: '体内' },
    '胸': { nd: '乳房', ns: '胸／膨らみ', nb: '胸', ed: 'おっぱい', es: 'おっぱい／胸', eb: '胸', m: '乳房' },
    '乳首': { nd: '乳首', ns: '胸の先', nb: '胸の先', ed: '乳首', es: '乳首', eb: '胸の先', m: '乳頭' },
    '尻': { nd: '尻', ns: 'お尻', nb: 'お尻', ed: 'ケツ／お尻', es: 'お尻', eb: 'お尻', m: '臀部' },
    '後ろ': { nd: '後孔', ns: '後ろ', nb: '後ろ', ed: 'アナル／ケツ穴', es: 'アナル／お尻の穴', eb: '後ろ', m: '肛門' },
    '精液': { nd: '白濁／精液', ns: '精／白濁', nb: '精', ed: '精液／ザーメン', es: '精液／白濁', eb: '白濁', m: '精液' },
    '愛液': { nd: '愛液', ns: '蜜', nb: '蜜', ed: '愛液／まん汁', es: '愛液', eb: '蜜', m: '分泌液' },
    '股間': { nd: '股間', ns: '脚の間／股間', nb: '脚の間', ed: '股間', es: '股間', eb: '股', m: '陰部' }
  };
  var KEYS = Object.keys(T);
  var TABLE = {};
  KEYS.forEach(function (k) { TABLE[k] = {}; Object.keys(T[k]).forEach(function (c) { TABLE[k][c] = T[k][c].split('／'); }); });
  var RE = new RegExp('\\{(' + KEYS.join('|') + ')\\}', 'g');
  var MARK = '⁤';
  /* 台詞の態度 → 列（n＝小説調の列。e＝男性向けの列） */
  var PERSONA_COL = {
    shy: { n: 'nb', e: 'eb' }, tsun: { n: 'nb', e: 'eb' },
    devoted: { n: 'ns', e: 'es' }, gentle: { n: 'ns', e: 'es' }, polite: { n: 'ns', e: 'es' },
    proud: { n: 'nd', e: 'ed' }, free: { n: 'nd', e: 'ed' },
    cool: { n: 'm', e: 'ed' }, stern: { n: 'm', e: 'ed' }
  };
  var PART_COL = { soft: 'b', direct: 'd', medical: 'm' };
  var LV_COL = { low: 'b', mid: 's', high: 'd' };
  var OWN = { '男性器': 'm', '亀頭': 'm', '女性器': 'f', '陰核': 'f' };
  /* 判定用の直接の語（HK.Pos.MALE_RE・pos-nogen.js の FEM などに当たる語） */
  var DIRECT = { '男性器': 'ちんぽ', '亀頭': '亀頭', '女性器': 'まんこ', '陰核': '陰核', 'ナカ': 'ナカ', '胸': '胸', '乳首': '乳首', '尻': '尻', '後ろ': 'アナル', '精液': '精液', '愛液': '愛液', '股間': '股間' };
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  var P = function () { return HK.Pos; };
  function hasM(c) { var Q = P(); if (Q && Q.hasM) return Q.hasM(c); return c.gender === 'm'; }
  function hasF(c) { var Q = P(); if (Q && Q.hasF) return Q.hasF(c); return c.gender === 'f'; }
  function ero(env) { return HK.Lewd && HK.Lewd.ero ? HK.Lewd.ero(env) : !!(env && env.style === 'ero'); }
  function lv(env) { return HK.Lewd && HK.Lewd.lv ? HK.Lewd.lv(env) : (env && env.lewd) || 'mid'; }
  /* 地の文の列 */
  function narrCol(ctx) {
    var pre = ero(ctx.env) ? 'e' : 'n';
    if (X.MODE === 'direct') return pre + 'd';
    return pre + (LV_COL[lv(ctx.env)] || 's');
  }
  /* 住人の設定から列を決める（設定がなければ null） */
  function partCol(c, ctx) {
    if (!c || !PART_COL[c.partWords]) return null;
    var k = PART_COL[c.partWords];
    return k === 'm' ? 'm' : (ero(ctx.env) ? 'e' : 'n') + k;
  }
  /* 台詞の列 */
  function quoteCol(who, ctx) {
    if (X.MODE === 'direct') return narrCol(ctx);
    if (!who) return narrCol(ctx);
    var pc = partCol(who, ctx);
    if (pc) return pc;
    var pk = PERSONA_COL[who.persona];
    if (!pk) return narrCol(ctx);
    return ero(ctx.env) ? pk.e : pk.n;
  }
  /* 台詞の話し手：「名前「」の形（part-words.js の speaker() と同じ）。あとで e.seg（話し手つきの区分）に切り替えるときはここだけ直す */
  function speakerOf(text, start, people) {
    if (X.speakerHook) { var r = X.speakerHook(text, start, people); if (r !== undefined) return r; }
    var pre = text.slice(Math.max(0, start - 20), start).split(MARK).join('');
    var hit = null;
    people.forEach(function (c) { if (c.name && pre.slice(-c.name.length) === c.name && (!hit || c.name.length > hit.name.length)) hit = c; });
    return hit;
  }
  /* 地の文の印の持ち主：直前の「名前の」（part-words.js と同じ。間に句読点・助詞が入れば持ち主なし） */
  function ownerOf(sent, off, people) {
    var before = sent.slice(Math.max(0, off - 14), off).split(MARK).join('');
    var best = null, bi = -1;
    people.forEach(function (c) {
      if (!c.name) return;
      var m = before.match(new RegExp(esc(c.name) + '(?:の|が持つ)(?=[^。、「」のにをがはでとへ]{0,6}$)'));
      if (m && m.index > bi) { bi = m.index; best = c; }
    });
    return best;
  }
  /* 住人でない人（モブ・客・魔物など）を指す語。この語が出る文では、「名前の」のない印の持ち主を推し量らない（その人の体のこともあるため） */
  var MOB_RE = /客|男(?!性器)|女(?!性器)|店長|店員|スタッフ|セラピスト|職人|施術者|施術師|院長|支配人|医者|医師|先生|教師|上司|社長|部長|課長|審査員|司会|監督|カメラマン|相手|誰か|向こう|獲物|触手|魔物|ゾンビ|オーク|ゴブリン|スライム|悪魔|インキュバス|サキュバス|獣|狼|蔦|機械|ロボット|看守|兵|盗賊|山賊|村人|おじさん|研修生|新人|二人のスタッフ|彼(?!女)|彼女/;
  /* 「名前の」のない印の持ち主を推し量る（2026-10-27）：住人の設定「性器の呼び方」を、名前の書かれていない地の文にも効かせる。
     ・「自分の{男性器}」：その文の主語（印より前で、いちばん初めの「名前は／が」）
     ・「〇〇の{男性器}」（住人でない名前・相手・彼 など）：住人でない人の体なので持ち主なし
     ・それ以外：その文に名前の出る住人（いなければ、その出来事の場にいる住人）のうち、その体を持つ人（男性器・亀頭は男性器のある人、
       女性器・陰核は女性器のある人）がただ一人なら、その人。胸・ナカなど誰にでもある体は、候補の全員の設定が同じときだけその設定（列）。
     ・住人でない人の体のことがある文には当てない：文に住人でない人の語（MOB_RE）がある、または場にいる住人が一人で、
       相手（モブ）の体が箱庭から分からない（e.npcG がない）出来事の、本文に住人でない人の語があるとき。
       e.npcG（箱庭が記録に付ける、相手のモブの体：'m'／'f'／'mf'／''＝モブなし）があれば、モブにその体がないときだけ当てる */
  function guessOwner(sent, off, key, ctx) {
    var people = ctx.people, before = sent.slice(Math.max(0, off - 10), off).split(MARK).join('');
    var sentC = sent.split(MARK).join('');
    var named = people.filter(function (c) { return c.name && sentC.indexOf(c.name.split(MARK).join('')) >= 0; });
    if (/(?:自分|己)の$/.test(before)) {
      var head = sentC.slice(0, Math.max(0, sentC.indexOf(before))), sb = null, si = 1e9;
      named.forEach(function (c) { var nm = c.name.split(MARK).join(''), m = head.match(new RegExp(esc(nm) + '(?:は|が|も)')); if (m && m.index < si) { si = m.index; sb = c; } });
      return sb ? { one: sb } : null;
    }
    /* 「〇〇の」のすぐあと（その・この などの指示語は除く）：住人でない人の体 */
    if (/[^\s。、「」！？…―]の$/.test(before) && !/(?:^|[^ぁ-ん])[そこあど]の$/.test(before)) return null;
    var need = OWN[key], npc = ctx.npcG;
    if (npc != null) { if (need && npc.indexOf(need) >= 0) return null; }
    else if (MOB_RE.test(sentC) || ((ctx.here || []).length <= 1 && MOB_RE.test(ctx.evText || ''))) return null;
    var pool = named.length ? named : (ctx.here || []);
    var cands = pool.filter(function (c) { return !need || (need === 'm' ? hasM(c) || !!c.omA : hasF(c)); });
    if (!cands.length) return null;
    if (need) return cands.length === 1 ? { one: cands[0] } : null;
    /* 誰にでもある体：全員の列が同じときだけ */
    var cols = cands.map(function (c) { return partCol(c, ctx) || ''; });
    return cols[0] && cols.every(function (x) { return x === cols[0]; }) ? { col: cols[0] } : null;
  }
  /* 一語を選ぶ。同じ文の同じ印（同じ列）は同じ語。候補が複数なら、まだ使っていない語から */
  function pick(key, col, ctx, seedStr) {
    var memoK = col + '|' + key;
    if (ctx.memo[memoK]) return ctx.memo[memoK];
    var arr = (TABLE[key] && TABLE[key][col]) || TABLE[key].ns;
    var k0 = hash(seedStr + '|' + key + '|' + col) % arr.length, w = arr[k0], best = 1e9;
    for (var d = 0; d < arr.length; d++) {
      var t = arr[(k0 + d) % arr.length], u = ctx.used[t] || 0;
      if (u < best) { best = u; w = t; }
    }
    ctx.used[w] = (ctx.used[w] || 0) + 1;
    ctx.memo[memoK] = w;
    return w;
  }
  /* 一つの印を語にする。who＝台詞の話し手（地の文なら null）、owner＝体の持ち主 */
  /* 自由記入（partM・partF）は、その人の体の語にだけ使う（台詞でも、話し手の体とは限らないので、体の持ち主で見る。2026-10-27） */
  function wordFor(key, ctx, who, owner, seedStr, inQ) {
    var c = owner;
    if (X.MODE !== 'direct' && c) {
      if (key === '男性器' && c.partM) return c.partM;
      if (key === '女性器' && c.partF) return c.partF;
    }
    var col = inQ ? quoteCol(who, ctx) : (X.MODE !== 'direct' && partCol(owner, ctx)) || narrCol(ctx);
    return pick(key, col, ctx, seedStr);
  }
  /* V10：その場の住人の誰にも、その印の体がない */
  function checkV10(key, ctx, text) {
    var need = OWN[key];
    if (!need || !ctx.here || !ctx.here.length) return;
    /* 男性器の印：オメガバースで挿れる側の体で書く女性のα（omA。applyResult で付ける）も持ち主として数える（pos-audit の V1・V4 の例外と同じ考え方） */
    var ok = ctx.here.some(function (c) { return need === 'm' ? hasM(c) || !!c.omA : hasF(c); });
    if (ok) return;
    if (X.V10.length < 2000) X.V10.push({ mk: key, scen: ctx.scen || '', names: ctx.here.map(function (c) { return c.name.split(MARK).join(''); }), text: String(text).split(MARK).join('') });
  }
  /* 一続きの地の文を、文ごとに置き換える */
  function narrSeg(seg, ctx, seed) {
    return seg.split(/(?<=[。！？\n])/).map(function (sent) {
      if (sent.indexOf('{') < 0) return sent;
      ctx.memo = {};
      return sent.replace(RE, function (m, key, off) {
        var owner = ctx.people.length ? ownerOf(sent, off, ctx.people) : null;
        /* 「名前の」がなければ、文と場から持ち主を推し量る（点検の direct では推し量らない） */
        if (!owner && X.MODE !== 'direct' && ctx.people.length) {
          var g = guessOwner(sent, off, key, ctx);
          if (g && g.one) owner = g.one;
          else if (g && g.col) return pick(key, g.col, ctx, seed + sent.length + '|' + off);
        }
        return wordFor(key, ctx, null, owner, seed + sent.length + '|' + off, false);
      });
    }).join('');
  }
  /* 台詞の中の印の持ち主（自由記入を使ってよいか）：「名前の」→その人、「私の・俺の…」→話し手、「あなたの・お前の…」→話し手でない、
     それ以外は、その場の住人のうち、その体を持つ人がただ一人ならその人（話し手を含む）。住人でない人を指す「〇〇の」なら持ち主なし */
  var FP_OWN = /(?:私|わたし|あたし|俺|おれ|オレ|僕|ぼく|ボク|自分|うち|ウチ|わし|わらわ|拙者|我|あたい|わたくし|それがし)の$/;
  var YOU_OWN = /(?:あなた|あんた|お前|おまえ|君|きみ|キミ|おぬし|貴方|貴女|そなた|てめえ|テメエ|お客様|お客さん)の$/;
  function quoteOwner(q, off, key, who, ctx) {
    var before = q.slice(Math.max(0, off - 12), off).split(MARK).join('');
    var named = null, bi = -1;
    ctx.people.forEach(function (c) {
      if (!c.name) return;
      var nm = c.name.split(MARK).join(''), m = before.match(new RegExp(esc(nm) + '(?:さん|くん|君|ちゃん|様|さま)?の(?=[^。、！？「」]{0,6}$)'));
      if (m && m.index > bi) { bi = m.index; named = c; }
    });
    if (named) return named;
    var need = OWN[key], has = function (c) { return !need || (need === 'm' ? hasM(c) || !!c.omA : hasF(c)); };
    if (FP_OWN.test(before)) return who && has(who) ? who : null;
    var here = (ctx.here || []).slice();
    if (who && here.indexOf(who) < 0) here.push(who);
    if (YOU_OWN.test(before)) { var oth = here.filter(function (c) { return c !== who && has(c); }); return oth.length === 1 ? oth[0] : null; }
    if (/[^\s。、「」！？…―]の$/.test(before) && !/(?:^|[^ぁ-ん])[そこあど]の$/.test(before)) return null;
    if (!need) return null;
    var cands = here.filter(has);
    return cands.length === 1 ? cands[0] : null;
  }
  /* 「名前「」の形でない台詞の話し手：台詞の区分（voice.js が記録に隠して持たせる e._sq。voice-seg.js の HK.Seg.keep）から。
     区分の数と本文の「」の数が合うときだけ使う */
  function segWho(text, qs, ctx) {
    var sq = ctx.sq, Sg = HK.Seg;
    if (!sq || !sq.length || !Sg || !Sg.quotes) return null;
    var Q = ctx.sqQ || (ctx.sqQ = Sg.quotes(text));
    if (Q.length !== sq.length) return null;
    for (var k = 0; k < Q.length; k++) if (Q[k].a === qs) { var w = sq[k] && sq[k].w; return w >= 0 && (sq[k].k === 's' || sq[k].k === 'm') ? ctx.people[w] || null : null; }
    return null;
  }
  /* 本文の印を置き換える。ctx: { env, people:[{name, persona, gender, genital, partWords, partM, partF}], here:[その場の住人], used, scen } */
  function resolve(text, ctx) {
    if (!text || typeof text !== 'string' || text.indexOf('{') < 0) return text;
    RE.lastIndex = 0;
    if (!RE.test(text)) return text;
    RE.lastIndex = 0;
    ctx = ctx || {};
    ctx.people = ctx.people || [];
    ctx.used = ctx.used || {};
    ctx.memo = {};
    var seed = String(hash(text.split(MARK).join('')));
    if (ctx.v10 !== false) { var found = {}; text.replace(RE, function (m, k) { found[k] = 1; return m; }); Object.keys(found).forEach(function (k) { checkV10(k, ctx, text); }); }
    var out = '', depth = 0, buf = '', qs = -1;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '「') {
        if (depth === 0) { out += narrSeg(buf, ctx, seed); buf = ''; qs = i; }
        depth++; buf += ch; continue;
      }
      if (ch === '」' && depth > 0) {
        depth--; buf += ch;
        if (depth === 0) {
          if (buf.indexOf('{') >= 0) {
            var who = speakerOf(text, qs, ctx.people) || segWho(text, qs, ctx), memo0 = ctx.memo;
            ctx.memo = {};
            buf = buf.replace(RE, function (m, key, off) { return wordFor(key, ctx, who, X.MODE === 'direct' ? null : quoteOwner(buf, off, key, who, ctx), seed + '|q' + qs + '|' + off, true); });
            ctx.memo = memo0;
          }
          out += buf; buf = '';
        }
        continue;
      }
      buf += ch;
    }
    return out + narrSeg(buf, ctx, seed);
  }
  /* 結果の住人（processResult の people と同じ作り） */
  function peopleOf(res, input) {
    return (input.chars || []).map(function (c, i) {
      var r = (res && res.chars && res.chars[i]) || (res && res.heroes && res.heroes[i]) || {};
      var persona = r.persona || (HK.personaOf ? HK.personaOf({ tone: c.tone, eg: c.eg }) : '');
      return { name: c.name || '', persona: persona, gender: c.gender || '', pos: c.pos || '', futa: !!c.futa, genital: c.genital || '', src: c,
        partWords: PART_COL[c.partWords] ? c.partWords : '', partM: (c.partM || '').trim(), partF: (c.partF || '').trim() };
    });
  }
  /* その出来事の場にいる住人：出来事の登場人物（番号か住人）と、本文に名前が出る人 */
  function hereOf(e, people) {
    var set = [];
    (e && e.actors || []).forEach(function (x) {
      var p = typeof x === 'number' ? people[x] : x && x.i != null ? people[x.i] : null;
      if (p && set.indexOf(p) < 0) set.push(p);
    });
    var t = e && typeof e.text === 'string' ? e.text : '';
    people.forEach(function (p) { if (p.name && t.indexOf(p.name) >= 0 && set.indexOf(p) < 0) set.push(p); });
    return set;
  }
  /* 結果全体（記録・結末・住人のメモ）の印を置き換える */
  function applyResult(res, input) {
    if (!res || !input) return res;
    var people = peopleOf(res, input), used = {}, env = input.env || {}, scen = input.scenId || '';
    /* オメガバースで挿れる側の体で書いた人（V10 の数え方）：第二性を優先して女性のαの攻めを挿れる側で書いた組（HK.Pos.maleTop。omega-heat.js の OM.bodyKind が記録）の攻めと、
       オメガバースの箱庭でαの人（途中で第二性が替わった人は元の第二性も見る）。性器を決めて男性器がない人は除く（OM.bodyKind と同じ） */
    var Q = P(), mt = (Q && Q.maleTop) || {}, omF = res && res.end && res.end.omega, mtK = Object.keys(mt);
    people.forEach(function (p, i) {
      if (!p.name) return;
      var alpha = !!(omF && ((omF.sex && omF.sex[i] === 'a') || (omF.orig && omF.orig[i] === 'a')));
      var top = mtK.some(function (k) { return k.split('\u0001')[0] === p.name; });
      if ((alpha || top) && !(Q && Q.genSet && Q.genSet(p) && !hasM(p))) p.omA = true;
    });
    var base = function (here) { return { env: env, people: people, here: here, used: used, scen: scen }; };
    (res.log || []).forEach(function (e) {
      if (!e || typeof e.text !== 'string' || e.text.indexOf('{') < 0) return;
      /* 持ち主の推し量りに使う：相手のモブの体（e.npcG）・本文・台詞の区分（e._sq） */
      var cx = base(hereOf(e, people));
      cx.npcG = typeof e.npcG === 'string' ? e.npcG : null; cx.evText = e.text; cx.sq = e._sq || null;
      e.text = resolve(e.text, cx);
    });
    var E = res.ending || res.end;
    if (E) {
      if (Array.isArray(E.lines)) E.lines = E.lines.map(function (l) { return typeof l === 'string' ? resolve(l, base(null)) : l; });
      if (typeof E.text === 'string') E.text = resolve(E.text, base(null));
    }
    (res.chars || []).forEach(function (c) { if (typeof c.fateNote === 'string') c.fateNote = resolve(c.fateNote, base(null)); if (Array.isArray(c.notes)) c.notes = c.notes.map(function (n) { return typeof n === 'string' ? resolve(n, base(null)) : n; }); });
    return res;
  }
  var X = HK.LewdWords = {
    TABLE: TABLE, KEYS: KEYS, RE: RE, PERSONA_COL: PERSONA_COL,
    MODE: null,          /* 'direct'＝点検用（いつも直接の列） */
    V10: [],             /* 点検用：体のない印 */
    speakerHook: null,   /* (text, start, people) → 話し手（undefined なら既定の判定） */
    resolve: resolve,
    applyResult: applyResult,
    peopleOf: peopleOf,
    /* 結果の外で作った文（見本など）を、地の文の列で置き換える */
    plain: function (text, env) { return resolve(text, { env: env || {}, people: [], v10: false }); },
    /* 判定用：印を、決まった直接の語に戻す（生成の途中で本文の言葉を見る判定 pos-nogen.js などのため。表示には使わない） */
    direct: function (text) { return typeof text !== 'string' ? text : text.replace(RE, function (m, k) { return DIRECT[k] || m; }); }
  };
  if (!V || !V.processResult) return;
  var pr0 = V.processResult;
  V.processResult = function (res, input) {
    var r = pr0.apply(this, arguments);
    if (HK.SAFE_ON || !res || !input) return r;
    try { applyResult(res, input); } catch (e) { /* 印の置き換えに失敗しても結果は返す（残った印は lewd-mark.js が後始末する） */ }
    return r;
  };
})();
