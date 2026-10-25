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
      return { name: name, gender: g, tone: o.tone || '', fp: o.fp || '', eg: eg, tr: HK.traits ? HK.traits(eg) : {}, likes: o.likes || '', pos: o.pos || '', role: o.role || '', mob: true, calls: {}, loveNG: [] };
    },
    /* 住人 c がモブとの体の場面に出られるか（R18に参加しない・恋人だけ・全年齢を見る） */
    sexOk: function (c) { return !!(HK.State ? HK.State.mobSexOk(c) : !HK.SAFE_ON); },
    /* モブを相手にしたときの住人の向き（'top'／'bottom'。自分で攻めを選んだ人は、モブには受けにしていない限り top） */
    side: function (c, def) { return HK.Pos && HK.Pos.vsNpc ? HK.Pos.vsNpc(c, def || 'bottom') : def || 'bottom'; }
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
