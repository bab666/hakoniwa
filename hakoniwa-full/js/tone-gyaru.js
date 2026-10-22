/* 箱庭シミュレーター: 奔放から派生する口調（ギャル）
   文面と台詞の言い換えは「奔放」をそのまま使い、できあがった台詞の言い回しと語尾を、最後に付け替える（名前・一人称・見本・派生元は tone-registry.js）。
   ・ギャル … 「よろ〜」「あざまる〜」「マジ」「チョー」「ヤバい」「ウケる」「〜じゃん」「〜だし」「〜っしょ」「〜くない？」「〜的な」「〜だよね〜」「知らんし」
   スラングは台詞に一つ（長い台詞でも二つ）まで、HK.lineLot で間引いて毎回は付けない。
   喘ぎ・叫び・敬語の文、「……」で沈んだ文、重い台詞（死・怖い・痛い・ごめんなさい など）はそのまま（伸ばし棒の「〜」も付けない） */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;

  /* 喘ぎ・息づかい（「ぁ」「♡」、語尾や区切りの「っ」）。「待って」「だった」の「っ」は数えない */
  var MOAN = /[ぁぃぅぇぉ♡]|[っッ](?=[…‥、。！!？?\s」〜～ー]|$)|[ぁ-ん]ー?ん[…‥]/;
  /* どもり（「す、好き」「だ、だめ」） */
  var STUTTER = /(?:^|[、…‥\s])([ぁ-んァ-ン])、\1/;
  /* 重い台詞：伸ばし棒・スラングを付けない */
  var GRAVE = /(?:死|殺|亡|葬|遺体|血|嫌|いや(?:だ|っ)|怖|こわ|痛|やめて|助けて|たすけて|許さ|許して|ごめんなさい|泣|涙|苦し|さよう?なら|別れ|逃げ|後悔|最低|寂し|さみし|悲し|かなし|つら|辛い|謝|吊|処刑|裏切)/;
  /* 敬語の文（「〜いただけるの」「お続けちょうだい」なども） */
  var KEIGO = /(?:です|ます|まし|ません|でした|ください|ござい|でしょう|いたし|申し|いただ|なさい|ちょうだい|お願いする|存じ|本日|お客様)/;
  /* 形容詞の語幹（「熱いね」→「熱くない？」）。「きれい」「嫌い」のような形容動詞は入れない */
  var ADJ = /(?:すご|かわい|可愛|おいし|美味し|うれし|嬉し|楽し|たのし|あったか|あたたか|暖か|温か|熱|暑|寒|さむ|涼し|すずし|うま|旨|面白|おもしろ|優し|やさし|甘|あま|まぶし|眩し|やわらか|柔らか|でか|デカ|多|速|早|強|高|長|話しやす|分かりやす|わかりやす|かっこよ|よ)$/;
  var OK_END = /(?:[。！？!?…‥」\n]|$)/;

  function lot(s, n) { return HK.lineLot(s, n); }

  /* 語句の置き換え（一つの台詞で一回まで）。成功したら新しい文、なければ null */
  function word(s) {
    var r;
    if (/(?:本当に|ほんとに|ほんとうに)(?![、…])/.test(s)) return s.replace(/(?:本当に|ほんとに|ほんとうに)/, 'マジで');
    if (/ほんと(?=[ぁ-ん一-鿿ァ-ヶ])(?![うはにだのっ])/.test(s)) return s.replace(/ほんと(?=[ぁ-ん一-鿿ァ-ヶ])(?![うはにだのっ])/, 'マジ');
    if ((r = s.replace(/(?:すごく|すっごく|とても|めっちゃ|めちゃくちゃ)(?=[ぁ-ん一-鿿ァ-ヶ])/, 'チョー')) !== s) return r;
    return null;
  }

  /* 語尾の付け替え。kind: 'q' 問い、'x' 叫び（！）、'' ふつう。戻り値 [文, 次の区切り] か null */
  function ending(s, kind, i, quote) {
    var m;
    /* あいさつ・お礼（叫びでも） */
    if (/^(?:じゃあ、|それじゃ、|今日は|今日も|これから|あとは|来週も|今後とも)?よろしく(?:ね|な|ー)?$/.test(s)) return s.replace(/よろしく(?:ね|な|ー)?$/, 'よろ〜');
    if ((m = s.match(/^(.*?)(?:ありがとう|ありがと)(?:ね|な|よ)?$/)) && kind !== 'q') {
      if (!m[1] || /^(?:うん、|ほんと、|ほんとに|本当に|マジで|マジ)$/.test(m[1])) return (m[1] || '') + (lot(quote, 2) ? 'あざまる〜' : 'ありがと〜');
      return m[1] + 'ありがと〜';
    }
    if (/^(?:おやすみ|またね|じゃあね|ばいばい|バイバイ|また明日|おつかれ|お疲れ)$/.test(s)) return s + '〜';
    if (kind === 'q') {
      if (/^(?:本当|ほんと|本気|マジ)(?:に|で)?$/.test(s)) return s.replace(/^(?:本当|ほんと|本気|マジ)(に|で)?$/, function (x, p) { return p ? 'マジで' : 'マジ'; });
      if ((m = s.match(/^(.*?)(?:なん|ん|の)?でしょ$/)) && m[1]) return m[1] + 'っしょ';
      return null;
    }
    /* 「知らない」→「知らんし」 */
    if (/(?:知らない|知らねえ|知らねー|知らん)(?:よ|って|し)?$/.test(s)) return s.replace(/(?:知らない|知らねえ|知らねー|知らん)(?:よ|って|し)?$/, '知らんし');
    if (/^(?:最高|サイコー)(?:だ|だね|だよ|じゃん)?$/.test(s)) return lot(quote, 2) ? 'アゲ〜' : 'マジ最高';
    if (/(?:かわいい|可愛い)(?:ね|よ|な)?$/.test(s) && lot(quote, 2)) return s.replace(/(かわい|可愛)い(?:ね|よ|な)?$/, '$1すぎ');
    if (/(?:面白い|おもしろい|笑える)(?:ね|よ|な)?$/.test(s) && !/^(?:何|なに|どこ)/.test(s) && lot(quote, 2)) return s.replace(/(?:面白い|おもしろい|笑える)(?:ね|よ|な)?$/, 'ウケる');
    if (/(?:みたいな(?:感じ)?|って感じ)$/.test(s) && s.length > 5 && lot(quote, 2)) return s.replace(/(?:みたいな(?:感じ)?|って感じ)$/, '的な');
    /* 「〜でしょ」→「〜っしょ」（「〜なんでしょ」「〜ないんでしょ」も） */
    if ((m = s.match(/^(.*?)(?:なん|ん|の)?でしょ$/)) && m[1]) return m[1] + 'っしょ';
    if (kind === 'x') return null;
    /* 「すごいね」→「ヤバくない？」、「熱いね」→「熱くない？」（同意を求める「〜くない？」） */
    if ((m = s.match(/^(.*?)(い|いい)ね$/)) && (ADJ.test(m[1]) || m[2] === 'いい' && /(?:^|[、のがはもてに]|かっこ|気持ち|仲|頭|調子|運)$/.test(m[1])) && !/(?:たい|ない|しくない)ね$/.test(s) && lot(quote, 2)) {
      var stem = m[2] === 'いい' ? m[1] + 'よ' : m[1];
      if (/すご$/.test(stem) && lot(quote, 4)) stem = stem.replace(/すご$/, 'ヤバ');
      return [stem + 'くない', '？'];
    }
    if (/(?:すごい|スゴい)(?:ね|な|よ)?$/.test(s) && lot(quote, 2)) return s.replace(/(?:すごい|スゴい)(?:ね|な|よ)?$/, 'ヤバい');
    /* 「〜だよね」→「〜だよね〜」 */
    if (/だよね$/.test(s)) return s + '〜';
    if (/(?:[いたる]|じゃん)よね$/.test(s) && lot(quote, 2)) return s + '〜';
    /* 「そうだね」→「それな〜」、「〜だね」→「〜じゃん」 */
    if (/^(?:うん、)?そうだね$/.test(s) && lot(quote, 2)) return s.replace(/そうだね$/, 'それな〜');
    if (/(?:[一-鿿ァ-ヶー々])だ(?:ね|な)$/.test(s) && !/[一-鿿]んだ[ねな]$/.test(s) && s.length > 3 && lot(quote, 2)) return s.replace(/だ(?:ね|な)$/, 'じゃん');
    /* 言い切りの理由・否定に「〜し」（「Ωだから」→「Ωだし」「怒ってない」→「怒ってないし」） */
    if (/(?:[一-鿿ァ-ヶー々]|なん)だから$/.test(s) && lot(quote, 2)) return s.replace(/から$/, 'し');
    if (/(?<![じゃでくな])ない(?:よ|って)?$/.test(s) && !/(?:しかない|じゃない|しょうがない|仕方ない|かまわない|構わない|いけない|ならない|なくない)/.test(s) && s.length >= 4 && lot(quote, 3)) return s.replace(/ない(?:よ|って)?$/, 'ないし');
    return null;
  }

  function gyaru(q, who) {
    if (!q || MOAN.test(q) || STUTTER.test(q)) return q;
    var grave = GRAVE.test(q);
    /* 驚きの「えっ！？」「ええ！？」→「え〜！？」 */
    if (!grave) q = q.replace(/^(?:えっ|ええ|えー)(?=[！？!?])/, 'え〜').replace(/^ちょっと待って/, 'ちょ、待って').replace(/やばい|やべえ|ヤベえ|やべー/g, 'ヤバい').replace(/ヤバいっ(?=[！!])/g, 'ヤバっ');
    if (grave) return q;
    var parts = q.split(/([。！？!?…‥」\n]+)/), slang = 0, swapped = false;
    var out = parts.slice();
    for (var i = 0; i < parts.length; i += 2) {
      var seg = parts[i], next = parts[i + 1] || '', prev = i ? parts[i - 1] : '';
      if (!seg || /[〜～ー]$/.test(seg)) continue;
      /* 「……」で沈んだ文（前後が「…」）はそのまま */
      if (/[…‥]/.test(prev) || /^[…‥]/.test(next) || /^[…‥、\s]/.test(seg)) continue;
      var lead = (seg.match(/^[\s　、]+/) || [''])[0], body = seg.slice(lead.length);
      if (!body || KEIGO.test(body)) continue;
      var kind = /[？?]/.test(next) ? 'q' : /[！!]/.test(next) ? 'x' : '';
      var limit = parts.length > 4 ? 2 : 1;
      if (slang >= limit) break;
      var b = body, nx = null;
      /* マジ・チョー：台詞に一回、二回に一回 */
      if (!swapped && kind !== 'q' && lot(q + i, 2)) { var w = word(b); if (w) { b = w; swapped = true; slang++; } }
      if (b.length < 9 && b !== body) { out[i] = lead + b; continue; }
      if (slang < limit) {
        var e = ending(b, kind, i, q);
        if (e) {
          if (typeof e !== 'string') { nx = e[1]; e = e[0]; }
          /* 置き換えのあとでも、短い文に二つは重ねない */
          b = e; slang++;
          if (nx) out[i + 1] = /^。/.test(next) ? nx + (i + 2 < parts.length && parts[i + 2] ? '　' : '') + next.slice(1) : nx + next;
        }
      }
      out[i] = lead + b;
    }
    return out.join('');
  }
  V.gyaruQuote = gyaru;
  HK.toneFinish('gyaru', gyaru);
})();
