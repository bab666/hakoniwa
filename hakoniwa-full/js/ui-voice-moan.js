/* 箱庭シミュレーター（R18版のみ）: 住人タブの「口調・喘ぎの設定」の部品「喘ぎ」（ui-voice.js の VS.add）。2026-10-28 担当LA
   ・対象が住人：喘ぎの口調 c.moanTone と、住人ごとの喘ぎの辞書・声の区分・言い返し／言葉責めの多さ・見本（ui-gear-moan.js の HK.GearMoan。flat で描く）。
     保存先はもとの ⚙設定と同じ c.moanTone・c.moanDict・c.moanDictT・c.moanFit・c.moanOpt（鍵も形も変えない）
   ・対象が全体：HK.Adv の節（喘ぎ声の調整・喘ぎの辞書。もとの箱庭タブの「高度設定」）。保存先は HK.store の adv（moanfit・moan）
   ・全体⇄住人の写し（変換）：
       全体 → 住人：全体の喘ぎの辞書のうち、その住人に効く見出し（共通・口調=その人の喘ぎの口調・態度=その人の態度・住人=その人）の行を、範囲を外して
                    受けの辞書 c.moanDict／攻めの辞書 c.moanDictT に入れる。全体の口調ごとの区分のうち、その人の口調の区分を c.moanFit に入れる。
                    夜の性格→声の基盤・割合・性別の整えは全体だけの設定なので写せない
       住人 → 全体：住人の辞書の見出しを [喘ぎ 共通 …] にして全体の喘ぎの辞書に入れる。住人の声の区分を、その人の口調の区分として全体の調整に入れる。
                    喘ぎの口調・言い返し／言葉責めの多さは住人だけの設定なので写せない
     mode：'add' 足す（空の欄だけ埋め、辞書は後ろに足す）／'rep' 置き換える。dry なら書かずに、何をするかだけ返す
   全年齢モードでは何もしない。登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, VS = HK && HK.VoiceSet, M = HK && HK.Moan, A = HK && HK.Adv;
  if (!VS || !M || HK.SAFE_ON) return;
  var esc = VS.esc, opt = VS.opt;
  VS.LABEL = '口調・喘ぎの設定';
  VS.MORE = '口調・喘ぎをより細かく設定する';
  var KEYS = ['moanTone', 'moanDict', 'moanDictT', 'moanFit', 'moanOpt'];
  var OWN_MAX = M.OWN_MAX || 4000, ADV_MAX = 20000;
  function G() { return HK.GearMoan; }
  function charHtml(c) {
    var keys = HK.TONE_KEYS || HK.PERSONA_KEYS, ld = HK.Attr && HK.Attr.libDim ? HK.Attr.libDim(c) : '';
    return '<div' + ld + '><div class="gearrow"><label>喘ぎの口調 <select data-gf="moanTone" aria-label="喘ぎの口調">' + opt('', 'いつもの口調と同じ', c.moanTone || '') + keys.map(function (k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return opt(k, t.label, c.moanTone || '', t.desc); }).join('') + '</select></label></div>' +
      '<p class="gearhint">喘ぎ声・夜の場面の声だけ、この口調で出します（普段は作った口調で話す人の、素の声が出る様子に）。</p>' +
      '<p class="gearhint">声の区分や割合の全員の既定は、上の「対象」を「全体」にした「喘ぎ」の「喘ぎ声の調整」で変えられます。ここで決めた辞書と区分は、この住人だけに効き、全体の設定より優先します。</p>' +
      (ld ? '<p class="gearhint glibnote">性欲が「なし」なので、合意のある夜の出来事は起きません。暗くした欄の値は残してあり、性欲を戻すと元どおり効きます。</p>' : '') +
      (G() ? G().html(c, { flat: true }) : '') + '</div>';
  }
  function sum(c) {
    if (!c) return '';
    var b = [];
    if (c.moanTone) b.push('喘ぎの口調：' + VS.toneLabel(c.moanTone));
    var g = G() && G().sumText ? G().sumText(c) : '';
    if (g && g !== '決めていません') b.push(g);
    return b.join('・');
  }
  function field(c, f, t, isInput, changed) {
    if (f === 'moanTone') { if (isInput) return true; if (HK.toneValid && HK.toneValid(t.value)) c.moanTone = t.value; else delete c.moanTone; changed(true); return true; }
    return !!(G() && G().field(c, f, t, isInput, changed));
  }

  /* ---------- 全体 → 住人 ---------- */
  /* 見出しの範囲が、その住人に効くか（効かなければ理由） */
  function scopeHit(scope, c) {
    if (scope === '共通') return true;
    var p;
    if (/^口調[=＝]/.test(scope)) { p = M.parse('[喘ぎ ' + scope + ' w1]\nx'); var tk = Object.keys(p.tone)[0]; return !!tk && tk === M.toneOf(c); }
    if (/^態度[=＝]/.test(scope)) { p = M.parse('[喘ぎ ' + scope + ' w1]\nx'); var pk = Object.keys(p.persona)[0]; return !!pk && pk === M.psOf(c, {}); }
    if (/^住人[=＝]/.test(scope)) return scope.slice(3).replace(/[⁠-⁤]/g, '') === c.name;
    return false;
  }
  /* 見出し（範囲を外したもの）の鍵が攻めの場面か */
  function topOf(rest) { var p = M.parse('[喘ぎ 共通 ' + rest + ']\nx'), k = Object.keys(p.shared)[0]; return !!(k && M.isTopKey(k)); }
  /* 全体の辞書 → { r: 受けの行, t: 攻めの行, n: 効く見出しの数, skip: 効かない見出しの数 } */
  function advToOwn(text, c) {
    var r = [], t = [], n = 0, skip = 0, dst = null;
    String(text || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/^\s+|\s+$/g, '');
      if (!line || /^[#＃]/.test(line)) { if (dst && line) dst.push(line); return; }
      var h = line.match(/^[\[［]\s*喘ぎ\s+(.+?)\s*[\]］]$/);
      if (h) {
        var parts = h[1].split(/[\s　]+/), scope = parts.shift(), rest = parts.join(' ');
        if (!scopeHit(scope, c) || !rest) { dst = null; skip++; return; }
        dst = topOf(rest) ? t : r; n++;
        dst.push('[' + rest + ']');
        return;
      }
      if (dst) dst.push(line);
    });
    return { r: r.join('\n'), t: t.join('\n'), n: n, skip: skip };
  }
  function joinText(a, b, max) { a = String(a || '').replace(/\s+$/, ''); var s = a ? a + '\n' + b : b; return s.slice(0, max); }
  function sameFit(a, b) { return JSON.stringify(M.ownFitNorm(a) || null) === JSON.stringify(M.ownFitNorm(b) || null); }
  function toChar(c, mode, dry) {
    var done = [], skip = [], adv = A ? A.get('moan') : '', fit = M.fitCfg;
    if (adv) {
      var o = advToOwn(adv, c);
      if (o.n) {
        [['moanDict', o.r, '受け'], ['moanDictT', o.t, '攻め']].forEach(function (x) {
          if (!x[1]) return;
          var cur = c[x[0]] || '', nv = mode === 'rep' || !cur.trim() ? x[1].slice(0, OWN_MAX) : joinText(cur, x[1], OWN_MAX);
          if (nv.length < (mode === 'rep' || !cur.trim() ? x[1].length : cur.replace(/\s+$/, '').length + 1 + x[1].length)) skip.push('喘ぎの辞書（' + x[2] + '）：' + OWN_MAX + '字を超える分は入りません');
          done.push('喘ぎの辞書（' + x[2] + 'のとき）に' + (mode === 'rep' ? '全体の行を入れる（今の行は置き換え）' : !cur.trim() ? '全体の行を入れる' : '全体の行を後ろに足す'));
          if (!dry) c[x[0]] = nv;
        });
        if (mode === 'rep') [['moanDict', o.r, '受け'], ['moanDictT', o.t, '攻め']].forEach(function (x) { if (!x[1] && c[x[0]]) { done.push('喘ぎの辞書（' + x[2] + 'のとき）を空にする（全体に該当する行がない）'); if (!dry) delete c[x[0]]; } });
      } else skip.push('喘ぎの辞書：全体の辞書に、この住人に効く見出し（共通・口調=・態度=・住人=' + c.name + '）がありません');
      if (o.skip) skip.push('喘ぎの辞書：この住人に効かない見出し ' + o.skip + ' 個は写しません（ほかの口調・態度・住人の行）');
    } else skip.push('喘ぎの辞書：全体の辞書は空です');
    var tk = M.toneOf(c), k = M.fitKind(tk), nf = k.def ? null : { kind: k.kind, masc: k.masc };
    if (nf || mode === 'rep') {
      if (nf && c.moanFit && mode !== 'rep') skip.push('声の区分：この住人はもう決めているので、足すでは変えません');
      else if (!sameFit(c.moanFit, nf)) { done.push(nf ? '声の区分を全体の「' + VS.toneLabel(tk) + '」の区分（' + M.KIND_LABEL[k.kind] + (k.masc ? '・男性的な語尾を残す' : '') + '）にする' : '声の区分を外して、全体の区分に従う'); if (!dry) { if (nf) c.moanFit = nf; else delete c.moanFit; } }
    } else skip.push('声の区分：全体の「' + VS.toneLabel(tk) + '」の区分は既定のままです');
    if (fit && (Object.keys(fit.night).length || Object.keys(fit.rate).length || Object.keys(fit.gender).length)) skip.push('夜の性格→声の基盤・割合・性別で整える：全体だけの設定なので、住人には写せません（全員に効いています）');
    return { done: done, skip: skip };
  }

  /* ---------- 住人 → 全体 ---------- */
  function ownToAdv(text) {
    var out = [], n = 0;
    String(text || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/^\s+|\s+$/g, ''), h = line.match(/^[\[［]\s*(.+?)\s*[\]］]$/);
      if (!h) { if (line) out.push(line); return; }
      var parts = h[1].split(/[\s　]+/);
      if (parts[0] === '喘ぎ') parts.shift();
      if (parts.length && (parts[0] === '共通' || /^(?:口調|態度|住人)[=＝]/.test(parts[0]))) parts.shift();
      out.push('[喘ぎ 共通 ' + parts.join(' ') + ']'); n++;
    });
    return { text: out.join('\n'), n: n };
  }
  function fromChar(c, mode, dry) {
    var done = [], skip = [];
    if (!A) return { done: done, skip: ['全体の設定がありません'] };
    var parts = [c.moanDict, c.moanDictT].filter(function (x) { return x && x.trim(); }).map(ownToAdv), txt = parts.map(function (p) { return p.text; }).join('\n'), n = parts.reduce(function (a, p) { return a + p.n; }, 0);
    if (n) {
      var cur = A.get('moan'), nv = mode === 'rep' || !cur.trim() ? txt : joinText(cur, txt, ADV_MAX);
      done.push('この住人の辞書の見出し ' + n + ' 個を、全体の喘ぎの辞書に「共通」として' + (mode === 'rep' || !cur.trim() ? '入れる（今の全体の辞書は置き換え）' : '後ろに足す（同じ場面の見出しは、後ろのものが効きます）'));
      if (!dry) A.set('moan', nv.slice(0, ADV_MAX), true);
    } else skip.push('喘ぎの辞書：この住人の辞書は空です');
    var of = M.ownFitNorm(c.moanFit), tk = M.toneOf(c);
    if (of) {
      var cfg = M.fitCfg ? JSON.parse(JSON.stringify(M.fitCfg)) : { tone: {}, night: {}, rate: {}, gender: {} }, w = cfg.tone[tk];
      if (w && mode !== 'rep') skip.push('声の区分：全体の「' + VS.toneLabel(tk) + '」の区分はもう変えてあるので、足すでは変えません');
      else {
        cfg.tone[tk] = { kind: of.kind || M.fitKind(tk).kind, masc: of.masc != null ? of.masc : M.fitKind(tk).masc };
        done.push('全体の「' + VS.toneLabel(tk) + '」の口調の区分を、この住人の声の区分（' + M.KIND_LABEL[cfg.tone[tk].kind] + (cfg.tone[tk].masc ? '・男性的な語尾を残す' : '') + '）にする（同じ口調の全員に効きます）');
        if (!dry) { M.setFit(cfg); A.set('moanfit', M.fitCfg ? JSON.stringify(M.fitCfg) : '', true); }
      }
    } else skip.push('声の区分：この住人は決めていません');
    if (c.moanTone) skip.push('喘ぎの口調：住人だけの設定なので、全体には写せません');
    if (c.moanOpt) skip.push('言い返し・言葉責めの多さ：住人だけの設定なので、全体には写せません');
    return { done: done, skip: skip };
  }
  /* 全体の設定を「足す」で読み込むとき、喘ぎ声の調整（moanfit）は欠けている項目だけ埋める */
  function mergeAdv(id, cur, inc) {
    if (id !== 'moanfit') return null;
    var a, b;
    try { a = cur ? JSON.parse(cur) : {}; b = inc ? JSON.parse(inc) : {}; } catch (e) { return null; }
    ['tone', 'night', 'rate', 'gender'].forEach(function (k) { a[k] = a[k] && typeof a[k] === 'object' ? a[k] : {}; var bb = b[k] && typeof b[k] === 'object' ? b[k] : {}; Object.keys(bb).forEach(function (x) { if (a[k][x] == null) a[k][x] = bb[x]; }); });
    return JSON.stringify(a);
  }
  VS.add({
    id: 'moan', label: '喘ぎ', keys: KEYS, resetKeys: KEYS,
    charHtml: charHtml, sum: sum, field: field,
    globalHtml: function () { return A ? A.body() : ''; },
    /* 住人のとき：辞書の欄を中身に合わせて伸ばす（ui-adv.js の A.growAll。2026-10-28 担当LD） */
    after: function (c) { if (!c && A) A.afterRender(); else if (A && A.growAll) A.growAll(document.getElementById('vs-panel')); },
    act: function (act, c, el) { return !!(G() && G().act(act, c, el)); },
    toChar: toChar, fromChar: fromChar, mergeAdv: mergeAdv
  });
  /* ui.js が先に描いた住人タブを、喘ぎの折りたたみ入りで描き直す */
  if (HK.UI && HK.UI.refresh) HK.UI.refresh();
})();
