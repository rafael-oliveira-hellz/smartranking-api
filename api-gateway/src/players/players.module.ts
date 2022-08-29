import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [ProxyRMQModule, AwsModule],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
