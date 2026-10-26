/* 箱庭シミュレーター: 無人島の結末に、人ごとの「その後」を足す（全年齢版も同じ）
   endings.js の E.island のあとに、生きている人ひとりずつ一行（エロトラップダンジョンの dungeon-end.js と同じ形）。
   ・帰り方：救助・イカダ・抜け駆け（一人で島を出た）・島に残った
   ・恋人と一緒に帰った人／島に残った人は、二人の「その後」
   ・まとめ役だった人、島で誰かを手にかけた人は専用の結び
   ・それ以外は、いちばん強い因子（CP・NP・A・FC・AC）で書き分ける
   文の選び方は名前と回の種から決める（同じ結果なら同じ文） */
(function () {
  'use strict';
  var HK = window.HK, E = HK && HK.Endings;
  if (!E || !E.island) return;
  function L(s) { return s.split('|'); }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 99991; return h; }
  /* 同じ結末の中では同じ文を二度使わない（used に使った文を覚える） */
  function pick(arr, key, used) { var h = hash(key); for (var k = 0; k < arr.length; k++) { var t = arr[(h + k) % arr.length]; if (!used[t]) { used[t] = 1; return t; } } return arr[h % arr.length]; }
  function topOf(c) { var eg = c.eg || {}, best = 'NP', bv = -1; ['CP', 'NP', 'A', 'FC', 'AC'].forEach(function (k) { if ((eg[k] || 0) > bv) { bv = eg[k] || 0; best = k; } }); return best; }
  var T = {
    home: {
      CP: L('{a}は帰国後、島での日々を誰にも愚痴らなかった。ただ、非常用の水と食料だけは、今も家に必ず置いている。|{a}は戻ってすぐ、仕事に復帰した。「休んでる暇はない｜休んでいる暇はない｜休んでいる暇はありません」――そう言いながら、ときどき窓の外の海の方角を見ていた。|{a}は島で決めた当番表の写しを、いまも手帳に挟んでいる。'),
      NP: L('{a}は帰国後も、島で一緒だった人たちに季節ごとに連絡を入れた。「元気？　ちゃんと食べてる？｜元気か。ちゃんと食べているか｜お元気ですか？　ちゃんと食べていますか？」|{a}は島で覚えた火の起こし方を、近所の子どもたちに教えるようになった。|{a}は戻ってからしばらく、温かいお風呂に入るたびに少し泣いた。'),
      A: L('{a}は島での記録をまとめ、遭難したときの手引きとして公開した。思いのほか読まれた。|{a}は帰国後、あの島の潮の流れを調べ直し、自分たちが流れ着いた理由を突き止めた。|{a}は島で何日目に何をしたかを、今でも正確に言える。'),
      FC: L('{a}は帰国の翌週には、島の話を面白おかしく語る人気者になっていた。|{a}は「また行きたい｜＝｜また行きたいです」と言って周りを呆れさせた。半分は本気だった。|{a}は島で焼いた魚の味が忘れられず、釣りを始めた。'),
      AC: L('{a}は戻ってからも、ふとした物音で目を覚ます夜が続いた。それでも、少しずつ眠れるようになった。|{a}は島で助けてくれた人に、帰国後に改めて手紙を書いた。何度も書き直した。|{a}は、島では言えなかった「ありがとう｜＝｜ありがとうございます」を、帰りの船の上でようやく口にした。')
    },
    lead: L('まとめ役だった{a}は、帰国後も皆から頼られ続けた。本人は「もう島じゃないんだから｜もう島ではないのだから｜もう島ではないんですから」と苦笑いしていた。|{a}は島で皆をまとめた経験を、二度と使いたくないと思いつつ、職場で何度も役立てることになった。|{a}は、全員の名前を書いた紙を、いまも財布に入れている。'),
    kill: L('{a}は帰国後、島で起きたことを一度も口にしなかった。夢の中でだけ、何度もあの浜に立っていた。|{a}は帰ってきた。けれど、手を洗う回数だけは、島に行く前より増えていた。|{a}は、島で自分がしたことを、誰にも許してもらおうとは思わなかった。'),
    solo: L('一人で島を出た{a}は、残してきた人たちのことを、帰ってからも考え続けた。|{a}は無事に帰り着いた。けれど、島の話を振られるたびに、黙って話題を変えた。|{a}は、自分だけ先に島を出たことを、最後まで誰にも謝れなかった。'),
    stay: L('{a}は島に残った。今では、浜に流れ着く瓶を拾っては、中の手紙を読むのが日課になっている。|{a}は島に小屋を建て直し、自分だけの暮らしを始めた。「ここのほうが、息がしやすい｜＝｜ここのほうが、息がしやすいです」|{a}は島に残り、毎朝、水平線に船影がないかを確かめる。見つけても、手は振らないかもしれない。'),
    pairHome: L('{a}と{b}は、帰国後も一緒に暮らし始めた。部屋の隅には、島で拾った貝殻が並んでいる。|{a}と{b}は、毎年、島から戻った日に二人で海を見に行く。|{a}と{b}は、島での日々を「最悪で、最高だった｜＝｜最悪で、最高でした」と口をそろえて言う。'),
    pairStay: L('{a}と{b}は、二人で島に残った。小屋は少しずつ大きくなり、浜には二人分の足跡が毎朝つく。|{a}と{b}は、迎えの船を見送った。「ここが、二人の家だから｜ここが、二人の家だ｜ここが、二人の家ですから」|{a}と{b}は島に残り、夕暮れになると、並んで火を焚いた。')
  };
  var isl0 = E.island;
  E.island = function (res, X) {
    var out = isl0.apply(this, arguments);
    if (!out || !Array.isArray(out.lines) || !X || !X.C) return out;
    var seed = String(res.seed != null ? res.seed : ''), done = {}, used = {};
    var lovers = (res.pairs || []).filter(function (p) { return p.label === 'lovers'; });
    function homeOf(c) { return c.alive && /救助|イカダ|抜け出した|助けを呼びに/.test(c.fate || ''); }
    function stayOf(c) { return c.alive && /島に残った/.test(c.fate || ''); }
    var after = [];
    lovers.forEach(function (p) {
      var a = X.C[p.a], b = X.C[p.b];
      if (!a || !b || done[a.i] || done[b.i]) return;
      var both = homeOf(a) && homeOf(b) ? 'pairHome' : stayOf(a) && stayOf(b) ? 'pairStay' : '';
      if (!both) return;
      done[a.i] = done[b.i] = true;
      after.push(a.name + 'と' + b.name + 'のその後――' + pick(T[both], a.name + b.name + seed, used).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name));
    });
    X.C.forEach(function (c) {
      if (done[c.i] || !c.alive) return;
      var pool;
      if (stayOf(c)) pool = T.stay;
      else if (!homeOf(c)) return;
      else if (/抜け出した/.test(c.fate || '')) pool = T.solo;
      else if (c.kills > 0) pool = T.kill;
      else if (c.leader) pool = T.lead;
      else pool = T.home[topOf(c)];
      after.push(c.name + 'のその後――' + pick(pool, c.name + seed, used).replace(/\{a\}/g, c.name));
    });
    after.slice(0, 8).forEach(function (l) { out.lines.push(l); });
    return out;
  };
})();
