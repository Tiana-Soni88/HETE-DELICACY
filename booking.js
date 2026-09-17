// booking.js
import { db } from './firebase-config.js';
import { ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const form = document.getElementById('bookingForm');
const status = document.getElementById('statusMessage');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name       = document.getElementById('name').value.trim();
    const email      = document.getElementById('email').value.trim();
    const phone      = document.getElementById('phone').value.trim();
    const roomType   = document.getElementById('roomType').value;
    const checkIn    = document.getElementById('checkIn').value;
    const checkOut   = document.getElementById('checkOut').value;
    const message    = document.getElementById('message').value.trim();

    // Basic validation
    if (!name || !email || !phone || !roomType || !checkIn || !checkOut) {
      status.textContent = '⚠️ Please fill in all required fields.';
      status.style.color = 'red';
      return;
    }

    try {
      const bookingsRef = ref(db, 'bookings');
      await push(bookingsRef, {
        name,
        email,
        phone,
        roomType,
        checkIn,
        checkOut,
        message,
        createdAt: serverTimestamp()
      });

      status.textContent = '✅ Reservation received! We will contact you shortly.';
      status.style.color = '#c9a227';
      form.reset();
    } catch (error) {
      console.error('Firebase error:', error);
      status.textContent = '❌ Something went wrong. Please try again.';
      status.style.color = 'red';
    }
  });
}