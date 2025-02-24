document.addEventListener("DOMContentLoaded", () => {
  const donuts = document.querySelectorAll('.donut');
  donuts.forEach(donut => {
    const percent = donut.getAttribute('data-percent') || 0;
    // Convert percent (0-100) to degrees (0-360)
    const angle = parseFloat(percent) * 3.6;
    donut.style.setProperty('--percentage', angle + 'deg');
    // Update the donut's center text
    donut.querySelector('span').textContent = percent + '%';
  });
});
