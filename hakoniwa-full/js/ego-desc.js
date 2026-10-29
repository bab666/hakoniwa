/* 箱庭シミュレーター: エゴグラムの傾向の説明（住人の ⚙️ 設定の「この住人の傾向」と、住人一覧の態度の一語）
   (a) 高い因子・低い因子の一言 (b) 態度（9種）と一行の説明 (c) 箱庭での出やすい動き の目安を、表から組み立てる。
   画面の表示だけに使い、行動の判断には使わない（行動はエンジンがエゴグラムの数値から決める）。両ビルド同一 */
(function () {
  'use strict';
  var HK = window.HK;
  var HI = 14, LO = 6;   /* HK.lvl と同じ境目：14以上が高い、6以下が低い */
  var D = HK.EGO_DESC = {
    /* 高い因子の一言 */
    HIGH: {
      CP: '規律を重んじ、主導権を握りたがる', NP: '面倒見がよく、情に厚い', A: '理性的で分析的',
      FC: '感情に正直で、好奇心が強い', AC: '協調的で、周りに合わせて我慢しがち'
    },
    /* 低い因子の一言 */
    LOW: {
      CP: 'ルールや上下関係にこだわらない', NP: '他人の世話には関心が薄く、共感は苦手', A: '理屈より勢いで動く',
      FC: '感情に流されにくく、はしゃいだり思いつきで動いたりするのは苦手', AC: '周りに合わせず、我を通す'
    },
    /* 高い因子が二つそろったときの型（強い順に並べた二つの組。順は問わない） */
    PAIR: {
      'CP+NP': '頼れる兄貴・姉貴分', 'CP+A': '冷徹な指揮官', 'CP+FC': '我の強いリーダー', 'CP+AC': '規則に忠実な優等生',
      'NP+A': '落ち着いた世話役', 'NP+FC': '明るい人気者', 'NP+AC': '尽くす献身家',
      'A+FC': '好奇心旺盛な発明家', 'A+AC': '慎重な参謀', 'FC+AC': '気分屋の甘えん坊'
    },
    /* 態度（文面の表の種類）。HK.PERSONA と同じ鍵 */
    ATT: {
      proud: { label: '強気', line: 'プライドが高く、押されると言い返して張り合う' },
      stern: { label: '厳格', line: '自分を律して筋を通す。乱れた場でも崩れまいと耐える' },
      tsun: { label: '意地っ張り', line: '本心を素直に認めず、つい強がってしまう' },
      gentle: { label: '穏やか', line: 'おっとりと受け流し、困った人を放っておけない' },
      devoted: { label: '健気', line: '我慢強く、相手のために尽くして頑張る' },
      cool: { label: '冷静', line: '一歩引いて観察し、理屈で判断する' },
      free: { label: '奔放', line: '素直に驚き、楽しいことには迷わず飛び込む' },
      shy: { label: '恥じらい', line: '内気で、すぐ赤くなって謝ってしまう' },
      polite: { label: '丁寧', line: '誰にでも丁寧語で話す、礼儀正しい人' }
    },
    /* 箱庭での動き（行動の重心の目安） */
    MOVE: [
      { id: 'help', label: '助ける', top: '仲間の手当てや手伝いに回りやすい', f: function (t) { return t.np * 0.6 + t.ac * 0.25 + t.warmth * 0.15; } },
      { id: 'conflict', label: '争う', top: '言い争いや衝突の中心になりやすい', f: function (t) { return t.aggr * 0.7 + t.lead * 0.3; } },
      { id: 'romance', label: '恋愛', top: '恋や親しい交流が生まれやすい', f: function (t) { return t.fc * 0.45 + t.warmth * 0.35 + t.impulse * 0.2; } },
      { id: 'solo', label: '一人で動く', top: '一人で探索や調べものに出やすい', f: function (t) { return t.cold * 0.45 + t.a * 0.35 + (1 - t.warmth) * 0.2; } }
    ],
    BALANCE: 'バランス型。目立って高い因子も低い因子もなく、場面や相手に合わせて振る舞いが変わる',
    FLAT: 'どの動きにも大きくは偏らない'
  };
  function egOf(c) {
    var src = (c && c.eg) || {}, eg = {};
    HK.FACTORS.forEach(function (k) { var v = +src[k]; eg[k] = src[k] == null || isNaN(v) ? 10 : HK.clamp(v, 0, 20); });
    return eg;
  }
  function attKey(c) {
    var k = HK.personaOf ? HK.personaOf({ tone: c && c.tone, eg: egOf(c) }) : 'gentle';
    return D.ATT[k] ? k : 'gentle';
  }
  /* 住人一覧に出す態度の一語 */
  HK.egoAttWord = function (c) { return D.ATT[attKey(c)].label; };
  /* 住人一覧のエゴグラムの隣に出す性格の型の名前（2026-10-29 利用者の指示：態度の一語だとエゴグラムの型に見えるため）。
     高い因子（14以上）が二つなら型の名前（PAIR）、一つならその因子の一語、どれも高くなければ「バランス型」 */
  var ONE = { CP: '厳格な指導者', NP: '面倒見のいい世話役', A: '理性的な分析家', FC: '自由な感情家', AC: '協調的な気配り屋' };
  HK.egoTypeName = function (c) {
    var eg = egOf(c), by = HK.FACTORS.slice().sort(function (x, y) { return eg[y] - eg[x]; });
    var hi = by.filter(function (k) { return eg[k] >= HI; });
    if (hi.length >= 2) return D.PAIR[hi[0] + '+' + hi[1]] || D.PAIR[hi[1] + '+' + hi[0]] || ONE[hi[0]];
    return hi.length ? ONE[hi[0]] : 'バランス型';
  };
  /* 住人一覧に出す口調の名前（設定した口調。おまかせなら、自動で決まる口調を添えて「口調：おまかせ（穏やか）」） */
  HK.egoToneWord = function (c) {
    var set = !!(c && HK.toneValid && HK.toneValid(c.tone)), lab = HK.toneLabel ? HK.toneLabel(c) : D.ATT[attKey(c)].label;
    return set ? '口調：' + lab : '口調：おまかせ（' + lab + '）';
  };
  /* 説明の行（文字列の配列。3〜5行） */
  HK.egoDesc = function (c) {
    var eg = egOf(c), tr = HK.traits(eg), out = [];
    var by = HK.FACTORS.slice().sort(function (x, y) { return eg[y] - eg[x]; });
    var hi = by.filter(function (k) { return eg[k] >= HI; }).slice(0, 3);
    var lo = by.slice().reverse().filter(function (k) { return eg[k] <= LO; }).slice(0, 3);
    /* (a) 高い因子・低い因子 */
    var tops = by.filter(function (k) { return eg[k] === eg[by[0]]; }), even = eg[by[0]] - eg[by[4]] < 1;
    if (!hi.length && !lo.length) out.push(D.BALANCE + (even ? '（5つの因子がほぼ同じ高さ）' : '（いちばん強いのは ' + tops.join('・') + '）'));
    else {
      if (hi.length) {
        var pk = hi.length >= 2 ? (D.PAIR[hi[0] + '+' + hi[1]] || D.PAIR[hi[1] + '+' + hi[0]]) : '';
        out.push(hi.map(function (k) { return D.HIGH[k]; }).join('。') + (pk ? '。' + pk + 'タイプ' : '') + '（' + hi.join('・') + ' が高い）');
      } else out.push('飛び抜けて高い因子はなく、強いて言えば「' + tops.map(function (k) { return HK.FACTOR_NAME[k]; }).join('」「') + '」寄り（' + tops.join('・') + ' がいちばん強い）');
      if (lo.length) out.push(lo.map(function (k) { return D.LOW[k]; }).join('。') + '（' + lo.join('・') + ' が低い）');
    }
    /* (b) 態度 */
    var ak = attKey(c), A0 = D.ATT[ak], auto = HK.personaAuto ? HK.personaAuto(tr) : ak;
    out.push('態度：' + A0.label + '――' + A0.line + (c && c.tone && auto !== ak && D.ATT[auto] ? '（口調の設定から。エゴグラムだけなら「' + D.ATT[auto].label + '」）' : ''));
    /* (c) 箱庭での動き */
    var mv = D.MOVE.map(function (m) { return { m: m, v: m.f(tr) }; });
    var top = mv.slice().sort(function (x, y) { return y.v - x.v; })[0];
    var vs = mv.map(function (x) { return x.v; }), flat = Math.max.apply(null, vs) - Math.min.apply(null, vs) < 0.12;
    out.push('箱庭での動きの目安：' + mv.map(function (x) { return x.m.label + (x.v >= 0.62 ? '◎' : x.v >= 0.42 ? '○' : '△'); }).join('・') + '。' + (flat ? D.FLAT : top.m.top));
    /* (d) 目立つ気質（極端なものだけ） */
    var tk = Object.keys(HK.TRAIT_NAME || {}), mk = [];
    tk.forEach(function (k) { if (tr[k] >= 0.75) mk.push({ k: k, d: tr[k] - 0.5, t: HK.TRAIT_NAME[k] + 'が強め' }); else if (tr[k] <= 0.2) mk.push({ k: k, d: 0.5 - tr[k], t: HK.TRAIT_NAME[k] + 'が弱め' }); });
    mk.sort(function (x, y) { return y.d - x.d; });
    if (mk.length) out.push('目立つ気質：' + mk.slice(0, 3).map(function (x) { return x.t; }).join('、'));
    return out;
  };
})();
