import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Credenciais inválidas');
    return user;
  }

  async login(user: UserEntity): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email };
    return Promise.resolve({ access_token: this.jwtService.sign(payload) });
  }
}
