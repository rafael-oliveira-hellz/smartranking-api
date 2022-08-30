import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IPlayer } from 'src/players/interfaces/player.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { ChallengeStatus } from './challenge-status.enum';
import { AttachChallengeMatchDto } from './dtos/attach-challenge-match.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { IChallenge } from './interfaces/challenge.interface';
import { IMatch } from './interfaces/match.interface';

@Injectable()
export class ChallengesService {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private readonly logger = new Logger(ChallengesService.name);

  /*
          Criamos um proxy específico para lidar com o microservice
          desafios
      */
  private clientChallenges =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async createChallenge(createChallengeDto: CreateChallengeDto) {
    this.logger.log(
      `createChallengeDto: ${JSON.stringify(createChallengeDto)}`,
    );

    /*
                  Validações relacionadas ao array de jogadores que participam
                  do desafio
              */
    const players: IPlayer[] = await this.clientAdminBackend
      .send('consultar-jogadores', '')
      .toPromise();

    createChallengeDto.players.map((playerDto) => {
      const playerFilter: IPlayer[] = players.filter(
        (player) => player._id == playerDto._id,
      );

      this.logger.log(`playerFilter: ${JSON.stringify(playerFilter)}`);

      /*
                      Verificamos se os jogadores do desafio estão cadastrados
                  */
      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `O id ${playerDto._id} não é um jogador!`,
        );
      }

      /*
                      Verificar se os jogadores fazem parte da categoria informada no
                      desafio 
                  */
      if (playerFilter[0].category != createChallengeDto.category) {
        throw new BadRequestException(
          `O jogador ${playerFilter[0]._id} não faz parte da categoria informada!`,
        );
      }
    });

    /*
                  Verificamos se o solicitante é um jogador da partida
              */
    const requesterIsAPlayerInTheMatch: IPlayer[] =
      createChallengeDto.players.filter(
        (player) => player._id == createChallengeDto.requester,
      );

    this.logger.log(
      `requesterIsAPlayerInTheMatch: ${JSON.stringify(
        requesterIsAPlayerInTheMatch,
      )}`,
    );

    if (requesterIsAPlayerInTheMatch.length == 0) {
      throw new BadRequestException(
        `O solicitante deve ser um jogador da partida!`,
      );
    }

    /*
                  Verificamos se a categoria está cadastrada
              */
    const category = await this.clientAdminBackend
      .send('get-categories', createChallengeDto.category)
      .toPromise();

    this.logger.log(`categoria: ${JSON.stringify(category)}`);

    if (!category) {
      throw new BadRequestException(`Categoria informada não existe!`);
    }

    await this.clientChallenges.emit('create-challenge', createChallengeDto);
  }

  async getChallenges(playerId: string): Promise<any> {
    /*
              Verificamos se o jogador informado está cadastrado
          */
    if (playerId) {
      const player: IPlayer = await this.clientAdminBackend
        .send('get-players', playerId)
        .toPromise();
      this.logger.log(`jogador: ${JSON.stringify(player)}`);
      if (!player) {
        throw new BadRequestException(`Jogador não cadastrado!`);
      }
    }
    /*
              No microservice 'challenges', o método responsável por consultar os desafios
              espera a estrutura abaixo, onde:
              - Se preenchermos o playerId a consulta de desafios será pelo id do 
              jogador informado
              - Se preenchermos o campo _id a consulta será pelo id do desafio
              - Se não preenchermos nenhum dos dois campos a consulta irá retornar
              todos os desafios cadastrados
          */
    return this.clientChallenges
      .send('get-challenges', { playerId: playerId, _id: '' })
      .toPromise();
  }

  async updateChallenge(updateChallengeDto: UpdateChallengeDto, _id: string) {
    /*
                  Validações em relação ao desafio
              */

    const challenge: IChallenge = await this.clientChallenges
      .send('get-challenges', { playerId: '', _id: _id })
      .toPromise();

    this.logger.log(`desafio: ${JSON.stringify(challenge)}`);

    /*
                  Verificamos se o desafio está cadastrado
              */
    if (!challenge) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    /*
                  Somente podem ser atualizados desafios com status PENDENTE
              */
    if (challenge.status != ChallengeStatus.PENDENTE) {
      throw new BadRequestException(
        'Somente desafios com status PENDENTE podem ser atualizados!',
      );
    }

    await this.clientChallenges.emit('update-challenge', {
      id: _id,
      challenge: updateChallengeDto,
    });
  }

  async attachChallengeMatch(
    attachChallengeMatchDto: AttachChallengeMatchDto,
    _id: string,
  ) {
    const challenge: IChallenge = await this.clientChallenges
      .send('get-challenges', { playerId: '', _id: _id })
      .toPromise();

    this.logger.log(`desafio: ${JSON.stringify(challenge)}`);

    /*
              Verificamos se o desafio está cadastrado
          */
    if (!challenge) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    /*
              Verificamos se o desafio já foi realizado
          */

    if (challenge.status == ChallengeStatus.REALIZADO) {
      throw new BadRequestException(`Desafio já realizado!`);
    }

    /*
              Somente deve ser possível lançar uma partida para um desafio
              com status ACEITO
          */

    if (challenge.status != ChallengeStatus.ACEITO) {
      throw new BadRequestException(
        `Partidas somente podem ser lançadas em desafios aceitos pelos adversários!`,
      );
    }

    /*
              Verificamos se o jogador informado faz parte do desafio
          */
    if (!challenge.players.includes(attachChallengeMatchDto.def)) {
      throw new BadRequestException(
        `O jogador vencedor da partida deve fazer parte do desafio!`,
      );
    }

    /*
              Criamos nosso objeto partida, que é formado pelas
              informações presentes no Dto que recebemos e por informações
              presentes no objeto desafio que recuperamos 
          */
    const match: IMatch = {};
    match.category = challenge.category;
    match.def = attachChallengeMatchDto.def;
    match.challenge = _id;
    match.players = challenge.players;
    match.result = attachChallengeMatchDto.result;

    /*
              Enviamos a partida para o tópico 'criar-partida'
              Este tópico é responsável por persitir a partida na 
              collection Partidas
          */
    await this.clientChallenges.emit('create-match', match);
  }

  async deleteChallenge(_id: string) {
    const challenge: IChallenge = await this.clientChallenges
      .send('get-challenges', { playerId: '', _id: _id })
      .toPromise();

    this.logger.log(`desafio: ${JSON.stringify(challenge)}`);

    /*
              Verificamos se o desafio está cadastrado
          */
    if (!challenge) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    await this.clientChallenges.emit('delete-challenge', challenge);
  }
}
