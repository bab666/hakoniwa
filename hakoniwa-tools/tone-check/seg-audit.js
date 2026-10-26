/* 台詞・地の文・引用の区分（seg。js/voice-seg.js）の点検：全箱庭を回して、記録ごとの e.seg を調べる
   使い方: node seg-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=6] [r18|safe|''] [箱庭id,…] [--why] [--json=出力.json]
   A: 推定で決めた話し手（名前「 の形でない l・q）が、その出来事の登場人物（e.actors）に居ず、文のどこにも名前が出てこない（a1）／
      それより前に死の記録が出た人（a2）。登場人物に居ないが文に名前が出ているもの（多くは正しい。登場人物の記録漏れ）は参考の a1w、
      名前「 の形の台詞が登場人物に居ないものは参考の a1n に数える
   B: モブ（住人以外の人物）の台詞を住人の台詞にしている（b1：「……」と村人が言った の形／b2：文の頭の台詞で、前の文に住人の名前がなく、
      その主語が人（〜人・〜師・〜長・村の〜・喋る猫…）か、人のしぐさ・話す動詞で終わる文）
   C: 「」があるのに話し手も区分も決まらなかった（u）
   整合：seg をつなぐと e.text と同じか（join）、HK.fmtLong の改行が seg を使っても同じか（fmt）、隠しの区分（_sq）が残っていないか（sq）。どれも 0 にする
   参考：区分ごとの件数、区分の合わせ方（中身で合った／順番で合った／文から決め直した）
   環境変数 NAMES=ユキノ！,アキラ。,… で住人の名前を変える（名前に記号のある住人の点検）
   --dump=出力.json で、すべての「」（前後の文・区分・話し手）を書き出す（誤りの型を目で見るとき） */
'use strict';
const fs = require('fs');
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 6, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), JS = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7), DUMP = !!(process.argv.find(a => /^--dump=/.test(a)));
  const DUMPF = (process.argv.find(a => /^--dump=/.test(a)) || '').slice(7);
  if (!dir) { console.error('使い方: node seg-audit.js <ビルド> [回数] [r18|safe|\'\'] [箱庭id,…] [--why]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode);
  const NAMES0 = (process.env.NAMES || '').split(',').filter(Boolean);
  const r = await page.evaluate(({ N, only, WHY, DUMP, NAMES0 }) => {
    const HK = window.HK, S = HK.Seg;
    const out = { dump: [], n: { a1n: 0, a1w: 0, a1: 0, a2: 0, b1: 0, b2: 0, c: 0, join: 0, fmt: 0, fmtSeg: 0, sq: 0 }, kinds: {}, ex: { a1: [], a1w: [], a2: [], b1: [], b2: [], c: [], join: [], fmt: [] }, bySc: {}, runs: 0, err: [], quotes: 0 };
    if (!S) { out.err.push('HK.Seg がない'); return out; }
    S.stat.content = S.stat.order = S.stat.redo = 0;
    const lim = WHY ? 60 : 5;
    /* 環境変数 NAMES=ユキノ！,アキラ。,…（6人ぶん）で、名前に記号のある住人でも点検できる */
    const NAMES = NAMES0.length >= 6 ? NAMES0.slice(0, 6) : ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'], tones = HK.TONE_KEYS.slice();
    /* 住人以外の人物を表す語（b の判定。主語がこれで、住人の名前を含まない） */
    const MOBN = /(?:村人|村の|店員|店長|客|男|女|老人|老婆|子ども|子供|少年|少女|医者|医師|看護師|兵士|警官|警備員|司会|係員|教師|先生|生徒|乗客|船員|案内人|使用人|執事|メイド|神主|巫女|住職|村長|長老|婆|爺|主人|女将|マスター|店主|運転手|配達員|管理人|受付|スタッフ|騎士|商人|衛兵|門番|職員|研究員|隊員|監視員|看守|ゴブリン|オーク|魔物|ゾンビ|生存者|略奪者|男たち|女たち|連中|誰か|声|アナウンス|放送|スピーカー|機械|AI|システム|神|邪神|サキュバス|インキュバス|施術師|マッサージ師|整体師|カメラマン|監督|客引き|酔っ払い|サラリーマン|他校|隣の|相手)/;
    const PERS = /(?:人|者|員|師|長|主|客|家|官|士|婆|爺|娘|男|女|猫|さん|様|殿|神|鬼|獣|医|僧|兵|童|衆|の子|マン|ター|スト)$/;
    const ACTV = /(?:言[っいうわえ]|囁[いか]|告げ|訊[いか]|尋ね|答え|呟[いか]|教え|叫[んば]|笑[っいうわ]|怒鳴|命じ|手招き|読み上げ|頷[いか]|撫で|差し出|取り出|振り返|微笑[んみ]|指さ|呼び止め|現れ|近づ|立ちはだか|声をかけ|話しかけ|口を開|頭を下げ)[^。、「」]{0,12}$/;
    const PRON = /^(?:二人|三人|四人|みんな|全員|皆|彼ら|彼女ら|一同|一行|誰も)/;
    const SAYV = /(?:言|囁|告げ|訊|尋ね|答え|呟|続け|促|声をかけ|教え|叫|笑|返|怒鳴|呼びかけ|話しかけ|口を開|切り出|ぼや|つぶや|ささや|唸|頷|微笑|告|宣言|説明|案内|注意|忠告)/;
    const BOUND = /[。！？!?」\n]|――/g;
    const lastBound = s => { let cut = 0, m; BOUND.lastIndex = 0; while ((m = BOUND.exec(s))) cut = m.index + m[0].length; return cut; };
    function rnd(s) { let x = s; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; }
    let ti = 0, cur = '';
    const hit = (k, msg) => { out.n[k]++; out.bySc[cur][k] = (out.bySc[cur][k] || 0) + 1; if (out.ex[k].length < lim) out.ex[k].push(cur + ' | ' + msg); };
    HK.SCEN_ORDER.forEach(id => {
      const sc = HK.SCENARIOS[id]; if (!sc || (only && only.indexOf(id) < 0)) return;
      cur = id; out.bySc[id] = { runs: 0 };
      const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
      for (let s = 0; s < N; s++) {
        const rr = rnd(1000 + s * 77 + id.length), chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: Math.round(rr() * 20), NP: Math.round(rr() * 20), A: Math.round(rr() * 20), FC: Math.round(rr() * 20), AC: Math.round(rr() * 20) }, memo: '', gender: i % 3 === 0 ? 'm' : i % 3 === 1 ? 'f' : '', likes: '', tone: tones[(ti++) % tones.length], fp: '', pos: '', color: '', call: '' });
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
        out.runs++; out.bySc[id].runs++;
        const names = chars.map(c => c.name), dead = {};
        /* 名前に記号（！。？など）のある住人：下の b1・b2 の文の区切りで、名前の中の記号を区切りと見ないよう、置き換えた名前（core.js の HK.NameSafe。長さは同じ）で調べる */
        const NSF = HK.NameSafe, namesE = NSF ? names.map(n => NSF.enc(n)) : names;
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string') return;
          if (e._sq) out.n.sq++;
          const seg = e.seg;
          if (!seg) { if (/「/.test(e.text)) hit('join', 'seg がない | ' + e.text.slice(0, 100)); return; }
          if (S.text(seg) !== e.text) hit('join', e.text.slice(0, 100));
          if (e.text.length >= 140 && HK.fmtLong) {
            const a = HK.fmtLong(e.text, names), b = HK.fmtLong(e.text, names, seg);
            if (seg.blk) out.n.fmtSeg++;
            if (a !== b) hit('fmt', e.text.slice(0, 120));
          }
          const acts = (e.actors || []).map(x => typeof x === 'number' ? x : x && x.i);
          const isDeath = e.kind === 'death' || /^(?:死|最期|弔い|殉)/.test(e.tag || '');
          let off = 0;
          seg.forEach((x, k) => {
            const at = off; off += x.s.length;
            if (x.t === 'n') return;
            out.quotes++; out.kinds[x.t] = (out.kinds[x.t] || 0) + 1;
            const qa = at + (x.nm || 0), qb = at + x.s.length;   /* 「 と 」の次 */
            const show = () => e.text.slice(Math.max(0, qa - 70), qa).replace(/\n/g, '⏎') + '【' + e.text.slice(qa, Math.min(qb, qa + 40)) + (qb - qa > 40 ? '…」' : '') + '】' + e.text.slice(qb, qb + 30).replace(/\n/g, '⏎') + ' ⇒ ' + (x.who >= 0 ? names[x.who] : '（なし）') + ' [' + x.t + ']';
            if (DUMP) out.dump.push({ sc: cur, t: x.t, who: x.who >= 0 ? names[x.who] : null, nm: !!x.nm, pre: e.text.slice(Math.max(0, qa - 120), qa), q: e.text.slice(qa, qb), post: e.text.slice(qb, qb + 40), acts: acts.map(i => names[i]) });
            if (x.t === 'u') { hit('c', show()); return; }
            if (!(x.t === 'l' || x.t === 'q') || !(x.who >= 0)) return;
            /* 登場人物にいない話し手：文のどこにも名前が出てこなければ a1（誤りの疑いが強い）、名前が出ていれば a1w（多くは正しい。登場人物の記録漏れ） */
            if (acts.length && acts.indexOf(x.who) < 0) { if (x.nm) out.n.a1n++; else if (e.text.indexOf(names[x.who]) < 0) hit('a1', show()); else hit('a1w', show()); }
            if (dead[x.who] && !isDeath && !/^(?:memory|grief|mourn|epilogue)$/.test(e.cat || '')) hit('a2', show());
            if (x.nm) return;
            /* b1：「……」と村人が言った */
            const textE = NSF ? NSF.encText(e.text, names) : e.text;
            const after = textE.slice(qb, qb + 40), m1 = after.match(/^(?:と|って)、?([^、。「」\s]{1,14}?)(?:が|は)([^。「」]{0,14})/);
            if (m1 && !namesE.some(nm => m1[1].indexOf(nm) >= 0) && !PRON.test(m1[1]) && MOBN.test(m1[1]) && SAYV.test(m1[2])) hit('b1', show());
            /* b2：前の文の主語が住人以外の人物（同じ文の「 の前に住人の名前がないとき） */
            const pre = textE.slice(0, qa), cut = lastBound(pre), span = pre.slice(cut);
            const aft = textE.slice(qb, qb + 12).replace(/^――/, '');
            /* 「……」――レンジが言うと：すぐあとに住人の名前と話す動詞があれば、その人の台詞（数えない） */
            const said = namesE.some(nm => aft.indexOf(nm) === 0 && /^[はがも][^。「」]{0,6}?(?:言|呟|囁|叫|笑|答え|返|告げ|訊|尋ね)/.test(aft.slice(nm.length)));
            if (!span.trim() && cut > 0 && /。$/.test(pre.slice(0, cut)) && !/^(?:と|って)/.test(aft) && !said) {
              const pv = pre.slice(0, cut - 1), pl = pv.slice(lastBound(pv)), m2 = pl.match(/([^、。「」\s]{1,16}?)(?:たち|ら|達)?(?:は|が|の方から)(?!ら)/);
              const subj = m2 ? m2[1].replace(/^.*[をにでとへ]/, '') : '';
              if (subj && !namesE.some(nm => pl.indexOf(nm) >= 0) && !PRON.test(subj) && !/(?:一人|二人|本人|彼女|彼)$/.test(subj) && (MOBN.test(subj) || PERS.test(subj) || ACTV.test(pl))) hit('b2', show());
            }
          });
          if (e.kind === 'death' && acts.length) dead[acts[0]] = true;
        });
      }
    });
    out.stat = Object.assign({}, S.stat);
    return out;
  }, { N, only, WHY, DUMP, NAMES0 });
  if (DUMPF) fs.writeFileSync(DUMPF, JSON.stringify(r.dump));
  delete r.dump;
  console.log('== seg-audit', dir, mode || '(全年齢版)', '回数', r.runs, '「」', r.quotes, 'ページのエラー', errors.length, errors.slice(0, 2));
  if (r.err.length) console.log('失敗', r.err.length, r.err.slice(0, 3));
  console.log('A 話し手が登場人物にいず文にも名前がない a1:', r.n.a1, '／死んだ人が話す a2:', r.n.a2, '（参考：登場人物にいないが文に名前がある a1w:', r.n.a1w, '・名前「 の形で登場人物にいない a1n:', r.n.a1n, '）');
  console.log('B モブの台詞を住人に b1（と村人が言った）:', r.n.b1, '／b2（前の文の主語がモブ）:', r.n.b2);
  console.log('C 区分が決まらない（u）:', r.n.c);
  console.log('整合 join:', r.n.join, ' fmt:', r.n.fmt, '（seg で改行した長い文', r.n.fmtSeg, '） _sq の残り:', r.n.sq);
  console.log('区分', JSON.stringify(r.kinds), ' 合わせ方', JSON.stringify(r.stat));
  const cols = ['a1', 'a2', 'b1', 'b2', 'c'];
  Object.keys(r.bySc).forEach(sc => { const b = r.bySc[sc]; if (cols.some(k => b[k])) console.log('  ', sc.padEnd(10), cols.map(k => k + ' ' + (b[k] || 0)).join('  ')); });
  Object.keys(r.ex).forEach(k => { if (r.ex[k].length) { console.log('--', k); r.ex[k].forEach(x => console.log('  ' + x)); } });
  if (JS) fs.writeFileSync(JS, JSON.stringify(r));
  await browser.close();
})();
