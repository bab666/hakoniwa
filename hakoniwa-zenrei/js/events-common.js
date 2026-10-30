/* 箱庭診断: どの箱庭でも起きる共通イベント */
(function () {
  'use strict';
  var HK = window.HK;

  HK.GLOBAL_ENV = [
    { id: 'chaos', label: '運命の揺らぎ', min: 0, max: 100, def: 40, lo: '気質どおり', hi: '番狂わせ', desc: '高いほど、関係のある相手に「らしくない行動」（嫉妬しない人の嫉妬・強引な人の照れ など）をとる人が増え、それを見た相手が動揺したり、ときめいたりする。勝負のまぐれも増える' },
    { id: 'romance', label: '恋愛の起こりやすさ', min: 0, max: 100, def: 50, lo: '起きにくい', hi: '起きやすい' },
    { id: 'strife', label: '争いの起こりやすさ', min: 0, max: 100, def: 50, lo: '穏やか', hi: '荒れる' },
    { id: 'incident', label: 'ハプニングの頻度', min: 0, max: 100, def: 60, lo: 'たまに', hi: '毎回', desc: '天候・物資・追加ルールなど、全員に降りかかる出来事' },
    { id: 'tieEv', label: '関係性イベント', type: 'select', def: 'on', options: [{ v: 'on', label: '出す' }, { v: 'off', label: '出さない（関係は初期値と恋人の扱いだけに使う）' }], desc: '上司と部下・恩人・夫婦など、関係ごとの専用の場面' }
  ];
  /* r18:begin */
  /* 夜の起こりやすさ（R18版だけ。2026-10-29 担当MI。利用者の指示「恋愛の起こりやすさだけでなく、夜の起こりやすさも環境でできるように」）：
     倍率は pos.js の HK.Pos.nightK（50 で 1・100 で 1.7・0 で 0）。性欲＋衝動性＋状況×理性（HK.Pos.sexDrive）・エンジンの体の出来事の重み・物語型の箱庭の夜の見込みに掛ける。
     r18：全年齢モードでは欄を出さない（ui.js の genv・view.js の結果の札）。sparse：指定が無ければ住人の env に入れない（古い記録・全年齢モードの結果は既定 50 として読む。指紋も変えない）。
     all＋show：物語型の箱庭のうち住人どうしの夜がある箱庭（NIGHT_SOLO）にも出す。R18が中心の箱庭（HK.State.R18_CORE）には出さない（条件の夜なので効かせない） */
  /* 媚薬ロッカー（locker）は、この箱庭の環境値に同じ id の night を持つので（solo-locker.js。全年齢でも出すため）、ここには入れない（2026-10-30 担当LK） */
  var NIGHT_SOLO = { ship: 1, jashin: 1, yakata: 1, saimin: 1, jinro: 1 };
  HK.GLOBAL_ENV.splice(2, 0, {
    id: 'night', label: '夜の起こりやすさ', min: 0, max: 100, def: 50, lo: '起きにくい', hi: '起きやすい', r18: 1, sparse: 1, all: 1,
    show: function (scen) { return !!scen && !(HK.State && HK.State.R18_CORE && HK.State.R18_CORE[scen.id]) && (!scen.solo || !!NIGHT_SOLO[scen.id]); },
    desc: '性欲・衝動性・理性で決まる、住人どうしの夜（エッチの場面）の起こりやすさ全体を増減する（50 でそのまま、100 で 1.7 倍ほど）。0 にすると住人どうしの合意の夜は起きない（出られない部屋の条件の夜・合意のない展開・モブとの夜は除く。R18 が中心の箱庭は題材なので効かない）。恋愛の起こりやすさとは別で、恋愛 0・夜 100 なら、恋人にはならずに体だけの夜が増える'
  });
  /* r18:end */
  /* 複数の恋人（なし／あり／秘密。poly.js） */
  if (HK.Poly && HK.Poly.ENV) HK.GLOBAL_ENV.push(HK.Poly.ENV);
  /* モブへの呼びかけ（台詞の中でモブを呼ぶとき。mob.js の HK.Mob.addr・tone-plus.js の V.mobAddr）。all：一人用・物語型の箱庭にも出す */
  HK.GLOBAL_ENV.push({ id: 'mobYou', label: 'モブへの呼びかけ', type: 'select', def: 'you', all: 1, options: [{ v: 'you', label: '二人称で（あなた・きみ など、話し手の二人称）' }, { v: 'name', label: '名前で（名前のあるモブだけ。「佐伯さん」のように短く）' }], desc: '住人がモブ（客・施術者・略奪者・獲物など、住人でない人）に話しかける台詞の呼び方。地の文はモブの名前のまま' });

  function R(ctx, a, b) { return ctx.R(a, b); }
  /* 何をめぐって・何を、が分かるように、箱庭ごとの話題を添える */
  var TOPIC = {
    island: { why: ['火の番の順番', '魚の分け方', '寝床の場所', '水の使い方', '拠点の屋根の直し方'], good: ['火起こしの手際', '魚の捌き方', '罠の仕掛け方', '寝床の作り方'] },
    whiteroom: { why: ['条件の解釈', 'ベッドを誰が使うか', '差し入れの分け方', '扉の調べ方'], good: ['落ち着いた判断', '紙の条件の読み解き方', '気遣い'] },
    zombie: { why: ['進む道', '物資の分け方', '見張りの順番', '誰を信用するか'], good: ['判断の速さ', '武器の扱い', '物資の見つけ方'] },
    classroom: { why: ['文化祭の出し物', '掃除のやり方', '席替えのくじ', 'ノートの貸し借り'], good: ['ノートのまとめ方', '字のきれいさ', '発表の上手さ'] },
    goukon: { why: ['店の選び方', '飲み物の注文', '席の並び'], good: ['服のセンス', '話の聞き方', '笑い方'] },
    _: { why: ['やり方', '段取り', 'ささいなこと'], good: ['気配り', '手際', '笑顔'] }
  };
  function topic(ctx, k) { var T = TOPIC[ctx.scen.id] || TOPIC._; return ctx.pick(T[k]); }
  HK.eventTopic = topic;
  function lv(c, k) { return HK.fdesc(c, k); }

  HK.COMMON = [
    {
      id: 'talk', cat: 'bond', scope: 'pair',
      w: function (ctx, a, b) { return 0.5 + a.tr.warmth * 0.8 + Math.max(0, R(ctx, a, b).aff) / 120; },
      run: function (ctx, a, b) {
        ctx.mod2(a, b, { aff: 5, trust: 3 }, { aff: 4 + b.tr.fc * 3, trust: 2 });
        return {
          text: ctx.t(ctx.pick(['{a}は{b}に他愛ない話を振った。思ったより会話が続いた。', '{a}と{b}はしばらく並んで話していた。内容はたぶん、どうでもいいことだった。', '{a}が何気なく口にした一言に、{b}が少し笑った。']), a, b),
          why: a.name + 'の人懐こさ（NP・FC）'
        };
      }
    },
    {
      id: 'tease', cat: 'bond', scope: 'pair',
      /* からかうのはFC（とCP）。AC（気にしやすさ）が高い人はまず自分からはからかわない */
      w: function (ctx, a, b) { return (a.tr.fc * 0.9 + a.tr.cp * 0.3 + (R(ctx, a, b).aff > 15 ? 0.3 : 0)) * (1.2 - a.tr.ac); },
      run: function (ctx, a, b) {
        if (b.tr.ac > 0.6 || b.tr.cp > 0.7) {
          ctx.mod2(a, b, { aff: 2 }, { ten: 10, aff: -4 });
          return { cat: 'conflict', text: ctx.t('{a}が{b}をからかった。{b}は笑ってみせたが、目が笑っていなかった。', a, b), why: a.name + 'のFC（' + Math.round(a.eg.FC) + '）の軽口が、' + b.name + 'の' + (b.tr.ac > 0.6 ? 'AC（気にしやすさ）' : 'CP（プライド）') + 'に刺さった' };
        }
        ctx.mod2(a, b, { aff: 5, att: 3 }, { aff: 6, att: 3 });
        return { text: ctx.t('{a}が{b}をからかい、{b}もすぐに言い返した。軽口の応酬が続いた。', a, b), why: '二人ともAC低めで、軽口を気にしない' };
      }
    },
    {
      id: 'care', cat: 'help', scope: 'pair',
      w: function (ctx, a, b) { return a.tr.np * (0.6 + b.stress / 60 + (100 - b.hp) / 80); },
      run: function (ctx, a, b) {
        ctx.mod(b, a, { aff: 7, trust: 8, att: b.tr.ac * 4 });
        ctx.mod(a, b, { aff: 3 });
        ctx.stress(b, -12);
        return {
          text: ctx.t(ctx.pick(['{a}は{b}の顔色の悪さに気づき、黙って隣に座った。', '{a}が{b}の分の飲み物を用意していた。{b}は小さく礼を言った。', '「無理してない？｜無理をしていないか｜無理をしていませんか？」と{a}が訊いた。{b}は答えるまでに少し時間がかかった。']), a, b),
          why: a.name + 'の' + lv(a, 'NP') + (b.stress > 40 ? '、' + b.name + 'の疲弊' : '')
        };
      }
    },
    {
      id: 'lecture', label: '相手のやり方に口を出す', cat: 'conflict', scope: 'pair',
      w: function (ctx, a, b) { return a.tr.cp * (1 - a.tr.np * 0.5) * (0.6 + b.tr.fc * 0.6); },
      run: function (ctx, a, b) {
        if (b.tr.ac > b.tr.fc) {
          ctx.mod2(a, b, { trust: 3 }, { trust: 5, aff: -4, ten: 6 });
          ctx.stress(b, 8);
          return { text: ctx.t('{a}が{b}の' + topic(ctx, 'why') + 'に口を出した。{b}は反論せずに従った。', a, b), why: a.name + 'の' + lv(a, 'CP') + 'に、' + b.name + 'の' + lv(b, 'AC') + 'が引いた' };
        }
        ctx.mod2(a, b, { ten: 10, aff: -4 }, { ten: 14, aff: -7 });
        return { text: ctx.t('{a}が' + topic(ctx, 'why') + 'について正論を言うと、{b}が噛みついた。「いちいちうるさい｜いちいちうるさいな｜いちいち、うるさいです」', a, b), why: a.name + 'のCPと' + b.name + 'のFC（' + Math.round(b.eg.FC) + '）が衝突' };
      }
    },
    {
      id: 'confide', cat: 'bond', scope: 'pair',
      when: function (ctx, a, b) { return R(ctx, a, b).trust > 12 || a.stress > 45; },
      w: function (ctx, a, b) { return (a.tr.ac * 0.5 + a.tr.honesty * 0.4) * (0.5 + a.stress / 70) + R(ctx, a, b).trust / 150; },
      run: function (ctx, a, b) {
        if (b.tr.np > 0.55) {
          ctx.mod2(a, b, { aff: 9, trust: 10, att: 3 }, { aff: 6, trust: 6 });
          ctx.stress(a, -18);
          return { text: ctx.t('{a}がぽつりと弱音をこぼした。{b}は茶化さずに最後まで聞いた。', a, b), why: a.name + 'の弱音を' + b.name + 'の' + lv(b, 'NP') + 'が受け止めた' };
        }
        if (b.tr.cold > 0.6) {
          ctx.mod2(a, b, { aff: -6, trust: -8 }, { trust: 2 });
          return { cat: 'conflict', text: ctx.t('{a}が打ち明けた悩みに、{b}は「で、どうしたいの｜で、どうしたいんだ｜で、どうしたいんですか」とだけ返した。{a}は話すのをやめた。', a, b), why: b.name + 'のドライさ（A高・NP低）が' + a.name + 'の求めるものと噛み合わなかった' };
        }
        ctx.mod2(a, b, { trust: 5, aff: 3 }, { trust: 3 });
        return { text: ctx.t('{a}は{b}に少しだけ本音を話した。{b}は曖昧に頷いた。', a, b), why: '打ち明けたい' + a.name + 'と、受け止め方に迷う' + b.name };
      }
    },
    {
      id: 'jealous', cat: 'conflict', scope: 'pair',
      /* 恋人が複数いるとき、同じ人の恋人どうし・自分の恋人どうしの近さには嫉妬しない（obsess-kit.js の coLove） */
      when: function (ctx, a, b) { var c = ctx.crush(a, 50); return c && c !== b && c.alive && (!HK.State || HK.State.here(c)) && R(ctx, c, b).aff + R(ctx, c, b).att > 45 && (!HK.Obsess || (HK.Obsess.jealOk(ctx, a, c) && !(HK.Obsess.coLove && HK.Obsess.coLove(ctx, a, c, b)))); },
      w: function (ctx, a) { return a.tr.jealous * 1.6; },
      run: function (ctx, a, b) {
        var c = ctx.crush(a, 50);
        ctx.mod(a, b, { ten: 16, aff: -10 });
        ctx.mod(a, c, { att: 4 });
        ctx.pair(a, b).jealous++;
        ctx.pair(a, c).jealous++;
        ctx.stress(a, 10);
        if (HK.Obsess) HK.Obsess.feed(ctx, a, c, 6);
        return {
          with: [c],
          text: ctx.t(ctx.pick(['{a}は、{c}と親しげに話す{b}から目を逸らせなかった。', '{c}の隣にいるのが自分ではなく{b}だという事実が、{a}を静かに苛立たせた。']), a, b, c),
          why: a.name + 'の嫉妬・執着（' + Math.round(a.tr.jealous * 100) + '）。' + c.name + 'への想いが' + b.name + 'への敵意に変わった'
        };
      }
    },
    {
      id: 'compliment', label: '相手のよいところを褒める', cat: 'romance', scope: 'pair',
      w: function (ctx, a, b) { return (a.tr.np * 0.4 + a.tr.fc * 0.4) * (0.4 + R(ctx, a, b).att / 60); },
      run: function (ctx, a, b) {
        var shy = b.tr.ac > 0.6;
        ctx.mod2(a, b, { att: 4, aff: 2 }, { att: shy ? 8 : 5, aff: 4 });
        return {
          text: ctx.t(shy ? '{a}に' + topic(ctx, 'good') + 'を褒められて、{b}は返事をし損ねて俯いた。' : '{a}が{b}の' + topic(ctx, 'good') + 'を褒めた。{b}は「知ってる｜知っている｜知っています」と笑った。', a, b),
          why: a.name + 'の素直さ（NP・FC）' + (shy ? '、' + b.name + 'のAC高（褒められ慣れていない）' : '')
        };
      }
    },
    {
      id: 'glance', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { return R(ctx, a, b).att > 22; },
      w: function (ctx, a, b) { return (a.tr.ac * 0.7 + 0.2) * R(ctx, a, b).att / 40; },
      run: function (ctx, a, b) {
        ctx.mod(a, b, { att: 6 });
        var noticed = ctx.rng() < b.tr.a * 0.7;
        if (noticed) ctx.mod(b, a, { att: 4 });
        return {
          text: ctx.t(noticed ? '{a}は気づけば{b}を目で追っていた。{b}がそれに気づいて、視線が一瞬だけぶつかった。' : '{a}は気づけば{b}を目で追っていた。{b}は気づいていない。', a, b),
          why: a.name + 'のAC（' + Math.round(a.eg.AC) + '）：想いを行動にせず内側で育てる' + (noticed ? '。' + b.name + 'のAが視線を拾った' : '')
        };
      }
    },
    {
      id: 'confess', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { var r = R(ctx, a, b); return r.aff > 45 && r.att > 45 && !ctx.pair(a, b).confessed[a.i] && !ctx.pair(a, b).couple && (!HK.Poly || HK.Poly.canTry(ctx, a, b)); },
      w: function (ctx, a) { return 0.4 + a.tr.honesty * 1.4 + a.stress / 120; },
      run: function (ctx, a, b) {
        var p = ctx.pair(a, b), rb = R(ctx, b, a);
        p.confessed[a.i] = true;
        if (rb.aff > 32 && rb.att > 36) {
          p.couple = true;
          ctx.mod2(a, b, { aff: 18, att: 12, trust: 12, ten: -10 }, { aff: 18, att: 14, trust: 10, ten: -10 });
          return { mag: 30, text: ctx.t('{a}が{b}に想いを告げた。{b}は少し驚いて、それから頷いた。', a, b), why: a.name + 'の本音の出やすさ（FC高・AC低）。' + b.name + 'の側にも下地があった（好意' + Math.round(rb.aff) + '）' };
        }
        p.rejected = a.i;
        ctx.mod2(a, b, { ten: 14, att: -8 }, { ten: 10, aff: -2 });
        ctx.stress(a, 30);
        return { mag: 20, text: ctx.t('{a}が{b}に想いを告げた。{b}は申し訳なさそうに首を振った。', a, b), why: b.name + 'の好意（' + Math.round(rb.aff) + '）・惹かれ（' + Math.round(rb.att) + '）がまだ足りなかった' };
      }
    },
    {
      id: 'brood', cat: 'solo', scope: 'solo',
      w: function (ctx, a) { return 0.3 + a.tr.a * 0.4 + (1 - a.tr.warmth) * 0.5 + a.stress / 120; },
      run: function (ctx, a) {
        ctx.stress(a, -10);
        var c = ctx.crush(a, 55);
        return {
          text: c ? ctx.t('{a}はひとりになって、{c}のことを考えていた。', a, null, c) : ctx.zb && HK.ZB && HK.ZB.soloFlavor ? HK.ZB.soloFlavor(ctx, a) : ctx.t(ctx.pick(['{a}は輪から少し離れて、状況を整理していた。', '{a}はしばらく誰とも話さなかった。']), a),
          why: a.name + 'のA（' + Math.round(a.eg.A) + '）／人懐こさ低め'
        };
      }
    },
    {
      id: 'argue', cat: 'conflict', scope: 'pair',
      when: function (ctx, a, b) { return R(ctx, a, b).ten > 18; },
      w: function (ctx, a, b) { return R(ctx, a, b).ten / 50 + a.tr.aggr * 0.5; },
      run: function (ctx, a, b) {
        var both = a.tr.fc > 0.55 && b.tr.fc > 0.55 && R(ctx, a, b).aff > 20;
        if (both) {
          ctx.mod2(a, b, { ten: 6, aff: 5, att: 5 }, { ten: 6, aff: 5, att: 5 });
          return { text: ctx.t('{a}と{b}が大声で言い合った。終わる頃には二人とも少し笑っていた。', a, b), why: '二人ともFC高。ぶつかるほど距離が縮むタイプ' };
        }
        ctx.mod2(a, b, { ten: 14, aff: -8, trust: -4 }, { ten: 14, aff: -8, trust: -4 });
        return { text: ctx.t(ctx.pick(['{a}と{b}は' + topic(ctx, 'why') + 'をめぐって口論になった。どちらも引かなかった。', topic(ctx, 'why') + 'をめぐる{a}の一言をきっかけに、{b}との間の空気が一気に冷えた。']), a, b), why: '積もった緊張（' + Math.round(R(ctx, a, b).ten) + '）と' + a.name + 'の攻撃性' };
      }
    },
    {
      id: 'apologize', label: '言い争いのあと先に謝る', cat: 'help', scope: 'pair',
      when: function (ctx, a, b) { return R(ctx, a, b).ten > 28; },
      w: function (ctx, a) { return a.tr.ac * 0.6 + a.tr.np * 0.4 + a.tr.a * 0.2; },
      run: function (ctx, a, b) {
        if (b.tr.cp > 0.7 && b.tr.np < 0.4) {
          ctx.mod2(a, b, { ten: -4 }, { ten: -2, trust: 2 });
          return { text: ctx.t('{a}が先に謝った。{b}は「最初からそうすればいいじゃん｜最初からそうすればいい｜最初からそうすればいいじゃないですか」とだけ言った。', a, b), why: b.name + 'のCP高・NP低：謝罪を当然として受け取る' };
        }
        ctx.mod2(a, b, { ten: -14, trust: 5 }, { ten: -16, trust: 8, aff: 5 });
        return { text: ctx.t('{a}が{b}に頭を下げた。{b}も「こっちも悪かった｜こちらも悪かった｜こちらこそ、すみませんでした」と返した。', a, b), why: a.name + 'のAC・NP（関係を修復したがる）' };
      }
    },
    {
      id: 'secret', cat: 'bond', scope: 'pair',
      when: function (ctx, a, b) { return R(ctx, a, b).trust > 30 && !ctx.pair(a, b).secret; },
      w: function (ctx, a, b) { return 0.3 + a.tr.honesty * 0.5 + R(ctx, a, b).trust / 100; },
      run: function (ctx, a, b) {
        ctx.pair(a, b).secret = true;
        ctx.mod2(a, b, { trust: 14, aff: 6 }, { trust: 12, aff: 6, att: 3 });
        return { mag: 15, text: ctx.t('{a}は{b}にだけ、誰にも言っていないことを話した。{b}はそれを誰にも言わないと約束した。', a, b), why: '積み上がった信頼（' + Math.round(R(ctx, a, b).trust) + '）' };
      }
    },
    {
      id: 'ignore', cat: 'conflict', scope: 'pair',
      w: function (ctx, a, b) { return a.tr.cold * 0.5 * (R(ctx, a, b).aff < 0 ? 1.6 : 0.5) * (1.15 - a.tr.ac * 0.6) * (1.1 - a.tr.np * 0.6); },
      run: function (ctx, a, b) {
        ctx.mod(b, a, { aff: -6, ten: 8 + b.tr.ac * 6 });
        return { text: ctx.t('{b}が話しかけても、{a}はほとんど反応しなかった。', a, b), why: a.name + 'のドライさ（A高・NP低）' };
      }
    },
    {
      id: 'lean', cat: 'bond', scope: 'pair',
      w: function (ctx, a, b) { return a.tr.ac * 0.7 * (0.3 + b.tr.lead) * (0.5 + a.stress / 80); },
      run: function (ctx, a, b) {
        ctx.mod2(a, b, { trust: 10, aff: 5 }, { trust: 2, aff: b.tr.np * 8 });
        return { text: ctx.t('{a}は判断を{b}に任せた。{b}はそれを当然のように引き受けた。', a, b), why: a.name + 'のAC（' + Math.round(a.eg.AC) + '）と' + b.name + 'の主導性' };
      }
    },
    {
      id: 'take_charge', cat: 'conflict', scope: 'solo',
      when: function (ctx) { return ctx.present().length >= 3; },
      /* 主導性がそれなりに高い人が場を仕切る。低い人も、追い詰められるとまれに（らしくない行動として）仕切り出す */
      w: function (ctx, a) { return Math.max(0.015 + a.stress / 900, (a.tr.lead - 0.45) * 1.8); },
      run: function (ctx, a) {
        var pushed = [], followed = [];
        ctx.others(a).forEach(function (o) {
          if (o.tr.fc > 0.6 || o.tr.cp > 0.65) { ctx.mod(o, a, { ten: 8, aff: -3 }); pushed.push(o.name); }
          else { ctx.mod(o, a, { trust: 6 }); followed.push(o.name); }
        });
        return {
          text: ctx.t('{a}が場を仕切り始めた。', a) + (followed.length ? followed.join('・') + 'は従い、' : '') + (pushed.length ? pushed.join('・') + 'は反発した。' : '誰も異を唱えなかった。'),
          why: a.name + 'の主導性（CP・A高、AC低）'
        };
      }
    },
    {
      id: 'lighten', cat: 'bond', scope: 'solo',
      when: function (ctx) { return ctx.present().length >= 3; },
      w: function (ctx, a) { return a.tr.fc * 0.6 + a.tr.np * 0.3 - 0.1; },
      run: function (ctx, a) {
        ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: 3 + o.tr.fc * 3 }); ctx.stress(o, -6); });
        return { text: ctx.t('{a}の冗談で場の空気がほどけた。', a), why: a.name + 'のFC（' + Math.round(a.eg.FC) + '）' };
      }
    },
    {
      id: 'touch', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { return R(ctx, a, b).att > 30; },
      w: function (ctx, a, b) { return a.tr.impulse * 0.6 * R(ctx, a, b).att / 45; },
      run: function (ctx, a, b) {
        var rb = R(ctx, b, a);
        if (rb.att < 15 && b.tr.cp > 0.55) {
          ctx.mod2(a, b, { att: 2 }, { ten: 12, aff: -6 });
          return { text: ctx.t('{a}の手が{b}の肩に触れた。{b}は露骨に身を引いた。', a, b), why: a.name + 'の衝動性に対し、' + b.name + 'はその気がなかった' };
        }
        ctx.mod2(a, b, { att: 7 }, { att: 9, aff: 3 });
        return { text: ctx.t('距離が近い。{a}の指先が{b}の手にかすかに触れ、どちらも離さなかった。', a, b), why: a.name + 'の衝動性（FC高・A低）と、' + b.name + 'の側の惹かれ（' + Math.round(rb.att) + '）' };
      }
    },
    {
      id: 'misread', label: '何気ない言葉を悪い意味に受け取る', cat: 'conflict', scope: 'pair', noOdd: true,
      w: function () { return 0.12; },
      run: function (ctx, a, b) {
        ctx.mod2(a, b, { ten: 9, aff: -5 }, { ten: 7, aff: -3 });
        return { text: ctx.t(topic(ctx, 'why') + 'についての{b}の言葉を、{a}は悪い意味に受け取った。訂正する機会はなかった。', a, b), why: '偶然のすれ違い' };
      }
    },
    {
      id: 'defend', cat: 'help', scope: 'pair',
      when: function (ctx, a, b) {
        var bad = ctx.others(b).filter(function (o) { return o !== a && R(ctx, o, b).ten > 40; });
        return bad.length > 0 && R(ctx, a, b).aff > 15;
      },
      w: function (ctx, a) { return a.tr.np * 0.6 + a.tr.cp * 0.4; },
      run: function (ctx, a, b) {
        var c = ctx.others(b).filter(function (o) { return o !== a && R(ctx, o, b).ten > 40; })[0];
        ctx.mod(b, a, { aff: 10, trust: 10, att: 4 });
        ctx.mod2(a, c, { ten: 10 }, { ten: 10, aff: -6 });
        return { with: [c], text: ctx.t('{c}が{b}に食ってかかったとき、{a}が二人の間に割って入った。', a, b, c), why: a.name + 'のNPとCP（守るために前に出る）' };
      }
    }
  ];

  HK.buildPool = function (scen) {
    var ex = scen.exclude || [];
    var pool = HK.COMMON.filter(function (e) { return ex.indexOf(e.id) < 0; });
    return pool.concat(scen.events || [], ((HK.MINI && HK.MINI[scen.id]) || []).filter(function (e) { return ex.indexOf(e.id) < 0; }));
  };
})();
