document.addEventListener("DOMContentLoaded", () => {
  function updateLinkedInStatus() {
    // Get current time in UTC and convert to PHT (UTC+8)
    const now = new Date();
    const utcHour = now.getUTCHours();
    const phtHour = (utcHour + 8) % 24;

    // Select the status elements
    const statusIndicator = document.querySelector('.linkedin-status .status-indicator');
    const statusText = document.querySelector('.linkedin-status .status-text');

    // Check: if current hour is between 8pm (20) and midnight OR midnight to 6am (<6)
    if (phtHour >= 20 || phtHour < 6) {
      // Set status to online
      statusIndicator.classList.remove('offline');
      statusIndicator.classList.add('online');
      statusText.textContent = 'Online Linkedin';
    } else {
      // Set status to offline
      statusIndicator.classList.remove('online');
      statusIndicator.classList.add('offline');
      statusText.textContent = 'Offline Linkedin';
    }
  }

  // Run status update on page load and every minute in case the page remains open
  updateLinkedInStatus();
  setInterval(updateLinkedInStatus, 60000);


  /* ------------------------------ */
  /* 7. Experience Item Animations  */
  /* ------------------------------ */
  // Existing hover animations for experience items
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

  // Existing title color change on hover
  document.querySelectorAll('.experience-item').forEach(item => {
    const title = item.querySelector('h3');
    item.addEventListener('mouseenter', () => {
      gsap.to(title, { color: '#1b4dd1', duration: 0.3 });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(title, { color: '#0f1b33', duration: 0.3 });
    });
  });



gsap.timeline({
  scrollTrigger: {
    trigger: ".experience-list",  // or .experience-section if that's a wrapper
    start: "top 100%",              // Trigger when the top of the container touches the top of the viewport
    toggleActions: "play none none reverse",
    //markers: true,                // For debugging; remove when done
    onEnter: function() {
      const loaderEl = document.getElementById('loader');
      if (loaderEl) {
        gsap.to(loaderEl, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
      }
    }
  }
})
.fromTo(".tool-badge",
  { opacity: 0, scale: 0.5 },
  { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", stagger: 0.2 }
);

 document.querySelectorAll('.nav-right a').forEach(link => {
  link.addEventListener('mousemove', (e) => {
    console.log('mousemove fired on', link);
    const rect = link.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    console.log(`Magnetic effect: dx=${dx}, dy=${dy}`);

    gsap.to(link, {
      x: dx * 0.3,
      y: dy * 0.3,
      ease: "power2.out",
      duration: 0.2
    });
  });

  link.addEventListener('mouseleave', () => {
    console.log('mouseleave fired on', link);
    gsap.to(link, {
      x: 0,
      y: 0,
      ease: "power2.out",
      duration: 0.2
    });
  });
});

 const chatButton = document.querySelector(".chat-button");

  gsap.registerPlugin(Draggable);
  Draggable.create(chatButton, {
    type: "x,y",
    bounds: document.body,
    inertia: false, // Follow the mouse exactly
    onDragEnd: function() {
      // Animate back to transform (0, 0)
      gsap.to(this.target, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  });


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
    const targetId = link.getAttribute('href');
    if (targetId.startsWith('#')) {
      e.preventDefault();
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // If it's not a hash link (i.e., it's a normal URL like /news), let the browser do a full navigation.
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
    const lbl = donut.querySelector('span'); if (lbl) lbl.textContent = percent + '%';
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
  /* 11. Restore This Visitor's Chat */
  /* ------------------------------ */
  renderStoredConversation();

  /* ------------------------------ */
  /* 12. Bind Chat Input Keypress   */
  /* ------------------------------ */
  const chatInput = document.getElementById('chat-input');
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessageAndResponse();
    }
  });
  chatInput.addEventListener('input', updateChatComposer);
  document.querySelectorAll('.chat-prompt').forEach((prompt) => {
    prompt.addEventListener('click', () => selectChatPrompt(prompt));
  });
  updateChatComposer();

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
const CHAT_HISTORY_KEY = 'personaChatHistory';
const MAX_STORED_CHAT_MESSAGES = 50;
let personaChatHistory = loadStructuredChatHistory();
let isChatBusy = false;

function updateChatComposer() {
  const input = document.getElementById('chat-input');
  const composer = document.getElementById('chat-composer');
  const sendButton = document.getElementById('chat-send');
  const counter = document.getElementById('chat-char-count');
  if (!input || !composer || !sendButton || !counter) return;

  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 118)}px`;
  const length = input.value.length;
  const hasContent = Boolean(input.value.trim());
  composer.classList.toggle('has-content', length > 0);
  counter.textContent = `${length} / 1500`;
  counter.classList.toggle('is-near-limit', length >= 1350);
  sendButton.disabled = isChatBusy || !hasContent;
}

function setChatComposerState(state, message) {
  const input = document.getElementById('chat-input');
  const composer = document.getElementById('chat-composer');
  const sendButton = document.getElementById('chat-send');
  const statusText = document.getElementById('composer-status-text');
  if (!input || !composer || !sendButton || !statusText) return;

  const labels = { ready: 'Ready', thinking: 'Thinking…', responding: 'Responding…', error: 'Try again' };
  isChatBusy = state === 'thinking' || state === 'responding';
  input.disabled = isChatBusy;
  composer.classList.toggle('is-busy', isChatBusy);
  composer.classList.toggle('has-error', state === 'error');
  sendButton.classList.toggle('is-loading', isChatBusy);
  sendButton.setAttribute('aria-busy', String(isChatBusy));
  statusText.textContent = message || labels[state] || labels.ready;
  document.querySelectorAll('.chat-prompt').forEach((prompt) => {
    prompt.disabled = isChatBusy;
  });
  updateChatComposer();
}

function selectChatPrompt(prompt) {
  if (isChatBusy) return;
  const input = document.getElementById('chat-input');
  input.value = prompt.dataset.prompt || '';
  updateChatComposer();
  input.focus();
}

function loadStructuredChatHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((message) => message && ['user', 'assistant'].includes(message.role))
      .map((message) => ({
        role: message.role,
        content: String(message.content || '').slice(0, 4000),
        createdAt: message.createdAt || null
      }))
      .filter((message) => message.content)
      .slice(-MAX_STORED_CHAT_MESSAGES);
  } catch (_) {
    return [];
  }
}

function rememberChatMessage(role, content) {
  personaChatHistory.push({
    role,
    content: String(content).slice(0, 4000),
    createdAt: new Date().toISOString()
  });
  personaChatHistory = personaChatHistory.slice(-MAX_STORED_CHAT_MESSAGES);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(personaChatHistory));
}

function createStoredChatMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');

  if (message.role === 'user') {
    messageElement.classList.add('user-message');
    messageElement.textContent = message.content;
    return messageElement;
  }

  messageElement.classList.add('bot-message');
  const avatar = document.createElement('img');
  avatar.src = '/static/images/profile.jpg';
  avatar.alt = 'Bot Avatar';
  avatar.classList.add('bot-avatar');
  const content = document.createElement('span');
  renderChatMarkdown(content, message.content);
  messageElement.append(avatar, content);
  return messageElement;
}

function renderStoredConversation() {
  const chatBody = document.querySelector('.chatbox-body');
  if (!chatBody) return;

  chatBody.replaceChildren();
  chatBody.appendChild(createStoredChatMessage({
    role: 'assistant',
    content: 'Hello! Ask me anything about Joseph\'s work, experience, or background.'
  }));
  personaChatHistory.forEach((message) => {
    chatBody.appendChild(createStoredChatMessage(message));
  });
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderChatMarkdown(container, markdown) {
  const source = String(markdown || '');
  if (!window.marked || typeof window.marked.parse !== 'function') {
    container.textContent = source;
    return;
  }

  const template = document.createElement('template');
  template.innerHTML = window.marked.parse(source, {
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  });

  const allowedTags = new Set([
    'A', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H1', 'H2', 'H3',
    'H4', 'H5', 'H6', 'HR', 'LI', 'OL', 'P', 'PRE', 'STRONG', 'UL'
  ]);
  const dangerousTags = new Set(['IFRAME', 'OBJECT', 'SCRIPT', 'STYLE', 'SVG', 'MATH']);

  [...template.content.querySelectorAll('*')].forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      if (dangerousTags.has(element.tagName)) {
        element.remove();
      } else {
        element.replaceWith(...element.childNodes);
      }
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const isLinkAttribute = element.tagName === 'A' && ['href', 'title'].includes(attribute.name);
      if (!isLinkAttribute) element.removeAttribute(attribute.name);
    });

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^(https?:|mailto:)/i.test(href)) {
        element.removeAttribute('href');
      } else {
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
      }
    }
  });

  container.classList.add('chat-markdown');
  container.replaceChildren(template.content.cloneNode(true));
}

function typeChatMarkdown(container, markdown, { onProgress, onComplete } = {}) {
  renderChatMarkdown(container, markdown);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (onComplete) onComplete();
    return;
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const parts = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue) parts.push({ node, text: node.nodeValue, revealed: false });
  }

  const totalCharacters = parts.reduce((total, part) => total + part.text.length, 0);
  if (!totalCharacters) {
    if (onComplete) onComplete();
    return;
  }

  const revealableSelector = 'p, li, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre, hr';
  container.querySelectorAll(revealableSelector).forEach((element) => {
    element.classList.add('chat-pending');
  });
  parts.forEach((part) => { part.node.nodeValue = ''; });
  container.classList.add('is-typing');
  container.setAttribute('aria-busy', 'true');

  const charactersPerSecond = 70;
  let startedAt;
  let revealed = 0;
  let partIndex = 0;
  let partOffset = 0;

  function revealFrame(timestamp) {
    if (!startedAt) startedAt = timestamp;
    const target = Math.min(
      totalCharacters,
      Math.max(1, Math.floor(((timestamp - startedAt) / 1000) * charactersPerSecond))
    );
    let remaining = target - revealed;

    while (remaining > 0 && partIndex < parts.length) {
      const part = parts[partIndex];
      const count = Math.min(remaining, part.text.length - partOffset);
      if (count > 0 && !part.revealed && part.text.trim()) {
        let parent = part.node.parentElement;
        while (parent && parent !== container) {
          parent.classList.remove('chat-pending');
          parent = parent.parentElement;
        }
        part.revealed = true;
      }
      part.node.nodeValue += part.text.slice(partOffset, partOffset + count);
      partOffset += count;
      revealed += count;
      remaining -= count;
      if (partOffset === part.text.length) {
        partIndex += 1;
        partOffset = 0;
      }
    }

    if (onProgress) onProgress();
    if (revealed < totalCharacters) {
      requestAnimationFrame(revealFrame);
    } else {
      container.querySelectorAll('.chat-pending').forEach((element) => {
        element.classList.remove('chat-pending');
      });
      container.classList.remove('is-typing');
      container.removeAttribute('aria-busy');
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(revealFrame);
}

function toggleChat() {
  const chatbox = document.getElementById('chatbox');
  const launcher = document.querySelector('.chat-button');
  if (chatbox.style.display === 'flex') {
    closeChat();
  } else {
    chatbox.style.display = 'flex';
    chatbox.setAttribute('aria-hidden', 'false');
    if (launcher) launcher.setAttribute('aria-expanded', 'true');
    renderStoredConversation();
    setTimeout(() => document.getElementById('chat-input')?.focus(), 180);
  }
}

function closeChat() {
  const chatbox = document.getElementById('chatbox');
  const launcher = document.querySelector('.chat-button');
  chatbox.style.display = 'none';
  chatbox.setAttribute('aria-hidden', 'true');
  if (launcher) launcher.setAttribute('aria-expanded', 'false');
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message) {
    const chatBody = document.querySelector('.chatbox-body');
    const userMsgDiv = document.createElement('div');
    userMsgDiv.classList.add('chat-message', 'user-message');
    userMsgDiv.textContent = message;
    chatBody.appendChild(userMsgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
    rememberChatMessage('user', message);
    updateChatComposer();
  }
}

async function sendMessageAndResponse() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message || isChatBusy) return;
  const chatBody = document.querySelector('.chatbox-body');
  setChatComposerState('thinking');

  // Append user's message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.classList.add('chat-message', 'user-message');
  userMsgDiv.textContent = message;
  chatBody.appendChild(userMsgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  input.value = '';
  updateChatComposer();
  const priorHistory = personaChatHistory.slice(-6).map(({ role, content }) => ({ role, content }));
  rememberChatMessage('user', message);

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

  // Animated three-dot typing indicator
  botTextSpan.className = 'chat-typing';
  botTextSpan.innerHTML = '<i></i><i></i><i></i>';

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: priorHistory })
    });
    const data = await response.json();

    if (!response.ok || !data.response) {
      throw new Error(data.error || 'The AI persona could not answer right now.');
    }

    const finalResponse = data.response;
    rememberChatMessage('assistant', finalResponse);
    setChatComposerState('responding');
    botTextSpan.className = '';
    botTextSpan.innerHTML = '';
    let lastAutoScroll = 0;
    typeChatMarkdown(botTextSpan, finalResponse, {
      onProgress: () => {
        const now = Date.now();
        if (now - lastAutoScroll >= 80) {
          chatBody.scrollTop = chatBody.scrollHeight;
          lastAutoScroll = now;
        }
      },
      onComplete: () => {
        chatBody.scrollTop = chatBody.scrollHeight;
        setChatComposerState('ready');
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    botTextSpan.className = '';
    botTextSpan.textContent = error.message || "An error occurred. Please try again later.";
    setChatComposerState('error');
    setTimeout(() => setChatComposerState('ready'), 2800);
  }
}

function clearPersonaChat() {
  if (!confirm('Clear this conversation and start fresh?')) return;
  personaChatHistory = [];
  localStorage.removeItem(CHAT_HISTORY_KEY);
  renderStoredConversation();
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
  gsap.fromTo("#project-modal .modal-content",
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
  );

  const title = card.getAttribute('data-title') || "Project Title";
  // Get the full HTML content from data-description without additional replacements
  const description = card.getAttribute('data-description') || "Full project details here.";
  const imageSrc = card.getAttribute('data-image') || card.querySelector('img').src;

  // Populate the modal elements
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-description').innerHTML = description;
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







