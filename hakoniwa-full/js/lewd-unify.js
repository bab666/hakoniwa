/* 箱庭シミュレーター: R18の描写の設定を、どの箱庭でも同じ三つにそろえる
   ・描写の有無（lewd）：ほのめかす（low）／ほどほど（mid）／濃い（high）。全年齢版・全年齢モードでは「ほのめかす」だけ
   ・描写の長さ（lewdLen）：段落分けして厚く（thick）／厚いのと短いのを混ぜる（mix）／数行で短く（short）。全年齢にはない
   ・描写の作風（style）：小説調（novel）／男性向け（ero）。全年齢にはない
   ■ 箱庭ごとに HK.Lewd.install(id, { len, style, def, old, from }) で設定を差し替える
     old：消す古い設定の id。from：古い設定の値を新しい設定に読み替える（保存してあった入力のため）
   ■ 本文では HK.Lewd.lv(env) / HK.Lewd.short(env, rng) / HK.Lewd.ero(env) で読む */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var LV = [{ v: 'low', label: 'ほのめかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃い' }];
  var LEN = [{ v: 'thick', label: '段落分けして厚く' }, { v: 'mix', label: '厚いのと短いのを混ぜる' }, { v: 'short', label: '数行で短く' }];
  var STY = [{ v: 'novel', label: '小説調' }, { v: 'ero', label: '男性向け' }];
  var CONF = {};
  function safe() { return !!HK.SAFE_ON; }
  var X = HK.Lewd = {
    CONF: CONF,
    /* 箱庭の設定を差し替える（R18版でも全年齢版でも呼ぶ。全年齢では「ほのめかす」だけを出す） */
    install: function (id, o) {
      o = o || {};
      CONF[id] = o;
      var sc = HK.SCENARIOS && HK.SCENARIOS[id];
      if (!sc || !Array.isArray(sc.env)) return;
      var old = ['lewd', 'lewdLen', 'style'].concat(o.old || []);
      var at = -1;
      sc.env.forEach(function (e, i) { if (at < 0 && old.indexOf(e.id) >= 0) at = i; });
      sc.env = sc.env.filter(function (e) { return old.indexOf(e.id) < 0; });
      if (at < 0 || at > sc.env.length) at = sc.env.length;
      var add = [];
      if (safe()) add.push({ id: 'lewd', label: '描写の有無', type: 'select', def: 'low', options: [{ v: 'low', label: 'ほのめかす（全年齢版）' }] });
      /* r18:begin */
      else {
        add.push({ id: 'lewd', label: '描写の有無', type: 'select', def: o.def || 'mid', options: LV, desc: o.desc || 'ほのめかす＝行為は書かずに雰囲気と翌朝だけ／ほどほど＝行為を描写する／濃い＝さらにもう一度求め合うところまで描く' });
        if (o.len !== false) add.push({ id: 'lewdLen', label: '描写の長さ', type: 'select', def: o.lenDef || 'thick', options: LEN });
        if (o.style !== false) add.push({ id: 'style', label: '描写の作風', type: 'select', def: 'novel', options: STY, desc: '男性向け＝擬音・♡のついた喘ぎ・おねだりの多い書き方' });
      }
      /* r18:end */
      sc.env.splice.apply(sc.env, [at, 0].concat(add));
    },
    conf: function (id) { return CONF[id] || null; },
    /* 古い設定の値を読み替える（保存してあった入力に新しい設定がないとき） */
    norm: function (id, env) {
      var o = CONF[id];
      if (!o || !env || !o.from) return env;
      Object.keys(o.from).forEach(function (k) { var f = o.from[k]; if (env[k] == null && f) { var v = f(env); if (v != null) env[k] = v; } });
      if (o.fix) o.fix(env);
      return env;
    },
    /* 結果を作るとき：新しい設定がない入力（保存してあった古い結果など）は、箱庭の初期値で埋める */
    fill: function (id, env) {
      var o = CONF[id];
      if (!o || !env) return env;
      X.norm(id, env);
      if (env.lewd == null) env.lewd = o.def || 'mid';
      if (env.lewdLen == null) env.lewdLen = o.lenDef || 'thick';
      if (env.style == null) env.style = 'novel';
      return env;
    },
    lv: function (env) {
      if (safe()) return 'low';
      var v = env && env.lewd;
      return v === 'low' || v === 'mid' || v === 'high' ? v : 'mid';
    },
    /* この場面を短く書くか（数行で短く／混ぜる。全年齢ではいつも短い） */
    short: function (env, rng) {
      if (safe()) return true;
      var v = env && env.lewdLen;
      return v === 'short' || (v === 'mix' && (rng ? rng() : Math.random()) < 0.5);
    },
    ero: function (env) { return !safe() && !!(env && env.style === 'ero'); },
    high: function (env) { return X.lv(env) === 'high'; },
    low: function (env) { return X.lv(env) === 'low'; }
  };
  /* 結果を作る前に、古い設定の値を読み替える。
     R18版で描写の有無が「ほのめかす」のときは、共通の出来事（執着・敵対など）に残ったはっきりした文を、全年齢と同じ方法でまろやかにする（safe.js の HK.SafeText） */
  /* 「拳を突き上げた」（人狼の勝利など）は性的でないので見ない */
  var EXPL = /果て|達し|イ[っッくかきキ]|挿|喘|貫|腰を[振沈打揺使]|繋が|奥まで|(?<![拳腕手杖旗剣槍]を)突き上げ|絶頂|♡|射精|精液|ちんぽ|ナカ|\{(?:男性器|亀頭|女性器|陰核|ナカ|精液|愛液)\}/;
  if (HK.simulate && !HK.simulate._lewd) {
    var sim0 = HK.simulate;
    HK.simulate = function (input) {
      var id = input && input.scenId;
      if (id && input.env && CONF[id]) X.fill(id, input.env);
      var r = sim0.apply(this, arguments);
      if (r && id && CONF[id] && CONF[id].soften !== false && !safe() && X.lv(input.env) === 'low' && HK.SafeText) {
        (r.log || []).forEach(function (e) {
          if (!e || typeof e.text !== 'string' || !EXPL.test(e.text)) return;
          var t0 = HK.SafeText(e.text);
          /* 死の記録が「二人だけの秘密」のような一文だけになってしまうときは、最期の一文にする */
          if (e.kind === 'death' && (!t0 || /^――(?:その先|そこから先|夜は|照明)/.test(t0.trim()))) t0 = (e.actors && e.actors.length ? '' : '') + '――その最期のことは、ここには書かない。';
          e.text = t0;
        });
        if (r.ending && Array.isArray(r.ending.lines)) r.ending.lines = r.ending.lines.map(function (l) { return typeof l === 'string' && EXPL.test(l) ? HK.SafeText(l) : l; });
      }
      return r;
    };
    HK.simulate._lewd = true;
  }
})();

/* ---------- 箱庭ごとの差し替え（上の箱庭から順にそろえていく） ---------- */
(function () {
  'use strict';
  var HK = window.HK, X = HK && HK.Lewd;
  if (!X) return;
  /* 箱庭ごとの描写の設定の説明（R18版だけで出す。全年齢版では設定が「ほのめかす」だけなので使わない） */
  var D = {};
  /* r18:begin */
  D.whiteroom = '条件「エッチ」の場面の描き方。ほのめかす＝触れ合いまでで暗転／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで（三人の場面も同じ）';
  D.island = '恋人・セフレ・恋愛相手を決めた相手・惹かれ合った二人の夜の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで';
  D.ship = '夜の出来事（船員どうし・看病・異星の生き物）の描き方。ほのめかす＝ぼかした一文／ほどほど＝描写する／濃い＝もう一度求め合うところまで';
  D.zombie = '恋人たちの夜の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで';
  D.jashin = '夜の出来事の描き方。ほのめかす＝ぼかした書き方／ほどほど＝描写する／濃い＝果てたあと、もう一度のところまで';
  D.yakata = '夜の出来事が起きたときの描き方（起きる回数は「夜の出来事の起こりやすさ」で決まる）。ほのめかす＝ぼかした書き方／ほどほど＝描写する／濃い＝果てたあと、もう一度のところまで';
  D.omega = '夜の描き方。ほのめかす＝朝チュン／ほどほど＝描写する／濃い＝プレイや結びを重ねて深く描く';
  D.dungeon = '陥落の場面の描き方。ほのめかす＝ぼかした書き方／ほどほど＝描写する／濃い＝堕ちたあとも続くところまで、絶頂のあとも罠が止まらない。厚く＝絶頂の前に体の様子の段落を足す。男性向け＝陥落の山場・罠・仲間の暴走に擬音と♡の喘ぎ';
  D.massage = '施術のあとの描き方。ほのめかす＝暗転して回数だけ／ほどほど＝描写する／濃い＝体位をひとつ多く。男性向けは、客が自分から求めたとき・客が主導するとき・流されたとき（短くでも）';
  D.hole = '戻ってくる感覚の描き方。ほのめかす＝ぼかした書き方／ほどほど＝描写する／濃い＝戻ってくる感覚が多くなる';
  D.kaihen = '施術の描き方。ほのめかす＝内容は数字だけ／ほどほど＝描写する／濃い＝施術の続きや声を多く';
  D.succubus = '搾精の場面の描き方。ほのめかす＝短くぼかす／ほどほど＝描写する／濃い＝より多く深く';
  D.saimin = '暗示の場面の描き方。ほのめかす＝性的な暗示は選ばれず、いたずらだけ／ほどほど＝描写する／濃い＝より多く深く';
  D.variety = '罰ゲームや楽屋の場面の描き方。ほのめかす＝ぼかす／ほどほど＝描写する／濃い＝延長戦・もう一度まで';
  D.locker = 'ロッカーの中と、扉が開いたあとの描き方。ほのめかす＝ぼかす／ほどほど＝描写する／濃い＝より深く。男性向けは、相手が応じた行為・扉が開いたあとの夜・見回りの人に無理やり迫られる場面';
  D.goukon = 'お持ち帰りの夜の描き方。ほのめかす＝翌朝の一文だけ／ほどほど＝夜を描写する／濃い＝果てたあと、もう一度求め合うところまで';
  D.jinro = '人狼の勝利の夜の描き方。ほのめかす＝ぼかした書き方／ほどほど＝描写する／濃い＝果てたあと、もう一度のところまで。男性向け＝擬音と♡の喘ぎ（強引な夜も）';
  /* r18:end */
  /* 合コン：お持ち帰りの夜（solo-goukon-night.js）。古い設定「お持ち帰りの夜（R18）」は描写の長さへ */
  /* 出られない部屋：条件「エッチ」の場面（room-thick.js）と三人の場面（room-trio.js）。古い設定「エッチの描写（R18）」は描写の長さへ */
  X.install('whiteroom', { old: ['rmlewd'], from: { lewdLen: function (e) { return e.rmlewd; } }, desc: D.whiteroom });
  /* 無人島：島の夜（solo-rel-r18.js）と状況の夜（solo-sit-night-r18.js）。古い「島の夜（R18）」：描かない・ほのめかす＝ほのめかす、描写する＝ほどほど・数行で短く */
  X.install('island', { old: ['ilewd'], def: 'low', from: { lewd: function (e) { return e.ilewd ? (e.ilewd === 'high' ? 'mid' : 'low') : null; }, lewdLen: function (e) { return e.ilewd === 'high' ? 'short' : null; } }, desc: D.island });
  /* 宇宙船漂流記：船員どうしの夜・看病の夜・異星の生き物（ship.js・ship-lewd.js）。「夜の出来事の起こりやすさ」は起きる頻度として残す */
  X.install('ship', { desc: D.ship });
  /* ゾンビの街：恋人たちの夜（zombie-love.js・zombie-thick.js）・想い続けた相手の夜・状況の夜（solo-rel-r18.js・solo-sit-night-r18.js）。
     襲われる場面（略奪者・ゾンビの群れ・治療薬の怪物）も描写の有無と作風に従う（男性向けは solo-zombie-raid.js・solo-zombie-love.js。長い版は使わない）。古い「恋人たちの夜（R18）」：描かない・ほのめかす＝ほのめかす、描写する＝ほどほど */
  X.install('zombie', { old: ['zlewd'], def: 'low', from: { lewd: function (e) { return e.zlewd ? (e.zlewd === 'high' ? 'mid' : 'low') : null; } }, desc: D.zombie });
  /* 邪神村RTA：参加者どうしの夜・媚薬・夜這い・清めの湯・洞窟・儀式・神ごとの夜（solo-jashin-r18*.js・r18-thick.js・story-lewd.js）。「夜の出来事の起こりやすさ」は起きる頻度として残す */
  X.install('jashin', { desc: D.jashin });
  /* 吹雪の館の殺人：媚薬の夜・誘惑・吊り橋・大浴場・凍える夜など（solo-yakata-r18.js・r18-thick.js・story-lewd.js）。「夜の出来事の起こりやすさ」「快楽殺人の起きやすさ」はそのまま残す */
  X.install('yakata', { desc: D.yakata });
  /* オメガバース：もとの「描写の濃さ」（朝チュン・ほどほど・濃いめ）を描写の有無にそのまま読み替える（値は同じ low/mid/high）。
     発情期の夜・恋人と番の夜・勢いの夜・愛憎の夜（omega-heat.js・omega-love.js・omega-thick.js）。濃い＝プレイと結びを重ねて深く */
  X.install('omega', { desc: D.omega });
  /* エロトラップダンジョン：もとの「罠の淫らさ」（id lewd・数値）は罠の強さとして trap に移す。陥落の山場（dungeon-thick.js） */
  X.install('dungeon', { from: { trap: function (e) { return typeof e.lewd === 'number' ? e.lewd : null; } }, fix: function (e) { if (typeof e.lewd === 'number') delete e.lewd; }, desc: D.dungeon });
  /* マッサージ：もとの「施術の過激さ」（id lewd・数値）は harsh に、「行為の描写」（描写する・軽め）は描写の有無（ほどほど・ほのめかす）に読み替える */
  X.install('massage', { old: ['desc'], fix: function (e) { if (typeof e.lewd === 'number') { if (e.harsh == null) e.harsh = e.lewd; e.lewd = e.desc === 'dark' ? 'low' : 'mid'; } }, from: {}, desc: D.massage });
  /* 感覚遮断穴：もとの「向こう側の過激さ」（id lewd・数値）は wild に。描写の作風は元からある男性向け（solo-hole-ero.js）。濃い＝戻ってくる感覚が多い */
  X.install('hole', { from: {}, fix: function (e) { if (typeof e.lewd === 'number') { if (e.wild == null) e.wild = e.lewd; delete e.lewd; } }, desc: D.hole });
  /* 常識改変：もとの「描写の濃さ」（ぼかす・ほどほど・濃いめ）と「描写の作風」をそのまま読み替える（値は同じ）。段落に分けた山場は solo-thick4.js */
  X.install('kaihen', { desc: D.kaihen });
  /* サキュバスの一夜：もとの「描写の濃さ」と「描写の作風」をそのまま読み替える（値は同じ）。段落に分けた山場は solo-thick4.js */
  X.install('succubus', { desc: D.succubus });
  /* 催眠：もとの「描写の濃さ」と「描写の作風」をそのまま読み替える（値は同じ）。全年齢では「ほのめかす」だけ（作風は出さない） */
  X.install('saimin', { desc: D.saimin });
  /* エロバラエティ番組：もとの「描写の濃さ」をそのまま読み替え、長さ・作風を追加（solo-variety.js・solo-variety-thick.js） */
  X.install('variety', { len: false, desc: D.variety });
  /* 媚薬ロッカー：もとの「描写の濃さ」をそのまま読み替え、長さ・作風を追加（solo-locker.js・locker-thick.js）。男性向けは、相手が応じた行為・扉が開いたあとの夜・見回りの人に無理やり迫られる場面（locker-crowd-r18.js） */
  X.install('locker', { desc: D.locker });
  X.install('goukon', { old: ['gnlewd'], from: { lewdLen: function (e) { return e.gnlewd; } }, desc: D.goukon });
  /* r18:begin */
  /* 人狼：人狼の勝利の夜（jinro-wolfnight.js。R18版だけの場面なので、全年齢版には欄を出さない） */
  X.install('jinro', { desc: D.jinro });
  /* r18:end */
})();
