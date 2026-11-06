/* 配信の部屋（追加パック set-b の 4 部屋目。エンジン型。両方のビルド。2026-11-06。設計は docs/reports/2026-11-06/haishin-design.md。担当 P1：骨組み）
   二人が配信をする（どんな関係でもカップルとして扱う。2026-11-06 まで恋人・夫婦だけ）。一回の配信を 30 分ごとの区切りで進め（1〜24 時間＝2〜48 区切り）、視聴者（モブ）のコメントとスパチャに応えていく。
   ・形：カップル配信（二人で）／ソロ配信（一人が配信、もう一人は画面の外）。攻め×攻めのカップル配信は、どの版でも始められない（scen.check）
   ・要求の段 1〜6（一般→質問→ちょっと踏み込んだ質問→踏み込んだ要求→すごく踏み込んだ要求→エロい要求）は戻らない。盛り上がり点＝同接（対数）＋発情度＋スパチャの太さ。
     段が上がるときに渋ると停滞し、3 区切り続くと途中終了。上限は全年齢・夜の起こりやすさ 0・体の関係にならない二人なら「段 3 ＋段 4 の軽い要求（キスまで）」
   ・記録は本編（メインタブ）とコメント欄（e.ch = 'cm'。一区切り一件）に分かれる
   ・この部屋の文の表は別の担当が書く（HK.HaishinText＝T・HK.HaishinCm＝C・HK.HaishinR18Text＝R。表の名前と添字は設計 16 章）。表が空でも落ちずに動く
   ・ほかの担当のファイルの口（このファイルより後に読まれ、HK.Haishin に足す。無ければこのファイルの代わりの動き）：
       HK.Haishin.cm   = { init(ctx, S), post(ctx, S, o), ask(ctx, S, o) }           … haishin-cm.js（P2：コメントの一件・メインの質問）
       HK.Haishin.end  = { finish(ctx, S) }                                          … haishin-end.js（P3：結末・後日談・結果欄・目標の判定）
       HK.Haishin.r18  = { init(ctx, S), step(ctx, S, o), answer(ctx, S, q, how, a, b) } … haishin-r18.js（P11：段 4〜6 の応え・ソロの中盤・本番。R18 版だけ）
   ・本体に入る途中の口（コメントタブ e.ch・HK.Face・HK.Chart・HK.Play.addValue・chair・HK.Shared.addMap）は、無い本体でも落ちないように HK.X && … で書く
   ・（2026-11-06 P15b の計測と通し読みで直したもの）夜 100 のカップルの段の上げ方（一区切り一度）・渋りの確率の係数・料理とゲームの区切りの様子の順（STEP_ORD）・
     12／24 時間の寝落ちは朝に起きて雑談を続ける（S.kindLive）・らしくない一面は 2 回まで・本体の glance を外す・作れない人の料理の失敗の文。数字は設計 11.1、指摘は haishin-playtest.md
   登場人物はすべて成人として扱う */
/* @event scen=set-b-haishin id=hs_stop cat=bond tie=- label=二人で並べず配信が始まらない */
/* @event scen=set-b-haishin id=hs_start cat=bond tie=lover label=二人が配信を始める */
/* @event scen=set-b-haishin id=hs_step cat=bond tie=lover label=配信の合間の様子（種類ごと） */
/* @event scen=set-b-haishin id=hs_q1 cat=bond tie=lover label=視聴者の挨拶やお願いに応える */
/* @event scen=set-b-haishin id=hs_q2 cat=bond tie=lover label=視聴者の質問に答える */
/* @event scen=set-b-haishin id=hs_q3 cat=bond tie=lover label=相手のどこが好きかなどの質問に答える */
/* @event scen=set-b-haishin id=hs_light cat=romance tie=lover label=視聴者の軽いお願いに応えて見せる */
/* @event scen=set-b-haishin id=hs_kiss cat=romance tie=lover label=コメントにせがまれてカメラの前でキス */
/* @event scen=set-b-haishin id=hs_jeal cat=romance tie=lover label=熱心なリスナーに嫉妬する */
/* @event scen=set-b-haishin id=hs_sunao cat=romance tie=lover label=配信を忘れて素に戻る */
/* @event scen=set-b-haishin id=hs_odd cat=bond tie=lover label=配信中にらしくない一面を見せる */
/* @event scen=set-b-haishin id=hs_stall cat=bond tie=lover label=踏み込んだ要求を渋って話をそらす */
/* @event scen=set-b-haishin id=hs_quit cat=bond tie=lover label=気まずくなって配信を途中で終える */
/* @event scen=set-b-haishin id=hs_close cat=bond tie=lover label=予定の時間が来て配信を閉じる */
/* @event scen=set-b-haishin id=hs_goal cat=bond tie=lover label=目標を意識して配信で動く */
/* @event scen=set-b-haishin id=hs_off cat=bond tie=lover label=画面の外の相手から連絡や差し入れ */
/* @event scen=set-b-haishin id=hs_cookfail cat=bond tie=lover label=料理配信で失敗して騒ぐ */
/* @event scen=set-b-haishin id=hs_sleep_fall cat=bond tie=lover label=寝落ち配信で眠りに落ちる */
/* @event scen=set-b-haishin id=hs_sleep_breath cat=bond tie=lover label=寝落ち配信の寝息と寝言 */
/* @event scen=set-b-haishin id=hs_sleep_wake cat=bond tie=lover label=寝落ち配信の朝に目を覚ます */
/* @event scen=set-b-haishin id=hs_set_kind cat=bond tie=lover label=配信の種類ならではの出来事 */
/* @event scen=set-b-haishin id=hs_set_size cat=bond tie=lover label=リスナーの規模で起きる出来事 */
/* @event scen=set-b-haishin id=hs_set_sc cat=bond tie=lover label=スパチャの太さで起きる出来事 */
/* @event scen=set-b-haishin id=hs_set_hours cat=bond tie=lover label=配信時間の長さで起きる出来事 */
/* @event scen=set-b-haishin id=hs_set_form cat=bond tie=lover label=カップルかソロかで起きる出来事 */
/* @event scen=set-b-haishin id=hs_set_hname cat=bond tie=lover label=配信の名前にまつわる出来事 */
/* @event scen=set-b-haishin id=hs_set_charm cat=bond tie=lover label=配信者の魅力で起きる出来事 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.PairKit) return;
  var ID = 'set-b-haishin', K = HK.PairKit, LF = HK.Life;
  function TX() { return HK.HaishinText || {}; }
  function CM() { return HK.HaishinCm || {}; }
  function RX() { return HK.HaishinR18Text || {}; }
  function st(ctx) { return ctx && ctx.hs; }
  /* コメント欄の組み立て（haishin-cm.js の HK.HaishinCmKit。このファイルより後に読まれる） */
  function CK() { return HK.HaishinCmKit || null; }
  var H = HK.Haishin = HK.Haishin || {};

  /* ---------- 決まった値（設計 1・2・6 章） ---------- */
  var KIND = { zatsu: { label: '雑談', t0: 21 * 60 }, cook: { label: '料理', t0: 19 * 60 }, game: { label: 'ゲーム', t0: 22 * 60 }, neochi: { label: '寝落ち', t0: 24 * 60 } };
  var SIZE = { s10: 10, s100: 100, s1k: 1000, s10k: 10000 };
  var SCB = { few: 0, mid: 8, whale: 16 };
  var HOURS = [1, 2, 3, 6, 12, 24];
  /* 段が上がる線（その段で要求に一度以上応えていること）：1→2：30、2→3：45、3→4：60、4→5：75、5→6：90 */
  var LINE = [0, 30, 45, 60, 75, 90];
  var STAGE_NAME = ['', '一般', '質問', 'ちょっと踏み込んだ質問', '踏み込んだ要求', 'すごく踏み込んだ要求', 'エロい要求'];
  /* 段 4 の軽い要求（両方の版。全年齢・夜 0 の上限）と、R18 の要求の種類（4.3） */
  var LIGHT_K = { kiss: 1, hug: 1, hiza: 1, aan: 1, nade: 1, hand: 1, kiss_cam: 1, sasayaki_l: 1 };
  var KISS_K = { kiss: 1, kiss_cam: 1, deep: 1 };
  var GAME_T = ['coop', 'vs', 'horror', 'puzzle'];
  var FORM_JA = { couple: 'カップル配信', solo: 'ソロ配信' };
  /* 応え方：serve 張り切ってサービスする／shy 照れて隠す／sunao 配信を忘れて素に戻る（態度 9 種の重み。7.1） */
  var HOW_W = {
    serve: { devoted: 3, free: 3, gentle: 2, proud: 2, polite: 1, stern: 1, tsun: 1, shy: 0.5, cool: 1 },
    shy: { shy: 3, tsun: 3, polite: 2, stern: 2, gentle: 1.5, cool: 1, devoted: 1, proud: 1, free: 0.5 },
    sunao: { cool: 2.5, gentle: 1.5, free: 1.5, devoted: 1.5, polite: 1, stern: 1, proud: 1, tsun: 1, shy: 1 }
  };

  /* 理由の欄（e.why。画面に出る）に内部の鍵（serve・shy・k の英字）を出さないための言い方（2026-11-06 の利用者の指摘「（…の耳・shy）」） */
  var HOW_JA = { serve: '張り切って', shy: '照れながら', sunao: '素に戻って' };
  var K_JA = { greet: '挨拶', wave: '手を振る', praise: 'ほめる', name: '名前を呼ぶ', kindq: '配信の種類のお願い', thanks: 'お礼', food: '好きな食べ物', food_t: '好きな味', food_none: '好きな食べ物',
    buy: '買ってよかったもの', holiday: '休日', date: 'デート', hobby: '趣味', media: '好きな作品', morning: '朝型か夜型か', cook: '得意料理', hate: '苦手なもの', hamari: '最近ハマっていること', pet: '動物', trip: '行きたい場所',
    start: '配信を始めたきっかけ', meet: '出会い', suki: '好きなところ', first: '第一印象', firstdate: '初デート', kenka: '喧嘩', yobi: '呼び方', shigusa: '好きな仕草', kuse: '相手の癖', kokuhaku: '告白', kinen: '記念日',
    jeal: '嫉妬', amae: '甘える方', future: 'これから', kiss: 'キス', hug: 'ハグ', hiza: '膝枕', aan: 'あーん', nade: '頭を撫でる', hand: '手をつなぐ', kiss_cam: 'カメラにキス', sasayaki_l: 'カメラに甘い言葉',
    seikan: '性感帯', mimi: '耳元で囁く', kubi: '首筋にキス', deep: '深いキス', sawaru: '性感帯に触れる', koe: '声を聴かせる', shitagi: '下着', nugu: '一枚脱ぐ', chikubi: '胸を責める', onani: '自慰を見せる',
    kuchi: '口でする', ana: '指で弄る', vibe: '玩具', tel: '電話する', ireru: 'そのまま入れる' };
  function kJa(k) { return K_JA[k] || '―'; }
  function howJa(h) { return HOW_JA[h] || ''; }

  /* ---------- 小さな道具 ---------- */
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function log10(v) { return Math.log(Math.max(1, v)) / Math.LN10; }
  function comma(n) { var s = String(Math.round(n)); return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function yen(n) { return '¥' + comma(n); }
  function per(c) { return HK.PairReact && HK.PairReact.per ? HK.PairReact.per(c) : 'gentle'; }
  function nightKind(a, b) { return !HK.SAFE_ON && HK.Attr && HK.Attr.nightKind ? HK.Attr.nightKind(a, b) || '' : ''; }
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }
  /* 時刻（分）の言い方：24 時ちょうどは「24:00」、日をまたいだら「翌 1:30」、二日目をまたいだら「翌々」 */
  function clockW(m) {
    if (m === 24 * 60) return '24:00';
    var d = Math.floor(m / 1440), r = m % 1440, s = Math.floor(r / 60) + ':' + ('0' + (r % 60)).slice(-2);
    return (d === 1 ? '翌' : d >= 2 ? '翌々' : '') + s;
  }
  function elapW(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  /* 区切りの時刻（分）と、時刻の札（late 深夜 0〜5 時・morning 朝 5〜9 時・day 昼・night 夜） */
  function clk(S, k) { return S.t0 + 30 * k; }
  function tmOf(m) { var h = Math.floor((m % 1440) / 60); return h < 5 ? 'late' : h < 9 ? 'morning' : h < 18 ? 'day' : 'night'; }
  function hn(S, c) { return c && S && S.hn && S.hn[c.i] ? S.hn[c.i] : c ? c.name : ''; }
  /* 相方の呼び方（14 章）：恋人で相手が男性→彼氏さん、女性→彼女さん、ほか→相方さん。夫婦は旦那さん・奥さん・パートナーさん */
  function aikata(S, c) {
    var g = c && (c.gender || (c.src && c.src.gender));
    if (S && S.rk === 'spouse') return g === 'm' ? '旦那さん' : g === 'f' ? '奥さん' : 'パートナーさん';
    return g === 'm' ? '彼氏さん' : g === 'f' ? '彼女さん' : '相方さん';
  }
  function chName(S) { return S.form === 'couple' ? hn(S, S.on[0]) + 'と' + hn(S, S.on[1]) : hn(S, S.on[0]); }
  function other(S, c) { return c === S.A ? S.B : S.A; }
  /* 恋愛の出来事の分類：恋愛の出来事として記録してよい二人（本体の romanceOk。攻め×攻めのソロ配信などは通らない）だけ romance、ほかは bond */
  function rcat(S) { return S && S.romOk ? 'romance' : 'bond'; }

  /* ---------- 文の選び方（札と一回の遊びの使用回数） ----------
     表の要素は文字列か { t: 文, 札… }。札：cook（1＝{a} が料理をする人）・home（'together' 同居／'apart' 別居）・form（'couple'／'solo'）・rk（'lover'／'spouse'）・
     sh（'mf'／'ff'／'fm'）・tm（'late'／'morning'／'day'／'night'）・gt（ゲームの型）・need（'M'／'F'／'bot'／'top'：{a} の体・役）・st（段の下限）・when(ctx, a, b, S) */
  function needOk(S, c, n) {
    if (!n) return true;
    var P = HK.Pos;
    if (n === 'solo' || n === 'couple') return S.form === n;
    if (HK.SAFE_ON && /^(M|F)$/.test(n)) return false;
    if (n === 'M') return !!(P && P.hasM && P.hasM(c));
    if (n === 'F') return !!(P && P.hasF && P.hasF(c));
    if (n === 'bot') return S.form === 'couple' ? c === S.bot : !(P && P.hardTop && P.hardTop(c));
    if (n === 'top') return S.form === 'couple' ? c === S.top : !!(P && P.hardTop && P.hardTop(c));
    return true;
  }
  function isFail(t) { return dig(TX().COOKFAIL, 'fail').some(function (x) { return (typeof x === 'string' ? x : x && x.t) === t; }); }
  function elOk(ctx, x, a, b) {
    var S = st(ctx);
    if (!x) return '';
    var t = typeof x === 'string' ? x : x.t;
    if (typeof t !== 'string' || !t) return '';
    if (typeof x === 'object') {
      if (x.cook && !(LF && a && LF.canCook(a))) return '';
      if (x.cook === 0 && LF && a && LF.canCook(a)) return '';
      if (x.kind && (Array.isArray(x.kind) ? x.kind.indexOf(liveKind(S)) < 0 : x.kind !== liveKind(S))) return '';
      if (x.home && (x.home === 'with' || x.home === 'together') !== !!S.home) return '';
      if (x.form && x.form !== S.form) return '';
      if (x.rk && x.rk !== S.rk) return '';
      if (x.sh && x.sh !== S.sh) return '';
      if (x.tm && x.tm !== S.tm) return '';
      if (x.tz && (Array.isArray(x.tz) ? x.tz.indexOf(S.tm) < 0 : x.tz !== S.tm)) return '';
      if (x.at === 'end' && S.N - S.s > 2) return '';
      if (x.nocook && S.cooks.length) return '';
      if (x.asleep && !(S.asleep > 0 && !S.woke)) return '';
      if (x.hn && !hasName(S, a)) return '';
      if (x.gt && x.gt !== S.game) return '';
      if (x.st && S.stage < x.st) return '';
      if (x.need && !needOk(S, a, x.need)) return '';
      if (typeof x.when === 'function' && !x.when(ctx, a, b, S)) return '';
    }
    /* 家事・料理の担い手（家事をしない設定の人を主語にしない）。ただし作れる人がいない料理配信の失敗の文（T.COOKFAIL.fail）は、作れない人が失敗する文なので通す
       （通さないと失敗の文が 1 本しか残らず、どの回も同じ文になった。2026-11-06 P15b の計測） */
    if (!(S.kind === 'cook' && !S.cooks.length && isFail(t)) && !K.choreOk(t, a, b)) return '';
    /* 結婚の語は夫婦だけ（地の文。台詞・コメントの中は問わない） */
    if (S.rk !== 'spouse' && K.WED && K.WED.test(t.replace(/「[^」]*」/g, ''))) return '';
    return t;
  }
  /* 候補から一つ（一回の遊びで同じ文は 1 回。rep のときは使い切ったあと 2 回目まで）。合う文が無ければ '' */
  function pickT(ctx, arr, a, b, rep) {
    var S = st(ctx), U = S.used, p = [];
    (arr || []).forEach(function (x) { var t = elOk(ctx, x, a, b); if (t) p.push(t); });
    if (!p.length) return '';
    var q = p.filter(function (t) { return !U[t]; });
    if (!q.length && rep) q = p.filter(function (t) { return (U[t] || 0) < 2; });
    if (!q.length) return '';
    var t = pickOf(ctx, q);
    U[t] = (U[t] || 0) + 1;
    return t;
  }
  /* 表のどこかに使える文があるか（数えない） */
  /* 代わりの文（表が空のとき）：使い切っても必ず一つ返す */
  function fbT(ctx, list, a, b) { return pickT(ctx, list, a, b, true) || pickOf(ctx, list) || ''; }
  function hasT(ctx, arr, a, b) { var U = st(ctx).used; return (arr || []).some(function (x) { var t = elOk(ctx, x, a, b); return t && !U[t]; }); }
  /* 表を開く：T[k1][k2]… の配列（無ければ []）。途中が配列でないオブジェクトなら、その下の配列を全部つなぐ（all を含む） */
  function dig(o) { for (var i = 1; i < arguments.length; i++) { if (!o) return []; o = o[arguments[i]]; } return flat(o); }
  function flat(o) { if (!o) return []; if (Array.isArray(o)) return o; if (typeof o === 'object') { var r = []; Object.keys(o).forEach(function (k) { r = r.concat(flat(o[k])); }); return r; } return []; }
  /* 名前と印を当てる（{a}{b} は K.fill。{v} 同接・{ch} チャンネル名・{h}{h2} 配信の名前・{相方}・{zone} 性感帯・{food}{taste}） */
  function fill(ctx, t, a, b, ex) {
    var S = st(ctx), el = 30 * (S.s || 0), o = { v: comma(S.v), ch: chName(S), h: hn(S, a), h2: hn(S, b), time: clockW(clk(S, S.s || 0)), el: el < 60 ? el + ' 分' : Math.floor(el / 60) + ' 時間' + (el % 60 ? '半' : ''), dish: S.dish || '' };
    if (a) o['相方'] = aikata(S, b || other(S, a));
    if (a && S.zones && S.zones[a.i]) o.zone = S.zones[a.i].join('と');
    if (ex) Object.keys(ex).forEach(function (k) { o[k] = ex[k]; });
    return K.fill(ctx, t, a, b, o);
  }
  /* 地の文の記録（住人の出来事）。tag は記録の見出し、ev は直前の出来事の札（コメントの反応に使う） */
  function rec(ctx, actors, text, why, cat, o) {
    if (!text) return null;
    o = o || {};
    if (cat === 'romance' && !st(ctx).romOk) cat = 'bond';
    var e = ctx.act2({ actors: actors, cat: cat || 'bond', text: text, why: '配信の部屋：' + why, odd: !!o.odd, fx: o.fx });
    if (e && o.tag) e.tag = o.tag;
    if (e) { var S0 = st(ctx); S0.nMain++; if (o.ev) { S0.ev.push(o.ev); S0.evBy[o.ev] = { doer: o.doer || actors[0] || null, taker: o.taker || actors[1] || null }; } }
    return e;
  }
  /* その区切りの行為の向き（する側 doer／される側 taker・種類 k。2026-11-06 の利用者の指示「逆 CP としてコメントしないように」）。
     コメント欄（haishin-cm.js の post）は、段 4〜6 の熱いコメント・反応・切り忘れのコメントの {h}／{h2} を、配信者の受け攻めの設定ではなくこの向きで当てる。
     一つの区切りに向きの違う行為が二つあれば向きは分からない扱い（S.actMix。向きを言うコメントを出さない）。over＝本番など、それまでの行為より優先する */
  function setAct(S, doer, taker, k, over) {
    if (!S || !doer) return;
    if (over) { S.act = { doer: doer, taker: taker || null, k: k || '' }; S.actMix = false; return; }
    if (S.act && (S.act.doer !== doer || S.act.taker !== (taker || null))) S.actMix = true;
    S.act = { doer: doer, taker: taker || null, k: k || '' };
  }

  /* ---------- 代わりの文（表が空のときだけ。地の文 2 文以上・台詞なし） ---------- */
  var FB = {
    start: ['{ch}の配信が始まった。画面の右上で、同接の数字が{v}人まで静かに増えていった。', '配信開始のボタンを押すと、カメラの小さな明かりがついた。{a}は画面の向こうへ小さく手を振った。'],
    step: ['画面の向こうでは、コメントが途切れずに流れていた。{a}はときどき、その流れに目を細めた。', '同接の数字は{v}人のあたりを行ったり来たりしていた。配信は、ゆるやかに続いていった。', '{a}は飲み物を一口飲んで、カメラのほうへ向き直った。コメント欄には、次の話題を待つ声が並んでいた。', 'しばらく、他愛ない話が続いた。画面の端で、スパチャの通知が小さく光った。'],
    ans: ['{a}は少し考えてから、そのコメントに答えた。画面の向こうから、短い反応がいくつも返ってきた。', '{a}はコメントを読み上げて、笑いながら答えた。そのあいだも、コメント欄は流れ続けた。', '{a}は画面に顔を寄せて、ゆっくりと言葉を選んだ。答え終わるころには、同接が少し増えていた。'],
    ans2: ['{a}も横から言葉を足した。二人の答えが重なって、コメント欄が沸いた。', '{a}は隣でうなずいて、短く付け足した。画面の向こうの反応は、さらににぎやかになった。'],
    light: ['{a}は照れながらも、そのお願いに応えて見せた。コメント欄は一気に流れが速くなった。', '{a}は少し迷ってから、カメラの前でお願いに応えた。画面の向こうから、歓声のようなコメントが返ってきた。'],
    stall: ['{a}はそのお願いをやんわりと流して、別の話題に移った。コメント欄には、残念がる声がしばらく続いた。', '{a}は笑ってごまかし、そのお願いには応えなかった。画面の向こうの熱は、少しだけ冷めた。'],
    quit: ['気まずい空気のまま、{a}は配信を閉じることにした。画面が暗くなる直前まで、コメントは流れ続けていた。'],
    close: ['予定していた時間が来て、{ch}の配信は終わりを迎えた。{a}はカメラに手を振って、配信を閉じた。', '最後の挨拶をして、{a}は配信終了のボタンを押した。部屋には、急に静けさが戻った。'],
    sleepFall: ['小声の雑談が少しずつ途切れがちになった。やがて{a}の寝息が、マイクに小さく拾われはじめた。'],
    sleep: ['画面には、眠っている{a}の姿だけが映っていた。マイクは、規則正しい寝息を拾い続けていた。', '{a}が小さく寝返りを打った。布団の擦れる音が、配信に乗って流れていった。'],
    wake: ['窓の外が明るくなったころ、{a}が目を覚ました。寝ぼけた顔でコメント欄を見て、慌てて配信を閉じた。'],
    end: ['配信は終わった。{ch}の一回の配信は、こうして記録に残った。']
  };
  var FB_REQ = {
    1: [{ t: 'こんばんは！初見です', k: 'greet' }, { t: '手を振ってほしい', k: 'wave' }, { t: '声が好きです', k: 'praise' }, { t: 'いつもありがとう', k: 'thanks' }],
    2: [{ t: '最近買ってよかったものは？', k: 'buy' }, { t: '休みの日は何してる？', k: 'holiday' }, { t: '好きな食べ物は？', k: 'food' }, { t: '最近ハマってることある？', k: 'hamari' }],
    3: [{ t: '{相方}のどこが好き？', k: 'suki' }, { t: '第一印象はどうだった？', k: 'first' }, { t: '告白はどっちから？', k: 'kokuhaku' }, { t: 'ケンカってする？', k: 'kenka' }],
    4: [{ t: 'ハグして見せて', k: 'hug', need: 'couple' }, { t: '頭を撫でてあげて', k: 'nade', need: 'couple' }, { t: '手をつないで見せて', k: 'hand', need: 'couple' }, { t: 'カメラに向かって何か甘いこと言って', k: 'sasayaki_l', need: 'solo' }, { t: 'キスして見せて', k: 'kiss', need: 'couple' }, { t: 'カメラにキスして', k: 'kiss_cam', need: 'solo' }],
    5: [{ t: 'もう少しだけ踏み込んだお願いをしてもいい？', k: 'sawaru' }],
    6: [{ t: '今日はとことん付き合ってほしい', k: 'tel', need: 'solo' }, { t: '今日はとことん付き合ってほしい', k: 'ireru', need: 'couple' }]
  };
  var FB_HANDLE = ['夜更かしの猫', 'みかん箱', 'ぽてと_77', '通りすがりの月', 'しずく', 'のりたま', 'おでん大根', '星見の人', 'ねこじゃらし', 'あおぞら_3'];
  var FB_CM = ['こんばんは', 'きたー', 'わこつ', '今日も来ました', '888', 'いいね', 'かわいい', '草', 'なるほど', 'それな', '声が落ち着く', 'のんびり見てます', '作業用に流してます', 'ありがとう', 'わかる', '仲良しだ'];

  /* ---------- 立場・形（2.4） ---------- */
  function roleOf(input, i) { var p = input && input.perChar && input.perChar[i], v = p && p.pick ? p.pick.role : null; return v === 'on' || v === 'off' ? v : 'auto'; }
  function charmIn(input, c) { var p = input && input.perChar && input.perChar[c.i], v = p && p.stats ? +p.stats.charm : NaN; return v >= 1 && v <= 5 ? v : 3; }
  function topTop(a, b) { var P = HK.Pos; return !!(P && P.hardTop && a && b && P.hardTop(a, b) && P.hardTop(b, a)); }
  /* 形と配信者を決める：{ form, on: [配信者…], off: 画面の外の人, warn: [] }。rr は乱数（無ければ 0.5） */
  function formOf(input, A, B, rr) {
    var env = (input && input.env) || {}, f = env.form === 'couple' || env.form === 'solo' ? env.form : 'auto';
    var ra = roleOf(input, A.i), rb = roleOf(input, B.i), warn = [], tt = topTop(A, B);
    var soloPick = function () {
      if (ra === 'on' && rb !== 'on') return A; if (rb === 'on' && ra !== 'on') return B;
      if (ra === 'off' && rb !== 'off') return B; if (rb === 'off' && ra !== 'off') return A;
      if (ra === rb && ra !== 'auto') { warn.push('ソロ配信の配信者は一人目（' + A.name + '）にします（二人とも「' + (ra === 'on' ? '配信する' : '画面の外') + '」を選んでいます）'); return A; }
      var ca = charmIn(input, A), cb = charmIn(input, B);
      return cb > ca ? B : A;
    };
    var form = f;
    if (f === 'couple') { if (ra === 'off' || rb === 'off') warn.push('形がカップル配信なので、立場の「画面の外」は使いません'); }
    else if (f === 'auto') {
      if (tt) { form = 'solo'; warn.push(HK.SAFE_ON ? '二人とも「攻め」の設定なので、ソロ配信になります' : '二人とも攻めなので、ソロ配信になります'); }
      else if (ra === 'off' || rb === 'off') form = 'solo';
      else if (ra === 'on' && rb === 'on') form = 'couple';
      else form = (rr == null ? 0.5 : rr) < 0.6 ? 'couple' : 'solo';
    }
    if (form === 'couple') return { form: 'couple', on: [A, B], off: null, warn: warn, tt: tt };
    var on = soloPick();
    return { form: 'solo', on: [on], off: on === A ? B : A, warn: warn, tt: tt };
  }
  /* 名簿の二人の関係（恋人・夫婦だけ。ほかは ''）。入力の関係の欄（input.ties）から読む（scen.check・画面の案内用） */
  var LOVER_T = /^(lover|fiance|honmei|mate|fated)$/;
  function relIn(input, i, j) {
    var best = '';
    ((input && input.ties) || []).forEach(function (t) {
      if (!t || !((t.a === i && t.b === j) || (t.a === j && t.b === i))) return;
      if (t.type === 'spouse' && t.cold !== 'divorced') best = 'spouse';
      else if (LOVER_T.test(t.type) && best !== 'spouse') best = 'lover';
    });
    return best;
  }
  /* 動いている回の関係（HK.Ties.all。夫婦は恋人の関係に spouse の印） */
  function relKind(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = '';
    tl.forEach(function (t) {
      if (!t) return;
      if ((t.type === 'spouse' || t.spouse) && t.married !== 'divorced' && t.type !== 'ex') best = 'spouse';
      else if (LOVER_T.test(t.type) && best !== 'spouse') best = 'lover';
    });
    return best;
  }
  function couple(C) { return C.slice(0, 2); }

  /* 恋愛にはならないが、体の関係にはなってよい二人（関係ごとの「恋愛：なし」など。恋愛対象・受け攻め・R18 にしない相手は HK.sexBlocked・HK.Pos.okSex が見る。版を問わない） */
  function bodyPair(A, B) { var P = HK.Pos; return !!(A && B && A !== B && !(HK.sexBlocked && HK.sexBlocked(A, B)) && (!P || !P.okSex || P.okSex(A, B))); }
  /* ---------- 始める前の検査（2.3・2.4。どの版でも止める） ---------- */
  function blockOf(input) {
    var C = ((input && input.chars) || []).map(function (c, i) { var o = Object.assign({}, c); o.i = i; return o; });
    if (C.length < 2) return '';
    var A = C[0], B = C[1];
    /* 恋愛対象の設定で恋愛にならない二人（関係の種類ではなく住人の設定）は始めない */
    try { if (HK.loveOK && !topTop(A, B) && !(HK.loveOK(A, B) && HK.loveOK(B, A)) && !bodyPair(A, B)) return HK.SAFE_ON ? 'この二人は住人の設定（恋愛対象など）では恋愛にならないので、この部屋のカップルとして配信できません。恋愛対象の設定を見直してください' : 'この二人は住人の設定（恋愛対象・恋愛にしない相手など）では恋愛にならないので、この部屋のカップルとして配信できません。設定を見直してください'; } catch (e) { /* 判定できない名簿では止めない */ }
    var env = (input && input.env) || {};
    if (env.form === 'couple' && topTop(A, B)) return HK.SAFE_ON ? '二人とも「攻め」の設定なので、カップル配信は始められません。ソロ配信にするか、どちらかの設定を変えてください' : '二人とも攻めなので、カップル配信は始められません。ソロ配信にするか、どちらかを受けかリバ、おまかせにしてください';
    return '';
  }

  /* ---------- 目標（8 章。看病の部屋の sgoal・lgoal と同じ仕組み）。文は haishin-end-text.js の T.GOAL_S／T.GOAL_L（[立場][態度] の { t, k }）---------- */
  var GOAL_OPT = {
    s: [
      ['on', 'dousetsu', '同接を増やす'], ['on', 'supa', 'スパチャを集める'], ['on', 'jiman', '相方を自慢する（カップル）'], ['on', 'yasashiku', 'リスナーに優しくする'],
      ['on', 'saigo', '最後まで配信する'], ['on', 'ryouri', '料理を成功させる（料理配信）'], ['on', 'clear', 'ゲームをクリアする（ゲーム配信）'],
      ['off', 'aitai', '相手に会いたいと言わせる（ソロ配信）'],
      ['b', 'kiss', 'キスまで行く'], ['b', 'hazu', '恥ずかしいことはしない'], ['b', 'nenai', '先に寝ない（寝落ち配信）'], ['b', 'tere', '相方を照れさせる（カップル）']
    ],
    l: [
      ['b', 'ninki', '人気配信者になる'], ['b', 'kouhyou', '二人のことを公表する'], ['b', 'kekkon', '結婚の報告をする（夫婦は改めて誓う）'], ['b', 'yameru', '配信をやめて二人で過ごす'],
      ['b', 'amayakasu', '相手をもっと甘やかす'], ['b', 'su', '相手に素を見せる'], ['b', 'kinen', '二人の記念の配信にする'], ['b', 'hitorijime', '相手を独り占めする']
    ]
  };
  var GOAL_GRP = { on: '配信する側の目標', off: '画面の外の側の目標', b: 'どちらでも' };
  function goalOpts(kind) {
    var T0 = TX();
    if (T0.GOAL_OPT && T0.GOAL_OPT[kind]) return T0.GOAL_OPT[kind].map(function (o) { return { id: o[1], label: o[2], group: (T0.GOAL_GRP || GOAL_GRP)[o[0]] || '' }; });
    return GOAL_OPT[kind].map(function (o) { return { id: o[1], label: o[2], group: GOAL_GRP[o[0]] }; }); }
  function goalDef(kind, k) { return GOAL_OPT[kind].filter(function (o) { return o[1] === k; })[0] || null; }
  /* 設定に合う種か（料理・ゲーム・寝落ち・カップル・ソロの画面の外） */
  function goalFits(S, k, side) {
    if (k === 'ryouri') return S.kind === 'cook'; if (k === 'clear') return S.kind === 'game'; if (k === 'nenai') return S.kind === 'neochi';
    if (k === 'jiman' || k === 'tere' || k === 'kiss') return S.form === 'couple' || k === 'kiss';
    if (k === 'aitai') return S.form === 'solo' && side === 'off';
    var d = goalDef('s', k); if (d && d[0] === 'on' && side === 'off') return false;
    return true;
  }
  function goalOf(ctx, c, side, kind) {
    var S = st(ctx), T0 = TX(), G = (kind === 's' ? T0.GOAL_S : T0.GOAL_L) || {}, p = per(c);
    var want = pickOfChar(ctx, c, kind === 's' ? 'sgoal' : 'lgoal');
    var lab = function (k) { var d = goalDef(kind, k); return d ? d[2].replace(/（[^）]*）$/, '') : ''; };
    var all = flat(G[side]).concat(flat(G.b)).filter(function (g) { return g && g.k && (kind === 'l' || goalFits(S, g.k, side)); });
    if (want && goalDef(kind, want) && (kind === 'l' || goalFits(S, want, side))) {
      var own = all.filter(function (g) { return g.k === want; }), g0 = pickOf(ctx, own);
      return { t: g0 ? g0.t : lab(want), k: want, user: true };
    }
    var base = ((G[side] || {})[p] || []).filter(function (g) { return g && g.k && (kind === 'l' || goalFits(S, g.k, side)); });
    var g1 = pickOf(ctx, base.length ? base : all);
    if (g1) return { t: g1.t, k: g1.k, user: false };
    var keys = GOAL_OPT[kind].filter(function (o) { return (o[0] === side || o[0] === 'b') && (kind === 'l' || goalFits(S, o[1], side)); });
    var o2 = pickOf(ctx, keys);
    return o2 ? { t: lab(o2[1]), k: o2[1], user: false } : null;
  }
  function goalLabel(c, gs, gl) { c.goal = { id: 'hs', label: '短期「' + (gs ? gs.t : '') + '」' + (gs && gs.user ? '（選んだ目標）' : '') + '／長期「' + (gl ? gl.t : '') + '」' + (gl && gl.user ? '（選んだ目標）' : '') }; }

  /* ---------- 性感帯（6.6。R18 版だけ。候補の表は全年齢版に入れない） ---------- */
  var zonesOf = function () { return []; };
  /* r18:begin */
  zonesOf = function (ctx, c, o) {
    var P = HK.Pos, nk = nightKind(c, o), p = per(c);
    var W = { '耳': 1, '首筋': 1, 'うなじ': 1, '鎖骨': 1, '{胸}': 1, '{乳首}': 1, '脇腹': 1, '腰': 1, '背中': 1, '内もも': 1, '指先': 1, '{陰核}': 1 };
    var add = function (k, v) { if (W[k] != null) W[k] += v; };
    if (nk === 'shy') { add('耳', 3); add('首筋', 3); } else if (nk === 'maso') { add('{乳首}', 3); add('首筋', 2); } else if (nk === 'sweet') { add('背中', 3); add('腰', 3); } else if (nk === 'sadist' || nk === 'mean') { add('指先', 3); add('うなじ', 3); }
    if (p === 'tsun') add('耳', 2); else if (p === 'cool') add('うなじ', 2); else if (p === 'devoted') add('鎖骨', 2);
    if (!(P && P.hasF && P.hasF(c))) delete W['{陰核}'];
    var keys = Object.keys(W), out = [], n = ctx.rng() < 0.6 ? 1 : 2;
    while (out.length < n && keys.length) {
      var sum = keys.reduce(function (s, k) { return s + W[k]; }, 0), r = ctx.rng() * sum, i = 0;
      for (; i < keys.length; i++) { r -= W[keys[i]]; if (r <= 0) break; }
      out.push(keys[Math.min(i, keys.length - 1)]); keys.splice(Math.min(i, keys.length - 1), 1);
    }
    return out;
  };
  /* r18:end */

  /* ---------- 始まり ---------- */
  function setup(ctx) {
    var C = ctx.chars, A = C[0], B = C[1] || C[0], env = ctx.env;
    var S = ctx.hs = { A: A, B: B, used: {}, cmUsed: {}, nMain: 0, ev: [], lastEv: [], evBy: {}, lastEvBy: {}, act: null, actMix: false, lastAct: null, setN: 0, rel: { n: 0, used: {}, fight: null, last: -9 }, dirLog: [], series: [], setHits: {}, beh: { serve: 0, shy: 0, jeal: 0, sunao: 0, odd: 0, jealBy: null }, kiss: 0,
      stage: 1, ansSt: {}, stall: 0, stallTot: 0, mid: 'none', leak: null, leakFate: null, sexDone: 0, again: 0, ended: null, endAt: 999, asleep: 0, sleepAt: -1, sleeper: null,
      scSum: 0, scMax: 0, scNow: [], setUsed: {}, stepSc: 0, trend: 0, s: 0, gameRes: { win: 0, lose: 0 }, heat: 0, pt: 0, zones: {}, regulars: [], capped: false, bigAns: false, quit: null, hits: 0 };
    H._dirLog = S.dirLog;   /* 点検の道具だけが読む控え（記録には入らない） */
    S.rk = A !== B ? relKind(ctx, A, B) : '';
    /* 恋人・夫婦で、二人が恋愛してよい組（恋愛対象など）のときだけ配信する。ほかは始めの区切りで案内して終える（画面からは scen.check が止める） */
    /* どんな関係の二人でも配信する（この部屋ではカップルとして扱う。2026-11-06 の利用者の指示）。恋人・夫婦でない二人は文の上では恋人の扱い（S.rk＝'lover'）で、
       結末の結婚報告だけは恋人・夫婦のときだけ（ほかは「二人の関係を公表」。haishin-end.js）。恋愛の対象の設定で恋愛にならない二人（HK.loveOK が片方でも偽）は、
       関係ではなく住人の設定の問題なので、今までどおり始めない（カップルとして扱うと恋愛対象に合わない二人の恋愛・夜になる。scen.check も止める） */
    S.rkReal = S.rk; S.relOther = !S.rk; if (!S.rk) S.rk = 'lover';
    S.loveOk = A !== B && (HK.loveOK ? HK.loveOK(A, B) && HK.loveOK(B, A) : true);
    /* 恋愛にならない二人でも、体の関係になってよい二人（関係の「恋愛：なし」など）は「体だけの二人」として配信する（恋愛の出来事・関係性の出来事・結婚報告は出さない。
       全年齢版・全年齢モードは段 2 まで）。恋愛対象・受け攻めの設定で体の関係にもならない二人は始めない */
    S.bodyOnly = !S.loveOk && bodyPair(A, B);
    S.stop = A === B || (!S.loveOk && !S.bodyOnly && !topTop(A, B));
    /* 無関心・和らぐ前の恐怖の二人（関係の札 apathy・HK.fearHeld）は、カップルとして配信はするが、恋愛の出来事に入らない：段 2 の質問まで（S.cap＝'talk'。
       段 3 の好きなところ・嫉妬の質問、キス、性格の行動の嫉妬・素に戻る、関係性の出来事、結末の結婚報告・公表を出さない） */
    S.cold = A !== B && (((HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : []).some(function (t) { return t && t.type === 'apathy'; })) || !!(HK.fearHeld && HK.fearHeld(A, B)));
    if (S.cold) S.loveOk = false;
    S.romOk = !S.stop && (!ctx.romanceOk || ctx.romanceOk([A, B], false));
    S.kind = KIND[env.kind] ? env.kind : 'zatsu';
    S.size = SIZE[env.size] ? env.size : 's100';
    S.sc = SCB[env.sc] != null ? env.sc : 'mid';
    S.hours = HOURS.indexOf(+env.hours) >= 0 ? +env.hours : 2;
    S.N = S.hours * 2;
    S.t0 = KIND[S.kind].t0;
    S.home = S.rk === 'spouse';
    S.hn = {};
    [A, B].forEach(function (c) {
      var n = pickOfChar(ctx, c, 'hname');
      S.hn[c.i] = n && String(n).trim() ? String(n).trim().slice(0, 12) : c.name;
      c.life = c.life || { job: '' };
      if (LF && LF.role) LF.role(ctx, c, pickOfChar(ctx, c, 'chore'));
    });
    var fo = formOf(ctx.input, A, B, ctx.rng());
    /* 攻め×攻めのカップル（画面からは止まる。点検の道具などで直に回したとき）はソロにする */
    if (fo.form === 'couple' && fo.tt) { var f2 = Object.assign({}, ctx.input, { env: Object.assign({}, env, { form: 'solo' }) }); fo = formOf(f2, A, B, 0.9); }
    S.form = fo.form; S.on = fo.on; S.off = fo.off;
    var P = HK.Pos;
    if (S.form === 'couple') { var od = P && P.order ? P.order(A, B) : [A, B]; S.top = od[0]; S.bot = od[1]; }
    else { S.top = P && P.hardTop && P.hardTop(S.on[0], S.off) ? S.on[0] : S.off; S.bot = S.top === S.on[0] ? S.off : S.on[0]; }
    var fem = function (c) { return !!(P && P.isF && P.isF(c)); };
    S.sh = HK.PairR18 && HK.PairR18.shape ? HK.PairR18.shape(S.top, S.bot) : fem(S.top) && fem(S.bot) ? 'ff' : fem(S.top) ? 'fm' : 'mf';
    S.charm = {}; [A, B].forEach(function (c) { S.charm[c.i] = ctx.stat ? ctx.stat(c, 'charm') : 3; });
    S.game = S.kind === 'game' ? pickOf(ctx, GAME_T) : '';
    /* 料理配信：作れる人（3.5） */
    S.cooks = S.on.filter(function (c) { return LF && LF.canCook ? LF.canCook(c) : true; });
    S.cookFail = S.kind === 'cook' && !S.cooks.length;
    /* 料理の名前（{dish}）：作る人の好物か、部屋の献立 */
    var fl = HK.Food && HK.Food.like ? (S.cooks.length ? HK.Food.like(S.cooks[0]) : []).concat(HK.Food.like(other(S, S.cooks[0] || S.on[0]))) : [];
    S.dish = pickOf(ctx, fl.length ? fl : ['カレー', 'オムライス', '肉じゃが', 'パスタ', '餃子', '親子丼', 'ハンバーグ', 'グラタン']);
    /* 同接・スパチャ・発情度（6.2・6.3） */
    S.v = Math.max(3, Math.round(SIZE[S.size] * (0.6 + 0.3 * ctx.rng())));
    S.v0 = S.vPeak = S.v;
    S.night = HK.Pos && HK.Pos.night ? HK.Pos.night(ctx) : 50;
    S.r18 = !HK.SAFE_BUILD && !HK.SAFE_ON;
    var LIB = { none: 0, low: 8, '': 18, high: 32 }, NK = { sweet: 4, sadist: 6, mean: 6, maso: 6, shy: -4 };
    var heat0 = function (c) {
      var h = S.rk === 'spouse' ? 8 : 5;
      if (S.r18) { var lb = P && P.libOf ? P.libOf(c) : ''; h += (LIB[lb] != null ? LIB[lb] : 18) + S.night * 0.2 + (NK[nightKind(c, other(S, c))] || 0); }
      return h;
    };
    S.heat = clamp(Math.round(S.on.reduce(function (s, c) { return s + heat0(c); }, 0) / S.on.length), 0, 100);
    /* 段の上限（6.4）：全年齢・夜 0・体の関係にならない二人・R18 に参加しない人がいる → 'kiss'（段 3 ＋段 4 の軽い要求） */
    S.cap = S.cold || (S.bodyOnly && !(HK.bodyOK && HK.bodyOK(A, B))) ? 'talk' : !S.r18 || (P && P.nightOff && P.nightOff(ctx)) || !(HK.bodyOK ? HK.bodyOK(A, B) : false) || A.noR18 || B.noR18 ? 'kiss' : 6;
    S.capSt = S.cap === 'talk' ? 2 : S.cap === 'kiss' ? 4 : 6;
    S.n100 = S.r18 && S.cap === 6 && S.night >= 100;
    if (S.r18) [A, B].forEach(function (c) { S.zones[c.i] = zonesOf(ctx, c, other(S, c)); });
    S.heatT = HK.Heat && HK.Heat.of ? HK.Heat.of(ctx, A, B) : '';
    /* 寝落ち配信：眠る区切り（1〜3。1 時間なら 1。夜 100 は本番が済むまで眠らない） */
    if (S.kind === 'neochi') {
      S.sleepAt = S.hours === 1 ? 1 : 1 + Math.floor(ctx.rng() * 3);
      var lv = function (c) { return (c.life && /morning|asa/.test(String(c.life.time || '')) ? -50 : 0) + (S.heat || 0); };
      S.sleeper = S.on.length > 1 && lv(S.on[1]) < lv(S.on[0]) ? S.on[1] : S.on[0];
    }
    /* P2・P3 が読む欄 */
    S.married = S.rk === 'spouse'; S.hour = Math.floor((S.t0 % 1440) / 60); S.sleepFirst = S.sleeper || null; S.offCame = false; S.gameWin = false;
    /* 目標（短期・長期）は haishin-end.js の HK.HaishinEnd.init（S.goal・S.rel0E・c.goal）。無い本体の組み合わせでは下の代わり。立場：配信する人 'on'／画面の外 'off' */
    if (!S.stop && HK.HaishinEnd && HK.HaishinEnd.init) HK.HaishinEnd.init(ctx);
    if (!S.goal) S.goal = {};
    if (!(HK.HaishinEnd && HK.HaishinEnd.init)) [A, B].forEach(function (c) {
      var side = S.on.indexOf(c) >= 0 ? 'on' : 'off';
      var gs = goalOf(ctx, c, side, 's'), gl = goalOf(ctx, c, side, 'l');
      S.goal[c.i] = { s: gs, l: gl, side: side };
      goalLabel(c, gs, gl);
    });
    C.forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'hs', label: '' }; c.autoAction = false; c.autoGoal = false; });
    ctx.place = S.home ? '二人の家の配信部屋' : hn(S, S.on[0]) + 'の配信部屋';
    S.warn = fo.warn;
    if (!S.stop) {
      if (CK() && CK().regulars && !(S.regulars && S.regulars.length)) { try { CK().regulars(ctx); } catch (e) { /* 常連が決まらなくても動く */ } }
      if (S.r18 && H.r18 && H.r18.init) H.r18.init(ctx, S);
    }
  }

  /* ---------- 同接・スパチャ・発情度（6.2・6.3） ---------- */
  var YEN_T = [100, 200, 500, 1000, 2000, 5000];
  function scStep(ctx, S, asleep) {
    var rng = ctx.rng, base = { few: [0, 1], mid: [1, 3], whale: [2, 4] }[S.sc], n = base[0] + Math.floor(rng() * (base[1] - base[0] + 1));
    if (asleep) n = Math.floor(n / 2);
    n = Math.round(n * clamp(log10(S.v) / 2, 1, 2));
    var out = [];
    for (var i = 0; i < n; i++) {
      var w = YEN_T.map(function (y, k) { return Math.pow(1 + 0.3 * S.stage, k / 2) / (1 + k * 0.6); });
      var sum = w.reduce(function (s, x) { return s + x; }, 0), r = rng() * sum, k = 0;
      for (; k < w.length - 1; k++) { r -= w[k]; if (r <= 0) break; }
      out.push(YEN_T[k]);
    }
    if (S.sc === 'whale' && rng() < 0.35) out.push(Math.min(50000, 10000 * (1 + Math.floor(rng() * 5))));
    return out.map(function (y) { return Math.min(50000, y); });
  }
  function vStep(ctx, S, o) {
    var g = -0.03 + ctx.rng() * 0.08;
    g += 0.04 * (o.ansSt || 0) + (S.ev.indexOf('kiss') >= 0 ? 0.08 : 0) + (S.ev.indexOf('jeal') >= 0 || S.ev.indexOf('sunao') >= 0 ? 0.03 : 0) + (o.trend || 0);
    if (S.ev.indexOf('stall') >= 0) g -= 0.06;
    var h = Math.floor((o.clock % 1440) / 60);
    if (h >= 2 && h < 5) g -= 0.08;
    if (o.asleep) g -= 0.10;
    var v = S.v * (1 + g);
    if (S.leak === 'on') v *= S.size === 's10k' ? 2 + ctx.rng() : 2 + ctx.rng() * 3;
    S.v = clamp(Math.round(v), S.size === 's10' ? 3 : 3, SIZE[S.size] * 30);
    S.vPeak = Math.max(S.vPeak, S.v);
  }
  function heatStep(S, o) {
    var d = 2 * (o.ansSt || 0) + (S.ev.indexOf('kiss') >= 0 ? 6 : 0) + (o.big ? 10 : 0) - (S.ev.indexOf('stall') >= 0 ? 4 : 0) - (o.asleep ? 5 : 0);
    S.heat = clamp(S.heat + d, 0, 100);
  }
  function ptOf(S) { return 20 * log10(S.v) + 0.6 * S.heat + SCB[S.sc]; }

  /* ---------- 渋り（6.5） ---------- */
  function stallP(ctx, S, who) {
    /* 性格：態度（恥ずかしがり・堅い・丁寧は渋りやすく、穏やか・尽くす・自由は渋りにくい）と夜の性格（恥じらいは強く渋る、甘々は渋りにくい）を掛け合わせる */
    var p = per(who), nk = nightKind(who, other(S, who));
    var m = (/^(shy|stern|polite)$/.test(p) ? 1.2 : /^(gentle|devoted|free)$/.test(p) ? 0.75 : 1) * (nk === 'shy' ? 2 : nk === 'sweet' ? 0.8 : 1);
    var base = S.r18 ? (100 - S.night) / 100 : 0.25;
    /* 続けて渋るほど、次も渋る見込みは下がる。場が温まる（発情度が上がる）ほども下がる（3 回続けての途中終了を、設計 11 章の目安：
       二人とも恥じらいの配信で 3〜8／20、ほかは 0〜3／20 に収める。2026-11-06 P15b の計測で係数を決めた） */
    return clamp(base * m * (1 - 0.4 * S.stall) * (1 - S.heat / 500), 0, 0.9);
  }
  /* 段の判定：上がる（'up'）／渋る（'stall'）／そのまま（''）。夜 100 は渋らず、残りの区切りで段 6 に届くよう線を見ずに上げる */
  function stageJudge(ctx, S, s) {
    S.pt = ptOf(S);
    if (S.stage >= S.capSt) { S.capped = true; return ''; }
    var r = S.N - s, need = S.capSt - S.stage;
    /* 夜 100：残りの区切りで段 6 に届くよう線を見ずに上げる。カップルは一区切りに一度だけ、残りの区切りに割って上げる（配信開始の区切りでいきなり本番に
       ならないように。2026-11-06 P15b の通し読み）。ソロは段 6 のあとの中盤（玩具→電話→…）に区切りが要るので、一区切りで続けて上げてよい */
    if (S.n100 && r - 2 <= need) {
      if (S.form === 'couple') {
        if (S.upAt === s) return '';
        S.upAt = s; S.stage += Math.min(3, need, Math.ceil(need / Math.max(1, r - 1)));
      } else S.stage += Math.min(3, need);
      S.stall = 0; return 'up';
    }
    if (!S.ansSt[S.stage] || S.pt < LINE[S.stage]) return '';
    /* 渋った直後の区切りは、次の段を持ちかけない（同じ渋りが続けて並ばないように） */
    if (S.stallCool != null && s < S.stallCool) return '';
    var next = S.stage + 1;
    if (next >= 3 && !S.n100) {
      var who = S.form === 'couple' ? pickOf(ctx, S.on) : S.on[0];
      if (ctx.rng() < stallP(ctx, S, who)) return { stall: who };
    }
    S.stage = next; S.stall = 0;
    return 'up';
  }

  /* ---------- 応え方（7.1：態度 9 種と夜の性格。運命の揺らぎでらしくない方へ） ---------- */
  function howOf(ctx, S, c) {
    var p = per(c), nk = nightKind(c, other(S, c)), w = {};
    Object.keys(HOW_W).forEach(function (k) { w[k] = HOW_W[k][p] || 1; });
    if (nk === 'sweet') w.sunao += 1; if (nk === 'sadist' || nk === 'mean' || nk === 'maso') w.serve += 1; if (nk === 'shy') w.shy += 2;
    if (S.heat >= 60) w.sunao += 1;
    var keys = Object.keys(w), sum = keys.reduce(function (s, k) { return s + w[k]; }, 0), r = ctx.rng() * sum, i = 0;
    for (; i < keys.length - 1; i++) { r -= w[keys[i]]; if (r <= 0) break; }
    var how = keys[i], odd = HK.PairReact && HK.PairReact.pOdd && ctx.rng() < HK.PairReact.pOdd(ctx) * 0.5;
    if (odd) how = keys.slice().sort(function (x, y) { return w[x] - w[y]; })[0];
    return { how: how, odd: !!odd };
  }

  /* ---------- メインの質問・要求（4.2） ---------- */
  function handle(ctx, S) { var L = HK.Mob && HK.Mob.list ? HK.Mob.list('haishin-h') : []; return pickOf(ctx, L && L.length ? L : FB_HANDLE); }
  /* 段 st の要求の候補（C.REQ[段]：段 1 は共通の配列、段 2〜6 は solo／couple。段 3 のカップルは top／bot／both） */
  function reqPool(ctx, S, stg) {
    var R0 = CM().REQ || {}, r = R0[stg], out = [];
    if (Array.isArray(r)) out = r.slice();
    else if (r) {
      var f = r[S.form];
      if (Array.isArray(f)) out = f.slice();
      else if (f) ['top', 'bot', 'both'].forEach(function (k) { (f[k] || []).forEach(function (x) { out.push(Object.assign({ to: k }, typeof x === 'string' ? { t: x } : x)); }); });
    }
    if (!out.length) out = (FB_REQ[stg] || []).slice();
    return out.map(function (x) { return typeof x === 'string' ? { t: x, k: '' } : x; });
  }
  /* 要求がこの配信で出てよいか（上限・キスの回数・体と役・R18） */
  function reqOk(ctx, S, q, stg) {
    if (!q || !q.t) return false;
    if (q.need === 'solo' || q.need === 'couple') { if (q.need !== S.form) return false; }
    if (stg >= 4 && !LIGHT_K[q.k]) { if (!S.r18 || S.cap !== 6) return false; }
    if (stg >= 5 && !S.r18) return false;
    if (KISS_K[q.k] && S.kiss >= 2) return false;
    if (q.k === 'onani' && S.form !== 'solo') return false;
    if (/^(kuchi|ana|ireru)$/.test(q.k) && S.form !== 'couple') return false;
    if (q.k === 'tel' && S.form !== 'solo') return false;
    var who = targetOf(S, q);
    if (q.need && !/^(solo|couple)$/.test(q.need) && !needOk(S, who, q.need)) return false;
    var U = S.cmUsed[q.t] || 0;
    return U < 2;
  }
  /* 要求が呼ぶ人（{h}）。段 3 のカップルは宛て先（top／bot）、段 4〜6 の行為は攻めがする（口の奉仕は受けが攻めに）、ほかは二人のどちらか */
  function targetOf(S, q) {
    if (S.form === 'solo') return S.on[0];
    if (q.to === 'top' || q.need === 'top') return S.top;
    if (q.to === 'bot' || q.need === 'bot') return S.bot;
    if (q.k === 'kuchi') return S.bot;
    if (/^(sawaru|chikubi|ana|ireru|kubi|mimi|deep|seikan|koe|shitagi|nugu|vibe)$/.test(q.k)) return q.k === 'vibe' || q.k === 'koe' || q.k === 'shitagi' || q.k === 'nugu' ? S.bot : S.top;
    return q.pick || S.on[0];
  }
  function askOf(ctx, S, stg) {
    var K2 = CK();
    if (K2 && K2.main) {
      if (K2.has && !K2.has(ctx, stg)) return null;
      var y0 = S.scNow.length && ctx.rng() < 0.5 ? S.scNow.shift() : 0, r = K2.main(ctx, { stage: stg, yen: y0 });
      if (!r || !r.text) { if (y0) S.scNow.unshift(y0); return null; }
      return { t: r.text, head: r.text, k: r.ak || r.k, k0: r.k, who: r.tgt || S.on[0], other: r.other, to: r.sub, yen: r.yen || 0, handle: r.handle };
    }
    var pool = reqPool(ctx, S, stg).filter(function (q) { return reqOk(ctx, S, q, stg); });
    var fresh = pool.filter(function (q) { return !S.cmUsed[q.t]; });
    var q = pickOf(ctx, fresh.length ? fresh : pool);
    if (!q) return null;
    S.cmUsed[q.t] = (S.cmUsed[q.t] || 0) + 1;
    q = Object.assign({}, q);
    if (S.form === 'couple' && !q.to && !q.need && !/^(sawaru|chikubi|ana|ireru|kubi|mimi|deep|seikan|koe|shitagi|nugu|vibe|kuchi)$/.test(q.k)) q.pick = pickOf(ctx, S.on);
    q.who = targetOf(S, q);
    q.handle = handle(ctx, S);
    q.yen = S.scNow.length && ctx.rng() < 0.5 ? S.scNow.shift() : 0;
    return q;
  }
  /* 導入の地の文＋「＠コメント」（話し手なし・口調を変えない） */
  function askText(ctx, S, q, a, b) {
    if (q.head) return q.head;
    var I = CM().INTRO, intro = '';
    var pool = flat(I).filter(function (x) { var t = typeof x === 'string' ? x : x && x.t; return t && (q.yen ? /\{yen\}/.test(t) : !/\{yen\}/.test(t)); });
    intro = pickT(ctx, pool, a, b, true);
    if (!intro) intro = q.yen ? '{handle}から {yen} のスパチャとともに、コメントが届いた。' : '{handle}のコメントが、画面の端に大きく浮かんだ。';
    var o = { handle: q.handle, yen: q.yen ? yen(q.yen) : '' };
    var cm = q.t.replace(/\{h\}/g, hn(S, q.who)).replace(/\{h2\}/g, hn(S, other(S, q.who))).replace(/\{ch\}/g, chName(S)).split('{相方}').join(aikata(S, other(S, q.who)));
    return fill(ctx, intro, a, b, o) + '「＠' + cm + '」';
  }
  /* 応えの文：T.ANS[段][種類][応え方]（段 3 のカップルは { top: [...], bot: [...] } のこともある） */
  /* 表の値 x から文の配列：配列ならそのまま、{ top, bot } なら答える人の役（受け攻め）の側、ほかは中をつなぐ */
  function byRole(S, x, who) {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (typeof x === 'object' && (x.top || x.bot)) return x[who === S.top ? 'top' : 'bot'] || [];
    return flat(x);
  }
  function ansList(S, stg, k, how, who) {
    var T0 = TX(), x = ((T0.ANS || {})[stg] || {})[k];
    x = x && !Array.isArray(x) && !(x.top || x.bot) && (x[how] || x.all) ? x[how] || x.all : x;
    return byRole(S, x, who);
  }
  /* 二人目の返し：T.ANS2[段][種類][応え方]（段 3 は { top, bot }＝返す人の役） */
  function ans2List(S, stg, k, how, who) {
    var A2 = (TX().ANS2 || {})[stg] || {}, x = A2[k];
    if (x && !Array.isArray(x) && !(x.top || x.bot)) x = x[how] || x.all || flat(x);
    var l = byRole(S, x, who);
    if (!l.length) l = byRole(S, A2[how], who).concat(byRole(S, A2.all, who));
    return l;
  }
  function foodEx(ctx, c) {
    var F = HK.Food; if (!F || !F.like) return null;
    var lk = F.like(c), ts = F.taste ? F.taste(c) : [];
    if (!lk.length && !ts.length) return null;
    return { food: lk.length ? pickOf(ctx, lk) : '', taste: ts.length ? (F.tasteWord ? F.tasteWord(pickOf(ctx, ts)) : pickOf(ctx, ts)) : '' };
  }
  /* 一つの質問・要求に応える。戻り値 'ans'（応えた）／'big'（段 4 以上の行為に応えた）／''（何もしなかった） */
  function answer(ctx, S, q, stg) {
    var a = q.who, b = S.form === 'couple' ? other(S, a) : S.off, T0 = TX(), hw = howOf(ctx, S, a), how = hw.how, k = q.k || '';
    var head = askText(ctx, S, q, a, b);
    S.beh[how] = (S.beh[how] || 0) + 1;
    if (hw.odd) S.beh.odd++;
    /* 段 4 以上の R18 の要求（両方の版のファイルの外：haishin-r18.js） */
    if (stg >= 4 && !LIGHT_K[k]) {
      if (S.r18 && H.r18 && H.r18.answer) { var r = H.r18.answer(ctx, S, q, how, a, b, head); if (r) { S.ansSt[stg] = true; S.bigAns = true; return 'big'; } }
      var ft = fbT(ctx, FB.light, a, b);
      rec(ctx, [a, b], head + fill(ctx, ft, a, b), '踏み込んだ要求に応えた（' + STAGE_NAME[stg] + '）', 'bond', { tag: 'リクエスト', odd: hw.odd });
      S.ansSt[stg] = true;
      return 'ans';
    }
    /* 段 4 の軽い要求（キスは HK.Kiss の型） */
    if (stg >= 4) {
      if ((k === 'kiss') && S.form === 'couple' && HK.Kiss && HK.Kiss.scene) {
        var ld = pickT(ctx, T0.KISS_LEAD, a, b), tl = pickT(ctx, T0.KISS_TAIL, a, b);
        rec(ctx, [a, b], head, 'キスをせがむコメント', 'bond', { tag: 'リクエスト' });
        var kr = HK.Kiss.scene(ctx, a, b, { trig: S.ev.indexOf('sc') >= 0 || q.yen ? 'hobi' : how === 'shy' ? 'karakai' : 'amae', lead: ld ? K.mark(ld) : undefined, tail: tl ? ' ' + fill(ctx, tl, a, b) : undefined, whyPre: '配信の部屋：コメントにせがまれてキス：', tag: 'キス' });
        if (kr && kr.e) { S.kiss++; S.ev.push('kiss'); S.evBy.kiss = { doer: a, taker: b }; setAct(S, a, b, 'kiss'); S.nMain++; if (q.yen) S.ev.push('sc'); S.ansSt[stg] = true; return 'ans'; }
      }
      var lt = pickT(ctx, dig(T0.LIGHT, k, how), a, b) || pickT(ctx, dig(T0.LIGHT, k), a, b) || fbT(ctx, FB.light, a, b);
      /* 軽い要求（ハグ・膝枕・あーん・撫でる・手をつなぐ）は、応えた人がする側かされる側かが文によって違う（あーんは食べさせてもらう側が応えることもある）ので、
         行為の向きを置かない（向きを言うコメントは出さない。通し読みで「あーん」を食べた側に「手が早い」が出た） */
      if (KISS_K[k]) setAct(S, a, b, k); else S.actMix = true;
      rec(ctx, [a, b], head + fill(ctx, lt, a, b), '軽い要求に応えた（' + kJa(k) + '・' + howJa(how) + '）', S.form === 'couple' ? 'romance' : 'bond', { tag: 'リクエスト', odd: hw.odd, ev: KISS_K[k] ? 'kiss' : how === 'sunao' ? 'sunao' : '' });
      if (KISS_K[k]) S.kiss++;
      S.ansSt[stg] = true;
      return 'ans';
    }
    /* 段 1〜3 の質問 */
    var ex = null;
    /* 好きな食べ物：好物の登録あり → food（{food}）、好きな味だけ → food_t（{taste}）、どちらも無し → food_none */
    if (/^food(?:_t|_none)?$/.test(k)) { ex = foodEx(ctx, a); k = ex && ex.food ? 'food' : ex && ex.taste ? 'food_t' : 'food_none'; }
    var t = pickT(ctx, ansList(S, stg, k, how, a), a, b) || pickT(ctx, ansList(S, stg, k, 'serve', a).concat(ansList(S, stg, k, 'shy', a), ansList(S, stg, k, 'sunao', a)), a, b) || fbT(ctx, FB.ans, a, b);
    var txt = head + fill(ctx, t, a, b, ex);
    /* カップルの段 1〜2 は二人目も返す（段 3 は宛て先の人が主に） */
    if (S.form === 'couple' && stg <= 3 && (stg < 3 || ctx.rng() < 0.5)) {
      var l2 = ans2List(S, stg, k, how, b);
      var t2 = pickT(ctx, l2, b, a) || (stg < 3 ? fbT(ctx, FB.ans2, b, a) : '');
      if (t2) txt += fill(ctx, t2, b, a, ex);
    }
    rec(ctx, [a, b], txt, (stg === 1 ? '視聴者のお願い' : stg === 2 ? '視聴者の質問' : 'ちょっと踏み込んだ質問') + '（' + kJa(k) + '・' + howJa(how) + '）', stg === 3 && S.form === 'couple' ? 'romance' : 'bond', { tag: stg === 1 ? 'コメント' : '質問', odd: hw.odd });
    if (q.yen) S.ev.push('sc');
    S.ansSt[stg] = true;
    return 'ans';
  }
  /* 渋る（停滞）：次の段の要求を出して、渋りの文（T.STALL[態度]）で応える */
  function stall(ctx, S, who) {
    var stg = Math.min(6, S.stage + 1), q = askOf(ctx, S, stg) || askOf(ctx, S, S.stage);
    if (q && q.head) who = q.who; else if (q) q.who = who;
    var b = S.form === 'couple' ? other(S, who) : S.off, T0 = TX();
    var t = pickT(ctx, dig(T0.STALL, per(who)), who, b) || pickT(ctx, flat(T0.STALL), who, b) || fbT(ctx, FB.stall, who, b);
    S.stall++; S.stallTot++; S.stallCool = (S.s || 0) + 2;
    rec(ctx, [who, b], (q ? askText(ctx, S, q, who, b) : '') + fill(ctx, t, who, b), '要求を渋った（停滞 ' + S.stall + ' 回目）', 'bond', { tag: '渋り', ev: 'stall' });
  }
  /* 途中終了（停滞 3 回）：T.QUIT[種]（kimazui 気まずくなって切る・kaisen 回線が落ちたことに・aikata 相方が止める・nakiwarai 泣き笑いで閉じる） */
  function quit(ctx, S, s) {
    /* T.QUIT[種]：kimazu 気まずくなって切る・kaisen 回線が落ちたことにする・tomeru 相方（ソロは画面の外の人）が止める・nakiwarai 泣き笑いで閉じる。{a}＝配信者、{b}＝相方 */
    var keys = ['kimazu', 'kaisen', 'nakiwarai', 'tomeru'], a = S.on[0], b = S.form === 'couple' ? S.on[1] : S.off;
    keys = keys.filter(function (x) { return hasT(ctx, dig(TX().QUIT, x), a, b); });
    var k = pickOf(ctx, keys.length ? keys : ['kimazu']);
    var T0 = TX(), t = pickT(ctx, dig(T0.QUIT, k), a, b) || pickT(ctx, flat(T0.QUIT), a, b) || fbT(ctx, FB.quit, a, b);
    rec(ctx, [a, b], fill(ctx, t, a, b), '配信を途中で終えた（' + ({ kimazu: '気まずくなって', kaisen: '回線のせいにして', nakiwarai: '泣き笑いで', tomeru: '相手が止めて' }[k] || '気まずくなって') + '）', 'bond', { tag: '途中終了' });
    S.quit = k; S.ended = 'stall'; S.endAt = s;
  }

  /* ---------- 区切りの様子・始まり（3.3。T.START[種類][形]・T.STEP[種類][種]） ---------- */
  function stepA(S) { return S.kind === 'cook' && S.cooks.length ? S.cooks[0] : S.on[0]; }
  /* 今の配信の種類（寝落ち配信で朝に目を覚ましたあとは雑談の表） */
  function liveKind(S) { return S.kindLive || S.kind; }
  H.liveKind = liveKind;
  /* 区切りの様子：種類の種（6 種）を一巡ずつ使う。一巡したら長い配信は耐久の出来事（T.SET.hours.long）を挟み、それでも足りなければ二巡目（同じ文は 2 回まで。2026-11-06 まとめ役の決定） */
  var STEP_ORD = { cook: { prep: 1, fire: 2, taste: 3, plate: 4, eat: 5, wash: 6 }, game: { begin: 1, die: 2, help: 2, hard: 2, clear: 3, next: 4 } };
  function stepPick(ctx, S, a, b) {
    var ST0 = (TX().STEP || {})[liveKind(S)] || {}, keys = Object.keys(ST0), seen = S.stepSeen = S.stepSeen || {};
    if (Array.isArray(ST0)) return pickT(ctx, ST0, a, b) || pickT(ctx, ST0, a, b, true);
    var fresh = keys.filter(function (k) { return !seen[k]; });
    if (!fresh.length) { S.stepSeen = seen = {}; fresh = keys.slice(); S.stepRound = (S.stepRound || 1) + 1; }
    /* 料理とゲームは進む順がある（下ごしらえ→…→盛り付け→食べる→洗い物、開始→…→クリア→次のゲーム）。順の札 STEP_ORD の数の小さい種から、
       同じ数の種どうしは混ぜて引く（盛り付けのあとに「材料を並べて」が出ないように。2026-11-06 P15b の通し読み） */
    var ord = STEP_ORD[liveKind(S)] || {}, rk = {};
    fresh.forEach(function (k) { rk[k] = ctx.rng(); });
    fresh.sort(function (x, y) { return ((ord[x] || 0) - (ord[y] || 0)) || (rk[x] - rk[y]); });
    for (var i = 0; i < fresh.length; i++) { var t = pickT(ctx, ST0[fresh[i]], a, b); if (t) { seen[fresh[i]] = 1; return t; } }
    return '';
  }
  function stepScene(ctx, S, s) {
    var T0 = TX(), a = stepA(S), b = S.form === 'couple' ? other(S, a) : S.off;
    if (s === 0) {
      var t0 = pickT(ctx, dig(T0.START, S.kind, S.form), a, b) || fbT(ctx, FB.start, a, b);
      rec(ctx, [a, b], fill(ctx, t0, a, b), '配信開始（' + KIND[S.kind].label + '配信・' + FORM_JA[S.form] + '・同接 ' + comma(S.v) + ' 人）', 'bond', { tag: '配信開始' });
      return;
    }
    var t = stepPick(ctx, S, a, b);
    /* 作れる人がいない料理配信の残りは失敗の文から */
    if (!t && S.kind === 'cook' && !S.cooks.length) { t = pickT(ctx, dig(T0.COOKFAIL, 'fail'), a, b); if (t) S.ev.push('fail'); }
    /* 種を使い切った：長い配信は耐久の出来事を区切りの様子の代わりに */
    if (!t && S.hours >= 12 && setEvent(ctx, S, s, 'hours')) return;
    if (!t) t = pickT(ctx, flat((T0.STEP || {})[liveKind(S)]), a, b, true) || fbT(ctx, FB.step, a, b);
    /* ゲームの勝ち負けの数え（res の札） */
    var me = null; flat((T0.STEP || {})[liveKind(S)]).forEach(function (x) { if (x && typeof x === 'object' && x.t === t) me = x; });
    if (me && me.res && S.gameRes[me.res] != null) { S.gameRes[me.res]++; if (me.res === 'lose') S.ev.push('lose'); }
    rec(ctx, [a, b], fill(ctx, t, a, b), '配信の様子（' + KIND[S.kind].label + '・' + clockW(clk(S, s)) + '・同接 ' + comma(S.v) + ' 人）', 'bond');
  }

  /* 区切りの様子を出し、あとで外せるように覚えておく（記録の位置・区切りの様子が動かした数え） */
  function stepHold(ctx, S, s, more) {
    var h = { from: ctx.log.length, nMain: S.nMain, ev: S.ev.length, seen: Object.assign({}, S.stepSeen || {}), round: S.stepRound, game: Object.assign({}, S.gameRes || {}), setUsed: Object.assign({}, S.setUsed || {}), setHits: Object.assign({}, S.setHits || {}), setN: S.setN || 0 };
    stepScene(ctx, S, s);
    if (more) more();
    h.list = ctx.log.slice(h.from); h.evAdd = S.ev.slice(h.ev); h.nAdd = S.nMain - h.nMain;
    return h;
  }
  function stepDrop(ctx, S, h) {
    if (!h || !h.list.length) return;
    h.list.forEach(function (e) {
      var i = ctx.log.indexOf(e); if (i >= 0) ctx.log.splice(i, 1);
      var c = e && e.actors && e.actors.length ? ctx.chars[e.actors[0]] : null;
      if (c && c.cats && c.cats[e.cat]) c.cats[e.cat]--;
    });
    h.evAdd.forEach(function (k) { var i = S.ev.indexOf(k, h.ev); if (i >= 0) S.ev.splice(i, 1); });
    S.nMain = Math.max(0, S.nMain - h.nAdd);
    S.stepSeen = h.seen; S.stepRound = h.round; S.gameRes = h.game; S.setUsed = h.setUsed; S.setHits = h.setHits; S.setN = h.setN;
  }

  /* ---------- 設定の出来事（5 章。T.SET[欄][値]＝出来事の配列、出来事＝文の配列。出来事 id は hs_set_<欄>_<値>_<添字＋1>。一つの出来事は一回の配信で一度だけ）。
     欄ごとに出た回数（S.setHits）を数え、少ない欄を先に ---------- */
  function hoursKey(S) { return S.hours <= 3 ? 'short' : S.hours === 6 ? 'mid' : 'long'; }
  function charmKey(S, c) { var v = S.charm[c.i]; return v <= 2 ? 'low' : v >= 4 ? 'high' : ''; }
  function hasName(S, c) { return !!(c && S.hn[c.i] && S.hn[c.i] !== c.name); }
  /* force：この配信でまだ設定の出来事（T.SET）が一つも出ていないときの、必ず出す一回（3.2。2026-11-06 の利用者の指示「1〜3 時間の配信でも設定の出来事が一度は出る」）。
     T.SET の出来事だけから選び、段 4 以上の区切りでは場の熱に障らない欄（規模・太さ・時間・名前・魅力・形）を先に、配信の種類の出来事（お便り・料理の手順など）をあとに回す */
  var SET_HOT = { size: 0, sc: 0, hours: 0, hname: 1, charm: 1, form: 1, role: 2, kind: 3 };
  function setEvent(ctx, S, s, only, force) {
    var T0 = TX(), SET = T0.SET || {}, a = S.on[ctx.rng() < 0.5 ? 0 : S.on.length - 1], b = S.form === 'couple' ? other(S, a) : S.off;
    var on0 = S.on[0], off0 = S.form === 'couple' ? S.on[1] : S.off;
    var c = [
      ['kind', liveKind(S), a, b], ['size', S.size, a, b], ['sc', S.sc, a, b], ['hours', hoursKey(S), a, b], ['form', S.form, a, b], ['hname', hasName(S, a) ? 'set' : 'none', a, b]
    ];
    var ck = charmKey(S, a); if (ck) c.push(['charm', ck, a, b]);
    if (S.form === 'solo') c.push(['role', 'off', on0, off0]);
    if (S.r18) { var lb = HK.Pos && HK.Pos.libOf ? HK.Pos.libOf(a) : ''; if (lb) c.push(['lib', lb === 'high' ? 'high' : 'low', a, b]); }
    /* 候補の出来事：[欄, 値, 出来事の id, 文の配列, {a}, {b}] */
    var ev = [];
    c.forEach(function (x) { var L = (SET[x[0]] || {})[x[1]]; if (!Array.isArray(L)) return; L.forEach(function (e, k) { var id = 'hs_set_' + x[0] + '_' + x[1] + '_' + (k + 1); if (!S.setUsed[id] && Array.isArray(e)) ev.push([x[0], x[1], id, e, x[2], x[3]]); }); });
    /* R18 の性欲の出来事（R.LIB[none|low|high][couple|solo]）・画面の外の人（T.OFF）・料理の失敗（T.COOKFAIL）・目標（T.GOALACT）は文の配列のまま */
    if (S.r18 && !only) { var lb2 = HK.Pos && HK.Pos.libOf ? HK.Pos.libOf(a) : ''; if (lb2) ev.push(['lib', 'r18', '', dig(RX().LIB, lb2, S.form), a, b]); }
    if (S.form === 'solo' && !only) ev.push(['role', 'off', '', flat(T0.OFF), on0, off0]);
    if (S.kind === 'cook' && !only) {
      var nc = S.on.filter(function (x) { return S.cooks.indexOf(x) < 0; })[0];
      if (nc && S.form === 'couple' && S.cooks.length === 1) ev.push(['cookfail', 'help', '', dig(T0.COOKFAIL, 'help'), nc, S.cooks[0]]);
      else if (nc && S.form === 'solo') ev.push(['cookfail', 'tel', '', dig(T0.COOKFAIL, 'tel'), nc, S.off]);
      if (!S.cooks.length) ev.push(['cookfail', 'fail', '', dig(T0.COOKFAIL, 'fail'), a, b]);
    }
    var gl = S.goal[a.i]; if (gl && !only) ev.push(['goal', '', '', dig(T0.GOALACT, gl.s && gl.s.k).concat(dig(T0.GOALACT, gl.l && gl.l.k)), a, b]);
    if (only) ev = ev.filter(function (x) { return x[0] === only; });
    if (force) ev = ev.filter(function (x) { return !!x[2]; });
    ev = ev.filter(function (x) { return hasT(ctx, x[3], x[4], x[5]); });
    if (!ev.length) return false;
    if (force && S.stage >= 4) ev.sort(function (x, y) { return ((SET_HOT[x[0]] || 0) - (SET_HOT[y[0]] || 0)) + (ctx.rng() - 0.5) * 0.9; });
    else ev.sort(function (x, y) { return (S.setHits[x[0]] || 0) - (S.setHits[y[0]] || 0) + (ctx.rng() - 0.5) * 0.9; });
    var f = ev[0], el = null, t = pickT(ctx, f[3], f[4], f[5]);
    if (!t) return false;
    (f[3] || []).forEach(function (x) { if (x && typeof x === 'object' && x.t === t) el = x; });
    if (f[2]) { S.setUsed[f[2]] = 1; S.setN = (S.setN || 0) + 1; }
    S.setHits[f[0]] = (S.setHits[f[0]] || 0) + 1;
    /* 札の効き：yen（その額のスパチャを累計に）・up（段を一つ早める）・トレンド入り（同接 +0.3） */
    if (el && el.yen) { S.scSum += el.yen; S.scMax = Math.max(S.scMax, el.yen); S.stepSc += el.yen; S.ev.push('sc'); if (el.yen >= 10000) S.ev.push('whale'); }
    if (el && el.up && S.stage < S.capSt) { S.stage++; S.stall = 0; }
    if (f[2] === 'hs_set_size_s10k_1') S.trend = 0.3;
    if (f[0] === 'cookfail') S.ev.push('fail');
    var WHY = { kind: '配信の種類', size: 'リスナーの規模', sc: 'スパチャの太さ', hours: '配信時間', form: '形', hname: '配信の名前', charm: '魅力', role: '画面の外の人', cookfail: '料理の失敗', goal: '目標', lib: '性欲' };
    rec(ctx, [f[4], f[5]].filter(Boolean), fill(ctx, t, f[4], f[5]), '設定の出来事（' + WHY[f[0]] + '）', 'bond');
    return true;
  }
  /* 性格の行動（30%）：嫉妬（直前の区切りにガチ恋のコメント・太客の名指し）・素に戻る（発情度 60 以上かキスの直後）・らしくない */
  function behave(ctx, S) {
    var T0 = TX(), BEH = T0.BEH || {}, last = S.lastEv || [];
    var gari = last.indexOf('gari') >= 0 || last.indexOf('whale') >= 0 || (!CK() && Object.keys(S.charm).some(function (k) { return S.charm[k] >= 4; }) && ctx.rng() < 0.3);
    var opts = [];
    if (gari && S.loveOk) {
      var tgt = S.on.filter(function (c) { return S.charm[c.i] >= 4; })[0] || S.on[0], jb = S.form === 'couple' ? other(S, tgt) : S.off;
      opts.push(['jeal', jb, tgt]);
    }
    if (S.loveOk && (S.heat >= 60 || last.indexOf('kiss') >= 0)) { var sa = pickOf(ctx, S.on); opts.push(['sunao', sa, S.form === 'couple' ? other(S, sa) : S.off]); }
    /* らしくない一面は一回の配信で 2 回まで（通し読みで 4 回並んだ。2026-11-06 P15b） */
    var oa = pickOf(ctx, S.on); if ((S.beh.odd || 0) < 2) opts.push(['odd', oa, S.form === 'couple' ? other(S, oa) : S.off]);
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i], a = o[1], b = o[2];
      /* ソロ：嫉妬は画面の外の人のメッセージ（jealOff。{a}＝画面の外の人）、素に戻るのは配信者が画面の外の人を思って（sunaoSolo） */
      var bk = S.form === 'solo' ? { jeal: 'jealOff', sunao: 'sunaoSolo' }[o[0]] : o[0];
      var list = o[0] === 'odd' ? dig(T0.ODD, per(a)).concat(Array.isArray(T0.ODD) ? T0.ODD : []) : dig(BEH, bk, per(a)).concat(dig(BEH, bk, 'gentle').length && !dig(BEH, bk, per(a)).length ? dig(BEH, bk, 'gentle') : []);
      var t = pickT(ctx, list, a, b);
      if (!t) continue;
      if (o[0] === 'jeal') { S.beh.jeal++; S.beh.jealBy = a.i; } else if (o[0] === 'sunao') S.beh.sunao++; else S.beh.odd++;
      var tx = fill(ctx, t, a, b);
      /* カップルの受け止め方（T.BEH_RE[jeal|sunao][受け止める人の態度]。{a}＝受け止める人、{b}＝嫉妬した人／素に戻った人） */
      if (S.form === 'couple' && o[0] !== 'odd') { var rt = pickT(ctx, dig(T0.BEH_RE, o[0], per(b)), b, a); if (rt) tx += fill(ctx, rt, b, a); }
      rec(ctx, [a, b], tx, o[0] === 'jeal' ? 'リスナーに嫉妬した（' + a.name + '）' : o[0] === 'sunao' ? '配信を忘れて素に戻った（' + a.name + '）' : 'らしくない一面（' + a.name + '）', o[0] === 'odd' ? 'bond' : 'romance', { odd: o[0] === 'odd', ev: o[0] === 'odd' ? '' : o[0] });
      return true;
    }
    return false;
  }

  /* ---------- 関係性の出来事（配信オリジナル。haishin-rel.js の HK.HaishinRel[恋人 lover／夫婦 spouse]。2026-11-06 の利用者の指示「関係性のイベントを汎用的に
     使い回しているのが気になる。その箱庭オリジナルイベントに差し替えて」） ----------
     出来事＝{ id, k（amai 甘い日常・sure すれ違い・jeal 嫉妬・naka 仲直り・kinen 記念日・mirai 将来の話・hito 家族や周りの話・kurashi 同居／別居の差）, t: [文…] }。
     文は form（couple／solo）・tz などの札で絞る（elOk）。すれ違い・嫉妬のあとにだけ仲直り（その相手との直前のすれ違いが前提。S.rel.fight）。一つの出来事は一回の配信で一度。
     一回の配信に 1 時間あたり 1 回まで・区切りの 2 割（すれ違いのあとは仲直りを 6 割で次の区切りに）。{a}＝配信する人（カップルはどちらか）、{b}＝相手（ソロは画面の外の人） */
  function relEvent(ctx, S, s) {
    var REL = HK.HaishinRel, L = REL && REL[S.rk];
    if (!L || !L.length || s <= 0 || !S.loveOk) return false;
    var R0 = S.rel, cap = Math.max(1, Math.floor(S.hours));
    if (R0.n >= cap || s - R0.last < 2) return false;
    var wantNaka = !!R0.fight && s - R0.fight.s <= 6;
    if (ctx.rng() >= (wantNaka ? 0.6 : 0.2)) return false;
    var a = S.form === 'couple' ? pickOf(ctx, S.on) : S.on[0], b = S.form === 'couple' ? other(S, a) : S.off;
    var cand = L.filter(function (e) {
      if (!e || R0.used[e.id]) return false;
      if (e.k === 'naka') return wantNaka;
      if (wantNaka) return false;
      if ((e.k === 'sure' || e.k === 'jeal') && R0.fight) return false;
      return hasT(ctx, e.t, a, b);
    });
    /* 仲直りの {a}{b} は、すれ違い・嫉妬の出来事と同じ（{a}＝拗ねた・妬いた側。ソロは {a}＝配信する人） */
    if (wantNaka && R0.fight) { a = R0.fight.a; b = R0.fight.b; cand = cand.filter(function (e) { return hasT(ctx, e.t, a, b); }); }
    var e = pickOf(ctx, cand);
    if (!e) return false;
    var t = pickT(ctx, e.t, a, b);
    if (!t) return false;
    R0.used[e.id] = 1; R0.n++; R0.last = s;
    if (e.k === 'sure' || e.k === 'jeal') R0.fight = { s: s, a: a, b: b, id: e.id }; else if (e.k === 'naka') R0.fight = null;
    rec(ctx, [a, b], fill(ctx, t, a, b), '関係の出来事（' + (REL.KIND && REL.KIND[e.k] || '二人のこと') + '）', e.k === 'sure' || e.k === 'jeal' ? 'conflict' : 'romance', { tag: '二人のこと', ev: e.k === 'jeal' ? 'rjeal' : '' });
    return true;
  }

  /* ---------- 寝落ち配信（3.4） ---------- */
  function sleepStep(ctx, S, s, last) {
    var T0 = TX(), SL = T0.SLEEP || {}, a = S.sleeper, b = S.form === 'couple' ? other(S, a) : S.off;
    if (S.asleep === 0) {
      var t = pickT(ctx, flat(SL.fall), a, b) || fbT(ctx, FB.sleepFall, a, b);
      rec(ctx, S.form === 'couple' ? [a, b] : [a], fill(ctx, t, a, b), '寝落ち配信で眠りに落ちた（' + a.name + '）', 'bond', { tag: '寝落ち' });
      S.asleep = 1; return 'fall';
    }
    S.asleep++;
    /* 12・24 時間の配信は、朝（7〜9 時）に目を覚まして、そのあとは朝の雑談として続ける（S.kindLive＝'zatsu'。区切りの様子・設定の出来事・コメントの種類の表を雑談に）。
       夜中から翌日の夜まで眠り続けないように（2026-11-06 P15b の通し読み） */
    var hr = Math.floor((clk(S, s) % 1440) / 60);
    if (!last && S.N >= 24 && S.asleep >= 9 && hr >= 7 && hr < 10 && flat(SL.wakeMid).length) {
      var wm = pickT(ctx, flat(SL.wakeMid), a, b);
      if (wm) {
        S.woke = true; S.kindLive = 'zatsu'; S.wokeAt = s;
        rec(ctx, S.form === 'couple' ? [a, b] : [a], fill(ctx, wm, a, b), '寝落ち配信の朝に目を覚ました（' + a.name + '・配信は続ける）', 'bond', { tag: '目覚め' });
        return 'wake';
      }
    }
    if (last) {
      S.woke = true;
      var w = pickT(ctx, flat(SL.wake), a, b) || fbT(ctx, FB.wake, a, b);
      rec(ctx, S.form === 'couple' ? [a, b] : [a], fill(ctx, w, a, b), '寝落ち配信の朝に目を覚ました（' + a.name + '）', 'bond', { tag: '目覚め' });
      return 'wake';
    }
    if (S.asleep <= 5) return 'cm';
    /* 寝息・寝返り・寝言・寝ている間の短い出来事（T.SLEEP の breath・turn・talk・mini と、寝ている区切りの区切りの様子 T.STEP.neochi の asleep の札）。一度ずつ使い、足りなければ 2 回目まで。
       それでも尽きたら（24 時間の寝落ちなど）コメントだけの区切り */
    var BL = flat(SL.breath).concat(flat(SL.turn), flat(SL.talk), flat(SL.mini), flat((TX().STEP || {}).neochi).filter(function (x) { return x && x.asleep; }));
    var bt = pickT(ctx, BL, a, b) || pickT(ctx, BL, a, b, true) || (BL.length ? '' : fbT(ctx, FB.sleep, a, b));
    if (!bt) return 'cm';
    rec(ctx, S.form === 'couple' ? [a, b] : [a], fill(ctx, bt, a, b), '寝落ち配信の寝息と寝言（' + a.name + '）', 'bond', { tag: '寝落ち' });
    return 'breath';
  }

  /* ---------- コメントの一件（4.1。haishin-cm.js が無ければ代わりの組み立て） ---------- */
  function cmCount(S, sleep) { var n = clamp(Math.round(3 + 2.2 * log10(S.v) + 0.5 * S.stage), 3, 12); return sleep ? Math.min(12, Math.round(n * 1.5)) : n; }
  function cmLine(ctx, S, pool) {
    var fresh = pool.filter(function (x) { return !S.cmUsed[x.t]; }), p = fresh.length ? fresh : pool.filter(function (x) { return (S.cmUsed[x.t] || 0) < 2; });
    var x = pickOf(ctx, p); if (!x) return '';
    S.cmUsed[x.t] = (S.cmUsed[x.t] || 0) + 1;
    var who = S.form === 'couple' ? pickOf(ctx, S.on) : S.on[0];
    return x.t.replace(/\{h\}/g, hn(S, who)).replace(/\{h2\}/g, hn(S, other(S, who))).replace(/\{ch\}/g, chName(S)).split('{相方}').join(aikata(S, other(S, who)));
  }
  function cmPost(ctx, S, o) {
    var K2 = CK();
    if (K2 && K2.post) {
      var sc = S.scNow.map(function (y) { return { yen: y, whale: y >= 10000 }; }); S.scNow = [];
      var r = K2.post(ctx, { stage: S.stage, sleep: !!o.sleep, end: !!o.end, leak: S.leakPh || null, stall: !!o.stall, sc: sc, react: S.lastEv, hour: S.hour });
      if (r && r.garikoi) S.ev.push('gari');
      if (r && r.wed) S.ev.push('wed');
      return r && r.e;
    }
    var G = CM().GEN || {}, n = o.n, out = [], used = {};
    var norm = function (l) { return flat(l).map(function (x) { return typeof x === 'string' ? { t: x } : x; }).filter(function (x) { return x && x.t && (!x.need || needOk(S, S.on[0], x.need)) && (S.stage <= 3 || !/\{(?:男性器|女性器|ナカ|胸|乳首|陰核|精液)\}/.test(x.t) || S.r18); }); };
    var pool = norm(G.all).concat(norm((G[S.form] || {})[Math.min(S.stage, S.r18 ? 6 : 3)]), norm((G.kind || {})[liveKind(S)]), norm((G.size || {})[S.size]), o.sleep ? norm(G.sleep) : [], S.tm === 'late' ? norm(G.late) : [], S.tm === 'morning' ? norm(G.morning) : []);
    if (!pool.length) pool = FB_CM.map(function (t) { return { t: t }; });
    for (var i = 0; i < n && out.length < n; i++) {
      var l = cmLine(ctx, S, pool); if (!l || used[l]) continue; used[l] = 1;
      var y = S.scNow.length && ctx.rng() < 0.4 ? S.scNow.shift() : 0;
      out.push(handle(ctx, S) + (y ? '［' + yen(y) + '］' : '') + '：' + l);
    }
    if (!out.length && !(G.all && G.all.length)) for (var j = 0; j < 3; j++) out.push(handle(ctx, S) + '：' + pickOf(ctx, FB_CM));
    if (!out.length) return null;
    var e = ctx.say({ kind: 'phase', cat: 'phase', actors: [], text: out.join('\n'), mag: 0, lewd: false });
    if (e) { e.ch = 'cm'; e.tag = 'コメント'; }
    return e;
  }

  /* ---------- 一区切り（6.7 の順） ---------- */
  function phase(ctx, s, n) {
    var S = st(ctx);
    if (!S) return;
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;   /* 本体の気分の一句は付けない */
    if (S.stop) {
      if (s === 0) rec(ctx, [S.A, S.B].filter(function (c, i, l) { return l.indexOf(c) === i; }), S.A === S.B ? '配信の準備は整っていたが、一緒に配信する相手がいなかった。カメラの明かりは、つかないままだった。' : '配信の準備は整っていたが、' + S.A.name + 'と' + S.B.name + 'が二人で並ぶことはなかった。カメラの明かりは、つかないままだった。', S.A === S.B ? '一緒に配信する相手がいない' : '恋愛対象の設定で二人が恋愛にならない', 'bond');
      S.ended = 'none'; S.endAt = 0;
      return;
    }
    var last = s === S.N - 1, m = clk(S, s);
    S.tm = tmOf(m); S.ev = []; S.bigAns = false; S.nMain = 0; S.s = s; S.stepSc = 0; S.trend = 0; S.hour = Math.floor((m % 1440) / 60);
    S.act = null; S.actMix = false; S.evBy = {};
    /* 1. スパチャ（この区切りの分を先に決め、メインの質問とコメントに付ける） */
    var sleeping = S.kind === 'neochi' && S.asleep > 0 && !S.woke;
    /* 本体の共通の出来事：寝ている区切り・最後の区切りでは混ぜない */
    /* ソロ配信は相手が画面の外にいるので混ぜない（話題の一言などが二人の会話になるため。関係性の出来事は haishin-rel.js の配信オリジナル） */
    scen.actRate = sleeping || last || S.ended || S.form === 'solo' ? 1e-9 : 0.02;
    var K3 = CK(), scs = K3 && K3.scBatch ? (K3.scBatch(ctx) || []).map(function (x) { return Math.min(50000, +(x && x.yen != null ? x.yen : x) || 0); }).filter(Boolean) : scStep(ctx, S, sleeping);
    if (sleeping && K3 && K3.scBatch) scs = scs.slice(0, Math.floor(scs.length / 2));
    var stepSum = scs.reduce(function (x, y) { return x + y; }, 0);
    S.scNow = scs.slice(); S.scSum += stepSum; scs.forEach(function (y) { S.scMax = Math.max(S.scMax, y); });
    if (scs.length) S.ev.push('sc');
    if (scs.some(function (y) { return y >= 10000; })) S.ev.push('whale');
    var o = { ans: 0, ansSt: 0, big: false, clock: m, asleep: false, trend: 0 }, cmOnly = false, after = S.ended && s > (S.endS == null ? -1 : S.endS);
    /* 寝落ち：眠る区切りに来たら（夜 100 で本番が済んでいなければ眠らない） */
    var wantSleep = S.kind === 'neochi' && !S.woke && (S.asleep > 0 || (s >= S.sleepAt && !(S.n100 && !S.sexDone && H.r18 && H.r18.step)));
    if (wantSleep && !after) {
      var sr = sleepStep(ctx, S, s, last);
      if (sr === 'cm') cmOnly = true;
      o.asleep = sr !== 'fall' && sr !== 'wake';
      if (sr === 'wake' && !last) wantSleep = false;
      else if (sr !== 'fall') {
        vStep(ctx, S, o); heatStep(S, o);
        cmPost(ctx, S, { n: cmCount(S, true), sleep: true, react: S.lastEv, cmOnly: cmOnly });
        endStep(ctx, S, s, last, stepSum);
        return;
      }
    }
    /* 2. 区切りの様子。ソロの中盤のあいだ（電話・自慰・お仕置き。S.mid が進んでいる区切り）は出さない（通話中にお便りを読み上げる矛盾。2026-11-06 通し読み） */
    var midOn = !!(S.r18 && S.form === 'solo' && S.midI > 0 && !/^(none|done|stay)$/.test(S.mid));
    /* 設定の出来事（T.SET）がまだ一つも出ていない配信は、ここで必ず一つ出す（3.2。本番の区切りになったら区切りの様子と一緒に外し、次の区切りに回す）。
       配信開始の区切りでも出すのは、1 時間の配信・眠りに落ちるのが早い寝落ち配信・夜 100 のソロ配信（2 区切り目から中盤が続く）だけ */
    var forceSet = !S.setN && !wantSleep && !after && !midOn && (s > 0 || S.N <= 2 || (S.kind === 'neochi' && S.sleepAt <= 1 && !S.n100) || (S.n100 && S.form === 'solo')), forced = false;
    var stepH = !wantSleep && !after && !midOn ? stepHold(ctx, S, s, forceSet ? function () { forced = setEvent(ctx, S, s, null, true); } : null) : null;
    /* 3〜4. 段の判定とメインの質問（段 6 の R18 はソロの中盤・本番を haishin-r18.js に） */
    var took = false;
    if (S.r18 && H.r18 && H.r18.step && (S.stage >= 6 || S.leak || S.mid !== 'none' || S.sexDone)) took = !!H.r18.step(ctx, S, { s: s, last: last, n: S.N });
    if (!took && !S.ended && !wantSleep) {
      var nq = S.N >= 5 ? 1 : 2 + (ctx.rng() < 0.5 ? 1 : 0);
      for (var qi = 0; qi < nq && !S.ended; qi++) {
        var j = stageJudge(ctx, S, s);
        if (j && j.stall) { stall(ctx, S, j.stall); if (S.stall >= 3) quit(ctx, S, s); break; }
        if (S.stage >= 6 && S.r18 && H.r18 && H.r18.step && !S.sexDone && S.mid === 'none') { if (H.r18.step(ctx, S, { s: s, last: last, n: S.N, enter: true })) { took = true; break; } }
        var q = askOf(ctx, S, S.stage) || (S.stage > 1 ? askOf(ctx, S, S.stage - 1) : null);
        if (!q) break;
        var r = answer(ctx, S, q, S.stage);
        if (r) { o.ans++; o.ansSt += S.stage; if (r === 'big') o.big = true; }
      }
    }
    /* 本番の区切り（この区切りで配信を切った／切ったつもりになった：S.ended が cut・leak になった）は、先に出した区切りの様子を外す（本番の区切りは本番の段だけ） */
    if (stepH && s > 0 && S.endS == null && (S.ended === 'cut' || S.ended === 'leak')) stepDrop(ctx, S, stepH);
    /* 5. 設定の出来事（55%）・性格の行動（30%）。段 4 以上の行為に応えた区切り・中盤と本番の区切りは出さない */
    if (!took && !S.bigAns && !S.ended && !wantSleep) {
      /* 3 時間までの配信は区切りが少ないので、設定の出来事を出しやすくする（設定が 2 区切り目以降に効く回数を、短い配信でも 1〜3 回に。2026-11-06 P15b の計測） */
      if (s > 0 && !forced && ctx.rng() < (S.N <= 6 ? 0.85 : 0.55)) setEvent(ctx, S, s);
      if (ctx.rng() < 0.3) behave(ctx, S);
      /* 関係性の出来事（配信オリジナル。haishin-rel.js）：本体の共通の出来事の代わり */
      relEvent(ctx, S, s);
    }
    /* 区切りが 1 件だけ（様子だけ）にならないよう、設定の出来事を一つ足す */
    if (!took && !S.ended && S.nMain < 2 && s > 0 && !wantSleep) { if (!setEvent(ctx, S, s)) behave(ctx, S); }
    /* 最後の区切り：配信を閉じる段（T.CLOSE[形]。寝落ちは目覚めの段で閉じる） */
    if (last && !S.ended && !wantSleep) {
      var a0 = S.on[0], b0 = S.form === 'couple' ? S.on[1] : S.off;
      wedLive(ctx, S, a0, b0);
      var ct = pickT(ctx, dig(TX().CLOSE, S.form), a0, b0) || fbT(ctx, FB.close, a0, b0);
      rec(ctx, [a0, b0], fill(ctx, ct, a0, b0), '配信を閉じた（予定の時間）', 'bond', { tag: '配信終了' });
    }
    /* 6. 同接・発情度 */
    o.trend = S.trend; stepSum += S.stepSc;
    vStep(ctx, S, o); heatStep(S, o);
    /* 7. コメントの一件 */
    cmPost(ctx, S, { n: cmCount(S, false), sleep: false, end: last || (S.ended === 'cut' && s >= S.endAt), react: S.lastEv, leak: S.leak, stall: S.ev.indexOf('stall') >= 0, beg: S.capped && S.pt >= LINE[Math.min(5, S.capSt)] });
    endStep(ctx, S, s, last, stepSum);
  }
  /* 結末が結婚報告になる配信は、予定の時間どおりに閉じる最後の区切りで、閉じる前に報告の段を出す（T.WEDLIVE。後日談はそのあとの話として書く。
     配信を切った・寝落ちで閉じた回は本編で報告しないので、後日談は「次の配信で」の文。2026-11-06 の利用者の指示） */
  function wedLive(ctx, S, a, b) {
    var E = HK.HaishinEnd;
    var k = E && E.decide ? E.decide(ctx) : '';
    if (k !== 'wed' && k !== 'pub') return false;
    /* 恋人・夫婦でない二人は、結婚ではなく二人のことの公表（pub） */
    var t = pickT(ctx, dig(TX().WEDLIVE, S.form, k === 'pub' ? 'other' : S.rk === 'spouse' ? 'spouse' : 'lover'), a, b);
    if (!t) return false;
    rec(ctx, [a, b], fill(ctx, t, a, b), k === 'pub' ? '配信の終わりにリスナーへ二人のことを公表した' : '配信の終わりにリスナーへ結婚を報告した（結末：結婚報告）', 'romance', { tag: '報告' });
    S.wedLive = true;
    return true;
  }
  /* 8〜9. 推移の点と終わりの判定 */
  function endStep(ctx, S, s, last, stepSum) {
    S.series.push({ t: clockW(clk(S, s)), v: S.v, sc: stepSum, sum: S.scSum, st: S.stage });
    S.lastEv = S.ev.slice();
    S.gameWin = S.gameRes.win > S.gameRes.lose;
    S.lastEvBy = S.evBy || {}; S.lastAct = S.actMix ? null : S.act;
    if (S.ended && S.endS == null) S.endS = s;
    if (last && !S.ended) { S.ended = 'time'; S.endAt = s; }
    /* 最後の区切りのあと：後日談（haishin-end.js。結末のあとに出来事を続けない） */
    if (S.ended && s >= S.endAt && HK.HaishinEnd && HK.HaishinEnd.epilogue) HK.HaishinEnd.epilogue(ctx);
  }
  function endNow(ctx, s) { var S = st(ctx); return !!(S && S.ended && s >= S.endAt); }

  /* ---------- 終わり（結末・後日談は haishin-end.js。無ければ代わりの一段） ---------- */
  function flagsOf(S) {
    var g = function (c) { var x = S.goal[c.i] || {}; return { s: x.s ? x.s.t : '', sk: x.s ? x.s.k : '', l: x.l ? x.l.t : '', lk: x.l ? x.l.k : '', side: x.side }; };
    return { a: S.A.i, b: S.B.i, rk: S.rk, form: S.form, kind: S.kind, size: S.size, sc: S.sc, hours: S.hours, N: S.N, on: S.on.map(function (c) { return c.i; }), off: S.off ? S.off.i : null,
      hn: S.hn, v0: S.v0, vPeak: S.vPeak, v: S.v, scSum: S.scSum, scMax: S.scMax, stage: S.stage, stageName: STAGE_NAME[S.stage], cap: S.cap, ended: S.ended, endS: S.endS, leak: S.leak, leakFate: S.leakFate,
      sexDone: S.sexDone, again: S.again, mid: S.mid, beh: S.beh, kiss: S.kiss, stallTot: S.stallTot, quit: S.quit, asleep: S.asleep, series: S.series, setHits: S.setHits, setUsed: Object.keys(S.setUsed), gameRes: S.gameRes, game: S.game, dish: S.dish, goalA: g(S.A), goalB: g(S.B), setN: S.setN || 0, wedLive: !!S.wedLive, midStallN: S.midStallN || 0, midStallNeed: S.midStallNeed == null ? null : S.midStallNeed, midLeadN: S.midLeadN || 0, onPer: S.on && S.on[0] ? per(S.on[0]) : '', relOther: !!S.relOther, cap2: S.cap, comeMode: S.comeMode || '', relN: S.rel ? S.rel.n : 0, relUsed: S.rel ? Object.keys(S.rel.used) : [], endK: null, end: '' };
  }
  function fbEnd(S) {
    if (S.ended === 'stall') return ['maboroshi', '幻の配信'];
    if (S.leakFate === 'ban') return ['ban', 'アカウント停止で笑い話'];
    var sz = SIZE[S.size];
    if (S.vPeak >= sz * 5 || S.vPeak >= 10000) return ['big', '大ブレイク'];
    if (S.vPeak >= sz * 1.5) return ['slow', 'じわじわ伸びる'];
    return ['small', '常連の小さな箱'];
  }
  function finish(ctx) {
    var S = st(ctx);
    if (!S) return;
    if (S.stop) { ctx.flags.haishin = { stop: true, a: S.A.i, b: S.B.i }; ctx.flags.outcome = '配信は始まらなかった'; return; }
    var F = ctx.flags.haishin = flagsOf(S);
    if (HK.HaishinEnd && HK.HaishinEnd.finish) { HK.HaishinEnd.finish(ctx); return; }
    var ek = fbEnd(S); F.endK = ek[0]; F.end = ek[1];
    var a = S.on[0], b = S.form === 'couple' ? S.on[1] : S.off;
    rec(ctx, [a, b], fill(ctx, fbT(ctx, FB.end, a, b), a, b), '後日談（' + ek[1] + '）', 'bond', { tag: '後日談' });
    a.fate = S.rk === 'spouse' ? '夫婦のまま' : '恋人のまま'; b.fate = a.fate;
    [a, b].forEach(function (c) { c.afterDone = true; });
    ctx.flags.outcome = chName(S) + 'の配信――' + ek[1];
  }

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: 'カップル配信', kicker: 'ふたり・カップル配信',
    desc: '二人が、カメラの前で配信をする（どんな関係でも、この部屋ではカップルとして扱う）。視聴者のコメントとスパチャに応えるうちに、質問はだんだん踏み込んだものになっていく。二人で並ぶカップル配信も、一人が配信して相手は画面の外にいるソロ配信も選べる。人気配信者への道か、二人だけの時間か、笑い話になる結末か――配信が終わったあとの評判まで眺める。',
    note: '※参加は2人。どんな関係でも、この部屋ではカップルとして扱います（結末の結婚報告は、恋人か夫婦の二人のときだけ）。形は「カップル配信」「ソロ配信」「おまかせ」から選べ、住人ごとの「配信での立場」で配信する人・画面の外の人を決められます。「配信の名前」は視聴者が呼ぶ名前です（空なら住人の名前）。「短期目標」（この配信で何をしたいか）と「長期目標」（二人の先に何を望むか）も住人ごとに選べます。登場人物はすべて成人として扱います。',
    unit: '時間', perUnit: 2, preRel: 0, lethal: false, minCast: 2, maxCast: 2,
    catBias: { romance: 1, bond: 1.2, help: 1, conflict: 0.2, combat: 0, betray: 0, kill: 0 },
    decay: 0.999, actRate: 0.02,
    /* 帰ってきた場面でない夜（配信の夜）なので、本体の夜の攻めの台詞から帰宅の前提の一言（「ただいまのキス」）を外す（R18版の ero-top-lines-r18.js が読む口） */
    eroNoHome: true,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'kind', label: '配信の種類', type: 'select', def: 'zatsu', options: [{ v: 'zatsu', label: '雑談' }, { v: 'cook', label: '料理' }, { v: 'game', label: 'ゲーム' }, { v: 'neochi', label: '寝落ち' }], desc: '配信の種類で始まる時刻が変わります（雑談 21 時・料理 19 時・ゲーム 22 時・寝落ち 24 時）。区切りの様子と、種類ならではの出来事が変わります' },
      { id: 'size', label: 'リスナーの規模', type: 'select', def: 's100', options: [{ v: 's10', label: '10人くらい' }, { v: 's100', label: '100人くらい' }, { v: 's1k', label: '1,000人くらい' }, { v: 's10k', label: '1万人くらい' }], desc: '同接（同時に見ている人の数）の始まりの目安。多いほどコメントが速く流れ、場が盛り上がりやすい' },
      { id: 'sc', label: 'スパチャの太さ', type: 'select', def: 'mid', options: [{ v: 'few', label: '少なめ' }, { v: 'mid', label: 'ふつう' }, { v: 'whale', label: '太客がいる' }], desc: '投げ銭の多さ。太いほど場が盛り上がりやすく、太客がいれば名指しのお願いが来る' },
      { id: 'hours', label: '配信時間', type: 'select', def: '2', options: HOURS.map(function (h) { return { v: String(h), label: h + '時間' }; }), desc: HK.SAFE_BUILD ? '30分ごとの区切りで進む。短い配信では要求はあまり上がりません' : '30分ごとの区切りで進む。短い配信では要求はあまり上がりません（夜の起こりやすさ 100 のときは短くても最後まで進みます）' },
      { id: 'form', label: '形', type: 'select', def: 'auto', options: [{ v: 'couple', label: 'カップル配信（二人で並ぶ）' }, { v: 'solo', label: 'ソロ配信（一人が配信、もう一人は画面の外）' }, { v: 'auto', label: 'おまかせ' }], desc: 'おまかせは、住人ごとの「配信での立場」から（どちらも決めていなければ、カップル配信が多め）。二人とも攻めの設定なら、カップル配信は選べません' }
    ],
    stats: [{ id: 'charm', label: '魅力・色気', desc: '高いほど視聴者に「かわいい」「かっこいい」と言われやすく、スパチャが集まりやすい。熱心なリスナーがつき、相方が嫉妬することも' }],
    perFields: [
      { id: 'role', label: '配信での立場', auto: 'おまかせ（形から）', options: [{ id: 'on', label: '配信する' }, { id: 'off', label: '画面の外（ソロ配信のとき）' }] },
      { id: 'hname', label: '配信の名前', type: 'text', placeholder: function () { return '視聴者が呼ぶ名前（12字まで。空なら住人の名前）'; } },
      { id: 'sgoal', label: '短期目標', auto: 'おまかせ（立場と性格から）', groups: true, options: goalOpts('s') },
      { id: 'lgoal', label: '長期目標', auto: 'おまかせ（立場と性格から）', groups: true, options: goalOpts('l') },
      { id: 'chore', label: '家事の得意さ', auto: 'おまかせ（気質から）', options: LF && LF.ROLE ? LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) : [] }
    ],
    actions: [],
    goals: [],
    check: function (input) { return blockOf(input); },
    stepGroup: function (label) {
      var m = /^配信(?:開始| (\d+):(\d\d))（(翌々|翌)?(\d+):(\d\d)）$/.exec(label);
      if (!m) return null;
      var el = m[1] != null ? +m[1] * 60 + +m[2] : 0, cl = (m[3] === '翌々' ? 2880 : m[3] === '翌' ? 1440 : 0) + +m[4] * 60 + +m[5], hi = Math.floor(el / 60);
      return { group: (hi + 1) + '時間目（' + clockW(cl - el + hi * 60) + '〜）', sub: label.replace(/^配信 ?/, '') };
    },
    steps: function (env) {
      var h = HOURS.indexOf(+env.hours) >= 0 ? +env.hours : 2, t0 = (KIND[env.kind] || KIND.zatsu).t0, s = [];
      for (var k = 0; k < h * 2; k++) s.push(k === 0 ? '配信開始（' + clockW(t0) + '）' : '配信 ' + elapW(30 * k) + '（' + clockW(t0 + 30 * k) + '）');
      return s;
    },
    othersFor: function (ctx, a) { var S = ctx.hs; return ctx.present().filter(function (c) { return c !== a && (!S || c === S.A || c === S.B); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    end: function (ctx, s, n) { return endNow(ctx, s); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  /* 本体の共通の出来事から外すもの：体の関係・合意のない展開・三人以上の恋愛・告白・別れ（新婚・デートと同じ並び＋告白・別れ） */
  /* glance（気づけば相手を目で追っていた）は、恋人・夫婦だけのこの部屋では段階の逆戻りになるので外す（2026-11-06 P15b の通し読み） */
  var EX_ID = /^(?:confess|take_charge|brood|lighten|mob_after|tie_spouse|grp_|poly_|ct_|cf_|break|split|cheat|glance$)/;
  /* 本体の共通の出来事のうち、この部屋に残すのは関係を問わない小さな出来事だけ（話題の一言 tp_・口調がにじむ一言・好みの重なり）。恋人・夫婦の日常・嫉妬・仲直り・記念日・
     キス・甘え・関係の層（tie_）などの関係性の出来事は外し、配信オリジナルの出来事（haishin-rel.js）に差し替える（2026-11-06 の利用者の指示。残す一覧は設計 3.6） */
  var KEEP_ID = /^(?:tp_(?:match|food|grumble|rumor|invite|show|teach|debate|link|clash|crave|recall|irk|dream|reread|ponder)|sf_persona|attr_mirror_(?:talk|habit|clash))$/;
  function exList() { return (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id) || !KEEP_ID.test(e.id); }).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });
  HK.SCENARIOS[ID] = scen;
  /* 魅力は住人の設定と共有（本体の HK.Shared.addMap が入れば。無い本体では箱庭の中だけの値） */
  if (HK.Shared && HK.Shared.addMap) { try { HK.Shared.addMap('charm', ID, 'charm'); } catch (e) { /* 共有の口が違う本体でも動く */ } }
  /* 結果への写し（ctx.flags.haishin → 結果の end.haishin）。三人目は出さない（登場しない住人は呼ばない） */
  if (HK.PairCast) HK.PairCast.install(ID, couple, 'haishin');
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      if (input && input.scenId === ID && input.env && input.env.outsideNames !== 'no') { var c2 = Object.assign({}, input); c2.env = Object.assign({}, input.env, { outsideNames: 'no' }); return sim0.apply(this, [c2].concat([].slice.call(arguments, 1))); }
      return sim0.apply(this, arguments);
    };
  });
  /* 結果欄（haishin-end.js が書き換える。無いときの代わり） */
  if (HK.Endings && !HK.Endings[ID]) HK.Endings[ID] = function (res) {
    var R = res.end && res.end.haishin;
    if (!R || R.stop) return { headline: res.outcome || '', stats: [], lines: [] };
    return { headline: (res.outcome || '') + '。', stats: [['最高同接', comma(R.vPeak) + '人'], ['スパチャ累計', yen(R.scSum)], ['一回の最大額', yen(R.scMax)], ['要求の段', R.stageName], ['結末', R.end]], lines: [] };
  };
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '配信中の場面の描写の長さ。短く＝数行で短く／ふつう＝混ぜる／長く＝段落分けして厚く' });

  /* ---------- 箱庭タブの案内（参加者の欄の下。全年齢版・全年齢モードの攻め×攻めの注意もここ。R18 版の注意は solo-warn-set-b-haishin.js） ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nowInput() { var UI = HK.UI; try { return UI && UI.buildInput ? UI.buildInput(0) : null; } catch (e) { return null; } }
  function noteHtml(input, head) {
    var h = head ? '' : '<p class="hint" style="margin-top:8px">どんな関係でも、この部屋ではカップルとして扱います（結末の結婚報告は、恋人か夫婦の二人のときだけ）。住人ごとの「配信での立場」で、ソロ配信のときに配信する人・画面の外の人を選べます。「配信の名前」は視聴者のコメントが呼ぶ名前です。</p>';
    if (!input) return '<div id="' + (head ? 'hsnote2' : 'hsnote') + '">' + h + '</div>';
    var b = blockOf(input), C = (input.chars || []).map(function (c, i) { var o = Object.assign({}, c); o.i = i; return o; });
    if (b) h += '<p class="hint" role="alert" style="margin-top:6px;color:var(--warn,#b45309);font-weight:600">※このままでは始められません：' + esc(b) + '</p>';
    if (!head && !b && C.length >= 2) {
      /* R18 版（全年齢モードでない）の「二人とも攻めなので、ソロ配信になります」は solo-warn-set-b-haishin.js が出す */
      var fo = formOf(input, C[0], C[1], 0.5), ws = fo.warn.filter(function (w) { return HK.SAFE_ON || !HK.SoloWarn || !/攻め/.test(w); });
      ws.forEach(function (w) { h += '<p class="hint" style="margin-top:6px;color:var(--warn,#b45309)">注意：' + esc(w) + '</p>'; });
    }
    return '<div id="' + (head ? 'hsnote2' : 'hsnote') + '" aria-live="polite">' + h + '</div>';
  }
  if (HK.ScenUI && HK.ScenUI.add) HK.ScenUI.add(ID, {
    joinNote: function () { return noteHtml(nowInput(), false); },
    envHead: function () { return noteHtml(nowInput(), true); },
    envChange: function () { if (typeof document === 'undefined') return; var a = document.getElementById('hsnote'), b = document.getElementById('hsnote2'), inp = nowInput(); if (a) a.outerHTML = noteHtml(inp, false); if (b) b.outerHTML = noteHtml(inp, true); }
  });

  /* ---------- ほかの担当が読む口（16 章） ---------- */
  Object.assign(H, {
    ID: ID, st: st, pickT: pickT, hasT: hasT, elOk: elOk, fill: fill, rec: rec, dig: dig, flat: flat, hn: hn, aikata: aikata, chName: chName, other: other, per: per, nightKind: nightKind,
    howOf: howOf, setAct: setAct, kJa: kJa, howJa: howJa, askOf: askOf, askText: askText, needOk: needOk, targetOf: targetOf, reqOk: reqOk, handle: handle, cmCount: cmCount, cmPost: cmPost, clockW: clockW, clk: clk, comma: comma, yen: yen,
    formOf: formOf, blockOf: blockOf, topTop: topTop, relIn: relIn, KIND: KIND, SIZE: SIZE, SCB: SCB, HOURS: HOURS, LINE: LINE, STAGE_NAME: STAGE_NAME, LIGHT_K: LIGHT_K, GOAL_OPT: GOAL_OPT, FB_HANDLE: FB_HANDLE
  });
})();
