/* 箱庭シミュレーター: 書き下ろし辞書（V.TONE_FIX）の鍵のゆるい引き方
   書き下ろしたあとで元の台詞が少しだけ変わり、鍵が当たらなくなった行を拾う（tone-fix.js の引き方で外れたときだけ）：
   ・一人称だけの違い：元の台詞が「俺」「僕」「あたし」で書かれていた頃の鍵（いまの台詞は「私」で書く約束）
   ・読点・「……」・空白だけの違い（「〈〉、……会えて」と「〈〉……会えて」）。？・！・。の違いは別の台詞として扱う
   派生の口調で元の口調の書き下ろしを引き継がない口調（registry の noBaseFix）には使わない。両方のビルドに同じファイルを置く
   分割読み込みの第4段から、書き下ろしの表（tone-fix*.js）はビルドが口調ごとのデータのかたまり（HK.Load.toneData）にするので、
   表を引く包み（もとは tone-fix.js の末尾）もここに置く：tone-fix.js が先に包んでいれば（js を1本ずつ読むとき・ビルドの vm）何もしない（V._toneFixHooked） */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !V.overrideFor) return;
  var FIX = V.TONE_FIX = V.TONE_FIX || {};
  /* ---------- 書き下ろし（TONE_FIX）の引き方（tone-fix.js の末尾と同じ。包む順も同じ＝tone-firm.js の包みの外、ゆるい引き方の内） ---------- */
  if (!V._toneFixHooked) {
    V._toneFixHooked = true;
    var ofx = V.overrideFor;
    V.overrideFor = function (q, who, people) {
      var T = who && FIX[who.tone];
      if (T) {
        var ns = (people || []).map(function (p) { return p.name; }).filter(Boolean).sort(function (a, b) { return b.length - a.length; }), names = [];
        var key = ns.length ? q.replace(new RegExp(ns.map(esc).join('|'), 'g'), function (m) { names.push(m); return '〈〉'; }) : q;
        var v = T[key];
        /* 派生の口調（チャラい・熱血など、registry の noBaseFix）は、元の口調向けに書き下ろした台詞（tone-fix-g*.js）を引き継がない */
        var GK = V.TONE_FIX_G;
        if (v != null && who._from && HK.toneOpt && HK.toneOpt(who._from, 'noBaseFix') && GK && GK[who.tone] && GK[who.tone][key]) v = null;
        /* 頭の「…」だけ違う台詞も同じものとして引く（頭の「…」は残す） */
        if (v == null) { var lead = (key.match(/^[…‥]+/) || [''])[0]; if (lead && T[key.slice(lead.length)] != null) v = lead + T[key.slice(lead.length)].replace(/^[…‥]+/, ''); }
        if (v != null) { var i = 0; return v.replace(/〈〉/g, function () { var n = names[Math.min(i, names.length - 1)]; i++; return n || ''; }); }
      }
      return ofx ? ofx.apply(this, arguments) : null;
    };
  }
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
/* 置き場の印で引く（2026-10-31 担当TE2）：モブの呼び名・数の入る台詞を、書き下ろしの 1 行で全部の呼び名・数に当てる
   ・引く順：①元の台詞（上の包みまで＝そのままの鍵・〈〉・頭の「…」・ゆるい鍵）で引けなかったときだけ、
     ②モブの呼び名の印（mob.js の「\u2063呼び名\u2063」「\u2063呼び名\u2061」）と「あなた」を〈相手〉にした鍵
     （{you} は相手がモブなら印、住人なら「あなた」になる。solo-saimin.js・solo-massage.js など）、
     ③それでもなければ、さらに数（算用数字・全角数字の連なり、漢数字〇一二三四五六七八九十百千の連なり）を〈数〉にした鍵で、①と同じ引き方をする。
     住人の名前の中の漢数字（「一花」など）は数にしない。その口調の表（TONE_FIX・OVR）に〈相手〉・〈数〉の鍵が 1 つも無ければ②③は試さない。
   ・引けたら、書き下ろしの〈相手〉を元の印（呼び名ごと。あとで tone-plus.js の V.mobAddr が話し手の二人称・名前に替える）に、〈数〉を元の数に、
     出てきた順に戻す（書き下ろしの側の数が多ければ最後のものを繰り返す）。
   ・既存の行（呼び名・数を直接書いた鍵）は①で先に当たるので、結果は変わらない。決まりは docs/reports/2026-10-25/tone-engine-design.md の 22 章 */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !V.overrideFor) return;
  var MOB_RE = /\u2063[^\u2063\u2061]*[\u2063\u2061]|あなた/g, NUM_RE = /[0-9０-９]+|[〇一二三四五六七八九十百千]+/g, NUM_TEST = /[0-9０-９〇一二三四五六七八九十百千]/;
  var PH = {};
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* その口調の表に〈相手〉・〈数〉の鍵があるか（表が増えたら作り直す。HK.Load.gen は load.js） */
  function phOf(tone) {
    var gk = String(HK.LATE_READY) + ':' + (HK.Load ? HK.Load.gen : 0), c = PH[tone];
    if (c && c.gk === gk) return c;
    c = PH[tone] = { gk: gk, mob: false, num: false };
    [V.TONE_FIX && V.TONE_FIX[tone], V.OVR && V.OVR[tone]].forEach(function (T) {
      if (T) for (var k in T) { if (k.indexOf('〈相手〉') >= 0) c.mob = true; if (k.indexOf('〈数〉') >= 0) c.num = true; }
    });
    return c;
  }
  /* 住人の名前の外だけ、数を〈数〉に */
  function numKey(q, people, nums) {
    var ns = (people || []).map(function (p) { return p.name; }).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    var parts = ns.length ? q.split(new RegExp('(' + ns.map(esc).join('|') + ')')) : [q];
    return parts.map(function (s, i) { return i % 2 ? s : s.replace(NUM_RE, function (m) { nums.push(m); return '〈数〉'; }); }).join('');
  }
  function put(v, ph, list) { var i = 0; return v.split(ph).reduce(function (a, s) { var x = list[Math.min(i, list.length - 1)]; i++; return a + (x != null ? x : '') + s; }); }
  var of1 = V.overrideFor;
  V.overrideFor = function (q, who, people) {
    var r = of1.apply(this, arguments);
    if (r != null || !who || typeof q !== 'string') return r;
    var hasMob = q.indexOf('\u2063') >= 0 || q.indexOf('あなた') >= 0, hasNum = NUM_TEST.test(q);
    if (!hasMob && !hasNum) return r;
    var c = phOf(who.tone);
    if (!c.mob && !c.num) return r;
    var mobs = [], q2 = hasMob ? q.replace(MOB_RE, function (m) { mobs.push(m); return '〈相手〉'; }) : q, v = null, nums = [];
    if (mobs.length && c.mob) v = of1.call(this, q2, who, people);
    if (v == null && c.num) { var q3 = numKey(q2, people, nums); if (nums.length) v = of1.call(this, q3, who, people); }
    if (v == null) return r;
    if (mobs.length && v.indexOf('〈相手〉') >= 0) v = put(v, '〈相手〉', mobs);
    if (nums.length && v.indexOf('〈数〉') >= 0) v = put(v, '〈数〉', nums);
    return v;
  };
})();
