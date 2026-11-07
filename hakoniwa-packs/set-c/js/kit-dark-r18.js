/* @event-ok Cセットの部屋の夜の場面の組み立て部品（文を持たない。きっかけの段・場面の段を部屋の表から組むだけで、新しい出来事ではない。2026-11-07） */
/* Cセット（闇の過激セット）の共通部品：R18 の場面の組み立て（R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/set-c-design.md の 2-3）
   ■ HK.DarkKit.R18（R）。文は持たない。部屋の表（R.addRoom）だけで組み、本体の長い場面（HK.ThickSex・HK.ThickEro・HK.DarkThick）・
     セット B の文の予備（HK.PairR18.FB）・夜の性格の一文には落ちない。仕組みはセット B の kit-r18.js（addRoom・compose・flowFix・温度・場所）の写し。
     使う本体の部品：流れの管理 HK.SexFlow.fix、温度 HK.Heat（of・scope・strip・move・note・remember・trim。事後の一文と変化の一文は部屋の表の after・change から）、
     喘ぎ HK.Ero.moan（声の表は本体）、合意のない回数 HK.ForceRep（n・holds。本体の回数の文は差さない：数だけ本体の数え方にそろえて足す）、場所 HK.SexSpot、時刻 HK.SceneTime
   ■ R.addRoom(ID, { lead, stop, open, fore, insert, mid, peak, peakE, end, after, again, resist, top, fade, change, ok, spot })：部屋専用の段
       行は文字列か { t, sh, st, when(ctx, S, a, b, o), n, kind, per, bper, firm, heat, form, w }。形の表 { mf: [...], ff: [...], fm: [...], all: [...] } でも書ける。
         sh：'mf'|'ff'|'fm'（空白区切りで複数）。st：段の札（HK.DarkKit.stOk。'名前:2+' でその計器、名前なしは o.g の計器か o.stage）。
         n：合意のない回数の札 '1'・'2'・'3+'（o.force のときだけ見る。合意の場面では n の付いた行を使わない）。kind：入口の名前（空白区切り）。
         per：攻め（a）の態度 9 種（空白区切り）。bper：受け（b）の態度。firm：true＝心が折れない受けだけ／false＝折れていく受けだけ（HK.ForceRep.holds）。
         heat：温度の鍵（空白区切り。'warped rough'）。form：場面の長さ（空白区切り）。w：重み
       段の役割：lead（きっかけ：なぜ今か）・stop（受けが止められたのに止めなかった一文。きっかけの段の後ろに必ず付ける）・open（書き出し）・fore（前戯）・
         insert（繋がる段）・mid（最中の一幕。12 本以上。{mm}＝最中の声）・peak（山場。{m}＝受けの絶頂の声）・peakE（男性向けの山場。2 文以上）・end（終わり方）・
         after（事後の一文。関係か気分が動く）・again（濃いときのもう一度）・top（合意のない場面の攻めの構え。回数と攻めの態度で）・
         resist（合意のない場面の受けの反応。回数・受けの態度・心の強さで）・fade（ほのめかす一段）・change（前回と違う温度のときの変化の一文。{前} に前回の温度の言い方）。
         {m0}＝こらえる声。ok(ctx, t, a, b)：部屋の文の絞り込み。spot：場所（文字列か (ctx, o, form) を返す関数。HK.SexSpot の鍵）
   ■ R.scene(ctx, S, a, b, o) → { text, form, heat } か null（組めない段があれば null）。a＝攻め・b＝受け。名前は当ててある（DK.fill 済み）
       o：{ form: 'short'|'mid'|'long'|'fade', kind（入口の名前）, force（合意のない場面として組む。内容のスイッチ「無理矢理」が切なら偽にする）, spot, heat（温度の鍵で上書き）,
            stage・g（段の札を見る計器）, n（合意のない回数。省けば HK.ForceRep.n）, lv（'low'|'mid'|'high'。省けば HK.Lewd.lv）, ero（男性向けの山場。省けば HK.Lewd.ero）,
            when（時刻）, first（初めて）, couple（恋人として温度を決める）, after(ctx, S, a, b, r)（事後の計器・気分を動かす関数） }
       流れ：書き出し →（合意のない場面：攻めの構え）→ 前戯 →（受けの反応）→ 繋がる → 最中 2〜3 → 山場 → もう一度（濃いとき）→ 終わり → 事後。短い場面は 前戯 → 繋がる → 山場 → 終わり → 事後
   ■ R.lead(ctx, S, x, y, o) → きっかけの段の記録（e.tag＝'きっかけ'、理由の欄は「きっかけ：…」）。o.text（部屋が書いた文）か lead の表と stop の表から
   ■ R.run(ctx, S, a, b, o) → 場面の記録か null：回数の上限 → 可否 → きっかけの段 → 場面 → 記録（sex・lewd）→ 回数・合意のない回数を数える → o.after。
       場面が出なければきっかけの段も取り除く。o.why（理由の欄）・o.leadWhy（きっかけの理由）・o.id（出来事の id）・o.cat（既定 'bond'）・o.x（言い出した人）・o.leadText・o.fx
   ■ R.quota(ctx, S, env)：エッチの回数の上限（なし 0／少なめ 1／ふつう 2／多め 3）を S.r18 に置く。R.left(S)：残り。R.formOf(ctx, S, env, o)：長さ（多めで長い場面がまだ無く o.last なら長い）。
     R.missed(S)：上限があるのに一度も出なかったか（部屋は理由の文を一つ出す）
   ■ R.ok(ctx, S, a, b)：体の場面にしてよい二人か（全年齢・S.noBody・HK.DarkKit.noBody・HK.Pos.okSex・R18 に参加しない）。R.shape(a, b)：mf／ff／fm。R.fit(t, a, b, sh)：体の語が体に合う文か。
     R.firm(b)：心が折れない受けか。R.nTag(n)：'1'・'2'・'3+'
   体の語は印（{男性器} など）。登場人物はすべて成人として扱う。全年齢版のファイルは作らない（R18版だけのパック） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit) return;
  var DK = HK.DarkKit, R = DK.R18 = DK.R18 || {};
  var KINDS = R.KINDS = ['lead', 'stop', 'open', 'fore', 'insert', 'mid', 'peak', 'peakE', 'end', 'after', 'again', 'resist', 'top', 'fade', 'change'];
  var ROOMS = R.ROOMS = R.ROOMS || {};
  var BODY_F = /\{(?:女性器|陰核|愛液)\}|潮を/;
  var B_MALE = /\{b\}の(?:[^。、{]{0,4})\{(?:男性器|先走り|亀頭)\}/, A_MALE = /\{a\}の(?:[^。、{]{0,4})\{(?:男性器|先走り|亀頭|精液)\}/;
  var REAR = /うつ伏せ|四つん這い|後ろから|背後から|背中から/, REAR_NG = /見つめ|目を合わせ|目が合|額|唇を重ね|顔を(?:見|のぞ|覗)|見下ろ|見上げ|頬を|胸に頬|脚を絡め|首に(?:腕|しがみ)/;
  var ROUGH_V = /ちっ|しろよ|しやがれ|てめえ|んじゃねえ/;

  /* ---------- 部屋の表 ---------- */
  function normList(list) {
    var out = [];
    var push = function (x, sh0) {
      if (!x) return;
      if (typeof x === 'string') { out.push({ t: x, sh: sh0 || '' }); return; }
      if (typeof x.t === 'string') { var r = {}; Object.keys(x).forEach(function (k) { r[k] = x[k]; }); if (!r.sh && sh0) r.sh = sh0; out.push(r); return; }
      ['mf', 'ff', 'fm', 'all'].forEach(function (k) {
        (x[k] || []).forEach(function (y) {
          var sh1 = k === 'all' ? '' : k;
          if (typeof y === 'string') y = { t: y };
          var r = {}; Object.keys(x).forEach(function (q) { if (['mf', 'ff', 'fm', 'all'].indexOf(q) < 0) r[q] = x[q]; });
          Object.keys(y).forEach(function (q) { r[q] = y[q]; });
          if (!r.sh) r.sh = sh1;
          push(r);
        });
      });
    };
    (Array.isArray(list) ? list : [list]).forEach(function (x) { push(x, ''); });
    return out;
  }
  function roomRec(id) { return ROOMS[id] || (ROOMS[id] = { ok: null, spot: '' }); }
  R.addPart = function (id, kind, list) {
    if (!id || KINDS.indexOf(kind) < 0) throw new Error('HK.DarkKit.R18：段の名前が違います: ' + kind);
    var r = roomRec(id), l = r[kind] || (r[kind] = []), have = {};
    l.forEach(function (x) { have[(x.sh || '') + '|' + x.t] = 1; });
    normList(list).forEach(function (x) { var k = (x.sh || '') + '|' + x.t; if (!have[k]) { have[k] = 1; l.push(x); } });
  };
  R.addRoom = function (id, def) {
    if (!id || !def) return;
    var r = roomRec(id);
    if (typeof def.ok === 'function') r.ok = def.ok;
    if (def.spot) r.spot = def.spot;
    KINDS.forEach(function (k) { if (def[k]) R.addPart(id, k, def[k]); });
  };
  R.roomOf = function (ctx) {
    if (ctx && ctx.input && ctx.input.scenId) return ctx.input.scenId;
    if (HK.Play && HK.Play.scenIdOf) return HK.Play.scenIdOf({ ctx: ctx });
    return '';
  };
  R.count = function (id, kind, sh) { var r = ROOMS[id]; return r && r[kind] ? r[kind].filter(function (x) { return !x.sh || String(x.sh).split(/\s+/).indexOf(sh) >= 0; }).length : 0; };

  /* ---------- 体・形・心の強さ ---------- */
  R.shape = function (a, b) {
    if (HK.Heat && HK.Heat.modeOf) return HK.Heat.modeOf(a, b);
    var P = HK.Pos, fem = P && P.isF;
    return fem && fem(a) && fem(b) ? 'ff' : fem && fem(a) && !fem(b) ? 'fm' : 'mf';
  };
  function hasM(c) { var P = HK.Pos; return !!(P && P.hasM && P.hasM(c)); }
  R.fit = function (t, a, b, sh) {
    if (typeof t !== 'string') return false;
    var bM = hasM(b), aM = hasM(a);
    if (bM && BODY_F.test(t)) return false;
    if (!bM && B_MALE.test(t)) return false;
    if (!aM && A_MALE.test(t)) return false;
    /* 女性の攻め × 男性の受け：跨る文を使わない（指と手・まれにペニバン。フタナリの攻めは mf の形になる） */
    if (sh === 'fm' && /跨[がっりるれろ]/.test(t)) return false;
    return true;
  };
  R.firm = function (b) {
    var FR = HK.ForceRep;
    var w = FR && FR.will ? FR.will(b) : (b && (b.will === 'weak' || b.will === 'strong') ? b.will : 'avg');
    if (w === 'strong') return true;
    if (w === 'weak') return false;
    return /^(proud|stern|cool)$/.test(DK.per(b));
  };
  R.nTag = function (n) { return n >= 3 ? '3+' : n >= 2 ? '2' : '1'; };
  function nOk(tag, n) {
    if (tag == null || tag === '') return true;
    return String(tag).split(/\s+/).some(function (x) { return x === '3+' ? n >= 3 : +x === n; });
  }
  function inList(v, list) { return list == null || list === '' || String(list).split(/\s+/).indexOf(v) >= 0; }

  /* ---------- 候補を引く ---------- */
  /* 部屋の表の候補（行）。o：scene の o に、sh・a・b・nN（合意のない回数）・heatKey・spot・form を足したもの */
  function cands(ctx, S, id, kind, o) {
    var r = ROOMS[id]; if (!r || !r[kind]) return [];
    var a = o.a, b = o.b, sh = o.sh, pa = DK.per(a), pb = DK.per(b), fm = R.firm(b);
    var l = r[kind].filter(function (x) {
      if (x.sh && String(x.sh).split(/\s+/).indexOf(sh) < 0) return false;
      if (x.n != null && x.n !== '') { if (!o.force || !nOk(x.n, o.nN)) return false; }
      if (x.kind && !inList(o.kind || '', x.kind)) return false;
      if (x.per && !inList(pa, x.per)) return false;
      if (x.bper && !inList(pb, x.bper)) return false;
      if (x.firm != null && !!x.firm !== fm) return false;
      if (x.heat && o.heatKey && !inList(o.heatKey, x.heat)) return false;
      if (x.form && o.form && !inList(o.form, x.form)) return false;
      if (x.st != null && x.st !== '') {
        var parts = String(x.st).split(/\s+/);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i], c = p.indexOf(':'), n;
          try { if (c >= 0) { n = DK.stage(S, p.slice(0, c)); p = p.slice(c + 1); } else n = o.stage != null ? +o.stage : o.g ? DK.stage(S, o.g) : 0; } catch (e) { return false; }
          if (!DK.stOk(p, n)) return false;
        }
      }
      try { if (typeof x.when === 'function' && !x.when(ctx, S, a, b, o)) return false; if (r.ok && !r.ok(ctx, x.t, a, b)) return false; } catch (e) { return false; }
      return R.fit(x.t, a, b, sh);
    });
    /* 場所・時刻・温度で絞る（残りが無ければ絞らない） */
    var SP = HK.SexSpot, ST = HK.SceneTime, HT = HK.Heat;
    if (o.spot && SP && SP.fitsSub) { var l2 = l.filter(function (x) { return SP.fitsSub(x.t, o.spot); }); if (l2.length) l = l2; }
    if (ST && ST.cur && ST.ok) { var l3 = l.filter(function (x) { return ST.ok(x.t); }); if (l3.length) l = l3; }
    if (HT && HT.cur && HT.trim && o.heatKey) { var keep = HT.trim(l.map(function (x) { return x.t; }), kind, o.heatKey); l = l.filter(function (x) { return keep.indexOf(x.t) >= 0; }); }
    return l;
  }
  R.cands = function (ctx, S, kind, o) { return cands(ctx, S, o.room || R.roomOf(ctx), kind, o); };
  /* 一つ引く（一回の遊びで同じ文は二度出さない。使い切ったら使った回数が少なく古いものから。o.avoid＝同じ場面で使った文） */
  function part(ctx, S, id, kind, o) {
    var l = cands(ctx, S, id, kind, o);
    if (o.avoid && o.avoid.length) { var l2 = l.filter(function (x) { return o.avoid.indexOf(x.t) < 0; }); if (l2.length) l = l2; }
    if (o.rear) { var l3 = l.filter(function (x) { return !REAR_NG.test(x.t); }); if (l3.length) l = l3; }
    if (!l.length) return '';
    return DK.pick(ctx, S, l.map(function (x) { return { t: x.t, w: x.w }; }), { again: true }) || '';
  }
  R.part = function (ctx, S, kind, o) { return part(ctx, S, o.room || R.roomOf(ctx), kind, o); };

  /* ---------- 喘ぎ（本体の声の表） ---------- */
  function voice(ctx, b, stage, force) {
    var E = HK.Ero, fB = !!(HK.Pos && HK.Pos.isF && HK.Pos.isF(b)), m = '';
    for (var i = 0; i < 6; i++) {
      m = E && E.moan ? String(E.moan(ctx, b, stage, { force: !!force, late: stage >= 2 }) || '') : '';
      if (!fB || !ROUGH_V.test(m)) break;
    }
    if (fB && ROUGH_V.test(m)) m = '';
    m = m.replace(/^「|」$/g, '');
    return m ? '{b}「' + m + '」' : '';
  }
  R.voice = voice;

  /* ---------- 流れの管理（本体の HK.SexFlow.fix。山場の前に足される本体の追い上げの段は、部屋の最中の一幕に置き換えるか外す） ---------- */
  function flowFix(ctx, S, id, body, o, aft) {
    var F = HK.SexFlow; if (!F || !F.fix || !body) return body;
    var t;
    try { var r = F.fix(body, { a: o.a, b: o.b, mode: o.sh, after: aft || '' }); t = r && typeof r.text === 'string' && r.text ? r.text : body; } catch (e) { return body; }
    if (t === body) return t;
    var BU = ((HK.SexFlowText || {}).BUILD || {})[o.sh === 'ff' || o.sh === 'fm' ? o.sh : 'mf'] || [];
    if (!BU.length) return t;
    var nm = function (x) { return String(x).split('{a}').join(o.a.name).split('{b}').join(o.b.name); };
    var heads = []; BU.forEach(function (x) { var h = String(x).split('。')[0]; if (h.length >= 10) heads.push(h, nm(h)); });
    var isB = function (p) { return heads.some(function (h) { return p.indexOf(h) >= 0; }); };
    return t.split('\n\n').map(function (p) {
      if (!isB(p)) return p;
      if (o.form === 'short') return null;
      var m = part(ctx, S, id, 'mid', o);
      return m ? m.replace(/\{mm\}/g, function () { return voice(ctx, o.b, 1, o.force); }) : null;
    }).filter(function (p) { return p != null; }).join('\n\n');
  }
  R.flowFix = function (ctx, S, body, o, aft) { return flowFix(ctx, S, o.room || R.roomOf(ctx), body, o, aft); };

  /* ---------- 部屋の段だけで組む ---------- */
  function compose(ctx, S, id, o) {
    var used = [], ps = [], form = o.form;
    var P1 = function (kind) { o.avoid = used; var t = part(ctx, S, id, kind, o); if (t) used.push(t); if (kind === 'insert' && REAR.test(t)) o.rear = true; return t; };
    if (form === 'fade') { var fd = P1('fade'); return fd ? { body: fd, after: '' } : null; }
    var long = form === 'long', short = form === 'short', thick = ctx.env && ctx.env.lewdLen === 'thick';
    if (!short) ps.push(P1('open'));
    if (o.force && !short) ps.push(P1('top'));
    ps.push(P1('fore'));
    var hk = o.heatKey || '';
    if (long && (hk === 'sweet' || hk === 'fresh' || thick || ctx.rng() < 0.5)) { var f2 = P1('fore'); if (f2) ps.push(f2); }
    if (o.force) ps.push(P1('resist'));
    ps.push(P1('insert'));
    if (!short) { var nMid = long ? (thick ? 3 : 2 + (ctx.rng() < 0.4 ? 1 : 0)) : 2; for (var i = 0; i < nMid; i++) { var m0 = P1('mid'); if (m0) ps.push(m0); else break; } }
    var ero = o.ero && R.count(id, 'peakE', o.sh) > 0;
    ps.push(P1(ero ? 'peakE' : 'peak'));
    if (o.lv === 'high' && !short) { var ag = P1('again'); if (ag) ps.push(ag); }
    ps.push(P1('end'));
    if (ps.some(function (x) { return !x; })) return null;
    var aft = P1('after');
    if (HK.NovelMoan) HK.NovelMoan.top = o.a;
    var fill = function (t) {
      return t.replace(/\{mm\}/g, function () { return voice(ctx, o.b, 1, o.force); }).replace(/\{m0\}/g, function () { return voice(ctx, o.b, 0, o.force); })
        .replace('{m}', voice(ctx, o.b, 2, o.force)).replace(/\{m\}/g, '');
    };
    var body = fill(ps.join('\n\n'));
    body = flowFix(ctx, S, id, body, o, aft);
    return { body: body, after: aft ? fill(aft) : '' };
  }

  /* ---------- 場面 ---------- */
  function heatOf(ctx, o) {
    var HT = HK.Heat, rid = o.room;
    if (!HT || !HT.enabled || !HT.enabled(rid) || HK.SAFE_ON) return null;
    var h = HT.of(ctx, o.a, o.b, { rel: o.couple ? 'lover' : undefined, first: o.first != null ? !!o.first : undefined, force: !!o.force, scen: rid });
    if (o.heat && HT.KEYS.indexOf(o.heat) >= 0 && !(h.key === 'dry' && /内容のスイッチ/.test(h.why) && /^(rough|warped)$/.test(o.heat))) h.key = o.heat;
    return h;
  }
  R.scene = function (ctx, S, a, b, o) {
    o = Object.assign({}, o || {});
    if (HK.SAFE_ON || !a || !b || a === b) return null;
    var id = o.room = o.room || R.roomOf(ctx), rr = ROOMS[id]; if (!rr) return null;
    var env = ctx.env || {}, LV = HK.Lewd;
    o.a = a; o.b = b; o.sh = o.sh || R.shape(a, b);
    o.force = !!(o.force && DK.content(ctx, 'force'));
    o.nN = o.force ? (o.n != null ? +o.n : HK.ForceRep && HK.ForceRep.n ? HK.ForceRep.n(ctx, a, b) : 1) : 0;
    o.lv = o.lv || (LV && LV.lv ? LV.lv(env) : 'mid');
    if (o.ero == null) o.ero = !!(LV && LV.ero && LV.ero(env));
    if (o.sh === 'fm') o.ero = false;
    o.form = o.form || R.formOf(ctx, S, env, o);
    if (o.lv === 'low') o.form = 'fade';
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)) o.form = 'fade';
    o.spot = o.spot || (typeof rr.spot === 'function' ? rr.spot(ctx, o, o.form) : rr.spot) || '';
    var ST = HK.SceneTime, w = ST && ST.of ? ST.of(S, o) : '';
    var go = function () {
      var SP = HK.SexSpot, sp = SP && SP.norm ? SP.norm(o.spot) : '', set = sp && SP && !SP.cur;
      if (set) SP.cur = sp;
      var PL = HK.Play, off0 = PL ? PL.off : null;
      if (PL) PL.off = true;   /* 本体の型の体位の一文を差さない（部屋の段の体位と食い違うため） */
      try { return scene1(ctx, S, id, o); } finally { if (PL) PL.off = off0; if (set) SP.cur = null; }
    };
    var r = w && ST.run ? ST.run(w, function () { var x = go(); if (x && ST.fix) x.text = ST.fix(x.text, w); return x; }) : go();
    if (r && typeof o.after === 'function' && !o._noAfter) o.after(ctx, S, a, b, r);
    return r;
  };
  function scene1(ctx, S, id, o) {
    var HT = HK.Heat, h = heatOf(ctx, o), a = o.a, b = o.b, sc = null;
    o.heatKey = h ? h.key : (o.heat || '');
    var c = h ? HT.scope(ctx, a, b, h, function (s) { sc = s; return compose(ctx, S, id, o); }) : compose(ctx, S, id, o);
    if (!c || !c.body) return null;
    var text = c.body;
    if (h && o.form !== 'fade') {
      if (HT.strip) text = HT.strip(text, h.key);
      /* 変化の一文（前回と違う温度のとき。部屋の change の表から。同じ二人で同じ文は一回まで） */
      var chg = '';
      if (h.prev && h.prev !== h.key) {
        var cl = cands(ctx, S, id, 'change', o).map(function (x) { return x.t; }).filter(function (t) { return DK.fresh(S, t); });
        if (cl.length) { chg = cl[Math.floor(ctx.rng() * cl.length)]; DK.use(S, chg); chg = chg.replace(/\{前\}/g, (HT.PREV_W || {})[h.prev] || ''); }
      }
      if (chg) { var ps = text.split('\n\n'); ps.splice(Math.min(1, ps.length), 0, chg); text = ps.join('\n\n'); }
      if (sc) { sc.change = chg; sc.after = c.after || ''; }
    }
    if (c.after) text = text.replace(/\s+$/, '') + (o.form === 'fade' ? '' : '\n\n') + c.after;
    text = DK.fill(ctx, text, a, b);
    if (h) {
      if (o.form !== 'fade') { HT.move(ctx, h, a, b); HT.note(ctx, h, a, b, { sc: sc, text: text, form: o.form }); }
      HT.remember(ctx, a, b, h.key);
    }
    return { text: text, form: o.form, heat: h ? h.key : '', sh: o.sh, n: o.nN };
  }

  /* ---------- 回数・長さ ---------- */
  R.quota = function (ctx, S, env) {
    var v = (env || ctx.env || {}).lewdN, max = v === 'none' ? 0 : v === 'low' ? 1 : v === 'high' ? 3 : 2;
    if (HK.SAFE_ON) max = 0;
    S.r18 = { max: max, n: 0, longN: 0, lv: v || 'mid' };
    return max;
  };
  R.left = function (S) { var q = S.r18; return q ? Math.max(0, q.max - q.n) : 0; };
  R.missed = function (S) { var q = S.r18; return !!(q && q.max > 0 && q.n === 0); };
  R.formOf = function (ctx, S, env, o) {
    o = o || {}; env = env || ctx.env || {};
    var LV = HK.Lewd, lv = o.lv || (LV && LV.lv ? LV.lv(env) : 'mid'), q = S.r18 || {};
    if (lv === 'low') return 'fade';
    if (env.lewdLen === 'short') return 'short';
    if (env.lewdLen === 'thick') return 'long';
    if (q.max >= 3 && !q.longN && (o.last || R.left(S) <= 1)) return 'long';
    var x = ctx.rng();
    return x < (q.max >= 3 ? 0.35 : 0.2) ? 'long' : x < 0.75 ? 'mid' : 'short';
  };

  /* ---------- 可否 ---------- */
  R.ok = function (ctx, S, a, b) {
    if (HK.SAFE_ON || !a || !b || a === b) return false;
    if (S && S.noBody) return false;
    if (DK.noBody && DK.noBody(a, b)) return false;
    if (a.noR18 || b.noR18) return false;
    var P = HK.Pos;
    if (P && P.okSex && !P.okSex(a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    return true;
  };

  /* ---------- きっかけの段 ---------- */
  R.lead = function (ctx, S, x, y, o) {
    o = Object.assign({}, o || {});
    var id = o.room = o.room || R.roomOf(ctx);
    var a = o.a || x, b = o.b || y;
    var q = { a: a, b: b, sh: o.sh || R.shape(a, b), kind: o.kind || '', force: !!o.force, nN: o.nN || 0, stage: o.stage, g: o.g, heatKey: o.heat || '', form: o.form || '' };
    var t = o.text || part(ctx, S, id, 'lead', q);
    if (!t) return null;
    /* 受けが止められたのに止めなかった一文（stop の表があれば必ず） */
    if (ROOMS[id] && ROOMS[id].stop && ROOMS[id].stop.length && !o.noStop) { var sp = part(ctx, S, id, 'stop', q); if (sp) t = t.replace(/\s+$/, '') + sp; }
    var tx = DK.fill(ctx, t, a, b);
    if (DK.NG.test(tx)) { (ctx._dkLeak = ctx._dkLeak || []).push(tx.slice(0, 60)); return null; }
    var le = ctx.say({ kind: 'event', cat: o.cat || 'bond', actors: [x, y], text: tx, why: 'きっかけ：' + (o.why || '夜'), mag: 0 });
    if (!le || le.skipped || !le.text) return null;
    le.tag = 'きっかけ';
    if (o.id) le.ev = String(o.id);
    return le;
  };
  function drop(ctx, le) { if (!le) return; var L = ctx.log, i = L.indexOf(le); if (i >= 0) { L.splice(i, 1); for (var j = i; j < L.length; j++) if (L[j]) L[j].n = j; } }
  R.drop = drop;

  /* ---------- 合意のない回数（本体の HK.ForceRep の数え方にそろえる。本体の回数の文は差さない） ---------- */
  function frKey(a, b) { var x = a.i != null ? a.i : a.name, y = b.i != null ? b.i : b.name; return x < y ? x + '-' + y : y + '-' + x; }
  function frHold(ctx, a, b) { var FR = HK.ForceRep; if (!FR || !FR.dk) return; var D0 = ctx._frDone = ctx._frDone || {}; D0[FR.dk(ctx, a, b)] = 1; }
  function frBump(ctx, a, b, e, n) {
    var FR = HK.ForceRep; if (!FR || !FR.on || !FR.on(ctx)) return;
    var m = ctx._frN = ctx._frN || {}, k = frKey(a, b); m[k] = (m[k] || 0) + 1;
    if (FR.log) FR.log.push({ n: n, key: k, e: e.n, lead: true, parts: { room: 1 }, room: R.roomOf(ctx) });
  }

  /* ---------- きっかけ → 場面 → 記録 ---------- */
  R.run = function (ctx, S, a, b, o) {
    o = Object.assign({}, o || {});
    if (!S.r18) R.quota(ctx, S, ctx.env);
    if (!R.left(S) || !R.ok(ctx, S, a, b)) return null;
    o.room = o.room || R.roomOf(ctx);
    o.force = !!(o.force && DK.content(ctx, 'force'));
    var nN = o.force ? (o.n != null ? +o.n : HK.ForceRep && HK.ForceRep.n ? HK.ForceRep.n(ctx, a, b) : 1) : 0;
    o.n = nN;
    var env = ctx.env || {};
    o.form = o.form || R.formOf(ctx, S, env, o);
    var x = o.x || a, y = x === a ? b : a;
    var le = R.lead(ctx, S, x, y, { room: o.room, a: a, b: b, kind: o.kind, force: o.force, nN: nN, stage: o.stage, g: o.g, heat: o.heat, text: o.leadText, why: o.leadWhy || o.why, cat: o.cat, id: o.id, form: o.form });
    if (!le) return null;
    var after = o.after; o._noAfter = true;
    var r = R.scene(ctx, S, a, b, o);
    if (!r || !r.text) { drop(ctx, le); return null; }
    if (o.force) frHold(ctx, a, b);
    var e = DK.say(ctx, { id: o.id, actors: [a, b], cat: o.cat || 'bond', text: r.text, why: o.why || '夜', sex: true, force: o.force, lewd: r.form !== 'fade', mag: o.mag || 0, fx: o.fx, face: o.face });
    if (!e || e.skipped) { drop(ctx, le); return null; }
    var q = S.r18; q.n++; if (r.form === 'long') q.longN++;
    if (o.force) frBump(ctx, a, b, e, nN);
    if (typeof after === 'function') after(ctx, S, a, b, r, e);
    return e;
  };
})();
