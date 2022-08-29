import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { CategoriesModule } from './categories/categories.module';
import { ChallengesModule } from './challenges/challenges.module';
import { PlayersModule } from './players/players.module';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy';
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module';
import { RankingsModule } from './rankings/rankings.module';

@Module({
  imports: [
    CategoriesModule,
    PlayersModule,
    ProxyRMQModule,
    AwsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ChallengesModule,
    RankingsModule,
  ],
  controllers: [],
  providers: [ClientProxySmartRanking],
})
export class AppModule {}
