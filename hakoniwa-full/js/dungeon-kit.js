/* 箱庭診断: エロトラップダンジョンの部品（中核 core。R18版のみ）
   部位・装備の段階・呪い・道具・迷宮のテーマの表（DG.PARTS・PART_ORDER・STAGES・CLOTH・CURSES・ITEMS・THEMES・THEME_KEYS）と、
   出来事の記述形式（DG.D・DG.add・DG.parseOpts・DG.pool）。マッサージ・穴（solo-kit.js）・表示（dungeon-view.js）・全年齢モード（safe.js）も使うので中核に置く。
   進行計算と箱庭の登録は dungeon.js（箱庭のかたまり scen-dungeon）。分割読み込みの第3段で dungeon.js から分けた（中身は元のまま） */
(function () {
  'use strict';
  var HK = window.HK;
  var DG = HK.DG = HK.DG || {};
  DG.pool = DG.pool || [];

  /* ---------- 定義 ---------- */
  DG.PARTS = { mouth: '唇', ear: '耳', neck: '首筋', chest: '胸', back: '背中', side: '脇腹', belly: '下腹', hips: '腰', thigh: '内腿', feet: '足裏', all: '全身' };
  DG.PART_ORDER = ['mouth', 'ear', 'neck', 'chest', 'back', 'side', 'belly', 'hips', 'thigh', 'feet'];
  DG.STAGES = ['抵抗', '動揺', '揺らぎ', '受容', '陥落寸前'];
  DG.CLOTH = ['ほぼ裸', '半裸', '破れ', 'ほつれ', '無傷'];
  DG.CURSES = {
    mark: { label: '淫紋', desc: '下腹に刻まれた紋。感度が上がり、達するたびに深くなる', sens: 0.25 },
    heat: { label: '発情の呪い', desc: '部屋を移るたびに体の奥が火照る' },
    edge: { label: '寸止めの呪い', desc: 'どれだけ昂っても達せず、理性だけが削れる' },
    dbl: { label: '感度倍加', desc: '全身の感覚が鋭くなる', sens: 0.45 },
    voice: { label: '嬌声の呪い', desc: '声を抑えられなくなり、羞恥で理性が削れる' },
    melt: { label: '衣溶けの呪い', desc: '身につけたものが少しずつ溶けていく' },
    obey: { label: '服従の刻印', desc: '命令する声に逆らえなくなる' },
    dream: { label: '淫夢の呪い', desc: '休むたびに淫らな夢にうなされる' }
  };
  DG.ITEMS = {
    herb: { label: '鎮静の薬草', desc: '昂りを鎮め、理性を取り戻す' },
    holy: { label: '聖水', desc: '呪いを一つ解く' },
    charm: { label: '守りの護符', desc: '罠を一度だけ無効にする' },
    map: { label: '階層の地図', desc: 'その階の罠を見抜きやすくなる' },
    cloak: { label: '予備の外套', desc: '傷んだ装備を一段階戻す' },
    scroll: { label: '脱出の巻物', desc: '罠や魔物の手から抜け出し、その階の階段の前まで飛ぶ（迷宮の外には出られない）' }
  };
  DG.THEMES = {
    imp: { label: '淫魔の城', floors: ['城門の回廊', '甘い香の広間', '鏡張りの舞踏室', '紅い寝所の階', '淫魔の玉座'], boss: '城主の大淫魔', bossK: 'imp' },
    slime: { label: '粘液の洞窟', floors: ['湿った入り口', '滴る鍾乳洞', '温かい地底湖', '脈打つ粘膜の通路', '母なる粘液溜まり'], boss: '女王スライム', bossK: 'slime' },
    tent: { label: '触手の森', floors: ['蔓の絡む小径', '甘い花の群生地', '霧の沼地', '脈打つ大樹の根', '森の心臓'], boss: '千本触手の古木', bossK: 'tent' },
    tower: { label: '魔術師の塔', floors: ['実験室の階', '呪具の保管庫', '拘束具の工房', '観察室', '塔の頂の書斎'], boss: '好色な大魔術師', bossK: 'tower' },
    ruin: { label: '古代の神殿', floors: ['崩れた参道', '祈りの回廊', '供物の間', '儀式の地下聖堂', '豊穣神の祭壇'], boss: '目覚めた豊穣神の像', bossK: 'ruin' }
  };
  DG.THEME_KEYS = ['imp', 'slime', 'tent', 'tower', 'ruin'];

  /* ---------- 記述形式 ----------
     D(id, 名前, 種類, テーマ, 部位, 強さ, オプション, 本文)
     種類: trap 罠 / mon 魔物 / chest 宝箱・怪しい物 / spring 泉 / odd 心を揺さぶる出来事 / captive 囚われ人 / cap 捕縛中
     テーマ: '*' か 'imp slime' のように空白区切り
     オプション: 'sens.1;cloth1;curse=mark;hold2;hp8;lure=fc;mind;dev2;f2;good.4;shame;item=herb;heal20'
     本文: '|' 区切り。{a}=挑戦者 {t}=罠・魔物の名前 {p}=狙われた部位 */
  function parseOpts(s) {
    var o = {};
    String(s || '').split(';').forEach(function (tok) {
      tok = tok.trim();
      if (!tok) return;
      var m = tok.match(/^([a-z]+)(?:=([a-z]+))?(-?[\d.]*)$/);
      if (!m) return;
      if (m[2]) o[m[1]] = m[2];
      else o[m[1]] = m[3] === '' ? true : parseFloat(m[3]);
    });
    return o;
  }
  DG.D = function (id, name, kind, themes, part, power, opts, texts) {
    return { id: id, name: name, kind: kind, themes: themes === '*' ? null : themes.split(/\s+/), part: part, power: power, o: parseOpts(opts), texts: texts.split('|') };
  };
  DG.add = function (list) { DG.pool = DG.pool.concat(list); };
  DG.parseOpts = parseOpts;
})();
