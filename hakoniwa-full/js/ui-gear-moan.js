/* 箱庭シミュレーター（R18版のみ）: 住人の ⚙設定 の「喘ぎの辞書・声の区分（この住人だけ）」（2026-10-28 担当HW2）
   ui-gear.js の「話し方」の節の「喘ぎの口調」の下に出す（HK.GearMoan.html）。欄の入力は ui-gear.js の onField から HK.GearMoan.field に、
   見本のボタン（data-gact="moandemo"）はクリックの処理から HK.GearMoan.act に届く。
   保存する欄（住人）：
     c.moanDict  … 喘ぎの辞書（受けのとき）。書式は高度設定の「喘ぎの辞書」と同じで、範囲は書かない（[乗り気 1]・[喘ぎ 乗り気 1]・[小説 最中] も読む）。上限 4000 字
     c.moanDictT … 喘ぎの辞書（攻めのとき）。攻めの場面（M.MODES の top。いまは「攻め」t）の行
     c.moanFit   … 声の区分 { kind: firm|soft|grand|none|off, masc: 真偽 }（既定のままなら持たない）
     c.moanOpt   … { tease: 攻めのときの言葉責め・焦らしの多さ, retort: 受けのときの言い返しの多さ }（off|less|normal|more。normal は持たない）。
                   言葉責め・言い返しの文は次の更新で入る（いまはエンジンが読まない。保存・書き出し・複製の土台だけ）
   ここで決めた辞書は高度設定の 住人= よりも優先し、区分は高度設定の口調ごとの区分より優先する（moan-engine.js の HK.Moan.ownOf・fit）。
   見本「この住人の声を出してみる」は、その住人の口調・喘ぎの口調・性別・夜の性格・辞書・区分をそのまま使い、箱庭と同じ HK.Moan.pick／say を通す（HK.Moan.demo の who）。
   全年齢モードでは何も出さない。登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, M = HK && HK.Moan;
  if (!HK || !M || !M.parseOwn) return;
  var esc = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var KIND_OPT = [['', '既定（口調の区分のまま）'], ['firm', 'はっきり（言い切り）'], ['soft', 'やわらかい'], ['grand', '古風・尊大'], ['none', '区分なし（性別だけ）'], ['off', '整えない']];
  var KIND_LABEL = { firm: 'はっきり', soft: 'やわらかい', grand: '古風・尊大', none: '区分なし', off: '整えない' };
  var AMOUNT = [['off', 'なし'], ['less', '少なめ'], ['normal', 'ふつう'], ['more', '多め']];
  var SRC = { base: '素の言葉', tone: '口調の喘ぎ', shared: '共通', user: '辞書', ntone: '小説調の口調の表', nbase: '小説調の態度の表' };
  var seedN = 0;
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function toneOfC(c) { return M.toneOf ? M.toneOf(c) : c.tone; }
  function errs(text) { return text ? M.parseOwn(text).errors : []; }
  function errText(text) { var e = errs(text); return e.length ? '読めなかった行：' + e.slice(0, 3).join('／') + (e.length > 3 ? '（ほか' + (e.length - 3) + '件）' : '') : ''; }
  function lines(c) { return (c.moanDict ? M.parseOwn(c.moanDict).n : 0) + (c.moanDictT ? M.parseOwn(c.moanDictT).n : 0); }
  /* 攻めの場面の辞書に、受けの場面の見出しが無いか（逆も）。書いても効くが、欄の分け方の知らせ */
  function sideNote(text, top) {
    var bad = [];
    String(text || '').split(/\r?\n/).forEach(function (l) {
      var h = l.trim().match(/^[\[［]\s*(?:喘ぎ\s+)?(\S+)/);
      if (!h) return;
      var m = h[1] === '小説' ? 'n' : M.modeOf(h[1]) || (/^[a-z]\d$/.test(h[1]) ? h[1].charAt(0) : null);
      if (!m || m === 'n') { if (m === 'n' && top) bad.push(h[1]); return; }
      if (!!M.isTopKey(m + '0') !== !!top) bad.push(h[1]);
    });
    return bad.length ? '「' + bad.slice(0, 3).join('」「') + '」は' + (top ? '受け' : '攻め') + 'の場面です（効きますが、' + (top ? '受け' : '攻め') + 'のときの欄に書くと見やすくなります）' : '';
  }
  function fitHint(c) {
    var k = M.fitKind(toneOfC(c), c);
    return '高度設定までの区分：' + (KIND_LABEL[k.advKind] || k.advKind) + (k.advMasc ? '・男性的な語尾を残す' : '') + '。いま効く区分：' + (KIND_LABEL[k.kind] || k.kind) + (k.kind !== 'off' && k.masc ? '・男性的な語尾を残す' : '') + (k.own ? '（この住人の設定）' : '');
  }
  function sumText(c) {
    var n = lines(c), f = M.ownFitNorm(c.moanFit), out = [];
    if (n) out.push('辞書 ' + n + '行');
    if (f) out.push('声：' + (f.kind ? KIND_LABEL[f.kind] : '') + (f.masc != null ? (f.kind ? '・' : '') + (f.masc ? '男性的な語尾を残す' : '男性的な語尾を外す') : ''));
    var o = c.moanOpt || {};
    if (o.tease) out.push('言葉責め：' + lab(o.tease));
    if (o.retort) out.push('言い返し：' + lab(o.retort));
    return out.length ? out.join('・') : '決めていません';
  }
  function lab(v) { for (var i = 0; i < AMOUNT.length; i++) if (AMOUNT[i][0] === v) return AMOUNT[i][1]; return ''; }
  function keyOpts(style, cur) {
    if (HK.MoanFitUI && HK.MoanFitUI.keyOpts) return HK.MoanFitUI.keyOpts(cur, style);
    return (style === 'novel' ? M.NOVEL_KEYS : M.keys()).map(function (k) { return opt(k.key, k.label, cur); }).join('');
  }
  var G = HK.GearMoan = {};
  /* ⚙設定の欄（ctx: { open: 開いているか, ld: 性欲「なし」で暗くする属性 }） */
  G.html = function (c, ctx) {
    if (HK.SAFE_ON || !c) return '';
    ctx = ctx || {};
    var f = M.ownFitNorm(c.moanFit) || {}, k = M.fitKind(toneOfC(c), c), o = c.moanOpt || {};
    var ta = function (gf, v, ph) { return '<textarea data-gf="' + gf + '" rows="4" spellcheck="false" maxlength="' + M.OWN_MAX + '" placeholder="' + esc(ph) + '" style="width:100%;box-sizing:border-box;font-size:13px">' + esc(v || '') + '</textarea>'; };
    var amt = function (gf, v, label, title) { return '<label title="' + esc(title) + '">' + esc(label) + ' <select data-gf="' + gf + '" aria-label="' + esc(label) + '">' + AMOUNT.map(function (x) { return opt(x[0], x[1] + (x[0] === 'normal' ? '（既定）' : ''), v || 'normal'); }).join('') + '</select></label>'; };
    return '<details class="gdet" data-k="gmoan"' + (ctx.open ? ' open' : '') + '><summary>喘ぎの辞書・声の区分（この住人だけ） <span class="gkn" id="gm-sum">' + esc(sumText(c)) + '</span></summary>' +
      '<div class="gmoan" style="padding:4px 0">' +
      '<div class="gearrow"><label>声の区分（この住人だけ） <select data-gf="moanFitKind" aria-label="この住人の声の区分">' + KIND_OPT.map(function (x) { return opt(x[0], x[1], f.kind || ''); }).join('') + '</select></label>' +
      '<label><input type="checkbox" data-gf="moanFitMasc"' + (k.masc ? ' checked' : '') + '> 男性的な語尾を残す（女性でも「〜ぜ」「〜ぞ」）</label></div>' +
      '<p class="gearhint" id="gm-fit">' + esc(fitHint(c)) + '</p>' +
      '<p class="gearhint">はっきり：「やめて」→「やめろ」、泣き声の拒みは「むり」に／やわらかい：「やめろ」→「やめて」、「〜ぞ」→「〜よ」／古風・尊大：「〜ちゃう」→「〜てしまう」／区分なし：性別の整えだけ／整えない：表の文のまま。高度設定の口調ごとの区分より優先します。</p>' +
      '<h4 style="margin:10px 0 2px;font-size:13px">受けのとき</h4>' +
      ta('moanDict', c.moanDict, '[乗り気 1]\nん……っ|は、ぁ……\n[懇願 1]\nもっと……おねがい……\n[小説 最中]\nあ……っ、そこ……') +
      '<p class="gearhint" id="gm-err-r" style="color:var(--warn,#b00)">' + esc(errText(c.moanDict) || sideNote(c.moanDict, false)) + '</p>' +
      '<p class="gearhint">見出し [場面 段階] の下に1行1つ（「|」区切りでも可）。末尾に「追加」で、組み込みの声と半々で混ぜます。場面と段階：' + esc(M.modeList ? M.modeList(false) : '') + '／小説調 始まり 最中 果てる</p>' +
      '<div class="gearrow">' + amt('moanOptRetort', o.retort, '言い返しの多さ', '受けのときに、相手の言葉責めに言い返す（「うるさい……っ」など）多さです。言い返しの文は次の更新で入ります') + '</div>' +
      '<h4 style="margin:10px 0 2px;font-size:13px">攻めのとき</h4>' +
      ta('moanDictT', c.moanDictT, '[攻め 1]\nっ……は、ぁ……\n[攻め 4]\nかわいい……もっと、声、聞かせて') +
      '<p class="gearhint" id="gm-err-t" style="color:var(--warn,#b00)">' + esc(errText(c.moanDictT) || sideNote(c.moanDictT, true)) + '</p>' +
      '<p class="gearhint">場面と段階：' + esc(M.modeList ? M.modeList(true) : '') + '</p>' +
      '<div class="gearrow">' + amt('moanOptTease', o.tease, '言葉責め・焦らしの多さ', '攻めのときに、言葉責め・焦らす台詞を言う多さです。言葉責め・焦らしの文は次の更新で入ります') + '</div>' +
      '<p class="gearhint">言葉責め・言い返しの文は次の更新で入ります（いまは設定を残しておくだけです）。辞書はこの住人だけに効き、高度設定の「喘ぎの辞書」の 住人= よりも優先します。書いた行は区分では直しません。</p>' +
      '<h4 style="margin:10px 0 2px;font-size:13px">この住人の声を出してみる</h4>' +
      '<div class="gearrow"><label>作風 <select data-gf="gmStyle" id="gm-style" aria-label="見本の作風">' + opt('ero', '男性向け', 'ero') + opt('novel', '小説調', 'ero') + '</select></label>' +
      '<label>場面 <select id="gm-key" aria-label="見本の場面">' + keyOpts('ero', c.pos === 'top' ? 't3' : 'w1') + '</select></label>' +
      '<button type="button" class="btn small" data-gact="moandemo">出してみる</button></div>' +
      '<div class="tonesample" id="gm-demo" aria-live="polite"></div>' +
      '</div></details>';
  };
  /* 住人の行の要約（ui-gear.js の UI.summary） */
  G.summary = function (c) {
    if (HK.SAFE_ON || !c) return [];
    var n = lines(c), out = [], o = c.moanOpt || {};
    if (n) out.push('喘ぎ辞書：' + n + '行');
    if (o.tease) out.push('言葉責め：' + lab(o.tease));
    if (o.retort) out.push('言い返し：' + lab(o.retort));
    return out;
  };
  function refresh(c) {
    var el = function (id) { return document.getElementById(id); };
    if (el('gm-sum')) el('gm-sum').textContent = sumText(c);
    if (el('gm-fit')) el('gm-fit').textContent = fitHint(c);
    if (el('gm-err-r')) el('gm-err-r').textContent = errText(c.moanDict) || sideNote(c.moanDict, false);
    if (el('gm-err-t')) el('gm-err-t').textContent = errText(c.moanDictT) || sideNote(c.moanDictT, true);
  }
  /* 欄の入力（ui-gear.js の onField から。扱ったら true） */
  G.field = function (c, f, t, isInput, changed) {
    if (HK.SAFE_ON) return false;
    switch (f) {
      case 'moanDict': case 'moanDictT': {
        var v = String(t.value || '').slice(0, M.OWN_MAX);
        if (v.trim()) c[f] = v; else delete c[f];
        changed(false); refresh(c); return true;
      }
      case 'moanFitKind': case 'moanFitMasc': {
        if (isInput && f === 'moanFitKind') return true;
        var fo = M.ownFitNorm(c.moanFit) || {};
        if (f === 'moanFitKind') { if (t.value) fo.kind = t.value; else delete fo.kind; }
        else {
          /* 高度設定までの区分（と、この住人の区分）で決まる値と同じなら持たない */
          delete fo.masc;
          var k0 = M.fitKind(toneOfC(c), Object.assign({}, c, { moanFit: fo.kind ? { kind: fo.kind } : null, moanDict: '', moanDictT: '' }));
          if (!!t.checked !== k0.masc) fo.masc = !!t.checked;
        }
        var nf = M.ownFitNorm(fo); if (nf) c.moanFit = nf; else delete c.moanFit;
        changed(false); refresh(c);
        var mc = document.querySelector('[data-gf="moanFitMasc"]'); if (mc) mc.checked = M.fitKind(toneOfC(c), c).masc;
        return true;
      }
      case 'moanOptTease': case 'moanOptRetort': {
        if (isInput) return true;
        var o = Object.assign({}, c.moanOpt || {}), key = f === 'moanOptTease' ? 'tease' : 'retort';
        if (t.value && t.value !== 'normal' && lab(t.value)) o[key] = t.value; else delete o[key];
        if (Object.keys(o).length) c.moanOpt = o; else delete c.moanOpt;
        changed(false); refresh(c); return true;
      }
      case 'gmStyle': {
        if (isInput) return true;
        var ks = document.getElementById('gm-key'); if (ks) ks.innerHTML = keyOpts(t.value, t.value === 'novel' ? 'n1' : 'w1');
        return true;
      }
    }
    return false;
  };
  /* 見本のボタン */
  G.act = function (act, c) {
    if (act !== 'moandemo' || HK.SAFE_ON || !c) return false;
    var out = document.getElementById('gm-demo'), ks = document.getElementById('gm-key'), st = document.getElementById('gm-style');
    if (!out) return true;
    var style = st && st.value === 'novel' ? 'novel' : '', key = ks && ks.value ? ks.value : style ? 'n1' : 'w1';
    seedN++;
    var rows = M.demo(key, { who: c, style: style, n: 5, detail: true, seed: 777 + seedN * 7919 });
    var label = (style ? M.NOVEL_KEYS : M.keys()).filter(function (k) { return k.key === key; })[0];
    out.innerHTML = '<span class="tsh">' + esc((label ? label.label : key) + '（' + c.name + '・' + (style ? '小説調' : '男性向け') + '）') + '</span>' + rows.map(function (r) {
      var fx = r.fixed ? '（直す前「' + r.raw + '」→ ' + (KIND_LABEL[r.kind] && r.kind !== 'none' ? KIND_LABEL[r.kind] : '性別の整え') + '）' : '';
      return '<span class="tsl">' + esc(c.name + '「' + r.s + '」') + ' <small style="color:var(--muted)">' + esc((SRC[r.src] || r.src || '') + (r.ends ? '＋口調の語尾' : '') + fx) + '</small></span>';
    }).join('');
    return true;
  };
})();
