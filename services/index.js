import { Server } from "socket.io";
import Redis from 'ioredis';
import dotenv from 'dotenv';
import {produceMessage,startMessageConsumer} from './kafkaa.js';
import jwt from 'jsonwebtoken';
dotenv.config();


const pub = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

const sub = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

sub.subscribe("new-messages");


class SocketService {
    #io
    constructor(server) {
        // console.log("Socket instance initialized.")
        this.#io = new Server(server);
        this.setupRedisSubscriber();
    }

    get io() {
        return this.#io;
    }

    setupRedisSubscriber() {
        sub.on("message", (channel, message) => {
            if (channel === "new-messages") {
                const data = JSON.parse(message);
                // const chat = data.chat;
                // console.log("new ms g-->",data);
                // // Emit to all sockets in that chat room
                this.io.to(data.message.chatId).emit("message received", data);
                // console.log(`Redis Pub/Sub delivered message to room ${data.message.chatId}`);
            }
        });

        sub.subscribe("new-messages", (err) => {
            if (err) console.error("Redis subscribe error:", err);
            else console.log("Redis subscribed to new-messages");
        });
    }

    initListener() {
        // console.log("Socket listener init.")
        startMessageConsumer();     
        const io = this.io;

        // socket authentication

        io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication error"));
        
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded; // attach user for later use
                console.log("decoded token");

                next();
            } catch (err) {
                console.log("Invalid token : ",err);
                next(new Error("Invalid token"));
            }
        });
        


        io.on('connect', (socket) => {
            // console.log(`New socket connected: ${socket.id}`);


            socket.on('setup', (userData) => {
                // console.log("connected user data--->", userData.email);
                socket.join(userData?.id);
                socket.emit('connected');
            })

            socket.on('join chat', (room) => {
                socket.join(room);
                // console.log('User joined room--->', room)
            })


            socket.on('new message', async (message) => {
                const chat = message;
            
                const user = socket.user;
                // console.log(`New message received`, message);

                try{

                    const data = {
                        message,user
                    }
                    await pub.publish("new-messages", JSON.stringify(data));

                    const {result,error} = await produceMessage(data);                                        
                    if(error){
                        console.log("Errorrrr->",error);
                    }
                    else{
                        console.log("Success->",result);
                        
                    }

                }
                catch(err){
                    console.log("Error while kafka--->",err);
                }
            })

            socket.on('typing', (room) => {
                socket.to(room).emit('typing')
                // console.log("typppppepepep",room);
            });
            socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

        })


    }


}
export default SocketService;