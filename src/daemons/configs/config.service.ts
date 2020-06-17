import { Injectable } from '@nestjs/common';

import { DaemonConfigType } from './config.entity';

// Service
@Injectable()
export class ConfigService {
  // Methods
  allowedTypes(): DaemonConfigType[] {
    return ['docker'];
  }
}
