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

// Intro overlay cleanup
(function() {
  var overlay = document.querySelector('.intro-anim');
  if (!overlay) return;
  var remove = function(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { setTimeout(remove, 100); return; }
  // Keep for one full beat then fade; remove after ~2.8s
  setTimeout(remove, 2800);
})();


// Photos Uplaod 

const picUpload_btn = document.getElementById('photos-upload');
const picUpload_output = document.getElementById('photos-status');
const picUpload_File = document.getElementById('pic-input');
if (picUpload_btn) {
  picUpload_btn.addEventListener('click',upLoadFile);
}
function upLoadFile(){

  console.log(picUpload_File.files);
  const upFiles = picUpload_File.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
        const vals = reader.result.split(',');
        const obj = {
          fileName : upFiles.name,
          mimeType : upFiles.type,
          data : vals[1]
        }
        console.log(obj);
        google.script.run.withSuccessHandler(success).doUpload(obj);
    }
    if(upFiles){
        reader.readAsDataURL(upFiles);
    }
    //console.log('ready');
}
function success(rep){
  //console.log(rep);
  const a = document.createElement('a');
  const linkText = document.createTextNode(rep.fileName);
  output.append(a);
  a.append(linkText);
  a.href = rep.url;
  a.setAttribute('target','_blank');
}

// Wishlist functionality using JSONBin.io
(function() {
  // IMPORTANT: Replace this with your JSONBin.io bin ID
  // To get a bin ID: 
  // 1. Go to https://jsonbin.io/
  // 2. Create a free account
  // 3. Create a new bin with initial data: {"items": []}
  // 4. Copy the bin ID from the URL (e.g., if URL is https://jsonbin.io/your-username/b/abc123, the ID is "abc123")
  // 5. Get your API key from your account settings
  // 6. Replace the values below

  var JSONBIN_BIN_ID = '69197c01d0ea881f40eb8c95';
  var JSONBIN_API_KEY = '$2a$10$rBUVNT3EqeN6obC2Zul/R.LLA48fUYp95aURnOYF20zkmKhekltMG';
  var JSONBIN_READ_URL = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID + '/latest';
  var JSONBIN_UPDATE_URL = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID;

  var wishlistContainer = document.getElementById('wishlist-container');
  var wishlistItems = document.getElementById('wishlist-items');
  var wishlistLoading = document.getElementById('wishlist-loading');
  var wishlistError = document.getElementById('wishlist-error');
  var adminSection = document.getElementById('wishlist-admin');
  var addItemBtn = document.getElementById('add-item-btn');
  var newItemName = document.getElementById('new-item-name');
  var newItemDescription = document.getElementById('new-item-description');
  var currentItems = []; // Store current items
  
  // Reservation modal elements
  var reservationModal = document.getElementById('reservation-modal');
  var reservationItemName = document.getElementById('reservation-item-name');
  var reservationNameInput = document.getElementById('reservation-name-input');
  var reservationConfirmBtn = document.getElementById('reservation-confirm-btn');
  var reservationCancelBtn = document.getElementById('reservation-cancel-btn');
  var pendingReservationItemId = null; // Store item ID while modal is open

  if (!wishlistContainer) return;

  // Check if we're in admin mode (you can enable this by adding ?admin=true to URL)
  var urlParams = new URLSearchParams(window.location.search);
  var isAdmin = urlParams.get('admin') === 'true';
  if (isAdmin && adminSection) {
    adminSection.style.display = 'block';
  }

  // Load wishlist from JSONBin.io
  function loadWishlist() {
    if (JSONBIN_BIN_ID === 'YOUR_BIN_ID_HERE' || JSONBIN_API_KEY === 'YOUR_API_KEY_HERE') {
      showError('Bitte konfigurieren Sie die JSONBin.io Einstellungen in der JavaScript-Datei.');
      if (wishlistLoading) wishlistLoading.style.display = 'none';
      return;
    }

    fetch(JSONBIN_READ_URL, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load wishlist');
      return response.json();
    })
    .then(function(data) {
      var items = data.record && data.record.items ? data.record.items : [];
      currentItems = items; // Store items
      displayWishlist(items);
      if (wishlistLoading) wishlistLoading.style.display = 'none';
    })
    .catch(function(error) {
      console.error('Error loading wishlist:', error);
      showError('Fehler beim Laden der Geschenkeliste. Bitte versuchen Sie es später erneut.');
      if (wishlistLoading) wishlistLoading.style.display = 'none';
    });
  }

  // Save wishlist to JSONBin.io
  function saveWishlist(items) {
    return fetch(JSONBIN_UPDATE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify({ items: items })
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to save wishlist');
      return response.json();
    });
  }

  // Display wishlist items (only show available ones)
  function displayWishlist(items) {
    if (!wishlistItems) return;
    console.log(items);
    var availableItems = items.filter(function(item) { return !item.taken; });
    
    if (availableItems.length === 0) {
      wishlistItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Alle Geschenke wurden bereits reserviert. Vielen Dank für eure Großzügigkeit!</p>';
      return;
    }

    wishlistItems.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'wishlist-grid';

    availableItems.forEach(function(item, index) {
      console.log(availableItems);
      var card = document.createElement('div');
      card.className = 'wishlist-item';
      card.innerHTML = 
        '<div class="wishlist-item-content">' +
        '<h3 class="wishlist-item-name">' + escapeHtml(item.name) + '</h3>' +
        (item.description ? '<p class="wishlist-item-desc">' + escapeHtml(item.description) + '</p>' : '') +
        '</div>' +
        '<button class="btn primary wishlist-reserve-btn" data-index="' + index + '" data-id="' + item.id + '">Reservieren</button>';
      
      var reserveBtn = card.querySelector('.wishlist-reserve-btn');
      reserveBtn.addEventListener('click', function() {
        reserveItem(item.id);
      });
      
      grid.appendChild(card);
    });

    wishlistItems.appendChild(grid);
  }

  // Show reservation modal
  function showReservationModal(itemName, itemId) {
    if (!reservationModal || !reservationItemName || !reservationNameInput) return;
    
    pendingReservationItemId = itemId;
    reservationItemName.textContent = itemName;
    reservationNameInput.value = '';
    reservationModal.style.display = 'block';
    reservationNameInput.focus();
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  // Hide reservation modal
  function hideReservationModal() {
    if (!reservationModal) return;
    reservationModal.style.display = 'none';
    pendingReservationItemId = null;
    document.body.style.overflow = '';
  }

  // Setup modal event listeners
  if (reservationCancelBtn) {
    reservationCancelBtn.addEventListener('click', function() {
      hideReservationModal();
    });
  }

  if (reservationModal) {
    // Close modal when clicking overlay
    var overlay = reservationModal.querySelector('.reservation-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', function() {
        hideReservationModal();
      });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && reservationModal.style.display === 'block') {
        hideReservationModal();
      }
    });

    // Handle Enter key in name input
    if (reservationNameInput) {
      reservationNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (reservationConfirmBtn) reservationConfirmBtn.click();
        }
      });
    }
  }

  // Reserve an item
  function reserveItem(itemId) {
    // Reload items to get latest state
    fetch(JSONBIN_READ_URL, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load wishlist');
      return response.json();
    })
    .then(function(data) {
      var items = data.record && data.record.items ? data.record.items : [];
      var item = items.find(function(i) { return i.id === itemId; });
      
      if (!item || item.taken) {
        alert('Dieses Geschenk wurde bereits reserviert.');
        loadWishlist();
        return Promise.reject(new Error('Item already taken'));
      }

      // Show modal to get user's name
      showReservationModal(item.name, itemId);
    })
    .catch(function(error) {
      if (error.message !== 'Item already taken' && error.message !== 'User cancelled') {
        console.error('Error loading item:', error);
        alert('Fehler beim Laden. Bitte versuchen Sie es erneut.');
      }
    });
  }

  // Confirm reservation with name
  function confirmReservation() {
    if (!pendingReservationItemId || !reservationNameInput) return;
    
    var name = reservationNameInput.value.trim();
    if (!name) {
      alert('Bitte geben Sie Ihren Namen ein.');
      reservationNameInput.focus();
      return;
    }

    var itemId = pendingReservationItemId;
    hideReservationModal();

    // Disable confirm button to prevent double submission
    if (reservationConfirmBtn) {
      reservationConfirmBtn.disabled = true;
      reservationConfirmBtn.textContent = 'Wird gespeichert...';
    }

    // Reload items to get latest state
    fetch(JSONBIN_READ_URL, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load wishlist');
      return response.json();
    })
    .then(function(data) {
      var items = data.record && data.record.items ? data.record.items : [];
      var item = items.find(function(i) { return i.id === itemId; });
      
      if (!item || item.taken) {
        alert('Dieses Geschenk wurde bereits reserviert.');
        loadWishlist();
        return Promise.reject(new Error('Item already taken'));
      }

      item.taken = true;
      item.reservedBy = name;
      item.reservedAt = new Date().toISOString();

      return saveWishlist(items);
    })
    .then(function(result) {
      alert('Geschenk erfolgreich reserviert! Vielen Dank, ' + name + '!');
      loadWishlist();
    })
    .catch(function(error) {
      if (error.message !== 'Item already taken' && error.message !== 'User cancelled') {
        console.error('Error reserving item:', error);
        alert('Fehler beim Reservieren. Bitte versuchen Sie es erneut.');
        loadWishlist();
      }
    })
    .finally(function() {
      // Re-enable button
      if (reservationConfirmBtn) {
        reservationConfirmBtn.disabled = false;
        reservationConfirmBtn.textContent = 'Reservieren';
      }
    });
  }

  // Setup confirm button
  if (reservationConfirmBtn) {
    reservationConfirmBtn.addEventListener('click', confirmReservation);
  }

  // Add new item (admin only)
  if (addItemBtn && newItemName) {
    addItemBtn.addEventListener('click', function() {
      var name = newItemName.value.trim();
      if (!name) {
        alert('Bitte geben Sie einen Geschenknamen ein.');
        return;
      }

      fetch(JSONBIN_READ_URL, {
        method: 'GET',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY
        }
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        var items = data.record && data.record.items ? data.record.items : [];
        var newItem = {
          id: Date.now().toString(),
          name: name,
          description: newItemDescription.value.trim() || '',
          taken: false
        };
        items.push(newItem);
        return saveWishlist(items);
      })
      .then(function() {
        newItemName.value = '';
        newItemDescription.value = '';
        alert('Geschenk hinzugefügt!');
        loadWishlist();
      })
      .catch(function(error) {
        console.error('Error adding item:', error);
        alert('Fehler beim Hinzufügen. Bitte versuchen Sie es erneut.');
      });
    });
  }

  function showError(message) {
    if (wishlistError) {
      wishlistError.textContent = message;
      wishlistError.style.display = 'block';
    }
  }

  function escapeHtml(text) {
    console.log(text);
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize
  loadWishlist();
})();

 