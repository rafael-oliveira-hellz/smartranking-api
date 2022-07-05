import { IsNotEmpty, IsString } from 'class-validator';
import { IPlayer } from '../../players/interfaces/player.interface';
import { IResult } from '../interfaces/challenge.interface';

export class AttachChallengeToMatchDto {
  @IsNotEmpty()
  @IsString()
  def: IPlayer;

  @IsNotEmpty()
  @IsString()
  result: Array<IResult>;
}