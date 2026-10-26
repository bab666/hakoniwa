/* 箱庭シミュレーター: 吹雪の館の殺人 ― 職業の追加と、職業ごとの捜査・技能の出来事
   ・職業を足す：経理・建築家（大工）・整備士（エンジニア）・看護師・料理人（バーテンダー）・美容師・俳優・営業
     （yakata.js の設定欄は読み込み時に Y.ROLES から作られるので、このファイルは yakata-data.js の直後に読む）
   ・職業ごとの捜査の出来事（技能をひねって使う：経理は書類の山から一枚を見つける、建築家は廊下の長さの狂いに気づく…）
   ・犯人が職業持ちのときの、犯人側の技能（整備士は停電を仕組む、料理人は毒を選びやすい、建築家は隠し通路を使う…）
   ・嘘のうまさ（J.lie）：弁護士・俳優・営業・芸能人や、正直さの低い犯人は、取り調べ・偽装の見破り・推理で見抜かれにくい。
     正直な犯人は嘘が下手で見抜かれやすい（補正は控えめ。名探偵がいれば最後には解ける強さ）
   ・出来事の数：一回の遊びで 2〜5 件ほど（J.MAX まで）。同じ出来事は一回の遊びで一度だけ
   職業×職業の出来事は yakata-jobs-pair.js（J.PAIR に足す）
   台詞は「くだけた常体｜硬い常体｜敬語」の3本（一人称は「私」、二人称は「あなた」）。地の文は1本
   {a}=その職業の人 {b}=相手 {c}=犯人 {v}=いちばん新しい被害者 {p}=いちばん新しい現場 {g}=見つかった手がかり */
(function () {
  'use strict';
  var HK = window.HK, Y = HK && HK.YAKATA;
  if (!Y || !Y.ROLES || !Y.ROLE) return;
  function L(s) { return s.split('|'); }

  /* ---------- 職業の追加（sk：観察obs 知識lore 聞き込みtalk 検視med 捜索search 腕っぷしfight 隠しごとhide 霊感spirit） ---------- */
  var ADD = [
    { id: 'accountant', label: '経理', group: 'ゲスト', sk: { lore: 0.25, obs: 0.1 }, desc: '帳簿や書類の山から、不自然な金の流れを見つける' },
    { id: 'architect', label: '建築家・大工', group: 'ゲスト', sk: { obs: 0.2, search: 0.2 }, desc: '間取りや床板の不自然さに気づく（隠し通路・二重壁も）' },
    { id: 'mechanic', label: '整備士・エンジニア', group: 'ゲスト', sk: { search: 0.15, lore: 0.15, fight: 0.1 }, desc: '発電機・鍵・時計の細工を見抜き、壊れた機械を直す' },
    { id: 'nurse', label: '看護師', group: 'ゲスト', sk: { med: 0.3, talk: 0.15 }, desc: '薬の種類と量が分かる。手当てで怯えた人の心を開く' },
    { id: 'chef', label: '料理人・バーテンダー', group: 'ゲスト', sk: { obs: 0.15, talk: 0.15 }, desc: '食事と酒の時間を覚えている。酔わせて口を軽くする' },
    { id: 'stylist', label: '美容師', group: 'ゲスト', sk: { obs: 0.3 }, desc: '髪・爪・体の癖から、人を見分ける' },
    { id: 'actor', label: '俳優', group: 'ゲスト', sk: { talk: 0.2, hide: 0.2 }, desc: '芝居で相手の反応を見る。嘘がうまい' },
    { id: 'sales', label: '営業', group: 'ゲスト', sk: { talk: 0.3 }, desc: '場を和ませて口を軽くする。断られても粘る' }
  ];
  ADD.forEach(function (r) { if (!Y.ROLE[r.id]) { Y.ROLES.push(r); Y.ROLE[r.id] = r; } });
  /* おまかせのときの、気質との相性（既存の職業と同じくらいの重み） */
  if (Y.AUTO) {
    Y.AUTO.accountant = function (t) { return t.a * 0.4 + t.caution * 0.3 + t.cp * 0.1; };
    Y.AUTO.architect = function (t) { return t.a * 0.4 + t.fc * 0.2 + t.caution * 0.1; };
    Y.AUTO.mechanic = function (t) { return t.a * 0.3 + t.impulse * 0.2 + t.cold * 0.2; };
    Y.AUTO.nurse = function (t) { return t.np * 0.5 + t.warmth * 0.2; };
    Y.AUTO.chef = function (t) { return t.np * 0.3 + t.fc * 0.3; };
    Y.AUTO.stylist = function (t) { return t.fc * 0.35 + t.warmth * 0.2 + t.a * 0.1; };
    Y.AUTO.actor = function (t) { return t.fc * 0.4 + (1 - t.honesty) * 0.2 + t.impulse * 0.1; };
    Y.AUTO.sales = function (t) { return t.warmth * 0.3 + t.fc * 0.3 + t.lead * 0.1; };
  }
  /* 動機に結びつきやすい職業（yakata-data.js の jobs）に、新しい職業を足す */
  function addJobs(id, list) {
    var m = Y.MOTIVE && Y.MOTIVE[id]; if (!m) return;
    var l = (m.jobs || '').split(',').filter(function (x) { return x; });
    list.split(',').forEach(function (j) { if (l.indexOf(j) < 0) l.push(j); });
    m.jobs = l.join(',');
  }
  addJobs('inherit', 'accountant'); addJobs('insurance', 'accountant,sales'); addJobs('blackmail', 'accountant');
  addJobs('jealous', 'actor,stylist'); addJobs('fame', 'actor'); addJobs('mercy', 'nurse'); addJobs('experiment', 'nurse');
  addJobs('accident', 'mechanic,chef,architect'); addJobs('silence', 'sales');

  var J = Y.JOBS = { SOLO: {}, CUL: {}, PAIR: [], MAX: 5, RATE: 0.5 };
  var NEWJOB = {}; ADD.forEach(function (r) { NEWJOB[r.id] = 1; });
  J.isNew = function (id) { return !!NEWJOB[id]; };

  /* ---------- 共通の部品 ---------- */
  var ST = function () { return HK.Story; };
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function F(t, m) { return ST().fmt(t, m); }
  function pk(S, a) { return ST().pick(S, a); }
  function alive(p) { return p && p.alive && !p.gone; }
  function free(p) { return alive(p) && !p.bound && !p.mad; }
  function sk(p, k) { return Y.skill ? Y.skill(p, k) : 0.4; }
  function pct(x) { return Math.round(x * 100); }
  function sus(p, d) { if (p && p.m) p.m.sus = clamp(p.m.sus + d, 0, 100); }
  function fear(p, d) { if (p && p.m) p.m.fear = clamp(p.m.fear + d, 0, 100); }
  function lastKill(S) { return S.kills[S.kills.length - 1]; }
  function fmtM(S, a, b) {
    var k = lastKill(S);
    return { a: a.name, b: b ? b.name : '', c: S.cul ? S.cul.name : '', v: k ? k.v.name : (S.v1 ? S.v1.name : ''), p: k ? k.trick.place : '広間', h: S.host ? S.host.name : '' };
  }
  /* 犯人（共犯）か：職業の出来事では、犯人と共犯は捜査をしない（犯人側の出来事は J.CUL） */
  function guilty(S, p) { return p === S.cul && !S.mot.nobody || p.isAcc; }
  function culOk(S) { return S.cul && free(S.cul) && !S.mot.nobody; }
  function ties(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  /* 助け合いにしない組：a が b に無関心／b が a を恐れている（ties.js の apathy・fear） */
  function noHelp(S, a, b) { return ties(S, a, b).some(function (t) { return (t.type === 'apathy' && t.a === a.i) || (t.type === 'fear' && t.a === b.i); }); }
  J.noHelp = noHelp; J.ties = ties; J.free = free; J.guilty = guilty;
  /* 記録（職業の出来事の印 jobEv を付ける） */
  function say(S, id, o) { o.jobEv = id; if (o.mag == null) o.mag = 22; return ST().say(S, o); }
  J.say = say;
  /* 手がかり：残っている本物を一つ見つける（種類の好み pref）。見つからなければ '' */
  function clue(S, p, pref) { return Y.gain ? Y.gain(S, p, pref) : ''; }
  J.clue = clue;
  /* 動機の手がかり（まだ見つかっていなければ） */
  function motiveLeft(S) { return S.pool.filter(function (c) { return c.motive && !c.found && !c.lost && !c.fake; })[0]; }
  function gainMotive(S, p) {
    var c = motiveLeft(S); if (!c) return '';
    c.found = true; c.by = p; p.cnt.clue++; sus(S.cul, 12);
    return c.t;
  }
  var MONEY = /^(inherit|insurance|blackmail)$/;
  /* 偽の証拠を見破る（見つかった偽物・まだ見つかっていない偽物のどちらでも） */
  function fakeLeft(S, test) { return S.pool.filter(function (c) { return c.fake && !c.lost && (!test || test(c)); })[0]; }
  function expose(S, p, c) {
    c.found = true; c.fake = false; c.exposed = true; c.by = p; c.t = c.t + '――ただし、それは偽装だった'; p.cnt.clue++;
    sus(S.cul, 15); if (c.b) sus(c.b, -15);
    return c.t;
  }
  J.expose = expose; J.fakeLeft = fakeLeft;
  /* 偽の手がかり：見つかっている本物の手がかりを、無実の人を指すものだと読み違える */
  function misread(S, b) {
    var c = S.pool.filter(function (x) { return x.found && !x.fake && !x.misread && !x.exposed; })[0];
    if (c && b) { c.misread = b; }
    sus(b, 10);
    return !!c;
  }
  J.misread = misread;
  /* 見つからない手がかりを一つ失わせる（犯人側） */
  function loseOne(S, pref) {
    var left = S.pool.filter(function (x) { return !x.found && !x.lost && !x.fake; });
    if (left.length < 2) return false;
    var c = left.filter(function (x) { return x.type === pref; })[0] || left[0];
    c.lost = true; return true;
  }
  J.loseOne = loseOne;
  /* 無実の誰か（a と犯人・共犯を除く、自由に動ける人） */
  function innocent(S, a, filt) { return S.P.filter(function (q) { return free(q) && q !== a && !guilty(S, q) && (!filt || filt(q)); }); }
  J.innocent = innocent;

  /* ---------- 嘘のうまさ（犯人 p が嘘をついたときの、見抜かれにくさ。-0.08〜+0.12） ----------
     職業（弁護士・俳優・営業・芸能人・魔術師）＋正直さが低いほど上手（高いと下手）＋ドライさ（冷静さ）・度胸 */
  var LIAR = { lawyer: 0.06, actor: 0.08, sales: 0.04, celeb: 0.03, mage: 0.02 };
  J.lie = function (S, p) {
    if (!p || !p.tr) return 0;
    var t = p.tr, n = (p.stats && p.stats.nerve) || 3;
    return clamp((LIAR[p.role] || 0) + (0.5 - t.honesty) * 0.1 + (t.cold - 0.5) * 0.04 + (n - 3) * 0.01, -0.08, 0.12);
  };
  /* 捜査の手がかりの隠し方（yakata.js の conceal に足す）：聞き込み（取り調べ）の手がかりだけ、犯人の嘘のうまさが効く */
  J.conceal = function (S, c) { return c && c.type === 'talk' && S.cul && !S.mot.nobody ? J.lie(S, S.cul) : 0; };
  /* 推理の外れやすさ（yakata.js の deduce に足す） */
  J.deduce = function (S) { return S.cul && !S.mot.nobody ? J.lie(S, S.cul) * 0.4 : 0; };
  /* 偽装の見破りにくさ（yakata.js の fakeFound に足す） */
  J.fake = function (S) { return S.cul && !S.mot.nobody ? J.lie(S, S.cul) * 0.5 : 0; };
  function lieWhy(S, p) { var l = J.lie(S, p); return '嘘のうまさ ' + (l >= 0 ? '+' : '') + pct(l) + '（' + (LIAR[p.role] ? (Y.ROLE[p.role] || {}).label + '・' : '') + '正直さ ' + pct(p.tr.honesty) + '）'; }
  J.lieWhy = lieWhy;

  /* ---------- 手口の選びやすさ（犯人の職業）：料理人・看護師は毒、建築家は隠し通路、整備士は仕掛け ---------- */
  var PASS = /隠し|抜け穴|抜け道|通路|図面|床下|天井裏|壁の中|二重/, MECH = /時計|停電|電気|発電|装置|仕掛け|タイマー|合鍵|鍵|錠|糸|モーター|配線|電源|ブレーカー|機械|ゼンマイ|歯車/, POISON = /毒/;
  J.kind = function (t) { return { pass: PASS.test(t.truth || ''), mech: MECH.test(t.truth || ''), poison: POISON.test((t.method || '') + (t.truth || '')) }; };
  J.trickW = function (S, t) {
    var c = S.cul; if (!c || S.mot.nobody) return 1;
    var k = J.kind(t);
    if ((c.role === 'chef' || c.role === 'nurse') && k.poison) return 2.5;
    if (c.role === 'architect' && k.pass) return 3;
    if (c.role === 'mechanic' && k.mech) return 2.2;
    return 1;
  };
  function trickOf(S) { var k = lastKill(S); return k ? J.kind(k.trick) : {}; }

  /* ---------- 出来事の登録 ---------- */
  /* E(職業, id, 出せるか(S,a), 動き(S,a)→true/false, 重み) */
  function E(role, id, can, run, w) { (J.SOLO[role] = J.SOLO[role] || []).push({ id: id, can: can, run: run, w: w || 1 }); }
  function hasKill(S) { return !!lastKill(S); }

  /* ===== 弁護士：交渉で話を聞き出す・契約書を読み解く・疑われた人を弁護する ===== */
  var LAW_TALK = L('{a}は、取り調べのような口ぶりではなく、{b}の隣に静かに腰を下ろして言った。「話したくないことは、話さなくていい。昨夜のことで、覚えていることだけ聞かせて｜話したくないことは話さなくていい。昨夜のことで、覚えていることだけ聞かせてくれ｜話したくないことは、話さなくて構いません。昨夜のことで、覚えていることだけ聞かせてください」|{a}は、紅茶を二つ淹れて{b}の部屋を訪ねた。「これは尋問じゃない。私は、あなたの味方でいるつもりだよ｜これは尋問ではない。私はあなたの味方のつもりだ｜これは尋問ではありません。私は、あなたの味方でいるつもりです」');
  E('lawyer', 'law_talk', function (S, a) { return hasKill(S) && innocent(S, a).length + (culOk(S) ? 1 : 0) > 0; }, function (S, a) {
    var rng = S.rng, list = S.P.filter(function (q) { return free(q) && q !== a && !q.isDet && !q.isAcc && !noHelp(S, a, q); });
    if (!list.length) return false;
    var b = rng.pick(list), m = fmtM(S, a, b), t = F(pk(S, LAW_TALK), m), isC = b === S.cul && !S.mot.nobody;
    var ch = 0.3 + sk(a, 'talk') * 0.5 - (isC ? 0.12 + J.lie(S, b) * 1.5 : 0);
    if (rng() < ch) {
      if (isC) {
        sus(b, 12); var g0 = clue(S, a, 'talk');
        return say(S, 'law_talk', { actors: [a, b], tag: '交渉', text: t + F('{b}は穏やかに答えていた。だが{a}が、契約書を読むときの目で一つだけ聞き返すと、{b}の話は、前に聞いたものと一か所だけ食い違った。', m) + (g0 ? '――' + g0 + '。' : ''), why: '弁護士の交渉（聞き込み ' + pct(sk(a, 'talk')) + '）が、' + b.name + 'の嘘を上回った（' + lieWhy(S, b) + '）……' + b.name + 'が犯人だ（疑い +12）' });
      }
      var g = clue(S, a, 'talk');
      if (!g) return false;
      if (Y.setRel) Y.setRel(S, a, b, 0.1, '打ち解けた');
      return say(S, 'law_talk', { actors: [a, b], tag: '交渉', text: t + F('{b}は少し迷ってから、ぽつりぽつりと話し始めた。', m) + '――' + g + '。', why: '弁護士の交渉（聞き込み ' + pct(sk(a, 'talk')) + '）。取り調べより穏やかに聞き出したので、' + b.name + 'との信頼は崩れなかった' });
    }
    if (isC) return say(S, 'law_talk', { actors: [a, b], tag: '交渉', text: t + F('{b}は、よどみなく答えた。どこにも、引っかかるところはなかった。――少なくとも、そう見えた。', m), why: b.name + 'の嘘のほうがうまかった（' + lieWhy(S, b) + '）。……' + b.name + 'が犯人だ' });
    return say(S, 'law_talk', { actors: [a, b], tag: '交渉', text: t + F('{b}は首を振った。「何も知らない。本当に｜何も知らない。本当だ｜何も知りません。本当です」', m), why: b.name + 'からは、何も聞き出せなかった（聞き込み ' + pct(sk(a, 'talk')) + '）' });
  });
  E('lawyer', 'law_contract', function (S, a) { return !!motiveLeft(S) && (MONEY.test(S.mot.id) || motiveLeft(S).type === 'lore'); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、書斎の引き出しに残っていた契約書と借用書の束を、一枚ずつ机に並べた。', m);
    if (S.rng() < 0.3 + sk(a, 'lore') * 0.6) {
      var g = gainMotive(S, a); if (!g) return false;
      return say(S, 'law_contract', { actors: [a], tag: '契約書', text: t + '「この借用書、日付がおかしい。署名だけ、あとから書き足してある｜この借用書は日付がおかしい。署名だけ、あとから書き足してある｜この借用書、日付がおかしいです。署名だけ、あとから書き足してあります」書類の束をたどっていくと、一つの事実に行き着いた。――' + g + '。', why: '弁護士の知識（' + pct(sk(a, 'lore')) + '）。契約書と借用書から、動機の手がかりを割り出した' });
    }
    return say(S, 'law_contract', { actors: [a], tag: '契約書', text: t + '書類はどれも、きちんと整っていた。整いすぎているほどだった。', why: '契約書からは、何も出てこなかった（知識 ' + pct(sk(a, 'lore')) + '）' });
  });
  E('lawyer', 'law_defend', function (S, a) { return innocent(S, a, function (q) { return q.m.sus >= 40 || S.framed === q; }).length > 0; }, function (S, a) {
    var b = innocent(S, a, function (q) { return q.m.sus >= 40 || S.framed === q; }).sort(function (x, y) { return y.m.sus - x.m.sus; })[0];
    var m = fmtM(S, a, b), t = F('皆の視線が{b}に集まったとき、{a}が立ち上がった。「{b}を犯人だと決めつける証拠は、まだ一つもない。推定無罪だよ｜{b}を犯人と決めつける証拠は、まだ一つもない。推定無罪だ｜{b}を犯人と決めつける証拠は、まだ一つもありません。推定無罪です」', m);
    sus(b, -15);
    var fk = fakeLeft(S, function (c) { return c.b === b; });
    if (fk && S.rng() < 0.25 + sk(a, 'lore') * 0.4 - J.fake(S)) {
      var g = expose(S, a, fk);
      return say(S, 'law_defend', { actors: [a, b], tag: '弁護', kind: 'climax', text: t + F('{a}は、{b}を指していた証拠を一つずつ検めた。「この証拠は、出来すぎている。誰かが、あとから置いたものだ｜この証拠は出来すぎている。誰かがあとから置いたものだ｜この証拠は、出来すぎています。誰かが、あとから置いたものです」', m) + '――' + g + '。', why: '弁護士が' + b.name + 'を弁護し、偽の証拠を見破った（' + b.name + 'への疑い -15・犯人への疑い +15）', mag: 30 });
    }
    return say(S, 'law_defend', { actors: [a, b], tag: '弁護', text: t + F('{b}に向いていた疑いの目が、少しだけ和らいだ。', m), why: '弁護士が' + b.name + 'を弁護した（' + b.name + 'への疑い -15）' });
  });
  J.CUL.lawyer = function (S, c) {
    var sharp = S.P.filter(function (q) { return free(q) && q !== c && !q.isAcc; }).sort(function (x, y) { return sk(y, 'obs') - sk(x, 'obs'); })[0];
    var m = fmtM(S, c, sharp), t = F('{a}は、自分に向けられた疑いを、条文を読み上げるように一つずつ退けた。「昨夜の私の居場所には、証人がいる。疑うなら、証拠を出して｜昨夜の私の居場所には証人がいる。疑うなら証拠を出せ｜昨夜の私の居場所には、証人がいます。疑うなら、証拠を出してください」', m);
    if (sharp && S.rng() < sk(sharp, 'obs') * 0.4 - J.lie(S, c)) { sus(c, 10); return say(S, 'cx_law', { actors: [c, sharp], tag: '弁論', text: t + F('――{b}だけは気づいていた。{a}の言う「証人」は、昨夜、誰よりも早く眠っていた。', m), why: c.name + 'の弁論（' + lieWhy(S, c) + '）を、' + sharp.name + 'の観察（' + pct(sk(sharp, 'obs')) + '）が見抜いた（' + c.name + 'が犯人・疑い +10）' }); }
    sus(c, -12);
    return say(S, 'cx_law', { actors: [c], tag: '弁論', text: t + '反論できる者は、いなかった。', why: '弁護士の犯人は、嘘がうまい（' + lieWhy(S, c) + '）。' + c.name + 'が犯人（疑い -12）' });
  };

  /* ===== 経理：帳簿の不自然な金の流れ・書類の山の整理・保険証書と借金 ===== */
  E('accountant', 'acc_ledger', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、書斎の棚から館の出納帳を引き抜き、一晩かけて数字を追った。', m);
    if (S.rng() < 0.3 + sk(a, 'lore') * 0.55) {
      var g = MONEY.test(S.mot.id) ? gainMotive(S, a) : '';
      if (!g) g = clue(S, a, 'lore');
      if (!g) return false;
      return say(S, 'acc_ledger', { actors: [a], tag: '帳簿', text: t + '「三年前から、毎月同じ額が、同じ日に消えている｜三年前から、毎月同じ額が同じ日に消えている｜三年前から、毎月同じ額が、同じ日に消えています」帳簿の余白の書き込みが、思わぬところへつながっていた。――' + g + '。', why: '経理の技術（知識 ' + pct(sk(a, 'lore')) + '）。帳簿の数字は、嘘をつけない' + (MONEY.test(S.mot.id) ? '（動機「' + S.mot.label + '」の手がかり）' : '') });
    }
    return say(S, 'acc_ledger', { actors: [a], tag: '帳簿', text: t + '数字は合っていた。ただ、ところどころ、ページの角が新しく折られていた。', why: '帳簿からは、決め手は出なかった（知識 ' + pct(sk(a, 'lore')) + '）' });
  });
  E('accountant', 'acc_pile', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、書斎の机に積まれた書類の山を、日付順に仕分け始めた。「書類は、並べ直すと嘘をつけなくなるの｜書類は、並べ直せば嘘をつけなくなる｜書類は、並べ直すと嘘をつけなくなります」', m);
    if (S.rng() < 0.3 + (sk(a, 'lore') + sk(a, 'obs')) * 0.25) {
      var g = clue(S, a, 'search'); if (!g) return false;
      return say(S, 'acc_pile', { actors: [a], tag: '書類の山', text: t + '山の中ほどから、一枚だけ種類の違う紙が出てきた。――' + g + '。', why: '経理は書類の整理がうまい（知識 ' + pct(sk(a, 'lore')) + '・観察 ' + pct(sk(a, 'obs')) + '）。書斎の山から、重要な一枚を見つけた' });
    }
    fear(a, 3);
    return say(S, 'acc_pile', { actors: [a], tag: '書類の山', text: t + '三百枚を仕分け終えたころには、もう日が傾いていた。目新しいものは、何もなかった。', why: '書類の山は空振りだった（時間だけが過ぎた）' });
  });
  E('accountant', 'acc_debt', function (S, a) { return hasKill(S) && (MONEY.test(S.mot.id) && !!motiveLeft(S) || innocent(S, a).length > 0); }, function (S, a) {
    var rng = S.rng, m = fmtM(S, a), t = F('{a}は、{v}の鞄から出てきた保険証書と、借金の返済表とを見比べた。', m);
    if (MONEY.test(S.mot.id) && motiveLeft(S) && rng() < 0.35 + sk(a, 'lore') * 0.5) {
      var g = gainMotive(S, a); sus(S.cul, 6);
      return say(S, 'acc_debt', { actors: [a], tag: '保険証書', text: t + '「受取人の名前が、去年の暮れに書き換えられている｜受取人の名前が、去年の暮れに書き換えられている｜受取人のお名前が、去年の暮れに書き換えられています」――' + g + '。', why: '経理の目（知識 ' + pct(sk(a, 'lore')) + '）。動機「' + S.mot.label + '」の金の流れを割り出した（犯人への疑い +18）' });
    }
    var inn = innocent(S, a); if (!inn.length) return false;
    var b = rng.pick(inn); m.b = b.name; misread(S, b);
    return say(S, 'acc_debt', { actors: [a, b], tag: '保険証書', text: t + F('返済表の保証人の欄には、{b}の名前があった。{a}は、その名前に赤い丸をつけた。', m), why: '偽の手がかり：' + b.name + 'の借金は、事件とは関係がなかった（' + b.name + 'への疑い +10。推理が' + b.name + 'の方へずれる）' });
  });
  J.CUL.accountant = function (S, c) {
    var rng = S.rng, inn = innocent(S, c, function (q) { return !q.isDet; }), b = inn.length ? rng.pick(inn) : null, m = fmtM(S, c, b);
    var t = F('{a}は「整理を手伝う」と言って書斎に入り、出納帳の一頁を、そっと別の頁と差し替えた。', m);
    if (motiveLeft(S)) { motiveLeft(S).lost = true; return say(S, 'cx_acc', { actors: [c], tag: '帳簿の差し替え', text: t + '数字の帳尻は、何事もなかったように合っていた。', why: '経理の犯人は、帳簿を書き換えられる。動機の手がかりが一つ失われた（' + c.name + 'が犯人）' }); }
    if (!b) return false;
    S.pool.push({ type: 'lore', t: F('出納帳に、{b}の名前で多額の借金の記録があった', m), fake: true, b: b, cun: sk(c, 'hide') + 0.3 });
    return say(S, 'cx_acc', { actors: [c, b], tag: '帳簿の差し替え', text: t + F('差し替えた頁には、{b}の名前が書き込まれていた。', m), why: '経理の犯人が、' + b.name + 'に罪を着せる偽の帳簿を作った（' + c.name + 'が犯人）' });
  };

  /* ===== 建築家・大工：廊下の長さ・新しい釘・二重壁 ===== */
  E('architect', 'arc_plan', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、館の廊下を歩幅で測りながら歩いた。「この廊下、外から見た長さより、二メートル短い｜この廊下は、外から見た長さより二メートル短い｜この廊下、外から見た長さより、二メートル短いです」', m), pass = trickOf(S).pass;
    if (S.rng() < 0.25 + sk(a, 'obs') * 0.4 + (pass ? 0.25 : 0)) {
      var g = clue(S, a, pass ? 'search' : 'lore'); if (!g) return false;
      return say(S, 'arc_plan', { actors: [a], tag: '間取り', text: t + '図面にない空間を調べて回るうちに、見落とされていたものが目に留まった。――' + g + '。', why: '建築家の目（観察 ' + pct(sk(a, 'obs')) + '）。館の主や執事でなくても、間取りの狂いには気づける' + (pass ? '（隠し通路を使った手口だった）' : '') });
    }
    return say(S, 'arc_plan', { actors: [a], tag: '間取り', text: t + '測り直すと、ただの煙突の分だった。', why: '間取りの狂いは、事件とは関係がなかった' });
  });
  E('architect', 'arc_nail', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、{p}の床にしゃがみ込み、床板の釘の頭を一本ずつ指でなぞった。', m);
    if (S.rng() < 0.3 + sk(a, 'search') * 0.5) {
      var g = clue(S, a, 'search'); if (!g) return false;
      return say(S, 'arc_nail', { actors: [a], tag: '床板', text: t + '「ここだけ、釘が新しい。最近、誰かが床板を外して戻している｜ここだけ釘が新しい。最近、誰かが床板を外して戻している｜ここだけ、釘が新しいです。最近、誰かが床板を外して戻しています」――' + g + '。', why: '大工の指先（捜索 ' + pct(sk(a, 'search')) + '）。釘の頭の錆び方で、いつ打たれたかが分かる' });
    }
    return say(S, 'arc_nail', { actors: [a], tag: '床板', text: t + '釘はどれも、館と同じだけ古かった。', why: '床板に手を加えた跡はなかった' });
  });
  E('architect', 'arc_wall', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、{p}の壁を拳で軽く叩いて回った。ある一か所で、音が変わった。{a}は、その壁に耳を当てた。', m), pass = trickOf(S).pass;
    if (S.rng() < 0.2 + sk(a, 'obs') * 0.35 + (pass ? 0.3 : 0)) {
      var g = clue(S, a, 'lore'); if (!g) return false;
      return say(S, 'arc_wall', { actors: [a], tag: '二重壁', kind: pass ? 'climax' : 'event', text: t + '「二重壁だ。間に、人が一人立てるくらいの隙間がある｜二重壁だ。間に人が一人立てるほどの隙間がある｜二重壁です。間に、人が一人立てるくらいの隙間があります」――' + g + '。', why: '建築家の知識（観察 ' + pct(sk(a, 'obs')) + '）' + (pass ? '。隠し通路の手口を見抜いた' : ''), mag: pass ? 28 : 22 });
    }
    return say(S, 'arc_wall', { actors: [a], tag: '二重壁', text: t + '壁の中にあったのは、古い配管だけだった。', why: '壁の中は空振りだった' });
  });
  J.CUL.architect = function (S, c) {
    var m = fmtM(S, c), t = F('その夜、{a}は、ほかの誰も知らない壁の隙間を通って、自分の部屋へ戻った。廊下の誰の目にも、{a}の姿は映らなかった。', m);
    var w = S.P.filter(function (q) { return free(q) && q !== c && !q.isAcc && (q.role === 'architect' || q.role === 'host' || q.role === 'butler'); })[0];
    if (w && S.rng() < 0.3 + sk(w, 'obs') * 0.3 - J.lie(S, c)) { sus(c, 12); m.b = w.name; return say(S, 'cx_arc', { actors: [c, w], tag: '隠し通路', text: t + F('――ただ、{b}は、壁の継ぎ目の埃が一筋だけ乱れているのに気づいた。', m), why: c.name + 'は建築家の知識で隠し通路を使った。館を知る' + w.name + 'が気づいた（' + c.name + 'が犯人・疑い +12）' }); }
    sus(c, -10);
    return say(S, 'cx_arc', { actors: [c], tag: '隠し通路', text: t, why: '建築家の犯人は、隠し通路を見つけて使える。アリバイが固くなった（' + c.name + 'が犯人・疑い -10）' });
  };

  /* ===== 整備士・エンジニア：停電・時計の細工・鍵の削りくず ===== */
  E('mechanic', 'mec_power', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、地下の発電機の前にしゃがみ込み、燃料計と配線を確かめた。', m), mech = trickOf(S).mech;
    if (S.rng() < 0.25 + sk(a, 'lore') * 0.45 + (mech ? 0.2 : 0)) {
      var g = clue(S, a, mech ? 'lore' : 'obs'); if (!g) return false;
      return say(S, 'mec_power', { actors: [a], tag: '発電機', text: t + '「昨夜の停電は、故障じゃない。誰かがブレーカーを落としている｜昨夜の停電は故障ではない。誰かがブレーカーを落としている｜昨夜の停電は、故障ではありません。誰かがブレーカーを落としています」――' + g + '。', why: '整備士の知識（' + pct(sk(a, 'lore')) + '）' + (mech ? '。仕掛けを使った手口だった' : '') });
    }
    return say(S, 'mec_power', { actors: [a], tag: '発電機', text: t + '配線は、ただ古いだけだった。', why: '発電機に細工の跡はなかった' });
  });
  E('mechanic', 'mec_clock', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、広間の柱時計の裏蓋を開け、歯車の噛み合わせを一つずつ確かめた。', m);
    var fk = fakeLeft(S, function (c) { return c.type === 'med' || /時刻|時ごろ|時間/.test(c.t); });
    if (fk && S.rng() < 0.3 + sk(a, 'lore') * 0.4 - J.fake(S)) {
      var g0 = expose(S, a, fk);
      return say(S, 'mec_clock', { actors: [a], tag: '時計の細工', kind: 'climax', text: t + '「針が、外から動かされた跡がある。この時計の時刻は、当てにならない｜針が外から動かされた跡がある。この時計の時刻は当てにならない｜針が、外から動かされた跡があります。この時計の時刻は、当てになりません」――' + g0 + '。', why: '整備士が時計の細工を見抜き、時刻の偽装が崩れた（犯人への疑い +15）', mag: 30 });
    }
    if (S.rng() < 0.2 + sk(a, 'lore') * 0.4) {
      var g = clue(S, a, 'lore'); if (!g) return false;
      return say(S, 'mec_clock', { actors: [a], tag: '時計の細工', text: t + '歯車の一つに、真新しい傷がついていた。――' + g + '。', why: '整備士の知識（' + pct(sk(a, 'lore')) + '）' });
    }
    return say(S, 'mec_clock', { actors: [a], tag: '時計の細工', text: t + '歯車は、正しく時を刻んでいた。', why: '時計に細工はなかった' });
  });
  E('mechanic', 'mec_lock', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、{p}の鍵穴に細い針金を差し込み、中の具合を確かめた。', m);
    if (S.rng() < 0.25 + sk(a, 'search') * 0.5 + (trickOf(S).mech ? 0.15 : 0)) {
      var g = clue(S, a, 'search'); if (!g) return false;
      return say(S, 'mec_lock', { actors: [a], tag: '鍵穴', text: t + '「この鍵、最近、合鍵で開けられている。中に新しい削りくずがある｜この鍵は最近、合鍵で開けられている。中に新しい削りくずがある｜この鍵、最近、合鍵で開けられています。中に新しい削りくずがあります」――' + g + '。', why: '整備士の手（捜索 ' + pct(sk(a, 'search')) + '）' });
    }
    return say(S, 'mec_lock', { actors: [a], tag: '鍵穴', text: t + '鍵は、元の鍵でしか開けられた形跡がなかった。', why: '鍵に細工はなかった' });
  });
  J.CUL.mechanic = function (S, c) {
    var m = fmtM(S, c), t = F('夕食の途中で、館じゅうの灯りが一斉に消えた。闇の中で、誰かが廊下を走る足音がした。灯りが戻ったとき、{a}は、何食わぬ顔で燭台を手にしていた。', m);
    var w = S.P.filter(function (q) { return free(q) && q !== c && !q.isAcc && (q.role === 'mechanic' || q.role === 'prof' || q.role === 'streamer'); })[0];
    var lost = loseOne(S, 'search');
    if (w && S.rng() < 0.25 + sk(w, 'lore') * 0.35 - J.lie(S, c)) { sus(c, 12); m.b = w.name; return say(S, 'cx_mec', { actors: [c, w], tag: '停電', kind: 'climax', text: t + F('{b}は、ブレーカーの把手に残った油の指の跡に気づいた。', m), why: '整備士の犯人が停電を仕組んだ' + (lost ? '（その隙に、手がかりが一つ失われた）' : '') + '。' + w.name + 'が細工の跡に気づいた（' + c.name + 'が犯人・疑い +12）', mag: 28 }); }
    if (!lost) return false;
    return say(S, 'cx_mec', { actors: [c], tag: '停電', kind: 'climax', text: t + '――暗闇のあいだに、現場から何かが消えていた。', why: '整備士の犯人が停電を仕組み、その隙に手がかりを一つ始末した（' + c.name + 'が犯人）', mag: 26 });
  };

  /* ===== 看護師：薬の種類と量・手当てで心を開く・傷の回診 ===== */
  E('nurse', 'nur_drug', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、館の薬箱の中身を、備えつけの記録と一つずつ照らし合わせた。', m), po = trickOf(S).poison;
    if (S.rng() < 0.25 + sk(a, 'med') * 0.45 + (po ? 0.2 : 0)) {
      var g = clue(S, a, 'med'); if (!g) return false;
      return say(S, 'nur_drug', { actors: [a], tag: '薬箱', text: t + '「この薬、記録より減っている。一晩に使う量じゃない｜この薬は記録より減っている。一晩に使う量ではない｜この薬、記録より減っています。一晩に使う量ではありません」――' + g + '。', why: '看護師は薬の種類と量が分かる（検視 ' + pct(sk(a, 'med')) + '）' + (po ? '。毒の手口だった' : '') });
    }
    return say(S, 'nur_drug', { actors: [a], tag: '薬箱', text: t + '薬の数は、記録どおりだった。', why: '薬箱に不審な点はなかった' });
  });
  E('nurse', 'nur_care', function (S, a) { return S.P.some(function (q) { return free(q) && q !== a && q.m.fear > 35 && !noHelp(S, a, q); }); }, function (S, a) {
    var rng = S.rng, b = S.P.filter(function (q) { return free(q) && q !== a && q.m.fear > 35 && !noHelp(S, a, q); }).sort(function (x, y) { return y.m.fear - x.m.fear; })[0];
    if (!b) return false;
    var m = fmtM(S, a, b), t = F('{a}は、震えている{b}の脈をとり、温めたタオルを肩にかけた。「大丈夫。ゆっくり息をして｜大丈夫だ。ゆっくり息をしろ｜大丈夫です。ゆっくり息をしてください」', m);
    fear(b, -15); if (Y.setRel) Y.setRel(S, a, b, 0.15, '信頼', a);
    if (b === S.cul && !S.mot.nobody) {
      if (rng() < 0.45 + sk(a, 'obs') * 0.2 - J.lie(S, b)) { sus(b, 12); return say(S, 'nur_care', { actors: [a, b], tag: '手当て', text: t + F('手当てをしながら、{a}は、{b}の指先に新しい引っかき傷があるのに気づいた。{b}は、さりげなく手を引っ込めた。', m), why: '看護師の手当て。' + b.name + 'の震えは、怯えではなかった（' + lieWhy(S, b) + '）……' + b.name + 'が犯人だ（疑い +12）' }); }
      return say(S, 'nur_care', { actors: [a, b], tag: '手当て', text: t + F('{b}は、弱々しく礼を言った。', m), why: '看護師の手当て（' + b.name + 'の恐怖 -15）。……' + b.name + 'が犯人だ。怯えた顔は、演技だった（' + lieWhy(S, b) + '）' });
    }
    var g = rng() < 0.4 + sk(a, 'talk') * 0.4 ? clue(S, a, 'talk') : '';
    return say(S, 'nur_care', { actors: [a, b], tag: '手当て', text: t + (g ? F('{b}は、少し落ち着くと、昨夜見たことを話し始めた。', m) + '――' + g + '。' : F('{b}の呼吸が、少しずつ落ち着いていった。', m)), why: '看護師の手当てで、' + b.name + 'が心を開いた（恐怖 -15・信頼）' + (g ? '' : '。話を聞くのは、まだ早かった') });
  });
  E('nurse', 'nur_round', function (S, a) { return hasKill(S) && culOk(S) && S.cul !== a; }, function (S, a) {
    var c = S.cul, m = fmtM(S, a, c), t = F('{a}は、皆の手当てを申し出て、一人ずつ擦り傷や痣を診て回った。', m);
    if (S.rng() < 0.2 + sk(a, 'med') * 0.35 - J.lie(S, c)) {
      var g = clue(S, a, 'obs'); sus(c, 8);
      return say(S, 'nur_round', { actors: [a, c], tag: '回診', text: t + F('{c}の手の甲の痣だけは、転んでできる形ではなかった。', m) + (g ? '――' + g + '。' : ''), why: '看護師の回診（検視 ' + pct(sk(a, 'med')) + '）が、' + c.name + 'の傷を見つけた（' + c.name + 'が犯人・疑い +8）' });
    }
    S.P.forEach(function (q) { if (free(q)) fear(q, -4); });
    return say(S, 'nur_round', { actors: [a], tag: '回診', text: t + '大きな怪我をしている者は、いなかった。手当てを受けた者たちの顔に、少しだけ血の気が戻った。', why: '回診で傷は見つからなかった（' + c.name + 'の隠し方が上回った）。全員の恐怖 -4' });
  });
  J.CUL.nurse = function (S, c) {
    var m = fmtM(S, c), t = F('{a}は、薬箱の記録の一行を、手慣れた字で書き換えた。誰が見ても、看護師のいつもの記録にしか見えなかった。', m);
    if (!loseOne(S, 'med')) return false;
    return say(S, 'cx_nur', { actors: [c], tag: '記録の書き換え', text: t, why: '看護師の犯人は、薬の記録を書き換えられる。手がかりが一つ失われた（' + c.name + 'が犯人）' });
  };

  /* ===== 料理人・バーテンダー：食事の時間と毒・酔わせて聞き出す・厨房の在庫 ===== */
  E('chef', 'chef_time', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、昨夜の夕食に出した皿の数と、下げた皿の数とを、指を折って数え直した。「一皿だけ、手をつけずに戻ってきた。誰が残したのかも覚えてる｜一皿だけ、手をつけずに戻ってきた。誰が残したのかも覚えている｜一皿だけ、手をつけずに戻ってきました。誰が残したのかも覚えています」', m), po = trickOf(S).poison;
    if (S.rng() < 0.25 + sk(a, 'obs') * 0.4 + (po ? 0.25 : 0)) {
      var g = clue(S, a, po ? 'med' : 'obs'); if (!g) return false;
      return say(S, 'chef_time', { actors: [a], tag: '夕食の皿', text: t + '皿の順番をたどると、食事の時間がはっきりした。――' + g + '。', why: '料理人は、誰がいつ何を口にしたかを覚えている（観察 ' + pct(sk(a, 'obs')) + '）' + (po ? '。毒の入った時間が絞れた' : '') });
    }
    return say(S, 'chef_time', { actors: [a], tag: '夕食の皿', text: t + 'だが、残したのは、ただ食欲のなかった客だった。', why: '食事の記憶は、決め手にならなかった' });
  });
  E('chef', 'chef_drink', function (S, a) { return S.P.some(function (q) { return free(q) && q !== a && !q.isAcc && !noHelp(S, a, q); }); }, function (S, a) {
    var rng = S.rng, list = S.P.filter(function (q) { return free(q) && q !== a && !q.isAcc && !noHelp(S, a, q); }), b = rng.pick(list), m = fmtM(S, a, b);
    var t = F('{a}は、館の酒蔵から一本抜いてきて、{b}のグラスに注いだ。「今夜くらいは、少し飲んだほうがいいよ｜今夜くらいは少し飲んだほうがいい｜今夜くらいは、少し飲んだほうがいいです」', m);
    if (b === S.cul && !S.mot.nobody) {
      if (rng() < 0.3 + sk(a, 'talk') * 0.3 - J.lie(S, b) - b.tr.caution * 0.15) { sus(b, 15); var g0 = clue(S, a, 'talk'); return say(S, 'chef_drink', { actors: [a, b], tag: '酒', kind: 'climax', text: t + F('酔いが回った{b}は、まだ誰にも話されていないはずの現場の様子を、ひとことだけ口にした。{a}は、グラスを拭く手を止めなかった。', m) + (g0 ? '――' + g0 + '。' : ''), why: 'バーテンダーの酒で、' + b.name + 'の口が滑った（' + lieWhy(S, b) + '・慎重さ ' + pct(b.tr.caution) + '）……' + b.name + 'が犯人だ（疑い +15）', mag: 28 }); }
      return say(S, 'chef_drink', { actors: [a, b], tag: '酒', text: t + F('{b}は、グラスに口をつけるふりをして、一滴も飲まなかった。', m), why: b.name + 'は酔わなかった（慎重さ ' + pct(b.tr.caution) + '）。……' + b.name + 'が犯人だ' });
    }
    if (rng() < 0.35 + sk(a, 'talk') * 0.4) {
      var g = clue(S, a, 'talk'); if (!g) return false;
      return say(S, 'chef_drink', { actors: [a, b], tag: '酒', text: t + F('二杯目のあたりから、{b}の口は軽くなった。', m) + '――' + g + '。', why: '酔わせて聞き出した（聞き込み ' + pct(sk(a, 'talk')) + '）' });
    }
    var o = innocent(S, a, function (q) { return q !== b; }), x = o.length ? rng.pick(o) : null;
    if (x) { m.x = x.name; sus(x, 6); }
    return say(S, 'chef_drink', { actors: x ? [a, b, x] : [a, b], tag: '酒', text: t + F('{b}は酔って、昨夜の話を三通りに話した。どれが本当なのか、本人にも分からないようだった。', m) + (x ? F('その話の中に、なぜか{x}の名前が何度も出てきた。', m) : ''), why: '酔いすぎて、話があてにならなかった' + (x ? '（偽の手がかり：' + x.name + 'への疑い +6）' : '') });
  });
  E('chef', 'chef_pantry', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、厨房の在庫を確かめていて、手を止めた。', m);
    if (S.rng() < 0.3 + sk(a, 'obs') * 0.45) {
      var g = clue(S, a, 'search'); if (!g) return false;
      return say(S, 'chef_pantry', { actors: [a], tag: '厨房', text: t + '「包丁が一本、足りない。それに、塩の袋が開いている｜包丁が一本足りない。それに、塩の袋が開いている｜包丁が一本、足りません。それに、塩の袋が開いています」――' + g + '。', why: '料理人は厨房のどこに何があるかを覚えている（観察 ' + pct(sk(a, 'obs')) + '）' });
    }
    return say(S, 'chef_pantry', { actors: [a], tag: '厨房', text: t + '足りないのは、誰かがつまみ食いしたチーズだけだった。', why: '厨房に不審な点はなかった' });
  });
  J.CUL.chef = function (S, c) {
    var m = fmtM(S, c), t = F('{a}は、夕食の皿を下げるついでに、{p}から持ち出したものを、生ごみの桶の底に沈めた。', m);
    if (!loseOne(S, 'search')) return false;
    return say(S, 'cx_chef', { actors: [c], tag: '厨房', text: t + '翌朝、桶の中身は、雪の下の穴に捨てられた。', why: '料理人の犯人は、厨房を自由に使える。手がかりが一つ失われた（' + c.name + 'が犯人）' });
  };

  /* ===== 美容師：被害者の爪に残った髪・髪の結び方の癖 ===== */
  E('stylist', 'sty_hair', function (S, a) { var k = lastKill(S); return !!k && k.v.i != null; }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、{v}の亡骸の指先を、じっと見つめた。', m);
    if (S.rng() < 0.25 + sk(a, 'obs') * 0.5) {
      var g = clue(S, a, 'obs'); if (!g) return false; sus(S.cul, 6);
      return say(S, 'sty_hair', { actors: [a], tag: '爪の髪', text: t + '「爪の間に、別の人の髪が挟まっている。色も、癖も違う｜爪の間に、別の人間の髪が挟まっている。色も癖も違う｜爪の間に、別の方の髪が挟まっています。色も、癖も違います」――' + g + '。', why: '美容師は、髪一本で人を見分ける（観察 ' + pct(sk(a, 'obs')) + '・犯人への疑い +18）' });
    }
    return say(S, 'sty_hair', { actors: [a], tag: '爪の髪', text: t + F('爪に残っていたのは、{v}自身の髪だった。', m), why: '髪は手がかりにならなかった' });
  });
  E('stylist', 'sty_habit', function (S, a) { return hasKill(S) && innocent(S, a).length > 0; }, function (S, a) {
    var rng = S.rng, m = fmtM(S, a), t = F('{a}は、皆の髪の分け目と、袖口のすり切れ方とを、さりげなく見て回った。「利き手は、髪の結び方に出るんだよ｜利き手は、髪の結び方に出る｜利き手は、髪の結び方に出ます」', m);
    if (rng() < 0.25 + sk(a, 'obs') * 0.45) {
      var g = clue(S, a, 'obs'); if (!g) return false;
      return say(S, 'sty_habit', { actors: [a], tag: '癖', text: t + '――' + g + '。', why: '美容師の目（観察 ' + pct(sk(a, 'obs')) + '）。体の癖から人を絞り込んだ' });
    }
    var b = rng.pick(innocent(S, a)); m.b = b.name; misread(S, b);
    return say(S, 'sty_habit', { actors: [a, b], tag: '癖', text: t + F('{a}の目は、左利きの{b}に止まった。', m), why: '偽の手がかり：' + b.name + 'が左利きなのは、事件とは関係がなかった（' + b.name + 'への疑い +10）' });
  });
  J.CUL.stylist = function (S, c) {
    var rng = S.rng, inn = innocent(S, c, function (q) { return !q.isDet; }); if (!inn.length) return false;
    var b = rng.pick(inn), m = fmtM(S, c, b);
    S.fakeB = S.fakeB && alive(S.fakeB) ? S.fakeB : b;
    S.pool.push({ type: 'obs', t: F('{p}の絨毯に、{b}の髪が一本落ちていた', m), fake: true, b: b, cun: sk(c, 'hide') + c.tr.a * 0.3 + 0.2 });
    return say(S, 'cx_sty', { actors: [c, b], tag: '偽の髪', text: F('{a}は、洗面所のブラシに残った{b}の髪を一本つまみ上げ、{p}の絨毯にそっと落とした。', m), why: '美容師の犯人は、髪で罪を着せられる。' + b.name + 'を指す偽の証拠（' + c.name + 'が犯人）' });
  };

  /* ===== 俳優：芝居で犯人の反応を見る・犯人の動きを演じてみせる ===== */
  E('actor', 'act_bait', function (S, a) { return hasKill(S) && culOk(S) && S.cul !== a; }, function (S, a) {
    var c = S.cul, m = fmtM(S, a, c), t = F('{a}は、夕食の席で、わざと青ざめた顔をして言った。「さっき、廊下で{v}を見た。……まだ、この館のどこかにいる｜さっき廊下で{v}を見た。……まだ、この館のどこかにいる｜さっき、廊下で{v}を見ました。……まだ、この館のどこかにいます」', m);
    if (S.rng() < 0.3 + sk(a, 'talk') * 0.35 - J.lie(S, c) * 1.5) {
      sus(c, 15); var g = clue(S, a, 'obs');
      return say(S, 'act_bait', { actors: [a, c], tag: '芝居', kind: 'climax', text: t + F('一同がざわめく中、{c}だけが、一瞬、窓の方を振り返った。{a}は、それを見逃さなかった。', m) + (g ? '――' + g + '。' : ''), why: '俳優の芝居（聞き込み ' + pct(sk(a, 'talk')) + '）に、' + c.name + 'が反応した（' + lieWhy(S, c) + '）……' + c.name + 'が犯人だ（疑い +15）', mag: 28 });
    }
    S.P.forEach(function (q) { if (free(q)) fear(q, 5); });
    return say(S, 'act_bait', { actors: [a], tag: '芝居', text: t + '一同は、ただ怯えただけだった。顔色を変えた者は、一人もいなかった。', why: '芝居は空振りだった。犯人のほうが上手だった（' + lieWhy(S, c) + '）。全員の恐怖 +5' });
  });
  E('actor', 'act_role', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、{p}で、昨夜の犯人の動きを一つずつ演じてみせた。扉を開け、足音を殺し、振り返る。', m);
    if (S.rng() < 0.25 + (sk(a, 'talk') + sk(a, 'obs')) * 0.25) {
      var g = clue(S, a, 'obs'); if (!g) return false; sus(a, 6);
      return say(S, 'act_role', { actors: [a], tag: '再現', text: t + F('{a}は、窓の前で足を止めた。「扉から窓までは、七歩。この時間じゃ、どうしても足りない｜扉から窓までは七歩。この時間では、どうしても足りない｜扉から窓までは、七歩です。この時間では、どうしても足りません」――', m) + g + '。' + F('演技があまりに真に迫っていたので、何人かは{a}から目を逸らした。', m), why: '俳優が犯人を演じて、筋書きの矛盾を引き出した（' + a.name + '自身への疑いも +6）' });
    }
    return say(S, 'act_role', { actors: [a], tag: '再現', text: t + F('途中で{a}は、台本の書き損じに気づいた役者のように首を振った。', m), why: '再現は、どこにも矛盾を見つけられなかった' });
  });
  J.CUL.actor = function (S, c) {
    var sharp = S.P.filter(function (q) { return free(q) && q !== c && !q.isAcc; }).sort(function (x, y) { return sk(y, 'obs') - sk(x, 'obs'); })[0], m = fmtM(S, c, sharp);
    var t = F('{a}は、{v}の名前を呼んで泣き崩れた。本物の涙だった。――少なくとも、誰の目にもそう見えた。', m);
    if (sharp && S.rng() < sk(sharp, 'obs') * 0.35 - J.lie(S, c)) { sus(c, 10); return say(S, 'cx_act', { actors: [c, sharp], tag: '涙', text: t + F('{b}だけは、涙が落ちる直前に、{a}が壁の時計を盗み見たのに気づいていた。', m), why: c.name + 'の演技（' + lieWhy(S, c) + '）を、' + sharp.name + 'の観察（' + pct(sk(sharp, 'obs')) + '）が見抜いた（' + c.name + 'が犯人・疑い +10）' }); }
    sus(c, -12);
    return say(S, 'cx_act', { actors: [c], tag: '涙', text: t, why: '俳優の犯人は、嘘がうまい（' + lieWhy(S, c) + '）。疑いがそれた（' + c.name + 'が犯人・疑い -12）' });
  };

  /* ===== 営業：場を和ませる・粘る・名刺一枚で館の人に会う ===== */
  E('sales', 'sal_ice', function (S, a) { return hasKill(S) && S.P.filter(free).length >= 3; }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、重苦しい食堂で、名刺を一枚ずつ配って回った。「こういうときこそ、自己紹介からやり直そう｜＝｜こういうときこそ、自己紹介からやり直しましょう」凍りついていた空気が、少しずつほどけた。', m);
    S.P.forEach(function (q) { if (free(q)) fear(q, -5); });
    var g = S.rng() < 0.25 + sk(a, 'talk') * 0.4 ? clue(S, a, 'talk') : '';
    return say(S, 'sal_ice', { actors: [a], tag: '場を和ませる', text: t + (g ? '雑談の中で、誰かが、昨夜のことをぽろりとこぼした。――' + g + '。' : ''), why: '営業の話術で、口が軽くなった（全員の恐怖 -5' + (g ? '・聞き込み ' + pct(sk(a, 'talk')) : '') + '）' });
  });
  E('sales', 'sal_persist', function (S, a) { return S.P.some(function (q) { return free(q) && q !== a && !q.isDet && !q.isAcc && !noHelp(S, a, q); }); }, function (S, a) {
    var rng = S.rng, list = S.P.filter(function (q) { return free(q) && q !== a && !q.isDet && !q.isAcc && !noHelp(S, a, q); }), b = rng.pick(list), m = fmtM(S, a, b), isC = b === S.cul && !S.mot.nobody;
    var t = F('{a}は、三度断られても、{b}の部屋の前から動かなかった。「五分でいい。五分だけ、話を聞かせて｜五分でいい。五分だけ話を聞かせてくれ｜五分で構いません。五分だけ、お話を聞かせてください」', m);
    if (rng() < 0.3 + sk(a, 'talk') * 0.45 - (isC ? J.lie(S, b) : 0)) {
      if (isC) { sus(b, 10); return say(S, 'sal_persist', { actors: [a, b], tag: '粘り', text: t + F('根負けした{b}は扉を開けた。だが、話せば話すほど、{b}の言葉は滑らかすぎた。', m), why: '営業の粘り（聞き込み ' + pct(sk(a, 'talk')) + '）。' + b.name + 'の受け答えは、用意してきたもののようだった（' + lieWhy(S, b) + '）……' + b.name + 'が犯人だ（疑い +10）' }); }
      var g = clue(S, a, 'talk'); if (!g) return false;
      if (Y.setRel) Y.setRel(S, a, b, 0.05, '打ち解けた');
      return say(S, 'sal_persist', { actors: [a, b], tag: '粘り', text: t + F('根負けした{b}が、とうとう扉を開けた。', m) + '――' + g + '。', why: '営業は、断られても粘る（聞き込み ' + pct(sk(a, 'talk')) + '）' });
    }
    if (Y.setRel) Y.setRel(S, a, b, -0.05, '険悪');
    return say(S, 'sal_persist', { actors: [a, b], tag: '粘り', text: t + F('{b}は、とうとう扉を開けなかった。', m), why: '粘りは通じなかった（' + b.name + 'との仲が少しこじれた）' });
  });
  E('sales', 'sal_card', function (S, a) { return S.P.some(function (q) { return free(q) && q !== a && (q.role === 'host' || q.role === 'butler' || q.role === 'heir') && !guilty(S, q); }); }, function (S, a) {
    var b = S.P.filter(function (q) { return free(q) && q !== a && (q.role === 'host' || q.role === 'butler' || q.role === 'heir') && !guilty(S, q); })[0], m = fmtM(S, a, b);
    var t = F('{a}は、{b}に名刺を差し出した。「この館の昔の話、少しだけ聞かせてもらえないかな｜この館の昔の話を、少し聞かせてもらえないか｜この館の昔の話を、少しだけ伺えませんか」', m);
    if (S.rng() < 0.3 + sk(a, 'talk') * 0.45) {
      var g = clue(S, a, 'lore'); if (!g) return false;
      return say(S, 'sal_card', { actors: [a, b], tag: '名刺', text: t + F('{b}は名刺を眺めて少し笑い、館の古い話をいくつか聞かせた。', m) + '――' + g + '。', why: '営業は、名刺一枚で館の人の懐に入る（聞き込み ' + pct(sk(a, 'talk')) + '）' });
    }
    return say(S, 'sal_card', { actors: [a, b], tag: '名刺', text: t + F('{b}は名刺を受け取ったが、それきり何も話さなかった。', m), why: '館の人の口は堅かった' });
  });
  J.CUL.sales = function (S, c) {
    var rng = S.rng, inn = innocent(S, c, function (q) { return !q.isDet; }); if (!inn.length) return false;
    var b = HK.weighted(rng, inn, function (q) { return 1 + q.m.sus / 25; }), m = fmtM(S, c, b);
    sus(b, 12); S.framed = b; S.fake = (S.fake || 0) + 1;
    return say(S, 'cx_sal', { actors: [c, b], tag: '話術', text: F('{a}は、人当たりのいい笑顔で、皆の話に相づちを打って回った。いつの間にか、話題は{b}の昨夜の行動のことになっていた。', m), why: '営業の犯人は、話術で疑いを人に向けられる（' + b.name + 'への疑い +12。' + c.name + 'が犯人）' });
  };

  /* ===== 既存の職業にも：記者の取材・執事の鍵束 ===== */
  E('reporter', 'rep_dig', function (S, a) { return hasKill(S) && !a.approached; }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、手帳を片手に、一人ずつ「取材」して回った。「記事にはしない。今はね｜記事にはしない。今はな｜記事にはしません。今は、ですが」', m);
    if (S.rng() < 0.3 + sk(a, 'talk') * 0.45) {
      var g = clue(S, a, 'talk'); if (!g) return false; a.approached = true;
      return say(S, 'rep_dig', { actors: [a], tag: '取材', text: t + '――' + g + '。' + F('{a}は、手帳を閉じて満足げに笑った。その姿を、誰かが廊下の陰から見ていた。', m), why: '記者は人の秘密を嗅ぎ回る（聞き込み ' + pct(sk(a, 'talk')) + '）。犯人に目をつけられた' });
    }
    return say(S, 'rep_dig', { actors: [a], tag: '取材', text: t + '誰も、記者に話したがらなかった。', why: '取材は空振りだった' });
  });
  E('butler', 'but_keys', function (S, a) { return hasKill(S); }, function (S, a) {
    var m = fmtM(S, a), t = F('{a}は、鍵束の鍵を一本ずつ数えた。「一本、足りない。……昨夜まで、確かにあった｜一本足りない。……昨夜までは、確かにあった｜一本、足りません。……昨夜までは、確かにありました」', m);
    if (S.rng() < 0.3 + sk(a, 'search') * 0.45) {
      var g = clue(S, a, 'search'); if (!g) return false;
      return say(S, 'but_keys', { actors: [a], tag: '鍵束', text: t + '――' + g + '。', why: '執事は、館の鍵を一本残らず把握している（捜索 ' + pct(sk(a, 'search')) + '）' });
    }
    return say(S, 'but_keys', { actors: [a], tag: '鍵束', text: t + '足りない一本は、夕方には洗濯室の籠の中から見つかった。', why: '鍵は、ただの置き忘れだった' });
  });

  /* ---------- 昼・夕方ごとの出来事（yakata.js の捜査の区切りから呼ぶ） ---------- */
  function jst(S) { return S.jobs || (S.jobs = { n: 0, used: {}, cul: false }); }
  J.tick = function (S, day, k) {
    var j = jst(S), rng = S.rng;
    if (S.over || j.n >= J.MAX) return;
    /* 犯人側の技能（一度だけ。殺人のあと） */
    var c = S.cul;
    if (!j.cul && culOk(S) && J.CUL[c.role] && S.kills.length && rng() < 0.3) {
      j.cul = true;
      if (J.CUL[c.role](S, c)) { j.n++; return; }
    }
    if (rng() > J.RATE) return;
    var opts = [];
    S.P.forEach(function (p) {
      if (!free(p) || guilty(S, p)) return;
      (J.SOLO[p.role] || []).forEach(function (e) { if (!j.used[e.id] && e.can(S, p)) opts.push({ w: e.w, id: e.id, go: function () { return e.run(S, p); } }); });
    });
    if (J.pairOpts) J.pairOpts(S, j).forEach(function (o) { opts.push(o); });
    if (!opts.length) return;
    var o = HK.weighted(rng, opts, function (x) { return x.w; });
    j.used[o.id] = 1;
    if (o.go()) j.n++;
  };
})();
