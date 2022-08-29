import { Controller, Get, Query } from '@nestjs/common';
import { RankingsService } from './rankings.service';

@Controller('api/v1/rankings')
export class RankingsController {
  constructor(private rankingsService: RankingsService) {}

  @Get()
  async getRankings(
    @Query('categoryId') categoryId: string,
    @Query('dateRef') dateRef: string,
  ) {
    return await this.rankingsService.getRankings(categoryId, dateRef);
  }
}
