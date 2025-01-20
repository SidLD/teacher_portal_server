import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import {io as IoClient} from 'socket.io-client'
let io:any; 
const SERVER_URI = process.env.SERVER_URI as string
const FRONT_URI = process.env.FRONT_URI as string
const SOCKET_TOKEN = process.env.SOCKET_TOKEN as string

const allowedOrigins = [
  SERVER_URI,
  FRONT_URI
];
console.log(allowedOrigins)

export const initializeSocket = (server:any) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin: any, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket:any, next:any) => {
    next()
  })
  .on('connection', (socket:any) => {
    console.log(chalk.blue('New Socket connected'))
    socket.on(`new-data`, async (data: any) => {
      console.log("New Data", JSON.stringify(data));
      socket.broadcast.emit(`update-data`, JSON.stringify(data));
    });

    socket.on(`create-notification`, async (data: any) => {
      console.log("New Data", JSON.stringify(data));
      socket.broadcast.emit(`notification-${data.user._id}`, JSON.stringify(data));
    });

    socket.on('disconnect', async () => {
      console.log(chalk.red(`Socket is disconnected`));
    });
  });

  return io;
};

export const getSocketIOInstance = () => io;

export const emitNotification = async (data:any) => {
  try {
    const SocketInstance = IoClient(SERVER_URI, {
      auth: { 
        token: SOCKET_TOKEN
       },
      withCredentials: true,
    });
    await new Promise<void>((resolve, reject) => {
      SocketInstance.on('connect', () => {
        resolve();
      });
      SocketInstance.on('connect_error', (err) => {
        reject(err);
      });
    }).then(() => {
      SocketInstance.emit(`new-data`, data, (response:any) => {
        console.log('Response from server:', response);
        SocketInstance.disconnect()
      });
    });  
  } catch (error) {
    console.log(error);
  }
};

export const emitContributorNotification = async (data:any) => {
  try {
    const SocketInstance = IoClient(SERVER_URI, {
      auth: { 
        token: SOCKET_TOKEN
       },
      withCredentials: true,
    });
    await new Promise<void>((resolve, reject) => {
      SocketInstance.on('connect', () => {
        resolve();
      });
      SocketInstance.on('connect_error', (err) => {
        reject(err);
      });
    }).then(() => {
      SocketInstance.emit(`create-notification`, data, (response:any) => {
        console.log('Response from server:', response);
        SocketInstance.disconnect()
      });
    });  
  } catch (error) {
    console.log(error);
  }
};