# JARVIS Assistant - Quick Start Guide

## Prerequisites

- Node.js 16+ installed
- npm package manager
- Anthropic API key (from https://console.anthropic.com)
- Fish Audio API key (from https://fish.audio)

## Installation (Linux/Mac/Chromebook)

### 1. Clone the Repository

```bash
git clone https://github.com/jaiden349/jarvis-assistant.git
cd jarvis-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```
# LLM Configuration
LLM_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
LLM_MODEL=claude-3-5-sonnet-20241022

# Fish Audio TTS Configuration
FISH_AUDIO_API_KEY=your_fish_audio_key
FISH_AUDIO_VOICE_ID=your_voice_id
FISH_AUDIO_BASE_URL=https://api.fish.audio

# Server Configuration
PORT=3001
NODE_ENV=development

# Debug
DEBUG=false
LOG_LEVEL=INFO
```

### 4. Run JARVIS

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### 5. Access JARVIS

Open your browser and navigate to:

```
http://localhost:3001
```

You should see the J.A.R.V.I.S. HUD interface.

## Usage

### Text Input

1. Type a command in the input field
2. Press Enter or click SEND
3. JARVIS processes and responds

Examples:

- "Tell me a joke"
- "What time is it?"
- "What's 25 times 8?"
- "System info"

### Voice Input

1. Click the VOICE button (or use keyboard shortcut)
2. Speak your command clearly
3. JARVIS transcribes and responds with voice

**Note:** Speech Recognition requires HTTPS or localhost. Voice synthesis requires valid Fish Audio API key.

## Chromebook Setup (Linux Container)

If on Acer Chromebook:

### 1. Enable Linux (Beta)

- Settings → Linux (Beta) → Turn on
- Wait for installation (~5 minutes)

### 2. Install Node.js

```bash
sudo apt update
sudo apt install nodejs npm
node --version
```

### 3. Follow Installation Steps Above

Then run JARVIS in the Linux container terminal.

## API Endpoints

### Health Check

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-01T...",
  "components": {
    "database": { "status": "online" },
    "llm": { "status": "online" },
    "voice": { "status": "online" },
    "tools": { "status": "online", "toolCount": 4 }
  }
}
```

### Voice Query

```bash
curl -X POST http://localhost:3001/api/voice/query \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me a joke"}'
```

### Get Memories

```bash
curl http://localhost:3001/api/memory
```

### Get Available Tools

```bash
curl http://localhost:3001/api/tools
```

## Built-in Tools

| Tool | Description | Example |
|------|-------------|----------|
| **joke** | Random joke from API | "Tell me a joke" |
| **time** | Current time and date | "What time is it?" |
| **calculator** | Math calculations | "What's 17 times 28?" |
| **system_info** | System statistics | "System info" |

## Troubleshooting

### "Cannot find module" Error

```bash
npm install
```

### "ENOENT: no such file or directory" (Database)

The `data/` directory will be created automatically.

### API Keys Not Working

- Check `.env` file has correct formatting
- Ensure no extra spaces around `=` signs
- Verify API keys from Anthropic and Fish Audio dashboards

### WebSocket Connection Failed

- Check firewall isn't blocking port 3001
- Ensure server is running: `npm start`
- Try `http://localhost:3001` instead of `127.0.0.1:3001`

### Voice Not Working

- Enable microphone access when prompted
- Use Chrome, Edge, or Firefox (Safari limited support)
- Speech Recognition only works on HTTPS or localhost
- Ensure Fish Audio API key is valid

## Architecture

```
┌─────────────┐
│   Browser   │
│  (HUD UI)   │
└──────┬──────┘
       │ WebSocket / REST
┌──────▼──────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │
   ┌───┴────┬──────────┬──────────┐
   │         │          │          │
  ▼        ▼          ▼         ▼
Orchestrator   ToolRegistry   MemoryManager   VoiceProvider
   │
   ├─→ LLM (Anthropic Claude)
   ├─→ Intent Router
   └─→ Tool Executor
```

## Development

### Run Tests

```bash
npm test
npm run test:watch
```

### View Logs

```bash
tail -f logs/jarvis-*.log
```

### Debug Mode

Set in `.env`:

```
DEBUG=true
LOG_LEVEL=DEBUG
```

## Project Structure

```
jarvis-assistant/
├── public/                    # Frontend files
│   ├── index.html            # Main HUD
│   ├── app.js                # HUD logic
│   └── styles.css            # HUD styling
├── src/
│   ├── orchestrator/         # Main AI logic
│   │   └── index.js
│   ├── voice/                # TTS integration
│   │   └── provider.js
│   ├── tools/                # Tool registry
│   │   └── registry.js
│   ├── memory/               # Memory management
│   │   └── manager.js
│   ├── health/               # Health checks
│   │   └── check.js
│   └── utils/                # Utilities
│       └── logger.js
├── tests/                    # Test files
├── server.js                 # Main server
├── package.json
├── .env.example
├── jest.config.js
└── README.md
```

## Next Steps

1. **Add Web Research** - Search the internet for current information
2. **Computer Control** - Open applications, manage files
3. **Vision Integration** - Camera/screenshot analysis
4. **Proactive Events** - System monitoring and alerts
5. **Advanced Memory** - Vector search and semantic memory
6. **Mobile HUD** - Responsive design for mobile
7. **Custom Voices** - Integrate additional TTS providers

## Support

- **Logs:** Check `logs/jarvis-*.log` for error messages
- **API Docs:** See individual endpoint sections above
- **GitHub Issues:** Report bugs on the repository

## License

MIT
