// Mobile nav toggle
const burger = document.querySelector('[data-burger]');
const navlinks = document.querySelector('[data-navlinks]');
if (burger && navlinks){
  burger.addEventListener('click', () => navlinks.classList.toggle('open'));
}

// Active link highlight
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navlinks a').forEach(a=>{
  const href = a.getAttribute('href');
  if (href === path) a.classList.add('active');
});

// Lightbox for gallery
const lb = document.querySelector('[data-lightbox]');
const lbImg = document.querySelector('[data-lightbox-img]');
const lbClose = document.querySelector('[data-lightbox-close]');

function openLightbox(src){
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  if (lbImg) lbImg.src = '';
}

document.querySelectorAll('[data-gimg]').forEach(el=>{
  el.addEventListener('click', ()=> openLightbox(el.getAttribute('data-gimg')));
});

if (lbClose) lbClose.addEventListener('click', closeLightbox);
if (lb) lb.addEventListener('click', (e)=>{ if (e.target === lb) closeLightbox(); });
window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeLightbox(); });

// Smooth scroll for same-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth'});
    }
  });
});
// Site config injection: social links, map, WhatsApp booking
(function(){
  const SITE = window.SITE;
  if (!SITE) return;

  // Social links
  const socialWrap = document.getElementById('socialLinks');
  if (socialWrap){
    socialWrap.querySelectorAll('[data-social]').forEach(a=>{
      const key = a.getAttribute('data-social');
      if (key === 'maps'){
        a.href = "https://www.google.com/maps?q=" + encodeURIComponent(SITE.addressText);
        return;
      }
      const url = SITE.social?.[key];
      if (url && url !== "#" && !url.endsWith(".com/")){
        a.href = url;
      } else {
        // if not provided, hide the button to keep website clean
        a.style.display = "none";
      }
    });
  }

  // Map embed
  const mapFrame = document.getElementById('mapFrame');
  if (mapFrame && SITE.mapsEmbedUrl) mapFrame.src = SITE.mapsEmbedUrl;

  const addr = document.getElementById('addressText');
  if (addr) addr.textContent = SITE.addressText;

  // Booking form -> WhatsApp
  const form = document.getElementById('bookingForm');
  if (form){
    form.addEventListener('submit', (e)=>{
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
Notes: ${notes || "—"}

Please confirm availability and total price.`;

      const url = `https://wa.me/${SITE.whatsappNumberE164}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener');
    });
  }
})();