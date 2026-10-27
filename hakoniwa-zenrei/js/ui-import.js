/* 箱庭シミュレーター: 住人タブの上部「住人をまとめて登録」の描画と、「データ」ダイアログの「名簿・JSON」のタブ（2026-10-27 のデザインの適用。結果には影響しない）
   ui.js の renderCast が HK.CastImport.html(o) を差し込む。「名簿・JSON」のタブは ui-cast-tools.js のダイアログが HK.CastImport.ioHtml(o) で描く。
   ボタンの処理（data-act の import-add・import-replace・export・jsonout・jpick・jsonadd・jsonrep・quiz）は ui.js のまま。
   ここで扱うのは、貼り付け欄の「n 行を検出」（ui.js の読み取り HK.UI.parseRoster＝parseGrouped で数える）と「サンプルを入れる」だけ。
   節の形：左に貼り付け欄（#bulk）と［取り込む］（primary）［質問に答えて診断］「サンプルを入れる」（ghost）「n 行を検出」、右に書き方の箱（FORMAT。スマホ幅では下）
   「名簿・JSON」：書き出す／読み込むの2列に、ボタン1行と説明1行。
   見出し（h2.sec）は ui-fold.js の節の折りたたみのまま */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
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
    /* 「データ」ダイアログの「名簿・JSON」：書き出す／読み込むの2列。各項目はボタン1行＋説明1行 */
    '.iogrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 28px}' +
    '.iocol{display:flex;flex-direction:column;gap:10px;min-width:0}.iocol .eyebrow{margin:0}' +
    '.ioit{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0}.ioit .btn{white-space:nowrap}' +
    '.ioit p{margin:0;font-size:12px;color:var(--muted);line-height:1.6}' +
    '.iopane .jpick{margin-top:14px!important}' +
    '@media (max-width:760px){.impgrid{grid-template-columns:minmax(0,1fr)}.impmain textarea{flex:none}.iogrid{grid-template-columns:minmax(0,1fr)}}' +
    '@media (max-width:600px){h2.sec.imphead .secnote{display:none}.impbar .spacer{display:none}.impcnt{flex-basis:100%}}';
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
      '<li><code>鷹野（たかの） BABAB</code> … 名前のあとの（ひらがな）は名前の読み（どもる台詞の頭の音に使います）</li>' +
      '<li><code>名前 CP14 NP6 A16 FC12 AC4</code> … 点数でも（高・中・低も可）</li>' +
      '<li><code>【グループ名】</code> … この行から下の住人にグループが付きます</li>' +
      '<li>結果ページの URL の行は読み飛ばします。同じ名前の住人がいれば、エゴグラムを書き換えます</li>' +
      '<li>CSV など、ほかの形は見出しの ？ にあります</li>' +
      '</ul></details></aside>';
  }
  /* 書き出し・読み込み：ボタン1行といつ使うかの1行 */
  function item(act, label, desc, extra) { return '<div class="ioit"><button class="btn small" data-act="' + act + '"' + (extra || '') + '>' + label + '</button><p>' + desc + '</p></div>'; }
  /* 「データ」ダイアログの「名簿・JSON」。o：{ jp: 「選んだ住人だけ書き出す」を開いているか, pick: その欄の HTML（ui.js の pickPanel） } */
  function ioHtml(o) {
    o = o || {};
    return '<div class="iopane"><div class="iogrid"><div class="iocol"><span class="eyebrow">書き出す</span>' +
      item('jsonout', '住人をJSONで書き出す', '全員の住人・関係・設定（アイコンも）を1つのファイルにします。') +
      item('jpick', '選んだ住人だけ書き出す', 'チェックした住人だけのファイルを作ります。', ' aria-expanded="' + (o.jp ? 'true' : 'false') + '"') +
      item('export', '名簿をテキストでコピー', '名前と5文字コードを文字でコピーします（グループは【見出し】つき）。') +
      '</div><div class="iocol"><span class="eyebrow">読み込む</span>' +
      item('jsonadd', 'JSONを足す', '今の住人はそのままで足します（同じ名前の住人は上書き）。') +
      item('jsonrep', 'JSONで置き換える', '今の住人と関係を消して、ファイルの内容だけにします。') +
      item('import-replace', '名簿を置き換える', '「住人をまとめて登録」の欄に貼った住人だけにします。') +
      '</div></div>' + (o.pick || '') +
      '<input type="file" id="jsonfile" accept=".json,application/json" hidden></div>';
  }
  /* o：{ full: 上限まで登録しているか } */
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
      '<ul class="warn" id="warns" hidden></ul></div>' + fmtBox() + '</div>';
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
  HK.CastImport = {
    html: html, ioHtml: ioHtml, count: countHtml,
    /* 取り込めたら欄を空にする（ui.js の importRoster） */
    clear: function () { text = ''; }
  };
})();
