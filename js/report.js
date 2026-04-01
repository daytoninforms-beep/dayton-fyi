/* ============================================
   Dayton Community Information District
   Interactive Report — JavaScript
   ============================================ */
(function () {
  'use strict';

  /* --- Reading Progress Bar --- */
  function initProgressBar() {
    var bar = document.querySelector('.progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

  /* --- Sticky Side Navigation --- */
  function initSideNav() {
    var navLinks = document.querySelectorAll('.side-nav a[href^="#"]');
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ el: section, link: link });
    });

    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var match = sections.find(function (s) { return s.el === entry.target; });
          if (match) match.link.classList.add('active');

          // Also update mobile nav
          var mobileLinks = document.querySelectorAll('.mobile-nav a[href^="#"]');
          mobileLinks.forEach(function (l) { l.classList.remove('active'); });
          var mobileMatch = document.querySelector('.mobile-nav a[href="#' + entry.target.id + '"]');
          if (mobileMatch) mobileMatch.classList.add('active');
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { observer.observe(s.el); });
  }

  /* --- Mobile Nav Toggle --- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      toggle.textContent = mobileNav.classList.contains('open') ? '\u2715' : '\u2630';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.textContent = '\u2630';
      });
    });
  }

  /* --- Scroll Reveal --- */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* --- Back to Top Button --- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > window.innerHeight) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* --- Initialize --- */
  document.addEventListener('DOMContentLoaded', function () {
    initProgressBar();
    initSideNav();
    initMobileNav();
    initScrollReveal();
    initBackToTop();
    initSmoothScroll();
  });
})();
