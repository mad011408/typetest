import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

router.post('/message', chatController.sendMessage);
router.get('/models', chatController.getModels);
router.post('/validate', chatController.validateConnection);

export default router;
