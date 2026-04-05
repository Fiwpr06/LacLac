import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateFoodDto, UpdateFoodDto } from './dto/create-food.dto';
import { ContextRequestDto, FilterDto, FoodsQueryDto } from './dto/filter.dto';
import { FoodsService } from './foods.service';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get('random')
  @ApiOperation({ summary: 'Lay mon an ngau nhien theo bo loc' })
  async random(@Query() filters: FilterDto) {
    const data = await this.foodsService.random(filters);
    return { success: true, data };
  }

  @Get('swipe-queue')
  @ApiOperation({ summary: 'Lay 10 mon an cho swipe session' })
  async swipeQueue(@Query() filters: FilterDto) {
    const data = await this.foodsService.swipeQueue(filters);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'Lay danh sach mon an co phan trang' })
  async findAll(@Query() query: FoodsQueryDto) {
    const result = await this.foodsService.findAll(query);
    return { success: true, data: result.items, meta: result.meta };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lay chi tiet mon an theo id' })
  async findById(@Param('id') foodId: string) {
    const data = await this.foodsService.findById(foodId);
    return { success: true, data };
  }

  @Post('filter')
  @ApiOperation({ summary: 'Filter mon an theo dieu kien' })
  async filter(@Body() dto: FilterDto) {
    const data = await this.foodsService.filter(dto);
    return { success: true, data };
  }

  @Post('context')
  @ApiOperation({ summary: 'Goi y mon an theo context rule-based' })
  async byContext(@Body() dto: ContextRequestDto) {
    const data = await this.foodsService.byContext(dto);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tao mon an moi (admin)' })
  async create(@Body() dto: CreateFoodDto) {
    const data = await this.foodsService.create(dto);
    return { success: true, data, message: 'Tao mon an thanh cong' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cap nhat mon an (admin)' })
  async update(@Param('id') foodId: string, @Body() dto: UpdateFoodDto) {
    const data = await this.foodsService.update(foodId, dto);
    return { success: true, data, message: 'Cap nhat mon an thanh cong' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoa mem mon an (admin)' })
  async remove(@Param('id') foodId: string) {
    const data = await this.foodsService.softDelete(foodId);
    return { success: true, data, message: 'Xoa mon an thanh cong' };
  }
}
