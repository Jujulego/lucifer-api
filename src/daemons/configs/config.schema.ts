import { IsIn } from 'class-validator';

import { DaemonConfigType } from './config.entity';

// Types
export class CreateConfig {
  @IsIn(['docker'])
  type: DaemonConfigType;
}
