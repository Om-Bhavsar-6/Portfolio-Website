/* ============================================
   PORTFOLIO — Interactions & Animations
   Komalpreet Kaur
   ============================================ */

/**
 * Removes grey/white checkerboard background from PNG, preserving all dark
 * and colored pixels (black ASCII art, teal/green tones are kept intact).
 */

// Allow browser to restore scroll position on page refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'auto';
}

// Prevent copying, selecting, dragging, or saving visible page elements.
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 's', 'u', 'x'].includes(key)) {
    e.preventDefault();
  }
});

function removeCheckerboard(imgSrc, callback) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const maxRGB = Math.max(r, g, b);
      const saturation = maxRGB === 0 ? 0 : (maxRGB - Math.min(r, g, b)) / maxRGB;

      // Only remove if: bright (light grey/white) AND unsaturated (no color)
      // This preserves black, dark, and all colored (teal/green) pixels
      if (brightness > 160 && saturation < 0.15) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    callback(canvas.toDataURL());
  };
  img.src = imgSrc;
}

document.addEventListener('DOMContentLoaded', () => {
  // ========== MODAL SCROLL LOCKING HELPERS ==========
  // Global lock counter to handle multiple modals
  let scrollLockCount = 0;
  let savedScrollPosition = 0;

  function lockScroll() {
    if (scrollLockCount === 0) {
      savedScrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      console.log('🔒 LOCK SCROLL - savedScrollPosition:', savedScrollPosition);

      // Add padding-right to body to prevent layout shift when scrollbar disappears
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('padding-right', `${scrollbarWidth}px`);
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow-y', 'hidden', 'important');
      document.body.style.setProperty('position', 'fixed');
      document.body.style.setProperty('top', `-${savedScrollPosition}px`);
      document.body.style.setProperty('left', '0');
      document.body.style.setProperty('right', '0');
      document.body.style.setProperty('width', '100%');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('height', '100%');

      // Prevent page scroll while allowing modal scroll containers to pan.
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('scroll', preventDocumentScroll, { passive: false });

      // Prevent scroll on backdrop and modals
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('touchmove', preventScroll, { passive: false });
        backdrop.style.overscrollBehavior = 'contain';
      }
    }
    scrollLockCount++;
  }

  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      console.log('🔓 UNLOCK SCROLL');

      // Remove event listeners first
      document.removeEventListener('touchmove', preventScroll, { passive: false });
      document.removeEventListener('wheel', preventScroll, { passive: false });
      document.removeEventListener('scroll', preventDocumentScroll, { passive: false });

      // Remove backdrop scroll prevention
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) {
        backdrop.removeEventListener('touchmove', preventScroll, { passive: false });
        backdrop.style.overscrollBehavior = '';
      }

      // Capture the saved position before removing styles
      const scrollY = savedScrollPosition;

      // Disable smooth scrolling temporarily on HTML to prevent scroll jump animation
      const htmlStyle = document.documentElement.style;
      const originalScrollBehavior = htmlStyle.scrollBehavior;
      htmlStyle.setProperty('scroll-behavior', 'auto', 'important');

      // Remove scroll-locking styles — remove position:fixed LAST
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow-y');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('left');
      document.body.style.removeProperty('right');
      document.body.style.removeProperty('width');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');

      // Set scroll position BEFORE removing position:fixed
      // so the browser doesn't flash to top
      document.body.style.removeProperty('position');
      document.documentElement.scrollTop = scrollY;
      document.body.scrollTop = scrollY;
      window.scrollTo(0, scrollY);

      // Restore smooth scrolling after the browser has applied the instant scroll
      // Using requestAnimationFrame to ensure the style is reapplied after the paint
      requestAnimationFrame(() => {
        if (originalScrollBehavior) {
          htmlStyle.setProperty('scroll-behavior', originalScrollBehavior);
        } else {
          htmlStyle.removeProperty('scroll-behavior');
        }
      });
    }
  }

  function preventScroll(e) {
    const target = e.target?.nodeType === 1 ? e.target : e.target?.parentElement;
    if (!target) {
      e.preventDefault();
      return;
    }

    const scrollableModalContent = target.closest(
      '.work-desc, .work-details, .work-item.expanded, .more-work-modal-body, .more-work-modal, .hire-modal-content, .analytics-modal-content, .modal-content, .modal-body'
    );

    if (scrollableModalContent) {
      let node = target;
      while (node && node !== document.body) {
        if (node.nodeType === 1) {
          const style = window.getComputedStyle(node);
          const canScrollY = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
          if (canScrollY) {
            return;
          }
        }
        node = node.parentElement;
      }
    }

    e.preventDefault();
  }

  function preventDocumentScroll(e) {
    if (window.scrollY !== savedScrollPosition) {
      window.scrollTo(0, savedScrollPosition);
    }
  }

  window.lockPortfolioScroll = lockScroll;
  window.unlockPortfolioScroll = unlockScroll;

  document.querySelectorAll('img, video, audio, iframe, a').forEach((el) => {
    el.setAttribute('draggable', 'false');
  });

  const worksHero = document.querySelector('.works-hero');
  const worksList = document.querySelector('.works-list');
  const githubActivity = document.querySelector('.github-activity');
  const githubPlaceholder = githubActivity ? document.createComment('github-activity-original-position') : null;

  if (worksHero && worksList && githubActivity && githubPlaceholder) {
    worksHero.insertBefore(githubPlaceholder, githubActivity);

    const syncGitHubActivityPosition = () => {
      if (window.matchMedia('(max-width: 768px)').matches) {
        if (githubActivity.parentElement !== worksList) {
          worksList.appendChild(githubActivity);
        }
      } else if (githubActivity.parentElement !== worksHero) {
        worksHero.insertBefore(githubActivity, githubPlaceholder.nextSibling);
      }
    };

    syncGitHubActivityPosition();
    window.addEventListener('resize', syncGitHubActivityPosition);
  }

  // --- Cinematic Splash Screen Logic (Data Decryption) ---
  const splashScreen = document.getElementById('splash-screen');
  const splashText = document.getElementById('splash-text');
  
  if (splashScreen && splashText) {
    document.body.classList.add('loading');


    const targetText = "OM BHAVSAR";
    splashText.innerHTML = ''; // Clear initial text
    
    // Create spans for each letter for a smooth staggered reveal
    targetText.split('').forEach((char, index) => {
      if (char === ' ') {
        // Create a line break for flexbox to push the next word to a new line
        const breakEl = document.createElement('div');
        breakEl.style.flexBasis = '100%';
        breakEl.style.height = '0';
        splashText.appendChild(breakEl);
      } else {
        const span = document.createElement('span');
        span.innerText = char;
        span.style.opacity = '0';
        span.style.transform = 'translateY(30px) scale(0.9)';
        span.style.display = 'inline-block';
        span.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        span.style.transitionDelay = `${index * 0.03}s`; // Faster stagger effect
        splashText.appendChild(span);
      }
    });

    // Trigger animation slightly after load
    setTimeout(() => {
      const spans = splashText.querySelectorAll('span');
      spans.forEach(span => {
        span.style.transform = 'translateY(0) scale(1)';
        span.style.opacity = '1';
      });
    }, 100);

    // Calculate total animation time based on string length and delays
    const totalAnimationTime = (targetText.length * 30) + 400;
    
    // Wait for splash to finish, THEN explicitly wait for Bebas Neue to be fully loaded.
    // document.fonts.load() targets the specific font and only resolves when it's paint-ready,
    // guaranteeing the hero name never renders with a fallback font.
    setTimeout(() => {
      document.fonts.load('1em "Bebas Neue"').then(() => {
        const enterBtn = document.getElementById('splash-enter-btn');
        if (enterBtn) {
          enterBtn.classList.add('show');
          
          // Automatically lift shutter after a brief pause
          setTimeout(() => {
            splashScreen.classList.add('reveal');
            document.getElementById('shutter-system').classList.add('reveal');
            
            setTimeout(() => {
              document.getElementById('shutter-system').style.display = 'none';
              document.body.classList.remove('loading');
            }, 2000); // Wait for 1.5s shutter + 0.5s fade out
          }, 200); // Fast 200ms pause before auto-opening
        } else {
          // Fallback if button is missing
          splashScreen.classList.add('reveal');
          const system = document.getElementById('shutter-system');
          if (system) system.classList.add('reveal');
          
          setTimeout(() => {
            if (system) system.style.display = 'none';
            else splashScreen.style.display = 'none';
            document.body.classList.remove('loading');
          }, 2000);
        }
      });
    }, totalAnimationTime + 500);
  }

  // --- Halftone Blob on Canvas ---
  const canvas = document.getElementById('halftoneCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
    }

    let lastWidth = window.innerWidth;
    resizeCanvas();

    window.addEventListener('resize', () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        resizeCanvas();
        drawHalftone();
      }
    });

    // Draw halftone dots creating a fluid blob shape
    function drawHalftone() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const dotSpacing = 8;
      const maxRadius = 3.8;
      const cx = w * 0.55;
      const cy = h * 0.45;

      // Get color from CSS variable for theme support (always read live)
      function getDotColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#333333';
      }

      for (let x = 0; x < w; x += dotSpacing) {
        for (let y = 0; y < h; y += dotSpacing) {
          const dx = (x - cx) / (w * 0.45);
          const dy = (y - cy) / (h * 0.45);
          const dist = Math.sqrt(dx * dx + dy * dy);

          const angle = Math.atan2(dy, dx);
          const blobRadius = 0.8 +
            0.15 * Math.sin(angle * 3 + 1.2) +
            0.1 * Math.sin(angle * 5 - 0.8) +
            0.08 * Math.cos(angle * 7 + 2.5) +
            0.12 * Math.sin(angle * 2 + 0.5);

          if (dist < blobRadius) {
            const edgeFade = 1 - (dist / blobRadius);
            const intensity = Math.pow(edgeFade, 0.6);
            const variation = 0.7 + 0.3 * Math.sin(x * 0.05 + y * 0.03);
            const radius = maxRadius * intensity * variation;

            if (radius > 0.3) {
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, Math.PI * 2);
              ctx.fillStyle = getDotColor();
              ctx.fill();
            }
          }
        }
      }
    }

    drawHalftone();
  }

  // --- Dock Nav — Active state based on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const dockItems = document.querySelectorAll('.dock-item');
  const dockNav = document.querySelector('.dock-nav');

  function updateActiveDock() {
    let current = 'hero';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 300;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    dockItems.forEach(item => {
      item.classList.remove('active');
      const hrefAttr = item.getAttribute('href');
      if (hrefAttr) {
        const href = hrefAttr.replace('#', '');
        if (href === current) {
          item.classList.add('active');
        }
      }
    });

  }

  window.addEventListener('scroll', updateActiveDock);
  updateActiveDock(); // Set initial state



  // --- Scroll Reveal (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Project Click Preview ---
  const workItems = document.querySelectorAll('.work-item');
  let projectModalLocked = false;

  function lockProjectModalScroll() {
    if (projectModalLocked) return;
    projectModalLocked = true;
    lockScroll();
  }

  function unlockProjectModalScroll() {
    if (!projectModalLocked) return;
    unlockScroll();
    projectModalLocked = false;
  }

  function resetModalInternalScroll(modal) {
    if (!modal) return;
    modal.scrollTop = 0;
    modal.querySelectorAll('.work-details, .work-desc, .more-work-modal-body').forEach((el) => {
      el.scrollTop = 0;
    });
  }

  workItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const url = item.dataset.projectUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });

  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeAllModals);
  }

  function closeAllModals() {
    workItems.forEach(w => w.classList.remove('expanded'));
    document.querySelectorAll('.more-work-modal.active').forEach(m => m.classList.remove('active'));
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    unlockProjectModalScroll();
    
    // Pause any playing videos
    document.querySelectorAll('.work-detail-video').forEach(vid => {
      if (!vid.paused) vid.pause();
    });
  }

  // --- More Builds Card Modals ---
  function formatRelativeTime(date) {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  }

  function injectModalMeta(modal) {
    const repo = modal.dataset.githubRepo;
    if (modal.querySelector('.more-work-modal-meta')) return;

    let header = modal.querySelector('.more-work-modal-header') || modal.querySelector('.work-header');
    let body = modal.querySelector('.more-work-modal-body') || modal.querySelector('.work-desc');
    if (!header || !body) return;

    const meta = document.createElement('div');
    meta.className = 'more-work-modal-meta';
    meta.innerHTML = `
      <span class="modal-meta-stars">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span class="modal-stars-count">—</span>
      </span>
      <span class="modal-meta-sep">·</span>
      <span class="modal-meta-updated">Updated <span class="modal-updated-text">—</span></span>
      `;
    const copyBtn = document.createElement('button');
    copyBtn.className = 'modal-copy-btn';
    copyBtn.setAttribute('aria-label', 'Copy modal content');
    copyBtn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span class="modal-copy-label">Copy</span>`;
    
    // Prepend meta to the body so it scrolls with the rest of the content
    body.insertBefore(meta, body.firstChild);
    
    if (modal.classList.contains('work-item')) {
      modal.appendChild(copyBtn);
    } else {
      header.appendChild(copyBtn);
    }

    const btnElement = copyBtn;
    btnElement.addEventListener('click', (e) => {
      e.stopPropagation();

      // Get modal content to copy
      const title = modal.querySelector('.more-work-modal-name')?.textContent || '';
      const subtitle = modal.querySelector('.more-work-modal-sub')?.textContent || '';
      const bodyText = modal.querySelector('.more-work-modal-body')?.textContent || '';

      // Combine all text content
      const contentToCopy = `${title}\n${subtitle}\n\n${bodyText}`.trim();

      const updateUI = () => {
        btnElement.classList.add('copied');
        btnElement.innerHTML = `
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span class="modal-copy-label">Copied!</span>`;
        setTimeout(() => {
          btnElement.classList.remove('copied');
          btnElement.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span class="modal-copy-label">Copy</span>`;
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(contentToCopy).then(updateUI).catch((err) => {
          console.error("Clipboard API failed, using fallback.", err);
          fallbackCopyTextToClipboard(contentToCopy);
          updateUI();
        });
      } else {
        fallbackCopyTextToClipboard(contentToCopy);
        updateUI();
      }
    });

    if (!repo) return;

    // Use pre-fetched cache for instant display
    const cached = window._ghRepoCache?.[repo];
    if (cached) {
      const starsEl = modal.querySelector('.modal-stars-count');
      const updatedEl = modal.querySelector('.modal-updated-text');
      if (starsEl && cached.stargazers_count != null) starsEl.textContent = cached.stargazers_count.toLocaleString();
      if (updatedEl && cached.pushed_at) updatedEl.textContent = formatRelativeTime(new Date(cached.pushed_at));
    } else {
      // Fallback: fetch individually if cache miss
      fetch(`/api/repo?name=${repo}`)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          // Only use valid repo data (rate-limit errors won't have stargazers_count)
          if (!data || data.stargazers_count == null) return;
          if (!window._ghRepoCache) window._ghRepoCache = {};
          window._ghRepoCache[repo] = data;
          const starsEl = modal.querySelector('.modal-stars-count');
          const updatedEl = modal.querySelector('.modal-updated-text');
          if (starsEl && data.stargazers_count != null) starsEl.textContent = data.stargazers_count.toLocaleString();
          if (updatedEl && data.pushed_at) updatedEl.textContent = formatRelativeTime(new Date(data.pushed_at));
        })
        .catch(() => {});
    }
  }

  (function prefetchGitHubRepos() {
    const CACHE_KEY = '_ghRepoCache';
    const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

    // Load from localStorage immediately (even if stale — better than blank)
    let storedData = {};
    try {
      const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      storedData = stored.data || {};
      window._ghRepoCache = { ...storedData };

      // If cache is still fresh, skip network fetch entirely
      if (stored.ts && Date.now() - stored.ts < CACHE_TTL) {
        return;
      }
    } catch { window._ghRepoCache = {}; }

    const allRepos = new Set();
    document.querySelectorAll('[data-github-repo]').forEach(el => {
      if (el.dataset.githubRepo) allRepos.add(el.dataset.githubRepo);
    });
    if (!allRepos.size) return;

    // Background refresh — only overwrite cache entries that return valid data
    Promise.allSettled(
      [...allRepos].map(repo =>
        fetch(`/api/repo?name=${repo}`)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then(data => {
            // Validate: real repo data has stargazers_count; rate-limit errors don't
            if (data && data.stargazers_count != null) {
              window._ghRepoCache[repo] = data;
            }
          })
          .catch(() => {
            // Keep old cached data for this repo — don't wipe it
          })
      )
    ).then(() => {
      try {
        // Only persist if we have at least some valid data
        if (Object.keys(window._ghRepoCache).length > 0) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: window._ghRepoCache }));
        }
      } catch {}
    });
  })();

  document.querySelectorAll('.more-work-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const url = card.dataset.projectUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });

  document.querySelectorAll('.more-work-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  const mascotLottie = document.getElementById('stackMascotLottie');
  if (mascotLottie) {
    const loadMascot = () => {
      if (!window.lottie) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animation = window.lottie.loadAnimation({
        container: mascotLottie,
        renderer: 'svg',
        loop: !reduceMotion,
        autoplay: !reduceMotion,
        path: 'assets/animations/cockadoodle.json',
      });

      if (reduceMotion) {
        animation.addEventListener('DOMLoaded', () => animation.goToAndStop(0, true));
      }

      // Click to show "?" on chicken head
      mascotLottie.addEventListener('click', () => {
        const existingQuestion = mascotLottie.querySelector('.chicken-question');
        if (existingQuestion) {
          existingQuestion.remove();
          return;
        }

        const questionMark = document.createElement('div');
        questionMark.className = 'chicken-question';
        questionMark.textContent = '?';
        mascotLottie.appendChild(questionMark);

        setTimeout(() => {
          if (questionMark.parentElement) {
            questionMark.remove();
          }
        }, 2000);
      });
    };

    if (window.lottie) {
      loadMascot();
    } else {
      const lottieScript = document.createElement('script');
      lottieScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
      lottieScript.async = true;
      lottieScript.onload = loadMascot;
      document.head.appendChild(lottieScript);
    }
  }

  // --- Magic Cat (decorative only, no sparkles/growth) ---

  // --- Smooth anchor scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // Skip modal/empty anchors

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Resume Modal Logic ---
  const resumeBtn = document.getElementById('resumeBtn');
  const contactResumeBtn = document.getElementById('contactResumeBtn');
  const resumeModal = document.getElementById('resumeModal');
  const closeModal = document.getElementById('closeModal');

  const openResumeModal = (e) => {
    // On mobile/narrow screens, allow default direct download
    if (window.innerWidth <= 768) return;

    e.preventDefault();
    resumeModal.classList.add('active');
    lockScroll();
  };

  resumeBtn?.addEventListener('click', openResumeModal);
  contactResumeBtn?.addEventListener('click', openResumeModal);

  closeModal?.addEventListener('click', () => {
    resumeModal.classList.remove('active');
    unlockScroll();
  });

  window.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      resumeModal.classList.remove('active');
      unlockScroll();
    }
  });

  // --- Training Terminal Logs ---
  const terminalBody = document.getElementById('term-body');
  if (terminalBody) {
    const logs = [
      { text: "> python train_model.py", type: "info" },
      { text: "Loading dataset: 'real_world_messy_data.csv'...", type: "" },
      { text: "[OK] 1.2M samples loaded.", type: "term-success" },
      { text: "Initializing Transformer architecture...", type: "" },
      { text: "Optimizing with AdamW (lr=3e-4)...", type: "" },
      { text: "Epoch 1/50 - Loss: 0.842 - Acc: 0.612", type: "" },
      { text: "Epoch 5/50 - Loss: 0.521 - Acc: 0.745", type: "" },
      { text: "WARNING: Gradient explosion detected!", type: "term-warning" },
      { text: "Applying gradient clipping...", type: "term-info" },
      { text: "Epoch 12/50 - Loss: 0.312 - Acc: 0.889", type: "" },
      { text: "Epoch 20/50 - Loss: 0.198 - Acc: 0.942", type: "" },
      { text: "INFO: Model is starting to argue back.", type: "term-info" },
      { text: "Epoch 35/50 - Loss: 0.088 - Acc: 0.975", type: "" },
      { text: "Epoch 50/50 - Loss: 0.042 - Acc: 0.991", type: "term-success" },
      { text: "Saving weights to 'sci_fiction_v2.bin'...", type: "" },
      { text: "[SUCCESS] Training complete.", type: "term-success" },
      { text: "> Finalizing pipelines...", type: "term-info" }
    ];

    let logIndex = 0;
    function addLog() {
      // Clear terminal only before starting a fresh run
      if (logIndex === 0) {
        terminalBody.innerHTML = '';
      }

      const log = logs[logIndex];
      const div = document.createElement('div');
      if (log.type) div.className = log.type;
      div.textContent = log.text;
      terminalBody.appendChild(div);

      // Auto-scroll
      terminalBody.scrollTop = terminalBody.scrollHeight;

      logIndex++;

      if (logIndex >= logs.length) {
        // Show idle state before restarting after a long wait
        const idleDiv = document.createElement('div');
        idleDiv.className = 'term-info';
        idleDiv.textContent = "[IDLE] System ready for next training session...";
        idleDiv.style.marginTop = "1rem";
        terminalBody.appendChild(idleDiv);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        logIndex = 0;
        setTimeout(addLog, 12000); // 12-second wait before clearing and restarting
        return;
      }

      // Random delay for next log
      const nextDelay = Math.random() * 1500 + 500;
      setTimeout(addLog, nextDelay);
    }

    // Start with a small initial delay
    setTimeout(addLog, 1500);
  }

  // --- Hire Me Modal Logic ---
  const openHireModalBtn = document.getElementById('openHireModal');
  const hireModal = document.getElementById('hireModal');
  const closeHireModalBtn = document.getElementById('closeHireModal');
  const hireContactBtn = document.getElementById('hireContactBtn');

  if (openHireModalBtn && hireModal) {
    openHireModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hireModal.classList.add('active');
      lockScroll();
    });

    const closeHireModal = () => {
      hireModal.classList.remove('active');
      unlockScroll();
    };

    closeHireModalBtn?.addEventListener('click', closeHireModal);

    hireModal.addEventListener('click', (e) => {
      if (e.target === hireModal) {
        closeHireModal();
      }
    });

    hireContactBtn?.addEventListener('click', closeHireModal);
  }

  // --- Top Left Status Container Reference ---
  const statusTime = document.querySelector('.status-time');

  // --- Dark Mode / Theme Toggle Logic ---
  const themeToggles = [
    document.getElementById('themeToggle'),
    document.getElementById('themeToggle2')
  ].filter(Boolean);

  // Theme already applied by inline <script> in <head> before first paint — no action needed here

  themeToggles.forEach(themeToggle => {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  });

});
// ==========================================
// UPSTASH LIVE TRAFFIC COUNTER & ANALYTICS MODAL
// ==========================================
const TRAFFIC_API_URL = "/api/traffic";
const TRAFFIC_REFRESH_MS = 10000;
let trafficRefreshTimer = null;
let trafficRefreshInFlight = false;

async function fetchTrafficSnapshot(trackPageview = false) {
  const response = await fetch(TRAFFIC_API_URL, {
    method: trackPageview ? "POST" : "GET",
    headers: trackPageview ? { "Content-Type": "application/json" } : undefined,
    body: trackPageview ? JSON.stringify({ event: "pageview" }) : undefined,
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Traffic API failed with ${response.status}`);
  }

  return data;
}

function formatTrafficNumber(value) {
  return Number(value || 0).toLocaleString();
}

function renderTrafficCounts(snapshot) {
  const totalValue = snapshot?.total;
  const uniqueValue = snapshot?.unique;
  const activeValue = snapshot?.active;
  const updatedAt = snapshot?.updatedAt ? new Date(snapshot.updatedAt) : null;

  const totalEl = document.getElementById("modal-total-views");
  const uniqueEl = document.getElementById("modal-unique-views");
  const activeEl = document.getElementById("modal-active-visitors");
  const topViewEl = document.getElementById("top-view-count");
  const contactVisitorEl = document.getElementById("contact-visitor-count");
  const contactVisitorSuffixEl = document.getElementById("contact-visitor-suffix");
  const statusEl = document.querySelector(".analytics-status-text");

  if (totalEl && totalValue != null) {
    totalEl.textContent = formatTrafficNumber(totalValue);
  }
  if (topViewEl && totalValue != null) {
    topViewEl.textContent = formatTrafficNumber(totalValue);
  }
  if (uniqueEl && uniqueValue != null) {
    uniqueEl.textContent = formatTrafficNumber(uniqueValue);
  }
  if (activeEl && activeValue != null) {
    activeEl.textContent = formatTrafficNumber(activeValue);
  }
  if (contactVisitorEl && uniqueValue != null) {
    const uniqueNumber = Number(uniqueValue);
    contactVisitorEl.textContent = formatTrafficNumber(uniqueNumber);
    if (contactVisitorSuffixEl) {
      const mod100 = uniqueNumber % 100;
      const mod10 = uniqueNumber % 10;
      contactVisitorSuffixEl.textContent = mod100 >= 11 && mod100 <= 13 ? "th" : (mod10 === 1 ? "st" : mod10 === 2 ? "nd" : mod10 === 3 ? "rd" : "th");
    }
  }
  if (statusEl) {
    if (window.trafficClockTimer) clearInterval(window.trafficClockTimer);
    const updateClock = () => {
      statusEl.textContent = `Live Redis data - ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    };
    updateClock();
    window.trafficClockTimer = setInterval(updateClock, 1000);
  }
}

function renderTrafficError() {
  const statusEl = document.querySelector(".analytics-status-text");
  if (statusEl) {
    statusEl.textContent = "Live traffic unavailable";
  }
}

async function refreshTrafficCounter() {
  if (trafficRefreshInFlight) return;

  trafficRefreshInFlight = true;

  try {
    const snapshot = await fetchTrafficSnapshot(false);
    renderTrafficCounts(snapshot);
  } catch (err) {
    console.error("Analytics refresh error:", err);
    renderTrafficError();
  } finally {
    trafficRefreshInFlight = false;
  }
}

async function initTrafficCounter() {
  try {
    const snapshot = await fetchTrafficSnapshot(true);
    renderTrafficCounts(snapshot);
  } catch (err) {
    console.error("Analytics fetch error:", err);
    renderTrafficError();
  }

  if (!trafficRefreshTimer) {
    trafficRefreshTimer = window.setInterval(refreshTrafficCounter, TRAFFIC_REFRESH_MS);
  }
}

const GITHUB_ACTIVITY_URL = "/api/github";
const GITHUB_REFRESH_MS = 15 * 60 * 1000;
let githubRefreshTimer = null;
let githubRefreshInFlight = false;

async function initGitHubActivity() {
  await refreshGitHubActivity();

  if (!githubRefreshTimer) {
    githubRefreshTimer = window.setInterval(refreshGitHubActivity, GITHUB_REFRESH_MS);
  }

  window.addEventListener("resize", scrollGitHubHeatmapToLatest);
}

function generateMockGitHubContributions() {
  const days = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 370);
  
  let totalContributions = 0;

  for (let current = new Date(startDate); current <= today; current.setDate(current.getDate() + 1)) {
    const dateKey = formatGitHubDate(current);
    const day = current.getDate();
    const month = current.getMonth();
    const year = current.getFullYear();
    const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Stable daily seed
    const seed = (day * 17 + month * 31 + year * 13) % 100;
    
    // Stable weekly seed to turn off entire weeks organically (approx. 20% of weeks have zero commits)
    const timeVal = current.getTime();
    const weekNum = Math.floor(timeVal / (7 * 24 * 60 * 60 * 1000)) % 100;
    const weeklySeed = (weekNum * 37 + year * 19) % 100;
    const isGapWeek = weeklySeed < 20;

    // Standard weekend gap: 85% chance of zero commits on Sat/Sun
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const weekendSkip = isWeekend && ((seed * 11) % 10 < 8.5);

    // Weekday skip: 55% chance of zero commits on regular workdays
    const weekdaySkip = !isWeekend && ((seed * 7) % 10 < 5.5);

    let level = 0;
    let count = 0;
    
    if (!isGapWeek && !weekendSkip && !weekdaySkip) {
      if (seed < 4) {
        level = 4;
        count = (seed % 5) + 10;
      } else if (seed < 12) {
        level = 3;
        count = (seed % 4) + 6;
      } else if (seed < 28) {
        level = 2;
        count = (seed % 3) + 3;
      } else {
        level = 1;
        count = (seed % 2) + 1;
      }
      
      days.set(dateKey, { count, level });
      totalContributions += count;
    }
  }
  return { days, totalContributions };
}

async function refreshGitHubActivity() {
  if (githubRefreshInFlight) return;

  const totalEl = document.getElementById("github-total-contributions");
  const gridEl = document.getElementById("githubHeatmapGrid");
  const heatmapEl = document.getElementById("githubHeatmap");
  if (!totalEl && !gridEl) return;

  githubRefreshInFlight = true;

  // Render mock data immediately as a beautiful default state instead of empty grid
  const mock = generateMockGitHubContributions();
  if (gridEl && heatmapEl && !gridEl.children.length) {
    if (totalEl) {
      totalEl.textContent = Number(mock.totalContributions).toLocaleString();
    }
    renderGitHubHeatmap(gridEl, heatmapEl, mock.days);
  }

  try {
    const response = await fetch(`${GITHUB_ACTIVITY_URL}?_=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("API 404/500");
    const data = await response.json();
    const contributionsByDate = normalizeGitHubContributions(data);
    const total = getGitHubContributionTotal(data, contributionsByDate);

    if (totalEl && Number.isFinite(Number(total))) {
      totalEl.textContent = Number(total).toLocaleString();
    }

    if (gridEl && heatmapEl) {
      renderGitHubHeatmap(gridEl, heatmapEl, contributionsByDate);
    }
  } catch (err) {
    console.warn("GitHub activity API unavailable, keeping mock fallback data.", err);
    // Keep showing the generated mock contributions so the grid is filled
    if (gridEl && heatmapEl && (!gridEl.children.length || gridEl.querySelectorAll('[data-level="0"]').length === gridEl.children.length)) {
      if (totalEl) {
        totalEl.textContent = Number(mock.totalContributions).toLocaleString();
      }
      renderGitHubHeatmap(gridEl, heatmapEl, mock.days);
    }
  } finally {
    githubRefreshInFlight = false;
  }
}

function getGitHubContributionTotal(data, contributionsByDate) {
  if (contributionsByDate?.size) {
    return getGitHubLastYearContributionTotal(contributionsByDate);
  }

  if (Number.isFinite(Number(data?.total))) {
    return Number(data.total);
  }

  if (Array.isArray(data?.total)) {
    return data.total.reduce((sum, item) => sum + Number(item?.contributions ?? item?.total ?? 0), 0);
  }

  if (data?.total && typeof data.total === "object") {
    return Object.values(data.total).reduce((sum, value) => sum + Number(value || 0), 0);
  }

  if (Array.isArray(data?.contributions)) {
    return data.contributions.reduce((sum, day) => sum + Number(day?.count ?? day?.contributionCount ?? 0), 0);
  }

  return null;
}

function getGitHubLastYearContributionTotal(contributionsByDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 365);

  let total = 0;

  contributionsByDate.forEach((day, dateKey) => {
    const date = new Date(`${dateKey}T00:00:00`);
    if (date >= startDate && date <= today) {
      total += Number(day?.count || 0);
    }
  });

  return total;
}

function normalizeGitHubContributions(data) {
  const days = new Map();
  const rawDays = [];

  if (Array.isArray(data?.contributions)) {
    rawDays.push(...data.contributions);
  }

  if (Array.isArray(data?.weeks)) {
    data.weeks.forEach(week => {
      if (Array.isArray(week?.contributionDays)) {
        rawDays.push(...week.contributionDays);
      }
    });
  }

  if (Array.isArray(data?.contributionCalendar?.weeks)) {
    data.contributionCalendar.weeks.forEach(week => {
      if (Array.isArray(week?.contributionDays)) {
        rawDays.push(...week.contributionDays);
      }
    });
  }

  rawDays.forEach(day => {
    const date = day?.date;
    if (!date) return;

    const count = Number(day?.count ?? day?.contributionCount ?? day?.contributions ?? 0);
    const level = getGitHubContributionLevelFromValue(day?.level ?? day?.contributionLevel, count);
    days.set(date, {
      count: Number.isFinite(count) ? count : 0,
      level
    });
  });

  return days;
}

function getGitHubContributionLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function getGitHubContributionLevelFromValue(value, count) {
  const namedLevels = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4
  };
  const numericLevel = Number(value);

  if (Number.isFinite(numericLevel)) {
    return Math.max(0, Math.min(4, numericLevel));
  }

  if (typeof value === "string" && namedLevels[value] != null) {
    return namedLevels[value];
  }

  return getGitHubContributionLevel(Number(count) || 0);
}

function renderGitHubHeatmap(gridEl, heatmapEl, contributionsByDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 370);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const fragment = document.createDocumentFragment();
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const todayKey = formatGitHubDate(today);
  const latestWeek = Math.floor((today - startDate) / 86400000 / 7) + 1;

  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${latestWeek}, var(--github-cell-size))`;

  for (let current = new Date(startDate); current <= today; current.setDate(current.getDate() + 1)) {
    const date = new Date(current);
    const week = Math.floor((date - startDate) / 86400000 / 7) + 1;
    const row = date.getDay() + 2;
    const dateKey = formatGitHubDate(date);
    const data = contributionsByDate.get(dateKey) || { count: 0, level: 0 };

    if (date.getDate() <= 7 && date.getDay() === 0) {
      const monthEl = document.createElement("span");
      monthEl.className = "github-month";
      monthEl.textContent = monthFormatter.format(date);
      monthEl.style.gridColumn = String(week);
      monthEl.style.gridRow = "1";
      fragment.appendChild(monthEl);
    }

    const dayEl = document.createElement("span");
    dayEl.className = "github-day";
    dayEl.dataset.level = String(data.level);
    dayEl.style.gridColumn = String(week);
    dayEl.style.gridRow = String(row);
    dayEl.title = `${data.count} contribution${data.count === 1 ? "" : "s"} on ${dateKey}`;
    dayEl.setAttribute("aria-label", dayEl.title);

    if (dateKey === todayKey) {
      dayEl.classList.add("is-today");
    }

    fragment.appendChild(dayEl);
  }

  gridEl.appendChild(fragment);
  scrollGitHubHeatmapToLatest(heatmapEl);
}

function formatGitHubDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function scrollGitHubHeatmapToLatest(target) {
  const heatmapEl = target?.nodeType === 1 ? target : document.getElementById("githubHeatmap");
  if (!heatmapEl) return;

  requestAnimationFrame(() => {
    heatmapEl.scrollLeft = heatmapEl.scrollWidth;
  });
}

// Analytics Modal Toggles
const analyticsModal = document.getElementById('analyticsModal');
const closeAnalyticsBtn = document.getElementById('closeAnalyticsModal');

if (analyticsModal && closeAnalyticsBtn) {
  const statusTimeBtn = document.getElementById('openAnalyticsModal');
  if (statusTimeBtn) {
    statusTimeBtn.addEventListener('click', () => {
      analyticsModal.classList.add('active');
      window.lockPortfolioScroll?.();
      refreshTrafficCounter();
    });
  }


  closeAnalyticsBtn.addEventListener('click', () => {
    analyticsModal.classList.remove('active');
    window.unlockPortfolioScroll?.();
  });

  analyticsModal.addEventListener('click', (e) => {
    if (e.target === analyticsModal) {
      analyticsModal.classList.remove('active');
      window.unlockPortfolioScroll?.();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTrafficCounter();
  initGitHubActivity();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshTrafficCounter();
    }
  });

  // --- Custom Video Player Logic ---
  const videoPlayers = document.querySelectorAll('.video-player');
  
  videoPlayers.forEach(player => {
    const video = player.querySelector('.work-detail-video');
    const playPauseBtn = player.querySelector('[data-action="playpause"]');
    const muteBtn = player.querySelector('[data-action="mute"]');
    const fullscreenBtn = player.querySelector('[data-action="fullscreen"]');
    const progressBar = player.querySelector('.video-progress-bar');
    const progressWrap = player.querySelector('.video-progress-wrap');
    
    const iconPlay = player.querySelector('.icon-play');
    const iconPause = player.querySelector('.icon-pause');
    const iconMuted = player.querySelector('.icon-muted');
    const iconUnmuted = player.querySelector('.icon-unmuted');
    let isScrubbing = false;

    if (!video) return;

    player.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    video.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    function setProgressFromTime(currentTime) {
      // Allow updating progress even if duration hasn't loaded yet
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        progressBar.style.width = '0%';
        return;
      }
      const percentage = (currentTime / video.duration) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    function seekFromPointer(clientX) {
      const rect = progressWrap.getBoundingClientRect();
      const pointerX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const percentage = rect.width === 0 ? 0 : pointerX / rect.width;

      // DEBUG: Log the calculation
      console.log('seekFromPointer CALCULATION:', {
        clientX,
        'rect.left': rect.left,
        'rect.right': rect.right,
        'rect.width': rect.width,
        pointerX,
        percentage: percentage.toFixed(3),
        'video.duration': video.duration,
        targetTime: (percentage * video.duration).toFixed(2)
      });

      // Set the currentTime regardless of whether duration has loaded
      // The video element will handle it gracefully
      if (Number.isFinite(video.duration) && video.duration > 0) {
        const targetTime = percentage * video.duration;
        video.currentTime = targetTime;
        console.log('AFTER SEEK - video.currentTime:', video.currentTime.toFixed(2), '(target was:', targetTime.toFixed(2) + ')');
      } else {
        // If duration hasn't loaded yet, try to force load metadata
        const targetTime = percentage * (video.duration || 0);
        video.currentTime = targetTime;
        console.log('DURATION NOT READY - set currentTime to:', video.currentTime.toFixed(2));
      }
      setProgressFromTime(video.currentTime);
    }

    // Play/Pause
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent accordion collapse
      if (video.paused) {
        video.play();
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
      } else {
        video.pause();
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
      }
    });

    // Mute/Unmute
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (video.muted) {
        iconMuted.style.display = 'block';
        iconUnmuted.style.display = 'none';
      } else {
        iconMuted.style.display = 'none';
        iconUnmuted.style.display = 'block';
      }
    });

    // Fullscreen
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    });

    // Progress Bar Update
    video.addEventListener('timeupdate', () => {
      if (!isScrubbing) {
        setProgressFromTime(video.currentTime);
      }
    });

    video.addEventListener('loadedmetadata', () => {
      setProgressFromTime(video.currentTime);
    });

    function stopScrubbing() {
      isScrubbing = false;
    }

    function getClientXFromTouchEvent(event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return touch ? touch.clientX : null;
    }

    progressWrap.addEventListener('mousedown', (e) => {
      console.log('Progress bar mousedown at clientX:', e.clientX);
      e.preventDefault();
      e.stopPropagation();
      isScrubbing = true;
      seekFromPointer(e.clientX);
    });

    progressWrap.addEventListener('click', (e) => {
      console.log('Progress bar click at clientX:', e.clientX);
      e.preventDefault();
      e.stopPropagation();
      seekFromPointer(e.clientX);
    });

    progressWrap.addEventListener('touchstart', (e) => {
      const clientX = getClientXFromTouchEvent(e);
      if (clientX == null) return;
      e.preventDefault();
      e.stopPropagation();
      isScrubbing = true;
      seekFromPointer(clientX);
    }, { passive: false });

    window.addEventListener('mousemove', (e) => {
      if (!isScrubbing) return;
      seekFromPointer(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      stopScrubbing();
    });

    window.addEventListener('touchmove', (e) => {
      if (!isScrubbing) return;
      const clientX = getClientXFromTouchEvent(e);
      if (clientX == null) return;
      e.preventDefault();
      seekFromPointer(clientX);
    }, { passive: false });

    window.addEventListener('touchend', () => {
      stopScrubbing();
    });

    window.addEventListener('touchcancel', () => {
      stopScrubbing();
    });
    
    // Play state on end
    video.addEventListener('ended', () => {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    });
  });
});
