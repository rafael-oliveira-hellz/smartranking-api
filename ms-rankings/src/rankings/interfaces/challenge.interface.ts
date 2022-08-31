import { ChallengeStatus } from '../challenge-status.enum';

export interface IChallenge {
  _id: string;
  challengeDatetime: Date;
  status: ChallengeStatus;
  requestDatetime: Date;
  responseDatetime?: Date;
  requester: string;
  category: string;
  match?: string;
  players: string[];
}
