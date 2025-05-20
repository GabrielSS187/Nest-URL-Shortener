/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { OptionalJwtAuthGuard } from '../../../modules/auth/optional-jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

class PrismaServiceStub {
  async onModuleInit() {}
  async onModuleDestroy() {}
}

describe('UrlRedirectController (e2e)', () => {
  let app: INestApplication;
  let shortCode: string;
  let jwtToken: string;
  const email = 'redirect@url.com';
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
          req.user = { sub: 1, email };
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

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await request(app.getHttpServer()).post('/users').send({ email, password });
    const resLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    const token = resLogin.body.access_token;
    jwtToken = token;

    const resShorten = await request(app.getHttpServer())
      .post('/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ destination: 'https://nestjs.com' });

    shortCode = resShorten.body.shortUrl.split('/').pop()!;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/:shortCode (GET) → deve redirecionar para a URL original', async () => {
    await request(app.getHttpServer())
      .get(`/${shortCode}`)
      .expect(302)
      .expect('Location', 'https://nestjs.com');
  });

  it('/urls (GET) → clickCount agora = 1', async () => {
    const r = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(r.body[0].clickCount).toBe(1);
  });
});
