/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { USER_REPOSITORY } from '../repositories/user.repository';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { PrismaService } from '../../prisma/prisma.service';

class PrismaServiceStub {
  async onModuleInit() {}
  async onModuleDestroy() {}
}

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const email = 'e2e@user.com';
  const password = 'senha123';

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceStub)
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('/users (POST) deve criar um usuário', async (): Promise<void> => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ email, password })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(email);
  });

  it('/users (POST) e-mail duplicado deve retornar 409', async (): Promise<void> => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email, password })
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toContain('Email já cadastrado');
      });
  });
});
