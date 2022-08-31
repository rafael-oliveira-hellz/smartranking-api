import { Injectable, Logger } from '@nestjs/common';
import { IChallenge } from './interfaces/challenge.interface';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy';
import { IPlayer } from './interfaces/player.interface';
import { RpcException } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';
import HTML_NOTIFICATION_ADVERSARY from './static/html-notification-adversary';

@Injectable()
export class AppService {
  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private readonly mailService: MailerService,
  ) {}

  private readonly logger = new Logger(AppService.name);

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async sendEmailToAdversary(challenge: IChallenge): Promise<void> {
    try {
      /*
        Identificar o ID do adversario
      */

      let adversaryId = '';

      challenge.players.map((player) => {
        if (player != challenge.requester) {
          adversaryId = player;
        }
      });

      //Consultar as informações adicionais dos playeres

      const adversary: IPlayer = await this.clientAdminBackend
        .send('get-players', adversaryId)
        .toPromise();

      const requester: IPlayer = await this.clientAdminBackend
        .send('consultar-playeres', challenge.requester)
        .toPromise();

      let markup = '';

      markup = HTML_NOTIFICATION_ADVERSARY;
      markup = markup.replace(/#NOME_ADVERSARIO/g, adversary.name);
      markup = markup.replace(/#NOME_SOLICITANTE/g, requester.name);

      this.mailService
        .sendMail({
          to: adversary.email,
          from: `"SMART RANKING" <api.smartranking@gmail.com>`,
          subject: 'Notificação de Desafio',
          html: markup,
        })
        .then((success) => {
          this.logger.log(success);
        })
        .catch((err) => {
          this.logger.error(err);
        });
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
