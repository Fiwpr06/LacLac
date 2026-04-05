import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

const LIST_TYPES = ['favorite', 'want_to_try', 'eaten_often'] as const;

export class FavoriteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  foodId!: string;

  @ApiProperty({ enum: LIST_TYPES })
  @IsEnum(LIST_TYPES)
  listType!: (typeof LIST_TYPES)[number];
}
