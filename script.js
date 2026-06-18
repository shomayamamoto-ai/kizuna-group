// ===== Opening movie =====
(() => {
  const intro = document.getElementById('loader');
  if (!intro) return;
  const skipBtn = document.getElementById('introSkip');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    intro.classList.add('done');
    document.body.classList.remove('intro-active');
    window.setTimeout(() => intro.remove(), 1100);
  };
  document.body.classList.add('intro-active');
  if (skipBtn) skipBtn.addEventListener('click', dismiss);
  intro.addEventListener('click', (e) => {
    if (e.target === intro) dismiss();
  });
  // 自動で再生し終えたら閉幕（reduced-motion は短縮）
  window.addEventListener('load', () => setTimeout(dismiss, reduce ? 600 : 3400));
})();

// ===== Header scroll state + progress bar + to-top =====
const header = document.getElementById('header');
const progress = document.getElementById('scrollProgress');
const toTop = document.getElementById('toTop');

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  if (toTop) toTop.classList.toggle('show', y > 600);
  if (progress) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile nav (hamburger) =====
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
const navBackdrop = document.getElementById('navBackdrop');

function setNav(open) {
  nav.classList.toggle('open', open);
  navToggle.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  document.body.classList.toggle('nav-locked', open);
  if (navBackdrop) {
    if (open) navBackdrop.hidden = false;
    navBackdrop.classList.toggle('show', open);
  }
}
navToggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNav(false)));
if (navBackdrop) navBackdrop.addEventListener('click', () => setNav(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) setNav(false);
});

// ===== Scroll reveal =====
const reveals = document.querySelectorAll('.reveal-up');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);
reveals.forEach((el) => revealObserver.observe(el));

// Stagger business cards
document.querySelectorAll('.business-grid .reveal-up').forEach((el, i) => {
  el.style.setProperty('--d', (i % 3) * 0.08 + 's');
});

// ===== Stat counters =====
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const isYear = target >= 1900;
  const duration = isYear ? 1200 : 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.stat-num[data-count]').forEach((el) => statObserver.observe(el));

// ===== Active nav link + breadcrumb on scroll =====
const crumbLabels = {
  about: '私たちについて',
  values: '私たちの価値観',
  profile: '代表紹介',
  vision: '企業理念',
  business: '事業内容',
  strength: '選ばれる理由',
  flow: 'ご相談の流れ',
  company: '会社概要',
  faq: 'よくある質問',
  contact: 'お問い合わせ',
};
const navHrefs = new Set(['about', 'business', 'company', 'faq', 'contact']);
const sections = Object.keys(crumbLabels)
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navLinks = Array.from(nav.querySelectorAll('a'));
const breadcrumb = document.getElementById('breadcrumb');
const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
const heroEl = document.getElementById('hero');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (navHrefs.has(id)) {
          navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
        if (breadcrumbCurrent && crumbLabels[id]) breadcrumbCurrent.textContent = crumbLabels[id];
      }
    });
  },
  { threshold: 0.5 }
);
sections.forEach((s) => sectionObserver.observe(s));

// Show breadcrumb once the hero is scrolled past
if (breadcrumb && heroEl) {
  const heroObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => breadcrumb.classList.toggle('is-visible', !e.isIntersecting)),
    { threshold: 0, rootMargin: '-120px 0px 0px 0px' }
  );
  heroObserver.observe(heroEl);
}

// ===== Cursor spotlight (desktop, pointer-fine only) =====
const spotlight = document.getElementById('spotlight');
const finePointer = window.matchMedia('(pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (spotlight && finePointer && !reduceMotion) {
  window.addEventListener('mousemove', (e) => {
    spotlight.classList.add('on');
    spotlight.style.setProperty('--mx', e.clientX + 'px');
    spotlight.style.setProperty('--my', e.clientY + 'px');
  });
  window.addEventListener('mouseleave', () => spotlight.classList.remove('on'));
}

// ===== 3D tilt on cards =====
if (finePointer && !reduceMotion) {
  const tiltCards = document.querySelectorAll('.biz-card, .vision-card, .value-card');
  const MAX = 7;
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== Hero parallax =====
const heroEmblem = document.querySelector('.hero-emblem');
const heroGlow = document.querySelector('.hero-glow');
if (!reduceMotion && (heroEmblem || heroGlow)) {
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        if (heroEmblem) heroEmblem.style.transform = `translateY(${y * 0.18}px)`;
        if (heroGlow) heroGlow.style.transform = `translateX(-50%) translateY(${y * 0.12}px)`;
      }
    },
    { passive: true }
  );
}

// ===== FAQ: open one at a time =====
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});

// ===== Contact: 公式LINEに一本化（フォームは廃止） =====

// ===== Hero particles =====
const particleHost = document.getElementById('heroParticles');
if (particleHost && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const count = window.innerWidth < 600 ? 12 : 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.style.left = Math.random() * 100 + '%';
    const size = 1 + Math.random() * 2.5;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.animationDuration = 9 + Math.random() * 10 + 's';
    p.style.animationDelay = -Math.random() * 14 + 's';
    particleHost.appendChild(p);
  }
}
