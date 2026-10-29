/* 住人の名前が言い換えで壊れていないかの点検（「飯塚」→「ご飯塚」、「君島」→「あなた島」、「私市」→「俺市」など）
   使い方: node name-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=4] [r18|safe|''] [箱庭id,…] [--why] [--no-probe] [--json=出力.json]
   ・言い換えの語（飯・腹・酒・金・胸・君・兄・母・私・本当・剛直・快楽…）を名前に含む住人（NAMES の約40人。一字の名前・「飯塚」と「飯塚太郎」・記号のある名前も）を
     順に配役し、口調は全口調（HK.TONE_KEYS）を順に回す。相手ごとの呼び方（calls：名前の頭の字＋ちゃん「飯ちゃん」）・敬称（call）・一人称に自分の名前（fp）も混ぜる
   ・4 回に 1 回は描写を「ぼかす」（lewd=low）にして、結果の地の文に当たる全年齢の語の置き換え（HK.SafeText・催眠の「ぼかす」の語）も通す
   ・同じ種・同じ設定で、名前だけを言い換えに当たらない字（柊・椿・榊…。字の種類と長さは同じ）にした回（双子）も回し、
     双子の名前を元の名前に戻した文と、本番の文とを記録ごとに比べる。違う所が名前（呼び名を含む）に触れていれば「壊れた」と数える
       接頭辞：名前の前に語が付いた（ご飯塚・お腹巻）
       一部  ：名前の中の字が別の語になった・名前がまるごと別の語になった（おっぱい元・あなた島・俺市）。結果の住人の名前そのものが変わったものも
     名前に触れない違い（文の言い換えのくじが名前の字で変わったもの。名前ごと足された・消えた呼びかけ、名前の後ろの言い回しの違いも）は
     「参考：名前に触れない違い」に数える（壊れではない）
   ・台詞の見本：全口調 × 全名前 × 文の型（「〈名前〉、おはよう！」「〈名前〉くん、昨日はごめんね」「私は〈名前〉だ。腹が減った」…。R18版は性器の語・喘ぎも）を、
     台詞の仕上げ全部（HK.Voice.processResult）に通して、同じく双子と比べる（--no-probe で省く）
   ・名前の伏せ字（voice.js の HK.NameGuard。U+9FA6〜U+9FFE・U+E100〜U+E1FF）が結果の文（記録・seg・結末・注記）に残っていないか（印の残り）も数える。目標はどれも 0
   環境変数 NAMES=飯塚,飯沼,… で名前の一覧を差し替えられる */
'use strict';
const fs = require('fs');
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 4, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), JS = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7);
  if (!dir) { console.error('使い方: node name-audit.js <ビルド> [回数] [r18|safe|\'\'] [箱庭id,…] [--why]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode);
  const NAMES0 = (process.env.NAMES || '').split(',').filter(Boolean);
  const PROBE = !process.argv.includes('--no-probe');
  const r = await page.evaluate(({ N, only, WHY, NAMES0, PROBE }) => {
    const HK = window.HK;
    /* 言い換えの語を含む名前（飯→ご飯、腹→お腹、酒→お酒、金→お金、胸・乳・尻・竿・穴・玉・中出・奥（体の語）、君・様・貴様（二人称）、私・僕・俺（一人称）、
       兄・姉・母・父（家族の呼び方）、先生、本当（関西弁 ほんま）、嘘・子供・大人（辞書の語）。一字の名前・長い名前（飯塚太郎）・記号のある名前（飯田！）も） */
    const NAMES = NAMES0.length >= 6 ? NAMES0 : ['飯塚', '酒井', '金子', '腹巻', '胸元', '君島', '飯沼', '竿本', '男鹿', '女川', '様々', '先生', '母里', '父島', '兄上', '姉崎',
      '大人', '子供', '嘘月', '本当', '私市', '乳井', '尻無', '奥村', '玉木', '穴山', '中出', '僕田', '俺山', '飯田！', '飯塚太郎', '飯', '胸', 'メシ', 'ムネ', '御飯', 'お腹', '剛直', '快楽'];
    /* 双子の名前に使う字（言い換えに当たらない字。漢字・カタカナ・ひらがな・記号ごと） */
    const POOL = { k: '柊椿榊楠槙樫柾桐檜栞梓楓柚萩欅椎楢榎樺椛梶杣槻柘桂杜棗', K: 'ヰヱヴヵヶ', h: 'ゐゑゔゕゖ' };
    const TWIN_RE = new RegExp('[' + POOL.k + POOL.K + POOL.h + ']', 'g');
    const kind = ch => /[一-鿿々]/.test(ch) ? 'k' : /[ァ-ヶー]/.test(ch) ? 'K' : /[ぁ-ゖ]/.test(ch) ? 'h' : '';
    const tones = HK.TONE_KEYS.slice();
    const out = { n: { pre: 0, part: 0, mark: 0 }, noise: 0, entries: 0, runs: 0, desync: 0, byTone: {}, byName: {}, bySc: {}, ex: { pre: [], part: [], mark: [], noise: [] }, err: [] };
    const lim = WHY ? 80 : 6;
    function rnd(s) { let x = s; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; }
    /* 文字の差分（Myers の O(ND)）。[{a0,a1,b0,b1}] の違う区間を返す */
    function diffSpans(a, b) {
      let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
      let q = 0; while (q < a.length - p && q < b.length - p && a[a.length - 1 - q] === b[b.length - 1 - q]) q++;
      const A = a.slice(p, a.length - q), B = b.slice(p, b.length - q), n = A.length, m = B.length;
      if (!n && !m) return [];
      if (n * m > 4e6 || n + m > 6000) return [{ a0: p, a1: p + n, b0: p, b1: p + m }];
      const max = n + m, off = max, V = new Int32Array(2 * max + 2), trace = [];
      let found = false;
      for (let d = 0; d <= max && !found; d++) {
        trace.push(V.slice());
        for (let k = -d; k <= d; k += 2) {
          let x = (k === -d || (k !== d && V[off + k - 1] < V[off + k + 1])) ? V[off + k + 1] : V[off + k - 1] + 1, y = x - k;
          while (x < n && y < m && A[x] === B[y]) { x++; y++; }
          V[off + k] = x;
          if (x >= n && y >= m) { found = true; break; }
        }
      }
      /* 道をさかのぼって、違う所を集める */
      const ops = []; let x = n, y = m;
      for (let d = trace.length - 1; d > 0; d--) {
        const Vd = trace[d], k = x - y;
        const pk = (k === -d || (k !== d && Vd[off + k - 1] < Vd[off + k + 1])) ? k + 1 : k - 1;
        const px = Vd[off + pk], py = px - pk;
        while (x > px && y > py) { x--; y--; }
        if (x === px) ops.push({ t: '+', a: x, b: py }); else ops.push({ t: '-', a: px, b: y });
        x = px; y = py;
      }
      ops.reverse();
      const sp = [];
      ops.forEach(o => {
        const L = sp[sp.length - 1];
        if (o.t === '+') { if (L && L.a1 === o.a && L.b1 === o.b) L.b1++; else sp.push({ a0: o.a, a1: o.a, b0: o.b, b1: o.b + 1 }); }
        else { if (L && L.a1 === o.a && L.b1 === o.b) L.a1++; else sp.push({ a0: o.a, a1: o.a + 1, b0: o.b, b1: o.b }); }
      });
      return sp.map(s => ({ a0: s.a0 + p, a1: s.a1 + p, b0: s.b0 + p, b1: s.b1 + p }));
    }
    /* 文の中の名前・呼び名の位置 */
    function spansOf(t, words) {
      const r = [];
      words.forEach(w => { if (!w) return; let i = -1; while ((i = t.indexOf(w, i + 1)) >= 0) r.push([i, i + w.length, w]); });
      return r;
    }
    /* 結果の中の文字列をすべて集める（記録の文・seg・終わりの文・住人の注記） */
    /* 伏せ字（voice.js の HK.NameGuard）の範囲 */
    const MARK_RE = /[\u9FA6-\u9FFE\uE100-\uE1FF]/;
    function texts(res, withSeg) {
      const L = [];
      (res.log || []).forEach(e => { if (e && typeof e.text === 'string') L.push(e.text); if (withSeg && e && Array.isArray(e.seg)) e.seg.forEach(x => { if (x && typeof x.s === 'string') L.push(x.s); }); });
      const E = res.ending || res.end;
      if (E) { (E.lines || []).forEach(l => { if (typeof l === 'string') L.push(l); }); if (typeof E.text === 'string') L.push(E.text); }
      (res.chars || []).forEach(c => { if (c && typeof c.fateNote === 'string') L.push(c.fateNote); (c && c.notes || []).forEach(n => { if (typeof n === 'string') L.push(n); }); });
      return L;
    }
    let ni = 0, ti = 0, cur = '';
    const hit = (k, name, tone, msg) => {
      out.n[k]++; out.bySc[cur][k] = (out.bySc[cur][k] || 0) + 1;
      if (name) out.byName[name] = (out.byName[name] || 0) + 1;
      if (tone) out.byTone[tone] = (out.byTone[tone] || 0) + 1;
      if (out.ex[k].length < lim) out.ex[k].push(cur + ' | ' + msg);
    };
    /* 本番の文 a と、双子の名前を戻した文 b を比べて、名前に触れる違いを数える（hit(種類, 名前, 口調, 文)）。名前に触れない違いは o.noise */
    function classify(a, b, words, cast, toneOf, hit, o, loose) {
      if (a === b) return;
      const sp = diffSpans(a, b), nms = spansOf(b, words);
      sp.forEach((d, di) => {
        /* 前後 6字以内に、名前に触れないほかの違いがある（段落ごと別の文になった）なら、名前の壊れではなく文の選び方の違い */
        const nameish = e => nms.some(x => e.b0 <= x[1] && e.b1 >= x[0]);
        const lone = (!sp[di - 1] || d.b0 - sp[di - 1].b1 >= 6 || nameish(sp[di - 1])) && (!sp[di + 1] || sp[di + 1].b0 - d.b1 >= 6 || nameish(sp[di + 1]));
        const ctx = () => b.slice(Math.max(0, d.b0 - 30), d.b0) + '【' + b.slice(d.b0, d.b1) + '→' + a.slice(d.a0, d.a1) + '】' + b.slice(d.b1, d.b1 + 20);
        const as = a.slice(d.a0, d.a1), bs = b.slice(d.b0, d.b1);
        /* 名前の中に触れる（名前の字の一部だけが変わった）、または名前がまるごと別の短い語になった：一部 */
        const short = as.length <= 6 && bs.length <= 6 && !/\n/.test(as + bs) && !words.some(w => as.indexOf(w) >= 0);
        const inside = short && nms.find(x => d.b0 < x[1] && d.b1 > x[0] && (d.b0 > x[0] || d.b1 < x[1]) && d.b0 >= x[0] - 1 && d.b1 <= x[1] + 1);
        const whole = !inside && short && as && nms.find(x => d.b0 === x[0] && d.b1 === x[1] && as.length <= 4);
        /* 名前のすぐ前に語が足された：接頭辞（ご飯塚・お腹巻）。本番の文でも、足された語のすぐ後ろに同じ名前が続き、足された語がほかの住人の名前の一部でないときだけ
           （双子の回と別の文になり、本番の住人「御飯」の「御」と双子の「飯塚太郎」の頭がたまたま並んだだけのものは数えない） */
        const inAName = () => spansOf(a, words).some(y => y[0] <= d.a0 && y[1] >= d.a1);
        const before = lone && /[ごお御]$/.test(as) && !inAName() ? nms.find(x => d.b0 === x[0] && d.b1 === x[0] && a.startsWith(x[2], d.a1)) : null;
        const owner = x => cast.find(nm => x[2].indexOf(nm) === 0 || (x[2].charAt(0) === nm.charAt(0) && /ちゃん$/.test(x[2]))) || x[2];
        /* 本番の文の同じ位置に、ほかの住人の名前がある（双子の回と話の筋が分かれて別の人の話になった）なら壊れではない */
        const other = x => { const ax = x[0] + (d.a0 - d.b0); return spansOf(a, words).some(y => y[2] !== x[2] && y[0] <= ax && y[1] > ax); };
        const hx = lone ? [inside, whole].find(x => x && !other(x)) : null;
        /* 双子と記録の数が合わない回（話の筋が分かれた回）は、名前の位置の違いを壊れとは数えない（参考：筋の分かれた回の名前の違い） */
        if (hx && loose) { o.loose = (o.loose || 0) + 1; if (o.ex.noise.length < lim) o.ex.noise.push(cur + ' | （筋が分かれた回）' + ctx()); }
        else if (hx) { const nm = owner(hx); hit('part', nm, toneOf(nm), nm + ' | ' + ctx()); }
        else if (before) { const nm = owner(before); hit('pre', nm, toneOf(nm), nm + ' | ' + ctx()); }
        else { o.noise++; if (o.ex.noise.length < lim) o.ex.noise.push(cur + ' | ' + ctx()); }
      });
    }
    /* 双子の名前：字ごとに、同じ種類の、言い換えに当たらない字へ（同じ字は同じ字へ） */
    function twinsOf(cast) {
      const tw = {}, used = { k: 0, K: 0, h: 0 };
      const twin = cast.map(nm => nm.split('').map(ch => { const k = kind(ch); if (!k) return ch; if (!tw[ch]) tw[ch] = POOL[k][used[k]++ % POOL[k].length]; return tw[ch]; }).join(''));
      const back = {}; Object.keys(tw).forEach(ch => { back[tw[ch]] = ch; });
      return { twin, unTwin: t => t.replace(TWIN_RE, c => back[c] || c) };
    }
    HK.SCEN_ORDER.forEach(id => {
      const sc = HK.SCENARIOS[id]; if (!sc || (only && only.indexOf(id) < 0)) return;
      cur = id; out.bySc[id] = { runs: 0 };
      const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
      for (let s = 0; s < N; s++) {
        /* 配役：名前は一覧を順に（同じ回に包含関係の名前も入るよう、ときどき「飯塚」と「飯塚太郎」を並べる） */
        const cast = [];
        for (let i = 0; i < n; i++) cast.push(NAMES[(ni++) % NAMES.length]);
        if (s % 4 === 3 && cast.indexOf('飯塚') < 0 && cast.indexOf('飯塚太郎') < 0 && n >= 2) { cast[0] = '飯塚'; cast[1] = '飯塚太郎'; }
        for (let i = 0; i < n; i++) while (cast.indexOf(cast[i]) !== i) cast[i] = NAMES[(ni++) % NAMES.length];
        const { twin, unTwin } = twinsOf(cast);
        const rr = rnd(1000 + s * 77 + id.length), eg = [], tn = [], gd = [];
        for (let i = 0; i < n; i++) { eg.push({ CP: Math.round(rr() * 20), NP: Math.round(rr() * 20), A: Math.round(rr() * 20), FC: Math.round(rr() * 20), AC: Math.round(rr() * 20) }); tn.push(tones[(ti++) % tones.length]); gd.push(i % 3 === 0 ? 'm' : i % 3 === 1 ? 'f' : ''); }
        const mk = names => names.map((nm, i) => {
          const c = { name: nm, eg: eg[i], memo: '', gender: gd[i], likes: '', tone: tn[i], fp: '', pos: '', color: '', call: '', calls: {}, loveLock: '' };
          /* 呼び方：くん付け・相手の名前の頭の字＋ちゃん（「飯ちゃん」）・一人称に自分の名前 */
          if ((i + s) % 4 === 0) c.call = 'kun';
          if ((i + s) % 4 === 1 && n > 1) { const to = names[(i + 1) % n]; c.calls[to] = to.charAt(0) + 'ちゃん'; }
          if ((i + s) % 5 === 2 && !/[！]/.test(nm)) c.fp = nm;
          return c;
        });
        const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        if (s % 2) (sc.env || []).forEach((e, k) => {
          if (e.max != null && /lewd|dose|shady|heat|npc|prey|depth|skill|monsters|pleasure|traffic|ev$/.test(e.id)) env[e.id] = e.max;
          else if (e.options && e.options.some(o => o.v === 'high') && /lewd/.test(e.id)) env[e.id] = 'high';
          else if (e.options && e.options.length > 1 && !/lewd|^mode$/.test(e.id) && (s + k) % 2) env[e.id] = e.options[(s + k) % e.options.length].v;
          if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
        });
        /* 描写を「ぼかす」回（R18版の lewd-unify.js・催眠の「ぼかす」の語の置き換え。全年齢の言い換え HK.SafeText が地の文に当たる） */
        if (s % 4 === 2) (sc.env || []).forEach(e => { if (/lewd/.test(e.id) && e.options && e.options.some(o => o.v === 'low')) env[e.id] = 'low'; });
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        const perChar = () => cast.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' }));
        const ties = s % 3 === 2 && n > 1 ? [{ a: 0, b: 1, type: 'lover' }] : [];
        let A, B;
        try {
          A = HK.simulate({ scenId: id, seed: 12345 + s * 101, env: Object.assign({}, env), chars: mk(cast), perChar: perChar(), ties });
          B = HK.simulate({ scenId: id, seed: 12345 + s * 101, env: Object.assign({}, env), chars: mk(twin), perChar: perChar(), ties });
        } catch (e) { out.err.push(id + ':' + s + ' ' + (e && e.message)); continue; }
        out.runs++; out.bySc[id].runs++;
        /* 名前の印の残り */
        texts(A, true).forEach(t => { if (MARK_RE.test(t)) hit('mark', '', '', t.slice(0, 100)); });
        /* 住人の名前そのもの（結果の住人の name）が変わっていないか */
        (A.chars || []).forEach((c, i) => { if (c && typeof c.name === 'string' && i < cast.length && c.name !== cast[i]) hit('part', cast[i], tn[i], cast[i] + ' | 結果の住人の名前が「' + c.name + '」'); });
        const ta = texts(A), tb = texts(B).map(unTwin);
        let pairs, loose = false;
        if (ta.length === tb.length) pairs = ta.map((t, k) => [t, tb[k]]);
        else { out.desync++; loose = true; pairs = [[ta.join('\n'), tb.join('\n')]]; }
        /* 呼び名（呼び方・敬称つきの名前）も名前の位置に数える */
        const words = cast.slice().concat(cast.map(nm => nm.charAt(0) + 'ちゃん')).sort((a, b) => b.length - a.length);
        const toneOf = nm => tn[cast.indexOf(nm)] || '';
        pairs.forEach(([a, b]) => { out.entries++; classify(a, b, words, cast, toneOf, hit, out, loose); });
      }
    });
    /* ---------- 台詞の見本：全口調 × 全名前 × 文の型を、台詞の仕上げ全部（HK.Voice.processResult。口調・辞書・書き下ろし・呼び方・性器の語・冷静の言い換え）に通す ----------
       話し手（アキラ。口調を順に）が名前の住人に話しかける文と、名前の住人自身の台詞（一人称に自分の名前を使う回も）。双子の名前の結果と比べる */
    const P = out.probe = { n: { pre: 0, part: 0 }, lines: 0, noise: 0, byTone: {}, byName: {}, ex: { pre: [], part: [], noise: [] } };
    if (PROBE && HK.Voice && HK.Voice.processResult) {
      const MARK = HK.NAME_MARK || '\u2064', wordish = n => /^(?:[\u4e00-\u9fff\u3005]{1,2}|[\u3041-\u3096]{1,3})$/.test(n);
      const TPL = ['{S}「{N}、おはよう！」', '{S}「{N}くん、昨日はごめんね」', '{S}「{N}さんのことが、好きです」', '{S}「私、{N}と一緒に行く。{N}は？」',
        '{S}「{N}君、ちょっと待ってくれ」', '{S}「……{N}、お前のことが好きだ」', '{S}「{N}様、こちらへどうぞ」', '{S}は{N}の顔を見た。「{N}、飯でも食いに行こうぜ」',
        '{N}「私は{N}だ。腹が減った。飯にしよう」', '{N}「{S}、私のこと、どう思う？」', '{S}「{N}って、本当に嘘が下手だな」', '{S}は{N}に「{N}の兄さん、大人だね」と言った。'];
      /* R18版：性器の語・喘ぎの台詞（性器の呼び方の言い換え・喘ぎの語尾の整えが名前に当たらないか） */
      if (!HK.SAFE_ON && HK.LewdWords) TPL.push('{S}「{N}の肉棒、熱い……っ」', '{N}の{男性器}が{S}の{ナカ}を押し広げた。{S}「あっ、{N}……♡」', '{N}「{S}の膣、きつい……っ」');
      const SN = 'アキラ';
      cur = '（台詞の見本）';
      const hitP = (k, name, tone, msg) => { P.n[k]++; if (name) P.byName[name] = (P.byName[name] || 0) + 1; if (tone) P.byTone[tone] = (P.byTone[tone] || 0) + 1; if (P.ex[k].length < lim) P.ex[k].push(msg); };
      tones.forEach((t, tk) => NAMES.forEach((nm, k) => {
        const { twin, unTwin } = twinsOf([nm]);
        /* 呼び方・一人称・性器の呼び方の設定は、口調ごとにずらす（どの名前もすべての組み合わせに当たるように） */
        const c3 = (k + tk) % 3, c2 = (k + tk) % 2;
        const run = nmX => {
          const mk = x => wordish(x) ? MARK + x : x, nS = mk(SN), nN = mk(nmX);
          const chars = [
            { name: nS, tone: t, gender: tk % 3 === 0 ? 'm' : tk % 3 === 1 ? 'f' : '', fp: '', call: c3 === 0 ? 'kun' : '', calls: c3 === 1 ? { [nN]: nmX.charAt(0) + 'ちゃん' } : {}, eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }, partWords: c2 ? 'soft' : 'direct' },
            { name: nN, tone: t, gender: k % 3 === 0 ? 'f' : k % 3 === 1 ? 'm' : '', fp: c2 ? nmX : '', call: '', calls: {}, eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }, partWords: c2 ? 'direct' : 'soft' }
          ];
          const res = { log: TPL.map(x => ({ text: x.replace(/\{S\}/g, nS).replace(/\{N\}/g, nN), actors: [0, 1], lewd: /男性器|肉棒|膣/.test(x) })), chars: chars.map(c => ({ name: c.name })) };
          try { HK.Voice.processResult(res, { scenId: 'variety', chars, env: {} }); } catch (e) { out.err.push('見本 ' + t + ' ' + nmX + ' ' + (e && e.message)); }
          return res.log.map(e => String(e.text).split(MARK).join(''));
        };
        const A = run(nm), B = run(twin[0]).map(unTwin);
        A.forEach(x => { if (MARK_RE.test(x)) { out.n.mark++; if (out.ex.mark.length < lim) out.ex.mark.push('見本 | ' + x); } });
        const words = [nm, nm.charAt(0) + 'ちゃん'];
        A.forEach((a, i) => { P.lines++; classify(a, B[i], words, [nm], () => t, hitP, P); });
      }));
    }
    if (HK.NameGuard && HK.NameGuard.stack.length) { out.n.mark++; out.ex.mark.push('伏せ字の表が戻っていない（HK.NameGuard.stack ' + HK.NameGuard.stack.length + '）'); }
    out.tones = tones.length; out.names = NAMES.length;
    return out;
  }, { N, only, WHY, NAMES0, PROBE });
  console.log('== name-audit', dir, mode || '(全年齢版)', '回数', r.runs, '比べた文', r.entries, '双子と記録の数が合わない回', r.desync, 'ページのエラー', errors.length, errors.slice(0, 2));
  if (r.err.length) console.log('失敗', r.err.length, r.err.slice(0, 3));
  const total = r.n.pre + r.n.part;
  console.log('名前が壊れた:', total, '（接頭辞', r.n.pre, '／名前の一部・全部が別の語', r.n.part, '）  名前の印の残り:', r.n.mark, '  参考：名前に触れない違い', r.noise, '・筋の分かれた回の名前の違い', r.loose || 0);
  const top = o => Object.keys(o).sort((a, b) => o[b] - o[a]).slice(0, 20).map(k => k + ' ' + o[k]).join('、');
  if (total) { console.log('名前ごと:', top(r.byName)); console.log('口調ごと:', top(r.byTone)); }
  const cols = ['pre', 'part', 'mark'];
  Object.keys(r.bySc).forEach(sc => { const b = r.bySc[sc]; if (cols.some(k => b[k])) console.log('  ', sc.padEnd(10), cols.map(k => k + ' ' + (b[k] || 0)).join('  ')); });
  Object.keys(r.ex).forEach(k => { if (r.ex[k].length) { console.log('--', k); r.ex[k].forEach(x => console.log('  ' + x)); } });
  const P = r.probe;
  if (P && P.lines) {
    const pt = P.n.pre + P.n.part;
    console.log('== 台詞の見本（全口調', r.tones, '× 名前', r.names, '× 文の型）', P.lines, '文　名前が壊れた:', pt, '（接頭辞', P.n.pre, '／名前の一部・全部が別の語', P.n.part, '）  参考：名前に触れない違い', P.noise);
    if (pt) { console.log('名前ごと:', top(P.byName)); console.log('口調ごと:', top(P.byTone)); }
    ['pre', 'part'].forEach(k => { if (P.ex[k].length) { console.log('-- 見本', k); P.ex[k].forEach(x => console.log('  ' + x)); } });
    if (WHY && P.ex.noise.length) { console.log('-- 見本 noise'); P.ex.noise.forEach(x => console.log('  ' + x)); }
  }
  if (JS) fs.writeFileSync(JS, JSON.stringify(r));
  await browser.close();
  process.exitCode = total + r.n.mark + (P ? P.n.pre + P.n.part : 0) ? 1 : 0;
})();
