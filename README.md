# 🚀 Omnitrix Chat Widget

A powerful, frontend-only chat widget that can be embedded on any website. Features real-time chat simulation, multi-tenant support, responsive design, and easy integration.

## 🌟 Features

- **💬 Real-time Chat Simulation**: Simulated agent responses with typing indicators
- **🖼️ Image Support**: Send and preview images with modal view
- **🎨 Multi-tenant Theming**: Customizable colors and branding
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **🔌 Easy Integration**: Multiple embedding options
- **⚙️ Extensible**: Ready for real backend integration
- **🎯 No Dependencies**: Pure HTML, CSS, and JavaScript

## 📂 File Structure

```
chat-widget/
├── index.html          # Main chat interface (for iframe)
├── style.css           # Chat widget styling
├── widget.js           # Script for embedding widget
├── lib/
│   └── socket.js       # Core chat functionality
├── demo.html           # Interactive demo page
└── README.md           # Documentation
```

## 🚀 Quick Start

### Method 1: Script Embedding (Recommended)

Add this script to your website to embed a floating chat widget:

```html
<!-- Basic Integration -->
<script src="path/to/chat-widget/widget.js"></script>

<!-- With Configuration -->
<script>
window.OMNITRIX_CONFIG = {
    tenantId: 'your-company',
    themeColor: '#0047AB',
    agentName: 'Support Agent'
};
</script>
<script src="path/to/chat-widget/widget.js"></script>
```

### Method 2: iFrame Embedding

Embed the chat interface directly as an iframe:

```html
<!-- Basic iFrame -->
<iframe 
    src="path/to/chat-widget/index.html"
    width="400" 
    height="600"
    frameborder="0"
    style="border-radius: 12px;">
</iframe>

<!-- With Parameters -->
<iframe 
    src="path/to/chat-widget/index.html?tenantId=company&themeColor=%230047AB"
    width="400" 
    height="600"
    frameborder="0">
</iframe>
```

## ⚙️ Configuration Options

### Global Configuration (Script Method)

```javascript
window.OMNITRIX_CONFIG = {
    // Tenant & Branding
    tenantId: 'your-company',           // Unique tenant identifier
    themeColor: '#0047AB',              // Primary theme color
    agentName: 'Support Agent',         // Agent display name
    welcomeMessage: 'Hello! How can I help?', // Initial message
    
    // Widget Appearance
    buttonText: '💬',                   // Chat button emoji/text
    buttonSize: 60,                     // Button size in pixels
    position: 'bottom-right',           // 'bottom-right' | 'bottom-left'
    offsetX: 20,                        // Distance from screen edge (px)
    offsetY: 20,                        // Distance from screen edge (px)
    
    // Widget Behavior
    autoOpen: false,                    // Auto-open on page load
    iframeWidth: 400,                   // Chat window width
    iframeHeight: 600,                  // Chat window height
    zIndex: 9999,                       // CSS z-index for layering
    
    // File Upload
    maxFileSize: 5242880,               // Max file size (5MB)
    allowedFileTypes: [                 // Allowed image types
        'image/jpeg', 'image/jpg', 
        'image/png', 'image/gif', 
        'image/webp'
    ],
    
    // Response Simulation
    responseDelay: {                    // Agent response timing
        min: 1000,                      // Minimum delay (ms)
        max: 2500                       // Maximum delay (ms)
    }
};
```

### URL Parameters (iFrame Method)

When using iframe embedding, pass configuration via URL parameters:

- `tenantId`: Tenant identifier
- `themeColor`: Theme color (URL encoded, e.g., `%230047AB`)
- `agentName`: Agent name (URL encoded)

## 🎨 Multi-Tenant Examples

### Grameenphone
```javascript
window.OMNITRIX_CONFIG = {
    tenantId: 'grameenphone',
    themeColor: '#0047AB',
    agentName: 'GP Support',
    welcomeMessage: 'Welcome to Grameenphone! How can we assist you?'
};
```

### Robi
```javascript
window.OMNITRIX_CONFIG = {
    tenantId: 'robi',
    themeColor: '#e74c3c',
    agentName: 'Robi Care',
    welcomeMessage: 'Hello from Robi! How may I help you today?'
};
```

### Banglalink
```javascript
window.OMNITRIX_CONFIG = {
    tenantId: 'banglalink',
    themeColor: '#f39c12',
    agentName: 'Banglalink Help',
    welcomeMessage: 'Hi! Welcome to Banglalink support.'
};
```

## 🔧 JavaScript API

When using script embedding, you get access to a JavaScript API:

```javascript
// Widget Control
OmnitrixChat.open();                    // Open the chat widget
OmnitrixChat.close();                   // Close the chat widget
OmnitrixChat.toggle();                  // Toggle open/close state

// Status Check
OmnitrixChat.isOpen();                  // Returns true if widget is open

// Send Messages Programmatically
OmnitrixChat.sendMessage('Hello!');     // Send a message as user

// Update Configuration
OmnitrixChat.updateConfig({
    themeColor: '#e74c3c',
    agentName: 'New Agent Name'
});
```

## 📱 Responsive Behavior

The widget automatically adapts to different screen sizes:

- **Desktop**: Floating widget with configurable positioning
- **Mobile**: Full-screen overlay for optimal mobile experience
- **Tablet**: Responsive sizing that works on both orientations

## 🎯 Chat Features

### Text Messages
- Real-time message display
- Different styling for user vs agent messages
- Timestamps on all messages
- Typing indicators during agent responses

### Image Support
- Drag & drop or click to upload images
- Image preview in chat
- Full-screen modal view
- File type and size validation
- Automatic image compression

### Agent Simulation
- Contextual responses based on keywords
- Random response delays (1-2.5 seconds)
- Smart responses to greetings, help requests, etc.
- Special responses for image uploads

## 🔄 Backend Integration

The widget is designed for easy backend integration. To connect to a real chat system:

1. **Replace Mock Socket**: Modify `lib/socket.js` to connect to your WebSocket/Socket.IO server
2. **Update Message Handling**: Replace the `simulateAgentResponse` function with real message sending
3. **Add Authentication**: Implement user authentication in the widget initialization
4. **File Upload**: Connect image uploads to your file storage service

### Example Backend Integration

```javascript
// Replace in lib/socket.js
function connectToRealBackend() {
    const socket = io('wss://your-server.com');
    
    socket.on('message', (data) => {
        addMessage({
            id: data.id,
            text: data.text,
            sender: 'agent',
            timestamp: new Date(data.timestamp),
            type: 'text'
        });
    });
    
    function sendMessageToServer(message) {
        socket.emit('message', {
            tenantId: config.tenantId,
            message: message.text,
            userId: getCurrentUserId()
        });
    }
}
```

## 🎨 Customization

### Custom Styling
Override CSS variables to match your brand:

```css
:root {
    --primary-color: #your-color;
    --primary-light: #your-light-color;
    --primary-dark: #your-dark-color;
}
```

### Custom Messages
Modify the response arrays in `lib/socket.js`:

```javascript
const agentResponses = [
    "Your custom response 1",
    "Your custom response 2",
    // Add more responses
];
```

## 🔒 Security Considerations

- **File Uploads**: Validate file types and sizes on both client and server
- **XSS Protection**: Sanitize all user inputs when implementing backend
- **CORS**: Configure proper CORS policies for cross-domain embedding
- **Rate Limiting**: Implement message rate limiting on the backend

## 🌐 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Safari**: 12+
- **Chrome Mobile**: 60+

## 📋 Testing

Open `demo.html` in your browser to test all features:

1. Different theme colors
2. Multi-tenant configurations
3. Image upload functionality
4. Responsive behavior
5. JavaScript API methods

## 🚀 Deployment

### CDN Deployment
Upload files to your CDN and reference them:

```html
<script>
window.OMNITRIX_CONFIG = { /* your config */ };
</script>
<script src="https://your-cdn.com/chat-widget/widget.js"></script>
```

### Self-Hosted
1. Upload the `chat-widget` folder to your web server
2. Update the `baseUrl` in your configuration if needed
3. Include the widget script in your HTML

## 🔧 Troubleshooting

### Widget Not Appearing
- Check console for JavaScript errors
- Verify file paths are correct
- Ensure `OMNITRIX_CONFIG` is defined before loading widget.js

### Iframe Issues
- Check for CSP (Content Security Policy) restrictions
- Verify iframe src URL is accessible
- Ensure proper CORS headers if cross-domain

### Mobile Issues
- Test viewport meta tag is present
- Check for touch event conflicts
- Verify responsive CSS is loading

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support, please:
1. Check the demo page for examples
2. Review this documentation
3. Open an issue on the repository

---

**Happy coding! 🎉**

