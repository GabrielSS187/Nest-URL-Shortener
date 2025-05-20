import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'maria@exemplo.com',
    description: 'E-mail cadastrado do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senhaSecreta123',
    description: 'Senha do usuário. Mínimo de 6 caracteres',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
