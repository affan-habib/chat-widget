/**
 * Chat Widget Core Functionality
 * Simulates real-time chat with mock responses
 */

window.ChatWidget = (function() {
    'use strict';

    // Configuration
    let config = {
        tenantId: 'default',
        themeColor: '#0047AB',
        agentName: 'Support Agent',
        welcomeMessage: 'Hello! How can I help you today?',
        responseDelay: { min: 1000, max: 2500 },
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        // Authentication settings
        requireRegistration: true,
        requireOTPVerification: true,
        defaultOTP: '123456',
        registrationFields: {
            name: { required: true, label: 'Full Name' },
            email: { required: true, label: 'Email Address' },
            phone: { required: true, label: 'Mobile Number' },
            subject: { required: false, label: 'Subject' }
        }
    };

    // State
    let messages = [];
    let isAgentTyping = false;
    let messageIdCounter = 0;
    let currentUser = null;
    let currentScreen = 'registration'; // 'registration', 'otp', 'chat'
    let otpTimer = null;
    let otpCountdown = 60;

    // DOM Elements
    let elements = {};

    // Mock agent responses
    const agentResponses = [
        "Thanks for reaching out! I'm here to help.",
        "Let me look into that for you.",
        "That's a great question! Here's what I can tell you:",
        "I understand your concern. Let me assist you with that.",
        "Is there anything else I can help you with?",
        "I'd be happy to provide more information about that.",
        "Let me connect you with the right information.",
        "That's definitely something we can help with!",
        "I see what you mean. Here's what I recommend:",
        "Thanks for your patience. Here's the solution:"
    ];

    const imageResponses = [
        "Thanks for sharing that image! I can see it clearly.",
        "Great screenshot! This helps me understand better.",
        "I've received your image. Let me take a look at this.",
        "Perfect! The image is very helpful for context.",
        "Thanks for the visual - this makes it much clearer!"
    ];

    /**
     * Initialize the chat widget
     */
    function init() {
        // Apply configuration from global config
        applyGlobalConfig();
        
        // Cache DOM elements
        cacheElements();
        
        // Apply theming
        applyTheme();
        
        // Bind events
        bindEvents();
        
        // Initialize widget flow
        initializeWidget();
        
        console.log('Chat Widget initialized for tenant:', config.tenantId);
    }

    /**
     * Apply configuration from window.OMNITRIX_CONFIG or URL params
     */
    function applyGlobalConfig() {
        console.log('Initial config:', config);
        
        // Check for global config
        if (window.OMNITRIX_CONFIG) {
            config = { ...config, ...window.OMNITRIX_CONFIG };
            console.log('After global config:', config);
        }
        
        // Check for URL parameters (for iframe)
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL params:', urlParams.toString());
        
        if (urlParams.get('tenantId')) {
            config.tenantId = urlParams.get('tenantId');
        }
        if (urlParams.get('themeColor')) {
            config.themeColor = urlParams.get('themeColor');
        }
        if (urlParams.get('agentName')) {
            config.agentName = urlParams.get('agentName');
        }
        
        // Authentication parameters
        if (urlParams.get('requireRegistration') !== null) {
            config.requireRegistration = urlParams.get('requireRegistration') === 'true';
            console.log('Set requireRegistration to:', config.requireRegistration);
        }
        if (urlParams.get('requireOTPVerification') !== null) {
            config.requireOTPVerification = urlParams.get('requireOTPVerification') === 'true';
            console.log('Set requireOTPVerification to:', config.requireOTPVerification);
        }
        if (urlParams.get('defaultOTP')) {
            config.defaultOTP = urlParams.get('defaultOTP');
            console.log('Set defaultOTP to:', config.defaultOTP);
        }
        
        console.log('Final config:', config);
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements = {
            container: document.getElementById('chat-container'),
            // Registration elements
            userRegistration: document.getElementById('user-registration'),
            registrationForm: document.getElementById('user-registration-form'),
            registrationCloseBtn: document.getElementById('registration-close-btn'),
            userNameInput: document.getElementById('user-name'),
            userEmailInput: document.getElementById('user-email'),
            userPhoneInput: document.getElementById('user-phone'),
            userSubjectInput: document.getElementById('user-subject'),
            startChatBtn: document.getElementById('start-chat-btn'),
            // OTP elements
            otpVerification: document.getElementById('otp-verification'),
            otpForm: document.getElementById('otp-verification-form'),
            otpCloseBtn: document.getElementById('otp-close-btn'),
            maskedPhone: document.getElementById('masked-phone'),
            otpDigits: {
                1: document.getElementById('otp-digit-1'),
                2: document.getElementById('otp-digit-2'),
                3: document.getElementById('otp-digit-3'),
                4: document.getElementById('otp-digit-4'),
                5: document.getElementById('otp-digit-5'),
                6: document.getElementById('otp-digit-6')
            },
            verifyOtpBtn: document.getElementById('verify-otp-btn'),
            resendOtpBtn: document.getElementById('resend-otp-btn'),
            timerCountdown: document.getElementById('timer-countdown'),
            otpTimer: document.getElementById('otp-timer'),
            // Chat elements
            chatInterface: document.getElementById('chat-interface'),
            header: document.querySelector('.chat-header'),
            agentName: document.querySelector('.agent-name'),
            messages: document.getElementById('chat-messages'),
            typingIndicator: document.getElementById('typing-indicator'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            attachBtn: document.getElementById('attach-btn'),
            fileInput: document.getElementById('file-input'),
            closeBtn: document.getElementById('close-btn'),
            imageModal: document.getElementById('image-modal'),
            modalImage: document.getElementById('modal-image'),
            modalClose: document.querySelector('.image-modal-close')
        };
    }

    /**
     * Apply custom theming
     */
    function applyTheme() {
        if (config.themeColor) {
            document.documentElement.style.setProperty('--primary-color', config.themeColor);
            
            // Generate lighter and darker variants
            const color = hexToRgb(config.themeColor);
            if (color) {
                const lightColor = `rgb(${Math.min(255, color.r + 20)}, ${Math.min(255, color.g + 20)}, ${Math.min(255, color.b + 20)})`;
                const darkColor = `rgb(${Math.max(0, color.r - 20)}, ${Math.max(0, color.g - 20)}, ${Math.max(0, color.b - 20)})`;
                
                document.documentElement.style.setProperty('--primary-light', lightColor);
                document.documentElement.style.setProperty('--primary-dark', darkColor);
            }
        }
        
        if (config.agentName && elements.agentName) {
            elements.agentName.textContent = config.agentName;
        }
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Registration events
        elements.registrationForm.addEventListener('submit', handleRegistrationSubmit);
        elements.registrationCloseBtn.addEventListener('click', handleClose);

        // OTP events
        elements.otpForm.addEventListener('submit', handleOTPSubmit);
        elements.otpCloseBtn.addEventListener('click', handleClose);
        elements.resendOtpBtn.addEventListener('click', handleResendOTP);

        // OTP digit inputs
        Object.values(elements.otpDigits).forEach((input, index) => {
            input.addEventListener('input', (e) => handleOTPInput(e, index + 1));
            input.addEventListener('keydown', (e) => handleOTPKeydown(e, index + 1));
            input.addEventListener('paste', handleOTPPaste);
        });

        // Send message events
        elements.sendBtn.addEventListener('click', handleSendMessage);
        elements.messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // File attachment
        elements.attachBtn.addEventListener('click', function() {
            elements.fileInput.click();
        });
        elements.fileInput.addEventListener('change', handleFileSelect);

        // Control buttons
        elements.closeBtn.addEventListener('click', handleClose);

        // Image modal
        elements.modalClose.addEventListener('click', closeImageModal);
        elements.imageModal.addEventListener('click', function(e) {
            if (e.target === elements.imageModal) {
                closeImageModal();
            }
        });

        // Auto-resize input
        elements.messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });

        // Escape key to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && elements.imageModal.style.display === 'block') {
                closeImageModal();
            }
        });
    }

    /**
     * Initialize the widget flow
     */
    function initializeWidget() {
        console.log('initializeWidget - requireRegistration:', config.requireRegistration);
        console.log('initializeWidget - requireOTPVerification:', config.requireOTPVerification);
        
        if (!config.requireRegistration) {
            console.log('Skipping registration, going to chat');
            // Skip registration, go directly to chat
            showChatInterface();
        } else {
            console.log('Showing registration form');
            // Show registration form first
            showRegistrationForm();
        }
    }

    /**
     * Show registration form
     */
    function showRegistrationForm() {
        currentScreen = 'registration';
        elements.userRegistration.style.display = 'flex';
        elements.otpVerification.style.display = 'none';
        elements.chatInterface.style.display = 'none';
    }

    /**
     * Show OTP verification
     */
    function showOTPVerification() {
        currentScreen = 'otp';
        elements.userRegistration.style.display = 'none';
        elements.otpVerification.style.display = 'flex';
        elements.chatInterface.style.display = 'none';
        
        // Set masked phone number
        if (currentUser && currentUser.phone) {
            elements.maskedPhone.textContent = maskPhoneNumber(currentUser.phone);
        }
        
        // Start OTP timer
        startOTPTimer();
        
        // Focus first OTP input
        elements.otpDigits[1].focus();
    }

    /**
     * Show chat interface
     */
    function showChatInterface() {
        currentScreen = 'chat';
        elements.userRegistration.style.display = 'none';
        elements.otpVerification.style.display = 'none';
        elements.chatInterface.style.display = 'flex';
        
        // Initialize messages if not already done
        if (messages.length === 0) {
            initializeMessages();
        }
    }

    /**
     * Initialize messages with welcome message
     */
    function initializeMessages() {
        let welcomeText = config.welcomeMessage;
        
        // Personalize welcome message if user is registered
        if (currentUser && currentUser.name) {
            welcomeText = `Hello ${currentUser.name}! How can I help you today?`;
        }
        
        const welcomeMessage = {
            id: generateMessageId(),
            text: welcomeText,
            sender: 'agent',
            timestamp: new Date(),
            type: 'text'
        };
        
        messages.push(welcomeMessage);
        renderMessage(welcomeMessage);
    }

    /**
     * Handle registration form submission
     */
    function handleRegistrationSubmit(e) {
        e.preventDefault();
        
        // Show loading state
        setButtonLoading(elements.startChatBtn, true);
        
        // Collect form data
        const formData = {
            name: elements.userNameInput.value.trim(),
            email: elements.userEmailInput.value.trim(),
            phone: elements.userPhoneInput.value.trim(),
            subject: elements.userSubjectInput.value.trim()
        };
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.phone) {
            alert('Please fill in all required fields');
            setButtonLoading(elements.startChatBtn, false);
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            setButtonLoading(elements.startChatBtn, false);
            return;
        }
        
        // Store user data
        currentUser = formData;
        
        // Simulate API call delay
        setTimeout(() => {
            setButtonLoading(elements.startChatBtn, false);
            
            if (config.requireOTPVerification) {
                // Show OTP verification
                showOTPVerification();
            } else {
                // Go directly to chat
                showChatInterface();
            }
        }, 1500);
    }

    /**
     * Handle OTP form submission
     */
    function handleOTPSubmit(e) {
        e.preventDefault();
        
        // Collect OTP digits
        const otpValue = Object.values(elements.otpDigits)
            .map(input => input.value)
            .join('');
        
        if (otpValue.length !== 6) {
            alert('Please enter the complete 6-digit code');
            return;
        }
        
        // Show loading state
        setButtonLoading(elements.verifyOtpBtn, true);
        
        // Verify OTP (using default OTP or simulate verification)
        setTimeout(() => {
            if (otpValue === config.defaultOTP) {
                // OTP verified successfully
                setButtonLoading(elements.verifyOtpBtn, false);
                clearOTPTimer();
                showChatInterface();
            } else {
                // Invalid OTP
                setButtonLoading(elements.verifyOtpBtn, false);
                alert('Invalid verification code. Please try again.');
                clearOTPInputs();
                elements.otpDigits[1].focus();
            }
        }, 1500);
    }

    /**
     * Handle OTP input
     */
    function handleOTPInput(e, position) {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        // Add filled class
        e.target.classList.add('filled');
        
        // Move to next input
        if (position < 6) {
            elements.otpDigits[position + 1].focus();
        }
        
        // Check if all digits are filled
        checkOTPCompletion();
    }

    /**
     * Handle OTP keydown (for backspace)
     */
    function handleOTPKeydown(e, position) {
        if (e.key === 'Backspace' && !e.target.value && position > 1) {
            // Move to previous input on backspace
            elements.otpDigits[position - 1].focus();
            elements.otpDigits[position - 1].classList.remove('filled');
        }
    }

    /**
     * Handle OTP paste
     */
    function handleOTPPaste(e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6);
        
        // Fill OTP inputs
        for (let i = 0; i < digits.length; i++) {
            if (elements.otpDigits[i + 1]) {
                elements.otpDigits[i + 1].value = digits[i];
                elements.otpDigits[i + 1].classList.add('filled');
            }
        }
        
        // Focus appropriate input
        const nextEmptyIndex = digits.length + 1;
        if (nextEmptyIndex <= 6) {
            elements.otpDigits[nextEmptyIndex].focus();
        }
        
        checkOTPCompletion();
    }

    /**
     * Handle resend OTP
     */
    function handleResendOTP() {
        // Reset timer
        clearOTPTimer();
        startOTPTimer();
        
        // Clear OTP inputs
        clearOTPInputs();
        
        // Focus first input
        elements.otpDigits[1].focus();
        
        // Show success message (simulate)
        alert('Verification code sent successfully!');
    }

    /**
     * Check if OTP is complete
     */
    function checkOTPCompletion() {
        const otpValue = Object.values(elements.otpDigits)
            .map(input => input.value)
            .join('');
        
        if (otpValue.length === 6) {
            // Auto-submit if all digits filled
            setTimeout(() => {
                elements.verifyOtpBtn.click();
            }, 300);
        }
    }

    /**
     * Clear OTP inputs
     */
    function clearOTPInputs() {
        Object.values(elements.otpDigits).forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
    }

    /**
     * Start OTP timer
     */
    function startOTPTimer() {
        otpCountdown = 60;
        elements.timerCountdown.textContent = otpCountdown;
        elements.otpTimer.style.display = 'block';
        elements.resendOtpBtn.style.display = 'none';
        
        otpTimer = setInterval(() => {
            otpCountdown--;
            elements.timerCountdown.textContent = otpCountdown;
            
            if (otpCountdown <= 0) {
                clearOTPTimer();
                elements.otpTimer.style.display = 'none';
                elements.resendOtpBtn.style.display = 'inline-block';
            }
        }, 1000);
    }

    /**
     * Clear OTP timer
     */
    function clearOTPTimer() {
        if (otpTimer) {
            clearInterval(otpTimer);
            otpTimer = null;
        }
    }

    /**
     * Set button loading state
     */
    function setButtonLoading(button, loading) {
        const textSpan = button.querySelector('.btn-text');
        const loadingSpan = button.querySelector('.btn-loading');
        
        if (loading) {
            textSpan.style.display = 'none';
            loadingSpan.style.display = 'flex';
            button.disabled = true;
        } else {
            textSpan.style.display = 'block';
            loadingSpan.style.display = 'none';
            button.disabled = false;
        }
    }

    /**
     * Mask phone number for display
     */
    function maskPhoneNumber(phone) {
        if (phone.length >= 4) {
            const masked = '*'.repeat(phone.length - 4) + phone.slice(-4);
            return masked;
        }
        return phone;
    }

    /**
     * Handle sending a message
     */
    function handleSendMessage() {
        const messageText = elements.messageInput.value.trim();
        
        if (messageText === '' || isAgentTyping) {
            return;
        }

        // Create user message
        const userMessage = {
            id: generateMessageId(),
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
            type: 'text'
        };

        // Add to messages and display
        addMessage(userMessage);
        
        // Clear input
        elements.messageInput.value = '';
        elements.messageInput.style.height = 'auto';

        // Simulate agent response
        simulateAgentResponse(userMessage);
    }

    /**
     * Handle file selection
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!config.allowedFileTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Validate file size
        if (file.size > config.maxFileSize) {
            alert('File size must be less than 5MB');
            return;
        }

        // Create file reader
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageMessage = {
                id: generateMessageId(),
                imageUrl: e.target.result,
                imageName: file.name,
                sender: 'user',
                timestamp: new Date(),
                type: 'image'
            };

            addMessage(imageMessage);
            simulateAgentResponse(imageMessage);
        };

        reader.readAsDataURL(file);
        
        // Reset file input
        event.target.value = '';
    }

    /**
     * Add a message to the chat
     */
    function addMessage(message) {
        messages.push(message);
        renderMessage(message);
        scrollToBottom();
    }

    /**
     * Render a message in the UI
     */
    function renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        messageElement.setAttribute('data-message-id', message.id);

        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        avatarElement.innerHTML = `<span class="avatar-icon">${message.sender === 'user' ? '👤' : '🤖'}</span>`;

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';

        const bubbleElement = document.createElement('div');
        bubbleElement.className = 'message-bubble';

        if (message.type === 'text') {
            bubbleElement.textContent = message.text;
        } else if (message.type === 'image') {
            const imgElement = document.createElement('img');
            imgElement.src = message.imageUrl;
            imgElement.alt = message.imageName;
            imgElement.className = 'message-image';
            imgElement.addEventListener('click', () => openImageModal(message.imageUrl));
            bubbleElement.appendChild(imgElement);
        }

        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.innerHTML = `<span>${formatTime(message.timestamp)}</span>`;

        contentElement.appendChild(bubbleElement);
        contentElement.appendChild(timeElement);

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);

        elements.messages.appendChild(messageElement);
    }

    /**
     * Simulate agent typing and response
     */
    function simulateAgentResponse(userMessage) {
        if (isAgentTyping) return;

        isAgentTyping = true;
        showTypingIndicator();

        // Random delay between min and max
        const delay = Math.random() * (config.responseDelay.max - config.responseDelay.min) + config.responseDelay.min;

        setTimeout(() => {
            hideTypingIndicator();
            
            // Generate response based on message type
            let responseText;
            if (userMessage.type === 'image') {
                responseText = getRandomResponse(imageResponses);
            } else {
                responseText = generateContextualResponse(userMessage.text);
            }

            const agentMessage = {
                id: generateMessageId(),
                text: responseText,
                sender: 'agent',
                timestamp: new Date(),
                type: 'text'
            };

            addMessage(agentMessage);
            isAgentTyping = false;
        }, delay);
    }

    /**
     * Generate contextual response based on user input
     */
    function generateContextualResponse(userText) {
        const text = userText.toLowerCase();
        
        // Simple keyword-based responses
        if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
            return "Hello! Great to hear from you. How can I assist you today?";
        }
        
        if (text.includes('help') || text.includes('support')) {
            return "I'm here to help! What specific issue can I assist you with?";
        }
        
        if (text.includes('price') || text.includes('cost') || text.includes('billing')) {
            return "I'd be happy to help you with pricing information. Let me get that for you.";
        }
        
        if (text.includes('technical') || text.includes('bug') || text.includes('error')) {
            return "I understand you're experiencing a technical issue. Can you provide more details about what's happening?";
        }
        
        if (text.includes('thank')) {
            return "You're very welcome! Is there anything else I can help you with?";
        }
        
        if (text.includes('bye') || text.includes('goodbye')) {
            return "Thank you for contacting us! Have a great day and feel free to reach out anytime.";
        }
        
        // Default random response
        return getRandomResponse(agentResponses);
    }

    /**
     * Get random response from array
     */
    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Show typing indicator
     */
    function showTypingIndicator() {
        elements.typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    function hideTypingIndicator() {
        elements.typingIndicator.style.display = 'none';
    }

    /**
     * Scroll to bottom of messages
     */
    function scrollToBottom() {
        setTimeout(() => {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        }, 100);
    }

    /**
     * Open image modal
     */
    function openImageModal(imageSrc) {
        elements.modalImage.src = imageSrc;
        elements.imageModal.style.display = 'block';
    }

    /**
     * Close image modal
     */
    function closeImageModal() {
        elements.imageModal.style.display = 'none';
        elements.modalImage.src = '';
    }

    /**
     * Handle close button
     */
    function handleClose() {
        if (window.parent !== window) {
            // In iframe - send message to parent
            window.parent.postMessage({ action: 'close' }, '*');
        } else {
            // Standalone - just hide
            elements.container.style.display = 'none';
        }
    }

    /**
     * Utility functions
     */
    function generateMessageId() {
        return `msg_${++messageIdCounter}_${Date.now()}`;
    }

    function formatTime(timestamp) {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Public API
     */
    return {
        init: init,
        sendMessage: function(text) {
            if (elements.messageInput) {
                elements.messageInput.value = text;
                handleSendMessage();
            }
        },
        getMessages: function() {
            return [...messages];
        },
        clearChat: function() {
            messages = [];
            elements.messages.innerHTML = '';
            initializeMessages();
        },
        updateConfig: function(newConfig) {
            config = { ...config, ...newConfig };
            applyTheme();
        },
        
        // Authentication methods
        skipRegistration: function() {
            config.requireRegistration = false;
            showChatInterface();
        },
        
        setOTPRequired: function(required) {
            config.requireOTPVerification = required;
        },
        
        setDefaultOTP: function(otp) {
            config.defaultOTP = otp;
        },
        
        getCurrentUser: function() {
            return currentUser;
        }
    };
})();

// Auto-initialize if not in widget mode
if (!window.OMNITRIX_WIDGET_MODE) {
    document.addEventListener('DOMContentLoaded', function() {
        window.ChatWidget.init();
    });
}