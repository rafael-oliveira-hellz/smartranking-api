import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { AttachChallengeMatchDto } from './dtos/attach-challenge-match.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    this.logger.log(
      `createChallengeDto: ${JSON.stringify(createChallengeDto)}`,
    );
    await this.challengesService.createChallenge(createChallengeDto);
  }

  @Get()
  async getChallenges(@Query('playerId') playerId: string) {
    return await this.challengesService.getChallenges(playerId);
  }

  @Put('/:challenge')
  async updateChallenge(
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
    @Param('challenge') _id: string,
  ) {
    this.challengesService.updateChallenge(updateChallengeDto, _id);
  }

  @Post('/:challenge/match/')
  async attachChallengeMatch(
    @Body(ValidationPipe) attachChallengeMatchDto: AttachChallengeMatchDto,
    @Param('challenge') _id: string,
  ) {
    await this.challengesService.attachChallengeMatch(
      attachChallengeMatchDto,
      _id,
    );
  }

  @Delete('/:_id')
  async deleteChallenge(@Param('_id') _id: string) {
    await this.challengesService.deleteChallenge(_id);
  }
}
