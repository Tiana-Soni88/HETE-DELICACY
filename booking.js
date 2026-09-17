// booking.js
import { db } from './firebase-config.js';
import { ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { ROOMS } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  // Prefill room from URL (?room=executive)
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  const roomSelect = document.getElementById('roomType');
  if (roomParam && roomSelect) roomSelect.value = roomParam;

  // Set min date today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkIn').min = today;
  document.getElementById('checkOut').min = today;

  // Ensure checkout is after checkin
  document.getElementById('checkIn').addEventListener('change', (e) => {
    document.getElementById('checkOut').min = e.target.value;
  });

  // Show live price estimate
  roomSelect.addEventListener('change', updateEstimate);
  document.getElementById('checkIn').addEventListener('change', updateEstimate);
  document.getElementById('checkOut').addEventListener('change', updateEstimate);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('statusMessage');

    const data = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      roomType: roomSelect.value,
      checkIn: document.getElementById('checkIn').value,
      checkOut: document.getElementById('checkOut').value,
      message: document.getElementById('message').value.trim(),
      createdAt: serverTimestamp()
    };

    // Validation
    if (!data.name || !data.email || !data.phone || !data.roomType || !data.checkIn || !data.checkOut) {
      status.textContent = '⚠️ Please complete all required fields.';
      status.className = 'status error';
      return;
    }
    if (new Date(data.checkOut) <= new Date(data.checkIn)) {
      status.textContent = '⚠️ Check-out must be after check-in.';
      status.className = 'status error';
      return;
    }

    status.textContent = '⏳ Sending your reservation...';
    status.className = 'status pending';

    try {
      await push(ref(db, 'bookings'), data);
      status.textContent = '✅ Reservation received! Our concierge will contact you within 24 hours.';
      status.className = 'status success';
      form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = '❌ Something went wrong. Please try again.';
      status.className = 'status error';
    }
  });

  function updateEstimate() {
    const roomId = roomSelect.value;
    const inDate = document.getElementById('checkIn').value;
    const outDate = document.getElementById('checkOut').value;
    const est = document.getElementById('estimate');
    if (!est) return;

    const room = ROOMS.find(r => r.id === roomId);
    if (room && inDate && outDate) {
      const nights = (new Date(outDate) - new Date(inDate)) / (1000 * 60 * 60 * 24);
      if (nights > 0) {
        est.textContent = `💰 Estimated: $${room.price * nights} (${nights} night${nights > 1 ? 's' : ''})`;
        est.style.display = 'block';
        return;
      }
    }
    est.style.display = 'none';
  }
});