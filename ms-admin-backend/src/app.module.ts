import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }),
    CategoriesModule,
    PlayersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
