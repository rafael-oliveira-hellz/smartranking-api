import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ValidationParamsPipe } from '../common/pipes/validation-params.pipe';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { IPlayer } from './interfaces/player.interface';
import { PlayersService } from './players.service';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<IPlayer> {
    return await this.playersService.createPlayer(createPlayerDto);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('id', ValidationParamsPipe) id: string,
  ): Promise<void> {
    await this.playersService.updatePlayer(id, updatePlayerDto);
  }

  @Get()
  async getAllPlayers(
    @Query('playerId') id: string): Promise<IPlayer[] | IPlayer> {

    if (id) {
      return await this.playersService.getPlayerById(id);
    }

    return await this.playersService.getAllPlayers();
  }

  @Delete(':id')
  async deletePlayer(
    @Param('id', ValidationParamsPipe) id: string,
  ): Promise<void> {
    await this.playersService.deletePlayer(id);
  }
}
