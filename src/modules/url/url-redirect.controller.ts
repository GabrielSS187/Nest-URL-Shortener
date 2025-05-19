// src/modules/url/url-redirect.controller.ts
import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';

@Controller()
export class UrlRedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':shortCode')
  async redirect(@Param('shortCode') code: string, @Res() res: Response) {
    try {
      const destination = await this.urlService.redirect(code);
      return res.redirect(destination);
    } catch {
      throw new NotFoundException('URL não encontrada');
    }
  }
}
