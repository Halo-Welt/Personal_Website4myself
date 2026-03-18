/**
 * Chat Application - Using DeepSeek API
 * Deployed to GitHub Pages, accessible to all users without API key configuration
 */

// System prompts are now read from /prompts folder by the API

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const modeCards = document.querySelectorAll('.mode-card');
    const modeDescription = document.getElementById('mode-description');
    const chatTitle = document.getElementById('chat-title');

    // Current mode
    let currentMode = 'resume';
    let conversationHistory = [];
    let currentController = null;

    // Mode configurations
    const modeConfig = {
        resume: {
            description: 'About Liu Xinyu',
            title: 'Resume Mode',
            welcome: "Hi! I'm Liu Xinyu's AI assistant. Feel free to ask about my education, experience, or skills."
        },
        consultant: {
            description: 'Design + Engineering Expert',
            title: 'Professional Mode',
            welcome: "Hello! I'm here to help with design and engineering challenges. What would you like to explore?"
        }
    };

    // Initialize
    function init() {
        loadConversationHistory();
        if (chatMessages.children.length === 0) {
            showWelcomeMessage();
        }
        sendButton.disabled = false;
        updateModeUI();

        // Event listeners
        modeCards.forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                if (mode !== currentMode) {
                    switchMode(mode);
                }
            });
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendButton.addEventListener('click', sendMessage);
    }

    // Switch mode
    function switchMode(mode) {
        currentMode = mode;
        conversationHistory = [];
        chatMessages.innerHTML = '';
        updateModeUI();
        showWelcomeMessage();
        clearConversationHistory();
    }

    // Update mode UI
    function updateModeUI() {
        modeCards.forEach(card => {
            card.classList.toggle('active', card.dataset.mode === currentMode);
        });

        const config = modeConfig[currentMode];
        if (modeDescription) {
            modeDescription.textContent = config.description;
        }
        if (chatTitle) {
            chatTitle.textContent = config.title;
        }
    }

    // Show welcome message
    function showWelcomeMessage() {
        const config = modeConfig[currentMode];
        addMessage(config.welcome, 'ai');
    }

    // Send message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai loading';
        loadingDiv.innerHTML = '<span class="loading-dots">Thinking</span>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Build messages array (without system prompt - API will handle it)
            const messages = [
                ...conversationHistory.slice(-20), // Keep last 20 messages
                { role: 'user', content: message }
            ];

            // Call API
            const response = await fetch(CONFIG.getChatUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages, mode: currentMode })
            });

            // Remove loading
            chatMessages.removeChild(loadingDiv);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid API response format');
            }

            const aiResponse = data.choices[0].message.content;
            console.log('AI Response:', aiResponse); // Debug log

            // Add AI message with typewriter effect
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message ai typing';
            chatMessages.appendChild(aiMessageDiv);

            try {
                await typewriterEffect(aiMessageDiv, aiResponse);
            } catch (e) {
                console.error('Typewriter error:', e);
                aiMessageDiv.innerHTML = formatMarkdown(aiResponse);
            }

            // Save to history
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
            saveConversationHistory();

        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(loadingDiv);

            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai error';
            errorDiv.innerHTML = `<p>Sorry, an error occurred:</p><p>${error.message}</p>`;
            chatMessages.appendChild(errorDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (sender === 'user') {
            messageDiv.textContent = text;
        } else {
            messageDiv.innerHTML = formatMarkdown(text);
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Typewriter effect
    async function typewriterEffect(element, text, delay = 10) {
        try {
            const formattedText = formatMarkdown(text);
            element.innerHTML = '';

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formattedText;
            const plainText = tempDiv.textContent || '';

            for (let i = 0; i < plainText.length; i++) {
                element.textContent = plainText.substring(0, i + 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            element.innerHTML = formattedText;
        } catch (error) {
            console.error('Typewriter error:', error);
            element.innerHTML = formatMarkdown(text);
        }
    }

    // Format markdown
    function formatMarkdown(text) {
        return text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Local storage functions
    function saveConversationHistory() {
        const toSave = conversationHistory.slice(-50);
        localStorage.setItem('chat_conversation_' + currentMode, JSON.stringify(toSave));
    }

    function loadConversationHistory() {
        const saved = localStorage.getItem('chat_conversation_' + currentMode);
        if (saved) {
            try {
                conversationHistory = JSON.parse(saved);
                // Render saved messages
                conversationHistory.forEach(msg => {
                    addMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
                });
            } catch (e) {
                console.error('Error loading conversation history:', e);
                conversationHistory = [];
            }
        }
    }

    function clearConversationHistory() {
        localStorage.removeItem('chat_conversation_' + currentMode);
    }

    // Initialize app
    init();
});