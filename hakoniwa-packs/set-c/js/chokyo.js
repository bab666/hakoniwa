/* 調教の地下室（追加パック set-c の部屋。日常型（エンジン型）。R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/chokyo-design.md）
   契約で地下室に来た「奴隷」と、契約を受けた「調教師」の数日を、朝・日中・夜の3区切りで眺める。
   ・土台は合意（set-c-design.md 0-2）：奴隷の側は契約（借金・興味・相手への想い・自分で望んだ調教）で来た人。本音の計器 want（上がるだけ）が線（50）を越えた二人にだけ夜の場面が起き、
     越えていなければ心理劇の段（言葉・姿勢・待て）で止まる。きっかけの段には「止められたのに止めなかった一文」を入れる（chokyo-r18.js）。
   ・計器（巻き戻らない。HK.DarkKit.gauge）：部位ごとの感度 sens_<部位>（0 くすぐったい → 1 触れるだけで声 → 2 そこだけで達する）、従順 obey・依存 dep・心の壊れ crack・本音 want、
     調教師の情 jo（独占したくなる気持ち）。
   ・調教師の型（住人ごとの欄。おまかせは態度9種）：お預け oazuke／痛み pain／媚薬 drug／甘く sweet／催眠 hypno。奴隷の受け止め方：従う obey／媚びる flatter／反抗する defy／黙って耐える endure。
   ・山場：お披露目会（最後の前の夜。もてなす／見せつけ／奴隷どうし）→ 競り（最後の夜）→ 結末 5：競りで送り出される sold／調教師が引き取る own／心は折れず解放 free／立場の逆転 reverse／愛情に変わる love
   ・導入「捕まえられてきた」（環境ダイヤル「地下室に来たわけ」。2026-11-07 利用者の追加の指示）：邪神村（jashin.js）と同じく、日ごとに脱出の手がかり（鍵の在りか・見張りの隙・道具・調教師の油断・ほかの奴隷の協力）を拾い、
     脱出の値 esc（計器。上がるだけ）が線を越えた夜に逃げる。成功＝結末「心は折れず解放」、失敗＝連れ戻されて手がかりを失い、次の線が上がる。諦めて従順になる・調教師の情が移って鍵を開けたままにする、の分かれ方も出る。
     捕まえられてきた回は合意の土台が無いので、体には触れない（心の躾けと脱出劇だけ。夜の場面・体の調教・お披露目会・競りは無い。結末は 解放／引き取られる（諦め）／立場の逆転）。
   ・体の組（攻めを選んだ人を受けにしない・恋愛対象・R18 にしない相手・性器なし・身内）で体の場面が出せない二人は、調教も「心の躾け」だけになる（S.noBody）。
   文は chokyo-text-*.js（HK.ChokyoText）。{a}＝調教師、{b}＝奴隷、{g}＝三人目（会員・二人目の奴隷・外の知り合い）。登場人物はすべて成人として扱う */
/* @event scen=set-c-chokyo id=ck_intro cat=bond tie=- label=契約を交わして地下室の日々が始まる */
/* @event scen=set-c-chokyo id=ck_morn cat=bond tie=- label=地下室で迎える朝の決まりごと */
/* @event scen=set-c-chokyo id=ck_set_strict cat=bond tie=- label=厳しさの決まりが朝から効いてくる */
/* @event scen=set-c-chokyo id=ck_set_tools cat=bond tie=- label=道具棚の中身が一日の色を決める */
/* @event scen=set-c-chokyo id=ck_set_ratio cat=bond tie=- label=褒美と罰の帳面をつけ直す */
/* @event scen=set-c-chokyo id=ck_set_menu cat=bond tie=- label=今日の調教の献立が告げられる */
/* @event scen=set-c-chokyo id=ck_train cat=bond tie=- tags=night label=日中の調教で体を躾けられる */
/* @event scen=set-c-chokyo id=ck_train_mind cat=bond tie=- label=言葉と姿勢だけで心を躾けられる */
/* @event scen=set-c-chokyo id=ck_reward cat=bond tie=- label=言いつけを守って褒美をもらう */
/* @event scen=set-c-chokyo id=ck_punish cat=bond tie=- label=言いつけを破って罰を受ける */
/* @event scen=set-c-chokyo id=ck_care cat=bond tie=- label=調教のあとの手当てと労い */
/* @event scen=set-c-chokyo id=ck_cold cat=bond tie=- label=手当てもなく独房の夜に置かれる */
/* @event scen=set-c-chokyo id=ck_talk cat=bond tie=- label=寝る前に二人で短い言葉を交わす */
/* @event scen=set-c-chokyo id=ck_alone_b cat=solo tie=- label=独りの夜に奴隷が契約の意味を考える */
/* @event scen=set-c-chokyo id=ck_alone_a cat=solo tie=- label=調教師が独りで帳面に向かう夜 */
/* @event scen=set-c-chokyo id=ck_want cat=bond tie=- label=嫌だと言えなくなった自分に気づく */
/* @event scen=set-c-chokyo id=ck_obey_up cat=bond tie=- label=従うことが体に馴染んでいく */
/* @event scen=set-c-chokyo id=ck_dep_up cat=bond tie=- label=調教師の姿を目で追うようになる */
/* @event scen=set-c-chokyo id=ck_crack_up cat=bond tie=- label=心のどこかにひびが入る */
/* @event scen=set-c-chokyo id=ck_sens_up cat=bond tie=- tags=night label=躾けられた部位が変わってしまう */
/* @event scen=set-c-chokyo id=ck_psy cat=bond tie=- label=触れずに言葉と鎖だけで過ごす夜 */
/* @event scen=set-c-chokyo id=ck_jo cat=bond tie=- label=調教師が手放したくないと思い始める */
/* @event scen=set-c-chokyo id=ck_slip cat=bond tie=- label=調教師の素顔がふとこぼれる */
/* @event scen=set-c-chokyo id=ck_guest cat=bond tie=- label=会員が地下室の様子を見に来る */
/* @event scen=set-c-chokyo id=ck_s2 cat=bond tie=- label=もう一人の奴隷と並んで躾けられる */
/* @event scen=set-c-chokyo id=ck_s2_talk cat=bond tie=- label=奴隷どうしで声を潜めて話す */
/* @event scen=set-c-chokyo id=ck_contact cat=bond tie=- label=外の知り合いから短い便りが届く */
/* @event scen=set-c-chokyo id=ck_debut_prep cat=bond tie=- label=お披露目会の衣装と作法を仕込まれる */
/* @event scen=set-c-chokyo id=ck_debut cat=bond tie=- tags=night,mob label=お披露目会で教えられたことを見せる */
/* @event scen=set-c-chokyo id=ck_auction cat=bond tie=- label=契約の行き先を決める競りが開かれる */
/* @event scen=set-c-chokyo id=ck_end cat=bond tie=- label=地下室の契約が終わる最後の夜 */
/* @event scen=set-c-chokyo id=ck_clue cat=bond tie=- label=捕まえられた奴隷が脱出の手がかりを拾う */
/* @event scen=set-c-chokyo id=ck_escape cat=bond tie=- label=手がかりを頼りに地下室から逃げ出す */
/* @event scen=set-c-chokyo id=ck_escape_fail cat=bond tie=- label=脱出に失敗して連れ戻される */
/* @event scen=set-c-chokyo id=ck_giveup cat=bond tie=- label=逃げることを諦めて首輪を受け入れる */
/* @event scen=set-c-chokyo id=ck_letgo cat=bond tie=- label=情の移った調教師が鍵を開けたままにする */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.DarkKit.gauge || !HK.DarkKit.cast) return;
  var DK = HK.DarkKit, ID = 'set-c-chokyo';
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.ChokyoText || {}; }
  function R18() { return HK.ChokyoR18 || null; }
  function f(ctx) { return ctx.ck; }
  var P = function () { return HK.Pos || null; };

  /* ---------- 部位（調教の内容） ----------
     body：その部位を使える体（'all'／'m'＝受けに男性器／'f'＝受けに女性器）。deep：奥の調教（本音が線を越えてから）。mind：体に触れない（心の躾け） */
  var PARTS = {
    nip: { label: '乳首', body: 'all' }, ear: { label: '耳', body: 'all' }, mouth: { label: '口と喉', body: 'all' },
    pro: { label: '前立腺', body: 'm', deep: 1 }, colon: { label: '結腸', body: 'm', deep: 1 }, vag: { label: '女性器', body: 'f', deep: 1 }, cock: { label: '男性器', body: 'm', deep: 1 },
    oazuke: { label: 'お預け', body: 'all' }, mind: { label: '心', body: 'all', mind: 1 }
  };
  var BODY_PARTS = ['nip', 'ear', 'mouth', 'pro', 'colon', 'vag', 'cock'];
  /* 調教の献立（環境）：all 全部／upper 胸・耳・口と心／lower 奥（性器・前立腺・結腸）と心／mind 心が中心（お預け・心と、胸・耳を軽く） */
  var MENU = {
    all: ['nip', 'ear', 'mouth', 'pro', 'colon', 'vag', 'cock', 'oazuke', 'mind'],
    upper: ['nip', 'ear', 'mouth', 'oazuke', 'mind'],
    lower: ['pro', 'colon', 'vag', 'cock', 'oazuke', 'mind'],
    mind: ['nip', 'ear', 'oazuke', 'mind']
  };
  var METHOD_NAME = { oazuke: 'お預けで焦らす', pain: '痛みで躾ける', drug: '媚薬で手早く懐柔する', sweet: '優しく甘く仕込む', hypno: '怪しい薬の催眠で遊ぶ' };
  var BR_NAME = { obey: '素直に従う', flatter: '媚びて取り入る', defy: '反抗して試す', endure: '黙って耐える' };
  var END_NAME = { sold: '競りで送り出された', own: '調教師が引き取った', free: '心は折れず解放された', reverse: '立場が逆転した', love: '愛情に変わった' };

  /* ---------- 二人の関係（名簿の関係のまま） ---------- */
  var RK_OF = { spouse: 'love', lover: 'love', fiance: 'love', mate: 'love', fated: 'love', honmei: 'love',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'fam',
    ex: 'ex', almost: 'pine', crush: 'pine', yan: 'yan', enemy: 'bad', bad: 'bad', rival: 'bad', lovehate: 'hate', abuse: 'yan', worship: 'yan', master: 'work',
    teacher: 'work', mentor: 'work', senpai: 'work', colleague: 'work', boss: 'work', childhood: 'close', friend: 'close', best: 'close', buddy: 'close',
    benefactor: 'close', comrade: 'close', classmate: 'close', fwb: 'body', acq: 'weak' };
  var RK_ORD = ['love', 'yan', 'body', 'pine', 'hate', 'ex', 'fam', 'bad', 'close', 'work', 'weak'];
  var WANT0 = { love: 66, yan: 60, body: 62, pine: 52, hate: 54, ex: 44, close: 40, work: 32, fam: 30, bad: 28, weak: 26, none: 22 };
  function relKind(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = 'none';
    tl.forEach(function (t) {
      if (!t || t.type === 'noobs') return;
      var k = RK_OF[t.type] || 'close';
      if (best === 'none' || RK_ORD.indexOf(k) < RK_ORD.indexOf(best)) best = k;
    });
    return best;
  }
  /* 片想い：想っているのが奴隷の側か（本音が高い） */
  function pineDir(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], t = tl.filter(function (x) { return x && /^(crush|yan)$/.test(x.type); })[0];
    return t && t.a != null ? (t.a === B.i ? 'B' : t.a === A.i ? 'A' : '') : '';
  }
  function canLove2(ctx, a, b) {
    if (HK.loveOK && !HK.loveOK(a, b)) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    if (ctx.romanceOk && !ctx.romanceOk([a, b], false)) return false;
    return true;
  }

  /* ---------- 文の絞り込み（設定と食い違う文を出さない） ---------- */
  var FULL_RE = /玩具|ローター|バイブ|張り型|拘束台|媚薬|ペニバン|クリップ|小瓶|薬/, BASIC_RE = /縄|目隠し|首輪|手枷|鎖|鞭|革の|枷/, SOFT_NG = /鞭|赤く腫れ|痕が残|容赦なく/, HYPNO_RE = /催眠|暗示|振り子/;
  var B_F = /\{(?:女性器|陰核|愛液)\}/, B_M = /\{b\}の[^。、「」]{0,6}\{(?:男性器|亀頭)\}|\{(?:前立腺|結腸)\}/, A_M = /\{a\}の[^。、「」]{0,6}\{(?:男性器|亀頭)\}|自分の\{男性器\}/;
  function okText(S, x) {
    if (typeof x !== 'string' || !x) return false;
    var n = x;
    if (S.tools !== 'full' && FULL_RE.test(n)) return false;
    if (S.tools === 'hand' && BASIC_RE.test(n)) return false;
    if (S.strict === 'soft' && SOFT_NG.test(n)) return false;
    if (!(S.hypno && S.tools === 'full') && HYPNO_RE.test(n)) return false;
    var Pp = P();
    if (Pp && S.B && B_F.test(n) && !Pp.hasF(S.B)) return false;
    if (Pp && S.B && B_M.test(n) && !Pp.hasM(S.B)) return false;
    if (Pp && S.A && A_M.test(n) && !Pp.hasM(S.A)) return false;
    if (!S.B2 && /\{g2\}/.test(n)) return false;
    /* 捕まえられてきた回に契約の文を、契約の回にさらわれた文を出さない */
    if (S.captured && /契約|自分で選んで|望んで来た|署名|名前を書|催眠|暗示|合図の言葉|聞いていた|紹介状|口づけ|キス|抱き寄せ|抱きしめ|膝に乗せ|膝の上|甘え/.test(n)) return false;
    if (!S.captured && /さらわれ|捕まえられ|攫われ|連れてこられ|逃げ道|脱出/.test(n)) return false;
    /* 心の躾けだけの二人：体に触れる文・性的な語を出さない */
    if (S.noBody && /罰の痕/.test(n)) return false;
    if (S.noBody && /\{(?:男性器|女性器|胸|乳首|尻|後ろ|ナカ|精液|愛液|陰核|前立腺|結腸|股間|亀頭)\}|舐め|咥え|挿れ|脱が|裸/.test(n)) return false;
    return true;
  }
  /* 表から一つ（段の札・設定・体で絞る。同じ文は一回の遊びで二度出さない） */
  function pk(ctx, list, o) {
    var S = f(ctx); o = o || {};
    var rows = (list || []).filter(function (r) { return okText(S, typeof r === 'string' ? r : r && r.t); });
    return DK.pick(ctx, S, rows, Object.assign({ a: S.A, b: S.B }, o));
  }
  function byPer(T, c) { return T ? (T[DK.per(c)] || T.gentle || []) : []; }
  function say(ctx, id, t, o) {
    var S = f(ctx); o = o || {};
    if (!t) return null;
    var actors = o.actors || [S.A, S.B];
    var e = DK.say(ctx, { id: id, cat: o.cat || 'bond', actors: actors, t: t, a: o.a || S.A, b: o.b || S.B, ex: o.ex, S: S, face: o.face, lewd: !!o.lewd, mag: o.mag || 0, why: '調教の地下室：' + (o.why || id),
      fx: o.fx });
    if (e) S.partN = (S.partN || 0) + 1;
    return e;
  }
  function faceOf(c, k) { var o = {}; if (c && k) o[c.i] = k; return o; }
  function faces(m) { var o = {}; m.forEach(function (x) { if (x[0] && x[1]) o[x[0].i] = x[1]; }); return o; }

  /* ---------- 住人ごとの欄 ---------- */
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; var v = p && p.pick ? p.pick[k] : null; return v && v !== 'auto' ? v : null; }
  /* 調教師の型（おまかせは態度9種から。揺らぎでらしくない型に） */
  var METHOD_FIT = { proud: 'pain', stern: 'oazuke', tsun: 'oazuke', gentle: 'sweet', devoted: 'sweet', cool: 'drug', free: 'hypno', shy: 'oazuke', polite: 'hypno' };
  var METHODS = ['oazuke', 'pain', 'drug', 'sweet', 'hypno'];
  function methodOk(S, k) { if ((k === 'drug' || k === 'hypno') && S.tools !== 'full') return false; if (k === 'hypno' && !S.hypno) return false; if (k === 'pain' && S.strict === 'soft') return false; return true; }
  /* 奴隷の受け止め方 */
  var BR_FIT = { proud: 'defy', stern: 'endure', tsun: 'defy', gentle: 'obey', devoted: 'obey', cool: 'endure', free: 'flatter', shy: 'obey', polite: 'flatter' };
  var BRS = ['obey', 'flatter', 'defy', 'endure'];
  /* 精神のケア（多い＝依存・愛情寄り、少ない＝従順だが壊れやすい）。おまかせは態度 */
  var CARE_FIT = { proud: 'few', stern: 'few', tsun: 'many', gentle: 'many', devoted: 'many', cool: 'few', free: 'many', shy: 'many', polite: 'many' };
  /* どこまで躾けるか：obey 命令に従う／beg 自分から媚びる／full 完全な服従 */
  var DEPTH_FIT = { proud: 'full', stern: 'obey', tsun: 'beg', gentle: 'beg', devoted: 'beg', cool: 'full', free: 'beg', shy: 'obey', polite: 'obey' };

  /* ---------- 目標（住人ごとの欄。調教師と奴隷で選べる種が違う） ---------- */
  var GOAL_OPT = {
    s: [['t', 'shiage', '胸か耳を一つ仕上げる'], ['t', 'nedari', '自分からねだらせる'], ['t', 'kowasanai', '壊さずに育てる'], ['t', 'hirou', 'お披露目会で恥をかかせない'],
      ['s', 'taeru', '最後まで心を折らない'], ['s', 'homerare', 'たくさん褒められる'], ['s', 'oboeru', '教えを全部覚える'], ['s', 'tamesu', '調教師の本気を試す']],
    l: [['t', 'takaku', '高い値で送り出す'], ['t', 'tebanasanai', '手元に置く'], ['t', 'kaesu', '契約を全うして帰す'],
      ['s', 'jiyuu', '自由になって帰る'], ['s', 'tokubetsu', '調教師の特別になる'], ['s', 'gyakuten', 'いつか立場を入れ替える'], ['s', 'nokoru', 'ここに居続ける']]
  };
  var GOAL_GRP = { t: '調教師の目標', s: '奴隷の目標' };
  function goalOpts(kind) { return GOAL_OPT[kind].map(function (o) { return { id: o[1], label: o[2], group: GOAL_GRP[o[0]] }; }); }
  function goalLabel(kind, k) { var o = GOAL_OPT[kind].filter(function (x) { return x[1] === k; })[0]; return o ? o[2] : ''; }
  function goalSide(kind, k) { var o = GOAL_OPT[kind].filter(function (x) { return x[1] === k; })[0]; return o ? o[0] : ''; }
  var GOAL_AUTO = {
    t: { s: { proud: 'nedari', stern: 'hirou', tsun: 'shiage', gentle: 'kowasanai', devoted: 'kowasanai', cool: 'shiage', free: 'nedari', shy: 'kowasanai', polite: 'hirou' },
      l: { proud: 'tebanasanai', stern: 'kaesu', tsun: 'tebanasanai', gentle: 'kaesu', devoted: 'tebanasanai', cool: 'takaku', free: 'takaku', shy: 'kaesu', polite: 'takaku' } },
    s: { s: { proud: 'tamesu', stern: 'taeru', tsun: 'tamesu', gentle: 'homerare', devoted: 'homerare', cool: 'taeru', free: 'oboeru', shy: 'oboeru', polite: 'oboeru' },
      l: { proud: 'gyakuten', stern: 'jiyuu', tsun: 'tokubetsu', gentle: 'tokubetsu', devoted: 'nokoru', cool: 'jiyuu', free: 'jiyuu', shy: 'tokubetsu', polite: 'nokoru' } }
  };
  function goalOf(ctx, c, side, kind) {
    var v = pickOfChar(ctx, c, kind === 's' ? 'sgoal' : 'lgoal');
    if (v && goalSide(kind, v) === side) return { k: v, user: true };
    return { k: GOAL_AUTO[side][kind][DK.per(c)], user: false };
  }

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: '調教の地下室', kicker: '闇・調教',
    desc: '契約で地下室に来た奴隷と、それを受けた調教師の数日。体と心が少しずつ躾けられ、お披露目会と競りの夜に二人の行き先が決まる。',
    note: '※参加は3人まで（三人目は会員か二人目の奴隷）。R18版だけの箱庭です。登場人物はすべて成人として扱います。くわしくは「この箱庭のTIPS」に。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 3, r18only: true,
    catBias: { romance: 0.3, bond: 1.2, help: 0.4, conflict: 0.2, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 1e-9,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 5, max: 14, def: 7, lo: '5日', hi: '14日', unit: '日', desc: '地下室で過ごす日数。1日は朝・日中・夜の3区切り。最後の前の夜がお披露目会、最後の夜が競り' },
      { id: 'origin', label: '地下室に来たわけ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（二人の関係から決まる契約）' }, { v: 'debt', label: '契約：借金' }, { v: 'curious', label: '契約：興味' }, { v: 'love', label: '契約：相手への想い' }, { v: 'self', label: '契約：自分で望んだ調教' }, { v: 'captured', label: '捕まえられてきた（脱出を目指す）' }],
        desc: '契約で来た奴隷は、本音が「止めない」まで来ると夜の場面が起きる。捕まえられてきた奴隷は、手がかりを集めて脱出を目指す（体には触れない心の躾けと脱出劇だけ）' },
      { id: 'strict', label: '厳しさ', type: 'select', def: 'mid', options: [{ v: 'soft', label: 'やさしい（痛みは使わない）' }, { v: 'mid', label: 'ふつう' }, { v: 'hard', label: '厳しい（罰が重く、進みが早い）' }], desc: '厳しいほど従順と開発が早く進み、心の壊れも進みやすい' },
      { id: 'tools', label: '使える道具', type: 'select', def: 'basic', options: [{ v: 'hand', label: '手と言葉だけ' }, { v: 'basic', label: '縄・目隠し・首輪まで' }, { v: 'full', label: '玩具・拘束台・薬まで' }], desc: '媚薬と催眠の型は「薬まで」のときだけ選ばれる' },
      { id: 'ratio', label: '褒美と罰', type: 'select', def: 'even', options: [{ v: 'reward', label: '褒美が多い' }, { v: 'even', label: '半々' }, { v: 'punish', label: '罰が多い' }], desc: '褒美が多いと依存と本音が、罰が多いと従順と心の壊れが進む' },
      { id: 'menu', label: '調教の内容', type: 'select', def: 'all', options: [{ v: 'all', label: '全部（体に合うものを全部）' }, { v: 'upper', label: '胸・耳・口と心' }, { v: 'lower', label: '奥（性器・前立腺・結腸）と心' }, { v: 'mind', label: '心が中心（お預け・言葉と、胸・耳を軽く）' }],
        desc: '体に合わない調教は出ない（前立腺・結腸・男性器は男性器のある体、女性器は女性器のある体）。奥の調教は、奴隷の本音が「止めない」まで来てから' },
      { id: 'hypno', label: '恋人だと思い込ませる催眠の薬', type: 'select', def: 'on', options: [{ v: 'on', label: '使う（道具が「薬まで」のとき）' }, { v: 'off', label: '使わない' }], desc: '心の調教の一つ。奴隷は契約で前もって許していて、自分で杯を飲む' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人から便りが届く）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '名簿にいて今回は参加していない住人のうち、二人のどちらかと関係のある人（三人まで）から、地下室の外の便りが届きます。関係図には出ません' },
      { id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '少なめ（1回まで）' }, { v: 'mid', label: 'ふつう（2回まで）' }, { v: 'high', label: '多め（3回まで・一度は長い場面）' }],
        desc: '夜の場面の回数の上限。奴隷の本音が「止めない」まで来てから、体の関係にしてよい二人にだけ起きる。お披露目会の見せつけも1回に数える' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（受け攻めと性格から。上の二人が調教師と奴隷）', options: [{ id: 'trainer', label: '調教師' }, { id: 'slave', label: '奴隷（契約で来た側）' }, { id: 'slave2', label: '二人目の奴隷' }, { id: 'guest', label: '会員（見届け役）' }] },
      { id: 'ttype', label: '調教師の型', auto: 'おまかせ（性格から）', options: [{ id: 'oazuke', label: 'お預けで焦らす' }, { id: 'pain', label: 'スピード型（痛み）' }, { id: 'drug', label: '媚薬で手早く懐柔' }, { id: 'sweet', label: '優しく甘々' }, { id: 'hypno', label: '怪しい薬の催眠プレイ' }] },
      { id: 'care', label: '精神のケア', auto: 'おまかせ（性格から）', options: [{ id: 'many', label: '多い（依存・愛情寄り）' }, { id: 'few', label: '少ない（従順だが壊れやすい）' }] },
      { id: 'depth', label: 'どこまで躾けるか', auto: 'おまかせ（性格から）', options: [{ id: 'obey', label: '命令に従う' }, { id: 'beg', label: '自分から媚びる' }, { id: 'full', label: '完全な服従' }] },
      { id: 'sgoal', label: '短期目標', auto: 'おまかせ（立場と性格から）', groups: true, options: goalOpts('s') },
      { id: 'lgoal', label: '長期目標', auto: 'おまかせ（立場と性格から）', groups: true, options: goalOpts('l') }
    ],
    actions: [],
    goals: [],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(5, Math.min(14, +env.days || 7)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    othersFor: function (ctx, a) { var S = ctx.ck; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    end: function (ctx) { return !!(ctx.ck && ctx.ck.ended); },
    events: []
  };
  /* 本体の共通の出来事は混ぜない（この部屋の文だけで書く） */
  Object.defineProperty(scen, 'exclude', { get: function () { return (HK.COMMON || []).map(function (e) { return e.id; }); }, enumerable: true, configurable: true });

  /* ---------- 始まり ---------- */
  function auto(ctx, X, Y) {
    var Pp = P(), sc = function (c, o) {
      var t = c.tr || {}, v = (t.cp || 0.5) * 0.6 + (1 - (t.ac || 0.5)) * 0.3, p = DK.per(c);
      if (/^(proud|stern|cool)$/.test(p)) v += 0.3;
      if (Pp && Pp.of) { var q = Pp.of(c, o); if (q === 'top') v += 2; else if (q === 'bottom') v -= 2; }
      return v;
    };
    return sc(X, Y) + ctx.rng() * 0.2 >= sc(Y, X) + ctx.rng() * 0.2 ? [X, Y] : [Y, X];
  }
  function setup(ctx) {
    var env = ctx.env;
    DK.heavyDefault(ctx);
    var C = DK.cast(ctx, { field: 'part', top: 'trainer', bottom: 'slave', others: ['slave2', 'guest'], auto: auto });
    var A = C.A, B = C.B, Pp = P();
    var days = Math.max(5, Math.min(14, +env.days || 7));
    var rk = relKind(ctx, A, B);
    var S = ctx.ck = { A: A, B: B, days: days, rk: rk, used: {},
      strict: /^(soft|mid|hard)$/.test(env.strict) ? env.strict : 'mid', tools: /^(hand|basic|full)$/.test(env.tools) ? env.tools : 'basic',
      ratio: /^(reward|even|punish)$/.test(env.ratio) ? env.ratio : 'even', menu: MENU[env.menu] ? env.menu : 'all', hypno: env.hypno !== 'off',
      cnt: {}, sex: 0, lewdMax: 0, rewards: 0, punish: 0, trains: 0, debutDay: days - 2, why: C.why || '' };
    /* 体の場面を出せない二人（攻めを選んだ人を受けにしない・恋愛対象・R18 にしない相手・性器なし・身内・性欲なし・全年齢モード） */
    var nb = C.noBody, nbWhy = C.why || '';
    if (!nb && Pp && Pp.noGen && (Pp.noGen(A) || Pp.noGen(B))) { nb = true; nbWhy = 'nogen'; }
    if (!nb && Pp && Pp.libNone && Pp.libNone([A, B])) { nb = true; nbWhy = 'lib'; }
    if (!nb && ctx.pair && ctx.pair(A, B).kin) { nb = true; nbWhy = 'kin'; }
    if (!nb && rk === 'fam') { nb = true; nbWhy = 'kin'; }
    S.captured = env.origin === 'captured';
    if (S.captured) { nb = true; nbWhy = 'captured'; S.debutDay = -1; }
    if (HK.SAFE_ON) { nb = true; nbWhy = 'safe'; }
    S.noBody = nb; S.nbWhy = nbWhy;
    S.love = canLove2(ctx, A, B);
    /* 三人目：二人目の奴隷（欄で選んだ人）・会員（それ以外の参加者）・外の知り合い（名簿から。印 outside） */
    S.G = C.G || [];
    S.G.forEach(function (g) { g.gone = true; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    S.B2 = S.G.filter(function (g) { return !g.outside && pickOfChar(ctx, g, 'part') === 'slave2'; })[0] || null;
    S.guest = S.G.filter(function (g) { return !g.outside && g !== S.B2; })[0] || null;
    S.out = S.G.filter(function (g) { return g.outside; });
    /* 奴隷が契約した理由：love 相手への想い／self 自分で望んだ／curious 興味／debt 借金 */
    var pb = DK.per(B), pd = pineDir(ctx, A, B);
    S.motive = /^(debt|curious|love|self)$/.test(env.origin) ? env.origin : S.captured ? 'captured' : /^(love|yan|pine)$/.test(rk) && pd !== 'A' ? 'love' : rk === 'ex' ? (ctx.rng() < 0.5 ? 'love' : 'self') : rk === 'hate' || rk === 'bad' ? (pb === 'proud' || pb === 'tsun' ? 'self' : 'debt')
      : rk === 'body' ? 'curious' : rk === 'close' || rk === 'work' ? (ctx.rng() < 0.5 ? 'curious' : 'self') : rk === 'fam' ? 'self' : (ctx.rng() < 0.55 ? 'debt' : 'curious');
    var w0 = (WANT0[rk] || 22) + ({ love: 10, self: 12, curious: 6, debt: 0 }[S.motive] || 0) + (rk === 'pine' && pd === 'A' ? -10 : 0);
    S.LINE = 50;
    DK.gauge(S, 'want', { v: Math.min(w0, 80), dir: 'up', stages: [S.LINE, 75] });
    DK.gauge(S, 'obey', { v: 0, dir: 'up', stages: [30, 60, 85] });
    DK.gauge(S, 'dep', { v: rk === 'love' || rk === 'yan' ? 15 : 0, dir: 'up', stages: [30, 60, 85] });
    DK.gauge(S, 'crack', { v: 0, dir: 'up', stages: [35, 65, 90] });
    /* 脱出の値（捕まえられてきた回）：上がるだけ。線を越えた夜に逃げる。失敗すると手がかりを失い、次の線が上がる */
    DK.gauge(S, 'esc', { v: 0, dir: 'up', stages: [] });
    S.escLine = 55; S.clues = []; S.tries = 0; S.fails = 0;
    DK.gauge(S, 'jo', { v: rk === 'love' ? 30 : rk === 'yan' ? 35 : 0, dir: 'up', stages: [40, 75] });
    /* 使える部位：献立 × 体 × 心だけの二人 */
    var bM = !!(Pp && Pp.hasM && Pp.hasM(B)), bF = !!(Pp && Pp.hasF && Pp.hasF(B));
    S.parts = MENU[S.menu].filter(function (k) {
      var p = PARTS[k];
      if (S.noBody) return k === 'mind';
      if (p.body === 'm' && !bM) return false;
      if (p.body === 'f' && !bF) return false;
      return true;
    });
    if (!S.parts.length) S.parts = ['mind'];
    S.parts.forEach(function (k) { if (!PARTS[k].mind && k !== 'oazuke') DK.gauge(S, 'sens_' + k, { v: 0, dir: 'up', stages: [30, 65] }); });
    /* 調教師の型・ケア・深さ・奴隷の受け止め方 */
    var mt = pickOfChar(ctx, A, 'ttype'), mt2 = mt === 'speed' ? 'pain' : mt;
    var br = DK.branch(ctx, A, METHOD_FIT, METHODS);
    S.method = METHODS.indexOf(mt2) >= 0 ? mt2 : br.k; S.methodOdd = METHODS.indexOf(mt2) < 0 && br.odd; S.methodUser = METHODS.indexOf(mt2) >= 0;
    if (S.noBody && (S.method === 'drug' || S.method === 'hypno')) { S.method = 'oazuke'; S.methodSwap = true; }
    if (!methodOk(S, S.method)) { S.method = S.method === 'pain' ? 'oazuke' : S.method === 'hypno' && S.tools === 'full' ? 'drug' : DK.per(A) === 'gentle' || DK.per(A) === 'devoted' ? 'sweet' : 'oazuke'; S.methodSwap = true; }
    S.care = pickOfChar(ctx, A, 'care') || CARE_FIT[DK.per(A)];
    S.depth = pickOfChar(ctx, A, 'depth') || DEPTH_FIT[DK.per(A)];
    var bb = DK.branch(ctx, B, BR_FIT, BRS);
    S.br = bb.k; S.brOdd = bb.odd;
    /* 目標 */
    S.gsA = goalOf(ctx, A, 't', 's'); S.glA = goalOf(ctx, A, 't', 'l'); S.gsB = goalOf(ctx, B, 's', 's'); S.glB = goalOf(ctx, B, 's', 'l');
    if (S.gsB.k === 'tamesu' && !bb.odd && S.br !== 'defy' && ctx.rng() < 0.6) S.br = 'defy';
    if (S.gsB.k === 'homerare' && S.br === 'defy' && ctx.rng() < 0.6) S.br = 'flatter';
    /* 重点の部位（調教師が仕上げたい 2 つ）：胸か耳を一つ仕上げる目標なら、そのどちらかを先に */
    var bodyP = S.parts.filter(function (k) { return BODY_PARTS.indexOf(k) >= 0; }), shallow = bodyP.filter(function (k) { return !PARTS[k].deep; });
    var fp = [];
    if (S.gsA.k === 'shiage') { var ne = bodyP.filter(function (k) { return k === 'nip' || k === 'ear'; }); if (ne.length) fp.push(ne[Math.floor(ctx.rng() * ne.length)]); }
    var pool = shallow.filter(function (k) { return fp.indexOf(k) < 0; });
    while (fp.length < 2 && pool.length) fp.push(pool.splice(Math.floor(ctx.rng() * pool.length), 1)[0]);
    var deepP = bodyP.filter(function (k) { return PARTS[k].deep && fp.indexOf(k) < 0; });
    if (deepP.length) fp.push(deepP[Math.floor(ctx.rng() * deepP.length)]);
    S.focus = fp;
    C.G.concat([A, B]).forEach(function (c) { c.life = c.life || { job: '' }; if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'ck', label: '' }; c.autoAction = false; c.autoGoal = false; });
    A.goal = { id: 'ck', label: '短期「' + goalLabel('s', S.gsA.k) + '」' + (S.gsA.user ? '（選んだ目標）' : '') + '／長期「' + goalLabel('l', S.glA.k) + '」' + (S.glA.user ? '（選んだ目標）' : '') };
    B.goal = { id: 'ck', label: '短期「' + goalLabel('s', S.gsB.k) + '」' + (S.gsB.user ? '（選んだ目標）' : '') + '／長期「' + goalLabel('l', S.glB.k) + '」' + (S.glB.user ? '（選んだ目標）' : '') };
    if (!HK.SAFE_ON && R18() && R18().quota) { S.lewdQ = R18().quota(ctx, env.lewdN); S.lewdMax = S.noBody ? 0 : S.lewdQ; }
    ctx.place = '地下室';
    intro(ctx);
  }
  /* 導入：関係ごとの一段 ＋ 契約の理由 ＋ 調教師の態度の一段 ＋ 設定の一文 */
  function intro(ctx) {
    var S = f(ctx), A = S.A, B = S.B, T = TX();
    var rel = S.captured ? pk(ctx, (T.INTRO_CAP || {})[S.rk] || (T.INTRO_CAP || {}).none) : pk(ctx, (T.INTRO_REL || {})[S.rk] || (T.INTRO_REL || {}).none);
    var mot = pk(ctx, (T.MOTIVE || {})[S.motive]);
    var per = pk(ctx, byPer(T.INTRO_PER, A));
    var set = pk(ctx, (T.INTRO_SET || {})[S.strict]) + pk(ctx, (T.INTRO_TOOLS || {})[S.tools]);
    var nb = S.noBody && !S.captured ? pk(ctx, T.INTRO_NOBODY) : '';
    var tx = [rel, mot, per, set, nb].filter(Boolean).join('');
    if (!tx) tx = '{b}は契約書に名前を書き、地下室へ続く階段を下りた。待っていたのは{a}だった。今日から数日、ここで躾けられる。';
    say(ctx, 'ck_intro', tx, { why: '始まり（契約の理由：' + { love: '相手への想い', self: '自分で望んだ', curious: '興味', debt: '借金', captured: '捕まえられてきた' }[S.motive] + '）', face: faces([[B, S.motive === 'debt' || S.captured ? 'fear' : 'normal']]) });
  }

  /* ---------- 一日 ---------- */
  function phase(ctx, s, n) {
    var S = f(ctx); if (!S || S.ended) return;
    var d = Math.floor(s / 3), t = s % 3;
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    DK.tmpReset(S);
    S.d = d; S.t = t; S.partN = 0;
    var last = d === S.days - 1;
    if (s === 0) { var aff = S.rk === 'bad' || S.rk === 'hate' ? 2 : 6; ctx.mod2(A0(S), B0(S), { aff: aff, trust: 4 }, { aff: aff, trust: 4 }); }
    if (t === 0) morning(ctx, d);
    else if (t === 1) { if (d === S.debutDay) debutPrep(ctx); else { daytime(ctx, d); if (S.captured) clue(ctx, d); } }
    else if (S.captured) { if (!escapeNight(ctx, d, last)) { if (last) ending(ctx); else night(ctx, d); } }
    else { if (last) { if (!S.sex && S.lewdQ > 0 && R18() && R18().noneWhy) R18().noneWhy(ctx, S); auction(ctx); ending(ctx); } else if (d === S.debutDay) debut(ctx); else night(ctx, d); }
    /* 空の区切りを作らない（二人のやりとりを 1 件以上） */
    if (!S.partN && !S.ended) filler(ctx);
  }
  function A0(S) { return S.A; }
  function B0(S) { return S.B; }

  /* 朝：決まりごと ＋（2 日目から）設定の一件 ＋ ときどき三人目・外の便り */
  function morning(ctx, d) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B;
    var g = { g: 'obey' };
    var t = pk(ctx, T.MORN, g) || pk(ctx, T.MORN_ALL);
    if (t) say(ctx, 'ck_morn', t, { why: '朝の決まりごと' });
    if (d >= 1) {
      var dials = ['strict', 'tools', 'ratio', 'menu'], k = dials[(d - 1) % dials.length];
      var tab = k === 'strict' ? (T.SET_STRICT || {})[S.strict] : k === 'tools' ? (T.SET_TOOLS || {})[S.tools] : k === 'ratio' ? (T.SET_RATIO || {})[S.ratio] : (T.SET_MENU || {})[S.noBody ? 'mind' : S.menu];
      var st = pk(ctx, tab, g);
      if (st) { S.setHit = (S.setHit || 0) + 1; say(ctx, 'ck_set_' + k, st, { why: '設定（' + { strict: '厳しさ', tools: '道具', ratio: '褒美と罰', menu: '調教の内容' }[k] + '）が効いた朝' }); }
    }
    var r = ctx.rng();
    if (S.B2 && r < 0.4) s2Event(ctx);
    else if (S.guest && !S.captured && r < 0.6 && d >= 1 && !S.guestDay) guestVisit(ctx);
    else if (S.out.length && !S.captured && r < 0.35 && d >= 1) contact(ctx);
  }
  /* 日中：調教の一回（部位の文 ＋ 調教師の台詞 ＋ 奴隷の受け止め）と、褒美か罰 */
  function trainPart(ctx) {
    var S = f(ctx), want = DK.val(S, 'want') >= S.LINE;
    var cand = S.parts.filter(function (k) { return want || !PARTS[k].deep; });
    if (!cand.length) cand = ['mind'];
    var foc = S.focus.filter(function (k) { return cand.indexOf(k) >= 0; });
    var k = foc.length && ctx.rng() < 0.7 ? foc[Math.floor(ctx.rng() * foc.length)] : cand[Math.floor(ctx.rng() * cand.length)];
    if (k === S.lastPart && cand.length > 1 && ctx.rng() < 0.7) { var c2 = cand.filter(function (x) { return x !== k; }); k = c2[Math.floor(ctx.rng() * c2.length)]; }
    S.lastPart = k;
    return k;
  }
  var STRICT_K = { soft: 0.8, mid: 1, hard: 1.3 }, METHOD_K = { oazuke: 1, pain: 1.15, drug: 1.3, sweet: 0.9, hypno: 1.1 };
  function partBody(ctx, k, again) { var T = TX(); return PARTS[k].mind || k === 'oazuke' ? pk(ctx, (T.PART || {})[k], { g: 'obey', again: again }) : pk(ctx, (T.PART || {})[k], { g: 'sens_' + k, again: again }); }
  function daytime(ctx, d) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B, k = trainPart(ctx), sk = STRICT_K[S.strict], mk = METHOD_K[S.method];
    /* その部位のその段の文を使い切っていたら、まだ文の残っている部位に替える（同じ文を二度出さない） */
    var body = partBody(ctx, k, false);
    if (!body) {
      var want0 = DK.val(S, 'want') >= S.LINE, alt = S.parts.filter(function (x) { return x !== k && (want0 || !PARTS[x].deep); });
      for (var ai = 0; ai < alt.length && !body; ai++) { var kk = alt[Math.floor(ctx.rng() * alt.length)]; body = partBody(ctx, kk, false); if (body) k = kk; }
      if (!body) body = partBody(ctx, k, true);
      S.lastPart = k;
    }
    S.trains++; S.cnt[k] = (S.cnt[k] || 0) + 1;
    var head = pk(ctx, (T.METHOD || {})[S.method], { g: 'obey' }) || pk(ctx, (T.METHOD || {}).all, { g: 'obey' });
    var top = pk(ctx, byPer(T.TOP, A), { g: 'obey' });
    var gk = 'sens_' + k, rose = null;
    var react = pk(ctx, (T.REACT || {})[S.br], { g: 'obey' });
    var tx = [head, body, top, react].filter(Boolean).join('');
    var lewd = !PARTS[k].mind && !S.noBody;
    /* 計器を進める */
    var inc = Math.round((14 + ctx.rng() * 6) * sk * mk * (S.gsB.k === 'oboeru' ? 1.12 : 1));
    if (S.gauges[gk]) rose = DK.push(S, gk, inc);
    var oi = { obey: 9, flatter: 7, endure: 5, defy: 3 }[S.br] * sk * (S.gsB.k === 'taeru' ? 0.75 : 1) * (S.gsB.k === 'homerare' ? 1.15 : 1);
    DK.push(S, 'obey', Math.round(oi + ctx.rng() * 3));
    DK.push(S, 'crack', Math.round((S.method === 'drug' || S.method === 'hypno' ? 4 : S.method === 'pain' ? 3 : 1) * sk * (S.gsA.k === 'kowasanai' ? 0.6 : 1) * (S.gsB.k === 'taeru' ? 0.7 : 1)));
    DK.push(S, 'want', Math.round(3 + ctx.rng() * 3 + (S.method === 'sweet' ? 2 : 0) + (S.motive === 'self' ? 1 : 0)));
    var fb = S.br === 'defy' ? 'angry' : S.br === 'endure' ? 'normal' : S.br === 'flatter' ? 'joy' : 'shy';
    say(ctx, PARTS[k].mind ? 'ck_train_mind' : 'ck_train', tx, { why: '調教（' + PARTS[k].label + '・' + METHOD_NAME[S.method] + '／' + B.name + 'は' + BR_NAME[S.br] + '）', lewd: lewd, face: faces([[B, fb]]) });
    if (rose && rose.rose) sensUp(ctx, k, rose.stage);
    /* 褒美か罰 */
    var pr = { reward: 0.72, even: 0.5, punish: 0.28 }[S.ratio] + (S.br === 'obey' ? 0.12 : S.br === 'defy' ? -0.15 : 0);
    if (ctx.rng() < pr) reward(ctx); else punish(ctx);
    if (S.B2 && ctx.rng() < 0.3) s2Event(ctx, true);
  }
  function sensUp(ctx, k, st) {
    var S = f(ctx), T = TX();
    var t = pk(ctx, ((T.SENS_UP || {})[k] || {})[st]);
    if (t) say(ctx, 'ck_sens_up', t, { why: PARTS[k].label + 'の感度が上がった（' + (st >= 2 ? 'そこだけで達する' : '触れられるだけで声が出る') + '）', lewd: true, face: faceOf(S.B, 'shy') });
  }
  function reward(ctx) {
    var S = f(ctx), T = TX();
    var t = pk(ctx, byPer(T.REWARD, S.A), { g: 'obey' }) || pk(ctx, T.REWARD_ALL, { g: 'obey' }) || pk(ctx, byPer(T.REWARD, S.A).concat(T.REWARD_ALL || []), { g: 'obey', again: true });
    var r = pk(ctx, (T.REWARD_B || {})[S.br], { g: 'obey' });
    S.rewards++;
    DK.push(S, 'dep', 4 + (S.care === 'many' ? 2 : 0)); DK.push(S, 'want', 3); DK.push(S, 'jo', 3);
    if (t) say(ctx, 'ck_reward', t + r, { why: '褒美', face: faces([[S.B, 'joy']]), fx: function () { ctx.mod2(S.A, S.B, { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); } });
  }
  function punish(ctx) {
    var S = f(ctx), T = TX();
    var t = pk(ctx, byPer(T.PUNISH, S.A), { g: 'obey' }) || pk(ctx, T.PUNISH_ALL, { g: 'obey' }) || pk(ctx, byPer(T.PUNISH, S.A).concat(T.PUNISH_ALL || []), { g: 'obey', again: true });
    var r = pk(ctx, (T.PUNISH_B || {})[S.br], { g: 'obey' });
    S.punish++;
    var hk = S.strict === 'hard' ? 1.5 : S.strict === 'soft' ? 0.6 : 1;
    DK.push(S, 'obey', Math.round(5 * hk)); DK.push(S, 'crack', Math.round(4 * hk * (S.gsA.k === 'kowasanai' ? 0.6 : 1)));
    if (S.B.night === 'maso') DK.push(S, 'want', 4);
    if (t) say(ctx, 'ck_punish', t + r, { why: '罰（厳しさ：' + { soft: 'やさしい', mid: 'ふつう', hard: '厳しい' }[S.strict] + '）', face: faces([[S.A, 'angry'], [S.B, S.br === 'defy' ? 'angry' : 'fear']]) });
  }
  /* 夜：手当て（ケアの量）・段の節目・夜の場面か心理劇・会話 */
  function night(ctx, d) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B;
    var many = S.care === 'many';
    var ct = pk(ctx, many ? T.CARE : T.COLD, { g: many ? 'dep' : 'crack' }) || pk(ctx, T.NIGHT_ALL, { g: 'obey' });
    if (ct) say(ctx, many ? 'ck_care' : 'ck_cold', ct, { why: many ? '手当て（精神のケアが多い）' : '手当てのない夜（精神のケアが少ない）', face: faces([[B, many ? 'shy' : 'sad']]) });
    DK.push(S, 'dep', many ? 6 : 2); DK.push(S, 'crack', many ? 0 : 4); DK.push(S, 'want', many ? 4 : 2); DK.push(S, 'jo', many ? 4 : 2);
    milestones(ctx);
    /* 夜の場面（本音が線を越えた二人・回数が残っている・体の関係にしてよい） */
    var did = false, R = R18();
    if (R && R.night && !S.noBody && S.sex < S.lewdMax && DK.val(S, 'want') >= S.LINE) {
      var left = S.debutDay - d, need = S.lewdMax - S.sex;
      var p = need >= left ? 1 : 0.55 + (S.ratio === 'reward' ? 0.1 : 0);
      if (ctx.rng() < p) did = R.night(ctx, S, kindOf(ctx));
    }
    if (!did) {
      if (S.noBody || ctx.rng() < 0.5) { var ps = pk(ctx, T.PSY, { g: 'obey' }); if (ps) say(ctx, 'ck_psy', ps, { why: '心理劇の夜（言葉と鎖だけ）', face: faces([[B, 'shy']]) }); }
      else talk(ctx);
    }
    if (ctx.rng() < 0.45) solo(ctx);
  }
  function kindOf(ctx) {
    var S = f(ctx);
    if (S.lastPun) return 'punish';
    var r = ctx.rng();
    return S.br === 'flatter' && r < 0.45 ? 'beg' : r < 0.35 ? 'reward' : r < 0.6 ? 'test' : S.br === 'defy' ? 'punish' : 'beg';
  }
  function talk(ctx) {
    var S = f(ctx), T = TX();
    var t = pk(ctx, T.TALK, { g: 'dep' });
    if (t) say(ctx, 'ck_talk', t, { why: '寝る前の会話', fx: function () { ctx.mod2(S.A, S.B, { aff: 2 }, { aff: 2 }); } });
  }
  function solo(ctx) {
    var S = f(ctx), T = TX(), r = ctx.rng();
    if (r < 0.5) { var t = pk(ctx, T.ALONE_B, S.captured ? { stage: 0 } : { g: 'want' }); if (t) say(ctx, 'ck_alone_b', t, { actors: [S.B], cat: 'solo', why: '独りの夜（' + S.B.name + '）' }); }
    else { var t2 = pk(ctx, byPer(T.ALONE_A, S.A), { g: 'jo' }); if (t2) say(ctx, 'ck_alone_a', t2, { actors: [S.A], cat: 'solo', why: '独りの夜（' + S.A.name + '）' }); }
  }
  /* 段の節目（巻き戻らない計器の段が上がった区切りに一件。同じ段は一度だけ） */
  function milestones(ctx) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B;
    var w = DK.stage(S, 'want');
    if (w >= 1 && !S.captured && DK.once(S, 'want1')) { var tw = pk(ctx, T.WANT); if (tw) say(ctx, 'ck_want', tw, { why: B.name + 'の本音が「止めない」まで来た', face: faceOf(B, 'shy'), mag: 6 }); return; }
    var list = [['obey', 'ck_obey_up', T.OBEY_UP, '従順'], ['dep', 'ck_dep_up', T.DEP_UP, '依存'], ['crack', 'ck_crack_up', T.CRACK_UP, '心の壊れ']];
    for (var i = 0; i < list.length; i++) {
      var g = list[i], st = DK.stage(S, g[0]);
      if (st >= 1 && DK.once(S, g[0] + st)) {
        var t = pk(ctx, (g[2] || {})[Math.min(3, st)]);
        if (t) { say(ctx, g[1], t, { why: g[3] + 'の段が進んだ（' + st + '）', face: faceOf(B, g[0] === 'crack' ? 'sad' : g[0] === 'dep' ? 'shy' : 'normal'), mag: 4 }); return; }
      }
    }
    var j = DK.stage(S, 'jo');
    if (j >= 1 && DK.once(S, 'jo' + j)) { var tj = pk(ctx, ((T.JO || {})[j]) || []); if (tj) { say(ctx, 'ck_jo', tj, { why: A.name + 'の情が深まった', face: faceOf(A, j >= 2 ? 'jealous' : 'normal') }); return; } }
    if (ctx.rng() < 0.3) { var sl = pk(ctx, byPer(T.SLIP, A)); if (sl) say(ctx, 'ck_slip', sl, { why: A.name + 'の素顔', face: faceOf(A, 'smile_lover') }); }
  }
  /* 三人目 */
  function s2Event(ctx, train) {
    var S = f(ctx), T = TX(), g = S.B2; if (!g) return;
    var t = pk(ctx, train ? T.S2 : T.S2_TALK, { g: 'obey' });
    if (t) say(ctx, train ? 'ck_s2' : 'ck_s2_talk', t, { actors: train ? [S.A, S.B, g] : [S.B, g], ex: { g: g.name }, why: train ? '二人目の奴隷と並んで' : '奴隷どうしの会話' });
  }
  function guestVisit(ctx) {
    var S = f(ctx), T = TX(), g = S.guest; if (!g) return;
    var t = pk(ctx, T.GUEST, { g: 'obey' });
    if (t) { S.guestDay = (S.guestDay || 0) + 1; if (S.guestDay >= 2) S.guestDay = 0; say(ctx, 'ck_guest', t, { actors: [g, S.A, S.B], ex: { g: g.name }, why: g.name + '（会員）が見に来た' }); }
  }
  function contact(ctx) {
    var S = f(ctx), T = TX(), g = S.out[Math.floor(ctx.rng() * S.out.length)]; if (!g) return;
    var t = pk(ctx, T.CONTACT, { g: 'obey' });
    if (t) say(ctx, 'ck_contact', t, { actors: [S.B, S.A], ex: { g: g.name }, why: '外からの便り（' + g.name + '）' });
  }
  function filler(ctx) {
    var S = f(ctx), T = TX();
    var t = pk(ctx, T.FILL, { g: 'obey', again: true });
    if (t) say(ctx, 'ck_talk', t, { why: '二人のやりとり' });
  }

  /* ---------- 捕まえられてきた回：脱出（邪神村の手がかり集めと同じ作り。文は部屋のもの） ----------
     手がかり 5 種：key 鍵の在りか／gap 見張りの隙／tool 道具／slack 調教師の油断／ally ほかの奴隷の協力（二人目の奴隷がいるときだけ）。
     拾うたびに脱出の値が上がる（調教師の用心深さで増え方が変わる）。値が線を越えた夜に逃げる */
  var CLUE_V = { key: 22, gap: 15, tool: 15, slack: 18, ally: 20 };
  var WATCH = { cool: 0.75, stern: 0.75, proud: 0.9, polite: 0.9, tsun: 1, devoted: 1, gentle: 1.15, free: 1.2, shy: 1.15 };
  function clue(ctx, d) {
    var S = f(ctx), T = TX(), B = S.B;
    if (S.gaveUp) return;
    var pf = 0.62 + (DK.per(B) === 'cool' || DK.per(B) === 'stern' ? 0.1 : 0) - (S.strict === 'hard' ? 0.1 : 0);
    if (ctx.rng() > pf) return;
    var kinds = ['key', 'gap', 'tool', 'slack'].concat(S.B2 ? ['ally'] : []), fresh0 = kinds.filter(function (k) { return S.clues.indexOf(k) < 0; });
    var k = (fresh0.length ? fresh0 : kinds)[Math.floor(ctx.rng() * (fresh0.length ? fresh0 : kinds).length)];
    var t = pk(ctx, (T.CLUE || {})[k], { g: 'obey' });
    if (!t) return;
    if (S.clues.indexOf(k) < 0) S.clues.push(k);
    var v = Math.round(CLUE_V[k] * (WATCH[DK.per(S.A)] || 1) * (S.strict === 'hard' ? 0.85 : S.strict === 'soft' ? 1.15 : 1));
    DK.push(S, 'esc', v);
    say(ctx, 'ck_clue', t, { actors: k === 'ally' && S.B2 ? [B, S.B2] : [B, S.A], ex: S.B2 ? { g: S.B2.name } : null, why: '脱出の手がかり（' + { key: '鍵の在りか', gap: '見張りの隙', tool: '道具', slack: '調教師の油断', ally: 'ほかの奴隷の協力' }[k] + '）', face: faceOf(B, 'normal') });
  }
  function strongB(S) { return HK.ForceRep && HK.ForceRep.holds ? HK.ForceRep.holds(S.B) : /^(proud|stern)$/.test(DK.per(S.B)); }
  /* 夜に一件出したら true */
  function escapeNight(ctx, d, last) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B;
    DK.push(S, 'esc', 2);
    /* 諦め：従順が深く心にひびが入り、心の強くない人は、失敗のあとか終わりが近い夜に逃げるのをやめる */
    if (!S.gaveUp && DK.stage(S, 'obey') >= 2 && DK.stage(S, 'crack') >= 1 && !strongB(S) && (S.fails > 0 || d >= S.days - 3) && ctx.rng() < 0.6) {
      S.gaveUp = true;
      var tg = pk(ctx, T.GIVEUP);
      if (tg) { say(ctx, 'ck_giveup', tg, { why: B.name + 'が逃げるのを諦めた', face: faceOf(B, 'sad'), mag: 10 }); return false; }
    }
    if (S.gaveUp || d < 1 || (!last && DK.val(S, 'esc') < S.escLine)) return false;
    /* 情の移った調教師：鍵を開けたままにする */
    if (DK.stage(S, 'jo') >= 1 && /^(gentle|devoted|shy|tsun)$/.test(DK.per(A)) && ctx.rng() < 0.55) {
      S.letGo = true; S.endK = 'free';
      var tl = pk(ctx, byPer(T.LETGO, A));
      say(ctx, 'ck_letgo', tl || '{a}は、その夜だけ扉に鍵を掛けなかった。{b}はそれに気づき、黙って階段を上った。振り返っても、{a}は追ってこなかった。', { why: A.name + 'が見逃した', face: faces([[A, 'sad'], [B, 'surprise']]), mag: 20 });
      S.ended = true; return true;
    }
    S.tries++;
    var p = 0.22 + S.clues.length * 0.11 + (S.clues.indexOf('ally') >= 0 ? 0.08 : 0) - (S.strict === 'hard' ? 0.08 : 0) + (S.fails ? 0.1 : 0);
    if (ctx.rng() < p || (last && ctx.rng() < 0.5)) {
      S.escaped = true; S.endK = 'free';
      var ts = pk(ctx, T.ESCAPE_OK);
      say(ctx, 'ck_escape', ts, { why: B.name + 'が脱出した（' + S.tries + '回目・手がかり ' + S.clues.length + ' 種）', face: faces([[B, 'joy'], [A, 'angry']]), mag: 25 });
      S.ended = true; return true;
    }
    S.fails++;
    var tf = pk(ctx, T.ESCAPE_NG) + pk(ctx, byPer(T.ESCAPE_PUN, A));
    say(ctx, 'ck_escape_fail', tf, { why: B.name + 'の脱出は失敗（手がかりを失った）', face: faces([[B, 'fear'], [A, 'angry']]), mag: 12 });
    DK.push(S, 'obey', 8); DK.push(S, 'crack', 6); DK.push(S, 'jo', 5);
    S.clues = []; S.escLine = DK.val(S, 'esc') + 30;
    if (last) ending(ctx);
    return true;
  }

  /* ---------- 山場：お披露目会（最後の前の日） ---------- */
  function debutPrep(ctx) {
    var S = f(ctx), T = TX(), B = S.B;
    S.dress = S.noBody ? 'suit' : ctx.rng() < 0.5 ? 'maid' : 'under';
    var t = pk(ctx, T.DEBUT_PREP, { g: 'obey' });
    var dr = pk(ctx, (T.DEBUT_DRESS || {})[S.dress]);
    say(ctx, 'ck_debut_prep', t + dr, { why: 'お披露目会の支度（' + { maid: 'メイド服', under: '下着姿', suit: '礼装' }[S.dress] + '）', face: faceOf(B, 'shy') });
  }
  /* 開発の進んだ部位（段 1 以上）を、進んだ順に */
  function grown(S) {
    return Object.keys(S.gauges || {}).filter(function (k) { return /^sens_/.test(k) && S.gauges[k].stageMax >= 1; })
      .sort(function (x, y) { return S.gauges[y].v - S.gauges[x].v; }).map(function (k) { return k.slice(5); });
  }
  function debut(ctx) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B, R = R18();
    var open = pk(ctx, T.DEBUT_OPEN, { g: 'obey' });
    var g = grown(S), parts = g.slice(0, 2).map(function (k) { return pk(ctx, (T.DEBUT_PART || {})[k], { g: 'sens_' + k }); }).filter(Boolean).join('');
    /* 三択：もてなす（モブ）／見せつけ（調教師と）／奴隷どうし */
    var opts = [];
    var mobOk = !S.noBody && HK.State && HK.State.mobSexOk && HK.State.mobSexOk(B) && DK.val(S, 'want') >= S.LINE;
    if (mobOk) opts.push('mob');
    if (!S.noBody && R && R.night && S.sex < S.lewdMax && DK.val(S, 'want') >= S.LINE) opts.push('show');
    if (S.B2 && HK.bodyOK && HK.bodyOK(B, S.B2) && DK.val(S, 'want') >= S.LINE && !S.noBody) opts.push('pair');
    var pick = opts.length ? (S.br === 'flatter' && opts.indexOf('mob') >= 0 ? 'mob' : S.jo2 && opts.indexOf('show') >= 0 ? 'show' : opts[Math.floor(ctx.rng() * opts.length)]) : 'bow';
    S.debutK = pick;
    S.debutScore = g.length * 10 + DK.val(S, 'obey') / 2;
    var mid = '';
    if (pick === 'mob') mid = pk(ctx, T.DEBUT_MOB, { g: 'obey' });
    else if (pick === 'pair') mid = pk(ctx, T.DEBUT_PAIR, { g: 'obey' });
    else if (pick === 'bow') mid = pk(ctx, T.DEBUT_BOW, { g: 'obey' });
    var tx = open + (pick === 'bow' ? '' : parts) + mid;
    if (pick !== 'show' || !tx) say(ctx, 'ck_debut', tx || open, { actors: pick === 'pair' ? [A, B, S.B2] : [A, B], ex: S.B2 ? { g: S.B2.name } : null, why: 'お披露目会（' + { mob: '会員をもてなした', pair: '奴隷どうしで見せた', bow: '作法だけを見せた', show: '調教師との見せつけ' }[pick] + '）', lewd: pick !== 'bow', face: faceOf(B, 'shy'), mag: 10 });
    else say(ctx, 'ck_debut', tx, { why: 'お披露目会（調教師との見せつけ）', lewd: true, face: faceOf(B, 'shy'), mag: 10 });
    if (pick === 'show') R.night(ctx, S, 'debut');
    DK.push(S, 'obey', 6); DK.push(S, 'want', 4);
  }

  /* ---------- 競りと結末（最後の夜） ---------- */
  function price(S) {
    var g = Object.keys(S.gauges).filter(function (k) { return /^sens_/.test(k); }), sum = 0;
    g.forEach(function (k) { sum += S.gauges[k].v; });
    var avg = g.length ? sum / g.length : 0, v = 60 + avg * 1.4 + DK.val(S, 'obey') * 1.2 + (S.depth === 'full' ? 25 : S.depth === 'beg' ? 12 : 0) + (S.debutScore || 0) * 0.6 - DK.val(S, 'crack') * 0.4;
    return Math.max(30, Math.round(v / 5) * 5);
  }
  function decideEnd(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (S.endK) return S.endK;
    if (S.captured) {
      var pb0 = DK.per(B);
      /* 脱出・見逃しは escapeNight が free にする。ここに来るのは最後の夜まで出られなかった回 */
      S.endK = !S.gaveUp && /^(proud|tsun|cool|stern)$/.test(pb0) && (S.br === 'defy' || S.fails >= 2) && DK.stage(S, 'obey') <= 1 ? 'reverse' : 'own';
      return S.endK;
    }
    var ob = DK.stage(S, 'obey'), dp = DK.stage(S, 'dep'), cr = DK.stage(S, 'crack'), jo = DK.stage(S, 'jo'), want = DK.val(S, 'want'), pb = DK.per(B), pa = DK.per(A);
    var strong = HK.ForceRep && HK.ForceRep.holds ? HK.ForceRep.holds(B) : /^(proud|stern)$/.test(pb);
    var sc = {
      sold: 0.7 + ob * 0.45 + (S.debutK === 'mob' ? 0.5 : 0) + (S.depth === 'full' ? 0.4 : 0) - (dp >= 2 ? 0.3 : 0),
      own: (jo >= 1 ? 0.6 : 0) + jo * 0.6 + (/^(proud|devoted|tsun)$/.test(pa) ? 0.6 : 0) + (ob >= 2 ? 0.4 : 0) - 0.6,
      free: (cr === 0 ? 1.4 : cr === 1 ? 0.5 : 0) + (strong ? 0.8 : 0) + (S.br === 'defy' || S.br === 'endure' ? 0.6 : 0) - ob * 0.3,
      reverse: (/^(proud|stern|tsun|cool)$/.test(pb) ? 0.9 : 0) + (S.br === 'defy' ? 0.9 : 0) + (ob <= 1 ? 0.6 : -0.6) + (want >= 70 ? 0.3 : 0),
      love: S.love ? (dp * 0.8 + (S.care === 'many' ? 0.7 : 0) + (want >= 75 ? 0.5 : 0) + (S.rk === 'love' || S.rk === 'pine' ? 0.6 : 0)) : -9
    };
    /* 目標の後押し */
    var GB = { takaku: ['sold', 1], tebanasanai: ['own', 1.1], kaesu: ['free', 0.9], jiyuu: ['free', 1], tokubetsu: [S.love ? 'love' : 'own', 0.9], gyakuten: ['reverse', 1.1], nokoru: [S.love ? 'love' : 'own', 0.7] };
    [S.glA, S.glB].forEach(function (g) { var x = GB[g.k]; if (x) sc[x[0]] += x[1] * (g.user ? 1.5 : 1); });
    var best = 'sold', bv = -1e9;
    Object.keys(sc).forEach(function (k) { var v = sc[k] + ctx.rng() * 0.9; if (v > bv) { bv = v; best = k; } });
    S.endK = best; S.endSc = sc;
    return best;
  }
  function auction(ctx) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B;
    decideEnd(ctx);
    S.price = price(S);
    var t = pk(ctx, T.AUCTION, { g: 'obey' });
    var tail = pk(ctx, (T.AUCTION_TURN || {})[S.endK]);
    say(ctx, 'ck_auction', (t + tail).split('{price}').join(kanji(S.price)), { why: '競り（' + S.price + '万円）', face: faces([[B, S.endK === 'sold' ? 'sad' : S.endK === 'free' ? 'normal' : 'surprise']]), mag: 12 });
  }
  function kanji(v) { return v >= 10000 ? Math.floor(v / 10000) + '億' + (v % 10000 ? (v % 10000) + '万円' : '円') : v + '万円'; }
  function ending(ctx) {
    var S = f(ctx), T = TX(), A = S.A, B = S.B, k = decideEnd(ctx);
    var t = pk(ctx, ((S.captured ? T.END_CAP || {} : T.END || {})[S.captured && k === 'own' && !S.gaveUp ? 'held' : k]) || []);
    var w = pk(ctx, ((T.END_PER || {})[k] || {})[DK.per(B)] || []);
    if (!t) t = '{b}の地下室の日々は、ここで終わった。';
    say(ctx, 'ck_end', t + w, { why: '結末（' + END_NAME[k] + '）', face: faces([[B, { sold: 'sad', own: 'smile_lover', free: 'joy', reverse: 'joy', love: 'smile_lover' }[k]], [A, { sold: 'normal', own: 'joy', free: 'sad', reverse: 'surprise', love: 'smile_lover' }[k]]]), mag: 20,
      fx: function () { if (k === 'love' && S.love) ctx.mod2(A, B, { aff: 10, att: 8, trust: 6 }, { aff: 10, att: 8, trust: 6 }); else ctx.mod2(A, B, { aff: 3, trust: 3 }, { aff: 3, trust: 3 }); } });
    S.ended = true;
  }

  /* ---------- 終わり ---------- */
  function goalRes(S, side, kind) {
    var g = side === 'A' ? (kind === 's' ? S.gsA : S.glA) : (kind === 's' ? S.gsB : S.glB), k = S.endK, v = function (n) { return DK.val(S, n); };
    var sensMax = 0; Object.keys(S.gauges).forEach(function (x) { if (/^sens_/.test(x)) sensMax = Math.max(sensMax, S.gauges[x].stageMax); });
    var ok = {
      shiage: sensMax >= 2, nedari: DK.stage(S, 'obey') >= 2 && S.br !== 'defy', kowasanai: DK.stage(S, 'crack') <= 1, hirou: S.debutK && S.debutK !== 'bow',
      taeru: DK.stage(S, 'crack') <= 1, homerare: S.rewards >= S.punish, oboeru: sensMax >= 1 || DK.stage(S, 'obey') >= 2, tamesu: S.punish >= 1,
      takaku: k === 'sold' && S.price >= 180, tebanasanai: k === 'own' || k === 'love', kaesu: k === 'free' || k === 'reverse',
      jiyuu: k === 'free' || k === 'reverse', tokubetsu: k === 'own' || k === 'love', gyakuten: k === 'reverse', nokoru: k === 'own' || k === 'love'
    }[g.k];
    return { label: goalLabel(kind, g.k), ok: !!ok, user: g.user, v: v };
  }
  function endName(S) {
    if (!S.captured) return END_NAME[S.endK];
    return S.endK === 'free' ? (S.letGo ? '調教師が見逃した' : '地下室から脱出した') : S.endK === 'reverse' ? '立場が逆転した' : S.gaveUp ? '逃げるのを諦めた' : '最後まで出られなかった';
  }
  function finish(ctx) {
    var S = f(ctx); if (!S) return;
    var A = S.A, B = S.B;
    decideEnd(ctx);
    if (S.price == null) S.price = price(S);
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? '地下室の外の知り合い（名簿から）' : g === S.B2 ? '二人目の奴隷' : '会員（見届け役）'; g.fateNote = ''; });
    var sens = {};
    Object.keys(S.gauges).forEach(function (k) { if (/^sens_/.test(k)) sens[PARTS[k.slice(5)].label] = Math.round(S.gauges[k].v); });
    var res = { gsA: goalRes(S, 'A', 's'), glA: goalRes(S, 'A', 'l'), gsB: goalRes(S, 'B', 's'), glB: goalRes(S, 'B', 'l') };
    ctx.flags.chokyo = { days: S.days, a: A.i, b: B.i, endK: S.endK, end: endName(S), price: S.price, sens: sens, obey: Math.round(DK.val(S, 'obey')), dep: Math.round(DK.val(S, 'dep')), crack: Math.round(DK.val(S, 'crack')), want: Math.round(DK.val(S, 'want')),
      method: METHOD_NAME[S.method], methodOdd: !!S.methodOdd, br: BR_NAME[S.br], brOdd: !!S.brOdd, care: S.care === 'many' ? '多い' : '少ない', depth: { obey: '命令に従う', beg: '自分から媚びる', full: '完全な服従' }[S.depth],
      sex: S.sex, noBody: !!S.noBody, captured: !!S.captured, esc: Math.round(DK.val(S, 'esc')), tries: S.tries, fails: S.fails, escaped: !!S.escaped, letGo: !!S.letGo, gaveUp: !!S.gaveUp, debut: S.debutK || '', rewards: S.rewards, punish: S.punish, trains: S.trains,
      goals: [[A.name, res.gsA, res.glA], [B.name, res.gsB, res.glB]].map(function (x) { return { who: x[0], s: x[1].label, sOk: x[1].ok, l: x[2].label, lOk: x[2].ok }; }) };
    A.fate = { sold: '奴隷を送り出した調教師', own: '奴隷を引き取った調教師', free: '奴隷を解き放った調教師', reverse: '立場を明け渡した調教師', love: '奴隷を愛した調教師' }[S.endK];
    B.fate = { sold: '競りで送り出された奴隷', own: '調教師に引き取られた奴隷', free: '心を折らずに出ていった奴隷', reverse: '調教師の主になった奴隷', love: '調教師に愛された奴隷' }[S.endK];
    A.fateNote = B.name + 'を' + S.days + '日のあいだ躾けた'; B.fateNote = A.name + 'のもとで' + S.days + '日を過ごした';
    if (S.captured) { A.fate = '奴隷を捕まえてきた調教師'; B.fate = S.endK === 'free' ? '地下室を出た奴隷' : S.endK === 'reverse' ? '調教師の主になった奴隷' : '地下室に残った奴隷'; }
    ctx.flags.outcome = '調教の地下室の' + S.days + '日――' + endName(S);
  }
  DK.install(ID, DK.couple('part', 'trainer', 'slave', ['slave2', 'guest']), 'chokyo');
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.chokyo, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('調教の' + R.days + '日（' + a + 'が調教師、' + b + 'が奴隷）');
    lines.push('調教師の型：' + R.method + (R.methodOdd ? '（らしくない）' : '') + '／精神のケア：' + R.care + '／躾ける深さ：' + R.depth + '／' + b + '：' + R.br + (R.brOdd ? '（らしくない）' : ''));
    var sk = Object.keys(R.sens || {});
    if (sk.length) lines.push('感度：' + sk.map(function (k) { return k + ' ' + R.sens[k]; }).join('／'));
    lines.push('従順 ' + R.obey + '／依存 ' + R.dep + '／心の壊れ ' + R.crack + (R.noBody ? '（体には触れない心の躾けだけ）' : ''));
    (R.goals || []).forEach(function (g) { lines.push(g.who + 'の目標：短期「' + g.s + '」（' + (g.sOk ? '叶った' : '叶わなかった') + '）／長期「' + g.l + '」（' + (g.lOk ? '叶った' : '叶わなかった') + '）'); });
    lines.push('調教 ' + R.trains + '回／褒美 ' + R.rewards + '回／罰 ' + R.punish + '回' + (R.captured ? '' : '／エッチ ' + R.sex + '回'));
    if (R.captured) lines.push('脱出の値 ' + R.esc + '／脱出の試み ' + R.tries + '回（失敗 ' + R.fails + '回）' + (R.escaped ? '／脱出に成功' : R.letGo ? '／調教師が見逃した' : R.gaveUp ? '／逃げるのを諦めた' : ''));
    else lines.push('落札額：' + kanji(R.price) + (R.endK === 'sold' ? '' : '（' + (R.endK === 'own' ? '調教師が競りを止めた' : R.endK === 'free' ? '奴隷が札を下ろした' : R.endK === 'reverse' ? '競りは成立しなかった' : '競りは取り下げられた') + '）'));
    lines.push('結末：' + R.end);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: R.captured ? [['日数', R.days + '日'], ['脱出の試み', R.tries + '回'], ['結末', R.end]] : [['日数', R.days + '日'], ['落札額', kanji(R.price)], ['結末', R.end], ['エッチ', R.sex + '回']], lines: lines };
  };
  /* 結果欄の二人の関係（結末から） */
  var CKC = {
    sold: ['契約を終えた調教師と奴隷', 'partner', 0, '契約は競りで次の持ち主へ渡り、二人の地下室の日々は終わった。'],
    own: ['引き取った主と従う者', 'obsess', 1, '調教師は競りを止めて、奴隷を手元に置いた。'],
    free: ['対等に別れた二人', 'friend', 1, '奴隷は心を折らないまま契約を終え、自分の足で地下室を出ていった。'],
    reverse: ['入れ替わった主従', 'obsess', 1, '最後の夜、首輪を持つ手が入れ替わった。'],
    love: ['愛し合う二人', 'love', 2, '躾ける者と躾けられる者の契約は、最後の夜に別の名前の関係へ変わった。']
  };
  scen.classify = function (ctx, X, Y) {
    var S = f(ctx); if (!S || !((X === S.A && Y === S.B) || (X === S.B && Y === S.A))) return null;
    var k = decideEnd(ctx); if (k === 'love' && !S.love) k = 'free';
    var M0 = CKC[k], id = 'ckc_' + k;
    if (!HK.LABELS[id]) HK.LABELS[id] = { name: M0[0], cls: M0[1], pol: M0[2] };
    return { id: id, ckc: k };
  };
  scen.pairText = function (ctx, X, Y, cl) { var k = cl && cl.ckc; return k ? CKC[k][3] : null; };
  HK.Chokyo = { PARTS: PARTS, okText: okText, pk: pk, say: say, decideEnd: decideEnd, grown: grown, END_NAME: END_NAME };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: '夜の場面の描き方。ほのめかす＝暗転と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求めさせるところまで' });
})();
