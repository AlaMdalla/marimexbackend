import { Schema, model } from "mongoose";
import { IMarble } from "../types/marble.types";
import { cartItem } from "./cartItem.model";

export interface ICommande {
  id?: string;
  list_marbles: IMarble[];
  number_of_phone: string;
  order_name: string;

  totalPrice: number;
  location: { lat: number; lng: number };
}

export const CommandeSchema = new Schema<ICommande>(
  {
    list_marbles: [
      {
        type: Object, // or use cartItem.schema if you have a schema for cartItem
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
        number_of_phone: {
      type: String,
      required: true,
    },
     order_name: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
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

export const CommandeModel = model<ICommande>("commande", CommandeSchema);
