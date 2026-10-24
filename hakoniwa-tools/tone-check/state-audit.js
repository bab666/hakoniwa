/* 住人の状態の点検：死んだ人・監禁中の人・場を離れた人が出来事に出てこないか、「R18に参加しない」人や
   「恋愛・R18にしない相手」の組が性的な場面に出てこないか、「恋人だけ」の人がモブと性的な場面にならないかを数える
   使い方: node state-audit.js <ビルドのディレクトリ> [1シナリオあたりの回数=24] [r18|safe|''] [シナリオid,…] [--why] [--hot]
   S1: 死んだ人（死の記録が出たあと）が、死・場面転換以外の出来事に出た
   S2: 監禁中の人が、執着の出来事（cageOk）以外の出来事に出た（記録に残ったもの。手前で止めた分は「止めた」に数える）
   S3: 場を離れた人（脱出・行方不明・連れ去り）が、出来事に出た
   S4: 「R18に参加しない」人が、性的な文に名前つきで出た
   S5: 「恋愛・R18にしない相手」の二人が、同じ性的な文に出た
   S6: 「恋人だけ（モブにも襲われない）」の人が、住人でない相手との性的な文に出た
   S7: 一つの場面（一つの記録）の中で、同じ文が二度出た（R18の文の重複）
   S8: 内容のスイッチで切った出来事（tags）が出た
   S9: 吹雪の館で、助手が自分の探偵ではない探偵を「先生」と呼んだ（探偵2人以上の回）
   「止めた」：出来事の記録の手前（Ctx.say の防波堤）で捨てられた件数。出所を直すと減る（0 でなくてよい） */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), HOT = process.argv.includes('--hot');
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only, WHY, HOT, mode }) => {
    const SEXCORE = /抱き潰|エッチ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|挿入|舐め|愛撫|達し|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|犯|根元|締めつけ|締め付け|射精|ナカ|♡|昂り|濡れ|蜜|奥を|奥に|奥まで|一つにな|ひとつにな|繋がっ|繋がり|繋がる|呑み込|搾り|搾精|脈打|ノット|種付け|孕|精を|白濁|注が|中に出/;
    const NONSEX = /蜂蜜|蜜で煮|ずぶ濡れ|根元(?:から|で)|石碑の根元|首を締め|歯磨き粉[^。]*舐め|濡れた肩|濡れた(?:ユキノ|アキラ|ミナト|カオル|ハルカ|レンジ)|綱は、生き物のように脈打|影が一つ|残っているのは[^。]*|(?:洞窟|ロッカー|蔵|櫓|石舞台|森|部屋|棚|引き出し|鞄|物置|倉庫|屋敷|館|廊下|路地|喉|胸|心|目|瞳)の(?:最)?奥|最奥を前|濡れ(?:タオル|ていた|た(?:服|シャツ|髪|地面|床|手|頬|瞳|目|体|まま))|(?:酒|お茶|水)が注が|犯人|犯行|防犯|犯罪|共犯|ほかに：[^\n]*|上達|到達|配達|伝達|達成|発達|通達|熟達|調達|速達|先達|の果て(?=[にのへでまを、。])|果てしな|舐めん[なじ]|舐めた(?:真似|口)|(?:洞窟|森|遺跡|施設|地下|迷宮|神殿)の最奥|涙に濡れ|雨に濡れ|濡れた(?:髪|服|地面|床|手|頬|瞳|目)|血に濡れ|注がれた(?:お茶|茶|酒|水|コーヒー|紅茶|スープ|グラス|杯)|(?:視線|注目|愛情|光|魔力)が注が/g;
    const MOB = /男たち|男が|客|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|村人|略奪者|おじさん|兵士|盗賊|マッサージ師|施術師|整体師|司会|カメラマン|監督|インキュバス|獣|看守|見知らぬ|誰とも知れない|壁の向こう|向こう側の誰か|モブ|生命体|異星|神(?:は|が|の手|に)|邪神/;
    const sents = t => String(t).replace(NONSEX, '＿').split(/[。！？\n」]/);
    const isSex = s => SEXCORE.test(s);
    const out = { n: {}, ex: {}, drop: {}, runs: 0, err: [], bySc: {} };
    const KEYS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];
    KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
    let cur = null;
    const hit = (k, msg) => { out.n[k]++; out.bySc[cur.sc][k] = (out.bySc[cur.sc][k] || 0) + 1; if (out.ex[k].length < (WHY ? 40 : 6)) out.ex[k].push(cur.sc + ' | ' + msg); };
    /* 不在・遺体・後日談を描く文（その人がいないこと自体を書いている）は数えない */
    const EXEMPT = /席が[^。]{0,6}空いて|見つかった|遺体|亡骸|死んでいた|それからも|その後|あれから|外では|一週間後|数日後|後日|夜明け|半年後|か月後|年後|外から見れば/;
    const SKIPK = /^(?:step|phase|death|end|ending|summary)$/;
    /* 出来事の記録を包む：エンジン型（Ctx.say）と物語型（HK.Story.say） */
    const Ctx = HK.Ctx;
    if (Ctx && !Ctx.prototype.say._audit) {
      const say0 = Ctx.prototype.say;
      Ctx.prototype.say = function (o) {
        const kind = o.kind || 'phase';
        const acs = (o.actors || []).filter(c => c && c.i != null);
        const st = this.stepIndex;
        const snap = acs.map((c, k) => ({ c, lead: k === 0, dead: !c.alive && c._auditDeathLogged && c.diedAt != null && c.diedAt < st, caged: c.flags && c.flags.caged != null, out: !!c.out && c._auditOutStep != null && c._auditOutStep < st }));
        if (kind === 'step') this.chars.forEach(c => { if (c.out && c._auditOutStep == null) c._auditOutStep = st; });
        const over = this.chars.every(c => !c.alive || c.out);
        const e = say0.call(this, o);
        if (cur && !cur.story) {
          if (e && e.skipped) { const why = o.cat === 'romance' ? 'romance' : 'caged'; out.drop[why] = (out.drop[why] || 0) + 1; }
          else if (e && !SKIPK.test(kind) && !over && !/^(?:phase|grief|mourn|death|memory|end|ending)$/.test(o.cat || '')) {
            snap.forEach(s => {
              /* ゾンビになった住人（fate＝ゾンビ化）は、死んだあとも襲ってくる側として出てよい */
              if (s.dead && s.lead && s.c.fate !== 'ゾンビ化' && !EXEMPT.test(String(o.text))) hit('S1', s.c.name + ' [' + (o.cat || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
              if (s.caged && !o.cageOk) hit('S2', s.c.name + ' [' + (o.cat || '') + '] ' + String(o.text).slice(0, 160));
              if (s.out && s.lead && !EXEMPT.test(String(o.text))) hit('S3', s.c.name + ' [' + (o.cat || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
            });
          }
          if (kind === 'death' && acs[0]) acs[0]._auditDeathLogged = true;
          if (e && !e.skipped && o.tags && cur.offTags) o.tags.forEach(t => { if (cur.offTags[t]) hit('S8', t + ' | ' + String(o.text).slice(0, 160)); });
        }
        return e;
      };
      Ctx.prototype.say._audit = true;
    }
    const ST = HK.Story;
    if (ST && ST.say && !ST.say._audit) {
      const ss0 = ST.say;
      ST.say = function (S, o) {
        const kind = o.kind || 'event';
        const P = S && S.P;
        const acs = (o.actors || []).map(p => typeof p === 'number' ? (P && P[p]) : p).filter(p => p && p.i != null);
        const snap = acs.map((p, k) => ({ p, lead: k === 0, dead: p.alive === false && p._auditDeadStep, out: !!(p.out || p.gone || p.taken) && p._auditOutStep }));
        const e = ss0.call(this, S, o);
        const over = P && P.every(p => !p || p.alive === false || p.out || p.gone);
        if (cur && cur.story && !SKIPK.test(kind) && !over && kind !== 'climax' && !/結末|全滅|死|最期|蘇生|復活|発見|遺体|喪失|追悼|弔い|回想|その後|脱出|救出|帰還|生還|行方不明|処刑|襲撃|生贄|事件|継承|霊媒|勝利|敗北|騙され|人質|囚われ|形見|遺言|真相|推理|後日|夜明け|雪の中/.test(o.tag || '')) {
          snap.forEach(s => {
            if (s.dead && s.lead && !EXEMPT.test(String(o.text))) hit('S1', s.p.name + ' [' + (o.tag || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
            if (s.out && s.lead && !EXEMPT.test(String(o.text))) hit('S3', s.p.name + ' [' + (o.tag || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
          });
          if (o.tags && cur.offTags) o.tags.forEach(t => { if (cur.offTags[t]) hit('S8', t + ' | ' + String(o.text).slice(0, 160)); });
        }
        /* 死・不在に気づいた次の記録から数える（死や離脱を告げる記録そのものは数えない） */
        /* 区切り（step）の時点で死んでいた・離れていた人だけを数える（同じ区切りの中で死んだ・離れた人の記録は数えない） */
        if (P && kind === 'step') P.forEach(p => { if (p && p.alive === false) p._auditDeadStep = true; else if (p) p._auditDeadStep = false; if (p && (p.out || p.gone || p.taken)) p._auditOutStep = true; else if (p) p._auditOutStep = false; });
        return e;
      };
      ST.say._audit = true;
    }
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ソウタ', 'リコ'];
    /* 配役：執着（監禁を起こす）・恋人・恋愛にしない相手・R18に参加しない人・恋人だけの人を混ぜる */
    const CASTS = [
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'bottom', '', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'yan' }, { a: 2, b: 3, type: 'lover' }], ng: [[4, 5]], noR18: [2], lo: [3] },
      { g: ['f', 'f', 'm', 'm', 'f', 'm'], p: ['', '', 'top', 'bottom', 'top', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'yan' }], ng: [[0, 2]], noR18: [4], lo: [1] },
      { g: ['m', 'm', 'f', 'f', 'm', 'f'], p: ['top', 'bottom', 'top', 'bottom', '', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }, { a: 4, b: 0, type: 'yan' }], ng: [[1, 5]], noR18: [5], lo: [0, 1] },
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', '', 'top', 'bottom', ''], ties: [{ a: 0, b: 1, type: 'fwb' }, { a: 3, b: 2, type: 'yan' }], ng: [[4, 1]], noR18: [0], lo: [] }
    ];
    const ids = only || Object.keys(HK.SCENARIOS);
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) continue;
      out.bySc[sc] = { runs: 0 };
      for (let s = 0; s < N; s++) {
        const cast = CASTS[s % CASTS.length];
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, sc === 'jinro' ? 6 : 2 + (s % 5)));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          const ng = []; cast.ng.forEach(pr => { if (pr[0] === i && pr[1] < n) ng.push(pr[1]); if (pr[1] === i && pr[0] < n) ng.push(pr[0]); });
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: '', color: '', call: '', calls: {}, loveLock: '', loveNG: ng, noR18: cast.noR18.indexOf(i) >= 0, sexLock: cast.lo.indexOf(i) >= 0 ? 'loverOnly' : '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        /* 館：探偵2人と助手2人の回を混ぜる（S9） */
        if (sc === 'yakata' && n >= 4 && s % 2 === 0) { perChar[0].role = 'detective'; perChar[1].role = 'detective'; perChar[2].role = 'assistant'; perChar[3].role = 'assistant'; }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; });
        if (HOT) (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night|npc|lust|yobai/.test(e.id)) env[e.id] = e.max;
          else if (e.options && /lewd/.test(e.id)) { const hi = e.options.filter(o => /high|max|lewd/.test(o.v))[0]; if (hi) env[e.id] = hi.v; }
        });
        /* 内容のスイッチ（あれば）：偶数回は全部切る */
        const offTags = {};
        if (HK.Content && HK.Content.TAGS && s % 2 === 0) HK.Content.TAGS.forEach(t => { offTags[t.id] = true; env['ct_' + t.id] = 0; });
        const ties = (cast.ties || []).filter(t => t.a < n && t.b < n);
        cur = { sc, story: !!scen.solo, offTags };
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 3000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + ': ' + String(e && e.stack || e).slice(0, 300)); continue; }
        out.runs++; out.bySc[sc].runs++;
        /* 記録の文で見る点検（S4〜S7, S9） */
        const nm = chars.map(c => c.name);
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || !e.text) return;
          const ss = sents(e.text);
          /* S7：一つの記録の中の同じ文（12文字以上・性的な文） */
          const seen = {};
          ss.forEach(x => { const k = x.replace(/[「」『』\s]/g, ''); if (k.length >= 12 && isSex(x)) { if (seen[k]) hit('S7', k.slice(0, 80) + ' || ' + e.text.slice(0, 120)); seen[k] = 1; } });
          ss.forEach(x => {
            if (!isSex(x)) return;
            const inS = nm.map((n0, i) => x.indexOf(n0) >= 0 ? i : -1).filter(i => i >= 0);
            if (!inS.length) return;
            const core = HK.State && HK.State.R18_CORE && HK.State.R18_CORE[sc];
            inS.forEach(i => { if (chars[i].noR18 && mode === 'r18' && !core) hit('S4', nm[i] + ' [' + (e.tag || e.cat || '') + '] | ' + x.slice(0, 140)); });
            for (let a = 0; a < inS.length; a++) for (let b = a + 1; b < inS.length; b++) if (chars[inS[a]].loveNG.indexOf(inS[b]) >= 0 && inS.length === 2) hit('S5', nm[inS[a]] + '×' + nm[inS[b]] + ' | ' + x.slice(0, 140));
            inS.forEach(i => { if (chars[i].sexLock === 'loverOnly' && !core && MOB.test(x) && inS.length === 1) hit('S6', nm[i] + ' | ' + x.slice(0, 140)); });
          });
          if (sc === 'yakata' && perChar[0].role === 'detective' && /先生/.test(e.text)) {
            /* 助手（2,3）のうち、文の中の「先生」が指す探偵が自分の探偵でない：探偵の名前と助手の名前が同じ記録にあり、助手と結びついた探偵と違う */
            const P = res.yakataBuddy || null;
            if (P) Object.keys(P).forEach(ai => { const d = P[ai]; if (e.text.indexOf(nm[ai] + '「') >= 0 || e.text.indexOf(nm[ai] + 'は') >= 0) { const other = [0, 1].filter(k => k !== d)[0]; if (e.text.indexOf(nm[other]) >= 0 && e.text.indexOf(nm[d]) < 0 && /先生/.test(e.text)) hit('S9', nm[ai] + '→' + nm[other] + ' | ' + e.text.slice(0, 160)); } });
          }
        });
        cur = null;
      }
    }
    return out;
  }, { N, only, WHY, HOT, mode });
  const ids = Object.keys(r.bySc);
  for (const sc of ids) {
    const b = r.bySc[sc]; const cells = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'].map(k => k + ' ' + (b[k] || 0));
    console.log(sc.padEnd(10), 'runs', b.runs, cells.join(' '));
  }
  console.log('合計', JSON.stringify(r.n), '止めた', JSON.stringify(r.drop));
  for (const k of Object.keys(r.ex)) if (r.ex[k].length) { console.log('--- ' + k); r.ex[k].forEach(x => console.log('  ' + x)); }
  if (r.err.length) { console.log('--- 例外'); r.err.slice(0, 20).forEach(x => console.log('  ' + x)); }
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
