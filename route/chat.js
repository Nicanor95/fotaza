
import 'dotenv/config';
import { Router } from 'express';
import { meInteresa, sendMessage, showChat, showChats } from '../controller/chat.js';
import { authMiddleware } from '../middleware/auth.js';

const chatRouter = Router();

chatRouter.use(authMiddleware);
chatRouter.get("/", showChats);
chatRouter.post("/:image_id", meInteresa);
chatRouter.get("/:chat_id", showChat);
chatRouter.post("/:chat_id/messages", sendMessage);

export default chatRouter;