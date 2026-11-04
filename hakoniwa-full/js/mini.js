/* 箱庭診断: 小イベントの記述形式（DSL）と、相手の気質で変わる反応の結び
   E(id, cat, scope, weight, when, effects, texts)
   - scope: 'p' 二人 / 'p+' 二人（相手の反応を自動で添える）/ 's' 一人 / 'g' 一人が場全体に働きかける
   - weight: 'np*.6+fc*.3+att/80-ten/60+.2'（a=自分、B.=相手、r=相手→自分の関係、#=追加ステータス）
   - when: 'att>30&ten<20'
   - effects: 'ab:aff4,trust2;ba:aff6;as:-8;bs:5;ahp:-5;bhp:10;food:8;ga:aff2;gab:trust3;sec;jea'
   - texts: '|' 区切り。{a}{b}{c} が名前に置き換わる */
/* @event-ok 関係ごとの分岐（展開の不整合。2026-10-31 担当RC） */
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
  /* 問いへの反応：文の終わりが {a} の問い（「…？」と訊いた・「…？」で終わる）なら、相手の反応は「答える」形にする（2026-10-29 担当MN）。
     上の反応（「最後まで聞いていた」「もっと言って、と冗談めかした」など）は話や行動への反応なので、問いのあとに置くと会話が噛み合わない。
     問いの中身を問わずに通じる、答え方・はぐらかし方だけを書く（相手のいちばん強い因子で分岐） */
  HK.TAILS_Q = {
    CP: ['{b}は少し間を置いてから、短く答えた。', '{b}は「さあね｜さあな｜さあ、どうでしょう」とはぐらかした。', '{b}は答えをはぐらかして、肩をすくめた。'],
    NP: ['{b}は少し考えてから、丁寧に答えた。', '{b}は笑って、ちゃんと答えた。', '{b}は相手の顔を見て、正直に答えた。'],
    A: ['{b}は少し考えてから、短く答えた。', '{b}は表情を変えずに、簡潔に答えた。', '{b}は一瞬だけ言葉を探してから、答えた。'],
    FC: ['{b}は即答した。', '{b}は冗談で返して、それから本当のことを答えた。', '{b}は「それ聞く？｜それを聞くか｜それ、聞きます？」と笑ってから答えた。'],
    AC: ['{b}は少し迷ってから、小さな声で答えた。', '{b}は答えに詰まって、目を泳がせた。', '{b}は俯いたまま、ぽつりと答えた。']
  };
  /* 文の終わりが問いなら、答える人を返す：a が訊いた →'b'、a が訊かれた（受け身。「{a}は{b}に「…？」と訊かれた」）→'a'。
     b が訊いた文、名前「 の形で相手がもう答えている文、問いで終わらない文は ''（今までどおりの反応） */
  var Q_END = /[？?]」(?:と[^。「」]{0,16}(?:訊|尋ね|聞)いた)?。?$/, Q_PASS = /[？?]」と[^。「」]{0,16}(?:訊|尋ね|聞)(?:か|ね)れた。?$/;
  function askEnd(text, a, b) {
    if (!text || !a || !b || text.indexOf(b.name + '「') >= 0) return '';
    var pass = Q_PASS.test(text);
    if (!pass && !Q_END.test(text)) return '';
    var qi = text.lastIndexOf('「'), st = text.lastIndexOf('。', qi) + 1, sen = text.slice(st, qi);
    if (sen.indexOf(b.name + 'は') >= 0 && sen.indexOf(a.name + 'は') < 0) return '';
    if (!(sen.indexOf(a.name) >= 0 || sen === '')) return '';
    return pass ? 'a' : 'b';
  }
  HK.askEnd = askEnd;
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
  /* 関係に合わない前提の文（2026-10-30 担当W1。利用者の報告：親子なのに「友達じゃいられなくなるかも」的な話が入る）：
     ・友達の前提（ずっと友達・友達のまま・友達に戻れない など）は、家族（親子・擬似親子・きょうだい・親族）か恋人どうしの組には使わない
     ・「付き合ってもいない」の前提は、恋人どうし（箱庭の中で恋人になった組・恋人の関係）には使わない */
  var FRIEND_TXT = /ずっとも|ずっと友|友達(?:じゃ|では|で|に|の)(?:いられ|戻れ|まま)|友人(?:では|で|に|の)(?:いられ|戻れ|まま)/, UNPAIRED_TXT = /付き合って(?:も)?いない|付き合ってない/;
  /* 家族の組には、二人を友人として扱う文（「親友の{b}」「友人として」など）も使わない（2026-11-04 の利用者の指示：親子・血縁を友人にしない）。
     第三者の友人（「友達に会う」「友人の声」など）は数えない（点検 kin-label-audit.js と同じ考え方） */
  var KIN_FR_TXT = /親友(?!のよう|や幼馴染のよう)|友人(?!の(?:声|家|結婚)|に会|と会|と長電話|「)|友達(?!に会|と会|と遊|と飲|の家|から|に誘|にも教え|を一人)|友だち/;
  var FAM_TIES = ['parent', 'pparent', 'sibling', 'sibprot', 'sibclose', 'twin', 'sibbad', 'stepsib', 'relative'], LOVE_TIES = ['lover', 'spouse', 'mate', 'fiance', 'fated'];
  function tieAny(ctx, a, b, l) { return !!(HK.Ties && HK.Ties.has && ctx.ties) && l.some(function (t) { return HK.Ties.has(ctx, a, b, t); }); }
  /* 閉じ込められた部屋（出られない部屋）で、目覚めの区切りよりあとに「初めまして」「名前、なんて呼べばいい？」などの出会いの文を出さない（2026-10-31 担当RC。
     利用者の報告：殺さないと出られない部屋の二人で、部屋の後半に出会いの文が出る） */
  var FIRSTMEET_TXT = /初めまして|はじめまして|名前(?:くらい)?(?:を)?教え合|名前、なんて呼べば|名前、なんと呼べば|なんとお呼びすれば|名前は、何と呼べば|名前は、なんと呼べば|自己紹介|名乗り合|会ったばかり/;
  function sealedLate(ctx) { return !!(ctx && ctx.scen && (ctx.scen.id === 'whiteroom' || ctx.scen.sealedRoom) && ctx.stepIndex >= 1); }
  function relFits(ctx, t, a, b) {
    if (FIRSTMEET_TXT.test(t) && sealedLate(ctx)) return false;
    if (!b) return true;
    var fr = FRIEND_TXT.test(t), un = UNPAIRED_TXT.test(t);
    if (REL_ANY.test(t) && !relTextFits(relClass(ctx, a, b), t)) return false;
    if (KIN_FR_TXT.test(t) && tieAny(ctx, a, b, FAM_TIES)) return false;
    if (!fr && !un) return true;
    var cp = !!ctx.pair(a, b).couple || tieAny(ctx, a, b, LOVE_TIES);
    if (un && cp) return false;
    if (fr && (cp || tieAny(ctx, a, b, FAM_TIES))) return false;
    return true;
  }
  /* 知らない人どうし／知り合いどうし／混在 の展開の不整合（2026-10-31 担当RC。利用者の報告：出られない部屋で、家族なのに連絡先を交換する。
     設計と判定の表は docs/reports/2026-10-31/rel-consistency.md、点検は hakoniwa-tools/tone-check/relcons-audit.js）
     ・relClass：二人の関係のまとめ。none（関係なし）／weak（知人）／fam（家族。擬似親子は pfam）／spouse（夫婦）／lover（恋人・婚約者・番）／
       work（同僚・上司・先輩後輩）／school（同級生・教師・師弟）／ex（元恋人）／known（そのほか：友人・幼馴染・親友 など）。執着なし・運命の番は数えない
     ・MEET_TXT（初対面・連絡先・また会えたら）は関係のある組（知人を除く）に、WARM_TXT（部屋で初めて打ち解けた・初めて知り合う人への質問。2026-10-31 担当CL：「こんな場所でなければ話さなかった昔の話」「将来なりたいものを初めて話した」「家族は何人」も）は家族・夫婦・恋人に、
       KNOWN_TXT（昔からの知り合いの前提）は関係のない組に、NEWCP_TXT（部屋で出会って付き合い始めた前提）は恋人・夫婦・家族に、
       HOME_TXT（別々の家に帰る）は夫婦に、OUT_TXT（会釈・どこに住んでいるのか などの他人行儀）は家族・夫婦に、WORKQ_TXT（仕事を尋ねる）は同じ職場の組に使わない。relFits がこの表でも見る（HK.E の出来事は自動で外れる）。ほかの箱庭の部品は HK.relFilter で候補を絞る */
  var REL_CLS = { parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'pfam',
    spouse: 'spouse', lover: 'lover', fiance: 'lover', mate: 'lover', colleague: 'work', boss: 'work', senpai: 'work', classmate: 'school', teacher: 'school', mentor: 'school', ex: 'ex', acq: 'weak' };
  var REL_SKIP = { noobs: 1, fated: 1 }, REL_ORDER = ['spouse', 'fam', 'pfam', 'lover', 'ex', 'work', 'school', 'known', 'weak'];
  function relClass(ctx, a, b) {
    if (!b || !HK.Ties || !HK.Ties.all || !ctx.ties) return 'none';
    var best = 'none', tl = HK.Ties.all(ctx, a, b);
    /* 物語の箱庭（邪神村など。HK.Story の S）は ctx.tiesAll を持たないので、配役の関係（ctx.ties：{a, b, type}）から直接拾う（2026-10-31 担当CL） */
    if (!ctx.tiesAll && Array.isArray(ctx.ties) && a && b) tl = ctx.ties.filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); });
    tl.forEach(function (t) {
      if (!t || REL_SKIP[t.type]) return;
      var c = REL_CLS[t.type] || (t.like && REL_CLS[t.like]) || 'known';
      /* 夫婦は ties.js で恋人（spouse の印つき）に直る。別居中は恋人と同じ扱い（同じ家に帰らない）、離婚は元恋人 */
      if (t.spouse && c === 'lover') c = t.married === 'separated' ? 'lover' : 'spouse';
      if (best === 'none' || REL_ORDER.indexOf(c) < REL_ORDER.indexOf(best)) best = c;
    });
    return best;
  }
  var MEET_TXT = /初めまして|はじめまして|名前、なんて呼べば|名前、なんと呼べば|なんとお呼びすれば|名前(?:くらい)?(?:を)?教え合|初対面|見知らぬ(?:誰か|相手|人|者|他人)|赤の他人|名前も知らな|名前しか知らな|名前を知っているだけ|名前のほかは|互いのことを(?:ほとんど|何も|よく)知らな|会ったばかりの|連絡先を(?:交換(?!し直)|聞|訊|教え|渡)|連絡先(?:だけ|も交換)|互いの連絡先|全員の連絡先|住所を(?:聞|訊|教え|交換)|また会えたら|またどこかで|今度、?ご飯でも|名刺を(?:渡|交換|差し出)/;
  var WARM_TXT = /すっかり打ち解け|打ち解けていた|仲間になった気が|話すほど、相手の考え方|こんな顔で話す人だった|本当の名前を教え|名前を教え合|(?:子ども|子供)の頃の夢(?:って|は)|好きな食べ物(?:って|は)何|休みの日は何(?:して|を)|どんな人が(?:タイプ|好み)|どんな人に惹かれ|出身はどこ|こんな場所でなければ、?話さなかった|昔の話をした。誰にも話したことのない|将来なりたいものを初めて|家族は何人|(?:きょうだい|兄弟)(?:、|は)いる|ご兄弟は/;
  var KNOWN_TXT = /久しぶりに会(?!え)|久しぶりだな|卒業以来|何年ぶり|昔から(?:の知り合い|知って)|(?:子ども|子供|幼い|小さい)(?:の)?頃から(?:知って|一緒|の仲|の付き合い|の知り合い)|昔みたいに|家に帰ったら|また家で|うちに帰ったら|同じ家に帰/;
  var NEWCP_TXT = /馴れ初め|付き合い始めた(?:という|らしい|って)|付き合うことになっ|二人が付き合い|恋人(?:になった|同士になった|どうしになった)|改めて待ち合わせ|それからも会うようになっ|初めてのデート|条件(?:じゃ|で)なくても、またしたい/;
  var HOME_TXT = /家まで送|それぞれの家|別々の家|上がっていく|家に帰ったら会えな|家の前で別れ|うちに来(?:て|い)|うちにいらして|一番近い[^。]{0,8}の部屋|次の約束を口に/;
  var OUT_TXT = /会釈|他人行儀に|どこに住んで|何の仕事を|お仕事は|ご職業/, WORKQ_TXT = /どこで働い|何の仕事を|お仕事は|ご職業|職場はどこ/;
  var REL_ANY = new RegExp([MEET_TXT, WARM_TXT, KNOWN_TXT, NEWCP_TXT, HOME_TXT, OUT_TXT, WORKQ_TXT].map(function (r) { return r.source; }).join('|'));
  function relTextFits(c, t) {
    if (c === 'none') return !KNOWN_TXT.test(t);
    if (c !== 'weak' && MEET_TXT.test(t)) return false;
    if ((c === 'fam' || c === 'pfam' || c === 'spouse' || c === 'lover') && WARM_TXT.test(t)) return false;
    if ((c === 'fam' || c === 'spouse' || c === 'lover') && NEWCP_TXT.test(t)) return false;
    if (c === 'spouse' && HOME_TXT.test(t)) return false;
    if ((c === 'fam' || c === 'pfam' || c === 'spouse') && OUT_TXT.test(t)) return false;
    if (c === 'work' && WORKQ_TXT.test(t)) return false;
    return true;
  }
  /* 三人以上（{G}）の文：関係のない組が一つもなければ初対面の文を外し、関係のある組が一つもなければ知り合い前提の文を外す */
  function relGroupFits(ctx, g, t) {
    if (!g || g.length < 2 || !REL_ANY.test(t)) return true;
    var cs = [];
    for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) cs.push(relClass(ctx, g[i], g[j]));
    var allKnown = cs.every(function (c) { return c !== 'none' && c !== 'weak'; }), noneKnown = cs.every(function (c) { return c === 'none'; });
    if (allKnown && MEET_TXT.test(t)) return false;
    if (noneKnown && KNOWN_TXT.test(t)) return false;
    return true;
  }
  /* 候補の文の並びを、二人の関係に合うものに絞る（全部外れたら空の配列） */
  function relFilter(ctx, list, a, b) {
    if (!list || !b) return list;
    var c = relClass(ctx, a, b);
    var late = sealedLate(ctx);
    return list.filter(function (t) { return !(late && FIRSTMEET_TXT.test(t)) && (!REL_ANY.test(t) || relTextFits(c, t)); });
  }
  /* 二人だけの配役（場にいるのがいつも二人以下）の記録に、居合わせた第三者の文（周りが割って入った・居合わせた人たち など）を出さない（2026-10-31 担当RC。
     利用者の報告：殺さないと出られない部屋の二人で、閉じ込められているにしては不整合な文が目立つ）。engine.js が結果をまとめるとき、地の文から一文ごとに外す
     （台詞の文と、外すと何も残らない文は残す）。ctx を渡したときは、場にいるのが二人以下のときだけ外す */
  var BYSTAND_TXT = /周り(?:が|は|の誰か|の人|のほう)|居合わせた人|周囲(?:が|の人)/;
  function dropBystand(ctx, t) {
    if (typeof t !== 'string' || !BYSTAND_TXT.test(t) || (ctx && (!ctx.present || ctx.present().length > 2))) return t;
    var ss = [], cur = '', d = 0;
    for (var i = 0; i < t.length; i++) { var ch = t.charAt(i); cur += ch; if (ch === '「') d++; else if (ch === '」') d = Math.max(0, d - 1); if (ch === '。' && d === 0) { ss.push(cur); cur = ''; } }
    if (cur) ss.push(cur);
    var keep = ss.filter(function (x) { return x.indexOf('「') >= 0 || !BYSTAND_TXT.test(x); });
    return keep.length && keep.length < ss.length ? keep.join('') : t;
  }
  HK.dropBystand = dropBystand; HK.BYSTAND_TXT = BYSTAND_TXT; HK.KIN_FR_TXT = KIN_FR_TXT;
  HK.relClass = relClass; HK.relFilter = relFilter; HK.sealedLate = sealedLate; HK.relGroupFits = relGroupFits; HK.relTextFits = relTextFits;
  HK.REL_TXT = { FIRSTMEET: FIRSTMEET_TXT, MEET: MEET_TXT, WARM: WARM_TXT, KNOWN: KNOWN_TXT, NEWCP: NEWCP_TXT, HOME: HOME_TXT, OUT: OUT_TXT, WORKQ: WORKQ_TXT, ANY: REL_ANY };
  HK.relFits = relFits;
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
        /* 二人きりの部屋（engine.js の HK.noThird）：その場にいない第三者を前提にした文（「さっき誰と話してたの」など）は使わない。全部そうなら起こさない（2026-11-04 担当PR） */
        if (HK.noThird && HK.noThird(ctx)) { var n3 = cand.filter(function (t) { return !HK.THIRD_RE.test(t); }); if (n3.length) cand = n3; else return null; }
        /* 年齢が決まっている二人なら、「同い年」「年上」の文は実際の年齢に合うものだけ */
        if (b && a.age && b.age) { var ag = cand.filter(function (t) { return ageFits(t, a, b); }); if (ag.length) cand = ag; else return null; }
        if (b && cand.some(function (t) { return FRIEND_TXT.test(t) || KIN_FR_TXT.test(t) || UNPAIRED_TXT.test(t) || REL_ANY.test(t) || FIRSTMEET_TXT.test(t); })) { var rf = cand.filter(function (t) { return relFits(ctx, t, a, b); }); if (rf.length) cand = rf; else return null; }
        var text = ctx.t(ctx.pick(cand.length ? cand : list), a, b, c);
        /* 問いで終わる文には、いつも相手の答え（HK.TAILS_Q）を続ける。問いでない文は今までどおり（乱数の引き方も同じ） */
        var isQ = withTail && b ? askEnd(text, a, b) : '', ans = isQ === 'a' ? a : b;
        if (withTail && b && (ctx.rng() < 0.55 || isQ)) text += isQ ? ctx.t(ctx.pick(HK.TAILS_Q[HK.voiceTop(ans)] || HK.TAILS_Q.A), null, ans) : tail(ctx, b, tcat, false, text);
        if (selfTail && ctx.rng() < 0.5) text += tail(ctx, a, 'solo', true);
        return { text: text, why: why(ctx, a, b, terms), with: c ? [c] : null };
      }
    };
  };

  /* 登録（ファイルごとに HK.addMini('goukon', [...]) ）。足す順は HK.addTo で元のファイルの順に固定する
     （分割読み込みで、箱庭のかたまり scen-<id> が族のかたまり pack-<族> より後に届いても、全部を元の順で読んだときと同じ並びになる） */
  HK.addMini = function (scenId, list) {
    var L = HK.MINI[scenId] || (HK.MINI[scenId] = []);
    if (HK.addTo) HK.addTo(L, list); else HK.MINI[scenId] = L.concat(list);
  };
})();
