/* 箱庭シミュレーター: エロトラップダンジョンの結果表示とテキスト書き出し */
(function () {
  'use strict';
  var HK = window.HK, DG = HK.DG, esc = HK.escape;
  var DV = HK.DView = {};
  var keyOnly = false, lewdOnly = false, lastHost = null, lastRes = null;

  /* 名前に色を付ける人：挑戦者と、住人の主催者（dungeon-host.js・hole-host.js の res.host） */
  function who(res) { var L = (res.heroes || [res.hero]).filter(Boolean); if (res.host && res.host.kind === 'res' && res.host.name && !L.some(function (h) { return h.name === res.host.name; })) L = L.concat([res.host]); return L; }
  function paint(text, res) {
    var t = esc(HK.fmtLong ? HK.fmtLong(text, who(res).map(function (h) { return h && h.name; })) : text).replace(/\n/g, '<br>');
    who(res).slice().sort(function (a, b) { return b.name.length - a.name.length; }).forEach(function (h) {
      var n = esc(h.name);
      if (n) t = t.split(n).join('\u0001' + (h.i || 0) + '\u0002');
    });
    return t.replace(/\u0001(\d+)\u0002/g, function (m, i) { var h = who(res).filter(function (x) { return String(x.i || 0) === i; })[0]; return '<span class="name" style="color:var(--p' + i + ')">' + esc(h.name) + '</span>'; });
  }
  function chip(t, cls, title) { return '<span class="chip' + (cls ? ' ' + cls : '') + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + esc(t) + '</span>'; }

  /* 理性・堕ち度・快感の推移 */
  function gauge(res) {
    var H = res.hist, W = 640, Hh = 170, pl = 30, pr = 8, pt = 10, pb = 22;
    if (H.length < 2) return '';
    var n = H.length - 1, iw = W - pl - pr, ih = Hh - pt - pb;
    function x(i) { return pl + iw * i / n; }
    function y(v) { return pt + ih * (1 - Math.max(0, Math.min(100, v)) / 100); }
    function path(k) { return H.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p[k]).toFixed(1); }).join(''); }
    var grid = [0, 50, 100].map(function (v) { return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line)" stroke-width="1"/><text x="' + (pl - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + v + '</text>'; }).join('');
    var fl = '', last = -1;
    if (!res.noGear) H.forEach(function (p, i) {
      if (p.f !== last) {
        last = p.f;
        if (i > 0) fl += '<line x1="' + x(i) + '" x2="' + x(i) + '" y1="' + pt + '" y2="' + (Hh - pb) + '" stroke="var(--line)" stroke-dasharray="3 3"/>';
        fl += '<text x="' + (x(i) + 3) + '" y="' + (Hh - 6) + '" font-size="10" fill="var(--muted)">B' + (p.f + 1) + '</text>';
      }
    });
    if (res.party) {
      var lines = '', leg = '';
      res.heroes.forEach(function (h, j) {
        function pth(k) { return H.map(function (p, i) { var v = p.hs && p.hs[j] ? p.hs[j][k] : 0; return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(''); }
        lines += '<path d="' + pth('r') + '" fill="none" stroke="var(--p' + j + ')" stroke-width="1.4" stroke-dasharray="4 3" opacity=".75"/><path d="' + pth('c') + '" fill="none" stroke="var(--p' + j + ')" stroke-width="2.4"/>';
        leg += '<span><i style="background:var(--p' + j + ')"></i>' + esc(h.name) + '</span>';
      });
      return '<figure class="dggauge"><svg viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="仲間ごとの堕ち度と理性の推移">' + grid + fl + lines + '</svg><figcaption class="legend">' + leg + '<span>実線＝堕ち度（100で陥落）・点線＝理性</span><span>B＝地下の階</span></figcaption></figure>';
    }
    return '<figure class="dggauge"><svg viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="理性・堕ち度・快感の推移">' + grid + fl +
      '<path d="' + path('p') + '" fill="none" stroke="var(--pine)" stroke-width="1.2" opacity=".7"/>' +
      '<path d="' + path('r') + '" fill="none" stroke="var(--accent)" stroke-width="2.2"/>' +
      '<path d="' + path('c') + '" fill="none" stroke="var(--love)" stroke-width="2.2"/>' + (H[0].s != null ? '<path d="' + path('s') + '" fill="none" stroke="var(--guard)" stroke-width="1.6" stroke-dasharray="5 3"/>' : '') + '</svg>' +
      '<figcaption class="legend"><span><i style="background:var(--accent)"></i>理性</span><span><i style="background:var(--love)"></i>堕ち度（100で陥落）</span><span><i style="background:var(--pine)"></i>快感（100で絶頂）</span>' + (H[0].s != null ? '<span><i style="background:var(--guard)"></i>' + esc(res.gaugeS || '疑い（55で気づく）') + '</span>' : '<span>B＝地下の階</span>') + '</figcaption></figure>';
  }

  function devBars(h) {
    var d = h.dev;
    return '<div class="devbars">' + DG.PART_ORDER.map(function (k) {
      var v = Math.round((d[k] || 0) * 10) / 10;
      return '<div class="devrow"><span class="pt">' + esc(DG.PARTS[k]) + '</span><span class="bar"><i style="width:' + Math.min(100, v * 10) + '%"></i></span><span class="nums">' + v.toFixed(1) + '</span></div>';
    }).join('') + '</div>';
  }

  function heroCard(res, h) {
    var S = HK.SCENARIOS[res.scenId] || HK.SCENARIOS.dungeon, i = h.i || 0;
    var fateCls = h.fate === '陥落' ? 'dead' : h.fate === '踏破' ? 'ok' : 'mid';
    var stats = S.stats.map(function (s) { return chip(s.label + ' ' + h.stats[s.id], '', s.desc); }).join('');
    var curses = h.curses.length ? h.curses.map(function (c) { return chip(DG.CURSES[c].label, 'curse', DG.CURSES[c].desc); }).join('') : '<span class="nums">なし</span>';
    var items = h.items.length ? h.items.map(function (c) { return chip(DG.ITEMS[c].label, '', DG.ITEMS[c].desc); }).join('') : '<span class="nums">なし</span>';
    return '<div class="ccard"><div class="hd">' + HK.Icons.html(h.name, i, 40, h.fate === '陥落' ? 'gone' : '') + '<span class="nm">' + esc(h.name) + '</span>' + (res.party ? '<span class="fate ' + fateCls + '">' + esc(h.fate) + '</span>' : '') + '<span class="nums">' + esc(HK.toCode(h.eg)) + '・' + esc(HK.egoType(h.eg).label) + '</span></div>' +
      (res.party ? '<div class="sub">堕ち度 ' + h.corrupt + '・理性 ' + h.reason + '・絶頂 ' + h.climax + '回' + (h.fallTitle ? '・' + esc(h.fallTitle) : '') + '</div>' : '') +
      (h.memo ? '<div class="sub">' + esc(h.memo) + '</div>' : '') +
      '<div class="sub">態度：<b>' + esc(HK.toneLabel ? HK.toneLabel(h) : DG.PERSONA[h.persona].label) + '</b>（' + esc((HK.toneInfo && HK.toneInfo(HK.toneOf(h)) || DG.PERSONA[h.persona]).desc) + '）</div>' +
      '<div class="sub">最初の方針：' + esc(h.action) + (h.autoAction ? '（気質から）' : '') + '　目標：' + esc(h.goal) + (h.autoGoal ? '（気質から）' : '') + '</div>' +
      '<div class="uses">' + stats + chip('感度 ×' + h.sens.toFixed(2)) + (res.noGear ? '' : chip('装備 ' + DG.CLOTH[Math.max(0, Math.min(4, h.cloth))])) + '</div>' +
      (res.noGear ? '' : '<div class="sub">刻まれた呪い</div><div class="uses">' + curses + '</div>' +
      '<div class="sub">残った道具</div><div class="uses">' + items + '</div>') +
      (res.party ? '<div class="sub">開発度' + (h.hardTop ? '（攻めなので伸びない）' : '') + '</div>' + devBars(h) : '') + '</div>';
  }

  function endingBlock(res) {
    var E = res.ending, h = res.hero, c = res.cnt, HS = res.heroes || [h];
    var stats = res.estats ? res.estats : res.party ? [
      ['到達', '地下' + Math.min(res.reached, res.floors) + '階／' + res.floors],
      ['帰還', HS.filter(function (x) { return x.fate !== '陥落'; }).length + '／' + HS.length + '人'],
      ['絶頂（合計）', HS.reduce(function (a, x) { return a + x.climax; }, 0) + '回'],
      ['助けに入った', (c.saved || 0) + '回'],
      ['仲間に襲われた', (c.assault || 0) + '回'],
    ] : [
      ['到達', '地下' + res.reached + '階／' + res.floors],
      ['絶頂', h.climax + '回'],
      ['堕ち度', h.corrupt],
      ['理性', h.reason],
      ['発動した罠', c.traps + '回'],
      ['避けた', c.avoided + '回'],
      ['撃退', c.won + '／' + c.fights],
      ['番人撃破', c.mids + '／' + res.mids.length]
    ];
    if (!res.estats && c.edge) stats.push(['寸止め', c.edge + '回']);
    if (!res.estats && c.seek) stats.push(['自分から', c.seek + '回']);
    return '<section class="ending dgend ' + E.kind + '" aria-label="結末"><div class="eyebrow">' + (E.kind === 'over' ? 'GAME OVER' : '結末') + '</div><p class="ehead">' + esc(E.title) + '</p>' +
      '<dl class="estats">' + stats.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(String(s[1])) + '</dd></div>'; }).join('') + '</dl>' +
      '<ul class="elines">' + E.lines.map(function (l) { return '<li>' + paint(l, res) + '</li>'; }).join('') + '</ul></section>';
  }

  function turns(res) {
    if (!res.turns.length) return '';
    return '<h2 class="sec">転機</h2><ol class="keys dgturns">' + res.turns.map(function (t) {
      var e = res.log[t.n];
      return '<li><span class="st">' + esc(t.why) + '</span>' + paint(e.text, res) + '</li>';
    }).join('') + '</ol>';
  }

  /* 記録のアイコン：本文に名前の出る挑戦者（出てくる順に3人まで）。一人で挑む箱庭は、名前がなくてもその人 */
  function avsOf(res, e) {
    if (!HK.Icons) return '';
    var hs = (res.heroes || [res.hero]).filter(Boolean), t = e.text || '';
    var who = hs.filter(function (h) { return h.name && t.indexOf(h.name) >= 0; }).sort(function (a, b) { return t.indexOf(a.name) - t.indexOf(b.name); });
    if (!who.length && hs.length === 1) who = hs;
    return who.length ? '<span class="avs">' + who.slice(0, 3).map(function (h) { return HK.Icons.html(h.name, h.i || 0, 26); }).join('') + '</span>' : '';
  }
  function timeline(res) {
    var out = [], cur = null;
    res.log.forEach(function (e) {
      if (e.kind === 'step') { cur = { label: e.text, items: [] }; out.push(cur); return; }
      if (!cur) { cur = { label: '入口', items: [] }; out.push(cur); }
      if (keyOnly && !e.key && e.kind !== 'climax') return;
      if (lewdOnly && !(e.kind === 'climax' || HK.lewdEvent(e))) return;
      cur.items.push(e);
    });
    return out.filter(function (b) { return b.items.length; }).map(function (b) {
      return '<div class="stepblk"><div class="when">' + esc(b.label.replace(/^地下(\d+)階・/, 'B$1 ')) + '</div><ol>' + b.items.map(function (e) {
        var cls = 'ev' + (e.kind === 'climax' ? ' climax' : '') + (e.key ? ' key' : '') + (e.tag === '陥落' ? ' death' : '');
        var avs = avsOf(res, e);
        return '<li class="' + cls + (avs ? ' hasav' : '') + '">' + avs + '<div class="evb">' + (res.noGear ? '' : '<span class="rn">' + (e.room + 1) + '</span>') + '<span class="c">' + esc(e.tag || '') + '</span>' + paint(e.text, res) +
          ((e.why || e.key || e.kind === 'climax') ? '<span class="why">' + (e.why ? esc(e.why) : '') + (e.key || e.kind === 'climax' ? '<span class="nums">　理性' + e.v.r + '・堕ち' + e.v.c + '</span>' : '') + '</span>' : '') + '</div></li>';
      }).join('') + '</ol></div>';
    }).join('');
  }

  DV.render = function (host, res, opts, histHtml) {
    /* 新しい結果では「エロシーンだけ」を外す（前の結果の絞り込みを持ち越さない） */
    if (res !== lastRes) lewdOnly = false;
    lastHost = host; lastRes = res;
    var S = HK.SCENARIOS[res.scenId] || HK.SCENARIOS.dungeon;
    var envChips = (S.env || []).map(function (e) {
      var v = (res.env || {})[e.id];
      var shown = e.type === 'select' ? ((e.options || []).filter(function (o) { return o.v === v; })[0] || {}).label : v + (e.unit || '');
      /* その設定ができる前にセーブした結果（値が無い・今は無い選択肢）は、その欄を出さない */
      if (v == null || shown == null) return '';
      return chip(e.label + '：' + shown);
    }).join('');
    host.innerHTML =
      '<div class="resulthead"><div><h2>' + esc(S.name) + '</h2><div class="meta">シード <span class="num">' + res.seed + '</span>　' + (res.meta ? esc(res.meta) : esc(res.themeLabel) + '　' + res.stepCount + '部屋　主：' + esc(res.boss) + (res.mids.length ? '　番人：' + esc(res.mids.join('・')) : '')) + '</div></div><span class="spacer"></span>' +
      '<div class="row"><button class="btn primary" data-act="reroll">別の運命で挑む</button><button class="btn" data-act="copytext">結果をテキストでコピー</button><button class="btn" data-act="gobox">条件を変える</button></div></div>' +
      endingBlock(res) +
      '<div class="uses" style="margin-top:12px">' + envChips + '</div>' +
      '<h2 class="sec">理性と堕ちの推移</h2>' + gauge(res) +
      (res.party ? '<div class="cards" style="margin-top:12px">' + res.heroes.map(function (h) { return heroCard(res, h); }).join('') + '</div>' :
      '<div class="cards" style="margin-top:12px">' + heroCard(res, res.hero) +
      '<div class="ccard"><div class="hd"><span class="nm" style="font-size:16px">開発度</span><span class="nums">' + (res.hero.hardTop ? '攻めの挑戦者は罠や魔物に責められないので、開発度は伸びない' : '罠や魔物に責められた部位ほど伸び、次から感じやすくなる') + '</span></div>' + devBars(res.hero) + '</div></div>') +
      '<h2 class="sec">足りなかったもの・効いたもの</h2><ul class="dgadvice">' + res.advice.map(function (a) { return '<li>' + paint(a, res) + '</li>'; }).join('') + '</ul>' +
      '<h2 class="sec" id="tlhead">探索の記録</h2><div class="tlbar"><button class="chip" data-act="dgkey" aria-pressed="' + keyOnly + '">転機と絶頂だけ</button>' + (HK.lewdFilterOn && HK.lewdFilterOn(res.log) ? '<button class="chip" data-act="dglewd" aria-pressed="' + lewdOnly + '">エロシーンだけ</button>' : '') + '</div><div class="tl" id="dgtl">' + timeline(res) + '</div>' +
      (histHtml || '');
  };
  DV.toggleKey = function () {
    keyOnly = !keyOnly;
    if (!lastHost || !lastRes) return;
    var t = lastHost.querySelector('#dgtl'), b = lastHost.querySelector('[data-act="dgkey"]');
    if (t) t.innerHTML = timeline(lastRes);
    if (b) b.setAttribute('aria-pressed', String(keyOnly));
  };
  /* エロシーンだけ（core.js の HK.lewdEvent。絶頂の出来事も含める） */
  DV.toggleLewd = function () {
    lewdOnly = !lewdOnly;
    if (!lastHost || !lastRes) return;
    var t = lastHost.querySelector('#dgtl'), b = lastHost.querySelector('[data-act="dglewd"]');
    if (t) t.innerHTML = timeline(lastRes);
    if (b) b.setAttribute('aria-pressed', String(lewdOnly));
  };

  DV.toText = function (res) {
    var h = res.hero, E = res.ending, L = [];
    var SC = HK.SCENARIOS[res.scenId] || HK.SCENARIOS.dungeon;
    L.push('【箱庭シミュレーター】' + SC.name + '（' + (res.meta || res.themeLabel) + '・シード ' + res.seed + '）');
    (res.heroes || [h]).forEach(function (x) { var rl = x.action === '（施術者）' ? '施術者' : ''; L.push((rl || '挑戦者') + '：' + x.name + '（' + HK.toCode(x.eg) + '・' + (HK.toneLabel ? HK.toneLabel(x) : DG.PERSONA[x.persona].label) + '）' + (rl ? '' : '　方針：' + x.action + '　目標：' + x.goal) + (res.party ? '　→ ' + x.fate + (x.fallTitle ? '（' + x.fallTitle + '）' : '') : '')); });
    L.push('');
    L.push('■ 結末');
    L.push(E.title);
    if (res.estats) L.push(res.estats.map(function (x) { return x[0] + ' ' + x[1]; }).join('　'));
    else L.push('到達 地下' + res.reached + '階／' + res.floors + '　絶頂 ' + h.climax + '回　堕ち度 ' + h.corrupt + '　理性 ' + h.reason + '　発動した罠 ' + res.cnt.traps + '　避けた ' + res.cnt.avoided);
    E.lines.forEach(function (l) { L.push('・' + l); });
    if (h.curses.length) L.push('呪い：' + h.curses.map(function (c) { return DG.CURSES[c].label; }).join('・'));
    L.push('開発度：' + DG.PART_ORDER.map(function (k) { return DG.PARTS[k] + (Math.round((h.dev[k] || 0) * 10) / 10); }).join(' '));
    L.push('');
    L.push('■ 足りなかったもの・効いたもの');
    res.advice.forEach(function (a) { L.push('・' + a); });
    L.push('');
    L.push('■ 探索の記録');
    res.log.forEach(function (e) {
      if (e.kind === 'step') L.push('― ' + e.text);
      else L.push('　' + (e.room + 1) + '［' + (e.tag || '') + '］' + (HK.fmtLong ? HK.fmtLong(e.text, (res.heroes || [res.hero]).map(function (h) { return h && h.name; })) : e.text));
    });
    return L.join('\n');
  };
})();
