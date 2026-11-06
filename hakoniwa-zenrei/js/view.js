/* 箱庭シミュレーター view: 結果（関係図・ペア・住人・時系列・履歴）の描画 */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var V = (HK.View = {});
  var CLS_VAR = { love: '--love', pine: '--pine', night: '--night', obsess: '--obsess', enemy: '--enemy', kill: '--kill', partner: '--partner', friend: '--friend', guard: '--guard', none: '--none' };
  /* 関係図の線の形（仕様 5）：色がなくても種類が分かるように、太さ・破線・矢印・× で描き分ける（色は「フル」のときだけ関係の色。ほかは藍） */
  var LINE_W = { love: 3.5, obsess: 3.5, partner: 2, friend: 1.2, pine: 1.2, guard: 1.5, enemy: 1.5, kill: 2.5, night: 1.2, none: 1 };
  var LINE_DASH = { enemy: '5 4', kill: '6 4', night: '2 4' };
  /* 凡例の並びと名前（恋人と執着は同じ線） */
  var LEG = [['love', '恋人・執着'], ['partner', '相棒'], ['friend', '友人'], ['pine', '片想い'], ['guard', '守護'], ['enemy', '敵対'], ['kill', '殺害'], ['night', '一夜']];
  /* 関係図の右の「表示する線」の種類（線の cls をまとめる。気まずい・破局なども cls は enemy）と、図に描いた本数（mapSvg が数える） */
  var KGRP = { love: 'love', obsess: 'love', pine: 'pine', friend: 'friend', partner: 'partner', guard: 'guard', enemy: 'enemy', kill: 'kill', night: 'night', none: 'none' };
  var KNAME = [['love', '恋人・執着'], ['pine', '片想い'], ['friend', '友人'], ['partner', '相棒'], ['guard', '守護'], ['enemy', '気まずい・敵対'], ['kill', '殺害'], ['night', '一夜'], ['none', 'そのほか']];
  var mapCnt = {};
  /* ch：記録の欄（e.ch。2026-11-06）の切り替え 'main' 本編（e.ch の無い記録）／'cm' コメント欄（e.ch が 'cm' の記録）。区切りの行はどちらにも。設計は docs/reports/2026-11-06/log-channel-design.md */
  var tl = { who: [], keyOnly: false, cat: 'all', lewd: false, off: {}, ch: 'main' };
  /* 記録の欄の名前（いまはコメント欄だけ）と、その欄の記録の数 */
  var CH_NAME = { cm: 'コメント欄' };
  function chOf(e) { return e && e.ch ? String(e.ch) : 'main'; }
  function chCount(res, ch) { return (res.log || []).filter(function (e) { return e && e.kind !== 'step' && chOf(e) === ch; }).length; }
  function chList(res) { var s = {}; (res.log || []).forEach(function (e) { if (e && e.ch && e.kind !== 'step' && CH_NAME[e.ch]) s[e.ch] = 1; }); return Object.keys(s); }
  /* いまの欄（その記録に無い欄なら本編） */
  function curCh(res) { var c = tl.ch || 'main'; return c === 'main' || chList(res).indexOf(c) >= 0 ? c : 'main'; }
  var lastRes = null, lastHost = null, lastOpts = null;
  /* ---------- 結果の画面の並び（2026-11-01 担当UC。参考デザインの「経過と結末」：頭＋切替「結末｜経過｜関係図｜二人ずつ｜住人ごと」。表示だけで、記録・結果は変えない） ----------
     rv.tab（今の切替）・fs（経過の文字の大きさ s/m/l）・why（理由を表示）・open（区切りを全部開く）は画面の設定としてブラウザに残す（新しい鍵 hakoniwa:rv。今までの鍵は変えない）。
     sec（区切りごとの開け閉め）・pair（選んだ組）・who（選んだ住人）・off（関係図で隠す線の種類）・lab（線の名前を全部出す）・line（選んだ線）・side（スマホの絞り込みの開閉）は結果ごと。
     見た目は js/ui-result-style.js（--ui-* の変数）。一人用・ダンジョン（solo-story-kit.js・dungeon-view.js）も V.head・V.shell で同じ頭と切替を使う
     tlv（経過の見え方。card＝区切りごとのカード／line＝前の見え方：縦の線・顔アイコン・種類の線の形と薄い背景。2026-11-02 担当UE）も同じ鍵に残す。
     どちらも同じ HTML で、.rvw の data-tlv で見た目だけを切り替える（区切りの折りたたみ・目次・絞り込みは両方に効く。一人用・ダンジョンの記録も同じ）
     bubble＝吹き出し（2026-11-02 担当UH）：区切りはカードと同じ。発話のある出来事の本文だけを V.bubble（e.seg で台詞と地の文に分ける）で描くので、
     吹き出しへ／から切り替えたときだけ記録の本文（#tl・#sttl・#dgtl）を描き直す（V.onTlv。区切りの開け閉め・絞り込みは rv.sec・tl のまま） */
  var RV_KEY = 'hakoniwa:rv';
  var rv = (function () {
    var o = {};
    try { o = JSON.parse(window.localStorage.getItem(RV_KEY) || '{}') || {}; } catch (e) { o = {}; }
    return { tab: typeof o.tab === 'string' ? o.tab : 'end', fs: /^[sml]$/.test(o.fs || '') ? o.fs : 'm', why: o.why !== false, open: !!o.open, tlv: o.tlv === 'line' || o.tlv === 'bubble' ? o.tlv : 'card', sec: {}, pair: null, who: null, off: {}, lab: false, line: null, side: false, plist: 'all' };
  })();
  function rvSave() { try { window.localStorage.setItem(RV_KEY, JSON.stringify({ tab: rv.tab, fs: rv.fs, why: rv.why, open: rv.open, tlv: rv.tlv })); } catch (e) { /* 残せなくても表示はできる */ } }
  /* 結果が変わったら、結果ごとの選択を戻す */
  function rvFresh() { tl.ch = 'main'; rv.sec = {}; rv.pair = null; rv.who = null; rv.off = {}; rv.lab = false; rv.line = null; rv.side = false; rv.plist = 'all'; }

  function pc(i) { return 'var(--p' + (i % 30) + ')'; }
  function dot(i) { return '<span class="dot" style="background:' + pc(i) + '"></span>'; }
  function av(res, i, size, extra) { var c = res.chars[i]; return c ? HK.Icons.html(c.name, i, size, extra) : ''; }
  /* 住人の名前（住人の色） */
  function nmc(res, i) { var c = res.chars[i]; return c ? '<span class="name" style="color:' + pc(i) + '">' + esc(c.name) + '</span>' : ''; }

  /* ---------- 記録の札と段の見た目（担当W3 2026-10-30。表示だけで記録・文は変えない） ----------
     出られない部屋（whiteroom）の記録の li に data-rm（種類）を付け、頭に小さな札（.rmb）を置く。種類は記録の印と本文の形から表示側で決める：
       cond 条件を進めた・満たした出来事（回数の表示「（○○ n/m）」がある、または e.goal）＝緑／lead きっかけの段（e.tag 'きっかけ'）＝薄い橙／
       door 扉が開いた区切りの行＝藍／end 結末の段＝藍の灰／rule 最初の扉の紙＝藍の灰／note 順番待ちで数えなかった注記＝黄（札だけ）。
       まとめて進んだ回のダイジェスト（本文の最後の段）は灰青の囲み（.evdg）と「まとめて n 回」の見出し。
     重要な出来事の枠（data-hot：情事・目標など）が付いた行は、その枠と背景のまま札だけ足す（R18 の色付き・目標の色とぶつけない）。
     色の量「フル」は種類の色の薄い背景と左の縁 3px、単色・キャラ色は藍の左の線の種類（実線・破線・二重・点線）と面の色 --bg1。印刷は背景を消して線と札だけ。
     段の見た目（全箱庭）：長い文の段落（HK.fmtLong の空行）を段にして間を空け、名前「…」だけの段は左に細い線を引いて地の文と分ける */
  var RM_CSS =
    ':root{--rm-cond:#2F9E44;--rm-dg:#5C7CA3;--rm-lead:#D9822B;--rm-door:#364FC7;--rm-end:#16233B;--rm-note:#B38600;--rm-mix:8%;--rm-chip:12%}' +
    ':root[data-theme="gray"]{--rm-cond:#2B8A3E;--rm-dg:#4F6D93;--rm-lead:#C2701F;--rm-door:#2F44AD;--rm-note:#946F00;--rm-mix:11%;--rm-chip:16%}' +
    '@media (prefers-color-scheme: dark){:root:not([data-theme="light"],[data-theme="gray"]){--rm-cond:#69DB7C;--rm-dg:#A5B8D8;--rm-lead:#FFB46B;--rm-door:#91A7FF;--rm-end:#BAC4DA;--rm-note:#FFD43B;--rm-mix:13%;--rm-chip:20%}}' +
    ':root[data-theme="dark"]{--rm-cond:#69DB7C;--rm-dg:#A5B8D8;--rm-lead:#FFB46B;--rm-door:#91A7FF;--rm-end:#BAC4DA;--rm-note:#FFD43B;--rm-mix:13%;--rm-chip:20%}' +
    ':root:not([data-palette="full"]){--rm-cond:var(--ai);--rm-dg:var(--ai);--rm-lead:var(--ai);--rm-door:var(--ai);--rm-end:var(--ai);--rm-note:var(--ai)}' +
    '[data-k="cond"],[data-rm="cond"]{--rk:var(--rm-cond)}[data-k="dg"]{--rk:var(--rm-dg)}[data-k="lead"],[data-rm="lead"]{--rk:var(--rm-lead)}[data-k="door"],[data-rm="door"]{--rk:var(--rm-door)}' +
    '[data-k="end"],[data-rm="end"],[data-k="rule"],[data-rm="rule"]{--rk:var(--rm-end)}[data-k="note"],[data-rm="note"]{--rk:var(--rm-note)}' +
    /* 殺し（2026-10-31 担当KR）：誰かを殺す（全年齢は気絶させる）条件の出来事。理由の頭「［殺し合い］」などから。赤（単色・キャラ色は藍の太い線） */
    ':root{--rm-kill:#C92A2A}:root[data-theme="gray"]{--rm-kill:#B02525}@media (prefers-color-scheme: dark){:root:not([data-theme="light"],[data-theme="gray"]){--rm-kill:#FF8787}}:root[data-theme="dark"]{--rm-kill:#FF8787}' +
    ':root:not([data-palette="full"]){--rm-kill:var(--ai)}[data-k="kill"],[data-rm="kill"]{--rk:var(--rm-kill)}' +
    ':root:not([data-palette="full"]) .tl .stepblk ol>.ev[data-rm="kill"]:not([data-hot]){--hbl:3px;border-left-width:3px}' +
    /* 札：Mono 10px の小さな四角（ほかの札 .goalb・.markb と同じ寸法）。文字は種類の色を藍に寄せて 4.5:1 以上に */
    '.rmb{--rk-ink:var(--ink);display:inline-block;font-family:var(--f-num);font-size:10px;font-weight:600;letter-spacing:.08em;line-height:1.6;padding:0 6px;margin-right:6px;vertical-align:2px;border:1px solid var(--rk,var(--ink));border-radius:2px;color:var(--rk-ink);background:var(--paper);white-space:nowrap}' +
    '.rmb[data-k="note"]{border-style:dashed}' +
    /* 行の囲み（重要の枠の無い行）：左の点は枠の分だけ戻す（index.html の data-hot と同じ計算） */
    '.tl .stepblk ol>.ev[data-rm]:not([data-hot]){--hbl:2px;border-left:2px solid var(--rk);border-radius:4px;padding:6px 10px;margin-left:calc(-1 * var(--hfx));background:var(--bg1)}' +
    '.tl .stepblk ol>.ev[data-rm]:not([data-hot])::before{left:calc(-1 * var(--rail) - 4px + var(--hfx) - var(--hbl));top:14px}' +
    '.tl .stepblk ol>.ev[data-rm]:not([data-hot]).hot::before{left:calc(-1 * var(--rail) - 6px + var(--hfx) - var(--hbl));top:12px}' +
    ':root:not([data-palette="full"]) .tl .stepblk ol>.ev[data-rm="lead"]:not([data-hot]){border-left-style:dashed}' +
    ':root:not([data-palette="full"]) .tl .stepblk ol>.ev[data-rm="door"]:not([data-hot]){--hbl:3px;border-left:3px double var(--ink)}' +
    ':root:not([data-palette="full"]) .tl .stepblk ol>.ev[data-rm="note"]:not([data-hot]){border-left-style:dotted}' +
    ':root:not([data-palette="full"]) .tl .stepblk ol>.ev[data-rm="rule"]:not([data-hot]){border-left-color:var(--line2);background:none}' +
    ':root[data-palette="full"] .tl .stepblk ol>.ev[data-rm]:not([data-hot]){--hbl:3px;border-left-width:3px}' +
    ':root[data-palette="full"] .tl .stepblk ol>.ev[data-rm="note"]:not([data-hot]),:root[data-palette="full"] .tl .stepblk ol>.ev[data-rm="rule"]:not([data-hot]){--hbl:2px;border-left-width:2px;background:none}' +
    /* 区切りの行（扉が開いた・扉の紙）は、ふだんの灰色の小さな字ではなく本文の色で */
    '.tl .ev.phase[data-rm="door"],.tl .ev.phase[data-rm="rule"]{color:var(--ink);font-size:14px}.tl .ev.phase[data-rm="door"] .evb{font-weight:600}' +
    /* まとめて進んだ回のダイジェスト：本文の最後の段を灰青の囲みに */
    '.ev .evdg{margin-top:.7em;padding:4px 10px 6px;border-left:2px dotted var(--rm-dg);border-radius:0 4px 4px 0;background:var(--accent-soft);font-size:13.5px}' +
    '.ev .evdg::before{content:attr(data-dg);display:block;font-family:var(--f-num);font-size:10px;font-weight:600;letter-spacing:.08em;line-height:1.8;color:var(--muted2)}' +
    ':root[data-palette="full"] .ev .evdg{border-left-style:solid}' +
    /* 段の見た目（全箱庭）：行間を少し広く、段落の間を空け、台詞だけの段は左に細い線 */
    '.tl .ev .evb{line-height:1.8}.tl .stepblk ol{gap:12px}' +
    '.ev .evp{display:block}.ev .evp+.evp{margin-top:.6em}' +
    '.ev .evq{padding-left:10px;border-left:2px solid var(--line2)}' +
    '.tl .stepblk+.stepblk{border-top:1px dashed var(--line)}' +
    /* 見出しの凡例（出られない部屋の札） */
    'h2.sec .rmleg{margin-left:10px}.rmleg .rmb{margin-right:0;vertical-align:0}' +
    '@supports (color: color-mix(in srgb, red 50%, blue)){' +
      '.rmb{--rk-ink:color-mix(in srgb,var(--rk,var(--ink)) 62%,var(--ink));background:color-mix(in srgb,var(--rk,var(--ink)) var(--rm-chip),var(--paper))}' +
      ':root[data-palette="full"] .tl .stepblk ol>.ev[data-rm]:not([data-hot]):not([data-rm="note"]):not([data-rm="rule"]){background:color-mix(in srgb,var(--rk) var(--rm-mix),var(--paper))}' +
      ':root[data-palette="full"] .ev .evdg{background:color-mix(in srgb,var(--rm-dg) 10%,transparent)}' +
      ':root[data-palette="full"] .ev .evdg::before{color:color-mix(in srgb,var(--rm-dg) 62%,var(--ink))}' +
      '.roomcnt.rcsh[style*="--rp"]{background:linear-gradient(90deg,color-mix(in srgb,var(--rm-cond) 26%,var(--paper)) var(--rp),var(--accent-soft) var(--rp))}' +
    '}' +
    '@media print{.tl .stepblk ol>.ev[data-rm]:not([data-hot]),.ev .evdg,.rmb{background:none!important}.roomcnt[style*="--rp"]{background:none!important;border:1px solid #A3A9B3}}';
  var RM_DOOR = /^条件を満たしたので扉が開いた/, RM_WAIT = /数えなかった|数えてもらえない|あとから数える/;
  var RM_NAME = { cond: '条件', lead: 'きっかけ', door: '脱出', end: '結末', rule: '部屋の条件', note: '注意', dg: 'まとめて', kill: '殺し' };
  /* 殺しの種類（room-kill.js の理由の頭「［殺し合い］」など）。全年齢は「気絶」の札 */
  var RM_KILL = /^［(抜け駆け|殺し合い|つかみ合い|相打ち|庇い死|乱闘|返り討ち|復讐|踏みとどまり)］/;
  function rmKillName() { return HK.SAFE_ON ? '気絶' : RM_NAME.kill; }
  /* 回数の表示「（○○ n/m）」から条件の名前を取る（組の頭「A×Bの」・三人の「：A×B」は落とす） */
  function rmNoun(tag) {
    var m = /^（(.*?) ?\d+\/\d+/.exec(tag), s = m ? m[1] : '';
    if (s.indexOf('：') >= 0) s = s.split('：')[0];
    else s = s.replace(/^.+?×.+?の/, '');
    return s.trim();
  }
  /* 記録の行の種類と札（出られない部屋だけ。ほかの箱庭は null） */
  function rmInfo(e, res, inEnd) {
    if (!res || res.scenId !== 'whiteroom' || !e || e.kind === 'step') return null;
    var t = String(e.text || ''), I = { k: '', chips: [], dg: '' }, seen = {};
    function chip(k, s) { if (!seen[s]) { seen[s] = 1; I.chips.push([k, s]); } }
    if (inEnd) { I.k = 'end'; chip('end', RM_NAME.end); return I; }
    if (e.kind === 'phase') {
      if (RM_DOOR.test(t)) { I.k = 'door'; chip('door', RM_NAME.door); }
      else if (e.n === 1 && /扉/.test(t)) { I.k = 'rule'; chip('rule', RM_NAME.rule); }
      return I.k ? I : null;
    }
    if (e.tag === 'きっかけ') { I.k = 'lead'; chip('lead', RM_NAME.lead); }
    var km = RM_KILL.exec(String(e.why || ''));
    if (km) { I.k = I.k || 'kill'; chip('kill', rmKillName() + '：' + km[1]); }
    var tags = t.match(ROOMCNT_RE) || [];
    tags.forEach(function (tag) {
      var n = rmNoun(tag), d = /・まとめて(\d+[^（）<>・]{0,3})/.exec(tag);
      if (n && !e.goal) chip('cond', RM_NAME.cond + '：' + n);
      if (d && !I.dg) I.dg = RM_NAME.dg + d[1].replace(/）$/, '');
    });
    if (RM_WAIT.test(t)) chip('note', RM_NAME.note + '：まだ数えない');
    if (!I.k && (tags.length || e.goal || e.goalExit)) I.k = 'cond';
    if (!I.k && RM_WAIT.test(t)) I.k = 'note';
    return I.k || I.chips.length ? I : null;
  }
  /* 本文の段（HK.fmtLong・山場の空行）を段落の箱にする。dg：最後の段をまとめての囲みにするときの見出し */
  function paraWrap(body, dg) {
    var ps = body.split(/(?:<br>\s*){2,}/);
    if (ps.length < 2) return { html: body, dg: false };
    return { dg: !!dg, html: ps.map(function (p, i) {
      if (dg && i === ps.length - 1) return '<span class="evp evdg" data-dg="' + esc(dg) + '">' + p + '</span>';
      var plain = p.replace(/<[^>]+>/g, '').trim();
      return '<span class="evp' + (/^[^「」。、！？\s]{0,24}「[\s\S]*」$/.test(plain) ? ' evq' : '') + '">' + p + '</span>';
    }).join('') };
  }

  /* 出られない部屋の回数の表示（scenario-room.js の cntTag「（誰と誰のエッチ 10/100・まとめて5回）」、飲む・お題の「（媚薬 3/10本）」、三人の「（三人で：A×B 3/10・…）」）を、
     太字・強調色・少し大きめで目立たせる（表示だけで記録は変えない。履歴・保存から開いた記録も同じ。「まだ数えない」などの注記は数字が無いので当たらない。HK.fmtLong が語と数字のあいだの空白を詰めることがあるので、空白は無くてもよい。2026-10-29 担当RD） */
  var ROOMCNT_RE = /（[^（）<>]{1,40}? ?\d+\/\d+(?:[本杯錠回個つ人秒]|ml)?(?:・まとめて\d+[^（）<>・]{1,3})?(?:・[^（）<>]{1,30}? ?\d+\/\d+(?:[本杯錠回個つ人秒]|ml)?)*）/g;
  /* 数字の札の地に、進み具合（最初の「n/m」の割合）を薄い帯で敷く（--rp。2026-10-30 担当W3） */
  function roomCnt(t, res) {
    if (!res || res.scenId !== 'whiteroom') return t;
    return t.replace(ROOMCNT_RE, function (m) {
      var x = /(\d+)\/(\d+)/.exec(m), p = x && +x[2] ? Math.max(0, Math.min(100, Math.round(+x[1] / +x[2] * 100))) : -1;
      /* 短い札（組の分が一つ）は途中で折り返さない。三人の分などの長い札は文の中で折り返す */
      return '<span class="roomcnt' + (m.length <= 24 ? ' rcsh' : '') + '"' + (p >= 0 ? ' style="--rp:' + p + '%"' : '') + '>' + m + '</span>';
    });
  }
  if (typeof document !== 'undefined' && document.head && !document.getElementById('hk-roomcnt')) {
    var rcs = document.createElement('style'); rcs.id = 'hk-roomcnt';
    rcs.textContent = '.roomcnt.rcsh{display:inline-block;max-width:100%}.roomcnt{font-weight:700;color:var(--accent);font-size:1.08em;background:var(--accent-soft);border-radius:4px;padding:0 .2em;margin:0 .1em}' + RM_CSS;
    document.head.appendChild(rcs);
  }

  /* 本文中のキャラ名に色をつける */
  function paint(text, res, seg) {
    /* 山場の長い描写は段落（改行）で区切ってある。長い文は段落と台詞で改行する（HK.fmtLong。記録の seg があれば台詞の塊を seg から取る） */
    var list = res.chars.map(function (c) { return { n: esc(c.name), i: c.i }; }).sort(function (a, b) { return b.n.length - a.n.length; });
    var t = roomCnt(esc(HK.fmtLong ? HK.fmtLong(text, res.chars.map(function (c) { return c.name; }), seg) : text).replace(/\n/g, '<br>'), res);
    if (!list.length) return t;
    var re = new RegExp(list.map(function (x) { return x.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
    return t.replace(re, function (m) {
      for (var k = 0; k < list.length; k++) if (list[k].n === m) return '<span class="name" style="color:' + pc(list[k].i) + '">' + m + '</span>';
      return m;
    });
  }

  function fateCls(f) {
    if (/死亡|ゾンビ|心中/.test(f)) return 'dead';
    if (/脱出|救助|優勝|生還|帰った|お持ち帰り|進級|卒業|生き延びた/.test(f)) return 'ok';
    return 'mid';
  }

  /* ---------- 重要な出来事（転機・情事・死亡。--hot の赤で示す。表示だけで記録は変えない） ---------- */
  /* ターン番号（区切りの通し番号。T01〜） */
  function tno(step) { return step == null || isNaN(step) ? '' : 'T' + (step < 9 ? '0' : '') + (step + 1); }
  /* 組の転機：決め手（p.key）のうち、関係の節目の札（付き合い始めた・別れたなど）のある出来事、なければ動きの大きい出来事。他人のまま・変化なしの組は持たない */
  function turnOf(p, res) {
    if (!p.key || !p.key.length || p.label === 'strangers' || p.cls === 'none') return null;
    var best = null, bs = -1;
    p.key.forEach(function (n) {
      var e = res.log[n];
      if (!e) return;
      var sc = (e.mark && e.mark.length ? 1000 : 0) + Math.abs(e.mag || 0);
      if (sc > bs) { bs = sc; best = n; }
    });
    return best;
  }
  /* 結果ごとに一度だけ数える：組ごとの転機（tp）と、全体でいちばん大きい転機（top） */
  var hotMemo = typeof WeakMap === 'function' ? new WeakMap() : null;
  function hotInfo(res) {
    var H = hotMemo && hotMemo.get(res);
    if (H) return H;
    H = { tp: {}, top: null };
    var bs = -1;
    res.pairs.forEach(function (p) {
      var n = turnOf(p, res);
      if (n == null) return;
      H.tp[n] = 1;
      var e = res.log[n], sc = (e.mark && e.mark.length ? 1000 : 0) + Math.abs(e.mag || 0);
      if (sc > bs || (sc === bs && n < H.top)) { bs = sc; H.top = n; }
    });
    if (hotMemo) hotMemo.set(res, H);
    return H;
  }
  /* 情事（エロシーン）は R18 版で全年齢モードでないときだけ */
  function lewdHot(e) { return !HK.SAFE_ON && !!HK.lewdEvent && HK.lewdEvent(e); }
  function isHot(e, H) { if (e && e.ch) return false; return e.kind === 'death' || !!(e.mark && e.mark.length) || !!H.tp[e.n] || lewdHot(e); }
  /* 重要な出来事の種類（担当HZ 2026-10-28。表示だけ）：死亡＞情事＞転機＞目標＞トラブル の順で一つに決める。li に hot-○○ と data-hot を付け、
     index.html の時系列の節が細い枠（単色・キャラ色は線の種類、フルは種類ごとの薄い背景と左の縁）を描く。.hot（赤の点・太字）は今までどおり 死亡・情事・転機 だけ */
  var HOT_ORDER = ['death', 'lewd', 'turn', 'goal', 'trouble'];
  var HOT_NAME = { death: '死亡', turn: '転機', goal: '目標', trouble: 'トラブル' };
  var HOT_TIP = { death: '死亡・全滅・陥落', turn: '組の転機・関係の節目（付き合い始めた・別れた など）', goal: '条件達成・扉が開いた・脱出・勝利など、箱庭の目標', trouble: '襲撃・故障・危機などの大きなトラブル' };
  /* r18:begin */
  HOT_NAME.lewd = '情事'; HOT_TIP.lewd = '情事（R18 の場面）';
  /* r18:end */
  var HOT_GOAL = /脱出|抜け出|救(?:っ|い|出|助)|成功|勝利|撃破|討伐|踏破|生還|帰還|達成|優勝|解決|判明|手がかり|真相|回避/;
  var HOT_DEATH = /^(?:死|全滅|弔い|処刑|殉|最期|陥落|発狂)/;
  function hotKind(e, H) {
    if (!e || e.kind === 'step' || e.kind === 'phase' || e.ch) return '';
    if (e.kind === 'death') return 'death';
    if (lewdHot(e)) return 'lewd';
    if ((e.mark && e.mark.length) || H.tp[e.n]) return 'turn';
    if (e.goal || e.goalExit || (e.cat === 'escape' && (e.mag || 0) >= 40)) return 'goal';
    if (e.trouble || (e.cat === 'combat' && Math.abs(e.mag || 0) >= 25)) return 'trouble';
    return '';
  }
  /* ひとり用の記録（dungeon-view.js の #dgtl・solo-story-kit.js の #sttl）：決め手（key）・山場（climax）・死・トラブルの印のある出来事だけ */
  V.hotKindSolo = function (e, res) {
    if (!e || e.kind === 'step' || e.kind === 'phase') return '';
    var tag = String(e.tag || ''), dead = HOT_DEATH.test(tag);
    if (!(e.key || e.kind === 'climax' || e.trouble || dead)) return '';
    if (dead) return 'death';
    if (lewdHot(e)) return 'lewd';
    var why = '';
    if (e.key && res && res.turns) res.turns.forEach(function (t) { if (t.n === e.n) why += t.why || ''; });
    if (HOT_GOAL.test(tag + ' ' + why)) return 'goal';
    if (e.trouble) return 'trouble';
    return 'turn';
  };
  /* 時系列の見出しの凡例：その結果に出る種類だけ。フルは色の小さな四角、単色・キャラ色は線の種類の見本（index.html の .hotleg .hk） */
  function hotLegendOf(seen) {
    var ks = HOT_ORDER.filter(function (k) { return seen[k] && HOT_NAME[k]; });
    if (!ks.length) return '';
    return '<span class="hotleg" role="note" aria-label="重要な出来事の見分け方"><span class="hkl">重要</span>' + ks.map(function (k) {
      return '<span class="hk" data-hot="' + k + '" title="' + esc(HOT_TIP[k]) + '"><i aria-hidden="true"></i>' + esc(HOT_NAME[k]) + '</span>';
    }).join('') + '</span>';
  }
  V.hotLegendSolo = function (res) {
    var seen = {};
    (res && res.log || []).forEach(function (e) { var k = V.hotKindSolo(e, res); if (k) seen[k] = 1; });
    return hotLegendOf(seen);
  };

  /* ---------- 関係図 ---------- */
  /* 文字幅の目安（全角=1、半角=0.55） */
  function tw(str, px) { var w = 0; for (var i = 0; i < str.length; i++) w += str.charCodeAt(i) < 256 ? 0.58 : 1; return w * px; }
  function overlap(a, b) {
    var x = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1), y = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    return x > 0 && y > 0 ? x * y : 0;
  }
  /* 住人を楕円に並べる。人数に応じて図を広げ、名前と結末の文字が隣と重ならない間隔をとる */
  function mapLayout(n, big) {
    var NR = big ? 16 : 26, below = big ? 44 : 64, lw = big ? 74 : 100;
    var rx, ry;
    if (n <= 2) { rx = 150; ry = 0; }
    else if (n === 3) { rx = 190; ry = 120; }
    else { rx = Math.max(big ? 360 : 235, n * (big ? 13.5 : 22)); ry = Math.max(big ? 250 : 150, n * (big ? 10.5 : 19.5)); }
    var padT = NR + 16, padB = below + 14, padX = lw / 2 + 16;
    var W = Math.max(big ? 860 : 640, 2 * rx + 2 * padX), H = 2 * ry + padT + padB;
    var cx = W / 2, cy = padT + ry;
    var pos = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i / n) * Math.PI * 2 + (n === 2 ? Math.PI / 2 : 0);
      pos.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return { W: W, H: H, NR: NR, below: below, lw: lw, pos: pos };
  }
  function qpt(p0, c, p1, t) { var u = 1 - t; return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y }; }
  /* 線がほかの住人の丸や名前の上を通るとき、少し曲げて避ける */
  function route(A, B, L, ia, ib, boxes) {
    var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    function clear(c) {
      var worst = 1e9;
      for (var k = 1; k < 20; k++) {
        var p = qpt(A, c, B, k / 20);
        for (var j = 0; j < boxes.length; j++) {
          if (j === ia || j === ib) continue;
          var bx = boxes[j], ex = Math.max(bx.x1 - p.x, 0, p.x - bx.x2), ey = Math.max(bx.y1 - p.y, 0, p.y - bx.y2);
          var d = Math.sqrt(ex * ex + ey * ey);
          if (d < worst) worst = d;
        }
      }
      return worst;
    }
    var best = { x: mx, y: my }, bv = clear(best);
    if (bv >= 6) return best;
    [34, -34, 60, -60, 90, -90].forEach(function (o) {
      if (bv >= 6) return;
      var c = { x: mx + nx * o, y: my + ny * o }, v = clear(c);
      if (v > bv + 2) { bv = v; best = c; }
    });
    return best;
  }
  /* 関係図の時点（最終／開始時／転機。view-map.js の HK.MapView.atRes）：その時点の結果。最終・時点の記録がない結果はそのまま */
  function atOf(res) { return HK.MapView && HK.MapView.atRes ? HK.MapView.atRes(res) : res; }
  function mapSvg(res) {
    res = atOf(res);
    /* 派閥の囲み・線の絞り込み・間引き（view-map.js）。なければ従来どおり楕円に並べる */
    var MV = HK.MapView;
    /* 絞り込み（全員／派閥ごと／個人ごと）：絞った人だけの結果 R で描き、丸の番号・色は元の番号（orig）に戻す */
    var sub = MV && MV.subset ? MV.subset(res) : null, R = sub ? MV.subRes(res, sub) : res;
    var orig = function (k) { return sub ? sub[k] : k; };
    var n = R.chars.length, big = n > 12;
    var focus = tl.who.length === 1 ? (sub ? (sub.indexOf(tl.who[0]) < 0 ? null : sub.indexOf(tl.who[0])) : tl.who[0]) : null;
    var LY = MV ? MV.layout(R, big, mapLayout) : mapLayout(n, big), W = LY.W, H = LY.H, NR = LY.NR, pos = LY.pos;
    var defs = '<defs>' + Object.keys(CLS_VAR).map(function (k) {
      return '<marker id="ar-' + k + '" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M1.5,1.5 L9,5 L1.5,8.5" fill="none" style="stroke:var(' + CLS_VAR[k] + ');stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker>';
    }).join('') + '</defs>';
    /* 住人の丸と、その下の名前・結末の文字が占める範囲 */
    var nameFs = big ? 11 : 13, fateFs = big ? 9 : 11;
    var shortName = function (c) { return c.name.length > (big ? 6 : 8) ? c.name.slice(0, big ? 6 : 8) + '…' : c.name; };
    var boxes = R.chars.map(function (c, i) {
      var P = pos[i], w = Math.max(NR * 2 + 4, tw(shortName(c), nameFs), tw(c.fate || '', fateFs)) + 6;
      return { x1: P.x - w / 2, x2: P.x + w / 2, y1: P.y - NR - 3, y2: P.y + LY.below - 2 };
    });
    var edges = '', labels = '', placed = (LY.taken || []).slice(), xmarks = [];
    var pairs = R.pairs.filter(function (p) { return p.label !== 'strangers'; });
    var faint = [];
    if (MV) { var pk = MV.pick(R, pairs, focus, big, LY); pairs = pk.draw.concat(pk.faint); faint = pk.faint; }
    else if (big) {
      /* 大人数では、強い関係と意外な関係だけを描く（選択中の人物の線は全部） */
      pairs = pairs.filter(function (p) { return p.cls !== 'friend' && p.cls !== 'none' && p.label !== 'awkward' || p.surprise || (focus != null && (p.a === focus || p.b === focus)); })
        .sort(function (a, b) { return (b.surprise - a.surprise) || (b.intensity - a.intensity); });
      var keep = pairs.slice(0, 70);
      if (focus != null) pairs.forEach(function (p) { if ((p.a === focus || p.b === focus) && keep.indexOf(p) < 0) keep.push(p); });
      pairs = keep;
    }
    /* 強い関係から先にラベルの場所を取る（薄い点線は最後に） */
    pairs = pairs.slice().sort(function (a, b) { return ((faint.indexOf(a) >= 0) - (faint.indexOf(b) >= 0)) || (b.surprise - a.surprise) || (b.intensity - a.intensity); });
    var labSkip = 0;
    var labFs = big ? 11 : 12;
    var linePts = [];
    mapCnt = {};
    pairs.forEach(function (p, ei) {
      var fromI = p.a, toI = p.b;
      if (p.dir != null && p.dir === p.b) { fromI = p.b; toI = p.a; }
      /* 線の種類（右の「表示する線」で隠す）と、押したときの二人（元の番号） */
      var kg = KGRP[p.cls] || 'none', oa = orig(p.a), ob = orig(p.b);
      var hitA = ' data-k="' + kg + '" data-act="mapline" data-a="' + oa + '" data-b="' + ob + '"';
      var selL = rv.line && ((rv.line.a === oa && rv.line.b === ob) || (rv.line.a === ob && rv.line.b === oa));
      var from = pos[fromI], to = pos[toI];
      var c = route(from, to, LY, fromI, toI, boxes);
      /* 丸の縁から縁まで（曲げた線は、制御点の方向で縁を決める） */
      var R = NR + 3;
      /* 下向きに出る線は、自分の名前・結末の文字の下から出す */
      function edgePt(P, Q, r, bx) {
        var dx = Q.x - P.x, dy = Q.y - P.y, l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, d = r;
        if (uy > 0.15) {
          var tx = ux > 0 ? (bx.x2 - P.x) / ux : ux < 0 ? (bx.x1 - P.x) / ux : 1e9, ty = (bx.y2 - P.y) / uy;
          d = Math.max(r, Math.min(tx, ty) + 2);
        }
        return { x: P.x + ux * d, y: P.y + uy * d };
      }
      var s0 = edgePt(from, c, R, boxes[fromI]), s1 = edgePt(to, c, R + 3, boxes[toI]);
      for (var lk = 1; lk < 24; lk++) { var lp = qpt(s0, c, s1, lk / 24); lp.e = ei; linePts.push(lp); }
      var faded = focus != null && p.a !== focus && p.b !== focus;
      /* 間引いた線は、細い点線だけ（ラベル・矢印なし） */
      if (faint.indexOf(p) >= 0) { edges += '<path d="M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' Q' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ' ' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1) + '" fill="none" class="efaint" data-k="' + kg + '" style="stroke:var(' + CLS_VAR[p.cls] + ');stroke-width:1;opacity:' + (faded ? 0.08 : 0.32) + '" stroke-dasharray="2 4"/>'; return; }
      var wdt = LINE_W[p.cls] || 1.2, dash = LINE_DASH[p.cls];
      var col = 'var(' + CLS_VAR[p.cls] + ')';
      var straight = Math.abs(c.x - (from.x + to.x) / 2) < 0.5 && Math.abs(c.y - (from.y + to.y) / 2) < 0.5;
      var d = straight ? 'M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' L' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1)
        : 'M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' Q' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ' ' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1);
      mapCnt[kg] = (mapCnt[kg] || 0) + 1;
      /* 押しやすいように、透明の太い線を下に敷く（押すと右に二人の説明。選んだ線は太く） */
      edges += '<path d="' + d + '" fill="none" class="rlhit"' + hitA + ' style="stroke:transparent;stroke-width:12;pointer-events:stroke;cursor:pointer"/>';
      edges += '<path d="' + d + '" fill="none" class="rl ' + p.cls + (selL ? ' sel' : '') + '"' + hitA + ' style="stroke:' + col + ';stroke-width:' + wdt + ';opacity:' + (faded ? 0.15 : 0.9) + ';cursor:pointer"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + (p.dir != null ? ' marker-end="url(#ar-' + p.cls + ')"' : '') + '/>';
      /* 殺害：線の中ほどに × */
      if (p.cls === 'kill') {
        var xm = qpt(s0, c, s1, 0.5);
        edges += '<path d="M' + (xm.x - 5).toFixed(1) + ',' + (xm.y - 5).toFixed(1) + ' L' + (xm.x + 5).toFixed(1) + ',' + (xm.y + 5).toFixed(1) + ' M' + (xm.x + 5).toFixed(1) + ',' + (xm.y - 5).toFixed(1) + ' L' + (xm.x - 5).toFixed(1) + ',' + (xm.y + 5).toFixed(1) + '" fill="none" class="rx" data-k="' + kg + '" style="stroke:' + col + ';stroke-width:2.2;stroke-linecap:round;opacity:' + (faded ? 0.15 : 1) + '"/>';
        xmarks.push({ x1: xm.x - 7, x2: xm.x + 7, y1: xm.y - 7, y2: xm.y + 7 });
      }
      /* 線の名前：既定では友人などの弱い線の名前は出さない（右の「線の名前を全部出す」で全部。選んだ人・選んだ線の名前は出す） */
      if (!rv.lab && (p.cls === 'friend' || p.cls === 'none') && !selL && !(focus != null && (p.a === focus || p.b === focus))) return;
      /* ラベル：線の上で、丸・名前・ほかのラベルと重ならない場所を探す */
      var txt = p.name + (p.surprise ? '＊' : ''), lw = tw(txt, labFs) + 8, lh = labFs + 6;
      var best = null, bo = 1e9, shortEdge = Math.sqrt(Math.pow(s1.x - s0.x, 2) + Math.pow(s1.y - s0.y, 2)) < lw + 18;
      [0.5, 0.42, 0.58, 0.34, 0.66, 0.27, 0.73, 0.2, 0.8].some(function (t) {
        var q = qpt(s0, c, s1, t);
        var shifts = shortEdge ? [[lw / 2 + 7, 0], [-lw / 2 - 7, 0], [0, 0]] : [[0, 0], [0, lh * 0.9], [0, -lh * 0.9], [lw / 2 + 5, 0], [-lw / 2 - 5, 0]];
        for (var si = 0; si < shifts.length; si++) {
          var ox = shifts[si][0], oy = shifts[si][1];
          var bx = { x1: q.x - lw / 2 + ox, x2: q.x + lw / 2 + ox, y1: q.y - lh / 2 + oy, y2: q.y + lh / 2 + oy, cx: q.x + ox, cy: q.y + oy };
          var ov = 0;
          boxes.forEach(function (o) { ov += overlap(bx, o) * 3; });
          placed.forEach(function (o) { ov += overlap(bx, o) * 2; });
          xmarks.forEach(function (o) { ov += overlap(bx, o) * 2; });
          linePts.forEach(function (q2) { if (q2.e !== ei && q2.x > bx.x1 && q2.x < bx.x2 && q2.y > bx.y1 && q2.y < bx.y2) ov += 25; });
          if (bx.x1 < 2 || bx.x2 > W - 2 || bx.y1 < 2 || bx.y2 > H - 2) ov += 500;
          ov += si && !shortEdge ? 4 : 0;
          if (ov < bo) { bo = ov; best = bx; }
          if (ov === 0) return true;
        }
        return false;
      });
      /* ほかのラベルとどうしても重なるときは、弱いほうのラベルを省く（線は残す） */
      if (MV && !rv.lab && placed.some(function (o) { return overlap(best, o) > 0; })) { labSkip++; return; }
      placed.push(best);
      labels += '<text x="' + best.cx.toFixed(1) + '" y="' + (best.cy + labFs * 0.36).toFixed(1) + '" text-anchor="middle" class="elab' + (selL ? ' sel' : '') + '"' + hitA + ' style="fill:' + col + ';opacity:' + (faded ? 0.2 : 1) + ';cursor:pointer">' + esc(txt) + '</text>';
    });
    var st8 = nodeStates(res);
    var nodes = R.chars.map(function (c, k) {
      var P = pos[k], i = orig(k), ns = st8[i] || '', dead = ns === 'gone';
      var sel = tl.who.indexOf(i) >= 0;
      var sw = sel ? (big ? 4 : 5) : ns === 'bold' ? (big ? 2.5 : 3) : (big ? 1.3 : 1.5);
      return '<g class="node' + (ns ? ' ' + ns : '') + '" data-act="node" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(c.name) + 'の経過を絞り込む' + (ns === 'gone' ? '（死亡）' : ns === 'dash' ? '（離脱）' : '') + '" style="cursor:pointer">' +
        '<circle cx="' + P.x.toFixed(1) + '" cy="' + P.y.toFixed(1) + '" r="' + NR + '" class="nodebg" style="--c:' + pc(i) + ';stroke:' + pc(i) + ';stroke-width:' + sw + ';opacity:' + (dead ? 0.45 : 1) + '"' + (ns === 'dash' ? ' stroke-dasharray="4 3"' : '') + '/>' +
        (HK.Icons.url(c.name) ? '<g style="opacity:' + (dead ? 0.45 : 1) + (dead ? ';filter:grayscale(1)' : '') + '">' + HK.Icons.svg(c.name, i, P.x, P.y, NR - 1.5, i) + '</g>' :
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + (big ? 4 : 6)).toFixed(1) + '" text-anchor="middle" style="fill:' + pc(i) + ';font-weight:700;font-size:' + (big ? 12 : 17) + 'px;opacity:' + (dead ? 0.45 : 1) + '">' + esc(HK.Icons.initial(c.name)) + '</text>') +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + (big ? 13 : 19)).toFixed(1) + '" text-anchor="middle" class="nlab" style="fill:var(--ink);font-size:' + nameFs + 'px;font-weight:600">' + esc(shortName(c)) + '</text>' +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + (big ? 25 : 35)).toFixed(1) + '" text-anchor="middle" class="nlab" style="fill:var(--muted);font-size:' + fateFs + 'px">' + esc(c.fate) + '</text></g>';
    }).join('');
    var out = '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" role="img" aria-label="関係図"><style>.nodebg{fill:var(--surface);fill:color-mix(in srgb,var(--c) 16%,var(--surface))}.elab{font-size:' + labFs + 'px;font-weight:700;paint-order:stroke;stroke:var(--sand);stroke-width:4px;stroke-linejoin:round}.nlab{paint-order:stroke;stroke:var(--sand);stroke-width:3.5px;stroke-linejoin:round}</style>' + defs + (LY.under || '') + edges + nodes + labels + (LY.over || '') + '</svg>';
    if (MV) MV.drawn(res, { lines: pairs.length - faint.length, faint: faint.length, labels: placed.length - (LY.taken || []).length, labSkip: labSkip });
    return out;
  }

  /* 住人の丸の状態（元の番号ごと）：gone＝死亡（薄い丸）、dash＝離脱（破線の輪。最後の区切りで場にいない）、bold＝生存して主導（リーダー・派閥の長）。どれでもなければ '' */
  function nodeStates(res) {
    var H = res.history, last = H && H.length ? H[H.length - 1].alive : null, lead = {};
    if (HK.MapView && HK.MapView.groups) HK.MapView.groups(res).forEach(function (g) { lead[g.leader] = 1; });
    return res.chars.map(function (c, i) {
      if (c.alive === false) return 'gone';
      if (last && last[i] === false) return 'dash';
      return c.leader || lead[i] ? 'bold' : '';
    });
  }
  /* 関係図の凡例：この結果にある線の種類だけ（線の形は図と同じ）と、丸の輪の意味 */
  function mapLegend(res) {
    res = atOf(res);
    var has = {};
    res.pairs.forEach(function (p) { if (p.label !== 'strangers') has[p.cls === 'obsess' ? 'love' : p.cls] = 1; });
    var items = LEG.filter(function (x) { return has[x[0]]; }).map(function (x) {
      var k = x[0], w = LINE_W[k], col = 'var(' + CLS_VAR[k] + ')', dash = LINE_DASH[k];
      var ln = '<line x1="1" y1="5" x2="' + (k === 'pine' ? 21 : 25) + '" y2="5" style="stroke:' + col + ';stroke-width:' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
      if (k === 'pine') ln += '<path d="M17,1.5 L22,5 L17,8.5" fill="none" style="stroke:' + col + ';stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round"/>';
      if (k === 'kill') ln += '<path d="M9.5,1.5 L16.5,8.5 M16.5,1.5 L9.5,8.5" fill="none" style="stroke:' + col + ';stroke-width:1.6;stroke-linecap:round"/>';
      return '<span class="leg"><svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">' + ln + '</svg>' + esc(x[1]) + '</span>';
    }).join('');
    var st8 = nodeStates(res), sk = {};
    st8.forEach(function (s) { sk[s] = 1; });
    var ring = [sk.bold ? '太い輪＝生存して主導' : '', sk.dash ? '破線の輪＝離脱' : '', sk.gone ? '薄い丸＝死亡' : ''].filter(Boolean).join(' · ');
    return (items ? '<div class="mapleg">' + items + '</div>' : '') + (ring ? '<span class="mapring">' + ring + '</span>' : '');
  }

  /* view-map.js が使う部品 */
  V._map = { tw: tw, overlap: overlap, pc: pc, fateCls: fateCls, av: av, hot: hotInfo, turnOf: turnOf, tno: tno, legend: mapLegend };

  /* ---------- ペアの推移グラフ ---------- */
  function spark(p, res) {
    var s = p.series.filter(Boolean), n = s.length;
    if (!n) return '';
    var W = 300, H = 54, mid = 27;
    var X = function (i) { return n === 1 ? W / 2 : 4 + i * (W - 8) / (n - 1); };
    var Y = function (v) { return mid - v / 100 * 23; };
    function line(idx, style) {
      return '<polyline fill="none" points="' + s.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v[idx]).toFixed(1); }).join(' ') + '" style="' + style + '"/>';
    }
    var last = s[n - 1];
    /* 転機の印（--hot）：その出来事の区切りの位置に、細い縦線と点 */
    var tk = sparkTurn(p, res), mk = '';
    if (tk) mk = '<line x1="' + X(tk.i).toFixed(1) + '" x2="' + X(tk.i).toFixed(1) + '" y1="2" y2="' + (H - 2) + '" class="sparkhot" style="stroke:var(--hot);stroke-width:1;stroke-dasharray:2 2;vector-effect:non-scaling-stroke"/>' +
      '<circle cx="' + X(tk.i).toFixed(1) + '" cy="' + Y(s[tk.i][0]).toFixed(1) + '" r="3.4" class="sparkhot" style="fill:var(--hot)"/>';
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" x2="' + W + '" y1="' + mid + '" y2="' + mid + '" style="stroke:var(--line);stroke-width:1"/>' +
      line(2, 'stroke:var(--enemy);stroke-width:1.3;stroke-dasharray:3 3;vector-effect:non-scaling-stroke') +
      line(0, 'stroke:' + pc(p.a) + ';stroke-width:2;vector-effect:non-scaling-stroke') +
      line(1, 'stroke:' + pc(p.b) + ';stroke-width:2;vector-effect:non-scaling-stroke') +
      '<circle cx="' + X(n - 1) + '" cy="' + Y(last[0]) + '" r="2.6" style="fill:' + pc(p.a) + '"/>' +
      '<circle cx="' + X(n - 1) + '" cy="' + Y(last[1]) + '" r="2.6" style="fill:' + pc(p.b) + '"/>' + mk + '</svg>';
  }
  /* 組の転機が推移グラフの何点目か（p.series は区切りごとの記録 res.history と同じ並び。空きの点は詰めて描くので数え直す） */
  function sparkTurn(p, res) {
    var n = turnOf(p, res), e = n != null ? res.log[n] : null;
    if (!e || e.step == null) return null;
    var raw = p.series || [], hs = res.history || [], hi = -1;
    for (var k = 0; k < hs.length; k++) if (hs[k] && hs[k].step === e.step) { hi = k; break; }
    if (hi < 0) hi = Math.min(e.step, raw.length - 1);
    if (hi < 0 || !raw[hi]) return null;
    var idx = 0;
    for (var j = 0; j < hi; j++) if (raw[j]) idx++;
    return { i: idx, n: n, e: e };
  }

  function tieName(t, res) {
    var D = HK.TIES[t.type];
    if (!D) return '';
    /* きょうだい：性別・年齢で「姉弟」「兄妹（庇護）」に言い換え、上の人が分かれば「美咲が姉の姉弟（庇護）」（sib-word.js） */
    var sl = HK.Sib ? HK.Sib.resLabel(t, res) : '';
    if (sl) { var el = HK.Sib.resElder(t, res); return el ? el.who.name + 'が' + el.word + 'の' + sl : sl; }
    return D.dir ? res.chars[t.a].name + 'が' + D.roleA + 'の' + D.label : D.label;
  }
  /* 札（組の見出し）に出す関係名 */
  function tieChip(t, res) { return (HK.Sib && HK.Sib.resLabel(t, res)) || t.label; }

  /* ---------- 二人ずつ（見本 13）：左に組の一覧、右に選んだ組のカード（中身は今までの組のカードと同じ：結末の一文・相性予想・根拠・推移・最終の値・決め手の場面） ---------- */
  function pairGroup(p) { return { love: 'love', obsess: 'love', pine: 'love', night: 'love', friend: 'friend', partner: 'friend', guard: 'friend', enemy: 'enemy', kill: 'enemy' }[p.cls] || 'other'; }
  function pairDetail(p, res) {
    if (!p) return '';
    var L = res.log;
    /* 見出しの二人は攻め×受けの順（pair-name.js） */
    var po = HK.pairIdx ? HK.pairIdx(res, p) : [p.a, p.b];
    var tieLabel = p.tie ? tieName(p.tie, res) : '';
    var tp = turnOf(p, res), tk = sparkTurn(p, res);
    var keys = p.key.map(function (n) {
      var e = L[n];
      /* エロシーンは概要だけ（全文は経過で読める） */
      var body = HK.lewdEvent && HK.lewdBrief && HK.lewdEvent(e) ? '<span class="brief">' + esc(HK.lewdBrief(e)) + '</span>' : paint(e.text, res);
      return '<li' + (n === tp ? ' class="hot"' : '') + '><span class="st">' + (tno(e.step) ? '<b class="tn">' + tno(e.step) + '</b>' : '') + esc(e.label) + (n === tp ? '・転機' : '') + '</span>' + body + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</li>';
    }).join('');
    var r = p.rel;
    var vrow = function (x, y, v) { return '<tr><th scope="row">' + nmc(res, x) + '→' + nmc(res, y) + '</th><td>' + v.aff + '</td><td>' + v.trust + '</td><td>' + v.att + '</td><td>' + v.ten + '</td></tr>'; };
    var pred = p.tie ? '<p class="pred">もともと<b>「' + esc(tieLabel) + '」</b>' + (p.surprise ? 'だったのに「' + esc(p.name) + '」に変わった。' : 'の二人。') + '</p>' : '';
    return '<article class="rvcard pcard rvpd' + (p.surprise ? ' sur' : '') + '">' +
      '<div class="hd"><span class="avpair">' + av(res, po[0], 40) + av(res, po[1], 40) + '</span><span class="nm">' + nmc(res, po[0]) + ' × ' + nmc(res, po[1]) + '</span>' + (p.tie ? '<span class="tiechip">' + esc(tieChip(p.tie, res)) + ' →</span>' : '') + '<span class="lbl ' + p.cls + '">' + esc(p.name) + '</span>' + (p.surprise ? '<span class="surtag">意外</span>' : '') + '</div>' +
      '<div class="txt">' + paint(p.text, res) + '</div>' + pred +
      '<div class="rvcmp"><div class="rvcmpb"><span class="k">エゴグラムの相性予想</span><b>' + esc(p.base.kindLabel) + '</b></div><div class="rvcmpb rvres' + (p.surprise ? ' odd' : '') + '"><span class="k">箱庭での結末</span><b>' + esc(p.name) + '</b></div></div>' +
      (p.base.notes.length ? '<h4 class="rvh4">予想の根拠</h4><ul class="rvul">' + p.base.notes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      '<h4 class="rvh4">気持ちの動き</h4>' + spark(p, res) +
      '<div class="sparkleg"><span style="color:' + pc(p.a) + '">― ' + esc(res.chars[p.a].name) + '→' + esc(res.chars[p.b].name) + ' 好意</span><span style="color:' + pc(p.b) + '">― ' + esc(res.chars[p.b].name) + '→' + esc(res.chars[p.a].name) + ' 好意</span><span style="color:var(--enemy)">┄ 緊張</span>' + (tk ? '<span class="sparkhot">● ' + tno(tk.e.step) + ' 転機</span>' : '') + '</div>' +
      '<h4 class="rvh4">最終の値</h4><div class="rvtblw"><table class="rvvals"><thead><tr><th></th><th>好意</th><th>信頼</th><th>惹かれ</th><th>緊張</th></tr></thead><tbody>' + vrow(p.a, p.b, r.ab) + vrow(p.b, p.a, r.ba) + '</tbody></table></div>' +
      (keys ? '<h4 class="rvh4">二人の主な場面</h4><ul class="keys">' + keys + '</ul>' : '') +
      '<div class="rvmore"><button type="button" class="rvlink" data-act="pairfilter" data-a="' + p.a + '" data-b="' + p.b + '">この二人の経過をすべて読む ›</button></div></article>';
  }
  /* 一覧の並び：意外な組を先に、あとは今までどおり（他人のままは数だけ） */
  function pairList(res) {
    return res.pairs.filter(function (p) { return p.surprise; }).concat(res.pairs.filter(function (p) { return !p.surprise && p.label !== 'strangers'; })).slice(0, 400);
  }
  function pairPane(res) {
    var list = pairList(res), strangers = res.pairs.filter(function (p) { return !p.surprise && p.label === 'strangers'; }).length;
    if (!list.length) return '<div class="rvcard rvempty"><p>この回は、どの二人も「他人のまま」でした' + (strangers ? '（' + strangers + '組）' : '') + '。</p></div>';
    var sel = rv.pair != null && res.pairs[rv.pair] && list.indexOf(res.pairs[rv.pair]) >= 0 ? res.pairs[rv.pair] : list[0];
    var cnt = { all: list.length, sur: 0, love: 0, friend: 0, enemy: 0, other: 0 };
    var items = list.map(function (p) {
      var g = pairGroup(p), k = res.pairs.indexOf(p), po = HK.pairIdx ? HK.pairIdx(res, p) : [p.a, p.b];
      cnt[g]++; if (p.surprise) cnt.sur++;
      return '<li data-g="' + g + (p.surprise ? ' sur' : '') + '"><button type="button" class="rvpi" data-act="rvpair" data-p="' + k + '" aria-current="' + (p === sel) + '"><span class="avpair">' + av(res, po[0], 26) + av(res, po[1], 26) + '</span><span class="rvpn">' + esc(res.chars[po[0]].name) + ' × ' + esc(res.chars[po[1]].name) + '</span><span class="rvpr"><span class="rvrel ' + p.cls + '">' + esc(p.name) + '</span>' + (p.surprise ? '<span class="rvodd">意外</span>' : '') + '</span></button></li>';
    }).join('');
    var pills = [['all', 'すべて'], ['sur', '意外'], ['love', '恋愛'], ['friend', '友人・相棒'], ['enemy', '対立']].filter(function (x) { return x[0] === 'all' || cnt[x[0]]; }).map(function (x) {
      return '<button type="button" class="rvpill" data-act="rvplf" data-f="' + x[0] + '" aria-pressed="' + (rv.plist === x[0]) + '">' + x[1] + '<small>' + cnt[x[0]] + '</small></button>';
    }).join('');
    return '<div class="rvgrid rvg-pair"><aside class="rvcard rvlist" aria-label="組の一覧"><div class="rvpills" role="group" aria-label="組の絞り込み">' + pills + '</div><ul class="rvplist" data-f="' + esc(rv.plist) + '">' + items + '</ul>' +
      (strangers ? '<p class="rvfootnote">ほかに「他人のまま」の組が ' + strangers + '組</p>' : '') + '</aside><div class="rvmain" id="rvpairdet">' + pairDetail(sel, res) + '</div></div>';
  }

  function tieNotes(c, res) {
    return res.pairs.filter(function (p) { return p.tie && (p.a === c.i || p.b === c.i); }).map(function (p) {
      var o = res.chars[p.a === c.i ? p.b : p.a];
      return o.name + 'とは、もともと「' + tieName(p.tie, res) + '」。結末は「' + p.name + '」' + (p.surprise ? '（意外）' : '') + '。';
    });
  }

  /* 結果の箱庭。セーブを開くとき、一覧に出していない箱庭（scenario-futari.js の SCENARIOS_HIDDEN）や今は無い箱庭の結果でも落ちないように */
  function scenOf(res) { return HK.SCENARIOS[res.scenId] || (HK.SCENARIOS_HIDDEN || {})[res.scenId] || { id: res.scenId, name: String(res.scenId || '箱庭'), env: [], stats: [] }; }
  /* ---------- 住人ごと（見本 14）：左に住人の一覧、右に選んだ住人のカード（中身は今までの住人のカードと同じ：結末・気分・気質・初動・目標・読み解き・らしくない瞬間） ---------- */
  function charDetail(c, res) {
    if (!c) return '';
    var stats = Object.keys(c.stats || {}).map(function (k) {
      var def = (scenOf(res).stats || []).filter(function (s) { return s.id === k; })[0];
      return (def ? def.label : k) + c.stats[k];
    }).join('・');
    /* 気質と口調（engine.js の type「BDACD（A優位…）・口調「強気」」を二つの行に） */
    var tm = /^([\s\S]*?)・口調「([\s\S]*)」$/.exec(c.type || ''), typ = tm ? tm[1] : c.type, tone = tm ? tm[2] : '';
    var rows = [['気質', typ], ['口調', tone], ['初動', c.action], ['目標', c.goal], ['数値', stats], ['武器', c.weapon]].filter(function (x) { return x[1]; });
    var notes = tieNotes(c, res).concat(c.notes || []);
    var odd = (c.odd || []).map(function (n) {
      var e = res.log[n];
      return e ? '<li><span class="st">' + esc(e.label) + '</span>' + paint(e.text, res) + '</li>' : '';
    }).join('');
    var n = res.chars.length, prev = (c.i - 1 + n) % n, next = (c.i + 1) % n;
    var emo = HK.Emo && HK.Emo.html ? HK.Emo.html(c) : '';
    return '<article class="rvcard ccard rvcd">' +
      '<div class="hd">' + av(res, c.i, 52, c.alive === false ? 'gone' : '') + '<div class="rvcdn"><span class="nm" style="color:' + pc(c.i) + '">' + esc(c.name) + '</span><span class="fate ' + fateCls(c.fate) + '">' + esc(c.fate) + '</span></div>' +
      (n > 1 ? '<span class="rvnav"><button type="button" class="btn small" data-act="rvwho" data-i="' + prev + '" aria-label="' + esc('前の住人（' + res.chars[prev].name + '）') + '" title="' + esc(res.chars[prev].name) + '">‹</button><button type="button" class="btn small" data-act="rvwho" data-i="' + next + '" aria-label="' + esc('次の住人（' + res.chars[next].name + '）') + '" title="' + esc(res.chars[next].name) + '">›</button></span>' : '') + '</div>' +
      (c.fateNote ? '<p class="rvlead">' + paint(c.fateNote, res) + '</p>' : '') +
      '<div class="rvbox">' + (emo ? '<div class="rvemo"><div class="k">気分</div>' + emo + '</div>' : '') + (rows.length ? '<dl class="rvdl">' + rows.map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' : '') + '</div>' +
      (notes.length ? '<h4 class="rvh4">読み解き</h4><ul class="rvul">' + notes.map(function (t) { return '<li>' + paint(t, res) + '</li>'; }).join('') + '</ul>' : '') +
      (odd ? '<h4 class="rvh4">らしくない瞬間 <small>' + c.odd.length + '回</small></h4><ul class="keys rvoddl">' + odd + '</ul>' : '') +
      '<div class="rvmore"><button type="button" class="rvlink" data-act="rvwholog" data-i="' + c.i + '">' + esc(c.name) + 'の場面だけを経過で読む ›</button></div></article>';
  }
  function whoPane(res) {
    var sel = rv.who != null && res.chars[rv.who] ? rv.who : 0;
    var list = res.chars.map(function (c) {
      return '<li><button type="button" class="rvpi" data-act="rvwho" data-i="' + c.i + '" aria-current="' + (c.i === sel) + '">' + av(res, c.i, 30, c.alive === false ? 'gone' : '') + '<span class="rvpn"><b>' + esc(c.name) + '</b><small>' + esc(c.fate) + '</small></span></button></li>';
    }).join('');
    return '<div class="rvgrid rvg-who"><aside class="rvcard rvlist" aria-label="住人の一覧"><ul class="rvplist rvwlist">' + list + '</ul></aside><div class="rvmain" id="rvwhodet">' + charDetail(res.chars[sel], res) + '</div></div>';
  }

  /* ---------- 時系列 ---------- */
  function keySet(res) {
    var s = {};
    res.pairs.forEach(function (p) { p.key.forEach(function (n) { s[n] = 1; }); });
    return s;
  }
  /* 経過の区切り（絞り込みのあとの出来事）。目次と本文で同じものを使う */
  function tlActive() { return !!(tl.who.length || tl.keyOnly || tl.lewd || tl.cat !== 'all' || Object.keys(tl.off).some(function (k) { return tl.off[k]; })); }
  function tlGroups(res) {
    var ks = keySet(res), H = hotInfo(res), groups = [], cur = null;
    /* 似た派閥の出来事が続くときは畳む（factions.js の HK.Factions.foldSet。表示だけ。人で絞り込んでいるときは畳まない） */
    var fold = res.factions && HK.Factions && HK.Factions.foldSet && !tl.who.length ? HK.Factions.foldSet(res) : null, ch = curCh(res);
    res.log.forEach(function (e, li) {
      if (e.kind === 'step') { cur = { label: e.label, step: e.step, items: [], end: e.text === '結末' || e.label === '結末' }; groups.push(cur); return; }
      if (!cur) { cur = { label: '', step: null, items: [] }; groups.push(cur); }
      /* 記録の欄（本編／コメント欄）：いまの欄の記録だけ */
      if (chOf(e) !== ch) return;
      if (tl.who.length) {
        var all = tl.who.every(function (w) { return e.actors.indexOf(w) >= 0; });
        if (!all) return;
      }
      if (tl.keyOnly && !e.ch && !(ks[e.n] || e.kind === 'death' || e.odd || e.mag >= 25 || e.goal || e.goalExit || (e.mark && e.mark.length) || isHot(e, H))) return;
      if (tl.cat !== 'all' && e.cat !== tl.cat && e.kind !== 'death') return;
      /* 種類（右の☑）：外した種類の出来事は出さない（死亡はいつも出す） */
      if (e.kind === 'event' && tl.off[e.cat]) return;
      /* エロシーンだけ：場面の前振りの段（R18版の出られない部屋。sex-lead-r18.js の e.tag 'きっかけ'）は、次の場面と一緒に出す */
      if (tl.lewd && !HK.lewdEvent(e) && !(e.tag === 'きっかけ' && HK.lewdEvent(res.log[li + 1] || {}))) return;
      if (fold && fold[e.n] && !isHot(e, H)) { if (!cur.fold) { cur.fold = { fold: [] }; cur.items.push(cur.fold); } cur.fold.fold.push(e); return; }
      cur.items.push(e);
    });
    var gs = groups.filter(function (g) { return g.items.length; });
    var seen = {};
    gs.forEach(function (g, k) {
      /* 区切りの鍵（同じ番号の区切りが続く箱庭もあるので、2つめからは印を足す） */
      var key = g.step != null ? 's' + g.step : 'x' + k;
      seen[key] = (seen[key] || 0) + 1;
      g.key = seen[key] > 1 ? key + '-' + seen[key] : key;
      g.hot = g.items.some(function (e) { return !e.fold && isHot(e, H); });
      g.n = g.items.reduce(function (m, e) { return m + (e.fold ? e.fold.length : 1); }, 0);
    });
    return { ks: ks, H: H, groups: gs, days: dayGroups(res, gs) };
  }
  /* ---------- 日ごとのまとめ（2026-11-03。箱庭が任意で持つ scen.stepGroup(区切りの名前, 区切りの番号) → { group: 'DAY1（月）', sub: '朝' } か null） ----------
     持つ箱庭だけ、経過の目次と区切りの開け閉めを group（日）ごとにまとめ、sub を日の中の中見出しにする。null を返した区切り（結末など）は今までどおり 1 区切り。
     持たない箱庭は days が null で、目次・本文・開け閉めは今までと同じ。日の鍵（d＋番号）は絞り込む前の記録で決めるので、絞り込んでも開け閉めが残る */
  function stepGroupFn(res) { var f = scenOf(res).stepGroup; return typeof f === 'function' ? f : null; }
  function stepGroupOf(f, x) {
    if (!x || x.label == null || x.label === '') return null;
    var r = null;
    try { r = f(String(x.label), x.step); } catch (er) { r = null; }
    return r && r.group != null && String(r.group) ? { group: String(r.group), sub: r.sub != null ? String(r.sub) : '' } : null;
  }
  function dayGroups(res, gs) {
    var f = stepGroupFn(res);
    if (!f) return null;
    var ord = {}, no = 0;
    res.log.forEach(function (e) { if (e.kind !== 'step') return; var r = stepGroupOf(f, e); if (r && ord[r.group] == null) ord[r.group] = no++; });
    if (!no) return null;
    var days = [], cur = null, seen = {};
    gs.forEach(function (g) {
      var r = stepGroupOf(f, g);
      if (!r) { cur = null; days.push({ key: g.key, label: g.label, step: g.step, subs: [g], one: true, hot: g.hot, n: g.n }); return; }
      if (!cur || cur.label !== r.group) { cur = { key: 'd' + ord[r.group], label: r.group, subs: [], day: true }; days.push(cur); }
      g.sub = r.sub;
      cur.subs.push(g);
    });
    days.forEach(function (d) {
      if (!d.day) return;
      /* 同じ日が離れて二度出る（並びの崩れた箱庭）ときは、2つめからは印を足す */
      seen[d.key] = (seen[d.key] || 0) + 1;
      if (seen[d.key] > 1) d.key += '-' + seen[d.key];
      d.hot = d.subs.some(function (g) { return g.hot; });
      d.n = d.subs.reduce(function (m, g) { return m + g.n; }, 0);
    });
    return days;
  }
  /* 区切りの開け閉め：押して変えたものはそのまま。ほかは「区切りを全部開く」か、最初の区切り、絞り込み中なら開く */
  function secOpen(g, k) { return rv.sec[g.key] != null ? rv.sec[g.key] : (rv.open || k === 0 || tlActive()); }
  function secName(g) { return g.day ? g.label || '' : (tno(g.step) ? tno(g.step) + ' ' : '') + (g.label || ''); }
  function timeline(res, G) {
    G = G || tlGroups(res);
    var ks = G.ks, H = G.H, gs = G.days || G.groups, inEnd = false;
    var html = gs.map(function (g, k) {
      if (g.one) g = g.subs[0];
      if (g.day) return dayBlk(g, k);
      /* 区切りのカードの頭：ターン番号（Mono）と局面名、重要の札と件数、畳む／開く */
      var tn = tno(g.step), open = secOpen(g, k), nx = gs[k + 1];
      var when = '<div class="when' + (g.hot ? ' hot' : '') + '">' + (tn ? '<span class="tn">' + tn + '</span>' + (g.label ? '<span class="ph">' + esc(g.label) + '</span>' : '') : '<span class="ph">' + esc(g.label) + '</span>') +
        '<span class="rvsecm">' + (g.hot ? '<span class="rvimp">重要</span>' : '') + '<span class="rvsecn">' + g.n + '件</span></span>' +
        '<button type="button" class="rvfoldbtn" data-act="rvfold" data-s="' + g.key + '" aria-expanded="' + open + '">' + (open ? '畳む' : '開く') + '</button></div>';
      inEnd = !!g.end;
      return '<div class="stepblk' + (g.hot ? ' hasHot' : '') + (open ? '' : ' rvfold') + '" id="rvs-' + g.key + '" data-s="' + g.key + '">' + when + '<ol>' + g.items.map(function (e) {
        if (e.fold) return '<li class="ev phase facfold"><details><summary style="cursor:pointer;color:var(--muted);font-size:12px">似た派閥の動き ' + e.fold.length + '件（続くので畳んでいます）</summary><ol style="padding-bottom:0">' + e.fold.map(evLi).join('') + '</ol></details></li>';
        return evLi(e);
      }).join('') + '</ol>' + (nx ? '<div class="rvnext"><button type="button" class="rvlink" data-act="rvjump" data-s="' + nx.key + '">次の区切り：' + esc(secName(nx.one ? nx.subs[0] : nx)) + ' ›</button></div>' : '') + '</div>';
    }).join('');
    return html || '<p class="hint">条件に合う出来事はありません。</p>';
    function items(g) {
      return '<ol>' + g.items.map(function (e) {
        if (e.fold) return '<li class="ev phase facfold"><details><summary style="cursor:pointer;color:var(--muted);font-size:12px">似た派閥の動き ' + e.fold.length + '件（続くので畳んでいます）</summary><ol style="padding-bottom:0">' + e.fold.map(evLi).join('') + '</ol></details></li>';
        return evLi(e);
      }).join('') + '</ol>';
    }
    /* 日のカード：頭は日の名前・重要の札・日の合計の件数・畳む／開く。中に区切りごとの中見出し（朝・日中・夜。ターン番号と件数）と出来事 */
    function dayBlk(d, k) {
      var open = secOpen(d, k), nx = gs[k + 1];
      var when = '<div class="when' + (d.hot ? ' hot' : '') + '"><span class="ph">' + esc(d.label) + '</span>' +
        '<span class="rvsecm">' + (d.hot ? '<span class="rvimp">重要</span>' : '') + '<span class="rvsecn">' + d.n + '件</span></span>' +
        '<button type="button" class="rvfoldbtn" data-act="rvfold" data-s="' + d.key + '" aria-expanded="' + open + '">' + (open ? '畳む' : '開く') + '</button></div>';
      var body = d.subs.map(function (g) {
        inEnd = !!g.end;
        var tn = tno(g.step);
        return '<div class="rvsubh' + (g.hot ? ' hot' : '') + '" id="rvs-' + g.key + '" data-s="' + g.key + '">' + (tn ? '<span class="tn">' + tn + '</span>' : '') + '<span class="ph">' + esc(g.sub || g.label || '') + '</span><span class="rvsecn">' + g.n + '件</span></div>' + items(g);
      }).join('');
      return '<div class="stepblk rvday' + (d.hot ? ' hasHot' : '') + (open ? '' : ' rvfold') + '" id="rvs-' + d.key + '" data-s="' + d.key + '">' + when + '<div class="rvdb">' + body + '</div>' +
        (nx ? '<div class="rvnext"><button type="button" class="rvlink" data-act="rvjump" data-s="' + nx.key + '">次の区切り：' + esc(secName(nx.one ? nx.subs[0] : nx)) + ' ›</button></div>' : '') + '</div>';
    }
    function evLi(e) {
      var hot = isHot(e, H), hk = hotKind(e, H), rm = rmInfo(e, res, inEnd);
      var cls = 'ev' + (e.ch ? ' chat ch-' + esc(chOf(e)) : '') + (e.kind === 'event' && e.cat ? ' cat-' + e.cat : '') + (e.trouble ? ' trouble' : '') + (e.kind === 'phase' ? ' phase' : '') + (e.kind === 'death' ? ' death' : '') + (ks[e.n] ? ' key' : '') + (hot ? ' hot' : '') + (e.goal || e.goalExit ? ' goal' : '') + (e.goalExit ? ' exit' : '') + (hk ? ' hot-' + hk : '');
      /* 出られない部屋の条件の行は、種類の札「脱出」を「条件」の札に任せる（同じことを二つ並べない） */
      var chip = e.kind === 'event' && !(rm && rm.k === 'cond' && e.cat === 'escape') ? '<span class="c cc-' + esc(e.cat) + '">' + esc(HK.CAT_NAME[e.cat] || e.cat) + '</span>' : '';
      /* 出られない部屋：条件を満たした・扉が開いた出来事の札 */
      if (e.goal || e.goalExit) chip = (e.goal || []).map(function (g) { return '<span class="goalb">条件達成：' + esc(g) + '</span>'; }).join('') + (e.goalExit ? '<span class="goalb exitb">扉が開いた</span>' : '') + chip;
      /* 決定的な関係の節目（付き合い始めた・別れた・浮気）の札（engine.js の markRel） */
      if (e.mark && e.mark.length) chip = e.mark.map(function (m) { return '<span class="markb mark-' + esc(m) + '">' + esc((HK.MARK_NAME || {})[m] || m) + '</span>'; }).join('') + chip;
      /* 台詞・地の文・引用の区分（voice-seg.js の e.seg）：台詞行の話し手の顔を先頭に。発話のある出来事を吹き出しにする（名詞の引用だけなら吹き出しにしない） */
      var sg = HK.Seg ? HK.Seg.of(e, res) : null, lead = sg ? HK.Seg.speakers(sg).filter(function (i) { return res.chars[i]; })[0] : null;
      var who = (lead != null ? [lead] : []).concat((e.actors || []).filter(function (i) { return i !== lead; })).slice(0, 3);
      var avs = who.length ? '<span class="avs">' + who.map(function (i) { return av(res, i, 26); }).join('') + '</span>' : '';
      /* 会話は吹き出しにせず、「」の引用だけ少し太く（.q） */
      var talk = !!(avs && e.kind === 'event' && (sg ? HK.Seg.talk(sg) : /「/.test(e.text)));
      /* 吹き出しの見え方（V.bubble）：発話のある出来事は本文を吹き出しと地の文に分ける（顔は吹き出しの側に出すので、行の頭の顔は出さない） */
      var bb = V.bubble(e, sg, { who: function (i) { return res.chars[i]; }, av: function (i, s) { return av(res, i, s); }, paint: function (s) { return paint(s, res); }, face: function (k) { return HK.Face ? HK.Face.of(e, k, res) : null; } });
      if (bb) { avs = ''; talk = false; }
      var body = bb || paint(e.text, res, sg);
      /* 表情の鍵（face.js）：「」の順に data-face を付ける（見た目は変えない。画像の差し込み口。入れ子の「」がある文は付けない） */
      if (talk) { var fl = HK.Face && HK.Seg ? HK.Face.list(e, res) : null, fq = 0, nst = fl && HK.Seg.quotes(e.text).length !== (e.text.match(/「[^「」]*」/g) || []).length; body = body.replace(/「[^「」]*」/g, function (m) { var f = fl && !nst ? fl[fq++] : null; return '<span class="q"' + (f ? ' data-face="' + f + '"' : '') + '>' + m + '</span>'; }); }
      /* 段落の箱と、出られない部屋の札（まとめての見出しは囲みに。段が一つだけなら札に） */
      var pw = bb ? { html: bb, dg: false } : paraWrap(body, rm && rm.dg);
      body = pw.html;
      if (rm) chip = rm.chips.concat(rm.dg && !pw.dg ? [['dg', rm.dg]] : []).map(function (c) { return '<span class="rmb" data-k="' + c[0] + '">' + esc(c[1]) + '</span>'; }).join('') + chip;
      /* 出来事の頭の行：重要の札（種類つき）・節目などの札・種類・らしくない */
      var imp = hk ? '<span class="rvimp" data-hot="' + hk + '" title="' + esc(HOT_TIP[hk] || '') + '">重要' + (HOT_NAME[hk] ? '・' + esc(HOT_NAME[hk]) : '') + '</span>' : '';
      var head = imp + chip + (e.odd ? '<span class="oddb">らしくない</span>' : '');
      return '<li class="' + cls + (avs ? ' hasav' : '') + (talk ? ' talk' : '') + (bb ? ' bbl' : '') + '" data-n="' + e.n + '"' + (hk ? ' data-hot="' + hk + '"' : '') + (rm && rm.k ? ' data-rm="' + rm.k + '"' : '') + '>' + avs + '<div class="evb">' + (head ? '<div class="evh">' + head + '</div>' : '') + body + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</div></li>';
    }
  }
  /* 目次（区切り。押すとその区切りを開いて移る） */
  function toc(res, G) {
    G = G || tlGroups(res);
    if (!G.groups.length) return '';
    return '<div class="rvtoct">目次</div><ol>' + (G.days || G.groups).map(function (g) {
      if (g.one) g = g.subs[0];
      /* 日ごと（scen.stepGroup）：日を 1 項目（件数は日の合計・重要の印も日に）にし、その下に朝・日中・夜などの中見出し */
      if (g.day) return '<li><button type="button" class="rvtocb rvtocd' + (g.hot ? ' hot' : '') + '" data-act="rvjump" data-s="' + g.key + '"><span class="lb">' + esc(g.label) + '</span><span class="n">' + g.n + '</span></button>' +
        '<ol class="rvtocs">' + g.subs.map(function (x) {
          return '<li><button type="button" class="rvtocb rvtocsb' + (x.hot ? ' hot' : '') + '" data-act="rvjump" data-s="' + g.key + '" data-sub="' + x.key + '" title="' + esc(secName(x)) + '"><span class="lb">' + esc(x.sub || x.label || '―') + '</span><span class="n">' + x.n + '</span></button></li>';
        }).join('') + '</ol></li>';
      return '<li><button type="button" class="rvtocb' + (g.hot ? ' hot' : '') + '" data-act="rvjump" data-s="' + g.key + '">' + (tno(g.step) ? '<span class="tn">' + tno(g.step) + '</span>' : '') + '<span class="lb">' + esc(g.label || '―') + '</span><span class="n">' + g.n + '</span></button></li>';
    }).join('') + '</ol>';
  }
  /* 経過の見え方の切替「カード｜線」（2026-11-02 担当UE）。経過の右の絞り込みと、一人用・ダンジョンの記録の見出しの横に置く。
     押すと .rvw の data-tlv を変えるだけ（描き直さないので、区切りの開け閉め・絞り込みはそのまま） */
  V.tlvSeg = function (cls) {
    return '<div class="rvseg rvtlv' + (cls ? ' ' + cls : '') + '" role="radiogroup" aria-label="経過の見え方">' + [['card', 'カード', '区切りごとのカードで読む'], ['line', '線', '縦の線と顔アイコンで読む（前の見え方）'], ['bubble', '吹き出し', '台詞を話し手の顔と吹き出しで読む']].map(function (x) {
      return '<button type="button" role="radio" data-act="rvtlv" data-v="' + x[0] + '" aria-checked="' + (rv.tlv === x[0]) + '" title="' + esc(x[2]) + '">' + x[1] + '</button>';
    }).join('') + '</div>';
  };
  /* ---------- 吹き出しの見え方（2026-11-02 担当UH。表示だけで、記録・文は変えない） ----------
     rv.tlv が 'bubble' のとき、出来事の本文を区分（voice-seg.js の e.seg）で分けて描く：
       台詞行 l・埋め込みの発話 q・決まらない発話 u・喘ぎとモブ m … 左に話し手の顔（HK.Icons.html）、右に角丸の吹き出し（しっぽ付き。住人の色を薄く敷く）。
         外側の「」は吹き出しが示すので外し、話し手の名前は吹き出しの頭に小さく出す。♡などの記号は文のまま。
         同じ話し手が続くとき（間が空白・改行だけ）は顔を一つにまとめる。話し手の分からない台詞・モブは灰色の丸（モブの名前が直前にあればその頭文字）。
       地の文 n・名詞の引用 c … 吹き出しの間に、細い字（.bbn）で左寄せに置く。
     発話の無い出来事（地の文・名詞の引用だけ）と区切りの行は null を返し、呼ぶ側はいつもの本文を出す。全員左寄せ（色で区別）なので、スマホ幅でも 1 列のまま。
     e：記録、sg：e の seg（HK.Seg.of）、o：{ who(i) → 住人（name・i）か null, av(i, 大きさ) → 顔の HTML, paint(文) → 名前に色を付けた HTML } */
  var BB_TALK = /^[lqmu]$/;
  /* モブの名前（直前の地の文の終わり「司会の田中「」「店員が「」」、文が切れていればその文の主語「行商人は……。「」」から。代名詞・体の語・住人の名前は使わない） */
  var BB_MOBNG = /^(?:誰|誰か|だれか|声|皆|みんな|全員|周り|周囲|一同|何人か|数人|ひとり|一人|相手|その人|彼|彼女|二人|ふたり|三人|口|唇|喉|息|胸|奥|中|耳元|背後|外|遠く|向こう)$/;
  function bbCut(s) { return Math.max(s.lastIndexOf('。'), s.lastIndexOf('！'), s.lastIndexOf('？'), s.lastIndexOf('」'), s.lastIndexOf('\n')); }
  function bbMob(pre, isName) {
    var s = String(pre || '').replace(/[\s　]+$/, ''), m, x = '';
    var tail = s.slice(Math.max(bbCut(s), s.lastIndexOf('、')) + 1).replace(/[がはも]$/, '');
    if (tail) { m = /^(?:[^\s、。]{0,10}の)?([一-龯々ァ-ヶーA-Za-zＡ-Ｚａ-ｚ]{1,8}(?:さん|ちゃん|くん|様|さま)?)$/.exec(tail); x = m ? m[1] : ''; }
    else if (/[。！？]$/.test(s)) {
      /* 文の切れ目のすぐ後ろの「」：その文の頭の「〇〇は／が」 */
      var t = s.slice(0, -1); t = t.slice(bbCut(t) + 1).replace(/^[\s　―]+/, '');
      m = /^([^、。！？」\s]{1,12}?)(?:は|が)/.exec(t);
      if (m) { m = /([一-龯々ァ-ヶーA-Za-zＡ-Ｚａ-ｚ]{1,8})$/.exec(m[1]); x = m ? m[1] : ''; }
    }
    return x && !BB_MOBNG.test(x) && !(isName && isName(x)) ? Array.from(x)[0] : '';
  }
  V.bubble = function (e, sg, o) {
    if (rv.tlv !== 'bubble' || !e || e.kind === 'step' || e.kind === 'phase' || !sg || !sg.length || !o) return null;
    if (!sg.some(function (x) { return BB_TALK.test(x.t); })) return null;
    var out = [], g = null, nar = '';
    function isName(n) { for (var i = 0; i < 64; i++) { var c = o.who(i); if (!c) return false; if (c.name === n) return true; } return false; }
    function closeG() {
      if (!g) return;
      var w = g.w, col = w ? (HK.Icons && HK.Icons.color && HK.Icons.color(w.name)) || pc(w.i != null ? w.i : g.k) : '';
      var face = w ? o.av(g.k, 24) : '<span class="av bbmob" aria-hidden="true"><b>' + esc(g.mob) + '</b></span>';
      /* 表情の鍵（face.js）：顔の側は最後の吹き出しの鍵、吹き出しはそれぞれの鍵（data-face。見た目は変えない。画像の差し込み口） */
      var gf = g.items.length ? g.items[g.items.length - 1].f : null;
      out.push('<div class="bbg' + (w ? '' : ' bbg0') + '"' + (w ? ' style="--c:' + col + '"' : '') + (gf ? ' data-face="' + gf + '"' : '') + '>' + face + '<div class="bbs">' + g.items.map(function (h, k) {
        return '<div class="bb' + (h.m ? ' bbm' : '') + '"' + (h.f ? ' data-face="' + h.f + '"' : '') + '>' + (k === 0 && w ? '<b class="bbnm">' + esc(w.name) + '</b>' : '') + h.h + '</div>';
      }).join('') + '</div></div>');
      g = null;
    }
    function flushN() {
      var s = nar.replace(/^\s+|\s+$/g, '');
      nar = '';
      if (!s) return;
      closeG();
      s.split(/\n\s*\n+/).forEach(function (p) { p = p.replace(/^\s+|\s+$/g, ''); if (p) out.push('<p class="bbn">' + o.paint(p) + '</p>'); });
    }
    var prevC = false, qi = -1;
    sg.forEach(function (x) {
      if (x.t !== 'n') qi++;
      /* 話し手の決まらない「」が名詞の引用のすぐ後ろに続くとき（「頭が良くなる」「レモンが甘く感じる」の並び）は、引用の続きとして地の文に */
      var asN = !BB_TALK.test(x.t) || (x.t === 'u' && !(x.who >= 0) && prevC && /」\s*$/.test(nar));
      prevC = x.t === 'c' || (asN && x.t === 'u');
      if (asN) { nar += x.s; return; }
      var w = x.who >= 0 ? o.who(x.who) : null, t = String(x.s);
      /* 名前「…」の形：話し手が分かれば名前は吹き出しの頭に、分からなければ名前は地の文に残す */
      if (x.nm) { if (!w) nar += t.slice(0, x.nm); t = t.slice(x.nm); }
      var pre = nar;
      flushN();
      var m = /^「([\s\S]*)」$/.exec(t), key = w ? 'p' + x.who : 'm' + bbMob(pre, isName);
      if (!g || g.key !== key) { closeG(); g = { key: key, k: x.who, w: w, mob: w ? '' : key.slice(1), items: [] }; }
      var fk = o.face ? o.face(qi) : x.face || null;
      g.items.push({ h: o.paint(m ? m[1] : t), m: x.t === 'm', f: fk && /^[a-z_0-9]+$/.test(fk) ? fk : null });
    });
    flushN();
    closeG();
    return '<div class="bbx">' + out.join('') + '</div>';
  };
  /* 吹き出しへ／から切り替えたときに記録の本文を描き直す（一人用・ダンジョンの記録は V.onTlv で登録する） */
  var tlvHooks = [];
  V.onTlv = function (fn) { if (typeof fn === 'function') tlvHooks.push(fn); };
  function tlvRedraw() {
    /* 見えている区切りの位置を保つ（描き直しで高さが変わっても、読んでいた区切りが同じ高さに残るように） */
    var w = rvWrap(), blks = w ? w.querySelectorAll('.tl .stepblk') : [], ai = -1, at = 0;
    for (var i = 0; i < blks.length; i++) { var r = blks[i].getBoundingClientRect(); if (r.height && r.bottom > 80) { ai = i; at = r.top; break; } }
    if (lastRes && lastHost && !lastRes.solo) { var t = lastHost.querySelector('#tl'); if (t) t.innerHTML = timeline(lastRes); }
    tlvHooks.forEach(function (fn) { try { fn(); } catch (er) { /* 一人用・ダンジョンの描き直しに失敗しても、経過の切替は効く */ } });
    if (ai >= 0 && w) { var nb = w.querySelectorAll('.tl .stepblk')[ai]; if (nb) window.scrollBy(0, nb.getBoundingClientRect().top - at); }
  }
  /* 右の絞り込み（見本 09）：人で絞る・種類・重要な場面だけ・理由を表示・区切りを全部開く・文字の大きさ。
     人・重要・エロシーンは今までどおり data-act（ui.js）と aria-pressed（export-out.js が印刷の前に外して戻す）。種類・理由・全部開く・文字は role の checkbox／switch／radio */
  function tlBar(res) {
    var who = res.chars.map(function (c) {
      return '<button type="button" class="rvwhob" data-act="who" data-i="' + c.i + '" aria-pressed="' + (tl.who.indexOf(c.i) >= 0) + '" title="' + esc(c.name) + '">' + av(res, c.i, 30) + '<span class="rvsr">' + esc(c.name) + '</span></button>';
    }).join('');
    var cats = ['romance', 'bond', 'help', 'conflict', 'combat', 'betray', 'solo', 'escape'], used = {};
    res.log.forEach(function (e) { if (e.kind === 'event') used[e.cat] = 1; });
    var catBox = cats.filter(function (c) { return used[c]; }).map(function (c) {
      return '<button type="button" role="checkbox" class="rvchk" data-act="rvcat" data-c="' + c + '" aria-checked="' + !tl.off[c] + '"><i aria-hidden="true"></i><span>' + esc(HK.CAT_NAME[c] || c) + '</span></button>';
    }).join('');
    var sw = function (act, on, label, title, pressed) {
      return '<button type="button" class="rvsw" data-act="' + act + '" ' + (pressed ? 'aria-pressed' : 'role="switch" aria-checked') + '="' + !!on + '"' + (title ? ' title="' + esc(title) + '"' : '') + '><span>' + label + '</span><i aria-hidden="true"></i></button>';
    };
    var fsb = [['s', '小'], ['m', '中'], ['l', '大']].map(function (x) { return '<button type="button" role="radio" data-act="rvfs" data-v="' + x[0] + '" aria-checked="' + (rv.fs === x[0]) + '">' + x[1] + '</button>'; }).join('');
    return '<div class="rvcard rvrailin">' +
      '<div class="rvrs"><div class="rvrt">見え方</div>' + V.tlvSeg() + '</div>' +
      '<div class="rvrs"><div class="rvrt">人で絞る</div><div class="rvwhos" role="group" aria-label="人で絞る">' + who + '</div>' + (tl.who.length ? '<button type="button" class="rvlink small" data-act="whoclear">人の絞り込みを外す</button>' : '') + '</div>' +
      (catBox ? '<div class="rvrs"><div class="rvrt">種類</div><div class="rvcats" role="group" aria-label="種類">' + catBox + '</div></div>' : '') +
      '<div class="rvrs rvsws">' + sw('keyonly', tl.keyOnly, '<i class="hotdot" aria-hidden="true"></i>重要な場面だけ', '転機・死亡・関係の節目・決め手など、重要な出来事だけ', true) +
      (HK.lewdFilterOn && HK.lewdFilterOn(res.log) ? sw('lewdonly', tl.lewd, 'エロシーンだけ', '', true) : '') +
      sw('rvwhy', rv.why, '理由を表示', '出来事の下に「理由：…」を出す') + sw('rvopen', rv.open, '区切りを全部開く', '畳んだ区切りも、はじめから開いておく') + '</div>' +
      '<div class="rvrs"><div class="rvrt">文字の大きさ</div><div class="rvseg" role="radiogroup" aria-label="文字の大きさ">' + fsb + '</div></div>' +
      (tlActive() ? '<div class="rvrs"><button type="button" class="btn small ghost" data-act="rvreset">絞り込みをすべて外す</button></div>' : '') + '</div>';
  }

  /* 見出しの横の凡例：この結果に出る重要な出来事の種類だけ（情事は R18 版で全年齢モードでないときだけ） */
  function hotLegend(res) {
    var H = hotInfo(res), seen = {};
    res.log.forEach(function (e) { var k = hotKind(e, H); if (k) seen[k] = 1; });
    return hotLegendOf(seen) + rmLegend(res);
  }
  /* 出られない部屋の札の凡例：その結果に出る種類だけ（まとめては囲みの見出しなので、まとめて進んだ回があるときだけ） */
  function rmLegend(res) {
    if (!res || res.scenId !== 'whiteroom') return '';
    var seen = {}, inEnd = false;
    res.log.forEach(function (e) {
      if (e.kind === 'step') { inEnd = e.text === '結末' || e.label === '結末'; return; }
      var I = rmInfo(e, res, inEnd);
      if (I) { if (I.k) seen[I.k] = 1; if (I.dg) seen.dg = 1; I.chips.forEach(function (c) { seen[c[0]] = 1; }); }
    });
    var ks = ['cond', 'dg', 'lead', 'kill', 'note', 'door', 'end'].filter(function (k) { return seen[k]; });
    if (!ks.length) return '';
    return '<span class="hotleg rmleg" role="note" aria-label="記録の札の見分け方"><span class="hkl">札</span>' + ks.map(function (k) {
      return '<span class="rmb" data-k="' + k + '">' + esc(k === 'kill' ? rmKillName() : RM_NAME[k]) + '</span>';
    }).join('') + '</span>';
  }

  /* ---------- 全体 ---------- */
  V.resetFilter = function () { tl = { who: [], keyOnly: false, cat: 'all', lewd: false, off: {}, ch: 'main' }; };
  /* 記録の欄の切り替え「本編｜コメント欄（n件）」（e.ch のある記録のときだけ。経過の見出しの横） */
  function chSeg(res) {
    var L = chList(res);
    if (!L.length) return '';
    var opts = [['main', '本編', chCount(res, 'main')]].concat(L.map(function (c) { return [c, CH_NAME[c], chCount(res, c)]; }));
    return '<div class="rvseg rvch" role="radiogroup" aria-label="記録の欄">' + opts.map(function (x) {
      return '<button type="button" role="radio" data-act="rvch" data-v="' + esc(x[0]) + '" aria-checked="' + (curCh(res) === x[0]) + '">' + esc(x[1]) + (x[0] === 'main' ? '' : '<small>（' + x[2] + '件）</small>') + '</button>';
    }).join('') + '</div>';
  }
  V.chSeg = chSeg;
  V.setCh = function (c) { tl.ch = c || 'main'; chSync(); V.refreshTimeline(); };
  V.ch = function () { return tl.ch || 'main'; };
  /* 印刷（export-out.js の PDF）：本編を出し、そのあとに記録の欄（コメント欄など）を区切りごとに足す。戻す関数を返す（欄の無い記録は null） */
  V.chPrint = function () {
    var res = lastRes, h = lastHost, t = h && h.querySelector('#tl');
    if (!res || res.solo || !t) return null;
    var L = chList(res);
    if (!L.length) return null;
    var sv = tl.ch, so = rv.open;
    tl.ch = 'main'; chSync(); V.refreshTimeline();
    var box = document.createElement('div');
    box.className = 'rvchprint';
    rv.open = true;
    try { box.innerHTML = L.map(function (c) { tl.ch = c; return '<h2 class="sec rvh2">' + esc(CH_NAME[c]) + '</h2><div class="tl">' + timeline(res, tlGroups(res)) + '</div>'; }).join(''); }
    finally { rv.open = so; tl.ch = 'main'; }
    t.parentNode.insertBefore(box, t.nextSibling);
    return function () { if (box.parentNode) box.parentNode.removeChild(box); tl.ch = sv; chSync(); V.refreshTimeline(); };
  };

  /* 結果の頭（見本 09・10。一人用・ダンジョンも使う）：小さく「箱庭・人数・シード」、大きく結末の一文。右に「条件を変える」「保存・共有▾」「別の運命で動かす」。
     ボタンの行は格子の右の列に置き、結末の文の長さで位置が動かない（ui-result-style.js。スマホ幅はメタ1行と題名2行の高さを決めて、その下に置く）。
     「保存・共有」の中身（共有の札・セーブ・PDF など）は ui.js の renderResult・export-out.js が #rvmenu に差し込む */
  var IC_SHARE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 9V1.8M4.2 4.4L7 1.6l2.8 2.8M2.5 8.5v3.5h9V8.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  V.head = function (o) {
    return '<div class="resulthead rvhead"><div><div class="meta rvmeta">' + o.meta + '</div><h2 class="rvtitle">' + o.title + '</h2>' + (o.note ? '<div class="meta scnote">' + esc(o.note) + '</div>' : '') + '</div><span class="spacer"></span>' +
      '<div class="row rvbtns"><button type="button" class="btn" data-act="gobox">条件を変える</button>' +
      '<span class="rvsave"><button type="button" class="btn" data-act="rvmenu" aria-haspopup="true" aria-expanded="false" aria-controls="rvmenu">' + IC_SHARE + '保存・共有<i class="rvcaret" aria-hidden="true"></i></button>' +
      '<span class="rvmenu" id="rvmenu" role="group" aria-label="保存・共有" hidden><span class="rvmrow"><button type="button" class="btn" data-act="copytext">結果をテキストでコピー</button></span></span></span>' +
      '<button type="button" class="btn primary" data-act="reroll">' + esc(o.reroll || '別の運命で動かす') + '</button></div></div>';
  };
  /* 節と目次の枠。tabs：[{ k, label, n（添える数）, html }]。
     2026-11-02 担当UI（利用者の声「クリックの工程が挟まる」）：切替で隠さず、節を全部縦に並べる。並びは 結末 → 関係図 → 二人ずつ → 住人ごと → 経過（長い経過は最後。一人用・ダンジョンも同じ順）。
     帯は画面の上に貼り付く目次で、押すとその節へスクロールし、いま見ている節を強調する（ui-box-list.js の HK.Toc）。節の頭に見出し（中に見出しのある経過・記録などは付けない） */
  var RV_ORDER = ['end', 'map', 'pair', 'who', 'log'];
  V.shell = function (o) {
    var tabs = o.tabs.slice().sort(function (a, b) { var x = RV_ORDER.indexOf(a.k), y = RV_ORDER.indexOf(b.k); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
    var cur = tabs[0].k;
    return '<div class="rvw" data-rv="' + cur + '" data-fs="' + rv.fs + '" data-why="' + (rv.why ? 1 : 0) + '" data-tlv="' + rv.tlv + '" data-side="' + (rv.side ? 1 : 0) + '">' + o.head +
      '<nav class="rvtabs" aria-label="結果の目次">' + tabs.map(function (t) {
        return '<button type="button" class="rvtab" id="rvt-' + t.k + '" data-act="rvtab" data-k="' + t.k + '" aria-controls="rvp-' + t.k + '"' + (t.k === cur ? ' aria-current="true"' : '') + ' title="「' + esc(t.label) + '」へ移る">' + esc(t.label) + (t.n ? '<small>' + esc(t.n) + '</small>' : '') + '</button>';
      }).join('') + '</nav>' +
      tabs.map(function (t) {
        var own = /^\s*<h2|id="tlhead"/.test(t.html);
        return '<section class="rvpane" id="rvp-' + t.k + '" data-pane="' + t.k + '" aria-label="' + esc(t.label) + '">' + (own ? '' : '<h2 class="rvph">' + esc(t.label) + (t.n ? '<small>' + esc(t.n) + '</small>' : '') + '</h2>') + t.html + '</section>';
      }).join('') +
      (o.foot ? '<div class="rvfoot">' + o.foot + '</div>' : '') + '</div>';
  };
  /* 「この回の条件（n 項目・初期値から m か所）」の折りたたみ。初期値から変えた札は濃く */
  V.cond = function (defs, env) {
    var n = 0, ch = 0;
    var chips = (defs || []).map(function (e) {
      var v = (env || {})[e.id];
      if (e.r18 && HK.SAFE_ON) return '';   /* R18版だけの環境値（夜の起こりやすさ）は全年齢モードでは出さない */
      var shown = e.type === 'select' ? ((e.options || []).filter(function (o) { return o.v === v; })[0] || {}).label : v + (e.unit || '');
      /* その設定ができる前にセーブした結果（値が無い・今は無い選択肢）は、その欄を出さない */
      if (v == null || shown == null) return '';
      n++;
      var d = e.def != null ? e.def : e.type === 'select' && e.options && e.options[0] ? e.options[0].v : null, on = d != null && String(d) !== String(v);
      if (on) ch++;
      return '<span class="chip' + (on ? ' rvon' : '') + '"' + (on ? ' title="初期値から変えた条件"' : '') + '>' + esc(e.label) + '：' + esc(shown) + '</span>';
    }).join('');
    if (!n) return '';
    return '<details class="rvcard rvcond"><summary><b>この回の条件</b><small>' + n + '項目・初期値から' + ch + 'か所</small></summary><div class="uses">' + chips + '</div>' + (ch ? '<p class="rvfootnote">濃い札が、初期値から変えた条件です。</p>' : '') + '</details>';
  };
  /* 頭の題名：結末の一文の最初の文（かぎかっこの中の句点では切らない）。全文は「結末」のカードに */
  function firstSentence(s) {
    s = String(s || '');
    var d = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if ('「『（(【'.indexOf(ch) >= 0) d++;
      else if ('」』）)】'.indexOf(ch) >= 0) d = Math.max(0, d - 1);
      else if (d === 0 && '。！？'.indexOf(ch) >= 0) return i + 1 < s.length && i >= 5 ? s.slice(0, i + 1) : s;
    }
    return s;
  }
  function unitOf(res, scen) { return Math.ceil(res.stepCount / (scen.perUnit || 1)) + (scen.unit === '月' ? 'か月' : scen.unit === '日' ? '日' : scen.unit === '時間' ? '時間' : '区切り') + '経過'; }

  V.render = function (host, res, opts) {
    var fresh = res && res !== lastRes;
    lastRes = res; lastHost = host; lastOpts = opts || {};
    if (fresh) rvFresh();
    if (fresh && !res.solo) { var sc0 = HK.SCENARIOS[res.scenId]; if (sc0 && sc0.longRun && sc0.longRun(res.env)) tl.keyOnly = true; }
    if (!res) { host.innerHTML = emptyState(lastOpts); return; }
    if (res.solo && HK.DView) { HK.DView.render(host, res, lastOpts, historyBlock(lastOpts.history || [])); return; }
    var scen = scenOf(res);
    var E = HK.Endings ? HK.Endings.build(res) : null;
    var sur = res.pairs.filter(function (p) { return p.surprise; });
    var nEv = res.log.filter(function (e) { return e.kind !== 'step' && !e.ch; }).length;
    /* 頭の題名：結果の一行（res.outcome。「合コンは終電で解散 ― …」）。無ければ結末の文の最初の文 */
    var hl = res.outcome || (E && E.headline ? firstSentence(E.headline) : '');
    var meta = esc(scen.name) + '・' + res.chars.length + '人・シード <span class="num">' + res.seed + '</span>・' + esc(unitOf(res, scen));
    host.innerHTML = V.shell({
      head: V.head({ meta: meta, title: hl ? paint(hl, res) : esc(scen.name), note: scen.note }),
      tabs: [
        { k: 'end', label: '結末', html: endPane(res, scen, E) },
        { k: 'log', label: '経過', n: nEv + '件', html: logPane(res, scen) },
        { k: 'map', label: '関係図', html: mapPane(res) },
        { k: 'pair', label: '二人ずつ', n: sur.length ? '意外 ' + sur.length : '', html: pairPane(res) },
        { k: 'who', label: '住人ごと', html: whoPane(res) }
      ],
      foot: historyBlock(lastOpts.history || [])
    });
  };

  /* ---------- 結末の切替（見本 10） ---------- */
  function endPane(res, scen, E) {
    var lines = res.pairs.filter(function (p) { return p.label !== 'strangers'; }).length;
    var main = endingBlock(res, E) + duoBlock(res) + afterBlock(res) + V.cond((scen.env || []).concat(HK.GLOBAL_ENV || []), res.env);
    var side = surBlock(res) + pineBlock(res) +
      '<button type="button" class="rvcard rvmaplink" data-act="rvtab" data-k="map"><b>関係図を見る</b><small>線 ' + lines + '本</small></button>';
    return '<div class="rvgrid rvg-end"><div class="rvmain">' + main + '</div><aside class="rvside">' + side + '</aside></div>';
  }
  /* 主な組：恋人の組を先に、あとは関係の強い順に4組まで（組の一文と関係の札。押すと「二人ずつ」で開く） */
  function duoBlock(res) {
    var ps = res.pairs.filter(function (p) { return p.label !== 'strangers' && p.cls !== 'none'; }).sort(function (a, b) { return ((b.label === 'lovers') - (a.label === 'lovers')) || (b.intensity - a.intensity); }).slice(0, 4);
    if (!ps.length) return '';
    return '<h3 class="rvsech">主な組</h3><div class="rvduo">' + ps.map(function (p) {
      var po = HK.pairIdx ? HK.pairIdx(res, p) : [p.a, p.b];
      return '<button type="button" class="rvcard rvduoc" data-act="rvpair" data-p="' + res.pairs.indexOf(p) + '"><span class="rvduoh"><span class="avpair">' + av(res, po[0], 30) + av(res, po[1], 30) + '</span><b class="rvduon">' + esc(res.chars[po[0]].name) + ' × ' + esc(res.chars[po[1]].name) + '</b><span class="lbl ' + p.cls + '">' + esc(p.name) + '</span></span>' +
        '<small class="rvduos">' + (p.tie ? 'もともと「' + esc(tieChip(p.tie, res)) + '」' : '相性予想：' + esc(p.base.kindLabel)) + (p.surprise ? '・意外' : '') + '</small><span class="rvduot">' + paint(p.text, res) + '</span></button>';
    }).join('') + '</div>';
  }
  /* それぞれのその後：住人ごとの結末と一文（押すと「住人ごと」で開く） */
  function afterBlock(res) {
    return '<section class="rvcard rvafter"><h3 class="rvh3">それぞれのその後</h3><ul class="rvaft">' + res.chars.map(function (c) {
      return '<li><button type="button" class="rvaftb" data-act="rvwho" data-i="' + c.i + '">' + av(res, c.i, 32, c.alive === false ? 'gone' : '') + '<span class="rvaftt"><span class="rvaftn"><b style="color:' + pc(c.i) + '">' + esc(c.name) + '</b><span class="fate ' + fateCls(c.fate) + '">' + esc(c.fate) + '</span></span>' + (c.fateNote ? '<span class="rvaftx">' + paint(c.fateNote, res) + '</span>' : '') + '</span></button></li>';
    }).join('') + '</ul></section>';
  }
  function surBlock(res) {
    var sur = res.pairs.filter(function (p) { return p.surprise; });
    if (!sur.length) return '';
    return '<section class="rvcard rvsidec"><h3 class="rvh3">意外な組み合わせ</h3><p class="rvsub">相性予想と結末が食い違った二人</p><ul class="rvsl">' + sur.slice(0, 8).map(function (p) {
      var po = HK.pairIdx ? HK.pairIdx(res, p) : [p.a, p.b];
      return '<li><button type="button" data-act="rvpair" data-p="' + res.pairs.indexOf(p) + '"><span class="rvslh"><b>' + esc(res.chars[po[0]].name) + ' × ' + esc(res.chars[po[1]].name) + '</b><span class="rvrel ' + p.cls + '">' + esc(p.name) + '</span></span><small>予想は「' + esc(p.base.kindLabel) + '」</small></button></li>';
    }).join('') + '</ul>' + (sur.length > 8 ? '<button type="button" class="rvlink" data-act="rvtab" data-k="pair">ほか' + (sur.length - 8) + '組は「二人ずつ」で ›</button>' : '') + '</section>';
  }
  function pineBlock(res) {
    var ps = res.pairs.filter(function (p) { return p.label === 'oneway' && p.dir != null && res.chars[p.dir]; });
    if (!ps.length) return '';
    return '<section class="rvcard rvsidec"><h3 class="rvh3">片想いのまま</h3><ul class="rvsl rvpine">' + ps.slice(0, 12).map(function (p) {
      var to = p.dir === p.a ? p.b : p.a;
      return '<li><button type="button" data-act="rvpair" data-p="' + res.pairs.indexOf(p) + '">' + nmc(res, p.dir) + '<span class="rvarr" aria-label="から">→</span>' + nmc(res, to) + '</button></li>';
    }).join('') + '</ul>' + (ps.length > 12 ? '<p class="rvfootnote">ほか' + (ps.length - 12) + '組</p>' : '') + '</section>';
  }

  /* ---------- 経過の切替（見本 09・11）：左に目次、中央に区切りのカード、右に絞り込み ---------- */
  function logPane(res, scen) {
    var G = tlGroups(res);
    return '<div class="rvgrid rvg-log"><nav class="rvtoc" id="rvtoc" aria-label="目次">' + toc(res, G) + '</nav>' +
      '<div class="rvmain"><div class="rvloghd"><h2 class="sec rvh2" id="tlhead">経過' + hotLegend(res) + '</h2>' + chSeg(res) + '<button type="button" class="btn small rvsidebtn" data-act="rvside" aria-expanded="' + rv.side + '" aria-controls="tlbar rvtoc">目次・絞り込み</button></div>' +
      (scen.longRun && scen.longRun(res.env) ? '<p class="hint">長期間のため、最初は重要な出来事だけの短縮版で表示しています。「重要な場面だけ」を外すと全部見られます。</p>' : '') +
      '<div class="tl" id="tl">' + timeline(res, G) + '</div></div>' +
      '<aside class="rvside rvrail" id="tlbar" aria-label="経過の絞り込み">' + tlBar(res) + '</aside></div>';
  }

  /* ---------- 関係図の切替（見本 12）：図（view-map.js の時点・絞り込み・派閥の囲みはそのまま）と、右に「表示する線」「選んだ線」 ---------- */
  function lineSample(k) {
    var cls = k === 'none' ? 'none' : k, w = LINE_W[cls] || 1.2, col = 'var(' + (CLS_VAR[cls] || '--none') + ')', dash = LINE_DASH[cls];
    var ln = '<line x1="1" y1="5" x2="' + (k === 'pine' ? 21 : 25) + '" y2="5" style="stroke:' + col + ';stroke-width:' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
    if (k === 'pine') ln += '<path d="M17,1.5 L22,5 L17,8.5" fill="none" style="stroke:' + col + ';stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round"/>';
    if (k === 'kill') ln += '<path d="M9.5,1.5 L16.5,8.5 M16.5,1.5 L9.5,8.5" fill="none" style="stroke:' + col + ';stroke-width:1.6;stroke-linecap:round"/>';
    return '<svg class="rvls" width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">' + ln + '</svg>';
  }
  function offStr() { return Object.keys(rv.off).filter(function (k) { return rv.off[k]; }).join(' '); }
  function mapTotal() { var t = 0; Object.keys(mapCnt).forEach(function (k) { t += mapCnt[k]; }); return t; }
  function mapInfo(res) {
    var who = tl.who.filter(function (i) { return res.chars[i]; }).map(function (i) { return res.chars[i].name; });
    return '<span>線 ' + mapTotal() + '本' + (who.length ? '・選んだ人：' + esc(who.join('・')) : '') + '</span>' + (who.length || rv.line ? '<button type="button" class="btn small" data-act="rvmapclear">選択を外す</button>' : '');
  }
  /* 図で押した線の組（時点の組と、結末の組） */
  function linePair(res) {
    if (!rv.line) return null;
    var hit = function (p) { return (p.a === rv.line.a && p.b === rv.line.b) || (p.a === rv.line.b && p.b === rv.line.a); };
    var R0 = atOf(res), at = R0.pairs.filter(hit)[0] || null, fin = res.pairs.filter(hit)[0] || null;
    return at || fin ? { at: at || fin, fin: fin } : null;
  }
  function mapSide(res) {
    var rows = KNAME.filter(function (x) { return mapCnt[x[0]]; }).map(function (x) {
      return '<button type="button" role="checkbox" class="rvchk rvmapk" data-act="rvmapk" data-k="' + x[0] + '" aria-checked="' + !rv.off[x[0]] + '"><i aria-hidden="true"></i>' + lineSample(x[0]) + '<span class="rvmk">' + esc(x[1]) + '</span><small>' + mapCnt[x[0]] + '</small></button>';
    }).join('');
    var lab = '<button type="button" role="checkbox" class="rvchk rvmapk" data-act="rvmaplab" aria-checked="' + rv.lab + '"><i aria-hidden="true"></i><span class="rvmk">線の名前を全部出す</span></button>';
    var L = linePair(res), sel;
    if (L) {
      var sp = L.at, fp = L.fin || L.at, po = HK.pairIdx && L.fin ? HK.pairIdx(res, fp) : [sp.a, sp.b], k = L.fin ? res.pairs.indexOf(L.fin) : -1;
      sel = '<div class="rvsub">選んだ線</div><div class="rvslh"><b>' + nmc(res, po[0]) + ' × ' + nmc(res, po[1]) + '</b><span class="lbl ' + sp.cls + '">' + esc(sp.name) + (sp.surprise ? '・意外' : '') + '</span></div>' +
        (fp.text ? '<p class="rvslt">' + paint(fp.text, res) + (fp.base ? '相性予想は「' + esc(fp.base.kindLabel) + '」だった。' : '') + '</p>' : '') +
        (k >= 0 ? '<button type="button" class="rvlink" data-act="rvpair" data-p="' + k + '">二人ずつで詳しく見る ›</button>' : '');
    } else sel = '<div class="rvsub">選んだ線</div><p class="rvfootnote">図の線を押すと、ここに二人の説明が出ます。</p>';
    return (rows ? '<section class="rvcard rvsidec"><h3 class="rvh3">表示する線</h3><div class="rvmapks">' + rows + lab + '</div></section>' : '') + '<section class="rvcard rvsidec rvselline">' + sel + '</section>';
  }
  function wrapCard(h) { return h ? '<section class="rvcard rvsec2">' + h + '</section>' : ''; }
  function mapPane(res) {
    var MV = HK.MapView, sv = mapSvg(res);
    return '<div class="rvgrid rvg-map"><div class="rvmain"><section class="rvcard rvmapcard"><div class="rvmaphd">' + (MV && MV.atBar ? MV.atBar(res) : '') + '<span class="rvmapinfo" id="rvmapinfo">' + mapInfo(res) + '</span></div>' +
      '<figure class="trayfig">' + (MV ? '<div id="mapbar">' + MV.bar(res) + '</div>' : '') + '<div class="tray" id="map" data-off="' + offStr() + '">' + sv + '</div>' +
      '<figcaption><div class="maplegs">' + mapLegend(res) + '</div><div class="mapcap"><span>丸を押すとその人の線だけ濃くなり、経過もその人に絞り込みます。線を押すと右に二人の説明が出ます。＊は意外な組み合わせ。矢印は気持ちや行為の向き。</span><span>砂箱 57×72×7cm</span></div></figcaption></figure></section>' +
      wrapCard(MV ? MV.classChart(res) : '') + wrapCard(factionBlock(res)) + '</div>' +
      '<aside class="rvside" id="rvmapside">' + mapSide(res) + '</aside></div>';
  }
  /* 図と右の欄だけ描き直す（線を押した・線の名前を全部出す） */
  function refreshMap() {
    if (!lastRes || !lastHost || lastRes.solo) return;
    var m = lastHost.querySelector('#map');
    if (!m) return;
    m.innerHTML = mapSvg(lastRes);
    var mb = lastHost.querySelector('#mapbar'), ms = lastHost.querySelector('#rvmapside'), mi = lastHost.querySelector('#rvmapinfo');
    if (mb && HK.MapView) mb.innerHTML = HK.MapView.bar(lastRes);
    if (ms) ms.innerHTML = mapSide(lastRes);
    if (mi) mi.innerHTML = mapInfo(lastRes);
  }

  V.refreshTimeline = function () {
    if (!lastRes || !lastHost || lastRes.solo) return;
    var m = lastHost.querySelector('#map'), b = lastHost.querySelector('#tlbar'), t = lastHost.querySelector('#tl'), tc = lastHost.querySelector('#rvtoc');
    if (m) m.innerHTML = mapSvg(lastRes);
    var mb = lastHost.querySelector('#mapbar');
    if (mb && HK.MapView) mb.innerHTML = HK.MapView.bar(lastRes);
    var G = b || t || tc ? tlGroups(lastRes) : null;
    if (b) b.innerHTML = tlBar(lastRes);
    if (t) t.innerHTML = timeline(lastRes, G);
    if (tc) tc.innerHTML = toc(lastRes, G);
    var ms = lastHost.querySelector('#rvmapside'), mi = lastHost.querySelector('#rvmapinfo');
    if (ms && m) ms.innerHTML = mapSide(lastRes);
    if (mi && m) mi.innerHTML = mapInfo(lastRes);
  };
  V.toggleWho = function (i) {
    var k = tl.who.indexOf(i);
    if (k >= 0) tl.who.splice(k, 1); else tl.who.push(i);
    V.refreshTimeline();
  };
  V.setWho = function (arr) { tl.who = arr.slice(); V.refreshTimeline(); };
  V.toggleKey = function () { tl.keyOnly = !tl.keyOnly; V.refreshTimeline(); };
  V.toggleLewd = function () { tl.lewd = !tl.lewd; V.refreshTimeline(); };
  V.setCat = function (c) { tl.cat = c; V.refreshTimeline(); };
  /* 「すべて」：種類・重要のみ・エロシーンだけを外す（住人の絞り込みはそのまま） */
  V.showAllKinds = function () { tl.keyOnly = false; tl.lewd = false; tl.cat = 'all'; tl.off = {}; V.refreshTimeline(); };

  /* ---------- 切替・操作（このファイルで受ける。ui.js の data-act の switch には無い名前だけ） ---------- */
  function rvHost() { return document.getElementById('view-result'); }
  function rvWrap() { var h = rvHost(); return h ? h.querySelector('.rvw') : null; }
  /* 節 k へ移る（2026-11-02 担当UI：切り替える代わりに、その節の頭が目次の下に来るようにスクロールする。noScroll は呼び手が中の位置へスクロールするとき） */
  V.showTab = function (k, noScroll) {
    var w = rvWrap(), pane = w && w.querySelector('#rvp-' + k);
    if (!pane) return false;
    rv.tab = k; rvSave();
    w.setAttribute('data-rv', k);
    if (!noScroll) { if (HK.Toc) HK.Toc.go(pane, w.querySelector('.rvtabs'), 'rv', k); else pane.scrollIntoView({ block: 'start' }); }
    else if (HK.Toc) HK.Toc.sync();
    return true;
  };
  V.tab = function () { return rv.tab; };
  function menu(open) {
    var w = rvWrap(), b = w && w.querySelector('[data-act="rvmenu"]'), m = w && w.querySelector('#rvmenu');
    if (!b || !m) return;
    if (open == null) open = m.hidden;
    m.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
    /* スマホでは下に固定した板になるので、開いている間は背景のスクロールを止める（ui-modal.js。2026-11-02） */
    if (HK.Modal && window.matchMedia && window.matchMedia('(max-width:600px)').matches) { if (open) HK.Modal.lock(m); else HK.Modal.unlock(m); }
  }
  function setSec(el, open) {
    el.classList.toggle('rvfold', !open);
    var b = el.querySelector('.when .rvfoldbtn');
    if (b) { b.setAttribute('aria-expanded', String(open)); b.textContent = open ? '畳む' : '開く'; }
    rv.sec[el.getAttribute('data-s')] = open;
  }
  function jump(key, sub) {
    var h = rvHost(), el = h && h.querySelector('#rvs-' + key);
    if (!el) return;
    setSec(el, true);
    /* 日の中の中見出し（朝・日中・夜）へ：日を開いてから、その見出しへ */
    var s = sub ? el.querySelector('#rvs-' + sub) : null;
    (s || el).scrollIntoView({ block: 'start' });
  }
  /* 出来事 n へ（「転機：… を経過で読む」）。絞り込みで隠れていれば絞り込みを外す */
  function gotoEv(n) {
    if (!V.showTab('log', true)) return;
    var h = rvHost(), q = '#tl li.ev[data-n="' + n + '"]', li = h.querySelector(q);
    if (!li) { tl.who = []; tl.keyOnly = false; tl.lewd = false; tl.cat = 'all'; tl.off = {}; tl.ch = lastRes && lastRes.log[n] ? chOf(lastRes.log[n]) : 'main'; chSync(); V.refreshTimeline(); li = h.querySelector(q); }
    if (!li) return;
    var sb = li.closest('.stepblk'), d = li.closest('details');
    if (sb) setSec(sb, true);
    if (d) d.open = true;
    li.classList.add('rvflash');
    setTimeout(function () { li.classList.remove('rvflash'); }, 1800);
    li.scrollIntoView({ block: 'center' });
  }
  function pickPair(k) {
    var res = lastRes;
    if (!res || res.solo || !res.pairs[k]) return;
    rv.pair = k;
    V.showTab('pair');
    var h = rvHost(), d = h.querySelector('#rvpairdet'), ul = h.querySelector('.rvplist[data-f]');
    if (d) d.innerHTML = pairDetail(res.pairs[k], res);
    if (ul) {
      var li = ul.querySelector('[data-act="rvpair"][data-p="' + k + '"]');
      /* 一覧を絞っていて隠れる組なら「すべて」に戻す */
      if (li && rv.plist !== 'all' && getComputedStyle(li.parentNode).display === 'none') plf('all');
      Array.prototype.forEach.call(ul.querySelectorAll('[data-act="rvpair"]'), function (b) { b.setAttribute('aria-current', String(+b.getAttribute('data-p') === k)); });
      if (li && li.scrollIntoView && ul.scrollHeight > ul.clientHeight) { var r = li.getBoundingClientRect(), u = ul.getBoundingClientRect(); if (r.top < u.top || r.bottom > u.bottom) ul.scrollTop += r.top - u.top - 40; }
    }
    if (d && window.innerWidth <= 760) d.scrollIntoView({ block: 'start' });
  }
  function plf(f) {
    rv.plist = f;
    var h = rvHost(), ul = h && h.querySelector('.rvplist[data-f]');
    if (ul) ul.setAttribute('data-f', f);
    if (h) Array.prototype.forEach.call(h.querySelectorAll('[data-act="rvplf"]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)); });
  }
  function pickWho(i) {
    var res = lastRes;
    if (!res || res.solo || !res.chars[i]) return;
    rv.who = i;
    V.showTab('who');
    var h = rvHost(), d = h.querySelector('#rvwhodet');
    if (d) d.innerHTML = charDetail(res.chars[i], res);
    Array.prototype.forEach.call(h.querySelectorAll('.rvwlist [data-act="rvwho"]'), function (b) { b.setAttribute('aria-current', String(+b.getAttribute('data-i') === i)); });
  }
  function wrapAttr(k, v) { var w = rvWrap(); if (w) w.setAttribute(k, v); }
  /* 記録の欄の切り替えの押された印を、いまの欄に合わせる（見出しの横は描き直さないので） */
  function chSync() {
    var h = rvHost();
    if (h) Array.prototype.forEach.call(h.querySelectorAll('[data-act="rvch"]'), function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-v') === (tl.ch || 'main'))); });
    var w = rvWrap();
    if (w) w.setAttribute('data-ch', tl.ch || 'main');
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest('[data-act]');
    /* 保存・共有の窓：外を押したら閉じる */
    var mw = rvWrap(), mm = mw && mw.querySelector('#rvmenu');
    if (mm && !mm.hidden && !(ev.target.closest && ev.target.closest('.rvsave'))) menu(false);
    if (!t) return;
    var a = t.getAttribute('data-act');
    if (a === 'tlall') { if (lastRes) V.showAllKinds(); return; }
    if (a.indexOf('rv') !== 0 && a !== 'mapline') return;
    switch (a) {
      case 'rvtab': ev.preventDefault(); V.showTab(t.getAttribute('data-k')); break;
      case 'rvmenu': menu(); break;
      case 'rvfold': var sb = t.closest('.stepblk'); if (sb) setSec(sb, sb.classList.contains('rvfold')); break;
      case 'rvjump': jump(t.getAttribute('data-s'), t.getAttribute('data-sub')); break;
      case 'rvgoto': gotoEv(+t.getAttribute('data-n')); break;
      case 'rvcat': var c = t.getAttribute('data-c'); tl.off[c] = !tl.off[c]; V.refreshTimeline(); break;
      case 'rvwhy': rv.why = !rv.why; rvSave(); wrapAttr('data-why', rv.why ? 1 : 0); t.setAttribute('aria-checked', String(rv.why)); break;
      case 'rvopen': rv.open = !rv.open; rv.sec = {}; rvSave(); V.refreshTimeline(); break;
      case 'rvfs':
        rv.fs = t.getAttribute('data-v') || 'm'; rvSave(); wrapAttr('data-fs', rv.fs);
        Array.prototype.forEach.call(t.parentNode.querySelectorAll('[data-act="rvfs"]'), function (b) { b.setAttribute('aria-checked', String(b === t)); });
        break;
      case 'rvtlv':
        var tv0 = rv.tlv, tv1 = t.getAttribute('data-v');
        rv.tlv = tv1 === 'line' || tv1 === 'bubble' ? tv1 : 'card'; rvSave(); wrapAttr('data-tlv', rv.tlv);
        var tw0 = rvWrap();
        if (tw0) Array.prototype.forEach.call(tw0.querySelectorAll('[data-act="rvtlv"]'), function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-v') === rv.tlv)); });
        /* 吹き出しへ／から：本文の HTML が変わるので、記録の本文だけ描き直す（カード⇔線は属性だけ） */
        if ((tv0 === 'bubble') !== (rv.tlv === 'bubble')) tlvRedraw();
        break;
      case 'rvside': rv.side = !rv.side; wrapAttr('data-side', rv.side ? 1 : 0); t.setAttribute('aria-expanded', String(rv.side)); break;
      case 'rvreset': tl.who = []; tl.keyOnly = false; tl.lewd = false; tl.cat = 'all'; tl.off = {}; V.refreshTimeline(); break;
      case 'rvch': tl.ch = t.getAttribute('data-v') || 'main'; chSync(); V.refreshTimeline(); break;
      case 'rvpair':
        if (t.hasAttribute('data-p')) pickPair(+t.getAttribute('data-p'));
        break;
      case 'rvplf': plf(t.getAttribute('data-f') || 'all'); break;
      case 'rvwho': pickWho(+t.getAttribute('data-i')); break;
      case 'rvwholog': V.showTab('log', true); V.setWho([+t.getAttribute('data-i')]); var th = rvHost().querySelector('#tlhead'); if (th) th.scrollIntoView({ block: 'start' }); break;
      case 'mapline':
        var na = +t.getAttribute('data-a'), nb = +t.getAttribute('data-b');
        rv.line = rv.line && rv.line.a === na && rv.line.b === nb ? null : { a: na, b: nb };
        refreshMap(); break;
      case 'rvmapk':
        var k = t.getAttribute('data-k'); rv.off[k] = !rv.off[k]; t.setAttribute('aria-checked', String(!rv.off[k]));
        var mp = rvHost().querySelector('#map'); if (mp) mp.setAttribute('data-off', offStr());
        break;
      case 'rvmaplab': rv.lab = !rv.lab; refreshMap(); break;
      case 'rvmapclear': rv.line = null; V.setWho([]); break;
    }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { var mw = rvWrap(), mm = mw && mw.querySelector('#rvmenu'); if (mm && !mm.hidden) { menu(false); var b = mw.querySelector('[data-act="rvmenu"]'); if (b) b.focus(); } return; }
    /* 目次は左右の矢印でも移れる */
    var t = ev.target;
    if (!(t && t.classList && t.classList.contains('rvtab')) || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
    var all = Array.prototype.slice.call(t.parentNode.querySelectorAll('.rvtab')), i = all.indexOf(t), nx = all[(i + (ev.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    if (nx) { ev.preventDefault(); V.showTab(nx.getAttribute('data-k')); nx.focus(); }
  });

  /* ---------- 結末 ---------- */
  /* 結末の一文のカード（見本 10）：結末の文・数の小箱・「転機：T03 … を経過で読む ›」・箱庭ごとの結末の行（形はそのまま） */
  function endingBlock(res, E) {
    if (!HK.Endings) return '';
    E = E || HK.Endings.build(res);
    /* 体の関係にならない組の但し書き（出られない部屋）：見出しのすぐ下に帯で（ui-env.js の HK.NgBand.ending。記録を読むだけ） */
    var ngb = HK.NgBand && HK.NgBand.ending ? HK.NgBand.ending(res, E) : '';
    /* 全体の転機（いちばん大きい組の転機）：押すと経過のその出来事へ */
    var top = hotInfo(res).top, te = top != null ? res.log[top] : null;
    var turn = te && tno(te.step) ? '<button type="button" class="rvlink rvturn" data-act="rvgoto" data-n="' + top + '"><span class="hot">転機：' + tno(te.step) + '</span>' + (te.label ? '<span>' + esc(te.label) + '</span>' : '') + 'を経過で読む ›</button>' : '';
    return '<section class="ending rvcard rvending" aria-label="結末"><p class="ehead">' + paint(E.headline, res) + '</p>' +
      (E.stats.length ? '<dl class="estats">' + E.stats.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' : '') + turn + ngb +
      (E.lines.length ? '<ul class="elines">' + E.lines.map(function (l) { return '<li>' + paint(l, res) + '</li>'; }).join('') + '</ul>' : '') +
      (HK.Epilogue && HK.Epilogue.html ? HK.Epilogue.html(E, res, paint) : '') + (E.after || '') + '</section>';
  }

  /* ---------- 派閥 ---------- */
  /* 派閥の印（関係図の囲み・クラスの表と同じ番号の形。view-map.js の HK.MapView.fmark）。図に無い派閥（過去の派閥）は印なし */
  function facMark(res, leader) {
    var MV = HK.MapView, k = MV && MV.fidx ? MV.fidx(res, leader) : -1;
    return k < 0 ? null : { k: k, mark: MV.fmark(k), cls: MV.fcls(k), col: MV.fcol(k) };
  }
  function groupChips(g, res, regime) {
    var fm = facMark(res, g.leader);
    return '<span class="fgroup' + (regime === 'dictator' ? ' dict' : '') + (fm ? ' fg ' + fm.cls : '') + '"' + (fm ? ' style="--fc:' + fm.col + '"' : '') + '><b>' + (fm ? fm.mark : '') + av(res, g.leader, 20) + esc(res.chars[g.leader].name) + '派</b>' +
      g.members.filter(function (m) { return m !== g.leader; }).map(function (m) { return '<span>' + av(res, m, 20) + esc(res.chars[m].name) + '</span>'; }).join('') + '</span>';
  }
  function factionBlock(res) {
    var F = res.factions;
    if (!F) return '';
    var R = HK.Factions.REGIME, h = F.hist;
    var last = h.length ? h[h.length - 1] : null;
    var ever = h.some(function (x) { return x.groups.length; });
    var peak = h.reduce(function (m, x) { return x.groups.length > (m ? m.groups.length : -1) ? x : m; }, null);
    var head;
    if (!last) head = '派閥が動く前に終わった。';
    else if (!ever) head = '派閥は一度も生まれなかった。' + (last.reason ? last.reason + '。' : '');
    else head = '最終的な体制：<b>' + esc(R[last.regime]) + '</b>' + (last.reason ? '。' + esc(last.reason) : '') + (last.regime === 'none' ? '' : '');
    var now = last && last.groups.length ? '<div class="frow">' + last.groups.map(function (g) { return groupChips(g, res, last.regime); }).join('') +
      (last.loners.length ? '<span class="fgroup lone"><b>無所属</b>' + last.loners.map(function (m) { return '<span>' + av(res, m, 20) + esc(res.chars[m].name) + '</span>'; }).join('') + '</span>' : '') + '</div>' : '';
    var rows = h.map(function (x) {
      return '<li><span class="st">' + esc(x.label) + '</span><span class="rg">' + esc(R[x.regime]) + '</span>' +
        (x.groups.length ? x.groups.map(function (g) { var fm = facMark(res, g.leader); return (fm ? fm.mark : '') + esc(res.chars[g.leader].name) + '派（' + g.members.length + '）'; }).join('　') + (x.loners.length ? '　無所属' + x.loners.length : '') : '') + '</li>';
    }).join('');
    /* 派閥の決め方・リーダーの決め方（factions.js の facMode・facLead。選んでいない結果は今までどおり） */
    var fm = (res.env || {}).facMode, fl = (res.env || {}).facLead;
    var hint = fm === 'none' ? '派閥は生まれない設定。' : fm === 'fix' ? '「仲間とみなす」グループをそのまま派閥にする設定（抜ける・鞍替え・解散は起きず、死亡・退場だけ反映。仲間のグループが無ければ自動）。' : F.min + '人以上いるときだけ派閥が生まれる設定。人を引っぱる気質（CP・A高／AC低）の人物と、その人への信頼が揃うと輪ができる。';
    if (fl && fl !== 'auto' && fm !== 'none') hint += 'リーダーは派閥の中で' + fl + 'が最も高い人（交代しない）。';
    return '<h2 class="sec">派閥</h2><p class="hint">' + hint + '</p>' +
      '<div class="panel fpanel"><p class="fhead">' + head + '</p>' + now +
      (ever && peak && peak !== last ? '<p class="hint" style="margin:8px 0 0">最も分裂したのは' + esc(peak.label) + '（' + esc(R[peak.regime]) + '）。</p>' : '') +
      (rows ? '<ol class="fhist">' + rows + '</ol>' : '') + '</div>';
  }

  function emptyState() {
    return '<div class="empty panel rvcard rvemptyc"><div class="t">箱庭はまだ空っぽです</div><p>住人と箱庭を選んで「箱庭を動かす」を押すと、ここに結末・経過・関係図・二人ずつ・住人ごとの結果が並びます。</p><button class="btn primary" data-act="run">いまの条件で動かす</button></div>' + historyBlock(lastOpts.history || [], true);
  }

  /* これまでの箱庭（履歴）：カードの折りたたみ。開くと動かしたときの結果をそのまま表示する（ui.js の histOpen。説明と「結果なし」の印は ui.js の histDeco が足す） */
  function historyBlock(h, open) {
    if (!h.length) return '';
    return '<details class="rvcard rvhist"' + (open ? ' open' : '') + '><summary><b>これまでの箱庭</b><small>' + h.length + '件</small></summary><p class="hint">同じ条件とシードで再現します。名簿は書き換えません。</p><div class="hist">' + h.map(function (it, k) {
      var d = new Date(it.t);
      var when = (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      return '<button class="btn" data-act="hist" data-k="' + k + '"><span class="when">' + when + '</span><b>' + esc(it.scenName) + '</b><span>' + esc(it.names) + '</span><span class="nums">シード ' + it.seed + '</span>' + (it.summary ? '<span class="hint" style="margin:0">' + esc(it.summary) + '</span>' : '') + '</button>';
    }).join('') + '</div></details>';
  }

  /* テキスト書き出し */
  V.toText = function (res) {
    if (res.solo && HK.DView) return HK.DView.toText(res);
    var scen = scenOf(res), L = [];
    L.push('【箱庭シミュレーター】' + scen.name + '（シード ' + res.seed + '）');
    if (HK.Endings) {
      var E = HK.Endings.build(res);
      L.push('');
      L.push('■ 結末');
      L.push(E.headline);
      if (E.stats.length) L.push(E.stats.map(function (s) { return s[0] + ' ' + s[1]; }).join('／'));
      E.lines.forEach(function (l) { L.push('・' + l); });
      (E.last || []).forEach(function (x) { L.push('・最期の言葉　' + x.text); });
    }
    L.push('');
    L.push('■ 住人の結末');
    res.chars.forEach(function (c) { L.push('・' + c.name + '：' + c.fate + (c.fateNote ? '（' + c.fateNote + '）' : '')); });
    /* 派閥の一覧と、クラスメイトの学年・クラスの一覧（view-map.js） */
    if (HK.MapView) HK.MapView.textLines(res).forEach(function (l) { L.push(l); });
    L.push('');
    L.push('■ 関係');
    res.pairs.forEach(function (p) {
      L.push('・' + (HK.pairName ? HK.pairName(res, p) : res.chars[p.a].name + '×' + res.chars[p.b].name) + '：' + p.name + (p.surprise ? '［意外］' : '') + '　' + p.text);
      p.key.forEach(function (n) { var e = res.log[n]; L.push('　　' + e.label + '　' + (HK.lewdEvent && HK.lewdBrief && HK.lewdEvent(e) ? HK.lewdBrief(e) : e.text)); });
    });
    L.push('');
    L.push('■ 時系列');
    var nmList = res.chars.map(function (c) { return c.name; });
    res.log.forEach(function (e) {
      if (e.kind === 'step') L.push('― ' + e.label);
      else if (!e.ch) L.push('　' + (HK.fmtLong ? HK.fmtLong(e.text, nmList) : e.text));
    });
    /* 記録の欄（e.ch。コメント欄など）：本編のあとに、区切りごとに */
    chList(res).forEach(function (c) {
      L.push('');
      L.push('■ ' + CH_NAME[c]);
      var lab = null;
      res.log.forEach(function (e) {
        if (e.kind === 'step') { lab = e.label; return; }
        if (chOf(e) !== c) return;
        if (lab != null) { L.push('― ' + lab); lab = null; }
        String(e.text || '').split(/\n+/).forEach(function (l) { if (l.trim()) L.push('　' + l.trim()); });
      });
    });
    return L.join('\n');
  };
})();
