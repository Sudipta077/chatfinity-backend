import Message from '../models/messageModel.js'
import User from '../models/userModel.js'
import Chat from '../models/chatModel.js'
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dotenv from 'dotenv';
dotenv.config();
const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: `${process.env.S3_ACCESS_KEY}`,
        secretAccessKey: `${process.env.S3_ACCESS_SECRET}`
    }
})


export const sendMessage = async ({ message, user }) => {
    const { content, chatId, messageType } = message;

    if (!content || !chatId) {
        return { error: "Incomplete details" };
    }

    let newMessage = {
        sender: user.userId,
        content,
        chat: chatId,
        messageType: messageType || 'text',
        fileName: message?.fileName,        // Optional: original file name
        mimeType: message?.mimeType,        // Optional: for frontend rendering logic
        fileSize: message?.fileSize,        // Optional: to show size on UI

    };
    if (messageType !== 'text') {
        if (message.fileName) newMessage.fileName = message.fileName;
        if (message.mimeType) newMessage.mimeType = message.mimeType;
        if (message.fileSize) newMessage.fileSize = message.fileSize;
        if (message.fileSize) newMessage.fileSize = message.fileSize;

    }

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


export const fetchMessage = async (req, res) => {
    try {
        // console.log(req.params.chatId);
        const messages = await Message.find({ chat: req.params.chatId }).populate('sender', 'name email picture').populate('chat');
        res.status(200).json(messages);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}


async function getObjectUrl(key) {
    const command = new GetObjectCommand({
        Bucket: 'chatfinity',
        Key: key
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
}

async function putObjectUrl(chatId, fileName, fileType) {
    const command = new PutObjectCommand({
        Bucket: 'chatfinity',
        Key: `${chatId}/${fileName}`,
        ContentType: fileType
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
}

export const sendFiles = async (req, res) => {
    const { fileSize, fileType } = req.body;
    const fileName = Date.now();
    try {
        // console.log("hello from postFIle---------->");
        const url = await putObjectUrl(req.params.chatId, fileName, fileType)
        // console.log("post url---->", url);
        res.json({ url: url,key:`${req.params.chatId}/${fileName}` });
    }
    catch (err) {
        // console.log("Error in sendFiles-->?", err);
    }
}

export const getFiles = async (req, res) => {
    // console.log("hello from getFIle---------->");
    try {
        const key = req.query.key;
        const url = await getObjectUrl(key);
        // console.log("getUrl--------->", key);
        res.json({ url: url });
    }
    catch (err) {
        console.log("Error at getFIle--->", err);
    }
}