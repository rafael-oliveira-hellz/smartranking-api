import * as mongoose from 'mongoose';

export const ChallengeSchema = new mongoose.Schema(
  {
    challengeDatetime: { type: Date },
    status: { type: String },
    requestDatetime: { type: Date },
    responseDatetime: { type: Date },
    //solicitante: {type: mongoose.Schema.Types.ObjectId, ref: "Jogador"},
    requester: { type: mongoose.Schema.Types.ObjectId },
    //categoria: {type: String },
    category: { type: mongoose.Schema.Types.ObjectId },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        //ref: "Jogador"
      },
    ],
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
  },
  { timestamps: true, collection: 'challenges' },
);
