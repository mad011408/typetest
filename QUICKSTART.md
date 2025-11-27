# 🚀 Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the application:**
   ```bash
   pnpm dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## First Steps

1. **Select a Model**: Use the dropdown in the top-right to choose your AI model
   - Claude Sonnet 4.5 (Default - Balanced)
   - GPT-5.1 Codex Max (Code Generation)
   - Claude Opus 4.5 (Advanced Reasoning)

2. **Start Chatting**: Type your message and press Send

## Example Prompts

### Product Manager Agent
```
Create a requirements document for a social media app
```

### Architect Agent
```
Design the database schema for an e-commerce platform
```

### Engineer Agent
```
Generate a TypeScript function to validate email addresses
```

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:
```bash
# Kill the process using the port
npx kill-port 3000 3001
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
pnpm store prune
pnpm install
```

### WebSocket Not Connecting
- Check that the backend is running on port 3001
- Verify the VITE_WS_URL in .env is correct

## Project Structure

```
chatbot/
├── packages/
│   ├── frontend/    # React app (port 3000)
│   ├── backend/     # Express server (port 3001)
│   └── ai-engine/   # AI agents
└── .env             # Configuration
```

## Available Commands

```bash
# Development
pnpm dev              # Run all packages
pnpm build            # Build all packages

# Individual packages
cd packages/frontend
pnpm dev              # Run frontend only

cd packages/backend
pnpm dev              # Run backend only
```

## Configuration

All configuration is in `.env`:
- `BONS_API_BASE_URL` - Your Bons API endpoint
- `BONS_API_KEY` - Your API key
- `PORT` - Backend port (default: 3001)

## Next Steps

- Explore the chat interface
- Try different AI models
- Check out the code in `packages/`
- Read the full README.md for more details

Happy coding! 🎉
