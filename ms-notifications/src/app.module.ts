import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.AWS_EMAIL_HOST,
        port: process.env.AWS_EMAIL_PORT,
        secure: process.env.AWS_EMAIL_SECURE,
        tls: {
          ciphers: process.env.AWS_EMAIL_TLS_CIPHERS,
        },
        auth: {
          user: process.env.AWS_EMAIL_USER,
          pass: process.env.AWS_EMAIL_PASSWORD,
        },
      },
    }),
    ProxyRMQModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
