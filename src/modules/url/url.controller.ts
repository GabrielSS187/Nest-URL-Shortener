/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UrlService } from './url.service';
import {
  CreateUrlDto,
  ShortenUrlResponseDto,
  UrlWithClicksDto,
} from './dto/create-url.dto';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request } from 'express';

@ApiTags('URLs')
@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Encurta uma URL (autenticação opcional)' })
  @ApiBody({ type: CreateUrlDto })
  @ApiCreatedResponse({
    description: 'URL encurtada com sucesso',
    type: ShortenUrlResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Cabeçalho Authorization inválido (mas não é obrigatório)',
  })
  async shorten(
    @Body() dto: CreateUrlDto,
    @Req() req: Request,
  ): Promise<ShortenUrlResponseDto> {
    const userId = (req as any).user?.sub as number;
    const url = await this.urlService.shorten(dto.destination, userId);
    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    return { shortUrl: `${base}/${url.shortCode}` };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lista URLs do usuário autenticado com contagem de cliques',
  })
  @ApiOkResponse({
    description: 'Lista de URLs com métrica de cliques',
    type: UrlWithClicksDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  async list(@Req() req: Request): Promise<UrlWithClicksDto[]> {
    const userId = (req as any).user.sub as number;
    return this.urlService.listUrlsWithClicks(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualiza a URL de destino de uma URL existente' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da URL a ser atualizada',
  })
  @ApiBody({ type: CreateUrlDto })
  @ApiOkResponse({
    description: 'URL atualizada com sucesso',
    type: UrlWithClicksDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  async update(
    @Param('id') id: string,
    @Body() dto: CreateUrlDto,
  ): Promise<UrlWithClicksDto> {
    const updated = await this.urlService.updateUrl(+id, dto.destination);
    // recarrega clickCount para refletir o valor atual
    const list = await this.urlService.listUrlsWithClicks(updated.userId!);
    const clickInfo = list.find((u) => u.id === updated.id)!;
    return { ...clickInfo };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove uma URL existente' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da URL a ser removida' })
  @ApiNoContentResponse({ description: 'URL removida com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido' })
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.urlService.remove(+id);
  }
}
