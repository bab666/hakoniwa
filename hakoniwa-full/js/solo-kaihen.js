/* 箱庭シミュレーター: 常識改変（R18）
   エロいことが「当たり前の仕事」になった世界。理性的な人ほど、真面目に施す側として働いている。
   何をするのか、違和感に気づくのか、気づいたらどうするのかを、一日の営業を通して見る */
(function () {
  'use strict';
  /* 同じ結果の中で、同じ文・台詞を繰り返さない：まだ使っていない文から選び、使い切ったら、いちばん前に使った文から戻す */
  function pkF(S, arr) {
    if (!arr || !arr.length) return window.HK.Story.pick(S, arr);
    var m = S._pkLru = S._pkLru || { n: 0, at: {} }, best = [], bv = Infinity;
    for (var i = 0; i < arr.length; i++) {
      var a = typeof arr[i] === 'string' ? (m.at['$' + arr[i]] || 0) : 0;
      if (a < bv) { bv = a; best = [arr[i]]; } else if (a === bv) best.push(arr[i]);
    }
    var x = best[S.rng.int(best.length)];
    if (typeof x === 'string') m.at['$' + x] = ++m.n;
    return x;
  }
  var HK = window.HK, KH = HK.KAIHEN, ST = HK.Story, clamp = HK.clamp;
  var VO = KH && KH.VOICE;
  function L(s) { return s.split('|'); }

  var scen = {
    id: 'kaihen', name: '常識改変', kicker: '1〜6人・R18', solo: true, maxCast: 6, minCast: 1,
    desc: 'エロいことが当たり前の仕事になった世界。搾精クリニック・おもてなしホテル・福利厚生の会社・洗い屋の銭湯・搾精ジム・満員の客席の前で見せる公開施術の舞台で、理性的な人ほど真面目に「施す側」として働く。何をするのか、体の違和感に気づくのか。ひとりだけ正気の人を混ぜることもできる。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: 'コマ', simulate: function (input) { return run(input); },
    castHint: '1〜6人。「おまかせ」なら、理性的な人（A・CPが高い）ほど施す側になり、残りは客として通います。「正気のまま紛れ込む」を選ぶか、設定の「正気の人」で「片方だけ正気」「複数人が正気」を選ぶと、改変されていない人が混ざります。',
    env: [
      { id: 'sit', label: '舞台', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'clinic', label: '搾精クリニック（医師と患者）' }, { v: 'hotel', label: '特別おもてなしホテル（客室係と宿泊客）' }, { v: 'office', label: '福利厚生の手厚い会社（処理当番と社員）' }, { v: 'spa', label: '洗い屋のいる銭湯（洗い屋と入浴客）' }, { v: 'gym', label: '搾精トレーニングジム（トレーナーと会員）' }, { v: 'stage', label: '公開施術の舞台（演者と志願者・満員の客席の前で）' }] },
      { id: 'sane', label: '正気の人', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }, { v: 'none', label: '全員改変されている' }, { v: 'one', label: '片方だけ正気（ひとりだけ）' }, { v: 'multi', label: '複数人が正気（3人以上のとき）' }], desc: '正気の人だけが、まわり（客・観客・ほかの住人）の当たり前をおかしいと分かっている。態度ごとに、気づく・止めようとする・流されていく。おまかせは、公開施術の舞台で2人以上のときだけ半々でひとりを正気にする。役割で選んだ人はその役割のまま（「正気のまま紛れ込む」を選んだ人は、どの設定でも正気）。複数人は3人以上のとき（2人以下ならひとり）' },
      { id: 'depth', label: '改変の強さ', min: 0, max: 100, def: 60, lo: 'ほころびだらけ', hi: '完璧', desc: '強いほど違和感に気づきにくい。弱いと、理性的な人ほどすぐに気づく' },
      { id: 'wear', label: '改変が解ける', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（改変が弱いほど解けやすい）' }, { v: 'off', label: '解けない' }, { v: 'on', label: '営業のあとに解ける' }], desc: '営業のあとに改変が解けると、住人それぞれが我に返る。怒って背を向けるだけでなく、困惑する・放心する・受け入れる人もいる（態度・改変度・どれだけ気持ちよかったか・最後まで正気だったかで決まる）。解けない回でも、途中で正気に戻った人と正気の人は、その夜に今日を振り返る' },
      { id: 'slots', label: '営業時間', min: 4, max: 16, def: 9, lo: '4時間', hi: '16時間', unit: '時間' },
      { id: 'mob', label: 'モブ（ほかの客・上司など）', type: 'select', def: 'on', options: [{ v: 'on', label: 'あり' }, { v: 'off', label: 'なし（登場キャラだけ）' }], desc: '「なし」にすると、登場キャラどうしだけで施術が進む（ほかの客・上司・同僚・新人などは出てこない）。2人以上で使うのがおすすめ' },
      { id: 'npc', label: '客の多さ', min: 0, max: 100, def: 60, lo: '閑散', hi: '大繁盛', desc: 'モブの客がどれくらい来るか。0にするとモブの客は来ず、登場キャラどうしで施術する（上司・同僚などのモブは出る）。モブなしのときは使わない' },
      { id: 'ev', label: 'ハプニングの頻度', min: 0, max: 100, def: 60, lo: 'たまに', hi: '毎時間' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'ぼかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ],
    stats: [{ id: 'sens', label: '感じやすさ', desc: '高いほど施しながら自分も昂り、体の違和感に気づきやすい' }],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（理性的な人ほど施す側）', options: [{ id: 'giver', label: '施す側（改変されて働く）' }, { id: 'taker', label: '受ける側（客として通う）' }, { id: 'out', label: '正気のまま紛れ込む' }] }],
    actions: [
      { id: 'care', label: '丁寧に施す', fit: function (t) { return t.np * 0.6 + t.ac * 0.4; } },
      { id: 'fast', label: '効率よくこなす', fit: function (t) { return t.a * 0.6 + t.cp * 0.4; } },
      { id: 'bold', label: '大胆に攻める', fit: function (t) { return t.fc * 0.6 + t.impulse * 0.4; } }
    ],
    goals: [
      { id: 'top', label: '成績トップを目指す', fit: function (t) { return t.cp * 0.5 + t.lead * 0.5; } },
      { id: 'normal', label: '普通に働く', fit: function (t) { return t.ac * 0.6 + t.caution * 0.4; } },
      { id: 'odd', label: '何かがおかしい気がする', fit: function (t) { return t.a * 0.7 + (1 - t.ac) * 0.3; } }
    ],
    events: []
  };
  /* 描写の作風（小説調／男性向け）：ero-kit.js があるとき（R18版）だけ */
  if (HK.Ero) scen.env.push(HK.Ero.OPT);
  HK.SCENARIOS.kaihen = scen;
  HK.SCEN_ORDER.push('kaihen');

  var START = { clinic: 9, hotel: 15, office: 9, spa: 14, gym: 10, stage: 13 };
  var ROLE = { giver: '施す側', taker: '受ける側', out: '正気の人' };

  function resolve(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }

  function run(input) {
    var S = ST.state(input, 'kaihen'), rng = S.rng, env = S.env, P = S.P;
    var sid = env.sit === 'random' || !KH.SIT[env.sit] ? rng.pick(Object.keys(KH.SIT)) : env.sit, SIT = KH.SIT[sid];
    var place = rng.pick(SIT.place), lew = env.lewd || 'mid', depth = env.depth / 100;
    S.v = { place: place, boss: SIT.boss, sid: sid };
    S.noMob = env.mob === 'off';
    S.noGuest = S.noMob || +env.npc <= 0;   /* 客の多さ0：モブの客は来ない（上司・同僚などのモブは出る） */
    if (S.noMob) S.textFilter = function (t) { return dropMob(S, t); };
    /* 役割 */
    var order = P.slice().sort(function (a, b) { return (b.eg.A + b.eg.CP) - (a.eg.A + a.eg.CP); });
    var nG = P.length === 1 ? 1 : Math.ceil(P.length / 2);
    var pkOf = function (p) { var pk = (input.perChar && input.perChar[p.i] && input.perChar[p.i].pick || {}).role; return pk && ROLE[pk] ? pk : ''; };
    /* 正気の人（設定「正気の人」）：役割を自分で選んでいない人から、施す側になりにくい人（A・CPが低い人）を正気にする。
       2人以上のときは、施す側を少なくとも一人残す。役割で「正気のまま紛れ込む」を選んだ人は、どの設定でも正気 */
    var saneMode = env.sane || 'auto', saneSet = [];
    if (saneMode === 'auto') saneMode = sid === 'stage' && P.length >= 2 && !P.some(function (p) { return pkOf(p) === 'out'; }) && rng() < 0.5 ? 'one' : 'none';
    S.saneMode = saneMode;
    if (saneMode === 'one' || saneMode === 'multi') {
      var want = saneMode === 'multi' && P.length >= 3 ? clamp(Math.floor(P.length / 2), 2, P.length - 1) : 1;
      var free = order.filter(function (p) { return !pkOf(p); }).reverse();
      var keepG = P.length >= 2 && !P.some(function (p) { return pkOf(p) === 'giver'; }) ? 1 : 0;
      var need = Math.min(want - P.filter(function (p) { return pkOf(p) === 'out'; }).length, free.length - keepG);
      saneSet = need > 0 ? free.slice(0, need) : [];
    }
    var rest = order.filter(function (p) { return saneSet.indexOf(p) < 0; }), nG2 = rest.length <= 1 ? 1 : Math.ceil(rest.length / 2);
    P.forEach(function (p) {
      var pk = pkOf(p);
      p.role = pk || (saneSet.indexOf(p) >= 0 ? 'out' : (saneSet.length ? rest.indexOf(p) < nG2 : order.indexOf(p) < nG) ? 'giver' : 'taker');
      p.saneBy = !pk && p.role === 'out';
      p.roleLabel = p.role === 'giver' ? SIT.giver : p.role === 'taker' ? SIT.taker : sid === 'stage' ? '正気のままの観客' : p.saneBy ? '正気のままの' + SIT.taker : '正気のまま紛れ込んだ人';
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      var sens = p.stats.sens || 3;
      p.sens = 0.6 + sens * 0.18;
      p.m = { imm: p.role === 'out' ? 0 : clamp(depth * 70 + p.tr.ac * 15 + (1 - p.tr.a) * 10, 5, 95), doubt: p.role === 'out' ? 75 : clamp(p.tr.a * 12 + (1 - depth) * 25 + (p.goal.id === 'odd' ? 15 : 0), 0, 60), plea: 0, sem: 0 };
      /* 違和感の伸びやすさ：理性的（A・CP）ほど、改変が弱いほど、気づきやすい */
      p.doubtRate = (0.35 + p.tr.a * 0.9 + p.tr.cp * 0.35 - p.tr.ac * 0.2) * (1.35 - depth);
      /* 心の強さ（attr.js）：弱い人は違和感が育ちにくく、強い人は育ちやすい */
      if (HK.Attr) p.doubtRate *= 2 - HK.Attr.willK(p);
      p.cnt = { served: 0, climax: 0, gclimax: 0, glitch: 0, body: 0, awake: 0, reset: 0, acts: {}, notice: 0, stop: 0, swept: 0 };
      p.usedActs = [];
    });
    var gs = function () { return P.filter(function (p) { return p.role === 'giver' && !p.quit; }); };
    var keys = ['imm', 'doubt', 'plea', 'sem'];

    /* ---------- 開店 ---------- */
    ST.step(S, '開店前');
    ST.say(S, { kind: 'phase', text: '舞台は「' + place + '」（' + SIT.name + '）。' + SIT.world });
    P.forEach(function (p) {
      var t;
      if (p.role === 'giver') t = ST.fmt(pkF(S, SIT.intro), { p: p.name });
      else if (p.role === 'taker') t = SIT.takerIntro ? ST.fmt(pkF(S, nm(S, SIT.takerIntro)), { r: p.name, place: place }) : ST.fmt(pkF(S, ['{r}は今日、{place}に{u}の予約を入れていた。', '{r}の手帳の今日の欄には、「{place}・{u}」とだけ書いてあった。', '{r}は昼休みのうちに、{place}の{u}の枠をひとつ押さえていた。', '{r}は{place}の受付で名前を告げ、「今日の{u}で予約しています」と言った。', '{r}は予約の時刻より少し早く{place}に着き、待合の長椅子に腰かけた。', '{r}は{place}の予約票をポケットの中で握りしめたまま、順番を待っていた。', '{r}は前回の{u}の控えを財布から出して、{place}の受付に差し出した。', '{r}は{place}の看板を見上げて、今日の{u}の時刻をもう一度確かめた。']), { r: p.name, place: place, u: SIT.unit }) + pkF(S, ['いつもの習慣だ。', '月に一度の楽しみだった。', '同僚に勧められて、初めて来た。', '前回の担当が忘れられなかった。']);
      else t = ST.fmt(pkF(S, nm(S, outPool(SIT, 'see'))), { o: p.name });
      ST.say(S, { actors: [p], tag: p.roleLabel, text: t, why: p.role === 'giver' ? '理性的な気質（A ' + Math.round(p.eg.A) + '・CP ' + Math.round(p.eg.CP) + '）ほど、改変された世界では真面目な「' + SIT.giver + '」になる' : p.role === 'out' ? p.name + 'だけは改変されていない' + (p.saneBy ? '（設定「正気の人」：' + (saneMode === 'multi' ? '複数人が正気' : '片方だけ正気') + (env.sane === 'auto' ? '。おまかせで決まった' : '') + '）' : '') : '' });
    });
    ST.snap(S, keys);

    /* ---------- 営業 ---------- */
    for (var s = 0; s < env.slots; s++) {
      var h = START[sid] + s;
      ST.step(S, (h % 24) + ':00');
      S.step = s;
      ST.budget(S, 1);
      var takersFree = P.filter(function (p) { return p.role === 'taker' && !p.quit; });
      /* ハプニング */
      if (rng() < env.ev / 100 * 0.6) happen(S, SIT);
      gs().forEach(function (g) {
        var r = null;
        /* 住人どうしの施術は、向きの決まる組（HK.Pos.okSex）だけ */
        var tf = takersFree.filter(function (x) { return x.cnt.served < 3 + (x.tr.fc > 0.6 ? 1 : 0) && okPair(g, x); });
        if (tf.length && rng() < 0.45) { r = rng.pick(tf); takersFree.splice(takersFree.indexOf(r), 1); }
        /* 正気のまま紛れ込んだ人を無理やり施術台に乗せる場面：自分で攻めを選んだ人は標的にしない */
        var outs = P.filter(function (p) { return p.role === 'out' && !p.fled && !p.sunk && okPair(g, p) && !(HK.Pos && HK.Pos.hardTop(p, g)); });
        /* 衆人環視の舞台では、正気の人が「志願者」として壇上に上げられやすい */
        if (!r && outs.length && rng() < (sid === 'stage' ? 0.45 : 0.3)) r = rng.pick(outs);
        /* 施す側が性行為の相手を「固定した相手だけ」にしている（engine.js の noMob）：モブの客は取らず、モブなしと同じく登場キャラの中から（いなければ空き時間） */
        if (!r && (S.noGuest || g.noMob)) {
          /* モブの客を取らない人は、半分は空き時間（同じ相手との施術ばかりが続かないように） */
          if (!S.noGuest && rng() < 0.5) return idle(S, g, SIT);
          /* モブなし：登場キャラの中から相手を選ぶ（受ける側→正気の人→ほかの施す側を練習台に） */
          var tk = P.filter(function (x) { return x.role === 'taker' && !x.quit && takersFree.indexOf(x) >= 0 && okPair(g, x); });
          var mates = P.filter(function (x) { return x !== g && x.role === 'giver' && !x.quit && okPair(g, x); });
          r = tk.length ? rng.pick(tk) : outs.length && rng() < 0.6 ? rng.pick(outs) : mates.length && rng() < 0.5 ? rng.pick(mates) : null;
          if (r && takersFree.indexOf(r) >= 0) takersFree.splice(takersFree.indexOf(r), 1);
          if (!r) return idle(S, g, SIT);
        }
        if (!r && rng() > 0.25 + env.npc / 100 * 0.7) return idle(S, g, SIT);
        serve(S, SIT, g, r, lew);
      });
      /* 客の側の気づき・正気の人 */
      P.forEach(function (p) {
        if (p.role === 'out' && !p.fled && !p.sunk) outsider(S, SIT, p);
        if (!p.quit && p.role !== 'out') check(S, SIT, p);
        p.m.doubt = clamp(p.m.doubt, 0, 100); p.m.imm = clamp(p.m.imm, 0, 100); p.m.plea = clamp(p.m.plea, 0, 100);
        /* 結末（我に返ったあと）のために、いちばん深かった改変度・いちばん昂ったところを覚えておく */
        p.immPk = Math.max(p.immPk || 0, p.m.imm); p.pleaPk = Math.max(p.pleaPk || 0, p.m.plea);
      });
      ST.flushShort(S, 'ほかに：');
      ST.snap(S, keys);
    }
    return finish(S, input, SIT, place, sid);
  }

  /* ---------- 施術 ---------- */
  /* 住人どうしの施術：向きの決まる組（HK.Pos.okSex）で、恋愛・R18にしない組・性行為の相手の固定の外・同じ人の恋人どうし（HK.ngPair・HK.sexBlocked）でないこと */
  function okPair(a, b) { return (!HK.Pos || HK.Pos.okSex(a, b)) && !(HK.ngPair && HK.ngPair(a, b)) && !(HK.sexBlocked && HK.sexBlocked(a, b)); }
  /* 自分で攻めを選んだ人の喘ぎ・絶頂の声から、受け身の台詞を外す */
  function topL(p, list) { return HK.R18M && HK.R18M.topLines ? HK.R18M.topLines(p, list) : list; }
  /* 小説調の果てる声：喘ぎの辞書（moan-engine.js の HK.Moan.say の小説調）から。元の表（Voice.CLIMAX。攻めを選んだ人は受け身の台詞を外したもの）も4割ほど残る */
  function nClimax(S, who) {
    var l = topL(who, HK.Voice.CLIMAX[who.persona]), old = function () { return pkF(S, l); };
    return who.name + '「' + (HK.Moan && HK.Moan.say ? HK.Moan.say(S, who, 'climax', { novel: true }, old) : old()) + '」';
  }
  /* 描写の作風「男性向け」（solo-kaihen-ero.js）。「ぼかす」のとき・小説調のとき・書き下ろしのないときは元の文 */
  function eOn(S) { return !!(HK.Ero && HK.Ero.on(S) && S.env.lewd !== 'low'); }
  function E(S, key, base) { return eOn(S) && HK.Ero.has('kaihen', key) ? HK.Ero.T.kaihen[key] : base; }
  /* 喘ぎ：自分で攻めを選んだ人には、受け身の喘ぎを言わせない。モブの客は、気質をくじで決める */
  var NPC_PS = ['proud', 'free', 'cool', 'gentle', 'stern'];
  /* モブの客の声は、住人の受けの喘ぎではなくモブの声（moan-mob.js の HK.Moan.mob：客・奉仕を受ける側） */
  function npcWho(S) { return { npc: true, persona: S.rng.pick(NPC_PS), gender: 'm', mobRole: 'guest', mobTop: 'serv' }; }
  function emoan(S, who, n) {
    var m = HK.Ero.moan(S, who, n);
    if (!who || who.npc) return m;
    /* 自分で攻めを選んだ人は、♡で崩れる受け身の喘ぎではなく、攻めの声 */
    /* 攻めの声は、地の文の攻めの声（moanTop を pkF で引く所）と同じ覚えから引く（一つの場面で同じ声が二度出ないように） */
    if (HK.Pos && HK.Pos.hardTopNpc(who) && HK.Ero.has('kaihen', 'moanTop.' + n)) return pkF(S, HK.Ero.T.kaihen['moanTop.' + n]);
    for (var i = 0; i < 6; i++) { var l = topL(who, [m]); if (l.length === 1 && l[0] === m) return m; m = HK.Ero.moan(S, who, n); }
    return S.rng.pick(topL(who, [m]));
  }
  /* {mp0}〜{mp2}＝施す側、{mr0}〜{mr2}＝受ける側の喘ぎ。擬音（{s:…}）も埋める */
  /* pw：施す側が住人でないとき（舞台のモブの演者）の声の主 */
  function ef(S, t, g, rw, pw) {
    if (!eOn(S) || !t) return t;
    /* 施す側の絶頂の声は、一つの場面で一度だけ（絶頂の文と「自分も達した」の文で二重にならないように） */
    if (g && g.name) { var nmp = 0; t = t.split(g.name + '「{mp2}」').map(function (x, i) { return i === 0 ? x : (nmp++ ? '' : g.name + '「{mp2}」') + x; }).join(''); }
    t = t.replace(/\{mp([012])\}/g, function (m, n) { return emoan(S, g || pw, +n); }).replace(/\{mr([012])\}/g, function (m, n) { return emoan(S, rw || npcWho(S), +n); });
    return HK.Ero.fill(S, t, g);
  }
  /* 攻めの施す側には回さない施術（{p} の体に指を入れられる）／攻めの受ける側には回さない施術（{r} の中に指を入れる・機械に搾られる・押さえつけて責める） */
  var G_RECV = { '壺洗い': 1 };
  /* 施す側の昂りの段階（0 業務の顔のまま／1 声と手つきが揺らぎはじめる／2 業務の顔が崩れた）。
     快感の値から決め、いったん上がった段階はその日のうちは下げない（自分も達して快感の値が下がっても、崩れた顔は戻らない）。
     上がった回は、変わり目の一文を施術の終わりに足す。事後の一文・攻めの喘ぎも、この段階に合わせる */
  var HEAT_UP = {
    1: L('{p}の声から、いつもの事務的な平板さが少しずつ抜けはじめていた。本人だけが、まだそれに気づいていない。|手順はいつもどおりのはずなのに、{p}の指先には妙な熱がこもっていた。カルテに向かう背中が、ほんの少しだけ丸まっている。|{p}は何度か、自分の脚をそっと閉じ直した。施すたびに、体の奥へ何かが溜まっていく。|業務用の笑顔の端が、ときどき甘くほどけた。{p}はそれを、疲れのせいだと思うことにした。'),
    2: L('{p}の業務の顔は、とうとう崩れていた。手を洗っても、太腿の内側の震えが止まらない。|次の予約表を見る{p}の目は、もう潤んでいた。施す側でいるはずの体が、自分も触れられるのを待っている。|{p}は記録用紙にペンを走らせながら、自分の息が甘く乱れたままなのに気づいた。もう、平静な声には戻れそうになかった。|一度崩れた手つきは、元に戻らなかった。{p}は客の熱に触れるたび、自分の腰まで勝手に揺れるようになっていた。')
  };
  /* 厚い山場の締め（採取量の記録）：段階ごと */
  var HEAT_AFTER = [
    L('{p}は乱れた呼吸のまま、カルテに「{ml}ml」と書き込んだ。|{p}は容器の目盛りを確かめた。――{ml}ml。いつもどおりの、業務の一件だった。|「{ml}ml。……お疲れさまでした」{p}はそう言って、何事もなかったように手を洗った。|{p}は手袋を外して丸め、「{ml}mlです。記録しておきますね」と事務的に告げた。|{p}は数値を読み上げた。「{ml}ml、規定どおりです」――声には、もう乱れがなかった。'),
    L('{p}は「{ml}ml」と書こうとして、一度ペンを取り落とした。拾い上げる指先が、まだ熱かった。|{p}は容器の目盛りを読んだ。{ml}ml。いつもの数字のはずなのに、読み上げる声が少しだけ掠れていた。|「{ml}ml、です」{p}はそう告げてから、額の汗を手の甲で拭った。業務の一件にしては、息が上がりすぎていた。|{p}は記録を書き終えると、しばらく流しの縁に手をついていた。{ml}ml。体のほうが、その数字を覚えていた。'),
    L('{p}はカルテに{ml}mlと書き込んだが、文字が震えていた。脚の間が、まだ熱く疼いていた。|「{ml}ml……っ、です」{p}の声は、すっかり甘く崩れていた。手を洗う指が、なかなか止まらなかった。|{p}は容器を置くと、施術台の縁にもたれかかった。{ml}ml。数えたのは、客のぶんだけではなかった気がした。|記録用紙の{ml}mlの文字は、ひどく歪んでいた。{p}は書き直そうとして、やめた。もう、まともな字は書けそうになかった。')
  ];
  /* 気づいたうえで続けると決めた人の心の声（「仕事なのに」と迷う声は、もう使わない） */
  var INNER_ACCEPT = L('（おかしいのは知ってる。知ってて、次の予約も入れた）|（これが普通じゃないことくらい、分かってる。……分かってるから、気持ちいい）|（もう、言い訳は探さない。仕事ってことにしておけば、いくらでもできる）|（止める理由なら、さっきまでいくつもあった。全部、どこかへ行った）');
  function heat(S, g) {
    var raw = g.m.plea < 35 ? 0 : g.m.plea < 70 ? 1 : 2, old = g.hs || 0;
    if (g.accepted && raw < 1) raw = 1;
    if (raw > old) g.hs = raw;
    if (HK._rxT) HK._rxT.push({ sc: 'kaihen', k: 'heat', who: g.name, raw: g.m.plea < 35 ? 0 : g.m.plea < 70 ? 1 : 2, st: g.hs || 0 });
    return raw > old ? raw : 0;
  }
  function heatUp(S, g) { var up = heat(S, g); return up ? ST.fmt(pkF(S, HEAT_UP[up]), { p: g.name }) : ''; }
  /* 心の声：迷う声／気づいたうえで続ける声 */
  function innerOf(S, g, top) {
    if (HK._rxT) HK._rxT.push({ sc: 'kaihen', k: 'inner', who: g.name, acc: !!g.accepted });
    return g.accepted ? INNER_ACCEPT : top ? E(S, 'innerTop', KH.INNER_TOP) : E(S, 'inner', KH.INNER);
  }
  var R_RECV = { '前立腺マッサージ': 1, 'ストレッチ': 1, '触診（全身）': 1 };
  function serve(S, SIT, g, r, lew) {
    var actAt = -1, actLead = '';
    /* 受ける側が女性なら、男性器を前提にした採取の手順は使えない（施す側が男性でも、女性どうしと同じ手順に） */
    if (r && HK.Pos && KH.FF_ACTS && (HK.Pos.ff(g, r) || HK.Pos.isF(r))) return serveFF(S, SIT, g, r, lew);
    var rng = S.rng, npc = !r, rname = npc ? rng.pick(SIT.npc) : r.name, ero = eOn(S), rw = r || npcWho(S);
    if (ero) lew = 'high';
    /* 受け攻め：施す側が攻めなら「攻めの施術」だけ、受けなら「受け入れる施術」だけを使う */
    var Pz = HK.Pos, gTop = false, gFree = false;
    if (Pz) {
      if (r) { gTop = Pz.order(g, r, [r, g])[0] === g; gFree = !Pz.fixed(g, r); }
      else { var vp = Pz.vsNpc(g, ''); gTop = vp === 'top'; gFree = Pz.of(g) === 'riba'; }
    }
    /* 施す側が女性なら、攻めの施術は女性上位（跨る）のものにする */
    var gF = !!(Pz && Pz.isF(g)), TA = gF && KH.TOP_ACTS_F ? KH.TOP_ACTS_F : KH.TOP_ACTS;
    var climaxOf = function (kind) { var k2 = kind === 'top' && gF && KH.CLIMAX.topF ? 'topF' : kind; return E(S, 'climax.' + k2, KH.CLIMAX[k2]); };
    var pool = SIT.acts.concat((TA && TA[S.v.sid]) || []).filter(function (a) {
      var kd = KH.ACTKIND[a[0]];
      if (mobby(S, a[0])) return false;
      if (gFree) return true;
      /* 施す側が攻め：受け入れる施術・口や顔で受け止める施術はしない。受ける側（住人）が攻め：責められる・搾られる施術はしない */
      if (gTop) return kd !== 'in' && kd !== 'mouth' && kd !== 'face' && !G_RECV[a[0]];
      if (r && (kd === 'machine' || R_RECV[a[0]])) return false;
      return kd !== 'top';
    });
    var idx = HK.weighted(rng, pool, function (a, i) {
      var w = 1 / (1 + (g.cnt.acts[a[0]] || 0) * 1.5);
      var hard = KH.ACTKIND[a[0]] === 'in' || KH.ACTKIND[a[0]] === 'top' ? 1 : 0;
      if (gTop && KH.ACTKIND[a[0]] === 'top') w *= 1.6;
      if (g.action.id === 'bold') w *= 0.7 + hard * 0.8;
      if (g.action.id === 'care') w *= 1.3 - hard * 0.5;
      return w;
    });
    var act = idx, ai = Math.max(0, pool.indexOf(act)) % Math.max(1, SIT.acts.length);
    g.cnt.acts[act[0]] = (g.cnt.acts[act[0]] || 0) + 1;
    var v = { p: g.name, r: rname, place: S.v.place, boss: S.v.boss };
    /* 流れの種類：団体の流れ作業／二人同時／常連との世間話／上の人の立ち会い／ちょっとしたトラブル */
    var F = KH.FLOW, fl = 'std', fr = rng();
    if (F && lew !== 'low') {
      if (npc) fl = fr < 0.13 * (0.5 + S.env.npc / 100) ? 'rush' : fr < 0.24 ? 'double' : fr < 0.38 ? 'talk' : fr < 0.47 ? 'watch' : fr < 0.55 ? 'mishap' : 'std';
      else fl = fr < 0.12 ? 'talk' : fr < 0.2 ? (S.noMob ? 'std' : 'watch') : fr < 0.27 ? 'mishap' : 'std';
      fl = fl !== 'std' && S.flags['fl_' + fl] >= 2 + (fl === 'talk' ? 1 : 0) ? 'std' : fl;
      if (fl !== 'std') S.flags['fl_' + fl] = (S.flags['fl_' + fl] || 0) + 1;
    }
    if (fl === 'rush') {
      var ns = [rname].concat(rng.shuffle(SIT.npc.filter(function (x) { return x !== rname; })).slice(0, 2)), as = [act].concat(rng.shuffle(pool.filter(function (a) { return a !== act; })).slice(0, 2));
      while (as.length < 3) as.push(act);
      var mlR = 0, tr = ST.fmt(pkF(S, F.rush), { p: g.name, r: ns[0], r2: ns[1], r3: ns[2], a1: as[0][0], a2: as[1][0], a3: as[2][0] });
      var mlx = Math.round(4 + rng() * 10); mlR = mlx * 3;
      tr += ST.fmt(pkF(S, climaxOf(KH.ACTKIND[as[2][0]]) || KH.CLIMAX.hand), { p: g.name, r: ns[2], ml: mlx }) + ST.fmt(pkF(S, F.rushEnd), { p: g.name });
      g.cnt.served += 3; g.m.sem += mlR; g.m.imm += 5; g.m.plea += (14 + rng() * 14) * g.sens;
      as.forEach(function (a) { g.cnt.acts[a[0]] = (g.cnt.acts[a[0]] || 0) + 1; });
      if (g.m.plea >= 100) { g.m.plea = 25; g.cnt.gclimax++; tr += pkF(S, gTop && !gFree ? E(S, 'gclimax', KH.GCLIMAX).filter(function (x) { return !/奥/.test(x); }) : E(S, 'gclimax', KH.GCLIMAX)).replace(/\{p\}/g, g.name); }
      tr += heatUp(S, g);
      tr = ef(S, tr, g, npcWho(S));
      ST.sayB(S, { actors: [g], tag: '流れ作業', lewd: true, text: tr, why: g.name + 'の担当に予約が重なった（客の多さ ' + S.env.npc + '）', mag: 20 }, g.name + '→三人を連続対応（' + mlR + 'ml）', g.cnt.served === 3);
      return;
    }
    var r2name = fl === 'double' ? rng.pick(SIT.npc.filter(function (x) { return x !== rname; })) : null;
    var t = (r && r.role === 'giver' ? ST.fmt(pkF(S, L('客が途切れた合間に、{p}は{r}を練習台にすることにした。「今日の手順、確認させて」|{p}は{r}を施術台に寝かせた。「次のお客様の前に、一度通しでやっておきたいの」|{r}が「最近、自分も溜まってて」と言うと、{p}は当然のように施術台を勧めた。')), v) : '') + (r && r.role === 'out' ? ST.fmt(pkF(S, nm(S, SIT.out ? SIT.out.taken : E(S, 'out.taken', KH.OUT.taken))), { o: r.name, p: g.name }) : fl === 'talk' ? ST.fmt(pkF(S, nm(S, F.talk)), v) : fl === 'double' ? ST.fmt(pkF(S, F.double), { p: g.name, r: rname, r2: r2name }) : (fl === 'watch' ? ST.fmt(pkF(S, F.watch), v) : '') + ST.fmt(pkF(S, nm(S, SIT.consult)), v)) + g.name + (ero && rng() < 0.7 && HK.Ero.has('kaihen', 'lines.' + S.v.sid + '.' + g.top) ? pkF(S, E(S, 'lines.' + S.v.sid + '.' + g.top, [])) : VO && VO.GIVER[g.persona] && rng() < 0.55 ? pkF(S, VO.GIVER[g.persona]) : pkF(S, nm(S, SIT.lines[g.top] || SIT.lines.NP)));
    /* 施術中の掛け合い（solo-kaihen-talk.js）：始める前の説明 */
    var kindT = KH.ACTKIND[act[0]] || 'hand', talkWhy = '';
    var tp = KH.talk && rng() < 0.55 ? KH.talk(S, 'pre', g, r, rname, kindT, false) : null;
    if (tp) { t += tp.text; talkWhy = tp.why; }
    if (lew === 'low') t += ST.fmt('{p}は「' + act[0] + '」を行った。――その内容は、カルテに数字だけが残された。', v);
    else {
      var kind0 = KH.ACTKIND[act[0]];
      actAt = t.length;
      /* ノリノリの施す側は、受け入れる施術で自分から跨る・誘う */
      if (F && kind0 === 'in' && HK.Pos && HK.Pos.nori(g) && rng() < 0.55) t += (actLead = ST.fmt(pkF(S, nm(S, F.nori)), v));
      else t += (actLead = ST.fmt(pkF(S, nm(S, E(S, 'act.' + act[0], L(act[1])))), v));
      /* 掛け合い：最中の確認（厚い山場では書き出しに含める） */
      var tm = KH.talk && rng() < 0.5 ? KH.talk(S, 'mid', g, r, rname, kindT, false) : null;
      if (tm) { t += tm.text; actLead += tm.text; talkWhy = talkWhy || tm.why; }
      /* 男性向け：書き下ろしの続き、なければ施術の種類ごとの続き */
      var a2 = E(S, 'act2.' + act[0], null), kk = kind0 === 'top' && gF ? 'topF' : kind0;
      if (a2 && !(ero && HK.Ero.has('kaihen', 'kind.' + kk) && rng() < 0.3)) t += ST.fmt(pkF(S, nm(S, a2)), v);
      else if (a2) t += ST.fmt(pkF(S, E(S, 'kind.' + kk, a2)), v);
      else {
        if ((lew === 'high' || rng() < 0.55) && !mobby(S, act[2])) t += ST.fmt(pkF(S, L(act[2])), v);
        if (ero && HK.Ero.has('kaihen', 'kind.' + kk)) t += ST.fmt(pkF(S, E(S, 'kind.' + kk, [])), v);
      }
      if (fl === 'mishap') t += ST.fmt(pkF(S, nm(S, F.mishap)), v);
      /* 施す側の喘ぎ声と心の声（仕事なのに……） */
      if (KH.MOAN && kind0 === 'in' && rng() < (lew === 'high' ? 0.85 : 0.6)) {
        t += g.name + '「' + pkF(S, KH.MOAN_P[g.persona] && rng() < 0.4 ? E(S, 'moan.' + g.persona, KH.MOAN_P[g.persona]) : E(S, 'moan', KH.MOAN)) + '」';
        g.m.plea += 6 * g.sens;
      }
      /* 施す側が攻めの施術：喘ぎは受け身でないものだけ */
      if (KH.MOAN && kind0 === 'top' && rng() < (lew === 'high' ? 0.6 : 0.4)) { var mtk = 'moanTop.' + (g.hs || 0); t += g.name + '「' + pkF(S, ero && !gF && HK.Ero.has('kaihen', mtk) && rng() < 0.6 ? E(S, mtk, []) : topL(g, KH.MOAN_P[g.persona] && rng() < 0.4 ? E(S, 'moan.' + g.persona, KH.MOAN_P[g.persona]) : E(S, 'moan', KH.MOAN))) + '」'; g.m.plea += 4 * g.sens; }
      if (KH.INNER && (kind0 === 'in' || kind0 === 'mouth' || kind0 === 'top') && rng() < (g.m.doubt > 15 ? 0.4 : 0.18)) { t += g.name + pkF(S, innerOf(S, g, kind0 === 'top' || (gTop && !gFree))); g.m.doubt += 2 * g.doubtRate; }
      /* 男性向けでは、受ける側の声は絶頂の文の中に入れる */
      if (!ero && r && rng() < 0.45 && HK.Voice.CLIMAX[r.persona]) t += nClimax(S, r);
    }
    var ml = Math.round((r ? 6 + rng() * 8 : 4 + rng() * 12) * (1 + ai * 0.08));
    t += ST.fmt(pkF(S, climaxOf(KH.ACTKIND[act[0]] || KH.climaxKind(t))), { p: g.name, r: rname, ml: ml });
    /* 小説調の山場（solo-thick4.js）：登場キャラが受ける施術は毎回、モブの客は三回に一回ほど、段落に分けて厚く */
    var tk0 = { hand: 'serve', glove: 'serve', mouth: 'serve', face: 'serve', in: 'ride', top: 'in', topF: 'ride' }[KH.ACTKIND[act[0]]];
    if (tk0 && actAt >= 0 && actLead && HK.Thick4 && HK.Thick4.ok(S, lew) && (r || rng() < 0.35)) {
      var sub0 = r || { name: rname, gender: 'm' };
      t = t.slice(0, actAt) + HK.Thick4.scene(S, { dom: g, sub: sub0, kind: tk0, lead: actLead, sad: HK.Thick4.rollSad(S, g, sub0),
        after: ST.fmt(pkF(S, HEAT_AFTER[g.hs || 0]), { p: g.name, ml: ml }) });
    }
    /* 掛け合い：終わりの締め／居合わせた正気の人の突っ込み */
    var te = KH.talk && rng() < 0.45 ? KH.talk(S, 'end', g, r, rname, kindT, false) : null;
    if (te) { t += te.text; talkWhy = talkWhy || te.why; }
    var tc = KH.talkCut && r && r.role !== 'out' && S.v.sid !== 'stage' ? KH.talkCut(S, g) : null;
    if (tc) { t += tc.text; talkWhy = talkWhy || tc.who.name + 'は正気のまま居合わせた'; }
    if (fl === 'double') { t += ST.fmt(pkF(S, F.doubleEnd), { p: g.name, r: rname, r2: r2name }); g.cnt.served++; g.m.sem += ml; }
    if (fl === 'watch') { t += ST.fmt(pkF(S, F.watchEnd), v); g.m.imm += 4; }
    g.cnt.served++; g.m.sem += ml;
    g.m.imm += 2.5 + (g.goal.id === 'top' ? 2 : 0);
    var gain = (8 + ai * 4 + rng() * 10) * g.sens;
    g.m.plea += gain;
    var why = g.name + '（' + SIT.giver + '・' + (g.topWhy || g.top + '優位') + '）の「' + act[0] + '」' + (g.action.id === 'bold' ? '／大胆な方針' : g.action.id === 'care' ? '／丁寧な方針' : '');
    if (g.m.plea >= 100) { g.m.plea = 25; g.cnt.gclimax++; t += pkF(S, gTop && !gFree ? E(S, 'gclimax', KH.GCLIMAX).filter(function (x) { return !/奥/.test(x); }) : E(S, 'gclimax', KH.GCLIMAX)).replace(/\{p\}/g, g.name) + (!ero && lew !== 'low' && rng() < 0.6 ? g.name + '「' + pkF(S, topL(g, HK.Voice.CLIMAX[g.persona] || HK.Voice.CLIMAX.gentle)) + '」' : ''); g.m.doubt += 6 * g.doubtRate; why += '／' + g.name + '自身も達した（感じやすさ ' + g.stats.sens + '）'; }
    var hu = heatUp(S, g);
    if (hu) { t += hu; why += '／' + g.name + 'の昂りが一段上がった（快感 ' + Math.round(g.m.plea) + '）'; }
    if (r) {
      r.cnt.served++; r.cnt.climax++; r.m.sem += ml; r.m.plea = clamp(r.m.plea + 25 * r.sens, 0, 100);
      if (r.role === 'out') { r.m.imm += 14 + r.tr.ac * 10; r.m.doubt -= 6; why += '／正気の' + r.name + 'も、施術を受けてしまった'; }
      else {
        r.m.imm += 3; r.m.doubt += r.doubtRate * (2 + rng() * 4);
        var k = r.m.doubt > 45 ? 'doubt' : r.tr.ac > 0.6 ? 'shy' : 'calm';
        t += ST.fmt(pkF(S, ero && rng() < 0.6 ? E(S, 'taker.' + k, KH.TAKER[k]) : VO && rng() < 0.75 ? (k === 'doubt' ? VO.DOUBT[r.persona] : VO.TAKER[r.persona]) || KH.TAKER[k] : KH.TAKER[k]), { r: r.name });
      }
    }
    /* 正気の人が施される：態度ごとの反応（止めようとする／流される）。衆人環視の舞台では、客席の反応も */
    if (r && r.role === 'out' && lew !== 'low') { var sx = saneTaken(S, SIT, r, g.name); t += sx.text + stageCrowd(S, g.name, rname, true); why += sx.why; }
    else t += stageCrowd(S, g.name, rname, false);
    t = ef(S, t, g, rw);
    if (r && r.role === 'giver') why += '／モブなし：同じ' + SIT.giver + 'の' + r.name + 'を練習台にした';
    if (talkWhy) why += '／' + talkWhy;
    if (fl !== 'std') why += '／' + { talk: '常連との世間話', double: '二人同時の対応', watch: S.v.boss + 'の立ち会い', mishap: 'ちょっとしたトラブル' }[fl];
    var o = ST.sayB(S, { actors: r ? [g, r] : [g], tag: act[0], lewd: true, text: t, why: why, mag: 18 + ai * 3 }, g.name + '→' + rname + '（' + act[0] + '・' + ml + 'ml）', g.cnt.served === 1 || (r && r.cnt.served === 1));
    if (o && g.cnt.served === 1) ST.key(S, o, g.name + 'の最初の' + SIT.unit);
    saneWatch(S, SIT, g, r, o);
    /* 施しながら、体が変わっていく */
    if (rng() < 0.12 + g.stats.sens * 0.04 && g.m.plea > 40) {
      g.cnt.body++; g.m.doubt += 7 * g.doubtRate; g.m.plea += 8;
      ST.say(S, { actors: [g], tag: '体の違和感', lewd: true, text: ST.fmt(pkF(S, E(S, 'body', KH.BODY)), v), why: '施すたびに' + g.name + 'の体も昂っている（快感 ' + Math.round(g.m.plea) + '）', mag: 20 });
    }
    g.m.doubt += g.doubtRate * rng() * 2.5;
  }
  /* 女性どうしの施術（施す側も受ける側も女性の住人）：KH.FF_ACTS の書き下ろしを使う。
     動くのは HK.Pos.order の先頭（施す側が先頭なら give、受ける側が先頭なら take）。採取量の代わりに反応を記録する */
  function serveFF(S, SIT, g, r, lew) {
    var rng = S.rng, NG = KH.FF_NG, sid = S.v.sid, FA = KH.FF_ACTS[sid] || KH.FF_ACTS.clinic;
    var gAct = HK.Pos.order(g, r, [g, r])[0] === g, dir = gAct ? 'give' : 'take';
    /* 施す側が女性でないときは、施す側の体を女性として書いた手順（受ける側が指を沈める・脚を絡めて擦り合わせる）を除く */
    var gF = HK.Pos.isF(g), MALE_NG = /重ね合わせ|擦り合わせ|脚を絡め|指を沈め|指が沈む/;
    /* 文ごとに選ぶ：二人が対等に繋がる書き方（重ね合わせ・擦り合わせ）は二人ともリバのときだけ。施す側が女性でなければ、施す側の体を女性として書いた文を外す */
    var both = HK.Pos.bothRiba(g, r);
    var okLine = function (l) { return (both || !HK.Pos.MUTUAL_RE.test(l)) && (gF || !MALE_NG.test(l)); };
    /* 施す側が男性で、受ける女性が動く側（女性が攻め）：女性上位の手順（KH.FM_TAKE。跨る・導く・搾る） */
    var FMT = !gF && !gAct && KH.FM_TAKE ? KH.FM_TAKE : null;
    var acts = (FMT || FA[dir]).map(function (x) { return [x[0], L(x[1]).filter(okLine)]; }).filter(function (x) { return x[1].length; });
    var act = rng.pick(acts.length ? acts : FA[dir].map(function (x) { return [x[0], L(x[1])]; }));
    g.cnt.acts[act[0]] = (g.cnt.acts[act[0]] || 0) + 1;
    var v = { p: g.name, r: r.name, place: S.v.place, boss: S.v.boss };
    var ok = function (l) { var f = (l || []).filter(function (x) { return !NG.test(x); }); return f.length ? f : null; };
    var t = r.role === 'giver' ? ST.fmt(pkF(S, L('客が途切れた合間に、{p}は{r}を相手に、今日の手順を確かめることにした。|{p}は{r}を施術台に呼んだ。「次のお客様の前に、一度通しでやっておきたいの」')), v)
      : r.role === 'out' ? ST.fmt(pkF(S, ok(nm(S, SIT.out ? SIT.out.taken : E(S, 'out.taken', KH.OUT.taken))) || KH.OUT.taken), { o: r.name, p: g.name })
      : ST.fmt(pkF(S, ok(nm(S, SIT.consult)) || KH.FF_CONSULT), v);
    var gl = (VO && VO.GIVER[g.persona] && rng() < 0.55 && ok(VO.GIVER[g.persona])) || ok(nm(S, SIT.lines[g.top] || SIT.lines.NP)) || KH.FF_GIVER;
    t += g.name + pkF(S, gl);
    /* 施術中の掛け合い（女性の受け手：男性の体を前提にした言葉を外す） */
    var ffK = FMT ? 'hand' : 'ff', talkWhy = '';
    var tp = KH.talk && rng() < 0.55 ? KH.talk(S, 'pre', g, r, r.name, ffK, true) : null;
    if (tp) { t += tp.text; talkWhy = tp.why; }
    if (lew === 'low') t += ST.fmt('{p}は「' + act[0] + '」を行った。――その内容は、カルテに数字だけが残された。', v);
    else {
      t += ST.fmt(pkF(S, nm(S, act[1])), v);
      var tm = KH.talk && rng() < 0.5 ? KH.talk(S, 'mid', g, r, r.name, ffK, true) : null;
      if (tm) { t += tm.text; talkWhy = talkWhy || tm.why; }
      if (!gAct && KH.MOAN && rng() < 0.6) { t += g.name + '「' + pkF(S, ok(KH.MOAN_P[g.persona] && rng() < 0.4 ? E(S, 'moan.' + g.persona, KH.MOAN_P[g.persona]) : E(S, 'moan', KH.MOAN)) || KH.MOAN) + '」'; g.m.plea += 6 * g.sens; }
      if (KH.INNER && rng() < (g.m.doubt > 15 ? 0.35 : 0.15)) { t += g.name + pkF(S, (g.accepted ? INNER_ACCEPT : gAct ? KH.INNER_TOP : KH.INNER).filter(function (x) { return !/奥/.test(x); })); if (HK._rxT) HK._rxT.push({ sc: 'kaihen', k: 'inner', who: g.name, acc: !!g.accepted }); g.m.doubt += 2 * g.doubtRate; }
      var who = gAct ? r : g;
      if (!eOn(S) && rng() < 0.45 && HK.Voice.CLIMAX[who.persona]) t += nClimax(S, who);
      t += ST.fmt(pkF(S, FMT ? E(S, 'fm.take', KH.FM_CLIMAX) : /手袋|ミトン|グローブ/.test(act[0]) && gAct && HK.Ero && HK.Ero.has('kaihen', 'ff.glove') && eOn(S) ? HK.Ero.T.kaihen['ff.glove'] : E(S, 'ff.' + dir, KH.FF_CLIMAX[dir])), v);
    }
    var te = KH.talk && rng() < 0.45 ? KH.talk(S, 'end', g, r, r.name, ffK, true) : null;
    if (te) { t += te.text; talkWhy = talkWhy || te.why; }
    g.cnt.served++; g.m.imm += 2.5 + (g.goal.id === 'top' ? 2 : 0);
    g.m.plea += (gAct ? 8 : 18) * g.sens + rng() * 8;
    var why = g.name + '（' + SIT.giver + '・' + (g.topWhy || g.top + '優位') + '）の「' + act[0] + '」／' + (gF ? '女性どうしの施術' : FMT ? '女性の受け手が上になる施術' : '女性の受け手への施術') + '（' + (gAct ? g.name : r.name) + 'が動く側）';
    if (!gAct) g.cnt.gclimax++;
    if (g.m.plea >= 100) { g.m.plea = 25; if (gAct) { g.cnt.gclimax++; t += pkF(S, KH.GCLIMAX.filter(function (x) { return !/奥/.test(x); })).replace(/\{p\}/g, g.name); } g.m.doubt += 6 * g.doubtRate; }
    t += heatUp(S, g);
    r.cnt.served++; if (gAct) r.cnt.climax++; r.m.plea = clamp(r.m.plea + 25 * r.sens, 0, 100);
    if (r.role === 'out') { r.m.imm += 14 + r.tr.ac * 10; r.m.doubt -= 6; why += '／正気の' + r.name + 'も、施術を受けてしまった'; }
    else {
      r.m.imm += 3; r.m.doubt += r.doubtRate * (2 + rng() * 4);
      var k = r.m.doubt > 45 ? 'doubt' : r.tr.ac > 0.6 ? 'shy' : 'calm';
      t += ST.fmt(pkF(S, (VO && rng() < 0.75 && ok(k === 'doubt' ? VO.DOUBT[r.persona] : VO.TAKER[r.persona])) || ok(KH.TAKER[k]) || KH.TAKER.calm), { r: r.name });
    }
    if (r.role === 'out' && lew !== 'low') { var sx = saneTaken(S, SIT, r, g.name); t += sx.text + stageCrowd(S, g.name, r.name, true); why += sx.why; }
    else t += stageCrowd(S, g.name, r.name, false);
    t = ef(S, t, g, r);
    if (r.role === 'giver') why += '／同じ' + SIT.giver + 'の' + r.name + 'と手順を確かめた';
    if (talkWhy) why += '／' + talkWhy;
    var o = ST.sayB(S, { actors: [g, r], tag: act[0], lewd: true, text: t, why: why, mag: 20 }, g.name + '→' + r.name + '（' + act[0] + '）', g.cnt.served === 1 || r.cnt.served === 1);
    if (o && g.cnt.served === 1) ST.key(S, o, g.name + 'の最初の' + SIT.unit);
    saneWatch(S, SIT, g, r, o);
    g.m.doubt += g.doubtRate * rng() * 2.5;
  }
  function idle(S, g, SIT) {
    var rng = S.rng, v = { p: g.name, boss: S.v.boss, place: S.v.place };
    /* 同僚どうしの練習は、向きの決まる組だけ。{q}（服を脱がせて手順を試す側）は HK.Pos.order の先頭 */
    var others = S.P.filter(function (o) { return o !== g && o.role === 'giver' && !o.quit && okPair(g, o); });
    if (others.length && rng() < 0.4) {
      var o2 = rng.pick(others), od = HK.Pos ? HK.Pos.order(g, o2, [o2, g]) : [o2, g];
      g.m.plea += 15 * g.sens; o2.m.plea += 15 * o2.sens; g.m.imm += 3; o2.m.imm += 3;
      return ST.sayB(S, { actors: [g, o2], tag: '空き時間', lewd: true, text: ef(S, ST.fmt(pkF(S, E(S, 'idle', L('客が途切れた。{p}と{q}は、空いた施術室で手技の練習をすることにした。お互いの体で。|{p}は{q}に「さっきの手順、私にやってみて」と頼んだ。{q}は真剣な顔で頷き、{p}の服を脱がせ始めた。|{p}と{q}は休憩室で、どちらが多く搾ったかを比べ合った。負けた方が、勝った方を労うことになった。'))), { p: od[1].name, q: od[0].name }), od[1], od[0]), why: '同僚どうしの練習（' + SIT.name + 'では、これも業務の一部）', mag: 16 }, g.name + 'と' + o2.name + 'は空き時間に練習');
    }
    g.m.imm += 1;
    ST.sayB(S, { actors: [g], tag: '空き時間', text: ST.fmt(pkF(S, nm(S, SIT.idle || L('客が来ない。{p}は器具を一つずつ消毒し、次の客に備えた。|{p}は空き時間に、施術マニュアルを読み返した。付箋だらけだった。|{p}は待合室を覗き、誰もいないのを確かめてから、こっそり自分の制服の匂いを嗅いだ。|{p}は{boss}に頼まれて、新しいローションの使い心地を自分の腕で試した。'))), v) + (VO && VO.IDLE[g.persona] && rng() < 0.5 ? g.name + pkF(S, VO.IDLE[g.persona]) : ''), why: '客の少ない時間帯' }, g.name + 'は客待ち');
  }

  /* ---------- ハプニング ---------- */
  /* モブなしのとき：ほかの客・上司・同僚などが出てこない出来事と文だけを使う */
  var NOMOB_EV = ['machine', 'blackout', 'camera', 'diary', 'self'];
  /* 客が来る出来事（客の多さ0のときは起きない） */
  var GUEST_EV = ['double', 'regular', 'friend', 'complaint'];
  /* 施す側が性行為の相手を「固定した相手だけ」にしている（noMob）：客（モブ）の施術を前提にしない出来事だけ */
  var NOMOB_G = ['diary', 'self'];
  var MOB = /\{boss\}|団体|新人|同僚|隣の人|周りの人|誰も気にして|スタッフ|監査|業者|ほかの客|他の客|客たち|お客たち|観客|客席|係員|係の人間|司会|皆さん|隣の席|後ろの席/;
  function mobby(S, t) { return S.noMob && (MOB.test(t) || (S.v.boss && t.indexOf(S.v.boss) >= 0)); }
  /* モブなし：文の中で、モブ（上司・同僚・新人など）が出てくる一文を取り除く（括弧の中では切らない） */
  function dropMob(S, t) {
    var units = [], cur = '', d = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t.charAt(i); cur += ch;
      if (ch === '「') d++; else if (ch === '」') d = Math.max(0, d - 1);
      if (d === 0 && (ch === '。' || (ch === '」' && !/[とっ、]/.test(t.charAt(i + 1) || '') && /^[^「]*「/.test(cur) === false && cur.indexOf('「') >= 0))) { units.push(cur); cur = ''; }
    }
    if (cur) units.push(cur);
    var keep = units.filter(function (u) { return !mobby(S, u); });
    return keep.length && keep.length < units.length ? keep.join('') : t;
  }
  function nm(S, pool) {
    if (!S.noMob || !pool) return pool;
    var f = pool.filter(function (t) { return !mobby(S, t); });
    return f.length ? f : pool;
  }
  function happen(S, SIT) {
    var rng = S.rng, G = S.P.filter(function (p) { return p.role === 'giver' && !p.quit; });
    if (!G.length) return;
    var g = rng.pick(G), e = HK.weighted(rng, KH.EVENTS, function (x) { return S.noMob && NOMOB_EV.indexOf(x.id) < 0 ? 0 : S.noGuest && GUEST_EV.indexOf(x.id) >= 0 ? 0 : g.noMob && NOMOB_G.indexOf(x.id) < 0 ? 0 : S.flags['ev_' + x.id] ? 0.04 : x.id === 'reverse' && HK.Pos && HK.Pos.hardTop(g) ? 0 : 1; });
    S.flags['ev_' + e.id] = (S.flags['ev_' + e.id] || 0) + 1;
    var fx = e.fx, et = E(S, 'ev.' + e.id, e.t), t = ef(S, ST.fmt(pkF(S, nm(S, et)), { p: g.name, boss: S.v.boss }), g, null);
    if (fx.doubt) g.m.doubt += fx.doubt * (fx.doubt > 0 ? g.doubtRate : 1);
    if (fx.imm) g.m.imm += fx.imm;
    if (fx.plea) g.m.plea += fx.plea * g.sens;
    if (fx.served) { g.cnt.served += fx.served; g.m.sem += Math.round(10 + rng() * 20); }
    if (fx.taken) { g.cnt.climax++; g.m.plea = 30; }
    if (fx.doubt > 0) g.cnt.glitch++;
    var o = ST.say(S, { actors: [g], tag: 'ハプニング', lewd: fx.served || fx.taken || fx.plea || et !== e.t ? true : undefined, text: t, why: fx.doubt > 0 ? '改変のほころび（' + g.name + 'の違和感 ' + Math.round(g.m.doubt) + '）' : fx.doubt < 0 ? '改変が強められた' : '', mag: Math.abs(fx.doubt || 0) + 10 });
    if (e.id === 'friend' || e.id === 'audit') ST.key(S, o, '外の世界の目');
    /* 違和感のきっかけ（舞台ごとの・どこでも） */
    var w = G.filter(function (p) { return p.m.doubt > 20; });
    if (w.length && rng() < 0.45) {
      var q = rng.pick(w), pool = rng() < 0.5 ? SIT.glitch : KH.GLITCH;
      q.m.doubt += (10 + rng() * 10) * q.doubtRate; q.cnt.glitch++;
      ST.say(S, { actors: [q], tag: '違和感', text: ST.fmt(pkF(S, pool), { p: q.name }), why: q.name + 'の冷静さ（A ' + Math.round(q.eg.A) + '）が、改変のほころびを拾った', mag: 22 });
    }
  }

  /* ---------- 気づき ---------- */
  function check(S, SIT, p) {
    var rng = S.rng;
    if (p.m.doubt < 62 || p.awakeKind === 'snap' || p.awakeKind === 'accept' || p.awakeKind === 'reset' || p.awakeKind === 'hide') return;
    if (p.awakeAt != null && S.step - p.awakeAt < 2) return;
    var t = p.tr;
    var k = HK.weighted(rng, ['snap', 'accept', 'hide', 'deny'], function (x) {
      var w = { snap: t.cp * 0.5 + t.a * 0.4 + (100 - p.m.imm) / 120, accept: t.fc * 0.5 + p.m.plea / 140 + t.ac * 0.15 + p.cnt.gclimax * 0.1, hide: t.a * 0.4 + t.cold * 0.4 + t.caution * 0.2, deny: t.ac * 0.5 + p.m.imm / 120 }[x];
      return Math.pow(Math.max(0.03, w), 2);
    });
    p.awakeKind = k; p.awakeAt = S.step; p.cnt.awake++;
    var v = { p: p.name, boss: S.v.boss };
    var why = p.name + 'の違和感が限界を超えた（' + Math.round(p.m.doubt) + '）→「' + { snap: '正気に戻る', accept: '気づいたうえで続ける', hide: '気づかないふりをする', deny: '自分の違和感を打ち消す' }[k] + '」（' + HK.egoType(p.eg).top + '優位の気質）';
    var say = VO && VO.AWAKE[p.persona] && VO.AWAKE[p.persona][k] ? p.name + pkF(S, VO.AWAKE[p.persona][k]) : '';
    var o = ST.say(S, { actors: [p], tag: '気づき', text: ST.fmt(pkF(S, KH.AWAKE[k]), v).replace(/白衣のまま/, p.role === 'giver' ? SIT.giver + 'の格好のまま' : 'そのまま') + say, why: why, mag: 40 });
    ST.key(S, o, p.name + 'が気づいた');
    if (k === 'snap') { p.quit = true; p.m.imm = 5; return; }
    if (k === 'deny') { p.m.doubt -= 30; p.m.imm += 8; return; }
    if (k === 'accept') { p.m.imm = Math.max(p.m.imm, 70); p.m.plea += 20; p.accepted = true; return; }
    /* 気づかないふり：上の人に見抜かれて、改変し直されることがある */
    if (rng() < 0.35 + S.env.depth / 250) {
      p.cnt.reset++; p.m.doubt = 8; p.m.imm = clamp(p.m.imm + 25, 0, 100); p.awakeKind = 'reset';
      var o2 = ST.say(S, { actors: [p], tag: '再改変', text: ST.fmt(pkF(S, nm(S, KH.RESET)), v), why: (S.noMob ? '改変そのものに引き戻された' : S.v.boss + 'に見抜かれた') + '（改変の強さ ' + S.env.depth + '）', mag: 35 });
      ST.key(S, o2, p.name + 'は改変し直された');
    }
  }

  /* ---------- 正気のまま紛れ込んだ人 ---------- */
  function outsider(S, SIT, p) {
    var rng = S.rng, v = { o: p.name };
    /* 心の強さ（attr.js）：強い人は改変度が上がりきっても心は呑み込まれない（一度だけ、その一文を出す）。弱い人は早く呑み込まれる */
    if (HK.Attr && HK.Attr.strong(p) && p.m.imm > 72) {
      p.m.imm = 64;
      if (!p.willHeld) { p.willHeld = true; return ST.key(S, ST.say(S, { actors: [p], tag: '心は折れない', text: HK.Attr.hold(function (l) { return pkF(S, l); }, p, 'kaihen'), why: p.name + 'の心の強さ：強い（改変度が上がりきっても、心までは呑み込まれなかった）', mag: 30 }), p.name + 'は心を手放さなかった'); }
    }
    if (p.m.imm > HK.Dark.pick(S, 88, 72, 62) / (HK.Attr ? HK.Attr.willK(p) : 1)) { p.sunk = true; return ST.key(S, ST.say(S, { actors: [p], tag: '呑み込まれる', text: ST.fmt(pkF(S, nm(S, outPool(SIT, 'sink'))), v), why: p.name + 'の改変度が' + Math.round(p.m.imm) + 'に達した', mag: 40 }), p.name + 'も改変された'); }
    /* 止めようとしても誰も取り合わないと、逃げ出したくなる */
    var flee = (p.tr.cp * 0.4 + p.tr.a * 0.3 + p.tr.caution * 0.3) * (p.m.doubt / 100) - p.m.imm / 150 + (p.cnt.stop || 0) * 0.04;
    if (S.step >= 1 && rng() < flee * 0.35) { p.fled = true; return ST.key(S, ST.say(S, { actors: [p], tag: '脱出', text: ST.fmt(pkF(S, nm(S, outPool(SIT, 'flee'))), v), why: p.name + 'の慎重さとCP・A' + (p.cnt.stop ? '（止めようとして、誰にも取り合ってもらえなかった）' : ''), mag: 35 }), p.name + 'が逃げ出した'); }
    if (p.takenAt === S.step) return;
    /* 衆人環視の舞台：モブの演者に、志願者として壇上に上げられる */
    if (S.v.sid === 'stage' && canStage(S, p) && rng() < (S.P.some(function (x) { return x.role === 'giver' && !x.quit; }) ? 0.22 : 0.5)) return stageMob(S, SIT, p);
    if (rng() < 0.45) {
      p.m.imm += 4 + p.tr.ac * 6;
      /* 態度ごとの反応（気づく・止めようとする・流される）：まわりのようすの一文のあとに */
      if (VO && VO.SANE && rng() < 0.55) {
        var k = saneKind(S, p, 'watch'), sc = ST.fmt(pkF(S, nm(S, SANE_SCENE[S.v.sid === 'stage' ? 'stage' : 'any'])), { crowd: crowdOf(S), unit: SIT.unit }), t = saneSay(S, SIT, p, k);
        if (k === 'stop') t += saneNorm(S, SIT, p, '');
        return ST.sayB(S, { actors: [p], tag: '正気の人', text: sc + t, why: '周りは全員、これを普通だと思っている→' + p.name + 'は「' + KIND_JA[k] + '」（' + toneJa(p) + '・改変度 ' + Math.round(p.m.imm) + '）', mag: k === 'stop' ? 24 : 14 }, p.name + 'は周りの様子に戸惑っていた');
      }
      ST.sayB(S, { actors: [p], tag: '正気の人', text: ST.fmt(pkF(S, nm(S, rng() < 0.5 ? outPool(SIT, 'see') : outPool(SIT, 'tell'))), v) + (VO && VO.OUT[p.persona] && rng() < 0.6 ? p.name + pkF(S, VO.OUT[p.persona]) : ''), why: '周りは全員、これを普通だと思っている（' + p.name + 'の改変度 ' + Math.round(p.m.imm) + '）' }, p.name + 'は周りの様子に戸惑っていた');
    }
  }

  /* ---------- 正気の人：まわりの全員が当たり前だと思っている中で、ひとりだけおかしいと分かっている ----------
     反応は態度9種（solo-kaihen-voice.js の KH.VOICE.SANE）：気づく（notice）・止めようとする（stop）・流される（見ていて sweptW／施されていて sweptT）。
     止めようとすると、まわり（客・観客）・施している側・ほかの住人が、当たり前のこととして返す（KH.SANE_NORM） */
  function outPool(SIT, k) { return (SIT.out && SIT.out[k]) || KH.OUT[k]; }
  function crowdOf(S) { return S.noMob ? 'まわりのみんな' : (KH.CROWD && KH.CROWD[S.v.sid]) || 'まわりの人たち'; }
  function toneJa(p) { return (HK.PERSONA && HK.PERSONA[p.persona] ? HK.PERSONA[p.persona].label : p.persona) + 'の態度'; }
  var KIND_JA = { notice: '気づく', stop: '止めようとする', sweptW: '流される', sweptT: '流される' };
  /* 正気の人がひとりで反応するときの、まわりのようす（{crowd}・{unit}） */
  var SANE_SCENE = {
    stage: L('舞台の上では、次の実演が始まっていた。|スポットライトの下で、また一人、志願者が施術台に寝かされた。客席は静まり返って、その手元を見つめていた。|幕が上がり、次の演目が告げられた。客席から、待ちかねたような拍手が起きた。|大型スクリーンに、舞台の上の実演が大きく映し出された。誰も、目を逸らしてはいなかった。'),
    any: L('{crowd}の前で、また次の{unit}が始まった。|すぐそばで、いつもどおりの{unit}が続いていた。誰も、それを気にしていなかった。|壁越しに、誰かの{unit}の声が聞こえてきた。{crowd}は、穏やかな顔でそれを聞き流していた。')
  };
  function sanes(S, but) { return S.P.filter(function (p) { return p.role === 'out' && !p.fled && !p.sunk && p !== but; }); }
  /* 反応の種類：ctx＝'watch'（見ている）／'taken'（自分が施されている）。改変度が上がるほど流されやすい。CPが高いほど止めようとする */
  function saneKind(S, o, ctx) {
    var t = o.tr, im = o.m.imm;
    if (ctx === 'taken') return HK.weighted(S.rng, ['stop', 'sweptT'], function (k) { return k === 'stop' ? Math.max(0.05, 1 - im / 45) * (0.6 + t.cp * 0.4) : 0.08 + Math.pow(im / 60, 1.5) + t.fc * 0.1; });
    if (!o.cnt.notice) return 'notice';
    return HK.weighted(S.rng, ['notice', 'stop', 'sweptW'], function (k) {
      return k === 'notice' ? 0.35 * (1 - im / 100) + t.a * 0.2 : k === 'stop' ? Math.max(0.03, (t.cp * 0.6 + (1 - t.ac) * 0.3 + t.a * 0.2) * (1 - im / 80)) : 0.1 + im / 60 + t.fc * 0.2 + t.ac * 0.15;
    });
  }
  function saneSay(S, SIT, o, kind) {
    var VS = VO && VO.SANE && (VO.SANE[o.persona] || VO.SANE.gentle);
    if (!VS || !VS[kind]) return '';
    o.cnt[kind === 'sweptW' || kind === 'sweptT' ? 'swept' : kind]++;
    if (kind === 'notice') { o.m.doubt += 4; o.m.imm -= 2; }
    else if (kind === 'stop') { o.m.doubt += 3; o.m.imm -= 4; }
    else o.m.imm += kind === 'sweptT' ? 8 : 6 + o.tr.ac * 4;
    o.m.imm = clamp(o.m.imm, 0, 100); o.m.doubt = clamp(o.m.doubt, 0, 100);
    return ST.fmt(pkF(S, nm(S, VS[kind])), { o: o.name, crowd: crowdOf(S) });
  }
  /* 止めようとしたときの返し。gname＝施している側（いなければ ''） */
  function saneNorm(S, SIT, o, gname) {
    var rng = S.rng, N = KH.SANE_NORM, v = { o: o.name, crowd: crowdOf(S), unit: SIT.unit, g: gname };
    if (!N) return '';
    var q = S.P.filter(function (x) { return x !== o && x.role !== 'out' && !x.quit && x.name !== gname; }), pool = null;
    if (gname && rng() < 0.45) pool = N.giver;
    else if (!S.noMob && rng() < 0.65) pool = S.v.sid === 'stage' && rng() < 0.6 ? N.stage : N.crowd;
    else if (q.length) { v.q = rng.pick(q).name; pool = N.res; }
    else if (gname) pool = N.giver;
    else if (!S.noMob) pool = N.crowd;
    return pool ? ST.fmt(pkF(S, pool), v) : '';
  }
  /* 自分が施されている最中の反応（施術の文に足す） */
  function saneTaken(S, SIT, o, gname) {
    var k = saneKind(S, o, 'taken'), t = saneSay(S, SIT, o, k);
    if (k === 'stop') t += saneNorm(S, SIT, o, gname);
    o.takenAt = S.step;
    return { text: t, why: '／正気の' + o.name + 'は「' + KIND_JA[k] + '」（' + toneJa(o) + '・改変度 ' + Math.round(o.m.imm) + '）' };
  }
  /* 衆人環視の舞台：実演のあとの客席（モブありのときだけ）。must＝正気の人が施された回は必ず */
  function stageCrowd(S, pn, rn, must) {
    if (S.v.sid !== 'stage' || S.noMob || !KH.STAGE_CROWD) return '';
    if (!must && S.rng() > 0.5) return '';
    return ST.fmt(pkF(S, KH.STAGE_CROWD), { p: pn, r: rn });
  }
  /* 施術を、正気の人が見ている（施術の記録のあとに、正気の人だけの一件として） */
  function saneWatch(S, SIT, g, r, said) {
    if (!said) return;
    var w = sanes(S, r).filter(function (x) { return x.takenAt !== S.step; });
    if (!w.length || S.rng() > (S.v.sid === 'stage' ? 0.45 : 0.2)) return;
    var o = S.rng.pick(w), k = saneKind(S, o, 'watch'), t = saneSay(S, SIT, o, k);
    if (!t) return;
    if (k === 'stop') t += saneNorm(S, SIT, o, g.name);
    ST.say(S, { actors: [o], tag: '正気の人', text: t, why: o.name + 'だけは改変されていない。まわりは誰も、' + g.name + 'の' + SIT.unit + 'をおかしいと思っていない→「' + KIND_JA[k] + '」（' + toneJa(o) + '・改変度 ' + Math.round(o.m.imm) + '）', mag: k === 'stop' ? 24 : 14 });
  }
  /* 衆人環視の舞台：モブの演者が、正気の人を志願者として壇上に上げる。
     モブとの場面に出してよい人（HK.State.mobSexOk）だけ。自分で攻めを選んだ人は、「モブには受け」にしていなければ連れていかない（HK.Pos.hardTopNpc）。
     演者の性別は恋愛対象に合わせる（恋愛対象が「なし」の人は連れていかない） */
  function canStage(S, p) { return !S.noMob && !!KH.STAGE_MOB && (!HK.State || HK.State.mobSexOk(p)) && !(HK.Pos && HK.Pos.hardTopNpc(p)) && p.likes !== 'none'; }
  var PAIR_JA = { fm: '女性の演者×男性', mf: '男性の演者×女性', ff: '女性どうし', mm: '男性どうし' };
  function stageMob(S, SIT, p) {
    var rng = S.rng, SM = KH.STAGE_MOB, bodyF = HK.Pos ? HK.Pos.isF(p) : p.gender === 'f';
    var mg = p.likes === 'm' ? 'm' : p.likes === 'f' ? 'f' : bodyF ? (rng() < 0.6 ? 'm' : 'f') : 'f';
    var pair = mg + (bodyF ? 'f' : 'm'), A = SM[pair], ak = rng.pick(Object.keys(A)), act = A[ak];
    var mname = rng.pick(SM.perf[mg]), ml = bodyF ? 0 : Math.round(5 + rng() * 9), first = !p.cnt.served;
    var v = { o: p.name, m: mname, p: mname, ml: ml }, sx = null;
    var t = first || rng() < 0.4 ? ST.fmt(pkF(S, outPool(SIT, 'taken')), v) : '';
    if (S.env.lewd === 'low') t += ST.fmt('{m}は{o}を施術台に寝かせ、満員の客席の前で実演を行った。――その内容は、パンフレットに演目の名前だけが残された。', v);
    else {
      t += ST.fmt(pkF(S, act.lead), v) + ST.fmt(pkF(S, E(S, 'smob.' + pair + '.' + ak + '.mid', act.mid)), v);
      sx = saneTaken(S, SIT, p, mname);
      t += sx.text;
      if (!eOn(S) && rng() < 0.5 && HK.Voice.CLIMAX[p.persona]) t += nClimax(S, p);
      t += ST.fmt(pkF(S, E(S, 'smob.' + pair + '.' + ak + '.climax', act.climax)), v) + stageCrowd(S, mname, p.name, true);
    }
    t = ef(S, t, null, p, { npc: true, name: mname, gender: mg, mobRole: 'staff', mobTop: true });
    p.cnt.served++; p.cnt.climax++; p.m.sem += ml; p.m.plea = clamp(p.m.plea + 25 * p.sens, 0, 100);
    p.m.imm += 12 + p.tr.ac * 8; p.m.doubt -= 4; p.takenAt = S.step;
    var o = ST.sayB(S, { actors: [p], tag: '公開実演', lewd: true, text: t, why: p.name + 'は正気のまま、志願者として壇上に上げられた（' + mname + '・' + PAIR_JA[pair] + (p.likes === 'm' || p.likes === 'f' ? '。演者は恋愛対象に合わせた' : '') + '）' + (sx ? sx.why : ''), mag: 30 }, p.name + '→壇上で公開実演', first);
    if (o && first) ST.key(S, o, p.name + 'が観客の前で施された');
  }

  /* ---------- 終業：営業時間が終わったら一日の区切り（その回の結末に合わせた締め） ---------- */
  var CLOSE = {
    clinic: { label: '診療終了', t: L('{end}時、待合室の照明が落ちた。受付の札が『本日の診療は終了しました』に裏返され、{place}の一日の診察が終わった。|最後のカルテが棚に戻され、{place}の自動ドアに鍵がかかった。消毒液のにおいだけが、静かな診察室に残った。|{end}時、閉院のアナウンスが流れた。採取済みの検体が保冷庫にずらりと並び、{place}の診療は今日も滞りなく終わった。') },
    hotel: { label: 'おもてなしの終わり', t: L('{end}時、フロントの照明が夜間用に切り替わった。{place}の今日のおもてなしは、これでおしまいだ。|最後の客室の扉が閉まり、廊下に静けさが戻った。{place}のおもてなしの時間が、今日も終わった。|{end}時、館内放送が今日のおもてなしの終了を告げた。客室係の台車が一台ずつ、裏の通路へ戻っていった。') },
    office: { label: '終業のチャイム', t: L('{end}時、終業のチャイムがフロアに鳴り響いた。{place}の一日の業務が、これで終わった。|終業のチャイムとともに、パソコンの画面が一台ずつ暗くなっていった。{place}の福利厚生室にも、鍵がかけられた。|{end}時、終業のチャイム。打刻機の前に短い列ができ、{place}のフロアから人が引いていった。') },
    spa: { label: '暖簾を下ろす', t: L('{end}時、番台の前に『本日終了』の札が下がった。{place}の暖簾が下ろされ、湯気だけが天井に残った。|最後の客が湯から上がると、洗い場の桶がきれいに積み直された。{place}の一日が、今日も終わった。|{end}時、表の暖簾が下ろされた。{place}の湯船の湯が抜かれ、タイルを流す音だけが響いていた。') },
    gym: { label: '閉館', t: L('{end}時、閉館の音楽が流れ始めた。{place}のマシンが一台ずつ拭き上げられ、照明が落とされた。|最後のセッションが終わり、{place}のシャッターが下ろされた。汗とタオルのにおいが、静かなフロアに残った。|{end}時、出退勤のボードが一斉に『退館』に変わった。{place}の一日の営業が終わった。') },
    stage: { label: '終演', t: L('{end}時、カーテンコールの拍手がようやく鳴りやんだ。緞帳が下り、{place}の今日の公演が終わった。|最後の演目が終わり、ホールの照明がゆっくりと灯った。観客たちは満ち足りた顔で、{place}の出口へ流れていった。|{end}時、終演のアナウンスが流れた。舞台の施術台にシーツが掛けられ、{place}の幕が静かに下りた。') }
  };
  var FATE_END = {
    '完全に改変された': L('{p}は{role}の制服をきちんと畳んでロッカーにしまった。今日の{unit}は{n}件。誇らしい一日だった、と{p}は本気で思っていた。|{p}は道具を一つずつ消毒して棚に戻した。{n}件の{unit}をこなした手は、もう次の営業日の段取りを考えている。|帰り支度をしながら、{p}は今日いちばん喜んでくれた相手の顔を思い出して、満足そうに頷いた。{p}にとって、これはただの立派な仕事だった。'),
    '常連客になった': L('{p}は会計を済ませ、次の{unit}の予約を入れてから{place}を出た。帰り道の足取りは、来たときよりずっと軽かった。|{p}は受付でスタンプカードに判を押してもらった。あと少しで特典だ。{p}は当たり前のように、来週もここへ来るつもりでいる。|{p}は{place}の看板を振り返り、満ち足りた顔で帰っていった。今日だけで{ml}ml。それが普通のことだと、{p}は信じきっていた。'),
    '違和感を抱えたまま': L('{p}は帰り際、{place}の入口で一度だけ立ち止まった。何かが引っかかっている。けれど、それが何なのかは最後まで言葉にならなかった。|{p}は鏡に映った自分の顔をしばらく見つめた。今日の自分は、本当に普通だったのだろうか。答えが出ないまま、{p}は灯りを消した。|{p}は胸の奥のもやもやを抱えたまま帰路についた。明日になれば忘れているかもしれないし、忘れていないかもしれない。|{p}は着替えを済ませたあと、ロッカーの扉に手をかけたまましばらく動けなかった。今日一日のどこかが、少しだけずれていた気がする。|{p}は{place}の自動ドアの前で振り返り、明かりの消えた受付を見つめた。何かを忘れている気がしたが、思い出す前にドアが閉まった。'),
    '違和感を打ち消した': L('{p}は一瞬よぎった疑いを、首を振って追い払った。おかしいのは自分のほうだ。そう決めてしまうと、{p}の心はすっと静かになった。|{p}は今日の違和感を、ただの疲れのせいにした。よく眠れば元どおりになる。{p}はそう言い聞かせて{place}をあとにした。|{p}はもう何も疑っていなかった。疑ったことさえ、帰る頃にはきれいに忘れていた。'),
    '再改変された': L('{p}はぼんやりとした顔で更衣室を出た。昼間に何かに気づいた気がするが、思い出せない。{p}の中で、改変はまた深く根を張っていた。|{p}はすっかり元どおりの笑顔で挨拶をして帰っていった。一度ほどけかけた改変は、前よりも固く結び直されていた。|{p}は鼻歌まじりに{place}をあとにした。今日の途中で抱いた疑いは、跡形もなく消えている。'),
    '気づかないふりを続けた': L('{p}は何も気づいていない顔のまま、最後まで{role}を演じきった。{place}を出て角を曲がった瞬間、{p}はようやく深く息を吐いた。|{p}は笑顔で挨拶をして頭を下げた。その笑顔の下で、{p}だけが今日の異常をはっきりと覚えている。|{p}は誰にも悟られないまま帰り支度を終えた。明日もまた、気づかないふりをしてここへ来るしかない。秘密を抱えた一日が、そうして終わった。'),
    '気づいたうえで続けた': L('{p}はすべてわかったうえで、最後の{unit}まで続けた。おかしな世界だ。それでも、{p}はこの世界が嫌いではなかった。|{p}は帰り際、{place}の看板を見上げて小さく笑った。これが異常だと、もう知ってしまった。それでも明日も来る、と{p}は決めていた。|{p}は火照りの残る体を抱えて、満ち足りた顔で帰っていった。気づいてしまったことは、もう{p}にとって楽しみの一つになっていた。'),
    '正気に戻った': L('{p}は{place}を出たところで振り返り、二度とここへは来ないと心に決めた。正気に戻った頭で見ると、灯りの消えた建物はひどく異様だった。胸の奥に残った熱だけが、今日が夢ではなかったことを告げていた。|{p}は着替えもそこそこに外へ出て、夜の空気を深く吸い込んだ。自分は目を覚ましてしまった。その重さを抱えたまま、{p}は家路を急いだ。|{p}は帰りの電車で、今日起きたことを手帳に書き留めた。明日になれば、自分もまた忘れてしまうかもしれない。だから、せめて記録だけは残しておく。'),
    '逃げ出した': L('{p}は{place}から遠く離れた公園のベンチで、ようやく息を整えた。あの建物の中で起きていたことを、誰に話せば信じてもらえるだろう。|{p}は逃げ帰った部屋で鍵を二重にかけた。窓の外の街は、何事もなかったように静かだった。|{p}は二度と{place}の前を通らない道を選んで帰った。逃げ切れたのは、たぶん運が良かっただけだ。'),
    '改変に呑み込まれた': L('{p}は終わりの片づけを当たり前のように手伝っていた。朝、あれほど戸惑っていたことは、もう思い出せない。|{p}は次の予約を入れてから帰っていった。正気のまま紛れ込んだはずの人は、もうどこにもいなかった。|{p}はほかの人たちと笑い合いながら{place}を出た。その笑顔は、もうこの世界の住人のものだった。'),
    '正気のまま居残った': L('{p}は最後まで正気のまま、{place}の片隅でその一日を見届けた。誰に訴えても、首をかしげられるだけだった。|{p}は閉店まで居残り、灯りが落ちるのを見届けてから外へ出た。おかしいのは世界のほうだ。{p}はそれだけは手放さなかった。|{p}は帰り道、すれ違う人たちの顔を一人ずつ確かめた。誰もが穏やかで、誰もが改変されていた。{p}は正気のまま、その中に取り残されていた。')
  };
  var DAY_END = {
    woke: L('{place}の一日が終わった。{names}だけが目を覚ましたが、世界はまだ何も変わっていない。明日の朝もまた、同じ営業が始まる。|灯りの消えた{place}に、明日の予約表だけが残された。{names}が見つけたほころびは、まだ小さな一つにすぎない。|こうして{place}の一日は幕を下ろした。{unit}は合わせて{total}件。目を覚ましたのは{names}だけだった。'),
    noticed: L('{place}の一日が終わった。{names}は違和感に触れたが、世界は少しも揺らがなかった。|こうして{place}の一日は幕を下ろした。{names}が覚えた引っかかりも、一晩眠れば薄れていくのだろう。|灯りが落ちた{place}は、明日の営業を静かに待っている。{names}の違和感だけを、誰にも知られないまま残して。'),
    none: L('{place}の一日が終わった。{unit}は合わせて{total}件。誰ひとり、何もおかしいとは思わなかった。|こうして{place}の一日は、何事もなく幕を下ろした。改変された世界では、これが今日もいつもどおりの一日だった。|灯りが落ちた{place}の前を、帰りの人たちが穏やかな顔で通り過ぎていく。明日もまた、同じ一日が始まる。')
  };
  function closeDay(S, SIT, place, sid, woke, noticed, total) {
    var P = S.P, end = (START[sid] + S.env.slots) % 24, C = CLOSE[sid] || CLOSE.office;
    ST.step(S, C.label);
    S.label = C.label;
    ST.say(S, { kind: 'phase', text: ST.fmt(pkF(S, C.t), { end: end, place: place }) });
    P.forEach(function (p) {
      if (p.after) return;   /* 我に返ったあとの結末がある人は、あとの場面で締める */
      var pool = FATE_END[p.fate] || FATE_END[p.role === 'giver' ? '完全に改変された' : '常連客になった'];
      if (!p.cnt.served || !Math.round(p.m.sem)) pool = pool.filter(function (x) { return (p.cnt.served || x.indexOf('{n}') < 0) && x.indexOf('{ml}') < 0; });
      ST.say(S, { actors: [p], tag: '一日の終わり', text: ST.fmt(pkF(S, pool), { p: p.name, role: p.roleLabel, unit: SIT.unit, n: p.cnt.served, ml: Math.round(p.m.sem), place: place }), why: p.name + 'の結末：' + p.fate });
    });
    afterDay(S, SIT, place, sid, end);
    var k = S.wear && KH.AFTER ? 'wear' : woke.length ? 'woke' : noticed.length ? 'noticed' : 'none', who = k === 'wear' ? [] : k === 'woke' ? woke : noticed;
    var o = ST.say(S, { kind: 'phase', actors: who, text: ST.fmt(pkF(S, k === 'wear' ? KH.AFTER.DAY_END_WEAR : DAY_END[k]), { place: place, names: names(who), unit: SIT.unit, total: total }) });
    ST.key(S, o, '営業終了：' + place + 'の一日が終わった' + (k === 'wear' ? '（改変が解けた）' : ''));
  }
  /* ---------- 我に返ったあと：改変が解けた回は全員（逃げ出した人を除く）、解けない回は途中で正気に戻った人と最後まで正気だった人 ----------
     困惑する（con）・放心する（daze）・受け入れる（acc）・背を向ける（rej）。文は solo-kaihen-after.js（KH.AFTER） */
  var AFTER_JA = { con: '困惑', daze: '放心', acc: '受け入れ', rej: '背を向ける' };
  function sane0(p) { return p.role === 'out' && !p.sunk; }
  /* どれだけ気持ちよかったか（0〜1）：いちばん昂ったところと、達した回数 */
  function enjoyOf(p) { return clamp((p.pleaPk || 0) / 100 * 0.5 + Math.min(1, (p.cnt.climax + p.cnt.gclimax) / 3) * 0.5, 0, 1); }
  function afterKind(S, p) {
    var t = p.tr, e = enjoyOf(p), im = (p.immPk || p.m.imm) / 100, sn = sane0(p), tl = (KH.AFTER.TILT || {})[p.persona] || {};
    var mid = 1 - Math.abs(im - 0.5) * 2;
    var w = {
      con: 0.15 + t.a * 0.35 + t.caution * 0.25 + mid * 0.25 + (sn ? 0.15 : 0) + (tl.con || 0),
      daze: 0.08 + im * 0.55 + e * 0.35 + t.ac * 0.2 + (1 - t.a) * 0.15 + (S.v.sid === 'stage' && p.cnt.served ? 0.15 : 0) + (tl.daze || 0),
      acc: 0.05 + t.fc * 0.45 + e * 0.6 + t.np * 0.15 + (p.accepted ? 0.5 : 0) + (p.role === 'out' && p.sunk ? 0.25 : 0) - (sn && !p.cnt.served ? 0.15 : 0) + (tl.acc || 0),
      rej: 0.12 + t.cp * 0.45 + t.a * 0.15 + (1 - e) * 0.35 + (p.awakeKind === 'snap' ? 0.25 : 0) + (tl.rej || 0)
    };
    var k = HK.weighted(S.rng, ['con', 'daze', 'acc', 'rej'], function (x) { return Math.pow(Math.max(0.03, w[x]), 2); });
    return { k: k, e: e, im: Math.round(im * 100), sane: sn };
  }
  /* 場面：施した／受けた／何もしなかった／正気のまま施された／正気のまま見ていた（公開施術の舞台は、客席の前だった人を別に） */
  function afterCtx(S, p) {
    var st = S.v.sid === 'stage', did = p.cnt.served > 0;
    if (sane0(p)) return did ? (st ? 'ssaneT' : 'saneT') : 'saneW';
    if (!did) return 'idle';
    if (p.role === 'giver') return st ? 'sgiver' : 'giver';
    return st ? 'staker' : 'taker';
  }
  function afterFate(p) {
    var a = p.after;
    if (a.k === 'rej') return a.sane ? '正気のまま居残った' : '正気に戻った';
    return (a.sane ? '正気のまま' : '我に返って') + { con: '困惑した', daze: '放心した', acc: '受け入れた' }[a.k];
  }
  function afterDay(S, SIT, place, sid, end) {
    var A = KH.AFTER, L2 = S.P.filter(function (p) { return p.after; });
    if (!A || !L2.length) return;
    ST.step(S, S.wear ? '改変が解けたあと' : 'その夜');
    var ph = S.wear ? pkF(S, A.WEAR_SITE[sid] || A.WEAR_SITE.office) + pkF(S, A.WEAR_BODY) : pkF(S, A.NIGHT);
    ST.say(S, { kind: 'phase', actors: L2, text: ST.fmt(ph, { place: place, end: end, names: names(L2) }), why: S.wear ? '設定「改変が解ける」（' + ({ auto: 'おまかせ・改変の強さ ' + S.env.depth, on: '営業のあとに解ける' }[S.env.wear] || '') + '）' : '' });
    L2.forEach(function (p) {
      var a = p.after, v = { p: p.name, place: place, role: p.roleLabel, unit: SIT.unit, n: p.cnt.served }, t;
      if (a.k === 'rej') t = ST.fmt(pkF(S, a.sane ? (S.wear ? A.REJ_WEAR : FATE_END['正気のまま居残った']) : S.wear && p.awakeKind !== 'snap' && A.REJ_ALT ? A.REJ_ALT : FATE_END['正気に戻った']), v);
      else {
        t = ST.fmt(pkF(S, A.BODY[a.k][a.ctx]), v);
        if (p.cnt.served && A.ENJ[a.k]) t += ST.fmt(pkF(S, A.ENJ[a.k][a.e >= 0.5 ? 'hi' : 'lo']), v);
        var VA = VO && VO.AFTER && VO.AFTER[p.persona];
        if (VA && VA[a.k]) t += p.name + pkF(S, VA[a.k]);
      }
      var o = ST.say(S, { actors: [p], tag: a.k === 'rej' ? '一日の終わり' : '我に返って', text: t, why: p.name + 'の結末：' + p.fate + '（' + a.why + '）', mag: a.k === 'rej' ? 0 : 30 });
      if (a.k !== 'rej') ST.key(S, o, p.name + 'は' + { con: '困惑した', daze: '放心した', acc: '受け入れた' }[a.k]);
    });
  }
  /* ---------- 結末 ---------- */
  function fateOf(p) {
    if (p.role === 'out') return p.fled ? '逃げ出した' : p.sunk ? '改変に呑み込まれた' : '正気のまま居残った';
    if (p.awakeKind === 'snap') return '正気に戻った';
    if (p.awakeKind === 'accept') return '気づいたうえで続けた';
    if (p.awakeKind === 'hide') return '気づかないふりを続けた';
    if (p.awakeKind === 'reset' || p.cnt.reset) return '再改変された';
    if (p.awakeKind === 'deny') return '違和感を打ち消した';
    if (p.m.doubt > 40) return '違和感を抱えたまま';
    return p.role === 'giver' ? '完全に改変された' : '常連客になった';
  }
  function finish(S, input, SIT, place, sid) {
    var P = S.P, wm = S.env.wear || 'auto';
    /* 営業のあとに改変が解けるか（おまかせなら、改変が弱いほど解けやすい） */
    S.wear = !!KH.AFTER && (wm === 'on' || (wm === 'auto' && S.rng() < 0.12 + (1 - S.env.depth / 100) * 0.45));
    P.forEach(function (p) {
      p.fate = fateOf(p);
      p.after = null;
      if (KH.AFTER && !p.fled && (S.wear ? true : p.awakeKind === 'snap' || sane0(p))) {
        var a = p.after = afterKind(S, p);
        a.ctx = afterCtx(S, p);
        a.why = toneJa(p) + '・改変度の最深 ' + a.im + '・気持ちよさ ' + Math.round(a.e * 100) + (p.cnt.climax + p.cnt.gclimax ? '・達した ' + (p.cnt.climax + p.cnt.gclimax) + '回' : '') + (a.sane ? '・最後まで正気だった' : p.awakeKind === 'snap' ? '・途中で正気に戻っていた' : S.wear ? '・改変が解けて我に返った' : '');
        p.fate = afterFate(p);
        if (a.k !== 'rej' || S.wear) p.notes.push('我に返ったあと：' + AFTER_JA[a.k] + '（' + a.why + '）');
      }
      var top = Object.keys(p.cnt.acts).sort(function (a, b) { return p.cnt.acts[b] - p.cnt.acts[a]; })[0];
      if (p.role === 'giver') p.notes.push(SIT.unit + ' ' + p.cnt.served + '件・採取量 ' + Math.round(p.m.sem) + 'ml' + (top ? '・いちばん多かったのは「' + top + '」' : '') + (p.cnt.gclimax ? '・施しながら自分も' + p.cnt.gclimax + '回達した' : ''));
      else p.notes.push((p.role === 'out' ? '受けてしまった施術' : '受けた' + SIT.unit) + ' ' + p.cnt.served + '回・出した量 ' + Math.round(p.m.sem) + 'ml');
      p.notes.push('違和感 ' + Math.round(p.m.doubt) + '／改変度 ' + Math.round(p.m.imm) + (p.cnt.body ? '・体の違和感 ' + p.cnt.body + '回' : '') + (p.cnt.glitch ? '・ほころびに触れた ' + p.cnt.glitch + '回' : '') + (p.cnt.reset ? '・再改変 ' + p.cnt.reset + '回' : ''));
      p.notes.push('方針「' + p.action.label + '」・目標「' + p.goal.label + '」');
      if (p.role === 'out' && (p.cnt.notice || p.cnt.stop || p.cnt.swept)) p.notes.push('正気のままの反応（' + toneJa(p) + '）：気づいた ' + p.cnt.notice + '回・止めようとした ' + p.cnt.stop + '回・流された ' + p.cnt.swept + '回');
    });
    var G = P.filter(function (p) { return p.role === 'giver'; });
    var woke = P.filter(function (p) { return p.awakeKind === 'snap' || p.fled; });
    var aft = P.filter(function (p) { return p.after; });
    var noticed = P.filter(function (p) { return p.cnt.awake || p.role === 'out'; });
    var topG = G.slice().sort(function (a, b) { return b.m.sem - a.m.sem; })[0];
    var title = (sid === 'stage' ? '「' + place + '」の公演は、今日も満員だった。' : '「' + place + '」は今日も平常運転。') + (S.wear ? '――けれど営業のあと、改変は解けた。' : woke.length ? names(woke) + 'だけが、おかしさに気づいて正気に戻った。' : noticed.length ? names(noticed) + 'は違和感に触れたが、世界は何も変わらなかった。' : '誰ひとり、違和感に気づかなかった。') + afterTitle(S, aft);
    var lines = P.map(function (p) { return p.name + '（' + p.roleLabel + '）：' + p.fate; });
    if (topG) lines.push('いちばん搾ったのは' + topG.name + '（' + Math.round(topG.m.sem) + 'ml）');
    var total = G.reduce(function (s, g) { return s + g.cnt.served; }, 0), sem = G.reduce(function (s, g) { return s + g.m.sem; }, 0);
    closeDay(S, SIT, place, sid, woke, noticed, total);
    var rows = P.slice().sort(function (a, b) { return (b.role === 'giver') - (a.role === 'giver') || b.m.sem - a.m.sem; }).map(function (p, k) {
      return { i: p.i, rank: '', cells: [p.roleLabel, String(p.cnt.served), Math.round(p.m.sem) + 'ml', String(p.role === 'giver' ? p.cnt.gclimax : p.cnt.climax), String(Math.round(p.m.doubt)), p.fate] };
    });
    return ST.result(S, input, {
      ending: { title: title, kind: woke.length || S.wear ? 'ok' : 'over', lines: lines },
      estats: [['施術', total + '件'], ['総採取量', Math.round(sem) + 'ml'], ['気づいた人', noticed.length + '人'], ['正気に戻った', woke.length + '人']].concat(aft.length ? [['改変', S.wear ? '営業のあとに解けた' : '解けなかった'], ['我に返ったあと', afterCount(aft)]] : []),
      table: { title: '住人ごとの比較', hint: '採取量は施す側なら搾った量、受ける側なら出した量。絶頂は施す側なら「自分も達した回数」。', cols: ['役割', '件数', '精', '絶頂', '違和感', '結末'], rows: rows },
      meters: [{ label: '改変度', color: '--accent' }, { label: '違和感', color: '--warn' }, { label: '快感', color: '--pine', dash: true }, { label: '精', color: '--love', max: 150, unit: 'ml' }],
      meta: SIT.name + '「' + place + '」・' + S.env.slots + '時間',
      summary: SIT.name + '：' + P.map(function (p) { return p.name + '=' + p.fate; }).join('、')
    });
  }
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
  /* 結末の見出しに足す一文：「Aは戸惑い、Bは放心し、Cは受け入れた。」 */
  var AFT_V = { con: ['戸惑い', '戸惑った'], daze: ['放心し', '放心した'], acc: ['起きたことを受け入れ', '起きたことを受け入れた'], rej: ['背を向け', '背を向けた'] };
  function afterTitle(S, aft) {
    var g = ['con', 'daze', 'acc', 'rej'].map(function (k) { return [k, aft.filter(function (p) { return p.after.k === k; })]; }).filter(function (x) { return x[1].length; });
    if (!g.length || (!S.wear && g.length === 1 && g[0][0] === 'rej')) return '';
    return (S.wear ? '我に返った' : 'その夜、') + g.map(function (x, i) { return names(x[1]) + 'は' + AFT_V[x[0]][i === g.length - 1 ? 1 : 0]; }).join('、') + '。';
  }
  function afterCount(aft) {
    return ['con', 'daze', 'acc', 'rej'].map(function (k) { var n = aft.filter(function (p) { return p.after.k === k; }).length; return n ? AFTER_JA[k] + n : ''; }).filter(Boolean).join('・');
  }
})();
