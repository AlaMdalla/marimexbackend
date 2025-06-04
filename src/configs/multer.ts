import multer from 'multer';
import { Request } from 'express';
import path from 'path';

const storage = multer.diskStorage({
  filename: (req: Request, file, cb) => {
    cb(null, file.originalname);
  }
});

// Create multer instance
const upload = multer({ storage });

export default upload;
