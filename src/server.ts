import express from "express";
import http from 'http';
import cors from "cors";
import path from 'path';
import { dbConnect } from "./configs/database.config";
import marbleRouter from './routers/marble.router';
import userRouter from './routers/user.router';
import commandeRouter from "./routers/commande.router";
import commentRouter from "./routers/comment.router";

require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI);

dbConnect();

const app = express();
app.use(express.json());

// Allow multiple CORS origins
const allowedOrigins = [
  'https://marimexste.com',
  'https://marimex-frontt-6ti8.vercel.app', 
  'http://localhost:4200'
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/marble", marbleRouter);
app.use("/api/commande", commandeRouter);
app.use("/api/users", userRouter);
app.use("/api/comments", commentRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

const server = http.createServer(app);
const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log("Website served on http://localhost:" + port);
});
