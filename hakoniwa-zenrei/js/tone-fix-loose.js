/* 箱庭シミュレーター: 書き下ろし辞書（V.TONE_FIX）の鍵のゆるい引き方
   書き下ろしたあとで元の台詞が少しだけ変わり、鍵が当たらなくなった行を拾う（tone-fix.js の引き方で外れたときだけ）：
   ・一人称だけの違い：元の台詞が「俺」「僕」「あたし」で書かれていた頃の鍵（いまの台詞は「私」で書く約束）
   ・読点・「……」・空白だけの違い（「〈〉、……会えて」と「〈〉……会えて」）。？・！・。の違いは別の台詞として扱う
   派生の口調で元の口調の書き下ろしを引き継がない口調（registry の noBaseFix）には使わない。両方のビルドに同じファイルを置く */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !V.overrideFor) return;
  var FIX = V.TONE_FIX = V.TONE_FIX || {};
  var LOOSE = {}, FPS = ['俺', '僕', 'あたし', 'わたし', 'オレ', '自分'];
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var MOANISH = /♡|[ぁぃぅぇぉ]|[…‥、]っ|っ[…‥、]/;
  /* 頭の「……」の有無は区別する（「おいしい」と「……おいしい」は言い方が違う） */
  function looseKey(k) { return (/^[…‥]/.test(k) ? '…' : '') + k.replace(/[、…‥\s　]/g, ''); }
  function looseFix(T, tone, key) {
    if (/私/.test(key)) for (var i = 0; i < FPS.length; i++) { var k2 = key.replace(/私/g, FPS[i]); if (T[k2] != null) return T[k2]; }
    /* 喘ぎ（♡・小さい母音・「……っ」）は区切りが声の調子そのものなので、記号の違いを無視して引かない */
    var lk = looseKey(key);
    if (lk.length < 4 || MOANISH.test(key)) return null;
    var ix = LOOSE[tone];
    /* 索引は初めて外れたときに作る（あとから読む分の書き下ろしが読み終わる前に作ったもの・そのあとかたまりが増えたときのものは作り直す。HK.Load.gen は load.js） */
    var gk = String(HK.LATE_READY) + ':' + (HK.Load ? HK.Load.gen : 0);
    if (!ix || ix.T !== T || ix.gk !== gk) {
      ix = LOOSE[tone] = { T: T, gk: gk, m: {} };
      for (var k in T) { var l = looseKey(k); if (l.length >= 4 && !MOANISH.test(k) && !(l in ix.m)) ix.m[l] = k; }
    }
    var hit = ix.m[lk];
    return hit != null ? T[hit] : null;
  }
  var of0 = V.overrideFor;
  V.overrideFor = function (q, who, people) {
    var r = of0.apply(this, arguments);
    if (r != null || !who || typeof q !== 'string') return r;
    var T = FIX[who.tone];
    if (!T || (who._from && HK.toneOpt && HK.toneOpt(who._from, 'noBaseFix'))) return r;
    /* 台詞の中の住人の名前を〈〉にして引く（tone-fix.js と同じ） */
    var ns = (people || []).map(function (p) { return p.name; }).filter(Boolean).sort(function (a, b) { return b.length - a.length; }), names = [];
    var key = ns.length ? q.replace(new RegExp(ns.map(esc).join('|'), 'g'), function (m) { names.push(m); return '〈〉'; }) : q;
    var v = looseFix(T, who.tone, key);
    if (v == null) return r;
    var i = 0;
    return v.replace(/〈〉/g, function () { var n = names[Math.min(i, names.length - 1)]; i++; return n || ''; });
  };
})();
