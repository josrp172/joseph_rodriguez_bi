document.addEventListener("DOMContentLoaded", function() {
    const elements = document.querySelectorAll('.fade-in');

    function reveal() {
        elements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 100) {
                el.classList.add('show');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Run once on page load
});