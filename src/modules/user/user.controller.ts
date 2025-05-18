import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.users.register(dto.email, dto.password);
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
