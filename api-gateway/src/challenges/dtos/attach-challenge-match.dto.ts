import { IsNotEmpty } from 'class-validator';
import { IPlayer } from 'src/players/interfaces/player.interface';
import { IResult } from '../interfaces/match.interface';

export class AttachChallengeMatchDto {
  @IsNotEmpty()
  def: IPlayer;

  @IsNotEmpty()
  result: Array<IResult>;
}
