/* 箱庭シミュレーター（R18版のみ）: モブの声（HK.Moan.mob）
   住人でない相手（媚薬ロッカーの見回り・常識改変の客や演者・催眠のかける側のモブ など）が、住人の受けと同じ甘い喘ぎ（「ぁ、あ……っ♡」）を
   出さないように、モブだけの声の表から引く。口調の色は付けない（モブに口調は無い。「」の頭に ⁠ の印を付けて、台詞の言い換えを通さない）。
   ■ どのモブか（who の欄。無ければ下のように決める）
     who.mob か who.npc が真 … モブとして扱う（HK.Mob.make のモブ、solo-kaihen.js の客、yakata.js の主人など）
     who.mobRole … 'guest' 客（下卑た）／'guard' 見回り（抑えた）／'staff' 施術者・係の人（事務的）／'wall' 壁の向こう（声なし・息だけ）／'street' 街の人・知人（ふつう）
                    無ければ who.role（「警備員」など）から読む。読めなければ 'street'
     who.mobTop  … true 攻め（自分から突く・責める） ／ 'serv' 奉仕を受ける側・命じる側（主導しているが自分では動かないこともある） ／ false 受け
                    無ければ who.eroDom（ThickEro.fill の {ma} など）が真なら true、偽なら受け
     who.gender  … 'f' なら女性の声。ほかは男性の声
   ■ 作風
     男性向け（HK.Ero.moan・{m:鍵}）… 「気持ち悪い」寄り：荒い息・ねっとりした独り言・下卑た一言を多めに（表の * の行も使う）
     小説調（HK.Moan.say の novel）    … 「控えめ」寄り：短い息が中心。言葉は少しだけ（* の行は使わない）
   ■ 表の書き方
     段階 0 始め／1 最中／2 果て。行の頭の * は男性向けだけで使う行、+ は自分から攻めているとき（mobTop が true）だけ使う行
     ♡ は受けに回るモブの、男性向けの果ての一部だけ。攻めのモブには付けない
   登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, E = HK && HK.Ero, M = HK && HK.Moan;
  if (!HK || !E || !M) return;
  function L(s) { return s.split('|'); }
  var NOTONE = '⁠';

  /* ---------- 息だけ（小説調で多め。壁の向こうはこれだけ） ---------- */
  var BREATH = {
    m: [
      L('ふーっ……|……っ|ふ、っ……|はっ……|……ふぅ|ふん……っ'),
      L('ふーっ、ふーっ……|はっ、はっ……|く……っ|ぐ、っ……|っ、ふ……っ、ふ……|はぁ……っ、はぁ……'),
      L('く、ぅ……っ！|ぐ……っ、う……|っ……！|はっ、はっ……っ、ぐ……|ふーっ……ふーっ……っ、く|う、ぉ……っ')
    ],
    f: [
      L('……っ|ふ……|はぁ……|……ふふ|ふ、っ……|……ん'),
      L('はぁ……っ、はぁ……|ふ、っ……ふ……|……っ、ん|ん、ふ……|はっ……ふふ|……っ、は'),
      L('……っ、ん……！|は、っ……|ふ、ぅ……っ|……っ！|んっ……は……|はぁ……っ、ふ……')
    ]
  };

  /* ---------- 主導しているモブ（攻め・奉仕を受ける側）の声：役割×性別×段階 ---------- */
  var TOP = {
    /* 客：下卑た。ねっとりした独り言・鼻息・笑い */
    guest: {
      m: [
        L('へへ……いいぞ|ほう……悪くねえ|ふーっ……いいな、これ|*へへ、へ……たまんねえな……|*ふーっ、ふーっ……あったけえ……|+ほら、声出せよ'),
        L('いいぞ……そのまま……|たまんねえな……っ|ふーっ……もっとだ、もっと……|*ぐふ……っ、いい顔してんなあ……|*はぁっ、はぁっ……すげえ、すげえ……|+もっと締めろよ……っ'),
        L('ぐ、っ……出すぞ……っ|く……っ、出る……っ|ふーっ……っ、全部、受け取れよ……|*お゛……っ、出る、出る……っ|*はっ、はっ……ぐ、ぅ……っ……へへ……|+っ……奥で、出すぞ……')
      ],
      f: [
        L('ふふ……いいじゃない|へえ……上手ね|ほら、どうしたの|*ふふ、ふ……かわいいなあ……|*はぁ……いい匂い……|+もっと声、聞かせて'),
        L('そう、そのまま……|ふふ……かわいい|ん……悪くない……|*はぁ……っ、はぁ……もっと、ねえ、もっと……|*ふふ……っ、必死な顔……かわいい……|+ほら、まだ逃げないの'),
        L('……っ、ん……いい……|ふ……っ、はぁ……ふふ|……っ、あ、は……|*あは……っ、すご……っ|*ふーっ……っ、ん……ふふ……|……っ、もう、いいわ……')
      ]
    },
    /* 見回り：抑えた。声を殺している */
    guard: {
      m: [
        L('……静かに|……声、抑えて|ふ……っ、大丈夫だ|……すぐ済ませる|*……ふーっ……誰にも言うなよ……|……誰も来ない'),
        L('……っ、く……|声、出すな……っ|ふ……っ、ふ……|……いいか|*はっ……はぁ……っ……くそ、っ……|+……力、抜け'),
        L('……っ、出る……|く……っ……！|……っ、ふ……ぅ……|ぐ……っ、う……|*はっ、はっ……ふ、ぅ……っ……|……っ、すまない……')
      ],
      f: [
        L('……静かにね|……大丈夫、すぐ楽になるから|……声、抑えて|ふ……っ|*……ふふ……誰にも言わないでね……|……誰も来ないわ'),
        L('……っ、ん……|そう、そのまま……|……っ、ふ……|……いい子ね|*はぁ……っ……ふふ……|+……力、抜いて'),
        L('……っ、ん……！|ふ……っ……|……っ、は……ぁ……|……もう、いいわ……っ|*はぁ……っ、はぁ……ふふ……|……っ……')
      ]
    },
    /* 施術者・係の人：事務的。息が乱れても言葉は仕事のまま */
    staff: {
      m: [
        L('……楽にしていてください|……はい、そのまま|……始めます|ふ……っ|……力、抜いて|*……ふーっ……'),
        L('……っ、ふ……|……反応、良好です|……そのまま、もう少し|……っ、く……|*はっ……ふ、ぅ……っ……失礼……|……はい、上手です'),
        L('……っ、く……！|……っ、失礼……|ふ……っ、ぅ……|……っ……はい、終わりです|*っ……ふーっ……っ……|……っ、ふ……')
      ],
      f: [
        L('……楽にしていてくださいね|……はい、そのまま|ふ……|……始めますね|*……ふふ……|……力を抜いて'),
        L('……っ、ん……|……いい反応です|……そのまま……|……っ、ふ……|*はぁ……っ……ふふ、かわいい……|……もう少しです'),
        L('……っ、ん……！|……っ、ふ……|……っ、は……|……はい、よくできました|*……っ……ふふ……|……っ……')
      ]
    },
    /* 街の人・知人：ふつうの低い声。ねっとりは少し */
    street: {
      m: [
        L('……っ、ふ……|いいか……？|……っ、は……|ふーっ……|*はぁ……っ……ずっと、こうしたかった……|+……力、抜けよ'),
        L('く……っ|……いい……|ふ……っ、ふ……|はっ……はぁ……|*はぁっ、はぁっ……いい、いいぞ……っ|+声、我慢すんな'),
        L('っ……出る……っ|く、ぅ……っ！|……っ、ぐ……|はっ……っ、う……|*ふーっ、ふーっ……っ、ぐ、ぅ……！|……っ、は……')
      ],
      f: [
        L('ふふ……|……いい？|……っ、ん|ほら……|*はぁ……っ……やっと、触れた……|+……力、抜いて'),
        L('……っ、ん……|ふ……っ、いい……|……かわいい|はぁ……っ|*ふふ……っ、もっと見せて……|+ほら、声出して'),
        L('……っ、ん……！|は……っ|……っ……ふ……|ふ、ぅ……っ|*……っ、あは……すご……|……っ、は……')
      ]
    }
  };

  /* ---------- 受けに回るモブ（まれ）：住人の受けより控えめ。短い声と息 ---------- */
  var RECV = {
    m: [
      L('……っ、く|は、っ……|……っ、う|ぐ……っ|ふ、っ……|……っ'),
      L('っ……く、ぅ……|は……っ、くそ……|ぐ、っ……う……|ふ、ぅ……っ、ふ……|*はぁ、はぁ……っ……すげ……|*ふひ……っ……'),
      L('……っ、ぐ……！|く、ぅ……っ、出……|っ……う、ぁ……|は……っ……！|*お、ぉ……っ……|*はひ……っ……すげ、え……')
    ],
    f: [
      L('……っ|ん……っ|ふ……|は、っ……|……っ、ん|……ぁ'),
      L('……っ、ん……|は……っ、ぁ……|ん、く……っ|ふ、ぅ……|*……っ、あ……|*は、ぁ……っ、ん……'),
      L('……っ、ん……！|ふ、ぁ……っ……|……っ、ぁ……|は、ぅ……っ|*あ、ぁ……っ♡|*ん、んん……っ……')
    ]
  };
  var MOB = HK.MOAN_MOB = { BREATH: BREATH, TOP: TOP, RECV: RECV };

  /* ---------- 選び方 ---------- */
  function rand(S) { var r = (S && S.rng) || (S && S.int ? S : null); return r ? (typeof r === 'function' ? r() : r.float ? r.float() : Math.random()) : Math.random(); }
  function rint(S, n) { var r = (S && S.rng) || (S && S.int ? S : null); return r && r.int ? r.int(n) : Math.floor(rand(S) * n); }
  /* 一回の結果の中で同じ声をなるべく繰り返さない（moan-engine.js の fresh と同じ考え） */
  function fresh(S, list, tag) {
    if (!list.length) return '';
    var st = S && S.rng ? S : S && S.int ? S : null;
    var seen = st ? (st._mobSeen = st._mobSeen || {}) : {}, used = seen[tag] = seen[tag] || [];
    var free = list.filter(function (x) { return used.indexOf(x) < 0; });
    if (!free.length) { free = list.slice().sort(function (a, b) { return used.indexOf(a) - used.indexOf(b); }).slice(0, Math.max(1, Math.ceil(list.length / 2))); }
    var x = free[rint(S, free.length)], i = used.indexOf(x); if (i >= 0) used.splice(i, 1); used.push(x);
    return x;
  }
  /* M.MOB_ON を false にすると、モブも住人と同じ表から引く（前と比べる点検用） */
  M.MOB_ON = true;
  M.isMob = function (who) { return !!(M.MOB_ON && who && typeof who === 'object' && (who.mob || who.npc)); };
  /* 役割を読む（who.mobRole ＞ ctx.role ＞ 役目の呼び名） */
  M.mobRole = function (who, ctx) {
    var r = (ctx && ctx.role) || (who && who.mobRole);
    if (r && (TOP[r] || r === 'wall')) return r;
    var s = String((who && (who.role || who.full || who.name)) || '');
    if (/警備|見回り|管理人|係員|清掃|守衛/.test(s)) return 'guard';
    if (/施術|セラピスト|スタッフ|技師|医師|看護|係の/.test(s)) return 'staff';
    if (/客/.test(s)) return 'guest';
    return 'street';
  };
  /* 段階（0 始め／1 最中／2 果て）・作風（gross 男性向け／控えめ）からモブの声を一つ */
  M.mob = function (S, who, stage, ctx) {
    ctx = ctx || {};
    var st = Math.max(0, Math.min(2, stage | 0)), g = who && who.gender === 'f' ? 'f' : 'm';
    var role = M.mobRole(who, ctx), gross = ctx.gross != null ? !!ctx.gross : true;
    var side = ctx.side != null ? ctx.side : who && who.mobTop != null ? who.mobTop : !!(who && who.eroDom);
    var tag = 'mob.' + ((who && who.name) || '?') + '.';
    var br = BREATH[g][st], out;
    M.lastSrc = 'mob';
    if (role === 'wall') out = fresh(S, br, tag + 'b' + st);
    else {
      var words = (side ? TOP[role][g][st] : RECV[g][st]).filter(function (x) { var c = x.charAt(0); return (c !== '*' || gross) && (c !== '+' || side === true); }).map(function (x) { return /^[*+]/.test(x) ? x.slice(1) : x; });
      /* 男性向けは言葉を多め（受けのモブは息を多め）、小説調は息が中心 */
      var wr = gross ? (side ? 0.62 : 0.45) : (side ? 0.3 : 0.2);
      if (words.length && rand(S) < wr) {
        out = fresh(S, words, tag + (side ? 't' : 'r') + st + (gross ? 'g' : 'q'));
        /* 男性向けは、ときどき荒い息を前に足す（「ふーっ、ふーっ……　いいぞ……」。息で始まる行には足さない） */
        if (gross && side && !/^[ふはぐくっ…]/.test(out) && rand(S) < 0.35) { var b = fresh(S, BREATH[g][Math.max(1, st)], tag + 'pre'); if (b && b !== out) out = b + '　' + out; }
      } else out = fresh(S, br, tag + 'b' + st);
    }
    if (!gross) out = out.replace(/♡+/g, '');
    return NOTONE + (out || '……っ');
  };

  /* ---------- 入り口：モブなら、住人の表を引かずにモブの声 ---------- */
  /* 鍵（moan-dict.js）を段階に読み替える */
  var KEY_ST = { w0: 0, h0: 0, r0: 0, r1: 0, k0: 0, o0: 0, t0: 0, t1: 0, t2: 1, t3: 1, w1: 1, h1: 1, r2: 1, p0: 1, b0: 1, b1: 1, b2: 1, l0: 1, l1: 1, t4: 2, t5: 2, w2: 2, w3: 2, r3: 2, r4: 2, h2: 2, p1: 2 };
  var moan0 = E.moan;
  E.moan = function (S, who, stage, ctx) {
    if (M.isMob(who)) return M.mob(S, who, stage, { gross: !(S && S.env && S.env.style === 'novel') });
    return moan0.apply(this, arguments);
  };
  var pick0 = M.pick;
  M.pick = function (S, who, key, ctx) {
    if (M.isMob(who)) { var k = String(key || 'w0'); return M.mob(S, who, KEY_ST[k] != null ? KEY_ST[k] : 1, { gross: !(S && S.env && S.env.style === 'novel'), side: /^t/.test(k) ? (who.mobTop != null ? who.mobTop : true) : null }); }
    return pick0.apply(this, arguments);
  };
  var SAY_ST = { start: 0, kiss: 0, mid: 1, topmid: 1, suck: 1, lick: 1, climax: 2, top: 2 };
  var say0 = M.say;
  M.say = function (S, who, kind, o, old) {
    if (!HK.SAFE_ON && M.isMob(who)) {
      o = o || {};
      var side = /^top/.test(kind) ? (who.mobTop != null ? who.mobTop : true) : null;
      var s = M.mob(S, who, SAY_ST[kind] != null ? SAY_ST[kind] : 1, { gross: !o.novel, side: side });
      return o.novel ? M.plain(s) : s;
    }
    return say0.apply(this, arguments);
  };
})();
