(function () {
  'use strict';
  const T = window.Tools, $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  function el(n, a, t) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- STEP1 速度 ---------- */
  function drawSpeed() {
    const mb = +$('dataMb').value;
    $('dataMbV').textContent = mb;
    const tc = mb * 0.02;          // 共通鍵：1MBあたり0.02秒
    const tp = mb * 2.4;           // 公開鍵：1MBあたり2.4秒（およそ100倍以上遅い）
    $('tCommon').textContent = tc.toFixed(2) + ' 秒';
    $('tPublic').textContent = tp < 60 ? tp.toFixed(1) + ' 秒' : (tp / 60).toFixed(1) + ' 分';
    const max = Math.max(tc, tp);
    $('barCommon').style.width = (tc / max * 100) + '%';
    $('barPublic').style.width = '100%';
    const n = $('speedNote');
    n.className = 'note warn';
    n.innerHTML = '公開鍵暗号方式だけで ' + mb + 'MB を暗号化すると <strong>約' +
      (tp < 60 ? tp.toFixed(1) + '秒' : (tp / 60).toFixed(1) + '分') + '</strong>かかり、共通鍵暗号方式の <strong>約' +
      Math.round(tp / tc) + '倍</strong>の時間が必要です。<br>' +
      'だから<strong>データ本体は共通鍵で暗号化</strong>し、<strong>短い共通鍵だけを公開鍵暗号方式で渡す</strong>のです。';
  }

  /* ---------- STEP2 ハンドシェイク ---------- */
  const HS = [
    { dir: 1, msg: '「安全な通信をしたい」と伝える', hot: [0, 1],
      d: '<strong>①</strong> ブラウザがサーバに接続を要求します。' },
    { dir: -1, msg: 'サーバ証明書（＝サーバの公開鍵つき）を送る', hot: [1, 0],
      d: '<strong>②</strong> サーバは<strong>デジタル証明書</strong>を返します。この中に<strong>サーバの公開鍵</strong>が入っています。' },
    { dir: 0, msg: '証明書を検証する', hot: [0],
      d: '<strong>③</strong> ブラウザは<strong>認証局の署名</strong>を確かめ、証明書が本物か、期限内か、ドメイン名が一致するかを検証します。' },
    { dir: 0, msg: '共通鍵を作る', hot: [0],
      d: '<strong>④</strong> ブラウザが<strong>共通鍵</strong>を1つ作ります。この鍵で、あとの通信を暗号化します。' },
    { dir: 1, msg: '共通鍵を「サーバの公開鍵」で暗号化して送る', hot: [0, 1],
      d: '<strong>⑤</strong> 共通鍵を<strong>サーバの公開鍵</strong>で暗号化して送ります。途中で盗まれても、サーバの秘密鍵がなければ取り出せません。' },
    { dir: 0, msg: 'サーバの秘密鍵で共通鍵を取り出す', hot: [1],
      d: '<strong>⑥</strong> サーバは<strong>自分の秘密鍵</strong>で復号し、共通鍵を手に入れます。これで両者が同じ共通鍵を持ちました。' },
    { dir: 2, msg: '以降は共通鍵で暗号化して高速にやり取り', hot: [0, 1],
      d: '<strong>⑦</strong> ここから先は<strong>共通鍵暗号方式</strong>でやり取りします。速くて安全な通信の完成です。' }
  ];
  let hi = 0, hTimer = null;
  function drawHs() {
    const W = 640, H = 230;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': 'SSL/TLSの手順' });
    const s = HS[hi];
    [['ブラウザ', 110], ['Webサーバ', 530]].forEach(([t, x], i) => {
      svg.appendChild(el('rect', { x: x - 62, y: 30, width: 124, height: 44, rx: 3,
        class: 'actor', stroke: s.hot.indexOf(i) >= 0 ? '#123a6b' : '#15181c',
        'stroke-width': s.hot.indexOf(i) >= 0 ? 3 : 1.8 }));
      svg.appendChild(el('text', { x, y: 57, class: 'atxt' }, t));
      svg.appendChild(el('line', { x1: x, y1: 74, x2: x, y2: 200, stroke: '#e0dcd4', 'stroke-width': 1.5 }));
    });
    const y = 120;
    if (s.dir === 1 || s.dir === -1) {
      const [a, b] = s.dir === 1 ? [110, 530] : [530, 110];
      svg.appendChild(el('line', { x1: a + (s.dir === 1 ? 8 : -8), y1: y, x2: b - (s.dir === 1 ? 8 : -8), y2: y, class: 'flow hot' }));
      svg.appendChild(el('polygon', { points: s.dir === 1 ? (b - 8) + ',' + y + ' ' + (b - 20) + ',' + (y - 6) + ' ' + (b - 20) + ',' + (y + 6)
        : (b + 8) + ',' + y + ' ' + (b + 20) + ',' + (y - 6) + ' ' + (b + 20) + ',' + (y + 6), fill: '#8a5a00' }));
    } else if (s.dir === 2) {
      [y - 14, y + 14].forEach((yy, k) => {
        const [a, b] = k === 0 ? [110, 530] : [530, 110];
        svg.appendChild(el('line', { x1: a, y1: yy, x2: b, y2: yy, class: 'flow hot' }));
      });
    } else {
      const cx = s.hot[0] === 0 ? 110 : 530;
      svg.appendChild(el('rect', { x: cx - 70, y: y - 18, width: 140, height: 36, rx: 3, class: 'actor', stroke: '#8a5a00', 'stroke-width': 2.4 }));
    }
    svg.appendChild(el('text', { x: 320, y: s.dir === 0 ? y + 46 : y - 14, class: 'msg hot' }, s.msg));
    const box = $('hsBox'); box.innerHTML = ''; box.appendChild(svg);
    $('hsStage').textContent = (hi + 1) + ' / ' + HS.length;
    const n = $('hsNote');
    n.className = 'note ' + (hi === HS.length - 1 ? 'ok' : 'info');
    n.innerHTML = s.d;
  }

  /* ---------- STEP3 証明書 ---------- */
  const CERTS = {
    ok: { rows: [['発行先', 'www.example.ac.jp'], ['発行者（認証局）', 'Example CA'], ['有効期間', '2026年1月1日 〜 2027年1月1日'],
      ['公開鍵', 'RSA 2048ビット'], ['認証局の署名', 'あり（検証成功）']],
      bad: false, note: 'すべての確認に通りました。ブラウザは<strong>鍵マーク</strong>を表示し、暗号化された通信を始めます。' },
    expired: { rows: [['発行先', 'www.example.ac.jp'], ['発行者（認証局）', 'Example CA'], ['有効期間', '2020年1月1日 〜 2021年1月1日'],
      ['公開鍵', 'RSA 2048ビット'], ['認証局の署名', 'あり']],
      bad: true, note: '<strong>有効期限が切れています。</strong>期限が切れた証明書は、なりすましに使われるおそれがあるため信頼できません。ブラウザは警告を出します。' },
    name: { rows: [['発行先', 'www.other-site.com'], ['発行者（認証局）', 'Example CA'], ['有効期間', '2026年1月1日 〜 2027年1月1日'],
      ['公開鍵', 'RSA 2048ビット'], ['認証局の署名', 'あり']],
      bad: true, note: '<strong>接続しようとしているドメイン名と、証明書の発行先が一致しません。</strong>別のサイトの証明書を使っている可能性があり、なりすましが疑われます。' },
    self: { rows: [['発行先', 'www.example.ac.jp'], ['発行者（認証局）', '自分自身（自己署名）'], ['有効期間', '2026年1月1日 〜 2027年1月1日'],
      ['公開鍵', 'RSA 2048ビット'], ['認証局の署名', 'なし']],
      bad: true, note: '<strong>信頼できる認証局の署名がありません。</strong>「自分は本物です」と自分で言っているだけなので、第三者による保証がありません。' }
  };
  function drawCert(k) {
    const c = CERTS[k];
    document.querySelectorAll('[data-cert]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cert === k));
    $('certCard').className = 'certcard' + (c.bad ? ' bad' : '');
    $('certCard').innerHTML = c.rows.map(([a, b]) => '<div class="row"><div class="k">' + a + '</div><div>' + b + '</div></div>').join('');
    const n = $('certNote');
    n.className = 'note ' + (c.bad ? 'ng' : 'ok');
    n.innerHTML = (c.bad ? '<strong>この証明書は信頼できません。</strong><br>' : '<strong>この証明書は信頼できます。</strong><br>') + c.note;
  }

  /* ---------- STEP4 クイズ ---------- */
  const QUIZ = [
    { t: 'ハイブリッド暗号方式で、共通鍵暗号方式を使う理由はどれか。',
      choices: ['公開鍵暗号方式と比べて、暗号化と復号の処理速度が速いから',
                '送信者と受信者が異なる鍵を使うため鍵の管理が容易だから',
                'データが改ざんされていないことを証明できるから',
                '鍵を安全に渡す必要がないから'],
      a: '公開鍵暗号方式と比べて、暗号化と復号の処理速度が速いから',
      why: '大量のデータを速く暗号化できるのが共通鍵暗号方式の長所です。' },
    { t: 'ハイブリッド暗号方式で、公開鍵暗号方式を使う理由はどれか。',
      choices: ['共通鍵を公開鍵で暗号化すれば、受信者は自分の秘密鍵で取り出せて安全だから',
                '共通鍵を受信者の秘密鍵で暗号化できるから',
                'データが改ざんされていないことを証明できるから',
                '高速で暗号文を復号できるから'],
      a: '共通鍵を公開鍵で暗号化すれば、受信者は自分の秘密鍵で取り出せて安全だから',
      why: '鍵配送問題を解決するのが公開鍵暗号方式の役割です。「受信者の秘密鍵で暗号化」は逆なので誤りです。' },
    { t: 'SSL/TLSのハイブリッド暗号方式の説明として<strong>誤っている</strong>ものはどれか。',
      choices: ['公開鍵と秘密鍵のペアはクライアント側で生成される',
                'データの暗号化には共通鍵暗号方式が用いられる',
                '認証局はWebサーバの身元を証明するためにデジタル証明書を発行する',
                'クライアントはサーバ証明書を検証し、信頼できる場合のみ通信を確立する'],
      a: '公開鍵と秘密鍵のペアはクライアント側で生成される',
      why: '鍵のペアを作るのは<strong>サーバ側</strong>です。サーバが公開鍵を証明書に入れて配ります。' },
    { t: '共通鍵を送るときに暗号化するのに使う鍵はどれか。',
      choices: ['サーバの公開鍵', 'サーバの秘密鍵', 'クライアントの公開鍵', 'クライアントの秘密鍵'],
      a: 'サーバの公開鍵',
      why: 'サーバだけが持つ秘密鍵で取り出せるようにするため、サーバの公開鍵で暗号化します。' },
    { t: 'ブラウザで鍵マークが表示されているとき、何が言えるか。',
      choices: ['通信内容が暗号化されており、証明書の検証に通っている',
                'そのサイトが安全なサービスを提供している',
                '個人情報が漏れることはない',
                'ウイルスに感染しない'],
      a: '通信内容が暗号化されており、証明書の検証に通っている',
      why: '鍵マークは<strong>通信路が暗号化されている</strong>ことを示すだけです。サイトの内容が信頼できるかは別問題で、フィッシングサイトもhttpsを使えます。' }
  ];
  let qList = [], qi = 0, qScore = 0;
  function startQuiz() { qList = shuffle(QUIZ); qi = 0; qScore = 0; renderQ(); }
  function renderQ() {
    if (qi >= qList.length) {
      $('qText').textContent = qScore + ' / ' + qList.length + ' 問正解';
      $('qChoices').innerHTML = ''; $('qFb').hidden = true; $('qNext').disabled = true;
      $('qProgress').textContent = qList.length + ' / ' + qList.length; return;
    }
    const it = qList[qi];
    $('qProgress').textContent = (qi + 1) + ' / ' + qList.length;
    $('qScore').textContent = qScore;
    $('qText').innerHTML = it.t;
    const box = $('qChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle(it.choices).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c;
      b.addEventListener('click', () => answerQ(c));
      box.appendChild(b);
    });
    $('qFb').hidden = true; $('qNext').disabled = true;
    $('qNext').textContent = (qi === qList.length - 1) ? '結果を見る' : '次の問題';
  }
  function answerQ(c) {
    const it = qList[qi], ok = c === it.a, box = $('qChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === it.a) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    if (ok) qScore++;
    const fb = $('qFb');
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = (ok ? '正解。' : '正解は「<strong>' + it.a + '</strong>」。') + it.why;
    fb.hidden = false;
    $('qScore').textContent = qScore; $('qNext').disabled = false;
  }

  function init() {
    $('dataMb').addEventListener('input', drawSpeed);
    $('hsNext').addEventListener('click', () => { hi = (hi + 1) % HS.length; drawHs(); });
    $('hsReset').addEventListener('click', () => { hi = 0; drawHs(); });
    $('hsAuto').addEventListener('click', () => {
      if (hTimer) { clearInterval(hTimer); hTimer = null; $('hsAuto').textContent = '自動で動かす'; return; }
      $('hsAuto').textContent = '止める';
      hTimer = setInterval(() => { hi = (hi + 1) % HS.length; drawHs(); }, 2000);
    });
    document.querySelectorAll('[data-cert]').forEach(b => b.addEventListener('click', () => drawCert(b.dataset.cert)));
    $('qNext').addEventListener('click', () => { qi++; renderQ(); });
    $('qReset').addEventListener('click', startQuiz);
    window.Terms.glossary($('glossBox'), ['SSL/TLS', 'ハイブリッド暗号方式', '共通鍵暗号方式', '公開鍵暗号方式', '認証局', 'デジタル署名', 'HTTP', 'URL']);
    drawSpeed(); drawHs(); drawCert('ok'); startQuiz();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
