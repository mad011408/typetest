import express, { Application } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config/environment';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { setupWebSocket } from './websocket/socket';

export class App {
    public app: Application;
    public server: any;
    public io: SocketIOServer;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeWebSocket();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        this.app.use('/api', routes);

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
    }

    private initializeWebSocket(): void {
        setupWebSocket(this.io);
    }

    private initializeErrorHandling(): void {
        this.app.use(errorMiddleware);
    }

    public listen(): void {
        this.server.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📡 WebSocket server ready`);
            console.log(`🤖 Using Bons API: ${config.bonsApi.baseUrl}`);
        });
    }
}

export default App;
