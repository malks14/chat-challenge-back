import { Request, Response, NextFunction } from 'express';
import { StatusError } from '../models';
import database from '../database/fetchDatabase';

export default {
	filterMessages: (
		args: any,
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const { userId, chatId, filter } = args;
		const chat = database.getUserChat(userId, chatId);
		if (!chat) {
			throw new StatusError('Could not find user chat', 404);
		}
		return chat.messages.filter((msg) =>
			msg.message.toLowerCase().includes(filter.toLowerCase())
		);
	}
};
