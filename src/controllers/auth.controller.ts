import jwt from 'jsonwebtoken';

import { StatusError } from '../types/StatusError';

const { verify } = jwt;

/*
    IS AUTH CONTROLLER
*/
export const isAuth = (req, res, next): void => {
	// 1. Get auth header
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		const statusError = new StatusError('Unauthorized action', 401);
		next(statusError);
	}

	// 2. obtain token
	const token = authHeader!.split(' ')[1];
	let decodedToken: any;
	try {
		decodedToken = verify(token, 'toremsoftware');
	} catch (error) {
		const statusError = new StatusError('Unauthorized action', 401);
		next(statusError);
	}

	// 3. verify
	if (!decodedToken) {
		const statusError = new StatusError('Unauthorized action', 401);
		next(statusError);
	}

	req.user = decodedToken!.userId;
	next();
};
