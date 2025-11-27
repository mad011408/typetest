# AI Multi-Agent Development Platform

A powerful AI-powered development platform featuring multi-agent collaboration for automated code generation, architecture design, and project management.

## 🚀 Features

- **Multi-Agent System**: Specialized AI agents for different development tasks
  - **Product Manager**: Requirements analysis and feature planning
  - **Architect**: System design and architecture
  - **Engineer**: Code generation and implementation
  
- **Custom LLM Integration**: Uses Bons API with multiple models
  - Claude Sonnet 4.5 (Anthropic)
  - GPT-5.1 Codex Max (OpenAI)
  - Claude Opus 4.5 (Anthropic)

- **Real-time Chat**: WebSocket-based streaming responses
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Type-Safe**: Full TypeScript support across the stack

## 📁 Project Structure

```
ai-dev-platform/
├── packages/
│   ├── frontend/          # React + Vite frontend
│   ├── backend/           # Express backend with WebSocket
│   └── ai-engine/         # AI agents and LLM integration
├── .env.example           # Environment variables template
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Redux Toolkit for state management
- TailwindCSS for styling
- Socket.io-client for real-time communication

### Backend
- Node.js with Express
- Socket.io for WebSocket
- TypeScript
- Custom Bons API integration

### AI Engine
- Multi-agent architecture
- Custom LLM provider
- Specialized agents for different tasks

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   copy .env.example .env
   ```

4. **Edit `.env` file with your Bons API credentials**
   ```env
   BONS_API_BASE_URL=https://go.trybons.ai
   BONS_API_KEY
   ```

## 🚀 Running the Application

### Development Mode

Run all packages in development mode:
```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Individual Packages

Run frontend only:
```bash
cd packages/frontend
pnpm dev
```

Run backend only:
```bash
cd packages/backend
pnpm dev
```

## 🤖 Available AI Models

The platform supports three powerful AI models:

1. **Claude Sonnet 4.5** (Default)
   - Balanced performance and speed
   - Great for general development tasks

2. **GPT-5.1 Codex Max**
   - Advanced code generation
   - Optimized for programming tasks

3. **Claude Opus 4.5**
   - Maximum capability and reasoning
   - Best for complex architectural decisions

## 💬 Usage

1. Start the application with `pnpm dev`
2. Open http://localhost:3000 in your browser
3. Select your preferred AI model from the dropdown
4. Start chatting with the AI agents!

### Example Prompts

**For Product Manager:**
```
Create a requirements document for a task management app
```

**For Architect:**
```
Design a scalable architecture for a real-time chat application
```

**For Engineer:**
```
Generate a React component for user authentication
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BONS_API_BASE_URL` | Bons API base URL | https://go.trybons.ai |
| `BONS_API_KEY` | Your Bons API key | - |
| `PORT` | Backend server port | 3001 |
| `VITE_API_URL` | Frontend API URL | http://localhost:3001 |
| `VITE_WS_URL` | WebSocket URL | ws://localhost:3001 |

## 📝 API Endpoints

### Chat API
- `POST /api/chat/message` - Send a message
- `GET /api/chat/models` - Get available models
- `POST /api/chat/validate` - Validate API connection

### WebSocket Events
- `chat:message` - Send a message
- `chat:start` - Chat started
- `chat:chunk` - Receive message chunk
- `chat:complete` - Chat completed
- `chat:error` - Error occurred
- `models:get` - Request models list
- `models:list` - Receive models list

## 🏗️ Building for Production

Build all packages:
```bash
pnpm build
```

Build individual packages:
```bash
cd packages/frontend
pnpm build

cd packages/backend
pnpm build
```

## 🧪 Testing

Run tests:
```bash
pnpm test
```

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and AI
