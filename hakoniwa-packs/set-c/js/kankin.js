/* ヤンデレ監禁の部屋（追加パック set-c の部屋。日常型（エンジン型）。R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/kankin-design.md・set-c-design.md の 3-1）
   二人（閉じ込める側 A・閉じ込められる側 B）。期間（5〜30 日）を朝・日中・夜の 3 区切りで眺める。
   ・土台は合意（set-c-design.md の 0-2）：B は本音の計器 want を持ち（上がるだけ）、線（WANT_LINE）を越えた二人にだけ体の場面が起きる（kankin-r18.js）。
     越えていなければ、言葉・鍵・鎖・見つめ合いの心理の段で止まる。きっかけの段には「止められたのに止めなかった一文」を必ず入れる。
   ・計器（巻き戻らない。HK.DarkKit.gauge）：恐怖 fear（上がる）・抵抗 resist（下がる）・正気 sane（下がる）・快楽 pleasure（上がる）・本音 want（上がる）・
     怖さの段 dark（上がる：優しい顔 → 嫉妬 → 薬・合鍵 → 塞ぐ → 豹変）・堕ちの段 fall（0 まだ／1 慣れ／2 求める／3 溺れる）・執着 obsess
   ・分かれ道：A は 懐柔 kaijo／薬 drug（薬「入」のときだけ）／追い詰め oitsume／豹変 hyohen、B は 従う obey／嘘で取り入る lie／脱出 escape／拒む refuse（態度 9 種 → 既定、運命の揺らぎでらしくない方へ）
   ・山場：逃げ出そうとして見つかった夜のお仕置き。結末 6：壊れて溺れる／脱出（通報・見逃される）／共依存の楽園／立場の逆転／救出／心中（死ネタのスイッチが入のときだけ）
   文は kankin-text-a.js・-b.js・-c.js（HK.KankinText）。部品は HK.DarkKit（kit）。本体の共通の出来事は混ぜない（actRate ≒ 0・exclude）。登場人物はすべて成人として扱う */
/* @event scen=set-c-kankin id=kk_intro cat=bond tie=- label=閉ざされた部屋で二人きりの日々が始まる */
/* @event scen=set-c-kankin id=kk_wake cat=bond tie=- label=閉ざされた部屋で迎える朝 */
/* @event scen=set-c-kankin id=kk_breakfast cat=bond tie=- label=差し出された朝食を口にする */
/* @event scen=set-c-kankin id=kk_chaincheck cat=bond tie=- label=朝いちばんに鎖と鍵を確かめる */
/* @event scen=set-c-kankin id=kk_wash cat=bond tie=- label=顔を拭き髪を梳かす朝の身支度 */
/* @event scen=set-c-kankin id=kk_clothes cat=bond tie=- label=着る服を選び与えられる朝 */
/* @event scen=set-c-kankin id=kk_window cat=bond tie=- label=板の隙間から外の気配を探る */
/* @event scen=set-c-kankin id=kk_count cat=bond tie=- label=閉じ込められた日数を数える */
/* @event scen=set-c-kankin id=kk_leave cat=bond tie=- label=買い出しに出る背中を見送る */
/* @event scen=set-c-kankin id=kk_gift cat=bond tie=- label=好みを知り尽くした贈り物 */
/* @event scen=set-c-kankin id=kk_photo cat=bond tie=- label=壁一面の隠し撮りの写真 */
/* @event scen=set-c-kankin id=kk_cook cat=bond tie=- label=閉ざされた部屋の台所と手料理 */
/* @event scen=set-c-kankin id=kk_read cat=bond tie=- label=枕元で本を読み聞かせる */
/* @event scen=set-c-kankin id=kk_bath cat=bond tie=- label=湯に浸かる体を洗い流す */
/* @event scen=set-c-kankin id=kk_memory cat=bond tie=- label=出会った日の思い出を語る */
/* @event scen=set-c-kankin id=kk_rule cat=bond tie=- label=部屋の決まりが一つ増える */
/* @event scen=set-c-kankin id=kk_care cat=bond tie=- label=鎖や布の跡を手当てする */
/* @event scen=set-c-kankin id=kk_test cat=bond tie=- label=わざと開けておかれた鍵を試される */
/* @event scen=set-c-kankin id=kk_alone cat=bond tie=- label=留守のあいだひとりで待つ */
/* @event scen=set-c-kankin id=kk_letter cat=bond tie=- label=外への手紙を書かされる */
/* @event scen=set-c-kankin id=kk_tv cat=bond tie=- label=並んで映画や音楽を聴く */
/* @event scen=set-c-kankin id=kk_watch cat=bond tie=- label=眠る顔をいつまでも見つめられる夜 */
/* @event scen=set-c-kankin id=kk_talk cat=bond tie=- label=暗がりで交わす問いと答え */
/* @event scen=set-c-kankin id=kk_hold cat=bond tie=- label=抱きすくめられて眠る夜 */
/* @event scen=set-c-kankin id=kk_nightmare cat=bond tie=- label=うなされて目を覚ます夜 */
/* @event scen=set-c-kankin id=kk_lock cat=bond tie=- label=夜更けに鍵を確かめて回る音 */
/* @event scen=set-c-kankin id=kk_beg cat=bond tie=- label=帰してほしいと懇願する夜 */
/* @event scen=set-c-kankin id=kk_confess cat=bond tie=- label=灯りを落とした部屋での告白 */
/* @event scen=set-c-kankin id=kk_star cat=bond tie=- label=窓のない部屋の偽物の星空 */
/* @event scen=set-c-kankin id=kk_phone cat=bond tie=- label=外からの連絡と監視の手 */
/* @event scen=set-c-kankin id=kk_search cat=bond tie=- label=外で捜索の手が近づく気配 */
/* @event scen=set-c-kankin id=kk_a_kaijo cat=bond tie=- label=優しさで囲い込まれる一日 */
/* @event scen=set-c-kankin id=kk_a_drug cat=bond tie=- tags=night label=薬入りの杯を自分の手で飲み干す */
/* @event scen=set-c-kankin id=kk_a_oitsume cat=bond tie=- label=逃げ場を言葉で塞がれていく */
/* @event scen=set-c-kankin id=kk_a_hyohen cat=bond tie=- label=優しい顔が一瞬で豹変する */
/* @event scen=set-c-kankin id=kk_b_obey cat=bond tie=- label=怖がって言いつけに従う */
/* @event scen=set-c-kankin id=kk_b_lie cat=bond tie=- label=取り入るために甘えてみせる */
/* @event scen=set-c-kankin id=kk_b_escape cat=bond tie=- label=脱出の手立てをひそかに探る */
/* @event scen=set-c-kankin id=kk_b_refuse cat=bond tie=- label=食事も言葉も拒み続ける */
/* @event scen=set-c-kankin id=kk_dark1 cat=bond tie=- label=外の人の名前に嫉妬が芽生える */
/* @event scen=set-c-kankin id=kk_dark2 cat=bond tie=- label=飲み物の味が変わり合鍵が消える */
/* @event scen=set-c-kankin id=kk_dark3 cat=bond tie=- label=逃げ道が一つずつ塞がれる */
/* @event scen=set-c-kankin id=kk_dark4 cat=bond tie=- label=優しさの下の顔が露わになる夜 */
/* @event scen=set-c-kankin id=kk_escape cat=bond tie=- label=隙を突いて部屋から逃げ出す */
/* @event scen=set-c-kankin id=kk_caught cat=bond tie=- label=逃げ出したところを見つかる */
/* @event scen=set-c-kankin id=kk_back cat=bond tie=- label=開いた扉の前で足が止まる */
/* @event scen=set-c-kankin id=kk_lie_found cat=bond tie=- label=取り入るための嘘が見破られる */
/* @event scen=set-c-kankin id=kk_lie_hold cat=bond tie=- label=嘘の甘えで主導権を握りかける */
/* @event scen=set-c-kankin id=kk_fall1 cat=bond tie=- label=足音を怖がらなくなった日 */
/* @event scen=set-c-kankin id=kk_fall2 cat=bond tie=- label=出かける袖を掴んで離さない夜 */
/* @event scen=set-c-kankin id=kk_fall3 cat=bond tie=- label=差し出された鍵を受け取らない */
/* @event scen=set-c-kankin id=kk_sane1 cat=bond tie=- label=自分の名前の字を一瞬忘れる */
/* @event scen=set-c-kankin id=kk_sane2 cat=bond tie=- label=壁の写真に話しかけるようになる */
/* @event scen=set-c-kankin id=kk_sane3 cat=bond tie=- label=閉じ込められる前の自分を忘れる */
/* @event scen=set-c-kankin id=kk_oshioki cat=bond tie=- tags=force label=逃げた夜に心を縛られるお仕置き */
/* @event scen=set-c-kankin id=kk_noyoru cat=bond tie=- label=体を求めずに心だけを求めた理由 */
/* @event scen=set-c-kankin id=kk_end_broken cat=bond tie=- label=心が壊れて相手だけに溺れる結末 */
/* @event scen=set-c-kankin id=kk_end_escape cat=bond tie=- label=閉ざされた部屋から抜け出す結末 */
/* @event scen=set-c-kankin id=kk_end_kyoizon cat=bond tie=- label=互いだけを見て暮らす共依存の結末 */
/* @event scen=set-c-kankin id=kk_end_gyakuten cat=bond tie=- label=閉じ込める側と立場が逆転する結末 */
/* @event scen=set-c-kankin id=kk_end_rescue cat=bond tie=- label=外からの捜索の手に救い出される結末 */
/* @event scen=set-c-kankin id=kk_end_shinju cat=bond tie=- tags=death label=二人で静かに終わりを選ぶ結末 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.SCENARIOS) return;
  var DK = HK.DarkKit, ID = 'set-c-kankin';
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  var WANT_LINE = 50;
  function TX() { return HK.KankinText || {}; }
  function S_(ctx) { return ctx.kk; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function rnd(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : null; }

  /* ---------- 関係（名簿の関係のまま） ---------- */
  var GRP_OF = { spouse: 'love', lover: 'love', fiance: 'love', mate: 'love', fated: 'love', honmei: 'love', fwb: 'body',
    almost: 'pine', crush: 'pine', yan: 'pine', ex: 'ex', friend: 'friend', best: 'friend', buddy: 'friend', childhood: 'friend', classmate: 'friend', comrade: 'friend', benefactor: 'friend',
    colleague: 'work', boss: 'work', senpai: 'work', teacher: 'work', mentor: 'work', master: 'work', worship: 'work',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'fam',
    enemy: 'bad', bad: 'bad', rival: 'bad', lovehate: 'bad', abuse: 'bad', acq: 'stranger' };
  var GRP_ORD = ['love', 'body', 'pine', 'ex', 'bad', 'fam', 'friend', 'work', 'stranger'];
  var GRP_NAME = { love: '恋人', body: '体だけの関係', pine: '想いを抱えた二人', ex: '昔の恋人', friend: '友人', work: '仕事の間柄', fam: '家族同然', bad: '不仲', stranger: 'ほとんど知らない相手' };
  var WANT0 = { love: 72, body: 70, pine: 62, ex: 50, friend: 48, fam: 45, work: 44, bad: 40, stranger: 35 };
  function grpOf(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = 'stranger';
    tl.forEach(function (t) { if (!t || t.type === 'noobs') return; var g = GRP_OF[t.type] || 'friend'; if (GRP_ORD.indexOf(g) < GRP_ORD.indexOf(best)) best = g; });
    return best;
  }

  /* ---------- 行の札（鎖・連絡・捜索・薬・病み方・態度）を when にする ---------- */
  var CONV = typeof WeakMap === 'function' ? new WeakMap() : null;
  function has(list, v) { return list == null || list === '' || String(list).split(/\s+/).indexOf(v) >= 0; }
  function conv(rows) {
    if (!rows) return [];
    if (CONV && CONV.has(rows)) return CONV.get(rows);
    var out = rows.map(function (r) {
      if (typeof r === 'string') return { t: r };
      var w0 = r.when, x = { t: r.t, st: r.st, w: r.w };
      x.when = function (ctx, S, a, b) {
        if (!S) return true;
        if (!has(r.ch, S.chain) || !has(r.ct, S.contact) || !has(r.sr, S.search) || !has(r.dr, S.drug ? 'on' : 'off') || !has(r.ty, S.ty)) return false;
        if (r.per && !has(r.per, S.perA)) return false;
        if (r.bper && !has(r.bper, S.perB)) return false;
        return !w0 || w0(ctx, S, a, b);
      };
      return x;
    });
    if (CONV) CONV.set(rows, out);
    return out;
  }
  function pk(ctx, S, rows, o) { o = o || {}; return DK.pick(ctx, S, conv(rows), { a: S.A, b: S.B, again: !!o.again, g: o.g }); }
  /* 閉じ込める側の台詞（態度 9 種）・閉じ込められる側の台詞 */
  function aLine(ctx, S, kind) { var L = (TX().AL || {})[kind]; return L ? pk(ctx, S, L[S.perA] || L.gentle) : ''; }
  function bLine(ctx, S, kind) { var L = (TX().BL || {})[kind]; return L ? pk(ctx, S, L) : ''; }
  /* 表情：恐怖が高い受けは fear、深く堕ちた受けは smile_lover、嫉妬の節目の攻めは jealous */
  function faceOf(S, key) {
    var f = {}, fs = DK.stage(S, 'fall'), fr = DK.val(S, 'fear');
    f[S.B.i] = fs >= 3 ? 'smile_lover' : fs >= 2 ? 'shy' : fr >= 70 ? 'fear' : 'normal';
    if (/dark1/.test(key)) f[S.A.i] = 'jealous';
    else if (/hyohen|dark4|caught/.test(key)) f[S.A.i] = 'angry';
    return f;
  }
  /* 出来事一つ：表 T.EV[key] から段の札で引き、{AL}・{BL} を埋めて記録にする */
  function ev(ctx, S, key, o) {
    o = o || {};
    var rows = (TX().EV || {})[key]; if (!rows) return null;
    var t = pk(ctx, S, rows, { g: 'fall', again: o.again });
    if (!t) return null;
    t = t.replace('{AL}', o.al ? aLine(ctx, S, o.al) : '').replace('{BL}', o.bl ? bLine(ctx, S, o.bl) : '');
    var e = DK.say(ctx, { id: 'kk_' + key, cat: 'bond', actors: [S.A, S.B], t: t, a: S.A, b: S.B, why: 'ヤンデレ監禁の部屋：' + (o.why || LABEL[key] || key), face: faceOf(S, key), mag: o.mag || 0, fx: o.fx });
    if (e) S.nEv++;
    return e;
  }
  var LABEL = { wake: '朝', breakfast: '朝食', chaincheck: '鎖と鍵', wash: '身支度', clothes: '服', window: '外の気配', count: '日数', leave: '買い出し', gift: '贈り物', photo: '写真', cook: '手料理',
    read: '読み聞かせ', bath: '風呂', memory: '思い出', rule: '決まり', care: '手当て', test: '試される', alone: '留守番', letter: '手紙', tv: '映画と音楽', watch: '見つめる夜', talk: '暗がりの会話',
    hold: '抱いて眠る', nightmare: 'うなされる', lock: '鍵の音', beg: '懇願', confess: '告白', star: '偽物の星空', phone: '外との連絡', search: '捜索の気配',
    a_kaijo: '優しく懐柔する', a_drug: '薬を差し出す', a_oitsume: '精神的に追い詰める', a_hyohen: '豹変する', b_obey: '怖がって従う', b_lie: '嘘で取り入る', b_escape: '脱出の手立て', b_refuse: '拒み続ける',
    dark1: '怖さの段（嫉妬）', dark2: '怖さの段（薬・合鍵）', dark3: '怖さの段（逃げ道を塞ぐ）', dark4: '怖さの段（豹変）', escape: '脱出を試みる', caught: '見つかる', back: '自分で戻る',
    lie_found: '嘘がばれる', lie_hold: '嘘が続く', fall1: '堕ちの段（慣れ）', fall2: '堕ちの段（求める）', fall3: '堕ちの段（溺れる）', sane1: '正気が揺らぐ', sane2: '正気が薄れる', sane3: '正気が尽きる', oshioki: '逃げた夜のお仕置き（心）' };

  /* ---------- 分かれ道 ---------- */
  var A_TAB = { gentle: 'kaijo', devoted: 'kaijo', polite: 'kaijo', cool: 'oitsume', stern: 'oitsume', shy: 'oitsume', proud: 'hyohen', tsun: 'hyohen', free: 'drug', _: 'kaijo' };
  var B_TAB = { shy: 'obey', gentle: 'obey', devoted: 'obey', free: 'lie', tsun: 'lie', proud: 'refuse', stern: 'refuse', cool: 'escape', polite: 'escape', _: 'obey' };
  var A_NAME = { kaijo: '優しく懐柔する', drug: '薬を飲ませる', oitsume: '精神的に追い詰める', hyohen: '豹変して怖い顔を見せる' };
  var B_NAME = { obey: '怖がって従う', lie: '嘘で取り入る', escape: '脱出を試みる', refuse: '拒み続ける' };
  var TY_NAME = { devote: '献身', bind: '束縛', purge: '排除', depend: '依存' };

  /* ---------- 箱庭 ---------- */
  var SG = { keeper: [['keep', 'そばに置き続ける'], ['smile', '笑顔を自分にだけ向けさせる'], ['name', '名前を呼ばせる']], kept: [['call', '外と連絡をとる'], ['calm', '相手を怒らせない'], ['way', '逃げ道を探す']] };
  var LG = { keeper: [['ever', '永遠に二人きりでいる'], ['heart', '心まで手に入れる'], ['forgive', 'いつか許されたい']], kept: [['home', '外へ帰る'], ['change', '相手を変える'], ['live', 'ここで生きていく']] };
  function gOpts(T0) { var o = []; ['keeper', 'kept'].forEach(function (k) { T0[k].forEach(function (x) { o.push({ id: x[0], label: x[1] + '（' + (k === 'keeper' ? '閉じ込める側' : '閉じ込められる側') + '）' }); }); }); return o; }
  var scen = {
    id: ID, name: 'ヤンデレ監禁の部屋', kicker: 'ふたり・監禁',
    desc: '執着を抱えた一人が、もう一人を閉ざされた部屋に閉じ込める。優しい顔、嫉妬、薬、塞がれていく逃げ道。怯え、従い、嘘をつき、逃げようとする日々の果てに、二人がどこへ行き着くのかを眺める。',
    note: '※二人用（三人目以降は外の人として名前だけ出ます）。R18版だけ。登場人物はすべて成人として扱います。くわしくは「この箱庭のTIPS」に。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 4, r18only: true,
    catBias: { romance: 0.4, bond: 1.2, help: 0.4, conflict: 0.6, combat: 0, betray: 0.2, kill: 0 },
    decay: 0.998, actRate: 1e-9,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '期間', min: 5, max: 30, def: 10, lo: '5日', hi: '30日', unit: '日', desc: '閉じ込められている日数。1日は朝・日中・夜の3区切り。長いほど、正気が尽きる・溺れるところまで進みやすい' },
      { id: 'chain', label: '鎖の長さ', type: 'select', def: 'chain', options: [{ v: 'free', label: '部屋の中は自由（扉と窓だけ開かない）' }, { v: 'chain', label: '鎖で届く範囲（寝台・浴室・居間の半分）' }, { v: 'bed', label: '寝台に繋がれている' }], desc: '閉じ込められる側の自由の幅。朝の身支度・食事・逃げ方・手当ての文が変わる' },
      { id: 'contact', label: '外との連絡', type: 'select', def: 'taken', options: [{ v: 'none', label: 'なし（連絡のとれるものが何もない）' }, { v: 'taken', label: 'スマホを取り上げられている' }, { v: 'watched', label: 'たまに監視つきで返事をさせてもらえる' }], desc: '外からの知らせと、その扱い。毎日の出来事の種になる' },
      { id: 'search', label: '捜索の手', type: 'select', def: 'weak', options: [{ v: 'none', label: 'なし' }, { v: 'weak', label: '弱い（誰かが首をかしげている）' }, { v: 'strong', label: '強い（外で騒ぎになっている）' }], desc: '強いほど、外の気配が部屋に届き、最後に救い出される結末になりやすい' },
      { id: 'sick', label: '病み方', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（閉じ込める側の気質から）' }, { v: 'devote', label: '献身（尽くしすぎる）' }, { v: 'bind', label: '束縛（管理して縛る）' }, { v: 'purge', label: '排除（外の人を消そうとする）' }, { v: 'depend', label: '依存（相手なしでは崩れる）' }], desc: '閉じ込める側の執着の型。怖さの節目の順番と言い回しが変わる' },
      { id: 'drug', label: '薬', type: 'select', def: 'off', options: [{ v: 'off', label: '切' }, { v: 'on', label: '入（差し出された杯を自分で飲む。体が火照る）' }], desc: '入なら、閉じ込める側の分かれ道に「薬を飲ませる」が加わる。眠っているあいだの行為は書かない' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（二人と関係のある名簿の住人の名前が、外の人として出る）' }, { v: 'no', label: '出さない' }], desc: '名簿にいて今回は参加していない住人のうち、二人と関係のある人（三人まで）を、外の人として扱う。関係図には出ない' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（性格と受け攻めから。上の二人が閉じ込める側と閉じ込められる側）', options: [{ id: 'keeper', label: '閉じ込める側' }, { id: 'kept', label: '閉じ込められる側' }, { id: 'guest', label: '外の人' }] },
      { id: 'sgoal', label: '短期目標', auto: 'おまかせ（立場と性格から）', options: gOpts(SG) },
      { id: 'lgoal', label: '長期目標', auto: 'おまかせ（立場と性格から）', options: gOpts(LG) }
    ],
    actions: [], goals: [],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) { var n = clamp(+env.days || 10, 5, 30), s = []; for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]); return s; },
    othersFor: function (ctx, a) { var S = ctx.kk; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '少なめ（1回まで）' }, { v: 'mid', label: 'ふつう（2回まで）' }, { v: 'high', label: '多め（3回まで・一度は長い場面）' }],
    desc: '体の場面の回数の上限。閉じ込められる側の本音（表には出さない気持ち）が線を越えた二人だけに起きる。逃げて見つかった夜は、この部屋でいちばん激しい場面になる。越えないまま終わったときは理由の一文が出る' });
  function exList() { return (HK.COMMON || []).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });

  /* ---------- 始まり ---------- */
  function keeperScore(c) { var t = c.tr || {}; return (t.jealous || 0) * 1.2 + (t.cp || 0) * 0.6 + (t.aggr || 0) * 0.4 + (t.np || 0) * 0.3; }
  function auto(ctx, X, Y) {
    var P = HK.Pos;
    if (P && P.hardTop) { if (P.hardTop(X, Y) && !P.hardTop(Y, X)) return [X, Y]; if (P.hardTop(Y, X) && !P.hardTop(X, Y)) return [Y, X]; }
    if (P && P.canTop) { if (!P.canTop(X, Y) && P.canTop(Y, X)) return [Y, X]; if (!P.canTop(Y, X) && P.canTop(X, Y)) return [X, Y]; }
    return keeperScore(X) >= keeperScore(Y) ? [X, Y] : [Y, X];
  }
  function goalOf(ctx, c, side, kind) {
    var v = DK.part(ctx, c, kind === 's' ? 'sgoal' : 'lgoal'), T0 = (kind === 's' ? SG : LG)[side];
    var hit = T0.filter(function (x) { return x[0] === v; })[0];
    if (hit) return { k: hit[0], t: hit[1], user: true };
    var x = T0[Math.floor(ctx.rng() * T0.length)];
    return { k: x[0], t: x[1] };
  }
  function setup(ctx) {
    var C = DK.cast(ctx, { field: 'part', top: 'keeper', bottom: 'kept', others: ['guest'], auto: auto });
    if (!C) return;
    var A = C.A, B = C.B, env = ctx.env;
    DK.heavyDefault(ctx);
    var days = clamp(+env.days || 10, 5, 30), grp = grpOf(ctx, A, B);
    var O = HK.Obsess, ty = /^(devote|bind|purge|depend)$/.test(env.sick) ? env.sick : (O && O.type ? O.type(A, ctx, B) : 'devote');
    if (!/^(devote|bind|purge|depend)$/.test(ty)) ty = 'devote';
    var S = ctx.kk = { A: A, B: B, G: C.G, days: days, grp: grp, ty: ty, perA: DK.per(A), perB: DK.per(B), noBody: C.noBody, noBodyWhy: C.why,
      chain: /^(free|chain|bed)$/.test(env.chain) ? env.chain : 'chain', contact: /^(none|taken|watched)$/.test(env.contact) ? env.contact : 'taken',
      search: /^(none|weak|strong)$/.test(env.search) ? env.search : 'weak', drug: env.drug === 'on', nEv: 0, k: clamp(10 / days, 0.5, 2), cnt: {}, esc: null, lieFound: false, setHit: 0 };
    var R = DK.R18;
    var firm = R && R.firm ? R.firm(B) : /^(proud|stern|cool)$/.test(S.perB);
    var stance = O && O.stance ? O.stance(ctx, B, A) : '';
    var w0 = WANT0[grp] + (stance === 'accept' || stance === 'mutual' ? 8 : 0) + Math.floor(ctx.rng() * 8);
    DK.gauge(S, 'want', { v: w0, dir: 'up', stages: [WANT_LINE] });
    DK.gauge(S, 'fear', { v: grp === 'stranger' || grp === 'bad' ? 35 : 15, dir: 'up', stages: [30, 60, 85] });
    DK.gauge(S, 'resist', { v: firm ? 95 : S.perB === 'shy' || S.perB === 'gentle' ? 75 : 85, dir: 'down', stages: [60, 35, 10] });
    DK.gauge(S, 'sane', { v: 100, dir: 'down', stages: [70, 40, 0] });
    DK.gauge(S, 'pleasure', { v: 0, dir: 'up', stages: [25, 50, 75] });
    DK.gauge(S, 'dark', { v: 0, dir: 'up', stages: [20, 40, 60, 80] });
    DK.gauge(S, 'fall', { v: 0, max: 3, dir: 'up', stages: [1, 2, 3] });
    DK.gauge(S, 'obsess', { v: Math.max(50, O && O.level ? O.level(ctx, A, B) || 0 : 0), dir: 'up', stages: [60, 80, 95] });
    S.firm = firm;
    /* 分かれ道（薬が切なら「薬を飲ませる」を選ばない） */
    var aKeys = S.drug ? ['kaijo', 'drug', 'oitsume', 'hyohen'] : ['kaijo', 'oitsume', 'hyohen'], at = Object.assign({}, A_TAB);
    if (!S.drug) at.free = 'kaijo';
    S.abr = DK.branch(ctx, A, at, aKeys);
    var bt = Object.assign({}, B_TAB); if (firm && bt[S.perB] === 'obey') bt[S.perB] = 'refuse';
    S.bbr = DK.branch(ctx, B, bt, ['obey', 'lie', 'escape', 'refuse']);
    /* 逃げる日（脱出・拒む・嘘のばれた受け。最後の日の前まで） */
    S.escDay = /^(escape|refuse)$/.test(S.bbr.k) || ctx.rng() < 0.25 ? clamp(Math.floor(days * (0.4 + ctx.rng() * 0.25)), 1, days - 2) : -1;
    S.lieDay = S.bbr.k === 'lie' ? clamp(Math.floor(days * (0.35 + ctx.rng() * 0.3)), 1, days - 2) : -1;
    /* 捜索の日（弱い 1〜2 回・強い 3〜4 回） */
    S.srDays = {};
    var nS = S.search === 'strong' ? 3 + (ctx.rng() < 0.5 ? 1 : 0) : S.search === 'weak' ? 1 + (ctx.rng() < 0.5 ? 1 : 0) : 0;
    for (var i = 0; i < nS; i++) S.srDays[1 + Math.floor(ctx.rng() * (days - 1))] = 1;
    S.gsA = goalOf(ctx, A, 'keeper', 's'); S.glA = goalOf(ctx, A, 'keeper', 'l'); S.gsB = goalOf(ctx, B, 'kept', 's'); S.glB = goalOf(ctx, B, 'kept', 'l');
    ctx.chars.forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; c.autoAction = false; c.autoGoal = false; });
    A.goal = { id: 'kk', label: '短期「' + S.gsA.t + '」／長期「' + S.glA.t + '」' }; B.goal = { id: 'kk', label: '短期「' + S.gsB.t + '」／長期「' + S.glB.t + '」' };
    S.G.forEach(function (g) { g.gone = true; });
    if (HK.KankinR18 && HK.KankinR18.setup) HK.KankinR18.setup(ctx, S);
    ctx.place = A.name + 'の部屋';
    /* 導入：関係 × 閉じ込める側の態度 × 部屋の決まり */
    var Tx = TX(), I = Tx.INTRO || {}, IS = Tx.INTRO_SET || {};
    var t = (rnd(ctx, I[grp] || I.stranger) || '') + (rnd(ctx, (Tx.INTRO_PER || {})[S.perA] || []) || '') + ((IS.chain || {})[S.chain] || '') + ((IS.contact || {})[S.contact] || '') + ((IS.search || {})[S.search] || '');
    DK.say(ctx, { id: 'kk_intro', cat: 'bond', actors: [A, B], t: t, a: A, b: B, mag: 20, why: 'ヤンデレ監禁の部屋：始まり（' + GRP_NAME[grp] + '・病み方は' + TY_NAME[ty] + '）', face: faceOf(S, 'intro') });
  }

  /* ---------- 計器の動き ---------- */
  function fallCalc(S) {
    var x = (100 - DK.val(S, 'resist')) + DK.val(S, 'pleasure') + Math.max(0, DK.val(S, 'want') - WANT_LINE) / 2;
    return x >= 150 ? 3 : x >= 100 ? 2 : x >= 55 ? 1 : 0;
  }
  function drift(ctx, S) {
    var k = S.k, a = S.abr.k, b = S.bbr.k, fr = S.firm ? 0.6 : 1;
    DK.push(S, 'sane', -2 * k); DK.push(S, 'resist', -3 * k * fr); DK.push(S, 'want', 2 * k); DK.push(S, 'obsess', 3);
    if (a === 'kaijo') { DK.push(S, 'want', 4 * k); DK.push(S, 'fear', 1); DK.push(S, 'resist', -4 * k * fr); }
    else if (a === 'drug') { DK.push(S, 'pleasure', 6 * k); DK.push(S, 'sane', -5 * k); DK.push(S, 'resist', -5 * k * fr); }
    else if (a === 'oitsume') { DK.push(S, 'sane', -7 * k); DK.push(S, 'fear', 5 * k); DK.push(S, 'resist', -3 * k * fr); }
    else { DK.push(S, 'fear', 8 * k); DK.push(S, 'sane', -4 * k); DK.push(S, 'resist', -2 * k * fr); }
    if (b === 'obey') { DK.push(S, 'resist', -6 * k); DK.push(S, 'want', 2 * k); }
    else if (b === 'lie') { DK.push(S, 'want', 4 * k); DK.push(S, 'resist', -3 * k); }
    else if (b === 'refuse') DK.push(S, 'want', 1 * k);
    DK.push(S, 'dark', 85 / (S.days * 0.7));
  }
  function stepFall(ctx, S) { var r = DK.push(S, 'fall', fallCalc(S) - DK.val(S, 'fall')); return r.rose ? r.stage : 0; }
  /* 体の場面のあと（kankin-r18.js が呼ぶ） */
  function afterSex(ctx, S, kind) {
    DK.push(S, 'pleasure', 15); DK.push(S, 'resist', -6 * (S.firm ? 0.6 : 1)); DK.push(S, 'sane', kind === 'oshioki' ? -10 : -5); DK.push(S, 'want', 5);
    ctx.mod2(S.A, S.B, { aff: 3, att: 6 }, { att: 5, ten: 2 });
  }

  /* ---------- 一日 ---------- */
  var M_POOL = ['wake', 'breakfast', 'chaincheck', 'wash', 'clothes', 'window', 'count', 'leave'];
  var D_POOL = ['gift', 'photo', 'cook', 'read', 'bath', 'memory', 'rule', 'care', 'test', 'alone', 'letter', 'tv'];
  var N_POOL = ['watch', 'talk', 'hold', 'nightmare', 'lock', 'beg', 'confess', 'star'];
  var AL_OF = { wake: 'morning', gift: 'kaijo', beg: null, confess: 'confess' };
  var BL_OF = { wash: 'obey', beg: 'beg' };
  /* 表から、まだ出ていない出来事を一つ（設定の札で外れるものは飛ばす。使い切ったら again） */
  function fromPool(ctx, S, pool, again) {
    var ks = pool.slice(), out = null;
    for (var i = ks.length - 1; i > 0; i--) { var j = Math.floor(ctx.rng() * (i + 1)), x = ks[i]; ks[i] = ks[j]; ks[j] = x; }
    ks.sort(function (x, y) { return (S.cnt[x] || 0) - (S.cnt[y] || 0); });
    for (var q = 0; q < ks.length && !out; q++) {
      var k = ks[q];
      if (k === 'beg' && DK.stage(S, 'fall') >= 2) continue;
      out = ev(ctx, S, k, { al: AL_OF[k], bl: BL_OF[k], again: again });
      if (out) S.cnt[k] = (S.cnt[k] || 0) + 1;
    }
    return out;
  }
  function slot(ctx, S, pool) { return fromPool(ctx, S, pool, false) || fromPool(ctx, S, pool, true); }
  function phase(ctx, s) {
    var S = S_(ctx); if (!S || S.ended) return;
    var d = Math.floor(s / 3), t = s % 3, last = d === S.days - 1, A = S.A, B = S.B;
    scen.actRate = 1e-9;
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    DK.tmpReset(S);
    S.d = d; S.part = t;
    var n0 = S.nEv;
    if (t === 0) {
      drift(ctx, S);
      var dk = DK.stage(S, 'dark');
      S.darkDue = dk > (S.darkSeen || 0) ? dk : 0;
      slot(ctx, S, M_POOL);
      /* 外との連絡：一日おきに（設定の種） */
      if (d % 2 === 1 || S.contact === 'watched') { if (ev(ctx, S, 'phone')) S.setHit++; }
      var fs = stepFall(ctx, S);
      if (fs && DK.once(S, 'fall' + fs)) ev(ctx, S, 'fall' + fs, { bl: 'fall' + fs, mag: 12 });
    } else if (t === 1) {
      dayStep(ctx, S, d, last);
    } else {
      nightStep(ctx, S, d, last);
    }
    /* 正気の節目 */
    var ss = DK.stage(S, 'sane');
    if (t !== 2 && ss && !S.ended && DK.once(S, 'sane' + ss)) ev(ctx, S, 'sane' + ss, { mag: 10 });
    /* 空の区切りを作らない */
    if (S.nEv === n0 && !S.ended) slot(ctx, S, t === 0 ? M_POOL : t === 1 ? D_POOL : N_POOL);
    var r = ctx.rel && ctx.rel[A.i] && ctx.rel[A.i][B.i];
    if (r && t === 2) ctx.mod2(A, B, { att: 2 }, { att: DK.stage(S, 'fall') >= 1 ? 3 : 0, ten: DK.val(S, 'fear') >= 60 ? 2 : 0 });
  }
  function dayStep(ctx, S, d, last) {
    /* 怖さの節目（一度ずつ） */
    if (S.darkDue) {
      for (var k = (S.darkSeen || 0) + 1; k <= S.darkDue; k++) {
        if (!DK.once(S, 'dark' + k)) continue;
        ev(ctx, S, 'dark' + k, { al: k === 1 ? 'jeal' : k === 4 ? 'hyohen' : null, mag: 15 });
        if (k === 2 && S.drug) S.cupToday = true;
      }
      S.darkSeen = S.darkDue; S.darkDue = 0;
    }
    /* 逃げる日 */
    if (d === S.escDay && !S.esc) return escapeDay(ctx, S);
    /* 嘘がばれる日 */
    if (d === S.lieDay && !S.lieFound) {
      var cool = /^(cool|stern|proud)$/.test(S.perA) ? 0.75 : 0.45;
      if (ctx.rng() < cool) { S.lieFound = true; ev(ctx, S, 'lie_found', { mag: 15 }); DK.push(S, 'fear', 15); if (S.escDay < 0 && d + 1 < S.days - 1) S.escDay = d + 1; return; }
      ev(ctx, S, 'lie_hold', { mag: 10 }); S.lieHold = true; return;
    }
    if (S.srDays[d]) { if (ev(ctx, S, 'search', { mag: 8 })) S.setHit++; }
    /* 分かれ道：閉じ込める側 6 割・閉じ込められる側 4 割。もう一つは日々の出来事 */
    var useA = ctx.rng() < 0.6;
    if (useA) { var ak = S.abr.k; if (ev(ctx, S, 'a_' + ak, { al: ak === 'drug' ? 'drug' : ak, again: true }) && ak === 'drug') S.cupToday = true; }
    else ev(ctx, S, 'b_' + (S.lieFound && S.bbr.k === 'lie' ? 'refuse' : S.bbr.k), { bl: S.lieFound && S.bbr.k === 'lie' ? 'refuse' : S.bbr.k, again: true });
    slot(ctx, S, D_POOL);
  }
  function escapeDay(ctx, S) {
    S.esc = { d: S.d };
    ev(ctx, S, 'escape', { mag: 20 });
    /* 開いた扉の前で足が止まる（本音が高いほど）。止まらなければ見つかる */
    var backP = clamp((DK.val(S, 'want') - 40) / 80, 0.1, 0.55);
    if (ctx.rng() < backP) { S.esc.back = true; ev(ctx, S, 'back', { mag: 18 }); DK.push(S, 'want', 10); return; }
    S.esc.caught = true; S.punish = true;
    ev(ctx, S, 'caught', { al: 'caught', mag: 20 });
    DK.push(S, 'fear', 15); DK.push(S, 'obsess', 10); DK.push(S, 'dark', 20);
  }
  function nightStep(ctx, S, d, last) {
    var KR = HK.KankinR18;
    if (last) {
      if (DK.R18 && DK.R18.missed && DK.R18.missed(S)) noYoru(ctx, S);
      return ending(ctx, S);
    }
    /* 逃げて見つかった夜：お仕置き（体の場面が出せなければ心の段） */
    if (S.punish) {
      S.punish = false;
      if (KR && KR.night && KR.night(ctx, S, 'oshioki')) return;
      ev(ctx, S, 'oshioki', { mag: 20 }); DK.push(S, 'sane', -10);
      return;
    }
    if (KR && KR.night && KR.night(ctx, S, '')) return;
    if (d === 2 || (d > 2 && d % 4 === 2)) { if (ev(ctx, S, 'confess', { al: 'confess' })) return; }
    slot(ctx, S, N_POOL);
  }
  function noYoru(ctx, S) {
    var N = TX().NOYORU || {}, k = S.noBody ? 'body' : 'want', t = rnd(ctx, N[k]);
    if (t) DK.say(ctx, { id: 'kk_noyoru', cat: 'bond', actors: [S.A, S.B], t: t, a: S.A, b: S.B, why: 'ヤンデレ監禁の部屋：体の場面にならなかった理由（' + (S.noBody ? '体の場面にしない二人' : '本音が線を越えなかった') + '）' });
  }

  /* ---------- 結末 ---------- */
  var END_NAME = { broken: '精神が壊れて溺れる', escape: '脱出', kyoizon: '共依存の楽園', gyakuten: '立場の逆転', rescue: '外の人に救出される', shinju: '心中' };
  function decide(ctx, S) {
    if (S.endK) return S.endK;
    var fs = DK.stage(S, 'fall'), ss = DK.stage(S, 'sane'), want = DK.val(S, 'want'), b = S.bbr.k, k;
    if (DK.val(S, 'sane') <= 0 || (fs >= 3 && ss >= 2)) k = 'broken';
    else if (DK.content(ctx, 'death') && /^(purge|depend)$/.test(S.ty) && ss >= 1 && ctx.rng() < 0.4) k = 'shinju';
    else if ((S.search === 'strong' && fs < 2 && ctx.rng() < 0.75) || (S.search === 'weak' && fs < 1 && ctx.rng() < 0.35)) k = 'rescue';
    else if ((b === 'lie' && !S.lieFound && fs <= 2 && ctx.rng() < 0.75) || (S.firm && S.ty === 'depend' && DK.stage(S, 'resist') <= 1 && ctx.rng() < 0.5)) k = 'gyakuten';
    else if (/^(escape|refuse)$/.test(b) && fs < 2) k = 'escape';
    else if (want >= 60 && fs >= 1) k = 'kyoizon';
    else k = fs >= 1 ? 'kyoizon' : 'escape';
    S.endK = k;
    if (k === 'escape') S.endSub = /^(gentle|devoted|polite|shy)$/.test(S.perA) && ctx.rng() < 0.6 ? 'minogasu' : 'tsuho';
    return k;
  }
  function ending(ctx, S) {
    var k = decide(ctx, S), E = TX().END || {}, key = k === 'escape' ? 'escape_' + S.endSub : k;
    var t = rnd(ctx, E[key]);
    var fc = {}; fc[S.B.i] = { broken: 'smile_lover', kyoizon: 'smile_lover', gyakuten: 'joy', escape: 'sad', rescue: 'sad', shinju: 'sad' }[k];
    DK.say(ctx, { id: 'kk_end_' + k, cat: 'bond', actors: [S.A, S.B], t: t, a: S.A, b: S.B, mag: 40, why: 'ヤンデレ監禁の部屋：結末（' + END_NAME[k] + '）', face: fc,
      fx: function () { if (k === 'shinju') { S.A.fate = '心中'; S.B.fate = '心中'; } } });
    S.ended = true;
  }
  function finish(ctx) {
    var S = S_(ctx); if (!S) return;
    var k = decide(ctx, S), A = S.A, B = S.B;
    var aimA = { broken: 1, kyoizon: 1, gyakuten: 0, escape: 0, rescue: 0, shinju: 1 }[k], aimB = { broken: 0, kyoizon: 0, gyakuten: 1, escape: 1, rescue: 1, shinju: 0 }[k];
    ctx.flags.kankin = { a: A.i, b: B.i, days: S.days, rel: GRP_NAME[S.grp], ty: TY_NAME[S.ty], ab: A_NAME[S.abr.k], bb: B_NAME[S.bbr.k], aOdd: S.abr.odd, bOdd: S.bbr.odd,
      chain: S.chain, contact: S.contact, search: S.search, drug: S.drug, endK: k, end: END_NAME[k], sex: S.r18 ? S.r18.n : 0, esc: S.esc ? (S.esc.back ? 'back' : 'caught') : '',
      fall: DK.stage(S, 'fall'), sane: Math.round(DK.val(S, 'sane')), fear: Math.round(DK.val(S, 'fear')), gsA: S.gsA.t, glA: S.glA.t, gsB: S.gsB.t, glB: S.glB.t, aimA: aimA, aimB: aimB };
    A.fate = '閉じ込めた人'; A.fateNote = B.name + 'を部屋に閉じ込めた';
    B.fate = k === 'shinju' ? '心中' : '閉じ込められた人'; B.fateNote = A.name + 'の部屋に閉じ込められた';
    if (k === 'shinju') { A.fate = '心中'; }
    S.G.forEach(function (g) { g.gone = false; g.fate = '外の人'; g.fateNote = ''; });
    ctx.flags.outcome = A.name + 'と' + B.name + 'の閉ざされた' + S.days + '日――' + END_NAME[k];
  }
  DK.install(ID, DK.couple('part', 'keeper', 'kept', ['guest']), 'kankin');
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.kankin, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('閉ざされた' + R.days + '日（' + a + 'が' + b + 'を閉じ込めた・' + R.rel + '・病み方は' + R.ty + '）');
    lines.push(a + '：' + R.ab + (R.aOdd ? '（らしくない）' : '') + '／' + b + '：' + R.bb + (R.bOdd ? '（らしくない）' : ''));
    lines.push(a + 'の目標：短期「' + R.gsA + '」／長期「' + R.glA + '」（' + (R.aimA ? '叶った' : '叶わなかった') + '）');
    lines.push(b + 'の目標：短期「' + R.gsB + '」／長期「' + R.glB + '」（' + (R.aimB ? '叶った' : '叶わなかった') + '）');
    if (R.esc) lines.push(b + 'は一度、逃げ出そうとした（' + (R.esc === 'back' ? '開いた扉の前で、自分から戻った' : '見つかって連れ戻された') + '）');
    lines.push('結末：' + R.end);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['結末', R.end], ['エッチ', R.sex + '回']], lines: lines };
  };
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: '体の場面の描き方。ほのめかす＝ぼかした一段だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
  HK.Kankin = { ID: ID, WANT_LINE: WANT_LINE, afterSex: afterSex, ev: ev, decide: decide, conv: conv };
  HK.SCENARIOS[ID] = scen;
})();
