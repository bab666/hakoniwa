/* 箱庭シミュレーター: 相手にされていない片想い（一方通行の三角関係）
   片想いの「想われる側の気持ち」（興味がない・友達としか見ていない・苦手・ほかに好きな人がいる）や、
   惹かれの差が大きい組で起きる出来事。合コン・教室・無人島・出られない部屋・ゾンビの街で起きる。
   {a}=想う側、{b}=想われる側、{c}=想われる側が想っている相手（いれば） */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function has(ctx, a, b, ty) { return HK.Ties ? HK.Ties.has(ctx, a, b, ty) : null; }
  function couple(ctx, a, b) { return !!ctx.pair(a, b).couple || !!(has(ctx, a, b, 'lover') || has(ctx, a, b, 'mate') || has(ctx, a, b, 'fated')); }
  function alive(c) { return c && c.alive && !c.out; }

  var U = HK.Unreq = {};
  /* a が b に片想いしているか */
  U.crushOn = function (ctx, a, b) {
    if (!a || !b || a === b || couple(ctx, a, b)) return false;
    if (HK.Ties && HK.Ties.from(ctx, a, b, 'crush')) return true;
    if (has(ctx, a, b, 'crush') && !(HK.canLove(a, b) && ctx.R(a, b).att > 50)) return false;
    return HK.canLove(a, b) && ctx.R(a, b).att > 50;
  };
  /* b の心が向いている相手（a 以外）。設定された関係（恋人・b からの片想い・セフレ）を最優先する */
  U.heartOf = function (ctx, b, a) {
    var best = null, bv = 45;
    ctx.chars.forEach(function (o) {
      if (o === b || o === a) return;
      var v = ctx.R(b, o).att, cr = HK.Ties && HK.Ties.from(ctx, b, o, 'crush');
      if (couple(ctx, b, o)) v += 400;
      if (cr) v += 300;
      if (has(ctx, b, o, 'fwb') || has(ctx, b, o, 'almost') || has(ctx, b, o, 'ex')) v += 150;
      if (v > bv) { bv = v; best = o; }
    });
    return best;
  };
  /* b が a を相手にしていない理由（していなければ ''） */
  U.cold = function (ctx, a, b) {
    var t = HK.Ties && HK.Ties.from(ctx, a, b, 'crush');
    if (t && t.cold) return t.cold;
    /* 両片想い（b からも片想い）は、相手にされていない片想いではない（pining.js） */
    if (HK.Ties && HK.Ties.from(ctx, b, a, 'crush')) return '';
    if (ctx.R(b, a).att >= 20) return '';
    if (U.heartOf(ctx, b, a)) return 'other';
    if (ctx.R(b, a).ten > 30 || ctx.R(b, a).aff < -10) return 'dislike';
    return ctx.R(b, a).aff > 30 ? 'friend' : 'none';
  };
  U.unreq = function (ctx, a, b) { return U.crushOn(ctx, a, b) && !!U.cold(ctx, a, b); };
  var COLD_WHY = { none: '興味がない', friend: '友達としか見ていない', dislike: '苦手に思っている', other: 'ほかに好きな人がいる' };
  U.why = function (ctx, a, b) { var c = U.cold(ctx, a, b); return a.name + 'の片想い。' + b.name + 'は' + a.name + 'を' + (COLD_WHY[c] || '意識していない') + '（' + b.name + 'から' + a.name + 'への惹かれ ' + Math.round(ctx.R(b, a).att) + '）'; };

  /* ---------- 文 ---------- */
  var SCN = function (ctx) { return ctx.scen.id; };
  var D = U.TEXT = {
    /* 尽くす（場面ごと） */
    serve: {
      goukon: L('{a}は{b}のグラスが空く前に、次の一杯を頼んでいた。|{a}は{b}の話に、誰よりも大きく笑った。|{a}は自己紹介のあいだじゅう、{b}の方ばかり見ていた。|{a}は{b}の取り皿に、唐揚げをそっと一つ多くのせた。'),
      classroom: L('{a}は休み時間、用もないのに{b}の席の近くを通った。|{a}は{b}に、昨日の課題のノートを貸した。|{a}は購買で、{b}の好きなパンを買ってきた。「たまたま二つ買っちゃって」|{a}は{b}の消しゴムを拾って、三秒迷ってから渡した。'),
      island: L('{a}は一番大きな魚を、黙って{b}の前に置いた。|{a}は{b}のために、寝床の葉を余分に集めてきた。|{a}は{b}の隣で、一晩中火の番をした。|{a}は浜辺で見つけたきれいな貝殻を、{b}に渡した。'),
      whiteroom: L('{a}はさりげなく、{b}の隣に座り直した。|{a}は残り少ない水を、{b}に先に飲ませた。|{a}は退屈そうな{b}に、しりとりを持ちかけた。|{a}は自分の上着を、寒そうな{b}の肩にかけた。'),
      zombie: L('{a}は{b}の分の缶詰を、先に開けておいた。|{a}は{b}の擦り傷に、なけなしの消毒液を使った。|{a}は{b}の靴紐を、黙って結び直した。|{a}は{b}が眠れるように、毛布を一枚譲った。'),
      any: L('{a}は{b}に、そっと飲み物を差し出した。|{a}は{b}の話を、誰よりも熱心に聞いていた。')
    },
    /* 相手にされない（理由ごと） */
    brush: {
      none: L('{b}は「ありがと」とだけ言って、すぐに別の話を始めた。|{b}は{a}の方を見もせずに、生返事をした。|{b}は{a}の名前を、一度言い間違えた。|{b}は礼を言ったが、五分後にはもう忘れているようだった。'),
      friend: L('{b}は「ほんといい奴だな、お前」と{a}の背中を叩いた。それ以上の意味は、どこにもなかった。|{b}は「{a}みたいな友達がいてよかった」と、まっすぐに笑った。|{b}は無防備に{a}の肩にもたれて、すぐに寝息を立てた。眠れないのは{a}だけだった。|{b}は「{a}になら何でも話せる」と言った。それが一番、遠かった。'),
      dislike: L('{b}は小さく会釈して、さりげなく距離をとった。|{b}は「……どうも」と言ったきり、{a}と目を合わせなかった。|{b}は用事を思い出したふりをして、その場を離れた。|{b}は受け取ったものを、{a}が見ていないところでそっと置いた。'),
      other: L('{b}は礼を言いながら、目では{c}を探していた。|{b}は{a}の話を聞きながら、{c}の笑い声がするたびにそちらを振り向いた。|{b}は「ありがとう」と言った。その声は、{c}に向けるときより一段低かった。|{b}は{a}にもらったものを、{c}に「見て」と見せに行った。')
    },
    self: L('{a}は、それでもいいと思った。|{a}は笑って、少しだけ胸を押さえた。|{a}は空になった手を、ポケットに突っ込んだ。|{a}は「まあ、そうだよな」と、誰にも聞こえない声で言った。|{a}は自分に言い聞かせた。見返りが欲しくてやったんじゃない。'),
    /* 一方通行の三角関係 */
    tri: L('{a}は、{b}が{c}を目で追っているのに気づいた。その目は、自分には一度も向けられたことのないものだった。|{a}は、{b}が{c}の前でだけ髪を直すことを知っていた。知りたくなかった。|{b}が{c}に話しかけるとき、声が少しだけ高くなる。{a}はそれに気づくたびに、窓の外を見た。'),
    triLoop: L('そして{c}の目は、{a}の方を向いていた。三人の視線は、どこでも交わらなかった。|{c}もまた、誰かを見つめていた。――{a}を。誰も、そのことに気づいていなかった。'),
    triBlind: L('{c}は、そのことに気づいてさえいなかった。|{c}は今日も、{b}の気持ちに気づかないまま笑っていた。'),
    /* 守る（場面ごと） */
    protect: {
      goukon: L('{b}に強引に絡む隣の席の客との間に、{a}は「すみません、こいつ酔うと面倒なんで」と笑って割って入った。|{a}は{b}のグラスを、気づかれないようにウーロン茶にすり替えた。|王様ゲームで{b}に際どい命令が回りかけた瞬間、{a}は「はい、代わりにやります！」と手を挙げた。|{a}は{b}の終電の時間を確かめて、「そろそろお開きにしない？」と言い出した。|{b}に何度も肩を寄せる{c}の話を、{a}はさりげなく別の話題にそらした。|{a}は帰り道、{b}を駅まで送った。改札の前で、{a}は「じゃ」とだけ言って引き返した。'),
      classroom: L('{b}の陰口を叩いていた連中に、{a}は「本人の前で言えば」と言った。|体育の時間、飛んできたボールから、{a}はとっさに{b}をかばった。|{a}は{b}が忘れた宿題のために、自分のノートを破って渡した。|{b}が先生に叱られそうになったとき、{a}は「自分がやりました」と手を挙げた。'),
      island: L('{a}は崖で足を滑らせた{b}の手首を、間一髪で掴んだ。|夜の見張りの番、{a}は{b}の分まで起きていた。|{a}は{b}が口にしかけた赤い実を、黙って叩き落とした。「それ、毒」|嵐の夜、{a}は{b}の寝床の上に、自分の分の屋根を広げた。'),
      whiteroom: L('{a}は「その条件は、私がやる」と言って、{b}の前に出た。|{b}に詰め寄る{c}の前に、{a}は黙って立ちはだかった。|{a}は{b}が眠れるように、扉の方を向いて座っていた。|{a}は監視カメラから{b}が見えないように、さりげなく立ち位置を変えた。'),
      zombie: L('群れが迫ったとき、{a}は{b}を先に窓から押し出した。|{a}は{b}の背後に迫ったゾンビを、何も言わずに倒した。|{a}は{b}が眠っている間、扉の前から一歩も動かなかった。'),
      any: L('{a}は{b}に危険が及ばないよう、ずっと目を配っていた。')
    },
    thanks: {
      none: L('{b}は、守られたことに気づいてもいなかった。|{b}は「あ、どうも」と軽く頭を下げた。'),
      friend: L('{b}は「助かった、さすが親友！」と笑った。それだけだった。|{b}は{a}の頭をくしゃくしゃと撫でた。子どもにするみたいに。'),
      dislike: L('{b}は戸惑ったように、小さく礼を言った。|{b}は「……ありがとう」と言って、少しだけ{a}を見直したような顔をした。'),
      other: L('{b}は礼を言うと、すぐに{c}のところへ戻っていった。|{b}は「ありがとう」と言いながら、{c}が見ていたかどうかを気にしていた。')
    },
    notice: L('{b}はふと、{a}がいつも自分を守ってくれていたことに気づいた。気づいてしまうと、もう前と同じ顔では{a}を見られなかった。|{b}は、自分の隣がいつも空いていない理由に、ようやく思い当たった。|{b}は{a}の背中を見ながら、これまでのことを一つずつ思い出していた。'),
    /* 告白と、その答え */
    confessAt: { goukon: '二次会の帰り道、{a}は{b}を呼び止めた。', classroom: '放課後の誰もいない教室で、{a}は{b}に向き合った。', island: '星がやけに多い夜、{a}は{b}を浜辺に呼んだ。', whiteroom: '扉が開く気配のない部屋の隅で、{a}は{b}に言った。', zombie: '見張りの交代の時間、{a}は{b}を引き止めた。', any: '{a}は{b}を呼び止めた。' },
    confess: L('「ずっと好きだった」|「好きです。……知ってたかもしれないけど」|「一回だけ言わせて。好きだ」|「迷惑なのは分かってる。でも、好き」'),
    reject: {
      none: L('{b}は少し困った顔をした。「ごめん。そういうふうに考えたこと、なかった」|{b}はしばらく黙ってから、「……ごめん」とだけ言った。'),
      friend: L('{b}は笑って、それから真顔になった。「{a}のことは好きだよ。……友達として」|{b}は困ったように笑った。「今の関係が一番いい。壊したくない」'),
      dislike: L('{b}は一歩下がった。「……ごめん。無理」|{b}は目を逸らした。「そういうの、困る」'),
      other: L('{b}は目を伏せた。「ごめん。好きな人がいる」――名前は言わなかったが、{a}には分かっていた。|{b}は申し訳なさそうに、{c}の方を見た。それが答えだった。')
    },
    after: {
      persist: L('{a}は「じゃあ、好きになってもらえるまで頑張る」と笑った。|{a}は「返事は急がない。待ってる」と言った。{b}が何か言う前に、背を向けた。'),
      smile: L('{a}は「言えてよかった」と笑った。目は笑っていなかった。|{a}は「聞いてくれてありがとう。……明日からも、普通にしてね」と言った。'),
      cold: L('{a}は「そうか」とだけ言って、背を向けた。|{a}は黙って頷いた。それから、少しだけ遠くへ歩いていった。')
    },
    /* 想う相手の恋を手伝う */
    help: L('{a}は{b}に、{c}の好きなものをこっそり教えた。自分の気持ちは、最後まで言わなかった。|{a}は{b}と{c}が二人きりになれるように、わざと席を外した。|{b}から{c}のことで相談を受けて、{a}は真剣に答えた。帰り道、一人で少しだけ泣いた。|{a}は{b}の背中を押した。「行ってこいよ」――押した手を、しばらく見つめていた。'),
    /* 恋敵への態度（{a}=想う側、{c}=恋敵、{b}=想われる側） */
    rival: L('{a}は{c}に、必要以上にきつく当たった。理由を訊かれても、言えなかった。|{a}は{c}に「{b}のこと、泣かせたら許さない」と言った。{c}はきょとんとしていた。|{a}は{c}の欠点を探そうとして、一つも見つからなかった。それが一番、悔しかった。|{a}は{c}の隣で笑う{b}を見ないように、{c}とばかり話した。'),
    /* 想う相手の、想い人を失ったとき */
    loss: L('{c}を失った{b}の隣に、{a}は黙って座った。肩を貸すことしか、できなかった。|{b}は{a}の胸で泣いた。{a}は{b}の背中を撫でながら、自分の中の小さな期待を、心の底から憎んだ。|{a}は{b}に、{c}の形見を渡した。「持ってて。……忘れなくていいから」')
  };
  function sc(ctx, T) { return T[SCN(ctx)] || T.any; }
  function heart(ctx, a, b) { var c = U.heartOf(ctx, b, a); return c && alive(c) ? c : null; }

  /* ---------- 出来事 ---------- */
  function mk(id, cat, w, when, run) { return { id: id, cat: cat, scope: 'pair', mini: true, sig: true, when: when, w: w, run: run }; }
  var LIST = [
    /* 尽くすが、相手にされない */
    mk('u_serve', 'bond', function (ctx, a, b) { return 0.7 + a.tr.np * 0.5 + a.tr.ac * 0.3; },
      function (ctx, a, b) { return U.unreq(ctx, a, b) && (ctx.pair(a, b).userve || 0) < 3; },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), k = U.cold(ctx, a, b), c = heart(ctx, a, b);
        if (k === 'other' && !c) k = 'none';
        pf.userve = (pf.userve || 0) + 1;
        ctx.mod2(a, b, { att: 3, aff: 2 }, k === 'dislike' ? { ten: 3 } : { aff: 3, trust: 2 });
        ctx.stress(a, 3);
        var m = { a: a.name, b: b.name, c: c ? c.name : '' };
        return { text: fill(ctx.pick(sc(ctx, D.serve)), m) + fill(ctx.pick(D.brush[k]), m) + (ctx.rng() < 0.6 ? fill(ctx.pick(D.self), m) : ''), why: U.why(ctx, a, b), with: k === 'other' && c ? [c] : null };
      }),
    /* 一方通行の三角関係を眺める */
    mk('u_tri', 'romance', function (ctx, a) { return 0.9 + a.tr.a * 0.3 + a.tr.jealous * 0.4; },
      function (ctx, a, b) { return U.unreq(ctx, a, b) && !!heart(ctx, a, b) && (ctx.pair(a, b).utri || 0) < 2; },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), c = heart(ctx, a, b), m = { a: a.name, b: b.name, c: c.name };
        pf.utri = (pf.utri || 0) + 1;
        ctx.stress(a, 6); ctx.mod(a, c, { ten: 4 });
        var loop = U.crushOn(ctx, c, a), blind = ctx.R(c, b).att < 25;
        return { text: fill(ctx.pick(D.tri), m) + (loop ? fill(ctx.pick(D.triLoop), m) : blind ? fill(ctx.pick(D.triBlind), m) : ''), why: '一方通行の三角関係：' + a.name + '→' + b.name + '→' + c.name + (loop ? '→' + a.name : blind ? '（' + c.name + 'は気づいていない）' : ''), with: [c] };
      }),
    /* 守る（合コンでは特に） */
    mk('u_protect', 'help', function (ctx, a) { return (ctx.scen.id === 'goukon' ? 1.6 : 0.8) + a.tr.np * 0.4 + a.tr.cp * 0.3; },
      function (ctx, a, b) { return U.unreq(ctx, a, b) && (ctx.pair(a, b).uprot || 0) < 4; },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), k = U.cold(ctx, a, b), c = heart(ctx, a, b) || ctx.others(a).filter(function (o) { return o !== b; })[0];
        if (k === 'other' && !heart(ctx, a, b)) k = 'none';
        pf.uprot = (pf.uprot || 0) + 1;
        var m = { a: a.name, b: b.name, c: c ? c.name : '誰か' };
        var pool = sc(ctx, D.protect).filter(function (t) { return c || t.indexOf('{c}') < 0; });
        var t = fill(ctx.pick(pool), m);
        /* 守り続けると、まれに相手が気づく（苦手でなければ） */
        var noticed = pf.uprot >= 3 && k !== 'dislike' && !pf.unotice && ctx.rng() < 0.3 + a.tr.np * 0.2;
        if (noticed) {
          pf.unotice = true;
          ctx.mod2(a, b, { aff: 3 }, { att: 14, aff: 10, trust: 10 });
          return { text: t + fill(ctx.pick(D.notice), m), why: a.name + 'が黙って守り続けてきた（' + pf.uprot + '回目）。' + b.name + 'の心が、少しだけ動いた', mag: 26, with: c && t.indexOf(c.name) >= 0 ? [c] : null };
        }
        ctx.mod2(a, b, { att: 2 }, { trust: 6, aff: 4 });
        return { text: t + fill(ctx.pick(D.thanks[k]), m), why: U.why(ctx, a, b) + '／それでも守る', with: c && t.indexOf(c.name) >= 0 ? [c] : null };
      }),
    /* 告白して、ふられる（まれに実る） */
    mk('u_confess', 'romance', function (ctx, a) { return 0.5 + a.tr.honesty * 0.6 + a.tr.impulse * 0.4 + a.stress / 150; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return U.unreq(ctx, a, b) && !pf.uconf && ((pf.userve || 0) + (pf.uprot || 0) >= 1 || ctx.R(a, b).att > 65); },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), k = U.cold(ctx, a, b), c = heart(ctx, a, b);
        if (k === 'other' && !c) k = 'none';
        pf.uconf = true;
        var m = { a: a.name, b: b.name, c: c ? c.name : '' };
        var open = fill(D.confessAt[SCN(ctx)] || D.confessAt.any, m) + fill(ctx.pick(D.confess), m);
        if (k !== 'dislike' && k !== 'other' && ctx.R(b, a).att > 32 && HK.canLove(b, a)) {
          pf.couple = true; ctx.mod2(a, b, { att: 10, aff: 10, trust: 8 }, { att: 14, aff: 10, trust: 8 });
          return { text: open + fill('{b}は長いあいだ黙っていた。それから、「……いつから？」と小さく訊いた。{a}が答えると、{b}は真っ赤になって俯いた。「……ずるい」', m), why: '相手にされていなかった片想いが、とうとう届いた（' + b.name + 'の惹かれ ' + Math.round(ctx.R(b, a).att) + '）', mag: 36 };
        }
        var af = a.tr.fc + a.tr.cp > 1.15 ? 'persist' : a.tr.cold > 0.6 ? 'cold' : 'smile';
        ctx.stress(a, 18); ctx.mod2(a, b, { att: af === 'persist' ? 4 : -6 }, k === 'dislike' ? { ten: 8 } : { aff: 2 });
        if (af === 'persist') a.flags.unreqPersist = b.i;
        return { text: open + fill(ctx.pick(D.reject[k]), m) + fill(ctx.pick(D.after[af]), m), why: U.why(ctx, a, b) + '／' + { persist: '諦めない（FC・CP）', smile: '笑ってみせた', cold: '引き下がった（ドライさ）' }[af], mag: 30, with: k === 'other' && c ? [c] : null };
      }),
    /* 想う相手の恋を手伝う */
    mk('u_help', 'help', function (ctx, a) { return 0.4 + a.tr.np * 0.7 + a.tr.ac * 0.3 - a.tr.jealous * 0.4; },
      function (ctx, a, b) { var c = heart(ctx, a, b); return U.unreq(ctx, a, b) && !!c && !couple(ctx, b, c) && !ctx.pair(a, b).uhelp; },
      function (ctx, a, b) {
        var c = heart(ctx, a, b), m = { a: a.name, b: b.name, c: c.name };
        ctx.pair(a, b).uhelp = true;
        ctx.mod(b, c, { att: 6, aff: 4 }); ctx.mod(b, a, { trust: 10, aff: 6 }); ctx.stress(a, 10);
        return { text: fill(ctx.pick(D.help), m), why: a.name + 'は、' + b.name + 'の想う' + c.name + 'との仲を取り持った（NP・AC）', mag: 26, with: [c] };
      }),
    /* 恋敵に当たる（a と c の組で起きる） */
    { id: 'u_rival', cat: 'conflict', scope: 'pair', mini: true, sig: true,
      when: function (ctx, a, c) { var b = rivalOf(ctx, a, c); return !!b && (ctx.pair(a, c).urival || 0) < 2 && (!HK.Obsess || HK.Obsess.jealOk(ctx, a, b)); },
      w: function (ctx, a) { return 0.4 + a.tr.jealous * 0.8 + a.tr.aggr * 0.3; },
      run: function (ctx, a, c) {
        var b = rivalOf(ctx, a, c), m = { a: a.name, b: b.name, c: c.name };
        ctx.pair(a, c).urival = (ctx.pair(a, c).urival || 0) + 1;
        if (HK.Obsess) HK.Obsess.feed(ctx, a, b, 6);
        ctx.mod2(a, c, { ten: 8 }, { ten: 4 });
        return { text: fill(ctx.pick(D.rival), m), why: a.name + 'の想う' + b.name + 'は、' + c.name + 'を想っている（嫉妬・執着）', with: [b] };
      } },
    /* 想う相手が、想い人を失ったとき */
    mk('u_loss', 'help', function () { return 2.2; },
      function (ctx, a, b) { if (!U.crushOn(ctx, a, b) || ctx.pair(a, b).uloss) return false; var c = U.heartOf(ctx, b, a); return c && !c.alive && c.diedAt != null; },
      function (ctx, a, b) {
        var c = U.heartOf(ctx, b, a), m = { a: a.name, b: b.name, c: c.name };
        ctx.pair(a, b).uloss = true;
        b.stress = Math.max(0, b.stress - 10); ctx.mod2(a, b, { att: 4 }, { aff: 10, trust: 12 });
        return { text: fill(ctx.pick(D.loss), m), why: b.name + 'の想い人だった' + c.name + 'は、もういない。' + a.name + 'の片想いは、行き場をなくした', mag: 30 };
      })
  ];
  function rivalOf(ctx, a, c) {
    var hit = null;
    ctx.chars.forEach(function (b) { if (!hit && alive(b) && b !== a && b !== c && U.unreq(ctx, a, b) && U.heartOf(ctx, b, a) === c) hit = b; });
    return hit;
  }

  ['goukon', 'classroom', 'island', 'whiteroom'].forEach(function (id) { HK.addMini(id, LIST); });
  /* ゾンビの街：同じエリアにいる者どうしの出来事として足す */
  var Z = HK.ZB;
  if (Z && Z.scen) LIST.forEach(function (e) { var e2 = {}; for (var k in e) e2[k] = e[k]; e2.mini = false; e2.w = (function (w0) { return function (ctx, a, b) { return w0(ctx, a, b) * 0.8; }; })(e.w); Z.scen.events.push(e2); });
})();
