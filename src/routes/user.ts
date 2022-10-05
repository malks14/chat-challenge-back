import { Router } from 'express';
import {
	getUsers,
	getUser,
	deleteUser,
	createUser,
	logInUser
} from '../controllers/user.controller';
import { isAuth } from '../controllers/auth.controller';

const router = Router();

/*
    USERS ROUTES
*/
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.delete('/users/:userId', isAuth, deleteUser);
router.post('/signup', createUser);
router.post('/login', logInUser);

export default router;
