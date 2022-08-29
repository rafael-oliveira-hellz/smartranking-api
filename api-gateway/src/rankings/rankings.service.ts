import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy';

@Injectable()
export class RankingsService {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientRankingsBackend =
    this.clientProxySmartRanking.getClientProxyRankingsInstance();

  async getRankings(categoryId: string, dateRef: string): Promise<any> {
    if (!categoryId) {
      throw new BadRequestException('O id da categoria é obrigatório!');
    }

    return await this.clientRankingsBackend
      .send('consultar-rankings', {
        categoryId: categoryId,
        dateRef: dateRef ? dateRef : '',
      })
      .toPromise();
  }
}
