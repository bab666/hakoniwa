/* 箱庭シミュレーター: 表情の鍵（HK.Face。2026-11-06。設計は docs/reports/2026-11-06/face-design.md）
   台詞の一言ずつに表情の鍵を決める（画像はまだ持たない。鍵と差し込み口 data-face だけ）。
   鍵：normal 通常・surprise 驚き・joy 嬉しい・sad 悲しみ・angry 怒り・shy 照れ・fear 恐怖・jealous 嫉妬・
       smile_lover 恋人の前の笑顔・smile_family 家族の前の笑顔・moan_1〜moan_4（喘ぎ：はじまり・高まり・山場・事後。R18版だけ）
   決め方（上から優先）：
     (1) 書いた人の印：台詞の頭の「〈照れ〉」（voice.js の processText が読んで消し、記録の数える欄 e.fc に外側の「」の順で残す。
         「＠名前＠」と一緒に、どちらの順でも書ける。喘ぎの段は R18版の moan-engine.js が出した声の段を覚えておき、同じ欄に入れる）
     (2) 出来事の種類：e.tag・e.ev（出来事の id）・e.mark（関係の節目）・e.kind（死）・e.cat の表（HK.Face.addTag で足す）
     (3) 話し手の気分：e.md（記録を作った時点の出演者の、平静でない気分。emotion.js）。無い記録（保存済み）は res.history のその区切りの終わりの気分
     (4) 上機嫌（joy）で、出来事の相手が恋人なら smile_lover、家族なら smile_family
     (5) どれも無ければ normal
   保存済みの記録には書き足さず、表示のときに HK.Face.of で決める。全年齢版・全年齢モード・子どもの姿の人（HK.Face.childLook）に喘ぎの鍵は出さず shy に落とす。
   住人でない話し手（モブ・話し手の決まらない台詞）は、印が無ければ鍵を付けない（null）。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var F = HK.Face = {};
  F.KEYS = ['normal', 'surprise', 'joy', 'sad', 'angry', 'shy', 'fear', 'jealous', 'smile_lover', 'smile_family', 'moan_1', 'moan_2', 'moan_3', 'moan_4'];
  /* 印の語 → 鍵（喘ぎの段の印は下の正規表現で読む） */
  F.MARK = { '通常': 'normal', '驚き': 'surprise', '嬉しい': 'joy', '悲しみ': 'sad', '怒り': 'angry', '照れ': 'shy', '恐怖': 'fear', '嫉妬': 'jealous', '恋人の笑顔': 'smile_lover', '家族の笑顔': 'smile_family' };
  var MOAN_MK = /^喘ぎ([1-4])$/, HAS = Object.prototype.hasOwnProperty;
  F.markKey = function (w) {
    if (HAS.call(F.MARK, w)) return F.MARK[w];
    var m = MOAN_MK.exec(w);
    return m ? 'moan_' + m[1] : null;
  };
  /* 台詞の中身 q の頭の印を読む（頭の ⁠ の印は残す）。印でなければ null。〈〉は名前伏せ・書き下ろしの鍵にも使うので、表の語に一致するときだけ */
  F.read = function (q) {
    if (typeof q !== 'string') return null;
    var p = q.charAt(0) === '⁠' ? 1 : 0;
    if (q.charAt(p) !== '〈') return null;
    var j = q.indexOf('〉', p);
    if (j < 0 || j - p > 7) return null;
    var k = F.markKey(q.slice(p + 1, j));
    return k ? { q: q.slice(0, p) + q.slice(j + 1), fc: k } : null;
  };
  /* 文の中に残った印を全部消す（「」の外・途中に書かれたもの。表の語に一致するものだけ） */
  var ALL = /〈([^〈〉「」]{1,6})〉/g;
  F.strip = function (s) {
    if (typeof s !== 'string' || s.indexOf('〈') < 0) return s;
    return s.replace(ALL, function (m, w) { return F.markKey(w) ? '' : m; });
  };
  /* 子どもの姿の人か（喘ぎの鍵を付けない）。登場人物はすべて成人として扱うので今は常に偽。住人の設定に見た目の欄を足したらここで読む */
  F.childLook = function (c) { return false; };
  /* 喘ぎの鍵を出してよいか */
  F.moanOk = function (c) { return !HK.SAFE_ON && !HK.SAFE_BUILD && !F.childLook(c); };
  /* 鍵をその人・その版に合わせる（喘ぎを出せないときは照れ） */
  F.fit = function (k, c) { return k && /^moan_/.test(k) && !F.moanOk(c) ? 'shy' : k || null; };

  /* ---------- (2) 出来事の種類の表 ----------
     HK.Face.addTag(名前, 鍵, 欄)：欄は 'tag'（e.tag の札）・'ev'（出来事の id。正規表現も可）・'mark'（関係の節目）・'kind'・'cat'。省くと tag・ev・mark のどれでも。
     鍵の頭に '!' を付けると「節目の二人でない話し手だけ」（浮気を見た恋人の嫉妬など） */
  var TAGS = [];
  F.addTag = function (name, key, col) {
    if (name == null || !key) return;
    TAGS.unshift({ n: name, k: key, c: col || '' });
  };
  function hit(t, v) { return v != null && (t.n instanceof RegExp ? typeof v === 'string' && t.n.test(v) : t.n === v); }
  function evKey(e, who) {
    var pair = (e.actors || []).slice(0, 2);
    for (var i = 0; i < TAGS.length; i++) {
      var t = TAGS[i], c = t.c, ok = false;
      if (!c || c === 'tag') ok = hit(t, e.tag);
      if (!ok && (!c || c === 'ev')) ok = hit(t, e.ev);
      if (!ok && (!c || c === 'mark')) ok = (e.mark || []).some(function (m) { return hit(t, m); });
      if (!ok && c === 'kind') ok = hit(t, e.kind);
      if (!ok && c === 'cat') ok = hit(t, e.cat);
      if (!ok) continue;
      if (t.k.charAt(0) === '!') { if (who == null || pair.indexOf(who) >= 0) continue; return t.k.slice(1); }
      return t.k;
    }
    return null;
  }
  /* 既定の表（あとに足したものほど先に見る。箱庭・パックの addTag は既定より先） */
  [
    ['conflict', 'angry', 'cat'],
    ['death', 'sad', 'kind'],
    [/(?:fear|scare|horror)/i, 'fear', 'ev'],
    [/(?:breakup|break$|mourn|grief|farewell|wakare)/i, 'sad', 'ev'],
    [/jeal/i, 'jealous', 'ev'],
    [/(?:confess|kokuhaku)/i, 'shy', 'ev'],
    ['break', 'sad', 'mark'], ['couple', 'joy', 'mark'], ['propose', 'joy', 'mark'],
    ['cheat', '!jealous', 'mark'], ['affair', '!jealous', 'mark'],
    ['恐怖', 'fear'], ['別れ', 'sad'], ['嫉妬', 'jealous'], ['告白', 'shy']
  ].forEach(function (x) { F.addTag(x[0], x[1], x[2]); });

  /* ---------- (3)(4) 気分と相手 ---------- */
  F.MOOD = { joy: 'joy', grief: 'sad', fear: 'fear', anger: 'angry', shame: 'shy', lust: 'shy' };
  var BARS = ['joy', 'grief', 'fear', 'anger'];
  function moodOf(e, who, res) {
    if (e.md) return e.md[who] || null;
    /* 保存済みの記録：その区切りの終わりの 4 つの気分（喜び・悲しみ・恐れ・怒り）。いちばん高いものが 35 以上なら */
    var H = res && res.history, h = null;
    if (Array.isArray(H)) for (var i = 0; i < H.length; i++) if (H[i] && H[i].step === e.step) { h = H[i]; break; }
    var v = h && h.emo && h.emo[who];
    if (!Array.isArray(v)) return null;
    var best = -1, bk = null;
    v.forEach(function (x, k) { if (x > best) { best = x; bk = BARS[k]; } });
    return best >= 35 ? bk : null;
  }
  var LOVE = { lovers: 1, bonded: 1, fatedmate: 1, polyamory: 1, hub: 1 }, LOVE_TIE = { lover: 1, married: 1, spouse: 1, fiance: 1 };
  var relMemo = typeof WeakMap === 'function' ? new WeakMap() : null;
  function relOf(res, a, b) {
    if (!res || !Array.isArray(res.pairs) || a == null || b == null) return '';
    var M = relMemo && relMemo.get(res);
    if (!M) {
      M = {};
      res.pairs.forEach(function (p) {
        var r = LOVE[p.label] || (p.tie && LOVE_TIE[p.tie.type]) ? 'lover' : p.kin ? 'family' : '';
        if (r) M[p.a + '-' + p.b] = M[p.b + '-' + p.a] = r;
      });
      if (relMemo) relMemo.set(res, M);
    }
    return M[a + '-' + b] || '';
  }
  function smile(e, who, res) {
    var others = (e.actors || []).filter(function (i) { return i !== who; });
    var r = others.length ? relOf(res, who, others[0]) : '';
    return r === 'lover' ? 'smile_lover' : r === 'family' ? 'smile_family' : 'joy';
  }

  /* 記録 e の k 番目（外側の「」の順。0 から）の台詞の鍵。res は結果（話し手の住人・関係・区切りの気分）。台詞が無ければ null */
  var SAFE_K = /^[a-z0-9_]{1,24}$/;
  F.of = function (e, k, res) { var r = of0(e, k, res); return r == null ? null : SAFE_K.test(r) ? r : 'normal'; };
  function of0(e, k, res) {
    if (!e || typeof e.text !== 'string') return null;
    var sg = HK.Seg ? HK.Seg.of(e, res || []) : null, qs = (sg || []).filter(function (x) { return x && x.t !== 'n'; }), x = qs[k];
    if (!x) return null;
    var who = x.who >= 0 ? x.who : null, c = who != null && res && res.chars ? res.chars[who] : null;
    /* (1) 書いた人の印・喘ぎの段 */
    var mk = x.face || (Array.isArray(e.fc) ? e.fc[k] : null);
    if (mk) return F.fit(mk, c);
    if (who == null) return null;
    /* (2) 出来事の種類（喘ぎの区分 m は性的な場面なら「高まり」） */
    if (x.t === 'm' && e.lewd) return F.fit('moan_2', c);
    var ek = evKey(e, who);
    if (ek) return ek;
    /* (3) 気分 (4) 上機嫌なら相手で */
    var m = moodOf(e, who, res);
    if (m === 'joy') return smile(e, who, res);
    if (m && F.MOOD[m]) return F.MOOD[m];
    return 'normal';
  }
  /* 記録 e の外側の「」すべての鍵（並び）。どれも null なら null */
  F.list = function (e, res) {
    var sg = HK.Seg ? HK.Seg.of(e, res || []) : null, n = (sg || []).filter(function (x) { return x && x.t !== 'n'; }).length, out = [], any = false;
    for (var i = 0; i < n; i++) { var f = F.of(e, i, res); out.push(f); if (f) any = true; }
    return any ? out : null;
  };
})();
