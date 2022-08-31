import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './interfaces/ranking.schema';
import { RpcException } from '@nestjs/microservices';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy';
import {
  RankingResponse,
  IHistory,
} from './interfaces/ranking-response.interface';
import * as momentTimezone from 'moment-timezone';
import * as _ from 'lodash';
import { EventName } from './event-name.enum';
import { ICategory } from './interfaces/category.interface';
import { IMatch } from './interfaces/match.interface';
import { IChallenge } from './interfaces/challenge.interface';

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel('Ranking') private readonly challengeModel: Model<Ranking>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(RankingsService.name);

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  private clientChallenges =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();

  async processMatch(matchId: string, match: IMatch): Promise<void> {
    try {
      const category: ICategory = await this.clientAdminBackend
        .send('get-categories', match.category)
        .toPromise();

      await Promise.all(
        match.players.map(async (player) => {
          const ranking = new this.challengeModel();

          ranking.category = match.category;
          ranking.challenge = match.challenge;
          ranking.match = matchId;
          ranking.player = player;

          if (player == match.def) {
            const eventFilter = category.events.filter(
              (event) => event.name == EventName.VITORIA,
            );

            ranking.event = EventName.VITORIA;
            ranking.operation = eventFilter[0].operation;
            ranking.points = eventFilter[0].value;
          } else {
            const eventFilter = category.events.filter(
              (event) => event.name == EventName.DERROTA,
            );

            ranking.event = EventName.DERROTA;
            ranking.operation = eventFilter[0].operation;
            ranking.points = eventFilter[0].value;
          }

          this.logger.log(`ranking: ${JSON.stringify(ranking)}`);

          await ranking.save();
        }),
      );
    } catch (error) {
      this.logger.error(`error: ${error}`);
      throw new RpcException(error.message);
    }
  }

  async getRankings(
    categoryId: any,
    dateRef: string,
  ): Promise<RankingResponse[] | RankingResponse> {
    try {
      this.logger.log(`categoryId: ${categoryId} dateRef: ${dateRef}`);

      if (!dateRef) {
        dateRef = momentTimezone().tz('America/Sao_Paulo').format('YYYY-MM-DD');
        this.logger.log(`dateRef: ${dateRef}`);
      }

      /*
                Recuperou os registros de partidas processadas, filtrando a categoria recebida
                na requisição.
            */
      const registerRanking = await this.challengeModel
        .find()
        .where('category')
        .equals(categoryId)
        .exec();

      /*
                Agora vamos recuperar todos os desafios com data menor
                ou igual à data que recebemos na requisição.
                Somente iremos recuperar desafios que estiverem com o status igual 
                a 'REALIZADO' e filtrando a categoria.
            */

      const challenges: IChallenge[] = await this.clientChallenges
        .send('get-challenges-made', {
          categoryId: categoryId,
          dateRef: dateRef,
        })
        .toPromise();

      /*
                Realizaremos um loop nos registros que recuperamos do ranking (partidas processadas)
                e descartaremos os registros (com base no id do desafio) que não retornaram no
                objeto desafios
            */

      _.remove(registerRanking, function (item) {
        return (
          challenges.filter((challenge) => challenge._id == item.challenge)
            .length == 0
        );
      });

      this.logger.log(`registerRanking: ${JSON.stringify(registerRanking)}`);

      //Agrupar por jogador

      const result = _(registerRanking)
        .groupBy('player')
        .map((items, key) => ({
          player: key,
          history: _.countBy(items, 'event'),
          points: _.sumBy(items, 'points'),
        }))
        .value();

      const orderedResult = _.orderBy(result, 'points', 'desc');

      this.logger.log(`orderedResult: ${JSON.stringify(orderedResult)}`);

      const rankingResponseList: RankingResponse[] = [];

      orderedResult.map(function (item, index) {
        const rankingResponse: RankingResponse = {};

        rankingResponse.player = item.player;
        rankingResponse.position = index + 1;
        rankingResponse.score = item.points;

        const history: IHistory = {};

        history.victories = item.history.VITORIA ? item.history.VITORIA : 0;
        history.defeats = item.history.DERROTA ? item.history.DERROTA : 0;
        rankingResponse.matchesHistory = history;

        rankingResponseList.push(rankingResponse);
      });

      return rankingResponseList;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
