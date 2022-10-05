import express, { Request } from 'express';
import multer, { diskStorage } from 'multer';
import bodyParser from 'body-parser';
import path from 'path';
import uniqid from 'uniqid';
import cors from 'cors';
import { init } from './socket';

import userRoutes from './routes/user';
import chatRoutes from './routes/chat';
import notFoundRoutes from './routes/notFound';
import { StatusError } from './types/StatusError';
import { SocketData } from './types/Socket.types';

const app = express();

app.use(cors());

const fileStorage = diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'dist/images');
	},
	filename: (req, file, callback) => {
		callback(null, `${uniqid()}-${file.originalname}`);
	}
});

const fileFilter = (req: Request, file: any, callback: Function) => {
	let ok = /^image\/(png|jpg|jpeg)/.test(file.mimetype);
	callback(null, ok);
};

app.use(bodyParser.json());

app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(userRoutes);
app.use(chatRoutes);

app.use(notFoundRoutes);

/*
    ERROR HANDLER
*/
app.use((error: any, req: any, res: any, next: any): void => {
	const statusError = error as StatusError;
	const status = statusError.status;
	const message = statusError.message;
	res.status(status).json({ message });
	return;
});

const port = 8080;
const server = app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
	const io = init(server);
	io.on('connection', () => {
		console.log('Client connected!');
	});
});
