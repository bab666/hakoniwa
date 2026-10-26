/* 箱庭シミュレーター: オメガバース ― 番（つがい）の決まりと、30通りの結末
   番：αがΩのうなじを噛むと成立。αは複数のΩと番になれるが、Ωは一生に一人だけ。
   番になったΩが捨てられたり、αが別のΩを噛んだりすると、Ωは心に傷を負ったまま生きることになる */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA;
  var SX = OM.SEX;
  function sx(c) { return c.om.sex; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  var B = OM.B = {};

  B.ao = function (a, b) { return (sx(a) === 'a' && sx(b) === 'o') || (sx(a) === 'o' && sx(b) === 'a'); };
  B.alpha = function (a, b) { return sx(a) === 'a' ? a : b; };
  B.omega = function (a, b) { return sx(a) === 'o' ? a : b; };
  /* 二人が番か */
  B.bonded = function (ctx, a, b) { return !!ctx.om.bonded[key(a, b)]; };
  /* このΩの番（いなければnull） */
  B.mateOf = function (ctx, O) { var i = ctx.om.bondOf[O.i]; return i == null ? null : ctx.chars[i]; };
  /* 噛めるか：αとΩで、Ωがまだ誰とも番ったことがない */
  B.canBite = function (ctx, A, O) { return sx(A) === 'a' && sx(O) === 'o' && ctx.om.bondOf[O.i] == null && !ctx.om.everBonded[O.i]; };

  /* 番になる。αに先の番がいれば、そのΩは傷を負う。戻り値：追加の文 */
  B.bite = function (ctx, A, O, how) {
    var om = ctx.om, extra = '';
    om.bonded[key(A, O)] = true; om.bondOf[O.i] = A.i; om.everBonded[O.i] = true;
    om.mates[A.i] = (om.mates[A.i] || []).concat([O.i]);
    om.bites++; om.bondHow[key(A, O)] = how; om.bondAt[key(A, O)] = ctx.stepIndex;
    (om.mates[A.i] || []).forEach(function (pi) {
      if (pi === O.i) return;
      var P = ctx.chars[pi];
      if (om.scar[pi]) return;
      om.scar[pi] = { kind: 'second', by: A.i, other: O.i };
      ctx.stress(P, 45);
      ctx.mod(P, A, { aff: -25, ten: 30, trust: -40 });
      ctx.pending = (ctx.pending || []).concat([{ kind: 'event', cat: 'romance', actors: [P, A], text: ctx.t(ctx.pick([
        'その夜、{a}のうなじの噛み跡が焼けるように痛んだ。理由はすぐに分かった。{b}が、別のΩを噛んだのだ。――{a}は番を失ったわけではない。ただ、もう二度と、一番ではなくなった。',
        '{a}は鏡の前で、うなじの噛み跡にそっと触れた。{b}の匂いに、知らない誰かの匂いが混ざっていた。Ωは一生に一人しか番えない。{a}にはもう、{b}しかいないのに。',
        '{b}が{c}と番になったと聞いた日、{a}は笑ってお祝いを言った。家に帰ってから、噛み跡を掻きむしって血が出るまで泣いた。'
      ]), P, A, O), why: 'αは複数のΩと番になれるが、Ωの番は一生に一人', mag: 35 }]);
      extra = '';
    });
    return extra;
  };
  /* 番のまま別れる（Ωは傷を負う） */
  B.abandon = function (ctx, A, O, reason) {
    var om = ctx.om;
    if (om.scar[O.i]) return;
    om.scar[O.i] = { kind: 'abandoned', by: A.i, reason: reason };
    ctx.stress(O, 50);
  };
  B.scarText = function (ctx, O) {
    var s = ctx.om.scar[O.i];
    if (!s) return '';
    var A = ctx.chars[s.by];
    return s.kind === 'second' ? O.name + 'は、' + A.name + 'が別のΩを噛んだ痛みを抱えたまま生きている。' : O.name + 'のうなじには、もう戻らない' + A.name + 'の噛み跡が残っている。';
  };

  /* ---------- 30通りの結末 ---------- */
  var E = OM.END_DEF = {
    bond_heat: ['発情期の夜に番った', '{a}と{b}は、発情期の熱の中で番になった。うなじの噛み跡は、二人だけの約束になった。'],
    bond_fated: ['運命の番として結ばれた', '出会った瞬間に分かっていた。{a}と{b}は運命の番として、一生を共にすることになった。'],
    bond_vow: ['愛咬の誓い', '発情期でもない静かな夜、{b}は自分からうなじを差し出した。{a}と{b}は、本能ではなく意思で番になった。'],
    bond_switch: ['スイッチの先で番に', '第二性が変わったことで、閉ざされていた道が開けた。{a}と{b}は番になった。'],
    bond_buddy: ['バディから番へ', '背中を預け合ってきた探偵と助手は、ついに番になった。事務所の表札に、名前が二つ並んだ。'],
    bond_rival: ['恋敵を退けて', '取り合いの末に、{b}が選んだのは{a}だった。二人は番になった。'],
    lovers_beta: ['番にはなれないけれど', '{a}と{b}は番にはなれない。それでも二人は、毎朝同じ食卓につくことを選んだ。'],
    lovers_aa: ['α同士で寄り添う', '周りに何を言われても、{a}と{b}は手を離さなかった。α同士の恋は、二人の意地と愛情で続いている。'],
    lovers_oo: ['Ω同士で寄り添う', '発情期のたびに抑制剤を分け合い、守られるのではなく守り合う。{a}と{b}はΩ同士で生きていくと決めた。'],
    lovers_resist: ['運命より、あなたを', '運命の番が現れても、{a}は{b}の手を離さなかった。本能より、積み重ねた日々を選んだ。'],
    bond_instinct: ['本能が先に噛んだ', '発情期の熱の中で、{a}は約束も順番も待たずに{b}のうなじを噛んだ。運命の匂いの前では、理性は役に立たなかった。二人は番になった。'],
    fated_free: ['運命でも、選ばなかった', '{a}と{b}は運命の番だった。それでも二人は、匂いに手を引かれるままにはならなかった。運命の番でも、人は選べる。'],
    lovers_scar: ['傷を抱えたまま、それでも', '番に捨てられた傷は消えない。それでも{a}と{b}は、新しい関係を少しずつ育てている。'],
    lovers_nobond: ['恋人のまま', '{a}と{b}は恋人として穏やかに過ごしている。うなじを噛む日は、まだ来ていない。'],
    break_drift: ['すれ違いの末に', '{a}と{b}は別れた。どちらが悪かったわけでもない。ただ、少しずつずれていった。'],
    break_bias: ['偏見に負けて', '世間の目に耐えきれず、{a}と{b}は別れを選んだ。好きなままだった。'],
    break_switch: ['変わってしまった匂い', 'スイッチで第二性が変わってから、二人の間の何かが噛み合わなくなった。{a}と{b}は別れた。'],
    split_fated: ['運命に引き裂かれた', '{a}の前に運命の番が現れた。{b}は「行きなよ」と言うしかなかった。'],
    abandon: ['番に捨てられたΩ', '{a}は{b}を置いて去った。Ωの番は一生に一人。{b}はうなじの噛み跡が疼くたびに、もう戻らない日々を思い出す。'],
    second_mate: ['二番目の番', '{a}は別のΩとも番になった。{b}は番のまま、一番ではなくなった痛みを抱えて生きていく。'],
    reject: ['届かなかった告白', '{a}の想いは、最後まで{b}に届かなかった。{a}は少しずつ、{b}を想う時間を減らしていった。'],
    oneway_other: ['片想いのまま、あの人は別の人と', '{a}は最後まで想いを告げられなかった。{b}が他の誰かと結ばれるのを、少し離れた場所から見ていた。'],
    pining: ['両片想いのまま', '{a}も{b}も、相手の気持ちに気づかないまま月日が過ぎた。互いに、あと一歩だった。'],
    hesitate: ['ためらいの果てに', '{a}と{b}は惹かれ合っていた。でも同じ第二性であることが、最後の一歩を止めた。二人は別々の道を選んだ。'],
    fwb: ['体だけの関係', '{a}と{b}は発情期のたびに会うが、恋人ではない。名前のない関係が、今も続いている。'],
    onenight: ['なかったことにした夜', '{a}と{b}は一度だけ夜を共にした。翌朝、二人はそれをなかったことにした。'],
    friends: ['友人のまま', '{a}と{b}は、気の置けない友人に落ち着いた。それ以上にはならなかったし、それでよかった。'],
    rivals: ['犬猿の仲のまま', '{a}と{b}は最後まで反りが合わなかった。顔を合わせれば言い合いになる関係が、なぜか続いている。'],
    buddy: ['最高のバディ', '{a}と{b}は恋人にはならなかった。代わりに、誰にも代われない相棒になった。'],
    strangers: ['他人のまま', '{a}と{b}は、最後まで深く関わらなかった。すれ違うだけの他人のまま、季節が過ぎた。'],
    rival_lost: ['恋敵に敗れて', '{a}は恋敵に敗れた。{b}の隣には、もう別のαが立っている。'],
    quit_alone: ['ひとり街を出た', 'スイッチで仕事を失った{a}は、誰とも結ばれないまま、ひとりで街を出た。']
  };
  OM.END_IDS = Object.keys(E);

  function mk(ctx, id, a, b) { var d = E[id]; return { id: id, title: d[0], text: ctx.t(d[1], a, b), a: a.i, b: b ? b.i : null }; }
  /* 二人の関係から結末を一つ選ぶ（a を主語にする向きも決める） */
  B.endingFor = function (ctx, a, b) {
    var om = ctx.om, pf = ctx.pair(a, b), k = key(a, b), ab = ctx.R(a, b), ba = ctx.R(b, a);
    var fatedT = OM.isFated ? OM.isFated(ctx, a, b) : HK.Ties && HK.Ties.get(ctx, a, b) && HK.Ties.get(ctx, a, b).type === 'fated';
    var love = function (r) { return r.aff > 30 && r.att > 34; };
    if (pf.fwb && !pf.couple && !om.bonded[k]) return mk(ctx, 'fwb', a, b);
    if (om.bonded[k] && pf.couple) {
      var A = B.alpha(a, b), O = B.omega(a, b), how = om.bondHow[k];
      if (how === 'instinct') return mk(ctx, 'bond_instinct', A, O);
      if (fatedT) return mk(ctx, 'bond_fated', A, O);
      if (pf.buddy) return mk(ctx, 'bond_buddy', A, O);
      if (A.om.switched || O.om.switched) return mk(ctx, 'bond_switch', A, O);
      if (Object.keys(om.rival).some(function (rk) { return om.rival[rk] === O.i; })) return mk(ctx, 'bond_rival', A, O);
      if (om.mates[A.i] && om.mates[A.i].length > 1) return mk(ctx, 'bond_heat', A, O);
      return mk(ctx, how === 'heat' ? 'bond_heat' : 'bond_vow', A, O);
    }
    if (om.bonded[k] && !pf.couple) {
      var A2 = B.alpha(a, b), O2 = B.omega(a, b);
      if (om.scar[O2.i] && om.scar[O2.i].kind === 'second') return mk(ctx, 'second_mate', A2, O2);
      return mk(ctx, 'abandon', A2, O2);
    }
    if (pf.couple) {
      if (pf.resisted) return mk(ctx, 'lovers_resist', a, b);
      if (om.scar[a.i] || om.scar[b.i]) return mk(ctx, 'lovers_scar', om.scar[a.i] ? a : b, om.scar[a.i] ? b : a);
      var s = sx(a) + sx(b);
      if (s === 'aa') return mk(ctx, 'lovers_aa', a, b);
      if (s === 'oo') return mk(ctx, 'lovers_oo', a, b);
      if (s.indexOf('b') >= 0) return mk(ctx, 'lovers_beta', a, b);
      return mk(ctx, 'lovers_nobond', a, b);
    }
    if (om.fatedSplit[k]) { var who = pf.fatedWho != null ? ctx.chars[pf.fatedWho] : a; return mk(ctx, 'split_fated', who, who === a ? b : a); }
    if (pf.broke) return mk(ctx, pf.broke === 'bias' ? 'break_bias' : pf.broke === 'switch' ? 'break_switch' : 'break_drift', a, b);
    if ((pf.rejCount || 0) >= 2) { var rj = pf.rejBy != null ? ctx.chars[pf.rejBy] : a; return mk(ctx, 'reject', rj, rj === a ? b : a); }
    if (om.hesitate[k] >= 2) return mk(ctx, 'hesitate', a, b);
    if ((pf.nights || 0) >= 2) return mk(ctx, 'fwb', a, b);
    if ((pf.nights || 0) === 1) return mk(ctx, 'onenight', a, b);
    /* 運命の抗えなさが低い世界では、出会った運命の番が結ばれないまま終わることがある */
    if (fatedT && om.met[k] && (OM.destiny ? OM.destiny(ctx) : 0.5) < 0.35) return mk(ctx, 'fated_free', a, b);
    if (love(ab) && love(ba)) return mk(ctx, 'pining', a, b);
    if (love(ab) !== love(ba)) { var lv = love(ab) ? a : b; return mk(ctx, 'reject', lv, lv === a ? b : a); }
    if (a.om.quit || b.om.quit) return mk(ctx, 'quit_alone', a.om.quit ? a : b, a.om.quit ? b : a);
    if (pf.buddy) return mk(ctx, 'buddy', a, b);
    if ((ab.ten + ba.ten) / 2 > 35) return mk(ctx, 'rivals', a, b);
    if (ab.aff > 22 && ba.aff > 22) return mk(ctx, 'friends', a, b);
    return mk(ctx, 'strangers', a, b);
  };

  /* 区切りごとに、結末が決まったかを見る。決まれば ctx.om.ending に入る */
  B.check = function (ctx, last) {
    var om = ctx.om, P = ctx.chars, s = ctx.stepIndex;
    if (om.ending) return true;
    var two = P.length === 2, hit = null;
    for (var i = 0; i < P.length && !hit; i++) for (var j = i + 1; j < P.length && !hit; j++) {
      var a = P[i], b = P[j], pf = ctx.pair(a, b), k = key(a, b);
      /* 亡くなった人（心中など）を、恋人・番の結末の主役にしない（心中の結末は obsess-omega.js の extraHit が決める） */
      if (a.alive === false || b.alive === false) continue;
      if (om.bonded[k] && pf.couple && (pf.presetBond ? s >= 20 : s - om.bondAt[k] >= 1)) hit = [a, b];
      else if (pf.couple && !B.ao(a, b) && s - (pf.since == null ? 0 : pf.since) >= (pf.preset ? 16 : 12) && ctx.R(a, b).trust > 55 && ctx.R(b, a).trust > 55 && ctx.R(a, b).ten < 30) hit = [a, b];
      else if (pf.couple && B.ao(a, b) && s - (pf.since == null ? 0 : pf.since) >= (pf.preset ? 20 : 14) && !B.canBite(ctx, B.alpha(a, b), B.omega(a, b))) hit = [a, b];
      else if (two && (pf.broke || om.fatedSplit[k] || (om.bonded[k] && !pf.couple))) hit = [a, b];
      else if (two && ((pf.rejCount || 0) >= 2 || (om.hesitate[k] || 0) >= 4)) hit = [a, b];
      else if (two && (pf.nights || 0) >= 3 && !pf.couple && s >= 16) hit = [a, b];
      else if (two && pf.fwb && !pf.couple && (pf.nights || 0) >= 3 && s - (pf.fwbAt || 0) >= 6) hit = [a, b];
      else if (two && s >= 24 && !pf.couple && ctx.R(a, b).att < 34 && ctx.R(b, a).att < 34) hit = [a, b];
      else if (two && s >= 40 && !pf.couple) hit = [a, b];
    }
    if (!hit && B.extraHit) hit = B.extraHit(ctx, s);
    if (!hit && last) {
      var best = null, bv = -1, anyLive = P.filter(function (c) { return c.alive !== false; }).length >= 2;
      for (var x = 0; x < P.length; x++) for (var y = x + 1; y < P.length; y++) {
        if (anyLive && (P[x].alive === false || P[y].alive === false)) continue;
        var r1 = ctx.R(P[x], P[y]), r2 = ctx.R(P[y], P[x]), v = r1.att + r2.att + Math.abs(r1.aff) + Math.abs(r2.aff) + r1.ten + r2.ten + (ctx.pair(P[x], P[y]).couple ? 200 : 0);
        if (v > bv) { bv = v; best = [P[x], P[y]]; }
      }
      hit = best;
    }
    if (!hit) return false;
    om.ending = B.endingFor(ctx, hit[0], hit[1]);
    om.ending.timeout = !!last && !om.ending.natural;
    om.ending.others = [];
    if (P.length > 2) P.forEach(function (c) { if (c !== hit[0] && c !== hit[1]) om.ending.others.push({ i: c.i, text: otherFate(ctx, c, hit) }); });
    return true;
  };

  /* 複数人のとき、主役の二人以外がどうなったか */
  function otherFate(ctx, c, main) {
    var om = ctx.om;
    /* 亡くなった人（心中など）は、恋人・番の行く末を書かない。亡くなった恋人も「付き合っている」相手に数えない */
    if (c.alive === false) return c.name + 'は、もうこの世にいない。';
    var mate = B.mateOf(ctx, c);
    if (om.scar[c.i]) return B.scarText(ctx, c);
    var partner = ctx.chars.filter(function (o) { return o !== c && o.alive !== false && ctx.pair(c, o).couple; })[0];
    if (partner) return c.name + 'は' + partner.name + 'と' + (om.bonded[key(c, partner)] ? '番になっている。' : '付き合っている。');
    var fw = ctx.chars.filter(function (o) { return o !== c && o.alive !== false && ctx.pair(c, o).fwb && !ctx.pair(c, o).couple; })[0];
    if (fw) return E.fwb[0] + '：' + c.name + 'は' + fw.name + 'と、恋人ではないまま夜だけを重ねている。';
    /* 運命の番だったのに、相手は積み重ねた恋人を選んだ（抗い切った結末） */
    var fm = main.filter(function (m) { return OM.isFated && OM.isFated(ctx, c, m) && om.met[key(c, m)] && ctx.pair(main[0], main[1]).couple; })[0];
    if (fm) return E.fated_free[0] + '：' + c.name + 'は' + fm.name + 'の運命の番だった。それでも' + fm.name + 'が選んだのは、積み重ねてきた相手だった。';
    var crush = main.filter(function (m) { return ctx.R(c, m).att > 38 && ctx.R(c, m).aff > 20; })[0];
    if (crush) {
      var rk = Object.keys(om.rival).filter(function (k) { return k.split('-').indexOf(String(c.i)) >= 0; })[0];
      return rk ? E.rival_lost[0] + '：' + c.name + 'は恋敵に敗れ、' + crush.name + 'の隣を譲った。' : E.oneway_other[0] + '：' + c.name + 'は' + crush.name + 'への想いを、最後まで口にしなかった。';
    }
    var split = Object.keys(om.fatedSplit).filter(function (k) { return k.split('-').indexOf(String(c.i)) >= 0; })[0];
    if (split) return c.name + 'は、恋人を運命の番に奪われた。';
    if (c.om.quit) return c.name + 'はスイッチで' + c.om.quit + 'を辞め、新しい暮らしを探している。';
    if (mate && mate.alive !== false) return c.name + 'は' + mate.name + 'の番のまま、離れて暮らしている。';
    if (mate) return c.name + 'は、亡くなった' + mate.name + 'の番だったことを胸にしまったまま、ひとりで暮らしている。';
    return c.name + 'は誰とも結ばれず、自分の暮らしを続けている。';
  }
})();
