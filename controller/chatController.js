import Chat from '../models/chatModel.js';
import User from '../models/userModel.js'
export const createChat=async(req,res)=>{
    const {userId} = req.body;
    try{

        if(!userId){
            return res.status(400).json({message:"User doesn't exist"});
        }

        let isChat = await Chat.find({
            isGroupChat:false,
            $and:[
                {
                    users:{$elemMatch:{$eq:req.user._id}}
                },
                {
                    users:{$elemMatch:{$eq:req.userId}}
                }
            ]
        }).populate("users","-password")
        .populate("latestMssage")

        isChat= await User.populate(isChat,{
            path:"latestMessage.sender",
            select:"name,picture,email"
        })
        if(isChat.length > 0){
            res.send(isChat[0]);
        }
        else{
            const chatData = {
                chatName:"sender",
                isGroupChat:false,
                users:[req.user._id,userId]
            }
            
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id:createdChat._id}).populate(
                "users","-password"
            )   
            res.status(200).json(FullChat);
        }
    }
    catch(err){
        console.log(err);
        return res.json({message:err});
    }
}