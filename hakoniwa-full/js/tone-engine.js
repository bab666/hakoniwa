/* 箱庭シミュレーター: 口調の辞書エンジン（HK.Tone）― 試作
   ■ 考え方（docs/reports/2026-10-25/tone-engine-design.md）
     台詞を3本のベースで書く：「K くだけた常体｜F 硬い常体｜P 敬語」（「」の中を全角の縦棒で区切る。「＝」は左と同じ、空は左と同じ）。
     話し手の口調が「どのベースから作るか」を決め、そのベースに口調の辞書（文末・語彙・規則・効果）を当てる。
     1本しか書かれていない台詞は、これまでどおりの言い換え（voice.js・voice-tone.js ほか）に流す。
   ■ 辞書の形式（組み込みは tone-dict-builtin.js、利用者は住人ごとの辞書（tone-ending.js の「辞書を直接書く」）。どちらも同じ文字列の形式）
     [口調]                 ← ここから一つの口調。[口調 kohai] と書けば組み込みの口調 kohai の辞書になる（住人ごとの辞書では省いてよい）
     名前=ですぞ侍          ← 選択欄に出る名前（利用者の口調の鍵は u:名前）
     ベース=P               ← K／F／P
     一人称=拙者            ← 男|女|その他 の順で3つ書いてもよい
     二人称=貴殿
     態度=stern             ← 文面の表（9つの態度）をどれから借りるか（省略：K→穏やか、F→強気、P→敬語）
     [文末]                 ← 文の終わり（。！？…の手前）にだけ効く。長いものから。「／」で候補、くじで一つ
     です=ですぞ／ですな
     て((?<!なく)(?![…‥]*[！!？?]))=てよ……／て ← 条件：元の語のあとの（ ）。後読み「(?<!…)」「(?<=…)」は語の前、最後の先読み「(?=…)」「(?!…)」は語のすぐ後ろ
                            （飾りの……・っ、文末の記号、そのあとの文）を見る（2026-10-30 第5回。かっこの中の「=」で項目を切らない）
     [語彙]              ← 文のどこでも。単語単位。「ばかり=ばかり」のように同じ語を書くと、短い語（ばか）がその長い語の中に当たらない
     ありがとうございます=かたじけない
     [規則]                 ← 型つきの規則（組み込みの数個だけ）
     否定=ぬ                ← 〜ない → 〜ぬ／〜へん／〜ん
     進行=ておる            ← 〜ている／〜てる → 〜ておる／〜とる
     断定=や                ← 〜だ → 〜や（だよ・だね・だろ・だった・だから・だけど も）
     助詞落とし=0.3         ← が・は・を を落とす割合
     存在=おる              ← いる／いた／いない／います → おる／おった／おらぬ（が・は・も・に などの直後だけ。〜ている は進行の規則）
     短い文はため口=6       ← 敬語のベースで、助詞のない短い一言（大丈夫です→大丈夫、ありがとうございます→ありがとう）と短い問い（飲みますか？→飲む？）だけをため口にする（敬語まじり）
     ため口を混ぜる=0.15    ← 敬語のベースで、文ごとに くだけた常体（K）の同じ文と入れ替える（敬語まじり）。問い・感嘆・念押し・誘いは ため口、頼みごとは敬語、言い切りは値の割合で ため口。2文以上の台詞は両方が入る
     皮肉の型=はい          ← ひねくれ敬語：文の種類で皮肉の形を選ぶ（反応→「へえ、〜ですね」、念押し・勧め→「別に、〜んじゃないですか」、問いの形の「〜ですよ？」は言い返しだけ。同じ場面で続けない）
     縮約=はい              ← 分からない→分かんない、ちょうだい→ちょーだい など
     強調語=マジ／めっちゃ  ← 形容詞の前に差し込む（台詞に一度まで。文に勢い（！や強い語）があるときだけ）
     強調語の割合=0.4       ← 差し込む割合（既定 0.5）
     前置き=フッ……。／やれやれ ← 台詞の頭に付ける一言（ため息・感嘆）。候補が「。」「……」「、」などで終わればそのままつなぎ、終わらなければ「。」を補う
     前置きの割合=0.3       ← 前置きを付ける割合（既定 0.3）。「……」や前置きの語で始まる台詞・短い一言（6文字以下）・喘ぎには付けない
     言い切りの前置き=まあ、 ← 前置きのうち、言い切りの台詞（元の台詞が問い・お願い・お礼・謝り・あいさつ・題名でなく、です・ます などで終わる）にだけ付けるもの。前置きの割合を一緒に使う
     反応の前置き=へえ、／ほう、 ← 前置きのうち、感想・見立ての台詞（言い切りの台詞のうち、元の台詞が「〜ですね」「〜ますね」で終わる）にだけ付ける相づち
     驚き=なんと！／おお……  ← 文頭の驚きの言葉（え・えっ・えー・うそ・マジ・なんで！・何、・は？・わっ など）を置き換える。空の候補は消す
     笑い=フハハ／ふふふ     ← 短い笑い声（はは・あはは・ふふ・くく・へへ・にしし など。語の中には当てない）を置き換える。空の候補は消す
     言い切り=0.3           ← 文末の終助詞（よ・ね・よね・さ・ぞ・だな）を、この割合で落として言い切りにする（問いには当てない）
     動揺=く……ッ！／バカな……！ ← 「！」で終わる強い感情の文（うそ・まさか なども）の頭に付ける一言。台詞に一度まで
     動揺の割合=0.5         ← 動揺を付ける割合（既定 0.5）
     一度だけ=けどね／よ？   ← 文末の候補のうち、この語を足すもの（元の文にない「けどね」「よ？」）は、台詞の中でその語を付けられる最後の文に一度だけ（ほかの文ではほかの候補を選ぶ。元の台詞にもうあれば足さない。
                            最後の文が頼み「〜くださいまし」などで付けられなければ、その前の文に付ける。文を足す候補「た。……まあ、一応」は最後の文だけ。2026-10-30 第5回）
     読点で切る=18          ← 効果「短くする」で残した文がまだこの字数以上なら、頭の呼びかけ・つなぎ（ねえ・じゃあ・〈〉、・ごめん……）や「……」の前の前置き（〜けど……）を落とす（無口系）
     強い文の説明=残す      ← 「！」で終わる強い文でも、元の文の「〜のだ」を外さず、説明・念押しの語尾（のだ・んだ・だし・ね など）を足してよい（書かなければ、外して足さない。「のじゃ」「なのだよ」が持ち味の口調用）
     [効果]                 ← 組み込みの小さな変形
     感嘆符を落とす=はい ／ 伸ばす=はい ／ 言い切りに！=はい ／ 短くする=はい ／ 言いよどみ=はい ／ 前に……=はい ／ 間を置く=はい
   ■ 使い方
     HK.Tone.pick(台詞, 話し手, 敬語の相手か) → { q: 選んだベース, dict: 辞書か null }（voice.js の processText から）
     HK.Tone.apply(台詞, 辞書, 話し手) → 言い換えた台詞。同じ台詞は同じ結果（くじは台詞の文字から）
   一人称は「私」、二人称は「あなた」で書く約束（置換は voice.js の既存の層） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var T = HK.Tone = { dicts: {}, user: {}, userText: '', ending: {} };
  function hash(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function choose(list, seed) { return list.length === 1 ? list[0] : list[hash(seed) % list.length]; }
  function yes(v) { return /^(はい|on|1|true|yes|○|する)$/i.test(String(v || '').trim()); }

  /* ---------- 組み込みの口調がどのベースから作られるか ---------- */
  T.BASE = {
    gentle: 'K', gentle_n: 'K', gentle_m: 'K', ane: 'K', usan: 'K', free: 'K', gyaru: 'K', chara: 'K', shy: 'K', tame: 'K', kansai: 'K', mukuchi: 'K', boku_n: 'K', devoted_p: 'K', darui_lite: 'K', darui: 'K', tsun: 'K', tsun_n: 'K', honwaka: 'K', darui_talk: 'K', tsun_soft: 'K', mukuchi_ne: 'K',
    proud: 'F', aniki: 'F', yankee: 'F', stern: 'F', cool: 'F', calm: 'F', gentleman: 'F', sondai: 'F', noja: 'F', god: 'F', mystic: 'F', hero: 'F', cool_soft: 'F', ronkyaku: 'F', flat_plain: 'F',
    polite: 'P', devoted: 'P', kohai: 'P', ojou: 'P', genki: 'P', keigo_sarc: 'P', keigo_bossy: 'P', keigo_flat: 'P', chara_down: 'P', mixed: 'P', otaku: 'P', keigo_twist: 'P'
  };
  var BASE_PERSONA = { K: 'gentle', F: 'proud', P: 'polite' };
  /* 否定の規則だけを台詞に当てる（文ごと。口調の仕上げ（tone-new2.js の神の命令口調など）が使う。2026-10-29：「覚えてない」→「覚えてぬ」の直し） */
  T.neg = function (q, to) { if (!q || !/^(ぬ|へん|ん)$/.test(to)) return q; return join(segs(q).map(function (s) { return { body: ruleNeg(s.body, to), punct: s.punct }; })); };
  T.baseOf = function (tone, kg) {
    if (kg) return 'P';
    var d = T.dictOf(tone);
    if (d && d.base) return d.base;
    if (T.BASE[tone]) return T.BASE[tone];
    var g = HK.toneOpt ? HK.toneOpt(tone, 'group') : null;
    return g === 'polite' ? 'P' : g === 'soft' ? 'K' : 'F';
  };
  T.dictOf = function (tone) { return (tone && (T.user[tone] || T.ending[tone] || T.dicts[tone])) || null; };
  /* 「K｜F｜P」を分ける。＝・空は左と同じ。1本なら null */
  T.split = function (q) {
    if (!q || q.indexOf('｜') < 0) return null;
    var p = q.split('｜');
    if (p.length < 2) return null;
    var out = [];
    for (var i = 0; i < 3; i++) { var v = i < p.length ? p[i] : ''; v = v.replace(/^\s+|\s+$/g, ''); out.push(!v || v === '＝' || v === '=' ? (out[i - 1] || '') : v); }
    return { K: out[0], F: out[1], P: out[2] };
  };
  T.pick = function (q, who, kg) {
    var s = T.split(q);
    if (!s) return { q: q, dict: null };
    var tone = who && (HK.toneOf ? HK.toneOf(who) : who.tone), b = T.baseOf(tone, kg), q1 = s[b] || s.K;
    /* alts：選ばなかったベース（既存の書き下ろし辞書は元の文で引いてあるので、3本のどれかに一致すれば使う） */
    var alts = [s.K, s.F, s.P].filter(function (x, i, a) { return x && x !== q1 && a.indexOf(x) === i; });
    var d = kg ? null : T.dictOf(tone);
    /* 規則「ため口を混ぜる」（敬語まじりのため口）：敬語のベースの文を、文ごとに くだけた常体（K）の同じ文と入れ替える。
       書き下ろしは元の文で引くので、選ばなかった P を alts の先頭に置く（これまでどおり P で引いた書き下ろしが先に当たる） */
    if (d && b === 'P' && d.rules && d.rules.mixK && s.K && s.P && s.K !== s.P) {
      var seed = q + '#' + ((who && who.name) || '');
      if (HK.NameGuard && HK.NameGuard.stack.length) seed = HK.NameGuard.decAll(seed);
      var qm = mixKP(s.K, s.P, d.rules.mixK, seed, d.rules.shortCasual);
      if (qm !== q1) { alts = [s.P].concat(alts.filter(function (x) { return x !== s.P; })); q1 = qm; }
    }
    return { q: q1, dict: d, base: b, alts: alts };
  };

  /* ---------- 敬語の文とため口の文を混ぜる（規則「ため口を混ぜる」。敬語まじりのため口） ----------
     敬語のベース（P）の文を、文ごとに くだけた常体（K）の同じ番目の文と入れ替える（K と P の文の数がそろうときだけ。そろわなければ P のまま）。
     くじで混ぜるのではなく、文の種類で決める（2026-10-26 の利用者の指示「くじで混ぜるのをやめる」を守る）：
       短い一言・決まり文句・短い問い（規則「短い文はため口」の対象）と、18字以下の問い・感嘆（！）・驚きの反応（え、〜）・念押し（〜ですね・〜ですよ）・誘い（〜ましょう）は ため口、
       頼みごと（〜ください・〜ませんか）は敬語、言い切り（説明）は敬語。くじを引くのは言い切りの文だけで、値はその文をため口にする割合（20字を超える文は半分）。
     2文以上の台詞は、敬語の文とため口の文が両方入るようにする（「大丈夫。何とかなります」「私を信じてください。後悔はさせないよ」）。
     P の文に「〜さん」「〜様」「先生」があって K の文にないとき、K の文が P の文と中身でずれているときは、K の文ではなく P の文の文末だけを崩す（呼び方の「さん」を落とさない） */
  var MX_SENT = /(?<=[。！？!?]+)(?![。！？!?」』）)])/;
  var MX_POL = /(?:です|ます|ません|ました|でした|でしょう|ましょう|ください|下さい|ございます)(?:か|ね|よ|よね|けど|から|が|し|の)*$/;
  /* 二つの文の中身の重なり（記号・空白を除いた字の、共通の数 ÷ 短いほうの字数） */
  function mxSim(a, b) {
    var strip = function (x) { return x.replace(/[。！？!?、，…‥\s　「」『』（）()っッー〜～♡]/g, ''); };
    a = strip(a); b = strip(b);
    if (!a || !b) return 1;
    var cnt = {}, n = 0;
    for (var i = 0; i < a.length; i++) cnt[a.charAt(i)] = (cnt[a.charAt(i)] || 0) + 1;
    for (var j = 0; j < b.length; j++) { var ch = b.charAt(j); if (cnt[ch]) { cnt[ch]--; n++; } }
    return n / Math.min(a.length, b.length);
  }
  function mixKP(K, P, rate, seed, sc) {
    var ks = K.split(MX_SENT), ps = P.split(MX_SENT);
    if (ks.length !== ps.length || ks.length > 8) return P;
    var info = ps.map(function (p, i) {
      var punct = (p.match(/[。！？!?]*[\s　]*$/) || [''])[0], body = p.slice(0, p.length - punct.length);
      var core = splitTail(body)[0].replace(/^[…‥、\s　]+/, ''), len = core.length;
      if (!MX_POL.test(core) || ks[i] === p) return { fixed: true };
      var pre = core.replace(/(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます)[かねよ]*$/, '');
      var ask = /[？?]/.test(punct);
      /* 短い一言・決まり文句・短い問い（規則「短い文はため口」で崩れる文）は、ため口の文として数える */
      if (sc != null && (SET_PHRASE.test(core) || (len <= sc && !/[はがをにへとでもの]/.test(pre)) || (ask && len <= sc + 2))) return { fixed: true, casual: true };
      /* 文の種類で決める（くじは言い切りの文だけ）：頼みごと（〜ください・〜ませんか）は敬語。問い・感嘆（！）・念押し（〜ですね・〜ですよ）・誘い（〜ましょう）は、
         長くなければため口。言い切りは、値の割合でため口（長い説明は半分の割合） */
      var short2 = len <= 18;
      /* 驚き・とっさの反応で始まる文（「え、それは聞いていません」「うそ、もう朝ですか」）も感嘆と同じに扱う */
      var react = /^(?:えっ?、|えっ|ええっ?、|うそ|嘘、|まさか|あっ?、|わっ|うわ|へえ|ほんと|本当に？)/.test(core);
      var pc = /(?:ください|下さい|ませんか)$/.test(core) ? 0 : ask || react || /ましょう(?:か|よ|ね)?$/.test(core) || /[！!]/.test(punct) || /(?:ね|よ|よね)$/.test(core) ? (short2 ? 1 : rate) : len > 20 ? rate / 2 : rate;
      return { pc: pc, len: len };
    });
    var pick = info.map(function (o, i) { return !o.fixed && hash(seed + '#mx' + i) % 1000 < o.pc * 1000; });
    var free = [], picked = [];
    info.forEach(function (o, i) { if (!o.fixed) { free.push(i); if (pick[i]) picked.push(i); } });
    var casualN = picked.length + info.filter(function (o) { return o.casual; }).length, politeN = free.length - picked.length;
    /* 2文以上：全部が敬語なら、いちばんため口になりやすい文（同じなら後ろの文）を ため口に。全部がため口なら、ため口にした文のうちいちばん長い文を敬語に戻す（「私は〇〇です。よろしく」） */
    if (politeN + casualN >= 2 && !casualN) {
      /* 同じなら前の文（素の反応はため口、あとの説明・安心させる文は敬語：「大丈夫、なんとかなりますって」。2026-10-30 利用者の指示） */
      var best = -1; free.forEach(function (i) { if (best < 0 || info[i].pc > info[best].pc) best = i; });
      if (best >= 0) pick[best] = true;
    } else if (politeN + casualN >= 2 && !politeN && picked.length) {
      var lg = -1; picked.forEach(function (i) { if (lg < 0 || info[i].len > info[lg].len) lg = i; });
      if (lg >= 0) pick[lg] = false;
    }
    /* 短い一言・短い問いも、K の文があればそれを使う（敬語→ため口の表で崩すより自然：「起きていますか？」→「起きてる？」。「起きている？」にしない） */
    info.forEach(function (o, i) { if (o.casual) pick[i] = true; });
    if (!pick.some(Boolean)) return P;
    return ps.map(function (p, i) {
      if (!pick[i]) return p;
      /* K の文が P の文と中身でずれている（文の数は同じでも、K「誰か！　いないの！？」・P「すみません！　誰か、いませんか！」）ときも、P の文の文末だけを崩す */
      if ((/さん|様|さま|先生/.test(p) && !/さん|様|さま|先生/.test(ks[i])) || mxSim(ks[i], p) < 0.34) return T.casualize(p, seed);
      /* 文頭の空白は P の文のものを使う（「〜ですか。　効いてるよ」のように、K の「？　」の空白が「。」の後ろに残らないように） */
      return (p.match(/^[\s　]*/) || [''])[0] + ks[i].replace(/^[\s　]+/, '');
    }).join('');
  }

  /* ---------- 文を切る（文末の処理のため）。tail は …‥っ〜ー♡ など、文末記号の手前の飾り ---------- */
  var END = /([。！？!?]+)/, POLITE_CUT = /(?:です|ます|ません|ました|でしょう|ください|ましょう|でした)(?:から|けど|が|し|ので|のに|よ|ね|よね)?$/;
  function segs(q) {
    var parts = q.split(END), out = [];
    for (var i = 0; i < parts.length; i += 2) {
      var body = parts[i], punct = parts[i + 1] || '';
      /* 「好きです、〈〉のこと」「動きますから、」のような敬語の言いさしは、読点でも切って文末の辞書を当てる */
      var sub = body.split('、');
      if (sub.length > 1) {
        var acc = '';
        for (var k = 0; k < sub.length - 1; k++) {
          acc += sub[k];
          if (POLITE_CUT.test(acc)) { out.push({ body: acc, punct: '、' }); acc = ''; } else acc += '、';
        }
        body = acc + sub[sub.length - 1];
      }
      if (body || punct) out.push({ body: body, punct: punct });
    }
    return out;
  }
  function join(ss) { return ss.map(function (s) { return s.body + s.punct; }).join(''); }
  /* 置き換えた語を包む印。モブの呼び名の印（mob.js の \u2061・\u2063）と重ならないよう、私用領域の文字を使う
     （以前は \u2061 で、最後に印を外すときモブの印まで消し、呼び名が「あなた」に替わらなかった） */
  var TAIL = /[っッ…‥〜～ー―♡♪、\s　]*$/, MARK = '\uE061';
  /* 文末にある、語彙で置き換えた語（印で包んだもの）と、文末の処理を重ねて当ててよい置き換えの終わり方（活用の形） */
  var VOCAB_END = new RegExp(MARK + '([^' + MARK + ']*)' + MARK + '$'), VOCAB_TAIL = /(?:[てでと](?:る|た)|[てで](?:ない|ねえ|ん)|[てで]お(?:る|った|らぬ|らん)|へん|らない|んない)$/;
  function splitTail(body) { var t = (body.match(TAIL) || [''])[0]; return [body.slice(0, body.length - t.length), t]; }

  /* ---------- 規則 ---------- */
  /* 「ない」の前がこれなら、動詞の否定ではない（形容詞・名詞＋ない）ので触らない */
  var ADJ_NAI = /(少|危|仕方|しょうが|情け|つまら|くだら|もったい|だらし|切|みっとも|あっけ|頼り|物足り|はした|ぎこち|さりげ|間違い|違い|申し訳|面目|容赦|汚|きた|せつ|あぶ|すく|かたじけ|やる気|元気|関係|意味|興味|問題|時間|余裕|自信|用|金|気|暇|仕事|しかた|心配|覚え|記憶|文句|縫い目|隙|勝ち目|しょう|たま|他|ほか|な|こと)$/;
  var ICHI = /(起き|生き|落ち|信じ|感じ|閉じ|浴び|借り|降り|過ぎ|すぎ|足り|伸び|延び|滅び|帯び|詫び|満ち|飽き|尽き|老い|報い|でき|着|似|煮|居|い|見|寝|出|来)$/;
  /* 丁寧形の語幹（〜ます の前）から、辞書形・過去・否定・意向を作る（{る} {た} {ない} {なかった} {よう} の印。かんたんな活用だけ） */
  var I2U = { 'き': 'く', 'ぎ': 'ぐ', 'し': 'す', 'ち': 'つ', 'に': 'ぬ', 'び': 'ぶ', 'み': 'む', 'り': 'る', 'い': 'う' };
  var I2A = { 'き': 'か', 'ぎ': 'が', 'し': 'さ', 'ち': 'た', 'に': 'な', 'び': 'ば', 'み': 'ま', 'り': 'ら', 'い': 'わ' };
  var I2O = { 'き': 'こ', 'ぎ': 'ご', 'し': 'そ', 'ち': 'と', 'に': 'の', 'び': 'ぼ', 'み': 'も', 'り': 'ろ', 'い': 'お' };
  var I2TA = { 'き': 'いた', 'ぎ': 'いだ', 'し': 'した', 'ち': 'った', 'り': 'った', 'い': 'った', 'に': 'んだ', 'び': 'んだ', 'み': 'んだ' };
  function conj(stem, form) {
    /* {て}：「お〜ください」の語幹（お放し・お考え）を て形に（放して・考えて） */
    if (form === 'て') {
      var st = stem.replace(/^お/, ''), lt = st.slice(-1);
      if (/行き$/.test(st)) return st.slice(0, -1) + 'って';
      return st.slice(0, -1) + ({ 'き': 'いて', 'ぎ': 'いで', 'し': 'して', 'ち': 'って', 'に': 'んで', 'び': 'んで', 'み': 'んで', 'り': 'って', 'い': 'って' }[lt] || lt + 'て');
    }
    /* 謙譲・丁寧の語幹は、ふつうの形に戻してから活用する：いたします→する、ございます→ある（〜でございます→だ、おめでとうございます→おめでとう）、〜ております→〜ている */
    /* 「美味しゅうございました」→美味しかった。「ありがとうございます」「おめでとうございます」→ありがとう・おめでとう */
    if (/しゅうござい$/.test(stem)) return stem.slice(0, -6) + 'し' + { 'る': 'い', 'た': 'かった', 'ない': 'くない', 'なかった': 'くなかった', 'よう': 'いだろう' }[form];
    if (/うござい$/.test(stem)) return stem.slice(0, -3);
    /* 「なさいます」「くださいます」「おっしゃいます」「いらっしゃいます」は「〜る」（なさう にしない） */
    if (/(?:なさ|くださ|おっしゃ|いらっしゃ)い$/.test(stem)) return stem.slice(0, -1) + { 'る': 'る', 'た': 'った', 'ない': 'らない', 'なかった': 'らなかった', 'よう': 'ろう' }[form];
    if (/でござい$/.test(stem)) return stem.slice(0, -4) + { 'る': 'だ', 'た': 'だった', 'ない': 'じゃない', 'なかった': 'じゃなかった', 'よう': 'だろう' }[form];
    if (/ござい$/.test(stem)) stem = stem.slice(0, -3) + 'あり';
    else if (/いたし$/.test(stem)) stem = stem.slice(0, -3) + 'し';
    else if (/[てで]おり$/.test(stem)) stem = stem.slice(0, -2) + 'い';
    var last = stem.slice(-1), pre = stem.slice(0, -1);
    /* する（〜します・勉強します・何とかします）：「し」の前が五段の「す」で終わる動詞の漢字一字（話し・出し・返し）でなければ する */
    var suru = last === 'し' && !/[話出返消押渡隠回落戻倒起鳴指示伸干放正済許殺探離貸刺移映残直試流通増減足察差指刺外越殴壊卸干貸]$/.test(pre) && !/(過ご|なく|無く|増や|減ら|こぼ|ずら|ころ|まわ|かく|こわ|なお|かえ|はな|わた|おと|さが|よこ|ほど|ゆる|たお|もど|お|だ|け|さ|ど)$/.test(pre);
    /* 一段の「い」「み」は、いる・みる（〜ている・〜てみる）のときだけ。それ以外の い・み は五段（思い・飲み） */
    /* 語幹は前の語とつながって切り出される（「そばにい」「問題あり」）ので、助詞・副詞の直後の い・み も いる・みる（そばにいます→そばにいる） */
    var ichiIM = (last === 'い' || last === 'み') && (!pre || /[てでにがはもとをへやだう、\s　…‥]$/.test(pre.replace(new RegExp(MARK, 'g'), '、')));
    if (/^(?:来|き)$/.test(stem)) return { 'る': '来る', 'た': '来た', 'ない': '来ない', 'なかった': '来なかった', 'よう': '来よう' }[form];
    if (suru) return pre + { 'る': 'する', 'た': 'した', 'ない': 'しない', 'なかった': 'しなかった', 'よう': 'しよう' }[form];
    /* ある（問題ありません→問題ない。「あらない」にしない） */
    if (/あり$/.test(stem)) return stem.slice(0, -2) + { 'る': 'ある', 'た': 'あった', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'あろう' }[form];
    var ichi = ichiIM || (ICHI.test(stem) && !((last === 'い' || last === 'み') && !ichiIM)) || /[えけげせぜてでねべめれ]$/.test(last) || /^[一-鿿々]$/.test(stem);
    if (ichi) return stem + { 'る': 'る', 'た': 'た', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'よう' }[form];
    if (I2U[last]) return pre + ({ 'る': I2U[last], 'た': I2TA[last], 'ない': I2A[last] + 'ない', 'なかった': I2A[last] + 'なかった', 'よう': I2O[last] + 'う' }[form]);
    return stem + { 'る': 'る', 'た': 'た', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'よう' }[form];
  }
  var IRR_NEG = { 'ぬ': { 'しない': 'せぬ', 'こない': 'こぬ', '来ない': '来ぬ', 'いない': 'おらぬ', 'ない': 'ない' }, 'へん': { 'しない': 'せえへん', 'こない': 'けえへん', '来ない': '来えへん', 'いない': 'おらへん', 'ない': 'ない' }, 'ん': { 'しない': 'せん', 'こない': 'こん', '来ない': '来ん', 'いない': 'おらん', 'ない': 'ない' } };
  function ruleNeg(body, to) {
    var irr = IRR_NEG[to] || {};
    /* 「へん」「ん」で終わる否定の後ろの「んだ」は「のだ」に（「合わないんだ」→「合わへんのや」。「合わへんんや」にしない） */
    var nd = to === 'へん' || to === 'ん' ? function (x) { return x.replace(/んんだ/, 'んのだ'); } : to === 'ぬ' ? function (x) { return x.replace(/ぬんだ/, 'ぬのだ'); } : function (x) { return x; };
    return nd(body.replace(/([一-鿿々ぁ-ゖァ-ヶ]{1,6}?)(しない|こない|来ない|いない|ない)(?=(?:よ|ね|な|の|か|ぞ|ぜ|さ|わ|し|から|けど|けれど|でしょ|です|んだ|のだ|って){0,2}[っッ…‥〜～ー♡、\s　]*$)/, function (m, pre, nai) {
      if (nai === 'ない') {
        /* 「聞いてない」（〜ていない の縮まった形）：聞いてへん／聞いておらぬ／聞いとらん */
        if (/[^っ]て$|[んい]で$|って$/.test(pre) && !/(?:なくて|くて|じゃなくて|でなくて|んて|とて)$/.test(pre)) {
          /* 「捨てない」「待てない」「持てない」のような、て で終わる語幹・可能形は「〜ぬ」（「捨ておらぬ」にしない。2026-10-29） */
          if (/て$/.test(pre) && pre.length >= 2 && NO_TERU.indexOf(pre.slice(-2, -1)) >= 0) return pre + to;
          return to === 'へん' ? pre + 'へん' : to === 'ぬ' ? pre + 'おらぬ' : pre.replace(/て$/, 'と').replace(/で$/, 'ど') + 'らん';
        }
        if (!pre || /く$/.test(pre) || ADJ_NAI.test(pre) || /(じゃ|では|が|は|も|しか|なんか|なんて|に|で|て)$/.test(pre)) return m;   /* 形容詞・「〜じゃない」「〜がない」は触らない */
        /* 動詞の否定らしい形だけ：ア段（行か・分から）、エ段（食べ・見え）、一段の語幹、漢字一字（見・出・来） */
        if (!/[かがさたなばまらわえけげせぜてでねべめれ一-鿿々]$/.test(pre) && !ICHI.test(pre)) return m;
        return pre + to;
      }
      return pre + (irr[nai] || nai);
    }));
  }
  var NO_TERU = '捨建育当慌果企隔宛充裁満絶断討撃打企待持立勝';
  function ruleProg(q, to) {
    var te = to, de = /^て/.test(to) ? to.replace(/^て/, 'で') : /^と/.test(to) ? to.replace(/^と/, 'ど') : to;
    return q.replace(/(.)(ている|てる|でいる|でる)(?![ぁ-ゖ]?[ばれ])/g, function (m, pre, v, at) {
      if (NO_TERU.indexOf(pre) >= 0 && /^て/.test(v)) return m;
      /* 「兄弟っている」「推しっている」「〇〇ってる」の っ は引用（名詞＋って）：二字の漢字・漢字＋し・カタカナの直後の っ なら触らない */
      if (pre === 'っ' && /(?:[一-鿿々]{2}|[一-鿿々]し|[ァ-ヶー]|[A-Za-zＡ-Ｚａ-ｚ0-9０-９]|」)$/.test(q.slice(0, at))) return m;
      if (/^で/.test(v) && !/[んい]$/.test(pre)) return m;   /* 「〜んでいる」「〜いでいる」以外の「でる」は触らない */
      return pre + (/^で/.test(v) ? de : te);
    });
  }
  /* 存在の「いる」（〜ている は進行の規則）：が・は・も・に・と・か・で・読点・文頭の直後だけ */
  function ruleExist(q, to, neg) {
    var nai = neg === 'ぬ' ? 'おらぬ' : neg === 'へん' ? 'おらへん' : 'おらん';
    var M2 = { 'いる': to, 'いた': to.replace(/る$/, 'った'), 'いない': nai, 'いません': nai, 'います': to.replace(/る$/, 'ります'), 'いました': to.replace(/る$/, 'りました'), 'いれば': to.replace(/る$/, 'れば') };
    return q.replace(/(^|[がはもにとかで、\s　])(いる|いた|いない|いません|います|いました|いれば)(?=[^ぁ-ゖ]|[よねのかなぞぜさわしっ…‥〜～ー♡、。！？!?]|$)/g, function (m, p, v) { return p + (M2[v] || v); });
  }
  function ruleCopula(body, to) {
    /* 文中の だから・だけど・だって・だった */
    body = body.replace(/だ(から|けど|けれど|って|った|ろう|ろ)(?=[、\s　]|$|[っ…‥〜～ー♡])/g, to + '$1').replace(/だ(から|けど|けれど)/g, to + '$1');
    /* 文末の だ・だよ・だね・だな・だぞ */
    return body.replace(/(?:^|[^ん])だ(よ|ね|な|ぞ|ぜ|わ|もん|っけ)?(?=[っッ…‥〜～ー♡、\s　]*$)/, function (m, p) { return m.slice(0, m.length - 1 - (p || '').length) + to + (p || ''); }).replace(/んだ(よ|ね|な|ぞ)?(?=[っッ…‥〜～ー♡、\s　]*$)/, 'ん' + to + '$1');
  }
  /* 助詞を落とした後ろが、名詞＋助詞・断定（「〈名前〉が〈名前〉と」「弱点は右脚だ」）なら落とさない（名詞が並んで読めなくなる） */
  /* 住人の名前の伏せ字（voice.js の HK.NameGuard）：ふつうは漢字の範囲（U+9FA6〜）なので名詞として扱われる。足りないときの私用領域（U+E100〜U+E1FF）も名詞に数える */
  var DROP_NOUN = /^[一-鿿々ァ-ヶー\uE061\uE100-\uE1FF]+(?:が|は|を|に|と|の|も|へ|で|だ|じゃ|です|、|。|！|？|$)/;
  function ruleDrop(body, rate, seed) {
    var k = 0;
    return body.replace(/([一-鿿々ァ-ヶー\uE100-\uE1FF]{1,6})(が|は|を)(?=[一-鿿々ぁ-ゖァ-ヶ\uE100-\uE1FF])/g, function (m, n, p, at, all) {
      k++;
      if (DROP_NOUN.test(all.slice(at + m.length))) return m;
      /* 送りがなの「が」（嗅がせて・脱がせて・上がる・広がって）は助詞ではない（2026-10-30 第5回：「嗅せて」「脱せてる」になっていた） */
      if (p === 'が' && /^[らりるれろっせさしすそずぜぞ]/.test(all.slice(at + m.length))) return m;
      return (hash(seed + '#drop' + k) % 100) < rate * 100 ? n : m;
    });
  }
  var CONTRACT = [[/([ぁ-ゖ一-鿿々])(?<![いしか])らない/g, '$1んない'], [/ている/g, 'てる'], [/ちょうだい/g, 'ちょーだい'], [/どれだけ/g, 'どんだけ'], [/こんなの/g, 'こんなん'], [/やっぱり/g, 'やっぱ'], [/大丈夫/g, 'だいじょぶ'], [/するの(?=[？?]|$)/g, 'すんの'], [/てるの(?=[？?]|$)/g, 'てんの'], [/なければ/g, 'なきゃ'], [/てしまう/g, 'ちゃう'], [/でしまう/g, 'じゃう'], [/てしまった/g, 'ちゃった'], [/でしまった/g, 'じゃった'], [/ところ(?![一-鿿])/g, 'とこ'], [/という/g, 'って'], [/しなければ/g, 'しなきゃ'], [/わからない/g, 'わかんない'], [/分からない/g, '分かんない'], [/つまらない/g, 'つまんない']];
  function ruleContract(q) { CONTRACT.forEach(function (c) { q = q.replace(c[0], c[1]); }); return q; }
  var EMPH_AT = /(?<![ぁ-ゖァ-ヶ一-鿿])(すごい|すご|かわいい|可愛い|いい|やばい|ヤバい|うまい|楽しい|嬉しい|うれしい|きれい|面白い|おもしろい|おいしい|つらい|こわい|怖い|痛い|眠い|疲れた|好き|嫌い|無理|ムリ|だめ|ダメ|最高|最悪|きつい|寒い|暑い|重い|遠い|近い|早い|遅い|高い|安い|大変|うざい|ずるい|わかる|分かる|助かる|困る)/;
  var EMPH_HOT = /[！!]|すご|ヤバ|やば|最高|最悪|無理|ムリ|かわいい|可愛い|うれし|嬉し|楽し|たのし|ウケる|面白|おもしろ|びっくり|やった|うそ|ほんと|本当/;
  function ruleEmph(q, words, seed, rate) {
    /* 文に勢い（！や強い語）がないときは差し込まない。割合（既定 0.5）は辞書の「強調語の割合」で変えられる */
    if (!EMPH_HOT.test(q) || hash(seed + '#emph') % 100 >= Math.round((rate == null ? 0.5 : rate) * 100)) return q;
    /* もう強調語が付いている語（「ガチ無理」「マジかわいい」）には重ねない */
    return q.replace(EMPH_AT, function (m, g, at, all) {
      var pv = all.slice(Math.max(0, at - 4), at).replace(new RegExp(MARK, 'g'), ''), nx0 = all.slice(at + m.length).replace(new RegExp(MARK, 'g'), '');
      /* 「無理して」「無理する」「無理させ」（無理をする）は形容の「無理」ではないので強めない（「マジムリして」にしない） */
      if (/^(?:無理|ムリ)$/.test(m) && /^[しさす]/.test(nx0)) return m;
      if (words.concat(['マジ', 'ガチ', 'めっちゃ', 'すごく', 'とても', 'チョー', '超', 'ほんと', '本当に']).some(function (w) { return pv.slice(-w.length) === w; })) return m;
      return choose(words, seed + '#ew') + m;
    });
  }

  /* ---------- 語尾の設定の規則（前置き・驚き・笑い・言い切り・動揺）。どれも辞書に書いたときだけ効く ---------- */
  /* 死別・別れの台詞、「〜だった。」で終わるしんみりした言い切り：勢いの「！」「よっしゃ」を足さない（熱血など） */
  var WARM = /好きです|好きだ(?!ろ)|お好き|かわいい|可愛い|ありがと|よかった(?!ら)|良かった(?!ら)|一緒|嬉し|うれし|幸せ|お慕い|想い/;
  var GRIEF = /死|亡くな|さよなら|さようなら|葬|墓|形見|お別れ|最期|逝っ|逝く|帰ってこな|もういない|もう会えな|だった(?:[。…‥]|$)/;
  /* 前置き（やれやれ・フッ……）を付けない台詞：死別・謝り・お礼 */
  var NO_LEAD = /死|亡くな|さよなら|さようなら|葬|墓|形見|お別れ|最期|逝っ|逝く|すまな|すみません|ごめん|申し訳|悪かった|許して|ありがと|感謝/;
  /* 喘ぎ（前置き・動揺を付けない） */
  var MOAN = /♡|[ぁぃぅぇぉ][っッ…‥、！!〜ー]|[…‥]っ|(?:^|[、…‥\s　])[あんひはふ][ぁあんっッ]*[っッ][、…‥]/;
  /* 候補の後ろの記号（候補が記号で終わるかどうか） */
  var CAND_END = /[。、…‥！!？?]$/;
  /* 文頭の驚きの言葉：[語, 後ろに要る記号（正規表現）]。後ろの記号まで含めて置き換える */
  var SURP = /(^|[。！？!?\s　」\uE061])(ええっ|えっ|えー|ええー|え|うそ|嘘|マジで|まじで|マジ|まじ|なんで|何|は|わっ|わあ|わぁ)([、…‥！!？?。ー〜っ]*)/g;
  function surpOk(w, p, rest) {
    if (!p) return rest === '';   /* 記号がないなら、台詞の終わりの一言だけ（「えらい」「何か」「は」に当てない） */
    if (w === 'は') return /^[？?]/.test(p);
    if (w === 'なんで') return /^[！!？?…‥]/.test(p) && (rest === '' || /^[！!？?…‥]/.test(p));
    if (w === 'ええー' || w === 'えー') return true;
    return !/^[ー〜]/.test(p) || /^[ー〜]+[、…‥！!？?]/.test(p);
  }
  /* 候補の語を印で包む（文末の辞書が当たらないように）。候補の末尾の記号は外に出す */
  function wrapCand(c) { var m = c.match(/^(.*?)([。、…‥！!？?]*)$/); return m[1] ? MARK + m[1] + MARK + m[2] : m[2]; }
  function ruleSurprise(q, list, seed) {
    var k = 0, lastEnd = -9;
    return q.replace(SURP, function (m, pre, w, p, at, all) {
      var rest = all.slice(at + m.length);
      if (!surpOk(w, p, rest)) return m;
      /* 驚きの言葉が続く（「えっ！　うそ、」）ときは、二つ目を消す（「なんと！　なんと！」と重ねない） */
      var near = at + pre.length - lastEnd <= 1 && !all.slice(lastEnd, at + pre.length).replace(/[\s　]/g, '');
      lastEnd = at + m.length;
      if (near) return pre;
      var c = choose(list, seed + '#sp' + (++k));
      /* 空の候補：驚きの言葉ごと消す（後ろの記号も） */
      if (!c) return pre;
      /* 候補が「っ」「ッ」で終わるなら、後ろの記号の頭の「っ」は重ねない（「うわっっ！」にしない）。
         「は？」の置き換えで候補が叫び（〜っ・〜ッ）なら、問いの「？」を「！」に（「うわっ？」にしない） */
      if (/[っッ]$/.test(c)) p = p.replace(/^[っッ]+/, '');
      if (/[っッー〜]$/.test(c) && /^[？?]/.test(p)) p = '！' + p.replace(/^[？?]+/, '');
      return pre + wrapCand(c) + (CAND_END.test(c) ? '' : p);
    });
  }
  var LAUGH = /(^|[^ぁ-ゖ一-鿿々ァ-ヶー])(あはは+|うふふ+|えへへ+|はは+|ふふ+|くく+|へへ+|にしし+|フハハ+|ハハ+|フフ+|クク+)(っ?)(?![ぁ-ゖ])([、…‥！!。]*)/g;
  function ruleLaugh(q, list, seed) {
    var k = 0;
    return q.replace(LAUGH, function (m, pre, w, tu, p) {
      var c = choose(list, seed + '#lf' + (++k));
      if (!c) return pre;   /* 空の候補：笑い声ごと消す（後ろの記号も） */
      return pre + wrapCand(c) + (CAND_END.test(c) ? '' : p);
    });
  }
  /* 言い切り：文末の終助詞を落とす（問い・語彙で置き換えた語の後ろには当てない） */
  function ruleFlat(body, punct, rate, seed) {
    if (/^[？?]/.test(punct) || isQuestion(body)) return body;
    var st = splitTail(body), core = st[0];
    if (core.slice(-1) === MARK || hash(seed + '#fl') % 100 >= Math.round(rate * 100)) return body;
    var m = core.match(/(?:だな|よね|よ|ね|さ|ぞ|な)$/);
    if (!m) return body;
    var head = core.slice(0, core.length - m[0].length), p = m[0];
    if (!head || head.replace(new RegExp(MARK, 'g'), '').length < 2) return body;
    if (p === 'だな') return head + 'だ' + st[1].replace(/^[〜ー～]+/, '');
    /* 「な」は、〜ている・〜た・形容詞の後ろだけ（「するな」「触るな」の禁止は残す） */
    if (p === 'な' && !/(?:ている|でいる|ていた|でいた|[^ぁ-ゖ]い|しい|かった|ない)$/.test(head.replace(new RegExp(MARK, 'g'), ''))) return body;
    if (p === 'ね' && /[かわ]$/.test(head)) return body;          /* 「ですかね」「〜わね」はそのまま */
    if (p === 'よ' && /し$/.test(head) && !/だし$/.test(head)) return body;   /* 「しよ」「勉強しよ」の誘い */
    if (p === 'さ' && /の$/.test(head)) return body;              /* 「なのさ」 */
    return head + st[1].replace(/^[〜ー～]+/, '');
  }
  /* 新しい規則（前置き・驚き・笑い・言い切り・動揺）を一つでも使う辞書か。使う辞書だけ、次の細かい整え方をする（既存の辞書の出力は変えない）：
     ・感嘆符を落としたあとの台詞の終わりの「。」を外す　・「！」で終わる文には、「。」「、」を中に含む文末の候補（「だよ。知らないけど」）を当てない */
  function newRules(r) { return r.flat != null || !!(r.lead || r.leadS || r.leadR || r.shaken || r.surprise || r.laugh); }
  /* 言い切りの台詞か（言い切りの前置きを付けてよいか）：問い・お願い・誘い・お礼・謝り・あいさつを含まず、です・ます・た・だ などの言い切りで終わる。
     0：言い切りでない　1：言い切り　2：言い切りで、感想・見立て（〜ですね・〜ますね・〜ましたね。反応の前置きを付けてよい） */
  var NOT_STMT = /[？?！!]|ください|くださ|ませんか|ましょう|すみません|ごめん|申し訳|お願い|ありがと|どうも|おはよう|こんにちは|こんばんは|お疲れ|おつかれ|失礼|おやすみ|いただきます|ごちそう|よろしく/;
  function stmtLine(q) {
    var t = q.replace(new RegExp(MARK, 'g'), '').replace(/[。…‥\s　]+$/, '');
    if (NOT_STMT.test(t) || !/(?:です|ます|ません|ました|でした|でしょう|[ただいる])(?:ね|よ|が|けど|けどね|から|よね)?$/.test(t)) return 0;
    return /(?:です|ます|ました|でした|ません)ね$/.test(t) ? 2 : 1;
  }
  /* 前置き・動揺の候補をつなぐ：候補が「。」「……」「、」「！」などで終わればそのまま、終わらなければ「。」を補う */
  function prefix(c, s) { return CAND_END.test(c) ? c + (/[！!？?]$/.test(c) && !/^[\s　]/.test(s) ? '　' : '') + s.replace(/^[\s　]+/, '') : c + '。' + s; }
  /* 台詞が既に前置き・間投詞・言いよどみで始まっているか */
  var LEAD_DONE = /^(?:[…‥]|[ぁ-ゖー〜]{1,4}[、。…‥！!？?]|[ァ-ヶー]{1,3}ッ?[…‥！!]|(?:まあ|やれやれ|ふむ|ほう|はあ|ああ|おや|さて|ねえ|ほら|えっと|ええと|あの|うん|いや|そう|フッ|ふっ)(?![ぁ-ゖ]))/;
  var SHAKE_POS = /ありがと|嬉し|うれし|楽し|たのし|やった|最高|好き|よろしく|おめでと|がんば|頑張|行こう|しよう|おいし|美味し|かわい|可愛|すご|見事|素晴|いいね|いいぞ|任せ|おはよう|おやすみ|さすが|助か|礼を|感謝|ただいま|おかえり/;
  var SHAKE_HOT = /うそ|嘘|まさか|ありえな|あり得な|信じられな|びっくり|最悪/;
  function ruleShaken(q, list, rate, seed) {
    if (hash(seed + '#sh') % 100 >= Math.round(rate * 100)) return null;
    var parts = q.match(/[^。！？!?]+[。！？!?]*|[。！？!?]+/g) || [q];
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i], b = s.replace(/[。！？!?\s　]+$/, '').replace(/^[\s　]+/, '');
      if (b.replace(/[…‥、っッー〜]/g, '').length < 2 || LEAD_DONE.test(s.replace(/^[\s　]+/, '')) || /^[ぁ-ゖァ-ヶ][ゃゅょ]?、/.test(b) || SHAKE_POS.test(b)) continue;
      if (/[！!][？?]?$/.test(s.replace(/[\s　]+$/, '')) || SHAKE_HOT.test(b)) {
        parts[i] = prefix(choose(list, seed + '#shc'), s);
        return parts.join('');
      }
    }
    return null;
  }

  /* ---------- 効果 ---------- */
  /* 「！」を「。」に。「！」の後ろの空き（「黙れ！　あなたの」）も詰める（「黙れ。　あなたの」にしない） */
  /* 「！？」の「！」は落とすだけ（「見た。？」にしない） */
  function fxBang(q) { return q.replace(/[！!]+(?=[？?])/g, '').replace(/！+[\s　]*/g, '。').replace(/。(?=」|$)/g, '。'); }
  function fxStretch(ss, seed) {
    return ss.map(function (s, i) {
      var st = splitTail(s.body);
      if (/[よねなで]$/.test(st[0]) && !/[〜ー]/.test(st[1]) && hash(seed + '#st' + i) % 100 < 50) return { body: st[0] + '〜' + st[1].replace(/^、/, ''), punct: s.punct };
      return s;
    });
  }
  function fxBangOn(ss, seed) {
    return ss.map(function (s, i) {
      if (s.punct || s.body.length > 8 || /[…‥、〜ー]$/.test(s.body) || isQuestion(s.body)) return s;
      if (/[だよぜぞ]$/.test(s.body) && hash(seed + '#bg' + i) % 100 < 50) return { body: s.body, punct: '！' };
      return s;
    });
  }
  /* 短くする：最初の文だけ残し、頭に「……」。もう「……」や「え……」のような短い間で始まる文には重ねない（「……え……待って」にしない） */
  /* 規則「読点で切る=18」（無口系）：残した文がまだその字数以上（記号を除く）なら、読点・「……」で句に切り、頭から「落としてよい句」だけを落とす（2026-10-30 第5回）。
     落としてよい句は、呼びかけ・相づち・つなぎ（CUT_LEAD）と、「……」の前の前置き（「答えたくなかったらいいんだけど……」）。字数を下回ったら止める。
     中身のある句は落とさない（後ろの句だけ残すと「痛かったって言ったら、責任取ってくれるの？」→「責任取ってくれるの？」のように意味が変わるため）。
     残りが短すぎる（4字未満）・助詞やつなぎで始まるときは切らない。話し手の目印（＠名前＠）は残す。名前の印（{a}・〈〉）は 2 字に数える */
  var SHORT_LEN = function (x) { return x.replace(/^[…‥]*＠[^＠]*＠/, '').replace(/\{[^}]*\}|〈〉/g, '名前').replace(/[…‥、。！？!?\s　「」]/g, '').length; };
  /* 落としてよい頭の句：呼びかけ・相づち・つなぎ（ねえ・じゃあ・それなら・ほら・まさか・そうだよね）と、名前だけの呼びかけ（{a}・〈〉・みんな）。
     中身のある句（「あなたにだけは」「誰のせいでこうなってるか」「どうして」「このまま」）・言いよどみの一字（「わ、」）は落とさない（落とすと意味が変わる） */
  var CUT_LEAD = /^[…‥\s　]*(?:[ぁ-ゖァ-ヶ]、)?(?:ねえねえ|ねえ|なあ|じゃあさ|じゃあ|では|それなら|それじゃ|あの|ほら|まあ|うん|ああ|ごめん|ごめんね|ごめんなさい|すまない|違う|ほんと|そうだね|そうだよね|そっか|へえ|ふうん|ふーん|うわ|うわあ|うわー|いやー|よし|さあ|ところで|とにかく|とりあえず|正直|まさか|はい|\{[^}]+\}|〈〉|みんな|ねえ\{[^}]+\})[…‥っ！!？?\s　]*$/;
  function cutComma(body, n) {
    if (!n || SHORT_LEN(body) < n || !/[、…‥]/.test(body.replace(/^[…‥]+/, ''))) return body;
    var sp = (body.match(/^[…‥]*＠[^＠]*＠/) || [''])[0], rest = body.slice(sp.length);
    /* 句は読点と「……」で切る（u：句、d：句のあとの区切り）。「……」の前の前置き（「答えたくなかったらいいんだけど……」）も、落としてよい句に数える */
    var sp2 = rest.split(/(、|[…‥]+)/), u = [], d = [];
    for (var x = 0; x < sp2.length; x += 2) { u.push(sp2[x]); d.push(sp2[x + 1] || ''); }
    var k = 0, cut1 = false, from = function (i) { var s = ''; for (var y = i; y < u.length; y++) s += u[y] + d[y]; return s; };
    /* 頭から、落としてよい句を落とす（残りが字数を下回ったら止める。言いよどみの「そ、」「ご、」は次の句と一つに数える） */
    while (k < u.length - 1 && SHORT_LEN(from(k)) >= n) {
      var pk = u[k].replace(/^[\s　]+/, ''), dropN = 1;
      if (!pk) { k++; continue; }
      if (/^[ぁ-ゖァ-ヶ]$/.test(pk) && d[k] === '、' && k + 1 < u.length - 1) { pk = pk + '、' + u[k + 1]; dropN = 2; }
      if (!(CUT_LEAD.test(pk) || (/^[…‥]/.test(d[k + dropN - 1]) && /(?:けど|けれど|けども)$/.test(pk)))) break;
      k += dropN; cut1 = true;
    }
    if (!cut1 || k >= u.length) return body;
    var tail = from(k);
    if (SHORT_LEN(tail) < 4 || /^[…‥\s　]*(?:って|と|けど|から|が|し|の|で|に|を|は|も|ね|よ|な)/.test(tail)) return body;
    /* 話し手の目印があるときは「……」を目印の前に（前置きの規則が足す「……」と重ねない） */
    return sp ? '……' + sp.replace(/^[…‥]+/, '') + tail.replace(/^[…‥\s　]+/, '') : '……' + tail.replace(/^[…‥\s　]+/, '');
  }
  function fxShort(ss, cut) {
    var f = ss[0];
    if (ss.length > 1) f = { body: (/^(?:[ぁ-ゖァ-ヶー]{1,3})?[…‥]/.test(f.body.replace(new RegExp(MARK, 'g'), '')) ? '' : '……') + f.body, punct: f.punct === '。' ? '' : f.punct };
    else if (!cut) return ss;
    var b = cutComma(f.body, cut);
    if (b !== f.body) f = { body: b, punct: f.punct === '。' ? '' : f.punct };
    return ss.length > 1 || b !== ss[0].body ? [f] : ss;
  }
  /* 言いよどみ：文頭のかなを一つ重ねる（「大丈夫」→ 漢字始まりは重ねられないので、最初の文の終わりを「……」で濁す）。
     元の文がもう言いよどんでいる・間投詞で始まる（「だ、大丈夫」「あ、」「え、」）・「……」で始まるときは何もしない */
  function fxStammer(q, seed) {
    if (hash(seed + '#stm') % 100 >= 30 || /^[…‥]/.test(q) || /^[ぁ-ゖァ-ヶ][ゃゅょャュョ]?[、…‥]/.test(q)) return q;
    var m = q.match(/^([ぁ-ゖァ-ヶ][ゃゅょぁぃぅぇぉャュョァィゥェォ]?)/);
    if (m && !/^[ぁぃぅぇぉっゃゅょゎんゝゞァィゥェォッャュョヮンヽヾ]/.test(q)) return m[1] + '、' + q;
    /* 漢字・記号始まり：最初の言い切り（。・文末）を「……」に。問い・！・……で終わる文はそのまま */
    return q.replace(/^([^。！？!?…‥]*?[^。！？!?…‥〜ー～っッ♡、\s　])(。|$)/, function (x, b, p) { return b + '……'; });
  }

  /* 文末の項目を当ててはいけない組み合わせ（当てずに次の項目を見る）
     ・終助詞が重なる：「よ」＋「よね」→「よよね」、「よ」＋「わね」、「ね」＋「ね」（「よね」「わよ」「わね」「のよ」「のね」はよい）
     ・問い（？で終わる文）に、言い切りの語尾（よ・わ・ぞ・ぜ・さ・だ・！）を付ける：「いいさ？」「行くわ？」「平気だよ？」「思いまーす！？」
       （「ます？=ますの？」のように ？ 付きで書いた項目は別） */
  var FINAL_P = /[よねわぞぜさ]$/, PAIR_OK = /^(?:よね|わよ|わね|ぞよ|さね)$/;
  /* ？のない問い（「何をした」「いつからだ」「どうしたいんだ！」）：疑問の語があり、その後ろが「〜ても」「〜たら」のような条件・譲歩でないもの */
  var QW = /(何|なに|なんと(?=[呼言書読])|誰|(?<![よなた])だれ|どこ|(?<![こそあど])いつ|なぜ|どうして|どう|どれ|どちら|どっち|いくつ|いくら(?!い)|どんな|(?<![ほけ])どの)(?!でも|も|か|ぞ|とか|となく|にも|にか|せ|より|度も|回も|人も|だか|とも|しろ|ら|だって|なり)/g;
  function isQuestion(head) {
    var m, rest = null;
    QW.lastIndex = 0;
    while ((m = QW.exec(head))) rest = head.slice(m.index + m[0].length);
    /* 「どうするか決めて」「どちらが本気か答えて」のような、文の中の問いは除く */
    return rest != null && !/(?:ても|でも|たら(?!いい|よい)|れば(?!いい|よい)|けど|のに|ので|ながら|とか|か(?=[一-鿿々ァ-ヶをがはもと、]))/.test(rest);
  }
  function badEnd(head, to, punct, qm, from) {
    if (to === from) return false;   /* 元のまま（「だ=だ／だよ」の「だ」）はいつでもよい */
    /* 名詞止め・体言止めの文に「なのさ」を付けない（「二人だけの秘密なのさ」「人間なのさ」→ ほかの候補の「だよ」「さ」）。疑問詞のある「何なのさ」はよい（2026-10-26 順151） */
    if (/^[]*なのさ/.test(to) && /[一-鿿々ァ-ヶー]$/.test(head) && !/(?:何|なに|なん|どう|なぜ|どこ|いつ|誰|どれ|どんな)/.test(head)) return true;
    var t0 = to.replace(/^[\uE061]+/, '');
    if (FINAL_P.test(head) && /^[よねわぞぜさ]/.test(t0) && !PAIR_OK.test(head.slice(-1) + t0.charAt(0))) return true;
    /* 終助詞一つ（ね・よ など）の項目を、終助詞の後ろ（「決めたよね」の「ね」）で別の語尾にしない：「決めたよっしょ」「決めたよじゃん」 */
    if (/^[よねなさぞぜわ]$/.test(from) && FINAL_P.test(head) && !PAIR_OK.test(head.slice(-1) + t0.charAt(0))) return true;
    /* 「それはですね」「実はですね」のような間を取る「です」（「は」の直後）は、文末ではないので、間の形（〜ね・〜な）を崩す言い換えはしない
       （「それはですけどね」「それはです」にしない。「それはっすね」「それはですな」はよい）。「あなたもですよ」「私にですか」は文末なので言い換える */
    if (from === 'ですね' && /は$/.test(head) && (/けど|が$/.test(t0) || !/[ねな]$/.test(t0))) return true;
    /* 「やめよ」「しよ」「食べよ」（誘い・命令の「よ」）を、終助詞の「よ」として言い換えない（「やめ……ね」「しわよ」にしない） */
    if (from === 'よ' && /(?:[えけげせぜねべめれ]|(?<!だ)し)$/.test(head) && t0.charAt(0) !== 'よ') return true;
    /* 継ぎ目で同じかなが繰り返す：「ではない」＋「ではないか」、「くれたまえ」＋「たまえ」 */
    for (var L = 2; L <= t0.length; L++) { var pf = t0.slice(0, L); if (/^[ぁ-ゖ]+$/.test(pf) && head.slice(-L) === pf) return true; }
    /* 問いに、言いさしの「けど」を足さない（「何なの」→「何なんだけど？」にしない） */
    if ((/^[？?]/.test(punct) || isQuestion(head + (from || ''))) && /けど[〜ー～]*$/.test(t0) && !/けど$/.test(from || '')) return true;
    /* 問いでも「〜のだ」「〜んだ」「〜の（よ・さ）」（何をしているのだ？・いつからなんだ？・何なのよ）はよい */
    if (qm || /[？?]$/.test(to) || /[のん]だ$/.test(to)) return false;
    /* 問いに念押し・言い切りの語尾を足さない（元の文にもともとあった語尾の言い換えはよい：「ね？=ね〜？」） */
    var tq = (head + t0).replace(/[〜ー～]+$/, ''), oq = (head + (from || '')).replace(/[〜ー～]+$/, '');
    if (/^[？?]/.test(punct) && /(?:[よわぞぜさだね！!]|である|なあ)$/.test(tq) && tq.slice(-1) !== oq.slice(-1)) return true;
    /* 問いの終わりの「かな」「かね」「かい」「かしら」は問いの形なのでよい（「何をしたんですかな」） */
    if (isQuestion(head + (from || '')) && !/の[よさ]$/.test(to) && /(?:[よわぞぜさだな！!]|である|なあ)[〜ー～]*$/.test(to) && !/(?:かな|かね|かい|かしら|だい|かなあ)[〜ー～]*$/.test(to)) return true;
    return false;
  }
  /* 強い文（「！」で終わる文：怒り・制止・驚き）の語尾（2026-10-26 の利用者の指摘「理由を特定して、ルールでカバー」）。
     ・元の文の説明の「〜のだ（ぞ・よ・な）」は外す（「台無しになるところだったのだぞ！」→「台無しになるところだった！」、「変装なのだ！」→「変装だ！」）。
       感嘆符を落とす口調で「〜のだ。」が残る（冷静の「〜だったのだ。」）のもこれで防ぐ
     ・文末の表の候補が、元の文にない説明・念押しの語尾（のだ・んだ・のよ・だし・もん・ね・ねえ・なあ）を足すなら、その候補は使わない
       （「だったんだし！」「だったんだよねえ！」「黙ってねえ！」にしない。元の「んだ」を「の」「のよ」に置き換える、元の「ね」を「ねえ」にするのはよい）
     「のだ」「のじゃ」そのものが口調の持ち味の口調は、辞書の [規則] に 強い文の説明=残す と書けば、どちらもしない */
  var STRONG_EXPL = /(?:なのだ[よぞな]?|のだ[よぞな]?|んだ[よぞし]?|のよ|の|ないし|いし|だし|だもん|もん|けど|ねえ|ね|なあ)$/;
  /* 「ない」を「ねえ」にした（怒ってねえ・聞いてねえ）のは否定の形で、念押しの「ねえ」ではない */
  function negNee(from, t) { return /ない$/.test(from) && /ねえ$/.test(t) && !/ないねえ$/.test(t); }
  function strongCut(body) {
    var st = splitTail(body), core = st[0];
    if (core.slice(-1) === MARK) return body;
    var m = core.match(/(な)?のだ(?:ぞ|よ|な)?$/);
    if (!m) return body;
    var head = core.slice(0, core.length - m[0].length);
    if (!head || /[、\s　]$/.test(head)) return body;
    /* 「〜のものだ！」の「もの」は名詞で、説明の「のだ」ではない（「勝利は村人陣営のも！」にしない） */
    if (!m[1] && /も$/.test(head)) return body;
    return head + (m[1] ? 'だ' : '') + st[1];
  }
  function addsExpl(from, c) {
    var t = c.replace(/[〜ー～…‥っッ♡]+$/, ''), m = t.match(STRONG_EXPL);
    if (!m) return false;
    var w = m[0];
    if (/^(?:な?のだ|んだ|のよ|の$)/.test(w)) return !/[んの]/.test(from);
    if (/(?:し|もん|けど)$/.test(w)) return !/(?:し|もん|けど)$/.test(from);
    if (/ねえ?$/.test(w)) return !/ね$/.test(from) && !negNee(from, t);
    if (w === 'なあ') return !/な$/.test(from);
    return false;
  }
  /* 足した語尾を続く文で重ねない：候補が元の文にない ねえ・よぉ・し（だし・ないし）・もん・のだ・なあ・ね を足すとき、その語。
     前の文で足したのと同じ語を足す候補は、ほかの候補があれば使わない（「じゃないし。……それだけだし」「座ってねえ。……聞いてないねえ」にしない） */
  var ADD_TAIL = /(?:ねえ|よぉ|し|もん|のだ[よぞ]?|なあ|ね|んだ)$/;
  function addedTail(from, to) {
    if (to === from) return '';
    var t = to.replace(/[〜ー～…‥っッ♡]+$/, ''), m = t.match(ADD_TAIL);
    return m && from.slice(-m[0].length) !== m[0] && !negNee(from, t) ? m[0] : '';
  }
  /* 文末の表を一つの文に当てる（最初に合った項目だけ）。strong：強い文（「！」）で、説明・念押しの語尾を足さない。avoid：前の文で足した語尾 */
  /* 見たまま・詠嘆・確認の「な」（「いい匂いがするな」「思ったより緊張するな」「よく来てくれるな」「分かるな」）を、禁止の「な」（「動くな」）と取り違えない。
     文脈までは読めないので、次のどれかなら詠嘆とみる：問い（「〜するな？」）、「よろしくな」、状態の動詞（分かる・できる・見える・似合う・〜がする など）、
     最後の区切りの中に主語の「が」（「気が利くな」）や、程度・感想の副詞（思ったより・よく・なかなか・さすが など）がある。
     「もう」「二度と」「絶対」「勝手に」があれば禁止。「〜だな」「〜たな」「〜ているな」「形容詞＋な」「〜なあ」は、もともと動詞＋な の項目に当たらない */
  var NA_STATIVE = /(?:分かる|わかる|できる|見える|聞こえる|似合う|違う|助かる|困る|疲れる|ある|要る|足りる|思える|感じる|がする)な$/;
  var NA_ADV = /思ったより|意外と|意外に|(?<![ぁ-ゖ])よく(?!な)|なかなか|本当に|ほんとに|ずいぶん|随分|やっぱり|やはり|相変わらず|案外|さすが|いつも|妙に|結構|けっこう|つくづく|実に/;
  function exclaimNa(s, punct) {
    if (/^[？?]/.test(punct)) return true;
    if (/もう|二度と|絶対|決して|勝手に|むやみに/.test(s)) return false;
    if (/しくな$/.test(s) || NA_STATIVE.test(s)) return true;
    var cl = s.slice(0, -1).split(/[、，…‥]/).pop();
    return /[一-鿿々ァ-ヶーいのんと]が(?![らりるれろっせさしすそ])/.test(cl) || NA_ADV.test(cl);
  }
  /* 女性の話し手の文末の仕上げ（tone-plus.js の femKiri）でも、詠嘆の「な」と禁止の「な」を分けるのに使う */
  T.exclaimNa = exclaimNa;
  /* 決まり文句（おはよう・ありがとう・ごちそうさまでした・すみませんでした など）の中の語尾は活用させない（「おはましょう」「おはようぜ」「ごちそうさまだったっす」にしない）。
     記号（！・？・〜）を足すだけの候補はよい。「〜でした」「〜ました」の決まり文句は、終助詞を一つ足すだけの候補もよい（ありがとうございましたわ・お疲れさまでしたぞ） */
  var GREET = /(?:おはよう|ありがとう|おめでとう|ごちそうさまでした|ごちそうさま|お粗末さまでした|お粗末さま|お疲れさまでした|おつかれさまでした|すみませんでした|申し訳ありませんでした|申し訳ございませんでした|ありがとうございました|ごめんなさい)$/;
  /* hot：2＝息の詰まる声（「……っ」を含む・「……！」で終わる。山場の声・崩れ・懇願など）、1＝「！」で終わる台詞・想いを告げる台詞や文（T.apply の WARM）。
     どちらも皮肉・濁し・問い返しの語尾（〜が・〜けど（ね）・〜よ？・〜か）と、文を足す候補を使わない。2 は語尾を伸ばす（〜ですよー）のも足さない
     （2026-10-28 担当KG：無愛想・ひねくれの敬語の攻めが、山場で「好きですが。」「まとまりませんが。」「一緒にいきましょうか……！」と冷めた・問い返す形になっていた） */
  function applyEnds(body, punct, ends, seed, i, strict, strong, avoid, once, grave, hot, rest) {
    if (!ends || !ends.length) return { body: body, punct: punct };
    var st = splitTail(body), core = st[0];
    /* 語彙で置き換えた語が文末にあるとき：活用の形で終わる置き換え（ている→てる・ていた→てた・ていない→てねえ・分からない→分からへん）なら、
       印を外して文末の処理も当てる（2026-10-30 第5回。「〜てる」に「〜てるぜ」「〜てんだ」が付かなかった）。
       終助詞・記号・文で終わる置き換え（ありがとう=ありがとな！・ごめん=ごめんね・すごい=すごいじゃん）は、これまでどおり重ねて当てない */
    if (core.slice(-1) === MARK) {
      var vm = core.match(VOCAB_END);
      if (!vm || !VOCAB_TAIL.test(vm[1]) || /[。、！？!?…‥]/.test(vm[1])) return { body: body, punct: punct };
      core = core.slice(0, core.length - vm[0].length) + vm[1];
    }
    for (var j = 0; j < ends.length; j++) {
      var e = ends[j], from = e[0], qm = /[？?]$/.test(from);
      /* 「ません？=ませんこと？」のように ？ 付きの項目は、文末記号ごと見る */
      if (qm) { if (!/^[？?]/.test(punct)) continue; from = from.slice(0, -1); }
      var head = core.slice(0, core.length - from.length);
      if (core.length >= from.length && core.slice(core.length - from.length) === from && (!e[2] || e[2].test(head.replace(new RegExp(MARK, 'g'), '')))
        /* 先読み（条件の最後の (?=…)／(?!…)）：語のすぐ後ろ（飾り・文末の記号・そのあとの文） */
        && (!e[3] || e[3].test((st[1] + punct + (rest || '')).replace(new RegExp(MARK, 'g'), '')))) {
        /* 当ててはいけない候補は外して選ぶ。全部だめなら、この文は元のまま（短い項目に落ちると、もっと崩れるので） */
        var h0 = head.replace(new RegExp(MARK, 'g'), ''), ask = strict && !qm && (/^[？?]/.test(punct) || isQuestion(h0 + from));
        /* 動詞＋「な」の禁止の項目（な(動詞の終わり)=でない・するな=するでない）は、詠嘆の「な」には当てない（次の項目へ） */
        if (/な$/.test(from) && !(from === 'な' && !e[2]) && /[うくぐすつぬぶむる]な$/.test(h0 + from) && exclaimNa(h0 + from, punct)) continue;
        var gm = (h0 + from).match(GREET), inGreet = gm && from.length < gm[0].length;
        var okc = e[1].filter(function (c) {
          if (badEnd(h0, c, punct, qm, from)) return false;
          if (inGreet && c.replace(/[！!？?〜ー～…‥]+$/, '') !== from && !(/(?:でした|ました)$/.test(gm[0]) && c.indexOf(from) === 0 && /^[ぁ-ゖ]{1,2}[！!？?〜ー～…‥]*$/.test(c.slice(from.length)))) return false;
          /* 重い台詞（死別など）に、勢いの「！」を足さない */
          if (grave && c !== from && /[！!]/.test(c) && !/[！!]/.test(from)) return false;
          if (strict && /^[！!]/.test(punct) && /[。、]/.test(c.replace(/^[…‥、]+/, ''))) return false;
          /* 新しい規則を使う辞書：問いの形を足す候補（「ですよ？」）は「！」の文・読点で続く文に、「が」で濁す候補（「ませんが」）は「！」の文に当てない */
          if (strict && c !== from && /[？?]$/.test(c) && !/[？?]$/.test(from) && /^[！!、，]/.test(punct)) return false;
          if (strict && c !== from && /が$/.test(c) && !/が$/.test(from) && /^[！!]/.test(punct)) return false;
          if (hot && c !== from) {
            var cx = c.replace(/[〜ー～…‥っッ♡！!]+$/, ''), fx0 = from.replace(/[？?]$/, '');
            /* 問いの「か」「の」に付ける「？」（明るい敬語の「ですか？」）はよい。言い切りに足す「〜よ？」は足さない */
            if (/(?:が|けど|けれど|けどね|けれどね)$/.test(cx) && !/(?:が|けど|けれど)$/.test(fx0)) return false;
            if (!qm && /[？?]$/.test(cx) && !/[？?]$/.test(from) && !/[かの]$/.test(fx0)) return false;
            if (hot === 2 && cx.indexOf(fx0) === 0 && /^(?:か|かね)$/.test(cx.slice(fx0.length))) return false;
            /* 文を足す候補（「〜ください。……まあ、一応」）も足さない */
            if (/[。、]/.test(c.replace(/^[…‥、]+/, '')) && !/[。、]/.test(from)) return false;
            /* 語尾を伸ばす（〜ですよー）のも、強い台詞では足さない（山場の声が間延びしないように） */
            if (hot === 2 && /[ー〜～]$/.test(c) && !/[ー〜～]$/.test(from)) return false;
          }
          if (strong && c !== from && addsExpl(from, c)) return false;
          /* 新しい規則を使う辞書：問いには、問いの形（か・の・かな・かね など）でない付け足し（「たよぉ？」「でしょ、たぶん？」）を当てない */
          if (ask && c !== from && (!/(?:か|の|かな|かい|かね|だい)[〜ー～ぁあ]*$/.test(c) || /[。、]/.test(c.replace(/^[…‥、]+/, '')))) return false;
          return true;
        });
        if (!okc.length) return { body: body, punct: punct };
        /* 一度だけ（規則）の下見：この文に「けどね」を足す候補が当てられるか（T.apply が、付けられる最後の文を探すのに使う）。
           文を足す候補（「た。……まあ、一応」「だよ。知らないけど」）は台詞の終わりに置く一言なので、下見では数えない（その口調は、これまでどおり最後の文だけ） */
        if (once && once.probe) return { canOnce: okc.some(function (c) { return !(/[。、]/.test(c.replace(/^[…‥、]+/, '')) && !/[。、]/.test(from)) && once.list.some(function (w) { return w && c.indexOf(w) >= 0 && from.indexOf(w) < 0; }); }) };
        if (avoid) { var ok2 = okc.filter(function (c) { return addedTail(from, c) !== avoid; }); if (ok2.length) okc = ok2; }
        /* 一度だけ（規則）：「けどね」を足す候補は、台詞の中でその語を付けられる最後の文（once.cur）で、まだ台詞にない（元の台詞にもない）ときだけ */
        if (once && (once.used.length || !once.cur)) { var ok3 = okc.filter(function (c) { return !once.list.some(function (w) { return w && c.indexOf(w) >= 0 && from.indexOf(w) < 0; }); }); if (!ok3.length) return { body: body, punct: punct }; okc = ok3; }
        var to = okc.length === e[1].length ? choose(e[1], seed + '#e' + i) : choose(okc, seed + '#e' + i);
        var added = addedTail(from, to);
        if (once) once.list.forEach(function (w) { if (w && to.indexOf(w) >= 0 && from.indexOf(w) < 0 && once.used.indexOf(w) < 0) once.used.push(w); });
        if (qm) { var tq = to.match(/[？?]+$/); to = to.replace(/[？?]+$/, ''); punct = (tq ? tq[0] : '') + punct.replace(/^[？?]+/, ''); }
        /* 候補が「！」「？」で終わり、文末に飾り（……・――・っ）があるときは、記号を飾りの後ろへ（「誰か――！」→「誰か！――！」にしない） */
        /* 敬語→ため口の表で言いよどみの頭が変わる（「す、すみません」→「ご、ごめん」）ときは、言いよどみも合わせる */
        if (ends === CASUAL_ENDS && /^[ぁ-ゖ]/.test(to) && to.charAt(0) !== from.charAt(0) && head.slice(-2) === from.charAt(0) + '、') head = head.slice(0, -2) + to.charAt(0) + '、';
        /* 敬語→ため口の表で問いの「か」を外した（行きますか。→行く）ときは、問いの「？」を付ける（行く？） */
        if (ends === CASUAL_ENDS && /か$/.test(from) && !/か$/.test(to) && !/^[？?！!]/.test(punct)) punct = '？' + punct.replace(/^。/, '');
        var tb = !qm && st[1] && to.match(/[！？!?]+$/);
        if (tb) { to = to.slice(0, to.length - tb[0].length); if (!/^[！？!?]/.test(punct)) punct = tb[0] + punct.replace(/^。/, ''); }
        /* {る}{た}{ない}{なかった}{よう}：丁寧形の語幹（〜ます の前）を活用させる */
        if (/\{(る|た|ない|なかった|よう|て)\}/.test(to)) {
          var sm = head.match(/([ぁ-ゖ一-鿿々ァ-ヶー]+?)([きぎしちにびみりいえけげせぜてでねべめれ]|[一-鿿々])$/);
          var stem = sm ? sm[0] : head, rest = head.slice(0, head.length - stem.length);
          /* 語幹は、直前の漢字・かな続き（「飲み」「やってみ」「勉強し」）。長すぎる語幹は最後の数文字に */
          if (stem.length > 6) { rest = head.slice(0, head.length - 6); stem = head.slice(-6); }
          to = to.replace(/\{(る|た|ない|なかった|よう|て)\}/g, function (m, f) { return conj(stem, f); });
          return { body: rest + to + st[1], punct: punct, tail: added };
        }
        /* 語尾を消した（「よろしく、です」→「よろしく、」）ときは、残った読点も外す */
        return { body: (to === '' ? head.replace(/[、\s　]+$/, '') : head) + to + st[1], punct: punct, tail: added };
      }
    }
    return { body: body, punct: punct };
  }
  var SET_PHRASE = /^(?:ありがとうございま(?:す|した)|よろしくお願いします|おはようございます|申し訳(?:あり|ござい)ません|おやすみなさい|お願いします|わかりました|分かりました|すみません|失礼します|了解です|大丈夫です|お疲れさまです|お疲れさまでした|ごめんなさい)$/;
  /* 敬語 → ため口（規則「短い文はため口」で使う組み込みの表。長いものから） */
  var CASUAL_ENDS = [
    ['ありがとうございました', ['ありがとう']], ['ありがとうございます', ['ありがとう']], ['よろしくお願いします', ['よろしく']], ['おはようございます', ['おはよう']], ['申し訳ありません', ['ごめん']], ['申し訳ございません', ['ごめん']],
    ['おやすみなさい', ['おやすみ']], ['ないでください', ['ないで']], ['お願いします', ['お願い']],
    /* 決まり文句の過去形（「ごちそうさまだった」にしない） */
    ['ごちそうさまでございました', ['ごちそうさま']], ['ごちそうさまでした', ['ごちそうさま']], ['お粗末さまでした', ['お粗末さま']],
    /* 言いよどみの「ありがとう、ございました」も一つの決まり文句（「ありがとう、あった」にしない） */
    ['ありがとう、ございました', ['ありがとう']], ['ありがとう、ございます', ['ありがとう']], ['お疲れさまでございました', ['お疲れさま']], ['お疲れさまでした', ['お疲れさま']], ['おつかれさまでした', ['おつかれさま']],
    /* 「お〜ください」は「ちょうだい」にすると崩れる（「お待ちちょうだい」）ので、よく出るものは言い換えを決めておく */
    ['お召し上がりください', ['食べて']], ['お待ちください', ['待ってて']], ['お入りください', ['入って']], ['お掛けください', ['座って']], ['おかけください', ['座って']], ['お座りください', ['座って']],
    ['お休みください', ['休んで']], ['お楽しみください', ['楽しんで']], ['ご覧ください', ['見て']], ['お越しください', ['来て']], ['お使いください', ['使って']],
    ['ください', ['{て}'], /(?:^|[^ぁ-ゖ一-鿿々])お[一-鿿々]{1,2}[ぁ-ゖ]$/],
    /* 「〜ますから」「〜ですけど」：つなぎの言葉の前の丁寧語も崩す */
    ['ませんから', ['{ない}から']], ['ましたから', ['{た}から']], ['ますから', ['{る}から']], ['ますけど', ['{る}けど']], ['ますので', ['{る}から']],
    ['ですから', ['から'], /い$/], ['ですから', ['だから']], ['ですけど', ['けど'], /い$/], ['ですけど', ['だけど']], ['ですので', ['から'], /い$/], ['ですので', ['だから']], ['わかりました', ['わかった']], ['分かりました', ['分かった']], ['すみません', ['ごめん']], ['失礼します', ['失礼']],
    ['いかがでございますか', ['どう']], ['いかがですか', ['どう']], ['いかがでしょうか', ['どうかな']], ['でございますか', ['なの']], ['ございますか', ['あるの']],
    ['てください', ['て']], ['でください', ['で']], ['ください', ['ちょうだい']], ['ませんでした', ['{なかった}']], ['ましたか', ['{た}']], ['ませんか', ['{ない}']], ['ましょうか', ['{よう}か']], ['ましょう', ['{よう}']],
    ['ませんね', ['{ない}ね']], ['ませんよ', ['{ない}よ']], ['ましたね', ['{た}ね']], ['ましたよ', ['{た}よ']],
    ['ますよね', ['{る}よね']], ['ますね', ['{る}ね']], ['ますよ', ['{る}よ']], ['ますか', ['{る}']], ['ました', ['{た}']], ['ません', ['{ない}']], ['ます', ['{る}']],
    /* 「〜んです」は「〜んだ」に（「いいんです」→「いいん」にしない） */
    ['んですよね', ['んだよね']], ['んですけど', ['んだけど']], ['んですから', ['んだから']], ['んですか', ['の'], /[るたいうくつすぬむぶぐ]$/], ['んですね', ['んだね']], ['んですよ', ['んだよ']], ['んでした', ['んだった']], ['んでしょう', ['んでしょ']], ['んです', ['んだ']],
    ['でしょうか', ['かな']], ['でしょう', ['でしょ']], ['ですよね', ['だよね']], ['ですね', ['ね'], /い$/], ['ですよ', ['よ'], /い$/], ['ですね', ['だね']], ['ですよ', ['だよ']], ['ですか', ['']], ['でした', ['だった']], ['です', ['']]
  ];
  /* ---------- 規則「皮肉の型」（ひねくれ敬語。2026-10-29 利用者の報告「やたら疑問形を使う」「意外ですよ？ではなく、へえ、意外ですね」「まあ、急がなくていいですよ？ではなく、別に、急がなくていいんじゃないですか」） ----------
     皮肉の形を くじだけで散らさず、文の種類で選ぶ（敬語のベースの文。問い・頼みごと・強い声は辞書の文末のまま）：
       反応（意外・なるほど・面白い・珍しい・上手 など、相手の話への感想）… 「へえ、〜ですね」（問いの形にしない。「へえ、」は台詞の最初の文で、その語で始まる短い文だけ）
       念押し・勧め（〜なくていい・〜ていい・〜でいい・〜ほうがいい）… 「別に、〜んじゃないですか」（ほうがいい には「別に、」を付けない）
       言い返し（別に・ふん・そんな・違います・〜ません で始まる／終わる文）… 辞書の候補のまま（〜ませんが・〜ですよ？・〜じゃないですか？ はここだけ）
       説明（そのほか）… 問いの形を足す候補（〜ですよ？・〜じゃないですか？・〜でしょう？）を外す
     同じ場面（voice.js の processText 一回）で直前のこの人の台詞が「〜よ？」なら、言い返しでも問いの形を足さない（T.scene） */
  var TW_REACT = /^(?:へえ|ほう|なるほど|意外|面白|おもしろ|珍し|素敵|さすが|お上手|上手|立派|初耳|知りませんでした|知らなかった|すご)/;
  var TW_REACT_IN = /意外|なるほど|面白い|おもしろい|珍しい|素敵|さすが|上手|立派|初耳|似合|話しやすい|仲がいい|いいコンビ|意外と/;
  /* 相手に向けた許し・勧めだけ（「私は平気です」「思われてもいいです」「五分で構いません」のような自分のことの言い切りは除く） */
  var TW_URGE = /^(.*?)((?:なくて|なくても|(?<![れせ])ても|でも|て|で)いい|なくても大丈夫|(?:ほう|方)がいい)(?:んです|のです|です)(?:よ|ね|よね)?$/;
  var TW_RETORT = /^(?:別に|べ、別に|ふん|は？|はあ|そんな(?:こと|の|わけ)|違います|うるさ|余計な|大きなお世話|知りません|関係(?:あり|ない)|どうでも|勝手に)|(?:ません|ませんでした)(?:よ|が|けど)?$/;
  var TW_POL_END = /(?:です|ます|ません|ました|でした|でしょう)(?:よ|ね|よね)?$/;
  function twistSeg(body, punct, core0, first, seed, noQ) {
    var st = splitTail(body), core = st[0];
    var ask = /^[？?]/.test(punct) || /(?:か|かね|でしょうか)$/.test(core0);
    if (ask || /(?:ください|くださいね|ませんか|ましょう|ましょうか)$/.test(core0) || !TW_POL_END.test(core0)) return { type: 'other' };
    /* 念押し・勧め */
    var um = core0.length <= 30 && core0.match(TW_URGE);
    if (um && !/ません$/.test(um[1]) && !/私|わたし|俺|僕/.test(core0)) {
      var mk = core.match(/(?:んです|のです|です)?(?:よ|ね|よね)?$/), stem = core.slice(0, core.length - mk[0].length);
      if (!/(?:いい|大丈夫|平気|構いません)$/.test(stem.replace(new RegExp(MARK, 'g'), ''))) return { type: 'other' };
      stem = stem.replace(/構いません$/, '構わない').replace(/(大丈夫|平気)$/, '$1な');
      var giveBetsu = first && !/(?:ほう|方)がいい$|ばいい$|たらいい$/.test(um[2]) && !/別に/.test(core0) && !LEAD_DONE.test(core0);
      return { body: (giveBetsu ? '別に、' : '') + stem + 'んじゃないですか' + st[1], lead: giveBetsu, type: 'urge' };
    }
    /* 反応 */
    if (core0.length <= 20 && !/ません/.test(core0) && (TW_REACT.test(core0) || TW_REACT_IN.test(core0))) {
      var em = core.match(/(です|ます|ました|でした|でしょう)(?:よ|ね|よね)?$/);
      if (em) {
        var head = core.slice(0, core.length - em[0].length) + em[1] + 'ね';
        var pre = first && TW_REACT.test(core0) && !/^(?:へえ|ほう|なるほど)/.test(core0) && !LEAD_DONE.test(core0) ? (hash(seed) % 3 ? 'へえ、' : 'ほう、') : '';
        return { body: pre + head + st[1], lead: !!pre, type: 'react' };
      }
    }
    if (TW_RETORT.test(core0)) return { type: noQ ? 'retortNoQ' : 'retort' };
    return { type: 'explain' };
  }
  /* 型ごとの文末の候補（辞書の候補から、問いの形を足すものを外す。辞書ごとに作り置く） */
  function twistEnds(d, type, noQ) {
    if (type === 'retort' || type === 'other') return d.ends;
    var c = d._twEnds || (d._twEnds = d.ends.map(function (e) {
      var keep = e[1].filter(function (x) { return /[？?]$/.test(e[0]) || !/[？?]$/.test(x); });
      return [e[0], keep.length ? keep : [e[0]], e[2], e[3]];
    }));
    return c;
  }

  /* ---------- 適用 ---------- */
  T.apply = function (q, d, who) {
    if (!q || !d) return q;
    var seed = q + '#' + ((who && who.name) || '');
    /* 名前の伏せ字（voice.js の HK.NameGuard）の中では、元の名前でくじを引く（伏せる前と同じ言い回しを選ぶ） */
    if (HK.NameGuard && HK.NameGuard.stack.length) seed = HK.NameGuard.decAll(seed);
    var q0 = q, dots0 = (q.match(/[…‥]+/g) || []).reduce(function (n, x) { return Math.max(n, x.length); }, 0);
    var r = d.rules || {}, fx = d.effects || {};
    /* 重い台詞（死別・別れ・しんみりした思い出の言い切り）：勢いの「！」「よっしゃ」を足さない（熱血など） */
    var grave = GRIEF.test(q0);
    /* 規則（文の内側） */
    if (r.prog) q = ruleProg(q, r.prog);
    if (r.exist) q = ruleExist(q, r.exist, r.neg);
    if (r.contract) q = ruleContract(q);
    /* 語彙 */
    if (d.words && d.words.length) {
      var re = d.wordsRe || (d.wordsRe = new RegExp(d.words.map(function (w) { return w[0]; }).sort(function (a, b) { return b.length - a.length; }).map(esc).join('|'), 'g'));
      var map = d.wordsMap || (d.wordsMap = d.words.reduce(function (m, w) { if (!m[w[0]]) m[w[0]] = w[1]; return m; }, {}));
      var k = 0;
      /* 置き換えた語は印で包み、文末の処理（ます→っす など）が重ねて当たらないようにする */
      q = q.replace(re, function (m, at, all) {
        /* 「元=元」（同じ語）も、ほかの語と同じく印で包んで返す（文末の処理から守る）。短い語が長い語の中に当たらないようにも使える（ばかり=ばかり があれば「ばか」は「ばかり」に当たらない） */
        var nx = all.slice(at + m.length), cands = map[m];
        /* 重い台詞では、勢いを足す候補（ありがとう=ありがとな！・分かった=よっしゃ！）は使わない。残らなければ元のまま */
        if (grave) { cands = cands.filter(function (c) { return !(/[！!]|よっしゃ/.test(c) && !/[！!]|よっしゃ/.test(m)); }); if (!cands.length) return m; }
        var to = choose(cands, seed + '#w' + (k + 1));
        /* 「ごめんだ」「御免だ」「ごめんこうむる」（断る）は謝りではない */
        if (/^(?:ごめん|御免)/.test(m) && /^(?:だ|です|被|こうむ)/.test(nx)) return m;
        /* 「だ」で終わる語（だめだ=ならぬ）が「だめだった」「だめだろう」の頭に当たって「ならぬった」にならないように（言い換えが「だ」で終わるならよい） */
        if (/だ$/.test(m) && !/だ$/.test(to) && /^[っろ]/.test(nx)) return m;
        /* 「！」で終わる言い換え（みんな=みんな！）の後ろにかなが続く（「みんなには」「そうだね」）なら当てない（「みんな！　には」にしない） */
        if (/[！!？?]$/.test(to) && /^[ぁ-ゖー〜]/.test(nx.replace(new RegExp(MARK, 'g'), ''))) return m;
        /* 語の続きを切らない：「食べた」の語が「食べたい」「食べたくて」に当たって「食ったい」にならないように */
        if (/た$/.test(m) && /^(?:い|く|かっ|が[らりるれっ]|けれ)/.test(nx)) return m;
        /* 「ごめん」「おやすみ」の語が「ごめんなさい」「おやすみなさい」に当たって「すまん！なさい」にならないように */
        if (/^なさい/.test(nx)) return m;
        /* 間投詞のようなかな2文字までの語（うん・はい・まあ・でも・おい・あら）は、語の中に当てない：「言うんだ」の「うん」、「おいしい」の「おい」、「それでも」の「でも」 */
        if (/^[あいうえおはわまで][ぁ-ゖ]?$/.test(m) && (/^[ぁ-ゖ]/.test(nx) || /[ぁ-ゖ]$/.test(all.slice(0, at)))) return m;
        var pv = all.slice(0, at).replace(new RegExp(MARK, 'g'), '');
        /* 頭に間投詞を足す言い換え（ごめん=あー、ごめん・がんばる=まあ、がんばる）は、文の途中（「謝るの下手でごめん」）では足さない */
        if (/^[^、。]{1,4}、/.test(to) && to.slice(to.indexOf('、') + 1).indexOf(m) === 0 && /[ぁ-ゖ一-鿿々ァ-ヶー、]$/.test(pv)) return m;
        /* 言いよどみの言い換え（すごい=す、すごい）は、元の文がもう同じ音で言いよどんでいれば重ねない（「す、す、すごい」にしない） */
        if (/^[ぁ-ゖァ-ヶ][、…‥]/.test(to) && pv.slice(-2) === to.slice(0, 2)) return m;
        /* 言い換えの付け足しが、元の文の続きと重なる：「ごめん=ごめんね」が「ごめんね」に当たって「ごめんねね」にならないように */
        if (to.length > m.length && to.indexOf(m) === 0) { var ad = to.slice(m.length).replace(/^[\s　]+/, ''); if (ad && /^[ぁ-ゖ〜ー]/.test(ad) && nx.indexOf(ad.charAt(0)) === 0) return m; }
        /* 語彙が足した念押しの語尾（だめ=だめだよ・だめ=いけないよ・ごめん=ごめんね）は、語のすぐ後に続きがある（「ごめんねだから」「分かったよの」）・
           その文が問い（？）のときは外す：「だめだよ？」「いけないよかい？」にしない。読点・言い切りの前ではそのまま */
        var tl = to.match(/(?:だよ|なのさ|ねえ|よ|ね|ぞ|ぜ|わ|さ)[〜ー～]*$/);
        if (tl && to.length > tl[0].length && m.slice(-tl[0].length) !== tl[0] && !(/^ねえ/.test(tl[0]) && /ない$/.test(m))) {
          var cont = /^[^。！!？?、，…‥」』）)\s　]/.test(nx), ask = /^[^。！!？?]*[？?]/.test(nx);
          if (cont || ask) to = to.slice(0, to.length - tl[0].length).replace(/[、\s　]+$/, '');
        }
        k++;
        return MARK + to + MARK;
      });
      /* 文頭の語を消した（えっ=・うわ=）ときは、後ろの読点・感嘆符も消す（「、本当ですか」にしない） */
      q = q.replace(new RegExp('(^|[。！？!?」\\s　])' + MARK + MARK + '[、，…‥！!〜ー]*[\\s　]*', 'g'), '$1');
    }
    /* 驚き・笑い（語彙のあと。置き換えた語は印で包む） */
    if (r.surprise) q = ruleSurprise(q, r.surprise, seed);
    if (r.laugh) q = ruleLaugh(q, r.laugh, seed);
    if (r.emph && r.emph.length) q = ruleEmph(q, r.emph, seed, r.emphRate);
    /* 文ごと */
    /* 強い台詞（hot）と、想いを告げる台詞（愛してる・大好き）・どもって始まる台詞（「お、おやめください」）は、皮肉・濁しの語尾を足さない。
       好き・かわいい・ありがとう・よかった・一緒・嬉しい・幸せ・お慕い・想い を含む文も、その文だけ足さない（WARM）。
       敬語のベース（P）から作る口調だけ（無愛想・ひねくれ・ダウナー系チャラ男などの、敬語に付けた皮肉・間延びの語尾。くだけた口調の「〜！」「〜っしょ」は口調の味なので触らない） */
    var dP = (d.base || T.BASE[d.key]) === 'P';
    /* 2：息の詰まる声（「……っ」を含む・「……！」で終わる）＝山場の声・崩れ。1：「！」で終わる台詞・想いを告げる台詞・どもって始まる台詞 */
    var q0t = q0.replace(/[\s　」]+$/, '');
    var hot = !dP ? 0 : /[…‥]っ/.test(q0) || /[…‥][！!]+$/.test(q0t) ? 2 : /[！!]$/.test(q0t) || /愛して|大好き|^[…‥]*([ぁ-ゖ])、\1/.test(q0) ? 1 : 0;
    var ss = segs(q), prevTail = '', once = r.once && r.once.length ? { list: r.once, used: r.once.filter(function (w) { return w && q.indexOf(w) >= 0; }), cur: false } : null, lastI = -1;
    ss.forEach(function (s, i) { if (s.body.replace(/[…‥、〜ー～っッ♡\s　]/g, '')) lastI = i; });
    /* 規則「皮肉の型」：この台詞の前置きを型の側で決めたか（決めたら、前置きの規則は当てない）。同じ場面の直前の台詞が「〜よ？」なら、この台詞では使わない */
    var twLead = false, twFirst = -1, twNoQ = !!(r.twistType && T.scene && T.scene[(who && who.name) || '']);
    if (r.twistType) ss.forEach(function (s, i) { if (twFirst < 0 && s.body.replace(/[…‥、〜ー～っッ♡\s　]/g, '')) twFirst = i; });
    /* 文ごとの下ごしらえ（規則・強い文・短い文はため口・皮肉の型）。文末の処理の前に全部の文を作っておき、規則「一度だけ」の付け先を決める */
    var prep = ss.map(function (s, i) {
      var body = s.body;
      if (r.neg) body = ruleNeg(body, r.neg);
      if (r.copula) body = ruleCopula(body, r.copula);
      if (r.drop) body = ruleDrop(body, r.drop, seed + i);
      if (r.flat) body = ruleFlat(body, s.punct, r.flat, seed + '#' + i);
      /* 文末 */
      var punct = s.punct, core0 = splitTail(body)[0].replace(new RegExp(MARK, 'g'), '').replace(/^[…‥、\s　]+/, ''), coreLen = core0.length;
      /* 短い文はため口（敬語まじり）：決まり文句（ありがとうございます・よろしくお願いします など）、助詞のない短い一言、短い問いは、組み込みの敬語→ため口の表で崩す。それ以外は辞書の文末 */
      var pre0 = core0.replace(/(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます)[かねよ]*$/, '');
      var sc = r.shortCasual != null && (SET_PHRASE.test(core0) || (coreLen <= r.shortCasual && !/[はがをにへとでもの]/.test(pre0)) || (/^[？?]/.test(punct) && coreLen <= r.shortCasual + 2));
      /* 強い文（「！」）：元の文の説明の「のだ」を外し、説明・念押しの語尾を足さない（強い文の説明=残す の口調は除く） */
      var strong = /^[！!]/.test(punct) && r.strongExpl !== '残す';
      if (strong) body = strongCut(body);
      var endsUse = sc ? CASUAL_ENDS : d.ends, done = null;
      if (r.twistType && !sc && !hot) {
        var tw = twistSeg(body, punct, core0, i === twFirst && !/^[…‥]/.test(s.body), seed + '#tw' + i, twNoQ);
        if (tw.body != null) { if (tw.lead) twLead = true; done = { body: tw.body.replace(new RegExp(MARK, 'g'), ''), punct: punct }; }
        else endsUse = twistEnds(d, tw.type, twNoQ);
      }
      return { body: body, punct: punct, core0: core0, sc: sc, strong: strong, endsUse: endsUse, done: done };
    });
    /* 規則「一度だけ」の付け先：その語を足す候補を当てられる最後の文（2026-10-30 第5回。以前は台詞の最後の文だけで、最後の文が頼み「〜くださいまし」や「〜ますから」だと、
       前の文の「〜ですわ」がどこにも付かず素の敬語になった）。当てられる文が無ければ、これまでどおり最後の文 */
    var onceAt = lastI;
    /* 先読みの条件に渡す「そのあとの文」（文末の処理の前の形） */
    var rests = prep.map(function (p, i) { return prep.slice(i + 1).map(function (x) { return x.body + x.punct; }).join(''); });
    if (once && !once.used.length) {
      for (var oi = prep.length - 1; oi >= 0; oi--) {
        var po0 = prep[oi];
        /* 読点で続く言いさし（「ですから、」）には付けない（「……ですからな、次は」にしない） */
        if (po0.done || po0.sc || (oi !== lastI && /^[、，]/.test(po0.punct))) continue;
        var pr = applyEnds(po0.body, po0.punct, po0.endsUse, seed, oi, newRules(r), po0.strong, '', { list: once.list, used: [], cur: true, probe: true }, grave, hot || (dP && WARM.test(po0.core0) ? 1 : 0), rests[oi]);
        if (pr.canOnce) { onceAt = oi; break; }
      }
    }
    ss = ss.map(function (s, i) {
      var po = prep[i];
      if (po.done) return po.done;
      var body = po.body, punct = po.punct, core0 = po.core0, sc = po.sc, strong = po.strong, endsUse = po.endsUse;
      if (once) once.cur = i === onceAt;
      var ap = applyEnds(body, punct, endsUse, seed, i, newRules(r), strong, prevTail, sc ? null : once, grave, hot || (dP && WARM.test(core0) ? 1 : 0), rests[i]);
      /* 「〜んだ」「〜なんだ」で終わった文の次の文には、「〜んだ」を足す候補を選ばない（「止まったんだ。もう止まっているんだ」にしない。2026-10-26 順151） */
      prevTail = ap.tail || (/[んの]だ$/.test(splitTail(ap.body.replace(new RegExp(MARK, 'g'), ''))[0]) ? 'んだ' : '');
      return { body: ap.body.replace(new RegExp(MARK, 'g'), ''), punct: ap.punct };
    });
    if (fx.stretch) ss = fxStretch(ss, seed);
    if (fx.bangOn && !grave) ss = fxBangOn(ss, seed);
    if (fx.short) ss = fxShort(ss, r.cutLen);
    q = join(ss);
    /* 言い換えで重なった記号を整える（「！。」「！、」「？？」） */
    q = q.replace(/([！？!?])。/g, '$1').replace(/([！？!?])、/g, '$1　').replace(/？(?=？)/g, '').replace(/！(?=！(?!！))/g, '').replace(/([！？])(?=[ぁ-ゖァ-ヶ一-鿿々「（])/g, '$1　');
    if (fx.bangOff) q = fxBang(q);
    /* 言い切りの規則を使う辞書（無機質など）は、感嘆符を落としたあとの台詞の終わりの「。」も外す（元の台詞が「。」で終わっていたときは残す） */
    if (fx.bangOff && newRules(r) && !/。$/.test(q0)) q = q.replace(/。$/, '');
    if (fx.stammer) q = fxStammer(q, seed);
    /* 前に……：文頭に「……」（けだるげ）。間を置く：文の切れ目の「。」を「。……」に（半分くらい） */
    if (fx.dots && !/^[…‥]/.test(q)) q = '……' + q;
    if (fx.pause) { var pk = 0; q = q.replace(/(?<![…‥])。(?=[^…‥])/g, function (m) { pk++; return hash(seed + '#pz' + pk) % 100 < 50 ? '。……' : m; }); }
    /* 「……」の重なり：語彙（ありがとう=……ありがと）や効果が足した「……」が元の「……」と並んだら一つに（元の文にあった長さまでは残す） */
    if (!/[…‥]。/.test(q0)) q = q.replace(/([…‥])。/g, '$1');
    /* 重なった語尾（「よよ」「ねね」）を一つに（元の文にあったものは残す） */
    q = q.replace(/(よ|ね)\1(?=[。！？!?…‥〜ー～」]|$)/g, function (m, c) { return q0.indexOf(m) >= 0 ? m : c; });
    q = q.replace(/[…‥]{3,}/g, function (m) { return m.length <= dots0 ? m : '……'; });
    /* 動揺（強い感情の文の頭）と前置き（台詞の頭）。喘ぎには付けない。動揺を付けた台詞には前置きを付けない */
    if (r.twistType && T.scene) T.scene[(who && who.name) || ''] = /よ[？?]/.test(q) && !/よ[？?]/.test(q0);
    if ((r.shaken || r.lead || r.leadS || r.leadR) && !MOAN.test(q0) && !twLead) {
      var shk = r.shaken ? ruleShaken(q, r.shaken, r.shakenRate == null ? 0.5 : r.shakenRate, seed) : null;
      if (shk != null) q = shk;
      else if ((r.lead || r.leadS || r.leadR) && !LEAD_DONE.test(q) && !/^[^。！？!?]*[！!]/.test(q) && q.replace(/[。、…‥！!？?\s　「」]/g, '').length > 6 && hash(seed + '#ld') % 100 < Math.round((r.leadRate == null ? 0.3 : r.leadRate) * 100)) {
        /* 言い切りの前置き（まあ、）は言い切りの台詞にだけ、反応の前置き（へえ、・ほう、）は感想・見立ての台詞にだけ */
        var sl = (r.leadS || r.leadR) ? stmtLine(q0) : 0;
        /* 台詞の中にもうある語（「……まあ、聞くだけは」）は前に重ねない */
        var notIn = function (c) { var w = c.replace(/[、。…‥！!？?\s　]+$/, ''); return !w || q.indexOf(w) < 0; };
        var lpool = (r.lead || []).concat(sl && r.leadS ? r.leadS.filter(notIn) : [], sl === 2 && r.leadR ? r.leadR.filter(notIn) : []);
        var lc = lpool.length ? choose(lpool, seed + '#ldc') : '';
        /* 語の前置き（やれやれ・フッ……・まあ、・ふむ、）は、短い台詞（組み込みの口調は10文字未満）、死別・謝り・お礼（NO_LEAD）、最初の文が名詞だけ（かなを含まない：「犬。」「大丈夫。」）には付けない。
           「……」だけの前置き（間を置く）はそのまま */
        if (lc && /[ぁ-ゖァ-ヶ一-鿿]/.test(lc) && ((T.dicts[d.key] === d && q.replace(/[。、…‥！!？?\s　「」]/g, '').length < 10) || NO_LEAD.test(q0) || /^[^ぁ-ゖ]+$/.test(q0.split(/[。！？!?]/)[0].replace(/[…‥、\s　]+$/, '')))) lc = '';
        if (lc) q = prefix(lc, q);
      }
    }
    /* 空の候補で消した笑い・驚きの後に残った記号（「、」で始まる台詞・「。、」） */
    if (r.surprise || r.laugh) {
      q = q.replace(/^[、\s　]+/, '').replace(/([。！？!?])、+/g, '$1').replace(/。[\s　]+/g, '。');
      /* 台詞が笑い声だけ（「はは」）で、消したら空になったときは「……」 */
      if (!q.replace(/[。、！？!?\s　]/g, '')) q = '……';
    }
    return q;
  };

  /* ---------- 1本の台詞に辞書を当てる（tone-registry.js で dictOnly の口調だけ。voice.js の processText から） ----------
     書き下ろしも従来の言い換えもない口調なので、台詞の形から K（常体）か P（敬語）かを見て、辞書のベースに寄せてから当てる。
     F は判定しない（硬い常体は K として扱い、F の辞書はそのまま当てる） */
  var P_FORM = /(?:です|ます|ません|ました|ましょう|でしょう|でした|ください|ございます)(?:か|よ|ね|よね|けど|から|が|し|の)?$/;
  /* 途中の文の敬語（「でしょう」はくだけた話し方でも使うので数えない） */
  var P_FORM_MID = /(?:です|ます|ません|ました|ましょう|でした|ください|ございます)(?:か|よ|ね|よね|けど|から|が|し|の)?$/;
  var P_FORM_IN = /(?:です|ます|ません|ました|ください|くださ|ございま)(?=[…‥っッ♡！？!?。、　\s〜ー]|$)/;
  T.formOf = function (q) {
    var ss = segs(String(q || '')).filter(function (s) { return s.body.replace(/[…‥、〜ー～っッ♡\s　]/g, ''); });
    var last = ss.length ? splitTail(ss[ss.length - 1].body)[0] : '';
    return P_FORM.test(last) ? 'P' : 'K';
  };
  /* 敬語の文をため口に（組み込みの敬語→ため口の表を全部の文に当てる） */
  T.casualize = function (q, seed) {
    var dots0 = (String(q).match(/[…‥]+/g) || []).reduce(function (n, x) { return Math.max(n, x.length); }, 0);
    var out = join(segs(q).map(function (s, i) { var ap = applyEnds(s.body, s.punct, CASUAL_ENDS, (seed || q) + '#cz', i); return { body: ap.body, punct: ap.punct }; }));
    /* 「なかった……です……」の「です」を外すと「……」が並ぶので、元の文にあった長さまでに */
    return out.replace(/[…‥]{3,}/g, function (m) { return m.length <= dots0 ? m : '……'; });
  };
  var CHEER_Q = /^[…‥\s]*(?:やった[ーぁあ〜！!、]|やったやった|わーい|わぁい|わあい|いえーい|イエーイ|やっほ|よっしゃ|たのしー|楽しー|うれしー|嬉しー)(?![^♡]*♡)/;
  T.apply1 = function (q, d, who) {
    if (!q || !d) return q;
    /* 喘ぎ・短い声には語尾を足さない（「気持ちいい……♡」）。ただし敬語でない口調なら、喘ぎの中の敬語だけ崩す（「気持ち、いい、です……」→「気持ち、いい……」。R18版は喘ぎの崩し方 HK.Moan.kForm） */
    /* 歓声（「やったぁ！」「わーい」）は喘ぎではない。辞書の語彙で言い換える（2026-10-26 順81） */
    if (!CHEER_Q.test(q) && (MOAN.test(q) || /[♡゛]/.test(q))) return d.base !== 'P' && P_FORM_IN.test(q) ? (HK.Moan && HK.Moan.kForm ? HK.Moan.kForm(q) : T.casualize(q, q)) : q;
    var f = T.formOf(q);
    /* 最後の文が常体でも、途中に敬語の文（「〜もらいますね。声も演目のうちなので」）があれば崩す（崩す表は敬語の文末にしか当たらない） */
    if (d.base !== 'P' && (f === 'P' || segs(q).some(function (s) { return P_FORM_MID.test(splitTail(s.body)[0]); }))) q = T.casualize(q, q);
    else if (f === 'K' && d.base === 'P' && HK.Voice && HK.Voice.polite) q = HK.Voice.polite(q);
    return T.apply(q, d, who);
  };

  /* ---------- 辞書の文字列を読む ---------- */
  var RULE_KEYS = { '否定': 'neg', '進行': 'prog', '断定': 'copula', '助詞落とし': 'drop', '縮約': 'contract', '強調語': 'emph', '強調語の割合': 'emphRate', '存在': 'exist', '短い文はため口': 'shortCasual', 'ため口を混ぜる': 'mixK', '皮肉の型': 'twistType',
    '前置き': 'lead', '言い切りの前置き': 'leadS', '反応の前置き': 'leadR', '一度だけ': 'once', '前置きの割合': 'leadRate', '驚き': 'surprise', '笑い': 'laugh', '言い切り': 'flat', '動揺': 'shaken', '動揺の割合': 'shakenRate', '強い文の説明': 'strongExpl', '読点で切る': 'cutLen' };
  var FX_KEYS = { '感嘆符を落とす': 'bangOff', '伸ばす': 'stretch', '言い切りに！': 'bangOn', '言い切りに!': 'bangOn', '短くする': 'short', '言いよどみ': 'stammer', '前に……': 'dots', '間を置く': 'pause' };
  /* 「元=先1／先2」の候補。空の候補（「です(い)=／です」の左側）は「消す」の意味で残す */
  function alts(v) { return String(v).split(/[／/]/).map(function (x) { return x.replace(/^\s+|\s+$/g, ''); }); }
  /* 条件の文字列を「後読み」と「最後の先読み」に分ける：「(?<!なく)(?![！!])」→ ['(?<!なく)', '(?![！!])']。最後の一番外のかっこが (?= か (?! なら先読み */
  function splitAhead(c) {
    if (!/\)$/.test(c)) return [c, ''];
    for (var p = c.length - 1, dp = 0; p >= 0; p--) {
      var ch = c.charAt(p), esc1 = p > 0 && c.charAt(p - 1) === '\\';
      if (esc1) continue;
      if (ch === ')') dp++;
      else if (ch === '(' && --dp === 0) return /^\(\?[=!]/.test(c.slice(p)) ? [c.slice(0, p), c.slice(p)] : [c, ''];
    }
    return [c, ''];
  }
  /* 文字列 → { dicts: { 鍵: 辞書 }, errors } */
  T.parse = function (text, userMode) {
    var out = { dicts: {}, errors: [] }, cur = null, sec = null, n = 0;
    String(text || '').split(/\r?\n/).forEach(function (raw, i) {
      var line = raw.replace(/^\s+|\s+$/g, '');
      if (!line || /^[#＃]/.test(line)) return;
      var h = line.match(/^[\[［]\s*(.+?)\s*[\]］]$/);
      if (h) {
        var hd = h[1].split(/[\s　]+/);
        if (hd[0] === '口調') {
          n++;
          cur = { key: hd[1] ? (userMode && !/^u:/.test(hd[1]) && !(HK.TONES && HK.TONES[hd[1]]) ? 'u:' + hd[1] : hd[1]) : null, label: '', base: '', fp: null, you: '', persona: '', ends: [], words: [], rules: {}, effects: {}, line: i + 1, order: n };
          sec = 'head';
          out.dicts['#' + n] = cur;
          return;
        }
        if (!cur) { out.errors.push((i + 1) + '行目：先に [口調] が要ります'); return; }
        var sm = { '文末': 'ends', '語彙': 'words', '規則': 'rules', '効果': 'effects' }[hd[0]];
        if (!sm) { out.errors.push((i + 1) + '行目：節「' + hd[0] + '」が読めません（文末／語彙／規則／効果）'); sec = null; return; }
        sec = sm; return;
      }
      if (!cur) { out.errors.push((i + 1) + '行目：先に [口調] が要ります'); return; }
      /* 「元=先」の「=」は、かっこの外の最初の一つ（条件の後読み「(?<=…)」・先読み「(?=…)」の中の「=」で切らない。2026-10-30 第5回：以前は
         「だ((?<=[^…‥、]{4})…)=…」が「だ((?<」と「[^…‥、]{4})…=…」に切れて、その項目が効いていなかった） */
      var kv = (function (x) {
        for (var p = 0, dp = 0; p < x.length; p++) {
          var ch = x.charAt(p);
          if (ch === '\\') { p++; continue; }
          if (ch === '(' || ch === '（') dp++; else if ((ch === ')' || ch === '）') && dp > 0) dp--;
          else if ((ch === '=' || ch === '＝') && !dp && p > 0) return [x, x.slice(0, p).replace(/\s+$/, ''), x.slice(p + 1).replace(/^\s+/, '')];
        }
        return x.match(/^(.+?)\s*[=＝]\s*(.*)$/);
      })(line);
      if (!kv) { out.errors.push((i + 1) + '行目：「元=先」の形で書いてください'); return; }
      var k = kv[1].replace(/^\s+|\s+$/g, ''), v = kv[2].replace(/^\s+|\s+$/g, '');
      if (sec === 'head') {
        if (k === '名前') cur.label = v.slice(0, 20);
        else if (k === '鍵') cur.key = userMode ? 'u:' + v.replace(/^u:/, '') : v;
        else if (k === 'ベース') { var b = v.toUpperCase(); if (b === 'K' || b === 'F' || b === 'P') cur.base = b; else out.errors.push((i + 1) + '行目：ベースは K／F／P'); }
        else if (k === '一人称') { var fs = v.split(/[|｜]/).map(function (x) { return x.replace(/^\s+|\s+$/g, '').slice(0, 8); }); cur.fp = { m: fs[0] || '', f: fs[1] || fs[0] || '', x: fs[2] || fs[0] || '' }; }
        else if (k === '二人称') cur.you = v.slice(0, 8);
        else if (k === '態度') { if (HK.PERSONA && HK.PERSONA[v]) cur.persona = v; else out.errors.push((i + 1) + '行目：態度「' + v + '」が見つかりません'); }
        else if (k === '説明') cur.desc = v.slice(0, 80);
        else out.errors.push((i + 1) + '行目：項目「' + k + '」が読めません');
        return;
      }
      if (sec === 'ends') {
        var cond = null, ahead = null; var cm = k.match(/^(.+?)\((.+)\)$/);
        if (cm) {
          k = cm[1];
          /* 条件の最後の先読み「(?=…)」「(?!…)」は、文末の語のすぐ後ろ（飾りの……・っ、文末の記号、そのあとの文）に当てる（2026-10-30 第5回）。残りは後読み（語の前） */
          var ca = splitAhead(cm[2]);
          try { cond = ca[0] ? new RegExp(ca[0] + '$') : null; ahead = ca[1] ? new RegExp('^' + ca[1]) : null; } catch (e) { cond = null; ahead = null; out.errors.push((i + 1) + '行目：条件が読めません'); }
        }
        cur.ends.push(ahead ? [k, alts(v), cond, ahead] : [k, alts(v), cond]); return;
      }
      if (sec === 'words') { cur.words.push([k, alts(v)]); return; }
      if (sec === 'rules') {
        var rk = RULE_KEYS[k]; if (!rk) { out.errors.push((i + 1) + '行目：規則「' + k + '」は使えません（否定／進行／断定／助詞落とし／縮約／強調語／存在／短い文はため口／ため口を混ぜる／皮肉の型／前置き／言い切りの前置き／反応の前置き／驚き／笑い／言い切り／動揺／一度だけ／強い文の説明／読点で切る）'); return; }
        if (rk === 'drop') { var rate = parseFloat(v); cur.rules.drop = rate > 0 ? Math.min(1, rate) : 0; }
        else if (rk === 'emphRate') { var er = parseFloat(v); cur.rules.emphRate = er >= 0 ? Math.min(1, er) : 0.5; }
        else if (rk === 'cutLen') { var cl = parseInt(v, 10); if (cl > 0) cur.rules.cutLen = cl; else out.errors.push((i + 1) + '行目：読点で切るは字数'); }
        else if (rk === 'shortCasual') { var sl = parseInt(v, 10); cur.rules.shortCasual = sl > 0 ? sl : 6; }
        else if (rk === 'mixK') { var mk = parseFloat(v); if (mk >= 0) cur.rules.mixK = Math.min(1, mk); else out.errors.push((i + 1) + '行目：ため口を混ぜるは 0〜1 の数'); }
        else if (rk === 'contract') cur.rules.contract = yes(v);
        else if (rk === 'twistType') cur.rules.twistType = yes(v);
        else if (rk === 'emph') cur.rules.emph = alts(v);
        else if (rk === 'lead' || rk === 'shaken' || rk === 'leadS' || rk === 'leadR' || rk === 'once') { var lv = alts(v).filter(Boolean); if (lv.length) cur.rules[rk] = lv; }
        else if (rk === 'surprise' || rk === 'laugh') cur.rules[rk] = alts(v);   /* 空の候補は「消す」 */
        else if (rk === 'leadRate' || rk === 'shakenRate' || rk === 'flat') { var fr = parseFloat(v); if (fr >= 0) cur.rules[rk] = Math.min(1, fr); else out.errors.push((i + 1) + '行目：' + k + 'は 0〜1 の数'); }
        else if (rk === 'neg') { if (/^(ぬ|へん|ん)$/.test(v)) cur.rules.neg = v; else out.errors.push((i + 1) + '行目：否定は ぬ／へん／ん'); }
        else if (rk === 'prog') { if (/^[てと]/.test(v)) cur.rules.prog = v; else out.errors.push((i + 1) + '行目：進行は「ておる」「とる」のような形'); }
        else if (rk === 'exist') { if (/る$/.test(v)) cur.rules.exist = v; else out.errors.push((i + 1) + '行目：存在は「おる」のような形'); }
        else cur.rules[rk] = v;
        return;
      }
      if (sec === 'effects') { var fk = FX_KEYS[k]; if (!fk) { out.errors.push((i + 1) + '行目：効果「' + k + '」は使えません'); return; } cur.effects[fk] = yes(v); return; }
      out.errors.push((i + 1) + '行目：節の中ではありません');
    });
    /* 鍵を確定（利用者の口調は u:名前）、文末は長い順 */
    var dicts = {};
    Object.keys(out.dicts).forEach(function (k) {
      var d = out.dicts[k];
      if (!d.key) { if (!d.label) { out.errors.push(d.line + '行目の [口調]：名前がありません'); return; } d.key = userMode ? 'u:' + d.label : d.label; }
      /* 同じ長さなら、条件つきの項目（「な(る)=な」）を先に（条件なしの「な=ね」に先を越されないように） */
      d.ends.sort(function (a, b) { return b[0].length - a[0].length || (b[2] || b[3] ? 1 : 0) - (a[2] || a[3] ? 1 : 0); });
      if (!d.base) d.base = T.BASE[d.key] || 'K';
      dicts[d.key] = d;
    });
    out.dicts = dicts;
    return out;
  };
  /* 組み込みの辞書を登録（tone-dict-builtin.js から） */
  T.addBuiltin = function (text) { var p = T.parse(text, false); Object.keys(p.dicts).forEach(function (k) { T.dicts[k] = p.dicts[k]; }); if (p.errors.length && typeof console !== 'undefined') console.warn('tone-dict-builtin: ' + p.errors.join(' / ')); return p; };

  /* ---------- 利用者の口調を選択欄に出す ---------- */
  var registered = [];
  function unregister() {
    registered.forEach(function (k) { if (HK.TONES) delete HK.TONES[k]; if (HK.TONE_EXTRA) delete HK.TONE_EXTRA[k]; if (HK.TONE_YOU) delete HK.TONE_YOU[k]; if (HK.TONE_KEYS) { var i = HK.TONE_KEYS.indexOf(k); if (i >= 0) HK.TONE_KEYS.splice(i, 1); } });
    registered = [];
  }
  T.setUser = function (text) {
    var p = T.parse(text, true);
    T.userText = String(text || '');
    T.user = {};
    unregister();
    Object.keys(p.dicts).forEach(function (k) {
      var d = p.dicts[k];
      T.user[k] = d;
      if (!/^u:/.test(k)) return;   /* 組み込みの口調の上書きは選択欄に足さない */
      var ps = d.persona || BASE_PERSONA[d.base], info = { label: d.label || k.slice(2), desc: d.desc || '自作の口調', base: ps, top: null, fp: d.fp || undefined, group: d.base === 'P' ? 'polite' : d.base === 'K' ? 'soft' : undefined };
      if (HK.TONES) HK.TONES[k] = info;
      if (HK.TONE_EXTRA) HK.TONE_EXTRA[k] = info;
      if (HK.TONE_YOU && d.you) HK.TONE_YOU[k] = d.you;
      if (HK.TONE_KEYS && HK.TONE_KEYS.indexOf(k) < 0) HK.TONE_KEYS.push(k);
      registered.push(k);
    });
    return p;
  };
  /* 住人ごとの語尾の設定・住人ごとの辞書（tone-ending.js の HK.Ending）が作った辞書を、鍵（e:…）で登録する。
     箱庭全体の辞書（setUser・高度設定の adv.tone）は 2026-10-26 に廃止（setUser は ui.js の移行で空にするためだけに残す） */
  T.setEnding = function (key, text) {
    var p = T.parse(text, false), d = p.dicts[key];
    if (d) T.ending[key] = d; else delete T.ending[key];
    return p;
  };
  T.userKeys = function () { return Object.keys(T.user); };
  T.labelOf = function (k) { var d = T.user[k] || T.dicts[k]; return (d && d.label) || (HK.toneInfo && HK.toneInfo(k) && HK.toneInfo(k).label) || k; };
  /* 見本（3本のベースの台詞を辞書で言い換えて見せる） */
  var SAMPLES = [
    '知ってるよ｜知っている｜知っています', 'ありがとう｜＝｜ありがとうございます', '無理しないでね｜無理をするな｜無理をしないでください',
    'それ、本当にすごいね｜それは本当にすごいな｜それは本当にすごいですね', '分からないよ。でも、やってみる｜分からない。だが、やってみる｜分かりません。でも、やってみます',
    'もう帰る？｜もう帰るのか｜もう帰りますか？'
  ];
  T.demo = function (k) {
    var d = T.user[k] || T.dicts[k]; if (!d) return [];
    return SAMPLES.map(function (s) { var sp = T.split(s); return '「' + T.apply(sp[d.base] || sp.K, d, { name: '見本' }) + '」'; });
  };
  T.help = function () { return '書き方：[口調] 名前=／ベース=K・F・P／一人称=／二人称=／態度=（省略可）。[文末] 元=先（／で候補）。[語彙] 元=先（「ばかり=ばかり」のように同じ語を書くと、短い語「ばか」がその長い語の中に当たらない）。[規則] 否定=ぬ・へん・ん／進行=ておる・とる／断定=や／助詞落とし=0.3／縮約=はい／ため口を混ぜる=0.15（ベース=P のとき、問い・感嘆・念押しの文を くだけた形に。言い切りの文は この割合で）／強調語=マジ／めっちゃ／前置き=フッ……。／やれやれ（前置きの割合=0.3）／言い切りの前置き=まあ、（言い切りの台詞だけ）／反応の前置き=へえ、／ほう、（〜ですね・〜ますね の台詞だけ）／一度だけ=けどね（足すのは台詞の最後の文に一度だけ）／驚き=なんと！／おお……（文頭の え・うそ・マジ などを置き換え。空なら消す）／笑い=フハハ（はは・ふふ などを置き換え。空なら消す）／言い切り=0.3（文末の よ・ね・さ・ぞ を落とす割合）／動揺=く……ッ！／バカな……！（「！」の強い文の頭に。動揺の割合=0.5）。[効果] 感嘆符を落とす・伸ばす・言い切りに！・短くする・言いよどみ=はい。\n※ 試作中：3本のベース（K｜F｜P）で書かれた台詞にだけ効きます。1本の台詞はこれまでの言い換えになります。'; };
  T.sample = function () { return '[口調]\n名前=ですぞ侍\nベース=P\n一人称=拙者\n二人称=貴殿\n[文末]\nです=ですぞ／ですな\nですか=ですかな\nますか=ますかな\nました=ましたぞ\nません=ませぬ\nください=くだされ\n[語彙]\nありがとうございます=かたじけない\nすみません=面目ない\n[規則]\n否定=ぬ\n進行=ておる'; };

  /* 以前の箱庭全体の辞書（高度設定の adv.tone）は廃止した。保存の文字列は当てず（T.user に入れない・選択欄に足さない）、
     ui.js の移行（その辞書で作った口調を選んでいた住人の「辞書を直接書く」に写す）が読めるよう、文字列だけ T.userText に置く */
  try { var adv = HK.store && HK.store.get('adv', null); if (adv && typeof adv.tone === 'string') T.userText = adv.tone; } catch (e) { /* 読めなければ何もしない */ }
})();
