import * as mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

export const PlayerSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuid() },
    name: { type: String },
    email: { type: String, unique: true },
    phoneNumber: { type: String },
    ranking: { type: String },
    position: { type: Number },
    playerPhoto_Url: { type: String },
  },
  {
    timestamps: true,
    collection: 'players',
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
