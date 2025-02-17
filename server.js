import dotenv from 'dotenv';
import express from 'express';
import chats from './data/data.js';
import db from './db/config.js';
import userRoute from './routes/userRoute.js'
import chatRoute from './routes/chatRoute.js'

dotenv.config(); 

const app = express();
app.use(express.json());

app.use('/user',userRoute);
app.use('/chat',chatRoute);



const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})