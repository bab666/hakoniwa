/* 箱庭シミュレーター: TIPS（？ボタンとサポート情報の窓）
   HK.Tips.btn(key) で ？ ボタンのHTMLを返す。押すと HK.TIPS[key]（箱庭ごとは HK.TIPS_SCEN[id]、key は 'scen:'+id）を窓に出す
   中身の形: { title, lead, sections: [{ h, items: [文…] }], r18: [文…]（R18版だけ）, safe: [文…]（全年齢版だけ） }
   箱庭ごとのTIPSはトリガーと概要だけ。具体的なイベントの文は書かない */
(function () {
  'use strict';
  var HK = window.HK;
  HK.TIPS_SCEN = HK.TIPS_SCEN || {};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* **太字** だけ使える */
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

  HK.TIPS = {
    'cast-import': {
      title: '住人をまとめて登録',
      lead: '住人は、エゴグラム（CP・NP・A・FC・AC の5つ）の数値だけで動きます。性格の文章や設定は、行動には使われません。',
      sections: [
        { h: 'エゴグラムの読み方', items: [
          '**CP**（厳しさ・規律）、**NP**（面倒見・優しさ）、**A**（冷静さ・計算）、**FC**（自由さ・衝動）、**AC**（協調・遠慮）の5つ。',
          '5文字コードは A＝とても強い〜D＝控えめ。A≒17点、B≒12点、C≒8点、D≒3点として扱います。',
          '数値を直接書くと細かく決められます。100点満点の数値は自動で20点満点に換算します。',
          '「ふたりのエゴグラム」の診断結果の文をそのまま貼っても読めます。タイプ名はメモに入ります。'
        ] },
        { h: '保存と入れ替え', items: [
          '名簿はこのブラウザに自動で保存されます。別の端末やバックアップには「住人をJSONで書き出す」を使ってください。',
          'JSONには、口調・呼び方・関係・アイコン・箱庭ごとの設定まで入ります。',
          '登録は最大100人。1回の箱庭に参加できるのは30人まで（箱庭によってはもっと少なくなります）。'
        ] }
      ]
    },
    'cast': {
      title: '住人',
      lead: '各住人の ⚙️ 設定で、話し方・呼び方・プロフィール・関係をまとめて決められます。',
      sections: [
        { h: '何が行動を決めるか', items: [
          '行動・判断・相性は、エゴグラムから計算した「気質」（衝動性・慎重さ・温かさ・リーダー性など）で決まります。',
          '口調・一人称・呼び方は台詞の見た目だけを変えます。口調で行動が制限されることはありません。',
          '性別・恋愛対象・受け攻め・年齢などのプロフィールは、恋愛や体の関係の相手選びに使われます。'
        ] },
        { h: '並び順とアイコン', items: [
          '左端の ≡ をドラッグ（または上下キー）で並び替えられます。イメージカラーを自動にしていると、並び順で色が決まります。',
          'アイコン画像はこのブラウザにだけ保存されます。JSONには入りますが、どこかへ送信されることはありません。',
          '「質問に答えて診断して追加」は、25問に答えてエゴグラムを出し、そのまま住人にできます。'
        ] }
      ]
    },
    'ties': {
      title: '住人どうしの既存の関係',
      lead: '箱庭に入る前からある関係です。初期の好意・信頼が変わり、行動の傾向にも補正がかかります。',
      sections: [
        { h: '関係の働き', items: [
          '恋人や家族は戦いを避けやすく、敵対やライバルは衝突しやすくなります。',
          '片想い・親子・主従など向きのある関係は、左が想う側・親・主です。',
          '片想いには「脈なし」「友達としか」「苦手」「他に好きな人」などの相手側の気持ちを添えられます。',
          '関係は重ねられます（「セフレで片想い」など）。'
        ] },
        { h: '血縁（親子・きょうだい）', items: [
          '血縁の関係には「恋愛：なし／あり」を選べます。初期値は「なし」です。',
          '**恋愛：なし** … どの箱庭でも、恋愛や体の関係には発展しません。告白・デート・R18の場面の相手にも選ばれません。',
          '**恋愛：あり** … ほかの住人と同じように恋愛に発展することがあります。',
          'どちらの場合も、信頼は一定以下には下がりにくくなります（ケンカをしても家族は家族）。'
        ] },
        { h: '呼び方', items: [
          '相手ごとの呼び方は、⚙️ 設定の「関係と呼び方」で決められます。先輩後輩や教師と生徒の関係は、呼び方や敬語の初期値にも使われます。'
        ] }
      ]
    },
    'env': {
      title: '環境値',
      lead: '箱庭全体の空気を決めるつまみです。どの箱庭にもある4つと、箱庭ごとの値があります。',
      sections: [
        { h: '共通の環境値', items: [
          '**運命の揺らぎ** … 高いほど「らしくない行動」や勝負のまぐれが増えます。0に近いほど気質どおりに動きます。',
          '**恋愛の起こりやすさ** … **0にすると恋愛は起きません**（告白・交際・体の関係のイベントがすべて止まります）。',
          '**争いの起こりやすさ** … ケンカ・対立・裏切りの起こりやすさ。',
          '**ハプニングの頻度** … 天候・物資・追加ルールなど、全員に降りかかる出来事の多さ。'
        ] },
        { h: 'シード', items: [
          '同じシード・同じ住人・同じ条件なら、同じ結末になります。気に入った結果はシードを控えておくと再現できます。',
          '空欄ならランダムです。結果画面にシードが表示されます。'
        ] }
      ]
    },
    'uses': {
      title: 'この箱庭で効くもの',
      lead: 'エゴグラムから自動で計算される気質と、エゴグラムでは分からないので別に決めるステータスです。',
      sections: [
        { h: '気質とステータス', items: [
          '気質の札に表示されている式（例：CP＋A）が、その気質の材料です。',
          'ステータス（体力・酒の強さなど）は「住人ごとの初動と目標」の表で決められます。「おまかせ」なら気質から推定します。'
        ] }
      ]
    },
    'perchar': {
      title: '住人ごとの初動と目標',
      lead: '箱庭が始まったときの最初の行動と、それぞれが目指すものです。',
      sections: [
        { h: '選び方', items: [
          '「おまかせ」は、気質に合う選択肢から抽選します。',
          'あえて気質と逆の行動を選ぶと、意外な関係や展開が出やすくなります。',
          'チェックを外した住人は、この箱庭には参加しません。'
        ] }
      ]
    },
    'gear-talk': {
      title: '話し方',
      lead: '台詞の言い回しを決めます。行動には影響しません。',
      sections: [
        { h: '口調', items: [
          '「おまかせ」はエゴグラムから口調を選びます。',
          '「態度はエゴグラムから決まる」と書かれた口調は、同じ口調でも気質によって荒さや優しさが変わります。',
          '見本の台詞は、性別の設定に合わせて切り替わります。'
        ] },
        { h: '一人称・二人称', items: [
          '空欄なら口調と性別から決まります。二人称は「あなた」「お前」などを置き換えます。'
        ] },
        { h: '呼び方と敬語', items: [
          '基本の呼び方で「性別ごと」を選ぶと、男性・女性・その他の相手ごとに敬称（くん・さん・ちゃんなど）を選べます。',
          '「敬語で話す相手」にチェックした相手にだけ、敬語になります。',
          '「年上の相手には敬語」は、両方が年齢を決めているときだけ働きます。',
          '学園の先輩後輩など、箱庭の設定で敬語や「〜先輩」が自動でつくこともあります。'
        ] }
      ]
    },
    'gear-profile': {
      title: 'プロフィール',
      lead: '恋愛や体の関係の相手選びと、一部の箱庭の進み方に使います。',
      sections: [
        { h: '性別・恋愛対象', items: [
          '「おまかせ」なら制限なし。決めると、対象外の相手とは恋愛にほぼ発展しません。'
        ] },
        { h: '受け攻め', items: [
          '**「攻め」を選んだ人は、どの箱庭のどの場面でも、受ける側にはなりません。** 襲われる・責められる側に回る展開は攻めの人には起きず、場面によっては主導権を握る形に変わります。',
          '女性は攻めを選ばない限り受けとして扱います。',
          '恋愛対象（受け攻め）が「おまかせ」なら、攻めは受けとだけ、受けは攻めとだけ結ばれます。向きの決まらない組は、恋愛にも体の関係にもなりません。'
        ] },
        { h: '誕生月・年齢', items: [
          '誕生月を決めると、学園などで誕生日のイベントが起きることがあります。',
          '年齢は「年上の相手には敬語」の判定に使います。'
        ] }
      ],
      safe: ['全年齢版では、受け攻めは恋愛の相手選びにだけ使います。']
    },
    'gear-love': {
      title: '恋愛',
      lead: '恋愛相手を固定すると、その相手以外とは恋愛に発展しません。',
      sections: [
        { h: '固定のしくみ', items: [
          '片想いのままでも使えます。相手が箱庭にいないときは、誰とも恋愛しません。',
          '環境値の「恋愛の起こりやすさ」が0のときは、固定していても恋愛は起きません。'
        ] }
      ]
    },
    'gear-ties': {
      title: '関係と呼び方',
      lead: 'この住人から見た関係と、相手ごとの呼び方です。住人タブの「既存の関係」と同じものを編集します。',
      sections: [
        { h: 'ポイント', items: [
          '「関係を重ねる」で、同じ相手に複数の関係をつけられます。',
          '呼び方の欄に書いた呼び名は、台詞の中で相手の名前の代わりに使われます。',
          '血縁の関係には「恋愛：なし／あり」を選べます（なしなら恋愛・体の関係に発展しません）。'
        ] }
      ]
    }
  };

  function get(key) {
    if (key.indexOf('scen:') === 0) {
      var id = key.slice(5), T = HK.TIPS_SCEN[id], sc = HK.SCENARIOS && HK.SCENARIOS[id];
      if (!T) return null;
      var o = { title: (sc ? sc.name : id) + ' のTIPS', lead: T.lead, sections: T.sections, r18: T.r18, safe: T.safe };
      if (HK.SAFE_ON && T.safeLead) o.lead = T.safeLead;
      if (HK.SAFE_ON && T.safeSections) o.sections = T.safeSections;
      return o;
    }
    return HK.TIPS[key] || null;
  }
  function body(T) {
    var h = (T.lead ? '<p class="tiplead">' + md(T.lead) + '</p>' : '');
    (T.sections || []).forEach(function (s) {
      h += '<div class="gearsec"><h3>' + esc(s.h) + '</h3><ul class="tipul">' + (s.items || []).map(function (x) { return '<li>' + md(x) + '</li>'; }).join('') + '</ul></div>';
    });
    var extra = HK.SAFE_ON ? T.safe : T.r18;
    if (extra && extra.length) h += '<div class="gearsec"><h3>' + (HK.SAFE_ON ? '全年齢版では' : 'R18版では') + '</h3><ul class="tipul">' + extra.map(function (x) { return '<li>' + md(x) + '</li>'; }).join('') + '</ul></div>';
    return h;
  }

  var css = '.tipbtn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--muted);font-size:13px;font-weight:700;line-height:1;cursor:pointer;padding:0;margin-left:6px;vertical-align:2px;font-family:inherit}' +
    '.tipbtn:hover,.tipbtn:focus-visible{color:var(--accent);border-color:var(--accent)}' +
    '.tiplead{font-size:14px;line-height:1.7;margin:6px 0 0}.tipul{margin:0;padding-left:1.2em;font-size:13px;line-height:1.75}.tipul li{margin:3px 0}' +
    '.tipscen{display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:3px 10px 3px 4px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font-size:11.5px;font-family:inherit;line-height:1.4;cursor:pointer}' +
    '.tipscen .q{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;border:1px solid currentColor;font-weight:700;font-size:11px}' +
    '.tipscen:hover,.tipscen:focus-visible{color:var(--accent);border-color:var(--accent)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov = null, opener = null;
  function close() {
    if (!ov) return;
    ov.remove(); ov = null;
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.focus) try { opener.focus(); } catch (e) { }
    opener = null;
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function open(key, from) {
    var T = get(key);
    if (!T) return;
    close();
    opener = from || document.activeElement;
    ov = document.createElement('div');
    ov.className = 'gearov tipov';
    ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="tiptitle" tabindex="-1"><div class="gearhd"><h2 id="tiptitle">' + esc(T.title || 'TIPS') + '</h2><button type="button" class="btn small" data-tipclose="1">閉じる</button></div>' + body(T) + '</div>';
    ov.addEventListener('click', function (e) { if (e.target === ov || (e.target.closest && e.target.closest('[data-tipclose]'))) close(); });
    document.body.appendChild(ov);
    document.addEventListener('keydown', onKey, true);
    var bx = ov.querySelector('.gearbox'); if (bx) bx.focus();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tip]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    open(b.getAttribute('data-tip'), b);
  }, true);

  HK.Tips = {
    open: open, close: close, get: get,
    has: function (key) { return !!get(key); },
    btn: function (key, label) {
      var T = get(key);
      if (!T) return '';
      return '<button type="button" class="tipbtn" data-tip="' + esc(key) + '" aria-label="' + esc(label || T.title || 'TIPS') + 'のヒント" title="ヒント">？</button>';
    },
    scenBtn: function (id) {
      if (!HK.TIPS_SCEN[id]) return '';
      var sc = HK.SCENARIOS && HK.SCENARIOS[id];
      return '<button type="button" class="tipscen" data-tip="scen:' + esc(id) + '" aria-label="' + esc(sc ? sc.name : id) + 'のTIPS"><span class="q" aria-hidden="true">？</span>この箱庭のTIPS</button>';
    }
  };
})();
