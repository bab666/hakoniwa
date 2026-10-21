/* 箱庭診断: 「ふたりのエゴグラム」と同じ25問でエゴグラムを診断し、住人として登録する
   1問 はい2・どちらとも1・いいえ0点、因子ごとに5問（0〜10点）→ 箱庭の20点満点に換算（×2） */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var Q = [
    [0, '時間や約束、ルールはきちんと守るほうだ'],
    [1, '困っている人を見ると、放っておけない'],
    [2, '何かを決めるときは、情報を集めて比べてから決める'],
    [3, 'うれしいことがあると、素直に声に出して喜ぶ'],
    [4, '相手の顔色をうかがってしまうことが多い'],
    [0, '人の間違いやだらしなさが気になって、つい指摘したくなる'],
    [1, '相手の話を、途中でさえぎらずに最後まで聞ける'],
    [2, 'カッとなっても、わりとすぐに冷静さを取り戻せる'],
    [3, '欲しいもの・やりたいことを、はっきり口に出せる'],
    [4, '言いたいことがあっても、つい飲み込んでしまう'],
    [0, '「〜すべき」「〜しなきゃ」と考えることが多い'],
    [1, '誰かの世話をしたり、面倒を見たりするのが好きだ'],
    [2, '物事の理由や仕組みを考えるのが好きだ'],
    [3, '思いつきで、すぐ行動に移すことがある'],
    [4, '頼まれごとを断るのが苦手だ'],
    [0, '周りから「しっかりしている」「責任感がある」と言われる'],
    [1, '相手の良いところを見つけて、言葉にして褒めるほうだ'],
    [2, '出かける前に、予定や段取りを立てておきたい'],
    [3, '冗談を言ったり、ふざけたりするのが好きだ'],
    [4, '人にどう思われているかが、とても気になる'],
    [0, '自分の意見は、はっきり言い切るほうだ'],
    [1, '多少の失敗なら、笑って許してあげられる'],
    [2, '人の話を「事実」と「その人の気持ち」に分けて聞ける'],
    [3, '新しいお店や流行りものに、すぐ飛びつく'],
    [4, '「自分さえ我慢すれば丸く収まる」と思うことがある']
  ];
  var ANS = [['はい', 2], ['どちらとも', 1], ['いいえ', 0]];
  var Z = { open: false, name: '', i: 0, ans: [], target: '' };
  var EQ = HK.EgoQuiz = {};

  function host() {
    var m = document.getElementById('eqmodal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'eqmodal'; m.className = 'modal'; m.hidden = true;
      m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="eqtitle"><div id="eqbody"></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) { if (e.target === m) EQ.close(); });
    }
    return m;
  }
  EQ.result = function () {
    var eg = {}, sum = [0, 0, 0, 0, 0];
    Z.ans.forEach(function (v, i) { sum[Q[i][0]] += v; });
    HK.FACTORS.forEach(function (k, j) { eg[k] = sum[j] * 2; });
    return eg;
  };
  function draw() {
    var b = document.getElementById('eqbody');
    if (Z.i < 0) {
      var opts = HK.EgoQuiz.chars().map(function (c) { return '<option value="' + c.id + '"' + (Z.target === c.id ? ' selected' : '') + '>' + esc(c.name) + 'を書き換える</option>'; }).join('');
      b.innerHTML = '<h2 class="sec" id="eqtitle">質問に答えてエゴグラムを出す</h2>' +
        '<p class="hint">「<a href="https://kaimin.sakura.ne.jp/archive/tools/ego/" target="_blank" rel="noopener">ふたりのエゴグラム</a>」と同じ25問です。直感で「はい／どちらとも／いいえ」を選んでください。出た5文字コードは、<a href="https://kaimin.sakura.ne.jp/archive/tools/ego/" target="_blank" rel="noopener">ふたりのエゴグラム</a>の相性診断でもそのまま使えます。</p>' +
        '<label class="eqlab" for="eqname">名前（キャラクター名でもOK）</label><input type="text" id="eqname" maxlength="24" value="' + esc(Z.name) + '" placeholder="例：ミナト" autocomplete="off">' +
        '<label class="eqlab" for="eqtarget">結果の登録先</label><select id="eqtarget"><option value="">新しい住人として追加</option>' + opts + '</select>' +
        '<div class="row" style="margin-top:14px"><button class="btn ghost" data-eq="close">やめる</button><span class="spacer"></span><button class="btn primary" data-eq="start">25問に答える</button></div>';
      setTimeout(function () { var n = document.getElementById('eqname'); if (n) n.focus(); }, 0);
      return;
    }
    if (Z.i >= Q.length) {
      var eg = EQ.result(), code = HK.toCode(eg), ty = HK.egoType(eg);
      b.innerHTML = '<h2 class="sec" id="eqtitle">' + esc(Z.name || '名無し') + 'のエゴグラム</h2>' +
        '<p class="eqcode num">' + code + '</p><p class="hint" style="text-align:center">' + esc(ty.label) + '</p>' +
        '<div class="eqbars">' + HK.FACTORS.map(function (k) { return '<div><span>' + k + '</span><i style="width:' + (eg[k] * 5) + '%"></i><b class="num">' + eg[k] + '</b></div>'; }).join('') + '</div>' +
        '<p class="hint">点数は20点満点（25問の回答を箱庭用に換算）。</p>' +
        '<div class="row" style="margin-top:6px"><button class="btn" data-eq="png">画像で保存</button><button class="btn" data-eq="x">𝕏 に投稿</button><span class="eqmsg hint" id="eqmsg" role="status" style="margin:0"></span></div>' +
        '<div class="row" style="margin-top:14px"><button class="btn ghost" data-eq="back">ひとつ戻る</button><span class="spacer"></span><button class="btn primary" data-eq="save">' + (Z.target ? '住人を書き換える' : '住人に追加する') + '</button></div>';
      return;
    }
    var q = Q[Z.i];
    b.innerHTML = '<div class="eqmeta"><span class="num">' + (Z.i + 1) + ' / ' + Q.length + '</span><span>' + esc(Z.name || '') + '</span></div>' +
      '<div class="eqprog"><i style="width:' + (Z.i / Q.length * 100) + '%"></i></div>' +
      '<p class="eqq" id="eqtitle">' + esc(q[1]) + '</p>' +
      '<div class="eqans">' + ANS.map(function (a) { return '<button class="btn' + (Z.ans[Z.i] === a[1] ? ' on' : '') + '" data-eq="ans" data-v="' + a[1] + '">' + a[0] + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:14px"><button class="btn ghost" data-eq="back">ひとつ戻る</button><span class="spacer"></span><button class="btn ghost" data-eq="close">中断する</button></div>';
    var f = b.querySelector('.eqans .btn'); if (f) f.focus();
  }
  EQ.chars = function () { return []; };
  EQ.onSave = function () {};
  EQ.open = function (target) {
    Z = { open: true, name: '', i: -1, ans: [], target: target || '' };
    if (target) { var c = EQ.chars().filter(function (x) { return x.id === target; })[0]; if (c) Z.name = c.name; }
    host().hidden = false; draw();
  };
  EQ.close = function () { Z.open = false; host().hidden = true; };
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-eq]');
    if (!t) return;
    var a = t.dataset.eq;
    if (a === 'close') EQ.close();
    else if (a === 'start') {
      Z.name = (document.getElementById('eqname').value || '').trim().slice(0, 24);
      Z.target = document.getElementById('eqtarget').value;
      if (Z.target && !Z.name) { var c = EQ.chars().filter(function (x) { return x.id === Z.target; })[0]; if (c) Z.name = c.name; }
      Z.i = 0; draw();
    }
    else if (a === 'ans') { Z.ans[Z.i] = +t.dataset.v; Z.i++; draw(); }
    else if (a === 'back') { Z.i = Math.max(-1, Z.i - 1); draw(); }
    else if (a === 'save') { EQ.onSave({ name: Z.name || '名無し', eg: EQ.result(), target: Z.target }); EQ.close(); }
    else if (a === 'png' && HK.Share) HK.Share.savePersonal(Z.name || '名無し', EQ.result(), document.getElementById('eqmsg'));
    else if (a === 'x' && HK.Share) HK.Share.postPersonal(Z.name || '名無し', EQ.result(), document.getElementById('eqmsg'));
  });
  document.addEventListener('keydown', function (ev) {
    if (!Z.open) return;
    if (ev.key === 'Escape') { EQ.close(); return; }
    if (Z.i >= 0 && Z.i < Q.length && /^[123]$/.test(ev.key) && !(ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName))) {
      Z.ans[Z.i] = ANS[+ev.key - 1][1]; Z.i++; draw();
    }
  });
})();
