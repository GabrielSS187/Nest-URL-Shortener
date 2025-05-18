import { Test, TestingModule } from '@nestjs/testing';
import { UrlService, UrlWithClicksDto } from '../url.service';
import { URL_REPOSITORY } from '../repositories/url.repository';
import { ACCESS_LOG_REPOSITORY } from '../../access-log/repositories/access-log.repository';
import { InMemoryUrlRepository } from '../repositories/in-memory-url.repository';
import { InMemoryAccessLogRepository } from '../../access-log/repositories/in-memory-access-log.repository';
import { NotFoundException } from '@nestjs/common';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepo: InMemoryUrlRepository;
  let logRepo: InMemoryAccessLogRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: URL_REPOSITORY, useClass: InMemoryUrlRepository },
        {
          provide: ACCESS_LOG_REPOSITORY,
          useClass: InMemoryAccessLogRepository,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepo = module.get<InMemoryUrlRepository>(URL_REPOSITORY);
    logRepo = module.get<InMemoryAccessLogRepository>(ACCESS_LOG_REPOSITORY);
  });

  it('deve encurtar uma URL sem userId', async () => {
    const dest = 'https://example.com/long';
    const url = await service.shorten(dest);

    expect(url.id).toBeDefined();
    expect(url.shortCode).toHaveLength(6);
    expect(url.destination).toBe(dest);
    expect(url.userId).toBeNull();
  });

  it('deve encurtar uma URL com userId', async () => {
    const dest = 'https://example.com/pro';
    const url = await service.shorten(dest, 42);

    expect(url.userId).toBe(42);
  });

  it('deve listar URLs com contagens de cliques corretas', async () => {
    const u1 = await urlRepo.create({ destination: 'a', userId: 1 });
    const u2 = await urlRepo.create({ destination: 'b', userId: 1 });

    await logRepo.logAccess(u1.id);
    await logRepo.logAccess(u1.id);
    await logRepo.logAccess(u2.id);

    const list: UrlWithClicksDto[] = await service.listUrlsWithClicks(1);
    const map = new Map(list.map((u) => [u.id, u]));

    expect(map.get(u1?.id)!.clickCount).toBe(2);
    expect(map.get(u2?.id)!.clickCount).toBe(1);
  });

  it('deve atualizar o URL de destino', async () => {
    const u = await urlRepo.create({ destination: 'old', userId: 5 });
    const updated = await service.updateUrl(u.id, 'new');

    expect(updated.destination).toBe('new');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(u.updatedAt.getTime());
  });

  it('updateUrl lança NotFoundException se não existir', async () => {
    await expect(service.updateUrl(999, 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve remover (excluir temporariamente) uma URL', async () => {
    const u = await urlRepo.create({ destination: 'to-remove', userId: 2 });
    await service.remove(u.id);
    await expect(service.updateUrl(u.id, 'whatever')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve redirecionar e registrar o acesso', async () => {
    const u = await urlRepo.create({ destination: 'https://go', userId: 3 });
    const dest = await service.redirect(u.shortCode);
    expect(dest).toBe(u.destination);

    const count = await logRepo.countByUrlId(u.id);
    expect(count).toBe(1);
  });

  it('redirecionamento lança NotFoundException para código inválido', async () => {
    await expect(service.redirect('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
