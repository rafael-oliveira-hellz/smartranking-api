import { Document } from 'mongoose';

export interface IMatch extends Document {
  category: string;
  challenge: string;
  players: string[];
  def: string;
  result: Array<Result>;
}

export interface Result {
  set: string;
}
