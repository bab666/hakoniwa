/* 箱庭シミュレーター: 住人タブの上部「住人をまとめて登録」の描画（2026-10-27 のデザインの適用。結果には影響しない）
   ui.js の renderCast が HK.CastImport.html(o) を差し込む。ボタンの処理（data-act の import-add・import-replace・export・jsonout・jpick・jsonadd・jsonrep・quiz）は ui.js のまま。
   ここで扱うのは、貼り付け欄の「n 行を検出」（ui.js の読み取り HK.UI.parseRoster＝parseGrouped で数える）と「サンプルを入れる」、折りたたみの開閉の保存だけ。
   節の形：
   ・上：左に貼り付け欄（#bulk）と［取り込む］（primary）［質問に答えて診断］「サンプルを入れる」（ghost）「n 行を検出」、右に書き方の箱（FORMAT。スマホ幅では下）
   ・「書き出し・読み込み（JSON・名簿）」：<details>（既定は閉じる。「選んだ住人だけ書き出す」を開いているあいだは開く）。書き出す／読み込むの2列に、ボタンといつ使うかの1行
   ・「別の端末へ移す」：portable.js の html()（見出しは .cgh でここと同じ段。保存フォルダの欄の折りたたみ .sfdet の開閉も、ここの鍵に保存する）
   開閉の保存：localStorage の hakoniwa_castio_v1（版ごと。HK.STORE.key）に { io: 開いているか, sf: 保存フォルダの欄を開いているか }。
   見出し（h2.sec）は ui-fold.js の節の折りたたみのまま（この中の <details> は .fold にしないので二重にならない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var KEY = HK.STORE ? HK.STORE.key('hakoniwa_castio_v1') : 'hakoniwa_castio_v1', fold = {};
  try { fold = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { fold = {}; }
  function put() { try { localStorage.setItem(KEY, JSON.stringify(fold)); } catch (e) { /* 保存できなくても開閉はできる */ } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* 貼り付け欄の中身：住人タブを描き直しても残す（取り込めたら ui.js が空にする） */
  var text = '';
  var EGO = '<a href="https://kaimin.sakura.ne.jp/archive/tools/ego/" target="_blank" rel="noopener">ふたりのエゴグラム</a>';
  var SAMPLE = '田中のエゴグラムは「BABAB」焦がすほどの太陽でした。\n佐藤：CBADB // 幼なじみ\n- 鈴木 abbcd';
  var FAC = [['CP', 'きびしさ・規律'], ['NP', 'やさしさ・面倒見'], ['A', '冷静さ・計算'], ['FC', '無邪気さ・自由さ'], ['AC', '協調・遠慮']];

  var css =
    /* 見出しの右の一言（閉じているときとスマホ幅では出さない） */
    'h2.sec.imphead{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;flex:1;min-width:0}h2.sec.imphead .secnote{margin-left:auto}h2.sec.imphead .secnote::after{margin-left:0}' +
    'details.fold:not([open]) h2.sec.imphead .secnote{display:none}' +
    /* 貼り付け欄と書き方の箱 */
    '.impgrid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px;align-items:stretch}' +
    /* 貼り付け欄は右の箱の高さまで伸ばす（スマホ幅では 150px） */
    '.impmain{display:flex;flex-direction:column;gap:10px;min-width:0}.impmain textarea{min-height:150px;flex:1 1 auto}' +
    '.impbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.impbar .spacer{flex:1}' +
    '.impcnt{font-family:var(--f-num);font-size:12px;color:var(--muted);white-space:nowrap}.impcnt b{font-weight:600;color:var(--ink)}' +
    '.impmain .warn{margin:0}' +
    '.impfmt{border:1px solid var(--line);border-radius:var(--r-card,6px);background:var(--bg1);padding:14px 16px;display:flex;flex-direction:column;gap:10px;font-size:12.5px;line-height:1.7;min-width:0}' +
    '.impfmt p{margin:0}.impfmt .sub{font-size:11.5px;color:var(--muted)}' +
    '.impfmt .ex{display:block;font-family:var(--f-num);font-size:12px;padding:8px 10px;background:var(--paper);border:1px solid var(--line);border-radius:var(--r,4px);white-space:pre-wrap;word-break:break-all;color:var(--ink)}' +
    '.impfmt ul{margin:0;padding:0;list-style:none;display:grid;gap:4px}' +
    '.impfmt .fac li{display:flex;gap:10px;font-size:12px}.impfmt .fac .k{width:2.4em;flex:none;font-family:var(--f-num);font-weight:600;letter-spacing:.06em}.impfmt .fac .v{color:var(--muted2)}' +
    '.impfmt .forms>summary{cursor:pointer;font-size:12px;color:var(--muted2);width:max-content;max-width:100%}.impfmt .forms>summary:hover{color:var(--ink)}.impfmt .forms ul{margin-top:6px}' +
    '.impfmt .forms li{font-size:12px;color:var(--muted2);line-height:1.6}.impfmt .forms code{font-family:var(--f-num);font-size:11.5px;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:3px;padding:0 4px;word-break:break-all}' +
    /* 下の2つのまとまり（書き出し・読み込み／別の端末へ移す）の見出し：h3 相当の太字＋下罫線 */
    '.cgh,.impio>summary{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 10px;margin:0 0 10px;padding:0 0 6px;border-bottom:1px solid var(--line);font-size:14px;font-weight:700;line-height:1.5;color:var(--ink)}' +
    '.impio{margin-top:28px}.impio>summary{cursor:pointer;list-style:none;margin-bottom:0}.impio[open]>summary{margin-bottom:12px}' +
    '.impio>summary::-webkit-details-marker,.sfdet>summary::-webkit-details-marker{display:none}.impio>summary::marker,.sfdet>summary::marker{content:""}' +
    '.impio>summary::before,.sfdet>summary::before{content:"";flex:none;align-self:center;width:6px;height:6px;margin:0 4px 3px 2px;border-right:1.5px solid var(--muted);border-bottom:1.5px solid var(--muted);transform:rotate(-45deg);transition:transform .15s}' +
    '.impio[open]>summary::before,.sfdet[open]>summary::before{transform:rotate(45deg);margin-bottom:5px}' +
    '.impio>summary:hover::before,.sfdet>summary:hover::before{border-color:var(--ink)}' +
    '.impio>summary:focus-visible,.sfdet>summary:focus-visible{outline:2px solid var(--ink);outline-offset:2px}' +
    '.cgh .sub,.impio>summary .sub{font-size:12px;font-weight:400;color:var(--muted)}' +
    '.iogrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 28px}' +
    '.iocol{display:flex;flex-direction:column;gap:10px;min-width:0}.iocol .eyebrow{margin:0}' +
    '.ioit{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;align-items:baseline}.ioit .btn{justify-self:start;white-space:nowrap}' +
    '.ioit p{margin:0;font-size:12px;color:var(--muted);line-height:1.6}' +
    '.impio .iobk{margin:12px 0 0;font-size:12px;color:var(--muted);padding-left:8px;border-left:2px solid var(--line2)}' +
    '.impio .jpick{margin-top:12px!important}' +
    '@media (max-width:760px){.impgrid{grid-template-columns:minmax(0,1fr)}.impmain textarea{flex:none}.iogrid{grid-template-columns:minmax(0,1fr)}}' +
    '@media (max-width:600px){h2.sec.imphead .secnote{display:none}.ioit{grid-template-columns:minmax(0,1fr)}.impbar .spacer{display:none}.impcnt{flex-basis:100%}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* 貼り付け欄の数：読めた住人の数と、読めなかった行の数 */
  function parse(t) {
    var P = HK.UI && HK.UI.parseRoster ? HK.UI.parseRoster : HK.parseRoster;
    try { return P ? P(t) : { chars: [], warnings: [] }; } catch (e) { return { chars: [], warnings: [] }; }
  }
  function countHtml(t) {
    if (!String(t || '').trim()) return '貼り付けると、読めた行の数が出ます';
    var r = parse(t), bad = r.warnings.filter(function (w) { return /読み取れませんでした/.test(w); }).length;
    return '<b>' + r.chars.length + '</b> 行を検出' + (bad ? '（' + bad + ' 行は読めません）' : '');
  }
  var tm = null;
  function recount() { var c = document.getElementById('bulkcount'), b = document.getElementById('bulk'); if (c && b) c.innerHTML = countHtml(b.value); }

  function fmtBox() {
    return '<aside class="impfmt" aria-labelledby="impfmt-h"><span class="eyebrow" id="impfmt-h">Format</span>' +
      '<p>1 行に 1 人。名前と 5 文字のコードが入っていれば認識します。</p>' +
      '<code class="ex">名前のエゴグラムは「BABAB」〇〇でした。</code>' +
      '<p class="sub">「' + EGO + '」の結果の文をそのまま貼れます（〇〇のタイプ名はメモに入ります）。</p>' +
      '<ul class="fac">' + FAC.map(function (f) { return '<li><span class="k">' + f[0] + '</span><span class="v">' + f[1] + '</span></li>'; }).join('') + '</ul>' +
      '<p class="sub">コードはこの順に、A（とても強い）〜 D（控えめ）の 4 段階。</p>' +
      /* ほかの書き方（ui.js の parseGrouped・core.js の HK.parseRoster が読める形）。開閉は保存しない */
      '<details class="forms"><summary>ほかの書き方</summary><ul>' +
      '<li><code>名前 BABAB</code>／<code>名前：BABAB</code>（小文字でも）</li>' +
      '<li><code>- 名前 BABAB</code> … 行頭の「-」「・」「1.」は飛ばします</li>' +
      '<li><code>名前 BABAB // 後輩</code> … // の後ろはメモ</li>' +
      '<li><code>名前 CP14 NP6 A16 FC12 AC4</code> … 点数でも（高・中・低も可）</li>' +
      '<li><code>【グループ名】</code> … この行から下の住人にグループが付きます</li>' +
      '<li>結果ページの URL の行は読み飛ばします。同じ名前の住人がいれば、エゴグラムを書き換えます</li>' +
      '<li>CSV など、ほかの形は見出しの ？ にあります</li>' +
      '</ul></details></aside>';
  }
  /* 書き出し・読み込み：ボタンといつ使うかの1行 */
  function item(act, label, desc, extra) { return '<div class="ioit"><button class="btn small" data-act="' + act + '"' + (extra || '') + '>' + label + '</button><p>' + desc + '</p></div>'; }
  function ioBox(o) {
    var open = o.jp || !!fold.io;
    return '<details class="impio" id="impio"' + (open ? ' open' : '') + '><summary>書き出し・読み込み（JSON・名簿）<span class="sub">バックアップや、ほかのブラウザ・人との受け渡しに</span></summary>' +
      '<div class="iogrid"><div class="iocol"><span class="eyebrow">書き出す</span>' +
      item('jsonout', '住人をJSONで書き出す', '全員の住人・関係・設定（アイコンも）を1つのファイルにします。バックアップや入れ替えに。') +
      item('jpick', '選んだ住人だけ書き出す', 'チェックした住人だけのファイルを作ります。自分のキャラだけを人に渡すときに。', ' aria-expanded="' + (o.jp ? 'true' : 'false') + '"') +
      item('export', '名簿をテキストでコピー', '名前と5文字コードを文字でコピーします（グループは【見出し】つき）。上の欄に貼れば読み込めます。') +
      '</div><div class="iocol"><span class="eyebrow">読み込む</span>' +
      item('jsonadd', 'JSONを足す', '今の住人はそのままで、ファイルの住人を足します（同じ名前の住人は、ファイルの内容で上書き）。') +
      item('jsonrep', 'JSONで置き換える', '今の住人と関係を消して、ファイルの内容だけにします。') +
      item('import-replace', '名簿を置き換える', '上の欄に貼った住人だけの名簿にします（今の住人は消えます）。') +
      '</div></div>' + (o.pick || '') +
      '<input type="file" id="jsonfile" accept=".json,application/json" hidden>' +
      '<p class="iobk">念のため、キャラクター設定・セーブデータなどは定期的なバックアップをお願いいたします（「住人をJSONで書き出す」か、下の「まるごと書き出し」でファイルに残せます）。</p></details>';
  }
  /* o：{ full: 上限まで登録しているか, jp: 「選んだ住人だけ書き出す」を開いているか, pick: その欄の HTML（ui.js の pickPanel） } */
  function html(o) {
    o = o || {};
    var dis = o.full ? ' disabled' : '';
    return '<h2 class="sec imphead">住人をまとめて登録' + (HK.Tips ? HK.Tips.btn('cast-import') : '') + '<span class="secnote" data-note="診断結果の文章をそのまま貼るだけ。複数行を一度に読み込めます。"></span></h2>' +
      '<div class="impgrid"><div class="impmain">' +
      '<label for="bulk" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">診断結果を貼り付け</label>' +
      '<textarea id="bulk" rows="6" spellcheck="false" placeholder="ここに診断結果を貼り付け（書き方は FORMAT の欄）">' + esc(text) + '</textarea>' +
      '<div class="impbar"><button class="btn primary" data-act="import-add"' + dis + ' title="今の住人に足します（同じ名前の住人はエゴグラムを書き換え。サンプルの住人だけのときは入れ替え）">取り込む</button>' +
      '<button class="btn" data-act="quiz"' + dis + ' title="「ふたりのエゴグラム」と同じ25問に答えて、エゴグラムを出して住人にします">質問に答えて診断</button>' +
      '<button class="btn ghost" data-act="impsample" title="書き方の見本（3人分）を欄に入れます">サンプルを入れる</button>' +
      '<span class="spacer"></span><span class="impcnt" id="bulkcount" aria-live="polite">' + countHtml(text) + '</span></div>' +
      '<ul class="warn" id="warns" hidden></ul></div>' + fmtBox() + '</div>' +
      ioBox(o) +
      /* 別の端末へ移す：まるごと書き出し・共有・文字列・保存フォルダ（portable.js） */
      (HK.Portable ? HK.Portable.html() : '');
  }
  /* 保存フォルダの欄（portable.js が包む .sfdet。summary の矢印はここの CSS）：保存した開閉（1）。許可が要る・止めている・書けないときは開く（2。この開き方は覚えない） */
  function sfOpen() {
    var s = HK.SaveFolder && HK.SaveFolder.status ? HK.SaveFolder.status() : null;
    if (fold.sf) return 1;
    return s && s.name && (s.st === 'perm' || s.st === 'hold' || s.st === 'err') ? 2 : 0;
  }

  document.addEventListener('input', function (ev) {
    if (ev.target.id !== 'bulk') return;
    text = ev.target.value;
    clearTimeout(tm); tm = setTimeout(recount, 150);
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-act="impsample"]');
    if (!t) return;
    var b = document.getElementById('bulk');
    if (!b) return;
    if (b.value.trim() && b.value !== SAMPLE && !window.confirm('欄に書いた内容を、書き方の見本に置き換えますか？')) return;
    b.value = text = SAMPLE; recount(); b.focus();
  });
  /* 開閉の保存（「選んだ住人だけ書き出す」で開いたときは覚えない） */
  document.addEventListener('toggle', function (ev) {
    var d = ev.target;
    if (!d || !d.classList) return;
    if (d.id === 'impio') { var jp = d.querySelector('[data-act="jpick"]'); if (!(jp && jp.getAttribute('aria-expanded') === 'true')) { fold.io = d.open; put(); } }
    else if (d.id === 'sfdet') { if (d.open && d.getAttribute('data-auto')) return; d.removeAttribute('data-auto'); fold.sf = d.open; put(); }
  }, true);

  HK.CastImport = {
    html: html, sfOpen: sfOpen, count: countHtml,
    /* 取り込めたら欄を空にする（ui.js の importRoster） */
    clear: function () { text = ''; }
  };
})();
