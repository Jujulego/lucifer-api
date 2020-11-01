import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param, ParseUUIDPipe,
  Post,
  Put, Query,
  UseGuards, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Daemon } from './daemon.entity';
import { DaemonCreate, DaemonUpdate } from './daemon.schema';
import { DaemonService } from './daemon.service';

// Controller
@Controller('/api/daemons')
@UseGuards(AuthGuard('auth0'))
export class DaemonController {
  // Constructor
  constructor(
    private daemons: DaemonService
  ) {}

  // Endpoints
  @Get('/')
  async getDaemons(): Promise<Daemon[]> {
    return await this.daemons.list();
  }

  @Post('/')
  async postDaemon(@Body(ValidationPipe) body: DaemonCreate): Promise<Daemon> {
    return await this.daemons.create(body);
  }

  @Get('/:id')
  async getDaemon(@Param('id', ParseUUIDPipe) id: string): Promise<Daemon> {
    return await this.daemons.get(id);
  }

  @Put('/:id')
  async putDaemon(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) body: DaemonUpdate): Promise<Daemon> {
    return await this.daemons.update(id, body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDaemon(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.daemons.delete(id);
  }

  @Delete('/')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDaemons(@Query('ids') ids: string[]): Promise<void> {
    await this.daemons.delete(...ids);
  }
}
