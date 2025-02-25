document.addEventListener("DOMContentLoaded", () => {
  // Clear any saved chat context on a fresh load
  localStorage.removeItem('chatContext');




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


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.highlight').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        // Append a regular space text node
        el.appendChild(document.createTextNode(' '));
      } else {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${i * 0.1}s`;
        el.appendChild(span);
      }
    }
  });
});

// Function to toggle the chatbox visibility
function toggleChat() {
  const chatbox = document.getElementById('chatbox');
  if (chatbox.style.display === 'block') {
    chatbox.style.display = 'none';
  } else {
    chatbox.style.display = 'flex';
    // Optionally load saved conversation context when opening the chat
    loadChatContext();
  }
}

function closeChat() {
  const chatbox = document.getElementById('chatbox');
  chatbox.style.display = 'none';
}

// Example "Send" button handler
function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message) {
    // For now, just log the message or display in chat
    const chatBody = document.querySelector('.chatbox-body');
    const userMsgDiv = document.createElement('div');
    userMsgDiv.classList.add('chat-message');
    userMsgDiv.textContent = message;
    chatBody.appendChild(userMsgDiv);

    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Clear input
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

  // Clear the input field
  input.value = '';

  // Append a temporary bot message with avatar and loading text
  const botMsgDiv = document.createElement('div');
  botMsgDiv.classList.add('chat-message', 'bot-message');

  const botAvatar = document.createElement('img');
  botAvatar.src = '/static/images/profile.jpg'; // Use your profile pic as bot avatar
  botAvatar.alt = 'Bot Avatar';
  botAvatar.classList.add('bot-avatar');

  const botTextSpan = document.createElement('span');
  botTextSpan.textContent = "Joseph is typing..."; // Updated loading text

  botMsgDiv.appendChild(botAvatar);
  botMsgDiv.appendChild(botTextSpan);
  chatBody.appendChild(botMsgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    if (response.ok) {
      // Convert Markdown to HTML and set innerHTML to parse bold, italic, lists, etc.
      botTextSpan.innerHTML = marked.parse(data.response);
    } else {
      botTextSpan.textContent = "Error: " + data.error;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    botTextSpan.textContent = "An error occurred. Please try again later.";
  }

  // Save conversation context to localStorage
  saveChatContext();
}


// Save the chat conversation to localStorage
function saveChatContext() {
  const chatBody = document.querySelector('.chatbox-body');
  localStorage.setItem('chatContext', chatBody.innerHTML);
}

// Load the saved chat conversation from localStorage
function loadChatContext() {
  const savedContext = localStorage.getItem('chatContext');
  if (savedContext) {
    document.querySelector('.chatbox-body').innerHTML = savedContext;
  }
}

// Restore chat context on page load
document.addEventListener("DOMContentLoaded", () => {
  // Your existing DOMContentLoaded code (e.g., for donut skill arcs, etc.)
  // ...

  // Load chat context if any
  loadChatContext();
});

// Optionally, bind the sendMessageAndResponse() function to a form submit event or keypress event.
document.getElementById('chat-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessageAndResponse();
  }
});
