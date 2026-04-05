import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder, Types, isValidObjectId } from 'mongoose';

import { Category, CategoryDocument } from '../categories/category.schema';
import { toSlug } from '../common/slug.util';
import { applyContextRules } from './context-rules.util';
import { CreateFoodDto, UpdateFoodDto } from './dto/create-food.dto';
import { ContextRequestDto, FilterDto, FoodsQueryDto } from './dto/filter.dto';
import { Food, FoodDocument } from './food.schema';

interface FoodsPageResult {
  items: unknown[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FoodsService {
  constructor(
    @InjectModel(Food.name) private readonly foodModel: Model<FoodDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(queryDto: FoodsQueryDto): Promise<FoodsPageResult> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;
    const sort = this.parseSort(queryDto.sort);
    const match = this.buildFilter(queryDto);

    const [items, total] = await Promise.all([
      this.foodModel
        .find(match)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.foodModel.countDocuments(match).exec(),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(foodId: string): Promise<unknown> {
    if (!isValidObjectId(foodId)) {
      throw new BadRequestException('Food id khong hop le');
    }

    const food = await this.foodModel.findOne({ _id: foodId, isActive: true }).lean().exec();
    if (!food) {
      throw new NotFoundException('Khong tim thay mon an');
    }

    return food;
  }

  async random(filters: FilterDto): Promise<unknown | null> {
    const match = this.buildFilter(filters);
    const result = await this.foodModel
      .aggregate([{ $match: match }, { $sample: { size: 1 } }])
      .exec();
    return result[0] ?? null;
  }

  async swipeQueue(filters: FilterDto): Promise<unknown[]> {
    const match = this.buildFilter(filters);
    return this.foodModel.aggregate([{ $match: match }, { $sample: { size: 10 } }]).exec();
  }

  async filter(dto: FilterDto): Promise<unknown[]> {
    const match = this.buildFilter(dto);
    return this.foodModel.find(match).sort({ popularityScore: -1 }).limit(50).lean().exec();
  }

  async byContext(dto: ContextRequestDto): Promise<unknown[]> {
    const baseMatch = this.buildFilter(dto.filters ?? {});
    const match = applyContextRules(dto.context, baseMatch);

    return this.foodModel
      .find(match)
      .sort({ popularityScore: -1, averageRating: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  async create(dto: CreateFoodDto): Promise<unknown> {
    const nameSlug = toSlug(dto.name);

    const existing = await this.foodModel.findOne({ nameSlug }).lean().exec();
    if (existing) {
      throw new ConflictException('Mon an da ton tai');
    }

    if (dto.category && !isValidObjectId(dto.category)) {
      throw new BadRequestException('Category khong hop le');
    }

    if (dto.category) {
      const categoryExists = await this.categoryModel.exists({ _id: dto.category, isActive: true });
      if (!categoryExists) {
        throw new NotFoundException('Category khong ton tai');
      }
    }

    const created = await this.foodModel.create({
      ...dto,
      category: dto.category ? new Types.ObjectId(dto.category) : undefined,
      nameSlug,
      images: dto.images ?? [],
      mealTypes: dto.mealTypes ?? [],
      dietTags: dto.dietTags ?? [],
      allergens: dto.allergens ?? [],
      ingredients: dto.ingredients,
      tags: dto.tags ?? [],
      contextTags: dto.contextTags ?? [],
      popularityScore: 0,
      averageRating: 0,
      totalReviews: 0,
      isActive: dto.isActive ?? true,
    });

    return created.toObject();
  }

  async update(foodId: string, dto: UpdateFoodDto): Promise<unknown> {
    if (!isValidObjectId(foodId)) {
      throw new BadRequestException('Food id khong hop le');
    }

    const existing = await this.foodModel.findById(foodId).exec();
    if (!existing) {
      throw new NotFoundException('Khong tim thay mon an');
    }

    const updateData: Record<string, unknown> = { ...dto };

    if (dto.name && dto.name !== existing.name) {
      const slug = toSlug(dto.name);
      const duplicate = await this.foodModel
        .findOne({ nameSlug: slug, _id: { $ne: foodId } })
        .lean()
        .exec();
      if (duplicate) {
        throw new ConflictException('Ten mon an da ton tai');
      }
      updateData['nameSlug'] = slug;
    }

    if (dto.category) {
      if (!isValidObjectId(dto.category)) {
        throw new BadRequestException('Category khong hop le');
      }

      const categoryExists = await this.categoryModel.exists({ _id: dto.category, isActive: true });
      if (!categoryExists) {
        throw new NotFoundException('Category khong ton tai');
      }

      updateData['category'] = new Types.ObjectId(dto.category);
    }

    const updated = await this.foodModel
      .findByIdAndUpdate(foodId, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Khong tim thay mon an');
    }

    return updated;
  }

  async softDelete(foodId: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(foodId)) {
      throw new BadRequestException('Food id khong hop le');
    }

    const updated = await this.foodModel
      .findByIdAndUpdate(foodId, { isActive: false }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Khong tim thay mon an');
    }

    return { deleted: true };
  }

  private parseSort(sortRaw?: string): Record<string, SortOrder> {
    const sortToken = sortRaw?.trim() || '-createdAt';
    if (sortToken.startsWith('-')) {
      return { [sortToken.slice(1)]: -1 };
    }

    return { [sortToken]: 1 };
  }

  private buildFilter(filters: Partial<FilterDto>): FilterQuery<FoodDocument> {
    const query: FilterQuery<FoodDocument> = { isActive: true };

    if (filters.priceRange) {
      query.priceRange = filters.priceRange;
    }

    if (filters.category) {
      if (!isValidObjectId(filters.category)) {
        throw new BadRequestException('Category khong hop le');
      }
      query.category = new Types.ObjectId(filters.category);
    }

    if (filters.mealType) {
      query.mealTypes = filters.mealType;
    }

    if (filters.dietTag) {
      query.dietTags = filters.dietTag;
    }

    if (filters.cookingStyle) {
      query.cookingStyle = filters.cookingStyle;
    }

    if (filters.context) {
      query.contextTags = filters.context;
    }

    if (filters.allergenExclude && filters.allergenExclude.length > 0) {
      query.allergens = { $nin: filters.allergenExclude };
    }

    return query;
  }
}
