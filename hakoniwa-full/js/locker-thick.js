/* 箱庭シミュレーター: 媚薬ロッカー（R18版のみ）― ロッカーを出たあとのベッドの山場を、段落に分けて厚くする
   solo-locker-bed.js の LK.bed を包み、そのあいだだけ前戯・挿入・体位・絶頂の文を、thick-sex.js（HK.ThickSex）の段落と差し替える。
   女性どうし・描写「ぼかす」・全年齢モードは、これまでどおり。リバ同士（途中で主導権が入れ替わりうる組）は、絶頂の文を差し替えない
   一段落版の前戯・体位の文（LK.BED.fore／pos）も候補に混ぜ、描写「ほどほど」では繋がる一文（LK.BED.insert）も使う
   性器なしの人がいる組（pos-nogen.js）は一段落版のまま（2026-10-26） */
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

  /* 描写の作風「男性向け」：ロッカーの中で相手が応じた行為（3＝口、4＝繋がる）に足す段落。{a}＝攻め {b}＝受け（{mb1}{mb2}＝受けの声） */
  LK.ERO_ACT = {
    3: L('狭いロッカーの中で、{a}は{b}の脚のあいだに顔を埋めた。{s:suck}。{b}「{mb1}」――逃げ場のない暗闇で、音だけがやけに大きく響いた。|{a}は{b}の下着の中に手を滑り込ませ、とろとろになったところを指でかき回した。{s:wet}。{b}「{mb1}」――媚薬のせいで、触れられたそばから腰が勝手に揺れた。|{s:suck}。{b}「{mb2}」――{b}は{a}の口の中で、びくびくと震えながら果てた。'),
    4: L('{a}は{b}をロッカーの壁に押しつけたまま、奥まで繋がった。{s:hit}。{b}「{mb1}」――狭くて動けないぶん、一突きごとが深く奥に響いた。|媚薬で敏感になった{b}の{ナカ}は、{a}を咥え込んで離さなかった。{s:wet}。{b}「{mb2}」――{b}は扉に額を押しつけたまま、びくびくとイった。|{s:hit}。{b}「{mb2}」――ロッカーががたがたと揺れるのも構わず、二人は腰をぶつけ合った。')
  };
  /* 女性の攻め×男性の受けの「繋がる」（4）：{a}＝女性の攻めが跨る・自分で導く（{a} を入れる側にしない）。{mb1}{mb2}＝男性の受けの声 */
  LK.ERO_ACT_FM = {
    4: L('{a}は{b}をロッカーの壁に押しつけたまま、膝の上で深く腰を沈め直した。狭くて大きくは動けないぶん、一度沈むごとに奥まで響く。{s:wet}。{b}「{mb1}」――逃げ場のない暗闇で、{b}は{a}にしがみつくことしかできなかった。|' +
      '媚薬でとろとろになった{a}の{ナカ}が、{b}を根元まで咥え込んで離さなかった。{a}が小刻みに腰を揺らすたび、ロッカーががたがたと鳴る。{s:wet}。{b}「{mb2}」――{b}は扉に後頭部を押しつけたまま、{a}の中でびくびくと果てた。|' +
      '{a}は{b}の首に腕を回し、片脚を{b}の腰に絡めたまま、小刻みに腰を揺らした。狭くて大きくは動けないぶん、{a}は締めつけだけで{b}を追い詰めていく。{s:wet}。{b}「{mb2}」――{b}が果てても、{a}は腰を上げなかった。')
  };
  /* 男性の受けへの「口」（3）：{a} が {b} のものを咥える（{a} はどちらの性別でもよい） */
  LK.ERO_ACT_MB = {
    3: L('狭いロッカーの中で、{a}は{b}の脚のあいだに膝をつき、張りつめたものを根元まで咥え込んだ。{s:suck}。{b}「{mb1}」――逃げ場のない暗闇で、濡れた音だけがやけに大きく響いた。|' +
      '{a}は{b}の下着をずり下ろし、熱くなったものに舌を這わせた。先端を吸い上げるたびに、{b}の腰が壁から浮く。{s:suck}。{b}「{mb1}」――媚薬のせいで、触れられたそばから限界が近づいていった。|' +
      '{a}は喉の奥まで深く咥え、ゆっくりと引いては、また呑み込んだ。{b}は声を殺そうとして、ロッカーの天井に頭をぶつけた。{s:suck}。{b}「{mb2}」――{b}は{a}の口の中で、びくびくと震えながら果てた。')
  };
  /* 女性どうしの「繋がる」（4）：指と肌で */
  LK.ERO_ACT_FF = {
    4: L('{a}は{b}をロッカーの壁に押しつけたまま、指を二本、奥まで沈めた。{s:wet}。{b}「{mb1}」――狭くて逃げられないぶん、弱いところを何度も擦られた。|媚薬で敏感になった{b}の{ナカ}は、{a}の指をきゅうきゅうと締めつけて離さなかった。{s:wet}。{b}「{mb2}」――{b}は扉に額を押しつけたまま、びくびくとイった。|{a}は{b}の脚のあいだに太腿を割り込ませ、濡れたところを擦り上げた。{s:wet}。{b}「{mb2}」')
  };
  /* 扉が開いたあとの夜（男性向け）：最中の段落に男性向けの最中を、絶頂の段落の頭に男性向けの果てる段を足す（thick-sex-ero.js の文） */
  function eroBed(S, o, run) {
    var TE = HK.ThickEro, x = o.x, y = o.y, mode = TE.mode(x, y), g = TE.group(T.style(x), mode), pk = function (a) { return LK.pick(S, a); }, n = 0, say1 = ST.say;
    var nm = function (t) { return TE.fill(S, t, x, y).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name); };
    ST.say = function (S2, e) {
      if (e && typeof e.text === 'string' && e.tag !== 'ベッドへ') {
        n++;
        var sep = /\n\n/.test(e.text) ? '\n\n' : '';
        if (n === 1) e.text += sep + nm(pk(mode === 'ff' ? TE.FF_BODY[g] : mode === 'fm' ? TE.FM_BODY[g] : TE.BODY[g])) + sep + nm(pk(TE.FEEL[mode]));
        else if (n === 2) e.text = nm(pk(mode === 'ff' ? TE.FF_CLIMAX[g] : mode === 'fm' ? TE.FM_CLIMAX[g] : TE.CLIMAX[g])) + sep + e.text;
      }
      return say1.apply(this, arguments);
    };
    try { return run(); } finally { ST.say = say1; }
  }
  var bed0 = LK.bed;
  LK.bed = function (S, o) {
    var self = this, args = arguments;
    if (o && o.ero && !HK.SAFE_ON && o.lew !== 'low' && HK.ThickEro) { var o2 = Object.assign({}, o, { ero: false }); return eroBed(S, o2, function () { return LK.bed.call(self, S, o2); }); }
    /* 描写の長さ「数行で短く」（混ぜるなら半分）：一段落版（solo-locker-bed.js） */
    /* 性器なしの人がいる組（pos-nogen.js）も一段落版に（厚い段落の「根元」「奥」などの文を使わない。一段落版は HK.NoGen.review が見直す） */
    if (HK.SAFE_ON || !o || o.ff || o.lew === 'low' || o.short || (HK.NoGen && HK.NoGen.on && HK.NoGen.on(o.x, o.y))) return bed0.apply(this, arguments);
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
    /* 一回の結果の中で同じ文を繰り返さない（LK.pick：使い切ったら、いちばん前に使ったものから） */
    var pk = function (arr) { return LK.pick(S, arr); }, mode = fm ? 'fm' : 'mf';
    var feel = function () { return '\n\n' + pk(fm ? T.FEEL_FM : T.FEEL).replace('{mb}', T.moan(pk, y, false, S)) + '\n\n' + pk(T.PLACE.locker) + pk(T.FEEL_A[mode]) + T.react(pk, y); };
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
    /* solo-locker-bed.js に、厚い段落へ差し替えたことを知らせる（女性の攻めの一段落版を使わない。絶頂はリバ同士なら差し替えていない） */
    o.thick = { climax: !riba };
    try { return bed0.apply(this, arguments); }
    finally { B.fore = save.fore; B.insert = save.insert; B.pos = save.pos; B.climax = save.climax; if (tk) B[tk] = save.tone; ST.say = say0; }
  };
})();
