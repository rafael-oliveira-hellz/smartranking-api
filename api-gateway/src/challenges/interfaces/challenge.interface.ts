import { IPlayer } from 'src/players/interfaces/player.interface';
import { ChallengeStatus } from '../challenge-status.enum';

export interface IChallenge {
  challengeDatetime: Date;
  status: ChallengeStatus;
  requestDatetime: Date;
  ResponseDatetime: Date;
  requester: IPlayer;
  category: string;
  match?: string;
  players: Array<IPlayer>;
}
