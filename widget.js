/**
 * Omnitrix Chat Widget - Embeddable Script
 * This script can be embedded on any website to add the chat widget
 * Usage: <script src="path/to/widget.js"></script>
 */

(function() {
    'use strict';

    // Widget configuration
    let widgetConfig = {
        tenantId: 'default',
        themeColor: '#0047AB',
        agentName: 'Support Agent',
        position: 'bottom-right', // bottom-right, bottom-left
        offsetX: 20,
        offsetY: 20,
        buttonText: '💬',
        buttonSize: 60,
        iframeWidth: 400,
        iframeHeight: 600,
        autoOpen: false,
        baseUrl: '', // Will be auto-detected - for API calls
        widgetBaseUrl: '', // For widget files (index.html, etc.)
        zIndex: 9999
    };

    // Widget state
    let isOpen = false;
    let widgetButton = null;
    let widgetIframe = null;
    let widgetContainer = null;

    /**
     * Initialize the widget when DOM is ready
     */
    function initWidget() {
        // Apply global configuration
        applyGlobalConfig();
        
        // Detect base URL
        detectBaseUrl();
        
        // Create widget elements
        createWidgetButton();
        createWidgetIframe();
        
        // Setup event listeners
        setupEventListeners();
        
        // Auto-open if configured
        if (widgetConfig.autoOpen) {
            setTimeout(openWidget, 1000);
        }
        
        console.log('Omnitrix Chat Widget loaded for tenant:', widgetConfig.tenantId);
    }

    /**
     * Apply configuration from window.OMNITRIX_CONFIG
     */
    function applyGlobalConfig() {
        if (window.OMNITRIX_CONFIG) {
            widgetConfig = { ...widgetConfig, ...window.OMNITRIX_CONFIG };
        }
        
        // Validate position
        if (!['bottom-right', 'bottom-left'].includes(widgetConfig.position)) {
            widgetConfig.position = 'bottom-right';
        }
    }

    /**
     * Auto-detect base URL from script src
     */
    function detectBaseUrl() {
        // Detect widget base URL from script src
        if (!widgetConfig.widgetBaseUrl) {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src && script.src.includes('widget.js')) {
                    widgetConfig.widgetBaseUrl = script.src.replace('/widget.js', '');
                    break;
                }
            }
            
            // Fallback to current domain
            if (!widgetConfig.widgetBaseUrl) {
                widgetConfig.widgetBaseUrl = window.location.origin;
            }
        }
        
        // Set API base URL if not explicitly configured
        if (!widgetConfig.baseUrl) {
            // If baseUrl is not set, use the same as widgetBaseUrl
            widgetConfig.baseUrl = widgetConfig.widgetBaseUrl;
        }
        
        console.log('Detected widgetBaseUrl:', widgetConfig.widgetBaseUrl);
        console.log('Detected baseUrl (API):', widgetConfig.baseUrl);
    }

    /**
     * Create the floating chat button
     */
    function createWidgetButton() {
        widgetButton = document.createElement('button');
        widgetButton.id = 'omnitrix-chat-button';
        widgetButton.className = 'omnitrix-chat-button';
        widgetButton.innerHTML = widgetConfig.buttonText;
        widgetButton.title = 'Open Chat';
        
        // Apply styles
        applyButtonStyles();
        
        // Position button
        positionButton();
        
        // Add to DOM
        document.body.appendChild(widgetButton);
    }

    /**
     * Apply styles to the chat button
     */
    function applyButtonStyles() {
        const styles = {
            position: 'fixed',
            width: widgetConfig.buttonSize + 'px',
            height: widgetConfig.buttonSize + 'px',
            backgroundColor: widgetConfig.themeColor,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: widgetConfig.zIndex,
            transition: 'all 0.3s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        };

        Object.assign(widgetButton.style, styles);

        // Hover effects
        widgetButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        });

        widgetButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
    }

    /**
     * Position the button based on configuration
     */
    function positionButton() {
        if (widgetConfig.position === 'bottom-right') {
            widgetButton.style.bottom = widgetConfig.offsetY + 'px';
            widgetButton.style.right = widgetConfig.offsetX + 'px';
        } else if (widgetConfig.position === 'bottom-left') {
            widgetButton.style.bottom = widgetConfig.offsetY + 'px';
            widgetButton.style.left = widgetConfig.offsetX + 'px';
        }
    }

    /**
     * Create the iframe container
     */
    function createWidgetIframe() {
        // Create container
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'omnitrix-chat-container';
        widgetContainer.className = 'omnitrix-chat-container';
        
        // Create iframe
        widgetIframe = document.createElement('iframe');
        widgetIframe.id = 'omnitrix-chat-iframe';
        widgetIframe.className = 'omnitrix-chat-iframe';
        
        // Set iframe source with parameters
        const iframeUrl = buildIframeUrl();
        widgetIframe.src = iframeUrl;
        
        // Apply container styles
        applyContainerStyles();
        
        // Apply iframe styles
        applyIframeStyles();
        
        // Add iframe to container
        widgetContainer.appendChild(widgetIframe);
        
        // Add container to DOM (hidden initially)
        document.body.appendChild(widgetContainer);
    }

    /**
     * Build iframe URL with parameters
     */
    function buildIframeUrl() {
        const params = new URLSearchParams({
            tenantId: widgetConfig.tenantId,
            themeColor: widgetConfig.themeColor,
            agentName: widgetConfig.agentName
        });
        
        // Add authentication parameters if they exist
        if (widgetConfig.requireRegistration !== undefined) {
            params.set('requireRegistration', widgetConfig.requireRegistration);
        }
        if (widgetConfig.requireOTPVerification !== undefined) {
            params.set('requireOTPVerification', widgetConfig.requireOTPVerification);
        }
        if (widgetConfig.defaultOTP !== undefined) {
            params.set('defaultOTP', widgetConfig.defaultOTP);
        }
        if (widgetConfig.baseUrl !== undefined) {
            params.set('baseUrl', widgetConfig.baseUrl);
        }
        
        return `${widgetConfig.widgetBaseUrl}/index.html?${params.toString()}`;
    }

    /**
     * Apply styles to the container
     */
    function applyContainerStyles() {
        const containerStyles = {
            position: 'fixed',
            zIndex: widgetConfig.zIndex - 1,
            display: 'none',
            transition: 'all 0.3s ease'
        };

        Object.assign(widgetContainer.style, containerStyles);
        positionContainer();
    }

    /**
     * Position the container based on configuration
     */
    function positionContainer() {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const margin = 20; // Fixed margin from edges
        
        // For mobile, use full screen
        if (viewportWidth < 480) {
            widgetContainer.style.top = '0';
            widgetContainer.style.bottom = '0';
            widgetContainer.style.left = '0';
            widgetContainer.style.right = '0';
            return;
        }
        
        // For desktop, use fixed positioning with margins
        const chatWidth = Math.min(widgetConfig.iframeWidth, viewportWidth - (margin * 2));
        const chatHeight = Math.min(widgetConfig.iframeHeight, viewportHeight - (margin * 2));
        
        // Update iframe size to fit viewport if needed
        widgetIframe.style.width = chatWidth + 'px';
        widgetIframe.style.height = chatHeight + 'px';
        
        if (widgetConfig.position === 'bottom-right') {
            widgetContainer.style.bottom = margin + 'px';
            widgetContainer.style.right = margin + 'px';
            widgetContainer.style.left = 'auto';
            widgetContainer.style.top = 'auto';
        } else if (widgetConfig.position === 'bottom-left') {
            widgetContainer.style.bottom = margin + 'px';
            widgetContainer.style.left = margin + 'px';
            widgetContainer.style.right = 'auto';
            widgetContainer.style.top = 'auto';
        }
    }

    /**
     * Apply styles to the iframe
     */
    function applyIframeStyles() {
        const iframeStyles = {
            width: widgetConfig.iframeWidth + 'px',
            height: widgetConfig.iframeHeight + 'px',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
            transform: 'scale(0.8)',
            opacity: '0',
            transition: 'all 0.3s ease',
            transformOrigin: getTransformOrigin()
        };

        Object.assign(widgetIframe.style, iframeStyles);
    }

    /**
     * Get transform origin based on position
     */
    function getTransformOrigin() {
        if (widgetConfig.position === 'bottom-right') {
            return 'bottom right';
        } else if (widgetConfig.position === 'bottom-left') {
            return 'bottom left';
        }
        return 'bottom center';
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Button click - only opens chat
        widgetButton.addEventListener('click', handleButtonClick);
        
        // Listen for messages from iframe
        window.addEventListener('message', handleIframeMessage);
        
        // Responsive handling
        window.addEventListener('resize', handleResize);
        
        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeWidget();
            }
        });
    }

    /**
     * Handle messages from iframe
     */
    function handleIframeMessage(event) {
        // Verify origin if needed
        // if (event.origin !== widgetConfig.baseUrl) return;
        
        const { action } = event.data;
        
        switch (action) {
            case 'close':
                closeWidget();
                break;
            case 'resize':
                handleIframeResize(event.data);
                break;
        }
    }

    /**
     * Handle iframe resize requests
     */
    function handleIframeResize(data) {
        if (data.width) {
            widgetIframe.style.width = data.width + 'px';
        }
        if (data.height) {
            widgetIframe.style.height = data.height + 'px';
        }
    }

    /**
     * Handle window resize and zoom changes
     */
    function handleResize() {
        if (!isOpen) return; // Only reposition if widget is open
        
        // Always reposition to handle zoom level changes
        positionContainer();
        
        // Apply appropriate styling based on viewport
        if (window.innerWidth < 480) {
            // Mobile view - fullscreen
            widgetIframe.style.borderRadius = '0';
        } else {
            // Desktop view - rounded corners
            widgetIframe.style.borderRadius = '12px';
        }
    }

    /**
     * Open widget (button only opens, doesn't toggle)
     */
    function handleButtonClick() {
        if (!isOpen) {
            openWidget();
        }
        // If already open, do nothing - user must use close button inside chat
    }

    /**
     * Toggle widget open/close (kept for API compatibility)
     */
    function toggleWidget() {
        if (isOpen) {
            closeWidget();
        } else {
            openWidget();
        }
    }

    /**
     * Open the widget
     */
    function openWidget() {
        if (isOpen) return;
        
        isOpen = true;
        
        // Ensure proper positioning before showing
        positionContainer();
        
        // Show container
        widgetContainer.style.display = 'block';
        
        // Trigger animation
        setTimeout(() => {
            widgetIframe.style.transform = 'scale(1)';
            widgetIframe.style.opacity = '1';
        }, 10);
        
        // Update button
        updateButtonState();
        
        // Handle responsive
        handleResize();
        
        // Focus iframe
        setTimeout(() => {
            widgetIframe.focus();
        }, 300);
    }

    /**
     * Close the widget
     */
    function closeWidget() {
        if (!isOpen) return;
        
        isOpen = false;
        
        // Trigger animation
        widgetIframe.style.transform = 'scale(0.8)';
        widgetIframe.style.opacity = '0';
        
        // Hide container after animation
        setTimeout(() => {
            widgetContainer.style.display = 'none';
        }, 300);
        
        // Update button
        updateButtonState();
    }

    /**
     * Update button appearance based on state
     */
    function updateButtonState() {
        // Always show the chat icon - only used for opening
        widgetButton.innerHTML = widgetConfig.buttonText;
        widgetButton.title = 'Open Chat';
        
        // Completely hide button when chat is open
        if (isOpen) {
            widgetButton.style.display = 'none';
        } else {
            widgetButton.style.display = 'flex';
        }
    }

    /**
     * Initiate chat with customer details
     */
    async function initiateChat(name, phone, email) {
        const endpoint = 'https://omnitrix.servicesmanagement.us/api/v1/customer/initiate-chat';
        const payload = {
            name: name,
            phone: phone,
            email: email
        };

        console.log('Initiating chat with payload:', payload);
        console.log('Using endpoint:', endpoint);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const data = await response.json();
            console.log('Chat initiation successful:', data);
            console.log('Request:', JSON.stringify(payload));
            console.log('Response:', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('Error initiating chat:', error);
            console.error('Request details:', { endpoint, payload });
            throw error; // Re-throw to allow calling code to handle
        }
    }

    /**
     * Resend OTP with customer details
     */
    async function resendOtp(email) {
        const endpoint = 'https://omnitrix.servicesmanagement.us/api/v1/customer/resend-otp';
        const payload = {
            email: email
        };

        console.log('Resending OTP with payload:', payload);
        console.log('Using endpoint:', endpoint);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const data = await response.json();
            console.log('OTP resend successful:', data);
            console.log('Request:', JSON.stringify(payload));
            console.log('Response:', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error resending OTP:', error);
            console.error('Request details:', { endpoint, payload });
            throw error;
        }
    }

    /**
     * Verify OTP with customer details
     */
    async function verifyOtp(email, otp) {
        const endpoint = 'https://omnitrix.servicesmanagement.us/api/v1/customer/verify-otp';
        const payload = {
            email: email,
            otp: otp
        };

        console.log('Verifying OTP with payload:', payload);
        console.log('Using endpoint:', endpoint);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const data = await response.json();
            console.log('OTP verification successful:', data);
            console.log('Request:', JSON.stringify(payload));
            console.log('Response:', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            console.error('Request details:', { endpoint, payload });
            throw error;
        }
    }

    /**
     * Public API
     */
    window.OmnitrixChat = {
        open: openWidget,
        close: closeWidget,
        toggle: toggleWidget,
        isOpen: function() { return isOpen; },
        updateConfig: function(newConfig) {
            widgetConfig = { ...widgetConfig, ...newConfig };
            
            // Update button styles and position
            if (widgetButton) {
                applyButtonStyles();
                positionButton();
                // Ensure button state remains correct after style updates
                updateButtonState();
            }
            
            // Update widget container position if it's open
            if (widgetContainer && isOpen) {
                positionContainer();
            }
            
            // Update iframe URL
            if (widgetIframe) {
                widgetIframe.src = buildIframeUrl();
            }
        },
        sendMessage: function(message) {
            if (widgetIframe && isOpen) {
                widgetIframe.contentWindow.postMessage({
                    action: 'sendMessage',
                    message: message
                }, '*');
            }
        },
        initiateChat: initiateChat,
        verifyOtp: verifyOtp,
        resendOtp: resendOtp,
        getCurrentUser: function() {
            // Try to get user from iframe first, fallback to local storage or default
            if (widgetIframe && isOpen) {
                try {
                    return widgetIframe.contentWindow.ChatWidget?.getCurrentUser() || null;
                } catch (e) {
                    console.warn('Could not access iframe user data:', e);
                }
            }
            return null;
        }
    };

    /**
     * Auto-initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

    // Set widget mode flag
    window.OMNITRIX_WIDGET_MODE = true;

})();