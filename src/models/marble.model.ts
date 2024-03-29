import { Schema, model } from "mongoose";

export interface Marble {
  name: string;
  price: number;
  tags?: string[]; // Optional tags field
  favorite: boolean;
  stars: number;
  imageurl: string;
  descriptions: string[];
}

const MarbleSchema = new Schema<Marble>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String] },
    favorite: { type: Boolean, default: false },
    stars: { type: Number, required: true },
    imageurl: { type: String, required: true },
    descriptions: { type: [String], required: true },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

MarbleSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

MarbleSchema.virtual("id").set(function (this: any, id: string) {
  this._id = id;
});

export const MarbleModel = model<Marble>("Marble", MarbleSchema);
