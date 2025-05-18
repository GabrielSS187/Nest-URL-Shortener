import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ACCESS_LOG_REPOSITORY } from './repositories/access-log.repository';
import { PrismaAccessLogRepository } from './repositories/prisma-access-log.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ACCESS_LOG_REPOSITORY,
      useClass: PrismaAccessLogRepository,
    },
  ],
  exports: [ACCESS_LOG_REPOSITORY],
})
export class AccessLogModule {}
