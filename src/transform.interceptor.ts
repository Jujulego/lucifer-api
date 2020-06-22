import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interceptor
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T> {
  // Methods
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> | Promise<Observable<any>> {
    return next.handle()
      .pipe(
        map(data => classToPlain(data))
      );
  }
}
