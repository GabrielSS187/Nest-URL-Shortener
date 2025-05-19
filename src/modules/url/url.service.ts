import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUrlRepository, URL_REPOSITORY } from './repositories/url.repository';
import {
  IAccessLogRepository,
  ACCESS_LOG_REPOSITORY,
} from '../access-log/repositories/access-log.repository';
import { UrlEntity } from './entities/url.entity';

export interface UrlWithClicksDto {
  id: number;
  shortCode: string;
  destination: string;
  userId: number | null;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UrlService {
  constructor(
    @Inject(URL_REPOSITORY)
    private readonly urlRepo: IUrlRepository,
    @Inject(ACCESS_LOG_REPOSITORY)
    private readonly logRepo: IAccessLogRepository,
  ) {}

  async shorten(destination: string, userId?: number): Promise<UrlEntity> {
    const url = await this.urlRepo.create({ destination, userId });
    return url;
  }

  async listUrlsWithClicks(userId: number): Promise<UrlWithClicksDto[]> {
    const urls = await this.urlRepo.findAllByUserId(userId);
    const results = await Promise.all(
      urls.map(async (url) => {
        const clickCount = await this.logRepo.countByUrlId(url.id);
        return {
          id: url.id,
          shortCode: url.shortCode,
          destination: url.destination,
          userId: url.userId,
          clickCount,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        };
      }),
    );
    return results;
  }

  async updateUrl(id: number, destination: string): Promise<UrlEntity> {
    const url = await this.urlRepo.findById(id);
    if (!url) throw new NotFoundException('URL não encontrada');
    return this.urlRepo.updateDestination(id, destination);
  }

  async remove(id: number): Promise<void> {
    const url = await this.urlRepo.findById(id);
    if (!url) throw new NotFoundException('URL não encontrada');
    await this.urlRepo.softDelete(id);
  }

  async redirect(shortCode: string): Promise<string> {
    const url = await this.urlRepo.findByShortCode(shortCode);
    console.log(url);

    if (!url) throw new NotFoundException('URL não encontrada');
    await this.logRepo.logAccess(url.id);
    return url.destination;
  }
}
