/* 看病の部屋の文（e：短期の目標・長期の目標と、結末の判定の一文。両方のビルド。2026-11-03 利用者の追加の指示）
   ■ HK.KanbyoText（T）
   ・GOAL_S[carer|patient][態度9種]・GOAL_SR[carer|patient][まとめ・feud]：短期の目標（この看病の間に何をしたいか）{ t: 文, k: 種 }
   ・GOAL_L[carer|patient][態度9種]・GOAL_LR[carer|patient][まとめ・feud]：長期の目標（看病を通して二人の先に何を望むか）
     種の意味（叶ったかの判定・行動の後押し・結末の点）は kanbyo.js の GS・GL
   ・GOAL_RES[ok 叶った|ng 叶わなかった][目標を持つ人の態度9種]：結末の段の一文（{a}＝目標を持つ人、{b}＝相手、{goal}＝短期の目標の文）
   ・GOAL_LRES[near 近づいた|same 変わらない|far 遠のいた]：長期の目標の一文（{a}＝目標を持つ人、{b}＝相手、{goal}＝長期の目標の文）
   台詞は書かない（目標の文は結果の画面にもそのまま出る）。登場人物はすべて成人として扱う */
/* @event-ok 短期・長期の目標と、結末に足す判定の一文（新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  function G(s) { return s.split('|').map(function (x) { var p = x.split('＃'); return { t: p[0], k: p[1] }; }); }
  var T = HK.KanbyoText = HK.KanbyoText || {};
  /* ---------- 短期の目標（この看病の間に） ---------- */
  T.GOAL_S = {
    carer: {
      proud: G('一度も失敗せずに看病しきる＃noshippai|段取りどおりに治してみせる＃tekipaki|弱音を吐かせてやる＃yowane'),
      stern: G('段取りどおりに治させる＃tekipaki|無理だけはさせない＃mamoru|一度も失敗せずに看る＃noshippai'),
      tsun: G('心配していると顔に出さない＃kakusu|仕方なく、でも最後まで看る＃sobani|弱音を聞き出してからかう＃yowane'),
      gentle: G('そばを離れずに看る＃sobani|とことん甘やかす＃amayakasu|無理だけはさせない＃mamoru'),
      devoted: G('とことん甘やかす＃amayakasu|そばを離れずに看る＃sobani|一度も失敗せずに看る＃noshippai'),
      cool: G('心配を顔に出さない＃kakusu|段取りどおりに治させる＃tekipaki|本当の具合を聞き出す＃yowane'),
      free: G('看病を楽しい時間にする＃amayakasu|弱音を聞き出す＃yowane|そばで退屈させない＃sobani'),
      shy: G('一度も失敗せずに看る＃noshippai|そっとそばにいる＃sobani|無理をさせない＃mamoru'),
      polite: G('礼を尽くして、一度も失敗せずに看る＃noshippai|無理だけはさせない＃mamoru|そばを離れずに看る＃sobani')
    },
    patient: {
      proud: G('弱っているところを見せない＃misenai|借りを作らずに治る＃karinashi|一日でも早く治す＃hayaku'),
      stern: G('心配をかけない＃meiwaku|一日でも早く治す＃hayaku|弱音を吐かない＃misenai'),
      tsun: G('看病なんていらないと言い張る＃misenai|本当はそばにいてもらう＃sobanite|弱音だけは吐かない＃misenai'),
      gentle: G('心配をかけない＃meiwaku|ちゃんとお礼を言う＃orei|今日くらいは甘える＃amaetai'),
      devoted: G('迷惑をかけない＃meiwaku|手間をかけるたびに謝る＃meiwaku|ちゃんとお礼を言う＃orei'),
      cool: G('自分で治せるところは自分で治す＃karinashi|心配をかけない＃meiwaku|一日でも早く治す＃hayaku'),
      free: G('ここぞとばかりに甘える＃amaetai|話し相手になってもらう＃sobanite|一日でも早く治して遊びに行く＃hayaku'),
      shy: G('そばにいてもらう＃sobanite|迷惑だと思われない＃meiwaku|ちゃんとお礼を言う＃orei'),
      polite: G('礼を欠かさない＃orei|手を煩わせない＃meiwaku|一日でも早く治す＃hayaku')
    }
  };
  T.GOAL_SR = {
    carer: {
      love: G('恋人の弱音を聞き出す＃yowane|恋人をとことん甘やかす＃amayakasu'),
      pine: G('看病を口実に、そばを離れない＃sobani|気持ちがばれないように看る＃kakusu'),
      fam: G('昔のように看てやる＃sobani|家族として、無理をさせない＃mamoru'),
      feud: G('文句を言いながらも最後まで看る＃sobani|弱っているところを見届けて、からかう＃yowane'),
      work: G('段取りよく治して、早く職場に戻す＃tekipaki|仕事のことは忘れさせる＃mamoru'),
      close: G('友人として、そばにいる＃sobani|笑わせて元気にする＃amayakasu'),
      awk: G('できる範囲で、失敗せずに手を貸す＃noshippai|困っているあいだだけは見捨てない＃sobani')
    },
    patient: {
      love: G('恋人に、ここぞとばかりに甘える＃amaetai|恋人にだけは弱いところを見せない＃misenai'),
      pine: G('看病されて、気持ちがばれないようにする＃misenai|この時間を少しでも長くそばにいてもらう＃sobanite'),
      fam: G('家族に心配をかけない＃meiwaku|子どもの頃のように甘える＃amaetai'),
      feud: G('あの人に借りを作らずに治る＃karinashi|あの人の前でだけは弱音を吐かない＃misenai'),
      work: G('早く治して職場に戻る＃hayaku|世話をかけすぎない＃meiwaku'),
      close: G('友人にちゃんとお礼を言う＃orei|治るまで話し相手になってもらう＃sobanite'),
      awk: G('あまり手を煩わせない＃meiwaku|早く治る＃hayaku')
    }
  };
  /* ---------- 長期の目標（看病を通して二人の先に） ---------- */
  T.GOAL_L = {
    carer: {
      proud: G('普段の借りを返して対等になる＃taitou|頼られる側でい続ける＃tayorare|これからも隣に立つ＃mamoru_l'),
      stern: G('無理をしない暮らしを覚えさせる＃mamoru_l|信頼される相手でいる＃tayorare|貸し借りなしの関係でいる＃taitou'),
      tsun: G('貸しを一つ作っておく＃kashi|この距離のままでいる＃konomama|本当は、もう少し近くにいたい＃chikaku'),
      gentle: G('これからも支え合っていく＃mamoru_l|もっと近くにいたい＃chikaku|いつもの恩を返す＃ongaeshi'),
      devoted: G('普段の恩返しをする＃ongaeshi|もっと頼られる人になる＃tayorare|ずっとそばで支える＃mamoru_l'),
      cool: G('頼られる相手であり続ける＃tayorare|この距離のままでいる＃konomama|貸し借りなしでいる＃taitou'),
      free: G('治ったら、もっと一緒に遊ぶ＃chikaku|治ったら伝えたいことを伝える＃tsutaetai|この先も笑っていられる二人でいる＃konomama'),
      shy: G('治ったら、ちゃんと気持ちを伝える＃tsutaetai|今度こそ支える側になる＃tayorare|もう少しだけ近づく＃chikaku'),
      polite: G('恩を返し、信頼を深める＃ongaeshi|これからも誠実に支える＃mamoru_l|この関係を大切に保つ＃konomama')
    },
    patient: {
      proud: G('借りを返して対等になる＃taitou|頼れる人だと認める＃kawaritai|この距離のままでいる＃konomama'),
      stern: G('世話になった分を必ず返す＃orei_l|借りを返して対等になる＃taitou|この関係を崩さない＃konomama'),
      tsun: G('本当は、もっと近くにいたい＃chikaku|借りを返して対等になる＃taitou|治ったら、少しは素直になる＃kawaritai'),
      gentle: G('治ったら、気持ちを伝える＃tsutaetai|恩を返していく＃orei_l|もっと近くにいたい＃chikaku'),
      devoted: G('治ったら、今度は自分が尽くす＃orei_l|もっと近くにいたい＃chikaku|ずっとそばにいる＃konomama'),
      cool: G('借りを返して対等になる＃taitou|頼ることを覚える＃kawaritai|この距離のままでいる＃konomama'),
      free: G('治ったら、もっと一緒に出かける＃chikaku|治ったら、伝えたいことを伝える＃tsutaetai|恩はいつか返す＃orei_l'),
      shy: G('治ったら、ちゃんと気持ちを伝える＃tsutaetai|もう少しだけ近づく＃chikaku|頼れるようになる＃kawaritai'),
      polite: G('受けた恩を返していく＃orei_l|この関係を大切に保つ＃konomama|対等な相手でいる＃taitou')
    }
  };
  T.GOAL_LR = {
    carer: {
      love: G('恋人として、もっと頼られる＃tayorare|これからも隣で支え続ける＃mamoru_l'),
      pine: G('治ったら、気持ちを伝える＃tsutaetai|この看病を、二人の距離を縮めるきっかけにする＃chikaku'),
      fam: G('家族として、いつもの恩を返す＃ongaeshi|これからも家族として支える＃mamoru_l'),
      feud: G('貸しを一つ作って、次の言い合いで使う＃kashi|いがみ合う距離のままでいる＃konomama'),
      work: G('職場でも、もっと頼られる＃tayorare|貸し借りなしの仲間でいる＃taitou'),
      close: G('友人として、この先も支え合う＃mamoru_l|もう少しだけ近づく＃chikaku'),
      awk: G('少しだけ距離を縮める＃chikaku|このままの距離を保つ＃konomama')
    },
    patient: {
      love: G('恋人に、治ったら恩返しをする＃orei_l|もっと素直に頼れるようになる＃kawaritai'),
      pine: G('治ったら、この気持ちを伝える＃tsutaetai|この距離のままでいる＃konomama'),
      fam: G('家族に、いつかちゃんと恩を返す＃orei_l|家族にもっと頼れるようになる＃kawaritai'),
      feud: G('借りを返して、また対等にやり合う＃taitou|いがみ合う距離のままでいる＃konomama'),
      work: G('職場で、世話になった分を返す＃orei_l|貸し借りなしの仲間でいる＃taitou'),
      close: G('友人に、治ったら恩を返す＃orei_l|もう少しだけ近づく＃chikaku'),
      awk: G('少しだけ距離を縮める＃chikaku|このままの距離を保つ＃konomama')
    }
  };
  /* ---------- 結末の判定の一文 ---------- */
  T.GOAL_RES = {
    ok: {
      proud: L('「＠＠{goal}」――{a}はその目標を果たして、少し得意げな顔をしていた。|{a}は「＠＠{goal}」という目標を、言葉どおりにやり遂げた。'),
      stern: L('{a}は「＠＠{goal}」という目標を、きちんと果たした。|「＠＠{goal}」――{a}は、決めたことを最後まで守り通した。'),
      tsun: L('「＠＠{goal}」――{a}は口には出さないが、その目標を果たしていた。|{a}は「＠＠{goal}」という目標を果たして、こっそり胸をなで下ろした。'),
      gentle: L('「＠＠{goal}」――{a}のその願いは、ちゃんと叶っていた。|{a}は「＠＠{goal}」という目標が叶って、やわらかく笑った。'),
      devoted: L('{a}は「＠＠{goal}」という目標を果たせて、心からほっとしていた。|「＠＠{goal}」――{a}のその願いは、叶っていた。'),
      cool: L('{a}は「＠＠{goal}」という目標を、計画どおりに果たした。|「＠＠{goal}」――{a}は、その目標を淡々とやり遂げた。'),
      free: L('「＠＠{goal}」――{a}はその目標を果たして、上機嫌だった。|{a}は「＠＠{goal}」という目標を、見事にやってのけた。'),
      shy: L('{a}は「＠＠{goal}」という目標を、小さく、でも確かに果たしていた。|「＠＠{goal}」――{a}のひそかな目標は、叶っていた。'),
      polite: L('{a}は「＠＠{goal}」という目標を、丁寧に果たした。|「＠＠{goal}」――{a}は、その目標を最後まで守り通した。')
    },
    ng: {
      proud: L('「＠＠{goal}」――{a}のその目標は、結局叶わなかった。{a}は悔しそうに鼻を鳴らした。|{a}は「＠＠{goal}」と決めていたのに、そうはいかなかった。'),
      stern: L('{a}は「＠＠{goal}」という目標を果たせなかった。それでも、言い訳はしなかった。|「＠＠{goal}」――{a}の決めたことは、思いどおりにはいかなかった。'),
      tsun: L('「＠＠{goal}」――{a}のその目標は、あっけなく崩れていた。{a}はそれを、なかったことにした。|{a}は「＠＠{goal}」と決めていたのに、結局できなかった。'),
      gentle: L('「＠＠{goal}」――{a}のその願いは叶わなかったが、{a}はそれでもいいと思えた。|{a}は「＠＠{goal}」という目標を果たせなかった。けれど、悪くない数日だった。'),
      devoted: L('{a}は「＠＠{goal}」という目標を果たせなかったことを、少し気にしていた。|「＠＠{goal}」――{a}のその願いは、叶わないままだった。'),
      cool: L('{a}は「＠＠{goal}」という目標を果たせなかった。想定外のことが多すぎた。|「＠＠{goal}」――{a}の計画は、途中で崩れていた。'),
      free: L('「＠＠{goal}」――{a}のその目標は叶わなかったが、{a}はけろりと笑っていた。|{a}は「＠＠{goal}」と言っていたが、結局そうはならなかった。'),
      shy: L('{a}は「＠＠{goal}」という目標を、結局果たせなかった。それでも、{b}のそばにはいられた。|「＠＠{goal}」――{a}のひそかな目標は、叶わないままだった。'),
      polite: L('{a}は「＠＠{goal}」という目標を果たせなかったことを、静かに受け止めた。|「＠＠{goal}」――{a}の目標は、思うようには叶わなかった。')
    }
  };
  T.GOAL_LRES = {
    near: L('「＠＠{goal}」――{a}の望む先に、二人は少し近づいていた。|看病の数日で、{a}の「＠＠{goal}」という願いは、確かに一歩前に進んでいた。|{a}は、「＠＠{goal}」という願いが遠くないことを感じていた。'),
    same: L('「＠＠{goal}」――{a}の望む先は、まだ遠いままだった。|{a}の「＠＠{goal}」という願いは、看病の前と変わらない場所にあった。|「＠＠{goal}」――{a}は、その願いを胸にしまったままだった。'),
    far: L('「＠＠{goal}」――{a}の望んでいた形からは、少し離れてしまった。|{a}の「＠＠{goal}」という願いは、看病の数日で、かえって遠のいていた。|思っていたのとは違う形で、{a}の「＠＠{goal}」という願いは遠ざかった。')
  };
})();
