// ===== Loader =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('done'), 500);
});

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

// ===== Mobile nav =====
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
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

// ===== Active nav link on scroll =====
const sections = ['about', 'business', 'company', 'faq', 'contact']
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navLinks = Array.from(nav.querySelectorAll('a'));
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  },
  { threshold: 0.5 }
);
sections.forEach((s) => sectionObserver.observe(s));

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

// ===== Contact form =====
// 本番のフォーム送信を有効にするには、Formspree(無料)でフォームを作成し、
// 下の FORMSPREE_ENDPOINT を発行された URL に置き換えてください。
//   例: 'https://formspree.io/f/abcdwxyz'
// 空のままだと、送信時にメールソフトが起動するフォールバック動作になります。
const FORMSPREE_ENDPOINT = '';
const CONTACT_EMAIL = 'info@slc.co.jp';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const statusEl = document.getElementById('cf-status');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const btnLabel = submitBtn ? submitBtn.textContent : '送信する';

  const setStatus = (msg, type) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;

    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const msg = document.getElementById('cf-msg').value.trim();

    // フォールバック: エンドポイント未設定ならメールソフトを起動
    if (!FORMSPREE_ENDPOINT) {
      const subject = encodeURIComponent(`【お問い合わせ】${name} 様`);
      const body = encodeURIComponent(`お名前：${name}\nメールアドレス：${email}\n\n${msg}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    // 本番: Formspree へ非同期送信（ページ遷移なし）
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '送信中…'; }
    setStatus('送信しています…', 'pending');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm),
      });
      if (res.ok) {
        contactForm.reset();
        setStatus('お問い合わせを受け付けました。ご連絡ありがとうございます。', 'ok');
      } else {
        const data = await res.json().catch(() => ({}));
        const detail = data.errors ? data.errors.map((x) => x.message).join(', ') : '';
        setStatus('送信に失敗しました。' + (detail || `お手数ですが ${CONTACT_EMAIL} へ直接ご連絡ください。`), 'err');
      }
    } catch (_) {
      setStatus(`送信に失敗しました。お手数ですが ${CONTACT_EMAIL} へ直接ご連絡ください。`, 'err');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = btnLabel; }
    }
  });
}

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
