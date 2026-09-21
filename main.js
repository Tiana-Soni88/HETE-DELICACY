// main.js
import { ROOMS, OFFERS, TESTIMONIALS, GALLERY_IMAGES } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('★ Hete Delicacy — Luxury Hotel System Loaded');

  initMobileNav();
  initScrollAnimations();
  initNavbarScrollEffect();

  // Page-specific auto-render
  renderFeaturedRooms();
  renderOffers();
  renderTestimonials();
  renderRoomsPage();
  renderGallery();
  initCounterStats();
});

/* ---------- MOBILE NAVIGATION ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });
}

/* ---------- NAVBAR SCROLL EFFECT ---------- */
function initNavbarScrollEffect() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ---------- SCROLL ANIMATIONS ---------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));
}

/* ---------- FEATURED ROOMS (Homepage) ---------- */
function renderFeaturedRooms() {
  const container = document.getElementById('featuredRooms');
  if (!container) return;

  container.innerHTML = ROOMS.map(room => `
    <div class="room-card fade-in">
      <div class="room-img" style="background-image:url('${room.image}')"></div>
      <div class="room-body">
        <h3>${room.name}</h3>
        <p class="price">$${room.price} <span>/ night</span></p>
        <ul class="room-features">
          ${room.features.slice(0, 3).map(f => `<li>✓ ${f}</li>`).join('')}
        </ul>
        <a href="contact.html?room=${room.id}" class="btn">Book Now</a>
      </div>
    </div>
  `).join('');
}

/* ---------- ROOMS PAGE ---------- */
function renderRoomsPage() {
  const container = document.getElementById('allRooms');
  if (!container) return;

  container.innerHTML = ROOMS.map(room => `
    <div class="room-card detailed fade-in">
      <div class="room-img" style="background-image:url('${room.image}')"></div>
      <div class="room-body">
        <h3>${room.name}</h3>
        <p class="price">$${room.price} <span>/ night</span></p>
        <div class="room-meta">
          <span>📐 ${room.size}</span>
          <span>👥 ${room.guests} Guests</span>
          <span>🛏 ${room.bed}</span>
        </div>
        <ul class="room-features">
          ${room.features.map(f => `<li>✓ ${f}</li>`).join('')}
        </ul>
        <a href="contact.html?room=${room.id}" class="btn">Reserve</a>
      </div>
    </div>
  `).join('');
}

/* ---------- OFFERS ---------- */
function renderOffers() {
  const container = document.getElementById('offersGrid');
  if (!container) return;

  container.innerHTML = OFFERS.map(o => `
    <div class="offer-card fade-in">
      <span class="discount-badge">${o.discount}</span>
      <h3>${o.title}</h3>
      <p>${o.description}</p>
      <small>Valid until: ${o.validUntil}</small>
      <a href="contact.html" class="btn-outline">Claim Offer</a>
    </div>
  `).join('');
}

/* ---------- TESTIMONIALS ---------- */
function renderTestimonials() {
  const container = document.getElementById('testimonialsGrid');
  if (!container) return;

  container.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card fade-in">
      <div class="stars">${'★'.repeat(t.rating)}</div>
      <p>"${t.text}"</p>
      <h4>${t.name}</h4>
      <small>${t.location}</small>
    </div>
  `).join('');
}

/* ---------- GALLERY ---------- */
function renderGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  container.innerHTML = GALLERY_IMAGES.map((img, i) => `
    <div class="gallery-item fade-in" data-index="${i}">
      <img src="${img}" alt="Hotel gallery ${i + 1}" loading="lazy" />
      <div class="gallery-overlay">🔍 View</div>
    </div>
  `).join('');
}

/* ---------- COUNTER STATS ---------- */
function initCounterStats() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const animate = (el) => {
    const target = +el.dataset.target;
    let current = 0;
    const step = target / 60;
    const tick = () => {
      current += step;
      if (current < target) {
        el.textContent = Math.floor(current);
        requestAnimationFrame(tick);
      } else el.textContent = target;
    };
    tick();
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}