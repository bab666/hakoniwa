/* 箱庭診断: 小イベントの記述形式（DSL）と、相手の気質で変わる反応の結び
   E(id, cat, scope, weight, when, effects, texts)
   - scope: 'p' 二人 / 'p+' 二人（相手の反応を自動で添える）/ 's' 一人 / 'g' 一人が場全体に働きかける
   - weight: 'np*.6+fc*.3+att/80-ten/60+.2'（a=自分、B.=相手、r=相手→自分の関係、#=追加ステータス）
   - when: 'att>30&ten<20'
   - effects: 'ab:aff4,trust2;ba:aff6;as:-8;bs:5;ahp:-5;bhp:10;food:8;ga:aff2;gab:trust3;sec;jea'
   - texts: '|' 区切り。{a}{b}{c} が名前に置き換わる */
(function () {
  'use strict';
  var HK = window.HK;
  HK.MINI = HK.MINI || {};
  var TR = { cp: 1, np: 1, a: 1, fc: 1, ac: 1, caution: 1, aggr: 1, warmth: 1, honesty: 1, impulse: 1, jealous: 1, lead: 1, cold: 1 };
  var REL = { aff: 1, trust: 1, ten: 1, att: 1 };
  var FACT = { cp: 'CP', np: 'NP', a: 'A', fc: 'FC', ac: 'AC' };

  function val(ctx, a, b, tok) {
    if (/^-?[\d.]+$/.test(tok)) return parseFloat(tok);
    var who = a, t = tok;
    if (t.indexOf('B.') === 0) { who = b; t = t.slice(2); }
    if (!who) return 0;
    if (TR[t]) return who.tr[t];
    if (t.charAt(0) === '#') return ctx.stat(who, t.slice(1));
    if (REL[t]) return b ? ctx.R(a, b)[t] : 0;
    if (t.charAt(0) === 'r' && REL[t.slice(1)]) return b ? ctx.R(b, a)[t.slice(1)] : 0;
    if (t === 'stress') return who.stress;
    if (t === 'hp') return who.hp;
    if (t === 'drunk') return who.flags.drunk || 0;
    if (t === 'aphro') return who.flags.aphro || 0;
    if (t === 'food') return ctx.food || 0;
    if (t === 'step') return ctx.stepIndex;
    if (t === 'n') return ctx.present().length;
    if (t === 'romance') return ctx.env.romance / 100;
    if (t === 'kills') return who.flags.kills || 0;
    if (t === 'rroom') return ctx.flags.romantic ? 1 : 0;
    if (t === 'one') return ctx.flags.isOne ? 1 : 0;
    if (t === 'allies') return b && ctx.pair(a, b).allied ? 1 : 0;
    if (t === 'couple') return b && ctx.pair(a, b).couple ? 1 : 0;
    if (t === 'night') return b && ctx.pair(a, b).night ? 1 : 0;
    if (t === 'pact') return b && (ctx.pair(a, b).pact || ctx.pair(a, b).allied) ? 1 : 0;
    if (t === 'fwb') { return b && HK.Ties && HK.Ties.has(ctx, a, b, 'fwb') ? 1 : 0; }
    if (t === 'love') return b && HK.canLove(a, b) ? 1 : 0;
    if (t === 'leader') return who.flags.leader ? 1 : 0;
    if (t === 'griev') return who.flags.grief != null ? 1 : 0;
    return 0;
  }

  /* 'np*.6+fc*.3-ten/60' を項の配列に */
  function parseExpr(s) {
    var terms = [];
    String(s || '0').replace(/\s/g, '').replace(/([+-]?)([^+-]+)/g, function (m, sign, body) {
      var mul = 1, tok = body, p;
      if ((p = body.indexOf('*')) > 0) { tok = body.slice(0, p); mul = parseFloat(body.slice(p + 1)); }
      else if ((p = body.indexOf('/')) > 0) { tok = body.slice(0, p); mul = 1 / parseFloat(body.slice(p + 1)); }
      terms.push({ tok: tok, mul: sign === '-' ? -mul : mul });
      return m;
    });
    return terms;
  }
  function parseWhen(s) {
    if (!s) return null;
    return s.split('&').map(function (c) {
      var m = c.match(/^([^<>=!]+)(<=|>=|<|>|=)(-?[\d.]+)$/);
      return m ? { tok: m[1], op: m[2], v: parseFloat(m[3]) } : null;
    }).filter(Boolean);
  }
  function parseFx(s) {
    var out = [];
    String(s || '').split(';').forEach(function (part) {
      part = part.trim();
      if (!part) return;
      var i = part.indexOf(':');
      if (i < 0) { out.push({ k: part }); return; }
      var k = part.slice(0, i), body = part.slice(i + 1), d = {};
      if (/^(as|bs|ahp|bhp|food)$/.test(k)) { out.push({ k: k, v: parseFloat(body) }); return; }
      body.split(',').forEach(function (kv) { var m = kv.match(/^([a-z]+)(-?[\d.]+)$/); if (m) d[m[1]] = parseFloat(m[2]); });
      out.push({ k: k, d: d });
    });
    return out;
  }

  function evalTerms(ctx, a, b, terms) {
    var s = 0;
    for (var i = 0; i < terms.length; i++) s += val(ctx, a, b, terms[i].tok) * terms[i].mul;
    return s;
  }

  function why(ctx, a, b, terms) {
    var best = null, bv = 0;
    terms.forEach(function (t) {
      if (t.mul <= 0) return;
      if (/^-?[\d.]+$/.test(t.tok)) return;
      var raw = val(ctx, a, b, t.tok), base = t.tok.replace(/^B\./, '');
      if (TR[base] && raw < 0.5) return;
      if ((REL[base] || REL[base.slice(1)]) && raw < 15) return;
      var v = raw * t.mul;
      if (v > bv) { bv = v; best = t; }
    });
    if (!best) return 'その場の流れ';
    var tok = best.tok, who = a;
    if (tok.indexOf('B.') === 0) { who = b; tok = tok.slice(2); }
    if (!who) return '';
    if (FACT[tok]) return who.name + 'の' + FACT[tok] + '（' + Math.round(who.eg[FACT[tok]]) + '）';
    if (TR[tok]) return who.name + 'の' + HK.TRAIT_NAME[tok] + '（' + Math.round(who.tr[tok] * 100) + '）';
    if (tok.charAt(0) === '#') return who.name + 'の' + statLabel(ctx, tok.slice(1)) + ' ' + ctx.stat(who, tok.slice(1));
    var RN = { aff: '好意', trust: '信頼', ten: '緊張', att: '惹かれ' };
    if (REL[tok] && b) return a.name + 'から' + b.name + 'への' + RN[tok] + '（' + Math.round(ctx.R(a, b)[tok]) + '）';
    if (tok.charAt(0) === 'r' && REL[tok.slice(1)] && b) return b.name + 'から' + a.name + 'への' + RN[tok.slice(1)] + '（' + Math.round(ctx.R(b, a)[tok.slice(1)]) + '）';
    if (tok === 'stress') return who.name + 'の焦り（' + Math.round(who.stress) + '）';
    if (tok === 'drunk') return who.name + 'の酔い';
    if (tok === 'aphro') return who.name + 'に回った媚薬';
    if (tok === 'hp') return who.name + 'の体力';
    return '';
  }
  function statLabel(ctx, id) {
    var s = (ctx.scen.stats || []).filter(function (x) { return x.id === id; })[0];
    return s ? s.label : id;
  }

  /* ---------- 相手の反応（相手のいちばん強い因子で分岐） ---------- */
  HK.TAILS = {
    bond: {
      CP: ['{b}は「ふうん｜ふむ｜そうですか」と言いながら、最後まで聞いていた。', '{b}は腕を組んだまま、それでも最後まで付き合った。', '{b}は呆れた顔をしたが、席は立たなかった。'],
      NP: ['{b}は目を細めて頷いた。', '{b}はそれを嬉しそうに聞いていた。', '{b}は「ありがとう｜感謝する｜ありがとうございます」と、少し照れたように言った。'],
      A: ['{b}は少し考えてから、的確な一言を返した。', '{b}は表情を変えずに、でもちゃんと聞いていた。', '{b}は話の続きを促した。'],
      FC: ['{b}は手を叩いて笑った。', '{b}がすぐに話を広げて、話題は思わぬ方へ転がった。', '{b}は「それな」と身を乗り出した。'],
      AC: ['{b}は遠慮がちに、それでも嬉しそうに笑った。', '{b}は相槌を打ちながら、相手の顔色を窺っていた。', '{b}は何度も頷いた。']
    },
    romance: {
      CP: ['{b}は咳払いでごまかした。', '{b}は「調子に乗らないで｜調子に乗るな｜調子に乗らないでください」と言いながら、目を逸らさなかった。', '{b}の口元が、ほんのわずかに緩んだ。'],
      NP: ['{b}は柔らかく笑い返した。', '{b}はそっと距離を詰めた。', '{b}は「そういうとこ、ずるいよね｜そういうところが、ずるいな｜そういうとこ、ずるいですよね」と笑った。'],
      A: ['{b}は一瞬だけ言葉を探した。', '{b}は平静を装ったが、瞬きの回数が増えていた。', '{b}は何も言わなかったが、離れもしなかった。'],
      FC: ['{b}は声を上げて笑って、やり返した。', '{b}はわざと顔を近づけてきた。', '{b}は「もっと言って｜もっと言え｜もっと言ってください」と冗談めかした。'],
      AC: ['{b}は耳まで赤くなった。', '{b}は俯いて、返事をし損ねた。', '{b}は聞こえなかったふりをした。顔は真っ赤だった。']
    },
    conflict: {
      CP: ['{b}は真正面から睨み返した。', '{b}は「言いたいことがあるなら言って｜言いたいことがあるなら言え｜言いたいことがあるなら言ってください」と低く言った。', '{b}は一歩も引かなかった。'],
      NP: ['{b}は悲しそうに眉を下げた。', '{b}は「何かあった？｜何かあったか｜何かありました？」と逆に気遣った。', '{b}は言い返さずに、ただ受け止めた。'],
      A: ['{b}は淡々と事実だけを指摘し返した。', '{b}は相手にしない、という顔をした。', '{b}は冷静に距離を取った。'],
      FC: ['{b}は即座に言い返した。', '{b}は鼻で笑った。', '{b}は聞こえるように舌打ちした。'],
      AC: ['{b}は黙って俯いた。', '{b}は笑ってごまかしたが、手が震えていた。', '{b}は「ごめん｜すまない｜すみません」と、謝る必要のないことを謝った。']
    },
    help: {
      CP: ['{b}は「別に頼んでない｜別に頼んでいない｜別に頼んでません」と言いつつ、受け取った。', '{b}は礼の代わりに小さく頷いた。', '{b}は少し悔しそうだった。'],
      NP: ['{b}は「次は自分が」と微笑んだ。', '{b}は深く頭を下げた。', '{b}は嬉しそうに受け取った。'],
      A: ['{b}は「助かった｜＝｜助かりました」と短く言った。', '{b}はそのお返しを、頭の中の帳簿につけた。', '{b}は事務的に礼を言ったが、声は柔らかかった。'],
      FC: ['{b}は「最高！｜最高だ｜最高です！」と抱きついた。', '{b}は大げさに感謝して、周りを笑わせた。', '{b}はすっかり元気を取り戻した。'],
      AC: ['{b}は何度も「ごめんね｜すまない｜すみません」と言った。', '{b}は泣きそうな顔で礼を言った。', '{b}は申し訳なさそうに肩をすくめた。']
    }
  };

  HK.TAILS.solo = {
    CP: ['{a}は誰にも弱みを見せなかった。', '{a}の眉間の皺は、しばらく消えなかった。', '{a}は「当然でしょ｜当然だ｜当然です」と自分に言い聞かせた。'],
    NP: ['それでも{a}は、皆の様子を目で追っていた。', '{a}はふと、誰かのことを思い出した。', '{a}は、ほかの誰かの分まで心配していた。', '{a}は、自分より先に相手の心配をしていた。', '{a}の視線は、気づけば相手のほうを向いていた。'],
    A: ['{a}は頭の中で、次の手を三つ考えた。', '{a}の表情からは、何も読み取れなかった。', '{a}は手帳に何かを書きつけた。'],
    FC: ['{a}は鼻歌まじりだった。', '{a}はすぐに飽きて、別のことを始めた。', '{a}は一人で小さく笑った。'],
    AC: ['{a}は誰かに見られていないか、何度も振り返った。', '{a}は小さくため息をついた。', '{a}は、自分のしたことが正しかったのか考え込んだ。']
  };
  function tail(ctx, who, cat, self, text) {
    var T = HK.TAILS[cat];
    if (!T || !who) return '';
    /* 相手がもう台詞で応えているなら、重ねない */
    if (!self && text && text.indexOf(who.name + '「') >= 0) return '';
    /* 場面の種類が分かれば、それに合った反応を使う */
    var sub = HK.tailSub && HK.tailSub(cat, text);
    if (sub && HK.TAILS_SUB && HK.TAILS_SUB[sub]) T = HK.TAILS_SUB[sub];
    var top = HK.voiceTop(who);
    return self ? ctx.t(ctx.pick(T[top]), who) : ctx.t(ctx.pick(T[top]), null, who);
  }

  function applyFx(ctx, a, b, fx) {
    fx.forEach(function (f) {
      switch (f.k) {
        case 'ab': if (b) ctx.mod(a, b, f.d, 1.4); break;
        case 'ba': if (b) ctx.mod(b, a, f.d, 1.4); break;
        case 'as': ctx.stress(a, f.v); break;
        case 'bs': if (b) ctx.stress(b, f.v); break;
        case 'ahp': a.hp = Math.min(100, a.hp + f.v); if (a.hp <= 0) ctx.kill(a, null, ctx.label + 'の出来事で'); break;
        case 'bhp': if (b) { b.hp = Math.min(100, b.hp + f.v); if (b.hp <= 0) ctx.kill(b, null, ctx.label + 'の出来事で'); } break;
        case 'food': ctx.food = Math.max(0, (ctx.food || 0) + f.v); break;
        case 'ga': ctx.others(a).forEach(function (o) { ctx.mod(a, o, f.d); }); break;
        case 'gab': ctx.others(a).forEach(function (o) { ctx.mod(o, a, f.d); }); break;
        case 'sec': if (b) ctx.pair(a, b).secret = true; break;
        case 'jea': if (b) ctx.pair(a, b).jealous++; break;
        case 'couple': if (b) ctx.pair(a, b).couple = true; break;
        case 'nite': if (b) ctx.pair(a, b).night = true; break;
        case 'unnite': if (b) { var pn = ctx.pair(a, b); pn.night = false; pn.wasNight = true; } break;
        case 'brk': if (b) { var pb = ctx.pair(a, b); if (pb.allied || pb.pact) pb.allyBroken = true; pb.allied = false; pb.pact = false; } break;
      }
    });
  }

  var LOVE_TXT = /恋|好きな人|好きか|誰が誰を|付き合って|告白|片想い|本命|デート|キス|ときめ|惹かれ|両想い/;
  function loveTalkOk(ctx, L) {
    if (ctx.scen && ctx.scen.romanceCore) return true;
    if (ctx.env && ctx.env.romance === 0) return false;
    return !L.some(function (x) { return x && x.likes === 'none'; });
  }
  HK.loveTalkOk = loveTalkOk; HK.LOVE_TXT = LOVE_TXT;
  function ageFits(t, a, b) {
    if (/同い年|同じ年/.test(t)) return a.age === b.age;
    if (/\{b\}(?:が|は|の方が|のほうが)年上/.test(t)) return b.age > a.age;
    if (/\{b\}(?:が|は|の方が|のほうが)年下/.test(t)) return b.age < a.age;
    if (/\{a\}(?:が|は|の方が|のほうが)年上/.test(t)) return a.age > b.age;
    if (/\{a\}(?:が|は|の方が|のほうが)年下/.test(t)) return a.age < b.age;
    return true;
  }
  /* DSL → エンジンのイベント形式 */
  HK.E = function (id, cat, scope, w, when, fx, texts) {
    var terms = parseExpr(w), conds = parseWhen(when), effects = parseFx(fx);
    var list = String(texts).split('|');
    var sc = scope.charAt(0) === 'p' ? 'pair' : 'solo';
    var GRP = /皆|全員|みんな|何人か|周り|周囲|誰か|一同|クラス中|教室中|ほかの誰|他の誰|誰も/;
    var allGroup = list.every(function (t) { return GRP.test(t.replace(/\{[a-z]+\}/g, '')); });
    var tcat = cat === 'romance' || cat === 'conflict' || cat === 'help' ? cat : 'bond';
    /* 恋の話の文（恋バナ・告白・片想いなど）。恋愛の起こりやすさが0か、恋愛対象「なし」の人がいるときは使わない */
    var loveOnly = list.every(function (t) { return LOVE_TXT.test(t); }), hasLove = list.some(function (t) { return LOVE_TXT.test(t); });
    var withTail = scope === 'p+', selfTail = scope === 's+';
    /* 嫉妬の出来事（jea）：関係「執着なし」の相手には嫉妬しない。嫉妬は執着度に積もる（obsess-kit.js） */
    var jea = effects.some(function (f) { return f.k === 'jea'; });
    if (jea) { var c0 = conds; conds = (c0 || []).concat([{ jea: 1 }]); }
    /* 恋人になる出来事（couple）：複数の恋人の設定（poly.js）で、恋人にしてよい組か、乗り換えの気持ちが育った組だけ */
    if (effects.some(function (f) { return f.k === 'couple'; })) conds = (conds || []).concat([{ cpl: 1 }]);
    /* 体の関係の出来事（nite：夜を過ごす）。恋愛相手の固定と別に、性行為の相手の固定「誰とでも可」で通す（engine.js の romanceOk） */
    var sexEv = effects.some(function (f) { return f.k === 'nite'; });
    return {
      id: id, cat: cat, scope: sc, mini: true, sex: sexEv || undefined,
      when: conds ? function (ctx, a, b) {
        for (var i = 0; i < conds.length; i++) {
          if (conds[i].jea) { if (b && HK.Obsess && !HK.Obsess.jealOk(ctx, a, b)) return false; continue; }
          if (conds[i].cpl) { if (b && HK.Poly && !HK.Poly.canTry(ctx, a, b)) return false; continue; }
          var v = val(ctx, a, b, conds[i].tok), c = conds[i];
          if (c.op === '>' && !(v > c.v)) return false;
          if (c.op === '<' && !(v < c.v)) return false;
          if (c.op === '>=' && !(v >= c.v)) return false;
          if (c.op === '<=' && !(v <= c.v)) return false;
          if (c.op === '=' && v !== c.v) return false;
        }
        return true;
      } : null,
      w: function (ctx, a, b) { if ((scope === 'g' || allGroup) && ctx.present().length < 3) return 0; if (loveOnly && !loveTalkOk(ctx, [a, b])) return 0; return Math.max(0, evalTerms(ctx, a, b, terms)); },
      run: function (ctx, a, b) {
        applyFx(ctx, a, b, effects);
        if (jea && b && HK.Obsess) HK.Obsess.feed(ctx, a, b, 4);
        var c = null;
        if (list.some(function (t) { return t.indexOf('{c}') >= 0; })) {
          var pool = ctx.others(a).filter(function (o) { return o !== b; });
          c = pool.length ? ctx.pick(pool) : null;
        }
        var cand = c ? list : list.filter(function (t) { return t.indexOf('{c}') < 0; });
        if (hasLove && !loveTalkOk(ctx, [a, b, c])) { var nl = cand.filter(function (t) { return !LOVE_TXT.test(t); }); if (nl.length) cand = nl; }
        /* 年齢が決まっている二人なら、「同い年」「年上」の文は実際の年齢に合うものだけ */
        if (b && a.age && b.age) { var ag = cand.filter(function (t) { return ageFits(t, a, b); }); if (ag.length) cand = ag; else return null; }
        var text = ctx.t(ctx.pick(cand.length ? cand : list), a, b, c);
        if (withTail && b && ctx.rng() < 0.55) text += tail(ctx, b, tcat, false, text);
        if (selfTail && ctx.rng() < 0.5) text += tail(ctx, a, 'solo', true);
        return { text: text, why: why(ctx, a, b, terms), with: c ? [c] : null };
      }
    };
  };

  /* 登録（ファイルごとに HK.addMini('goukon', [...]) ） */
  HK.addMini = function (scenId, list) {
    HK.MINI[scenId] = (HK.MINI[scenId] || []).concat(list);
  };
})();
