/* 箱庭シミュレーター: 催眠（R18）
   仕事の同僚・恋人・友人・恨みを持った相手・ストーカーの誰かが、住人に催眠をかける。
   かかるかどうか、かかったらどこまで暗示を受け入れるか、どんな暗示に弱いかは人それぞれ。
   最後に、覚えているか・怒るか・通報するか・やり返すか・堕ちるか・困惑するか・放心するか・受け入れるかが、性格と快楽堕ちの度合いで決まる。
   そのあと、数日後の二人（後日談）を、記憶が消えたか・二人の関係・かけられた人の気質で書き分ける。
   かける側がモブなら、性別（「かける人の性別」）も選べる。女性のかける側は、男性が相手なら自分から跨って導き（女攻め×男）、女性が相手なら女性どうしの文になる。
   内容のスイッチ「合意のない展開」が切のときは、恨み・ストーカーは性的な暗示をかけず、同僚・友人・恋人は合意の上の催眠プレイになる */
(function () {
  'use strict';
  var HK = window.HK, SM = HK.SAIMIN, ST = HK.Story, clamp = HK.clamp;
  if (!SM || !ST) return;
  function L(s) { return s.split('|'); }

  /* 一回の結果の中で同じ文を繰り返さない（まだ使っていない文から選び、使い切ったら、いちばん前に使ったものから戻す）。
     run の間だけ HK.Story.pick をこれに差し替える */
  function freshPick(S, arr) {
    if (!arr || !arr.length) return '';
    var u = S._fu || (S._fu = []), free = arr.filter(function (x) { return u.indexOf(x) < 0; }), t;
    if (free.length) t = free[S.rng.int(free.length)];
    else { var bi = Infinity; arr.forEach(function (x) { var j = u.indexOf(x); if (j < bi) { bi = j; t = x; } }); }
    var k = u.indexOf(t); if (k >= 0) u.splice(k, 1);
    u.push(t);
    return t;
  }
  function withFresh(f) { var sp = ST.pick; ST.pick = freshPick; try { return f(); } finally { ST.pick = sp; } }
  var scen = {
    id: 'saimin', name: '催眠', kicker: '1〜2人・R18', solo: true, maxCast: 2, minCast: 1,
    desc: '同僚・恋人・友人・恨みを持った相手・ストーカーの誰かに催眠をかけられる。かかるのか、かかったらどこまでしてしまうのか、どんな暗示に弱いのか。終わったあと、怒るのか、通報するのか、やり返すのか、堕ちるのか、困惑するのか、受け入れるのか。数日後の二人も描く。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: 'コマ', simulate: function (input) { return withFresh(function () { return run(input); }); },
    castHint: '1〜2人（かける側とかけられる側で合わせて二人まで）。1人のときは、かける側はモブ（「かける相手」「かける人の性別」の設定で決まる）になります。2人のときは片方が「かける側」になり、もう片方に催眠をかけます（関係は「既存の関係」から決まります）。役割を決めなければ、2人目がかける側になります。',
    env: [
      { id: 'who', label: 'かける相手', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（人ごとにランダム）' }, { v: 'colleague', label: '仕事の同僚' }, { v: 'lover', label: '恋人' }, { v: 'friend', label: '友人' }, { v: 'grudge', label: '恨みを持った相手' }, { v: 'stalker', label: 'ストーカー' }] },
      { id: 'hsex', label: 'かける人の性別', type: 'select', def: 'random', desc: '1人のとき（かける側がモブ）だけ。おまかせなら、かけられる人の恋愛対象に合わせる', options: [{ v: 'random', label: 'おまかせ' }, { v: 'm', label: '男性' }, { v: 'f', label: '女性' }] },
      { id: 'method', label: 'かけ方', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'pendulum', label: '振り子' }, { v: 'app', label: '催眠アプリ' }, { v: 'voice', label: '囁き声' }, { v: 'aroma', label: '甘い香り' }, { v: 'snap', label: '指パッチン' }, { v: 'audio', label: '催眠音声' }, { v: 'book', label: '古い本の呪文' }] },
      { id: 'skill', label: '催眠の腕', min: 0, max: 100, def: 55, lo: '素人', hi: '達人', desc: '高いほど深くかけられ、相手の弱い暗示を見抜いて選ぶ' },
      { id: 'rounds', label: '暗示の数', min: 2, max: 8, def: 5, lo: '2回', hi: '8回', unit: '回' },
      { id: 'mode', label: '暗示の方向', type: 'select', def: 'mix', options: [{ v: 'mix', label: 'おまかせ' }, { v: 'lewd', label: 'エッチなものだけ' }, { v: 'peace', label: '平和なものだけ' }] },
      { id: 'erase', label: '終わったあとの記憶', type: 'select', def: 'random', options: [{ v: 'random', label: 'かける相手しだい' }, { v: 'keep', label: '消さない' }, { v: 'erase', label: '消そうとする' }] },
      { id: 'ev', label: 'ハプニングの頻度', min: 0, max: 100, def: 45, lo: 'たまに', hi: '頻繁' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'ぼかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ],
    stats: [
      { id: 'sugg', label: 'かかりやすさ', desc: '高いほど深くかかる。エゴグラムのAC・FCが高い、A・CPが低い人もかかりやすい' },
      { id: 'sens', label: '感じやすさ', desc: '高いほど快感が溜まりやすく、絶頂しやすい' }
    ],
    perFields: [{ id: 'role', label: '役割', auto: 'かけられる側', options: [{ id: 'target', label: 'かけられる側' }, { id: 'hypno', label: 'かける側' }] }],
    actions: [
      { id: 'trust', label: '素直に身を任せる', fit: function (t) { return t.ac * 0.5 + t.np * 0.4; } },
      { id: 'doubt', label: '疑ってかかる', fit: function (t) { return t.a * 0.6 + t.caution * 0.4; } },
      { id: 'fun', label: '面白がる', fit: function (t) { return t.fc * 0.8 + 0.1; } }
    ],
    goals: [
      { id: 'none', label: '何も考えていない', fit: function (t) { return t.fc * 0.4 + t.ac * 0.3; } },
      { id: 'safe', label: '自分を守る', fit: function (t) { return t.cp * 0.5 + t.caution * 0.5; } },
      { id: 'curious', label: '催眠に興味がある', fit: function (t) { return t.a * 0.4 + t.fc * 0.4; } }
    ],
    events: []
  };
  /* 描写の作風（R18版の ero-kit.js があるときだけ）：男性向けの文は solo-saimin-ero.js */
  if (HK.Ero && HK.Ero.OPT) scen.env.push(HK.Ero.OPT);
  HK.SCENARIOS.saimin = scen;
  HK.SCEN_ORDER.push('saimin');

  var TIEMAP = { teacher: 'colleague', mentor: 'colleague', lover: 'lover', mate: 'lover', fated: 'lover', fwb: 'lover', colleague: 'colleague', senpai: 'colleague', master: 'colleague', friend: 'friend', best: 'friend', childhood: 'friend', buddy: 'friend', acq: 'friend', almost: 'friend', enemy: 'grudge', rival: 'grudge', ex: 'grudge', crush: 'stalker', classmate: 'friend', boss: 'colleague', benefactor: 'friend', worship: 'friend', fond: 'friend', blind: 'stalker' };
  var FATE = { confused: '困惑したまま、答えを出せなかった', dazed: '放心して、しばらく何も手につかなかった', accept: '戸惑いながらも受け入れた', peace: '頭が良くなって喜んだ', forget: '何も覚えていない', body: '体だけが覚えている', angry: '激怒した', report: '通報した', revenge: 'やり返した', counter: '逆催眠をかけた', sweet: '照れながら許した', shy: '恥ずかしくて避けた', fall: '快楽に堕ちた（自分からねだる）', couple: '恋人になった', depend: '憎みながら離れられない', laugh: 'かからずに笑い飛ばした', noticed: '見破った' };

  function resolve(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }
  function dot(w, tr) { var s = 0; for (var k in w) s += w[k] * (tr[k] || 0); return s; }
  function nm(S, p) { return p.h; }

  function run(input) {
    var S = ST.state(input, 'saimin'), rng = S.rng, env = S.env, P = S.P, lew = env.lewd || 'mid', skill = env.skill / 100;
    var V = HK.Voice;
    /* 内容のスイッチ「合意のない展開」（content.js）：性的な暗示がありうるときだけ見る。切なら、恨み・ストーカーは性的な暗示をかけず、ほかは合意の上の催眠プレイにする */
    S.gate = !HK.SAFE_ON && lew !== 'low' && !!HK.Content && !HK.Content.ok(S, 'force');
    P.forEach(function (p) { var pk = (input.perChar && input.perChar[p.i] && input.perChar[p.i].pick || {}).role; p.role = pk === 'hypno' ? 'hypno' : 'target'; });
    /* かける側とかけられる側で、合わせて二人まで。かける側を決めなければモブ（2人のときは、役割を決めていない人がかける側） */
    if (P.length > 2) P = S.P = P.slice(0, 2);
    var HY = P.filter(function (p) { return p.role === 'hypno'; })[0] || null;
    if (HY && P.length === 1) { HY.role = 'target'; HY = null; }
    if (!HY && P.length === 2) {
      var pk1 = function (p) { return (input.perChar && input.perChar[p.i] && input.perChar[p.i].pick || {}).role; };
      HY = pk1(P[1]) !== 'target' ? P[1] : pk1(P[0]) !== 'target' ? P[0] : P[1];
      HY.role = 'hypno';
    }
    P.forEach(function (p) { if (p !== HY) p.role = 'target'; });
    var T = P.filter(function (p) { return p.role === 'target'; });
    var keys = ['depth', 'plea', 'fall', 'resist'];
    if (HY) { HY.roleLabel = 'かける側'; HY.m = { depth: 0, plea: 0, fall: 0, resist: 0 }; HY.cnt = { ok: 0, tries: 0 }; }

    T.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      /* かける相手 */
      var ty = null, famL = '', kinNo = false;
      if (HY) {
        var tt = (input.ties || []).filter(function (t) { return (t.a === HY.i && t.b === p.i) || (t.a === p.i && t.b === HY.i); })[0];
        /* 執着（ヤンデレ）：どちらが執着しているかと、執着される側の気持ち（怖がっている・嫌っている・受け入れている・共依存）で決める */
        if (tt && tt.type === 'yan') {
          var accepts = tt.cold === 'accept' || tt.cold === 'mutual', fears = tt.cold === 'afraid' || tt.cold === 'hate';
          ty = accepts ? 'lover' : tt.a === HY.i ? 'stalker' : fears ? 'grudge' : 'friend';
        } else if (tt && HK.TIES[tt.type] && HK.TIES[tt.type].family) {
          /* 家族（きょうだい・親子・親族・擬似親子）：家族向けの種類はないので、いちばん近い「友人」の種類にして、札だけ関係の名前にする。
             「恋愛：なし」（ties.js の HK.tieNoLove）の二人は恋人の種類にせず、性的な暗示もかけない。「恋愛：あり」・擬似親子なら恋人の種類にもなる */
          kinNo = !!(HK.tieNoLove && HK.tieNoLove(tt));
          ty = !kinNo && rng() < 0.5 ? 'lover' : 'friend';
          var FD = HK.TIES[tt.type];
          famL = (FD.dir ? (tt.a === HY.i ? FD.roleA : FD.roleB) : FD.label) || FD.label || '';
        } else if (tt) ty = tt.type === 'crush' ? (tt.a === HY.i ? 'stalker' : 'friend') : TIEMAP[tt.type] || TIEMAP[(HK.TIES[tt.type] || {}).like];
      }
      if (!ty) ty = env.who !== 'random' && SM.TYPES[env.who] ? env.who : rng.pick(Object.keys(SM.TYPES));
      /* 合意のない展開が切：おまかせで選んだモブの恨み・ストーカーは、同僚・友人・恋人に替える */
      if (S.gate && !HY && env.who === 'random' && (ty === 'grudge' || ty === 'stalker')) ty = rng.pick(['colleague', 'friend', 'lover']);
      /* モブのかける側の性別：設定がなければ、かけられる人の恋愛対象に合わせる（どちらでもよければ、男性・女性の人にはときどき女性） */
      if (!HY) {
        var hs = env.hsex === 'm' || env.hsex === 'f' ? env.hsex : null;
        if (!hs) hs = p.likes === 'f' ? 'f' : p.likes === 'm' ? 'm' : (p.gender === 'm' || p.gender === 'f') && rng() < 0.4 ? 'f' : 'm';
        p.hf = hs === 'f';
      }
      /* 恋愛・R18にしない組（HK.ngPair）では、住人のかけ手を恋人・ストーカーにしない */
      if (HY && HK.ngPair && HK.ngPair(HY, p) && (ty === 'lover' || ty === 'stalker')) ty = ty === 'lover' ? 'friend' : 'colleague';
      p.ty = ty; p.T = famL && ty === 'friend' ? Object.assign({}, SM.TYPES[ty], { label: famL }) : SM.TYPES[ty];
      p.hc = HY || null; p.h = HY ? HY.name : ST.fmt(rng.pick(p.hf && p.T.namesF ? p.T.namesF : p.T.names), { a: p.name });
      /* モブのかける側の体（受け攻め・女攻めの文・喘ぎを選ぶための仮の人物） */
      p.hm = HY ? null : { name: p.h, gender: p.hf ? 'f' : 'm', persona: 'gentle', mob: true };
      /* 女性のモブの喘ぎ・跨る文の書き方は、穏やかの態度で（男性向けの荒い喘ぎにしない） */
      if (p.hm && p.hf) p.hm.tone = 'gentle';
      p.mk = env.method !== 'random' && SM.METHODS[env.method] ? env.method : rng.pick(Object.keys(SM.METHODS));
      p.M = SM.METHODS[p.mk];
      p.bad = ty === 'grudge' || ty === 'stalker';
      /* 受け攻め：かけられた側が攻めか（住人どうしは HK.Pos.order、モブ相手は HK.Pos.vsNpc）。
         住人どうしで向きの決まらない組（HK.Pos.okSex が false）は、性的な暗示を一切かけない。女性どうしは専用の文 */
      var Pz = HK.Pos;
      /* モブが相手：モブとの場面に出してよい人（HK.State.mobSexOk。恋人のモブなら「恋人だけ」の人も）で、恋愛対象がかける側の性別に合うときだけ */
      var mobNo = !HY && !HK.SAFE_ON && (!!(HK.State && !(HK.State.r18ok(p) && (!p.noMob || ty === 'lover'))) || !!(Pz && !Pz.genderOK(p, p.hm)));
      /* 合意のない展開が切：恨み・ストーカーは性的な暗示をかけない（いたずらだけ）。ほかは、始める前に同意を取った催眠プレイ */
      p.noForce = S.gate && (ty === 'grudge' || ty === 'stalker');
      p.consent = S.gate && !p.noForce;
      p.noSex = !!(Pz && HY && !Pz.okSex(HY, p)) || kinNo || mobNo || p.noForce;
      p.aTop = !!(Pz && !p.noSex && (HY ? Pz.order(HY, p, [HY, p])[0] === p : Pz.vsNpc(p, '') === 'top'));
      p.ff = !!(Pz && (HY ? Pz.ff(HY, p) : p.hf && Pz.isF(p)));
      /* かける側が女性で、男性（女性でない人）を導く組（女攻め×男）：{h} が跨る・導く専用の文（fm）を使う。男性の体で書いた {h} の文は使わない。
         住人のかける側は、自分で攻めを選んだ女性（HK.FM.on）か、向き（HK.Pos.order）で先に立った女性 */
      var hFem = HY ? !!(Pz && Pz.isF(HY)) : !!p.hf;
      p.fm = !!(Pz && !p.noSex && !p.ff && !p.aTop && hFem && (!HY || (HK.FM && HK.FM.on && HK.FM.on(HY, p)) || Pz.order(HY, p, [HY, p])[0] === HY));
      p.aTopLast = p.aTop;
      p.peaceOnly = env.mode === 'mix' && rng() < ({ friend: 0.3, colleague: 0.15, lover: 0.1 }[ty] || 0);
      p.sens = 0.6 + (p.stats.sens || 3) * 0.18;
      /* かかりやすさ（0〜1） */
      p.sus = clamp(0.2 + (p.stats.sugg || 3) * 0.08 + p.tr.ac * 0.25 + p.tr.fc * 0.15 + p.tr.np * 0.08 - p.tr.a * 0.2 - p.tr.cp * 0.2 + dot(p.M.aff, p.tr) + p.T.trust * 0.15 + skill * 0.15 + (p.action.id === 'trust' ? 0.12 : p.action.id === 'doubt' ? -0.15 : 0.04) + (p.goal.id === 'safe' ? -0.08 : 0), 0.02, 0.98);
      /* 暗示ごとの弱さ */
      p.aff = {};
      Object.keys(SM.SUG).forEach(function (k) { var g = SM.SUG[k]; p.aff[k] = dot(g.aff, p.tr) - dot(g.res, p.tr) + (rng() - 0.5) * 0.25; });
      p.weak = Object.keys(p.aff).filter(function (k) { return okSug(p, k, env); }).sort(function (a, b) { return p.aff[b] - p.aff[a]; }).slice(0, 2);
      p.m = { depth: 0, plea: 0, fall: 0, resist: Math.round(clamp((p.tr.cp * 0.5 + p.tr.a * 0.4 + (p.goal.id === 'safe' ? 0.15 : 0)) * 100 * (HK.Attr ? 2 - HK.Attr.willK(p) : 1), 5, 95)) };
      p.cnt = { ok: 0, part: 0, ng: 0, climax: 0, lewd: 0, shame: 0, smart: 0, ev: 0 };
      p.used = {}; p.got = []; p.maxDepth = 0;
      p.roleLabel = 'かけられる側（' + p.T.label + (p.hf ? '・女性' : '') + '・' + p.M.name + '）';
    });

    function say(p, o, short, force) {
      o.actors = HY ? [p, HY] : [p];
      /* かける側の呼び名が「アキラの元患者」のようなとき、「アキラはアキラの元患者を」→「アキラは自分の元患者を」 */
      if (typeof o.text === 'string') o.text = o.text.replace(new RegExp(p.name + '(は|が|も)' + p.name + '(の|に)', 'g'), p.name + '$1自分$2');
      /* 女性の攻め指定が男性の相手（モブを含む）と：入れる側の書き方を、跨る書き方に直す（pos-fm.js） */
      /* 女性のかける側が男性に跨る組（p.fm）も、残った男性の向きの文を同じように直す（女性の攻めは {h}） */
      if (HK.FM && !HK.SAFE_ON && p.fm && (HY || p.hm) && typeof o.text === 'string') {
        var fps = o.text.split('\n\n');
        fps[0] = HK.FM.fixWith({ pick: function (a) { return ST.pick(S, a); } }, fps[0], HY || p.hm, p.name);
        o.text = fps.join('\n\n');
      }
      if (HK.FM && !HK.SAFE_ON && p.aTop && !p.ff && HK.Pos && HK.Pos.isF(p) && (HY ? !HK.Pos.isF(HY) : !p.hf) && typeof o.text === 'string')
        o.text = (function (ps) {
          /* 段落に分けた山場（solo-thick4.js）は性別に合わせて組んであるので、直すのは最初の段落（暗示の文）だけ */
          ps[0] = HK.FM.fixWith({ pick: function (a) { return ST.pick(S, a); } }, ps[0], p, p.h);
          return ps.join('\n\n');
        })(o.text.split('\n\n'));
      return ST.sayB(S, o, short, force);
    }
    function wake(p) {
      p.woke = true;
      var o = say(p, { tag: '目覚め', text: ST.fmt(ST.pick(S, L('{a}がはっと目を見開いた。目の前に{h}の顔があった。自分の格好を見下ろして、{a}は息を呑んだ。|{a}の瞳に、急に光が戻った。「……え。何、してるの」|{a}は跳ね起きた。体はまだ火照っているのに、頭だけが冷えていた。')), { a: p.name, h: p.h }) + (SM.RESIST_SAY[p.persona] ? p.name + ST.pick(S, SM.RESIST_SAY[p.persona]) : ''), why: '催眠が浅くなって、途中で目を覚ました（深さ ' + Math.round(p.m.depth) + '）', mag: 35 }, '', true);
      ST.key(S, o, p.name + 'が途中で目を覚ました');
      /* エッチな暗示のあとで目を覚ましたなら、そこからも分かれる（流される／通報／逃げる） */
      if (p.cnt.lewd >= 1 && lew !== 'low' && SM.afterSnap && !p.snapDone) {
        p.wokeMid = true; p.snapDone = true;
        var sr = snapThick(S, p, SM.afterSnap(wrapS(S, p), p));
        var o2 = say(p, { tag: sr.tag, text: sr.text, why: sr.why, mag: 40, kind: sr.k === 'swept' ? 'climax' : 'event' }, '', true);
        ST.key(S, o2, p.name + '：' + { swept: '我に返っても流された', report: 'その場で通報した', flee: '逃げ出した' }[sr.k]);
      }
    }
    /* 同じ人の台詞は、一回の結果の中でなるべく繰り返さない */
    function fresh(p, list) {
      var u = p._said = p._said || {}, f = list.filter(function (x) { return !u[x]; });
      var x = ST.pick(S, f.length ? f : list); u[x] = 1; return x;
    }
    function tq(p) { return V && SM.TRANCE[p.persona] && rng() < 0.45 ? p.name + fresh(p, topVoice(p, 'TRANCE', tranceL(p))) : ''; }
    function cmdText(p, g) {
      var c = ST.fmt(ST.pick(S, cmdOf(p, g)), { h: p.h, a: p.name }).replace(/^「|」$/g, '');
      if (!SM.CMD_FRAME) return p.h + 'は' + (S.rng() < 0.5 ? '低い声で' : '耳元で') + '「' + c + '」と囁いた。';
      return ST.fmt(ST.pick(S, SM.CMD_FRAME), { h: p.h, a: p.name }).replace('{c}', c);
    }
    /* 反応の段階（0 抗いながらかかる・1 とろける・2 堕ちる）：快楽堕ちと絶頂の回数で決め、我に返るまでは下げない。
       上がったときは、変わり目が分かる一文（SM.SHIFT）を返す（かけられた側が攻めのときは、段階だけ上げる） */
    function rsUp(p) {
      var r0 = p.rs || 0, n = Math.max(r0, p.m.fall >= 55 || (p.cnt.climax >= 3 && p.m.fall >= 40) ? 2 : 0, p.m.fall >= 25 || p.cnt.climax >= 1 ? 1 : 0);
      if (n <= r0) return '';
      p.rs = n;
      var T = SM.SHIFT && (SM.SHIFT[p.persona] || SM.SHIFT.gentle);
      return T && !p.aTop ? ST.fmt(ST.pick(S, T[n - 1]), { a: p.name, h: p.h }) : '';
    }
    /* うわごと：今の段階の台詞だけ（段階の表がなければ元の表） */
    function tranceL(p) { var TS = SM.TRANCE_ST && SM.TRANCE_ST[p.persona]; return TS ? TS[Math.min(TS.length - 1, p.rs || 0)] : SM.TRANCE[p.persona]; }

    /* ---------- 導入 ---------- */
    ST.step(S, '導入');
    ST.budget(S, 2 * T.length);
    T.forEach(function (p) {
      var v = { a: p.name, h: p.h };
      var t = ST.fmt(ST.pick(S, p.T.intro), v) + (p.consent && SM.CONSENT ? ST.fmt(ST.pick(S, SM.CONSENT), v) : '') + ST.fmt(ST.pick(S, p.M.intro), v);
      say(p, { tag: p.T.label, text: t, why: '催眠をかけるのは' + p.h + '（' + p.T.label + (p.hf ? '・女性' : '') + '）。' + ST.fmt(p.T.motive, v) + (p.consent ? '／始める前に、二人で同意していた（内容のスイッチ「合意のない展開」が切）' : p.noForce ? '／内容のスイッチ「合意のない展開」が切なので、いたずらの暗示だけ' : '') });
      var o = say(p, { tag: '診断', text: p.name + 'のかかりやすさは' + Math.round(p.sus * 100) + '％。弱い暗示は「' + p.weak.map(function (k) { return SM.SUG[k].label; }).join('」「') + '」。', why: 'AC・FCが高いほど、A・CPが低いほどかかりやすい／' + p.M.name + 'との相性・' + p.h + 'への警戒の薄さ・方針「' + p.action.label + '」' }, '', true);
      ST.key(S, o, p.name + 'のかかりやすさ');
    });
    ST.snap(S, keys);

    /* ---------- 誘導 ---------- */
    ST.step(S, '誘導');
    ST.budget(S, Math.max(2, T.length));
    T.forEach(function (p) {
      var v = { a: p.name, h: p.h }, tries = 0;
      while (tries < 3 && p.m.depth < 40) { tries++; p.m.depth = clamp(p.m.depth + 2 + p.sus * 30 + rng() * 14 - p.m.resist * 0.14, 0, 100); }
      p.maxDepth = p.m.depth;
      if (HY) HY.cnt.tries++;
      if (p.m.depth < 40) {
        p.failed = true;
        var o = say(p, { tag: 'かからない', text: ST.fmt(ST.pick(S, SM.INDUCE.fail), v) + (SM.RESIST_SAY[p.persona] ? p.name + ST.pick(S, SM.RESIST_SAY[p.persona]) : ''), why: p.name + 'はかからなかった（深さ ' + Math.round(p.m.depth) + '・三回試した）／警戒心 ' + p.m.resist, mag: 30 }, '', true);
        ST.key(S, o, p.name + 'は催眠にかからなかった');
        return;
      }
      if (HY) HY.cnt.ok++;
      var deep = p.m.depth >= 70;
      say(p, { tag: deep ? '深くかかった' : 'かかった', text: ST.fmt(ST.pick(S, deep ? SM.INDUCE.deep : SM.INDUCE.light), v), why: p.name + 'の深さ ' + Math.round(p.m.depth) + '（' + tries + '回目で）', mag: 20 }, p.name + 'は' + (deep ? '深く' : '') + 'かかった', true);
    });
    ST.snap(S, keys);

    /* ---------- 暗示 ---------- */
    for (var r = 0; r < env.rounds; r++) {
      if (!T.some(function (p) { return !p.failed && !p.woke; })) break;
      ST.step(S, '暗示' + (r + 1));
      S.step = r;
      ST.budget(S, 2);
      T.forEach(function (p) {
        if (p.failed || p.woke) return;
        var v = { a: p.name, h: p.h };
        /* ハプニング */
        if (rng() < env.ev / 100 * 0.45) {
          var e = HK.weighted(rng, SM.EVENTS, function (x) { return (EV_NG[x.id] && (p.aTop || p.noSex) ? 0 : 1) / (1 + (p.used['ev_' + x.id] || 0) * 3) * (x.id === 'battery' && p.mk !== 'app' && p.mk !== 'aroma' ? 0.2 : 1); });
          p.used['ev_' + e.id] = (p.used['ev_' + e.id] || 0) + 1; p.cnt.ev++;
          var fx = e.fx;
          if (fx.depth) p.m.depth = clamp(p.m.depth + fx.depth, 0, 100);
          if (fx.fall) p.m.fall = clamp(p.m.fall + fx.fall, 0, 100);
          if (fx.record) p.recorded = true;
          if (fx.aware) p.halfAware = true;
          if (fx.guilt) p.guilt = true;
          say(p, { tag: 'ハプニング', text: ST.fmt(ST.pick(S, e.t), v), why: fx.depth ? '深さ ' + (fx.depth > 0 ? '+' : '') + fx.depth + '（' + Math.round(p.m.depth) + '）' : '' }, p.name + '：ハプニング');
          if (p.m.depth < 22) return wake(p);
        }
        /* 暗示を選ぶ（腕がいいほど、相手の弱い暗示を見抜く） */
        var ks = Object.keys(SM.SUG).filter(function (k) { return okSug(p, k, env) && (p.used[k] || 0) < 2; });
        if (!ks.length) return;
        var k = HK.weighted(rng, ks, function (k2) {
          var g = SM.SUG[k2];
          return (p.T.pick[k2] || 0.5) * (1 + skill * 2 * Math.max(0, p.aff[k2])) / (1 + (p.used[k2] || 0) * 2) * (g.req <= p.m.depth + 15 ? 1 : 0.35);
        });
        p.used[k] = (p.used[k] || 0) + 1;
        var g = SM.SUG[k];
        var score = p.m.depth - g.req + p.aff[k] * 70 + p.m.fall * 0.25 + (p.stats.sugg || 3) * 3 + rng() * 30 - 15 - p.m.resist * 0.1;
        var res = score >= 8 ? 'full' : score >= -10 ? 'part' : 'ng';
        var t = cmdText(p, g), why = '暗示「' + g.label + '」（必要な深さ ' + g.req + '・今の深さ ' + Math.round(p.m.depth) + '・' + p.name + 'との相性 ' + (p.aff[k] >= 0.15 ? '◎' : p.aff[k] >= 0 ? '○' : '△') + '）';
        var mag = 15;
        if (res === 'ng') {
          p.cnt.ng++; p.m.depth = clamp(p.m.depth - 14 - Math.max(0, -p.aff[k]) * 30, 0, 100); p.m.resist = clamp(p.m.resist + 6, 0, 100);
          /* とろけたあとで拒むときは、はっきり拒む文ではなく、最後の一線で引っかかる文（段階を行き来させない） */
          var late = p.rs >= 1 && SM.RESIST_LATE, RSY = late && SM.RESIST_SAY_LATE ? SM.RESIST_SAY_LATE[p.persona] || SM.RESIST_SAY_LATE.gentle : SM.RESIST_SAY[p.persona];
          t += ST.fmt(ST.pick(S, late ? SM.RESIST_LATE : SM.RESIST), v) + (RSY && rng() < 0.5 ? p.name + ST.pick(S, RSY) : '');
          why += late ? '：その暗示だけは拒んだ' : '：拒んだ';
        } else {
          var full = res === 'full', f = g.fx;
          if (full) { p.cnt.ok++; p.got.push(k); } else p.cnt.part++;
          if (g.lewd) p.cnt.lewd++;
          if (f.smart && full) p.cnt.smart++;
          if (f.shame) p.cnt.shame += f.shame;
          if (f.trig && full) p.trigger = true;
          /* 受け攻め・女性どうし：かけられた側が攻めなら攻めの文、女性どうしなら専用の文（variant） */
          var aTop = p.aTop;
          var vk = full ? (lew === 'low' && g.softFull ? 'softFull' : vkey(p, g, 'full')) : vkey(p, g, 'part');
          var body = ST.pick(S, eL(S, 'sug.' + k + '.' + ekey(p, vk), g[vk]));
          var fb = lew === 'low' && g.lewd && full ? ST.fmt(ST.pick(S, SM.SUG_LOW), v) : eF(S, p, ST.fmt(body, v));
          t += fb;
          t += tq(p);
          p.m.plea = clamp(p.m.plea + (f.plea || 0) * p.sens * (full ? 1 : 0.5), 0, 120);
          p.m.fall = clamp(p.m.fall + (f.fall || 0) * (full ? 1 : 0.45), 0, 100);
          var cl = full ? (f.climax || 0) : 0;
          if (p.m.plea >= 100) { cl++; p.m.plea = 30; }
          /* 小説調の山場：本番の暗示を受け入れて達したときは、段落に分けて厚く（solo-thick4.js） */
          /* 達しなかった本番の暗示でも、ときどき厚くする（そのときは一度達したことにする） */
          /* 描写の長さ「厚く」：盛り上がったとき（二つ目以降のエッチな暗示）は、段落を多く重ねた大きな山場に（solo-saimin-thick.js。R18版だけ） */
          var big = full && g.lewd && SM.bigScene ? SM.bigScene(S, p, fb, vk, cl) : null;
          if (big) { t = t.replace(fb, big); if (!cl) cl = 1; }
          var thick = !big && full && g.lewd && (cl ? rng() < 0.85 : rng() < 0.3) && HK.Thick4 && HK.Thick4.ok(S, lew) ? thickSug(S, p, fb, vk) : null;
          if (thick) { t = t.replace(fb, thick); if (!cl) cl = 1; }
          if (cl) {
            p.cnt.climax += cl; p.m.fall = clamp(p.m.fall + cl * 3, 0, 100);
            /* 男性向けの文：本文に絶頂の喘ぎ（{m2}）がなければ、態度ごとの崩れた声を足す */
            if (lew !== 'low' && eroOn(S) && !aTop) { if (!big && !/\{m2\}/.test(body)) t += p.name + '「' + HK.Ero.moan(S, p, 2) + '」'; }
            else if (!thick && !big && lew !== 'low' && V && V.CLIMAX[p.persona]) t += p.name + (aTop && SM.CLIMAX_TOP ? fresh(p, topVoice(p, 'CLIMAX', [])) : '「' + fresh(p, topL(p, V.CLIMAX[p.persona])) + '」');
            why += '／絶頂 ' + cl + '回';
          }
          p.m.depth = clamp(p.m.depth + (full ? 5 : -5), 0, 100);
          why += full ? '：受け入れた' : '：半分だけ受け入れた';
          /* 中に出された熱で、我に返る（快楽堕ちが進んでいるほど返りにくい） */
          if (full && g.snap && lew !== 'low' && SM.SNAP && rng() < g.snap * (1.2 - p.m.fall / 100)) {
            var snk = p.ff ? (aTop ? 'SNAP_FF_TOP' : 'SNAP_FF') : p.fm && SM.SNAP_FM ? 'SNAP_FM' : aTop && SM.SNAP_TOP_F && HK.Pos && HK.Pos.isF(p) ? 'SNAP_TOP_F' : aTop && SM.SNAP_TOP ? 'SNAP_TOP' : 'SNAP';
            t += eF(S, p, ST.fmt(ST.pick(S, eL(S, snk, SM[snk])), v)) + (SM.RESIST_SAY[p.persona] && rng() < 0.5 ? p.name + ST.pick(S, SM.RESIST_SAY[p.persona]) : '');
            p.woke = true; p.wokeCum = true; p.m.depth = 0; p.aTopLast = aTop;
            why += '／' + snapWord(p) + '催眠が解けた（快楽堕ち ' + Math.round(p.m.fall) + '）';
            mag = 40;
          }
          /* 行為の最中に、ふと我に返る（半分しか効いていないとき・抵抗が強いときほど起きやすく、快楽堕ちが進むほど起きにくい） */
          if (!p.woke && g.lewd && lew !== 'low' && SM.midSnap && SM.midSnapOk(k) && p.cnt.lewd >= 2 && rng() < (0.03 + (full ? 0 : 0.05) + p.m.resist / 1000 + Math.max(0, 40 - p.m.depth) / 500) * (1.1 - p.m.fall / 100)) {
            t += SM.midSnap(wrapS(S, p), p, k);
            p.woke = true; p.wokeMid = true; p.m.depth = 0; p.aTopLast = aTop;
            why += '／行為の最中に我に返った（快楽堕ち ' + Math.round(p.m.fall) + '・抵抗 ' + Math.round(p.m.resist) + '）';
          }
          if (!p.woke) t += rsUp(p);
          mag = p.wokeCum || p.wokeMid ? 40 : full ? (g.lewd ? 30 : 18) : 16;
        }
        p.maxDepth = Math.max(p.maxDepth, p.m.depth);
        var o = say(p, { tag: g.label, text: t, why: why, mag: mag, kind: res === 'full' && g.lewd ? 'climax' : 'event' }, p.name + '×「' + g.label + '」＝' + { full: '受け入れた', part: '半分', ng: '拒んだ' }[res], res === 'full' && (p.cnt.ok === 1 || k === 'buzama' || k === 'smart'));
        if (o && res === 'full' && p.cnt.ok === 1) ST.key(S, o, p.name + 'が最初に受け入れた暗示');
        if (o && (p.wokeCum || p.wokeMid) && !p.snapDone) {
          ST.key(S, o, p.name + (p.wokeMid ? 'が行為の最中に我に返った' : 'が' + snapWord(p) + '我に返った'));
          p.snapDone = true;
          if (SM.afterSnap) {
            var sr = snapThick(S, p, SM.afterSnap(wrapS(S, p), p));
            var o2 = say(p, { tag: sr.tag, text: sr.text, why: sr.why, mag: 40, kind: sr.k === 'swept' ? 'climax' : 'event' }, '', true);
            ST.key(S, o2, p.name + '：' + { swept: '我に返っても流された', report: 'その場で通報した', flee: '逃げ出した' }[sr.k]);
          }
        }
        if (p.m.depth < 22 && !p.wokeCum && !p.wokeMid) wake(p);
      });
      ST.flushShort(S, 'ほかに：');
      ST.snap(S, keys);
    }

    /* ---------- 解除 ---------- */
    if (T.some(function (p) { return !p.failed && !p.woke; })) ST.step(S, '解除');
    ST.budget(S, 2);
    T.forEach(function (p) {
      if (p.failed || p.woke) return;
      var v = { a: p.name, h: p.h };
      var want = env.erase === 'keep' ? 0 : env.erase === 'erase' ? 1 : p.T.erase;
      if (rng() < want) {
        var ok = rng() < p.m.depth / 100 + 0.1;
        p.erased = ok ? 'full' : 'part';
        say(p, { tag: '記憶の消去', text: ST.fmt('{h}は最後に囁いた。「目が覚めたら、今夜のことは全部忘れている」', v) + (ok ? ST.fmt('{a}は静かに目を閉じた。', v) : ST.fmt('{a}のまぶたが、一瞬だけ震えた。', v)), why: ok ? '深さ ' + Math.round(p.m.depth) + '：記憶は消えた' : '深さが足りず、記憶は消えきらなかった' }, p.name + 'の記憶を' + (ok ? '消した' : '消し損ねた'));
      } else {
        say(p, { tag: '解除', text: ST.fmt(ST.pick(S, L('{h}が三つ数えて指を鳴らすと、{a}はゆっくりと目を開けた。|{h}は「はい、おしまい」と手を叩いた。{a}の瞳に、少しずつ光が戻ってきた。|{h}は{a}の額に手を当てて、「起きて」と言った。')), v), why: '記憶は消さなかった' }, p.name + 'の催眠を解いた');
      }
    });
    ST.flushShort(S, 'ほかに：');

    /* ---------- その後 ---------- */
    ST.step(S, 'その後');
    ST.budget(S, 3);
    T.forEach(function (p) {
      var route = after(S, p);
      p.route = route; p.fate = FATE[route];
      var v = { a: p.name, h: p.h };
      var snapK = SM.SNAP_AFTER && ((route === 'report' && p.reportedNow) || (route === 'fall' && p.swept)) ? ((p.ff && SM.SNAP_AFTER_FF && SM.SNAP_AFTER_FF[route]) ? 'SNAP_AFTER_FF' : (p.fm && SM.SNAP_AFTER_FM && SM.SNAP_AFTER_FM[route]) ? 'SNAP_AFTER_FM' : (p.aTop && SM.SNAP_AFTER_TOP && SM.SNAP_AFTER_TOP[route]) ? 'SNAP_AFTER_TOP' : 'SNAP_AFTER') : null;
      /* 性的な暗示を一つも受けていないとき（向きの決まらない組など）は、いたずら向けの「その後」を使う */
      var soft = (lew === 'low' || (!p.failed && !p.cnt.lewd)) && SM.AFTER_SOFT && SM.AFTER_SOFT[route];
      var afK = snapK || (soft ? 'AFTER_SOFT' : (p.aTop && SM.AFTER_TOP && SM.AFTER_TOP[route]) ? 'AFTER_TOP' : 'AFTER');
      /* 男性向けの「その後」は、性的な暗示を受けたときだけ（かからなかった・いたずらだけのときは元の文） */
      var afE = afK === 'AFTER' && p.ff ? 'AFTER_FF' : afK === 'AFTER' && p.fm ? 'AFTER_FM' : afK === 'AFTER' && p.aTop ? 'AFTER_TOP' : afK;
      var afL = !p.failed && p.cnt.lewd && !soft ? eL(S, afE + '.' + route, SM[afK][route]) : SM[afK][route];
      /* 知らない相手・恨みのある相手（ストーカー・恨み）を訴えたときは、共通の友人のいる文を使わない */
      if (soft && route === 'report' && (p.ty === 'stalker' || p.ty === 'grudge') && SM.AFTER_SOFT.reportX) afL = SM.AFTER_SOFT.reportX;
      var t = eF(S, p, ST.fmt(ST.pick(S, afL), v));
      var mood = { angry: 'angry', report: 'angry', revenge: 'angry', counter: 'angry', sweet: 'sweet', couple: 'sweet', fall: 'fall', depend: 'fall', confused: 'confused', dazed: 'dazed', accept: 'accept', body: null }[route];
      if (mood && SM.AFTER_SAY[mood] && SM.AFTER_SAY[mood][p.persona]) t += p.name + ST.pick(S, p.aTop && SM.AFTER_SAY_TOP && SM.AFTER_SAY_TOP[mood] ? (SM.AFTER_SAY_TOP[mood][p.persona] || SM.AFTER_SAY_TOP[mood].gentle) : topL(p, SM.AFTER_SAY[mood][p.persona]));
      /* 完堕ち：描写の長さ「厚く」なら、自分から戻ってきて堕ちきるまでを段落で（solo-saimin-thick.js。R18版だけ） */
      if ((route === 'fall' || route === 'depend') && SM.bigFall) { var bf = SM.bigFall(S, p, route); if (bf) { t += bf; p.bigFell = true; } }
      /* 心の強さが強い人：体が暗示を覚えてしまっても、心は折れない一文を添える */
      if (HK.Attr && p.m.fall >= 40 && route !== 'laugh' && route !== 'noticed') t += HK.Attr.hold(function (l) { return ST.pick(S, l); }, p, 'saimin');
      if (p.trigger && (route === 'forget' || route === 'body') && rng() < 0.6) t += ST.fmt('――数日後、会議中に誰かが何気なく「おやすみ」と言った。{a}は理由も分からないまま、机の下で膝を震わせた。', v);
      var o = say(p, { tag: '結末', text: t, why: whyAfter(p, route), mag: 40 }, '', true);
      ST.key(S, o, p.name + '：' + p.fate);
    });

    /* ---------- 後日談 ---------- */
    /* 数日後の二人：記憶が消えたか（消えた・体だけ覚えている・覚えている・一部だけ欠けている）、二人の関係（恋人・友人や同僚・恨みやストーカー）、
       かけられた人の気質（強気・やわらか・冷静・奔放）と結末で書き分ける。R18版で体の関係に進む組は、solo-saimin-sex.js の SM.epiSex で続きを書く */
    if (SM.EPI) {
      ST.step(S, '後日談');
      ST.budget(S, T.length);
      T.forEach(function (p) {
        var e = epilogue(S, p);
        if (!e) return;
        say(p, { tag: '後日談', text: e.text, why: e.why, mag: e.sex ? 35 : 25, kind: e.sex ? 'climax' : 'event' }, '', true);
      });
    }

    var res = finish(S, input, T, HY);
    return lew === 'low' ? softWords(res) : res;
  }
  /* 描写を「ぼかす」ときは、結果の言葉もやわらかく */
  var SOFTW = [[/快楽堕ち/g, 'ハマり度'], [/快楽に/g, '暗示に'], [/ねだる/g, 'せがむ'], [/快楽/g, '心地よさ'], [/堕ちた/g, 'ハマった'], [/堕ち/g, 'ハマり'], [/快感/g, 'ふわふわ'], [/絶頂/g, '放心']];
  function softWords(o) {
    if (typeof o === 'string') { SOFTW.forEach(function (w) { o = o.replace(w[0], w[1]); }); return o; }
    if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) o[i] = softWords(o[i]); return o; }
    if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { if (k !== 'id' && k !== 'kind' && k !== 'type' && k !== 'color') o[k] = softWords(o[k]); });
    return o;
  }

  /* 受け攻め・女性どうしに合わせた文を選ぶ（なければ null＝その暗示は使わない）。kind: 'full' | 'part'。
     vkey はその文の項目名（'full' / 'fullTop' / 'ff' など）、variant はその文 */
  function first(g, ks) { for (var i = 0; i < ks.length; i++) if (g[ks[i]]) return ks[i]; return null; }
  /* 小説調の山場（solo-thick4.js）：かけられた側が攻めなら {a} が主導、それ以外はかける側が主導。本番の文でなければ厚くしない */
  function thickSug(S, p, fb, vk) {
    var kind = /咥え|口いっぱい|喉の奥/.test(fb) ? 'kneel' : /押し入|貫|沈め|呑み込|跨|奥まで|注ぎ|繋が/.test(fb) ? 'in' : null;
    if (!kind) return null;
    var me = p, hc = p.hc || p.hm || { name: p.h, gender: p.ff || p.hf ? 'f' : 'm' };
    if (p.ff) kind = 'ff';
    var top = /Top/.test(vk) || p.aTop, dom = top ? me : hc, sub = top ? hc : me;
    /* 攻めの {a} が口で奉仕される側なら kneel のまま、{a} が奉仕する文は使わない */
    if (!top && kind === 'kneel' && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(me)) return null;
    return HK.Thick4.scene(S, { dom: dom, sub: sub, kind: kind, lead: fb, sad: HK.Thick4.rollSad(S, dom, sub),
      after: ST.pick(S, ['{a}の目には、まだ暗示の靄がかかっていた。', '自分が何をしたのか、{a}が知るのはもう少しあとのことだ。', '{h}は、まだとろんとしたままの{a}の目を覗き込み、満足げに息をついた。']).replace(/\{a\}/g, p.name).replace(/\{h\}/g, p.h) });
  }
  /* 我に返っても流された場面（afterSnap の swept）も、小説調ならときどき厚く */
  function snapThick(S, p, sr) {
    if (!sr || sr.k !== 'swept' || !HK.Thick4 || !HK.Thick4.ok(S, S.env.lewd || 'mid') || S.rng() > 0.5) return sr;
    var hc = p.hc || p.hm || { name: p.h, gender: p.ff || p.hf ? 'f' : 'm' }, top = p.aTopLast, dom = top ? p : hc, sub = top ? hc : p;
    var sc = HK.Thick4.scene(S, { dom: dom, sub: sub, kind: p.ff ? 'ff' : 'in', lead: sr.text.replace(/[^。」]*「[^」]*」$/, ''), sad: HK.Thick4.rollSad(S, dom, sub),
      after: ST.fmt(ST.pick(S, ['正気のまま流されたことを、{a}はもう言い訳できなかった。', '{a}は天井を見上げたまま、自分の選んだことの重さを噛みしめていた。']), { a: p.name }) });
    if (sc) sr.text = sc;
    return sr;
  }
  function vkey(p, g, kind) {
    /* 女攻め×男（かける側の女性が跨る）：fm / fmPart。元の文がそのまま読める暗示（fmOk）だけ full / part を使い、ほかは選ばない */
    if (p.fm && g.lewd) {
      if (kind === 'part') return g.fmPart ? 'fmPart' : (g.fm || g.fmOk) && g.part ? 'part' : null;
      return g.fm ? 'fm' : g.fmOk && g.full ? 'full' : null;
    }
    if (kind === 'part') {
      if (p.ff && p.aTop) return first(g, ['ffTopPart', 'partTop', 'ffPart', 'part']);
      if (p.ff) return first(g, ['ffPart', 'part']);
      return p.aTop && g.partTop ? 'partTop' : 'part';
    }
    if (!g.lewd) return p.aTop && g.fullTop ? 'fullTop' : 'full';
    if (p.ff) return p.aTop ? (g.ffTop ? 'ffTop' : g.ffOk && g.topOk && g.full ? 'full' : null) : (g.ff ? 'ff' : g.ffOk && g.full ? 'full' : null);
    if (p.aTop) return g.fullTop ? 'fullTop' : g.topOk && g.full ? 'full' : null;
    return 'full';
  }
  function variant(p, g, kind) { var k = vkey(p, g, kind); return k ? g[k] : null; }
  /* ---------- 描写の作風「男性向け」（ero-kit.js・solo-saimin-ero.js） ----------
     元の文を流用した組（女性どうしで full を使う・攻めで full を使う）は、男性向けの文も向きに合わせた項目名で引く（なければ元の文） */
  function eroOn(S) { return !!(HK.Ero && HK.Ero.on(S)); }
  function ekey(p, k) {
    if (p.fm && (k === 'full' || k === 'part')) return k === 'full' ? 'fm' : 'fmPart';
    if (k === 'full' && p.ff) return p.aTop ? 'ffTop' : 'ff';
    if (k === 'full' && p.aTop) return 'fullTop';
    if (k === 'part' && p.ff) return p.aTop ? 'ffTopPart' : 'ffPart';
    if (k === 'part' && p.aTop) return 'partTop';
    return k;
  }
  function eL(S, key, arr) { return HK.Ero ? HK.Ero.L(S, 'saimin', key, arr) : arr; }
  /* {m0}〜{m2} は {a} の喘ぎ、{hm0}〜{hm2} は {h} の喘ぎ（かける側がモブなら穏やかの喘ぎ）、{s:wet} などは擬音。
     かけられた側が攻めでなければ、{h} は主導している側なので、こらえる・とろける段階は拒まない喘ぎ（HK.Ero.moan の eroDom） */
  function eF(S, p, t) {
    if (!eroOn(S)) return t;
    t = String(t).replace(/\{hm([012])\}/g, function (m, n) {
      var q = p.hc || p.hm || { persona: 'gentle' }, d = q.eroDom;
      q.eroDom = !p.aTop && +n < 2;
      var s = HK.Ero.moan(S, q, +n); q.eroDom = d; return s;
    });
    return HK.Ero.fill(S, t, p);
  }
  /* solo-saimin-sex.js の afterSnap / midSnap に渡す道具（男性向けの文に差し替える alt・喘ぎを埋める fmt・絶頂の声 cv） */
  function wrapS(S, p) {
    return { rng: S.rng, pick: function (a) { return ST.pick(S, a); }, fmt: function (t, v) { return eF(S, p, ST.fmt(t, v)); },
      alt: function (key, arr) { return eL(S, key, arr); },
      cv: function (q, top) { return eroOn(S) && !top ? HK.Ero.moan(S, q, 2) : null; } };
  }
  function cmdOf(p, g) { return (p.ff && g.cmdFF) || (p.fm && g.cmdFM) || (p.aTop && g.cmdTop) || g.cmd; }
  /* 自分で攻めを選んだ人の台詞から、受け身の台詞を外す（solo-r18-moan.js の HK.R18M.topLines） */
  function topL(p, list) { return HK.R18M && HK.R18M.topLines ? HK.R18M.topLines(p, list) : list; }
  /* かけられた側が攻め（p.aTop）のときの声：SM.TRANCE_TOP / SM.CLIMAX_TOP（女性どうしは CLIMAX_TOP_FF）。弱気・従順な台詞は使わない */
  function topVoice(p, key, list) {
    if (!p.aTop) return topL(p, list);
    var T = key === 'CLIMAX' && (p.ff || (HK.Pos && HK.Pos.isF && HK.Pos.isF(p))) && SM.CLIMAX_TOP_FF ? SM.CLIMAX_TOP_FF : SM[key + '_TOP'];  /* 女性の攻めには「出る」の声を使わない */
    if (!T) return topL(p, list);
    return Array.isArray(T) ? T : (T[p.persona] || T.gentle);
  }
  /* 我に返ったきっかけの言い方 */
  function snapWord(p) { return p.ff || (p.aTop && HK.Pos && HK.Pos.isF && HK.Pos.isF(p)) ? '達した拍子に' : p.aTop ? '中に注いだ瞬間に' : '中に出された熱で'; }
  /* かけられた側が攻めのとき・向きの決まらない組のときは起こさないハプニング（{h}が{a}に触れる・{a}がねだる） */
  var EV_NG = { beg: 1, mark: 1 };

  function okSug(p, k, env) {
    var g = SM.SUG[k];
    /* 住人どうしで向きの決まらない組には、性的な暗示をかけない */
    if (p.noSex && g.lewd) return false;
    /* 受け攻め・女性どうしに合う文がない暗示は使わない */
    if (env.lewd !== 'low' && g.lewd && !variant(p, g, 'full')) return false;
    if (g.notLover && p.ty === 'lover') return false;
    /* 実際の行為に進む暗示は、エッチな暗示をすでに受け入れたあとだけ */
    if (g.need && ((p.got || []).filter(function (x) { return SM.SUG[x] && SM.SUG[x].lewd; }).length < g.need)) return false;
    if (g.bad && !p.bad) return false;
    /* 描写を「ぼかす」にしたときは、いたずらの暗示と、性的でない暗示だけ */
    if (env.lewd === 'low') return !g.lewd;
    if ((env.mode === 'peace' || p.peaceOnly) && g.lewd) return false;
    if (env.mode === 'lewd' && !g.lewd && !p.noSex) return false;
    if (g.peace && (p.ty === 'grudge' || p.ty === 'stalker') && env.mode !== 'peace') return false;
    if (p.peaceOnly && k === 'freeze') return false;
    return true;
  }

  /* ---------- 後日談 ---------- */
  /* 結末の大きな分け方（後日談の文の表の名前） */
  var EPI_GROUP = { forget: 'erased', body: 'body', angry: 'neg', report: 'report', revenge: 'turn', counter: 'turn', shy: 'neg', confused: 'mid', dazed: 'mid', accept: 'warm', sweet: 'warm', couple: 'couple', peace: 'peace', fall: 'fall', depend: 'depend' };
  /* 気質の見出し（台詞の態度9種とは別に、地の文の振る舞いを分ける） */
  function temperOf(p) {
    var ps = p.persona;
    if (ps === 'proud' || ps === 'stern' || ps === 'tsun') return 'bold';
    if (ps === 'cool') return 'cool';
    if (ps === 'free') return 'free';
    return 'soft';
  }
  /* 地の文の気分（関係・気質の一文と台詞の表）：忘れた・冷えた・揺れている・温かい（頭が良くなっただけのときは、結末の場面だけ） */
  var EPI_MOOD = { erased: 'forgot', body: 'forgot', neg: 'cold', report: 'cold', turn: 'cold', fail: 'cold', mid: 'wobble', warm: 'warm', couple: 'warm', peace: 'peace', fall: 'warm', depend: 'wobble' };
  function epilogue(S, p) {
    var route = p.route, grp = p.failed ? 'fail' : EPI_GROUP[route] || 'neg';
    var rel = p.ty === 'lover' ? 'close' : p.bad ? 'bad' : 'near', tmp = temperOf(p);
    /* かからなかった人：笑い飛ばしたなら「何も変わらない」、怒った・見破った・通報したなら「冷えた」 */
    var mood = p.failed ? (route === 'laugh' ? 'forgot' : 'cold') : EPI_MOOD[grp] || 'cold';
    var v = { a: p.name, h: p.h, place: p.T !== SM.TYPES[p.ty] ? '家' : (SM.PLACE && SM.PLACE[p.ty]) || 'いつもの場所', who: (SM.WHO && SM.WHO[p.ty]) || p.h };
    /* いたずらだけ（性的な暗示を受けていない）・ぼかすときは、いたずら向けの表があればそちら */
    var soft = (S.env.lewd === 'low' || (!p.failed && !p.cnt.lewd)) && SM.EPI_SOFT && SM.EPI_SOFT[grp];
    var lst = soft ? SM.EPI_SOFT[grp] : SM.EPI[grp] || SM.EPI.neg;
    var t = ST.fmt(ST.pick(S, lst), v);
    /* 二人の関係ごとの一文 */
    var RL = SM.EPI_REL && SM.EPI_REL[rel] && SM.EPI_REL[rel][mood];
    if (RL) t += ST.fmt(ST.pick(S, RL), v);
    /* 記憶が一部だけ欠けている（消し損ねた）とき */
    if (p.erased === 'part' && grp !== 'erased' && grp !== 'body' && SM.EPI_PART) t += ST.fmt(ST.pick(S, SM.EPI_PART), v);
    var TT = SM.EPI_TEMPER && SM.EPI_TEMPER[tmp] && SM.EPI_TEMPER[tmp][mood];
    if (TT) t += ST.fmt(ST.pick(S, TT), v);
    var SY = SM.EPI_SAY && SM.EPI_SAY[mood];
    if (SY && SY[p.persona]) t += p.name + ST.pick(S, topL(p, SY[p.persona]));
    var why = (p.failed ? '催眠にかからなかった' : grp === 'erased' || grp === 'body' ? (p.erased === 'full' ? '記憶は消された' : '記憶は消えかけていた') : p.erased === 'part' ? '記憶はところどころ欠けていた' : '記憶は残っていた') +
      '／関係：' + p.T.label + '／気質：' + { bold: '強気', soft: 'やわらか', cool: '冷静', free: '奔放' }[tmp] + '／結末：' + p.fate;
    var sex = false;
    /* R18版：結末が温かい・堕ちた組は、数日後にもう一度（solo-saimin-sex.js） */
    if (SM.epiSex && !soft && !p.failed && !p.noSex && p.cnt.lewd && S.env.lewd !== 'low' && !HK.SAFE_ON) {
      var ex = SM.epiSex(wrapS(S, p), p, route);
      if (ex) { t += '\n\n' + ex.text; why += '／' + ex.why; sex = true; p.cnt.climax += ex.climax || 0; }
    }
    return { text: t, why: why, sex: sex };
  }

  /* ---------- その後の分かれ道 ---------- */
  function after(S, p) {
    var rng = S.rng, t = p.tr, fall = p.m.fall / 100;
    if (p.failed) {
      var w0 = { laugh: t.fc * 0.6 + t.np * 0.3 + (p.ty === 'friend' || p.ty === 'lover' ? 0.4 : 0), noticed: t.a * 0.6 + t.caution * 0.3, angry: t.cp * 0.6 + (p.bad ? 0.3 : 0), report: (t.cp * 0.4 + t.a * 0.4) * (p.ty === 'stalker' ? 1.8 : p.ty === 'grudge' ? 1.3 : 0.5), counter: Math.max(0, t.a + t.cp - t.ac - 0.6) };
      return pickW(rng, w0);
    }
    var lewdN = p.cnt.lewd, remember = p.woke || !p.erased || (p.erased === 'part' && rng() < 0.6);
    if (p.cnt.smart && lewdN === 0) return 'peace';
    if (!remember) return fall >= 0.65 ? 'body' : 'forget';
    var w = {
      angry: (t.cp * 0.6 + (1 - fall) * 0.6 + (p.bad ? 0.3 : 0) - (p.ty === 'lover' ? 0.5 : 0)) * (p.cnt.shame ? 1.3 : 1),
      report: (t.cp * 0.4 + t.a * 0.4) * (1 - fall) * ({ stalker: 1.6, colleague: 1.3, grudge: 1.2, friend: 0.6, lover: 0.08 }[p.ty]) * (p.recorded ? 1.3 : 1),
      revenge: (t.aggr * 0.6 + t.cp * 0.3) * (p.ty === 'grudge' ? 1.5 : p.bad ? 1.1 : 0.6) * (1 - fall * 0.6),
      counter: (t.a * 0.6 + t.cp * 0.3) * (p.woke ? 1.4 : 0.5) * (1 - fall * 0.5),
      sweet: (p.ty === 'lover' ? 1.2 : 0) + (p.ty === 'lover' ? t.np * 0.4 + fall * 0.5 : 0),
      shy: t.ac * 0.7 * (1 - fall * 0.4),
      fall: Math.pow(fall, 2) * 2.2,
      couple: (p.ty === 'friend' || p.ty === 'colleague') && fall > 0.25 && fall < 0.75 ? (t.np + t.fc) * 0.5 : 0,
      depend: p.bad && fall > 0.55 ? fall * 1.3 : 0,
      /* 困惑：怒るでも求めるでもなく、どう受け止めればいいか分からない（AC・NP・慎重さ、ほどほどの堕ち。半分気づいていた・涙が出たときに強まる） */
      confused: (t.ac * 0.35 + t.np * 0.25 + t.caution * 0.2 + Math.max(0, 0.45 - Math.abs(fall - 0.4))) * ({ lover: 0.7, friend: 1.25, colleague: 1.15, grudge: 0.7, stalker: 0.6 }[p.ty] || 1) * (p.halfAware || p.guilt ? 1.3 : 1) * (1 - t.cp * 0.4),
      /* 放心：深くかかって何度も達したあと、心がまだ戻ってこない（絶頂の回数・最大の深さ・堕ち。CPが高いと起きにくい） */
      dazed: ((p.cnt.climax >= 3 ? 0.55 : p.cnt.climax >= 1 ? 0.35 : 0.12) + p.maxDepth / 260 + fall * 0.3) * (1 - t.cp * 0.5) * (p.wokeCum || p.swept ? 1.25 : 1) * (lewdN ? 1 : 0.6),
      /* 受け入れる：戸惑いながらも、相手とされたことを受け止める（NP・FC、相手が恋人・友人、ほどほどの堕ち。恨み・ストーカーには起きにくい） */
      accept: (t.np * 0.45 + t.fc * 0.2 + fall * 0.3 + ({ lover: 0.45, friend: 0.3, colleague: 0.2 }[p.ty] || 0)) * (p.bad ? (fall > 0.5 ? 0.45 : 0) : 1) * (1 - t.cp * 0.4)
    };
    /* 合意の上の催眠プレイ（内容のスイッチ「合意のない展開」が切）：通報・やり返しには寄らず、受け入れる・困惑するに寄る */
    if (p.consent) { w.report *= 0.15; w.angry *= 0.6; w.revenge *= 0.4; w.counter *= 0.5; w.accept *= 1.4; w.confused *= 1.15; }
    if (p.cnt.smart && lewdN <= 1) w.peace = 0.6;
    /* 向きの決まらない組：恋人になる・快楽に堕ちる結末にしない */
    if (p.noSex) { w.couple = 0; w.fall = 0; w.depend = 0; }
    /* 中に出されて我に返ったあと：その場で通報した人は通報、流された人は快楽堕ちへ寄る */
    if (p.reportedNow) return 'report';
    if (p.swept) { w.angry *= 0.15; w.report = 0; w.revenge *= 0.2; w.counter = 0; w.shy *= 0.4; w.fall = w.fall * 2 + 1; if (p.bad) w.depend = (w.depend || 0) + 0.8; w.accept *= 1.3; w.dazed *= 1.2; w.confused *= 0.7; }
    if (p.fled) { w.shy += 0.4; w.angry += 0.2; w.fall *= 0.5; w.sweet *= 0.5; w.confused += 0.3; w.accept *= 0.5; }
    /* 向きの決まらない組・いたずらだけ：体の関係を受け入れる結末にはしない（いたずらとして受け流すのは残す） */
    if (p.noSex && !p.cnt.lewd) w.accept *= 0.6;
    /* 心の強さ（attr.js）：弱い人は堕ちやすく、強い人は体が覚えても心は堕ちない（自分からねだる・離れられない結末にしない） */
    if (HK.Attr && p.will) { var wk = HK.Attr.willK(p); if (wk < 1) { w.fall = 0; w.depend = 0; w.counter *= 1.3; } else if (wk > 1) { w.fall *= wk * wk; if (w.depend) w.depend *= wk; } }
    return pickW(rng, w);
  }
  function pickW(rng, w) {
    var ks = Object.keys(w).filter(function (k) { return w[k] > 0; });
    if (!ks.length) return 'forget';
    return HK.weighted(rng, ks, function (k) { return Math.pow(w[k], 2); });
  }
  function whyAfter(p, route) {
    var t = p.tr, bits = [];
    if (route === 'forget' || route === 'body') bits.push(p.erased === 'full' ? '記憶は消された' : '記憶は消えかけていた');
    else if (p.failed) bits.push('催眠にかからなかった');
    else bits.push(p.woke ? (p.wokeCum || p.wokeMid ? (p.wokeMid ? '行為の最中に我に返った' : snapWord(p) + '我に返った') + (p.swept ? '。それでも流された' : p.reportedNow ? '。その場で通報した' : p.fled ? '。逃げ出した' : '') : '途中で目を覚ました') : p.erased ? '記憶は消えきらなかった' : '記憶は消されなかった');
    bits.push('快楽堕ち ' + Math.round(p.m.fall));
    bits.push({ confused: 'AC・NP・慎重さと、ほどほどの堕ち', dazed: '深さ ' + Math.round(p.maxDepth) + '・絶頂 ' + p.cnt.climax + '回', accept: 'NP・FCと、' + p.T.label + 'への情', angry: 'CP ' + Math.round(p.eg.CP), report: 'CP・A（正義感と冷静さ）', revenge: '攻撃性とCP', counter: 'A・CP（冷静さと意志の強さ）', sweet: '相手が恋人・NP', shy: 'AC ' + Math.round(p.eg.AC), fall: '快楽に呑まれた', couple: 'NP・FCと、ほどよい堕ち', depend: '憎しみと快楽', laugh: 'FC・NP', noticed: 'A・慎重さ', peace: '平和な暗示だけだった', forget: '', body: '体に暗示が残った' }[route] || '');
    if (p.recorded) bits.push('録画されていた');
    if (p.consent) bits.push('合意の上の催眠プレイ');
    return bits.filter(Boolean).join('／');
  }

  /* ---------- 結果 ---------- */
  function finish(S, input, T, HY) {
    T.forEach(function (p) {
      p.notes.push('かけた人：' + p.h + '（' + p.T.label + '・' + p.M.name + '）・かかりやすさ ' + Math.round(p.sus * 100) + '％・最大の深さ ' + Math.round(p.maxDepth));
      if (!p.failed) p.notes.push('受け入れた暗示：' + (p.got.length ? p.got.map(function (k) { return SM.SUG[k].label; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join('・') : 'なし') + '（半分 ' + p.cnt.part + '・拒んだ ' + p.cnt.ng + '）' + (p.cnt.climax ? '・絶頂 ' + p.cnt.climax + '回' : ''));
      p.notes.push('弱い暗示：' + p.weak.map(function (k) { return SM.SUG[k].label; }).join('・') + '・快楽堕ち ' + Math.round(p.m.fall) + (p.trigger ? '・合図の言葉が残った' : '') + (p.recorded ? '・録画された' : ''));
    });
    if (HY) { HY.fate = T.length + '人中' + HY.cnt.ok + '人にかけた'; HY.notes.push('催眠をかけた相手：' + T.map(function (p) { return p.name + '（' + (p.failed ? 'かからず' : p.fate) + '）'; }).join('、')); }
    var one = T.length === 1 ? T[0] : null;
    var hit = T.filter(function (p) { return !p.failed; });
    var ET = SM.END_TITLE || {};
    var title = one ? (one.failed ? one.name + 'は' + one.h + 'の催眠にかからなかった。' : one.name + 'は' + one.h + '（' + one.T.label + '）の催眠にかかった。') + '結末' + (ET[one.route] ? '「' + ET[one.route] + '」' : '') + '：' + one.fate + '。'
      : '催眠にかかったのは' + T.length + '人中' + hit.length + '人。' + T.map(function (p) { return p.name + '＝' + p.fate; }).join('、') + '。';
    var lines = T.map(function (p) { return p.name + '：' + p.h + '（' + p.T.label + '）に' + p.M.name + 'で――' + (p.failed ? 'かからなかった' : '最大の深さ ' + Math.round(p.maxDepth) + '・暗示 ' + p.cnt.ok + '/' + (p.cnt.ok + p.cnt.part + p.cnt.ng)) + '→' + p.fate; });
    var top = hit.slice().sort(function (a, b) { return b.m.fall - a.m.fall; })[0];
    if (top && T.length > 1) lines.push('いちばん堕ちたのは' + top.name + '（快楽堕ち ' + Math.round(top.m.fall) + '）');
    var rows = T.slice().sort(function (a, b) { return b.maxDepth - a.maxDepth; }).map(function (p) {
      return { i: p.i, rank: '', cells: [p.T.label, p.M.name, Math.round(p.sus * 100) + '％', String(Math.round(p.maxDepth)), p.failed ? '—' : p.cnt.ok + '/' + (p.cnt.ok + p.cnt.part + p.cnt.ng), String(p.cnt.climax), String(Math.round(p.m.fall)), p.fate] };
    });
    var sumOk = T.reduce(function (s, p) { return s + p.cnt.ok; }, 0), sumCl = T.reduce(function (s, p) { return s + p.cnt.climax; }, 0);
    return ST.result(S, input, {
      ending: { title: title, kind: hit.length ? 'over' : 'ok', lines: lines },
      estats: one ? [['かかりやすさ', Math.round(one.sus * 100) + '％'], ['最大の深さ', String(Math.round(one.maxDepth))], ['受け入れた暗示', one.cnt.ok + '個'], ['絶頂', one.cnt.climax + '回']] : [['かかった人', hit.length + '/' + T.length + '人'], ['受け入れた暗示', sumOk + '個'], ['絶頂', sumCl + '回'], ['いちばん堕ちた', top ? top.name : '—']],
      table: { title: '催眠の結果', hint: '深さ40でかかり、70で深くかかる。暗示は「受け入れた／全部」。快楽堕ちが高いほど、終わったあとに怒るより求めてしまう。', cols: ['かけた人', 'かけ方', 'かかりやすさ', '最大の深さ', '暗示', '絶頂', '堕ち', '結末'], rows: rows },
      meters: [{ label: '深さ', color: '--accent' }, { label: '快感', color: '--pine', dash: true }, { label: '快楽堕ち', color: '--love' }, { label: '警戒心', color: '--warn', dash: true }],
      meta: T.map(function (p) { return p.T.label; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join('・') + '・暗示' + S.env.rounds + '回',
      summary: '催眠：' + T.map(function (p) { return p.name + '=' + p.fate; }).join('、')
    });
  }
})();
