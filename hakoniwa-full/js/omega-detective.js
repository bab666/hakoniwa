/* 箱庭シミュレーター: オメガバース ― 探偵と助手（バディ）
   探偵と探偵助手がそろうとバディになり、殺人事件を一緒に追う。事件は 依頼→現場→聞き込み→危機→推理→余韻 の順に進む
   {a}=探偵 {b}=助手 */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA;
  var D = OM.DET = {};
  function L(s) { return s.split('|'); }
  function isDet(c) { return c.om.job === 'pi'; }
  function isAsst(c) { return c.om.job === 'assistant'; }
  D.buddy = function (a, b) { return (isDet(a) && isAsst(b)) || (isAsst(a) && isDet(b)); };
  /* 関係が「バディ」で、どちらかが探偵・刑事・警察官・探偵助手なら、事件を一緒に追う */
  function sleuth(c) { return isDet(c) || isAsst(c) || c.om.job === 'detective' || c.om.job === 'police'; }
  D.buddyCtx = function (ctx, a, b) {
    if (D.buddy(a, b)) return true;
    var t = HK.Ties && HK.Ties.get(ctx, a, b);
    return !!(t && t.type === 'buddy' && (sleuth(a) || sleuth(b)));
  };
  D.order = function (a, b) {
    var r = function (c) { return isDet(c) ? 3 : c.om.job === 'detective' ? 2 : c.om.job === 'police' ? 1 : 0; };
    return r(a) >= r(b) ? [a, b] : [b, a];
  };

  var PLACE = L('高級ホテルのスイートルーム|閉館後の美術館|港の倉庫街|老舗旅館の離れ|会員制のαクラブ|Ω専用シェルターの屋上|雪に閉ざされた山荘|深夜の大学病院');
  var VICTIM = L('製薬会社の社長|抑制剤の研究者|有名なαの俳優|番を持たないΩの資産家|β専門の結婚相談所の所長|地方議員|フェロモン香水の調香師|元・刑事');
  var MOTIVE = L('番を奪われた恨み|偽造抑制剤の利権|運命の番をめぐる嫉妬|第二性を偽っていた秘密|スイッチを隠していた過去|遺産と番契約|Ωへの差別への復讐|十年前の未解決事件');
  var CULPRIT = L('被害者の番|第一発見者の秘書|穏やかな顔をした主治医|被害者の運命の番|口数の少ないバーテンダー|被害者の双子のきょうだい|事件を通報した隣人|捜査の初日から協力的だった刑事');
  var TRICK = L('香水で消されたフェロモンの痕跡|抑制剤の空き瓶の数の違い|うなじの噛み跡の向き|発情期の周期表に書き足された一行|αにしか届かない高さの指紋|βには分からないはずの匂いの記述|時計の止まった時刻と、雨が止んだ時刻のずれ');

  var ST = [
    { n: '依頼', t: L('「{place}で、{victim}が死体で見つかった」――警察からの電話を切った{a}が振り返ると、{b}はもうコートを手にしていた。|事務所の扉を叩いたのは、{victim}の家族だった。「警察は自殺だと言うんです」――{a}と{b}は顔を見合わせた。|新聞の片隅に、{place}での{victim}の死が小さく載っていた。{a}は記事を指で叩いた。「{b}、これは殺しだ」'), fx: { ab: { trust: 3 }, ba: { trust: 3 } } },
    { n: '現場', t: L('{place}の床に這いつくばる{a}の呟きを、{b}は一字一句漏らさず手帳に書き留めた。|現場に残った匂いに、{a}が眉をひそめた。「{trick}……妙だな」{b}はすかさず写真を撮った。|{b}が見落としかけた小さな傷を、{a}が指差した。「ここだ」――二人の頭がぶつかりそうなほど近づいた。'), fx: { ab: { trust: 4, aff: 2 }, ba: { trust: 5 } } },
    { n: '聞き込み', t: L('{b}は人当たりのよさで関係者の口を開かせ、{a}は横で黙って相手の目の動きを見ていた。|張り込みの車の中で、{a}と{b}は一つのあんぱんを半分に分けた。夜明けまで、話は尽きなかった。|動機は「{motive}」らしい。{b}が聞き出した証言に、{a}は珍しく「よくやった」と言った。'), fx: { ab: { aff: 4, trust: 4 }, ba: { aff: 5, att: 3 } } },
    { n: '危機', t: L('犯人に気づかれた。夜道で{b}が背後から襲われ、駆けつけた{a}が身を挺して庇った。{a}の腕から血が流れていた。「……無事か」|{a}が犯人に追い詰められた瞬間、{b}が消火器を振りかぶって割って入った。「先生に何すんだ！」|{b}が囮を買って出た。物陰で待つ{a}は、{b}の足音が途切れるたびに息が止まりそうだった。'), fx: { ab: { att: 8, aff: 8, trust: 8 }, ba: { att: 9, aff: 8, trust: 10 } }, mag: 25 },
    { n: '推理', t: L('関係者を集めた{a}は、静かに告げた。「犯人は――{culprit}、あなただ」決め手は、{b}が拾った「{trick}」だった。|{a}の推理が一点で詰まったとき、{b}が「{trick}」と呟いた。{a}は目を見開き、それから笑った。「……そういうことか」犯人は{culprit}だった。|{culprit}が膝をついた。動機は「{motive}」。{a}は{b}にだけ聞こえる声で「お前のおかげだ」と言った。'), fx: { ab: { trust: 10, aff: 6 }, ba: { trust: 8, aff: 6, att: 4 } }, mag: 20 },
    { n: '余韻', t: L('事件のあと、二人は事務所で冷めたコーヒーを飲んだ。{b}が「お疲れさまでした」と言うと、{a}は「お前もな」と、{b}の頭を雑に撫でた。|{a}は事件の報告書の最後に、助手の欄へ{b}の名前を丁寧に書き足した。|帰り道、{b}は{a}の包帯を巻き直した。「無茶しないでくださいよ」「お前がいるから無茶できる」'), fx: { ab: { aff: 6, att: 4 }, ba: { aff: 6, att: 5 } } }
  ];
  var BANTER = L('{b}「先生、また靴下が左右違います」{a}「推理に支障はない」|{a}は{b}の淹れたコーヒーにしか口をつけなかった。本人は気づいていない。|{a}「{b}、お前は俺の脳の外付けメモリだ」{b}「褒めてます？」{a}「最大級に」|{b}は{a}の散らかった机を片づけながら、「先生がいないと困る人、結構いますよ」と言った。{a}は「お前は？」と訊きそうになって、やめた。|{a}が徹夜明けにソファで寝落ちすると、{b}は黙って毛布をかけた。|依頼人に「お二人は番なんですか」と訊かれて、{a}と{b}は同時に「違います」と答えた。|{b}は{a}の推理を一番近くで聞ける助手の席が、実は気に入っていた。|{a}は事件のない日、{b}を理由もなく食事に誘った。「推理の燃料だ」と言い張った。');
  var SOLO = L('{a}は依頼人のいない事務所で、未解決事件のファイルを一人でめくっていた。|{a}は助手がいない分、聞き込みも張り込みも一人でこなした。帰りの電車で、少しだけ誰かと話したくなった。|{a}は一人で殺人事件を解決した。祝ってくれる相手はいなかった。');

  function fill(ctx, s, a, b, cs) {
    return ctx.t(s.replace(/\{place\}/g, cs.place).replace(/\{victim\}/g, cs.victim).replace(/\{motive\}/g, cs.motive).replace(/\{culprit\}/g, cs.culprit).replace(/\{trick\}/g, cs.trick), a, b);
  }
  function newCase(ctx) {
    var r = ctx.rng;
    return { stage: 0, place: r.pick(PLACE), victim: r.pick(VICTIM), motive: r.pick(MOTIVE), culprit: r.pick(CULPRIT), trick: r.pick(TRICK) };
  }

  D.events = [
    {
      id: 'det_case', cat: 'bond', scope: 'pair', pri: true,
      when: function (ctx, a, b) {
        if (!D.buddyCtx(ctx, a, b)) return false;
        var st = ctx.om.det;
        return st.cur ? st.lastStep !== ctx.stepIndex : ctx.stepIndex - (st.doneAt == null ? -9 : st.doneAt) >= 4;
      },
      w: function () { return 2.4; },
      run: function (ctx, a, b) {
        var st = ctx.om.det, ab = D.order(a, b), A = ab[0], W = ab[1];
        if (!st.cur) { st.cur = newCase(ctx); st.n++; }
        var cs = st.cur, S = ST[cs.stage];
        st.lastStep = ctx.stepIndex;
        if (S.fx.ab) ctx.mod(A, W, S.fx.ab);
        if (S.fx.ba) ctx.mod(W, A, S.fx.ba);
        var text = '【事件' + st.n + '・' + S.n + '】' + fill(ctx, ctx.pick(S.t), A, W, cs);
        cs.stage++;
        if (cs.stage >= ST.length) { st.cur = null; st.doneAt = ctx.stepIndex; st.solved++; }
        return { cat: cs.stage === 4 ? 'help' : 'bond', text: text, why: OM.jobName(A) + '（' + A.name + '）と' + OM.jobName(W) + '（' + W.name + '）のバディ', mag: S.mag || 10 };
      }
    },
    {
      id: 'det_banter', cat: 'bond', scope: 'pair',
      when: function (ctx, a, b) { return D.buddyCtx(ctx, a, b); },
      w: function () { return 1.1; },
      run: function (ctx, a, b) {
        var ab = D.order(a, b);
        ctx.mod2(ab[0], ab[1], { aff: 3, trust: 3 }, { aff: 3, trust: 3, att: 2 });
        return { text: ctx.t(ctx.pick(BANTER), ab[0], ab[1]), why: 'バディの日常' };
      }
    },
    {
      id: 'det_solo', cat: 'solo', scope: 'solo',
      when: function (ctx, a) { return isDet(a) && !ctx.present().some(function (o) { return isAsst(o); }); },
      w: function () { return 0.6; },
      run: function (ctx, a) { ctx.stress(a, 3); return { text: ctx.t(ctx.pick(SOLO), a), why: '助手のいない探偵' }; }
    }
  ];
})();
