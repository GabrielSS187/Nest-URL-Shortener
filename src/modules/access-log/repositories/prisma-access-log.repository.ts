import { Injectable } from '@nestjs/common';
import { IAccessLogRepository } from './access-log.repository';
import { AccessLogEntity } from '../entities/access-log.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessLog as PrismaAccessLog } from '@prisma/client';

@Injectable()
export class PrismaAccessLogRepository implements IAccessLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(model: PrismaAccessLog): AccessLogEntity {
    return new AccessLogEntity(model.id, model.urlId, model.accessedAt);
  }

  async logAccess(urlId: number): Promise<AccessLogEntity> {
    const model = await this.prisma.accessLog.create({
      data: { urlId },
    });
    return this.toEntity(model);
  }

  async countByUrlId(urlId: number): Promise<number> {
    return this.prisma.accessLog.count({
      where: { urlId },
    });
  }
}
