// src/modules/url/url.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { URL_REPOSITORY } from './repositories/url.repository';
import { PrismaUrlRepository } from './repositories/prisma-url.repository';
import { ACCESS_LOG_REPOSITORY } from '../access-log/repositories/access-log.repository';
import { PrismaAccessLogRepository } from '../access-log/repositories/prisma-access-log.repository';
import { InMemoryAccessLogRepository } from '../access-log/repositories/in-memory-access-log.repository';
import { InMemoryUrlRepository } from '../repositories/in-memory-url.repository';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    UrlService,
    {
      provide: URL_REPOSITORY,
      useClass: PrismaUrlRepository,
    },
    {
      provide: ACCESS_LOG_REPOSITORY,
      useClass: PrismaAccessLogRepository,
    },
  ],
  controllers: [UrlController],
})
export class UrlModule {}
