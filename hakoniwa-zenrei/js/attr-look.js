/* 箱庭シミュレーター attr-look: 種族・体格の「見た目の一文」を、全箱庭のふだんの場面に添える（attr.js の HK.Attr.pairLine(…, 'look')）
   ・エンジン型（合コン・出られない部屋・クラスメイト・無人島・ゾンビの街・オメガバース・バトルロワイヤル・裁判デスゲーム）：
       二人の出来事（cat が bond／help／romance）のあとに、2割の確率で一文を足す
   ・物語型（宇宙船・邪神村・吹雪の館・ダンジョンRPG・人狼・一人用の箱庭）：二人の穏やかな場面（看病・晩酌・休憩・協力・打ち明け話 など）のあとに、2.5割で足す。
       夜・媚薬・事件・推理・死などの札には足さない
   ・二人とも種族も体格も決めていなければ乱数を使わずに何もしない（決めていない人の結果は、これまでと変わらない）
   ・tie-rel.js の関係の場面は、これまでどおり HK.Attr.daily が受け持つ（二重に足さない） */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A || !A.pairLine) return;
  var WHITE = /看病|治療|娯楽|共同作業|晩酌|当番|打ち明け話|想い|寄り添う|誓い|^関係$|休憩|協力|大浴場|一行|告白|酒の席|雑談|日常|食事|散歩|談笑|弔い|朝|昼|夕/;
  var BLACK = /夜|媚薬|凌辱|襲|殺|死|挿入|愛撫|キス|口で|さわる|発情|儀式|結末|後日談|継承|証言|推理|逮捕|処刑|投票|事件|隠蔽|工作|真相|喪失|恋敵|失恋|別れ|浮気|監禁|暴走|R18|夜這い|寸止め|絶頂/;
  function has(a, b) { return !!(a && b && a !== b && (A.sizeDiff(a, b) || A.raceOf(a) || A.raceOf(b))); }
  function add(o, line) { if (!line) return; o.text = o.text.replace(/\s+$/, '') + line; o.look = true; }
  /* エンジン型 */
  if (HK.Ctx && HK.Ctx.prototype.say && !HK.Ctx.prototype.say._attrLook) {
    var cs0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) {
      try {
        if (o && !o.look && !o.sex && !o.story && typeof o.text === 'string' && o.text.length >= 20 && /^(?:bond|help|romance)$/.test(o.cat || '') && (o.kind || 'event') === 'event' && o.actors && o.actors.length === 2) {
          var a = o.actors[0], b = o.actors[1], ctx = this;
          if (has(a, b) && ctx.rng() < 0.2) add(o, A.pairLine(a, b, 'look', function (l) { return ctx.pick(l); }));
        }
      } catch (e) { /* 飾りが失敗しても出来事は出す */ }
      return cs0.apply(this, arguments);
    };
    HK.Ctx.prototype.say._attrLook = true;
  }
  /* 物語型 */
  if (HK.Story && HK.Story.say && !HK.Story.say._attrLook) {
    var ss0 = HK.Story.say;
    HK.Story.say = function (S, o) {
      try {
        if (S && o && !o.look && typeof o.text === 'string' && o.text.length >= 20 && o.actors && o.actors.length === 2 && typeof o.tag === 'string' && WHITE.test(o.tag) && !BLACK.test(o.tag) && !BLACK.test(o.text.slice(0, 40))) {
          var P = S.P || [], a = typeof o.actors[0] === 'number' ? P[o.actors[0]] : o.actors[0], b = typeof o.actors[1] === 'number' ? P[o.actors[1]] : o.actors[1];
          if (has(a, b) && S.rng && S.rng() < 0.25) add(o, A.pairLine(a, b, 'look', function (l) { return l[Math.floor(S.rng() * l.length)]; }));
        }
      } catch (e) { /* 同上 */ }
      return ss0.apply(this, arguments);
    };
    HK.Story.say._attrLook = true;
  }
})();
