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
      navigator.clipboard.writeText(EMAIL).then(() => {
        if (cursorContextInner) cursorContextInner.textContent = 'Copied!';
      }, () => {
        // Clipboard API can reject (denied permission, insecure context,
        // etc.) — show that honestly instead of a false "Copied!".
        if (cursorContextInner) cursorContextInner.textContent = 'Copy failed';
      }).finally(() => {
        setTimeout(() => {
          if (cursorContextInner && activeContextEl === el) {
            cursorContextInner.textContent = originalLabel;
          }
        }, 1500);
      });
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

  /* --- Lightbox: click (or keyboard-activate) a photo to view it large
     at its natural ratio, with prev/next arrows to move through the
     other images in the same gallery/section — not every image on the
     page. A photo's "group" is every lightbox-eligible image sharing
     its nearest gallery-container ancestor (one .project-gallery--trio,
     one .photo-strip, all four slides of one .vertical-carousel, etc.);
     an image with no such ancestor (a standalone .full-bleed-image, say)
     is a group of one, and the arrows stay hidden for it.

     #lightbox carries role="dialog"/aria-modal in the markup; this wires
     up the matching behaviour — focus moves to the close button on
     open, Tab is trapped among whichever of prev/close/next are
     currently visible, and focus returns to whichever thumbnail opened
     it on close, so keyboard/screen-reader users aren't dropped into
     the page behind it. */

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox__img');
  const lightboxClose = document.getElementById('lightbox__close');
  const lightboxPrev = document.getElementById('lightbox__prev');
  const lightboxNext = document.getElementById('lightbox__next');
  let lightboxTrigger = null;
  let lightboxGroup = [];
  let lightboxIndex = -1;

  const LIGHTBOX_IMG_SELECTOR = '.photo-strip img, .project-gallery img, .realworld-grid img, .stat-feature__image, .masonry-grid img, .text-media-trio img, .full-bleed-image, .vertical-carousel__content img, .phase-two-grid__stack img';
  const LIGHTBOX_GROUP_ANCESTOR_SELECTOR = '.photo-strip, .project-gallery, .realworld-grid, .masonry-grid, .text-media-trio, .vertical-carousel, .phase-two-grid__stack';
  const lightboxImages = Array.from(document.querySelectorAll(LIGHTBOX_IMG_SELECTOR));

  function getLightboxGroup(img) {
    const root = img.closest(LIGHTBOX_GROUP_ANCESTOR_SELECTOR);
    if (!root) return [img];
    const groupImgs = Array.from(root.querySelectorAll('img')).filter((candidate) => lightboxImages.includes(candidate));
    return groupImgs.length ? groupImgs : [img];
  }

  function showLightboxImage(index) {
    const img = lightboxGroup[index];
    if (!img) return;
    lightboxIndex = index;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    const isMulti = lightboxGroup.length > 1;
    if (lightboxPrev) lightboxPrev.hidden = !isMulti;
    if (lightboxNext) lightboxNext.hidden = !isMulti;
  }

  function goToLightboxImage(delta) {
    if (lightboxGroup.length < 2) return;
    showLightboxImage((lightboxIndex + delta + lightboxGroup.length) % lightboxGroup.length);
  }

  function openLightbox(img) {
    if (!lightbox) return;
    lightboxGroup = getLightboxGroup(img);
    const index = lightboxGroup.indexOf(img);
    showLightboxImage(index >= 0 ? index : 0);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxTrigger = img;
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (lightboxTrigger) lightboxTrigger.focus();
    lightboxTrigger = null;
    lightboxGroup = [];
    lightboxIndex = -1;
  }

  lightboxImages.forEach((img) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    if (img.alt) img.setAttribute('aria-label', `${img.alt} — view larger`);

    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => goToLightboxImage(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => goToLightboxImage(1));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    // Tab is trapped among whichever of prev/close/next are currently
    // visible (prev/next hide entirely for a single-image group) rather
    // than escaping to the page behind the dialog.
    lightbox.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = [lightboxPrev, lightboxClose, lightboxNext].filter((el) => el && !el.hidden);
      if (!focusable.length) return;
      e.preventDefault();
      const current = focusable.indexOf(document.activeElement);
      const dir = e.shiftKey ? -1 : 1;
      const next = current === -1 ? 0 : (current + dir + focusable.length) % focusable.length;
      focusable[next].focus();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToLightboxImage(-1);
    if (e.key === 'ArrowRight') goToLightboxImage(1);
  });

  /* --- Shared carousel logic: arrows + dots + swipe, manual navigation
     only. Used by both .video-carousel and .vertical-carousel — slides
     sit side by side in a `${prefix}__slides` track; navigating
     translates that strip (the CSS transition does the sliding
     animation) rather than swapping display:none. `onSlideChange`, when
     given, is called for every slide on every render with (slide,
     isActive, allowPlay) — video-carousel uses it to play/pause each
     slide's video; vertical-carousel has no videos and omits it.

     When onSlideChange is given, the first render is gated behind
     IntersectionObserver so the initially-active slide's video doesn't
     start downloading/playing until the carousel actually scrolls into
     view — manual navigation (goTo) always plays immediately, since a
     click/swipe on the carousel implies it's already visible. Carousels
     with no video (vertical-carousel) skip the observer entirely, same
     as before. */
  function initSlideCarousel(carousel, prefix, { onSlideChange } = {}) {
    const slides = Array.from(carousel.querySelectorAll(`.${prefix}__slide`));
    const slidesTrack = carousel.querySelector(`.${prefix}__slides`);
    const prevBtn = carousel.querySelector(`.${prefix}__arrow--prev`);
    const nextBtn = carousel.querySelector(`.${prefix}__arrow--next`);
    const dots = Array.from(carousel.querySelectorAll(`.${prefix}__dot`));
    const track = carousel.querySelector(`.${prefix}__track`);
    if (!slides.length) return;
    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;

    function render(allowPlay) {
      slides.forEach((s, i) => {
        const isActive = i === index;
        s.classList.toggle('is-active', isActive);
        if (onSlideChange) onSlideChange(s, isActive, allowPlay);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      if (slidesTrack) slidesTrack.style.transform = `translateX(-${index * 100}%)`;
    }

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      render(true);
    }

    if (onSlideChange) {
      render(false);
      if ('IntersectionObserver' in window) {
        const carouselObserver = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              render(true);
              obs.disconnect();
            }
          });
        }, { threshold: 0.25 });
        carouselObserver.observe(carousel);
      } else {
        render(true);
      }
    } else {
      render(true);
    }

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
  }

  document.querySelectorAll('.video-carousel').forEach((carousel) => {
    initSlideCarousel(carousel, 'video-carousel', {
      onSlideChange: (slide, isActive, allowPlay) => {
        const video = slide.querySelector('video');
        if (!video) return;
        if (isActive) {
          if (allowPlay) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
    });
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

  /* --- Lazy-play ambient videos: the standalone muted/looping
     background-style clips (tv-video.mp4, social-story.mp4,
     app-launch-en.mp4) used to `autoplay` unconditionally on page load,
     downloading and playing regardless of scroll position. They're now
     `preload="none"` in the markup and only start once actually
     scrolled into view, pausing again on scroll-out. Carousel slide
     videos are excluded — .video-carousel above already drives their
     play/pause per active slide. */
  const lazyVideos = Array.from(document.querySelectorAll('.video-ui video'))
    .filter((video) => !video.closest('.video-carousel__slide'));

  if (lazyVideos.length) {
    if ('IntersectionObserver' in window) {
      const lazyVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play().catch(() => {});
          } else {
            entry.target.pause();
          }
        });
      }, { threshold: 0.25 });

      lazyVideos.forEach((video) => lazyVideoObserver.observe(video));
    } else {
      lazyVideos.forEach((video) => video.play().catch(() => {}));
    }
  }

  /* --- Approach carousel: same shared logic as .video-carousel above,
     just a different class prefix and no video to play/pause. */
  document.querySelectorAll('.vertical-carousel').forEach((carousel) => {
    initSlideCarousel(carousel, 'vertical-carousel');
  });

  /* --- Marquee: duplicate the author's one word-set enough times that
     the loop never runs out of content and shows a gap — a fixed 2x
     duplicate only stays gapless while the viewport is narrower than one
     set's rendered width, which isn't reliably true across breakpoints. */
  document.querySelectorAll('.marquee__track').forEach((track) => {
    const originalChildren = Array.from(track.children);
    if (!originalChildren.length) return;

    function build() {
      track.style.animation = 'none';
      track.innerHTML = '';
      originalChildren.forEach((el) => track.appendChild(el.cloneNode(true)));
      const setWidth = track.scrollWidth;
      const k = Math.ceil((window.innerWidth * 1.2) / setWidth);
      const setsNeeded = Math.max(2, k * 2);
      for (let i = 1; i < setsNeeded; i++) {
        originalChildren.forEach((el) => track.appendChild(el.cloneNode(true)));
      }
      track.style.animation = '';
    }

    build();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });
  });
})();
