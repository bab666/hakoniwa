/* 箱庭シミュレーター: 探偵どうしの関係と、憎しみ・愛憎の共通部品（邪神村RTA・吹雪の館で使う）
   ・関係の種類：設定された人間関係（S.ties）から決める
       愛憎 … 恋愛の関係（恋人・片想い・セフレ・元恋人…）と、敵対・不仲・ライバルが同じ二人に重なっている
       憎しみ … 敵対・不仲・きょうだい（不仲）だけで、恋愛の関係がない
   ・名探偵とポンコツ探偵の顔合わせの台詞は、二人の関係（先輩後輩の向き・ライバル・恋人・親しい・初対面）で変わる
   ・成人向けの描写（愛憎の二人が揉めて、無理やり体を重ねる）は solo-feud-r18.js（R18版のみ）が HK.Feud.r18Clash を足す
   台詞は tone-lines.js（口調ごとの書き下ろし） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.TL) return;
  var LOVE = 'lover,mate,fated,almost,crush,fwb,ex', HATE = 'enemy,bad,sibbad', RIVAL = 'rival', CLOSE = 'friend,colleague,buddy,childhood,best,sibling,sibprot,sibclose,parent,pparent,mentor,master,teacher';
  function inL(t, l) { return l.split(',').indexOf(t) >= 0; }
  function ties(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function has(S, a, b, l) { return ties(S, a, b).some(function (t) { return inL(t.type, l); }); }
  /* 恋愛の関係（元恋人は、敵意と重なったときだけ愛憎の材料になる） */
  function love(S, a, b) { return ties(S, a, b).some(function (t) { return inL(t.type, LOVE) && (t.type !== 'crush' || t.a === a.i || t.b === a.i); }); }
  var F = HK.Feud = {
    ties: ties, has: has,
    lovehate: function (S, a, b) { return love(S, a, b) && has(S, a, b, HATE + ',' + RIVAL); },
    hate: function (S, a, b) { return has(S, a, b, HATE) && !love(S, a, b); },
    rival: function (S, a, b) { return has(S, a, b, RIVAL + ',' + HATE); },
    /* 名探偵 sl から見た、ポンコツ探偵（またはもう一人の名探偵）pk との顔合わせの台詞の種類 */
    duo: function (S, sl, pk) {
      var sp = ties(S, sl, pk).filter(function (t) { return t.type === 'senpai'; })[0];
      if (sp) return sp.a === sl.i ? 'DUO_SENPAI_S' : 'DUO_SENPAI_P';
      if (F.lovehate(S, sl, pk) || has(S, sl, pk, RIVAL + ',' + HATE)) return 'DUO_RIVAL';
      if (love(S, sl, pk)) return 'DUO_LOVE';
      if (has(S, sl, pk, CLOSE)) return 'DUO_CLOSE';
      return 'DUO_NONE';
    },
    /* 顔合わせの一文（名探偵が、相手を見て言う） */
    duoText: function (S, sl, pk) {
      var k = F.duo(S, sl, pk), lead = {
        DUO_SENPAI_S: sl.name + 'は、後輩の' + pk.name + 'を振り返った。',
        DUO_SENPAI_P: sl.name + 'は、先輩の' + pk.name + 'を見て、眉間を押さえた。',
        DUO_RIVAL: sl.name + 'は、' + pk.name + 'の顔を見るなり、目を細めた。',
        DUO_LOVE: sl.name + 'は、' + pk.name + 'の袖を、そっと引いた。',
        DUO_CLOSE: sl.name + 'は、' + pk.name + 'を見て、小さく笑った。',
        DUO_NONE: sl.name + 'は、初めて会う' + pk.name + 'を、横目で値踏みした。'
      }[k];
      return { k: k, text: lead + HK.TL.line(sl, k, pk) };
    },
    /* 関係の名前（理由の欄に出す） */
    label: function (S, a, b) { return ties(S, a, b).map(function (t) { return HK.TIES && HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; }).join('・') || 'なし'; },
    /* 愛憎の二人が揉めたときの描写（{text, r18}）。R18版では solo-feud-r18.js が r18Clash を足す */
    clash: function (S, a, b, pick) {
      var t = a.name + 'と' + b.name + 'の口論は、いつの間にか怒鳴り合いになっていた。' + HK.TL.line(a, 'LH_CLASH', b);
      if (F.r18Clash && F.r18On && F.r18On(S)) return { text: t + F.r18Clash(S, a, b) + HK.TL.line(a, 'LH_AFTER', b), r18: true };
      return { text: t + (pick ? pick(['{a}は{b}の腕を掴んで壁に押しつけ、噛みつくように唇を奪った。{b}が{a}の頬を張った。それでも、{a}は離さなかった。', '{a}は{b}の胸ぐらを掴み、そのまま強く抱きすくめた。{b}がもがくほど、{a}の腕には力がこもった。']) : '').replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name) + HK.TL.line(a, 'LH_AFTER', b), r18: false };
    }
  };
})();
