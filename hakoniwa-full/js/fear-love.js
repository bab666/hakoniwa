/* 箱庭シミュレーター: 恐怖の二人の恋愛（HK.FearLove。族のかたまり pack-rel。両方のビルドに同じファイル。2026-11-06 利用者の指示）
   利用者の指示：「恐怖が緩和されないと恋愛が起きないのではなく、恐怖を持っている側からのアプローチや好感度の上がりが制限されるだけ、
   描写が恐怖を踏まえたものになるだけで、恋愛イベント自体は発生させてほしい」
   ■ 決まり（docs/reports/2026-10-31/rel-consistency.md の「恐怖の二人」）
     ・恋愛は止めない（engine.js の HK.fearHold は loveOff に入れない）。和らぐ前は、恐れる側が主役の恋愛の出来事だけを止める（engine.js の HK.fearLead）。
       恐れる側の惹かれ・好意・信頼の上がりは小さく（cold-fear.js の CF.K）。恐れられる側からは普段どおり
     ・合意の夜は和らぐまで止める（HK.fearSexHold。体の相手に固定した二人だけ止めない）
     ・恋人になったら和らいだ扱い：CF.soften（恋）で止めを外し、恐怖は「恋」に変わったとする（結末の覚え書き・関係図の★「恐怖→恋」）
     ・描写：和らぐ前の恋愛の出来事に、恐怖を踏まえた一文を足す（恐れる側の身構え・せめぎ合い／恐れられる側の配慮か強引さ／告白への答え／恋人になったとき）。
       一回の遊びで一組 4 回まで、続けて出さない。台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。全年齢の文だけ
   登場人物はすべて成人として扱う */
/* @event-ok 恐怖の二人の恋愛の出来事に、恐怖を踏まえた一文を足す（新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.wrap || !HK.ColdFear) return;
  var CF = HK.ColdFear;
  function L(s) { return s.split('|'); }
  var FL = HK.FearLove = {};
  FL.MAX = 4;
  /* {a}＝恐れる側、{b}＝恐れられる側 */
  FL.T = {
    /* 恐れる側の身構えと、惹かれる気持ちのせめぎ合い */
    look: L('{a}は、{b}の視線に気づくと、反射的に肩をこわばらせた。それなのに、目をそらしたあとも、胸の鼓動はなかなか静まらなかった。|' +
      '{b}が近くにいるだけで、{a}の体は逃げ道を探してしまう。けれど最近は、その緊張の中に、別の熱が混じりはじめていた。|' +
      '怖いはずなのに、気づけば目で追っている。{a}は、自分の中のその矛盾に、まだ名前を付けられずにいた。|' +
      '{a}は小さく息をのんで、半歩だけ下がった。{a}「……ちょっと、近い｜……少し、近い｜……少し、近いです」――それでも、その場から立ち去りはしなかった。'),
    /* 恐れられる側の配慮 */
    gentle: L('{b}は、{a}がびくりとしたのを見て、それ以上は近づかなかった。距離を保ったまま、言葉だけをそっと置いた。|' +
      '{b}は、{a}を怖がらせないように、ゆっくりと話した。伸ばしかけた手は、途中で引っ込められた。|' +
      '{b}「怖かったら、言って。すぐ離れるから｜怖かったら言ってくれ。すぐに離れる｜怖かったら、言ってください。すぐに離れますから」――{b}の声は、{a}が思っていたより穏やかだった。'),
    /* 恐れられる側の強引さ */
    push: L('{b}は、{a}が後ずさるのも構わずに、間合いを詰めた。逃げる隙を与えない近さだった。|' +
      '{a}が目をそらしても、{b}は視線を外さなかった。{b}「逃げないで｜逃げなくていい｜逃げないでください」――低い声に、{a}の背筋がかすかに震えた。|' +
      '{b}は、{a}の怯えに気づいていて、それでも引かなかった。その強引さが怖いのか、それとも別の何かなのか、{a}には分からなかった。'),
    /* 告白・想いを向けられたときの、恐れる側の答え */
    conf: L('{a}は、すぐには答えられなかった。怖さと、それとは違う何かが、胸の中で押し合っていた。|' +
      '{a}の指先は震えていた。逃げたい気持ちと、この人の言葉を信じたい気持ちが、同じ強さで引っ張り合っていた。|' +
      '{a}「……まだ、ちょっと怖い。でも、嫌じゃない｜……まだ、少し怖い。だが、嫌ではない｜……まだ、少し怖いです。でも、嫌じゃありません」――{a}は、ようやくそれだけを口にした。'),
    /* 恋人になったとき（ここで和らいだ扱い） */
    couple: L('{a}は、おずおずと{b}の手を取った。あれほど怖かった手は、触れてみると、ただ温かかった。|' +
      '怖さが消えたわけではない。それでも{a}は、この人のそばにいることを、自分で選んだ。|' +
      '{b}の隣で、{a}の体のこわばりが、ゆっくりとほどけていった。怖い人だったはずの{b}は、いつの間にか、いちばん安心できる人になっていた。')
  };
  var CONF = /告白|想いを|好きだ|好きです|好きなの|付き合っ|付き合わ|気持ちを伝/;
  function idx(x) { return typeof x === 'number' ? x : x && x.i; }
  /* 記録の一人目・二人目が、和らぐ前の恐怖の組か。{ p, a（恐れる側）, b, lead（主役が恐れられる側か） } */
  function pairIn(Z, acts) {
    var m = Z && Z._cf, P = CF.isCtx(Z) ? Z.chars : Z && Z.P;
    if (!m || !P || !acts || acts.length < 2) return null;
    var i0 = idx(acts[0]), i1 = idx(acts[1]);
    var p = m[i0 + '>' + i1] || m[i1 + '>' + i0];
    if (!p || p.type !== 'fear' || !CF.fearOn(p) || p.st === 'fled' || p.freed) return null;
    var a = P[p.h], b = P[p.t];
    return a && b ? { p: p, a: a, b: b, lead: p.t === i0 } : null;
  }
  function couple(Z, a, b) {
    if (CF.isCtx(Z)) return !!Z.pair(a, b).couple;
    var k = Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i);
    /* 物語型の恋仲：互いの本命（邪神村・館など）・宇宙船の S.lovers・恋仲の表 S.rom */
    if (a.honmei === b.i && b.honmei === a.i) return true;
    if ((Z.ties || []).some(function (t) { return t && /^(lover|mate|fated|spouse)$/.test(t.type) && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); })) return true;
    if (Array.isArray(Z.lovers)) return Z.lovers.some(function (q) { return q && ((q[0] === a.i && q[1] === b.i) || (q[0] === b.i && q[1] === a.i)); });
    return !!(Z.rom && Z.rom[k]);
  }
  function stepOf(Z) { return CF.isCtx(Z) ? Z.stepIndex : (Z._cfStep || 0); }
  /* 恐怖を踏まえた一文（無ければ ''） */
  function flavor(Z, x, o, cp) {
    var p = x.p, st = stepOf(Z);
    var k = cp ? 'couple' : CONF.test(String(o.text || '') + String(o.why || '') + String(o.tag || '')) ? 'conf' : x.lead ? ((CF.trOf(x.b).aggr || 0) >= 0.6 ? 'push' : 'gentle') : 'look';
    if (!cp && ((p.flN || 0) >= FL.MAX || (p.flAt != null && st - p.flAt < 2))) return '';
    p.flN = (p.flN || 0) + 1; p.flAt = st;
    return CF.fill(CF.pickOf(Z, FL.T[k]), { a: x.a, b: x.b });
  }
  /* 恋人になった：和らいだ扱い（恐怖は恋に変わった） */
  function toLove(Z, x) {
    var add = CF.soften(Z, x.p, true);
    if (CF.isCtx(Z)) CF.fearEnd(Z, x.p, 'love'); else x.p.st = 'love';
    CF.endNote(Z, x.p, 'love');
    CF.note(Z, x.p, 'couple');
    return add ? add.replace('（ここから', '（恋人になった。ここから') : '';
  }
  FL.pairIn = pairIn;

  /* ---------- エンジン型 ---------- */
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      var x = o && o.cat === 'romance' && o.kind !== 'phase' && o.kind !== 'step' && typeof o.text === 'string' && this._cf ? pairIn(this, o.actors) : null;
      var cp = x && couple(this, x.a, x.b);
      if (x && !(HK.fearLead && HK.fearLead(this, o)) && this.romanceOk(o.actors, HK.sexEv ? HK.sexEv(this, o) : null)) {
        var t = flavor(this, x, o, cp);
        if (t) o.text = o.text + t;
        if (cp) { var w = toLove(this, x); if (w) o.why = String(o.why || '') + w; }
      }
      var e = prev.apply(this, arguments);
      /* 恋愛の出来事のほかで恋人になった（結末の前のまとめなど）ときも、和らいだ扱いにする */
      if (this._cf && o && o.actors && o.actors.length >= 2) {
        var y = pairIn(this, o.actors);
        if (y && couple(this, y.a, y.b)) { var w2 = toLove(this, y); if (w2 && e && !e.skipped) e.why = String(e.why || '') + w2; }
      }
      return e;
    };
  });

  /* ---------- 物語型 ---------- */
  var ROM = /告白|恋|想い|デート|口づけ|キス|両想い/, NOT = /失恋|恋敵|元恋人/;
  var ST = HK.Story;
  if (ST && ST.say) HK.wrap(ST, 'say', function (prev) {
    return function (S, o) {
      var x = S && S._cf && o && o.kind !== 'step' && typeof o.text === 'string' && ROM.test(String(o.tag || '')) && !NOT.test(String(o.tag || '')) && !o.lewd ? pairIn(S, o.actors) : null;
      if (x) {
        var cp = couple(S, x.a, x.b), t = flavor(S, x, o, cp);
        if (t) o.text = o.text + t;
        if (cp) { var w = toLove(S, x); if (w) o.why = String(o.why || '') + w; }
      }
      var r = prev.apply(this, arguments);
      if (S && S._cf && o && o.actors && o.actors.length >= 2) {
        var y = pairIn(S, o.actors);
        if (y && couple(S, y.a, y.b)) { var w2 = toLove(S, y); if (w2 && r) r.why = String(r.why || '') + w2; }
      }
      return r;
    };
  });
})();
