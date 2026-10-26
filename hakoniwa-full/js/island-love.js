/* 箱庭シミュレーター: 無人島 ― 恋が育つ出来事（全年齢版・R18版の共通）
   無人島は生き延びる出来事が多く、恋愛の出来事が少なかった（1回の結果で2つほど）。惹かれが育つきっかけと、告白の場面を足す。
   ・吊り橋：苦しい場面を一緒に越えた二人が、相手を意識しはじめる
   ・焚き火の夜：火の番を一緒にしながら、少しずつ距離が縮まる
   ・手当て：怪我や日焼けの手当てで、触れた手に胸が騒ぐ
   ・嫉妬：想う相手が、ほかの誰かと親しくしているのを見てしまう
   ・告白：惹かれが育ったら想いを告げる（言い方・返事は態度9種ごと）。恋人どうしになった二人の小さな場面
   恋愛の起こりやすさ（romance）が0なら、どれも起きない（エンジンの romanceOk）。R18版では、夜を過ごしたあとの心の動き（island-love-r18.js）が告白の前置きを足す
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, isl = HK.SCENARIOS && HK.SCENARIOS.island;
  if (!isl) return;
  function L(s) { return s.split('|'); }
  function R(ctx, a, b) { return ctx.R(a, b); }
  function ps(c) { return (HK.personaOf ? HK.personaOf(c) : c.persona) || 'gentle'; }
  function pk(ctx, o, c) { var t = o[ps(c)] || o.gentle; return ctx.pick(t); }
  var IL = HK.IslandLove = HK.IslandLove || {};
  /* R18版で上書きする：夜を過ごしたあとに恋に落ちた人の告白の前置き */
  IL.confessPre = IL.confessPre || function () { return ''; };
  /* 生き延びる出来事に埋もれないよう、恋愛の出来事を少し起きやすく（恋愛の起こりやすさ0では起きない） */
  isl.catBias = Object.assign({}, isl.catBias || {}, { romance: 1.8 });

  var T = {
    hardship: L('嵐で拠点の屋根が飛ばされた夜、{a}と{b}は一枚の布を二人で押さえ続けた。雨に打たれながら、何度も目が合った。朝になって嵐が去ったとき、{a}は{b}の横顔から目を離せなくなっていた。|崖の上で足を滑らせた{a}の腕を、{b}が掴んで引き上げた。二人で岩場に倒れ込み、しばらく息を整えた。「……ありがとう｜……助かった｜……ありがとうございます」と言った声が、自分でも驚くほど震えていた。|水が尽きかけた日、{a}と{b}は二人きりで島の奥まで水場を探しに出た。日暮れ近くにようやく湧き水を見つけて、二人で子どものように笑い合った。帰り道、{a}は{b}の手を引いていたことに、浜に着くまで気づかなかった。|食料の当番が{a}と{b}に回ってきた日、二人は朝から晩まで一緒に浜を歩いた。収穫は貝が少しだけだったのに、不思議と疲れなかった。焚き火の前で別れるとき、{a}はもう少し話していたかったと思った。'),
    fire: L('火の番が{a}と{b}の二人になった夜、焚き火の音だけがしばらく続いた。やがて{b}が、島に来る前の暮らしの話をぽつりと始めた。{a}は相槌を打ちながら、炎に照らされた{b}の顔ばかり見ていた。|夜更けの焚き火の前で、{a}は{b}に毛布を半分かけた。「寒いでしょ｜寒いだろう｜寒いでしょう」と言うと、{b}は黙って肩を寄せてきた。触れた肩の温かさが、火よりずっと気になった。|{a}と{b}は焚き火のそばに並んで寝転がり、星の名前を言い合った。知っている星座はすぐに尽きて、二人で勝手な名前をつけ始めた。笑い声が止んだとき、{a}は隣の{b}の息遣いばかりを聞いていた。|満月の夜、{a}は眠れずに浜へ出た。波打ち際に先客がいて、それは{b}だった。二人は何も言わずに並んで座り、月が傾くまで海を見ていた。'),
    care: L('{a}は日焼けで真っ赤になった{b}の背中に、潰したアロエを塗ってやった。{b}がくすぐったそうに身をよじるたびに、{a}の指先が熱くなった。塗り終えたあとも、{a}はしばらく手のひらの感触を忘れられなかった。|岩で足を切った{b}の傷を、{a}は真水で丁寧に洗った。{b}が痛みに顔をしかめると、{a}は「すぐ終わるから｜すぐ終わる｜すぐ終わりますから」と、{b}の手を握らせた。包帯代わりの布を巻き終えても、二人の手は離れなかった。|熱を出した{b}の額に、{a}は一晩じゅう濡らした布を当て続けた。朝方、目を覚ました{b}は、うたた寝する{a}の手が自分の手に重なっているのに気づいた。{b}は、その手をそっと握り返した。'),
    jealous: L('{a}は、{c}と楽しそうに笑う{b}を、離れた場所から見ていた。胸の奥が、ちくりと痛んだ。その夜、{a}は焚き火の輪に加わらず、一人で寝床に入った。|{b}が{c}に釣った魚を分けているのを見て、{a}は持っていた薪を取り落とした。自分でも理由の分からない苛立ちに、{a}は戸惑った。拾い上げた薪を、{a}はいつもより強く火に放り込んだ。|浜で{b}と{c}が肩を並べて歩いているのを、{a}は見てしまった。何でもないことのはずだった。それなのに、その日の{a}は、誰とも口をきかなかった。'),
    couple: L('{a}と{b}は、拠点の端に二人だけの寝床を作った。椰子の葉を重ねて、小さな屋根までつけた。誰も何も言わなかったが、皆が少しだけ温かい目で二人を見ていた。|{a}は浜で一番きれいな貝殻を拾って、紐を通して{b}の首にかけた。{b}は照れくさそうにそれを指でつまみ、「似合う？｜似合うか｜似合いますか」と訊いた。{a}が頷くと、{b}は嬉しそうに笑った。|朝の漁から戻った{a}を、{b}が浜で待っていた。二人は獲れた魚を見せ合い、どちらが大きいかで言い合った。その言い合いさえ、どこか楽しそうだった。|夜、{a}と{b}は焚き火から少し離れたところで、手を繋いで座っていた。救助が来たら、という話を二人はしなかった。今は、この島の夜だけで十分だった。')
  };
  /* 告白の言葉（告げる側の態度ごと。{a}＝告げる側 {b}＝相手） */
  var CONF = {
    proud: L('{a}は{b}を浜の端まで呼び出し、腕を組んだまま言った。「……一度しか言わない。私は、{b}が好きだ」|{a}はそっぽを向いたまま、{b}に言った。「勘違いするなよ。……でも、{b}がいないと、調子が出ない」'),
    stern: L('{a}は{b}の前に立ち、背筋を伸ばした。「けじめとして言っておく。私は、{b}に惹かれている」|{a}は焚き火の前で、{b}をまっすぐに見た。「中途半端は好まない。……{b}のことが、好きだ」'),
    tsun: L('{a}は{b}に貝殻を押しつけた。「べ、別に深い意味はない。……ないけど、好き、かも」|{a}は真っ赤な顔で、{b}の袖を掴んだ。「勘違いしないで。……ただ、ずっと一緒にいたいだけ」'),
    gentle: L('{a}は焚き火の明かりの中で、{b}の手をそっと取った。「ねえ、{b}。……ずっと、好きだった」|{a}は穏やかに微笑んで、{b}に言った。「この島に来てよかったって、初めて思えた。{b}がいたから」'),
    devoted: L('{a}は{b}の前で、ぎゅっと手を握りしめた。「私なんかが言っていいのか分からないけど……{b}のことが、好きです」|{a}は{b}のために獲った魚を差し出しながら、小さな声で言った。「{b}の役に立ちたいんです。……ずっと、そばで」'),
    cool: L('{a}は波打ち際で、{b}の隣に腰を下ろした。「……回りくどいのは苦手だ。{b}が好きだ」|{a}は火の番の終わりに、静かに言った。「ここ数日、気づくと{b}のことを考えている。……たぶん、そういうことだ」'),
    free: L('{a}は浜で{b}の前に回り込み、満面の笑みで言った。「ねえ、{b}！　好き！　付き合って！」|{a}は{b}の手を引いて海に飛び込み、ずぶ濡れのまま笑った。「言っちゃう。{b}のこと、めちゃくちゃ好き」'),
    shy: L('{a}は何度も口を開きかけては閉じ、やっと小さな声を出した。「あ、あの……{b}のこと……好き、です」|{a}は砂浜に指で文字を書いて、{b}に見せた。そこには「すき」とだけ書いてあった。{a}は顔を覆った。'),
    polite: L('{a}は{b}の前で姿勢を正し、深く頭を下げた。「突然で失礼いたします。……{b}を、お慕いしております」|{a}は月明かりの中で、{b}に静かに告げた。「こんな場所で申し上げるのは不躾ですが……{b}のことが、好きです」')
  };
  /* 受け入れる返事（返事をする側の態度ごと） */
  var YES = {
    proud: L('{b}はしばらく黙っていたが、やがてふんと鼻を鳴らした。「遅い。……私のほうが、先に好きだった」|{b}は{a}の額を指で弾いた。「仕方ないな。……私の隣は、{a}にくれてやる」'),
    stern: L('{b}は目を閉じて一つ息をつき、それからしっかりと頷いた。「受けよう。中途半端にはしない」|{b}は{a}の手を取った。「私も、同じ気持ちだ。……大切にする」'),
    tsun: L('{b}は顔を真っ赤にして目を逸らした。「……し、知ってたし。私も、だし」|{b}は{a}の胸を軽く叩いた。「ばか。……もっと早く言ってよ」'),
    gentle: L('{b}は目を細めて、{a}の手を包み込んだ。「うん。……私も、{a}のことが好き」|{b}は少し涙ぐんで、それから笑った。「嬉しい。……ありがとう、言ってくれて」'),
    devoted: L('{b}は両手で口を覆い、何度も頷いた。「私で、いいんですか……？　嬉しい、です」|{b}は{a}の手を握り返した。「私も、ずっと{a}のことばかり考えていました」'),
    cool: L('{b}は少しだけ目を見開き、それから小さく笑った。「……奇遇だ。私も、同じことを考えていた」|{b}は短く答えた。「いいよ。……断る理由が、見つからない」'),
    free: L('{b}は{a}に飛びついた。「やった！　私も好き！　ずっと待ってた！」|{b}は声を上げて笑った。「えー、先に言われた！　もちろん、いいよ！」'),
    shy: L('{b}は俯いたまま、小さく頷いた。耳まで真っ赤だった。「わ、私も……です」|{b}は{a}の袖をそっと掴んだ。言葉は出てこなかったが、その手は離れなかった。'),
    polite: L('{b}は静かに微笑んで、丁寧に頭を下げた。「光栄です。……私も、お慕いしておりました」|{b}は{a}の手をそっと取った。「喜んで。……どうぞ、よろしくお願いいたします」')
  };
  /* 断る返事 */
  var NO = {
    proud: L('{b}はきっぱりと首を振った。「悪いが、そういう目で見たことはない」|{b}は腕を組んだ。「気持ちは受け取っておく。……でも、応えられない」'),
    stern: L('{b}は姿勢を正したまま答えた。「すまない。今は、誰ともそういう関係にはなれない」|{b}は目を逸らさずに言った。「誠実に答える。……私の気持ちは、そこにはない」'),
    tsun: L('{b}は慌てて手を振った。「ちょ、ちょっと待って。……ごめん、そういうのじゃないから」|{b}は唇を噛んだ。「……嫌いじゃない。でも、ごめん」'),
    gentle: L('{b}は困ったように眉を下げた。「ありがとう。……でも、ごめんね。{a}のことは、大切な仲間だから」|{b}は{a}の手をそっと離した。「気持ちは嬉しい。だけど、応えられない」'),
    devoted: L('{b}は泣きそうな顔で頭を下げた。「ご、ごめんなさい……私、{a}にそんな気持ちは……」|{b}は何度も謝った。「ごめんなさい。{a}のことは好きだけど、そういう好きじゃなくて」'),
    cool: L('{b}は少し考えてから、静かに首を振った。「……正直に言う。そういう感情は、ない」|{b}は淡々と答えた。「ありがとう。でも、応えるつもりはない。……すまない」'),
    free: L('{b}は頭をかいた。「あー……ごめん！　{a}のことは好きだけど、友達としてなんだ」|{b}は申し訳なさそうに笑った。「ごめん、そういうのはピンとこないや」'),
    shy: L('{b}は小さく後ずさり、首を横に振った。「ご、ごめんなさい……」と言うのが精一杯だった。|{b}は泣き出しそうな顔で俯いた。「私……まだ、そういうの、分からなくて……」'),
    polite: L('{b}は深く頭を下げた。「お気持ちは大変ありがたいのですが……お受けできません」|{b}は申し訳なさそうに目を伏せた。「申し訳ございません。私には、もったいないお言葉です」')
  };
  /* 告白のあとの地の文 */
  var AFTER_YES = L('二人のあいだに、照れくさい沈黙が落ちた。波の音がやけに大きく聞こえた。やがてどちらからともなく、そっと手を繋いだ。|その夜、焚き火の輪の中で、二人の座る距離は昨日より近かった。誰も何も訊かなかった。それでも、皆が気づいていた。|遠くで誰かが口笛を吹いた。二人は慌てて離れて、それから顔を見合わせて笑った。');
  var AFTER_NO = L('{a}は「そっか｜そうか｜そうですか」とだけ言って、笑ってみせた。浜に戻る足取りは、行きよりずっと重かった。その夜、{a}は火の番を代わってもらわなかった。|{a}は何も言わずに頷いた。一人で岩場まで歩いて、しばらく海を見ていた。波が、何度も足元を洗っていった。|気まずい空気が、しばらく二人のあいだに残った。それでも次の日、{b}はいつものように{a}に朝食を取り分けた。{a}には、それが少しだけ痛かった。');

  function couple(ctx, a, b) { return ctx.pair(a, b).couple; }
  /* 想いを向ける相手：恋人がいればその人、いなければ惹かれ・好意がいちばん育っている相手（振られた相手は除く）。
     出来事の相手を毎回ばらばらに選ぶと、人数が多いと気持ちがどの組にも育たないので、一人に絞って育てる */
  function tgt(ctx, a) {
    var C = ctx.others(a), best = null, bv = -1e9;
    for (var i = 0; i < C.length; i++) {
      var c = C[i], p = ctx.pair(a, c);
      if (p.couple) return c;
      if (a.lock != null && a.lock !== c.i) continue;
      if (p.kin || p.rejected === a.i || !HK.canLove(a, c) || !HK.canLove(c, a)) continue;
      var r = R(ctx, a, c), v = r.att + r.aff * 0.4 - r.ten * 0.3 + (p.chem || 1) * 8;
      if (v > bv) { bv = v; best = c; }
    }
    return best;
  }
  IL.target = tgt;
  /* 一人で動く出来事として登録し、相手は tgt で選ぶ（{a}＝本人 {b}＝想う相手） */
  var add = function (o) {
    var when0 = o.when, w0 = o.w, run0 = o.run;
    isl.events.push({
      id: o.id, cat: o.cat, scope: 'self',
      when: function (ctx, a) { var b = tgt(ctx, a); return !!b && ctx.romanceOk([a, b]) && when0(ctx, a, b); },
      w: function (ctx, a) { var b = tgt(ctx, a); return b ? w0(ctx, a, b) * 1.6 : 0; },
      run: function (ctx, a) { var b = tgt(ctx, a), r = run0(ctx, a, b); if (r) r.with = [b].concat(r.with || []); return r; }
    });
  };

  /* 吊り橋：苦しい場面を一緒に越えた二人 */
  add({
    id: 'il_hardship', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return ctx.stepIndex >= 1 && R(ctx, a, b).aff > -5 && !couple(ctx, a, b) && R(ctx, a, b).att < 60; },
    w: function (ctx, a, b) { return 0.35 + (a.stress + b.stress) / 260 + (ctx.env.storm || 0) / 300 + Math.max(0, R(ctx, a, b).aff) / 200; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { att: 9, aff: 4, trust: 3 }, { att: 6, aff: 4, trust: 3 });
      ctx.stress(a, -6); ctx.stress(b, -6);
      return { text: ctx.t(ctx.pick(T.hardship), a, b), why: '苦しい場面を一緒に越えた（ストレス ' + Math.round(a.stress) + '・' + Math.round(b.stress) + '）。吊り橋のように、' + a.name + 'が' + b.name + 'を意識しはじめた' };
    }
  });
  /* 焚き火の夜 */
  add({
    id: 'il_fire', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { var r = R(ctx, a, b); return (r.att > 10 || r.aff > 20) && !couple(ctx, a, b) && r.ten < 55; },
    w: function (ctx, a, b) { var r = R(ctx, a, b); return 0.35 + r.att / 70 + a.tr.warmth * 0.3 + a.tr.ac * 0.2; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { att: 8, aff: 4 }, { att: 6 + b.tr.ac * 4, aff: 4 });
      return { text: ctx.t(ctx.pick(T.fire), a, b), why: a.name + 'の温かさ（NP）と、' + b.name + 'への惹かれ（' + Math.round(R(ctx, a, b).att) + '）。夜の焚き火が、二人の距離を縮めた' };
    }
  });
  /* 手当て */
  add({
    id: 'il_care', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return R(ctx, a, b).aff > 12 && !couple(ctx, a, b); },
    w: function (ctx, a, b) { return 0.3 + a.tr.np * 0.5 + (100 - (b.hp == null ? 100 : b.hp)) / 150; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { att: 6, aff: 5 }, { att: 9, aff: 6, trust: 4 });
      if (b.hp != null) b.hp = Math.min(100, b.hp + 4);
      return { text: ctx.t(ctx.pick(T.care), a, b), why: a.name + 'の面倒見（NP）。手当てで触れた手が、' + b.name + 'の胸を騒がせた' };
    }
  });
  /* 嫉妬：{a}が想う{b}が、{c}と親しくしている */
  add({
    id: 'il_jealous', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) {
      if (R(ctx, a, b).att < 35 || couple(ctx, a, b)) return false;
      return ctx.others(b).some(function (c) { return c !== a && (ctx.pair(b, c).couple || R(ctx, b, c).att > 30 || R(ctx, b, c).aff > 45); });
    },
    w: function (ctx, a, b) { return 0.25 + a.tr.ac * 0.4 + R(ctx, a, b).att / 120; },
    run: function (ctx, a, b) {
      var cs = ctx.others(b).filter(function (c) { return c !== a && (ctx.pair(b, c).couple || R(ctx, b, c).att > 30 || R(ctx, b, c).aff > 45); });
      var c = cs.sort(function (x, y) { return R(ctx, b, y).att + R(ctx, b, y).aff - R(ctx, b, x).att - R(ctx, b, x).aff; })[0];
      ctx.mod(a, b, { att: 5 }); ctx.mod(a, c, { ten: 10, aff: -4 });
      return { text: ctx.t(ctx.pick(T.jealous), a, b, c), with: [c], why: a.name + 'の' + b.name + 'への惹かれ（' + Math.round(R(ctx, a, b).att) + '）。' + b.name + 'と' + c.name + 'の近さが、胸に刺さった' };
    }
  });
  /* 告白 */
  add({
    id: 'il_confess', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) {
      var r = R(ctx, a, b), p = ctx.pair(a, b), fell = p.fellBy === a.i;
      if (p.couple || p.confessed[a.i]) return false;
      /* 複数の恋人の設定（poly.js）：恋人がいる人は「なし」なら乗り換えの気持ちが育ったときだけ */
      if (HK.Poly && !HK.Poly.canTry(ctx, a, b)) return false;
      return fell ? r.att > 30 : r.att > 42 && r.aff > 26;
    },
    w: function (ctx, a, b) { var p = ctx.pair(a, b); return 0.9 + a.tr.honesty * 1.2 + a.tr.fc * 0.4 + a.stress / 200 + (p.fellBy === a.i ? 2.5 : 0) + R(ctx, a, b).att / 80; },
    run: function (ctx, a, b) {
      var p = ctx.pair(a, b), rb = R(ctx, b, a), fell = p.fellBy === a.i;
      p.confessed[a.i] = true;
      var ok = (rb.att > 30 && rb.aff > 20) || rb.att > 46 || (p.night && rb.aff > 25);
      var t = IL.confessPre(ctx, a, b) + ctx.t(pk(ctx, CONF, a), a, b);
      if (ok) {
        p.couple = true;
        ctx.mod2(a, b, { aff: 16, att: 10, trust: 10, ten: -10 }, { aff: 16, att: 12, trust: 8, ten: -10 });
        t += ctx.t(pk(ctx, YES, b), a, b) + ctx.t(ctx.pick(AFTER_YES), a, b);
        return { mag: 32, text: t, why: a.name + 'が想いを告げた（惹かれ ' + Math.round(R(ctx, a, b).att) + (fell ? '・夜を過ごして恋に落ちた' : '') + '）。' + b.name + 'の側にも気持ちが育っていた（好意 ' + Math.round(rb.aff) + '・惹かれ ' + Math.round(rb.att) + '）' };
      }
      p.rejected = a.i;
      ctx.mod2(a, b, { ten: 12, att: -6 }, { ten: 8, aff: -2 });
      ctx.stress(a, 25);
      t += ctx.t(pk(ctx, NO, b), a, b) + ctx.t(ctx.pick(AFTER_NO), a, b);
      return { mag: 22, text: t, why: a.name + 'が想いを告げた（惹かれ ' + Math.round(R(ctx, a, b).att) + '）。' + b.name + 'の気持ちはまだ育っていなかった（好意 ' + Math.round(rb.aff) + '・惹かれ ' + Math.round(rb.att) + '）' };
    }
  });
  /* 恋人どうしの小さな場面 */
  add({
    id: 'il_couple', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return couple(ctx, a, b); },
    w: function (ctx, a, b) { return 0.4 + a.tr.warmth * 0.3; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { aff: 5, att: 4, trust: 3 }, { aff: 5, att: 4, trust: 3 });
      ctx.stress(a, -5); ctx.stress(b, -5);
      return { text: ctx.t(ctx.pick(T.couple), a, b), why: '恋人どうしになった' + a.name + 'と' + b.name };
    }
  });
})();
