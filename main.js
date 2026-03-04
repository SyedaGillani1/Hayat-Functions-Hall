// Mobile nav toggle
const burger = document.querySelector('[data-burger]');
const navlinks = document.querySelector('[data-navlinks]');
if (burger && navlinks) {
  burger.addEventListener('click', () => {
    const isOpen = navlinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
  navlinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navlinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) {
      navlinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

// Active link highlight
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navlinks a').forEach((a) => {
  const href = (a.getAttribute('href') || '').split('#')[0];
  if (href === path) a.classList.add('active');
});

// Lightbox for gallery
const lb = document.querySelector('[data-lightbox]');
const lbImg = document.querySelector('[data-lightbox-img]');
const lbClose = document.querySelector('[data-lightbox-close]');
const lbPrev = document.querySelector('[data-lightbox-prev]');
const lbNext = document.querySelector('[data-lightbox-next]');
const lbCaption = document.querySelector('[data-lightbox-caption]');
const lbCount = document.querySelector('[data-lightbox-count]');
const galleryItems = Array.from(document.querySelectorAll('[data-gimg]'));
let currentGalleryIndex = -1;
if (lbPrev) lbPrev.disabled = galleryItems.length < 2;
if (lbNext) lbNext.disabled = galleryItems.length < 2;

function updateLightboxMeta(index) {
  if (!galleryItems.length || index < 0 || index >= galleryItems.length) return;
  const item = galleryItems[index];
  const thumb = item.querySelector('img');
  const caption = thumb?.alt || `Image ${index + 1}`;
  if (lbCaption) lbCaption.textContent = caption;
  if (lbCount) lbCount.textContent = `${index + 1} / ${galleryItems.length}`;
}

function setLightboxImage(index) {
  if (!lb || !lbImg || !galleryItems.length) return;
  const safeIndex = (index + galleryItems.length) % galleryItems.length;
  currentGalleryIndex = safeIndex;
  const item = galleryItems[safeIndex];
  const src = item.getAttribute('data-gimg') || '';
  const thumb = item.querySelector('img');
  lbImg.src = src;
  lbImg.alt = thumb?.alt || 'Gallery preview';
  updateLightboxMeta(safeIndex);
}

function openLightbox(srcOrIndex) {
  if (!lb || !lbImg) return;
  if (typeof srcOrIndex === 'number') {
    setLightboxImage(srcOrIndex);
  } else {
    lbImg.src = srcOrIndex;
    currentGalleryIndex = galleryItems.findIndex((item) => item.getAttribute('data-gimg') === srcOrIndex);
    if (currentGalleryIndex >= 0) {
      updateLightboxMeta(currentGalleryIndex);
    }
  }
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lb) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (lbImg) lbImg.src = '';
  }, 180);
}

function stepLightbox(direction) {
  if (galleryItems.length < 2 || currentGalleryIndex < 0) return;
  setLightboxImage(currentGalleryIndex + direction);
}

galleryItems.forEach((el, index) => {
  el.addEventListener('click', () => openLightbox(index));
});

if (lbClose) lbClose.addEventListener('click', closeLightbox);
if (lbPrev) lbPrev.addEventListener('click', () => stepLightbox(-1));
if (lbNext) lbNext.addEventListener('click', () => stepLightbox(1));
if (lb) {
  lb.addEventListener('click', (e) => {
    const closeTarget = e.target.closest('[data-lightbox-close]');
    if (closeTarget) closeLightbox();
  });
}
window.addEventListener('keydown', (e) => {
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});

// Smooth scroll for same-page anchors
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Site config injection: social links, map, WhatsApp booking
(function initSiteConfig() {
  const SITE = window.SITE;
  if (!SITE) return;

  document.querySelectorAll('[data-social-links]').forEach((socialWrap) => {
    socialWrap.querySelectorAll('[data-social]').forEach((a) => {
      const key = a.getAttribute('data-social');
      if (key === 'maps') {
        a.href = `https://www.google.com/maps?q=${encodeURIComponent(SITE.addressText)}`;
        return;
      }

      const url = SITE.social?.[key] || '';
      const isReal = /^https?:\/\//i.test(url) && url !== 'https://facebook.com/' && url !== 'https://youtube.com/';

      if (isReal) {
        a.href = url;
      } else {
        a.style.display = 'none';
      }
    });
  });

  const mapFrame = document.getElementById('mapFrame');
  if (mapFrame && SITE.mapsEmbedUrl) mapFrame.src = SITE.mapsEmbedUrl;

  const addr = document.getElementById('addressText');
  if (addr) addr.textContent = SITE.addressText;

  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      const name = (fd.get('name') || '').toString().trim();
      const date = (fd.get('date') || '').toString().trim();
      const guests = (fd.get('guests') || '').toString().trim();
      const service = (fd.get('service') || '').toString().trim();
      const menu = (fd.get('menu') || '').toString().trim();
      const notes = (fd.get('notes') || '').toString().trim();

      const msg =
`Assalam o Alaikum,
I want to book with ${SITE.businessName}.

Name: ${name}
Event Date: ${date}
Guests: ${guests}
Service: ${service}
Menu: ${menu}
Notes: ${notes || '-'}

Please confirm availability and total price.`;

      const url = `https://wa.me/${SITE.whatsappNumberE164}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
