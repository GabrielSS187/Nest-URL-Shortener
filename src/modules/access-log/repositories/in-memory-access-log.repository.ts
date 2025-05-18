import { IAccessLogRepository } from './access-log.repository';
import { AccessLogEntity } from '../entities/access-log.entity';

export class InMemoryAccessLogRepository implements IAccessLogRepository {
  private logs: AccessLogEntity[] = [];
  private seq = 1;

  logAccess(urlId: number): Promise<AccessLogEntity> {
    const log = new AccessLogEntity(this.seq++, urlId, new Date());
    this.logs.push(log);
    return Promise.resolve(log);
  }

  countByUrlId(urlId: number): Promise<number> {
    const count = this.logs.filter((l) => l.urlId === urlId).length;
    return Promise.resolve(count);
  }
}
