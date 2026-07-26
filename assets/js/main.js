/* ==========================================================================
   IKSEZ — Site behaviours
   Vanilla JS, no dependencies. Each module is independent and no-ops when its
   markup is absent, so it is safe to load site-wide.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----------------------------------------------------------------------
     Mobile nav + active link + sticky shadow + submenu toggles
     ---------------------------------------------------------------------- */
  function initNav() {
    var header = $('.site-header');
    var toggle = $('.nav__toggle');
    var menu = $('.nav__menu');
    var scrim = $('.nav-scrim');

    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && menu) {
      var setOpen = function (open) {
        toggle.setAttribute('aria-expanded', String(open));
        menu.classList.toggle('is-open', open);
        if (scrim) scrim.classList.toggle('is-open', open);
        document.body.classList.toggle('is-locked', open);
      };
      toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 1120) setOpen(false);
      });
    }

    // Mobile: tap a parent item to expand its submenu instead of navigating
    $$('.nav__item').forEach(function (item) {
      var sub = item.querySelector('.nav__submenu');
      var link = item.querySelector('.nav__link');
      if (!sub || !link) return;
      link.addEventListener('click', function (e) {
        if (window.innerWidth > 1120) return;
        e.preventDefault();
        item.classList.toggle('is-expanded');
      });
    });

    // Highlight the current page
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav__menu a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (!href || href.charAt(0) === '#') return;
      if (href === here) {
        a.classList.add('is-active');
        var parentLink = a.closest('.nav__item') && a.closest('.nav__item').querySelector('.nav__link');
        if (parentLink) parentLink.classList.add('is-active');
      }
    });
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el, i) {
      // stagger siblings automatically unless an explicit delay is set
      if (!el.style.getPropertyValue('--reveal-delay')) {
        var sibIndex = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty('--reveal-delay', Math.min(sibIndex, 6) * 70 + 'ms');
      }
      io.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     Hero slider
     ---------------------------------------------------------------------- */
  function initHero() {
    var hero = $('.hero');
    if (!hero) return;
    var slides = $$('.hero__slide', hero);
    var dotsWrap = $('.hero__dots', hero);
    if (slides.length < 2) { if (slides[0]) slides[0].classList.add('is-active'); return; }

    var index = 0, timer = null, DELAY = 6000;

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.className = 'hero__dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, DELAY);
    }

    go(0);
    restart();

    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', restart);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else restart();
    });
  }

  /* ----------------------------------------------------------------------
     Animated counters
     ---------------------------------------------------------------------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);

        var target = parseFloat(el.dataset.count);
        var decimals = (el.dataset.count.split('.')[1] || '').length;
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        var fmt = function (v) {
          return prefix + v.toLocaleString('en-IN', {
            minimumFractionDigits: decimals, maximumFractionDigits: decimals
          }) + suffix;
        };

        if (reduce) { el.textContent = fmt(target); return; }

        var start = performance.now(), DUR = 1500;
        (function step(now) {
          var p = Math.min((now - start) / DUR, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = fmt(target);
        })(start);
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Accordion
     ---------------------------------------------------------------------- */
  function initAccordion() {
    $$('.accordion').forEach(function (acc) {
      var single = acc.dataset.single === 'true';
      $$('.accordion__btn', acc).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          var open = btn.getAttribute('aria-expanded') === 'true';

          if (single && !open) {
            $$('.accordion__btn', acc).forEach(function (b) {
              b.setAttribute('aria-expanded', 'false');
              var p = document.getElementById(b.getAttribute('aria-controls'));
              if (p) p.classList.remove('is-open');
            });
          }
          btn.setAttribute('aria-expanded', String(!open));
          if (panel) panel.classList.toggle('is-open', !open);
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     Lightbox — any <a data-lightbox href="big.jpg"><img ...></a>
     ---------------------------------------------------------------------- */
  function initLightbox() {
    var triggers = $$('[data-lightbox]');
    if (!triggers.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next">&#8250;</button>' +
      '<div><img alt=""><div class="lightbox__cap"></div></div>';
    document.body.appendChild(box);

    var img = $('img', box);
    var cap = $('.lightbox__cap', box);
    var current = 0;

    function show(i) {
      current = (i + triggers.length) % triggers.length;
      var a = triggers[current];
      img.src = a.getAttribute('href');
      img.alt = a.dataset.caption || '';
      cap.textContent = a.dataset.caption || '';
      cap.style.display = a.dataset.caption ? '' : 'none';
    }
    function open(i) { show(i); box.classList.add('is-open'); document.body.classList.add('is-locked'); }
    function close() { box.classList.remove('is-open'); document.body.classList.remove('is-locked'); }

    triggers.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    $('.lightbox__close', box).addEventListener('click', close);
    $('.lightbox__nav--prev', box).addEventListener('click', function () { show(current - 1); });
    $('.lightbox__nav--next', box).addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ----------------------------------------------------------------------
     Back to top
     ---------------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'backtotop';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 520);
    }, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ----------------------------------------------------------------------
     Boot — runs after partials are injected
     ---------------------------------------------------------------------- */
  function init() {
    initNav();
    initReveal();
    initHero();
    initCounters();
    initAccordion();
    initLightbox();
    initBackToTop();
    initYear();
  }

  document.addEventListener('components:loaded', init);
})();
