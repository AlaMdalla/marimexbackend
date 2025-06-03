import { Router } from "express";
import { sample_users } from "../data";
import asynceHandler from  'express-async-handler';
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import bcypt from 'bcryptjs';
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const router=Router();
  router.use(cors());

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
    if(user&&await bcypt.compare(password, user.password))
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
    const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const Token = jwt.sign(
  { id: user.id, email: user.email, isAdmin: user.isAdmin },
  JWT_SECRET,
  { expiresIn: '100d' }
);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      token: Token
    };

}
const CLIENT_ID = process.env.CLIENT_ID ;
const client = new OAuth2Client(CLIENT_ID);
router.use(bodyParser.json());

router.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email is required from Google token' });
    }

    // Check if user already exists
    let user = await UserModel.findOne({ email });

    if (!user) {
console.log("entred");      user = await UserModel.create({
        name,
        email: email.toLowerCase(),
        password: '', // optional: set to '' or some Google placeholder
        isAdmin: false,
      });
    }

    // Return same token format as login/register
    const response = genarateTokenResponse(user);
    res.status(200).json(response);
  } catch (err) {
    console.error("Google login error", err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});


export default router;