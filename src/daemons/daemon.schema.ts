import { IsOptional, IsString, IsUUID } from 'class-validator';

// Schemas
export class DaemonCreate {
  @IsString() @IsOptional()
  name?: string;

  @IsString() @IsOptional()
  ownerId?: string;
}

export class DaemonUpdate {
  @IsString() @IsOptional()
  name?: string;

  @IsString() @IsOptional()
  ownerId?: string;

  @IsUUID('all', { each: true }) @IsOptional()
  dependencies?: string[];
}
