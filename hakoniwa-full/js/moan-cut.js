/* 箱庭シミュレーター（R18版のみ）: 喘ぎ・攻めの声の「遮り」と「呼応」（HK.Moan.cut・HK.Moan.tease・HK.Moan.topSay）
   設計書：docs/reports/2026-10-27/moan-redesign.md（2-1b 強弱の傾き・2-2 快感の段・4章 遮り・5章 呼応）。moan-engine.js の次に読む（2026-10-28 担当M1）
   ■ 表（データ）は②③④の担当が書いたもの：
     HK.MOAN_TOP_SAID（moan-top-said.js）  … 攻めの声 t0〜t2・t6（言葉のない声。moan-engine.js の M.pick が引く）、攻めの崩れ u0〜u6（3本の台詞）＋ kind
     HK.MOAN_TEASE（moan-tease-r18.js）    … 言葉責め z0〜z3・焦らし j0〜j3（3本の台詞）＋ night（sadist・mean）・kind・rel（lover・hate）
     HK.MOAN_SAID_MORE（moan-said-more.js）… 受けの w2・w4・w5・e0（喘ぎの基盤。M.pick が引く）、言い返し a0〜a3（3本の台詞）＋ kind
   ■ 強弱の傾き HK.Moan.tilt(住人, ctx, 'top'|'bot') → 0〜1（態度の基準値 M.TILT ＋ 夜の性格の足し引き。受けの堕ちは −0.2）。
     切れ端の強い／甘いの割合・攻めの崩れのパターン・言い返しの向き・快感の段の上がり方を「やや」動かす（重みは最大 1.5 倍）
   ■ 遮り HK.Moan.cut(S, 住人, 台詞, lv, o) → 崩した台詞（「」の中身）
       lv 1 少し（「……っ」を1〜2か所）／2 遮られる（喘ぎの切れ端 HK.MOAN_CUT を1〜2か所）／3 決壊（2〜3か所＋語尾を ！？・ッ に）
       o: { sweet: 甘い切れ端（省くと傾きから）, keepEnd: 語尾を崩さない, tail: 語尾の後ろに付ける声（受けの言い返しの lv3）, names: 崩さない名前 }
       差し込む所：読点「、」・「……」の後ろ、文節の切れ目（漢字・カタカナ＋助詞 を・に・が・は・で（・て）の後ろで、次が漢字・カタカナ）。
       印（{男性器} など）・＠名前＠・住人の名前と呼び方の中と、最初の2文字の中には入れない
   ■ 順番：台詞の3本 → 口調の言い換え（voice.js）→ 崩し。崩しは言い換えのあとでないと当たらないので、箱庭の中では
       「名前「＠名前＠3本の台詞」」の後ろに見えない印（U+E3A0 …崩し方… U+E3A1）を置き、台詞の言い換え（HK.Voice.processText）が済んだところで崩す（下の包み）。
       話し手は ＠名前＠ で固定する（受けの返しは前の文の主語が攻めなので、話者推定が取り違える。docs/reports/2026-10-26/seg-design.md）。
       敬語の人（3本の右を使う口調）の lv3 は、4割で3本の左（くだけた常体）を選び、その場で一人称・二人称だけそろえて崩し、言い換えを通さない印（U+2060）を付ける（崩れると敬語が剥がれる）
   ■ 呼応 HK.Moan.tease(S, 攻め, 受け, 段, o) → [攻めの一言, 受けの返し（無いとき ''）]（どちらも「名前「…」」の形）
       一場面の割合（5-1）：夜の性格 サド 言葉責め7割（1〜2回）・焦らし3割／意地悪 言葉責め5割・焦らし7割（1〜2回）／おまかせ 強気・冷静・奔放 2割・1割、そのほか 1割・1割／
       甘々 焦らしの締め（j3）だけ1割／恥じらい 0。嫌がる場面（o.force・関係 hate）は言葉責めだけ。
       住人の設定 c.moanOpt.tease（攻めのとき）：off 0／less 半分／normal 表どおり／more 1.5倍（一場面 3 回まで）
       受けの言い返し（5-2）：直後に 3 割・一場面 1 回（c.moanOpt.retort：off 0／less 1割5分／normal 3割／more 6割・一場面 2 回まで）。堕ちは 1 割で a2・a3 だけ。
       嫌がる場面は a0 を 5 割増し。半分は lv3 で崩す（語尾の後ろに受けの w0／w2 の声）。a3（煽り返し）のあとは、攻めの次の声を u5 に寄せ、快感の段を 1 つ上げる
   ■ 攻めの一言 HK.Moan.topSay(S, 攻め, 受け, 段, opt)（ero-top-lines-r18.js の HK.EroTop.say が先に試す。'' なら今までどおり EroTop の表）
       段（EroTop の start・fore・in・mid・peak・after）→ 快感の段：fore・in＝T0、mid＝T1（7割）／T2（3割。傾きで 2割〜4割5分）、peak＝T2（4割）／T3（6割）。受けが煽った直後は 1 段上げる。
       fore・in・mid（T0・T1）で言葉責め・焦らし（＋言い返し）、mid・peak（T2・T3）で攻めの崩れ（u。T2＝u0・u1・u5、T3＝u2・u3・u4・u6）。
       攻めの崩れは T2・T3 の最中で 7 割・山場で 6 割（受けが煽った直後は必ず u5）。それ以外の EroTop の台詞も、T1 は 2割5分で lv1、T2・T3 は 4割で lv1〜2 に崩す
       EroTop.slots(S, have, { top, bot, rel }) を呼ぶと、その場面の言葉責め・焦らしの回数を先に決め、足りない段（fore・mid・in）を足す。
       最中の段（mid）は、ほかに 4割5分〜7割（崩れやすい人ほど多い）で足す（HK.Moan.slotsFix。呼ぶ側は sl.mid のとき最中の段落に tsay('mid') を置く）
     点検用：HK.Moan.onLine(鍵, 住人, 選んだ行, 利用者の行か) を置くと、台詞の鍵を選ぶたびに呼ぶ（moan-audit.js・計測）
   ■ 鍵は moan-engine.js の M.MODES（z 言葉責め・j 焦らし・u 攻めの崩れ・a 言い返し。line: true）。利用者の辞書（住人の欄 ＞ 住人= ＞ 口調= ＞ 態度= ＞ 共通）に
       その鍵の行があれば、組み込みの表より先に使う（書いたまま。言い換えは通し、崩さない）
   ■ 攻めの鍵は攻め（HK.Pos.order で上になる側。EroTop.say の top）にだけ、言い返しは受けにだけ。自分で攻めを選んだ人には言い返しをさせない。
     攻めの台詞から受け身の語（moan-engine.js の TOP_NG）を外す。全年齢モードでは何もしない
   登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, M = HK && HK.Moan, E = HK && HK.Ero;
  if (!HK || !M || !E || !M._in) return;
  var I = M._in, NOTONE = I.NOTONE, MK0 = '\uE3A0', MK1 = '\uE3A1', MK2 = '\uE3A2';
  var PS9 = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];

  /* 遮りの切れ端（設計書 4章）：強い（強気・厳格・意地っ張り・冷静）／甘い（穏やか・健気・奔放・恥じらい・敬語） */
  HK.MOAN_CUT = {
    hard: ['ッ', 'く……っ', 'ふ、っ', 'ぐ……', 'は、ぁ……っ'],
    sweet: ['ぁ……っ', 'ん、ぅ……', '〜〜っ', 'ふぁ……', 'っあ……'],
    /* 決壊（lv3）の語尾 */
    endHard: ['……ッ！', 'ッ……！', '……！？', '……っ、く……！'],
    endSweet: ['……っ！', '……っ、ぁ……！', '……！？', 'っ……〜〜っ！']
  };
  /* 強弱の傾き（2-1b） */
  M.TILT = { proud: 0.85, stern: 0.75, cool: 0.65, tsun: 0.6, free: 0.5, polite: 0.4, gentle: 0.35, devoted: 0.25, shy: 0.15 };
  var NIGHT_TILT = { sadist: 0.15, mean: 0.1, sweet: -0.15, shy: -0.1, maso: -0.15 };
  /* 言い返しの向き（3-3） */
  var RET_W = {
    proud: [5, 0, 2, 3], stern: [5, 2, 2, 1], tsun: [4, 2, 3, 1], gentle: [1, 3, 4, 2], devoted: [0, 4, 5, 1],
    cool: [3, 2, 3, 2], free: [1, 1, 2, 6], shy: [0, 7, 3, 0], polite: [1, 5, 4, 0]
  };
  /* 言葉責めを多めに使う態度（おまかせのとき 2割） */
  var TEASY = { proud: 1, cool: 1, free: 1 };
  /* 性器なしの人がいる組では、繋がる・出す・中の言い方を外す（ero-top-lines-r18.js の NOGEN_NG と同じ） */
  var NOGEN_NG = /入れ|入っ|入り|挿|貫|奥まで|繋が|出す|出る|出し|中で|中に|締めつけ|飲み込/;
  var STG = ['start', 'fore', 'in', 'mid', 'peak', 'after'];
  var ALIAS = { open: 'start', kiss: 'start', foreplay: 'fore', insert: 'in', body: 'mid', climax: 'peak', cum: 'peak', end: 'after', last: 'after' };

  /* ---------- 部品 ---------- */
  function rngOf(S) {
    var r = S && S.rng ? S.rng : S;
    if (typeof r === 'function') return r;
    if (r && r.int) return function () { return r.int(1000000) / 1000000; };
    if (r && r.float) return function () { return r.float(); };
    return Math.random;
  }
  /* 種から作る乱数（言い換えのあとで崩すときに使う。同じ種なら同じ崩れ方） */
  function seeded(seed) {
    var a = (seed >>> 0) || 1;
    var f = function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return f;
  }
  function psLine(who) { var p = who && (HK.personaOf ? HK.personaOf(who) : who.persona); return PS9.indexOf(p) >= 0 ? p : 'gentle'; }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function wpick(r, w) { var ks = Object.keys(w).filter(function (k) { return w[k] > 0; }), sum = 0; ks.forEach(function (k) { sum += w[k]; }); if (!ks.length) return ''; var x = r() * sum; for (var i = 0; i < ks.length; i++) { x -= w[ks[i]]; if (x < 0) return ks[i]; } return ks[ks.length - 1]; }
  function stageOf(st) { st = ALIAS[st] || st; return STG.indexOf(st) >= 0 ? st : 'mid'; }
  function unq(l) { l = String(l || ''); return l.charAt(0) === '「' && l.charAt(l.length - 1) === '」' ? l.slice(1, -1) : l; }
  function fresh(S, arr) { var r = rngOf(S), base = function (l) { return l[Math.floor(r() * l.length)]; }; return E.fresh && S ? E.fresh(S, arr, base) : base(arr); }
  /* 敬語の人（3本の右を使う口調） */
  function keigoBase(who) { var T = HK.Tone, t = who && (HK.toneOf ? HK.toneOf(who) : who.tone); return !!(T && T.baseOf && T.baseOf(t) === 'P'); }

  /* ---------- 強弱の傾き ---------- */
  var NOBODY = { name: '' };
  M.tilt = function (who, ctx, role) {
    if (!who) return 0.5;
    /* 相手が渡されていなければ、夜の性格は住人全体の設定から（HK.NovelMoan.top の残りを相手にしない） */
    var cx = ctx && (ctx.partner || ctx.top || ctx.night) ? ctx : Object.assign({}, ctx || {}, { partner: NOBODY });
    var v = M.TILT[psLine(who)], nt = M.nightOf ? M.nightOf(who, cx) : '';
    if (nt && NIGHT_TILT[nt] != null && !(nt === 'maso' && role === 'top')) v += NIGHT_TILT[nt];
    if (role !== 'top' && I.fallenOf(who)) v -= 0.2;
    return clamp(v);
  };
  /* 強い切れ端を使う割合（傾き 0.15 → 3割、0.85 → 7割） */
  function hardP(t) { return Math.max(0.2, Math.min(0.8, 0.3 + (t - 0.15) / 0.7 * 0.4)); }

  /* ---------- 遮り ---------- */
  var PART = 'をにがはで', CONTENT = /[一-鿿々ァ-ヶー}]/, NEXT_OK = /[一-鿿々ァ-ヶ{＠]/;
  function ranges(s, names) {
    var R = [], re = /\{[^{}「」]{1,16}\}|＠[^＠「」]{0,16}＠/g, m;
    while ((m = re.exec(s))) R.push([m.index, m.index + m[0].length]);
    (names || []).forEach(function (n) {
      n = String(n || '').replace(/[\u2060-\u2064]/g, '');
      if (n.length < 1) return;
      for (var i = s.indexOf(n); i >= 0; i = s.indexOf(n, i + n.length)) R.push([i, i + n.length]);
    });
    return R;
  }
  function inside(R, i) { for (var k = 0; k < R.length; k++) if (i > R[k][0] && i < R[k][1]) return true; return false; }
  /* 差し込める所（i は s[i-1] と s[i] のあいだ）。kind：c 読点／d 「……」／p 助詞 */
  M.cutPoints = function (s, names) {
    var R = ranges(s, names), out = [], st = s.charAt(0) === NOTONE ? 1 : 0;
    for (var i = st + 2; i < s.length; i++) {
      if (inside(R, i)) continue;
      var a = s.charAt(i - 1), b = s.charAt(i), k = '';
      if (/[…‥、。！？!?ー〜っッ\s　」』）]/.test(b)) continue;
      if (a === '、') k = 'c';
      else if (a === '…' || a === '‥') k = 'd';
      else if ((PART.indexOf(a) >= 0 || a === 'て') && CONTENT.test(s.charAt(i - 2)) && NEXT_OK.test(b) && i - 2 >= st) k = 'p';
      /* 読点・「……」を外して差し込むので、外したあとも最初の2文字が残る所だけ（「か、勘違い」の「か、」の後ろには入れない） */
      if (k && stripTail(s.slice(0, i)).replace(/[っッ]$/, '').length >= st + 2) out.push({ i: i, k: k });
    }
    return out;
  };
  /* 切れ端を差し込む形に（「……ッ、」「、ぐ……」） */
  function token(f) { return /[っッ]$/.test(f) ? '……' + f + '、' : '、' + f + (/[…‥]$/.test(f) ? '' : '……'); }
  function stripTail(a) { return a.replace(/[、…‥]+$/, ''); }
  var BRK = /[…‥]+[っッ]?、?$/, DOTS = /[…‥]$/;
  M.cut = function (S, who, line, lv, o) {
    o = o || {};
    var s = String(line == null ? '' : line), mk = s.charAt(0) === NOTONE ? NOTONE : '';
    lv = lv | 0;
    if (!s || lv < 1 || HK.SAFE_ON) return s;
    var r = rngOf(S), C = HK.MOAN_CUT;
    var hp = o.hard != null ? o.hard : o.sweet != null ? (o.sweet ? 0.25 : 0.75) : hardP(who ? M.tilt(who, o.ctx, o.role) : 0.5);
    var names = (o.names || []).slice();
    if (who && who.name) names.push(who.name);
    var light = lv === 1 || !!o.tail;
    /* 「……っ、」のように、もう息の詰まる所には「……っ」を重ねない */
    var pts = M.cutPoints(s, names).filter(function (p) { return !light || !BRK.test(s.slice(0, p.i)) || DOTS.test(s.slice(0, p.i)); });
    /* 差し込む数：lv1・lv2 は 1〜2、lv3 は 2〜3（言い返しの lv3 は語尾の声が主なので 0〜1） */
    var n = o.tail ? (r() < 0.5 ? 1 : 0) : lv === 3 ? 2 + (r() < 0.4 ? 1 : 0) : 1 + (r() < (lv === 1 ? 0.25 : 0.4) ? 1 : 0);
    var chosen = [];
    var pool = pts.slice();
    while (chosen.length < n && pool.length) {
      var j = Math.floor(r() * pool.length), p = pool.splice(j, 1)[0];
      if (chosen.some(function (q) { return Math.abs(q.i - p.i) < 3; })) continue;
      chosen.push(p);
    }
    chosen.sort(function (a, b) { return b.i - a.i; });
    chosen.forEach(function (p) {
      var A = s.slice(0, p.i), B = s.slice(p.i), dots = DOTS.test(A), brk = BRK.test(A);
      if (light) { s = dots ? A + 'っ、' + B : stripTail(A) + '……っ、' + B; return; }
      var frag = (r() < hp ? C.hard : C.sweet)[Math.floor(r() * 5)];
      /* もう息の詰まる所（「……」「……っ、」の後ろ）は、そのまま切れ端を続ける（「……っ、ぐ……こんな」） */
      if (brk) { if (frag === 'ッ') frag = 'く……っ'; s = A + (/[、…‥]$/.test(A) ? '' : '、') + frag + (/[っッ]$/.test(frag) ? '、' : '') + B; return; }
      s = stripTail(A) + token(frag) + B;
    });
    var core = s.replace(/[。、…‥！？!?っッ〜ー\s　]+$/, ''), endq = /[？?]/.test(s.slice(core.length));
    if (core.length < 2) core = s;
    if (o.tail) {
      /* 受けの言い返しの崩れ：語尾の後ろに声を一つ（「全部、あなたのせいです……あっ！」） */
      /* 声は最初のひと塊だけ（全角空白で区切った頭。長い声は 12 字まで） */
      var tl = String(o.tail).replace(/[\u2060♡]/g, '').replace(/^[…‥、\s　]+/, '').split(/[\s　]+/)[0];
      if (tl.length > 12) tl = tl.slice(0, 12).replace(/[、]$/, '') + '……';
      s = core + '……' + tl + (/[！!？?…‥]$/.test(tl) || /[っッ]$/.test(tl) && r() < 0.5 ? '' : '！');
    } else if (lv === 3 && !o.keepEnd) {
      var ends = r() < hp ? C.endHard : C.endSweet, e = ends[Math.floor(r() * ends.length)];
      s = core + (endq && r() < 0.5 ? '……！？' : e);
    } else if (!o.keepEnd && /。$/.test(s) && r() < 0.5) s = s.replace(/。$/, '……っ');
    /* 差し込む所がなく、何も変わらなかったら、語尾に詰まった息を */
    if (s === String(line) && !o.keepEnd) s = core + (lv >= 2 ? '……' + (r() < hp ? 'く……っ' : 'ぁ……っ') : '……っ');
    return mk && s.charAt(0) !== NOTONE ? mk + s : s;
  };

  /* ---------- 言い換えのあとで崩す印 ----------
     「」の直後に MK0 + lv + 強い切れ端の割合(0〜9) + 語尾を崩さない(k|-) + 種(36進) + MK2 + 語尾の声 + MK1 */
  function mark(r, lv, hp, keepEnd, tail) {
    return MK0 + lv + Math.round(clamp(hp) * 9) + (keepEnd ? 'k' : '-') + Math.floor(r() * 2176782335).toString(36) + MK2 + String(tail || '').replace(/[\uE3A0-\uE3A2]/g, '') + MK1;
  }
  var MARK_RE = /「([^「」]*)」\uE3A0([^\uE3A1]*)\uE3A1/g, STRAY_RE = /\uE3A0[^\uE3A1]*\uE3A1/g;
  function namesOf(people) {
    var out = [];
    (people || []).forEach(function (p) {
      if (!p) return;
      if (p.name) out.push(p.name);
      if (p.calls && typeof p.calls === 'object') Object.keys(p.calls).forEach(function (k) { if (typeof p.calls[k] === 'string') out.push(p.calls[k]); });
    });
    return out;
  }
  M.applyCutMarks = function (text, people) {
    if (typeof text !== 'string' || text.indexOf(MK0) < 0) return text;
    var names = namesOf(people);
    return text.replace(MARK_RE, function (m, q, pl) {
      var i2 = pl.indexOf(MK2), head = i2 >= 0 ? pl.slice(0, i2) : pl, tail = i2 >= 0 ? pl.slice(i2 + 1) : '';
      var lv = +head.charAt(0) || 1, hp = (+head.charAt(1) || 0) / 9, ke = head.charAt(2) === 'k', sd = parseInt(head.slice(3), 36) || 1;
      return '「' + M.cut(seeded(sd), null, q, lv, { hard: hp, keepEnd: ke, tail: tail, names: names }) + '」';
    }).replace(STRAY_RE, '');
  };
  var V = HK.Voice;
  if (V && V.processText && HK.wrap && !V.processText._moanCut) {
    HK.wrap(V, 'processText', function (pt0) {
      var f = function (text, people) { var r = pt0.apply(this, arguments); return typeof r === 'string' && r.indexOf(MK0) >= 0 ? M.applyCutMarks(r, people) : r; };
      f._moanCut = true;
      return f;
    });
  }
  /* 台詞の仕上げが途中で止まっても、印は残さない */
  if (V && V.processResult && HK.wrap) {
    HK.wrap(V, 'processResult', function (pr0) {
      return function (res) {
        try { return pr0.apply(this, arguments); } finally {
          ((res && res.log) || []).forEach(function (e) { if (e && typeof e.text === 'string' && e.text.indexOf(MK0) >= 0) e.text = e.text.replace(STRAY_RE, ''); });
        }
      };
    });
  }

  /* ---------- 台詞の行を選ぶ ---------- */
  /* 利用者の辞書（住人の欄 ＞ 住人= ＞ 口調= ＞ 態度= ＞ 共通）にこの鍵の行があれば、その表 */
  function userLines(S, who, key) {
    var U = M.user, own = M.ownOf ? M.ownOf(who) : null, r = S;
    var l = own && I.ulist(r, own.d, key, own.add);
    if (!l && U) { var wb = I.whoBox(U, who); l = wb && I.ulist(r, wb.d, key, wb.add); }
    if (!l && U) { var t = M.toneOf(who); l = I.ulist(r, U.tone[t], key, U.adds['tone:' + t]); }
    if (!l && U) { var ps = psLine(who); l = I.ulist(r, U.persona[ps], key, U.adds['persona:' + ps]) || (U.shared[key] && U.shared[key].length ? U.shared[key] : null); }
    return l && l.length ? l : null;
  }
  /* 表の束 [重み, 配列] から一つ（EroTop の混ぜ方：前から順にくじ） */
  function fromPools(S, P, ok) {
    var r = rngOf(S);
    P = P.map(function (p) { return [p[0], (p[1] || []).filter(ok)]; }).filter(function (p) { return p[1].length; });
    if (!P.length) return '';
    var pool = P[P.length - 1][1];
    for (var i = 0; i < P.length - 1; i++) { if (r() < P[i][0]) { pool = P[i][1]; break; } }
    return fresh(S, pool);
  }
  /* 相手の名前に呼び方（〇〇さん・〇〇先輩 など）が付く話し手か（tone-plus.js の V.callFor。入力の住人の呼び方の設定も見る） */
  function honorOf(who, bname) {
    var Vc = HK.Voice; if (!Vc || !Vc.callFor || !who || !bname || /^\{/.test(bname)) return !!(who && /^\{/.test(bname || '') && keigoBase(who));
    var src = M.chars && who.name ? M.chars[M.plainName(who.name)] : null, w = src || who;
    var c = Vc.callFor({ name: M.plainName(who.name), calls: w.calls || null, call: w.call || '', callG: w.callG || null, tone: HK.toneOf ? HK.toneOf(w) : w.tone }, { name: M.plainName(bname) });
    return !!(c && c !== M.plainName(bname));
  }
  /* 鍵の台詞（「」なし・3本のまま。{名} は相手の名前に）。{ q, user } か null */
  M.lineFor = function (S, who, key, o) {
    o = o || {};
    var ul = userLines(S, who, key);
    if (ul) { var u0 = fresh(S, ul); if (M.onLine) M.onLine(key, who, u0, true); return { q: unq(u0).replace(/\{名\}/g, o.bname || ''), user: true }; }
    var m = key.charAt(0), ps = psLine(who), T = m === 'z' || m === 'j' ? HK.MOAN_TEASE : m === 'u' ? HK.MOAN_TOP_SAID : m === 'a' ? HK.MOAN_SAID_MORE : null;
    if (!T) return null;
    var P = [], nt = o.night || '', k = o.kind || '';
    if (T.night && nt && T.night[nt] && T.night[nt][key]) P.push([0.45, T.night[nt][key]]);
    if (T.rel && o.rel && T.rel[o.rel] && T.rel[o.rel][key]) P.push([0.4, T.rel[o.rel][key]]);
    if (k && T.kind && T.kind[k] && T.kind[k][key]) P.push([key === 'u4' ? 0.6 : 0.35, T.kind[k][key]]);
    if (T[ps] && T[ps][key]) P.push([1, T[ps][key]]);
    var top = m !== 'a', honor = /呼び捨て/.test(JSON.stringify(P.map(function (p) { return p[1]; }))) && o.bname && honorOf(who, o.bname);
    var ok = function (l) {
      if (o.nogen && NOGEN_NG.test(l)) return false;
      /* 相手を「〇〇さん」と呼ぶ人（呼び方の設定・敬語の口調）には「呼び捨てにして」の台詞を使わない（呼び方が付いて食い違うので） */
      if (honor && /呼び捨て/.test(l)) return false;
      if (top && I.TOP_NG.test(l.replace(/\{[^{}]*\}/g, ''))) return false;
      if (!o.bname && l.indexOf('{名}') >= 0) return false;
      return true;
    };
    var l = fromPools(S, P, ok);
    if (l && M.onLine) M.onLine(key, who, l);
    return l ? { q: unq(l).replace(/\{名\}/g, o.bname || ''), user: false } : null;
  };

  /* ---------- 一場面の覚え（言葉責めの回数・言い返し・煽られた） ---------- */
  var SCN = typeof WeakMap === 'function' ? new WeakMap() : null;
  /* 場面の覚えは、その回の S（ctx・rng）に結びつける（S が無いときは覚えない。前の回に左右されないように） */
  function sceneOf(S, top, bot, st, fresh0) {
    var key = S && (typeof S === 'object' || typeof S === 'function') ? S : {};
    var at = S && S.log ? S.log.length : -1, idx = st ? STG.indexOf(st) : -1;
    var sc = SCN ? SCN.get(key) : key._moanScene;
    if (fresh0 || !sc || sc.top !== top || sc.bot !== bot || (at >= 0 && sc.at >= 0 && sc.at !== at) || (idx >= 0 && idx <= sc.idx)) {
      sc = { top: top, bot: bot, at: at, idx: -1, plan: null, z: 0, j: 0, ret: 0, provoked: false };
      if (SCN) SCN.set(key, sc); else key._moanScene = sc;
    }
    if (idx >= 0) sc.idx = idx;
    return sc;
  }
  var AMT = { off: 0, less: 0.5, normal: 1, more: 1.5 };
  function forceOf(o) { return !!(o && (o.force || o.rel === 'hate')); }
  /* 一場面の言葉責め・焦らしの回数を決める（5-1） */
  function planOf(S, sc, o) {
    if (sc.plan) return sc.plan;
    var r = rngOf(S), top = sc.top, bot = sc.bot, nt = M.nightOf ? M.nightOf(top, { partner: bot }) : '', ps = psLine(top), frc = forceOf(o);
    var pz, pj, cz = 1, cj = 1;
    if (nt === 'sadist') { pz = 0.7; pj = 0.3; cz = 2; }
    else if (nt === 'mean') { pz = 0.5; pj = 0.7; cj = 2; }
    else if (nt === 'sweet') { pz = 0; pj = 0.1; }
    else if (nt === 'shy') { pz = 0; pj = 0; }
    else if (TEASY[ps]) { pz = 0.2; pj = 0.1; } else { pz = 0.1; pj = 0.1; }
    var mo = M.optOf ? M.optOf(top).tease : 'normal', mul = AMT[mo];
    if (frc) pj = 0;
    var z = 0, j = 0, more = mo === 'more';
    if (pz > 0 && r() < Math.min(1, pz * mul)) z = 1 + (cz > 1 && r() < 0.5 ? 1 : 0) + (more && r() < 0.5 ? 1 : 0);
    if (pj > 0 && r() < Math.min(1, pj * mul)) j = 1 + (cj > 1 && r() < 0.5 ? 1 : 0) + (more && r() < 0.5 ? 1 : 0);
    while (z + j > 3) { if (z >= j) z--; else j--; }
    return (sc.plan = { z: z, j: j, sweetJ: nt === 'sweet', nt: nt === 'sadist' || nt === 'mean' ? nt : '', force: frc });
  }
  /* 呼び名の差し込み（{a} などの文字で書く呼ぶ側は、受けの文字も） */
  var BWHO = { '{a}': '{b}', '{x}': '{y}', '{T}': '{U}', '{A}': '{B}' };
  function namesFor(top, bot, o) {
    var tn = (o && o.who) || top.name, bn = o && o.bwho ? o.bwho : o && o.who ? (BWHO[o.who] || '') : bot.name;
    return { t: tn, b: bn };
  }
  function kindFor(top, bot, o) {
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(top, bot)) return '';
    if (o && o.kind) return o.kind === 'mf' || o.kind === 'mv' || o.kind === 'ma' ? 'm' : o.kind;
    return M.kindOf ? M.kindOf(top, bot) : '';
  }
  function relFor(S, top, bot, o) { return (o && o.rel) || (HK.EroTop && HK.EroTop.relOf ? HK.EroTop.relOf(S, top, bot) : ''); }
  /* 「名前「＠名前＠台詞」」＋崩しの印。user（利用者の行）は崩さない */
  function quote(nm, q, cutLv, r, hp, tail) {
    return nm + '「＠' + nm + '＠' + q + '」' + (cutLv > 0 ? mark(r, cutLv, hp, false, tail) : '');
  }
  /* 敬語の人の lv3：4割で3本の左（くだけた常体）を、その場で一人称・二人称だけそろえて崩す */
  function keigoDrop(S, who, nm, q, names) {
    var T = HK.Tone, s = T && T.split ? T.split(q) : null;
    if (!s) return '';
    var k = I.persons(s.K, who);
    return nm + '「' + NOTONE + M.cut(S, who, k, 3, { names: names, role: 'top' }).replace(/^\u2060/, '') + '」';
  }

  /* ---------- 呼応：言葉責め・焦らし → 言い返し ---------- */
  M.tease = function (S, top, bot, stage, o, sc0) {
    if (HK.SAFE_ON || !top || !bot) return ['', ''];
    o = o || {};
    var r = rngOf(S), T = typeof stage === 'number' ? stage : stageOf(stage) === 'mid' ? 1 : 0;
    var sc = sc0 || sceneOf(S, top, bot, typeof stage === 'string' ? stageOf(stage) : null), pl = planOf(S, sc, o);
    var remZ = pl.z - sc.z, remJ = pl.j - sc.j, sweetJ = pl.sweetJ && !sc.j && T >= 1;
    if (remZ <= 0 && remJ <= 0 && !sweetJ) return ['', ''];
    var kind = sweetJ && remZ <= 0 && remJ <= 0 ? 'j' : remZ > 0 && (remJ <= 0 || r() < remZ / (remZ + remJ)) ? 'z' : 'j';
    var w;
    if (kind === 'z') {
      w = T >= 1 ? { z0: 0.5, z1: 0.5, z2: 2, z3: 2 } : { z0: 2, z1: 2, z2: 1.5, z3: 1.5 };
      if (pl.nt === 'sadist') { w.z2 *= 2; w.z3 *= 2; }
      if (pl.nt === 'mean') w.z1 *= 2;
      var rel0 = relFor(S, top, bot, o);
      if (rel0 === 'lover') { w.z3 *= 0.4; w.z0 *= 1.5; w.z1 *= 1.5; }
    } else {
      w = pl.sweetJ ? { j3: 1 } : T >= 1 || sc.j > 0 && r() < 0.5 ? { j3: 3, j0: 0.5 } : { j0: 2, j1: 2, j2: 2 };
      if (pl.nt === 'mean' && !w.j3) { w.j0 *= 1.5; w.j1 *= 1.5; }
    }
    var key = wpick(r, w), nm = namesFor(top, bot, o);
    var L = M.lineFor(S, top, key, { night: pl.nt, rel: relFor(S, top, bot, o), kind: kindFor(top, bot, o), nogen: !kindFor(top, bot, o) && !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(top, bot)), bname: nm.b });
    if (!L) return ['', ''];
    if (kind === 'z') sc.z++; else { sc.j++; if (pl.sweetJ) pl.sweetJ = false; }
    var tl = M.tilt(top, { partner: bot }, 'top');
    var top1 = quote(nm.t, L.q, !L.user && T >= 1 && r() < 0.4 ? 1 : 0, r, hardP(tl));
    M.lastTease = key;
    return [top1, retort(S, top, bot, sc, o, nm, key)];
  };
  function retort(S, top, bot, sc, o, nm, tkey) {
    if (!nm.b || (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot, top))) return '';
    var r = rngOf(S), ro = M.optOf ? M.optOf(bot).retort : 'normal', rate = { off: 0, less: 0.15, normal: 0.3, more: 0.6 }[ro], max = ro === 'more' ? 2 : 1;
    var fal = I.fallenOf(bot);
    if (fal && rate > 0) rate = ro === 'more' ? 0.2 : 0.1;
    if (sc.ret >= max || !(rate > 0) || r() >= rate) return '';
    var ps = psLine(bot), base = RET_W[ps] || RET_W.gentle, tl = M.tilt(bot, { partner: top }, 'bot'), up = 1 + (tl - 0.5), dn = 1 + (0.5 - tl);
    var w = { a0: base[0] * up, a1: base[1] * dn, a2: base[2] * dn, a3: base[3] * up };
    if (forceOf(o)) w.a0 *= 1.5;
    if (fal) { w.a0 = 0; w.a1 = 0; if (!w.a2 && !w.a3) w.a2 = 1; }
    var key = wpick(r, w);
    if (!key) return '';
    /* 言い返しの体の組（女性の攻め×男性の受け＝fm の a3）は、攻めから見た組 */
    var L = M.lineFor(S, bot, key, { kind: kindFor(top, bot, o) });
    if (!L) return '';
    sc.ret++;
    if (key === 'a3') sc.provoked = true;
    M.lastRetort = key;
    var lv3 = !L.user && r() < 0.5, tail = '';
    if (lv3) tail = M.pick(S, bot, r() < 0.5 ? 'w0' : 'w2', { top: top, talk: 0 });
    return quote(nm.b, L.q, lv3 ? 3 : 0, r, hardP(tl), tail);
  }

  /* ---------- 攻めの崩れ（u） ---------- */
  function uLine(S, top, bot, sc, T, o) {
    var r = rngOf(S), tl = M.tilt(top, { partner: bot }, 'top'), nm = namesFor(top, bot, o), w;
    if (sc.provoked) { w = { u5: 1 }; sc.provoked = false; }
    else if (T <= 2) { w = { u0: 3, u1: 3, u5: 0.5 }; if (tl > 0.5) { w.u0 *= 1 + (tl - 0.5); w.u1 *= 1 + (tl - 0.5); } }
    else {
      w = { u2: 3, u3: nm.b ? 2 : 0, u4: 3, u6: 2 };
      if (tl < 0.5) { w.u2 *= 1 + (0.5 - tl); w.u6 *= 1 + (0.5 - tl); } else w.u4 *= 1 + (tl - 0.5);
    }
    var key = wpick(r, w), kd = kindFor(top, bot, o);
    var L = M.lineFor(S, top, key, { kind: kd, nogen: !kd && !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(top, bot)), bname: nm.b });
    if (!L) return '';
    M.lastU = key;
    if (L.user) return quote(nm.t, L.q, 0, r, 0);
    var lv = T >= 3 ? (r() < 0.5 + (0.5 - tl) * 0.3 ? 3 : 2) : (r() < 0.7 ? 2 : 1);
    if (lv === 3 && keigoBase(top) && r() < 0.4) { var kd2 = keigoDrop(S, top, nm.t, L.q, [top.name, bot.name, nm.b]); if (kd2) return kd2; }
    return quote(nm.t, L.q, lv, r, hardP(tl));
  }

  /* ---------- 攻めの一言（EroTop.say から） ---------- */
  M.T_OF = { start: 0, fore: 0, in: 0, mid: 1, peak: 2, after: -1 };
  function tLevel(S, sc, st, o) {
    var r = rngOf(S), t = M.T_OF[st];
    if (t === 1) t = r() < 0.2 + (1 - M.tilt(sc.top, { partner: sc.bot }, 'top')) * 0.25 ? 2 : 1;
    else if (t === 2) t = r() < 0.6 ? 3 : 2;
    if (t >= 0 && (sc.provoked || (o && o.late))) t = Math.min(3, Math.max(t + 1, sc.provoked ? 2 : 0));
    return t;
  }
  M.topSay = function (S, top, bot, stage, opt) {
    if (HK.SAFE_ON || !top || !bot) return '';
    opt = opt || {};
    var st = stageOf(stage), sc = sceneOf(S, top, bot, st);
    if (st === 'start' || st === 'after') return '';
    var r = rngOf(S), T = tLevel(S, sc, st, opt);
    if ((st === 'fore' || st === 'in' || st === 'mid') && T <= 1 && !sc.provoked) {
      var pr = M.tease(S, top, bot, T, opt, sc);
      if (pr[0]) return pr[0] + pr[1];
    }
    if (T >= 2 && (sc.provoked || r() < (st === 'peak' ? 0.6 : 0.7))) { var u = uLine(S, top, bot, sc, T, opt); if (u) return u; }
    /* EroTop の台詞を、快感の段で崩す（T1 は 2割5分で lv1、T2・T3 は 4割で lv1〜2） */
    if (T >= 1 && HK.EroTop && !opt.noPlain && r() < (T === 1 ? 0.25 : 0.4)) {
      var l = HK.EroTop.line(S, top, bot, st, opt), nm = namesFor(top, bot, opt);
      if (l) return quote(nm.t, unq(l), T === 1 ? 1 : r() < 0.5 ? 2 : 1, r, hardP(M.tilt(top, { partner: bot }, 'top')));
    }
    return '';
  };
  /* EroTop.slots の続き：この場面の言葉責め・焦らしの回数を先に決め、足りない段（前戯 → 最中 → 繋がる）を足す */
  M.slotsFix = function (S, top, bot, have, s, o) {
    if (HK.SAFE_ON || !top || !bot || !s) return s;
    var sc = sceneOf(S, top, bot, null, true), pl = planOf(S, sc, o || {});
    var need = pl.z + pl.j + (pl.sweetJ ? 1 : 0), cnt = ['fore', 'in', 'mid'].filter(function (k) { return s[k]; }).length;
    /* 甘々の焦らしの締め（j3）だけなら最中（T1）に */
    (pl.sweetJ && !pl.z && !pl.j ? ['mid', 'fore', 'in'] : ['fore', 'mid', 'in']).forEach(function (k) { if (cnt < need && !s[k] && !(have && have[k])) { s[k] = true; cnt++; } });
    /* 最中の一言（攻めの崩れ u・快感の段の崩し）の段：6 割で足す（崩れやすい人ほど多い） */
    if (!s.mid && !(have && have.mid) && rngOf(S)() < 0.45 + (1 - M.tilt(top, { partner: bot }, 'top')) * 0.25) s.mid = true;
    return s;
  };

  /* ---------- 見本（HK.Moan.demo に台詞の鍵と崩れの段を足す） ----------
     o.cut … 0 なし／1 少し／2 遮られる／3 決壊（台詞の鍵 z・j・u・a だけ。崩したあとの形を出す） */
  var demo0 = M.demo;
  M.isLineKey = function (key) { var m = M.MODES[String(key || '').charAt(0)]; return !!(m && m.line); };
  M.demo = function (key, o, tone0, n0) {
    if (o == null || typeof o !== 'object' || !M.isLineKey(key)) return demo0.apply(this, arguments);
    var x = o.seed != null ? (o.seed >>> 0) % 2147483648 : 12345, R = function () { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
    R.int = function (m) { return Math.floor(R() * m); };
    var S = { rng: R, log: [] }, w0 = o.who, Vc = HK.Voice;
    var who = w0 ? Object.assign({}, w0, { name: w0.name || '見本', tone: (HK.toneOf ? HK.toneOf(w0) : w0.tone) || 'gentle' })
      : { name: '見本', tone: o.tone || 'gentle', gender: o.gender == null ? 'f' : o.gender, eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } };
    if (!w0 && o.persona) who.persona = o.persona;
    who.persona = HK.personaOf ? HK.personaOf(who) : who.persona;
    var pg = who.gender === 'm' ? 'f' : 'm', partner = { name: '相手', gender: pg, tone: 'gentle', eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } };
    var top = M.isTopKey(key), kd = top ? (who.gender === 'm' ? 'm' : pg === 'm' ? 'fm' : 'ff') : (pg === 'm' ? 'm' : 'fm'), lv = o.cut | 0;
    var sv = { nmap: M.nmap, own: M.own };
    var person = { name: who.name, tone: who.tone, gender: who.gender || '', persona: who.persona, fp: who.fp || '', you: who.you || '', call: who.call || '', calls: who.calls || null, marks: '' };
    if (o.night) { M.nmap = {}; M.nmap[who.name] = { i: 0, night: o.night, nightFor: null }; }
    else if (w0) { M.nmap = {}; M.nmap[who.name] = { i: 0, night: w0.night || '', nightFor: null }; }
    if (w0 && M.ownMap) M.own = M.ownMap([w0]);
    var out = [];
    try {
      for (var i = 0; i < (o.n || 4); i++) {
        var nt = M.nightOf ? M.nightOf(who, { partner: NOBODY }) : '';
        var L = M.lineFor(S, who, key, { night: nt === 'sadist' || nt === 'mean' ? nt : '', kind: kd, bname: '相手' });
        if (!L) { out.push(o.detail ? { s: '（この鍵の台詞がありません）', raw: '', src: 'none' } : ''); continue; }
        var conv = Vc && Vc.processText ? Vc.processText('「＠' + who.name + '＠' + L.q + '」', [person, partner]) : '「' + L.q + '」';
        var q = unq(conv).replace(/\u2060/g, ''), s = !L.user && lv > 0 ? M.cut(S, who, q, lv, { names: [who.name, '相手'], role: top ? 'top' : 'bot', tail: !top && lv === 3 ? M.pick(S, who, 'w0', { top: partner, talk: 0 }) : '' }) : q;
        out.push(o.detail ? { s: s, raw: q, src: L.user ? 'user' : 'line', ends: false, fixed: false, kind: M.fitKind(M.toneOf(who), who).kind, cut: s !== q } : s);
      }
    } finally { M.nmap = sv.nmap; M.own = sv.own; }
    return out;
  };
  M.CUT_LABEL = ['なし', '少し', '遮られる', '決壊'];
})();
