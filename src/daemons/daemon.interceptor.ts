import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { UserService } from 'users/user.service';

import { Daemon } from './daemon.entity';

// Interceptor
@Injectable()
export class DaemonInterceptor<T extends Daemon> implements NestInterceptor<T | T[], T | T[]> {
  // Constructor
  constructor(
    private users: UserService
  ) {}

  // Methods
  private async injectUser(daemon: T): Promise<T> {
    if (daemon.owner) {
      daemon.owner = await this.users.get(daemon.owner.id, { full: false });
    }

    return daemon;
  }

  private async injectUsers(daemons: T[]): Promise<T[]> {
    return await Promise.all(
      daemons.map(dmn => this.injectUser(dmn))
    );
  }

  private async inject(daemon: T | T[]): Promise<T | T[]> {
    if (Array.isArray(daemon)) {
      return await this.injectUsers(daemon);
    } else {
      return await this.injectUser(daemon);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler<T | T[]>): Observable<T | T[]> {
    return next.handle()
      .pipe(
        mergeMap(obj => this.inject(obj))
      );
  }
}
