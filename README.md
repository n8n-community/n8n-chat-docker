# n8n Chat Container

A containerized n8n chat widget that can be easily deployed and connected to your n8n webhooks for AI-powered conversations.

## 🚀 Features

- **Easy Deployment**: Containerized with Docker for simple deployment
- **Kubernetes Ready**: Production-ready Kubernetes manifests with auto-scaling and high availability
- **Environment Variable Configuration**: Customize title, subtitle, and messages without code changes
- **Optimized Container**: Alpine-based image for minimal size and security
- **Multiple Modes**: Window mode (chat button) and fullscreen chat interface
- **Flexible Configuration**: Configure via environment variables or URL parameters
- **Health Monitoring**: Built-in health check endpoint and container health monitoring
- **CORS Support**: Cross-origin resource sharing enabled
- **Security Focused**: Non-root user execution and minimal attack surface
- **Multi-Instance Ready**: Deploy multiple chat instances for different purposes
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

Before using this chat container, you need:

1. **n8n Instance**: A running n8n instance (cloud or self-hosted)
2. **Chat Workflow**: A workflow with a Chat Trigger node configured
3. **Docker**: Docker and Docker Compose installed on your system

## 🛠️ Setup Instructions

### Step 1: Create n8n Workflow

1. In your n8n instance, create a new workflow
2. Add a **Chat Trigger** node as the starting point
3. Connect an **AI Agent** or **Chain** node to handle the conversation
4. Configure the Chat Trigger:
   - Set **"Make Chat Publicly Available"** to `true`
   - Add your domain to **"Allowed Origins (CORS)"** (e.g., `http://localhost:3000`)
   - Copy the webhook URL from the node

### Step 2: Deploy the Container

#### Option A: Using Pre-built Image (Recommended)

```bash
docker run -d \
  -p 3000:3000 \
  -e WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id \
  -e CHAT_TITLE="Customer Support" \
  -e CHAT_SUBTITLE="We're here to help" \
  -e INITIAL_MESSAGES="Welcome! 👋, How can I assist you today?, Feel free to ask anything" \
  --name n8n-chat \
  ghcr.io/ppyly-org/n8n-chat-docker:latest
```

#### Option B: Using Docker Compose (Recommended for production)

1. Clone or download this repository
2. Edit `docker-compose.yml` and configure your chat:
   ```yaml
   environment:
     - WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
     - CHAT_TITLE=Customer Support
     - CHAT_SUBTITLE=We're here to help
     - INITIAL_MESSAGES=Welcome! 👋, How can I assist you today?, Feel free to ask anything
   ```
3. Run the container:
   ```bash
   docker-compose up -d
   ```

#### Option C: Build from Source

```bash
git clone https://github.com/ppyly-org/n8n-chat-docker.git
cd n8n-chat-docker
docker build -t n8n-chat .
docker run -d \
  -p 3000:3000 \
  -e WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id \
  -e CHAT_TITLE="Customer Support" \
  -e CHAT_SUBTITLE="We're here to help" \
  -e INITIAL_MESSAGES="Welcome to our support! 👋, How can I assist you?, Feel free to ask questions" \
  --name n8n-chat \
  --health-cmd="node -e \"require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })\"" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  n8n-chat
```

#### Option D: Kubernetes Deployment

For production environments, deploy to Kubernetes:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Access via port-forward for testing
kubectl port-forward service/n8n-chat-service 3000:80 -n n8n-chat
```

See the [k8s/README.md](k8s/README.md) for detailed Kubernetes deployment instructions.

#### Option E: Without Docker

```bash
npm install
npm start
```

### Step 3: Access the Chat

- **Main Interface**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## ⚙️ Configuration Options

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `3000` | `3000` |
| `NODE_ENV` | Node environment | `production` | `production` |
| `WEBHOOK_URL` | n8n webhook URL | Not set | `https://n8n.example.com/webhook/abc123` |
| `CHAT_TITLE` | Chat window title | `chat title` | `Customer Support` |
| `CHAT_SUBTITLE` | Chat window subtitle | `chat subtitle` | `We're here to help` |
| `INITIAL_MESSAGES` | Comma-separated initial messages | Default welcome messages | `Hello! 👋, How can I help you today?, Feel free to ask any questions` |

### Quick Setup with Environment Variables

You can now customize the chat experience entirely through environment variables without modifying code:

```bash
# Sales Team Configuration
docker run -d \
  -p 3000:3000 \
  -e WEBHOOK_URL=https://your-n8n.com/webhook/sales \
  -e CHAT_TITLE="Sales Team" \
  -e CHAT_SUBTITLE="Let's find your perfect solution" \
  -e INITIAL_MESSAGES="Hi! Looking for our products? 💼, I can help you find the perfect solution, What are you interested in learning about?" \
  --name sales-chat \
  ghcr.io/ppyly-org/n8n-chat-docker:latest

# Support Team Configuration  
docker run -d \
  -p 3001:3000 \
  -e WEBHOOK_URL=https://your-n8n.com/webhook/support \
  -e CHAT_TITLE="Technical Support" \
  -e CHAT_SUBTITLE="We'll get you sorted out" \
  -e INITIAL_MESSAGES="Hello! Need help with something? 🛠️, I'm here to troubleshoot any issues, What can I help you with?" \
  --name support-chat \
  ghcr.io/ppyly-org/n8n-chat-docker:latest
```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  n8n-chat:
    build: .
    ports:
      - "3000:3000"
    environment:
      - WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
      - CHAT_TITLE=Customer Support
      - CHAT_SUBTITLE=We're here to help you
      - INITIAL_MESSAGES=Welcome to our support! 👋, How can we assist you today?, Feel free to ask any questions
    restart: unless-stopped
```

## 🎨 Chat Widget Customization

The chat widget can be extensively customized to match your brand and requirements. Here are the main customization options:

### Visual Styling

Customize the appearance using CSS variables:

```css
:root {
  --chat--color-primary: #your-brand-color;
  --chat--color-primary-shade: #darker-shade;
  --chat--color-secondary: #secondary-color;
  --chat--window--width: 400px;
  --chat--window--height: 600px;
  --chat--window--border-radius: 12px;
  --chat--header--background: #your-header-color;
  --chat--message--bot--background: #bot-message-bg;
  --chat--message--user--background: #user-message-bg;
  /* ... more variables available */
}
```

### Content Customization

#### Initial Messages
Customize the welcome messages that users see when they first open the chat:

```javascript
initialMessages: [
    'Welcome to our support chat! 👋',
    'I\'m here to help with your questions about our products and services.',
    'What can I assist you with today?'
]
```

#### Internationalization & Labels
Customize all text labels and messages:

```javascript
i18n: {
    en: {
        title: 'Customer Support',           // Chat window title
        subtitle: 'We\'re here to help',    // Chat window subtitle  
        footer: 'Powered by AI',            // Footer text
        getStarted: 'Start Conversation',   // Welcome screen button
        inputPlaceholder: 'Type your message...', // Input field placeholder
        // Add more custom labels as needed
    },
}
```

#### Chat Modes
- **Window Mode**: Chat button in bottom-right corner (default)
- **Fullscreen Mode**: Full-page chat interface

## 🔧 Advanced Configuration

### Custom Initial Messages

You can customize the initial messages for different use cases by modifying the `initialMessages` array in the HTML files:

#### Customer Support Setup
```javascript
initialMessages: [
    'Welcome to our support chat! 👋',
    'I can help you with:',
    '• Product questions and troubleshooting',
    '• Account and billing inquiries', 
    '• Technical assistance',
    'What can I help you with today?'
]
```

#### Sales & Marketing Setup
```javascript
initialMessages: [
    'Hi there! 🚀',
    'Interested in learning more about our solutions?',
    'I can help you:',
    '• Explore our product features',
    '• Get pricing information',
    '• Schedule a demo',
    'How can I assist you?'
]
```

#### Topic-Specific Configuration
You can create different chat configurations for different topics or departments:

```javascript
// For technical support
{
    webhookUrl: 'your-support-webhook-url',
    initialMessages: [
        'Technical Support Chat 🛠️',
        'I\'m here to help resolve any technical issues you\'re experiencing.'
    ],
    i18n: {
        en: {
            title: 'Tech Support',
            subtitle: 'Technical assistance',
        }
    }
}

// For sales inquiries  
{
    webhookUrl: 'your-sales-webhook-url',
    initialMessages: [
        'Sales Team Chat 💼',
        'Let\'s find the perfect solution for your business needs!'
    ],
    i18n: {
        en: {
            title: 'Sales Team',
            subtitle: 'Business solutions',
        }
    }
}
```

### Multiple Chat Instances

You can easily deploy multiple instances with different configurations using environment variables:

```bash
# Support chat instance
docker run -d -p 3001:3000 \
  -e WEBHOOK_URL=https://n8n.com/webhook/support \
  -e CHAT_TITLE="Technical Support" \
  -e CHAT_SUBTITLE="We'll solve your technical issues" \
  -e INITIAL_MESSAGES="Technical Support here! 🛠️, What technical issue can I help you with?, I'm ready to troubleshoot" \
  --name support-chat ghcr.io/ppyly-org/n8n-chat-docker:latest

# Sales chat instance  
docker run -d -p 3002:3000 \
  -e WEBHOOK_URL=https://n8n.com/webhook/sales \
  -e CHAT_TITLE="Sales Team" \
  -e CHAT_SUBTITLE="Let's find your perfect solution" \
  -e INITIAL_MESSAGES="Hi there! 💼, Interested in our products?, Let me help you find the perfect solution" \
  --name sales-chat ghcr.io/ppyly-org/n8n-chat-docker:latest

# General support chat
docker run -d -p 3003:3000 \
  -e WEBHOOK_URL=https://n8n.com/webhook/general \
  -e CHAT_TITLE="Customer Service" \
  -e CHAT_SUBTITLE="How can we help you today?" \
  -e INITIAL_MESSAGES="Welcome! 👋, I'm here to help with any questions, What can I assist you with?" \
  --name general-chat ghcr.io/ppyly-org/n8n-chat-docker:latest
```

### Environment Variable Best Practices

#### Message Formatting
- Separate multiple initial messages with commas
- Use quotes if messages contain special characters
- Keep messages concise but friendly
- Consider using emojis for personality

#### Examples by Use Case

**Customer Support:**
```bash
CHAT_TITLE="Customer Support"
CHAT_SUBTITLE="We're here to help"
INITIAL_MESSAGES="Hello! 👋, How can I help you today?, I can assist with orders, returns, and general questions"
```

**Sales Team:**
```bash
CHAT_TITLE="Sales Team" 
CHAT_SUBTITLE="Let's find your solution"
INITIAL_MESSAGES="Hi! Interested in our products? 💼, I can help with pricing, features, and demos, What would you like to know?"
```

**Technical Support:**
```bash
CHAT_TITLE="Tech Support"
CHAT_SUBTITLE="Technical assistance available"
INITIAL_MESSAGES="Technical Support here! 🛠️, Having technical issues?, Let me help troubleshoot the problem"
```

### Authentication

If your n8n Chat Trigger uses authentication:

1. **Basic Auth**: The chat widget will prompt for credentials
2. **n8n User Auth**: Users must be logged into n8n
3. **None**: No authentication required

### CORS Configuration

Make sure your n8n Chat Trigger includes your domain in the "Allowed Origins" field:
- For local development: `http://localhost:3000`
- For production: `https://yourdomain.com`
- For all origins: `*` (not recommended for production)

## 📁 Project Structure

```
n8n-chat-container/
├── Dockerfile              # Optimized Alpine-based container configuration
├── .dockerignore           # Docker build context exclusions
├── docker-compose.yml      # Docker Compose setup
├── package.json           # Node.js dependencies
├── server.js             # Express server
├── public/
│   ├── index.html        # Main chat page (window mode)
│   └── fullscreen.html   # Fullscreen chat page
├── k8s/                  # Kubernetes deployment manifests
│   ├── README.md         # Kubernetes deployment guide
│   ├── deployment.yaml   # Application deployment
│   ├── service.yaml      # Kubernetes service
│   ├── ingress.yaml      # Ingress configuration
│   ├── configmap.yaml    # Configuration management
│   ├── secret.yaml       # Secure configuration
│   └── namespace.yaml    # Namespace configuration
└── README.md            # This file
```

## 🐳 Container Details

### Pre-built Images
Pre-built Docker images are automatically created and published to GitHub Container Registry:
- **Latest stable**: `ghcr.io/ppyly-org/n8n-chat-docker:latest`
- **Version tags**: `ghcr.io/ppyly-org/n8n-chat-docker:v1.0.0`
- **Multi-architecture**: Supports both `linux/amd64` and `linux/arm64`

### Security Features
- **Non-root execution**: Container runs as user `nextjs` (UID 1001) for enhanced security
- **Alpine Linux base**: Minimal attack surface with smaller image size
- **Production optimizations**: Only production dependencies installed
- **Health monitoring**: Built-in health checks for container orchestration

### Build Optimizations
- **Automated builds**: GitHub Actions automatically build and test images
- **Layer caching**: Optimized layer order for faster rebuilds
- **Minimal context**: `.dockerignore` excludes unnecessary files
- **Clean dependencies**: Uses `npm ci` for reproducible builds
- **Cache cleanup**: Removes npm cache after installation

## 🐛 Troubleshooting

### Chat Widget Not Loading

1. **Check Webhook URL**: Ensure the webhook URL is correct and accessible
2. **CORS Issues**: Verify your domain is added to "Allowed Origins" in the Chat Trigger
3. **Network Issues**: Check if your n8n instance is reachable from the container

### Container Won't Start

1. **Port Conflicts**: Make sure port 3000 is not already in use
2. **Docker Issues**: Ensure Docker is running and you have sufficient permissions
3. **Build Context**: If build fails, ensure `.dockerignore` is properly configured
4. **Health Check**: Monitor container health with `docker ps` to see health status

### Performance Issues

1. **Image Size**: The Alpine-based image should be significantly smaller (~50-100MB vs 300MB+)
2. **Build Time**: Use Docker layer caching for faster subsequent builds
3. **Memory Usage**: Container runs with minimal footprint due to Alpine base

### Chat Not Responding

1. **Workflow Active**: Make sure your n8n workflow is activated
2. **Agent Configuration**: Verify your AI Agent or Chain node is properly configured
3. **Memory Issues**: If using conversation memory, ensure memory nodes are connected

## 📚 Additional Resources

- [n8n Chat Package Documentation](https://www.npmjs.com/package/@n8n/chat)
- [n8n Chat Trigger Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/)
- [n8n AI Documentation](https://docs.n8n.io/advanced-ai/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Alpine Linux Documentation](https://alpinelinux.org/)

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this container setup.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 