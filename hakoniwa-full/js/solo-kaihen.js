/* 箱庭シミュレーター: 常識改変（R18）
   エロいことが「当たり前の仕事」になった世界。理性的な人ほど、真面目に施す側として働いている。
   何をするのか、違和感に気づくのか、気づいたらどうするのかを、一日の営業を通して見る */
(function () {
  'use strict';
  var HK = window.HK, KH = HK.KAIHEN, ST = HK.Story, clamp = HK.clamp;
  var VO = KH && KH.VOICE;
  function L(s) { return s.split('|'); }

  var scen = {
    id: 'kaihen', name: '常識改変', kicker: '1〜6人・R18', solo: true, maxCast: 6, minCast: 1,
    desc: 'エロいことが当たり前の仕事になった世界。搾精クリニック・おもてなしホテル・福利厚生の会社・洗い屋の銭湯・搾精ジムで、理性的な人ほど真面目に「施す側」として働く。何をするのか、体の違和感に気づくのか。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: 'コマ', simulate: function (input) { return run(input); },
    castHint: '1〜6人。「おまかせ」なら、理性的な人（A・CPが高い）ほど施す側になり、残りは客として通います。「正気のまま紛れ込む」を選ぶと、ひとりだけ改変されていない人が混ざります。',
    env: [
      { id: 'sit', label: '舞台', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'clinic', label: '搾精クリニック（医師と患者）' }, { v: 'hotel', label: '特別おもてなしホテル（客室係と宿泊客）' }, { v: 'office', label: '福利厚生の手厚い会社（処理当番と社員）' }, { v: 'spa', label: '洗い屋のいる銭湯（洗い屋と入浴客）' }, { v: 'gym', label: '搾精トレーニングジム（トレーナーと会員）' }] },
      { id: 'depth', label: '改変の強さ', min: 0, max: 100, def: 60, lo: 'ほころびだらけ', hi: '完璧', desc: '強いほど違和感に気づきにくい。弱いと、理性的な人ほどすぐに気づく' },
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
  HK.SCENARIOS.kaihen = scen;
  HK.SCEN_ORDER.push('kaihen');

  var START = { clinic: 9, hotel: 15, office: 9, spa: 14, gym: 10 };
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
    P.forEach(function (p) {
      var pk = (input.perChar && input.perChar[p.i] && input.perChar[p.i].pick || {}).role;
      p.role = pk && ROLE[pk] ? pk : order.indexOf(p) < nG ? 'giver' : 'taker';
      p.roleLabel = p.role === 'giver' ? SIT.giver : p.role === 'taker' ? SIT.taker : '正気のまま紛れ込んだ人';
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      var sens = p.stats.sens || 3;
      p.sens = 0.6 + sens * 0.18;
      p.m = { imm: p.role === 'out' ? 0 : clamp(depth * 70 + p.tr.ac * 15 + (1 - p.tr.a) * 10, 5, 95), doubt: p.role === 'out' ? 75 : clamp(p.tr.a * 12 + (1 - depth) * 25 + (p.goal.id === 'odd' ? 15 : 0), 0, 60), plea: 0, sem: 0 };
      /* 違和感の伸びやすさ：理性的（A・CP）ほど、改変が弱いほど、気づきやすい */
      p.doubtRate = (0.35 + p.tr.a * 0.9 + p.tr.cp * 0.35 - p.tr.ac * 0.2) * (1.35 - depth);
      p.cnt = { served: 0, climax: 0, gclimax: 0, glitch: 0, body: 0, awake: 0, reset: 0, acts: {} };
      p.usedActs = [];
    });
    var gs = function () { return P.filter(function (p) { return p.role === 'giver' && !p.quit; }); };
    var keys = ['imm', 'doubt', 'plea', 'sem'];

    /* ---------- 開店 ---------- */
    ST.step(S, '開店前');
    ST.say(S, { kind: 'phase', text: '舞台は「' + place + '」（' + SIT.name + '）。' + SIT.world });
    P.forEach(function (p) {
      var t;
      if (p.role === 'giver') t = ST.fmt(ST.pick(S, SIT.intro), { p: p.name });
      else if (p.role === 'taker') t = p.name + 'は今日、' + place + 'に' + SIT.unit + 'の予約を入れていた。' + ST.pick(S, ['いつもの習慣だ。', '月に一度の楽しみだった。', '同僚に勧められて、初めて来た。', '前回の担当が忘れられなかった。']);
      else t = ST.fmt(ST.pick(S, nm(S, KH.OUT.see)), { o: p.name });
      ST.say(S, { actors: [p], tag: p.roleLabel, text: t, why: p.role === 'giver' ? '理性的な気質（A ' + Math.round(p.eg.A) + '・CP ' + Math.round(p.eg.CP) + '）ほど、改変された世界では真面目な「' + SIT.giver + '」になる' : p.role === 'out' ? p.name + 'だけは改変されていない' : '' });
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
        var outs = P.filter(function (p) { return p.role === 'out' && !p.fled && !p.sunk && okPair(g, p) && !(HK.Pos && HK.Pos.hardTop(p)); });
        if (!r && outs.length && rng() < 0.3) r = rng.pick(outs);
        if (!r && S.noGuest) {
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
      });
      ST.flushShort(S, 'ほかに：');
      ST.snap(S, keys);
    }
    return finish(S, input, SIT, place, sid);
  }

  /* ---------- 施術 ---------- */
  function okPair(a, b) { return !HK.Pos || HK.Pos.okSex(a, b); }
  /* 自分で攻めを選んだ人の喘ぎ・絶頂の声から、受け身の台詞を外す */
  function topL(p, list) { return HK.R18M && HK.R18M.topLines ? HK.R18M.topLines(p, list) : list; }
  /* 攻めの施す側には回さない施術（{p} の体に指を入れられる）／攻めの受ける側には回さない施術（{r} の中に指を入れる・機械に搾られる・押さえつけて責める） */
  var G_RECV = { '壺洗い': 1 };
  var R_RECV = { '前立腺マッサージ': 1, 'ストレッチ': 1, '触診（全身）': 1 };
  function serve(S, SIT, g, r, lew) {
    if (r && HK.Pos && HK.Pos.ff(g, r) && KH.FF_ACTS) return serveFF(S, SIT, g, r, lew);
    var rng = S.rng, npc = !r, rname = npc ? rng.pick(SIT.npc) : r.name;
    /* 受け攻め：施す側が攻めなら「攻めの施術」だけ、受けなら「受け入れる施術」だけを使う */
    var Pz = HK.Pos, gTop = false, gFree = false;
    if (Pz) {
      if (r) { gTop = Pz.order(g, r, [r, g])[0] === g; gFree = !Pz.fixed(g, r); }
      else { var vp = Pz.vsNpc(g, ''); gTop = vp === 'top'; gFree = Pz.of(g) === 'riba'; }
    }
    var pool = SIT.acts.concat((KH.TOP_ACTS && KH.TOP_ACTS[S.v.sid]) || []).filter(function (a) {
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
      var mlR = 0, tr = ST.fmt(ST.pick(S, F.rush), { p: g.name, r: ns[0], r2: ns[1], r3: ns[2], a1: as[0][0], a2: as[1][0], a3: as[2][0] });
      var mlx = Math.round(4 + rng() * 10); mlR = mlx * 3;
      tr += ST.fmt(ST.pick(S, KH.CLIMAX[KH.ACTKIND[as[2][0]]] || KH.CLIMAX.hand), { p: g.name, r: ns[2], ml: mlx }) + ST.fmt(ST.pick(S, F.rushEnd), { p: g.name });
      g.cnt.served += 3; g.m.sem += mlR; g.m.imm += 5; g.m.plea += (14 + rng() * 14) * g.sens;
      as.forEach(function (a) { g.cnt.acts[a[0]] = (g.cnt.acts[a[0]] || 0) + 1; });
      if (g.m.plea >= 100) { g.m.plea = 25; g.cnt.gclimax++; tr += ST.pick(S, gTop && !gFree ? KH.GCLIMAX.filter(function (x) { return !/奥/.test(x); }) : KH.GCLIMAX).replace(/\{p\}/g, g.name); }
      ST.sayB(S, { actors: [g], tag: '流れ作業', text: tr, why: g.name + 'の担当に予約が重なった（客の多さ ' + S.env.npc + '）', mag: 20 }, g.name + '→三人を連続対応（' + mlR + 'ml）', g.cnt.served === 3);
      return;
    }
    var r2name = fl === 'double' ? rng.pick(SIT.npc.filter(function (x) { return x !== rname; })) : null;
    var t = (r && r.role === 'giver' ? ST.fmt(ST.pick(S, L('客が途切れた合間に、{p}は{r}を練習台にすることにした。「今日の手順、確認させて」|{p}は{r}を施術台に寝かせた。「次のお客様の前に、一度通しでやっておきたいの」|{r}が「最近、自分も溜まってて」と言うと、{p}は当然のように施術台を勧めた。')), v) : '') + (r && r.role === 'out' ? ST.fmt(ST.pick(S, nm(S, KH.OUT.taken)), { o: r.name, p: g.name }) : fl === 'talk' ? ST.fmt(ST.pick(S, nm(S, F.talk)), v) : fl === 'double' ? ST.fmt(ST.pick(S, F.double), { p: g.name, r: rname, r2: r2name }) : (fl === 'watch' ? ST.fmt(ST.pick(S, F.watch), v) : '') + ST.fmt(ST.pick(S, nm(S, SIT.consult)), v)) + g.name + (VO && VO.GIVER[g.persona] && rng() < 0.55 ? ST.pick(S, VO.GIVER[g.persona]) : ST.pick(S, nm(S, SIT.lines[g.top] || SIT.lines.NP)));
    if (lew === 'low') t += ST.fmt('{p}は「' + act[0] + '」を行った。――その内容は、カルテに数字だけが残された。', v);
    else {
      var kind0 = KH.ACTKIND[act[0]];
      /* ノリノリの施す側は、受け入れる施術で自分から跨る・誘う */
      if (F && kind0 === 'in' && HK.Pos && HK.Pos.nori(g) && rng() < 0.55) t += ST.fmt(ST.pick(S, nm(S, F.nori)), v);
      else t += ST.fmt(ST.pick(S, nm(S, L(act[1]))), v);
      if ((lew === 'high' || rng() < 0.55) && !mobby(S, act[2])) t += ST.fmt(act[2], v);
      if (fl === 'mishap') t += ST.fmt(ST.pick(S, nm(S, F.mishap)), v);
      /* 施す側の喘ぎ声と心の声（仕事なのに……） */
      if (KH.MOAN && kind0 === 'in' && rng() < (lew === 'high' ? 0.85 : 0.6)) {
        t += g.name + '「' + ST.pick(S, KH.MOAN_P[g.persona] && rng() < 0.4 ? KH.MOAN_P[g.persona] : KH.MOAN) + '」';
        g.m.plea += 6 * g.sens;
      }
      if (KH.MOAN && kind0 === 'top' && rng() < (lew === 'high' ? 0.6 : 0.4)) { t += g.name + '「' + ST.pick(S, KH.MOAN_P[g.persona] && rng() < 0.4 ? KH.MOAN_P[g.persona] : KH.MOAN) + '」'; g.m.plea += 4 * g.sens; }
      if (KH.INNER && (kind0 === 'in' || kind0 === 'mouth' || kind0 === 'top') && rng() < (g.m.doubt > 15 ? 0.4 : 0.18)) { t += g.name + ST.pick(S, kind0 === 'top' || (gTop && !gFree) ? KH.INNER_TOP : KH.INNER); g.m.doubt += 2 * g.doubtRate; }
      if (r && rng() < 0.45 && HK.Voice.CLIMAX[r.persona]) t += r.name + '「' + ST.pick(S, topL(r, HK.Voice.CLIMAX[r.persona])) + '」';
    }
    var ml = Math.round((r ? 6 + rng() * 8 : 4 + rng() * 12) * (1 + ai * 0.08));
    t += ST.fmt(ST.pick(S, KH.CLIMAX[KH.ACTKIND[act[0]] || KH.climaxKind(t)]), { p: g.name, r: rname, ml: ml });
    if (fl === 'double') { t += ST.fmt(ST.pick(S, F.doubleEnd), { p: g.name, r: rname, r2: r2name }); g.cnt.served++; g.m.sem += ml; }
    if (fl === 'watch') { t += ST.fmt(ST.pick(S, F.watchEnd), v); g.m.imm += 4; }
    g.cnt.served++; g.m.sem += ml;
    g.m.imm += 2.5 + (g.goal.id === 'top' ? 2 : 0);
    var gain = (8 + ai * 4 + rng() * 10) * g.sens;
    g.m.plea += gain;
    var why = g.name + '（' + SIT.giver + '・' + g.topWhy + '）の「' + act[0] + '」' + (g.action.id === 'bold' ? '／大胆な方針' : g.action.id === 'care' ? '／丁寧な方針' : '');
    if (g.m.plea >= 100) { g.m.plea = 25; g.cnt.gclimax++; t += ST.pick(S, gTop && !gFree ? KH.GCLIMAX.filter(function (x) { return !/奥/.test(x); }) : KH.GCLIMAX).replace(/\{p\}/g, g.name) + (lew !== 'low' && rng() < 0.6 ? g.name + '「' + ST.pick(S, topL(g, HK.Voice.CLIMAX[g.persona] || HK.Voice.CLIMAX.gentle)) + '」' : ''); g.m.doubt += 6 * g.doubtRate; why += '／' + g.name + '自身も達した（感じやすさ ' + g.stats.sens + '）'; }
    if (r) {
      r.cnt.served++; r.cnt.climax++; r.m.sem += ml; r.m.plea = clamp(r.m.plea + 25 * r.sens, 0, 100);
      if (r.role === 'out') { r.m.imm += 14 + r.tr.ac * 10; r.m.doubt -= 6; why += '／正気の' + r.name + 'も、施術を受けてしまった'; }
      else {
        r.m.imm += 3; r.m.doubt += r.doubtRate * (2 + rng() * 4);
        var k = r.m.doubt > 45 ? 'doubt' : r.tr.ac > 0.6 ? 'shy' : 'calm';
        t += ST.fmt(ST.pick(S, VO && rng() < 0.75 ? (k === 'doubt' ? VO.DOUBT[r.persona] : VO.TAKER[r.persona]) || KH.TAKER[k] : KH.TAKER[k]), { r: r.name });
      }
    }
    if (r && r.role === 'giver') why += '／モブなし：同じ' + SIT.giver + 'の' + r.name + 'を練習台にした';
    if (fl !== 'std') why += '／' + { talk: '常連との世間話', double: '二人同時の対応', watch: S.v.boss + 'の立ち会い', mishap: 'ちょっとしたトラブル' }[fl];
    var o = ST.sayB(S, { actors: r ? [g, r] : [g], tag: act[0], text: t, why: why, mag: 18 + ai * 3 }, g.name + '→' + rname + '（' + act[0] + '・' + ml + 'ml）', g.cnt.served === 1 || (r && r.cnt.served === 1));
    if (o && g.cnt.served === 1) ST.key(S, o, g.name + 'の最初の' + SIT.unit);
    /* 施しながら、体が変わっていく */
    if (rng() < 0.12 + g.stats.sens * 0.04 && g.m.plea > 40) {
      g.cnt.body++; g.m.doubt += 7 * g.doubtRate; g.m.plea += 8;
      ST.say(S, { actors: [g], tag: '体の違和感', text: ST.fmt(ST.pick(S, KH.BODY), v), why: '施すたびに' + g.name + 'の体も昂っている（快感 ' + Math.round(g.m.plea) + '）', mag: 20 });
    }
    g.m.doubt += g.doubtRate * rng() * 2.5;
  }
  /* 女性どうしの施術（施す側も受ける側も女性の住人）：KH.FF_ACTS の書き下ろしを使う。
     動くのは HK.Pos.order の先頭（施す側が先頭なら give、受ける側が先頭なら take）。採取量の代わりに反応を記録する */
  function serveFF(S, SIT, g, r, lew) {
    var rng = S.rng, NG = KH.FF_NG, sid = S.v.sid, FA = KH.FF_ACTS[sid] || KH.FF_ACTS.clinic;
    var gAct = HK.Pos.order(g, r, [g, r])[0] === g, dir = gAct ? 'give' : 'take';
    var act = rng.pick(FA[dir]);
    g.cnt.acts[act[0]] = (g.cnt.acts[act[0]] || 0) + 1;
    var v = { p: g.name, r: r.name, place: S.v.place, boss: S.v.boss };
    var ok = function (l) { var f = (l || []).filter(function (x) { return !NG.test(x); }); return f.length ? f : null; };
    var t = r.role === 'giver' ? ST.fmt(ST.pick(S, L('客が途切れた合間に、{p}は{r}を相手に、今日の手順を確かめることにした。|{p}は{r}を施術台に呼んだ。「次のお客様の前に、一度通しでやっておきたいの」')), v)
      : r.role === 'out' ? ST.fmt(ST.pick(S, ok(nm(S, KH.OUT.taken)) || KH.OUT.taken), { o: r.name, p: g.name })
      : ST.fmt(ST.pick(S, ok(nm(S, SIT.consult)) || KH.FF_CONSULT), v);
    var gl = (VO && VO.GIVER[g.persona] && rng() < 0.55 && ok(VO.GIVER[g.persona])) || ok(nm(S, SIT.lines[g.top] || SIT.lines.NP)) || KH.FF_GIVER;
    t += g.name + ST.pick(S, gl);
    if (lew === 'low') t += ST.fmt('{p}は「' + act[0] + '」を行った。――その内容は、カルテに数字だけが残された。', v);
    else {
      t += ST.fmt(ST.pick(S, L(act[1])), v);
      if (!gAct && KH.MOAN && rng() < 0.6) { t += g.name + '「' + ST.pick(S, KH.MOAN_P[g.persona] && rng() < 0.4 ? KH.MOAN_P[g.persona] : KH.MOAN) + '」'; g.m.plea += 6 * g.sens; }
      if (KH.INNER && rng() < (g.m.doubt > 15 ? 0.35 : 0.15)) { t += g.name + ST.pick(S, (gAct ? KH.INNER_TOP : KH.INNER).filter(function (x) { return !/奥/.test(x); })); g.m.doubt += 2 * g.doubtRate; }
      var who = gAct ? r : g;
      if (rng() < 0.45 && HK.Voice.CLIMAX[who.persona]) t += who.name + '「' + ST.pick(S, topL(who, HK.Voice.CLIMAX[who.persona])) + '」';
      t += ST.fmt(ST.pick(S, KH.FF_CLIMAX[dir]), v);
    }
    g.cnt.served++; g.m.imm += 2.5 + (g.goal.id === 'top' ? 2 : 0);
    g.m.plea += (gAct ? 8 : 18) * g.sens + rng() * 8;
    var why = g.name + '（' + SIT.giver + '・' + g.topWhy + '）の「' + act[0] + '」／女性どうしの施術（' + (gAct ? g.name : r.name) + 'が動く側）';
    if (!gAct) g.cnt.gclimax++;
    if (g.m.plea >= 100) { g.m.plea = 25; if (gAct) { g.cnt.gclimax++; t += ST.pick(S, KH.GCLIMAX.filter(function (x) { return !/奥/.test(x); })).replace(/\{p\}/g, g.name); } g.m.doubt += 6 * g.doubtRate; }
    r.cnt.served++; if (gAct) r.cnt.climax++; r.m.plea = clamp(r.m.plea + 25 * r.sens, 0, 100);
    if (r.role === 'out') { r.m.imm += 14 + r.tr.ac * 10; r.m.doubt -= 6; why += '／正気の' + r.name + 'も、施術を受けてしまった'; }
    else {
      r.m.imm += 3; r.m.doubt += r.doubtRate * (2 + rng() * 4);
      var k = r.m.doubt > 45 ? 'doubt' : r.tr.ac > 0.6 ? 'shy' : 'calm';
      t += ST.fmt(ST.pick(S, (VO && rng() < 0.75 && ok(k === 'doubt' ? VO.DOUBT[r.persona] : VO.TAKER[r.persona])) || ok(KH.TAKER[k]) || KH.TAKER.calm), { r: r.name });
    }
    if (r.role === 'giver') why += '／同じ' + SIT.giver + 'の' + r.name + 'と手順を確かめた';
    var o = ST.sayB(S, { actors: [g, r], tag: act[0], text: t, why: why, mag: 20 }, g.name + '→' + r.name + '（' + act[0] + '）', g.cnt.served === 1 || r.cnt.served === 1);
    if (o && g.cnt.served === 1) ST.key(S, o, g.name + 'の最初の' + SIT.unit);
    g.m.doubt += g.doubtRate * rng() * 2.5;
  }
  function idle(S, g, SIT) {
    var rng = S.rng, v = { p: g.name, boss: S.v.boss, place: S.v.place };
    /* 同僚どうしの練習は、向きの決まる組だけ。{q}（服を脱がせて手順を試す側）は HK.Pos.order の先頭 */
    var others = S.P.filter(function (o) { return o !== g && o.role === 'giver' && !o.quit && okPair(g, o); });
    if (others.length && rng() < 0.4) {
      var o2 = rng.pick(others), od = HK.Pos ? HK.Pos.order(g, o2, [o2, g]) : [o2, g];
      g.m.plea += 15 * g.sens; o2.m.plea += 15 * o2.sens; g.m.imm += 3; o2.m.imm += 3;
      return ST.sayB(S, { actors: [g, o2], tag: '空き時間', text: ST.fmt(ST.pick(S, L('客が途切れた。{p}と{q}は、空いた施術室で手技の練習をすることにした。お互いの体で。|{p}は{q}に「さっきの手順、私にやってみて」と頼んだ。{q}は真剣な顔で頷き、{p}の服を脱がせ始めた。|{p}と{q}は休憩室で、どちらが多く搾ったかを比べ合った。負けた方が、勝った方を労うことになった。')), { p: od[1].name, q: od[0].name }), why: '同僚どうしの練習（' + SIT.name + 'では、これも業務の一部）', mag: 16 }, g.name + 'と' + o2.name + 'は空き時間に練習');
    }
    g.m.imm += 1;
    ST.sayB(S, { actors: [g], tag: '空き時間', text: ST.fmt(ST.pick(S, nm(S, L('客が来ない。{p}は器具を一つずつ消毒し、次の客に備えた。|{p}は空き時間に、施術マニュアルを読み返した。付箋だらけだった。|{p}は待合室を覗き、誰もいないのを確かめてから、こっそり自分の制服の匂いを嗅いだ。|{p}は{boss}に頼まれて、新しいローションの使い心地を自分の腕で試した。'))), v) + (VO && VO.IDLE[g.persona] && rng() < 0.5 ? g.name + ST.pick(S, VO.IDLE[g.persona]) : ''), why: '客の少ない時間帯' }, g.name + 'は客待ち');
  }

  /* ---------- ハプニング ---------- */
  /* モブなしのとき：ほかの客・上司・同僚などが出てこない出来事と文だけを使う */
  var NOMOB_EV = ['machine', 'blackout', 'camera', 'diary', 'self'];
  /* 客が来る出来事（客の多さ0のときは起きない） */
  var GUEST_EV = ['double', 'regular', 'friend', 'complaint'];
  var MOB = /\{boss\}|団体|新人|同僚|隣の人|周りの人|誰も気にして|スタッフ|監査|業者|ほかの客|他の客|客たち|お客たち/;
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
    var g = rng.pick(G), e = HK.weighted(rng, KH.EVENTS, function (x) { return S.noMob && NOMOB_EV.indexOf(x.id) < 0 ? 0 : S.noGuest && GUEST_EV.indexOf(x.id) >= 0 ? 0 : S.flags['ev_' + x.id] ? 0.04 : x.id === 'reverse' && HK.Pos && HK.Pos.hardTop(g) ? 0 : 1; });
    S.flags['ev_' + e.id] = (S.flags['ev_' + e.id] || 0) + 1;
    var fx = e.fx, t = ST.fmt(ST.pick(S, nm(S, e.t)), { p: g.name, boss: S.v.boss });
    if (fx.doubt) g.m.doubt += fx.doubt * (fx.doubt > 0 ? g.doubtRate : 1);
    if (fx.imm) g.m.imm += fx.imm;
    if (fx.plea) g.m.plea += fx.plea * g.sens;
    if (fx.served) { g.cnt.served += fx.served; g.m.sem += Math.round(10 + rng() * 20); }
    if (fx.taken) { g.cnt.climax++; g.m.plea = 30; }
    if (fx.doubt > 0) g.cnt.glitch++;
    var o = ST.say(S, { actors: [g], tag: 'ハプニング', text: t, why: fx.doubt > 0 ? '改変のほころび（' + g.name + 'の違和感 ' + Math.round(g.m.doubt) + '）' : fx.doubt < 0 ? '改変が強められた' : '', mag: Math.abs(fx.doubt || 0) + 10 });
    if (e.id === 'friend' || e.id === 'audit') ST.key(S, o, '外の世界の目');
    /* 違和感のきっかけ（舞台ごとの・どこでも） */
    var w = G.filter(function (p) { return p.m.doubt > 20; });
    if (w.length && rng() < 0.45) {
      var q = rng.pick(w), pool = rng() < 0.5 ? SIT.glitch : KH.GLITCH;
      q.m.doubt += (10 + rng() * 10) * q.doubtRate; q.cnt.glitch++;
      ST.say(S, { actors: [q], tag: '違和感', text: ST.fmt(ST.pick(S, pool), { p: q.name }), why: q.name + 'の冷静さ（A ' + Math.round(q.eg.A) + '）が、改変のほころびを拾った', mag: 22 });
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
    var say = VO && VO.AWAKE[p.persona] && VO.AWAKE[p.persona][k] ? p.name + ST.pick(S, VO.AWAKE[p.persona][k]) : '';
    var o = ST.say(S, { actors: [p], tag: '気づき', text: ST.fmt(ST.pick(S, KH.AWAKE[k]), v).replace(/白衣のまま/, p.role === 'giver' ? SIT.giver + 'の格好のまま' : 'そのまま') + say, why: why, mag: 40 });
    ST.key(S, o, p.name + 'が気づいた');
    if (k === 'snap') { p.quit = true; p.m.imm = 5; return; }
    if (k === 'deny') { p.m.doubt -= 30; p.m.imm += 8; return; }
    if (k === 'accept') { p.m.imm = Math.max(p.m.imm, 70); p.m.plea += 20; p.accepted = true; return; }
    /* 気づかないふり：上の人に見抜かれて、改変し直されることがある */
    if (rng() < 0.35 + S.env.depth / 250) {
      p.cnt.reset++; p.m.doubt = 8; p.m.imm = clamp(p.m.imm + 25, 0, 100); p.awakeKind = 'reset';
      var o2 = ST.say(S, { actors: [p], tag: '再改変', text: ST.fmt(ST.pick(S, nm(S, KH.RESET)), v), why: (S.noMob ? '改変そのものに引き戻された' : S.v.boss + 'に見抜かれた') + '（改変の強さ ' + S.env.depth + '）', mag: 35 });
      ST.key(S, o2, p.name + 'は改変し直された');
    }
  }

  /* ---------- 正気のまま紛れ込んだ人 ---------- */
  function outsider(S, SIT, p) {
    var rng = S.rng, v = { o: p.name };
    if (p.m.imm > 72) { p.sunk = true; return ST.key(S, ST.say(S, { actors: [p], tag: '呑み込まれる', text: ST.fmt(ST.pick(S, KH.OUT.sink), v), why: p.name + 'の改変度が' + Math.round(p.m.imm) + 'に達した', mag: 40 }), p.name + 'も改変された'); }
    var flee = (p.tr.cp * 0.4 + p.tr.a * 0.3 + p.tr.caution * 0.3) * (p.m.doubt / 100) - p.m.imm / 150;
    if (S.step >= 1 && rng() < flee * 0.35) { p.fled = true; return ST.key(S, ST.say(S, { actors: [p], tag: '脱出', text: ST.fmt(ST.pick(S, KH.OUT.flee), v), why: p.name + 'の慎重さとCP・A', mag: 35 }), p.name + 'が逃げ出した'); }
    if (rng() < 0.45) {
      p.m.imm += 4 + p.tr.ac * 6;
      ST.sayB(S, { actors: [p], tag: '正気の人', text: ST.fmt(ST.pick(S, nm(S, rng() < 0.5 ? KH.OUT.see : KH.OUT.tell)), v) + (VO && VO.OUT[p.persona] && rng() < 0.6 ? p.name + ST.pick(S, VO.OUT[p.persona]) : ''), why: '周りは全員、これを普通だと思っている（' + p.name + 'の改変度 ' + Math.round(p.m.imm) + '）' }, p.name + 'は周りの様子に戸惑っていた');
    }
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
    var P = S.P;
    P.forEach(function (p) {
      p.fate = fateOf(p);
      var top = Object.keys(p.cnt.acts).sort(function (a, b) { return p.cnt.acts[b] - p.cnt.acts[a]; })[0];
      if (p.role === 'giver') p.notes.push(SIT.unit + ' ' + p.cnt.served + '件・採取量 ' + Math.round(p.m.sem) + 'ml' + (top ? '・いちばん多かったのは「' + top + '」' : '') + (p.cnt.gclimax ? '・施しながら自分も' + p.cnt.gclimax + '回達した' : ''));
      else p.notes.push((p.role === 'out' ? '受けてしまった施術' : '受けた' + SIT.unit) + ' ' + p.cnt.served + '回・出した量 ' + Math.round(p.m.sem) + 'ml');
      p.notes.push('違和感 ' + Math.round(p.m.doubt) + '／改変度 ' + Math.round(p.m.imm) + (p.cnt.body ? '・体の違和感 ' + p.cnt.body + '回' : '') + (p.cnt.glitch ? '・ほころびに触れた ' + p.cnt.glitch + '回' : '') + (p.cnt.reset ? '・再改変 ' + p.cnt.reset + '回' : ''));
      p.notes.push('方針「' + p.action.label + '」・目標「' + p.goal.label + '」');
    });
    var G = P.filter(function (p) { return p.role === 'giver'; });
    var woke = P.filter(function (p) { return p.awakeKind === 'snap' || p.fled; });
    var noticed = P.filter(function (p) { return p.cnt.awake || p.role === 'out'; });
    var topG = G.slice().sort(function (a, b) { return b.m.sem - a.m.sem; })[0];
    var title = '「' + place + '」は今日も平常運転。' + (woke.length ? names(woke) + 'だけが、おかしさに気づいて正気に戻った。' : noticed.length ? names(noticed) + 'は違和感に触れたが、世界は何も変わらなかった。' : '誰ひとり、違和感に気づかなかった。');
    var lines = P.map(function (p) { return p.name + '（' + p.roleLabel + '）：' + p.fate; });
    if (topG) lines.push('いちばん搾ったのは' + topG.name + '（' + Math.round(topG.m.sem) + 'ml）');
    var total = G.reduce(function (s, g) { return s + g.cnt.served; }, 0), sem = G.reduce(function (s, g) { return s + g.m.sem; }, 0);
    var rows = P.slice().sort(function (a, b) { return (b.role === 'giver') - (a.role === 'giver') || b.m.sem - a.m.sem; }).map(function (p, k) {
      return { i: p.i, rank: '', cells: [p.roleLabel, String(p.cnt.served), Math.round(p.m.sem) + 'ml', String(p.role === 'giver' ? p.cnt.gclimax : p.cnt.climax), String(Math.round(p.m.doubt)), p.fate] };
    });
    return ST.result(S, input, {
      ending: { title: title, kind: woke.length ? 'ok' : 'over', lines: lines },
      estats: [['施術', total + '件'], ['総採取量', Math.round(sem) + 'ml'], ['気づいた人', noticed.length + '人'], ['正気に戻った', woke.length + '人']],
      table: { title: '住人ごとの比較', hint: '採取量は施す側なら搾った量、受ける側なら出した量。絶頂は施す側なら「自分も達した回数」。', cols: ['役割', '件数', '精', '絶頂', '違和感', '結末'], rows: rows },
      meters: [{ label: '改変度', color: '--accent' }, { label: '違和感', color: '--warn' }, { label: '快感', color: '--pine', dash: true }, { label: '精', color: '--love', max: 150, unit: 'ml' }],
      meta: SIT.name + '「' + place + '」・' + S.env.slots + '時間',
      summary: SIT.name + '：' + P.map(function (p) { return p.name + '=' + p.fate; }).join('、')
    });
  }
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
})();
