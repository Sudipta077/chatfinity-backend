import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
const db = mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDb Connected");
})
.catch((err)=>{
    console.log(err);
})
export default db;