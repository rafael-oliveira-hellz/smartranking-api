import { Document } from "mongoose";
import { IPlayer } from "src/players/interfaces/player.interface";
import { ChallengeStatus } from "./challenge-status.enum";

export interface IChallenge extends Document {
  requestDatetime: Date;
  answerDatetime: Date;
  challengeDatetime: Date;
  requester: IPlayer;
  category: string;
  status: ChallengeStatus;
  players: Array<IPlayer>;
  match: IMatch;
}

export interface IMatch extends Document {
  category: string;
  players: Array<IPlayer>;
  def: IPlayer;
  result: Array<IResult>;
}

export interface IResult {
  set: string;
}