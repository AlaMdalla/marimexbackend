import mongoose, { Schema } from 'mongoose';
import { IMarble } from '../types/marble.types';

const marbleSchema = new Schema<IMarble>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String], required: true },
    favorite: { type: Boolean, default: false },
    stars: { type: Number, required: true },
    imageurl: { type: String, required: true },
    descriptions: { type: String, required: true }
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

// Add virtual field for comments
marbleSchema.virtual('comments', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'marbleId'
});

export const MarbleModel = mongoose.model<IMarble>('marble', marbleSchema);