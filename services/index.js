import { Server } from "socket.io";
import Redis from 'ioredis';
import dotenv from 'dotenv';
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
    }

    get io() {
        return this.#io;
    }

    initListener() {
        // console.log("Socket listener init.")
        const io = this.io;
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
                const chat = message?.chat;
                console.log(`New message received`, message);

                await pub.publish("new-messages", JSON.stringify(message));

                sub.on("message", (channel, message) => {
                    if (channel === "new-messages") {
                        const data = JSON.parse(message);
                        socket.broadcast.to(chat._id).emit("message received", data);
                        console.log(`subscriber rcvd------>`, message);
                    }
                })
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