import * as mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

export const CategorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuid() },
    category: { type: String, unique: true },
    description: { type: String },
    events: [
      {
        name: { type: String },
        operation: { type: String },
        value: { type: Number },
        _id: false,
        id: { type: String, default: () => uuid() },
      },
    ],
    players: [
      {
        type: String,
        ref: 'Player',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'categories',
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
