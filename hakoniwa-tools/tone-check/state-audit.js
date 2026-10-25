/* 住人の状態の点検：死んだ人・監禁中の人・場を離れた人が出来事に出てこないか、「R18に参加しない」人や
   「恋愛・R18にしない相手」の組が性的な場面に出てこないか、「恋人だけ」の人がモブと性的な場面にならないかを数える
   使い方: node state-audit.js <ビルドのディレクトリ> [1シナリオあたりの回数=24] [r18|safe|''] [シナリオid,…] [--why] [--hot]
   S1: 死んだ人（死の記録が出たあと）が、死・場面転換以外の出来事に出た
   S2: 監禁中の人が、執着の出来事（cageOk）以外の出来事に出た（記録に残ったもの。手前で止めた分は「止めた」に数える）
   S3: 場を離れた人（脱出・行方不明・連れ去り）が、出来事に出た（主役でも相手でも）
   S4: 「R18に参加しない」人が、性的な文に名前つきで出た
   S5: 「恋愛・R18にしない相手」の二人が、同じ性的な文に出た
   S6: 「恋人だけ（モブにも襲われない）」の人が、住人でない相手との性的な文に出た
   S7: 一つの場面（一つの記録）の中で、同じ文が二度出た（R18の文の重複）
   S8: 内容のスイッチで切った出来事（tags）が出た
   S9: 吹雪の館で、助手が自分の探偵ではない探偵を「先生」と呼んだ（探偵2人以上の回）
   S10: 一回の遊びの中で、同じ性的な文が3つ以上の記録に出た（R18の文の被り。目安として見る）
   S12: 同一人物（attr.js の same）の二人が、恋愛の記録・性的な文に二人だけで出た（奇数回は配役に同一人物の組を足す）
   S11: 最期の言葉（epilogue.js）の名前の取り違え：「〇〇が最期に遺した言葉」の〇〇が、その記録で亡くなった人（死の記録の主役・物語型は記録の登場人物で、亡くなった人）でない／
        言葉の中で自分の名前に呼びかけている／住人の最期の言葉（lastWords）・結末の最期の言葉（E.last）が、本人の名前で始まらない
   S13: 複数の恋人「なし」の回で、同じ人が同じ段階に二人以上と恋人（pf.couple）になっていた（区切りごとと回の終わりに ctx.pf を走査。
        関係の設定ではじめから恋人を二人にした組だけのときは数えない。生きている恋人だけ）。--env=poly:any などで設定を変えて回せる
   S14: 一途（住人の設定 faithful）の人が、恋人がいる間に、恋人でない人と恋愛の出来事・夜（pf.night・pf.nights が増えた）に出た
   「止めた」：出来事の記録の手前（Ctx.say の防波堤）で捨てられた件数。出所を直すと減る（0 でなくてよい） */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), HOT = process.argv.includes('--hot');
  const { browser, page, errors } = await openBuild(dir, mode);
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const r = await page.evaluate(({ N, only, WHY, HOT, mode, ENVSET }) => {
    const SEXCORE = /抱き潰|エッチ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|挿入|舐め|愛撫|達し|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|犯|根元|締めつけ|締め付け|射精|ナカ|♡|昂り|濡れ|蜜|奥を|奥に|奥まで|一つにな|ひとつにな|繋がっ|繋がり|繋がる|呑み込|搾り|搾精|脈打|ノット|種付け|孕|精を|白濁|注が|中に出/;
    const NONSEX = /不老の蜜|金の蜜の小壺|金色のとろりとした蜜|蜜がわずかな量|(?:根元|地面|土|床下|墓)を[^。]{0,6}掘|(?:泥|砂|波|水|沼|流れ)[^。]{0,12}呑み込|眼窩の奥|傷を舐め|蜜の湖|(?:手袋|服|上着|靴)が[^。]{0,8}濡れ|濡れた岩|荒れ果て|(?:渦|波|闇|海|霧|炎)に呑ま|呑み込んで、海|歌がひとつに|本殿の奥|(?:杯|盃|グラス)に[^。]{0,12}注が|蜜蝋|大地が[^。]{0,6}脈打|根元に手|樹皮の奥|ひとかけらを舐め|唇を舐めて我慢|蜂蜜|蜜で煮|ずぶ濡れ|根元(?:から|で)|石碑の根元|首を締め|歯磨き粉[^。]*舐め|濡れた肩|濡れた(?:ユキノ|アキラ|ミナト|カオル|ハルカ|レンジ)|綱は、生き物のように脈打|影が一つ|残っているのは[^。]*|(?:洞窟|ロッカー|蔵|櫓|石舞台|森|部屋|棚|引き出し|鞄|物置|倉庫|屋敷|館|廊下|路地|喉|胸|心|目|瞳)の(?:最)?奥|最奥を前|濡れ(?:タオル|ていた|た(?:服|シャツ|髪|地面|床|手|頬|瞳|目|体|まま))|(?:酒|お茶|水)が注が|犯人|犯行|防犯|犯罪|共犯|ほかに：[^\n]*|上達|到達|配達|伝達|達成|発達|通達|熟達|調達|速達|先達|の果て(?=[にのへでまを、。])|果てしな|舐めん[なじ]|舐めた(?:真似|口)|(?:洞窟|森|遺跡|施設|地下|迷宮|神殿)の最奥|涙に濡れ|雨に濡れ|濡れた(?:髪|服|地面|床|手|頬|瞳|目)|血に濡れ|注がれた(?:お茶|茶|酒|水|コーヒー|紅茶|スープ|グラス|杯)|(?:視線|注目|愛情|光|魔力)が注が|びしょ濡れ/g;
    const MOB = /男たち|男が|客|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|村人|略奪者|おじさん|兵士|盗賊|マッサージ師|施術師|整体師|司会|カメラマン|監督|インキュバス|獣|看守|見知らぬ|誰とも知れない|壁の向こう|向こう側の誰か|モブ|生命体|異星|神(?:は|が|の手|に)|邪神/;
    const sents = t => String(t).replace(NONSEX, '＿').split(/[。！？\n」]/);
    const isSex = s => SEXCORE.test(s);
    const out = { n: {}, ex: {}, drop: {}, runs: 0, err: [], bySc: {} };
    const KEYS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14'];
    KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
    let cur = null, lastCtx = null;
    const hit = (k, msg) => { out.n[k]++; out.bySc[cur.sc][k] = (out.bySc[cur.sc][k] || 0) + 1; if (out.ex[k].length < (WHY ? 40 : 6)) out.ex[k].push(cur.sc + ' | ' + msg); };
    /* S13・S14：恋人の数と一途（区切りごとと回の終わりに ctx.pf を走査） */
    const pkey = (x, y) => Math.min(x.i, y.i) + '-' + Math.max(x.i, y.i);
    const loversOf = (ctx, x) => ctx.chars.filter(y => y !== x && y.alive !== false && ctx.pf[pkey(x, y)] && ctx.pf[pkey(x, y)].couple);
    const polyCheck = (ctx, end) => {
      if (!cur || cur.story || !ctx || !ctx.pf || !ctx.chars) return;
      const C = ctx.chars, pmode = (ctx.env && ctx.env.poly) || 'none';
      if (!ctx._auditPre) { ctx._auditPre = {}; Object.keys(ctx.pf).forEach(k => { if (ctx.pf[k].couple) ctx._auditPre[k] = 1; }); }
      C.forEach(x => {
        if (x.alive === false) return;
        const L = loversOf(ctx, x);
        if (pmode === 'none' && L.length >= 2 && L.some(y => !ctx._auditPre[pkey(x, y)])) hit('S13', (end ? '終わり' : '段階' + ctx.stepIndex) + ' ' + x.name + '→' + L.map(y => y.name).join('・'));
      });
      const pn = ctx._auditNight || (ctx._auditNight = {}), lv = ctx._auditLov || {};
      Object.keys(ctx.pf).forEach(k => {
        const pf = ctx.pf[k], n = (pf.nights || 0) + (pf.night ? 1 : 0), ij = k.split('-').map(Number);
        if (pn[k] != null && n > pn[k]) [[ij[0], ij[1]], [ij[1], ij[0]]].forEach(fo => { const f = C[fo[0]]; if (f && f.faithful && lv[f.i] && lv[f.i].length && lv[f.i].indexOf(fo[1]) < 0) hit('S14', '夜 ' + f.name + '×' + C[fo[1]].name + '（恋人：' + lv[f.i].map(i => C[i].name).join('・') + '）'); });
        pn[k] = n;
      });
      ctx._auditLov = {}; C.forEach(x => { ctx._auditLov[x.i] = loversOf(ctx, x).map(y => y.i); });
    };
    /* 不在・遺体・後日談を描く文（その人がいないこと自体を書いている）は数えない */
    const EXEMPT = /席が[^。]{0,6}空いて|見つかった|遺体|亡骸|死んでいた|それからも|その後|あれから|外では|一週間後|数日後|後日|夜明け|半年後|か月後|年後|外から見れば|部屋を出たあと|プリントを届け/;
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
        if (kind === 'step' && cur && !cur.story) { lastCtx = this; polyCheck(this, false); }
        const e = say0.call(this, o);
        if (cur && !cur.story && e && !e.skipped && o.cat === 'romance' && !SKIPK.test(kind)) acs.forEach(f => {
          if (!f.faithful || !this.pf) return;
          const L = loversOf(this, f);
          if (L.length && acs.some(y => y !== f && L.indexOf(y) < 0)) hit('S14', '恋愛 ' + f.name + '（恋人：' + L.map(y => y.name).join('・') + '）| ' + String(o.text).slice(0, 120));
        });
        if (cur && !cur.story) {
          if (e && e.skipped) { const why = o.cat === 'romance' ? 'romance' : 'caged'; out.drop[why] = (out.drop[why] || 0) + 1; }
          else if (e && !SKIPK.test(kind) && !over && !/^(?:phase|grief|mourn|death|memory|end|ending)$/.test(o.cat || '')) {
            snap.forEach(s => {
              /* ゾンビになった住人（fate＝ゾンビ化）は、死んだあとも襲ってくる側として出てよい */
              if (s.dead && s.lead && s.c.fate !== 'ゾンビ化' && !EXEMPT.test(String(o.text))) hit('S1', s.c.name + ' [' + (o.cat || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
              if (s.caged && !o.cageOk) hit('S2', s.c.name + ' [' + (o.cat || '') + '] ' + String(o.text).slice(0, 160));
              if (s.out && !EXEMPT.test(String(o.text))) hit('S3', s.c.name + ' [' + (o.cat || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
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
            if (s.out && !EXEMPT.test(String(o.text))) hit('S3', s.p.name + ' [' + (o.tag || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
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
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'bottom', '', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'yan' }, { a: 2, b: 3, type: 'lover' }], ng: [[4, 5]], noR18: [2], lo: [3], same: [3, 4] },
      { g: ['f', 'f', 'm', 'm', 'f', 'm'], p: ['', '', 'top', 'bottom', 'top', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'yan' }], ng: [[0, 2]], noR18: [4], lo: [1], same: [3, 5], fa: [0] },
      { g: ['m', 'm', 'f', 'f', 'm', 'f'], p: ['top', 'bottom', 'top', 'bottom', '', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }, { a: 4, b: 0, type: 'yan' }], ng: [[1, 5]], noR18: [5], lo: [0, 1], same: [3, 4], fa: [3] },
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', '', 'top', 'bottom', ''], ties: [{ a: 0, b: 1, type: 'fwb' }, { a: 3, b: 2, type: 'yan' }], ng: [[4, 1]], noR18: [0], lo: [], same: [2, 5], fa: [2] }
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
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: '', color: '', call: '', calls: {}, loveLock: '', loveNG: ng, noR18: cast.noR18.indexOf(i) >= 0, sexLock: cast.lo.indexOf(i) >= 0 ? 'loverOnly' : '', faithful: (cast.fa || []).indexOf(i) >= 0 });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        /* S12：奇数回は同一人物の組を足す（相手どうしに書く） */
        const same = s % 2 && cast.same && cast.same[1] < n ? cast.same : null;
        if (same) { chars[same[0]].same = same[1]; chars[same[1]].same = same[0]; }
        /* 館：探偵2人と助手2人の回を混ぜる（S9） */
        if (sc === 'yakata' && n >= 4 && s % 2 === 0) { [0, 1, 2, 3].forEach(k => { const r0 = k < 2 ? 'detective' : 'assistant'; perChar[k].role = r0; perChar[k].pick = Object.assign({}, perChar[k].pick, { role: r0 }); }); }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; });
        /* 役割（mob.js の HK.Roles）は、回ごとに「おまかせ」と「住人から」を交互に */
        (scen.env || []).forEach(e => { if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
        ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
        if (HOT) (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night|npc|lust|yobai/.test(e.id)) env[e.id] = e.max;
          else if (e.options && /lewd/.test(e.id)) { const hi = e.options.filter(o => /high|max|lewd/.test(o.v))[0]; if (hi) env[e.id] = hi.v; }
        });
        /* 内容のスイッチ（あれば）：偶数回は全部切る */
        /* 内容のスイッチ：偶数回はすべて切、奇数回はすべて入（S8 は切の回に、合意のない場面などが出たら数える） */
        const offTags = {};
        if (HK.Content && HK.Content.TAGS) { if (s % 2 === 0) { HK.Content.TAGS.forEach(t => { offTags[t.id] = true; }); env.ct = ''; } else env.ct = HK.Content.TAGS.map(t => t.id).join(','); }
        const ties = (cast.ties || []).filter(t => t.a < n && t.b < n);
        cur = { sc, story: !!scen.solo, offTags };
        let res;
        lastCtx = null;
        try { res = HK.simulate({ scenId: sc, seed: 3000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + ': ' + String(e && e.stack || e).slice(0, 300)); continue; }
        /* S13・S14：回の終わりにもう一度 */
        if (lastCtx) polyCheck(lastCtx, true);
        out.runs++; out.bySc[sc].runs++;
        /* 記録の文で見る点検（S4〜S7, S9） */
        const nm = chars.map(c => c.name);
        /* S8：内容のスイッチを切った回に、合意のない場面（札・理由で見分ける）・妊娠・快楽殺人の性的な文が出た */
        const coreSc = HK.Content && HK.Content.CORE && HK.Content.CORE[sc];
        if (offTags.force && !coreSc) (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string') return;
          const lab = (e.tag || '') + ' ' + (e.why || '');
          if (!/恋人|攻めを選んで|自分から/.test(lab) && /夜這い|憑依|清めの湯|洞窟|脅迫|蛇の夜|蛇の夢|チョー・チョー人|収穫祭の夜|略奪者|ゾンビに襲|監禁の夜|奪われたうなじ|攫われ|強引|無理やり|凌辱|夢の中で神/.test(lab) && sents(e.text).some(isSex)) hit('S8', 'force | ' + lab.slice(0, 50) + ' | ' + e.text.slice(0, 100));
        });
        if (offTags.preg) (res.log || []).forEach(e => { if (e && /(?<!酸素を)孕|疑似妊娠|身籠|神の子を産む/.test((e.text || '') + (e.why || ''))) hit('S8', 'preg | ' + (e.why || '').slice(0, 40) + ' | ' + String(e.text).slice(0, 100)); });
        /* S10：一回の遊びの中で、同じ性的な文（15文字以上）が3つ以上の記録に出た */
        const runSeen = {};
        (res.log || []).forEach(e => { if (!e || typeof e.text !== 'string') return; const once = {}; sents(e.text).forEach(x => { const k = x.replace(/[「」『』\s]/g, ''); if (k.length >= 15 && isSex(x) && !once[k]) { once[k] = 1; runSeen[k] = (runSeen[k] || 0) + 1; } }); });
        Object.keys(runSeen).forEach(k => { if (runSeen[k] >= 3) hit('S10', runSeen[k] + '回 | ' + k.slice(0, 80)); });
        /* S11：最期の言葉の名前の取り違え */
        const LWR = /([^「」：\s　―]+?)が最期に遺した言葉：「([^」]*)」/g;
        const deadOf = i => (res.heroes && res.heroes[i]) ? !!res.heroes[i].dead : !!(res.chars && res.chars[i] && res.chars[i].alive === false);
        const selfCall = (sp, q) => new RegExp('^[…‥、\\s]*' + sp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '、').test(q);
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || e.text.indexOf('最期に遺した言葉') < 0) return;
          let m; LWR.lastIndex = 0;
          while ((m = LWR.exec(e.text))) {
            const sp = m[1].replace(/^.*?(?=(?:アキラ|ミナト|ユキノ|カオル|ハルカ|レンジ|ソウタ|リコ)$)/, ''), i = nm.indexOf(sp);
            if (i < 0) { hit('S11', '話し手が住人でない「' + sp + '」 | ' + e.text.slice(-120)); continue; }
            if (e.kind === 'death' && e.actors && e.actors[0] !== i) hit('S11', '死の記録の主役は' + nm[e.actors[0]] + 'なのに' + sp + 'の最期の言葉 | ' + e.text.slice(-120));
            else if (e.kind !== 'death' && (!e.actors || e.actors.indexOf(i) < 0)) hit('S11', sp + 'の出ない記録に最期の言葉 | ' + e.text.slice(-120));
            if (!deadOf(i)) hit('S11', '生きている' + sp + 'の最期の言葉 | ' + e.text.slice(-120));
            if (selfCall(sp, m[2])) hit('S11', sp + 'が自分に呼びかけた | ' + m[2]);
          }
        });
        (res.chars || []).forEach((c, i) => { if (c && c.lastWords && (c.lastWords.indexOf(c.name + '「') !== 0 || selfCall(c.name, c.lastWords.slice(c.name.length + 1)))) hit('S11', 'lastWords ' + c.name + ' | ' + c.lastWords); if (c && c.lastWords && c.alive !== false) hit('S11', '生きている' + c.name + 'に lastWords | ' + c.lastWords); });
        if (!scen.solo && HK.Endings) { try { const E = HK.Endings.build(res); (E.last || []).forEach(x => { const c = res.chars[x.i]; if (!c || c.name !== x.name || String(x.text).indexOf(c.name + '「') !== 0) hit('S11', 'E.last ' + x.name + ' | ' + x.text); }); } catch (err) { out.err.push(sc + ' Endings: ' + err.message); } }
        if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(l => { if (typeof l !== 'string') return; let m; LWR.lastIndex = 0; while ((m = LWR.exec(l))) { const i = nm.indexOf(m[1]); if (i < 0 || !deadOf(i) || selfCall(m[1], m[2])) hit('S11', '結末 | ' + l.slice(0, 120)); } });
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || !e.text) return;
          const ss = sents(e.text);
          /* S7：一つの記録の中の同じ文（12文字以上・性的な文） */
          const seen = {};
          ss.forEach(x => { const k = x.replace(/[「」『』\s]/g, ''); if (k.length >= 12 && isSex(x)) { if (seen[k]) hit('S7', k.slice(0, 80) + ' || ' + e.text.slice(0, 120)); seen[k] = 1; } });
          /* S12：同一人物の二人だけの恋愛の記録 */
          if (same && e.cat === 'romance' && Array.isArray(e.actors) && e.actors.length === 2 && e.actors.indexOf(same[0]) >= 0 && e.actors.indexOf(same[1]) >= 0) hit('S12', nm[same[0]] + '×' + nm[same[1]] + ' [romance] | ' + e.text.slice(0, 140));
          ss.forEach(x => {
            if (!isSex(x)) return;
            const inS = nm.map((n0, i) => x.indexOf(n0) >= 0 ? i : -1).filter(i => i >= 0);
            if (!inS.length) return;
            const core = HK.State && HK.State.R18_CORE && HK.State.R18_CORE[sc];
            inS.forEach(i => { if (chars[i].noR18 && mode === 'r18' && !core) hit('S4', nm[i] + ' [' + (e.tag || e.cat || '') + '] | ' + x.slice(0, 140)); });
            for (let a = 0; a < inS.length; a++) for (let b = a + 1; b < inS.length; b++) if (chars[inS[a]].loveNG.indexOf(inS[b]) >= 0 && inS.length === 2) hit('S5', nm[inS[a]] + '×' + nm[inS[b]] + ' | ' + x.slice(0, 140));
            if (same && inS.length === 2 && inS.indexOf(same[0]) >= 0 && inS.indexOf(same[1]) >= 0) hit('S12', nm[same[0]] + '×' + nm[same[1]] + ' | ' + x.slice(0, 140));
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
  }, { N, only, WHY, HOT, mode, ENVSET });
  const ids = Object.keys(r.bySc);
  for (const sc of ids) {
    const b = r.bySc[sc]; const cells = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14'].map(k => k + ' ' + (b[k] || 0));
    console.log(sc.padEnd(10), 'runs', b.runs, cells.join(' '));
  }
  console.log('合計', JSON.stringify(r.n), '止めた', JSON.stringify(r.drop));
  for (const k of Object.keys(r.ex)) if (r.ex[k].length) { console.log('--- ' + k); r.ex[k].forEach(x => console.log('  ' + x)); }
  if (r.err.length) { console.log('--- 例外'); r.err.slice(0, 20).forEach(x => console.log('  ' + x)); }
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
