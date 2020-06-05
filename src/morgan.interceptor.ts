import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import morgan from 'morgan';

// Interceptor
@Injectable()
export class MorganInterceptor implements NestInterceptor {
  // Attributes
  private readonly logger = new Logger(MorganInterceptor.name);
  private readonly morgan: ReturnType<typeof morgan>;

  // Constructor
  constructor() {
    this.morgan = morgan('dev', { stream: this });
  }

  // Methods
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    await new Promise(resolve => this.morgan(req, res, resolve));

    return next.handle();
  }

  // noinspection JSUnusedGlobalSymbols
  write(log: string): void {
    this.logger.log(log);
  }
}
