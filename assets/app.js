/* Поведение страницы. HTML уже вшит в страницу сборкой (build.py + render.js), поэтому без JS всё видно.
   Здесь: переключения, аккордеон, слайдер, появление при прокрутке, счётчики. */
(function () {
  'use strict';
  var R = window.SiteRender;
  var root = document.getElementById('app');
  if (root && !root.children.length && window.SITE) root.innerHTML = R.render(window.SITE, window.SITE_BASE || '');
  var md = R.md, lessonsHtml = R.lessonsHtml;

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
    var chips = sl.parentNode.querySelectorAll('.goal');
    function show(n) {
      slides[cur].classList.remove('on'); slides[cur].hidden = true;
      cur = (n + slides.length) % slides.length;
      slides[cur].hidden = false; void slides[cur].offsetWidth; slides[cur].classList.add('on');
      chips.forEach(function (c, i) { c.classList.toggle('on', i === cur); c.setAttribute('aria-selected', i === cur); });
    }
    sl.querySelector('.pprev').addEventListener('click', function () { show(cur - 1); });
    sl.querySelector('.pnext').addEventListener('click', function () { show(cur + 1); });
    chips.forEach(function (c) { c.addEventListener('click', function () { show(+c.getAttribute('data-i')); }); });
    if (slides.length < 2) sl.querySelectorAll('.pnav').forEach(function (n) { n.hidden = true; });
  });

  // Вопросы: аккордеон
  document.querySelectorAll('.qa-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var li = q.parentNode, open = !li.classList.contains('open');
      li.classList.toggle('open', open); q.setAttribute('aria-expanded', open);
    });
  });

  // Появление при прокрутке, прорисовка линий и счётчики
  var els = document.querySelectorAll('.reveal, .draw');
  var counts = document.querySelectorAll('.count');
  function runCount(el) {
    var to = +el.getAttribute('data-to'), t0 = null, dur = to > 20 ? 1400 : 700;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    counts.forEach(function (c) { c.style.minWidth = c.textContent.length + 'ch'; c.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('in');
        el.querySelectorAll('.count').forEach(runCount);
        if (el.classList.contains('count')) runCount(el);
        io.unobserve(el);
        // после появления снимаем класс, чтобы у элемента снова работали свои hover-переходы
        if (el.classList.contains('reveal')) {
          var delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
          setTimeout(function () { el.classList.remove('reveal', 'in'); }, (delay + 0.7) * 1000);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
    // счётчик вне .reveal тоже должен запуститься
    counts.forEach(function (c) { if (!c.closest('.reveal, .draw')) { c.classList.add('draw'); io.observe(c); } });
  }
  window.__live = true;
})();
