import { IsEmail, IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(['ADMIN', 'OWNER'])
  role?: 'ADMIN' | 'OWNER';
}
