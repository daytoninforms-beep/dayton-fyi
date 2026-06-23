(function() {
  var PASS = 'daytonfyi2026';
  var KEY = 'dfyi_access';
  if (sessionStorage.getItem(KEY) === PASS) return;
  var p = prompt('This area is in development. Enter the access code to continue:');
  if (p === PASS) {
    sessionStorage.setItem(KEY, PASS);
  } else {
    document.body.innerHTML = '<div style="font-family:system-ui;max-width:480px;margin:80px auto;text-align:center;color:#555;"><h2 style="color:#1a1a1a;font-size:22px;">Dayton.FYI Prototypes</h2><p style="margin:12px 0;">These pages are in active development and available to testers only.</p><p>Contact <a href="mailto:nickhrkman@gmail.com" style="color:#00A1A5;">nickhrkman@gmail.com</a> for access.</p><p style="margin-top:20px;"><a href="../index.html" style="color:#00A1A5;">View the public proposal &rarr;</a></p></div>';
  }
})();
