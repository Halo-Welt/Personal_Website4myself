document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const API_URL = 'http://localhost:3000/api/chat';
    
    let conversationHistory = [];
    let isServerConnected = false;
    let retryCount = 0;
    const maxRetries = 5;

    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Send message on Enter (but allow Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    async function startServer() {
        try {
            // 尝试启动服务器
            const response = await fetch('http://localhost:3000/start-server', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Server started successfully');
                return true;
            }
        } catch (error) {
            console.log('Server not running, attempting to start...');
        }

        try {
            // 如果服务器没有响应，尝试通过 pm2 启动
            const startResponse = await fetch('http://localhost:3000/');
            if (startResponse.ok) {
                console.log('Server is now running');
                return true;
            }
        } catch (error) {
            console.error('Failed to start server:', error);
            return false;
        }
    }

    async function checkServerConnection() {
        try {
            const response = await fetch('http://localhost:3000/');
            isServerConnected = response.ok;
            if (!isServerConnected && retryCount < maxRetries) {
                retryCount++;
                console.log(`Attempting to start server (attempt ${retryCount}/${maxRetries})...`);
                await startServer();
                // 等待服务器启动
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkServerConnection();
            }
            
            if (!isServerConnected) {
                addMessage("Error: Cannot connect to chat server. Please refresh the page or contact support.", 'ai');
                sendButton.disabled = true;
            } else {
                sendButton.disabled = false;
                retryCount = 0; // 重置重试计数
            }
        } catch (error) {
            console.error('Server connection error:', error);
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying connection (attempt ${retryCount}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkServerConnection();
            }
            isServerConnected = false;
            addMessage("Error: Cannot connect to chat server. Please refresh the page or contact support.", 'ai');
            sendButton.disabled = true;
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Update conversation history
        conversationHistory.push({
            role: 'user',
            content: message
        });

        // Show loading state
        sendButton.disabled = true;
        const loadingDots = document.createElement('div');
        loadingDots.classList.add('message', 'ai', 'loading');
        loadingDots.textContent = 'Thinking...';
        chatMessages.appendChild(loadingDots);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 如果服务器未连接，尝试重新连接
            if (!isServerConnected) {
                await checkServerConnection();
                if (!isServerConnected) {
                    throw new Error('Server is not available');
                }
            }

            console.log('Sending request to server with messages:', conversationHistory);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant with expertise in design and engineering. You should provide concise, accurate, and helpful responses.'
                        },
                        ...conversationHistory
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Server response:', data);

            loadingDots.remove();
            
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from API');
            }

            // Add AI response
            const aiResponse = data.choices[0].message.content;
            addMessage(aiResponse, 'ai');

            // Update conversation history
            conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            // Keep conversation history at a reasonable length
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }

        } catch (error) {
            console.error('Error in sendMessage:', error);
            loadingDots.remove();
            addMessage(`Error: ${error.message}. Please try again.`, 'ai');
            // 如果是服务器错误，尝试重新连接
            if (error.message.includes('Server error') || error.message.includes('Failed to fetch')) {
                isServerConnected = false;
                await checkServerConnection();
            }
        } finally {
            sendButton.disabled = false;
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        // Support for markdown-style code blocks
        if (text.includes('```')) {
            const formattedText = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            messageDiv.innerHTML = formattedText;
        } else {
            messageDiv.textContent = text;
        }
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Initial server check and startup
    checkServerConnection().then(() => {
        if (isServerConnected) {
            addMessage("Hello! I'm your AI assistant powered by DeepSeek. I specialize in design and engineering. How can I help you today?", 'ai');
        }
    });

    // 定期检查服务器连接状态
    setInterval(async () => {
        if (!isServerConnected) {
            await checkServerConnection();
        }
    }, 30000); // 每30秒检查一次
}); 