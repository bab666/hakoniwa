/* 箱庭シミュレーター（R18版のみ）― 内容のスイッチ（content.js）の場面を、ふつうの箱庭でも起こす仕組み（文は content-text-r18.js）
   どれも「展開の重さ：重い」（mood-dial.js）で、そのスイッチが入のときだけ働く（穏やか・ふつうでは今までどおり。乱数も引かない）。
   クラスメイト（教室）には足さない。恋愛対象（HK.canLove 両方向）・受け攻め（HK.Pos.okSex・order）・恋愛やR18にしない組・R18に参加しない・
   性行為の相手の固定（HK.State.pairSex・HK.sexBlocked）・恋愛の起こりやすさ0（ctx.romanceOk）を守る。
   ・妊娠・孕む描写（preg）
       エンジン型の箱庭（合コン・無人島・出られない部屋・オメガバース・ゾンビの街）：住人二人の体の関係の出来事のあと、
       攻めに男性器があり受けが女性器だけ（HK.Pos.gen＝'f'。ふたなり・男性の受けは除く）なら、ときどき「孕んだかもしれない」の段を足す。
       オメガバースのα（男性器のある人）×Ωは、Ωの性別・性器によらず孕む（男性の体のΩも。性器「なし」の人は除く。発情期・番で起きやすい。
       男性の体のΩの文は PREG_OMM・NEWS_OMM。2026-10-27 利用者の指示：同性でもオメガバースでは妊娠可）。
       のちの区切りで「妊娠が分かる」（ct_preg_news。二人の間柄で文が変わる）、結末の「その後」に妊娠・出産の一行。
       催眠（物語型）：性的な暗示を受けた女性器だけの人で、かける側に男性器があれば、結末に妊娠に気づく段。
   ・暴力をともなう性描写（violence）：敵対する二人の強引なエッチ（hate-sex-r18.js の HK.HateSex.scene。出られない部屋・オメガバース・ゾンビの街・合コン）に、
       攻めの暴力（頬を張る・押さえつける・首に手をかける。体の組 m／ff／fm）と受けの反応（態度9種。怯え・反発）の段を差し込む（HS.extra）。
       歪んだ関係の「拒めない夜」にも暴力の段を足す。
   ・DVなど歪んだ関係（abuse）：関係「歪んだ関係」（tie-abuse.js）が無くても、恋人・夫婦・許嫁・番・執着の組で、支配的な気質
       （CP・ドライさ・攻撃性が高い。執着は執着する側）の人が、束縛→暴言→暴力→謝罪→（相手の反応）を繰り返す（ct_dv）。
       相手の反応（耐える・反発・逃げ出したい）は相手の気質から。周りの人が気づく・間に入る、離れる決心（恋人ではなくなる）。
       合意のない展開も入なら、暴力の段の代わりに「拒めない夜」（受け攻めの指定どおり、支配する側が攻めのときだけ）。結末に行く末（歪んだままの関係・別れた・周りが引き離した）。
       催眠：かける側が恋人・ストーカーなら、結末に「暗示で縛り続ける」段。
   ・合意のない展開（force）：合コンで、敵対する二人の帰り道の強引なエッチ（ct_goukon_hate。hate-sex-r18.js の場面）。
       催眠で同意のない催眠になったとき、理由に〔合意のない展開〕と書く（重さに関係なく）。
   記録の理由（why）には〔妊娠〕〔暴力をともなう性描写〕〔DVなど歪んだ関係〕〔合意のない展開〕の印を書く（遊ぶ人が見分けられるように。点検の道具も数える）。
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=goukon,island,whiteroom,zombie,omega id=ct_preg_hook cat=夜 tags=preg cond=HK.Content.ok(ctx, 'preg') HK.Dark.on(ctx) === 'dark' label=夜のあとに孕む描写（重いのとき・男性器×女性器、α×Ω） */
/* @event scen=saimin id=ct_saimin_preg cat=夜 tags=preg cond=HK.Content.ok(S, 'preg') HK.Dark.on(S) === 'dark' label=催眠の結末：孕む描写（重いのとき） */
/* @event scen=saimin id=ct_saimin_abuse cat=conflict tie=lover,yan tags=abuse cond=HK.Content.ok(S, 'abuse') HK.Dark.on(S) === 'dark' label=暗示で縛り続ける（恋人・ストーカー。重いのとき） */
/* @event scen=whiteroom,omega,zombie,goukon id=ct_violence_hook cat=夜 tie=enemy,rival,bad tags=night,violence,force cond=HK.Content.ok(ctx, 'violence') HK.Dark.on(ctx) === 'dark' label=敵対する二人の強引な夜に、暴力の段が入る（重いのとき） */
/* @event scen=goukon,island,whiteroom,zombie,omega id=ct_abuse_violence cat=夜 tie=abuse tags=night,violence cond=HK.Content.ok(ctx, 'violence') label=歪んだ関係の拒めない夜に、暴力の段が入る */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON || !HK.Ctx || !HK.CtText || !HK.simulate) return;
  var T = HK.CtText;
  /* いま回している箱庭の ctx（結末に「その後」を足すため）。体の関係・歪んだ関係を記録したときに覚える */
  var CUR = null;
  var NO_SCEN = { classroom: 1 };
  function scenOf(x) { return x && x.scen && x.scen.id; }
  /* そのスイッチが入で、展開の重さが「重い」か */
  function on(x, tag) {
    if (HK.SAFE_ON || !HK.Content || !HK.Dark || !x || !x.env) return false;
    if (HK.Dark.on(x.env) !== 'dark') return false;
    return HK.Content.on(x.env, tag, scenOf(x));
  }
  function pk(x, arr) { return arr[Math.floor(x.rng() * arr.length)]; }
  var pk0 = pk;
  function tiesOf(ctx, a, b) { return HK.Ties && HK.Ties.all && ctx.tiesAll ? HK.Ties.all(ctx, a, b) : []; }
  function book(ctx) { CUR = ctx; return (ctx._ct = ctx._ct || { preg: [], dv: [] }); }
  /* 体の組：m＝攻めが男性の体／ff＝女性どうし／fm＝女性の攻めが男性に（hate-sex-r18.js と同じ） */
  function kindOf(t, b) { var P = HK.Pos; return P && P.isF(t, b) ? (P.isF(b, t) ? 'ff' : 'fm') : 'm'; }
  function join(t, add) { return t + (/\n/.test(t) ? '\n\n' : '') + add; }

  /* ================= 妊娠・孕む描写 ================= */
  /* 男性の体のΩ：女性の体を前提にした文（月のもの・危ない日・母になる）を外す（全部外れたら元のまま） */
  function forBody(list) { var o = list.filter(function (t) { return !/月のもの|危ない日|母に/.test(t); }); return o.length ? o : list; }
  /* 二人の間柄（文の選び分け）：執着（どちらが執着する側か）・強引（敵対・強引な場面）・恋人・その場かぎり */
  function relKind(ctx, Tp, B, why) {
    var ts = tiesOf(ctx, Tp, B), pf = ctx.pair(Tp, B);
    var y = ts.filter(function (t) { return t.type === 'yan' || t.type === 'abuse'; })[0];
    if (y) return y.a === Tp.i ? 'yanT' : 'yanB';
    if (pf.ctDv) return pf.ctDv.d === Tp.i ? 'yanT' : 'yanB';
    if (/強引|拒めない|襲|無理やり|〔合意のない展開〕/.test(why || '') || ts.some(function (t) { return /^(enemy|rival|bad)$/.test(t.type); })) return 'forced';
    if (pf.couple || ts.some(function (t) { return /^(lover|spouse|fiance|mate|fated)$/.test(t.type); })) return 'couple';
    return 'casual';
  }
  function pregHook(ctx, o, e) {
    if (NO_SCEN[scenOf(ctx)] || !HK.sexEv || !HK.sexEv(ctx, o).sex) return;
    var P = HK.Pos, acts = (o.actors || []).filter(function (c) { return c && c.i != null && ctx.chars[c.i] === c; });
    if (!P || acts.length !== 2) return;
    var ord = P.order(acts[0], acts[1], [acts[0], acts[1]]), Tp = ord[0], B = ord[1];
    if (B._ctPreg || !P.okSex(Tp, B) || !P.hasM(Tp) || (ctx._ct && ctx._ct.preg.length >= 2)) return;
    var om = scenOf(ctx) === 'omega' && Tp.om && B.om, ao = om && Tp.om.sex === 'a' && B.om.sex === 'o';
    /* α×Ω は Ωの性器によらず（なしは除く）、ほかは女性器だけの受け */
    var g = P.gen(B);
    if (ao ? g === 'none' : g !== 'f') return;
    var mb = !!ao && !P.isFBody(B);   /* 男性の体のΩ */
    var heat = ao && (B.om.heat > 0 || Tp.om.rut > 0);
    var bond = ao && HK.OMEGA && HK.OMEGA.B && HK.OMEGA.B.mateOf && HK.OMEGA.B.mateOf(ctx, B) === Tp;
    /* オメガバースは数か月〜二年で夜が多いので、一回ごとの確率を低く（発情期・番で上がる） */
    var p = om ? 0.03 + (heat ? 0.04 : 0) + (bond ? 0.06 : 0) : 0.22 + (scenOf(ctx) === 'goukon' ? 0.06 : 0);
    if (ctx.rng() >= p) return;
    var lw = HK.Lewd, low = lw && lw.lv(ctx.env) === 'low';
    var list = mb ? T.PREG_OMM[bond ? 'bond' : heat ? 'heat' : 'hint'] : bond ? T.PREG_BOND : heat ? T.PREG_HEAT : !low && lw && lw.ero(ctx.env) ? T.PREG_HINT_ERO : T.PREG_HINT;
    var kind = relKind(ctx, Tp, B, e.why);
    B._ctPreg = { by: Tp.i, at: ctx.stepIndex, kind: kind, mb: mb, omega: !!om, known: false };
    book(ctx).preg.push(B.i);
    /* 行為の記録のすぐあとに、一つの記録として足す（行為の文の最後に、部屋を出る文などが続くことがあるため） */
    ctx.say({ kind: 'event', cat: 'solo', actors: [B, Tp], sex: true, mag: 14, text: ctx.t(pk(ctx, list), Tp, B),
      why: '〔妊娠〕' + B.name + 'は' + Tp.name + 'の子を孕んだかもしれない' + (heat ? '（発情期のα×Ω）' : bond ? '（番）' : '') + (mb ? '（男性の体のΩ）' : '') + '／内容のスイッチ「妊娠・孕む描写」・展開：重い' });
  }
  /* 体の関係の出来事を記録したあとに見る（エンジン型の箱庭）。暴力の段を差し込んだ場面が、厚い版の差し替え（omega-thick.js など）で落ちていたら、最初の段落のあとに戻す */
  var say0 = HK.Ctx.prototype.say;
  HK.Ctx.prototype.say = function (o) {
    var e = say0.apply(this, arguments), vp = this._ctViolPend;
    if (vp && e && typeof e.text === 'string' && typeof e.why === 'string' && e.why.indexOf('〔暴力をともなう性描写〕') >= 0) {
      this._ctViolPend = null;
      if (e.text.indexOf(vp) < 0) { var cut = e.text.indexOf('\n\n'); e.text = cut > 0 ? e.text.slice(0, cut) + '\n\n' + vp + e.text.slice(cut) : e.text + vp; }
    }
    if (e && !e.skipped && o && o.kind === 'event' && typeof e.text === 'string' && on(this, 'preg')) pregHook(this, o, e);
    return e;
  };
  /* 妊娠が分かる（身ごもった人が動いたとき。相手と二人の出来事） */
  HK.addTo(HK.COMMON, {
    id: 'ct_preg_news', label: '妊娠が分かる', cat: 'solo', scope: 'solo', pri: true, noOdd: true, r18: true,
    when: function (ctx, a) {
      var p = a._ctPreg;
      if (!p || p.known || ctx.stepIndex - p.at < 1 || !on(ctx, 'preg')) return false;
      var F = ctx.chars[p.by];
      return !!F && HK.State.here(F) && HK.State.here(a);
    },
    w: function () { return 4; },
    run: function (ctx, a) {
      var p = a._ctPreg, F = ctx.chars[p.by], k = T.NEWS[p.kind] ? p.kind : 'casual';
      p.known = true;
      if (k === 'couple') ctx.mod2(a, F, { aff: 6, trust: 4 }, { aff: 6, trust: 4 });
      else if (k === 'forced') { ctx.mod2(a, F, { ten: 10, trust: -6 }, { ten: 6 }); ctx.stress(a, 12); }
      else if (k === 'yanT') { ctx.mod2(a, F, { ten: 6 }, { att: 8 }); ctx.stress(a, 10); }
      else if (k === 'yanB') ctx.mod2(a, F, { att: 8 }, { ten: 8 });
      else ctx.stress(a, 6);
      var lab = { couple: '恋人の子', casual: 'その場かぎりの相手の子', forced: '強引に抱かれた相手の子', yanT: '執着する相手の子', yanB: '執着する相手の子（' + a.name + 'が執着する側）' }[k];
      return { cat: k === 'couple' ? 'bond' : k === 'casual' ? 'solo' : 'conflict', with: [F], text: ctx.t(pk(ctx, p.mb ? forBody(T.NEWS[k]).concat(T.NEWS_OMM[k] || []) : T.NEWS[k]), a, F), why: a.name + 'の妊娠が分かった（' + F.name + 'との、' + lab + '）／〔妊娠〕内容のスイッチ「妊娠・孕む描写」・展開：重い', mag: 30 };
    }
  });

  /* ---------- 内容のスイッチの欄の判定（ui.js の contentBox が呼ぶ）：この箱庭・この顔ぶれ・この設定で起きうるか ----------
     HK.Content.judge(tag, o) → { s: 'yes'（起きうる。t に根拠）／'maybe'（条件しだい。t に条件）／'no'（起きない。t に理由）, t }。
     o：{ scenId, chars（参加する住人だけ。画面の住人でも input.chars でもよい）, ties（関係。a・b は住人の id か番号）,
          env（heavy と箱庭の環境値）, ct（入れているスイッチ { id: 1 }）, pickOf(c)（箱庭ごとの欄。オメガバースの第二性） }。
     参加者の組だけを見る（住人が多くても重くしない）。起きる経路は tips.js の「内容のスイッチ（R18版）：起きやすい条件」と content.js の説明、
     各出来事の when（この下の pregHook・ct_goukon_hate・ct_dv・ct_abuse_night、hate-sex*・obsess-kit・tie-master-r18・tie-abuse・
     omega-mob-r18・zombie-npc／zombie-bite・solo-jashin-r18*・ship・solo-yakata-r18・locker-crowd・jinro-wolfnight・solo-saimin）から写した表。
     関係の値（嫌悪・執着度）や気質で決まる経路は、断言できないので「条件しだい」にする */
  var PREG_STORY = { jashin: 'any', saimin: 'dark' };
  var ENG = { goukon: 1, classroom: 1, island: 1, whiteroom: 1, omega: 1, zombie: 1 };
  /* 合意のない展開：モブ・魔物・神などが一人を襲う箱庭（物語型）と、その相手 */
  var MOBF = { jashin: '村人・神・眷属', ship: '星の生命体', yakata: '使用人・犯人', locker: '群衆' };
  /* 敵対する二人の強引なエッチが起きる箱庭（hate-sex*。合コンは重いときだけ ct_goukon_hate）・執着の監禁の夜（obsess-install.js） */
  var HATE = { whiteroom: 1, omega: 1, zombie: 1, goukon: 'dark' }, OBS = { classroom: 1, goukon: 1, whiteroom: 1, omega: 1, zombie: 1 };
  function infoOf(id) { return HK.Load && HK.Load.info ? HK.Load.info(id) : HK.SCENARIOS && HK.SCENARIOS[id]; }
  function J(s, t) { return { s: s, t: t || '' }; }
  function nm(c) { return c && c.name || '?'; }
  function few(list) { return list.slice(0, 3).join('／') + (list.length > 3 ? ' ほか' : ''); }
  /* 判定の材料（参加者・関係・組の可否） */
  function base(o) {
    var P = HK.Pos, cs = (o.chars || []).filter(Boolean), r18 = cs.filter(function (c) { return !c.noR18; });
    var byKey = function (k) { for (var i = 0; i < cs.length; i++) if (cs[i].id === k || (cs[i].id == null && i === k)) return cs[i]; return null; };
    var ties = (o.ties || []).map(function (t) { var a = byKey(t.a), b = byKey(t.b); return a && b && a !== b ? { a: a, b: b, type: t.type, t: t } : null; }).filter(Boolean);
    /* T が攻め・B が受けで体の関係になれる組（恋愛対象は体の関係の判定。恋愛対象「なし」は「体の関係の相手」で見る） */
    var sexTB = function (T, B) { return !!(P && T !== B && !T.noR18 && !B.noR18 && P.canTop(T) && P.canBottom(B) && P.genderOK(T, B, true)); };
    var sexAny = function (a, b) { return sexTB(a, b) || sexTB(b, a); };
    var mobOk = function (c) { if (c.noR18) return false; var L = HK.sexLockRead ? HK.sexLockRead(c) : null; return !(L && L.locks && !L.mob); };
    var recv = function (c) { return mobOk(c) && (!P || (P.canReceive(c) && !P.noGen(c))); };
    var D = HK.Dark, heavy = D ? D.on(o.env || {}) : 'normal';
    return { P: P, cs: cs, r18: r18, ties: ties, sexTB: sexTB, sexAny: sexAny, recv: recv, heavy: heavy, ct: o.ct || {}, id: o.scenId, sc: infoOf(o.scenId) };
  }
  /* 主従で、従者 T が主 B を襲う向きになれない理由（なれるなら ''）。tie-master-r18.js の MR.ok・MR.dirOk と同じ決まりを、入力の住人で見る：
     R18に参加する・恋愛対象（体の関係）が合う・T が B を避けていない・T が攻め・B が受けに回れる（自分で選んだ受け攻め・相手の指定の好み）・
     どちらの向きにもなれる組は攻め度の高いほうが攻め（主の攻め度が高ければ主が攻めになるので起きない） */
  function msWhy(Bs, T, Bt) {
    var P = Bs.P;
    if (!P) return '';
    if (T.noR18 || Bt.noR18) return (T.noR18 ? nm(T) : nm(Bt)) + 'がR18に参加しない';
    if (!P.genderOK(T, Bt, true)) return '恋愛対象（体の関係の相手）が合わない';
    /* 従者が主を避けている（avoid-kit.js の HK.Avoid と同じ関係の読み方。恐怖・無関心はいつも、ほかは惹かれが強まらない限り起きない） */
    var av = '';
    Bs.ties.forEach(function (x) {
      if (av) return;
      var D = HK.TIES && HK.TIES[x.type], c = x.t && x.t.cold;
      if (x.a === T && x.b === Bt && (x.type === 'fear' || x.type === 'apathy')) av = x.type === 'fear' ? '恐怖' : '無関心';
      else if (x.a === Bt && x.b === T && ((D && D.hate && c === 'avoid') || (x.type === 'crush' && c === 'dislike') || (x.type === 'yan' && (c === 'afraid' || c === 'hate')) || (x.type === 'abuse' && (c === 'fear' || c === 'flee')))) av = '苦手・避けている';
    });
    if (av) return '従者の' + nm(T) + 'が主の' + nm(Bt) + 'を避けている（' + av + (av === '苦手・避けている' ? '。惹かれが強まらない限り' : '') + '）';
    var kind = function (c, r) { return P.explicit(c) ? P.of(c) : r; };
    var can = function (X, Y) { return P.canTop(X) && P.canBottom(Y) && !!P.likes(X)[kind(Y, 'bottom')] && !!P.likes(Y)[kind(X, 'top')]; };
    if (!can(T, Bt)) return '受け攻めが合わない（' + (!P.canTop(T) ? '従者の' + nm(T) + 'が「受け」' : !P.canBottom(Bt) ? '主の' + nm(Bt) + 'が「攻め」' : '受け攻めの好み') + 'を選んでいて、従者が攻め・主が受けになれない）';
    if (can(Bt, T) && P.lv && P.lv(Bt) > P.lv(T)) return '受け攻めが合わない（主の' + nm(Bt) + 'のほうが攻め度が高く、主が攻めに回る）';
    return '';
  }
  /* オメガバースの「発情期のΩが街のαに襲われる」（omega-mob-r18.js の om_mobr）：Ωになりうる住人ごとに、襲われない理由（襲われうるなら ''）。
     omega-mob-r18.js の canRape（HK.State.mobSexOk・HK.Pos.canReceive・性器なし）を入力の住人で見る（2026-10-28 担当KI） */
  function omWhy(Bs, c) {
    var P = Bs.P;
    if (c.noR18) return 'R18に参加しない';
    var Lk = HK.sexLockRead ? HK.sexLockRead(c) : null;
    if (Lk && Lk.locks && !Lk.mob) return '性行為の相手を「固定した相手だけ」にしている（「固定した相手＋モブ」なら起きる）';
    if (P && !P.canReceive(c)) return 'モブ相手に受けに回れない（受け攻めかモブ相手の受け攻めが「攻め」）';
    if (P && P.noGen && P.noGen(c)) return '性器なし';
    return '';
  }
  /* オメガバースの街のαの場面の一文：{ ev: 起きうるときの文, ng: 起きないときの理由 } */
  function omMob(o, Bs) {
    var pk = function (c) { return (o.pickOf && o.pickOf(c)) || c.pick || {}; };
    var canO = function (c) { var x = pk(c); return !x.sex || x.sex === 'o' || (x.sex === 'a' && x.sw !== 'no') || (x.sex === 'b' && x.sw === 'yes'); };
    var env = o.env || {}, lv = env.mobheat || 'on', os = Bs.cs.filter(canO);
    if (!os.length) return { ev: '', ng: 'Ωになりうる住人がいないので、発情期に街のαに襲われる場面は起きません。' };
    if (lv === 'off') return { ev: '', ng: '環境値「街のαに襲われやすさ」が「なし」なので、発情期に街のαに襲われる場面は起きません。' };
    var ok = [], bad = [];
    os.forEach(function (c) { var w = omWhy(Bs, c); if (w) bad.push(nm(c) + '（' + w + '）'); else ok.push(c); });
    var badT = bad.length ? few(bad) + 'は襲われません' : '';
    if (!ok.length) return { ev: '', ng: '発情期に街のαに襲われる場面は、' + few(bad) + 'のため起きません。' };
    var mate = ok.filter(function (c) { return Bs.ties.some(function (t) { return t.type === 'mate' && (t.a === c || t.b === c); }); });
    var heat = env.heat == null ? 50 : +env.heat, notes = [];
    notes.push({ many: '街のαに襲われやすさ：多い', lots: '街のαに襲われやすさ：とても多い' }[lv] || '街のαに襲われやすさ：ふつう（起きにくい。多い・とても多いで増える）');
    if (heat < 40) notes.push('発情期の重さが40未満で抑制剤が効きやすく、起きにくい');
    else if (heat >= 80) notes.push('発情期の重さ' + heat + '：抑制剤が効きにくい');
    if (mate.length) notes.push('番のいる' + few(mate.map(nm)) + 'は起きにくい');
    if (badT) notes.push(badT);
    return { ev: '発情期のΩが街のαに襲われる（襲われうるΩ：' + few(ok.map(nm)) + '。' + notes.join('・') + '）', ng: '' };
  }
  function tiesOfType(B, re) { return B.ties.filter(function (t) { return re.test(t.type); }); }
  function anyPair(B, fn) { for (var i = 0; i < B.r18.length; i++) for (var j = 0; j < B.r18.length; j++) if (i !== j && fn(B.r18[i], B.r18[j])) return [B.r18[i], B.r18[j]]; return null; }
  /* 妊娠・孕む描写 */
  function jPreg(o, B) {
    var id = B.id, P = B.P, st = PREG_STORY[id];
    if (st === 'any') return J('yes', '疑似妊娠・巫女（神の仕業なので、性別・性器によらず受けた人に）');
    if (NO_SCEN[id] || (!st && B.sc && B.sc.solo)) return J('no', 'この箱庭には妊娠の場面がありません');
    if (!P) return J('yes', '');
    var hit = null, ev = '';
    if (st === 'dark') {
      hit = B.r18.filter(function (c) { return P.gen(c) === 'f' && !P.hardTop(c); });
      if (!hit.length) return J('no', '女性器だけの人（受けに回れる人）が参加していません');
      ev = '催眠をかけられた' + few(hit.map(nm)) + '（女性器だけの人）';
    } else {
      var om = id === 'omega', pk = function (c) { return (o.pickOf && o.pickOf(c)) || c.pick || {}; };
      /* 第二性（おまかせ・スイッチで変わりうるものも、なりうるなら可） */
      var canA = function (c) { var x = pk(c); return !x.sex || x.sex === 'a' || (x.sex === 'o' && x.sw !== 'no'); };
      var canO = function (c) { var x = pk(c); return !x.sex || x.sex === 'o' || (x.sex === 'a' && x.sw !== 'no') || (x.sex === 'b' && x.sw === 'yes'); };
      var gp = anyPair(B, function (A, C) { return P.hasM(A) && P.gen(C) === 'f' && B.sexTB(A, C); });
      var ap = om ? anyPair(B, function (A, C) { var g = P.gen(C); return P.hasM(A) && g !== 'none' && canA(A) && canO(C) && B.sexTB(A, C); }) : null;
      if (!gp && !ap) return J('no', om ? '恋愛対象と受け攻めの合う「α（男性器のある人）×Ω」の組も、「男性器のある人×女性器だけの人」の組もありません' : '恋愛対象と受け攻めの合う「男性器のある人×女性器だけの人」の組がありません');
      ev = ap && !gp ? 'α×Ωの組（' + nm(ap[0]) + '×' + nm(ap[1]) + '）' : '男性器×女性器の組（' + nm(gp[0]) + '×' + nm(gp[1]) + '）' + (ap && ap !== gp ? '・α×Ωの組' : '');
    }
    if (B.heavy !== 'dark') return J('no', '展開の重さが「重い」のときだけ起きます');
    return J('yes', ev);
  }
  /* 合意のない展開 */
  function jForce(o, B) {
    var id = B.id, P = B.P;
    if (HK.Content.CORE[id]) return J('yes', 'この箱庭の題材なので、いつも入として扱います');
    if (B.heavy === 'mild') return J('no', '展開の重さが「穏やか」のときは切として扱います');
    if (!P) return J('yes', '');
    var rc = B.r18.filter(B.recv), rcT = rc.length ? '（受けに回れる人：' + few(rc.map(nm)) + '）' : '';
    var noRecv = 'モブ相手に受けに回れる人がいません（モブ相手の受け攻め・R18に参加しない・性行為の相手を「固定した相手だけ」・性器なし）';
    if (id === 'saimin') return B.r18.length ? J('yes', '催眠が、同意のない催眠になります') : J('no', 'R18に参加する人がいません');
    if (MOBF[id]) return rc.length ? J('yes', MOBF[id] + 'に襲われる場面' + rcT) : J('no', noRecv);
    if (id === 'jinro') return anyPair(B, B.sexTB) ? J('maybe', '人狼が勝ったとき、人狼が生き残りを襲う') : J('no', '恋愛対象と受け攻めの合う組がありません');
    if (!ENG[id]) return J('no', 'この箱庭には合意のない展開の場面がありません');
    var ev = [], dark = B.heavy === 'dark';
    var hostile = tiesOfType(B, /^(enemy|rival|bad)$/).filter(function (t) { return B.sexAny(t.a, t.b); });
    if (HATE[id] && (HATE[id] !== 'dark' || dark) && hostile.length) ev.push('敵対の組（' + hostile.map(function (t) { return nm(t.a) + '×' + nm(t.b); }).slice(0, 2).join('・') + '）');
    var yan = OBS[id] ? tiesOfType(B, /^yan$/).filter(function (t) { return B.sexAny(t.a, t.b); }) : [];
    if (yan.length) ev.push('執着（' + yan.map(function (t) { return nm(t.a) + '→' + nm(t.b); }).slice(0, 2).join('・') + '）の監禁の夜');
    /* 主従：従者（t.b）が主（t.a）を襲う向きになれる組だけ（tie-master-r18.js の MR.ok・MR.dirOk と同じ決まり）。なれない組は理由を添える */
    var msAll = id !== 'classroom' ? tiesOfType(B, /^master$/) : [];
    var ms = msAll.filter(function (t) { return !msWhy(B, t.b, t.a); });
    var msNg = msAll.filter(function (t) { return !!msWhy(B, t.b, t.a); }).slice(0, 2).map(function (t) { return '主従（' + nm(t.b) + 'が主の' + nm(t.a) + 'を襲う）は、' + msWhy(B, t.b, t.a) + 'ので起きません'; });
    var ng = msNg.length ? msNg.join('／') + '。' : '';
    if (ms.length) ev.push('主従（' + ms.map(function (t) { return nm(t.b) + 'が主の' + nm(t.a) + 'を'; }).slice(0, 2).join('・') + '襲う）');
    var ab = id !== 'classroom' ? tiesOfType(B, /^abuse$/).filter(function (t) { return B.sexTB(t.a, t.b); }) : [];
    if (ab.length) ev.push('歪んだ関係の拒めない夜（' + ab.map(function (t) { return nm(t.a) + '→' + nm(t.b); }).slice(0, 2).join('・') + '）');
    if (id === 'omega') { var om = omMob(o, B); if (om.ev) ev.push(om.ev); else ng += om.ng; }
    if (id === 'zombie' && rc.length) ev.push('略奪者・ゾンビに襲われる' + rcT);
    if (ev.length) return J('yes', ev.join('／') + (ng ? '（' + ng + '）' : ''));
    var pair = anyPair(B, B.sexTB);
    if (!pair) return J('no', ng + '恋愛対象と受け攻めの合う組がなく、モブに襲われる場面もありません');
    /* クラスメイトには主従の夜・歪んだ関係の拒めない夜がない */
    var kinds = id === 'classroom' ? '敵対・ライバル・不仲・執着' : '敵対・ライバル・不仲・執着・主従・歪んだ関係';
    if ((HATE[id] && (HATE[id] !== 'dark' || dark)) || OBS[id]) return J('maybe', ng + '二人の仲が険悪になる（嫌悪が強まる）か、執着が芽生えれば。関係を' + kinds + 'にすると起きやすい');
    return J('no', ng + (HATE[id] === 'dark' ? '敵対の組がありません（合コンは、展開の重さが「重い」なら、険悪になった二人の帰り道でも）' : '敵対・執着・主従・歪んだ関係の組がありません'));
  }
  /* 暴力をともなう性描写 */
  function jViolence(o, B) {
    var id = B.id;
    if (B.heavy === 'mild') return J('no', '展開の重さが「穏やか」のときは切として扱います');
    if (id === 'yakata') { var yp = o.env && o.env.ypleasure; return yp === 0 || yp === '0' ? J('no', '環境値「快楽殺人の起きやすさ」が0です') : J('maybe', '犯人の動機が「快楽殺人」になったとき（重さによらず）'); }
    if (!ENG[id] || id === 'classroom') return J('no', 'この箱庭には暴力をともなう性描写の場面がありません');
    if (B.heavy !== 'dark') return J('no', '展開の重さが「重い」のときだけ起きます（吹雪の館の快楽殺人を除く）');
    var force = !!B.ct.force, ev = [];
    var hostile = HATE[id] ? tiesOfType(B, /^(enemy|rival|bad)$/).filter(function (t) { return B.sexAny(t.a, t.b); }) : [];
    /* 出られない部屋の条件のエッチは「合意のない展開」に関わらず起きるので、暴力の段もこのスイッチだけで決まる */
    if (hostile.length && (force || id === 'whiteroom')) ev.push('敵対の組の強引なエッチ（' + hostile.map(function (t) { return nm(t.a) + '×' + nm(t.b); }).slice(0, 2).join('・') + '）');
    var ab = force ? tiesOfType(B, /^abuse$/).filter(function (t) { return B.sexTB(t.a, t.b); }) : [];
    if (ab.length) ev.push('歪んだ関係の拒めない夜（' + ab.map(function (t) { return nm(t.a) + '→' + nm(t.b); }).slice(0, 2).join('・') + '）');
    if (ev.length) return J('yes', ev.join('／'));
    if (!anyPair(B, B.sexTB)) return J('no', '恋愛対象と受け攻めの合う組がありません');
    if (!force && id !== 'whiteroom') return J('no', '「合意のない展開」も入にすると、敵対する二人の強引なエッチに暴力の段が入ります');
    if (HATE[id]) return J('maybe', '二人の仲が険悪になれば（関係を敵対・ライバル・不仲にすると起きやすい）');
    return J('no', '関係「歪んだ関係」の組がありません（この箱庭には敵対する二人の強引なエッチがありません）');
  }
  /* DVなど歪んだ関係 */
  function jAbuse(o, B) {
    var id = B.id;
    if (B.heavy === 'mild') return J('no', '展開の重さが「穏やか」のときは切として扱います');
    if (id === 'saimin') return B.heavy === 'dark' ? J('maybe', 'かける側が恋人・ストーカーのとき、暗示で縛り続ける') : J('no', '展開の重さが「重い」のときだけ起きます');
    var ab = tiesOfType(B, /^abuse$/);
    if (!ENG[id]) return J('no', ab.length ? 'この箱庭には、このスイッチで足す場面がありません（関係「歪んだ関係」は、スイッチによらず関係として出ます）' : 'この箱庭には歪んだ関係の場面がありません');
    if (ab.length) return J('yes', '歪んだ関係（' + ab.map(function (t) { return nm(t.a) + '→' + nm(t.b); }).slice(0, 2).join('・') + '）');
    if (id === 'classroom') return J('no', '関係「歪んだ関係」の組がありません（クラスメイトには、重いときに足す場面もありません）');
    if (B.heavy !== 'dark') return J('no', '関係「歪んだ関係」の組がありません（展開の重さが「重い」なら、恋人・夫婦・執着の組でも起きます）');
    var P = B.P, lv = function (a, b) { return !P || P.genderOK(a, b); };
    var dv = tiesOfType(B, /^(lover|spouse|fiance|mate|fated|yan)$/).filter(function (t) { return lv(t.a, t.b); });
    if (dv.length) return J('maybe', '恋人・夫婦・執着の組（' + dv.map(function (t) { return nm(t.a) + '×' + nm(t.b); }).slice(0, 2).join('・') + '）に、支配的な気質（CP・ドライさ・攻撃性が高い）の人がいれば');
    if (anyPair(B, function (a, b) { return lv(a, b); })) return J('maybe', '恋人になった二人に、支配的な気質（CP・ドライさ・攻撃性が高い）の人がいれば');
    return J('no', '恋人・夫婦・執着になれる組がありません（恋愛対象が合いません）');
  }
  HK.Content.judge = function (tag, o) {
    o = o || {};
    if (HK.SAFE_ON) return J('no', '');
    var B = base(o);
    return tag === 'preg' ? jPreg(o, B) : tag === 'force' ? jForce(o, B) : tag === 'violence' ? jViolence(o, B) : tag === 'abuse' ? jAbuse(o, B) : J('yes', '');
  };
  /* 起きないときの理由だけ（起きうるなら ''） */
  HK.Content.why = function (tag, o) { var r = HK.Content.judge(tag, o); return r.s === 'no' ? r.t : ''; };
  HK.Content.pregWhy = function (o) { return HK.Content.why('preg', o); };

  /* ================= 暴力をともなう性描写：敵対する二人の強引なエッチに差し込む段 ================= */
  var HS = HK.HateSex;
  if (HS && HS.scene && HS.why) {
    HS.extra = function (x, Tp, B, k, opt) {
      /* 出られない部屋の条件のエッチ（opt.room）は「合意のない展開」に関わらず起きる場面なので、暴力の段は「暴力をともなう性描写」だけで決める */
      if (!on(x, 'violence') || !HS.hostile(x, Tp, B, opt && opt.room ? { room: true } : null) || x.rng() >= 0.45) return '';
      var ps = HK.personaOf ? HK.personaOf(B) : B.persona;
      var t = pk(x, T.VIOL_TOP[k] || T.VIOL_TOP.m) + pk(x, T.VIOL_REACT[ps] || T.VIOL_REACT.gentle);
      x._ctViol = { n: x.log ? x.log.length : 0, text: t.replace(/\{a\}/g, Tp.name).replace(/\{b\}/g, B.name) };
      return t;
    };
    /* 差し込んだ場面の理由に印を足す（場面を作った直後に理由を作る呼び方だけ。間に別の記録が入ったら足さない） */
    var why0 = HS.why;
    HS.why = function (x) {
      var w = why0.apply(this, arguments), v = x && x._ctViol;
      if (v && v.n === (x.log ? x.log.length : 0)) { w += '／〔暴力をともなう性描写〕' + '攻めが手を上げた（内容のスイッチ「暴力をともなう性描写」・展開：重い）'; x._ctViolPend = v.text; }
      if (x) x._ctViol = null;
      return w;
    };
  }

  /* ================= 合意のない展開：合コンの帰り道の、敵対する二人 ================= */
  HK.addTo(HK.COMMON, {
    /* force：恋愛対象「なし」の人も（pos.js の HK.Pos.forceOpen・HK.Pos.okForce。2026-10-27 担当HC） */
    id: 'ct_goukon_hate', label: '合コンの帰り道に敵意ある相手に迫られる', cat: 'romance', sex: true, force: true, scope: 'pair', pri: true, r18: true,
    when: function (ctx, a, b) {
      if (!b || scenOf(ctx) !== 'goukon' || !HS || ctx.stepIndex < 3 || !on(ctx, 'force')) return false;
      var pf = ctx.pair(a, b);
      if (pf.ctHate || pf.hateSexAt != null || !HK.Pos.okForce(ctx, a, b) || !ctx.romanceOk([a, b], { sex: true, force: true })) return false;
      /* 愛憎（気持ちの関係）の二人は、表の顔が嫌悪系（HK.LoveHate.face が 'hate'）のときだけ。恋愛系・対等系の愛憎の二人は合コンのふつうの夜に任せる（2026-10-29 担当C。HS.hostile でも外す） */
      if (HS.lhSoft && HS.lhSoft(ctx, a, b)) return false;
      return HS.order(ctx, a, b)[0] === a && HS.hostile(ctx, a, b) && !HS.taken(ctx, a, b);
    },
    w: function (ctx, a) { return 3 + (a.tr.aggr || 0) + (a.tr.impulse || 0) * 0.5; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), o = HS.order(ctx, a, b);
      pf.ctHate = true; pf.night = true; pf.nights = (pf.nights || 0) + 1; pf.hateSex = (pf.hateSex || 0) + 1; pf.hateSexAt = ctx.stepIndex;
      ctx.mod2(a, b, { att: 10, aff: 3, ten: -2 }, { att: 10, aff: 3, ten: -2 });
      var text = HS.scene(ctx, a, b, { place: ctx.t(pk(ctx, T.GOUKON_HATE), o[0], o[1]) });
      return { cat: 'romance', sex: true, text: text, why: HS.why(ctx, a, b) + HS.shieldWhy(HS.lastShield) + '／合コンの帰り道／〔合意のない展開〕内容のスイッチ「合意のない展開」・展開：重い', mag: 28 };
    }
  });

  /* ================= DVなど歪んだ関係 ================= */
  var DVT = /^(lover|spouse|fiance|mate|fated|yan)$/, LONG = { omega: 1, island: 1, zombie: 1 };
  var STYLE = { endure: '耐えている', resist: '反発している', flee: '逃げ出したい' };
  /* 支配しやすさ：支配（CP）・冷たさ（ドライさ）・短気（攻撃性） */
  function domScore(c) { var t = c.tr || {}; return (t.cp || 0) * 0.45 + (t.cold || 0) * 0.3 + (t.aggr || 0) * 0.25; }
  function dvTie(ctx, a, b) { return tiesOf(ctx, a, b).filter(function (t) { return DVT.test(t.type); })[0] || null; }
  function domOf(ctx, a, b, tie) {
    if (tie && tie.type === 'yan') { var Y = ctx.chars[tie.a]; return Y && domScore(Y) >= 0.45 ? Y : null; }
    var D = domScore(a) >= domScore(b) ? a : b, O = D === a ? b : a;
    return domScore(D) >= 0.55 && domScore(D) - domScore(O) >= 0.04 ? D : null;
  }
  /* 支配される側の反応：耐える（AC・NP）／反発（CP・攻撃性）／逃げ出したい（慎重さ・A） */
  function styleOf(c) {
    var t = c.tr || {}, s = { endure: (t.ac || 0) * 0.55 + (t.np || 0) * 0.45, resist: (t.cp || 0) * 0.55 + (t.aggr || 0) * 0.45, flee: (t.caution || 0) * 0.55 + (t.a || 0) * 0.45 };
    return s.resist > s.endure && s.resist >= s.flee ? 'resist' : s.flee > s.endure ? 'flee' : 'endure';
  }
  function witness(ctx, D, V) {
    return ctx.present().filter(function (c) { return c !== D && c !== V && ctx.R(c, V).aff > 10; })
      .sort(function (x, y) { return (y.tr.np + ctx.R(y, V).aff / 100) - (x.tr.np + ctx.R(x, V).aff / 100); })[0] || null;
  }
  /* 拒めない夜：合意のない展開も入で、体の関係になれる組（支配する側が攻め） */
  /* 恋愛対象「なし」の人も（合意のない展開が入。pos.js の HK.Pos.forceOpen。2026-10-27 担当HC） */
  function nightOk(ctx, D, V) {
    if (!on(ctx, 'force') || !HK.Pos) return false;
    if (!HK.Pos.forceOpen(ctx, [D, V], function () { return HK.State.pairSex(D, V) && HK.canLove(D, V) && HK.canLove(V, D); })) return false;
    if ((HK.sexBlocked && HK.sexBlocked(D, V)) || !ctx.romanceOk([D, V], { sex: true, force: true })) return false;
    return HK.Pos.order(D, V, [D, V])[0] === D;
  }
  /* 拒めない夜の文（{a}＝D 支配する側で攻め、{b}＝V）。返す：{ text, extra（理由に足す印） } */
  function nightText(ctx, D, V) {
    /* 性器なしの人がいる組（pos-nogen.js の HK.NoGen）は、挿れる・跨って迎える描写のない組の文（ff：指・唇・肌）で書く（2026-10-27 担当HC） */
    var text, bk = HK.NoGen && HK.NoGen.on && HK.NoGen.on(D, V) ? 'ff' : kindOf(D, V), vio = on(ctx, 'violence');
    /* 場所の合わない文（出られない部屋には寝室も帰る家もない）・恋愛対象「なし」の支配する側の「愛してる」は選ばない（2026-10-27 担当HC。合う文が無ければそのまま） */
    var NG = new RegExp([scenOf(ctx) === 'whiteroom' ? '寝室|帰ってくるなり' : '', D.likes === 'none' ? '愛して' : ''].filter(Boolean).join('|') || '$^');
    var pk = function (x, arr) { var l = arr.filter(function (t) { return !NG.test(t); }); return pk0(x, l.length ? l : arr); };
    /* 2026-10-27（担当BM）：描写の作風「男性向け」なら段に分けて男性向けで書く。第三者が割って入る庇い展開（HK.HateSex.shield）もここで */
    var HF = HS && HS.Force, LW = HK.Lewd, lowN = LW && LW.low(ctx.env), sub = HF ? HF.subOf(D, V, bk) : '';
    var eroN = !!(HF && LW && LW.ero(ctx.env) && !lowN && sub), shortN = eroN && LW.short(ctx.env, ctx.rng);
    var shN = HS && HS.shield && !lowN ? HS.shield(ctx, D, V, { ero: eroN, short: shortN }) : null;
    if (!eroN && !shN) text = ctx.t(pk(ctx, T.DV_NIGHT[bk]) + (vio ? pk(ctx, T.DV_NIGHT_V[bk]) : ''), D, V);
    else {
      var ps = [pk(ctx, T.DV_OPEN)];
      if (vio) ps.push(pk(ctx, T.DV_NIGHT_V[bk]));
      if (shN) ps.push(shN.open + shN.both);
      if (eroN) {
        ps.push(HF.pick(ctx, T.DV_ERO[sub]));
        if (shN) ps.push(shN.watch);
        ps.push(HF.pick(ctx, HF.PEAK[HF.ps(V)]) + '{b}「{m2}」');
        if (!shortN) {
          ps.push(HF.pick(ctx, HF.FIN[sub]));
          if (LW.high(ctx.env)) ps.push(HF.pick(ctx, HF.AGAIN));
          ps.push(pk(ctx, T.DV_AFTER_E));
        }
      } else { ps.push(pk(ctx, T.DV_BODY[bk])); ps.push(shN.watch); }
      if (shN) ps.push(shN.after);
      text = HF.fill(ctx, ps.join(''), D, V, eroN);
    }
    var none = HK.Pos && HK.Pos.noneWhy ? HK.Pos.noneWhy(ctx, [D, V], true) : '';
    return { text: text, extra: '／〔合意のない展開〕' + (vio ? '〔暴力をともなう性描写〕' : '') + (shN ? HS.shieldWhy(shN) : '') + none };
  }
  HK.addTo(HK.COMMON, {
    id: 'ct_dv', label: '恋人に手を上げる', cat: 'conflict', scope: 'pair', pri: true, r18: true,
    when: function (ctx, a, b) {
      if (!b || NO_SCEN[scenOf(ctx)] || !on(ctx, 'abuse')) return false;
      var pf = ctx.pair(a, b);
      /* 長い箱庭（数か月〜の区切り）では二区切りに一度。一組で六回まで */
      if (pf.ctDvEnd || pf.abFree || (pf.ctDv && pf.ctDv.n >= 6) || (pf.ctDvAt != null && ctx.stepIndex - pf.ctDvAt < (LONG[scenOf(ctx)] ? 2 : 1))) return false;
      if (HK.Ties && HK.Ties.has && HK.Ties.has(ctx, a, b, 'abuse')) return false;
      var tie = dvTie(ctx, a, b);
      if (!tie && !pf.couple) return false;
      if (!HK.State.pairLove(a, b)) return false;
      var D = pf.ctDv ? ctx.chars[pf.ctDv.d] : domOf(ctx, a, b, tie);
      return D === a || D === b;
    },
    /* 始まった二人は続きやすい（繰り返しの流れを見せるため） */
    w: function (ctx, a, b) { var st = ctx.pair(a, b).ctDv; return 0.8 + Math.max(domScore(a), domScore(b)) * 1.4 + (st ? 2 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), st = pf.ctDv, tie = dvTie(ctx, a, b);
      /* 動いたのが支配される側でも、支配する側を {a} にする */
      var D = st ? ctx.chars[st.d] : domOf(ctx, a, b, tie), V = D === a ? b : a;
      if (!st) st = pf.ctDv = { d: D.i, v: V.i, n: 0, seen: false, style: styleOf(V), c: null, src: tie ? tie.type : 'couple', lab: tie ? (HK.tieLabel ? HK.tieLabel(tie) : HK.TIES[tie.type] ? HK.TIES[tie.type].label : '恋人') : '恋人' };
      st.n++; pf.ctDvAt = ctx.stepIndex;
      var cs = book(ctx); if (cs.dv.indexOf(pf) < 0) cs.dv.push(pf);
      var rng = ctx.rng, C = witness(ctx, D, V), k;
      var freeP = (st.style === 'flee' ? 0.25 : st.style === 'resist' ? 0.18 : 0.06) + (st.seen ? 0.15 : 0) + Math.min(0.2, (st.n - 4) * 0.05);
      if (st.n >= 4 && (C || st.style !== 'endure') && rng() < freeP) k = 'free';
      else if (C && st.n >= 2 && rng() < 0.3) k = st.seen && rng() < 0.55 ? 'step' : 'notice';
      else {
        var seq = ['control', 'verbal', 'violence', 'honey', st.style];
        k = seq[(st.n - 1) % seq.length];
        if (k === 'violence' && nightOk(ctx, D, V) && rng() < 0.6) k = 'night';
      }
      var text, sex = false, extra = '';
      if (k === 'night') { var nt = nightText(ctx, D, V); text = nt.text; extra = nt.extra; sex = true; }
      else text = ctx.t(pk(ctx, T.DV[k]).replace(/\{c\}/g, C ? C.name : '周りの人'), D, V);
      if (k === 'control') { ctx.mod2(D, V, { att: 2 }, { ten: 5, trust: -3 }); ctx.stress(V, 6); }
      else if (k === 'verbal') { ctx.mod2(D, V, { ten: 2 }, { aff: -4, ten: 6 }); ctx.stress(V, 8); }
      else if (k === 'violence') { ctx.mod2(D, V, { ten: 4 }, { aff: -6, trust: -6, ten: 10 }); ctx.stress(V, 12); }
      else if (k === 'night') { ctx.mod2(D, V, { att: 2 }, { aff: -8, trust: -8, ten: 12 }); ctx.stress(V, 14); }
      else if (k === 'honey') { ctx.mod2(D, V, { att: 3 }, { att: 3, aff: 3, ten: -3 }); ctx.stress(V, -4); }
      else if (k === 'resist') ctx.mod2(D, V, { ten: 6 }, { ten: 6 });
      else if (k === 'endure' || k === 'flee') ctx.stress(V, k === 'flee' ? 6 : 3);
      else if (k === 'notice' || k === 'step') {
        st.seen = true; st.c = C.i;
        ctx.mod2(V, C, { trust: 8, aff: 5 }, { aff: 4 }); ctx.stress(V, -5);
        if (k === 'step') ctx.mod2(D, C, { ten: 10 }, { ten: 8, trust: -6 });
      } else if (k === 'free') {
        pf.couple = false; pf.ctDvEnd = st.seen && st.c != null ? 'rescued' : 'free';
        ctx.mod2(V, D, { att: -30, aff: -15, ten: 6 }, { ten: 8 }); ctx.stress(V, -10);
        if (C) ctx.mod2(V, C, { trust: 10, aff: 6 }, { aff: 5, trust: 4 });
      }
      if (HK.Emo && /^(?:control|verbal|violence|night|flee)$/.test(k)) HK.Emo.bump(ctx, V, { fear: k === 'violence' || k === 'night' ? 30 : 16, grief: 6 }, D.name + 'との歪んだ関係');
      var whyK = { control: '：束縛', verbal: '：暴言', violence: '：暴力', honey: '：謝って優しくなる（繰り返し）', endure: '：耐えている', resist: '：言い返した', flee: '：逃げ出したい', notice: '：' + (C ? C.name : '周り') + 'が気づいた', step: '：' + (C ? C.name : '周り') + 'が間に入った', free: '：' + V.name + 'が離れる決心をした（恋人ではなくなった）', night: '：拒めない夜' }[k];
      var src = st.src === 'yan' ? '執着（' + D.name + 'が執着する側）' : st.lab;
      return {
        cat: k === 'honey' ? 'romance' : /notice|step|free/.test(k) ? 'help' : 'conflict', sex: sex, with: C && /notice|step|free/.test(k) ? [C] : null, text: text,
        why: D.name + '（支配する側）と' + V.name + '（支配される側・' + STYLE[st.style] + '）の歪んだ関係' + whyK + '／〔DVなど歪んだ関係〕' + src + 'で、' + (st.src === 'yan' ? '執着が支配に変わった' : D.name + 'の支配的な気質（CP・ドライさ・攻撃性）') + '（内容のスイッチ「DVなど歪んだ関係」・展開：重い）' + extra,
        mag: k === 'free' ? 22 : k === 'violence' || k === 'night' || k === 'step' ? 16 : 10
      };
    }
  });

  /* ================= 合意のない展開：関係「歪んだ関係」の拒めない夜（2026-10-27 担当HC） =================
     関係「歪んだ関係」（tie-abuse.js）の二人は、内容のスイッチ「合意のない展開」が入なら（展開の重さが「ふつう」でも。穏やかなら起きない）、
     支配する側が攻めの向き（HK.Pos.order）のときだけ、支配される側を拒めない夜に引き込む（「DVなど歪んだ関係」が切でも。重い場面の段は ct_dv・tie_abuse のまま）。
     恋愛対象「なし」の人も（HK.Pos.forceOpen）。恋愛対象の性別・受け攻めの指定・恋愛やR18にしない相手・R18に参加しない・性行為の相手の固定は越えない。
     支配される側が離れる決心をした二人（abFree・ctDvEnd）・監禁のさなかの人には起きない。一組で三回まで、二区切り（長い箱庭は三区切り）に一度 */
  function abNightOk(ctx, D, V) {
    var P = HK.Pos;
    if (!P || !P.forceOn(ctx) || D.flags.caged != null || V.flags.caged != null || D.flags.cagePair != null || V.flags.cagePair != null) return false;
    if (!P.forceOpen(ctx, [D, V], function () { return HK.State.pairSex(D, V) && HK.canLove(D, V) && HK.canLove(V, D); })) return false;
    if ((HK.sexBlocked && HK.sexBlocked(D, V)) || !ctx.romanceOk([D, V], { sex: true, force: true })) return false;
    return P.order(D, V, [D, V])[0] === D;
  }
  HK.addTo(HK.COMMON, {
    id: 'ct_abuse_night', label: '歪んだ関係で拒めない夜', cat: 'conflict', sex: true, force: true, scope: 'pair', pri: true, r18: true,
    when: function (ctx, a, b) {
      if (!b || NO_SCEN[scenOf(ctx)] || HK.SAFE_ON || !HK.Ties || !HK.Ties.has) return false;
      var t = HK.Ties.has(ctx, a, b, 'abuse');
      if (!t || ctx.chars[t.a] !== a || ctx.chars[t.b] !== b || ctx.stepIndex < 1) return false;
      var pf = ctx.pair(a, b);
      if (pf.abFree || pf.ctDvEnd || (pf.abNightN || 0) >= 3 || (pf.abNightAt != null && ctx.stepIndex - pf.abNightAt < (LONG[scenOf(ctx)] ? 3 : 2))) return false;
      return abNightOk(ctx, a, b);
    },
    /* 支配しやすい気質ほど、支配される側が怯えている・逃げ出したいほど起きやすい */
    w: function (ctx, a, b) { var t = HK.Ties.has(ctx, a, b, 'abuse'), st = t && t.cold || ''; return (1.6 + domScore(a) * 1.6 + (st === 'fear' ? 0.6 : st === 'flee' ? 0.4 : 0) + (a.flags.aphro || 0) * 0.4) * (ctx.pair(a, b).abNightN ? 0.5 : 1); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), t = HK.Ties.has(ctx, a, b, 'abuse'), st = t && t.cold || '';
      pf.abNightN = (pf.abNightN || 0) + 1; pf.abNightAt = ctx.stepIndex; pf.night = true; pf.nights = (pf.nights || 0) + 1;
      var nt = nightText(ctx, a, b);
      ctx.mod2(a, b, { att: 2 }, { aff: -8, trust: -8, ten: 12 }); ctx.stress(b, 14);
      if (HK.Emo) HK.Emo.bump(ctx, b, { fear: 30, grief: 6 }, a.name + 'との歪んだ関係');
      var back = HK.ABUSE_BACK && HK.ABUSE_BACK[st] ? HK.ABUSE_BACK[st].short : '';
      return { cat: 'conflict', sex: true, force: true, text: nt.text, why: a.name + '（支配する側）と' + b.name + '（支配される側' + (back ? '・' + back : '') + '）の歪んだ関係：拒めない夜（内容のスイッチ「合意のない展開」）' + nt.extra, mag: 16 };
    }
  });

  /* ================= 結末の「その後」（エンジン型の箱庭） ================= */
  function endNotes(ctx, r) {
    var cs = ctx._ct, notes = r.end.notes = r.end.notes || [];
    cs.preg.forEach(function (i) {
      var B = ctx.chars[i], p = B && B._ctPreg;
      if (!p || B.alive === false) return;
      var F = ctx.chars[p.by], E = T.END;
      var bonded = p.omega && F && HK.OMEGA && HK.OMEGA.B && HK.OMEGA.B.mateOf && HK.OMEGA.B.mateOf(ctx, B) === F;
      var list = !F || F.alive === false ? E.lost : bonded && (p.kind === 'couple' || p.kind === 'casual') ? E.omega : E[p.kind] || E.casual;
      var tx = ctx.t(pk(ctx, p.mb ? forBody(list) : list), F, B);
      notes.push(/^その後/.test(tx) ? tx : 'その後：' + tx);
    });
    cs.dv.forEach(function (pf) {
      var st = pf.ctDv, D = st && ctx.chars[st.d], V = st && ctx.chars[st.v];
      if (!st || st.n < 2 || !D || !V || V.alive === false) return;
      var C = st.c != null ? ctx.chars[st.c] : null, k = pf.ctDvEnd === 'rescued' && C ? 'rescued' : pf.ctDvEnd ? 'free' : D.alive === false ? '' : 'stay';
      if (k) notes.push('その後：' + ctx.t(pk(ctx, T.DV_END[k]), D, V, C));   /* DV_END の文は「その後」で始めない */
    });
  }

  /* ================= 催眠（物語型）：結末に足す・同意のない催眠の印 ================= */
  function saiminHook(S, o) {
    var p = o.actors && o.actors[0], HY = o.actors && o.actors[1];
    if (!p || typeof p !== 'object' || !p.T) return;
    var P = HK.Pos;
    /* 同意のない催眠：導入の記録の理由に印（重さに関係なく、合意のない展開が入なら） */
    if (o.tag === p.T.label && !p._ctF && !p.consent && !p.noSex && S.env.lewd !== 'low' && HK.Content && HK.Content.ok(S, 'force')) {
      p._ctF = true;
      o.why = (o.why || '') + '／〔合意のない展開〕同意のない催眠（内容のスイッチ「合意のない展開」が入）';
    }
    if (o.tag !== '結末' || p.failed || typeof o.text !== 'string') return;
    var v = { a: p.name, h: p.h }, fmt = function (t) { return String(t).replace(/\{(a|h)\}/g, function (m, k) { return v[k]; }); };
    /* 妊娠：性的な暗示を受けた、女性器だけの受けの人。かける側に男性器がある */
    if (on(S, 'preg') && P && p.cnt && p.cnt.lewd > 0 && !p.aTop && !p.ff && !p.noSex && P.gen(p) === 'f') {
      var male = HY && typeof HY === 'object' ? P.hasM(HY) : p.hm ? P.hasM(p.hm) : !p.hf;
      if (male && S.rng() < 0.35 + (p.wokeCum ? 0.15 : 0)) {
        o.text = join(o.text, fmt(pk(S, p.route === 'forget' || p.erased === 'full' ? T.SAIMIN_PREG_FORGET : T.SAIMIN_PREG)));
        o.why = (o.why || '') + '／〔妊娠〕' + p.name + 'は' + p.h + 'の子を宿したかもしれない（内容のスイッチ「妊娠・孕む描写」・展開：重い）';
      }
    }
    /* 歪んだ関係：恋人・ストーカーのかける側が、そのあとも暗示で縛り続ける（催眠が解けて離れた結末は除く） */
    if (on(S, 'abuse') && (p.ty === 'lover' || p.ty === 'stalker') && /^(forget|body|fall|depend|accept|dazed|confused|sweet|couple)$/.test(p.route || '') && S.rng() < 0.5) {
      o.text = join(o.text, fmt(pk(S, T.SAIMIN_DV)));
      o.why = (o.why || '') + '／〔DVなど歪んだ関係〕' + p.h + 'は暗示で' + p.name + 'を縛り続けた（内容のスイッチ「DVなど歪んだ関係」・展開：重い）';
    }
  }
  /* 物語型の記録（solo-story-kit.js の HK.Story.say）は、あとで読むファイルが包み直すので、最初に回すときに包む */
  function hookStory() {
    var ST = HK.Story;
    if (!ST || !ST.say || ST.say._ct) return;
    var s0 = ST.say;
    ST.say = function (S, o) {
      if (o && S && S.scen && S.scen.id === 'saimin' && !HK.SAFE_ON && HK.Content) saiminHook(S, o);
      return s0.apply(this, arguments);
    };
    ST.say._ct = true;
  }

  var sim0 = HK.simulate;
  HK.simulate = function (input) {
    hookStory();
    CUR = null;
    var r = sim0.apply(this, arguments);
    if (CUR && CUR._ct && r && r.end && typeof r.end === 'object') endNotes(CUR, r);
    CUR = null;
    return r;
  };
  Object.keys(sim0).forEach(function (k) { HK.simulate[k] = sim0[k]; });
})();
