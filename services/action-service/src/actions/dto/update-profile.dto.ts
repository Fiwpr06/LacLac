import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const DIET_TYPES = ['normal', 'vegetarian', 'vegan', 'keto', 'clean'] as const;

class DietPreferencesDto {
  @ApiPropertyOptional({ enum: DIET_TYPES })
  @IsOptional()
  @IsEnum(DIET_TYPES)
  type?: (typeof DIET_TYPES)[number];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ type: DietPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DietPreferencesDto)
  dietPreferences?: DietPreferencesDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}
