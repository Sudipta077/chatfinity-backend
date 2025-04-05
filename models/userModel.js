import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        picture:{
            type:String,
            default:'https://cdn-icons-png.freepik.com/512/8742/8742495.png'
        }
    },
    {
        timestamps:true
    }
);
const userModel = mongoose.model('User',userSchema);
export default userModel;