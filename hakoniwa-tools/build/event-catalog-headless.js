/* 箱庭シミュレーター：出来事の一覧（event-catalog.js）の点検 ― ブラウザ（Playwright）で #all（R18版は #r18&all）を開き、
   箱庭ごとの出来事の山（HK.buildPool）とハプニング（HK.INCIDENTS）の id が、node の vm で数えたものと同じかを確かめる。
   node hakoniwa-tools/build/event-catalog.js <ビルド> --headless（build のあとで。index.html の目録を使って開く）
   違いがあれば箱庭ごとに出して、終了コード 1 */
'use strict';
const path = require('path');
const { openBuild } = require('../tone-check/lib.js');
async function check(dir, made) {
  const full = made.data.build === 'full';
  const { browser, page, errors } = await openBuild(dir, full ? 'r18' : '');
  let bad = 0;
  try {
    const got = await page.evaluate(() => {
      const HK = window.HK, S = HK.SCENARIOS || {}, out = {};
      const base = e => { let x = e; for (let i = 0; i < 6; i++) { const p = Object.getPrototypeOf(x); if (!p || p === Object.prototype || p.id !== x.id) break; x = p; } return x; };
      Object.keys(S).forEach(id => {
        const s = S[id];
        if (!s || s.simulate) return;
        const seen = new Set(), ids = [];
        (HK.buildPool(s) || []).forEach(e0 => { if (!e0 || typeof e0 !== 'object') return; const e = base(e0); if (seen.has(e)) return; seen.add(e); ids.push(String(e.id || '')); });
        ((HK.INCIDENTS || {})[id] || []).forEach(e => { if (e && !seen.has(e)) { seen.add(e); ids.push(String(e.id || '')); } });
        out[id] = ids.sort();
      });
      return out;
    });
    const want = made.raw;
    Object.keys(Object.assign({}, want, got)).sort().forEach(id => {
      const a = (want[id] || []).slice().sort(), b = got[id] || [];
      const miss = a.filter(x => b.indexOf(x) < 0), extra = b.filter(x => a.indexOf(x) < 0);
      if (a.length !== b.length || miss.length || extra.length) {
        bad++;
        console.log('※ ' + id + '：vm ' + a.length + '件・ブラウザ ' + b.length + '件' + (miss.length ? '　vm だけ：' + miss.slice(0, 8).join(',') : '') + (extra.length ? '　ブラウザだけ：' + extra.slice(0, 8).join(',') : ''));
      } else console.log('  ' + id.padEnd(10) + ' ' + a.length + '件 一致');
    });
    if (errors.length) { bad++; console.log('※ ページのエラー ' + errors.length + ' 件：' + errors.slice(0, 3).join(' / ')); }
  } finally { await browser.close(); }
  console.log(path.basename(dir) + '：' + (bad ? '違い ' + bad + ' 件' : 'vm とブラウザの出来事の山は一致'));
  return bad ? 1 : 0;
}
module.exports = { check };
