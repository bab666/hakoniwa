/* 箱庭シミュレーター: 箱庭ごとの「対応機能」のタグ（箱庭の選択カードの説明の下に出す。全年齢版・R18版共通）
   どの設定がその箱庭に効くか・何が起きうるかを短い札で示し、「設定したのに出ない」「途中で人がいなくなった」を不具合と思われないようにする。
   タグを押すと説明が出る（ui.js の data-act="ftag"）。R18版だけの説明は r18 の印の中で差し替える。
   HK.ScenTags.of(id) → [{ k, label, desc }]。表は HK.ScenTags.TABLE（箱庭 id → タグの id の並び）。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var TG = HK.ScenTags = {};
  /* タグの定義（label は短く。desc は押したときの説明） */
  var DEF = {
    race: { label: '種族・体格', desc: '住人の「体と設定」の種族（獣人・吸血鬼・天使など）と体格が、二人の穏やかな場面に一文で出ます。決めていない人には何も付きません。' },
    night: { label: '夜の顔', desc: '住人の「体と設定」の夜の性格（サド・マゾ・意地悪・甘々・恥じらい）が、夜の場面の文と抱き方に出ます。理由書きに「夜の性格：〇〇」と出ます。決めていない人には何も付きません。' },
    raceNight: { label: '種族・体格（夜）', desc: '一人用の箱庭では、種族・体格の一文は夜の場面にだけ出ます。' },
    relCore: { label: '関係が中心', desc: '設定した関係が出来事の中心になります。恋愛・嫉妬・仲良しの場面が多く出て、関係図も大きく動きます。' },
    relSome: { label: '関係は一部', desc: '物語の進行が主で、設定した関係は初期値・呼び方と、ところどころの場面に効きます。関係の出来事が少なめなのは仕様です。' },
    relLow: { label: '関係はほぼ出ない', desc: '本筋が決まっている箱庭なので、設定した関係は呼び方や台詞に少し効く程度です。関係の出来事を見たいときは「関係が中心」の箱庭を選んでください。' },
    job: { label: '職業', desc: '住人ごとに職業を選べます（おまかせは気質から決めます）。職業で出来事・台詞・結末が変わります。' },
    undead: { label: '不死・吸血鬼', desc: '特殊役職「不死」と、種族「吸血鬼」が効きます。死んでも次の区切りに蘇り、吸血鬼は三日に一度、人の血を吸います。' },
    death: { label: '死・退場あり', desc: '途中で死んだ人・連れ去られた人・いなくなった人は、その後の出来事に出ません（不具合ではありません）。「展開の重さ」を穏やかにすると起こりにくくなります。' },
    exit: { label: '途中退場あり', desc: '脱出した人は、その後の出来事に出ません（不具合ではありません）。' },
    food: { label: '好物', desc: '「体と設定」の好きな食べ物・嫌いな食べ物が、食事・差し入れ・デートの場面に出ます。' },
    drink: { label: 'お酒', desc: '住人の「お酒の強さ」が、酒の席の出来事に効きます。' },
    birthday: { label: '誕生月', desc: 'プロフィールの誕生月に合わせて、誕生日の出来事が起きます。' },
    daily: { label: '日常の場面', desc: '朝の起こし合い・ごはん・買い出し・雨の日・お見舞いなどの日常の場面が混ざります。' },
    will: { label: '心の強さ', desc: '「体と設定」の心の強さが、かかりやすさ・流されやすさに効きます。' },
    mob: { label: 'モブ登場', desc: '住人でない人物（モブ）が出ます。住人の設定とは別に、箱庭の環境値で人数や出方が変わります。' },
    romance: { label: '恋愛の起こりやすさ', desc: '環境値「恋愛の起こりやすさ」で、恋愛の出来事の量を変えられます（0にすると恋愛の場面が起きません）。' }
  };
  /* r18:begin */
  if (!HK.SAFE_ON) {
    DEF.race.desc = '住人の「体と設定」の種族（獣人・吸血鬼・天使など）と体格が、二人の穏やかな場面と夜の場面に一文で出ます。決めていない人には何も付きません。';
    DEF.mob.desc = '住人でない人物（モブ）が出ます。住人との体の関係は「相手ごとの設定」の「モブには」と、「R18に参加しない」「性行為の相手の固定」で決まります。';
    DEF.will.desc = '「体と設定」の心の強さが、催眠のかかりやすさ・堕ちやすさに効きます（体が流されても心は折れない書き方になります）。';
  }
  /* r18:end */
  TG.DEF = DEF;
  /* 箱庭ごとの並び（上に出すものから） */
  TG.TABLE = {
    goukon: ['relCore', 'night', 'race', 'food', 'drink', 'mob', 'romance'],
    whiteroom: ['relCore', 'night', 'race', 'daily', 'drink', 'exit', 'romance'],
    classroom: ['relCore', 'race', 'daily', 'birthday', 'food', 'romance'],
    island: ['relCore', 'night', 'race', 'daily', 'food', 'death', 'romance'],
    futari: ['relCore', 'night', 'race', 'daily', 'food', 'romance'],
    br: ['relCore', 'race', 'death', 'romance'],
    trial: ['relCore', 'race', 'death', 'romance'],
    zombie: ['relCore', 'night', 'race', 'undead', 'death', 'mob', 'romance'],
    omega: ['relCore', 'night', 'race', 'job', 'daily', 'food', 'drink', 'mob', 'romance'],
    ship: ['relSome', 'night', 'race', 'undead', 'death', 'food', 'romance'],
    jashin: ['relSome', 'night', 'race', 'job', 'undead', 'death', 'food', 'drink', 'mob', 'romance'],
    yakata: ['relSome', 'night', 'race', 'undead', 'death'],
    rpg: ['relSome', 'race', 'job', 'undead', 'death'],
    jinro: ['relSome', 'night', 'race', 'death'],
    locker: ['relSome', 'night', 'raceNight', 'mob'],
    saimin: ['relSome', 'raceNight', 'will'],
    massage: ['relSome', 'raceNight', 'mob'],
    dungeon: ['relSome', 'raceNight', 'will', 'mob'],
    hole: ['relLow', 'raceNight', 'will', 'mob'],
    kaihen: ['relLow', 'raceNight', 'will', 'mob'],
    succubus: ['relLow', 'raceNight', 'mob'],
    variety: ['relLow', 'raceNight']
  };
  /* r18:begin */
  /* 三人の場面（3P）が起きる箱庭（R18版だけ。全年齢版の目録には出さない。2026-10-28 担当JB）。
     HK.Pos.trioPlan を使う箱庭：出られない部屋（room-trio.js・最後の三人）・媚薬ロッカー（locker-trio-bed.js・同一人物の三人）・吹雪の館（輪の夜）・エロトラップダンジョン（三人目が加わる） */
  DEF.trio = { label: '3P 可', desc: '三人の場面（3P）が起きる箱庭。住人の「三人の場面（3P）：する／しない」と固定した相手で変わります' };
  ['whiteroom', 'locker', 'yakata', 'dungeon'].forEach(function (id) {
    var t = TG.TABLE[id];
    if (!t || t.indexOf('trio') >= 0) return;
    var at = t.indexOf('night') >= 0 ? t.indexOf('night') + 1 : t.indexOf('raceNight') >= 0 ? t.indexOf('raceNight') + 1 : 1;
    t.splice(at, 0, 'trio');
  });
  /* r18:end */
  /* 全年齢版・全年齢モードでは、一人用の箱庭の夜の一文と夜の性格は無い（種族（夜）・夜の顔・3P 可の札を出さない） */
  TG.of = function (id) {
    var ks = TG.TABLE[id] || [];
    return ks.filter(function (k) { return DEF[k] && !(HK.SAFE_ON && (k === 'raceNight' || k === 'night' || k === 'trio')); }).map(function (k) { return { k: k, label: DEF[k].label, desc: DEF[k].desc }; });
  };
  /* カードの中身（ui.js から）。pre は先頭に足す札 [{ html（中身の HTML）, title, warn }]（R18 の描写の注記・箱庭の注意書きの短い札）。
     選んでいないカード（PC）はタグを1行だけ見せる：いちばん狭いカード（190px）の1行に入る数を字数から見積もり、残りは「+n」の札にまとめる（.tx は選んだカードでだけ見える。
     レイアウトを読まずに決めるので、カードの HTML は箱庭ごとに1回作れば足りる。見積もりがはみ出しても札は省略記号で縮む）。スマホ幅は選んだカードだけにタグを出す（index.html の CSS） */
  var FIT = 158;   /* カードの中身の幅（190px − 左右の余白 16px×2） */
  function est(text) { var w = 16; for (var i = 0; i < text.length; i++) w += text.charCodeAt(i) < 0x7f ? 6.3 : 10.5; return w; }
  TG.html = function (id, esc, pre) {
    var items = (pre || []).map(function (p) { return { html: p.html, title: p.title, warn: p.warn, k: 'note', w: est(p.text || '') + (p.extra || 0) }; })
      .concat(TG.of(id).map(function (t) { return { html: esc(t.label), title: t.desc, warn: t.k === 'death' || t.k === 'exit', k: t.k, w: est(t.label) }; }));
    if (!items.length) return '';
    var n = items.length, used = 0, fit = 0;
    for (var i = 0; i < n; i++) {
      var w = items[i].w + (i ? 4 : 0), more = i < n - 1 ? 4 + est('+' + (n - i - 1)) : 0;
      if (i && used + w + more > FIT) break;
      used += w; fit = i + 1;
    }
    return '<div class="tags">' + items.map(function (t, j) {
      return '<span class="ftag' + (t.warn ? ' warn' : '') + (j >= fit ? ' tx' : '') + '" data-act="ftag" data-k="' + t.k + '" title="' + esc(t.title || '') + '" role="button" tabindex="0">' + t.html + '</span>';
    }).join('') + (fit < n ? '<span class="ftag ftmore" aria-hidden="true">+' + (n - fit) + '</span>' : '') + '</div>';
  };
})();
