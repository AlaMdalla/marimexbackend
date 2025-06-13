import { Router } from "express";
import asyncHandler from "express-async-handler";
import { User, UserModel } from "../models/user.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import cors from "cors";
import { sample_users } from "../data";

const router = Router();

// CORS config (allow local dev + production)
const corsOptions = {
  origin: ['http://localhost:4200', 'https://marimex.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
router.use(cors(corsOptions));

// 🔐 JWT Token Generator
const generateTokenResponse = (user: any) => {
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
    token: token
  };
};

// 👤 Regular Login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    res.send(generateTokenResponse(user));
  } else {
    res.status(HTTP_BAD_REQUEST).send("Username or password is not valid");
  }
}));

// 🆕 Registration
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (user) {
    res.status(HTTP_BAD_REQUEST).send("User already exists, please login");
    return;
  }

  const encryptedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    name,
    email: email.toLowerCase(),
    password: encryptedPassword,
    isAdmin: false
  };

  const dbUser = await UserModel.create(newUser);
  res.send(generateTokenResponse(dbUser));
}));

// 🌱 Seed Users
router.get("/seed", asyncHandler(async (req, res) => {
  const usersCount = await UserModel.countDocuments();
  if (usersCount > 0) {
    res.send("Seed is already done!");
    return;
  }
  await UserModel.create(sample_users);
  res.send("Seed is done!");
}));

// 🔐 Google OAuth Login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    return res.status(400).json({ error: "Email is required from Google token" });
  }

  const { email, name, picture, sub: googleId } = payload;

  let user = await UserModel.findOne({ email });

  if (!user) {
    // Create new user
    user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: 'google_oauth',
      isGoogleLogin: true,
      isAdmin: false,
      googleId,
      picture: picture || ''
    });
  } else if (!user.googleId) {
    // Update existing user
    user.googleId = googleId;
    user.picture = picture || user.picture;
    await user.save();
  }

  const response = generateTokenResponse(user);
  res.status(200).json(response);
}));

export default router;
