document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const API_URL = 'http://localhost:3000/api/chat';  // 保持使用本地服务器作为代理
    
    let conversationHistory = [];
    let isServerConnected = false;
    let retryCount = 0;
    let currentController = null; // 用于中止请求的 AbortController
    const maxRetries = 3;  // 减少重试次数，避免过多等待

    // 自动调整文本框高度
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 回车发送消息（Shift+Enter换行）
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // 检查是否正在使用输入法
            if (e.isComposing || e.keyCode === 229) {
                return; // 如果是输入法正在输入，不处理回车键
            }
            e.preventDefault();
            sendMessage();
        }
    });

    // 添加 compositionend 事件监听器
    chatInput.addEventListener('compositionend', (e) => {
        // 输入法输入完成后，如果按下了回车键，则发送消息
        if (e.data && chatInput.value.trim() !== '') {
            const lastChar = e.data[e.data.length - 1];
            if (lastChar === '\n') {
                sendMessage();
            }
        }
    });

    // 点击发送/停止按钮
    sendButton.addEventListener('click', () => {
        if (currentController) {
            // 如果正在进行对话，则中止
            abortCurrentConversation();
        } else {
            // 否则发送新消息
            sendMessage();
        }
    });

    // 尝试启动服务器
    async function startServer() {
        try {
            const response = await fetch('http://localhost:3000/start-server', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('服务器启动成功');
                return true;
            }
            return false;
        } catch (error) {
            console.error('启动服务器失败:', error);
            return false;
        }
    }

    // 检查服务器连接状态
    async function checkServerConnection() {
        try {
            const response = await fetch('http://localhost:3000/');
            isServerConnected = response.ok;
            
            if (!isServerConnected && retryCount < maxRetries) {
                retryCount++;
                console.log(`正在尝试启动服务器 (第 ${retryCount}/${maxRetries} 次)...`);
                
                // 尝试启动服务器
                const serverStarted = await startServer();
                if (serverStarted) {
                    // 等待服务器完全启动
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return checkServerConnection();
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                return checkServerConnection();
            }
            
            if (!isServerConnected) {
                addMessage("提示：正在尝试启动聊天服务器，请稍候...", 'ai');
                sendButton.disabled = true;
            } else {
                sendButton.disabled = false;
                retryCount = 0;
            }
        } catch (error) {
            console.error('服务器连接错误:', error);
            isServerConnected = false;
            addMessage("提示：正在尝试启动聊天服务器，请稍候...", 'ai');
            
            // 尝试启动服务器
            const serverStarted = await startServer();
            if (serverStarted) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkServerConnection();
            }
            
            sendButton.disabled = true;
        }
    }

    // 更新发送按钮状态
    function updateSendButton(isThinking) {
        if (isThinking) {
            sendButton.classList.add('stop');
            sendButton.title = '点击停止对话';
        } else {
            sendButton.classList.remove('stop');
            sendButton.title = '发送消息';
        }
    }

    // 中止当前对话
    function abortCurrentConversation() {
        if (currentController) {
            updateSendButton(false);  // 立即更新按钮状态
            currentController.abort();
            currentController = null;
            return true;
        }
        return false;
    }

    // 模拟打字机效果的函数
    async function typewriterEffect(messageDiv, text, delay = 30) {
        let currentText = '';
        const chars = text.split('');
        
        for (const char of chars) {
            if (currentController === null) {
                // 如果对话被中止，停止打字效果
                return;
            }
            
            currentText += char;
            
            // 支持markdown代码块
            if (currentText.includes('```')) {
                const formattedText = currentText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
                messageDiv.innerHTML = formattedText;
            } else {
                messageDiv.textContent = currentText;
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 更新对话历史
        conversationHistory.push({
            role: 'user',
            content: message
        });

        // 创建思考中的消息
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ai', 'loading');
        loadingDiv.textContent = '思考中...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 检查服务器连接
            if (!isServerConnected) {
                await checkServerConnection();
                if (!isServerConnected) {
                    throw new Error('本地服务器未启动，请先运行 npm start');
                }
            }

            // 创建新的 AbortController 并立即更新按钮状态
            currentController = new AbortController();
            updateSendButton(true);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `你是一位在设计学和工程学领域有着深厚造诣的专家。你具备以下特点：

1. 设计专长：
- 精通用户体验（UX）和用户界面（UI）设计
- 熟悉现代设计趋势和最佳实践
- 擅长从美学和功能性的角度进行设计评估
- 了解各类设计工具和设计系统

2. 工程专长：
- 深入理解软件工程原理和架构设计
- 熟悉各种编程语言和技术栈
- 擅长解决复杂的工程问题
- 注重代码质量和系统性能

3. 沟通风格：
- 使用专业但易懂的语言
- 给出具体和可操作的建议
- 结合理论和实践经验
- 提供全面的分析和多角度的思考
- 能够使用表格、SVG等多种形式进行输出

请以专业、友好的方式回答问题，并在适当时结合实例说明。`
                        },
                        ...conversationHistory
                    ]
                }),
                signal: currentController.signal
            });

            // 如果对话已被中止，直接返回
            if (currentController === null) {
                loadingDiv.remove();
                return;
            }

            if (!response.ok) {
                throw new Error('API请求失败，请检查服务器状态');
            }

            const data = await response.json();
            
            // 如果对话已被中止，不显示响应
            if (currentController === null) {
                loadingDiv.remove();
                return;
            }
            
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('API响应格式无效');
            }

            // 创建AI消息容器
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.classList.add('message', 'ai', 'typing');
            chatMessages.appendChild(aiMessageDiv);
            
            // 移除加载消息
            loadingDiv.remove();

            // 使用打字机效果显示消息
            const aiResponse = data.choices[0].message.content;
            await typewriterEffect(aiMessageDiv, aiResponse);
            
            // 完成输出后移除打字效果
            aiMessageDiv.classList.remove('typing');

            // 更新对话历史
            conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            // 保持对话历史在合理长度
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }

        } catch (error) {
            console.error('发送消息时出错:', error);
            loadingDiv.remove();
            if (error.name === 'AbortError') {
                addMessage('对话已中止', 'ai');
            } else {
                addMessage(`错误: ${error.message}`, 'ai');
            }
        } finally {
            currentController = null;
            updateSendButton(false);
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        // 支持markdown代码块
        if (text.includes('```')) {
            const formattedText = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            messageDiv.innerHTML = formattedText;
        } else {
            messageDiv.textContent = text;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 初始检查服务器状态
    checkServerConnection().then(() => {
        if (isServerConnected) {
            addMessage("你好！我是一位专注于设计学和工程学的AI专家。我可以：\n\n" + 
                      "🎨 帮你解决设计相关问题（UI/UX、视觉设计、设计系统等）\n" +
                      "🔧 协助处理工程技术难题（架构设计、代码优化、性能提升等）\n" +
                      "💡 提供专业的建议和创新思路\n\n" +
                      "请告诉我你遇到了什么问题，我很乐意帮助你！", 'ai');
        }
    });

    // 定期检查服务器连接状态（每60秒）
    setInterval(async () => {
        if (!isServerConnected) {
            await checkServerConnection();
        }
    }, 60000);
}); 