import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { IPlayer } from './interfaces/player.interface';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<IPlayer>,
  ) { }

  async getAllPlayers(): Promise<IPlayer[]> {
    return await this.playerModel.find().exec();
  }

  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<IPlayer> {
    const { email } = createPlayerDto;

    const player = await this.playerModel.findOne({ email }).exec();

    if (player) {
      throw new NotFoundException('Player [ ' + email + ' ] already exists');
    }
    return await this.create(createPlayerDto);
  }

  async updatePlayer(
    id: string,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<void> {
    const player = await this.playerModel.findOne({ id }).exec();

    if (player) {
      await this.update(id, updatePlayerDto);
    } else {
      throw new NotFoundException('Player [ ' + player.name + ' ] not found');
    }
  }

  async getPlayerById(id: string): Promise<IPlayer> {
    const player = await this.playerModel.findOne({ id }).exec();

    Logger.log(player.id);

    if (!player) {
      throw new NotFoundException('Player [ ' + player + ' ] not found');
    }

    return player;
  }

  async deletePlayer(id: string): Promise<void> {
    await this.delete(id);
  }

  private async create(createPlayerDto: CreatePlayerDto): Promise<IPlayer> {
    const createPlayer = new this.playerModel(createPlayerDto);

    return await createPlayer.save();
  }

  private async update(
    id: string,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<IPlayer> {
    return this.playerModel
      .findOneAndUpdate(
        {
          id,
        },
        { $set: updatePlayerDto },
        { new: true },
      )
      .exec();
  }

  private async delete(id: string): Promise<any> {
    const player = await this.playerModel.findOne({ id }).exec();

    if (!player) {
      throw new NotFoundException('Player [ ' + player.name + ' ] not found');
    }

    return await this.playerModel.deleteOne({ id }).exec();
  }
}
