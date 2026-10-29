/* 箱庭シミュレーター: 全年齢モード
   ・全年齢版のビルドでは常に有効（index.html で window.HK_SAFE_BUILD = 1 を立てる）
   ・R18版では、上のリンクから全年齢版のページへ移れる。以前に全年齢モードにした人は、ボタンでR18版に戻せる（ブラウザに覚えておく。保存できない環境ではそのページ限り）
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
  /* 保存できない環境のために、URL の #safe / #r18 も見る。読み込み器（load.js）があれば、#safe&all のような複数の印（HK.Load.flags）で見る */
  var LF = HK.Load && HK.Load.flags, hash = (location.hash || '').replace('#', '');
  var hSafe = LF ? !!LF.safe : hash === 'safe', hR18 = LF ? !!LF.r18 : hash === 'r18';
  var ON = BUILD || hSafe || (!hR18 && load() === '1');
  HK.SAFE_BUILD = BUILD; HK.SAFE_ON = ON;

  /* ---------- 保存の鍵（版ごとに分ける） ----------
     R18版（hakoniwa-full）は従来どおり hakoniwa で始まる鍵（hakoniwa:state・hakoniwa_fold_v1・IndexedDB hakoniwa-saves など）。
     全年齢版は同じ名前の「hakoniwa」を「hakoniwa-z」に替えた鍵（hakoniwa-z:state・hakoniwa-z_fold_v1・hakoniwa-z-saves）。
     同じ場所（オリジン）に置いても、片方の保存がもう片方に出たり上書きしたりしない。R18版の全年齢モード（#safe）は R18版の鍵のまま。
     key(名前)：R18版の鍵の名前 → この版の鍵（どちらの版の名前を渡してもよい）。canon(鍵)：どちらの版の鍵でも R18版の名前に。mine(鍵)：この版の鍵か。
     ※core.js の HK.store は従来の鍵で作られるので、ここで版ごとの鍵のものに置き換える（それより前に読むのは tone-engine.js の adv だけ。下で読み直す） */
  var ZEN = BUILD, ZPFX = 'hakoniwa-z';
  var KST = HK.STORE = {
    zenrei: ZEN, prefix: (ZEN ? ZPFX : 'hakoniwa') + ':', db: (ZEN ? ZPFX : 'hakoniwa') + '-saves', oldDb: 'hakoniwa-saves',
    iconDb: (ZEN ? ZPFX : 'hakoniwa') + '-icons',                /* 住人のアイコンの置き場（saves.js の HK.IconStore。住人の上限 200 人に合わせて localStorage から分けた） */
    FLAG: ZPFX + ':migrated',                                   /* 全年齢版で、旧い共有の鍵から写したことの印 */
    canon: function (k) { k = String(k); return k.indexOf(ZPFX) === 0 ? 'hakoniwa' + k.slice(ZPFX.length) : k; },
    key: function (k) { k = KST.canon(k); return ZEN && k.indexOf('hakoniwa') === 0 ? ZPFX + k.slice(8) : k; },
    mine: function (k) { return typeof k === 'string' && k.indexOf('hakoniwa') === 0 && (k.indexOf(ZPFX) === 0) === ZEN; },
    flag: function () { try { var v = window.localStorage.getItem(KST.FLAG); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    setFlag: function (o) { try { window.localStorage.setItem(KST.FLAG, JSON.stringify(Object.assign(KST.flag() || {}, o))); return true; } catch (e) { return false; } }
  };
  HK.store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(KST.prefix + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(KST.prefix + k, JSON.stringify(v)); return true; } catch (e) { return false; /* 保存できない環境・容量超過 */ } }
  };
  /* 移行（全年齢版だけ・一度だけ）：分ける前は両方の版が同じ鍵に保存していたので、全年齢版を新しい鍵で初めて開いたとき、
     旧い共有の鍵（hakoniwa: と hakoniwa_ で始まるもの）を写す。旧い鍵は R18版が使うので消さない。R18 だけの項目は ui.js の normState が落とし、
     R18モードで保存したセーブ（r18 の印）と R18 だけの辞書（喘ぎ）は写さない。IndexedDB のセーブは saves.js が開くときに写す（印の db が 'wait' のあいだ） */
  (function migrate() {
    if (!ZEN) return;
    var ls;
    try { ls = window.localStorage; if (ls.getItem(KST.FLAG) != null) return; } catch (e) { return; }
    var n = 0, ks = [], fail = [];
    try { for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (k && /^hakoniwa[:_]/.test(k)) ks.push(k); } } catch (e) { return; }
    /* 住人（state）をいちばん先に、その控え（state:backup）をいちばん後に写す。保存領域（R18版と同じ場所で分け合う）が足りずに住人を写せなかったときは、
       控えも写さない（控えだけ写ると、全年齢版はサンプルの住人で控えを上書きしてしまう）。写せなかった鍵は印の fail に残す（ui.js が知らせを出す） */
    var rank = function (k) { return k === 'hakoniwa:state' ? 0 : k === 'hakoniwa:state:backup' ? 2 : 1; };
    ks.sort(function (a, b) { return rank(a) - rank(b); });
    ks.forEach(function (k) {
      var to = KST.key(k);
      try {
        if (ls.getItem(to) != null) return;
        if (k === 'hakoniwa:state:backup' && fail.indexOf('hakoniwa:state') >= 0) { fail.push(k); return; }
        var v = ls.getItem(k);
        if (k === 'hakoniwa:saves') { var l = JSON.parse(v || '[]'); if (Array.isArray(l)) v = JSON.stringify(l.filter(function (r) { return r && !r.r18; })); }
        if (k === 'hakoniwa:adv') { var a = JSON.parse(v || 'null'); if (a && typeof a === 'object') { delete a.moan; v = JSON.stringify(a); } }   /* R18 だけの辞書（喘ぎ）は写さない */
        /* 履歴の結果（IndexedDB が使えない環境の置き場。history.js）：R18モードで動かした結果は写さない（一覧の履歴は写るので、開くと全年齢版で回し直す） */
        if (k === 'hakoniwa:history:res') { var hr = JSON.parse(v || 'null'), ho = {}; if (hr && typeof hr === 'object') Object.keys(hr).forEach(function (id) { if (hr[id] && !hr[id].r18) ho[id] = hr[id]; }); v = JSON.stringify(ho); }
        ls.setItem(to, v); n++;
      } catch (e) { fail.push(k); /* 入りきらない鍵は写さない */ }
    });
    /* hdb：履歴の結果の IndexedDB（hakoniwa-history）も、history.js が開くときに写す。ic：住人のアイコンの IndexedDB（hakoniwa-icons）も、saves.js の HK.IconStore が開くときに写す */
    KST.setFlag(fail.length ? { at: Date.now(), ls: n, db: 'wait', hdb: 'wait', ic: 'wait', fail: fail } : { at: Date.now(), ls: n, db: 'wait', hdb: 'wait', ic: 'wait' });
  })();
  /* tone-engine.js は先に旧い鍵の adv を読んでいるので、この版の鍵で読み直す（やめた口調の辞書を住人へ移す ui.js の oldTone 用） */
  if (ZEN && HK.Tone) { var adv0 = HK.store.get('adv', null); HK.Tone.userText = adv0 && typeof adv0.tone === 'string' ? adv0.tone : ''; }
  /* 全年齢では、関係の説明から R18 の言い回し（内容のスイッチ・媚薬）を外す */
  if (ON && HK.TIES) {
    if (HK.TIES.honmei) HK.TIES.honmei.effect = '想う人は本命との恋愛の出来事が起きやすく、ほかの人からの誘いは断りがち。出られない部屋の重い条件や焦りの限界など、耐えがたい状況では、ほかの人とも妥協することがある';
    if (HK.TIES.abuse) HK.TIES.abuse.effect = '恋人どうしだが、すれ違いが多く、やきもちや言い合いが絶えない二人。支配される側の気持ち（離れられない・怯えている・逃げ出したい）を選べる';
  }

  /* ---------- 切り替えボタン（R18版だけ） ---------- */
  /* 全年齢版の公開URL。共有ボタン（share-card.js）が付けるリンクもこれ（R18版・全年齢モードからの共有も全年齢版へ）。index.html の og:url・og:image も同じURL */
  var SAFE_URL = HK.PUBLIC_URL = 'https://kaimin.sakura.ne.jp/archive/tools/hakoniwa/';
  function toggleUI() {
    if (BUILD) return;
    var brand = document.querySelector('header.top .brand');
    if (!brand) return;
    var box = document.createElement('div');
    box.className = 'agemode';
    box.innerHTML = '<span class="now">' + (ON ? '全年齢モード' : 'R18モード') + '</span>' +
      /* R18モードでは、全年齢版のページへのリンク。全年齢モードにしたままの人は、R18版に戻すボタン */
      (ON ? '<button type="button" class="btn small" id="agemode-btn">R18版に切り替える</button>' : '<a class="btn small" href="' + SAFE_URL + '">全年齢版へ</a>') +
      '<span class="ask" hidden>18歳以上ですか？ <button type="button" class="btn small" id="agemode-yes">はい、切り替える</button> <button type="button" class="btn small" id="agemode-no">やめる</button></span>';
    brand.appendChild(box);
    var st = document.createElement('style');
    st.textContent = '.agemode{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:6px;font-size:12px;color:var(--muted)}.agemode .now{border:1px solid var(--line);border-radius:999px;padding:1px 9px}.agemode .ask{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px}.agemode .ask[hidden]{display:none}.agemode a.btn{text-decoration:none;display:inline-flex;align-items:center;color:inherit}';
    document.head.appendChild(st);
    function go(safe) {
      var ok = save(safe ? '1' : '0');
      var base = location.href.split('#')[0];
      if (ok) { if (location.hash) location.replace(base); else location.reload(); }
      else location.replace(base + (safe ? '#safe' : '#r18')), location.reload();
    }
    var ask = box.querySelector('.ask');
    var btn = box.querySelector('#agemode-btn');
    if (btn) btn.addEventListener('click', function () { ask.hidden = false; });
    box.querySelector('#agemode-yes').addEventListener('click', function () { go(false); });
    box.querySelector('#agemode-no').addEventListener('click', function () { ask.hidden = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', toggleUI); else toggleUI();
  /* ---------- 結果の文をまろやかにする ---------- */
  /* はっきり性的な文：その場面を「二人だけの秘密」に置き換える */
  var HARD = /挿入|挿れ|中出し|中に出|精液|白濁|射精|イく|イっ|イッ|イか|イキ|絶頂|乳首|股間|陰部|ペニス|性器|秘所|秘部|腰を振|腰を打ち|突き上げ|奥まで|奥へ|奥に|奥を|最奥|膣|フェラ|咥え|口に含|舐め|舌を這|愛液|勃|跨|騎乗|正常位|後背位|座位|寝バック|立ちバック|全裸|裸に|服を剥|服の中|下着|胸を揉|揉みしだ|押し倒|セックス|性行為|避妊|孕|ノット|結び目|種付|注ぎ込|腰を沈|腰を落と|喘ぎ|喘い|果て|あられもない|しゃぶ|迎え入れ|受け入れていた|繋がり|繋がった|繋がって|押し入|達し|寸止め|一突き|揺れ続け|唇を這わ|全身に唇|服は[^。]*床に落ち|数ミリの揺れ|身悶え|擦れ|軋む|軋ん|\{(?:男性器|亀頭|女性器|陰核|ナカ|乳首|後ろ|精液|愛液|股間)\}/;
  /* ほのめかし程度の文：黙って消す */
  var SOFT = /乾いている|しよ？|楽しもう|ガスのせいにしちゃ|我慢しなくていい|脱ぎ|ベルトを外|服にも手を|濡れて|濡らし|脱が|脱い|気持ちよ|気持ちい|(?:快感|快楽|刺激|甘い痺れ|熱|奥|そこ)(?:を|で|が)?感じ|感じやす|感じちゃ|感じてしま|感じさせ|焦らさ|焦らし|焦れ|ねだ|数センチ|脚を絡|脚の間|きちゃ|疼|敏感|太腿|内腿|ずぶ|吸い付|吸いつ|腰に触れ|腰をすり|指を這|乱れた息|とろけ|蕩け|弄|声を漏らし|甘い声|甘い音|体の奥|潤滑|谷間|胸の膨らみ|鼠径|お尻の丸み|そこへ導|\{(?:胸|尻)\}/;
  var FADE = ['――その先のことは、二人だけの秘密だ。', '――そこから先は、閉じた扉の向こうの話だ。', '――夜は、静かに更けていった。', '――翌朝、二人は少しだけ照れくさそうに目を逸らした。'];
  var WORD = [[/発情していた/g, '火照っていた'], [/発情して/g, '火照って'], [/発情し/g, '火照っ'], [/ベッドで激しく/g, 'ベッドで朝まで'], [/激しいセックス/g, '二人きりの夜'], [/絶頂/g, '高鳴り'], [/快感/g, '高鳴り'], [/堕ちた/g, '流された'], [/発情/g, '火照り'], [/媚薬/g, '媚薬'], [/喘ぎ声/g, '吐息'], [/堕ち度/g, '揺らぎ'], [/快楽に/g, '誘惑に'], [/快楽/g, '心地よさ'], [/堕ち/g, '流され']];
  /* 先に言い換える語（施術の名前・方針の名前など） */
  var PRE = [[/太腿と脚の付け根/g, '脚のむくみ'], [/気持ちよさに身を委ねる/g, '心地よさに身を委ねる'], [/お尻まわり/g, '腰まわり'], [/臀部/g, '腰まわり'], [/を押し倒した/g, 'と立場が逆転した'], [/仰向けでデコルテ/g, '仰向けで首まわり']];
  function word(t) { WORD.forEach(function (w) { t = t.replace(w[0], w[1]); }); return t; }
  /* 喘ぎ声だけの台詞（短く、「ぁ」「♡」「っ」が多いもの） */
  /* っ・……の多いふつうの台詞（「ちょっと、待って……っ」など）は喘ぎにしない。喘ぎらしい音（ぁ・あっ・んっ・はぁ・♡）が中心で、ほかの言葉がほとんどないものだけ */
  var MOAN_T = /[ぁぃぅぇぉ]|あっ|んっ|はぁ|ひぁ|ふぁ|んぁ|あぁ|んん|ひっ|やぁ/g;
  function moanQ(q) {
    if (/♡/.test(q)) return true;
    var strong = (q.match(MOAN_T) || []).length;
    if (!strong) return false;
    var rest = q.replace(MOAN_T, '').replace(/[っッ…‥、。！？!?～〜ー\s「」ん]/g, ''), kanji = (rest.match(/[\u4e00-\u9fff]/g) || []).length;
    if (strong >= 2 && rest.length <= 6) return true;
    if (strong >= 3 && kanji <= 2 && rest.length <= 14) return true;
    return /そこ|もっと|奥|中/.test(q) && strong >= 1 && q.length < 40 && kanji <= 2;
  }
  /* 文に分ける：「」『』（）の中の。では切らない（『〜。〜』の後ろ半分だけ消して「『〜。）」のような崩れが残らないように。2026-10-27 担当HF） */
  function sentences(t) {
    var out = [], cur = '', d = 0, p = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i]; cur += ch;
      if (ch === '「' || ch === '『') d++;
      else if (ch === '（') p++;
      else if (ch === '）') p = Math.max(0, p - 1);
      else if (ch === '」' || ch === '』') { d = Math.max(0, d - 1); if (d === 0 && p === 0 && !/[とっ、。をがのにはもや]/.test(t[i + 1] || '')) { out.push(cur); cur = ''; } }
      else if (d === 0 && p === 0 && /[。！？!?]/.test(ch)) { out.push(cur); cur = ''; }
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
      /* 秘密の一文は、もとの文から決める（呼ばれた順番に左右されない） */
      if (hard && (hard >= 2 || !out.join('').trim())) { var hh = 0; for (var q = 0; q < t.length; q++) hh = (hh * 31 + t.charCodeAt(q)) % 99991; out.splice(at, 0, FADE[hh % FADE.length]); }
      t = out.join('');
    }
    WORD.forEach(function (w) { t = t.replace(w[0], w[1]); });
    return t.replace(/(――[^。]*。)(?:――[^。]*。)+/g, '$1');
  }
  /* 出られない部屋など、ほかの箱庭の仕上げにも使う（safe-room.js）。R18版の描写の有無「ほのめかす」でも使う（lewd-unify.js）。
     住人の名前・呼び名は言い換えない（「快楽」さんを「心地よさ」にしない）：HK.SafeText(文, 住人?) は voice.js の HK.NameGuard.text で名前を伏せて通す。住人を省くと、いま回している箱庭の住人 */
  HK.SafeText = HK.NameGuard && HK.NameGuard.text ? HK.NameGuard.text(softText) : softText;

  /* 分割読み込み：箱庭の登録や表を書き換える部分は、今あるものに当てたうえで、後から届いたかたまりのたびに当て直す（どれも何度当てても同じ結果） */
  function eachChunk(fn) { fn(); if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(fn); }
  /* 本体がまだ届いていない箱庭は、目録から作った仮の箱庭（HK.Load.info。一覧のカード用。SCEN_ORDER に無い id は null）で見る */
  function scenOf(id) { return HK.SCENARIOS[id] || (HK.Load && HK.Load.info ? HK.Load.info(id) : null); }
  /* パロディの箱庭（バトルロワイヤル・裁判デスゲーム）は全年齢版だけに置く。R18モードでは出さない */
  if (!ON) {
    eachChunk(function () { HK.SCEN_ORDER = (HK.SCEN_ORDER || []).filter(function (id) { var s = scenOf(id); if (s && s.zenreiOnly) { delete HK.SCENARIOS[id]; return false; } return true; }); });
    return;
  }

  /* ---------- 注意書き ---------- */
  function foot() {
    var ps = document.querySelectorAll('.foot-body p');
    for (var i = 0; i < ps.length; i++) if (/大人向けの内容/.test(ps[i].textContent)) ps[i].innerHTML = '<b>内容について</b>　「ゾンビの街」には死・自死・殺人の描写が含まれます。登場人物はすべて成人として扱います。結果をSNSに投稿するときは、各サービスの規約に沿ってご利用ください。';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', foot); else foot();

  /* ---------- 出す箱庭を絞る（目録から作った仮の箱庭 stub も絞る。説明の差し替えも仮の箱庭に当て、一覧のカードを全年齢の書き方にする） ---------- */
  var SOFT_IDS = { locker: 1, omega: 1, massage: 1, saimin: 1 };
  function only(scen, id, opt) { (scen && scen.env || []).forEach(function (e) { if (e.id === id) { e.def = opt.v; e.options = [opt]; } }); }
  eachChunk(function () {
  HK.SCEN_ORDER = (HK.SCEN_ORDER || []).filter(function (id) {
    var s = scenOf(id);
    var ok = s && (SOFT_IDS[id] || !/R18/.test(s.kicker || ''));
    if (!ok) delete HK.SCENARIOS[id];
    return ok;
  });
  /* R18の印がついた出来事（無人島・ゾンビの街の夜など）と、その設定を外す */
  Object.keys(HK.SCENARIOS).forEach(function (id) {
    var sc = HK.SCENARIOS[id];
    /* 配列はその場で絞る（出られない部屋の HK.RoomAPI.EV のように、同じ配列を持っていて後から足すファイルがある。分割読み込みでは族のかたまりが後から足す） */
    /* HK.addTo の印（__ord：足したファイルの番号）も一緒に詰める */
    if (Array.isArray(sc.events)) { var ev = sc.events, od = ev.__ord, j = 0; for (var i = 0; i < ev.length; i++) if (!(ev[i] && ev[i].r18)) { if (od) od[j] = od[i] != null ? od[i] : od[od.length - 1]; ev[j++] = ev[i]; } ev.length = j; if (od) od.length = Math.min(od.length, j); }
    if (Array.isArray(sc.env)) sc.env = sc.env.filter(function (e) { return e.id !== 'ilewd' && e.id !== 'jlewd' && e.id !== 'jyobai' && e.id !== 'jmob' && e.id !== 'zlust' && e.id !== 'zraid' && e.id !== 'wolfnight' && e.id !== 'ylewd' && e.id !== 'slewd' && e.id !== 'ypleasure'; });
  });
  if (HK.ZB && HK.ZB.scen && HK.ZB.scen.events && HK.ZB.scen !== HK.SCENARIOS.zombie) HK.ZB.scen.events = HK.ZB.scen.events.filter(function (e) { return !e.r18; });

  /* ---------- 箱庭の説明と設定 ---------- */
  var LKs = scenOf('locker'), OMs = scenOf('omega'), MSs = scenOf('massage'), SMs = scenOf('saimin');
  if (LKs) {
    LKs.kicker = '1〜6人・密室';
    LKs.desc = '媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて無事に脱出できるか。先に理性が揺らぐのは誰か、乗るのか嗜めるのか。扉が開いたあと、二人の関係はどう変わるのか。一人なら、ひとりきりで熱に耐え抜けるか。三人以上なら、倉庫のロッカーに分かれて押し込まれ、誰と誰がくっつくかは運しだい。ロッカー越しのやきもちも、励まし合いも。';
    only(LKs, 'lewd', { v: 'low', label: 'ぼかす（全年齢版）' });
  }
  if (OMs) {
    OMs.kicker = '恋愛・第二性';
    OMs.desc = String(OMs.desc || '').replace('※成人キャラクター向け', '').trim();
    only(OMs, 'lewd', { v: 'low', label: '朝チュン（全年齢版）' });
  }
  if (MSs) {
    MSs.kicker = '1〜2人・あやしい施術';
    MSs.desc = '評判のマッサージ店。施術は少しずつあやしくなる。いつ気づくか、言い訳に騙されるか、流されてしまうか。流されたあとのことは、暗転の向こう。';
    only(MSs, 'desc', { v: 'dark', label: '軽め（暗転して回数だけ・全年齢版）' });
    (MSs.env || []).forEach(function (e) { if (e.id === 'desc') e.desc = '流されてしまったあとのことは暗転して、何回だったかだけが分かる'; });
  }
  if (SMs) {
    SMs.kicker = '1〜2人・いたずら';
    SMs.desc = '同僚・恋人・友人・恨みを持った相手・ストーカーの誰かに催眠をかけられる。かかるのか、どんないたずらの暗示に弱いのか。終わったあと、怒るのか、やり返すのか、癖になってしまうのか。';
    only(SMs, 'lewd', { v: 'low', label: 'ぼかす（いたずらの暗示・全年齢版）' });
    (SMs.env || []).forEach(function (e) { if (e.id === 'mode' && e.options) { e.options = e.options.filter(function (o) { return o.v !== 'lewd'; }); if (e.def === 'lewd') e.def = 'mix'; } });
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
    if (LK.ACT.touch) { LK.ACT.touch.t = ['{a}の手が、無意識に{b}の腰に回っていた。', '{a}は{b}の肩に、そっと頭を預けた。', '{a}の指先が、{b}の手の甲に触れた。どちらも、引っ込めなかった。']; LK.ACT.touch.bound = ['{a}は手の使えない体で、{b}にもたれかかった。', '{a}は動かせない腕の代わりに、{b}の肩に額を押し当てた。']; }
    if (LK.ACT.kiss) { LK.ACT.kiss.t = ['{a}は{b}の顎を持ち上げ、唇を重ねた。', '{a}は我慢できずに、{b}の頬に口づけた。', '{a}は{b}の耳元で名前を呼び、そっと唇を寄せた。']; LK.ACT.kiss.bound = ['{a}は後ろ手のまま背伸びをして、{b}の唇に自分の唇を押しつけた。', '{a}は手が使えない代わりに、{b}の額にそっと唇を当てた。']; }
    if (LK.ACT.grope) { LK.ACT.grope.label = '抱きしめる'; LK.ACT.grope.t = ['{a}は{b}をきつく抱きしめた。狭いロッカーの中で、二人の体温が混ざり合った。', '{a}は{b}の首筋に顔を埋めた。{b}の鼓動が、耳のすぐそばで鳴っていた。', '{a}は{b}の背中に腕を回し、そのまま離さなかった。どちらの心臓の音なのか、もう分からなかった。', '{a}は{b}の額に自分の額を押し当てた。「……少しだけ、このままで」', '{a}は{b}の手を探り当てて、指を絡めた。それだけで、息が止まりそうだった。']; LK.ACT.grope.bound = LK.ACT.grope.t; }
    if (LK.ONE) { LK.ONE.give = ['{b}は苦しそうな{a}を、黙って抱きしめた。背中をさすっているうちに、{a}の呼吸が少しずつ落ち着いていった。', '{b}は「大丈夫、大丈夫」と繰り返しながら、{a}の髪を撫で続けた。']; }
    if (LK.NAMA) LK.NAMA = ['二人とも手を縛られたまま、互いの体温だけを感じていた。触れたいのに、触れられない。それが一番つらかった。', '拘束されたまま、二人は額を寄せ合った。それ以上は、どうすることもできなかった。'];
    if (LK.ACT.oral) { LK.ACT.oral.label = 'その先へ'; LK.ACT.oral.t = ['{a}は{b}の耳元で何かを囁いた。{b}は、真っ赤になって頷いた。――その先は、ロッカーの扉の隙間からも見えなかった。']; }
    if (LK.ACT.sex) { LK.ACT.sex.label = '一線を越える'; LK.ACT.sex.t = ['{a}と{b}は、狭い暗闇の中で一線を越えた。――その先は、二人だけの秘密だ。', '{a}は{b}を抱き寄せた。{b}は拒まなかった。――そこから先のことを、二人は誰にも話していない。']; }
  }
  });   /* eachChunk の終わり */

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

  function softTag(t) { if (typeof t !== 'string') return t; t = word(t); return HARD.test(t) || SOFT.test(t) ? '秘密の時間' : softText(t); }
  var MILDS = {
    locker: ['狭い空間の空気が、甘く重くなっていた。', '鼓動が、うるさいほど耳に響いていた。', '頬が熱い。ガスのせいだと、自分に言い聞かせた。', '息をするたびに、相手の匂いがした。'],
    omega: ['鼓動が、うるさいほど耳に響いていた。', '頬が熱い。季節のせいだと、自分に言い聞かせた。', '目が合うたびに、どちらからともなく逸らした。'],
    massage: ['施術者の手が、ゆっくりとこりをほぐしていった。', '温かいタオルの重みが、妙に心地よかった。', 'アロマの香りが、少しずつ濃くなっていった。', '施術室の照明が、いつの間にか一段暗くなっていた。'],
    saimin: ['部屋の時計の音だけが、やけに大きく聞こえた。', 'まぶたが、少しずつ重くなっていった。']
  }, MILD = MILDS.locker;
  var NEUTRAL = ['{a}はしばらく、ひとりで考えごとをしていた。', '{a}は窓の外を眺めながら、小さく息をついた。', '{a}は手帳を開き、今日のことを短く書き留めた。'];
  function fixEvent(e, r) {
    if (!e || typeof e.text !== 'string') return;
    var t = e.text.trim(), MILD = MILDS[curId] || MILDS.locker;
    /* 仕上げで本文が全部消えた記録：恋愛の記録はやわらかい一文、それ以外は本人の短い一文にする（空の記録を残さない） */
    if (!t) {
      var nm = e.actors && e.actors.length && r && r.chars && r.chars[e.actors[0]] ? r.chars[e.actors[0]].name : '';
      e.text = e.cat === 'romance' || e.tag || !nm ? MILD[fi++ % MILD.length] : NEUTRAL[fi++ % NEUTRAL.length].replace(/\{a\}/g, nm);
      return;
    }
    if (e.tag && FADE.indexOf(t) >= 0 && !/秘密|一線|ベッド|その先/.test(e.tag)) e.text = MILD[fi++ % MILD.length];
  }
  /* 住人の名前・呼び名は言い換えない（名前の字が「快楽」「絶頂」などの語と重なっても、名前のまま。voice.js の HK.NameGuard。箱庭を回すあいだだけ walkG に表を持つ） */
  var walkG = null;
  function walk(o, key) {
    if (typeof o === 'string') { var g = walkG, o2 = g ? g.enc(o) : o, r2 = key === 'tag' || key === 'label' ? softTag(o2) : softText(o2); return g ? g.dec(r2) : r2; }
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
    DV.toText = function (res) { var t = t1.apply(this, arguments); return res && SOFT_IDS[res.scenId] ? lab(HK.NameGuard ? HK.NameGuard.guard(t, res.chars || [], softText) : softText(t)) : t; };
  })();
  /* 包み直しは HK.wrap（包む順を元のファイルの順に固定。分割読み込みで後から届いた包み（safe-room.js など）も元の順に並ぶ） */
  HK.wrap(HK, 'simulate', function (sim0) {
  var sim = function (input) {
    var id = input && input.scenId, soft = SOFT_IDS[id], self = this, args = arguments;
    /* 秘密の一文の順番は回ごとに最初から（続けて回しても、同じシードなら同じ結果に） */
    fi = 0;
    if (input && input.scenId === 'zombie') { input.env = input.env || {}; input.env.zlewd = 'fade'; }
    if (soft) {
      input.env = input.env || {};
      if (id === 'massage') input.env.desc = 'dark'; else input.env.lewd = 'low';
      if (id === 'saimin' && input.env.mode === 'lewd') input.env.mode = 'mix';
    }
    var r = id === 'massage' ? withPools(function () { return sim0.apply(self, args); }) : sim0.apply(this, arguments);
    if (soft && r) {
      fi = 0; curId = id;
      var NG = HK.NameGuard;
      walkG = NG && input && Array.isArray(input.chars) ? NG.make(NG.wordsOf(input.chars), '') : null;
      try { walk(r, ''); } finally { walkG = null; }
      (r.log || []).forEach(function (e) { fixEvent(e, r); });
    }
    return r;
  };
  for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) sim[k] = sim0[k];
  return sim;
  });
})();
