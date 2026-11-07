/* 常識改変：電車（R18版のみ）：場の設定「乗客の性別」の開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当TM）
   本番の決まり（solo-train.js の run・mobGen・mobGOk）：
   ・おまかせ：乗客は住人の恋愛対象（体の関係の相手）に合わせる（今までどおり。注意は出さない）
   ・男だけ／女だけ：その性別が恋愛対象（体の関係の相手。男女両方・おまかせは合う）に合わない住人は、乗客とは触れ合わない（触れ合いの外で眺める）
   ・合う住人が一人もおらず、連れどうしでも触れ合わない（1人・場の設定「触れ合う相手」が「連れの住人」でない・二人が体の関係になれない）なら、
     この電車で何も起きないので始めない
   受け攻め（攻め二人など）の注意は solo-train.js の touchConflict（scen.check）が先に出す */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.TRAIN || !HK.TRAIN.mobGOk) return;
  var JA = { m: '男だけ', f: '女だけ' }, GJ = { m: '男性', f: '女性' };
  /* 避けている二人（2026-11-07。solo-train.js の avoidStop と同じ決まり）：場の設定「触れ合う相手」が「連れの住人」で、両方が避けている・
     攻めに固定された人が受けを避けている二人（セフレの関係が無い）は、連れどうしの場面が起きない。止めはしない（warn） */
  function avoidWarn(input, T) {
    var A = HK.Avoid, C = T.C;
    if (!A || !A.topOk || C.length !== 2 || T.env.partner !== 'pair' || !T.ok(C[0], C[1])) return null;
    var x = { ties: (input.ties || []).filter(function (t) { return t && t.a !== t.b && C[t.a] && C[t.b]; }) };
    if (x.ties.some(function (t) { return t.type === 'fwb'; }) || A.topOk(x, C[0], C[1])) return null;
    var wa = A.why(x, C[0], C[1]), wb = A.why(x, C[1], C[0]);
    var who = wa && wb ? C[0].name + 'と' + C[1].name + 'が互いに避けている' : (wa ? C[0].name + 'が' + C[1].name : C[1].name + 'が' + C[0].name) + 'を避けていて、受け攻めの指定で攻めに固定されている';
    return { level: 'warn', text: who + '（' + (wa && wb ? C[0].name + '：' + wa + '／' + C[1].name + '：' + wb : wa || wb) + '）ので、連れどうしでは触れ合いません（乗客とは触れ合います）。関係の「相手の気持ち」「執着される側」を変えるか、不仲・敵対を減らす（回避型の気質のとき）か、セフレの関係を足すと触れ合えます' };
  }
  HK.SoloWarn.add('train', function (input, T) {
    var aw = avoidWarn(input, T), pre = aw ? [aw] : [];
    var g = T.env.mobsex;
    if (g !== 'm' && g !== 'f') return pre;
    var C = T.C, out = pre;
    /* 乗客と触れ合わない設定の人（性行為の相手の固定・体の関係の相手「なし」）は、乗客の性別に関わらず外で眺めるので数えない */
    var lock = function (c) { return HK.State && HK.State.mobSexOk && !HK.State.mobSexOk(c); };
    /* 迎えに行く人（solo-train.js の run と同じ決め方：「迎えに行く」を選んだ人。おまかせなら、片方だけが攻めの指定で欄がおまかせ・「触れ合う相手」が「連れの住人」でない）は、乗客とは触れ合わない */
    var pk = C.map(function (c) { var v = T.pick(c.i, 'touch'); return v && v !== 'auto' ? v : ''; });
    var tops = C.filter(function (c) { return HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(c); });
    var pickers = C.filter(function (c) { return pk[c.i] === 'pick'; });
    var rescuer = C.length !== 2 ? null : pickers.length === 1 ? pickers[0] : !pickers.length && tops.length === 1 && !pk[tops[0].i] && T.env.partner !== 'pair' ? tops[0] : null;
    var ng = C.filter(function (c) { return c !== rescuer && !lock(c) && !HK.TRAIN.mobGOk(c, g); });
    var okN = C.filter(function (c) { return c !== rescuer && !lock(c) && HK.TRAIN.mobGOk(c, g); }).length;
    if (!ng.length) return out;
    var pair = C.length === 2 && T.env.partner === 'pair' && T.ok(C[0], C[1]);
    if (!okN && !pair) return [{ level: 'block', text: '乗客が' + GJ[g] + 'だけ（場の設定「乗客の性別」が「' + JA[g] + '」）で、' + T.nm(ng) + 'の恋愛対象（体の関係の相手）に合わないので、乗客と触れ合える人がいません。「乗客の性別」を「おまかせ」か合う性別にするか、住人の恋愛対象を変えてください' + (C.length === 2 ? (rescuer ? '（' + rescuer.name + 'は迎えに行く人なので、乗客とは触れ合いません）' : '（二人が体の関係になれる組なら、場の設定「触れ合う相手」を「連れの住人」にしても始められます）') : '') }];
    out.push({ level: 'warn', text: T.nm(ng) + 'は、恋愛対象（体の関係の相手）が乗客の性別（' + JA[g] + '）に合わないので、乗客とは触れ合わず、触れ合いの外で眺めます' + (pair ? '（連れの住人とは触れ合います）' : '') });
    return out;
  });
})();
