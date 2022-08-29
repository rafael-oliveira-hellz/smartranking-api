import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPlayer } from './interfaces/player.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<IPlayer>,
  ) {}

  private readonly logger = new Logger(PlayersService.name);

  async createPlayer(player: IPlayer): Promise<void> {
    try {
      const playerCreated = new this.playerModel(player);
      await playerCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getAllPlayers(): Promise<IPlayer[]> {
    try {
      return await this.playerModel.find().populate('category').exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getPlayerById(_id: string): Promise<IPlayer> {
    try {
      return await this.playerModel
        .findOne({ _id })
        .populate('category')
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updatePlayer(_id: string, player: IPlayer): Promise<void> {
    try {
      await this.playerModel.findOneAndUpdate({ _id }, { $set: player }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deletePlayer(_id): Promise<void> {
    try {
      await this.playerModel.deleteOne({ _id }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
