/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { USER_REPOSITORY } from '../../user/repositories/user.repository';
import { InMemoryUserRepository } from '../../user/repositories/in-memory-user.repository';
import { URL_REPOSITORY } from '../repositories/url.repository';
import { InMemoryUrlRepository } from '../repositories/in-memory-url.repository';
import { ACCESS_LOG_REPOSITORY } from '../../access-log/repositories/access-log.repository';
import { InMemoryAccessLogRepository } from '../../access-log/repositories/in-memory-access-log.repository';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../../../modules/auth/optional-jwt-auth.guard';

class PrismaServiceStub {
  async onModuleInit() {}
  async onModuleDestroy() {}
}

describe('UrlController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let shortCode: string;
  const email = 'e2e@url.com';
  const password = 'senha123';

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceStub)
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .overrideProvider(URL_REPOSITORY)
      .useClass(InMemoryUrlRepository)
      .overrideProvider(ACCESS_LOG_REPOSITORY)
      .useClass(InMemoryAccessLogRepository)
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { sub: 1, email: 'e2e@url.com' };
          return true;
        },
      })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { sub: 1, email };
          return true;
        },
      })
      .compile();

    app = mod.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await request(app.getHttpServer()).post('/users').send({ email, password });
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    jwtToken = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/urls (POST) → deve encurtar e retornar shortUrl', async () => {
    const r = await request(app.getHttpServer())
      .post('/urls')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ destination: 'https://nestjs.com' })
      .expect(201);
    expect(r.body.shortUrl).toMatch(/\/[A-Za-z0-9]{6}$/);
    shortCode = r.body.shortUrl.split('/').pop()!;
  });

  it('/urls (GET) → deve listar com clickCount=0', async () => {
    const r = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(Array.isArray(r.body)).toBe(true);
    expect(r.body[0].clickCount).toBe(0);
  });
});
