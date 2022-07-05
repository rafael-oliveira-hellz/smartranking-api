import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { PlayersService } from 'src/players/players.service';
import { AttachChallengeToMatchDto } from './dtos/attach-challenge-match.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { IChallenge, IMatch } from './interfaces/challenge.interface';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<IChallenge>,
    @InjectModel('Match') private readonly matchModel: Model<IMatch>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) { }

  private readonly logger = new Logger(ChallengesService.name);

  async createChallenge(createChallengeDto: CreateChallengeDto): Promise<IChallenge> {
    // First verify if the players informed are registered
    const players = await this.playersService.getAllPlayers();

    createChallengeDto.players.map(playerDto => {
      const playerFilter = players.filter(player => player.id == playerDto.id);

      if (playerFilter.length == 0) {
        throw new BadRequestException(`Id ${playerDto.id} is not a valid player!`);
      }
    })

    // Verify if the requester is one of the match players

    const requesterIsOneOfTheMatchPlayers = createChallengeDto.players.filter(player => player.id == createChallengeDto.requester);

    this.logger.log(requesterIsOneOfTheMatchPlayers);

    if (requesterIsOneOfTheMatchPlayers.length == 0) {
      throw new BadRequestException(`Id ${createChallengeDto.requester} is not a valid player!`);
    }

    const playerCategory = await this.categoriesService.getPlayerCategory(createChallengeDto.requester);

    if (!playerCategory) {
      throw new BadRequestException(`Player ${createChallengeDto.requester} has no category!`);
    }

    const challenge = new this.challengeModel(createChallengeDto);

    challenge.category = playerCategory.category;
    challenge.requestDatetime = new Date();
    challenge.status = ChallengeStatus.PENDING;

    this.logger.log('Challenge created: ' + challenge);

    return await challenge.save();
  }

  async getAllChallenges(): Promise<Array<IChallenge>> {
    return await this.challengeModel.find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async getPlayerChallenges(id: any): Promise<Array<IChallenge>> {
    const players = await this.playersService.getAllPlayers();

    const playerFilter = players.filter(player => player.id === id);

    if (playerFilter.length === 0) {
      throw new BadRequestException(`Id ${id} is not a valid player!`);
    }

    return await this.challengeModel.find()
      .where('players')
      .in(id)
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async updateChallenge(id: string, updateChallengeDto: UpdateChallengeDto): Promise<void> {
    const challenge = await this.challengeModel.findById(id).exec();

    if (!challenge) {
      throw new NotFoundException(`Challenge ${id} not found!`);
    }

    if (updateChallengeDto.status) {
      challenge.answerDatetime = new Date();
    }

    challenge.status = updateChallengeDto.status;
    challenge.challengeDatetime = updateChallengeDto.challengeDatetime;

    await this.challengeModel.findOneAndUpdate({ id },
      { $set: challenge })
      .exec();
  }

  async attachChallengeToMatch(id: string, attachChallengeToMatchDto: AttachChallengeToMatchDto): Promise<void> {
    const challenge = await this.challengeModel.findById(id).exec();

    if (!challenge) {
      throw new NotFoundException(`Challenge ${id} not registered!`);
    }

    const playerFilter = challenge.players.filter(
      player => player.id === attachChallengeToMatchDto.def,
    );

    if (playerFilter.length === 0) {
      throw new BadRequestException(
        `Player ${attachChallengeToMatchDto.def} is not a valid player!`,
      );
    }

    const match = new this.matchModel(attachChallengeToMatchDto);

    match.category = challenge.category;
    match.players = challenge.players;

    const result = await match.save();

    challenge.status = ChallengeStatus.PLAYED;

    challenge.match = result.id;

    try {
      await this.challengeModel.findOneAndUpdate({ id },
        { $set: challenge })
        .exec();
    } catch (error) {
      await this.matchModel.deleteOne({ id: result.id }).exec();

      throw new InternalServerErrorException();
    }
  }

  async deleteChallenge(id: string): Promise<void> {
    const challenge = await this.challengeModel.findById(id).exec();

    if (!challenge) {
      throw new BadRequestException(`Challenge ${id} not registered!`);
    }

    challenge.status = ChallengeStatus.CANCELED;

    await this.challengeModel.findOneAndUpdate({ id },
      { $set: challenge }
    ).exec();
  }
}
