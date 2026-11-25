/* Рендер блоков из window.SITE. Режим: window.SITE_MODE = 'full' (главная) или 'lesson'. */
(function () {
  'use strict';
  var S = window.SITE;
  var MODE = window.SITE_MODE || 'full';
  var BASE = window.SITE_BASE || '';
  var root = document.getElementById('app');

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

  /* Иконки: свой набор, линия 2px */
  var I = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.2 4L19 7"/>',
    play: '<path d="M9 7l8 5-8 5z" fill="currentColor" stroke="none"/>',
    gift: '<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
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
    up: '<path d="M6 15l6-6 6 6"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 6 7.5M11 5c-.6 3.4-3 6.6-6.5 8"/><path d="M13 21l4-10 4 10M14.5 17.5h5"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; }

  function btn(b, extraCls) {
    return '<a class="btn btn-' + (b.style || 'red') + ' ' + (extraCls || '') + '" href="' + esc(href(b.href)) + '"' + ext(b.href) + '><span>' + esc(b.text) + '</span></a>';
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
        '<ul class="chips">' + chips + '</ul>' +
        '<h1 class="hero-title"><span class="hero-line hero-first"><b>' + esc(b.titleBold) + '</b><span class="badge">' + esc(b.badge) + '<i class="badge-sep"></i>' + ic('clock') + '</span></span>' + lines + '</h1>' +
        '<p class="hero-sub">' + md(b.sub) + '</p>' +
        '<div class="hero-cta">' + btn({ text: b.cta.text, href: b.cta.href, style: 'red' }, 'btn-big') +
        '<p class="sign">' + b.sign.map(esc).join('<br>') + '</p></div>' +
      '</div>' +
      '<div class="hero-person">' + img(b.person, '', ' fetchpriority="high"').replace(' loading="lazy"', '') + '</div>' +
    '</section>';
  };

  R.why = function (b) {
    var items = b.items.map(function (it, i) {
      return '<li class="why-item reveal" style="--d:' + (i * 0.08) + 's"><i class="why-dot">' + ic('check') + '</i>' +
        '<div class="why-circle">' + img({ src: it.img, alt: it.alt, w: 360, h: 347 }) + '</div>' +
        '<h3>' + md(it.title) + '</h3><p>' + md(it.text) + '</p></li>';
    }).join('');
    return '<section class="why dark" id="' + b.id + '" data-block="Почему">' +
      '<div class="wrap"><h2 class="h2 center">' + esc(b.title) + ' ' + framed(b.titleFramed) + '</h2>' +
      '<div class="why-arc" aria-hidden="true"><svg viewBox="0 0 800 80" preserveAspectRatio="none"><path d="M10 75 Q400 -40 790 75" /></svg></div>' +
      '<ul class="why-list">' + items + '</ul></div></section>';
  };

  function cube(it, n) {
    return '<div class="cube"><span class="cube-n">' + n + '</span>' + img({ src: it.img, alt: it.alt, w: it.w, h: it.h }, 'cube-img') + '</div>';
  }
  R.who = function (b) {
    var top = b.items.slice(0, 3).map(function (it, i) {
      return '<li class="who-item reveal" style="--d:' + (i * 0.08) + 's">' + cube(it, i + 1) + '<p>' + md(it.text) + '</p></li>';
    }).join('');
    var bottom = b.items.slice(3).map(function (it, i) {
      return '<li class="who-card reveal" style="--d:' + (i * 0.08) + 's">' + cube(it, i + 4) + '<i class="ck">' + ic('check') + '</i><p>' + md(it.text) + '</p></li>';
    }).join('');
    return '<section class="who dark" id="' + b.id + '" data-block="Кому подойдёт">' +
      '<div class="wrap"><h2 class="h2 center">' + framed(b.titleFramed) + '<br>' + esc(b.title) + '</h2>' +
      '<ul class="who-top">' + top + '</ul><ul class="who-bottom">' + bottom + '</ul></div></section>';
  };

  R.result = function (b) {
    function col(arr, side) {
      return arr.map(function (t, i) { return '<li class="res-item res-' + side + (i + 1) + ' reveal"><i class="ck">' + ic('check') + '</i><p>' + md(t) + '</p></li>'; }).join('');
    }
    var tags = b.tags.map(function (t, i) {
      return '<div class="status status-' + (i + 1) + '" aria-hidden="true"><p><i class="sd on"></i>' + esc(t[0]) + '</p><p><i class="sd on"></i>' + esc(t[1]) + '</p><p class="st-sm">' + esc(t[2]) + '</p><p><i class="sd"></i>' + esc(t[3]) + '</p></div>';
    }).join('');
    return '<section class="result" id="' + b.id + '" data-block="Результат">' +
      '<div class="wrap"><div class="res-panel">' +
        '<img class="res-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' + tags +
        '<h2 class="h2 center ink">' + md(b.title) + '</h2>' +
        '<ul class="res-list res-left">' + col(b.left, 'l') + '</ul>' +
        '<ul class="res-list res-right">' + col(b.right, 'r') + '</ul>' +
        '<div class="res-person"><i class="res-halo"></i>' + img(b.person) + '</div>' +
      '</div><div class="res-arc" aria-hidden="true"></div></div></section>';
  };

  R.format = function (b) {
    var it = b.items.map(function (t, i) {
      return '<li class="fmt-item fmt-' + (i + 1) + ' reveal" style="--d:' + (i * 0.06) + 's"><span class="num">' + (i + 1) + '</span><i class="ck">' + ic('check') + '</i><p>' + md(t) + '</p></li>';
    }).join('');
    var t = esc(b.title);
    var withPlay = t.replace(/[оО]/, function () { return '<span class="play-o">' + ic('play') + '</span>'; });
    return '<section class="format dark" id="' + b.id + '" data-block="Формат">' +
      '<div class="wrap fmt-grid"><ul class="fmt-items">' + it + '</ul>' +
      '<div class="fmt-center"><p class="kicker">' + esc(b.kicker) + '</p><h2 class="fmt-title"><span class="fmt-big" aria-label="' + t + '">' + withPlay + '</span><span class="fmt-small">' + esc(b.title2) + '</span></h2>' +
      '<div class="fmt-badge"><i class="fmt-play">' + ic('play') + '</i><b>' + esc(b.badgeNum) + '</b><span>' + esc(b.badgeText) + '</span></div></div>' +
      '</div></section>';
  };

  function lessonsHtml(m) {
    return m.lessons.map(function (l) { return '<li><b>' + esc(l[0]) + '</b> ' + md(l[1]) + '</li>'; }).join('');
  }
  R.program = function (b) {
    var all = b.modules.concat([b.final]);
    var tiles = b.modules.map(function (m, i) {
      return '<button class="tile' + (i === 0 ? ' on' : '') + '" type="button" data-m="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(m.name) + '</button>';
    }).join('');
    var extras = b.extras.map(function (e) {
      var idx = e.open === 'final' ? b.modules.length : e.open;
      return '<li><button class="extra" type="button" data-open="' + idx + '"><i class="extra-ic">' + ic(e.icon) + '</i><span>' + md(e.text) + '</span></button></li>';
    }).join('');
    var data = encodeURIComponent(JSON.stringify(all));
    return '<section class="program dark" id="' + b.id + '" data-block="План" data-modules="' + data + '">' +
      '<div class="wrap"><div class="frame"><i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i>' +
      '<div class="bg-word" aria-hidden="true">' + esc(b.bgWord) + '</div>' +
      '<h2 class="h2 center">' + esc(b.title) + '</h2>' +
      '<div class="prog-grid"><div class="prog-left">' +
        '<p class="prog-name framed" aria-live="polite">' + esc(all[0].name) + '<i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i></p>' +
        '<ul class="lessons">' + lessonsHtml(all[0]) + '</ul>' +
        '<div class="note-card"><p>' + md(all[0].note) + '</p></div>' +
      '</div><div class="prog-right"><div class="tiles">' + tiles + '</div>' +
        '<button class="tile tile-final" type="button" data-m="' + b.modules.length + '" aria-pressed="false">' + esc(b.final.name) + '</button>' +
      '</div></div>' +
      '<div class="extras-head"><h3>' + esc(b.extraTitle) + '</h3><span class="pill">' + ic('gift', 'pill-gift') + esc(b.extraPill) + '</span><i class="dash-line"></i></div>' +
      '<ul class="extras">' + extras + '</ul>' +
      '</div></div></section>';
  };

  R.speakers = function (b) {
    var items = b.items.map(function (it, i) {
      return '<li class="sp-item reveal" style="--d:' + (i * 0.08) + 's"><a class="sp-photo" href="' + esc(href(it.href)) + '"' + ext(it.href) + '>' + img({ src: it.img, alt: it.alt, w: 520, h: 520 }) + '</a>' +
        '<div class="sp-body"><h3>' + md(it.name) + '</h3>' + (it.sub ? '<p class="sp-sub">' + esc(it.sub) + '</p>' : '') +
        '<div class="ribbon"><b>' + esc(it.ribbonBig) + '</b><span>' + esc(it.ribbonSmall) + '</span></div></div></li>';
    }).join('');
    return '<section class="speakers" id="' + b.id + '" data-block="Реклама платформы: авторы">' +
      '<div class="wrap"><div class="sp-panel"><div class="sp-head"><i class="dbox"></i><h2 class="h2 center ink">' + md(b.title) + '</h2><i class="dbox"></i></div>' +
      '<ul class="sp-list">' + items + '</ul></div>' +
      '<div class="sp-tab"><p>' + md(b.intro) + '</p><div class="btn-row">' + b.buttons.map(function (x) { return btn(x); }).join('') + '</div></div>' +
      '</div></section>';
  };

  R.gallery = function (b) {
    var tabs = b.tabs.map(function (t, i) {
      return '<button class="gtab' + (i === 0 ? ' on' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" data-t="' + i + '">' + ic('lang') + esc(t.name) + '</button>';
    }).join('');
    var panes = b.tabs.map(function (t, ti) {
      var big = t.shots[0];
      var tiles = t.shots.map(function (s, si) {
        return '<button class="tile gtile' + (si === 0 ? ' on' : '') + '" type="button" data-s="' + si + '" data-src="' + src(s.src) + '" data-w="' + s.w + '" data-h="' + s.h + '" data-cap="' + esc(s.cap) + '" data-text="' + esc(s.text) + '" aria-pressed="' + (si === 0) + '"><b>' + esc(s.cap) + '</b><span>' + esc(s.text) + '</span></button>';
      }).join('');
      return '<div class="gpane' + (ti === 0 ? ' on' : '') + '" role="tabpanel" data-t="' + ti + '"' + (ti === 0 ? '' : ' hidden') + '>' +
        '<div class="prog-grid"><div class="prog-left">' +
          '<figure class="browser"><div class="browser-bar"><i></i><i></i><i></i></div>' + img({ src: big.src, w: big.w, h: big.h, alt: t.name + ': ' + big.cap }, 'g-big') +
          '<figcaption><b class="g-cap">' + esc(big.cap) + '</b> <span class="g-text">' + esc(big.text) + '</span></figcaption></figure>' +
          '<div class="note-card"><p>' + md(t.note) + '</p></div>' +
        '</div><div class="prog-right"><div class="tiles">' + tiles + '</div>' +
          '<a class="tile tile-final tile-link" href="' + esc(href(t.href)) + '"' + ext(t.href) + '>Купить доступ к ' + esc(t.name) + ' за 30 €</a>' +
        '</div></div></div>';
    }).join('');
    return '<section class="program gallery dark" id="' + b.id + '" data-block="Реклама платформы: внутри">' +
      '<div class="wrap"><div class="frame"><i class="h hA"></i><i class="h hB"></i><i class="h hC"></i><i class="h hD"></i>' +
      '<div class="bg-word" aria-hidden="true">' + esc(b.bgWord) + '</div>' +
      '<h2 class="h2 center">' + esc(b.title) + '</h2><div class="gtabs" role="tablist">' + tabs + '</div>' + panes +
      '</div></div></section>';
  };

  R.path = function (b) {
    var slides = b.slides.map(function (s, i) {
      return '<div class="pslide' + (i === 0 ? ' on' : '') + '" data-i="' + i + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<div class="pt pt-a"><p class="pt-head"><i class="ring"></i>Точка А <span class="pt-tag">' + esc(s.a.tag) + '</span></p><p>' + md(s.a.text) + '</p></div>' +
        '<div class="pt-photo"><p class="pt-name">' + ic('right', 'arr arr-l') + esc(s.name) + ic('left', 'arr arr-r') + '</p>' + img({ src: s.photo, alt: s.alt, w: 520, h: 520 }) + '<i class="pt-fire">' + ic('fire') + ic('fire') + ic('fire') + '</i><p class="pt-bottom">' + esc(s.bottom) + '</p></div>' +
        '<div class="pt pt-b"><p class="pt-head"><i class="ring on"></i>Точка Б <span class="pt-tag">' + esc(s.b.tag) + '</span></p><p>' + md(s.b.text) + '</p></div>' +
      '</div>';
    }).join('');
    return '<section class="path" id="' + b.id + '" data-block="Реклама платформы: путь">' +
      '<div class="wrap"><div class="path-panel">' +
        '<div class="path-head"><h2 class="h2 ink">' + md(b.title) + ' <span class="ytag">' + esc(b.tag) + '</span></h2>' +
        '<div class="path-side"><i class="sd-a">A</i>' + ic('fire', 'side-fire') + '<p>' + md(b.side) + '</p><i class="sd-b">B</i></div></div>' +
        '<div class="pslider"><button class="pnav pprev" type="button" aria-label="Предыдущий">' + ic('left') + '</button>' + slides +
        '<button class="pnav pnext" type="button" aria-label="Следующий">' + ic('right') + '</button></div>' +
      '</div></div></section>';
  };

  function pie(parts, style) {
    var acc = 0, stops = [], cols = style === 'dark' ? ['#fd3d5e', '#ffffff'] : ['#fd3d5e', '#2f2f2f', '#f1f1f1'];
    var labels = '';
    parts.forEach(function (p, i) {
      var from = acc; acc += p[1];
      stops.push(cols[i % cols.length] + ' ' + from + '% ' + acc + '%');
      var mid = (from + acc) / 2 / 100 * Math.PI * 2 - Math.PI / 2;
      labels += '<span class="pie-l" style="left:' + (50 + Math.cos(mid) * 30).toFixed(1) + '%;top:' + (50 + Math.sin(mid) * 30).toFixed(1) + '%;color:' + ((cols[i % cols.length] === '#ffffff' || cols[i % cols.length] === '#f1f1f1') ? '#2f2f2f' : '#fff') + '">' + esc(p[0]) + '</span>';
    });
    return '<div class="pie-tab"><div class="pie" style="background:conic-gradient(' + stops.join(',') + ')">' + labels + '</div></div>';
  }
  R.tariffs = function (b) {
    var cards = b.cards.map(function (c, i) {
      return '<li class="tcard t-' + c.style + ' reveal" style="--d:' + (i * 0.08) + 's"><h3 class="t-name">' + esc(c.name) + '</h3>' + pie(c.pie, c.style) +
        '<div class="t-body"><i class="t-icon">' + ic(c.icon) + '</i><ul>' + c.items.map(function (x) { return '<li>' + md(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="t-price"><span class="t-ribbon">' + esc(c.ribbon) + '</span><p class="t-note">' + esc(c.priceNote) + '</p><p class="t-sum">' + esc(c.price) + '</p>' +
        btn({ text: c.button, href: c.href, style: c.style === 'outline' ? 'gold' : 'red' }, 'btn-sm') + '</div></li>';
    }).join('');
    var m = b.mentor;
    return '<section class="tariffs" id="' + b.id + '" data-block="Реклама платформы: стоимость">' +
      '<div class="t-stripe" aria-hidden="true"></div>' +
      '<div class="wrap"><h2 class="h2 center">' + framed(b.title) + '</h2><ul class="tcards n' + b.cards.length + '">' + cards + '</ul>' +
      '<div class="mentor reveal"><div class="mentor-in"><h3>' + esc(m.title) + '</h3>' +
        '<p class="m-pill"><i class="m-av">' + ic('chat') + '</i><span>' + md(m.pill) + '</span><i class="m-dot"></i></p><i class="m-line"></i>' +
        '<div class="m-row"><i class="m-gear">' + ic('gear') + '</i><p>' + md(m.note) + '</p>' + btn({ text: m.button, href: m.href, style: 'red' }, 'btn-sm') + '</div></div>' +
        '<div class="m-person">' + img(m.person) + '</div></div>' +
      '</div></section>';
  };

  R.author = function (b) {
    var ringId = 'ring-' + b.id;
    return '<section class="author" id="' + b.id + '" data-block="Реклама платформы: автор">' +
      '<div class="wrap"><div class="au-panel"><img class="au-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' +
        '<div class="au-text"><p class="au-label">' + ic('user') + esc(b.label) + '</p><h2 class="h2 ink">' + esc(b.title) + '</h2>' +
        '<div class="au-stats">' + b.stats.map(function (s) { return '<div><b>' + esc(s.big) + '</b><span>' + md(s.small) + '</span></div>'; }).join('') + '</div><i class="au-hr"></i>' +
        '<ul class="au-checks">' + b.checks.map(function (c) { return '<li><i class="cb">' + ic('check') + '</i><b>' + esc(c.big) + '</b><span>' + md(c.small) + '</span></li>'; }).join('') + '</ul></div>' +
        '<div class="au-person">' + img(b.person) + '</div>' +
        '<div class="au-badge"><svg class="au-ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="' + ringId + '" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"/></defs><text><textPath href="#' + ringId + '">' + esc(b.ring) + '</textPath></text></svg>' +
          '<div class="au-badge-in"><i class="au-badge-ic">' + ic('people') + '</i><b>' + esc(b.badgeTitle) + '</b><span>' + md(b.badgeText) + '</span></div></div>' +
      '</div></div></section>';
  };

  R.faq = function (b) {
    var n = 0;
    var items = b.items.filter(function (it) { return !(it.ad && MODE === 'lesson'); }).map(function (it, i) {
      n++;
      var open = i === 0;
      return '<li class="qa' + (open ? ' open' : '') + '"><button class="qa-q" type="button" aria-expanded="' + open + '" id="q' + n + '" aria-controls="a' + n + '"><span class="qa-n">' + n + '</span><span class="qa-t">' + esc(it.q) + '</span>' + ic('chevron', 'qa-ch') + '</button>' +
        '<div class="qa-a" id="a' + n + '" role="region" aria-labelledby="q' + n + '"><div><p>' + md(it.a) + '</p></div></div></li>';
    }).join('');
    return '<section class="faq dark" id="' + b.id + '" data-block="Вопросы"><img class="faq-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' +
      '<div class="wrap"><h2 class="h2 center">' + md(b.title) + '</h2><ul class="qa-list">' + items + '</ul></div></section>';
  };

  R.thanks = function (b) {
    return '<section class="thanks dark" id="' + b.id + '" data-block="Подвал"><img class="th-bg" src="' + src(b.bg) + '" alt="" width="1280" height="720" loading="lazy">' +
      '<div class="wrap th-grid">' +
        '<div class="th-side"><p class="dbox-text">' + md(b.left) + '</p>' + btn(b.buttons[0], 'btn-wide') + '</div>' +
        '<div class="th-center"><h2 class="th-title">' + md(b.title) + '</h2>' + framed(b.strip, 'p') + '</div>' +
        '<div class="th-side"><p class="dbox-text dbox-gold">' + md(b.right) + '</p>' + btn(b.buttons[1], 'btn-wide') + '</div>' +
      '</div>' +
      '<p class="th-links">' + b.links.map(function (l, i) { return '<a class="tl-' + (i % 2 ? 'y' : 'r') + '" href="' + esc(l.href) + '">' + esc(l.text) + '</a>'; }).join('<span>|</span>') + '</p>' +
    '</section>';
  };

  /* ---------- render ---------- */
  var html = S.blocks.filter(function (b) {
    if (b.ad && MODE === 'lesson') return false;
    if (b.lessonOnly && MODE !== 'lesson') return false;
    return true;
  }).map(function (b) { return R[b.type] ? R[b.type](b) : ''; }).join('');
  root.innerHTML = html;
  document.title = S.meta.title;

  /* ---------- interactions ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Плавный якорь
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  // План: переключение модулей
  document.querySelectorAll('.program[data-modules]').forEach(function (sec) {
    var mods = JSON.parse(decodeURIComponent(sec.getAttribute('data-modules')));
    var name = sec.querySelector('.prog-name'), list = sec.querySelector('.lessons'), note = sec.querySelector('.note-card p');
    var left = sec.querySelector('.prog-left');
    function show(i) {
      var m = mods[i];
      sec.querySelectorAll('.tile[data-m]').forEach(function (t) { var on = +t.getAttribute('data-m') === i; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); });
      left.classList.remove('swap'); void left.offsetWidth; left.classList.add('swap');
      name.firstChild.nodeValue = m.name;
      list.innerHTML = lessonsHtml(m);
      note.innerHTML = md(m.note);
    }
    sec.addEventListener('click', function (e) {
      var t = e.target.closest('.tile[data-m]');
      if (t) { show(+t.getAttribute('data-m')); return; }
      var x = e.target.closest('.extra');
      if (x) { show(+x.getAttribute('data-open')); sec.querySelector('.prog-grid').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  // Галерея: вкладки и выбор кадра
  document.querySelectorAll('.gallery').forEach(function (sec) {
    sec.addEventListener('click', function (e) {
      var tab = e.target.closest('.gtab');
      if (tab) {
        var ti = tab.getAttribute('data-t');
        sec.querySelectorAll('.gtab').forEach(function (x) { var on = x === tab; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
        sec.querySelectorAll('.gpane').forEach(function (p) { var on = p.getAttribute('data-t') === ti; p.classList.toggle('on', on); p.hidden = !on; });
        return;
      }
      var g = e.target.closest('.gtile');
      if (g) {
        var pane = g.closest('.gpane');
        pane.querySelectorAll('.gtile').forEach(function (x) { var on = x === g; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        var big = pane.querySelector('.g-big');
        big.src = g.getAttribute('data-src'); big.width = +g.getAttribute('data-w'); big.height = +g.getAttribute('data-h');
        big.alt = pane.closest('.gallery').querySelector('.gtab.on').textContent + ': ' + g.getAttribute('data-cap');
        pane.querySelector('.g-cap').textContent = g.getAttribute('data-cap');
        pane.querySelector('.g-text').textContent = g.getAttribute('data-text');
        var fig = pane.querySelector('.browser'); fig.classList.remove('swap'); void fig.offsetWidth; fig.classList.add('swap');
      }
    });
  });

  // Точка А / Б: слайдер
  document.querySelectorAll('.pslider').forEach(function (sl) {
    var slides = sl.querySelectorAll('.pslide'), cur = 0;
    function go(d) {
      slides[cur].classList.remove('on'); slides[cur].hidden = true;
      cur = (cur + d + slides.length) % slides.length;
      slides[cur].hidden = false; void slides[cur].offsetWidth; slides[cur].classList.add('on');
    }
    sl.querySelector('.pprev').addEventListener('click', function () { go(-1); });
    sl.querySelector('.pnext').addEventListener('click', function () { go(1); });
  });

  // Вопросы: аккордеон
  document.querySelectorAll('.qa-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var li = q.parentNode, open = !li.classList.contains('open');
      li.classList.toggle('open', open); q.setAttribute('aria-expanded', open);
    });
  });

  // Появление при прокрутке
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
})();
