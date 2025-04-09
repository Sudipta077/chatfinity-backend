import dotenv from 'dotenv';
import express from 'express';
import chats from './data/data.js';
import db from './db/config.js';
import userRoute from './routes/userRoute.js'
import chatRoute from './routes/chatRoute.js'
import messageRoute from './routes/messageRoute.js'
import { createServer } from 'node:http';
import SocketService from './services/index.js';
import cors from 'cors';
dotenv.config();
const app = express();
const server = createServer(app);
const socketService = new SocketService();

app.use(cors());
app.use(express.json());



app.use('/user', userRoute);
app.use('/chat', chatRoute);
app.use('/message', messageRoute);


socketService.io.attach(server,
  {
    pingTimout: 60000,
    cors:{
        origin:"http://localhost:3000"
    }
  }
);


socketService.initListener();

const port = process.argv[2] || process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`server running at port ${port}`);
});
