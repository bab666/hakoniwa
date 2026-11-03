/* 箱庭シミュレーター（R18版のみ）: 恐怖の二人の夜（HK.FearBody。かたまり pack-lewd。2026-11-03 利用者の指示）
   利用者の指示：「体の関係『あり』なら開けているべき。感覚は『怖くてドキドキしているのか、興奮なのか分からない』」
   ■ 決まり（docs/reports/2026-10-31/rel-consistency.md の「恐怖の二人」の節）
     ・関係「恐怖」（{a} が {b} を恐れる）で、関係の欄「体の関係」を「あり」にした二人（ties.js の HK.tieBodyOK）は、noLove・noSex を入れない（夜の場面を止めない）。
       住人の印 fearBody（怖がっている側に、相手の番号）。「体の関係：自動」は今までどおり止める（合意のない展開の力ずくの場面だけ）
     ・その二人の性的な場面（engine.js の Ctx.say・solo-story-kit.js の HK.Story.say の記録で、HK.EroScene.hit が真のもの。合意のない展開の場面は除く）に、
         きっかけ：場面の直前の段（出られない部屋で HK.SexLead が既に足していれば、その段に足す）。怖いのに拒まなかった理由と、怖がっている側の態度 9 種の一言。
                   性別の組み合わせ（男×女・女×女・女攻め×男。ほかは共通）ごとに専用の地の文。同じ二人の二度目からは二度目の理由
         最中　：場面の頭に一文（怖さと高鳴りの区別がつかない。態度 9 種 × 2 本）
         事後　：場面のすぐ後の段（態度 9 種 × 2 本）
     ・長い場面（HK.ThickSex・HK.ThickEro）は場面の文そのものを変えず、記録の前後に段を差すだけ（sex-flow-r18.js などは触らない）
   ■ 書式：台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。話し手は「{a}「」」の形で明示。体の語は印。登場人物はすべて成人として扱う */
/* @event-ok 恐怖の二人（体の関係：あり）の夜の前後に、きっかけ・最中・事後の段を足すだけ（新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.wrap || HK.FearBody) return;
  var FB = HK.FearBody = { log: null };
  function L(s) { return s.split('|'); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(k) >= 0 ? k : 'gentle'; }
  function fill(t, a, b) { return String(t).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); }

  /* ---------- きっかけ（地の文：性別の組み合わせごと。{a}＝怖がっている側、{b}＝相手） ---------- */
  FB.LEAD = {
    mf: L('{a}と{b}のあいだには、まだ怖さが残っていた。{b}が近づくと、{a}の体は反射のようにこわばる。それなのに、伸びてきた手を、{a}は振り払わなかった。|' +
      '{b}の大きな手が{a}の肩に置かれた。いつもなら飛びのいていたはずの重さだった。{a}は動けないまま、自分の鼓動が速くなっていくのを聞いていた。|' +
      '体の大きさも、声の低さも、{a}が{b}を怖がる理由のひとつだった。その同じものに、今夜の{a}は目を逸らせずにいた。逃げる理由なら、いくらでも思いついたはずだった。'),
    ff: L('{b}の細い指が、{a}の手首にそっと触れた。それだけで、{a}の背筋に冷たいものが走った。けれど、その冷たさは、すぐに別の熱にすり替わっていった。|' +
      '{a}は、{b}の視線から逃げられなかった。怖い、と思うのと同じ強さで、目を離したくないとも思っていた。二人の距離は、いつの間にか息がかかるほど近かった。|' +
      '{b}が笑うと、{a}はいつも身構えた。今夜もそうだった。ただ、身構えた体のどこかが、続きを待っているようでもあった。'),
    fm: L('{b}は、怯える{a}を見下ろすように立っていた。{a}のほうが体は大きいはずなのに、{b}の前では、いつも縮こまってしまう。今夜も、{a}は一歩も下がれなかった。|' +
      '{b}に顎を持ち上げられて、{a}は息を呑んだ。怖いはずの相手なのに、その指先から目が離せなかった。{a}の喉が、小さく鳴った。|' +
      '{a}は、{b}に名前を呼ばれるたびに肩を跳ねさせた。それが怖さのせいなのか、{a}にはもう分からなかった。{b}は、その揺れを面白がるように、もう一度名前を呼んだ。'),
    gen: L('{b}がそばに来ると、{a}の体はいつも固くなる。今夜も同じだった。ただ、その固さの奥で、何かが小さく脈打っていた。|' +
      '{a}は、{b}が怖かった。怖いはずなのに、{b}の手が触れたところだけが、妙に熱かった。逃げ出す足は、少しも動かなかった。|' +
      '息が浅くなるのは、怖いからだと{a}は思っていた。けれど、{b}に見つめられて速くなる鼓動は、怖いときのものとは少し違っていた。')
  };
  /* 拒まなかった理由（共通） */
  FB.WHY = L('二人は、体の関係を持つことを互いに受け入れていた。怖さが消えたわけではないのに、{a}はその約束を取り消そうとはしなかった。|' +
    '{a}は、この怖さが何なのかを確かめたかった。確かめる方法は、一つしか思いつかなかった。|' +
    '怖いのか、高鳴っているのか、{a}には区別がつかなかった。区別がつかないまま、{a}は{b}を拒まなかった。');
  /* 二度目 */
  FB.AGAIN = L('一度肌を重ねても、{a}の怖さは消えていなかった。消えていないのに、体のほうが先に{b}を覚えていた。|' +
    '前の夜のことを、{a}は何度も思い出していた。思い出すたびに、怖さと熱が同じ場所からこみ上げてきた。|' +
    '二度目なら平気だろう、と{a}は思っていた。けれど、{b}に近づかれた瞬間の震えは、前と少しも変わらなかった。');
  /* 怖がっている側の一言（態度 9 種 × 2 本） */
  FB.SAY = {
    proud: L('{a}は精一杯、相手を睨み返した。{a}「……べつに、怖くなんかないし｜……べつに、怖くなどない｜……べつに、怖くなんてありません」|{a}は唇を噛んで、強がるように顎を上げた。{a}「震えてるのは、寒いだけだから｜震えているのは、寒いだけだ｜震えているのは、寒いだけですから」'),
    stern: L('{a}は表情を崩さないように、奥歯を噛みしめた。{a}「……好きにすればいい｜……好きにしろ｜……好きにしてください」|{a}は、乱れそうな呼吸を無理に整えた。{a}「平気だ。何ともない｜平気だ。何ともない｜平気です。何ともありません」'),
    tsun: L('{a}は真っ赤な顔で、そっぽを向いた。{a}「か、勘違いしないで。怖いだけなんだから｜か、勘違いするな。怖いだけだ｜か、勘違いしないでください。怖いだけなんですから」|{a}は相手の服の端をつかんだまま、離そうとしなかった。{a}「……逃げないから。逃げないってば｜……逃げない。逃げないと言っている｜……逃げません。逃げませんってば」'),
    gentle: L('{a}は小さく息を吐いて、自分の胸に手を当てた。{a}「……どきどきしてる。怖いのかな、それとも｜……鼓動が速い。怖いのか、それとも｜……どきどきしています。怖いのか、それとも」|{a}はおそるおそる、相手の目を見た。{a}「ゆっくり、してくれる？｜ゆっくり、してくれるか｜ゆっくり、してくれますか」'),
    devoted: L('{a}は震える指を、自分から相手のほうへ伸ばした。{a}「怖いけど……あなたがいいなら｜怖いが……あなたがいいなら｜怖いですけど……あなたがいいなら」|{a}はぎゅっと目を閉じて、それでも頷いた。{a}「……大丈夫。ちゃんと、ここにいるから｜……大丈夫だ。ちゃんと、ここにいる｜……大丈夫です。ちゃんと、ここにいますから」'),
    cool: L('{a}は自分の脈を数えるように、静かに目を伏せた。{a}「……鼓動が速い。理由は、よく分からない｜……鼓動が速い。理由は、よく分からん｜……鼓動が速いです。理由は、よく分かりません」|{a}は淡々とした声を保とうとしたが、語尾がわずかに揺れた。{a}「怖いのと、それ以外の区別がつかない｜怖いのと、それ以外の区別がつかない｜怖いのと、それ以外の区別がつきません」'),
    free: L('{a}は引きつった笑いを浮かべた。{a}「あはは……なにこれ、怖いのに、なんか変｜はは……何だこれは、怖いのに、妙だ｜あはは……なんでしょう、怖いのに、なんだか変です」|{a}は自分でも驚いたように、相手の胸元に額を寄せた。{a}「もう、わけ分かんない｜もう、わけが分からない｜もう、わけが分かりません」'),
    shy: L('{a}は消え入りそうな声で、何かを言いかけてやめた。{a}「……こ、こわい。けど……｜……こ、こわい。だが……｜……こ、こわいです。けど……」|{a}は両手で顔を隠したまま、首を小さく横に振った。{a}「……やめて、って言えない｜……やめろ、と言えない｜……やめて、って言えません」'),
    polite: L('{a}は膝の上で手を重ね、深く息を吸った。{a}「……少しだけ、待って。心臓が、うるさくて｜……少しだけ、待ってくれ。心臓が、うるさい｜……少しだけ、待ってください。心臓が、うるさいんです」|{a}は震える声を整えて、まっすぐ相手を見た。{a}「怖いのは本当。でも、嫌だとは言ってない｜怖いのは本当だ。だが、嫌だとは言っていない｜怖いのは本当です。でも、嫌だとは言っていません」')
  };
  /* 最中（場面の頭に一文。態度 9 種 × 2 本） */
  FB.MID = {
    proud: L('触れられるたびに{a}の体は跳ねたが、{a}は意地でも声を殺そうとした。怖さで跳ねたのか、別の何かで跳ねたのか、もう自分でも言い切れなかった。|{a}は睨む目を保とうとしたが、睨むたびに視界が潤んだ。それが怖さの涙なのかどうか、{a}には分からなかった。'),
    stern: L('{a}は体のこわばりを解かないまま、{b}を受け止めた。こわばっているはずの体が、触れられたところから少しずつ熱を帯びていった。|{a}は息を乱すまいとしたが、乱れた息は怖さのせいにも、そうでないものにも聞こえた。'),
    tsun: L('{a}は「怖いだけ」と何度も心の中で繰り返した。繰り返すほど、体はその言い訳を聞かなくなっていった。|{a}はしがみつくように{b}の背に腕を回した。逃げるためにつかんだはずの腕は、もう離れようとしなかった。'),
    gentle: L('{a}の震えは、触れられるたびに小さくなったり、大きくなったりした。そのたびに、怖さと心地よさの境目が、少しずつ溶けていった。|{a}の鼓動は、ずっと速いままだった。怖くて速いのか、別の理由で速いのか、{a}はもう考えるのをやめた。'),
    devoted: L('{a}は怖さを押し込めるように、{b}の動きに自分を合わせた。合わせているうちに、押し込めたはずのものが、熱になって返ってきた。|{a}の指は震えていたが、{b}の手を握る力だけは弱まらなかった。'),
    cool: L('{a}は、自分の反応を外から眺めるように数えようとした。数えきれなくなったところで、怖さと興奮の区別も、どうでもよくなった。|{a}の冷静な声は、途中で何度も途切れた。途切れた理由を、{a}は説明できなかった。'),
    free: L('{a}は笑っていいのか泣いていいのか分からないまま、{b}に身を任せていた。怖いはずの相手の手が、いちばん熱かった。|{a}の口から漏れる声は、悲鳴とも吐息ともつかなかった。{a}自身にも、どちらなのか分からなかった。'),
    shy: L('{a}は目をきつく閉じたまま、触れられるたびに肩をすくめた。すくめた肩が、少しずつ{b}のほうへ寄っていった。|{a}の小さな震えは、最後まで止まらなかった。けれど、その震えは、始まったときとは違う理由で続いていた。'),
    polite: L('{a}は乱れていく呼吸を整えようとして、うまくいかなかった。きちんとした言葉は、もう一つも出てこなかった。|{a}は{b}の肩にしがみついた。怖いからしがみついたのか、離れたくなくてしがみついたのか、{a}には分からなかった。')
  };
  /* 事後（態度 9 種 × 2 本） */
  FB.AFTER = {
    proud: L('終わったあとも、{a}は{b}に背を向けたままだった。まだ鼓動が速いのは、怖かったせいだ、と{a}は自分に言い聞かせた。{a}「……勘違いしないで。怖かっただけ｜……勘違いするな。怖かっただけだ｜……勘違いしないでください。怖かっただけです」|{a}は乱れた髪をかき上げ、何でもない顔をつくった。けれど、指先はまだ震えていた。'),
    stern: L('{a}は黙って身なりを整えた。いつもの硬い顔に戻ろうとしても、頬の熱だけは引かなかった。|{a}は{b}から少し距離を取って座った。怖さは消えていなかった。消えていないのに、さっきの熱もまだ残っていた。'),
    tsun: L('{a}は毛布を頭からかぶって、{b}のほうを見ようとしなかった。{a}「……怖かったんだから。それだけなんだから｜……怖かった。それだけだ｜……怖かったんですから。それだけなんですから」|{a}は、離れたくせに、{b}の服の端だけは握ったままだった。'),
    gentle: L('{a}は、まだ速い鼓動に手を当てたまま、ぼんやりと天井を見ていた。怖かったのか、嬉しかったのか、答えはまだ出なかった。|{a}は{b}の寝息を聞きながら、そっと息をついた。怖さの残る胸の奥に、知らない温かさが混じっていた。'),
    devoted: L('{a}は{b}の様子をうかがいながら、そっと身を寄せた。怖さはまだあったが、離れるほうが、今は怖い気がした。|{a}は乱れたシーツを直しながら、自分の手がまだ震えていることに気づいた。震えの理由は、さっきとは違っていた。'),
    cool: L('{a}は天井を見つめながら、さっきの自分の反応を思い返した。怖さと興奮の境目は、どこにも見つからなかった。|{a}は静かに息を整えた。{a}「……結論は、まだ出ない｜……結論は、まだ出ない｜……結論は、まだ出ません」'),
    free: L('{a}は大の字に寝転がって、乾いた笑いを漏らした。{a}「怖いのに……なにやってるんだろ、私｜怖いのに……何をやっているんだ、私は｜怖いのに……何をやっているんでしょう、私」|{a}はしばらく笑っていたが、やがて黙り込んだ。胸の高鳴りは、まだ収まっていなかった。'),
    shy: L('{a}は毛布の中で丸くなり、顔を半分だけ出した。{b}と目が合うと、また慌てて潜り込んだ。|{a}は、まだ震えの残る指を、そっと握りしめた。怖かった。けれど、それだけではなかった。'),
    polite: L('{a}は丁寧に身なりを整え、小さく頭を下げた。その仕草だけは、いつもどおりだった。{a}「……ありがとう、と言うのも変だね｜……礼を言うのも妙だな｜……お礼を言うのも、変ですね」|{a}は乱れた呼吸が落ち着くのを、目を閉じて待った。待っても、胸のざわめきは消えなかった。')
  };
  FB.PS = PS;

  /* ---------- 二人を見つける ---------- */
  /* x が y を恐れていて、体の関係が「あり」（fearBody の印） */
  FB.of = function (x, y) { return !!(x && y && x !== y && Array.isArray(x.fearBody) && x.fearBody.indexOf(y.i) >= 0); };
  /* 記録の登場人物（番号か住人）から、[怖がっている側, 相手] を一組 */
  function pairOf(P, acts) {
    var L0 = (acts || []).map(function (c) { return typeof c === 'number' ? P && P[c] : c; }).filter(Boolean);
    for (var i = 0; i < L0.length; i++) for (var j = 0; j < L0.length; j++) if (i !== j && FB.of(L0[i], L0[j])) return [L0[i], L0[j]];
    return null;
  }
  FB.pairOf = pairOf;
  /* 性別の組み合わせ（攻め × 受け）：mf＝男×女／ff＝女×女／fm＝女攻め×男／gen＝ほか */
  function combo(a, b) {
    var o = HK.Pos && HK.Pos.orients ? HK.Pos.orients(b, a) : null, tb = o && o.length === 1 ? o[0] : [b, a];
    var t = tb[0].gender, u = tb[1].gender;
    return t === 'm' && u === 'f' ? 'mf' : t === 'f' && u === 'f' ? 'ff' : t === 'f' && u === 'm' ? 'fm' : 'gen';
  }
  FB.combo = combo;
  function pick(Z, arr) {
    if (!arr || !arr.length) return '';
    var r = Z && Z.rng ? Z.rng() : Math.random();
    return arr[Math.floor(r * arr.length) % arr.length];
  }
  /* 合意のない展開の場面（力ずく・条件で迫る）は除く */
  function forced(o, Z) { return !!(o.force || /〔合意のない展開〕|力ずく/.test(String(o.why || '')) || (Z && Z._ev && /^cf_(force|room)_r18$/.test(Z._ev.id || ''))); }
  FB.leadText = function (Z, a, b, n) {
    var parts = [fill(pick(Z, n > 0 ? FB.AGAIN : FB.LEAD[combo(a, b)]), a, b), fill(pick(Z, FB.WHY), a, b), fill(pick(Z, FB.SAY[per(a)]), a, b)];
    return {
      text: parts.join(''),
      why: 'きっかけ：' + a.name + 'は' + b.name + 'を恐れているが、二人の関係の「体の関係」は「あり」（怖いのか、興奮なのか分からないまま拒まなかった）' + (n > 0 ? '／二度目以降（体が先に相手を覚えていた）' : '')
    };
  };
  function cnt(Z, a, b) { var m = Z._fbN = Z._fbN || {}, k = Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i); return { n: m[k] || 0, k: k, m: m }; }

  /* ---------- 記録に差す（エンジン型：Ctx.say） ---------- */
  function lewdOf(Z, o) { return !!(HK.EroScene && HK.EroScene.hit(Z, o)); }
  /* 事後の段は、場面の続きの記録（同じ二人の性的な記録）が終わってから出す（区切り・結末・ほかの記録の前に） */
  function afterE(ctx) {
    var q = ctx._fbPend; if (!q) return;
    ctx._fbPend = null;
    var a = q.a, b = q.b, log = ctx.log;
    if (a.alive === false || b.alive === false) return;
    var e1 = { n: log.length, step: q.step, label: q.label, cat: q.cat, actors: [a.i, b.i], text: fill(pick(ctx, FB.AFTER[per(a)]), a, b), why: '事後：' + a.name + 'は' + b.name + 'を恐れたまま、怖さと高鳴りの区別がつかずにいた', odd: false, mag: 2, kind: 'event', tag: '事後', lewd: false };
    log.push(e1);
    if (FB.log) FB.log.push({ k: 'after', n: e1.n });
  }
  FB.afterE = afterE;
  /* 同じ区切りの記録のあいだは待つ（最中に邪魔が入って再開する夜などで、場面の途中に事後を挟まない）。区切りの見出し・結末の段・次の区切りの記録の前に出す */
  function contOf(ctx, o) {
    var q = ctx._fbPend;
    return !!(q && o && o.kind !== 'step' && o.kind !== 'phase' && ctx.stepIndex === q.step);
  }
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      if (this._fbPend && !this._fbBusy && o && !contOf(this, o)) afterE(this);
      if (HK.SAFE_ON || this._fbBusy || !o || o.kind !== 'event' || typeof o.text !== 'string' || !o.text || !o.actors || o.actors.length < 2 || /^きっかけ：/.test(String(o.why || ''))) return prev.apply(this, arguments);
      var pr = pairOf(this.chars, o.actors);
      if (!pr || forced(o, this) || !lewdOf(this, o)) return prev.apply(this, arguments);
      var a = pr[0], b = pr[1], c0 = cnt(this, a, b), log = this.log, at = log.length, last = log[at - 1];
      /* 同じ区切りの同じ二人の続きの記録には、段を足さない（一つの場面に一度） */
      var dk = this.stepIndex + ':' + c0.k, D0 = this._fbDone = this._fbDone || {};
      if (D0[dk]) return prev.apply(this, arguments);
      var L0 = FB.leadText(this, a, b, c0.n), e0 = null;
      /* 出られない部屋などで、きっかけの段が既に足してあれば、その段に足す */
      if (last && last.tag === 'きっかけ' && last.step === this.stepIndex && last.actors && last.actors.indexOf(a.i) >= 0 && last.actors.indexOf(b.i) >= 0) {
        last.text += L0.text; last.why = String(last.why || '') + '／' + L0.why.replace(/^きっかけ：/, '');
      } else {
        e0 = { n: at, step: this.stepIndex, label: this.label, cat: o.cat || 'romance', actors: [a.i, b.i], text: L0.text, why: L0.why, odd: false, mag: 3, kind: 'event', tag: 'きっかけ', lewd: false };
        log.push(e0);
        if (this._eroN === at) this._eroN = at + 1;
      }
      var t0 = o.text;
      o.text = fill(pick(this, FB.MID[per(a)]), a, b) + t0;
      var e = prev.apply(this, arguments);
      if (!e || e.skipped) {
        o.text = t0;
        if (e0) { var k = log.indexOf(e0); if (k >= 0) { log.splice(k, 1); for (var j = k; j < log.length; j++) if (log[j]) log[j].n = j; } if (this._eroN === at + 1) this._eroN = at; }
        return e;
      }
      c0.m[c0.k] = c0.n + 1; D0[dk] = 1;
      this._fbPend = { a: a, b: b, step: this.stepIndex, label: this.label, cat: o.cat || 'romance' };
      if (FB.log) FB.log.push({ k: 'eng', lead: e0 ? e0.n : at - 1, scene: e.n });
      if (HK.SexLead && HK.SexLead.log && e0) HK.SexLead.log.push({ kind: 'fear', ev: this._ev && this._ev.id || '', n: e0.n, scene: e.n, gens: ['fear'] });
      return e;
    };
  });

  /* ---------- 物語型（HK.Story.say）：一つの区切りの同じ二人に一度。事後の段は、次の区切りの見出しの前（か結果の前）に出す ---------- */
  var ST = HK.Story;
  function flush(S) {
    var q = S && S._fbPend; if (!q || !q.length) return;
    S._fbPend = [];
    S._fbBusy = true;
    try {
      q.forEach(function (x) {
        if (!(HK.State && HK.State.here ? HK.State.here(x.a) && HK.State.here(x.b) : true)) return;
        ST.say(S, { actors: [x.a, x.b], tag: '事後', text: fill(pick(S, FB.AFTER[per(x.a)]), x.a, x.b), why: '事後：' + x.a.name + 'は' + x.b.name + 'を恐れたまま、怖さと高鳴りの区別がつかずにいた', mag: 2, lewd: false });
      });
    } finally { S._fbBusy = false; }
  }
  FB.flush = flush;
  if (ST && ST.say) HK.wrap(ST, 'say', function (prev) {
    return function (S, o) {
      if (HK.SAFE_ON || !S || !S.P || S._fbBusy || !o || o.kind === 'step' || o.kind === 'phase' || typeof o.text !== 'string' || !o.text || !o.actors || o.actors.length < 2 || /^きっかけ：/.test(String(o.why || ''))) return prev.apply(this, arguments);
      var pr = pairOf(S.P, o.actors);
      if (!pr || forced(o, null) || !lewdOf(S, o)) return prev.apply(this, arguments);
      var a = pr[0], b = pr[1], c0 = cnt(S, a, b), dk = String(S.label) + ':' + c0.k, D0 = S._fbDone = S._fbDone || {};
      if (D0[dk]) return prev.apply(this, arguments);
      D0[dk] = 1;
      var L0 = FB.leadText(S, a, b, c0.n), last = S.log[S.log.length - 1];
      S._fbBusy = true;
      try {
        if (last && last.tag === 'きっかけ' && last.actors && last.actors.indexOf(a.i) >= 0 && last.actors.indexOf(b.i) >= 0) { last.text += L0.text; last.why = String(last.why || '') + '／' + L0.why.replace(/^きっかけ：/, ''); }
        else {
          var tch = S._eroN === S.log.length;
          ST.say(S, { actors: [a, b], tag: 'きっかけ', text: L0.text, why: L0.why, mag: 3, lewd: false });
          if (tch) S._eroN = S.log.length;
        }
      } finally { S._fbBusy = false; }
      o.text = fill(pick(S, FB.MID[per(a)]), a, b) + o.text;
      var r = prev.apply(this, arguments);
      c0.m[c0.k] = c0.n + 1;
      (S._fbPend = S._fbPend || []).push({ a: a, b: b });
      if (FB.log) FB.log.push({ k: 'story', scene: r && r.n });
      return r;
    };
  });
  if (ST && ST.step) HK.wrap(ST, 'step', function (prev) {
    return function (S) { try { flush(S); } catch (e) { if (HK.DEBUG) throw e; } return prev.apply(this, arguments); };
  });
  if (ST && ST.result) HK.wrap(ST, 'result', function (prev) {
    return function (S) { try { flush(S); } catch (e) { if (HK.DEBUG) throw e; } return prev.apply(this, arguments); };
  });
})();
