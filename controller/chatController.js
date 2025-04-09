import Chat from '../models/chatModel.js';
import User from '../models/userModel.js'


// creates chat if there is no chat between me and another user , if exists then that chat is returned with all details

export const createChat = async (req, res) => {
    const { userId } = req.body;
    try {

        if (!userId) {
            return res.status(400).json({ message: "User doesn't exist" });
        }


        const user = await User.findById(req.user.userId);

        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                {
                    users: { $elemMatch: { $eq: userId } }
                },
                {
                    users: { $elemMatch: { $eq: user._id } }
                }
            ]
        }).populate("users", "-password")
            .populate("latestMessage")

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name picture email"
        })
        if (isChat.length > 0) {
            res.send(isChat[0]);
        }
        else {

            const user2 = await User.findById(userId);
            console.log("user2-------->",user2);
            const chatData = {
                chatName: user2.name,
                isGroupChat: false,
                users: [userId, user._id]
            }

            // console.log("isChat===>",user2.name);

            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users", "-password"
            )
            res.status(200).json(FullChat);
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: err });
    }
}

// fetching all chats of me

export const fetchChat = async (req, res) => {

    try {
        const user = await User.findById(req.user.userId);
        const chats = await Chat.find({ users: { $elemMatch: { $eq: user._id } } }).populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })

        const results = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name picture email"
        });

        res.status(200).json(results);
        // console.log(results);
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err })
    }

}


// create a group chat 

export const groupCreate = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Incomplete group details" });
    }

    let users = req.body.users;

    if (users.length < 2) {
        return res.status(400).json({ message: "You need to add more than 2 people." })
    }

    const currentUser = await User.findById(req.user.userId);
    users.push(currentUser._id);

    try {

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: currentUser._id
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", '-password')
            .populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat);

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: err });
    }


}

// rename group 

export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;
    console.log(chatId);
    
    try {
        const upDatedChat = await Chat.findByIdAndUpdate(chatId, {
            chatName
        }, {
            new: true
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        
        // console.log(upDatedChat);
        if (!upDatedChat) {
            return res.status(400).json({ message: "Chat not found." });
        }
        else {
            res.status(200).json(upDatedChat)
        }
    }
    catch (err) {
        console.log(err);
        return res.status(402).json({ message: err });
    }
}

// add new member to group 

export const groupAdd = async (req, res) => {
    const { chatId, userId } = req.body;
    
    try {
        const added = await Chat.findByIdAndUpdate(chatId,
            {
                $push: {
                    users: userId
                }
            },
            {
                new: true
            }
        ).populate("users", "-password")
            .populate("groupAdmin", "-password")


        if (!added) {
            return res.status(400).json({ message: "Chat not found." });
        }
        else {
            res.status(200).json(added)
        }

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: err });
    }
}

export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;
    console.log("removed-->",chatId);
    try {
        const removed =await Chat.findByIdAndUpdate(chatId, {
            $pull: {
                users: userId
            }
        },
            {
                new: true
            }
        ).populate("users", "-password")
            .populate("groupAdmin", "-password")


        if (!removed) {
            return res.status(400).json({ message: "Chat not found." });
        }
        else {
            res.status(200).json(removed)
        }


    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: err });
    }
}