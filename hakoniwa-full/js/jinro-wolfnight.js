/* 箱庭シミュレーター: 人狼 ― 人狼の勝利の夜（R18版のみ）
   人狼陣営が勝ったとき、生き残った人狼（攻め）が、生き残った村人（受け）を「ゲームの続き」として食べに行く。
   ・二人の組は HK.State.pairSex（恋愛対象・受け攻め・R18に参加しない）と HK.sexBlocked（恋愛・R18にしない組・性行為の相手の固定）で確かめ、
     HK.Pos.order で人狼が攻めになる組だけ（自分で攻めを選んだ村人は、受けにしない）
   ・近い関係（恋人・セフレ・親友など）で、恋愛対象が両方向で合う（HK.canLove）二人は、じゃれ合いの延長で合意のうえ
   ・そうでない二人は、内容のスイッチ「合意のない展開」が入のときだけ。強引に迫られた村人は、気の強さで反応が分かれる（流される・根に持つ・困惑する）
   ・環境設定「人狼の勝利の夜」：おまかせ（半分くらい）／必ず／なし
   交わりの本体は HK.R18M.sex（態度ごとの喘ぎ・男女／女性どうし／女性の攻めの書き分け）
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.jinro, JA = HK.JinroAfter;
  if (!scen || !JA || HK.SAFE_ON) return;
  function L(s) { return s.split('|'); }
  scen.env.push({ id: 'wolfnight', label: '人狼の勝利の夜', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（人狼が勝ったとき、半分くらい）' }, { v: 'yes', label: '必ず（人狼が勝ったとき）' }, { v: 'off', label: 'なし' }], desc: '人狼陣営が勝ったあと、生き残った人狼（攻め）が、生き残った村人（受け）を「ゲームの続き」として食べに行く（R18）' });
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
        var cl = close(c.input, w, v), love = cl >= 0.45 && HK.canLove && HK.canLove(w, v) && HK.canLove(v, w);
        if (!love && !force) return;
        var sc = (love ? 1 + cl : 0.2 + ((w.tr && w.tr.aggr) || 0) * 0.5 + ((w.tr && w.tr.impulse) || 0) * 0.4) + rng() * 0.3;
        cands.push({ w: w, v: v, love: love, sc: sc });
      });
    });
    if (!cands.length) return;
    cands.sort(function (a, b) { return b.sc - a.sc; });
    var p = cands[0], x = p.w, y = p.v, m = { x: x.name, y: y.name };
    HK.Story.step(S, '人狼の勝利の夜');
    var k = p.love ? 'afterSoft' : react(y);
    var t = HK.Story.fmt(HK.Story.pick(S, p.love ? T.soft : T.force), m) + '\n\n' + R.sex(S, x, y, { mood: p.love ? 'love' : 'rough' }) + '\n\n' + HK.Story.fmt(HK.Story.pick(S, T[k]), m);
    HK.Story.say(S, { kind: 'climax', lewd: true, actors: [x.i, y.i], tag: '人狼の勝利の夜', text: t, why: '人狼の' + x.name + '（攻め）が、生き残った村人の' + y.name + '（受け）を「ゲームの続き」として食べに行った' + (p.love ? '（近い関係で、合意のうえ）' : '（強引に。' + y.name + 'の反応：' + { melt: '流される', resent: '根に持つ（CP・攻撃性が高い）', lost: '困惑する（ACが高い）' }[k] + '）') + (R.lastPos && R.lastPos(S) ? '・' + R.lastPos(S) : ''), mag: 30 });
  };
})();
