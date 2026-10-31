/* 展開の不整合の点検（2026-10-31 担当RC。設計と判定の表は docs/reports/2026-10-31/rel-consistency.md）
   利用者の報告：「出られない部屋にて、家族なのに連絡先を交換するとかまだ不整合なシーンが残ってる。知らない人同士、知り合い同士、
   知らない人も知ってる人もいる、のパターンがあるわけで、展開の不整合をチェックしてほしい」
   使い方: node relcons-audit.js <ビルドのディレクトリ> [1配役あたりの回数=24] [r18|safe|''] [箱庭id,…] [--why] [--samples=件数] [--json=出力.json] [--dump=全文の一覧.tsv（回数・箱庭・関係・文（名前は〇）・理由。語の表を増やすときの調べもの用）]
           audit-all.js --extra=relcons でも同じ関数で回る（0 件であるべき点検）
   ・箱庭：出られない部屋・合コン・無人島・ゾンビ・クラスメイト・オメガバース・宇宙船・邪神村・館・人狼・ダンジョンRPG（ビルドに無いものは飛ばす）
   ・配役（各 N 回）：none＝全員関係なし／known＝全員が知り合い（0-1 家族・2-3 恋人か夫婦・4-5 同僚、ほかの組は友人・同級生・幼馴染・先輩後輩を回す）／
       mix＝混在（回ごとに「家族 1 組＋他人」「恋人 1 組＋他人」「同僚 2 組＋他人」を回す）。人数は 2〜6（箱庭の上限・下限の中。mix は 3 人以上）
   ・判定：記録の文を「。」と台詞の切れ目で文に分け、文に出る登場人物の名前（2 人以上ならその組、1 人以下ならその前の二人の文の組、
     それも無ければ出来事の登場人物）と、配役の関係（ties）を照らす。三人以上の文は、全員の組がその判定に当たるときだけ数える。
     関係は class：none（関係なし）／weak（知人）／fam（家族。擬似親子は pfam：恋愛もありうるので newcp には数えない）／spouse（夫婦）／lover（恋人・婚約者・番）／work（同僚・上司・先輩後輩）／
     school（同級生・教師・師弟）／ex（元恋人）／known（そのほか：友人・幼馴染・親友 など）。執着なし（noobs）・運命の番（fated）は関係に数えない（fated は初対面もありうる）
   ・項目（RULES。語の表は箱庭を見ながら足す）：
       first   … 初対面の文（初めまして・初対面・名前も知らない・自己紹介 など）× 関係あり（知人を除く）
       contact … 連絡先・住所を聞く／交換・また会えたら・またどこかで・今度ご飯でも × 関係あり（知人を除く）
       famout  … 他人行儀の文（会釈・どこに住んでいるのか・何の仕事 など）× 家族・夫婦
       known   … 昔からの知り合いの前提の文（久しぶり・卒業以来・昔から・あの頃・子どもの頃・家に帰ったら・また家で など）× 関係なし
       getknow … 初めて知り合う人への質問（子どもの頃の夢・好きな食べ物・どんな人がタイプ など）× 家族・夫婦・恋人
       warmup  … 部屋で初めて打ち解けた前提の文（すっかり打ち解けた・仲間になった気がした・本当の名前を教えた など）× 家族・夫婦・恋人
       newcp   … 部屋で出会って付き合い始めた前提の文（馴れ初め・付き合い始め・改めて待ち合わせ など）× 家族・夫婦・恋人
       lover   … 恋人になる前の文（付き合ってほしい・恋人になって・初めて名前を呼ぶ）× 恋人・夫婦
       home    … 別々の家に帰る文（家まで送る・それぞれの家・上がっていく？・家に帰ったら会えない）× 夫婦
       workq   … 仕事を尋ねる文（どこで働いているのか・何の仕事）× 同僚・上司・先輩後輩
     家族・恋人の恋愛／夜は orient・state で見ているので、ここでは数えない
   ・出られない部屋の結末の試し引き（opt.probe。既定で入）：結末の二人の層（HK.RoomEnd.layerOf）が呼ばれたとき、部屋の全部の組について別の乱数で層を 3 回ずつ引き直して、
     関係のある組に合わない文を同じ項目で数える（例の頭に「結末の試し引き」。実際の回の乱数・記録は変えない） */
'use strict';
const fs = require('fs');
const core = require('./audit/core.js');

/* ---------- パス relcons（ページの中）：opt = { N, only } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 24, only = opt.only || null;
  const SCENS = ['whiteroom', 'goukon', 'island', 'zombie', 'classroom', 'omega', 'ship', 'jashin', 'yakata', 'jinro', 'rpg'].filter(s => HK.SCENARIOS[s] && (!only || only.indexOf(s) >= 0));
  const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
  const FAM = [{ type: 'sibling' }, { type: 'parent' }, { type: 'twin' }, { type: 'relative' }, { type: 'sibclose' }, { type: 'stepsib' }, { type: 'sibprot' }, { type: 'pparent' }];
  const LOV = [{ type: 'lover' }, { type: 'spouse', spouse: true }];
  const OTH = ['friend', 'classmate', 'childhood', 'senpai', 'best', 'colleague'];
  for (const sc of SCENS) {
    const scen = HK.SCENARIOS[sc];
    const lo = Math.max(scen.minCast || 2, 2), hi = Math.min(scen.maxCast || 6, 6);
    for (const cast of ['none', 'known', 'mix']) {
      /* 出られない部屋は主な対象なので 6 倍回し、部屋の条件を回す（既定の「エッチ」だけだと家族の組が外に出ない） */
      const NN = sc === 'whiteroom' ? N * 6 : N;
      for (let s = 0; s < NN; s++) {
        let n = [2, 3, 4, 6, 3, 5][s % 6];
        if (cast === 'mix' && n < 3) n = 3;
        n = Math.max(lo, Math.min(hi, n));
        /* 0-1 と 2-3 は男女（恋人の組が恋愛対象に合うように）。ほかは回す */
        const gen = ['m', 'f', 'f', 'm', (s % 2 ? 'm' : 'f'), (s % 3 ? 'f' : 'm')];
        const chars = [];
        for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: gen[i], calls: {}, loveNG: [] });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        if (sc === 'whiteroom') {
          const K = HK.ROOM_KINDS || {}, CONDS = ['hand', 'h', 'hug', 'kiss', 'love', 'honne', 'praise', 'spicy', 'sake', 'nyan', 'lap', 'roulette', 'aphro', 'tickle', 'water', 'balloon'].filter(k => K[k]);
          env.cond = CONDS[s % CONDS.length]; env.allout = s % 2 ? 'on' : 'off'; env.hours = 24;
        }
        const ties = [];
        const add = (a, b, t) => { if (a < n && b < n) ties.push(Object.assign({ a, b }, t)); };
        if (cast === 'known') {
          add(0, 1, FAM[s % FAM.length]); add(2, 3, LOV[s % 2]); add(4, 5, { type: 'colleague' });
          let k = s;
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (!ties.some(t => (t.a === i && t.b === j))) add(i, j, { type: OTH[(k++) % OTH.length] });
        } else if (cast === 'mix') {
          const v = s % 3;
          if (v === 0) add(0, 1, FAM[(s / 3 | 0) % FAM.length]);
          else if (v === 1) add(0, 1, LOV[(s / 3 | 0) % 2]);
          else { add(0, 1, { type: 'colleague' }); if (n >= 4) add(2, 3, { type: 'colleague' }); }
        }
        yield { sc, s, input: { scenId: sc, seed: 31000 + s * 7 + (cast === 'known' ? 1 : cast === 'mix' ? 2 : 0), env, chars, perChar: chars.map(() => ({ pick: {} })), ties }, meta: { cast, ties: ties.map(t => ({ a: t.a, b: t.b, type: t.type })) } };
      }
    }
  }
};

/* ---------- 判定 relcons（ページの中）：opt = { why, samples } ---------- */
const JUDGE = function (HK, opt) {
  const DUMP = !!opt.dump, WHY = !!opt.why, SAMPLES = opt.samples || (WHY ? 6 : 3);
  const CLS = {
    parent: 'fam', pparent: 'pfam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam',
    spouse: 'spouse', lover: 'lover', fiance: 'lover', mate: 'lover',
    colleague: 'work', boss: 'work', senpai: 'work', classmate: 'school', teacher: 'school', mentor: 'school',
    ex: 'ex', acq: 'weak'
  };
  const SKIP = { noobs: 1, fated: 1 };
  const KNOWN = c => c !== 'none' && c !== 'weak';
  /* 項目：re＝文の語、bad(c)＝その関係の組で出たら不整合、no＝除く語（誤判定よけ） */
  const RULES = {
    first: { re: /初めまして|はじめまして|初対面|見知らぬ(?:誰か|相手|人|者|男|女|二人|同士|どうし|顔|他人)|赤の他人|名前も知らな|名前しか知らな|名前を知っているだけ|名前のほかは|自己紹介し合|名乗り合|互いのことを(?:ほとんど|何も|よく)知らな|知らない(?:人|者)(?:どうし|同士)|会ったばかりの/, bad: KNOWN },
    contact: { re: /連絡先を(?:交換(?!し直)|聞|訊|教え|渡)|連絡先だけ|連絡先(?:が|の)(?:書|入)|住所を(?:聞|訊|教え|交換)|また会えたら|またどこかで|今度ご飯でも|名刺を(?:渡|交換|差し出)/, bad: KNOWN },
    famout: { re: /会釈|他人行儀に|どこに住んで|何の仕事を|お仕事は|ご職業/, bad: c => c === 'fam' || c === 'pfam' || c === 'spouse' },
    known: { re: /久しぶりに会(?!え)|久しぶりだな|久しぶり(?:だね|です|」)|卒業以来|卒業してから|何年ぶり|昔から(?:の知り合い|知って|変わらな|そうだ|こう)|あの頃(?:の二人|みたい)|(?:子ども|子供|幼い|小さい)(?:の)?頃から(?:知って|一緒|の仲|の付き合い|の知り合い|変わらな)|昔みたいに|相変わらず(?:だ|です|な)|家に帰ったら|また家で|うちに帰ったら|同じ家に帰/, bad: c => c === 'none' },
    lover: { re: /付き合って(?:ほしい|ください|くれ|みない|もらえ)|恋人になって(?:ほしい|ください|くれ)|初めて名前を呼/, bad: c => c === 'lover' || c === 'spouse' },
    getknow: { re: /(?:子ども|子供)の頃の夢(?:って|は)|好きな食べ物(?:って|は)何|休みの日は何(?:して|を)|どんな人が(?:タイプ|好み)|どんな人に惹かれ|出身はどこ/, bad: c => c === 'fam' || c === 'pfam' || c === 'spouse' || c === 'lover' },
    warmup: { re: /すっかり打ち解け|打ち解けていた|仲間になった気が|話すほど、相手の考え方|こんな顔で話す人だった|本当の名前を教え|名前を教え合|互いの連絡先を暗記/, bad: c => c === 'fam' || c === 'pfam' || c === 'spouse' || c === 'lover' },
    newcp: { re: /馴れ初め|付き合い始めた(?:という|らしい|って)|付き合うことになっ|二人が付き合い|恋人(?:になった|同士になった|どうしになった)|改めて待ち合わせ|それからも会うようになっ|初めてのデート|条件(?:じゃ|で)なくても、またしたい/, bad: c => c === 'lover' || c === 'spouse' || c === 'fam' },
    home: { re: /家まで送|それぞれの家|別々の家|上がっていく|家に帰ったら会えな|家の前で別れ|うちに来(?:て|い)|うちにいらして|一番近い[^。]{0,8}の部屋|次の約束を口に/, bad: c => c === 'spouse' },
    workq: { re: /どこで働い|何の仕事を|お仕事は|ご職業|職場はどこ/, bad: c => c === 'work' }
  };
  const BIG = /^(?:step|phase|intro)$/;
  const out = { items: {}, ex: {}, sc: {}, cast: {}, runs: 0, err: [], dump: {}, dumpN: 0 };
  Object.keys(RULES).forEach(k => { out.items[k] = 0; out.ex[k] = []; });
  /* 文に分ける（「」の中の。で切らない） */
  const split = t => { const r = []; let cur = '', d = 0; for (const ch of String(t)) { cur += ch; if (ch === '「') d++; else if (ch === '」') d = Math.max(0, d - 1); if ((ch === '。' || ch === '\n') && d === 0) { r.push(cur); cur = ''; } } if (cur) r.push(cur); return r; };
  /* 出られない部屋の結末の試し引き（probe）：結末の二人の層（HK.RoomEnd.layerOf）が呼ばれたとき、部屋にいた全部の組について、
     別の乱数（HK.rng）を持たせた ctx の写しで層を 3 回ずつ引き直し、関係に合わない文を数える（実際の回の乱数・記録は変えない）。
     関係ごとの層は「その二人が一緒に出たら」の文なので、シミュレーションでは出にくい組（家族が二人で出る など）も確かめられる */
  let cur = null;
  const probeOn = opt.probe !== false;
  const RE = HK.RoomEnd;
  if (probeOn && RE && RE.layerOf && !RE.layerOf._rcProbe) {
    const o0 = RE.layerOf;
    const f = function (ctx, x, y, ex) {
      const r = o0.apply(this, arguments);
      if (cur && cur.probe && !ctx._rcProbing) {
        const C = ctx.chars || [];
        for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {
          for (let k = 0; k < 3; k++) {
            const c2 = Object.create(ctx); c2.rng = HK.rng(7919 * (k + 1) + i * 31 + j); c2._rcProbing = true;
            let t = '';
            try { t = o0.call(this, c2, C[i], C[j], ex) || ''; } catch (e) { t = ''; }
            if (t) cur.probe.push({ a: C[i].i, b: C[j].i, t });
          }
        }
      }
      return r;
    };
    f._rcProbe = true; RE.layerOf = f;
  }
  return {
    accept() { return false; },
    begin(run) { cur = { probe: [] }; },
    error(run, e) { out.err.push(run.sc + ' ' + run.meta.cast + '#' + run.s + ' ' + String(e).slice(0, 120)); },
    end(run, res) {
      out.runs++;
      const sc = run.sc, cast = run.meta.cast;
      const S = out.sc[sc] = out.sc[sc] || {}; S[cast] = S[cast] || 0;
      const chars = res.chars || run.input.chars, names = chars.map(c => c.name);
      const rel = {};
      run.meta.ties.forEach(t => { if (SKIP[t.type]) return; const k = Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b), c = CLS[t.type] || 'known'; const o = rel[k]; const P = ['spouse', 'fam', 'pfam', 'lover', 'ex', 'work', 'school', 'known', 'weak']; if (!o || P.indexOf(c) < P.indexOf(o)) rel[k] = c; });
      const clsOf = (a, b) => rel[Math.min(a, b) + '-' + Math.max(a, b)] || 'none';
      (res.log || []).forEach(e => {
        if (!e || !e.text || BIG.test(e.kind || '')) return;
        const ac = [...new Set((e.actors || []).map(x => typeof x === 'number' ? x : x && x.i).filter(x => x != null))];
        let ctxPair = ac.length === 2 ? ac : null;
        split(e.text).forEach(sen => {
          /* 文に出る人（名前の位置の順） */
          const who = []; names.forEach((nm, i) => { if (nm && sen.indexOf(nm) >= 0) who.push(i); });
          let grp;
          if (who.length >= 2) { grp = who; if (who.length === 2) ctxPair = who; }
          else if (ctxPair) grp = ctxPair;
          else grp = ac.length >= 2 ? ac : null;
          if (!grp) return;
          if (DUMP) { const pr0 = []; for (let i = 0; i < grp.length; i++) for (let j = i + 1; j < grp.length; j++) pr0.push(clsOf(grp[i], grp[j])); let sn = sen.replace(/[\n\t]/g, ' '); names.forEach(nm => { sn = sn.split(nm).join('〇'); }); const dk = sc + '\t' + [...new Set(pr0)].sort().join(',') + '\t' + sn; if (out.dump[dk]) out.dump[dk].n++; else if (out.dumpN++ < 200000) out.dump[dk] = { n: 1, why: (e.why || '').slice(0, 40) }; }
          Object.keys(RULES).forEach(k => {
            const R = RULES[k], m = sen.match(R.re);
            if (!m) return;
            const pr = []; for (let i = 0; i < grp.length; i++) for (let j = i + 1; j < grp.length; j++) pr.push(clsOf(grp[i], grp[j]));
            if (!pr.length || !pr.every(c => R.bad(c))) return;
            out.items[k]++; S[cast]++;
            const C = out.cast[sc + '\t' + cast + '\t' + k] = (out.cast[sc + '\t' + cast + '\t' + k] || 0) + 1;
            if (out.ex[k].length < 400) out.ex[k].push(sc + ' ' + cast + '#' + run.s + ' [' + pr.join(',') + '] 「' + m[0] + '」 ' + (e.why || '').slice(0, 50) + ' | ' + sen.replace(/\n/g, ' ').slice(0, 220));
          });
        });
      });
      /* 結末の試し引き：二人の組がはっきりしているので、文ごとに名前を探さずにその組で判定する */
      const seen = {};
      ((cur && cur.probe) || []).forEach(p => {
        const c = clsOf(p.a, p.b);
        if (c === 'none') return;
        split(p.t).forEach(sen => {
          if (DUMP) { let sn = sen.replace(/[\n\t]/g, ' '); names.forEach(nm => { sn = sn.split(nm).join('〇'); }); const dk = sc + '\t' + c + '\t' + sn; if (out.dump[dk]) out.dump[dk].n++; else if (out.dumpN++ < 200000) out.dump[dk] = { n: 1, why: '結末の試し引き' }; }
          Object.keys(RULES).forEach(k => {
            const R = RULES[k], m = sen.match(R.re);
            if (!m || !R.bad(c)) return;
            const key = k + '|' + p.a + '-' + p.b + '|' + sen;
            if (seen[key]) return; seen[key] = 1;
            out.items[k]++; S[cast]++; out.probeN = (out.probeN || 0) + 1;
            if (out.ex[k].length < 400) out.ex[k].push(sc + ' ' + cast + '#' + run.s + ' [' + c + '] 「' + m[0] + '」 （結末の試し引き） | ' + sen.replace(/\n/g, ' ').slice(0, 220));
          });
        });
      });
      cur = null;
    },
    finish() { return out; }
  };
};

/* ---------- 出力 ---------- */
const LABEL = {
  first: '関係のある組に初対面の文（初めまして・名前も知らない など）',
  contact: '関係のある組に連絡先・住所・また会えたら の文',
  famout: '家族・夫婦に他人行儀の文（会釈・どこに住んでいるのか など）',
  known: '関係のない組に昔からの知り合いの前提の文（久しぶり・卒業以来・家に帰ったら など）',
  lover: '恋人・夫婦に恋人になる前の文（付き合ってほしい など）',
  getknow: '家族・夫婦・恋人が、初めて知り合う人への質問をする（子どもの頃の夢・好きな食べ物・どんな人がタイプ など）',
  warmup: '家族・夫婦・恋人が、部屋で初めて打ち解けた前提の文（すっかり打ち解けた・仲間になった気がした・本当の名前を教えた など）',
  newcp: '恋人・夫婦・家族に、部屋で出会って付き合い始めた前提の文（馴れ初め・付き合い始め・改めて待ち合わせ など）',
  home: '夫婦に別々の家に帰る文（家まで送る・上がっていく？ など）',
  workq: '同じ職場の組に仕事を尋ねる文'
};
function print(r, errors, o) {
  const WHY = !!o.why, SAMPLES = o.samples || (WHY ? 400 : 3);
  console.log('== 項目ごと ==');
  Object.keys(r.items).forEach(k => {
    console.log(k.padEnd(8) + String(r.items[k]).padStart(5) + '  ' + LABEL[k]);
    r.ex[k].slice(0, SAMPLES).forEach(x => console.log('    ' + x));
  });
  console.log('== 箱庭・配役ごと（none 関係なし／known 全員知り合い／mix 混在） ==');
  Object.keys(r.sc).forEach(sc => console.log(sc.padEnd(10) + ['none', 'known', 'mix'].map(c => ' ' + c + ' ' + String(r.sc[sc][c] || 0).padStart(4)).join('')));
  const tot = Object.keys(r.items).reduce((s, k) => s + r.items[k], 0);
  console.log('合計 ' + tot + ' 件／' + r.runs + ' 回');
  if (o.json) fs.writeFileSync(o.json, JSON.stringify(r, null, 1));
  if (o.dump) fs.writeFileSync(o.dump, Object.keys(r.dump).map(k => r.dump[k].n + '\t' + k + '\t' + r.dump[k].why).join('\n') + '\n');
  console.log('runs', r.runs, 'err', r.err.length, JSON.stringify(r.err.slice(0, 3)));
  console.log('pageerr', errors.length, JSON.stringify(errors.slice(0, 3)));
}
function summarize(r) {
  const items = {}, ex = {};
  Object.keys(r.items || {}).forEach(k => { items[k] = r.items[k]; ex[k] = (r.ex[k] || []).slice(0, 3); });
  return { items, ex, info: { 回: r.runs || 0 }, err: (r.err || []).length, errEx: (r.err || []).slice(0, 3) };
}
module.exports = { passes: { relcons: PASS }, judges: { relcons: JUDGE }, print, summarize, LABEL };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why');
  const JSONOUT = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7);
  const SAMPLES = +((process.argv.find(a => /^--samples=/.test(a)) || '').slice(10)) || 0;
  const DUMPF = (process.argv.find(a => /^--dump=/.test(a)) || '').slice(7);
  if (!dir) { console.log('使い方: node relcons-audit.js <ビルド> [回数] [r18|safe|\'\'] [箱庭,…] [--why] [--samples=n] [--json=out.json]'); process.exit(1); }
  const t = await core.runTool({ dir, hash: mode, lewdMode: '', mod: module.exports, pass: 'relcons', judge: 'relcons', opt: { N, only, why: WHY, samples: SAMPLES, dump: !!DUMPF } });
  print(t.r, t.errors, { why: WHY, samples: SAMPLES, json: JSONOUT, dump: DUMPF });
  const tot = Object.keys(t.r.items).reduce((s, k) => s + t.r.items[k], 0);
  if (tot || t.r.err.length || t.errors.length) process.exitCode = 1;
})();
