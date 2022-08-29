import { IPlayer } from 'src/players/interfaces/player.interface';

export interface IMatch {
  category?: string;
  challenge?: string;
  players?: IPlayer[];
  def?: IPlayer;
  result?: IResult[];
}

export interface IResult {
  set: string;
}
