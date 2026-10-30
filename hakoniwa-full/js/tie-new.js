/* 箱庭シミュレーター: 追加の気持ち・関係（2026-10-25）の場面（エンジン型の箱庭で共通：合コン・出られない部屋・クラスメイト・無人島・ゾンビの街・オメガバース・バトルロワイヤル・裁判デスゲーム）
   定義は ties.js。物語型の箱庭は tie-new-story.js。全年齢版も同じ（性的な文は入れない。夜の場面は既存の仕組みに任せる）
   ・無関心（apathy）：{b}＝無関心な側。働きかけるのは相手（{a}）だけで、無関心な側の気持ちは動かない（engine.js の凍結）
   ・恐怖（fear）：恐れる側は避ける・固まる・従う・庇護を求める。従属の強要は、想いの差（HK.Gap）が大きいほど起きやすい
   ・許嫁（fiance）：それぞれの気持ち（t.feel＝t.a の、t.feelB＝t.b の）で場面を分ける。恋に寄る場面は恋愛対象と受け攻めが合う組だけ
     （HK.canLove 両方向・HK.Pos.okSex）。断りたい側がほかの人を好きになると破談（pf.fiBroken。以後は恋愛の出来事を起こさない）
   ・執着（依存・愛憎）：関係「執着（ヤンデレ）」の型（t.sub：dep／hatelove）。暴走は obsess-kit.js
   ・憎悪：敵対の度合い（t.grade：hate）。文は feud-kit.js の HK.Feud.HATE。危害は死のある箱庭でだけ命に関わる
   ・負い目（恩人 t.feel：guilt）・推し（一方的な好意・敬愛 t.mode：oshi）・愛人（セフレ t.mode：mistress）
   ・仲間（comrade）：グループの「仲間」を入れたときに ui.js が付ける。助け合い・庇う・弔う・一緒に動く。恋愛・嫉妬には関わらない
   ・想いの差（HK.Gap）で過激に：本命の嫉妬の暴走（tie_nw_honmei）・盲信の排除（tie_nw_blind）も、差が大きいほど起きやすい
   各場面は「状況の文（3文以上）」＋「態度9種の言い回し」。死んだ人・その場にいない人は出さない（HK.State.here）。
   台詞の一人称は「私」で書き、口調の言い換えに任せる。id は tie_nw_ で始める（全体の設定「関係性イベント：出さない」で外れる） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON) return;
  function L(s) { return s.split('|'); }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = c && (c.persona || (HK.personaOf && HK.personaOf(c))) || 'gentle'; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  /* 態度9種の表（{proud:'文|文', ...}）を配列に */
  function P9(o) { var r = {}; PK.forEach(function (k) { r[k] = L(o[k] || o.gentle); }); return r; }
  function here(c) { return !!c && (HK.State ? HK.State.here(c) : c.alive !== false) && !(c.flags && c.flags.caged != null); }
  function fill(s, a, b, c) { return String(s || '').replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).replace(/\{c\}/g, c ? c.name : ''); }
  function both(a, b) { return !!(HK.canLove && HK.canLove(a, b) && HK.canLove(b, a)); }
  function T() { return HK.Ties; }
  function from(ctx, a, b, ty) { return T() && T().from ? T().from(ctx, a, b, ty) : null; }
  function has(ctx, a, b, ty) { return T() && T().has ? T().has(ctx, a, b, ty) : null; }
  /* 向きのある関係の二人を、関係の向き（A＝t.a 側）で返す */
  function dir(ctx, a, b, ty, ok) {
    var t = from(ctx, a, b, ty); if (t && (!ok || ok(t))) return { A: a, B: b, t: t };
    t = from(ctx, b, a, ty); if (t && (!ok || ok(t))) return { A: b, B: a, t: t };
    return null;
  }
  /* その場にいる第三者（a・b 以外。fn で絞る） */
  function thirds(ctx, a, b, fn) { return (ctx.others ? ctx.others(a) : []).filter(function (c) { return c !== a && c !== b && here(c) && (!fn || fn(c)); }); }
  function gapWhy(ctx, a, b) { var w = HK.Gap ? HK.Gap.why(ctx, a, b) : ''; return w ? '（' + w + '）' : ''; }
  function gapK(ctx, a, b) { return HK.Gap ? HK.Gap.k(ctx, a, b) : 1; }
  /* 体の関係が成り立つ組か（R18に参加しない人も恋人にはなれるので、恋人扱いの判定では noR18 を外して見る） */
  function okSexLove(a, b) { if (!HK.Pos) return true; var x = {}, y = {}, k; for (k in a) x[k] = a[k]; for (k in b) y[k] = b[k]; x.noR18 = false; y.noR18 = false; return HK.Pos.okLove ? HK.Pos.okLove(a, b) : HK.Pos.okSex(x, y); }
  /* 死のある箱庭（危害が命に関わりうる） */
  function deadly(ctx) { return !HK.SAFE_ON && !!(ctx && ctx.scen && /^(br|zombie|island)$/.test(ctx.scen.id)); }
  var TN = HK.TieNew = { P9: P9, per: per };
  function push(ev) { ev.scope = 'pair'; ev.noOdd = true; HK.addTo(HK.COMMON, ev); }
  /* 出来事を一つ足す：roles(ctx, a, b) が役の組（なければ null）、run(ctx, r) が { text, why, cat?, with?, mag? } を返す */
  function add(o) {
    push({
      id: o.id, label: o.label, cat: o.cat,
      when: function (ctx, a, b) { return !!(b && here(a) && here(b) && o.roles(ctx, a, b)); },
      w: function (ctx, a, b) { var r = o.roles(ctx, a, b); return r ? (typeof o.w === 'function' ? o.w(ctx, r) : o.w || 1) : 0; },
      run: function (ctx, a, b) { var r = o.roles(ctx, a, b); return r ? o.run(ctx, r) : null; }
    });
  }
  function pk(ctx, l) { return ctx.pick(l); }

  /* ======================= 無関心（{a}＝働きかける相手、{b}＝無関心な側） ======================= */
  function apR(ctx, a, b) { return T() && T().apathy && T().apathy(ctx, b, a) && !T().apathy(ctx, a, b) ? { K: a, A: b } : null; }
  var AP = {
    talk: L('{a}は{b}に話しかけた。今日あったこと、困っていること、少しだけ嬉しかったこと。|{a}は{b}の隣に腰を下ろし、「ねえ」と声をかけた。|{a}は{b}に、さっき見つけたものを見せようと駆け寄った。'),
    talkRe: P9({
      proud: '{b}「……で？」――{b}はそれだけ言って、{a}の顔も見なかった。', stern: '{b}は「そうか」とだけ答え、手元の作業から目を上げなかった。',
      tsun: '{b}「ふーん。それ、私に関係ある？」――{b}は本当に、何の興味もなさそうだった。', gentle: '{b}は穏やかに相槌を打ったが、その目は{a}を通り越して、どこか遠くを見ていた。',
      devoted: '{b}は丁寧に頷いた。けれど、{a}の名前を一度も呼ばなかった。{b}の心は、最初からほかの場所にあった。', cool: '{b}「そう」――{b}の返事は短く、温度がなかった。{a}の話は、{b}の中のどこにも引っかからなかった。',
      free: '{b}は「へー」と言って、すぐに別のことを始めた。{a}の話がどこで終わったのか、{b}は気にもしなかった。', shy: '{b}は小さく会釈しただけで、何も言わなかった。照れているのではなく、ただ関心がなかった。',
      polite: '{b}「さようでございますか」――礼儀正しい言葉の裏に、{a}への関心はひとかけらもなかった。'
    }),
    gift: L('{a}は{b}の分の食事を取り分けて、そっと手元に置いた。|{a}は{b}が困っていそうなのを見て、黙って手を貸した。|{a}は{b}の好きそうなものを見つけて、わざわざ届けに来た。'),
    giftRe: P9({
      proud: '{b}は「ああ」とだけ言って受け取り、礼も言わずに背を向けた。', stern: '{b}は「必要ない」と短く返した。{a}の手は、行き場をなくして宙に浮いた。',
      tsun: '{b}「頼んでないけど」――受け取りはしたが、{b}はそれを見もしなかった。', gentle: '{b}は「ありがとう」と微笑んだ。ほかの誰に向けるのとも同じ、形だけの微笑みだった。',
      devoted: '{b}は礼儀正しく礼を言った。けれど、それが{a}からのものだということは、すぐに忘れてしまった。', cool: '{b}は受け取ったものを脇に置き、そのまま触れなかった。{b}にとっては、どうでもいいことだった。',
      free: '{b}は「お、どーも」と軽く受け取り、すぐにほかの用事に気を取られた。', shy: '{b}は小さく頭を下げただけだった。{a}が何をしてくれたのか、{b}は気に留めていなかった。',
      polite: '{b}「お気遣いなく」――丁寧な一言で、{b}は{a}の好意を静かに脇へ退けた。'
    }),
    other: L('{a}が話しかけている最中に、{b}は{c}のほうを振り向いて、まったく別の話を始めた。|{a}が{b}を呼んだが、{b}は{c}との話を続けたまま、振り返りもしなかった。|{a}が差し出した手を素通りして、{b}は{c}の隣へ移った。'),
    otherRe: P9({
      proud: '{a}は舌打ちして、そっぽを向いた。「……ああそうかよ」', stern: '{a}は口を閉じた。存在ごと無視されることには、怒るより先に虚しさを覚えた。',
      tsun: '{a}「な、なによ！　別に、聞いてほしかったわけじゃないし……」', gentle: '{a}は小さく笑って、言いかけた言葉を飲み込んだ。',
      devoted: '{a}はその場に立ち尽くした。どうすれば{b}の目に映るのか、{a}には分からなかった。', cool: '{a}は肩をすくめた。「……興味がない、ってことか」――分かってはいたが、少しだけ胸が冷えた。',
      free: '{a}は「あ、そう」と笑ってみせたが、その笑いはすぐにしぼんだ。', shy: '{a}は真っ赤になって俯き、そっとその場を離れた。',
      polite: '{a}は「失礼いたしました」と会釈して下がった。声は、わずかに震えていた。'
    })
  };
  function apWhy(r, k) { return r.K.name + 'の働きかけと、' + r.A.name + 'の無関心' + k + '（' + r.A.name + 'から' + r.K.name + 'への気持ちは動かない）'; }
  add({ id: 'tie_nw_ap_talk', label: '無関心な相手に話しかけても響かない', cat: 'bond', w: 1.4, roles: apR, run: function (ctx, r) { ctx.mod(r.K, r.A, { ten: 2, aff: -1 }); return { text: fill(pk(ctx, AP.talk), r.K, r.A) + fill(pk(ctx, AP.talkRe[per(r.A)]), r.K, r.A), why: apWhy(r, '：話しかけても響かない') }; } });
  add({ id: 'tie_nw_ap_gift', label: '無関心な相手に好意を受け流される', cat: 'help', w: 0.9, roles: apR, run: function (ctx, r) { ctx.mod(r.K, r.A, { aff: 1, ten: 2 }); return { text: fill(pk(ctx, AP.gift), r.K, r.A) + fill(pk(ctx, AP.giftRe[per(r.A)]), r.K, r.A), why: apWhy(r, '：好意を受け流す') }; } });
  add({
    id: 'tie_nw_ap_other', label: '無関心な相手に素通りされる', cat: 'conflict', w: 0.9,
    roles: function (ctx, a, b) { var r = apR(ctx, a, b); return r && thirds(ctx, b, a).length ? r : null; },
    run: function (ctx, r) {
      var c = ctx.rng.pick(thirds(ctx, r.A, r.K)); if (!c) return null;
      ctx.mod(r.K, r.A, { ten: 4, aff: -2 }); ctx.stress(r.K, 3);
      return { with: [c], text: fill(pk(ctx, AP.other), r.K, r.A, c) + fill(pk(ctx, AP.otherRe[per(r.K)]), r.K, r.A, c), why: apWhy(r, '：目の前の相手を素通りする') };
    }
  });

  /* ======================= 恐怖（{a}＝恐れる側、{b}＝恐れられる側） ======================= */
  function frR(ctx, a, b) { var F0 = T() && T().fears; if (!F0) return null; if (F0(ctx, a, b)) return { F: a, X: b }; if (F0(ctx, b, a)) return { F: b, X: a }; return null; }
  var FR = {
    avoid: L('{b}が姿を見せたとたん、{a}は手にしていたものを置いて、何も言わずにその場を離れた。|{a}は{b}の足音を聞きつけると、物陰に身を隠した。{b}が通り過ぎるまで、息を殺していた。|{a}は{b}のいる場所を、いつも遠回りして避けた。同じ場所にいるだけで、指先が冷たくなった。'),
    avoidRe: P9({
      proud: '{a}「……ちっ、別にびびってるわけじゃねえ」――そう呟く声が、自分でも分かるほど掠れていた。', stern: '{a}は表情を崩さなかったが、握った拳の内側はじっとりと汗ばんでいた。',
      tsun: '{a}「べ、別に逃げたわけじゃないから！　用事を思い出しただけ！」', gentle: '{a}は胸に手を当てて、ゆっくり息を吐いた。それでも、震えは止まらなかった。',
      devoted: '{a}は誰にも気づかれないように、震える手を袖の中に隠した。', cool: '{a}は「合理的な判断だ」と自分に言い聞かせた。近づかなければ、何も起きない。',
      free: '{a}は「あー、急に用事思い出した」と笑ってごまかした。笑い声は少しだけ上ずっていた。', shy: '{a}は目に涙をためて、小さく体を縮めた。',
      polite: '{a}は「失礼いたします」と早口で告げて、逃げるように下がった。'
    }),
    freeze: L('{b}が何気なく{a}の名前を呼んだ。{a}の体が、びくりと跳ねた。|{b}は{a}に、ほんの短い用事を言いつけようとしただけだった。{a}はその場で凍りついた。|{b}が近づいてくるのに気づいたとき、{a}はもう動けなかった。足が床に縫いつけられたようだった。'),
    freezeRe: P9({
      proud: '{a}は言い返そうとして、口を開いたまま固まった。喉から、声が出てこなかった。', stern: '{a}「……は、はい」――いつもの毅然とした声は、どこにもなかった。',
      tsun: '{a}「な、なに……？」――強がる余裕もなく、声は小さく震えていた。', gentle: '{a}は笑顔を作ろうとして、失敗した。頬がこわばって、うまく動かなかった。',
      devoted: '{a}は反射的に頭を下げた。「ご、ごめんなさい」――何を謝っているのか、自分でも分からなかった。', cool: '{a}は頭の中で言葉を探したが、何ひとつ浮かばなかった。考えることそのものが止まっていた。',
      free: '{a}の軽口は、喉の奥で消えた。いつもの調子が、まるで出てこなかった。', shy: '{a}は息を止めたまま、目をぎゅっとつむった。',
      polite: '{a}「た、ただいま……参ります」――敬語だけが、かろうじて口から出た。'
    }),
    obey: L('{b}は{a}に、面倒な役目を押しつけた。{a}は一言も逆らわなかった。|{b}が「それ、やっておいて｜それを、やっておけ｜それ、やっておいてください」と言うと、{a}は手を止めて言われたとおりにした。|{b}は{a}の分の食料を指さした。{a}は黙って、それを差し出した。'),
    force: L('{b}は{a}を呼びつけ、皆の前で膝をつかせた。「返事は？｜返事はどうした｜返事はどうしましたか？」{a}は震える声で「はい」と答えた。|{b}は{a}に、自分の言うこと以外は聞くなと言い渡した。{a}はうなずくしかなかった。|{b}は{a}の持ち物を取り上げ、「返してほしければ、分かるよね｜返してほしければ、分かるな｜返してほしければ、分かりますよね」と笑った。{a}は、{b}の言いなりになった。'),
    obeyRe: P9({
      proud: '{a}は唇を噛んで従った。腹の底で燃えるものより、怖さのほうが勝っていた。', stern: '{a}は無言で命令をこなした。逆らえば何が起きるか、考えたくもなかった。',
      tsun: '{a}「わ、分かったってば……」――声は強がっていたが、手は素直に動いていた。', gentle: '{a}は「うん、いいよ」と笑ってみせた。笑うしか、身を守る方法を知らなかった。',
      devoted: '{a}は言われるより先に動いた。{b}の機嫌を損ねないことが、いつのまにか一番になっていた。', cool: '{a}は損得を計算して、従うほうが安全だと結論した。それが言い訳だと、自分でも分かっていた。',
      free: '{a}は「はーい」と軽く返事をした。その軽さは、怯えを隠すための精いっぱいだった。', shy: '{a}は小さく頷いて、言われたことを一つずつこなした。最後まで顔を上げられなかった。',
      polite: '{a}「かしこまりました」――深く下げた頭は、なかなか上がらなかった。'
    }),
    shelter: L('{a}は{c}の姿を見るなり、{b}の背中に隠れた。{b}の服の裾を掴む指が、白くなっていた。|{a}は{b}のそばを離れようとしなかった。{c}が近くにいるあいだ、{b}の隣だけが安全な場所だった。|{a}は小さな声で{b}に頼んだ。「お願い、少しだけ一緒にいて。{c}が……怖い｜頼む、少しだけ一緒にいてくれ。{c}が……怖い｜お願いです、少しだけ一緒にいてください。{c}が……怖いんです」'),
    shelterRe: P9({
      proud: '{b}は{c}を睨みつけ、{a}を背中にかばった。「こいつに用があるなら、先に私を通せ」', stern: '{b}は黙って{a}の前に立った。それだけで、{c}は足を止めた。',
      tsun: '{b}「し、しょうがないなあ。……ほら、ここにいれば？」{b}はそっぽを向いたまま、{a}の手を握った。', gentle: '{b}は{a}の肩を抱いて、「大丈夫、ここにいるよ」と囁いた。',
      devoted: '{b}は{a}の手を両手で包んだ。「何があっても、私が守るから」', cool: '{b}は{c}との間に自然と体を入れ、{a}を壁際に下がらせた。「落ち着くまで、ここにいろ」',
      free: '{b}は「おっ、頼られちゃった」とおどけてみせ、{a}の肩に腕を回した。その目は、{c}から離れなかった。', shy: '{b}は自分も震えながら、{a}の手をぎゅっと握り返した。「……い、一緒に、いるから」',
      polite: '{b}は穏やかに言った。「ご安心ください。お傍におります」'
    }),
    eyes: L('{a}は{b}と目が合いそうになるたび、さっと視線を落とした。|{b}の声が聞こえるだけで、{a}の肩が小さく震えた。|{a}は{b}のいる方向に背を向けて座った。{b}の姿が視界に入らないように。'),
    eyesRe: P9({
      proud: '{b}は鼻で笑った。「何をびくびくしてんだ」――その一言で、{a}はさらに縮こまった。', stern: '{b}は{a}の様子に気づいたが、何も言わなかった。その沈黙が、{a}には何より重かった。',
      tsun: '{b}「な、何よその態度。……私、何かした？」――{b}は不機嫌そうに眉を寄せた。', gentle: '{b}は少し寂しそうに目を伏せた。{a}に怖がられる理由を、{b}はうまく思い出せなかった。',
      devoted: '{b}は{a}に近づきかけて、足を止めた。これ以上怖がらせたくはなかった。', cool: '{b}は{a}を一瞥し、興味をなくしたように視線を外した。',
      free: '{b}は「え、なんでそんなに逃げるの？」と笑ったが、{a}は笑い返せなかった。', shy: '{b}も気まずそうに目を逸らした。二人のあいだに、ぎこちない沈黙が落ちた。',
      polite: '{b}「……私が何か、お気に障ることをいたしましたか」――{a}は、首を横に振ることしかできなかった。'
    })
  };
  function frWhy(r, k) { return r.F.name + 'は' + r.X.name + 'を恐れている' + k; }
  add({ id: 'tie_nw_fr_avoid', label: '恐れる相手と同じ場所にいられない', cat: 'conflict', w: 0.9, roles: frR, run: function (ctx, r) { ctx.mod(r.F, r.X, { ten: 3 }); ctx.stress(r.F, 3); return { text: fill(pk(ctx, FR.avoid), r.F, r.X) + fill(pk(ctx, FR.avoidRe[per(r.F)]), r.F, r.X), why: frWhy(r, '：同じ場所にいたがらない') }; } });
  add({ id: 'tie_nw_fr_freeze', label: '恐れる相手に話しかけられて固まる', cat: 'conflict', w: 0.8, roles: frR, run: function (ctx, r) { ctx.mod2(r.F, r.X, { ten: 4 }, { ten: 1 }); ctx.stress(r.F, 4); return { text: fill(pk(ctx, FR.freeze), r.F, r.X) + fill(pk(ctx, FR.freezeRe[per(r.F)]), r.F, r.X), why: frWhy(r, '：話しかけられると固まる') }; } });
  add({
    id: 'tie_nw_fr_obey', label: '恐れる相手に従わされる', cat: 'conflict', w: 0.8, roles: frR,
    run: function (ctx, r) {
      /* 従属の強要：恐れる側の怯えと、相手からの情の差が大きいほど（HK.Gap）、展開が重いほど起きやすい */
      var force = ctx.rng() < HK.clamp(0.2 * gapK(ctx, r.F, r.X), 0.05, 0.6);
      if (force) { ctx.mod(r.F, r.X, { ten: 8, aff: -4 }); ctx.stress(r.F, 8); } else { ctx.mod(r.F, r.X, { ten: 3, trust: -1 }); ctx.mod(r.X, r.F, { trust: 2 }); }
      return { text: fill(pk(ctx, force ? FR.force : FR.obey), r.F, r.X) + fill(pk(ctx, FR.obeyRe[per(r.F)]), r.F, r.X), why: frWhy(r, force ? '：従うことを強いられた' + gapWhy(ctx, r.F, r.X) : '：命じられると逆らえない'), mag: force ? 18 : 8 };
    }
  });
  add({
    id: 'tie_nw_fr_shelter', label: '怯える人が頼れる人に身を寄せる', cat: 'help', w: 0.7,
    roles: function (ctx, a, b) {
      var F0 = T() && T().fears; if (!F0 || F0(ctx, a, b) || F0(ctx, b, a) || T().apathy(ctx, b, a) || T().apathy(ctx, a, b)) return null;
      if (ctx.R(a, b).trust < 0 && ctx.R(a, b).aff < 10) return null;
      var x = thirds(ctx, a, b, function (c) { return F0(ctx, a, c); });
      return x.length ? { F: a, P: b } : null;
    },
    run: function (ctx, r) {
      var x = thirds(ctx, r.F, r.P, function (c) { return T().fears(ctx, r.F, c); }), X = x.length ? ctx.rng.pick(x) : null; if (!X) return null;
      ctx.mod2(r.F, r.P, { trust: 6, aff: 3 }, { trust: 2, aff: 3 }); ctx.mod(r.P, X, { ten: 3 });
      return { with: [X], text: fill(pk(ctx, FR.shelter), r.F, r.P, X) + fill(pk(ctx, FR.shelterRe[per(r.P)]), r.F, r.P, X), why: r.F.name + 'は' + X.name + 'を恐れて、' + r.P.name + 'に庇護を求めた' };
    }
  });
  add({ id: 'tie_nw_fr_eyes', label: '恐れる相手と目を合わせられない', cat: 'conflict', w: 0.6, roles: frR, run: function (ctx, r) { ctx.mod2(r.F, r.X, { ten: 2 }, { ten: 2 }); return { text: fill(pk(ctx, FR.eyes), r.F, r.X) + fill(pk(ctx, FR.eyesRe[per(r.X)]), r.F, r.X), why: frWhy(r, '：目を合わせられない') }; } });

  /* ======================= 許嫁（向きなし。{a}＝動く側、{b}＝相手） ======================= */
  function fiT(ctx, a, b) { return has(ctx, a, b, 'fiance'); }
  function feelOf(t, x) { return (t.a === x.i ? t.feel : t.feelB) || 'eager'; }
  function setFeel(t, x, v) { if (t.a === x.i) t.feel = v; else t.feelB = v; }
  function fiLoveOk(a, b) { return both(a, b) && okSexLove(a, b); }
  var FI = {
    eager: P9({
      proud: '{a}は{b}の隣にどかっと座った。「どうせ一緒になるんだ。今のうちに慣れとけ」', stern: '{a}は{b}に向き直り、改まって言った。「許嫁として、きちんと{b}を知っておきたい」',
      tsun: '{a}「べ、別に許嫁だから気にしてるわけじゃないんだからね！」――そう言いながら、{a}は{b}の分の飲み物を用意していた。', gentle: '{a}は{b}の隣に座り、柔らかく笑った。「決められた縁でも、{b}でよかったって思ってる」',
      devoted: '{a}は{b}の好きなものを、婚約が決まった日から少しずつ調べていた。今日、それを一つ{b}に手渡した。', cool: '{a}「家の取り決めとはいえ、悪くない組み合わせだと思っている。……少なくとも、私は」',
      free: '{a}は{b}の手を取って、「ねえ、式はどんなのがいい？」と楽しそうに訊いた。', shy: '{a}は真っ赤になりながら、{b}の袖をそっと引いた。「あの……許嫁、ですから。少しだけ、隣に」',
      polite: '{a}は丁寧に一礼した。「未来の伴侶として、どうぞよろしくお願いいたします」'
    }),
    back: {
      eager: L('{b}は嬉しそうに頷き、{a}の手を握り返した。決められた縁は、二人の中でゆっくりと本物になりつつあった。|{b}「私も、同じことを考えてた｜私も、同じことを考えていた｜私も、同じことを考えていました」――二人は顔を見合わせて、少し照れたように笑った。|{b}は{a}の肩に頭を預けた。親の決めた約束が、今はただ心地よかった。'),
      unsure: L('{b}は曖昧に笑った。嫌ではない。けれど、これが自分の望んだことなのか、まだ分からなかった。|{b}「……うん。ありがとう｜……ああ。ありがとう｜……はい。ありがとうございます」――{b}の返事は、少しだけ遅れた。|{b}は{a}のまっすぐさに戸惑いながらも、その手を振りほどきはしなかった。'),
      refuse: L('{b}は{a}の手を、そっと外した。「ごめん。……親が決めたことに、私はまだ頷いてない｜すまない。……親が決めたことに、私はまだ頷いていない｜ごめんなさい。……親が決めたことに、私はまだ頷いていません」|{b}は目を逸らした。{a}の好意が本物であるほど、{b}の胸は重くなった。|{b}「そういうの、やめてほしい｜そういうのは、やめてほしい｜そういうの、やめてほしいです」――{b}の声は小さかったが、はっきりしていた。')
    },
    /* 恋愛対象・受け攻めが合わない許嫁：家どうしの約束として誠実に向き合う（恋の言葉にはしない） */
    duty: L('{a}と{b}は、許嫁として礼儀正しく並んで座った。決められた縁を、二人とも家どうしの約束として受け止めていた。|{a}は{b}に、許嫁としての務めを果たすつもりだと告げた。それは恋の言葉ではなく、誠実な約束の言葉だった。|{a}と{b}は、家の行事の段取りを淡々と確かめ合った。二人のあいだにあるのは、穏やかな信頼だった。'),
    unsure: L('{a}は{b}の横顔を見ながら、親に婚約を告げられた日のことを思い出していた。|{a}は許嫁という言葉を、口の中で何度か転がしてみた。まだ、自分のものになじまなかった。|{a}は{b}に何か言いかけて、やめた。何を言えばいいのか、自分でもまとまっていなかった。'),
    unsureRe: P9({
      proud: '{a}「……決められた相手、ってのがどうも気に入らねえんだよな。{b}が悪いわけじゃねえけど」', stern: '{a}は小さく息をついた。「務めは果たす。だが、心がついてくるかは別の話だ」',
      tsun: '{a}「べ、別に嫌ってわけじゃないけど！　……ちょっと、急すぎるだけ」', gentle: '{a}は困ったように笑った。「{b}のことは嫌いじゃないよ。ただ、まだ自分の気持ちが分からないんだ」',
      devoted: '{a}は{b}に頭を下げた。「ちゃんと向き合いたいの。だから、少しだけ時間がほしい」', cool: '{a}「感情は後からついてくる、と親は言った。……本当にそうなのか、確かめている最中だ」',
      free: '{a}は「許嫁って、なんか実感ないよね」と笑った。その笑いは、半分は本音だった。', shy: '{a}は{b}と目が合うと、慌てて俯いた。嬉しいのか困っているのか、自分でも分からなかった。',
      polite: '{a}「身に余るお話だとは存じております。……ただ、まだ気持ちの整理がつかなくて」'
    }),
    refuse: L('{a}は{b}と二人きりになると、意を決したように口を開いた。|{a}は{b}から贈られたものを、手もつけずに返した。|{a}は家に宛てた手紙を書きかけて、何度も破った。宛先は、婚約を決めた親だった。'),
    refuseRe: P9({
      proud: '{a}「はっきり言っとく。私はこの話、認めてねえからな」', stern: '{a}「この婚約は受け入れられない。親にも、そう伝えるつもりだ」',
      tsun: '{a}「か、勝手に決められた相手なんて、好きになれるわけないでしょ！」', gentle: '{a}は申し訳なさそうに目を伏せた。「{b}を傷つけたくはないんだ。でも、このまま結婚はできない」',
      devoted: '{a}は深く頭を下げた。「ごめんなさい。私の心は、私が選んだ人にしかあげられない」', cool: '{a}「家どうしの取り決めに、私の意思は入っていない。だから従う理由もない」',
      free: '{a}は肩をすくめた。「ごめんね、私、決められた道を歩くの向いてないんだ」', shy: '{a}は震える声で、やっとのことで言った。「……あの、この婚約、なかったことに……できませんか」',
      polite: '{a}は丁寧に、しかしきっぱりと言った。「大変申し訳ございませんが、お受けいたしかねます」'
    }),
    refuseBack: {
      eager: L('{b}は言葉を失った。差し出しかけた手が、ゆっくりと下りた。|{b}「……そっか｜……そうか｜……そうですか」{b}はそれだけ言って、無理に笑った。|{b}の顔から、さっと血の気が引いた。'),
      unsure: L('{b}は驚いたが、どこかでほっとしている自分にも気づいた。|{b}は「私も、ちゃんと考えたかった｜＝｜私も、ちゃんと考えたかったです」とだけ答えた。|{b}はしばらく黙ってから、小さく頷いた。'),
      refuse: L('{b}「……実は、私も同じことを考えてた｜……実は、私も同じことを考えていた｜……実は、私も同じことを考えていました」二人は顔を見合わせ、初めて同じ気持ちで笑った。|{b}は肩の力を抜いた。「なら、一緒に親を説得しよう｜＝｜なら、一緒に親を説得しましょう」|{b}「気が合うのは、こういうところだけだね｜気が合うのは、こういうところだけだな｜気が合うのは、こういうところだけですね」――二人の間の空気が、少しだけ軽くなった。')
    },
    talk: L('{a}と{b}は、両家の顔合わせの日取りについて話した。どちらも、少しだけ他人行儀だった。|{a}と{b}は、子どものころに一度だけ会ったことがあると気づいた。互いに、相手のことをほとんど覚えていなかった。|{a}と{b}は、婚約を決めたそれぞれの親の口癖を言い合って、少しだけ笑った。'),
    talkRe: P9({
      proud: '{a}「ま、親の顔を立てるくらいはしてやるよ」', stern: '{a}「互いの家に恥をかかせないよう、務めは果たそう」',
      tsun: '{a}「べ、別に、{b}のこと知りたいわけじゃないけど。……一応ね」', gentle: '{a}「少しずつでいいから、{b}のこと、教えてくれる？」',
      devoted: '{a}「{b}の家のしきたり、ちゃんと覚えるね」', cool: '{a}「情報が少なすぎる。まず互いのことを知るところからだ」',
      free: '{a}「結婚とかよく分かんないけど、{b}と話すのは嫌いじゃないよ」', shy: '{a}「……あの、{b}のこと、もっと、知りたいです」',
      polite: '{a}「今後とも、末永くよろしくお願い申し上げます」'
    }),
    /* 破談のあと：元恋人に近い気まずさ */
    after: L('{a}と{b}は、婚約がなくなってから初めて同じ場所で過ごした。どちらから話しかけるべきか、二人とも分からなかった。|{a}は{b}の姿を見て、言いかけた挨拶を飲み込んだ。元許嫁という呼び方は、まだどちらにもなじまなかった。|{b}は{a}と目が合うと、気まずそうに会釈した。破談の日の言葉が、まだ二人のあいだに残っていた。'),
    warm: L('{a}は、{b}が自分のために黙って手を回してくれていたことに気づいた。親が決めた相手だということを、{a}は初めて忘れた。|{a}は{b}の笑い声を聞いて、胸の奥が温かくなるのを感じた。決められた縁が、いつのまにか自分の選んだ縁になっていた。|{a}は{b}の隣にいる時間を、いつしか待ち遠しく思うようになっていた。'),
    warmRe: P9({
      proud: '{a}「……悪くねえな、この縁も」――そう呟いた{a}の耳は赤かった。', stern: '{a}「認めよう。私は、{b}と共に歩みたいと思っている」',
      tsun: '{a}「か、勘違いしないでよね。親のためじゃなくて、私が{b}がいいって思っただけなんだから！」', gentle: '{a}は{b}の手をそっと取った。「やっと分かったんだ。{b}でよかったって」',
      devoted: '{a}は{b}をまっすぐに見た。「これからは、私が{b}を選んだんだって、胸を張って言える」', cool: '{a}「感情は後からついてくる、と親は言った。……悔しいが、その通りだった」',
      free: '{a}は「ねえ、やっぱり式、楽しみになってきた」と笑った。', shy: '{a}は消え入りそうな声で言った。「わ、私……この婚約、嬉しい、です」',
      polite: '{a}は深く頭を下げた。「改めて、私からもお願い申し上げます。どうか、末永く」'
    }),
    brk: L('{a}は{b}を呼び出し、まっすぐに告げた。「この婚約は、なかったことにしてほしい。……ほかに、想ってる人がいるんだ｜この婚約は、なかったことにしてほしい。……ほかに、想う人がいるんだ｜この婚約は、なかったことにしてください。……ほかに、想う人がいるんです」{a}の視線の先には、{c}がいた。|{a}は家に宛てて、婚約を断る手紙を出した。{c}への想いを、もう自分に偽ることはできなかった。|{a}は皆の前で、{b}との婚約を解くと言い切った。{c}は驚いたように{a}を見つめていた。'),
    brkRe: P9({
      proud: '{a}「決めたのは親だ。私の相手は、私が決める」', stern: '{a}「筋は通す。だが、心まで縛られるつもりはない」',
      tsun: '{a}「わ、悪いとは思ってるわよ！　でも、仕方ないじゃない……！」', gentle: '{a}「{b}には、本当に申し訳ないと思ってる。でも、嘘をついたまま一緒にはなれない」',
      devoted: '{a}「私の心は、もう一人のものなの。ごめんなさい」', cool: '{a}「続けても、誰も幸せにならない。それが私の結論だ」',
      free: '{a}「ごめん、{b}。私、自分の気持ちに正直でいたいんだ」', shy: '{a}は泣きそうな顔で、それでも最後まで言い切った。「……ごめんなさい」',
      polite: '{a}「勝手を申し上げて、まことに申し訳ございません」'
    }),
    brkBack: L('{b}はしばらく黙っていたが、やがて静かに頷いた。|{b}は何も言わずに背を向けた。その肩が、小さく震えていた。|{b}「……分かった。親には、私からも話す｜＝｜……分かりました。親には、私からも話します」')
  };
  TN.FI = FI;
  function fiOpen(ctx, a, b) { var t = fiT(ctx, a, b); return t && !t.broken && ctx.pair(a, b).fiBroken == null ? t : null; }
  function fiWhy(t, a, b, k) { return a.name + 'と' + b.name + 'は許嫁（' + a.name + '：' + HK.FIANCE_FEEL[feelOf(t, a)].short + '・' + b.name + '：' + HK.FIANCE_FEEL[feelOf(t, b)].short + '）' + k; }
  add({
    id: 'tie_nw_fi_eager', label: '乗り気の許嫁が歩み寄る', cat: 'bond', w: 0.8,
    roles: function (ctx, a, b) { var t = fiOpen(ctx, a, b); return t && feelOf(t, a) === 'eager' ? { a: a, b: b, t: t } : null; },
    run: function (ctx, r) {
      var a = r.a, b = r.b, t = r.t, fb = feelOf(t, b);
      if (!fiLoveOk(a, b)) { ctx.mod2(a, b, { trust: 3, aff: 2 }, { trust: 3, aff: 2 }); return { cat: 'bond', text: fill(pk(ctx, FI.duty), a, b), why: fiWhy(t, a, b, '：家どうしの約束として') }; }
      var text = fill(pk(ctx, FI.eager[per(a)]), a, b) + fill(pk(ctx, FI.back[fb]), a, b);
      if (fb === 'refuse') { ctx.mod2(a, b, { ten: 2 }, { ten: 4 }); return { cat: 'conflict', text: text, why: fiWhy(t, a, b, '：乗り気の側の歩み寄りを拒んだ') }; }
      ctx.mod2(a, b, { att: 5, aff: 4 }, { att: fb === 'eager' ? 4 : 2, aff: 2 });
      return { cat: 'romance', text: text, why: fiWhy(t, a, b, '：乗り気の側から歩み寄る') };
    }
  });
  add({
    id: 'tie_nw_fi_unsure', label: '決められた縁に戸惑う許嫁', cat: 'bond', w: 0.6,
    roles: function (ctx, a, b) { var t = fiOpen(ctx, a, b); return t && feelOf(t, a) === 'unsure' ? { a: a, b: b, t: t } : null; },
    run: function (ctx, r) { ctx.mod2(r.a, r.b, { ten: 1, aff: 1 }, { ten: 1 }); return { text: fill(pk(ctx, FI.unsure), r.a, r.b) + fill(pk(ctx, FI.unsureRe[per(r.a)]), r.a, r.b), why: fiWhy(r.t, r.a, r.b, '：決められた縁への戸惑い') }; }
  });
  add({
    id: 'tie_nw_fi_refuse', label: '許嫁に断りたい気持ちを打ち明ける', cat: 'conflict', w: 0.7,
    roles: function (ctx, a, b) { var t = fiOpen(ctx, a, b); return t && feelOf(t, a) === 'refuse' ? { a: a, b: b, t: t } : null; },
    run: function (ctx, r) {
      var fb = feelOf(r.t, r.b);
      if (fb === 'refuse') ctx.mod2(r.a, r.b, { aff: 3, trust: 3 }, { aff: 3, trust: 3 }); else { ctx.mod(r.b, r.a, { ten: 6, aff: -3 }); ctx.mod(r.a, r.b, { ten: 3 }); }
      return { text: fill(pk(ctx, FI.refuse), r.a, r.b) + fill(pk(ctx, FI.refuseRe[per(r.a)]), r.a, r.b) + fill(pk(ctx, FI.refuseBack[fb]), r.a, r.b), why: fiWhy(r.t, r.a, r.b, '：断りたい気持ちを打ち明けた') };
    }
  });
  add({
    id: 'tie_nw_fi_talk', label: '許嫁どうしで婚約について話す', cat: 'bond', w: 0.5,
    roles: function (ctx, a, b) { var t = fiT(ctx, a, b); return t ? { a: a, b: b, t: t } : null; },
    run: function (ctx, r) {
      if (r.t.broken || ctx.pair(r.a, r.b).fiBroken != null) { ctx.mod2(r.a, r.b, { ten: 2 }, { ten: 2 }); return { text: fill(pk(ctx, FI.after), r.a, r.b), why: r.a.name + 'と' + r.b.name + 'は元許嫁：破談のあとの気まずさ' }; }
      ctx.mod2(r.a, r.b, { aff: 2, trust: 2 }, { aff: 2, trust: 2 });
      return { text: fill(pk(ctx, FI.talk), r.a, r.b) + fill(pk(ctx, FI.talkRe[per(r.a)]), r.a, r.b), why: fiWhy(r.t, r.a, r.b, '：婚約をめぐる話') };
    }
  });
  /* 戸惑いから乗り気へ（恋愛対象・受け攻めが合う組だけ）。両方が乗り気になり、どちらにもほかの恋人がいなければ恋人と同じ扱いにする */
  add({
    id: 'tie_nw_fi_warm', label: '決められた縁を自分で選び直す', cat: 'romance', w: 0.6,
    roles: function (ctx, a, b) {
      var t = fiOpen(ctx, a, b); if (!t || feelOf(t, a) !== 'unsure' || !fiLoveOk(a, b)) return null;
      var x = ctx.R(a, b), y = ctx.R(b, a);
      return x.att > 20 && (x.aff + y.aff + x.trust + y.trust) / 4 > 22 ? { a: a, b: b, t: t } : null;
    },
    run: function (ctx, r) {
      var a = r.a, b = r.b, t = r.t, pf = ctx.pair(a, b);
      setFeel(t, a, 'eager');
      ctx.mod2(a, b, { att: 6, aff: 5 }, { att: 3, aff: 3 });
      var other = function (x) { return ctx.chars.some(function (c) { return c !== a && c !== b && c.alive !== false && ctx.pair(x, c).couple; }); };
      if (feelOf(t, b) === 'eager' && !pf.couple && !other(a) && !other(b)) { pf.couple = true; t.couple = true; (a.loveSet = a.loveSet || []).push(b.i); (b.loveSet = b.loveSet || []).push(a.i); }
      return { text: fill(pk(ctx, FI.warm), a, b) + fill(pk(ctx, FI.warmRe[per(a)]), a, b), why: fiWhy(t, a, b, '：決められた縁を、自分で選び直した') };
    }
  });
  /* 破談：断りたい側が、ほかの人（恋愛が成り立つ相手）に惹かれている */
  function brkFor(ctx, a, b) { return thirds(ctx, a, b, function (c) { var r = ctx.R(a, c); return r.att >= 35 && r.aff >= 20 && both(a, c); }); }
  add({
    id: 'tie_nw_fi_break', label: '許嫁がほかの人を好きになり破談', cat: 'conflict', w: 1.2,
    roles: function (ctx, a, b) { var t = fiOpen(ctx, a, b); return t && feelOf(t, a) === 'refuse' && brkFor(ctx, a, b).length ? { a: a, b: b, t: t } : null; },
    run: function (ctx, r) {
      var a = r.a, b = r.b, t = r.t, pf = ctx.pair(a, b), l = brkFor(ctx, a, b), c = null, bv = -1;
      l.forEach(function (x) { var v = ctx.R(a, x).att + ctx.R(a, x).aff * 0.5; if (v > bv) { bv = v; c = x; } });
      if (!c) return null;
      t.broken = true; t.couple = false; pf.couple = false; pf.fiBroken = ctx.stepIndex;
      ctx.mod2(a, b, { ten: 14, aff: -4, att: -8 }, { ten: 18, aff: -8, trust: -6, att: -8 }); ctx.mod(a, c, { att: 4 }); ctx.stress(b, 10);
      return { with: [c], text: fill(pk(ctx, FI.brk), a, b, c) + fill(pk(ctx, FI.brkRe[per(a)]), a, b, c) + fill(pk(ctx, FI.brkBack), a, b, c), why: '許嫁の破談（' + a.name + 'は断りたい気持ちのまま、' + c.name + 'に想いを寄せた）', mag: 30 };
    }
  });

  /* ======================= 執着（依存・愛憎）（{a}＝執着する側、{b}＝執着される側） ======================= */
  function yanR(sub) { return function (ctx, a, b) { var r = dir(ctx, a, b, 'yan', function (t) { return t.sub === sub; }); if (!r) return null; if (HK.Obsess && HK.Obsess.blocked && HK.Obsess.blocked(ctx, r.A, r.B)) return null; return r; }; }
  var DEP = {
    search: L('{b}が少し席を外しただけで、{a}は顔色を変えて探し回った。見つけたとたん、{a}は{b}の袖を掴んで離さなかった。|{a}は{b}の姿が見えないことに気づくと、名前を呼びながらあちこちを駆け回った。|{b}が戻ってくると、{a}は泣き出しそうな顔で駆け寄った。「どこ行ってたの。……いなくなったかと思った｜どこへ行っていた。……いなくなったかと思った｜どこへ行っていたんですか。……いなくなったかと思いました」'),
    check: L('{a}は数分おきに{b}のほうを振り返った。そこに{b}がいることを、何度でも確かめずにはいられなかった。|{a}「ねえ、ちゃんといる？｜おい、ちゃんといるか｜あの、ちゃんといますか？」――返事を聞くまで、{a}は同じことを何度も訊いた。|{a}は{b}が眠っているあいだも、その寝息を確かめるように、そばを離れなかった。'),
    cling: L('{a}は{b}の腕にすがりついた。「お願い、一人にしないで。{b}がいないと、何もできない｜頼む、一人にしないでくれ。{b}がいないと、何もできない｜お願いです、一人にしないでください。{b}がいないと、何もできません」|{b}が誰かと話しに行こうとすると、{a}はその手を握って引き留めた。「すぐ戻る？　本当に？｜すぐ戻るのか？　本当か？｜すぐ戻りますか？　本当ですか？」|{a}は{b}の背中に額を押しつけたまま、しばらく動かなかった。「……もう少しだけ、このままで｜……もう少しだけ、このままでいさせてくれ｜……もう少しだけ、このままでいさせてください」'),
    worry: L('{a}は{b}の顔色ばかり気にしていた。{b}が少し咳をしただけで、{a}は自分の上着を差し出した。|{a}は{b}が食べたものの量まで覚えていた。「今日、あんまり食べてないよね。大丈夫？｜今日は、あまり食べていないな。大丈夫か｜今日、あまり食べていませんよね。大丈夫ですか？」|{a}は{b}の様子が少しでも違うと、何があったのか知るまで落ち着かなかった。'),
    re: P9({
      proud: '{b}「……ったく、しょうがねえな。ほら、ここにいるだろ」|{b}は面倒くさそうに頭をかいたが、{a}の手を振りほどきはしなかった。',
      stern: '{b}「落ち着け。私はどこへも行かない」――{b}の声は、厳しくも静かだった。|{b}は{a}を正面から見て、ゆっくりと言った。「一人で立てるようになれ。……そばにはいるから」',
      tsun: '{b}「も、もう、心配しすぎ！　……どこにも行かないってば」|{b}は顔を赤くしながら、{a}の頭を乱暴に撫でた。',
      gentle: '{b}は{a}の背中をそっと撫でた。「大丈夫。ちゃんとここにいるよ」|{b}は困ったように笑いながらも、{a}が落ち着くまで隣にいた。',
      devoted: '{b}は{a}の手を握り返した。「私も、{a}がいないと困るよ」――その言葉に、{a}はようやく息をついた。|{b}は{a}の隣に座り直した。どちらがどちらに寄りかかっているのか、もう分からなかった。',
      cool: '{b}は小さくため息をついた。「確認の頻度が多すぎる。……だが、気持ちは分かった」|{b}「心配するな。私の居場所は、決まったら必ず伝える」',
      free: '{b}は「はいはい、ここにいますよー」と笑って、{a}の頬をつついた。|{b}は「重いなあ」と笑ったが、その声に嫌がる響きはなかった。',
      shy: '{b}は戸惑いながらも、{a}の袖をそっと握り返した。「……い、いるよ」|{b}は何と言えばいいか分からず、ただ{a}の隣に座り直した。',
      polite: '{b}「ご心配をおかけしました。ずっとお側におります」|{b}は穏やかに微笑んだ。「どうか、少しだけ肩の力を抜いてください」'
    }),
    /* 執着される側が怖がっている・嫌っている・恐れているとき */
    reCold: L('{b}は{a}の手から、そっと身を引いた。重すぎる想いが、怖かった。|{b}は返事をせずに顔を背けた。{a}の目が、すがるように{b}を追った。|{b}「……少し、一人にさせて｜……少し、一人にさせてくれ｜……少し、一人にさせてください」――その言葉が、{a}をさらに不安にさせた。')
  };
  function coldBack(ctx, A, B) { var s = HK.Obsess && HK.Obsess.stance ? HK.Obsess.stance(ctx, B, A) : ''; return s === 'afraid' || s === 'hate' || (T().fears && T().fears(ctx, B, A)) || (T().apathy && T().apathy(ctx, B, A)); }
  function obWhy(ctx, r, k) { var lv = HK.Obsess && HK.Obsess.level ? Math.round(HK.Obsess.level(ctx, r.A, r.B)) : 0; return r.A.name + 'の' + r.B.name + 'への執着（' + (lv ? lv + '・' : '') + k + '）' + gapWhy(ctx, r.A, r.B); }
  function depRun(key, cat) {
    return function (ctx, r) {
      var cold = coldBack(ctx, r.A, r.B);
      ctx.mod(r.B, r.A, cold ? { ten: 5, aff: -2 } : { ten: 2, aff: 1 }); ctx.stress(r.A, 3);
      if (HK.Obsess && HK.Obsess.add) HK.Obsess.add(ctx, r.A, r.B, cold ? 3 : 1.5);
      return { cat: cat, text: fill(pk(ctx, DEP[key]), r.A, r.B) + fill(pk(ctx, cold ? DEP.reCold : DEP.re[per(r.B)]), r.A, r.B), why: obWhy(ctx, r, '依存型' + { search: '：離れると探す', check: '：何度も確かめる', cling: '：すがる', worry: '：気にしてばかりいる' }[key]) };
    };
  }
  add({ id: 'tie_nw_dep_search', label: '依存する相手の姿が見えず探し回る', cat: 'conflict', w: 0.6, roles: yanR('dep'), run: depRun('search', 'conflict') });
  add({ id: 'tie_nw_dep_check', label: '依存する相手を何度も確かめる', cat: 'conflict', w: 0.5, roles: yanR('dep'), run: depRun('check', 'conflict') });
  add({ id: 'tie_nw_dep_cling', label: '依存する相手にすがりつく', cat: 'conflict', w: 0.5, roles: yanR('dep'), run: depRun('cling', 'conflict') });
  add({ id: 'tie_nw_dep_worry', cat: 'bond', w: 0.5, roles: yanR('dep'), run: depRun('worry', 'bond') });
  var HL = {
    seek: L('{a}は{b}が戻らないと聞くと、誰より先に探しに出た。見つけた{b}に、{a}は怒鳴った。「勝手なことするな！｜勝手なことをするな！｜勝手なことをしないでください！」|{a}は{b}の姿を見つけるまで、一度も足を止めなかった。見つけてから、ようやく自分の息が切れていることに気づいた。|{a}は{b}を探し当てると、黙って隣に腰を下ろした。「……別に、心配したわけじゃない｜……別に、心配したわけではない｜……別に、心配したわけじゃありません」'),
    guard: L('{b}が危ない目に遭いかけた瞬間、{a}は体ごと割って入った。かばったあとで、{a}は{b}を睨みつけた。|{a}は{b}に近づこうとした者を、冷たい一瞥で追い払った。「{b}を傷つけていいのは、私だけ｜{b}を傷つけていいのは、私だけだ｜{b}を傷つけていいのは、私だけです」|{a}は{b}の盾になって傷を負った。手当てしようとする{b}の手を、{a}は振り払った。'),
    test: L('{a}は{b}に、わざと答えにくい問いを投げた。「私がいなくなったら、{b}は泣く？　それとも、ほっとする？｜私がいなくなったら、{b}は泣くか？　それとも、ほっとするか？｜私がいなくなったら、{b}は泣きますか？　それとも、ほっとしますか？」|{a}は{b}の小さな失敗を、何度も蒸し返して責めた。責めながら、{a}は{b}の顔から目を離さなかった。|{a}は{b}が自分を選ぶかどうか、わざと素っ気なくしてみせて試した。'),
    wound: L('{a}「{b}なんか、最初からいなければよかった｜{b}など、最初からいなければよかった｜{b}なんか、最初からいなければよかったんです」――言った瞬間、{a}自身がいちばん傷ついた顔をした。|{a}は{b}のいちばん触れられたくないところを、正確に言葉で突いた。{b}が黙り込むと、{a}は背を向けた。|{a}「大嫌い。……だから、私以外を見ないで｜大嫌いだ。……だから、私以外を見るな｜大嫌いです。……だから、私以外を見ないでください」'),
    re: P9({
      proud: '{b}「意味わかんねえ。……嫌いなら放っとけよ」――そう言いながら、{b}は{a}から目を逸らせなかった。|{b}は{a}の胸ぐらを掴みかけて、その目に浮かぶものに気づいて手を止めた。',
      stern: '{b}「矛盾している。だが……それが{a}なのだろう」|{b}は黙って{a}の言葉を受け止めた。責める声の底にあるものを、{b}は聞き逃さなかった。',
      tsun: '{b}「な、なによ、優しくしたり意地悪したり……！　どっちなのよ！」|{b}は唇を噛んで、それでも{a}の隣を離れなかった。',
      gentle: '{b}は傷ついた顔で、それでも{a}の手を取った。「{a}が苦しいのは、分かってるよ」|{b}は何も言い返さず、ただ悲しそうに笑った。',
      devoted: '{b}「憎まれてもいい。{a}のそばにいられるなら」|{b}は{a}の言葉に傷つきながら、それでも{a}の無事を確かめずにはいられなかった。',
      cool: '{b}は冷静に{a}を見返した。「憎むのも、執着の一つの形だ」|{b}「試されるのは好きじゃない。……でも、答えは変わらない」',
      free: '{b}は「はいはい、愛されてるねえ私」とおどけたが、その目は少し潤んでいた。|{b}は笑ってかわそうとして、うまくいかなかった。',
      shy: '{b}は泣きそうな顔で黙り込んだ。{a}の言葉の、どこまでが本当なのか分からなかった。|{b}は小さく震えながら、{a}の袖を掴んだままでいた。',
      polite: '{b}「……左様でございますか」――丁寧な言葉の端が、かすかに震えていた。|{b}は深く息を吸ってから言った。「それでも、お傍を離れるつもりはございません」'
    })
  };
  function hlRun(key) {
    return function (ctx, r) {
      var hurt = key === 'test' || key === 'wound', cold = coldBack(ctx, r.A, r.B);
      if (hurt) { ctx.mod(r.B, r.A, { ten: 6, aff: -3 }); ctx.mod(r.A, r.B, { att: 2 }); ctx.stress(r.B, 6); } else ctx.mod2(r.A, r.B, { aff: 3 }, { trust: 3, aff: 2 });
      if (HK.Obsess && HK.Obsess.add) HK.Obsess.add(ctx, r.A, r.B, hurt ? 3 : 2);
      return { cat: hurt ? 'conflict' : 'help', text: fill(pk(ctx, HL[key]), r.A, r.B) + fill(pk(ctx, cold ? DEP.reCold : HL.re[per(r.B)]), r.A, r.B), why: obWhy(ctx, r, '愛憎型' + { seek: '：姿が見えないと探す', guard: '：憎みながら守る', test: '：責めて試す', wound: '：傷つける言葉' }[key]), mag: hurt ? 14 : 10 };
    };
  }
  add({ id: 'tie_nw_hl_seek', label: '執着の相手が戻らず探しに出る（試す）', cat: 'help', w: 0.5, roles: yanR('hatelove'), run: hlRun('seek') });
  add({ id: 'tie_nw_hl_guard', label: '執着の相手を危険からかばう（試す）', cat: 'help', w: 0.5, roles: yanR('hatelove'), run: hlRun('guard') });
  /* 責める・傷つける：想いの差が大きいほど起きやすい */
  add({ id: 'tie_nw_hl_test', label: '執着の相手の気持ちを試す', cat: 'conflict', w: function (ctx, r) { return 0.45 * gapK(ctx, r.A, r.B); }, roles: yanR('hatelove'), run: hlRun('test') });
  add({ id: 'tie_nw_hl_wound', label: '執着の相手に心ない言葉をぶつける（試す）', cat: 'conflict', w: function (ctx, r) { return 0.4 * gapK(ctx, r.A, r.B); }, roles: yanR('hatelove'), run: hlRun('wound') });

  /* ======================= 憎悪（{a}＝憎む側、{b}＝憎まれる側。文は feud-kit.js） ======================= */
  function hateR(ctx, a, b) { var Fd = HK.Feud; if (!Fd || !Fd.hateGrade || !Fd.HATE) return null; if (Fd.hateGrade(ctx, a, b)) return { A: a, B: b }; if (Fd.hateGrade(ctx, b, a)) return { A: b, B: a }; return null; }
  function hTxt(ctx, key, r, c) { var Fd = HK.Feud, re = Fd.HATE_RE[key] || Fd.HATE_RE.harm; return fill(pk(ctx, Fd.HATE[key]), r.A, r.B, c) + fill(pk(ctx, re[per(r.B)] || re.gentle), r.A, r.B, c); }
  function hWhy(ctx, r, k) { return r.A.name + 'は' + r.B.name + 'を憎んでいる（敵対・憎悪）' + k; }
  add({ id: 'tie_nw_hate_demean', label: '憎む相手を人前で貶める', cat: 'conflict', w: 0.7, roles: hateR, run: function (ctx, r) { ctx.mod(r.B, r.A, { ten: 8, aff: -6 }); ctx.mod(r.A, r.B, { ten: 2 }); ctx.stress(r.B, 6); return { text: hTxt(ctx, 'demean', r), why: hWhy(ctx, r, '：貶める') }; } });
  add({ id: 'tie_nw_hate_trap', label: '憎む相手を陥れる', cat: 'betray', w: 0.6, roles: hateR, run: function (ctx, r) { ctx.mod(r.B, r.A, { ten: 6, trust: -6 }); ctx.stress(r.B, 8); return { cat: 'conflict', text: hTxt(ctx, 'trap', r), why: hWhy(ctx, r, '：陥れる') }; } });
  add({
    id: 'tie_nw_hate_isolate', label: '憎む相手を孤立させる', cat: 'conflict', w: 0.6,
    roles: function (ctx, a, b) { var r = hateR(ctx, a, b); return r && thirds(ctx, r.A, r.B).length ? r : null; },
    run: function (ctx, r) {
      var c = ctx.rng.pick(thirds(ctx, r.A, r.B)); if (!c) return null;
      ctx.mod(c, r.B, { aff: -6, trust: -6 }); ctx.mod(r.B, c, { ten: 3 }); ctx.stress(r.B, 6);
      return { with: [c], text: hTxt(ctx, 'isolate', r, c), why: hWhy(ctx, r, '：孤立させる（' + c.name + 'に陰口を吹き込んだ）') };
    }
  });
  /* 危害：想いの差（HK.Gap.k）と展開の重さ（harm）で重みが変わる。命に関わるのは死のある箱庭で、憎しみが極まっているときだけ */
  add({
    id: 'tie_nw_hate_harm', label: '憎しみが危害に変わる', cat: 'conflict', w: function (ctx, r) { return 0.35 * gapK(ctx, r.A, r.B) * (HK.Dark ? HK.Dark.f(ctx, 'harm') : 1); }, roles: hateR,
    run: function (ctx, r) {
      var A = r.A, B = r.B, safe = !!HK.SAFE_ON, lv = HK.HateKit ? HK.HateKit.level(ctx, A, B) : 80, gw = gapWhy(ctx, A, B);
      /* 憎悪を持っても殺さない相手（attr.js の HK.Attr.spare）なら、危害までで止める */
      if (!safe && deadly(ctx) && ctx.kill && lv >= 80 && ctx.rng() < HK.clamp(0.22 * gapK(ctx, A, B) * (HK.Dark ? HK.Dark.f(ctx, 'kill') : 1), 0, 0.7) && !(HK.Attr && HK.Attr.spare && HK.Attr.spare(ctx, B, A))) {
        ctx.kill(B, A, A.name + 'の憎しみに駆られて');
        return { cat: 'kill', text: fill(pk(ctx, HK.Feud.HATE.harmKill), A, B), why: hWhy(ctx, r, '：憎しみが命を奪った' + gw), mag: 60 };
      }
      if (safe || !deadly(ctx)) { ctx.mod(B, A, { ten: 14, trust: -8 }); ctx.stress(B, 10); return { text: hTxt(ctx, 'threat', r), why: hWhy(ctx, r, '：脅しに出た' + gw), mag: 20 }; }
      B.hp = Math.max(1, (B.hp || 100) - 30); ctx.mod(B, A, { ten: 20, aff: -15, trust: -15 }); ctx.stress(B, 18);
      return { cat: 'combat', text: hTxt(ctx, 'harm', r), why: hWhy(ctx, r, '：危害を加えた' + gw), mag: 35 };
    }
  });

  /* ======================= 負い目（恩人の関係で、恩を受けた側の気持ちが「負い目」。{a}＝恩人、{b}＝恩を受けた側） ======================= */
  function guR(ctx, a, b) { var r = dir(ctx, a, b, 'benefactor', function (t) { return t.feel === 'guilt'; }); return r ? { A: r.A, K: r.B } : null; }
  var GU = {
    refuse: L('{a}が何気なく頼みごとを口にすると、{b}は考えるより先に「やる｜やろう｜やります」と答えていた。|{a}は{b}に、少し無理のある用事を頼んだ。{b}は一瞬ためらい、それでも引き受けた。|{b}は自分の分を後回しにして、{a}に頼まれたことを先に片づけた。'),
    refuseRe: P9({
      proud: '{b}「……借りがあるからな。断れるわけねえだろ」', stern: '{b}「恩を受けた身だ。断る理由はない」――そう言い切る声が、わずかに固かった。',
      tsun: '{b}「べ、別に恩返しとかじゃないし！　……でも、やるけど」', gentle: '{b}は笑顔で引き受けた。断るという選択肢は、最初から{b}の中になかった。',
      devoted: '{b}「{a}の頼みなら、何だって。……あの日のこと、忘れてないから」', cool: '{b}は損得を考えかけて、やめた。{a}への借りは、計算できるものではなかった。',
      free: '{b}は「いいよー」と軽く答えた。軽く答えなければ、重さに押しつぶされそうだった。', shy: '{b}は小さく頷いた。「……わ、私でよければ」――断る言葉は、喉に引っかかったままだった。',
      polite: '{b}「承知いたしました。ご恩に報いる機会をいただき、ありがとうございます」'
    }),
    obey: L('{a}の判断が間違っていると、{b}には分かっていた。それでも、{b}は口をつぐんだ。|{b}は{a}に反対しようとして、言葉を飲み込んだ。救われた日のことが、頭をよぎった。|{a}が危ない方へ進もうとしたとき、{b}は止めずに黙ってついていった。'),
    obeyRe: P9({
      proud: '{b}は奥歯を噛みしめた。「……あんたに逆らえるかよ」', stern: '{b}は黙って頭を下げた。恩人に意見するのは、{b}にとって裏切りと同じだった。',
      tsun: '{b}「わ、私が口出しすることじゃないし……」――言いたいことは山ほどあった。', gentle: '{b}は困ったように微笑んで、何も言わなかった。{a}を困らせるくらいなら、自分が困るほうがよかった。',
      devoted: '{b}「{a}がそう決めたなら、私はついていく」――それが本心なのか、{b}にも分からなかった。', cool: '{b}は反論を三つ用意して、一つも口にしなかった。',
      free: '{b}は「ま、いっか」と笑った。本当は、少しもよくなかった。', shy: '{b}は何か言いかけて、俯いた。恩人の前では、どうしても声が出なかった。',
      polite: '{b}「仰せのままに」――その一言を口にするたび、{b}の胸に小さな棘が増えていった。'
    }),
    guilt: L('{b}は{a}の背中を見ながら、あの日のことを思い出していた。あのとき助けられなければ、自分はここにいなかった。|{a}に礼を言われるたび、{b}は居心地が悪くなった。礼を言うべきなのは、いつだって自分のほうだった。|{b}は{a}に何か返せたためしがない、と思っていた。返しても返しても、借りは減らなかった。'),
    guiltRe: P9({
      proud: '{b}「……いつか、まとめて返す。それまでは、借りっぱなしだ」', stern: '{b}は心の中で、恩の重さを数え直した。数えるたびに、少しだけ重くなった。',
      tsun: '{b}「恩とか、そういうの、重いんだってば……」――呟いた声は、誰にも届かなかった。', gentle: '{b}は小さく息をついた。「私、{a}に何をしてあげられるんだろう」',
      devoted: '{b}は胸の前で手を握った。この命は、もう半分{a}のものだと思っていた。', cool: '{b}は自分の中の罪悪感を、冷静に眺めた。理屈では片づかない感情だった。',
      free: '{b}は「借りっぱなしって性に合わないんだよね」と笑った。笑いながら、目を伏せた。', shy: '{b}は{a}と目が合うと、申し訳なさそうに俯いた。',
      polite: '{b}「このご恩は、一生かけてもお返しできそうにありません」'
    })
  };
  function guWhy(r, k) { return r.K.name + 'は恩人の' + r.A.name + 'に負い目がある' + k; }
  add({ id: 'tie_nw_gu_refuse', label: '恩人の頼みを断れない', cat: 'help', w: 0.7, roles: guR, run: function (ctx, r) { ctx.mod2(r.A, r.K, { trust: 2 }, { trust: 2, ten: 2 }); ctx.stress(r.K, 3); return { text: fill(pk(ctx, GU.refuse), r.A, r.K) + fill(pk(ctx, GU.refuseRe[per(r.K)]), r.A, r.K), why: guWhy(r, '：頼みを断れない') }; } });
  add({ id: 'tie_nw_gu_obey', label: '負い目から恩人に逆らえない', cat: 'bond', w: 0.5, roles: guR, run: function (ctx, r) { ctx.mod(r.K, r.A, { ten: 3 }); ctx.stress(r.K, 4); return { text: fill(pk(ctx, GU.obey), r.A, r.K) + fill(pk(ctx, GU.obeyRe[per(r.K)]), r.A, r.K), why: guWhy(r, '：逆らえない') }; } });
  add({ id: 'tie_nw_gu_guilt', cat: 'bond', w: 0.5, roles: guR, run: function (ctx, r) { ctx.mod(r.K, r.A, { trust: 2, ten: 1 }); ctx.stress(r.K, 2); return { text: fill(pk(ctx, GU.guilt), r.A, r.K) + fill(pk(ctx, GU.guiltRe[per(r.K)]), r.A, r.K), why: guWhy(r, '：罪悪感') }; } });

  /* ======================= 推し（一方的な好意・敬愛の様子「推し」。{a}＝推している側、{b}＝推し） ======================= */
  function osR(ctx, a, b) { var r = dir(ctx, a, b, 'fond', function (t) { return t.mode === 'oshi'; }); return r ? { O: r.A, S: r.B } : null; }
  var OS = {
    cheer: L('{a}は{b}が何かをやり遂げるたびに、誰よりも大きな拍手を送った。|{a}は{b}が手こずっているのを見て、少し離れたところから小さく拳を握った。「がんばれ……！｜＝｜がんばってください……！」|{a}は{b}のいいところを、聞かれてもいないのに熱く語っていた。'),
    cheerRe: P9({
      proud: '{a}「見たか今の！　やっぱ{b}は格が違うんだよ！」', stern: '{a}は表情を崩さないまま、心の中で何度も頷いていた。――さすがだ。',
      tsun: '{a}「べ、別にファンとかじゃないし！　……でも、今のはちょっとかっこよかった」', gentle: '{a}は目を輝かせて、そっと手を合わせた。「{b}、すごいなあ……」',
      devoted: '{a}は胸の前で両手を組んだ。「{b}が笑ってくれるなら、それだけで生きていける」', cool: '{a}は冷静を装いながら、{b}の動きを一つ残らず目に焼きつけていた。',
      free: '{a}は「{b}最高ー！」と叫んで、視線を浴びても気にしなかった。', shy: '{a}は物陰から、こっそり小さく手を振った。{b}が気づかなくても、それでよかった。',
      polite: '{a}「本日の{b}様も、たいへん尊うございました」'
    }),
    gift: L('{a}は{b}の好物を、名前も書かずにそっと{b}の荷物の上に置いた。|{a}は{b}が疲れていそうなのを見て、飲み物を差し入れた。「これ、よかったら……！｜＝｜これ、よかったらどうぞ……！」|{a}は自分の分を削ってでも、{b}への差し入れを欠かさなかった。'),
    giftRe: P9({
      proud: '{b}「お、気が利くじゃん」――その一言で、{a}はその日一日を幸せに過ごした。', stern: '{b}は短く「助かる」と言った。{a}にとって、それは何よりの勲章だった。',
      tsun: '{b}「べ、別に欲しかったわけじゃないけど。……ありがと」', gentle: '{b}は嬉しそうに笑った。「ありがとう、{a}」――名前を呼ばれて、{a}は固まった。',
      devoted: '{b}は丁寧に礼を言い、お返しに何かできないかと{a}に訊いた。{a}は首が取れそうなほど横に振った。', cool: '{b}は差し入れを確かめて、「ちょうど欲しかった」と頷いた。{a}は小さく拳を握った。',
      free: '{b}は「えっ、これ私に？　やったー！」と喜んだ。{a}は、その笑顔だけで報われた。', shy: '{b}は驚いたように目を瞬かせて、小さく頭を下げた。{a}も同じくらい赤くなっていた。',
      polite: '{b}「お心遣い、ありがとうございます」――{b}の丁寧な礼に、{a}は思わず背筋を伸ばした。'
    }),
    watch: L('{a}は{b}から少し離れた場所に陣取って、ずっとその姿を見守っていた。近づきすぎないのが、{a}の決まりだった。|{a}は今日の{b}の様子を、手帳に細かく書き留めた。どこかに書き残さずにはいられなかった。|{a}は端末を握りしめて、「今日の{b}、尊すぎた」と書き込んだ。届くかどうかは、どうでもよかった。'),
    watchRe: P9({
      proud: '{a}「推しは遠くから見るもんなんだよ。分かってねえな」', stern: '{a}は距離を保ったまま、静かに見守り続けた。それが礼儀だと思っていた。',
      tsun: '{a}「み、見てないし！　たまたま視界に入ってるだけ！」', gentle: '{a}は{b}が笑うたびに、自分のことのように微笑んだ。',
      devoted: '{a}は{b}の一日が無事に終わるよう、そっと祈った。', cool: '{a}は観察記録を更新した。「本日も異常なし。尊い」',
      free: '{a}は一人でにやにやしながら、何度も{b}のほうを振り返った。', shy: '{a}は{b}と目が合いそうになるたび、慌てて物陰に隠れた。',
      polite: '{a}は遠くから深々と一礼した。{b}は気づいていなかった。'
    }),
    freeze: L('{b}が不意に{a}に話しかけた。「ねえ、いつもありがとう｜いつも、ありがとう｜いつも、ありがとうございます」{a}は、その場で石のように固まった。|{b}に名前を呼ばれた瞬間、{a}は手に持っていたものを全部落とした。|{b}が隣に座った。{a}は息の仕方を忘れた。'),
    freezeRe: P9({
      proud: '{a}「お、おう……！　あ、いや、どういたしまして……っす」', stern: '{a}は背筋を伸ばしたまま、ひと言も発せなかった。耳だけが真っ赤だった。',
      tsun: '{a}「な、ななな何でもないから！　話しかけないで、心臓に悪い！」', gentle: '{a}はふわふわした声で「は、はい……」と答え、そのあと自分が何を言ったか覚えていなかった。',
      devoted: '{a}は感極まって、言葉の代わりに何度も頷いた。目尻に涙がにじんでいた。', cool: '{a}は平静を装って「どうも」と返し、{b}が去ってから壁に額をつけてうずくまった。',
      free: '{a}は「えっ、えっ、本物？」と口走ってから、自分で自分の口を押さえた。', shy: '{a}は顔を真っ赤にして、その場から逃げ出した。',
      polite: '{a}「も、もったいないお言葉でございます……！」――声が裏返っていた。'
    })
  };
  function osWhy(r, k) { return r.O.name + 'にとって' + r.S.name + 'は推し' + k; }
  add({ id: 'tie_nw_os_cheer', label: '推しを陰から応援する', cat: 'bond', w: 0.6, roles: osR, run: function (ctx, r) { ctx.mod2(r.O, r.S, { aff: 2 }, { aff: 1 }); return { text: fill(pk(ctx, OS.cheer), r.O, r.S) + fill(pk(ctx, OS.cheerRe[per(r.O)]), r.O, r.S), why: osWhy(r, '：応援する') }; } });
  add({ id: 'tie_nw_os_gift', label: '推しに差し入れをする', cat: 'help', w: 0.5, roles: osR, run: function (ctx, r) { ctx.mod2(r.O, r.S, { aff: 2 }, { aff: 3, trust: 2 }); return { text: fill(pk(ctx, OS.gift), r.O, r.S) + fill(pk(ctx, OS.giftRe[per(r.S)]), r.O, r.S), why: osWhy(r, '：差し入れ') }; } });
  add({ id: 'tie_nw_os_watch', label: '推しを遠くから見守る', cat: 'bond', w: 0.5, roles: osR, run: function (ctx, r) { ctx.mod(r.O, r.S, { aff: 2 }); return { text: fill(pk(ctx, OS.watch), r.O, r.S) + fill(pk(ctx, OS.watchRe[per(r.O)]), r.O, r.S), why: osWhy(r, '：遠くから見守る') }; } });
  add({ id: 'tie_nw_os_freeze', label: '推しに話しかけられて固まる', cat: 'bond', w: 0.5, roles: osR, run: function (ctx, r) { ctx.mod2(r.O, r.S, { aff: 3, ten: 1 }, { aff: 2 }); return { text: fill(pk(ctx, OS.freeze), r.O, r.S) + fill(pk(ctx, OS.freezeRe[per(r.O)]), r.O, r.S), why: osWhy(r, '：話しかけられて固まる') }; } });

  /* ======================= 愛人（セフレの様子「愛人」。{a}＝愛人の側、{b}＝ほかに本命・夫婦がいる側） ======================= */
  var MAIN_T = /^(lover|mate|fated|honmei|spouse|fiance)$/;
  function mainOf(ctx, x, not) {
    var best = null;
    ctx.chars.forEach(function (c) { if (best || c === x || c === not) return; if (ctx.pair(x, c).couple || T().all(ctx, x, c).some(function (t) { return MAIN_T.test(t.type) && (t.type !== 'honmei' || t.a === x.i); })) best = c; });
    return best;
  }
  function miR(ctx, a, b) {
    var t = has(ctx, a, b, 'fwb'); if (!t || t.mode !== 'mistress') return null;
    var pf = ctx.pair(a, b); if (pf.miCut != null || pf.couple) return null;
    /* 恋愛対象と受け攻めが合う組だけ（体の関係を前提にした関係なので HK.Pos.okSex も通す） */
    if (!both(a, b) || (HK.Pos && !HK.Pos.okSex(a, b))) return null;
    var ma = mainOf(ctx, a, b), mb = mainOf(ctx, b, a);
    var Y = mb && !ma ? b : ma && !mb ? a : ctx.chars[t.b] === b ? b : a, X = Y === a ? b : a;
    return { X: X, Y: Y, M: mainOf(ctx, Y, X) };
  }
  var MI = {
    secret: L('{a}と{b}は、人目のある場所では目も合わせなかった。二人の関係は、誰にも知られてはならなかった。|{b}は{a}への連絡を、いつもすぐに消した。{a}はそれを知っていて、何も言わなかった。|{a}と{b}は、わざと別々の方向から同じ場所へ向かった。並んで歩くことは、一度もなかった。'),
    secretRe: P9({
      proud: '{a}「こそこそすんのは性に合わねえんだがな」――それでも、{a}は約束を守った。', stern: '{a}は感情を表に出さなかった。秘密を守ることも、この関係の決まりの一つだった。',
      tsun: '{a}「べ、別に隠されても平気だし。……慣れてるし」', gentle: '{a}は寂しさを笑顔の下にしまった。{b}を困らせたくはなかった。',
      devoted: '{a}は{b}の立場を守るためなら、自分がいないふりをすることも厭わなかった。', cool: '{a}「割り切った関係だ。表に出す必要はない」――そう言う声は、少しだけ乾いていた。',
      free: '{a}は「スパイごっこみたいで楽しいね」と笑った。半分は強がりだった。', shy: '{a}は誰かの視線を感じるたび、びくりと肩を震わせた。',
      polite: '{a}は人前では{b}を他人行儀に呼んだ。その呼び方が、いちばん{a}の胸を締めつけた。'
    }),
    found: L('{c}は、{a}と{b}が人目を避けて言葉を交わしているところを見てしまった。二人のあいだの空気は、ただの知り合いのものではなかった。|{b}の持ち物から、{a}の字で書かれた走り書きが落ちた。拾い上げた{c}の顔色が変わった。|{c}は{b}に問いただした。「{a}とは、どういう関係なの｜{a}とは、どういう関係なんだ｜{a}とは、どういう関係なんですか」{b}は答えに詰まった。'),
    foundRe: P9({
      proud: '{b}「……見られちまったか。言い訳はしねえよ」', stern: '{b}は目を閉じ、しばらくしてから言った。「事実だ。責めは私が負う」',
      tsun: '{b}「ち、違うの！　……違わない、けど」', gentle: '{b}は青ざめて、何度も「ごめん」と繰り返した。誰に謝っているのか、自分でも分からなかった。',
      devoted: '{b}は{a}をかばうように前に出た。「悪いのは私だけ。{a}は関係ない」', cool: '{b}は表情を変えずに言った。「否定はしない。……ただ、今は話せない」',
      free: '{b}は「あはは、バレちゃった？」と笑ったが、その声はひどく乾いていた。', shy: '{b}は真っ白な顔で立ち尽くし、何も言えなかった。',
      polite: '{b}「……弁解の余地もございません」'
    }),
    cut: L('{b}は{a}を呼び出し、目を見ずに切り出した。「もう、終わりにしよう｜＝｜もう、終わりにしましょう」|{a}は{b}に、これ以上待つのはやめると告げた。本命のもとへ帰っていく背中を、もう見送りたくなかった。|{b}は{a}の手に、手切れのつもりの品を握らせた。{a}はそれを、黙って突き返した。'),
    cutRe: P9({
      proud: '{a}「……勝手にしろ。最初から、こうなるって分かってたんだ」', stern: '{a}「分かった。だが、私の時間は返してもらえない」',
      tsun: '{a}「せ、せいせいするわよ！　……ほんとに、せいせいするんだから」', gentle: '{a}は涙をこらえて頷いた。「{b}が幸せなら、それでいい」',
      devoted: '{a}はすがりかけて、やめた。「……最後に、名前を呼んで」', cool: '{a}「妥当な判断だ。……私も、そろそろ潮時だと思っていた」',
      free: '{a}は「じゃ、元気でね」と手を振った。振り返らないように、早足で歩き去った。', shy: '{a}は何も言えずに、ただ何度も頷いた。',
      polite: '{a}「今までありがとうございました。どうぞ、お幸せに」'
    }),
    noshow: L('約束の夜、{b}は来なかった。{a}は冷めていく飲み物を前に、一人で夜明けを待った。|{a}は{b}が来るはずの時間を、何度も確かめた。その夜、{b}は本命のそばを離れなかった。|{a}は{b}からの「今夜は無理」という短い知らせを、何度も読み返した。'),
    noshowRe: P9({
      proud: '{a}「……来ねえなら来ねえって、最初から言えよ」', stern: '{a}は黙って灯りを消した。期待した自分を、少しだけ責めた。',
      tsun: '{a}「べ、別に待ってなんかなかったし！」――誰もいない場所で、{a}は膝を抱えた。', gentle: '{a}は「仕方ないよね」と自分に言い聞かせた。それでも、胸の穴は埋まらなかった。',
      devoted: '{a}は{b}の席を空けたまま、朝まで座っていた。', cool: '{a}「二番目とは、こういうことだ」――分かっていたはずの事実が、思ったより重かった。',
      free: '{a}は「ま、そんな日もあるか」と伸びをした。その夜は、一睡もできなかった。', shy: '{a}は誰にも気づかれないように、声を殺して泣いた。',
      polite: '{a}は「承知いたしました」とだけ返した。それ以上の言葉は、書けなかった。'
    })
  };
  function miWhy(r, k) { return r.X.name + 'は' + r.Y.name + 'の愛人' + (r.M ? '（' + r.Y.name + 'の本命は' + r.M.name + '）' : '（' + r.Y.name + 'にはほかに本命がいる）') + k; }
  add({ id: 'tie_nw_mi_secret', label: '愛人どうしの秘密の時間', cat: 'bond', w: 0.6, roles: miR, run: function (ctx, r) { ctx.mod2(r.X, r.Y, { trust: 2 }, { trust: 2 }); return { text: fill(pk(ctx, MI.secret), r.X, r.Y) + fill(pk(ctx, MI.secretRe[per(r.X)]), r.X, r.Y), why: miWhy(r, '：秘密の関係') }; } });
  add({
    id: 'tie_nw_mi_found', label: '愛人との関係が見つかる', cat: 'conflict', w: function (ctx) { return 0.5 * (HK.Dark ? HK.Dark.f(ctx, 'cheat') : 1); },
    roles: function (ctx, a, b) { var r = miR(ctx, a, b); return r && !ctx.pair(a, b).miFound && thirds(ctx, a, b).length ? r : null; },
    run: function (ctx, r) {
      var l = thirds(ctx, r.X, r.Y), c = r.M && l.indexOf(r.M) >= 0 ? r.M : ctx.rng.pick(l); if (!c) return null;
      ctx.pair(r.X, r.Y).miFound = true;
      ctx.mod(c, r.Y, { trust: -10, ten: 8 }); ctx.mod(c, r.X, { ten: 6 }); ctx.stress(r.Y, 10);
      return { with: [c], text: fill(pk(ctx, MI.found), r.X, r.Y, c) + fill(pk(ctx, MI.foundRe[per(r.Y)]), r.X, r.Y, c), why: miWhy(r, '：' + c.name + 'に知られた'), mag: 24 };
    }
  });
  add({ id: 'tie_nw_mi_cut', label: '愛人に手切れを告げる', cat: 'conflict', w: 0.4, roles: miR, run: function (ctx, r) { ctx.pair(r.X, r.Y).miCut = ctx.stepIndex; ctx.mod2(r.X, r.Y, { ten: 10, att: -6 }, { ten: 6 }); return { text: fill(pk(ctx, MI.cut), r.X, r.Y) + fill(pk(ctx, MI.cutRe[per(r.X)]), r.X, r.Y), why: miWhy(r, '：手切れ'), mag: 22 }; } });
  add({ id: 'tie_nw_mi_noshow', cat: 'conflict', w: 0.5, roles: miR, run: function (ctx, r) { ctx.mod(r.X, r.Y, { ten: 5, aff: -2 }); ctx.stress(r.X, 6); return { text: fill(pk(ctx, MI.noshow), r.X, r.Y) + fill(pk(ctx, MI.noshowRe[per(r.X)]), r.X, r.Y), why: miWhy(r, '：会いに来ない夜') }; } });

  /* ======================= 仲間（{a}＝動く側、{b}＝相手） ======================= */
  function coR(ctx, a, b) { return T() && T().comrade && T().comrade(ctx, a, b) && !T().apathy(ctx, a, b) && !T().fears(ctx, a, b) ? { a: a, b: b } : null; }
  var CO = {
    help: L('{a}は{b}の荷物が重そうなのを見て、何も言わずに半分を持った。仲間なら、それが当たり前だった。|{a}と{b}は、どちらからともなく役目を分け合った。言葉にしなくても、段取りは揃っていた。|{b}が手間取っているのを見て、{a}は自分の手を止めて駆け寄った。「こっちは任せて｜こっちは任せろ｜こちらは任せてください」'),
    helpRe: P9({
      proud: '{b}「……助かった。借りにしとく」', stern: '{b}は短く頷いた。「感謝する」――それで十分だった。',
      tsun: '{b}「べ、別に頼んでないけど！　……ありがと」', gentle: '{b}は柔らかく笑った。「ありがとう。{a}がいてくれてよかった」',
      devoted: '{b}「次は、私が{a}を助ける番だね」', cool: '{b}「効率がいい。この分担で行こう」',
      free: '{b}は「さっすが！」と{a}の背中を叩いた。', shy: '{b}は小さく「……ありがとう」と言って、照れたように笑った。',
      polite: '{b}「恐れ入ります。おかげで助かりました」'
    }),
    cover: L('{b}が責められかけたとき、{a}が一歩前に出た。「それは仲間みんなで決めたことだ｜それは仲間全員で決めたことだ｜それは仲間みんなで決めたことです」|{a}は{b}の失敗を、自分のことのように引き受けた。仲間の背中は、仲間が守るものだった。|{b}に向かって飛んできたものを、{a}がとっさに払いのけた。'),
    coverRe: P9({
      proud: '{b}「余計なことすんな。……でも、恩に着る」', stern: '{b}は{a}の横に並んだ。「一人で背負うな。私も責を負う」',
      tsun: '{b}「か、かばってなんて頼んでないんだから！」――その声は、少し震えていた。', gentle: '{b}は{a}の袖をそっと握った。「ありがとう。……次は、私が守るね」',
      devoted: '{b}は胸がいっぱいになって、しばらく言葉が出なかった。', cool: '{b}「無茶をする。……だが、正しい判断だった」',
      free: '{b}は「かっこいいとこ持ってくなあ」と笑って、{a}の肩に腕を回した。', shy: '{b}は目に涙をためて、何度も頭を下げた。',
      polite: '{b}「身に余るお気遣い、痛み入ります」'
    }),
    mourn: L('{a}と{b}は、{c}がよく座っていた場所に、二人で小さな目印を置いた。仲間の数は、一人減ってしまった。|{a}は{c}の名前を口にしかけて、黙った。{b}が、その肩にそっと手を置いた。|{a}と{b}は、{c}の分まで生き延びようと約束した。仲間だった者への、それが二人なりの弔いだった。'),
    mournRe: P9({
      proud: '{b}「……あいつの分も、きっちり返してやる」', stern: '{b}は目を閉じて、しばらく黙祷した。',
      tsun: '{b}「泣いてなんか、ないんだから……」――声が、途中で詰まった。', gentle: '{b}は{a}の隣で、静かに涙を流した。',
      devoted: '{b}「{c}のこと、絶対に忘れない」', cool: '{b}「感傷に浸る時間は短くていい。……でも、今だけは」',
      free: '{b}は{c}の好きだった歌を、小さく口ずさんだ。', shy: '{b}は何も言えず、{a}の手をぎゅっと握った。',
      polite: '{b}「どうか、安らかに」――深く下げた頭は、長いあいだ上がらなかった。'
    }),
    together: L('{a}と{b}は、示し合わせたように同じ方向へ歩き出した。仲間と動くとき、迷いはなかった。|{a}が合図を送ると、{b}はすぐに意図を読み取って動いた。|{a}と{b}は、見張りと休憩を交代で回した。どちらも、相手の番を疑わなかった。'),
    togetherRe: P9({
      proud: '{b}「行くぞ。遅れんなよ」', stern: '{b}「段取りどおりだ。問題ない」',
      tsun: '{b}「し、仕方ないから一緒に行ってあげる」', gentle: '{b}「{a}と一緒だと、心強いな」',
      devoted: '{b}「どこへでもついていくよ」', cool: '{b}「二人のほうが生き残る見込みは上がる。合理的だ」',
      free: '{b}「よーし、仲間と一緒なら怖いものなし！」', shy: '{b}は小さく頷いて、{a}のすぐ後ろについた。',
      polite: '{b}「お供いたします」'
    })
  };
  function coWhy(a, b, k) { return a.name + 'と' + b.name + 'は同じグループの仲間' + k; }
  add({ id: 'tie_nw_co_help', label: '仲間どうしで助け合う', cat: 'help', w: 0.6, roles: coR, run: function (ctx, r) { ctx.mod2(r.a, r.b, { trust: 4, aff: 2 }, { trust: 5, aff: 3 }); return { text: fill(pk(ctx, CO.help), r.a, r.b) + fill(pk(ctx, CO.helpRe[per(r.b)]), r.a, r.b), why: coWhy(r.a, r.b, '：助け合い') }; } });
  add({ id: 'tie_nw_co_cover', label: '仲間をかばう', cat: 'help', w: 0.5, roles: coR, run: function (ctx, r) { ctx.mod2(r.a, r.b, { trust: 3 }, { trust: 7, aff: 4 }); return { text: fill(pk(ctx, CO.cover), r.a, r.b) + fill(pk(ctx, CO.coverRe[per(r.b)]), r.a, r.b), why: coWhy(r.a, r.b, '：庇う') }; } });
  /* 弔う：同じ仲間（二人とも仲間の関係）を亡くした二人。亡くなった人は記録の登場人物にはしない（名前だけ）。一人につき一度 */
  function deadMate(ctx, a, b) {
    var pf = ctx.pair(a, b), done = pf.coMourn || {};
    return ctx.chars.filter(function (d) { return d !== a && d !== b && d.alive === false && !done[d.i] && T().comrade(ctx, a, d) && T().comrade(ctx, b, d); })[0] || null;
  }
  add({
    id: 'tie_nw_co_mourn', label: '亡くなった仲間を弔う', cat: 'bond', w: 1.6,
    roles: function (ctx, a, b) { var r = coR(ctx, a, b); return r && deadMate(ctx, a, b) ? r : null; },
    run: function (ctx, r) {
      var d = deadMate(ctx, r.a, r.b); if (!d) return null;
      var pf = ctx.pair(r.a, r.b); pf.coMourn = pf.coMourn || {}; pf.coMourn[d.i] = 1;
      ctx.mod2(r.a, r.b, { trust: 5, aff: 4 }, { trust: 5, aff: 4 });
      return { text: fill(pk(ctx, CO.mourn), r.a, r.b, d) + fill(pk(ctx, CO.mournRe[per(r.b)]), r.a, r.b, d), why: coWhy(r.a, r.b, '：' + d.name + 'を弔う') };
    }
  });
  add({ id: 'tie_nw_co_together', label: '仲間と一緒に動く', cat: 'bond', w: 0.5, roles: coR, run: function (ctx, r) { ctx.mod2(r.a, r.b, { trust: 3, aff: 2 }, { trust: 3, aff: 2 }); return { text: fill(pk(ctx, CO.together), r.a, r.b) + fill(pk(ctx, CO.togetherRe[per(r.b)]), r.a, r.b), why: coWhy(r.a, r.b, '：一緒に動く') }; } });

  /* ======================= 想いの差で過激に：本命の嫉妬の暴走・盲信の排除 ======================= */
  /* {a}＝本命を想う人、{b}＝本命、{c}＝本命と親しい人 */
  function rivalsOf(ctx, a, b) { return thirds(ctx, a, b, function (c) { var r = ctx.R(b, c); return ctx.pair(b, c).couple || r.att >= 45 || r.aff >= 45; }); }
  var HM = {
    lead: L('{a}は{b}と{c}が親しげに笑い合うのを見て、持っていたものを握りつぶした。|{a}は{c}を呼び止め、静かに言った。「{b}に近づかないで。お願いじゃない｜{b}に近づくな。頼んでいるのではない｜{b}に近づかないでください。お願いではありません」|{a}は{b}の前で{c}の悪口をまくし立て、{b}が眉をひそめても止まらなかった。'),
    re: P9({
      proud: '{a}「{b}の隣は、私の場所だ。誰にも渡さねえ」', stern: '{a}の声は低く、冷え切っていた。「二度は言わない」',
      tsun: '{a}「な、なんで{c}なのよ……！　私のほうが、ずっと前から……！」', gentle: '{a}はいつもの笑顔のまま言った。その笑顔が、かえって怖かった。',
      devoted: '{a}「{b}のためなら、私、何だってできるんだよ」', cool: '{a}は{c}の弱みを、淡々と並べ立てた。どれも、{b}の前で言うべきことではなかった。',
      free: '{a}は笑っていたが、目だけが笑っていなかった。', shy: '{a}は震える声で、それでもはっきり言った。「……{b}を、取らないで」',
      polite: '{a}「恐れ入りますが、{b}にはお近づきにならないでいただけますか」'
    })
  };
  add({
    id: 'tie_nw_honmei', label: '本命への嫉妬が暴走する', cat: 'conflict', w: function (ctx, r) { var g = HK.Gap ? HK.Gap.of(ctx, r.A, r.B) : 0; return g < 0.3 ? 0 : 0.35 * gapK(ctx, r.A, r.B) * (HK.Dark ? HK.Dark.f(ctx, 'harm') : 1); },
    roles: function (ctx, a, b) { var t = from(ctx, a, b, 'honmei'); if (!t || ctx.pair(a, b).couple || (HK.Obsess && HK.Obsess.blocked && HK.Obsess.blocked(ctx, a, b))) return null; return rivalsOf(ctx, a, b).length ? { A: a, B: b } : null; },
    run: function (ctx, r) {
      var l = rivalsOf(ctx, r.A, r.B), c = l.length ? ctx.rng.pick(l) : null; if (!c) return null;
      ctx.mod(r.A, c, { ten: 10, aff: -6 }); ctx.mod(c, r.A, { ten: 10 }); ctx.mod(r.B, r.A, { ten: 4 }); ctx.stress(r.A, 6);
      return { with: [c], text: fill(pk(ctx, HM.lead), r.A, r.B, c) + fill(pk(ctx, HM.re[per(r.A)]), r.A, r.B, c), why: r.A.name + 'の本命は' + r.B.name + '：嫉妬が暴走した' + gapWhy(ctx, r.A, r.B), mag: 22 };
    }
  });
  /* {a}＝盲信する側、{b}＝盲信される側、{c}＝{b}に近づく人 */
  var BL = {
    lead: L('{a}は{b}に近づく{c}を、{b}の見ていないところで呼び止めた。「{b}の邪魔をしないで。{b}には、私がいれば十分だから｜{b}の邪魔をするな。{b}には、私がいれば十分だ｜{b}の邪魔をしないでください。{b}には、私がいれば十分ですから」|{a}は{c}が{b}に渡そうとしたものを、途中で取り上げて捨てた。|{a}は{b}の予定を一つずつ書き換え、{c}と顔を合わせる機会をすべて消していった。'),
    re: P9({
      proud: '{c}「……は？　何様のつもりだよ」', stern: '{c}は{a}を見据えた。「{b}が決めることだ。お前ではない」',
      tsun: '{c}「な、なによそれ……！　{b}はあんたのものじゃないでしょ！」', gentle: '{c}は困ったように眉を下げ、それ以上{b}に近づくのをやめた。',
      devoted: '{c}は唇を噛んだ。それでも、{b}を心配する気持ちは消えなかった。', cool: '{c}は肩をすくめて引き下がったが、{a}の行動を一つ残らず覚えておいた。',
      free: '{c}は「こわっ」と笑ったが、本気でぞっとしていた。', shy: '{c}は怯えたように後ずさり、何も言えなかった。',
      polite: '{c}「……承知しました。ですが、{b}にはお伝えします」'
    })
  };
  function nearB(ctx, a, b) { return thirds(ctx, a, b, function (c) { return ctx.R(b, c).aff >= 25; }); }
  add({
    id: 'tie_nw_blind', label: '盲信する相手から人を遠ざける', cat: 'conflict', w: function (ctx, r) { var g = HK.Gap ? HK.Gap.of(ctx, r.A, r.B) : 0; return g < 0.3 ? 0 : 0.3 * gapK(ctx, r.A, r.B); },
    roles: function (ctx, a, b) { var t = from(ctx, a, b, 'blind'); return t && nearB(ctx, a, b).length ? { A: a, B: b } : null; },
    run: function (ctx, r) {
      var l = nearB(ctx, r.A, r.B), c = l.length ? ctx.rng.pick(l) : null; if (!c) return null;
      ctx.mod(c, r.A, { ten: 12, aff: -8 }); ctx.mod(c, r.B, { aff: -3 }); ctx.mod(r.A, r.B, { trust: 2 });
      return { with: [c], text: fill(pk(ctx, BL.lead), r.A, r.B, c) + fill(pk(ctx, BL.re[per(c)]), r.A, r.B, c), why: r.A.name + 'は' + r.B.name + 'を盲信している：近づく' + c.name + 'を排除した' + gapWhy(ctx, r.A, r.B), mag: 20 };
    }
  });
  TN.TEXT = { AP: AP, FR: FR, FI: FI, DEP: DEP, HL: HL, GU: GU, OS: OS, MI: MI, CO: CO, HM: HM, BL: BL };
})();
