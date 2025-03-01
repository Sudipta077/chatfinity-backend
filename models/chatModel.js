import mongoose, { mongo } from "mongoose";

const chatSchema = mongoose.Schema(
    {
        chatName: {
            type: String,
            trim: true
        },
        isGroupChat: {
            type: Boolean,
            default: false
        },
        picture:{
            type:String,
            default:`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHtnBXLs-B1eevwz417dEJvTnMiOjr2xHvZQ&s`
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        latestMessage:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Message'
        },
        groupAdmin:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    },
    {
        timetamps:true
    }
);

const chatModel = mongoose.model("Chat",chatSchema);
export default chatModel;