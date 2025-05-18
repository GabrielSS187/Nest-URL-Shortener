/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UrlService, UrlWithClicksDto } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';

@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @HttpCode(201)
  async shorten(@Body() dto: CreateUrlDto, @Req() req: Request) {
    const userId = (req as any).user?.sub as number;
    const url = await this.urlService.shorten(dto.destination, userId);
    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    return { shortUrl: `${base}/${url.shortCode}` };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async list(@Req() req: Request): Promise<UrlWithClicksDto[]> {
    const userId = (req as any).user.id as number;
    return this.urlService.listUrlsWithClicks(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: CreateUrlDto,
  ): Promise<UrlWithClicksDto> {
    const updated = await this.urlService.updateUrl(+id, dto.destination);
    return {
      id: updated.id,
      shortCode: updated.shortCode,
      destination: updated.destination,
      userId: updated.userId,
      clickCount: await this.urlService
        .listUrlsWithClicks(updated.userId!)
        .then((list) => list.find((u) => u.id === updated.id)!.clickCount),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.urlService.remove(+id);
  }

  @Get(':shortCode')
  async redirect(@Param('shortCode') code: string, @Res() res: Response) {
    const destination = await this.urlService.redirect(code);
    return res.redirect(destination);
  }
}
