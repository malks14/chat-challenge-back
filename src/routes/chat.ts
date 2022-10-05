import { Router } from 'express';
import {
	getUserChats,
	createChat,
	sendMessage,
	deleteChat
} from '../controllers/chat.controller';
import { isAuth } from '../controllers/auth.controller';

const router = Router();

/*
    CHATS ROUTES
*/

router.get('/chats', isAuth, getUserChats);
router.post('/chats/:userId', isAuth, createChat);
router.post('/chats/:userId/:chatId', isAuth, sendMessage);
router.delete('/chats/:userId/:chatId', isAuth, deleteChat);

export default router;
