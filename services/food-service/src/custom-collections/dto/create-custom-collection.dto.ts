import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomCollectionDto {
  @ApiProperty({ description: 'Tên bộ sưu tập' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Mô tả bộ sưu tập' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện bộ sưu tập' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateCustomCollectionDto extends PartialType(CreateCustomCollectionDto) {}
