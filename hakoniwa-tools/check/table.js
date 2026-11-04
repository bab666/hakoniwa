/* 点検の依存の表（2026-11-04。check.js がこの表を読んで、変わったファイルから回す点検を決める。説明は docs/reports/2026-11-04/check-pipeline.md）
   ・TAGS：変更の種類（印）。ファイルの場所・名前（FILE_RULES）と、変わった行の中身（LINE_RULES）から付ける。
   ・CHECKS：点検。tags のどれかが付いたら回す（--all なら全部）。after は先に済ませる点検、weight は同時に使うページの数（並べる本数の上限に使う）、
     est は目安の秒数（重い順に始めるのに使う）、tools は結果のキャッシュの鍵に入れる道具のファイル（require をたどったものも入る）。
   表を変えたら node hakoniwa-tools/check.js --table で md の表を出し、check-pipeline.md の「依存の表」に貼る。 */
'use strict';

/* ---------- 変更の種類 ---------- */
const TAGS = {
  js: 'js を変えた（build が要る）',
  sim: 'シミュレーションの結果が変わりうる（恋愛・夜・R18・関係・場面・組み立て）',
  ui: '画面だけ（結果は変わらないはず）',
  serifu: '台詞（「」・3 本の台詞）を足した・変えた',
  tone: '口調の表・書き下ろし（tone-*・voice-override-*）',
  dict: '口調の辞書・言い換えの仕組み',
  moan: '喘ぎ',
  thick: '長いエッチの場面の部品',
  trio: '三人の場面の部品',
  force: '無理やりの部品',
  sexgate: '性的な出来事の起こり方（性欲・理性・関係）',
  feud: '不仲の組',
  group: '複数人の恋愛（嫉妬・失恋・応援）',
  death: '死・退場・蘇り',
  name: '言い換え（名前が壊れうる）',
  rel: '関係を前提にした文・場面や結末を足した',
  event: '出来事の印（@event・label・場面の書き方）',
  zen: 'r18 の印（全年齢版の中身が変わる）',
  order: '読み込み順・かたまりの振り分け',
  buildtool: 'build の道具',
  doc: '文書・コメントだけ（何も回さない）'
};

/* ---------- ファイルの場所・名前から付ける印（上から順にすべて当てる。stop があればそこで止める） ----------
   p はリポジトリからのパス（hakoniwa-full/js/ui.js）、b は js の名前（ui.js。本体・パックの js だけ） */
const MAINJS = /^hakoniwa-(?:full|zenrei)\/js\/[^/]+\.js$/;
const PACKJS = /^hakoniwa-packs\/[^/_][^/]*\/js\/[^/]+\.js$/;
const FILE_RULES = [
  /* 作り直されるもの（build・build-pack・event-catalog の出力）は見ない */
  { re: /^hakoniwa-(?:full|zenrei)\/(?:js\/c\/|js\/event-catalog\.js$|packs\/)|^docs\/reports\/2026-10-28\/event-catalog\.md$|^docs\/reports\/2026-11-03\/pack-event-catalog\.md$|\.(?:gz|br)$/, tags: [], gen: true, stop: true },
  { re: /\.md$|^docs\/|^CLAUDE\.md$|\.txt$(?<!_order\.txt)/, tags: ['doc'], stop: true },
  { re: /^hakoniwa-tools\/(?:check\.js|check\/|text-studio\/|\.check-cache\/)/, tags: [], stop: true },
  /* build の道具 */
  { re: /^hakoniwa-tools\/build\/(?:build|build-min|build-manifest|build-tone)\.js$/, tags: ['buildtool', 'js'], stop: true },
  { re: /^hakoniwa-tools\/build\/event-catalog(?:-headless)?\.js$/, tags: ['event', 'js'], stop: true },
  /* 本体 */
  { re: /^hakoniwa-(?:full|zenrei)\/js\/_order\.txt$/, tags: ['order', 'js'], stop: true },
  { re: /^hakoniwa-(?:full|zenrei)\/js\/(?:load|load-order)\.js$/, tags: ['order', 'js'], stop: true },
  { re: /^hakoniwa-(?:full|zenrei)\/(?!js\/)/, tags: ['ui', 'js'], stop: true },   /* index.html（scripts の外）・pass-gate.js・_headers など */
  { re: MAINJS, tags: ['js'] },
  { re: PACKJS, tags: [] },
  /* js の名前（本体・パック共通） */
  { b: /^(?:ui|view)(?:[-.])|-view\.js$|^(?:packs-ui|event-catalog-ui|share-card|export-out|icons|save-folder|saves|history|notice|tips|tips-scen-[a-z]|egoquiz|ego-image|portable)\.js$/, tags: ['ui'], ui: true },
  { b: /^(?:tone-(?:dict-builtin|engine|registry|plus|keigo-unify)|lewd-words|lewd-unify|part-words|pair-name|sib-word|attr-yomi|safe)\.js$/, tags: ['dict', 'name', 'serifu', 'sim'] },
  { b: /^(?:voice|voice-seg|voice-tone|voice-fp|voice-more)\.js$/, tags: ['serifu', 'sim'] },
  { b: /^(?:tone-|voice-override)|-tone\.js$/, tags: ['tone', 'serifu'], toneOnly: true },
  { b: /^(?:moan-|ero-moan-tone|novel-moan-tone|solo-r18-moan)/, tags: ['moan', 'sim'] },
  { b: /^(?:sex-flow-|play-|pos-lead|ero-initiative-|tie-order|moan-tease|room-thick|thick-sex|r18-thick)/, tags: ['thick', 'sim'] },
  { b: /trio/, tags: ['trio', 'sim'] },
  { b: /^(?:force-|hate-sex)/, tags: ['force', 'sim'] },
  { b: /^(?:engine|attr|attr-r18|free-sex|pos|pos-ff|pos-fm|pos-nogen|content|content-events-r18|emotion-r18|esteem-r18|fwb|cold-fear|cold-fear-r18|fear-body-r18|tie-master-r18|sex-lead-r18)\.js$/, tags: ['sexgate', 'sim'] },
  { b: /feud|^rel-bad|^hate-|^unlike|^sib-/, tags: ['feud', 'sim'] },
  { b: /^rel-group|heartbreak|^poly|^pining|jealous|rival|fwbcrush/, tags: ['group', 'sim'] },
  { b: /kill|grief|deathgame|corpse|-bite|-cure|state-store|^reset/, tags: ['death', 'sim'] },
  { b: /^(?:ties?|tie-|rel-|room-know|room-end|room-awkward|fam-kin|endings|epilogue|attr-meet)|-after\.js$|-rel\.js$/, tags: ['rel', 'sim'] },
  /* 名前で決まらない js は、シミュレーションの結果が変わりうるものとして扱う（check.js が、ui・toneOnly のほかに当たらなかったときに sim を付ける） */
  /* パックの組み立ての決まり */
  { re: /^hakoniwa-packs\/[^/_][^/]*\/pack\.json$/, tags: ['sim'], packAll: true },
  /* 点検の道具：その道具の点検を回し直す（check.js が CHECKS の tools と突き合わせる） */
  { re: /^hakoniwa-tools\//, tags: [], tool: true }
];

/* ---------- 変わった行（足した行・消した行）の中身から付ける印（js の、コメントでない変更だけ。ui のファイルには serifu を付けない） ---------- */
const LINE_RULES = [
  { re: /「[^」\n]*」|「[^」\n]*$|^[^「\n]*」/, tags: ['serifu'], notUi: true },
  { re: /TONE_MOAN|NovelMoan|HK\.Moan\b|MOAN_|moan/i, tags: ['moan'] },
  /* 口調の書き下ろしの R18 のファイル（tone-fix-g*-r18 など）の喘ぎの行：♡・小さい母音の続き・「あっ」「んっ」など */
  { re: /♡|[ぁぃぅぇぉ]{2}|[あんっ]っ[、…♡！]|イっ|イく/, tags: ['moan'], toneR18: true },
  { re: /ThickSex\.scene|ThickEro\.scene|Play\.addScene|HK\.SexFlow|HK\.Play\b/, tags: ['thick'] },
  { re: /HK\.Trio3|trio/i, tags: ['trio'] },
  { re: /ForceRep|'force'|"force"/, tags: ['force'] },
  { re: /okSex|canSex|sexGate|libido|tieBodyOK|fearHeld|理性|性欲/, tags: ['sexgate'] },
  { re: /不仲|敵対|険悪|feud|'enemy'|"enemy"/, tags: ['feud'] },
  { re: /嫉妬|失恋|三角関係|応援|祝福|ダブルデート|jealous|heartbreak/, tags: ['group'] },
  { re: /\bdead\b|\.dead|alive|revive|退場|蘇|死ん|死体|死ぬ/, tags: ['death'] },
  { re: /relFilter|relClass|初対面|初めまして|連絡先|付き合い始め|出会/, tags: ['rel'] }
];
/* コメントの中身の変更でも付ける印（コメントだけの変更でも、出来事の一覧・全年齢版の中身が変わる） */
const COMMENT_RULES = [
  { re: /@event|@labels|@event-table|@event-ok/, tags: ['event', 'rel', 'js'] },
  { re: /r18:(?:begin|end|ok)/, tags: ['zen', 'js'] }
];
/* 出来事の書き方（コメントの外）：表示名・場面の記録の形 */
const EVENT_LINE = /\blabel\s*:\s*['"]|\btag\s*:\s*['"]|kind\s*:\s*['"]climax|\bsex\s*:\s*true/;

/* ---------- 点検 ---------- */
const TC = 'hakoniwa-tools/tone-check/', BD = 'hakoniwa-tools/build/';
const CHECKS = [
  /* 軽い前置き（ページを開かない。順に回し、落ちたら重い点検に進まない） */
  { id: 'syntax', name: '構文（node --check と同じ）', stage: 'pre', tags: ['js'], est: 1, why: '変えた js（本体・パック・道具）をコンパイルだけする' },
  { id: 'r18mark', name: 'r18 の印の対応', stage: 'pre', tags: ['js'], est: 1, why: '変えた本体の js で /* r18:begin */ と /* r18:end */ が行全体・交互・入れ子なし' },
  { id: 'lines', name: '2000 行の上限', stage: 'pre', tags: ['js'], est: 1, why: '変えた js が 2000 行を超えた（もともと超えていて増えたものは警告だけ）' },
  { id: 'twin', name: '両ビルドの同名ファイル', stage: 'pre', tags: ['js'], est: 1, why: '前は同じだった hakoniwa-full と hakoniwa-zenrei の同名ファイルが、片方だけ変わった' },
  { id: 'base-lint', name: '3 本の台詞の約束（base-lint）', stage: 'pre', tags: ['serifu', 'tone'], est: 6, tools: [TC + 'base-lint.js'], why: '比べる相手のコミットに無かった問題だけを数える（今ある誤検出 9 件は数えない）' },
  /* build */
  { id: 'build', name: 'build（両ビルド）', stage: 'build', tags: ['js'], est: 40, weight: 1, tools: [BD + 'build.js', BD + 'event-catalog.js'], why: 'ビルドのフォルダの js・_order.txt・index.html を変えたビルドだけ。入力が前回の build と同じで出力も同じなら飛ばす。中核（core）の br（かたまり・ファイルごとの目安の合計）が 900KB を超えたら不合格（2026-11-04）' },
  { id: 'catalog', name: '出来事の一覧（catalog-check）', stage: 'post', tags: ['js', 'event'], after: ['build', 'pack-catalog'], est: 6, tools: [BD + 'catalog-check.js', BD + 'event-catalog.js'], why: 'build のあと。一覧が古い・表示名の無い出来事・印の無い新しい場面' },
  /* 重い点検（ページを開く。並べて回す） */
  { id: 'audit-all', name: '点検の一式（audit-all）', stage: 'heavy', tags: ['sim', 'ui', 'zen', 'moan', 'thick', 'trio', 'force', 'sexgate', 'feud', 'group', 'death', 'name', 'rel'], after: ['build'], est: 240, weight: 2, tools: [TC + 'audit-all.js'],
    why: '既定の一式（orient・pos×3・state・loveflag・seg・qa・call・misc）。印で追加の配役パス（--extra）を足す。箱庭のかたまりだけ変えたときはその箱庭だけ（HK_ONLY_SCEN）' },
  { id: 'tone-feel', name: '口調の違和感（tone-feel）', stage: 'heavy', tags: ['serifu', 'tone'], after: ['build'], est: 155, weight: 1, tools: [TC + 'tone-feel.js'], why: '変えた箱庭だけ（--scen=）。本体の共通の文なら既定の 3 箱庭' },
  { id: 'moan-tone', name: '喘ぎの口調（moan-tone-audit）', stage: 'heavy', tags: ['moan'], after: ['build'], est: 420, weight: 1, tools: [TC + 'moan-tone-audit.js', TC + 'moan-audit.js'], why: '箱庭のかたまりだけ変えたときは --scen=' },
  { id: 'sex-flow', name: '長い場面の流れ（sex-flow-audit）', stage: 'heavy', tags: ['thick'], after: ['build'], est: 10, weight: 1, tools: [TC + 'sex-flow-audit.js'], why: 'audit-all を全箱庭で回すときは --extra=sexflow に入れる（同じ関数。ページを開き直さない）' },
  { id: 'trio-shape', name: '三人の場面の形（trio-shape-audit）', stage: 'heavy', tags: ['trio'], after: ['build'], est: 10, weight: 1, tools: [TC + 'trio-shape-audit.js'], why: 'audit-all を全箱庭で回すときは --extra=trio に入れる' },
  { id: 'force-repeat', name: '無理やりの二回目・三回目（force-repeat-audit）', stage: 'heavy', tags: ['force'], after: ['build'], est: 10, weight: 1, tools: [TC + 'force-repeat-audit.js'], why: '' },
  { id: 'regress', name: '結果の指紋（regress。比べる相手のコミットと）', stage: 'heavy', tags: ['ui', 'order', 'buildtool'], after: ['build'], est: 15, weight: 1, tools: [BD + 'regress.js'], why: 'R18版・全年齢モード・全年齢版。比べる相手の指紋は、そのコミットのビルドを取り出して取る（キャッシュに残る）' },
  { id: 'chunk-regress', name: '単独・乱順の読み込み（chunk-regress）', stage: 'heavy', tags: ['order', 'buildtool'], after: ['build'], est: 450, weight: 1, tools: [BD + 'chunk-regress.js'], why: '両ビルド' },
  { id: 'chunk-audit', name: 'かたまりの境目（chunk-audit）', stage: 'heavy', tags: ['order', 'buildtool'], after: ['build'], est: 60, weight: 1, tools: [BD + 'chunk-audit.js'], why: '両ビルド' },
  { id: 'dict-regress', name: '口調の辞書の成績（dict-regress。参考）', stage: 'heavy', tags: ['dict'], after: [], est: 10, weight: 1, tools: [TC + 'dict-regress.js'], info: true, why: '終了コードに入れない（成績を出すだけ）' },
  /* 追加パック（変えたパック、本体の「パックが頼るかたまり」を変えたときはそのパック） */
  { id: 'pack-catalog', name: 'パックの出来事の一覧（event-catalog --pack）', stage: 'build', tags: ['pack'], after: [], est: 3, weight: 1, tools: [BD + 'event-catalog.js'], why: '作り直してから catalog-check' },
  { id: 'pack-site', name: 'パックの試しのフォルダ（pack-site）', stage: 'build', tags: ['pack'], after: ['build'], est: 40, weight: 1, tools: [BD + 'pack-site.js', BD + 'build-pack.js'], why: '本体を写してパックを組み立てる（キャッシュの中に作る）' },
  { id: 'pack-audit', name: 'パックの点検の一式（audit-all・HK_ONLY_SCEN）', stage: 'heavy', tags: ['pack'], after: ['pack-site'], est: 150, weight: 2, tools: [TC + 'audit-all.js'], why: '変えた部屋だけ（共有の部品 kit などを変えたらそのパックの全部屋）。長い場面を変えたら --extra=sexflow も' },
  { id: 'pack-feel', name: 'パックの口調の違和感（tone-feel --scen=部屋）', stage: 'heavy', tags: ['pack'], after: ['pack-site'], est: 60, weight: 1, tools: [TC + 'tone-feel.js'], why: '台詞を変えた部屋だけ' },
  { id: 'pack-moan', name: 'パックの喘ぎの口調（moan-tone-audit --scen=部屋）', stage: 'heavy', tags: ['pack'], after: ['pack-site'], est: 120, weight: 1, tools: [TC + 'moan-tone-audit.js', TC + 'moan-audit.js'], why: '喘ぎを変えた部屋だけ' },
  { id: 'pack-flow', name: 'パックの三人の場面（trio-shape-audit 部屋）', stage: 'heavy', tags: ['pack'], after: ['pack-site'], est: 30, weight: 1, tools: [TC + 'trio-shape-audit.js'], why: '三人の部品を変えた部屋だけ（長い場面はパックの audit-all に --extra=sexflow で入れる）' }
];

/* 印 → 追加の配役パス（audit-all の --extra） */
const EXTRA_OF = { sexgate: 'sexgate', feud: 'feud', group: 'group', death: 'state-hot', name: 'name', rel: 'relcons' };
/* 既定の口調の箱庭（tone-feel の既定と同じ） */
const FEEL_DEF = ['whiteroom', 'locker', 'omega'];

module.exports = { TAGS, FILE_RULES, LINE_RULES, COMMENT_RULES, EVENT_LINE, CHECKS, EXTRA_OF, FEEL_DEF, MAINJS, PACKJS };
