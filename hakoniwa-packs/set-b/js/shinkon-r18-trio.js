/* r18:begin */
/* @event scen=set-b-shinkon id=sk_night_trio cat=romance tie=- tags=night cond=三人婚 label=三人で求め合う新婚の夜 */
/* 新婚部屋：三人婚の三人の夜（R18版だけ。2026-11-03）
   ■ HK.ShinkonR18Trio.night(ctx, S, day, last)：三人の場面を出したら true
     ・三人の組み立ては本体の HK.Pos.trioPlan（体の関係にしてよい組：HK.State.pairSex＋新婚部屋の判定 HK.PairR18.sexOk）と HK.Trio3（trio-talk-r18.js。かたまり pack-lewd）。
       直接の行為は plan の組だけ（ほかの組は同じ場にいても触れ合わない）。受け攻めは HK.Trio3.shapeOf（HK.Pos.order）のとおり
     ・場面の直前に「きっかけ」の段（理由「きっかけ：三人の夜」）。描写の有無「ほのめかす」はぼかした一文
   ■ 文：{t}＝攻め・{m}＝真ん中・{u}＝受け（形 oneTwo／twoOne／sandwich／ring）。体の語は印。台詞は3本。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.PairR18) return;
  function L(s) { return s.split('|'); }
  var PR = HK.PairR18;
  var R3 = HK.ShinkonR18Trio = {};
  /* きっかけ（{a}{b}{c}＝三人。{a}＝言い出す人） */
  R3.LEAD = L('寝室の明かりを落とすと、{a}が両隣の{b}と{c}の手を同時に握った。誰も何も言わなかったが、三人とも、今夜がどういう夜になるのか分かっていた。新婚の家の大きな布団が、三人分の重みでゆっくりと沈んだ。|「今夜は、三人一緒がいい｜今夜は、三人一緒がいい｜今夜は、三人一緒がいいです」――{a}がそう言うと、{b}は照れくさそうに笑い、{c}は黙ってうなずいた。三人で暮らし始めてから、こんなふうに口に出すのは初めてだった。|じゃんけんで真ん中が決まったあと、誰からともなく手が伸びた。{a}の唇が{b}に触れ、{b}の指が{c}の頬をなぞる。三人の夜は、静かに始まった。');
  R3.FADE = L('布団の中で、三人の影がゆっくりと重なった。それから先のことは、三人しか知らない。翌朝、{a}と{b}と{c}は、誰からともなく照れくさそうに笑い合った。|寝室の戸が静かに閉まった。三人の小さな笑い声と息づかいが、しばらく廊下に漏れていた。翌朝の食卓は、いつもより少しだけ静かだった。');
  /* 形ごとの最中の段（{t}{m}{u}） */
  R3.MID = {
    oneTwo: L('{t}は{m}と{u}を並べて横たえ、二人に代わる代わる口づけを落とした。片方に触れているあいだも、もう片方の手を離さない。{m}と{u}の甘い声が、互いを呼び合うように重なっていった。|{t}は{m}を抱き寄せながら、もう片方の手で{u}の肌をなぞった。どちらも置いていかない――{t}のその決意が、指先から二人に伝わっていく。三人の息は、少しずつ同じ速さになった。'),
    twoOne: L('{t}と{m}は、{u}を両側から抱きしめた。前から唇を、後ろから首筋を求められて、{u}は息をつく暇もない。二人の手が、{u}の体の上で何度も重なった。|{u}は{t}と{m}のあいだで、もうどこに触れられているのか分からなくなっていた。{t}が深く求めるたびに、{m}が耳元でささやく。{u}の声は、二人の名前を交互に呼んでいた。'),
    sandwich: L('{t}が{m}を後ろから抱き、{m}はその腕の中で{u}を抱いた。三人の体が一つにつながり、{t}が動くたびに、その波が{m}を通って{u}まで届く。真ん中の{m}は、前と後ろから押し寄せる熱に声を震わせた。|{m}は{u}に覆いかぶさりながら、背中に{t}の体温を感じていた。前に進めば{u}が鳴き、後ろから押されれば自分が鳴く。三人の息づかいが、狭い布団の上で一つに溶けた。'),
    ring: L('三人は輪になって、互いの肌を求め合った。{t}が{m}を、{m}が{u}を、{u}が{t}を――誰もが誰かを抱き、誰かに抱かれている。終わりのない輪の中で、三人の声が重なり合った。|{t}と{m}と{u}は、互いの体に手を伸ばし合った。誰か一人が置いていかれないように、三人は何度も視線を交わした。新婚の寝室は、三人の熱でいっぱいになった。')
  };
  R3.PEAK = L('三人の声が、ほとんど同時に途切れた。誰が先だったのか、誰にも分からなかった。|最後の波が、三人をまとめて呑み込んだ。しばらく、誰も動けなかった。');
  R3.AFTER = L('事のあと、三人は汗ばんだ体を寄せ合ったまま、くすくすと笑い合った。{a}の右手は{b}と、左手は{c}とつながったままだった。|三人は布団に川の字になって、天井を見上げた。{b}が「三人だと、布団が足りない｜三人だと、布団が足りないな｜三人だと、布団が足りませんね」と言うと、{c}が吹き出し、{a}もつられて笑った。');
  function okPair(ctx) { return function (x, y) { return PR.sexOk(ctx, x, y); }; }
  R3.can = function (ctx, S) {
    var P = HK.Pos, g = [S.A0, S.B0, S.C0];
    if (HK.SAFE_ON || !P || !P.trioPlan || !HK.Trio3) return null;
    if (g.some(function (c) { var d = c.life && c.life.days && c.life.days[S.day.d]; return d && d.trip; })) return null;
    var pl = P.trioPlan(g[0], g[1], g[2], { ok: okPair(ctx) });
    return pl && pl.pairs && pl.pairs.length >= 2 ? pl : null;
  };
  R3.night = function (ctx, S, day, last) {
    var pl = R3.can(ctx, S);
    if (!pl || day.noSex) return false;
    var g = [S.A0, S.B0, S.C0], LV = HK.Lewd, env = ctx.env, lv = LV ? LV.lv(env) : 'mid';
    var a = g[Math.floor(ctx.rng() * 3)], bc = g.filter(function (c) { return c !== a; }), K = HK.ShinkonTrio;
    var lt = K.say(ctx, R3.LEAD, a, bc[0], bc[1]);
    var le = ctx.say({ kind: 'event', cat: 'romance', actors: g, text: lt, why: 'きっかけ：三人の夜（' + a.name + 'から）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    var text, sp = null;
    if (lv === 'low') text = K.say(ctx, R3.FADE, a, bc[0], bc[1]);
    else {
      sp = HK.Trio3.shapeOf(ctx, g, pl);
      if (!sp) return false;
      var nm = { t: sp.t.name, m: sp.m.name, u: sp.u.name }, sub = function (t) { return String(t).replace(/\{([tmu])\}/g, function (m0, k) { return nm[k]; }); };
      var pk = function (arr) { return arr[Math.floor(ctx.rng() * arr.length)]; };
      var short = !!(LV && LV.short && LV.short(env, ctx.rng));
      var body = HK.Trio3.quick(ctx, g, { sp: sp, plan: pl, env: env, ero: !!(LV && LV.ero && LV.ero(env)), short: short, mid: sub(pk(R3.MID[sp.p] || R3.MID.ring)), peak: pk(R3.PEAK) });
      if (!body) return false;
      text = body + '\n\n' + K.say(ctx, R3.AFTER, a, bc[0], bc[1]);
    }
    var e = ctx.act2({ actors: g, cat: 'romance', text: text, why: '新婚部屋：三人の夜（' + (sp ? { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: '真ん中の' + sp.m.name + 'を挟んで', ring: '輪になって' }[sp.p] : 'ほのめかす') + '）',
      sex: true, lewd: lv !== 'low', trioPairs: pl.pairs, fx: function () { ctx.mod2(g[0], g[1], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[0], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[1], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); } });
    if (!e) return false;
    S.trioSex = (S.trioSex || 0) + 1;
    return true;
  };
})();
/* r18:end */
