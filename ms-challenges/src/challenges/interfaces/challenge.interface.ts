import { Document } from 'mongoose';
import { ChallengeStatus } from '../challenge-status.enum';

export interface IChallenge extends Document {
  challengeDatetime: Date;
  status: ChallengeStatus;
  requestDatetime: Date;
  responseDatetime?: Date;
  requester: string;
  category: string;
  match?: string;
  players: string[];
}
