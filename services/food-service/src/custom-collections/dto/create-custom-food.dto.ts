import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomFoodDto {
  @ApiProperty({ description: 'Tên món ăn' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ description: 'Mô tả ngắn món ăn' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Thể loại / danh mục' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Ảnh món ăn' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Ghi chú riêng' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;

  @ApiPropertyOptional({ description: 'Có tham gia random không', default: true })
  @IsBoolean()
  @IsOptional()
  isRandomEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateCustomFoodDto extends PartialType(CreateCustomFoodDto) {}
