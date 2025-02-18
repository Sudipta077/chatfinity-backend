import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();
export const signup = async (req, res) => {
    const { name, email, password, pic } = req.body
    try {
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Incomplete credential field.");
        }

        const userExist = await User.findOne({ email });
        console.log("---------->", userExist);
        if (userExist) {
            res.status(400);
            throw new Error("User Already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword, pic })
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email
            })
        }
        else {
            res.status(400);
            throw new Error("Failed to creaet user.");
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err});

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            res.status(400);
            throw new Error("Incomplete credential field.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400);
            throw new Error("User doesn't exist.");
        }
        
        const decrpyt = await bcrypt.compare(password, user.password);
    
        if (decrpyt === false) {
            res.status(400);
            throw new Error("Wrong credential provided.");
        }
        const userId = user._id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET);
        res.status(200).json(token);


    }
    catch (err) {
        console.log(err);
        return res.json({message:err});
    }
}


export const alluser = async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};

    try {

        const user = req.user;

        const users = await User.find(keyword).find({email: { $ne:user.email}});
        res.json(users);
    }
    catch (err) {
        console.error(err);
        return res.json({message:err});
    }
};




