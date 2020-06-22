import { Controller, Get } from '@nestjs/common';

import { Version, version } from 'utils';

// Controller
@Controller('/api')
export class ApiController {
  // Routes
  @Get('/version')
  async getVersion(): Promise<Version> {
    return await version();
  }
}
