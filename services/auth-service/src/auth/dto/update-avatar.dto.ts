import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @ApiProperty({ description: 'URL ảnh đại diện từ Cloudinary' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  avatarUrl!: string;
}
