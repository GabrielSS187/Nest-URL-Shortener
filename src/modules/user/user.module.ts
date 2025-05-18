import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { USER_REPOSITORY } from './repositories/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UserController],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
