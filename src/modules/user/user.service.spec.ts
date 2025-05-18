/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { USER_REPOSITORY } from './repositories/user.repository';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repo: InMemoryUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<InMemoryUserRepository>(USER_REPOSITORY);
  });

  it('deve registrar um novo usuário com senha hash', async () => {
    const email = 'test@example.com';
    const plain = 'senhaSegura';
    const user = await service.register(email, plain);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.password).not.toBe(plain);
    const match = await bcrypt.compare(plain, user.password);
    expect(match).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('não deve registrar e-mail duplicado', async () => {
    const email = 'dup@example.com';
    await service.register(email, 'senha1');
    await expect(service.register(email, 'senha2')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('deve buscar usuário por e-mail', async () => {
    const email = 'find@example.com';
    await service.register(email, 'abc123');
    const found = await service.findByEmail(email);
    expect(found).not.toBeNull();
    expect(found?.email).toBe(email);
  });

  it('findByEmail retorna null se não existir', async () => {
    const found = await service.findByEmail('no@user.com');
    expect(found).toBeNull();
  });

  it('deve buscar usuário por ID', async () => {
    const created = await service.register('byid@example.com', 'pass');
    const found = await service.findById(created.id);
    expect(found.id).toBe(created.id);
    expect(found.email).toBe(created.email);
  });

  it('findById lança NotFoundException se não existir', async () => {
    await expect(service.findById(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve atualizar dados do usuário', async () => {
    const user = await service.register('up@example.com', '123456');
    user.email = 'updated@example.com';
    const updated = await service.update(user);
    expect(updated.id).toBe(user.id);
    expect(updated.email).toBe('updated@example.com');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      user.createdAt.getTime(),
    );
  });

  it('deve remover (soft-delete) usuário', async () => {
    const user = await service.register('rm@example.com', 'pwd');
    await service.remove(user.id);
    await expect(service.findById(user.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
