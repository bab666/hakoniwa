/* 箱庭シミュレーター attr-look: 体の特徴・目につく特徴・体格の「見た目の一文」を、全箱庭のふだんの場面に添える（attr.js の HK.Attr.pairLine(…, 'look')）
   ・エンジン型（合コン・出られない部屋・クラスメイト・無人島・ゾンビの街・オメガバース・バトルロワイヤル・裁判デスゲーム）：
       二人の出来事（cat が bond／help／romance）のあとに、2割の確率で一文を足す
   ・物語型（宇宙船・邪神村・吹雪の館・ダンジョンRPG・人狼・一人用の箱庭）：二人の穏やかな場面（看病・晩酌・休憩・協力・打ち明け話 など）のあとに、2.5割で足す。
       夜・媚薬・事件・推理・死などの札には足さない
   ・二人とも体の特徴（種族の既定を含む）も目につく特徴も体格も決めていなければ乱数を使わずに何もしない（決めていない人の結果は、これまでと変わらない）
   ・特徴の文は ctx／S を owner に渡し、「連続させない」ルール（attr.js の HK.Attr.featPick）に従う。
     owner を渡さない呼び出し（夜の場面など）のために、記録を書くたびに HK.Attr.curOwner をその ctx／S にする
   ・tie-rel.js の関係の場面は、これまでどおり HK.Attr.daily が受け持つ（二重に足さない）
   ・気分（HK.Emo）が強い人に種族があれば、look の一文の代わりに気分の種族文（attr-race.js の HK.Attr.raceMood）を足す
   ・執着の出来事（tag／why に「執着」「監禁」「束縛」「暴走」「囲い込み」）で、執着する側に種族があれば、2割で執着の種族文（HK.Attr.raceObsess）を足す */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A || !A.pairLine) return;
  var WHITE = /看病|治療|娯楽|共同作業|晩酌|当番|打ち明け話|想い|寄り添う|誓い|^関係$|休憩|協力|大浴場|一行|告白|酒の席|雑談|日常|食事|散歩|談笑|弔い|朝|昼|夕/;
  var BLACK = /夜|媚薬|凌辱|襲|殺|死|挿入|愛撫|キス|口で|さわる|発情|儀式|結末|後日談|継承|証言|推理|逮捕|処刑|投票|事件|隠蔽|工作|真相|喪失|恋敵|失恋|別れ|浮気|監禁|暴走|R18|夜這い|寸止め|絶頂/;
  /* 二人ともその場にいるときだけ（亡くなった人・場を離れた人・閉じ込められた人の見た目や仕草を、弔い・看病などの場面に書かない） */
  function here2(a, b) { var H = HK.State && HK.State.here; return !H || (H(a) && H(b) && !((a.bound || b.bound) && !(HK.Story && HK.Story._cur && HK.Story._cur.scen && HK.Story._cur.scen.id === 'locker'))); }
  function has(a, b) { return !!(a && b && a !== b && here2(a, b) && (A.sizeDiff(a, b) || A.hasLook(a) || A.hasLook(b) || (A.heightDiff && A.heightDiff(a, b)))); }
  /* 飾りの一文の気分の札（2026-11-06 利用者の報告「不穏な出来事に『冷たい手を胸の前で合わせて、嬉しそうに笑った』が付く」）：
     HK.Attr.lineMood(文) が 'happy'（嬉しい・笑う・はしゃぐ・甘える…）／'calm'（落ち着く・静か）／'any' を返す（文の言い回しから付ける札）。
     不穏な場面（cat が conflict・betray・combat・death か、本文・理由に不安・素っ気ない・すれ違い・喧嘩・別れ・涙…、
     または出演者の気分が悲しみ・恐れ・怒りで強い）には、'happy' の飾りを付けない（合う文が無ければ付けない）。
     飾りの文は今までどおり選んでから外すので、乱数の流れと「連続させない」決まりの数え方は変わらない（変わるのは、外した一文が無くなることだけ） */
  var HAPPY_RE = /嬉し|うれし|笑っ|笑い|笑み|笑う|微笑|はしゃ|楽しげ|楽しそう|愉快|弾む|弾ま|弾んで|上機嫌|得意げ|甘え|すり寄|擦り寄|頬を緩|きらめ|明るく光|ぱっと明る|胸を張|浮かれ/;
  var CALM_RE = /落ち着|静か|穏や|凪/;
  A.lineMood = function (t) { t = String(t || ''); return HAPPY_RE.test(t) ? 'happy' : CALM_RE.test(t) ? 'calm' : 'any'; };
  /* 本文の不穏な言い回し（「すれ違いざま」「気まずくない」「言い合いながら」のような穏やかな文には当てない）と、理由の欄の不穏な出来事の名前（仲直り・笑い話・決まりで収まった出来事は除く） */
  var DARK_RE = /不安|不穏|胸騒ぎ|素っ気なかった|素っ気ない(?:返事|態度|声)|いつになく静か|黙り込ん|冷たい(?:声|態度|返事|目)|まだ少し気まず|言い合いに|言い合いの|口論|泣いて|泣き出|涙をこぼ|落ち込ん|苛立|怯え|別れ話|距離を感じ|噛み合わ/;
  var DARK_WHY = /喧嘩|ケンカ|口論|言い合い|不安|素っ気ない|嫉妬|別れ/, SOFT_WHY = /仲直り|笑い話|決まり|一緒に何とか/;
  A.darkScene = function (o) {
    if (!o) return false;
    if (/^(?:conflict|betray|combat|death)$/.test(o.cat || '')) return true;
    var why = String(o.why || '') + '\n' + String(o.tag || '');
    if (DARK_RE.test(String(o.text || '')) || (DARK_WHY.test(why) && !SOFT_WHY.test(why))) return true;
    var E = HK.Emo;
    return !!(E && E.mood && (o.actors || []).some(function (c) { var m = c && typeof c === 'object' && c.emo ? E.mood(c) : ''; return /^(?:grief|fear|anger)$/.test(m) && (c.emo[m] || 0) >= 50; }));
  };
  function add(o, line) { if (!line) return; if (A.lineMood(line) === 'happy' && A.darkScene(o)) return; o.text = o.text.replace(/\s+$/, '') + line; o.look = true; }
  /* 気分の種族文（種族と強い気分のある人だけ。いなければ乱数を使わずに ''） */
  function moodLine(a, b, pk, owner) {
    if (!A.raceMood || !A.moodKey) return '';
    var c = [a, b].filter(function (x) { return A.raceOk(x) && A.moodKey(x); });
    if (!c.length) return '';
    var x = c.length > 1 ? pk(c) : c[0];
    return A.raceMood(x, A.moodKey(x), A.raceFresh ? A.raceFresh(owner, pk) : pk);
  }
  /* 執着の出来事：執着する側（理由書きの「〇〇の執着」「〇〇による監禁」など）と相手。執着する側に種族がなければ null */
  var OBS = /執着|監禁|束縛|暴走|囲い込み/;
  function obsessOf(o, list) {
    if (!A.raceObsess || o.sex || typeof o.text !== 'string' || !list || list.length < 2 || list.length > 3) return null;
    var w = (o.tag || '') + '／' + (o.why || '');
    if (!OBS.test(w)) return null;
    var who = null;
    list.forEach(function (x) { if (!who && x && x.name && new RegExp(x.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:の執着|の嫉妬・執着|による監禁|の囲い込み|の束縛|の[^。／（]{1,12}への執着)').test(w)) who = x; });
    who = who || list[0];
    var tg = who === list[0] ? list[1] : list[0];
    if (!A.raceOk(who) || !tg || tg === who || tg.alive === false || who.alive === false) return null;
    return { c: who, o: tg };
  }
  /* HK.Attr.curOwner は一回の実行の中だけで使う（前の実行の ctx／S を持ち越さない。同じシードで同じ結果にするため） */
  if (HK.simulate && !HK.simulate._attrLook) {
    var sim0 = HK.simulate;
    HK.simulate = function () { var prev = A.curOwner; A.curOwner = null; try { return sim0.apply(this, arguments); } finally { A.curOwner = prev; } };
    HK.simulate._attrLook = true;
  }
  /* エンジン型 */
  if (HK.Ctx && HK.Ctx.prototype.say && !HK.Ctx.prototype.say._attrLook) {
    /* 包み直しは HK.wrap（2026-11-04。avoid-kit.js と同じ） */
    HK.wrap(HK.Ctx.prototype, 'say', function (cs0) {
      var f = function (o) {
        try {
          var ctx = this, pk = function (l) { return ctx.pick(l); }, ob = o && !o.look && o.actors ? obsessOf(o, o.actors) : null;
          if (ob) { if (ctx.rng() < 0.2) add(o, A.raceObsess(ob.c, ob.o, A.raceFresh(ctx, pk))); }
          else if (o && !o.look && !o.sex && !o.story && typeof o.text === 'string' && o.text.length >= 20 && /^(?:bond|help|romance)$/.test(o.cat || '') && (o.kind || 'event') === 'event' && o.actors && o.actors.length === 2) {
            var a = o.actors[0], b = o.actors[1];
            if (has(a, b) && ctx.rng() < 0.2) add(o, moodLine(a, b, pk, ctx) || A.pairLine(a, b, 'look', pk, ctx));
          }
        } catch (e) { /* 飾りが失敗しても出来事は出す */ }
        A.curOwner = this;
        return cs0.apply(this, arguments);
      };
      f._attrLook = true;
      return f;
    });
  }
  /* 物語型 */
  if (HK.Story && HK.Story.say && !HK.Story.say._attrLook) {
    var ss0 = HK.Story.say;
    HK.Story.say = function (S, o) {
      try {
        var P = (S && S.P) || [], pk = function (l) { return l[Math.floor(S.rng() * l.length)]; };
        var acts = S && o && !o.look && o.actors ? o.actors.map(function (x) { return typeof x === 'number' ? P[x] : x; }) : null;
        var ob = acts && S.rng ? obsessOf(o, acts) : null;
        if (ob) { if (S.rng() < 0.2) add(o, A.raceObsess(ob.c, ob.o, A.raceFresh(S, pk))); }
        else if (S && o && !o.look && typeof o.text === 'string' && o.text.length >= 20 && o.actors && o.actors.length === 2 && typeof o.tag === 'string' && WHITE.test(o.tag) && !BLACK.test(o.tag) && !BLACK.test(o.text.slice(0, 40))) {
          var a = acts[0], b = acts[1];
          if (has(a, b) && S.rng && S.rng() < 0.25) add(o, moodLine(a, b, pk, S) || A.pairLine(a, b, 'look', pk, S));
        }
      } catch (e) { /* 同上 */ }
      if (S && typeof S === 'object') A.curOwner = S;
      return ss0.apply(this, arguments);
    };
    HK.Story.say._attrLook = true;
  }
})();
