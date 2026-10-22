/* 箱庭シミュレーター: 穏やかから派生する口調（お姉さん）
   文面と台詞の言い換えは「穏やか」をそのまま使い（書き下ろし・直しも穏やかのものを借りる。お姉さんの直しがあればそちらを優先）、
   できあがった台詞の語尾だけを、最後に付け替える（名前・一人称・並びは tone-registry.js）。
   ・お姉さん … 「〜よ」「〜わよ」「〜わね」「〜のよ」「〜かしら」「〜ってことね？」。余裕があって面倒見がいい
   「〜わ」は台詞の最後の文だけ（毎文につけるとくどい）。喘ぎ・叫び・敬語の文はそのまま */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;

  var YOU = /(?:お前|おまえ|てめえ|貴様)(?!さん|方)|(?:きみ|(?<![大姫主父母諸細若暴])君)(?=(?:は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なら|だけ|たち|ら|だ|じゃ|か|な|から|へ|や|しか|まで|より|一人|自身))/g;
  /* もう女性的な語尾・敬語・頼みごと・呼びかけで終わる文は触らない */
  var KEEP = /(?:わ|わよ|わね|のよ|のよね|かしら|よね|です|ます|ました|ません|でした|でしょう|ましょう|ください|なさい|ちょうだい|[てで]よ|[てで]ね|[てで])$/;
  /* 「〜わ」を足してよい終わり方（動詞・形容詞・「ない」「た」の言い切り） */
  var PLAIN_END = /(?:[るすむぬぐぶ]|(?<![一二三四五六七八九十幾い])つ|(?<![しか]|なんとな|ようや|おそら|しばら|まった|全|早|遅|強|弱|多|軽|深|長|短|近|遠|よ)く|(?<![おこそとのほもよろごぞどぼぽょ])う|思う|(?<!ちょうだ|なさ|くださ|^は|^お|^ね|^ほ|願|違|遣|合|伝|会|払|思|迷|戦|争|使|扱|祝|誘|呪|占|酔|匂|類|お互)い|た)$/;

  function aneOne(s, ask, last) {
    var m;
    if (ask) {
      if (/(?:って|という)こと$/.test(s)) return s + 'ね';
      if (/かな$/.test(s)) return s.replace(/かな$/, 'かしら');
      if (/(?:だろう|だろ)$/.test(s)) return s.replace(/(?:だろう|だろ)$/, 'でしょ');
      if (/(?:の|ん)(?:か|だ)$/.test(s)) return s.replace(/(?:の|ん)(?:か|だ)$/, 'の');
      if (/(?<![まやだ])だ$/.test(s)) return s.replace(/だ$/, 'なの');
      return s;
    }
    if (KEEP.test(s)) return s;
    /* 「飲んだ」「選んだよ」は過去形（「〜のよ」にしない） */
    if ((m = s.match(/^(.*[一-鿿々]ん)だ(よ|ね)?$/))) return last ? m[1] + 'だわ' + (m[2] || '') : s;
    if (/^そうなんだ$/.test(s)) return 'そうなの';
    /* 「〜んだ」「〜なんだよ」→「〜のよ」 */
    if ((m = s.match(/^(.*)(?:ん|の)だ(よ|よね|ね)?$/)) && m[1]) return m[1] + (m[2] === 'ね' ? 'のね' : m[2] === 'よね' ? 'のよね' : 'のよ');
    if (/だよ[ねな]$/.test(s)) return s.replace(/だよ[ねな]$/, 'よね');
    if (/(?:だろう|だろ)$/.test(s)) return s.replace(/(?:だろう|だろ)$/, 'でしょう');
    if (/かな$/.test(s)) return s.replace(/かな$/, 'かしら');
    if (/じゃん$/.test(s)) return s.replace(/じゃん$/, 'じゃない');
    if (/[ぞぜ]$/.test(s)) return s.replace(/(だ)?[ぞぜ]$/, function (x, d) { return d ? 'よ' : 'わよ'; });
    /* 名詞・形容動詞＋だ／だよ／だね／だな → よ／ね（「本物だよ」→「本物よ」、「大げさだね」→「大げさね」）。「まだ」「やだ」はそのまま */
    if (/(?<![まやだ])だ(?:よ)?$/.test(s) && s.length > 2) return s.replace(/だ(?:よ)?$/, 'よ');
    if (/(?<![まやだ])だ[ねな]$/.test(s) && s.length > 2) return s.replace(/だ[ねな]$/, 'ね');
    if (/[おこそとのほもよろごぞどぼぽ]うな$/.test(s)) return s.replace(/な$/, 'ね');
    if (/[いた]な$/.test(s)) return s.replace(/な$/, last ? 'わね' : 'ね');
    if (!last) return s;
    /* 最後の文だけ：「いいよ」→「いいわよ」、「頑張ったね」→「頑張ったわね」、「知ってる」→「知ってるわ」 */
    if (/よ$/.test(s) && PLAIN_END.test(s.slice(0, -1))) return s.replace(/よ$/, 'わよ');
    if (/ね$/.test(s) && PLAIN_END.test(s.slice(0, -1)) && !/(?:また|じゃ)ね$/.test(s)) return s.replace(/ね$/, 'わね');
    if (s.length >= 3 && PLAIN_END.test(s) && !/じゃない$/.test(s)) return s + 'わ';
    return s;
  }
  function ane(q) {
    q = q.replace(YOU, 'あなた').replace(/おやおや/g, 'あらあら').replace(/(^|[、…\s])おや(?=[、…])/g, '$1あら')
      .replace(/(^|[、…\s])おい、/g, '$1ちょっと、').replace(/てやる(?=[。！？…、」]|$)/g, 'てあげる').replace(/てやろう/g, 'てあげよう').replace(/てやった/g, 'てあげた');
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1;
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^\s、]/.test(seg)) lastI = i; });
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var next = parts[i + 1] || '';
      /* 叫び（！）・喘ぎ（っ・ぁ・♡）の文はそのまま */
      if (/[！!]/.test(next) || /[っッぁぃぅぇぉー〜～♡]$/.test(seg)) return seg;
      var lead = (seg.match(/^[…‥、\s]+/) || [''])[0], tail = (seg.match(/[、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      return body ? lead + aneOne(body, /[？?]/.test(next), i === lastI) + tail : seg;
    }).join('');
  }
  V.aneQuote = ane;
  HK.toneFinish('ane', ane);
})();
