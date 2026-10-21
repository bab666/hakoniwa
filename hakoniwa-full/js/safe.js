/* 箱庭シミュレーター: 全年齢モード
   ・全年齢版のビルドでは常に有効（index.html で window.HK_SAFE_BUILD = 1 を立てる）
   ・R18版では、上の切り替えボタンで「全年齢」にできる（ブラウザに覚えておく。保存できない環境ではそのページ限り）
   全年齢モードのとき：
   ・R18の箱庭のうち、媚薬ロッカー／オメガバース／マッサージ／催眠だけを、描写をまろやかにして残す
     （エロバラエティ・サキュバス・常識改変・エロトラップダンジョン・感覚遮断穴は出さない）
   ・マッサージは「軽め（暗転して回数だけ）」、催眠は「ぼかす（いたずらの暗示）」に固定
   ・ゾンビの街の「恋人たちの夜（R18）」と、襲われる場面は出さない
   ・性的な行為の文は、結果ができたあとで「その先は二人だけの秘密」といった文に置き換える */
(function () {
  'use strict';
  var HK = window.HK;
  var KEY = 'hakoniwa-safe-mode';
  function load() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { window.localStorage.setItem(KEY, v); return true; } catch (e) { return false; } }
  var BUILD = !!window.HK_SAFE_BUILD;
  /* 保存できない環境のために、URL の #safe / #r18 も見る */
  var hash = (location.hash || '').replace('#', '');
  var ON = BUILD || hash === 'safe' || (hash !== 'r18' && load() === '1');
  HK.SAFE_BUILD = BUILD; HK.SAFE_ON = ON;

  /* ---------- 切り替えボタン（R18版だけ） ---------- */
  function toggleUI() {
    if (BUILD) return;
    var brand = document.querySelector('header.top .brand');
    if (!brand) return;
    var box = document.createElement('div');
    box.className = 'agemode';
    box.innerHTML = '<span class="now">' + (ON ? '全年齢モード' : 'R18モード') + '</span>' +
      '<button type="button" class="btn small" id="agemode-btn">' + (ON ? 'R18版に切り替える' : '全年齢版に切り替える') + '</button>' +
      '<span class="ask" hidden>18歳以上ですか？ <button type="button" class="btn small" id="agemode-yes">はい、切り替える</button> <button type="button" class="btn small" id="agemode-no">やめる</button></span>';
    brand.appendChild(box);
    var st = document.createElement('style');
    st.textContent = '.agemode{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:6px;font-size:12px;color:var(--muted)}.agemode .now{border:1px solid var(--line);border-radius:999px;padding:1px 9px}.agemode .ask{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px}.agemode .ask[hidden]{display:none}';
    document.head.appendChild(st);
    function go(safe) {
      var ok = save(safe ? '1' : '0');
      var base = location.href.split('#')[0];
      if (ok) { if (location.hash) location.replace(base); else location.reload(); }
      else location.replace(base + (safe ? '#safe' : '#r18')), location.reload();
    }
    var ask = box.querySelector('.ask');
    box.querySelector('#agemode-btn').addEventListener('click', function () { if (ON) ask.hidden = false; else go(true); });
    box.querySelector('#agemode-yes').addEventListener('click', function () { go(false); });
    box.querySelector('#agemode-no').addEventListener('click', function () { ask.hidden = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', toggleUI); else toggleUI();
  /* パロディの箱庭（バトルロワイヤル・裁判デスゲーム）は全年齢版だけに置く。R18モードでは出さない */
  if (!ON) {
    HK.SCEN_ORDER = (HK.SCEN_ORDER || []).filter(function (id) { var s = HK.SCENARIOS[id]; if (s && s.zenreiOnly) { delete HK.SCENARIOS[id]; return false; } return true; });
    return;
  }

  /* ---------- 注意書き ---------- */
  function foot() {
    var ps = document.querySelectorAll('.foot-body p');
    for (var i = 0; i < ps.length; i++) if (/大人向けの内容/.test(ps[i].textContent)) ps[i].innerHTML = '<b>内容について</b>　「ゾンビの街」には死・自死・殺人の描写が含まれます。登場人物はすべて成人として扱います。結果をSNSに投稿するときは、各サービスの規約に沿ってご利用ください。';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', foot); else foot();

  /* ---------- 出す箱庭を絞る ---------- */
  var SOFT_IDS = { locker: 1, omega: 1, massage: 1, saimin: 1 };
  HK.SCEN_ORDER = (HK.SCEN_ORDER || []).filter(function (id) {
    var s = HK.SCENARIOS[id];
    var ok = s && (SOFT_IDS[id] || !/R18/.test(s.kicker || ''));
    if (!ok) delete HK.SCENARIOS[id];
    return ok;
  });
  /* R18の印がついた出来事（無人島・ゾンビの街の夜など）と、その設定を外す */
  Object.keys(HK.SCENARIOS).forEach(function (id) {
    var sc = HK.SCENARIOS[id];
    if (Array.isArray(sc.events)) sc.events = sc.events.filter(function (e) { return !e.r18; });
    if (Array.isArray(sc.env)) sc.env = sc.env.filter(function (e) { return e.id !== 'ilewd' && e.id !== 'jlewd' && e.id !== 'ylewd'; });
  });
  if (HK.ZB && HK.ZB.scen && HK.ZB.scen.events && HK.ZB.scen !== HK.SCENARIOS.zombie) HK.ZB.scen.events = HK.ZB.scen.events.filter(function (e) { return !e.r18; });
  function only(scen, id, opt) { (scen && scen.env || []).forEach(function (e) { if (e.id === id) { e.def = opt.v; e.options = [opt]; } }); }

  /* ---------- 箱庭の説明と設定 ---------- */
  var LKs = HK.SCENARIOS.locker, OMs = HK.SCENARIOS.omega, MSs = HK.SCENARIOS.massage, SMs = HK.SCENARIOS.saimin;
  if (LKs) {
    LKs.kicker = '2人・密室';
    LKs.desc = '媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて無事に脱出できるか。先に理性が揺らぐのは誰か、乗るのか嗜めるのか。扉が開いたあと、二人の関係はどう変わるのか。';
    only(LKs, 'lewd', { v: 'low', label: 'ぼかす（全年齢版）' });
  }
  if (OMs) {
    OMs.kicker = '恋愛・第二性';
    OMs.desc = OMs.desc.replace('※成人キャラクター向け', '').trim();
    only(OMs, 'lewd', { v: 'low', label: '朝チュン（全年齢版）' });
  }
  if (MSs) {
    MSs.kicker = 'ソロ・あやしい施術';
    MSs.desc = '評判のマッサージ店。施術は少しずつあやしくなる。いつ気づくか、言い訳に騙されるか、流されてしまうか。流されたあとのことは、暗転の向こう。';
    only(MSs, 'desc', { v: 'dark', label: '軽め（暗転して回数だけ・全年齢版）' });
    (MSs.env || []).forEach(function (e) { if (e.id === 'desc') e.desc = '流されてしまったあとのことは暗転して、何回だったかだけが分かる'; });
  }
  if (SMs) {
    SMs.kicker = '1〜2人・いたずら';
    SMs.desc = '同僚・恋人・友人・恨みを持った相手・ストーカーの誰かに催眠をかけられる。かかるのか、どんないたずらの暗示に弱いのか。終わったあと、怒るのか、やり返すのか、癖になってしまうのか。';
    only(SMs, 'lewd', { v: 'low', label: 'ぼかす（いたずらの暗示・全年齢版）' });
    (SMs.env || []).forEach(function (e) { if (e.id === 'mode') { e.options = e.options.filter(function (o) { return o.v !== 'lewd'; }); if (e.def === 'lewd') e.def = 'mix'; } });
  }
  /* ゾンビの街：恋人たちの夜（R18）と、襲われる場面は出さない */
  var Z = HK.ZB;
  if (Z) {
    if (Z.scen && Z.scen.env) Z.scen.env = Z.scen.env.filter(function (e) { return e.id !== 'zlewd'; });
    ['ZA_TEXT', 'cureAssault', 'CURE_R18', 'CURE_R18_FADE'].forEach(function (k) { delete Z[k]; });
    if (Z.LOVE) { delete Z.LOVE.nightHigh; delete Z.LOVE.pressHigh; }
  }
  var LK = HK.LOCKER;
  if (LK && LK.ACT) {
    /* ロッカーの中では「抱きしめる」まで（その先は、扉が開いたあとに濁して描く） */
    LK.MAXLV = 2;
    if (LK.ACT.touch) { LK.ACT.touch.t = ['{a}の手が、無意識に{b}の腰に回っていた。', '{a}は{b}の肩に、そっと頭を預けた。', '{a}の指先が、{b}の手の甲に触れた。どちらも、引っ込めなかった。']; LK.ACT.touch.bound = ['{a}は縛られた体で、{b}にもたれかかった。', '{a}は動かせない腕の代わりに、{b}の肩に額を押し当てた。']; }
    if (LK.ACT.kiss) { LK.ACT.kiss.t = ['{a}は{b}の顎を持ち上げ、唇を重ねた。', '{a}は我慢できずに、{b}の頬に口づけた。', '{a}は{b}の耳元で名前を呼び、そっと唇を寄せた。']; LK.ACT.kiss.bound = ['{a}は縛られたまま背伸びをして、{b}の唇に自分の唇を押しつけた。', '{a}は手が使えない代わりに、{b}の額にそっと唇を当てた。']; }
    if (LK.ACT.grope) { LK.ACT.grope.label = '抱きしめる'; LK.ACT.grope.t = ['{a}は{b}をきつく抱きしめた。狭いロッカーの中で、二人の体温が混ざり合った。', '{a}は{b}の首筋に顔を埋めた。{b}の鼓動が、耳のすぐそばで鳴っていた。', '{a}は{b}の背中に腕を回し、そのまま離さなかった。どちらの心臓の音なのか、もう分からなかった。', '{a}は{b}の額に自分の額を押し当てた。「……少しだけ、このままで」', '{a}は{b}の手を探り当てて、指を絡めた。それだけで、息が止まりそうだった。']; LK.ACT.grope.bound = LK.ACT.grope.t; }
    if (LK.ONE) { LK.ONE.give = ['{b}は苦しそうな{a}を、黙って抱きしめた。背中をさすっているうちに、{a}の呼吸が少しずつ落ち着いていった。', '{b}は「大丈夫、大丈夫」と繰り返しながら、{a}の髪を撫で続けた。']; }
    if (LK.NAMA) LK.NAMA = ['二人とも手を縛られたまま、互いの体温だけを感じていた。触れたいのに、触れられない。それが一番つらかった。', '拘束されたまま、二人は額を寄せ合った。それ以上は、どうすることもできなかった。'];
    if (LK.ACT.oral) { LK.ACT.oral.label = 'その先へ'; LK.ACT.oral.t = ['{a}は{b}の耳元で何かを囁いた。{b}は、真っ赤になって頷いた。――その先は、ロッカーの扉の隙間からも見えなかった。']; }
    if (LK.ACT.sex) { LK.ACT.sex.label = '一線を越える'; LK.ACT.sex.t = ['{a}と{b}は、狭い暗闇の中で一線を越えた。――その先は、二人だけの秘密だ。', '{a}は{b}を抱き寄せた。{b}は拒まなかった。――そこから先のことを、二人は誰にも話していない。']; }
  }

  /* ---------- マッサージ用の反応（全年齢） ---------- */
  var DG = HK.DG = HK.DG || {};
  function per(list) { var o = {}; (HK.PERSONA_KEYS || ['gentle']).forEach(function (k) { o[k] = list; }); return o; }
  var SAFE_POOLS = {
    TAILS: per([
      ['{a}は表情を崩さずに、静かに息を吐いた。', '{a}は「なかなか効きますね」とだけ言った。', '{a}は時計をちらりと見た。'],
      ['{a}の耳が、少しだけ赤くなった。', '{a}は咳払いをして、姿勢を直した。', '{a}は「……今の、施術ですよね？」と小さく訊いた。'],
      ['{a}は枕に顔を埋めた。', '{a}は「ちょ、ちょっと待って」と言いかけて、やめた。', '{a}の返事が、だんだん短くなっていった。'],
      ['{a}は、もう何も言わなかった。', '{a}は施術台の縁を、ぎゅっと握った。', '{a}の頬は、ずっと赤いままだった。'],
      ['{a}は、ぼんやりと天井を見ていた。', '{a}は、次の施術を待っている自分に気づいた。', '{a}は「……続けてください」と言っていた。']
    ]),
    CLIMAX: per([['――{a}は、声を殺しきれなかった。', '――{a}の背中が、小さく跳ねた。', '――{a}のつま先が、きゅっと丸まった。'], ['――{a}は、声を殺しきれなかった。', '――{a}は枕に顔を埋めて、肩を震わせた。'], ['――{a}の指先が、施術台の縁を強く掴んだ。'], ['――{a}は、声を殺しきれなかった。'], ['――{a}は、しばらく動けなかった。']]),
    ENDURE: per(['{a}は唇を結んで、じっと耐えた。', '{a}は深く息を吸って、呼吸を整えた。', '{a}は拳を握って、反応を表に出すまいとした。']),
    MOAN: per(['……っ', '……'])
  };
  if (!DG.PARTS) {
    DG.PERSONA = HK.PERSONA; DG.personaOf = function (tr) { return HK.personaAuto(tr); };
    DG.PARTS = { mouth: '口元', ear: '耳', neck: '首筋', chest: 'デコルテ', back: '背中', side: '脇腹', belly: 'おなか', hips: '腰', thigh: '脚', feet: '足裏', all: '全身' };
    DG.PART_ORDER = ['mouth', 'ear', 'neck', 'chest', 'back', 'side', 'belly', 'hips', 'thigh', 'feet'];
    DG.CLOTH = ['タオル一枚', '施術着', '施術着', '施術着', '私服']; DG.CURSES = {}; DG.ITEMS = {};
  }
  function withPools(fn) {
    var keep = {};
    Object.keys(SAFE_POOLS).forEach(function (k) { keep[k] = DG[k]; DG[k] = SAFE_POOLS[k]; });
    try { return fn(); } finally { Object.keys(keep).forEach(function (k) { if (keep[k] === undefined) delete DG[k]; else DG[k] = keep[k]; }); }
  }

  /* ---------- 結果の文をまろやかにする ---------- */
  /* はっきり性的な文：その場面を「二人だけの秘密」に置き換える */
  var HARD = /挿入|挿れ|中出し|中に出|精液|白濁|射精|イく|イっ|イッ|イか|イキ|絶頂|乳首|股間|陰部|ペニス|性器|秘所|秘部|腰を振|腰を打ち|突き上げ|奥まで|奥へ|奥に|奥を|最奥|膣|フェラ|咥え|口に含|舐め|舌を這|愛液|勃|跨|騎乗|正常位|後背位|座位|寝バック|立ちバック|全裸|裸に|服を剥|服の中|下着|胸を揉|揉みしだ|押し倒|セックス|性行為|避妊|孕|ノット|結び目|種付|注ぎ込|腰を沈|腰を落と|喘ぎ|喘い|果て|あられもない|しゃぶ|迎え入れ|受け入れていた|繋がり|繋がった|繋がって|押し入|達し|寸止め|一突き|揺れ続け|唇を這わ|全身に唇|服は[^。]*床に落ち|数ミリの揺れ|身悶え|擦れ|軋む|軋ん/;
  /* ほのめかし程度の文：黙って消す */
  var SOFT = /乾いている|しよ？|楽しもう|ガスのせいにしちゃ|我慢しなくていい|脱ぎ|ベルトを外|服にも手を|濡れて|濡らし|脱が|脱い|気持ちよ|気持ちい|感じて|感じる|感じや|焦らさ|焦らし|焦れ|ねだ|数センチ|脚を絡|脚の間|きちゃ|疼|敏感|太腿|内腿|ずぶ|吸い付|吸いつ|腰に触れ|腰をすり|指を這|乱れた息|とろけ|蕩け|弄|声を漏らし|甘い声|甘い音|体の奥|潤滑|谷間|胸の膨らみ|鼠径|お尻の丸み|そこへ導/;
  var FADE = ['――その先のことは、二人だけの秘密だ。', '――そこから先は、閉じた扉の向こうの話だ。', '――夜は、静かに更けていった。', '――翌朝、二人は少しだけ照れくさそうに目を逸らした。'];
  var WORD = [[/発情していた/g, '火照っていた'], [/発情して/g, '火照って'], [/発情し/g, '火照っ'], [/ベッドで激しく/g, 'ベッドで朝まで'], [/激しいセックス/g, '二人きりの夜'], [/絶頂/g, '高鳴り'], [/快感/g, '高鳴り'], [/堕ちた/g, '流された'], [/発情/g, '火照り'], [/媚薬/g, '媚薬'], [/喘ぎ声/g, '吐息'], [/堕ち度/g, '揺らぎ'], [/快楽に/g, '誘惑に'], [/快楽/g, '心地よさ'], [/堕ち/g, '流され']];
  /* 先に言い換える語（施術の名前・方針の名前など） */
  var PRE = [[/太腿と脚の付け根/g, '脚のむくみ'], [/気持ちよさに身を委ねる/g, '心地よさに身を委ねる'], [/お尻まわり/g, '腰まわり'], [/臀部/g, '腰まわり'], [/を押し倒した/g, 'と立場が逆転した'], [/仰向けでデコルテ/g, '仰向けで首まわり']];
  function word(t) { WORD.forEach(function (w) { t = t.replace(w[0], w[1]); }); return t; }
  /* 喘ぎ声だけの台詞（短く、「ぁ」「♡」「っ」が多いもの） */
  function moanQ(q) {
    var n = (q.match(/[ぁぃぅぇぉ♡ッ]|っ|ん、|ん…|んあ|あっ|あ、|ひ、|ふ、|は、/g) || []).length;
    return (q.length < 30 && n >= 2) || (q.length < 50 && n >= 3) || (q.length < 25 && /[っッ]/.test(q) && /……/.test(q)) || (/そこ|もっと|奥|中/.test(q) && /っ|……/.test(q) && q.length < 40);
  }
  /* 文に分ける：「」の中の。では切らない */
  function sentences(t) {
    var out = [], cur = '', d = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i]; cur += ch;
      if (ch === '「') d++;
      else if (ch === '」') { d = Math.max(0, d - 1); if (d === 0 && !/[とっ、。をがのにはもや]/.test(t[i + 1] || '')) { out.push(cur); cur = ''; } }
      else if (d === 0 && /[。！？!?]/.test(ch)) { out.push(cur); cur = ''; }
    }
    if (cur) out.push(cur);
    return out;
  }
  var fi = 0, curId = '';
  function softText(t) {
    if (typeof t !== 'string' || !t) return t;
    PRE.forEach(function (w) { t = t.replace(w[0], w[1]); });
    /* 見出しや数値の名前のような短い語は、言い換えだけ */
    if (t.length <= 14 && !/[。「」]/.test(t)) { var w0 = word(t); if (!HARD.test(w0) && !SOFT.test(w0)) return w0; }
    /* 喘ぎだけの台詞を消す（名前「……」の形も） */
    t = t.replace(/([^\s。、「」――]{1,12})?「([^「」]*)」/g, function (all, who, q) {
      if (!moanQ(q)) return all;
      /* 「名前「……」」の形なら名前ごと消し、地の文の中の台詞なら「……」にする */
      return who && /^[^はがもをにと]*$/.test(who) && !/[はがもをにと]$/.test(who) ? '' : (who || '') + '「……」';
    });
    if (HARD.test(t) || SOFT.test(t)) {
      /* はっきり性的な文が二つ以上あるか、全部消えてしまうときだけ「秘密」の一文を入れる。それ以外は黙って消す */
      var parts = sentences(t), out = [], hard = 0, at = -1;
      parts.forEach(function (p) {
        if (HARD.test(p)) { hard++; if (at < 0) at = out.length; }
        else if (!SOFT.test(p)) out.push(p);
      });
      if (hard && (hard >= 2 || !out.join('').trim())) out.splice(at, 0, FADE[fi++ % FADE.length]);
      t = out.join('');
    }
    WORD.forEach(function (w) { t = t.replace(w[0], w[1]); });
    return t.replace(/(――[^。]*。)(?:――[^。]*。)+/g, '$1');
  }
  HK.SafeText = softText;   /* 出られない部屋など、ほかの箱庭の仕上げにも使う（safe-room.js） */
  function softTag(t) { if (typeof t !== 'string') return t; t = word(t); return HARD.test(t) || SOFT.test(t) ? '秘密の時間' : softText(t); }
  var MILDS = {
    locker: ['狭い空間の空気が、甘く重くなっていた。', '鼓動が、うるさいほど耳に響いていた。', '頬が熱い。ガスのせいだと、自分に言い聞かせた。', '息をするたびに、相手の匂いがした。'],
    omega: ['鼓動が、うるさいほど耳に響いていた。', '頬が熱い。季節のせいだと、自分に言い聞かせた。', '目が合うたびに、どちらからともなく逸らした。'],
    massage: ['施術者の手が、ゆっくりとこりをほぐしていった。', '温かいタオルの重みが、妙に心地よかった。', 'アロマの香りが、少しずつ濃くなっていった。', '施術室の照明が、いつの間にか一段暗くなっていた。'],
    saimin: ['部屋の時計の音だけが、やけに大きく聞こえた。', 'まぶたが、少しずつ重くなっていった。']
  }, MILD = MILDS.locker;
  function fixEvent(e) {
    if (!e || typeof e.text !== 'string' || !e.tag) return;
    var t = e.text.trim(), MILD = MILDS[curId] || MILDS.locker;
    if (!t || (FADE.indexOf(t) >= 0 && !/秘密|一線|ベッド|その先/.test(e.tag))) e.text = MILD[fi++ % MILD.length];
  }
  function walk(o, key) {
    if (typeof o === 'string') return key === 'tag' || key === 'label' ? softTag(o) : softText(o);
    if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) o[i] = walk(o[i], key); return o; }
    if (o && typeof o === 'object') { for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && k !== 'id' && k !== 'kind' && k !== 'type' && k !== 'color') o[k] = walk(o[k], k); return o; }
    return o;
  }
  /* 一人用の結果表示：全年齢版にはダンジョンの表示がないので、物語の表示だけをつなぐ */
  if (!HK.DView) HK.DView = { render: function (host) { host.innerHTML = ''; }, toText: function () { return ''; }, toggleKey: function () {} };
  if (HK.Story && HK.Story.hook) HK.Story.hook();
  (function () {
    var DV = HK.DView, r1 = DV.render, t1 = DV.toText;
    function lab(h) { return h.replace(/決め手と絶頂だけ/g, '決め手だけ').replace(/快楽堕ち/g, 'ハマり度').replace(/絶頂/g, '高鳴り').replace(/快感/g, '高鳴り').replace(/発情/g, '火照り').replace(/堕ち度/g, '揺らぎ').replace(/堕ち/g, '揺らぎ').replace(/快楽/g, '誘惑').replace(/感度 ×/g, 'ほぐれ ×').replace(/開発度/g, 'ほぐれ具合'); }
    DV.render = function (host, res) { var r = r1.apply(this, arguments); if (res && SOFT_IDS[res.scenId]) host.innerHTML = lab(host.innerHTML); return r; };
    DV.toText = function (res) { var t = t1.apply(this, arguments); return res && SOFT_IDS[res.scenId] ? lab(softText(t)) : t; };
  })();
  var sim0 = HK.simulate;
  HK.simulate = function (input) {
    var id = input && input.scenId, soft = SOFT_IDS[id], self = this, args = arguments;
    if (input && input.scenId === 'zombie') { input.env = input.env || {}; input.env.zlewd = 'fade'; }
    if (soft) {
      input.env = input.env || {};
      if (id === 'massage') input.env.desc = 'dark'; else input.env.lewd = 'low';
      if (id === 'saimin' && input.env.mode === 'lewd') input.env.mode = 'mix';
    }
    var r = id === 'massage' ? withPools(function () { return sim0.apply(self, args); }) : sim0.apply(this, arguments);
    if (soft && r) { fi = 0; curId = id; walk(r, ''); (r.log || []).forEach(fixEvent); }
    return r;
  };
  for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) HK.simulate[k] = sim0[k];
})();
