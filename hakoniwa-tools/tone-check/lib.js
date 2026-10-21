/* 口調チェックの共通部品：Playwright（Chromium）で箱庭のページを開く */
'use strict';
const path = require('path');
function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean);
  for (const t of tries) { try { return require(t); } catch (e) { /* 次を試す */ } }
  throw new Error('playwright が見つかりません。npm i -D playwright するか、PLAYWRIGHT_MODULE にパスを指定してください');
}
async function openBuild(dir, hash) {
  const { chromium } = loadPlaywright();
  const opt = {};
  const exe = process.env.CHROMIUM_PATH || (require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : '');
  if (exe) opt.executablePath = exe;
  const browser = await chromium.launch(opt);
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + path.resolve(dir) + '/index.html' + (hash ? '#' + hash : ''));
  await page.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS);
  return { browser, page, errors };
}
module.exports = { openBuild };
