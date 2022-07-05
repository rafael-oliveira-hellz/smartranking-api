import * as mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

export const ChallengeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuid() },
    requestDatetime: { type: Date },
    answerDatetime: { type: Date },
    challengeDatetime: { type: Date },
    requester: { type: String, ref: 'Player' },
    category: { type: String },
    status: { type: String },
    players: [{ type: String, ref: 'Player' }],
    match: { type: String, ref: 'Match' },

  },
  {
    timestamps: true,
    collection: 'challenges',
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
