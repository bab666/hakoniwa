/* 日常の場面キット（js/daily-kit.js の HK.Daily）の点検
   使い方: node daily-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=40] [r18|safe|''] [--why]
   D1 同じ日常の文（名前を伏せて文ごとに比べる）が一回の中で二度出た行の割合（1% 以下であること）
   D2 場所と時間帯の矛盾（その場所に無い時間帯・夜の学校・朝の夜の街・季節外れの海や夏祭り・時間帯に合わない言葉）0 件
   D3 日常の行の置き換え漏れ（{a} {place} {yobi} など）0 件
   D4 家族（きょうだい・親子・親族）の日常の場面が恋愛になった・惹かれを動かした 0 件
   D5 日常の三人以上の場面に、その場にいない人（死んだ・監禁中・不在）が出た 0 件
   対象：クラスメイト・オメガバース・無人島（平穏な日）・出られない部屋（長い閉じ込め）・ふたりの日常。配役は 2〜6 人、関係は恋人・きょうだい（性別の組み合わせ）・親子・親族・同僚・友人を回ごとに */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 40, mode = args[2] || '', WHY = process.argv.includes('--why');
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, WHY }) => {
    const D = HK.Daily;
    const out = { ev: {}, n: { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 }, ex: { D1: [], D2: [], D3: [], D4: [], D5: [] }, lines: 0, per: {}, tag: {}, runs: 0, events: 0 };
    if (!D) { out.n.D3 = 1; out.ex.D3.push('HK.Daily がない'); return out; }
    const FULL = {}; Object.keys(D.PLACES).forEach(g => Object.keys(D.PLACES[g].spots).forEach(k => { FULL[D.PLACES[g].spots[k].full] = g + '.' + k; }));
    const TK = { '朝': 'morning', '昼': 'day', '夕方': 'evening', '夜': 'night' };
    const BAD = {
      morning: /夕飯|夕食|晩ごはん|夕日|終電|深夜|寝る前|おやすみ|夜風|夜空|放課後|残業|始発を待|花火/,
      day: /朝食|朝ごはん|目覚まし|寝坊|夕飯|夕食|夕日|終電|深夜|おやすみ|夜風|夜空|放課後|花火/,
      evening: /朝食|朝ごはん|寝坊|目覚まし|深夜|終電|始発|昼休み|夜空|予鈴/,
      night: /朝食|朝ごはん|寝坊|目覚まし|昼休み|昼ごはん|午後の日差し|朝の光|予鈴|授業|放課後|日差し|日だまり|木漏れ日/
    };
    const PH = /\{[a-z]+\}|undefined|NaN|\[object /;
    const KIN = /^(sibling|sibprot|sibclose|sibbad|parent|pparent|relative|stepsib)$/;
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    function hit(k, sc, s, t) { out.n[k]++; if (out.ex[k].length < (WHY ? 20 : 5)) out.ex[k].push(sc + '#' + s + ' | ' + String(t).slice(0, 240)); }
    const SC = { classroom: {}, omega: {}, island: { days: 15, res: 100, storm: 0 }, whiteroom: { hours: 120 }, futari: {} };
    Object.keys(SC).forEach(sc => {
      const scen = HK.SCENARIOS[sc]; if (!scen) return;
      for (let s = 0; s < N; s++) {
        const n = 2 + (s % 5);
        const G = [['m', 'f'], ['m', 'm'], ['f', 'f'], ['f', 'm'], ['m', 'f'], ['f', 'm']];
        const chars = []; for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: (i < 2 ? G[s % 6][i] : ['m', 'f', 'x', ''][(i + s) % 4]), age: String(20 + ((s + i * 7) % 15)), calls: {}, loveNG: [] });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        Object.assign(env, SC[sc]);
        if (sc === 'whiteroom' && s % 3 === 2) env.hours = 240;
        const K = ['sibling', 'sibclose', 'sibbad', 'parent', 'relative', 'stepsib'][s % 6];
        const T = [[{ a: 0, b: 1, type: 'lover' }], [{ a: 0, b: 1, type: K }], [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: K }], [{ a: 0, b: 1, type: 'friend' }, { a: 1, b: 2, type: 'lover' }], [{ a: 0, b: 1, type: 'colleague' }, { a: 2, b: 3, type: 'lover' }, { a: 1, b: 4, type: K }]][s % 5];
        const ties = T.filter(t => t.a < n && t.b < n);
        let res; try { res = HK.simulate({ scenId: sc, seed: 7300 + s, env, chars, perChar: chars.map(() => ({ pick: {} })), ties }); } catch (e) { hit('D3', sc, s, 'simulate: ' + e.message); continue; }
        out.runs++;
        const kinPair = {}; ties.forEach(t => { if (KIN.test(t.type)) kinPair[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)] = 1; });
        const seen = {}, dead = {}, L = res.log || [];
        const hide = t => { let x = t; chars.forEach(c => { x = x.split(c.name).join('＊'); }); return x; };
        L.forEach(e => {
          if (e && e.kind === 'death') (e.actors || []).forEach(i => { dead[i] = 1; });
          if (!e || !e.text) return;
          out.events++; if (e.kind === 'event') out.ev[sc] = (out.ev[sc] || 0) + 1;
          const m = /^日常（(朝|昼|夕方|夜)・([^）]+)）：/.exec(e.why || '');
          if (!m) return;
          out.lines++; out.per[sc] = (out.per[sc] || 0) + 1;
          const tg = /（日常(?:の三人)?・([^）]+)）$/.exec(e.why || ''); const tk = tg ? (/兄弟|姉妹|姉弟|兄妹|きょうだい/.test(tg[1]) ? 'きょうだい' : tg[1]) : '二人'; out.tag[tk] = (out.tag[tk] || 0) + 1;
          const time = TK[m[1]], spot = FULL[m[2]], S = spot && D.spot(spot), t = e.text;
          /* D1：文ごと（名前を伏せる） */
          const sents = hide(t).split(/(?<=。|」)/).map(x => x.trim()).filter(x => x.length >= 10);
          if (sents.some(x => seen[x])) hit('D1', sc, s, t); sents.forEach(x => { seen[x] = 1; });
          /* D2：場所と時間帯 */
          if (!S) hit('D2', sc, s, '場所が表にない: ' + m[2]);
          else {
            if (!(S.time[time] > 0)) hit('D2', sc, s, m[1] + 'に' + S.label + ': ' + t);
            const mo = /^(\d{1,2})月/.exec(e.label || ''); if (S.months && mo && S.months.indexOf(+mo[1]) < 0) hit('D2', sc, s, mo[1] + '月に' + S.label + ': ' + t);
            if (BAD[time].test(t)) hit('D2', sc, s, m[1] + '「' + t.match(BAD[time])[0] + '」: ' + t);
            if (spot === 'work.school' && time === 'night') hit('D2', sc, s, '夜の学校: ' + t);
            if (spot === 'town.night' && time === 'morning') hit('D2', sc, s, '朝の夜の街: ' + t);
          }
          if (PH.test(t) || PH.test(e.why || '')) hit('D3', sc, s, t.match(PH) ? t.match(PH)[0] + ' ← ' + t : 'why: ' + e.why);
          /* D4：家族の場面 */
          const ac = (e.actors || []).slice(0, 2);
          if (ac.length === 2 && kinPair[Math.min(ac[0], ac[1]) + '-' + Math.max(ac[0], ac[1])] && e.cat === 'romance') hit('D4', sc, s, e.text);
          if (/（日常・(?:義理の)?(?:兄弟|姉妹|姉弟|兄妹|きょうだい|親子|親族)）$/.test(e.why || '') && (e.cat === 'romance' || /頬を赤|見とれ|惹かれ|ときめ|恋/.test(t))) hit('D4', sc, s, e.text);
          /* D5：場にいない人 */
          (e.actors || []).forEach(i => { if (dead[i]) hit('D5', sc, s, chars[i].name + ' ← ' + t); });
        });
      }
    });
    out.events = out.events || 1;
    out.byCat = {}; (HK.MINI.daily || []).forEach(ev => { const m = ev.dm; const k = m.kin ? '家族' : m.love ? '三人以上（恋人が絡む・' + (m.love === 'warm' ? '仲良し' : 'やきもち') + '）' : m.g ? '三人以上' : '二人'; out.byCat[k] = (out.byCat[k] || 0) + 1; });
    out.total = (HK.MINI.daily || []).length;
    return out;
  }, { N, WHY });
  console.log('日常の部品', r.total, JSON.stringify(r.byCat));
  console.log('runs', r.runs, '日常の行', r.lines, '（全体の ' + (r.lines / r.events * 100).toFixed(1) + '%）', JSON.stringify(r.per));
  console.log('箱庭ごとの割合', Object.keys(r.per).map(k => k + ' ' + (r.per[k] / Math.max(1, r.ev[k]) * 100).toFixed(1) + '%').join('、'));
  console.log('種類', JSON.stringify(r.tag));
  const d1 = r.lines ? r.n.D1 / r.lines * 100 : 0;
  console.log('D1 重複 ' + r.n.D1 + '行（' + d1.toFixed(2) + '%）', 'D2 矛盾', r.n.D2, 'D3 置き換え漏れ', r.n.D3, 'D4 家族の恋愛', r.n.D4, 'D5 不在の人', r.n.D5);
  Object.keys(r.ex).forEach(k => { if (r.ex[k].length) { console.log('--- ' + k); r.ex[k].forEach(x => console.log('  ' + x.replace(/\n/g, ' '))); } });
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  const ng = d1 > 1 || r.n.D2 || r.n.D3 || r.n.D4 || r.n.D5 || errors.length || !r.lines;
  console.log(ng ? '結果：NG' : '結果：OK');
  await browser.close();
  process.exitCode = ng ? 1 : 0;
})();
