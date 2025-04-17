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
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text',
          },
          fileName: String,        // Optional: original file name
          mimeType: String,        // Optional: for frontend rendering logic
          fileSize: Number,        // Optional: to show size on UI
    }
    ,{
        timestamps:true
    }
);
const messageModel = mongoose.model('Message',messageSchema);
export default messageModel;