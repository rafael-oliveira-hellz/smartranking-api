import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChallengeStatus } from './challenge-status.enum';
import { RpcException } from '@nestjs/microservices';
import { IChallenge } from './interfaces/challenge.interface';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge')
    private readonly challengeModel: Model<IChallenge>,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async createChallenge(challenge: IChallenge): Promise<IChallenge> {
    try {
      const challengeCreated = new this.challengeModel(challenge);
      challengeCreated.requestDatetime = new Date();
      /*
                Quando um desafio for criado, definimos o status 
                desafio como pendente
            */
      challengeCreated.status = ChallengeStatus.PENDENTE;
      this.logger.log(`challengeCreated: ${JSON.stringify(challengeCreated)}`);
      return await challengeCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getAllChallenges(): Promise<IChallenge[]> {
    try {
      return await this.challengeModel.find().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getPlayerChallenge(_id: any): Promise<IChallenge[] | IChallenge> {
    try {
      return await this.challengeModel.find().where('players').in(_id).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getChallengeById(_id: any): Promise<IChallenge> {
    try {
      return await this.challengeModel.findOne({ _id }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateChallenge(_id: string, challenge: IChallenge): Promise<void> {
    try {
      /*
                Atualizaremos a data da resposta quando o status do desafio 
                vier preenchido 
            */
      challenge.requestDatetime = new Date();
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateChallengeMatch(
    matchId: string,
    challenge: IChallenge,
  ): Promise<void> {
    try {
      /*
                Quando uma partida for registrada por um usuário, mudaremos o 
                status do desafio para realizado
            */
      challenge.status = ChallengeStatus.REALIZADO;
      challenge.match = matchId;
      await this.challengeModel
        .findOneAndUpdate({ _id: challenge._id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deleteChallenge(challenge: IChallenge): Promise<void> {
    try {
      const { _id } = challenge;
      /*
                Realizaremos a deleção lógica do desafio, modificando seu status para
                CANCELADO
            */
      challenge.status = ChallengeStatus.CANCELADO;
      this.logger.log(`desafio: ${JSON.stringify(challenge)}`);
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
