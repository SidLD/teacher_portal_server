const deployment = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: `.env.${deployment}` });

const CONFIG = {
	env: process.env.NODE_ENV,
	PORT: process.env.PORT || 8888,
	DB_HOST: process.env.DB_HOST || '127.0.0.1',
	DB_PORT: process.env.DB_PORT || '27017',
	DB_USERNAME: process.env.DB_USERNAME,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_NAME: process.env.DB_NAME,
	DOCKER_CONTAINER: process.env.DOCKER_CONTAINER,
	JWT_SECRET: process.env.JWT_SECRET || 'TEACHER_SECRET',
	SOCKET: {
		SOCKET_TOKEN: process.env.SOCKET_TOKEN,
		SOCKET_SERVER_URI: process.env.SOCKET_SERVER_URI,
		SOCKET_CLIENT_URI: process.env.SOCKET_CLIENT_URI,
	},
};

export default CONFIG;
