import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { AttachChallengeToMatchDto } from './dtos/attach-challenge-match.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { IChallenge } from './interfaces/challenge.interface';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
  ) { }

  private readonly logger = new Logger(ChallengesController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createChallengeDto: CreateChallengeDto): Promise<IChallenge> {
    // this.logger.log(`Creating a new challenge: ${JSON.stringify(createChallengeDto)}`);

    return await this.challengesService.createChallenge(createChallengeDto);
  }

  @Get()
  async findAll(
    @Query('playerId') id: string[]
  ): Promise<Array<IChallenge>> {
    return id ? await this.challengesService.getPlayerChallenges(id) : await this.challengesService.getAllChallenges();
  }

  @Put(':challengeId')
  async update(
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
    @Param('challengeId') id: string): Promise<void> {
    return await this.challengesService.updateChallenge(id, updateChallengeDto);
  }

  @Post(':challengeId/match')
  async attachChallengeToMatch(
    @Body(ValidationPipe) attachChallengeToMatchDto: AttachChallengeToMatchDto,
    @Param('challengeId') id: string,
  ): Promise<void> {
    return await this.challengesService.attachChallengeToMatch(id, attachChallengeToMatchDto);
  }

  @Delete(':challengeId')
  async delete(
    @Param('challengeId') id: string
  ): Promise<void> {
    return await this.challengesService.deleteChallenge(id);
  }
}
