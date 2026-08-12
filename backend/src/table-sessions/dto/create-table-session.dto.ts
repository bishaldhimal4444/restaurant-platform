import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateTableSessionDto {
  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;
}
