import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ReorderFeaturedDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds: string[];
}
