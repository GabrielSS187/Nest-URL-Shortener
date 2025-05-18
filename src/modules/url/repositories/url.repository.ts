import { UrlEntity } from '../entities/url.entity';

export const URL_REPOSITORY = 'URL_REPOSITORY';

export interface IUrlRepository {
  findByShortCode(code: string): Promise<UrlEntity | null>;
  findById(id: number): Promise<UrlEntity | null>;
  findAllByUserId(userId: number): Promise<UrlEntity[]>;
  create(data: { destination: string; userId?: number }): Promise<UrlEntity>;
  updateDestination(id: number, destination: string): Promise<UrlEntity>;
  softDelete(id: number): Promise<void>;
}
