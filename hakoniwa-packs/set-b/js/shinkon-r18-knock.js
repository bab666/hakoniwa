/* r18:begin */
/* @event scen=set-b-shinkon id=sk_knock_door cat=romance tie=- tags=night label=最中に玄関のチャイムが鳴る夜 */
/* @event scen=set-b-shinkon id=sk_knock_phone cat=romance tie=- tags=night label=最中に電話が鳴る夜 */
/* @event scen=set-b-shinkon id=sk_knock_ignore cat=romance tie=- tags=night label=邪魔が入っても無視して続ける */
/* @event scen=set-b-shinkon id=sk_knock_answer cat=romance tie=- tags=night label=中断して応対し戻って続きをする */
/* @event scen=set-b-shinkon id=sk_knock_hush cat=romance tie=- tags=night label=来客や電話のあいだ声を殺して続ける */
/* @event scen=set-b-shinkon id=sk_knock_tease cat=romance tie=- tags=night label=受けに電話に出させていたずらする */
/* @event scen=set-b-shinkon id=sk_knock_stop cat=romance tie=- tags=night label=邪魔が入ってその夜はお預けになる */
/* @event scen=set-b-shinkon id=sk_knock_ex cat=romance tie=- tags=night label=最中の元恋人の連絡にヤキモチを焼く */
/* 新婚部屋：エッチの最中に誰かが訪ねてくる・電話が鳴る（R18版だけ。2026-11-03 利用者の指示）。文は shinkon-r18-knock-text.js（HK.ShinkonKnockText）
   ■ HK.ShinkonKnock（KN）
     ・KN.roll(ctx, S, day, a, b)：この夜に邪魔が入るか（一回の遊びで 1 回、10 日以上なら 2 回まで）。入るなら { via: door|phone, x, y, g, cls, who, type }
       来る人・かけてくる人：他の住人（参加者の三人目から・名簿の登場しない住人。二人のどちらかと関係があり、出番の外でも来られる人＝HK.ShinkonVisit.here）、
       宅配便の配達員・隣の部屋の住人（玄関）、職場の人・知らない番号（電話）。{x}＝来客・電話の相手と関係のある人（応対する人）
       応対（type）：二人の態度（夜の性格で態度を選んでいればそれ。HK.ShinkonR18.att）・攻めの夜の性格・性欲・相手との関係で重みを変える
         ignore 無視して続ける／answer 中断して出る（戻って続き）／hush 声を殺して続ける／tease 受けに電話に出させていたずら（電話が受けにかかったときだけ。家族・元恋人の電話ではしない）／
         stop 中断して出て、その夜はそこまで（家族・友人が上がりこむ・急ぎの用件）
     ・KN.run(ctx, S, day, a, b, sh, v)：前半の段（エッチの場面。直前の段はきっかけ）→ 邪魔と応対（来た人の名前は地の文だけ。性的な文の記録には名前を出さない）→
       stop ならその夜の終わり（'stop' を返す）／ほかは再開の理由の段（きっかけの段。元恋人ならヤキモチ）を出して true を返す（呼ぶ側が本番の場面を続ける）。
       前半の段が出せなければ null（ふつうの夜に戻す）
     ・邪魔の段は必ず出す（2026-11-03 利用者の報告「来客がある描写がなく、理由にだけ書かれているのが分かりづらい」）。以前は来た人（名簿の住人 g）を actors に入れていたので、
       恋愛の出来事の門（romanceOk：家族・恋愛にならない相手との組）で act2 が弾かれ、前半の段のあとに邪魔の段が無いまま再開していた（名簿の住人が来た回の約 4 割）。
       来た人は actors に入れず（名前は地の文だけ）、二人だけの段にする。弾かれても ctx.say で出す。前半の段の理由には、まだ起きていない来客を書かない
       来られる人：玄関は今その場に来られる人（HK.ShinkonVisit.here）、電話は生きていて連れ去られ・閉じ込められていない人（出番の外の留守でも、よそにいてもかけられる）
   登場人物はすべて成人として扱う。合意の上。家の外の人には見られない・気づかれない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var KN = HK.ShinkonKnock = {};
  function TX() { return HK.ShinkonKnockText; }
  /* 住まい・時間帯などに合わない文は外す（HK.Shinkon.okText。2026-11-04 報告：平屋で「隣の部屋の住人」） */
  function pickOf(ctx, arr) { var L0 = (arr || []).filter(function (x) { return !HK.Shinkon || HK.Shinkon.okText(ctx, x); }); if (!L0.length) L0 = arr || []; return L0.length ? L0[Math.floor(ctx.rng() * L0.length)] : ''; }
  function att(c, o) { return HK.ShinkonR18 && HK.ShinkonR18.att ? HK.ShinkonR18.att(c, o) : 'gentle'; }
  var DOOR_CLS = { fam: 1, pfam: 1, known: 1, ex: 1, weak: 1 };
  var TYPE_NAME = { ignore: '無視して続けた', answer: '中断して出た', hush: '声を殺して続けた', tease: '電話に出させていたずら', stop: 'その夜はお預け' };
  KN.TYPE_NAME = TYPE_NAME;
  function canCall(g) { return !!g && g.alive !== false && !g.taken && !(g.flags && (g.flags.caged != null || g.flags.knocked)); }
  function choose(ctx, v, a, b) {
    var px = att(v.x, v.y), pa = att(a, b), pb = att(b, a), A0 = HK.Attr, P = HK.Pos;
    var kdA = A0 && A0.nightKind ? A0.nightKind(a, b) : '', hiL = P && P.libOf && (P.libOf(a) === 'high' || P.libOf(b) === 'high');
    var W = {
      ignore: 1 + (/^(free|proud)$/.test(px) ? 1 : 0) + (hiL ? 0.5 : 0),
      answer: 1 + (/^(stern|polite|devoted|cool)$/.test(px) ? 1 : 0),
      hush: 0.7 + (/^(shy|tsun|gentle)$/.test(pb) ? 0.9 : 0),
      tease: v.via === 'phone' && v.x === b && !/^(fam|pfam|ex)$/.test(v.cls) ? Math.max(0.5, 2.2 + (kdA === 'mean' || kdA === 'sadist' || /^(free|proud)$/.test(pa) ? 1 : 0) - (/^(shy|stern)$/.test(pb) ? 0.3 : 0)) : 0,
      stop: 0.25
    };
    if (v.via === 'door' && /^(fam|pfam|known)$/.test(v.cls)) { W.answer *= 1.6; W.stop *= 3; W.ignore *= 0.5; }
    if (v.cls === 'ex') { W.answer *= 1.3; W.stop *= 1.5; }
    if (v.cls === 'parcel') { W.stop *= 0.2; W.ignore *= 1.3; }
    if (v.cls === 'neighbor') W.hush *= 1.4;
    if (v.cls === 'work' && v.via === 'phone') W.answer *= 1.5;
    if (v.cls === 'unknown') W.ignore *= 2;
    var ks = Object.keys(W).filter(function (k) { return W[k] > 0; });
    return HK.weighted(ctx.rng, ks, function (k) { return W[k]; });
  }
  KN.roll = function (ctx, S, day, a, b) {
    var T = TX(), VI = HK.ShinkonVisit;
    if (!T || (S.knockN || 0) >= (S.days >= 10 ? 2 : 1)) return null;
    var cands = [];
    (S.G || []).forEach(function (g) {
      if (!VI) return;
      var door = VI.here(g), call = door || canCall(g);
      if (!call) return;
      [a, b].forEach(function (x) {
        var c = VI.cls(ctx, x, g); if (!c) return;
        var y = x === a ? b : a, gl = VI.word(ctx, x, g), who = gl + 'の' + g.name;
        if (door && DOOR_CLS[c]) cands.push({ via: 'door', x: x, y: y, g: g, cls: c, who: who, w: 0.8 });
        cands.push({ via: 'phone', x: x, y: y, g: g, cls: c, who: who, w: 1 });
      });
    });
    var p = 0.15 + (cands.length ? 0.06 : 0);
    if (ctx.rng() > p) return null;
    var r1 = ctx.rng() < 0.5 ? a : b, r2 = ctx.rng() < 0.5 ? a : b;
    cands.push({ via: 'door', x: r1, y: r1 === a ? b : a, cls: 'parcel', who: '宅配便の配達員', w: 0.9 });
    cands.push({ via: 'door', x: r2, y: r2 === a ? b : a, cls: 'neighbor', who: ctx.sk && ctx.sk.homeK === 'house' ? '隣の家の人' : '隣の部屋の住人', w: 0.5 });
    cands.push({ via: 'phone', x: r2, y: r2 === a ? b : a, cls: 'work', who: '職場の人', w: 0.7 });
    cands.push({ via: 'phone', x: r1, y: r1 === a ? b : a, cls: 'unknown', who: '知らない番号', w: 0.3 });
    var v = HK.weighted(ctx.rng, cands, function (x) { return x.w; });
    v.type = choose(ctx, v, a, b);
    return v;
  };
  KN.run = function (ctx, S, day, a, b, sh, v) {
    var T = TX(), K = HK.ShinkonKit, cat = S.love ? 'romance' : 'bond';
    var ex = { x: v.x.name, y: v.y.name, who: v.who };
    var fx = function (t) { return K.fill(ctx, t, a, b, ex); };
    var via = v.via === 'door' ? '来客' : '電話';
    /* 1. 前半（エッチの場面。直前はきっかけの段） */
    var e1 = ctx.act2({ actors: [a, b], cat: cat, text: fx(pickOf(ctx, T.OPEN[sh] || T.OPEN.mf)), why: '新婚部屋：夜（前半）', sex: true, lewd: true,
      fx: function () { ctx.mod2(a, b, { att: 3 }, { att: 3 }); } });
    if (!e1) return null;
    /* 2. 邪魔が入る（鳴る・叩く。誰が来たか・誰からか）・応対。来た人は actors に入れない（名前は地の文だけ。弾かれても必ず出す）。
       一言は、無視・中断して出るなら応対の前（決めてから動く）、お預けなら応対のあと（長引いてから諦める） */
    var t = v.type, dec = t === 'hush' ? b : t === 'tease' ? a : v.x, decO = dec === a ? b : a;
    var say = T.SAY[t] ? (T.SAY[t][att(dec, decO)] || T.SAY[t].gentle) : null, sy = say ? pickOf(ctx, say) : '';
    var rs = t === 'ignore' || t === 'answer' || t === 'stop' ? pickOf(ctx, T.RESP[t][v.via]) : '';
    var t2 = fx(pickOf(ctx, T.BELL[v.via]) + (t === 'stop' ? rs + sy : sy + rs));
    var why2 = '新婚部屋：最中に' + via + '（' + v.who + '）・' + TYPE_NAME[t];
    if (!ctx.act2({ actors: [v.x, v.y], cat: cat, text: t2, why: why2 })) ctx.say({ kind: 'event', cat: cat, actors: [v.x, v.y], text: t2, why: why2, mag: 0 });
    /* 3. 声を殺して続ける・電話でいたずら（性的な文の記録。来た人の名前は出さない） */
    if (t === 'hush' || t === 'tease') {
      var rl = t === 'hush' ? T.RESP.hush[v.via][sh] || T.RESP.hush[v.via].mf : T.RESP.tease[sh] || T.RESP.tease.mf;
      var st = T.STIFLE[att(b, a)] || T.STIFLE.gentle;
      var t3 = fx(pickOf(ctx, rl) + pickOf(ctx, st)), why3 = '新婚部屋：最中に' + via + '（' + TYPE_NAME[t] + '）';
      if (!ctx.act2({ actors: [a, b], cat: cat, text: t3, why: why3, lewd: true })) ctx.say({ kind: 'event', cat: cat, actors: [a, b], text: t3, why: why3, mag: 0, lewd: true });
    }
    /* 4. その夜はそこまで */
    if (t === 'stop') {
      var t4 = fx(pickOf(ctx, T.STOP_END[v.via])), why4 = '新婚部屋：最中に' + via + '（その夜はお預け）';
      if (!ctx.act2({ actors: [v.x, v.y], cat: 'bond', text: t4, why: why4 })) ctx.say({ kind: 'event', cat: 'bond', actors: [v.x, v.y], text: t4, why: why4, mag: 0 });
      return 'stop';
    }
    /* 5. 再開の理由（きっかけの段）。元恋人なら、もう一人のヤキモチから */
    var exJ = v.cls === 'ex' && S.love;
    /* 元恋人のヤキモチの文：1 本目はどの応対でも、2 本目（連絡を手短に済ませた）は電話に出たときだけ、3 本目（戻ってくると）は中断して出たときだけ */
    var rt = exJ ? T.RESUME.ex.filter(function (x, i) { return i === 0 || (t === 'answer' && (i === 2 || v.via === 'phone')); }) : T.RESUME[t];
    var le = ctx.say({ kind: 'event', cat: cat, actors: t === 'answer' || exJ ? [v.y, v.x] : [b, a], text: fx(pickOf(ctx, rt)), why: 'きっかけ：再開の理由（' + TYPE_NAME[t] + (exJ ? '・' + v.y.name + 'のヤキモチ' : '') + '）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    return true;
  };
})();
/* r18:end */
