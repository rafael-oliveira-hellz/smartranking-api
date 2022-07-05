import { Document } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  readonly email: string;
  readonly phoneNumber: string;
  ranking: string;
  position: number;
  playerPhoto_Url: string;
}
