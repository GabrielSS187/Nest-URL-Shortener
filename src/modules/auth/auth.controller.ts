import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autentica usuário e retorna token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }
}
