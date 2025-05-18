import { AccessLogEntity } from '../entities/access-log.entity';

export const ACCESS_LOG_REPOSITORY = 'ACCESS_LOG_REPOSITORY';

export interface IAccessLogRepository {
  logAccess(urlId: number): Promise<AccessLogEntity>;
  countByUrlId(urlId: number): Promise<number>;
}
