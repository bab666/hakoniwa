/* 長いエッチの場面の流れの点検（2026-11-03。設計は docs/reports/2026-11-03/sex-flow-design.md、フィードバックは sex-flow-feedback.md）
   使い方: node sex-flow-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=24] [箱庭id,…] [--why] [--raw]
     --raw：流れの管理（HK.SexFlow）を切って、組み立てたままの本文を数える（変更前の数字）
     新婚部屋など追加パックの箱庭：pack-site.js で作った試しのフォルダを渡し、HK_PACK_CODES=… HK_ONLY_SCEN=set-b-shinkon で回す
   長い場面（HK.ThickSex.scene・HK.ThickEro.scene のいちばん外側の出力）を集め、HK.SexFlow.analyze（段に分けて状態を進める）で数える：
     (a) 段階の逆戻り（挿入後の脱がせる・下ごしらえ、山場後の挿入）
     (b) 体位の矛盾（体位を変える部品を挟まずに、別の体位を前提にした言い回し：受けが上の直後の「真上から」など）
     (c) 同じ台詞・同じ動きの二度出し（一回の場面の中）
     (d) 応答を求める台詞（言え・呼べ・声を出せ）のあとに受けのリアクションが無い
     (e) 性感（heat）が閾値の前の山場・焦らしの直後の山場
     (f) 同じ遊び（一回のシミュレーション）の中で、同じ住人に同じ導入の台詞（夜の主導 HK.PosLead・能動性の型の主導の段の台詞。直前 5 回以内）が出た／嫉妬のきっかけなのに受けから始まった
     (g) 似た役割の重ね：焦らしの段が 2 回以上（描写の長さ「厚く」は 3 回以上）、受けから始める主導の段が 2 回以上
     (i)〜(n) 文ごとの状態（2026-11-04。HK.SexFlow.walk。呼ぶ側の事後の段も見る）：(i) 入れていない・抜いたあとの「抜かないまま」・入れていない指を抜く／(j) 目隠し中に見る・「こっちを見ろ」／
         (k) 後ろからの体位のまま顔を合わせる／(l) 移る文なしに場所が変わる（山場まで）／(m) 別れの台詞のあとの会話・寄り添い／(n) 体の組に合わない語（男性器の無い人の男性器・女性どうしの男性器の語・受けが入れる側）
     (o) 山場の無いまま終わる（2026-11-05）：段が 3 つ以上あるのに果てる段が一度も無い／前戯で果てたあと挿れて、そのまま終わる
     (h) 型の矛盾（エッチの型 HK.Play。2026-11-03）：着衣の型なのに脱がせる、型の体位の段のあと（山場まで）に別の体位へ変える動き。型の内訳（入り方・主な責め・道具・体位・終わり方）も出す
   ほかに、段数（段＝地の文の段落と、それに続く台詞だけの段落）と段落数の分布、夜の主導の設定 × きっかけ ごとの始まり方の内訳（受けから／攻めから／どちらともなく）を出す。
   配役：pos-audit と同じ範囲（3 組＋男性どうし・態度 9 種が出る気質・夜の性格・受け攻めの指定・夜の主導）。audit-all.js の追加の配役パス（--extra=sexflow）からも呼べる */
'use strict';
const core = require('./audit/core.js');

const DEF_SCEN = ['whiteroom', 'goukon', 'locker', 'omega', 'island', 'zombie'];

/* ---------- パス sexflow（ページの中）：opt = { N, only } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 24;
  const DEF = ['whiteroom', 'goukon', 'locker', 'omega', 'island', 'zombie'];
  let ids = opt.only || DEF.filter(id => HK.SCENARIOS[id] && HK.SCEN_ORDER.indexOf(id) >= 0);
  if (!ids.length) ids = HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id]);
  const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル'];
  const G = [['m', 'f'], ['f', 'f'], ['f', 'm'], ['m', 'm'], ['m', 'f', 'f'], ['f', 'm', 'm']];
  const NIGHT = ['', 'sadist', 'maso', 'mean', 'sweet', 'shy', '', 'match'];
  const LEAD = ['', 'sasoi', 'osoi', 'top', 'sasoi', 'osoi'];
  for (const sc of ids) {
    const scen = HK.SCENARIOS[sc]; if (!scen) continue;
    for (let s = 0; s < N; s++) {
      const g = G[s % G.length], n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, g.length));
      const chars = [];
      for (let i = 0; i < n; i++) {
        chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: g[i % g.length], likes: '', tone: '', fp: '', pos: i === 0 ? 'top' : i === 1 ? 'bottom' : '', posLike: '', color: '', call: '', calls: {}, loveLock: '', genital: '',
          night: i === 0 ? NIGHT[(s >> 1) % NIGHT.length] : NIGHT[(s + 3) % NIGHT.length], lead: i === 1 ? LEAD[s % LEAD.length] : '' });
      }
      const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (scen.env || []).forEach(e => {
        if (e.max != null && /lewd|dose|heat|aphro|night|pleasure/.test(e.id)) env[e.id] = e.max;
        else if (e.options && /^lewd$/.test(e.id)) env[e.id] = s % 2 ? 'high' : 'mid';
        else if (e.options && /^lewdN$/.test(e.id)) { const hi = e.options.filter(o => /high/.test(o.v))[0]; if (hi) env[e.id] = hi.v; }
        if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
      });
      env.lewd = s % 2 ? 'high' : 'mid'; env.lewdLen = s % 3 === 1 ? 'mix' : 'thick'; env.style = s % 3 === 2 ? 'ero' : (env.style || 'novel');
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      const ties = [{ a: 0, b: 1, type: ['lover', 'fwb', 'lover', 'enemy'][s % 4] }];
      yield { sc, s, input: { scenId: sc, seed: 5000 + s, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {} })), ties }, meta: {} };
    }
  }
};

/* ---------- 判定 sexflow（ページの中）：opt = { why, raw } ---------- */
const JUDGE = function (HK, opt) {
  const WHY = !!opt.why, F = HK.SexFlow;
  const out = { dump: [], scenes: 0, v: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0, n: 0, o: 0 }, ex: { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j: [], k: [], l: [], m: [], n: [], o: [] }, units: [], paras: [], start: {}, bySc: {}, noFlow: !F, play: { n: 0, none: 0, entry: {}, focus: {}, prop: {}, pos: {}, finish: {}, act: 0 } };
  if (!F) return { accept() { return false; }, finish() { return out; } };
  F.off = !!opt.raw;
  if (opt.dump) F.trace = true;
  /* 包みを入れ終えるため、一度だけ回してから、いちばん外側に取り込みの包みを置く */
  try { const sc = HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id])[0]; HK.simulate({ scenId: sc, seed: 1, env: {}, chars: [{ name: 'イチ', gender: 'm', eg: {} }, { name: 'ニイ', gender: 'f', eg: {} }], perChar: [{ pick: {} }, { pick: {} }], ties: [] }); } catch (e) { /* 準備の回は数えない */ }
  let cur = null, depth = 0;
  const P = HK.Pos;
  const wrapCap = obj => {
    if (!obj || typeof obj.scene !== 'function' || obj.scene._flowCap) return;
    const s0 = obj.scene;
    const f = function (o) {
      if (depth || !o || !o.a || !o.b) return s0.apply(this, arguments);
      const set = P && P.leadOf ? P.leadOf(o.b) || '' : '';
      depth++;
      let r;
      try { r = s0.apply(this, arguments); } finally { depth--; }
      if (cur && r && typeof r.text === 'string') cur.caps.push({ o, r, set, text: r.text });
      return r;
    };
    Object.keys(s0).forEach(k => { if (k.charAt(0) === '_') f[k] = s0[k]; });
    f._flowCap = true;
    obj.scene = f;
  };
  /* 夜の主導の台詞（短い・中くらいの場面からも呼ばれる） */
  if (HK.PosLead && HK.PosLead.text && !HK.PosLead.text._flowCap) {
    const t0 = HK.PosLead.text;
    HK.PosLead.text = function (T, U) { const r = t0.apply(this, arguments); if (cur && r) cur.lead.push({ b: U && U.name, t: r }); return r; };
    HK.PosLead.text._flowCap = true;
  }
  const add = (k, why, sc, txt) => { out.v[k]++; if (WHY && out.ex[k].length < 8) out.ex[k].push(sc + '：' + why + (txt ? '\n      ' + String(txt).replace(/\n+/g, ' ／ ').slice(0, 260) : '')); };
  const clauses = s => String(s).split('｜')[0].replace(/＠[^＠]*＠/g, '').split(/[。！？!?　]/).map(x => x.replace(/[\s、。…・！？♡ー〜っッ―—]/g, '')).filter(x => x.length >= 6 && /[一-鿿ァ-ヺ]/.test(x));
  return {
    accept() { return false; },
    begin(run) { wrapCap(HK.ThickSex); wrapCap(HK.ThickEro); cur = { caps: [], lead: [] }; },
    end(run) {
      const c = cur; cur = null;
      if (!c) return;
      const seenIntro = {};
      const bs = out.bySc[run.sc] || (out.bySc[run.sc] = { n: 0, v: 0 });
      c.caps.forEach(x => {
        const a = x.o.a, b = x.o.b, mode = x.r.mode === 'ff' || x.r.mode === 'fm' ? x.r.mode : 'mf';
        /* エッチの型（play-r18.js）：型の矛盾（h）を数えるため、型の印（体位の段・着衣）を渡す */
        const pl = x.r.flow && x.r.flow.play;
        const an = F.analyze(x.text, a, b, mode, x.o.after || '', pl || null);
        if (pl) { out.play.n++; ['entry', 'focus', 'prop', 'pos', 'finish'].forEach(k => { const v = pl[k] || '-'; out.play[k][v] = (out.play[k][v] || 0) + 1; }); if (pl.act && (String(x.text).indexOf(pl.act.slice(0, 30)) >= 0 || String(x.text).indexOf(pl.act.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).slice(0, 30)) >= 0)) out.play.act++; }
        else out.play.none++;
        out.scenes++; bs.n++;
        if (opt.dump && out.dump.length < opt.dump) out.dump.push({ sc: run.sc + '#' + run.s, set: x.set, flow: x.r.flow || null, trace: x.r._trace || null, mode: mode, aM: !!(HK.Pos && HK.Pos.hasM && HK.Pos.hasM(a)), bM: !!(HK.Pos && HK.Pos.hasM && HK.Pos.hasM(b)), v: an.check.v.map(v => v.k + ':' + v.i + ':' + v.why + (v.s ? '｜' + v.s : '')), stages: an.check.stages, units: an.units.map(u => u.paras.join(' ⏎ ')), tail: an.tail.join(' ⏎ ') });
        out.units.push(an.units.length + (an.tail.length ? 1 : 0));
        out.paras.push(String(x.text).split(/\n\n+/).length);
        an.check.v.forEach(v => { bs.v++; const u = v.i >= an.units.length && an.tail.length ? { paras: an.tail } : an.units[Math.min(v.i, an.units.length - 1)]; add(v.k, v.why + (v.s ? '｜文：' + v.s.slice(0, 120) : ''), run.sc + '#' + run.s, u ? u.paras.join(' ') : ''); });
        /* 始まり方：夜の主導の部品が残っていれば受けから。なければ頭の段の主語 */
        const fl = x.r.flow || {}, roles = fl.parts || [];
        const kd = HK.Attr && HK.Attr.nightKind ? HK.Attr.nightKind(a, b) : '';
        const trig = x.o.jealous ? '嫉妬' : x.o.force ? '強引' : (x.o.hate || x.o.rel === 'hate') ? '愛憎' : /^(sadist|mean)$/.test(kd || '') ? '攻めのサド・意地悪' : 'ふつう';
        const head = an.units.slice(0, 2).map(u => u.paras.join('\n\n')).join('\n\n'), headN = String(x.text).split(/\n\n+/).slice(0, 4).join('\n\n');
        const inTxt = t => headN.indexOf(String(t).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).split(/\n\n+/)[0]) >= 0 || head.indexOf(String(t).split(/\n\n+/)[0]) >= 0;
        const leadIn = c.lead.some(q => q.b === b.name && inTxt(q.t)) || ((x.r.flow && x.r.flow.partT) || []).some(p => inTxt(p.t));
        const s0 = an.units[0] ? an.units[0].paras.join('') : '', who = F.starter ? F.starter(s0) : '';
        const typ = leadIn || who === 'b' ? '受けから' : who === 'a' ? '攻めから' : 'どちらともなく';
        /* (g) 似た役割の重ね：焦らしの段（厚くは 2 まで）・受けから始める主導の段（夜の主導・能動性の型）が二つ以上 */
        const S0 = x.o.ctx || x.o.S, thick = !!(S0 && S0.env && S0.env.lewdLen === 'thick');
        const nTease = an.units.filter(u => u.f && u.f.tease).length;
        if (nTease > (thick ? 2 : 1)) add('g', '焦らしの段が ' + nTease + ' 回', run.sc + '#' + run.s);
        const nLead = c.lead.filter(q => q.b === b.name && String(x.text).indexOf(String(q.t).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name)) >= 0).length + ((x.r.flow && x.r.flow.partT) || []).filter(p => p.role === 'ini-lead' && String(x.text).indexOf(p.t.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name)) >= 0).length;
        if (nLead > 1) add('g', '受けから始める主導の段が ' + nLead + ' 回', run.sc + '#' + run.s);
        const setL = { sasoi: '誘い受け', osoi: '襲い受け', top: '攻めが主導', '': 'なし' }[x.set] || 'なし';
        const key = setL + '｜' + trig;
        const st = out.start[key] || (out.start[key] = { 受けから: 0, 攻めから: 0, どちらともなく: 0 });
        st[typ]++;
        if (trig === '嫉妬' && typ === '受けから') add('f', '嫉妬のきっかけなのに受けから始まった（' + (leadIn ? '受けの主導の段：' + (((x.r.flow && x.r.flow.partT) || []).map(p => p.t.slice(0, 40)).join('／') || [].concat(c.lead.map(q => q.t.slice(0, 40))).join('／')) : '頭の段') + '）', run.sc + '#' + run.s, an.units[0] ? an.units[0].paras.join(' ') : '');
        /* (f) 導入の台詞（夜の主導・能動性の型の主導の段で、本文に残ったもの）の二度出し：同じ住人・同じ遊び */
        ((x.r.flow && x.r.flow.partT) || []).forEach(p => {
          if (String(x.text).indexOf(p.t.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name)) < 0 && String(x.text).indexOf(p.t) < 0) return;
          const re = /(\{[ab]\})?「([^」]*)」/g; let m;
          while ((m = re.exec(p.t))) {
            const who = m[1] === '{a}' ? a.name : b.name;
            clauses(m[2]).forEach(k => { const kk = who + '|' + k; if (seenIntro[kk]) add('f', '同じ遊びで同じ導入の台詞（' + who + '）「' + m[2].split('｜')[0] + '」', run.sc + '#' + run.s); seenIntro[kk] = 1; });
          }
        });
      });
      /* 夜の主導の台詞：同じ住人に同じ台詞（場面の中に残ったかに関係なく、呼ばれた回で） */
      /* 同じ住人の直前 5 回の夜の主導の台詞に同じものがあれば二度出し（台詞は態度ごとに 6 本。全部使ったら戻すので、6 回目より後の繰り返しは数えない） */
      const hist = {};
      c.lead.forEach(x => {
        const m = String(x.t).match(/\{b\}「([^」]*)」|「([^」]*)」/);
        const s = m ? (m[1] || m[2]) : ''; if (!s) return;
        const h = hist[x.b] || (hist[x.b] = []);
        if (h.slice(-5).indexOf(s) >= 0) add('f', '同じ遊びで同じ夜の主導の台詞（' + x.b + '）「' + s.split('｜')[0] + '」', run.sc + '#' + run.s);
        h.push(s);
      });
    },
    finish() { return out; }
  };
};

function dist(a) {
  if (!a.length) return '—';
  const s = a.slice().sort((x, y) => x - y);
  return '最小 ' + s[0] + '・中央 ' + s[s.length >> 1] + '・最大 ' + s[s.length - 1] + '（13 以上 ' + s.filter(x => x >= 13).length + ' 件・20 以上 ' + s.filter(x => x >= 20).length + ' 件）';
}
const LABEL = { h: '型の矛盾（着衣なのに脱がせる・型の体位のあとに別の体位）', a: '段階の逆戻り', b: '体位の矛盾', c: '同じ台詞・動きの二度出し', d: '応答待ちのあとリアクション無し', e: '閾値前の山場', f: '導入の台詞の二度出し・嫉妬で受けから', g: '似た役割の重ね（焦らし・主導の段）', i: '挿入の状態の矛盾（抜いたあとの「抜かないまま」・入れていない指を抜く）', j: '目隠し中に見る・「こっちを見ろ」', k: '後ろからの体位のまま顔を合わせる', l: '場所の飛び（移る文なしに場所が変わる）', m: '終わりの台詞のあとの会話・寄り添い', n: '体の組に合わない語（男性器の無い人の男性器・受けが入れる側）', o: '山場の無いまま終わる（果てる段が無い・前戯で果てたあと挿れて終わる）' };
function print(r, errors, o) {
  if (!r) { console.log('結果なし'); return; }
  if (r.noFlow) console.log('（HK.SexFlow がありません：数えるだけ）');
  console.log('長い場面', r.scenes, '件');
  Object.keys(LABEL).forEach(k => {
    console.log('(' + k + ') ' + LABEL[k] + '：' + r.v[k]);
    if (o.why) r.ex[k].forEach(x => console.log('    ' + x));
  });
  if (r.play) {
    const P = r.play, fmt = o => Object.keys(o).sort((x, y) => o[y] - o[x]).map(k => k + ' ' + o[k]).join('・');
    console.log('エッチの型', P.n, '件（型なし ' + P.none + '・性格が目立つ行為の段が残った ' + P.act + '）');
    ['entry', 'focus', 'prop', 'pos', 'finish'].forEach(k => console.log('  ' + k.padEnd(7), fmt(P[k])));
  }
  console.log('段数', dist(r.units));
  console.log('段落数', dist(r.paras));
  console.log('始まり方（夜の主導の設定｜きっかけ：受けから／攻めから／どちらともなく）');
  Object.keys(r.start).sort().forEach(k => { const x = r.start[k]; console.log('  ' + k.padEnd(16), x.受けから, '/', x.攻めから, '/', x.どちらともなく); });
  console.log('箱庭ごと', Object.keys(r.bySc).map(k => k + ' ' + r.bySc[k].n + '件・' + r.bySc[k].v).join('　'));
  console.log('pageerr', JSON.stringify((errors || []).slice(0, 3)));
}
function summarize(r) {
  const items = {}, ex = {};
  Object.keys(LABEL).forEach(k => { items[LABEL[k]] = r ? r.v[k] : 0; ex[LABEL[k]] = r ? r.ex[k] : []; });
  return { items, ex, info: { 長い場面: r ? r.scenes : 0, 段数: r ? dist(r.units) : '' }, err: 0 };
}
module.exports = { passes: { sexflow: PASS }, judges: { sexflow: JUDGE }, print, summarize, LABEL, DEF_SCEN };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, only = args[2] ? args[2].split(',') : null, WHY = process.argv.includes('--why'), RAW = process.argv.includes('--raw');
  const t = await core.runTool({ dir, hash: 'r18', lewdMode: 'direct', mod: module.exports, pass: 'sexflow', judge: 'sexflow', opt: { N, only, why: WHY, raw: RAW, dump: +(process.env.DUMP || 0) } });
  if (process.env.DUMP) require('fs').writeFileSync(process.env.DUMP_TO || 'sex-flow-dump.json', JSON.stringify(t.r.dump, null, 1));
  print(t.r, t.errors, { why: WHY });
  const r = t.r; if (r && Object.keys(r.v).some(k => r.v[k])) process.exitCode = 1;
})();
