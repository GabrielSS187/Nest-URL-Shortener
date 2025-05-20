import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos (validação falhou)',
  })
  @ApiConflictResponse({
    description: 'E-mail já cadastrado',
  })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.users.register(dto.email, dto.password);
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
