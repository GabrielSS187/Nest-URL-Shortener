import { Injectable } from '@nestjs/common';
import { IUserRepository } from './user.repository';
import { UserEntity } from '../entities/user.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(model: PrismaUser): UserEntity {
    return new UserEntity(
      model.id,
      model.email,
      model.password,
      model.createdAt,
      model.updatedAt,
      model.deletedAt,
    );
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return user ? this.toEntity(user) : null;
  }

  async create(email: string, password: string): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: { email, password },
    });
    return this.toEntity(created);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password,
      },
    });
    return this.toEntity(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
