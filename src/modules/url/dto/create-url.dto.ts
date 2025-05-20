import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://www.exemplo.com',
    description: 'URL de destino que será encurtada',
  })
  @IsUrl()
  destination: string;
}

export class ShortenUrlResponseDto {
  @ApiProperty({
    example: 'http://localhost:3000/abcd1234',
    description: 'URL encurtada completa',
  })
  shortUrl: string;
}

export class UrlWithClicksDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'abcd1234' })
  shortCode: string;

  @ApiProperty({ example: 'https://www.exemplo.com' })
  destination: string;

  @ApiProperty({
    example: 42,
    nullable: true,
    description: 'ID do usuário que criou a URL (ou null, se não autenticado)',
  })
  userId: number | null;

  @ApiProperty({ example: 10, description: 'Contagem de acessos à URL' })
  clickCount: number;

  @ApiProperty({ example: '2025-05-18T12:34:56.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-05-19T08:21:30.000Z' })
  updatedAt: Date;
}
