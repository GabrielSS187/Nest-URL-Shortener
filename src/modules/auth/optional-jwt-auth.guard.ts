/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedUser {
  sub: number;
  email: string;
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err, user, _info) {
    return user || undefined;
  }
}
