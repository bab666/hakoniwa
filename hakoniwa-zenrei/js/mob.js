/* 箱庭シミュレーター: モブと役割の枠（全箱庭で共通。全年齢版も同じ）
   ・HK.Mob：箱庭が用意する住人でない人（客・スタッフ・獲物・NPC など）を作る一か所
       HK.Mob.register(key, list)：名前の表を登録する（各箱庭の表はここに登録し、使うときは HK.Mob.list(key) で引く）
       HK.Mob.make(S, { gender, role, tone, likes, pool })：{ name, gender, tone, fp, tr, eg, likes, pos, mob: true } を作る
         S は rng を持つもの（ctx・物語型の S・{ rng }）。名前は pool（登録した表）か、性別ごとの共通の表から
       モブとの体の場面は、住人の側を必ず HK.State.mobSexOk で確かめ、向きは HK.Pos.vsNpc（攻め・モブには受け）で決める（HK.Mob.sexOk）
   ・HK.Roles：「この役を住人がやるか・モブがやるか・なしか」を選ぶ共通の欄
       HK.Roles.install(scen, id, label, opts)：住人ごとの欄（perFields：この役になる／ならない）と、環境値（role_<id>：おまかせ／住人から／モブ／なし）を足す
         opts = { allowMob: true, allowNone: false, auto: 'mob'|'res'|'none'（おまかせのとき）, n: 住人から選ぶ人数, fit: function (c) 住人から選ぶときの向き, yes: '欄の文言', desc }
       HK.Roles.resolve(S, id, input, opts)：{ kind: 'res'|'mob'|'none', who: [住人], mob: モブ }
         S.P か ctx.chars を住人の一覧として使う。住人の欄で「この役になる」を選んだ人が優先、「ならない」を選んだ人は選ばない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var POOLS = {
    /* 性別ごとの共通の表（苗字だけ・苗字＋下の名前の両方で使える） */
    sur: L('佐伯|真壁|倉田|東条|雨宮|久住|白石|七瀬|東雲|氷室|高槻|九条|如月|鷺沢|御影|柊|遠野|神楽|早乙女|常盤|黒須|桐生|朝比奈|田所|井上|大河内|宮下|小野寺|三好|今村|川端|須藤|有馬|浅野|久保|仲村|藤枝|保科|榎本'),
    m: L('湊|朔|律|蓮|陽|颯|悠|岳|迅|慧|樹|周'),
    f: L('灯|澪|凛|紬|雫|葵|栞|楓|遥|詩|茜|琴'),
    x: L('澄|晶|渚|司|薫|響|千尋|和泉|真琴|伊織')
  };
  var M = HK.Mob = {
    register: function (key, list) { if (key && Array.isArray(list)) POOLS[key] = list; return list; },
    list: function (key) { return POOLS[key] || []; },
    keys: function () { return Object.keys(POOLS); },
    make: function (S, o) {
      o = o || {};
      var rng = S && S.rng ? S.rng : Math.random, r = function () { return typeof rng === 'function' ? rng() : Math.random(); };
      var pick = function (a) { return a[Math.floor(r() * a.length)]; };
      var g = o.gender || (r() < 0.5 ? 'm' : 'f');
      var name = o.name || (o.pool && POOLS[o.pool] && POOLS[o.pool].length ? pick(POOLS[o.pool]) : pick(POOLS.sur) + (o.given ? pick(POOLS[g] || POOLS.x) : ''));
      if (o.role && !o.name) name = o.role + 'の' + name;
      var eg = {}; ['CP', 'NP', 'A', 'FC', 'AC'].forEach(function (k) { eg[k] = Math.round(4 + r() * 14); });
      var mob = { name: name, gender: g, tone: o.tone || '', fp: o.fp || '', eg: eg, tr: HK.traits ? HK.traits(eg) : {}, likes: o.likes || '', pos: o.pos || '', role: o.role || '', mob: true, calls: {}, loveNG: [] };
      /* 呼びかけ用の短い名前（「警備員の佐伯」→「佐伯」）。住人の台詞の安全網（tone-plus.js の V.mobAddr）のために、この回で作った名前を覚える */
      mob.short = o.role && !o.name ? name.slice(o.role.length + 1) : name;
      M._made.push(name); if (mob.short !== name) M._made.push(mob.short); if (M._made.length > 200) M._made.splice(0, M._made.length - 200);
      return mob;
    },
    _made: [],
    /* 住人 c がモブとの体の場面に出られるか（R18に参加しない・性行為の相手を固定した相手だけ・全年齢を見る） */
    sexOk: function (c) { return !!(HK.State ? HK.State.mobSexOk(c) : !HK.SAFE_ON); },
    /* モブを相手にしたときの住人の向き（'top'／'bottom'。自分で攻めを選んだ人は、モブには受けにしていない限り top） */
    side: function (c, def) { return HK.Pos && HK.Pos.vsNpc ? HK.Pos.vsNpc(c, def || 'bottom') : def || 'bottom'; }
  };
  /* ---------- モブへの呼びかけ ----------
     住人がモブに話しかける台詞では、モブの名前を直接書かずに {you} と書き、M.you(文, モブ, 敬称) で印に替える。
     印は「\u2063 名前 \u2063」（名前で呼べるモブ）か「\u2063 名前 \u2061」（「泥酔したサラリーマン」のような呼び名だけのモブ）。
     住人の台詞では tone-plus.js の V.mobAddr が、話し手の二人称（設定の二人称、なければ口調の既定 HK.TONE_YOU）に置き換える。
     全体の設定「モブへの呼びかけ」（events-common.js の mobYou）が「名前で」なら、名前で呼べるモブは短い名前＋敬称で呼ぶ。
     話し手が分からなかった台詞に残った印は、二人称なら「あなた」、名前でなら名前にする（M.unmark。tone-plus.js・persona-final.js が結果を返す前に外す） */
  var MK = '\u2063', NO = '\u2061', MK_RE = /\u2063([^\u2063\u2061]*)[\u2063\u2061]/g;
  M.MARK = MK;
  /* 呼び名から、名前として呼べる部分（「恋人の湊」→「湊」「店長」→「店長」）。説明だけの呼び名（「若いスタッフ」「名前も知らない誰か」）は '' */
  M.short = function (full) {
    full = String(full || '');
    var t = full.lastIndexOf('の') >= 0 ? full.slice(full.lastIndexOf('の') + 1) : full;
    /* 「元患者」「貴族」「漫画家」のような肩書き・身の上だけの語は名前にしない */
    return /^[一-鿿々ァ-ヶー]{1,4}$/.test(t) && !/^元|[者男女人族手家]$/.test(t) ? t : '';
  };
  /* m：モブ（{ name, short }・{ name, label }）か呼び名の文字列。hon：名前で呼ぶときの敬称（「さん」など） */
  M.addr = function (m, hon) {
    var full = typeof m === 'string' ? m : (m && (m.full || m.label || m.name)) || '';
    var sh = m && typeof m === 'object' ? (m.short != null ? m.short : m.label && m.name && m.label !== m.name ? m.name : M.short(full)) : M.short(full);
    M._used = true;
    return MK + (sh || full) + (sh ? hon || '' : '') + (sh ? MK : NO);
  };
  M.you = function (t, m, hon) { return typeof t === 'string' && t.indexOf('{you}') >= 0 ? t.replace(/\{you\}/g, M.addr(m, hon)) : t; };
  M.unmark = function (o, byName, seen) {
    if (typeof o === 'string') return o.indexOf(MK) < 0 ? o : o.replace(MK_RE, function (m, nm, end) { return byName && end === MK ? nm : 'あなた'; }).replace(/[\u2063\u2061]/g, '');
    if (!o || typeof o !== 'object') return o;
    seen = seen || new Set();
    if (seen.has(o)) return o;
    seen.add(o);
    Object.keys(o).forEach(function (k) { var v = o[k]; if (typeof v === 'string' ? v.indexOf(MK) >= 0 : v && typeof v === 'object') { var r = M.unmark(v, byName, seen); if (r !== v) o[k] = r; } });
    return o;
  };
  /* 住人の一覧と、住人ごとの欄（perChar.pick） */
  function people(S) { return (S && (S.P || S.chars)) || []; }
  function pickOf(input, c) { var pc = input && input.perChar && input.perChar[c.i]; return (pc && pc.pick) || {}; }
  var R = HK.Roles = {
    envId: function (id) { return 'role_' + id; },
    field: function (id, label, opts) {
      opts = opts || {};
      var src = [{ v: 'auto', label: 'おまかせ' + (opts.auto === 'res' ? '（住人から）' : opts.auto === 'none' ? '（なし）' : opts.allowMob !== false ? '（モブ）' : '') }, { v: 'res', label: '住人から' }];
      if (opts.allowMob !== false) src.push({ v: 'mob', label: 'モブ' });
      if (opts.allowNone) src.push({ v: 'none', label: 'なし' });
      return {
        per: { id: id, label: label, auto: 'おまかせ', options: [{ id: 'yes', label: opts.yes || label + 'になる' }, { id: 'no', label: 'ならない' }] },
        env: { id: R.envId(id), label: label, type: 'select', def: 'auto', options: src, desc: opts.desc || (label + 'を、住人がやるか' + (opts.allowMob !== false ? '・モブがやるか' : '') + (opts.allowNone ? '・なしにするか' : '') + 'を選びます。住人の欄で「' + (opts.yes || label + 'になる') + '」を選んだ人が優先されます') }
      };
    },
    install: function (scen, id, label, opts) {
      if (!scen) return null;
      var f = R.field(id, label, opts);
      scen.perFields = (scen.perFields || []).filter(function (x) { return x.id !== id; }).concat([f.per]);
      scen.env = (scen.env || []).filter(function (x) { return x.id !== f.env.id; });
      var at = opts && opts.envBefore ? scen.env.map(function (x) { return x.id; }).indexOf(opts.envBefore) : -1;
      if (at >= 0) scen.env.splice(at, 0, f.env); else scen.env.push(f.env);
      (scen.roles = scen.roles || {})[id] = opts || {};
      return f;
    },
    resolve: function (S, id, input, opts) {
      opts = opts || (S && S.scen && S.scen.roles && S.scen.roles[id]) || {};
      var env = (S && S.env) || {}, src = env[R.envId(id)] || 'auto', P = people(S).filter(function (c) { return !(HK.State && !HK.State.here(c)); });
      var yes = P.filter(function (c) { return pickOf(input, c)[id] === 'yes'; }), ok = P.filter(function (c) { return pickOf(input, c)[id] !== 'no'; });
      var n = opts.n || 1;
      if (src === 'auto') src = yes.length ? 'res' : opts.auto || (opts.allowMob !== false ? 'mob' : 'res');
      if (src === 'none' && opts.allowNone) return { kind: 'none', who: [], mob: null };
      if (src === 'mob' && opts.allowMob !== false) return { kind: 'mob', who: [], mob: M.make(S, opts.mob || {}) };
      var who = yes.slice(0, n);
      if (who.length < n) {
        var rest = ok.filter(function (c) { return who.indexOf(c) < 0; });
        var rng = S && S.rng ? S.rng : Math.random;
        while (who.length < n && rest.length) {
          var c = HK.weighted ? HK.weighted(rng, rest, function (x) { return Math.max(0.05, opts.fit ? opts.fit(x) : 1); }) : rest[0];
          who.push(c); rest.splice(rest.indexOf(c), 1);
        }
      }
      if (!who.length) return opts.allowMob !== false ? { kind: 'mob', who: [], mob: M.make(S, opts.mob || {}) } : { kind: 'none', who: [], mob: null };
      return { kind: 'res', who: who, mob: null };
    }
  };
})();
