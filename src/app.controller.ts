import { Controller, Get } from '@nestjs/common';

// Controller
@Controller()
export class AppController {
  // Routes
  @Get()
  getHello(): string {
    return 'Hello world!';
  }
}
