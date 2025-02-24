document.addEventListener("DOMContentLoaded", () => {
  // Existing donut code
  const donuts = document.querySelectorAll('.donut');
  donuts.forEach(donut => {
    const percent = donut.getAttribute('data-percent') || 0;
    const angle = parseFloat(percent) * 3.6;
    donut.style.setProperty('--percentage', angle + 'deg');
    donut.querySelector('span').textContent = percent + '%';
  });

 // Initialize Typed.js for the banner text
  if (window.Typed) {
    new Typed('#typed-roles', {
      strings: [
        'BI Developer',
        'RPA Developer',
        'Full Stack Developer'
      ],
      typeSpeed: 70,
      backSpeed: 50,
      backDelay: 1500,
      startDelay: 500,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      preStringTyped: function(arrayPos, self) {
        // Map each string to a specific color
        const colors = ['red', 'green', 'blue'];
        const typedEl = document.querySelector('#typed-roles');
        typedEl.style.color = colors[arrayPos] || '#000';
      }
    });
  }
});