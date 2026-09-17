// gallery.js
import { GALLERY_IMAGES } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img class="lightbox-img" src="" alt="" />
    <button class="lightbox-prev">‹</button>
    <button class="lightbox-next">›</button>
  `;
  document.body.appendChild(lightbox);

  let currentIndex = 0;
  const imgEl = lightbox.querySelector('.lightbox-img');

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    currentIndex = +item.dataset.index;
    openLightbox();
  });

  function openLightbox() {
    imgEl.src = GALLERY_IMAGES[currentIndex];
    lightbox.classList.add('open');
  }
  function closeLightbox() { lightbox.classList.remove('open'); }
  function next() { currentIndex = (currentIndex + 1) % GALLERY_IMAGES.length; imgEl.src = GALLERY_IMAGES[currentIndex]; }
  function prev() { currentIndex = (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length; imgEl.src = GALLERY_IMAGES[currentIndex]; }

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-next').addEventListener('click', next);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
});