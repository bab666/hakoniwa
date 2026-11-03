/* 箱庭シミュレーター（R18版のみ）: 高度設定「出られない部屋の水の部屋：おもらしの展開」（2026-11-03 担当MU）
   全体の口調・喘ぎの設定（HK.Adv。ui-adv.js）に節を一つ足す。値は 'waterleak'：空（既定）＝する／'off'＝しない。
   保存に値が無ければ「する」。しないなら、水を飲む部屋で漏らす出来事（water_leak）とそれをきっかけにしたエッチ（water_leak_sex）を出さない
   （飲むときの段の細分化・トイレ探しはそのまま。読むのは room-water-r18.js の HK.RoomWater.leakOn）。
   出られない部屋のかたまりより先に読む（pack-lewd）ので、箱庭を選ぶ前から設定の画面に出る。全年齢モードでは足さない */
/* @event-ok 高度設定の節を足すだけ（出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Adv;
  if (!A || !A.add || HK.SAFE_ON) return;
  var OPT = [['', 'する（既定）'], ['off', 'しない']];
  function norm(v) { return String(v || '').trim() === 'off' ? 'off' : ''; }
  A.add({
    id: 'waterleak', title: '出られない部屋の水の部屋：おもらしの展開',
    desc: '条件「水を飲み切る」の部屋で、我慢の限界を超えた人が漏らしてしまう出来事と、それをきっかけにしたエッチ（最中に漏れる・潮吹き・温泉浣腸など）を出すかどうかです。' +
      '「しない」にすると、住人は限界の前に必ずトイレへ行きます（飲むときの様子とトイレ探しはそのまま出ます）。変えた値は次に箱庭を動かしたときから効きます。',
    html: function () {
      var cur = norm(A.get('waterleak'));
      return '<select data-f="adv" data-k="waterleak" aria-label="出られない部屋の水の部屋：おもらしの展開">' + OPT.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + A.esc(x[1]) + '</option>'; }).join('') + '</select>';
    },
    onInput: function (el) { A.set('waterleak', norm(el.value), true); },
    apply: function () { return { errors: [] }; }
  });
})();
