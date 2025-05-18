import { IUrlRepository } from './url.repository';
import { UrlEntity } from '../entities/url.entity';

export class InMemoryUrlRepository implements IUrlRepository {
  private urls: UrlEntity[] = [];
  private seq = 1;

  findByShortCode(code: string): Promise<UrlEntity | null> {
    const url =
      this.urls.find((u) => u.shortCode === code && u.deletedAt === null) ??
      null;
    return Promise.resolve(url);
  }

  findById(id: number): Promise<UrlEntity | null> {
    const url =
      this.urls.find((u) => u.id === id && u.deletedAt === null) ?? null;
    return Promise.resolve(url);
  }

  findAllByUserId(userId: number): Promise<UrlEntity[]> {
    const list = this.urls.filter(
      (u) => u.userId === userId && u.deletedAt === null,
    );
    return Promise.resolve(list);
  }

  create(data: { destination: string; userId?: number }): Promise<UrlEntity> {
    const now = new Date();
    const shortCode = Math.random().toString(36).substring(2, 8);
    const url = new UrlEntity(
      this.seq++,
      shortCode,
      data.destination,
      data.userId ?? null,
      now,
      now,
      null,
    );
    this.urls.push(url);
    return Promise.resolve(url);
  }

  updateDestination(id: number, destination: string): Promise<UrlEntity> {
    const idx = this.urls.findIndex((u) => u.id === id && u.deletedAt === null);
    if (idx === -1) {
      return Promise.reject(new Error('URL not found'));
    }

    const old = this.urls[idx];
    const newUpdatedAt = new Date(old.updatedAt.getTime() + 1);

    const updated = new UrlEntity(
      old.id,
      old.shortCode,
      destination,
      old.userId,
      old.createdAt,
      newUpdatedAt,
      old.deletedAt,
    );

    this.urls[idx] = updated;
    return Promise.resolve(updated);
  }

  softDelete(id: number): Promise<void> {
    const url = this.urls.find((u) => u.id === id && u.deletedAt === null);
    if (url) {
      url.deletedAt = new Date();
    }
    return Promise.resolve();
  }
}
