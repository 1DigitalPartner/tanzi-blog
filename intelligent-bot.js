/**
 * TanziTech Intelligent Bot System
 * Smart chatbot that guides visitors based on their interests and membership level
 */

class TanziBot {
    constructor() {
        this.isOpen = false;
        this.currentFlow = null;
        this.userContext = {
            isLoggedIn: false,
            membershipTier: 'free',
            interests: [],
            currentPage: null,
            hasDownloaded: false
        };
        this.conversationHistory = [];
        
        // Bot personality and responses
        this.personality = {
            name: "TanziBot",
            role: "Social Media Intelligence Assistant",
            tone: "friendly, helpful, data-driven",
            expertise: ["social media strategy", "AI technology", "data analysis", "lead generation", "content marketing"]
        };
        
        this.init();
    }

    init() {
        this.createBotUI();
        this.loadConversationFlows();
        this.updateUserContext();
        this.setupEventListeners();
        
        // Show welcome message after a delay
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 3000);
    }

    createBotUI() {
        const botHTML = `
            <div id="tanzi-bot" class="tanzi-bot">
                <!-- Bot Toggle Button -->
                <div id="bot-toggle" class="bot-toggle" onclick="window.tanziBot.toggleBot()">
                    <div class="bot-avatar">
                        <span class="bot-emoji">🤖</span>
                        <div class="bot-pulse"></div>
                    </div>
                    <div class="bot-notification" id="bot-notification" style="display: none;">
                        <span>I can help you! 👋</span>
                    </div>
                </div>

                <!-- Bot Chat Interface -->
                <div id="bot-chat" class="bot-chat" style="display: none;">
                    <div class="bot-header">
                        <div class="bot-info">
                            <div class="bot-avatar-small">🤖</div>
                            <div class="bot-details">
                                <div class="bot-name">TanziBot</div>
                                <div class="bot-status">
                                    <span class="status-dot"></span>
                                    <span>Online - Ready to help!</span>
                                </div>
                            </div>
                        </div>
                        <button class="bot-close" onclick="window.tanziBot.toggleBot()">×</button>
                    </div>
                    
                    <div class="bot-messages" id="bot-messages">
                        <!-- Messages will be inserted here -->
                    </div>
                    
                    <div class="bot-suggestions" id="bot-suggestions">
                        <!-- Quick action buttons will be inserted here -->
                    </div>
                    
                    <div class="bot-input">
                        <input type="text" id="bot-input-field" placeholder="Ask me anything about social media strategy..." 
                               onkeypress="if(event.key==='Enter') window.tanziBot.sendMessage()">
                        <button onclick="window.tanziBot.sendMessage()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', botHTML);
        this.injectBotCSS();
    }

    injectBotCSS() {
        const botCSS = `
            .tanzi-bot {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .bot-toggle {
                position: relative;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
            }

            .bot-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
            }

            .bot-avatar {
                position: relative;
                font-size: 1.5rem;
                animation: botBounce 2s ease-in-out infinite;
            }

            .bot-pulse {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 15px;
                height: 15px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s ease-in-out infinite;
            }

            .bot-notification {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: white;
                color: #333;
                padding: 12px 16px;
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                white-space: nowrap;
                font-weight: 500;
                font-size: 0.9rem;
                animation: slideInUp 0.5s ease-out;
            }

            .bot-notification::after {
                content: '';
                position: absolute;
                top: 100%;
                right: 20px;
                border: 8px solid transparent;
                border-top-color: white;
            }

            .bot-chat {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideInUp 0.3s ease-out;
            }

            .bot-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .bot-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .bot-avatar-small {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }

            .bot-name {
                font-weight: 600;
                font-size: 1.1rem;
            }

            .bot-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.8rem;
                opacity: 0.9;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s ease-in-out infinite;
            }

            .bot-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .bot-close:hover {
                background: rgba(255,255,255,0.2);
            }

            .bot-messages {
                flex: 1;
                padding: 1rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .bot-message {
                display: flex;
                gap: 10px;
                animation: messageSlideIn 0.3s ease-out;
            }

            .bot-message.user {
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                flex-shrink: 0;
            }

            .message-avatar.bot {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .message-avatar.user {
                background: #e5e7eb;
                color: #374151;
            }

            .message-content {
                background: #f8fafc;
                padding: 12px 16px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                line-height: 1.4;
            }

            .bot-message.user .message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .bot-suggestions {
                padding: 0 1rem 1rem;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .suggestion-btn {
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                color: #374151;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .suggestion-btn:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .bot-input {
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .bot-input input {
                flex: 1;
                border: 1px solid #e5e7eb;
                border-radius: 25px;
                padding: 12px 16px;
                outline: none;
                font-size: 0.9rem;
            }

            .bot-input input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .bot-input button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
            }

            .bot-input button:hover {
                transform: scale(1.1);
            }

            /* Animations */
            @keyframes botBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.2); }
            }

            @keyframes slideInUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes messageSlideIn {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .tanzi-bot {
                    bottom: 15px;
                    right: 15px;
                }

                .bot-chat {
                    width: calc(100vw - 30px);
                    height: 400px;
                    bottom: 75px;
                    right: -15px;
                }

                .bot-notification {
                    bottom: 70px;
                    right: -10px;
                    font-size: 0.8rem;
                    padding: 10px 12px;
                }
            }

            /* Typing indicator */
            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                background: #94a3b8;
                border-radius: 50%;
                animation: typingPulse 1.4s ease-in-out infinite both;
            }

            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes typingPulse {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;

        const style = document.createElement('style');
        style.textContent = botCSS;
        document.head.appendChild(style);
    }

    loadConversationFlows() {
        this.flows = {
            welcome: {
                trigger: 'initial',
                messages: [
                    "👋 Hi there! I'm TanziBot, your Social Media Intelligence assistant!",
                    "I'm here to help you get the most out of Gabriele's insights and tools. What brings you here today?"
                ],
                suggestions: [
                    "🎯 Download free toolkit",
                    "📊 Learn about social media strategy", 
                    "💡 Get personalized recommendations",
                    "🚀 Explore premium content"
                ]
            },
            
            download_guide: {
                trigger: 'download',
                messages: [
                    "🎯 Great choice! Our Email Validation Toolkit has helped clients generate $2M+ in revenue.",
                    "I'll help you get the most out of this guide. First, let me get you the download link!"
                ],
                suggestions: [
                    "📥 Get download link",
                    "📋 What's included?",
                    "🎓 Get implementation help"
                ]
            },
            
            strategy_help: {
                trigger: 'strategy',
                messages: [
                    "📊 I can help you develop a data-driven social media strategy!",
                    "Based on our analysis of 2M+ posts, what's your biggest challenge right now?"
                ],
                suggestions: [
                    "🎯 Lead generation",
                    "📈 Content engagement",
                    "🤖 AI automation",
                    "💰 ROI optimization"
                ]
            },
            
            premium_content: {
                trigger: 'premium',
                messages: [
                    "⭐ Our premium content includes advanced case studies and exclusive strategies!",
                    "You'll get access to templates that have driven millions in revenue for our clients."
                ],
                suggestions: [
                    "🔍 See premium features",
                    "🆓 Start free trial",
                    "💬 Talk to expert",
                    "📊 View success stories"
                ]
            },

            implementation_help: {
                trigger: 'implement',
                messages: [
                    "🎓 Perfect! I love helping people turn insights into action.",
                    "Let's break down the implementation into manageable steps. What area do you want to focus on first?"
                ],
                suggestions: [
                    "📧 Email strategy setup",
                    "📱 Social media optimization",
                    "🤖 AI tool integration",
                    "📊 Analytics tracking"
                ]
            }
        };
    }

    updateUserContext() {
        // Check authentication status
        if (window.blogAuth && window.blogAuth.isLoggedIn()) {
            this.userContext.isLoggedIn = true;
            const user = window.blogAuth.getCurrentUser();
            this.userContext.membershipTier = user.membershipTier || 'free';
        }

        // Detect current page context
        const pathname = window.location.pathname;
        if (pathname.includes('email-validation')) {
            this.userContext.currentPage = 'email_toolkit';
        } else if (pathname.includes('posts/')) {
            this.userContext.currentPage = 'blog_post';
        } else if (pathname.includes('index.html') || pathname === '/') {
            this.userContext.currentPage = 'homepage';
        }
    }

    setupEventListeners() {
        // Listen for user registration/login events
        document.addEventListener('userLoggedIn', (e) => {
            this.userContext.isLoggedIn = true;
            this.userContext.membershipTier = e.detail.user.membershipTier || 'free';
            this.sendBotMessage("🎉 Welcome back! Now I can provide more personalized recommendations.");
        });

        // Listen for download events
        document.addEventListener('downloadStarted', (e) => {
            this.userContext.hasDownloaded = true;
            this.handleDownloadStarted(e.detail.resource);
        });
    }

    toggleBot() {
        this.isOpen = !this.isOpen;
        const botChat = document.getElementById('bot-chat');
        const notification = document.getElementById('bot-notification');
        
        if (this.isOpen) {
            botChat.style.display = 'flex';
            notification.style.display = 'none';
            this.trackBotInteraction('opened');
        } else {
            botChat.style.display = 'none';
            this.trackBotInteraction('closed');
        }
    }

    showWelcomeMessage() {
        if (!this.isOpen && this.conversationHistory.length === 0) {
            const notification = document.getElementById('bot-notification');
            notification.style.display = 'block';
            
            // Auto-hide notification after 8 seconds
            setTimeout(() => {
                notification.style.display = 'none';
            }, 8000);
        }
    }

    sendMessage() {
        const input = document.getElementById('bot-input-field');
        const message = input.value.trim();
        
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';
        
        // Process user message and respond
        setTimeout(() => {
            this.processUserMessage(message);
        }, 800);
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('bot-messages');
        const messageHTML = `
            <div class="bot-message user">
                <div class="message-content">${this.escapeHtml(message)}</div>
                <div class="message-avatar user">👤</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
        
        this.conversationHistory.push({ type: 'user', message, timestamp: new Date() });
    }

    sendBotMessage(message, delay = 0) {
        setTimeout(() => {
            // Show typing indicator first
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.hideTypingIndicator();
                
                const messagesContainer = document.getElementById('bot-messages');
                const messageHTML = `
                    <div class="bot-message bot">
                        <div class="message-avatar bot">🤖</div>
                        <div class="message-content">${message}</div>
                    </div>
                `;
                messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
                this.scrollToBottom();
                
                this.conversationHistory.push({ type: 'bot', message, timestamp: new Date() });
            }, 1200);
        }, delay);
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('bot-messages');
        const typingHTML = `
            <div class="bot-message bot typing" id="typing-indicator">
                <div class="message-avatar bot">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    processUserMessage(message) {
        const intent = this.detectIntent(message);
        
        switch (intent) {
            case 'download':
                this.handleDownloadRequest();
                break;
            case 'strategy':
                this.handleStrategyRequest();
                break;
            case 'premium':
                this.handlePremiumInquiry();
                break;
            case 'implementation':
                this.handleImplementationHelp();
                break;
            case 'pricing':
                this.handlePricingQuestions();
                break;
            default:
                this.handleGenericResponse(message);
        }
    }

    detectIntent(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('download') || msg.includes('toolkit') || msg.includes('guide')) {
            return 'download';
        } else if (msg.includes('strategy') || msg.includes('social media') || msg.includes('marketing')) {
            return 'strategy';
        } else if (msg.includes('premium') || msg.includes('paid') || msg.includes('membership')) {
            return 'premium';
        } else if (msg.includes('implement') || msg.includes('help') || msg.includes('how to') || msg.includes('step by step')) {
            return 'implementation';
        } else if (msg.includes('price') || msg.includes('cost') || msg.includes('$')) {
            return 'pricing';
        }
        
        return 'generic';
    }

    handleDownloadRequest() {
        if (this.userContext.isLoggedIn) {
            this.sendBotMessage("🎯 Excellent! You're logged in and ready to access our premium resources. Let me help you get the right toolkit for your needs.");
            this.showSuggestions([
                "📥 Download Email Toolkit",
                "📊 Get Social Media Templates", 
                "🎓 Get implementation guidance",
                "📈 View success metrics"
            ]);
        } else {
            this.sendBotMessage("📋 Our Email Validation Toolkit includes:

✅ Complete email audit checklist
✅ Proven templates that generated $2M+ revenue
✅ AI-powered optimization strategies
✅ Step-by-step implementation guide

🔐 Quick registration helps us provide personalized implementation guidance and track your progress!");
            this.showSuggestions([
                "🆓 Create free account (30 sec)",
                "📋 What else is included?",
                "❓ Why registration required?",
                "💬 Talk to expert"
            ]);
        }
    }

    handleStrategyRequest() {
        this.sendBotMessage("📊 Excellent! I can help you with data-driven strategies. Based on our analysis of 2M+ posts, what's your main goal?");
        this.showSuggestions([
            "🎯 Generate more leads",
            "📈 Increase engagement",
            "🤖 Automate processes",
            "💰 Improve ROI"
        ]);
    }

    handlePremiumInquiry() {
        if (this.userContext.membershipTier === 'premium' || this.userContext.membershipTier === 'pro') {
            this.sendBotMessage("⭐ Great news! You already have premium access. What premium feature can I help you with?");
            this.showSuggestions([
                "📊 Advanced analytics",
                "🎯 Premium templates",
                "📞 Schedule consultation",
                "🎓 Implementation guide"
            ]);
        } else {
            this.sendBotMessage("✨ Our premium membership unlocks advanced strategies used by $2M+ revenue clients. Want to see what's included?");
            this.showSuggestions([
                "🔍 See premium features",
                "🆓 Start 14-day trial",
                "💬 Talk to expert",
                "📊 View case studies"
            ]);
        }
    }

    handleImplementationHelp() {
        this.sendBotMessage("🎓 I love helping people turn insights into action! Let me guide you step-by-step. What do you want to implement?");
        this.showSuggestions([
            "📧 Email marketing strategy",
            "📱 Social media optimization",
            "🤖 AI automation setup",
            "📊 Analytics tracking"
        ]);
    }

    handlePricingQuestions() {
        this.sendBotMessage("💰 Our pricing is designed to deliver massive ROI. Premium is $29/month with a 14-day free trial, Pro is $99/month with direct expert access.");
        this.showSuggestions([
            "🆓 Start free trial",
            "📊 See ROI examples",
            "💬 Talk to expert",
            "📋 Compare features"
        ]);
    }

    handleGenericResponse(message) {
        const responses = [
            "🤔 That's a great question! Let me help you find the best solution.",
            "💡 I can definitely assist with that! What specific aspect interests you most?",
            "📊 Based on our data analysis, I can provide some insights on that topic.",
            "🎯 Let me guide you to the most relevant resources for your needs."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.sendBotMessage(randomResponse);
        
        this.showSuggestions([
            "📥 Download free resources",
            "📊 Explore case studies",
            "💬 Get expert help",
            "🎯 See recommendations"
        ]);
    }

    handleDownloadStarted(resource) {
        this.sendBotMessage(`🎉 Great! Your ${resource} is downloading. Would you like help implementing these strategies?`);
        this.showSuggestions([
            "🎓 Yes, guide me step-by-step",
            "📞 Schedule expert consultation",
            "📊 Show me case studies",
            "💬 Ask specific questions"
        ]);
    }

    showSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('bot-suggestions');
        suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = suggestion;
            btn.onclick = () => this.handleSuggestionClick(suggestion);
            suggestionsContainer.appendChild(btn);
        });
    }

    handleSuggestionClick(suggestion) {
        this.addUserMessage(suggestion);
        
        // Handle specific suggestion actions
        if (suggestion.includes('Download')) {
            this.triggerDownload();
        } else if (suggestion.includes('free account')) {
            this.openRegistration();
        } else if (suggestion.includes('trial') || suggestion.includes('premium features')) {
            this.openMembershipModal();
        } else if (suggestion.includes('expert') || suggestion.includes('consultation')) {
            this.openContactForm();
        } else {
            // Process as regular message
            setTimeout(() => {
                this.processUserMessage(suggestion);
            }, 800);
        }
    }

    triggerDownload() {
        if (window.handleDownload) {
            window.handleDownload('email_validation_toolkit');
        }
        this.sendBotMessage("🚀 Initiating download! Once you have the toolkit, I'll help you implement the strategies.");
    }

    openRegistration() {
        if (window.showRegisterModal) {
            window.showRegisterModal();
        }
        this.sendBotMessage("📝 Registration modal opened! Once you're signed up, I'll help you get started with our best resources.");
    }

    openMembershipModal() {
        if (window.showMembershipModal) {
            window.showMembershipModal();
        }
        this.sendBotMessage("⭐ Check out our membership options! I'm here if you have any questions about the features.");
    }

    openContactForm() {
        this.sendBotMessage("📧 You can reach Gabriele directly at info@tanzitech.com for general questions or contact@tanzitech.com for business partnerships.");
        this.showSuggestions([
            "✉️ Send email now",
            "📞 Schedule consultation call",
            "💬 Continue chatting",
            "🏠 Back to main options"
        ]);
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('bot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    trackBotInteraction(action, details = {}) {
        // Track bot interactions for analytics
        console.log('Bot interaction:', action, details);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'bot_interaction', {
                event_category: 'Chatbot',
                event_label: action,
                custom_parameter_1: this.userContext.membershipTier
            });
        }
    }

    // Initialize welcome flow based on user context
    startConversation() {
        const flow = this.flows.welcome;
        
        flow.messages.forEach((message, index) => {
            this.sendBotMessage(message, index * 1000);
        });
        
        setTimeout(() => {
            this.showSuggestions(flow.suggestions);
        }, flow.messages.length * 1000 + 500);
    }

    // Public method to trigger specific flows
    triggerFlow(flowName, context = {}) {
        const flow = this.flows[flowName];
        if (!flow) return;
        
        if (!this.isOpen) {
            this.toggleBot();
        }
        
        flow.messages.forEach((message, index) => {
            this.sendBotMessage(message, index * 1000);
        });
        
        setTimeout(() => {
            this.showSuggestions(flow.suggestions);
        }, flow.messages.length * 1000 + 500);
    }
}

// Initialize the bot
window.tanziBot = new TanziBot();

// Global functions for triggering bot interactions
window.startBotConversation = function(topic) {
    if (window.tanziBot) {
        window.tanziBot.triggerFlow(topic);
    }
};

window.askBotAbout = function(topic) {
    if (window.tanziBot) {
        if (!window.tanziBot.isOpen) {
            window.tanziBot.toggleBot();
        }
        setTimeout(() => {
            window.tanziBot.addUserMessage(`Tell me about ${topic}`);
            window.tanziBot.processUserMessage(`Tell me about ${topic}`);
        }, 500);
    }
};

console.log('TanziBot intelligent system loaded successfully! 🤖');
