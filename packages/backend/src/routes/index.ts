import { Router } from 'express';
import chatRoutes from './chat.routes';

const router: Router = Router();

router.use('/chat', chatRoutes);

router.get('/', (req, res) => {
    res.json({
        message: 'AI Development Platform API',
        version: '1.0.0',
        endpoints: {
            chat: '/api/chat',
            health: '/health'
        }
    });
});

export default router;
