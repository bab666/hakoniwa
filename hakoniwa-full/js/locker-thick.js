/* 箱庭シミュレーター: 媚薬ロッカー（R18版のみ）― ロッカーを出たあとのベッドの山場を、段落に分けて厚くする
   solo-locker-bed.js の LK.bed を包み、そのあいだだけ前戯・挿入・体位・絶頂の文を、thick-sex.js（HK.ThickSex）の段落と差し替える。
   女性どうし・描写「ぼかす」・全年齢モードは、これまでどおり。リバ同士（途中で主導権が入れ替わりうる組）は、絶頂の文を差し替えない
   一段落版の前戯・体位の文（LK.BED.fore／pos）も候補に混ぜ、描写「ほどほど」では繋がる一文（LK.BED.insert）も使う */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, T = HK.ThickSex, ST = HK.Story;
  if (!LK || !LK.bed || !LK.BED || !T || !ST) return;
  function L(s) { return s.split('|'); }

  /* 前戯：ロッカーの中で焦らされた分を取り返す */
  var FORE = L('{a}は{b}の全身に唇を這わせた。ロッカーの中で触れられなかった場所を、一つ残らず。鎖骨、脇腹、腰のくぼみ――媚薬で敏感になった肌は、唇が触れるたびに小さく跳ねた。\n\n{a}「ロッカーの中じゃ、ここまで届かなかった」|{a}は{b}をベッドの縁に座らせ、脚のあいだに膝をついた。ロッカーの中で散々焦らされた熱は、触れる前から{b}の肌を震わせていた。\n\n{a}「……もう、こんなになってる」|{a}は{b}の指を一本ずつ口に含み、それから首筋へ、胸元へと唇を下ろしていった。狭い箱の中で溜め込んだ熱が、{b}の吐く息をひどく甘くしていた。');
  /* 体位を変えて、溜めた欲を吐き出す */
  var POS = L('狭いロッカーで溜めに溜めた欲は、一度では収まらなかった。{a}は{b}を抱え直し、角度を変えては、また奥を確かめた。\n\n{b}の喉から、媚薬に溶けた声が途切れ途切れに漏れる。|{a}は{b}を横向きに寝かせ、背中から抱きしめたまま深く繋がり直した。うなじに唇を押しつけながら、ゆっくり、深く揺らす。\n\n{b}の指が、シーツの上で{a}の手を探した。|{a}は{b}をうつ伏せにして、腰だけを高く上げさせた。媚薬の熱で赤く染まった背中に、汗が一筋流れていく。\n\n{a}「ロッカーの中で煽った分、全部返してもらう」');

  /* 女性の攻めが男性に跨るときの、体位を変える段落（「奥を確かめる」「繋がり直す」のような入れる側の言葉を使わない） */
  var POS_FM = L('{a}は{b}に跨ったまま向きを変え、背中を見せて腰を落とし直した。{b}の目の前で、{a}の腰がゆっくりと上下する。\n\n{b}の手が、たまらず{a}の腰を掴んだ。|{a}は{b}の胸に両手をついて上体を起こし、腰を前後にくねらせ始めた。狭いロッカーではできなかった動きだった。\n\n{a}「ずっと、こうしたかった」|{a}は{b}を横向きに寝かせて脚を絡め、自分から深く迎え入れ直した。汗ばんだ背中が、{b}の胸にぴたりと重なる。');
  var FM_BAD = /押し入|奥まで入れ|入れたまま|中に入れ|貫|突き上げ|突いた|深く突|注ぎ込/;
  var FM_SAFE = L('{a}は{b}の上で腰を沈めたまま、わざと動かずに{b}の顔を見下ろした。|{a}は{b}の胸に手をついて、少しずつ深さを変えながら腰を揺らした。|{a}は{b}の上で、締めつけては緩め、{b}が息を詰めるたびに腰の動きを止めた。');
  function para(arr, pre) { return arr.map(function (x) { return (pre ? '\n\n' : '') + x + '\n\n'; }); }

  var bed0 = LK.bed;
  LK.bed = function (S, o) {
    if (HK.SAFE_ON || !o || o.ff || o.lew === 'low') return bed0.apply(this, arguments);
    var x = o.x, y = o.y, B = LK.BED, rng = S.rng;
    var riba = HK.Pos ? !HK.Pos.fixed(x, y) : false;
    var fem = HK.Pos && HK.Pos.isF, fm = fem && fem(x) && !fem(y);
    var st = o.tone === 'rough' ? 'rough' : T.style(x);
    var hard = !fm && !riba && T.hard(rng, x, y);
    var g = T.fmGroup(st);
    var tk = o.tone === 'rough' || o.tone === 'sweet' ? o.tone : null;
    var save = { fore: B.fore, insert: B.insert, pos: B.pos, climax: B.climax, tone: tk ? B[tk] : null }, say0 = ST.say;
    /* 荒々しい攻めの回は、甘い／拘束する言い回しを挟まない（荒々しさは差し替えた挿入の段落で書く） */
    if (hard && tk) B[tk] = [''];
    /* 前戯・体位を変える段落には、厚い版の文に、一段落版（solo-locker-data／more.js の LK.BED）の文も候補として混ぜる */
    B.fore = para(FORE.concat(save.fore || []));
    /* 繋がる段落のあとに、感じていく段落（受けの快感・喘ぎ・ロッカーならではの一文）を添える */
    var pk = function (arr) { return rng.pick(arr); }, mode = fm ? 'fm' : 'mf';
    var feel = function () { return '\n\n' + pk(fm ? T.FEEL_FM : T.FEEL).replace('{mb}', T.moan(pk, y)) + '\n\n' + pk(T.PLACE.locker) + pk(T.FEEL_A[mode]) + T.react(pk, y); };
    /* 描写「ほどほど」では、一段落版の繋がる一文（男性が動く形）も候補に。「濃いめ」は厚い版だけ */
    var ins = (fm ? T.FM_BODY[g] : hard ? T.ROUGH_BODY : T.BODY[st] || T.BODY.gentle).concat(!fm && !hard && o.lew === 'mid' ? save.insert || [] : []);
    B.insert = ins.map(function (x) { return x + feel() + '\n\n'; });
    var oldPos = (save.pos || []).filter(function (l) { return !fm || !(FM_BAD.test(l) || /うつ伏せ|覆いかぶさ|繋がり|奥/.test(l)); });
    B.pos = para((fm ? POS_FM : POS).concat(oldPos), true);
    /* 絶頂の声は solo-locker-bed.js の o.moan が足すので、ここでは足さない */
    if (!riba) B.climax = para(fm ? T.FM_CLIMAX[g] : hard ? T.ROUGH_CLIMAX : T.CLIMAX[st] || T.CLIMAX.gentle, true);
    /* 段落の区切りを整える（末尾の改行・三つ以上の改行） */
    ST.say = function (S2, e) {
      if (e && typeof e.text === 'string') {
        /* 女性の攻めが男性の受けに「入れる」文（最中の展開の文）を、跨る書き方に差し替える */
        if (fm) e.text = e.text.split(/(?<=。)/).map(function (sen) {
          if (sen.indexOf(x.name + 'は') >= 0 && FM_BAD.test(sen)) return S.rng.pick(FM_SAFE).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name);
          /* 男性の受けの「中・奥」を言う文は、腰の跳ね方に */
          if (new RegExp(y.name + 'の(中|奥)').test(sen) && !/「/.test(sen)) return sen.replace(new RegExp(y.name + 'の(中|奥)が?[^。]*。'), y.name + 'の腰が、そのたびに小さく跳ねた。');
          return sen;
        }).join('');
        e.text = e.text.replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
      }
      return say0.apply(this, arguments);
    };
    try { return bed0.apply(this, arguments); }
    finally { B.fore = save.fore; B.insert = save.insert; B.pos = save.pos; B.climax = save.climax; if (tk) B[tk] = save.tone; ST.say = say0; }
  };
})();
