/* 問いと返事の噛み合いの点検：全箱庭を回して、住人が「…？」と訊いた文（台詞が「？」で終わる文）の直後の文が、相手の返事になっているかを数える
   使い方: node qa-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=12] [r18|safe|''] [箱庭id,…] [--ex=件数] [--json=出力.json]
   数え方（記録 e.seg の台詞の話し手を使う）：
     問い：文の最後の台詞が「？」で終わり、話し手（住人）が決まっている文
     返事（ans）：次の文が、問いの話し手でない人の台詞行（文の頭の「」・名前「」）で始まるか、答える動作（答え・頷・首を振る・返し・肩をすくめ…）を含む
     喘ぎ（moan）：次の文の頭が喘ぎ・モブの台詞
     終わり（end）：問いでその出来事の文が終わる（参考）
     続き（self）：次の文の頭が、問いの話し手自身の台詞（参考。言い足し・独り言）
     噛み合わない（ng）：上のどれでもない（地の文・相手の台詞を地の文で包んだ行で、答える動作のない行）
   「独立」：同じ問い（名前を伏せた文）の直後の文が回によって 2 通り以上ある＝問いの行のあとに別の表から行を置いている組み立て。
     ng のうち独立の問いのものを ng独立 に数える（これを 0 に近づける）
   出力：箱庭ごとの件数の表、ng独立の多い問い（直後の文の例つき） */
'use strict';
const fs = require('fs');
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 12, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const EX = +((process.argv.find(a => /^--ex=/.test(a)) || '').slice(5) || 25), JS = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7);
  if (!dir) { console.error('使い方: node qa-audit.js <ビルド> [回数] [r18|safe|\'\'] [箱庭id,…]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only }) => {
    const HK = window.HK, S = HK.Seg;
    const out = { bySc: {}, keys: {}, runs: 0, err: [] };
    if (!S) { out.err.push('HK.Seg がない'); return out; }
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'], tones = HK.TONE_KEYS.slice(), POS = ['', 'top', 'bottom', 'riba'];
    const ANS = /答え|応え|返し|返事|返す|はぐらか|頷|うなず|首を(?:縦|横)?に?振|首を傾げ|答える代わり|即答|肩をすくめ|考えてから|少し考え|しばらく考え|間を置いて|迷わず/;
    function rnd(s) { let x = s; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; }
    let ti = 0;
    /* 文に分ける：地の文の「。」「\n」の後、台詞行（l）の後で、続く地の文が「と」「って」などで受けないとき */
    function sentences(seg) {
      const sens = []; let cur = [];
      const push = () => { if (cur.length && cur.some(p => p.s.trim())) sens.push(cur); cur = []; };
      seg.forEach((x, i) => {
        if (x.t === 'n') {
          let s = x.s, k;
          while ((k = s.search(/[。\n]/)) >= 0) {
            let j = k + 1; while (j < s.length && /[。\n）]/.test(s[j])) j++;
            cur.push({ t: 'n', s: s.slice(0, j) }); push(); s = s.slice(j);
          }
          if (s) cur.push({ t: 'n', s });
        } else {
          /* 台詞行の前に地の文の切れ端（読点なしで終わる）が無ければ、新しい文の頭 */
          if (x.t === 'l' && cur.length && cur.every(p => p.t !== 'n' || /[」」]$|――$/.test(p.s))) push();
          cur.push({ t: x.t, s: x.s, who: x.who });
          const nx = seg[i + 1];
          if (x.t === 'l' && !(nx && nx.t === 'n' && /^(?:と|って|――と|、と|という|とい|に|が|を|の)/.test(nx.s))) push();
        }
      });
      push();
      return sens;
    }
    const strip = (s, names) => { names.forEach((n, i) => { s = s.split(n).join('X'); }); return s.replace(/[\s]+/g, ''); };
    HK.SCEN_ORDER.forEach(id => {
      const sc = HK.SCENARIOS[id]; if (!sc || (only && only.indexOf(id) < 0)) return;
      const B = out.bySc[id] = { runs: 0, q: 0, ans: 0, moan: 0, end: 0, self: 0, ng: 0, ngInd: 0, aq: 0, aans: 0, amoan: 0, aend: 0, aself: 0, ang: 0, angInd: 0 };
      const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
      for (let s = 0; s < N; s++) {
        const rr = rnd(1000 + s * 77 + id.length), chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: Math.round(rr() * 20), NP: Math.round(rr() * 20), A: Math.round(rr() * 20), FC: Math.round(rr() * 20), AC: Math.round(rr() * 20) }, memo: '', gender: (i + s) % 3 === 0 ? 'm' : (i + s) % 3 === 1 ? 'f' : '', likes: '', tone: tones[(ti++) % tones.length], fp: '', pos: POS[(i + s) % 4], color: '', call: '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        if (s % 2) (sc.env || []).forEach((e, k) => {
          if (e.max != null && /lewd|dose|shady|heat|npc|prey|depth|skill|monsters|pleasure|traffic|ev$/.test(e.id)) env[e.id] = e.max;
          else if (e.options && e.options.some(o => o.v === 'high') && /lewd/.test(e.id)) env[e.id] = 'high';
          else if (e.options && e.options.length > 1 && !/lewd|^mode$/.test(e.id) && (s + k) % 2) env[e.id] = e.options[(s + k) % e.options.length].v;
          if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
        });
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        let res;
        try { res = HK.simulate({ scenId: id, seed: 12345 + s * 101, env, chars, perChar, ties: s % 3 === 2 ? [{ a: 0, b: 1, type: 'lover' }] : [] }); } catch (e) { out.err.push(id + ':' + s + ' ' + (e && e.message)); continue; }
        out.runs++; B.runs++;
        (res.log || []).forEach(e => {
          if (!e || !e.seg || typeof e.text !== 'string') return;
          const sens = sentences(e.seg);
          sens.forEach((sen, k) => {
            const sp = sen.filter(p => p.t !== 'n');
            const last = sp[sp.length - 1];
            if (!last || last.who == null || !/[？?]」$/.test(last.s) || last.t === 'c' || last.t === 'm') return;
            /* 問いのあとの地の文に、相手の答えがすでにある（「…？」と訊くと、Bは首を振った）ものは数えない */
            const iLast = sen.indexOf(last), tailN = sen.slice(iLast + 1).map(p => p.s).join('');
            if (ANS.test(tailN)) return;
            /* 訊いた・尋ねたで受ける問い（はっきり相手に向けた問い）か */
            const ask = /^(?:と|って|――と)?[^。「」]{0,14}(?:訊|尋ね|聞い|問う|問い)/.test(tailN);
            B.q++; if (ask) B.aq++;
            const qtxt = sen.map(p => p.s).join(''), key = id + '\t' + strip(qtxt, NAMES);
            const nx = sens[k + 1];
            let cls, ntxt = '';
            if (!nx) cls = 'end';
            else {
              ntxt = nx.map(p => p.s).join('');
              const h = nx[0], i1 = nx.findIndex(p => p.t !== 'n'), first = nx[i1];
              /* 名前「…」の形（名前だけの地の文の切れ端のあとの台詞。モブの返事を含む） */
              const nameHead = first && /^[lqm]$/.test(first.t) && i1 === 1 && h.t === 'n' && /^[^は、。がをに「」\n]{1,24}$/.test(h.s) && first.who !== last.who;
              if (h.t === 'l' && h.who != null && h.who !== last.who) cls = 'ans';
              else if (nameHead) cls = 'ans';
              else if (h.t === 'm' || (h.t === 'l' && h.who == null)) cls = 'moan';
              else if (ANS.test(nx.filter(p => p.t === 'n').map(p => p.s).join(''))) cls = 'ans';
              else if (h.t === 'l' && h.who === last.who) cls = 'self';
              else cls = 'ng';
            }
            B[cls]++; if (ask) B['a' + cls]++;
            const K = out.keys[key] = out.keys[key] || { id, q: qtxt, ask, n: 0, fol: {}, cls: {} };
            K.n++; K.cls[cls] = (K.cls[cls] || 0) + 1;
            const nk = cls + '\t' + strip(ntxt, NAMES).slice(0, 90);
            K.fol[nk] = (K.fol[nk] || 0) + 1;
          });
        });
      }
    });
    return out;
  }, { N, only });
  /* 独立：直後の文が 2 通り以上ある問い */
  const keys = Object.values(r.keys);
  keys.forEach(K => {
    K.var = Object.keys(K.fol).length >= 2;
    K.ngInd = K.var ? (K.cls.ng || 0) : 0;
    if (K.ngInd) r.bySc[K.id].ngInd += K.ngInd;
    if (K.ngInd && K.ask) r.bySc[K.id].angInd += K.ngInd;
  });
  const T = {};
  const table = (title, p) => {
    console.log('##### ' + title);
    console.log('箱庭\t回数\t問い\t返事\t喘ぎ\t終わり\t続き\t噛み合わない\tうち独立');
    const t = { q: 0, ans: 0, moan: 0, end: 0, self: 0, ng: 0, ngInd: 0 }; let runs = 0;
    Object.keys(r.bySc).forEach(id => {
      const b = r.bySc[id]; runs += b.runs; Object.keys(t).forEach(k => t[k] += b[p + k] || 0);
      if (b[p + 'q']) console.log([id, b.runs].concat(['q', 'ans', 'moan', 'end', 'self', 'ng', 'ngInd'].map(k => b[p + k])).join('\t'));
    });
    console.log(['合計', runs, t.q, t.ans, t.moan, t.end, t.self, t.ng, t.ngInd].join('\t'));
    T[p || 'all'] = t;
  };
  table('「…？」と訊いた・尋ねた（はっきり相手に向けた問い）', 'a');
  table('台詞が「？」で終わる文すべて（参考。言葉責め・ひとりごと・話題の振りを含む）', '');
  console.log('\n##### 噛み合わない（独立）の多い問い（訊いた・尋ねたを先に）');
  keys.filter(K => K.ngInd).sort((a, b) => (b.ask - a.ask) || (b.ngInd - a.ngInd)).slice(0, EX).forEach(K => {
    console.log('- [' + K.id + ']' + (K.ask ? '［訊］' : '') + ' ×' + K.ngInd + '/' + K.n + ' ' + K.q.slice(0, 120));
    Object.keys(K.fol).filter(f => /^ng\t/.test(f)).slice(0, 3).forEach(f => console.log('    → ' + f.slice(3)));
  });
  if (r.err.length) console.log('\n失敗', r.err.length, r.err.slice(0, 3));
  if (errors.length) console.log('ページのエラー', errors.length, errors.slice(0, 3));
  if (JS) fs.writeFileSync(JS, JSON.stringify({ bySc: r.bySc, total: T, keys }, null, 1));
  await browser.close();
})();
