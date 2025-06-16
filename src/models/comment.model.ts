import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types/comment.types';

const commentSchema = new Schema<IComment>(
  {
    marbleId: { type: String, required: true, ref: 'marble' },
    userId: { type: String, required: true, ref: 'user' },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

export const CommentModel = mongoose.model<IComment>('comment', commentSchema); 