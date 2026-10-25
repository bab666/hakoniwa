/* 箱庭シミュレーター（R18版のみ）: 高度設定の「喘ぎの辞書」の欄（moan-engine.js の HK.Moan を ui-adv.js の節として登録） */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Adv, M = HK && HK.Moan;
  if (!A || !M || HK.SAFE_ON) return;
  var esc = A.esc;
  function keyList() {
    return M.keys().map(function (k) { return k.key + ' ' + k.label; }).join('　');
  }
  A.add({
    id: 'moan', title: '喘ぎの辞書（男性向けの作風）', rows: 10,
    desc: '言葉のない喘ぎ（短い声・吐息・鼻声・リズム）は全口調で使い回しています。気に入らなければ、場面と段階ごとに書き換えられます。\n' +
      '[喘ぎ 共通 乗り気 1] の下に1行1つ（「|」区切りでも可）。見出しの末尾に「追加」を付けると、置き換えずに足します。\n' +
      '範囲：共通／口調=ギャル（口調名か鍵）／態度=強気（言葉のある喘ぎの基盤）／住人=名前（その住人だけ。いちばん優先）\n' +
      '場面と段階：乗り気 1短い喘ぎ 2感じ始め 3理性崩壊 4限界の拒絶／嫌がる 1拒絶 2控えめな感じ始め 3甘くなり始め 4理性崩壊 5大きい喘ぎ／声を抑える 1ほぼ吐息 2漏れつつある 3漏れ喘ぎまくる／' +
      '激しく 1素直 2拒絶が混ざる（空なら部品から組みます）／懇願 1もっと 2部位（{p}＝相手の性器の呼び方） 3焦らすな／キス／口でしている／口でされる 1乗り気 2嫌がる／攻め 1吐息 2声を我慢 3口でされて漏れる 4かわいいと言う 5もう限界 6謝りながら\n' +
      '言葉のある喘ぎは態度の基盤をその人の口調で言い換えて出すので、口調ごとの言い回しは「口調の辞書」側で変えられます。',
    placeholder: '[喘ぎ 共通 乗り気 1]\nにゃ……っ|にゃあ……っ\n[喘ぎ 口調=ギャル 嫌がる 1]\nマジ無理、やめて……っ！\n[喘ぎ 住人=アキラ 懇願 1]\nもっと……おねがい……♡',
    apply: function (text) { return M.setUser(text); },
    extra: function () {
      return '<div class="row" style="margin-top:4px;flex-wrap:wrap;gap:6px"><label>見本 <select id="adv-moan-key">' + M.keys().map(function (k) { return '<option value="' + k.key + '">' + esc(k.label) + '</option>'; }).join('') + '</select></label>' +
        '<label>態度 <select id="adv-moan-ps">' + (HK.PERSONA_KEYS || []).map(function (k) { return '<option value="' + k + '">' + esc(HK.PERSONA[k].label) + '</option>'; }).join('') + '</select></label>' +
        '<button type="button" class="mini" data-act="adv:moan-demo">出してみる</button></div><div class="desc" id="adv-moan-demo" style="font-size:12px;white-space:pre-wrap"></div>';
    },
    onAct: function (act) {
      if (act !== 'adv:moan-demo') return;
      var el = document.getElementById('adv-moan-demo'), k = document.getElementById('adv-moan-key'), p = document.getElementById('adv-moan-ps');
      if (!el || !k) return;
      el.textContent = M.demo(k.value, p ? p.value : 'gentle', p ? p.value : 'gentle', 5).map(function (x) { return '「' + x + '」'; }).join('\n');
    }
  });
})();
