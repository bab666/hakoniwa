/* 箱庭シミュレーター: 箱庭タブの見た目（2026-11-01 担当UB。参考デザインの見本 05〜08「登録しやすく」。全年齢版・R18版共通。ui.js の前に読む）
   ui.js の renderBox が描く箱庭タブの部品に、ここから <style> を差す（index.html には書かない。ui-ties.js と同じ作り）。
   ・上：選んだ箱庭のカード（.bxsel。分類・人数、題名、説明、札、効く気質。右に「箱庭を変える」「この箱庭のTIPS」「出来事の一覧」）
   ・「箱庭を選ぶ」の窓（.bxpick。絞りの札・「いまの住人で遊べるものだけ」・カードの一覧・右に選んでいる箱庭の説明・足に R18 版の案内）
   ・切替（.bxtabs：参加者と初動／場の設定／起こりやすさ／展開と内容。#view-box の data-bxtab で見せる節を選ぶ）と、各節（.bxpanel）
   ・下に固定の帯（.runbar.bxrun：要約・読み込み待ち・シード・「▶ 箱庭を動かす」）
   色・角丸・影は土台の変数 --ui-*（index.html。担当UA）を使い、無いときは今のテーマの変数（--paper・--ink など）か見本の値に戻る。
   スマホ（幅 600px 以下）は見本 08：カードを小さく、切替を横スクロール、設定は 1 列、下に固定の「▶ 箱庭を動かす」。
   画面だけの部品で、箱庭の結果には効かない。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var V = '#view-box';
  var css =
    /* ---------- 変数（--ui-* が無いときは今のテーマの変数・見本の値） ---------- */
    V + '{--bx-card:var(--ui-card,var(--paper,#fff));--bx-ink:var(--ui-ink,var(--ink,#17202b));--bx-mu:var(--ui-muted,var(--muted,#5b6672));' +
      '--bx-line:var(--ui-line,var(--line,#dde2e7));--bx-line2:var(--ui-line,var(--line2,#cfd6dd));--bx-soft:var(--ui-soft,var(--bg1,#f1f3f5));' +
      '--bx-acc:var(--ui-accent,var(--accent,#1d4f7a));--bx-pr:var(--ui-primary,var(--ink,#1b2a3d));--bx-pri:var(--ui-primary-ink,var(--paper,#fff));' +
      '--bx-r:var(--ui-radius,14px);--bx-rs:var(--ui-radius-s,8px);--bx-sh:var(--ui-shadow,0 1px 2px rgba(0,0,0,.12));--bx-shd:var(--ui-shadow-dlg,0 8px 24px rgba(23,32,43,.16));' +
      '--bx-warn:#b03a2e}' +
    V + ':not([hidden]){display:flex;flex-direction:column;gap:16px}' + V + '>*{min-width:0}' +
    V + ' .bxmu{color:var(--bx-mu)}' + V + ' .bxsp{flex:1 1 auto}' +
    V + ' .bxwarnt{color:var(--bx-warn);font-size:12px;margin-left:8px}' +
    V + ' .bxbtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;margin:0;padding:0 12px;border:1px solid var(--bx-line2);border-radius:var(--bx-rs);background:var(--bx-card);color:var(--bx-ink);font:inherit;font-size:13px;line-height:1.2;cursor:pointer;white-space:nowrap;box-sizing:border-box}' +
    V + ' .bxbtn:hover{border-color:var(--bx-ink)}' + V + ' .bxbtn:focus-visible{outline:2px solid var(--bx-acc);outline-offset:2px}' +
    V + ' .bxsr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +

    /* ---------- 1. 選んだ箱庭のカード（見本 05 の上） ---------- */
    V + ' .bxsel{display:flex;flex-wrap:wrap;gap:16px 20px;padding:20px 24px;background:var(--bx-card);border:1px solid var(--bx-line);border-radius:var(--bx-r);box-shadow:var(--bx-sh)}' +
    V + ' .bxsel-m{flex:999 1 480px;min-width:0}' +
    V + ' .bxk{display:flex;flex-wrap:wrap;gap:0 .5em;font-size:12px;color:var(--bx-mu);letter-spacing:.06em}' +
    V + ' .bxk>span:not(:empty)+span:not(:empty)::before{content:"・";margin-right:.5em}' +
    V + ' .bxsel-n{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:2px 0 4px;font-size:26px;line-height:1.3;letter-spacing:.04em;font-weight:700;color:var(--bx-ink)}' +
    V + ' .bxsel-n .r18tag,' + V + ' .bxpick-s h3 .r18tag{font-size:11px;padding:0 5px;letter-spacing:.04em}' +
    V + ' .bxsel-d{margin:0;color:var(--bx-ink);opacity:.86;font-size:14px;line-height:1.7}' +
    V + ' .bxsel .note{font-size:12px;color:var(--bx-mu);margin-top:4px}' +
    V + ' .bxsel .tags,' + V + ' .bxpick-s .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}' +
    V + ' .bxsel .ftag,' + V + ' .bxpick-s .ftag{display:inline-block;max-width:100%;padding:2px 10px;border:1px solid transparent;border-radius:12px;background:var(--bx-soft);font-size:12px;line-height:1.6;color:var(--bx-ink);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    V + ' .bxsel .ftag.warn,' + V + ' .bxpick-s .ftag.warn{border-color:var(--bx-mu);border-style:dashed;background:transparent}' +
    V + ' .bxsel .ftag:hover,' + V + ' .bxpick-s .ftag:hover,' + V + ' .bxsel .ftag:focus-visible{border-color:var(--bx-ink);outline:none}' +
    V + ' .bxsel .ftmore,' + V + ' .bxpick-s .ftmore{display:none}' +
    V + ' .bxuses{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;margin-top:12px;padding-top:12px;border-top:1px solid var(--bx-line);font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxuses-h{display:inline-flex;align-items:center;gap:2px;font-weight:700;color:var(--bx-ink)}' +
    V + ' .bxuses .bxu{cursor:help}' + V + ' .bxuses .src{font-family:var(--f-num,ui-monospace,Menlo,Consolas,monospace);margin-left:3px}' +
    V + ' .bxsel-a{flex:1 1 200px;max-width:280px;display:flex;flex-direction:column;gap:8px}' +
    V + ' .bxsel-a .bxbtn,' + V + ' .bxsel-a .tipscen{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:40px;margin:0;padding:0 12px;border:1px solid var(--bx-line2);border-radius:var(--bx-rs);background:var(--bx-card);color:var(--bx-ink);font:inherit;font-size:13px;box-sizing:border-box;cursor:pointer}' +
    V + ' .bxsel-a .bxchg{height:44px;border-color:var(--bx-acc);color:var(--bx-acc);font-weight:700;font-size:14px}' +
    V + ' .bxsel-a .bxchg:hover{background:var(--bx-soft)}' +
    V + ' .bxsel-a .tipscen:hover,' + V + ' .bxsel-a .tipscen:focus-visible{border-color:var(--bx-ink);color:var(--bx-ink)}' +
    V + ' .bxsel .scload{position:static;display:inline-block;font-size:11px;font-weight:400;letter-spacing:.04em;padding:0 8px;border:1px solid var(--bx-line2);border-radius:999px;color:var(--bx-mu);background:var(--bx-soft)}' +
    V + ' .bxsel .scload.ng{color:var(--bx-warn);border-style:dashed}' + V + ' .bxsel .scload.ng button{font:inherit;color:inherit;background:none;border:0;padding:0 0 0 4px;text-decoration:underline;cursor:pointer}' +

    /* ---------- 2. 箱庭を選ぶ（窓。見本 06） ---------- */
    V + ' .bxpick{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px;box-sizing:border-box}' +
    V + ' .bxpick[hidden]{display:none}' +
    ':root.bx-modal:has(' + V + ':not([hidden]) .bxpick:not([hidden])){overflow:hidden}' +
    V + ' .bxpick-bg{position:absolute;inset:0;background:rgba(23,32,43,.55)}' +
    V + ' .bxpick-dlg{position:relative;display:flex;flex-direction:column;width:100%;max-width:1120px;max-height:calc(100vh - 64px);max-height:calc(100dvh - 64px);background:var(--bx-card);color:var(--bx-ink);border-radius:var(--bx-r);box-shadow:0 20px 60px rgba(0,0,0,.3),var(--bx-shd);overflow:hidden}' +
    V + ' .bxpick-h{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:16px 20px;border-bottom:1px solid var(--bx-line)}' +
    V + ' .bxpick-h>.bxmu{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    V + ' .bxpick-h h2{margin:0;font-size:18px;font-weight:700;letter-spacing:.04em}' + V + ' .bxpick-h .bxmu{font-size:13px}' +
    V + ' .bxx{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:0;border-radius:var(--bx-rs);background:var(--bx-soft);color:var(--bx-ink);font-size:20px;line-height:1;cursor:pointer}' +
    V + ' .bxx:hover{background:var(--bx-line)}' +
    V + ' .bxpick-b{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 340px;grid-template-rows:auto minmax(0,1fr)}' +
    V + ' .bxpick-l{display:contents}' +
    V + ' .bxpick .scfilt{grid-column:1;grid-row:1;display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:12px 20px;border-bottom:1px solid var(--bx-line)}' +
    V + ' .bxpick .scfilt .chip{height:36px;min-height:0;padding:0 14px;border:1px solid var(--bx-line2);border-radius:18px;background:var(--bx-card);color:var(--bx-ink);font-size:13px}' +
    V + ' .bxpick .scfilt .chip[aria-pressed="true"]{border-color:var(--bx-pr);background:var(--bx-pr);color:var(--bx-pri);font-weight:700}' +
    V + ' .bxfit{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 20px;border-bottom:1px solid var(--bx-line);font-size:13px;color:var(--bx-ink);cursor:pointer}' +
    V + ' .bxfit[hidden]{display:flex;visibility:hidden}' +
    V + ' .bxfit input{width:18px;height:18px;margin:0;accent-color:var(--bx-pr)}' +
    V + ' .bxpick .scens{grid-column:1;grid-row:2;min-height:0;overflow:auto;padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;align-content:start;overscroll-behavior:contain}' +
    V + ' .bxpick .scens>.bxfitoff{display:none!important}' +
    V + ' .bxpick .scen{min-height:72px;padding:10px 12px;gap:2px;border-radius:10px;border-color:var(--bx-line)}' +
    V + ' .bxpick .scen .d,' + V + ' .bxpick .scen .dl,' + V + ' .bxpick .scen .note,' + V + ' .bxpick .scen .tipscen,' + V + ' .bxpick .scen .ftag:not(.warn),' + V + ' .bxpick .scen .ftmore{display:none!important}' +
    V + ' .bxpick .scen .tags{display:flex;flex-wrap:wrap;margin-top:2px;padding:0;overflow:visible}' +
    V + ' .bxpick .scen .ftag.warn{display:inline-block!important;height:auto;padding:0;border:0;background:none;font-size:11px;line-height:1.5;color:var(--bx-mu)}' +
    V + ' .bxpick .scen .n{font-size:15px}' +
    V + ' .bxpick .scen.on:not(.pv){box-shadow:none;border-color:var(--bx-line);background:var(--bx-card)}' +
    V + ' .bxpick .scen.adult.on:not(.pv){background:var(--adult-bg,var(--bx-card));border-color:var(--adult-line,var(--bx-line))}' +
    V + ' .bxpick .scen.r18only.on:not(.pv){background:var(--r18only-bg,var(--bx-card));border-color:var(--r18only-line,var(--bx-line))}' +
    V + ' .bxpick .scen.pv{border-color:var(--bx-pr);box-shadow:inset 0 0 0 1px var(--bx-pr);background:var(--bx-soft)}' +
    V + ' .bxpick .scen.on::after{content:"いまの箱庭";position:absolute;top:-8px;left:10px;padding:0 6px;border-radius:4px;background:var(--bx-pr);color:var(--bx-pri);font-size:10px;line-height:16px;letter-spacing:.04em}' +
    V + ' .bxpick .scen .bxwarn{display:block;font-size:11px;line-height:1.5;color:var(--bx-warn)}' + V + ' .bxpick .scen .bxwarn:empty{display:none}' +
    V + ' .scen .bxwarn{display:none}' +
    V + ' .bxpick-s{grid-column:2;grid-row:2;min-height:0;overflow:auto;padding:20px;box-sizing:border-box;background:var(--bx-soft);border-left:1px solid var(--bx-line);display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}' +
    V + ' .bxpick-s h3{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0;font-size:22px;line-height:1.3}' +
    V + ' .bxpick-s p{margin:0}' + V + ' .bxpick-s .bxside-d{color:var(--bx-ink);opacity:.86;line-height:1.7}' +
    V + ' .bxpick-s .tags{margin-top:0}' + V + ' .bxpick-s .ftag{background:var(--bx-card)}' + V + ' .bxpick-s .note{font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxside-b{display:flex;flex-wrap:wrap;gap:8px}' +
    V + ' .bxside-b .tipscen{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:6px;height:40px;margin:0;padding:0 10px;border:1px solid var(--bx-line2);border-radius:var(--bx-rs);background:var(--bx-card);color:var(--bx-ink);font:inherit;font-size:13px;white-space:nowrap;cursor:pointer}' +
    V + ' .bxside-b .tipscen:hover{border-color:var(--bx-ink)}' +
    V + ' .bxgo{height:48px;border:0;border-radius:10px;background:var(--bx-pr);color:var(--bx-pri);font:inherit;font-size:15px;font-weight:700;cursor:pointer}' +
    V + ' .bxgo:hover{filter:brightness(1.12)}' + V + ' .bxgo:focus-visible{outline:2px solid var(--bx-acc);outline-offset:2px}' +
    V + ' .bxpick-s .bxcur{font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxpick-f{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;padding:12px 20px;border-top:1px solid var(--bx-line);font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxpick-f:empty{display:none}' +
    V + ' .bxpick-f a{color:var(--bx-acc);font-weight:700}' + V + ' .bxpick-f .prefrow{margin:0}' +

    /* ---------- 3. 切替と各節 ---------- */
    V + ' .bxtabs{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}' +
    V + ' .bxtl{display:flex;flex-wrap:wrap;padding:3px;background:var(--bx-line);background:color-mix(in srgb,var(--bx-ink) 9%,var(--bx-card));border-radius:10px}' +
    V + ' .bxtl button{display:inline-flex;align-items:center;gap:4px;height:38px;padding:0 16px;border:0;border-radius:var(--bx-rs);background:none;color:var(--bx-mu);font:inherit;font-size:14px;cursor:pointer;white-space:nowrap}' +
    V + ' .bxtl button:hover{color:var(--bx-ink)}' +
    V + ' .bxtl button[aria-selected="true"]{background:var(--bx-card);box-shadow:var(--bx-sh);font-weight:700;color:var(--bx-ink)}' +
    V + ' .bxtl button:focus-visible{outline:2px solid var(--bx-acc);outline-offset:1px}' +
    V + ' .bxtn{font-size:12px;font-weight:400;color:var(--bx-mu);font-family:var(--f-num,inherit)}' +
    V + ' .bxdot{display:inline-block;width:6px;height:6px;margin-left:2px;border-radius:50%;background:var(--bx-acc)}' + V + ' .bxdot[hidden]{display:none}' +
    V + ' .bxtabs-a{display:flex;gap:8px}' +
    V + '[data-bxtab="join"] .bxtabs-a{display:none}' +
    V + ' .bxpanel{display:none}' +
    V + '[data-bxtab="join"] .bxpanel[data-bxp="join"],' + V + '[data-bxtab="scen"] .bxpanel[data-bxp="scen"],' + V + '[data-bxtab="odds"] .bxpanel[data-bxp="odds"],' + V + '[data-bxtab="plot"] .bxpanel[data-bxp="plot"]{display:block}' +
    V + ' .bxenv{padding:4px 24px 12px;background:var(--bx-card);border:1px solid var(--bx-line);border-radius:var(--bx-r)}' +
    V + ' .bxlead{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:12px 0 4px;font-size:13px;color:var(--bx-mu)}' +
    V + ' .bxenv .roomlabel{margin:12px 0 0}' +
    V + ' .bxenv .envgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:40px;row-gap:0}' +
    V + ' .bxenv .envitem{min-width:0;padding:16px 0;border-bottom:1px solid var(--bx-line)}' +
    V + ' .bxenv .envitem .lab{font-size:14px}' +
    V + ' .bxenv .envitem .lab .num{font-family:var(--f-num,ui-monospace,Menlo,Consolas,monospace);font-weight:400;color:var(--bx-mu)}' +
    V + ' .bxenv .envitem.chg .lab .num{font-weight:700;color:var(--bx-ink)}' +
    V + ' .bxenv .envitem.chg .labt::after{content:"変更";margin-left:6px;padding:0 6px;border-radius:4px;background:var(--bx-soft);color:var(--bx-acc);font-size:10.5px;font-weight:700;line-height:18px;letter-spacing:.04em}' +
    V + ' .bxenv .envitem input[type="range"]{margin:8px 0 2px;accent-color:var(--bx-mu)}' +
    V + ' .bxenv .envitem.chg input[type="range"]{accent-color:var(--bx-pr)}' +
    V + ' .bxenv .envitem .ends{font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxenv .envitem select{color:var(--bx-mu)}' + V + ' .bxenv .envitem.chg select{color:var(--bx-ink);border-color:var(--bx-ink);font-weight:600}' +
    V + ' .bxenv .envitem input[type="text"]{border-radius:var(--bx-rs)}' +
    V + ' .bxsegs{display:grid;grid-auto-columns:minmax(0,1fr);grid-auto-flow:column;margin-top:8px;border:1px solid var(--bx-line2);border-radius:var(--bx-rs);overflow:hidden}' +
    V + ' .bxsegs button{min-width:0;min-height:40px;padding:4px 6px;border:0;border-left:1px solid var(--bx-line2);background:var(--bx-card);color:var(--bx-ink);font:inherit;font-size:13px;line-height:1.3;cursor:pointer;overflow:hidden;overflow-wrap:anywhere}' +
    V + ' .bxsegs button:first-child{border-left:0}' + V + ' .bxsegs button:hover{background:var(--bx-soft)}' +
    V + ' .bxsegs button:disabled{opacity:.45;cursor:default}' +
    V + ' .bxsegs button[aria-pressed="true"]{background:var(--bx-soft);background:color-mix(in srgb,var(--bx-ink) 12%,var(--bx-card));font-weight:700}' +
    V + ' .envitem.chg .bxsegs button[aria-pressed="true"]{background:var(--bx-pr);color:var(--bx-pri)}' +
    V + ' .bxsegs button:focus-visible{outline:2px solid var(--bx-acc);outline-offset:-2px}' +
    V + ' .bxsegd{margin-top:4px;font-size:12px;color:var(--bx-mu)}' + V + ' .bxsegd:empty{display:none}' +
    V + ' .bxenv .ctbox label{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;padding:4px 0}' +
    /* 箱庭の注意書き（出られない部屋・媚薬ロッカー・催眠・恋人の多い人）はカードの形 */
    V + ' #trio-note,' + V + ' #locker-note,' + V + ' #saimin-note,' + V + ' #noexit-note{margin:12px 0 0}' +
    V + ' #trio-note>.desc,' + V + ' #locker-note>.desc,' + V + ' #saimin-note>.desc,' + V + ' #noexit-note>.desc,' + V + ' #lovewarn{margin:0 0 8px;padding:10px 14px;border:1px solid var(--bx-line);border-radius:10px;background:var(--bx-soft);font-size:12.5px;line-height:1.7}' +
    V + ' .ngband{border-radius:10px}' +
    /* 参加者と初動（見本 07） */
    V + ' .bxjbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px}' +
    V + ' .bxjc{display:inline-flex;align-items:center;gap:6px;font-size:14px}' + V + ' .bxjc b{font-weight:700}' +
    V + ' .bxjbar .bxbtn{height:38px}' +
    V + ' .bxrand{display:inline-flex;align-items:center;max-width:100%;border:1px solid var(--bx-line2);border-radius:var(--bx-rs);background:var(--bx-card);overflow:hidden}' +
    V + ' .bxrand .bxrandl{display:flex;align-items:center;gap:4px;padding:0 4px 0 12px;font-size:13px;color:var(--bx-ink);white-space:nowrap}' +
    V + ' .bxrand input[type="number"]{width:48px;height:36px;min-height:0;padding:0;border:0;border-radius:0;text-align:center;background:transparent}' +
    V + ' .bxrand select{height:36px;min-height:0;max-width:11em;border:0;border-radius:0;background-color:transparent;font-size:13px}' +
    V + ' .bxrand button{height:38px;padding:0 12px;border:0;border-left:1px solid var(--bx-line2);background:var(--bx-soft);color:var(--bx-ink);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}' +
    V + ' .bxrand button:disabled{opacity:.45;cursor:default}' +
    V + ' .bxjoin .grpjoin{margin:0 0 12px}' +
    V + ' .bxjoin .tblwrap{border:1px solid var(--bx-line);border-radius:12px;background:var(--bx-card)}' +
    V + ' .bxjoin table.per thead th{background:var(--bx-soft);font-family:inherit;font-size:12px;letter-spacing:0;color:var(--bx-mu)}' +
    V + ' .bxjoin table.per thead tr.bxbulk td{position:static;background:var(--bx-soft);border-bottom:1px solid var(--bx-line);padding:4px 8px 8px}' +
    V + ' .bxjoin table.per thead tr.bxbulk td:nth-child(1),' + V + ' .bxjoin table.per thead tr.bxbulk td:nth-child(2){position:sticky;z-index:2}' +
    V + ' .bxjoin table.per thead tr.bxbulk b{font-size:12px;color:var(--bx-ink)}' +
    V + ' .bxjoin table.per thead tr.bxbulk select{width:100%;max-width:220px;min-height:32px;height:32px;border:1px dashed var(--bx-mu);border-radius:6px;background-color:var(--bx-card);font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxjoin table.per tbody td select,' + V + ' .bxjoin table.per tbody td input[type="text"]{border-radius:6px}' +
    V + ' .bxjoin table.per tbody td select:not(.chg){color:var(--bx-mu);border-color:var(--bx-line)}' +
    V + ' .bxjoin table.per tbody td select.chg{color:var(--bx-ink);border-color:var(--bx-ink);font-weight:600}' +
    V + ' .bxprof{display:block;max-width:100%;margin:2px 0 0;padding:0;border:0;background:none;color:var(--bx-mu);font:inherit;font-size:11px;line-height:1.4;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}' +
    V + ' .bxprof:hover,' + V + ' .bxprof:focus-visible{color:var(--bx-acc);text-decoration:underline}' +
    V + ' .bxnote{margin:8px 0 0;font-size:12px;color:var(--bx-mu)}' +
    V + ' .bxjoin>.hint{margin:0 0 10px}' +
    /* 表の形「積む」：まとめて変えるの行もカードにする（列の見出しは data-label） */
    V + ' .tblwrap.pz-stack table.per thead{position:static;width:auto;height:auto;overflow:visible;clip:auto;display:block}' +
    V + ' .tblwrap.pz-stack table.per thead tr:first-child{display:none}' +
    V + ' .tblwrap.pz-stack table.per thead tr.bxbulk{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:flex-end;padding:8px 10px;margin-bottom:6px;border:1px dashed var(--bx-line2);border-radius:var(--r,6px);background:var(--bx-soft)}' +
    V + ' .tblwrap.pz-stack table.per thead tr.bxbulk td{display:block;position:static;border:0;padding:0;background:none!important;flex:1 1 calc(50% - 10px);min-width:0;max-width:none;width:auto}' +
    V + ' .tblwrap.pz-stack table.per thead tr.bxbulk td:nth-child(1){display:none}' + V + ' .tblwrap.pz-stack table.per thead tr.bxbulk td:nth-child(2){flex-basis:100%}' +
    V + ' .tblwrap.pz-stack table.per thead tr.bxbulk td[data-label]::before{content:attr(data-label);display:block;margin-bottom:2px;font-size:11px;color:var(--bx-mu)}' +
    V + ' .tblwrap.pz-stack table.per thead tr.bxbulk select{max-width:none}' +
    V + ' .boxwait{margin:0;border-radius:var(--bx-r);background:var(--bx-card)}' +

    /* ---------- 4. 下に固定の帯 ---------- */
    ':root.hk-runfix:root{--runfix-h:72px}' +
    'html.hk-runfix body{padding-bottom:var(--runfix-h)}' +
    'html.hk-runfix .toast,html.hk-runfix #loadfail,html.hk-runfix #pagejump{bottom:calc(var(--runfix-h) + 12px)}' +
    'html body ' + V + '>.runbar.bxrun{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;flex-wrap:nowrap;align-items:center;gap:12px 16px;min-height:0;margin:0;padding:12px max(32px,calc((100% - 1120px) / 2)) calc(12px + env(safe-area-inset-bottom,0px));border:0;border-radius:0;background:var(--bx-pr);color:var(--bx-pri);box-shadow:0 -2px 12px rgba(23,32,43,.12)}' +
    V + ' .bxrun .bxsum{flex:0 1 auto;min-width:0;font-size:13px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    V + ' .bxrun .spacer{flex:1 1 auto;display:block}' +
    V + ' .bxrun .bxpend{flex:none;display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.14);background:color-mix(in srgb,var(--bx-pri) 16%,transparent);font-size:12px;white-space:nowrap}' +
    V + ' .bxrun .bxpend[hidden]{display:none}' +
    V + ' .bxrun .bxpend::before{content:"";width:10px;height:10px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:bxspin .8s linear infinite}' +
    '@keyframes bxspin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){' + V + ' .bxrun .bxpend::before{animation:none}}' +
    V + ' .bxrun .bxseed{flex:none;display:flex;align-items:center;gap:8px;font-size:13px}' +
    V + ' .bxrun .bxseed label{font-size:13px;color:inherit;opacity:.85}' +
    'html body ' + V + '>.runbar.bxrun input[type="text"]{width:140px;flex:none;height:40px;min-height:0;padding:0 10px;border:1px solid rgba(255,255,255,.4);border-color:color-mix(in srgb,var(--bx-pri) 40%,transparent);border-radius:var(--bx-rs);background:rgba(255,255,255,.08);background:color-mix(in srgb,var(--bx-pri) 8%,transparent);color:var(--bx-pri);font-family:var(--f-num,inherit)}' +
    'html body ' + V + '>.runbar.bxrun input[type="text"]::placeholder{color:var(--bx-pri);opacity:.6}' +
    'html body ' + V + '>.runbar.bxrun input[type="text"]:focus{outline:2px solid var(--bx-pri);outline-offset:0;border-color:var(--bx-pri)}' +
    'html body ' + V + '>.runbar.bxrun .btn.primary{flex:none;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;height:48px;min-height:0;padding:0 24px;border:0;border-radius:10px;background:var(--bx-pri);color:var(--bx-pr);font-size:15px;font-weight:700;line-height:1.2}' +
    'html body ' + V + '>.runbar.bxrun .btn.primary:hover{filter:brightness(.95)}' +
    'html body ' + V + '>.runbar.bxrun .btn.primary:focus-visible{outline:2px solid var(--bx-pri);outline-offset:2px}' +
    'html body ' + V + '>.runbar.bxrun .btn.primary[aria-busy="true"]{opacity:.8}' +
    V + ' .bxrun-t{display:inline-flex;align-items:center;gap:8px}' + V + ' .bxrun-t svg{flex:none}' +
    V + ' .bxrun-s{display:none;font-size:11px;font-weight:400;opacity:.8}' +

    /* ---------- 5. スマホ（見本 08） ---------- */
    '@media (max-width:600px){' +
      V + ':not([hidden]){gap:12px}' +
      V + ' .bxsel{flex-wrap:nowrap;align-items:center;gap:12px;padding:12px 14px;border-radius:12px}' +
      V + ' .bxsel-m{flex:1 1 auto}' +
      V + ' .bxk{font-size:11px;letter-spacing:.02em}' +
      V + ' .bxsel-n{font-size:17px;margin:0;letter-spacing:.02em}' +
      V + ' .bxsel-d{font-size:12px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      V + ' .bxsel .tags,' + V + ' .bxsel .bxuses,' + V + ' .bxsel .note,' + V + ' .bxsel-a .tipscen{display:none}' +
      V + ' .bxsel-a{flex:0 0 auto;max-width:none}' +
      V + ' .bxsel-a .bxchg{height:40px;padding:0 14px;font-size:13px}' + V + ' .bxsel-a .bxchg svg,' + V + ' .bxsel-a .bxlong{display:none}' +
      V + ' .bxtabs{flex-direction:column;align-items:stretch;gap:8px}' +
      V + ' .bxk .bxadn{display:none}' + V + ' .bxpick-h{flex-wrap:nowrap}' + V + ' .bxx{flex:none}' +
      V + ' .bxtabs>*{min-width:0}' +
      V + ' .bxtl{flex-wrap:nowrap;min-width:0;gap:6px;overflow-x:auto;padding:0;background:none;border-radius:0;-webkit-overflow-scrolling:touch;scrollbar-width:none}' +
      V + ' .bxtl::-webkit-scrollbar{display:none}' +
      V + ' .bxtl button{flex:0 0 auto;height:36px;padding:0 14px;border:1px solid var(--bx-line2);border-radius:18px;background:var(--bx-card);font-size:13px}' +
      V + ' .bxtl button[aria-selected="true"]{border-color:var(--bx-pr);background:var(--bx-pr);color:var(--bx-pri);box-shadow:none}' +
      V + ' .bxtl button[aria-selected="true"] .bxtn{color:inherit;opacity:.85}' + V + ' .bxtl button[aria-selected="true"] .bxdot{background:var(--bx-pri)}' +
      V + ' .bxtabs-a .bxbtn{flex:1 1 0;height:40px}' +
      V + ' .bxenv{padding:0 16px 8px;border-radius:12px}' +
      V + ' .bxenv .envgrid{grid-template-columns:minmax(0,1fr)}' +
      V + ' .bxenv .envitem{padding:12px 0}' +
      V + ' .bxjbar .bxjc{flex:1 1 100%}' + V + ' .bxjbar .bxsp{display:none}' +
      V + ' .bxrand{flex:1 1 100%}' + V + ' .bxrand .bxrandl{flex:1 1 auto}' +
      V + ' .bxpick{padding:0}' +
      V + ' .bxpick-dlg{max-width:none;height:100%;max-height:none;border-radius:0}' +
      V + ' .bxpick-h{padding:10px 12px 10px 16px}' +
      V + ' .bxpick-b{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr) auto}' +
      V + ' .bxpick .scfilt{grid-column:1;grid-row:1;flex-wrap:nowrap;overflow-x:auto;padding:10px 16px;border-bottom:0}' +
      V + ' .bxpick .scfilt .chip{flex:0 0 auto}' +
      V + ' .bxfit{grid-column:1;grid-row:2;justify-content:flex-start;padding:0 16px 10px}' +
      V + ' .bxpick .scens{grid-column:1;grid-row:3;padding:10px 16px;grid-template-columns:repeat(2,minmax(0,1fr))}' +
      V + ' .bxpick .scen{min-height:64px}' +
      V + ' .bxpick-s{grid-column:1;grid-row:4;max-height:44vh;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));gap:8px;border-left:0;border-top:1px solid var(--bx-line);box-shadow:0 -4px 16px rgba(23,32,43,.06)}' +
      V + ' .bxpick-s h3{font-size:18px}' + V + ' .bxpick-s .bxside-d{font-size:13px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
      V + ' .bxpick-s .tags{display:none}' + V + ' .bxside-b .tipscen{height:36px}' + V + ' .bxgo{height:48px;flex:none}' +
      V + ' .bxpick-f{padding:8px 16px}' +
      ':root.hk-runfix:root{--runfix-h:calc(77px + env(safe-area-inset-bottom,0px))}' +
      'html body ' + V + '>.runbar.bxrun{gap:8px;padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));background:var(--bx-card);color:var(--bx-ink);border-top:1px solid var(--bx-line);box-shadow:0 -4px 16px rgba(23,32,43,.06)}' +
      V + ' .bxrun .bxsum,' + V + ' .bxrun .spacer{display:none}' +
      V + ' .bxrun .bxpend{position:absolute;left:16px;right:16px;bottom:calc(100% + 6px);justify-content:center;padding:6px 10px;background:var(--bx-pr);color:var(--bx-pri);box-shadow:var(--bx-shd)}' +
      V + ' .bxrun .bxseed{flex:0 0 84px;flex-direction:column;justify-content:center;align-items:stretch;gap:0;height:52px;box-sizing:border-box;padding:2px 6px;border:1px solid var(--bx-line2);border-radius:10px;background:var(--bx-card)}' +
      V + ' .bxrun .bxseed label{font-size:11px;color:var(--bx-mu);opacity:1;text-align:center;line-height:1.3}' +
      'html body ' + V + '>.runbar.bxrun input[type="text"]{width:100%;height:24px;min-height:0;padding:0;border:0;background:transparent;color:var(--bx-ink);text-align:center;font-size:16px}' +
      'html body ' + V + '>.runbar.bxrun input[type="text"]::placeholder{color:var(--bx-ink);opacity:.85;font-size:12px}' +
      'html body ' + V + '>.runbar.bxrun input[type="text"]:focus{outline:2px solid var(--bx-acc);border:0}' +
      'html body ' + V + '>.runbar.bxrun .btn.primary{flex:1 1 auto;height:52px;padding:0 12px;background:var(--bx-pr);color:var(--bx-pri)}' +
      V + ' .bxrun-s{display:block}' +
    '}' +
    /* 印刷では帯と窓を出さない */
    '@media print{' + V + '>.runbar.bxrun,' + V + ' .bxpick{display:none!important}html.hk-runfix body{padding-bottom:0}}';
  var st = document.createElement('style');
  st.id = 'ui-box-style';
  st.textContent = css;
  document.head.appendChild(st);
})();
