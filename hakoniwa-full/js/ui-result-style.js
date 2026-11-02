/* 箱庭シミュレーター: 「経過と結末」とセーブの一覧の見た目（2026-11-01 担当UC。参考デザインの見本 09〜14 に合わせた整え直し。表示だけで、記録・結果は変えない）
   ・並び（view.js の V.head・V.shell・各切替の HTML）はそのままに、ここから <style> を差して見た目を決める（index.html には書かない。ui-ties.js と同じ作り）
   ・色・角丸・影は方針書の --ui-* の変数（index.html が定義）。無いときは今のテーマの変数（--paper・--ink・--line・--muted・--bg1・--accent）に落ちるので、黒版・グレー版でも読める
   ・頭のボタンの行は格子の右の列（スマホ幅はメタ1行・題名2行の高さを決めた下）に置き、「別の運命で動かす」を連打しても位置が動かない
   ・経過のカードの見た目は .rvw の中だけ（記録を画像で保存（export-out.js）の写しは .rvw の外に置かれるので、今までの時系列の見た目のまま描かれる）
   ・印刷（PDF で保存）では、切替を全部開いて縦に並べる */
(function () {
  'use strict';
  if (typeof document === 'undefined' || !document.createElement || document.getElementById('hk-result-style')) return;
  var V = '#view-result,#view-saves,.rvw{--rc:var(--ui-card,var(--paper));--ri:var(--ui-ink,var(--ink));--rm:var(--ui-muted,var(--muted));--rl:var(--ui-line,var(--line));--rs:var(--ui-soft,var(--bg1));--ra:var(--ui-accent,var(--accent,var(--ink)));--rp:var(--ui-primary,var(--ink));--rpi:var(--ui-primary-ink,var(--paper));--rr:var(--ui-radius,12px);--rr2:var(--ui-radius-s,8px);--rsh:var(--ui-shadow,0 1px 2px rgba(0,0,0,.08));--rvst:calc(env(safe-area-inset-top,0px) + 56px)}';
  /* --rvst：目次・右の絞り込み・一覧を止める高さと、区切りへ移ったときの上の余白（上の段の切替 .tabs（index.html・44px・画面の上に固定）の下に 12px）*/
  var CHECK = 'content:"";position:absolute;left:5px;top:1.5px;width:4px;height:8px;border:solid var(--rpi);border-width:0 2px 2px 0;transform:rotate(45deg)';
  var css = V +
    /* カード */
    '.rvcard{background:var(--rc);border:1px solid var(--rl);border-radius:var(--rr);box-shadow:var(--rsh);padding:18px 20px;min-width:0;color:var(--ri)}' +
    'button.rvcard{display:block;width:100%;font:inherit;text-align:left;cursor:pointer}button.rvcard:hover{border-color:var(--rm)}' +
    '.rvsr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    /* 頭：小さく「箱庭・人数・シード」、大きく結末の一文、右にボタンの行 */
    '.rvw .resulthead.rvhead{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"meta btn" "title btn" "note btn";column-gap:16px;align-items:start;margin:0 0 4px}' +
    '.rvw .rvhead>div:first-child{display:contents}.rvw .rvhead>.spacer{display:none}' +
    '.rvw .rvhead .rvmeta{grid-area:meta;font-family:inherit;font-size:12px;color:var(--rm);margin:0 0 4px;letter-spacing:0;min-width:0}.rvw .rvhead .rvmeta .num{font-family:var(--f-num)}' +
    '.rvw .rvhead .rvtitle{grid-area:title;font-family:var(--f-body);font-size:22px;font-weight:700;line-height:1.45;letter-spacing:.02em;margin:0;min-width:0;overflow-wrap:anywhere}' +
    '.rvw .rvhead .scnote{grid-area:note;margin-top:6px;min-width:0}' +
    '.rvw .rvhead>.rvbtns{grid-area:btn;display:flex;flex-wrap:nowrap;gap:8px;justify-content:flex-end;align-items:center;align-self:start;margin:0}' +
    '.rvw .rvbtns .btn{min-height:38px;border-radius:var(--rr2);white-space:nowrap}.rvw .rvbtns .btn.primary{padding:6px 18px}' +
    '.rvw .rvbtns .btn svg{flex:none}' +
    '.rvw .rvsave{position:relative;display:inline-flex}' +
    '.rvw .rvcaret{display:inline-block;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid currentColor;margin-left:2px}' +
    '.rvw .rvmenu{position:absolute;right:0;top:calc(100% + 6px);z-index:40;display:flex;flex-direction:column;gap:10px;width:max-content;min-width:260px;max-width:min(380px,92vw);padding:12px;background:var(--rc);border:1px solid var(--rl);border-radius:var(--rr);box-shadow:var(--ui-shadow-dlg,0 8px 24px rgba(23,32,43,.16))}' +
    '.rvw .rvmenu[hidden]{display:none}' +
    '.rvw .rvmenu :is(.rvmrow,.row,.sharebar){display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;border:0;background:none;box-shadow:none}' +
    '.rvw .rvmenu :is(.rvmrow,.row,.sharebar)+:is(.rvmrow,.row,.sharebar){padding-top:10px;border-top:1px solid var(--rl)}' +
    '.rvw .rvmenu .btn{min-height:34px;border-radius:var(--rr2);white-space:nowrap}.rvw .rvmenu #sharemsg{flex-basis:100%;font-size:12px}.rvw .rvmenu #sharemsg:empty{display:none}' +
    '@media (max-width:760px){' +
      '.rvw .resulthead.rvhead{grid-template-columns:minmax(0,1fr);grid-template-areas:"meta" "title" "btn" "note"}' +
      '.rvw .rvhead .rvmeta{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;height:1.6em;line-height:1.6}' +
      /* 題名は2行の高さに固定（長い回は省略。全文は「結末」のカード）：下のボタンの行が回ごとに上下しない */
      '.rvw .rvhead .rvtitle{font-size:18px;line-height:1.45;height:2.9em;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}' +
      '.rvw .rvhead>.rvbtns{justify-content:flex-start;flex-wrap:wrap;margin:10px 0 2px}.rvw .rvbtns .btn{padding:4px 12px}.rvw .rvbtns .btn.primary{padding:4px 14px}' +
      '.rvw .rvmenu{position:fixed;left:10px;right:10px;top:auto;bottom:10px;width:auto;max-width:none;max-height:70vh;overflow:auto}' +
    '}' +
    /* 切替「結末｜経過｜関係図｜二人ずつ｜住人ごと」（スマホは横に流す） */
    '.rvw .rvtabs{display:flex;gap:2px;border-bottom:1px solid var(--rl);margin:14px 0 18px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}.rvw .rvtabs::-webkit-scrollbar{display:none}' +
    '.rvw .rvtab{appearance:none;-webkit-appearance:none;background:none;border:0;border-bottom:2px solid transparent;margin:0 0 -1px;padding:10px 16px;font:inherit;font-size:14px;color:var(--rm);white-space:nowrap;cursor:pointer;display:inline-flex;align-items:baseline;gap:6px;min-height:44px;flex:none}' +
    '.rvw .rvtab small{font-size:11.5px;color:var(--rm);font-weight:400}.rvw .rvtab:hover{color:var(--ri)}' +
    '.rvw .rvtab[aria-selected="true"]{color:var(--ri);font-weight:700;border-bottom-color:var(--ri)}.rvw .rvtab:focus-visible{outline:2px solid var(--ra);outline-offset:-3px}' +
    '@media (max-width:760px){.rvw .rvtab{padding:10px 12px}.rvw .rvsecn{display:none}}' +
    '.rvw .rvpane[hidden]{display:none}' +
    /* 中身の格子 */
    '.rvw .rvgrid{display:grid;gap:20px;align-items:start}' +
    '.rvw .rvg-end{grid-template-columns:minmax(0,1fr) 320px}.rvw .rvg-log{grid-template-columns:140px minmax(0,1fr) 216px;gap:16px}.rvw .rvg-map{grid-template-columns:minmax(0,1fr) 280px}' +
    '.rvw .rvg-pair{grid-template-columns:290px minmax(0,1fr)}.rvw .rvg-who{grid-template-columns:230px minmax(0,1fr)}' +
    '.rvw :is(.rvmain,.rvside){min-width:0;display:grid;gap:16px;align-content:start}' +
    '@media (max-width:1100px){.rvw .rvg-log{grid-template-columns:minmax(0,1fr) 220px}.rvw .rvg-log .rvtoc{display:none}}' +
    '@media (max-width:900px){.rvw :is(.rvg-end,.rvg-map){grid-template-columns:minmax(0,1fr)}.rvw .rvg-pair{grid-template-columns:230px minmax(0,1fr)}.rvw .rvg-who{grid-template-columns:200px minmax(0,1fr)}}' +
    '.rvw .rvh3{font-size:14px;font-weight:700;margin:0 0 10px}.rvw .rvh4{font-size:13px;font-weight:700;margin:8px 0 0}.rvw .rvh4 small{font-weight:400;color:var(--rm)}' +
    '.rvw .rvsub{font-size:12px;color:var(--rm);margin:-4px 0 8px}.rvw .rvfootnote{font-size:12px;color:var(--rm);margin:8px 0 0}' +
    '.rvw .rvlink{appearance:none;-webkit-appearance:none;background:none;border:0;padding:6px 0;font:inherit;font-size:13px;font-weight:600;color:var(--ra);cursor:pointer;text-align:left}.rvw .rvlink:hover{text-decoration:underline;text-underline-offset:3px}.rvw .rvlink.small{font-size:12px;font-weight:500}' +
    '.rvw .avpair{display:inline-flex;flex:none}.rvw .avpair .av+.av{margin-left:-6px}' +
    '.rvw .rvrel{font-size:12px;font-weight:700;white-space:nowrap}' +
    '.rvw .rvrel:is(.love,.obsess){color:var(--love)}.rvw .rvrel.pine{color:var(--pine)}.rvw .rvrel.night{color:var(--night)}.rvw .rvrel:is(.enemy,.kill){color:var(--enemy)}.rvw .rvrel:is(.partner,.guard){color:var(--partner)}.rvw .rvrel.friend{color:var(--friend)}.rvw .rvrel.none{color:var(--rm)}' +
    /* 結末（見本 10） */
    '.rvw .ending.rvending,.rvw .ending{margin:0;background:var(--rc);border:1px solid var(--rl);border-radius:var(--rr);box-shadow:var(--rsh);padding:22px 24px}' +
    '.rvw .ending .ehead{font-size:17px;line-height:1.65;margin:0 0 14px}' +
    '.rvw .ending .estats{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.rvw .ending .estats>div{border:0;background:var(--rs);border-radius:var(--rr2);padding:8px 14px;min-width:104px}' +
    '.rvw .ending .estats dd{font-size:19px}' +
    '.rvw .rvturn{display:inline-flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline;margin:0 0 6px}.rvw .rvturn .hot{color:var(--hot)}' +
    '.rvw .ending .elines{margin-top:8px;font-size:13.5px;line-height:1.8}' +
    '.rvw .rvsech{font-size:14px;font-weight:700;margin:6px 0 -6px}' +
    '.rvw .rvduo{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}' +
    '.rvw .rvduoc{display:flex;flex-direction:column;gap:6px;padding:16px 18px;color:var(--ri)}' +
    '.rvw .rvduoh{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.rvw .rvduoh .lbl{margin-left:auto}.rvw .rvduon{font-size:14px}' +
    '.rvw .rvduos{font-size:12px;color:var(--rm)}.rvw .rvduot{font-size:13.5px;line-height:1.8}' +
    '.rvw .rvaft{list-style:none;margin:0;padding:0}.rvw .rvaft li+li{border-top:1px solid var(--rl)}' +
    '.rvw .rvaftb{appearance:none;-webkit-appearance:none;background:none;border:0;width:100%;display:flex;gap:12px;align-items:flex-start;text-align:left;padding:10px 0;font:inherit;color:var(--ri);cursor:pointer}.rvw .rvaftb:hover .rvaftn b{text-decoration:underline}' +
    '.rvw .rvaftt{display:grid;gap:2px;min-width:0}.rvw .rvaftn{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.rvw .rvaftx{font-size:13px;line-height:1.75}' +
    '.rvw .rvcond{padding:14px 20px}.rvw .rvcond summary{display:flex;justify-content:space-between;align-items:baseline;gap:8px;cursor:pointer;list-style:none;font-size:13.5px}.rvw .rvcond summary::-webkit-details-marker{display:none}' +
    '.rvw .rvcond summary small{color:var(--rm);font-size:12px}.rvw .rvcond summary::after{content:"";width:7px;height:7px;border-right:1.5px solid var(--rm);border-bottom:1.5px solid var(--rm);transform:rotate(45deg);flex:none;align-self:center}.rvw .rvcond[open] summary::after{transform:rotate(-135deg)}' +
    '.rvw .rvcond .uses{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px}.rvw .rvcond .chip:not(.rvon){color:var(--rm)}.rvw .rvcond .chip.rvon{font-weight:700;border-color:var(--ri);color:var(--ri)}' +
    '.rvw .rvsidec{padding:16px 18px}.rvw .rvsl{list-style:none;margin:0;padding:0}.rvw .rvsl li+li{border-top:1px solid var(--rl)}' +
    '.rvw .rvsl button{appearance:none;-webkit-appearance:none;background:none;border:0;width:100%;text-align:left;font:inherit;font-size:13px;color:var(--ri);padding:9px 0;cursor:pointer;display:grid;gap:2px}.rvw .rvsl button:hover b{text-decoration:underline}' +
    '.rvw .rvslh{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.rvw .rvsl small{font-size:12px;color:var(--rm)}' +
    '.rvw .rvpine button{display:flex;gap:8px;align-items:center;justify-content:flex-start}.rvw .rvarr{color:var(--rm)}' +
    '.rvw .rvmaplink{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;color:var(--ri)}.rvw .rvmaplink small{color:var(--rm);font-size:12px}' +
    /* 経過（見本 09・11）：目次・区切りのカード・右の絞り込み */
    '.rvw .rvtoc{position:sticky;top:var(--rvst);max-height:calc(100vh - var(--rvst) - 12px);overflow:auto;font-size:12.5px}' +
    '.rvw .rvtoct{font-size:12px;color:var(--rm);margin:4px 0 8px 8px}.rvw .rvtoc ol{list-style:none;margin:0;padding:0;display:grid;gap:1px}' +
    '.rvw .rvtocb{appearance:none;-webkit-appearance:none;background:none;border:0;border-radius:6px;width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:6px;align-items:baseline;padding:5px 8px;font:inherit;color:var(--ri);cursor:pointer}' +
    '.rvw .rvtocb:hover{background:var(--rs)}.rvw .rvtocb .tn{font-family:var(--f-num);font-size:11px;color:var(--rm)}.rvw .rvtocb .lb{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rvw .rvtocb .n{font-size:11px;color:var(--rm)}.rvw .rvtocb.hot .tn{color:var(--hot)}' +
    '.rvw .rvloghd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 -4px}' +
    '.rvw .rvloghd h2.sec,.rvw .rvsolo h2.sec#tlhead{margin:0;padding:0;border:0;font-size:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}.rvw .rvloghd h2.sec .hotleg{margin-left:4px}' +
    '.rvw .rvsidebtn{display:none}' +
    /* 経過の見え方（2026-11-02 担当UE）：.rvw の data-tlv（view.js の rv.tlv）で「カード」と「線」を切り替える。HTML は同じ。
       吹き出し（data-tlv="bubble"。2026-11-02 担当UH）は区切りの面・出来事の頭と足がカードと同じ（下のカードの規則を :is で共有）で、発話のある出来事の本文だけが吹き出し（.bbx）
       線＝前の見え方（index.html の .tl・.stepblk・.ev のまま：左の縦の線と点、顔アイコン、重要な出来事の種類の線の形と薄い背景）を、新しい殻（切替・目次・右の絞り込み）の中で 1 枚の面に置く。
       カード＝区切りごとのカード。1 出来事の高さを前の見え方とほぼ同じに詰める（余白・行間・頭の札を本文の行の頭に・理由は本文の直下に小さく）。顔アイコンも本文の左に小さく出す */
    /* 両方：区切りの折りたたみ・理由の表示・文字の大きさ・転機への移動の印 */
    '.rvw .rvsecm{margin-left:auto;display:inline-flex;gap:8px;align-items:center;font-family:var(--f-body);font-size:12px;font-weight:400;color:var(--rm);letter-spacing:0}' +
    '.rvw .rvfoldbtn{appearance:none;-webkit-appearance:none;background:none;border:0;font:inherit;font-family:var(--f-body);font-size:12px;font-weight:400;letter-spacing:0;color:var(--rm);cursor:pointer;padding:4px 2px;min-height:30px;display:inline-flex;align-items:center;gap:6px}' +
    '.rvw .rvfoldbtn:hover{color:var(--ri)}.rvw .rvfoldbtn::after{content:"";width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:translateY(2px) rotate(-135deg)}.rvw .rvfold .rvfoldbtn::after{transform:translateY(-2px) rotate(45deg)}' +
    '.rvw .tl .stepblk.rvfold>:is(ol,.rvnext){display:none}' +
    '.rvw[data-why="0"] .tl .ev .why{display:none}' +
    /* 文字の大きさは見え方の規則（カード・吹き出しの .tl .ev の 14px）より強く（[data-tlv] を足す。2026-11-02 担当UH：カードで「小・大」が効いていなかった） */
    '.rvw[data-tlv][data-fs="s"] .tl .ev{font-size:13px;line-height:1.65}.rvw[data-tlv][data-fs="l"] .tl .ev{font-size:16px;line-height:1.8}' +
    '.rvw .tl .ev.rvflash{outline:2px solid var(--ra);outline-offset:4px;border-radius:8px}' +
    '.rvw :is(.tl .stepblk,#tlhead){scroll-margin-top:var(--rvst)}' +
    '.rvw .rvtlvbar{display:inline-flex;margin-left:auto;min-width:196px}.rvw .rvtlvbar button{min-height:30px;font-size:12.5px;padding:3px 10px}.rvw .rvtlv button{white-space:nowrap;padding-left:4px;padding-right:4px}' +
    /* カード */
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl{border:0;display:grid;gap:8px}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk{display:block;background:var(--rc);border:1px solid var(--rl);border-radius:var(--rr);box-shadow:var(--rsh);padding:0 18px 2px;--rail:0px;--hfx:10px}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk+.stepblk{border-top:1px solid var(--rl)}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk .when{flex-direction:row;align-items:center;flex-wrap:wrap;gap:2px 10px;padding:5px 0 4px;border-bottom:1px solid var(--rl);font-size:13px;letter-spacing:0;line-height:1.4}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk .when .tn{font-family:var(--f-num);font-size:12px;font-weight:600;color:var(--rm)}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk .when.hot .tn{color:var(--hot)}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk .when .ph{font-family:var(--f-body);font-size:14px;font-weight:700;color:var(--ri);line-height:1.4}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk .when .rvfoldbtn{min-height:26px;padding:2px}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk.rvfold{padding-bottom:0;background:var(--rs);box-shadow:none}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk.rvfold .when{border-bottom:0;background:transparent}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk ol{border-left:0;padding:0;gap:0;display:block}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk ol>.ev{padding:5px 0;border-top:1px solid var(--rl)}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk ol>.ev:first-child{border-top:0}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk ol>.ev::before{display:none}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev{font-size:14px;line-height:1.65}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .evb{line-height:inherit}' +
    /* 顔アイコン：本文の左に 22px（二人なら重ねる）。本文の 1 行目と同じ高さに置くので、出来事の高さは増えない */
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev.hasav{display:flex;gap:8px;align-items:flex-start}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .avs{display:flex;flex:none;min-width:35px;padding:1px 0 0}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .avs .av{width:22px!important;height:22px!important;font-size:10px!important}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .avs .av+.av{margin-left:-9px}' +
    /* 頭の札（重要・節目・種類・らしくない）は本文の行の頭に並べる（札のための 1 行を使わない） */
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .evh{display:inline;margin:0}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .evh>*{margin:0 5px 0 0;vertical-align:1px}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .c{display:inline-block;border:1px solid var(--rl);border-radius:4px;padding:0 5px;font-family:var(--f-body);font-size:11px;line-height:1.55;letter-spacing:0;color:var(--rm);font-weight:400;background:none}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev.hot .c{background:none;border-color:var(--rl);color:var(--rm)}' +
    '.rvw .rvimp{display:inline-block;font-size:10.5px;font-weight:700;line-height:1.55;padding:0 6px;border-radius:4px;color:var(--paper);background:var(--hot);white-space:nowrap;letter-spacing:.02em}' +
    ':root[data-palette="mono"] .rvw .rvimp{color:var(--paper)}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .oddb{border-radius:4px;font-family:var(--f-body);letter-spacing:0;font-size:11px;padding:0 6px}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev :is(.markb,.goalb,.rmb){border-radius:4px}' +
    /* 理由：本文の直下に小さく */
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .why{display:block;margin-top:0;font-size:11.5px;line-height:1.45;color:var(--rm)}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .why::before{content:"理由："}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .evp+.evp{margin-top:.4em}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .evq{border-left:0;padding-left:1em}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) :is(#tl,#dgtl,#sttl) .stepblk ol>.ev:is([data-hot],[data-rm]){margin:3px -10px;padding:5px 10px;border-radius:8px}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) :is(#tl,#dgtl,#sttl) .stepblk ol>.ev:is([data-hot],[data-rm])+.ev{border-top:0}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev.facfold{padding:5px 0}' +
    '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .rvnext{border-top:1px solid var(--rl);padding:0;text-align:right}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .rvnext .rvlink{padding:4px 0;font-size:12px}' +
    /* 線（前の見え方）：中身は index.html の見た目のまま。区切りの頭（左の列）に件数と畳む／開く、畳んだ区切りは 1 行 */
    '.rvw[data-tlv="line"] .tl{background:var(--rc);border:1px solid var(--rl);border-radius:var(--rr);box-shadow:var(--rsh);padding:0 20px}' +
    '.rvw[data-tlv="line"] .tl .stepblk .when .rvsecm{margin:3px 0 0;gap:6px;font-size:11px}.rvw[data-tlv="line"] .tl .stepblk .when .rvimp{font-size:10px;padding:0 5px}' +
    '.rvw[data-tlv="line"] .tl .stepblk .when .rvfoldbtn{justify-content:flex-start;min-height:24px;padding:2px 0;font-size:11.5px}' +
    '.rvw[data-tlv="line"] .tl .stepblk.rvfold .when{grid-column:1/-1;flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:2px 12px;padding:9px 0}' +
    '.rvw[data-tlv="line"] .tl .stepblk.rvfold .when .rvsecm{margin:0 0 0 auto}' +
    '.rvw[data-tlv="line"] .tl .rvnext{grid-column:2;padding:0 0 8px;text-align:right}.rvw[data-tlv="line"] .tl .rvnext .rvlink{font-size:12px;padding:2px 0}' +
    '.rvw[data-tlv="line"] .tl .ev .evh{display:inline}.rvw[data-tlv="line"] .tl .ev .evh .rvimp{display:none}' +
    /* 吹き出し（view.js の V.bubble が描く .bbx。2026-11-02 担当UH）：左に話し手の顔、右に角丸の吹き出し（しっぽ付き・住人の色を薄く）、間に地の文を細い字で。
       全員左寄せ（色で区別）で、スマホ幅でも 1 列。記録を画像で保存（export-out.js）の写しは .rvw の外なので、形は .rvw に頼らずに書く。
       色は --ui-*（無ければテーマの変数）。単色は吹き出しの地を藍 6% に、黒は少し濃く。話し手の分からない台詞・モブは灰色の丸と灰色の地 */
    '.tl .ev.bbl .evh,.rvw[data-tlv] .tl .ev.bbl .evh{display:flex;flex-wrap:wrap;align-items:center;gap:3px 5px;margin:0 0 4px}.tl .ev.bbl .evh>*{margin:0!important}' +
    '.bbx{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-width:0}' +
    '.bbx .bbn{margin:0;font-size:.89em;line-height:1.6;color:var(--ui-muted,var(--muted))}' +
    '.bbx .bbg{--bbf:12%;--bbl:30%;--bbbg:var(--ui-soft,var(--bg1));--bbln:var(--ui-line,var(--line));display:flex;align-items:flex-start;gap:8px;min-width:0}' +
    '.bbx .bbg>.av{flex:none;width:24px!important;height:24px!important;font-size:11px!important;margin-top:3px}' +
    '.bbx .bbmob{--c:var(--ui-muted,var(--muted));--k:var(--ui-muted,var(--muted))}' +
    '.bbx .bbs{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-width:0;flex:1}' +
    '.bbx .bb{position:relative;max-width:100%;box-sizing:border-box;padding:3px 11px;border-radius:12px;border:1px solid var(--bbln);background:var(--bbbg);color:var(--ui-ink,var(--ink));line-height:1.65;overflow-wrap:anywhere}' +
    '.bbx .bb:first-child::before{content:"";position:absolute;left:-5px;top:10px;width:8px;height:8px;background:inherit;border:solid var(--bbln);border-width:0 0 1px 1px;transform:rotate(45deg)}' +
    '.bbx .bbnm{font-weight:700;font-size:.84em;margin-right:.5em;color:var(--c)}' +
    '@supports (color: color-mix(in srgb, red 50%, blue)){' +
      '.bbx .bbg:not(.bbg0){--bbbg:color-mix(in srgb,var(--c) var(--bbf),var(--ui-card,var(--paper)));--bbln:color-mix(in srgb,var(--c) var(--bbl),var(--ui-card,var(--paper)))}' +
      '.bbx .bbnm{color:color-mix(in srgb,var(--c) 72%,var(--ui-ink,var(--ink)))}' +
    '}' +
    '@media (prefers-color-scheme: dark){:root:not([data-theme="light"],[data-theme="gray"]) .bbx .bbg{--bbf:18%;--bbl:42%}}:root[data-theme="dark"] .bbx .bbg{--bbf:18%;--bbl:42%}' +
    ':root[data-palette="mono"] .bbx .bbg{--c:var(--ai)!important;--bbf:6%;--bbl:24%}' +
    '@media print{.bbx .bb{background:none!important}}' +
    '.rvw .rvrail{position:sticky;top:var(--rvst);max-height:calc(100vh - var(--rvst) - 12px);overflow:auto}' +
    '.rvw .rvrailin{padding:16px 18px}.rvw .rvrs{padding:12px 0;border-top:1px solid var(--rl)}.rvw .rvrs:first-child{border-top:0;padding-top:0}.rvw .rvrs:last-child{padding-bottom:0}' +
    '.rvw .rvrt{font-size:12px;font-weight:700;margin:0 0 8px}' +
    '.rvw .rvwhos{display:flex;flex-wrap:wrap;gap:6px}' +
    '.rvw .rvwhob{appearance:none;-webkit-appearance:none;background:none;border:0;padding:2px;border-radius:50%;cursor:pointer;position:relative;line-height:0}' +
    '.rvw .rvwhob[aria-pressed="true"]{box-shadow:0 0 0 2px var(--ri)}.rvw .rvwhos:has([aria-pressed="true"]) .rvwhob[aria-pressed="false"]{opacity:.45}' +
    '.rvw .rvcats{display:grid;grid-template-columns:1fr 1fr;gap:0 8px}' +
    '.rvw :is(.rvchk,.rvsw){appearance:none;-webkit-appearance:none;background:none;border:0;padding:5px 0;font:inherit;font-size:13px;color:var(--ri);display:flex;align-items:center;gap:8px;cursor:pointer;text-align:left;min-height:34px;width:100%}' +
    '.rvw .rvsw{justify-content:space-between}.rvw .rvsw>span{display:inline-flex;align-items:center;gap:6px}' +
    '.rvw :is(.rvchk,.rvsw)>i{flex:none;width:18px;height:18px;border:1.5px solid var(--rm);border-radius:4px;position:relative;background:var(--rc);box-sizing:border-box}' +
    '.rvw :is(.rvchk[aria-checked="true"],.rvsw[aria-checked="true"],.rvsw[aria-pressed="true"])>i{background:var(--rp);border-color:var(--rp)}' +
    '.rvw :is(.rvchk[aria-checked="true"],.rvsw[aria-checked="true"],.rvsw[aria-pressed="true"])>i::after{' + CHECK + '}' +
    '.rvw :is(.rvchk,.rvsw):focus-visible{outline:2px solid var(--ra);outline-offset:2px;border-radius:4px}' +
    '.rvw .rvseg{display:flex;border:1px solid var(--rl);border-radius:var(--rr2);overflow:hidden}' +
    '.rvw .rvseg button{flex:1;appearance:none;-webkit-appearance:none;border:0;background:var(--rc);font:inherit;padding:6px 0;cursor:pointer;color:var(--ri);min-height:36px}' +
    '.rvw .rvseg button+button{border-left:1px solid var(--rl)}.rvw .rvseg button[aria-checked="true"]{background:var(--rs);font-weight:700}' +
    '.rvw .rvseg [data-v="s"]{font-size:12px}.rvw .rvseg [data-v="m"]{font-size:14px}.rvw .rvseg [data-v="l"]{font-size:16px}' +
    '@media (max-width:760px){' +
      '.rvw .rvsidebtn{display:inline-flex}.rvw .rvg-log .rvtoc{display:none}' +
      '.rvw .rvg-log .rvrail{display:none;order:-1;position:static;max-height:none}.rvw[data-side="1"] .rvg-log .rvrail{display:block}' +
      '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .stepblk{padding:0 12px 2px;--hfx:8px}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) :is(#tl,#dgtl,#sttl) .stepblk ol>.ev:is([data-hot],[data-rm]){margin:4px -8px;padding:6px 8px}' +
      '.rvw[data-tlv="line"] .tl{padding:0 12px}.rvw[data-tlv="line"] .tl .rvnext{grid-column:auto}.rvw[data-tlv="line"] .tl .stepblk .when .rvsecm{margin:0 0 0 auto}' +
      '.rvw .rvtlvbar{margin-left:0}' +
      '.bbx .bbg{gap:6px}.bbx .bbg>.av{width:22px!important;height:22px!important;font-size:10px!important}.bbx .bb{padding:3px 9px}' +
      '.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev.hasav{gap:6px}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .avs{min-width:31px}.rvw:is([data-tlv="card"],[data-tlv="bubble"]) .tl .ev .avs .av{width:20px!important;height:20px!important;font-size:9px!important}' +
    '}' +
    /* 関係図（見本 12） */
    '.rvw .rvmapcard{padding:14px 16px}.rvw .rvmaphd .mapat{margin:0}.rvw .rvmaphd{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 8px}' +
    '.rvw .rvmapinfo{display:inline-flex;gap:8px;align-items:center;font-size:12px;color:var(--rm);margin-left:auto}' +
    '.rvw .rvmapcard .trayfig{margin:0}.rvw .rvmapcard .maplegs .mapleg{display:none}' +
    '.rvw .rvmapks{display:grid;gap:0}.rvw .rvmapk .rvmk{flex:1}.rvw .rvmapk small{color:var(--rm);font-size:12px}.rvw .rvmapk .rvls{flex:none}' +
    '.rvw #map .rl.sel{stroke-width:5px!important;opacity:1!important}.rvw #map .elab.sel{font-size:14px}' +
    ['love', 'pine', 'friend', 'partner', 'guard', 'enemy', 'kill', 'night', 'none'].map(function (k) { return '.rvw #map[data-off~="' + k + '"] [data-k="' + k + '"]'; }).join(',') + '{display:none}' +
    '.rvw .rvselline .rvslh{margin:4px 0 0;font-size:15px}.rvw .rvselline .rvslt{font-size:13.5px;line-height:1.8;margin:8px 0 4px}' +
    '.rvw .rvsec2>h2.sec:first-child,.rvw .rvsec2 h2.sec{margin-top:0}' +
    /* 二人ずつ・住人ごと（見本 13・14）：左の一覧と右のカード */
    '.rvw .rvlist{padding:10px;position:sticky;top:var(--rvst);max-height:calc(100vh - var(--rvst) - 12px);overflow:auto}' +
    '.rvw .rvpills{display:flex;flex-wrap:wrap;gap:6px;padding:4px 4px 10px;border-bottom:1px solid var(--rl);margin-bottom:6px}' +
    '.rvw .rvpill{appearance:none;-webkit-appearance:none;border:1px solid var(--rl);background:var(--rc);border-radius:999px;padding:3px 10px;font:inherit;font-size:12px;color:var(--ri);cursor:pointer;min-height:30px}' +
    '.rvw .rvpill small{margin-left:4px;color:var(--rm)}.rvw .rvpill[aria-pressed="true"]{background:var(--rp);color:var(--rpi);border-color:var(--rp)}.rvw .rvpill[aria-pressed="true"] small{color:inherit;opacity:.8}' +
    '.rvw .rvplist{list-style:none;margin:0;padding:0}' +
    ['sur', 'love', 'friend', 'enemy'].map(function (k) { return '.rvw .rvplist[data-f="' + k + '"] li:not([data-g~="' + k + '"])'; }).join(',') + '{display:none}' +
    '.rvw .rvpi{appearance:none;-webkit-appearance:none;background:none;border:0;border-radius:8px;width:100%;display:flex;align-items:center;gap:8px;padding:8px;font:inherit;font-size:13px;color:var(--ri);cursor:pointer;text-align:left}' +
    '.rvw .rvpi:hover{background:var(--rs)}.rvw .rvpi[aria-current="true"]{background:var(--rs);box-shadow:inset 3px 0 0 var(--ri)}' +
    '.rvw .rvpn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}' +
    '.rvw .rvpr{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex:none}.rvw .rvodd{font-size:10.5px;color:var(--odd);border:1px dashed var(--odd);border-radius:4px;padding:0 5px}' +
    '.rvw .rvwlist .rvpn{display:grid;white-space:normal}.rvw .rvwlist .rvpn small{font-size:11.5px;color:var(--rm);font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.rvw .rvpd,.rvw .rvcd{padding:24px 28px;gap:12px}' +
    '.rvw .rvpd .hd{gap:10px}.rvw .rvpd .hd .nm{font-size:18px}.rvw .rvpd .txt{font-size:15px;line-height:1.85}' +
    '.rvw .rvcmp{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rvw .rvcmpb{background:var(--rs);border-radius:var(--rr2);padding:12px 14px;display:grid;gap:2px}' +
    '.rvw .rvcmpb .k{font-size:11.5px;color:var(--rm)}.rvw .rvcmpb b{font-size:15px}.rvw .rvcmpb.odd{box-shadow:inset 0 0 0 1px var(--odd)}.rvw .rvcmpb.odd b{color:var(--odd)}' +
    '.rvw .rvul{margin:0;padding-left:1.2em;font-size:13.5px;line-height:1.8}' +
    '.rvw .rvtblw{overflow-x:auto}.rvw .rvvals{border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}' +
    '.rvw .rvvals :is(th,td){padding:6px 12px;border-bottom:1px solid var(--rl);text-align:right;white-space:nowrap}.rvw .rvvals th:first-child{text-align:left}.rvw .rvvals thead th{font-size:11.5px;color:var(--rm);font-weight:400}' +
    '.rvw .rvmore{padding-top:4px}' +
    '.rvw .rvcd .hd{display:flex;align-items:center;gap:14px}.rvw .rvcdn{display:grid;gap:4px;flex:1;min-width:0}.rvw .rvcd .rvcdn .nm{font-size:20px;font-weight:700}.rvw .rvcdn .fate{justify-self:start}' +
    '.rvw .rvnav{display:flex;gap:6px}.rvw .rvnav .btn{min-width:40px;padding:4px 10px;font-size:16px}' +
    '.rvw .rvlead{font-size:15px;line-height:1.9;margin:0}' +
    '.rvw .rvbox{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px 24px;background:var(--rs);border-radius:var(--rr2);padding:14px 16px}' +
    '.rvw .rvemo .k{font-size:12px;color:var(--rm)}.rvw .rvdl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0;font-size:13px;align-content:start}.rvw .rvdl dt{color:var(--rm)}.rvw .rvdl dd{margin:0}' +
    '.rvw .rvoddl li{border-left:2px dashed var(--odd)}' +
    '@media (max-width:760px){' +
      '.rvw :is(.rvgrid,.rvg-end,.rvg-log,.rvg-map,.rvg-pair,.rvg-who){grid-template-columns:minmax(0,1fr)}' +
      '.rvw .rvlist{position:static;max-height:240px}.rvw .rvwlist{display:flex;gap:4px;overflow-x:auto}.rvw .rvg-who .rvlist{max-height:none}.rvw .rvwlist li{flex:none}.rvw .rvwlist .rvpi{flex-direction:column;width:auto;min-width:76px}.rvw .rvwlist .rvpn{text-align:center}' +
      '.rvw .rvpd,.rvw .rvcd,.rvw .ending{padding:16px}.rvw .rvcmp{grid-template-columns:1fr}.rvw .rvcard{padding:14px 16px}' +
    '}' +
    /* 一人用・ダンジョン：結末の下の節もカードに */
    '.rvw .rvsolo{display:grid;gap:12px}.rvw .rvpane>.rvcard+*,.rvw .rvpane>*+.rvcard{margin-top:16px}' +
    '.rvw .rvpane>h2.sec:first-child{margin-top:0}' +
    /* これまでの箱庭（履歴） */
    '.rvw .rvfoot{margin-top:28px}' +
    '#view-result .rvhist summary{display:flex;justify-content:space-between;align-items:baseline;gap:8px;cursor:pointer;list-style:none;font-size:14px}#view-result .rvhist summary::-webkit-details-marker{display:none}' +
    '#view-result .rvhist summary small{color:var(--rm);font-size:12px}#view-result .rvhist>.hint{margin:10px 0 6px}' +
    '#view-result .rvhist .hist{gap:0}#view-result .rvhist .hist .btn{border:0;border-top:1px solid var(--rl);border-radius:0;background:none;padding:10px 4px;min-height:44px;justify-content:flex-start}' +
    '#view-result .rvhist .hist .btn:hover{background:var(--rs)}' +
    '#view-result .rvemptyc{margin:0 0 16px;padding:28px}' +
    /* セーブの一覧：同じカード・札・ボタン（記録は表示だけ） */
    '#view-saves .savehead{display:grid;gap:6px;margin:0 0 16px}#view-saves .savehead h2{font-size:20px;margin:0}' +
    '#view-saves .saverow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}#view-saves .saverow .btn{border-radius:var(--rr2)}' +
    '#view-saves .savelist{gap:12px}' +
    '#view-saves .saveitem{background:var(--rc);border:1px solid var(--rl);border-radius:var(--rr);box-shadow:var(--rsh);padding:16px 18px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 16px;align-items:start}' +
    '#view-saves .saveitem:hover{border-color:var(--rm)}#view-saves .savemain{min-width:0}' +
    '#view-saves .savetop{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '#view-saves .savescen{display:inline-block;font-size:11.5px;font-weight:700;line-height:1.7;padding:0 8px;border-radius:6px;background:var(--rs);color:var(--ri)}' +
    '#view-saves .savedate{font-size:12px;color:var(--rm);font-family:var(--f-num)}' +
    '#view-saves .savename{display:block;border:1px solid transparent;border-radius:var(--rr2);padding:4px 8px;margin:6px 0 2px -9px;font:inherit;font-size:15px;font-weight:700;width:min(100%,440px);background:transparent;color:var(--ri)}' +
    '#view-saves .savename:hover,#view-saves .savename:focus{border-color:var(--rl);background:var(--rc)}#view-saves .savename::placeholder{font-weight:400;color:var(--rm)}' +
    '#view-saves .savetitle{font-size:14px;line-height:1.7;margin:0}#view-saves .savecast{font-size:12.5px;color:var(--rm);margin:4px 0 0}' +
    '#view-saves .saveact{display:flex;flex-direction:column;gap:6px;align-items:stretch;min-width:132px}#view-saves .saveact .btn{border-radius:var(--rr2)}' +
    '#view-saves .saveitem.noresult{border-style:dashed;box-shadow:none}' +
    '#view-saves .savelist+.hint,#view-saves .empty+.hint{margin-top:14px}' +
    '@media (max-width:600px){#view-saves .saveitem{grid-template-columns:minmax(0,1fr)}#view-saves .saveact{flex-direction:row;flex-wrap:wrap;min-width:0}}' +
    /* 印刷（PDF で保存）：切替を全部開いて縦に */
    '@media print{' +
      '.rvw .rvpane[hidden]{display:block!important}.rvw .rvpane+.rvpane{margin-top:18px}' +
      '.rvw :is(.rvtabs,.rvtoc,.rvrail,.rvsidebtn,.rvbtns,.rvside,.rvlist,.rvnext,.rvfoldbtn,.rvmore,.rvnav,.rvmenu){display:none!important}' +
      '.rvw .rvgrid{display:block!important}.rvw .rvgrid>*+*{margin-top:12px}.rvw .tl .stepblk.rvfold>ol{display:block!important}' +
      '.rvw .rvcard,.rvw .tl .stepblk,.rvw .ending{box-shadow:none!important;break-inside:auto}' +
    '}';
  var st = document.createElement('style');
  st.id = 'hk-result-style';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
