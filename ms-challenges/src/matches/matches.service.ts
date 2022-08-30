import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChallenge } from '../challenges/interfaces/challenge.interface';
import { RpcException } from '@nestjs/microservices';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy';
import { IMatch } from './interfaces/match.interface';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel('Match') private readonly matchModel: Model<IMatch>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(MatchesService.name);

  private clientChallenges =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();

  async createMatch(match: IMatch): Promise<IMatch> {
    try {
      /*
                Iremos persistir a partida e logo em seguida atualizaremos o
                desafio. O desafio irá receber o ID da partida e seu status
                será modificado para REALIZADO.
            */
      const matchCreated = new this.matchModel(match);
      this.logger.log(`matchCreated: ${JSON.stringify(matchCreated)}`);
      /*
                Recuperamos o ID da partida
            */
      const result = await matchCreated.save();
      this.logger.log(`result: ${JSON.stringify(result)}`);
      const matchId = result._id;
      /*
                Com o ID do desafio que recebemos na requisição, recuperamos o 
                desafio.
            */
      const challenge: IChallenge = await this.clientChallenges
        .send('get-challenges', { playerId: '', _id: match.challenge })
        .toPromise();
      /*
                Acionamos o tópico 'atualizar-desafio-partida' que será
                responsável por atualizar o desafio.
            */
      return await this.clientChallenges
        .emit('update-challenge-match', {
          matchId: matchId,
          challenge: challenge,
        })
        .toPromise();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
