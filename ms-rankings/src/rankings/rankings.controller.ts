import { Controller, Logger } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { IMatch } from './interfaces/match.interface';
import { RankingsService } from './rankings.service';
import { RankingResponse } from './interfaces/ranking-response.interface';

const ackErros: string[] = ['E11000'];

@Controller()
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  private readonly logger = new Logger(RankingsController.name);

  @EventPattern('process-match')
  async processarPartida(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`data: ${JSON.stringify(data)}`);
      const matchId: string = data.matchId;
      const match: IMatch = data.match;

      await this.rankingsService.processMatch(matchId, match);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErros.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('get-rankings')
  async getRankings(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<RankingResponse[] | RankingResponse> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { categoryId, dateRef } = data;

      return await this.rankingsService.getRankings(categoryId, dateRef);
    } finally {
      await channel.ack(originalMsg);
    }
  }
}
