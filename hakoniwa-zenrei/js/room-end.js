/* 箱庭シミュレーター: 出られない部屋 ― 結末の締め（両ビルド共通。2026-10-28 担当JB：room-know.js から移して多様化）
   部屋の外へ出た人・残った人を、記録の最後の「結末」の段にまとめる。
   結末の条件：全員が部屋を出る／一人しか出られない部屋で誰かが出る／残りが一人になる／限界の時刻が来る（scenario-room.js の end）。
   ■ 締めの文は、次の組み合わせで作る（同じ顔ぶれでも、シードが違えば型が変わる）
     出方      ：全員一緒に（扉が一度だけ開く）／条件を満たした組から順に／一人だけ先に（残りはあとで）／取り残された人がいる／自分から残った人がいる／一人しか出られない
     出る様子  ：我先に（関係が薄い）／手を取って（恋人・親友）／無言で（敵対）／ふつう。一緒に出た人（全員で出られる部屋）
     外の情景  ：扉が消える・夜景・駅・雨上がり・公園・屋上・朝の光 など
     関係の層  ：恋人・夫婦／体だけ・一夜（R18。全年齢では友人・気まずさの型）／三人（room-trio.js の後日談）／友人／敵対・愛憎／無関心／最後の三人（R18。room-last3-r18.js）
     巻き込まれなかった人：三人の場面や夜に関わらなかった人の一文（「〇〇は巻き込まれなかったことにホッとしつつ、友人の△△との約束場所へ向かっていった」）
   ■ 扉が開いたことは、出口ごとの区切りの行「条件を満たしたので扉が開いた。」で示す（scenario-room.js の doorFlush。2026-10-28 担当KJ）。
     まだ部屋に人が残るうちに先に出た組は、区切りの行のあとに組ごとの「外に出た後」（RE.groupEnd）を書き、結末の段ではその組（told）の出る様子・関係の層を書き直さない
   ■ 1つの結末は 3〜6 文（三人の後日談を含めて数え、多いときは二つ目からの関係の層・情景・一人だけ先に出た文・巻き込まれなかった人・一緒に出た人の文の順に省く。情景は先に1文の型に縮める）
   ■ 環境値「登場しない住人の名前を出す」（outsideNames：no 出さない／yes 出す。既定は出さない）：
     名簿にいて今回は参加していない住人のうち、参加者と友人・親友・幼馴染・相棒・恋人・夫婦・許嫁・家族の関係がある人を、動かす前に入力の outside に写す
     （HK.simulate を包む。名簿は HK.UI.state()。{ i: 参加者の番号, k: lover|friend|family, l: 関係の呼び名, n: 名前（出すときだけ） }）。
     出すときは「友人の△△」、出さないときは「友人」と書く。関係の人がいなければ「ひとりで夜景を眺めながら帰った」などの型。
   ■ 台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。R18 の文（体の関係の層）は r18 の印の中 */
(function () {
  'use strict';
  var HK = window.HK, RA = HK.RoomAPI;
  if (!RA || !RA.scen) return;
  var scen = RA.scen, RE = HK.RoomEnd = HK.RoomEnd || {};
  function L(s) { return s.split('|'); }
  function nm(list) { list = list.map(function (c) { return c.name; }); return list.length > 6 ? list.slice(0, 6).join('・') + 'ほか' + (list.length - 6) + '人' : list.join('・'); }
  function fill(t, o) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  function pairsOf(g) { var o = []; for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) o.push([g[i], g[j]]); return o; }

  /* ---------- 環境値：登場しない住人の名前を出す ---------- */
  scen.env.push({ id: 'outsideNames', label: '登場しない住人の名前を出す', type: 'select', def: 'no', options: [
    { v: 'no', label: '出さない' },
    { v: 'yes', label: '出す（結末の「その後」に、参加していない住人を友人・恋人・家族として出す）' }
  ], desc: '名簿にいて今回は参加していない住人のうち、参加者と友人・親友・幼馴染・相棒・恋人・夫婦・家族の関係がある人の名前を、結末の「その後」に出します（例：「〇〇は、友人の△△との約束場所へ向かっていった」）。出さないときは「友人との約束場所へ」のように名前なしで書きます' });

  /* ---------- 名簿から、参加していない住人との関係を写す ---------- */
  /* 関係の id → [種類, 呼び名, 優先（小さいほど先）] */
  var OUT_T = {
    spouse: ['lover', '伴侶', 0], lover: ['lover', '恋人', 1], fiance: ['lover', '許嫁', 2],
    best: ['friend', '親友', 3], buddy: ['friend', '相棒', 4], childhood: ['friend', '幼馴染', 5], friend: ['friend', '友人', 6],
    sibclose: ['family', 'きょうだい', 7], sibling: ['family', 'きょうだい', 7], sibprot: ['family', 'きょうだい', 7],
    parent: ['family', '家族', 8], pparent: ['family', '家族', 8], stepsib: ['family', 'きょうだい', 9], relative: ['family', '親族', 9]
  };
  function outsideOf(input) {
    var UI = HK.UI, S = UI && UI.state ? UI.state() : null;
    if (!S || !Array.isArray(S.chars) || !Array.isArray(S.ties) || !input || !Array.isArray(input.chars)) return null;
    var byName = {}, dup = {}, byId = {};
    S.chars.forEach(function (c) { if (!c || !c.name) return; if (byName[c.name]) dup[c.name] = 1; byName[c.name] = c; byId[c.id] = c; });
    var idx = {};
    input.chars.forEach(function (c, i) { var r = c && byName[c.name]; if (r && !dup[c.name]) idx[r.id] = i; });
    var yes = !!(input.env && input.env.outsideNames === 'yes'), out = [];
    S.ties.forEach(function (t) {
      var d = t && OUT_T[t.type];
      if (!d || t.cold === 'separated' || t.cold === 'divorced') return;
      [[t.a, t.b], [t.b, t.a]].forEach(function (p) {
        var o = byId[p[1]];
        if (idx[p[0]] == null || idx[p[1]] != null || !o || !o.name || dup[o.name]) return;
        if (input.chars.some(function (c) { return c && c.name === o.name; })) return;
        out.push({ i: idx[p[0]], k: d[0], l: d[1], p: d[2], n: yes ? o.name : '' });
      });
    });
    out.sort(function (x, y) { return x.i - y.i || x.p - y.p; });
    var cnt = {};
    return out.filter(function (o) { cnt[o.i] = (cnt[o.i] || 0) + 1; return cnt[o.i] <= 2; }).map(function (o) { var r = { i: o.i, k: o.k, l: o.l }; if (o.n) r.n = o.n; return r; });
  }
  RE.outsideOf = outsideOf;
  /* 動かす前に、入力に写す（記録の入力に残るので、あとで開いても同じ。名簿が無いとき・すでに outside があるときは何もしない） */
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (orig) {
    return function (input) {
      if (input && input.scenId === 'whiteroom' && input.outside === undefined) {
        try { var o = outsideOf(input); if (o && o.length) input.outside = o; } catch (e) { /* 名簿が読めなくても動かす */ }
      }
      return orig.apply(this, arguments);
    };
  });
  /* c の外の関係（優先の順）。種類を絞るときは kind */
  function outs(ctx, c, kind) { return ((ctx.input && ctx.input.outside) || []).filter(function (o) { return o && o.i === c.i && (!kind || o.k === kind); }); }
  /* 「友人の△△」（名前を出すとき）／「友人」 */
  function roName(ctx, o) { return o.n && ctx.env.outsideNames === 'yes' ? o.l + 'の' + o.n : o.l; }

  /* ---------- 文 ---------- */
  /* 扉が開く（{t}＝時刻）。扉が開いたことは、出口ごとに区切りの行「条件を満たしたので扉が開いた。」（scenario-room.js の doorFlush）で示すので、
     結末の段では、区切りの行の無い出方（出た記録の無いまま部屋を出た人がいる）のときだけ使う */
  var DOOR = L('{t}、条件を満たしたので扉が開いた。|{t}、扉の紙の数字がそろい、鍵の外れる音がした。|{t}、白い扉が、何の前触れもなく内側へ開いた。|{t}、扉の紙の文字がすっと薄れ、鍵が外れた。|{t}、扉の向こうから、冷たい風が細く吹きこんできた。');
  /* 条件「誰かを殺す（気絶させる）」で開いたあとの、出ていく前の間（扉が開いたことは書かない） */
  var KILL_PAUSE = L('誰も、すぐには動けなかった。|開いた扉の向こうから、場違いなほど明るい光が差しこんでいた。|しばらくのあいだ、誰も扉に近づこうとしなかった。');
  /* 出る様子（{G}＝出た人の名前、{a}{b}＝手を取る二人・先に出る二人、{R}＝ほかの人） */
  var EXIT = {
    rush: L('{G}が我先にと外に飛び出した。|{G}は顔も見合わせず、先を争うように外へ出た。|{G}は扉が開ききるのも待たずに、廊下へ駆け出した。|{G}は、誰が先かも決めないまま、押し合うようにして外へ出た。'),
    hand2: L('{a}は{b}の手を取って、外へ出た。|{a}と{b}は手を繋いだまま、一歩ずつ外へ出た。|{b}が差し出した手を{a}が握り返し、二人は並んで扉を抜けた。|{a}は{b}の肩を抱くようにして、ゆっくり外へ出た。'),
    handG: L('{a}は{b}の手を取って扉を抜け、{R}もそのあとに続いた。|{R}が先に出て、{a}と{b}は手を繋いだまま最後に扉を抜けた。|{a}と{b}が手を繋いで先に出ると、{R}も黙ってあとに続いた。'),
    silent: L('{G}は互いに目を合わせないまま、黙って外へ出た。|誰も口をきかなかった。{G}は、一度も振り返らずに外へ出た。|{G}は、肩がぶつからないように間を空けて、無言で外へ出た。'),
    silent2: L('{a}が先に出て、{b}は少し間を置いてから、無言であとに続いた。|{a}と{b}は、どちらも相手を見ないまま、黙って扉を抜けた。|{a}は{b}より先に出ようとして、扉の前で肩がぶつかった。どちらも、何も言わなかった。'),
    calm: L('{G}は顔を見合わせてから、外へ出た。|{G}は、白い部屋を一度だけ振り返ってから扉を抜けた。|{G}は、拍子抜けするほどあっさりと外へ出た。|{G}は、誰からともなく小さく笑って、外へ出た。')
  };
  /* 何もしていないのに一緒に出た人（全員で出られる部屋。{L}＝一緒に出た人、{G}＝扉を開けた人）。
     申し訳なく思った・気にしなかった などの気持ちは、ここには書かず結末の欄（fateNote。scenario-room.js の alongNote）に書く */
  var ALONG = L('{L}も、{G}が開けた扉から、一緒に外へ出た。|{L}も開いた扉から、そっとあとに続いた。|{L}も、開いた扉から遅れずに外へ出た。|{L}は置いていかれまいと、慌ててあとを追った。|{L}は少し遅れて、肩をすくめながら扉を抜けた。');
  /* 条件を満たした組から順に出た（{SEQ}＝「3時間後に〇〇と△△が、7時間後に××が」） */
  var ORDER = L('扉は、条件を満たした組ごとに開いた。{SEQ}外へ出た。|{SEQ}、それぞれ外へ出た。|一組ずつ、扉は開いては閉じた。{SEQ}白い部屋をあとにした。|{SEQ}、順に外へ出ていった。');
  var ORDER_MANY = L('扉は、条件を満たした組ごとに何度も開いた。最後に外へ出たのは、{G}だった。|一組、また一組と、扉の向こうへ消えていった。最後に出たのは{G}だった。');
  /* 一人だけ先に出て、残った人があとから出た（{a}＝先に出た人、{b}＝あとから出た人） */
  var FIRST = L('{a}だけが先に外へ出て、{b}はあとから出てきた。|先に出た{a}は、扉の外で{b}が出てくるのを待っていた。|{b}は一度は部屋に残ったが、{a}に遅れて外へ出た。');
  /* 全員が出たあとの外の情景（1〜2文） */
  var SCENE = L('全員が外に出たところで、背後の扉は音もなく消えた。廊下の先には、見覚えのある街の夜景が広がっていた。|外の空気は、思っていたよりずっと冷たかった。振り返ると、白い部屋はもうどこにもなかった。|最後の一人が出ると、白い部屋の照明がひとりでに落ち、扉はただの壁に戻った。|扉の外は、見慣れた駅の裏通りだった。遠くで、終電の発車ベルが鳴っていた。|外は雨上がりで、濡れたアスファルトに街灯の光がにじんでいた。振り返った先に、扉はもうなかった。|廊下を抜けると、明け方の公園に出た。白い部屋のことは、夢だったと言われれば信じてしまいそうだった。|扉の向こうは、どこかのビルの屋上だった。夜風の中で、遠くの観覧車がゆっくり回っていた。|外に出ると、朝の光がまぶしかった。背後で扉の閉まる音がして、それきり何も聞こえなくなった。');
  /* 組ごとの「外に出た後」の情景（まだ部屋に人が残るときの、先に出た組。1文。groupEnd） */
  var SCENE_G = L('扉の外は、見慣れた駅の裏通りだった。|廊下を抜けると、明け方の公園に出た。|扉の向こうは、どこかのビルの屋上だった。夜風が、思ったより冷たかった。|外は雨上がりで、濡れたアスファルトに街灯の光がにじんでいた。|外に出ると、朝の光がまぶしかった。');
  /* 先に出て、一人が部屋に残った組の、外に出た人（{a}＝出た人、{b}＝残った人、{c}＝残った人が付き添う三人目の恋人） */
  var GO_LATER = L('外に出た{a}は、部屋に残った{b}のことが、帰り道のあいだずっと頭から離れなかった。|{a}は一人で外の空気を吸った。残ると決めた{b}の顔を思い出して、少しだけ笑った。|{a}は振り返らずに歩き出した。{b}とは、それきりになった。|{a}は外で{b}を待とうとして、やめた。{b}が自分で選んだことだった。');
  var GO_WAIT = L('{a}は扉の外の壁にもたれて、{b}と{c}が出てくるのを待つことにした。|外に出た{a}は、閉じた扉にそっと手を当てた。{b}と{c}なら、きっとすぐに出てくる。|{a}は外の廊下に座りこんで、{b}と{c}を待った。待つのは、少しも苦ではなかった。');
  /* 文が多いときの短い情景（1文） */
  var SCENE1 = L('背後で、扉が音もなく消えた。|白い部屋の話は、それで終わりになった。|振り返ると、扉のあった場所はただの壁になっていた。|外の空気は、思っていたよりずっと冷たかった。|廊下の先には、見覚えのある街の夜景が広がっていた。');
  /* 取り残された人がいる（{L}） */
  var SOME = L('扉は、それきり開かなくなった。白い部屋には{L}だけが残された。|外へ出た人たちの足音が遠ざかると、部屋はまた静かになった。{L}は閉じた扉の前に座りこんだ。|{L}がどれだけ扉を叩いても、返ってくる音はなかった。|扉が閉まる直前、{L}は何か言いかけて、やめた。|照明がひとつずつ落ちていき、{L}の影だけが白い壁に長く伸びた。');
  /* 誰も出られなかった（{t}・{L}） */
  var NONE = L('{t}。照明が最後の一段まで落ち、白い部屋は真っ暗になった。扉の紙の条件は、誰ひとり満たせなかった。{L}は暗闇の中で、互いの息づかいだけを数えていた。|{t}。扉は最後まで開かなかった。{L}は壁にもたれて、朝とも夜ともつかない白い光を黙って見上げていた。この部屋から出た人は、一人もいない。|{t}。時間切れを知らせるように、扉の紙の文字がすっと消えた。{L}は顔を見合わせたが、誰も何も言わなかった。白い部屋は、全員を閉じ込めたまま静まり返った。|{t}。扉の紙の文字は最後まで変わらなかった。{L}は白い部屋に閉じ込められたまま、限界の時刻を迎えた。|{t}。{L}の誰も、もう扉の方を見なくなっていた。白い部屋は、何事もなかったように静まり返っていた。');
  /* 一人しか出られない部屋（{a}＝出た人、{b}＝背中を押した人・押しのけられた人、{L}＝部屋に残った人） */
  var ONE = {
    sacrifice: L('{a}がくぐった扉は、二度と開かなかった。外の光の中で、{a}は何度も振り返った。|{a}は一人で外の世界に戻った。{b}に押された背中の感触が、いつまでも消えなかった。|外に出た{a}は、扉のあった場所の壁に額をつけた。向こう側で{b}が待っている気がした。|外に出た{a}は、一歩ごとに足が重くなった。最後に見た{b}は、笑って手を振っていた。|{a}は外の光の中で立ち尽くした。{b}が残ったのは自分のためだと、分かりすぎるほど分かっていた。'),
    grab: L('一人で外に出た{a}は、振り返らずに歩き出した。|{a}が抜け出したあと、扉は二度と開かなかった。{L}は閉じた扉を見つめたまま、長いあいだ動かなかった。|外の空気を吸った{a}は、一度だけ立ち止まった。それから、白い部屋のことは忘れたふりをして歩き出した。|{a}は外に出るなり、走り出した。背後で扉の閉まる音がしても、足を止めなかった。|{a}は一人で外に出た。白い部屋に残った{L}の声は、もう聞こえなかった。')
  };
  /* 一人で出た人のその後（{RO}＝外の関係の人。ある型は、その人がいるときだけ） */
  var ONE_AFTER = {
    sacrifice: L('{a}はそれから毎晩、{b}の名前を思い出してから眠った。|{a}は外で、白い部屋の場所を探し続けた。扉は、二度と見つからなかった。|{a}は、{b}がくれた時間を無駄にしないと決めた。決めたことだけが、{a}を前に進ませた。'),
    sacrificeO: L('{a}は{RO}に会うなり、子どものように泣いた。理由は、うまく話せなかった。|{a}は帰り道、{RO}に「ただいま」とだけ送った。それ以上は、まだ書けなかった。'),
    grab: L('{a}は、何事もなかったように日常へ戻った。夜中にふと目が覚める回数だけが、少し増えた。|{a}は、白い部屋のことを誰にも話さなかった。話せば、自分が何をしたかも話すことになる。|{a}は、閉じた扉の前で叫んでいた{b}の声を、聞かなかったことにした。'),
    grabO: L('{a}は{RO}との約束の時間に、少しだけ遅れて着いた。遅れた理由は、最後まで言わなかった。|{a}は{RO}の前で、いつもどおりに笑ってみせた。うまく笑えているかどうかは、分からなかった。')
  };
  /* 自分から残った人（{S}） */
  var STAYED = L('{S}は、扉が開いても外へ出なかった。自分で選んで、白い部屋に残った。|{S}は開いた扉を見送って、自分から部屋に残ることを選んだ。|{S}にとっては、外より白い部屋の方が居心地がよかったらしい。{S}は自分の意思で残った。|{S}は「もう少しだけ｜もう少しだけだ｜もう少しだけです」と言って、閉まっていく扉に背を向けた。|{S}は扉の前で一度だけ立ち止まり、それから部屋の奥へ戻っていった。');
  /* 関係の層（{a}{b}＝一緒に出た二人。{G}＝三人以上の組） */
  var PAIR = {
    love: L('{a}と{b}は、部屋を出たその足で一緒に帰った。駅までの道で、どちらからともなく手を繋いだ。|一週間後、{a}と{b}は改めて待ち合わせをした。あの部屋のことは話さなかったが、帰り際に{b}の方から次の約束を口にした。|{a}と{b}は、それからも会うようになった。白い部屋で始まった関係は、外でも続いている。|{a}と{b}は、帰り道のコンビニで同じ飲み物を選んで、顔を見合わせて笑った。|{a}は{b}を家まで送った。玄関の前で、{b}の方から「上がっていく？｜上がっていくか？｜上がっていきますか？」と訊いた。'),
    awk: L('部屋を出た{a}と{b}は、外の明るさに目を細めたまま、ろくに挨拶もせず別々の方向へ歩き出した。|{a}と{b}は、あの部屋でのことを一度も口にしなかった。連絡先も、交換しないままだった。|{a}は{b}に何か言いかけて、やめた。二人のあいだのことは、白い部屋に置いてきたことになった。|{a}と{b}は、出口で目が合うと、同時に逸らした。それきり、どちらも口をひらかなかった。'),
    hate: L('{a}と{b}は、扉を出たところで一度だけ睨み合い、反対の方向へ歩き出した。|{a}は{b}に「二度と顔を見せないで｜二度と顔を見せるな｜二度と顔を見せないでください」とだけ言った。{b}は、振り返りもしなかった。|{a}と{b}は、外に出てからも張り合うように足を速め、駅で別々の電車に乗った。|{a}は{b}の背中を目で追いながら、次に会ったら何と言ってやろうかと考えていた。それが憎しみなのか別の何かなのか、{a}にも分からなかった。'),
    friend: L('{a}と{b}は外に出ると、肩を叩き合って笑った。あの部屋の話は、いつのまにか二人だけの笑い話になった。|{a}と{b}は連絡先を交換した。たまに届くメッセージは、決まって「生きてる？」の一言から始まった。|部屋を出た{a}と{b}は、近くの店で遅い食事をとった。特別な何かにはならなかったが、いい友人になった。|{a}が「お腹すいた｜腹が減った｜お腹が空きました」と言うと、{b}も同じことを言って吹き出した。|{a}と{b}は、次の休みに会う約束をした。白い部屋の話は、二人の鉄板の笑い話になった。'),
    far: L('{a}と{b}は扉を出たところで別れた。名前のほかは、互いのことをほとんど知らないままだった。|{a}と{b}は外に出るなり、目も合わせずに別々の道を選んだ。二人がまた会うことは、たぶんない。|外に出ると、{a}と{b}はそれぞれのスマホを確かめ、短く会釈して離れた。白い部屋で一緒だったことだけが、二人の接点だった。|{a}と{b}は、出口で軽く会釈をしただけだった。名前を呼ぶ機会は、結局一度もなかった。|外に出ると、{a}も{b}も、それぞれの日常へ紛れていった。'),
    go: L('{a}は先に外へ出た。部屋に残った{b}のことが、帰り道のあいだずっと頭から離れなかった。|{a}は一人で外の空気を吸った。残ると決めた{b}の顔を思い出して、少しだけ笑った。|{a}は振り返らずに外へ出た。{b}とは、それきりになった。|{a}は外で{b}を待とうとして、やめた。{b}が自分で選んだことだった。'),
    group: L('{G}は外に出ると、誰からともなく大きく息を吐いた。それから、近くの店でそろって朝食をとった。|{G}は扉の外で一度だけ振り返り、それぞれの帰り道へ散っていった。|外に出た{G}は、あの部屋のことは「なかったこと」にしようと決めた。けれど、全員の連絡先はちゃんと残っていた。|{G}は、扉の外で互いの無事を確かめ合い、駅までは一緒に歩いた。'),
    kill: L('{G}は、外に出ても誰も口をきかなかった。白い部屋に置いてきたものの重さだけが、帰り道について来た。|{G}は、二度とこの話をしないと約束して別れた。|{G}は、扉の外で一度だけ振り返った。そこにはもう、壁しかなかった。')
  };
  /* r18:begin */
  /* 体だけの関係（セフレ）・一夜を過ごした二人（R18版。全年齢では友人・気まずさの型に落とす） */
  PAIR.fwb = L('{a}と{b}は、外では恋人のふりをしなかった。それでも月に何度か、どちらかから短い連絡が届いた。|部屋を出たあとも、{a}と{b}はときどき会った。名前のない関係のまま、夜だけが重なっていく。|{a}と{b}は、またね、とだけ言って別れた。その「また」は、案外すぐにやってきた。|{a}と{b}は、連絡先を「部屋の人」とだけ登録した。呼び出しは、いつも夜だった。');
  PAIR.night = L('{a}と{b}は、一夜のことを「部屋のせい」にした。それでも、{b}の肌の熱さを、{a}はしばらく忘れられなかった。|駅の改札で別れるとき、{a}は{b}の首筋に残った痕に気づいて、黙って目を逸らした。|{a}と{b}は、あの夜のことを二度と口にしなかった。ただ、すれ違う誰かの香りに、{a}は何度か振り返った。');
  /* r18:end */
  /* 巻き込まれなかった人（三人の場面・夜に関わらずに出た人。{RO}＝外の関係の人） */
  var BY_O = L('{a}は巻き込まれなかったことにホッとしつつ、{RO}との約束場所へ向かっていった。|{a}は巻き込まれずに済んだことに胸をなで下ろし、{RO}が待つ店へ急いだ。|{a}は何事もなかった顔で{RO}に「＠{a}＠今から行く｜今から行く｜今から向かいます」とだけ送って、駅へ向かった。');
  var BY_N = L('{a}は巻き込まれなかったことにホッとしつつ、ひとりで夜景を眺めながら帰った。|{a}は巻き込まれずに済んだ幸運をかみしめて、まっすぐ家に帰った。|{a}はコンビニで温かい飲み物を買い、何も見なかったことにして家路についた。|{a}は一人だけ涼しい顔で、終電の時刻を確かめていた。');
  /* 外の関係の人（参加していない住人）が出る一文 */
  var OUT_X = L('{a}は外に出るとすぐ、{RO}に電話をかけた。声を聞いたら、ようやく帰ってきた気がした。|{a}を待っていたのは、{RO}からの山ほどの不在着信だった。|{a}は、{RO}の顔が無性に見たくなって、帰り道を少しだけ遠回りした。');
  /* 外に恋人がいるのに、部屋の中で誰かと夜を過ごした人 */
  var OUT_G = L('{a}は{RO}からの着信に気づいたが、出られなかった。白い部屋でのことは、言えそうになかった。|{a}は、待ち合わせ場所に立つ{RO}を遠くから見つけて、足が止まった。|{a}は{RO}に会う前に、念入りに手を洗った。それで何かが消えるわけではなかった。');
  RE.TEXT = { DOOR: DOOR, KILL_PAUSE: KILL_PAUSE, SCENE_G: SCENE_G, GO_LATER: GO_LATER, GO_WAIT: GO_WAIT, EXIT: EXIT, ALONG: ALONG, ORDER: ORDER, SCENE: SCENE, SCENE1: SCENE1, SOME: SOME, NONE: NONE, ONE: ONE, STAYED: STAYED, PAIR: PAIR, BY_O: BY_O, BY_N: BY_N, OUT_X: OUT_X, OUT_G: OUT_G };

  /* ---------- 二人の関係の層 ---------- */
  function avgR(ctx, a, b) { var r1 = ctx.R(a, b), r2 = ctx.R(b, a); return { att: (r1.att + r2.att) / 2, aff: (r1.aff + r2.aff) / 2, ten: (r1.ten + r2.ten) / 2 }; }
  function tieHas(ctx, a, b, ty) { return !!(HK.Ties && HK.Ties.has && HK.Ties.has(ctx, a, b, ty)); }
  function isHate(ctx, a, b) {
    var H = HK.HateKit, v = avgR(ctx, a, b);
    if (H && H.level && Math.max(H.level(ctx, a, b), H.level(ctx, b, a)) >= 35) return true;
    if (HK.Ties && HK.Ties.hostile && (HK.Ties.hostile(ctx, a, b) || HK.Ties.hostile(ctx, b, a)) && v.aff < 30) return true;
    return v.ten >= 50 && v.aff < 15;
  }
  function isClose(ctx, a, b) { return ['best', 'buddy', 'childhood', 'sibclose'].some(function (t) { return tieHas(ctx, a, b, t); }); }
  function isLove(ctx, a, b) { var pf = ctx.pair(a, b), v = avgR(ctx, a, b); return !!pf.couple || (v.att > 45 && v.aff > 35); }
  /* 層の種類（乱数は使わない）：love／fwb／hate／night／friend／far（R18 の層が無い・全年齢なら fwb→friend、night→awk） */
  function kindOf(ctx, a, b) {
    var pf = ctx.pair(a, b), v = avgR(ctx, a, b), r18 = !HK.SAFE_ON && !!PAIR.fwb;
    if (isLove(ctx, a, b)) return 'love';
    if (pf.fwb) return r18 ? 'fwb' : 'friend';
    if (isHate(ctx, a, b)) return 'hate';
    if (pf.night) return 'night';
    if (v.aff > 20 && v.ten < 40) return 'friend';
    return 'far';
  }
  RE.kindOf = kindOf;
  /* 一夜を過ごした二人の文：R18版は一夜の型と気まずさの型から、全年齢は気まずさの型から */
  function pairPool(k) { return k === 'night' ? (PAIR.night && !HK.SAFE_ON ? PAIR.night.concat(PAIR.awk) : PAIR.awk) : PAIR[k] || PAIR.far; }
  /* 出る様子：手を取る（恋人・親友）／無言（敵対）／我先に（関係が薄い）／ふつう */
  function manner(ctx, g) {
    var ps = pairsOf(g), hp = ps.filter(function (p) { return isLove(ctx, p[0], p[1]); })[0] || ps.filter(function (p) { var v = avgR(ctx, p[0], p[1]); return isClose(ctx, p[0], p[1]) || (v.aff > 45 && v.ten < 30); })[0];
    if (hp) return { m: 'hand', p: hp };
    if (ps.some(function (p) { return isHate(ctx, p[0], p[1]); })) return { m: 'silent', p: ps[0] };
    if (ps.every(function (p) { var v = avgR(ctx, p[0], p[1]); return v.aff < 15 && v.att < 20; })) return { m: 'rush' };
    return { m: 'calm' };
  }
  function exitLine(ctx, g) {
    var mm = manner(ctx, g), G = g.length === 2 ? g[0].name + 'と' + g[1].name : nm(g);
    if (mm.m === 'hand') {
      var a = mm.p[0], b = mm.p[1], R = g.filter(function (c) { return c !== a && c !== b; });
      if (ctx.rng() < 0.5) { var s = a; a = b; b = s; }
      return fill(ctx.pick(R.length ? EXIT.handG : EXIT.hand2), { a: a.name, b: b.name, R: nm(R), G: G });
    }
    if (mm.m === 'silent' && g.length === 2) return fill(ctx.pick(EXIT.silent.concat(EXIT.silent2)), { a: g[0].name, b: g[1].name, G: G });
    return fill(ctx.pick(EXIT[mm.m]), { G: G });
  }
  /* 関わったか（三人の場面・夜・最後の三人） */
  function involved(ctx, c) {
    if (c.flags.trio) return true;
    var l3 = ctx.flags.last3;
    if (l3 && l3.g && l3.g.indexOf(c.i) >= 0) return true;
    return ctx.chars.some(function (o) { if (o === c) return false; var pf = ctx.pair(c, o); return !!(pf.night || pf.fwb || pf.heatDone); });
  }

  /* ---------- 文の数をそろえる（3〜6文） ---------- */
  function sn(s) { var t = String(s).replace(/「[^」]*」/g, '「」'), m = t.match(/[。！？]/g); return Math.max(1, m ? m.length : 0); }
  /* parts：[{ t: 文, o: 省く順（0 は省かない。大きいものから省く） }] */
  function trim(parts, max) {
    var total = function () { return parts.reduce(function (s, p) { return s + sn(p.t); }, 0); };
    while (total() > max) {
      /* 短い言い換え（alt）がある文は、省く前に短くする */
      var sh = parts.filter(function (p) { return p.alt && sn(p.alt) < sn(p.t); })[0];
      if (sh) { sh.t = sh.alt; sh.alt = null; continue; }
      var k = -1, ko = 0;
      parts.forEach(function (p, i) { if (p.o > ko) { ko = p.o; k = i; } });
      if (k < 0) break;
      parts.splice(k, 1);
    }
    return parts;
  }
  function timeOf(label) {
    var t = String(label || '').replace(/（.*$/, '');
    return !t || t === '目覚め' ? '目覚めてまもなく' : '目覚めてから' + t;
  }
  function seqLabel(label) { var t = String(label || '').replace(/（.*$/, ''); return !t || t === '目覚め' ? '目覚めてすぐ' : t; }
  /* 脱出の記録 e で外へ出た人（先に出て残った人は除く） */
  function membersOf(ctx, e) {
    var C = ctx.chars;
    if (e.group) return e.group.map(function (i) { return C[i]; });
    if (e.stay != null) return [C[e.a]];
    return [C[e.a], C[e.b]];
  }
  /* 外の情景の場所（駅・公園…）：組ごとの結末で使った場所は、あとの結末の段で使わない（同じ情景を2回書かない） */
  var SKEY = /駅|夜景|雨|公園|屋上|朝|観覧車|冷た|消え/g;
  function freshScene(ctx, pool, peek) {
    var used = ctx.flags.endScene || [], ks = function (t) { return String(t).match(SKEY) || []; };
    var ok = pool.filter(function (t) { return !ks(t).some(function (k) { return used.indexOf(k) >= 0; }); });
    var t = ctx.pick(ok.length ? ok : pool);
    if (!peek) ctx.flags.endScene = used.concat(ks(t));
    return t;
  }

  /* ---------- 組ごとの「外に出た後」（2026-10-28 担当KJ） ----------
     扉が開いて一組だけが先に出たとき（まだ部屋に人が残るとき）に、区切りの行「条件を満たしたので扉が開いた。」のあとへ置く 1〜3 文（scenario-room.js の doorFlush）。
     部品：出る様子（exitLine）＋関係の層（PAIR。三人以上の組は、後日談が結末の段にあるので外の情景 SCENE_G）。先に出て一人が残った組は GO_LATER／GO_WAIT（三人目の恋人に付き添う）。
     書いた組の出た記録には told が付き、結末の段（closing）はその組の出る様子・一緒に出た人・関係の層を書き直さない。外の情景の場所も、結末の段では避ける。
     この扉で部屋の動きが終わるとき（全員が出た など）は呼ばれない（最後の「結末」の段に任せる） */
  RE.groupEnd = function (ctx, ex, opt) {
    opt = opt || {};
    if (!ex || ex.how) return '';
    var C = ctx.chars, parts = [];
    if (ex.stay != null) {
      var lt = opt.lt;
      parts.push({ t: fill(ctx.pick(lt ? GO_WAIT : GO_LATER), { a: C[ex.a].name, b: C[ex.stay].name, c: lt ? lt.name : '' }), o: 0 });
    } else {
      var g = membersOf(ctx, ex), lay;
      if (ex.trio || g.length > 2) lay = { t: freshScene(ctx, SCENE_G), o: 1 };
      else { var x = g[0], y = g[1]; if (ctx.rng() < 0.5) { var s = x; x = y; y = s; } lay = { t: fill(ctx.pick(pairPool(kindOf(ctx, x, y))), { a: x.name, b: y.name }), o: 0 }; }
      /* 関係の層の一文目が出るところから書く型（「外に出ると」「部屋を出た〇〇は」など）なら、出る様子は重ねない */
      if (!/^[^。]*(?:外に出る|部屋を出た|扉を出た)/.test(lay.t)) parts.push({ t: exitLine(ctx, g), o: 2 });
      parts.push(lay);
    }
    return trim(parts, 3).map(function (p) { return p.t; }).join('');
  };

  function closing(ctx, late) {
    var C = ctx.chars, P = ctx.present(), out = C.filter(function (c) { return c.out; });
    var stayed = P.filter(function (c) { return c.flags.stayed; }), left = P.filter(function (c) { return !c.flags.stayed; });
    var tEnd = timeOf(ctx.label);
    var ex = ctx.flags.exits || [], parts = [], title, who = P.length ? P : out;
    var one = ex.filter(function (e) { return e.how === 'sacrifice' || e.how === 'grab'; })[0];
    var kill = ctx.rules && ctx.rules.some(function (r) { return r.k === 'kill'; });
    var usedOut = {};
    if (!out.length) {
      parts.push({ t: fill(ctx.pick(NONE), { t: tEnd, L: nm(P) }), o: 0 });
      title = '誰も出られなかった';
    } else if (one) {
      var a = C[one.a], b = C[one.b], Lr = nm(P) || b.name;
      parts.push({ t: fill(ctx.pick(ONE[one.how]), { a: a.name, b: b.name, L: Lr }), o: 0 });
      var oo = outs(ctx, a)[0];
      var pool = oo && ctx.rng() < 0.6 ? ONE_AFTER[one.how + 'O'] : ONE_AFTER[one.how];
      if (oo) usedOut[a.i] = 1;
      parts.push({ t: fill(ctx.pick(pool), { a: a.name, b: b.name, RO: oo ? roName(ctx, oo) : '' }), o: 0 });
      title = a.name + 'だけが外へ出た';
    } else {
      /* 出方（扉が開いたことは区切りの行で示したので書かない。組ごとの結末を書いた組 told は、出る様子・一緒に出た人・関係の層を書き直さない） */
      var real = ex.filter(function (e) { return !e.how; }), fresh = real.filter(function (e) { return !e.told; });
      if (fresh.length === 1) {
        var e0 = fresh[0], g0 = membersOf(ctx, e0);
        if (kill && e0.group) parts.push({ t: ctx.pick(KILL_PAUSE), o: 4 });
        parts.push({ t: kill && e0.group ? fill(ctx.pick(EXIT.silent), { G: nm(g0) }) : exitLine(ctx, g0), o: 0 });
      } else if (fresh.length > 1) {
        var byL = [], lab = {};
        fresh.forEach(function (e) { var k = seqLabel(e.label); if (lab[k] == null) { lab[k] = byL.length; byL.push({ l: k, g: [] }); } byL[lab[k]].g.push(membersOf(ctx, e)); });
        var gname = function (gs) { return gs.map(function (g) { return g.length === 2 ? g[0].name + 'と' + g[1].name : nm(g); }).join('、'); };
        if (byL.length <= 3) parts.push({ t: fill(ctx.pick(ORDER), { SEQ: byL.map(function (x) { return x.l + 'に' + gname(x.g) + 'が'; }).join('、') }), o: 0 });
        else parts.push({ t: fill(ctx.pick(ORDER_MANY), { G: gname(byL[byL.length - 1].g) }), o: 0 });
      } else if (!real.length) parts.push({ t: fill(ctx.pick(DOOR), { t: tEnd }), o: 0 });
      /* 一緒に出た人（全員で出られる部屋） */
      var alongE = fresh.filter(function (e) { return e.along && e.along.length; }).pop();
      if (alongE) parts.push({ t: fill(ctx.pick(ALONG), { L: nm(alongE.along.map(function (i) { return C[i]; })), G: nm(membersOf(ctx, alongE)) }), o: 2.5 });
      /* 一人だけ先に出て、残った人があとから出た */
      real.filter(function (e) { return e.stay != null && C[e.stay].out; }).slice(0, 1).forEach(function (e) { parts.push({ t: fill(ctx.pick(FIRST), { a: C[e.a].name, b: C[e.stay].name }), o: 5 }); });
      /* 外の情景・取り残された人 */
      if (!P.length) { title = C.length === 2 ? '二人とも部屋を出た' : '全員が部屋を出た'; parts.push({ t: freshScene(ctx, SCENE), alt: freshScene(ctx, SCENE1, true), o: 6 }); }
      else if (left.length) { title = nm(left) + 'が取り残された'; parts.push({ t: fill(ctx.pick(SOME), { L: nm(left) }), o: 0 }); }
      else title = nm(stayed) + 'が自分から残った';
      if (stayed.length) parts.push({ t: fill(ctx.pick(STAYED), { S: nm(stayed) }), o: 2 });
      /* 関係の層（三人で出た組は room-trio.js の後日談がある） */
      var nL = 0;
      fresh.forEach(function (e) {
        if (e.trio) return;
        var t;
        if (e.group) t = fill(ctx.pick(kill ? PAIR.kill : PAIR.group), { G: nm(e.group.map(function (i) { return C[i]; })) });
        else if (e.stay != null) t = fill(ctx.pick(PAIR.go), { a: C[e.a].name, b: C[e.b].name });
        else { var x = C[e.a], y = C[e.b]; if (ctx.rng() < 0.5) { var s = x; x = y; y = s; } t = fill(ctx.pick(pairPool(kindOf(ctx, x, y))), { a: x.name, b: y.name }); }
        parts.push({ t: t, o: nL ? 8 + nL : 1 });
        nL++;
      });
    }
    /* 三人の後日談（room-trio.js）は、関係の層の後ろに */
    (late || []).forEach(function (e) { parts.push({ t: e.text, o: 0 }); });
    /* 最後の三人（room-last3-r18.js。R18版だけ） */
    var l3 = ctx.flags.last3, L3 = RE.L3;
    if (l3 && L3 && !HK.SAFE_ON && out.length) {
      var g3 = l3.g.map(function (i) { return C[i]; });
      parts.push({ t: fill(ctx.pick(L3[l3.mood] || L3.none), { a: g3[0].name, b: g3[1].name, c: g3[2].name, G: nm(g3) }), o: 1 });
    }
    /* 巻き込まれなかった人・外の関係の人 */
    if (out.length && !one) {
      var lewdRun = C.some(function (c) { return involved(ctx, c); });
      var free = out.filter(function (c) { return c.alive !== false && !usedOut[c.i]; });
      var by = lewdRun ? free.filter(function (c) { return !involved(ctx, c); }) : [];
      if (by.length) {
        var bc = by[Math.floor(ctx.rng() * by.length) % by.length], bo = outs(ctx, bc)[0];
        usedOut[bc.i] = 1;
        parts.push({ t: fill(ctx.pick(bo ? BY_O : BY_N), { a: bc.name, RO: bo ? roName(ctx, bo) : '' }), o: 3 });
      }
      /* 外に恋人がいるのに、部屋の中で夜を過ごした人 */
      var gu = free.filter(function (c) { return !usedOut[c.i] && involved(ctx, c) && outs(ctx, c, 'lover').length; });
      if (gu.length && ctx.rng() < 0.6) {
        var gc = gu[Math.floor(ctx.rng() * gu.length) % gu.length];
        usedOut[gc.i] = 1;
        parts.push({ t: fill(ctx.pick(OUT_G), { a: gc.name, RO: roName(ctx, outs(ctx, gc, 'lover')[0]) }), o: 3 });
      } else if (!by.length) {
        var ox = free.filter(function (c) { return !usedOut[c.i] && outs(ctx, c).length; });
        if (ox.length && ctx.rng() < 0.55) {
          var xc = ox[Math.floor(ctx.rng() * ox.length) % ox.length];
          usedOut[xc.i] = 1;
          parts.push({ t: fill(ctx.pick(OUT_X), { a: xc.name, RO: roName(ctx, outs(ctx, xc)[0]) }), o: 3 });
        }
      }
    }
    trim(parts, 6);
    /* 少なすぎるとき（2文以下）は、情景を一つ足す */
    if (out.length && !P.length && parts.reduce(function (s, p) { return s + sn(p.t); }, 0) <= 2 && !parts.some(function (p) { return SCENE.indexOf(p.t) >= 0 || SCENE1.indexOf(p.t) >= 0; })) parts.splice(Math.min(2, parts.length), 0, { t: freshScene(ctx, SCENE), o: 6 });
    ctx.flags.outcome = (ctx.flags.outcome || ctx.flags.roomLabel || '') + ' ― ' + title;
    ctx.say({ kind: 'step', cat: 'phase', text: '結末' });
    ctx.say({ kind: 'event', cat: 'phase', cageOk: true, actors: who, text: parts.map(function (p) { return p.t; }).join(''), why: '結末：' + title, mag: 30 });
  }
  RE.closing = closing;

  var fin0 = scen.finish;
  scen.finish = function (ctx) {
    var s0 = ctx.log.length;
    var r = fin0 ? fin0.apply(this, arguments) : undefined;
    ctx.flush();
    /* 三人の後日談（room-trio.js）は、部屋の締めの文の後ろにまとめる */
    var late = [];
    for (var i = ctx.log.length - 1; i >= s0; i--) if (/^部屋を出たあとの三人/.test(ctx.log[i].why || '')) late.unshift(ctx.log.splice(i, 1)[0]);
    for (var j = s0; j < ctx.log.length; j++) ctx.log[j].n = j;
    closing(ctx, late);
    /* 最後に取り残された人の結末（room-left.js） */
    if (HK.RoomLeft) HK.RoomLeft.write(ctx);
    return r;
  };
})();
