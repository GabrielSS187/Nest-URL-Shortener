import { IUserRepository } from './user.repository';
import { UserEntity } from '../entities/user.entity';

export class InMemoryUserRepository implements IUserRepository {
  private users: UserEntity[] = [];
  private seq = 1;

  findById(id: number): Promise<UserEntity | null> {
    const user =
      this.users.find((u) => u.id === id && u.deletedAt === null) ?? null;
    return Promise.resolve(user);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    const user =
      this.users.find((u) => u.email === email && u.deletedAt === null) ?? null;
    return Promise.resolve(user);
  }

  create(email: string, password: string): Promise<UserEntity> {
    const now = new Date();
    const user = new UserEntity(this.seq++, email, password, now, now, null);
    this.users.push(user);
    return Promise.resolve(user);
  }

  update(user: UserEntity): Promise<UserEntity> {
    const idx = this.users.findIndex(
      (u) => u.id === user.id && u.deletedAt === null,
    );
    if (idx === -1) {
      return Promise.reject(new Error('User not found'));
    }
    const previous = this.users[idx].updatedAt.getTime();
    user.updatedAt = new Date(previous + 1);
    this.users[idx] = user;
    return Promise.resolve(user);
  }

  softDelete(id: number): Promise<void> {
    const user = this.users.find((u) => u.id === id && u.deletedAt === null);
    if (user) {
      user.deletedAt = new Date();
    }
    return Promise.resolve();
  }
}
