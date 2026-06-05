import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CustomCollectionsService } from './custom-collections.service';
import { CreateCustomCollectionDto, UpdateCustomCollectionDto } from './dto/create-custom-collection.dto';
import { CreateCustomFoodDto, UpdateCustomFoodDto } from './dto/create-custom-food.dto';

@ApiTags('custom-collections')
@Controller('custom-collections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomCollectionsController {
  constructor(private readonly customCollectionsService: CustomCollectionsService) {}

  // ==========================================
  // COLLECTION ENDPOINTS
  // ==========================================

  @Post()
  @ApiOperation({ summary: 'Tạo bộ sưu tập món ăn cá nhân mới' })
  async create(@Req() req: any, @Body() dto: CreateCustomCollectionDto) {
    const data = await this.customCollectionsService.create(req.user.userId, dto);
    return { success: true, data, message: 'Tạo bộ sưu tập thành công' };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả bộ sưu tập món ăn cá nhân' })
  async findAll(@Req() req: any) {
    const data = await this.customCollectionsService.findAll(req.user.userId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bộ sưu tập' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const data = await this.customCollectionsService.findOne(req.user.userId, id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bộ sưu tập' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCustomCollectionDto,
  ) {
    const data = await this.customCollectionsService.update(req.user.userId, id, dto);
    return { success: true, data, message: 'Cập nhật bộ sưu tập thành công' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm bộ sưu tập và tất cả món ăn cá nhân bên trong' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const data = await this.customCollectionsService.remove(req.user.userId, id);
    return { success: true, data, message: 'Xóa bộ sưu tập thành công' };
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Sao chép một bộ sưu tập món ăn cá nhân' })
  async copy(@Req() req: any, @Param('id') id: string) {
    const data = await this.customCollectionsService.copyCollection(req.user.userId, id);
    return { success: true, data, message: 'Sao chép bộ sưu tập thành công' };
  }

  // ==========================================
  // FOOD ENDPOINTS
  // ==========================================

  @Post(':id/foods')
  @ApiOperation({ summary: 'Thêm món ăn cá nhân vào bộ sưu tập' })
  async addFood(
    @Req() req: any,
    @Param('id') collectionId: string,
    @Body() dto: CreateCustomFoodDto,
  ) {
    const data = await this.customCollectionsService.addFood(req.user.userId, collectionId, dto);
    return { success: true, data, message: 'Thêm món ăn cá nhân thành công' };
  }

  @Get(':id/foods')
  @ApiOperation({ summary: 'Lấy danh sách món ăn cá nhân của bộ sưu tập' })
  async getFoods(@Req() req: any, @Param('id') collectionId: string) {
    const data = await this.customCollectionsService.getFoods(req.user.userId, collectionId);
    return { success: true, data };
  }

  @Put(':id/foods/:foodId')
  @ApiOperation({ summary: 'Cập nhật món ăn cá nhân trong bộ sưu tập' })
  async updateFood(
    @Req() req: any,
    @Param('id') collectionId: string,
    @Param('foodId') foodId: string,
    @Body() dto: UpdateCustomFoodDto,
  ) {
    const data = await this.customCollectionsService.updateFood(
      req.user.userId,
      collectionId,
      foodId,
      dto,
    );
    return { success: true, data, message: 'Cập nhật món ăn thành công' };
  }

  @Delete(':id/foods/:foodId')
  @ApiOperation({ summary: 'Xóa mềm món ăn cá nhân khỏi bộ sưu tập' })
  async removeFood(
    @Req() req: any,
    @Param('id') collectionId: string,
    @Param('foodId') foodId: string,
  ) {
    const data = await this.customCollectionsService.removeFood(
      req.user.userId,
      collectionId,
      foodId,
    );
    return { success: true, data, message: 'Xóa món ăn thành công' };
  }
}
