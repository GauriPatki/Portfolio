// Console tab switching
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
