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
            default:'https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png'
        }
    },
    {
        timestamps:true
    }
);
const userModel = mongoose.model('User',userSchema);
export default userModel;