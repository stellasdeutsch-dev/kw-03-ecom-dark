/* Отрисовка блоков сайта из данных content.<lang>.json.
   Одна функция для двух мест: build.py вызывает её через node и вшивает готовый HTML в страницу
   (так весь контент виден без JS), а app.js берёт отсюда md() и lessonsHtml() для переключений. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SiteRender = api;
})(this, function () {
  'use strict';
  var S = { links: {} }, BASE = '';

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function md(s) {
    return esc(s || '')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/==(.+?)==/g, '<em class="hl">$1</em>')
      .replace(/\n/g, '<br>');
  }
  function src(p) { return /^https?:/.test(p) ? p : BASE + p; }
  function href(h) {
    if (!h) return '#';
    if (S.links[h]) return S.links[h];
    return h;
  }
  function ext(h) { return /^https?:/.test(href(h)) ? ' target="_blank" rel="noopener"' : ''; }
  function img(o, cls, extra) {
    return '<img class="' + (cls || '') + '" src="' + src(o.src || o.img) + '" alt="' + esc(o.alt || '') + '"' +
      (o.w ? ' width="' + o.w + '" height="' + o.h + '"' : '') + ' loading="lazy" decoding="async"' + (extra || '') + '>';
  }
  function framed(text, tag) {
    tag = tag || 'span';
    return '<' + tag + ' class="framed">' + md(text) + '<i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i></' + tag + '>';
  }
  function d(i, step) { return ' style="--d:' + (i * (step || 0.08)).toFixed(2) + 's"'; }

  /* Иконки: свой набор, линия 2px со скруглёнными концами, как у образца. Одна иконка на один смысл. */
  var I = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.2 4L19 7"/>',
    play: '<path d="M9 7l8 5-8 5z" fill="currentColor" stroke="none"/>',
    gift: '<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
    repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 014-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 01-4 4H4"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
    warn: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.2v.3"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    fire: '<path d="M12 22c4.4 0 7-2.9 7-6.8 0-3.6-2.4-5.6-3.7-8.2-.5 2-1.6 3.1-2.8 3.6.3-3.4-1-6.4-4-8.6.2 3.3-1.6 5.3-3.1 7.3C4.3 11 5 12.6 5 15.2 5 19.1 7.6 22 12 22z" fill="currentColor" stroke="none"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.4-6.5 8-6.5s7 2 8 6.5"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.6"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6M15.5 14.2c3 .1 5.3 1.8 6 5.3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    aperture: '<circle cx="12" cy="12" r="9"/><path d="M12 3l3.5 7M21 12l-7.5 1M16.5 19.8L12 14M7.5 19.8L10 13M3 12l7.5-1M7.5 4.2L12 10"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 6 7.5M11 5c-.6 3.4-3 6.6-6.5 8"/><path d="M13 21l4-10 4 10M14.5 17.5h5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M8 17h2"/>',
    calcheck: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/>',
    books: '<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="M15.5 6l3.5-1 3 14.5-3.5 1z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M8.5 21h7"/>',
    chart: '<path d="M4 20h16"/><path d="M6 16l4-4 3 3 5-6"/><path d="M15 9h3v3"/>',
    bolt: '<path d="M13 2L5 13.5h6L10 22l8-11.5h-6z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3M9.5 7h5M9.5 10h5M9.5 13h3"/>',
    rhythm: '<circle cx="12" cy="12" r="9"/><path d="M12 12V3M12 12l7.8 4.5M12 12l-7.8 4.5"/>',
    headphones: '<path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3" y="14" width="4.5" height="7" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="7" rx="1.5"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 015 .9c0 1.7-2.5 2.2-2.5 3.8M12 17.2v.3"/>',
    flag: '<path d="M5 21V4M5 4.5h11l-2 3.5 2 3.5H5"/>',
    letters: '<path d="M3 18l4.5-12L12 18M4.7 13.5h5.6"/><circle cx="17.5" cy="15" r="2.8"/><path d="M20.3 12v6"/>',
    cards: '<rect x="3" y="7" width="13" height="13" rx="2"/><path d="M8 4h11a2 2 0 012 2v11M7 12h5M7 15.5h3"/>',
    quote: '<path d="M4 5h16v11h-7l-4 4v-4H4z"/><path d="M9 9v3M12.5 9v3"/>',
    talk: '<path d="M3 4h12v8H8l-3 3v-3H3z"/><path d="M18 9h3v8h-2v3l-3-3h-5v-2"/>',
    checklist: '<path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5M11 6.5h9.5M11 12.5h9.5M11 18.5h9.5"/>',
    map: '<path d="M3 6l6-2.5 6 2.5 6-2.5v14.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 3.5v14.5M15 6v14.5"/>',
    dashboard: '<rect x="3.5" y="3.5" width="7" height="9" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.5"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20"/>',
    sparkle: '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    pair: '<rect x="3" y="7" width="10" height="10" rx="2"/><rect x="11" y="7" width="10" height="10" rx="2"/>',
    wave: '<path d="M3 12h1.5M7 8.5v7M11 5v14M15 8v8M19 10.5v3M21.5 12H20"/>',
    cap: '<path d="M2 9.5L12 5l10 4.5-10 4.5z"/><path d="M6 11.5V16c3.5 2.5 8.5 2.5 12 0v-4.5M21 10v5"/>',
    exam: '<path d="M14 3H6a1.5 1.5 0 00-1.5 1.5v15A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5V8.5z"/><path d="M14 3v5.5h5.5M8 14l2.5 2.5L15 12"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v2M3 13h18"/>',
    suitcase: '<rect x="6" y="6" width="12" height="13" rx="2"/><path d="M9.5 6V3.5h5V6M10 9.5v6M14 9.5v6M8.5 19v2M15.5 19v2"/>',
    house: '<path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20"/>',
    sound: '<path d="M4 9.5h4L13 5v14l-5-4.5H4z"/><path d="M16.5 9a4 4 0 010 6M19 6.5a7.5 7.5 0 010 11"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10.5h14V9M10 13h4"/>',
    cursor: '<path d="M5 3l14 7-6 1.5L10.5 18z"/><path d="M13 11.5l5.5 5.5"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
    signpost: '<path d="M12 3v18M5 5.5h11l3 2.5-3 2.5H5zM19 13H8l-3 2.5L8 18h11z"/>',
    teacher: '<circle cx="8" cy="7" r="3"/><path d="M2.5 20c.5-4 2.8-6 5.5-6s5 2 5.5 6"/><rect x="13" y="4" width="8.5" height="7" rx="1"/><path d="M15.5 7.5h3.5"/>',
    restart: '<path d="M4 4v5h5"/><path d="M5.2 15a7.5 7.5 0 101.6-7.6L4 9"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M6 6l9-3 1.5 3"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
    medal: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M2.5 3.5h3l2.4 11.5h10.6L21 7H7"/>',
    down: '<path d="M12 4v15M6 13l6 6 6-6"/>',
    restartAlt: '<path d="M20 12a8 8 0 11-2.3-5.6M20 4v4.5h-4.5"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; }

  /* Иконка кнопки по её смыслу: покупка, выбор цели, вопрос в WhatsApp, чтение */
  function btnIcon(b) {
    if (b.icon) return b.icon;
    if (b.href === 'buy') return 'cart';
    if (b.href === 'wa') return 'chat';
    if (b.href === '#path') return 'target';
    if (b.href === '#why') return 'down';
    return '';
  }
  function btn(b, extraCls) {
    var n = btnIcon(b);
    return '<a class="btn btn-' + (b.style || 'red') + ' ' + (extraCls || '') + '" href="' + esc(href(b.href)) + '"' + ext(b.href) + '>' +
      (n ? ic(n, 'btn-ic') : '') + '<span>' + esc(b.text) + '</span></a>';
  }
  /* Счётчик: «210+» превращается в число, которое набегает, и хвост «+». Без JS видно готовое число. */
  function counter(s) {
    var m = String(s).match(/^(\D*)(\d+)(.*)$/);
    if (!m) return esc(s);
    return esc(m[1]) + '<span class="count" data-to="' + m[2] + '">' + m[2] + '</span>' + esc(m[3]);
  }

  /* ---------- blocks ---------- */
  var R = {};

  R.hero = function (b) {
    var chips = b.chips.map(function (c) {
      var inner = '<b>' + esc(c.big) + '</b><small>' + esc(c.small) + '</small>';
      return c.framed ? '<li class="chip framed">' + inner + '<i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i></li>' : '<li class="chip">' + inner + '</li>';
    }).join('');
    var lines = b.titleLines.map(function (l, i) {
      var isLast = i === b.titleLines.length - 1;
      return '<span class="hero-line">' + md(l) + (isLast && b.note ? '<small class="hero-note">' + md(b.note) + '</small>' : '') + '</span>';
    }).join('');
    var cards = (b.cards || []).map(function (c, i) {
      return '<div class="fcard fcard-' + (i + 1) + '" aria-hidden="true"><p><i class="dot"></i>' + esc(c.word) + '</p><p class="fc-sub"><span>' + esc(c.note) + '</span><span class="fc-line"></span><span>повтор</span></p><p class="fc-tr">Перевод: ' + esc(c.tr) + '</p></div>';
    }).join('');
    return '<section class="hero" id="' + b.id + '" data-block="Первый экран">' +
      '<div class="hero-bg"><img src="' + src(b.bg) + '" alt="" width="1280" height="720" fetchpriority="high"></div>' +
      (b.bgWord ? '<div class="hero-word" aria-hidden="true">' + esc(b.bgWord) + '</div>' : '') +
      cards +
      '<div class="wrap hero-in">' +
        '<ul class="chips reveal">' + chips + '</ul>' +
        '<h1 class="hero-title reveal"' + d(1, 0.1) + '><span class="hero-line hero-first"><b>' + esc(b.titleBold) + '</b><span class="badge">' + esc(b.badge) + '<i class="badge-sep"></i>' + ic('clock') + '</span></span>' + lines + '</h1>' +
        '<p class="hero-sub reveal"' + d(2, 0.1) + '>' + md(b.sub) + '</p>' +
        '<div class="hero-cta reveal"' + d(3, 0.1) + '>' + btn({ text: b.cta.text, href: b.cta.href, style: 'red' }, 'btn-big') +
        '<p class="sign">' + b.sign.map(esc).join('<br>') + '</p></div>' +
      '</div>' +
      '<div class="hero-person reveal"' + d(2, 0.1) + '>' + img(b.person, '', ' fetchpriority="high"').replace(' loading="lazy"', '') + '</div>' +
    '</section>';
  };

  R.why = function (b) {
    var items = b.items.map(function (it, i) {
      return '<li class="why-item reveal"' + d(i) + '><i class="why-dot">' + (i + 1) + '</i>' +
        '<div class="why-circle">' + img({ src: it.img, alt: it.alt, w: 360, h: 347 }) + '</div>' +
        '<h3>' + md(it.title) + '</h3><p>' + md(it.text) + '</p></li>';
    }).join('');
    return '<section class="why dark" id="' + b.id + '" data-block="Почему">' +
      '<div class="wrap"><h2 class="h2 center reveal">' + esc(b.title) + ' ' + framed(b.titleFramed) + '</h2>' +
      '<div class="why-arc draw" aria-hidden="true"><svg viewBox="0 0 800 80" preserveAspectRatio="none"><path d="M10 75 Q400 -40 790 75" /></svg></div>' +
      '<ul class="why-list">' + items + '</ul></div></section>';
  };

  function cube(it, n) {
    return '<div class="cube"><span class="cube-n">' + n + '</span>' + img({ src: it.img, alt: it.alt, w: it.w, h: it.h }, 'cube-img') + '</div>';
  }
  R.who = function (b) {
    var top = b.items.slice(0, 3).map(function (it, i) {
      return '<li class="who-item reveal"' + d(i) + '>' + cube(it, i + 1) + '<p>' + md(it.text) + '</p></li>';
    }).join('');
    var bottom = b.items.slice(3).map(function (it, i) {
      return '<li class="who-card reveal"' + d(i) + '>' + cube(it, i + 4) + '<i class="ck">' + ic(it.icon || 'check') + '</i><p>' + md(it.text) + '</p></li>';
    }).join('');
    return '<section class="who dark" id="' + b.id + '" data-block="Кому подойдёт">' +
      '<div class="wrap"><h2 class="h2 center reveal">' + framed(b.titleFramed) + '<br>' + esc(b.title) + '</h2>' +
      '<ul class="who-top">' + top + '</ul><ul class="who-bottom">' + bottom + '</ul></div></section>';
  };

  R.result = function (b) {
    function col(arr, icons, side) {
      return arr.map(function (t, i) {
        return '<li class="res-item res-' + side + (i + 1) + ' reveal"' + d(i, 0.1) + '><i class="ck">' + ic((icons || [])[i] || 'check') + '</i><p>' + md(t) + '</p></li>';
      }).join('');
    }
    var tags = b.tags.map(function (t, i) {
      return '<div class="status status-' + (i + 1) + '" aria-hidden="true"><p><i class="sd on"></i>' + esc(t[0]) + '</p><p><i class="sd on"></i>' + esc(t[1]) + '</p><p class="st-sm">' + esc(t[2]) + '</p><p><i class="sd"></i>' + esc(t[3]) + '</p></div>';
    }).join('');
    return '<section class="result" id="' + b.id + '" data-block="Результат">' +
      '<div class="wrap"><div class="res-panel">' +
        '<img class="res-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' + tags +
        '<h2 class="h2 center ink reveal">' + md(b.title) + '</h2>' +
        '<ul class="res-list res-left">' + col(b.left, b.leftIcons, 'l') + '</ul>' +
        '<ul class="res-list res-right">' + col(b.right, b.rightIcons, 'r') + '</ul>' +
        '<div class="res-person reveal"' + d(2) + '><i class="res-halo"></i>' + img(b.person) + '</div>' +
      '</div><div class="res-arc" aria-hidden="true"></div></div></section>';
  };

  R.format = function (b) {
    var it = b.items.map(function (t, i) {
      return '<li class="fmt-item fmt-' + (i + 1) + ' reveal"' + d(i, 0.08) + '><i class="fmt-line" aria-hidden="true"></i><span class="num">' + (i + 1) + '</span><i class="ck">' + ic((b.icons || [])[i] || 'check') + '</i><p>' + md(t) + '</p></li>';
    }).join('');
    var t = esc(b.title);
    var withPlay = t.replace(/[оО]/, function () { return '<span class="play-o">' + ic('play') + '</span>'; });
    return '<section class="format dark" id="' + b.id + '" data-block="Формат">' +
      '<div class="wrap fmt-grid"><ul class="fmt-items">' + it + '</ul>' +
      '<div class="fmt-center reveal"><p class="kicker">' + esc(b.kicker) + '</p><h2 class="fmt-title"><span class="fmt-big" aria-label="' + t + '">' + withPlay + '</span><span class="fmt-small">' + esc(b.title2) + '</span></h2>' +
      '<div class="fmt-badge"><i class="fmt-play">' + ic('play') + '</i><b>' + counter(b.badgeNum) + '</b><span>' + esc(b.badgeText) + '</span></div></div>' +
      '</div></section>';
  };

  function lessonsHtml(m) {
    return m.lessons.map(function (l, i) { return '<li' + d(i, 0.06) + '><i class="ls-dot" aria-hidden="true"></i><b>' + esc(l[0]) + '</b> ' + md(l[1]) + '</li>'; }).join('');
  }
  function tileInner(m) {
    return (m.icon ? '<i class="tile-ic">' + ic(m.icon) + '</i>' : '') + '<span>' + esc(m.name) + '</span>';
  }
  R.program = function (b) {
    var all = b.modules.concat([b.final]);
    var tiles = b.modules.map(function (m, i) {
      return '<button class="tile reveal' + (i === 0 ? ' on' : '') + '" type="button" data-m="' + i + '" aria-pressed="' + (i === 0) + '"' + d(i, 0.06) + '>' + tileInner(m) + '</button>';
    }).join('');
    var extras = b.extras.map(function (e, i) {
      var idx = e.open === 'final' ? b.modules.length : e.open;
      return '<li class="reveal"' + d(i, 0.07) + '><button class="extra" type="button" data-open="' + idx + '"><i class="extra-ic">' + ic(e.icon) + '</i><span>' + md(e.text) + '</span></button></li>';
    }).join('');
    var data = encodeURIComponent(JSON.stringify(all));
    return '<section class="program dark" id="' + b.id + '" data-block="План" data-modules="' + data + '">' +
      '<div class="wrap"><div class="frame"><i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i>' +
      '<div class="bg-word" aria-hidden="true">' + esc(b.bgWord) + '</div>' +
      '<h2 class="h2 center reveal">' + esc(b.title) + '</h2>' +
      '<div class="prog-grid"><div class="prog-left">' +
        '<p class="prog-name framed" aria-live="polite">' + esc(all[0].name) + '<i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i></p>' +
        '<ul class="lessons draw">' + lessonsHtml(all[0]) + '</ul>' +
        '<div class="note-card"><p>' + md(all[0].note) + '</p></div>' +
      '</div><div class="prog-right"><div class="tiles">' + tiles + '</div>' +
        '<button class="tile tile-final" type="button" data-m="' + b.modules.length + '" aria-pressed="false">' + tileInner(b.final) + '</button>' +
      '</div></div>' +
      '<div class="extras-head"><h3>' + esc(b.extraTitle) + '</h3><span class="pill">' + ic('gift', 'pill-gift') + esc(b.extraPill) + '</span><i class="dash-line draw"></i></div>' +
      '<ul class="extras">' + extras + '</ul>' +
      '</div></div></section>';
  };

  R.speakers = function (b) {
    var items = b.items.map(function (it, i) {
      return '<li class="sp-item reveal"' + d(i) + '><a class="sp-photo" href="' + esc(href(it.href)) + '"' + ext(it.href) + '>' + img({ src: it.img, alt: it.alt, w: it.w || 520, h: it.h || 520 }) + '</a>' +
        '<div class="sp-body"><h3>' + md(it.name) + '</h3>' + (it.sub ? '<p class="sp-sub">' + esc(it.sub) + '</p>' : '') +
        '<div class="ribbon"><b>' + esc(it.ribbonBig) + '</b><span>' + esc(it.ribbonSmall) + '</span></div></div></li>';
    }).join('');
    var decor = b.decor ? '<div class="sp-decor reveal"' + d(2) + '>' + img(b.decor) + '</div>' : '';
    return '<section class="speakers" id="' + b.id + '" data-block="Реклама платформы: авторы">' +
      '<div class="wrap"><div class="sp-panel' + (b.decor ? ' has-decor' : '') + '"><div class="sp-head"><i class="dbox draw"></i><h2 class="h2 center ink reveal">' + md(b.title) + '</h2><i class="dbox draw"></i></div>' +
      '<div class="sp-row"><ul class="sp-list n' + b.items.length + '">' + items + '</ul>' + decor + '</div></div>' +
      '<div class="sp-tab"><p class="reveal">' + md(b.intro) + '</p><div class="btn-row reveal"' + d(1) + '>' + b.buttons.map(function (x) { return btn(x); }).join('') + '</div></div>' +
      '</div></section>';
  };

  R.gallery = function (b) {
    var tabs = b.tabs.map(function (t, i) {
      return '<button class="gtab' + (i === 0 ? ' on' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" data-t="' + i + '">' + ic('lang') + esc(t.name) + '</button>';
    }).join('');
    var panes = b.tabs.map(function (t, ti) {
      var big = t.shots[0];
      var tiles = t.shots.map(function (s, si) {
        return '<button class="tile gtile reveal' + (si === 0 ? ' on' : '') + '" type="button" data-s="' + si + '" data-src="' + src(s.src) + '" data-w="' + s.w + '" data-h="' + s.h + '" data-cap="' + esc(s.cap) + '" data-text="' + esc(s.text) + '" aria-pressed="' + (si === 0) + '"' + d(si, 0.07) + '>' +
          (s.icon ? '<i class="tile-ic">' + ic(s.icon) + '</i>' : '') + '<b>' + esc(s.cap) + '</b><span>' + esc(s.text) + '</span></button>';
      }).join('');
      return '<div class="gpane' + (ti === 0 ? ' on' : '') + '" role="tabpanel" data-t="' + ti + '"' + (ti === 0 ? '' : ' hidden') + '>' +
        '<div class="prog-grid"><div class="prog-left reveal">' +
          '<figure class="browser"><div class="browser-bar"><i></i><i></i><i></i></div>' + img({ src: big.src, w: big.w, h: big.h, alt: t.name + ': ' + big.cap }, 'g-big') +
          '<figcaption><b class="g-cap">' + esc(big.cap) + '</b> <span class="g-text">' + esc(big.text) + '</span></figcaption></figure>' +
          '<div class="note-card"><p>' + md(t.note) + '</p></div>' +
        '</div><div class="prog-right"><div class="tiles">' + tiles + '</div>' +
          '<a class="tile tile-final tile-link" href="' + esc(href(t.href)) + '"' + ext(t.href) + '><i class="tile-ic">' + ic('cart') + '</i><span>Купить доступ к ' + esc(t.name) + ' за 30&nbsp;€</span></a>' +
        '</div></div></div>';
    }).join('');
    return '<section class="program gallery dark" id="' + b.id + '" data-block="Реклама платформы: внутри">' +
      '<div class="wrap"><div class="frame"><i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i>' +
      '<div class="bg-word" aria-hidden="true">' + esc(b.bgWord) + '</div>' +
      '<h2 class="h2 center reveal">' + esc(b.title) + '</h2>' + (b.tabs.length > 1 ? '<div class="gtabs" role="tablist">' + tabs + '</div>' : '') + panes +
      '</div></div></section>';
  };

  R.path = function (b) {
    var slides = b.slides.map(function (s, i) {
      return '<div class="pslide' + (i === 0 ? ' on' : '') + '" data-i="' + i + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<div class="pt pt-a"><p class="pt-head"><i class="ring"></i>Точка А <span class="pt-tag">' + esc(s.a.tag) + '</span></p><p>' + md(s.a.text) + '</p></div>' +
        '<div class="pt-photo"><p class="pt-name">' + ic('right', 'arr arr-l') + esc(s.name) + ic('left', 'arr arr-r') + '</p>' + img({ src: s.photo, alt: s.alt, w: s.w || 520, h: s.h || 520 }) + '<i class="pt-fire">' + ic('fire') + ic('fire') + ic('fire') + '</i><p class="pt-bottom">' + esc(s.bottom) + '</p></div>' +
        '<div class="pt pt-b"><p class="pt-head"><i class="ring on"></i>Точка Б <span class="pt-tag">' + esc(s.b.tag) + '</span></p><p>' + md(s.b.text) + '</p></div>' +
      '</div>';
    }).join('');
    var goals = b.slides.length > 1 && b.slides[0].goal ? '<div class="goals" role="tablist" aria-label="Цели">' + b.slides.map(function (s, i) {
      return '<button class="goal reveal' + (i === 0 ? ' on' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" data-i="' + i + '"' + d(i, 0.07) + '>' + (s.icon ? ic(s.icon, 'goal-ic') : '') + '<span>' + esc(s.goal) + '</span></button>';
    }).join('') + '</div>' : '';
    return '<section class="path" id="' + b.id + '" data-block="Реклама платформы: путь">' +
      '<div class="wrap"><div class="path-panel">' +
        '<div class="path-head reveal"><h2 class="h2 ink">' + md(b.title) + ' <span class="ytag">' + esc(b.tag) + '</span></h2>' +
        '<div class="path-side"><i class="sd-a">A</i>' + ic('fire', 'side-fire') + '<p>' + md(b.side) + '</p><i class="sd-b">B</i></div></div>' +
        goals +
        '<div class="pslider reveal"><button class="pnav pprev" type="button" aria-label="Предыдущий">' + ic('left') + '</button>' + slides +
        '<button class="pnav pnext" type="button" aria-label="Следующий">' + ic('right') + '</button></div>' +
      '</div></div></section>';
  };

  /* Круговая диаграмма тарифа: SVG-сектора из сплошных цветов */
  function pie(parts, style) {
    var acc = 0, cols = style === 'dark' ? ['#fd3d5e', '#ffffff'] : ['#fd3d5e', '#2f2f2f', '#f1f1f1'];
    var segs = '', labels = '';
    parts.forEach(function (p, i) {
      var from = acc; acc += p[1];
      var col = cols[i % cols.length];
      segs += '<circle r="15.9155" cx="32" cy="32" fill="none" stroke="' + col + '" stroke-width="31.831" stroke-dasharray="' + p[1] + ' ' + (100 - p[1]) + '" stroke-dashoffset="' + (25 - from) + '"/>';
      var mid = (from + acc) / 2 / 100 * Math.PI * 2 - Math.PI / 2;
      labels += '<span class="pie-l" style="left:' + (50 + Math.cos(mid) * 30).toFixed(1) + '%;top:' + (50 + Math.sin(mid) * 30).toFixed(1) + '%;color:' + ((col === '#ffffff' || col === '#f1f1f1') ? '#2f2f2f' : '#fff') + '">' + esc(p[0]) + '</span>';
    });
    return '<div class="pie-tab"><div class="pie"><svg class="pie-svg" viewBox="0 0 64 64" aria-hidden="true">' + segs + '</svg>' + labels + '</div></div>';
  }
  R.tariffs = function (b) {
    var cards = b.cards.map(function (c, i) {
      var icons = c.itemIcons || [];
      return '<li class="tcard t-' + c.style + ' reveal"' + d(i) + '><h3 class="t-name">' + esc(c.name) + '</h3>' + pie(c.pie, c.style) +
        '<div class="t-body"><i class="t-icon">' + ic(c.icon) + '</i><ul>' + c.items.map(function (x, k) {
          return '<li' + d(k, 0.07) + '>' + (icons[k] ? '<i class="t-li-ic">' + ic(icons[k]) + '</i>' : '') + '<span>' + md(x) + '</span></li>';
        }).join('') + '</ul></div>' +
        '<div class="t-price"><span class="t-ribbon">' + esc(c.ribbon) + '</span><p class="t-note">' + esc(c.priceNote) + '</p><p class="t-sum">' + esc(c.price) + '</p>' +
        btn({ text: c.button, href: c.href, style: c.style === 'outline' ? 'gold' : 'red' }, 'btn-sm') + '</div></li>';
    }).join('');
    var m = b.mentor;
    return '<section class="tariffs" id="' + b.id + '" data-block="Реклама платформы: стоимость">' +
      '<div class="t-stripe" aria-hidden="true"></div>' +
      '<div class="wrap"><h2 class="h2 center reveal">' + framed(b.title) + '</h2><ul class="tcards n' + b.cards.length + '">' + cards + '</ul>' +
      (m ? '<div class="mentor reveal"><div class="mentor-in"><h3>' + esc(m.title) + '</h3>' +
        '<p class="m-pill"><i class="m-av">' + ic('chat') + '</i><span>' + md(m.pill) + '</span><i class="m-dot"></i></p><i class="m-line"></i>' +
        '<div class="m-row"><i class="m-gear">' + ic('gear') + '</i><p>' + md(m.note) + '</p>' + btn({ text: m.button, href: m.href, style: 'red' }, 'btn-sm') + '</div></div>' +
        '<div class="m-person">' + img(m.person) + '</div></div>' : '') +
      '</div></section>';
  };

  R.author = function (b) {
    var ringId = 'ring-' + b.id;
    return '<section class="author" id="' + b.id + '" data-block="Реклама платформы: автор">' +
      '<div class="wrap"><div class="au-panel"><img class="au-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' +
        '<div class="au-text"><p class="au-label reveal">' + ic('user') + esc(b.label) + '</p><h2 class="h2 ink reveal"' + d(1) + '>' + esc(b.title) + '</h2>' +
        '<div class="au-stats reveal"' + d(2) + '>' + b.stats.map(function (s) { return '<div><b>' + counter(s.big) + '</b><span>' + md(s.small) + '</span></div>'; }).join('') + '</div><i class="au-hr draw"></i>' +
        '<ul class="au-checks">' + b.checks.map(function (c, i) { return '<li class="reveal"' + d(i + 3) + '><i class="cb">' + ic(c.icon || 'check') + '</i><b>' + esc(c.big) + '</b><span>' + md(c.small) + '</span></li>'; }).join('') + '</ul></div>' +
        '<div class="au-person reveal"' + d(1) + '>' + img(b.person) + '</div>' +
        '<div class="au-badge draw"><svg class="au-ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="' + ringId + '" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"/></defs><text><textPath href="#' + ringId + '">' + esc(b.ring) + '</textPath></text></svg>' +
          '<div class="au-badge-in"><i class="au-badge-ic">' + ic('people') + '</i><b>' + esc(b.badgeTitle) + '</b><span>' + md(b.badgeText) + '</span></div></div>' +
      '</div></div></section>';
  };

  R.faq = function (b) {
    var items = b.items.map(function (it, i) {
      var n = i + 1, open = i === 0;
      return '<li class="qa reveal' + (open ? ' open' : '') + '"' + d(i, 0.06) + '><button class="qa-q" type="button" aria-expanded="' + open + '" id="q' + n + '" aria-controls="a' + n + '"><span class="qa-n">' + (it.icon ? ic(it.icon) : n) + '</span><span class="qa-t">' + esc(it.q) + '</span>' + ic('chevron', 'qa-ch') + '</button>' +
        '<div class="qa-a" id="a' + n + '" role="region" aria-labelledby="q' + n + '"><div><p>' + md(it.a) + '</p></div></div></li>';
    }).join('');
    return '<section class="faq dark" id="' + b.id + '" data-block="Вопросы"><img class="faq-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' +
      '<div class="wrap"><h2 class="h2 center reveal">' + md(b.title) + '</h2><ul class="qa-list">' + items + '</ul></div></section>';
  };

  R.thanks = function (b) {
    return '<section class="thanks dark" id="' + b.id + '" data-block="Подвал"><img class="th-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' +
      '<div class="wrap th-grid">' +
        '<div class="th-side reveal"><p class="dbox-text">' + md(b.left) + '</p>' + btn(b.buttons[0], 'btn-wide') + '</div>' +
        '<div class="th-center reveal"' + d(1) + '><h2 class="th-title">' + md(b.title) + '</h2>' + framed(b.strip, 'p') + '</div>' +
        '<div class="th-side reveal"' + d(2) + '><p class="dbox-text dbox-gold">' + md(b.right) + '</p>' + btn(b.buttons[1], 'btn-wide') + '</div>' +
      '</div>' +
      '<p class="th-links">' + b.links.map(function (l, i) { return '<a class="tl-' + (i % 2 ? 'y' : 'r') + '" href="' + esc(l.href) + '">' + esc(l.text) + '</a>'; }).join('<span>|</span>') + '</p>' +
    '</section>';
  };

  function render(site, base) {
    S = site; BASE = base || '';
    return site.blocks.map(function (b) { return R[b.type] ? R[b.type](b) : ''; }).join('');
  }

  return { render: render, md: md, lessonsHtml: lessonsHtml, icons: I };
});
