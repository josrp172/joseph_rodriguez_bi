document.addEventListener("DOMContentLoaded", () => {
 // Initialize donut skill arcs
  const donuts = document.querySelectorAll('.donut');
  donuts.forEach(donut => {
    const percent = donut.getAttribute('data-percent') || 0;
    const angle = parseFloat(percent) * 3.6;
    donut.style.setProperty('--percentage', angle + 'deg');
    donut.querySelector('span').textContent = percent + '%';
  });

  if (window.AOS) {
    AOS.init({
      duration: 800,
      once: true
    });
  }
});

document.querySelectorAll('.experience-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    gsap.to(item, {
      x: 10,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: "power1.inOut"
    });
  });
});

document.querySelectorAll('.experience-item').forEach(item => {
  const title = item.querySelector('h3');
  item.addEventListener('mouseenter', () => {
    gsap.to(title, { color: 'red', duration: 0.3 });
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(title, { color: '#004b8d', duration: 0.3 });
  });
});

// Add hover animation for company logos using GSAP
document.querySelectorAll('.timeline-company img').forEach(logo => {
  logo.addEventListener('mouseenter', () => {
    gsap.to(logo, { duration: 0.3, boxShadow: '0 0 15px 5px rgba(0,123,255,0.7)' });
  });
  logo.addEventListener('mouseleave', () => {
    gsap.to(logo, { duration: 0.3, boxShadow: 'none' });
  });
});
