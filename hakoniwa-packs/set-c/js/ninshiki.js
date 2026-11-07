/* 認識阻害の部屋（追加パック set-c「闇の過激セット」の部屋。R18版だけ。エンジン型。2026-11-07。設計は docs/reports/2026-11-07/ninshiki-design.md）
   する側（{a}：住人・モブ・触手）が「認識を阻む力」（アプリ／まじない／薬）を使い、その空間では触れられることが当たり前になっている。
   される側（{b}）が違和感に気づいたら、その場を離れられる（離れる・面と向かって断る・人に知らせる。性的な場面は止まる）。気づかないか、気づいても乗り気
   （本音の計器 want が線を越えている）なら続く。仕組みは本体の常識改変（solo-kaihen*.js）と電車（solo-train*.js）と同じ：常識の中にいる → 違和感 → 覚める → 分かれる。
   ・計器（巻き戻らない。HK.DarkKit.gauge）：手がかり clue（25／50／75。文の段）・違和感 iwa（60 が線。安全の担保）・体の慣れ habit・大胆さ bold・本音 want（55 が線）・力の消耗 wear
   ・安全の担保（set-c-design.md 5-1）：どの段（する側の一手・受ける側の反応・夜・山場・R18 の入口）も、始める前に guard() で違和感を見る。線を越えていれば
     その段は「気づく → 離れる・断る・人に知らせる」になり、性的な場面は止まる（本音が線を越えていれば、気づいたうえで乗り気として続く）。
     前もって許していない人・気づいていない人に触れるのは、肩・手・髪・隣に座る（触れ方の段 0）だけで、性的な触れ方は書かない。
     本音 want は、気づく前は関係の重さでしか伸びない（触れ方では伸ばさない。力で気持ちを作らない）。モブ・触手の回は出口のある場所だけ
   ・する側の分岐（態度 9 種 → 既定、運命の揺らぎでらしくない）：try 少しずつ試す／public 人前で大胆に／keep 独占して囲う／guilt 罪悪感で止める
   ・される側の分岐：probe 違和感を探る／usual いつも通り／ache 体が覚えて疼く／consult 誰かに相談
   ・山場：力が切れかける瞬間（人前。認識が一瞬だけ解ける）。結末 5：hidden バレずに続く／broken バレて壊れる／accepted バレて受け入れられる／crave 自分から求める／reverse 立場が逆転
   ・土台は合意（set-c-design.md 0-2）：R18 の場面は want が線を越え、かつ「前もって許していた二人（恋人・夫婦・体の相手・両片想い）」か「気づいたうえで乗り気の人」にだけ。
     何も知らないまま終わる結末は前もって許していた二人だけ（ほかの二人は山場で必ず気づく）。する側がモブ・触手のときは前もって許すことはなく、気づいて乗り気のときだけ
   ・文は ninshiki-text-*.js（HK.NinshikiText）、R18 は ninshiki-r18*.js。登場人物はすべて成人として扱う */
/* @event scen=set-c-ninshiki id=ns_setup cat=bond tie=- label=認識を阻む力が使われ始める */
/* @event scen=set-c-ninshiki id=ns_morning cat=bond tie=- label=触れられるのが当たり前の朝 */
/* @event scen=set-c-ninshiki id=ns_move_try cat=bond tie=- label=少しずつ触れて力を試す */
/* @event scen=set-c-ninshiki id=ns_move_public cat=bond tie=- label=人前で大胆に触れる */
/* @event scen=set-c-ninshiki id=ns_move_keep cat=bond tie=- label=二人きりの場所に囲い込む */
/* @event scen=set-c-ninshiki id=ns_move_guilt cat=bond tie=- label=罪悪感で伸ばした手を止める */
/* @event scen=set-c-ninshiki id=ns_react_probe cat=solo tie=- label=違和感の正体を探る */
/* @event scen=set-c-ninshiki id=ns_react_usual cat=bond tie=- label=いつも通りに受け流す */
/* @event scen=set-c-ninshiki id=ns_react_ache cat=solo tie=- label=触れられた体が覚えて疼く */
/* @event scen=set-c-ninshiki id=ns_react_consult cat=bond tie=- label=違和感を誰かに相談する */
/* @event scen=set-c-ninshiki id=ns_clue cat=solo tie=- label=気づく手がかりを見つける */
/* @event scen=set-c-ninshiki id=ns_moya cat=bond tie=- label=小さな違和感を言いくるめられる */
/* @event scen=set-c-ninshiki id=ns_daily cat=bond tie=- label=認識阻害の中の二人の日々 */
/* @event scen=set-c-ninshiki id=ns_selfnote cat=solo tie=- label=自分の気持ちから違和感に気づく */
/* @event scen=set-c-ninshiki id=ns_wake cat=solo tie=- label=違和感に気づいて阻害が解ける */
/* @event scen=set-c-ninshiki id=ns_stay cat=bond tie=- label=気づいたうえで乗り気のまま続ける */
/* @event scen=set-c-ninshiki id=ns_leave cat=bond tie=- label=気づいてその場を離れる */
/* @event scen=set-c-ninshiki id=ns_refuse cat=conflict tie=- label=気づいて面と向かって断る */
/* @event scen=set-c-ninshiki id=ns_report cat=bond tie=- label=気づいて人に知らせる */
/* @event scen=set-c-ninshiki id=ns_confess cat=bond tie=- label=力を使っていたと打ち明ける */
/* @event scen=set-c-ninshiki id=ns_reverse cat=conflict tie=- label=力を奪って立場が入れ替わる */
/* @event scen=set-c-ninshiki id=ns_avoid cat=bond tie=- label=離れたあとの二人の距離 */
/* @event scen=set-c-ninshiki id=ns_face cat=bond tie=- label=気づいたあとで向き合う */
/* @event scen=set-c-ninshiki id=ns_back cat=bond tie=- label=離れたあとで自分から戻ってくる */
/* @event scen=set-c-ninshiki id=ns_peak cat=bond tie=- label=力が切れかける瞬間（山場） */
/* @event scen=set-c-ninshiki id=ns_night cat=bond tie=- label=認識阻害の空間の夜のふたり */
/* @event scen=set-c-ninshiki id=ns_night_a cat=solo tie=- label=力を使う側のひとりの夜 */
/* @event scen=set-c-ninshiki id=ns_rev_day cat=bond tie=- label=力を握った側が相手を試す日 */
/* @event scen=set-c-ninshiki id=ns_end cat=bond tie=- label=認識阻害の日々の結末 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || HK.SAFE_ON) return;
  var ID = 'set-c-ninshiki', DK = HK.DarkKit, LINE = 55, IWA_LINE = 60;
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.NinshikiText || {}; }
  function f(ctx) { return ctx.ns; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  var REST = 1e-9;

  /* ---------- 二人の関係（住人がする側のとき。名簿の関係のまま） ----------
     grp：love（恋人・夫婦）／body（体の相手）／pine（両片想い・片想い）／close（友人・幼なじみ）／work（同僚・先輩後輩・師弟）／fam（家族）／ex（昔付き合っていた）／awk（不仲・知人・関係なし） */
  var GRP_OF = { spouse: 'love', lover: 'love', fiance: 'love', mate: 'love', fated: 'love', honmei: 'love', fwb: 'body',
    almost: 'pine', crush: 'pine', yan: 'pine', friend: 'close', best: 'close', buddy: 'close', childhood: 'close', classmate: 'close', comrade: 'close', benefactor: 'close',
    colleague: 'work', boss: 'work', senpai: 'work', teacher: 'work', mentor: 'work', master: 'work', worship: 'work',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'fam',
    ex: 'ex', enemy: 'awk', bad: 'awk', rival: 'awk', lovehate: 'awk', abuse: 'awk', acq: 'awk' };
  var GRP_ORD = ['love', 'body', 'pine', 'ex', 'close', 'work', 'fam', 'awk'];
  function relOf(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = { g: 'none', t: '' };
    tl.forEach(function (t) {
      if (!t || t.type === 'noobs') return;
      var g = GRP_OF[t.type] || 'close';
      if (best.g === 'none' || GRP_ORD.indexOf(g) < GRP_ORD.indexOf(best.g)) best = { g: g, t: t.type, tie: t };
    });
    if (best.g === 'none') best.g = 'awk';
    return best;
  }
  /* 片想いの向き：する側（A）が想う側なら 'A'、される側（B）が想う側なら 'B' */
  function crushDir(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], t = tl.filter(function (x) { return x && /^(crush|yan)$/.test(x.type); })[0];
    if (!t || t.a == null) return '';
    return t.a === A.i ? 'A' : t.a === B.i ? 'B' : '';
  }
  function canLove2(ctx, a, b) {
    if (!a || !b || a.mob || b.mob) return false;
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }

  /* ---------- モブ・触手 ---------- */
  var MOB_ROLE = { office: '同じ部署の', home: '同じ建物に住む', shop: '常連客の', town: '近所に住む' };
  function mobGen(ctx, B) {
    var sl = HK.Pos && HK.Pos.sexLikeOf ? HK.Pos.sexLikeOf(B) : '', lk = sl === 'm' || sl === 'f' ? sl : B.likes;
    if (lk === 'm' || lk === 'f') return lk;
    return ctx.rng() < 0.5 ? 'm' : 'f';
  }
  function mobGOk(B, g) {
    var sl = HK.Pos && HK.Pos.sexLikeOf ? HK.Pos.sexLikeOf(B) : '', lk = sl === 'm' || sl === 'f' ? sl : B.likes;
    return !(lk === 'm' || lk === 'f') || lk === g;
  }
  function makeMob(ctx, S, B) {
    var g = mobGen(ctx, B), role = MOB_ROLE[S.place] || '近所に住む';
    var m = HK.Mob && HK.Mob.make ? HK.Mob.make(ctx, { gender: g }) : { name: '佐伯', gender: g, mob: true };
    m.short = m.name; m.name = m.name; m.label = role + m.name;
    m.persona = DK.PER[Math.floor(ctx.rng() * DK.PER.length)]; m.tone = m.persona; m.night = m.persona;
    m.mob = true; m.pos = 'top';
    return m;
  }
  function makeTent(B) {
    /* 触手には性別の体が無い。場面の形は受けの体で決める（ff：受けが女性の体、fm：受けが男性の体） */
    return { name: '触手', short: '触手', gender: 'f', mob: true, tent: true, persona: 'cool', tone: '', fp: '', pos: 'top', likes: '', eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }, tr: {}, calls: {}, loveNG: [] };
  }

  /* ---------- 表を引く・記録 ---------- */
  var SRC_W = { app: 'アプリ', magic: 'まじない', drug: '薬' };
  var PLACE_W = { office: '職場', home: '住まい', shop: '行きつけの店', town: '駅前の通り' };
  function ex(S) { return { src: SRC_W[S.src], spot: PLACE_W[S.place], g: S.gName || '知り合い', an: S.A && S.A.label || (S.A && S.A.name) || '' }; }
  /* 表を引く（段の札・when・同じ文を二度出さない）。o.again で使い切ったら戻す */
  function pick(ctx, list, o) {
    var S = f(ctx); o = o || {};
    return DK.pick(ctx, S, list, { a: S.A, b: S.B, again: !!o.again, g: o.g, stage: o.stage });
  }
  /* 表の行の when で読む印（S の状態） */
  function fill(ctx, t) { var S = f(ctx); return DK.fill(ctx, t, S.A, S.B, ex(S)); }
  function actorsOf(S, both) { return S.ak === 'res' && both !== false ? [S.A, S.B] : [S.B]; }
  function say(ctx, id, t, why, o) {
    var S = f(ctx); o = o || {};
    if (!t) return null;
    var e = DK.say(ctx, { id: id, cat: o.cat || 'bond', actors: o.actors || actorsOf(S, o.both), text: fill(ctx, t), why: '認識阻害の部屋：' + why, mag: o.mag || 0, odd: !!o.odd, face: o.face, fx: o.fx });
    if (e && !e.skipped) S.segN++;
    return e;
  }
  function mod(ctx, dab, dba) { var S = f(ctx); if (S.ak === 'res') ctx.mod2(S.A, S.B, dab, dba || dab); }
  /* 足した二つ以上の文（地の文の段）をつなぐ。空の文は外す */
  function join() { return [].slice.call(arguments).filter(Boolean).join(''); }

  /* ---------- 計器 ---------- */
  function g(S, k) { return DK.val(S, k); }
  function st(S, k) { return DK.stage(S, k); }
  function push(ctx, k, d) { var S = f(ctx); return DK.push(S, k, d); }
  /* 手がかりを足す（気づいたあとは動かさない）。伸び方は設定と受けの性格で */
  function clueUp(ctx, base) {
    var S = f(ctx); if (S.aware) return 0;
    var k = { few: 0.75, mid: 1, many: 1.35 }[S.clueN] * (S.range === 'self' ? 1.2 : 0.85) * S.bClue * (0.8 + ctx.rng() * 0.45);
    var r = push(ctx, 'clue', Math.round(base * k));
    iwaUp(ctx, r.d);
    return r.d;
  }
  /* 違和感（安全の担保）：手がかり・触れられた回数・周りの視線で上がる。前もって許していた二人は約束の遊びなので伸びが小さい */
  function iwaUp(ctx, d) {
    var S = f(ctx); if (S.aware || !d) return 0;
    return push(ctx, 'iwa', Math.max(1, Math.round(d * (S.pre ? 0.45 : 1)))).d;
  }
  /* どの段も始める前に違和感を見る。線を越えていれば気づいて分かれる（乗り気でなければ離れる）。性的な段に進んでよいかを返す */
  function guard(ctx, where) {
    var S = f(ctx); if (!S || S.ended) return false;
    if (!S.aware && g(S, 'iwa') >= IWA_LINE) {
      (S.glog = S.glog || []).push({ d: S.d, t: S.t, where: where || '', iwa: g(S, 'iwa'), want: g(S, 'want'), pre: !!S.pre });
      wake(ctx, '違和感が線を越えた');
      S.glog[S.glog.length - 1].choice = S.choice;
    }
    return !S.out;
  }
  function elig(ctx) {
    var S = f(ctx);
    return !S.noBody && !S.out && g(S, 'want') >= LINE && (S.pre || S.stay);
  }

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: '認識阻害', kicker: '闇・認識阻害',
    desc: '認識を阻む力が働く空間では、触れられることが当たり前になっている。気づけば離れられる。気づいても、離れないこともある。',
    note: '※参加は3人まで（する側はモブや触手にもできます）。登場人物はすべて成人として扱います。くわしくは「この箱庭のTIPS」に。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 1, maxCast: 3,
    catBias: { romance: 0.6, bond: 1, help: 0.5, conflict: 0.4, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: REST,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 3, max: 10, def: 5, lo: '3日', hi: '10日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。終わりの二日前に、力が切れかける山場が来る' },
      { id: 'actor', label: 'する側', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（住人の立場と受け攻めから）' }, { v: 'res', label: '住人' }, { v: 'mob', label: 'モブ（住人でない人）' }, { v: 'tent', label: '触手' }],
        desc: '力を使う側。住人なら名簿の関係のまま、モブなら場所に合った住人でない人、触手なら空間に潜むもの。モブ・触手のときは、受ける側が気づいたうえで乗り気になったときだけ夜の場面になる' },
      { id: 'src', label: '力の出どころ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }, { v: 'app', label: 'アプリ（画面を操作する）' }, { v: 'magic', label: '魔法（まじないを結ぶ）' }, { v: 'drug', label: '薬（する側が飲む）' }],
        desc: '毎日の文と、気づく手がかり（画面の光・まじないの跡・薬の匂い）が変わる。薬はする側が自分で飲み、周りの目から外れる' },
      { id: 'range', label: '効く範囲', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }, { v: 'self', label: '本人だけ（周りは気づきうる）' }, { v: 'all', label: '周りも（空間ごと）' }],
        desc: '本人だけなら、周りの人の視線や一言が手がかりになり、気づきやすい。周りもなら、誰も咎めないので大胆になりやすい' },
      { id: 'place', label: '舞台', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }, { v: 'office', label: '職場' }, { v: 'home', label: '住まい' }, { v: 'shop', label: '行きつけの店' }, { v: 'town', label: '駅前の通り' }],
        desc: '力が働く空間。毎朝の文と、人前の場面の場所が変わる' },
      { id: 'bold', label: '大胆さ', type: 'select', def: 'mid', options: [{ v: 'low', label: '控えめ' }, { v: 'mid', label: 'ふつう' }, { v: 'high', label: '大胆' }], desc: 'する側がどれだけ早く人前で触れるようになるか' },
      { id: 'target', label: '狙う相手', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }, { v: 'bottom', label: '受け（体が目当て）' }, { v: 'crush', label: '想い人（気持ちが目当て）' }], desc: 'する側がなぜ力を使うか。夜のひとりの文と結末の言い回しが変わる' },
      { id: 'clues', label: '気づく手がかりの数', type: 'select', def: 'mid', options: [{ v: 'few', label: '少ない' }, { v: 'mid', label: 'ふつう' }, { v: 'many', label: '多い' }], desc: '多いほど、受ける側が早く違和感に気づき、離れるか乗り気かを選ぶ' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が相談相手として出る）' }, { v: 'no', label: '出さない' }], desc: '相談の相手に、名簿の住人（参加していない人）を名前で出す' },
      { id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '少なめ（1回まで）' }, { v: 'mid', label: 'ふつう（2回まで）' }, { v: 'high', label: '多め（3回まで・一度は長い場面）' }],
        desc: 'エッチの場面の回数の上限。前もって許していた二人（恋人・夫婦・体の相手・両片想い）か、気づいたうえで乗り気になった人のときだけ起きる' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（受け攻め・性格から）', options: [{ id: 'user', label: '力を使う側' }, { id: 'target', label: '受ける側' }, { id: 'guest', label: '周りの人（相談の相手）' }] }
    ],
    actions: [], goals: [],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(3, Math.min(10, +env.days || 5)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    othersFor: function (ctx, a) { return ctx.present().filter(function (c) { return c !== a; }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  function exList() { return (HK.COMMON || []).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });

  /* ---------- 始まり ---------- */
  function per(c) { return c && c.tent ? 'cool' : c && c.mob ? (DK.PER.indexOf(c.persona) >= 0 ? c.persona : 'gentle') : DK.per(c); }
  function topScore(c, o) { var P = HK.Pos, s = 0; if (P && P.hardTop && P.hardTop(c, o)) s += 5; if (P && P.canTop && !P.canTop(c, o)) s -= 5; s += { proud: 2, stern: 1.5, cool: 1.5, free: 1, devoted: 0.8, tsun: 0.5, gentle: 0.3, polite: 0.3, shy: 0 }[DK.per(c)] || 0; return s; }
  function pickRes(ctx, env, C) {
    var X = C[0], Y = C[1];
    var cast = DK.cast(ctx, { field: 'part', top: 'user', bottom: 'target', others: ['guest'], auto: function (ctx2, x, y) {
      var tg = env.target;
      if (tg === 'crush') { var dx = crushDir(ctx2, x, y); if (dx === 'A') return [x, y]; if (dx === 'B') return [y, x]; }
      return topScore(x, y) >= topScore(y, x) ? [x, y] : [y, x];
    } });
    return cast;
  }
  function setup(ctx) {
    var env = ctx.env, C = ctx.chars.slice();
    DK.heavyDefault(ctx);
    var days = Math.max(3, Math.min(10, +env.days || 5));
    var rv = function (k, list) { var v = env[k]; return list.indexOf(v) >= 0 ? v : list[Math.floor(ctx.rng() * list.length)]; };
    var S = ctx.ns = { days: days, used: {}, once: {}, segN: 0, src: rv('src', ['app', 'magic', 'drug']), range: rv('range', ['self', 'all']), place: rv('place', ['office', 'home', 'shop', 'town']),
      boldD: /^(low|mid|high)$/.test(env.bold) ? env.bold : 'mid', clueN: /^(few|mid|many)$/.test(env.clues) ? env.clues : 'mid', tgt: env.target === 'bottom' || env.target === 'crush' ? env.target : '',
      aware: false, stay: false, out: false, choice: '', rev: false, back: false, asked: false, reconciled: false, peakDone: false, endK: '', sexN: 0, log: [] };
    var userPick = C.some(function (c) { return DK.part(ctx, c, 'part') === 'user'; });
    var ak = env.actor === 'res' || env.actor === 'mob' || env.actor === 'tent' ? env.actor : 'auto', cast = null;
    if ((ak === 'res' || ak === 'auto') && C.length >= 2) cast = pickRes(ctx, env, C);
    if (ak === 'auto') ak = cast && (userPick || !cast.noBody) ? 'res' : 'mob';
    if (ak === 'res' && !cast) { ak = 'mob'; S.resNo = true; }
    S.ak = ak;
    var A, B;
    if (ak === 'res') { A = cast.A; B = cast.B; S.noBody = cast.noBody; S.noWhy = cast.why; }
    else {
      var tp = C.filter(function (c) { return DK.part(ctx, c, 'part') === 'target'; })[0];
      var cand = C.filter(function (c) { return DK.part(ctx, c, 'part') !== 'guest' && DK.part(ctx, c, 'part') !== 'user'; });
      B = tp || cand.filter(function (c) { return !(HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(c)); })[0] || cand[0] || C[0];
      A = ak === 'tent' ? makeTent(B) : makeMob(ctx, S, B);
      var mobOk = !!(HK.Mob && HK.Mob.sexOk ? HK.Mob.sexOk(B) : true) && !(HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(B)) && (ak === 'tent' || mobGOk(B, A.gender)) && !B.noR18 && !(HK.Pos && HK.Pos.libOK && !HK.Pos.libOK([B]));
      S.noBody = !mobOk; S.noWhy = mobOk ? '' : 'mob';
    }
    S.A = A; S.B = B; S.G = C.filter(function (c) { return c !== A && c !== B; });
    S.G.forEach(function (c) { if (DK.part(ctx, c, 'outside')) c.outside = true; });
    S.gName = S.G.length ? S.G[0].name : '';
    var rel = ak === 'res' ? relOf(ctx, A, B) : { g: ak === 'tent' ? 'tent' : 'mob', t: '' };
    S.grp = rel.g; S.rt = rel.t; S.cdir = ak === 'res' ? crushDir(ctx, A, B) : '';
    if (S.grp === 'fam') { S.noBody = true; S.noWhy = S.noWhy || 'fam'; }
    S.love = ak === 'res' && canLove2(ctx, A, B);
    if (!S.tgt) S.tgt = S.cdir === 'A' || (S.grp === 'pine' && S.love) ? 'crush' : S.grp === 'love' && ctx.rng() < 0.5 ? 'crush' : 'bottom';
    /* 本音の計器（上がるだけ）の始まり：関係と設定から（set-c-design.md 0-2） */
    var eg = B.eg || {}, fc = (eg.FC || 10) / 20, w0;
    if (ak === 'res') w0 = { love: 72, body: 70, pine: S.rt === 'almost' ? 62 : S.cdir === 'B' ? 60 : 38, ex: 44, close: 40, work: 30, fam: 18, awk: S.rt === 'lovehate' ? 50 : 18 }[S.grp] || 20;
    else w0 = 20 + fc * 26 + ((HK.Pos && HK.Pos.libK ? HK.Pos.libK(B) : 1) - 1) * 18 + (ak === 'tent' ? 3 : 0);
    w0 = Math.round(w0 + (ctx.rng() - 0.5) * 8);
    DK.gauge(S, 'want', { v: clamp(w0, 5, 90), stages: [LINE], label: '本音' });
    DK.gauge(S, 'clue', { v: 0, stages: [25, 50, 75], label: '手がかり' });
    DK.gauge(S, 'iwa', { v: 0, stages: [IWA_LINE], label: '違和感' });
    DK.gauge(S, 'habit', { v: 0, stages: [25, 50, 80], label: '体の慣れ' });
    DK.gauge(S, 'bold', { v: { low: 8, mid: 22, high: 40 }[S.boldD], stages: [35, 65, 90], label: '大胆さ' });
    DK.gauge(S, 'wear', { v: 0, stages: [70], label: '力の消耗' });
    /* 前もって許していた二人（恋人・夫婦・体の相手・両片想い）：「いつ使うかは言わないで」と、される側が先に頼んでいた */
    S.pre = ak === 'res' && !S.noBody && (S.grp === 'love' || S.grp === 'body' || S.rt === 'almost') && g(S, 'want') >= LINE;
    /* 受けの気づきやすさ（理性・慎重さ。本体の気質） */
    S.bClue = clamp(0.75 + (eg.A || 10) / 40 + (eg.CP || 10) / 80 - (eg.AC || 10) / 80, 0.6, 1.5);
    /* 分岐 */
    var aTab = { gentle: 'try', tsun: 'try', polite: 'try', devoted: 'keep', shy: 'keep', cool: 'keep', proud: 'public', free: 'public', stern: 'guilt' };
    if (ak === 'tent') { var tk = ['try', 'public', 'keep']; S.aBr = { k: tk[Math.floor(ctx.rng() * 3)], odd: false, per: 'cool' }; }
    else if (ak === 'mob') { var mk = aTab[A.persona] || 'try'; S.aBr = { k: mk, odd: false, per: A.persona }; if (ctx.rng() < DK.pOdd(ctx)) { var al = ['try', 'public', 'keep', 'guilt'].filter(function (x) { return x !== mk; }); S.aBr = { k: al[Math.floor(ctx.rng() * al.length)], odd: true, per: A.persona }; } }
    else S.aBr = DK.branch(ctx, A, aTab, ['try', 'public', 'keep', 'guilt']);
    S.bBr = DK.branch(ctx, B, { proud: 'probe', stern: 'probe', cool: 'probe', tsun: 'consult', polite: 'consult', gentle: 'usual', free: 'usual', devoted: 'ache', shy: 'ache' }, ['probe', 'usual', 'ache', 'consult']);
    if (S.bBr.k === 'consult' && !S.G.length) S.gName = '';
    S.peakDay = Math.max(1, days - 2);
    /* 手がかりの段（数は設定から。初日の朝は除く） */
    var nC = { few: 2, mid: 3, many: 5 }[S.clueN], cd = {};
    for (var i = 0; i < nC; i++) { var dd = 1 + Math.floor(ctx.rng() * Math.max(1, S.peakDay)); if (dd >= days) dd = days - 1; cd[dd] = (cd[dd] || 0) + 1; }
    S.clueDay = cd;
    if (HK.DarkKit.R18 && HK.DarkKit.R18.quota) HK.DarkKit.R18.quota(ctx, S, env); else S.r18 = { max: 0, n: 0, longN: 0 };
    if (S.noBody) S.r18.max = 0;
    C.forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'ns', label: '' }; c.autoAction = false; c.autoGoal = false; });
    ctx.place = PLACE_W[S.place];
    intro(ctx);
  }
  function intro(ctx) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B;
    var rel = S.ak === 'res' ? pick(ctx, (T.INTRO || {})[S.grp === 'pine' ? (S.cdir === 'B' ? 'pineB' : S.rt === 'almost' ? 'almost' : 'pineA') : S.grp] || (T.INTRO || {}).awk) : pick(ctx, (T.INTRO || {})[S.ak]);
    var how = S.ak === 'tent' ? pick(ctx, (T.START_TENT || {})[S.src]) : pick(ctx, (T.START || {})[per(A)] || (T.START || {}).gentle);
    var src = S.ak === 'tent' ? '' : pick(ctx, (T.SRC_INTRO || {})[S.src]);
    var rng = pick(ctx, (T.RANGE_INTRO || {})[S.range]);
    var pre = S.pre ? pick(ctx, T.PRE_INTRO) : '';
    say(ctx, 'ns_setup', join(rel, how, src, rng, pre), '始まり（' + ({ res: '住人', mob: 'モブ', tent: '触手' })[S.ak] + '・' + SRC_W[S.src] + '・' + PLACE_W[S.place] + '）');
  }

  /* ---------- 一日 ---------- */
  function phase(ctx, s, n) {
    var S = f(ctx); if (!S) return;
    scen.actRate = REST;
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    var d = Math.floor(s / 3), t = s % 3;
    S.d = d; S.t = t; S.last = d === S.days - 1;
    if (t === 0) { DK.tmpReset(S); S.dayN = 0; }
    var n0 = S.segN;
    if (t === 0) morning(ctx);
    else if (t === 1) daytime(ctx);
    else night(ctx);
    /* 空の区切りを作らない：何も出なかった区切りには二人の日々の出来事 */
    if (S.segN === n0 && !S.ended) daily(ctx, true);
  }
  function stageWord(S) { return st(S, 'clue'); }
  function morning(ctx) {
    var S = f(ctx), T = TX(), d = S.d;
    if (d === 0) { daily(ctx); return; }
    if (S.rev) { revDay(ctx, 'm'); return; }
    var pl = pick(ctx, (T.PLACE_M || {})[S.place], { again: true });
    var sr = S.out ? '' : pick(ctx, (T.SRC_M || {})[S.ak === 'tent' ? 'tent' : S.src], { g: 'clue', again: true });
    var bm = S.out ? pick(ctx, T.OUT_M, { again: true }) : S.aware ? pick(ctx, T.AWARE_M, { again: true }) : pick(ctx, T.B_M, { g: 'clue', again: true });
    say(ctx, 'ns_morning', join(pl, sr, bm), '朝（' + PLACE_W[S.place] + (S.out ? '・離れたあと' : S.aware ? '・気づいたあと' : '・手がかりの段 ' + stageWord(S)) + '）', { both: S.ak === 'res' });
    if (!S.out && S.range === 'self' && !S.aware && ctx.rng() < 0.45) { var rl = pick(ctx, T.RANGE_SELF, { g: 'clue' }); if (rl) { say(ctx, 'ns_clue', rl, '周りの人の視線が手がかりになる（効く範囲：本人だけ）'); clueUp(ctx, 6); checkWake(ctx); } }
  }
  function daytime(ctx) {
    var S = f(ctx), d = S.d;
    if (d === S.peakDay && !S.peakDone) { peak(ctx); return; }
    if (S.rev) { revDay(ctx, 'd'); return; }
    if (S.out || !guard(ctx, 'day')) { outDay(ctx); return; }
    move(ctx);
    if (S.out || S.ended) return;
    react(ctx);
    clueEv(ctx);
    if (S.stay && S.aBr.k === 'public' && guard(ctx, 'public') && elig(ctx) && ctx.rng() < 0.35 && R18 && R18.chance(ctx, 'public')) R18.run(ctx, 'public');
    if (ctx.rng() < 0.55) daily(ctx);
  }
  function night(ctx) {
    var S = f(ctx), T = TX();
    if (S.rev && !S.last) { revDay(ctx, 'n'); }
    else if (S.out && !S.last) { outNight(ctx); }
    else if (!S.last || ctx.rng() < 0.5) {
      if (S.ak !== 'tent' && ctx.rng() < 0.45) { var an = pick(ctx, (T.A_NIGHT || {})[S.tgt], { again: true }); if (an) say(ctx, 'ns_night_a', an, 'する側のひとりの夜（狙う相手：' + (S.tgt === 'crush' ? '想い人' : '受け') + '）', { both: false, actors: S.ak === 'res' ? [S.A] : [S.B] }); }
      var nt = pick(ctx, T.NIGHT, { g: 'clue' });
      if (nt) say(ctx, 'ns_night', nt, '夜のふたり');
    }
    if (!S.out && guard(ctx, 'night') && R18 && elig(ctx) && R18.chance(ctx, S.last ? 'last' : 'night')) R18.run(ctx, S.asked ? 'ask' : S.aBr.k === 'keep' ? 'keep' : 'night');
    if (S.last) { if (R18 && R18.missed && R18.missed(ctx)) R18.why(ctx); ending(ctx); }
  }

  /* ---------- する側の一手（分岐 × 態度 9 種）と触れ方（体の慣れ・大胆さの段） ---------- */
  var MOVE_ID = { try: 'ns_move_try', public: 'ns_move_public', keep: 'ns_move_keep', guilt: 'ns_move_guilt' };
  var MOVE_W = { try: '少しずつ試す', public: '人前で大胆に', keep: '二人きりの場所に囲う', guilt: '罪悪感で止める' };
  /* 触れ方の段の上限：前もって許していた二人と、気づいたうえで乗り気の人だけ段 1〜3。ほかは段 0（肩・手・髪・隣に座る）だけ */
  function touchCap(S) { return S.noBody ? 0 : S.pre || S.stay ? 3 : 0; }
  function move(ctx) {
    var S = f(ctx), T = TX(), k = S.aBr.k;
    if (!guard(ctx, 'move')) return;
    /* 罪悪感で止める：二日目以降、大胆さが一段上がったら（一度だけ）手を止め、そのあと打ち明けるかもしれない */
    var p = per(S.A);
    var ak0 = (T.ACT || {})[k] || {};
    var act = S.ak === 'tent' ? pick(ctx, (T.TENT_ACT || {})[k], { again: true }) : pick(ctx, (ak0[p] || ak0.gentle || []).concat(ak0._ || []), { again: true });
    var lv = Math.min(touchCap(S), st(S, 'habit') + (st(S, 'bold') >= 2 ? 1 : 0));
    var tc = pick(ctx, ((S.ak === 'tent' ? T.TOUCH_TENT : T.TOUCH) || {})['l' + lv], { again: true });
    var bl = k === 'public' || st(S, 'bold') >= 2 ? pick(ctx, (T.BOLD || {})[S.range], { g: 'bold', again: true }) : '';
    say(ctx, MOVE_ID[k], join(act, tc, bl), 'する側の一手（' + MOVE_W[k] + (S.aBr.odd ? '・らしくない' : '') + '・触れ方 ' + lv + '）', { odd: S.aBr.odd, fx: function () { mod(ctx, { att: 1 }, { aff: 0 }); } });
    var bInc = { try: 7, public: 12, keep: 4, guilt: 3 }[k] * { low: 0.7, mid: 1, high: 1.4 }[S.boldD];
    push(ctx, 'bold', Math.round(bInc));
    push(ctx, 'habit', Math.round((6 + lv * 3) * (S.bBr.k === 'ache' ? 1.35 : 1)));
    push(ctx, 'wear', Math.round(8 + (k === 'public' ? 6 : 0) + lv * 2));
    if (!S.aware) { clueUp(ctx, (k === 'public' ? 8 : 5) + (S.bBr.k === 'probe' ? 4 : 0)); iwaUp(ctx, 4 + (k === 'public' ? 3 : 0) + (S.range === 'self' ? 2 : 0)); }
    wantUp(ctx, lv);
    checkWake(ctx);
    if (k === 'guilt' && !S.aware && S.d >= 2 && DK.once(S, 'confess') && (ctx.rng() < 0.65 || S.d >= S.peakDay - 1)) confess(ctx);
  }
  function wantUp(ctx, lv) {
    var S = f(ctx); if (S.out) return;
    /* 気づく前は関係の重さだけで伸びる（触れ方・体の慣れでは伸ばさない）。モブ・触手はほとんど伸びない */
    var base = { love: 3, body: 3, pine: S.cdir === 'A' ? 1.2 : 3, ex: 1.5, close: 1.2, work: 0.9, fam: 0.3, awk: 0.6, mob: 0.3, tent: 0.3 }[S.grp] || 1;
    if (S.ak === 'res' && !S.love && S.grp !== 'body') base = Math.min(base, 0.4);
    var d = S.aware ? base + (S.bBr.k === 'ache' ? 1.5 : 0) + lv * 0.5 + ctx.rng() * 1.5 : base + ctx.rng() * (S.ak === 'res' ? 1.5 : 0.6);
    var before = g(S, 'want'), r = push(ctx, 'want', Math.round(d));
    /* 前もって許していない人が線を越えたら、自分の気持ちから違和感に気づき始める */
    if (!S.pre && !S.aware && before < LINE && r.v >= LINE && DK.once(S, 'selfnote')) {
      var t = pick(ctx, TX().SELFNOTE); if (t) say(ctx, 'ns_selfnote', t, '自分の気持ちから違和感に気づく（本音が線を越えた）', { both: false, actors: [S.B] });
      clueUp(ctx, 22); checkWake(ctx);
    }
  }
  /* 受ける側の反応（分岐 × 手がかりの段） */
  var REACT_ID = { probe: 'ns_react_probe', usual: 'ns_react_usual', ache: 'ns_react_ache', consult: 'ns_react_consult' };
  var REACT_W = { probe: '違和感を探る', usual: 'いつも通り', ache: '体が覚えて疼く', consult: '誰かに相談' };
  function react(ctx) {
    var S = f(ctx), T = TX(), k = S.bBr.k;
    if (S.aware) { if (S.stay) stayDay(ctx); return; }
    if (!guard(ctx, 'react')) return;
    if (k === 'consult' && !(S.G.length || S.gName === '')) k = 'probe';
    var t = pick(ctx, ((T.REACT || {})[k] || []), { g: 'clue', again: true });
    if (k === 'consult' && S.G.length && ctx.rng() < 0.6) { var tg = pick(ctx, T.CONSULT_G, { g: 'clue' }); if (tg) t = tg; }
    if (!t) return;
    var acts = k === 'consult' && S.G.length && /\{g\}/.test(t) ? [S.B, S.G[0]] : k === 'probe' || k === 'ache' ? [S.B] : actorsOf(S);
    say(ctx, REACT_ID[k], t, '受ける側の反応（' + REACT_W[k] + (S.bBr.odd ? '・らしくない' : '') + '）', { odd: S.bBr.odd, both: false, actors: acts });
    if (k === 'probe') clueUp(ctx, 6); else if (k === 'consult') clueUp(ctx, 5); else if (k === 'ache') push(ctx, 'habit', 4);
    iwaUp(ctx, k === 'usual' ? 2 : 4);
    /* もやもや：違和感の段 1 で、言いくるめられる（その日は手がかりが伸びない） */
    if (st(S, 'clue') === 1 && DK.once(S, 'moya' + Math.min(2, S.d)) && ctx.rng() < 0.5 && S.ak !== 'tent') {
      var mt = pick(ctx, T.MOYA); if (mt) { say(ctx, 'ns_moya', mt, '小さな違和感を言いくるめられた'); push(ctx, 'habit', 3); }
    }
    checkWake(ctx);
  }
  /* 気づく手がかりの段（設定の数だけ、決めた日の日中に） */
  function clueEv(ctx) {
    var S = f(ctx), T = TX(), n = S.clueDay[S.d] || 0;
    for (var i = 0; i < n && !S.aware; i++) {
      var t = pick(ctx, S.ak === 'tent' ? T.CLUE_TENT : (T.CLUE || {})[S.src], { g: 'clue' }) || pick(ctx, (T.CLUE_PLACE || {})[S.place]);
      if (!t) break;
      say(ctx, 'ns_clue', t, '気づく手がかり（' + SRC_W[S.src] + '・手がかりの数：' + ({ few: '少ない', mid: 'ふつう', many: '多い' })[S.clueN] + '）', { both: false, actors: [S.B] });
      clueUp(ctx, 14);
      checkWake(ctx);
    }
  }

  /* ---------- 気づく → 離れる／乗り気 ---------- */
  function checkWake(ctx) {
    var S = f(ctx);
    if (S.aware || S.ended || (g(S, 'iwa') < IWA_LINE && st(S, 'clue') < 3)) return;
    (S.glog = S.glog || []).push({ d: S.d, t: S.t, where: 'check', iwa: g(S, 'iwa'), want: g(S, 'want'), pre: !!S.pre });
    wake(ctx, '');
    S.glog[S.glog.length - 1].choice = S.choice;
  }
  function wake(ctx, why) {
    var S = f(ctx), T = TX();
    S.aware = true; S.awareDay = S.d;
    var w = pick(ctx, (T.WAKE || {})[S.ak === 'tent' ? 'tent' : S.src] || (T.WAKE || {}).app);
    var fc = {}; fc[S.B.i] = 'surprise';
    say(ctx, 'ns_wake', w, '違和感に気づいて阻害が解けた' + (why ? '（' + why + '）' : ''), { both: false, actors: [S.B], face: fc, mag: 10 });
    choose(ctx);
  }
  function choose(ctx) {
    var S = f(ctx), T = TX(), B = S.B, p = per(B);
    /* 立場の逆転（力の出どころを奪う）：強気・厳格・冷静・意地っ張り、探っていた人ほど */
    var pr = (/^(proud|stern|cool|tsun)$/.test(p) ? 0.28 : 0.1) + (S.bBr.k === 'probe' ? 0.15 : 0) + (S.ak === 'tent' ? -0.05 : 0);
    var rev = !S.noBody || S.ak === 'res' ? ctx.rng() < pr : false;
    if (g(S, 'want') >= LINE) {
      S.stay = true; S.choice = 'stay';
      var t = pick(ctx, (T.STAY || {})[S.ak] || (T.STAY || {}).res);
      var tb = pick(ctx, (T.STAY_B || {})[p] || (T.STAY_B || {}).gentle);
      var fc = {}; fc[B.i] = S.pre ? 'smile_lover' : 'shy';
      say(ctx, 'ns_stay', join(t, tb), '気づいたうえで乗り気のまま続ける（本音が線を越えている）', { face: fc, fx: function () { mod(ctx, { aff: 3, att: 3 }, { aff: 2, att: 4 }); } });
      /* 乗り気のまま続ける人は、力を奪って責める側には回らない（立場の逆転は、離れた人だけ） */
      return;
    }
    /* 線を越えていない：その場を離れる（離れる・断る・人に知らせる）。性的な場面は止まる */
    var wl = { leave: 1 + (/^(shy|gentle|devoted)$/.test(p) ? 0.8 : 0), refuse: 1 + (/^(proud|stern|tsun)$/.test(p) ? 0.9 : 0), report: 0.7 + (/^(polite|stern|cool)$/.test(p) ? 0.6 : 0) + (S.ak !== 'res' ? 0.9 : 0) + (S.bBr.k === 'consult' ? 0.6 : 0) };
    var sum = wl.leave + wl.refuse + wl.report, x = ctx.rng() * sum, k = x < wl.leave ? 'leave' : x < wl.leave + wl.refuse ? 'refuse' : 'report';
    S.out = true; S.choice = k; S.outDay = S.d;
    var id = { leave: 'ns_leave', refuse: 'ns_refuse', report: 'ns_report' }[k];
    var t2 = pick(ctx, ((T.OUT || {})[k] || {})[S.ak] || ((T.OUT || {})[k] || {}).res);
    var tb2 = pick(ctx, ((T.OUT_B || {})[k] || {})[p] || ((T.OUT_B || {})[k] || {}).gentle);
    var fc2 = {}; fc2[B.i] = k === 'refuse' ? 'angry' : 'fear';
    say(ctx, id, join(t2, tb2), '気づいてその場を離れた（' + { leave: '離れる', refuse: '面と向かって断る', report: '人に知らせる' }[k] + '・本音は線の手前）', { cat: k === 'refuse' ? 'conflict' : 'bond', face: fc2, mag: 12, fx: function () { mod(ctx, { aff: -2, ten: 6 }, { aff: -8, trust: -10, ten: 10 }); } });
    if (rev) reverse(ctx);
  }
  function confess(ctx) {
    var S = f(ctx), T = TX();
    var t = pick(ctx, ((T.CONFESS || {})[per(S.A)]) || (T.CONFESS || {}).gentle);
    if (!t) return;
    var fc = {}; if (S.ak === 'res') fc[S.A.i] = 'sad';
    say(ctx, 'ns_confess', t, 'する側が力を使っていたと打ち明けた（罪悪感で止める）', { face: fc, mag: 10 });
    push(ctx, 'clue', 100);
    wake(ctx, '打ち明けられた');
  }
  function reverse(ctx) {
    var S = f(ctx), T = TX();
    if (S.rev) return;
    var t = pick(ctx, (T.REVERSE || {})[S.ak === 'tent' ? 'tent' : S.src]);
    var tb = pick(ctx, (T.REVERSE_B || {})[per(S.B)] || (T.REVERSE_B || {}).gentle);
    if (!t) return;
    S.rev = true;
    var fc = {}; fc[S.B.i] = 'angry';
    say(ctx, 'ns_reverse', join(t, tb), '力を奪って立場が入れ替わった（' + SRC_W[S.src] + '）', { cat: 'conflict', face: fc, mag: 12 });
  }
  /* 気づいて乗り気のまま続ける日（日中） */
  function stayDay(ctx) {
    var S = f(ctx), T = TX();
    var t = pick(ctx, T.STAY_DAY, { g: 'habit' });
    if (t) say(ctx, 'ns_stay', t, '気づいたまま乗り気で過ごす日', { fx: function () { mod(ctx, { att: 2 }, { att: 2 }); } });
    push(ctx, 'want', 2);
    if (st(S, 'habit') >= 2 && S.bBr.k === 'ache' && DK.once(S, 'ask')) S.asked = true;
  }
  /* 離れたあとの日々（日中・夜）：二人の距離・向き合う・自分から戻ってくる */
  function outDay(ctx) {
    var S = f(ctx), T = TX();
    var t = pick(ctx, ((T.AVOID || {})[S.choice] || {})[S.ak] || (T.AVOID_ALL || []), { again: true });
    if (t) say(ctx, 'ns_avoid', t, '離れたあとの二人（' + { leave: '離れた', refuse: '断った', report: '人に知らせた' }[S.choice] + '）');
    if (S.ak === 'res' && !S.faced && S.d > S.outDay && (S.aBr.k === 'guilt' || /^(gentle|devoted|shy|polite)$/.test(per(S.A)) || ctx.rng() < 0.35)) face(ctx);
    else if (S.G.length && ctx.rng() < 0.5) { var gt = pick(ctx, T.OUT_G); if (gt) say(ctx, 'ns_avoid', gt, '離れたあと、周りの人と話す', { both: false, actors: [S.B, S.G[0]] }); }
    else if (ctx.rng() < 0.5) daily(ctx, true);
  }
  function face(ctx) {
    var S = f(ctx), T = TX();
    S.faced = true;
    var t = pick(ctx, (T.FACE || {})[per(S.A)] || (T.FACE || {}).gentle);
    var ok = g(S, 'want') >= 40 || S.grp === 'love' || S.grp === 'pine';
    var tb = pick(ctx, ok ? T.FACE_OK : T.FACE_NG);
    say(ctx, 'ns_face', join(t, tb), '気づいたあとで向き合った（' + (ok ? '受け止めた' : '受け止めなかった') + '）', { mag: 8, fx: function () { if (ok) mod(ctx, { aff: 3, trust: 3, ten: -5 }, { aff: 3, trust: 4, ten: -6 }); } });
    if (ok) { S.reconciled = true; push(ctx, 'want', 10); }
    /* 線を越えたなら、自分から戻ってくる（気づいたうえで乗り気。離れた理由が消えた） */
    if (ok && g(S, 'want') >= LINE && !S.noBody) {
      var bt = pick(ctx, T.BACK); if (bt) say(ctx, 'ns_back', bt, '離れたあとで自分から戻ってきた（本音が線を越えた）', { fx: function () { mod(ctx, { att: 4 }, { att: 4 }); } });
      S.out = false; S.stay = true; S.back = true;
    }
  }
  function outNight(ctx) {
    var S = f(ctx), T = TX();
    var t = pick(ctx, ((T.OUT_N || {})[S.ak]) || T.OUT_N.res, { again: true });
    if (t) say(ctx, 'ns_night', t, '離れたあとの夜', { both: S.ak === 'res' });
  }
  /* 力を握った受けの日々 */
  function revDay(ctx, part) {
    var S = f(ctx), T = TX(), t;
    if (part === 'm') t = join(pick(ctx, (T.PLACE_M || {})[S.place], { again: true }), pick(ctx, T.REV_M, { again: true }));
    else if (part === 'n') t = pick(ctx, T.REV_N, { again: true });
    else t = pick(ctx, ((T.REV_DAY || {})[S.ak]) || T.REV_DAY.res, { again: true });
    if (t) say(ctx, 'ns_rev_day', t, '力を握った側が相手を試す（' + { m: '朝', d: '日中', n: '夜' }[part] + '）', { both: S.ak === 'res' && /\{a\}/.test(t) });
    if (part === 'd' && ctx.rng() < 0.5) daily(ctx, true);
  }

  /* ---------- 二人の日々の出来事（40 種以上。ninshiki-text-b.js の DAILY） ---------- */
  function daily(ctx, need) {
    var S = f(ctx), T = TX();
    var list = S.ak === 'tent' ? T.DAILY_TENT : T.DAILY;
    var t = pick(ctx, list, { g: 'clue', again: !!need });
    if (!t) return;
    var acts = S.G.length && /\{g\}/.test(t) ? actorsOf(S).concat([S.G[0]]) : actorsOf(S);
    say(ctx, 'ns_daily', t, '二人の日々（' + PLACE_W[S.place] + '）', { actors: acts, fx: function () { mod(ctx, { aff: 1 }, { aff: 1 }); } });
    if (!S.out && !S.aware) { push(ctx, 'want', 1); clueUp(ctx, 2); }
  }

  /* ---------- 山場：力が切れかける瞬間 ---------- */
  function peak(ctx) {
    var S = f(ctx), T = TX();
    S.peakDone = true;
    if (S.out && !S.back) {
      var ft = pick(ctx, (T.PEAK_OUT || {})[S.ak] || T.PEAK_OUT.res);
      say(ctx, 'ns_peak', ft, '山場：離れたあとの二人が、力の切れかけた空間で鉢合わせる', { mag: 15 });
      return;
    }
    var pl = pick(ctx, ((T.PEAK_PLACE || {})[S.place] || []).filter(function (x) { return S.ak === 'tent' ? /触手|影/.test(typeof x === 'string' ? x : x.t) : !/触手/.test(typeof x === 'string' ? x : x.t); }));
    var pt = pick(ctx, (T.PEAK || {})[S.ak === 'tent' ? 'tent' : 'res']);
    var fc = {}; fc[S.B.i] = 'surprise';
    say(ctx, 'ns_peak', join(pl, pt), '山場：力が切れかける瞬間（人前・' + PLACE_W[S.place] + '）', { face: fc, mag: 15 });
    push(ctx, 'wear', 100);
    if (!S.aware) {
      /* 前もって許していない人は、この一瞬で必ず気づく（何も知らないまま終わる結末は、許していた二人だけ） */
      push(ctx, 'clue', S.pre ? 22 : 100);
      push(ctx, 'iwa', S.pre ? 20 : 100);
      if (!S.aware && (g(S, 'iwa') >= IWA_LINE || st(S, 'clue') >= 3)) {
        (S.glog = S.glog || []).push({ d: S.d, t: S.t, where: 'peak', iwa: g(S, 'iwa'), want: g(S, 'want'), pre: !!S.pre });
        wake(ctx, '力が切れかけた一瞬');
        S.glog[S.glog.length - 1].choice = S.choice;
      }
    }
    if (!S.out && guard(ctx, 'peak') && R18 && elig(ctx) && R18.chance(ctx, 'peak')) R18.run(ctx, 'peak');
    else if (!S.out && !S.aware) { var pr = pick(ctx, T.PEAK_PASS); if (pr) say(ctx, 'ns_peak', pr, '山場：認識が一瞬だけ解けて、また戻る'); }
  }

  /* ---------- 結末 ---------- */
  var END_W = { hidden: 'バレずに続く', broken: 'バレて関係が壊れる', accepted: 'バレて受け入れられる', crave: '体が疼いて自分から求める', reverse: '力を奪われて立場が逆転' };
  function decideEnd(ctx) {
    var S = f(ctx);
    if (S.endK) return S.endK;
    var k;
    if (!S.aware) k = S.pre ? 'hidden' : 'broken';
    else if (S.rev) k = 'reverse';
    else if (S.stay) k = (S.asked || st(S, 'habit') >= 3 || (S.bBr.k === 'ache' && st(S, 'habit') >= 2)) ? 'crave' : 'accepted';
    else if (S.reconciled) k = 'accepted';
    else k = 'broken';
    S.endK = k;
    return k;
  }
  function ending(ctx) {
    var S = f(ctx), T = TX();
    if (S.ended) return;
    var k = decideEnd(ctx);
    var t = pick(ctx, ((T.END || {})[k] || {})[S.ak] || ((T.END || {})[k] || {}).res);
    var tg = pick(ctx, ((T.END_TGT || {})[S.tgt]) || []);
    if (S.ak !== 'res' || k === 'broken' || k === 'reverse') tg = '';
    var fc = {}; fc[S.B.i] = { hidden: 'normal', broken: 'sad', accepted: S.love ? 'smile_lover' : 'joy', crave: 'shy', reverse: 'angry' }[k];
    var cat = S.love && (k === 'accepted' || k === 'crave') ? 'romance' : 'bond';
    say(ctx, 'ns_end', join(t, tg), '結末（' + END_W[k] + '）', { cat: cat, face: fc, mag: 20, fx: function () { if (k === 'accepted' || k === 'crave') mod(ctx, { aff: 4, att: 4, trust: 3 }, { aff: 4, att: 4, trust: 3 }); else if (k === 'broken') mod(ctx, { aff: -4, trust: -6 }, { aff: -6, trust: -8 }); } });
    S.ended = true;
  }
  function finish(ctx) {
    var S = f(ctx); if (!S) return;
    if (!S.ended) ending(ctx);
    var k = decideEnd(ctx), A = S.A, B = S.B;
    S.G.forEach(function (c) { c.fate = c.outside ? '相談の相手（名簿から）' : '周りの人'; });
    if (S.ak === 'res') { A.fate = '力を使った人'; A.fateNote = B.name + 'に' + SRC_W[S.src] + 'の力を使った'; }
    B.fate = '力を向けられた人'; B.fateNote = (S.ak === 'res' ? A.name : S.ak === 'tent' ? '触手' : A.label || A.name) + 'に認識を阻まれた' + (S.aware ? '。途中で気づいた' : '');
    ctx.flags.ninshiki = { days: S.days, a: S.ak === 'res' ? A.i : null, an: S.ak === 'res' ? A.name : S.ak === 'tent' ? '触手' : (A.label || A.name), b: B.i, ak: S.ak, src: S.src, range: S.range, place: S.place, bold: S.boldD, tgt: S.tgt, clues: S.clueN,
      aBr: MOVE_W[S.aBr.k], aOdd: S.aBr.odd, bBr: REACT_W[S.bBr.k], bOdd: S.bBr.odd, pre: S.pre, aware: S.aware, awareDay: S.awareDay != null ? S.awareDay + 1 : null, choice: S.choice, rev: S.rev, end: k, endW: END_W[k], sex: S.r18 ? S.r18.n : 0, noBody: !!S.noBody,
      want: g(S, 'want'), clue: g(S, 'clue'), habit: g(S, 'habit') };
    ctx.flags.outcome = B.name + 'の認識阻害の' + S.days + '日――' + END_W[k];
  }
  DK.install(ID, DK.couple('part', 'user', 'target', ['guest']), 'ninshiki');
  var SRC_J = { app: 'アプリ', magic: '魔法', drug: '薬' }, RANGE_J = { self: '本人だけ', all: '周りも' }, CH_J = { stay: '気づいたうえで乗り気', leave: '離れた', refuse: '面と向かって断った', report: '人に知らせた' };
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.ninshiki, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var b = X.nm(R.b), a = R.a != null ? X.nm(R.a) : R.an;
    lines.push('認識阻害の' + R.days + '日（' + a + 'が' + b + 'に力を使った）');
    lines.push('力の出どころ：' + SRC_J[R.src] + '／効く範囲：' + RANGE_J[R.range] + '／舞台：' + PLACE_W[R.place]);
    lines.push(a + '：' + R.aBr + (R.aOdd ? '（らしくない）' : '') + '／' + b + '：' + R.bBr + (R.bOdd ? '（らしくない）' : ''));
    lines.push(R.aware ? b + 'は DAY' + R.awareDay + 'に気づき、' + (CH_J[R.choice] || '') + (R.rev ? '（力を奪った）' : '') : b + 'は最後まで気づかなかった（前もって許していた）');
    lines.push('エッチ ' + R.sex + '回' + (R.noBody ? '（体の場面を出せない組）' : ''));
    lines.push('結末：' + R.endW);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['結末', R.endW], ['エッチ', R.sex + '回']], lines: lines };
  };
  var R18 = null;
  HK.Ninshiki = { ID: ID, LINE: LINE, IWA_LINE: IWA_LINE, guard: guard, f: f, pick: pick, fill: fill, say: say, elig: elig, per: per, mobGOk: mobGOk, relOf: relOf, crushDir: crushDir, setR18: function (x) { R18 = x; }, decideEnd: decideEnd, PLACE_W: PLACE_W, SRC_W: SRC_W };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: '夜の場面の描き方。ほのめかす＝ぼかした一文だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
