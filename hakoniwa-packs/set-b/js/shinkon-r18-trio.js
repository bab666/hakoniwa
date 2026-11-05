/* r18:begin */
/* @event scen=set-b-shinkon id=sk_night_trio cat=romance tie=- tags=night cond=三人婚 label=三人で求め合う新婚の夜 */
/* 新婚部屋：三人婚の三人の夜（R18版だけ。2026-11-03）
   ■ HK.ShinkonR18Trio.night(ctx, S, day, last)：三人の場面を出したら true
     ・三人の組み立ては本体の HK.Pos.trioPlan（体の関係にしてよい組：HK.State.pairSex＋新婚部屋の判定 HK.PairR18.sexOk）と HK.Trio3（trio-talk-r18.js。かたまり pack-lewd）。
       直接の行為は plan の組だけ（ほかの組は同じ場にいても触れ合わない）。受け攻めは HK.Trio3.shapeOf（HK.Pos.order）のとおり
     ・形は本体の HK.Trio3.shapeOf（受け攻めの設定から：攻め×攻め×受け twoOne／攻め×受け・受け oneTwo／攻め→リバ→受け sandwich（真ん中はリバ・おまかせの人だけ）／
       合う形がなければ見せつけ show）。繋がる段・山場・事後の一言は本体の形ごとの文（trio-form-text-r18.js）。三人とも攻めなど、繋がる組が作れない三人は口づけと手だけ（HK.Trio3.touchScene）
     ・場面の直前に「きっかけ」の段（理由「きっかけ：三人の夜」。形が決まったわけの一文 FORM_LEAD を足す）。描写の有無「ほのめかす」はぼかした一文
   ■ 文：{t}＝攻め・{m}＝真ん中・{u}＝受け（形 oneTwo／twoOne／sandwich／show／ring）。体の語は印。台詞は3本。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.PairR18) return;
  function L(s) { return s.split('|'); }
  var PR = HK.PairR18;
  var R3 = HK.ShinkonR18Trio = {};
  /* きっかけ（{a}{b}{c}＝三人。{a}＝言い出す人）。三組のうち直接は触れ合わない組があるので、触れ合いは書かない（形の文で書く） */
  R3.LEAD = L('寝室の明かりを落とすと、{a}が{b}と{c}の顔を順番に見た。誰も何も言わなかったが、三人とも、今夜がどういう夜になるのか分かっていた。新婚の家の大きな布団が、三人分の重みでゆっくりと沈んだ。|' +
    '「＠{a}＠今夜は、三人一緒がいい｜今夜は、三人一緒がいい｜今夜は、三人一緒がいいです」――{a}がそう言うと、{b}は照れくさそうに笑い、{c}は黙ってうなずいた。三人で暮らし始めてから、こんなふうに口に出すのは初めてだった。|' +
    '布団には、三人分の枕が並んでいた。{a}が明かりを消すと、{b}と{c}も、そっと布団にもぐりこんだ。三人の夜は、静かに始まった。');
  /* 形が決まったわけ（受け攻めの設定から。{t}{m}{u}。本体の HK.Trio3.shapeOf の形） */
  R3.FORM_LEAD = {
    twoOne: L('{t}と{m}は、どちらも抱く側に回る性分だった。三人の夜に二人から求められるのは、いつも{u}だった。|抱かれる側に回れるのは、三人の中で{u}だけだった。{t}と{m}は、目を見交わして{u}の両側に腰を下ろした。'),
    oneTwo: L('{m}も{u}も、抱かれる側に回る方が性に合っていた。二人の伴侶を抱けるのは、{t}だけだった。|三人の中で、抱く側に回るのは{t}だけだった。{m}と{u}は、どちらが先に呼ばれるのかをそわそわと待っていた。'),
    sandwich: L('{m}だけは、抱くことも抱かれることもできた。三人がひとつに繋がるなら、真ん中は{m}だった。|抱く側の{t}と、抱かれる側の{u}。そのあいだをつなげるのは、どちらにも回れる{m}だけだった。'),
    show: L('{t}と{m}は繋がれても、{u}がそこに加われる形はなかった。それでも{u}は、二人のそばを離れたくなかった。|三人のうち、体を重ねられるのは{t}と{m}だけだった。{u}は、二人のすぐそばで夜を過ごすことにした。'),
    ring: L('三人とも、抱くことも抱かれることもできた。誰が誰を求めるのかは、その夜の気分しだいだった。'),
    touch: L('三人とも、誰かに抱かれるつもりはなかった。それでも今夜は、三人一緒にいたかった。')
  };
  R3.FADE = L('布団の中で、三人の影がゆっくりと重なった。それから先のことは、三人しか知らない。翌朝、{a}と{b}と{c}は、誰からともなく照れくさそうに笑い合った。|寝室の戸が静かに閉まった。三人の小さな笑い声と息づかいが、しばらく廊下に漏れていた。翌朝の食卓は、いつもより少しだけ静かだった。');
  /* 形ごとの最中の段（{t}{m}{u}。本体の形の組と同じ向き：twoOne＝{t}と{m}が{u}を／oneTwo＝{t}が{m}と{u}を／sandwich＝{t}が{m}を、{m}が{u}を／show＝{t}と{m}だけ。
     中心のある三人では直接は触れ合わない組（twoOne の{t}{m}・oneTwo の{m}{u}・sandwich の{t}{u}）があるので、その二人は触れ合わせない。体の語・挿入は本体の形の文が書く） */
  R3.MID = {
    twoOne: L('新婚の寝室の布団の上で、{u}は{t}と{m}のあいだに横たわっていた。二人の名前を交互に呼ぶたびに、呼ばれた方が{u}を深く求めた。{u}は、二人の伴侶に同時に愛されることの重さを、体ぜんぶで受けとめていた。|' +
      '{t}と{m}は、言葉を交わさなくても息が合っていた。どちらが{u}を求めているあいだも、もう片方は{u}の手を握って待っていた。三人で選んだ暮らしの、三人だけの夜だった。'),
    oneTwo: L('{t}は{m}と{u}を並べて横たえ、二人に代わる代わる口づけを落とした。片方を抱いているあいだも、もう片方の手を離さない。どちらも置いていかない――{t}のその決意が、指先から二人に伝わっていった。|' +
      '{m}と{u}は、{t}が自分のところへ戻ってくるのを、交互に待った。待つあいだも、二人は{t}の背中から目を離さなかった。新婚の布団は、二人の伴侶を抱く{t}の重みで深く沈んだ。'),
    sandwich: L('{m}は前の{u}を抱き、後ろの{t}に抱かれていた。{t}が動くたびに、その波が{m}を通って{u}まで届いた。三人で選んだ暮らしが、そのまま三人の体のつながりになっていた。|' +
      '{m}は{u}を抱きながら、背中に{t}の体温を感じていた。前に進めば{u}が鳴き、後ろから押されれば{m}が鳴いた。三人の息づかいが、新婚の寝室でひとつに溶けた。'),
    show: L('{t}は{m}を抱きながら、ときどき{u}の方へ手を伸ばした。{u}はその手を取って、指先に口づけを返した。繋がる形はひとつでも、三人の夜であることに変わりはなかった。|' +
      '{u}は二人のそばに寄り添い、{t}の髪をやさしく撫でていた。{m}の声が上がるたびに、{u}は{t}と目を合わせて微笑んだ。三人の新婚の夜は、それぞれの形で満たされていった。'),
    ring: L('三人は輪になって、互いの肌を求め合った。{t}が{m}を、{m}が{u}を、{u}が{t}を――誰もが誰かを抱き、誰かに抱かれていた。終わりのない輪の中で、三人の声が重なり合った。')
  };
  R3.AFTER = L('事のあと、三人は汗ばんだ体を寄せ合ったまま、くすくすと笑い合った。{a}の両手は、{b}と{c}の手をそれぞれ握ったままだった。|三人は布団に川の字になって、天井を見上げた。{b}が「＠{b}＠三人だと、布団が足りない｜三人だと、布団が足りないな｜三人だと、布団が足りませんね」と言うと、{c}が吹き出し、{a}もつられて笑った。');
  /* 触れ合いの段（2026-11-05 報告「三人婚が 1 段落で、挿入より先に喘ぎ」）：繋がる前の段。形の組と同じ向き。挿入・山場は書かない */
  R3.TOUCH = {
    twoOne: L('{t}が{u}の唇をふさぐと、{m}は{u}の背中に回って、うなじに口づけを落とした。前と後ろから同時に触れられて、{u}の肩が小さく跳ねる。二人の手が、{u}の服のボタンを一つずつ外していった。|' +
      '{u}を真ん中に寝かせて、{t}と{m}は両側から{u}の肌をなぞった。片方が胸を、片方が脇腹を撫でるたびに、{u}は身をよじって笑い、それから笑えなくなった。{u}の息が、少しずつ熱を帯びていく。'),
    oneTwo: L('{t}は{m}と{u}を並べて座らせ、順番に唇を重ねた。片方に口づけているあいだも、もう片方の手を握ったまま離さない。{m}と{u}の頬が、そろって赤く染まっていった。|' +
      '{t}は{m}の首筋に口づけながら、空いた手で{u}の髪を撫でた。{m}が甘い声をもらすと、{u}も待ちきれずに{t}の背中にしがみつく。二人の伴侶の体温を、{t}は両腕で確かめた。'),
    sandwich: L('{m}は{u}を抱き寄せて口づけ、その{m}の背中を、{t}が後ろからゆっくりと撫で下ろした。触れられるたびに{m}の口づけが乱れ、{u}がくすくすと笑う。三人の体が、少しずつ近づいていった。|' +
      '{t}が{m}の耳を甘く噛むと、{m}はたまらず{u}の肩に額を押しつけた。{u}は{m}の髪を撫でながら、{t}と目を合わせて微笑んだ。真ん中の{m}を、二人がかりでとろかしていく。'),
    show: L('{t}は{m}を抱き寄せ、深く口づけた。{u}は二人のすぐそばに座り、{m}の手をそっと握っている。{m}の指が、{u}の手のひらをきゅっと握り返した。|' +
      '{t}と{m}が肌を重ねはじめると、{u}は{m}の頭をそっと自分の膝にのせた。{m}は{u}の手に頬をすり寄せ、{t}に身を委ねた。'),
    ring: L('三人は向かい合って座り、順番に唇を重ねていった。{t}から{m}へ、{m}から{u}へ、{u}から{t}へ。輪になった口づけが、だんだん長くなっていった。')
  };
  /* 本体の三人の場面（HK.Trio3.quick）を、きっかけ→触れ合い→挿入→喘ぎ→山場→事後の順の段落に並べ直す。
     繋がる文より前にある喘ぎ・繋がったあとを前提にした台詞は、繋がる文のあとへ。最中の段（新婚部屋の一段）は山場の前に */
  var INS3 = /抱いたのは|満たし|沈め|沈みこ|沈み込|貫|挿(?:れ|入)|突き入|呑み込|呑みこ|繋が|埋め|押し入|迎え入れ|指を[^。]{0,10}(?:沈|差し入|入れ)|突かれ|揺さぶられ|突き上げ/;
  var CLI3 = /果て|達し|昇りつめ|上り詰め|絶頂|崩れた|熱を(?:注|吐き出|放)|弾け/;
  var POST3 = /形を|中が|奥|出る|白濁|イく|イっ|締め|動いて|腰|もっと|欲張り|集中/;
  function order3(body, touch, mid) {
    var t = String(body || '').replace(/\n\n+/g, ''), re = /[^。「」\uE3A0\uE3A1]{1,12}「[^」]*」(?:\uE3A0[^\uE3A1]*\uE3A1)?|[^。「」]+。/g, segs = [], m;
    while ((m = re.exec(t))) segs.push(m[0]);
    if (!segs.length || segs.join('').length < t.length * 0.9) return (touch ? touch + '\n\n' : '') + body + (mid ? '\n\n' + mid : '');
    var ii = -1, ci = -1;
    segs.forEach(function (x, i) { var n = x.replace(/「[^」]*」/g, ''); if (ii < 0 && INS3.test(n)) ii = i; if (ci < 0 && ii >= 0 && i > ii && CLI3.test(n)) ci = i; });
    if (ii < 0) ii = 0;
    var pre = [], moved = [], rest = [];
    segs.forEach(function (x, i) {
      if (i < ii) { var q = /「/.test(x), moan = /「\u2060/.test(x); if (q && (moan || POST3.test(x))) moved.push(x); else pre.push(x); }
    });
    var ins = [segs[ii]].concat(moved), during = segs.slice(ii + 1, ci < 0 ? segs.length : ci), peak = ci < 0 ? [] : segs.slice(ci);
    var P = [];
    if (touch || pre.length) P.push((touch || '') + pre.join(''));
    P.push(ins.concat(during).join(''));
    if (mid) P.push(mid);
    if (peak.length) P.push(peak.join(''));
    return P.filter(function (x) { return x; }).join('\n\n');
  }
  function okPair(ctx) { return function (x, y) { return PR.sexOk(ctx, x, y); }; }
  /* 四人婚で一人が留守の夜（2026-11-04 利用者の回答「三人の夜があってもよい」）：残る三人の文。きっかけで「一人が留守だから三人で」が分かるように（{a}{b}{c}＝三人、{x}＝留守の人） */
  R3.LEAD4 = L('{x}が出張で家を空けた夜、寝室の布団は一つ分だけ広かった。{a}が明かりを落とすと、{b}と{c}は顔を見合わせた。いつもは四人の寝室に、今夜は三人。その分だけ、互いの体温が近かった。|' +
    '「＠{a}＠{x}がいない夜は、なんだか落ち着かない｜{x}がいない夜は、どうも落ち着かない｜{x}さんがいない夜は、なんだか落ち着きませんね」――{a}がそう言うと、{b}が{a}の手を取り、{c}も黙って身を寄せた。留守の{x}の枕を横に置いたまま、三人は布団の中で寄り添った。|' +
    '{x}から「今夜は帰れない」と連絡が来たのは、夕方だった。寝る前の居間で、{a}と{b}と{c}は、空いた一つの席をちらりと見た。三人だけの夜は久しぶりで、誰からともなく寝室へ向かった。');
  /* 四人婚で使わない文（「三人で選んだ暮らし」など、三人で結婚した前提の文） */
  var NOT4 = /三人で選んだ|三人で暮らし始めて/;
  R3.can = function (ctx, S, g0) {
    var P = HK.Pos, g = g0 || [S.A0, S.B0, S.C0];
    if (HK.SAFE_ON || !P || !P.trioPlan || !HK.Trio3) return null;
    if (g.some(function (c) { var d = c.life && c.life.days && c.life.days[S.day.d]; return d && d.trip; })) return null;
    var pl = P.trioPlan(g[0], g[1], g[2], { ok: okPair(ctx) });
    return pl && pl.pairs && pl.pairs.length >= 2 ? pl : null;
  };
  /* opt：四人婚で一人が留守の夜は { g: 残る三人, away: 留守の人 } */
  R3.night = function (ctx, S, day, last, opt) {
    opt = opt || {};
    var g = opt.g || [S.A0, S.B0, S.C0], pl = R3.can(ctx, S, g), X3 = HK.Trio3, q4 = !!opt.away;
    if (day.noSex || HK.SAFE_ON || !X3) return false;
    /* 繋がる組が作れない三人（三人とも攻めなど。受け攻めだけが合わない）は、口づけと手だけの夜（本体の HK.Trio3.touchScene） */
    var touch = !pl && X3.touchOk && X3.touchOk(g, okPair(ctx)) && !g.some(function (c) { var d = c.life && c.life.days && c.life.days[S.day.d]; return d && d.trip; });
    if (!pl && !touch) return false;
    var LV = HK.Lewd, env = ctx.env, lv = LV ? LV.lv(env) : 'mid';
    var a = g[Math.floor(ctx.rng() * 3)], bc = g.filter(function (c) { return c !== a; }), K = HK.ShinkonTrio;
    /* 形は本体の HK.Trio3.shapeOf（受け攻めの設定から。真ん中に回れる人がいなければ見せつけの形 show） */
    var sp = touch ? null : X3.shapeOf(ctx, g, pl, { soft: true });
    if (!touch && !sp) return false;
    var nm = sp ? { t: sp.t.name, m: sp.m.name, u: sp.u.name } : {}, sub = function (t) { return String(t).replace(/\{([tmu])\}/g, function (m0, k) { return nm[k] || m0; }); };
    var pk = function (arr) { return arr[Math.floor(ctx.rng() * arr.length)]; };
    var lt = q4 ? K.say(ctx, R3.LEAD4, a, bc[0], bc[1], { x: opt.away.name }) : K.say(ctx, R3.LEAD, a, bc[0], bc[1]), fl = R3.FORM_LEAD[touch ? 'touch' : sp.p];
    if (fl) lt += sub(pk(fl));
    var le = ctx.say({ kind: 'event', cat: 'romance', actors: g, text: lt, why: 'きっかけ：三人の夜（' + (q4 ? opt.away.name + 'が留守の夜・' : '') + a.name + 'から）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    var text, why;
    if (touch) { text = X3.touchScene(ctx, [a, bc[0], bc[1]]); why = '三人とも攻めなので、口づけと手だけ'; }
    else if (lv === 'low') { text = K.say(ctx, R3.FADE, a, bc[0], bc[1]); why = 'ほのめかす'; }
    else {
      var short = !!(LV && LV.short && LV.short(env, ctx.rng));
      /* 山場は本体の形ごとの文（受けの態度 9 種）に任せる。最中の段は新婚部屋の一段（形の組と同じ向き） */
      var mid3 = short ? '' : sub(pk((R3.MID[sp.p] || R3.MID.ring).filter(function (x) { return !q4 || !NOT4.test(x); })));
      var body = X3.quick(ctx, g, { sp: sp, plan: pl, env: env, ero: !!(LV && LV.ero && LV.ero(env)), short: short, mid: '' });
      if (!body) return false;
      var tch = env.lewdLen === 'short' ? '' : sub(pk(R3.TOUCH[sp.p] || R3.TOUCH.ring));
      body = order3(body, tch, mid3);
      if (env.lewdLen === 'short') body = body.replace(/\n\n+/g, '');
      text = body + '\n\n' + K.say(ctx, q4 ? R3.AFTER.filter(function (x) { return !/布団が足りない/.test(x); }) : R3.AFTER, a, bc[0], bc[1]);
      why = (X3.FORM_JA && X3.FORM_JA[sp.p] || '') + '：' + { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: '真ん中の' + sp.m.name + 'を挟んで', ring: '輪になって', show: sp.t.name + 'と' + sp.m.name + '、' + sp.u.name + 'は見守る' }[sp.p];
    }
    if (!text) return false;
    var e = ctx.act2({ actors: g, cat: 'romance', text: text, why: '新婚部屋：三人の夜（' + (q4 ? opt.away.name + 'が留守・' : '') + why + '）',
      sex: !touch, lewd: lv !== 'low', trioPairs: pl ? pl.pairs : [], fx: function () { ctx.mod2(g[0], g[1], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[0], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[1], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); } });
    if (!e) return false;
    if (!touch) S.trioSex = (S.trioSex || 0) + 1;
    return true;
  };
})();
/* r18:end */
