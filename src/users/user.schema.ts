import { IsEmail, IsOptional, IsString } from 'class-validator';

// Schema
export class UpdateUser {
  @IsString() @IsOptional()
  name?: string;

  @IsEmail() @IsOptional()
  email?: string;
}
