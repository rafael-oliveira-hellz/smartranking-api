import { IsOptional } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  category?: string;

  @IsOptional()
  playerPhoto_Url?: string;
}
