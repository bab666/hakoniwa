/* 不仲の組の交流の点検（2026-10-28 担当MH）：兄弟（不仲）・不仲・敵対・ライバル・仲：険悪（師弟・上司などの cold:'bad'）・家族の仲：不仲（kg:'bad'）の二人が、
   楽しそうに交流しすぎていないかを数える。利用者の声「不仲をつけてても結構楽しそうに交流してしまう」
   使い方: node feud-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=24] [r18|safe|''] [箱庭id,…] [--why] [--ids] [--json=出力.json] [--samples=件数]
   ・箱庭：エンジン型（合コン・クラスメイト・無人島・出られない部屋・オメガバース・ゾンビの街）と物語型（邪神村・吹雪の館・宇宙船・媚薬ロッカー）。ビルドに無い箱庭は飛ばす
   ・配役：6人（箱庭の上限が小さければその人数）。0-1 と 2-3 に不仲の関係（回ごとに種類を回す）、4-5 に友人（比べるための組）。性別・気質は回ごとに回す
   ・数える記録：二人の両方が登場人物にいて、登場人物が3人以下の出来事（4人以上の場面は「同じ場にいるだけ」として数えない）
   ・分類（出来事の id・札・理由・本文の語で機械的に。上から順に当てる）
       不仲らしい … 口論・無視・皮肉・張り合い・昔の恨み・渋々の協力 などの語（FEUD）、または分類が対立・戦い・裏切り（conflict・combat・betray・kill）
       仲良し     … 笑い合う・楽しい・遊ぶ・励ます・気遣う・感謝・打ち明ける などの語（WARM）、または分類が恋愛・絆・助け合い（romance・bond・help）で
                    業務の語（作業・分担・見張り・作戦・調べる など。WORK）がないもの
       恋愛（参考）… 分類が恋愛（romance）か、告白・惹かれ・口づけ・恋人などの語（LOVE）があるもの。ライバル・愛憎の二人の恋は関係の設計どおりなので、
                    仲良しとは分けて数える（比率の分母には入れる）
       中立       … それ以外（業務的な協力・同じ場にいるだけ）
   ・出来事の id：エンジン型は出来事の定義の id（この点検が Ctx.prototype.say を包んで、いま起こしている出来事 ctx._ev の id を記録に写す）。
     id の無い記録（箱庭の進行の出来事・物語型）は「札：理由の頭」を id の代わりにする
   ・目安（2026-10-28）：不仲の組の「仲良し」が 2 割以下、「不仲らしい」が 5 割以上。友人の組の比率は直す前と変わらないこと
   ・最後に、不仲の組で「仲良し」が 2 割を超える箱庭と、仲良しに数えた出来事 id（多い順）を出す。--ids で全箱庭の id の内訳 */
'use strict';
const { openBuild } = require('./lib.js');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), IDS = process.argv.includes('--ids');
  const JSONOUT = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7);
  const SAMPLES = +((process.argv.find(a => /^--samples=/.test(a)) || '').slice(10)) || 0;
  if (!dir) { console.log('使い方: node feud-audit.js <ビルド> [回数] [r18|safe|\'\'] [箱庭,…] [--why] [--ids] [--json=out.json] [--samples=n]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only, WHY, SAMPLES }) => {
    const SCENS = ['goukon', 'classroom', 'island', 'whiteroom', 'omega', 'zombie', 'jashin', 'yakata', 'ship', 'locker'].filter(s => HK.SCENARIOS[s] && (!only || only.indexOf(s) >= 0));
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    /* 不仲の関係の種類（回ごとに回す） */
    const KINDS = [
      { k: 'sibbad', t: { type: 'sibbad' } },
      { k: 'bad', t: { type: 'bad' } },
      { k: 'enemy', t: { type: 'enemy' } },
      { k: 'rival', t: { type: 'rival' } },
      { k: 'cold:bad', t: { type: 'mentor', cold: 'bad' } },
      { k: 'kg:bad', t: { type: 'sibling', kg: 'bad' } }
    ];
    const FEUD = /口論|口喧嘩|言い合|揉め|喧嘩|睨|舌打ち|皮肉|嫌味|いやみ|無視|そっぽ|張り合|負けず嫌い|恨み|根に持|蒸し返|比べられ|贔屓|気に食わ|反りが合わ|反りの合わ|渋々|しぶしぶ|仕方なく|不仲|険悪|苛立|イラ立|ぶつか|衝突|押し付け|爆発|罵|文句|うんざり|鼻で笑|鼻を鳴ら|嫌悪|対立|突っぱね|反発|意地を張|意地っ張|火花|食ってかか|言い返|噛みつ|嫌い|気まず|冷たく|冷ややか|突き放|当てつけ|見下|勘違いす|借りを|敵視|宿敵|因縁|競り合|競争|負けたくな|悔し|恩を着せ|舌を鳴ら|挑発|嘲|毒づ|吐き捨て|そっけな|素っ気な|ぎくしゃく|角が立|口を利か|口をきか|目も合わせ|背を向け|仲は悪|仲が悪|いがみ|顔をしかめ|しかめ面|不機嫌|不満|根比べ|取り合|奪い合|見捨て|見殺し|裏切|敵対|憎|殺意|恨|妬/;
    const WARM = /笑い合|笑った|笑って|笑顔|楽し|はしゃ|一緒に遊|遊ん|仲良|打ち解け|和や|冗談|励ま|慰め|ありがと|感謝|気遣|心配|微笑|助け合|支え合|寄り添|手を取り|応援|祝福|喜び|喜ん|思い出|懐かし|乾杯|ふざけ|盛り上が|息が合|頼もし|安心|ハイタッチ|肩を組|抱き合|分け合|仲間|絆|和解|歩み寄|雪解け|照れ|嬉し|うれし|話が弾|会話が続|並んで話|他愛な|打ち明け|内緒|褒め|譲り合|一緒に(?:遊|笑|食べ|歌|過ご|帰|飲)|ほっと|温か|優しく/;
    const LOVE = /告白|惹かれ|キス|口づけ|両想い|恋人|抱き寄せ|デート|好きだ|好きです|好き」|好き。|発情|番に/;
    const WORK = /作業|分担|役割|見張り|交代|配線|指示|報告|作戦|段取り|手順|調べ|偵察|探索|任せ|判断を/;
    const BIG = /^(?:step|phase|death|climax|end|ending|intro|result)$/;
    const out = { sc: {}, kinds: {}, ids: {}, friend: {}, samples: [], err: [], runs: 0 };
    KINDS.forEach(x => { out.kinds[x.k] = { feud: 0, neu: 0, warm: 0, love: 0 }; });
    /* エンジン型：記録に出来事の id を写す（点検のページの中だけ） */
    if (HK.Ctx && !HK.Ctx.prototype.say._fdA) {
      const s0 = HK.Ctx.prototype.say;
      const f = function (o) { const e = s0.apply(this, arguments); if (e && !e.skipped && this._ev && this._ev.id && e === this.log[this.log.length - 1]) e.eid = this._ev.id; return e; };
      f._fdA = true; HK.Ctx.prototype.say = f;
    }
    const clsOf = (e, idk) => {
      const s = (e.why || '') + '｜' + (e.tag || '') + '｜' + idk + '｜' + String(e.text || '');
      if (FEUD.test(s) || /^(?:conflict|combat|betray|kill)$/.test(e.cat || '')) return 'feud';
      if (e.cat === 'romance' || LOVE.test(s)) return 'love';
      if (WARM.test(s) || (/^(?:bond|help)$/.test(e.cat || '') && !WORK.test(s))) return 'warm';
      return 'neu';
    };
    const idOf = e => e.eid || ((e.tag ? e.tag + '：' : '') + String(e.why || '').replace(/^[^：]{1,14}と[^：]{1,14}：/, '').split(/[（。、(]/)[0].slice(0, 16)) || '?';
    SCENS.forEach(sc => {
      const scen = HK.SCENARIOS[sc];
      const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, 6));
      const o = out.sc[sc] = { feud: 0, neu: 0, warm: 0, love: 0, fr: { feud: 0, neu: 0, warm: 0, love: 0 }, runs: 0 };
      for (let s = 0; s < N; s++) {
        const chars = [];
        for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: ['m', 'f', 'f', 'm', 'm', 'f'][(i + s) % 6], calls: {}, loveNG: [] });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        const K1 = KINDS[s % KINDS.length], K2 = KINDS[(s + 3) % KINDS.length];
        const ties = [Object.assign({ a: 0, b: 1 }, K1.t)];
        const pairs = [{ a: 0, b: 1, k: K1.k }];
        if (n >= 4) { ties.push(Object.assign({ a: 2, b: 3 }, K2.t)); pairs.push({ a: 2, b: 3, k: K2.k }); }
        if (n >= 6) { ties.push({ a: 4, b: 5, type: 'friend' }); pairs.push({ a: 4, b: 5, k: 'friend' }); }
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 4100 + s, env, chars, perChar: chars.map(() => ({ pick: {} })), ties }); } catch (e) { out.err.push(sc + ' ' + s + ' ' + String(e).slice(0, 120)); continue; }
        o.runs++; out.runs++;
        (res.log || []).forEach(e => {
          if (!e || !e.text || BIG.test(e.kind || '') || e.key) return;
          const ac = [...new Set((e.actors || []).map(x => typeof x === 'number' ? x : x && x.i).filter(x => x != null))];
          if (ac.length < 2 || ac.length > 3) return;
          pairs.forEach(p => {
            if (ac.indexOf(p.a) < 0 || ac.indexOf(p.b) < 0) return;
            const idk = idOf(e), c = clsOf(e, idk);
            if (p.k === 'friend') { o.fr[c]++; const F = out.friend[sc] = out.friend[sc] || {}; return; }
            o[c]++; out.kinds[p.k][c]++;
            const I = out.ids[sc + '\t' + idk] = out.ids[sc + '\t' + idk] || { feud: 0, neu: 0, warm: 0, love: 0, ex: [], kinds: {} };
            if (c === 'warm') I.kinds[p.k] = (I.kinds[p.k] || 0) + 1;
            I[c]++;
            if ((WHY || SAMPLES) && I.ex.length < Math.max(2, SAMPLES)) I.ex.push(p.k + ' ' + c + ' | ' + String(e.why || '').slice(0, 60) + ' | ' + String(e.text).replace(/\n/g, ' ').slice(0, 260));
          });
        });
      }
    });
    return out;
  }, { N, only, WHY, SAMPLES });
  const pct = (x, t) => t ? (x / t * 100).toFixed(0) + '%' : '-';
  const K4 = ['feud', 'neu', 'warm', 'love'], NM = { feud: '不仲らしい', neu: '中立', warm: '仲良し', love: '恋愛' };
  const tt = o => K4.reduce((s, k) => s + (o[k] || 0), 0);
  const row = (name, o) => { const t = tt(o); return name.padEnd(12) + K4.map(k => ' ' + NM[k] + ' ' + String(o[k] || 0).padStart(4) + ' (' + pct(o[k] || 0, t).padStart(4) + ')').join(' '); };
  console.log('== 不仲の組（箱庭ごと） ==');
  const T = {}, TF = {}, over = [];
  K4.forEach(k => { T[k] = 0; TF[k] = 0; });
  Object.keys(r.sc).forEach(sc => {
    const o = r.sc[sc]; K4.forEach(k => { T[k] += o[k] || 0; TF[k] += o.fr[k] || 0; });
    console.log(row(sc, o));
    const t = tt(o); if (t && o.warm / t > 0.2) over.push(sc);
  });
  console.log(row('合計', T));
  console.log('== 不仲の組（関係の種類ごと） ==');
  Object.keys(r.kinds).forEach(k => console.log(row(k, r.kinds[k])));
  console.log('== 友人の組（比べるため） ==');
  Object.keys(r.sc).forEach(sc => { const o = r.sc[sc].fr; if (tt(o)) console.log(row(sc, o)); });
  console.log(row('合計', TF));
  const ids = Object.keys(r.ids).map(k => Object.assign({ k }, r.ids[k]));
  const tot = tt(T);
  console.log('== 判定 ==');
  console.log('不仲の組の仲良し ' + pct(T.warm, tot) + '（目安 20% 以下）／不仲らしい ' + pct(T.feud, tot) + '（目安 50% 以上）／恋愛（参考）' + pct(T.love, tot) + (tot && T.warm / tot <= 0.2 && T.feud / tot >= 0.5 ? ' … OK' : ' … 目安に届かない'));
  console.log('仲良しが 2 割を超える箱庭：' + (over.length ? over.join('・') : 'なし'));
  over.concat(IDS ? Object.keys(r.sc).filter(s => over.indexOf(s) < 0) : []).forEach(sc => {
    const l = ids.filter(x => x.k.split('\t')[0] === sc && x.warm > 0).sort((a, b) => b.warm - a.warm).slice(0, IDS ? 40 : 12);
    console.log('  [' + sc + '] 仲良しに数えた出来事：' + l.map(x => x.k.split('\t')[1] + '×' + x.warm + '/' + tt(x) + '（' + Object.keys(x.kinds).map(k => k + ' ' + x.kinds[k]).join('・') + '）').join('、'));
  });
  const hot = ids.filter(x => tt(x) >= 3 && x.warm / tt(x) > 0.2).sort((a, b) => b.warm - a.warm);
  console.log('仲良しの比率が 2 割を超える出来事 id（3 回以上）：' + hot.length + ' 件');
  hot.slice(0, IDS ? 200 : 30).forEach(x => console.log('  ' + x.k.replace('\t', ' ') + '  仲良し ' + x.warm + '/' + tt(x)));
  if (WHY) ids.forEach(x => x.ex.forEach(s => console.log('    ' + x.k.replace('\t', ' ') + ' :: ' + s)));
  if (JSONOUT) fs.writeFileSync(JSONOUT, JSON.stringify(r, null, 1));
  console.log('runs', r.runs, 'err', r.err.length, JSON.stringify(r.err.slice(0, 3)));
  console.log('pageerr', errors.length, JSON.stringify(errors.slice(0, 3)));
  await browser.close();
})();
