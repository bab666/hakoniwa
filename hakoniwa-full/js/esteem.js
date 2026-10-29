/* 箱庭シミュレーター: 劣等感・優越の出来事・変化・結末（HK.EsteemEv。全箱庭の共通。族のかたまり pack-rel。両方のビルドに同じファイル）
   設計：docs/reports/2026-10-29/lovehate-design.md の 7 章（と 2-4）。関係の定義は ties.js の T.inferior・T.superior、判定の窓口は hate-love.js の HK.Esteem。
   ■ 組ごとの状態（エンジン型 ctx._es・物語型 S._es。鍵は「気持ちを持つ側>相手」）
       { h, t, type：設定した気持ち inferior|superior, cur：いまの気持ち（優越が逆転すると inferior）, st：''|even|resent|ack|flip, n：出来事の回数, succ／fail：見返そうとした結果, pend：待っている引き金 }
       恐怖・無関心（どちら向きでも恐怖、a→b の無関心）・「出来事：起こさない」の組は作らない（HK.Esteem.off）
   ■ 引き金（記録を見て拾う。エンジン型は Ctx.prototype.say、物語型は HK.Story.say の包み。自分の記録・性的な場面の記録は見ない）
       ・手を貸された：主役（記録の一人目）が相手で、気持ちを持つ側が二人目以降。庇う・救い出す・看病・手当て などの文（cold-fear.js と同じ拾い方）→ helped
       ・優しくされた：助け合い・絆の記録で、主役が相手、気持ちを持つ側が二人目以降（半分の確率）→ kind
       ・相手が目立った：主役が相手で、褒められた・勝った・一位・見事に・見破った・解決 などの文（物語型は札：推理・真相・手がかり・名探偵・勝利・救出 など）。
         クラスメイトはテストの結果（トップ）。気持ちを持つ側がその場にいる → shine
       ・相手より活躍できた：同じ印で主役が気持ちを持つ側、相手がその場にいる → out（優越は優越感：得意げ・見せつける・上機嫌で声をかける）
       ・相手の失敗：主役が相手で、失敗・しくじった・最下位・迷推理 などの文、または相手が弱った（cold-fear.js の HK.ColdFear.weak）→ gloat（優越だけ）
   ■ 出来事（エンジン型 HK.COMMON。物語型は HateKit.storyTick の包み（邪神村・吹雪の館・人狼）と区切りの見出しの後（宇宙船・RPG）で、記録として一つまで）
       tie_es_helped・tie_es_shine・tie_es_kind・tie_es_outshine・tie_es_strive（劣等感）・tie_es_gloat（優越）・tie_es_turn（変化）
       台詞は態度9種（esteem-text.js）。愛憎と重なる組（HK.LoveHate.has）は終わりに「卑屈な愛憎」「傲慢な愛憎」の一文。愛憎の「構う」（HK.LoveHate.kamau）にも同じ一文を足す
       避けている相手（HK.Avoid）には近づかない書き方（far）を使う。恐怖・無関心の組では起きない
   ■ 変化（tie_es_turn。組に一度）
       劣等感：見返せた（succ 2）・手を貸され優しくされて好意がある → 肩を並べる（恋愛が両方向に成り立てば、尊敬が恋へ）／しくじりが続く・目立たれて好意がない → 恨みに
       優越：相手に目立たれ・手を貸され続ける → 認める／自分が弱った（HK.ColdFear.weak）・目立たれ続ける → 立場が逆転（劣等感に変わる）
   ■ 結末：エンジン型は HK.TieRel.refine・pairText を包む（関係の名前：引け目のまま・見返して肩を並べた・尊敬から恋へ・恨みに変わった・見下したまま・実力を認めた・立場が逆転した）と
       結末の覚え書き（ctx.flags.endNotes）。物語型は HK.Story.result を包み、結末の箇条書き・住人の覚え書き・関係図の★の線
   ■ 値（土台の ties.js：劣等感は緊張+6・信頼の伸び×0.8、優越は好意の伸び×0.8・緊張+4）に、出来事ごとの小さな上下を足す
   ■ 文の中で「助けた」「助けられ」などは使わない（cold-fear.js の引き金が読み違えるため）。台詞は3本のベース。登場人物はすべて成人として扱う */
/* @event scen=jashin,jinro,yakata,ship,rpg id=es_story_helped cat=conflict tie=inferior,superior label=引け目や驕りで手助けを素直に受けられない */
/* @event scen=jashin,jinro,yakata,ship,rpg id=es_story_shine cat=conflict tie=inferior,superior label=目立った相手に落ち込む・張り合う */
/* @event scen=jashin,jinro,yakata,ship,rpg id=es_story_out cat=conflict tie=inferior,superior label=相手より活躍して安堵する・得意になる */
/* @event scen=jashin,jinro,yakata,ship,rpg id=es_story_gloat cat=conflict tie=superior label=見下す相手の失敗にほくそ笑む */
/* @event scen=jashin,jinro,yakata,ship,rpg id=es_story_turn cat=bond tie=inferior,superior label=劣等感・優越の気持ちが変わる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.addTo || !HK.wrap || !HK.COMMON || !HK.Esteem || !HK.EsteemText) return;
  var ES = HK.Esteem, X = HK.EsteemText, E = HK.EsteemEv = {};
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var p = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function here(c) { return !!c && (HK.State && HK.State.here ? HK.State.here(c) : c.alive !== false); }
  function hereS(p) { return !!p && here(p) && !p.bound && !p.locked && !p.mad && !p.away && !p.panic && !p.out && !p.taken; }
  function freeE(c) { return here(c) && !(c.flags && (c.flags.caged != null || c.flags.down)) && !c.mad; }
  function trOf(c) { return (c && c.tr) || (c && c.eg && HK.traits ? HK.traits(c.eg) : HK.traits({})); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function rk(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function fill(t, m) { return String(t).replace(/\{(a|b)\}/g, function (s, k) { return m[k] ? m[k].name : s; }); }
  function pickOf(Z, arr) {
    if (!arr || !arr.length) return '';
    if (isCtx(Z)) return Z.pick(arr);
    if (HK.Story && HK.Story.pick && Z && Z.recent) return HK.Story.pick(Z, arr);
    return arr[Math.floor(Z.rng() * arr.length)];
  }
  function P0(Z) { return isCtx(Z) ? Z.chars : Z.P; }
  function stepOf(Z) { return isCtx(Z) ? Z.stepIndex : (Z._esStep || 0); }
  function weak(Z, c) { var CF = HK.ColdFear; return CF && CF.weak ? CF.weak(Z, c) : ''; }
  function affOf(Z, a, b) {
    if (isCtx(Z)) return Z.R(a, b).aff;
    var d = Z.relD && Z.relD[rk(a, b)];
    return (d || 0) * 100;
  }
  function relS(S, a, b, d) { if (!d) return; S.relD = S.relD || {}; var k = rk(a, b); S.relD[k] = clamp((S.relD[k] || 0) + d, -1, 1); }
  /* 恋愛として成り立つ組か（尊敬が恋へ：両方向の恋愛対象・恋愛の欄・恋愛の起こりやすさ） */
  function romOK(Z, a, b) {
    if (!HK.canLove || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
    if (HK.tieLoveNoPair && isCtx(Z) && HK.tieLoveNoPair(Z, a, b)) return false;
    if (isCtx(Z)) return !!Z.romanceOk && Z.romanceOk([a, b]);
    if (HK.ngPair && HK.ngPair(a, b)) return false;
    return !(Z.env && Z.env.romance != null && Z.env.romance !== '' && +Z.env.romance === 0);
  }
  var JA = { inferior: '劣等感', superior: '優越' };
  var OWN_RE = /(?:劣等感|優越)(?:の変化)?：/;

  /* ================= 組の表 ================= */
  /* 物語型で、入力の関係の一覧から恐怖・無関心を見る（S.ties がまだ無い箱庭があるため） */
  function offIn(list, a, b) {
    return list.some(function (t) {
      if (!t || !((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i))) return false;
      return (t.type === 'apathy' && t.a === a.i) || t.type === 'fear';
    });
  }
  function build(Z, ties, P) {
    var out = {}, any = false;
    (ties || []).forEach(function (t) {
      if (!t || (t.type !== 'inferior' && t.type !== 'superior') || t.a === t.b || !P[t.a] || !P[t.b] || t.noev === 'off') return;
      var a = P[t.a], b = P[t.b];
      if (isCtx(Z) ? ES.off(Z, a, b) : offIn(ties, a, b)) return;
      out[t.a + '>' + t.b] = { h: t.a, t: t.b, type: t.type, cur: t.type, st: '', n: { helped: 0, shine: 0, kind: 0, out: 0, gloat: 0, strive: 0 }, succ: 0, fail: 0, pend: null, last: -9, strAt: -9, end: '' };
      any = true;
    });
    return any ? out : null;
  }
  E.pairOf = function (Z, h, t) { var m = Z && Z._es; return m && h && t ? m[h.i + '>' + t.i] || null : null; };
  function pairsOf(Z, h) { var m = Z._es, out = []; if (!m) return out; for (var k in m) if (m[k].h === h.i) out.push(m[k]); return out; }
  function total(p) { var s = p.succ + p.fail; for (var k in p.n) s += p.n[k]; return s; }

  /* ================= 引き金 ================= */
  var RESCUE_RE = /庇っ|かばっ|庇い|かばい|身を挺|助け出|救い出|引き上げ|引っ張り上げ|手当て|看病|介抱|止血|担いで|背負って|盾にな|命を救|救出|助けた|助けられ/;
  var SHINE_RE = /褒められ|ほめられ|称賛|喝采|拍手|一目置|見直さ|注目を集め|人気を集め|視線を集め|一位|首位|優勝|勝ち抜|勝利|満点|手柄|大活躍|見事に|やってのけ|成功させ|解決し|突き止め|見破っ|言い当て|仕留め|撃退/;
  var SHINE_TAG = /^(推理|真相|偽装を見破る|手がかり|名探偵|探偵役|勝利|星を発見|研究|危機を回避|退魔|お祓い|封印|決着|占い結果|救出|生還|発見)/;
  var FAIL_RE = /失敗し|しくじ|空回り|恥をかい|笑いもの|笑い者|赤点|最下位|負けた|敗れ|振られ|ふられ|へまを|大失態|醜態/;
  var FAIL_TAG = /^(迷推理|失敗|空回り|読み違い|探索失敗|救出失敗|破綻|失言|脱出失敗|足を引っ張る)/;
  var KIND_TAG = /^(看病|治療|絆|食事|寄り添う|共同作業|慰め|晩酌|酒盛り)/;
  var NEG_RE = /嫌味|罵|殴|怒鳴|睨|突き飛ば|脅|嘲|嫌がらせ/;
  var KPRI = { helped: 5, out: 4, shine: 3, gloat: 3, kind: 2 };
  function pend(Z, p, k, why) {
    var s = stepOf(Z);
    if (p.st && p.st !== 'flip') return;
    if (k === 'gloat' && p.cur !== 'superior') return;
    var q = p.pend;
    if (q && s - q.at <= 2 && KPRI[q.k] > KPRI[k]) return;
    p.pend = { k: k, at: s, why: why || '' };
  }
  /* 気持ちを持つ側 h が、その場で相手 t の様子を見ていたか */
  function sees(Z, h, t, idx) {
    if (isCtx(Z)) return freeE(h) && here(t) && (idx.indexOf(h.i) >= 0 || Z.others(h).indexOf(t) >= 0);
    return hereS(h) && hereS(t);
  }
  /* 記録 e（actors は番号）を見る。e.text・e.why・e.tag・e.cat */
  function scan(Z, e) {
    var m = Z._es; if (!m || !e) return;
    var why = String(e.why || ''), txt = String(e.text || ''), tag = String(e.tag || '');
    if (OWN_RE.test(why) || e.lewd || e.kind === 'step' || e.kind === 'death') return;
    var P = P0(Z), idx = (e.actors || []).filter(function (x) { return x != null; });
    /* クラスメイト：テストの結果（トップ＝目立った、最下位＝失敗） */
    var tm = /テストの結果が出た。トップは(.+?)、最下位は(.+?)。/.exec(txt);
    if (tm) {
      var top = P.filter(function (c) { return c.name === tm[1]; })[0], bot = P.filter(function (c) { return c.name === tm[2]; })[0];
      Object.keys(m).forEach(function (k) {
        var p = m[k], H = P[p.h], B = P[p.t];
        if (!H || !B || !freeE(H) || !here(B)) return;
        if (B === top) pend(Z, p, 'shine', B.name + 'がテストでトップを取った');
        else if (H === top) pend(Z, p, 'out', H.name + 'がテストでトップを取った（' + B.name + 'より上）');
        else if (B === bot) pend(Z, p, 'gloat', B.name + 'がテストで最下位だった');
      });
      return;
    }
    if (!idx.length) return;
    var s = txt + ' ' + why + ' ' + tag, cat = e.cat || '', T = P[idx[0]];
    if (!T) return;
    var resc = idx.length >= 2 && RESCUE_RE.test(s) && (cat === 'help' || /救出|庇|かば|助け|看病|手当|治療/.test(tag + s));
    var fail = !resc && (FAIL_RE.test(s) || FAIL_TAG.test(tag)) && cat !== 'romance';
    var shine = !resc && !fail && (SHINE_RE.test(s) || SHINE_TAG.test(tag)) && !/^(death|kill|romance)$/.test(cat) && !NEG_RE.test(txt);
    var kind = !resc && !fail && idx.length >= 2 && (cat === 'bond' || cat === 'help' || KIND_TAG.test(tag)) && !NEG_RE.test(txt) && Z.rng() < 0.5;
    if (!resc && !fail && !shine && !kind) return;
    Object.keys(m).forEach(function (k) {
      var p = m[k], H = P[p.h], B = P[p.t];
      if (!H || !B) return;
      var hIn = idx.slice(1).indexOf(p.h) >= 0;
      if (p.t === idx[0]) {
        if (resc && hIn && sees(Z, H, B, idx)) pend(Z, p, 'helped', B.name + 'が' + H.name + 'に手を貸した');
        else if (kind && hIn && sees(Z, H, B, idx)) pend(Z, p, 'kind', B.name + 'が' + H.name + 'に優しくした');
        else if (shine && sees(Z, H, B, idx)) pend(Z, p, 'shine', B.name + 'が目立った');
        else if (fail && sees(Z, H, B, idx)) pend(Z, p, 'gloat', B.name + 'がしくじった');
      } else if (p.h === idx[0] && shine && sees(Z, H, B, idx)) pend(Z, p, 'out', H.name + 'が' + B.name + 'の前で活躍した');
    });
  }
  E.scan = scan;

  /* ================= 一回ぶんの文と値 ================= */
  function near(Z, a, b) { return !(HK.Avoid && HK.Avoid.of && HK.Avoid.of(Z, a, b)); }
  function lhTail(Z, a, b, kind) {
    if (!HK.LoveHate || !HK.LoveHate.has || !HK.LoveHate.has(Z, a, b)) return '';
    return pickOf(Z, X.lh[kind]);
  }
  /* T：表（lead・far・say・tail）。nr：相手に近づく書き方か */
  function compose(Z, T, a, b, nr) {
    var t = pickOf(Z, !nr && T.far ? T.far : T.lead);
    if (T.say && (nr || !T.far)) t += a.name + pickOf(Z, T.say[per(a)] || T.say.gentle);
    if (T.tail && nr && Z.rng() < 0.55) t += pickOf(Z, T.tail);
    return t;
  }
  function mod(Z, a, b, d, sd) {
    if (isCtx(Z)) { Z.mod(a, b, d); return; }
    relS(Z, a, b, sd || 0);
  }
  function stress(Z, a, v) { if (isCtx(Z)) Z.stress(a, v); }
  var KJA = { helped: '手を貸された', shine: '相手が目立った', kind: '優しくされた', out: '相手より活躍できた', gloat: '相手がしくじった' };
  /* 引き金への反応：{ text, why, cat, mag } */
  function react(Z, p, k) {
    var P = P0(Z), a = P[p.h], b = P[p.t], cur = p.cur, inf = cur === 'inferior', sub = inf ? 'inf' : 'sup';
    var nr = near(Z, a, b), T = (X[k] || {})[sub], m = { a: a, b: b };
    if (!T) return null;
    var text = compose(Z, T, a, b, nr), lt = lhTail(Z, a, b, cur);
    if (lt) text += lt;
    var head = JA[cur] + '：' + a.name + 'は' + b.name + (inf ? 'に引け目を感じている' : 'を見下している') + (p.st === 'flip' ? '（立場が逆転してから）' : '') + (lt ? (inf ? '（卑屈な愛憎）' : '（傲慢な愛憎）') : '');
    var why = head + '／' + KJA[k] + (p.pend && p.pend.why ? '（' + p.pend.why + '）' : '') + '／';
    var cat = 'conflict', mag = 12;
    if (k === 'helped') {
      why += inf ? '素直に礼が言えず、自分を責めた' : 'なぜこいつに、と苛立って礼を言わなかった';
      if (inf) { mod(Z, a, b, { trust: 2, aff: 2, ten: 3 }, 0.02); stress(Z, a, 5); cat = 'solo'; }
      else { mod(Z, a, b, { aff: -3, ten: 5 }, -0.03); if (isCtx(Z)) Z.mod(b, a, { aff: -2, ten: 2 }); }
      mag = 14;
    } else if (k === 'shine') {
      why += inf ? '比べて落ち込んだ' : '手柄を軽んじて張り合った';
      if (inf) { mod(Z, a, b, { ten: 4, aff: -1 }, -0.01); stress(Z, a, 6); cat = 'solo'; }
      else { mod(Z, a, b, { ten: 5, aff: -3 }, -0.03); if (isCtx(Z)) Z.mod(b, a, { ten: 2 }); }
    } else if (k === 'kind') {
      why += inf ? '素直に受け取れず、卑屈な返事をした' : '施しと受け取り、見下した返事をした';
      if (inf) { mod(Z, a, b, { aff: 2, ten: 2 }, 0.01); stress(Z, a, 3); cat = 'bond'; }
      else { mod(Z, a, b, { aff: 1, ten: 2 }, -0.01); if (isCtx(Z)) Z.mod(b, a, { aff: -3, ten: 3 }); }
      mag = 10;
    } else if (k === 'out') {
      why += inf ? '一瞬ほっとしたが、まぐれだと打ち消した' : (nr ? '優越感を覚え、得意げに見せつけて上機嫌で声をかけた' : '優越感を覚え、遠くから得意げに眺めた（' + a.name + 'は' + b.name + 'を避けている）');
      if (inf) { mod(Z, a, b, { ten: -3, trust: 2 }, 0.02); stress(Z, a, -4); p.succ += 0.5; cat = 'solo'; }
      else { mod(Z, a, b, { ten: -2 }, 0); if (isCtx(Z) && nr) Z.mod(b, a, { ten: 4, aff: -3 }); stress(Z, a, -6); }
      mag = 14;
    } else if (k === 'gloat') {
      why += nr ? '失敗に満足した' : '失敗に満足し、離れたところで笑った（' + a.name + 'は' + b.name + 'を避けている）';
      mod(Z, a, b, { aff: -3, ten: 2 }, -0.02); stress(Z, a, -4);
    }
    p.n[k] = (p.n[k] || 0) + 1;
    return { text: fill(text, m), why: why, cat: cat, mag: mag };
  }
  /* 見返そうとする（劣等感だけ） */
  function strive(Z, p) {
    var P = P0(Z), a = P[p.h], b = P[p.t], t = trOf(a), m = { a: a, b: b };
    var ch = clamp(0.3 + (t.a || 0) * 0.25 + (t.np || 0) * 0.05 + p.succ * 0.05 - p.fail * 0.05, 0.15, 0.75), ok = Z.rng() < ch;
    var T = X.strive[ok ? 'ok' : 'ng'], text = compose(Z, T, a, b, true), lt = lhTail(Z, a, b, 'inferior');
    if (lt) text += lt;
    p.n.strive++; p.strAt = stepOf(Z);
    if (ok) { p.succ++; mod(Z, a, b, { ten: -4, trust: 3, aff: 2 }, 0.03); stress(Z, a, -6); }
    else { p.fail++; mod(Z, a, b, { ten: 5, aff: -3 }, -0.03); stress(Z, a, 8); }
    return { text: fill(text, m), why: '劣等感：' + a.name + 'は' + b.name + 'を見返そうとした（' + (ok ? 'うまくいった。引け目が少し解けた' : '無理をしてしくじった。引け目が深まった') + '／自信 ' + Math.round(ch * 100) + '%）', cat: ok ? 'solo' : 'conflict', mag: 14 };
  }
  function canStrive(Z, p) {
    return p.cur === 'inferior' && !p.st && p.n.shine + p.n.helped + p.n.kind >= 1 && stepOf(Z) - p.strAt >= 3;
  }
  /* 変化：'even'|'resent'|'ack'|'flip'|'' */
  function turnOf(Z, p) {
    /* 箱庭一回で同じ組に起きる出来事は 1〜4 回ほどなので、2 回目からを変化の候補にする */
    if (p.turned || total(p) < 2) return '';
    var P = P0(Z), a = P[p.h], b = P[p.t], aff = affOf(Z, a, b);
    if (p.cur === 'inferior') {
      if (p.succ >= 1.5 || (p.n.helped + p.n.kind >= 2 && aff > 15) || (p.n.out >= 2 && aff > 5)) return 'even';
      if (p.fail >= 2 || (p.fail >= 1 && p.n.shine >= 1) || (p.n.shine >= 2 && aff < -5)) return 'resent';
      return '';
    }
    if (weak(Z, a) && p.n.shine + p.n.helped + p.n.kind >= 1) return 'flip';
    if (p.n.shine >= 2 && p.n.shine >= p.n.out + 2) return 'flip';
    if (p.n.shine + p.n.helped + p.n.kind * 0.5 >= 1.5 && aff > -30) return 'ack';
    return '';
  }
  function endNote(Z, p, key) {
    var t = X.END[key]; if (!t) return;
    p.end = key;
    if (!isCtx(Z)) return;
    var s = fill(t, { a: Z.chars[p.h], b: Z.chars[p.t] }), l = Z.flags.endNotes = Z.flags.endNotes || [];
    if (l.indexOf(s) < 0) l.push(s);
  }
  function turn(Z, p, k) {
    var P = P0(Z), a = P[p.h], b = P[p.t], T = X.turn[k], m = { a: a, b: b };
    /* 起きていないことを書く地の文は使わない（手を貸されていないのに「手を貸してもらい」、しくじっていないのに「失敗が重なる」） */
    var leads = T.lead.filter(function (l) { return (p.n.helped || !/手を貸/.test(l)) && (p.fail || !/失敗が重な/.test(l)); });
    var text = pickOf(Z, leads.length ? leads : T.lead) + a.name + pickOf(Z, T.say[per(a)] || T.say.gentle), why, cat = 'bond';
    p.turned = true;
    if (k === 'even') {
      p.st = 'even';
      mod(Z, a, b, { trust: 10, aff: 8, ten: -12 }, 0.15);
      var love = romOK(Z, a, b) && affOf(Z, a, b) > 15 && Z.rng() < 0.5;
      if (love) { p.love = true; text += pickOf(Z, T.love); if (isCtx(Z)) Z.mod(a, b, { att: 12 }); }
      endNote(Z, p, love ? 'inf_love' : 'inf_even');
      why = '劣等感の変化：' + a.name + 'は' + b.name + 'への引け目を乗り越え、肩を並べた' + (love ? '（尊敬が恋に変わり始めた）' : '（尊敬に変わった）');
    } else if (k === 'resent') {
      p.st = 'resent'; cat = 'conflict';
      mod(Z, a, b, { aff: -14, ten: 12, trust: -8 }, -0.2);
      endNote(Z, p, 'inf_resent');
      why = '劣等感の変化：' + a.name + 'の' + b.name + 'への引け目は、恨みに変わった（' + (p.fail >= 2 ? '見返そうとしてしくじりが続いた' : '目立たれ続け、好意も残っていなかった') + '）';
    } else if (k === 'ack') {
      p.st = 'ack';
      mod(Z, a, b, { aff: 10, trust: 10, ten: -10 }, 0.15);
      endNote(Z, p, 'sup_ack');
      why = '優越の変化：' + a.name + 'は' + b.name + 'の実力を認めた（相手に目立たれ・手を貸され続けた）';
    } else {
      p.st = 'flip'; p.cur = 'inferior'; cat = 'conflict';
      mod(Z, a, b, { ten: 8, trust: 4 }, -0.05); stress(Z, a, 10);
      endNote(Z, p, 'sup_flip');
      var w = weak(Z, a);
      why = '優越の変化：' + a.name + 'と' + b.name + 'の立場が逆転した（' + (w ? a.name + 'が' + w : b.name + 'に目立たれ続けた') + '。見下していた相手に、引け目を感じるようになった）';
    }
    return { text: fill(text, m), why: why, cat: cat, mag: 22 };
  }
  E.turnOf = turnOf;

  /* ================= エンジン型の出来事 ================= */
  function okE(ctx, p) {
    var a = ctx.chars[p.h], b = ctx.chars[p.t];
    return !!(a && b && freeE(a) && here(b) && !(b.flags && b.flags.caged != null) && p.last !== ctx.stepIndex && (!p.st || p.st === 'flip') && ES.of(ctx, a, b));
  }
  function pendE(ctx, a, k) {
    if (!ctx._es) return null;
    var L0 = pairsOf(ctx, a);
    for (var i = 0; i < L0.length; i++) {
      var p = L0[i], q = p.pend;
      if (!q || q.k !== k || ctx.stepIndex - q.at > 2 || !okE(ctx, p)) continue;
      if (k === 'gloat' && p.cur !== 'superior') continue;
      return p;
    }
    /* 相手が弱ったのを見た（優越：失敗に満足する。一つの組で一度） */
    if (k === 'gloat') for (var j = 0; j < L0.length; j++) {
      var p2 = L0[j], b = ctx.chars[p2.t];
      if (p2.cur !== 'superior' || p2.weakSeen || !okE(ctx, p2) || ctx.others(a).indexOf(b) < 0) continue;
      var w = weak(ctx, b);
      if (w) { p2.weakSeen = true; p2.pend = { k: 'gloat', at: ctx.stepIndex, why: b.name + 'が' + w }; return p2; }
    }
    return null;
  }
  function striveE(ctx, a) {
    if (!ctx._es) return null;
    var L0 = pairsOf(ctx, a);
    for (var i = 0; i < L0.length; i++) { var p = L0[i]; if (canStrive(ctx, p) && okE(ctx, p) && ctx.others(a).indexOf(ctx.chars[p.t]) >= 0) return p; }
    return null;
  }
  function turnE(ctx, a) {
    if (!ctx._es) return null;
    var L0 = pairsOf(ctx, a);
    for (var i = 0; i < L0.length; i++) { var p = L0[i], k = okE(ctx, p) ? turnOf(ctx, p) : ''; if (k) return { p: p, k: k }; }
    return null;
  }
  function runE(ctx, a, k) {
    var p = pendE(ctx, a, k); if (!p) return null;
    var r = react(ctx, p, k); p.pend = null; p.last = ctx.stepIndex;
    if (!r) return null;
    return { with: [ctx.chars[p.t]], text: r.text, why: r.why, cat: r.cat, mag: r.mag };
  }
  function ev(id, label, k, w, tie) {
    return {
      id: id, label: label, cat: 'solo', scope: 'solo', tie: tie || 'inferior,superior', pri: true, noOdd: true,
      when: function (ctx, a) { return !!pendE(ctx, a, k); },
      w: function () { return w; },
      run: function (ctx, a) { return runE(ctx, a, k); }
    };
  }
  HK.addTo(HK.COMMON, [
    ev('tie_es_helped', '引け目や驕りで手助けを素直に受けられない', 'helped', 6),
    ev('tie_es_shine', '目立った相手に落ち込む・張り合う', 'shine', 4),
    ev('tie_es_kind', '優しくされて卑屈な・尊大な返事をする', 'kind', 3),
    ev('tie_es_outshine', '相手より活躍して安堵する・得意になる', 'out', 5),
    ev('tie_es_gloat', '見下す相手の失敗にほくそ笑む', 'gloat', 4, 'superior'),
    {
      id: 'tie_es_strive', label: '劣等感の相手を見返そうと無理をする', cat: 'solo', scope: 'solo', tie: 'inferior', pri: true, noOdd: true,
      when: function (ctx, a) { return !!striveE(ctx, a); },
      w: function (ctx, a) { var t = trOf(a); return 0.6 + (t.cp || 0) * 0.5 + (t.a || 0) * 0.3; },
      run: function (ctx, a) {
        var p = striveE(ctx, a); if (!p) return null;
        var r = strive(ctx, p); p.last = ctx.stepIndex;
        return { with: [ctx.chars[p.t]], text: r.text, why: r.why, cat: r.cat, mag: r.mag };
      }
    },
    {
      id: 'tie_es_turn', label: '劣等感・優越の気持ちが変わる', cat: 'solo', scope: 'solo', tie: 'inferior,superior', pri: true, noOdd: true,
      when: function (ctx, a) { return !!turnE(ctx, a); },
      w: function () { return 10; },
      run: function (ctx, a) {
        var x = turnE(ctx, a); if (!x) return null;
        var r = turn(ctx, x.p, x.k); x.p.last = ctx.stepIndex; x.p.pend = null;
        return { with: [ctx.chars[x.p.t]], text: r.text, why: r.why, cat: r.cat, mag: r.mag };
      }
    }
  ]);

  /* 組の表を作る（関係の初期値・凍結のあと） */
  E.setup = function (ctx) {
    var all = [];
    Object.keys(ctx.tiesAll || {}).forEach(function (k) { (ctx.tiesAll[k] || []).forEach(function (t) { all.push(t); }); });
    ctx._es = build(ctx, all, ctx.chars);
  };
  if (HK.Ties && HK.Ties.freezeInit) HK.wrap(HK.Ties, 'freezeInit', function (prev) {
    return function (ctx) { var r = prev.apply(this, arguments); if (ctx && ctx.chars) E.setup(ctx); return r; };
  });
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      var e = prev.apply(this, arguments);
      if (this._es && e && !e.skipped && o && o.kind !== 'step') {
        /* いま起きている出来事が自分の出来事なら見ない */
        if (!(this._ev && /^tie_es_/.test(this._ev.id || ''))) { try { scan(this, e); } catch (err) { if (HK.DEBUG) throw err; } }
      }
      return e;
    };
  });

  /* ================= 物語型 ================= */
  var ST = HK.Story;
  /* 記録として一つまで出す（出したら真） */
  function storyEmit(S) {
    if (!S || !S.P || !S._es || S._esBusy) return false;
    var ks = Object.keys(S._es), s = S._esStep || 0;
    S._esBusy = true;
    try {
      for (var i = 0; i < ks.length; i++) {
        var p = S._es[ks[i]], a = S.P[p.h], b = S.P[p.t];
        if (!hereS(a) || !hereS(b) || p.lastS === s || (p.st && p.st !== 'flip')) continue;
        var r = null, k = turnOf(S, p);
        if (k) r = turn(S, p, k);
        else if (p.pend && s - p.pend.at <= 3 && (p.pend.k !== 'gloat' || p.cur === 'superior')) { var pk = p.pend.k; r = react(S, p, pk); p.pend = null; }
        else if (p.cur === 'superior' && !p.weakSeen && weak(S, b)) { p.weakSeen = true; p.pend = { k: 'gloat', at: s, why: b.name + 'が' + weak(S, b) }; r = react(S, p, 'gloat'); p.pend = null; }
        else if (canStrive(S, p) && S.rng() < 0.35) r = strive(S, p);
        if (!r) continue;
        p.lastS = s;
        var o = ST.say(S, { actors: [a, b], tag: k ? JA[p.type] + 'の変化' : JA[p.cur], text: r.text, why: r.why, mag: r.mag + 4 });
        if (o && k && ST.key) ST.key(S, o, a.name + 'の' + b.name + 'への' + JA[p.type] + 'が変わった');
        return true;
      }
    } finally { S._esBusy = false; }
    return false;
  }
  E.storyEmit = storyEmit;
  if (ST && ST.state) HK.wrap(ST, 'state', function (prev) {
    return function (input) { var S = prev.apply(this, arguments); if (S && input) { S._esIn = input.ties || []; S._es = undefined; } return S; };
  });
  function ensureS(S) { if (S && S.P && S._es === undefined) S._es = build(S, S._esIn || S.ties || [], S.P); return S && S._es; }
  /* 区切りの見出しのあと：数を進め、宇宙船・RPG（HateKit.storyTick を使わない箱庭）は、ここで一つまで出す */
  var STEP_SC = { ship: 1, rpg: 1 };
  if (ST && ST.step) HK.wrap(ST, 'step', function (prev) {
    return function (S) {
      var r = prev.apply(this, arguments);
      try {
        if (ensureS(S)) { S._esStep = (S._esStep || 0) + 1; if (S.scen && STEP_SC[S.scen.id] && S.rng() < 0.75) storyEmit(S); }
      } catch (e) { if (HK.DEBUG) throw e; }
      return r;
    };
  });
  if (ST && ST.say) HK.wrap(ST, 'say', function (prev) {
    return function (S, o) {
      var e = prev.apply(this, arguments);
      if (S && !S._esBusy && e && e.kind !== 'step' && e.kind !== 'phase' && ensureS(S)) { try { scan(S, e); } catch (err) { if (HK.DEBUG) throw err; } }
      return e;
    };
  });
  /* 邪神村・吹雪の館・人狼：敵視の出来事（HateKit.storyTick）の番に、劣等感・優越の出来事を先に出す（出したら、その回の敵視の出来事は無し） */
  var H = HK.HateKit;
  if (H && H.storyTick) HK.wrap(H, 'storyTick', function (prev) {
    return function (S, live) {
      if (S && S.P && !S._esBusy && ensureS(S) && S.rng() < 0.8 && storyEmit(S)) return null;
      return prev.apply(this, arguments);
    };
  });
  /* 結末：箇条書き・住人の覚え書き・関係図の★の線 */
  var ECLS = { inf_stay: 'obsess', inf_even: 'partner', inf_love: 'pine', inf_resent: 'enemy', sup_stay: 'enemy', sup_ack: 'friend', sup_flip: 'obsess' };
  function endKey(p) {
    if (p.end) return p.end;
    if (total(p) < 2) return '';
    return p.type === 'inferior' ? 'inf_stay' : 'sup_stay';
  }
  E.endKey = endKey;
  if (ST && ST.result) HK.wrap(ST, 'result', function (prev) {
    return function (S, input, o) {
      if (S && S._es && o) {
        Object.keys(S._es).forEach(function (k) {
          var p = S._es[k], a = S.P[p.h], b = S.P[p.t], e = endKey(p);
          if (!e || !a || !b || !X.END[e]) return;
          var s = fill(X.END[e], { a: a, b: b });
          if (o.ending && Array.isArray(o.ending.lines) && o.ending.lines.indexOf(s) < 0) o.ending.lines.push(s);
          if (Array.isArray(a.notes) && a.notes.indexOf(s) < 0) a.notes.push(s);
          if (o.relmap && Array.isArray(o.relmap.edges)) o.relmap.edges.push({ a: a.i, b: b.i, label: '★' + X.EDGE[e], cls: ECLS[e] || 'friend', dir: a.i });
        });
      }
      return prev.apply(this, arguments);
    };
  });

  /* ================= 結末の関係のまとめ（エンジン型） ================= */
  var LAB = {
    es_inf_stay: { name: X.EDGE.inf_stay, cls: 'obsess', pol: 0 }, es_inf_even: { name: X.EDGE.inf_even, cls: 'partner', pol: 1 }, es_inf_love: { name: X.EDGE.inf_love, cls: 'pine', pol: 1 },
    es_inf_resent: { name: X.EDGE.inf_resent, cls: 'enemy', pol: -1 }, es_sup_stay: { name: X.EDGE.sup_stay, cls: 'enemy', pol: -1 }, es_sup_ack: { name: X.EDGE.sup_ack, cls: 'friend', pol: 1 },
    es_sup_flip: { name: X.EDGE.sup_flip, cls: 'obsess', pol: 0 }
  };
  function labels() { if (HK.LABELS) for (var k in LAB) if (!HK.LABELS[k]) HK.LABELS[k] = LAB[k]; }
  labels();
  /* 上書きしてよい分類（恋人・殺害・腐れ縁（愛憎）・執着などはそのまま） */
  var OVER = /^(rivals|dislike|awkward|strangers|friends|guard|partners|lovehate|vague)$/;
  function endE(ctx, A, B) {
    var best = null, bs = 0;
    [[A, B], [B, A]].forEach(function (q) {
      var p = E.pairOf(ctx, q[0], q[1]); if (!p) return;
      var e = endKey(p); if (!e) return;
      var sc = (p.end ? 10 : 0) + total(p);
      if (sc > bs) { bs = sc; best = { p: p, e: e, h: q[0], t: q[1] }; }
    });
    return best;
  }
  function cfEnded(ctx, A, B) { var CF = HK.ColdFear; if (!CF || !CF.pairOf) return false; var p = CF.pairOf(ctx, A, B), q = CF.pairOf(ctx, B, A); return !!((p && p.end) || (q && q.end)); }
  if (HK.TieRel && HK.TieRel.refine) HK.wrap(HK.TieRel, 'refine', function (prev) {
    return function (ctx, A, B, pf, cl) {
      var r = prev.apply(this, arguments), c = r || cl;
      if (!ctx || !ctx._es || !c || !pf || pf.kill || pf.couple || !OVER.test(c.id) || cfEnded(ctx, A, B)) return r;
      var x = endE(ctx, A, B); if (!x) return r;
      labels();
      var s = fill(X.END[x.e], { a: x.h, b: x.t }), l = ctx.flags.endNotes = ctx.flags.endNotes || [];
      if (l.indexOf(s) < 0) l.push(s);
      return { id: 'es_' + x.e, dir: x.h.i };
    };
  });
  if (HK.TieRel && HK.TieRel.pairText) HK.wrap(HK.TieRel, 'pairText', function (prev) {
    return function (ctx, A, B, cl) {
      if (ctx && ctx._es && cl && /^es_/.test(cl.id || '') && X.END[cl.id.slice(3)]) {
        var h = ctx.chars[cl.dir], t = h === A ? B : A;
        if (h && t) return fill(X.END[cl.id.slice(3)], { a: h, b: t });
      }
      return prev.apply(this, arguments);
    };
  });

  /* ================= 愛憎の「構う」に、卑屈な愛憎・傲慢な愛憎の一文（設計 2-4） ================= */
  if (HK.LoveHate && typeof HK.LoveHate.kamau === 'function') HK.wrap(HK.LoveHate, 'kamau', function (prev) {
    return function (x, a, b) {
      var r = prev.apply(this, arguments);
      if (!r || typeof r.text !== 'string' || !a || !b) return r;
      var k = ES.of(x, a, b);
      if (!k || !X.lh[k]) return r;
      r.text += fill(pickOf(x, X.lh[k]), { a: a, b: b });
      if (typeof r.why === 'string') r.why += '／' + (k === 'inferior' ? '卑屈な愛憎（' + a.name + 'は' + b.name + 'に引け目も感じている）' : '傲慢な愛憎（' + a.name + 'は' + b.name + 'を見下してもいる）');
      return r;
    };
  });
})();
