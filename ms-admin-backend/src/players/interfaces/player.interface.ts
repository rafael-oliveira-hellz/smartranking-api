import { Document } from 'mongoose';
import { ICategory } from '../../categories/interfaces/category.interface';

export interface IPlayer extends Document {
  name: string;
  readonly email: string;
  readonly phoneNumber: string;
  category: ICategory;
  ranking: string;
  rankingPosition: number;
  playerPhoto_Url: string;
}
