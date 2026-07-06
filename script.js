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

// Command palette
const cmdSections = [
  { label: "About", meta: "#about", href: "#about" },
  { label: "Education", meta: "#education", href: "#education" },
  { label: "Eval Console — interactive demo", meta: "#console", href: "#console" },
  { label: "Search my work — live demo", meta: "#search", href: "#search" },
  { label: "Projects", meta: "#projects", href: "#projects" },
  { label: "Experience", meta: "#experience", href: "#experience" },
  { label: "Skills", meta: "#skills", href: "#skills" },
  { label: "Research & Publications", meta: "#research", href: "#research" },
  { label: "Contact", meta: "#contact", href: "#contact" },
];

const cmdOverlay = document.getElementById('cmdPalette');
const cmdInput = document.getElementById('cmdInput');
const cmdListEl = document.getElementById('cmdList');
const cmdTrigger = document.getElementById('cmdTrigger');
let cmdSelectedIndex = 0;
let cmdFiltered = cmdSections;

function renderCmdList() {
  cmdListEl.innerHTML = cmdFiltered.map((s, i) => `
    <div class="cmd-item ${i === cmdSelectedIndex ? 'selected' : ''}" data-href="${s.href}">
      <span>${s.label}</span>
      <span class="cmd-item-meta">${s.meta}</span>
    </div>
  `).join('') || '<p class="search-empty" style="padding:12px 16px;">No matches</p>';
}

function openCmdPalette() {
  cmdOverlay.classList.add('open');
  cmdInput.value = '';
  cmdFiltered = cmdSections;
  cmdSelectedIndex = 0;
  renderCmdList();
  setTimeout(() => cmdInput.focus(), 10);
}

function closeCmdPalette() {
  cmdOverlay.classList.remove('open');
}

if (cmdTrigger) cmdTrigger.addEventListener('click', openCmdPalette);

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCmdPalette();
  } else if (e.key === 'Escape') {
    closeCmdPalette();
  }
});

if (cmdOverlay) {
  cmdOverlay.addEventListener('click', (e) => {
    if (e.target === cmdOverlay) closeCmdPalette();
  });
}

if (cmdInput) {
  cmdInput.addEventListener('input', () => {
    const q = cmdInput.value.toLowerCase();
    cmdFiltered = cmdSections.filter(s => s.label.toLowerCase().includes(q));
    cmdSelectedIndex = 0;
    renderCmdList();
  });

  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cmdSelectedIndex = Math.min(cmdSelectedIndex + 1, cmdFiltered.length - 1);
      renderCmdList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cmdSelectedIndex = Math.max(cmdSelectedIndex - 1, 0);
      renderCmdList();
    } else if (e.key === 'Enter') {
      const target = cmdFiltered[cmdSelectedIndex];
      if (target) {
        document.querySelector(target.href)?.scrollIntoView({ behavior: 'smooth' });
        closeCmdPalette();
      }
    }
  });
}

if (cmdListEl) {
  cmdListEl.addEventListener('click', (e) => {
    const item = e.target.closest('.cmd-item');
    if (item) {
      document.querySelector(item.dataset.href)?.scrollIntoView({ behavior: 'smooth' });
      closeCmdPalette();
    }
  });
}

// ---- Live Search Demo: real TF-IDF + cosine similarity, computed client-side ----
const searchCorpus = [
  { tag: "Project", text: "Designed and fine-tuned a time-aware LLM retrieval pipeline using Contriever with temporal hard negatives and sliding-window MaxSim re-ranking for RAG evaluation, improving Hit@1 from 0.404 to 0.591." },
  { tag: "Project", text: "Benchmarked YOLOv8, CNN, and Detectron2 across 15,185 microscopic images for urinary sediment particle classification, achieving 97.4% accuracy." },
  { tag: "Project", text: "Formulated a two-stage stochastic mixed integer program for hospital operating room scheduling under uncertainty, reducing costs from 1.26 million to 668 thousand dollars using CPLEX across 7 scenarios." },
  { tag: "Project", text: "Built an end-to-end data integration pipeline joining 6 datasets with over 100000 records using SQL and PostgreSQL, with KPI dashboards in Google Looker Studio." },
  { tag: "Project", text: "Developed Smart Script Solutions, an NLP application using RoBERTa for question answering and MiniLM for semantic search and summarization, with automated speech recognition and the YouTube Data API." },
  { tag: "Experience", text: "As an ML Developer at AI Adventures LLP, evaluated LLM outputs for accuracy and failure modes, defining and tracking success metrics across the development lifecycle." },
  { tag: "Experience", text: "Provided technical support at the UW-Madison DoIT helpdesk, resolving 30 plus weekly tickets across Windows, Mac, and Linux including VPN configuration and account issues." },
  { tag: "Experience", text: "As a Data Science Intern at Oasis Infobyte, benchmarked KNN, SVR, linear regression, and decision tree models, achieving an R squared of 0.59 on sales forecasting." },
  { tag: "Experience", text: "As an ML and BI Intern at YBI Foundation, improved regression model R squared from 0.28 to 0.42 through bagging and boosting ensemble methods on a concrete strength dataset." },
  { tag: "Experience", text: "As a Machine Learning Intern at Internship Studio, implemented supervised and unsupervised learning algorithms including classification, clustering, and regression in Python." },
  { tag: "Skill", text: "Experienced with large language models, retrieval augmented generation, prompt engineering, transformers including BERT RoBERTa and T5, FAISS, Contriever, and Sentence Transformers." },
  { tag: "Skill", text: "Skilled in evaluating LLM outputs, identifying failure modes, and defining success metrics for AI systems with strong grounding in statistics and experimental design." },
  { tag: "Skill", text: "Proficient in Scikit-learn, Pandas, NumPy, regression, classification, statistical modeling, A/B testing, and model validation." },
  { tag: "Skill", text: "Comfortable with Docker, Git, Linux, shell scripting, Apache Spark, Kafka, Google BigQuery, AWS, and CI/CD pipelines." },
  { tag: "Skill", text: "Experienced with SQL, PostgreSQL, MySQL, MongoDB, Tableau, Power BI, and Google Looker Studio for data visualization and business intelligence." },
  { tag: "Education", text: "Master of Science in Data Science from the University of Wisconsin-Madison with a GPA of 3.65 out of 4.0." },
  { tag: "Education", text: "Bachelor of Engineering in Artificial Intelligence and Data Science from Savitribai Phule Pune University, graduating as a Silver Medalist with a GPA of 9.31 out of 10." },
  { tag: "Publication", text: "Published two peer-reviewed papers on Smart Script Solutions in IJRAR and IJCRT, documenting model architecture, evaluation methodology, and results." },
];

function tokenize(str) {
  return str.toLowerCase().match(/[a-z0-9]+/g) || [];
}

const searchDocs = searchCorpus.map(doc => tokenize(doc.text));
const vocabSet = new Set();
searchDocs.forEach(tokens => tokens.forEach(t => vocabSet.add(t)));
const vocab = Array.from(vocabSet);

function termFreq(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  return tf;
}

const docTFs = searchDocs.map(termFreq);

const idf = {};
vocab.forEach(term => {
  const docCount = docTFs.filter(tf => tf[term]).length;
  idf[term] = Math.log((searchDocs.length + 1) / (docCount + 1)) + 1;
});

function tfidfVector(tf) {
  const vec = {};
  Object.keys(tf).forEach(term => {
    vec[term] = tf[term] * (idf[term] || 0);
  });
  return vec;
}

const docVectors = docTFs.map(tfidfVector);

function cosineSim(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (const k in vecA) { normA += vecA[k] * vecA[k]; if (vecB[k]) dot += vecA[k] * vecB[k]; }
  for (const k in vecB) { normB += vecB[k] * vecB[k]; }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function runSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  const qTokens = tokenize(query);
  if (qTokens.length === 0) {
    resultsEl.innerHTML = '<p class="search-empty">Type a query above — try "RAG evaluation" or "optimization under uncertainty."</p>';
    return;
  }
  const qTF = termFreq(qTokens);
  const qVec = tfidfVector(qTF);

  const scored = searchCorpus.map((doc, i) => ({
    ...doc,
    score: cosineSim(qVec, docVectors[i])
  })).filter(r => r.score > 0.001)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (scored.length === 0) {
    resultsEl.innerHTML = '<p class="search-empty">No matches — try different words (this is plain TF-IDF, not a language model, so exact term overlap matters).</p>';
    return;
  }

  const maxScore = scored[0].score;
  resultsEl.innerHTML = scored.map(r => `
    <div class="search-result">
      <div class="search-result-head">
        <span class="search-result-tag">${r.tag}</span>
        <span class="search-result-score">cos sim: ${r.score.toFixed(3)}</span>
      </div>
      <p class="search-result-text">${r.text}</p>
      <div class="search-score-bar"><div class="search-score-fill" style="width:${(r.score / maxScore * 100).toFixed(0)}%"></div></div>
    </div>
  `).join('');
}

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
if (searchInput && searchBtn) {
  runSearch('');
  searchBtn.addEventListener('click', () => runSearch(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runSearch(searchInput.value);
  });
}

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
