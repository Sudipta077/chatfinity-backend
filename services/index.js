import { Server } from "socket.io";
class SocketService {
    #io
    constructor(server) {
        console.log("Socket instance initialized.")
        this.#io = new Server(server);
    }

    get io() {
        return this.#io;
    }

    initListener() {
        console.log("Socket listener init.")
        const io = this.io;
        io.on('connect', (socket) => {
            console.log(`New socket connected: ${socket.id}`);


            socket.on('setup', (userData) => {
                console.log("connected user data--->", userData.email);
                socket.join(userData?.id);
                socket.emit('connected');
            })

            socket.on('join chat', (room) => {
                socket.join(room);
                console.log('User joined room--->', room)
            })


            socket.on('new message', async (message) => {
                const chat = message?.chat;
                console.log(`New message received`, chat);
                socket.broadcast.to(chat._id).emit("message received", message);
            })

            socket.on('typing', (room) => {
                socket.to(room).emit('typing')
                console.log("typppppepepep",room);
            });
            socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

        })

      
    }


}
export default SocketService;