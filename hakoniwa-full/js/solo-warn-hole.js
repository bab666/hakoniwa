/* 感覚遮断穴（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-hole.js・solo-hole-behind.js）：はまる人＝役割「穴にはまる」の人、いなければ一人目（主催者は除く）。
   はまる人が攻め（HK.Pos.hardTopNpc）なら、壁の向こうの手を追い払い、挿入されず感覚も溜まらない（壁の向こうの受けの住人が跨ることはある）。
   リバ・おまかせの男性（性器あり）は、気質しだいで跨られる側（挿入されない）。壁の向こうの攻めの住人は、手を出すなら挿入（女性は指）。攻めどうしは手を出さない。
   全員が攻めなら、はまって何かをされる人がいないので始めない */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('hole', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, hi = HK.HoleHost && HK.HoleHost.idx ? HK.HoleHost.idx(input) : -1;
    var A = C.filter(function (c) { return c.i !== hi; });
    if (!A.length) return [];
    if (A.every(T.top)) return [{ level: 'block', text: (A.length > 1 ? '全員が攻めなので、' : '攻めの住人だけなので、') + 'はまる役がいません。受けかリバ、おまかせの住人を1人以上入れてください（攻めの住人は、はまっても壁の向こうの手を追い払うので、何も起きません）' }];
    var cast = HK.HoleBehind && HK.HoleBehind.cast ? HK.HoleBehind.cast(input) : { si: 0, others: [] };
    var h = C[cast.si] || A[0], picked = T.pick(h.i, 'side') === 'stuck', out = [];
    var nv = P.npc ? P.npc(h) : '';
    if (T.top(h)) out.push({ level: 'warn', text: h.name + '（攻め）が' + (picked ? '' : 'おまかせで（一人目なので）') + 'はまる役です。攻めの住人ははまっても壁の向こうの手を追い払うので、挿入されず、感覚も溜まりません（壁の向こうの受けの住人が跨ることはあります）。いつもの流れにするなら、受けかリバの住人を役割「穴にはまる」にしてください' });
    else if (!P.isF(h) && P.hasM(h) && (nv ? nv === 'riba' : (P.of(h) === 'riba' || (P.of(h) === '' && h.gender === 'm')))) out.push({ level: 'warn', text: h.name + 'はリバかおまかせの男性なので、気質しだいで、壁の向こうから跨られる側になります（そのときは挿入されません）' });
    var B = (cast.others || []).map(function (i) { return C[i]; }).filter(Boolean);
    var bTop = B.filter(function (b) { return T.hard(b, h) && T.ok(b, h); }), bClash = B.filter(function (b) { return T.hard(b, h) && !T.ok(b, h); });
    if (bTop.length) out.push({ level: 'warn', text: '壁の向こうの攻めの住人（' + T.nm(bTop) + '）は、手を出すなら挿入する側です（女性なら指）' });
    if (bClash.length) out.push({ level: 'warn', text: T.nm(bClash) + 'と' + h.name + 'は' + (T.top(h) ? '攻めどうし' : '受け攻めか恋愛対象が合わない組') + 'なので、壁の向こうから手を出さず、助けるか立ち去るだけです' });
    return out;
  });
})();
