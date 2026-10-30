/* 箱庭シミュレーター: 人狼 ― 人狼の勝利の夜（R18版のみ）
   人狼陣営が勝ったとき、生き残った人狼（攻め）が、生き残った村人（受け）を「ゲームの続き」として食べに行く。
   ・二人の組は HK.State.pairSex（恋愛対象・受け攻め・R18に参加しない）と HK.sexBlocked（恋愛・R18にしない組・性行為の相手の固定）で確かめ、
     HK.Pos.order で人狼が攻めになる組だけ（自分で攻めを選んだ村人は、受けにしない）
   ・近い関係（恋人・セフレ・親友など）で、恋愛対象が両方向で合う（HK.canLove）二人は、じゃれ合いの延長で合意のうえ
   ・そうでない二人は、内容のスイッチ「合意のない展開」が入のときだけ。強引に迫られた村人は、気の強さで反応が分かれる（流される・根に持つ・困惑する）
   ・環境設定「人狼の勝利の夜」：おまかせ（半分くらい）／必ず／なし
   交わりの本体は HK.R18M.sex（態度ごとの喘ぎ・男女／女性どうし／女性の攻めの書き分け）
   登場人物はすべて成人として扱う */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=jinro id=jr_wolf_close cat=夜 tie=lover,fwb,best,childhood tags=night label=人狼の勝利の夜（近い関係の二人は合意のうえ） */
/* @event scen=jinro id=jr_wolf_force cat=夜 tags=night,force cond=HK.Content.on(env, 'force') label=人狼の勝利の夜（強引に迫られる） */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.jinro, JA = HK.JinroAfter;
  if (!scen || !JA || HK.SAFE_ON) return;
  function L(s) { return s.split('|'); }
  /* HK.addTo：分割読み込みで箱庭が後からそろっても、描写の設定（lewd-unify.js）より後ろに並ぶ */
  HK.addTo(scen.env, { id: 'wolfnight', label: '人狼の勝利の夜', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（人狼が勝ったとき、半分くらい）' }, { v: 'yes', label: '必ず（人狼が勝ったとき）' }, { v: 'off', label: 'なし' }], desc: '人狼陣営が勝ったあと、生き残った人狼（攻め）が、生き残った村人（受け）を「ゲームの続き」として食べに行く（R18）' });
  var TW = { lover: 1, mate: 1, fated: 1, spouse: 1, honmei: 0.9, almost: 0.8, fwb: 0.7, best: 0.6, buddy: 0.55, childhood: 0.55, crush: 0.6, friend: 0.35 };
  function close(input, a, b) {
    var w = 0;
    (input.ties || []).forEach(function (t) { if ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) { var x = TW[t.type] || 0; if (x > w) w = x; } });
    return w;
  }
  var T = {
    soft: L('片づけが終わったあと、{x}は{y}の耳元で囁いた。「人狼が勝ったんだから……最後に残った村人は、食べられないとね」――{y}は笑って押し返そうとしたが、その手にはまるで力が入っていなかった。|{x}は帰ろうとする{y}の手首を掴んで、部屋の奥へ引き寄せた。「まだ終わってない。夜のターンが残ってる」――{y}は呆れた顔をして、それでも逃げなかった。|勝ちが決まった瞬間から、{x}の視線はずっと{y}に向いていた。二人きりになると、{x}は低い声で言った。「いただきます」――{y}は真っ赤になって、小さく頷いた。'),
    force: L('{x}は、最後まで自分を疑わなかった{y}を壁際に追い詰めた。「ずっと騙してたのに、気づかなかったんだな」――逃げ道を塞ぐ腕は、ゲームの最中よりずっと本気だった。|みんなが帰ったあと、{x}は{y}を引き留めた。「村人は、狼に食べられるものだろ」――{y}が笑い飛ばそうとした唇を、{x}は無理やり塞いだ。|{x}は{y}を押し倒し、両手首を床に縫いとめた。「最後の夜だ。今度は、本当に襲う」――{y}の抗議の声は、{x}の口づけに飲み込まれた。'),
    afterSoft: L('{y}は{x}の胸に顔を埋めて、「次は絶対、村人で勝つから」と呟いた。{x}は笑って、その頭を撫でた。|{x}は{y}の髪を指で梳きながら、「次も騙されてね」と言った。{y}は返事の代わりに、{x}の脇腹をつねった。|二人は、散らかった役職カードの上で、しばらく息を整えていた。'),
    melt: L('{y}は乱れた息のまま、{x}の背中にしがみついていた。悔しいのに、腕をほどく気にはなれなかった。|{y}は「……ずるい」とだけ言って、{x}の肩に額を押しつけた。|終わったあと、{y}は自分から{x}の指に指を絡めていた。'),
    resent: L('{y}は乱れた服をかき合わせて、{x}を睨んだ。「……ゲームのせいにするなよ」――その声は、まだ少し震えていた。|{y}は何も言わずに部屋を出ていった。扉の閉まる音だけが、やけに大きく響いた。|{y}は{x}の手を振り払った。「騙されたのは、ゲームの中だけにしておきたかった」'),
    lost: L('{y}は天井を見上げたまま、しばらく動けなかった。今のが何だったのか、まだうまく飲み込めなかった。|{y}は、{x}がかけてくれた上着を握りしめたまま、ぼんやりと座り込んでいた。|{y}は「……え、今の、なに」と小さく呟いた。{x}は答えずに、{y}の乱れた髪を直した。')
  };
  function react(y) { var t = y.tr || {}; return (t.cp || 0) + (t.aggr || 0) > 1.05 ? 'resent' : (t.ac || 0) > 0.55 && (t.fc || 0) < 0.5 ? 'lost' : 'melt'; }
  var end0 = JA.end;
  JA.end = function (c) {
    end0.apply(this, arguments);
    var S = c.S, env = c.env || {}, rng = S.rng, St = HK.State, Pz = HK.Pos, R = HK.R18M;
    if (c.winner !== 'wolf' || env.wolfnight === 'off' || !R || !Pz || !St) return;
    if (env.wolfnight !== 'yes' && rng() >= 0.5) return;
    var force = !HK.Content || HK.Content.on(env, 'force', 'jinro');
    var cands = [];
    c.wolves.forEach(function (w) {
      if (!St.here(w)) return;
      c.P.forEach(function (v) {
        if (c.isW(v) || !St.here(v) || !St.pairSex(w, v) || (HK.sexBlocked && HK.sexBlocked(w, v))) return;
        if (Pz.order(w, v, [w, v])[0] !== w) return;
        /* 避けている相手を、人狼の側から襲いには行かない（avoid-kit.js の HK.Avoid。2026-10-28） */
        if (HK.Avoid && HK.Avoid.of(S, w, v)) return;
        var cl = close(c.input, w, v), love = cl >= 0.45 && HK.canLove && HK.canLove(w, v) && HK.canLove(v, w);
        /* 夜の起こりやすさ（全体の環境値 night。pos.js の HK.Pos.nightOff）が 0：近い関係の二人の合意の夜にしない（強引な夜＝合意のない展開は内容のスイッチどおり。2026-10-29 担当MI） */
        if (love && Pz.nightOff && Pz.nightOff(S)) love = false;
        if (!love && !force) return;
        var sc = (love ? 1 + cl : 0.2 + ((w.tr && w.tr.aggr) || 0) * 0.5 + ((w.tr && w.tr.impulse) || 0) * 0.4) + rng() * 0.3;
        cands.push({ w: w, v: v, love: love, sc: sc });
      });
    });
    if (!cands.length) return;
    cands.sort(function (a, b) { return b.sc - a.sc; });
    var p = cands[0], x = p.w, y = p.v, m = { x: x.name, y: y.name };
    HK.Story.step(S, '人狼の勝利の夜');
    /* 描写の設定（lewd-unify.js の install('jinro')）：作風「男性向け」なら、強引な夜は下の表で、合意の夜は thick-sex-ero.js の山場で書く。
       庇い展開・男性向けの文は物語とは別の乱数（kr）で選ぶので、小説調で庇いが起きない回の結果は変わらない */
    var X = HK.Lewd, ero = !!(X && X.conf('jinro') && X.ero(env) && X.lv(env) !== 'low' && HK.Ero);
    var kr = HK.rng((((S.log || []).length * 7919) + x.i * 131 + y.i * 17 + 4242) >>> 0), KR = { rng: kr };
    var KB = HK.KabaiR18, kb = !p.love && KB ? kabaiPick(c, kr, x, y) : null;
    var tgt = kb && kb.mode === 'subA' ? kb.z : y, mt = { x: x.name, y: tgt.name };
    var k = p.love ? 'afterSoft' : react(tgt);
    var body = p.love ? (ero ? loveEro(S, x, y, kr) : R.sex(S, x, y, { mood: 'love' })) : (ero ? forceEro(S, KR, x, tgt) : R.sex(S, x, tgt, { mood: 'rough' }));
    /* 濁点喘ぎの設定の人（受け）：男性向けの夜で一度も濁点の声が出なかったら、山場の声を一つ足す（moan-engine.js の HK.Moan.say＝態度・口調の喘ぎの表と、
       濁点喘ぎの表・濁らせ（dakuize）を通す。物語とは別の乱数 KR）。一回のゲームで夜は一度きりなので、設定が見えないまま終わらないように。2026-10-30 担当JW */
    if (ero && HK.Ero.dakuOf && HK.Ero.dakuOf(tgt) && !/[゛ﾞ]/.test(body) && HK.Moan && HK.Moan.say) {
      for (var dt = 0, dm = ''; dt < 6 && !/゛/.test(dm); dt++) dm = HK.Moan.say(KR, tgt, 'climax', { force: !p.love, late: true });
      if (/゛/.test(dm)) body += ' ' + tgt.name + '「' + dm + '」';
    }
    var t = HK.Story.fmt(HK.Story.pick(S, p.love ? T.soft : T.force), m);
    if (kb) t += '\n\n' + kbFill(kb, KB.motive[kb.rel], kr) + (kb.mode !== 'both' ? ' ' + kbFill(kb, JK[kb.mode], kr) : '');
    t += '\n\n' + body;
    if (kb && kb.mode === 'both') t += '\n\n' + kbFill(kb, JK.both, kr) + ' ' + (ero ? forceEro(S, KR, x, kb.z, true) : (R.say ? R.say(S, kb.z, R.isStrong && R.isStrong(kb.z) ? 'endure' : 'climax') : ''));
    /* 見せつけの熱の段（男性向け）は、性器なしの人がいる組には使わない（pos-nogen.js） */
    var ngW = kb && HK.NoGen && (HK.NoGen.on(kb.z, y) || HK.NoGen.on(x, y));
    if (kb && kb.mode === 'watch') { t += '\n\n' + kbFill(kb, ero && !ngW ? KB.watchEro : KB.shame, kr, KR); if (KB.fixed1(kb.z)) t += ' ' + kbFill(kb, KB.fixed, kr); }
    t += '\n\n' + HK.Story.fmt(HK.Story.pick(S, T[k]), mt);
    if (kb) t += '\n\n' + kbFill(kb, KB.after[kb.rel], kr);
    var KBW = { hit: '突き飛ばされた', subA: '身代わりを申し出て、代わりに襲われた', subR: '身代わりを申し出たが、相手にされなかった', both: '二人とも襲われた', watch: '押さえつけられて見せつけられ、興奮してしまった（体の関係にはならない）' };
    HK.Story.say(S, { kind: 'climax', lewd: true, actors: kb ? [x.i, y.i, kb.z.i] : [x.i, y.i], tag: '人狼の勝利の夜', text: t, why: '人狼の' + x.name + '（攻め）が、生き残った村人の' + y.name + '（受け）を「ゲームの続き」として食べに行った' + (p.love ? '（近い関係で、合意のうえ）' : '（強引に。' + tgt.name + 'の反応：' + { melt: '流される', resent: '根に持つ（CP・攻撃性が高い）', lost: '困惑する（ACが高い）' }[k] + '）') + (kb ? '。' + kb.z.name + 'が' + y.name + 'を庇った→' + KBW[kb.mode] : '') + (R.lastPos && R.lastPos(S) ? '・' + R.lastPos(S) : ''), mag: 30 });
  };

  /* ---------- 庇い展開（強引な夜だけ）：生き残ったほかの村人 z が、襲われる y を庇って前に出る ----------
     分岐：hit 突き飛ばされる（誰でも）／subA 身代わりを申し出て、代わりに襲われる／subR 申し出たが相手にされない（誰でも）／
     both 二人とも襲われる／watch 押さえつけられて見せつけられ、興奮してしまう（R18に参加しない人は出さない）。
     巻き込まれる（subA・both）は HK.KabaiR18.canTake（R18・モブの場面に出てよい・受けに回れる・固定でない・攻めの指定でない）に加えて、
     人狼との組が HK.State.pairSex・HK.sexBlocked・HK.Pos.order（人狼が攻め）を通り、無関心・恐怖の関係でないときだけ。動機と事後は関係で分ける */
  var COLD = { apathy: 1, fear: 1 };
  function tieOf(input, a, b) { var r = ''; (input.ties || []).forEach(function (t) { if ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) r = r || t.type; }); return r; }
  function kabaiPick(c, kr, x, y) {
    var KB = HK.KabaiR18, St = HK.State, Pz = HK.Pos;
    var zs = c.P.filter(function (z) { return z !== y && z !== x && !c.isW(z) && St.here(z) && tieOf(c.input, z, y) !== 'apathy'; });
    if (!zs.length || kr() >= 0.5) return null;
    var z = zs.slice().sort(function (a, b) { return close(c.input, b, y) - close(c.input, a, y); })[kr() < 0.6 ? 0 : kr.int(zs.length)];
    var take = KB.canTake(z) && St.pairSex(x, z) && !(HK.Avoid && HK.Avoid.of(c.S, x, z)) && !(HK.sexBlocked && HK.sexBlocked(x, z)) && Pz.order(x, z, [x, z])[0] === x && !Pz.hardTop(z, x) && !COLD[tieOf(c.input, x, z)] && !(HK.NoGen && HK.NoGen.on(x, z));
    var opts = ['hit']; if (take) opts.push('subA', 'both', 'both'); else opts.push('subR'); if (KB.canWatch(z)) opts.push('watch', 'watch');
    var tie = tieOf(c.input, z, y);
    return { z: z, x: x, y: y, mode: opts[kr.int(opts.length)], rel: KB.rel(z, y, tie, { att: close(c.input, z, y) * 60, trust: close(c.input, z, y) * 60 }) };
  }
  function kbFill(kb, list, kr, KR) {
    var E = HK.Ero, t = list[kr.int(list.length)].replace(/\{w\}/g, kb.z.name).replace(/\{v\}/g, kb.y.name).replace(/\{x\}/g, kb.x.name);
    if (!KR || !E) return t.replace(/\{s:\w+\}。?/g, '');
    return t.replace(/\{s:(\w+)\}/g, function (m, k) { return E.sfx(KR, k); })
      .replace(/\{vm1\}/g, function () { return HK.Moan && HK.Moan.say ? HK.Moan.say(KR, kb.y, 'mid', { force: true, fall: false }) : E.moan(KR, kb.y, 1, { force: true }); });
  }
  /* 人狼の勝利の夜の庇い（{w}＝庇う村人 {v}＝襲われる村人 {x}＝人狼） */
  var JK = {
    hit: L('{x}は{w}を片手で突き飛ばした。床に転がった{w}を見下ろして、{x}は冷たく笑った。{x}「邪魔しないで。次はあなたの番かもね｜邪魔をするな。次はあなたの番かもしれない｜邪魔をしないでください。次はあなたの番かもしれませんよ」|' +
      '{w}は{x}の腕にしがみついて引き剥がそうとした。けれど振り払われた拍子に、肩から壁に叩きつけられた。{w}は痛みに顔を歪めながら、それでも{v}の名前を呼びつづけた。|' +
      '{w}は{v}と{x}のあいだに割って入った。{x}は{w}の胸ぐらを掴み、部屋の外へ乱暴に押し出した。閉ざされた扉の向こうから、{v}の声だけが聞こえてきた。'),
    subA: L('{w}は{v}を背中に庇ったまま、{x}をまっすぐ見上げた。{w}「{v}の代わりに、私を食べればいい｜{v}の代わりに、私を食べればいい｜{v}の代わりに、私を食べてください」――{x}は面白そうに目を細め、{v}から手を離した。|' +
      '{w}は震える手で、自分の襟元をくつろげた。{w}「狼の獲物なら、私がなる。だから{v}は放して｜狼の獲物なら、私がなる。だから{v}は放せ｜狼の獲物なら、私がなります。だから{v}は放してください」――{x}は少し考えてから、新しい獲物に向き直った。|' +
      '{w}は{x}の前に膝をつき、{v}を逃がしてほしいと頼んだ。{x}「健気だね。いいよ、あなたで我慢してあげる｜健気だな。いいだろう、あなたで我慢してやる｜健気ですね。いいですよ、あなたで我慢してあげます」――解放された{v}の目の前で、{w}は床に押し倒された。'),
    subR: L('{w}は自分が代わりになると申し出た。{x}は鼻で笑って、{w}を押しのけた。{x}「あなたじゃ駄目。欲しいのは{v}だから｜あなたでは駄目だ。欲しいのは{v}だ｜あなたでは駄目です。欲しいのは{v}ですから」|' +
      '{w}は{x}の腕を掴み、自分を連れていけと迫った。{x}はその手を、汚れでも払うように振りほどいた。{w}の申し出は、狼の耳には届かなかった。|' +
      '{w}は{v}の前に立ちはだかり、身代わりになると言い張った。{x}は{w}を一瞥しただけで、強引に脇へ押しやった。よろめいた{w}の目の前で、{v}は再び押さえ込まれた。'),
    both: L('{x}は{v}から体を離すと、立ち尽くしていた{w}のほうへ向き直った。{x}「次はあなた。庇った罰だよ｜次はあなただ。庇った罰だ｜次はあなたです。庇った罰ですよ」――{w}は逃げる間もなく、{v}の隣に押し倒された。|' +
      '狼の食事は、一人では終わらなかった。{x}は{w}の手首を掴んで引き寄せ、{v}が見ている前で組み敷いた。{w}の抗議の声は、すぐに途切れ途切れになっていった。|' +
      '{x}は二人を並べて床に横たえ、代わる代わる貪った。{v}を庇ったはずの{w}も、やがて同じ声を上げはじめた。互いの乱れた顔が、すぐ隣にあった。'),
    watch: L('{x}は{w}を一瞥しただけで、その場に縫いとめた。{x}「そこで見てて。動いたら次はあなただから｜そこで見ていろ。動いたら次はあなただ｜そこで見ていてください。動いたら次はあなたですから」――{w}は壁際にへたり込んだまま、目を逸らすこともできなかった。|' +
      '{w}は{x}に腕をねじり上げられ、床に押さえつけられた。顔だけは、{v}のほうへ向けさせられたまま。{w}の目の前で、{v}の服が一枚ずつ剥がされていった。|' +
      '{w}は助けに入ったはずだった。それなのに、突き飛ばされて尻もちをついたまま、{v}が乱されていく姿から目を離せない。下腹に熱が溜まっていくのに気づいて、{w}は唇を噛んだ。')
  };

  /* ---------- 作風「男性向け」：強引な夜（{x}＝人狼・攻め、{y}＝襲われる村人） ----------
     組 mf（男性の体→女性の体）・mm・ff・fm（女性の攻め→男性の体）。性器なしの人がいる組は小説調（R18M.sex）のまま。
     段：行為 → 抗う様子 → 山場（襲われる人の態度9種）＋果てる喘ぎ → 人狼の声と果て →（濃い）もう一度。数行で短くは行為と山場だけ。
     {v0}{v1}{v2}＝襲われる人の嫌がる喘ぎ（moan-engine.js。気の強い人は声を抑える喘ぎ）。体の語は印。登場人物はすべて成人 */
  var FE = {
    act: {
      mf: L('{x}は{y}を床に押し倒し、もがく両手首を頭の上でひとまとめに押さえつけた。{x}「狼は、獲物を逃がさないんだよ｜狼は、獲物を逃がさない｜狼は、獲物を逃がしませんよ」――脚のあいだに割り込んだ{男性器}が、{y}の{女性器}を一息に奥まで貫いた。{s:hit}。{y}「{v0}」|' +
        '{x}は{y}を壁に押しつけ、後ろから腰を抱え込んだ。乱暴にずらされた下着の隙間から、熱い{男性器}がずぶずぶと{ナカ}へ押し入ってくる。{s:hit}。{y}「{v0}」――逃げようとするたびに腰を引き戻され、さらに深く突き上げられた。|' +
        '{x}は{y}の脚を肩に担ぎ上げ、真上から体重をかけて{男性器}を沈めた。{s:hit}。{y}「{v1}」――ゲームのあいだ一度も疑わなかった相手に、{y}は{ナカ}の一番奥まで暴かれていった。'),
      mm: L('{x}は{y}を床にうつ伏せに押さえつけ、{尻}を割り開いた。{x}「最後まで騙されてたんだ。これくらい当然でしょ｜最後まで騙されていたんだ。これくらい当然だろう｜最後まで騙されていたんですから。これくらい当然でしょう」――張りつめた{男性器}が、{後ろ}をこじ開けて奥まで押し入った。{s:hit}。{y}「{v0}」|' +
        '{x}は{y}を壁際に追い詰め、後ろから腰を打ちつけた。{s:hit}。{y}「{v0}」――奥の膨らみを擦り上げられるたびに、{y}の{男性器}まで意思に反して硬くなっていった。|' +
        '{x}は{y}を組み敷いたまま{男性器}を握り込んで扱き、{後ろ}を容赦なく突き上げた。{s:hit}。{y}「{v1}」――前と後ろを同時に責められて、抗議の声は途中で裏返った。'),
      ff: L('{x}は{y}を床に押し倒し、太腿を割って体を重ねた。{x}「村人は、狼に食べられるものでしょ｜村人は、狼に食べられるものだろう｜村人は、狼に食べられるものでしょう」――指が{女性器}を割り開き、{ナカ}の弱いところを容赦なく掻き回す。{s:wet}。{y}「{v0}」|' +
        '{x}は{y}の脚を抱え込んで閉じられないようにし、{女性器}に舌を這わせた。{s:suck}。{y}「{v0}」――{陰核}を吸われるたびに、押しのけようとした手から力が抜けていった。|' +
        '{x}は{y}を押さえ込み、自分の{女性器}を{y}の{女性器}に重ねて、逃げる腰を追いかけるように擦りつけた。{s:wet}。{y}「{v1}」――押さえつけられた{胸}の先が、{x}の肌に擦れて硬く尖っていった。'),
      fm: L('{x}は{y}を床に押し倒し、その腰の上に乗り上げた。{x}「抵抗しても無駄。夜は狼の時間だから｜抵抗しても無駄だ。夜は狼の時間だ｜抵抗しても無駄ですよ。夜は狼の時間ですから」――無理やり昂らされた{男性器}を、{x}は自分の{女性器}に一気に呑み込んだ。{s:wet}。{y}「{v0}」|' +
        '{x}は{y}の手首を床に縫いとめたまま、腰を激しく上下させた。{s:hit}。{y}「{v0}」――{男性器}を{ナカ}で搾り上げられ、やめてくれという声はすぐに掠れていった。|' +
        '{x}は{y}の胸板に両手をついて体重をかけ、逃げられないようにした。{s:wet}。{y}「{v1}」――根元まで呑み込まれたまま腰をくねらされ、{y}の{男性器}は意思に反して{x}の{ナカ}で脈打った。')
    },
    mid: L('{y}は{x}の肩を押し返そうとした。{s:wet}。けれど押し返す腕は、突かれるたびに力を失っていく。{y}「{v1}」――悔しいのに、体の奥だけが勝手に熱を帯びていった。|' +
      '{y}は顔を背け、唇を噛んで声をこらえた。{s:hit}。こらえきれずに漏れた声を聞いて、{x}は楽しそうに目を細めた。{y}「{v1}」|' +
      '{x}はわざと動きを緩め、{y}の腰がそれを追いかけるのを待った。{s:wet}。気づいた{y}は真っ赤になって首を振ったが、追いかける腰は止まらなかった。{y}「{v1}」'),
    peak: {
      proud: L('{y}は最後まで{x}を睨みつけていた。{s:hit}。けれど一番奥を抉られるたびに、睨む目から力が抜けていく。{y}「{v1}」――悔しさに歯を鳴らしながら、{y}は{x}の下でイかされた。|' +
        '{y}は{x}の背中に爪を立て、声だけは上げまいとした。爪の跡が赤く残っても、腰の震えは止まらない。{s:hit}。屈辱に顔を歪めたまま、{y}の体は大きく跳ね上がった。'),
      stern: L('{y}は唇を固く結び、ただ時間が過ぎるのを待とうとした。{s:wet}。けれど体の奥の熱は、{x}の動きに合わせて勝手に膨らんでいく。{y}は短く息を詰め、背を反らして達した。|' +
        '{y}は、これはゲームの続きにすぎないと自分に言い聞かせた。言い聞かせる声が、突かれるたびに乱れていく。{s:hit}。最後の一突きで、{y}の中で張りつめていたものがぷつりと切れた。'),
      tsun: L('{y}は涙目で{x}を罵りつづけた。罵る声に甘いものが混じりはじめても、口だけは止めなかった。{s:hit}。{y}「{v1}」――イかされた瞬間、{y}は真っ赤になって顔を背けた。|' +
        '{y}は、感じてなんかいないと言い張った。言い張る唇は、もう震えていた。{s:wet}。{y}の背中がびくびくと跳ね、言葉とは裏腹に{x}にしがみついていた。'),
      gentle: L('{y}は抗うのをやめ、目を閉じて嵐が過ぎるのを待った。{s:wet}。それでも押し寄せる波には逆らえず、{y}は涙を浮かべたまま達した。{x}は満足げに、その涙を舐め取った。|' +
        '{y}は{x}の名前を、やめてと乞うように何度も呼んだ。その声が、突かれるたびに甘く崩れていく。{s:hit}。{y}の体が細かく震え、とうとう高みに押し上げられた。'),
      devoted: L('{y}は、ゲームの中で{x}を信じた自分を思い出していた。{s:wet}。信じた相手に暴かれていく体が、悔しいほど熱い。{y}は声を殺したまま、びくびくと震えてイった。|' +
        '{y}は唇を噛んで耐えた。耐えた分だけ深く溜まった熱が、最後の一突きで一気に弾けた。{s:hit}。{y}の腰ががくがくと跳ね、指先まで痙攣が走った。'),
      cool: L('{y}は無表情を保ったまま、{x}の動きをやり過ごそうとした。{s:wet}。保っていたはずの顔が、一突きごとに崩れていく。{y}は小さく息を呑み、びくりと腰を跳ねさせてイかされた。|' +
        '{y}は、議論のときと同じように頭を冷やそうとした。{s:hit}。考えようとするたびに、思考が白く途切れる。{y}の喉から、本人も聞いたことのない声が漏れた。'),
      free: L('{y}は最初、冗談にしてしまおうと笑ってみせた。{s:hit}。笑い声はすぐに途切れ、喉の奥で引きつった声に変わる。{y}は泣き笑いのような顔で、{x}の下で達した。|' +
        '{y}は暴れ、蹴り、{x}を押し返そうとした。{s:hit}。いつもの軽口は一つも出てこない。体が勝手に達して痙攣したとき、{y}は信じられないというように目を見開いた。'),
      shy: L('{y}は両手で顔を覆い、{x}の顔を見ないようにした。{s:wet}。指の隙間から漏れる声だけは、どうしても隠せない。{y}は小さく体を丸めたまま、びくびくと震えて達した。|' +
        '{y}は消え入りそうな声で、やめてと繰り返した。繰り返すたびに、その声は細く甘くなっていった。{s:hit}。{y}は耳まで真っ赤にして、声もなくイかされた。'),
      polite: L('{y}は乱れた息の合間に、丁寧な言葉で{x}をたしなめようとした。{s:wet}。言葉は途中から形を失い、ただの声になる。{y}は慎ましく閉じていた膝をがくがくと震わせて達した。|' +
        '{y}は最後まで、取り乱すまいと身を固くしていた。けれど体は、礼儀などお構いなしに{x}を締めつける。{s:hit}。{y}の品のよい顔が、快楽にとろりと崩れた。')
    },
    fin: {
      m: L('{x}の動きが荒く、速くなっていく。{s:hit}。{x}は{y}の腰を強く引き寄せ、一番奥に押しつけたまま果てた。{s:cum}。注ぎ込まれる熱に、{y}の{ナカ}がひくひくと締まった。|' +
        '{x}は{y}の奥で何度も脈打ち、{精液}を吐き出しきるまで腰を離さなかった。{s:cum}。溢れた白いものが、{y}の太腿を伝って床に落ちた。|' +
        '{x}は果てる寸前に引き抜き、{y}の肌に熱いものをぶちまけた。{s:cum}。{x}「ごちそうさま｜ごちそうさま｜ごちそうさまでした」――汚された{y}を見下ろして、{x}は舌なめずりをした。'),
      ff: L('{x}は{y}を責めながら、自分の{女性器}を{y}の太腿に擦りつけていた。{s:wet}。{x}がびくびくと身を震わせて果てると、ようやく指の動きが止まった。|' +
        '{x}は{y}が果てたあとも指を抜かず、もう一度、もう一度と責め立てた。{s:wet}。{y}が潮を噴いてぐったりしたところで、{x}はようやく満足げに指を引き抜いた。|' +
        '{x}は{y}と脚を絡めたまま腰を揺らしつづけ、二人はほとんど同時に達した。{s:wet}。重なった体のあいだで、どちらのものとも分からない{愛液}が糸を引いた。'),
      fm: L('{x}は{y}の上で腰を打ちつけ、{男性器}を奥まで咥え込んだまま締め上げた。{s:cum}。{y}がこらえきれずに{x}の{ナカ}で果てると、{x}も背を反らして達した。|' +
        '{x}は{y}が果てても腰を止めなかった。{s:wet}。出し尽くして敏感になった{男性器}を搾られつづけ、{y}は声にならない声を上げた。|' +
        '{x}は{y}の{精液}を{ナカ}で受け止め、恍惚とした顔で腰を震わせた。{s:cum}。{x}「ごちそうさま｜ごちそうさま｜ごちそうさまでした」――{x}は汗ばんだ{y}の頬を、獲物を確かめるように撫でた。')
    },
    again: L('{x}は一度では満足しなかった。ぐったりとした{y}の体を裏返し、また最初から貪りはじめる。{s:hit}。{y}「{v2}」――夜が白むまで、狼の食事は終わらなかった。|' +
      '休む間もなく、{x}は{y}の脚をもう一度開かせた。{s:wet}。{y}には、もう押し返す力も残っていない。{y}「{v2}」――二度目は、一度目よりも長く、執拗だった。|' +
      '{x}は{y}を膝の上に抱え上げ、逃げられないように腰を抱き寄せた。{s:wet}。{y}「{v2}」――抗い方を忘れた体は、やがて{x}の動きに合わせて揺れはじめていた。')
  };
  /* 強引な夜の男性向けの本文。second＝庇って巻き込まれた二人目（行為と山場の喘ぎだけの一段） */
  function forceEro(S, KR, x, y, second) {
    var Pz = HK.Pos, E = HK.Ero, R = HK.R18M, env = S.env || {}, kr = KR.rng;
    if (HK.NoGen && HK.NoGen.on(x, y)) return second ? (R && R.say ? R.say(S, y, 'climax') : '') : R.sex(S, x, y, { mood: 'rough' });
    var mx = !Pz.isF(x), my = !Pz.isF(y), k = mx ? (my ? 'mm' : 'mf') : (my ? 'fm' : 'ff');
    var per = (HK.personaOf && HK.personaOf(y)) || y.persona || 'gentle', strong = !!(R && R.isStrong && R.isStrong(y));
    var VK = ['start', 'mid', 'climax'], pk = function (l) { return l[kr.int(l.length)]; };
    function mo(kk, late) { return HK.Moan && HK.Moan.say ? HK.Moan.say(KR, y, kk, { force: true, hush: strong, late: !!late }) : E.moan(KR, y, VK.indexOf(kk), { force: true }); }
    function fl(t, late) {
      /* 女性どうしは、突く・注ぐ擬音を使わない */
      if (k === 'ff') t = String(t).replace(/\{s:(?:hit|cum)\}/g, '{s:wet}');
      return String(t).replace(/\{x\}/g, x.name).replace(/\{y\}/g, y.name).replace(/\{s:(\w+)\}/g, function (m, z) { return E.sfx(KR, z); })
        .replace(/\{v([012])\}/g, function (m, n) { return mo(VK[+n], late || n === '2'); });
    }
    var climax = y.name + '「' + mo('climax', true) + '」';
    if (second) return fl(pk(FE.act[k])) + ' ' + climax;
    var short = HK.Lewd.short(env, kr), tail = fl(pk(FE.peak[per] || FE.peak.gentle), true) + ' ' + climax;
    if (short) return fl(pk(FE.act[k])) + ' ' + tail;
    var am = HK.Moan && HK.Moan.say ? HK.Moan.say(KR, x, k === 'mf' || k === 'mm' ? 'top' : 'topmid', {}) : E.moan(KR, x, 1);
    var out = [fl(pk(FE.act[k])), fl(pk(FE.mid)), tail + ' ' + x.name + '「' + am + '」――' + fl(pk(FE.fin[k === 'mf' || k === 'mm' ? 'm' : k]), true)];
    if (HK.Lewd.high(env)) out.push(fl(pk(FE.again), true));
    return out.join('\n\n');
  }
  /* 合意の夜（近い関係）の男性向け：thick-sex-ero.js の山場（数行で短くは短い版）。濃いはもう一度まで */
  function loveEro(S, x, y, kr) {
    var TE = HK.ThickEro, E = HK.Ero, R = HK.R18M;
    if (!TE || (HK.NoGen && HK.NoGen.on(x, y))) return R.sex(S, x, y, { mood: 'love' });
    var pk = function (a) { return E.fresh ? E.fresh(S, a, function (l) { return HK.Story.pick(S, l); }) : HK.Story.pick(S, a); };
    var hi = HK.Lewd.high(S.env || {}), short = HK.Lewd.short(S.env || {}, kr);
    var r = short ? TE.short({ S: S, pick: pk, a: x, b: y, again: hi }) : TE.scene({ S: S, pick: pk, rng: S.rng, a: x, b: y, style: HK.ThickSex ? HK.ThickSex.style(x) : 'gentle', open: ' ', again: hi });
    var t = r.text.replace(/^ \n\n/, '').replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name);
    if (HK.Pos && HK.Pos.ff(x, y) && HK.FF && HK.FF.fix) t = HK.FF.fix({ pick: pk, rng: S.rng }, t, x, y);
    return t;
  }
})();
