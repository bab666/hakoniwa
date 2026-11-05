/* @event-ok 乗車・後味・覚めたままの朝の文を増やし、覚めたまま続ける人の後味と朝を分けた（2026-11-05 担当R2。新しい出来事ではない） */
/* @event-ok 戸惑いの二段目（打ち消せない）の段を足した（2026-11-05 担当TF） */
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
/* @event scen=train id=tr_argue cat=conflict tie=- label=覚めた連れとの押し問答（この電車はおかしいか） */
/* @event scen=train id=tr_link_off cat=bond tie=- label=連れが降りるなら一緒に降りる・路線も一緒に変える */
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
/* @event-ok 路線を変えたあとの残りの日のまとめ（その後の日々）・連れが先に降りたあとの段（見送る）・リバの触りながら触られる段（既にある出来事の分岐を足した） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, D = HK.TRAIN, clamp = HK.clamp;
  if (!ST || !D || HK.SAFE_ON) return;
  var X = D.X || {};
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(p) { return PS.indexOf(p && p.persona) >= 0 ? p.persona : 'gentle'; }
  /* 同じ結果の中で同じ文を繰り返さない：まだ使っていない文（いちばん前に使った文）から選ぶ */
  var DAY1_RE = /昨日|ゆうべ|昨夜|その前の日|前の晩/, DAY2_RE = /その前の日/;
  function pk(S, arr) {
    if (!arr || !arr.length) return '';
    var m = S._pkLru = S._pkLru || { n: 0, at: {} }, best = [], bv = Infinity;
    /* 台詞（「…」）を含む文は、使ったものを後回しにする（同じ遊びで同じ台詞を二度出さない。残りが無ければ今までどおり） */
    var nq = arr.filter(function (x) { return !(m.at['$' + x] && String(x).indexOf('「') >= 0); });
    if (nq.length && nq.length < arr.length) arr = nq;
    /* 日数で文を選ぶ（報告 3）：1 日目に「昨日」「ゆうべ」、2 日目までに「その前の日」を書かない（残りが無ければ今までどおり） */
    if (S.day === 1 || S.day === 2) { var dre = S.day === 1 ? DAY1_RE : DAY2_RE, dl = arr.filter(function (x) { return !(typeof x === 'string' && dre.test(x)); }); if (dl.length && dl.length < arr.length) arr = dl; }
    for (var i = 0; i < arr.length; i++) { var a = m.at['$' + arr[i]] || 0; if (a < bv) { bv = a; best = [arr[i]]; } else if (a === bv) best.push(arr[i]); }
    var x = best[S.rng.int(best.length)];
    m.at['$' + x] = ++m.n;
    return x;
  }

  /* ---------- 記録に出す前の直し（遊んで確かめた報告 1104。設計は train-design.md の 14 章。「今朝」は 2026-11-05：終電の結末の行に「今朝も」） ----------
     ・路線と時間に合わない言い回し（終電・帰宅ラッシュ・夜行の「毎朝」「通勤電車」「今朝の」など）を、その路線の言い方にする
     ・体の語の印が「膨らみ」になったときの語の二重（「膨らみの膨らみ」）を一つにする */
  var LINE_W = {
    morning: [[/今夜/g, '今日']],
    evening: [[/毎朝/g, '毎夕'], [/翌朝/g, '次の日'], [/今朝の/g, '今日の'], [/今朝/g, '今日'], [/朝の挨拶/g, '挨拶'], [/朝の決まり/g, '帰り道の決まり'], [/通勤電車/g, '帰りの電車'], [/朝の空気は冷たかった/g, '夕方の風は冷たかった'], [/(\d+)日目の朝/g, '$1日目の夕方'], [/覚めた朝/g, '覚めた日'], [/迎えに来てくれた朝/g, '迎えに来てくれた日'], [/信じてもらえない朝/g, '信じてもらえない一日'], [/一日の始まり/g, '一日の終わり'], [/明日の朝も/g, '明日の夕方も'], [/少し早起きして/g, '少し早く仕事を切り上げて']],
    last: [[/毎朝/g, '毎晩'], [/翌朝/g, '次の日'], [/今朝の/g, '今夜の'], [/今朝/g, '今夜'], [/朝の挨拶/g, '挨拶'], [/朝の決まり/g, '夜の決まり'], [/通勤電車/g, '終電'], [/朝の空気は冷たかった/g, '夜風は冷たかった'], [/(\d+)日目の朝/g, '$1日目の夜'], [/覚めた朝/g, '覚めた夜'], [/迎えに来てくれた朝/g, '迎えに来てくれた夜'], [/信じてもらえない朝/g, '信じてもらえない夜'], [/一日の始まり/g, '一日の終わり'], [/明日の朝も/g, '明日の夜も'], [/少し早起きして/g, '少し早く仕事を切り上げて'], [/明日も同じ車両に乗ろう/g, '明日の晩も同じ電車にしよう']],
    night: [[/毎朝/g, '毎晩'], [/翌朝/g, '次の日'], [/今朝の/g, '今夜の'], [/今朝/g, '今夜'], [/朝の挨拶/g, '挨拶'], [/朝の決まり/g, '旅の決まり'], [/通勤電車/g, '夜行'], [/朝の空気は冷たかった/g, '夜明けの空気は冷たかった'], [/(\d+)日目の朝/g, '$1日目の夜'], [/覚めた朝/g, '覚めた夜明け'], [/迎えに来てくれた朝/g, '迎えに来てくれた夜'], [/信じてもらえない朝/g, '信じてもらえない夜'], [/一日の始まり/g, '旅の夜の始まり'], [/明日の朝も/g, '次の旅も'], [/少し早起きして/g, '次の旅から'], [/明日も同じ車両に乗ろう/g, '次の旅も同じ寝台にしよう'], [/空いている各駅停車/g, '空いている昼の特急']]
  };
  function fixT(S, t) {
    if (typeof t !== 'string' || !t) return t;
    t = t.replace(/膨らみの膨らみ/g, '膨らみ');
    /* 眼鏡の設定のない人にも出る仕草（本体の play-act-r18.js）を、眼鏡のない言い方に（報告 8） */
    t = t.replace(/眼鏡を押し上げるような仕草で/g, '手の甲で');
    var w = S && S.v && LINE_W[S.v.line];
    if (w) w.forEach(function (x) { t = t.replace(x[0], x[1]); });
    return t;
  }
  function say(S, o) {
    if (o && typeof o.text === 'string') o.text = fixT(S, o.text);
    /* 記録した段の数（戸惑いが続けて並んだかを見る。申し送り T11） */
    S._sayN = (S._sayN || 0) + 1;
    /* 連れと一緒に出た日（乗車の文を除く）を覚えておく（毎日の一幕 compBeat） */
    if (o && S.P && S.P.length === 2 && o.actors && o.actors.length >= 2 && o.tag !== '乗車' && S.day) (S._comp = S._comp || {})[S.day] = 1;
    return ST.say(S, o);
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
    /* 住人ごとの「触れ合い」（不具合リスト 1104 の NO 17）：おまかせ／触る／触られる／両方／迎えに行く。
       受け攻めと合わない選び方は動かすときに直す（受け指定の人の「触る」「両方」→触られる、攻め指定の人の「触られる」「両方」→触る）。
       「迎えに行く」は2人のときだけ（1人ならおまかせ）。片方が迎えに行くのに場の設定「触れ合う相手」が「連れの住人」なら、始める前に止める（scen.check）。
       offWhen は何も止めない（欄を変えたら箱庭タブを描き直して、参加者の欄の下の注意を出し直すため。ui.js） */
    perFields: [
      { id: 'touch', label: '触れ合い', auto: 'おまかせ（受け攻めから）', offWhen: function () { return ''; }, options: [{ id: 'give', label: '触る（攻めのとき）' }, { id: 'take', label: '触られる' }, { id: 'both', label: '両方（リバ・おまかせのとき）' }, { id: 'pick', label: '迎えに行く（2人のとき）' }] }
    ],
    check: function (input) { var w = touchConflict((input.chars || []).length, (input.perChar || []).map(function (x) { return x && x.pick ? x.pick.touch : ''; }), input.env && input.env.partner, input.chars || []); return w; },
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
  /* 始める前に止める組み合わせ（scen.check と参加者の欄の下の注意で同じ判定） */
  function touchConflict(n, picks, partner, chars) {
    var np = picks.filter(function (x) { return x === 'pick'; }).length;
    /* 攻め二人（2026-11-05 の利用者の指示）：二人とも乗客に「触る側」になる組（受け攻めの指定・モブ相手の受け攻め・住人ごとの「触れ合い」を直したあと）は始めない */
    if (n === 2 && chars && chars.length === 2 && chars.every(function (c, i) { return effTop(c, picks[i], n, chars[1 - i]); })) return 'この電車には攻めしか乗っていません。二人とも乗客に触る側（攻め）なので、触られる側がいません。どちらかの受け攻めを「受け」「リバ」にするか、住人ごとの「触れ合い」を「触られる」「両方」にしてください';
    if (n === 2 && np === 2) return '「迎えに行く」は2人のうち1人だけにしてください（住人ごとの「触れ合い」）';
    if (n === 2 && np === 1 && partner === 'pair') return '片方が「迎えに行く」ときは、二人は同じ車両に乗らないので、場の設定「触れ合う相手」を「連れの住人」以外にしてください（住人どうしで触れ合うなら、住人ごとの「触れ合い」の「迎えに行く」を外してください）';
    return '';
  }
  /* 乗客に触る側（攻め）として動く人か：「触れ合い」を直したあとが「触る」、またはおまかせ・迎えに行くで受け攻めの指定が攻め（モブ相手の受け攻めがあればそれ。相手ごとの指定で連れに攻めでも同じ） */
  function effTop(c, v, n, other) {
    var Q = HK.Pos; if (!Q) return false;
    var f = touchFix(c, v, n), tv = f ? (f === 'auto' ? '' : f) : (v && v !== 'auto' ? v : '');
    if (tv === 'give') return true;
    if (tv === 'take' || tv === 'both') return false;
    var npc = Q.npc ? Q.npc(c) : '';
    if (npc) return npc === 'top';
    return !!((Q.hardTop && Q.hardTop(c)) || (Q.hardTop && other && Q.hardTop(c, other) && Q.forOf && Q.forOf(c, other)));
  }
  /* 受け攻めと合わない選び方を、動かすときにどう直すか（'' は直さない） */
  function touchFix(c, v, n) {
    if (!v || v === 'auto') return '';
    var Q = HK.Pos, top = !!(Q && Q.hardTopNpc && Q.hardTopNpc(c)), bot = !!(Q && Q.vsNpc && Q.vsNpc(c, '') === 'bottom');
    if (v === 'pick') return n === 2 ? '' : 'auto';
    if (top && (v === 'take' || v === 'both')) return 'give';
    if (bot && (v === 'give' || v === 'both')) return 'take';
    return '';
  }
  var FIX_JA = { give: '触る', take: '触られる', auto: 'おまかせ' };
  /* 箱庭タブの参加者の欄の下の案内と注意（ui.js の HK.ScenUI。S は画面の状態） */
  function uiNote(S0, env, head) {
    var id = 'train', list = S0.join && S0.join[id], chars = S0.chars || [];
    var J = list ? chars.filter(function (c) { return list.indexOf(c.id) >= 0; }) : chars.slice(0, 2);
    J = J.slice(0, 2);
    var picks = J.map(function (c) { var p = S0.per && S0.per[c.id] && S0.per[c.id][id]; return p && p.pick ? p.pick.touch || '' : ''; });
    var partner = env ? env.partner : (S0.env && S0.env[id] || {}).partner;
    var h = '<p class="hint" style="margin-top:8px">住人ごとの「触れ合い」で、触る・触られる・両方・迎えに行く（2人のとき、途中の駅で乗ってきて連れを引き寄せる役）を選べます。おまかせなら受け攻めから決まり、2人で片方だけが「攻め」なら、その人が迎えに行く役になります（場の設定「触れ合う相手」が「連れの住人」のときは同じ車両に乗ります）。</p>';
    var stop = touchConflict(J.length, picks, partner, J), fixes = [];
    J.forEach(function (c, i) { var f = touchFix(c, picks[i], J.length); if (f) fixes.push(c.name + 'の「' + { give: '触る', take: '触られる', both: '両方', pick: '迎えに行く' }[picks[i]] + '」は、' + (picks[i] === 'pick' ? '1人のときは使えないので' : '受け攻めの設定に合わないので') + '「' + FIX_JA[f] + '」として動きます'); });
    var al = stop ? '<p class="hint" role="alert" style="margin-top:6px;color:var(--warn,#b45309);font-weight:600">※このままでは始められません：' + stop + '</p>' : '';
    if (head) return '<div id="trnote2">' + al + '</div>';
    h += al;
    if (fixes.length) h += '<p class="hint" style="margin-top:6px;color:var(--warn,#b45309)">注意：' + fixes.join('。') + '。</p>';
    return '<div id="trnote">' + h + '</div>';
  }
  if (HK.ScenUI && HK.ScenUI.add) HK.ScenUI.add('train', {
    joinNote: function (S0) { return uiNote(S0, null); },
    /* 「場の設定」の頭にも、始められない理由だけを出す（触れ合う相手を変えたその場で分かるように） */
    envHead: function (S0, env) { return uiNote(S0, env, true); },
    envChange: function (S0, env) { var el = document.getElementById('trnote'), e2 = document.getElementById('trnote2'); if (el) el.outerHTML = uiNote(S0, env); if (e2) e2.outerHTML = uiNote(S0, env, true); }
  });

  /* ---------- 便利 ---------- */
  function rv(S, k, list) { var v = S.env[k]; return v && v !== 'random' && list.indexOf(v) >= 0 ? v : S.rng.pick(list); }
  function fm(t, v) { return ST.fmt(t, v); }
  /* 乗客の呼び名：最初の {m} は見た目の長い呼び名、あとは短い呼び名 */
  function mobFmt(t, m) {
    if (!m) return t;
    var n = m.seen ? 1 : 0;
    var r = t.replace(/\{m\}/g, function () { return n++ ? m.short || m.name : m.name; });   /* 最初は「スーツ姿の疲れた中年の男」、あとは「中年の男」 */
    if (n) m.seen = true;
    return r;
  }
  function mobGen(S, p) {
    var sl = HK.Pos && HK.Pos.sexLikeOf ? HK.Pos.sexLikeOf(p) : '', lk = sl === 'm' || sl === 'f' ? sl : p.likes;
    if (lk === 'm' || lk === 'f') return lk;
    return S.rng() < 0.5 ? 'm' : 'f';
  }
  /* 乗客は名前を出さず、見た目・雰囲気で呼ぶ（不具合リスト 1104 の NO 12）。表は solo-train-data.js の D.MOB（「最初の呼び名,あとの呼び名,態度」）。
     同じ回では、まだ出ていない見た目から選ぶ。態度（persona）は見た目の表に合わせる */
  /* soft：まだ出ていない乗客が残っていなければ null（同じ回に同じ乗客を二度出さない。「複数の乗客」の入れ替わりは、毎日一人ぶんを残して止める） */
  function newMob(S, p, soft) {
    var g = mobGen(S, p), all = (D.MOB && D.MOB[g]) || [], used = S._mobUsed = S._mobUsed || {};
    /* 朝の上りには、仕事帰り・酒の入った乗客を乗せない（路線と時間に合わせる。報告 4） */
    if (S.v && S.v.line === 'morning') all = keep(all, function (x) { return !/仕事帰り|赤ら顔/.test(x); });
    var free = all.filter(function (x) { return !used[x]; });
    if (soft && free.length <= Math.max(0, (S.v ? S.v.days : 1) - S.day) * (S.P ? S.P.length : 1)) return null;
    var row = (free.length ? free : all)[S.rng.int(Math.max(1, (free.length ? free : all).length))] || '乗客,乗客,gentle';
    if (!free.length) S._mobReuse = (S._mobReuse || 0) + 1;
    used[row] = 1;
    var f = row.split(','), m = HK.Mob.make(S, { gender: g, name: f[0] });
    m.short = f[1] || f[0]; m.label = f[0];
    m.mobRole = 'street'; m.persona = /^(gentle|polite|cool|free)$/.test(f[2]) ? f[2] : 'gentle';
    /* 乗客ごとの性格と文（solo-train-mob.js の D.MOBP：触れ方・台詞・確かめる一言・終わり方・受け方） */
    m.prof = (D.MOBP && D.MOBP[f[0]]) || null;
    /* 乗客の性格（D.MOBP の k）を本体の態度 9 種にそろえる（solo-train-mob.js の D.MOB_PS）：山場の前から山場まで、本体の部品が選ぶ乗客の台詞・喘ぎも同じ態度で */
    var mps = m.prof && D.MOB_PS && D.MOB_PS[m.prof.k];
    if (mps && HK.PERSONA && HK.PERSONA[mps]) { m.persona = mps; m.tone = mps; m.night = mps; }
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'mob', d: S.day, who: p.i, mob: f[0] });
    return m;
  }
  /* 同じ遊びで同じ台詞を二度出さない：台詞（「…」）を含む文は一度だけ。list に残りが無ければ fb（台詞のない文など）から */
  function fresh(S, list, fb) {
    var u = S._qUsed = S._qUsed || {};
    var ok = function (x) { return x && !(x.indexOf('「') >= 0 && u[x]); };
    var l = (list || []).filter(ok);
    if (!l.length && fb) l = fb.filter(ok);
    if (!l.length) l = (list || []).concat(fb || []).filter(function (x) { return x && x.indexOf('「') < 0; });
    if (!l.length) return '';
    var x = pk(S, l);
    if (x.indexOf('「') >= 0) u[x] = 1;
    return x;
  }
  function prof(m, k) { return (m && m.prof && m.prof[k]) || [];
  }
  /* 乗客の台詞（D.MOBP の s）：その乗客が二度目に口を開くときは、挨拶・名乗りの台詞を使わない（申し送り T10） */
  function saysOf(m) { var l = prof(m, 's'); if (!m || !m.spoke || !D.OPEN_SAY_RE) return l; return l.filter(function (x) { return !D.OPEN_SAY_RE.test(x); }); }
  /* もやもやへの言い訳は、乗客の態度の表から（申し送り T10）。近くの乗客の一言（話し手が乗客でない文）は 2 割 */
  function excuseOf(S, m) {
    var E = D.EXCUSE_PS && m && m.persona && D.EXCUSE_PS[m.persona];
    if (!E) return pk(S, D.EXCUSE);
    var by = (D.EXCUSE || []).filter(function (x) { return /^近くの乗客/.test(x); });
    return by.length && S.rng() < 0.2 ? pk(S, by) : fresh(S, E, E);
  }
  /* 住人の台詞で乗客に呼びかけるときは、名前で呼べないモブとして二人称にする（HK.Mob.addr の「呼び名だけ」の印） */
  function mobAddr(m) { return HK.Mob.addr({ name: m.name, short: '' }); }
  /* 受け指定（モブには受け）・「触られる」の住人は、乗客の体に触れる側にしない（NO 14）：
     乗客が住人の手を取って自分の体へ導く文は、その人には出さない（残りが無ければ元の表のまま） */
  var GUIDE_RE = /\{a\}の手を取[^。]*自分の/, GUIDE_RE_B = /\{b\}の手を取[^。]*自分の/;
  var TOP_FIRST_RE = /\{a\}は不意を突かれて先に/;
  function noGuide(list, re) { if (!list || !list.length) return list; var l = list.filter(function (x) { return !re.test(x); }); return l.length ? l : list; }
  /* 乗客の性格の表：女性の乗客に女性向けの表があればそれ（通し読み 1105：陽気な女の乗客が「いこうぜ」「最高だったな」） */
  function mobTab(tab, m) { var k = m && m.prof && m.prof.k; if (!k || !D[tab]) return null; var F = D[tab + '_F']; return (m.gender === 'f' && F && F[k]) || D[tab][k] || null; }
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
  /* 受け同士・攻め同士で触れ合える二人：恋愛対象（体の関係の相手）が両方向に合い、恋愛・R18にしない組・性行為の相手の固定・性欲「なし」・避けている二人でなく、
     場の設定「触れ合う相手」が「連れの住人」か、関係がセフレ・恋人のとき */
  function pairSoftOk(S, a, b) {
    var Q = HK.Pos;
    if (!a || !b || a === b || !Q || !Q.genderOK || !Q.genderOK(a, b, true)) return false;
    if (HK.ngSexPair && HK.ngSexPair(a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (Q.libOK && !Q.libOK([a, b])) return false;
    if (avoidPair(S, a, b)) return false;
    var rel = relOf(S, a, b);
    return S.v.partner === 'pair' || rel === 'lover' || rel === 'fwb';
  }
  /* 「結ばれた」と書くのは、恋人・片想い系の二人だけ（友人・初対面・敵対・同僚・家族などは「体を重ねた」。本文の結び「友だち、だよね」と結末を合わせる。報告 8） */
  /* 関係の「恋愛：あり」を選んだ二人（家族・信仰など）も、体を重ねたら「結ばれた」（恋愛：ありを効かせる。loveOk は呼ぶ側で見る） */
  function bondRel(S) { return S.rel === 'lover' || S.rel === 'crush' || (S.ties || []).some(function (t) { return t && (t.love === 'ok' || t.love === 'yes'); }); }
  function loveOk(S, a, b) { return !!(HK.canLove && HK.canLove(a, b, S) && HK.canLove(b, a, S)); }
  /* どちらかが相手を避けている（恐怖・無関心・苦手など。avoid-kit.js の HK.Avoid）二人：迎え・連れどうしの場面を出さない */
  function avoidPair(S, a, b) { return !!(HK.Avoid && (HK.Avoid.of(S, a, b) || HK.Avoid.of(S, b, a))); }
  function relOf(S, a, b) {
    var t = (S.ties || []).filter(function (x) { return x && ((x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i)); }), ks = t.map(function (x) { return x.type; });
    if (ks.some(function (k) { return /^(lover|mate|fated)$/.test(k); })) return 'lover';
    if (ks.indexOf('fwb') >= 0) return 'fwb';
    if (ks.some(function (k) { return /^(crush|almost|honmei|ex)$/.test(k); })) return 'crush';
    /* 家族（親子・きょうだい・親族・擬似親子）は「友人」にしない（2026-11-04 の利用者の指示）。語は engine.js の HK.Kin */
    if (ks.some(function (k) { return HK.TIES[k] && HK.TIES[k].family; })) return 'kin';
    /* 敵対・ライバル・不仲と、同僚・上司と部下などは「友人」に丸めない（報告 7。文は関係の名前 {k} で書く） */
    if (ks.some(function (k) { return /^(enemy|rival|bad|lovehate|inferior|superior|apathy|fear)$/.test(k); })) return 'foe';
    if (ks.some(function (k) { return /^(colleague|boss|senpai|classmate|teacher|mentor|buddy|comrade|master|benefactor)$/.test(k); })) return 'work';
    if (ks.length) return 'friend';
    return 'stranger';
  }
  var REL_JA = { lover: '恋人', fwb: 'セフレ', crush: '片想い・友達以上', friend: '知り合い・友人', kin: '家族', foe: '敵対', work: '同僚', stranger: '初対面' };
  /* 関係の名前（敵対・ライバル・同僚・上司と部下 など。設定の関係の表示名） */
  function relWord(S, a, b) {
    var t = (S.ties || []).filter(function (x) { return x && ((x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i)); })[0];
    if (!t) return '';
    if (HK.TIES[t.type] && HK.TIES[t.type].family) return kinWord(S, a, b);
    var l = HK.TIES[t.type] ? HK.TIES[t.type].label : '';
    return { enemy: '敵どうし', rival: 'ライバルどうし', bad: '不仲な二人', boss: '上司と部下', senpai: '先輩と後輩', classmate: '同級生', teacher: '教師と生徒', mentor: '師弟', colleague: '同僚', buddy: '相棒', comrade: '仲間', master: '主従', benefactor: '恩人と恩を受けた側', lovehate: '愛憎の二人', inferior: '引け目のある二人', superior: '張り合う二人', apathy: '互いに無関心な二人', fear: '怖れのある二人' }[t.type] || l || '';
  }
  function kinWord(S, a, b) {
    var t = (S.ties || []).filter(function (x) { return x && HK.TIES[x.type] && HK.TIES[x.type].family && ((x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i)); })[0];
    return t && HK.Kin ? HK.Kin.word(t, t.a === a.i ? a : b, t.a === a.i ? b : a) || '家族' : '家族';
  }
  function relJa(S, rel) { return rel === 'kin' ? S.kinW || '家族' : (rel === 'foe' || rel === 'work') && S.relW ? S.relW : REL_JA[rel]; }
  function KL(t) { return t.split('|'); }
  /* 家族の二人の文（{k}＝親子・姉弟などの語。ほかの関係の文は solo-train-ero.js・solo-train-text2.js） */
  var KIN_T = {
    lead: KL('{r}と{o}は{k}だった。けれど、満員の車内で向かい合わせに押しつけられ、周りの誰もが慰め合っているのを見ると、{k}だからと手を引っ込めるほうが、この路線では不自然に思えた。|二人は顔を見合わせ、少しだけ気まずそうに笑った。{k}でも、この路線ではマナーはマナーだ。{r}がそっと{o}の腰に手を添えると、{o}は目を伏せたまま頷いた。'),
    rescue: KL('{r}と{o}は{k}だった。それでも、ホームのベンチで火照った体を持て余す{o}を、{r}は放っておけなかった。「＠{o}＠……ねえ、少しだけ、そばにいて｜……少しだけ、そばにいてくれ｜……少しだけ、そばにいてください」――その一言で、二人は、{k}として引いてきた線を越えた。|改札を出ても、{o}の熱は引かなかった。{k}として何度も一緒に帰った道を、{r}は{o}の手を引いて、いつもと違う気持ちで歩いた。'),
    after: KL('夜が明けるころ、二人は並んで天井を見ていた。「＠{b}＠……明日からも、{k}の顔でいられるかな｜……明日からも、{k}の顔でいられるだろうか｜……明日からも、{k}の顔でいられるでしょうか」――{b}の問いに、{a}はすぐには答えられなかった。|果てたあと、{a}は{b}の髪を、昔と同じ手つきで撫でた。{k}として過ごしてきた年月と、今夜のことが、同じ手のひらの中にあった。')
  };

  /* ---------- 長い場面（終点前の満員車両・二人の夜） ---------- */
  function longScene(S, a, b, o) {
    var gb = a.mob && b && !b.mob && b.noGive;
    var MO = HK.SexFlow && HK.SexFlow.MOTION, usedM = {};
    /* 攻めが受けの手で先に果てる駆け引きの文（「{a}は不意を突かれて先にイった」）は、攻めを受ける側に読ませるので、この部屋では使わない */
    /* 車内の場面では、寝床・膝の上・うつ伏せ・目隠しなど、立ったままの満員車両に合わない候補は、本体の場所の口（opt.spot='car'。sex-spot-r18.js の HK.SexSpot）が外す（報告 1） */
    var pick = function (l) {
      var l2 = noGuide(gb ? noGuide(l, GUIDE_RE_B) : l, TOP_FIRST_RE);
      /* 甘めの性格の乗客には、駆け引きの台詞（先に音を上げたほうが負け・貸し一つ など）を言わせない（報告 2） */
      if (o.flavor === 'sweet' && l2 && l2.length > 1) { var g = l2.filter(function (x) { return typeof x !== 'string' || !DEAL_RE.test(x); }); if (g.length) l2 = g; }
      /* 候補を絞ったぶん、同じ動き（手首を押さえる・髪を掴む など。HK.SexFlow.MOTION）が一つの場面で二度選ばれないように、使った動きの候補を外す */
      if (MO && l2 && l2.length > 1) { var h = l2.filter(function (x) { return typeof x !== 'string' || !Object.keys(usedM).some(function (k) { return MO[k].test(x); }); }); if (h.length) l2 = h; }
      var r0 = pk(S, l2);
      if (MO && typeof r0 === 'string') Object.keys(MO).forEach(function (k) { if (MO[k].test(r0)) usedM[k] = 1; });
      return r0;
    };
    S._trainScene = o.car ? 'car' : '';
    var opt = { S: S, ctx: S, pick: pick, rng: S.rng, a: a, b: b, style: HK.ThickSex.style(a), open: o.open, after: o.after, again: false };
    if (o.car) opt.spot = 'car';
    /* 相手が乗客（モブ）：乗客の態度（newMob で D.MOB_PS からそろえたもの）を本体の opt.mobPersona に渡し、山場の乗客の台詞を本体の部品がその態度で選ぶ。
       時間帯は路線から（朝の上り＝朝、夕方の下り＝昼、終電・夜行＝夜。「今夜」「朝まで」の文を本体が外す） */
    var mobP = a.mob ? a : b.mob ? b : null;
    if (mobP && mobP.persona && HK.PERSONA && HK.PERSONA[mobP.persona]) opt.mobPersona = mobP.persona;
    if (o.car && S.v) opt.time = { morning: 'morning', evening: 'day', last: 'night', night: 'night' }[S.v.line] || 'night';
    /* 乗客の性格に合う夜の色（疲れた・おどおど＝甘め、無言・事務的＝ドライ、からかう・強気＝駆け引き。報告 2） */
    if (o.flavor) opt.flavor = o.flavor;
    var r, kept = [];
    /* 路線・混み具合で山場の型を変える（人の壁・手すり・終点の放送。報告 1 の面白さ）：この場面のあいだだけ表に足す（空いている車内は人の壁の段を差し替える） */
    if (o.car) {
      var vv = S.v || {}, sp = vv.crowd === 'sparse';
      ['mf', 'ff', 'fm'].forEach(function (k) {
        var lv = X.SC_LEAD_V && (sp ? X.SC_LEAD_V.sparse : X.SC_LEAD_V[vv.line]), iv = X.SC_IN_V && (sp ? X.SC_IN_V.sparse : X.SC_IN_V[vv.line]);
        if (lv && lv[k] && X.SC_LEAD[k]) tmpL(kept, X.SC_LEAD[k], sp ? lv[k].slice() : X.SC_LEAD[k].concat(lv[k]));
        if (iv && iv[k] && X.SC_IN[k]) tmpL(kept, X.SC_IN[k], X.SC_IN[k].concat(iv[k]));
      });
      if (X.SC_AFTER_V && X.SC_AFTER_V[vv.line]) tmpL(kept, X.SC_AFTER, X.SC_AFTER.concat(X.SC_AFTER_V[vv.line]));
      /* 流れの管理の追い上げの段を車内版に（本体の文は寝床の語で落ちるため） */
      var SFT = HK.SexFlowText;
      if (SFT) [['BUILD', X.CAR_BUILD], ['BUILD_PRE', X.CAR_BUILD_PRE]].forEach(function (z) { if (SFT[z[0]] && z[1]) ['mf', 'ff', 'fm'].forEach(function (k) { if (Array.isArray(SFT[z[0]][k]) && z[1][k]) tmpL(kept, SFT[z[0]][k], z[1][k].slice()); }); });
    }
    /* 車内の段（HK.Play.addScene に渡した表。表そのものを渡してあるので、この場面のあいだだけ中身を絞り、あとで戻す） */
    if (gb) ['SC_LEAD', 'SC_FORE', 'SC_IN', 'SC_PLAY', 'OPEN'].forEach(function (k) {
      var o = X[k]; if (!o) return;
      Object.keys(o).forEach(function (m) { var l = o[m]; if (!Array.isArray(l)) return; var f = noGuide(l, GUIDE_RE_B); if (f !== l && f.length !== l.length) { kept.push([l, l.slice()]); l.length = 0; Array.prototype.push.apply(l, f); } });
    });
    /* 女性の攻め（男性器のない体）× 男性の受けの車内：攻めは指と手・口・まれに玩具。本体の組み立ては使わず、部屋の段だけで組む（2026-11-05 の利用者の指示「攻めに挿入はしない」） */
    var fmOwn = o.car && modeOf(a, b) === 'fm' && hasM(b) && X.FM_ACT && !(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    try { r = fmOwn ? fmCar(S, a, b, o) : S.ero && HK.ThickEro ? HK.ThickEro.scene(opt) : HK.ThickSex.scene(opt); } finally { S._trainScene = ''; for (var ki = kept.length - 1; ki >= 0; ki--) { kept[ki][0].length = 0; Array.prototype.push.apply(kept[ki][0], kept[ki][1]); } }
    var t = String(r && r.text || '');
    /* 女性の攻め×男性で、受けの熱を受け止める書き方（「注がれる熱を受け止め」）は、攻めが受ける文に読まれるので言い換える */
    if (r && r.mode === 'fm') t = t.replace(/注がれる熱/g, '{b}の放つ熱');
    if (X.swap) t = X.swap(t);
    var md = (r && r.mode) || modeOf(a, b);
    /* 車内：本体の共通部品だけでできた段を車内の段に差し替える（部屋のルール 2026-11-05。もう一度の段も終点に着く前に車内の文で） */
    if (o.car) { if (!fmOwn) t = carOwn(S, t, a, b, md); }
    else if (S.lv === 'high' && HK.ThickEro && HK.ThickEro.again) { var ag = HK.ThickEro.again(S, pick, a, b, !!S.ero, false); if (ag) t += '\n\n' + ag; }
    /* 乗客の台詞：本体の部品が乗客の態度（上の opt.mobPersona）で選んだうえで、部屋の性格の表（D.SC_MOB。28 種）に台詞のある段は部屋の台詞に（roomVoice）。
       態度だけでは「明日の朝ごはんはあなたの当番」「お互い深入りはなし」のような、見知らぬ乗客に合わない本体の台詞が残るため（2026-11-05 担当TF の計測）。
       果てたあとの段の乗客の喘ぎは消す（報告 4）・見知らぬ乗客への「大好き」を言わない（報告 8） */
    var mob = mobP;
    if (mob && mob.prof) t = roomVoice(S, t, mob, mob === a);
    else if (mob && mob === a) t = afterMoanCut(t, '{a}');
    if (mob) t = loveFix(S, t, mob === a ? b : a, mob === a ? '{b}' : '{a}');
    /* 車内の段の逆戻り（直に触れたあとの「服の上から」、後ろからのまま顔を合わせる、終点に着いたあとの「朝まで」。報告 4） */
    if (o.car) t = carFlow(t, o.direct);
    /* 体の弱い・控えめな性格の乗客の力強い動きを柔らかく */
    if (mob && mob === a && mob.prof && D.SC_SOFTK && D.SC_SOFTK[mob.prof.k]) t = t.replace(/抱え上げ/g, '抱き寄せ').replace(/ぐいと/g, 'そっと').replace(/乱暴に/g, '性急に');
    if (o.car) srcStat(S, t);
    /* 計測用（D.DEBUG）：差し替えたあとの車内の場面を、流れの管理の点検（HK.SexFlow.analyze）に掛けた件数 */
    if (o.car && D.DEBUG && HK.SexFlow && HK.SexFlow.analyze) { try { var afT = o.after && t.indexOf(o.after) >= 0 ? o.after : '', ck = HK.SexFlow.analyze(afT ? t.replace(afT, '') : t, a, b, md, afT).check || []; (ck.v || ck).forEach(function (x) { var q = S._sfv = S._sfv || {}; q[x.k] = (q[x.k] || 0) + 1; (S._sfx = S._sfx || []).length < 40 && S._sfx.push(x.k + '：' + (x.why || '') + (x.k === 'e' ? ' ' + JSON.stringify(ck.stages) + ' ' + JSON.stringify(t.split('\n\n').map(function (q) { return q.slice(0, 40); })) : '')); }); } catch (e) { (S._sfx = S._sfx || []).push('err ' + e.message); } }
    var an = a.mob ? a.short || a.name : a.name, bn = b.mob ? b.short || b.name : b.name;
    t = t.replace(/\{a\}/g, an).replace(/\{b\}/g, bn);
    /* 本体の場所の直し・モブの呼びかけの直し */
    if (o.car) t = carFix(t, o.flavor === 'sweet');
    if (!a.mob !== !b.mob && HK.SexFlow && HK.SexFlow.mobName) t = HK.SexFlow.mobName(t, a.mob ? b.name : a.name);
    return t;
  }
  /* 女性の攻め×男性の受けの車内の場面（部屋の文だけ）：始まり → 人の壁 → 前戯 → 責めの一続き（始まり／続き）→ 熱 → 果てる →（濃いならもう一度）→ 終わり方 */
  function fmCar(S, a, b, o) {
    var vv = S.v || {}, sp = vv.crowd === 'sparse', rng = S.rng;
    var noWall = function (l) { return sp ? keep(l, function (x) { return !/人の(?:陰|波|壁)|周りの乗客|背中を貸/.test(x); }) : l; };
    var lv = X.SC_LEAD_V && (sp ? X.SC_LEAD_V.sparse : X.SC_LEAD_V[vv.line]);
    var leadL = sp && lv && lv.fm ? lv.fm : X.SC_LEAD.fm.concat(lv && lv.fm ? lv.fm : []);
    var peg = X.FM_PEG && S.lv !== 'low' && rng() < 0.15;
    var act = pk(S, noWall(peg ? X.FM_PEG : X.FM_ACT)).split('\n\n');
    var fv = X.SC_FEEL_V && X.SC_FEEL_V[vv.line], feel = pk(S, noWall(fv ? X.SC_FEEL.concat(fv) : X.SC_FEEL));
    var mb = b.mob ? (HK.Moan && HK.Moan.mob ? HK.Moan.mob(S, b, 2, { side: false, gross: !!S.ero }) : '') : (HK.Moan && HK.Moan.say ? HK.Moan.say(S, b, 'climax', { novel: true }, null) : '');
    var out = [o.open, pk(S, noWall(leadL)), pk(S, noWall(X.SC_FORE.fm))].concat(act.slice(0, -1), [feel, act[act.length - 1]]);
    if (S.lv === 'high' && X.FM_AGAIN) out.push(pk(S, X.FM_AGAIN));
    out.push(pk(S, noWall(X.SC_AFTER.concat((X.SC_AFTER_V && X.SC_AFTER_V[vv.line]) || []))));
    if (o.after) out.push(o.after);
    return { text: out.filter(function (x) { return x && /\S/.test(x); }).join('\n\n').replace(/\{mb\}/g, mb || '……っ'), mode: 'fm' };
  }
  function tmpL(kept, l, f) { kept.push([l, l.slice()]); l.length = 0; Array.prototype.push.apply(l, f); }
  /* ---------- 車内の場面を部屋の文に（部屋のルール 2026-11-05：場面の文の 8 割以上を部屋のオリジナルに） ----------
     本体の長い場面（HK.Play.addScene の車内の段を差したもの）から、この部屋の表（HK.TRAIN）の文を一つも含まない段（感じていく・性格の段・
     終わり方・事後の一段落）を見つけ、果てる段より前は「感じていく」、果てる段は「果てる」、後ろは「果てたあと」の車内の段にまとめて差し替える。
     部屋の文と本体の文が混ざった段からは、本体の地の文だけを外す（台詞・喘ぎは残す）。濃いのもう一度は、終点に着く前の段として果てる段のすぐあとに */
  var CLIMAX_RE = /果て|達し|熱を放|注ぎ込|奥に熱|弾け|絶頂|イっ|イく|昇りつめ|上り詰め|迸/;
  var MOVE_RE = /動き|突き|腰を|揺さぶ|もう一度|もう一回|二度目/;
  var INS_RE = /挿し?入|突き入れ|沈め|繋が|迎え入れ|根元まで|貫/;
  var _TS = null, _TIN = null;
  function tnorm(x) { return String(x).replace(/\s/g, ''); }
  function tset() {
    if (_TS) return _TS;
    _TS = {}; _TIN = {};
    var walk = function (o, d) {
      if (d > 6 || o == null) return;
      if (typeof o === 'string') { sents(o).forEach(function (x) { x = tnorm(x); if (x) _TS[x] = 1; }); return; }
      if (Array.isArray(o)) { o.forEach(function (x) { walk(x, d + 1); }); return; }
      if (typeof o === 'object') Object.keys(o).forEach(function (k) { if (k !== '_last') walk(o[k], d + 1); });
    };
    walk(D, 0);
    [X.SC_IN, X.SC_IN_V && X.SC_IN_V.night, X.SC_IN_V && X.SC_IN_V.sparse].forEach(function (o) { if (o) Object.keys(o).forEach(function (m) { (o[m] || []).forEach(function (l) { sents(l).forEach(function (x) { _TIN[tnorm(x)] = 1; }); }); }); });
    return _TS;
  }
  /* 台詞・喘ぎだけの文（話し手の印＋「…」） */
  function voiceOnly(x) { return /^(?:\{[ab]\}|[^\s「」。]{1,12})?「[^「」]*」(?:――)?$/.test(x.replace(/\s/g, '')); }
  function ownS(x) { var n = tnorm(x); return !!(tset()[n]); }
  function carOwn(S, t, a, b, md) {
    var TS = tset(), ps0 = t.split('\n\n');
    var info = ps0.map(function (p) {
      var ss = sents(p).filter(function (x) { return /\S/.test(x); }), nar = ss.filter(function (x) { return !voiceOnly(x); }), own = nar.filter(ownS);
      return { p: p, ss: ss, nar: nar.length, own: own.length, ins: ss.some(function (x) { return _TIN[tnorm(x)]; }) };
    });
    var ci = -1;
    info.forEach(function (z, i) { if (ci < 0 && CLIMAX_RE.test(z.p)) ci = i; });
    var v = S.v || {}, line = v.line, out = [], last = '', done = { climax: false }, feelN = 0, rTag = a.mob ? '{b}' : b.mob ? '{a}' : '';
    var feelL = (X.SC_FEEL || []).concat((X.SC_FEEL_V && X.SC_FEEL_V[line]) || []);
    var moanB = function () {
      if (b.mob) { var mv0 = HK.Moan && HK.Moan.mob ? HK.Moan.mob(S, b, 2, { side: false, gross: !!S.ero }) : ''; return mv0 ? '{b}「' + mv0 + '」' : ''; }
      var v0 = HK.Moan && HK.Moan.say ? HK.Moan.say(S, b, 'climax', { novel: !S.ero }, null) : '';
      return v0 ? '{b}「' + v0 + '」' : '';
    };
    var climaxP = function () { done.climax = true; var c = pk(S, (X.SC_CLIMAX && X.SC_CLIMAX[md]) || X.SC_CLIMAX.mf), mb = moanB(); return c + mb; };
    var againP = function () { return S.lv === 'high' && X.SC_AGAIN && X.SC_AGAIN[md] ? pk(S, X.SC_AGAIN[md]) : ''; };
    var lastBody = -1, insI = -1, ownIns = true;
    info.forEach(function (z, i) { if (z.nar && !z.own) lastBody = i; if (insI < 0 && z.ins) insI = i; });
    /* 車内の繋がる段（部屋の表）が無い場面（男性向けの組み立てなど）は、本体の繋がる文の段を繋がる段とみなす。それも無ければ（性器なしの組など）そのまま */
    if (insI < 0) { ownIns = false; info.forEach(function (z, i) { if (insI < 0 && INS_RE.test(z.p)) insI = i; }); }
    if (insI < 0) return t;
    if (ci < 0) ci = lastBody;
    if (ci >= 0 && ci <= insI) ci = -1;
    /* 繋がる段より前に部屋の段（人の壁・前戯）があるか */
    var ownFore = info.some(function (z, i) { return i > 0 && i < insI && z.own > 0; });
    info.forEach(function (z, i) {
      var pure = z.nar > 0 && z.own === 0, vo = z.ss.filter(voiceOnly).join('');
      /* 乗客との場面で、果てたあとの住人の台詞だけの段（本体の事後の一言：「明日のおごり」など）は外す（住人の事後の一言は PEAK_A・PEAK_B が足す） */
      if (!z.nar && rTag && ci >= 0 && i > ci && z.ss.every(function (x) { var m0 = /^\{[ab]\}「([^「」]*)」/.exec(x.replace(/\s/g, '')); return m0 && x.indexOf(rTag) === 0 && !isMoan(m0[1].replace(/^[＠\u2060][^＠「」｜]{0,16}＠/, '').split('｜')[0]); })) return;
      if (!z.nar) { if (/\S/.test(z.p)) out.push(z.p); return; }
      if (pure) {
        /* 繋がる段より前の本体の段（入り方・前戯の型）は、車内の段（人の壁・前戯）があるので地の文を外す */
        var k = i < insI ? (ownFore ? 'drop' : 'fore') : i === insI && !ownIns ? 'ins' : (ci < 0 || i < ci) ? 'feel' : i === ci ? 'climax' : 'post';
        if (k === 'ins') { out.push(pk(S, X.SC_IN[md] || X.SC_IN.mf) + vo); last = 'ins'; return; }
        if (k === 'fore') { if (last !== 'fore') { out.push(pk(S, X.SC_FORE[md] || X.SC_FORE.mf) + vo); last = 'fore'; } else if (vo) out.push(vo); return; }
        if (k === 'climax') { out.push(climaxP()); var ag = againP(); if (ag) out.push(ag); last = 'climax'; return; }
        /* 感じていく段は二つまで（流れの管理の性感が山場の前に届くように）、果てたあとは一つ */
        if (k === 'drop' || (k === 'feel' ? feelN >= 2 : last === k)) { if (vo) out.push(vo); return; }
        if (k === 'feel') feelN++;
        out.push((k === 'feel' ? pk(S, feelL) : pk(S, X.SC_POST)) + vo);
        last = k; return;
      }
      /* 部屋の文を含む段は、そのまま（本体が言い回しを直した部屋の文もあるので、文を外さない） */
      out.push(z.p);
      if (i === ci && !done.climax) { done.climax = true; var ag2 = againP(); if (ag2) out.push(ag2); }
      if (i >= insI) last = last === 'feel' && i < ci ? 'feel' : '';
    });
    /* 繋がる段と果てる段のあいだに、最中の段を二つ以上（流れの管理の性感が山場の前に届くように。足りなければ車内の「感じていく」を足す） */
    var oi = -1, oc = -1;
    out.forEach(function (p, i) { if (oi < 0 && (sents(p).some(function (x) { return _TIN[tnorm(x)]; }) || INS_RE.test(p))) oi = i; if (oc < 0 && oi >= 0 && i > oi && CLIMAX_RE.test(p)) oc = i; });
    if (oi >= 0 && oc > oi) { var mid = out.slice(oi + 1, oc).filter(function (p) { return sents(p).some(function (x) { return !voiceOnly(x); }); }).length, addF = []; while (mid + addF.length < 2) { var f0 = pk(S, feelL.filter(function (x) { return out.indexOf(x) < 0 && addF.indexOf(x) < 0; })); if (!f0) break; addF.push(f0); } if (addF.length) out = out.slice(0, oc).concat(addF, out.slice(oc)); }
    /* それでも流れの管理の性感が山場の前に届かなければ（HK.SexFlow.analyze の (e)）、果てる段の前に「感じていく」を一つずつ足す（2 回まで） */
    if (HK.SexFlow && HK.SexFlow.analyze) for (var tr = 0; tr < 2; tr++) {
      var ck0; try { ck0 = HK.SexFlow.analyze(out.join('\n\n'), a, b, md).check; } catch (e) { break; }
      if (!((ck0 && ck0.v) || []).some(function (x) { return x.k === 'e'; })) break;
      var oc2 = -1; out.forEach(function (p, i) { if (oc2 < 0 && i > oi && CLIMAX_RE.test(p)) oc2 = i; });
      var f1 = pk(S, feelL.filter(function (x) { return out.indexOf(x) < 0; }));
      if (oc2 < 0 || !f1) break;
      out = out.slice(0, oc2).concat([f1], out.slice(oc2));
    }
    /* 果てる段が見つからなかった場面は、終点に着く段の前に車内の「果てる」を置く */
    if (!done.climax) { var at = -1; out.forEach(function (p, i) { if (at < 0 && ARRIVE_RE.test(p)) at = i; }); var cp = [climaxP()].concat(againP() || []); if (at < 0) out = out.concat(cp); else out = out.slice(0, at).concat(cp, out.slice(at)); }
    return out.join('\n\n');
  }
  /* 部屋の文の割合（計測用。S._src） */
  function srcStat(S, t) {
    var st = S._src = S._src || { own: 0, all: 0, scenes: 0 };
    st.scenes++;
    t.split('\n\n').forEach(function (p) { sents(p).forEach(function (x) { if (!/\S/.test(x) || voiceOnly(x)) return; st.all++; if (ownS(x)) st.own++; }); });
  }
  /* 喘ぎ（漢字が少なく、ひらがなの言葉が短い）か */
  function isMoan(q) {
    var t = String(q).replace(/[⁠＠]/g, ''), k = (t.match(/[一-鿿]/g) || []).length;
    if (k >= 2 || /[ァ-ヶ]{2,}/.test(t)) return false;
    var runs = t.split(/[^ぁ-ゖ]+/).filter(Boolean);
    if (runs.some(function (r) { return r.replace(/[っぁぃぅぇぉゃゅょー]/g, '').length >= 4; })) return false;
    if (k === 1 && t.replace(/[…、。！？!?♡っ\s〜]/g, '').length >= 6) return false;
    return true;
  }
  /* 果てたあとの段（労いの輪など）の、攻めの乗客の喘ぎを消す（労いの段で攻めの喘ぎがもう一度、を出さない。報告 4） */
  function afterMoanCut(t, tag) {
    var ps0 = String(t).split('\n\n'), ci = -1;
    ps0.forEach(function (p, i) { if (ci < 0 && CLIMAX_RE.test(p)) ci = i; });
    if (ci < 0) return t;
    var re = new RegExp(tag.replace(/[{}]/g, '\\$&') + '「([^「」]*)」', 'g');
    return ps0.map(function (p, i) {
      if (i <= ci || MOVE_RE.test(p)) return p;
      return p.replace(re, function (all, q) { return isMoan(q.replace(/^[＠⁠][^＠「」｜。、！？\s]{0,16}＠/, '').split('｜')[0]) ? '' : all; });
    }).filter(function (p) { return /\S/.test(p); }).join('\n\n');
  }
  /* ---------- 山場の乗客の声：乗客の台詞を、乗客の性格の表（D.SC_MOB）から（部屋の短い山場 X.MID と、長い山場） ----------
     長い山場では、先に本体の部品が乗客の態度（opt.mobPersona。D.MOB_PS）で台詞を選び、ここで部屋の表のある段を部屋の台詞にする（2026-11-05 担当TF）。
     乗客の台詞（話し手の印 {a}「…」・乗客が主語の文の「…」・「…」と乗客が）を、問いは問いの表、果てる段より前は最中、果てる段は果てる前後、
     あとは果てたあと（住人が攻めのときは受けるときの声）から選ぶ。果てたあとの段の乗客の喘ぎは消す */
  function roomVoice(S, t, mob, isTop) {
    var k = mob.prof && mob.prof.k, V = k && mobTab('SC_MOB', mob);
    if (!V) return t;
    var tg = isTop ? '\\{a\\}' : '\\{b\\}';
    var ps0 = t.split('\n\n'), ci = -1;
    ps0.forEach(function (p, i) { if (ci < 0 && CLIMAX_RE.test(p)) ci = i; });
    var used = S._mvU = S._mvU || {}, made = {}, st = S._mvS = S._mvS || { rep: 0 };
    /* 一つの場面で同じ声を二度出さない（尽きたら同じ性格のほかの段の声、それも尽きたら元の台詞のまま） */
    var choose = function (pool) {
      var nu = function (x) { return !made['＠' + x]; }, f = pool.filter(function (x) { return nu(x) && !used[x]; });
      if (!f.length) f = pool.filter(nu);
      if (!f.length) f = [].concat(V.s, V.a).filter(nu);
      if (!f.length) return null;
      var x = pk(S, f); used[x] = 1; made['＠' + x] = 1; st.rep++; return x;
    };
    var rep = function (q, i) {
      if (made[q]) return null;
      var body = q.replace(/^[＠⁠][^＠「」｜。、！？\s]{0,16}＠/, '').replace(/^[＠⁠]/, '').split('｜')[0];
      if (!/\S/.test(body)) return null;
      if (isMoan(body)) return isTop && ci >= 0 && i > ci && !MOVE_RE.test(ps0[i]) ? '' : null;
      var qn = /[？?]/.test(body);
      var pool = !isTop ? (qn ? V.q : V.u) : qn ? V.q : ci < 0 || i < ci ? V.s : i === ci ? V.p : V.a;
      var x = choose(pool);
      return x == null ? null : '＠' + x;
    };
    var win = '((?:(?!\\{[ab]\\}[はが])[^。「」]){0,40}?)';
    var out = ps0.map(function (p, i) {
      p = p.replace(new RegExp(tg + '「([^「」]*)」', 'g'), function (all, q) { var r = rep(q, i); return r == null ? all : r === '' ? '' : all.slice(0, all.length - q.length - 1) + r + '」'; });
      p = p.replace(new RegExp('(' + tg + '[はが]' + win.slice(1, -1) + ')「([^「」]*)」', 'g'), function (all, pre, q) { var r = rep(q, i); return r == null || r === '' ? all : pre + '「' + r + '」'; });
      p = p.replace(new RegExp('「([^「」]*)」(と、?' + tg + '[はが])', 'g'), function (all, q, post) { var r = rep(q, i); return r == null || r === '' ? all : '「' + r + '」' + post; });
      return p;
    });
    return out.filter(function (p) { return /\S/.test(p); }).join('\n\n');
  }
  /* 見知らぬ乗客に、住人が「大好き」「愛してる」を言わない（本体の型の文。報告 8）：その台詞は住人の喘ぎに */
  var LOVE_RE = /大好き|愛して|愛おし|好きだよ|好きだ[。、…！」]|好きよ|好き[。…！♡]|「好き/;
  function loveFix(S, t, res, tag) {
    var re = new RegExp(tag.replace(/[{}]/g, '\\$&') + '「([^「」]*)」', 'g');
    return t.replace(re, function (all, q) {
      if (!LOVE_RE.test(q)) return all;
      var v0 = HK.Moan && HK.Moan.say ? HK.Moan.say(S, res, 'mid', { novel: !S.ero }, null) : '';
      return v0 ? tag + '「' + v0 + '」' : '';
    });
  }
  /* 車内の段の逆戻りを外す（文ごとに状態を進める） */
  var DIRECT_RE = /\{ナカ\}|ナカへ|下着の(?:内側|中)|直に|じかに|舌先|口に含|奥まで沈め|奥へ沈|繋が|突き上げ|腰を打ちつけ|指を[^。]{0,8}沈め|迎え入れ/;
  var CLOTH_RE = /服の上から|布越しに|服越しに[^。]{0,10}(?:撫で|なぞ|揉|包)|着たままの服の上から|一枚も乱さない|ボタンを一つも外さず|生地越しに/;
  /* 同じ段で、裾から手を差し入れた直後に「手が服の内側へ滑り込んだ」をもう一度書かない（通し読み 1105：着衣の型の入り方と車内の前戯の二重） */
  var INNER_RE = /裾から(?:手|指)を(?:差し入れ|滑り込ませ|忍ばせ)|服の内側へ滑り込/;
  var BACK_RE = /後ろから|背後から|背中から覆|扉へ両手|扉に両手/;
  var FRONT_RE = /正面から|向き直|向かい合|振り向かせ|こちらを向/;
  var FACE_RE = /見上げると|見上げた先|目を合わせ|見つめ合|上で揺れ|跨|脚を[^。]{0,8}絡め|首に腕を(?:回|絡)/;
  var ARRIVE_RE = /終点を告げる|終点のホームに滑り込|終点に着|ホームの明かりが見え|運転は、この電車で終了/;
  var LATE_RE = /朝まで|夜通し|夜が明けるまで|寝床|ベッド/;
  function carFlow(t, direct0) {
    var direct = !!direct0, back = false, arrived = false;
    return t.split('\n\n').map(function (p) {
      var inner = false;
      return sents(p).filter(function (x) {
        if (!/\S/.test(x)) return true;
        var drop = (direct && CLOTH_RE.test(x) && !DIRECT_RE.test(x)) || (back && FACE_RE.test(x) && !FRONT_RE.test(x) && !CLIMAX_RE.test(x)) || (arrived && LATE_RE.test(x)) || (inner && INNER_RE.test(x) && /服の内側へ滑り込/.test(x));
        if (!drop && INNER_RE.test(x)) inner = true;
        if (drop) return false;
        if (DIRECT_RE.test(x)) direct = true;
        if (BACK_RE.test(x)) back = true; else if (FRONT_RE.test(x)) back = false;
        if (ARRIVE_RE.test(x)) arrived = true;
        return true;
      }).join('');
    }).filter(function (p) { return /\S/.test(p); }).join('\n\n');
  }
  /* ---------- 車内の場面の直し（報告 1・8） ----------
     場所に合わない言い回しの置き換え・落とす文は本体（HK.SexSpot.fix(t, 'car')）。目隠しのあとの「見る」文は流れの管理の (j) が直す。
     ここでは、甘めの性格の乗客の駆け引きの文（音を上げ・貸し一つ など）だけを落とす */
  function sents(p) {
    var out = [], d = 0, st = 0;
    for (var i = 0; i < p.length; i++) { var c = p.charAt(i); if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1); else if (!d && (c === '。' || c === '！' || c === '？')) { var e = i + 1; while (p.charAt(e) === '」') e++; out.push(p.slice(st, e)); st = e; i = e - 1; } }
    if (st < p.length) out.push(p.slice(st));
    return out;
  }
  var DEAL_RE = /音を上げ|貸し一つ|主導権|強引なほど|値踏み|負けを認め|勝ち誇|取引/;
  function carFix(t, sweet) {
    if (HK.SexSpot) t = HK.SexSpot.fix(t, 'car');
    if (!sweet) return t;
    return t.split('\n\n').map(function (p) { return sents(p).filter(function (x) { return !DEAL_RE.test(x); }).join(''); }).filter(function (p) { return /\S/.test(p); }).join('\n\n');
  }
  /* きっかけの段（エッチの場面の直前に、別の段で） */
  function lead(S, actors, text, why) {
    return say(S, { actors: actors, tag: 'きっかけ', text: text, why: 'きっかけ：' + why, mag: 10 });
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
    S.v = { crowd: crowd, line: line, norm: norm, dist: dist, days: days, partner: partner, LN: LN, nSt: { short: 3, mid: 4, term: 6 }[dist] };
    /* 夜行で何晩も乗るときは、一つの旅（夜ごとに次の町へ進み、最後の夜明けに終点）。通勤・帰宅・終電は毎日同じ駅から乗る（報告 6） */
    S.v.trip = line === 'night' && days > 1;
    S.v.st0 = rng.int(Math.max(1, LN.st.length - S.v.nSt));
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
      /* 住人ごとの「触れ合い」（NO 17）。受け攻めと合わない選び方は直す（touchFix）。おまかせは今までどおり（攻めの指定・行動「自分からする」） */
      var tv = pc.pick && pc.pick.touch && pc.pick.touch !== 'auto' ? pc.pick.touch : '', tfx = touchFix(p, tv, P.length);
      if (tfx) { p.touchFixed = tv; tv = tfx === 'auto' ? '' : tfx; }
      p.touchSet = tv;
      var hardT = !!(HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(p));
      p.top = hardT || (tv === 'give') || (!tv && p.action.id === 'give' && npc !== 'bottom');
      if (tv === 'take' || (tv === 'both' && !hardT)) p.top = false;
      p.both = tv === 'both' && !hardT && npc !== 'bottom';
      /* 乗客の体に触れる側にしない人（受け指定・「触られる」） */
      p.noGive = !p.top && !p.both && (npc === 'bottom' || tv === 'take');
      if (p.action.id === 'give' && !p.top && !p.both) p.action = scen.actions[0];
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
      var pickers = P.filter(function (x) { return x.touchSet === 'pick'; });
      S.noDuo = avoidPair(S, P[0], P[1]);
      /* 迎えに行く役：住人ごとの「触れ合い」で「迎えに行く」を選んだ人。おまかせなら、片方だけが攻めの指定で、
         その人の欄がおまかせ・場の設定「触れ合う相手」が「連れの住人」でないとき（住人どうしで触れ合う設定なら同じ車両に乗る） */
      var autoT = !pickers.length && tops.length === 1 && !tops[0].touchSet && env.partner !== 'pair' ? tops[0] : null;
      var Tsel = pickers.length === 1 ? pickers[0] : autoT;
      if (Tsel && !S.noDuo) { S.mode = 'rescue'; S.T = Tsel; S.R = P[0] === S.T ? P[1] : P[0]; }
      else S.mode = 'same';
      S.pairOk = pairSexOk(S, P[0], P[1]);
      S.rel = relOf(S, P[0], P[1]);
      if (S.rel === 'kin') S.kinW = kinWord(S, P[0], P[1]);
      S.relW = relWord(S, P[0], P[1]);
      /* 受け同士・攻め同士（体の関係の向きが決まらない二人）は、手と口まで（挿入しない。NO 16） */
      S.pairSoft = !S.pairOk && pairSoftOk(S, P[0], P[1]);
    }
    P.forEach(function (p) { p.roleLabel = S.mode === 'rescue' ? (p === S.T ? '途中から乗る連れ' : '乗っている人') : p.top ? '自分からする乗客' : '受け入れる乗客'; });
    var keys = ['imm', 'doubt', 'plea', 'reason'];
    ST.step(S, '乗車前');
    say(S, { kind: 'phase', text: '舞台は「' + LN.name + '」（' + LN.label + '・' + { sparse: '空いている', busy: '混んでいる', packed: '満員' }[crowd] + '）。この世界では、混んだ車内で乗客どうしが体を寄せ合い、慰め合うのが当たり前のマナーになっている。' + { loose: '常識はゆるく、目をそらす人もいる。', normal: '', strict: '駅員までが、そのマナーを丁寧に促している。' }[norm] + (S.v.trip && D.TRIP_NOTE ? D.TRIP_NOTE : '') });
    ST.snap(S, keys);

    for (var d = 1; d <= days; d++) {
      S.day = d;
      /* 全員がこの路線に乗らなくなったら（路線を変えた）、残りの日は見出しを並べずに一文でまとめて終える（報告 8） */
      if (P.every(function (p) { return p.gone; }) || (S.mode === 'rescue' && S.R.gone)) {
        var gone = P.filter(function (p) { return p.gone; });
        ST.step(S, d + (d < days ? '〜' + days : '') + '日目');
        say(S, { actors: gone, tag: 'その後の日々', text: fm(pk(S, (S.v.line === 'night' && D.REST_NIGHT) || D.REST || ['{a}は、もうこの路線には乗らなかった。']), { a: names(gone), span: d < days ? d + '日目から' + days + '日目まで' : d + '日目' }), why: '路線を変えたので、残りの日（' + d + (d < days ? '〜' + days : '') + '日目）はまとめた' });
        S.day = days;
        break;
      }
      /* 旅の夜ごとの終点（夜明けに停まる町。最後の夜は路線の終点） */
      S.v.LN = S.v.trip && d < days && D.NIGHT_STOP ? Object.assign({}, LN, { end: D.NIGHT_STOP[(d - 1) % D.NIGHT_STOP.length] }) : LN;
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
      if (p.melted && p.state !== 'awake') return say(S, { actors: [p], tag: '馴染んだ朝', text: fm(pk(S, v.line === 'night' && D.MELT_MORNING_NIGHT ? D.MELT_MORNING_NIGHT : D.MELT_MORNING), V), why: p.name + 'は常識にすっかり馴染んでいる' });
      if (p.state === 'awake') {
        /* かかり直し：快楽の最高・かかり具合が高く、理性・A が低いほど（心が弱い人ほど）。通報して駅員が応じた人・二度目以降は戻りにくい */
        var pr = clamp(p.pleaPk / 100 * 0.55 + p.m.imm / 100 * 0.3 + (p.willK - 1) * 0.8 - p.tr.a * 0.25 + { loose: -0.1, normal: 0, strict: 0.15 }[v.norm] - (p.branch === 'report' && p.reportRes === 'loose' ? 0.3 : 0) - (p.cnt.wake - 1) * 0.12 - (p.branch === 'thrill' ? 0.1 : 0), 0.02, 0.8);
        p.lastResinkP = pr;
        if (rng() < pr) {
          p.state = 'norm'; p.branch = ''; p.cnt.resink++;
          p.m.imm = clamp(p.m.imm + 30, 0, 95); p.m.doubt = clamp(p.m.doubt - 40, 5, 40);
          var o = say(S, { actors: [p], tag: 'かかり直し', text: fm(pk(S, D.RESINK), V), why: p.name + 'は翌朝、また常識に引き戻された（引き戻されやすさ ' + Math.round(pr * 100) + '%：快楽の最高 ' + Math.round(p.pleaPk) + '・かかり具合 ' + Math.round(p.m.imm) + '・心の強さ ' + (HK.Attr && HK.Attr.willLabel ? HK.Attr.willLabel(p) : 'ふつう') + '）', mag: 24 });
          ST.key(S, o, p.name + 'が常識に引き戻された');
          return;
        }
        /* 覚めたまま：前の日の動きで今日を決める */
        if (p.branch === 'off' || (p.branch === 'report' && p.reportRes === 'loose')) {
          var sw = clamp(0.25 + p.tr.cp * 0.35 + p.tr.caution * 0.3 - p.tr.fc * 0.2, 0.05, 0.85);
          if (rng() < sw) {
            p.gone = true; p.switched = d;
            say(S, { actors: [p], tag: '別の路線へ', text: fm(pk(S, v.line === 'night' && D.SWITCH_NIGHT ? D.SWITCH_NIGHT : D.SWITCH_DAY), V), why: p.name + 'は路線を変えることにした（CP ' + Math.round(p.eg.CP) + '・慎重さ ' + Math.round(p.tr.caution * 100) + '）', mag: 20 });
            /* 連れの住人と乗っていたなら、もう一人も一緒に（片方だけが乗り続けない） */
            var oq = linked(S) ? S.P.filter(function (x) { return x !== p && !x.gone; })[0] : null;
            if (oq && D.LINK_SWITCH) { oq.gone = true; oq.switched = d; if (oq.state !== 'awake') oq.followed = (oq.followed || 0) + 1; S.linkOff = S.linkOff || d; say(S, { actors: [oq], tag: '一緒に', text: fm(pk(S, v.line === 'night' && D.LINK_SWITCH_NIGHT ? D.LINK_SWITCH_NIGHT : D.LINK_SWITCH), { a: p.name, c: oq.name }), why: p.name + 'が路線を変えるので、' + oq.name + 'も一緒に変えた' }); }
            return;
          }
        }
        if (p.branch === 'silent') {
          var go = clamp(0.2 + p.tr.cp * 0.4 + p.tr.a * 0.2 - p.tr.ac * 0.3 + p.cnt.silent * 0.1, 0.05, 0.8);
          p.goReport = rng() < go;
          say(S, { actors: [p], tag: p.goReport ? '今日こそ' : 'また乗ってしまう', text: fm(pk(S, p.goReport ? D.SILENT_GO : D.SILENT_AGAIN), V), why: p.name + 'は昨日、言い出せなかった' + (p.goReport ? '。今日こそ言うと決めた' : '') });
          return;
        }
        say(S, { actors: [p], tag: '覚めたまま', text: fm(pk(S, p.branch === 'thrill' && D.KEEP_THRILL && !(v.line === 'night' && v.trip) ? D.KEEP.concat(D.KEEP_THRILL).filter(function (x) { return !/ほとんど眠れ|起き上がれ/.test(x); }) : D.KEEP), V), why: p.name + 'は覚めたまま、次の朝を迎えた（引き戻されやすさ ' + Math.round(pr * 100) + '%）' });
      }
    });
  }

  /* 混み具合「混んでいる」で使わない、満員の言い回し（報告 5） */
  var DENSE_RE = /ぎゅうぎゅう|曇るほど|誰がどこに|びっしり|すし詰め/;
  function keep(l, fn) { var f = (l || []).filter(fn); return f.length ? f : l; }
  /* ---------- 一日の乗車 ---------- */
  function ride(S, riders, d, nSt, normK) {
    var rng = S.rng, v = S.v, LN = v.LN, P = S.P;
    var st0 = v.st0 != null ? v.st0 : rng.int(Math.max(1, LN.st.length - nSt));
    var stations = LN.st.slice(st0, st0 + nSt);
    while (stations.length < nSt) stations.push(LN.st[stations.length % LN.st.length]);
    /* 旅の二夜目からは、前の夜明けに停まった町から乗る */
    var tripOn = v.trip && d > 1 && v.prevEnd;
    if (tripOn) stations[0] = v.prevEnd;
    var V0 = { line: LN.name, time: LN.time, end: LN.end, st: stations[0], d: d };
    /* 乗車（報告 4・5・7・11・14）：乗車の文は混み具合に合うものだけ、乗る理由は路線と時間に合わせ、毎日その路線らしい一幕か車内の出来事を一つ挟む */
    var t, bl = D.BOARD[v.line];
    if (tripOn && D.BOARD_TRIP) bl = D.BOARD_TRIP;
    else if (v.crowd === 'sparse' && D.BOARD_SPARSE && D.BOARD_SPARSE[v.line]) bl = D.BOARD_SPARSE[v.line];
    else if (v.crowd === 'busy') bl = keep(bl, function (x) { return !DENSE_RE.test(x); });
    var whyOf = function (p) { if (v.trip && D.WHY_TRIP && D.WHY_TRIP[p.goal.id]) return fm(pk(S, D.WHY_TRIP[p.goal.id]), { a: p.name }); var w = D.WHY2 && D.WHY2[v.line] && D.WHY2[v.line][p.goal.id]; return fm(pk(S, w || D.WHY[p.goal.id]), { a: p.name }); };
    if (riders.length === 2) {
      /* 初対面の二人は「並んでホームに」立たない。二日目からは「昨日の相手」として */
      var dl = S.rel === 'foe' && D.DUO_BOARD_FOE ? D.DUO_BOARD_FOE : S.rel && S.rel !== 'stranger' ? D.DUO_BOARD : d > 1 && D.DUO_BOARD_AGAIN ? D.DUO_BOARD_AGAIN : D.DUO_BOARD_STR || D.DUO_BOARD;
      if (tripOn && D.DUO_BOARD_TRIP) dl = D.DUO_BOARD_TRIP;
      t = fm(pk(S, keep(bl, function (x) { return x.split('。')[0].indexOf('{a}') < 0; })), Object.assign({ a: riders[0].name }, V0)).split('。')[0] + '。' + fm(pk(S, dl), { a: riders[0].name, c: riders[1].name, line: LN.name });
    }
    else {
      t = fm(pk(S, bl), Object.assign({ a: riders[0].name }, V0)) + (d === 1 ? whyOf(riders[0]) : '');
      /* 乗る理由「小旅行」（夜行の旅でない路線）：二日目は、旅から戻っていつもの電車に乗る一文。そのあとは通勤・帰宅の人として（申し送り T12） */
      var r0 = riders[0];
      if (!v.trip && r0.goal && r0.goal.id === 'trip' && d === 2 && D.TRIP_BACK && D.TRIP_BACK[v.line]) {
        t += fm(pk(S, D.TRIP_BACK[v.line]), { a: r0.name });
        r0.goalNow = (D.TRIP_GOAL && D.TRIP_GOAL[v.line]) || 'home';
      }
    }
    /* 駅のポスターは最初の日と、三日ごと（同じ遊びで同じ標語を繰り返さないように） */
    t += '\n\n' + (d === 1 || d % 3 === 0 ? pk(S, v.crowd === 'sparse' ? keep(D.POSTER[v.norm], function (x) { return !/混み合|混雑|満員/.test(x); }) : D.POSTER[v.norm]).replace(/\{a\}/g, riders[0].name) : '') + fm(pk(S, D.CROWD[v.crowd]), { a: riders[0].name });
    if (D.BEAT) t += '\n\n' + fm(pk(S, rng() < 0.65 || !D.BEAT_ALL ? D.BEAT[v.line] : D.BEAT_ALL), Object.assign({ a: riders[0].name }, V0));
    say(S, { actors: riders, tag: '乗車', text: t, why: d === 1 ? '常識の強さ「' + { loose: 'ゆるい', normal: 'ふつう', strict: '徹底' }[v.norm] + '」・降りる駅まで ' + nSt + '駅' : '' });
    riders.forEach(function (p) {
      p.cnt.rides++; p.offToday = false; p.pax = null; p.peakToday = false; p.escLog = 0; p.touchStop = 0; if (p.both) p.top = rng() < 0.5;
      /* 段の始まり：前の日に達した段の一つ手前から（本人が乗り気なとき＝常識の中にいて、違和感が小さい。NO 12(c)） */
      var eager = (p.state === 'norm' && p.m.doubt < 30) || (p.state === 'awake' && p.branch === 'thrill') || p.melted;
      p.stg = eager && (p.stgBest || 0) >= 2 ? Math.min(3, p.stgBest - 1) : 0;
    });
    S.pairStopDay = 0;
    /* 二人：攻めの人が乗ってくる駅（rescue。最初の日は必ず、ほかの日は 6 割） */
    var Tseg = -1;
    if (S.mode === 'rescue' && !S.T.gone && (d === 1 || rng() < 0.6)) Tseg = clamp({ short: 1, mid: 2, term: 2 + rng.int(2) }[v.dist], 1, nSt - 1);
    for (var seg = 0; seg < nSt; seg++) {
      var nx = stations[Math.min(seg + 1, stations.length - 1)], last = seg === nSt - 1;
      var on = riders.filter(function (p) { return !p.offToday && !p.gone; });
      if (!on.length) break;
      if (seg === Tseg && on.indexOf(S.R) >= 0) { rescue(S, nx); break; }
      /* 連れの住人と乗る日：前の日から片方だけ覚めているなら、乗ってすぐに押し問答（翌日も二人の扱いは同じ） */
      if (seg === 0 && on.length === 2 && linked(S)) {
        var awS = on.filter(function (p) { return p.state === 'awake' && p.branch !== 'thrill'; }), dnS = on.filter(function (p) { return p.state !== 'awake'; });
        if (awS.length === 1 && dnS.length === 1) { argue(S, awS[0], dnS[0], nx, false); on = on.filter(function (p) { return !p.offToday; }); if (!on.length) break; }
      }
      if (last) { peak(S, on, nx); break; }
      /* 二人とも乗っていて、連れどうしの触れ合い */
      /* 連れの住人と触れ合う（NO 16）：場の設定「連れの住人」なら最初の駅から毎駅、ほかは二駅目から時々。片方が乗り気でなくなったら、その日は止まる */
      var pairable = on.length === 2 && S.mode === 'same' && !S.noDuo && (S.pairOk || S.pairSoft) && S.pairStopDay !== S.day && on.every(function (p) { return p.state !== 'awake' || p.branch === 'thrill'; });
      var pairNow = pairable && (v.partner === 'pair' ? true : seg > 0 && rng() < (S.rel === 'lover' || S.rel === 'fwb' ? 0.35 : 0.15));
      if (v.partner === 'pair' && S.pairDay === S.day && !pairNow) { /* 連れどうしで止まった日は、乗客とも触れ合わない */ }
      else if (pairNow) pairTouch(S, on, seg, nx);
      else on.forEach(function (p) { touch(S, p, seg, nx); });
      /* リバ・両方（報告 13）：その日に一度、触りながら触られる段 */
      if (!pairNow) on.forEach(function (p) { if (p.both && p.bothDay !== S.day && seg === Math.min(1, nSt - 2) && !p.offToday && p.canMob && p.lib !== 'none' && !p.touchStop && (p.state !== 'awake' || p.branch === 'thrill') && p.pax) bothAt(S, p, nx); });
      on.forEach(function (p) { if (!p.offToday) check(S, p, seg, nx, normK); });
      if (on.length === 2 && S.mode === 'same' && !S.noDuo) duoMoment(S, on, seg, nx);
    }
    /* 後味（終電・夜行はその路線の文。連れどうしで触れ合った日は二人で一つ。報告 4・7） */
    var both2 = riders.length === 2 && riders.every(function (p) { return !p.gone && !p.offToday && p.pairToday === d && p.state !== 'awake'; });
    if (both2 && D.AFTER_PAIR) say(S, { actors: riders, tag: '後味', text: fm(pk(S, D.AFTER_PAIR), { a: riders[0].name, c: riders[1].name, end: LN.end }), why: '連れどうしで触れ合った日' });
    else riders.forEach(function (p) {
      if (p.gone) return;
      var k = p.offToday ? '' : p.state === 'awake' ? 'awake' : p.m.doubt >= 40 ? 'doubt' : p.cnt.touch ? 'sink' : 'none';
      if (!k) return;
      var al = (D.AFTER_LINE && D.AFTER_LINE[v.line] && D.AFTER_LINE[v.line][k]) || D.AFTER[k];
      /* 覚めたまま自分で続けている人（スリル）には、続けることを選んだ人の後味（2026-11-05 担当R2） */
      if (k === 'awake' && p.branch === 'thrill' && D.AFTER_THRILL) al = D.AFTER_THRILL;
      /* 今日は連れとだけ触れ合った人に、「名前も知らない乗客と会釈」の文を付けない */
      if (p.pairToday === d && p.mobToday !== d) al = keep(al, function (x) { return !/名前も知らない|乗客と会釈/.test(x); });
      /* 山場の無かった日に「体は満たされている」と書かない（報告 8） */
      if (!p.peakToday) al = keep(al, function (x) { return !/満たされ/.test(x); });
      say(S, { actors: [p], tag: '後味', text: fm(pk(S, al), { a: p.name, end: LN.end }), why: '' });
    });
    riders.forEach(function (p) { if (p.pax && p.mobToday === d && p.touchStop !== d && !p.offToday) { p.lastMob = p.pax; p.lastMobDay = d; } });
    S.v.prevEnd = LN.end;
    compBeat(S, d);
  }
  /* ---------- 連れと過ごす毎日の一幕（報告 10）：二人とも乗る日に、迎え・同乗・嫉妬・帰り道の会話のどれも出なかったら、一つ出す ---------- */
  function compBeat(S, d) {
    var P = S.P, v = S.v;
    if (P.length !== 2 || S.noDuo || P.some(function (p) { return p.gone; }) || (S._comp && S._comp[d]) || !D.COMP) return;
    var lover = S.rel === 'lover', k, V, act;
    if (S.mode === 'rescue') {
      var T = S.T, R0 = S.R;
      k = R0.offToday ? 'msg' : lover && R0.mobToday === d && S.rng() < 0.6 ? 'jeal' : S.rng() < 0.7 ? 'wait' : 'msg';
      V = { a: R0.name, t: T.name, end: v.LN.end }; act = [R0, T];
    } else {
      var a = P[0], b = P[1], seen = P.filter(function (p) { return p.mobToday === d; });
      k = lover && seen.length ? 'jealSame' : S.rel === 'stranger' || S.rel === 'foe' ? 'eye' : 'talk';
      var who = seen.length ? seen[0] : a;
      V = { a: who.name, c: (who === a ? b : a).name, end: v.LN.end }; act = [who, who === a ? b : a];
    }
    say(S, { actors: act, tag: { msg: '連絡', jeal: '嫉妬', wait: '迎え', jealSame: '嫉妬', talk: '帰り道', eye: '連れ' }[k], text: fm(pk(S, D.COMP[k]), V), why: '連れのいる日（' + relJa(S, S.rel) + '）：' + { msg: '会えない日の連絡', jeal: 'ほかの乗客に触れられたことへの嫉妬', wait: '改札で待つ', jealSame: '同じ車両で見ていた嫉妬', talk: '帰り道の会話', eye: '同じ車両で目が合う' }[k] });
  }
  /* 連れが先に降りたとき、車内に残った人の段（報告 7） */
  function leftNote(S, p, kind) {
    if (S.mode !== 'same') return;
    var o = S.P.filter(function (x) { return x !== p; })[0];
    if (!o || o.gone || o.offToday) return;
    /* 連れの住人と乗る日：片方が降りたら、もう一人も一緒に降りる（2026-11-05 の利用者の指示） */
    if (linked(S)) return linkOff(S, p, o);
    if (!D.COMP_LEFT) return;
    o.m.doubt = clamp(o.m.doubt + 4, 0, 100);
    say(S, { actors: [o, p], tag: '見送る', text: fm(pk(S, D.COMP_LEFT[kind]), { a: o.name, c: p.name }), why: p.name + 'が先に降りた（' + o.name + 'は車内に残った）' });
  }
  /* ---------- 連れの住人と乗る日（場の設定「触れ合う相手」が「連れの住人」で、住人どうしで触れ合える二人）：降りるときはいつも二人一緒 ---------- */
  function linked(S) { return S.mode === 'same' && S.P.length === 2 && S.v && S.v.partner === 'pair' && !S.noDuo && !!(S.pairOk || S.pairSoft); }
  function linkOff(S, p, o) {
    if (!o || o.gone || o.offToday || !D.LINK_OFF) return;
    o.offToday = true; o.cnt.off++;
    if (o.state !== 'awake') o.followed = (o.followed || 0) + 1;
    S.linkOff = S.day;
    say(S, { actors: [p, o], tag: '一緒に降りる', text: fm(pk(S, D.LINK_OFF), { a: p.name, c: o.name }), why: p.name + 'が降りたので、' + o.name + 'も一緒に降りた（連れの住人と乗る日は、片方だけが乗り続けない）' });
  }
  /* 片方が覚めて、もう一人はまだ常識の中：押し問答（{a}＝気づいた人 w の「おかしい」と、{c}＝もう一人 o の「おかしくない」）。
     結果は、o も覚める（二人で降りる）／押し問答のあと o が折れて二人で降りる／w がその日は流される。mid＝触れ合いの最中に気づいた */
  function argue(S, w, o, nx, mid) {
    var rng = S.rng, V = { a: w.name, c: o.name, nx: nx };
    w.cnt.argue = (w.cnt.argue || 0) + 1; S.argued = (S.argued || 0) + 1; w.told = S.day;
    var t = fm(pk(S, mid ? D.ARGUE_MID : D.ARGUE_OPEN), V) + fm(pk(S, D.ARGUE_SAY[ps(w)]), V);
    var pw = clamp(0.15 + o.m.doubt / 120 + o.tr.a * 0.2 + o.m.reason / 400 - o.m.imm / 250 - o.m.plea / 300 + (w.cnt.argue - 1) * 0.1, 0.05, 0.8);
    var why0 = (mid ? '触れ合いの最中に' : '') + w.name + 'が覚めて「おかしい」と言った';
    if (rng() < pw) {
      t += '\n\n' + fm(pk(S, D.ARGUE_WAKE), V);
      o.m.doubt = clamp(o.m.doubt + 30, 0, 100); o.state = 'awake'; o.cnt.wake++; o.branch = 'off'; o.wakeDay = S.day; w.branch = 'off';
      var o1 = say(S, { actors: [w, o], tag: '押し問答', text: t, why: why0 + '→' + o.name + 'も覚めた（覚めやすさ ' + Math.round(pw * 100) + '%）', mag: 24 });
      ST.key(S, o1, o.name + 'も' + w.name + 'の言葉で覚めた');
      bothOff(S, [w, o], nx);
      return 'wake';
    }
    t += '\n\n' + fm(pk(S, D.ARGUE_NO[ps(o)]), V);
    var push = clamp(0.35 + w.tr.cp * 0.3 + w.m.reason / 300 - w.m.plea / 200 - w.tr.ac * 0.2 + (bondRel(S) ? 0.1 : 0) + (w.cnt.argue - 1) * 0.1, 0.15, 0.85);
    if (rng() < push) {
      t += '\n\n' + fm(pk(S, D.ARGUE_PUSH), V);
      w.branch = 'off'; w.offToday = o.offToday = true; w.cnt.off++; o.cnt.off++; o.followed = (o.followed || 0) + 1; S.linkOff = S.day;
      var o2 = say(S, { actors: [w, o], tag: '押し問答', text: t, why: why0 + '→' + o.name + 'は「おかしくない」と言い張ったが、押し問答のあと、二人で' + nx + 'で降りた（押し切る強さ ' + Math.round(push * 100) + '%）', mag: 24 });
      ST.key(S, o2, w.name + 'と' + o.name + 'が押し問答のあと二人で降りた');
      return 'push';
    }
    t += '\n\n' + fm(pk(S, D.ARGUE_FLOW), V);
    w.state = 'doubt'; w.branch = ''; w.m.doubt = clamp(Math.min(w.m.doubt, 48), 0, 100); w.m.imm = clamp(w.m.imm + 12, 0, 95); w.cnt.flowed = (w.cnt.flowed || 0) + 1;
    say(S, { actors: [w, o], tag: '押し問答', text: t, why: why0 + '→' + o.name + 'に「おかしくない」と言われ、' + w.name + 'はその日は流された', mag: 20 });
    return 'flow';
  }
  /* リバ・両方：触りながら触られる（報告 13。{m}＝住人に触れる乗客 {m2}＝住人が触れる乗客） */
  function bothAt(S, p, nx) {
    var mo = p.pax, mn = newMob(S, p, true) || { name: '別の乗客', short: '別の乗客', gender: mo.gender };
    var by = p.top ? mn : mo, to = p.top ? mo : mn, md = modeOf(by, p);
    p.bothDay = S.day; p.cnt.touch++;
    p.m.plea = clamp(p.m.plea + 8 * p.sens * p.libK, 0, 100); p.pleaPk = Math.max(p.pleaPk, p.m.plea);
    var t = m2Fmt(mobFmt(fm(pk(S, D.BOTH_AT[md] || D.BOTH_AT.mf), { a: p.name, nx: nx }), by), to);
    say(S, { actors: [p], tag: '触りながら', lewd: true, text: t, why: p.name + 'は触れ合いが「両方」：' + (p.top ? '今日は触る側。' : '今日は触られる側。') + 'その途中で、もう一人とは逆の向きに触れ合った' });
  }

  /* ---------- 触れ合い（一駅ぶん） ---------- */
  function touch(S, p, seg, nx) {
    var rng = S.rng, v = S.v;
    if (p.state === 'awake' && p.branch !== 'thrill') return awakeRide(S, p, seg, nx);
    if (!p.canMob) {
      if (seg === 0) { p.m.doubt += 6; say(S, { actors: [p], tag: '触れ合いの外', text: p.name + 'は鞄を胸に抱え、触れ合う乗客たちのあいだで、ひとり腕を組んで立っていた。誰も、それを咎めはしなかった。この世界では、それも一つの乗り方だった。' + (rng() < 0.5 ? '窓に映る車内の光景を、' + p.name + 'は黙って眺め続けた。' : ''), why: p.name + 'は乗客との触れ合いに出ない設定（性行為の相手の固定・体の関係の相手）' }); }
      return;
    }
    if (p.touchStop) return;
    var prev = p.pax;
    /* いつもの乗客（報告 2）：受ける人は、前の日に最後まで触れ合った乗客が、今日も同じ扉の前にいることがある（「昨日の続き」はこのときだけ） */
    if (!p.pax && seg === 0 && !p.top && v.partner !== 'many' && p.lastMob && p.lastMobDay === S.day - 1 && rng() < 0.45) { p.pax = p.lastMob; p.paxSame = S.day; }
    if (!p.pax || (v.partner === 'many' && seg > 0 && rng() < 0.5)) p.pax = newMob(S, p, !!p.pax) || p.pax || newMob(S, p);
    var m = p.pax, top = p.top, mode = top ? modeOf(p, m) : modeOf(m, p), V = { a: p.name, nx: nx, d: S.day }, t, tag;
    if (!top) return touchStage(S, p, seg, nx, m, mode, prev && prev !== m);
    var esc = seg > 0 && p.lib !== 'none';
    var gl = esc ? (mode === 'fm' && !hasM(m) ? D.GIVE_SOFT : D.GIVE_ESC[mode]) : D.GIVE[mode];
    /* 記録に載せるのは、1〜2日目は乗車の最初と深まりを二度まで、3日目からは一日一件（いつもの触れ合い）。ほかは数値だけ動かす */
    var quiet = S.day >= 3 ? seg !== 1 : esc && p.escLog >= 2;
    if (!quiet) {
      t = mobFmt(fm(pk(S, gl), V), m) + (esc ? mv(S, m, 1) : '');
      /* 住人が確かめる一言と、乗客の受け方（乗客ごとの性格。NO 12(b)） */
      if (esc) t += '\n\n' + fm(fresh(S, D.ASK_TOP[ps(p)]), V) + mobFmt(fm(fresh(S, prof(m, 'r'), D.MOB_OK), V), m);
      tag = esc ? '深まる' : '触れ合い';
      if (S.day >= 3 && seg === 1) { t = mobFmt(fm(pk(S, D.HABIT_GIVE), V), m); tag = 'いつもの車両'; }
      /* 複数の乗客（報告 12）：触る側の人にも、駅ごとに相手が入れ替わることを一度書く */
      /* 「相手が入れ替わった」と書いたら、次の段からは本当に次の乗客にする（通し読み 1105：降りたはずの乗客と山場まで続いた） */
      if (v.partner === 'many' && p.manyDay !== S.day && D.MANY_TOP) { p.manyDay = S.day; t += '\n\n' + mobFmt(fm(pk(S, D.MANY_TOP), V), m); var mN = newMob(S, p, true); if (mN) p.pax = mN; }
    }
    if (esc) p.escLog = (p.escLog || 0) + 1;
    var gain = (esc ? 20 : 10) * p.sens * p.libK * rng.range(0.8, 1.2) * (v.crowd === 'packed' ? 1.25 : v.crowd === 'sparse' ? 0.8 : 1);
    p.m.plea = clamp(p.m.plea + gain, 0, 100); p.pleaPk = Math.max(p.pleaPk, p.m.plea);
    p.m.reason = clamp(p.m.reason - gain * 0.25, 0, 100);
    if (p.state === 'norm') p.m.imm = clamp(p.m.imm + 1.5 + p.tr.ac * 2, 0, 98);
    p.cnt.touch++;
    if (quiet) return;
    say(S, { actors: [p], tag: tag, lewd: true, text: t, why: p.name + 'は常識どおりに自分からする側（' + (HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(p) ? '攻めの指定' : '行動「' + p.action.label + '」') + '）' + (p.likes === 'm' || p.likes === 'f' ? '・乗客は恋愛対象に合わせた' : '') });
  }
  /* ---------- 段を踏む触れ合い（受ける住人。NO 12(c)）----------
     段：0 服の上から → 1 服の中へ → 2 直接 → 3 住人が自分から手を導く → 4 口で（→ 終点前の山場）。段の終わりに住人の反応を見て、
     乗り気（yes）なら次の段へ、もやもや（moya）なら同じ段で様子見、覚めかけ・反応がない（cool）なら乗客が手を引いて、その日は終わり。段は逆戻りしない */
  var TH = [6, 16, 28, 38, 46];
  function respOf(S, p, stg) {
    if (p.melted && p.state !== 'awake') return 'yes';
    if (p.state === 'awake' && p.branch !== 'thrill') return 'cool';
    if (p.lib === 'none') return 'cool';
    if (p.state === 'doubt' && p.m.doubt >= 45) return 'cool';
    if (p.state === 'doubt') return 'moya';
    if (p.m.plea < TH[Math.min(stg, TH.length - 1)]) return 'moya';
    return 'yes';
  }
  function stgText(S, p, m, mode, stg) {
    if (stg === 0) return noGuideIf(p, D.TOUCH[mode]);
    var soft = (HK.NoGen && HK.NoGen.on && HK.NoGen.on(m, p)) || (mode === 'fm' && !hasM(p));
    var l = soft && D.STG_SOFT[stg] ? D.STG_SOFT[stg] : D.STG[stg][mode];
    return noGuideIf(p, l);
  }
  function noGuideIf(p, l) { return p.noGive ? noGuide(l, GUIDE_RE) : l; }
  /* 反応の文：一回の遊びで同じ文は 2 回まで、台詞（「…」）のある文は一度だけ。残りが無ければ ''（報告 15） */
  function rx(S, list) {
    var c = S._rx = S._rx || {}, u = S._qUsed = S._qUsed || {};
    var l = (list || []).filter(function (x) { return x && (c[x] || 0) < 2 && !(x.indexOf('「') >= 0 && u[x]); });
    if (!l.length) return '';
    var x = pk(S, l);
    c[x] = (c[x] || 0) + 1; if (x.indexOf('「') >= 0) u[x] = 1;
    return x;
  }
  /* 二人目の乗客の名（最初は長い呼び名、あとは短い呼び名） */
  function m2Fmt(t, m2) { var n = m2.seen ? 1 : 0; var r = t.replace(/\{m2\}/g, function () { return n++ ? m2.short || m2.name : m2.name; }); if (n) m2.seen = true; return r; }
  function secondHand(S, p, m, V) {
    var m2 = newMob(S, p, true) || { name: '別の乗客', short: '別の乗客', gender: m.gender };
    p.pax2 = m2;
    var md = modeOf(m2, p);
    return m2Fmt(fm(pk(S, D.SECOND[md] || D.SECOND.mf), V), m2);
  }
  function touchStage(S, p, seg, nx, m, mode, handover) {
    var rng = S.rng, v = S.v, V = { a: p.name, nx: nx, d: S.day }, stg = p.stg || 0;
    p.mobToday = S.day;
    var gain = (stg === 0 && seg === 0 ? 10 : 20) * p.sens * p.libK * rng.range(0.8, 1.2) * (v.crowd === 'packed' ? 1.25 : v.crowd === 'sparse' ? 0.8 : 1);
    if (p.lib === 'none') gain *= 0.3;
    p.m.plea = clamp(p.m.plea + gain, 0, 100); p.pleaPk = Math.max(p.pleaPk, p.m.plea);
    p.m.reason = clamp(p.m.reason - gain * 0.25, 0, 100);
    if (p.state === 'norm') p.m.imm = clamp(p.m.imm + 1.5 + p.tr.ac * 2, 0, 98);
    p.cnt.touch++;
    var r = respOf(S, p, stg);
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'stg', d: S.day, who: p.i, seg: seg, stg: stg, r: r, st: p.state, br: p.branch });
    /* 記録に載せるのは、1〜2日目は毎駅、3日目からは最初の駅・終点前の最後の駅・手を引いた駅だけ（数値と段はいつも動く） */
    var last = seg === S.v.nSt - 2, quiet = S.day >= 3 && seg > 0 && !last && r !== 'cool';
    /* いちばん深い段（口で）にとどまる駅は、その日一度だけ載せる（同じ段の文を続けない） */
    if (stg === 4 && p.stg4Day === S.day && r !== 'cool') quiet = true;
    if (stg === 4 && !quiet) p.stg4Day = S.day;
    var t = '', tag = stg === 0 ? '触れ合い' : '深まる';
    if (!quiet) {
      /* 最初の駅：同じ乗客なら「昨日の続き」、初めての乗客なら、体のほうが覚えている文（報告 2）。段を飛ばす日は、最初の段の文（いつもの車両）を前に置かない */
      var same = p.paxSame === S.day;
      if (seg === 0 && stg > 0) { t = fm(pk(S, same ? D.RESUME : D.RESUME_NEW || D.RESUME), V) + '\n\n'; if (S.day >= 3) tag = 'いつもの車両'; }
      else if (seg === 0 && (S.day >= 3 || same)) { t = fm(pk(S, same ? D.HABIT_SAME || D.HABIT : D.HABIT_NEW || D.HABIT), V) + '\n\n'; tag = 'いつもの車両'; }
      else if (handover && stg > 0) t += fm(pk(S, D.HANDOVER), V) + '\n\n';
      var body = fm(pk(S, stgText(S, p, m, mode, stg)), V);
      /* 乗客の性格（NO 12(b)）：最初の段は触れ方と挨拶の台詞、そのあとは台詞を一つ */
      if (stg === 0) body = fm(fresh(S, prof(m, 't'), stgText(S, p, m, mode, 0)), V) + fm(fresh(S, saysOf(m), []), V);
      else if (stg <= 2 && rng() < 0.6) body += fm(fresh(S, saysOf(m), []), V);
      m.spoke = true;
      /* 受けでない住人が乗客の体に触れるときは、おねだり・誘い受けの雰囲気で（NO 14） */
      if (stg === 3 && !p.noGive && rng() < 0.4) body += '\n\n' + fm(pk(S, D.INVITE[mode]), V);
      /* 住人の反応は一つの段に一つだけ（報告 15。受け入れる・体が応える・返事のどれか一つ。同じ反応の文は一回の遊びで 2 回まで） */
      /* おねだりの一言は、乗り気で次へ進む段だけ（もやもやの段に、自分から導くおねだりを付けない） */
      var bg = stg === 3 && r === 'yes' ? rx(S, D.BEG[ps(p)]) : '', begged = !!bg;
      if (bg) body += fm(bg, V);
      var react = '';
      if (begged) react = '';
      else if (r === 'yes') react = stg === 0 ? rx(S, (D.ACCEPT[ps(p)] || []).concat(D.RESP[ps(p)].yes)) : stg >= 1 && p.m.plea >= 30 && rng() < 0.5 ? rx(S, D.HEAT[ps(p)]) || rx(S, D.RESP[ps(p)].yes) : rx(S, D.RESP[ps(p)].yes);
      else react = rx(S, D.RESP[ps(p)][r]);
      /* おねだりで答えた段・乗り気の反応が尽きた段は、乗客の確かめる一言も出さない（返事のない問いかけを残さない） */
      t += body + (begged || (r === 'yes' && !react) ? '' : '\n\n' + fm(fresh(S, prof(m, 'q'), D.ASK_GEN), V) + fm(react, V));
      if (r === 'yes' && stg >= 1 && p.m.plea >= 30) t += (HK.NoGen && HK.NoGen.on && HK.NoGen.on(m, p) ? '' : hv(S, p, p.m.plea >= 45 ? 1 : 0));
      else if (r === 'moya') t += fm(pk(S, D.WAIT), V);
      else if (r === 'cool') { t += '\n\n' + fm(fresh(S, prof(m, 'e'), D.MOB_END), V) + fm(pk(S, D.STOP), V); tag = '手を引く'; }
      /* 複数の乗客：二人目の手（報告 12。その日の最初の一回。3日目からは入れ替わりの一文） */
      if (S.v.partner === 'many' && p.manyDay !== S.day && (seg >= 1 || S.day >= 3) && r !== 'cool') {
        p.manyDay = S.day;
        if (S.day >= 3 && D.MANY_HABIT) t += '\n\n' + fm(pk(S, D.MANY_HABIT), V);
        else t += '\n\n' + secondHand(S, p, m, V);
      }
      t = mobFmt(t, m);
    }
    if (r === 'yes') { p.stg = Math.min(4, stg + 1); p.stgBest = Math.max(p.stgBest || 0, p.stg); }
    if (r === 'cool') p.touchStop = S.day;
    if (quiet) return;
    var why = '段「' + D.STG_NAME[stg] + '」・反応「' + { yes: '乗り気→次の段へ', moya: 'もやもや→同じ段で様子を見る', cool: '覚めかけ・反応がない→乗客が手を引く' }[r] + '」（快楽 ' + Math.round(p.m.plea) + '・違和感 ' + Math.round(p.m.doubt) + '）・乗客の性格「' + (m.prof ? m.prof.k : '-') + '」';
    say(S, { actors: [p], tag: tag, lewd: true, text: t, why: why });
  }
  /* 覚めたあとの乗車（スリル以外） */
  function awakeRide(S, p, seg, nx) {
    var V = { a: p.name, nx: nx };
    if (seg === 0 && p.goReport) { p.goReport = false; return report(S, p, nx); }
    if (seg === 0) {
      if (p.branch === 'silent') { p.cnt.silent++; return say(S, { actors: [p], tag: '言い出せない', text: fm(pk(S, D.SILENT), V) + (p.canMob ? mobFmt(fm(pk(S, D.SILENT_BACK), V), p.pax || newMob(S, p)) : ''), why: p.name + 'は覚めているのに、今日も言い出せなかった' }); }
      say(S, { actors: [p], tag: '覚めた目で', text: fm(pk(S, D.WAKE_STAY), V), why: p.name + 'は覚めたまま乗っている。触れ合いには加わらない' });
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
      var t = fm(pk(S, D.MOYA[ps(p)]), V) + '\n\n' + mobFmt(fm(excuseOf(S, p.pax), V), p.pax);
      if (rng() < fool) {
        t += fm(pk(S, D.FOOLED[ps(p)]), V);
        p.m.doubt = clamp(p.m.doubt - 12, 0, 100); p.m.imm = clamp(p.m.imm + 6, 0, 98);
        return say(S, { actors: [p], tag: 'もやもや', text: t, why: p.name + 'は「マナーですよ」に騙された（騙されやすさ ' + Math.round(fool * 100) + '%：かかり具合 ' + Math.round(p.m.imm) + '・AC ' + Math.round(p.eg.AC) + '・A ' + Math.round(p.eg.A) + '）', mag: 12 });
      }
      p.state = 'doubt';
      say(S, { actors: [p], tag: 'もやもや', text: t + '\n\n' + fm(pk(S, noticeOf(S, p)), V), why: p.name + 'は言い訳を聞いても、引っかかりが消えなかった（違和感 ' + Math.round(p.m.doubt) + '）', mag: 16 });
      return;
    }
    if (p.state === 'norm' && p.m.doubt >= 30) { p.state = 'doubt'; p.cnt.notice++; say(S, { actors: [p], tag: '違和感', text: fm(pk(S, noticeOf(S, p)), V), why: p.name + 'の違和感 ' + Math.round(p.m.doubt), mag: 14 }); return; }
    if (p.state !== 'doubt') return;
    /* 口に出す・途中で降りる（行動） */
    if (p.action.id === 'voice' && !p.cnt.voice && rng() < 0.6) {
      p.cnt.voice++;
      var t2 = fm(pk(S, D.VOICE[ps(p)]), V) + mobFmt(fm(pk(S, D.NORM), V), p.pax || newMob(S, p));
      p.m.doubt = clamp(p.m.doubt + 6, 0, 100);
      say(S, { actors: [p], tag: '口に出す', text: t2, why: p.name + 'は違和感を口に出した（行動「' + p.action.label + '」）。誰も咎めず、誰も真に受けない', mag: 14 });
    }
    /* 覚める判定：違和感・理性が高く、かかり具合・快楽が低いほど */
    if (p.m.doubt >= 55) {
      var pw = clamp((p.m.doubt + p.m.reason * 0.3 - p.m.imm * 0.5 - p.m.plea * 0.25) / 100, 0.04, 0.9);
      p.lastWakeP = pw;
      if (rng() < pw) return wake(S, p, nx, pw);
    }
    if (p.action.id === 'getoff' && rng() < 0.35 + p.tr.caution * 0.3) {
      p.offToday = true; p.cnt.off++;
      say(S, { actors: [p], tag: '途中下車', text: fm(pk(S, D.GETOFF), V), why: p.name + 'は違和感に耐えられず、降りる駅でもない駅で降りた（行動「' + p.action.label + '」）', mag: 16 });
      return leftNote(S, p, 'off');
    }
    /* 戸惑い（申し送り T11）：打ち消す（D.BACK）→ 次の駅でも続くなら、打ち消しきれない（D.BACK2）。同じ打ち消し方を続けて並べない。
       打ち消したばかりで覚めるときは、覚める文の前に「戻ってきた」の一文（wake の D.BACK_FAIL） */
    if (rng() < 0.3) {
      var bk = S.day * 100 + seg, prevB = p.backDay === S.day && (bk - p.backAt <= 2 || S._sayN === p.backN);
      if (prevB && p.backStage >= 2) return;
      if (prevB && D.BACK2) { p.backStage = 2; p.backAt = bk; p.m.doubt = clamp(p.m.doubt + 3, 0, 100); say(S, { actors: [p], tag: '打ち消せない', text: fm(pk(S, D.BACK2), V), why: p.name + 'は引っかかりをもう一度打ち消そうとしたが、うまくいかなかった（違和感 ' + Math.round(p.m.doubt) + '）' }); p.backN = S._sayN; return; }
      p.backStage = 1; p.backAt = bk; p.backDay = S.day;
      p.m.doubt = clamp(p.m.doubt - 4, 0, 100);
      var bt = pk(S, D.BACK);
      say(S, { actors: [p], tag: '戸惑い', text: fm(bt, V), why: p.name + 'は引っかかりを、' + (/疲れ/.test(bt) ? '疲れのせいにした' : /ポスター|普通/.test(bt) ? '「これが普通」と言い聞かせて打ち消した' : '揺れと放送にまぎらせて打ち消した') });
      p.backN = S._sayN;
    }
  }

  /* 違和感の芽の文（報告 5・7）：触る側の人は触る側の文、今日は連れとだけ触れ合った人は、見ず知らずの相手の文を使わない */
  var STRANGER_RE = /見ず知らず|初めて会った|初対面|知らない人|お名前/;
  function noticeOf(S, p) {
    if (p.pairToday === S.day && p.mobToday !== S.day && D.NOTICE_PAIR) return D.NOTICE_PAIR;
    if (p.top && D.NOTICE_TOP && D.NOTICE_TOP[ps(p)]) return D.NOTICE_TOP[ps(p)];
    return D.NOTICE[ps(p)];
  }
  /* ---------- 覚める ---------- */
  function wake(S, p, nx, pw, quiet, bk0) {
    var rng = S.rng, v = S.v, V = { a: p.name, nx: nx }, m = p.pax || newMob(S, p);
    p.state = 'awake'; p.cnt.wake++; p.wakeDay = S.day;
    p.m.imm = clamp(p.m.imm - 35, 0, 100); p.m.reason = clamp(p.m.reason + 15, 0, 100);
    /* 覚めたあとの動きを先に決め、覚める文はその動きと矛盾しないものだけから選ぶ（NO 13。対応表は train-design.md） */
    var bk = bk0 || pickBranch(S, p), wp = wakeLines(p, bk);
    var t = quiet ? '' : mobFmt(fm(pk(S, D.WAKE_TRIG), V), m) + '\n\n';
    /* 打ち消したばかりの引っかかりから覚める（申し送り T11）：戸惑いのすぐあと（同じ日の一つ前の駅）なら、戻ってきた一文を前に */
    if (!quiet && p.backStage === 1 && p.backDay === S.day && D.BACK_FAIL) t = fm(pk(S, D.BACK_FAIL), V) + '\n\n' + t;
    p.backStage = 0;
    t += fm(pk(S, p.top || p.touchStop || S.pairStopDay === S.day ? keep(D.WAKE_SEE, function (x) { return !/自分の体の上にある手/.test(x); }) : D.WAKE_SEE), V) + (wp.length ? '\n\n' + fm(pk(S, wp), V) : '') + '\n\n' + mobFmt(fm(pk(S, D.WAKE_WORLD), V), m);
    var o = say(S, { actors: [p], tag: '覚める', text: t, why: p.name + 'の常識が覚めた（覚めやすさ ' + Math.round(pw * 100) + '%：違和感 ' + Math.round(p.m.doubt) + '・理性 ' + Math.round(p.m.reason) + '・かかり具合 ' + Math.round(p.m.imm) + '・快楽 ' + Math.round(p.m.plea) + '）', mag: 32 });
    ST.key(S, o, p.name + 'が覚めた' + (p.cnt.wake > 1 ? '（' + p.cnt.wake + '度目）' : ''));
    branch(S, p, nx, bk);
  }
  /* 覚める文（D.WAKE_PS の態度ごとの文）と、そのあとの動きの対応（NO 13）：
     ・台詞で断る・身を離す文（「ここまでにさせてください」「もういい」「身を引いた」など）→ 降りる・通報だけ
     ・言い出せない → 声に出す文（「…」のある文）は使わない（声が出なかった、と続くため）
     ・スリル → 台詞の文・身を離す文を使わない（気づいたうえで自分で続けると決める文 D.THRILL が続くため）
     ・迎えに行く人が覚める（触れられていない）→ 相手の手・身を離す文を使わない
     合う文が無い態度は、態度の文を出さずに WAKE_SEE と WAKE_WORLD だけで覚めさせる */
  var REFUSE_RE = /身を(?:引|離|よじ)|手から|外した|離した|もういい|もう結構|できない|できません|ここまでに|や、やだ|嫌/;
  function wakeLines(p, bk) {
    var l = D.WAKE_PS[ps(p)] || [];
    if (bk === 'thrill') return l.filter(function (x) { return x.indexOf('「') < 0 && !REFUSE_RE.test(x); });
    if (bk === 'silent') return l.filter(function (x) { return x.indexOf('「') < 0; });
    if (bk === 'pick' || p.top) return l.filter(function (x) { return !/相手|身を|手から|離した|外した/.test(x); });
    return l;
  }
  /* 覚めたあとの分岐（通報する・降りる・合意の上でスリル・言い出せない）。性格に合わない動きも残す */
  function pickBranch(S, p) {
    var rng = S.rng, v = S.v, t = p.tr, P0 = ps(p), c = companion(S, p);
    var canThrill = p.canMob && p.lib !== 'none';
    var w = {
      report: 0.25 + t.cp * 1.2 + t.a * 0.4 + p.m.reason / 250 + (/^(stern|polite|proud)$/.test(P0) ? 0.4 : 0) + (c ? 0.3 : 0) + (v.norm === 'loose' ? 0.25 : 0) - p.m.plea / 130 - t.ac * 0.3,
      off: 0.35 + t.caution * 0.8 + t.ac * 0.3 + (/^(shy|devoted|gentle)$/.test(P0) ? 0.35 : 0),
      thrill: canThrill ? 0.08 + t.fc * 0.9 + t.impulse * 0.5 + p.m.plea / 90 + (/^(free|proud)$/.test(P0) ? 0.35 : 0) : 0,
      silent: 0.15 + t.ac * 0.9 + (/^(shy|tsun|devoted)$/.test(P0) ? 0.45 : 0) + (1 - p.m.reason / 100) * 0.4
    };
    var ks = Object.keys(w);
    return HK.weighted(rng, ks, function (x) { return Math.max(0.03, w[x]); });
  }
  /* 理由の欄（利用者が読む文。2026-11-05 申し送り：気質の態度名「厳格」をそのまま出していた）：選んだ動きのわけを態度ごとの一句で書き、目立つ気質（CP・FC・AC）と快楽・連れを添える */
  var BR_WHY = {
    report: { proud: '黙っていられなかった', stern: '曲がったことを見過ごせなかった', tsun: '腹が立って、引き下がれなかった', gentle: 'ほかの誰かが同じ目に遭うのが嫌だった', devoted: '同じ車両の誰かを守りたかった', cool: '筋の通らないことだと判断した', free: '黙っているのは性に合わなかった', shy: '怖かったが、それでも声を上げた', polite: 'きちんと手順を踏んで知らせようとした' },
    off: { proud: 'これ以上付き合う気はなかった', stern: 'まず、この場を離れるべきだと考えた', tsun: '何も言わずに離れるのが精いっぱいだった', gentle: '揉めずに、静かに離れたかった', devoted: '騒ぎにせず、自分が引くことを選んだ', cool: '離れるのがいちばん早いと考えた', free: 'さっさと降りて、気分を変えたかった', shy: '声を出すより、降りるほうが楽だった', polite: '周りに騒ぎを見せずに済む方法を選んだ' },
    thrill: { proud: '自分で選んだのだと思いたかった', stern: '頭では分かっていて、それでもやめなかった', tsun: '認めたくないが、やめたくもなかった', gentle: '嫌ではない自分に、気づいてしまった', devoted: '求められるのが、うれしかった', cool: '分かったうえで、自分で決めた', free: 'この状況を面白がる気持ちが勝った', shy: '恥ずかしさより、体の熱が勝った', polite: '分かったうえで、自分で受け入れた' },
    silent: { proud: '弱みを見せるのが嫌で、騒ぎにできなかった', stern: '自分の思い違いかもしれないと、確かめきれずにいた', tsun: '素直に助けを求められなかった', gentle: '周りの空気を壊したくなかった', devoted: '誰かに迷惑をかけるのが怖かった', cool: '騒ぐほどのことか、まだ測りかねていた', free: '自分でもどうしたいのか、決めきれなかった', shy: '人前で声を上げるのが怖かった', polite: '角の立たない言い方を探しているうちに、言葉を失った' }
  };
  function branchWhy(p, k, P0, c) {
    var o = [(BR_WHY[k] || BR_WHY.silent)[P0] || BR_WHY.silent.gentle], eg = p.eg || {};
    if (eg.CP >= 13) o.push('きまじめ（CP ' + Math.round(eg.CP) + '）');
    if (eg.FC >= 13) o.push('好奇心が強い（FC ' + Math.round(eg.FC) + '）');
    if (eg.AC >= 13) o.push('周りに合わせがち（AC ' + Math.round(eg.AC) + '）');
    if (p.m && p.m.plea >= 50) o.push('体にまだ熱が残っていた（快楽 ' + Math.round(p.m.plea) + '）');
    if (c) o.push('連れがいる');
    return '（' + o.join('・') + '）';
  }
  function branch(S, p, nx, k) {
    var t = p.tr, P0 = ps(p), c = companion(S, p);
    if (!k) k = pickBranch(S, p);
    p.branch = k;
    var why = branchWhy(p, k, P0, c);
    if (k === 'report') return report(S, p, nx, why);
    if (k === 'off' && linked(S) && c && c.state !== 'awake') { p.branch = 'off'; return argue(S, p, c, nx, p.pairToday === S.day); }
    if (k === 'off') {
      p.offToday = true; p.cnt.off++;
      say(S, { actors: [p], tag: '途中下車', text: fm(pk(S, D.WAKE_OFF), { a: p.name, nx: nx }), why: p.name + 'は覚めて、次の駅で降りることを選んだ' + why, mag: 18 });
      return leftNote(S, p, 'off');
    }
    if (k === 'thrill') {
      p.cnt.thrill++;
      var tt = fm(pk(S, D.THRILL[P0]), { a: p.name }) + (c && !c.offToday && c.state !== 'norm' ? '\n\n' + fm(pk(S, D.THRILL_C), { a: p.name, c: c.name }) : '');
      return say(S, { actors: c && tt.indexOf(c.name) >= 0 ? [p, c] : [p], tag: 'スリル', text: tt, why: p.name + 'は気づいたうえで、自分の意思で続けることを選んだ' + why, mag: 22 });
    }
    p.cnt.silent++;
    return say(S, { actors: [p], tag: '言い出せない', text: fm(pk(S, D.SILENT), { a: p.name }) + (p.canMob && p.pax ? mobFmt(fm(pk(S, D.SILENT_BACK), { a: p.name }), p.pax) : ''), why: p.name + 'は気づいているのに、声が出なかった' + why, mag: 18 });
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
    if (v.norm === 'loose' && !duo) S._leftAfter = p;
    var o = say(S, { actors: duo ? [p, c] : [p], tag: '通報', text: t, why: p.name + 'は通報した' + (why || '') + '。常識の強さ「' + { loose: 'ゆるい', normal: 'ふつう', strict: '徹底' }[v.norm] + '」→' + { loose: '駅員が応じて、周りが散った', normal: '駅員が困った顔で間に入った', strict: '「マナーですよ」と流された' }[v.norm], mag: 26 });
    ST.key(S, o, p.name + 'が通報した');
    if (S._leftAfter === p) { S._leftAfter = null; leftNote(S, p, 'report'); }
  }

  /* ---------- 二人が同じ車両：見る・分け合う・気づかせる ---------- */
  function duoMoment(S, on, seg, nx) {
    var rng = S.rng, a = on[0], b = on[1];
    if (a.offToday || b.offToday) return;
    var aw = on.filter(function (p) { return p.state === 'awake' && p.branch !== 'thrill'; }), dn = on.filter(function (p) { return p.state !== 'awake'; });
    /* 一人だけ覚めて、連れに気づかせようとする */
    if (aw.length === 1 && dn.length === 1 && !aw[0].told && linked(S)) { argue(S, aw[0], dn[0], nx, dn[0].pairToday === S.day); return; }
    if (aw.length === 1 && dn.length === 1 && !aw[0].told) {
      var w = aw[0], o = dn[0], V = { a: w.name, c: o.name, nx: nx };
      w.told = S.day;
      var ok = rng() < clamp(0.15 + o.m.doubt / 120 + o.tr.a * 0.2 + o.m.reason / 400 - o.m.imm / 250 - o.m.plea / 300, 0.05, 0.85);
      var t = fm(pk(S, D.TELL), V) + '\n\n' + fm(pk(S, ok ? D.TELL_OK : D.TELL_NG), V);
      say(S, { actors: [w, o], tag: '気づかせる', text: t, why: w.name + 'は一人だけ覚めて、' + o.name + 'に気づかせようとした→' + (ok ? '伝わった' : '伝わらなかった'), mag: 20 });
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
      return say(S, { actors: [a, b], tag: '分け合う', text: fm(pk(S, D.SHARE), { a: a.name, c: b.name }), why: '二人とも違和感を抱えていた（' + a.name + ' ' + Math.round(a.m.doubt) + '・' + b.name + ' ' + Math.round(b.m.doubt) + '）', mag: 18 });
    }
    /* 連れが乗客と触れ合うのを見る */
    var seer = rng.pick(on), other = seer === a ? b : a;
    if (other.pax && other.cnt.touch && seer.state !== 'awake' && rng() < 0.3 && !seer.sawToday) {
      seer.sawToday = S.day;
      seer.m.doubt = clamp(seer.m.doubt + 6 + seer.tr.jealous * 8, 0, 100);
      say(S, { actors: [seer, other], tag: '見てしまう', text: fm(pk(S, D.SEE_C), { a: seer.name, c: other.name }), why: seer.name + 'の違和感が少し伸びた（嫉妬・執着 ' + Math.round(seer.tr.jealous * 100) + '）' });
    }
  }
  function bothOff(S, on, nx) {
    var a = on[0], b = on[1];
    S.bothOffDay = S.day; S.bothOff = true; if (linked(S)) S.linkOff = S.linkOff || S.day;
    a.offToday = b.offToday = true; a.cnt.off++; b.cnt.off++;
    a.duoOff = b.duoOff = true;
    if (a.branch === 'thrill') a.branch = 'off'; if (b.branch === 'thrill') b.branch = 'off';
    var o = say(S, { actors: [a, b], tag: '二人で降りる', text: fm(pk(S, D.BOTH_OFF), { a: a.name, c: b.name, nx: nx }), why: '二人とも覚めて、' + nx + 'で降りた', mag: 28 });
    ST.key(S, o, a.name + 'と' + b.name + 'が二人で降りた');
    /* 体の関係になれる二人：覚めたまま、自分たちで選んで夜を過ごすこともある */
    if (S.pairOk && !S.wokeNight && S.lv !== 'low') {
      var pr = clamp({ lover: 0.6, fwb: 0.55, crush: 0.4, friend: 0.15, kin: 0.15, foe: 0.12, work: 0.15, stranger: 0.08 }[S.rel] * Math.sqrt(a.libK * b.libK), 0, 0.85);
      if (S.rng() < pr) { S.wokeNight = true; wokeNight(S, a, b, pr); }
    }
  }
  function wokeNight(S, a, b, pr) {
    var ord = HK.Pos.order(a, b), T = ord[0], U = ord[1], mode = modeOf(T, U);
    lead(S, [T, U], fm(pk(S, X.LEAD_WOKE), { r: T.name, o: U.name }), '二人で覚めて降りたあと、自分たちで選んで（' + relJa(S, S.rel) + '・起きやすさ ' + Math.round(pr * 100) + '%）');
    var text = longScene(S, T, U, { car: false, open: fm(pk(S, X.OPEN_ROOM[mode]), { a: '{a}', b: '{b}' }), after: pk(S, X.AFTER_WOKE) });
    T.cnt.night++; U.cnt.night++; S.bonded = loveOk(S, T, U) && bondRel(S); S.bodied = true; S.nightPair = [T, U];
    var o = say(S, { actors: [T, U], tag: '夜', lewd: true, text: text, why: '二人で覚めて降りたあとの夜（' + T.name + 'が攻め）', mag: 30 });
    ST.key(S, o, T.name + 'と' + U.name + 'が結ばれた');
  }
  /* 連れどうしが常識どおりに触れ合う（NO 16）。体の関係になれる二人は {a}＝攻め {b}＝受け、受け同士・攻め同士は対等（soft：手と口まで）。
     その日の最初は、きっかけの段（関係ごとの導入と、互いの合図）。段：0 服の上から → 1 手 → 2 口。二人とも乗り気なら次へ、片方がもやもやなら同じ段、覚めかけなら止まる */
  function pairOrder(S, on) {
    if (S.pairOk) return HK.Pos.order(on[0], on[1]);
    if (!S.pairAB) S.pairAB = S.rng() < 0.5 ? [on[0], on[1]] : [on[1], on[0]];
    return S.pairAB;
  }
  function softKind(a, b) { var fa = isF(a), fb = isF(b); return fa && fb ? 'ff' : !fa && !fb ? 'mm' : 'mx'; }
  function pairTouch(S, on, seg, nx) {
    var ord = pairOrder(S, on), T = ord[0], U = ord[1], soft = !S.pairOk, mode = soft ? softKind(T, U) : modeOf(T, U), rel = S.rel || 'stranger';
    if (S.pairDay !== S.day) {
      S.pairDay = S.day; S.pairStg = (S.pairBest || 0) >= 2 ? 1 : 0;
      /* 二日目からは「昨日の続き」の文（初対面の二人に「初めて乗り合わせた」を繰り返さない。報告 7）。敵対・同僚などは関係の名前で（{k}） */
      var plist = S.pairDays ? (S.lastPairDay === S.day - 1 || !D.PAIR_LEAD_GAP ? D.PAIR_LEAD_AGAIN : D.PAIR_LEAD_GAP) : rel === 'kin' ? KIN_T.lead : (rel === 'foe' || rel === 'work') && D.PAIR_LEAD_X ? D.PAIR_LEAD_X[rel] : D.PAIR_LEAD[rel] || D.PAIR_LEAD.stranger;
      S.pairDays = (S.pairDays || 0) + 1; S.lastPairDay = S.day;
      lead(S, [T, U], fm(pk(S, plist), { r: T.name, o: U.name, k: rel === 'kin' ? S.kinW || '家族' : S.relW || '知り合い', d: S.day, n: S.pairDays }) + '\n\n' + fm(pk(S, D.PAIR_SIGN), { r: T.name, o: U.name }), '連れどうしで、常識どおりに（' + relJa(S, rel) + '・' + (soft ? '受け攻めの向きが決まらない二人なので、手と口まで' : T.name + 'が攻め') + '）・合図は目と手');
    }
    var stg = S.pairStg || 0, V = { a: T.name, b: U.name };
    [T, U].forEach(function (p) { p.pairToday = S.day; p.m.plea = clamp(p.m.plea + 12 * p.sens * p.libK, 0, 100); p.pleaPk = Math.max(p.pleaPk, p.m.plea); p.cnt.touch++; p.cnt.pair++; p.m.reason = clamp(p.m.reason - 3, 0, 100); });
    var rs = [respOf(S, T, stg), respOf(S, U, stg)], r = rs.indexOf('cool') >= 0 ? 'cool' : rs.indexOf('moya') >= 0 ? 'moya' : 'yes';
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'pair', d: S.day, seg: seg, stg: stg, r: r, soft: soft });
    var t = soft ? pk(S, D.SOFT_STG[stg][mode]) : stg === 0 ? pk(S, rel === 'stranger' || rel === 'foe' ? keep(X.PAIR_TOUCH[mode], function (x) { return !/いつも隣にいる/.test(x); }) : X.PAIR_TOUCH[mode]) : pk(S, D.PAIR_STG[stg][mode]);
    t = fm(t, V) + fm(rx(S, D.PAIR_RESP[ps(U)]), { o: U.name }) + (soft || stg < 1 || (HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U)) ? '' : hv(S, U, 0));
    /* 止まったのが触れていた側（攻め）なら、その人が自分で手を引く文（受けが手を離す文にしない。報告 7） */
    if (r === 'cool') { var who = rs[1] === 'cool' ? U : T; t += '\n\n' + (who === T && !soft && D.PAIR_STOP_T ? fm(pk(S, D.PAIR_STOP_T), { r: T.name, o: U.name }) : fm(pk(S, D.PAIR_STOP), { r: who === U ? T.name : U.name, o: who.name })); S.pairStopDay = S.day; }
    else if (r === 'yes') { S.pairStg = Math.min(2, stg + 1); S.pairBest = Math.max(S.pairBest || 0, S.pairStg); }
    say(S, { actors: [T, U], tag: r === 'cool' ? '手を引く' : '連れと', lewd: true, text: t, why: '連れどうしで、常識どおりに（' + relJa(S, rel) + '・' + (soft ? '受け攻めの向きが決まらない二人：手と口まで' : T.name + 'が攻め') + '・段「' + ['服の上から', '手で', '口で'][stg] + '」・反応「' + { yes: '二人とも乗り気→次の段へ', moya: 'もやもや→同じ段', cool: '覚めかけ→止まる' }[r] + '」）' });
    /* 触れ合いの最中に受け（受け攻めの向きが決まらない二人はどちらか）が気づく（2026-11-05 の利用者の指示）。違和感が大きいほど */
    if (nx && linked(S) && r !== 'yes') {
      var mw = [U, T].filter(function (p) { return p.state === 'doubt' && p.m.doubt >= 42; })[0];
      if (mw && S.rng() < clamp(0.2 + (mw.m.doubt - 42) / 60, 0.2, 0.6)) { S.pairStopDay = S.day; return wake(S, mw, nx, clamp(mw.m.doubt / 100, 0.1, 0.9), true, 'off'); }
    }
  }
  /* 受け同士・攻め同士の終点前（手と口まで。挿入しない） */
  function pairPeakSoft(S, on, nx) {
    var v = S.v, LN = v.LN, ord = pairOrder(S, on), T = ord[0], U = ord[1], kind = softKind(T, U), V = { o: U.name, end: LN.end, nx: nx, d: S.day };
    lead(S, [T, U], fm(pk(S, X.LEAD_SIT), V) + '\n\n' + fm(pk(S, D.SOFT_LEAD), V) + '\n\n' + fm(pk(S, D.PAIR_SIGN), { r: T.name, o: U.name }), '終点前のマナー（連れどうし・' + relJa(S, S.rel) + '・受け攻めの向きが決まらない二人なので、手と口まで）');
    var text = S.lv === 'low' ? fm(pk(S, D.SOFT_FADE), V) : fm(pk(S, D.SOFT_PEAK[kind]), { a: T.name, b: U.name }) + '\n\n' + fm(rx(S, D.PAIR_RESP[ps(T)]), { o: T.name });
    [T, U].forEach(function (p) { p.cnt.peak++; p.peakToday = true; (p.peakDays = p.peakDays || {})[S.day] = 1; p.m.plea = 20; p.m.reason = clamp(p.m.reason - 5, 0, 100); });
    S.pairPeak = (S.pairPeak || 0) + 1; S.softPeak = (S.softPeak || 0) + 1;
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'peak', d: S.day, soft: true, ins: false });
    var o = say(S, { actors: [T, U], tag: '山場', lewd: true, text: text, why: '終点直前の満員車両で、連れどうし（受け攻めの向きが決まらない二人：手と口まで。挿入なし）', mag: 28 });
    if (S.pairPeak === 1) ST.key(S, o, T.name + 'と' + U.name + 'が満員車両で');
  }

  /* ---------- 山場：終点直前の満員車両 ---------- */
  function peak(S, on, nx) {
    var rng = S.rng, v = S.v, LN = v.LN;
    /* 山場に進めるのは、乗り気のまま段を踏んできた人だけ（受ける人は段「直接」まで進み、その日に乗客が手を引いていない。NO 12(c)） */
    var ok = function (p) { return p.canMob && p.lib !== 'none' && !p.touchStop && (p.top || (p.stg || 0) >= 2) && (p.state !== 'awake' || p.branch === 'thrill') && p.m.plea >= { short: 28, mid: 36, term: 48 }[v.dist] + (v.crowd === 'sparse' ? 12 : 0); };
    /* 二人：連れどうしの山場（体の関係になれる二人は挿入まで、受け同士・攻め同士は手と口まで） */
    var pairDay = S.pairDay === S.day;
    if (on.length === 2 && S.mode === 'same' && !S.noDuo && (S.pairOk || S.pairSoft) && S.pairStopDay !== S.day && (S.pairPeak || 0) < 3 && (!pairDay || (S.pairStg || 0) >= 1) && on.every(function (p) { return (p.state !== 'awake' || p.branch === 'thrill') && p.m.plea >= 35; }) && (v.partner === 'pair' || rng() < (S.rel === 'lover' || S.rel === 'fwb' ? 0.55 : 0.25))) return S.pairOk ? pairPeak(S, on, nx) : pairPeakSoft(S, on, nx);
    /* 連れどうしで触れ合った日は、乗客との山場にしない */
    if (pairDay && v.partner === 'pair') { on.forEach(function (p) { if (p.cnt.touch) say(S, { actors: [p], tag: '終点へ', text: fm(pk(S, D.NOPEAK), { a: p.name, end: LN.end }), why: '連れどうしの終点前の山場には届かなかった' + (S.pairStopDay === S.day ? '（今日は途中で止まった）' : '') }); }); return; }
    on.forEach(function (p) {
      if (p.state === 'awake' && p.branch !== 'thrill') return awakeRide(S, p, 1, nx);
      if (!ok(p)) {
        if (p.canMob && p.cnt.touch) say(S, { actors: [p], tag: '終点へ', text: fm(pk(S, D.NOPEAK), { a: p.name, end: LN.end }), why: '終点前の山場には届かなかった（快楽 ' + Math.round(p.m.plea) + '）' });
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
    /* 自分から触る側の人には、受ける側の熱の文（膝に力が入らない など）を付けない（報告 6） */
    var lt = fm(pk(S, p.cnt.peak ? againLead(S, p) : X.LEAD_SIT), V) + '\n\n' + fm(pk(S, top && X.LEAD_HEAT_TOP ? X.LEAD_HEAT_TOP : X.LEAD_HEAT), V);
    /* 乗客の性格を山場まで（報告 2・16）：受ける人には、乗客がその性格のまま終点前を言い出す */
    var mpk = m.prof && D.MOB_PEAK ? mobTab('MOB_PEAK', m) : null, fl = m.prof && D.FLAVOR ? D.FLAVOR[m.prof.k] : '';
    if (p.branch === 'thrill') lt += '\n\n' + fm(pk(S, D.THRILL_PEAK || D.THRILL[ps(p)]), { a: p.name });
    else if (p.m.doubt >= 40) lt += '\n\n' + fm(pk(S, X.LEAD_DOUBT), V);
    lt += '\n\n' + mobFmt(top ? fm(pk(S, X.LEAD_SELF), { r: p.name, o: '{m}' }) : fm(mpk ? fresh(S, mpk.l, X.LEAD_MOB) : pk(S, X.LEAD_MOB), { r: '{m}', o: p.name }), m) + (top ? '' : fm(rx(S, X.LEAD_YES[ps(p)]), V));
    var why = (p.cnt.peak ? '二度目以降の終点前（' + S.day + '日目）' : '終点前のマナー') + '・快楽 ' + Math.round(p.m.plea) + (p.branch === 'thrill' ? '・覚めたうえで本人が選んだ' : '') + '・言い出したのは' + (top ? p.name : '乗客');
    lead(S, [p], lt, why);
    var text;
    if (S.lv === 'low') text = fm(pk(S, X.FADE), V);
    else if (p.cnt.peak >= 1 && !S.ero && X.MID && midOk(A, B, mode)) {
      /* 二度目・三度目（小説調）：車内だけで組んだ中くらいの場面 */
      var mb = B.mob ? (HK.Moan && HK.Moan.mob ? HK.Moan.mob(S, B, 2, { side: false, gross: false }) : '……っ') : (HK.Moan && HK.Moan.say ? HK.Moan.say(S, B, 'climax', { novel: true }, null) : '……っ');
      var an = A.mob ? A.short : A.name, bn = B.mob ? B.short : B.name;
      text = pk(S, X.MID[mode]).replace('{mb}', mb || '……っ');
      if (m.prof) text = roomVoice(S, text, m, !top);
      text = loveFix(S, text, p, top ? '{a}' : '{b}');
      text = text.replace(/\{a\}/g, an).replace(/\{b\}/g, bn);
      text += '\n\n' + fm(pk(S, crowdPool(S)), V) + fm(rx(S, (top ? X.PEAK_A : X.PEAK_B)[ps(p)]), V);
      text = carFix(HK.SexFlow && HK.SexFlow.mobName ? HK.SexFlow.mobName(text, p.name) : text);
    }
    else {
      /* その日の触れ合いで直に触れる段まで進んでいたら、山場の始まりで「服を一枚も乱さないまま」「布の上から」に戻さない（通し読み 1105） */
      text = longScene(S, A, B, { car: true, flavor: fl, open: openFor(S, mode, top ? null : m), after: pk(S, after2Pool(S)), direct: (p.stg || 0) >= 2 || (p.escLog || 0) >= 2 });
      text = mobFmt(text, m);
      /* 労いの輪（混み具合・路線ごと）。果てたあとに乗客の喘ぎをもう一度は付けない（報告 4） */
      text += '\n\n' + fm(pk(S, keep(crowdPool(S), function (x) { return !(/髪/.test(x) && /髪を/.test(text)); })), V) + fm(rx(S, (top ? X.PEAK_A : X.PEAK_B)[ps(p)]), V);
    }
    /* 終わったあとの乗客の一言（性格のまま） */
    if (S.lv !== 'low' && mpk) { var ma = fresh(S, mpk.a, []); if (ma) text += '\n\n' + mobFmt(fm(ma, V), m); }
    /* 住人が乗客に話しかける台詞の「あなた」は、乗客への呼びかけの印にする（mob.js の HK.Mob.addr。ほかの住人の名前で呼ばないように） */
    if (HK.Mob && HK.Mob.addr) text = text.replace(/あなた/g, function () { return mobAddr(m); });
    text = dedupQuote(text);
    p.cnt.peak++; p.peakToday = true; (p.peakDays = p.peakDays || {})[S.day] = 1;
    p.m.plea = 20; p.m.imm = clamp(p.m.imm + (p.branch === 'thrill' ? 0 : 8), 0, 98); p.m.reason = clamp(p.m.reason - 6, 0, 100);
    var o = say(S, { actors: [p], tag: '山場', lewd: true, text: text, why: '終点直前の満員車両（' + m.name + (top ? 'に、' + p.name + 'から' : 'と') + '・' + { mf: '男性の体の攻め', ff: '女性どうし', fm: '女性の攻め×男性' }[mode] + '）', mag: 30 });
    if (p.cnt.peak === 1) ST.key(S, o, p.name + 'が終点前の満員車両で');
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'peak', d: S.day, who: p.i, stg: p.stg, top: top, ins: S.lv !== 'low' });
    afterPeak(S, p);
    meltCheck(S, p);
  }
  /* 一つの段の中で同じ台詞（5 字以上）を二度出さない：二度目の台詞を含む文を外す（報告 8） */
  function dedupQuote(t) {
    var seen = {};
    return t.split('\n\n').map(function (p) {
      return sents(p).filter(function (x) {
        var qs = x.match(/「[^「」]{5,}」/g) || [], dup = qs.some(function (q) { var k = q.replace(/[\u2060＠\s]/g, ''); return k.length > 6 && seen[k] && !isMoan(k.slice(1, -1)); });
        if (dup) return false;
        qs.forEach(function (q) { seen[q.replace(/[\u2060＠\s]/g, '')] = 1; });
        return true;
      }).join('');
    }).filter(function (p) { return /\S/.test(p); }).join('\n\n');
  }
  /* 二度目以降の終点前のきっかけ：昨日・その前の日にも山場があったときだけ「昨日」「その前の日も」と書く（報告 3） */
  function againLead(S, p) {
    var pd = p.peakDays || {}, y = !!pd[S.day - 1], y2 = y && !!pd[S.day - 2];
    var l = (X.LEAD_AGAIN || []).filter(function (x) { return (y || !/昨日/.test(x)) && (y2 || !/その前の日/.test(x)); });
    return l.concat(X.LEAD_AGAIN_GAP || []);
  }
  /* 山場の始まりの段：乗客が攻めなら、その乗客の性格の動き（D.SC_MOB の o）。空いている車内では人の陰・人の壁の文を使わない */
  function openFor(S, mode, m) {
    var V = m && m.prof && D.SC_MOB ? mobTab('SC_MOB', m) : null, l = V && V.o ? V.o : X.OPEN[mode];
    if (S.v.crowd === 'sparse') l = keep(l, function (x) { return !/人の(?:陰|波|壁)|周りの乗客が|肩を寄せ合/.test(x); });
    return pk(S, l);
  }
  /* 労いの輪・終わったあとの周りの乗客：混み具合・路線ごと（空いている車内はいつも空いた車内の文） */
  function crowdPool(S) { var v = S.v, l = X.CROWD_V; if (!l) return X.CROWD; if (v.crowd === 'sparse' && l.sparse) return l.sparse; return l[v.line] && S.rng() < 0.5 ? l[v.line] : X.CROWD; }
  function after2Pool(S) { var v = S.v, l = X.SC_AFTER2_V; if (!l) return X.SC_AFTER2; if (v.crowd === 'sparse' && l.sparse) return l.sparse; return l[v.line] && S.rng() < 0.5 ? l[v.line] : X.SC_AFTER2; }
  /* 常識にすっかり馴染む（NO 12(d)。マッサージの快楽堕ちの型：陥落 → 本当の施術 → 延長のおねだり に合わせて、
     馴染む（きっかけの段）→ 自分から次の乗客に体を寄せる → 「次の駅まで、もう一度」とねだる）。受ける側で、常識の中にいて、
     かかり具合が高く違和感が小さく、その日に段「自分から導く」より先まで乗り気で進んだ人。深い展開（車内に残される・ホテル）は書かない */
  function meltCheck(S, p) {
    if (p.top || p.melted || p.state !== 'norm' || p.branch || (p.stgBest || 0) < 3 || p.stg < 3) return;
    if (p.m.imm < 84 || p.m.doubt >= 25 || !(p.cnt.peak >= 2 || S.v.days === 1)) return;
    var pr = clamp(0.35 + p.tr.ac * 0.25 + p.tr.fc * 0.2 + (p.willK - 1) * 0.5 + (p.m.imm - 84) / 40 - p.tr.a * 0.2, 0.1, 0.85);
    if (S.rng() >= pr) return;
    var m2 = newMob(S, p, true);
    if (!m2) return;
    var V = { a: p.name, o: p.name };
    lead(S, [p], fm(pk(S, D.MELT_IN[ps(p)]), V), '常識にすっかり馴染んだ（かかり具合 ' + Math.round(p.m.imm) + '・違和感 ' + Math.round(p.m.doubt) + '・段「' + D.STG_NAME[Math.min(4, p.stg)] + '」まで乗り気で進んだ・起きやすさ ' + Math.round(pr * 100) + '%）。言い出したのは' + p.name);
    var t = fm(pk(S, D.MELT_BEG), V) + fm(fresh(S, D.MELT_SAY[ps(p)]), V) + '\n\n' + fm(fresh(S, prof(m2, 'q'), D.ASK_GEN), V) + fm(pk(S, D.MELT_GO), V);
    p.melted = S.day; p.m.imm = 98; p.m.doubt = Math.min(p.m.doubt, 10);
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'melt', d: S.day, who: p.i });
    var o = say(S, { actors: [p], tag: 'おねだり', lewd: true, text: mobFmt(t, m2), why: p.name + 'は自分から次の乗客に体を寄せた（「次の駅まで、もう一度」）', mag: 26 });
    ST.key(S, o, p.name + 'が常識にすっかり馴染んだ');
  }
  /* 4回目からの終点前：毎日の習慣として短く（場面は描かない） */
  function shortPeak(S, p) {
    p.cnt.peak++; p.peakToday = true; (p.peakDays = p.peakDays || {})[S.day] = 1; p.m.plea = 20; p.m.imm = clamp(p.m.imm + (p.branch === 'thrill' ? 0 : 6), 0, 98);
    /* 住人が攻め：攻めが乗客を責める一幕を 1 段で（2026-11-05 の利用者の指示「ほとんどの日で出る」） */
    if (p.top && X.PEAK_SHORT_TOP && S.lv !== 'low') {
      var m = p.pax || newMob(S, p), md = modeOf(p, m), l = X.PEAK_SHORT_TOP[md] || X.PEAK_SHORT_TOP.mf;
      if (md === 'fm' && !hasM(m)) l = X.PEAK_SHORT_TOP.ff;
      if (S.v.crowd === 'sparse') l = keep(l, function (x) { return !/人の(?:陰|波|壁)/.test(x); });
      return say(S, { actors: [p], tag: '終点前', lewd: true, text: mobFmt(fm(pk(S, l), { a: p.name, d: S.day, end: S.v.LN.end, m: '{m}' }), m), why: p.name + 'の終点前（' + p.cnt.peak + '回目。4回目からは短く・' + p.name + 'から' + m.name + 'に）' });
    }
    say(S, { actors: [p], tag: '終点前', text: fm(pk(S, D.PEAK_SHORT), { a: p.name, d: S.day, end: S.v.LN.end }), why: p.name + 'の終点前（' + p.cnt.peak + '回目。4回目からは短く）' });
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
    lead(S, [T, U], lt, '終点前のマナー（連れどうし・' + relJa(S, S.rel) + '）・言い出したのは' + T.name);
    var text = S.lv === 'low' ? fm(pk(S, X.FADE), V) : longScene(S, T, U, { car: true, open: openFor(S, mode, null), after: pk(S, after2Pool(S)), direct: (S.pairStg || 0) >= 1 }) + '\n\n' + fm(rx(S, X.PEAK_B[ps(U)]), V);
    text = dedupQuote(text);
    [T, U].forEach(function (p) { p.cnt.peak++; p.peakToday = true; (p.peakDays = p.peakDays || {})[S.day] = 1; p.m.plea = 20; p.m.reason = clamp(p.m.reason - 5, 0, 100); });
    S.pairPeak = (S.pairPeak || 0) + 1; S.bonded = S.bonded || (loveOk(S, T, U) && bondRel(S)); S.bodied = true;
    if (D.DEBUG) (S._dbg = S._dbg || []).push({ k: 'peak', d: S.day, soft: false, ins: S.lv !== 'low' });
    var o = say(S, { actors: [T, U], tag: '山場', lewd: true, text: text, why: '終点直前の満員車両で、連れどうし（' + T.name + 'が攻め・' + { mf: '男性の体の攻め', ff: '女性どうし', fm: '女性の攻め×男性' }[mode] + '）', mag: 30 });
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
    var o = say(S, { actors: [T, R], tag: '迎え', text: t, why: T.name + 'は攻めの指定なので、触れ合われる側にはならない。途中の' + nx + 'で乗ってきて、' + R.name + 'を「連れ」として引き寄せた（' + { high: '性欲が強い', low: '性欲が弱い', jeal: '嫉妬しやすい', calm: '落ち着いている' }[kind] + '）', mag: 24 });
    if (!S.firstPick) { S.firstPick = true; ST.key(S, o, T.name + 'が' + R.name + 'を引き寄せた'); }
    /* 火照った体の連れとエッチするか：関係・攻めの性欲・嫉妬・連れの快楽で */
    var ok = S.pairOk && HK.Pos.order(T, R)[0] === T && R.m.plea >= 25;
    var pr = ok ? clamp({ lover: 0.7, fwb: 0.7, crush: 0.42, friend: 0.2, kin: 0.2, foe: 0.15, work: 0.2, stranger: 0.1 }[S.rel] * T.libK * (kind === 'jeal' ? 1.25 : 1) * (0.6 + R.m.plea / 100) * (R.state === 'awake' && R.branch !== 'thrill' ? 0.4 : 1) * (S.lv === 'low' ? 0.7 : 1), 0, 0.92) : 0;
    if (ok && rng() < pr) rescueNight(S, T, R, kind, pr);
    else {
      var cl = kind === 'low' || kind === 'calm' ? (rng() < 0.5 ? D.T_CALM : D.T_HOME) : rng() < 0.55 ? D.T_LATER : D.T_HOME;
      say(S, { actors: [T, R], tag: '引き寄せたあと', text: fm(pk(S, cl), V), why: ok ? '今日は夜にはしなかった（' + relJa(S, S.rel) + '・起きやすさ ' + Math.round(pr * 100) + '%）' : '体の関係にならない二人' + (S.pairOk ? '（連れの火照りが小さい）' : '（恋愛対象・受け攻め・関係の設定）') });
      R.m.plea = clamp(R.m.plea * 0.5, 0, 100);
    }
    if (T.m.doubt >= 30 && !T.dSaid) { T.dSaid = true; say(S, { actors: [T], tag: '違和感', text: fm(pk(S, D.T_DOUBT), V), why: T.name + 'の違和感 ' + Math.round(T.m.doubt) }); }
    /* 引き寄せた側が覚める（マナーなのに、なぜ嫌だったのか） */
    if (T.state !== 'awake' && T.m.doubt >= 55 && rng() < clamp((T.m.doubt + T.m.reason * 0.3 - T.m.imm * 0.5) / 100, 0.05, 0.9)) {
      T.state = 'awake'; T.cnt.wake++; T.branch = 'pick';
      var o2 = say(S, { actors: [T], tag: '覚める', text: fm(pk(S, keep(D.WAKE_SEE, function (x) { return !/自分の体の上にある手/.test(x); })), { a: T.name }) + (wakeLines(T, 'pick').length ? '\n\n' + fm(pk(S, wakeLines(T, 'pick')), { a: T.name }) : ''), why: T.name + 'は連れを引き寄せた理由に気づいて、覚めた', mag: 26 });
      ST.key(S, o2, T.name + 'が覚めた');
    }
    /* 覚めた側から、連れに伝える */
    if (T.state === 'awake' && R.state !== 'awake' && !T.toldR) {
      T.toldR = true;
      var okT = rng() < clamp(0.2 + R.m.doubt / 110 + R.tr.a * 0.2 - R.m.imm / 250 - R.m.plea / 300, 0.05, 0.85);
      say(S, { actors: [T, R], tag: '気づかせる', text: fm(pk(S, D.TELL), { a: T.name, c: R.name }) + '\n\n' + fm(pk(S, okT ? D.TELL_OK : D.TELL_NG), { a: T.name, c: R.name }), why: T.name + 'は' + R.name + 'に気づかせようとした→' + (okT ? '伝わった' : '伝わらなかった'), mag: 20 });
      if (okT) { R.state = 'awake'; R.cnt.wake++; R.branch = 'off'; R.toldBy = T; }
    }
  }
  function rescueNight(S, T, R, kind, pr) {
    var mode = modeOf(T, R), rel = S.rel, V = { r: T.name, o: R.name, k: rel === 'kin' ? S.kinW || '家族' : S.relW || '知り合い' };
    lead(S, [T, R], fm(pk(S, rel === 'kin' ? KIN_T.rescue : (rel === 'foe' || rel === 'work') ? X.LEAD_RESCUE_X[rel] : X.LEAD_RESCUE[rel]), V) + (X.LEAD_RESCUE_T[kind] && X.LEAD_RESCUE_T[kind].length && X.LEAD_RESCUE_T[kind][0] ? fm(pk(S, X.LEAD_RESCUE_T[kind]), V) : ''), '車内で火照った体のまま、' + T.name + 'に引き寄せられて降りた（' + relJa(S, rel) + '・' + { high: '攻めの性欲が強い', low: '攻めの性欲が弱い', jeal: 'ほかの乗客に触れられたのを気にした', calm: '攻めは落ち着いていた' }[kind] + '・起きやすさ ' + Math.round(pr * 100) + '%）');
    var text = S.lv === 'low' ? fm('その夜、{r}と{o}は灯りを落とした部屋で、車内の熱の続きを分け合った。翌朝、{o}の首筋には、{r}の残した小さな跡があった。', V) : longScene(S, T, R, { car: false, open: pk(S, X.OPEN_ROOM[mode]), after: rel === 'kin' ? fm(pk(S, KIN_T.after), { k: S.kinW || '家族' }) : (rel === 'foe' || rel === 'work') ? fm(pk(S, X.AFTER_RESCUE_X[rel]), { a: '{a}', b: '{b}', k: S.relW || '知り合い' }) : pk(S, X.AFTER_RESCUE[rel]) });
    T.cnt.night++; R.cnt.night++; R.m.plea = 15; S.rescueNight = (S.rescueNight || 0) + 1;
    if (loveOk(S, T, R) && bondRel(S)) S.bonded = true; S.bodied = true;
    var o = say(S, { actors: [T, R], tag: '夜', lewd: true, text: text, why: T.name + 'が攻め（攻めの指定）・' + R.name + 'は車内の熱のまま', mag: 30 });
    if (S.rescueNight === 1) ST.key(S, o, T.name + 'と' + R.name + 'の夜');
  }

  /* ---------- 結末 ---------- */
  var FATE_JA = { melt: '常識にすっかり馴染んだ（毎朝その車両を選ぶ）', sink: '常識に馴染んだ', resunk: '一度覚めて、また常識に戻った', unease: '違和感を抱えたまま', between: '気づいたまま乗り続ける', switch: '別の路線に変えた', report: '通報した', reportFlow: '通報して、流された', thrill: '気づいたうえでスリルを選んだ', silent: '言い出せないまま', offday: '途中で降りた', follow: '覚めた連れと一緒に降りる（常識の中のまま）', pick: '連れを迎えに行く人', pickMiss: '迎えに行ったが、会えなかった' };
  function fateOf(S, p) {
    if (p.switched) return 'switch';
    /* 連れの住人と乗る日に、覚めた連れと一緒に降りた人（まだ常識の中） */
    var oth = S.P.filter(function (x) { return x !== p; })[0];
    if (linked(S) && p.followed && p.state !== 'awake' && oth && oth.state === 'awake') return 'follow';
    /* 迎えに行く人の結末は、迎えの場面が本文に出たとき（cnt.pick）だけ（NO 15）。一度も出なければ「会えなかった」 */
    if (S.mode === 'rescue' && p === S.T && !(p.cnt.pick > 0)) return 'pickMiss';
    if (S.mode === 'rescue' && p === S.T && p.state !== 'awake') return 'pick';
    if (p.state === 'awake') {
      if (p.branch === 'report') return p.reportFlow ? 'reportFlow' : 'report';
      if (p.branch === 'thrill') return 'thrill';
      if (p.branch === 'silent') return 'silent';
      if (p.branch === 'off' && p.cnt.off && S.day <= (p.wakeDay || 0)) return 'offday';
      return 'between';
    }
    if (p.melted) return 'melt';
    if (p.cnt.resink) return 'resunk';
    if (p.m.doubt >= 40) return 'unease';
    return 'sink';
  }
  function finish(S, input) {
    var P = S.P, v = S.v, LN = v.LN;
    P.forEach(function (p) {
      p.fk = fateOf(S, p);
      /* 連れの住人と乗る日に二人で降りたことがあるなら、覚めた人の結末を「乗り続ける」にしない（もう一人と食い違わないように） */
      if (p.fk === 'between' && linked(S) && S.linkOff) p.fk = 'offday';
      p.fate = FATE_JA[p.fk];
      p.notes.push('乗った日 ' + p.cnt.rides + '日・触れ合い ' + p.cnt.touch + '回・終点前の山場 ' + p.cnt.peak + '回' + (p.cnt.night ? '・二人の夜 ' + p.cnt.night + '回' : ''));
      p.notes.push('違和感 ' + Math.round(p.m.doubt) + '／かかり具合 ' + Math.round(p.m.imm) + (p.cnt.wake ? '・覚めた ' + p.cnt.wake + '回' : '') + (p.cnt.resink ? '・かかり直し ' + p.cnt.resink + '回' : '') + (p.cnt.report ? '・通報 ' + p.cnt.report + '回' : ''));
      p.notes.push('行動「' + p.action.label + '」・乗る理由「' + p.goal.label + '」' + (p.goalNow ? '（2 日目からは「' + ({ work: '通勤', home: '帰宅' }[p.goalNow] || '') + '」）' : '') + '・' + (p.top ? '乗客には自分からする側' : '乗客には受け入れる側'));
    });
    var duo = P.length === 2, a = P[0], b = P[1], title, lines = [];
    ST.step(S, 'その後');
    P.forEach(function (p) {
      var pool = (v.line === 'night' && D.FATE_NIGHT && D.FATE_NIGHT[p.fk]) || D.FATE[p.fk] || D.FATE.sink;
      if (p.fk === 'pick') pool = v.line === 'night' && D.FATE2_NIGHT ? D.FATE2_NIGHT.picker : D.FATE2.picker;
      if (p.fk === 'pickMiss') pool = D.FATE2.pickMiss;
      var t = fm(pk(S, pool), { a: p.name, c: duo ? (p === a ? b.name : a.name) : '' });
      if (p.fk === 'switch') t = fm(pk(S, v.line === 'night' && D.GONE_NIGHT ? D.GONE_NIGHT : D.GONE), { a: p.name });
      if (p.fk === 'switch' && p.followed && p.state !== 'awake' && D.FATE_FOLLOW_SW) t = fm(pk(S, D.FATE_FOLLOW_SW), { a: p.name, c: duo ? (p === a ? b.name : a.name) : '' });
      say(S, { actors: [p], tag: 'その後', text: t, why: p.name + 'の結末：' + p.fate });
      lines.push(p.name + '（' + p.roleLabel + '）：' + p.fate);
    });
    if (duo) {
      /* どちらかが路線を変えた（もう乗らない）なら、二人で並んで乗る結び（結ばれた・体を重ねた・二人で降りた）は出さない */
      var away = P.some(function (p) { return p.gone; });
      var k2 = S.bonded && !away ? 'bond' : S.bodied && !away && D.FATE2_BODY ? 'body' : S.bothOff && !away ? 'bothOff' : S.linkOff && D.FATE2.linkOff && P.some(function (p) { return p.state === 'awake'; }) ? 'linkOff' : P.some(function (p) { return p.triedDuo; }) ? 'tried' : '';
      if (S.mode === 'rescue' && S.rescueNight && S.bonded && !away) k2 = 'bond';
      if (away) k2 = '';
      if (k2) {
        var w = k2 === 'tried' ? P.filter(function (p) { return p.triedDuo; })[0] : k2 === 'linkOff' ? P.filter(function (p) { return p.state === 'awake'; })[0] : a, c = w === a ? b : a;
        var f2 = k2 === 'body' ? D.FATE2_BODY : v.line === 'night' && D.FATE2_NIGHT && D.FATE2_NIGHT[k2] ? D.FATE2_NIGHT[k2] : D.FATE2[k2];
        say(S, { actors: [a, b], tag: 'ふたり', text: fm(pk(S, f2), { a: w.name, c: c.name }), why: { bond: '連れと結ばれた', body: '連れと体を重ねた（' + relJa(S, S.rel) + 'のまま）', bothOff: '二人で気づいて降りた', tried: '一人だけ覚めて、連れに気づかせようとした', linkOff: '気づいた連れと、もう一人も一緒に降りた' }[k2] });
        lines.push({ bond: a.name + 'と' + b.name + '：連れと結ばれた', body: a.name + 'と' + b.name + '：連れと体を重ねた（' + relJa(S, S.rel) + 'のまま）', bothOff: a.name + 'と' + b.name + '：二人で気づいて降りた', tried: w.name + '：一人だけ覚めて、' + c.name + 'に気づかせようとした', linkOff: w.name + 'と' + c.name + '：' + w.name + 'が気づき、' + c.name + 'も一緒に降りた' }[k2]);
      }
      if (!S.pairOk && (S.mode === 'rescue' || v.partner === 'pair')) {
        var dd = HK.Pos && HK.Pos.noSexInfo ? HK.Pos.noSexInfo(a, b, { room: false, lib: true, ties: input.ties }) : null;
        lines.push(a.name + 'と' + b.name + 'は体の関係にならない組（' + (dd ? dd.t + (dd.fix ? '。直し方：' + dd.fix : '') : '恋愛対象・受け攻め・関係の設定') + '）。');
      }
    }
    var woke = P.filter(function (p) { return p.state === 'awake'; }), sank = P.filter(function (p) { return /^(sink|resunk|melt)$/.test(p.fk); }), melt = P.filter(function (p) { return p.fk === 'melt'; });
    if (duo && S.bonded) title = a.name + 'と' + b.name + 'は、満員電車の常識の中で結ばれた。';
    else if (duo && S.bodied && !P.some(function (p) { return p.gone; })) title = a.name + 'と' + b.name + 'は、満員電車の常識の中で体を重ねた。';
    else if (duo && S.bothOff) title = a.name + 'と' + b.name + 'は、二人で気づいて電車を降りた。';
    else if (duo && S.linkOff && woke.length === 1) title = woke[0].name + 'が気づき、' + P.filter(function (p) { return woke.indexOf(p) < 0; })[0].name + 'も一緒に電車を降りた。';
    else if (woke.length === P.length) title = names(woke) + (P.length > 1 ? 'は二人とも' : 'は') + '、違和感に気づいて覚めた。';
    else if (woke.length) title = names(woke) + 'だけが覚めた。' + names(P.filter(function (p) { return woke.indexOf(p) < 0; })) + 'は、今日も同じ車両に乗っている。';
    else if (melt.length === P.length) title = '「' + LN.name + '」は今日も満員。' + names(P) + 'は、常識にすっかり馴染んだ ― 「次の駅まで、もう一度」';
    else if (sank.length === P.length) title = '「' + LN.name + '」は今日も満員。' + names(P) + 'は、流され続けた。';
    else title = '「' + LN.name + '」は今日も満員。' + names(P) + 'は、違和感の手前で揺れている。';
    var kind = woke.length ? 'ok' : 'over';
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [p.roleLabel, p.cnt.rides + '日', String(p.cnt.peak + p.cnt.night), String(Math.round(p.m.doubt)), String(Math.round(p.m.imm)), p.fate] }; });
    /* 関係図（2人のとき）：設定の関係と、この箱庭で結ばれた・体を重ねた二人（★） */
    var relmap = null;
    if (duo) {
      var edges = (S.ties || []).map(function (t0) { return { a: t0.a, b: t0.b, label: HK.tieLabel ? HK.tieLabel(t0) : (HK.TIES[t0.type] || {}).label || t0.type, cls: /^(lover|mate|fated)$/.test(t0.type) ? 'love' : t0.type === 'fwb' ? 'night' : 'friend', dir: null }; });
      if (S.bonded) edges.push({ a: a.i, b: b.i, label: '★結ばれた', cls: 'love', dir: null });
      else if (S.rescueNight || (S.pairPeak && S.pairPeak > (S.softPeak || 0)) || S.wokeNight) edges.push({ a: a.i, b: b.i, label: '★体を重ねた', cls: 'night', dir: null });
      else if (S.softPeak) edges.push({ a: a.i, b: b.i, label: '★触れ合った', cls: 'night', dir: null });
      relmap = { nodes: P.map(function (p) { return { i: p.i, name: p.name, sub: p.fate }; }), edges: edges, note: '★はこの箱庭で生まれた関係。' };
    }
    if (D.DEBUG) D._last = { dbg: S._dbg || [], reuse: S._mobReuse || 0, pairOk: S.pairOk, pairSoft: S.pairSoft, mode: S.mode, fk: P.map(function (p) { return p.fk; }), src: S._src || null, mv: S._mvS || null, sf: S._sfv || null, sfx: S._sfx || null };
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
