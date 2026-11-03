/* 箱庭シミュレーター: 出られない部屋「誰かを殺さないと出られない」の殺し合い（全年齢版・R18版の共通。2026-10-31 担当KR）
   利用者の報告（2026-10-31）：「二人で殺し合おうとしたときに殺し合いがうまく発生しない。憎悪を抱いているかいないかにも関わらず。
     今は一人が一方的に殺す展開しかないが、複数いる時の庇いによる死や、乱闘、殺し合いが発生することもあってほしい。
     関係性や人数によるさまざまな殺し合いのきっかけ＆その末に誰が死ぬことになったのか、を明記してください」
   調べたこと（docs/reports/2026-10-31/room-kill.md）：scenario-room.js の cond_kill の重み・踏み切りに、憎悪・敵対・不仲・負の好意・緊張・恨み・怒りが
     一切入っていなかった（重みの割合は 1 手番あたり 2〜4%）。焦り 40 の門は、短い部屋（6 時間）で前半の手番をすべて止めていた。
   ■ 殺意（HK.RoomKill.hate）：敵対（憎悪の度合い）・不仲・負の好意・緊張・恨み（flags.revenge）・気分の怒り・恐怖の捨て身。
     重み（w）と踏み切り（will）に足し、焦りの門（gate）を殺意と残り時間（切羽詰まり）で下げる。「殺さない」設定（HK.Attr.spare）・関係の倍率はそのまま
   ■ 出来事（どれも、殺す条件があって、関わる人が部屋にいて倒れていない・気絶していないときだけ）
     ・cond_kill（既存。抜け駆けの殺し）：scenario-room.js の run から HK.RoomKill.attack を呼ぶ。踏みとどまる／庇い死／返り討ち／狙った相手を殺す
     ・rk_duel   殺し合い：双方に殺意。強い方が勝つ・先に仕掛けた弱い方が返り討ち・相打ち（両方死ぬ）・とどめを刺さない（殺さない設定）
     ・rk_shield 庇い死（三人以上）：a が b を襲い、b を想う c が割って入って死ぬ。b は a を恨む
     ・rk_brawl  乱闘（三人以上）：口論が殴り合いに広がり、派閥・好意で組が分かれ、巻き込まれた一人（体力の低い人・止めに入った人・いちばん嫌われている人）が死ぬ
     ・rk_revenge 復讐：殺された人を想う人が、殺した人を討つ（条件を満たしたあとでも、部屋に残っていれば起きる）
   ■ 記録：本文・理由（why）・時系列の札に、きっかけ（なぜ・誰が・何に追い詰められて）と結果（誰が死んだか・なぜその人か）を書く。
     理由の頭の「［種類］」を view.js が札にする（殺し：殺し合い など。全年齢は 気絶：…）。結末の段（room-end.js の締め）と結果一覧（fateNote）にも書き足す。
     ctx.flags.killLog に { kind, killer, victim, deadWhy } を残す（計測・結末の書き足し用）
   ■ 全年齢版・全年齢モード：殺す代わりに気絶させる・大けがで動けなくする（knocked。数え方は今までどおり）。文も気絶・大けがに読み替える
   ■ 文：地の文は 1 分岐 3 文以上（きっかけ・行い・結果）。台詞は 3 本「くだけた常体｜硬い常体｜敬語」で、話し手を「＠名前＠」で固定する。
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.RoomAPI, scen = HK && HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!HK || !A || !scen || !A.EV || !HK.addTo) return;
  function L(s) { return s.split('|'); }
  function ev(o) { HK.addTo(A.EV, o); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function safe() { return !!HK.SAFE_ON; }
  function rule(ctx) { return (ctx.rules || []).filter(function (r) { return r.k === 'kill'; })[0]; }
  function live(ctx) { var r = rule(ctx); return !!r && !A.globDone(ctx, r); }
  function here(c) { return !!c && c.alive !== false && !c.out && !c.gone && !(c.flags && (c.flags.down || c.flags.knocked || c.flags.caged != null)); }
  function spare(ctx, v, k) { return !!(HK.Attr && HK.Attr.spare && HK.Attr.spare(ctx, v, k)); }
  function nm(l) { return A.names(l); }
  function cl(x, lo, hi) { return HK.clamp(x, lo, hi); }
  function pick(ctx, l) { return ctx.pick(l); }
  function dk(ctx) { return HK.Dark ? HK.Dark.f(ctx, 'kill') : 1; }
  /* 全年齢（気絶させる部屋）：本文と理由の「殺意」「殺してやりたい」「手にかけた」を、敵意・叩きのめす・傷つけたに読み替える */
  var SW = [[/殺意/g, '敵意'], [/殺してやりたい/g, '叩きのめしてやりたい'], [/手にかけ/g, '傷つけ'], [/殺し合い/g, 'つかみ合い'], [/殺そうとして/g, '倒そうとして'], [/殺しても/g, '倒しても']];
  function sw(r) {
    if (!r || !safe()) return r;
    SW.forEach(function (p) { r.text = String(r.text || '').replace(p[0], p[1]); r.why = String(r.why || '').replace(p[0], p[1]); });
    return r;
  }

  /* ---------- 残り時間（切羽詰まり） ---------- */
  function rem(ctx) { return 1 - (ctx.stepIndex || 0) / Math.max(1, (ctx.stepsTotal || 2) - 1); }
  function urg(ctx) { var r = rem(ctx); return r <= 0.1 + 1e-9 ? 1 : r <= 0.3 + 1e-9 ? 0.6 : r <= 0.5 + 1e-9 ? 0.25 : 0; }
  function hoursLeft(ctx) {
    var H = +(ctx.env && ctx.env.hours) || 0, h = Math.max(1, Math.round(H - (ctx.stepIndex || 0) * (ctx.stepH || 1)));
    return h >= 24 ? Math.floor(h / 24) + '日' + (h % 24 ? 'と' + (h % 24) + '時間' : '') : h + '時間';
  }

  /* ---------- 殺意（a から b へ）：{ v: 0〜2 くらい, src: 一番大きい理由の鍵, why: 理由の文 } ---------- */
  var TIES = HK.TIES || {};
  function tiesOf(ctx, a, b) { return HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) : []; }
  function fearOf(ctx, a, b) { return tiesOf(ctx, a, b).some(function (t) { return t.type === 'fear' && t.a === a.i; }); }
  function hate(ctx, a, b) {
    var r = ctx.R(a, b), parts = [];
    var ht = HK.Ties && HK.Ties.hostile ? HK.Ties.hostile(ctx, a, b) : null;
    if (ht) {
      var D = TIES[ht.type] || {};
      parts.push(['tie', (D.hate >= 2 ? 0.55 : 0.25) + (ht.grade === 'hate' ? 0.3 : 0), (ht.grade === 'hate' ? '憎悪' : D.label || '敵対') + 'の相手']);
    }
    if (r.aff < 0) parts.push(['aff', -r.aff / 100 * 0.6, '好意 ' + Math.round(r.aff)]);
    if (r.ten > 30) parts.push(['ten', (r.ten - 30) / 100 * 0.5, '緊張 ' + Math.round(r.ten)]);
    if (a.flags && a.flags.revenge === b.i) parts.push(['revenge', 0.75, '仇']);
    var ang = a.emo && a.emo.anger || 0;
    if (ang > 20) parts.push(['anger', ang / 100 * 0.35, '怒り ' + Math.round(ang)]);
    if (fearOf(ctx, a, b) && a.stress > 45) parts.push(['fear', 0.15 + (a.stress - 45) / 100 * 0.5, '恐怖の捨て身']);
    /* 愛憎：嫌いながら構いたい相手には、手が鈍る */
    var lh = tiesOf(ctx, a, b).some(function (t) { return t.type === 'lovehate' && (t.a === a.i || t.cold === 'both'); });
    var v = parts.reduce(function (s, p) { return s + p[1]; }, 0) * (lh ? 0.8 : 1);
    var top = parts.slice().sort(function (x, y) { return y[1] - x[1]; })[0];
    return { v: v, src: top && top[1] >= 0.1 ? top[0] : '', why: parts.filter(function (p) { return p[1] >= 0.05; }).map(function (p) { return p[2]; }).join('・') + (lh ? '・愛憎' : '') };
  }
  /* 焦りの門：今までは 40。殺意があるほど・残り時間が少ないほど下げる */
  function gate(ctx, a, b) { return Math.max(0, 40 - 30 * Math.min(1, hate(ctx, a, b).v) - 25 * urg(ctx)); }
  /* 抜け駆けの重み：今までの式（ドライさ・攻撃性・焦り・好意）に、殺意と残り時間を足す */
  function base(ctx, a, b) { return a.tr.cold * 0.6 + a.tr.aggr * 0.5 - a.tr.np * 0.6 + a.stress / 140 - Math.max(0, ctx.R(a, b).aff) / 120 - 0.3; }
  function w(ctx, a, b) { return Math.max(0.02, base(ctx, a, b) + hate(ctx, a, b).v * 1.2 + urg(ctx) * 0.4); }
  /* 踏み切り：今までの will に、殺意・残り時間・踏みとどまった回数（追い詰められていく）を足す */
  function will(ctx, a, b, h) {
    var v = a.tr.cold * 0.6 + a.tr.aggr * 0.5 + a.stress / 160 - a.tr.np * 0.5 - Math.max(0, ctx.R(a, b).aff) / 90;
    return cl(v + (h || hate(ctx, a, b)).v * 0.9 + urg(ctx) * 0.35 + Math.min(3, (a.flags && a.flags.rkHeld) || 0) * 0.1, 0.05, 0.95);
  }

  /* ---------- 守る人（b を想う c）：恋人・親子・バディ・親友・信仰・恩人・主従・庇護など、または好意と信頼が高い ---------- */
  var SYM = { lover: 1, spouse: 1, mate: 1, fiance: 1, fated: 1, best: 1, buddy: 1, childhood: 0.6, sibling: 0.7, sibclose: 0.9, twin: 1 };
  var DIR_A = { parent: 1, pparent: 1, sibprot: 1, worship: 1, fond: 0.7, blind: 0.9, crush: 0.8, honmei: 0.9, yan: 0.9, mentor: 0.6, benefactor: 0.6 };
  var DIR_B = { master: 1, benefactor: 0.9, mentor: 0.6 };
  function roleOf(t, c) { var D = TIES[t.type] || {}; return D.dir ? (t.a === c.i ? D.roleA : D.roleB) : D.label; }
  function guardOf(ctx, a, b) {
    var best = null;
    ctx.present().forEach(function (c) {
      if (c === a || c === b || !here(c) || spare(ctx, c, a)) return;
      var r = ctx.R(c, b), v = 0, why = '';
      tiesOf(ctx, c, b).forEach(function (t) {
        var k = SYM[t.type] || (t.a === c.i ? DIR_A[t.type] : DIR_B[t.type]) || 0;
        if (k > v) { v = k; why = b.name + 'の' + (roleOf(t, c) || '大切な人'); }
      });
      if (!v && r.aff >= 45 && r.trust >= 25) { v = 0.5 + (r.aff - 45) / 100; why = b.name + 'を想う人（好意 ' + Math.round(r.aff) + '）'; }
      if (!v) return;
      v += c.tr.np * 0.4 + Math.max(0, r.aff) / 200;
      if (!best || v > best.v) best = { c: c, v: v, why: why };
    });
    return best && best.v >= 0.7 ? best : null;
  }

  /* ---------- 殺す・気絶させる（全年齢は気絶） ---------- */
  function knock(ctx, v, k) {
    v.flags.knocked = true; v.flags.down = 999; v.flags.knockedBy = k.i;
    ctx.chars.forEach(function (o) { if (o !== v && here(o) && ctx.R(o, v).aff > 35 && o !== k) { o.flags.revenge = k.i; ctx.stress(o, 20); } });
  }
  function hit(ctx, v, k, how) {
    if (!v || !k || spare(ctx, v, k)) return false;
    if (safe()) knock(ctx, v, k); else ctx.kill(v, k, how);
    return v.alive === false || !!v.flags.knocked;
  }
  function logK(ctx, o) { (ctx.flags.killLog = ctx.flags.killLog || []).push(o); }
  /* まわりの人の受け止め（殺した人を怖れ、信じなくなる） */
  function aftermath(ctx, k, skip) { ctx.present().forEach(function (o) { if (o !== k && (skip || []).indexOf(o) < 0) ctx.mod(o, k, { aff: -35, ten: 40, trust: -55 }); }); }

  /* ---------- 力比べ：ctx.power（体力・攻撃性・冷静さ）＋乱数。先に破片（全年齢は椅子の脚）を握った方に足す ---------- */
  function grabFirst(ctx, a, b) { return ctx.rng() < 0.5 + ((a.tr.a + a.tr.impulse) - (b.tr.a + b.tr.impulse)) * 0.25 ? a : b; }
  function contest(ctx, a, b) {
    var sp = 25 + (ctx.chaos || 0.3) * 30, first = grabFirst(ctx, a, b);
    var pa = ctx.power(a) + ctx.rng() * sp + (first === a ? 12 : 0), pb = ctx.power(b) + ctx.rng() * sp + (first === b ? 12 : 0);
    return { win: pa >= pb ? a : b, lose: pa >= pb ? b : a, diff: Math.abs(pa - pb), first: first };
  }
  /* 負けた理由（いちばん差の大きいもの） */
  function loseWhy(ctx, win, lose, first, wpn) {
    var c = [
      [(ctx.stat(win, 'hp') - ctx.stat(lose, 'hp')) * 5, '体力で劣った'],
      [(win.tr.aggr - lose.tr.aggr) * 15, '攻撃性で劣った'],
      [(lose.tr.np - win.tr.np) * 12, '最後の一瞬にためらった'],
      [first === win ? 6 : 0, '先に' + (wpn || '武器') + 'を握られた']
    ].sort(function (x, y) { return y[0] - x[0]; });
    return c[0][0] > 2 ? c[0][1] : '力が拮抗し、わずかな差で押し負けた';
  }
  function weapon(ctx) { return safe() ? pick(ctx, ['外した椅子の脚', '壁から剥がれた手すり', '重い水差し']) : pick(ctx, ['割れた照明の破片', '外した椅子の脚', 'ベッドの金具', '壁から剥がれた手すり']); }

  /* ---------- きっかけの一文（殺意の一番大きい理由・残り時間・焦り） ---------- */
  var TRIG = {
    tie: L('{a}にとって{b}は、もともと憎い相手だった。扉の紙の「誰かを」という一文が、その憎しみに理由を与えた。|{a}は{b}を見るたびに、昔からの憎しみが喉元までせり上がってきた。条件の紙は、それを許すと言っていた。|{a}は、同じ部屋の空気を吸うのも嫌な相手が{b}であることを、ずっと呪っていた。紙の条件を読み返すたび、その呪いは形を持っていった。'),
    aff: L('閉じ込められてからの時間が、{a}の中の{b}への嫌悪を育てていた。もう、相手を思いやる余裕はどこにもなかった。|ささいな言い合いが積み重なり、{a}は{b}を許せなくなっていた。扉の紙の条件が、頭から離れなかった。'),
    ten: L('{a}と{b}のあいだの空気は、もう張り詰めきっていた。どちらが先に動くかの問題だった。|{a}は、{b}が自分を見る目に怯えていた。やられる前に、という考えが頭をよぎった。'),
    revenge: L('{a}の目には、仲間を奪われたあの瞬間からの憎しみが残っていた。仇は、目の前にいた。|{a}は、{b}が何をしたかを一瞬も忘れていなかった。泣き尽くしたあとに残ったのは、冷たい決意だった。'),
    anger: L('{a}の怒りは、とうに限界を越えていた。{b}の一言が、最後の糸を切った。|{a}は苛立ちを抑えきれず、拳を握りしめていた。怒りの矛先は、目の前の{b}に向いた。'),
    fear: L('{a}は{b}が怖くてたまらなかった。追い詰められた恐怖が、{a}を捨て身にさせた。|{a}は震える手で、何度も{b}の様子をうかがっていた。怖い相手から逃げる道は、もう一つしか残っていなかった。'),
    time: L('残り時間は{h}しかなかった。このままでは、誰も出られない。|照明が一段暗くなった。残り{h}。{a}は、もう待てなかった。|時計の針が、残り{h}を指していた。{a}の中で、何かが切れた。'),
    cold: L('{a}は、条件を淡々と計算していた。誰か一人がいなくなれば、扉は開く。|{a}は、感情を切り離して考えた。出るために必要なのは、誰か一人の命だけだった。'),
    plain: L('焦りが、{a}の判断を少しずつ狂わせていた。紙の条件から、目を逸らせなくなっていた。|眠れない夜が続き、{a}の考えは一つのところへ落ちていった。誰かがいなくならなければ、扉は開かない。')
  };
  var TRIG_SAFE = {
    cold: L('{a}は、条件を淡々と計算していた。誰か一人が気を失えば、扉は開く。|{a}は、感情を切り離して考えた。出るために必要なのは、誰か一人が倒れることだけだった。'),
    plain: L('焦りが、{a}の判断を少しずつ狂わせていた。紙の条件から、目を逸らせなくなっていた。|眠れない夜が続き、{a}の考えは一つのところへ落ちていった。誰かが倒れなければ、扉は開かない。')
  };
  function trigKey(ctx, a, b, h) {
    if (h.src && h.v >= 0.2) return h.src;
    if (urg(ctx) >= 0.6) return 'time';
    if (a.tr.cold > 0.6) return 'cold';
    return 'plain';
  }
  function trigText(ctx, a, b, h) {
    var k = trigKey(ctx, a, b, h), pool = (safe() && TRIG_SAFE[k]) || TRIG[k];
    var t = pick(ctx, pool);
    if (k !== 'time' && urg(ctx) >= 0.6 && ctx.rng() < 0.6) t += pick(ctx, ['残り時間は、{h}しかなかった。', '残りは{h}。照明は、また一段暗くなっていた。']);
    return t.replace(/\{h\}/g, hoursLeft(ctx));
  }
  var TRIG_NAME = { tie: '敵対・憎悪', aff: '積もった嫌悪', ten: '張り詰めた緊張', revenge: '仇討ち', anger: '怒り', fear: '恐怖の捨て身', time: '時間切れが迫った', cold: '条件の計算', plain: '焦り' };
  function trigWhy(ctx, a, b, h) {
    var k = trigKey(ctx, a, b, h);
    return a.name + 'が' + b.name + 'に向けた殺意（' + TRIG_NAME[k] + (h.why ? '：' + h.why : '') + '）。焦り ' + Math.round(a.stress) + '・残り' + hoursLeft(ctx);
  }

  /* ---------- 踏みとどまる（状況で書き分ける。同じ文の連発を避ける） ---------- */
  var HOLD = {
    love: L('{a}は眠る{b}の横に膝をついた。手を伸ばせば届く距離だった。けれど、{b}の寝息を聞いているうちに、{a}の指から力が抜けていった。|{a}は{b}の背中を見つめていた。今なら、と思った。そのとき{b}が振り返って笑い、{a}は握っていたものを背中に隠した。|{a}は{b}の肩に手を置いた。そのまま力を込めるつもりだった。「＠{b}＠どうしたの？｜どうした？｜どうしました？」と見上げられて、{a}は何も言えずに手を離した。'),
    hate: L('{a}は{b}の背後に立った。憎いはずの相手なのに、握った拳がどうしても上がらなかった。{a}は舌打ちして、壁際へ戻った。|{a}は{b}を睨みつけたまま、長いあいだ動かなかった。殺してやりたいと思っていた。それでも、最後の一歩が出なかった。|{a}は{b}に詰め寄りかけて、足を止めた。憎しみより先に、自分が何になるのかが怖くなった。{a}は床に唾を吐いて、背を向けた。'),
    fear: L('{a}は{b}の様子をうかがいながら、何度も立ち上がりかけた。そのたびに膝が震えた。結局、{a}は部屋の隅で膝を抱えた。|{a}は{b}に近づこうとして、目が合った瞬間に凍りついた。怖い相手に手をかけることなど、{a}にはできなかった。{a}は視線を落とした。'),
    noticed: L('{a}がそっと立ち上がった瞬間、{b}が振り返った。二人の視線がぶつかった。{a}は何事もなかったように、扉の紙を眺めるふりをした。|{a}が近づく足音に、{b}が身を固くした。{a}は手の中のものを、床に落とした。乾いた音が、白い部屋に響いた。'),
    time: L('{a}は時計を見上げた。残りは{h}。今しかない、と分かっていた。それでも{a}の手は、{b}の前で止まった。|{a}は{b}の前に立ち、深く息を吸った。残り{h}。{a}は吐いた息と一緒に、その考えを手放した。'),
    plain: L('{a}は{b}の背後に回りかけて、途中で足を止めた。「＠{a}＠……できるわけ、ない｜……できるわけがない｜……できるわけ、ありません」{a}は床に座り込んだ。|{a}は手の中のものを見つめ、それから{b}を見た。指先が、ひどく冷たかった。{a}は黙って、それを部屋の隅へ放った。|{a}は扉の紙を握りつぶした。誰かを手にかけて出る自分を、どうしても思い描けなかった。{a}は壁に背を預けて、目を閉じた。')
  };
  function holdKey(ctx, a, b, h) {
    var r = ctx.R(a, b);
    if (h.src === 'fear') return 'fear';
    if (r.aff >= 30) return 'love';
    if (h.v >= 0.35) return 'hate';
    if (urg(ctx) >= 0.6) return 'time';
    if (b.tr.caution > 0.55 && ctx.rng() < 0.5) return 'noticed';
    return 'plain';
  }
  var HOLD_WHY = { love: '{b}への好意', hate: '憎しみより、手を汚す怖さが勝った', fear: '{b}への恐怖で近づけなかった', noticed: '{b}に気づかれた', time: '時間がないと分かっていても手が止まった', plain: '優しさ・ためらい' };
  function holdBack(ctx, a, b, h) {
    var k = holdKey(ctx, a, b, h);
    /* 直前に同じ人が同じ文を使っていれば、別の状況の文にする */
    var used = (a.flags.rkHoldUsed = a.flags.rkHoldUsed || {});
    if (used[k] && k !== 'plain') k = used.plain ? (urg(ctx) >= 0.25 ? 'time' : 'plain') : 'plain';
    used[k] = (used[k] || 0) + 1;
    a.flags.rkHeld = (a.flags.rkHeld || 0) + 1;
    ctx.stress(a, 10); ctx.mod(b, a, { ten: 12, trust: -10 });
    var t = trigText(ctx, a, b, h) + pick(ctx, HOLD[k]).replace(/\{h\}/g, hoursLeft(ctx));
    logK(ctx, { kind: 'held', killer: a.i, victim: null, deadWhy: k });
    return { mag: 20, text: ctx.t(t, a, b), why: '［踏みとどまり］きっかけ：' + trigWhy(ctx, a, b, h) + '／' + a.name + 'は踏みとどまった（' + HOLD_WHY[k].replace('{b}', b.name) + '。踏みとどまったのは' + a.flags.rkHeld + '度目）' };
  }

  /* ---------- 抜け駆けの殺し（狙った相手を手にかける） ---------- */
  var SNEAK = L('{a}は{b}の背後に回り、迷いを振り切るように腕に力を込めた。{b}がもがくのをやめたとき、扉の紙の文字が一つ消えた。|{a}は{w}を、{b}に振り下ろした。{b}は信じられないものを見る目で、{a}を見上げた。{a}は目を逸らさなかった。|{a}は眠っている{b}のそばに膝をつき、そのまま覆いかぶさった。短い抵抗のあと、部屋は静かになった。|「＠{a}＠ごめん｜すまない｜ごめんなさい」――それが、{a}が{b}にかけた最後の言葉だった。{w}が振り下ろされ、{b}は二度と起き上がらなかった。');
  var SNEAK_SAFE = L('{a}は{b}の背後に回り、首筋を強く打った。{b}は声もなく崩れ落ちた。扉の紙の文字が、一つ消えた。|{a}は{b}の口元に、部屋の隅にあった薬を染み込ませた布を押し当てた。{b}の体から、ゆっくりと力が抜けていった。{a}は{b}を床に横たえた。|揉み合いになった末、{b}は壁に頭を打ちつけて動かなくなった。息はある。{a}は肩で息をしながら、扉の紙を見上げた。');
  function targetWhy(ctx, a, b, h) {
    if (h.v >= 0.35) return a.name + 'がいちばん憎んでいた相手だった';
    var P = ctx.present().filter(function (c) { return c !== a && here(c); });
    if (P.length > 1 && P.every(function (c) { return c === b || ctx.power(c) >= ctx.power(b); })) return 'いちばん抵抗できそうになかった';
    if (P.length <= 1) return '部屋にいるのは二人だけだった';
    return 'たまたま' + a.name + 'のそばで背を向けていた';
  }
  function sneak(ctx, a, b, h) {
    var why = targetWhy(ctx, a, b, h);
    var t = trigText(ctx, a, b, h) + pick(ctx, safe() ? SNEAK_SAFE : SNEAK).replace(/\{w\}/g, weapon(ctx));
    if (!hit(ctx, b, a, '部屋の条件のために（' + why + '）')) return holdBack(ctx, a, b, h);
    aftermath(ctx, a, [b]);
    logK(ctx, { kind: 'sneak', killer: a.i, victim: b.i, deadWhy: why });
    return { mag: 60, text: ctx.t(t, a, b), why: '［抜け駆け］きっかけ：' + trigWhy(ctx, a, b, h) + '／' + (safe() ? '気絶した人：' : '死んだ人：') + b.name + '（' + why + '）' };
  }

  /* ---------- 返り討ち（襲った側が、逆にやられる） ---------- */
  function backP(ctx, a, b) {
    return cl(0.06 + (ctx.power(b) - ctx.power(a)) / 150 + b.tr.aggr * 0.2 + (fearOf(ctx, b, a) ? 0.2 : 0) + hate(ctx, b, a).v * 0.15, 0.03, 0.55);
  }
  var BACK = L('{a}が{w}を振り上げた瞬間、{b}が身を翻した。{b}は{a}の腕をつかんでねじり上げ、{w}を奪い取った。次の瞬間、倒れていたのは{a}の方だった。|{a}は{b}に飛びかかった。けれど、{b}は待っていたかのように身をかわし、{a}を床に叩きつけた。{b}は手を止めなかった。|{a}の手が{b}の首にかかった。{b}は必死にもがき、指先に触れた{w}をつかんで振り回した。鈍い音のあと、{a}の手から力が抜けた。');
  var BACK_SAFE = L('{a}が{w}を振り上げた瞬間、{b}が身を翻した。{b}は{a}の腕をつかんでねじり上げ、そのまま床に押さえ込んだ。{a}は頭を打って、気を失った。|{a}は{b}に飛びかかった。けれど、{b}は待っていたかのように身をかわし、{a}を壁に叩きつけた。{a}はずるずると座り込み、動かなくなった。|{a}の手が{b}の肩にかかった。{b}は必死に振りほどき、{a}を突き飛ばした。{a}はテーブルの角に頭をぶつけて、気を失った。');
  var BACK_REACT = {
    proud: '「＠{b}＠私を狙ったのが、間違いだった｜私を狙ったのが間違いだ｜私を狙ったのが、間違いでした」', stern: '「＠{b}＠……先に手を出したのは、そっちだ｜……先に手を出したのはそちらだ｜……先に手を出したのは、そちらです」',
    tsun: '「＠{b}＠あなたが悪いんだから……！｜あなたが悪いんだ……！｜あなたが悪いんです……！」', gentle: '{b}は自分の手を見下ろして、声もなく泣き出した。',
    devoted: '{b}は震えながら、{a}のそばに座り込んだ。', cool: '{b}は荒い息を整え、乱れた襟を直した。', free: '「＠{b}＠……生きてる｜……生きている｜……生きてます」{b}は笑おうとして、うまく笑えなかった。',
    shy: '{b}は悲鳴を飲み込んで、部屋の隅まで後ずさった。', polite: '「＠{b}＠……こうするしかなかった｜＝｜……こうするしか、なかったんです」{b}は乱れた襟を直して、深く息をついた。'
  };
  function backfire(ctx, a, b, h) {
    var why = (fearOf(ctx, b, a) ? b.name + 'は怯えきっていて、捨て身で抵抗した' : ctx.power(b) > ctx.power(a) ? b.name + 'の方が力で勝っていた' : b.name + 'が先に気づいて身をかわした');
    var t = trigText(ctx, a, b, h) + pick(ctx, safe() ? BACK_SAFE : BACK).replace(/\{w\}/g, weapon(ctx)) + BACK_REACT[ps(b)];
    if (!hit(ctx, a, b, b.name + 'を殺そうとして、返り討ちにあった（' + why + '）')) return holdBack(ctx, a, b, h);
    ctx.stress(b, 25);
    aftermath(ctx, b, [a]);
    logK(ctx, { kind: 'backfire', killer: b.i, victim: a.i, deadWhy: why });
    return { mag: 60, text: ctx.t(t, a, b), why: '［返り討ち］きっかけ：' + trigWhy(ctx, a, b, h) + '／' + (safe() ? '気絶した人：' : '死んだ人：') + a.name + '（襲った側。' + why + '）' };
  }

  /* ---------- 庇い死（三人以上） ---------- */
  var SHIELD = L('{a}が{w}を手に、{b}へ向かっていった。そのとき、{c}が二人のあいだに飛び込んだ。{w}は、{c}の体に深く沈んだ。|{a}の手が{b}に届く寸前、{c}が{b}を突き飛ばした。代わりに{a}の一撃を受けたのは、{c}だった。{c}は{b}の方を見て、少しだけ笑った。|{c}は、{a}の様子がおかしいことに気づいていた。{a}が{b}に襲いかかった瞬間、{c}は迷わず前に出た。床に倒れたのは、{c}だった。');
  var SHIELD_SAFE = L('{a}が{w}を手に、{b}へ向かっていった。そのとき、{c}が二人のあいだに飛び込んだ。{w}は{c}の頭をかすめ、{c}はその場に崩れ落ちた。|{a}の手が{b}に届く寸前、{c}が{b}を突き飛ばした。代わりに{a}の一撃を受けたのは、{c}だった。{c}は大けがを負って、動けなくなった。|{c}は、{a}の様子がおかしいことに気づいていた。{a}が{b}に襲いかかった瞬間、{c}は迷わず前に出た。床に倒れて気を失ったのは、{c}だった。');
  var SHIELD_A = L('{a}は、自分が誰を手にかけたのかを理解して、立ち尽くした。|「＠{a}＠違う、あなたじゃ……｜違う、あなたでは……｜違うんです、あなたでは……」{a}の声は震えていた。|{a}は{w}を取り落とした。狙った相手は、まだ生きていた。');
  var SHIELD_B = L('{b}は{c}にすがりついて、何度も名前を呼んだ。それから、ゆっくりと{a}を振り返った。その目には、もう涙しかなかった――憎しみの涙だった。|{b}は{c}の手を握ったまま、{a}を睨んだ。「＠{b}＠絶対に、許さない｜絶対に許さない｜絶対に、許しません」|{b}は声も出せずに、{c}を抱き起こそうとした。{a}への憎しみが、{b}の中で静かに形を持った。');
  function shield(ctx, a, b, g, h) {
    var c = g.c, wpn = weapon(ctx);
    var t = trigText(ctx, a, b, h) + pick(ctx, safe() ? SHIELD_SAFE : SHIELD) + pick(ctx, SHIELD_A) + pick(ctx, SHIELD_B);
    t = t.replace(/\{w\}/g, wpn);
    if (!hit(ctx, c, a, b.name + 'を庇って（' + a.name + 'の狙いは' + b.name + 'だった）')) return null;
    ctx.stress(a, 20); ctx.stress(b, 30);
    ctx.mod(b, a, { aff: -50, ten: 50, trust: -60 });
    if (!spare(ctx, a, b)) b.flags.revenge = a.i;
    aftermath(ctx, a, [c, b]);
    logK(ctx, { kind: 'shield', killer: a.i, victim: c.i, target: b.i, deadWhy: c.name + 'は' + g.why + 'で、' + b.name + 'を庇った' });
    return { mag: 65, with: [c], text: ctx.t(t, a, b, c), why: '［庇い死］きっかけ：' + trigWhy(ctx, a, b, h) + '／' + (safe() ? '気絶した人：' : '死んだ人：') + c.name + '（' + g.why + '。' + b.name + 'を庇って、' + a.name + 'の一撃を受けた）。' + b.name + 'は' + a.name + 'を恨んだ' };
  }

  /* ---------- 攻撃（cond_kill の run から呼ぶ） ---------- */
  function attack(ctx, a, b) {
    var h = hate(ctx, a, b);
    if (ctx.rng() > will(ctx, a, b, h)) return holdBack(ctx, a, b, h);
    var g = ctx.present().length >= 3 ? guardOf(ctx, a, b) : null;
    if (g && ctx.rng() < 0.25 + g.v * 0.25) { var s = shield(ctx, a, b, g, h); if (s) return s; }
    if (!spare(ctx, a, b) && ctx.rng() < backP(ctx, a, b)) return backfire(ctx, a, b, h);
    return sneak(ctx, a, b, h);
  }

  /* ---------- 殺し合い（双方に殺意） ---------- */
  function mutual(ctx, a, b) { return hate(ctx, a, b).v >= 0.35 && hate(ctx, b, a).v >= 0.3; }
  var DUEL_GO = L('{a}と{b}は、ほとんど同時に立ち上がった。互いに、相手が何をしようとしているのかが分かっていた。最初に動いたのは{a}だった。|「＠{a}＠どうせ、どっちかしか出られない｜どうせ、どちらかしか出られない｜どうせ、どちらかしか出られません」{a}の言葉に、{b}は黙って身構えた。二人のあいだの距離が、一歩ずつ縮まった。|{b}が{w}を拾い上げるのを見て、{a}も手近なものをつかんだ。言葉は、もう要らなかった。');
  var DUEL_WIN = L('もつれ合ったまま床を転がり、上になったのは{a}だった。{a}は{w}を振り下ろした。一度、二度。{b}はもう動かなかった。|{b}の一撃は、{a}の肩をかすめただけだった。{a}は懐に飛び込み、{b}を壁に叩きつけた。崩れ落ちた{b}が、起き上がることはなかった。|息が切れ、二人とも血まみれだった。最後に立っていたのは{a}だった。{b}の手から{w}が転がり落ちた。');
  var DUEL_WIN_SAFE = L('もつれ合ったまま床を転がり、上になったのは{a}だった。{a}は{b}を押さえ込み、首筋を強く打った。{b}はぐったりと動かなくなった。|{b}の一撃は、{a}の肩をかすめただけだった。{a}は懐に飛び込み、{b}を壁に叩きつけた。{b}は頭を打って、気を失った。|息が切れ、二人ともあざだらけだった。最後に立っていたのは{a}だった。{b}は大けがを負って、床から起き上がれなかった。');
  var DUEL_MUTUAL = L('二人はもつれ合い、同時に相手の体に{w}を突き立てた。{a}と{b}は、折り重なるように倒れた。白い部屋に、もう動く者はいなかった。|{a}の一撃と{b}の一撃は、ほとんど同時だった。二人は互いを見たまま、床に崩れた。扉の紙の文字が消えたことを、見届ける者はいなかった。');
  var DUEL_MUTUAL_SAFE = L('二人はもつれ合い、そのまま一緒に壁へ激突した。{a}と{b}は、折り重なるように倒れて気を失った。白い部屋に、起きている者はいなかった。|{a}の一撃と{b}の一撃は、ほとんど同時だった。二人は互いをつかんだまま、床に崩れて動かなくなった。扉の紙の文字が消えたことを、見届ける者はいなかった。');
  var DUEL_SPARE = L('{a}は{b}を床に押さえつけ、{w}を振り上げた。けれど、その手は振り下ろされなかった。{a}は{b}を突き放して、壁際へ戻った。|勝負はついていた。{a}は倒れた{b}を見下ろしたまま、とどめを刺さずに背を向けた。{b}は大けがで、しばらく動けそうになかった。');
  var DUEL_STAND = L('二人は睨み合ったまま、長いあいだ動かなかった。先に目を逸らしたのは{b}だった。{a}も、握っていたものを床に落とした。|つかみ合いになりかけたところで、二人とも手を止めた。荒い息だけが、白い部屋に響いた。どちらも、最後の一線を越えられなかった。');
  var WIN_LINE = {
    proud: '「＠{a}＠私が負けるわけ、ないでしょ｜私が負けるはずがない｜私が負けるはずがありません」', stern: '「＠{a}＠……終わった｜……終わった｜……終わりました」{a}は短くそう言って、扉の方を向いた。',
    tsun: '「＠{a}＠あなたが先に来たんだから。……私は悪くない｜あなたが先に来たんだ。……私は悪くない｜あなたが先に来たんです。……私は悪くありません」', gentle: '「＠{a}＠……ごめん｜……すまない｜……ごめんなさい」{a}は泣きながら、何度もそう繰り返した。',
    devoted: '「＠{a}＠こうするしか、なかった……｜こうするしかなかった……｜こうするしか、なかったんです……」', cool: '{a}は荒い息を整え、乱れた袖を直した。表情は、少しも変わらなかった。',
    free: '「＠{a}＠……生きてる｜……生きている｜……生きてます」{a}は笑おうとして、うまく笑えなかった。', shy: '{a}は自分の手を見下ろして、がたがたと震え出した。',
    polite: '「＠{a}＠……こうするしかなかった｜＝｜……こうするしか、なかったんです」{a}は乱れた髪を整えて、静かに目を伏せた。'
  };
  function duel(ctx, a, b) {
    var ha = hate(ctx, a, b), hb = hate(ctx, b, a), wpn = weapon(ctx);
    var trig = trigText(ctx, a, b, ha) + (hb.v >= 0.35 && hb.src !== ha.src ? pick(ctx, ['{b}の方も、同じ目で{a}を見ていた。', '{b}もまた、{a}を生かしておく気はなかった。']) : '');
    var tw = '{a}と{b}は互いに殺意を抱いていた（' + a.name + '：' + (ha.why || '焦り') + '／' + b.name + '：' + (hb.why || '焦り') + '）。焦り ' + Math.round(a.stress) + '・' + Math.round(b.stress) + '・残り' + hoursLeft(ctx);
    tw = tw.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
    var go = pick(ctx, DUEL_GO);
    /* 二人とも踏み切れなければ、睨み合いで終わる */
    if (ctx.rng() > will(ctx, a, b, ha) && ctx.rng() > will(ctx, b, a, hb)) {
      a.flags.rkHeld = (a.flags.rkHeld || 0) + 1; b.flags.rkHeld = (b.flags.rkHeld || 0) + 1;
      ctx.mod2(a, b, { ten: 15 }, { ten: 15 }); ctx.stress(a, 8); ctx.stress(b, 8);
      logK(ctx, { kind: 'held', killer: a.i, victim: null, deadWhy: 'stand' });
      return { mag: 30, text: ctx.t((trig + go + pick(ctx, DUEL_STAND)).replace(/\{w\}/g, wpn), a, b), why: '［踏みとどまり］きっかけ：' + tw + '／殺し合いになりかけたが、二人とも最後の一線を越えられなかった' };
    }
    var r = contest(ctx, a, b), win = r.win, lose = r.lose;
    var both = r.diff < 6 && ctx.rng() < 0.18 * dk(ctx) && !spare(ctx, a, b) && !spare(ctx, b, a);
    var tag = safe() ? '気絶した人：' : '死んだ人：';
    if (both) {
      var t2 = trig + go + pick(ctx, safe() ? DUEL_MUTUAL_SAFE : DUEL_MUTUAL);
      hit(ctx, b, a, a.name + 'との殺し合いの末に、相打ちになった'); hit(ctx, a, b, b.name + 'との殺し合いの末に、相打ちになった');
      logK(ctx, { kind: 'mutual', killer: a.i, victim: b.i, deadWhy: '力が拮抗し、互いの一撃が同時に届いた' });
      logK(ctx, { kind: 'mutual', killer: b.i, victim: a.i, deadWhy: '力が拮抗し、互いの一撃が同時に届いた' });
      return { mag: 70, text: ctx.t(t2.replace(/\{w\}/g, wpn), a, b), why: '［相打ち］きっかけ：' + tw + '／' + tag + a.name + 'と' + b.name + '（力が拮抗し、互いの一撃が同時に届いた。' + (ctx.present().length ? '' : '部屋に残った人はいない') + '）' };
    }
    var lw = loseWhy(ctx, win, lose, r.first, wpn), counter = lose === a;
    var body = pick(ctx, safe() ? DUEL_WIN_SAFE : DUEL_WIN);
    if (spare(ctx, lose, win)) {
      lose.flags.down = 3; lose.hp -= 20;
      ctx.mod2(lose, win, { ten: 20 }, { ten: 10 });
      logK(ctx, { kind: 'held', killer: win.i, victim: null, deadWhy: 'spare' });
      return { mag: 40, text: ctx.t((trig + go).replace(/\{w\}/g, wpn), a, b) + ctx.t(pick(ctx, DUEL_SPARE).replace(/\{w\}/g, wpn), win, lose), why: '［踏みとどまり］きっかけ：' + tw + '／' + win.name + 'が勝ったが、「憎悪を持っても殺さない」相手なので、とどめを刺さなかった（' + lose.name + 'は大けが）' };
    }
    if (!hit(ctx, lose, win, (counter ? '先に仕掛けた殺し合いで、返り討ちにあった' : '殺し合いの末に') + '（' + lw + '）')) return null;
    ctx.stress(win, 20);
    aftermath(ctx, win, [lose]);
    logK(ctx, { kind: counter ? 'duel-counter' : 'duel', killer: win.i, victim: lose.i, deadWhy: lw });
    var text = ctx.t((trig + go).replace(/\{w\}/g, wpn), a, b) + ctx.t(body.replace(/\{w\}/g, wpn) + WIN_LINE[ps(win)], win, lose);
    return { mag: 65, text: text, why: '［殺し合い］きっかけ：' + tw + '／' + tag + lose.name + '（' + (counter ? '先に仕掛けたが返り討ちにあった。' : '') + lw + '）' };
  }

  /* ---------- 乱闘（三人以上） ---------- */
  function lean(ctx, c, x) {
    var r = ctx.R(c, x), v = r.aff + r.trust / 2;
    if (guardOf0(ctx, c, x)) v += 40;
    if (ctx.fac && ctx.fac.of && ctx.fac.of[c.i] != null && ctx.fac.of[c.i] === ctx.fac.of[x.i]) v += 25;
    if (HK.Ties && HK.Ties.hostile && HK.Ties.hostile(ctx, c, x)) v -= 40;
    return v;
  }
  function guardOf0(ctx, c, b) { return tiesOf(ctx, c, b).some(function (t) { return SYM[t.type] || (t.a === c.i ? DIR_A[t.type] : DIR_B[t.type]); }); }
  function hatedBy(ctx, c, P) { var s = 0; P.forEach(function (o) { if (o !== c) s += Math.max(0, -ctx.R(o, c).aff) / 60 + (HK.Ties && HK.Ties.hostile && HK.Ties.hostile(ctx, o, c) ? 0.4 : 0); }); return s / Math.max(1, P.length - 1); }
  var BRAWL_GO = L('{a}が{b}に食ってかかった。「＠{a}＠あなたのせいで、ここから出られない！｜あなたのせいで、ここから出られない！｜あなたのせいで、ここから出られないんです！」言い返す{b}の声も、すぐに怒鳴り声に変わった。|{a}の苛立ちが、{b}の一言で爆発した。{a}が{b}の胸ぐらをつかみ、{b}がその手を振り払った。それが始まりだった。|誰が言い出したのかは、もう分からなかった。{a}と{b}の口論は、気づけば殴り合いになっていた。');
  var BRAWL_SIDE = L('{S1}と{S2}に分かれて、部屋じゅうでつかみ合いが始まった。|{S1}が{a}の側に、{S2}が{b}の側についた。白い部屋は、たちまち修羅場になった。');
  var BRAWL_MED = L('{M}が「＠{M}＠やめて！｜やめろ！｜やめてください！」と叫んで、あいだに割って入った。');
  var BRAWL_END = L('誰かが叫んだ。気づいたときには、{v}が床に倒れていた。{k}の手には、{w}が握られていた。|揉み合いの中で、{k}の振り回した{w}が{v}をとらえた。{v}は短い声を上げて、そのまま動かなくなった。|乱闘が収まったのは、{v}が倒れてからだった。{v}を最後に突き飛ばしたのは、{k}だった。{v}は、もう息をしていなかった。');
  var BRAWL_END_SAFE = L('誰かが叫んだ。気づいたときには、{v}が床に倒れていた。{k}の手には、{w}が握られていた。{v}は気を失っていた。|揉み合いの中で、{k}の振り回した{w}が{v}をとらえた。{v}は短い声を上げて、そのまま動かなくなった。息はある。|乱闘が収まったのは、{v}が倒れてからだった。{v}を最後に突き飛ばしたのは、{k}だった。{v}は大けがを負って、起き上がれなかった。');
  var BRAWL_AFTER = L('部屋に、荒い息の音だけが残った。誰も、{k}の顔を見ようとしなかった。|{k}は自分の手を見下ろして、後ずさった。ほかの者たちは、黙って{v}から目を逸らした。|しばらく、誰も口をきかなかった。扉の紙の文字が一つ消えていることに、最初に気づいたのは{k}だった。');
  var BRAWL_NONE = L('乱闘は、全員が疲れ果てるまで続いた。誰も命を落とさなかったのは、ただの偶然だった。|最後には誰もが床に座り込み、肩で息をしていた。あざと切り傷だけが、乱闘の跡に残った。');
  function brawl(ctx, a, b) {
    var P = ctx.present().filter(here);
    if (P.indexOf(a) < 0 || P.indexOf(b) < 0 || P.length < 3) return null;
    var h = hate(ctx, a, b), sA = [a], sB = [b], med = [];
    P.forEach(function (c) { if (c === a || c === b) return; var la = lean(ctx, c, a), lb = lean(ctx, c, b); if (Math.abs(la - lb) < 15) med.push(c); else (la > lb ? sA : sB).push(c); });
    var pw = P.map(function (c) { return ctx.power(c); }), pmax = Math.max.apply(null, pw), pmin = Math.min.apply(null, pw);
    /* 死ぬ人の候補：体力の低い人・止めに入った人・いちばん嫌われている人（＋乱数） */
    var C = P.map(function (c, i) {
      var weak = pmax > pmin ? (pmax - pw[i]) / (pmax - pmin) : 0.5, isMed = med.indexOf(c) >= 0, hb = hatedBy(ctx, c, P);
      var parts = [[weak * 1.0, '部屋の中でいちばん体力が低く、逃げ遅れた'], [isMed ? 0.9 : 0, '止めに入って、巻き込まれた'], [hb * 1.2, 'いちばん恨まれていた']];
      parts.sort(function (x, y) { return y[0] - x[0]; });
      return { c: c, w: 0.3 + weak + (isMed ? 0.9 : 0) + hb * 1.2 + ctx.rng() * 0.4, why: parts[0][0] > 0.2 ? parts[0][1] : '乱闘のさなかに、たまたま一撃を受けた' };
    });
    var vc = HK.weighted(ctx.rng, C, function (x) { return x.w; }), v = vc.c;
    /* 殺した人：相手方（止めに入った人なら、いちばん殺意の強い人）で、殺さない設定のない人 */
    var foes = (sA.indexOf(v) >= 0 ? sB : sB.indexOf(v) >= 0 ? sA : P).filter(function (k) { return k !== v && !spare(ctx, v, k); });
    if (!foes.length) foes = P.filter(function (k) { return k !== v && !spare(ctx, v, k); });
    var k = foes.sort(function (x, y) { return (hate(ctx, y, v).v + ctx.power(y) / 200) - (hate(ctx, x, v).v + ctx.power(x) / 200); })[0];
    var wpn = weapon(ctx);
    var sides = sA.length > 1 || sB.length > 1 ? pick(ctx, BRAWL_SIDE).replace('{S1}', nm(sA)).replace('{S2}', nm(sB)) : '';
    var mt = med.length ? pick(ctx, BRAWL_MED).replace(/\{M\}/g, med[0].name) : '';
    var t0 = trigText(ctx, a, b, h) + pick(ctx, BRAWL_GO) + sides + mt;
    var tw = a.name + 'と' + b.name + 'の口論から（' + trigWhy(ctx, a, b, h) + '）。組：' + nm(sA) + ' 対 ' + nm(sB) + (med.length ? '・止めに入った人：' + nm(med) : '');
    P.forEach(function (c) { c.hp -= 6 + ctx.rng() * 8; ctx.stress(c, 12); });
    sA.forEach(function (x) { sB.forEach(function (y) { ctx.mod2(x, y, { ten: 20, aff: -10, trust: -12 }, { ten: 20, aff: -10, trust: -12 }); }); });
    if (!k || !hit(ctx, v, k, '乱闘のさなかに（' + vc.why + '）')) {
      logK(ctx, { kind: 'held', killer: a.i, victim: null, deadWhy: 'brawl' });
      return { mag: 40, with: P.filter(function (c) { return c !== a && c !== b; }), text: ctx.t(t0 + pick(ctx, BRAWL_NONE), a, b), why: '［乱闘］きっかけ：' + tw + '／誰も命を落とさなかった' };
    }
    aftermath(ctx, k, [v]);
    logK(ctx, { kind: 'brawl', killer: k.i, victim: v.i, deadWhy: vc.why });
    var end = pick(ctx, safe() ? BRAWL_END_SAFE : BRAWL_END) + pick(ctx, BRAWL_AFTER);
    end = end.replace(/\{v\}/g, v.name).replace(/\{k\}/g, k.name).replace(/\{w\}/g, wpn);
    return { mag: 65, with: P.filter(function (c) { return c !== a && c !== b; }), text: ctx.t(t0 + end, a, b), why: '［乱闘］きっかけ：' + tw + '／' + (safe() ? '気絶した人：' : '死んだ人：') + v.name + '（' + vc.why + '。最後の一撃は' + k.name + '）' };
  }

  /* ---------- 復讐（殺された人を想う人が、殺した人を討つ） ---------- */
  function mourned(ctx, a, b) {
    var l = ctx.chars.filter(function (x) { return x !== a && (x.killedBy === b.i || (x.flags && x.flags.knockedBy === b.i)); });
    l.sort(function (x, y) { return ctx.R(a, y).aff - ctx.R(a, x).aff; });
    return l[0] || null;
  }
  var REV_GO = L('{a}は、{x}の亡骸から目を離さなかった。それから、ゆっくりと{b}の方を向いた。|{a}は泣くのをやめていた。{x}を奪った相手が、同じ部屋で息をしている。それだけが、{a}を立たせていた。|「＠{a}＠{x}を返して｜{x}を返せ｜{x}を返してください」{a}の声は、ひどく静かだった。');
  var REV_GO_SAFE = L('{a}は、倒れたままの{x}から目を離さなかった。それから、ゆっくりと{b}の方を向いた。|{a}は泣くのをやめていた。{x}をあんな目に遭わせた相手が、同じ部屋で平然としている。それだけが、{a}を立たせていた。|「＠{a}＠{x}に、何をしたか分かってる？｜{x}に何をしたか、分かっているのか｜{x}に何をしたか、分かっていますか」{a}の声は、ひどく静かだった。');
  var REV_DO = L('{a}は{w}を握りしめ、{b}に向かっていった。{b}が振り向いたときには、もう遅かった。|{a}は何も言わずに{b}に飛びかかった。{b}は抵抗したが、{a}は手を緩めなかった。{b}が動かなくなるまで。');
  var REV_DO_SAFE = L('{a}は{w}を握りしめ、{b}に向かっていった。{b}が振り向いたときには、もう遅かった。{b}は床に倒れて、気を失った。|{a}は何も言わずに{b}に飛びかかった。{b}は抵抗したが、{a}は手を緩めなかった。{b}が気を失って動かなくなるまで。');
  var REV_HOLD = L('{a}は{w}を握ったまま、{b}の前に立った。けれど、{x}の顔が浮かんだ。{x}は、こんなことを望まない。{a}は{w}を床に落とした。|{a}は{b}に詰め寄り、胸ぐらをつかんだ。「＠{a}＠……あなたを殺しても、{x}は戻らない｜……あなたを殺しても、{x}は戻らない｜……あなたを殺しても、{x}は戻りません」{a}は手を離し、背を向けた。');
  function revenge(ctx, a, b) {
    var x = mourned(ctx, a, b), h = hate(ctx, a, b), wpn = weapon(ctx);
    var xn = x ? x.name : '仲間';
    var tw = a.name + 'は、' + xn + 'を' + (safe() ? '倒した' : '殺した') + b.name + 'を恨んでいた（' + (h.why || '仇') + '）';
    var go = pick(ctx, safe() ? REV_GO_SAFE : REV_GO);
    if (ctx.rng() > will(ctx, a, b, h)) {
      if (ctx.rng() < 0.5) a.flags.revenge = null;
      a.flags.rkHeld = (a.flags.rkHeld || 0) + 1;
      ctx.stress(a, 10); ctx.mod(b, a, { ten: 20 });
      logK(ctx, { kind: 'held', killer: a.i, victim: null, deadWhy: 'revenge' });
      return { mag: 35, text: ctx.t((go + pick(ctx, REV_HOLD)).replace(/\{x\}/g, xn).replace(/\{w\}/g, wpn), a, b), why: '［踏みとどまり］きっかけ：' + tw + '／' + a.name + 'は仇を討たなかった（' + xn + 'の顔が浮かんだ）' };
    }
    a.flags.revenge = null;
    if (!spare(ctx, a, b) && ctx.rng() < backP(ctx, a, b) * 0.8) {
      var why0 = b.name + 'が先に気づき、身を守った';
      var t1 = (go + pick(ctx, safe() ? BACK_SAFE : BACK)).replace(/\{x\}/g, xn).replace(/\{w\}/g, wpn) + BACK_REACT[ps(b)];
      if (hit(ctx, a, b, xn + 'の仇を討とうとして、返り討ちにあった（' + why0 + '）')) {
        aftermath(ctx, b, [a]);
        logK(ctx, { kind: 'backfire', killer: b.i, victim: a.i, deadWhy: why0 + '（仇討ちの返り討ち）' });
        return { mag: 60, text: ctx.t(t1, a, b), why: '［返り討ち］きっかけ：' + tw + '／' + (safe() ? '気絶した人：' : '死んだ人：') + a.name + '（仇を討とうとした側。' + why0 + '）' };
      }
    }
    var t = (go + pick(ctx, safe() ? REV_DO_SAFE : REV_DO)).replace(/\{x\}/g, xn).replace(/\{w\}/g, wpn);
    if (!hit(ctx, b, a, xn + 'の仇として討たれた')) return null;
    t += pick(ctx, ['{a}はその場に膝をつき、声を上げて泣いた。', '{a}の顔には、何の表情も浮かんでいなかった。', '{a}は、もう一度だけ' + xn + 'の名前を呼んだ。']);
    aftermath(ctx, a, [b]);
    logK(ctx, { kind: 'revenge', killer: a.i, victim: b.i, deadWhy: xn + 'の仇だった' });
    return { mag: 65, text: ctx.t(t, a, b), why: '［復讐］きっかけ：' + tw + '／' + (safe() ? '気絶した人：' : '死んだ人：') + b.name + '（' + xn + 'の仇だった）' };
  }

  /* ---------- 出来事 ---------- */
  var TAGS = ['death', 'cruel'];
  /* rk_duel：殺し合い（双方に殺意） */
  ev({
    id: 'rk_duel', label: '憎み合う二人が命がけで争う', tie: '-', tags: TAGS, cat: 'combat', dk: 'kill', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return live(ctx) && ctx.stepIndex > 0 && here(a) && here(b) && mutual(ctx, a, b) && a.stress > gate(ctx, a, b) && !spare(ctx, b, a) && !spare(ctx, a, b); },
    w: function (ctx, a, b) { return (0.5 + hate(ctx, a, b).v + hate(ctx, b, a).v + urg(ctx) * 0.6 + a.stress / 200) * 1.5; },
    run: function (ctx, a, b) { return sw(duel(ctx, a, b)); }
  });
  /* rk_shield：庇い死（三人以上。b を想う c が割って入る） */
  ev({
    id: 'rk_shield', label: '襲われた人を庇って別の人が倒れる', tie: '-', tags: TAGS, cat: 'betray', dk: 'kill', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return live(ctx) && ctx.stepIndex > 0 && ctx.present().length >= 3 && here(a) && here(b) && a.stress > gate(ctx, a, b) && !spare(ctx, b, a) && (hate(ctx, a, b).v >= 0.3 || (urg(ctx) >= 0.6 && a.tr.cold > 0.5)) && !!guardOf(ctx, a, b); },
    w: function (ctx, a, b) { return w(ctx, a, b) * 0.6; },
    run: function (ctx, a, b) {
      var h = hate(ctx, a, b), g = guardOf(ctx, a, b);
      if (!g || ctx.rng() > will(ctx, a, b, h)) return sw(holdBack(ctx, a, b, h));
      return sw(shield(ctx, a, b, g, h) || holdBack(ctx, a, b, h));
    }
  });
  /* rk_brawl：乱闘（三人以上。口論が殴り合いに広がる） */
  ev({
    id: 'rk_brawl', label: '追い詰められた部屋で乱闘になる', tie: '-', tags: TAGS, cat: 'combat', dk: 'kill', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!live(ctx) || !ctx.stepIndex || !here(a) || !here(b) || ctx.present().filter(here).length < 3) return false;
      var h = hate(ctx, a, b).v;
      return a.stress > Math.max(30, gate(ctx, a, b)) && (h >= 0.25 || (a.tr.aggr >= 0.55 && a.stress > 60) || (urg(ctx) >= 0.6 && a.tr.aggr > 0.45));
    },
    w: function (ctx, a, b) { return (0.2 + a.tr.aggr * 0.5 + hate(ctx, a, b).v * 0.8 + urg(ctx) * 0.4 + (ctx.present().length - 3) * 0.1) * 0.8; },
    run: function (ctx, a, b) { return sw(brawl(ctx, a, b)); }
  });
  /* rk_revenge：復讐（殺された人を想う人が、殺した人を討つ。条件を満たしたあとでも、部屋にいれば） */
  ev({
    id: 'rk_revenge', label: '倒された仲間の仇を討つ', tie: '-', tags: TAGS, cat: 'combat', dk: 'grudge', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return !!rule(ctx) && a.flags.revenge === b.i && here(a) && here(b) && !spare(ctx, b, a) && !!mourned(ctx, a, b); },
    w: function (ctx, a, b) { return 1.5 + hate(ctx, a, b).v * 1.2 + a.tr.aggr * 0.6; },
    run: function (ctx, a, b) { return sw(revenge(ctx, a, b)); }
  });

  /* ---------- 結末の段と結果一覧に、誰が誰をなぜ殺したかを書き足す ---------- */
  var END_LINE = {
    sneak: '{v}は、条件のために{k}の手にかかった（{y}）。', backfire: '{v}は{k}を襲い、返り討ちにあった（{y}）。', shield: '{v}は、{t}を庇って{k}の手にかかった。',
    duel: '{v}は、{k}との殺し合いに敗れた（{y}）。', 'duel-counter': '{v}は{k}との殺し合いを仕掛け、返り討ちにあった（{y}）。', mutual: '{v}と{k}は、殺し合いの末に相打ちになった。',
    brawl: '{v}は、乱闘のさなかに{k}の一撃を受けた（{y}）。', revenge: '{v}は、{k}に仇として討たれた（{y}）。'
  };
  function endLines(ctx) {
    var seen = {}, out = [];
    (ctx.flags.killLog || []).forEach(function (k) {
      if (k.victim == null || !END_LINE[k.kind]) return;
      var key = k.kind === 'mutual' ? 'm' + Math.min(k.killer, k.victim) : 'v' + k.victim;
      if (seen[key]) return; seen[key] = 1;
      var C = ctx.chars, s = END_LINE[k.kind].replace('{v}', C[k.victim].name).replace('{k}', C[k.killer].name).replace('{t}', k.target != null ? C[k.target].name : '').replace('{y}', k.deadWhy || '');
      out.push(safe() ? s.replace('殺し合い', 'つかみ合い').replace('手にかかった', '手で気を失った').replace('一撃を受けた', '一撃で倒れた').replace('討たれた', '倒された').replace('相打ちになった', '共倒れになった') : s);
    });
    return out;
  }
  HK.wrap(scen, 'finish', function (prev) {
    return function (ctx) {
      var r = prev ? prev.apply(this, arguments) : undefined;
      if (!rule(ctx) || !ctx.flags.killLog) return r;
      var lines = endLines(ctx);
      if (!lines.length) return r;
      /* 結末の段（room-end.js の締め。理由が「結末：」） */
      /* 締めの段を優先（取り残された人の結末 room-left.js は、締めの段がないときだけ） */
      var tgt = null;
      for (var i = ctx.log.length - 1; i >= 0; i--) {
        var e = ctx.log[i];
        if (!e) continue;
        if (e.kind === 'step') break;
        if (e.kind === 'event' && /^結末：/.test(e.why || '')) { tgt = e; if (!/^結末：取り残された人/.test(e.why)) break; }
      }
      if (tgt) {
        tgt.text = String(tgt.text || '') + (safe() ? '白い部屋で起きたこと――' : '白い部屋で流れた血――') + lines.slice(0, 3).join('');
        tgt.why = tgt.why + '／' + (safe() ? '気絶：' : '殺し：') + lines.length + '件';
      }
      /* 結果一覧：殺した人の結末に、誰をなぜ手にかけたかを足す（殺された人は ctx.kill の fateNote に理由が入っている） */
      (ctx.flags.killLog || []).forEach(function (k) {
        if (k.victim == null) return;
        var K0 = ctx.chars[k.killer], V = ctx.chars[k.victim];
        if (!K0 || K0 === V || K0.alive === false) return;
        var add = V.name + 'を' + (safe() ? '気絶させた' : '手にかけた') + '（' + (k.deadWhy || '') + '）';
        if (String(K0.fateNote || '').indexOf(add) < 0) K0.fateNote = (K0.fateNote ? K0.fateNote + '。' : '') + add;
        if (safe() && V.flags && V.flags.knocked && V.fate === '取り残された' && String(V.fateNote || '').indexOf(k.deadWhy || '\u0000') < 0) V.fateNote = (V.fateNote || '') + '（' + (k.deadWhy || '') + '）';
      });
      return r;
    };
  });

  HK.RoomKill = { hate: hate, gate: gate, w: w, will: will, attack: function (ctx, a, b) { return sw(attack(ctx, a, b)); }, urg: urg, guardOf: guardOf };
})();
