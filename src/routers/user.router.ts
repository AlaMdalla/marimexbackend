import { Router } from "express";
import { sample_users } from "../data";
import asynceHandler from  'express-async-handler';
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import bcypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const router = Router();

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:4200', 'https://marimex.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

router.use(cors(corsOptions));
router.use(bodyParser.json());

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

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
}
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Token generation helper
const generateTokenResponse = (user: User) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '100d' }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    picture: user.picture,
    token
  };
};

// Google authentication endpoint
router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    const { email, name, picture, sub: googleId } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Email is required from Google token' });
    }

    // Find or create user
    let user = await UserModel.findOne({ email });
    
    if (!user) {
      // Create new user
      user = await UserModel.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        password: '', // Empty password for Google users
        isAdmin: false,
        googleId,
        picture: picture || ''
      });
    } else if (!user.googleId) {
      // Update existing user with Google info
      user.googleId = googleId;
      user.picture = picture || user.picture;
      await user.save();
    }

    // Generate and return token
    const response = generateTokenResponse(user);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Google authentication error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(401).json({
      error: 'Google authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Regular login endpoint
router.post("/login", asynceHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  
  if (user && await bcypt.compare(password, user.password)) {
    res.send(generateTokenResponse(user));
  } else {
    res.status(HTTP_BAD_REQUEST).send("Username or password is not valid");
  }
}));

// Regular registration endpoint
router.post("/register", asynceHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await UserModel.findOne({ email });
  
  if (user) {
    res.status(HTTP_BAD_REQUEST).send('User already exists, please login');
    return;
  }

  const encryptedPassword = await bcypt.hash(password, 10);
  const newUser: User = {
    name,
    email: email.toLowerCase(),
    password: encryptedPassword,
    isAdmin: false
  };

  const dbUser = await UserModel.create(newUser);
  res.send(generateTokenResponse(dbUser));
}));

export default router;