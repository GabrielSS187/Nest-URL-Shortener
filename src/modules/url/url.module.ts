import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { URL_REPOSITORY } from './repositories/url.repository';
import { PrismaUrlRepository } from './repositories/prisma-url.repository';
import { AccessLogModule } from '../access-log/access-log.module';
import { UrlRedirectController } from './url-redirect.controller';

@Module({
  imports: [PrismaModule, AccessLogModule],
  providers: [
    UrlService,
    {
      provide: URL_REPOSITORY,
      useClass: PrismaUrlRepository,
    },
  ],
  controllers: [UrlController, UrlRedirectController],
})
export class UrlModule {}
