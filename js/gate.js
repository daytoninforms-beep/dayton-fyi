/* ============================================
   Dayton FYI — Password Gate
   Simple client-side access control for pre-launch preview.
   Remove this file and its <script> tags to open the site publicly.
   ============================================ */
(function () {
  'use strict';

  // Simple hash of the password — not cryptographically secure,
  // just enough to keep the password out of plain text in source.
  var PASS_HASH = '-1590009872';
  var STORAGE_KEY = 'daytonfyi_access';

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return String(hash);
  }

  // Check if already authenticated
  if (sessionStorage.getItem(STORAGE_KEY) === 'granted') return;

  // Hide the page content immediately
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.innerHTML = '';
    document.documentElement.style.visibility = 'visible';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", sans-serif';
    document.body.style.display = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    document.body.style.minHeight = '100vh';
    document.body.style.backgroundColor = '#ffffff';

    var box = document.createElement('div');
    box.style.cssText = 'text-align:center;max-width:360px;padding:2rem;';
    box.innerHTML =
      '<h1 style="font-size:1.5rem;margin-bottom:0.25rem;color:#1a1a1a;">Dayton FYI</h1>' +
      '<p style="color:#555;font-size:0.9rem;margin-bottom:1.5rem;">This site is in private preview.<br>Enter the password to continue.</p>' +
      '<input type="password" id="gate-pw" placeholder="Password" style="width:100%;font-size:1rem;padding:0.75rem;border:2px solid #ccc;border-radius:4px;margin-bottom:0.75rem;box-sizing:border-box;">' +
      '<button id="gate-btn" style="width:100%;font-size:1rem;font-weight:600;padding:0.75rem;border:none;border-radius:4px;background:#8b0000;color:#fff;cursor:pointer;">Enter</button>' +
      '<p id="gate-err" style="color:#8b0000;font-size:0.85rem;margin-top:0.75rem;display:none;">Incorrect password.</p>';
    document.body.appendChild(box);

    var pwInput = document.getElementById('gate-pw');
    var btn = document.getElementById('gate-btn');
    var err = document.getElementById('gate-err');

    function tryLogin() {
      if (simpleHash(pwInput.value.trim()) === PASS_HASH) {
        sessionStorage.setItem(STORAGE_KEY, 'granted');
        window.location.reload();
      } else {
        err.style.display = 'block';
        pwInput.value = '';
        pwInput.focus();
      }
    }

    btn.addEventListener('click', tryLogin);
    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryLogin();
    });
    pwInput.focus();
  });
})();
