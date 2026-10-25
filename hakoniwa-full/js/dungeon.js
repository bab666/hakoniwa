/* 箱庭診断: ソロ用エロトラップダンジョン（本体・進行計算）
   一人〜四人の住人が階層を下りながら罠・魔物・宝箱に出会う。
   終わり方は二つだけ：最深部の主を倒せば「踏破（クリア）」（S.over = 'clear'）、全員が快楽に堕ちれば「陥落」（S.over = 'fall'）。
   ・一人が堕ちても残りがいれば続く。主を倒せば、捕らわれていた人も解放される
   ・帰還の巻物は「その場から抜け出して探索を続ける」道具で、終わりにはならない。主に捕まって逃げ出した人は、また主の間に戻る
   ・部屋数の上限に達したら「主の間に辿り着いた」として最終戦へ進み、必ずどちらかの終わり方に収束させる
   イベント本文は dungeon-events-*.js、表示は dungeon-view.js */
(function () {
  'use strict';
  var HK = window.HK;
  var clamp = HK.clamp;
  var DG = HK.DG = HK.DG || {};
  DG.pool = DG.pool || [];

  /* ---------- 定義 ---------- */
  DG.PARTS = { mouth: '唇', ear: '耳', neck: '首筋', chest: '胸', back: '背中', side: '脇腹', belly: '下腹', hips: '腰', thigh: '内腿', feet: '足裏', all: '全身' };
  DG.PART_ORDER = ['mouth', 'ear', 'neck', 'chest', 'back', 'side', 'belly', 'hips', 'thigh', 'feet'];
  DG.STAGES = ['抵抗', '動揺', '揺らぎ', '受容', '陥落寸前'];
  DG.CLOTH = ['ほぼ裸', '半裸', '破れ', 'ほつれ', '無傷'];
  DG.CURSES = {
    mark: { label: '淫紋', desc: '下腹に刻まれた紋。感度が上がり、達するたびに深くなる', sens: 0.25 },
    heat: { label: '発情の呪い', desc: '部屋を移るたびに体の奥が火照る' },
    edge: { label: '寸止めの呪い', desc: 'どれだけ昂っても達せず、理性だけが削れる' },
    dbl: { label: '感度倍加', desc: '全身の感覚が鋭くなる', sens: 0.45 },
    voice: { label: '嬌声の呪い', desc: '声を抑えられなくなり、羞恥で理性が削れる' },
    melt: { label: '衣溶けの呪い', desc: '身につけたものが少しずつ溶けていく' },
    obey: { label: '服従の刻印', desc: '命令する声に逆らえなくなる' },
    dream: { label: '淫夢の呪い', desc: '休むたびに淫らな夢にうなされる' }
  };
  DG.ITEMS = {
    herb: { label: '鎮静の薬草', desc: '昂りを鎮め、理性を取り戻す' },
    holy: { label: '聖水', desc: '呪いを一つ解く' },
    charm: { label: '守りの護符', desc: '罠を一度だけ無効にする' },
    map: { label: '階層の地図', desc: 'その階の罠を見抜きやすくなる' },
    cloak: { label: '予備の外套', desc: '傷んだ装備を一段階戻す' },
    scroll: { label: '脱出の巻物', desc: '罠や魔物の手から抜け出し、その階の階段の前まで飛ぶ（迷宮の外には出られない）' }
  };
  DG.THEMES = {
    imp: { label: '淫魔の城', floors: ['城門の回廊', '甘い香の広間', '鏡張りの舞踏室', '紅い寝所の階', '淫魔の玉座'], boss: '城主の大淫魔', bossK: 'imp' },
    slime: { label: '粘液の洞窟', floors: ['湿った入り口', '滴る鍾乳洞', '温かい地底湖', '脈打つ粘膜の通路', '母なる粘液溜まり'], boss: '女王スライム', bossK: 'slime' },
    tent: { label: '触手の森', floors: ['蔓の絡む小径', '甘い花の群生地', '霧の沼地', '脈打つ大樹の根', '森の心臓'], boss: '千本触手の古木', bossK: 'tent' },
    tower: { label: '魔術師の塔', floors: ['実験室の階', '呪具の保管庫', '拘束具の工房', '観察室', '塔の頂の書斎'], boss: '好色な大魔術師', bossK: 'tower' },
    ruin: { label: '古代の神殿', floors: ['崩れた参道', '祈りの回廊', '供物の間', '儀式の地下聖堂', '豊穣神の祭壇'], boss: '目覚めた豊穣神の像', bossK: 'ruin' }
  };
  DG.THEME_KEYS = ['imp', 'slime', 'tent', 'tower', 'ruin'];
  var OUTFIT = { armor: 4, light: 3, robe: 2, thin: 1 };

  /* ---------- 記述形式 ----------
     D(id, 名前, 種類, テーマ, 部位, 強さ, オプション, 本文)
     種類: trap 罠 / mon 魔物 / chest 宝箱・怪しい物 / spring 泉 / odd 心を揺さぶる出来事 / captive 囚われ人 / cap 捕縛中
     テーマ: '*' か 'imp slime' のように空白区切り
     オプション: 'sens.1;cloth1;curse=mark;hold2;hp8;lure=fc;mind;dev2;f2;good.4;shame;item=herb;heal20'
     本文: '|' 区切り。{a}=挑戦者 {t}=罠・魔物の名前 {p}=狙われた部位 */
  function parseOpts(s) {
    var o = {};
    String(s || '').split(';').forEach(function (tok) {
      tok = tok.trim();
      if (!tok) return;
      var m = tok.match(/^([a-z]+)(?:=([a-z]+))?(-?[\d.]*)$/);
      if (!m) return;
      if (m[2]) o[m[1]] = m[2];
      else o[m[1]] = m[3] === '' ? true : parseFloat(m[3]);
    });
    return o;
  }
  DG.D = function (id, name, kind, themes, part, power, opts, texts) {
    return { id: id, name: name, kind: kind, themes: themes === '*' ? null : themes.split(/\s+/), part: part, power: power, o: parseOpts(opts), texts: texts.split('|') };
  };
  DG.add = function (list) { DG.pool = DG.pool.concat(list); };
  DG.parseOpts = parseOpts;
  DG.say = function (S, o) { return say(S, o); };
  DG.fmt = function (S, s, ev) { return fmt(S, s, ev); };
  DG.pick = function (S, a) { return pick(S, a); };
  DG.stim = function (S, ev, m) { return stim(S, ev, m); };
  DG.key = function (S, o, w) { return key(S, o, w); };
  DG.react = function (S, f) { return react(S, f); };
  DG.settle = function (S) { return settle(S); };
  DG.flushQ = function (S) { S.defer = false; flushQ(S); };

  /* ---------- 小道具 ---------- */
  function fmt(S, str, ev) {
    var h = S.h;
    return str.replace(/\{(a|t|p|boss|floor)\}/g, function (m, k) {
      if (k === 'a') return h.name;
      if (k === 't') return ev ? ev.name : '';
      if (k === 'p') return DG.PARTS[(ev && ev.partNow) || 'all'];
      if (k === 'boss') return S.theme.boss;
      if (k === 'floor') return S.floorName;
      return m;
    });
  }
  /* この回でまだ使っていない文から選ぶ。候補を使い切ったら、いちばん前に使った文から戻す */
  function pick(S, arr) {
    var U = S.useT = S.useT || {}, free = [], i;
    for (i = 0; i < arr.length; i++) if (!U[arr[i]]) free.push(arr[i]);
    var t;
    if (free.length) t = free[S.rng.int(free.length)];
    else { t = arr[0]; for (i = 1; i < arr.length; i++) if (U[arr[i]] < U[t]) t = arr[i]; }
    S.useN = (S.useN || 0) + 1; U[t] = S.useN;
    return t;
  }
  /* 部位のように、繰り返してかまわないものの選び方（直近だけ避ける） */
  function pickAny(S, arr) {
    var r = S.recent, t = arr[S.rng.int(arr.length)];
    for (var i = 0; i < 5 && r.indexOf(t) >= 0; i++) t = arr[S.rng.int(arr.length)];
    r.push(t); if (r.length > 14) r.shift();
    return t;
  }
  /* 自分で「攻め」を選んだ挑戦者（HK.Pos.hardTop）は、罠・魔物に「される」側にしない。
     本文は DG.TOP の書き下ろし（罠を壊して逃れる・魔物を逆に組み伏せる・媚薬で自分の体が火照るだけ）に差し替える */
  function isTop(h) { return !!(h && HK.Pos && HK.Pos.hardTopNpc(h)); }
  DG.isTop = isTop;
  function evText(S, ev, kind) {
    var T = DG.TOP;
    if (!T || !isTop(S.h)) return fmt(S, pick(S, ev.texts), ev);
    var k = kind || ev.kind;
    var arr = T[k === 'mon' || k === 'spring' || k === 'captive' || k === 'cap' || k === 'boss' ? k : (ev.o && ev.o.mind) || k === 'odd' ? 'mind' : k === 'chest' ? 'chest' : 'trap'];
    return fmt(S, pick(S, arr), ev);
  }
  DG.evText = function (S, ev, kind) { return evText(S, ev, kind); };
  var RICHMAP = { avoid: 'avoid', resist: 'resist', win: 'win', sneak: 'sneak', skipChest: 'skip', skipSpring: 'skip', rest: 'rest' };
  function line(S, key, ev) {
    var TL = isTop(S.h) && DG.TOP && DG.TOP.lines[key];
    if (TL) return fmt(S, pick(S, TL), ev);
    var rk = RICHMAP[key], R0 = rk && DG.RICH && DG.RICH[rk] && S.h && DG.RICH[rk][S.h.persona];
    if (R0) return fmt(S, pick(S, R0), ev);
    var L = DG.LINES[key];
    return L ? fmt(S, pick(S, L), ev) : '';
  }
  function rawStage(h) { return h.corrupt < 20 ? 0 : h.corrupt < 40 ? 1 : h.corrupt < 60 ? 2 : h.corrupt < 80 ? 3 : 4; }
  /* 反応の段階（0 抵抗〜4 陥落寸前）は堕ち度から決め、いったん上がったら下げない
     （薬草や休憩で堕ち度がわずかに戻っても、本文の反応が「抵抗」と「受容」を行き来しないように） */
  function stage(h) { var s = rawStage(h); if (h.rxSg == null || s > h.rxSg) h.rxSg = s; return h.rxSg; }
  DG.stage = function (h) { return stage(h); };
  /* 段階が上がったときの、変わり目の一文（一人につき一段階一回） */
  function shiftLine(S, h, sg) {
    var prev = h.rxSaid; h.rxSaid = sg;
    if (prev == null || sg <= prev) return '';
    var top = isTop(h), T = top ? DG.SHIFT_TOP : DG.SHIFT;
    /* 堕ち度40の「心」の一文が直後に出るときは重ねない */
    if (!T || !T[sg] || (sg === 2 && !S.flags.c40 && !top)) return '';
    return fmt(S, pick(S, T[sg])) + ' ';
  }
  function will(h) { return clamp(h.tr.cp * 0.35 + h.tr.a * 0.25 + h.reason / 100 * 0.4, 0, 1); }
  function hasCurse(h, id) { return h.curses.indexOf(id) >= 0; }
  function hasItem(h, id) { return h.items.indexOf(id) >= 0; }
  function useItem(h, id) { var i = h.items.indexOf(id); if (i >= 0) h.items.splice(i, 1); }
  function st(h, id) { return h.stats[id] || 3; }
  function pct(v) { return Math.round(v * 100) + '%'; }

  function say(S, o) {
    /* R18の描写の設定（長さ・作風・濃い）に合わせて本文を足す（dungeon-lewd.js） */
    if (DG.lewdHook) DG.lewdHook(S, o);
    o.floor = S.floor; o.room = S.room; o.n = S.log.length;
    o.v = { r: Math.round(S.h.reason), p: Math.round(S.h.pleasure), c: Math.round(S.h.corrupt) };
    S.log.push(o);
    if (o.kind !== 'climax' && o.kind !== 'step') S.lastMain = o;
    if (S.q && S.q.length && o.kind !== 'climax' && !S.flushing) flushQ(S);
    return o;
  }
  /* 刺激の結果（絶頂・呪い）は、原因の出来事を書いたあとに並べる */
  function flushQ(S) {
    S.flushing = true;
    var q = S.q; S.q = [];
    q.forEach(function (f) { f(); });
    S.flushing = false;
  }
  function later(S, f) { if (S.defer) S.q.push(f); else f(); }
  /* 罠を避けた・魔物を退けた・素通りした、のような平凡な結果は間引いて記録する */
  function routine(S, o) { if (S.rng() < (S.party && S.party.length > 1 ? 0.3 : 0.5)) return say(S, o); return null; }
  function key(S, o, why) { o.key = true; S.turns.push({ n: o.n, why: why }); }

  /* 本文＋気質による反応 */
  function react(S, force) {
    var h = S.h, T = isTop(h) && DG.TAILS_TOP ? DG.TAILS_TOP : DG.TAILS[h.persona], sg = stage(h);
    if (!T) return '';
    /* 段階は一人ずつ覚える（パーティーで別の人の段階と比べない） */
    var sh = shiftLine(S, h, sg);
    if (!force && !sh && sg === h.lastStage && S.rng() > 0.2) return '';
    h.lastStage = sg;
    /* こらえる体の反応は、まだ抵抗・動揺の段階（0〜1）だけ。揺らぎ始めたら、こらえる文には戻らない */
    if (DG.ENDURE && sg <= 1 && T !== DG.TAILS_TOP && S.rng() < 0.4) return ' ' + sh + fmt(S, pick(S, DG.ENDURE[h.persona]));
    return ' ' + sh + fmt(S, pick(S, T[sg]));
  }
  /* 直前の記録に短い補足を足す（行数を増やさない） */
  function note(S, text, keyWhy, target) {
    var last = target || S.log[S.log.length - 1];
    if (!last || last.kind === 'step') last = say(S, { kind: 'sys', tag: '状態', text: '', why: '' });
    last.text += (last.text ? ' ' : '') + text;
    if (keyWhy) key(S, last, keyWhy);
    return last;
  }

  /* ---------- 快楽・理性・堕ち ---------- */
  function addCurse(S, id, src) {
    var h = S.h;
    if (!DG.CURSES[id] || hasCurse(h, id)) return false;
    h.curses.push(id);
    h.sens += DG.CURSES[id].sens || 0;
    var first = !S.flags.firstCurse; S.flags.firstCurse = true;
    later(S, function () { note(S, '〔' + DG.CURSES[id].label + 'が刻まれた〕', first ? '初めての呪い' : null); });
    return true;
  }
  function clothDown(S, n) {
    var h = S.h;
    if (h.cloth <= 0) return;
    h.cloth = Math.max(0, h.cloth - n);
    S.cnt.cloth += n;
  }

  /* 一回の刺激。戻り値は増えた快感 */
  function stim(S, ev, mult, why) {
    var h = S.h, o = ev.o, rng = S.rng;
    S.defer = true;
    var part = ev.part === 'any' ? pickAny(S, DG.PART_ORDER) : ev.part;
    ev.partNow = part;
    var dev = part === 'all' ? avgDev(h) : h.dev[part] || 0;
    var clothMul = 1 + (4 - h.cloth) * 0.09;
    var gain = ev.power * (0.55 + S.env.trap / 100 * 0.9) * h.sens * (1 + dev * 0.13) * clothMul * (mult || 1) * rng.range(0.78, 1.22);
    var w = will(h);
    gain *= 1.12 - w * 0.42;
    if (o.mind) gain *= 1.15 - h.tr.cold * 0.35 - st(h, 'magic') * 0.04;
    if (o.shame || hasCurse(h, 'voice')) h.reason -= (2 + h.tr.ac * 5);
    if (hasCurse(h, 'obey') && (o.mind || o.lure === 'ac')) gain *= 1.3;
    h.pleasure += gain;
    h.reason -= gain * (0.13 + (o.mind ? 0.08 : 0)) * (1 - w * 0.45) * S.k;
    /* 開発度（責められた部位ほど伸びる）は、攻めの挑戦者には付かない */
    if (isTop(h)) { /* 伸ばさない */ }
    else if (part === 'all') DG.PART_ORDER.forEach(function (k) { h.dev[k] = Math.min(10, (h.dev[k] || 0) + 0.35); });
    else h.dev[part] = Math.min(10, (h.dev[part] || 0) + (o.dev || 1));
    if (o.sens) h.sens += o.sens;
    if (o.cloth) clothDown(S, o.cloth);
    if (o.hp) h.hp -= o.hp;
    S.cause[ev.kind] = (S.cause[ev.kind] || 0) + gain;
    S.lastEv = ev;
    if (o.curse && rng() < 0.55 + S.env.trap / 250) addCurse(S, o.curse, ev.name);
    climaxCheck(S, ev);
    return gain;
  }
  function avgDev(h) {
    var s = 0;
    DG.PART_ORDER.forEach(function (k) { s += h.dev[k] || 0; });
    return s / DG.PART_ORDER.length;
  }

  function climaxCheck(S, ev) {
    var h = S.h, rng = S.rng;
    var guard = 0;
    while (h.pleasure >= 100 && guard++ < 3) {
      if (hasCurse(h, 'edge')) {
        h.pleasure = 94 + rng.int(5);
        h.reason -= 7 + h.tr.fc * 4;
        h.corrupt += 2;
        S.cnt.edge++;
        var et = line(S, 'edge', ev);
        later(S, function () { S.lwWho = h; S.lwEv = ev; say(S, { kind: 'climax', tag: '寸止め', text: et, why: '寸止めの呪い' }); S.lwWho = null; });
        break;
      }
      h.climax++;
      var w = will(h);
      var gainC = 4.5 + h.climax * 1.25 + h.tr.fc * 4 + h.tr.ac * 3 - h.tr.cp * 3 + (S.h.goal.id === 'secret' ? 3 : 0);
      h.corrupt += Math.max(3, gainC * 1.4) * S.k;
      h.reason -= (4 + h.climax) * (1 - w * 0.4) * S.k;
      h.sens += 0.04 + (hasCurse(h, 'mark') ? 0.05 : 0);
      h.pleasure = 18 + rng.int(18) + (hasCurse(h, 'mark') ? 14 : 0) + (hasCurse(h, 'heat') ? 8 : 0);
      var top = isTop(h) && DG.CLIMAX_TOP, cn = h.climax, moanOn = DG.MOAN && !top && rng() < 0.45;
      later(S, function () {
        /* 絶頂の言い回しは、書く時点の段階で選ぶ（原因の出来事の反応より前の段階に戻らないように） */
        var hs = S.h; S.h = h;
        var sg = stage(h), ctext = fmt(S, pick(S, top ? DG.CLIMAX_TOP[sg] : DG.CLIMAX[h.persona][sg]), ev);
        if (moanOn) ctext = '「' + pick(S, DG.MOAN[h.persona]) + '」' + ctext;
        S.h = hs;
        /* 絶頂した本人（パーティーでは書くときに別の人の番になっていることがある。dungeon-lewd.js が読む） */
        S.lwWho = h; S.lwEv = ev;
        var o = say(S, { kind: 'climax', tag: '絶頂', text: ctext, why: cn === 1 ? '初めての絶頂' : cn + '回目' });
        S.lwWho = null;
        if (cn === 1) key(S, o, '最初の絶頂');
        if (cn === 5 || cn === 10) key(S, o, cn + '回目の絶頂');
      });
    }
  }

  function settle(S) {
    var h = S.h;
    h.reason = clamp(h.reason, -5, 100);
    if (h.reason < 50) h.corrupt += (50 - h.reason) / 8 * S.k;
    if (h.pleasure > 70) h.corrupt += 1.2 * S.k;
    if (h.corrupt >= 40 && !S.flags.c40) { S.flags.c40 = true; var o1 = say(S, { kind: 'sys', tag: '心', text: line(S, 'mid'), why: '堕ち度40' }); key(S, o1, '心が揺らぎ始めた'); }
    if (h.corrupt >= 75 && !S.flags.c75) { S.flags.c75 = true; var o2 = say(S, { kind: 'sys', tag: '心', text: line(S, 'brink'), why: '堕ち度75' }); key(S, o2, '陥落寸前'); }
    h.corrupt = clamp(h.corrupt, 0, 100);
    h.pleasure = clamp(h.pleasure, 0, 100);
    h.hp = clamp(h.hp, 0, 100);
    h.sens = clamp(h.sens, 0.6, 3.5);
    if (h.reason <= 0) h.corrupt = 100;
    if (h.corrupt >= 100) { h.fallen = true; return true; }
    return false;
  }

  /* 道具を自動で使う */
  function useItems(S) {
    var h = S.h;
    if (hasItem(h, 'herb') && (h.pleasure > 78 || h.reason < 35)) {
      useItem(h, 'herb'); h.pleasure -= 45; h.reason += 15; h.corrupt -= 2;
      note(S, '〔鎮静の薬草で昂りを鎮めた〕');
    }
    if (hasItem(h, 'holy') && h.curses.length) {
      var order = ['edge', 'obey', 'dbl', 'heat', 'mark', 'dream', 'voice', 'melt'];
      var tgt = order.filter(function (c) { return hasCurse(h, c); })[0];
      if (tgt && (tgt !== 'mark' || S.h.goal.id === 'curse' || h.corrupt > 30)) {
        useItem(h, 'holy');
        h.curses.splice(h.curses.indexOf(tgt), 1);
        h.sens = Math.max(1, h.sens - (DG.CURSES[tgt].sens || 0));
        S.cnt.cured++;
        note(S, '〔聖水で' + DG.CURSES[tgt].label + 'を解いた〕');
      }
    }
    if (hasItem(h, 'cloak') && h.cloth <= 1) {
      useItem(h, 'cloak'); h.cloth += 2;
      note(S, '〔予備の外套を羽織った〕');
    }
    /* 脱出の巻物：捕まっているときに使って抜け出す。迷宮の外には出られないので、探索は続く */
    if (hasItem(h, 'scroll') && h.captor && !S.over && !h.fallen) {
      var g = S.h.goal.id;
      var th = g === 'secret' ? (h.corrupt > 70 || h.reason < 25) : g === 'escape' || h.tr.caution > 0.45 ? true : (h.capRounds >= 1 || h.corrupt > 50 || h.reason < 38);
      if (th) {
        useItem(h, 'scroll');
        var wasBoss = h.bossCapture;
        h.captor = null; h.bossCapture = false; h.hp = Math.max(h.hp, 30);
        var o = say(S, { kind: 'sys', tag: '脱出', text: line(S, 'useScroll') + (wasBoss ? ' ' + fmt(S, pick(S, DG.LINES.bossReturn)) : ''), why: '脱出の巻物（目標：' + S.h.goal.label + '）' });
        key(S, o, '巻物で抜け出した');
      }
    }
  }

  function gainItem(S, id, src) {
    var h = S.h;
    h.items.push(id); S.cnt.items++;
    if (id === 'map') S.mapFloor = S.floor;
    note(S, '〔' + (src ? src + 'から' : '') + DG.ITEMS[id].label + 'を入手〕');
  }
  function randItem(S) {
    return HK.weighted(S.rng, ['herb', 'holy', 'charm', 'map', 'cloak', 'scroll'], function (k) {
      return { herb: 3, holy: 2, charm: 2, map: 1.5, cloak: 1.2, scroll: 0.5 + S.env.mercy / 200 }[k];
    });
  }

  /* ---------- 判定 ---------- */
  function detectP(S) {
    var h = S.h, t = h.tr;
    var p = 0.1 + t.caution * 0.3 + st(h, 'scout') * 0.07 + t.a * 0.08 - S.env.trap / 1000 - h.pleasure / 420 - (h.outfit === 'armor' ? 0.05 : 0);
    if (S.mapFloor === S.floor) p += 0.2;
    if (S.party && S.party.length > 1) { var bs = 0; S.party.forEach(function (x) { if (x !== h && !x.fallen && !x.captor) bs = Math.max(bs, st(x, 'scout') + x.tr.caution * 2); }); p += Math.max(0, bs - st(h, 'scout')) * 0.015; }
    if (S.h.action.id === 'careful') p += 0.15;
    if (S.h.action.id === 'rush') p -= 0.1;
    return clamp(p, 0.04, 0.9);
  }
  function lureP(S, ev) {
    var h = S.h, l = ev.o.lure, base = 0;
    if (l) base = (h.tr[l] != null ? h.tr[l] : 0.5) * 0.45;
    var seek = Math.max(0, (h.corrupt - 45) / 85) + (S.h.goal.id === 'secret' ? 0.12 + h.corrupt / 300 : 0);
    if (hasCurse(h, 'obey') && l === 'ac') base += 0.3;
    return { lure: clamp(base, 0, 0.8), seek: clamp(seek, 0, 0.75) };
  }
  function whyDetect(S, ok) {
    var h = S.h;
    return (ok ? '見抜いた' : '見抜けず') + '（罠察知 ' + st(h, 'scout') + '・慎重さ ' + pct(h.tr.caution) + (h.pleasure > 50 ? '・昂りで注意散漫' : '') + '）';
  }

  /* ---------- 部屋の種類 ---------- */
  function pickEv(S, kind) {
    var th = S.themeKey, f = S.floor;
    var list = DG.pool.filter(function (e) {
      if (e.kind !== kind) return false;
      if (e.themes && th !== 'mix' && e.themes.indexOf(th) < 0) return false;
      if (e.themes && th === 'mix' && e.themes.indexOf(S.mixTheme) < 0 && S.rng() < 0.5) return false;
      if (e.o.f && f + 1 < e.o.f) return false;
      return true;
    });
    if (!list.length) list = DG.pool.filter(function (e) { return e.kind === kind; });
    var seen = S.seen;
    return HK.weighted(S.rng, list, function (e) { return 1 / (1 + (seen[e.id] || 0) * 2.5); });
  }
  function seen(S, ev) { S.seen[ev.id] = (S.seen[ev.id] || 0) + 1; }

  function roomKind(S) {
    var env = S.env, h = S.h;
    var W = {
      trap: 0.36 + env.trap / 400,
      mon: 0.12 + env.monsters / 300 + (S.h.action.id === 'fight' ? 0.06 : 0),
      chest: 0.1 + (S.h.action.id === 'loot' ? 0.05 : 0),
      spring: 0.05 + env.mercy / 1000,
      rest: 0.04 + env.mercy / 600,
      odd: 0.12,
      captive: 0.03 + (S.h.goal.id === 'rescue' ? 0.07 : 0)
    };
    if (h.pleasure > 75 || h.reason < 40) W.rest += 0.04;
    return HK.weighted(S.rng, Object.keys(W), function (k) { return W[k]; });
  }

  /* ---------- 各部屋 ---------- */
  function roomTrap(S, ev, viaChest) {
    var h = S.h, rng = S.rng;
    seen(S, ev);
    var det = rng() < detectP(S);
    var L = lureP(S, ev);
    var mult = 1, why = whyDetect(S, det), deliberate = false;
    if (det) {
      if (rng() < L.seek) { deliberate = true; S.cnt.seek++; why = '見抜いていたのに、自分から（堕ち度 ' + Math.round(h.corrupt) + '）'; }
      else if (ev.o.lure && rng() < L.lure) { deliberate = true; why = '見抜いていたが、' + ({ fc: '好奇心（FC）', np: '情（NP）', ac: '従順さ（AC）', cp: '負けん気（CP）', a: '知りたい気持ち（A）', impulse: '衝動' }[ev.o.lure] || '誘惑') + 'に負けた'; }
      else {
        var avoid = 0.55 + st(h, 'scout') * 0.05 + h.tr.a * 0.12 + (ev.o.mind ? st(h, 'magic') * 0.05 : 0);
        if (rng() < avoid) {
          S.cnt.avoided++;
          routine(S, { kind: 'ev', tag: viaChest ? '宝箱' : '罠', text: line(S, ev.o.mind ? 'resist' : 'avoid', ev), why: why });
          return;
        }
        mult = 0.6; why += '・避けきれず';
      }
    }
    if (hasItem(h, 'charm') && !deliberate) {
      useItem(h, 'charm');
      say(S, { kind: 'item', tag: '護符', text: fmt(S, '{t}が{a}に触れる寸前、護符が砕けて光った。何も起きなかった。', ev), why: '守りの護符' });
      return;
    }
    S.cnt.traps++;
    var text = (deliberate ? line(S, 'seek', ev) + ' ' : '') + evText(S, ev, viaChest ? 'chest' : null);
    var before = h.pleasure;
    stim(S, ev, mult * (deliberate ? 1.15 : 1));
    var o = say(S, { kind: 'ev', tag: viaChest ? '宝箱' : ev.o.mind ? '幻惑' : '罠', text: text + react(S), why: (deliberate ? why + '／' : '') + DG.PARTS[ev.partNow] + '＋' + Math.round(h.pleasure - before > 0 ? h.pleasure - before : 0) });
    if (deliberate && S.cnt.seek === 1) key(S, o, '自分から罠に触れた');
    S.holdTarget = S.lastMain;
    if (ev.o.hold) hold(S, ev, ev.o.hold);
  }

  function hold(S, ev, n) {
    var h = S.h, rng = S.rng;
    /* 攻めの挑戦者は捕まえられない（本文で、もう振りほどいている） */
    if (isTop(h)) { S.defer = false; flushQ(S); return; }
    h.holdN = (h.holdN || 0) + 1;
    for (var i = 0; i < n; i++) {
      if (S.over || S.h.fallen) return;
      var esc = 0.22 + st(h, 'fight') * 0.06 + h.tr.cp * 0.2 + h.tr.a * 0.08 + h.hp / 500 - h.corrupt / 260 - h.pleasure / 500;
      if (rng() < esc) { S.defer = false; note(S, '→' + line(S, 'holdEscape', ev), null, S.holdTarget); flushQ(S); return; }
      stim(S, ev, 0.72);
      if (settle(S)) return;
    }
    S.defer = false;
    note(S, '→' + line(S, 'holdRelease', ev), null, S.holdTarget);
    flushQ(S);
  }

  function roomMon(S, ev) {
    var h = S.h, rng = S.rng, t = h.tr;
    seen(S, ev);
    S.cnt.fights++;
    if (S.h.action.id === 'stealth' || (t.caution > 0.6 && rng() < 0.4)) {
      var sneak = 0.3 + t.caution * 0.3 + st(h, 'scout') * 0.05;
      if (rng() < sneak) { S.cnt.avoided++; routine(S, { kind: 'ev', tag: '魔物', text: line(S, 'sneak', ev), why: '' }); return; }
    }
    var allies = S.party ? S.party.filter(function (x) { return x !== h && !x.fallen && !x.captor; }).length : 0;
    var power = allies * 0.04 + 0.32 + st(h, 'fight') * 0.09 + t.aggr * 0.18 + t.cp * 0.08 + h.hp / 450 + (S.h.action.id === 'fight' ? 0.1 : 0) - h.pleasure / 400;
    var foe = 0.18 + (S.floor / Math.max(1, S.floors - 1)) * 0.25 + S.env.monsters / 450 + (ev.o.f ? 0.05 : 0);
    if (ev.o.lure && rng() < lureP(S, ev).lure) {
      var o0 = say(S, { kind: 'ev', tag: '魔物', text: line(S, 'charmed', ev), why: '誘いに乗った（' + ev.o.lure.toUpperCase() + '）' });
      power -= 0.4; o0.tag = '魅了';
    }
    if (rng() < power - foe + 0.5) {
      S.cnt.won++;
      h.hp -= 4 + rng.int(8);
      routine(S, { kind: 'ev', tag: '撃退', text: line(S, 'win', ev), why: '' });
      return;
    }
    h.hp -= 12 + rng.int(12) + S.floor * 2; h.lostN = (h.lostN || 0) + 1;
    S.cnt.traps++;
    var before = h.pleasure;
    stim(S, ev, 1);
    say(S, { kind: 'ev', tag: isTop(h) ? '逆襲' : '敗北', text: evText(S, ev) + react(S), why: DG.PARTS[ev.partNow] + '＋' + Math.round(Math.max(0, h.pleasure - before)) });
    if (settle(S)) return;
    if (h.hp <= 0) { capture(S, ev); return; }
    S.holdTarget = S.lastMain;
    if (ev.o.hold) hold(S, ev, ev.o.hold);
  }

  function capture(S, ev) {
    var h = S.h;
    h.hp = 0;
    S.h.captor = ev; S.h.capRounds = 0; S.h.capN = (S.h.capN || 0) + 1; S.cnt.captured++;
    var o = say(S, { kind: 'sys', tag: '捕縛', text: line(S, 'captured', ev), why: '体力が尽きた' });
    key(S, o, ev.name + 'に捕らえられた');
  }
  function roomCaptive(S) {
    var h = S.h, rng = S.rng, ev = pickEv(S, 'cap');
    seen(S, ev);
    S.h.capRounds++;
    ev = Object.create(ev); ev.name = S.h.captor.name;
    stim(S, ev, 1 + S.h.capRounds * 0.1);
    say(S, { kind: 'ev', tag: '捕縛中', text: evText(S, ev, 'cap') + react(S), why: '捕らわれて' + S.h.capRounds + '部屋分' });
    if (settle(S)) return;
    var esc = 0.12 + h.tr.cp * 0.22 + h.tr.a * 0.1 + st(h, 'fight') * 0.03 + h.reason / 320 - h.corrupt / 220;
    if (S.h.goal.id === 'secret') esc -= 0.1;
    if (rng() < esc) {
      h.hp = 30; S.h.captor = null;
      /* 主から逃げ出しても迷宮の外には出られない。主の間に戻って、もう一度挑む */
      var wasBoss = !!h.bossCapture; h.bossCapture = false;
      var o = say(S, { kind: 'sys', tag: '脱出', text: line(S, 'capEscape') + (wasBoss ? ' ' + fmt(S, pick(S, DG.LINES.bossReturn)) : ''), why: '脱出（CP ' + Math.round(h.eg.CP) + '・理性 ' + Math.round(h.reason) + '）' + (wasBoss ? '／主の間へ戻る' : '') });
      key(S, o, wasBoss ? S.theme.boss + 'の手から逃げ出した' : '捕縛から逃げ出した');
    }
  }

  function roomChest(S, ev) {
    var h = S.h, t = h.tr, rng = S.rng;
    seen(S, ev);
    var open = 0.3 + t.fc * 0.35 + t.impulse * 0.15 + (S.h.action.id === 'loot' ? 0.4 : 0) + (S.h.goal.id === 'treasure' ? 0.08 : 0) - t.caution * 0.22 + h.corrupt / 250;
    if (rng() > open) { routine(S, { kind: 'ev', tag: '宝箱', text: line(S, 'skipChest', ev), why: '' }); return; }
    var good = (ev.o.good || 0.4) + S.env.mercy / 400 + st(h, 'scout') * 0.03;
    if (rng() < good) {
      say(S, { kind: 'ev', tag: '宝箱', text: line(S, 'openGood', ev), why: '' });
      gainItem(S, ev.o.item || randItem(S));
      return;
    }
    roomTrap(S, ev, true);
  }

  function roomSpring(S, ev) {
    var h = S.h, rng = S.rng;
    seen(S, ev);
    var drink = 0.35 + h.tr.fc * 0.25 + (100 - h.hp) / 200 + h.corrupt / 300 - h.tr.caution * 0.2;
    if (rng() > drink) { routine(S, { kind: 'ev', tag: '泉', text: line(S, 'skipSpring', ev), why: '' }); return; }
    if (rng() < (ev.o.good || 0.45) + S.env.mercy / 300) {
      h.hp += 30; h.reason += ev.o.heal || 10; h.pleasure -= 20;
      say(S, { kind: 'ev', tag: '泉', text: line(S, 'springGood', ev), why: '' });
      return;
    }
    S.cnt.traps++;
    stim(S, ev, 1);
    say(S, { kind: 'ev', tag: '泉', text: evText(S, ev) + react(S), why: '' });
  }

  function roomOdd(S, ev) {
    var h = S.h, rng = S.rng;
    seen(S, ev);
    var resist = 0.22 + h.tr.a * 0.25 + h.tr.cold * 0.2 + st(h, 'magic') * 0.05 + h.reason / 400 - h.corrupt / 300;
    if (ev.o.free) {
      if (ev.o.heal) h.reason += ev.o.heal;
      say(S, { kind: 'ev', tag: '出来事', text: fmt(S, pick(S, ev.texts), ev), why: ev.o.heal ? '理性が少し戻った' : '' });
      if (ev.o.item) gainItem(S, ev.o.item);
      return;
    }
    if (rng() < resist && !(ev.o.lure && rng() < lureP(S, ev).lure)) {
      routine(S, { kind: 'ev', tag: '幻惑', text: line(S, 'resist', ev), why: '' });
      h.reason += 2;
      return;
    }
    S.cnt.traps++;
    stim(S, ev, 1);
    say(S, { kind: 'ev', tag: '幻惑', text: evText(S, ev, 'odd') + react(S), why: '' });
  }

  function roomCaptiveNpc(S, ev) {
    var h = S.h, rng = S.rng;
    seen(S, ev);
    var help = h.tr.np * 0.6 + (S.h.goal.id === 'rescue' ? 0.4 : 0) + h.tr.warmth * 0.1;
    if (rng() > help) {
      h.reason -= h.tr.np * 4;
      say(S, { kind: 'ev', tag: '囚われ人', text: line(S, 'ignoreNpc', ev), why: '助けなかった（NP ' + Math.round(h.eg.NP) + '）' });
      return;
    }
    var ok = 0.4 + st(h, 'fight') * 0.05 + h.tr.a * 0.15 + st(h, 'scout') * 0.03 - (ev.o.bait ? 0.25 : 0);
    if (rng() < ok) {
      S.cnt.rescued++; h.reason += 8;
      var o = say(S, { kind: 'ev', tag: '救出', text: line(S, 'rescue', ev), why: '救出成功（NP ' + Math.round(h.eg.NP) + '）' });
      if (S.cnt.rescued === 1) key(S, o, '囚われ人を救った');
      if (rng() < 0.7) gainItem(S, randItem(S), '助けた冒険者');
      return;
    }
    S.cnt.traps++;
    stim(S, ev, 1.1);
    say(S, { kind: 'ev', tag: '囚われ人', text: evText(S, ev, 'captive') + react(S), why: '助けようとして、罠にかかった（NP ' + Math.round(h.eg.NP) + '）' });
    S.holdTarget = S.lastMain;
    if (ev.o.hold) hold(S, ev, ev.o.hold);
  }

  function roomRest(S) {
    var h = S.h, rng = S.rng, m = S.env.mercy;
    S.cnt.rests++;
    if (h.pleasure > 65 && rng() < h.tr.fc * 0.4 + h.corrupt / 160 + (S.h.goal.id === 'secret' ? 0.2 : 0)) {
      h.pleasure = 100;
      say(S, { kind: 'ev', tag: '休息', text: line(S, 'relief'), why: '昂りを自分で鎮めた（FC ' + Math.round(h.eg.FC) + '）' });
      var c0 = h.corrupt; climaxCheck(S, null); h.corrupt = c0 + (h.corrupt - c0) * 0.5;
      h.hp += 15;
      return;
    }
    h.reason += 10 + m / 10 + h.tr.a * 4; h.pleasure -= 30; h.hp += 25; h.corrupt -= 1.5;
    say(S, { kind: 'ev', tag: '休息', text: line(S, 'rest'), why: '' });
    if (hasCurse(h, 'dream')) {
      var ev = pickEv(S, 'odd');
      ev = Object.create(ev); ev.o = { mind: true }; ev.name = '淫夢';
      stim(S, ev, 0.9);
      say(S, { kind: 'ev', tag: '淫夢', text: line(S, 'dream') + react(S), why: '淫夢の呪い' });
    }
  }

  function roomStairs(S) {
    var h = S.h, rng = S.rng;
    var next = S.floor + 1 < S.floors ? floorName(S, S.floor + 1) : '';
    if (rng() < 0.25 + S.env.trap / 400) {
      var ev = pickEv(S, 'trap');
      roomTrap(S, ev);
    } else if (rng() < 0.3) {
      say(S, { kind: 'ev', tag: '階段', text: line(S, 'stairs'), why: '' });
    }
  }

  /* ---------- ボス ---------- */
  function bossEv(S, B, mv) {
    return { id: B.id, name: B.name, kind: 'boss', boss: B, part: mv.part, power: mv.power + S.floors * (B.mid ? 0.5 : 1), o: mv.o, texts: mv.texts };
  }
  /* mid=true なら階層の番人。複数人なら毎ラウンド誰か一人が狙われ、反撃は全員で */
  function freeOf(S) { return S.party.filter(function (x) { return !x.fallen && !x.captor; }); }
  function roomBoss(S, B, mid) {
    var rng = S.rng, head = { name: B.name };
    if (!mid) {
      /* 二度目からは（逃げ出して戻ってきたとき）、短く */
      if (!S.bossMet) { S.bossMet = true; var o = say(S, { kind: 'sys', tag: 'ボス', text: fmt(S, pick(S, B.intro), head), why: '最深部の主' }); key(S, o, B.name + 'と対峙'); }
      else say(S, { kind: 'sys', tag: 'ボス', text: fmt(S, pick(S, DG.LINES.bossAgain), head), why: '最深部の主との再戦' });
    }
    S.bossTag = mid ? '番人' : '技';
    var need = mid ? 1 : (S.floors >= 7 ? 3 : 2) + (S.party.length >= 3 ? 1 : 0), hits = 0, rounds = mid ? 2 : 5 + Math.min(2, S.party.length - 1);
    var order = rng.shuffle(B.moves);
    for (var r = 0; r < rounds && !S.over; r++) {
      var F = freeOf(S);
      if (!F.length) break;
      /* 攻めの挑戦者はできるだけ標的から外す（全員が攻めなら、本文を差し替える） */
      var Fv = F.filter(function (x) { return !isTop(x); });
      var h = S.h = HK.weighted(rng, Fv.length ? Fv : F, function (x) { return 1.2 - x.tr.caution * 0.6 + x.corrupt / 150; });
      var mv = order[r % order.length], ev = bossEv(S, B, mv);
      stim(S, ev, 1 + r * 0.08);
      say(S, { kind: 'ev', tag: S.bossTag, text: (mid && r === 0 ? B.name + '：' : '') + '《' + mv.n + '》' + evText(S, ev, 'boss') + react(S), why: DG.PARTS[ev.partNow] });
      S.holdTarget = S.lastMain;
      if (mv.o.hold) hold(S, ev, mv.o.hold);
      var splash = [];
      F.forEach(function (x) { if (x !== h && !isTop(x) && rng() < 0.6) { S.h = x; stim(S, ev, 0.6); splash.push(x); } });
      S.h = h;
      if (splash.length) { S.defer = false; note(S, '〔' + splash.map(function (x) { return x.name; }).join('・') + 'も巻き込まれた〕', null, S.holdTarget); flushQ(S); }
      splash.forEach(function (x) { S.h = x; if (settle(S)) DG.fallHero(S, x); });
      S.h = h;
      if (settle(S)) { DG.fallHero(S, h); continue; }
      if (DG.partyBoss && F.length > 1) DG.partyBoss(S, h, B);
      F = freeOf(S);
      if (!F.length) break;
      var best = null, bp = -1;
      F.forEach(function (x) { var p = 0.28 + st(x, 'fight') * 0.06 + x.tr.cp * 0.14 + x.tr.a * 0.1 + st(x, 'magic') * 0.04 + x.reason / 260 - x.pleasure / 320 - x.corrupt / 300 + (mid ? 0.1 : 0); if (p > bp) { bp = p; best = x; } });
      bp += (F.length - 1) * 0.06;
      if (rng() < bp) {
        hits++; S.h = best;
        if (hits >= need) {
          var o2 = say(S, { kind: 'sys', tag: '撃破', text: fmt(S, pick(S, hitLines(B, best)), head) + ' ' + fmt(S, pick(S, B.win), head), why: best.name + '（戦闘力 ' + st(best, 'fight') + '・CP ' + Math.round(best.eg.CP) + '）' + (F.length > 1 ? '＋仲間' + (F.length - 1) + '人' : '') });
          key(S, o2, B.name + 'を倒した');
          if (!mid) S.over = 'clear';
          else S.cnt.mids++;
          return;
        }
        say(S, { kind: 'ev', tag: '反撃', text: fmt(S, pick(S, hitLines(B, best)), head), why: '反撃 ' + hits + '/' + need });
      }
    }
    if (S.over) return;
    var Fr = freeOf(S);
    if (mid) {
      Fr.forEach(function (x) { x.hp -= 25 / Math.max(1, Fr.length * 0.7); });
      if (Fr.length) { S.h = Fr[0]; say(S, { kind: 'ev', tag: '番人', text: line(S, 'midLeave', head), why: '倒しきれなかった' }); }
      Fr.forEach(function (x) { if (x.hp <= 0) { S.h = x; capture(S, bossEv(S, B, B.moves[0])); } });
      return;
    }
    Fr.forEach(function (x) { S.h = x; capture(S, bossEv(S, B, B.moves[0])); x.bossCapture = true; });
  }

  /* 反撃の文：攻めの挑戦者には「拘束から抜け出す」書き方を使わない（そもそも捕まっていない） */
  function hitLines(B, x) {
    if (!isTop(x)) return B.hit;
    var l = B.hit.filter(function (t) { return !/抜け出|振り払|断ち切|引きちぎ|斬り落と|引き剥が|ほど|魅了/.test(t); });
    return l.length ? l : ['{a}は{t}の懐に踏み込み、渾身の一撃を叩き込んだ。', '{a}は{t}の攻撃を紙一重でかわし、がら空きになった脇へ一撃を叩き込んだ。', '{a}は真正面から{t}に踏み込み、怯んだ隙を逃さず続けざまに打ち込んだ。'];
  }
  function pickBoss(S, th, tiers, used) {
    var list = DG.BOSSES.filter(function (b) { return b.th === th && tiers.indexOf(b.tier) >= 0 && used.indexOf(b.id) < 0; });
    if (!list.length) list = DG.BOSSES.filter(function (b) { return tiers.indexOf(b.tier) >= 0 && used.indexOf(b.id) < 0; });
    return list[S.rng.int(list.length)];
  }

  function floorName(S, f) {
    var F = S.themeKey === 'mix' ? DG.THEMES[S.mixOrder[f % 5]].floors : S.theme.floors;
    var idx = Math.min(F.length - 1, Math.floor(f / Math.max(1, S.floors) * F.length));
    if (f === S.floors - 1) idx = F.length - 1;
    return '地下' + (f + 1) + '階・' + F[idx];
  }

  /* ---------- メイン ---------- */
  function mkHero(S, src, pc, i) {
    var rng = S.rng, env = S.env, scen = HK.SCENARIOS.dungeon;
    var h = {
      i: i, ng: Array.isArray(src.loveNG) ? src.loveNG.filter(function (x) { return x >= 0; }) : [], lock: src.loveLock === '' || src.loveLock == null || isNaN(+src.loveLock) ? null : +src.loveLock, name: src.name, eg: src.eg, memo: src.memo || '', tr: HK.traits(src.eg),
      stats: {}, hp: 100, pleasure: 0, sens: 1, corrupt: 0, climax: 0, dev: {}, curses: [], items: [], outfit: env.outfit, cloth: OUTFIT[env.outfit] || 3,
      gender: src.gender || '', likes: src.likes || '', tone: src.tone || '', fp: src.fp || '', pos: src.pos || '', posLike: src.posLike || '', futa: !!src.futa
    };
    if (HK.charFlags) HK.charFlags(src, h, 'dungeon');
    h.top = HK.egoType(src.eg).top;
    h.reason = clamp(55 + h.eg.A * 1.1 + h.eg.CP * 0.9, 40, 100);
    h.persona = HK.personaOf(h);
    (scen.stats || []).forEach(function (s) { var v = pc.stats && pc.stats[s.id]; h.stats[s.id] = v == null || v === 'random' ? 1 + rng.int(5) : +v; });
    if (env.outfit === 'robe') h.stats.magic = Math.min(5, h.stats.magic + 1);
    function resolve(list, p) {
      if (p && p !== 'auto') for (var k = 0; k < list.length; k++) if (list[k].id === p) return list[k];
      return HK.weighted(rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(h.tr)), 3); });
    }
    h.action = resolve(scen.actions, pc.action); h.goal = resolve(scen.goals, pc.goal);
    h.autoAction = !pc.action || pc.action === 'auto'; h.autoGoal = !pc.goal || pc.goal === 'auto';
    if (h.goal.id === 'curse') { h.curses.push('mark'); h.sens += DG.CURSES.mark.sens; }
    return h;
  }

  /* 陥落の山場：R18版では段落に分けた厚い場面（dungeon-thick.js）。攻めの指定は、魔物を組み伏せる側の場面 */
  function thickFall(S, h) {
    var TH = DG.THICK, TV = window.HK.ThickVM;
    if (window.HK.SAFE_ON || !TH || !TV || S.env.trap < 15) return '';
    /* R18の描写の設定（lewd-unify.js）：数行で短く（混ぜるなら半分）なら段落の場面にしない */
    var X = window.HK.Lewd, cf = X && X.conf('dungeon');
    if (cf && (X.lv(S.env) === 'low' || X.short(S.env, S.rng))) return '';
    /* 女性の体で攻めなら跨る側（ふたなりは男性の体で書く fallTop）。恋愛対象が女性の、女性の挑戦者は女性の魔物に堕とされる（fallFF） */
    var P = window.HK.Pos, fem = P ? P.isF(h) : h.gender === 'f';
    var top = isTop(h), l = top ? (fem && TH.fallTopF ? TH.fallTopF : TH.fallTop) : (TH.fall[S.themeKey] || []).concat(S.themeKey === 'mix' || !TH.fall[S.themeKey] ? TH.fall.any : []);
    if (!top && TH.fall[S.themeKey] && S.rng() < 0.3) l = l.concat(TH.fall.any);
    if (!top && fem && h.likes === 'f' && TH.fallFF) l = (TH.fallFF[S.themeKey] || []).concat(TH.fallFF.any);
    if (!l || !l.length) return '';
    /* 態度ごとの結びを添える */
    var cd = TH.coda && TH.coda[h.persona];
    /* 男性向け：攻めの挑戦者が魔物を組み伏せる場面だけ（堕とされる場面は合意がないので足さない）。濃い：堕ちたあとも続く一段 */
    var ex = '';
    if (cf && top && X.ero(S.env) && TH.fallTopEro && window.HK.Ero) { var d0 = h.eroDom; h.eroDom = true; ex += '\n\n' + window.HK.Ero.fill(S, pick(S, TH.fallTopEro), h); h.eroDom = d0; }
    if (cf && X.high(S.env) && TH.fallAgain) ex += '\n\n' + pick(S, top ? TH.fallAgainTop : TH.fallAgain);
    return fmt(S, TV.voice(S.rng, pick(S, l), h, h) + ex + (cd ? '\n\n' + pick(S, cd) : ''), h.captor || S.lastEv);
  }
  DG.fallHero = function (S, h) {
    if (h.fallLogged) return;
    h.fallLogged = true; h.fallen = true;
    S.h = h;
    var f = DG.pickFall(S);
    h.fallTitle = f.title; h.fallText = fmt(S, f.text, h.captor || S.lastEv);
    var thk = thickFall(S, h);
    var of = say(S, { kind: 'sys', tag: '陥落', text: (thk || line(S, 'fall', h.captor || S.lastEv)) + (S.party.length > 1 && thk ? '\n\n' : '') + (S.party.length > 1 ? fmt(S, pick(S, DG.LINES.fallParty || ['{a}は仲間の呼ぶ声に、もう振り返らなかった。'])) : ''), why: h.name + '：堕ち度 ' + Math.round(h.corrupt) + '・理性 ' + Math.round(Math.max(0, h.reason)) });
    key(S, of, h.name + 'が快楽に堕ちた');
    if (S.party.every(function (x) { return x.fallen; })) S.over = 'fall';
  };

  DG.simulate = function (input) {
    /* 出来事の表は回をまたいで共有しているので、前の回で決めた部位（partNow）を消してから始める（続けて回しても同じシードなら同じ結果に） */
    (DG.pool || []).forEach(function (e) { if (e) delete e.partNow; });
    if (DG.BOSSES) Object.keys(DG.BOSSES).forEach(function (k) { var B = DG.BOSSES[k]; ((B && B.moves) || []).forEach(function (m) { if (m) delete m.partNow; }); });
    var scen = HK.SCENARIOS.dungeon, rng = HK.rng(input.seed);
    var env = {};
    scen.env.forEach(function (e) { env[e.id] = input.env && input.env[e.id] != null ? input.env[e.id] : e.def; });
    env.ct = input.env && input.env.ct != null ? String(input.env.ct) : '';
    var tk = env.theme === 'mix' ? 'mix' : env.theme;
    var S = {
      rng: rng, env: env, log: [], hist: [], turns: [], seen: {}, cause: {}, flags: {},
      themeKey: tk, floors: env.floors, rooms: env.rooms, floor: 0, room: 0, over: null,
      cnt: { traps: 0, avoided: 0, fights: 0, won: 0, items: 0, rescued: 0, seek: 0, edge: 0, cloth: 0, cured: 0, rests: 0, captured: 0, mids: 0, saved: 0, assault: 0 }
    };
    S.mixOrder = rng.shuffle(DG.THEME_KEYS);
    S.recent = []; S.q = [];
    /* 主催者の役（dungeon-host.js）：住人が主催者なら挑戦者から外す（h.i は入力の並びのまま）。なし・モブなら今までどおり */
    var hostI = DG.hostSetup ? DG.hostSetup(S, input) : -1;
    S.party = input.chars.map(function (c, i) { return { c: c, i: i }; }).filter(function (x) { return x.i !== hostI; }).slice(0, 4).map(function (x) { return mkHero(S, x.c, (input.perChar && input.perChar[x.i]) || {}, x.i); });
    S.h = S.party[0];
    S.k = clamp(Math.pow(20 / (S.floors * S.rooms), 0.85), 0.4, 1.3);
    if (tk === 'mix') S.theme = { label: '混成迷宮' };
    else S.theme = { label: DG.THEMES[tk].label, floors: DG.THEMES[tk].floors };
    var used = [], thOf = function (f) { return tk === 'mix' ? S.mixOrder[f % 5] : tk; };
    S.finalBoss = pickBoss(S, thOf(S.floors - 1), ['final', 'both'], used); used.push(S.finalBoss.id);
    S.theme.boss = S.finalBoss.name;
    S.mids = {};
    for (var mf = 1; mf < S.floors - 1; mf += 2) { var mb = pickBoss(S, thOf(mf), ['mid', 'both'], used); if (mb) { S.mids[mf] = mb; used.push(mb.id); } }
    if (DG.partySetup) DG.partySetup(S, input);

    S.floorName = floorName(S, 0);
    var P0 = S.party;
    say(S, { kind: 'sys', tag: '開始', text: P0.length > 1 ? P0.map(function (x) { return x.name; }).join('・') + 'は互いの装備を確かめ合い、' + S.floorName + 'へ踏み込んだ。' : fmt(S, pick(S, DG.LINES.start)) + (S.h.goal.id === 'curse' ? '下腹には淫紋が刻まれている。' : ''), why: P0.map(function (x) { return (P0.length > 1 ? x.name + '：' : '') + '方針「' + x.action.label + '」目標「' + x.goal.label + '」'; }).join('／') });
    if (DG.hostStart) DG.hostStart(S);
    snap(S);

    var budget = S.floors * S.rooms + 16, steps = 0;
    while (!S.over && steps++ < budget) {
      S.mixTheme = S.mixOrder[S.floor % 5];
      S.floorName = floorName(S, S.floor);
      if (S.lastFloorLog !== S.floor) { S.lastFloorLog = S.floor; say(S, { kind: 'step', text: S.floorName }); }
      var act = S.party.filter(function (x) { return !x.fallen; });
      if (!act.length) { S.over = 'fall'; break; }
      /* 呪いの継続効果 */
      act.forEach(function (h) {
        S.h = h;
        if (hasCurse(h, 'heat')) { h.pleasure += 5 * h.sens; climaxCheck(S, null); }
        if (hasCurse(h, 'melt') && rng() < 0.35) { clothDown(S, 1); say(S, { kind: 'sys', tag: '呪い', text: line(S, 'melt'), why: '衣溶けの呪い' }); }
      });
      /* 捕まっている人 */
      act.filter(function (h) { return h.captor; }).forEach(function (h) {
        if (S.over || h.fallen) return;
        S.h = h; roomCaptive(S); S.defer = false; flushQ(S);
        if (settle(S)) DG.fallHero(S, h);
      });
      if (S.over) break;
      var free = S.party.filter(function (x) { return !x.fallen && !x.captor; });
      var caps = S.party.filter(function (x) { return !x.fallen && x.captor; });
      if (caps.length && free.length && DG.partyRescue) DG.partyRescue(S, caps, free);
      free = S.party.filter(function (x) { return !x.fallen && !x.captor; });
      var advance = free.length > 0;
      if (free.length) {
        var h = S.h = HK.weighted(rng, free, function (x) { return 1 + (1 - x.tr.caution) * 0.8 + x.tr.fc * 0.3 + (x.action.id === 'rush' ? 0.4 : 0) + x.corrupt / 120; });
        S.roomHit = null;
        if (S.floor === S.floors - 1 && S.room === S.rooms - 1) roomBoss(S, S.finalBoss, false);
        else if (S.room === S.rooms - 1) { if (S.mids[S.floor]) roomBoss(S, S.mids[S.floor], true); else roomStairs(S); }
        else if (h.action.id === 'rush' && rng() < 0.15) say(S, { kind: 'ev', tag: '通過', text: line(S, 'rush'), why: '一気に駆け抜ける' });
        else {
          var k = roomKind(S);
          var p0 = h.pleasure;
          if (k === 'rest') { if (free.length > 1) { free.forEach(function (x) { if (x !== h) { x.reason += 5 + S.env.mercy / 15; x.pleasure -= 15; x.hp += 15; } }); } roomRest(S); }
          else {
            var ev = pickEv(S, k);
            if (k === 'trap') roomTrap(S, ev);
            else if (k === 'mon') roomMon(S, ev);
            else if (k === 'chest') roomChest(S, ev);
            else if (k === 'spring') roomSpring(S, ev);
            else if (k === 'odd') roomOdd(S, ev);
            else if (k === 'captive') roomCaptiveNpc(S, ev);
            if (h.pleasure - p0 > 6 || h.captor) S.roomHit = { h: h, ev: S.lastEv, gain: h.pleasure - p0 };
          }
          /* 仲間がいれば、ほかの人も同じ部屋で別の罠や魔物に出くわす */
          if (k !== 'rest' && !S.over) free.forEach(function (x) {
            if (x === h || x.fallen || x.captor || S.over || rng() > 0.85) return;
            S.h = x;
            var k2 = HK.weighted(rng, ['trap', 'odd', 'mon', 'chest'], function (q) { return { trap: 0.55, odd: 0.2, mon: 0.18, chest: 0.07 }[q]; });
            var ev2 = pickEv(S, k2), px = x.pleasure;
            if (k2 === 'trap') roomTrap(S, ev2); else if (k2 === 'odd') roomOdd(S, ev2); else if (k2 === 'mon') roomMon(S, ev2); else roomChest(S, ev2);
            S.defer = false; flushQ(S);
            if (!S.roomHit && (x.pleasure - px > 6 || x.captor)) S.roomHit = { h: x, ev: S.lastEv, gain: x.pleasure - px };
            if (settle(S)) DG.fallHero(S, x);
          });
          S.h = h;
        }
        S.defer = false; flushQ(S);
        if (!S.over && DG.partyAfter && S.party.filter(function (x) { return !x.fallen; }).length > 1) { DG.partyAfter(S, h, S.roomHit); S.defer = false; flushQ(S); }
        /* 主催者が見ている・ときどき手を出す（dungeon-host.js。主催者がいなければ何もしない） */
        if (!S.over && S.host && DG.hostRoom) { DG.hostRoom(S, S.roomHit); S.h = h; S.defer = false; flushQ(S); }
      }
      S.party.forEach(function (x) {
        if (x.fallen || S.over) return;
        S.h = x;
        if (settle(S)) { DG.fallHero(S, x); return; }
        useItems(S);
      });
      snap(S);
      if (S.over) break;
      if (advance && S.party.some(function (x) { return !x.fallen && !x.captor; })) {
        S.room++;
        if (S.room >= S.rooms) { S.room = 0; S.floor++; }
        if (S.floor >= S.floors) { S.over = 'clear'; }
      }
    }
    /* 部屋数の上限に達しても終わっていなければ、主の間に辿り着いたことにして最終戦へ。
       捕まっている人は責められながら脱出を試み、抜け出せれば主の間に戻る。踏破か全員陥落のどちらかに必ず収束する */
    if (!S.over) {
      var live0 = S.party.filter(function (x) { return !x.fallen; });
      S.floor = S.floors - 1; S.room = S.rooms - 1; S.floorName = floorName(S, S.floor);
      say(S, { kind: 'step', text: S.floorName });
      S.h = live0.filter(function (x) { return !x.captor; })[0] || live0[0];
      say(S, { kind: 'sys', tag: '最深部', text: fmt(S, pick(S, DG.LINES.reachBoss)), why: '長い探索の果てに、主の間へ' });
      for (var guard = 0; !S.over && guard < 400; guard++) {
        var caps2 = S.party.filter(function (x) { return !x.fallen && x.captor; });
        caps2.forEach(function (h) {
          if (S.over || h.fallen) return;
          S.h = h; roomCaptive(S); S.defer = false; flushQ(S);
          if (settle(S)) DG.fallHero(S, h); else useItems(S);
        });
        if (S.over) break;
        var fr2 = S.party.filter(function (x) { return !x.fallen && !x.captor; });
        if (fr2.length) { S.h = fr2[0]; roomBoss(S, S.finalBoss, false); S.defer = false; flushQ(S); }
        S.party.forEach(function (x) { if (x.fallen || S.over) return; S.h = x; if (settle(S)) DG.fallHero(S, x); });
        snap(S);
        if (!S.over && S.party.every(function (x) { return x.fallen; })) S.over = 'fall';
      }
      if (!S.over) S.over = 'fall';
    }
    /* 堕ち度が100に達して fallen になったのに陥落の場面が書かれていない人（判定だけ通った人）は、ここで書く */
    S.party.forEach(function (x) { if (x.fallen && !x.fallLogged) DG.fallHero(S, x); });
    if (S.over === 'fall') S.party.forEach(function (x) { if (!x.fallLogged) { x.corrupt = Math.max(x.corrupt, 100); DG.fallHero(S, x); } });
    if (S.over === 'clear') S.party.forEach(function (x) { if (!x.fallen && x.captor) { x.captor = null; x.bossCapture = false; x.freedAtEnd = true; } });
    return DG.finish(S, input);
  };

  function snap(S) {
    var a = S.party.map(function (h) { return { r: Math.round(Math.max(0, h.reason)), p: Math.round(h.pleasure), c: Math.round(h.corrupt), hp: Math.round(h.hp) }; });
    S.hist.push({ n: S.log.length, f: S.floor, r: a[0].r, p: a[0].p, c: a[0].c, hp: a[0].hp, hs: a });
  }

  /* ---------- 結果のまとめ ---------- */
  function heroOut(S, h) {
    /* 終わり方は踏破か全員陥落の二つなので、人の結末も「陥落」か「踏破」のどちらか（踏破なら囚われていた人も解放される） */
    var fate = h.fallen ? '陥落' : '踏破';
    return {
      i: h.i, name: h.name, eg: h.eg, memo: h.memo, top: h.top, persona: h.persona, tone: h.tone, stats: h.stats, tr: h.tr,
      action: h.action.label, goal: h.goal.label, goalId: h.goal.id, autoAction: h.autoAction, autoGoal: h.autoGoal,
      reason: Math.max(0, Math.round(h.reason)), pleasure: Math.round(h.pleasure), corrupt: Math.round(h.corrupt), hp: Math.round(h.hp),
      sens: Math.round(h.sens * 100) / 100, climax: h.climax, dev: h.dev, cloth: h.cloth, curses: h.curses.slice(), items: h.items.slice(),
      fate: fate, fallTitle: h.fallTitle || '', fallText: h.fallText || '', hardTop: isTop(h)
    };
  }
  DG.finish = function (S, input) {
    S.h = S.party[0];
    var E = DG.ending(S);
    var heroes = S.party.map(function (h) { return heroOut(S, h); });
    var res = {
      solo: true, scenId: 'dungeon', seed: input.seed, env: S.env, input: input,
      hero: heroes[0], heroes: heroes, party: S.party.length > 1,
      themeLabel: S.theme.label, boss: S.theme.boss, mids: Object.keys(S.mids).map(function (k) { return S.mids[k].name; }),
      reached: S.floor + 1, floors: S.floors, log: S.log, hist: S.hist, turns: S.turns, cnt: S.cnt, cause: S.cause,
      ending: E, advice: DG.advice(S, E), stepCount: S.hist.length - 1, partyNotes: S.partyNotes || []
    };
    res.outcome = E.title;
    res.summary = heroes.map(function (h) { return h.name; }).join('・') + '：' + E.title + (/階）$/.test(E.title) ? '' : '（地下' + Math.min(res.reached, S.floors) + '階）');
    res.chars = heroes.map(function (h) { return { name: h.name, i: h.i }; });
    return res;
  };

  function soloEnding(S, h) {
    var L = [], type = S.over, title, kind;
    var floorTxt = '地下' + (Math.min(S.floor, S.floors - 1) + 1) + '階';
    if (type === 'fall') {
      kind = 'over';
      title = '陥落 ― ' + h.fallTitle + '（' + floorTxt + '）';
      L.push(h.fallText);
    } else {
      kind = 'ok';
      if (h.corrupt < 20 && h.climax === 0) title = '完全踏破 ― 指一本触れさせなかった';
      else if (h.corrupt < 25) title = '踏破（クリア） ― 誇りを守って帰還';
      else if (h.corrupt < 55) title = '踏破（クリア） ― 痕を残して帰還';
      else title = '踏破（クリア） ― 堕ちる寸前の辛勝';
      if (h.freedAtEnd) L.push(S.theme.boss + 'が倒れると、' + h.name + 'を縛っていたものがほどけた。');
      L.push(h.corrupt < 25 ? h.name + 'は' + S.theme.boss + 'を下し、最深部の秘宝を手に地上へ戻った。' :
        h.corrupt < 55 ? h.name + 'は秘宝を持ち帰った。ただ、体に残った熱はまだ引かない。' :
          h.name + 'は秘宝を抱えて地上に出た。陽の光の下で、自分がまだ「戻りたい」と思っていることに気づいて、ぞっとした。');
      if (h.goal.id === 'curse') L.push(!hasCurse(h, 'mark') ? '下腹の淫紋は、跡形もなく消えていた。' : S.theme.boss + 'が倒れると、淫紋の光が薄れた。完全には消えなかった。');
    }
    return { kind: kind, title: title, L: L };
  }

  DG.ending = function (S) {
    var P = S.party, type = S.over, L = [], title, kind;
    if (P.length === 1) {
      var r = soloEnding(S, P[0]); L = r.L; title = r.title; kind = r.kind;
    } else {
      var fell = P.filter(function (x) { return x.fallen; }), live = P.filter(function (x) { return !x.fallen; });
      var nm = function (l) { return l.map(function (x) { return x.name; }).join('・'); };
      if (type === 'fall') { kind = 'over'; title = '陥落 ― 全員が快楽に堕ちた（地下' + (Math.min(S.floor, S.floors - 1) + 1) + '階）'; }
      else {
        var freed = live.filter(function (x) { return x.freedAtEnd; });
        kind = fell.length ? 'mid' : 'ok'; title = fell.length ? '踏破（クリア） ― ' + live.length + '人で帰還（' + fell.length + '人は迷宮に残った）' : '踏破（クリア） ― ' + P.length + '人そろって帰還';
        L.push(nm(live.filter(function (x) { return !x.freedAtEnd; })) + 'は' + S.theme.boss + 'を下し、秘宝を手に地上へ戻った。' + (freed.length ? '主が倒れると、捕らわれていた' + nm(freed) + 'を縛っていたものもほどけた。' : ''));
      }
      fell.forEach(function (x) { L.push(x.name + '：' + (x.fallTitle || '快楽堕ち') + '。' + (x.fallText || x.name + 'は迷宮の甘い熱に呑まれ、仲間の呼ぶ声に振り返らなかった。')); });
      live.forEach(function (x) { if (type !== 'fall') L.push(x.name + '：堕ち度 ' + Math.round(x.corrupt) + '・絶頂 ' + x.climax + '回' + (x.curses.length ? '・呪い「' + x.curses.map(function (c) { return DG.CURSES[c].label; }).join('・') + '」が残った' : '')); });
      (S.partyNotes || []).slice(0, 3).forEach(function (n) { L.push(n); });
    }
    if (S.cnt.rescued) L.push('道中で' + S.cnt.rescued + '人の囚われ人を助けた。');
    if (P.length === 1) {
      var h = P[0];
      if (h.curses.length && type !== 'fall') L.push('残った呪い：' + h.curses.map(function (c) { return DG.CURSES[c].label; }).join('・'));
      if (h.goal.id === 'secret' && type !== 'fall') L.push('「少し興味がある」と言っていた割に、' + (h.corrupt < 40 ? '最後まで踏みとどまった。' : 'しっかり味わって帰ってきた。'));
    }
    return { type: type, kind: kind, title: title, lines: L };
  };

  /* 不足していたもの・効いたもの（いちばん苦しんだ人を中心に） */
  DG.advice = function (S, E) {
    var h = S.party.slice().sort(function (a, b) { return b.corrupt - a.corrupt; })[0], A = [], c = S.cnt;
    var undetected = c.traps - c.seek;
    var nm = S.party.length > 1 ? h.name + 'の' : '';
    if (undetected >= 5 && st(h, 'scout') <= 3) A.push(nm + '罠察知が低め（' + st(h, 'scout') + '）。あと2あれば、発動した罠の多く（' + undetected + '回）を避けられたかもしれない。');
    if (c.fights && c.won / c.fights < 0.5) A.push(nm + '戦闘力（' + st(h, 'fight') + '）が足りず、' + (isTop(h) ? '魔物と' + (c.fights - c.won) + '回もつれ合った。そのたびに組み伏せ返したが、昂りと傷が残った。' : '魔物に' + (c.fights - c.won) + '回組み伏せられた。'));
    if ((S.cause.odd || 0) > 40 && st(h, 'magic') <= 3) A.push(nm + '幻惑への抵抗が弱い。魔力（' + st(h, 'magic') + '）か、A・ドライさがあれば心を守れた。');
    if (c.seek >= 2) A.push('自分から罠に触れた回数：' + c.seek + '回。FCの奔放さが、堕ちてからは仇になった。');
    if (h.climax >= 6 && h.eg.CP < 10) A.push(h.name + 'はCPが低め（' + Math.round(h.eg.CP) + '）で、絶頂のたびに踏ん張りがきかなかった。');
    if (S.party.length > 1) {
      if (c.saved) A.push('仲間が助けに入った回数：' + c.saved + '回。一人なら堕ちていた場面もあった。');
      if (c.assault) A.push('仲間に襲われた回数：' + c.assault + '回。いちばんの罠は、隣にいたのかもしれない。');
    }
    if (E.kind === 'ok') A.push('踏破を支えたのは、' + (h.eg.CP >= h.eg.A ? 'CP（' + Math.round(h.eg.CP) + '）の意地' : 'A（' + Math.round(h.eg.A) + '）の冷静さ') + 'と、理性の残り（' + Math.max(0, Math.round(h.reason)) + '）。');
    if (!A.length) A.push('大きな弱点はなかった。運と迷宮の気まぐれが結末を分けた。');
    return A.slice(0, 5);
  };

  /* ---------- 箱庭として登録 ---------- */
  HK.SCENARIOS.dungeon = {
    id: 'dungeon', name: 'エロトラップダンジョン', kicker: '1〜4人・R18', solo: true, maxCast: 4, minCast: 1,
    desc: '一人〜四人で淫らな罠の迷宮に挑む。堕ち度が満ちた人から快楽に堕ち、全員が堕ちたらゲームオーバー。最深部の主を倒せば踏破。※成人キャラクター向け',
    unit: '部屋', simulate: function (input) { return DG.simulate(input); },
    derived: ['caution', 'impulse', 'cold', 'aggr'],
    env: [
      { id: 'theme', label: '迷宮', type: 'select', def: 'mix', options: [{ v: 'mix', label: '混成迷宮（階ごとに変わる）' }, { v: 'imp', label: '淫魔の城' }, { v: 'slime', label: '粘液の洞窟' }, { v: 'tent', label: '触手の森' }, { v: 'tower', label: '魔術師の塔' }, { v: 'ruin', label: '古代の神殿' }] },
      { id: 'outfit', label: '装備', type: 'select', def: 'light', options: [{ v: 'armor', label: '重装鎧（破れにくいが鈍い）' }, { v: 'light', label: '軽装' }, { v: 'robe', label: '法衣（魔力＋1・薄い）' }, { v: 'thin', label: '布一枚' }] },
      { id: 'floors', label: '階層', min: 3, max: 10, def: 5, lo: '3階', hi: '10階', unit: '階' },
      { id: 'rooms', label: '1階層の部屋数', min: 2, max: 8, def: 3, lo: '3', hi: '8', unit: '部屋' },
      { id: 'trap', label: '罠の淫らさ', min: 0, max: 100, def: 55, lo: 'いたずら程度', hi: '容赦なし', desc: '罠の強さと発動率。高いほど堕ちやすい' },
      { id: 'monsters', label: '魔物の多さ', min: 0, max: 100, def: 50, lo: '少ない', hi: '巣窟' },
      { id: 'mercy', label: '救済', min: 0, max: 100, def: 40, lo: '無慈悲', hi: '手厚い', desc: '休める部屋・癒しの泉・役に立つ道具の出やすさ' }
    ],
    stats: [
      { id: 'fight', label: '戦闘力', desc: '魔物を退ける力。拘束を振りほどく力にも効く' },
      { id: 'scout', label: '罠察知', desc: '罠や擬態を見抜く力' },
      { id: 'magic', label: '魔力', desc: '幻惑・呪いに抗う力' }
    ],
    actions: [
      { id: 'careful', label: '慎重に罠を調べながら進む', fit: function (t) { return t.caution; } },
      { id: 'rush', label: '一気に駆け抜ける', fit: function (t) { return t.impulse * 0.7 + t.aggr * 0.3; } },
      { id: 'loot', label: '宝箱は全部開ける', fit: function (t) { return t.fc * 0.6 + t.impulse * 0.3; } },
      { id: 'stealth', label: '魔物を避けて隠れて進む', fit: function (t) { return t.caution * 0.5 + t.ac * 0.4; } },
      { id: 'fight', label: '魔物は片っ端から倒す', fit: function (t) { return t.aggr * 0.7 + t.cp * 0.3; } }
    ],
    goals: [
      { id: 'treasure', label: '最深部の秘宝を持ち帰る', fit: function (t) { return t.cp * 0.5 + t.lead * 0.4; } },
      { id: 'escape', label: 'とにかく無事に帰る', fit: function (t) { return t.caution * 0.7 + t.ac * 0.2; } },
      { id: 'rescue', label: '囚われた冒険者を助ける', fit: function (t) { return t.np * 0.8; } },
      { id: 'curse', label: '刻まれた淫紋を解く', fit: function (t) { return t.a * 0.5 + t.ac * 0.3; } },
      { id: 'secret', label: '本当は少し興味がある', fit: function (t) { return t.fc * 0.5 + t.honesty * 0.2 + t.ac * 0.2; } }
    ],
    steps: function () { return []; }
  };
  HK.SCEN_ORDER.push('dungeon');
})();
