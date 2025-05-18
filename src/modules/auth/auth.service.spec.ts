// src/modules/auth/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { USER_REPOSITORY } from '../user/repositories/user.repository';
import { InMemoryUserRepository } from '../user/repositories/in-memory-user.repository';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: InMemoryUserRepository;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        UserService,
        {
          provide: USER_REPOSITORY,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<InMemoryUserRepository>(USER_REPOSITORY);
  });

  it('deve validar e retornar o usuário para credenciais corretas', async () => {
    const hash = await bcrypt.hash('senha123', 10);
    const created = await userRepo.create('user@ex.com', hash);

    const result = await service.validateUser('user@ex.com', 'senha123');
    expect(result).toEqual(created);
  });

  it('deve lançar UnauthorizedException para email inexistente', async () => {
    await expect(
      service.validateUser('naoexiste@ex.com', 'qualquer'),
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('deve lançar UnauthorizedException para senha incorreta', async () => {
    const hash = await bcrypt.hash('senha123', 10);
    await userRepo.create('user@ex.com', hash);

    await expect(
      service.validateUser('user@ex.com', 'outrasenha'),
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('deve gerar um access_token ao fazer login', async () => {
    const dummy = new UserEntity(1, 'u@e.com', 'hash', new Date(), new Date());
    const { access_token } = await service.login(dummy);

    expect(access_token).toBeDefined();
    const payload: any = (service as any).jwtService.decode(access_token);
    expect(payload.sub).toBe(dummy.id);
    expect(payload.email).toBe(dummy.email);
  });
});
