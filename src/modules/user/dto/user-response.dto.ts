import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'joao@exemplo.com' })
  email: string;

  @ApiProperty({ example: '2025-05-19T15:42:00.000Z' })
  createdAt: Date;
}
