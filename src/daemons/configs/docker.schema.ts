import { IsObject, IsOptional, IsString } from 'class-validator';

// Schema
export class DockerSchema {
  @IsString() @IsOptional()
  image?: string;

  @IsObject() @IsOptional()
  env?: Record<string, string>;
}
