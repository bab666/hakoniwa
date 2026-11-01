/* 箱庭シミュレーター: 話題（利用者が登録した語を、交流・独り・結末などの出来事に時々出す）
   データ（住人タブ「話題」の節 ui-topics.js が S.topics に保存し、buildInput が input.topics に写す）：
     { id, scope, scen, group, a, b, kind, word, note }
     scope：'all' 全体／'scen' 箱庭ごと（scen=箱庭 id）／'group' グループ（group=グループ名）／'char' 住人（a=住人 id）／'pair' 住人どうし（a,b=住人 id。順不同）
     kind：KINDS の鍵（食べ物・人・物・こと・場所・作品・趣味・好きなもの・嫌いなこと）
     word：語（24字まで）、note：補足（40字まで。任意）
   実行時の口は HK.Topics.*（下）。語は利用者の入力なので、文に入れるときはそのまま（HTML の逃がしは表示側）。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var T = HK.Topics = HK.Topics || {};
  T.KINDS = [['food', '食べ物'], ['person', '人'], ['thing', '物'], ['koto', 'こと'], ['place', '場所'], ['work', '作品'], ['hobby', '趣味'], ['like', '好きなもの'], ['hate', '嫌いなこと']];
  T.SCOPES = [['all', '全体'], ['scen', '箱庭ごと'], ['group', 'グループ'], ['char', '住人'], ['pair', '住人どうし']];
  T.MAX = 300; T.WORD_LEN = 24; T.NOTE_LEN = 40;
  function has(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return true; return false; }
  function str(v, n) { return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n); }
  /* 1件を整える（壊れていれば null）。UI の保存・読み込み・一括入力と、input の受け取りの両方で使う */
  T.norm = function (t) {
    if (!t || typeof t !== 'object') return null;
    var o = { id: str(t.id, 24) || ('t' + Math.random().toString(36).slice(2, 8)), scope: has(T.SCOPES, t.scope) ? t.scope : 'all',
      scen: str(t.scen, 32), group: str(t.group, 40), a: str(t.a, 32), b: str(t.b, 32), kind: has(T.KINDS, t.kind) ? t.kind : 'koto',
      word: str(t.word, T.WORD_LEN), note: str(t.note, T.NOTE_LEN) };
    if (!o.word) return null;
    if (o.scope === 'scen' && !o.scen) return null;
    if (o.scope === 'group' && !o.group) return null;
    if (o.scope === 'char' && !o.a) return null;
    if (o.scope === 'pair' && (!o.a || !o.b || o.a === o.b)) return null;
    if (o.scope !== 'scen') o.scen = ''; if (o.scope !== 'group') o.group = ''; if (o.scope !== 'char' && o.scope !== 'pair') o.a = ''; if (o.scope !== 'pair') o.b = '';
    return o;
  };
  T.kindLabel = function (k) { for (var i = 0; i < T.KINDS.length; i++) if (T.KINDS[i][0] === k) return T.KINDS[i][1]; return ''; };
  T.scopeLabel = function (k) { for (var i = 0; i < T.SCOPES.length; i++) if (T.SCOPES[i][0] === k) return T.SCOPES[i][1]; return ''; };
})();
