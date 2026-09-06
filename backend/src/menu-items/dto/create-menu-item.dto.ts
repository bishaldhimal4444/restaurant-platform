import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, Min, MinLength, ValidateIf } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf((dto) => dto.discountPrice !== null && dto.discountPrice !== undefined)
  discountPrice?: number | null;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  allergens?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  vegetarian?: boolean;

  @IsOptional()
  @IsBoolean()
  vegan?: boolean;

  @IsOptional()
  @IsBoolean()
  spicy?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  featuredOrder?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
