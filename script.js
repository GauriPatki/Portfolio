// Cursor-reactive glow on cards
const glowSelector = '.project-card, .edu-card, .contact-item, .stat, .pin-card';
document.querySelectorAll(glowSelector).forEach(card => {
  card.classList.add('glow-card');
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

const tabs = document.querySelectorAll('.console-tab');
const panels = document.querySelectorAll('.console-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.target;

    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.querySelector(`.console-panel[data-panel="${target}"]`);
    panel.classList.add('active');

    animateBars(panel);
  });
});

function animateBars(panel) {
  const fills = panel.querySelectorAll('.metric-fill');
  fills.forEach(fill => {
    const after = fill.dataset.after || 0;
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => {
        fill.style.width = after + '%';
      }, 50);
    });
  });
}

// Animate the first (active) panel on load
window.addEventListener('DOMContentLoaded', () => {
  const activePanel = document.querySelector('.console-panel.active');
  if (activePanel) animateBars(activePanel);
});

// Animate hero stat counters on scroll into view
const counters = document.querySelectorAll('.stat-num[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

counters.forEach(counter => counterObserver.observe(counter));

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Animate metric bars on scroll into view (for console section entering viewport)
const consoleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const activePanel = document.querySelector('.console-panel.active');
      if (activePanel) animateBars(activePanel);
      consoleObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const consoleEl = document.querySelector('.console');
if (consoleEl) consoleObserver.observe(consoleEl);

// Generic scroll-reveal for cards, timeline items, publication rows
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Timeline progress line — fills as the timeline scrolls through the viewport
const timelineEl = document.querySelector('.timeline');
const timelineFill = document.getElementById('timelineFill');

function updateTimelineFill() {
  if (!timelineEl || !timelineFill) return;
  const rect = timelineEl.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const total = rect.height;

  // How much of the timeline has scrolled past the viewport's vertical center
  const scrolled = (viewportH * 0.6) - rect.top;
  const progress = Math.max(0, Math.min(1, scrolled / total));

  timelineFill.style.height = (progress * 100) + '%';
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateTimelineFill();
      ticking = false;
    });
    ticking = true;
  }
});
window.addEventListener('resize', updateTimelineFill);
updateTimelineFill();

// Scroll progress bar
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress();

// Cursor spotlight — tracks mouse position for the radial glow on cards
const spotlightEls = document.querySelectorAll('.project-card, .edu-card');
spotlightEls.forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', x + '%');
    el.style.setProperty('--my', y + '%');
  });
});

// Nav scroll-spy — highlights the current section's nav link
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === id);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(section => spyObserver.observe(section));
