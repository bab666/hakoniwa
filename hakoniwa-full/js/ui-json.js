/* 箱庭診断 ui の部品：住人の JSON の書き出し・読み込み（2026-11-04 に ui.js から分けた。late：画面が出たあとで読む。押したときだけ要る）
   ui.js は HK.UIJson が無いうち（late を読み終える前）に押されたら、late を読んでから呼ぶ（ui.js の lateCall）。
   ui.js の中の状態・関数は HK.UI._k から、整えの関数は HK.UINorm（ui-norm.js）から引く。中身は ui.js にあったときと同じ */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var K = HK.UI && HK.UI._k, UN = HK.UINorm;
  if (!K || !UN) return;
  var MAX = UN.MAX, idList = UN.idList, migSexLock = UN.migSexLock, migVamp = UN.migVamp, mk = UN.mk, normChar = UN.normChar, normRefs = UN.normRefs, okTone = UN.okTone;
  var cleanTies = K.cleanTies, copy = K.copy, inGrp = K.inGrp, renderCast = K.renderCast, save = K.save, toast = K.toast, CP = HK.CastPages || null;
  /* ---------- JSONでの書き出し・読み込み ---------- */
  /* only（住人の id の配列）を渡すと、その住人だけを書き出す。
     選ばなかった住人との関係・恋愛相手の固定・呼び方・敬語の相手は、番号ではなく名前で書く（読み込む側で同じ名前の住人につながる） */
  /* St を渡すと、今の名簿ではなくその状態から作る（まるごと読み込みの「足す」。portable.js が normState で整えて渡す）。そのときは高度設定を付けない */
  function rosterJSON(only, St) {
    var R = St || K.S();
    var idx = {}, name = {}, list = only ? R.chars.filter(function (c) { return only.indexOf(c.id) >= 0; }) : R.chars;
    list.forEach(function (c, i) { idx[c.id] = i; });
    R.chars.forEach(function (c) { name[c.id] = c.name; });
    var ref = function (id) { return idx[id] != null ? idx[id] : only && name[id] ? name[id] : null; };
    var out = {
      format: 'hakoniwa-residents', version: 1, exported: new Date().toISOString(),
      partial: only ? true : undefined,
      chars: list.map(function (c) {
        var o = { name: c.name, code: HK.toCode(c.eg), eg: c.eg, memo: c.memo || '', group: c.group || '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '' };
        if (c.tags) o.tags = c.tags;
        if (c.reg) o.reg = c.reg;
        if (c.icon) o.icon = c.icon;
        if (c.color) o.color = c.color;
        if (c.call) o.call = c.call;
        if (c.callG) o.callG = c.callG;
        if (c.bmonth) o.bmonth = +c.bmonth;
        if (c.age) o.age = +c.age;
        if (c.keigoOlder) o.keigoOlder = true;
        if (c.futa) o.futa = true;
        if (c.daku) o.daku = true;
        if (c.heart === false) o.heart = false;
        if (c.faithful) o.faithful = true;
        if (c.noR18) o.noR18 = true;
        if (HK.Pos && HK.Pos.npcValid(c.posNpc)) o.posNpc = c.posNpc;
        if (c.alcohol) o.alcohol = +c.alcohol;
        if (c.partWords) o.partWords = c.partWords;
        if (c.partM) o.partM = c.partM;
        if (c.partF) o.partF = c.partF;
        if (c.you) o.you = c.you;
        if (c.marks) o.marks = c.marks;
        if (HK.Attr) HK.Attr.exportTo(o, c, ref);
        if (HK.Shared) HK.Shared.exportTo(o, c);
        if (c.toneCustom) o.toneCustom = c.toneCustom;
        if (c.moanTone) o.moanTone = c.moanTone; ['moanDict', 'moanDictT', 'moanFit', 'moanOpt'].forEach(function (k) { if (c[k]) o[k] = JSON.parse(JSON.stringify(c[k])); });
        /* 固定した相手：一人なら番号（以前の形）、二人以上なら番号の並び */
        var lks = idList(c.loveLock).map(ref).filter(function (x) { return x != null; });
        if (lks.length) o.loveLock = lks.length === 1 ? lks[0] : lks;
        /* 性行為の相手の固定：誰とでも可は 'any'、固定した相手は番号（一人なら番号、二人以上なら並び）。「固定した相手＋モブ」は sexLockMob も付ける */
        if (c.sexLock === 'any') o.sexLock = c.sexLock;
        else if (c.sexLock === 'pick' || c.sexLock === 'pickMob') { var sls = idList(c.sexLocks).map(ref).filter(function (x) { return x != null; }); if (sls.length) { o.sexLock = sls.length === 1 ? sls[0] : sls; if (c.sexLock === 'pickMob') o.sexLockMob = true; } }
        if (c.loveNG && c.loveNG.length) { var ng = c.loveNG.map(ref).filter(function (x) { return x != null; }); if (ng.length) o.loveNG = ng; }
        if (c.calls) { var cl = {}; Object.keys(c.calls).forEach(function (id) { if (ref(id) != null && c.calls[id]) cl[ref(id)] = c.calls[id]; }); if (Object.keys(cl).length) o.calls = cl; }
        if (c.keigo) { var kg = Object.keys(c.keigo).filter(function (id) { return ref(id) != null && c.keigo[id]; }).map(ref); if (kg.length) o.keigo = kg; }
        if (R.per && R.per[c.id]) o.per = R.per[c.id];
        return o;
      }),
      ties: (R.ties || []).filter(function (t) { return ref(t.a) != null && ref(t.b) != null && (idx[t.a] != null || idx[t.b] != null); }).map(function (t) { var o = { a: ref(t.a), b: ref(t.b), type: t.type }; if (t.cold) o.cold = t.cold; if (t.love === 'ok' || t.love === 'no') o.love = t.love; HK.TIE_XF.forEach(function (f) { if (t[f]) o[f] = t[f]; }); return o; }),
      teacher: R.teacher && idx[R.teacher] != null ? idx[R.teacher] : null,
      /* グループごとの「仲間」（書き出す住人のグループだけ） */
      grpComrade: (function () { var m = {}, any = false; Object.keys(R.grpComrade || {}).forEach(function (g) { if (R.grpComrade[g] && R.chars.some(function (c) { return (only ? idx[c.id] != null : true) && inGrp(c, g); })) { m[g] = 1; any = true; } }); return any ? m : undefined; })(),
      /* 話題（ui-topics.js。住人は番号。一部だけのときは、その人たちとそのグループの話題だけ） */
      topics: HK.TopicsUI ? HK.TopicsUI.exportTo(R, ref, idx, only) : undefined,
      /* 内容のスイッチ（R18版）も一緒に書き出す（全員を書き出すときだけ） */
      ct: !only && !HK.SAFE_ON && R.glob && R.glob.ct && Object.keys(R.glob.ct).length ? R.glob.ct : undefined
    };
    if (!only && !St && HK.Adv) HK.Adv.exportTo(out);
    return out;
  }
  function exportJSON(only) {
    var data = rosterJSON(only), text = JSON.stringify(data, null, 1);
    var d = new Date(), tag = only ? '-part' + data.chars.length : '';
    var name = 'hakoniwa-residents' + tag + '-' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '.json';
    try {
      var blob = new Blob([text], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      if (!('download' in a)) throw new Error('nodl');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast(data.chars.length + '人分をJSONで書き出しました' + (only ? '（読み込む側で「JSONを足す」を使うと、同じ名前の住人だけが更新されます）' : ''));
    } catch (e) { copy(text, 'ファイルを保存できない環境なので、JSONをクリップボードにコピーしました'); }
  }
  function num(v) { v = parseFloat(v); return isNaN(v) ? null : HK.clamp(v, 0, 20); }
  function importJSON(text, replace) {
    var data;
    try { data = JSON.parse(text); } catch (e) { toast('JSONとして読めませんでした'); return; }
    var arr = Array.isArray(data) ? data : data && Array.isArray(data.chars) ? data.chars : null;
    if (!arr || !arr.length) { toast('住人のデータが見つかりませんでした'); return; }
    var list = replace || K.S().sample ? [] : K.S().chars.slice();
    var map = [], added = 0, updated = 0, skipped = 0, per0 = K.S().per;
    if (replace || K.S().sample) K.S().per = {};
    arr.forEach(function (o, i) {
      if (typeof o === 'string') { var pr = HK.parseRoster ? HK.parseRoster(o) : null; o = pr && pr.chars[0] ? { name: pr.chars[0].name, eg: pr.chars[0].eg, memo: pr.chars[0].memo } : null; }
      if (!o || typeof o !== 'object') { map[i] = null; skipped++; return; }
      try {
      var name = String(o.name || '').trim().slice(0, 24) || ('キャラ' + (i + 1));
      var eg = null;
      if (o.eg && typeof o.eg === 'object') { eg = {}; HK.FACTORS.forEach(function (k) { var v = num(o.eg[k]); eg[k] = v == null ? 10 : v; }); }
      else if (HK.isCode && HK.isCode(o.code || '')) eg = HK.fromCode(String(o.code).trim());
      if (!eg) { map[i] = null; skipped++; return; }
      var c = list.filter(function (x) { return x.name === name; })[0];
      if (c) { c.eg = eg; updated++; }
      else { if (list.length >= MAX) { map[i] = null; skipped++; return; } c = mk({ name: name, eg: eg }); c._new = 1; list.push(c); added++; }
      c.memo = String(o.memo || c.memo || '').slice(0, 80);
      if (o.group != null) c.group = String(o.group).trim().slice(0, 40);
      if (o.tags != null) c.tags = String(o.tags).trim().slice(0, 80);
      if (['', 'm', 'f', 'x'].indexOf(o.gender || '') >= 0) c.gender = o.gender || '';
      if (['', 'm', 'f', 'both', 'none'].indexOf(o.likes || '') >= 0) c.likes = o.likes || '';
      if (['', 'top', 'bottom', 'riba'].indexOf(o.pos || '') >= 0) c.pos = o.pos || '';
      if (o.tone == null || o.tone === '' || (HK.toneValid ? HK.toneValid(o.tone) : HK.PERSONA[o.tone])) c.tone = o.tone || '';
      if (typeof o.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.color)) c.color = o.color;
      if (typeof o.call === 'string') c.call = o.call;
      if (o.callG && typeof o.callG === 'object') c.callG = o.callG;
      if (o.bmonth != null) c.bmonth = o.bmonth;
      if (o.age != null) c.age = o.age;
      if (o.keigoOlder) c.keigoOlder = true;
      if (o.futa) c.futa = true;
      if (o.daku) c.daku = true;
      if (o.heart === false) c.heart = false;
      if (o.faithful) c.faithful = true;
      if (o.noR18) c.noR18 = true;
      if (HK.Pos && HK.Pos.npcValid(o.posNpc)) c.posNpc = o.posNpc;
      /* 登録順（書き出したときの値。無い古い JSON は、足した順の新しい値のまま） */
      if (c._new && +o.reg > 0 && isFinite(+o.reg)) c.reg = Math.floor(+o.reg);
      delete c._new;
      if (HK.ALC_OK(o.alcohol)) c.alcohol = String(o.alcohol);
      if (o.partWords) c.partWords = o.partWords;
      if (o.partM != null) c.partM = String(o.partM);
      if (o.partF != null) c.partF = String(o.partF);
      if (o.you != null) c.you = String(o.you).trim().slice(0, 8);
      if (o.marks != null) c.marks = String(o.marks).trim().slice(0, 30);
      if (HK.Attr) HK.Attr.importFrom(c, o);
      if (HK.Shared) HK.Shared.importFrom(c, o);
      if (o.toneCustom != null) c.toneCustom = (HK.normToneCustom ? HK.normToneCustom(String(o.toneCustom).slice(0, 120)) : '');
      if (o.moanTone != null) c.moanTone = okTone(o.moanTone) ? String(o.moanTone || '') : ''; ['moanDict', 'moanDictT', 'moanFit', 'moanOpt'].forEach(function (k) { if (o[k] != null) c[k] = typeof o[k] === 'string' ? o[k].slice(0, 4000) : JSON.parse(JSON.stringify(o[k])); });
      c._lk = o.loveLock; c._sl = o.sexLock; c._slm = !!o.sexLockMob; c._cl = o.calls; c._kg = o.keigo; c._ng = o.loveNG;
      if (o.fp != null) c.fp = String(o.fp).trim().slice(0, 8);
      if (typeof o.icon === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/.test(o.icon) && o.icon.length < 400000) c.icon = o.icon;
      if (o.per && typeof o.per === 'object') { K.S().per = K.S().per || {}; K.S().per[c.id] = JSON.parse(JSON.stringify(o.per)); migVamp(c, K.S().per[c.id]); }
      normChar(c);
      /* 古いJSON：箱庭ごとに入っていた共通の能力値・欄を住人へ */
      if (HK.Shared && K.S().per && K.S().per[c.id]) HK.Shared.migrate(c, K.S().per[c.id]);
      map[i] = c.id;
      } catch (err) { map[i] = null; skipped++; if (window.console) console.warn("JSON import skip", i, err); }
    });
    /* 一人も読めなかったら何も変えない（置き換えで、今の住人を空にして保存してしまわないように） */
    if (!added && !updated) { K.S().per = per0; toast('読み込める住人が見つかりませんでした（名前とエゴグラムの値かコードが必要です）。今の住人はそのままです'); return; }
    K.S().chars = list; K.S().sample = false;
    if (replace) { K.S().ties = []; K.S().join = {}; K.S().teacher = ''; }
    var tn = 0;
    function ref(v) {
      if (typeof v === 'number' || /^\d+$/.test(String(v))) return map[+v];
      var hit = list.filter(function (x) { return x.name === v; })[0];
      return hit ? hit.id : null;
    }
    (Array.isArray(data.ties) ? data.ties : []).forEach(function (t) {
      if (!t || typeof t !== 'object') return;
      var a = ref(t.a), b = ref(t.b);
      if (!a || !b || a === b || typeof t.type !== 'string' || !Object.prototype.hasOwnProperty.call(HK.TIES, t.type)) return;
      K.S().ties = (K.S().ties || []).filter(function (x) { return !(x.type === t.type && ((x.a === a && x.b === b) || (x.a === b && x.b === a))); });
      var CO2 = HK.coldOpts ? HK.coldOpts(t.type) : null;
      var nt0 = t.cold && CO2 && CO2.map[t.cold] ? { a: a, b: b, type: t.type, cold: t.cold } : { a: a, b: b, type: t.type };
      if (t.love === 'ok' || t.love === 'no') nt0.love = t.love;
      /* 追加の欄（型・度合い・気持ち・様子・愛憎）。古い JSON にはないので、ないときは今までどおり */
      HK.TIE_XF.forEach(function (f) { if (typeof t[f] === 'string' && t[f]) nt0[f] = t[f]; });
      if (HK.tieLhMigrate) HK.tieLhMigrate([nt0]).slice(1).forEach(function (x) { K.S().ties.push(x); });
      if (HK.tieExtraNorm) HK.tieExtraNorm(nt0);
      if (HK.tieHidden && HK.tieHidden(nt0.type)) return;
      K.S().ties.push(nt0); tn++;
    });
    /* グループごとの「仲間」（古い JSON にはない） */
    if (replace) K.S().grpComrade = {};
    if (data.grpComrade && typeof data.grpComrade === 'object' && !Array.isArray(data.grpComrade)) { K.S().grpComrade = K.S().grpComrade || {}; Object.keys(data.grpComrade).forEach(function (g) { if (data.grpComrade[g] && String(g).trim()) K.S().grpComrade[String(g).trim().slice(0, 40)] = 1; }); }
    if (data.teacher != null && map[data.teacher]) K.S().teacher = map[data.teacher];
    /* 話題（古い JSON にはない。置き換えで JSON に話題があれば、今の話題と入れ替える） */
    if (HK.TopicsUI) HK.TopicsUI.importFrom(data, ref, replace && Array.isArray(data.topics));
    if (HK.Adv) HK.Adv.importFrom(data);
    if (data.ct && typeof data.ct === 'object' && !HK.SAFE_ON && HK.Content) { K.S().glob = K.S().glob || {}; K.S().glob.ct = {}; HK.Content.TAGS.forEach(function (t) { if (data.ct[t.id]) K.S().glob.ct[t.id] = 1; }); }
    /* 恋愛相手の固定と呼び方は、全員を読み込んでから番号を住人に戻す */
    list.forEach(function (c) {
      if (Array.isArray(c._ng)) c.loveNG = c._ng.map(function (k) { return typeof k === 'number' || /^\d+$/.test(String(k)) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; }).filter(Boolean);
      delete c._ng;
      if (HK.Attr) HK.Attr.importRefs(c, ref);
      /* 固定した相手：番号・名前・その並び、のどれでも */
      var toIds = function (v) { return idList((Array.isArray(v) ? v : [v]).map(function (k) { return typeof k === 'number' || /^\d+$/.test(String(k)) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; })); };
      if (c._lk != null) { c.loveLock = toIds(c._lk); delete c._lk; }
      /* 性行為の相手の固定：古い 'lover'・'loverOnly' は、恋愛相手の固定を戻したあとで migSexLock で読み替える（保存の読み込みと同じ） */
      if (c._sl === 'any') { c.sexLock = c._sl; c.sexLocks = []; }
      else if (c._sl === 'lover' || c._sl === 'loverOnly') { c.sexLock = c._sl; c.sexLocks = []; migSexLock(c); }
      else if (c._sl != null && c._sl !== '') { c.sexLocks = toIds(c._sl); c.sexLock = c.sexLocks.length ? (c._slm ? 'pickMob' : 'pick') : ''; }
      delete c._sl; delete c._slm;
      if (c._cl && typeof c._cl === 'object') { c.calls = c.calls || {}; Object.keys(c._cl).forEach(function (k) { var id = /^\d+$/.test(k) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; if (id) c.calls[id] = String(c._cl[k]).slice(0, 16); }); }
      delete c._cl;
      /* 敬語で話す相手：番号（または名前）の並び */
      if (Array.isArray(c._kg)) { c.keigo = c.keigo || {}; c._kg.forEach(function (k) { var id = typeof k === 'number' || /^\d+$/.test(String(k)) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; if (id) c.keigo[id] = 1; }); }
      delete c._kg;
    });
    normRefs(K.S());
    cleanTies();
    var ok = save() !== false;
    renderCast();
    var parts = []; if (added) parts.push(added + '人を追加'); if (updated) parts.push(updated + '人を更新'); if (tn) parts.push('関係' + tn + '件を復元');
    toast('JSONから' + (parts.join('・') || '0人を読み込み') + 'しました' + (skipped ? '（' + skipped + '件は読めないか上限超えのため省略）' : '') + (ok ? '' : '。ブラウザに保存しきれませんでした'));
  }

  HK.UIJson = { rosterJSON: rosterJSON, exportJSON: exportJSON, importJSON: importJSON };
})();
