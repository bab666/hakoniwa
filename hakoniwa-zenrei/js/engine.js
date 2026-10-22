/* 箱庭診断 engine: シミュレーション本体・戦闘・関係の判定 */
(function () {
  'use strict';
  var HK = window.HK;

  HK.CAT_NAME = {
    romance: '恋愛', bond: '交流', help: '献身', conflict: '対立', combat: '戦闘',
    betray: '裏切り', solo: '単独行動', escape: '脱出', phase: '状況', death: '死亡'
  };
  HK.EXPECT = {
    CP: ['conflict', 'combat', 'lead'], NP: ['help'], A: ['solo', 'escape'],
    FC: ['bond', 'romance'], AC: ['bond', 'help', 'solo']
  };

  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  HK.pairKey = key;

  function Ctx(input) {
    var self = this;
    this.input = input;
    this.scen = HK.SCENARIOS[input.scenId];
    this.seed = input.seed;
    this.rng = HK.rng(input.seed);
    this.env = {};
    var defs = this.scen.env.concat(HK.GLOBAL_ENV);
    defs.forEach(function (e) {
      self.env[e.id] = input.env && input.env[e.id] != null ? input.env[e.id] : e.def;
    });
    this.chaos = this.env.chaos / 100;
    this.log = [];
    this.history = [];
    this.pf = {};
    this.flags = {};
    this.stepIndex = 0;
    this.label = '';
    this.chars = input.chars.map(function (c, i) {
      var pc = (input.perChar && input.perChar[i]) || {};
      return {
        i: i, name: c.name, eg: c.eg, tr: HK.traits(c.eg), memo: c.memo || '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', posLike: c.posLike || '', lock: c.loveLock == null || c.loveLock === '' || isNaN(+c.loveLock) ? null : +c.loveLock, call: c.call || '', calls: c.calls || null, keigo: c.keigo || null,
        hp: 100, alive: true, out: false, stress: 0,
        stats: {}, statsRaw: pc.stats || {}, weaponPick: pc.weapon || 'random',
        actionPick: pc.action || 'auto', goalPick: pc.goal || 'auto', role: pc.role || '', pick: pc.pick || {},
        action: null, goal: null, focus: null, flags: {},
        cats: {}, odd: [], diedAt: null, killedBy: null, fate: '', fateNote: ''
      };
    });
    this.chars.forEach(function (c) { c.persona = HK.personaOf(c); });
    this.rel = this.chars.map(function () { return []; });
  }

  Ctx.prototype.R = function (a, b) { return this.rel[a.i][b.i]; };
  /* 性別と恋愛対象（未設定なら制限なし） */
  /* どちらかが別の相手に恋愛を決めている組か */
  HK.lockBlocks = function (a, b) { return !!(a && b && ((a.lock != null && a.lock !== b.i) || (b.lock != null && b.lock !== a.i))); };
  HK.canLove = function (a, b) {
    /* 恋愛相手を決めた人は、その相手以外とは恋愛しない（相手が箱庭にいなければ誰とも） */
    if (a && b && a.lock != null && a.lock !== b.i) return false;
    if (a.role === 'teacher' || b.role === 'teacher') return false;
    if (!a.likes || a.likes === 'both') return true;
    if (a.likes === 'none') return false;
    if (!b.gender || b.gender === 'x') return true;
    return a.likes === b.gender;
  };
  Ctx.prototype.pair = function (a, b) {
    var k = key(a, b);
    if (!this.pf[k]) this.pf[k] = { moments: [], attacks: {}, confessed: {}, jealous: 0, kill: null, couple: false, night: false, secret: false, base: null };
    return this.pf[k];
  };
  Ctx.prototype.present = function () { return this.chars.filter(function (c) { return c.alive && !c.out; }); };
  Ctx.prototype.alive = function () { return this.chars.filter(function (c) { return c.alive; }); };
  /* 同じ場にいる相手（箱庭が場所を持つときは、その箱庭が決める） */
  Ctx.prototype.others = function (a) { if (this.scen.othersFor) return this.scen.othersFor(this, a); return this.present().filter(function (c) { return c !== a; }); };
  /* 二人きりのときは「皆」「誰か」など第三者を前提にした文を避ける */
  var GROUP_RE = /皆|全員|みんな|何人か|周り|周囲|誰か|一同|クラス中|教室中|ほかの誰|他の誰|誰も/;
  Ctx.prototype.pick = function (arr) {
    if (arr && arr.length > 1 && typeof arr[0] === 'string' && this.present().length <= 2) {
      var f = arr.filter(function (t) { return !GROUP_RE.test(t.replace(/\{[a-z]+\}/g, '')); });
      if (f.length) arr = f;
    }
    /* 同じ文がすぐに繰り返されないよう、最近使った文はできるだけ避ける */
    var r = this._recent || (this._recent = []), t = this.rng.pick(arr);
    if (arr && arr.length > 1 && typeof t === 'string') {
      for (var i = 0; i < 4 && r.indexOf(t) >= 0; i++) t = this.rng.pick(arr);
      r.push(t); if (r.length > 40) r.shift();
    }
    return t;
  };
  Ctx.prototype.few = function () { return this.present().length <= 2; };

  var LIM = { aff: [-100, 100], trust: [-100, 100], ten: [0, 100], att: [0, 100] };
  Ctx.prototype.mod = function (a, b, d, scale) {
    if (!a || !b || a === b) return;
    var r = this.R(a, b), k = (this.k || 1) * (scale == null ? 1 : scale);
    var pf = this.pair(a, b);
    for (var f in d) {
      if (!LIM[f]) continue;
      var before = r[f], m = 1;
      if (f === 'att' && d[f] > 0) m = pf.chem;
      if (f === 'ten' && d[f] > 0) m = pf.fric;
      if (d[f] > 0 && HK.Ties && this.ties) m *= HK.Ties.mult(this, a, b, f);
      if (f === 'att' && d[f] > 0 && !HK.canLove(a, b)) m *= a.lock != null && a.lock !== b.i ? 0 : 0.08;
      /* 血のつながった家族：惹かれは育たず、信頼は減りにくく底がある */
      if (pf.kin && f === 'att' && d[f] > 0) m = 0;
      if (pf.kin && f === 'trust' && d[f] < 0) m *= 0.25;
      r[f] = HK.clamp(r[f] + d[f] * k * m, LIM[f][0], LIM[f][1]);
      if (pf.trustFloor && f === 'trust' && r[f] < pf.trustFloor) r[f] = Math.max(r[f], Math.min(before, pf.trustFloor));
      this._mag += Math.abs(r[f] - before);
    }
    this._touched[key(a, b)] = [a, b];
  };
  Ctx.prototype.mod2 = function (a, b, dab, dba, scale) { this.mod(a, b, dab, scale); this.mod(b, a, dba, scale); };
  Ctx.prototype.stress = function (a, v) { a.stress = HK.clamp(a.stress + v * (this.k || 1), 0, 100); };

  Ctx.prototype.t = function (str, a, b, c) {
    var self = this;
    return str.replace(/\{(a|b|c|wa|wb|step|place)\}/g, function (m, p) {
      if (p === 'a') return a ? a.name : '';
      if (p === 'b') return b ? b.name : '';
      if (p === 'c') return c ? c.name : '';
      if (p === 'wa') return a && a.weapon ? a.weapon.name : '素手';
      if (p === 'wb') return b && b.weapon ? b.weapon.name : '素手';
      if (p === 'step') return self.label;
      if (p === 'place') return self.place || '';
      return m;
    });
  };

  /* aが最も惹かれている相手（いなければnull） */
  Ctx.prototype.crush = function (a, min) {
    var best = null, bv = min == null ? 60 : min, self = this;
    /* 恋愛の起こりやすさが0、または恋愛対象が「なし」・合わない相手は、片想いの相手にならない（仲がいいだけの友達を恋の相手にしない） */
    if (this.env && this.env.romance === 0 && !(this.scen && this.scen.romanceCore)) return null;
    this.chars.forEach(function (c) {
      if (c === a || !c.alive || !HK.canLove(a, c) || self.pair(a, c).kin) return;
      var r = self.R(a, c), v = r.aff * 0.6 + r.att;
      if (v > bv) { bv = v; best = c; }
    });
    return best;
  };
  Ctx.prototype.closest = function (a) {
    var best = null, bv = -999, self = this;
    this.others(a).forEach(function (c) { var r = self.R(a, c); var v = r.aff + r.trust * 0.5; if (v > bv) { bv = v; best = c; } });
    return best;
  };

  Ctx.prototype.bias = function (a, cat) {
    var m = 1;
    if (a.action && a.action.bias && a.action.bias[cat] != null) m *= a.action.bias[cat];
    if (a.goal && a.goal.bias && a.goal.bias[cat] != null) m *= a.goal.bias[cat];
    if (cat === 'romance') m *= this.env.romance === 0 && !this.scen.romanceCore ? 0 : 0.3 + this.env.romance / 50 * 0.7;
    if (cat === 'conflict' || cat === 'combat' || cat === 'betray') m *= 0.3 + this.env.strife / 50 * 0.7;
    if (this.scen.catBias && this.scen.catBias[cat] != null) m *= this.scen.catBias[cat];
    return m;
  };
  Ctx.prototype.stat = function (a, id) { return a.stats[id] == null ? 3 : a.stats[id]; };

  Ctx.prototype.say = function (o) {
    /* 恋愛が起きない組の恋愛の出来事は、記録に残さない（呼び出し側が e.n などを使えるよう、空の出来事を返す） */
    if (o.cat === 'romance' && o.kind !== 'phase' && !this.romanceOk(o.actors)) return { n: this.log.length, step: this.stepIndex, cat: 'romance', actors: [], text: '', mag: 0, kind: 'event', skipped: true };
    var e = {
      n: this.log.length, step: this.stepIndex, label: this.label, cat: o.cat || 'phase',
      actors: (o.actors || []).map(function (c) { return c.i; }), text: o.text, why: o.why || '',
      odd: !!o.odd, mag: o.mag || 0, kind: o.kind || 'phase'
    };
    this.log.push(e);
    return e;
  };

  Ctx.prototype.flush = function () {
    var p = this.pending || [];
    this.pending = [];
    for (var i = 0; i < p.length; i++) this.say(p[i]);
  };

  /* 出来事の中で一人ずつの反応を記録する。o: {actors, cat, text|fn→text, why, fx, mag, k} */
  /* 恋愛の出来事を起こしてよいか：恋愛の起こりやすさが0、恋愛対象が「なし」・合わない人どうしでは起こさない（もう恋人どうしの二人は別） */
  Ctx.prototype.romanceOk = function (actors) {
    var L = (actors || []).filter(Boolean), a = L[0], b = L[1];
    if (this.scen && this.scen.romanceCore) return true;
    if (a && b && this.pair(a, b).kin) return false;
    if (a && b && this.pair(a, b).couple) return true;
    if (this.env && this.env.romance === 0) return false;
    if (a && b) return HK.canLove(a, b) && HK.canLove(b, a);
    return !(a && a.likes === 'none');
  };
  Ctx.prototype.act2 = function (o) {
    if (o.cat === 'romance' && !this.romanceOk(o.actors)) return null;
    this.k = o.k || (0.8 + this.rng() * 0.4);
    this._mag = 0; this._touched = {};
    var r = o.fx ? o.fx() : null;
    var text = typeof o.text === 'function' ? o.text(r) : o.text;
    var why = typeof o.why === 'function' ? o.why(r) : o.why;
    if (!text) { this.flush(); return null; }
    var actors = (o.actors || []).filter(Boolean);
    var e = this.say({ kind: 'event', cat: o.cat || 'bond', actors: actors, text: text, why: why || '', mag: this._mag + (o.mag || 0), odd: !!o.odd });
    if (actors[0]) actors[0].cats[e.cat] = (actors[0].cats[e.cat] || 0) + 1;
    if (o.odd && actors[0]) actors[0].odd.push(e.n);
    for (var kk in this._touched) { var pr = this._touched[kk]; this.pair(pr[0], pr[1]).moments.push({ n: e.n, mag: e.mag }); }
    this.flush();
    return e;
  };
  /* 気質スコアが最大の人（同点はランダム寄り） */
  Ctx.prototype.most = function (list, fn) {
    var best = null, bv = -1e9, rng = this.rng;
    list.forEach(function (c) { var v = fn(c) + rng() * 0.15; if (v > bv) { bv = v; best = c; } });
    return best;
  };
  Ctx.prototype.incident = function (label) {
    this.say({ kind: 'phase', cat: 'phase', text: label, mag: 0 });
  };

  /* ---------- 死亡・戦闘 ---------- */
  Ctx.prototype.kill = function (v, killer, how) {
    if (!v.alive) return;
    var self = this;
    v.alive = false; v.hp = 0; v.diedAt = this.stepIndex; v.killedBy = killer ? killer.i : null;
    v.fate = '死亡';
    v.deathLabel = this.label; v.deathHow = how || '';
    v.fateNote = this.label + '、' + (killer ? killer.name + 'の手で' : '') + (how || '命を落とした');
    if (killer) {
      var p = this.pair(v, killer);
      p.kill = { by: killer.i, victim: v.i };
      killer.flags.kills = (killer.flags.kills || 0) + 1;
    }
    this.pending = this.pending || [];
    this.pending.push({ kind: 'death', cat: 'death', actors: killer ? [v, killer] : [v], text: v.name + '　死亡' + (killer ? '（' + killer.name + '）' : '') + '　―― ' + (how || ''), mag: 60 });
    this.chars.forEach(function (o) {
      if (!o.alive || o === v) return;
      var r = self.R(o, v);
      if (r.aff > 35) {
        o.stress = HK.clamp(o.stress + r.aff * 0.5, 0, 100);
        o.flags.grief = v.i;
        if (killer && killer !== o) {
          var rk = self.R(o, killer);
          rk.ten = HK.clamp(rk.ten + r.aff * 0.7, 0, 100);
          rk.aff = HK.clamp(rk.aff - r.aff * 0.5, -100, 100);
          o.flags.revenge = killer.i;
        }
      }
    });
  };

  Ctx.prototype.power = function (x) {
    var w = x.weapon ? x.weapon.pow : 0;
    return w * 6 + this.stat(x, 'hp') * 5 + this.stat(x, 'agi') * 4 + x.tr.aggr * 15 + x.tr.a * 10 + x.hp * 0.1;
  };

  /* a が b を襲う。結果テキストを返す */
  Ctx.prototype.fight = function (a, b, opt) {
    opt = opt || {};
    var rng = this.rng, spread = 25 + this.chaos * 45;
    var p = this.pair(a, b);
    p.attacks[a.i] = (p.attacks[a.i] || 0) + 1;
    if (!opt.noEvade && b.tr.caution * rng() > 0.55) {
      this.mod(b, a, { ten: 20, trust: -25, aff: -10 });
      return { escaped: true, text: this.t(rng.pick(['{b}は{a}の気配に先に気づき、身を翻して逃げ切った。', '{a}の一撃は空を切った。{b}は茂みの奥へ消えた。']), a, b), why: b.name + 'の慎重さ（A・AC由来）が初動を読んだ' };
    }
    var pa = this.power(a) + rng() * spread + (opt.ambush ? 15 : 0);
    var pb = this.power(b) + rng() * spread;
    var win = pa >= pb ? a : b, lose = win === a ? b : a;
    var dmg = (opt.lethality || 1) * (22 + Math.abs(pa - pb) * 0.6 + (win.weapon ? win.weapon.pow * 3 : 0));
    lose.hp -= dmg;
    this.mod2(a, b, { ten: 25, aff: -15, trust: -20 }, { ten: 35, aff: -25, trust: -40 });
    var res = { winner: win, loser: lose, upset: win === b, dmg: dmg };
    var wpn = win.weapon ? win.weapon.name : '素手';
    if (lose.hp <= 0) {
      var r = this.R(win, lose);
      var mercy = win.tr.np * 0.7 + Math.max(0, r.aff) / 100 + (win.goal && win.goal.id === 'nokill' ? 0.8 : 0) - (win.goal && win.goal.id === 'last' ? 0.5 : 0)
        + (win.tol != null ? (0.45 - win.tol) * 0.6 : 0);   /* 生い立ち（deathgame-kit.js）：人の死に慣れていないほど、とどめをためらう */
      if (opt.canSpare !== false && mercy > rng() * 1.4) {
        lose.hp = 6;
        this.mod2(lose, win, { aff: 30, ten: -15, trust: 15 }, { aff: 10 });
        res.spared = true;
        res.text = win.name + 'は' + wpn + 'を振り上げたまま止まった。' + lose.name + 'にとどめは刺されなかった。';
        res.why = win.name + 'のNP（' + Math.round(win.eg.NP) + '）' + (r.aff > 20 ? 'と' + lose.name + 'への情' : '') + 'が手を止めた' + (win.life === 'peace' ? '（人の死と無縁に生きてきた手が震えた）' : '');
      } else {
        res.killed = true;
        res.text = (res.upset ? '返り討ちだった。' : '') + win.name + 'の' + wpn + 'が' + lose.name + 'を捉えた。';
        res.why = win.name + 'の攻撃性（' + Math.round(win.tr.aggr * 100) + '）と武器「' + wpn + '」' + (res.upset ? '、そして運' : '');
        this.kill(lose, win, wpn + 'による致命傷');
      }
    } else {
      res.text = win.name + 'が競り勝ち、' + lose.name + 'は手傷を負って退いた。（残り体力 ' + Math.max(0, Math.round(lose.hp)) + '）';
      res.why = '戦力差 ' + Math.round(Math.abs(pa - pb)) + '（武器・体力・攻撃性・冷静さ＋乱数）';
    }
    return res;
  };

  /* ---------- メイン ---------- */
  HK.simulate = function (input) {
    var sc0 = HK.SCENARIOS[input.scenId];
    if (sc0 && sc0.simulate) return sc0.simulate(input);
    var ctx = new Ctx(input), scen = ctx.scen, rng = ctx.rng;
    var C = ctx.chars;

    /* 追加ステータス */
    C.forEach(function (c) {
      (scen.stats || []).forEach(function (s) {
        var v = c.statsRaw[s.id];
        c.stats[s.id] = v == null || v === 'random' ? 1 + rng.int(5) : +v;
      });
    });
    /* 行動・目標（おまかせは気質から） */
    function resolve(list, pick, c) {
      if (pick && pick !== 'auto') { for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i]; }
      return HK.weighted(rng, list, function (o) { var f = o.fit ? o.fit(c.tr) : 0.3; return Math.pow(Math.max(0.02, f), 3); });
    }
    C.forEach(function (c) {
      c.action = resolve(scen.actions, c.actionPick, c);
      c.goal = resolve(scen.goals, c.goalPick, c);
      c.autoAction = c.actionPick === 'auto';
      c.autoGoal = c.goalPick === 'auto';
    });
    /* 初期関係 */
    C.forEach(function (a) {
      C.forEach(function (b) {
        if (a === b) { ctx.rel[a.i][b.i] = null; return; }
        var bc = HK.baseCompat(a, b);
        var pre = (scen.preRel || 0);
        ctx.rel[a.i][b.i] = {
          aff: HK.clamp(bc.aff * 0.35 + pre + (rng() - 0.5) * 16, -100, 100),
          trust: HK.clamp(pre * 0.6 + (rng() - 0.5) * 10, -100, 100),
          ten: HK.clamp(bc.ten * 0.3 + rng() * 6, 0, 100),
          att: HK.clamp((bc.att * 0.25 + rng() * 8) * (HK.canLove(a, b) ? 1 : 0.1), 0, 100)
        };
        if (a.i < b.i) {
          var pp = ctx.pair(a, b);
          pp.base = bc;
          pp.chem = HK.clamp(0.15 + bc.att / 40 + rng() * 1.0, 0.15, 1.7);
          pp.fric = HK.clamp(0.55 + bc.ten / 60 + rng() * 0.6, 0.4, 1.6);
        }
      });
    });
    if (HK.Ties) HK.Ties.apply(ctx, input.ties);
    ctx.chars.forEach(function (a) { if (a.lock == null) return; ctx.chars.forEach(function (b) { if (b !== a && b.i !== a.lock) { var r = ctx.R(a, b); r.att = Math.min(r.att, 6); } }); });
    C.forEach(function (c) {
      if (c.goal && c.goal.needsFocus) {
        var best = HK.Ties ? HK.Ties.focusFor(ctx, c) : null, bv = -999;
        if (!best) C.forEach(function (o) { if (o === c) return; var v = ctx.R(c, o).aff + rng() * 20; if (v > bv) { bv = v; best = o; } });
        c.focus = best;
      }
    });
    if (scen.setup) scen.setup(ctx);

    var labels = scen.steps(ctx.env);
    var pool = HK.buildPool(scen);

    for (var s = 0; s < labels.length; s++) {
      ctx.stepIndex = s; ctx.label = labels[s];
      ctx.say({ kind: 'step', cat: 'phase', text: labels[s] });
      if (scen.phase) scen.phase(ctx, s, labels.length);
      ctx.flush();
      runIncident(ctx, s, labels.length);
      var actors = rng.shuffle(ctx.present());
      var p = Math.min(1, (6.5 + Math.max(0, actors.length - 8) * 0.45) / Math.max(1, actors.length));
      p *= scen.actRate || 1;
      for (var ai = 0; ai < actors.length; ai++) {
        var a = actors[ai];
        if (!a.alive || a.out || a.flags.down || a.mad) continue;
        if (rng() > p) continue;
        act(ctx, a, pool);
      }
      if (scen.after) scen.after(ctx, s, labels.length);
      ctx.flush();
      if (scen.factions && HK.Factions) { HK.Factions.step(ctx, s, labels.length); ctx.flush(); }
      C.forEach(function (c) { if (c.alive) c.stress = HK.clamp(c.stress - 3, 0, 100); });
      var dec = scen.decay || 0.95;
      C.forEach(function (x) { C.forEach(function (y) { var r = ctx.rel[x.i][y.i]; if (r) { r.att *= dec; r.ten *= (dec + 1) / 2; } }); });
      snapshot(ctx);
      if (scen.end && scen.end(ctx, s, labels.length)) break;
    }
    if (scen.finish) scen.finish(ctx);
    ctx.flush();
    C.forEach(function (c) { if (!c.fate) c.fate = c.alive ? '生存' : '死亡'; });
    return finalize(ctx);
  };

  /* 箱庭全体に起きる出来事（js/incidents-*.js） */
  function runIncident(ctx, s, n) {
    var list = (HK.INCIDENTS && HK.INCIDENTS[ctx.scen.id]) || [];
    if (!list.length || ctx.present().length < 1) return;
    var rng = ctx.rng, rate = ctx.env.incident / 100;
    var forced = list.filter(function (x) { return x.force && (x.once === false || !ctx.flags['inc_' + x.id]) && ctx.present().length >= (x.min || 1) && x.force(ctx, s, n); });
    var inc = forced[0];
    if (!inc) {
      if (s === 0 || rng() > rate * 0.75) return;
      var ok = list.filter(function (x) {
        if (x.force) return false;
        if (x.once !== false && ctx.flags['inc_' + x.id]) return false;
        if (ctx.present().length < (x.min || 2)) return false;
        if (x.from != null && s < x.from) return false;
        return !x.when || x.when(ctx, s, n);
      });
      inc = HK.weighted(rng, ok, function (x) { return x.w ? x.w(ctx, s, n) : 1; });
    }
    if (!inc) return;
    ctx.flags['inc_' + inc.id] = (ctx.flags['inc_' + inc.id] || 0) + 1;
    inc.run(ctx, s, n);
    ctx.flush();
  }

  function snapshot(ctx) {
    var snap = {};
    var C = ctx.chars;
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) {
      var ab = ctx.rel[i][j], ba = ctx.rel[j][i];
      snap[i + '-' + j] = [ab.aff, ba.aff, (ab.ten + ba.ten) / 2, ab.att, ba.att];
    }
    ctx.history.push({ step: ctx.stepIndex, label: ctx.label, rel: snap, alive: C.map(function (c) { return c.alive && !c.out; }) });
  }

  function act(ctx, a, pool) {
    var rng = ctx.rng, others = ctx.others(a), b = null;
    if (others.length) {
      b = HK.weighted(rng, others, function (o) {
        var r = ctx.R(a, o);
        var w = 1 + (Math.abs(r.aff) + r.ten + r.att) / 55;
        if (a.focus === o) w += 2.5;
        if (a.flags.revenge === o.i) w += 3;
        if (ctx.fac && ctx.fac.of[a.i] != null && ctx.fac.of[a.i] === ctx.fac.of[o.i]) w += 1;
        if (HK.Ties) w += HK.Ties.pull(ctx, a, o);
        return w;
      });
    }
    var cands = [], sum = 0, sumCore = 0, sumMini = 0;
    pool.forEach(function (e) {
      if (e.scope === 'pair' && !b) return;
      var bb = e.scope === 'pair' ? b : null;
      if (e.when && !e.when(ctx, a, bb)) return;
      if (e.cat === 'romance' && bb && a.lock != null && a.lock !== bb.i) return;
      if (e.cat === 'romance' && !ctx.romanceOk(bb ? [a, bb] : [a])) return;
      var w = e.w(ctx, a, bb);
      if (!(w > 0)) return;
      w *= ctx.bias(a, e.cat);
      if (bb && HK.Ties) w *= HK.Ties.bias(ctx, a, bb, e.cat);
      if (w <= 0) return;
      if (e.pri) w *= (ctx.scen.priBoost || 2.4);
      cands.push({ e: e, w: w, b: bb });
      if (e.mini && !e.sig) sumMini += w; else if (!e.pri && !e.mini) sumCore += w;
    });
    if (!cands.length) return;
    /* 小イベントは数が多いので、全体の重みを汎用イベントと同程度に揃える */
    if (sumMini > 0) {
      var k = sumCore > 0 ? (sumCore * (ctx.scen.miniShare || 1.1)) / sumMini : 1;
      cands.forEach(function (c) { if (c.e.mini && !c.e.sig) c.w *= k; });
    }
    /* 「らしくない」の基準は、箱庭の進行役のイベント（pri）を除いた中での最大の重み */
    var maxW = 0, maxAll = 0;
    cands.forEach(function (c) { sum += c.w; if (c.w > maxAll) maxAll = c.w; if (!c.e.pri && c.w > maxW) maxW = c.w; });
    if (!maxW) maxW = maxAll;
    var mean = sum / cands.length, ch = ctx.chaos * 0.55;
    var pick = HK.weighted(rng, cands, function (c) { return c.w * (1 - ch) + mean * ch; });
    /* 「らしくない」：その人にとって起こりにくい行動（重みが平均の2割未満、かつ最大の1割未満）を、
       環境の揺らぎやストレスで選んだとき。気質と関係のない出来事（noOdd）は数えない */
    var odd = cands.length > 3 && !pick.e.pri && !pick.e.noOdd && pick.w < maxW * (pick.e.mini ? 0.055 : 0.16) && pick.w < mean * (pick.e.mini ? 0.3 : 0.45);
    ctx.k = HK.clamp(1 + (rng() - 0.5) * (0.5 + ctx.chaos), 0.3, 2);
    ctx._mag = 0; ctx._touched = {};
    var res = pick.e.run(ctx, a, pick.b);
    if (!res) return;
    var cat = res.cat || pick.e.cat;
    /* 出来事の側で恋愛に変わったときも、恋愛が起きない組なら書かない */
    if (cat === 'romance' && !ctx.romanceOk(pick.b ? [a, pick.b] : [a])) return;
    var actors = [a];
    if (pick.b) actors.push(pick.b);
    if (res.with) res.with.forEach(function (x) { if (actors.indexOf(x) < 0) actors.push(x); });
    if (res.odd) odd = true;
    var e = ctx.say({ kind: 'event', cat: cat, actors: actors, text: res.text, why: res.why, odd: odd, mag: ctx._mag + (res.mag || 0) });
    a.cats[cat] = (a.cats[cat] || 0) + 1;
    if (odd) a.odd.push(e.n);
    ctx.flush();
    for (var k in ctx._touched) {
      var pr = ctx._touched[k];
      ctx.pair(pr[0], pr[1]).moments.push({ n: e.n, mag: e.mag });
    }
  }

  /* ---------- 結果のまとめ ---------- */
  HK.LABELS = {
    kill: { name: '殺害', cls: 'kill', pol: -2 },
    mutualkill: { name: '殺し合い', cls: 'kill', pol: -2 },
    lovers: { name: '恋人', cls: 'love', pol: 2 },
    pining: { name: '両片想い', cls: 'love', pol: 2 },
    night: { name: '一夜の関係', cls: 'night', pol: 1 },
    vague: { name: '曖昧な関係', cls: 'night', pol: 1 },
    oneway: { name: '片想い', cls: 'pine', pol: 0 },
    lovehate: { name: '愛憎', cls: 'obsess', pol: 0 },
    rivals: { name: '宿敵', cls: 'enemy', pol: -2 },
    accomplice: { name: '共犯', cls: 'partner', pol: 1 },
    partners: { name: '相棒', cls: 'partner', pol: 2 },
    guard: { name: '庇護と依存', cls: 'guard', pol: 1 },
    obsess: { name: '執着', cls: 'obsess', pol: 0 },
    breakup: { name: '破局', cls: 'enemy', pol: -1 },
    friends: { name: '友人', cls: 'friend', pol: 1 },
    awkward: { name: '気まずい', cls: 'enemy', pol: -1 },
    dislike: { name: '嫌悪', cls: 'enemy', pol: -1 },
    strangers: { name: '他人のまま', cls: 'none', pol: 0 },
    kinbond: { name: '家族の絆', cls: 'partner', pol: 2 },
    kinfeud: { name: '確執', cls: 'enemy', pol: -1 },
    fwbend: { name: '関係解消', cls: 'enemy', pol: -1 },
    allybreak: { name: '同盟決裂', cls: 'enemy', pol: -1 }
  };

  function classify(ctx, A, B, pf) {
    var ab = ctx.R(A, B), ba = ctx.R(B, A);
    var love = function (r) { return r.aff > 38 && r.att > 42; };
    var dir = null;
    if (ctx.scen.classifyFirst) { var sf = ctx.scen.classifyFirst(ctx, A, B, pf); if (sf) return sf; }
    if (pf.kill) {
      var both = (pf.attacks[A.i] || 0) > 0 && (pf.attacks[B.i] || 0) > 0;
      return { id: both ? 'mutualkill' : 'kill', dir: pf.kill.by };
    }
    if (ctx.scen.classify) { var sc = ctx.scen.classify(ctx, A, B, pf); if (sc) return sc; }
    var tie = HK.Ties ? HK.Ties.get(ctx, A, B) : null, TD = tie ? HK.TIES[tie.type] : null;
    if (TD && TD.family && !(TD.loveOK && ab.att > 28 && ba.att > 28)) {
      var tenF = (ab.ten + ba.ten) / 2;
      if ((tenF > 55 && (ab.aff + ba.aff) / 2 < 30) || ab.aff < -10 || ba.aff < -10) return { id: 'kinfeud' };
      if (ab.aff > 40 && ba.aff > 40) return { id: 'kinbond' };
      if (Math.abs(ab.trust - ba.trust) > 28 && Math.max(ab.trust, ba.trust) > 45) return { id: 'guard', dir: ab.trust > ba.trust ? A.i : B.i };
      if (pf.secret && ab.trust > 28 && ba.trust > 28) return { id: 'accomplice' };
      if (ab.aff > 22 && ba.aff > 22) return { id: 'kinbond' };
      return { id: tenF > 30 ? 'awkward' : 'strangers' };
    }
    if (pf.allyBroken && !pf.couple) return { id: 'allybreak' };
    if (HK.Ties && HK.Ties.has(ctx, A, B, 'fwb') && !pf.couple && ((ab.aff + ba.aff) / 2 < 5 || (ab.ten + ba.ten) / 2 > 55)) return { id: 'fwbend' };
    if (pf.couple && (ab.aff < 0 || ba.aff < 0 || ab.ten > 70 || ba.ten > 70)) return { id: 'breakup' };
    if (pf.couple) return { id: 'lovers' };
    if (pf.fwb) return { id: 'fwbsettle' };
    if (love(ab) && love(ba)) return { id: pf.night ? 'lovers' : 'pining' };
    if (pf.night) return { id: (ab.aff + ba.aff) / 2 > 20 ? 'vague' : 'night' };
    if (love(ab) !== love(ba)) { dir = love(ab) ? A.i : B.i; return { id: 'oneway', dir: dir }; }
    var ten = (ab.ten + ba.ten) / 2, aff = (ab.aff + ba.aff) / 2;
    if (ten > 45 && (aff > 22 || ab.att > 48 || ba.att > 48)) return { id: 'lovehate' };
    if (ab.ten > 48 && ba.ten > 48) return { id: 'rivals' };
    if (pf.secret && ab.trust > 28 && ba.trust > 28) return { id: 'accomplice' };
    if (ab.aff > 38 && ba.aff > 38 && ab.trust > 38 && ba.trust > 38) return { id: 'partners' };
    if (Math.abs(ab.trust - ba.trust) > 28 && Math.max(ab.trust, ba.trust) > 45 && Math.min(ab.aff, ba.aff) > 20) {
      return { id: 'guard', dir: ab.trust > ba.trust ? A.i : B.i };
    }
    if ((ab.aff > 52 && ab.trust < 8) || (ba.aff > 52 && ba.trust < 8) || pf.jealous >= 2) {
      return { id: 'obsess', dir: ab.aff - ab.trust > ba.aff - ba.trust ? A.i : B.i };
    }
    if (ab.aff > 24 && ba.aff > 24) return { id: 'friends' };
    if (aff < -22) return { id: 'dislike' };
    if (ten > 34) return { id: 'awkward' };
    return { id: 'strangers' };
  }

  function pairText(ctx, A, B, cl) {
    if (ctx.scen.pairText) { var st = ctx.scen.pairText(ctx, A, B, cl); if (st) return st; }
    var n = function (i) { return ctx.chars[i].name; };
    var other = function (i) { return i === A.i ? B.name : A.name; };
    switch (cl.id) {
      case 'kill': return n(cl.dir) + 'が' + other(cl.dir) + 'を殺した。';
      case 'mutualkill': return '互いに刃を向け合い、最後は' + n(cl.dir) + 'が' + other(cl.dir) + 'の命を奪った。';
      case 'lovers': return A.name + 'と' + B.name + 'は恋人として落ち着いた。';
      case 'breakup': return '恋人だった二人の間に、もう戻れない溝ができた。';
      case 'pining': return '互いに惹かれているのに、どちらも決定的な言葉を口にしなかった。';
      case 'night': return '一線は越えたが、気持ちまでは追いつかなかった。';
      case 'vague': return '体の距離が先に縮み、名前のつかない関係になった。';
      case 'oneway': return n(cl.dir) + 'から' + other(cl.dir) + 'への片想い。';
      case 'lovehate': return '惹かれる気持ちと苛立ちが同じだけ育った。';
      case 'rivals': return '最後まで譲らず、互いを敵と認めた。';
      case 'accomplice': return '二人だけの秘密を抱え、共犯関係になった。';
      case 'partners': return '背中を預け合える相棒になった。';
      case 'guard': return n(cl.dir) + 'が' + other(cl.dir) + 'に寄りかかり、' + other(cl.dir) + 'がそれを受け止める形に収まった。';
      case 'obsess': return n(cl.dir) + 'の想いが、信頼を置き去りにして膨らんだ。';
      case 'friends': return '気負わず話せる友人になった。';
      case 'awkward': return '小さな衝突が残り、ぎこちない距離のまま終わった。';
      case 'dislike': return 'はっきりと相手を嫌うようになった。';
      case 'kinbond': return '家族として、互いを支え合う形に落ち着いた。';
      case 'kinfeud': return '血のつながりがあるからこそ、こじれた溝が埋まらなかった。';
      case 'fwbsettle': return '恋人にはならないまま、体だけの関係に落ち着いた。';
      case 'fwbend': return '体だけの関係は、どちらからともなく終わった。';
      case 'allybreak': return '組んだはずの同盟は、最後に決裂した。';
      default: return '特に深く関わらないまま終わった。';
    }
  }

  function finalize(ctx) {
    var C = ctx.chars, pairs = [];
    var POS = { clash: -1, friction: -1, spark: 1, warm: 1, flat: 0 };
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) {
      var A = C[i], B = C[j], pf = ctx.pair(A, B);
      var cl = classify(ctx, A, B, pf);
      var L = HK.LABELS[cl.id];
      var ab = ctx.R(A, B), ba = ctx.R(B, A);
      var finalScore = (ab.aff + ba.aff) / 2 + (ab.att + ba.att) / 4 - (ab.ten + ba.ten) / 2 * 0.8;
      var pred = POS[pf.base.kind];
      var tie = pf.tie ? { type: pf.tie.type, label: HK.TIES[pf.tie.type].label, a: pf.tie.a, b: pf.tie.b, pol: HK.TIES[pf.tie.type].pol } : null;
      if (tie) pred = tie.pol > 0 ? 1 : tie.pol < 0 ? -1 : 0;
      var surprise = 0;
      if (tie) {
        if (pred > 0 && L.pol <= -1) surprise = 2;
        else if (pred < 0 && L.pol >= 1) surprise = 2;
        else if (pred === 0 && Math.abs(L.pol) === 2 && cl.id !== 'lovers') surprise = 1;
        if (tie.type === 'lover' && ['lovers', 'bonded', 'fatedmate'].indexOf(cl.id) < 0) surprise = Math.max(surprise, 1);
      }
      else if (pred > 0 && L.pol <= -1 && pf.base.score > 12) surprise = 2;
      else if (pred < 0 && L.pol >= 1 && pf.base.score < -8) surprise = 2;
      else if (pred === 0 && Math.abs(L.pol) === 2 && pf.moments.length >= 3) surprise = 1;
      var moments = pf.moments.slice().sort(function (x, y) { return y.mag - x.mag; });
      var seen = {}, top = [];
      moments.forEach(function (m) { if (!seen[m.n] && top.length < 3) { seen[m.n] = 1; top.push(m.n); } });
      top.sort(function (x, y) { return x - y; });
      var series = ctx.history.map(function (h) { return h.rel[i + '-' + j]; });
      pairs.push({
        a: i, b: j, label: cl.id, dir: cl.dir, name: L.name, cls: L.cls, text: pairText(ctx, A, B, cl),
        base: pf.base, surprise: surprise, key: top, series: series, finalScore: finalScore,
        intensity: Math.abs(ab.aff) + Math.abs(ba.aff) + ab.ten + ba.ten + ab.att + ba.att,
        rel: { ab: round(ab), ba: round(ba) }, count: pf.moments.length, tie: tie
      });
    }
    pairs.sort(function (x, y) { return (y.surprise - x.surprise) || (y.intensity - x.intensity); });
    var chars = C.map(function (c) { return charSummary(ctx, c); });
    return {
      seed: ctx.seed, scenId: ctx.input.scenId, scenName: ctx.scen.name, env: ctx.env,
      log: ctx.log, history: ctx.history, pairs: pairs, chars: chars,
      stepCount: ctx.history.length, outcome: ctx.flags.outcome || '',
      end: { room: ctx.scen.id === 'whiteroom' ? roomInfo(ctx) : null, notes: ctx.flags.endNotes || [], cases: ctx.flags.cases || [], exits: ctx.flags.exits || [], together: ctx.flags.together || [], radio: !!ctx.flags.radio, raft: ctx.flags.raftCrew || null, oneOut: !!ctx.flags.oneOut, plan: ctx.flags.plan || 0, isl: ctx.isl || null, omega: ctx.flags.omega || null, zombie: ctx.flags.zombie || null },
      factions: ctx.scen.factions ? { hist: ctx.facHist || [], min: ctx.env.faction, final: ctx.fac || null } : null
    };
  }

  function roomInfo(ctx) {
    var K = HK.ROOM_KINDS;
    return {
      label: ctx.flags.roomLabel,
      consumed: (ctx.rules || []).filter(function (r) { return K[r.k].type === 'consume'; }).map(function (r) {
        var by = [];
        Object.keys(ctx.flags.drank || {}).forEach(function (i) { var n = ctx.flags.drank[i][r.k]; if (n) by.push({ i: +i, n: n }); });
        by.sort(function (a, b) { return b.n - a.n; });
        return { item: K[r.k].item, unit: K[r.k].unit, n: r.n, total: ctx.flags.consumed[r.k] || 0, by: by };
      })
    };
  }

  function round(r) { return { aff: Math.round(r.aff), trust: Math.round(r.trust), ten: Math.round(r.ten), att: Math.round(r.att) }; }

  function charSummary(ctx, c) {
    var C = ctx.chars, notes = [];
    var cats = Object.keys(c.cats).sort(function (x, y) { return c.cats[y] - c.cats[x]; });
    var t = HK.egoType(c.eg);
    if (cats.length) {
      var top = cats[0], exp = HK.EXPECT[t.top] || [];
      if (exp.indexOf(top) < 0 && c.cats[top] >= 2) {
        notes.push('エゴグラムでは' + t.top + '優位（' + HK.FACTOR_HIGH[t.top] + '）なのに、この箱庭では「' + HK.CAT_NAME[top] + '」に最も多く動いた。状況が別の面を引き出している。');
      } else {
        notes.push('行動の重心は「' + HK.CAT_NAME[top] + '」。' + t.top + '優位の気質（' + HK.FACTOR_HIGH[t.top] + '）がそのまま出た。');
      }
    }
    var maxOut = null, mo = -999, maxIn = null, mi = -999, fear = null, fv = 30;
    C.forEach(function (o) {
      if (o === c) return;
      var out = ctx.R(c, o), inn = ctx.R(o, c);
      if (out.aff + out.att * 0.6 > mo) { mo = out.aff + out.att * 0.6; maxOut = o; }
      if (inn.aff + inn.att * 0.6 > mi) { mi = inn.aff + inn.att * 0.6; maxIn = o; }
      if (out.ten > fv) { fv = out.ten; fear = o; }
    });
    if (maxOut && maxIn && maxOut !== maxIn && mo > 25 && mi > 25) {
      notes.push(c.name + 'が最も心を寄せたのは' + maxOut.name + 'だが、' + c.name + 'を最も想っていたのは' + maxIn.name + 'だった。');
    } else if (maxOut && mo > 25) {
      notes.push('最も心を寄せた相手は' + maxOut.name + (maxOut === maxIn ? '。想いは向こうからも返ってきていた。' : '。'));
    }
    if (fear) notes.push('最も神経を尖らせていた相手は' + fear.name + '（緊張 ' + Math.round(fv) + '）。');
    if (ctx.scen.factions && HK.Factions) { var fn = HK.Factions.noteFor(ctx, c); if (fn) notes.unshift(fn); }
    if (ctx.scen.charNote) { var cn = ctx.scen.charNote(ctx, c); if (cn) notes.unshift(cn); }
    if (c.autoAction || c.autoGoal) {
      notes.push('おまかせで選ばれた初動は「' + c.action.label + '」、目標は「' + c.goal.label + '」。');
    }
    return {
      i: c.i, name: c.name, eg: c.eg, tr: c.tr, memo: c.memo, persona: c.persona, type: t.code + '（' + t.label + '）' + (HK.PERSONA[c.persona] ? '・口調「' + (HK.toneLabel ? HK.toneLabel(c) : HK.PERSONA[c.persona].label) + '」' : ''),
      action: c.action.label, goal: c.goal.label, stats: c.stats, weapon: c.weapon ? c.weapon.name : null,
      fate: c.fate, fateNote: c.fateNote, alive: c.alive, hp: Math.max(0, Math.round(c.hp)),
      cats: c.cats, odd: c.odd.slice(0, 3), notes: notes, focus: c.focus ? c.focus.i : null,
      kills: c.flags.kills || 0, deathLabel: c.deathLabel || null, deathHow: c.deathHow || '', killedBy: c.killedBy,
      leader: !!c.flags.leader, aphro: !!c.flags.aphro, outLabel: c.outLabel || null
    };
  }
})();
