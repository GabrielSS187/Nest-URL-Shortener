/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (info?.message === 'No auth token') {
      return undefined;
    }

    if (err || !user) {
      throw err || new UnauthorizedException(info?.message);
    }

    return user;
  }
}
