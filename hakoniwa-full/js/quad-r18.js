/* @event-ok 女性の攻め（男性器なし）×男性の受けの跨る・受け入れる文を、指と手（ペニバン）の文に直した（新しい出来事ではない。2026-11-05） */
/* @event-ok 軽い四人の場面の部品（HK.Quad）。出来事そのものは呼ぶ側の箱庭（今日から同居生活 futari-r18.js・追加パック）が @event を付ける。2026-11-04 担当FT */
/* 箱庭シミュレーター（R18版のみ。かたまり pack-lewd）: 軽い四人の夜（HK.Quad）
   利用者の指示（2026-11-04）：4P は条件がそろっているときだけ、軽く。受けの人数で描写を切り替え、攻めは受ける側にしない。攻めどうしだけでまぐわう流れは出さない。
     短いものは、きっかけの段のあと 2〜3 文でさっぱり済ませる。長くても二人ずつの組に分けた段を順に出す形にして、複雑な体位は書かない。
     「八本の腕が絡み合い」のように四人であることを無駄に主張する文は書かない。
   ■ HK.Quad.ok(ctx, ids)：ids は 4 人の番号。受けを中心にした付き合いの輪が完成していれば真（2026-11-04 の利用者の指示）：全組（6 組）が同じ場にいてよく
       （R18に参加しない・恋愛やR18にしない相手・性欲「なし」・家族・無関心・恐怖でない）、性的に対象になる組（HK.Pos.okSex・HK.canLove（両方向）・性行為の相手の固定）は
       すべて恋人・夫婦・セフレなど体の関係のある関係（ctx.pair(x,y).couple／関係の種類）。攻め同士・受け同士など対象にならない組は恋人でなくてよい。
       受けかリバが 1 人以上いて、繋がる組（plan の段）がどれも体の関係のある組で組めること。HK.Quad.ringOk(ctx, g) は同じ判定を何人にでも（三人の夜の条件にも使う）
   ■ HK.Quad.split(ctx, ids)：{ bottoms, tops, revs }（四人の中で、性的に対象になる相手（wantOk）全員に対して HK.Pos.order で攻め＝攻め、全員に対して受け＝受け、ほか＝リバ）
   ■ HK.Quad.scene(ctx, ids, opt)：きっかけの段（opt.lead の文。無ければ汎用。記録の一件、e.tag＝'きっかけ'）と場面（記録の一件、sex・trioPairs＝実際に繋がる組）を積む。
       opt.len：'short'（2〜3 文でさっぱり）／'long'（二人ずつの組の段を順に。各段は HK.SexFlow.fix で段の管理に通す）。opt.why（理由の頭）・opt.fx・opt.leadWhy。
       戻り値 { lead, e, pairs, kind } か null。HK.Trio3 の形（三人の形の点検 trio-shape）とは別の部品・別の理由の印（「四人の夜（軽く）」）
     組の決め方：受け1・攻め3＝攻めが順に受けのもとへ（one）／受け3・攻め1＝攻めが順に三人のもとへ（three）／受け2・攻め2＝二組に分かれる（two）／
       リバ混じり＝体の関係の組を二組に分ける（恋人どうしを先に。mix）。どの組も向きは HK.Pos.order（攻めを受けにしない）。攻めどうしの組は作らない
   ■ 文：二人の段は 3 組の専用文（mf・ff・fm）、受けの反応は態度 9 種、喘ぎは本体の表（HK.ThickSex.moan）。体の語は印。台詞は3本。全年齢では何もしない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.Quad) return;
  function L(s) { return s.split('|'); }
  function P9(o) { var r = {}; for (var k in o) r[k] = L(o[k]); return r; }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = HK.Emo && HK.Emo.att ? HK.Emo.att(c) : c && c.persona; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  var Q = HK.Quad = {};
  var BODY = /^(lover|spouse|mate|fated|fiance|fwb|mistress)$/;

  /* ---------- 条件 ----------
     2026-11-04（利用者の指示・不具合リスト 1104 の NO 9）：「全員恋人」は、受けを中心にした付き合いの輪が完成していれば成立とする。
     ・四人のどの組も「同じ場にいてよい」（hardOk：R18に参加しない・家族・無関心・恐怖・恋愛やR18にしない相手・性欲「なし」でない）
     ・性的に対象になる組（wantOk：HK.Pos.okSex と HK.canLove（両方向）・性行為の相手の固定）は、すべて恋人・夫婦・セフレなど体の関係のある関係
     ・攻め同士・受け同士のように性的に対象にならない組は、恋人でなくてよい（友情・ライバルなどでよい。攻め同士に恋愛の出来事は起こさない）
     ・繋がる組（plan の各段）は、どれも体の関係のある組（pairOk）で、四人とも少なくとも一つの段に入る */
  /* noTen：緊張（ten 60 以上）を見ない。性的に対象にならない組（攻めどうし・受けどうし）は張り合っていても同じ場にいてよい
     （作業の決まり「三人・四人の夜の条件は性的に対象になる組がすべて恋人など。攻めどうし・受けどうしは不問」。2026-11-05 新婚部屋の申し送り） */
  function hardOk(ctx, a, b, noTen) {
    if (HK.SAFE_ON || !a || !b || a === b || a.alive === false || b.alive === false) return false;
    if (a.noR18 || b.noR18) return false;
    if (ctx.pair(a, b).kin) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    /* その場にいて、R18に参加してよい人（HK.State.pairSex は受け攻めの組も見るので、ここでは本人ごとに見る。組は wantOk・pairOk で見る） */
    var St = HK.State;
    if (St && St.here && (!St.here(a) || !St.here(b))) return false;
    if (St && St.r18ok && (!St.r18ok(a) || !St.r18ok(b))) return false;
    if (HK.Pos && HK.Pos.libNone && HK.Pos.libNone([a, b])) return false;
    /* 設定の「恋愛・R18にしない相手」・無関心・恐怖（noSex）の組は同じ場に置かない。恋愛相手の固定の食い違い・同じ人の恋人どうし（coNG）は、
       繋がらないだけで同じ場にいてよい（受けを中心にした輪の攻めどうし） */
    if ((HK.ngExplicit && HK.ngExplicit(a, b)) || (HK.noSexPair && HK.noSexPair(a, b))) return false;
    if (HK.fearHeld && (HK.fearHeld(ctx, a, b) || HK.fearHeld(ctx, b, a)) && !(HK.tieBodyOK && HK.tieBodyOK(ctx, a, b))) return false;
    if (!noTen && ctx.R && (ctx.R(a, b).ten >= 60 || ctx.R(b, a).ten >= 60)) return false;
    return true;
  }
  /* 性的に対象になる組（恋愛対象・受け攻め・恋愛相手の固定・性行為の相手の固定） */
  function wantOk(ctx, a, b) {
    if (!HK.Pos || !HK.Pos.okSex || !HK.Pos.okSex(a, b)) return false;
    if (!HK.canLove || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (HK.Avoid && HK.Avoid.topOk && !HK.Avoid.topOk(ctx, a, b) && !HK.Avoid.topOk(ctx, b, a)) return false;
    return true;
  }
  function bodyTie(ctx, a, b) {
    if (ctx.pair(a, b).couple) return true;
    var ts = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) || [] : [];
    return ts.some(function (t) { return BODY.test(t.type) && t.cold !== 'separated' && t.cold !== 'divorced'; });
  }
  /* 繋がってよい組：同じ場にいてよく、性的に対象で、体の関係のある関係 */
  function pairOk(ctx, a, b) { return hardOk(ctx, a, b) && wantOk(ctx, a, b) && (!HK.State || !HK.State.pairSex || HK.State.pairSex(a, b)) && bodyTie(ctx, a, b); }
  Q.hardOk = hardOk; Q.wantOk = wantOk; Q.bodyTie = bodyTie; Q.pairOk = pairOk;
  /* 輪が完成しているか（g は何人でも）：全組が hardOk（性的に対象にならない組は緊張を見ない）、性的に対象になる組はすべて体の関係、体の関係の組が人数−2 以上 */
  Q.ringOk = function (ctx, g) {
    var n = 0;
    for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) {
      var w = wantOk(ctx, g[i], g[j]);
      if (!hardOk(ctx, g[i], g[j], !w)) return false;
      if (w) { if (!bodyTie(ctx, g[i], g[j])) return false; n++; }
    }
    /* 体の関係の組が人数−2 以上（四人なら、恋人どうしが二組で並ぶ「二組に分かれて」も含む。誰も置いていかない組み分けは plan が見る） */
    return n >= g.length - 2;
  };
  function chars(ctx, ids) { return (ids || []).map(function (i) { return typeof i === 'number' ? ctx.chars[i] : i; }); }
  function order(a, b) { var o = HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b]; return o && o[0] && o[1] ? o : [a, b]; }
  /* 受け攻めは、性的に対象になる相手（wantOk）との向きだけで数える（受けどうし・攻めどうしの向きは数えない。2026-11-05 新婚部屋の申し送り：
     受けどうしの向きで受けがリバに数えられ、攻め1・受け3 の四人が組めなかった）。対象になる相手が一人もいない人だけ、全員との向きで数える */
  Q.split = function (ctx, ids) {
    var g = chars(ctx, ids), out = { bottoms: [], tops: [], revs: [] };
    g.forEach(function (x) {
      var ps = g.filter(function (o) { return o !== x && wantOk(ctx, x, o); });
      if (!ps.length) ps = g.filter(function (o) { return o !== x; });
      var w = ps.filter(function (o) { return order(x, o)[0] === x; }).length;
      (w === ps.length ? out.tops : w === 0 ? out.bottoms : out.revs).push(x);
    });
    return out;
  };
  Q.ok = function (ctx, ids) {
    var g = chars(ctx, ids);
    if (HK.SAFE_ON || g.length !== 4 || g.some(function (c) { return !c; })) return false;
    if (!Q.ringOk(ctx, g)) return false;
    var sp = Q.split(ctx, g);
    if (sp.bottoms.length + sp.revs.length < 1) return false;
    return !!plan(ctx, g);
  };
  /* 組（攻め→受けの向き）の並び。one／three は三組を順に、two／mix は二組 */
  function plan(ctx, g) {
    var sp = Q.split(ctx, g), B = sp.bottoms, T = sp.tops;
    var segOk = function (p) { return pairOk(ctx, p[0], p[1]); };
    if (B.length === 1 && T.length === 3) { var s1 = T.map(function (t) { return [t, B[0]]; }); return s1.every(segOk) ? { kind: 'one', u: B[0], segs: s1 } : null; }
    if (T.length === 1 && B.length === 3) { var s3 = B.map(function (b) { return [T[0], b]; }); return s3.every(segOk) ? { kind: 'three', t: T[0], segs: s3 } : null; }
    /* 二組に分ける：三通りの分け方のうち、恋人どうしの組が多いもの（同じなら最初） */
    var M = [[[g[0], g[1]], [g[2], g[3]]], [[g[0], g[2]], [g[1], g[3]]], [[g[0], g[3]], [g[1], g[2]]]], best = null, bv = -1;
    M.forEach(function (m) {
      /* 攻めどうしの組は作らない */
      if (m.some(function (p) { return T.indexOf(p[0]) >= 0 && T.indexOf(p[1]) >= 0; })) return;
      /* どちらの組も、繋がってよい組（体の関係のある、性的に対象の組）だけ */
      if (!m.every(function (p) { return pairOk(ctx, p[0], p[1]); })) return;
      var v = m.filter(function (p) { return ctx.pair(p[0], p[1]).couple; }).length;
      if (v > bv) { bv = v; best = m; }
    });
    if (!best) return null;
    return { kind: B.length === 2 && T.length === 2 ? 'two' : 'mix', segs: best.map(function (p) { return order(p[0], p[1]); }) };
  }
  /* 体の組（a＝攻め b＝受け）。二人の向きで見た体で決める（2026-11-05：フタナリの攻めは mf、女性の攻め（男性器なし）×男性器のある受けは fm＝指と手） */
  function modeOf(a, b) {
    var P = HK.Pos, f = P && P.isF;
    if (!f) return 'mf';
    if (f(a, b) && f(b, a)) return 'ff';
    if (HK.Trio3 && HK.Trio3.edgeKind) { var k = HK.Trio3.edgeKind(a, b); if (k === 'fm') return 'fm'; if (k === 'm') return 'mf'; }
    return f(a, b) && !f(b, a) ? 'fm' : 'mf';
  }

  /* ======================= 文 ======================= */
  /* 汎用のきっかけ（{a}＝言い出した人、{b}{c}{d}＝ほかの三人）。性別の語・体の語は書かない */
  var LEAD = L('その夜は、四人とも同じ部屋から離れがたかった。誰が言い出したわけでもなく、明かりは一つずつ落とされていった。四人とも、今夜がどういう夜になるのか分かっていた。|遅くまで四人で話し込んでいるうちに、終電の時刻も、寝る時刻も過ぎていた。{a}が布団を一つ広げると、{b}も{c}も{d}も、黙ってそのそばに腰を下ろした。誰も、自分の部屋に戻ろうとはしなかった。');
  var LEAD_Q = P9({
    proud: '{a}「今夜は、誰も部屋に戻さないから｜今夜は、誰も部屋に戻さない｜今夜は、誰も部屋に戻しませんから」',
    stern: '{a}「……今夜は、四人でいたい。嫌な人は言ってほしい｜……今夜は、四人でいたい。嫌なら言ってくれ｜……今夜は、四人でいたいです。嫌な人は言ってください」',
    tsun: '{a}「べ、別に、四人でとか、言ってないけど……帰らなくていいから｜べ、別に、四人でとは言っていないが……帰らなくていい｜べ、別に、四人でとは言っていませんけど……帰らなくていいですから」',
    gentle: '{a}「今夜は、このままみんなでいようか｜今夜は、このままみんなでいよう｜今夜は、このままみんなでいましょうか」',
    devoted: '{a}「みんなと一緒がいい。……だめかな｜みんなと一緒がいい。……だめか｜みんなと一緒がいいです。……だめでしょうか」',
    cool: '{a}「……今さら、別々の部屋に戻る理由もないでしょう｜……今さら、別々の部屋に戻る理由もないだろう｜……今さら、別々の部屋に戻る理由もありませんよね」',
    free: '{a}「ねえ、今夜はみんなでここで寝ちゃおうよ｜なあ、今夜はみんなでここで寝よう｜ねえ、今夜はみんなでここで寝ちゃいましょうよ」',
    shy: '{a}「あ、あの……今夜は、みんなと……｜あ、あの……今夜は、みんなと……｜あ、あの……今夜は、みなさんと……」',
    polite: '{a}「よろしければ、今夜は四人で過ごしませんか｜よければ、今夜は四人で過ごさないか｜よろしければ、今夜は四人で過ごしませんか」'
  });
  /* 組が決まったわけ（受けの人数で。{u}＝ただ一人の受け、{t}＝ただ一人の攻め） */
  var FORM = {
    one: L('抱かれる側に回るのは、四人の中で{u}だけだった。ほかの三人は、順番に{u}のもとへ行くことにした。|今夜、求められる側になるのは{u}一人だった。急がなくていい、と誰かが言い、三人は一人ずつ{u}の隣に横になった。'),
    three: L('抱く側に回れるのは、四人の中で{t}だけだった。{t}は、待っている三人の顔を一人ずつ見た。|{t}のほかの三人は、抱かれる側だった。{t}は誰も置いていかないように、一人ずつ名前を呼んだ。'),
    two: L('四人は自然と二組に分かれた。隣の布団の気配を感じながら、それぞれの相手だけを見ていた。|二組に分かれた四人は、灯りを落とした部屋で、それぞれの相手の手を取った。'),
    mix: L('誰が誰の隣に行くのかは、話し合うまでもなく決まった。四人は二組に分かれて、それぞれの相手に向き直った。|四人は二組に分かれた。もう一組の気配が近いせいか、どちらの組も、いつもより少しだけ声をひそめていた。')
  };
  /* 二人の段（{a}＝攻め、{b}＝受け。複雑な体位は書かない。地の文 3 文） */
  var SEG = {
    mf: L('{a}は{b}を布団にそっと横たえ、確かめるように何度か口づけてから、ゆっくりと{ナカ}へ沈んでいった。{b}は{a}の背に腕を回して、浅い息を何度もこぼした。やがて{a}が深く動くと、{b}は{a}の腕の中で小さく震えて果てた。|{a}は{b}の脚のあいだに体を寄せ、{男性器}をゆっくりと奥まで埋めた。{b}の指が{a}の肩に食い込み、揺さぶられるたびに声がこぼれた。二人は短い時間のうちに、同じ波にさらわれていった。|{a}は{b}の額に自分の額を合わせたまま、静かに繋がった。急がない動きに、{b}の体からだんだん力が抜けていく。最後に{a}が{b}を強く抱き寄せると、二人の息がひとつになって途切れた。'),
    ff: L('{a}は{b}の{胸}に唇を落としながら、指をそっと{ナカ}へ沈めていった。{b}は{a}の髪に指を絡めて、声をこらえるように唇を噛んだ。{a}の指が弱いところを探り当てると、{b}は小さく震えて果てた。|{a}は{b}の内腿に口づけを重ねて、そのまま舌で{b}を確かめた。{b}は布団を握りしめて、何度も{a}の名前を呼んだ。最後には腰を浮かせて、{a}の唇の上で長く震えた。|{a}は{b}を背中から抱き寄せ、片手で{胸}を包みながら、もう片方の手を下へ滑らせた。{b}の呼吸がだんだん浅く、速くなっていく。{a}が耳元で何か囁いた瞬間、{b}は体を丸めて達した。'),
    fm: L('{a}は{b}の脚のあいだに膝をつき、濡らした指を{後ろ}へゆっくりと沈めていった。{b}は{a}の肩に手を添えて、見上げたまま息を詰めた。{a}が奥の膨らみをそっと押し上げると、{b}は堪えきれずに{a}の手の中で果てた。|{a}は{b}を仰向けにさせて、胸に片手をついたまま、もう片方の手で{b}の{男性器}を包んだ。{b}の喉から、こらえきれない声がこぼれる。{a}が手の動きを速めると、{b}は{a}の手首をつかんで達した。|{a}は{b}の首筋に口づけを落としながら、前と後ろをゆっくりと指で責めていった。{b}は{a}の背中を抱きしめて、息を合わせた。{a}がほとんど手を止めたまま奥を撫でると、{b}は静かに果てた。'),
    /* 女性の攻め（男性器なし）×男性の受けで、ペニバンを使う組（まれ。HK.FM.STRAP_P） */
    fsp: L('{a}は腰にペニバンのベルトを締め、指でほぐした{b}の{後ろ}に張り型の先をあてがった。{b}は{a}の腕をつかんで、見上げたまま息を詰めた。{a}がゆっくりと張り型を沈めて奥を押し上げると、{b}は堪えきれずに果てた。|{a}は少し照れたようにペニバンを腰に着けて、{b}の脚のあいだに膝をついた。張り型の先を{後ろ}にあてがい、{b}の息に合わせて少しずつ沈めていく。{a}が{b}の{男性器}を握りながら揺らすと、{b}は{a}の手首をつかんで達した。')
  };
  /* 受けの反応（態度 9 種。体の語なし） */
  var REACT = P9({
    proud: '{b}は声を上げまいと顔を背けたが、最後には{a}の名前を呼んでいた。|{b}は息を整えながら、「……悪くなかった｜……悪くなかった｜……悪くなかったです」とだけ言った。',
    stern: '{b}は乱れた呼吸を整えようとして、うまくいかずに目を閉じた。|{b}は{a}の手を握ったまま、しばらく黙って天井を見ていた。',
    tsun: '{b}は真っ赤な顔で{a}を睨んだが、その手は{a}の袖をつかんだままだった。|{b}は「……べ、別に、いいけど｜……べ、別に、構わないが｜……べ、別に、いいですけど」と小さく呟いて、顔を枕に埋めた。',
    gentle: '{b}は{a}の頬に手を添えて、やわらかく笑った。|{b}は{a}の髪を撫でて、「ありがとう｜ありがとう｜ありがとうございます」と囁いた。',
    devoted: '{b}は{a}の胸に額を寄せて、満たされたように息をこぼした。|{b}は{a}の手を両手で包んで、何度も小さく頷いた。',
    cool: '{b}は表情を変えまいとしたが、耳の先まで赤くなっていた。|{b}は小さく息を吐いて、{a}の肩にもたれかかった。',
    free: '{b}は息を弾ませたまま、{a}の首に腕を回して笑った。|{b}は「もう一回は、また今度ね｜もう一回は、また今度だ｜もう一回は、また今度ですね」と言って、{a}の鼻先をつついた。',
    shy: '{b}は顔を両手で覆ったまま、指の隙間から{a}を見た。|{b}は布団を引き寄せて、真っ赤になった顔を隠した。',
    polite: '{b}は乱れた襟元を直しながら、小さく頭を下げた。|{b}は息を整えてから、{a}に「……ありがとう｜……ありがとう｜……ありがとうございました」と囁いた。'
  });
  /* 短い版（2〜3 文。きっかけの段のあと） */
  var SHORT = L('四人は、居間の明かりを一つずつ落とした。最後の明かりが消えたあとのことは、誰も口にしなかった。翌朝の食卓は、いつもよりにぎやかだった。|その夜、四人の部屋の扉は、朝まで開かなかった。翌朝、四人は少し寝坊して、そろって同じ時間に台所に立った。|灯りを落とした部屋に、四人分の小さな笑い声と、ひそめた息づかいが満ちた。夜明け前、誰かが毛布をかけ直して、四人はそのまま眠った。|その夜、四人は一つの布団で朝を迎えた。灯りが消えたあとのことは、四人だけが知っている。|明かりが落ちると、部屋には四人分の息づかいだけが残った。翌朝、誰も昨夜のことを口にしなかったが、朝食の席はいつもより少しだけ静かだった。|それから先のことは、四人だけの秘密になった。翌朝、四人はそろって少し寝坊した。');
  /* 長い版の締め（1〜2 文。{a}{b}{c}＝四人のうち三人。一回の遊びで使っていない文から） */
  var END = L('朝の光が差し込むころ、四人は誰からともなく目を覚まして、照れくさそうに笑い合った。|最後に明かりを消したのが誰だったのか、翌朝、誰も覚えていなかった。四人は同じ毛布の端を握ったまま眠っていた。|夜が更けるころには、四人とも布団の上で眠りに落ちていた。|明け方、誰かが掛け布団をかけ直す気配がした。四人は、そのまま朝まで眠った。|' +
    '息が落ち着くと、誰からともなく水を回し飲みした。最後の一口を飲んだ{a}が、照れくさそうに笑った。|' +
    '灯りを消し忘れたまま、四人は眠ってしまった。朝、最初に目を覚ました{b}が、そっとスイッチを切った。|' +
    'しばらくは誰も口をきかなかった。やがて{c}が小さくあくびをして、それを合図に四人は毛布にくるまった。');

  /* ======================= 組み立て ======================= */
  function pickOf(ctx) { return function (arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }; }
  function fresh(ctx, arr) {
    var U = ctx._quadU || (ctx._quadU = {}), l = (arr || []).filter(function (t) { return !U[t]; });
    if (!l.length) l = arr || [];
    var t = l.length ? l[Math.floor(ctx.rng() * l.length)] : ''; if (t) U[t] = 1; return t;
  }
  function fillN(t, m) { return String(t).replace(/\{([a-z])\}/g, function (s, k) { return m[k] ? m[k].name : s; }); }
  function segText(ctx, top, bot) {
    var mode = modeOf(top, bot), pk = pickOf(ctx), TS = HK.ThickSex;
    var sp = mode === 'fm' && HK.Trio3 && HK.Trio3.strapOk && HK.Trio3.strapOk(top, bot) && ctx.rng() < ((HK.FM && HK.FM.STRAP_P) || 0.28);
    var t = fresh(ctx, SEG[sp ? 'fsp' : mode]), mo = TS && TS.moan ? TS.moan(pk, bot, mode === 'fm', ctx) : '';
    t += (mo ? '{b}「' + mo + '」' : '') + fresh(ctx, REACT[per(bot)] || REACT.gentle);
    t = ctx.t(t, top, bot);
    /* 二人の段を、長い場面と同じ段の管理（HK.SexFlow：逆戻り・体位の矛盾・二度出し）に通す */
    var F = HK.SexFlow;
    if (F && F.fix && !F.off) { try { var r = F.fix(t, { a: top, b: bot, mode: mode }); if (r && r.text) t = r.text; } catch (e) { /* 直せなければそのまま */ } }
    if (mode === 'ff' && HK.FF && HK.FF.fix) t = HK.FF.fix(ctx, t, top, bot);
    return t;
  }
  Q.scene = function (ctx, ids, opt) {
    opt = opt || {};
    var g = chars(ctx, ids);
    if (!Q.ok(ctx, g)) return null;
    var pl = plan(ctx, g);
    if (!pl) return null;
    var a = g[Math.floor(ctx.rng() * 4)], rest = g.filter(function (c) { return c !== a; });
    /* きっかけの段（呼ぶ側の文か、汎用の文） */
    var lt = opt.lead || ctx.t(fillN(fresh(ctx, LEAD) + fresh(ctx, LEAD_Q[per(a)] || LEAD_Q.gentle), { a: a, b: rest[0], c: rest[1], d: rest[2] }), a, rest[0], rest[1]);
    lt += fillN(fresh(ctx, FORM[pl.kind]), { u: pl.u, t: pl.t });
    var le = ctx.say({ kind: 'event', cat: 'bond', actors: g.slice(), text: lt, why: 'きっかけ：' + (opt.leadWhy || '四人の夜（' + g.map(function (c) { return c.name; }).join('・') + '）'), mag: 3, lewd: false });
    if (le && !le.skipped) le.tag = 'きっかけ'; else le = null;
    var short = opt.len !== 'long', text;
    if (short) text = fresh(ctx, SHORT);
    else text = pl.segs.map(function (p) { return segText(ctx, p[0], p[1]); }).join('\n\n') + '\n\n' + fillN(fresh(ctx, END), { a: g[0], b: g[1], c: g[2], d: g[3] });
    var pairs = pl.segs.map(function (p) { return [p[0], p[1]]; });
    var KN = { one: '受け1・攻め3：' + (pl.u && pl.u.name) + 'のもとへ順に', three: '攻め1・受け3：' + (pl.t && pl.t.name) + 'が順に', two: '受け2・攻め2：二組に分かれて', mix: 'リバ混じり：二組に分かれて' };
    var desc = pl.segs.map(function (p) { return p[0].name + '→' + p[1].name; }).join('、');
    var e = ctx.act2({ actors: g.slice(), cat: 'romance', sex: true, trioPairs: pairs, lewd: true, text: text, mag: 12, fx: opt.fx,
      why: (opt.why || '') + '四人の夜（軽く。' + KN[pl.kind] + '。' + desc + (short ? '・短く' : '') + '）' });
    if (!e || e.skipped) { if (le) { var k = ctx.log.indexOf(le); if (k >= 0) { ctx.log.splice(k, 1); for (var j = k; j < ctx.log.length; j++) if (ctx.log[j]) ctx.log[j].n = j; } } return null; }
    return { lead: le, e: e, pairs: pairs, kind: pl.kind };
  };
})();
