import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  IUserRepository,
} from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
  ) {}

  async register(email: string, password: string): Promise<UserEntity> {
    if (await this.repo.findByEmail(email)) {
      throw new BadRequestException('Email já cadastrado');
    }
    const hash = await bcrypt.hash(password, 10);
    return this.repo.create(email, hash);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findByEmail(email);
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    return this.repo.update(user);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
