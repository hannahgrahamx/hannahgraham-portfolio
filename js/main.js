/* ============================================================
   Hannah Graham Portfolio — main.js
   Shared behaviour: custom cursor, context pop-up, copy-email,
   mobile nav. Loaded on every page.
   ============================================================ */

(function () {
  'use strict';

  /* --- Custom cursor: flower + velocity twirl ------------------ */

  const cursorFlower = document.getElementById('cursor-flower');
  const flowerImg = cursorFlower ? cursorFlower.querySelector('img') : null;
  const cursorContext = document.getElementById('cursor-context');
  const cursorContextInner = document.getElementById('cursor-context__inner');

  let lastX = 0, lastY = 0;
  let angleAccum = 0, velocity = 0, direction = 1;
  let rafId = null;

  function animateTwirl() {
    velocity *= 0.94; // friction — higher = slower decay / longer spin
    angleAccum += velocity * direction;
    if (flowerImg) flowerImg.style.transform = `rotate(${angleAccum}deg)`;

    if (Math.abs(velocity) > 0.05) {
      rafId = requestAnimationFrame(animateTwirl);
    } else {
      velocity = 0;
      rafId = null;
    }
  }

  let activeContextEl = null;

  function positionContext(x, y) {
    if (!cursorContext || !cursorContext.classList.contains('is-visible')) return;

    const offset = 16;
    const rect = cursorContext.getBoundingClientRect();
    let left = x + offset;
    let top = y + offset;

    // Keep the pop-up on-screen when hovering near an edge
    if (left + rect.width > window.innerWidth - 8) {
      left = x - rect.width - offset;
    }
    if (top + rect.height > window.innerHeight - 8) {
      top = y - rect.height - offset;
    }

    cursorContext.style.translate = `${left}px ${top}px`;
  }

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX, y = e.clientY;

    if (cursorFlower) {
      cursorFlower.style.left = x + 'px';
      cursorFlower.style.top = y + 'px';
    }

    positionContext(x, y);

    const dx = x - lastX;
    const dy = y - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : (dy > 0 ? 1 : -1);
    velocity = Math.min(velocity + speed * 0.25, 8);

    lastX = x;
    lastY = y;

    if (!rafId) rafId = requestAnimationFrame(animateTwirl);
  });

  document.addEventListener('mousedown', () => document.body.classList.add('is-pressing'));
  document.addEventListener('mouseup', () => document.body.classList.remove('is-pressing'));

  /* --- Context pop-up: any element with [data-cursor-label] ---- */

  if (cursorContext) {
    document.querySelectorAll('[data-cursor-label]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorContextInner.textContent = el.getAttribute('data-cursor-label');
        cursorContext.classList.add('is-visible');
        activeContextEl = el;
      });
      el.addEventListener('mouseleave', () => {
        if (activeContextEl === el) {
          cursorContext.classList.remove('is-visible');
          activeContextEl = null;
        }
      });
    });
  }

  /* --- Copy email to clipboard ----------------------------------- */

  const EMAIL = 'hannahgraham18@gmail.com';

  document.querySelectorAll('[data-copy-email]').forEach((el) => {
    const originalLabel = el.getAttribute('data-cursor-label') || 'Copy email';

    el.addEventListener('click', () => {
      navigator.clipboard.writeText(EMAIL);

      if (cursorContextInner) {
        cursorContextInner.textContent = 'Copied!';
      }

      setTimeout(() => {
        if (cursorContextInner && activeContextEl === el) {
          cursorContextInner.textContent = originalLabel;
        }
      }, 1500);
    });
  });

  /* --- Mobile hamburger nav --------------------------------------- */

  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav__close');
  const mobileNavBackdrop = document.querySelector('.mobile-nav__backdrop');

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) hamburger.addEventListener('click', openMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // Any actual navigation link inside the menu (Work/About/Contact, plus
  // external socials) should close it too — a same-page anchor like
  // #contact doesn't reload the page, so without this the menu was
  // staying open after the scroll happened.
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* --- Lightbox: click a photo to view it large at its natural ratio --- */

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox__img');
  const lightboxClose = document.getElementById('lightbox__close');

  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  document.querySelectorAll('.photo-strip img, .project-gallery img, .realworld-grid img, .stat-feature__image, .masonry-grid img, .text-media-trio img, .full-bleed-image, .vertical-carousel__content img').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* --- Video carousel: arrows + swipe, manual navigation only -------
     Slides sit side by side in .video-carousel__slides; navigating
     translates that strip (the CSS transition does the sliding
     animation) rather than swapping display:none. The active slide's
     video autoplays muted; every other slide's video is paused. */

  document.querySelectorAll('.video-carousel').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.video-carousel__slide'));
    const slidesTrack = carousel.querySelector('.video-carousel__slides');
    const prevBtn = carousel.querySelector('.video-carousel__arrow--prev');
    const nextBtn = carousel.querySelector('.video-carousel__arrow--next');
    const dots = Array.from(carousel.querySelectorAll('.video-carousel__dot'));
    const track = carousel.querySelector('.video-carousel__track');
    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;

    function render() {
      slides.forEach((s, i) => {
        s.classList.toggle('is-active', i === index);
        const video = s.querySelector('video');
        if (!video) return;
        if (i === index) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      if (slidesTrack) slidesTrack.style.transform = `translateX(-${index * 100}%)`;
    }

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      render();
    }

    render();

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    if (track) {
      let touchStartX = 0;

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const SWIPE_THRESHOLD = 40;
        if (deltaX > SWIPE_THRESHOLD) goTo(index - 1);
        else if (deltaX < -SWIPE_THRESHOLD) goTo(index + 1);
      }, { passive: true });
    }
  });

  /* --- Site-wide video UI: hover-to-reveal controls + a transient
     play/pause flash icon on every state change ------------------------
     Standard across every video on every project page (video-carousel,
     video-feature, media-pair, ...) — any wrapper with the .video-ui
     class gets this behaviour for free, no per-page JS needed. Controls
     are hidden by default (a permanently-visible seek bar reads as
     clutter on something that's always just quietly looping) and only
     shown on hover. The video element's own play/pause events (not a
     click handler) drive the flash icon, so it reacts correctly whether
     playback was toggled via the native controls, a carousel slide
     switch, a keyboard, or anything else — the one exception is the very
     first `play` firing from autoplay itself, which is skipped so the
     icon doesn't flash on page load. */
  document.querySelectorAll('.video-ui').forEach((wrap) => {
    const video = wrap.querySelector('video');
    const flash = wrap.querySelector('.video-ui__flash');
    if (!video || !flash) return;

    const playIcon = flash.querySelector('.icon-play');
    const pauseIcon = flash.querySelector('.icon-pause');
    let hasAutoplayed = false;
    let flashTimer = null;

    function flashState(isPlaying) {
      // Shows the icon for the action that just STARTED, not the one
      // that just happened — pausing shows the play icon (what you'd do
      // next), starting playback shows the pause icon, per feedback.
      // .hidden isn't reliably reflected on SVG elements in every
      // browser (it's an HTMLElement-only guarantee) — style.display is
      // the robust way to toggle an <svg> icon.
      playIcon.style.display = isPlaying ? 'none' : '';
      pauseIcon.style.display = isPlaying ? '' : 'none';
      flash.classList.add('is-visible');
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => flash.classList.remove('is-visible'), 600);
    }

    video.addEventListener('play', () => {
      if (!hasAutoplayed) {
        hasAutoplayed = true;
        return;
      }
      flashState(true);
    });
    video.addEventListener('pause', () => flashState(false));

    wrap.addEventListener('mouseenter', () => video.setAttribute('controls', ''));
    wrap.addEventListener('mouseleave', () => video.removeAttribute('controls'));
  });

  /* --- Approach carousel: arrows + dots + swipe, manual navigation
     only — identical to .video-carousel's logic, just a different
     class prefix. Controls are static; only the track slides. */
  document.querySelectorAll('.vertical-carousel').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.vertical-carousel__slide'));
    const slidesTrack = carousel.querySelector('.vertical-carousel__slides');
    const prevBtn = carousel.querySelector('.vertical-carousel__arrow--prev');
    const nextBtn = carousel.querySelector('.vertical-carousel__arrow--next');
    const dots = Array.from(carousel.querySelectorAll('.vertical-carousel__dot'));
    const track = carousel.querySelector('.vertical-carousel__track');
    if (!slides.length) return;
    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;

    function render() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      if (slidesTrack) slidesTrack.style.transform = `translateX(-${index * 100}%)`;
    }

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      render();
    }

    render();

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    if (track) {
      let touchStartX = 0;

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const SWIPE_THRESHOLD = 40;
        if (deltaX > SWIPE_THRESHOLD) goTo(index - 1);
        else if (deltaX < -SWIPE_THRESHOLD) goTo(index + 1);
      }, { passive: true });
    }
  });
})();
