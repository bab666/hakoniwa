/* 名前の呼びかけの点検（2026-11-01 担当NC。設計と前後の数は docs/reports/2026-11-01/name-call.md）
   使い方: node call-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=8] [r18|safe|''] [箱庭id,…] [--why] [--json=出力.json]
   ・全箱庭を、台詞の区分の点検（seg-audit.js）と同じ名前・口調の回し方・種で回す。ただし住人の敬称の設定（call）を
     「おまかせ・呼び捨て・さん付け・おまかせ・くん付け・ちゃん付け」で順に回し、3 回に 1 回は 1 人目に相手ごとの呼び方（calls：2 人目を「〇〇っち」）を付ける
     （呼びかけの自動の差し込み（tone-plus.js の V.callAddress）は、呼び方を決めた相手にだけ働くため）
   ・台詞行（e.seg の l・q で話し手のあるもの）のうち、住人の名前・呼び方（敬称付き・calls の呼び方）で呼びかけている台詞を数える
     （「〇〇さん、ですよね」の人の確かめ・「〇〇、人狼」の結果・「偽物は、〇〇」の助詞のあとの名前は呼びかけに数えない）。
     呼びかけ＝台詞の頭・文の区切りの後・読点の後に名前（＋敬称）があり、そのあとが「、」「！」「？」「…」か台詞の終わり（「ミナト、逃げて」「……ミナトさん？」「待って、ミナト！」）
   ・経路：自動の差し込み（voice.js が記録に隠して持たせた e.callAdded に載る、頭に呼び方を足した台詞）／
     二人称の置き換え（e.callAdded の y:1。文の「あなた、」「お前！」を、呼び方を決めた相手の呼び方にしたもの。文にもとからある呼びかけ）／
     手書き（それ以外。箱庭・共通の出来事の文に書かれた名前の呼びかけ）
   ・違和感の型（件数）：
       dup     同じ記録で、同じ話し手が同じ相手を 2 回以上名前で呼ぶ（2 回目から数える）
       short   名前を除くと 1〜8 字の短い台詞（「うん」「分かった」「ありがとう」…。逃げて・待って などの訴えは除く）
       reply   名前のあとが相づち・返事（うん・ええ・はい・そう・なるほど・分かった・了解…）
       explain 名前のあとが説明の言い切り（〜んだ・〜らしい・〜みたい・〜はず・〜です で終わる 15 字以上で、！？のない文）
     （short・reply・explain・solo は、名前だけの呼びかけ（「……ミナト」）と、重い場面の記録（死・最期・弔い・再会・別れ・思い出）を数えない。
       short は、名前を除いた残りが「ここぞ」の言葉（待って・逃げて・好き・許さない・大丈夫・会えて・犯人・怪しい…。下の STRONG）なら数えない）
       solo    登場人物が話し手ひとりの記録で、その場にいない相手を名前で呼ぶ（独り言。探す・謝るなど「ここぞ」の言葉は除く）
       pair    二人きりの記録（登場人物 2 人）で、話し手の台詞（2 つ以上）が全部、相手の名前で始まる
       honor   敬称の重なり（「ミナトさんさん」「ミナトくんさん」）
       mob     モブ（HK.Mob.make で作った人物）の名前への、住人の台詞での呼びかけ
     参考：consec（ひとつ前の記録でも同じ相手を名前で呼んでいた台詞）
   ・audit-all.js の既定の一式に入る（パス call）。割合は参考の表示、違和感の型は件数（閾値 TH を超えた分を数える。0 が目標） */
'use strict';
const fs = require('fs');
const core = require('./audit/core.js');

/* ---------- パス call（ページの中）：opt = { N, only } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 8, only = opt.only || null;
  const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'], tones = HK.TONE_KEYS.slice();
  const CALLS = ['', 'name', 'san', '', 'kun', 'chan'];
  function rnd(s) { let x = s; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; }
  let ti = 0;
  for (const id of HK.SCEN_ORDER) {
    const sc = HK.SCENARIOS[id]; if (!sc || (only && only.indexOf(id) < 0)) continue;
    const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
    for (let s = 0; s < N; s++) {
      const rr = rnd(1000 + s * 77 + id.length), chars = [], perChar = [];
      for (let i = 0; i < n; i++) {
        chars.push({ name: NAMES[i], eg: { CP: Math.round(rr() * 20), NP: Math.round(rr() * 20), A: Math.round(rr() * 20), FC: Math.round(rr() * 20), AC: Math.round(rr() * 20) }, memo: '', gender: i % 3 === 0 ? 'm' : i % 3 === 1 ? 'f' : '', likes: '', tone: tones[(ti++) % tones.length], fp: '', pos: '', color: '', call: CALLS[(i + s) % CALLS.length] });
        perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
      }
      if (s % 3 === 1 && n >= 2) chars[0].calls = { [NAMES[1]]: NAMES[1].slice(0, 2) + 'っち' };
      const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
      if (s % 2) (sc.env || []).forEach((e, k) => {
        if (e.max != null && /lewd|dose|shady|heat|npc|prey|depth|skill|monsters|pleasure|traffic|ev$/.test(e.id)) env[e.id] = e.max;
        else if (e.options && e.options.some(o => o.v === 'high') && /lewd/.test(e.id)) env[e.id] = 'high';
        else if (e.options && e.options.length > 1 && !/lewd|^mode$/.test(e.id) && (s + k) % 2) env[e.id] = e.options[(s + k) % e.options.length].v;
        if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
      });
      if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      yield { sc: id, s, input: { scenId: id, seed: 12345 + s * 101, env, chars, perChar, ties: s % 3 === 2 ? [{ a: 0, b: 1, type: 'lover' }] : [] }, meta: {} };
    }
  }
};

/* ---------- 判定 call（ページの中）：opt = { why } ---------- */
const JUDGE = function (HK, opt) {
  const V = HK.Voice || {}, WHY = !!opt.why, lim = WHY ? 40 : 3;
  const K = ['dup', 'short', 'reply', 'explain', 'solo', 'pair', 'honor', 'mob'];
  const out = { runs: 0, lines: 0, call: 0, auto: 0, you: 0, hand: 0, consec: 0, n: {}, nAuto: {}, ex: {}, bySc: {}, err: [], lewd: { lines: 0, call: 0, auto: 0 } };
  K.forEach(k => { out.n[k] = 0; out.nAuto[k] = 0; out.ex[k] = []; });
  out.ex.call = []; out.ex.auto = [];
  /* この回で作ったモブの名前（HK.Mob.make を包んで集める。包みは 1 ページに 1 回） */
  const W = window.__CALL_AUD = window.__CALL_AUD || { mobs: [] };
  if (HK.Mob && HK.Mob.make && !HK.Mob.make.__callAud) {
    const mk = HK.Mob.make;
    HK.Mob.make = function () { const m = mk.apply(this, arguments); try { if (m && m.name) { W.mobs.push(m.name); if (m.short && m.short !== m.name) W.mobs.push(m.short); } } catch (e) { /* 数えるだけ */ } return m; };
    HK.Mob.make.__callAud = 1;
  }
  const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const HON = '(?:さん|くん|君|ちゃん|様|さま|先輩|先生|殿)?';
  const B0 = '(^|[「『…‥、。！？!?\\s　―〜ー])', B1 = '(?=[、！？!?…‥〜ー]|[。]*$)';
  /* 本当に相手を呼び止める・訴える文（短くても違和感に数えない） */
  const STRONG = /待[っちてた]|行かないで|行くな|置いて|やめ[てろなよ]|止め[てろ]|止まれ|逃げ|危な|伏せ|離れ|下が[っれ]|気をつけ|後ろ|来るな|動くな|お願い|頼む|頼みます|助け|しっかり|死な|死ぬな|目を開け|起きて|返事|聞いて|聞け|好き|愛して|許さ|許せ|ふざけ|さよなら|さようなら|元気で|大丈夫|無事|怪我|ごめん|すまない|すみません|ありがと|嘘|信じ|戻って|帰って|待ちなさい|会えて|分かる[？?か]|わかる[？?か]|俺だ|私だ|犯人|お前だ|あなただ|怪し|隠して|話がある|話したい|何してる|何をして|せいだ|せいで|どこにいる|どこに行った|許して|正直に/;
  /* 重い場面の記録（死・最期・弔い・再会・別れ・思い出）：名前を呼ぶのが「ここぞ」なので、short・reply・explain・solo に数えない */
  const HEAVY = e => e.kind === 'death' || /^(?:死|最期|弔い|殉|別れ|再会|蘇生|看取|処刑|襲撃|犠牲|殺害)/.test(e.tag || '') || /^(?:memory|grief|mourn|epilogue|death|farewell)$/.test(e.cat || '');
  const REPLY = /^(?:うん|ええ|はい|ああ|おう|そう(?:だ|です|ね|か|よ|なの|だね|だよ|かも)?(?:[、。！？…]|$)|へえ|ほう|ふうん|なるほど|まあ|まぁ|分かった|わかった|分かりました|わかりました|了解|オッケー|OK|いいよ|いいね|いいわ|もちろん|確かに|でしょ|だね|だよね|おはよう|おやすみ|ただいま|おかえり|いってきます|いってらっしゃい|いただきます|ごちそうさま)/;
  const EXPL = /(?:んだ|のだ|んです|なんだ|らしい|らしいよ|らしいです|みたい|みたいだ|みたいです|ようだ|ようです|はず|はずだ|はずです|だって|そうだ|そうです|んだよ|んだって|ってこと|わけだ)[。…‥]*$/;
  const DBL = /(?:さん|くん|君|ちゃん|様|さま|先輩|先生|殿|っち)(?:さん|くん|ちゃん|様|さま|先輩|先生|殿)(?![ぁ-ゖ])/;
  let cur = '', prevPairs = {};
  const hit = (k, auto, msg) => { out.n[k]++; if (auto) out.nAuto[k]++; out.bySc[cur][k] = (out.bySc[cur][k] || 0) + 1; if (out.ex[k].length < lim) out.ex[k].push(cur + (auto ? ' [自動]' : ' [手書き]') + ' | ' + msg); };
  return {
    begin() { W.mobs.length = 0; },
    error(run, e) { if (run.pass === 'call') out.err.push(run.sc + ':' + run.s + ' ' + (e && e.message)); },
    end(run, res) {
      const id = run.sc, chars = run.input.chars, names = chars.map(c => c.name);
      cur = id; const B = out.bySc[id] = out.bySc[id] || { runs: 0, lines: 0, call: 0, auto: 0, you: 0, hand: 0 };
      out.runs++; B.runs++;
      /* 話し手 w が相手 t を呼ぶ形（名前・敬称の設定の呼び方・相手ごとの呼び方）の正規表現 */
      const people = chars.map(c => ({ name: c.name, gender: c.gender || '', tone: HK.toneOf ? HK.toneOf(c) : c.tone, call: c.call || '', calls: c.calls || null, callG: c.callG || null }));
      const RE = {};
      const reOf = (w, t) => {
        const k = w + '>' + t; if (RE[k]) return RE[k];
        const f = [names[t]], cf = V.callFor ? V.callFor(people[w], people[t]) : null;
        if (cf) f.push(cf);
        if (people[w].calls && people[w].calls[names[t]]) f.push(people[w].calls[names[t]]);
        const alt = f.filter(Boolean).sort((a, b) => b.length - a.length).map(esc).join('|');
        return (RE[k] = new RegExp(B0 + '(' + alt + ')' + HON + B1));
      };
      const mobL = W.mobs.filter(m => m && m.length >= 2 && !names.some(nm => m.indexOf(nm) >= 0 || nm.indexOf(m) >= 0)).sort((a, b) => b.length - a.length);
      const mobRe = mobL.length ? new RegExp(B0 + '(' + mobL.map(esc).join('|') + ')' + HON + B1) : null;
      prevPairs = {};
      (res.log || []).forEach(e => {
        if (!e || typeof e.text !== 'string' || !Array.isArray(e.seg)) return;
        const acts = (e.actors || []).map(x => typeof x === 'number' ? x : x && x.i).filter(x => x >= 0);
        const added = e.callAdded || [], lewd = !!(HK.lewdEvent && !HK.SAFE_ON && HK.lewdEvent(e)), heavy = HEAVY(e);
        const pairs = {}, perW = {};
        let qk = -1;
        e.seg.forEach(x => {
          if (x.t === 'n') return;
          qk++;
          if (!(x.t === 'l' || x.t === 'q') || !(x.who >= 0)) return;
          const w = x.who, body = String(x.s).slice(x.nm || 0).replace(/^「/, '').replace(/」$/, '');
          out.lines++; B.lines++; if (lewd) out.lewd.lines++;
          const pw = perW[w] = perW[w] || { n: 0, c: 0, t: -1 };
          pw.n++;
          if (DBL.test(body) && names.some(nm => body.indexOf(nm) >= 0)) hit('honor', false, body.slice(0, 80));
          const mm0 = mobRe && body.match(mobRe);
          if (mm0) hit('mob', false, '（モブ「' + mm0[2] + '」）' + body.slice(0, 80));
          /* 呼ばれた相手 */
          let tgt = -1, m = null;
          for (let t = 0; t < names.length && tgt < 0; t++) { if (t === w) continue; const mm = body.match(reOf(w, t)); if (mm) { tgt = t; m = mm; } }
          if (tgt < 0) return;
          /* 呼びかけでない形：「〇〇さん、ですよね」（人を確かめる）・「〇〇、人狼」（占い・霊媒の結果）・「偽物は、〇〇」（助詞のあとの名前） */
          const aft = body.slice(m.index + m[0].length), bef = body.slice(0, m.index + m[1].length);
          if (/^、?(?:です|だ|じゃ|でしょ)(?:よね|よな|な|ね|ろ|う|[。？?…‥]|$)/.test(aft)) return;
          if (/^、(?:人狼|人間|村人|狼|白|黒)/.test(aft)) return;
          if (/[はがをにもへとの]、$/.test(bef)) return;
          const ad = added.filter(a => a.k === qk && a.w === names[w])[0], auto = !!(ad && !ad.y);
          out.call++; B.call++; if (auto) { out.auto++; B.auto++; } else if (ad) { out.you++; B.you++; } else { out.hand++; B.hand++; }
          if (lewd) { out.lewd.call++; if (auto) out.lewd.auto++; }
          pw.c++; if (pw.t < 0) pw.t = tgt;
          const show = (names[w] + '→' + names[tgt] + '「' + body + '」').slice(0, 110) + ' ［' + [e.kind, e.cat, e.tag].filter(Boolean).join('/') + '］';
          if (out.ex.call.length < lim && !ad) out.ex.call.push(cur + ' | ' + show);
          if (auto && out.ex.auto.length < lim) out.ex.auto.push(cur + ' | ' + show);
          const pk = w + '>' + tgt;
          if (pairs[pk]) hit('dup', auto, show);
          pairs[pk] = 1;
          if (prevPairs[pk]) out.consec++;
          /* 名前を除いた残り */
          const at = m.index + m[1].length, rest = (body.slice(0, at) + body.slice(at + m[0].length - m[1].length)).replace(/^[…‥、。！？!?\s　]+/, '');
          const restLen = rest.replace(/[…‥、。！？!?っッ〜ー～♡\s　]/g, '').length;
          /* 名前だけの呼びかけ（「……ミナト」「ミナト！」）と重い場面は数えない */
          if (heavy || restLen === 0) { /* ここぞ */ }
          else if (restLen <= 8 && !STRONG.test(rest)) hit('short', auto, show);
          else if (REPLY.test(rest)) hit('reply', auto, show);
          else if (restLen >= 15 && !/[！？!?]/.test(rest) && EXPL.test(rest) && !STRONG.test(rest)) hit('explain', auto, show);
          if (!heavy && restLen > 0 && !STRONG.test(rest) && acts.length === 1 && acts[0] === w && acts.indexOf(tgt) < 0) hit('solo', auto, show);
        });
        if (acts.length === 2) Object.keys(perW).forEach(w => { const p = perW[w]; if (p.n >= 2 && p.c === p.n) hit('pair', false, names[w] + '→' + names[p.t] + ' ' + e.text.slice(0, 90)); });
        prevPairs = pairs;
      });
    },
    finish() { return out; }
  };
};

const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '-';
/* 違和感の型の閾値（この件数までは数えない。0 にできない型だけ。報告は docs/reports/2026-11-01/name-call.md） */
const TH = {};
function summarize(r) {
  const items = {}, ex = {};
  Object.keys(r.n || {}).forEach(k => { items[k] = Math.max(0, r.n[k] - (TH[k] || 0)); ex[k] = (r.ex[k] || []).slice(0, 3); });
  return {
    items, ex,
    info: { 回: r.runs, 台詞行: r.lines, 呼びかけ: r.call + '（' + pct(r.call, r.lines) + '）', 自動: r.auto, 二人称の置き換え: r.you, 手書き: r.hand, '参考 consec': r.consec, '閾値内': JSON.stringify(Object.keys(TH).reduce((o, k) => (o[k] = Math.min(r.n[k] || 0, TH[k]), o), {})) },
    err: (r.err || []).length, errEx: (r.err || []).slice(0, 3)
  };
}
const LABEL = { dup: '同じ記録で同じ相手を 2 回以上名前で呼ぶ', short: '短い台詞（8 字以下）に名前', reply: '相づち・返事に名前', explain: '説明の言い切りに名前', solo: '独り言で居ない相手を名前で呼ぶ', pair: '二人きりの記録で毎回名前を呼ぶ', honor: '敬称の重なり', mob: 'モブの名前への呼びかけ' };
function print(r, errors, o) {
  console.log('== call-audit', o.dir || '', o.mode || '(全年齢版)', '回数', r.runs, 'ページのエラー', errors.length, errors.slice(0, 2));
  if (r.err.length) console.log('失敗', r.err.length, r.err.slice(0, 3));
  console.log('台詞行', r.lines, '呼びかけ', r.call, '（' + pct(r.call, r.lines) + '）', '自動', r.auto, '（' + pct(r.auto, r.lines) + '）', '二人称の置き換え', r.you, '手書き', r.hand, '（' + pct(r.hand, r.lines) + '）',
    '／性的な場面：台詞行', r.lewd.lines, '呼びかけ', r.lewd.call, '自動', r.lewd.auto, '／参考 consec', r.consec);
  console.log('違和感の型', Object.keys(r.n).map(k => k + ' ' + r.n[k] + (r.nAuto[k] ? '（自動 ' + r.nAuto[k] + '）' : '')).join('・'));
  console.log('  箱庭'.padEnd(14), '台詞行'.padStart(6), '呼びかけ'.padStart(10), '自動'.padStart(6), '二人称'.padStart(6), '手書き'.padStart(6), '  違和感');
  Object.keys(r.bySc).forEach(sc => {
    const b = r.bySc[sc], bad = Object.keys(LABEL).filter(k => b[k]).map(k => k + ' ' + b[k]).join(' ');
    console.log('  ' + sc.padEnd(12), String(b.lines).padStart(6), (b.call + ' ' + pct(b.call, b.lines)).padStart(12), String(b.auto).padStart(6), String(b.you).padStart(6), String(b.hand).padStart(6), '  ' + bad);
  });
  Object.keys(r.ex).forEach(k => { if (r.ex[k].length) { console.log('-- ' + k + (LABEL[k] ? '（' + LABEL[k] + '）' : k === 'call' ? '（手書きの呼びかけの例）' : '（自動の差し込みの例）')); r.ex[k].forEach(x => console.log('  ' + x)); } });
  if (o.json) fs.writeFileSync(o.json, JSON.stringify(r));
}
module.exports = { passes: { call: PASS }, judges: { call: JUDGE }, print, summarize, LABEL, TH };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 8, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), JS = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7);
  if (!dir) { console.error('使い方: node call-audit.js <ビルド> [回数] [r18|safe|\'\'] [箱庭id,…] [--why] [--json=出力.json]'); process.exit(1); }
  const t = await core.runTool({ dir, hash: mode, lewdMode: '', mod: module.exports, pass: 'call', judge: 'call', opt: { N, only, why: WHY } });
  print(t.r, t.errors, { dir, mode, json: JS });
})();
