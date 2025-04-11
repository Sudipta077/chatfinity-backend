import Message from '../models/messageModel.js'
import User from '../models/userModel.js'
import Chat from '../models/chatModel.js'
export const sendMessage = async ({ message, user }) => {
    const { content, chatId } = message;

    if (!content || !chatId) {
        return { error: "Incomplete details" };
    }

    let newMessage = {
        sender: user.userId,
        content,
        chat: chatId
    };

    try {
        const isUserInChat = await Chat.exists({ _id: chatId, users: user.userId });

        if (!isUserInChat) {
            return { error: "You are not part of this chat." };
        }

        let createdMessage = await Message.create(newMessage);
        createdMessage = await createdMessage.populate("sender", "-password");
        createdMessage = await createdMessage.populate("chat");
        createdMessage = await User.populate(createdMessage, {
            path: "chat.users",
            select: "name picture email"
        });

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: createdMessage
        });

        // console.log("message created--->",createdMessage);

        return { result: createdMessage };
    } catch (err) {
        console.error("Error in sendMessage:", err);
        return { error: "Internal server error" };
    }
};


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