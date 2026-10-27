/* 箱庭シミュレーター: ゾンビの街 ― 恋人たちの夜（「描写する」）の山場を段落に分けて厚くする（R18版のみ。組み立ては omega-thick.js の HK.TKC）
   襲われる場面（ゾンビ・怪物・略奪者）は元のまま。ここで厚くするのは、合意のうえの恋人たちの夜だけ
   3割は元の短い版（solo-zombie-love.js の HIGH・HIGH_FF・HIGH_RIDE）。厚い版にも、短い版の脱がせ方・声を殺す一段を混ぜる
   2026-10-26（流れと攻めの台詞）：始まり（外の気配→脱がせる→攻めの一言）→ 触れる → 繋がる → 攻めの途中の一言（声を殺させる・生きている）→ 山場 → 結び → 攻めの事後の一言。
     攻めの台詞は、この箱庭の表（Z.TOP：始まり・事後は態度9種、途中は声を殺す夜の台詞）と、共通の表（ero-top-lines-r18.js の HK.EroTop）を混ぜる。
     攻めの台詞は、誘いの台詞（誘った人が攻めなら1本と数える）・共通の山場の台詞と合わせて、厚い版は3本・短い版は2本になるまで、
     始まり→事後→途中の順に足す（差し込み印 \u0001S\u0001 などを本文に置いてから HK.EroT3.fill で埋める）。短い版・男性向けも同じ。
     HK.EroT3（topSay・count・fill・mark）は、担当T3の場面（状況の夜・宇宙船・媚薬ロッカー・ふたり）でも使う（R18版だけ。全年齢版には無い）
   2026-10-27（分割読み込みの第3段）：このファイルは HK.EroT3（共通の部品。恋愛系のかたまり pack-rel）だけにし、ゾンビの街の恋人たちの夜（Z.LOVE.nightHigh の包み・Z.TOP）は zombie-thick-night.js（scen-zombie。このファイルのすぐ後）に分けた */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var PS9 = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  var KEY = { start: 'start', fore: 'mid', 'in': 'mid', mid: 'mid', peak: 'after', after: 'after' };
  function rngOf(S) { var r = S && S.rng ? S.rng : S; return typeof r === 'function' ? r : Math.random; }
  /* 攻めの台詞を一本：場面専用の表 tbl（{ start|mid|after: { 態度9種: [3本の台詞] } か [態度を問わない台詞] }）を opt.own の割合（省くと 0.55）、
     残りは共通の表（HK.EroTop.say。stage はそのまま渡す。opt.rel・opt.night も）。共通の表が無いときは場面の表だけ。
     opt.p：言う確率。戻り値は「名前「…」」（3本の台詞のまま。口調の辞書があとで言い換える）か '' */
  HK.EroT3 = {
    topSay: function (S, T, U, stage, tbl, opt) {
      opt = opt || {};
      if (HK.SAFE_ON || !T) return '';
      var r = rngOf(S), ET = HK.EroTop;
      if (opt.p != null && r() >= opt.p) return '';
      var k = KEY[stage] || 'mid', t = tbl && tbl[k], l = null;
      if (t) {
        if (Array.isArray(t)) l = t;
        else { var p = HK.personaOf ? HK.personaOf(T) : T.persona; l = t[PS9.indexOf(p) >= 0 ? p : 'gentle'] || t.gentle; }
      }
      if (l && l.length && (!ET || r() < (opt.own != null ? opt.own : 0.55))) {
        var base = function (a) { return a[Math.floor(r() * a.length)]; };
        return T.name + '「' + (HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(S, l, base) : base(l)) + '」';
      }
      return ET && ET.say ? ET.say(S, T, U, stage, opt) : '';
    },
    /* text の中で、who（名前）の台詞（喘ぎを除く）が何本あるか。「名前「…」」「名前は「…」」と、前の文の主語が名前の「…」、「…」と名前は… を数える */
    count: function (text, who) {
      var nm = who && who.name || who, n = 0, re = /「([^」]*)」/g, m, MO = /^[\u2060ぁあぃいぅうぇえぉおっんーゃゅょひはふくゃ…‥、。！？!?♡〜～\s゛ﾞ]*$/;
      if (!nm) return 0;
      while ((m = re.exec(text))) {
        var c = m[1], i = m.index, pre = text.slice(Math.max(0, i - 40), i), post = text.slice(i + m[0].length, i + m[0].length + 20);
        if (!c || c.charAt(0) === '\u2060' || MO.test(c)) continue;
        var tail = pre.split(/[。！？\n」]/).pop();
        var mine = pre.slice(-nm.length) === nm || new RegExp('^' + nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[はがも]').test(tail) ||
          (tail === '' && new RegExp('(?:^|[。！？\n])' + nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[はがも][^。！？\n「]*[。！？]?$').test(pre.replace(/[―—]+$/, ''))) ||
          new RegExp('^と[、]?(?:[^。「]{0,4}、)?' + nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[はが]').test(post);
        if (mine) n++;
      }
      return n;
    },
    /* 差し込み印（\u0001キー\u0001）を、order の順に、T の台詞が target 本になるまで slots[キー]() で埋める（pre：text の外で既に言った本数）。余った印は消す */
    fill: function (text, T, slots, order, target, pre) {
      var n = (pre || 0) + HK.EroT3.count(text.replace(/\u0001\w+\u0001/g, ''), T);
      (order || Object.keys(slots)).forEach(function (k) {
        var mk = '\u0001' + k + '\u0001';
        if (text.indexOf(mk) < 0) return;
        var l = n < target && slots[k] ? slots[k]() : '';
        if (l) n++;
        text = text.split(mk).join(l);
      });
      return text.replace(/\u0001\w+\u0001/g, '').replace(/\n{3,}/g, '\n\n');
    },
    mark: function (k) { return '\u0001' + k + '\u0001'; }
  };
})();
