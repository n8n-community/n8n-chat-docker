const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the fullscreen chat page at root
app.get('/', (req, res) => {
  const fs = require('fs');
  let html = fs.readFileSync(path.join(__dirname, 'public', 'fullscreen.html'), 'utf8');
  
  // Inject webhook URL
  html = html.replace(/window\.WEBHOOK_URL/g, `"${process.env.WEBHOOK_URL || 'no webhook configured'}"`);
  
  // Inject chat configuration with more precise replacements
  const chatTitle = process.env.CHAT_TITLE || 'chat title';
  const chatSubtitle = process.env.CHAT_SUBTITLE || 'chat subtitle';

  // Handle initial messages more carefully
  if (process.env.INITIAL_MESSAGES) {
    const messages = process.env.INITIAL_MESSAGES.split(',').map(msg => msg.trim());
    const messagesArray = messages.map(msg => `'${msg.replace(/'/g, "\\'")}'`).join(',\n                        ');
    html = html.replace(
      /initialMessages: \[\s*'Welcome! 👋',\s*'This is your n8n AI assistant in fullscreen mode\. How can I help you\?'\s*\]/,
      `initialMessages: [\n                        ${messagesArray}\n                    ]`
    );
  }
  
  // Replace title and subtitle with exact string matching
  html = html.replace("title: 'n8n Assistant',", `title: '${chatTitle.replace(/'/g, "\\'")}',`);
  html = html.replace("subtitle: 'Fullscreen Chat Experience',", `subtitle: '${chatSubtitle.replace(/'/g, "\\'")}',`);
  
  res.send(html);
});

// Serve static files from public directory (except for routes we handle above)
app.use(express.static('public'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`n8n Chat Container running on port ${PORT}`);
  console.log(`Access the fullscreen chat at: http://localhost:${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
}); 