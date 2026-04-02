/* ============================================
   Dayton Community Information District
   Interactive Report — JavaScript
   ============================================ */
(function () {
  'use strict';

  /* --- Reading Progress Bar --- */
  function initProgressBar() {
    var bar = document.querySelector('.progress-bar');
    if (!bar) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollTop = window.scrollY;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = progress + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* --- Sticky Side Navigation --- */
  function initSideNav() {
    var navLinks = document.querySelectorAll('.side-nav a[href^="#"]');
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ el: section, link: link });
    });

    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var match = sections.find(function (s) { return s.el === entry.target; });
          if (match) match.link.classList.add('active');

          // Also update mobile nav
          var mobileLinks = document.querySelectorAll('.mobile-nav a[href^="#"]');
          mobileLinks.forEach(function (l) { l.classList.remove('active'); });
          var mobileMatch = document.querySelector('.mobile-nav a[href="#' + entry.target.id + '"]');
          if (mobileMatch) mobileMatch.classList.add('active');
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { observer.observe(s.el); });
  }

  /* --- Mobile Nav Toggle --- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      toggle.textContent = mobileNav.classList.contains('open') ? '\u2715' : '\u2630';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.textContent = '\u2630';
      });
    });
  }

  /* --- Scroll Reveal --- */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* --- Back to Top + Nav Toggle Visibility --- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    var navToggle = document.querySelector('.nav-toggle');

    var btTicking = false;
    window.addEventListener('scroll', function () {
      if (!btTicking) {
        requestAnimationFrame(function () {
          var past = window.scrollY > window.innerHeight;
          if (btn) btn.classList.toggle('visible', past);
          if (navToggle) navToggle.classList.toggle('visible', past);
          btTicking = false;
        });
        btTicking = true;
      }
    }, { passive: true });

    if (btn) {
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* --- Acts of Journalism Wheel --- */
  function initActsWheel() {
    var wheel = document.getElementById('acts-wheel');
    if (!wheel) return;

    var acts = {
      facilitating: {
        title: 'Facilitating',
        text: 'Creating the conditions for community conversation. Convening forums, hosting public meetings, moderating dialogue, building spaces where residents can engage with each other and with information.',
        source: 'J+D Lab Framework'
      },
      documenting: {
        title: 'Documenting',
        text: 'Recording what happens. Attending public meetings, taking notes, capturing testimony, creating the raw record of civic life that everything else builds on. The Documenters Network is the most proven model for this function.',
        source: 'J+D Lab Framework'
      },
      commenting: {
        title: 'Commenting',
        text: 'Interpreting what the facts mean. Offering analysis, opinion, and perspective that helps a community make sense of what it knows. The Community Voice Network serves this function directly.',
        source: 'J+D Lab Framework'
      },
      inquiring: {
        title: 'Inquiring',
        text: 'Asking questions. Filing records requests, investigating leads, following patterns, demanding answers. The accountability journalism function at its core.',
        source: 'J+D Lab Framework'
      },
      sensemaking: {
        title: 'Sensemaking',
        text: 'Connecting the dots. Placing events in context, identifying patterns, explaining how things relate to each other. Independent policy analysis is a sensemaking function.',
        source: 'J+D Lab Framework'
      },
      amplifying: {
        title: 'Amplifying',
        text: 'Extending the reach of important information. Sharing, republishing, redistributing — ensuring that what matters reaches the people who need it, especially those outside traditional media audiences.',
        source: 'J+D Lab Framework'
      },
      navigating: {
        title: 'Navigating',
        text: 'Helping people find what they need. Curating resources, building directories, creating wayfinding tools that connect residents to services, information, and each other. The Civic Map and Calendar serve this function.',
        source: 'J+D Lab Framework'
      },
      enabling: {
        title: 'Enabling',
        text: 'Building the capacity of others to perform these acts themselves. Training, mentoring, providing tools and platforms. The Journalism Lab\u2019s core function.',
        source: 'J+D Lab Framework'
      },
      preserving: {
        title: 'Preserving',
        text: 'Ensuring that what a community knows about itself is durable, searchable, and publicly owned \u2014 not locked behind a paywall or lost when a newspaper folds or a platform changes its terms of service. This includes capturing and elevating lived experience, particularly from community elders and others whose testimony might otherwise go unrecorded.',
        source: 'Dayton Addition'
      }
    };

    wheel.addEventListener('click', function (e) {
      var node = e.target.closest('.act-node');
      if (!node) return;

      var act = node.getAttribute('data-act');
      var info = acts[act];
      if (!info) return;

      // Update active state
      wheel.querySelectorAll('.act-node').forEach(function (n) {
        n.classList.remove('active');
      });
      node.classList.add('active');

      // Update description
      document.getElementById('acts-desc-title').textContent = info.title;
      document.getElementById('acts-desc-text').textContent = info.text;
      var sourceEl = document.getElementById('acts-desc-source');
      sourceEl.textContent = info.source;
      sourceEl.className = 'acts-description-source' + (info.source === 'Dayton Addition' ? ' dayton' : '');
    });
  }

  /* --- Conversational Budget Demo --- */
  function initChatDemo() {
    var container = document.getElementById('chat-demo');
    if (!container) return;

    var messagesEl = container.querySelector('.chat-messages');
    var inputEl = container.querySelector('.chat-input');
    var sendBtn = container.querySelector('.chat-send');
    var suggestionsEl = container.querySelector('.chat-suggestions');

    var qa = [
      {
        q: 'How much does Dayton spend on police?',
        a: 'The Dayton Police Department\u2019s 2026 budget is <strong>$71.1 million</strong>, making it the single largest department expenditure in the general fund. Combined with fire, police and fire account for roughly <strong>60% of the general fund</strong>. The 2026 budget also reduced the police recruit class from 22 to 17 positions. <span class="chat-citation">2026 Recommended Budget; DDN 11/2025</span>',
        keywords: ['police', 'safety', 'law enforcement', 'cop', 'crime']
      },
      {
        q: 'What is the total city budget?',
        a: 'The City of Dayton\u2019s total 2026 budget across all funds is approximately <strong>$1.03 billion</strong>. The total operating budget is <strong>$518.9 million</strong> (up 3.9% from 2025). The general fund \u2014 which pays for core services like police, fire, and public works \u2014 is <strong>$273.7 million</strong>. However, the city faces a structural gap: general fund revenue is approximately <strong>$229 million</strong>, with the difference filled by <strong>$14.8 million in one-time sources</strong> and <strong>$4 million from cash reserves</strong>. <span class="chat-citation">2026 Recommended Budget; City Manager Presentation 10/2025</span>',
        keywords: ['total', 'overall', 'whole', 'entire', 'all funds', 'general fund', 'how big']
      },
      {
        q: 'How much goes to fire and rescue?',
        a: 'The Dayton Fire Department\u2019s 2026 budget is <strong>$53.7 million</strong>, the second-largest general fund expenditure after police. The department operates <strong>12 fire stations</strong> with <strong>326 members</strong> and responds to over <strong>43,000 emergency calls per year</strong>. The 2026 recruit class was reduced from 20 to 18 positions as part of budget balancing. <span class="chat-citation">2026 Recommended Budget; DDN 11/2025</span>',
        keywords: ['fire', 'rescue', 'ems', 'emergency']
      },
      {
        q: 'How much does the city spend on sidewalk repair?',
        a: 'Specific sidewalk repair funding falls under Public Works and the Capital Improvement Program. While the exact departmental breakdown for Public Works wasn\u2019t itemized in the public budget summary, the <strong>Building &amp; Environmental Safety community service area</strong> saw the largest dollar increase in 2026 \u2014 up <strong>$7.1 million (4.8%)</strong>. Sidewalk and infrastructure complaints remain among the most common resident concerns, particularly in west-side neighborhoods. The full capital improvement plan in the budget document details specific street and sidewalk allocations. <span class="chat-citation">2026 Recommended Budget; CSA Summary</span>',
        keywords: ['sidewalk', 'curb', 'street', 'road', 'paving', 'public works', 'infrastructure']
      },
      {
        q: 'What are the main sources of city revenue?',
        a: 'Dayton\u2019s general fund revenue (~$229M in 2026) comes primarily from: <strong>Taxes: 72%</strong> (mostly the 2.5% income/earnings tax), <strong>Charges for Services: 16%</strong>, <strong>Intergovernmental: 7%</strong> (state shared revenue), and <strong>Fines &amp; Forfeitures: 2%</strong>. The income tax rate is <strong>2.5%</strong> (2.25% base + 0.25% voter-approved levy). The 0.25% levy alone generates roughly <strong>$15.6\u2013$15.8 million per year</strong>. Revenue is declining about 0.5% year-over-year while spending is increasing, creating a structural imbalance. <span class="chat-citation">2026 Recommended Budget, Revenue Summary</span>',
        keywords: ['revenue', 'income', 'tax', 'fund', 'money', 'pay for', 'where does', 'earning']
      },
      {
        q: 'How much does the city spend on parks?',
        a: 'Youth programs including Preschool Promise and recreation received <strong>$12.1 million</strong> in the 2026 budget. Note that Five Rivers MetroParks \u2014 which operates the region\u2019s larger parks, trails, and conservation areas \u2014 is a <strong>separate entity funded by its own levy</strong>, not the city budget. City-operated recreation centers and youth programming fall under the city budget. <span class="chat-citation">2026 Recommended Budget; Key Investments</span>',
        keywords: ['park', 'recreation', 'youth', 'playground', 'preschool']
      },
      {
        q: 'How much does a homeowner pay in property taxes?',
        a: 'The median effective property tax rate in Dayton is <strong>2.62%</strong>, though it varies by location from 2.26% to 3.27% depending on school district and applicable levies. Properties are assessed at 35% of fair market value (Ohio standard). For a home with a market value of <strong>$100,000</strong>, the assessed value is $35,000, and annual property taxes range from roughly <strong>$2,600 to $3,300</strong>. The city\u2019s portion is one piece; the rest goes to schools, county, library, and other levies. <span class="chat-citation">Montgomery County Auditor; Tax Year 2025 rates</span>',
        keywords: ['property tax', 'homeowner', 'mill', 'levy', 'house', 'how much']
      },
      {
        q: 'What is the city spending on housing?',
        a: 'The 2026 budget allocates <strong>$18 million for housing initiatives</strong>, <strong>$10.1 million for demolition and blight removal</strong>, and <strong>$1.9 million for vacant property reuse</strong>. The Economic &amp; Community Development service area saw the second-largest budget increase \u2014 up <strong>$3.9 million</strong> \u2014 driven in part by a new Lead Hazard Reduction Grant that increased the Community Development budget by 235%. The city also allocates <strong>$3.6 million for homelessness prevention</strong>. <span class="chat-citation">2026 Recommended Budget; Key Investments &amp; CSA Summary</span>',
        keywords: ['housing', 'neighborhood', 'blight', 'demolition', 'development', 'cdbg', 'home', 'homeless', 'lead']
      },
      {
        q: 'Why does the building on Third Street get a tax break?',
        a: 'Several properties on Third Street are within active <strong>Tax Increment Financing (TIF) districts</strong> or receive <strong>Community Reinvestment Area (CRA) tax abatements</strong>. A TIF diverts the growth in property tax revenue from a specific area to fund infrastructure improvements within that area, rather than going to the general fund. A CRA abatement reduces property taxes on new construction or renovation to incentivize investment. For example, the Fire Blocks district received a 15-year, 100% CRA abatement on improvements. Whether these incentives deliver net benefits to the community is exactly the kind of question independent policy analysis should evaluate. <span class="chat-citation">City of Dayton CRA/TIF records</span>',
        keywords: ['tax break', 'abatement', 'tif', 'incentive', 'cra', 'third street', 'development']
      },
      {
        q: 'How much water and sewer do residents pay?',
        a: 'As of 2025, the average Dayton residential quarterly bill is approximately <strong>$133 for water</strong> and <strong>$108 for sewer</strong>, plus stormwater charges \u2014 roughly <strong>$260 per quarter combined</strong> (~$1,040/year). Rates are increasing: <strong>water up 8.5%</strong>, <strong>sewer up 9.5%</strong>, and <strong>stormwater up 2.5%</strong> in 2026, adding about <strong>$24 per quarter</strong>. Since 2018, water rates have risen 50% and sewer rates 53%. <span class="chat-citation">City of Dayton Water &amp; Sewer Rates; DDN 2025</span>',
        keywords: ['water', 'sewer', 'utility', 'bill', 'stormwater', 'rate']
      }
    ];

    function findAnswer(query) {
      var q = query.toLowerCase();
      var best = null;
      var bestScore = 0;

      qa.forEach(function (item) {
        var score = 0;
        item.keywords.forEach(function (kw) {
          if (q.indexOf(kw) !== -1) score++;
        });
        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      });

      if (best && bestScore > 0) return best.a;

      return 'I don\u2019t have pre-loaded data for that specific question, but in a full implementation, I would search the complete city budget document and return a sourced, cited answer. Try asking about police spending, the total budget, sidewalks, parks, property taxes, housing, or revenue sources.';
    }

    function addMessage(text, isUser) {
      var msg = document.createElement('div');
      msg.className = 'chat-message chat-message--' + (isUser ? 'user' : 'ai');

      var avatar = document.createElement('div');
      avatar.className = 'chat-avatar chat-avatar--' + (isUser ? 'user' : 'ai');
      avatar.textContent = isUser ? 'You' : 'AI';

      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      if (isUser) {
        bubble.textContent = text;
      } else {
        bubble.innerHTML = text;
      }

      msg.appendChild(avatar);
      msg.appendChild(bubble);
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
      var msg = document.createElement('div');
      msg.className = 'chat-message chat-message--ai';
      msg.id = 'chat-typing';

      var avatar = document.createElement('div');
      avatar.className = 'chat-avatar chat-avatar--ai';
      avatar.textContent = 'AI';

      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-typing';
      bubble.innerHTML = '<span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span>';

      msg.appendChild(avatar);
      msg.appendChild(bubble);
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeTyping() {
      var el = document.getElementById('chat-typing');
      if (el) el.remove();
    }

    function handleQuery(query) {
      if (!query.trim()) return;
      addMessage(query, true);
      inputEl.value = '';

      // Hide suggestions after first use
      if (suggestionsEl) suggestionsEl.style.display = 'none';

      showTyping();

      // Simulate AI response delay
      var delay = 800 + Math.random() * 1200;
      setTimeout(function () {
        removeTyping();
        addMessage(findAnswer(query), false);
      }, delay);
    }

    sendBtn.addEventListener('click', function () {
      handleQuery(inputEl.value);
    });

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleQuery(inputEl.value);
      }
    });

    // Suggestion chips
    if (suggestionsEl) {
      suggestionsEl.addEventListener('click', function (e) {
        var chip = e.target.closest('.chat-suggestion');
        if (chip) handleQuery(chip.textContent);
      });
    }
  }

  /* --- Interactive Civic Map --- */
  function initCivicMap() {
    var cells = document.querySelectorAll('.map-cell');
    var detail = document.querySelector('.map-detail');
    if (!cells.length || !detail) return;

    var data = {
      'Five Oaks': { title: '1247 Grand Ave \u2014 Property Transfer', text: 'LLC purchase, $62,000. Buyer: Gem City Holdings LLC. Third acquisition on this block in 14 months.' },
      'Downtown': { title: '34 N. Main St \u2014 Building Permit', text: 'Commercial renovation, $450,000. Applicant: Third Street Partners. Mixed-use conversion from office to residential.' },
      'McPherson': { title: '819 McPherson Ave \u2014 Code Violation', text: 'Exterior maintenance violation issued 2/14/2026. Unresponsive owner. Property last transferred to KMG Realty LLC in 2023.' },
      'Wolf Creek': { title: '2205 Wolf Creek Pike \u2014 Property Transfer', text: 'Cash sale, $38,500. Buyer: Midwest Rental Properties LLC. Second purchase on this street in 6 months.' },
      'St. Anne\u2019s Hill': { title: '512 Linden Ave \u2014 Building Permit', text: 'Residential addition, $28,000. Owner-occupied. Historic district review required.' },
      'Edgemont': { title: '1401 W. Third St \u2014 Property Transfer', text: 'Sale, $45,000. Buyer: individual. Previously bank-owned (REO) since 2021.' },
      'Twin Towers': { title: '29 Bonner St \u2014 Code Violation', text: 'Vacant property registration lapsed. Owner: South Dayton Properties LLC. 3 violations in 18 months.' }
    };

    cells.forEach(function (cell) {
      cell.addEventListener('click', function () {
        cells.forEach(function (c) { c.classList.remove('active'); });
        cell.classList.add('active');
        var label = cell.querySelector('.map-cell-label');
        var name = label ? label.textContent.trim() : '';
        var info = data[name];
        if (info) {
          detail.innerHTML = '<div class="map-detail-title">' + info.title + '</div>' + info.text;
        } else {
          detail.innerHTML = '<div class="map-detail-title">' + name + '</div>No data points in current dataset. A full implementation would show all public records for this area.';
        }
      });
    });
  }

  /* --- Tier Badge Auto-Replacement --- */
  function initTierBadges() {
    // Walk text nodes in the report content and wrap "Tier 1" / "Tier 2" in badge spans
    var container = document.querySelector('.report-content');
    if (!container) return;

    // Only scan p, li, and td elements to reduce DOM traversal
    var candidates = container.querySelectorAll('p, li, td, .influence-card-text, .collapsible-body p');
    var nodes = [];
    candidates.forEach(function (el) {
      if (el.closest('.chat-demo') || el.closest('.tier-intro') || el.closest('.tier-badge')) return;
      if (!/Tier [12]/.test(el.textContent)) return;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          var parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.classList.contains('tier-badge') || parent.classList.contains('tier-intro-label')) return NodeFilter.FILTER_REJECT;
          if (/Tier [12]/.test(node.textContent)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_REJECT;
        }
      });
      while (walker.nextNode()) nodes.push(walker.currentNode);
    });

    nodes.forEach(function (textNode) {
      var html = textNode.textContent
        .replace(/Tier 2/g, '<span class="tier-badge tier-badge--2">Tier 2</span>')
        .replace(/Tier 1/g, '<span class="tier-badge tier-badge--1">Tier 1</span>');
      var span = document.createElement('span');
      span.innerHTML = html;
      textNode.parentNode.replaceChild(span, textNode);
    });
  }

  /* --- Initialize --- */
  document.addEventListener('DOMContentLoaded', function () {
    initProgressBar();
    initSideNav();
    initMobileNav();
    initScrollReveal();
    initBackToTop();
    initSmoothScroll();
    initActsWheel();
    initChatDemo();
    initCivicMap();
    initTierBadges();
  });
})();
