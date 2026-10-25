/* 箱庭シミュレーター（R18版のみ）― 交わりの描写を組み立てる
   前戯 → 体位（どう繋がったか）→ 受けの喘ぎ → 最中 → 攻めの台詞 → 果てる声 → 果てる瞬間 → 事後の一言
   喘ぎと台詞は口調ごと（17種類）。女性どうし（HK.FF）・女性の攻め×男性の受け（HK.FM）は、体位の代わりに手立て（D.FF_POS／D.FM_POS）を選び、
   D.FF_MID／D.FM_MID の最中・D.FF_CLIMAX／D.FM_CLIMAX の果てと型ごとの文を混ぜて同じ流れに（女性どうしは挿入を前提にしない、女性の攻めは女性上位）。体位は、関係（恋人・敵・媚薬など）と気質で選ばれやすさが変わり、同じゲームでは続きにくい。
   HK.R18M.sex(S, 攻め, 受け, {mood, allow:[体位id], fore, short}) … mood: love（恋人・想い）/ rough（敵・荒々しく）/ drug（媚薬）/ plain（その場の勢い）
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, D = HK.R18M_DATA;
  if (!D || !ST) return;
  function F(t, m) { return ST.fmt(t, m); }
  /* 一回の結果の中で同じ文を繰り返さない（使い切ったら、いちばん前に使ったものから戻す。ero-kit.js の HK.Ero.fresh） */
  function pick(S, a) { return HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(S, a, function (l) { return ST.pick(S, l); }) : ST.pick(S, a); }
  function toneKey(p) {
    var t = HK.toneOf ? HK.toneOf(p) : p.tone;
    if (D.V[t]) return t;
    var b = HK.personaOf ? HK.personaOf(p) : 'gentle';
    return D.V[b] ? b : 'gentle';
  }
  /* 受け身を前提にした喘ぎ・台詞（奥まで届く・離して・ゆっくりして など）。自分で攻めを選んだ人には言わせない */
  var RECV = /奥|深[いく…っ、]|深$|届い|いっぱい|ちょうだい|くださ|ください|中に|入って|好きにし|お好きな|離せ|離、せ|離して|はなさ|やめ|止まって|止まれ|待て|待って|待……|待っ|ゆっくり|そこ[、はっ]|ばっか|触って|触んな|触る|どこ触|お許し|ご勘弁|許して|許、せ|ゆるして|あなたの、で|もっと|ずるい|反則|見るな|見ないで|みないで|見ん、な|見んな|のに|調子に|だめ、ぇ|勝手に|されたら|されては|される|させ、|させ……|壊れ|堕ち|満足か|覚えて|覚え、|負けて|負け、|ちが|ご、ごめん|ごめんなさ|すみ|申し訳|失礼|恥ずかし|はずかし|はしたな|いけませ|いけない|ならん|情けな|不覚|屈|助け|たすけ|ひっ|やだ|いや/;
  var TOP_OK = L('っ……ぁ|は、ぁ……っ|く……っ、ぁ……|……っ、ん……|ん、ッ……は……|……ふ、ぅ……っ|あ、あ……っ');
  /* 自分で攻めを選んだ人の台詞を、受け身でないものに絞る（残らなければ短い息づかいだけ） */
  function topLines(p, list) {
    if (!list || !HK.Pos || !HK.Pos.hardTop(p)) return list;
    var f = list.filter(function (x) { return !RECV.test(x); });
    return f.length ? f : TOP_OK;
  }
  function L(s) { return s.split('|'); }
  function say(S, p, kind) {
    var t = toneKey(p);
    if (kind === 'endure') return p.name + '「' + pick(S, D.ENDURE[t] || D.ENDURE.gentle) + '」';
    var v = D.V[t], list = v[kind] || v.mid;
    /* 攻めの台詞：女性の攻めには、その口調の女性の攻め向けの台詞（topF）があればそちらを */
    if (kind === 'top' && v.topF && HK.Pos && HK.Pos.isF && HK.Pos.isF(p)) list = v.topF;
    /* 始まり・最中・果てる声は、口調ごとの喘ぎ（novel-moan-tone.js）も混ぜる */
    var st = { start: 0, mid: 1, climax: 2 }[kind], own = st != null && HK.NovelMoan ? HK.NovelMoan.list(p, st) : [];
    if (own.length) list = list.concat(own);
    if (kind !== 'top' && kind !== 'topc') list = topLines(p, list);
    return p.name + '「' + pick(S, list) + '」';
  }
  function moodOf(m) { return m === 'rough' || m === 'drug' || m === 'love' ? m : 'plain'; }

  /* 女性が攻めのときの果てる声：女性の攻め向けの表（D.TOPC_F）と、口調ごとの果てる声のうち男性の体を前提にしないもの */
  var FF_TOPC_NG = /出|受け止め|受け取|中に|締め|全部、くれて/;
  function topcF(S, x) {
    var t = toneKey(x), base = (D.V[t] || D.V.gentle).topc.filter(function (s) { return !FF_TOPC_NG.test(s); });
    var l = (D.TOPC_F && (D.TOPC_F[t] || D.TOPC_F.gentle) || []).concat(base);
    return x.name + '「' + pick(S, l.length ? l : TOP_OK) + '」';
  }
  /* 同じ二人がこの回ですでに体を重ねたか（二度目以降の書き出しに使う） */
  function seenPair(S, x, y) {
    var k = [x.name, y.name].sort().join('\u0001'), m = S.r18Seen || (S.r18Seen = {}), r = !!m[k];
    m[k] = 1;
    return r;
  }
  /* その場の勢い（plain）の最中は、攻めの気質で love か rough に */
  function midOf(S, x, mood) { return mood === 'plain' ? (S.rng() < 0.25 + ((x.tr && x.tr.aggr) || 0) * 0.4 ? 'rough' : 'love') : mood; }

  /* 女性どうし・女性の攻めの「手立て」（男女の体位にあたるもの：D.FF_POS／D.FM_POS）を選ぶ。
     気分と気質で選ばれやすさが変わり、同じゲームでは続きにくい（男女の体位と同じ）。
     女性どうしの貝合わせ・入れ替わり・双頭の玩具は二人ともリバのときだけ、道具は opt.tools のときだけ */
  function pickTech(S, x, y, kind, mood, opt) {
    opt = opt || {};
    var all = kind === 'ff' ? D.FF_POS : D.FM_POS;
    if (!all || !all.length) return null;
    var riba = kind === 'ff' && !!(HK.Pos && HK.Pos.bothRiba && HK.Pos.bothRiba(x, y));
    var list = all.filter(function (p) { return (!p.riba || riba) && (!p.tools || opt.tools); });
    var used = S.r18Pos || (S.r18Pos = []), tx = x.tr || {};
    var p = HK.weighted(S.rng, list, function (p) {
      var w = mood === 'love' ? 0.5 + p.love : mood === 'rough' ? 0.5 + p.rough : 1 + (p.love + p.rough) * 0.35;
      if (/osae|kabe|sonkyo/.test(p.id)) w *= 1 + (tx.aggr || 0) + (tx.cp || 0) * 0.5;
      if (/jirashi/.test(p.id)) w *= 1 + (tx.a || 0);
      if (/hiza|mitchaku|taimen/.test(p.id)) w *= 1 + (tx.np || 0) * 0.5;
      var n = used.filter(function (u) { return u === p.id; }).length;
      return Math.max(0.02, w / (1 + n * 2.5));
    });
    used.push(p.id);
    return p;
  }
  /* 続けて読むと同じ仕草が二度出る文の組（手首をひとまとめ・爪を立てる・膝の上・同時に責める など）を避ける */
  var CLASH = ['同時に', '爪を立て', '手首をひとまとめ', '両手首', '膝の上', '脚を開かせ', '髪を掴', '顎を掴', '指を一本増や', '背中から', '背後から', '花芯', '内腿'];
  function clash(a, b) { if (!a || !b) return false; for (var i = 0; i < CLASH.length; i++) if (a.indexOf(CLASH[i]) >= 0 && b.indexOf(CLASH[i]) >= 0) return true; return false; }
  /* 前の文（prev）と同じ仕草が出ない候補から選ぶ（残らなければ全体から） */
  function apart(S, list, prev) { var c = (list || []).filter(function (t) { return !clash(t, prev); }); return pick(S, c.length ? c : list); }
  /* 最中の候補：気分ごとの文（D.FF_MID／D.FM_MID）に、型ごとの文（HK.FF／HK.FM の body）を混ぜる。
     手立ての文と同じ手（舌・脚の交差）が続く文は外す。女性どうしでリバでない組は、対等に繋がる文を外す */
  function midPool(kind, mid, st, tech, riba) {
    var DM = kind === 'ff' ? D.FF_MID : D.FM_MID, K = kind === 'ff' ? HK.FF : HK.FM;
    var B = K && K.POOLS && K.POOLS.body ? (K.POOLS.body[st] || K.POOLS.body.gentle) : [];
    /* 女性の攻めの型ごとの文のうち、繋がる前の文（入り口で止める・導いて腰を落とす）は、手立てのあとの最中には使わない */
    if (kind === 'fm') B = B.filter(function (t) { return !/入り口|導いて|なかなか腰|繋がった瞬間|腰を沈めていった/.test(t); });
    var all = ((DM && DM[mid]) || []).concat(B);
    if (kind === 'ff' && !riba && HK.Pos && HK.Pos.MUTUAL_RE) all = all.filter(function (t) { return !HK.Pos.MUTUAL_RE.test(t); });
    var r = all.filter(function (t) { return !((/舌/.test(t) && /舌/.test(tech)) || (/交差|擦り合わせ/.test(t) && /交差|擦り合わせ|擦り合う/.test(tech)) || clash(t, tech)); });
    return r.length ? r : all;
  }
  /* 果てる瞬間の候補：型ごとの文（HK.FF／HK.FM の climax）に、気分ごとの文（D.FF_CLIMAX／D.FM_CLIMAX）を混ぜる */
  function peakPool(kind, mid, st) {
    var K = kind === 'ff' ? HK.FF : HK.FM, C = kind === 'ff' ? D.FF_CLIMAX : D.FM_CLIMAX;
    var B = K && K.POOLS && K.POOLS.climax ? (K.POOLS.climax[st] || K.POOLS.climax.gentle) : [];
    return B.concat((C && C[mid]) || []);
  }
  /* 書き出しの候補（女性の攻め）：HK.FM の型ごとの書き出しと、気分ごとの前戯（D.FM_FORE。その場の勢いの文を3割混ぜる） */
  function fmOpen(S, mood, st) {
    var O = HK.FM.POOLS.open, a = O[st] || O.gentle;
    var f = D.FM_FORE ? D.FM_FORE[mood === 'plain' || S.rng() < 0.3 ? 'plain' : mood] : [];
    return S.rng() < 0.4 ? a : f.length ? f : a;
  }

  /* 女性どうし：体位（挿入）の文を使わず、手立て（D.FF_POS：指・舌・胸・背中から・膝の上・押さえつけ・壁際・焦らし。リバ同士は貝合わせ・入れ替わり、道具を許す箱庭は玩具）と喘ぎで組み立てる。x=動く側
     書き出しは前戯（D.FORE）か HK.FF の書き出し（二度目以降は repeat）、最中は D.FF_MID と型ごとの文、果ては型ごとの文と D.FF_CLIMAX、事後は HK.FF の事後か一言 */
  function ffSex(S, x, y, opt) {
    var mood = moodOf(opt.mood), rng = S.rng, m = { x: x.name, y: y.name };
    var ctx = { pick: function (a) { return pick(S, a); } }, FF = HK.FF;
    var st = mood === 'rough' ? 'rough' : mood === 'love' ? 'gentle' : FF.styleOf(x);
    var f = function (s) { return s.replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name); };
    var riba = !!(HK.Pos.bothRiba && HK.Pos.bothRiba(x, y)), again = seenPair(S, x, y), mid = midOf(S, x, mood);
    var out = [], fore = '';
    if (opt.fore !== false) {
      if (again && FF.lead && rng() < 0.6) fore = FF.lead(ctx, st, { repeat: true, riba: riba });
      else if (FF.lead && rng() < 0.45) fore = FF.lead(ctx, st);
      else fore = pick(S, D.FORE[mood === 'plain' || rng() < 0.3 ? 'plain' : mood]);
      out.push(F(f(fore), m));
    }
    var tech = pickTech(S, x, y, 'ff', mood, opt), body = tech ? apart(S, tech.t, fore) : FF.pick(ctx, 'body', st, { riba: riba });
    out.push(F(f(body), m));
    out.push(say(S, y, 'start'));
    if (!opt.short) {
      out.push(F(f(pick(S, midPool('ff', mid, st, body, riba))), m));
      out.push(say(S, x, 'top'));
      out.push(say(S, y, 'mid'));
    }
    out.push(say(S, y, 'climax'));
    if (rng() < 0.35) out.push(topcF(S, x));
    out.push(F(f(pick(S, peakPool('ff', mid, st))), m));
    if (!opt.short && rng() < 0.6) out.push(FF.after && rng() < 0.45 ? f(FF.after(ctx, FF.afterMode(mood))) : say(S, rng() < 0.6 ? y : x, 'after'));
    S.r18Last = tech ? tech.label : '指と舌';
    return out.join('');
  }

  /* 女性が攻め・男性が受け：女性上位の手立て（D.FM_POS：騎乗位・背面騎乗位・対面座位・壁際の座位・押さえつけて・密着・しゃがみ・焦らし）で組み立てる。
     書き出しは HK.FM の書き出しか D.FM_FORE、最中は D.FM_MID と型ごとの文、果ては型ごとの文と D.FM_CLIMAX。喘ぐのは主に受けの男性 */
  function fmSex(S, x, y, opt) {
    var mood = moodOf(opt.mood), rng = S.rng, m = { x: x.name, y: y.name };
    var ctx = { pick: function (a) { return pick(S, a); } };
    var st = mood === 'rough' ? 'rough' : mood === 'love' ? 'gentle' : HK.FF && HK.FF.styleOf ? HK.FF.styleOf(x) : 'gentle';
    var fill = function (s) { return F(s.replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name), m); };
    var mid = midOf(S, x, mood), out = [];
    var fore = opt.fore !== false ? pick(S, fmOpen(S, mood, st)) : '';
    var tech = pickTech(S, x, y, 'fm', mood, opt), body = tech ? apart(S, tech.t, fore) : HK.FM.pick(ctx, 'body', st);
    if (fore) out.push(fill(fore));
    out.push(fill(body));
    out.push(say(S, y, 'start'));
    if (!opt.short) {
      out.push(fill(pick(S, midPool('fm', mid, st, body, false))));
      out.push(say(S, x, 'top'));
      out.push(say(S, y, 'mid'));
    }
    out.push(say(S, y, 'climax'));
    /* 攻めの女性の果てる声（「出す」「締める」など男性の体を前提にした台詞は使わない） */
    if (rng() < 0.35) out.push(topcF(S, x));
    out.push(fill(pick(S, peakPool('fm', mid, st))));
    if (!opt.short && rng() < 0.6) out.push(HK.FM.POOLS.after && rng() < 0.45 ? fill(HK.FM.pick(ctx, 'after', st)) : say(S, rng() < 0.6 ? y : x, 'after'));
    S.r18Last = tech ? tech.label : '女性上位';
    return out.join('');
  }

  /* 体位を選ぶ */
  function pickPos(S, x, y, mood, allow) {
    var list = allow ? D.POS.filter(function (p) { return allow.indexOf(p.id) >= 0; }) : D.POS;
    if (!list.length) list = D.POS;
    var used = S.r18Pos || (S.r18Pos = []), tx = x.tr || {}, ty = y.tr || {};
    var tone = toneKey(y);
    return HK.weighted(S.rng, list, function (p) {
      var w = mood === 'love' ? 0.5 + p.love : mood === 'rough' ? 0.5 + p.rough : 1 + (p.love + p.rough) * 0.35;
      if (p.id === 'kijo') w *= 1 + (ty.fc || 0) * 2 + (tone === 'free' ? 1 : 0);
      if (p.id === 'back' || p.id === 'tachi' || p.id === 'neback') w *= 1 + (tx.aggr || 0) + (tx.cp || 0) * 0.5;
      if (p.id === 'seijo' || p.id === 'soku') w *= 1 + (tone === 'shy' || tone === 'devoted' ? 1 : 0) + (tx.np || 0) * 0.5;
      if (p.id === 'ekiben') w *= 0.4 + (x.stats && x.stats.nerve ? x.stats.nerve / 100 : 0.4);
      if (p.oral) w *= 0.45;
      var n = used.filter(function (u) { return u === p.id; }).length;
      return Math.max(0.02, w / (1 + n * 2.5));
    });
  }

  HK.R18M = {
    tone: toneKey,
    say: say,
    /* 一人の喘ぎ（kinds: ['start','mid','climax'] など） */
    moans: function (S, p, kinds) { return (kinds || ['start', 'climax']).map(function (k) { return say(S, p, k); }).join(''); },
    /* 二人の交わり。opt.fore=false で前戯を省く（すでに場面の文があるとき）。opt.short で短く */
    /* 自分で攻めを選んだ人の喘ぎ・絶頂の声を、受け身でないものに絞る（ほかの箱庭からも使う） */
    topLines: topLines,
    /* 女性が攻めのときの果てる声（r18-thick の女性どうし・女性の攻めでも使う） */
    topcF: topcF,
    /* 女性どうし・女性の攻めの手立て・最中・果て・書き出しの候補（r18-thick の長い山場でも使う） */
    tech: pickTech, midPool: midPool, peakPool: peakPool, fmOpen: fmOpen, apart: apart, clash: clash,
    sex: function (S, x, y, opt) {
      opt = opt || {};
      /* 向きは必ず HK.Pos.order に従う（自分で攻めを選んだ人を受けの位置に置かない） */
      if (HK.Pos) { var od = HK.Pos.order(x, y, [x, y]); x = od[0]; y = od[1]; }
      if (HK.NovelMoan) HK.NovelMoan.top = x;
      /* 性器なしの人がいる組（pos-nogen.js）：受けが none なら口まで、攻めが none なら指と玩具だけ */
      if (HK.NoGen && HK.NoGen.on(x, y)) { S.r18Last = HK.NoGen.kind(x, y) === 'oral' ? '口' : '指と玩具'; return HK.NoGen.text(S, x, y, opt); }
      if (HK.Pos && HK.FF && HK.Pos.ff(x, y)) return ffSex(S, x, y, opt);
      if (HK.FM && HK.FM.on(x, y)) return fmSex(S, x, y, opt);
      var mood = moodOf(opt.mood), rng = S.rng, m = { x: x.name, y: y.name };
      var pos = opt.pos ? D.POS.filter(function (p) { return p.id === opt.pos; })[0] : pickPos(S, x, y, mood, opt.allow);
      if (!pos) pos = pickPos(S, x, y, mood);
      (S.r18Pos || (S.r18Pos = [])).push(pos.id);
      var mid = midOf(S, x, mood);
      var out = [];
      if (opt.fore !== false) {
        out.push(F(pick(S, D.FORE[mood === 'plain' || rng() < 0.3 ? 'plain' : mood]), m));
        /* 前戯からいきなり繋がらないように、橋渡しの一文を挟む（口・指の場面は前戯の続きなので挟まない） */
        if (D.BRIDGE && pos.id !== 'kuchi' && pos.id !== 'yubi') out.push(F(pick(S, D.BRIDGE[mood] || D.BRIDGE.plain), m));
      }
      out.push(F(pick(S, pos.t), m));
      if (pos.id === 'kuchi') {
        /* 口での奉仕：喘ぐのは攻め */
        out.push(say(S, x, 'top'));
        if (!opt.short) out.push(say(S, x, 'topc'));
        out.push(F(pick(S, D.CLIMAX.kuchi), m));
      } else {
        out.push(say(S, y, 'start'));
        if (!opt.short) {
          out.push(F(pick(S, D.MID[mid]), m));
          out.push(say(S, x, 'top'));
          out.push(say(S, y, 'mid'));
        }
        out.push(say(S, y, 'climax'));
        if (pos.id !== 'yubi' && rng() < 0.45) out.push(say(S, x, 'topc'));
        out.push(F(pick(S, pos.id === 'yubi' ? D.CLIMAX.yubi : D.CLIMAX[mid]), m));
      }
      if (!opt.short && rng() < 0.6) out.push(say(S, rng() < 0.6 ? y : x, 'after'));
      S.r18Last = pos.label;
      return out.join('');
    },
    /* 体位の名前（直前の sex で使ったもの。理由の欄に出す） */
    lastPos: function (S) { return S.r18Last || ''; },
    /* 一人で */
    solo: function (S, p) { return say(S, p, 'start') + say(S, p, 'climax'); },
    /* 乱交：何人かの喘ぎを重ねる */
    group: function (S, ps) {
      var a = ps.slice().sort(function () { return S.rng() - 0.5; }).slice(0, 3);
      return a.map(function (p, i) { return say(S, p, i === a.length - 1 ? 'climax' : i ? 'mid' : 'start'); }).join('');
    },
    /* 無理やりの場面：抵抗の台詞 → 抵抗できなくされる一文 → 耐える声。by: 襲う側（人なら名前、'crowd'=村人たち、'god'=人でないもの）
       気の強い口調・CPの高い人ほど食ってかかって手荒く黙らされ、気の弱い人は懇願して押さえ込まれる */
    isStrong: function (y) { return !!(D.STRONG[toneKey(y)] || ((y.tr && y.tr.cp) || 0) > 0.6); },
    resist: function (S, by, y, opt) {
      opt = opt || {};
      var t = toneKey(y), tr = y.tr || {}, strong = D.STRONG[t] || (tr.cp || 0) > 0.6;
      var kind = by === 'crowd' || by === 'god' ? by : strong ? 'hard' : 'soft';
      var xn = typeof by === 'string' ? '' : by.name;
      var out = y.name + '「' + pick(S, D.RESIST[t] || D.RESIST.gentle) + '」' + F(pick(S, D.SUBDUE[kind]), { x: xn, y: y.name });
      if (opt.endure !== false) out += y.name + '「' + pick(S, D.ENDURE[t] || D.ENDURE.gentle) + '」';
      return out;
    },
    /* 人でないもの・村人・使用人の声 */
    /* 村人・使用人などの台詞。「」の頭に \u2060 を付けて、住人の口調に言い換えられないようにする（voice.js） */
    npc: function (S, kind, a) { return F(pick(S, D.NPC[kind]), { a: a ? a.name : '' }).replace(/「(?!\u2060)/g, '「\u2060'); }
  };
})();
