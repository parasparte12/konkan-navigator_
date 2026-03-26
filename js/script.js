/* ============================================
   KONKAN NAVIGATOR - GLOBAL JAVASCRIPT
   ============================================ */

/* ---- NAVBAR ---- */
(function initNavbar() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const navbar = document.querySelector('.navbar');

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Navbar scroll shadow
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 20
        ? '0 4px 24px rgba(0,0,0,0.12)'
        : '0 2px 20px rgba(0,0,0,0.08)';
    });
  }
})();


/* ---- TOAST NOTIFICATIONS ---- */
const Toast = (() => {
  function createContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  function show(message, type = 'info', duration = 3500) {
    const container = createContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Close">✕</button>
    `;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));
    setTimeout(() => dismiss(toast), duration);
    return toast;
  }

  function dismiss(toast) {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 350);
  }

  return { show, success: m => show(m, 'success'), error: m => show(m, 'error'), info: m => show(m, 'info'), warning: m => show(m, 'warning') };
})();

window.Toast = Toast;


/* ---- RIPPLE EFFECT ---- */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn, .ripple');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const wave = document.createElement('span');
  wave.className = 'ripple-wave';
  wave.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
  `;
  btn.appendChild(wave);
  setTimeout(() => wave.remove(), 700);
});


/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ---- INTERSECTION OBSERVER (Reveal on scroll) ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ---- CATEGORY FILTER (Explore & Home) ---- */
function initCategoryFilter() {
  const tags = document.querySelectorAll('.cat-tag[data-cat]');
  if (!tags.length) return;

  tags.forEach(tag => {
    tag.addEventListener('click', function() {
      tags.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      filterDestinations(cat);
    });
  });

  // Dropdown filter if present
  const catSelect = document.getElementById('cat-select');
  if (catSelect) {
    catSelect.addEventListener('change', function() {
      filterDestinations(this.value);
      tags.forEach(t => t.classList.remove('active'));
      const matched = [...tags].find(t => t.dataset.cat === this.value);
      if (matched) matched.classList.add('active');
    });
  }
}

function filterDestinations(cat) {
  const cards = document.querySelectorAll('.dest-card[data-cat]');
  cards.forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    if (match) {
      card.style.display = '';
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => { card.style.display = 'none'; }, 300);
    }
  });
}


/* ---- GUIDE FILTERING ---- */
function initGuideFilters() {
  const ratingFilter = document.getElementById('filter-rating');
  const langFilter   = document.getElementById('filter-lang');
  const priceFilter  = document.getElementById('filter-price');
  const priceLabel   = document.getElementById('price-label');

  if (!ratingFilter && !langFilter && !priceFilter) return;

  function applyFilters() {
    const minRating = ratingFilter ? parseFloat(ratingFilter.value) : 0;
    const lang      = langFilter   ? langFilter.value   : 'all';
    const maxPrice  = priceFilter  ? parseFloat(priceFilter.value) : 9999;

    if (priceLabel) priceLabel.textContent = `₹${maxPrice}/hr`;

    document.querySelectorAll('.guide-card').forEach(card => {
      const cardRating = parseFloat(card.dataset.rating || 0);
      const cardLangs  = (card.dataset.lang || '').split(',');
      const cardPrice  = parseFloat(card.dataset.price || 0);
      const matchRating = cardRating >= minRating;
      const matchLang   = lang === 'all' || cardLangs.includes(lang);
      const matchPrice  = cardPrice <= maxPrice;

      card.style.display = (matchRating && matchLang && matchPrice) ? '' : 'none';
    });
  }

  [ratingFilter, langFilter, priceFilter].forEach(el => {
    if (el) el.addEventListener('change', applyFilters);
    if (el && el.type === 'range') el.addEventListener('input', applyFilters);
  });
}


/* ---- LOAD MORE GUIDES ---- */
function initLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;

  const hidden = document.querySelectorAll('.guide-card.hidden-guide');
  btn.addEventListener('click', function() {
    let shown = 0;
    hidden.forEach(card => {
      if (card.classList.contains('hidden-guide') && shown < 3) {
        card.classList.remove('hidden-guide');
        card.style.animation = 'fadeInUp 0.5s ease';
        shown++;
      }
    });
    const remaining = document.querySelectorAll('.guide-card.hidden-guide');
    if (remaining.length === 0) {
      this.style.display = 'none';
    }
  });
}


/* ---- TRIP PLANNER ---- */
function initTripPlanner() {
  const form = document.getElementById('trip-form');
  if (!form) return;

  const itineraryData = {
    beach: [
      { activity: '🏖️ Beach Sunrise Yoga', desc: 'Start your morning with tranquil sunrise yoga on the golden sands.' },
      { activity: '🤿 Snorkeling Adventure', desc: 'Explore the vibrant coral reefs and marine life of Tarkarli.' },
      { activity: '🚢 Boat Cruise', desc: 'Evening dolphin-watching cruise along the Konkan coastline.' },
      { activity: '🐚 Shell Art Workshop', desc: 'Local artisan session creating beautiful shell souvenirs.' },
      { activity: '🌊 Water Sports', desc: 'Thrilling banana boat rides, jet skiing, and parasailing.' }
    ],
    heritage: [
      { activity: '🏯 Fort Exploration', desc: 'Guided walk through Sindhudurg or Vijaydurg sea fort.' },
      { activity: '⛪ Temple Circuit', desc: 'Visit ancient Ganpatipule temple and nearby sacred shrines.' },
      { activity: '🏺 Museum Visit', desc: 'Explore the regional heritage museum in Ratnagiri.' },
      { activity: '🎭 Koli Culture Show', desc: 'Traditional Koli dance performance and folk music evening.' },
      { activity: '📸 Heritage Photography Walk', desc: 'Guided photography through old Konkan architecture.' }
    ],
    food: [
      { activity: '🦞 Malvani Thali Experience', desc: 'Authentic 15-dish Malvani feast at a local family restaurant.' },
      { activity: '🐠 Fish Market Tour', desc: 'Early morning fresh catch market tour with local fishermen.' },
      { activity: '🥥 Kokum Farm Visit', desc: 'Visit organic kokum and cashew farms, taste fresh products.' },
      { activity: '🍱 Cooking Class', desc: 'Learn to prepare Malvani curry, sol kadhi, and rice bhakri.' },
      { activity: '🌴 Toddy Tasting', desc: 'Authentic local toddy tasting at a traditional Konkan tavern.' }
    ],
    adventure: [
      { activity: '🧗 Rock Climbing', desc: 'Guided rock climbing on the Western Ghats foothills.' },
      { activity: '🏕️ Camping & Bonfire', desc: 'Overnight camping with stargazing and bonfire stories.' },
      { activity: '🚵 Cycling Trail', desc: 'Coastal cycling trail through coconut groves and villages.' },
      { activity: '🛶 Kayaking', desc: 'Kayaking through scenic backwaters and mangrove creeks.' },
      { activity: '🌲 Trek to Waterfall', desc: 'Guided trek to a hidden jungle waterfall.' }
    ],
    nature: [
      { activity: '🦋 Butterfly Valley Trek', desc: 'Morning trek through butterfly-rich forest trails.' },
      { activity: '🐦 Bird Watching', desc: 'Sunrise bird watching session with binoculars provided.' },
      { activity: '🌿 Spice Garden Tour', desc: 'Walk through aromatic spice and medicinal herb gardens.' },
      { activity: '🌅 Sunset Point', desc: 'Golden hour photography at a cliff-top sunset point.' },
      { activity: '🦜 Night Safari', desc: 'Guided wildlife night walk to spot nocturnal creatures.' }
    ]
  };

  const destinations = {
    beach: ['Tarkarli', 'Murud', 'Velneshwar', 'Ganapatipule Beach', 'Tamas Beach'],
    heritage: ['Sindhudurg Fort', 'Ganpatipule Temple', 'Vijaydurg', 'Ratnagiri Museum', 'Bhagwati Fort'],
    food: ['Malvan Bazaar', 'Chivla Beach Shacks', 'Vijaydurg Village', 'Devbag Fish Market'],
    adventure: ['Amboli Ghats', 'Kunkeshwar Cliffs', 'Devgad Backwaters', 'Phonda Ghat'],
    nature: ['Amboli', 'Koyna Backwaters', 'Radhanagari', 'Dajipur Forest', 'Amba Valley']
  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const budget    = document.getElementById('budget').value;
    const days      = parseInt(document.getElementById('days').value);
    const interests = [...document.querySelectorAll('input[name="interest"]:checked')].map(c => c.value);

    if (!budget) { Toast.error('Please enter your budget!'); return; }
    if (!days)   { Toast.error('Please select number of days!'); return; }
    if (!interests.length) { Toast.warning('Select at least one interest!'); return; }

    generateItinerary(budget, days, interests);
  });

  function generateItinerary(budget, days, interests) {
    const container = document.getElementById('itinerary-result');
    if (!container) return;

    // Mix activities from selected interests
    let allActivities = [];
    let allDests = [];
    interests.forEach(int => {
      if (itineraryData[int]) allActivities.push(...itineraryData[int]);
      if (destinations[int])  allDests.push(...destinations[int]);
    });

    // Shuffle
    allActivities = allActivities.sort(() => Math.random() - 0.5);
    allDests = [...new Set(allDests)].sort(() => Math.random() - 0.5);

    const budgetPerDay = Math.round(parseInt(budget) / days);
    let html = `
      <div class="itinerary-card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:28px;">
          <div>
            <h3 style="color:var(--heading);margin-bottom:4px;">🗺️ Your Custom Konkan Itinerary</h3>
            <p style="font-size:14px;color:var(--text);">
              ${days} Days • Budget ₹${parseInt(budget).toLocaleString()} • 
              <span style="color:var(--accent);font-weight:600;">${interests.map(i => i.charAt(0).toUpperCase()+i.slice(1)).join(', ')}</span>
            </p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:13px;color:var(--text);">Daily Budget</span><br>
            <span style="font-size:1.4rem;font-weight:800;color:var(--accent);">₹${budgetPerDay.toLocaleString()}</span>
          </div>
        </div>
    `;

    let actIdx = 0;
    let destIdx = 0;
    for (let d = 1; d <= days; d++) {
      const activitiesPerDay = Math.min(3, allActivities.length - actIdx);
      const dayActivities = allActivities.slice(actIdx, actIdx + activitiesPerDay);
      const dayDest = allDests[destIdx] || 'Konkan Region';
      actIdx += activitiesPerDay;
      destIdx++;

      html += `
        <div class="itinerary-day">
          <div class="day-num">D${d}</div>
          <div class="day-content">
            <h4>Day ${d} — ${dayDest}</h4>
            <p style="color:var(--text);font-size:14px;">📍 Explore ${dayDest} with curated local experiences</p>
            <div class="day-activities">
              ${dayActivities.map(a => `
                <div style="width:100%;margin-bottom:10px;">
                  <strong style="font-size:14px;">${a.activity}</strong>
                  <p style="font-size:13px;color:var(--text);margin-top:2px;">${a.desc}</p>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:10px;padding:10px 14px;background:rgba(26,107,107,0.06);border-radius:8px;font-size:13px;">
              💰 Est. Cost: ₹${Math.round(budgetPerDay * (0.8 + Math.random()*0.4)).toLocaleString()}
            </div>
          </div>
        </div>
      `;
    }

    html += `
        <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
          <p style="font-size:14px;color:var(--text);margin-bottom:16px;">
            🌟 This itinerary was customized just for you! Book a local guide to make it unforgettable.
          </p>
          <a href="guides.html" class="btn btn-primary">Find a Guide →</a>
        </div>
      </div>
    `;

    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    Toast.success('Your itinerary is ready! 🗺️');
  }
}


/* ---- FORM VALIDATION ---- */
function validateForm(formEl) {
  let valid = true;
  formEl.querySelectorAll('[required]').forEach(field => {
    const parent = field.closest('.form-group') || field.parentElement;
    const errEl = parent.querySelector('.err-msg');
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#ef4444';
      if (errEl) errEl.style.display = 'block';
    } else {
      field.style.borderColor = '';
      if (errEl) errEl.style.display = 'none';
    }
  });

  // Email validation
  formEl.querySelectorAll('input[type="email"]').forEach(field => {
    if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      valid = false;
      field.style.borderColor = '#ef4444';
      Toast.error('Please enter a valid email address.');
    }
  });

  return valid;
}


/* ---- SIGN IN ---- */
function initSignIn() {
  const form = document.getElementById('signin-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm(this)) { Toast.error('Please fill in all required fields.'); return; }

    const btn = this.querySelector('[type="submit"]');
    btn.innerHTML = '<span>Signing In…</span>';
    btn.disabled = true;

    setTimeout(() => {
      Toast.success('Welcome to Konkan Navigator! 🌊');
      setTimeout(() => window.location.href = 'index.html', 1200);
    }, 1500);
  });

  // Toggle password visibility
  const togglePwd = document.getElementById('toggle-pwd');
  const pwdInput  = document.getElementById('password');
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
      togglePwd.textContent = pwdInput.type === 'password' ? '👁️' : '🙈';
    });
  }
}


/* ---- CONTACT FORM ---- */
function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm(this)) { Toast.error('Please fill all required fields.'); return; }

    const btn = this.querySelector('[type="submit"]');
    btn.innerHTML = '✉️ Sending…';
    btn.disabled = true;

    setTimeout(() => {
      Toast.success('Message sent! We\'ll get back to you soon. 💌');
      form.reset();
      btn.innerHTML = '✅ Sent!';
      setTimeout(() => { btn.innerHTML = 'Send Message →'; btn.disabled = false; }, 3000);
    }, 1500);
  });
}


/* ---- BECOME A GUIDE FORM ---- */
function initBecomeGuide() {
  const form = document.getElementById('guide-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm(this)) { Toast.error('Please fill all required fields.'); return; }

    const btn = this.querySelector('[type="submit"]');
    btn.innerHTML = 'Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      const result = document.getElementById('guide-form-result');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <div style="text-align:center;padding:40px 20px;animation:fadeInUp 0.5s ease;">
            <div style="font-size:4rem;margin-bottom:16px;">🎉</div>
            <h3 style="color:var(--heading);margin-bottom:8px;">Application Submitted!</h3>
            <p style="color:var(--text);">We'll review your application and get back to you within 3–5 business days.</p>
          </div>
        `;
        form.style.display = 'none';
      }
      Toast.success('Application submitted successfully!');
    }, 1800);
  });
}


/* ---- FEEDBACK ---- */
function initFeedback() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  // Star rating
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const value = parseInt(this.dataset.value);
      const group = this.closest('.star-group');
      if (!group) return;
      group.querySelectorAll('.star-btn').forEach((s, i) => {
        s.classList.toggle('selected', i < value);
        s.textContent = i < value ? '⭐' : '☆';
      });
      group.querySelector('input[type="hidden"]').value = value;
    });
  });

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const panel = document.getElementById('tab-' + this.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const q1  = document.querySelector('input[name="q1"]:checked');
    const q4  = document.querySelector('input[name="q4-hidden"]')?.value;
    const q5  = document.getElementById('q5')?.value;
    const q2s = [...document.querySelectorAll('input[name="q2"]:checked')].map(c => c.value);

    if (!q1) { Toast.warning('Please answer Question 1!'); return; }

    const summary = {
      q1: q1.value,
      q2: q2s,
      q3: document.getElementById('q3')?.value || '',
      q4: q4 || '0',
      q5: q5 || ''
    };

    renderFeedbackSummary(summary);
    Toast.success('Thank you for your feedback! 🙏');
    document.getElementById('feedback-result')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function renderFeedbackSummary(data) {
  const result = document.getElementById('feedback-result');
  if (!result) return;

  result.style.display = 'block';

  // Summary tab
  const summaryHtml = `
    <div class="progress-bar-wrap">
      <div class="label"><span>Would Recommend</span><span>${data.q1 === 'yes' ? '100%' : data.q1 === 'maybe' ? '50%' : '0%'}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${data.q1 === 'yes' ? 100 : data.q1 === 'maybe' ? 50 : 0}%"></div></div>
    </div>
    <div class="progress-bar-wrap">
      <div class="label"><span>Overall Rating</span><span>${data.q4}/5</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${(parseInt(data.q4)/5)*100}%"></div></div>
    </div>
    <div class="progress-bar-wrap">
      <div class="label"><span>Features Used</span><span>${data.q2.length} selected</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, data.q2.length * 20)}%"></div></div>
    </div>
  `;
  const sumEl = document.getElementById('tab-summary');
  if (sumEl) sumEl.innerHTML = summaryHtml;

  // List tab
  const listEl = document.getElementById('tab-list');
  if (listEl) {
    listEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="padding:16px;background:rgba(26,107,107,0.06);border-radius:10px;">
          <strong>Would recommend Konkan Navigator?</strong><br>
          <span style="color:var(--accent);font-weight:600;text-transform:capitalize;">${data.q1}</span>
        </div>
        <div style="padding:16px;background:rgba(26,107,107,0.06);border-radius:10px;">
          <strong>Features used:</strong><br>
          <span style="color:var(--text);">${data.q2.length ? data.q2.join(', ') : 'None selected'}</span>
        </div>
        <div style="padding:16px;background:rgba(26,107,107,0.06);border-radius:10px;">
          <strong>Most enjoyed:</strong><br>
          <span style="color:var(--text);">${data.q3 || 'No response'}</span>
        </div>
        <div style="padding:16px;background:rgba(26,107,107,0.06);border-radius:10px;">
          <strong>Overall Rating:</strong>
          <span style="color:var(--star);font-size:1.2rem;">
            ${'⭐'.repeat(parseInt(data.q4))}${'☆'.repeat(5-parseInt(data.q4))}
          </span>
          <span style="color:var(--accent);font-weight:700;">${data.q4}/5</span>
        </div>
        <div style="padding:16px;background:rgba(26,107,107,0.06);border-radius:10px;">
          <strong>Suggestions:</strong><br>
          <span style="color:var(--text);">${data.q5 || 'No suggestions provided'}</span>
        </div>
      </div>
    `;
  }

  // Individual tab
  const indEl = document.getElementById('tab-individual');
  if (indEl) {
    indEl.innerHTML = `
      <div style="background:white;border-radius:12px;padding:24px;box-shadow:var(--shadow-sm);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--primary-gradient);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">👤</div>
          <div>
            <strong>Anonymous User</strong><br>
            <span style="font-size:13px;color:var(--text);">Just now</span>
          </div>
          <span style="margin-left:auto;color:var(--star);font-size:1.1rem;">${'⭐'.repeat(parseInt(data.q4))}</span>
        </div>
        <p style="color:var(--text);font-size:14px;line-height:1.7;">${data.q5 || 'Thank you for your feedback!'}</p>
        <p style="font-size:13px;color:var(--accent);margin-top:12px;">Recommendation: <strong>${data.q1.charAt(0).toUpperCase()+data.q1.slice(1)}</strong></p>
      </div>
    `;
  }
}


/* ---- HOME SEARCH ---- */
function initHomeSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (!searchBtn) return;

  searchBtn.addEventListener('click', () => {
    const query = searchInput?.value?.trim();
    const cat   = document.getElementById('search-cat')?.value || 'all';
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (cat !== 'all') params.set('cat', cat);
    window.location.href = `explore.html?${params.toString()}`;
  });

  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchBtn.click();
    });
  }
}


/* ---- COUNTER ANIMATION ---- */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const inc = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + inc, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 25);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}


/* ---- INIT ALL ---- */
document.addEventListener('DOMContentLoaded', function() {
  initCategoryFilter();
  initGuideFilters();
  initLoadMore();
  initTripPlanner();
  initSignIn();
  initContact();
  initBecomeGuide();
  initFeedback();
  initHomeSearch();
  animateCounters();

  // Re-run reveal observer for dynamically added elements
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }, 200);

  // URL params for explore page pre-filter
  if (window.location.pathname.includes('explore')) {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const q   = params.get('q');
    if (cat) {
      const tag = document.querySelector(`.cat-tag[data-cat="${cat}"]`);
      if (tag) { tag.click(); }
    }
    if (q) {
      const si = document.getElementById('search-input');
      if (si) si.value = q;
    }
  }
});
// Transport & Payment Click Toast
document.querySelectorAll('.tp-card a').forEach(btn => {
  btn.addEventListener('click', () => {
    Toast.info("Redirecting...");
  });
});
