import { Router } from 'express';
import asynceHandler from 'express-async-handler';
import { CommentModel } from '../models/comment.model';
import { MarbleModel } from '../models/marble.model';
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from '../constants/http_status';

const router = Router();

// Get all comments for a marble
router.get('/marble/:marbleId', asynceHandler(
  async (req, res) => {
    const comments = await CommentModel.find({ marbleId: req.params.marbleId })
      .sort({ createdAt: -1 });
    res.send(comments);
  }
));

// Add a new comment
router.post('/add', asynceHandler(
  async (req, res) => {
    const { marbleId, userId, userName, text, rating } = req.body;

    // Validate marble exists
    const marble = await MarbleModel.findById(marbleId);
    if (!marble) {
      res.status(HTTP_NOT_FOUND).send('Marble not found');
      return;
    }

    // Create new comment
    const newComment = {
      marbleId,
      userId,
      userName,
      
      text,
      rating
    };

    const comment = await CommentModel.create(newComment);
    res.status(201).json(comment);
  }
));

// Update a comment
router.put('/:commentId', asynceHandler(
  async (req, res) => {
    const { text, rating } = req.body;
    const comment = await CommentModel.findById(req.params.commentId);

    if (!comment) {
      res.status(HTTP_NOT_FOUND).send('Comment not found');
      return;
    }

    comment.text = text;
    comment.rating = rating;
    await comment.save();

    res.send(comment);
  }
));

// Delete a comment
router.delete('/:commentId', asynceHandler(
  async (req, res) => {
    const comment = await CommentModel.findByIdAndDelete(req.params.commentId);
    
    if (!comment) {
      res.status(HTTP_NOT_FOUND).send('Comment not found');
      return;
    }

    res.send(comment);
  }
));

export default router; 