// admin.js
import { db } from './firebase-config.js';
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
  const loginBox   = document.getElementById('loginBox');
  const dashboard  = document.getElementById('dashboard');
  const loginForm  = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn  = document.getElementById('logoutBtn');

  if (!loginBox || !dashboard) return;

  /* ---------- AUTH STATE OBSERVER (auto-login on refresh) ---------- */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });

  /* ---------- LOGIN ---------- */
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

  /* ---------- LOGOUT ---------- */
  logoutBtn.addEventListener('click', () => {
    if (!confirm('Log out of admin panel?')) return;
    signOut(auth)
      .then(() => console.log('✅ Admin logged out'))
      .catch(err => console.error('Logout error:', err));
  });

  /* ---------- UI SWITCHING ---------- */
  function showDashboard() {
    loginBox.style.display = 'none';
    dashboard.style.display = 'block';
    loadBookings();
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

  /* ---------- LOAD BOOKINGS ---------- */
  function loadBookings() {
    const tbody = document.querySelector('#bookingsTable tbody');
    const counter = document.getElementById('bookingCount');
    const adminRef = ref(db, 'bookings');

    onValue(adminRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">No bookings yet.</td></tr>';
        if (counter) counter.textContent = '';
        return;
      }

      // Sort newest first
      const entries = Object.entries(data).sort((a, b) => {
        const aT = a[1].createdAt || 0;
        const bT = b[1].createdAt || 0;
        return bT - aT;
      });

      if (counter) counter.textContent = `${entries.length} booking${entries.length > 1 ? 's' : ''}`;

      tbody.innerHTML = entries.map(([id, b]) => `
        <tr>
          <td>${escapeHtml(b.name)}</td>
          <td>${escapeHtml(b.email)}</td>
          <td>${escapeHtml(b.phone)}</td>
          <td>${escapeHtml(b.roomType)}</td>
          <td>${escapeHtml(b.checkIn)}</td>
          <td>${escapeHtml(b.checkOut)}</td>
          <td><button class="delete-btn" data-id="${id}">Delete</button></td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (!confirm('Delete this booking permanently?')) return;
          remove(ref(db, `bookings/${id}`))
            .then(() => console.log('Deleted:', id))
            .catch(err => alert('Delete failed: ' + err.message));
        });
      });
    }, (err) => {
      console.error('Read error:', err);
      tbody.innerHTML = `<tr><td colspan="7" class="empty-msg" style="color:var(--error);">
        ❌ Permission denied. Please ensure your Firebase rules allow authenticated users to read.
      </td></tr>`;
    });
  }

  /* ---------- XSS PROTECTION ---------- */
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