import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();
export const signup = async (req, res) => {
    const { name, email, password, pic } = req.body
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Incomplete credential field." });

        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User Already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword, pic })
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                message: "Signed up"
            })
        }
        else {
            return res.status(400).json({ message: 'Failed to creaet user.' });
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err });

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
            return res.status(404).json({ message: "User doesn't exist." });

        }

        const decrpyt = await bcrypt.compare(password, user.password);

        if (decrpyt === false) {
            return res.status(401).json({ message: "Wrong credential provided." });

        }
        const userId = user._id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET);

        

        res.status(200).json({
            message: "Logged in", 
            token: token,
            userId: userId,
            name: user.name,
            email: user.email,
            pic: user.picture,
        });


    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
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

        const users = await User.find(keyword).find({ email: { $ne: user.email } });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        return res.json({ message: err });
    }
};


export const googleLogin = async (req, res) => {
    const { name, email, picture, password } = req.body;
    try {

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("User doen't exist");
            const createUser = await User.create({ name, email, picture, password });
            if (createUser) {
                const userId = createUser._id;
                const token = jwt.sign({ userId }, process.env.JWT_SECRET);
                return res.status(200).json({
                    message: "Logged in", 
                    token: token,
                    userId: userId,
                    name: createUser.name,
                    email: createUser.email,
                    pic: createUser.picture,
                });
            }
            else {

                return res.status(500).json({ message: "Failed to log in" });
            }
        }
        else {
            console.log("User exists");
            console.log(user);
            const userId = user._id;
            const token = jwt.sign({ userId }, process.env.JWT_SECRET);
            res.status(200).json({
                message: "Logged in", 
                token: token,
                userId: userId,
                name: user.name,
                email: user.email,
                pic: user.picture,
            });

        }

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: err });
    }
}



