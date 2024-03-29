import { Router } from "express";
import { sample_users } from "../data";
import jwt from "jsonwebtoken";
import asynceHandler from  'express-async-handler';
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import bcypt from 'bcryptjs';
const router=Router();

router.get("/seed",asynceHandler(
    async (req, res)=>{
      const UsersCount=await UserModel.countDocuments();
  if(UsersCount>0){
    res.send("Seed is already done !");
    return;
  }
  await UserModel.create(sample_users);
  res.send("Seed Is Done !");
    }
    
  ))
router.post("/login",asynceHandler(
  async(req,res)=>{
    
    const{email,password}=req.body;
   
    const user= await UserModel.findOne({email});
    if(user&&(await bcypt.compare(password,user.password)))
   {res.send(genarateTokenResponse(user)); }
   else{
    res.status(HTTP_BAD_REQUEST).send("username or password not valid");
   } 
}
))
router.post("/register",asynceHandler(
  async(req,res)=>{
    const{name,email,password}=req.body;
    const user= await UserModel.findOne({email});
    if(user){
      res.status(HTTP_BAD_REQUEST)
      .send('user already exist,please login');
      return;
    }
    const encryptpassword=await bcypt.hash(password,10);
    const newUser:User ={
    
     name,
     email:email.toLowerCase(),
     password:encryptpassword,
     isAdmin:false

    }
    const dbUser=await UserModel.create(newUser);
    res.send(genarateTokenResponse(dbUser));
  }
))
const genarateTokenResponse=(user:any)=>{
    const Token = jwt.sign({
        email:user.email, isAdmin:user.isAdmin
    },"test",{expiresIn:"100d"});
    user.token=Token;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      token: Token
    };

}

export default router;