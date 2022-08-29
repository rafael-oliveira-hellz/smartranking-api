import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { IEvent } from '../interfaces/catagory.interface';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  events: Array<IEvent>;
}
