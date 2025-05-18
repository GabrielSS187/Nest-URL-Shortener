import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(email: string, password: string): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  softDelete(id: number): Promise<void>;
}
