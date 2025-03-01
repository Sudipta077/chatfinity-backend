import Message from '../models/messageModel.js'
import User from '../models/userModel.js'
import Chat from '../models/chatModel.js'
export const sendMessage=async(req,res)=>{
    const {content,chatId} = req.body;
    if(!content || !chatId){
        return res.status(400).json({message:"Incomplete details"});
    }

    let newMessage = {
        sender:req.user.userId,
        content:content,
        chat:chatId
    }   

    try{

        // const targetChat = await Chat.findById(chatId);

        // console.log("req.user.userId->",req.user);

        const isUserInChat = await Chat.exists({ _id: chatId , users: req.user.userId });
        

        // console.log("target chat---->",isUserInChat);

        if(!isUserInChat)
            return res.status(401).json({message:"You are not a chat."});

        let message =  await Message.create(newMessage);
        message = await message.populate("sender","-password");
        message = await message.populate("chat");
        message = await User.populate(message,{
            path:'chat.users',
            select:"name picture email"
        })

        await Chat.findByIdAndUpdate(chatId,{
            latestMessage:message   
        })
        // console.log("message ---->",message);
        res.status(200).json(message);

    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:err});
    }

}

export const fetchMessage=async(req,res)=>{
    try{
        // console.log(req.params.chatId);
        const messages = await Message.find({chat:req.params.chatId}).populate('sender','name email picture').populate('chat');
        res.status(200).json(messages);
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:err});
    }
}