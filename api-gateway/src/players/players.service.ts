import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { ICategory } from 'src/categories/interfaces/catagory.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { IPlayer } from './interfaces/player.interface';

@Injectable()
export class PlayersService {
  private logger = new Logger(PlayersService.name);

  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private awsService: AwsService,
  ) {}

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async createPlayer(createPlayerDto: CreatePlayerDto) {
    this.logger.log(`createPlayerDto: ${JSON.stringify(createPlayerDto)}`);

    const category: ICategory = await this.clientAdminBackend
      .send('get-categories', createPlayerDto.category)
      .toPromise();

    if (category) {
      await this.clientAdminBackend.emit('create-player', createPlayerDto);
    } else {
      throw new BadRequestException(`Categoria não cadastrada!`);
    }
  }

  async uploadFile(file, _id: string): Promise<any> {
    //Verificar se o player está cadastrado
    const player: IPlayer = await this.clientAdminBackend
      .send('get-players', _id)
      .toPromise();

    if (!player) {
      throw new BadRequestException(`Player não encontrado!`);
    }

    //Enviar o arquivo para o S3 e recuperar a URL de acesso
    const urlPhotoPlayer: { url: '' } = await this.awsService.uploadFile(
      file,
      _id,
    );

    //Atualizar o atributo URL da entidade player
    const updatePlayerDto: UpdatePlayerDto = {};
    updatePlayerDto.playerPhoto_Url = urlPhotoPlayer.url;

    await this.clientAdminBackend.emit('update-player', {
      id: _id,
      player: updatePlayerDto,
    });

    //Retornar o player atualizado para o cliente
    return await this.clientAdminBackend.send('get-players', _id).toPromise();
  }

  async getPlayers(_id: string): Promise<any> {
    return await this.clientAdminBackend
      .send('get-players', _id ? _id : '')
      .toPromise();
  }

  async updatePlayer(updatePlayerDto: UpdatePlayerDto, _id: string) {
    const category: ICategory = await this.clientAdminBackend
      .send('get-categories', updatePlayerDto.category)
      .toPromise();

    if (category) {
      await this.clientAdminBackend.emit('update-player', {
        id: _id,
        player: updatePlayerDto,
      });
    } else {
      throw new BadRequestException(`Categoria não cadastrada!`);
    }
  }

  deletePlayer(_id: string) {
    this.clientAdminBackend.emit('delete-player', { _id });
  }
}
