import database from '../database/fetch';
import { StatusError } from '../types/StatusError';
import { Chat, Message } from '../models';
import { getIO } from '../socket';

/*
    CHAT CONTROLLERS
*/
export const getUserChats = (req, res, next): void => {
	try {
		if (!req.user) {
			res.status(401).json({ message: 'Unauthorized action' });
			return;
		}
		const chats = database.getUserChats(req.user);
		res.status(200).json({ chats });
		return;
	} catch (error) {
		const statusError = new StatusError('Unauthorized action', 401);
		next(statusError);
	}
};

export const createChat = (req, res, next): void => {
	if (!req.user) {
		res.status(401).json({ message: 'Unauthorized action' });
		return;
	}
	try {
		const { name } = req.body;
		const image = req.file?.path;
		if (name && image) {
			const chat = new Chat(name, image);
			database.createChat(req.user, chat);
			// @ts-ignore
			getIO().emit('chats', {
				action: 'create',
				userId: req.user,
				chatId: chat.chatId
			});
			res.status(201).json({ message: 'Chat created successfully' });
			return;
		} else {
			res
				.status(400)
				.json({ message: 'Must provide a valid recipient name and image' });
			return;
		}
	} catch (error) {
		const statusError = new StatusError('Error while fetching data', 500);
		next(statusError);
	}
};

export const sendMessage = (req, res, next): void => {
	const { chatId } = req.params;

	if (!req.user) {
		res.status(401).json({ message: 'Unauthorized action' });
		return;
	}
	try {
		const chat = database.getUserChat(req.user, chatId);
		if (chat) {
			const { message } = req.body;
			const msg = new Message(message, false);
			database.sendMessage(req.user, chatId, msg);
			// @ts-ignore
			getIO().emit('chats', {
				action: 'SentNewMessage',
				userId: req.user,
				chatId: chat.chatId
			});
			res.status(201).json({ message: 'Message sent successfully' });
			// sends reply after 5 seconds
			setTimeout(() => sendReplyMessage(req.user, chatId), 5000);
			return;
		} else {
			res.status(404).json({ message: 'Could not find user chat' });
			return;
		}
	} catch (error) {
		const statusError = new StatusError('Error while fetching data', 500);
		next(statusError);
	}
};

export const deleteChat = (req, res, next): void => {
	const { chatId } = req.params;
	if (!req.user) {
		res.status(401).json({ message: 'Unauthorized action' });
		return;
	}
	try {
		const chat = database.getUserChat(req.user, chatId);
		if (chat) {
			database.deleteChat(req.user, chatId);
			// @ts-ignore
			getIO().emit('chats', {
				action: 'delete',
				userId: req.user,
				chatId: chat.chatId
			});
			res.status(201).json({ message: 'Chat history deleted successfully' });
			return;
		} else {
			res.status(404).json({ message: 'Could not find user chat' });
			return;
		}
	} catch (error) {
		const statusError = new StatusError('Error while fetching data', 500);
		next(statusError);
	}
};

const sendReplyMessage = (userId: string, chatId: string): void => {
	try {
		randomChanceOfError();
		const chat = database.getUserChat(userId, chatId);
		if (chat) {
			const text = `Este es un mensaje de prueba! Deberías de recibir este mensaje luego de 5 segundos de haber enviado uno.`;
			const msg = new Message(text, true);
			database.sendMessage(userId, chatId, msg);
			// @ts-ignore
			getIO().emit('chats', {
				action: 'ReceivedNewMessage',
				userId,
				chatId: chat.chatId
			});
		}
	} catch (error) {
		// @ts-ignore
		getIO.emit('chats', {
			action: 'error',
			error: 'Could not fetch database while sending a reply message'
		});
	}
};

const randomChanceOfError = () => {
	const chance = randomIntFromInterval(1, 10);
	if (chance >= 8) {
		throw new Error();
	}
};

const randomIntFromInterval = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1) + min);
