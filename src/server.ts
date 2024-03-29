import express from "express";
import http from 'http';
import cors from "cors";
import path from 'path';
import { dbConnect } from "./configs/database.config";
import marbleRouter from './routers/marble.router';
import userRouter from './routers/user.router';

require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI);

dbConnect();

const app = express();
app.use(express.json());

const corsOptions = {
  //origin: 'https://marimex.netlify.app',
 // credentials: true,
};

//app.use(cors(corsOptions));

app.use("/api/marble", marbleRouter);
app.use("/api/users", userRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

const server = http.createServer(app);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log("Website served on http://localhost:" + port);
});
