/* 箱庭シミュレーター: 失恋（好きだった相手が誰かと付き合いだした／告白してふられた／相手としか恋愛しない人を好きになった）
   ・知る：想う相手が、ほかの誰かと恋人になったと知る（恋愛相手を固定している人を好きになった場合は、相手の心が決まっていると思い知る）
   ・ふられたあと：告白して断られたあと（unreq.js の告白）、ひとりで受け止める
   ・慰め：親しい人が、黙ってそばにいる
   ・迫る：強引な人（攻撃性・衝動性・CP が高い）は、諦めきれずに相手に迫って自分のものにしようとし、恋敵に阻まれる
   ・ふっきる：時間がたって、少しだけ前を向く
   合コン・クラスメイト・無人島・出られない部屋・ゾンビの街・オメガバースで起きる。{a}=失恋した人 {b}=想っていた相手 {c}=恋敵（相手の恋人・想い人） {d}=慰める人
   「恋愛・R18にしない相手」に印を付けた組では起きない（恋愛相手の固定のほうは、この「叶わない恋」の理由として扱う） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function alive(c) { return c && c.alive !== false && !c.out; }
  function has(ctx, a, b, ty) { return HK.Ties ? HK.Ties.has(ctx, a, b, ty) : null; }
  function couple(ctx, a, b) { return !!ctx.pair(a, b).couple || !!(has(ctx, a, b, 'lover') || has(ctx, a, b, 'mate') || has(ctx, a, b, 'fated')); }
  /* キャラの設定で「恋愛・R18にしない」と印を付けた組（固定のほうは含めない） */
  function marked(a, b) { return !!((a.ng && a.ng.indexOf(b.i) >= 0) || (b.ng && b.ng.indexOf(a.i) >= 0)); }
  /* a が b を想っているか（b の側の事情は見ない：b がほかの人に決めていても、a の想いは成り立つ） */
  function longs(ctx, a, b) {
    if (!alive(a) || !b || a === b || marked(a, b) || ctx.pair(a, b).kin) return false;
    if (a.lock != null && a.lock !== b.i) return false;
    var b0 = {}; for (var k in b) b0[k] = b[k]; b0.lock = null; b0.ng = [];
    if (!HK.canLove(a, b0)) return false;
    return !!(HK.Ties && HK.Ties.from(ctx, a, b, 'crush')) || ctx.R(a, b).att >= 50;
  }
  /* b の心が決まっている相手（恋人、または b が恋愛相手を固定した人）。a 以外 */
  function rivalOf(ctx, a, b) {
    var best = null;
    ctx.chars.forEach(function (c) {
      if (best || c === a || c === b || !alive(c)) return;
      if (couple(ctx, b, c) || b.lock === c.i) best = c;
    });
    return best;
  }
  /* 告白して断られたか（unreq.js の告白：pf.uconf、実らなかった） */
  function rejected(ctx, a, b) { var pf = ctx.pair(a, b); return !!pf.uconf && !pf.couple; }
  function forceful(a) { var t = a.tr; return t.aggr > 0.55 || (t.cp > 0.6 && t.impulse > 0.5) || (t.impulse > 0.65 && t.ac < 0.4); }
  function friendOf(ctx, a, b, c) {
    var best = null, bv = 12;
    ctx.others(a).forEach(function (d) {
      if (d === b || d === c || !alive(d)) return;
      var v = ctx.R(d, a).aff + ctx.R(d, a).trust * 0.5;
      if (v > bv) { bv = v; best = d; }
    });
    return best;
  }
  function sc(ctx, tbl) { return tbl[ctx.scen.id] || tbl.any; }

  var D = HK.HEARTBREAK = {
    /* 想う相手が、ほかの誰かと恋人になったと知る */
    news: {
      goukon: L('{b}と{c}が、テーブルの下で手を繋いでいるのが見えた。{a}はグラスに残った酒を一息に飲み干した。味は、しなかった。|店を出る前、{b}が{c}の腕に自分の腕を絡めた。「この二人、付き合うことになったんだって」と誰かが囃した。{a}は笑って拍手をした。手のひらが、やけに痛かった。|{c}が{b}の耳元で何か囁き、{b}が嬉しそうに頷いた。それだけで、{a}にはすべて分かった。'),
      classroom: L('昼休み、{b}と{c}が付き合い始めたという噂が、教室じゅうを駆け巡った。{a}は弁当の蓋を閉めた。もう、一口も入らなかった。|放課後、昇降口で{b}と{c}が並んで帰っていくのが見えた。{a}は靴を履き替える手を止めて、二人の背中が見えなくなるまで動けなかった。|{b}のスマホの待ち受けが、{c}との写真に変わっていた。{a}は見なかったふりをして、窓の外を眺めた。'),
      island: L('朝、{b}と{c}が同じ寝床から出てくるのを、{a}は見てしまった。{a}は何も言わずに、薪を拾いに森へ入った。|焚き火の向こうで、{b}が{c}の肩に頭を預けていた。{a}は火の粉を見つめたまま、胸の奥が焼けるのを黙って耐えた。|{c}が{b}の髪についた砂を払ってやっていた。その手つきの優しさに、{a}はもう自分の入る場所がないことを知った。'),
      whiteroom: L('{b}と{c}が、部屋の隅で額を寄せ合って笑っていた。逃げ場のない白い部屋で、{a}は目を逸らす場所さえ見つけられなかった。|{b}が{c}の手を取り、「出られたら、一緒にいよう」と言うのが聞こえた。{a}は膝を抱えて、壁の継ぎ目を数え続けた。|{c}が{b}を抱き寄せた。{b}は少しも嫌がらなかった。{a}は、二人がそういう仲になったことを、その瞬間に知った。'),
      zombie: L('見張りの交代のとき、{b}と{c}が指を絡めて眠っているのを、{a}は見てしまった。{a}は銃を握り直して、窓の外の暗がりだけを見つめた。|「明日も一緒にいよう」――{b}が{c}にそう言うのが、薄い壁越しに聞こえた。{a}は、自分の毛布を頭までかぶった。|{c}が怪我をした{b}を背負って戻ってきた。{b}が{c}の首に回した腕を、{a}はいつまでも見ていた。'),
      omega: L('{b}のうなじに、{c}の噛み跡を見つけた。{a}は思わず目を伏せた。もう、自分が入り込める場所はなかった。|{b}と{c}が、同じ匂いをまとって部屋から出てきた。{a}は何も気づかないふりをして、挨拶だけをした。|{c}の隣で、{b}が見たことのない顔で笑っていた。{a}はその笑顔を、遠くから見ていることしかできなかった。'),
      any: L('{b}と{c}が恋人になったと知ったとき、{a}は「よかったね」と笑った。笑えている自分が、少しだけ怖かった。|{b}が{c}の隣で幸せそうにしているのを見て、{a}はそっとその場を離れた。誰にも、顔を見られたくなかった。')
    },
    /* 相手としか恋愛しない人（恋愛相手を固定）を好きになった：心が決まっていると思い知る */
    lockNews: L('{b}の目は、いつも{c}だけを追っていた。どれだけ近くにいても、自分は一度もその目に映っていない――{a}はそれを、とうとう認めるしかなかった。|{a}が冗談めかして{b}を誘うと、{b}は迷いもせずに首を振った。「ごめん。{c}以外は、考えたことない」――その言葉には、少しの隙間もなかった。|{b}が{c}の話をするときだけ、声の温度が変わることに、{a}はずっと前から気づいていた。気づかないふりをするのも、もう限界だった。'),
    /* ふられたあと、ひとりで受け止める */
    alone: L('{a}は誰もいないところまで歩いていって、そこでようやく泣いた。声を殺すのが、思っていたより難しかった。|{a}は何事もなかったように皆と話し、笑った。ただ、{b}の方だけは一度も見なかった。|{a}は、{b}にもらった何でもない言葉を、ひとつずつ思い出していた。どれも、もう意味を持たなかった。|夜、{a}は寝つけずに天井を見ていた。「好きだった」と口の中で言ってみると、思っていたより胸が痛んだ。'),
    aloneAt: {
      goukon: '帰りの電車の窓に映る自分の顔を、{a}はぼんやり眺めていた。',
      classroom: '{a}は屋上に出て、フェンスにもたれた。',
      island: '{a}は誰もいない浜辺に座って、波が足を洗うのに任せていた。',
      whiteroom: '{a}は壁の方を向いて横になり、毛布を頭までかぶった。',
      zombie: '{a}は見張りを買って出て、ひとりで暗い通りを見下ろしていた。',
      omega: '{a}は抑制剤の小瓶を指で転がしながら、ひとりで窓の外を見ていた。',
      any: ''
    },
    /* 慰め（{d}） */
    comfort: L('{d}は何も訊かずに、{a}の隣に座った。しばらくして、{a}の肩が小さく震えはじめた。{d}は、それが止まるまで黙ってそこにいた。|{d}は{a}に温かい飲み物を差し出した。「無理して笑わなくていいよ」――{a}は受け取ったまま、しばらく顔を上げられなかった。|「見る目ないな、あいつ」{d}がわざと明るく言うと、{a}は泣き笑いの顔で「そうでもないよ」と首を振った。|{d}は{a}の背中を、子どもをあやすように軽く叩いた。{a}は「……ありがと」とだけ言って、{d}の肩に額を預けた。'),
    /* 迫る：強引な人が、諦めきれずに相手を自分のものにしようとする */
    force: L('{a}は{b}の手首を掴んで、壁際に押しつけた。「{c}なんかより、私の方がずっと{b}を見てきた。……こっちを見て」――{b}が身をすくめた。|{a}は{b}の行く手を塞いだ。「{c}のどこがいいの。私にしなよ」――{b}は首を振ったが、{a}は掴んだ腕を離さなかった。|{a}は{b}を人目のないところへ引っ張っていった。「認めない。{b}は、私のものになるはずだった」――その目は、もう冗談を言っていなかった。'),
    block: L('「その手、離せ」――{c}が二人のあいだに割って入った。{c}は{b}を背中にかばい、{a}をまっすぐに睨んだ。{a}は手を離したが、{c}から目を逸らさなかった。|{c}が{a}の腕を掴んで、{b}から引き剥がした。「{b}が嫌がってるの、分からない？」――{b}は{c}の背中にしがみついた。{a}は唇を噛んで、二人に背を向けた。|駆けつけた{c}が、{b}を引き寄せた。{b}は{c}の胸に顔を埋めて、震えていた。その姿を見て、{a}はようやく、自分が何をしたのかに気づいた。'),
    /* ふっきる */
    letgo: L('{b}と{c}が並んで笑っているのを見ても、{a}の胸はもう、前ほどは痛まなかった。「お幸せに」と小さく呟いて、{a}は自分の場所へ戻った。|{a}は{b}への想いを、心のいちばん奥の引き出しにしまった。捨てることはできなかった。でも、しまうことはできた。|ある朝、{a}は{b}のことを考えずに目を覚ましている自分に気づいた。少しだけ寂しくて、少しだけほっとした。')
  };

  function mk(id, cat, w, when, run) { return { id: id, cat: cat, scope: 'pair', mini: true, sig: true, when: when, w: /^hb_(?:comfort|letgo)$/.test(id) ? w : function (ctx, a, b) { return w(ctx, a, b) * HK.Dark.f(ctx, 'heartbreak'); }, run: run }; }
  var LIST = HK.Heartbreak = [
    /* 知る：想う相手が、ほかの誰かと恋人になった（または心を決めていた） */
    mk('hb_news', 'solo', function () { return 4; },
      function (ctx, a, b) { return longs(ctx, a, b) && !ctx.pair(a, b).hbNews && !couple(ctx, a, b) && !!rivalOf(ctx, a, b); },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), c = rivalOf(ctx, a, b), lock = !couple(ctx, b, c) && b.lock === c.i, m = { a: a.name, b: b.name, c: c.name };
        pf.hbNews = ctx.stepIndex; pf.hbBy = c.i;
        if (HK.Emo) HK.Emo.bump(ctx, a, { grief: 30, shame: 12 }, '失恋');   /* 気分（emotion.js） */
        ctx.stress(a, 18); ctx.mod2(a, b, { att: -8 }, {}); ctx.mod(a, c, { ten: 8 });
        return { text: fill(ctx.pick(lock ? D.lockNews : sc(ctx, D.news)), m), why: a.name + 'は' + b.name + 'を想っていた（惹かれ ' + Math.round(ctx.R(a, b).att + 8) + '）。' + (lock ? b.name + 'の心は、' + c.name + 'にしか向いていない（恋愛相手の固定）' : b.name + 'は' + c.name + 'と恋人になった') + '――失恋', mag: 30, with: [b, c] };
      }),
    /* ふられたあと：ひとりで受け止める */
    mk('hb_alone', 'solo', function () { return 3; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return alive(a) && (rejected(ctx, a, b) || pf.hbNews != null) && !pf.hbAlone && !a.flags.unreqPersist; },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), m = { a: a.name, b: b.name };
        pf.hbAlone = true; ctx.stress(a, 10);
        return { text: fill(sc(ctx, D.aloneAt), m) + fill(ctx.pick(D.alone), m), why: a.name + 'の失恋（' + (pf.hbNews != null ? b.name + 'にはほかに想う人がいた' : b.name + 'に告白して、断られた') + '）', mag: 20 };
      }),
    /* 慰め */
    mk('hb_comfort', 'help', function (ctx, a) { return 2.4 + a.stress / 80; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return alive(a) && (pf.hbAlone || pf.hbNews != null) && !pf.hbComf && !!friendOf(ctx, a, b, pf.hbBy != null ? ctx.chars[pf.hbBy] : null); },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), d = friendOf(ctx, a, b, pf.hbBy != null ? ctx.chars[pf.hbBy] : null), m = { a: a.name, b: b.name, d: d.name };
        pf.hbComf = true; ctx.stress(a, -12); ctx.mod2(a, d, { trust: 10, aff: 8 }, { aff: 6 });
        return { text: fill(ctx.pick(D.comfort), m), why: d.name + 'は、' + a.name + 'の失恋に気づいていた（' + d.name + 'から' + a.name + 'への好意 ' + Math.round(ctx.R(d, a).aff) + '）', mag: 20, with: [d] };
      }),
    /* 迫る：強引な人は諦めきれずに迫り、恋敵に阻まれる */
    mk('hb_force', 'conflict', function (ctx, a) { return 3 + a.tr.aggr * 2 + a.tr.impulse; },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b);
        if (pf.hbForce || pf.hbNews == null || !forceful(a) || !alive(b)) return false;
        var c = rivalOf(ctx, a, b);
        return !!c && alive(c) && ctx.others(a).indexOf(c) >= 0 && ctx.R(a, b).att >= 30;
      },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), c = rivalOf(ctx, a, b), m = { a: a.name, b: b.name, c: c.name };
        pf.hbForce = true;
        ctx.mod2(a, b, { att: -6 }, { trust: -18, aff: -12, ten: 14 });
        ctx.mod2(a, c, { ten: 20 }, { ten: 22, aff: -10 });
        ctx.mod2(b, c, { trust: 12, att: 6 }, { trust: 6 });
        ctx.stress(a, 12); ctx.stress(b, 14);
        return { text: fill(ctx.pick(D.force), m) + fill(ctx.pick(D.block), m), why: a.name + 'は失恋を受け入れられず、' + b.name + 'に迫った（攻撃性・衝動性）。恋敵の' + c.name + 'が阻んだ', mag: 34, with: [b, c] };
      }),
    /* ふっきる */
    mk('hb_letgo', 'solo', function () { return 1.6; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return alive(a) && pf.hbNews != null && !pf.hbLet && ctx.stepIndex - pf.hbNews >= 2 && a.stress < 55; },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), c = pf.hbBy != null ? ctx.chars[pf.hbBy] : null, m = { a: a.name, b: b.name, c: c ? c.name : '' };
        pf.hbLet = true; ctx.mod2(a, b, { att: -14, aff: 4 }, {}); if (c) ctx.mod(a, c, { ten: -8 });
        return { text: fill(ctx.pick(D.letgo), m), why: a.name + 'は、' + b.name + 'への想いに区切りをつけはじめた', mag: 16 };
      })
  ];

  ['goukon', 'classroom', 'island', 'whiteroom', 'omega'].forEach(function (id) { if (HK.addMini) HK.addMini(id, LIST); });
  /* ゾンビの街：同じエリアにいる者どうしの出来事として足す */
  var Z = HK.ZB;
  if (Z && Z.scen) LIST.forEach(function (e) { var e2 = {}; for (var k in e) e2[k] = e[k]; e2.mini = false; Z.scen.events.push(e2); });
})();
