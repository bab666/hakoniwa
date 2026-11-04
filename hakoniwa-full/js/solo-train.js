/* 箱庭シミュレーター（R18版のみ）: 常識改変：電車
   満員電車で乗客どうしが体を触れ合わせ、慰め合うのが「当たり前のマナー」になった世界（常識改変の姉妹の部屋）。
   住人は最初その常識の中にいて、ふとした違和感（「これって、えっちなお触りかな？」）に気づくか、気づいて覚めたらどうするか
   （通報する・降りる・合意の上でスリルを楽しむ・言い出せない）を、乗る日数のあいだ見る。快楽が高いと翌朝また常識に引き戻される（かかり直し）。
   ・数値（住人ごと）：かかり具合 imm・違和感 doubt・快楽 plea・理性 reason。判定の式は docs/reports/2026-11-04/train-design.md
   ・二人：片方だけが自分で攻めを選んでいれば、その人は途中の駅で乗ってきて、触れ合われている連れを引き寄せて降りる役（rescue）。
     ほかは同じ車両に乗り合わせる（same）。攻めを選んだ人は受ける側にしない（HK.Pos）
   ・覚めたあとの性的な場面は「スリルを楽しむ」（本人が分かったうえで選んだ）ときだけ。言い出せない人には、乗客は手を引く（反応のない相手にはしないのもマナー）
   ・山場・二人の夜の前には、きっかけの段（HK.SexLead と同じ考え方）を別の段で出す。文は solo-train-data.js・solo-train-ero.js
   ・登場人物はすべて成人として扱う。全年齢版には置かない */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=train id=tr_board cat=solo tie=- label=いつもの満員電車に乗る（駅のマナーのポスター） */
/* @event scen=train id=tr_touch cat=夜 tie=- tags=mob label=常識どおりに乗客と触れ合う（受ける・自分からする） */
/* @event scen=train id=tr_esc cat=夜 tie=- tags=mob label=触れ合いが深まっていく（体が応え始める） */
/* @event scen=train id=tr_moya cat=solo tie=- tags=mob label=これってえっちなお触り？（言い訳に騙される） */
/* @event scen=train id=tr_notice cat=solo tie=- label=ふとした違和感に戸惑う・口に出す */
/* @event scen=train id=tr_getoff cat=solo tie=- label=途中の駅で降りてしまう */
/* @event scen=train id=tr_wake cat=solo tie=- label=違和感に気づいて、常識の催眠が覚める */
/* @event scen=train id=tr_report cat=solo tie=- label=覚めて通報する（常識の強さで結果が変わる） */
/* @event scen=train id=tr_thrill cat=solo tie=- tags=mob label=覚めたうえで、合意の上でスリルを選ぶ */
/* @event scen=train id=tr_silent cat=solo tie=- label=覚めているのに、なかなか言い出せない */
/* @event scen=train id=tr_resink cat=solo tie=- label=翌朝、また常識に引き戻される（かかり直し） */
/* @event scen=train id=tr_switch cat=solo tie=- label=別の路線に変えて、もう乗らない */
/* @event scen=train id=tr_seec cat=solo tie=- tags=mob label=連れが乗客と触れ合うのを見てしまう */
/* @event scen=train id=tr_share cat=solo tie=- label=連れと二人だけ違和感を分け合う */
/* @event scen=train id=tr_tell cat=solo tie=- label=一人だけ覚めて、連れに気づかせようとする */
/* @event scen=train id=tr_bothoff cat=solo tie=- label=連れと二人で覚めて、途中の駅で降りる */
/* @event scen=train id=tr_rescue cat=solo tie=- tags=mob label=途中の駅で乗ってきて、連れを引き寄せて降りる */
/* @event scen=train id=tr_rescue_calm cat=solo tie=- label=引き寄せたあと、落ち着かせて帰る・持ち越す */
/* @event scen=train id=tr_after cat=solo tie=- label=終点の駅での後味 */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, D = HK.TRAIN, clamp = HK.clamp;
  if (!ST || !D || HK.SAFE_ON) return;
  var X = D.X || {};
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  var PS_JA = { proud: '強気', stern: '厳格', tsun: '意地っ張り', gentle: '穏やか', devoted: '健気', cool: '冷静', free: '奔放', shy: '内気', polite: '丁寧' };
  function ps(p) { return PS.indexOf(p && p.persona) >= 0 ? p.persona : 'gentle'; }
  /* 同じ結果の中で同じ文を繰り返さない：まだ使っていない文（いちばん前に使った文）から選ぶ */
  function pk(S, arr) {
    if (!arr || !arr.length) return '';
    var m = S._pkLru = S._pkLru || { n: 0, at: {} }, best = [], bv = Infinity;
    for (var i = 0; i < arr.length; i++) { var a = m.at['$' + arr[i]] || 0; if (a < bv) { bv = a; best = [arr[i]]; } else if (a === bv) best.push(arr[i]); }
    var x = best[S.rng.int(best.length)];
    m.at['$' + x] = ++m.n;
    return x;
  }

  /* R18 が中心の箱庭（R18に参加しない は効かせない。性行為の相手の固定は効かせる。engine.js の HK.State.R18_CORE） */
  if (HK.State && HK.State.R18_CORE) HK.State.R18_CORE.train = 1;

  var LINE_OPT = [{ v: 'random', label: 'おまかせ' }, { v: 'morning', label: '朝の通勤（上り）' }, { v: 'evening', label: '帰宅ラッシュ（下り）' }, { v: 'last', label: '終電' }, { v: 'night', label: '夜行' }];
  var scen = {
    id: 'train', name: '常識改変：電車', kicker: '1〜2人・R18', solo: true, minCast: 1, maxCast: 2,
    desc: '満員電車で乗客どうしが体を寄せ合い、慰め合うのが「当たり前のマナー」になった世界。住人もその常識の中で毎日電車に乗る。「これってえっちなお触り？」というもやもやから、違和感に気づいて催眠のような常識が覚めるのか、流され続けるのか。気づいたら、通報する・降りる・分かったうえでスリルを楽しむ・言い出せない。2人なら、同じ車両に乗り合わせるか、攻めの人が途中の駅で乗ってきて連れを引き寄せる。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: '日', simulate: function (input) { return run(input); },
    castHint: '1〜2人。理性的な人（A・CPが高い）ほど違和感に気づきやすく、素直な人（AC）ほど常識に馴染みます。2人のとき、片方だけが受け攻めで「攻め」を選んでいれば、その人は途中の駅で乗ってきて、触れ合われている連れを引き寄せる役になります。',
    derived: ['caution', 'impulse', 'honesty', 'cold'],
    env: [
      { id: 'crowd', label: '混み具合', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'sparse', label: '空いている' }, { v: 'busy', label: '混んでいる' }, { v: 'packed', label: '満員' }], desc: '混んでいるほど触れ合いが深まりやすく、終点前の山場が起きやすい' },
      { id: 'line', label: '路線と時間', type: 'select', def: 'random', options: LINE_OPT },
      { id: 'norm', label: '常識の強さ', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'loose', label: 'ゆるい（目をそらす人もいる）' }, { v: 'normal', label: 'ふつう' }, { v: 'strict', label: '徹底（駅員が「マナー」を促す）' }], desc: 'ゆるいほど違和感に気づきやすく、通報すると駅員が応じる。徹底では、通報しても「マナーですよ」と流される' },
      { id: 'dist', label: '降りる駅までの長さ', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'short', label: '短い（3駅）' }, { v: 'mid', label: 'ふつう（4駅）' }, { v: 'term', label: '終点まで（6駅）' }], desc: '長いほど触れ合いが深まる。2人で攻めの人がいるとき、その人が乗ってくる駅も変わる' },
      { id: 'days', label: '乗る日数', min: 1, max: 7, def: 3, lo: '1日', hi: '7日', unit: '日', desc: '日ごとに快楽・違和感・かかり具合を持ち越す。違和感が積もる日も、常識に馴染む日もある' },
      { id: 'partner', label: '触れ合う相手', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'one', label: '一人の乗客' }, { v: 'many', label: '複数の乗客' }, { v: 'pair', label: '連れの住人（2人のとき）' }], desc: '「連れの住人」は、2人が同じ車両に乗るとき、恋愛対象・受け攻め・関係の設定で体の関係になれる二人だけ（なれなければ乗客）' }
    ],
    stats: [{ id: 'sens', label: '感じやすさ', desc: '高いほど触れ合いで快楽が溜まり、終点前の山場に届きやすい（快楽が高いと、覚めても翌朝また常識に引き戻されやすい）' }],
    actions: [
      { id: 'accept', label: '常識どおりに受け入れる', fit: function (t) { return t.ac * 0.6 + t.np * 0.3; } },
      { id: 'give', label: '常識どおりに自分からする', fit: function (t) { return t.fc * 0.4 + (t.aggr || 0) * 0.3 + (t.lead || 0) * 0.3; } },
      { id: 'puzzle', label: 'ふとした違和感に戸惑う', fit: function (t) { return t.a * 0.5 + t.caution * 0.4; } },
      { id: 'voice', label: '違和感を口に出す', fit: function (t) { return t.cp * 0.5 + t.honesty * 0.4; } },
      { id: 'getoff', label: '途中の駅で降りる', fit: function (t) { return t.caution * 0.5 + (1 - t.ac) * 0.3; } }
    ],
    goals: [
      { id: 'work', label: '通勤', fit: function (t) { return t.cp * 0.5 + t.a * 0.4; } },
      { id: 'home', label: '帰宅', fit: function (t) { return t.ac * 0.5 + t.np * 0.3; } },
      { id: 'trip', label: '小旅行', fit: function (t) { return t.fc * 0.6 + t.impulse * 0.3; } },
      { id: 'meet', label: '人に会いに行く', fit: function (t) { return t.np * 0.5 + t.warmth * 0.4; } }
    ],
    events: []
  };
  HK.SCENARIOS.train = scen;
  if (HK.SCEN_ORDER.indexOf('train') < 0) {
    var at = HK.SCEN_ORDER.indexOf('kaihen');
    if (at >= 0) HK.SCEN_ORDER.splice(at + 1, 0, 'train'); else HK.SCEN_ORDER.push('train');
  }
  /* 描写の設定（lewd-unify.js）：描写の有無・作風（長さは使わない＝いつも段落に分けた山場） */
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install('train', { len: false, def: 'mid', desc: '終点前の山場と二人の夜の描き方。ほのめかす＝上気した頬だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
  /* 一覧のカードの文（短い説明・キャッチコピー・R18 だけの印）は scen-meta.js の登録の表に書いた（箱庭を読む前から要るため） */
  /* 箱庭タブの参加者の欄の下の案内（ui.js の HK.ScenUI） */
  if (HK.ScenUI && HK.ScenUI.add) HK.ScenUI.add('train', { joinNote: function () { return '<p class="hint" style="margin-top:8px">2人のとき、片方だけが受け攻めで「攻め」を選んでいると、その人は途中の駅で乗ってきて、連れを引き寄せる役になります。</p>'; } });

  /* ---------- 便利 ---------- */
  function rv(S, k, list) { var v = S.env[k]; return v && v !== 'random' && list.indexOf(v) >= 0 ? v : S.rng.pick(list); }
  function fm(t, v) { return ST.fmt(t, v); }
  /* 乗客の名前：最初の {m} は「会社員の佐伯」、あとは「佐伯」 */
  function mobFmt(t, m) {
    if (!m) return t;
    var n = m.seen ? 1 : 0;
    var r = t.replace(/\{m\}/g, function () { return n++ ? m.short || m.name : m.name; });
    if (n) m.seen = true;
    return r;
  }
  var ROLE = { m: ['会社員', '銀行員', '公務員', '設計士', '営業職の会社員', '出張帰りの会社員'], f: ['会社員', '銀行員', '看護師', '美容師', '公務員', '受付係の会社員'] };
  function mobGen(S, p) {
    var sl = HK.Pos && HK.Pos.sexLikeOf ? HK.Pos.sexLikeOf(p) : '', lk = sl === 'm' || sl === 'f' ? sl : p.likes;
    if (lk === 'm' || lk === 'f') return lk;
    return S.rng() < 0.5 ? 'm' : 'f';
  }
  function newMob(S, p) {
    var g = mobGen(S, p), m = HK.Mob.make(S, { gender: g, role: S.rng.pick(ROLE[g]) });
    m.mobRole = 'street'; m.persona = S.rng.pick(['gentle', 'polite', 'cool', 'free']);
    return m;
  }
  function isF(c) { return !!(HK.Pos && HK.Pos.isF ? HK.Pos.isF(c) : c.gender === 'f'); }
  function hasM(c) { return !!(HK.Pos && HK.Pos.hasM ? HK.Pos.hasM(c) : c.gender !== 'f'); }
  function modeOf(top, bot) { return isF(top) && isF(bot) ? 'ff' : isF(top) ? 'fm' : 'mf'; }
  /* 住人の声（受けのときだけ。stage 0＝こらえる 1＝とろける） */
  function hv(S, p, stage) {
    var v = HK.Moan && HK.Moan.say ? HK.Moan.say(S, p, 'mid', { novel: !S.ero }, null) : '';
    return v ? p.name + '「' + v + '」' : '';
  }
  function mv(S, m, stage) { var v = HK.Moan && HK.Moan.mob ? HK.Moan.mob(S, m, stage, { side: false, gross: !!S.ero }) : ''; return v ? m.short + '「' + v + '」' : ''; }
  /* 二人の体の関係・恋愛の可否（恋愛対象・受け攻め・恋愛やR18にしない相手・性欲・関係の「恋愛」の欄） */
  function pairSexOk(S, a, b) {
    if (!a || !b || a === b) return false;
    if (HK.Pos && !HK.Pos.okSex(a, b)) return false;
    if (HK.ngSexPair && HK.ngSexPair(a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (HK.Pos && HK.Pos.libOK && !HK.Pos.libOK([a, b])) return false;
    if (avoidPair(S, a, b)) return false;
    var rel = relOf(S, a, b);
    if (rel === 'fwb') return true;
    return loveOk(S, a, b);
  }
  function loveOk(S, a, b) { return !!(HK.canLove && HK.canLove(a, b, S) && HK.canLove(b, a, S)); }
  /* どちらかが相手を避けている（恐怖・無関心・苦手など。avoid-kit.js の HK.Avoid）二人：迎え・連れどうしの場面を出さない */
  function avoidPair(S, a, b) { return !!(HK.Avoid && (HK.Avoid.of(S, a, b) || HK.Avoid.of(S, b, a))); }
  function relOf(S, a, b) {
    var t = (S.ties || []).filter(function (x) { return x && ((x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i)); }), ks = t.map(function (x) { return x.type; });
    if (ks.some(function (k) { return /^(lover|mate|fated)$/.test(k); })) return 'lover';
    if (ks.indexOf('fwb') >= 0) return 'fwb';
    if (ks.some(function (k) { return /^(crush|almost|honmei|ex)$/.test(k); })) return 'crush';
    if (ks.length) return 'friend';
    return 'stranger';
  }
  var REL_JA = { lover: '恋人', fwb: 'セフレ', crush: '片想い・友達以上', friend: '知り合い・友人', stranger: '初対面' };

  /* ---------- 長い場面（終点前の満員車両・二人の夜） ---------- */
  function longScene(S, a, b, o) {
    var pick = function (l) { return pk(S, l); };
    S._trainScene = o.car ? 'car' : '';
    var opt = { S: S, ctx: S, pick: pick, rng: S.rng, a: a, b: b, style: HK.ThickSex.style(a), open: o.open, after: o.after, again: false };
    var r;
    try { r = S.ero && HK.ThickEro ? HK.ThickEro.scene(opt) : HK.ThickSex.scene(opt); } finally { S._trainScene = ''; }
    var t = String(r && r.text || '');
    /* 女性の攻め×男性で、受けの熱を受け止める書き方（「注がれる熱を受け止め」）は、攻めが受ける文に読まれるので言い換える */
    if (r && r.mode === 'fm') t = t.replace(/注がれる熱/g, '{b}の放つ熱');
    if (X.swap) t = X.swap(t);
    if (S.lv === 'high' && HK.ThickEro && HK.ThickEro.again) { var ag = HK.ThickEro.again(S, pick, a, b, !!S.ero, false); if (ag) t += '\n\n' + ag; }
    var an = a.mob ? a.short || a.name : a.name, bn = b.mob ? b.short || b.name : b.name;
    return t.replace(/\{a\}/g, an).replace(/\{b\}/g, bn);
  }
  /* きっかけの段（エッチの場面の直前に、別の段で） */
  function lead(S, actors, text, why) {
    return ST.say(S, { actors: actors, tag: 'きっかけ', text: text, why: 'きっかけ：' + why, mag: 10 });
  }

  /* ---------- 一回 ---------- */
  function run(input) {
    var S = ST.state(input, 'train'), rng = S.rng, env = S.env, P = S.P;
    S.input = { scenId: 'train' };
    S.ties = ST.tiesOk(P, input.ties);
    var crowd = rv(S, 'crowd', ['sparse', 'busy', 'packed']), line = rv(S, 'line', ['morning', 'evening', 'last', 'night']);
    var norm = rv(S, 'norm', ['loose', 'normal', 'strict']), dist = rv(S, 'dist', ['short', 'mid', 'term']);
    var days = clamp(Math.round(+env.days || 3), 1, 7), partner = rv(S, 'partner', ['one', 'many', 'pair']);
    var LN = D.LINE[line];
    S.lv = HK.Lewd && HK.Lewd.lv ? HK.Lewd.lv(env) : 'mid';
    S.ero = !!(HK.Lewd && HK.Lewd.ero && HK.Lewd.ero(env) && HK.ThickEro);
    S.v = { crowd: crowd, line: line, norm: norm, dist: dist, days: days, partner: partner, LN: LN };
    var normK = { loose: 1.35, normal: 1, strict: 0.8 }[norm];
    var nSt = { short: 3, mid: 4, term: 6 }[dist];
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = pickOpt(S, p, scen.actions, pc.action); p.goal = pickOpt(S, p, scen.goals, pc.goal);
      p.willK = HK.Attr && HK.Attr.willK ? HK.Attr.willK(p) : 1;
      p.sens = 0.6 + (p.stats.sens || 3) * 0.18;
      p.lib = HK.Pos && HK.Pos.libOf ? HK.Pos.libOf(p) : '';
      p.libK = HK.Pos && HK.Pos.libK ? HK.Pos.libK(p) : 1;
      /* 乗客との向き：自分で攻めを選んだ人（モブには受け にしていない）は、いつも触れる側 */
      var npc = HK.Pos && HK.Pos.vsNpc ? HK.Pos.vsNpc(p, '') : '';
      p.top = !!(HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(p)) || (p.action.id === 'give' && npc !== 'bottom');
      if (p.action.id === 'give' && !p.top) p.action = scen.actions[0];
      /* 乗客との触れ合いに出してよい人（性行為の相手を「固定した相手だけ」にした人・体の関係の相手「なし」の人は、触れ合いの外で眺める） */
      p.canMob = !!(HK.State ? HK.State.mobSexOk(p) : true) && !(HK.Pos && HK.Pos.sexLikeOf && HK.Pos.sexLikeOf(p) === 'none' && p.likes === 'none');
      p.reason0 = clamp(55 + p.eg.A * 1.1 + p.eg.CP * 0.9, 40, 100);
      p.m = {
        imm: clamp({ loose: 55, normal: 68, strict: 76 }[norm] + p.tr.ac * 14 - p.tr.a * 10 + (p.willK - 1) * 25, 20, 98),
        doubt: clamp(p.tr.a * 10 + (p.action.id === 'puzzle' ? 10 : 0) + (p.action.id === 'voice' ? 6 : 0), 0, 30),
        plea: 0, reason: p.reason0
      };
      p.cnt = { rides: 0, touch: 0, peak: 0, moya: 0, notice: 0, voice: 0, off: 0, wake: 0, resink: 0, report: 0, thrill: 0, silent: 0, pair: 0, night: 0 };
      p.state = 'norm'; p.branch = ''; p.gone = false; p.pleaPk = 0;
    });
    /* 二人の形 */
    S.mode = 'solo';
    if (P.length === 2) {
      var tops = P.filter(function (x) { return HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(x); });
      S.noDuo = avoidPair(S, P[0], P[1]);
      if (tops.length === 1 && !S.noDuo) { S.mode = 'rescue'; S.T = tops[0]; S.R = P[0] === S.T ? P[1] : P[0]; }
      else S.mode = 'same';
      S.pairOk = pairSexOk(S, P[0], P[1]);
      S.rel = relOf(S, P[0], P[1]);
    }
    P.forEach(function (p) { p.roleLabel = S.mode === 'rescue' ? (p === S.T ? '途中から乗る連れ' : '乗っている人') : p.top ? '自分からする乗客' : '受け入れる乗客'; });
    var keys = ['imm', 'doubt', 'plea', 'reason'];
    ST.step(S, '乗車前');
    ST.say(S, { kind: 'phase', text: '舞台は「' + LN.name + '」（' + LN.label + '・' + { sparse: '空いている', busy: '混んでいる', packed: '満員' }[crowd] + '）。この世界では、混んだ車内で乗客どうしが体を寄せ合い、慰め合うのが当たり前のマナーになっている。' + { loose: '常識はゆるく、目をそらす人もいる。', normal: '', strict: '駅員までが、そのマナーを丁寧に促している。' }[norm] });
    ST.snap(S, keys);

    for (var d = 1; d <= days; d++) {
      S.day = d;
      ST.step(S, d + '日目・' + LN.label);
      morning(S, d);
      var riders = S.mode === 'rescue' ? [S.R] : P.slice();
      riders = riders.filter(function (p) { return !p.gone; });
      if (riders.length) ride(S, riders, d, nSt, normK);
      P.forEach(function (p) {
        p.m.plea = Math.round(p.m.plea * 0.35);
        p.m.reason = clamp(p.m.reason + 18, 0, p.reason0);
        p.m.imm = clamp(p.m.imm, 0, 100); p.m.doubt = clamp(p.m.doubt, 0, 100);
      });
      ST.snap(S, keys);
    }
    return finish(S, input);
  }
  function pickOpt(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }

  /* ---------- 朝：かかり直し・降りたあとの決め直し・言い出せなかった翌日 ---------- */
  function morning(S, d) {
    var rng = S.rng, v = S.v;
    S.P.forEach(function (p) {
      if (p.gone || d === 1) return;
      if (S.mode === 'rescue' && p === S.T) return;
      var V = { a: p.name, line: v.LN.name, d: d };
      if (p.state === 'awake') {
        /* かかり直し：快楽の最高・かかり具合が高く、理性・A が低いほど（心が弱い人ほど）。通報して駅員が応じた人・二度目以降は戻りにくい */
        var pr = clamp(p.pleaPk / 100 * 0.55 + p.m.imm / 100 * 0.3 + (p.willK - 1) * 0.8 - p.tr.a * 0.25 + { loose: -0.1, normal: 0, strict: 0.15 }[v.norm] - (p.branch === 'report' && p.reportRes === 'loose' ? 0.3 : 0) - (p.cnt.wake - 1) * 0.12 - (p.branch === 'thrill' ? 0.1 : 0), 0.02, 0.8);
        p.lastResinkP = pr;
        if (rng() < pr) {
          p.state = 'norm'; p.branch = ''; p.cnt.resink++;
          p.m.imm = clamp(p.m.imm + 30, 0, 95); p.m.doubt = clamp(p.m.doubt - 40, 5, 40);
          var o = ST.say(S, { actors: [p], tag: 'かかり直し', text: fm(pk(S, D.RESINK), V), why: p.name + 'は翌朝、また常識に引き戻された（引き戻されやすさ ' + Math.round(pr * 100) + '%：快楽の最高 ' + Math.round(p.pleaPk) + '・かかり具合 ' + Math.round(p.m.imm) + '・心の強さ ' + (HK.Attr && HK.Attr.willLabel ? HK.Attr.willLabel(p) : 'ふつう') + '）', mag: 24 });
          ST.key(S, o, p.name + 'が常識に引き戻された');
          return;
        }
        /* 覚めたまま：前の日の動きで今日を決める */
        if (p.branch === 'off' || (p.branch === 'report' && p.reportRes === 'loose')) {
          var sw = clamp(0.25 + p.tr.cp * 0.35 + p.tr.caution * 0.3 - p.tr.fc * 0.2, 0.05, 0.85);
          if (rng() < sw) {
            p.gone = true; p.switched = d;
            ST.say(S, { actors: [p], tag: '別の路線へ', text: fm(pk(S, D.SWITCH_DAY), V), why: p.name + 'は路線を変えることにした（CP ' + Math.round(p.eg.CP) + '・慎重さ ' + Math.round(p.tr.caution * 100) + '）', mag: 20 });
            return;
          }
        }
        if (p.branch === 'silent') {
          var go = clamp(0.2 + p.tr.cp * 0.4 + p.tr.a * 0.2 - p.tr.ac * 0.3 + p.cnt.silent * 0.1, 0.05, 0.8);
          p.goReport = rng() < go;
          ST.say(S, { actors: [p], tag: p.goReport ? '今日こそ' : 'また乗ってしまう', text: fm(pk(S, p.goReport ? D.SILENT_GO : D.SILENT_AGAIN), V), why: p.name + 'は昨日、言い出せなかった' + (p.goReport ? '。今日こそ言うと決めた' : '') });
          return;
        }
        ST.say(S, { actors: [p], tag: '覚めたまま', text: fm(pk(S, D.KEEP), V), why: p.name + 'は覚めたまま、次の朝を迎えた（引き戻されやすさ ' + Math.round(pr * 100) + '%）' });
      }
    });
  }

  /* ---------- 一日の乗車 ---------- */
  function ride(S, riders, d, nSt, normK) {
    var rng = S.rng, v = S.v, LN = v.LN, P = S.P;
    var st0 = rng.int(Math.max(1, LN.st.length - nSt));
    var stations = LN.st.slice(st0, st0 + nSt);
    while (stations.length < nSt) stations.push(LN.st[stations.length % LN.st.length]);
    var V0 = { line: LN.name, time: LN.time, end: LN.end, st: stations[0] };
    /* 乗車 */
    var t;
    if (riders.length === 2) t = fm(pk(S, D.DUO_BOARD), { a: riders[0].name, c: riders[1].name, line: LN.name });
    else t = fm(pk(S, D.BOARD[v.line]), Object.assign({ a: riders[0].name }, V0)) + (d === 1 ? fm(pk(S, D.WHY[riders[0].goal.id]), { a: riders[0].name }) : '');
    t += '\n\n' + pk(S, D.POSTER[v.norm]).replace(/\{a\}/g, riders[0].name) + fm(pk(S, D.CROWD[v.crowd]), { a: riders[0].name });
    ST.say(S, { actors: riders, tag: '乗車', text: t, why: d === 1 ? '常識の強さ「' + { loose: 'ゆるい', normal: 'ふつう', strict: '徹底' }[v.norm] + '」・降りる駅まで ' + nSt + '駅' : '' });
    riders.forEach(function (p) { p.cnt.rides++; p.offToday = false; p.pax = null; p.peakToday = false; p.escLog = 0; });
    /* 二人：攻めの人が乗ってくる駅（rescue。最初の日は必ず、ほかの日は 6 割） */
    var Tseg = -1;
    if (S.mode === 'rescue' && !S.T.gone && (d === 1 || rng() < 0.6)) Tseg = clamp({ short: 1, mid: 2, term: 2 + rng.int(2) }[v.dist], 1, nSt - 1);
    for (var seg = 0; seg < nSt; seg++) {
      var nx = stations[Math.min(seg + 1, stations.length - 1)], last = seg === nSt - 1;
      var on = riders.filter(function (p) { return !p.offToday && !p.gone; });
      if (!on.length) break;
      if (seg === Tseg && on.indexOf(S.R) >= 0) { rescue(S, nx); break; }
      if (last) { peak(S, on, nx); break; }
      /* 二人とも乗っていて、連れどうしの触れ合い */
      var pairNow = on.length === 2 && S.mode === 'same' && !S.noDuo && S.pairOk && (v.partner === 'pair' ? rng() < 0.7 : rng() < (S.rel === 'lover' || S.rel === 'fwb' ? 0.35 : 0.15)) && on.every(function (p) { return p.state !== 'awake' || p.branch === 'thrill'; });
      if (pairNow && seg > 0) pairTouch(S, on);
      else on.forEach(function (p) { touch(S, p, seg, nx); });
      on.forEach(function (p) { if (!p.offToday) check(S, p, seg, nx, normK); });
      if (on.length === 2 && S.mode === 'same' && !S.noDuo) duoMoment(S, on, seg, nx);
    }
    /* 後味 */
    riders.forEach(function (p) {
      if (p.gone) return;
      var k = p.offToday ? '' : p.state === 'awake' ? 'awake' : p.m.doubt >= 40 ? 'doubt' : p.cnt.touch ? 'sink' : 'none';
      if (!k) return;
      ST.say(S, { actors: [p], tag: '後味', text: fm(pk(S, D.AFTER[k]), { a: p.name, end: LN.end }), why: '' });
    });
  }

  /* ---------- 触れ合い（一駅ぶん） ---------- */
  function touch(S, p, seg, nx) {
    var rng = S.rng, v = S.v;
    if (p.state === 'awake' && p.branch !== 'thrill') return awakeRide(S, p, seg, nx);
    if (!p.canMob) {
      if (seg === 0) { p.m.doubt += 6; ST.say(S, { actors: [p], tag: '触れ合いの外', text: p.name + 'は鞄を胸に抱え、触れ合う乗客たちのあいだで、ひとり腕を組んで立っていた。誰も、それを咎めはしなかった。この世界では、それも一つの乗り方だった。' + (rng() < 0.5 ? '窓に映る車内の光景を、' + p.name + 'は黙って眺め続けた。' : ''), why: p.name + 'は乗客との触れ合いに出ない設定（性行為の相手の固定・体の関係の相手）' }); }
      return;
    }
    if (!p.pax || (v.partner === 'many' && seg > 0 && rng() < 0.5)) p.pax = newMob(S, p);
    var m = p.pax, top = p.top, mode = top ? modeOf(p, m) : modeOf(m, p), V = { a: p.name, nx: nx, d: S.day }, t, tag;
    var esc = seg > 0 && p.lib !== 'none';
    if (top) {
      var gl = esc ? (mode === 'fm' && !hasM(m) ? D.GIVE_SOFT : D.GIVE_ESC[mode]) : D.GIVE[mode];
      t = mobFmt(fm(pk(S, gl), V), m) + (esc ? mv(S, m, 1) : '');
      tag = esc ? '深まる' : '触れ合い';
    } else {
      var tl = esc ? (mode === 'fm' && !hasM(p) ? D.ESC_SOFT : (HK.NoGen && HK.NoGen.on && HK.NoGen.on(m, p) ? D.ESC_SOFT : D.ESC[mode])) : D.TOUCH[mode];
      t = mobFmt(fm(pk(S, tl), V), m);
      var r = esc && p.m.plea >= 30 ? D.HEAT[ps(p)] : D.ACCEPT[ps(p)];
      t += fm(pk(S, r), V) + (esc ? hv(S, p, p.m.plea >= 45 ? 1 : 0) : '');
      tag = esc ? '深まる' : '触れ合い';
    }
    /* 記録に載せるのは、1〜2日目は乗車の最初と深まりを二度まで、3日目からは一日一件（いつもの触れ合い）。ほかは数値だけ動かす */
    var quiet = S.day >= 3 ? seg !== 1 : esc && p.escLog >= 2;
    if (S.day >= 3 && seg === 1) { t = fm(pk(S, top ? D.HABIT_GIVE : D.HABIT), V); t = mobFmt(t, m); tag = 'いつもの車両'; }
    if (esc) p.escLog = (p.escLog || 0) + 1;
    var gain = (esc ? 20 : 10) * p.sens * p.libK * rng.range(0.8, 1.2) * (v.crowd === 'packed' ? 1.25 : v.crowd === 'sparse' ? 0.8 : 1);
    p.m.plea = clamp(p.m.plea + gain, 0, 100); p.pleaPk = Math.max(p.pleaPk, p.m.plea);
    p.m.reason = clamp(p.m.reason - gain * 0.25, 0, 100);
    if (p.state === 'norm') p.m.imm = clamp(p.m.imm + 1.5 + p.tr.ac * 2, 0, 98);
    p.cnt.touch++;
    if (quiet) return;
    ST.say(S, { actors: [p], tag: tag, lewd: true, text: t, why: (top ? p.name + 'は常識どおりに自分からする側（' + (HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(p) ? '攻めの指定' : '行動「' + p.action.label + '」') + '）' : '') + (p.likes === 'm' || p.likes === 'f' ? (top ? '・' : '') + '乗客は恋愛対象に合わせた' : '') });
  }
  /* 覚めたあとの乗車（スリル以外） */
  function awakeRide(S, p, seg, nx) {
    var V = { a: p.name, nx: nx };
    if (seg === 0 && p.goReport) { p.goReport = false; return report(S, p, nx); }
    if (seg === 0) {
      if (p.branch === 'silent') { p.cnt.silent++; return ST.say(S, { actors: [p], tag: '言い出せない', text: fm(pk(S, D.SILENT), V) + (p.canMob ? mobFmt(fm(pk(S, D.SILENT_BACK), V), p.pax || newMob(S, p)) : ''), why: p.name + 'は覚めているのに、今日も言い出せなかった' }); }
      ST.say(S, { actors: [p], tag: '覚めた目で', text: fm(pk(S, D.WAKE_STAY), V), why: p.name + 'は覚めたまま乗っている。触れ合いには加わらない' });
    }
  }

  /* ---------- 違和感の判定 ---------- */
  function check(S, p, seg, nx, normK) {
    var rng = S.rng, v = S.v, V = { a: p.name, nx: nx };
    if (p.state === 'awake') return;
    /* 違和感の伸び：A・CP が高く AC が低いほど、常識がゆるいほど、心が強いほど。快楽が高いと鈍る。触れ合いの外の人・性欲「なし」の人は伸びやすい */
    var base = (0.35 + p.tr.a * 0.9 + p.tr.cp * 0.35 - p.tr.ac * 0.2) * normK * (2 - p.willK);
    var gain = base * rng.range(5, 10) * (1 - p.m.plea / 220) * (p.canMob ? 1 : 1.4) * (p.lib === 'none' ? 1.4 : 1);
    if (p.action.id === 'puzzle' || p.action.id === 'voice') gain *= 1.2;
    /* らしくない気づき：素直な人にも、ふとした瞬間に違和感が大きく伸びることがある */
    if (rng() < 0.06) gain *= 3;
    p.m.doubt = clamp(p.m.doubt + gain, 0, 100);
    p.m.imm = clamp(p.m.imm - gain * 0.3, 0, 100);
    /* もやもや（これってえっちなお触り？）→ 言い訳に騙されるか */
    if (p.state === 'norm' && p.m.doubt >= 30 && p.cnt.moya <= p.cnt.rides - 1 && p.pax && !p.top && p.canMob) {
      p.cnt.moya++;
      var fool = clamp(0.35 + p.m.imm / 200 + p.tr.ac * 0.3 + p.tr.np * 0.1 - p.tr.a * 0.35 - p.tr.caution * 0.2, 0.08, 0.9);
      var t = fm(pk(S, D.MOYA[ps(p)]), V) + '\n\n' + mobFmt(fm(pk(S, D.EXCUSE), V), p.pax);
      if (rng() < fool) {
        t += fm(pk(S, D.FOOLED[ps(p)]), V);
        p.m.doubt = clamp(p.m.doubt - 12, 0, 100); p.m.imm = clamp(p.m.imm + 6, 0, 98);
        return ST.say(S, { actors: [p], tag: 'もやもや', text: t, why: p.name + 'は「マナーですよ」に騙された（騙されやすさ ' + Math.round(fool * 100) + '%：かかり具合 ' + Math.round(p.m.imm) + '・AC ' + Math.round(p.eg.AC) + '・A ' + Math.round(p.eg.A) + '）', mag: 12 });
      }
      p.state = 'doubt';
      ST.say(S, { actors: [p], tag: 'もやもや', text: t + '\n\n' + fm(pk(S, D.NOTICE[ps(p)]), V), why: p.name + 'は言い訳を聞いても、引っかかりが消えなかった（違和感 ' + Math.round(p.m.doubt) + '）', mag: 16 });
      return;
    }
    if (p.state === 'norm' && p.m.doubt >= 30) { p.state = 'doubt'; p.cnt.notice++; ST.say(S, { actors: [p], tag: '違和感', text: fm(pk(S, D.NOTICE[ps(p)]), V), why: p.name + 'の違和感 ' + Math.round(p.m.doubt), mag: 14 }); return; }
    if (p.state !== 'doubt') return;
    /* 口に出す・途中で降りる（行動） */
    if (p.action.id === 'voice' && !p.cnt.voice && rng() < 0.6) {
      p.cnt.voice++;
      var t2 = fm(pk(S, D.VOICE[ps(p)]), V) + mobFmt(fm(pk(S, D.NORM), V), p.pax || newMob(S, p));
      p.m.doubt = clamp(p.m.doubt + 6, 0, 100);
      ST.say(S, { actors: [p], tag: '口に出す', text: t2, why: p.name + 'は違和感を口に出した（行動「' + p.action.label + '」）。誰も咎めず、誰も真に受けない', mag: 14 });
    }
    /* 覚める判定：違和感・理性が高く、かかり具合・快楽が低いほど */
    if (p.m.doubt >= 55) {
      var pw = clamp((p.m.doubt + p.m.reason * 0.3 - p.m.imm * 0.5 - p.m.plea * 0.25) / 100, 0.04, 0.9);
      p.lastWakeP = pw;
      if (rng() < pw) return wake(S, p, nx, pw);
    }
    if (p.action.id === 'getoff' && rng() < 0.35 + p.tr.caution * 0.3) {
      p.offToday = true; p.cnt.off++;
      ST.say(S, { actors: [p], tag: '途中下車', text: fm(pk(S, D.GETOFF), V), why: p.name + 'は違和感に耐えられず、降りる駅でもない駅で降りた（行動「' + p.action.label + '」）', mag: 16 });
      return;
    }
    if (rng() < 0.3) { p.m.doubt = clamp(p.m.doubt - 4, 0, 100); ST.say(S, { actors: [p], tag: '戸惑い', text: fm(pk(S, D.BACK), V), why: p.name + 'は引っかかりを、疲れのせいにした' }); }
  }

  /* ---------- 覚める ---------- */
  function wake(S, p, nx, pw, quiet) {
    var rng = S.rng, v = S.v, V = { a: p.name, nx: nx }, m = p.pax || newMob(S, p);
    p.state = 'awake'; p.cnt.wake++; p.wakeDay = S.day;
    p.m.imm = clamp(p.m.imm - 35, 0, 100); p.m.reason = clamp(p.m.reason + 15, 0, 100);
    var t = quiet ? '' : mobFmt(fm(pk(S, D.WAKE_TRIG), V), m) + '\n\n';
    t += fm(pk(S, D.WAKE_SEE), V) + '\n\n' + fm(pk(S, D.WAKE_PS[ps(p)]), V) + '\n\n' + mobFmt(fm(pk(S, D.WAKE_WORLD), V), m);
    var o = ST.say(S, { actors: [p], tag: '覚める', text: t, why: p.name + 'の常識が覚めた（覚めやすさ ' + Math.round(pw * 100) + '%：違和感 ' + Math.round(p.m.doubt) + '・理性 ' + Math.round(p.m.reason) + '・かかり具合 ' + Math.round(p.m.imm) + '・快楽 ' + Math.round(p.m.plea) + '）', mag: 32 });
    ST.key(S, o, p.name + 'が覚めた' + (p.cnt.wake > 1 ? '（' + p.cnt.wake + '度目）' : ''));
    branch(S, p, nx);
  }
  /* 覚めたあとの分岐（通報する・降りる・合意の上でスリル・言い出せない）。性格に合わない動きも残す */
  function branch(S, p, nx) {
    var rng = S.rng, v = S.v, t = p.tr, P0 = ps(p), c = companion(S, p);
    var canThrill = p.canMob && p.lib !== 'none';
    var w = {
      report: 0.25 + t.cp * 1.2 + t.a * 0.4 + p.m.reason / 250 + (/^(stern|polite|proud)$/.test(P0) ? 0.4 : 0) + (c ? 0.3 : 0) + (v.norm === 'loose' ? 0.25 : 0) - p.m.plea / 130 - t.ac * 0.3,
      off: 0.35 + t.caution * 0.8 + t.ac * 0.3 + (/^(shy|devoted|gentle)$/.test(P0) ? 0.35 : 0),
      thrill: canThrill ? 0.08 + t.fc * 0.9 + t.impulse * 0.5 + p.m.plea / 90 + (/^(free|proud)$/.test(P0) ? 0.35 : 0) : 0,
      silent: 0.15 + t.ac * 0.9 + (/^(shy|tsun|devoted)$/.test(P0) ? 0.45 : 0) + (1 - p.m.reason / 100) * 0.4
    };
    var ks = Object.keys(w), k = HK.weighted(rng, ks, function (x) { return Math.max(0.03, w[x]); });
    p.branch = k;
    var why = '（' + PS_JA[P0] + '・CP ' + Math.round(p.eg.CP) + '・FC ' + Math.round(p.eg.FC) + '・AC ' + Math.round(p.eg.AC) + '・快楽 ' + Math.round(p.m.plea) + (c ? '・連れがいる' : '') + '）';
    if (k === 'report') return report(S, p, nx, why);
    if (k === 'off') {
      p.offToday = true; p.cnt.off++;
      return ST.say(S, { actors: [p], tag: '途中下車', text: fm(pk(S, D.WAKE_OFF), { a: p.name, nx: nx }), why: p.name + 'は覚めて、次の駅で降りることを選んだ' + why, mag: 18 });
    }
    if (k === 'thrill') {
      p.cnt.thrill++;
      var tt = fm(pk(S, D.THRILL[P0]), { a: p.name }) + (c && !c.offToday && c.state !== 'norm' ? '\n\n' + fm(pk(S, D.THRILL_C), { a: p.name, c: c.name }) : '');
      return ST.say(S, { actors: c && tt.indexOf(c.name) >= 0 ? [p, c] : [p], tag: 'スリル', text: tt, why: p.name + 'は気づいたうえで、自分の意思で続けることを選んだ' + why, mag: 22 });
    }
    p.cnt.silent++;
    return ST.say(S, { actors: [p], tag: '言い出せない', text: fm(pk(S, D.SILENT), { a: p.name }) + (p.canMob && p.pax ? mobFmt(fm(pk(S, D.SILENT_BACK), { a: p.name }), p.pax) : ''), why: p.name + 'は気づいているのに、声が出なかった' + why, mag: 18 });
  }
  function companion(S, p) { if (S.mode !== 'same') return null; var o = S.P.filter(function (x) { return x !== p && !x.gone; })[0]; return o && !o.offToday ? o : null; }
  /* 通報する：常識の強さで結果が変わる */
  function report(S, p, nx, why) {
    var v = S.v, c = companion(S, p), duo = !!(c && c.state === 'awake' && !c.reported);
    var t = fm(pk(S, duo ? D.REPORT.duo : D.REPORT.staff), { a: p.name, c: c ? c.name : '' }) + '\n\n' + fm(pk(S, D.REPORT_RES[v.norm]), { a: p.name });
    p.cnt.report++; p.branch = 'report'; p.reportRes = v.norm; p.reported = true;
    if (v.norm === 'loose') p.offToday = true;
    if (v.norm === 'strict') { p.reportFlow = true; p.m.doubt = clamp(p.m.doubt + 5, 0, 100); }
    if (duo) { c.reported = true; c.cnt.report++; c.branch = 'report'; c.reportRes = v.norm; if (v.norm === 'loose') c.offToday = true; if (v.norm === 'strict') c.reportFlow = true; }
    var o = ST.say(S, { actors: duo ? [p, c] : [p], tag: '通報', text: t, why: p.name + 'は通報した' + (why || '') + '。常識の強さ「' + { loose: 'ゆるい', normal: 'ふつう', strict: '徹底' }[v.norm] + '」→' + { loose: '駅員が応じて、周りが散った', normal: '駅員が困った顔で間に入った', strict: '「マナーですよ」と流された' }[v.norm], mag: 26 });
    ST.key(S, o, p.name + 'が通報した');
  }

  /* ---------- 二人が同じ車両：見る・分け合う・気づかせる ---------- */
  function duoMoment(S, on, seg, nx) {
    var rng = S.rng, a = on[0], b = on[1];
    if (a.offToday || b.offToday) return;
    var aw = on.filter(function (p) { return p.state === 'awake' && p.branch !== 'thrill'; }), dn = on.filter(function (p) { return p.state !== 'awake'; });
    /* 一人だけ覚めて、連れに気づかせようとする */
    if (aw.length === 1 && dn.length === 1 && !aw[0].told) {
      var w = aw[0], o = dn[0], V = { a: w.name, c: o.name, nx: nx };
      w.told = S.day;
      var ok = rng() < clamp(0.15 + o.m.doubt / 120 + o.tr.a * 0.2 + o.m.reason / 400 - o.m.imm / 250 - o.m.plea / 300, 0.05, 0.85);
      var t = fm(pk(S, D.TELL), V) + '\n\n' + fm(pk(S, ok ? D.TELL_OK : D.TELL_NG), V);
      ST.say(S, { actors: [w, o], tag: '気づかせる', text: t, why: w.name + 'は一人だけ覚めて、' + o.name + 'に気づかせようとした→' + (ok ? '伝わった' : '伝わらなかった'), mag: 20 });
      if (ok) { o.m.doubt = clamp(o.m.doubt + 30, 0, 100); o.state = 'awake'; o.cnt.wake++; o.branch = w.branch === 'report' ? 'report' : 'off'; o.toldBy = w; bothOff(S, on, nx); }
      else { o.m.doubt = clamp(o.m.doubt + 8, 0, 100); w.triedDuo = true; }
      return;
    }
    /* 二人とも覚めた（同じ駅で）：手を取り合って降りる */
    if (aw.length === 2 && !S.bothOffDay) return bothOff(S, on, nx);
    /* 二人だけ違和感を分け合う */
    if (dn.length === 2 && a.m.doubt >= 25 && b.m.doubt >= 25 && !S.shared && rng() < 0.5) {
      S.shared = S.day;
      a.m.doubt += 12; b.m.doubt += 12;
      return ST.say(S, { actors: [a, b], tag: '分け合う', text: fm(pk(S, D.SHARE), { a: a.name, c: b.name }), why: '二人とも違和感を抱えていた（' + a.name + ' ' + Math.round(a.m.doubt) + '・' + b.name + ' ' + Math.round(b.m.doubt) + '）', mag: 18 });
    }
    /* 連れが乗客と触れ合うのを見る */
    var seer = rng.pick(on), other = seer === a ? b : a;
    if (other.pax && other.cnt.touch && seer.state !== 'awake' && rng() < 0.3 && !seer.sawToday) {
      seer.sawToday = S.day;
      seer.m.doubt = clamp(seer.m.doubt + 6 + seer.tr.jealous * 8, 0, 100);
      ST.say(S, { actors: [seer, other], tag: '見てしまう', text: fm(pk(S, D.SEE_C), { a: seer.name, c: other.name }), why: seer.name + 'の違和感が少し伸びた（嫉妬・執着 ' + Math.round(seer.tr.jealous * 100) + '）' });
    }
  }
  function bothOff(S, on, nx) {
    var a = on[0], b = on[1];
    S.bothOffDay = S.day; S.bothOff = true;
    a.offToday = b.offToday = true; a.cnt.off++; b.cnt.off++;
    a.duoOff = b.duoOff = true;
    if (a.branch === 'thrill') a.branch = 'off'; if (b.branch === 'thrill') b.branch = 'off';
    var o = ST.say(S, { actors: [a, b], tag: '二人で降りる', text: fm(pk(S, D.BOTH_OFF), { a: a.name, c: b.name, nx: nx }), why: '二人とも覚めて、' + nx + 'で降りた', mag: 28 });
    ST.key(S, o, a.name + 'と' + b.name + 'が二人で降りた');
    /* 体の関係になれる二人：覚めたまま、自分たちで選んで夜を過ごすこともある */
    if (S.pairOk && !S.wokeNight && S.lv !== 'low') {
      var pr = clamp({ lover: 0.6, fwb: 0.55, crush: 0.4, friend: 0.15, stranger: 0.08 }[S.rel] * Math.sqrt(a.libK * b.libK), 0, 0.85);
      if (S.rng() < pr) { S.wokeNight = true; wokeNight(S, a, b, pr); }
    }
  }
  function wokeNight(S, a, b, pr) {
    var ord = HK.Pos.order(a, b), T = ord[0], U = ord[1], mode = modeOf(T, U);
    lead(S, [T, U], fm(pk(S, X.LEAD_WOKE), { r: T.name, o: U.name }), '二人で覚めて降りたあと、自分たちで選んで（' + REL_JA[S.rel] + '・起きやすさ ' + Math.round(pr * 100) + '%）');
    var text = longScene(S, T, U, { car: false, open: fm(pk(S, X.OPEN_ROOM[mode]), { a: '{a}', b: '{b}' }), after: pk(S, X.AFTER_WOKE) });
    T.cnt.night++; U.cnt.night++; S.bonded = loveOk(S, T, U); S.nightPair = [T, U];
    var o = ST.say(S, { actors: [T, U], tag: '夜', lewd: true, text: text, why: '二人で覚めて降りたあとの夜（' + T.name + 'が攻め）', mag: 30 });
    ST.key(S, o, T.name + 'と' + U.name + 'が結ばれた');
  }
  /* 連れどうしが常識どおりに触れ合う */
  function pairTouch(S, on) {
    var ord = HK.Pos.order(on[0], on[1]), T = ord[0], U = ord[1], mode = modeOf(T, U);
    var t = fm(pk(S, X.PAIR_TOUCH[mode]), { a: T.name, b: U.name }) + hv(S, U, 0);
    [T, U].forEach(function (p) { p.m.plea = clamp(p.m.plea + 12 * p.sens * p.libK, 0, 100); p.pleaPk = Math.max(p.pleaPk, p.m.plea); p.cnt.touch++; p.cnt.pair++; p.m.reason = clamp(p.m.reason - 3, 0, 100); });
    ST.say(S, { actors: [T, U], tag: '連れと', lewd: true, text: t, why: '連れどうしで、常識どおりに（' + REL_JA[S.rel] + '・' + T.name + 'が攻め）' });
  }

  /* ---------- 山場：終点直前の満員車両 ---------- */
  function peak(S, on, nx) {
    var rng = S.rng, v = S.v, LN = v.LN;
    var ok = function (p) { return p.canMob && p.lib !== 'none' && (p.state !== 'awake' || p.branch === 'thrill') && p.m.plea >= { short: 28, mid: 36, term: 48 }[v.dist] + (v.crowd === 'sparse' ? 12 : 0); };
    /* 二人：連れどうしの山場 */
    if (on.length === 2 && S.mode === 'same' && !S.noDuo && S.pairOk && (S.pairPeak || 0) < 3 && on.every(function (p) { return (p.state !== 'awake' || p.branch === 'thrill') && p.m.plea >= 35; }) && (v.partner === 'pair' || rng() < (S.rel === 'lover' || S.rel === 'fwb' ? 0.55 : 0.25))) return pairPeak(S, on, nx);
    on.forEach(function (p) {
      if (p.state === 'awake' && p.branch !== 'thrill') return awakeRide(S, p, 1, nx);
      if (!ok(p)) {
        if (p.canMob && p.cnt.touch) ST.say(S, { actors: [p], tag: '終点へ', text: fm(pk(S, D.NOPEAK), { a: p.name, end: LN.end }), why: '終点前の山場には届かなかった（快楽 ' + Math.round(p.m.plea) + '）' });
        return;
      }
      if (p.cnt.peak >= 3) return shortPeak(S, p);
      soloPeak(S, p, nx);
    });
  }
  function soloPeak(S, p, nx) {
    var rng = S.rng, v = S.v, LN = v.LN, m = p.pax || newMob(S, p), V = { o: p.name, end: LN.end, nx: nx, d: S.day };
    var top = p.top, A = top ? p : m, B = top ? m : p, mode = modeOf(A, B);
    /* きっかけの段 */
    var lt = fm(pk(S, p.cnt.peak ? X.LEAD_AGAIN : X.LEAD_SIT), V) + '\n\n' + fm(pk(S, X.LEAD_HEAT), V);
    if (p.branch === 'thrill') lt += '\n\n' + fm(pk(S, D.THRILL[ps(p)]), { a: p.name });
    else if (p.m.doubt >= 40) lt += '\n\n' + fm(pk(S, X.LEAD_DOUBT), V);
    lt += '\n\n' + mobFmt(fm(pk(S, top ? X.LEAD_SELF : X.LEAD_MOB), top ? { r: p.name, o: '{m}' } : { r: '{m}', o: p.name }), m) + (top ? '' : fm(pk(S, X.LEAD_YES[ps(p)]), V));
    var why = (p.cnt.peak ? '二度目以降の終点前（' + S.day + '日目）' : '終点前のマナー') + '・快楽 ' + Math.round(p.m.plea) + (p.branch === 'thrill' ? '・覚めたうえで本人が選んだ' : '') + '・言い出したのは' + (top ? p.name : '乗客');
    lead(S, [p], lt, why);
    var text;
    if (S.lv === 'low') text = fm(pk(S, X.FADE), V);
    else if (p.cnt.peak >= 1 && !S.ero && X.MID && midOk(A, B, mode)) {
      /* 二度目・三度目（小説調）：車内だけで組んだ中くらいの場面 */
      var mb = B.mob ? (HK.Moan && HK.Moan.mob ? HK.Moan.mob(S, B, 2, { side: false, gross: false }) : '……っ') : (HK.Moan && HK.Moan.say ? HK.Moan.say(S, B, 'climax', { novel: true }, null) : '……っ');
      var an = A.mob ? A.short : A.name, bn = B.mob ? B.short : B.name;
      text = pk(S, X.MID[mode]).replace(/\{a\}/g, an).replace(/\{b\}/g, bn).replace('{mb}', mb || '……っ');
      text += '\n\n' + fm(pk(S, X.CROWD), V) + fm(pk(S, (top ? X.PEAK_A : X.PEAK_B)[ps(p)]), V);
    }
    else {
      text = longScene(S, A, B, { car: true, open: pk(S, X.OPEN[mode]), after: pk(S, X.SC_AFTER2).replace(/\{b\}/g, '{b}') });
      text = mobFmt(text, m);
      text += '\n\n' + fm(pk(S, X.CROWD), V) + (top ? '' : mv(S, m, 2)) + fm(pk(S, (top ? X.PEAK_A : X.PEAK_B)[ps(p)]), V);
    }
    /* 住人が乗客に話しかける台詞の「あなた」は、乗客への呼びかけの印にする（mob.js の HK.Mob.addr。ほかの住人の名前で呼ばないように） */
    if (HK.Mob && HK.Mob.addr) text = text.replace(/あなた/g, function () { return HK.Mob.addr(m); });
    p.cnt.peak++; p.peakToday = true;
    p.m.plea = 20; p.m.imm = clamp(p.m.imm + (p.branch === 'thrill' ? 0 : 8), 0, 98); p.m.reason = clamp(p.m.reason - 6, 0, 100);
    var o = ST.say(S, { actors: [p], tag: '山場', lewd: true, text: text, why: '終点直前の満員車両（' + m.name + (top ? 'に、' + p.name + 'から' : 'と') + '・' + { mf: '男性の体の攻め', ff: '女性どうし', fm: '女性の攻め×男性' }[mode] + '）', mag: 30 });
    if (p.cnt.peak === 1) ST.key(S, o, p.name + 'が終点前の満員車両で');
    afterPeak(S, p);
  }
  /* 4回目からの終点前：毎日の習慣として短く（場面は描かない） */
  function shortPeak(S, p) {
    p.cnt.peak++; p.peakToday = true; p.m.plea = 20; p.m.imm = clamp(p.m.imm + (p.branch === 'thrill' ? 0 : 6), 0, 98);
    ST.say(S, { actors: [p], tag: '終点前', text: fm(pk(S, D.PEAK_SHORT), { a: p.name, d: S.day, end: S.v.LN.end }), why: p.name + 'の終点前（' + p.cnt.peak + '回目。4回目からは短く）' });
  }
  /* 中くらいの場面の体の前提（mf＝攻めに男性器、fm＝攻めに女性器・受けに男性器、ff＝受けに女性器。性器なしの人がいれば長い場面に任せる） */
  function midOk(a, b, mode) {
    var Q = HK.Pos;
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)) return false;
    if (!Q || !Q.hasM) return true;
    return mode === 'mf' ? Q.hasM(a) : mode === 'fm' ? Q.hasF(a) && Q.hasM(b) : Q.hasF(b);
  }
  function afterPeak(S, p) { /* 山場のあと：覚めかけの人は違和感が少し戻る */ if (p.state === 'doubt') p.m.doubt = clamp(p.m.doubt + 4, 0, 100); }
  function pairPeak(S, on, nx) {
    var v = S.v, LN = v.LN, ord = HK.Pos.order(on[0], on[1]), T = ord[0], U = ord[1], mode = modeOf(T, U), V = { o: U.name, end: LN.end, nx: nx, d: S.day };
    var lt = fm(pk(S, X.LEAD_SIT), V) + '\n\n' + fm(pk(S, X.LEAD_PAIR), V) + '\n\n' + fm(pk(S, X.LEAD_PAIR_WHO), { r: T.name, o: U.name });
    if (on.some(function (p) { return p.branch === 'thrill'; })) lt += '\n\n' + fm(pk(S, D.THRILL_C), { a: T.name, c: U.name });
    lead(S, [T, U], lt, '終点前のマナー（連れどうし・' + REL_JA[S.rel] + '）・言い出したのは' + T.name);
    var text = S.lv === 'low' ? fm(pk(S, X.FADE), V) : longScene(S, T, U, { car: true, open: pk(S, X.OPEN[mode]), after: pk(S, X.SC_AFTER2) }) + '\n\n' + fm(pk(S, X.PEAK_B[ps(U)]), V);
    [T, U].forEach(function (p) { p.cnt.peak++; p.peakToday = true; p.m.plea = 20; p.m.reason = clamp(p.m.reason - 5, 0, 100); });
    S.pairPeak = (S.pairPeak || 0) + 1; S.bonded = S.bonded || loveOk(S, T, U);
    var o = ST.say(S, { actors: [T, U], tag: '山場', lewd: true, text: text, why: '終点直前の満員車両で、連れどうし（' + T.name + 'が攻め・' + { mf: '男性の体の攻め', ff: '女性どうし', fm: '女性の攻め×男性' }[mode] + '）', mag: 30 });
    if (S.pairPeak === 1) ST.key(S, o, T.name + 'と' + U.name + 'が満員車両で');
  }

  /* ---------- 二人（rescue）：攻めの人が途中の駅で乗ってきて、連れを引き寄せる ---------- */
  function rescue(S, nx) {
    var rng = S.rng, T = S.T, R = S.R, V = { a: R.name, t: T.name, nx: nx };
    var kind = T.lib === 'high' ? 'high' : (T.lib === 'low' || T.lib === 'none') ? 'low' : T.tr.jealous > 0.6 ? 'jeal' : 'calm';
    var touched = R.cnt.touch > 0 && R.canMob && !(R.state === 'awake' && R.branch !== 'thrill');
    var t = fm(pk(S, D.BOARD_T), V) + '\n\n' + (touched ? fm(pk(S, D.T_SEE), V) + fm(pk(S, D.T_REACT[kind]), V) : fm('{a}は扉の脇で、ひとり吊り革を握っていた。{t}は人の隙間を縫って、{a}のそばへ行った。', V)) + '\n\n' + fm(pk(S, D.T_PULL), V) + fm(pk(S, D.T_OFF), V);
    T.cnt.rides++; R.offToday = true; T.cnt.pick = (T.cnt.pick || 0) + 1;
    /* 引き寄せた側の違和感：マナーなのに、なぜ嫌だったのか */
    T.m.doubt = clamp(T.m.doubt + (6 + T.tr.a * 10 + (kind === 'jeal' ? 8 : 0)) * (2 - T.willK), 0, 100);
    var o = ST.say(S, { actors: [T, R], tag: '迎え', text: t, why: T.name + 'は攻めの指定なので、触れ合われる側にはならない。途中の' + nx + 'で乗ってきて、' + R.name + 'を「連れ」として引き寄せた（' + { high: '性欲が強い', low: '性欲が弱い', jeal: '嫉妬しやすい', calm: '落ち着いている' }[kind] + '）', mag: 24 });
    if (!S.firstPick) { S.firstPick = true; ST.key(S, o, T.name + 'が' + R.name + 'を引き寄せた'); }
    /* 火照った体の連れとエッチするか：関係・攻めの性欲・嫉妬・連れの快楽で */
    var ok = S.pairOk && HK.Pos.order(T, R)[0] === T && R.m.plea >= 25;
    var pr = ok ? clamp({ lover: 0.7, fwb: 0.7, crush: 0.42, friend: 0.2, stranger: 0.1 }[S.rel] * T.libK * (kind === 'jeal' ? 1.25 : 1) * (0.6 + R.m.plea / 100) * (R.state === 'awake' && R.branch !== 'thrill' ? 0.4 : 1) * (S.lv === 'low' ? 0.7 : 1), 0, 0.92) : 0;
    if (ok && rng() < pr) rescueNight(S, T, R, kind, pr);
    else {
      var cl = kind === 'low' || kind === 'calm' ? (rng() < 0.5 ? D.T_CALM : D.T_HOME) : rng() < 0.55 ? D.T_LATER : D.T_HOME;
      ST.say(S, { actors: [T, R], tag: '引き寄せたあと', text: fm(pk(S, cl), V), why: ok ? '今日は夜にはしなかった（' + REL_JA[S.rel] + '・起きやすさ ' + Math.round(pr * 100) + '%）' : '体の関係にならない二人' + (S.pairOk ? '（連れの火照りが小さい）' : '（恋愛対象・受け攻め・関係の設定）') });
      R.m.plea = clamp(R.m.plea * 0.5, 0, 100);
    }
    if (T.m.doubt >= 30 && !T.dSaid) { T.dSaid = true; ST.say(S, { actors: [T], tag: '違和感', text: fm(pk(S, D.T_DOUBT), V), why: T.name + 'の違和感 ' + Math.round(T.m.doubt) }); }
    /* 引き寄せた側が覚める（マナーなのに、なぜ嫌だったのか） */
    if (T.state !== 'awake' && T.m.doubt >= 55 && rng() < clamp((T.m.doubt + T.m.reason * 0.3 - T.m.imm * 0.5) / 100, 0.05, 0.9)) {
      T.state = 'awake'; T.cnt.wake++; T.branch = 'pick';
      var o2 = ST.say(S, { actors: [T], tag: '覚める', text: fm(pk(S, D.WAKE_SEE), { a: T.name }) + '\n\n' + fm(pk(S, D.WAKE_PS[ps(T)]), { a: T.name }), why: T.name + 'は連れを引き寄せた理由に気づいて、覚めた', mag: 26 });
      ST.key(S, o2, T.name + 'が覚めた');
    }
    /* 覚めた側から、連れに伝える */
    if (T.state === 'awake' && R.state !== 'awake' && !T.toldR) {
      T.toldR = true;
      var okT = rng() < clamp(0.2 + R.m.doubt / 110 + R.tr.a * 0.2 - R.m.imm / 250 - R.m.plea / 300, 0.05, 0.85);
      ST.say(S, { actors: [T, R], tag: '気づかせる', text: fm(pk(S, D.TELL), { a: T.name, c: R.name }) + '\n\n' + fm(pk(S, okT ? D.TELL_OK : D.TELL_NG), { a: T.name, c: R.name }), why: T.name + 'は' + R.name + 'に気づかせようとした→' + (okT ? '伝わった' : '伝わらなかった'), mag: 20 });
      if (okT) { R.state = 'awake'; R.cnt.wake++; R.branch = 'off'; R.toldBy = T; }
    }
  }
  function rescueNight(S, T, R, kind, pr) {
    var mode = modeOf(T, R), rel = S.rel, V = { r: T.name, o: R.name };
    lead(S, [T, R], fm(pk(S, X.LEAD_RESCUE[rel]), V) + (X.LEAD_RESCUE_T[kind] && X.LEAD_RESCUE_T[kind].length && X.LEAD_RESCUE_T[kind][0] ? fm(pk(S, X.LEAD_RESCUE_T[kind]), V) : ''), '車内で火照った体のまま、' + T.name + 'に引き寄せられて降りた（' + REL_JA[rel] + '・' + { high: '攻めの性欲が強い', low: '攻めの性欲が弱い', jeal: 'ほかの乗客に触れられたのを気にした', calm: '攻めは落ち着いていた' }[kind] + '・起きやすさ ' + Math.round(pr * 100) + '%）');
    var text = S.lv === 'low' ? fm('その夜、{r}と{o}は灯りを落とした部屋で、車内の熱の続きを分け合った。翌朝、{o}の首筋には、{r}の残した小さな跡があった。', V) : longScene(S, T, R, { car: false, open: pk(S, X.OPEN_ROOM[mode]), after: pk(S, X.AFTER_RESCUE[rel]) });
    T.cnt.night++; R.cnt.night++; R.m.plea = 15; S.rescueNight = (S.rescueNight || 0) + 1;
    if (loveOk(S, T, R)) S.bonded = true;
    var o = ST.say(S, { actors: [T, R], tag: '夜', lewd: true, text: text, why: T.name + 'が攻め（攻めの指定）・' + R.name + 'は車内の熱のまま', mag: 30 });
    if (S.rescueNight === 1) ST.key(S, o, T.name + 'と' + R.name + 'の夜');
  }

  /* ---------- 結末 ---------- */
  var FATE_JA = { sink: '常識に馴染んだ', resunk: '一度覚めて、また常識に戻った', unease: '違和感を抱えたまま', between: '気づいたまま乗り続ける', switch: '別の路線に変えた', report: '通報した', reportFlow: '通報して、流された', thrill: '気づいたうえでスリルを選んだ', silent: '言い出せないまま', offday: '途中で降りた', pick: '連れを迎えに行く人' };
  function fateOf(S, p) {
    if (p.switched) return 'switch';
    if (S.mode === 'rescue' && p === S.T && p.state !== 'awake') return 'pick';
    if (p.state === 'awake') {
      if (p.branch === 'report') return p.reportFlow ? 'reportFlow' : 'report';
      if (p.branch === 'thrill') return 'thrill';
      if (p.branch === 'silent') return 'silent';
      if (p.branch === 'off' && p.cnt.off && S.day <= (p.wakeDay || 0)) return 'offday';
      return 'between';
    }
    if (p.cnt.resink) return 'resunk';
    if (p.m.doubt >= 40) return 'unease';
    return 'sink';
  }
  function finish(S, input) {
    var P = S.P, v = S.v, LN = v.LN;
    P.forEach(function (p) {
      p.fk = fateOf(S, p); p.fate = FATE_JA[p.fk];
      p.notes.push('乗った日 ' + p.cnt.rides + '日・触れ合い ' + p.cnt.touch + '回・終点前の山場 ' + p.cnt.peak + '回' + (p.cnt.night ? '・二人の夜 ' + p.cnt.night + '回' : ''));
      p.notes.push('違和感 ' + Math.round(p.m.doubt) + '／かかり具合 ' + Math.round(p.m.imm) + (p.cnt.wake ? '・覚めた ' + p.cnt.wake + '回' : '') + (p.cnt.resink ? '・かかり直し ' + p.cnt.resink + '回' : '') + (p.cnt.report ? '・通報 ' + p.cnt.report + '回' : ''));
      p.notes.push('行動「' + p.action.label + '」・乗る理由「' + p.goal.label + '」・' + (p.top ? '乗客には自分からする側' : '乗客には受け入れる側'));
    });
    var duo = P.length === 2, a = P[0], b = P[1], title, lines = [];
    ST.step(S, 'その後');
    P.forEach(function (p) {
      var pool = D.FATE[p.fk] || D.FATE.sink;
      if (p.fk === 'pick') pool = D.FATE2.picker;
      var t = fm(pk(S, pool), { a: p.name, c: duo ? (p === a ? b.name : a.name) : '' });
      if (p.fk === 'switch') t = fm(pk(S, D.GONE), { a: p.name });
      ST.say(S, { actors: [p], tag: 'その後', text: t, why: p.name + 'の結末：' + p.fate });
      lines.push(p.name + '（' + p.roleLabel + '）：' + p.fate);
    });
    if (duo) {
      var away = P.some(function (p) { return p.gone; });
      var k2 = S.bonded && !away ? 'bond' : S.bothOff ? 'bothOff' : P.some(function (p) { return p.triedDuo; }) ? 'tried' : '';
      if (S.mode === 'rescue' && S.rescueNight && S.bonded && !away) k2 = 'bond';
      if (k2) {
        var w = k2 === 'tried' ? P.filter(function (p) { return p.triedDuo; })[0] : a, c = w === a ? b : a;
        ST.say(S, { actors: [a, b], tag: 'ふたり', text: fm(pk(S, D.FATE2[k2]), { a: w.name, c: c.name }), why: { bond: '連れと結ばれた', bothOff: '二人で気づいて降りた', tried: '一人だけ覚めて、連れに気づかせようとした' }[k2] });
        lines.push({ bond: a.name + 'と' + b.name + '：連れと結ばれた', bothOff: a.name + 'と' + b.name + '：二人で気づいて降りた', tried: w.name + '：一人だけ覚めて、' + c.name + 'に気づかせようとした' }[k2]);
      }
      if (!S.pairOk && (S.mode === 'rescue' || v.partner === 'pair')) {
        var dd = HK.Pos && HK.Pos.noSexInfo ? HK.Pos.noSexInfo(a, b, { room: false, lib: true, ties: input.ties }) : null;
        lines.push(a.name + 'と' + b.name + 'は体の関係にならない組（' + (dd ? dd.t + (dd.fix ? '。直し方：' + dd.fix : '') : '恋愛対象・受け攻め・関係の設定') + '）。');
      }
    }
    var woke = P.filter(function (p) { return p.state === 'awake'; }), sank = P.filter(function (p) { return /^(sink|resunk)$/.test(p.fk); });
    if (duo && S.bonded) title = a.name + 'と' + b.name + 'は、満員電車の常識の中で結ばれた。';
    else if (duo && S.bothOff) title = a.name + 'と' + b.name + 'は、二人で気づいて電車を降りた。';
    else if (woke.length === P.length) title = names(woke) + (P.length > 1 ? 'は二人とも' : 'は') + '、違和感に気づいて覚めた。';
    else if (woke.length) title = names(woke) + 'だけが覚めた。' + names(P.filter(function (p) { return woke.indexOf(p) < 0; })) + 'は、今日も同じ車両に乗っている。';
    else if (sank.length === P.length) title = '「' + LN.name + '」は今日も満員。' + names(P) + 'は、流され続けた。';
    else title = '「' + LN.name + '」は今日も満員。' + names(P) + 'は、違和感の手前で揺れている。';
    var kind = woke.length ? 'ok' : 'over';
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [p.roleLabel, p.cnt.rides + '日', String(p.cnt.peak + p.cnt.night), String(Math.round(p.m.doubt)), String(Math.round(p.m.imm)), p.fate] }; });
    /* 関係図（2人のとき）：設定の関係と、この箱庭で結ばれた・体を重ねた二人（★） */
    var relmap = null;
    if (duo) {
      var edges = (S.ties || []).map(function (t0) { return { a: t0.a, b: t0.b, label: HK.tieLabel ? HK.tieLabel(t0) : (HK.TIES[t0.type] || {}).label || t0.type, cls: /^(lover|mate|fated)$/.test(t0.type) ? 'love' : t0.type === 'fwb' ? 'night' : 'friend', dir: null }; });
      if (S.bonded) edges.push({ a: a.i, b: b.i, label: '★結ばれた', cls: 'love', dir: null });
      else if (S.rescueNight || S.pairPeak || S.wokeNight) edges.push({ a: a.i, b: b.i, label: '★体を重ねた', cls: 'night', dir: null });
      relmap = { nodes: P.map(function (p) { return { i: p.i, name: p.name, sub: p.fate }; }), edges: edges, note: '★はこの箱庭で生まれた関係。' };
    }
    var res = ST.result(S, input, {
      relmap: relmap,
      ending: { title: title, kind: kind, lines: lines },
      estats: [['路線', LN.label], ['混み具合', { sparse: '空いている', busy: '混んでいる', packed: '満員' }[v.crowd]], ['常識の強さ', { loose: 'ゆるい', normal: 'ふつう', strict: '徹底' }[v.norm]], ['乗った日数', v.days + '日'], ['覚めた人', woke.length + '人']],
      table: { title: '住人ごとの比較', hint: '山場は終点前の満員車両と二人の夜の回数。かかり具合は常識（催眠のようなもの）の効き方。', cols: ['立場', '乗った日', '山場', '違和感', 'かかり具合', '結末'], rows: rows },
      meters: [{ label: 'かかり具合', color: '--accent' }, { label: '違和感', color: '--warn' }, { label: '快楽', color: '--pine', dash: true }, { label: '理性', color: '--love' }],
      meta: LN.name + '・' + v.days + '日' + (S.mode === 'rescue' ? '・' + S.T.name + 'が途中から乗る' : S.mode === 'same' ? '・同じ車両' : ''),
      summary: '常識改変：電車：' + P.map(function (p) { return p.name + '=' + p.fate; }).join('、')
    });
    return res;
  }
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
})();
