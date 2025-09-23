// Smooth scroll + mobile nav toggle + year stamp
(function() {
  function smoothScrollTo(targetId) {
    var el = document.getElementById(targetId);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - 64;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    if (document.getElementById(id)) {
      e.preventDefault();
      smoothScrollTo(id);
      var nav = document.querySelector('.site-nav');
      if (nav && nav.classList.contains('open')) nav.classList.remove('open');
      var btn = document.querySelector('.nav-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  var btn = document.querySelector('.nav-toggle');
  if (btn) {
    btn.addEventListener('click', function() {
      var nav = document.querySelector('.site-nav');
      if (!nav) return;
      var isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Google Drive upload via Apps Script (no Google login required)
(function() {
  var input = document.getElementById('gdrive-files');
  var button = document.getElementById('gdrive-upload');
  var statusEl = document.getElementById('gdrive-status');
  if (!input || !button) return;

  // TODO: Replace with your deployed Apps Script web app URL (exec)
  var UPLOAD_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

  button.addEventListener('click', function() {
    if (!input.files || input.files.length === 0) {
      setStatus('Please select image(s) first.');
      return;
    }
    var files = Array.prototype.slice.call(input.files);

    var formData = new FormData();
    files.forEach(function(file) { formData.append('files[]', file, file.name); });

    setStatus('Uploading ' + files.length + ' file(s)...');
    fetch(UPLOAD_ENDPOINT, { method: 'POST', body: formData })
      .then(function(res) { return res.json().catch(function(){ return {}; }); })
      .then(function(json) {
        if (json && json.success) {
          setStatus('Upload complete.');
          input.value = '';
        } else {
          setStatus('Upload finished (check folder).');
        }
      })
      .catch(function(err) {
        console.error(err);
        setStatus('Upload failed.');
      });
  });
})();

 