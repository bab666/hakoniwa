/* 口調チェックの共通部品：Playwright（Chromium）で箱庭のページを開く */
'use strict';
const path = require('path');
function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean);
  for (const t of tries) { try { return require(t); } catch (e) { /* 次を試す */ } }
  throw new Error('playwright が見つかりません。npm i -D playwright するか、PLAYWRIGHT_MODULE にパスを指定してください');
}
/* 分割読み込み（index.html に目録 HK_MANIFEST がある版）では、URL の hash に all を足して全部のかたまりを読ませる
   （#r18 → #r18&all、#safe → #safe&all、無印 → #all）。目録の無い古い index.html は今までどおりの hash で開く
   （古い safe.js は hash === 'safe' しか見ないため）。環境変数 HK_ALL=0 で足さない */
function hasManifest(dir) {
  try { return /HK_MANIFEST\s*=/.test(require('fs').readFileSync(path.join(path.resolve(dir), 'index.html'), 'utf8')); } catch (e) { return false; }
}
function withAll(hash, dir) {
  if (process.env.HK_ALL === '0' || !hasManifest(dir)) return hash || '';
  return hash ? hash + '&all' : 'all';
}
function buildUrl(dir, hash) {
  const h = withAll(hash, dir);
  return 'file://' + path.resolve(dir) + '/index.html' + (h ? '#' + h : '');
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
  await page.goto(buildUrl(dir, hash));
  /* あとで読む分（bundle-late.js／#all なら全部のかたまり）があれば、読み終わるまで待つ */
  await page.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS && window.HK.LATE_READY !== false, null, { timeout: 120000 });
  const lewdMode = process.env.HK_LEWD_MODE || (opts && opts.lewdMode) || '';
  if (lewdMode) await page.evaluate(m => { if (window.HK && window.HK.LewdWords) window.HK.LewdWords.MODE = m === 'none' ? null : m; }, lewdMode);
  return { browser, page, errors };
}
module.exports = { openBuild, loadPlaywright, buildUrl, withAll, hasManifest };
