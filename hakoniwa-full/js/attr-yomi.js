/* 箱庭シミュレーター attr-yomi: 住人の「名前の読み」（ふりがな。全年齢版・R18版共通。attr-height.js の直後に読む）
   ・yomi 名前の読み：全角ひらがな（カタカナはひらがなに読み替える。ひらがな・長音以外の字は落とす。24文字まで）。任意。
     使い道：どもる台詞の頭の音（tone-plus.js の V.callAddress。「あ、あなた」を呼び方にするとき、漢字の名前なら読みの頭の音で「た、鷹野さん」）。
     将来の50音順の並びにも使う（いまは並びには使わない）
   ・保存の欄：ui.js の mk・normChar・rosterJSON・importJSON・buildInput は attr.js の A.mk・A.norm・A.exportTo・A.importFrom・A.toInput を通るので、ここで包む。
     台詞の話し手・相手（voice.js の processResult の people）へは A.voiceFor を包んで写す（p.yomi）
   ・⚙️ 設定の「話し方」の節（A.fpMoreHtml の後ろ）に欄。名簿の「住人をまとめて登録」では「鷹野（たかの） BABAB」のように名前のあとの（ひらがな）を読みにする
     （core.js の HK.parseRoster を包む。書き方は ui-import.js の FORMAT の欄）。2026-10-27 担当HR */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A || A.yomiVal) return;
  function yv(v) {
    if (typeof v !== 'string') return '';
    return v.replace(/[ァ-ヶ]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0x60); }).replace(/[^ぁ-ゖー]/g, '').slice(0, 24);
  }
  A.yomiVal = yv;
  A.yomiOf = function (c) { return c ? yv(c.yomi != null ? c.yomi : c.src ? c.src.yomi : '') : ''; };

  /* ---------- 保存・書き出し・読み込み・実行への写し（attr.js の関数を包む） ---------- */
  var mk0 = A.mk, norm0 = A.norm, ex0 = A.exportTo, im0 = A.importFrom, ti0 = A.toInput, vf0 = A.voiceFor, fm0 = A.fpMoreHtml, gf0 = A.gearField;
  A.mk = function (o, c) { o = mk0.apply(this, arguments); o.yomi = yv(c && c.yomi); return o; };
  A.norm = function (c) { var r = norm0.apply(this, arguments); c.yomi = yv(c.yomi); return r; };
  A.exportTo = function (o, c) { var r = ex0.apply(this, arguments); if (yv(c.yomi)) o.yomi = yv(c.yomi); return r; };
  A.importFrom = function (c, o) { var r = im0.apply(this, arguments); if (o.yomi != null) c.yomi = yv(String(o.yomi)); return r; };
  A.toInput = function (o, c) { var r = ti0.apply(this, arguments); if (yv(c.yomi)) o.yomi = yv(c.yomi); return r; };
  if (vf0) A.voiceFor = function (p, c) { var r = vf0.apply(this, arguments); if (p && c && yv(c.yomi)) p.yomi = yv(c.yomi); return r; };

  /* ⚙️ 設定の「話し方」の節：状況で変わる一人称の欄の下に、名前の読みの欄 */
  if (fm0) A.fpMoreHtml = function (c, esc) {
    return fm0.apply(this, arguments) + '<div class="gearrow"><label title="名前が漢字のとき、『た、鷹野さん』のようにどもる台詞の頭の音に使います">名前の読み <input type="text" data-gf="at_yomi" value="' + esc(yv(c.yomi)) + '" maxlength="24" placeholder="例：たかの" aria-label="名前の読み（ひらがな）" style="width:8em"></label>' +
      '<span class="gearhint" style="flex:1 1 12em;margin:0">名前が漢字のとき、「た、鷹野さん」のようにどもる台詞の頭の音に使います（ひらがなで。空欄でもかまいません）</span></div>';
  };
  A.gearField = function (c, f, t) {
    if (f === 'at_yomi') { c.yomi = yv(t.value); arguments[4](false); return true; }
    return gf0.apply(this, arguments);
  };

  /* 名簿の「住人をまとめて登録」：名前のあとの（ひらがな）は名前の読み（「鷹野（たかの） BABAB」「鷹野(たかの)：BABAB」） */
  var pr0 = HK.parseRoster;
  if (pr0) HK.parseRoster = function () {
    var r = pr0.apply(this, arguments);
    ((r && r.chars) || []).forEach(function (c) {
      var m = String(c.name || '').match(/^(.+?)\s*[（(]\s*([ぁ-ゖァ-ヶー\s]+?)\s*[)）]$/);
      if (m && yv(m[2]) && m[1].trim()) { c.name = m[1].trim(); c.yomi = yv(m[2]); }
    });
    return r;
  };
})();
