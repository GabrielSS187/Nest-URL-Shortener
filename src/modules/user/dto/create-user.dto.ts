import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'joao@exemplo.com',
    description: 'E-mail válido e único do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senhaSegura123',
    description: 'Senha do usuário. Mínimo de 6 caracteres',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
