import { Schema,model } from "mongoose";
export interface User{
    id?:string;
    email:string;
    name:string;
    password:string;
    isAdmin:boolean;
}
export const UserSchema =new Schema<User>(
    {
        
        email:{type:String,required:true},
        name:{type:String,required:true},
        password:{type:String,required:true},
        isAdmin:{type:Boolean,default:false},
    

    },{
        toJSON:{
            virtuals:true
        },
        toObject:{
            virtuals:true
        },timestamps:true
    }
)
export const UserModel=model<User>('user',UserSchema);