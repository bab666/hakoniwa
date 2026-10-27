/* 箱庭シミュレーター: オメガバース ― 番・恋人以外と関係を持ったあと、隠して仲がこじれる話
   ・番か恋人のいる住人が、ほかの人と夜を過ごす（寝取り om_steal・発情期 om_heat）と、隠しごとの流れが始まる
     隠す（罪悪感と、態度の変化）→ 発覚（匂い・人から聞く・証拠・自分から打ち明ける）→ 言い訳か告白 → 修復か破局 → （修復なら）やり直しの一歩
   ・どの分岐になるかは、二人の気質（いちばん強い因子）・第二性（αとΩは匂いで気づく）・番かどうか・好意と信頼・本命・目標で決まる
   ・段階は恋人どうしの組の pf.omHide に持つ（{st, by, with, at, last, ...}）。一段ごとに区切りを一つ以上あける
   ・浮気そのもの（夜の場面）は omega-passion.js の om_steal と発情期の場面。R18版の厚い描写は omega-thick.js の OM.affairScene
   ・全年齢版・全年齢モード（HK.SAFE_ON）では、体の関係ではなく「ほかの人と親密になった」話として書く
   ・恋愛相手の固定・性行為の相手の固定（固定した相手だけ・固定した相手＋モブ）・R18に参加しない・恋愛・R18にしない相手の組は、浮気そのものが起きない（OM.affairOk）
   {a}{b} は出来事ごとに書く。{d}＝浮気の相手、{t}＝知らせる住人、{rel}＝番／恋人、{sd}＝浮気の相手の匂い。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA, scen = HK.SCENARIOS && HK.SCENARIOS.omega;
  if (!scen || !OM || !OM.B) return;
  var BD = OM.B, EV = scen.events;
  function L(s) { return s.split('|'); }
  function sx(c) { return c.om && c.om.sex; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function top(c) { return HK.voiceTop ? HK.voiceTop(c) : 'NP'; }
  function here(c) { return !!c && (HK.State ? HK.State.here(c) : c.alive !== false); }
  function nose(c) { return sx(c) === 'a' || sx(c) === 'o'; }
  function safe() { return !!HK.SAFE_ON; }
  /* その場にいる恋人。二人以上いれば、区切りごとに順に回す（同じ区切りの中では同じ人。2026-10-27：いつも住人欄のいちばん下の一人になっていたのを直す） */
  function partnersOf(ctx, a) { return ctx.present().filter(function (o) { return o !== a && ctx.pair(a, o).couple; }); }
  function partnerOf(ctx, a) {
    var ps = partnersOf(ctx, a);
    return ps.length > 1 ? ps[((ctx.stepIndex || 0) + a.i) % ps.length] : ps[0] || null;
  }
  function fill(ctx, t, a, b, x) {
    x = x || {};
    var d = x.d, tl = x.t;
    t = t.replace(/\{d\}/g, d ? d.name : '').replace(/\{t\}/g, tl ? tl.name : '').replace(/\{rel\}/g, x.rel || '恋人')
      .replace(/\{sd\}/g, function () { return d ? OM.shortScent(d) : ''; })
      .replace(/\{slept\}/g, safe() ? '{d}と、一晩一緒にいた' : '{d}と寝た').replace(/\{d\}/g, d ? d.name : '');
    return OM.sc(OM.fill(ctx, t, a, b), a, b);
  }

  /* ---------- 浮気が起きてよい組（恋人どうしの組・浮気の組の両方を、呼ぶ側で通す） ---------- */
  /* 体の関係（R18版）：その場にいる・R18に参加する・恋愛対象と受け攻め（HK.Pos.okSex。恋愛・R18にしない相手・性行為の相手の固定も見る）。
     全年齢：恋愛してよい組（HK.canLove を両方向）で、恋愛・R18にしない相手でない */
  OM.affairOk = function (ctx, a, b) {
    if (!a || !b || a === b || !here(a) || !here(b)) return false;
    if (HK.ngPair && HK.ngPair(a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (!HK.canLove(a, b) || !HK.canLove(b, a)) return false;
    if (HK.Pos && HK.Pos.okSex && !HK.Pos.okSex(a, b)) return false;
    if (!safe() && HK.State && !(HK.State.r18ok(a) && HK.State.r18ok(b))) return false;
    return true;
  };
  /* 恋人（番）を想う強さ：本命なら強く踏みとどまる。番の絆も少し効く */
  OM.loyalty = function (ctx, holder, part, other) {
    var v = 0;
    if (holder.honmei != null) v += holder.honmei === part.i ? 30 : holder.honmei === (other && other.i) ? -15 : 0;
    if (BD.bonded(ctx, holder, part)) v += 15;
    return v;
  };

  /* ---------- 始まり：浮気のあと、恋人（番）の組に印をつける ---------- */
  var S = OM.Secret = {};
  S.start = function (ctx, cheater, partner, other, via) {
    if (!cheater || !partner || !other) return;
    var cp = ctx.pair(cheater, partner);
    if (!cp.couple) return;
    var h = cp.omHide;
    /* 隠しているあいだに、また会った：疑いが増すだけ */
    if (h && h.st !== 'done' && h.st !== 'end') { h.times++; h.sus += 12; return; }
    cp.omHide = { st: 'hide', by: cheater.i, to: partner.i, with: other.i, at: ctx.stepIndex, at0: ctx.stepIndex, last: ctx.stepIndex, via: via, hides: 0, sus: 0, times: 1, lied: 0 };
    /* 古い「浮気が恋人に知られる」（om_cheat_found）は、この流れが引き継ぐ */
    if (cp.cheat) cp.cheat.found = true;
    ctx.stress(cheater, 8);
  };
  function cur(ctx, a, b) { var pf = ctx.pair(a, b); return pf.couple && pf.omHide && pf.omHide.st !== 'done' && pf.omHide.st !== 'end' ? pf.omHide : null; }
  function relWord(ctx, a, b) { return BD.bonded(ctx, a, b) ? '番' : '恋人'; }
  function ready(ctx, h, gap) { return ctx.stepIndex - h.last >= (gap || 1); }

  /* ---------- 1. 隠す：罪悪感と、態度の変化（{a}＝隠す側、{b}＝恋人・番） ---------- */
  var HIDE = {
    CP: L('{a}は、あの夜のことを一言も口にしなかった。そのかわり、{b}の些細な言葉にいちいち棘のある返事をするようになった。責められる前に、先に壁を作っているようだった。|' +
      '{a}は前より仕事を詰め込み、帰りが遅くなった。{b}が「最近忙しいね｜最近忙しそうだな｜最近忙しいですね」と言うと、「別に」とだけ返して目を逸らした。強がりの声が、ほんの少しだけ上ずっていた。|' +
      '{a}は{b}の前では、何事もなかったように振る舞った。ただ、{b}がスマホに手を伸ばすたび、{a}の視線が一瞬だけそちらを追った。自分でも気づかないほどの、小さな癖だった。'),
    NP: L('{a}は急に、{b}に優しくなった。頼まれてもいないのに夕食を作り、帰りには{b}の好きな菓子を買ってきた。優しくすればするほど、胸の奥の重さは増えていった。|' +
      '{a}は{b}の髪を撫でながら、「何か困ってることない？｜何か困っていることはないか？｜何か困っていることはありませんか？」と何度も訊いた。困っているのは自分のほうだと、{a}がいちばんよく分かっていた。{b}は不思議そうに笑って、「ないよ｜ない｜ありません」と答えた。|' +
      '{a}は{b}の世話を焼くことで、あの夜を上から塗りつぶそうとした。{b}が「ありがとう｜＝｜ありがとうございます」と言うたびに、{a}の笑顔は少しずつぎこちなくなった。罪悪感は、優しさでは消えなかった。'),
    A: L('{a}はあの夜の跡を、ひとつずつ消していった。着ていた服はクリーニングに出し、{d}とのやり取りは全部消した。完璧なはずなのに、{a}は眠りが浅くなった。|' +
      '{a}は、聞かれてもいないアリバイを用意していた。「先週の木曜は会議で遅くなったんだ｜先週の木曜は会議で遅くなった｜先週の木曜は会議で遅くなったんです」――{b}は首をかしげた。誰も、木曜のことなんて訊いていなかった。|' +
      '{a}は、{b}との会話を前より慎重に選ぶようになった。言葉を選ぶたび、ほんの一拍だけ間が空く。その一拍が、二人のあいだに少しずつ積もっていった。'),
    FC: L('{a}は、いつもよりよく笑った。くだらない冗談を言い続け、沈黙ができると慌てて次の話題を探した。{b}が黙った瞬間だけ、{a}の顔から表情が抜け落ちた。|' +
      '{a}は突然「旅行に行こう｜＝｜旅行に行きましょう」と言い出し、パンフレットを何冊も抱えて帰ってきた。はしゃぐ声が、どこか空回りしていた。{b}は嬉しそうにページをめくりながら、ふと{a}の横顔を見た。|' +
      '{a}は{b}に抱きつき、いつもより長く離れなかった。「どうしたの｜どうした｜どうしたんですか」と訊かれても、「なんでもない｜何でもない｜何でもありません」と笑うだけだった。笑っている目の奥が、少しだけ揺れていた。'),
    AC: L('{a}は、{b}の顔をまっすぐ見られなくなった。「ごめん｜すまない｜ごめんなさい」が口癖のように増え、何に謝っているのか自分でも分からなくなっていた。{b}が「謝ることないよ｜謝ることはない｜謝ることはありません」と言うたびに、胸が苦しくなった。|' +
      '{a}は夜中に何度も目を覚まし、隣で眠る{b}の寝顔を見つめた。言わなければ、と思う。言ったら終わる、とも思う。結局、朝まで一言も言えなかった。|' +
      '{a}は{b}の機嫌を、前よりずっと気にするようになった。少しでも{b}の声が低いと、全部ばれたのではないかと心臓が跳ねた。{a}の顔色の悪さに、{b}は「熱でもある？｜熱でもあるのか？｜熱でもありますか？」と額に手を当てた。')
  };
  /* 恋人・番がαかΩ（匂いで気づく）なら、匂いを消す */
  var HIDE_SCENT = L('{a}は家に帰る前に、必ずシャワーを浴びるようになった。抑制剤も、いつもより一錠多く飲んだ。{rel}の鼻をごまかせるとは、本当は思っていなかった。|' +
    '{a}は、匂い消しのスプレーを鞄に忍ばせた。{b}に抱きしめられる前に、首筋にもう一度吹きつける。{sd}の匂いが残っていないか、それだけが怖かった。');
  /* 番（隠す側がα、番がΩ）：噛み跡に触れられない */
  var HIDE_BOND = L('{b}のうなじの噛み跡に、{a}は唇を寄せられなくなった。触れたら、そこから全部伝わってしまう気がした。番の絆は、隠しごとに向いていない。|' +
    '{b}は眠る前、いつものように{a}の胸に顔を寄せた。{a}は息を止め、自分の匂いにほかの誰かが混ざっていないかを祈った。{b}は少しだけ眉を寄せ、何も言わずに目を閉じた。');
  var NOTICE = ['{b}は、まだ何も気づいていない。', '{b}は何かが変わったことに気づいていた。それが何かは、まだ分からなかった。', '{b}の中で、小さな疑いが形になりはじめていた。'];

  EV.push({
    id: 'om_hide', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var h = cur(ctx, a, b); return !!h && h.st === 'hide' && h.hides < 2 && ready(ctx, h) && here(a) && here(b); },
    w: function (ctx, a, b) { var h = ctx.pair(a, b).omHide; return 3.5 + (h.hides ? 0 : 2) + ctx.chars[h.by].tr.ac * 1.2; },
    run: function (ctx, a, b) {
      if (ctx.pair(a, b).omHide.by !== a.i) { var x0 = a; a = b; b = x0; }
      var h = ctx.pair(a, b).omHide, d = ctx.chars[h.with], rel = relWord(ctx, a, b);
      h.hides++; h.last = ctx.stepIndex;
      var t = ctx.pick(HIDE[top(a)] || HIDE.NP);
      var bondAO = BD.bonded(ctx, a, b) && sx(a) === 'a' && sx(b) === 'o';
      if (bondAO && ctx.rng() < 0.6) t += ctx.pick(HIDE_BOND);
      else if (nose(b) && nose(d) && ctx.rng() < 0.6) t += ctx.pick(HIDE_SCENT);
      /* 恋人・番の勘：匂い（αとΩ）・観察（A）・嫉妬深さ・番の絆。隠す側が上手なほど（A・CP）気づかれにくい */
      var sense = (nose(b) && nose(d) ? 18 : 6) + b.tr.a * 14 + b.tr.jealous * 14 + (BD.bonded(ctx, a, b) ? 12 : 0) + h.times * 6 - a.tr.a * 8 - a.tr.cp * 4 + ctx.rng() * 10;
      h.sus += Math.max(4, sense);
      t += NOTICE[h.sus < 25 ? 0 : h.sus < 50 ? 1 : 2];
      ctx.stress(a, 10);
      ctx.mod2(a, b, { ten: 4 }, { ten: h.sus < 25 ? 1 : 5, trust: h.sus < 25 ? 0 : -3 });
      var why = a.name + 'は' + d.name + 'とのことを、' + rel + 'の' + b.name + 'に隠している（隠し方は' + top(a) + '優位の気質から）／' + b.name + 'の疑い ' + Math.round(h.sus);
      return { text: fill(ctx, t, a, b, { d: d, rel: rel }), why: why, mag: 16 };
    }
  });

  /* ---------- 2. 発覚：匂い・番の絆・人から聞く・見せつけられる・証拠・自分から（{a}＝恋人・番、{b}＝隠していた側） ---------- */
  var FOUND = {
    scent: L('{a}は帰ってきた{b}を抱きしめて、動きを止めた。首筋に、かすかに{sd}の匂いが残っていた。シャワーでも抑制剤でも消しきれない、{d}の匂いだった。|' +
      '{a}は、{b}が椅子に掛けていった上着を拾い上げ、何気なく顔を近づけた。知っている匂いだった。{d}の匂いだと分かった瞬間、{a}の指から上着が滑り落ちた。'),
    bond: L('{a}のうなじの噛み跡が、その夜、ちりちりと痛んだ。番の匂いに、別の誰かの匂いが混ざっている。言葉より先に、体が答えを知っていた。|' +
      '{a}は{b}の隣で目を覚まし、噛み跡を手で押さえた。番の匂いが、いつもと少しだけ違う。{a}はそれが{d}の匂いだと、確かめる前から分かっていた。'),
    told: L('{t}は迷った末に、{a}を呼び出した。「言うべきか、ずっと考えてた。この前、{b}が{d}と一緒にいるのを見た｜言うべきか、ずっと考えていた。この前、{b}が{d}と一緒にいるのを見た｜言うべきか、ずっと考えていました。この前、{b}が{d}と一緒にいるのを見ました」{a}は笑おうとして、うまく笑えなかった。|' +
      '{t}は{a}の前で、言いにくそうにコーヒーをかき混ぜた。「{b}のこと、知ってる？｜{b}のことを、知っているか？｜{b}のこと、知っていますか？」――その一言で、{a}はこの数週間の違和感の正体を知った。{t}は「ごめん｜すまない｜ごめんなさい」と小さく言った。'),
    flaunt: L('{d}がわざわざ{a}の前に現れた。「{b}から、何も聞いてないんだ？｜{b}から、何も聞いていないのか？｜{b}から、何も聞いていないんですか？」薄く笑う{d}を前に、{a}は何も言い返せなかった。|' +
      '{a}のスマホに、{d}から短いメッセージが届いた。「{b}、この前はうちに泊まったよ｜{b}は、この前うちに泊まった｜{b}、この前はうちに泊まりましたよ」既読をつけたまま、{a}は長いこと画面を見つめていた。'),
    proof: L('{a}は{b}の鞄から、見覚えのない店のレシートを見つけた。日付は、{b}が「残業」と言っていた夜だった。{a}はレシートを元に戻し、何も見なかったふりをしようとして、できなかった。|' +
      '{b}のスマホが、テーブルの上で光った。画面に浮かんだのは、{d}からの「昨日はありがとう｜＝｜昨日はありがとうございました」だった。{a}はそれを、二回読んだ。それから、{b}が風呂から出てくるのを黙って待った。'),
    self: L('{b}は夕食の途中で箸を置いた。「話がある｜＝｜話があります」――その声の硬さで、{a}は何かが終わりかけていることを察した。{b}は膝の上で拳を握ったまま、しばらく顔を上げなかった。|' +
      '{b}は眠れないまま夜明けを迎え、隣の{a}を起こした。「言わなきゃいけないことがある｜言わなければならないことがある｜言わなければいけないことがあります」{a}はその顔を見て、聞く前から胸がざわついた。')
  };
  var LIE_AGAIN = L('あの言い訳は、やはり嘘だった。{a}がそれを知ったのは、「信じて｜信じてくれ｜信じてください」と言われてから何週間も経ってからだった。|一度は信じたぶん、二度目の痛みは深かった。');
  EV.push({
    id: 'om_hide_found', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      var h = cur(ctx, a, b);
      if (!h || h.st !== 'hide' || !ready(ctx, h) || !here(a) || !here(b)) return false;
      return h.sus >= 40 || h.hides >= 2 || ctx.stepIndex - h.at >= (h.lied ? 3 : 5) || (h.hides >= 1 && ctx.chars[h.by].tr.honesty > 0.62);
    },
    w: function (ctx, a, b) { var h = ctx.pair(a, b).omHide; return 3 + h.sus / 15 + (ctx.stepIndex - h.at) * 0.6; },
    run: function (ctx, a, b) {
      if (ctx.pair(a, b).omHide.by === a.i) { var x0 = a; a = b; b = x0; }
      var h = ctx.pair(a, b).omHide, d = ctx.chars[h.with], rel = relWord(ctx, a, b), rng = ctx.rng;
      /* 知らせてくれる住人：その場にいて、浮気の二人でなく、{a}を信頼している人 */
      var tl = null, tv = 15;
      ctx.present().forEach(function (o) { if (o === a || o === b || o === d) return; var v = ctx.R(o, a).aff + ctx.R(o, a).trust * 0.5; if (v > tv) { tv = v; tl = o; } });
      var how;
      if (!h.lied && b.tr.honesty > 0.62 && h.hides >= 1 && rng() < 0.55) how = 'self';
      else if (BD.bonded(ctx, a, b) && sx(a) === 'o' && nose(d) && rng() < 0.6) how = 'bond';
      else if (nose(a) && nose(d) && rng() < 0.55) how = 'scent';
      else if (here(d) && d.tr.aggr > 0.6 && rng() < 0.45) how = 'flaunt';
      else if (tl && rng() < 0.55) how = 'told';
      else how = 'proof';
      h.st = 'found'; h.how = how; h.last = ctx.stepIndex;
      var t = (h.lied ? ctx.pick(LIE_AGAIN) : '') + ctx.pick(FOUND[how]);
      ctx.stress(a, 25);
      ctx.mod2(a, b, { ten: 14, trust: -14 - (h.lied ? 12 : 0) }, { ten: 8 });
      if (how !== 'self' && here(d)) ctx.mod(a, d, { ten: 18, aff: -15, trust: -15 });
      if (how === 'told' && tl) ctx.mod2(a, tl, { trust: 4 }, { trust: 3 });
      var HOW = { self: b.name + 'が自分から打ち明けようとした（本音の出やすさ ' + Math.round(b.tr.honesty * 100) + '）', bond: '番の絆で、' + a.name + 'が' + d.name + 'の匂いに気づいた', scent: a.name + 'は' + OM.SEX[sx(a)] + '。' + d.name + 'の匂いに気づいた', flaunt: d.name + 'が見せつけた（攻撃性 ' + Math.round(d.tr.aggr * 100) + '）', told: (tl ? tl.name : '') + 'が' + a.name + 'に知らせた', proof: 'スマホ・レシートから' };
      var withL = how === 'told' && tl ? [tl] : how === 'flaunt' ? [d] : null;
      return { text: fill(ctx, t, a, b, { d: d, t: tl, rel: rel }), why: b.name + 'が隠していた' + d.name + 'とのことが、' + rel + 'の' + a.name + 'に知られた（' + HOW[how] + '）' + (h.lied ? '／一度ついた嘘がばれた' : ''), with: withL, mag: 30 };
    }
  });

  /* ---------- 3. 言い訳か告白（{a}＝隠していた側、{b}＝恋人・番） ---------- */
  var EXCUSE = {
    CP: L('{a}は眉ひとつ動かさずに言った。「考えすぎだって。{d}とは仕事の話をしてただけ｜考えすぎだ。{d}とは仕事の話をしていただけだ｜考えすぎです。{d}とは仕事の話をしていただけです」言い切る声は強かったが、{b}の目は見なかった。'),
    NP: L('{a}は{b}の手を取って言った。「心配させてごめん。{d}が落ち込んでて、話を聞いてただけなんだ｜心配させてすまない。{d}が落ち込んでいて、話を聞いていただけだ｜心配させてごめんなさい。{d}が落ち込んでいて、話を聞いていただけなんです」優しい声のまま、{a}は嘘を重ねた。'),
    A: L('{a}は落ち着いた声で、順を追って説明した。その日の予定、会った時間、別れた時間。筋は通っていた。通りすぎていた。'),
    FC: L('{a}は「えー、なにそれ｜何だ、それは｜えっ、それは何ですか」と大げさに笑ってみせた。「{d}とはただの飲み友達だって！｜{d}とはただの飲み友達だ！｜{d}とはただの飲み友達です！」笑い声だけが、部屋の中で浮いていた。'),
    AC: L('{a}は消え入りそうな声で言った。「ちがう、の。そういうのじゃなくて……｜違う。そういうことでは、なくて……｜ちがう、んです。そういうのじゃ、ないんです……」言葉が続かず、{a}はそれ以上何も言えないままうつむいた。')
  };
  var EXCUSE_SCENT = L('「満員電車で、誰かの匂いが移っただけ｜満員電車で、誰かの匂いが移っただけだ｜満員電車で、誰かの匂いが移っただけです」――{a}はそう言った。αとΩの鼻の前で、それがどれほど苦しい言い訳か、{a}自身がいちばん分かっていた。{b}は、何も言わずに{a}を見ていた。');
  var EXCUSE_HEAT = L('「{d}が発情期で倒れてて、介抱しただけ｜{d}が発情期で倒れていて、介抱しただけだ｜{d}が発情期で倒れていて、介抱しただけです」――{a}の言い訳には、半分だけ本当が混ざっていた。残りの半分を、{a}は飲み込んだ。{b}の視線が、{a}の首筋のあたりで止まった。');
  var BELIEVE = L('{b}は、しばらく黙ってから頷いた。「……うん。信じる｜……ああ。信じる｜……はい。信じます」その言葉が本心かどうかは、{b}自身にも分からなかった。|{b}は小さく息を吐いて、「そっか｜そうか｜そうですか」とだけ言った。それ以上は訊かなかった。訊けなかった、のほうが正しかった。');
  var DOUBT = {
    nose: L('「嘘｜嘘だ｜嘘です」――{b}の声は静かだった。「匂いで分かる。言葉より先に｜＝｜言葉より先に、匂いで分かります」{a}の顔から、血の気が引いた。'),
    any: L('{b}は{a}の言葉を最後まで聞いてから、首を横に振った。「そういうことを訊いてるんじゃない｜そういうことを訊いているのではない｜そういうことを訊いているんじゃありません」{a}は、もう言い返せなかった。|{b}は黙って、{a}の前にスマホの画面を向けた。言い訳は、そこで終わった。{a}はようやく、本当のことを話しはじめた。')
  };
  var CONFESS = {
    CP: L('{a}は長い沈黙のあと、短く言った。「{slept}。言い訳はしない｜＝｜{slept}。言い訳はしません」まっすぐ{b}を見る目だけが、わずかに揺れていた。'),
    NP: L('{a}は{b}の前に座り、ゆっくりと言った。「{d}と、一晩過ごした。言えば傷つけると思うと、言い出せなかった｜＝｜{d}と、一晩過ごしました。言えば傷つけると思うと、言い出せませんでした」{a}は、責められるのを待つように目を伏せた。'),
    A: L('{a}は一度深く息を吸ってから、何があったかを全部話した。いつ、どこで、誰と。順序立てて話すことでしか、{a}は自分を保てなかった。'),
    FC: L('{a}は笑おうとして、失敗した。「ごめん、ほんとにごめん。{d}と……｜すまない、本当にすまない。{d}と……｜ごめんなさい。{d}と……本当に、ごめんなさい」そこから先は、泣き声に紛れて言葉にならなかった。'),
    AC: L('{a}は床に膝をついた。「ごめん。{d}と、一緒に夜を過ごした｜すまない。{d}と、一緒に夜を過ごした｜ごめんなさい。{d}と、一緒に夜を過ごしました」声は震えていたが、{a}は最後まで目を逸らさなかった。')
  };
  var HEAR = {
    CP: L('{b}は黙って聞いていた。握りしめた拳だけが、白くなっていた。'),
    NP: L('{b}は唇を噛んで、それでも最後まで{a}の話を遮らなかった。'),
    A: L('{b}は表情を変えずに聞き、「少し、考えさせて｜少し、考えさせてくれ｜少し、考えさせてください」とだけ言った。'),
    FC: L('{b}は「は？」と言ったきり、しばらく動かなかった。それから、ぼろぼろと泣き出した。'),
    AC: L('{b}は「そっか｜そうか｜そうですか」と小さく言って、笑おうとした。笑えなかった。')
  };
  EV.push({
    id: 'om_hide_answer', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var h = cur(ctx, a, b); return !!h && h.st === 'found' && ready(ctx, h) && here(a) && here(b); },
    w: function () { return 9; },
    run: function (ctx, a, b) {
      if (ctx.pair(a, b).omHide.by !== a.i) { var x0 = a; a = b; b = x0; }
      var h = ctx.pair(a, b).omHide, d = ctx.chars[h.with], rel = relWord(ctx, a, b), rng = ctx.rng, rab = ctx.R(a, b);
      h.last = ctx.stepIndex;
      /* 告白するか：本音の出やすさ・NP・AC（罪悪感）・恋人への想い。CPが高いほど、失うのが怖いほど（嫉妬深い恋人）言い訳に逃げる。
         自分から切り出した・二度目の発覚・人から聞かれた・見せつけられたあとは、言い訳が通りにくい */
      var conf = a.tr.honesty * 0.8 + a.tr.np * 0.2 + a.tr.ac * 0.15 + a.stress / 400 + rab.trust / 400 - a.tr.cp * 0.4 - b.tr.jealous * 0.25 + (h.how === 'flaunt' || h.how === 'told' ? 0.2 : 0);
      var t, why;
      if (h.how === 'self' || h.lied || conf > 0.3 + rng() * 0.5) {
        t = ctx.pick(CONFESS[top(a)] || CONFESS.NP) + ctx.pick(HEAR[top(b)] || HEAR.NP);
        h.st = 'told'; h.confessed = true;
        ctx.mod2(a, b, { trust: 4, ten: 4 }, { ten: 10, trust: -8, aff: -6 });
        why = a.name + 'は' + d.name + 'とのことを打ち明けた（本音の出やすさ ' + Math.round(a.tr.honesty * 100) + '・NP ' + Math.round(a.eg.NP) + '）' + (h.lied ? '／もう嘘はつけなかった' : '');
        return { text: fill(ctx, t, a, b, { d: d, rel: rel }), why: why, mag: 24 };
      }
      var ex = h.via === 'heat' && rng() < 0.6 ? EXCUSE_HEAT : (h.how === 'scent' || h.how === 'bond') && rng() < 0.6 ? EXCUSE_SCENT : (EXCUSE[top(a)] || EXCUSE.NP);
      t = ctx.pick(ex);
      /* 言い訳を信じるか：信頼・NP。Aが高い・嫉妬深い・匂いで気づいた・人から聞いたなら見抜く */
      var bel = ctx.R(b, a).trust / 100 + b.tr.np * 0.3 + b.tr.ac * 0.15 - b.tr.a * 0.35 - b.tr.jealous * 0.25 - (h.how === 'scent' || h.how === 'bond' ? 0.3 : 0) - (h.how === 'told' || h.how === 'flaunt' ? 0.25 : 0);
      if (bel > 0.15 + rng() * 0.4) {
        t += ctx.pick(BELIEVE);
        h.st = 'hide'; h.lied = 1; h.sus = 15; h.hides = 1; h.at = ctx.stepIndex;
        ctx.mod2(a, b, { ten: 6 }, { ten: 6, trust: -4 });
        ctx.stress(a, 12);
        why = a.name + 'は言い訳をした（' + top(a) + '優位）。' + b.name + 'は信じることにした（信頼 ' + Math.round(ctx.R(b, a).trust) + '）';
        return { text: fill(ctx, t, a, b, { d: d, rel: rel }), why: why, mag: 18 };
      }
      t += ctx.pick(nose(b) && (h.how === 'scent' || h.how === 'bond') ? DOUBT.nose : DOUBT.any);
      h.st = 'told'; h.caught = true;
      ctx.mod2(a, b, { ten: 8 }, { ten: 14, trust: -14, aff: -8 });
      why = a.name + 'は言い訳をしたが、' + b.name + 'に見抜かれた（' + (b.tr.a > 0.6 ? '観察眼 A ' + Math.round(b.eg.A) : nose(b) ? OM.SEX[sx(b)] + 'の鼻' : '嫉妬・執着 ' + Math.round(b.tr.jealous * 100)) + '）';
      return { text: fill(ctx, t, a, b, { d: d, rel: rel }), why: why, mag: 24 };
    }
  });

  /* ---------- 4. 修復か破局（{a}＝恋人・番、{b}＝隠していた側） ---------- */
  var MEND = {
    CP: L('{a}は長いこと黙っていた。それから{b}の目を見て、「次はないから。{d}とは二度と会わないで｜次はない。{d}とは二度と会うな｜次はありません。{d}とは二度と会わないでください」と言った。条件つきの許しだった。それでも{b}は、深く頭を下げた。|' +
      '{a}は「一回だけだ｜＝｜一回だけです」と言った。許すのは一回だけ、という意味だった。{b}はその重さを、黙って受け取った。'),
    NP: L('{a}は泣き腫らした目で、{b}を抱きしめた。「許したわけじゃない。でも、手を離したくない｜許したわけではない。だが、手を離したくない｜許したわけではありません。でも、手を離したくないんです」腕は、痛いほど強かった。|' +
      '{a}は{b}の頬に触れて、「隠してるあいだも、苦しかったんでしょ｜隠しているあいだも、苦しかったのだろう｜隠しているあいだも、苦しかったんでしょう」と言った。{b}はその言葉で、ようやく泣くことができた。二人は、朝まで話をした。'),
    A: L('{a}は何日もかけて考え、それから{b}と向かい合った。「何が足りなかったのか、二人で考えたい｜＝｜何が足りなかったのか、二人で考えたいです」責めるより先に、{a}は話し合うことを選んだ。{b}は、黙って頷いた。|' +
      '{a}は紙に「これから」とだけ書いて、{b}の前に置いた。二人はそこに、守ることを一つずつ書き足していった。最後の一行は、{b}が書いた。'),
    FC: L('{a}は泣いて、怒って、クッションを三回投げつけて、最後に「お腹すいた」と言った。二人は黙って、夜中のラーメンを食べに行った。それが、{a}なりの「もう一回」だった。|' +
      '{a}は「罰として、一か月ずっと朝ごはん当番ね｜罰として、一か月ずっと朝ごはん当番だ｜罰として、一か月ずっと朝ごはん当番ですよ」と言った。目は真っ赤だった。{b}は「一年でいい｜＝｜一年でいいです」と答えて、{a}を少しだけ笑わせた。'),
    AC: L('{a}は「怒ってないよ｜怒っていない｜怒っていません」と言った。本当は怒っていたし、怖かった。それでも{a}は、{b}のいない毎日のほうがもっと怖かった。|' +
      '{a}は{b}の袖をつまんで、「もう、どこにも行かない？｜もう、どこにも行かないか？｜もう、どこにも行きませんか？」と訊いた。{b}が「行かない｜＝｜行きません」と答えるまで、{a}は袖を離さなかった。答えを聞いてから、{a}は声を上げて泣いた。')
  };
  var MEND_BOND = L('{a}は{b}の首筋に顔を埋め、{d}の匂いを上書きするように、しばらく離れなかった。番の匂いが、少しずつ元に戻っていった。|番の契りは、こんなことでは解けない。それが救いなのか呪いなのか、{a}にはまだ分からなかった。');
  var BREAK = {
    CP: L('{a}は{b}の荷物を、玄関の外にまとめて出した。「出てって｜出ていけ｜出ていってください」とだけ言って、扉を閉めた。鍵をかける音が、やけに大きく響いた。'),
    NP: L('{a}は最後まで、{b}を責めなかった。「もう、一緒にはいられない｜＝｜もう、一緒にはいられません」――そう言った声だけが、ひどく優しかった。{b}には、その優しさがいちばん苦しかった。'),
    A: L('{a}は冷静だった。合鍵を返してもらう日と、荷物を引き取る日を淡々と決めた。全部決め終わってから、{a}は一人で長いこと泣いた。'),
    FC: L('「よりによって、{d}と｜よりによって、{d}とか｜よりによって、{d}とですか」――{a}はそう言って笑った。笑いながら泣いていた。その夜、二人は終わった。'),
    AC: L('{a}は「何が足りなかったのかな｜何が足りなかったのだろう｜何が足りなかったんでしょう」と言いかけて、やめた。代わりに、指輪をそっとテーブルに置いた。{b}が顔を上げたとき、{a}はもう玄関に向かっていた。')
  };
  var BREAK_LIE = L('許せなかったのは、ほかの人と過ごした夜より、そのあとの嘘のほうだった。|嘘をつかれた日々ごと、{a}は{b}を手放した。');
  EV.push({
    id: 'om_hide_end', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var h = cur(ctx, a, b); return !!h && h.st === 'told' && ready(ctx, h) && here(a) && here(b); },
    w: function () { return 9; },
    run: function (ctx, a, b) {
      if (ctx.pair(a, b).omHide.by === a.i) { var x0 = a; a = b; b = x0; }
      var pf = ctx.pair(a, b), h = pf.omHide, d = ctx.chars[h.with], om = ctx.om, r = ctx.R(a, b), rel = relWord(ctx, a, b), bond = BD.bonded(ctx, a, b);
      h.last = ctx.stepIndex;
      /* 続けるか：好意・信頼・NP・AC（見捨てられたくない）・番の絆・本命・目標「番を見つけたい」。CP・嫉妬深さ・嘘・何度も会っていた・目標「誰にも縛られたくない」は別れに傾く。
         発情期の勢いだった（匂いに抗えなかった）なら、少し許しやすい */
      var keep = (r.aff - 40) * 0.6 + (r.trust - 30) * 0.4 + a.tr.np * 30 + a.tr.ac * 15 - a.tr.cp * 30 - a.tr.jealous * 35 + (bond ? 25 : 0)
        + (a.honmei === b.i ? 30 : 0) + (a.goal && a.goal.id === 'mate' ? 10 : 0) - (a.goal && a.goal.id === 'free' ? 15 : 0)
        + (h.confessed ? 15 : 0) - (h.caught ? 15 : 0) - (h.lied ? 20 : 0) - (h.times - 1) * 12 + (h.via === 'heat' ? 12 : 0) + (ctx.R(b, a).att > 50 ? 8 : 0) - 30;
      var parts = [];
      if (keep > ctx.rng() * 80 * HK.Dark.f(ctx, 'breakup')) {
        h.st = 'mend'; pf.forgiven = (pf.forgiven || 0) + 1;
        parts.push(ctx.pick(MEND[top(a)] || MEND.NP));
        if (bond && nose(a)) parts.push(ctx.pick(MEND_BOND));
        ctx.mod2(a, b, { trust: -10, ten: 4, aff: 2 }, { trust: 10, aff: 6, ten: -4 });
        /* 浮気の相手とは、距離を置く */
        if (here(d)) { ctx.mod2(b, d, { att: -22, aff: -6 }, { ten: 6 }); ctx.pair(b, d).lastSteal = ctx.stepIndex + 6; }
        return { cat: 'romance', text: fill(ctx, parts.join(''), a, b, { d: d, rel: rel }), why: a.name + 'は' + b.name + 'とやり直すことを選んだ（好意 ' + Math.round(r.aff) + '・信頼 ' + Math.round(r.trust) + (bond ? '・番の絆' : '') + (a.honmei === b.i ? '・本命' : '') + (h.confessed ? '・打ち明けてくれた' : '') + '）', mag: 30 };
      }
      h.st = 'end';
      parts.push(h.lied || h.caught ? ctx.pick(BREAK_LIE) : '');
      parts.push(ctx.pick(BREAK[top(a)] || BREAK.NP));
      pf.couple = false; pf.broke = 'cheat'; pf.cheatBy = b.i; pf.brokeAt = ctx.stepIndex;
      ctx.mod2(a, b, { aff: -26, ten: 20, trust: -35 }, { aff: -6, ten: 10 });
      ctx.stress(a, 20); ctx.stress(b, 20);
      if (here(d)) { ctx.pair(b, d).stolenFrom = a.i; ctx.pair(b, d).stealer = d.i; }
      om.cheatEnd = { a: a.i, b: b.i, at: ctx.stepIndex + 6 };
      var text = fill(ctx, parts.join(''), a, b, { d: d, rel: rel });
      if (bond && BD.ao(a, b)) {
        var A = BD.alpha(a, b), O = BD.omega(a, b);
        BD.abandon(ctx, A, O, 'cheat');
        text += OM.fill(ctx, '番の契りは、別れても解けない。{b}のうなじには、{a}の噛み跡が残ったままだ。', A, O);
      }
      return { text: text, why: a.name + 'は' + b.name + 'と別れた（' + (h.lied || h.caught ? '嘘をつかれた' : '打ち明けられても許せなかった') + '／CP ' + Math.round(a.eg.CP) + '・嫉妬・執着 ' + Math.round(a.tr.jealous * 100) + (h.times > 1 ? '・何度も会っていた' : '') + '）', mag: 40 };
    }
  });

  /* ---------- 5. やり直しの一歩（{a}＝隠していた側、{b}＝恋人・番） ---------- */
  var REBUILD = {
    CP: L('{a}は、{b}が訊く前に、自分から予定を話すようになった。ぶっきらぼうな報告は、毎晩欠かさず続いた。{b}は「わかった｜分かった｜分かりました」と返しながら、少しだけ笑うようになった。'),
    NP: L('{a}は{b}の好きな店を予約し、何も言わずに{b}の手を引いた。食事のあいだ、二人は昔話ばかりした。帰り道、{b}のほうから{a}の手を握り返した。'),
    A: L('{a}はスマホのロックを外し、{b}にいつでも見ていいと言った。{b}は一度も見なかった。見なくていいと思えるようになるまで、少し時間がかかっただけだった。'),
    FC: L('{a}は「やり直し記念日」と書いたケーキを買ってきた。{b}は「何それ｜何だ、それは｜それは何ですか」と呆れながら、いちばん大きいところを取った。二人の笑い声が、久しぶりに部屋に戻ってきた。'),
    AC: L('{a}は毎朝、{b}に「おはよう｜＝｜おはようございます」と送り続けた。返事が来ない日もあった。ある朝、{b}から「おはよう。今日、早く帰れる？｜おはよう。今日は、早く帰れるか？｜おはようございます。今日、早く帰れますか？」と返ってきて、{a}は駅のホームで泣きそうになった。')
  };
  var REBUILD_BOND = L('ある夜、{b}は自分から髪をかき上げて、うなじの噛み跡を{a}に見せた。{a}はそこにそっと額を当てて、長いこと動かなかった。噛み跡は、もう痛まなかった。');
  EV.push({
    id: 'om_hide_rebuild', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var h = cur(ctx, a, b); return !!h && h.st === 'mend' && ready(ctx, h, 2) && here(a) && here(b) && HK.canLove(a, b) && HK.canLove(b, a); },
    w: function () { return 6; },
    run: function (ctx, a, b) {
      if (ctx.pair(a, b).omHide.by !== a.i) { var x0 = a; a = b; b = x0; }
      var h = ctx.pair(a, b).omHide;
      h.st = 'done'; h.last = ctx.stepIndex;
      var bondO = BD.bonded(ctx, a, b) && sx(b) === 'o' && ctx.rng() < 0.5;
      var t = bondO ? ctx.pick(REBUILD_BOND) : ctx.pick(REBUILD[top(a)] || REBUILD.NP);
      ctx.mod2(a, b, { trust: 8, aff: 5 }, { trust: 12, aff: 6, ten: -8 });
      ctx.stress(a, -12); ctx.stress(b, -8);
      return { text: fill(ctx, t, a, b, { d: ctx.chars[h.with] }), why: '隠しごとのあと、' + a.name + 'と' + b.name + 'はやり直している（' + top(a) + '優位の' + a.name + 'なりの償い）', mag: 20 };
    }
  });

  /* ---------- 発情期：番・恋人のいる人は、ほかの人の発情期に踏みとどまることがある。越えてしまえば、隠しごとが始まる ---------- */
  var HEAT_RESIST = {
    x: L('{a}は{b}の匂いに足を止めかけて、ポケットの中のスマホを握りしめた。待ち受けの{c}が笑っていた。{a}は抑制剤を{b}の手に押しつけ、振り返らずに部屋を出た。|' +
      '{a}は自分の腕に爪を立てて、{b}から距離を取った。頭に浮かんだのは、{c}の顔だった。{a}は扉の外から救急に電話をかけ、到着するまでそこを動かなかった。|' +
      '{a}は{b}の部屋の前で立ち止まり、ドアノブから手を離した。この扉を開けたら、{c}に二度と同じ顔で会えない。{a}は廊下の端まで下がって、{b}の友人に連絡を回した。|' +
      '{a}は息を止めたまま、{b}に背を向けた。「ごめん。私には{c}がいる｜すまない。私には{c}がいる｜ごめんなさい。私には{c}がいます」――そう言って、{a}は自分の上着を扉の隙間から差し入れ、足早に階段を下りた。')
    ,
    o: L('{b}は熱に浮かされながら、{a}の手を押し返した。「だめ……{c}がいる｜駄目だ……{c}がいる｜だめです……{c}がいるんです」{a}は唇を噛み、扉の外から抑制剤を差し入れた。|' +
      '{b}は{a}に背を向けて、震える指で{c}に電話をかけた。「迎えに来て｜迎えに来てくれ｜迎えに来てください」――その声を聞いて、{a}は黙って部屋を出た。扉を閉める手が、少しだけ震えていた。|' +
      '{b}は自分の手首を噛んで、熱を痛みでごまかした。「来ないで｜来るな｜来ないでください」と言う声は掠れていた。{a}は一歩も近づかないまま、{c}が来るまで扉の外で待った。|' +
      '{b}は{a}の匂いから逃げるように、浴室に鍵をかけて閉じこもった。冷たいシャワーの音が、いつまでも止まなかった。{a}はその音を聞きながら、{c}に「迎えに来てやって｜迎えに来てやってくれ｜迎えに来てあげてください」と送った。')
  };
  EV.forEach(function (e) {
    if (e.id !== 'om_heat' || e._secret) return;
    e._secret = true;
    var r0 = e.run;
    e.run = function (ctx, a, b) {
      var O = sx(a) === 'o' && a.om.heat > 0 ? a : sx(b) === 'o' && b.om.heat > 0 ? b : sx(a) === 'o' ? a : b, X = O === a ? b : a;
      var pX = partnerOf(ctx, X), pO = partnerOf(ctx, O);
      pX = pX && pX !== O ? pX : null; pO = pO && pO !== X ? pO : null;
      var mate = BD.mateOf(ctx, O);
      if ((pX || pO) && !(mate && mate !== X) && ctx.R(X, O).att > 25 && ctx.R(O, X).att > 25) {
        var holder = pX ? X : O, part = pX || pO, other = holder === X ? O : X, rh = ctx.R(holder, part);
        var hold = rh.aff + rh.trust * 0.6 + (holder.tr.cp + holder.tr.ac) * 20 - ctx.R(holder, other).att - holder.tr.impulse * 25 - (ctx.env.heat || 50) * 0.4 + OM.loyalty(ctx, holder, part, other);
        if (!OM.affairOk(ctx, X, O) || hold > ctx.rng() * 90) {
          ctx.mod2(X, O, { trust: 4 }, { trust: 5 });
          ctx.mod(holder, part, { aff: 3, trust: 2 });
          /* 同じ回の中で同じ文を繰り返さない（順に回す） */
          var RL = holder === X ? HEAT_RESIST.x : HEAT_RESIST.o, ri = ctx.om._heatResist = (ctx.om._heatResist == null ? Math.floor(ctx.rng() * 4) : ctx.om._heatResist + 1);
          var t = OM.sc(ctx.t(RL[ri % RL.length].replace(/俺／私/, X.tr.cp + X.tr.fc > 1 ? '俺' : '私'), X, O, part), X, O);
          return { cat: 'help', text: t, why: '発情期（' + O.name + '）。' + holder.name + 'には' + relWord(ctx, holder, part) + '（' + part.name + '）がいる' + (holder.honmei === part.i ? '／本命' : '') + (OM.affairOk(ctx, X, O) ? '' : '／体の関係にならない組') + '。踏みとどまった', with: [part], mag: 14 };
        }
      }
      var n0 = ctx.pair(X, O).nights || 0;
      var res = r0.apply(this, arguments);
      if ((ctx.pair(X, O).nights || 0) > n0 && (pX || pO)) {
        if (pX) S.start(ctx, X, pX, O, 'heat');
        if (pO) S.start(ctx, O, pO, X, 'heat');
      }
      return res;
    };
  });
  /* 古い「浮気が恋人に知られる」は、隠しごとの流れが始まった組では起こさない */
  EV.forEach(function (e) {
    if (e.id !== 'om_cheat_found' || e._secret) return;
    e._secret = true;
    var w0 = e.when;
    e.when = function (ctx, a, b) { if (ctx.pair(a, b).omHide) return false; return w0.apply(this, arguments); };
  });

  /* ---------- 止まっている段を進める ----------
     二人が同じ場面になかなか選ばれないと、発覚のまま・告白のままで結末が来てしまう。区切りの終わりに、前の段から3区切り（隠すは4区切り）以上あいていれば、次の段を起こす */
  var NEXT = { hide: 'om_hide_found', found: 'om_hide_answer', told: 'om_hide_end', mend: 'om_hide_rebuild' };
  function evById(id) { for (var i = 0; i < EV.length; i++) if (EV[i].id === id) return EV[i]; return null; }
  function nudge(ctx) {
    Object.keys(ctx.pf).forEach(function (k) {
      var pf = ctx.pf[k], h = pf.omHide;
      if (!h || !pf.couple || !NEXT[h.st] || ctx.stepIndex - h.last < (h.st === 'hide' ? 4 : 3)) return;
      var C = ctx.chars[h.by], P = ctx.chars[h.to], e = evById(NEXT[h.st]);
      if (!e || !here(C) || !here(P) || !e.when(ctx, C, P)) return;
      ctx.k = 1; ctx._mag = 0; ctx._touched = {};
      var res = e.run(ctx, C, P);
      if (!res || !res.text) return;
      var actors = [C, P];
      (res.with || []).forEach(function (x) { if (actors.indexOf(x) < 0) actors.push(x); });
      ctx.say({ kind: 'event', cat: res.cat || e.cat, actors: actors, text: res.text, why: res.why, mag: ctx._mag + (res.mag || 0) });
      ctx.flush();
    });
  }
  var af0 = scen.after;
  scen.after = function (ctx) { if (ctx.om && ctx.pf) nudge(ctx); return af0.apply(this, arguments); };

  /* ---------- 結末 ---------- */
  var E = OM.END_DEF;
  E.mended = ['隠しごとのあとで', '{b}は一度、{a}に隠しごとをした。{a}はそれを知ったうえで、もう一度{b}の手を取った。元通りではない。それでも二人は、同じ部屋に帰ってくる。'];
  if (OM.END_IDS.indexOf('mended') < 0) OM.END_IDS.push('mended');
  var end0 = BD.endingFor;
  BD.endingFor = function (ctx, a, b) {
    var pf = ctx.pair(a, b), h = pf.omHide;
    if (pf.couple && h && (h.st === 'done' || h.st === 'mend')) {
      var P = ctx.chars[h.to], C = ctx.chars[h.by], d = E.mended;
      return { id: 'mended', title: d[0], text: ctx.t(d[1], P, C), a: P.i, b: C.i };
    }
    return end0.apply(this, arguments);
  };
  /* 隠しごとの途中（隠す〜言い訳・告白）で結末を決めない（始まってから20区切りまで。やり直しの一歩まで待つ） */
  var check0 = BD.check;
  BD.check = function (ctx, last) {
    if (!last && !ctx.om.ending && Object.keys(ctx.pf).some(function (k) { var h = ctx.pf[k].omHide; return h && ctx.pf[k].couple && /^(?:hide|found|told|mend)$/.test(h.st) && ctx.stepIndex - h.at0 < 20; })) return false;
    return check0.apply(this, arguments);
  };
  /* 関係の一覧 */
  var cls0 = scen.classify, txt0 = scen.pairText;
  HK.LABELS.hidden = { name: '隠しごと', cls: 'pine', pol: 0 };
  scen.classify = function (ctx, A, B, pf) {
    var h = pf.omHide;
    if (pf.couple && h && /^(?:hide|found|told)$/.test(h.st)) return { id: 'hidden', dir: h.by };
    return cls0(ctx, A, B, pf);
  };
  scen.pairText = function (ctx, A, B, cl) {
    var pf = ctx.pair(A, B), h = pf.omHide;
    if (cl.id === 'hidden' && h) return ctx.chars[h.by].name + 'は、ほかの人とのことを' + ctx.chars[h.to].name + 'に隠している。';
    if (h && (h.st === 'done' || h.st === 'mend') && pf.couple) { var t = txt0(ctx, A, B, cl); return (t || '') + '一度は隠しごとで揺れたが、やり直している。'; }
    return txt0(ctx, A, B, cl);
  };
})();
