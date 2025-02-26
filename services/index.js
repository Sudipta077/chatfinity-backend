import { Server } from "socket.io";
class SocketService {
    #io
    constructor(){
        console.log("Socket instance initialized.")
        this.#io= new Server();
    }

    get io(){
        return this.#io;
    }

    initListener(){
        console.log("Socket listener init.")
        const io = this.io; 
        io.on('connect',(socket)=>{
            console.log(`New socket connected: ${socket.id}`);
            socket.on('event:message',async(message)=>{
                console.log(`New message received : ${message}`);
            })
        })
    }


}
export default SocketService;