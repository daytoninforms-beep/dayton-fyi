/* ============================================
   Dayton Informs — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  /* --- Tab Navigation --- */
  function initTabs() {
    var tabButtons = document.querySelectorAll('[role="tab"]');
    if (!tabButtons.length) return;

    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Deactivate all tabs
        tabButtons.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.style.display = 'none';
        });

        // Activate clicked tab
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.style.display = 'block';
      });
    });
  }

  /* --- Military Service Toggle --- */
  function initMilitaryToggle() {
    var radios = document.querySelectorAll('input[name="militaryService"]');
    var branchGroup = document.getElementById('military-branch-group');
    if (!radios.length || !branchGroup) return;

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        branchGroup.style.display = this.value === 'yes' ? 'block' : 'none';
      });
    });
  }

  /* --- Obituary Form Submission --- */
  function initObituaryForm() {
    var form = document.getElementById('obituary-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorEl = document.getElementById('form-error');
      var successEl = document.getElementById('form-success');
      var submitBtn = document.getElementById('submit-btn');

      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      // Gather values
      var fullName = form.fullName.value.trim();
      var dateOfDeath = form.dateOfDeath.value;
      var cityNeighborhood = form.cityNeighborhood.value.trim();
      var submitterName = form.submitterName.value.trim();
      var submitterEmail = form.submitterEmail.value.trim();
      var confirmRights = form.confirmRights.checked;

      // Validate required fields
      var errors = [];
      if (!fullName) errors.push('Full name is required.');
      if (!dateOfDeath) errors.push('Date of death is required.');
      if (!cityNeighborhood) errors.push('City or neighborhood is required.');
      if (!submitterName) errors.push('Your name is required.');
      if (!submitterEmail) errors.push('Your email is required.');
      if (submitterEmail && !isValidEmail(submitterEmail)) errors.push('Please enter a valid email address.');
      if (!confirmRights) errors.push('You must confirm you have the right to submit this obituary.');

      // Check photo size
      var photoInput = form.photo;
      if (photoInput.files.length > 0) {
        var file = photoInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
          errors.push('Photo must be under 5 MB.');
        }
      }

      if (errors.length > 0) {
        errorEl.innerHTML = '<strong>Please fix the following:</strong><ul style="margin: 0.5rem 0 0 1.25rem;">' +
          errors.map(function (err) { return '<li>' + escapeHtml(err) + '</li>'; }).join('') + '</ul>';
        errorEl.style.display = 'block';
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Build submission data
      var data = {
        fullName: fullName,
        dateOfBirth: form.dateOfBirth.value || '',
        dateOfDeath: dateOfDeath,
        cityNeighborhood: cityNeighborhood,
        survivors: form.survivors.value.trim(),
        militaryService: form.militaryService.value,
        militaryBranch: form.militaryBranch ? form.militaryBranch.value.trim() : '',
        remembrance: form.remembrance.value.trim(),
        submitterName: submitterName,
        submitterEmail: submitterEmail,
        submittedAt: new Date().toISOString()
      };

      // Disable button during submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      submitToGoogleSheet(data)
        .then(function () {
          successEl.innerHTML = '<strong>Thank you.</strong> The obituary for ' + escapeHtml(fullName) +
            ' has been submitted for review. You will receive an email confirmation once it is published (typically within 24 hours).';
          successEl.style.display = 'block';
          form.reset();
          var branchGroup = document.getElementById('military-branch-group');
          if (branchGroup) branchGroup.style.display = 'none';
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function (err) {
          errorEl.innerHTML = '<strong>Submission failed.</strong> Please try again, or email your obituary directly to <a href="mailto:submit@daytonfyi.com">submit@daytonfyi.com</a>.';
          errorEl.style.display = 'block';
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Obituary for Review';
        });
    });
  }

  /* --- Submit to Google Sheets via Apps Script Web App --- */
  // Replace this URL with your deployed Google Apps Script web app URL
  var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQ_RQR1P89jLmrcyL7uGaZTmHGOMwyDbz0mpyQHVRmG2d76W9QnHLHeMhWjmKTI_rQgA/exec';

  function submitToGoogleSheet(data) {
    if (!GOOGLE_SCRIPT_URL) {
      // If no backend configured yet, simulate success for development
      return new Promise(function (resolve) {
        setTimeout(resolve, 800);
      });
    }

    return fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /* --- Obituary Search & Browse --- */
  var obituariesData = [];

  function loadObituaries() {
    var basePath = getBasePath();
    fetch(basePath + 'data/obituaries.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        obituariesData = data;
        populateNeighborhoodFilter();
        renderObituaries(obituariesData);
      })
      .catch(function () {
        // Data not available yet — leave empty state
      });
  }

  function getBasePath() {
    // Determine the base path relative to current page
    var path = window.location.pathname;
    if (path.indexOf('/obituaries') !== -1 || path.indexOf('/meetings') !== -1 || path.indexOf('/about') !== -1) {
      return '../';
    }
    return './';
  }

  function populateNeighborhoodFilter() {
    var select = document.getElementById('filter-neighborhood');
    if (!select || !obituariesData.length) return;

    var neighborhoods = [];
    obituariesData.forEach(function (obit) {
      if (obit.cityNeighborhood && neighborhoods.indexOf(obit.cityNeighborhood) === -1) {
        neighborhoods.push(obit.cityNeighborhood);
      }
    });

    neighborhoods.sort();
    neighborhoods.forEach(function (n) {
      var option = document.createElement('option');
      option.value = n;
      option.textContent = n;
      select.appendChild(option);
    });
  }

  function renderObituaries(list) {
    var container = document.getElementById('search-results');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><p>Obituaries will appear here once the first submissions are published.</p></div>';
      return;
    }

    var html = '';
    list.forEach(function (obit) {
      var dates = '';
      if (obit.dateOfBirth && obit.dateOfDeath) {
        dates = formatDate(obit.dateOfBirth) + ' — ' + formatDate(obit.dateOfDeath);
      } else if (obit.dateOfDeath) {
        dates = 'd. ' + formatDate(obit.dateOfDeath);
      }

      html += '<article class="card obituary-card">' +
        '<h3><a href="view.html?id=' + encodeURIComponent(obit.id) + '">' + escapeHtml(obit.fullName) + '</a></h3>' +
        '<p class="dates">' + escapeHtml(dates) + '</p>' +
        '<p class="meta">' + escapeHtml(obit.cityNeighborhood) + '</p>' +
        (obit.remembrance ? '<p>' + escapeHtml(truncate(obit.remembrance, 200)) + '</p>' : '') +
        '</article>';
    });

    container.innerHTML = html;
  }

  function filterObituaries() {
    var searchInput = document.getElementById('search-input');
    var neighborhoodFilter = document.getElementById('filter-neighborhood');
    var dateFilter = document.getElementById('filter-date');
    if (!searchInput) return;

    var query = searchInput.value.trim().toLowerCase();
    var neighborhood = neighborhoodFilter ? neighborhoodFilter.value : '';
    var days = dateFilter ? parseInt(dateFilter.value, 10) : 0;
    var cutoff = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

    var filtered = obituariesData.filter(function (obit) {
      if (query && obit.fullName.toLowerCase().indexOf(query) === -1) return false;
      if (neighborhood && obit.cityNeighborhood !== neighborhood) return false;
      if (cutoff && new Date(obit.dateOfDeath) < cutoff) return false;
      return true;
    });

    renderObituaries(filtered);
  }

  function initSearch() {
    var searchInput = document.getElementById('search-input');
    var neighborhoodFilter = document.getElementById('filter-neighborhood');
    var dateFilter = document.getElementById('filter-date');

    if (searchInput) searchInput.addEventListener('input', filterObituaries);
    if (neighborhoodFilter) neighborhoodFilter.addEventListener('change', filterObituaries);
    if (dateFilter) dateFilter.addEventListener('change', filterObituaries);
  }

  /* --- Obituary Detail View --- */
  function initObituaryDetail() {
    var container = document.getElementById('obituary-detail');
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) {
      container.innerHTML = '<div class="empty-state"><p>Obituary not found.</p></div>';
      return;
    }

    var basePath = getBasePath();
    fetch(basePath + 'data/obituaries.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var obit = data.find(function (o) { return o.id === id; });
        if (!obit) {
          container.innerHTML = '<div class="empty-state"><p>Obituary not found.</p></div>';
          return;
        }

        document.title = obit.fullName + ' — Obituaries — Dayton Informs';

        var dates = '';
        if (obit.dateOfBirth && obit.dateOfDeath) {
          dates = formatDate(obit.dateOfBirth) + ' — ' + formatDate(obit.dateOfDeath);
        } else if (obit.dateOfDeath) {
          dates = 'd. ' + formatDate(obit.dateOfDeath);
        }

        var html = '';

        if (obit.photo) {
          html += '<img src="' + escapeHtml(obit.photo) + '" alt="Photo of ' + escapeHtml(obit.fullName) + '" class="photo">';
        }

        html += '<h1>' + escapeHtml(obit.fullName) + '</h1>';
        html += '<p class="dates" style="font-size: 1.1rem; color: #555; margin-bottom: 1.5rem;">' + escapeHtml(dates) + '</p>';
        html += '<p class="meta" style="margin-bottom: 1.5rem;">' + escapeHtml(obit.cityNeighborhood) + '</p>';

        if (obit.remembrance) {
          html += '<div class="remembrance">' + escapeHtml(obit.remembrance).replace(/\n/g, '<br>') + '</div>';
        }

        if (obit.aiAssisted) {
          html += '<p class="mt-2"><span class="ai-label">AI-assisted draft, reviewed by submitter</span></p>';
        }

        if (obit.survivors) {
          html += '<div class="survivors"><h3>Survivors</h3><p>' + escapeHtml(obit.survivors).replace(/\n/g, '<br>') + '</p></div>';
        }

        if (obit.militaryService === 'yes' && obit.militaryBranch) {
          html += '<div class="military-service"><strong>Military service:</strong> ' + escapeHtml(obit.militaryBranch) + '</div>';
        }

        container.innerHTML = html;

        // Add Schema.org structured data
        addSchemaMarkup(obit);
      })
      .catch(function () {
        container.innerHTML = '<div class="empty-state"><p>Unable to load obituary. Please try again later.</p></div>';
      });
  }

  function addSchemaMarkup(obit) {
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': obit.fullName,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': obit.cityNeighborhood
      }
    };
    if (obit.dateOfBirth) schema.birthDate = obit.dateOfBirth;
    if (obit.dateOfDeath) schema.deathDate = obit.dateOfDeath;

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /* --- Enhanced Meetings Calendar --- */
  var allMeetings = [];
  var upcomingMeetings = [];
  var pastMeetings = [];
  var pastShowCount = 25;

  function loadMeetings() {
    var basePath = getBasePath();
    fetch(basePath + 'data/meetings.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        allMeetings = data;
        splitMeetings();
        populateBodyFilters();
        renderThisWeek(upcomingMeetings);
        renderUpcoming(upcomingMeetings);
        renderPast(pastMeetings);
      })
      .catch(function () {
        // Data not available yet
      });
  }

  function splitMeetings() {
    var today = getTodayString();
    upcomingMeetings = allMeetings.filter(function (m) {
      return m.date >= today;
    }).sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 :
        (a.time || '00:00') < (b.time || '00:00') ? -1 : 1;
    });
    pastMeetings = allMeetings.filter(function (m) {
      return m.date < today;
    }).sort(function (a, b) {
      return a.date > b.date ? -1 : a.date < b.date ? 1 :
        (a.time || '00:00') > (b.time || '00:00') ? -1 : 1;
    });
  }

  function getTodayString() {
    var d = new Date();
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  function populateBodyFilters() {
    var bodies = [];
    allMeetings.forEach(function (m) {
      if (m.bodyName && bodies.indexOf(m.bodyName) === -1) {
        bodies.push(m.bodyName);
      }
    });
    bodies.sort();

    ['filter-body', 'archive-body'].forEach(function (id) {
      var select = document.getElementById(id);
      if (!select) return;
      bodies.forEach(function (b) {
        var option = document.createElement('option');
        option.value = b;
        option.textContent = b;
        select.appendChild(option);
      });
    });
  }

  /* --- This Week Section --- */
  function renderThisWeek(list) {
    var container = document.getElementById('this-week');
    if (!container) return;

    var today = getTodayString();
    var weekEnd = getDatePlusDays(7);

    var thisWeek = list.filter(function (m) {
      return m.date >= today && m.date <= weekEnd;
    });

    if (!thisWeek.length) {
      container.innerHTML = '';
      return;
    }

    var html = '<div class="this-week-section">';
    html += '<h2>This Week</h2>';
    thisWeek.forEach(function (m) {
      html += renderMeetingCard(m, false);
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function getDatePlusDays(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  /* --- Meeting Card Renderer --- */
  function renderMeetingCard(m, isPast) {
    var html = '<div class="meeting-item' + (isPast ? ' meeting-item--past' : '') + '">';

    if (m.category) {
      html += '<span class="meeting-category">' + escapeHtml(m.category) + '</span>';
    }
    html += '<p class="meeting-body-name">' + escapeHtml(m.bodyName) + '</p>';
    if (m.meetingType) {
      html += '<p class="meeting-type">' + escapeHtml(m.meetingType) + '</p>';
    }
    html += '<p class="meeting-datetime">' + formatDate(m.date);
    if (m.time) html += ' at ' + formatTime(m.time);
    html += '</p>';
    if (m.location) {
      html += '<p class="meeting-location">' + escapeHtml(m.location) + '</p>';
    }
    if (m.address) {
      html += '<p class="meeting-address"><a href="' + getGoogleMapsUrl(m.address) +
        '" target="_blank" rel="noopener">' + escapeHtml(m.address) + '</a></p>';
    }

    // Past meeting resources
    if (isPast && (m.minutesLink || m.videoLink)) {
      html += '<div class="meeting-resources">';
      if (m.minutesLink) {
        html += '<a href="' + escapeHtml(m.minutesLink) + '" target="_blank" rel="noopener">Minutes</a>';
      }
      if (m.videoLink) {
        html += '<a href="' + escapeHtml(m.videoLink) + '" target="_blank" rel="noopener">Video</a>';
      }
      if (m.agendaLink) {
        html += '<a href="' + escapeHtml(m.agendaLink) + '" target="_blank" rel="noopener">Agenda</a>';
      }
      html += '</div>';
    }

    if (m.description) {
      html += '<p style="margin-top: 0.35rem; font-size: 0.889rem; color: #555;">' + escapeHtml(m.description) + '</p>';
    }

    // Upcoming meeting actions
    if (!isPast) {
      html += '<div class="meeting-actions">';
      if (m.agendaLink) {
        html += '<a href="' + escapeHtml(m.agendaLink) + '" class="btn-small" target="_blank" rel="noopener">Agenda</a>';
      }
      if (m.virtualLink) {
        html += '<a href="' + escapeHtml(m.virtualLink) + '" class="btn-small" target="_blank" rel="noopener">Join Virtual</a>';
      }
      html += '<button class="btn-small" data-ics-id="' + escapeHtml(m.id) + '">Add to Calendar</button>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* --- Render Upcoming --- */
  function renderUpcoming(list) {
    var container = document.getElementById('meetings-upcoming');
    var countEl = document.getElementById('upcoming-count');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><p>No upcoming meetings match your filters.</p></div>';
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) {
      countEl.textContent = list.length + ' upcoming meeting' + (list.length === 1 ? '' : 's');
    }

    var html = '';
    list.forEach(function (m) {
      html += renderMeetingCard(m, false);
    });
    container.innerHTML = html;
  }

  /* --- Render Past --- */
  function renderPast(list) {
    var container = document.getElementById('meetings-past');
    var countEl = document.getElementById('archive-count');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><p>No past meetings match your filters.</p></div>';
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) {
      countEl.textContent = list.length + ' past meeting' + (list.length === 1 ? '' : 's');
    }

    var showing = list.slice(0, pastShowCount);
    var html = '';
    showing.forEach(function (m) {
      html += renderMeetingCard(m, true);
    });

    if (list.length > pastShowCount) {
      html += '<button class="show-more-btn" id="show-more-past">Show more (' + (list.length - pastShowCount) + ' remaining)</button>';
    }

    container.innerHTML = html;
  }

  /* --- Filtering --- */
  function filterUpcoming() {
    var search = (document.getElementById('meetings-search') || {}).value || '';
    var category = (document.getElementById('filter-category') || {}).value || '';
    var body = (document.getElementById('filter-body') || {}).value || '';

    var filtered = upcomingMeetings.filter(function (m) {
      if (category && m.category !== category) return false;
      if (body && m.bodyName !== body) return false;
      if (search) {
        var q = search.toLowerCase();
        var haystack = (m.bodyName + ' ' + m.meetingType + ' ' + m.location + ' ' + (m.description || '')).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    renderThisWeek(filtered);
    renderUpcoming(filtered);
  }

  function filterPast() {
    var search = (document.getElementById('archive-search') || {}).value || '';
    var category = (document.getElementById('archive-category') || {}).value || '';
    var body = (document.getElementById('archive-body') || {}).value || '';
    var dateFrom = (document.getElementById('archive-date-from') || {}).value || '';
    var dateTo = (document.getElementById('archive-date-to') || {}).value || '';

    var filtered = pastMeetings.filter(function (m) {
      if (category && m.category !== category) return false;
      if (body && m.bodyName !== body) return false;
      if (dateFrom && m.date < dateFrom) return false;
      if (dateTo && m.date > dateTo) return false;
      if (search) {
        var q = search.toLowerCase();
        var haystack = (m.bodyName + ' ' + m.meetingType + ' ' + m.location + ' ' + (m.description || '')).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    pastShowCount = 25;
    renderPast(filtered);
  }

  /* --- Debounce --- */
  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* --- ICS Calendar File Generation --- */
  function generateICS(meeting) {
    var dtStart = meeting.date.replace(/-/g, '');
    if (meeting.time) {
      dtStart += 'T' + meeting.time.replace(':', '') + '00';
    } else {
      dtStart += 'T000000';
    }

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dayton Informs//Public Meetings//EN',
      'BEGIN:VEVENT',
      'UID:' + meeting.id + '@daytonfyi.com',
      'DTSTART:' + dtStart,
      'DURATION:PT2H',
      'SUMMARY:' + icsEscape(meeting.bodyName + ' — ' + meeting.meetingType),
      'LOCATION:' + icsEscape((meeting.location || '') + (meeting.address ? ', ' + meeting.address : '')),
      'DESCRIPTION:' + icsEscape('Public meeting of the ' + meeting.bodyName + '. Details at daytonfyi.com/meetings/'),
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    return lines.join('\r\n');
  }

  function icsEscape(str) {
    if (!str) return '';
    return str.replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n');
  }

  function downloadICS(meeting) {
    var ics = generateICS(meeting);
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = meeting.id + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* --- Google Maps URL --- */
  function getGoogleMapsUrl(address) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
  }

  /* --- Format Time (24h to 12h) --- */
  function formatTime(timeStr) {
    if (!timeStr) return '';
    var parts = timeStr.split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1] || '00';
    var ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return h + ':' + m + ' ' + ampm;
  }

  /* --- Event Delegation for Meeting Actions --- */
  function initMeetingActions() {
    document.addEventListener('click', function (e) {
      // ICS download buttons
      var icsBtn = e.target.closest('[data-ics-id]');
      if (icsBtn) {
        e.preventDefault();
        var id = icsBtn.getAttribute('data-ics-id');
        var meeting = allMeetings.find(function (m) { return m.id === id; });
        if (meeting) downloadICS(meeting);
        return;
      }

      // Show more button
      if (e.target.id === 'show-more-past') {
        pastShowCount += 25;
        filterPast();
        return;
      }
    });
  }

  /* --- Initialize Meetings Filters --- */
  function initMeetingsFilters() {
    var debouncedUpcoming = debounce(filterUpcoming, 200);
    var debouncedPast = debounce(filterPast, 200);

    var searchInput = document.getElementById('meetings-search');
    var categoryFilter = document.getElementById('filter-category');
    var bodyFilter = document.getElementById('filter-body');
    var archiveSearch = document.getElementById('archive-search');
    var archiveCategory = document.getElementById('archive-category');
    var archiveBody = document.getElementById('archive-body');
    var archiveDateFrom = document.getElementById('archive-date-from');
    var archiveDateTo = document.getElementById('archive-date-to');

    if (searchInput) searchInput.addEventListener('input', debouncedUpcoming);
    if (categoryFilter) categoryFilter.addEventListener('change', filterUpcoming);
    if (bodyFilter) bodyFilter.addEventListener('change', filterUpcoming);
    if (archiveSearch) archiveSearch.addEventListener('input', debouncedPast);
    if (archiveCategory) archiveCategory.addEventListener('change', filterPast);
    if (archiveBody) archiveBody.addEventListener('change', filterPast);
    if (archiveDateFrom) archiveDateFrom.addEventListener('change', filterPast);
    if (archiveDateTo) archiveDateTo.addEventListener('change', filterPast);
  }

  /* --- Utility Functions --- */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    var year = parts[0];
    var month = months[parseInt(parts[1], 10) - 1];
    var day = parseInt(parts[2], 10);
    return month + ' ' + day + ', ' + year;
  }

  function truncate(str, max) {
    if (!str || str.length <= max) return str;
    return str.substring(0, max).replace(/\s+\S*$/, '') + '...';
  }

  /* --- Initialize --- */
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initMilitaryToggle();
    initObituaryForm();
    initSearch();
    initObituaryDetail();
    initMeetingActions();
    initMeetingsFilters();

    // Load data for the current page
    if (document.getElementById('search-results')) {
      loadObituaries();
    }
    if (document.getElementById('meetings-upcoming')) {
      loadMeetings();
    }
  });

})();
