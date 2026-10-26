/* 口調チェックの共通部品：Playwright（Chromium）で箱庭のページを開く */
'use strict';
const path = require('path');
function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean);
  for (const t of tries) { try { return require(t); } catch (e) { /* 次を試す */ } }
  throw new Error('playwright が見つかりません。npm i -D playwright するか、PLAYWRIGHT_MODULE にパスを指定してください');
}
/* opts.lewdMode：体の語の印（lewd-words.js）を解決する列の切り替え。'direct' ならいつも「直接」の列（点検用。ぼかした語だと取り違えを見逃すため）。
   環境変数 HK_LEWD_MODE でも指定できる（opts より優先） */
async function openBuild(dir, hash, opts) {
  const { chromium } = loadPlaywright();
  const opt = {};
  const exe = process.env.CHROMIUM_PATH || (require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : '');
  if (exe) opt.executablePath = exe;
  const browser = await chromium.launch(opt);
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + path.resolve(dir) + '/index.html' + (hash ? '#' + hash : ''));
  /* あとで読む分（bundle-late.js）があれば、読み終わるまで待つ */
  await page.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS && window.HK.LATE_READY !== false, null, { timeout: 120000 });
  const lewdMode = process.env.HK_LEWD_MODE || (opts && opts.lewdMode) || '';
  if (lewdMode) await page.evaluate(m => { if (window.HK && window.HK.LewdWords) window.HK.LewdWords.MODE = m === 'none' ? null : m; }, lewdMode);
  return { browser, page, errors };
}
module.exports = { openBuild };
