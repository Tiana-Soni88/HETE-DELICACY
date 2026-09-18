// admin.js
import { db } from './firebase-config.js';
import {
  ref, onValue, remove, set, get
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const auth = getAuth();
const PURGE_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
  const loginBox   = document.getElementById('loginBox');
  const dashboard  = document.getElementById('dashboard');
  const loginForm  = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn  = document.getElementById('logoutBtn');
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const tabs        = document.querySelectorAll('.tab');
  const tbody       = document.querySelector('#bookingsTable tbody');
  const emptyState  = document.getElementById('emptyState');
  const emptyMsg    = document.getElementById('emptyMessage');
  const actionHeader = document.getElementById('actionHeader');

  if (!loginBox || !dashboard) return;

  let activeBookings = [];
  let trashBookings  = [];
  let currentTab     = 'active';
  let searchTerm     = '';
  let activeUnsub = null;
  let trashUnsub  = null;

  /* ============================================
     AUTH STATE OBSERVER (auto-login on refresh)
     ============================================ */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });

  /* ============================================
     LOGIN
     ============================================ */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const submitBtn = loginForm.querySelector('button');

    loginError.textContent = '';
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log('✅ Admin logged in');
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
      })
      .catch((error) => {
        console.error('Login error:', error.code);
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            loginError.textContent = '❌ Invalid email or password.';
            break;
          case 'auth/invalid-email':
            loginError.textContent = '❌ Please enter a valid email.';
            break;
          case 'auth/too-many-requests':
            loginError.textContent = '❌ Too many attempts. Try again later.';
            break;
          default:
            loginError.textContent = '❌ Login failed. Please try again.';
        }
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
      });
  });

  /* ============================================
     LOGOUT
     ============================================ */
  logoutBtn.addEventListener('click', () => {
    if (!confirm('Log out of admin panel?')) return;
    // Detach listeners
    if (activeUnsub) activeUnsub();
    if (trashUnsub)  trashUnsub();
    signOut(auth).catch(err => console.error('Logout error:', err));
  });

  /* ============================================
     UI SWITCHING
     ============================================ */
  function showDashboard() {
    loginBox.style.display = 'none';
    dashboard.style.display = 'block';
    loadBookings();
    loadTrash();
  }

  function showLogin() {
    loginBox.style.display = 'block';
    dashboard.style.display = 'none';
    loginForm.reset();
    loginError.textContent = '';
    const btn = loginForm.querySelector('button');
    btn.textContent = 'Login';
    btn.disabled = false;
  }

  /* ============================================
     LOAD BOOKINGS (ACTIVE)
     ============================================ */
  function loadBookings() {
    if (activeUnsub) activeUnsub();
    const bookingsRef = ref(db, 'bookings');

    activeUnsub = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      activeBookings = Object.entries(data).map(([id, b]) => ({ id, ...b }));
      render();
    }, (err) => {
      console.error('Read active error:', err);
      tbody.innerHTML = `<tr><td colspan="7" class="empty-msg" style="color:var(--error);">
        ❌ Permission denied. Check Firebase rules.
      </td></tr>`;
    });
  }

  /* ============================================
     LOAD TRASH
     ============================================ */
  function loadTrash() {
    if (trashUnsub) trashUnsub();
    const trashRef = ref(db, 'trash');

    trashUnsub = onValue(trashRef, (snapshot) => {
      const data = snapshot.val() || {};
      trashBookings = Object.entries(data).map(([id, b]) => ({ id, ...b }));
      render();
      purgeExpired();
    }, (err) => {
      console.error('Read trash error:', err);
    });
  }

  /* ============================================
     AUTO-PURGE EXPIRED TRASH (30+ days)
     ============================================ */
  async function purgeExpired() {
    const now = Date.now();
    const expired = trashBookings.filter(b => b.purgeAt && b.purgeAt <= now);
    if (expired.length === 0) return;

    console.log(`🔥 Purging ${expired.length} expired bookings...`);
    for (const item of expired) {
      try {
        await remove(ref(db, `trash/${item.id}`));
        console.log('🔥 Purged:', item.id);
      } catch (err) {
        console.error('Purge failed for', item.id, err);
      }
    }
  }

  /* ============================================
     TABS
     ============================================ */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      render();
    });
  });

  /* ============================================
     SEARCH
     ============================================ */
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    clearSearch.classList.toggle('visible', searchTerm.length > 0);
    render();
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    clearSearch.classList.remove('visible');
    render();
  });

  /* ============================================
     RENDER TABLE
     ============================================ */
  function render() {
    const source = currentTab === 'active' ? activeBookings : trashBookings;
    const filtered = filterBookings(source);

    // Update counters
    document.getElementById('activeCount').textContent = activeBookings.length;
    document.getElementById('trashCount').textContent  = trashBookings.length;
    document.getElementById('bookingCount').textContent =
      currentTab === 'active'
        ? `${activeBookings.length} active`
        : `${trashBookings.length} in trash`;

    // Update action header
    actionHeader.textContent = currentTab === 'active' ? 'Actions' : 'Trash Actions';

    // No results
    if (filtered.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      emptyMsg.textContent = searchTerm
        ? `No results for "${searchTerm}".`
        : currentTab === 'active'
          ? 'No active bookings.'
          : 'Trash is empty.';
      return;
    }
    emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(b => {
      const isTrash = currentTab === 'trash';
      const purgeBadge = isTrash && b.purgeAt
        ? `<div class="purge-badge">⏳ ${daysRemaining(b.purgeAt)}</div>`
        : '';

      const actions = isTrash
        ? `<button class="action-btn btn-restore" data-action="restore" data-id="${b.id}">♻ Restore</button>
           <button class="action-btn btn-forever" data-action="forever" data-id="${b.id}">🔥 Delete Forever</button>`
        : `<button class="action-btn btn-trash" data-action="trash" data-id="${b.id}">🗑 Delete</button>`;

      return `
        <tr class="${isTrash ? 'trash-row' : ''}">
          <td>${escapeHtml(b.name)}${purgeBadge}</td>
          <td>${escapeHtml(b.email)}</td>
          <td>${escapeHtml(b.phone)}</td>
          <td>${escapeHtml(b.roomType)}</td>
          <td>${escapeHtml(b.checkIn)}</td>
          <td>${escapeHtml(b.checkOut)}</td>
          <td>${actions}</td>
        </tr>
      `;
    }).join('');

    // Attach handlers
    tbody.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.id));
    });
  }

  /* ============================================
     FILTER
     ============================================ */
  function filterBookings(list) {
    if (!searchTerm) return list;
    return list.filter(b => {
      const haystack = [
        b.name, b.email, b.phone, b.roomType, b.checkIn, b.checkOut, b.message
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  /* ============================================
     ACTION HANDLER (trash / restore / forever)
     ============================================ */
  async function handleAction(action, id) {
    try {
      if (action === 'trash') {
        if (!confirm('Move this booking to trash?\n\nYou can restore it within 30 days.')) return;
        const item = activeBookings.find(b => b.id === id);
        if (!item) return;

        const now = Date.now();
        const payload = {
          ...stripId(item),
          deletedAt: now,
          purgeAt: now + PURGE_DAYS * MS_PER_DAY
        };

        // 1) Write to trash
        await set(ref(db, `trash/${id}`), payload);
        // 2) Remove from active bookings
        await remove(ref(db, `bookings/${id}`));
        console.log('🗑️ Trashed:', id);

      } else if (action === 'restore') {
        if (!confirm('Restore this booking to active list?')) return;
        const item = trashBookings.find(b => b.id === id);
        if (!item) return;

        const payload = stripId(item);
        delete payload.deletedAt;
        delete payload.purgeAt;

        await set(ref(db, `bookings/${id}`), payload);
        await remove(ref(db, `trash/${id}`));
        console.log('♻️ Restored:', id);

      } else if (action === 'forever') {
        if (!confirm('⚠️ PERMANENTLY delete this booking?\n\nThis CANNOT be undone.')) return;
        await remove(ref(db, `trash/${id}`));
        console.log('🔥 Permanently deleted:', id);
      }
    } catch (err) {
      console.error('Action error:', err);
      alert('Action failed: ' + err.message);
    }
  }

  /* ============================================
     HELPERS
     ============================================ */
  function stripId(obj) {
    const { id, ...rest } = obj;
    return rest;
  }

  function daysRemaining(purgeAt) {
    const diff = purgeAt - Date.now();
    if (diff <= 0) return 'Purging soon...';
    const days = Math.ceil(diff / MS_PER_DAY);
    return days === 1 ? '1 day left' : `${days} days left`;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});