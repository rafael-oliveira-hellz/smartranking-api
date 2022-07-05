import * as mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

export const MatchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuid() },
    category: { type: String },
    players: [{ type: String, ref: 'Player' }],
    def: { type: String, ref: 'Player' },
    result: [{ set: { type: String } }]
  },
  {
    timestamps: true,
    collection: 'matches',
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
