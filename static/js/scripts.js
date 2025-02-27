document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------ */
  /* 1. Clear Chat Context          */
  /* ------------------------------ */
  localStorage.removeItem('chatContext');


// Make sure the "typed-about" element is empty before starting
// Ensure the container is empty
document.getElementById('typed-about').innerHTML = "";

new Typed('#typed-about', {
  strings: [
    "Experienced IT professional specializing in <span class='highlight'>Business Intelligence</span>, <span class='highlight'>Data Analysis</span>, <span class='highlight'>RPA</span>, and <span class='highlight'>Full Stack Development</span>. Skilled in migrating and optimizing reports using Tableau and Power BI, creating intricate dashboards tailored to specific requirements. Proficient in crafting interactive PowerApps solutions for user-friendly interfaces and seamless experiences. Collaborative and results‑oriented, I translate complex data sets into actionable insights for key stakeholders."
  ],
  typeSpeed: 0.5,
  startDelay: 100,
  showCursor: true,
  cursorChar: '|',
  loop: false,
  contentType: 'html'
});


const filterButtons = document.querySelectorAll('#project-filters .filter-btn');
const projectCards = document.querySelectorAll('.projects-grid .project-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons and add to the clicked one
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filterValue = button.getAttribute('data-filter').toLowerCase();

    projectCards.forEach(card => {
      // If a previous animation timeout exists, clear it
      if (card.animationTimeout) {
        clearTimeout(card.animationTimeout);
        card.animationTimeout = null;
      }

      // Remove any existing animation classes so we start fresh
      card.classList.remove('fade-in', 'fade-out');

      const cardCategory = card.getAttribute('data-category').toLowerCase();

      if (filterValue === 'all' || cardCategory === filterValue) {
        // Show the card (reset inline display) and add fade-in
        card.style.display = '';
        card.classList.add('fade-in');
        // Remove fade-in after animation completes (500ms)
        card.animationTimeout = setTimeout(() => {
          card.classList.remove('fade-in');
          card.animationTimeout = null;
        }, 500);
      } else {
        // Add fade-out animation to hide the card
        card.classList.add('fade-out');
        card.animationTimeout = setTimeout(() => {
          card.style.display = 'none';
          card.classList.remove('fade-out');
          card.animationTimeout = null;
        }, 500);
      }
    });
  });
});

  /* ------------------------------ */
  /* 2. Navigation Smooth Scroll    */
  /* ------------------------------ */
  const navLinks = document.querySelectorAll('.nav-right a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ------------------------------ */
  /* 3. Navigation Typing Effect    */
  /* ------------------------------ */
  const navText = document.querySelector('.nav-text');
  const fullName = "Joseph Rodriguez";
  const shortName = "JR";
  let typingTimeout;
  navText.parentElement.addEventListener('mouseenter', () => {
    clearTimeout(typingTimeout);
    navText.textContent = "";
    let i = 0;
    function type() {
      if (i < fullName.length) {
        navText.textContent += fullName[i];
        i++;
        typingTimeout = setTimeout(type, 100); // adjust speed
      }
    }
    type();
  });
  navText.parentElement.addEventListener('mouseleave', () => {
    clearTimeout(typingTimeout);
    navText.textContent = shortName;
  });



  /* ------------------------------ */
  /* 4. Donut Skill Arcs Init       */
  /* ------------------------------ */
  const donuts = document.querySelectorAll('.donut');
  donuts.forEach(donut => {
    const percent = donut.getAttribute('data-percent') || 0;
    const angle = parseFloat(percent) * 3.6;
    donut.style.setProperty('--percentage', angle + 'deg');
    donut.querySelector('span').textContent = percent + '%';
  });

  /* ------------------------------ */
  /* 5. Initialize AOS             */
  /* ------------------------------ */
  if (window.AOS) {
    AOS.init({
      duration: 800,
      once: true
    });
  }

// Animate the 1-5 rating indicators for Technical Skills sequentially
document.querySelectorAll('.progress-rating').forEach(rating => {
  const level = parseInt(rating.getAttribute('data-level'));
  const segments = rating.querySelectorAll('.segment');
  segments.forEach((segment, index) => {
    if (index < level) {
      setTimeout(() => {
        segment.classList.add('filled');
      }, index * 300); // 300ms delay between each segment fill
    }
  });
});

  document.querySelectorAll('.progress-rating').forEach(rating => {
  const level = parseInt(rating.getAttribute('data-level'));
  let labelText = '';
  switch(level) {
    case 1: labelText = 'Beginner'; break;
    case 2: labelText = 'Novice'; break;
    case 3: labelText = 'Intermediate'; break;
    case 4: labelText = 'Advanced'; break;
    case 5: labelText = 'Expert'; break;
    default: labelText = '';
  }
  const labelEl = rating.parentElement.querySelector('.rating-label');
  if (labelEl) {
    labelEl.textContent = labelText;
  }
});

  /* ------------------------------ */
  /* 7. Experience Item Animations  */
  /* ------------------------------ */
  // Shake effect on hover (using GSAP)
  document.querySelectorAll('.experience-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        x: 5,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });
    });
  });

  // Change title color on hover (using GSAP)
  document.querySelectorAll('.experience-item').forEach(item => {
    const title = item.querySelector('h3');
    item.addEventListener('mouseenter', () => {
      gsap.to(title, { color: 'red', duration: 0.3 });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(title, { color: '#004b8d', duration: 0.3 });
    });
  });

  /* ------------------------------ */
  /* 8. Timeline Company Logos Hover */
  /* ------------------------------ */
  document.querySelectorAll('.timeline-company img').forEach(logo => {
    logo.addEventListener('mouseenter', () => {
      gsap.to(logo, { duration: 0.3, boxShadow: '0 0 15px 5px rgba(0,123,255,0.7)' });
    });
    logo.addEventListener('mouseleave', () => {
      gsap.to(logo, { duration: 0.3, boxShadow: 'none' });
    });
  });

  /* ------------------------------ */
  /* 9. Highlight Text Effect       */
  /* ------------------------------ */
  document.querySelectorAll('.highlight').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        el.appendChild(document.createTextNode(' '));
      } else {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${i * 0.1}s`;
        el.appendChild(span);
      }
    }
  });

  /* ------------------------------ */
  /* 10. Attach Project Modal Events */
  /* ------------------------------ */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      openProjectModal(card);
    });
  });
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) {
      closeProjectModal();
    }
  });

  /* ------------------------------ */
  /* 11. Load Chat Context          */
  /* ------------------------------ */
  loadChatContext();

  /* ------------------------------ */
  /* 12. Bind Chat Input Keypress   */
  /* ------------------------------ */
  document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessageAndResponse();
    }
  });

 /* ---------- Magical Wand Swirl Effect (No Images) ---------- */
  const banner = document.getElementById('banner');

  banner.addEventListener('mousemove', (e) => {
    // Get banner bounding box and mouse coords relative to banner
    const rect = banner.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a swirl spark
    const spark = document.createElement('div');
    spark.classList.add('laser-spark');
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;

    banner.appendChild(spark);

    // Animate the spark using GSAP
    // - Start from a random rotation and scale(0)
    // - Expand to scale ~1.5, fade out, rotate more for a swirl
    gsap.fromTo(spark,
      {
        scale: 0,
        rotation: Math.random() * 360
      },
      {
        duration: 0.6,
        scale: 1.5,
        opacity: 0,
        rotation: `+=${180 + Math.random() * 180}`,
        ease: "power2.out",
        onComplete: () => spark.remove()
      }
    );


  });





});

/* ======================================== */
/*         Chatbox & Messaging Functions    */
/* ======================================== */
function toggleChat() {
  const chatbox = document.getElementById('chatbox');
  if (chatbox.style.display === 'block') {
    chatbox.style.display = 'none';
  } else {
    chatbox.style.display = 'flex';
    loadChatContext();
  }
}

function closeChat() {
  const chatbox = document.getElementById('chatbox');
  chatbox.style.display = 'none';
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message) {
    const chatBody = document.querySelector('.chatbox-body');
    const userMsgDiv = document.createElement('div');
    userMsgDiv.classList.add('chat-message');
    userMsgDiv.textContent = message;
    chatBody.appendChild(userMsgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
  }
}

async function sendMessageAndResponse() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  const chatBody = document.querySelector('.chatbox-body');

  // Append user's message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.classList.add('chat-message', 'user-message');
  userMsgDiv.textContent = message;
  chatBody.appendChild(userMsgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  input.value = '';

  // Append temporary bot message with typing indicator
  const botMsgDiv = document.createElement('div');
  botMsgDiv.classList.add('chat-message', 'bot-message');
  const botAvatar = document.createElement('img');
  botAvatar.src = '/static/images/profile.jpg';
  botAvatar.alt = 'Bot Avatar';
  botAvatar.classList.add('bot-avatar');
  const botTextSpan = document.createElement('span');
  botMsgDiv.appendChild(botAvatar);
  botMsgDiv.appendChild(botTextSpan);
  chatBody.appendChild(botMsgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Simulate "Joseph is typing" with a cycling ellipsis
  const baseText = "Joseph is typing";
  botTextSpan.textContent = baseText;
  let dotCount = 0;
  const typingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 5; // cycles through 0 to 4 dots
    botTextSpan.textContent = baseText + ".".repeat(dotCount);
  }, 500);

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    clearInterval(typingInterval);

    // Use the raw response text (non-HTML) for display
    const finalResponse = data.response;
    console.log("Final plain text response:", finalResponse);
    botTextSpan.textContent = ""; // Clear the typing indicator

    // Typewriter effect for the plain text response
    let index = 0;
    function typeLetter() {
      if (index < finalResponse.length) {
        botTextSpan.textContent = finalResponse.substring(0, index + 1);
        index++;
        setTimeout(typeLetter, 30); // Adjust the speed (ms) as desired
      }
    }
    typeLetter();
  } catch (error) {
    clearInterval(typingInterval);
    console.error("Error sending message:", error);
    botTextSpan.textContent = "An error occurred. Please try again later.";
  }
  saveChatContext();
}


function saveChatContext() {
  const chatBody = document.querySelector('.chatbox-body');
  localStorage.setItem('chatContext', chatBody.innerHTML);
}

function loadChatContext() {
  const savedContext = localStorage.getItem('chatContext');
  if (savedContext) {
    document.querySelector('.chatbox-body').innerHTML = savedContext;
  }
}

/* ======================================== */
/*    Experience "See More" Toggle Function */
/* ======================================== */
function toggleExtra(button) {
  const experienceDetails = button.closest('.experience-details');
  const extraContent = experienceDetails.querySelector('.experience-extra');
  if (!extraContent) return;
  const currentDisplay = window.getComputedStyle(extraContent).display;
  if (currentDisplay === 'none') {
    extraContent.style.display = 'block';
    button.textContent = 'see less...';
  } else {
    extraContent.style.display = 'none';
    button.textContent = 'see more...';
  }
}

/* ======================================== */
/*         Project Modal Functions          */
/* ======================================== */
function openProjectModal(card) {
  const title = card.getAttribute('data-title') || "Project Title";
  const description = card.getAttribute('data-description') || "Full project details here.";
  const imageSrc = card.getAttribute('data-image') || card.querySelector('img').src;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-description').textContent = description;
  document.getElementById('modal-image').src = imageSrc;
  document.getElementById('project-modal').style.display = "block";
}

function closeProjectModal() {
  document.getElementById('project-modal').style.display = "none";
}

///
 const sections = ['#banner', '#experience', '#projects', '#contact'];
  const navLinks = document.querySelectorAll('.nav-right a');

  function setActiveLink(hash) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // For Home (#banner), only mark it active if nearly fully visible
      if (entry.target.id === 'banner') {
        if (entry.intersectionRatio >= 0.8) {
          setActiveLink('#banner');
        } else if (window.scrollY > 100) {
          // If we've scrolled away from the banner, remove its active state
          setActiveLink('');
        }
      } else {
        if (entry.isIntersecting) {
          setActiveLink('#' + entry.target.id);
        }
      }
    });
  }, { threshold: [0.8, 0.6] }); // Use a higher threshold for Home

  sections.forEach(selector => {
    const sec = document.querySelector(selector);
    if (sec) observer.observe(sec);
  });

  // Keyframe animation for particle fading
const style = document.createElement("style");
style.innerHTML = `
  @keyframes particle-fade {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;
document.head.appendChild(style);