/* r18:begin */
/* 配信の部屋（set-b-haishin）の R18 の組み立て（R18版だけ。全年齢版のパックを組み立てるとき、この印の間は落ちる。2026-11-06 担当 P11）
   設計は docs/reports/2026-11-06/haishin-design.md の 6・7 章、書き方は hakoniwa-packs/set-b/WRITING.md の「配信の部屋」。文の表は P9・P10（HK.HaishinR18Text＝R）、部屋の段は haishin-r18-room.js（P12）。
   ■ HK.Haishin.r18 = { init(ctx, S), step(ctx, S, o), answer(ctx, S, q, how, a, b, head) }（haishin.js の P1 が決めた口）
     ・answer：段 4〜6 の R18 の要求（seikan・mimi・kubi・deep／sawaru・koe・shitagi・nugu・chikubi・onani／kuchi・ana・vibe・tel・ireru）に応える（7.1）。
         カップルの文は {a}＝攻め・{b}＝受け（R.ANS[種類][mf|ff|fm][応え方]）、ソロは {a}＝配信者・{b}＝画面の外の人（R.ANS[種類][bF|bM|tM|tF]）。
         seikan は前置き → R.ZONE。kuchi・ana・vibe は R.OUT の go → snd → back（コメントの反応は S.ev の 'out'）。deep は HK.Kiss.scene（長いキス）。ireru は本番の判定へ。tel はソロの中盤の電話へ
     ・step：段 6 に達した区切り（o.enter）で本番の判定（7.2。夜の起こりやすさ 100 なら必ず。ほかは 0.5＋night/200。最後の区切りで入らなければ R.HINT）。
         ソロは中盤の段を進める（7.3：toy → call → self → notice｜hangup → come｜stay → punish → 本番。残りの区切りが足りなければ一区切りで複数の段）。
         切り忘れ（leak）の事後の区切り（R.AFTER・濃いときのもう一度・機材が落ちる）もここ
     ・本番の前に必ず「きっかけ」の段（R.LEAD[入口][言い出す人の態度] ＋ R.FANS[相手の態度]。e.tag＝'きっかけ'、理由の欄「きっかけ：…」）。場面は HK.PairR18.scene（部屋の段 haishin-r18-room.js。
         opt.spot：配信用の椅子＝chair（本体に無ければ sofa）・配信部屋のベッドの前＝bed・画面の外の床＝floor。長さは共通の欄 lewdLen：短く＝短い、ふつう＝中くらい、長く＝長い）。
         事後の一言 R.AFTER[入口] と、関係（ctx.mod2）・気分（HK.Emo.bump）が必ず動く
     ・切り忘れ：二人は気づかない。S.leak 'on' → 事後の区切りで 'after'、S.leakPh（start→mid→peak→after）をコメント欄（haishin-cm.js の post の leak）に渡す。S.leakFate は規模で決める（7.2）
     ・攻めを受けにしない：場面の攻め・受けは S.top・S.bot（haishin.js の HK.Pos.order）。攻めのソロは玩具を穴に入れない（体の添字 tM・tF の文だけ）。合意の遊びなので HK.ForceRep は通さない
   ■ S に書く欄：S.ended（'cut'／'leak'）・S.endAt・S.mid・S.midI・S.leak・S.leakFate・S.leakPh・S.sexDone・S.again・S.px（場面の回数の覚え。HK.PairR18.formOf が読む形）・S.hsEntry（部屋の長い場面の when が読む）
   登場人物はすべて成人として扱う。体の語は印 */
/* @event scen=set-b-haishin id=hs_r18_seikan cat=romance tie=- tags=night label=配信で相手の性感帯を発表して触る */
/* @event scen=set-b-haishin id=hs_r18_mimi cat=romance tie=- tags=night label=マイク越しに耳元で囁いて見せる */
/* @event scen=set-b-haishin id=hs_r18_kubi cat=romance tie=- tags=night label=カメラの前で首筋にキスをする */
/* @event scen=set-b-haishin id=hs_r18_deep cat=romance tie=- tags=night label=コメントにせがまれて深いキス */
/* @event scen=set-b-haishin id=hs_r18_sawaru cat=romance tie=- tags=night label=性感帯を触って見せる要求に応える */
/* @event scen=set-b-haishin id=hs_r18_koe cat=romance tie=- tags=night label=喘ぎ声を聴かせる要求に応える */
/* @event scen=set-b-haishin id=hs_r18_shitagi cat=romance tie=- tags=night label=下着を見せる要求に応える */
/* @event scen=set-b-haishin id=hs_r18_nugu cat=romance tie=- tags=night label=一枚脱ぐ要求に応える */
/* @event scen=set-b-haishin id=hs_r18_chikubi cat=romance tie=- tags=night label=胸を責めて見せる要求に応える */
/* @event scen=set-b-haishin id=hs_r18_onani cat=romance tie=- tags=night label=普段の自慰を見せる要求に応える */
/* @event scen=set-b-haishin id=hs_r18_kuchi cat=romance tie=- tags=night label=画面の外で口でする要求に応える */
/* @event scen=set-b-haishin id=hs_r18_ana cat=romance tie=- tags=night label=画面の外で指で弄る要求に応える */
/* @event scen=set-b-haishin id=hs_r18_vibe cat=romance tie=- tags=night label=玩具を入れて戻ってくる要求に応える */
/* @event scen=set-b-haishin id=hs_r18_tel cat=romance tie=- tags=night label=相手に電話する要求に応える */
/* @event scen=set-b-haishin id=hs_r18_ireru cat=romance tie=- tags=night label=そのまま入れてという要求に応える */
/* @event scen=set-b-haishin id=hs_r18_out cat=romance tie=- tags=night label=画面の外へ消えて音と声だけが届く */
/* @event scen=set-b-haishin id=hs_mid_lead cat=romance tie=- tags=night label=リクエストや寂しさから一人の配信が熱を帯びる */
/* @event scen=set-b-haishin id=hs_mid_stall cat=bond tie=- tags=night label=一人の配信で踏み込んだ要求を渋る */
/* @event scen=set-b-haishin id=hs_mid_toy cat=romance tie=- tags=night label=ソロ配信で玩具を使い体に触れる */
/* @event scen=set-b-haishin id=hs_mid_call cat=romance tie=- tags=night label=配信中に画面の外の相手へ電話をかける */
/* @event scen=set-b-haishin id=hs_mid_self cat=romance tie=- tags=night label=通話をつないだまま自慰を続ける */
/* @event scen=set-b-haishin id=hs_mid_notice cat=romance tie=- tags=night label=電話の相手が配信中の様子に気づく */
/* @event scen=set-b-haishin id=hs_mid_hangup cat=romance tie=- tags=night label=気づかれる前に通話が切れる */
/* @event scen=set-b-haishin id=hs_mid_come cat=romance tie=- tags=night label=電話の相手が配信部屋までやって来る */
/* @event scen=set-b-haishin id=hs_mid_stay cat=romance tie=- tags=night label=相手は来られず声だけで続ける */
/* @event scen=set-b-haishin id=hs_mid_punish cat=romance tie=- tags=night label=配信をつけたままのお仕置き */
/* @event scen=set-b-haishin id=hs_mid_amae cat=romance tie=- tags=night label=来てくれた相手に配信中に甘やかされる */
/* @event scen=set-b-haishin id=hs_r18_amae cat=romance tie=- tags=night label=甘やかされたあとの本番 */
/* @event scen=set-b-haishin id=hs_r18_cutoff cat=bond tie=- tags=night label=配信を切ってから二人きりになる */
/* @event scen=set-b-haishin id=hs_r18_leakcut cat=bond tie=- tags=night label=配信を切ったつもりで切れていない */
/* @event scen=set-b-haishin id=hs_r18_lead cat=romance tie=- tags=night label=配信の夜が本番に向かうきっかけ */
/* @event scen=set-b-haishin id=hs_r18_cut cat=romance tie=- tags=night label=配信を切ってからの本番 */
/* @event scen=set-b-haishin id=hs_r18_leak cat=romance tie=- tags=night label=切り忘れたまま始まる本番 */
/* @event scen=set-b-haishin id=hs_r18_punish cat=romance tie=- tags=night label=お仕置きのあとの本番 */
/* @event scen=set-b-haishin id=hs_r18_telpeak cat=romance tie=- tags=night label=電話越しに声だけで迎える山場 */
/* @event scen=set-b-haishin id=hs_r18_after cat=romance tie=- tags=night label=配信の夜のあとの一言と余韻 */
/* @event scen=set-b-haishin id=hs_r18_again cat=romance tie=- tags=night label=まだ映っているとも知らずにもう一度 */
/* @event scen=set-b-haishin id=hs_r18_leakend cat=bond tie=- tags=night label=切り忘れた配信が機材ごと落ちる */
/* @event scen=set-b-haishin id=hs_r18_soloclose cat=bond tie=- tags=night label=電話を終えて一人で配信を閉じる */
/* @event scen=set-b-haishin id=hs_r18_hint cat=romance tie=- tags=night label=続きは配信を切ってからとほのめかす */
(function () {
  'use strict';
  var HK = window.HK, H = HK && HK.Haishin, PR = HK && HK.PairR18;
  if (!H || !PR || !HK.Journal) return;
  var ID = 'set-b-haishin', K = HK.PairKit;
  var pickT = H.pickT, fill = H.fill, rec = H.rec, dig = H.dig, flat = H.flat;
  /* 行為の向き（haishin.js の setAct。コメント欄が {h}／{h2} を行為のする側・される側で当てる） */
  function act(S, d, t, k, over) { if (H.setAct) H.setAct(S, d, t, k, over); }
  function RX() { return HK.HaishinR18Text || {}; }
  function RM() { return HK.HaishinR18Room || {}; }
  function CK() { return HK.HaishinCmKit || null; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  function att(c, o) { return PR.att(c, o); }
  function hasM(c) { var P = HK.Pos; return !!(P && P.hasM && P.hasM(c)); }
  function rcat(S) { return S.romOk ? 'romance' : 'bond'; }
  /* 表から一つ（一回の遊びで同じ文は 1 回。使い切ったら 2 回目、それも無ければどれか） */
  /* 表の値が文字列一本でも配列でも読む（R.LEAD[入口][態度] は文字列） */
  function lst(x) { return typeof x === 'string' ? [x] : flat(x); }
  function pickAny(ctx, list, a, b) { var l = lst(list); return pickT(ctx, l, a, b) || pickT(ctx, l, a, b, true) || pickOf(ctx, l.map(function (x) { return typeof x === 'string' ? x : x && x.t; }).filter(Boolean)) || ''; }
  /* ソロの体の添字：t＝攻め（配信者が攻め）・b＝受け（リバ・おまかせも受け）、M＝男性器のある人・F＝ない人 */
  function bodyK(S, c) { return (c === S.top ? 't' : 'b') + (hasM(c) ? 'M' : 'F'); }
  /* 表の {a}{b}：カップルは攻め・受け、ソロは配信者・画面の外の人 */
  function AB(S) { return S.form === 'couple' ? [S.top, S.bot] : [S.on[0], S.off]; }
  function zoneEx(S, c) { return c && S.zones && S.zones[c.i] && S.zones[c.i].length ? { zone: S.zones[c.i].join('と') } : null; }
  /* 配信者の声（本体の喘ぎ。態度・口調で選ばれる） */
  function moanOf(ctx, c, climax) {
    var T = HK.ThickSex; if (!T || !T.moan) return '';
    var m = String(T.moan(function (l) { return pickOf(ctx, l); }, c, !!climax, ctx.rng) || '').replace(/^「|」$/g, '');
    return m ? c.name + '「' + m + '」' : '';
  }
  /* 場所：配信用の椅子は本体に chair があればそれ、無ければ sofa に落とす */
  function spotOf(k) { var SP = HK.SexSpot; if (!SP) return ''; if (k === 'chair') return SP.KIND && SP.KIND.chair ? 'chair' : 'sofa'; return k; }
  var ENTRY = { cut: '配信を切ってから', leak: '切り忘れたまま', punish: 'お仕置きのあと', amae: '甘やかされたあと', tel: '電話越しの山場', again: 'まだ映っているとも知らずにもう一度' };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };
  var STG = { seikan: 4, mimi: 4, kubi: 4, deep: 4, sawaru: 5, koe: 5, shitagi: 5, nugu: 5, chikubi: 5, onani: 5, kuchi: 6, ana: 6, vibe: 6, tel: 6, ireru: 6 };

  /* ---------- 表が無いときの代わりの文（部屋の表 R が読めない本体でも落ちないため。3 文以上） ---------- */
  var FB = {
    lead: ['配信のあいだに溜まった熱は、もう隠しようがなかった。{a}は{b}の手を取って、自分の頬に当てた。「＠{a}＠……続き、しよう｜……続きを、しよう｜……続きを、しましょう」'],
    fans: ['{b}は小さくうなずいた。「＠{b}＠うん｜ああ｜はい」その声は、少しかすれていた。'],
    after: ['二人はしばらく、言葉もなく寄り添っていた。配信の熱はまだ部屋に残っていて、{a}は{b}の髪をゆっくりと撫でた。「＠{a}＠……おつかれさま｜……おつかれ｜……おつかれさまでした」'],
    cut: ['{a}は配信の終了を押した。画面の数字が消えるのを確かめてから、{a}は{b}のほうを向いた。部屋には、急に静けさが戻った。'],
    leakcut: ['{a}は終了のボタンを押した……つもりだった。画面の隅の赤い表示は消えないまま、カメラは静かに二人を映し続けている。二人は、それに気づかなかった。'],
    hint: ['{a}は「＠{a}＠今日はここまで｜今日はここまでだ｜今日はここまでです」と言いながら、何度も{b}のほうを見た。配信が終わったあとのことは、二人とも口にしなかった。']
  };
  /* 電話越しの山場（来ない夜。{a}＝配信者、{b}＝電話の向こう。攻めの配信者は穴に入れない） */
  var TELBODY = {
    bF: ['{a}はスマホを耳に当てたまま、{ナカ}の玩具の振動を一段上げた。{b}の息づかいが、受話口の向こうで少しずつ荒くなっていく。{a}は{b}の名前を呼びながら、空いた手で{陰核}を押さえ、腰を椅子の上で揺らした。{m}',
      '{b}の声に合わせて、{a}は玩具を出し入れする手を速めた。くちゅりと鳴る音が、マイクと受話口の両方に届いてしまう。{a}はこらえきれずに脚を閉じ、スマホを頬に押し当てたまま背中を反らした。{m}'],
    bM: ['{a}は{後ろ}の玩具を奥まで押し込んだまま、{男性器}を握る手を動かした。受話口から聞こえる{b}の吐息が、耳の奥で甘く響く。{a}は{b}の名前を呼びながら、椅子の上で腰を小さく跳ねさせた。{m}',
      '{b}の声が低くなるたびに、{a}の{後ろ}が玩具をきゅっと締めつけた。{a}は{男性器}の先を親指で擦り、スマホを肩と耳で挟んだまま息を乱す。画面の向こうの数字も、もう目に入っていなかった。{m}'],
    tM: ['{a}は{b}の息づかいを聞きながら、{男性器}を握る手を根元から先まで大きく動かした。受話口の向こうで{b}が名前を呼ぶと、手の中のそれがびくりと跳ねる。{a}は歯を食いしばって、最後の数回を一気に追い上げた。{m}',
      '{a}は筒の玩具を{男性器}にかぶせたまま、{b}の声に合わせて上下させた。ぬちゅ、ぬちゅという湿った音が、マイクにも受話口にも乗ってしまう。{a}は{b}の名前を低く呼んで、椅子の背に体を預けた。{m}'],
    tF: ['{a}は{b}の声を聞きながら、ローターを{陰核}に強く押し当てた。もう片方の手で{乳首}をつまむと、受話口の向こうの{b}が息を呑むのが分かる。{a}は腰を浮かせたまま、{b}の名前を何度も呼んだ。{m}',
      '{a}は{胸}を揉みしだきながら、下着の上から{陰核}を指で円を描くように擦った。{b}の吐息が耳の奥で重なって、体の芯が一気に熱くなる。{a}は椅子の肘掛けをつかんで、小さく背中を反らした。{m}']
  };
  /* 電話の山場のあと、一人で配信を閉じる（{a}＝配信者、{b}＝電話の向こう） */
  var SOLOCLOSE = [
    '通話を終えると、{a}は乱れた髪を直してカメラに向き直った。「＠{a}＠……今日は、ここまで。みんな、ありがとう｜……今日は、ここまでだ。みんな、ありがとう｜……今日は、ここまでです。みんな、ありがとうございました」配信の終了を押すと、部屋には{a}の荒い息だけが残った。',
    '{a}はスマホを置いて、しばらく天井を見上げていた。それから画面に向かって、少しかすれた声で終わりの挨拶をする。「＠{a}＠おやすみ。……{b}にも、言ってくる｜おやすみ。……{b}にも、言ってくる｜おやすみなさい。……{b}にも、言ってきます」配信は、そこで静かに終わった。',
    '{a}は熱の残る体を椅子の背に預けたまま、終了のボタンに手を伸ばした。コメント欄の名残惜しそうな文字に、小さく手を振る。画面が暗くなると、{a}はもう一度スマホを握りしめて、{b}の名前をつぶやいた。'
  ];
  /* 切り忘れの事後：機材が落ちる（二人は最後まで気づかない。{a}{b}＝二人） */
  var LEAKEND = [
    '二人が寄り添ったまま寝息を立てはじめたころ、ノートパソコンのバッテリーが尽きた。画面が暗くなり、小さな赤い表示もようやく消える。配信は、誰にも止められないまま終わった。',
    '配信サイトの連続配信の上限が来て、画面に「配信は自動で終了しました」という文字が出た。けれどそれを読む人は、この部屋にはもういなかった。{a}も{b}も、互いの体温の中で眠っていた。',
    'カメラの小さな明かりは、二人の寝息に合わせるように、しばらく点いたままだった。やがて配信ソフトが応答しなくなり、画面はそのまま止まった。二人が知るのは、翌日になってからのことだ。'
  ];
  /* もう一度のきっかけ（切り忘れ。{a}＝言い出す人） */
  var LEAD_AGAIN = [
    '事のあとの静けさの中で、{a}の指がまた{b}の肌をたどりはじめた。まだカメラが映しているとも知らずに、{a}は{b}の耳もとに唇を寄せる。「＠{a}＠……ねえ、もう一回｜……もう一回だ｜……もう一回、いいですか」',
    '{b}の寝息が聞こえる前に、{a}は我慢できずに{b}を抱き寄せた。画面の隅の赤い表示は、二人のどちらの目にも入っていない。「＠{a}＠まだ、足りない｜まだ、足りない｜まだ、足りません」',
    '{a}は{b}の背中に額をつけて、しばらくじっとしていた。それから、まだ熱の残る体をもう一度{b}に重ねる。切れていない配信のことは、二人とも思い出さなかった。「＠{a}＠……今夜は、寝かせないから｜……今夜は、寝かせない｜……今夜は、寝かせませんから」'
  ];

  /* ---------- 場面の組み立て（HK.PairR18.scene に渡す部屋の文。haishin-r18-room.js の HK.HaishinR18Room） ---------- */
  var ROWS_FB = { BOTTOM: [{ k: '首すじ', t: '首すじに触れられて震える' }], TOP: [{ k: '名前を呼ぶ', t: '何度も相手の名前を呼ぶ' }] };
  /* 本体の長い場面に部屋の専用の場面（HK.Play.addScene）を乗せる回は、口づけの無い書き出し（OPEN_SOFT）を渡す（専用の場面の lead が口づけをするので、重ねない） */
  var NO_OPEN = false, CUR = null;
  var SRC = {
    TX: function () { return RM().TX || {}; },
    MO: function () {
      /* 書き出しも部屋の文の決まり（okText：ソロ配信のお仕置きのあとに「配信のあいだ隣に座っていた」を出さない・場所に合う文）で絞る（2026-11-06 P15b の通し読み） */
      var M0 = RM().MO || {}, okT = RM().okText, S0 = CUR && CUR.hs, f = function (l) { if (!l || !okT || !CUR || !S0) return l; var o = l.filter(function (t) { try { return okT(CUR, t, S0.top, S0.bot); } catch (e) { return true; } }); return o.length ? o : l; };
      var M = { OPEN: f(M0.OPEN), OPEN_SOFT: f(M0.OPEN_SOFT), FADE: M0.FADE };
      var op = M.OPEN && M.OPEN.length ? M.OPEN : null, sop = M.OPEN_SOFT && M.OPEN_SOFT.length ? M.OPEN_SOFT : op; return { OPEN: NO_OPEN ? sop : op, REOPEN: op, FADE: M.FADE && M.FADE.length ? M.FADE : null, PEAK_E: PR.FB.peakE }; },
    R: null, ok: function () { return RM().okText || null; }
  };
  function srcOf() { var T = RM().TX || {}; SRC.R = { BOTTOM: T.BOTTOM_ROWS && T.BOTTOM_ROWS.length ? T.BOTTOM_ROWS : ROWS_FB.BOTTOM, TOP: T.TOP_ROWS && T.TOP_ROWS.length ? T.TOP_ROWS : ROWS_FB.TOP }; return SRC; }
  /* 長さ（設計 1a・7.2）：ほのめかす → fade／短く → 短い／ふつう → 中くらい（性器なしの組は短い）／長く → 長い */
  function formOf(env, lv, nogen) {
    if (lv === 'low') return 'fade';
    if (env.lewdLen === 'short') return 'short';
    if (env.lewdLen === 'thick') return nogen ? 'short' : 'long';
    return nogen ? 'short' : 'mid';
  }
  var PI = { cut: 0, leak: 1, punish: 2, again: 3 };
  /* 本番の場面を一件。entry＝cut／leak／punish／again、x＝言い出した人。戻り値：記録（無ければ null） */
  function scene(ctx, S, entry, x, o) {
    o = o || {};
    var a = S.top, b = S.bot, env = ctx.env, LV = HK.Lewd;
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro), nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    /* 体の組：攻めに男性器があれば（フタナリも）mf の文、女性の攻め × 男性の受けは fm（指と手） */
    var sh = hasM(a) ? 'mf' : PR.shape(a, b);
    var form = o.form || formOf(env, lv, nogen);
    if (form === 'long' && !HK.ThickSex) form = 'mid';
    S.px = S.px || { sex: 0, lewdMax: 2, longN: 0 };
    var spot = spotOf(o.spot || 'bed');
    /* 長い場面：半分は部屋の段（HK.PairR18.compose）、半分は本体の長い場面に部屋の専用の場面（HK.Play.addScene：切り忘れ・お仕置き・リクエスト）を乗せる */
    /* 濃い（lv high）の「もう一度」は、切り忘れでは事後の区切りに別の一件で出す（leakAfter）ので、場面の中には入れない。もう一度の場面の中にも入れない */
    var lv2 = entry === 'again' || (entry === 'leak' && lv === 'high') ? 'mid' : lv;
    act(S, a, b, entry === 'again' ? 'again' : 'sex', true);
    var opt = { lv: lv2, ero: ero, nogen: nogen, pi: o.pi != null ? o.pi : PI[entry] || 0, afi: 0, jealTop: !!o.jealTop, leadB: x === b, entry: entry, resume: false, spot: spot, couple: true, noRoom: form === 'long' && !!HK.Play && sh !== 'fm' && ctx.rng() < 0.5 };   /* fm は型（HK.Play）を切るので、専用の場面は乗らない：いつも部屋の段で組む */
    if (sh === 'fm' && form === 'short') opt.ero = false;
    var PL = HK.Play, off0 = PL ? PL.off : null;
    if (PL && sh === 'fm') PL.off = true;
    S.hsEntry = entry; NO_OPEN = !!opt.noRoom; CUR = ctx;
    var full;
    try { full = PR.scene(ctx, S.px, env, a, b, sh, form, opt, srcOf()); } finally { S.hsEntry = ''; NO_OPEN = false; CUR = null; if (PL) PL.off = off0; }
    if (!full || !full.text) return null;
    var text = full.text.replace(/\s+$/, '');
    if (spot && HK.SexSpot && HK.SexSpot.fix) text = HK.SexSpot.fix(text, spot) || text;
    /* 朝・昼の場面（24 時間の寝落ち配信で朝に起きたあとなど）では、共通の部品の「夜が明けるまで」を言い換える（2026-11-06 P15b の計測で 11 時の場面に出た） */
    if (S.hour != null && S.hour >= 5 && S.hour < 18) text = text.replace(/夜が明けるまで/g, '気が済むまで').replace(/朝が来るまで/g, '気が済むまで');
    form = full.form || form;
    var e = ctx.act2({ actors: [a, b], cat: rcat(S), text: text, why: '配信の部屋：本番（' + ENTRY[entry] + '・' + FORM[form] + (full.room ? '・部屋の段' : '') + (spot ? '・' + ({ bed: 'ベッドの前', chair: '配信用の椅子', sofa: 'ソファ', floor: '画面の外の床' }[spot] || '配信部屋') : '') + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) return null;
    e.tag = entry === 'again' ? 'もう一度' : '本番';
    S.px.sex++; if (form === 'long') S.px.longN++;
    S.nMain++;
    if (entry === 'again') S.again = 1; else S.sexDone = 1;
    return e;
  }
  /* きっかけの段（本番の直前に別の一件。R.LEAD[入口][x の態度] ＋ R.FANS[y の態度]） */
  function lead(ctx, S, entry, x, y, why) {
    var R = RX();
    var L0 = R.LEAD && R.LEAD[entry] || {}, l1 = lst(L0[att(x, y)]), l2 = Object.keys(L0).reduce(function (o, k) { return o.concat(lst(L0[k])); }, []);
    var t = entry === 'again' ? pickAny(ctx, LEAD_AGAIN, x, y) : (pickT(ctx, l1, x, y) || pickT(ctx, l2, x, y) || pickAny(ctx, l1.length ? l1 : l2, x, y) || pickAny(ctx, FB.lead, x, y));
    var f = pickT(ctx, dig(R.FANS, att(y, x)), x, y) || pickAny(ctx, dig(R.FANS, att(y, x)), x, y) || pickAny(ctx, FB.fans, x, y);
    if (!t) return null;
    var e = ctx.say({ kind: 'event', cat: rcat(S), actors: [x, y], text: fill(ctx, t, x, y) + (f ? '\n\n' + fill(ctx, f, x, y) : ''), why: 'きっかけ：' + ENTRY[entry] + '（' + x.name + 'から・' + why + '）', mag: 0 });
    if (e) { e.tag = 'きっかけ'; S.nMain++; }
    return e;
  }
  function dropE(ctx, e) { if (!e) return; var L = ctx.log, i = L.indexOf(e); if (i >= 0) L.splice(i, 1); }
  /* その配信で実際にあったこと（きっかけの理由の欄） */
  function whyOf(S) {
    var p = ['段 ' + S.stage + '（' + (H.STAGE_NAME[S.stage] || '') + '）', '同接 ' + H.comma(S.v) + ' 人'];
    if (S.scSum) p.push('スパチャ累計 ' + H.yen(S.scSum));
    p.push('発情度 ' + S.heat);
    if (S.kiss) p.push('キス ' + S.kiss + ' 回');
    return p.join('・');
  }
  /* 事後の一言（R.AFTER[入口]）＋関係と気分が動く */
  var EMO = { cut: { joy: 20, lust: 10 }, leak: { joy: 18, lust: 12 }, punish: { shame: 15, joy: 15 }, amae: { joy: 22, lust: 8 }, tel: { joy: 10, lust: 12 }, again: { joy: 12 } };
  function after(ctx, S, entry, a, b) {
    var R = RX(), t = pickAny(ctx, dig(R.AFTER, entry === 'again' ? 'leak' : entry), a, b) || pickAny(ctx, FB.after, a, b);
    var e = rec(ctx, [a, b], fill(ctx, t, a, b), '事後の一言（' + ENTRY[entry] + '）', rcat(S), { tag: '事後', fx: function () { ctx.mod2(a, b, { aff: 3, att: 2, trust: 2 }, { aff: 3, att: 2, trust: 2 }); } });
    if (HK.Emo && HK.Emo.bump) [a, b].forEach(function (c) { HK.Emo.bump(ctx, c, EMO[entry] || EMO.cut, '配信のあとの夜'); });
    return e;
  }
  /* 切り忘れのコメント（区切りの途中に差す。始まり・最中。山場はその区切りの終わりの一件、事後は次の区切り） */
  function cmLeak(ctx, S, ph) {
    S.leakPh = ph;
    var C = CK();
    if (ph !== 'start' && ph !== 'mid') return;
    if (C && C.post) { try { C.post(ctx, { stage: 6, leak: ph, n: 4, react: [], sc: [], hour: S.hour }); } catch (e) { /* コメント欄が無くても止めない */ } }
  }
  function fateOf(ctx, S) {
    var W = { s10: [0.6, 0.2, 0.2], s100: [0.6, 0.2, 0.2], s1k: [0.3, 0.3, 0.4], s10k: [0.12, 0.33, 0.55] }[S.size] || [0.5, 0.25, 0.25], r = ctx.rng();
    return r < W[0] ? 'none' : r < W[0] + W[1] ? 'ban' : 'spread';
  }
  /* 切るか、切り忘れるか（7.2。p＝0.15＋0.45×night/100）。戻り値 'cut'／'leak' */
  function cutOrLeak(ctx, S, x, y, s) {
    var R = RX(), leak = ctx.rng() < 0.15 + 0.45 * Math.min(100, S.night || 0) / 100;
    /* 朝・昼（5〜17 時）に切るときは「おやすみ」の文を使わない（24 時間の寝落ち配信で朝に起きたあとなど。2026-11-06 P15b の通し読み） */
    var day = S.hour != null && S.hour >= 5 && S.hour < 18, noNight = function (l) { var o = (l || []).filter(function (t) { return !day || !/おやすみ/.test(t); }); return o.length ? o : l; };
    if (leak) {
      rec(ctx, [x, y], fill(ctx, pickAny(ctx, noNight(R.LEAKCUT), x, y) || pickAny(ctx, FB.leakcut, x, y), x, y), '配信を切ったつもり（切れていない。二人は気づかない）', 'bond', { tag: '配信終了のつもり' });
      S.leak = 'on'; S.leakFate = fateOf(ctx, S); S.leakAt = s;
      /* 事後の区切り（次の区切り）で機材が落ちる。先に終わりの印を置いて、次の区切りの様子・要求を出さない（haishin.js の after） */
      S.ended = 'leak'; S.endAt = s + 1;
      cmLeak(ctx, S, 'start');
      return 'leak';
    }
    rec(ctx, [x, y], fill(ctx, pickAny(ctx, noNight(R.CUT), x, y) || pickAny(ctx, FB.cut, x, y), x, y), '配信を切った（本番の前）', 'bond', { tag: '配信終了' });
    S.ended = 'cut'; S.endAt = s;
    return 'cut';
  }
  /* 本番の一式：切る／切り忘れ → きっかけ → 場面 → 事後（切り忘れの事後は次の区切り）。entry0＝'couple'（段 6 から）か 'punish'（お仕置きのあと） */
  function doSex(ctx, S, o, entry0, x, y, why) {
    /* 本番の向き（攻めが受けを抱く）を先に置く（切り忘れのコメント欄は場面の前から流れるため） */
    act(S, S.top, S.bot, 'sex', true);
    var s = o.s, kind = cutOrLeak(ctx, S, x, y, s), entry = entry0 === 'punish' || entry0 === 'amae' ? entry0 : kind;
    var le = lead(ctx, S, entry, x, y, why);
    if (kind === 'leak') cmLeak(ctx, S, 'mid');
    var spot = entry0 === 'punish' ? 'chair' : kind === 'leak' ? (ctx.rng() < 0.4 ? 'chair' : 'bed') : 'bed';
    /* 甘やかしのあと：場面の部屋の段は、切ってから／切り忘れの短い場面（お仕置きの言葉の応酬の文を使わない） */
    var e = scene(ctx, S, entry, x, { spot: spot, jealTop: entry0 === 'punish' && S.off === S.top, pi: entry0 === 'amae' ? PI[kind] : null });
    if (!e) {
      /* 場面が組めなかった（本体の門で止まった）：きっかけは残さず、配信はそのまま続ける */
      dropE(ctx, le);
      if (kind === 'leak') { S.leak = null; S.leakPh = null; S.leakFate = null; }
      S.ended = null; S.endAt = 999;
      S.noSex = 1;
      return false;
    }
    if (kind === 'leak') { S.leakPh = 'peak'; if (o.last) leakAfter(ctx, S, o); }
    else after(ctx, S, entry, entry0 === 'punish' || entry0 === 'amae' ? S.on[0] : S.top, entry0 === 'punish' || entry0 === 'amae' ? S.off : S.bot);
    return true;
  }
  /* 切り忘れの事後の区切り：（濃いときはもう一度）→ 事後の一言 → 機材が落ちる。コメント欄は C.LEAK の事後 */
  function leakAfter(ctx, S, o) {
    var LV = HK.Lewd, a = S.form === 'couple' ? S.top : S.on[0], b = S.form === 'couple' ? S.bot : S.off;
    S.leakPh = 'after';
    act(S, S.top, S.bot, 'sex', true);
    if (LV && LV.lv(ctx.env) === 'high' && !S.again && ctx.env.lewdLen !== 'short') {
      var x = ctx.rng() < 0.5 ? S.top : S.bot, y = x === S.top ? S.bot : S.top;
      var le = lead(ctx, S, 'again', x, y, '濃い夜・事後の熱');
      if (!scene(ctx, S, 'again', x, { spot: 'bed', form: ctx.rng() < 0.5 ? 'short' : 'mid' })) dropE(ctx, le);
    }
    /* 事後の一言：ソロ（お仕置きのあと）はお仕置きの入口の文、カップルは切り忘れの文 */
    after(ctx, S, S.form === 'solo' ? (S.comeMode === 'amae' ? 'amae' : 'punish') : 'leak', a, b);
    rec(ctx, [a, b], fill(ctx, pickAny(ctx, LEAKEND, a, b), a, b), '切り忘れた配信が落ちた（' + (S.leakFate === 'ban' ? '停止' : S.leakFate === 'spread' ? '切り抜きが広まる' : '誰も保存していなかった') + '）', 'bond', { tag: '配信終了' });
    S.leak = 'after'; S.ended = 'leak'; S.endAt = o.s;
    return true;
  }

  /* ---------- カップル：段 6 → 本番の判定（7.2） ---------- */
  function pairOk(ctx, S) {
    var a = S.top, b = S.bot, P = HK.Pos;
    if (!a || !b || a === b || S.noSex) return false;
    if (!PR.sexOk(ctx, a, b)) return false;
    if (P && P.okSex && !P.okSex(a, b)) return false;
    if (HK.bodyOK && !HK.bodyOK(a, b)) return false;
    return true;
  }
  /* 言い出す人：性欲の強い方、同じなら乱数 */
  function leaderOf(ctx, S, a, b) {
    var P = HK.Pos, la = P && P.libK ? P.libK(a) : 1, lb = P && P.libK ? P.libK(b) : 1;
    var x = la > lb ? a : lb > la ? b : (ctx.rng() < 0.5 ? a : b), y = x === a ? b : a;
    var AV = HK.Avoid;
    if (AV && AV.of && AV.of(ctx, x, y) && !AV.of(ctx, y, x)) { var t = x; x = y; y = t; }
    return [x, y];
  }
  function enterCouple(ctx, S, o) {
    if (!pairOk(ctx, S)) { if (o.last) hint(ctx, S); return false; }
    /* 夜 100：残りが 3 区切り以下なら必ず、それより前は 35%（長い配信では段 6 の要求を何回か出してから）。ほかは 0.5＋night/200（そのまま入れての要求のあとは +0.2） */
    var left = o.n - o.s, p = S.n100 ? (left <= 3 || S.ireru ? 1 : 0.35) : 0.5 + Math.min(100, S.night || 0) / 200 + (S.ireru ? 0.2 : 0);
    if (ctx.rng() >= p) { if (o.last) { hint(ctx, S); return true; } return false; }
    var xy = leaderOf(ctx, S, S.top, S.bot);
    return doSex(ctx, S, o, 'couple', xy[0], xy[1], whyOf(S));
  }
  /* 本番に入らずに配信を終えるとき：切ってからをほのめかす一段（最後の区切り） */
  function hint(ctx, S) {
    if (S.hinted) return; S.hinted = 1;
    var a = S.form === 'couple' ? S.top : S.on[0], b = S.form === 'couple' ? S.bot : S.off;
    rec(ctx, [a, b], fill(ctx, pickAny(ctx, RX().HINT, a, b) || pickAny(ctx, FB.hint, a, b), a, b), '続きは配信を切ってから（ほのめかし）', rcat(S), { tag: 'ほのめかし' });
  }

  /* ---------- ソロ：中盤（7.3）。S.midI＝次に進める段の番号 ---------- */
  var CHAIN = ['toy', 'call', 'self', 'notice', 'come', 'punish', 'sex'];
  function midText(ctx, S, key, x, y) { var k = bodyK(S, x), R = RX(), l = dig(R.MID, key, k); return pickT(ctx, l, x, y) || pickT(ctx, l, x, y, true) || pickAny(ctx, l, x, y); }
  function telLine(ctx, S, i, x, y) { var l = dig(RX().TEL, att(y, x)); var t = l[i] || l[l.length - 1] || ''; return t ? '\n\n' + fill(ctx, t, y, x) : ''; }
  /* ソロの中盤のきっかけ（toy・call の直前に必ず別の一件。e.tag＝'きっかけ'。2026-11-06 の利用者の指示「玩具を入れる・電話をかけるが急に始まる」）
     玩具：視聴者の要求のコメント（C.REQ の段 6 の vibe → 段 5 の onani・sawaru）を読み上げる流れ ＋ R.MIDLEAD.toy[態度]（迷い・渋り・決心の台詞）。電話：R.MIDLEAD.call[態度]（理由） */
  var MIDQ = { toy: [[6, 'vibe'], [5, 'onani'], [5, 'sawaru']], call: [] };
  function midLead(ctx, S, key, x, y) {
    var C = CK(), q = null;
    (MIDQ[key] || []).forEach(function (z) { if (!q && C && C.main) { try { q = C.main(ctx, { stage: z[0], k: z[1] }); } catch (e) { q = null; } } });
    /* R.MIDLEAD[段][態度] は文字列一本（lst で配列に） */
    var M0 = (RX().MIDLEAD || {})[key] || {}, l = lst(M0[att(x, y)]), all = Object.keys(M0).reduce(function (o2, k2) { return o2.concat(lst(M0[k2])); }, []);
    var t = pickT(ctx, l, x, y) || pickAny(ctx, l.length ? l : all, x, y);
    if (!t) return null;
    var e = ctx.say({ kind: 'event', cat: rcat(S), actors: [x, y], text: (q && q.text ? q.text : '') + fill(ctx, t, x, y), why: 'きっかけ：ソロの中盤（' + (key === 'toy' ? (x === S.top ? '自分の体に触れる' : '玩具を使う') : '画面の外の相手に電話する') + '・' + x.name + 'から）', mag: 0 });
    if (e) { e.tag = 'きっかけ'; S.nMain++; S.midLeadN = (S.midLeadN || 0) + 1; }
    return e;
  }
  /* 性格による渋り：恥ずかしがり・堅い態度は 1〜2 区切り、丁寧・ツンデレは半分の回で 1 区切り渋ってから応える（張り切る態度はすぐ）。夜の性格が恥じらいなら 1 区切り多く */
  function midStallNeed(ctx, S, x) {
    var p = H.per ? H.per(x) : 'gentle', nk = H.nightKind ? H.nightKind(x, S.off) : '', n = 0;
    if (p === 'shy' || p === 'stern') n = 1 + (ctx.rng() < 0.5 ? 1 : 0);
    else if (p === 'polite' || p === 'tsun') n = ctx.rng() < 0.5 ? 1 : 0;
    if (nk === 'shy') n = Math.min(2, n + 1);
    return n;
  }
  function midStall(ctx, S, o) {
    var x = S.on[0], y = S.off, C = CK(), q = null, T0 = HK.HaishinText || {};
    (MIDQ.toy || []).forEach(function (z) { if (!q && C && C.main) { try { q = C.main(ctx, { stage: z[0], k: z[1] }); } catch (e) { q = null; } } });
    var p = H.per ? H.per(x) : 'gentle', t = pickT(ctx, dig(T0.STALL, p), x, y) || pickT(ctx, flat(T0.STALL), x, y) || pickAny(ctx, flat(T0.STALL), x, y);
    if (!t) return false;
    S.midStallN = (S.midStallN || 0) + 1; S.stallTot = (S.stallTot || 0) + 1;
    rec(ctx, [x, y], (q && q.text ? q.text : '') + fill(ctx, t, x, y), '踏み込んだ要求を渋った（ソロの中盤の前・' + S.midStallN + ' 回目）', 'bond', { tag: '渋り', ev: 'stall' });
    return true;
  }
  function stage1(ctx, S, o, key) {
    var x = S.on[0], y = S.off, cat = rcat(S), t;
    switch (key) {
      case 'toy':
        t = midText(ctx, S, 'toy', x, y); if (!t) return false;
        midLead(ctx, S, 'toy', x, y);
        rec(ctx, [x, y], fill(ctx, t, x, y), 'ソロの中盤：' + (x === S.top ? '体に触れる（攻め。穴には入れない）' : '玩具を入れる'), cat, { tag: '中盤' });
        S.mid = 'toy'; return true;
      case 'call':
        t = midText(ctx, S, 'call', x, y); if (!t) return false;
        midLead(ctx, S, 'call', x, y);
        rec(ctx, [x, y], fill(ctx, t, x, y) + telLine(ctx, S, 0, x, y), 'ソロの中盤：画面の外の相手に電話をかけた', cat, { tag: '電話' });
        S.mid = 'call'; return true;
      case 'self':
        t = midText(ctx, S, 'self', x, y); if (!t) return false;
        var mo = moanOf(ctx, x, false);
        rec(ctx, [x, y], fill(ctx, t, x, y) + (mo ? '\n\n' + mo : '') + telLine(ctx, S, 1, x, y), 'ソロの中盤：通話をつないだまま自慰', cat, { tag: '電話' });
        S.mid = 'self'; return true;
      case 'notice':
        var nt = ctx.rng() < 0.65;
        t = midText(ctx, S, nt ? 'notice' : 'hangup', x, y);
        if (!t) { nt = !nt; t = midText(ctx, S, nt ? 'notice' : 'hangup', x, y); }
        if (!t) return false;
        rec(ctx, [x, y], fill(ctx, t, x, y) + (nt ? telLine(ctx, S, 2, x, y) : ''), nt ? 'ソロの中盤：電話の相手が気づいた' : 'ソロの中盤：通話が切れた', cat, { tag: '電話' });
        S.mid = nt ? 'notice' : 'hangup'; return true;
      case 'come':
        /* 夜 100 でも 4 回に 1 回は来ない（電話越しの山場で一人で閉じる。2026-11-06 の利用者の指示「20 回とも来訪→お仕置き」の直し） */
        var pc = S.n100 ? 0.75 : 0.4 + Math.min(100, S.night || 0) / 250 + 0.1 * ((S.beh && S.beh.jeal) || 0);
        if (!pairOk(ctx, S)) pc = 0;
        if (ctx.rng() < pc) {
          t = midText(ctx, S, 'come', x, y); if (!t) return false;
          rec(ctx, [x, y], fill(ctx, t, x, y), 'ソロの中盤：' + y.name + 'が' + (S.home ? '帰ってきた' : '家に来た'), cat, { tag: '来訪' });
          S.mid = 'come'; S.comeMode = comeMode(ctx, S, y, x); return true;
        }
        /* 来ない：声だけで続け、電話越しの山場で配信を閉じる */
        t = midText(ctx, S, 'stay', x, y);
        if (t) rec(ctx, [x, y], fill(ctx, t, x, y), 'ソロの中盤：相手は来られず、声だけで続ける', cat, { tag: '電話' });
        S.mid = 'stay';
        telPeak(ctx, S, o);
        return true;
      case 'punish':
        /* 来た人の態度で、お仕置き（言葉で責める）か甘やかし（R.AMAE）に分かれる */
        if (S.comeMode === 'amae') {
          var al = dig(RX().AMAE, att(y, x)), a1 = pickT(ctx, al, y, x) || pickAny(ctx, al, y, x), a2 = pickT(ctx, al, y, x);
          if (a1) {
            act(S, y, x, 'amae');
            rec(ctx, [x, y], fill(ctx, a1, y, x) + (a2 ? '\n\n' + fill(ctx, a2, y, x) : ''), 'ソロの中盤：配信をつけたまま甘やかされる（' + y.name + 'が' + x.name + 'を甘やかす）', cat, { tag: '甘やかし' });
            S.mid = 'punish'; return true;
          }
          S.comeMode = 'punish';
        }
        t = midText(ctx, S, 'punish', x, y); if (!t) return false;
        act(S, y, x, 'punish');
        var pl = dig(RX().PUNISH, att(y, x)), p1 = pickT(ctx, pl, y, x) || pickAny(ctx, pl, y, x), p2 = ctx.rng() < 0.5 ? pickT(ctx, pl, y, x) : '';
        rec(ctx, [x, y], fill(ctx, t, x, y) + (p1 ? '\n\n' + fill(ctx, p1, y, x) : '') + (p2 ? fill(ctx, p2, y, x) : ''), 'ソロの中盤：配信をつけたままのお仕置き（' + (x === S.top ? y.name + 'が焦らして言葉で責め、最後は' + x.name + 'が抱く' : y.name + 'が言葉で責めて主導') + '）', cat, { tag: 'お仕置き' });
        S.mid = 'punish'; return true;
      case 'sex':
        if (!pairOk(ctx, S)) { S.mid = 'done'; return true; }
        /* きっかけは配信者から（電話越しに見つかって）。場面の攻め・受けは S.top・S.bot（攻めを受けにしない） */
        doSex(ctx, S, o, S.comeMode === 'amae' ? 'amae' : 'punish', x, y, (S.comeMode === 'amae' ? '電話越しに見つかって甘やかされて・' : '電話越しに見つかって・') + whyOf(S));
        S.mid = 'done'; return true;
    }
    return false;
  }
  /* 来た人がお仕置きをするか甘やかすか（態度 9 種と夜の性格。来た人＝c、配信者＝o）。甘やかしの表（R.AMAE）が無ければいつもお仕置き */
  var AMAE_W = { gentle: 0.85, devoted: 0.8, shy: 0.7, polite: 0.65, free: 0.45, cool: 0.3, tsun: 0.3, stern: 0.2, proud: 0.15 };
  function comeMode(ctx, S, c, o) {
    if (!dig(RX().AMAE).length) return 'punish';
    var p = AMAE_W[att(c, o)] != null ? AMAE_W[att(c, o)] : 0.5, nk = H.nightKind ? H.nightKind(c, o) : '';
    if (nk === 'sweet') p += 0.25; else if (nk === 'sadist' || nk === 'mean') p -= 0.3;
    return ctx.rng() < Math.max(0.05, Math.min(0.95, p)) ? 'amae' : 'punish';
  }
  /* 電話越しの山場（来ない夜。本番の代わり。{a}＝配信者） */
  function telPeak(ctx, S, o) {
    var x = S.on[0], y = S.off, k = bodyK(S, x);
    lead(ctx, S, 'tel', x, y, '会えない夜・' + whyOf(S));
    var body = pickAny(ctx, TELBODY[k] || TELBODY.bF, x, y).replace('{m}', moanOf(ctx, x, true));
    var e = ctx.act2({ actors: [x, y], cat: rcat(S), text: fill(ctx, body, x, y), why: '配信の部屋：電話越しの山場（' + x.name + '・' + (x === S.top ? '攻めの配信者は穴に入れない' : '受けの配信者') + '）', lewd: true,
      fx: function () { ctx.mod2(x, y, { aff: 3, att: 4 }, { aff: 3, att: 4 }); } });
    if (e) { e.tag = '電話'; S.nMain++; }
    after(ctx, S, 'tel', x, y);
    rec(ctx, [x, y], fill(ctx, pickAny(ctx, SOLOCLOSE, x, y), x, y), '電話を終えて配信を閉じた', 'bond', { tag: '配信終了' });
    S.sexDone = 1; S.ended = 'cut'; S.endAt = o.s;
  }
  /* 一区切りで進める段の数：残りの区切りで本番に届くように（夜 100）。ほかは 1〜2 */
  function soloStep(ctx, S, o) {
    if (S.mid === 'done' || S.mid === 'stay') return false;
    if (S.midI == null) S.midI = 0;
    /* 中盤の始まり：夜 100 でも、残りが 8 区切りより多ければ 30%（段 6 の要求を何回か出してから）。ほかは 50% */
    if (S.midI === 0 && S.mid === 'none' && !o.last) { var lf = o.n - o.s; if (ctx.rng() >= (S.n100 ? (lf <= 8 ? 1 : 0.3) : 0.5)) return false; }
    if (!pairOk(ctx, S) && S.midI === 0 && !S.n100) { if (o.last) hint(ctx, S); return !!o.last; }
    /* 中盤の前の渋り（性格。残りの区切りが足りるときだけ） */
    if (S.midI === 0 && S.mid === 'none') {
      if (S.midStallNeed == null) S.midStallNeed = midStallNeed(ctx, S, S.on[0]);
      if ((S.midStallN || 0) < S.midStallNeed && !o.last && (!S.n100 || o.n - o.s >= 3) && midStall(ctx, S, o)) return true;
    }
    /* 中盤のあいだ（電話・自慰・お仕置き）の区切りの「配信の様子」は、haishin.js（骨組み）が出さない */
    var left = Math.max(1, o.n - o.s), need = CHAIN.length - S.midI;
    var k = S.n100 ? Math.max(1, Math.ceil(need / left)) : (left <= 1 ? 1 : (ctx.rng() < 0.3 ? 2 : 1));
    if (!S.n100 && left <= 1 && S.midI < CHAIN.indexOf('come')) k = 1;
    var did = 0;
    for (var i = 0; i < k && S.midI < CHAIN.length && !S.ended && S.mid !== 'done' && S.mid !== 'stay'; i++) {
      var key = CHAIN[S.midI];
      /* 最後の区切りで来ない夜なら、電話の山場で終える */
      if (!stage1(ctx, S, o, key)) { S.midI++; continue; }
      S.midI++; did++;
    }
    /* 最後の区切りで本番に届かなかった（夜 100 でない）：相手が来ているなら本番へ、電話の途中なら電話越しの山場で閉じる */
    if (o.last && !S.ended && !S.sexDone && S.mid !== 'done' && S.mid !== 'stay') {
      if (S.mid === 'come' || S.mid === 'punish') { stage1(ctx, S, o, 'sex'); S.midI = CHAIN.length; }
      else if (/^(self|notice|hangup)$/.test(S.mid)) { telPeak(ctx, S, o); S.mid = 'stay'; }
    }
    return did > 0 || !!o.last;
  }

  /* ---------- 口 ---------- */
  var R18 = H.r18 = H.r18 || {};
  R18.init = function (ctx, S) {
    S.mid = 'none'; S.midI = null; S.comeMode = ''; S.leak = null; S.leakPh = null; S.leakFate = null; S.sexDone = 0; S.again = 0; S.px = { sex: 0, lewdMax: 2, longN: 0 }; S.hsEntry = ''; S.hinted = 0; S.ireru = 0; S.noSex = 0;
  };
  R18.step = function (ctx, S, o) {
    if (!S || !S.r18 || S.cap !== 6) return false;
    /* 切り忘れの事後の区切り */
    if (S.leak === 'on' && S.sexDone) return leakAfter(ctx, S, o);
    if (S.ended) return false;
    if (S.sexDone) return false;
    if (S.form === 'solo') return S.stage >= 6 ? soloStep(ctx, S, o) : false;
    if (S.stage < 6) return false;
    if (o.enter || o.last) return enterCouple(ctx, S, o);
    return false;
  };
  R18.answer = function (ctx, S, q, how, a, b, head) {
    if (!S || !S.r18) return false;
    var R = RX(), k = q && q.k || '';
    if (!R.ANS || !R.ANS[k]) return false;
    var ab = AB(S), x = ab[0], y = ab[1], key = S.form === 'couple' ? S.sh : bodyK(S, x), cat = rcat(S);
    /* 行為の向き：カップルは攻めが受けにする（口の奉仕 kuchi だけは受けが攻めに）。ソロは配信者が自分に */
    var dd = S.form === 'couple' ? (k === 'kuchi' ? y : x) : x, tk = S.form === 'couple' ? (k === 'kuchi' ? x : y) : x;
    /* 攻めのソロに玩具を入れる要求・ソロでないのに二人の行為は出さない（haishin.js の reqOk でも止めるが、表の側でも守る） */
    if (S.form === 'solo' && /^(kuchi|ana|ireru)$/.test(k)) return false;
    if (S.form === 'couple' && /^(onani|tel)$/.test(k)) return false;
    var l = dig(R.ANS, k, key, how), t = pickT(ctx, l, x, y) || pickT(ctx, dig(R.ANS, k, key), x, y) || pickT(ctx, dig(R.ANS, k, key), x, y, true);
    if (!t) return false;
    act(S, dd, tk, k);
    var ex = zoneEx(S, k === 'seikan' || k === 'sawaru' ? (S.form === 'couple' ? y : x) : null);
    var txt = (head || '') + fill(ctx, t, x, y, ex), why = '踏み込んだ要求に応えた（' + (H.kJa ? H.kJa(k) : '') + '・' + (H.howJa ? H.howJa(how) : '') + '）', tag = 'リクエスト', ev = how === 'sunao' ? 'sunao' : '';
    /* 性感帯の発表：前置き → R.ZONE[形][{a} の態度] */
    if (k === 'seikan') {
      var z = pickT(ctx, dig(R.ZONE, S.form, att(x, y)), x, y) || pickAny(ctx, dig(R.ZONE, S.form), x, y);
      if (z) txt += '\n\n' + fill(ctx, z, x, y, ex);
      why = '性感帯を発表した（' + (S.form === 'couple' ? y.name : x.name) + 'の' + (ex ? ex.zone.replace(/[{}]/g, '') : '') + '・' + (H.howJa ? H.howJa(how) : '') + '）';
    }
    /* 深いキス（カップル）：HK.Kiss の長いキス。前置きの文を始まりの段に */
    if (k === 'deep' && S.form === 'couple' && HK.Kiss && HK.Kiss.scene) {
      var T0 = HK.HaishinText || {}, tl = pickT(ctx, T0.KISS_TAIL, x, y);
      var kr = HK.Kiss.scene(ctx, x, y, { trig: q.yen ? 'hobi' : how === 'shy' ? 'karakai' : 'amae', len: 'l', lead: K.mark(txt), tail: tl ? ' ' + fill(ctx, tl, x, y) : undefined, whyPre: '配信の部屋：深いキスの要求に応えて：', tag: 'キス' });
      if (kr && kr.e) { S.kiss++; S.ev.push('kiss'); S.evBy.kiss = { doer: x, taker: y }; S.nMain++; if (q.yen) S.ev.push('sc'); return true; }
    }
    /* 画面の外の行為：go（消える）→ snd（音と声だけ）→ back（戻ってくる）。コメントの反応は次の区切りの 'out' */
    if (/^(kuchi|ana|vibe)$/.test(k) && S.form === 'couple') {
      var ol = dig(R.OUT, k, S.sh).filter(function (x0) { return x0 && x0.go; }), U = S.used, oq = ol.filter(function (x0) { return !U['out:' + x0.go]; });
      var oo = pickOf(ctx, oq.length ? oq : ol);
      if (oo) {
        U['out:' + oo.go] = 1;
        rec(ctx, [x, y], txt + '\n\n' + fill(ctx, oo.go, x, y), why, cat, { tag: tag, ev: ev });
        rec(ctx, [x, y], fill(ctx, oo.snd, x, y) + '\n\n' + fill(ctx, oo.back, x, y), '画面の外の行為（' + (H.kJa ? H.kJa(k) : '') + '）：音と声だけが届き、戻ってきた', cat, { tag: '画面の外', ev: 'out', doer: dd, taker: tk });
        if (q.yen) S.ev.push('sc');
        return true;
      }
    }
    rec(ctx, [x, y], txt, why, cat, { tag: tag, ev: ev, doer: dd, taker: tk });
    if (q.yen) S.ev.push('sc');
    /* そのまま入れて（カップル）：本番の判定の直前まで。ここで判定 */
    if (k === 'ireru' && S.form === 'couple') {
      S.ireru = 1;
      if (!S.sexDone && S.stage >= 6) enterCouple(ctx, S, { s: S.s, last: S.s === S.N - 1, n: S.N, enter: true });
    }
    /* 相手に電話して（ソロ）：玩具の段は飛ばして電話から */
    if (k === 'tel' && S.form === 'solo' && S.mid === 'none') {
      S.midI = CHAIN.indexOf('call');
      soloStep(ctx, S, { s: S.s, last: S.s === S.N - 1, n: S.N });
    }
    return true;
  };
  R18.ENTRY = ENTRY; R18.FORM = FORM; R18.CHAIN = CHAIN; R18.scene = scene; R18.lead = lead;
})();
/* r18:end */
