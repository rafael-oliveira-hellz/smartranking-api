import {
  Controller,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParametersValidationPipe } from 'src/common/pipes/parameters-validation.pipe';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { PlayersService } from './players.service';

@Controller('api/v1/players')
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  constructor(private playersService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    this.logger.log(`createPlayerDto: ${JSON.stringify(createPlayerDto)}`);
    await this.playersService.createPlayer(createPlayerDto);
  }

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Param('_id') _id: string) {
    //Retornar o jogador atualizado para o cliente
    return await this.playersService.uploadFile(file, _id);
  }

  @Get()
  async getPlayers(@Query('playerId') _id: string) {
    return await this.playersService.getPlayers(_id);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id', ParametersValidationPipe) _id: string,
  ) {
    await this.playersService.updatePlayer(updatePlayerDto, _id);
  }

  @Delete('/:_id')
  deletePlayer(@Param('_id', ParametersValidationPipe) _id: string) {
    this.playersService.deletePlayer(_id);
  }
}
