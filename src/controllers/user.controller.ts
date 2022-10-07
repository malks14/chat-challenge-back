import jwt from 'jsonwebtoken';

import database from '../database/fetch';
import { User } from '../models/User';
import { getIO } from '../socket';
import { StatusError } from '../types/StatusError';

const { sign } = jwt;

/*
    USERS CONTROLLERS
*/

export const getUser = (req, res, next): void => {
	try {
		if (!req.user) {
			res.status(401).json({ message: 'Unauthorized action' });
			return;
		}
		const user = database.getUser(req.user);
		if (user) {
			res.status(200).json(user);
			return;
		}
		res.status(404).json({ message: 'User not found' });
	} catch (error) {
		const statusError = new StatusError('Error while fetching data', 500);
		return next(statusError);
	}
};

export const deleteUser = (req, res, next): void => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized action' });
		}
		database.deleteUser(req.user);
		// @ts-ignore
		getIO().emit('users', { action: 'delete', userId });
		return res.status(201).json({ message: 'User deleted successfully' });
	} catch (error) {
		console.log(error);
		const statusError = new StatusError('Error while fetching data', 500);
		return next(statusError);
	}
};

export const createUser = (req, res, next): void => {
	const { name, lastName, email, password } = req.body;
	const image = req.file?.path;
	if (!image) {
		res.status(422).json({ message: 'Missing image file' });
		return;
	}
	// could be done with express-validator
	if (validAttributes(name, lastName, email, password, image)) {
		const user: User = new User(name, lastName, email, password, image);
		try {
			if (!database.getUserByEmail(email)) {
				database.createUser(user);
				// @ts-ignore
				getIO().emit('users', { action: 'register', userId: user.userId });
				res.status(201).json({ message: 'User registered successfully' });
				return;
			}
			res.status(409).json({ message: 'User already registered' });
			return;
		} catch (error) {
			const statusError = new StatusError('Error while fetching data', 500);
			return next(statusError);
		}
	} else {
		res.status(400).json({
			message: 'Bad Request: Make sure all attributes and their types are OK',
			attributes: { name, lastName, email, password }
		});
	}
};

export const logInUser = (req, res, next): void => {
	const { email, password } = req.body;
	if (validAttributes('', '', email, password, '')) {
		try {
			const ok = database.existsUser(email, password);
			if (ok) {
				const { userId } = database.getUserByEmail(email) as User;
				const token = sign(
					{
						userId
					},
					'toremsoftware',
					{ expiresIn: '1h' }
				);
				res.status(201).json({ message: 'Logged In successfully', userId, token });
				return;
			}
			res.status(401).json({ message: 'Incorrect email or password' });
		} catch (error) {
			const statusError = new StatusError('Error while fetching data', 500);
			return next(statusError);
		}
	} else {
		res.status(400).json({
			message: 'Bad Request: Make sure all attributes and their types are OK',
			attributes: { email, password }
		});
	}
};

const validAttributes = (name: any, lastName: any, email: any, password: any, image: any) => {
	return (
		typeof name == 'string' &&
		typeof lastName == 'string' &&
		typeof email == 'string' &&
		typeof password == 'string' &&
		typeof image == 'string'
	);
};
