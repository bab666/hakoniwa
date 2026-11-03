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
  function okPair(ctx) { return function (x, y) { return PR.sexOk(ctx, x, y); }; }
  R3.can = function (ctx, S) {
    var P = HK.Pos, g = [S.A0, S.B0, S.C0];
    if (HK.SAFE_ON || !P || !P.trioPlan || !HK.Trio3) return null;
    if (g.some(function (c) { var d = c.life && c.life.days && c.life.days[S.day.d]; return d && d.trip; })) return null;
    var pl = P.trioPlan(g[0], g[1], g[2], { ok: okPair(ctx) });
    return pl && pl.pairs && pl.pairs.length >= 2 ? pl : null;
  };
  R3.night = function (ctx, S, day, last) {
    var pl = R3.can(ctx, S), g = [S.A0, S.B0, S.C0], X3 = HK.Trio3;
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
    var lt = K.say(ctx, R3.LEAD, a, bc[0], bc[1]), fl = R3.FORM_LEAD[touch ? 'touch' : sp.p];
    if (fl) lt += sub(pk(fl));
    var le = ctx.say({ kind: 'event', cat: 'romance', actors: g, text: lt, why: 'きっかけ：三人の夜（' + a.name + 'から）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    var text, why;
    if (touch) { text = X3.touchScene(ctx, [a, bc[0], bc[1]]); why = '三人とも攻めなので、口づけと手だけ'; }
    else if (lv === 'low') { text = K.say(ctx, R3.FADE, a, bc[0], bc[1]); why = 'ほのめかす'; }
    else {
      var short = !!(LV && LV.short && LV.short(env, ctx.rng));
      /* 山場は本体の形ごとの文（受けの態度 9 種）に任せる。最中の段は新婚部屋の一段（形の組と同じ向き） */
      var body = X3.quick(ctx, g, { sp: sp, plan: pl, env: env, ero: !!(LV && LV.ero && LV.ero(env)), short: short, mid: short ? '' : sub(pk(R3.MID[sp.p] || R3.MID.ring)) });
      if (!body) return false;
      text = body + '\n\n' + K.say(ctx, R3.AFTER, a, bc[0], bc[1]);
      why = (X3.FORM_JA && X3.FORM_JA[sp.p] || '') + '：' + { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: '真ん中の' + sp.m.name + 'を挟んで', ring: '輪になって', show: sp.t.name + 'と' + sp.m.name + '、' + sp.u.name + 'は見守る' }[sp.p];
    }
    if (!text) return false;
    var e = ctx.act2({ actors: g, cat: 'romance', text: text, why: '新婚部屋：三人の夜（' + why + '）',
      sex: !touch, lewd: lv !== 'low', trioPairs: pl ? pl.pairs : [], fx: function () { ctx.mod2(g[0], g[1], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[0], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[1], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); } });
    if (!e) return false;
    if (!touch) S.trioSex = (S.trioSex || 0) + 1;
    return true;
  };
})();
/* r18:end */
