import { Document } from 'mongoose';

export interface IPlayer extends Document {
  readonly _id: string;
  name: string;
  readonly email: string;
  readonly phoneNumber: string;
  category: string;
  ranking: string;
  rankingPosition: number;
  playerPhoto_Url: string;
}
