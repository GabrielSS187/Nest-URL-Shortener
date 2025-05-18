import { Injectable } from '@nestjs/common';
import { IUrlRepository } from './url.repository';
import { UrlEntity } from '../entities/url.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { Url as PrismaUrl } from '@prisma/client';

@Injectable()
export class PrismaUrlRepository implements IUrlRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(model: PrismaUrl): UrlEntity {
    return new UrlEntity(
      model.id,
      model.shortCode,
      model.destination,
      model.userId,
      model.createdAt,
      model.updatedAt,
      model.deletedAt,
    );
  }

  async findByShortCode(code: string): Promise<UrlEntity | null> {
    const model = await this.prisma.url.findFirst({
      where: { shortCode: code, deletedAt: null },
    });
    return model ? this.toEntity(model) : null;
  }

  async findById(id: number): Promise<UrlEntity | null> {
    const model = await this.prisma.url.findFirst({
      where: { id, deletedAt: null },
    });
    return model ? this.toEntity(model) : null;
  }

  async findAllByUserId(userId: number): Promise<UrlEntity[]> {
    const models = await this.prisma.url.findMany({
      where: { userId, deletedAt: null },
    });
    return models.map((m) => this.toEntity(m));
  }

  async create(data: {
    destination: string;
    userId?: number;
  }): Promise<UrlEntity> {
    // Gera um código de 6 caracteres
    const shortCode = Math.random().toString(36).substring(2, 8);
    const model = await this.prisma.url.create({
      data: {
        shortCode,
        destination: data.destination,
        userId: data.userId ?? null,
      },
    });
    return this.toEntity(model);
  }

  async updateDestination(id: number, destination: string): Promise<UrlEntity> {
    const model = await this.prisma.url.update({
      where: { id },
      data: { destination },
    });
    return this.toEntity(model);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.url.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
