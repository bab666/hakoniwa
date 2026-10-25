/* 展開の重さの点検（mood-dial.js の HK.Dark）：全箱庭を 穏やか／ふつう／重い で N 回ずつ回し、重い展開の数を比べる
   使い方: node dark-audit.js <ビルドのディレクトリ> [1シナリオ・1段階あたりの回数=40] [r18|safe|''] [シナリオid,…] [--env=lewd:high] [--why]（--why：死因の内訳も出す）
   数えるもの（1回あたり。死・暴走は合計も出す）：
     死    ：死んだ住人（エンジン型は alive=false、物語型は S.P の alive=false）
     暴走  ：執着の暴走（監禁・恋敵への危害・心中。エンジン型は O.climax、物語型は storyTick の「執着の暴走」）。心中・監禁・危害の内訳も
     別れ  ：別れた・浮気の札（engine の markRel）と、物語型の「別れ・破局・浮気・失恋」の札
     堕ち  ：堕ちた住人（物語型の結末・fate に「堕ち」）
     悪結末：物語型は ending.kind が over、エンジン型は全滅か、死ぬ箱庭で半分以上が死んだ回の割合
   合否：
     ・死＋暴走の合計（その箱庭にあるとき）：穏やか ≤ 0.5×ふつう、重い ≥ 1.3×ふつう
     ・死ぬ箱庭（ふつうで死が N 回に 3 件以上ある箱庭）は、穏やかでも死が 1 件以上（止める設定ではない）
   ふつうの回数が少なすぎる箱庭（死＋暴走が N 回で 3 件未満）は、比を出さずに「少」と書く。30 件未満の箱庭は、ぶれを減らすため 3N 回まで足して判定する
   人狼・バトルロワイヤル・裁判デスゲーム（全年齢版）の脱落はゲームの決まり（最後の一人まで・毎回の処刑）なので比を見ない（数は出す） */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 40, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  if (!dir) { console.log('使い方: node dark-audit.js <ビルドのディレクトリ> [回数=40] [r18|safe|\'\'] [シナリオid,…]'); process.exit(1); }
  const WHY = process.argv.includes('--why');
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only, ENVSET }) => {
    const out = { bySc: {}, err: [] };
    /* 物語型の S を拾う（ST.state・SoloKit.state を包む） */
    let curS = null, cnt = null;
    const wrapState = (obj, key) => { if (obj && obj[key] && !obj[key]._dk) { const f0 = obj[key]; obj[key] = function () { const S = f0.apply(this, arguments); curS = S; return S; }; obj[key]._dk = 1; } };
    wrapState(HK.Story, 'state'); wrapState(HK.SoloKit, 'state');
    const O = HK.Obsess;
    if (O && O.climax && !O.climax._dk) {
      const c0 = O.climax;
      O.climax = function (ctx, a, b, s, ty, c) {
        const pf = ctx.pair(a, b), cap0 = !!pf.captive, sh0 = !!pf.shinju, hm0 = c ? !!ctx.pair(a, c).obHarm : false;
        const res = c0.apply(this, arguments);
        if (cnt && res) {
          if (!sh0 && pf.shinju) cnt.shinju++;
          else if (!cap0 && pf.captive) cnt.cage++;
          else if (c && !hm0 && ctx.pair(a, c).obHarm) cnt.harm++;
          else if (/心中|二人だけの世界/.test(res.why || '')) cnt.shinjuTry++;
          else cnt.cage += /執着が暴走/.test(res.why || '') ? 1 : 0;
        }
        return res;
      };
      O.climax._dk = 1;
    }
    if (O && O.storyTick && !O.storyTick._dk) {
      const t0 = O.storyTick;
      O.storyTick = function () { const r0 = t0.apply(this, arguments); if (cnt && r0 && r0.tag === '執着の暴走') cnt.obsStory++; return r0; };
      O.storyTick._dk = 1;
    }
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ソウタ', 'リコ'];
    /* 配役：執着・恋人・セフレを混ぜる（暴走・別れ・浮気が起きる形） */
    const CASTS = [
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'bottom', '', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'yan' }, { a: 2, b: 3, type: 'lover' }] },
      { g: ['f', 'f', 'm', 'm', 'f', 'm'], p: ['', '', 'top', 'bottom', 'top', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'yan' }] },
      { g: ['m', 'm', 'f', 'f', 'm', 'f'], p: ['top', 'bottom', 'top', 'bottom', '', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }, { a: 4, b: 0, type: 'yan' }] },
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', '', 'top', 'bottom', ''], ties: [{ a: 0, b: 1, type: 'fwb' }] }
    ];
    const LV = ['mild', 'normal', 'dark'];
    const ids = only || HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id]);
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) continue;
      const row = out.bySc[sc] = { lethal: !!scen.lethal, solo: !!scen.solo, game: /^(?:jinro|br|trial)$/.test(sc) };
      LV.forEach(lv => { row[lv] = { runs: 0, dead: 0, shinju: 0, shinjuTry: 0, cage: 0, harm: 0, obsStory: 0, brk: 0, fall: 0, bad: 0, why: {} }; });
      const one = (lv, s) => {
          const t = row[lv];
          const cast = CASTS[s % CASTS.length];
          const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, sc === 'jinro' ? 6 : 2 + (s % 5)));
          const chars = [], perChar = [];
          for (let i = 0; i < n; i++) {
            chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: '', color: '', call: '', calls: {}, loveLock: '', loveNG: [], noR18: false, sexLock: '' });
            perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
          }
          const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
          (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; });
          (scen.env || []).forEach(e => { if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
          ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
          if (HK.Content && HK.Content.TAGS) env.ct = HK.Content.TAGS.map(x => x.id).join(',');
          env.heavy = lv;
          const ties = (cast.ties || []).filter(x => x.a < n && x.b < n);
          curS = null; cnt = t;
          let res;
          try { res = HK.simulate({ scenId: sc, seed: 5000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + '/' + lv + ': ' + String(e && e.stack || e).slice(0, 300)); cnt = null; return; }
          cnt = null; t.runs++;
          let dead = 0, tot = n;
          if (scen.solo) {
            const P = (curS && curS.P) || [];
            dead = P.filter(p => p && p.alive === false).length;
            P.forEach(p => { if (p && p.alive === false) { const k = String(p.how || p.fate || '?').replace(/（.*?）/g, '').slice(0, 24); t.why[k] = (t.why[k] || 0) + 1; } });
            tot = P.length || n;
            const H = res.heroes || [];
            t.fall += H.filter(h => /堕ち|堕ちた|快楽に溺れ/.test(String(h.fate || ''))).length || (/堕ち/.test(String(res.ending && res.ending.title || '')) ? 1 : 0);
            if (res.ending && res.ending.kind === 'over') t.bad++;
            (res.log || []).forEach(e => { if (e && /別れ|破局|浮気|失恋/.test(e.tag || '')) t.brk++; });
          } else {
            dead = (res.chars || []).filter(c => c && c.alive === false).length;
            (res.chars || []).forEach(c => { if (c && c.alive === false) { const k = String(c.deathHow || c.fate || '?').slice(0, 24); t.why[k] = (t.why[k] || 0) + 1; } });
            tot = (res.chars || []).length || n;
            if (dead >= tot || (scen.lethal && dead * 2 >= tot)) t.bad++;
            (res.log || []).forEach(e => { if (e && e.mark) e.mark.forEach(m => { if (m === 'break' || m === 'cheat') t.brk++; }); });
          }
          t.dead += dead; if (s < N) t.deadN = (t.deadN || 0) + dead;
      };
      LV.forEach(lv => { for (let s = 0; s < N; s++) one(lv, s); });
      /* ふつうの「死＋暴走」が少ない（3〜29 件）箱庭は、比がぶれやすいので 3N 回まで足して確かめる */
      const hN = row.normal.dead + row.normal.shinju + row.normal.cage + row.normal.harm + row.normal.obsStory;
      if (hN >= 3 && hN < 30) { row.ext = true; LV.forEach(lv => { for (let s = N; s < 3 * N; s++) one(lv, s); }); }
    }
    return out;
  }, { N, only, ENVSET });
  const pad = (x, w) => String(x).padStart(w);
  const per = (v, n) => n ? (v / n).toFixed(2) : '-';
  let fail = 0;
  console.log('箱庭'.padEnd(9), '段階  ', '死/回', ' 心中', ' 監禁', ' 危害', '暴走物', ' 別れ', ' 堕ち', '悪結末', '  死+暴走', '比');
  for (const sc of Object.keys(r.bySc)) {
    const row = r.bySc[sc], nm = row.normal;
    const heavy = t => t.dead + t.shinju + t.cage + t.harm + t.obsStory;
    const base = heavy(nm);
    for (const lv of ['mild', 'normal', 'dark']) {
      const t = row[lv], h = heavy(t);
      let ratio = base >= 3 ? (h / base).toFixed(2) : (base ? '少' : '―'), mark = '';
      /* 人狼・バトルロワイヤル・裁判デスゲームの脱落はゲームの決まりなので比は見ない（数は出す） */
      if (row.game) { if (lv === 'mild') mark = '（ゲームの脱落。比は見ない）'; }
      else {
        if (base >= 3 && lv === 'mild' && h > base * 0.5) { mark = ' ×（穏やか ≤0.5）'; fail++; }
        if (base >= 3 && lv === 'dark' && h < base * 1.3) { mark = ' ×（重い ≥1.3）'; fail++; }
        const lethal = row.lethal || (row.solo && nm.dead / Math.max(1, nm.runs) >= 0.25);
        /* ふつうで死が 3 件以上ある箱庭だけ見る（無人島のように死がまれな箱庭は、穏やかで 0 でもぶれの範囲） */
        if (lv === 'mild' && lethal && nm.dead >= 3 && !(t.deadN >= 1)) { mark += ' ×（穏やかでも死が要る）'; fail++; }
      }
      console.log(sc.padEnd(9), lv.padEnd(6), pad(per(t.dead, t.runs), 5), pad(t.shinju, 5), pad(t.cage, 5), pad(t.harm, 5), pad(t.obsStory, 6), pad(t.brk, 5), pad(t.fall, 5), pad(t.runs ? Math.round(t.bad / t.runs * 100) + '%' : '-', 6), pad(h, 9), ratio + mark + (row.ext && lv === 'normal' ? '（件数が少ないので ' + (3 * N) + ' 回）' : ''));
    }
  }
  if (WHY) for (const sc of Object.keys(r.bySc)) for (const lv of ['mild', 'normal', 'dark']) {
    const w = r.bySc[sc][lv].why, ks = Object.keys(w).sort((a, b) => w[b] - w[a]).slice(0, 8);
    if (ks.length) console.log('  死因', sc, lv, ks.map(k => k + ' ' + w[k]).join('／'));
  }
  console.log('不合格', fail);
  if (r.err.length) { console.log('--- 例外'); r.err.slice(0, 20).forEach(x => console.log('  ' + x)); }
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
  if (fail || r.err.length) process.exitCode = 1;
})();
