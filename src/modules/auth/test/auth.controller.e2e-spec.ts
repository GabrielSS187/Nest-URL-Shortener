/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { USER_REPOSITORY } from '../../user/repositories/user.repository';
import { InMemoryUserRepository } from '../../user/repositories/in-memory-user.repository';
import { PrismaService } from '../../prisma/prisma.service';

class PrismaServiceStub {
  async onModuleInit() {}
  async onModuleDestroy() {}
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const email = 'e2e@auth.com';
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

    app = mod.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await request(app.getHttpServer()).post('/users').send({ email, password });
  });

  afterAll(() => app.close());

  it('/auth/login (POST) deve retornar 200 e access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body).toHaveProperty('access_token');
  });

  it('/auth/login com credenciais erradas deve retornar 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: '123456789' })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toContain('Credenciais inválidas');
      });
  });
});
