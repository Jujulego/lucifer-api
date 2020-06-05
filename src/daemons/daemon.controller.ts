import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';

import { Daemon } from './daemon.entity';
import { DaemonCreate, DaemonUpdate } from './daemon.schema';
import { DaemonService } from './daemon.service';

// Controller
@Controller('/api/daemons')
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
  async postDaemon(@Body() body: DaemonCreate): Promise<Daemon> {
    return await this.daemons.create(body);
  }

  @Get('/:id')
  async getDaemon(@Param('id') id: string): Promise<Daemon> {
    return await this.daemons.get(id);
  }

  @Put('/:id')
  async putDaemon(@Param('id') id: string, @Body() body: DaemonUpdate): Promise<Daemon> {
    return await this.daemons.update(id, body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDaemon(@Param('id') id: string): Promise<void> {
    await this.daemons.delete(id);
  }
}
