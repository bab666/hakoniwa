/* 箱庭シミュレーター（R18版のみ）: 高度設定の「喘ぎ声の調整」の節と、喘ぎの見本（2026-10-28）
   moan-engine.js の HK.Moan.setFit（口調ごとの区分・夜の性格→声の基盤・割合・性別の整え）を、選択欄とスライダーで変える。
   ui-adv.js の節として「喘ぎの辞書」の上に登録する（sec.html）。値は HK.Adv.set('moanfit', JSON 文字列) で adv に入り、
   JSON の書き出し（全員）・まるごと書き出し・設定を文字列で（portable.js）にもそのまま乗る。既定と同じ値は持たない（全部既定なら空）。
   変えた値は次に箱庭を動かしたときから効く（保存した結果は変わらない）。
   見本：口調 × 性別 × 夜の性格 × 場面（鍵）で、箱庭と同じ HK.Moan.pick を通して出す（HK.Moan.demo）。
   各行に、どの表から来たか（素の言葉／口調の喘ぎ／共通／利用者の辞書）と、区分で直った行は「直す前 → 直した後（区分）」を添える。
   登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Adv, M = HK && HK.Moan;
  if (!A || !M || !M.setFit || HK.SAFE_ON) return;
  var esc = A.esc, ID = 'moanfit';
  var KIND_DESC = {
    firm: 'はっきり（言い切り）：「やめて」→「やめろ」、「待って」→「待て」、「お願い」→「頼む」。泣き声の拒み「いや」「やだ」は「むり」に。女性的な語尾（〜のよ・〜かしら）を外す',
    soft: 'やわらかい：「しろ」→「して」、「やめろ」→「やめて」、「〜ぞ」「〜よな」→「〜よ」「〜よね」、「くそっ」→「もうっ」、「お前」→その人の二人称',
    grand: '古風・尊大：はっきり（言い切り）に加えて、「〜ちゃう」→「〜てしまう」、「〜じゃん」→「〜ではないか」',
    none: '区分なし：口調では整えず、下の「性別で整える」だけ当てる',
    off: '整えない：口調でも性別でも整えず、表の文のまま出す（女性の「〜ぞ」もそのまま残る）'
  };
  var KIND_OPT = { firm: 'はっきり（言い切り）', soft: 'やわらかい', grand: '古風・尊大', none: '区分なし（性別だけ）', off: '整えない' };
  var RATES = [
    { k: 'tone', label: '口調の語尾を付ける割合', lo: 0, hi: 100, desc: '素の言葉の喘ぎの文末に、口調の語尾（〜ですわ・〜じゃ など）を付ける割合。0% なら付けない' },
    { k: 'toneMoan', label: '口調ごとの喘ぎを混ぜる割合', lo: 0, hi: 100, desc: '口調ごとに書いた喘ぎ（口調の味が濃い文）を、素の言葉の代わりに使う割合' },
    { k: 'set', label: '喘ぎの口調を決めた人の、口調の濃さ', lo: 0, hi: 100, desc: '住人の「喘ぎの口調」を決めた人だけ、上の2つの割合をこの値にする（決めた口調が聞こえるように）' },
    { k: 'talk', label: '言葉のある喘ぎの多さ', lo: 50, hi: 150, desc: '「そこ、いい……っ」のような言葉のある喘ぎと、言葉のない声の比べ（態度ごとの割合にかける倍率）' }
  ];
  var DEMO = { n: 0, last: null };
  function nightList() { return ((HK.Attr && HK.Attr.NIGHT) || []).filter(function (x) { return M.NIGHT_PS[x[0]]; }); }
  function psLabel(k) { return HK.PERSONA && HK.PERSONA[k] ? HK.PERSONA[k].label : k; }
  function toneLabel(k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return t && t.label ? t.label : k; }
  function cfg() { var c = M.fitCfg; return c ? JSON.parse(JSON.stringify(c)) : { tone: {}, night: {}, rate: {}, gender: {} }; }
  function rateVal(k) { var c = M.fitCfg; return c && c.rate[k] != null ? c.rate[k] : M.RATE_DEF[k]; }
  function rateText(k, v) {
    if (k !== 'talk') return Math.round(v * 100) + '%';
    return '×' + v.toFixed(2) + '（' + (v < 0.85 ? '少なめ' : v > 1.15 ? '多め' : 'ふつう') + '）';
  }
  function changedTones() { return (HK.TONE_KEYS || []).filter(function (t) { return !M.fitKind(t).def; }); }
  function sel(attrs, opts, cur) {
    return '<select ' + attrs + '>' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === cur ? ' selected' : '') + (o[2] ? ' title="' + esc(o[2]) + '"' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
  }
  var CSS = '<style>' +
    '.mf .mf-h{font-weight:600;margin:14px 0 2px}.mf .mf-d{font-size:12px;color:var(--muted);margin:2px 0 6px}' +
    '.mf .mf-row{display:grid;grid-template-columns:minmax(8em,11em) minmax(0,1fr);gap:4px 10px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)}' +
    '.mf .mf-row.on .mf-n{font-weight:700}.mf .mf-row.on .mf-n::after{content:"（変更）";font-weight:400;font-size:11px;color:var(--muted)}' +
    '.mf .mf-row.off .mf-c label{opacity:.45}' +
    '.mf .mf-c{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center;font-size:13px}.mf .mf-c label{display:inline-flex;gap:4px;align-items:center}' +
    '.mf select{max-width:100%;min-width:0}.mf input[type=range]{flex:1 1 140px;min-width:120px;max-width:320px}.mf .mf-v{min-width:7.5em;font-variant-numeric:tabular-nums}' +
    '.mf details>summary{cursor:pointer;padding:6px 0}.mf .mf-cnt{font-size:12px;color:var(--muted);margin-left:6px}' +
    '.mf .mf-legend{font-size:12px;color:var(--muted);margin:2px 0 6px;padding-left:1em;text-indent:-1em}' +
    '.mf .mf-demo{font-size:13px;margin-top:6px;line-height:1.7}.mf .mf-src{font-size:11px;color:var(--muted);margin-left:6px}.mf .mf-key{font-weight:600;margin-top:6px}' +
    '@media (max-width:600px){.mf .mf-row{grid-template-columns:6.5em minmax(0,1fr)}.mf .mf-c{font-size:12px}}' +
    '</style>';
  function toneRows() {
    return (HK.TONE_KEYS || []).map(function (t) {
      var k = M.fitKind(t), at = 'data-f="adv" data-k="' + ID + '" data-t="' + esc(t) + '"';
      var opts = M.FIT_KINDS.map(function (v) { return [v, (v === k.defKind ? '既定（' + KIND_OPT[v] + '）' : KIND_OPT[v]), KIND_DESC[v]]; });
      return '<div class="mf-row' + (k.def ? '' : ' on') + (k.kind === 'off' ? ' off' : '') + '" id="mf-r-' + esc(t) + '"><div class="mf-n">' + esc(toneLabel(t)) + '</div><div class="mf-c">' +
        sel(at + ' data-m="kind" aria-label="' + esc(toneLabel(t)) + 'の区分"', opts, k.kind) +
        '<label><input type="checkbox" ' + at + ' data-m="masc"' + (k.masc ? ' checked' : '') + '>男性的な語尾を残す（女性でも）' + (k.defMasc ? '（既定は残す）' : '') + '</label>' +
        (k.hasDialect ? '<label><input type="checkbox" ' + at + ' data-m="dialect"' + (k.dialect ? ' checked' : '') + '>方言の語尾に直す</label>' : '') +
        '</div></div>';
    }).join('');
  }
  function cntText() {
    var ch = changedTones();
    return ch.length ? '変更中：' + ch.length + ' 口調（' + ch.slice(0, 6).map(toneLabel).join('・') + (ch.length > 6 ? ' ほか' : '') + '）' : '変更なし（全口調が既定）';
  }
  function demoBox() {
    var tones = (HK.TONE_KEYS || []).map(function (t) { return [t, toneLabel(t)]; });
    return '<div class="mf-h">見本</div><div class="mf-d">口調・性別・夜の性格・場面を選んで、箱庭と同じ選び方で喘ぎを出します（上の調整と下の「喘ぎの辞書」も効きます）。態度は口調から決まります。各行の右に出どころを、区分で直った行は「直す前 → 直した後」を出します。</div>' +
      '<div class="mf-c" style="gap:6px 10px">' +
      '<label>口調 ' + sel('id="adv-mf-tone" aria-label="見本の口調"', tones, 'gentle') + '</label>' +
      '<label>性別 ' + sel('id="adv-mf-g" aria-label="見本の性別"', [['f', '女性'], ['m', '男性']], 'f') + '</label>' +
      '<label>夜の性格 ' + sel('id="adv-mf-night" aria-label="見本の夜の性格"', [['', 'おまかせ']].concat(nightList().map(function (x) { return [x[0], x[1]]; })), '') + '</label>' +
      '<label>場面 ' + sel('id="adv-mf-key" aria-label="見本の場面"', M.keys().map(function (k) { return [k.key, k.label]; }), 'w1') + '</label>' +
      '<button type="button" class="mini" data-act="adv:mf-demo">出してみる</button><button type="button" class="mini" data-act="adv:mf-all">全場面を一気に</button></div>' +
      '<div class="mf-demo" id="adv-mf-demo" aria-live="polite"></div>';
  }
  function body() {
    var c = M.fitCfg, gd = c ? c.gender : {};
    var nights = nightList().map(function (x) {
      var nt = x[0], cur = (c && c.night[nt]) || M.NIGHT_PS[nt];
      var opts = (HK.PERSONA_KEYS || []).map(function (p) { return [p, psLabel(p) + (p === M.NIGHT_PS[nt] ? '（既定）' : '')]; }).concat([['off', '効かせない（口調の態度のまま）']]);
      return '<div class="mf-row' + (c && c.night[nt] ? ' on' : '') + '" id="mf-n-' + nt + '"><div class="mf-n">' + esc(x[1]) + '</div><div class="mf-c">' + sel('data-f="adv" data-k="' + ID + '" data-m="night" data-n="' + nt + '" aria-label="' + esc(x[1]) + 'の声の基盤"', opts, cur) + '</div></div>';
    }).join('');
    var rates = RATES.map(function (r) {
      var v = rateVal(r.k);
      return '<div class="mf-row' + (c && c.rate[r.k] != null ? ' on' : '') + '" id="mf-a-' + r.k + '"><div class="mf-n">' + esc(r.label) + '</div><div class="mf-c">' +
        '<input type="range" min="' + r.lo + '" max="' + r.hi + '" step="5" value="' + Math.round(v * 100) + '" data-f="adv" data-k="' + ID + '" data-m="rate" data-r="' + r.k + '" aria-label="' + esc(r.label) + '">' +
        '<span class="mf-v" id="mf-v-' + r.k + '">' + rateText(r.k, v) + '</span><span class="mf-src">既定 ' + rateText(r.k, M.RATE_DEF[r.k]) + '</span>' +
        '<div class="mf-d" style="flex-basis:100%;margin:0">' + esc(r.desc) + '</div></div></div>';
    }).join('');
    var gch = function (k, label, desc) {
      return '<div class="mf-row' + (gd[k] === false ? ' on' : '') + '" id="mf-g-' + k + '"><div class="mf-n">' + esc(label) + '</div><div class="mf-c"><label><input type="checkbox" data-f="adv" data-k="' + ID + '" data-m="gender" data-g="' + k + '"' + (gd[k] === false ? '' : ' checked') + '>整える（既定）</label><div class="mf-d" style="flex-basis:100%;margin:0">' + esc(desc) + '</div></div></div>';
    };
    return '<div class="mf-d">喘ぎ声を、話し手の口調・性別・夜の性格に合わせて整える決まりを変えられます。変えた値は次に箱庭を動かしたときから効きます（保存したセーブ・履歴の結果は変わりません）。全部既定のままなら何も保存しません。</div>' +
      '<div class="mf-h">口調ごとの区分</div>' +
      '<div class="mf-legend">' + M.FIT_KINDS.map(function (v) { return '・' + esc(KIND_DESC[v]); }).join('<br>') +
      '<br>・男性的な語尾を残す：女性でも「〜ぜ」「〜ぞ」「〜ねえ」を外さない（男性は「〜わ」を残す）。ヤンキー・兄貴分・熱血などは既定で残す' +
      '<br>・方言の語尾に直す（のじゃ・関西弁だけ）：のじゃ「〜だね」→「〜じゃな」・「〜ない」→「〜ぬ」／関西弁「〜ない」→「〜へん」・「〜だよ」→「〜やで」</div>' +
      '<details id="mf-tones"><summary>口調の一覧（' + (HK.TONE_KEYS || []).length + ' 口調）<span class="mf-cnt" id="mf-cnt">' + esc(cntText()) + '</span></summary>' + toneRows() + '</details>' +
      '<div class="mf-h">夜の性格 → 声の基盤</div><div class="mf-d">住人の夜の性格ごとに、言葉のある喘ぎの元にする態度を選びます。「効かせない」なら口調の態度のまま（懇願が増える・声を抑えるなどの場面の選び方は夜の性格のまま）。</div>' + nights +
      '<div class="mf-h">割合</div>' + rates +
      '<div class="mf-h">性別で整える</div>' +
      gch('unfemM', '男性の喘ぎから女性的な語尾を外す', '男性の「いいわ」「だめよ」「あら」などを外す（「整えない」にした口調には効かない）') +
      gch('unmascF', '女性の喘ぎから男性的な語尾を外す', '女性の「〜ぜ」「〜ぞ」「〜だろ」「〜ねえ」を外す（男性的な語尾を残す口調・関西弁・やわらかい口調には効かない）') +
      '<div class="row" style="margin-top:10px"><button type="button" class="mini" data-act="adv:mf-reset">既定に戻す</button></div>' +
      demoBox();
  }
  function save(c) {
    M.setFit(c);
    var txt = M.fitCfg ? JSON.stringify(M.fitCfg) : '';
    A.set(ID, txt, true);
  }
  function mark(id, on) { var el = document.getElementById(id); if (el) el.classList.toggle('on', !!on); }
  function refresh() {
    var c = M.fitCfg, el = document.getElementById('mf-cnt');
    if (el) el.textContent = cntText();
    (HK.TONE_KEYS || []).forEach(function (t) { var k = M.fitKind(t), el = document.getElementById('mf-r-' + t); mark('mf-r-' + t, !k.def); if (el) el.classList.toggle('off', k.kind === 'off'); });
    nightList().forEach(function (x) { mark('mf-n-' + x[0], c && c.night[x[0]]); });
    RATES.forEach(function (r) { mark('mf-a-' + r.k, c && c.rate[r.k] != null); var v = document.getElementById('mf-v-' + r.k); if (v) v.textContent = rateText(r.k, rateVal(r.k)); });
    ['unfemM', 'unmascF'].forEach(function (k) { mark('mf-g-' + k, c && c.gender[k] === false); });
    /* 見本を出していれば、同じ種で出し直す（調整の違いが見えるように） */
    if (DEMO.last) showDemo(DEMO.last.all, true);
  }
  function onInput(t) {
    var c = cfg(), m = t.dataset.m;
    if (m === 'kind' || m === 'masc' || m === 'dialect') {
      var tk = t.dataset.t, w = c.tone[tk] = c.tone[tk] || {};
      /* 「整えない」のときは、ほかのチェックは意味がないので暗くする（refresh の .off） */
      if (m === 'kind') w.kind = t.value; else w[m] = !!t.checked;
    } else if (m === 'night') c.night[t.dataset.n] = t.value;
    else if (m === 'rate') { c.rate[t.dataset.r] = (+t.value) / 100; }
    else if (m === 'gender') c.gender[t.dataset.g] = !!t.checked;
    else return;
    save(c);
    refresh();
  }
  function showDemo(all, again) {
    var out = document.getElementById('adv-mf-demo'), ts = document.getElementById('adv-mf-tone'), gs = document.getElementById('adv-mf-g'), ns = document.getElementById('adv-mf-night'), ks = document.getElementById('adv-mf-key');
    if (!out || !ts) return;
    if (!again) DEMO.n++;
    var seed = 12345 + DEMO.n * 7919, o = { tone: ts.value, gender: gs ? gs.value : 'f', night: ns ? ns.value : '', detail: true };
    DEMO.last = { all: all };
    var SRC = { base: '素の言葉', tone: '口調の喘ぎ', shared: '共通', user: '利用者の辞書' };
    var line = function (r) {
      var fx = r.fixed ? '<span class="mf-src">（直す前「' + esc(r.raw) + '」 → ' + esc(M.KIND_LABEL[r.kind] && r.kind !== 'none' ? M.KIND_LABEL[r.kind] : '性別の整え') + '）</span>' : '';
      return '「' + esc(r.s) + '」<span class="mf-src">' + esc(SRC[r.src] || r.src || '') + (r.ends ? '＋口調の語尾' : '') + '</span>' + fx;
    };
    var keys = all ? M.keys() : M.keys().filter(function (k) { return k.key === (ks ? ks.value : 'w1'); });
    var fk = M.fitKind(M.toneOf({ tone: o.tone })), head = '<div class="mf-src" style="margin-left:0">' + esc(toneLabel(o.tone)) + '・' + (o.gender === 'm' ? '男性' : '女性') + '・態度 ' + esc(psLabel(M.psOf({ tone: o.tone, gender: o.gender, eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } }, o.night ? { night: o.night } : {}))) + '・区分 ' + esc(KIND_OPT[fk.kind]) + (fk.def ? '（既定）' : '（変更）') + '</div>';
    out.innerHTML = head + keys.map(function (k, i) {
      var rows = M.demo(k.key, Object.assign({ n: all ? 2 : 5, seed: seed + i * 31 }, o));
      return (all ? '<div class="mf-key">' + esc(k.label) + '</div>' : '') + rows.map(line).join('<br>');
    }).join('');
  }
  A.add({
    id: ID, title: '喘ぎ声の調整（口調・性別・夜の性格）', before: 'moan',
    apply: function (text) { return M.setFit(text); },
    html: function () { return '<div class="mf" id="adv-mf">' + CSS + body() + '</div>'; },
    onInput: onInput,
    onAct: function (act) {
      if (act === 'adv:mf-demo') showDemo(false);
      else if (act === 'adv:mf-all') showDemo(true);
      else if (act === 'adv:mf-reset') {
        if (!M.fitCfg) { if (HK.toast) HK.toast('喘ぎ声の調整は既定のままです'); return; }
        save(null);
        var el = document.getElementById('adv-mf'), open = document.getElementById('mf-tones');
        var wasOpen = open && open.open, last = DEMO.last;
        if (el) el.outerHTML = this.html();
        if (wasOpen) { var d = document.getElementById('mf-tones'); if (d) d.open = true; }
        if (last) showDemo(last.all, true);
        if (HK.toast) HK.toast('喘ぎ声の調整を既定に戻しました');
      }
    }
  });
})();
