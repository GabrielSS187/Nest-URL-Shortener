import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verifica se o sistema está estável.',
  })
  check() {
    return { status: 'ok' };
  }
}
