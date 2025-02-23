import mongoose, { mongo } from "mongoose";

const messageSchema = mongoose.Schema(
    {
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        content:{
            type:String,
            trim:true
        },
        chat:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Chat'
        }
    }
    ,{
        timestamps:true
    }
);
const messageModel = mongoose.model('Message',messageSchema);
export default messageModel;