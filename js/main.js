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

  document.querySelectorAll('.photo-strip img').forEach((img) => {
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
})();
