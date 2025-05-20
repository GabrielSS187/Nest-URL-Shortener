import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Redirecionamento')
@Controller()
export class UrlRedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':shortCode')
  @ApiOperation({
    summary: 'Redireciona uma URL encurtada para o seu destino',
  })
  @ApiParam({
    name: 'shortCode',
    example: 'abcd1234',
    description: 'Código curto gerado para a URL',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para a URL de destino',
  })
  @ApiResponse({
    status: 404,
    description: 'URL não encontrada',
  })
  async redirect(@Param('shortCode') code: string, @Res() res: Response) {
    try {
      const destination = await this.urlService.redirect(code);
      return res.redirect(destination);
    } catch {
      throw new NotFoundException('URL não encontrada');
    }
  }
}
