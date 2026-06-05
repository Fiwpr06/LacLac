import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder, Types, isValidObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Category, CategoryDocument } from '../categories/category.schema';
import { toSlug } from '../common/slug.util';
import { applyContextRules } from './context-rules.util';
import { CreateFoodDto, UpdateFoodDto } from './dto/create-food.dto';
import { ContextRequestDto, FilterDto, FoodsQueryDto } from './dto/filter.dto';
import { ShakeRequestDto } from './dto/shake.dto';
import { Food, FoodDocument } from './food.schema';
import { CustomCollection, CustomCollectionDocument } from '../custom-collections/custom-collection.schema';
import { CustomFood, CustomFoodDocument } from '../custom-collections/custom-food.schema';

interface FoodsPageResult {
  items: Food[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShakeResult {
  sessionId: string;
  triggerType: 'shake' | 'button';
  food: any | null;
  resetRequired?: boolean;
  actionHint: {
    sessionId: string;
    foodId?: string;
    actionType: 'shake_result';
    context: 'solo' | 'date' | 'group' | 'travel' | 'office' | 'none';
    triggerType: 'shake' | 'button';
    filterSnapshot: Partial<FilterDto>;
    deviceType: 'mobile' | 'web';
  };
}

@Injectable()
export class FoodsService {
  constructor(
    @InjectModel(Food.name) private readonly foodModel: Model<FoodDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(CustomCollection.name) private readonly collectionModel: Model<CustomCollectionDocument>,
    @InjectModel(CustomFood.name) private readonly customFoodModel: Model<CustomFoodDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async findById(foodId: string): Promise<any> {
    if (!isValidObjectId(foodId)) {
      throw new BadRequestException('Food id khong hop le');
    }

    const food = await this.foodModel.findOne({ _id: foodId, isActive: true }).lean().exec();
    if (food) {
      return food;
    }

    const customFood = await this.customFoodModel
      .findOne({ _id: foodId, isDeleted: false })
      .lean()
      .exec();

    if (!customFood) {
      throw new NotFoundException('Khong tim thay mon an');
    }

    return {
      _id: customFood._id,
      name: { vi: customFood.name, en: '' },
      description: { vi: customFood.description || '', en: '' },
      thumbnailImage: customFood.imageUrl || '',
      images: customFood.imageUrl ? [customFood.imageUrl] : [],
      category: { name: { vi: customFood.category || 'Món tự tạo', en: 'Custom' } },
      priceRange: 'medium',
      tags: { vi: [customFood.category].filter(Boolean), en: [] },
      origin: 'Custom',
      isCustom: true,
    };
  }

  async random(filters: FilterDto): Promise<Food | null> {
    const match = this.buildFilter(filters);
    const result = await this.foodModel
      .aggregate([{ $match: match }, { $sample: { size: 1 } }])
      .exec();
    return (result[0] as Food) ?? null;
  }

  async shake(req: any, dto: ShakeRequestDto): Promise<ShakeResult> {
    const filters = dto.filters ?? {};
    let userId: string | undefined = undefined;

    const authHeader = req?.headers?.['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const secret = this.configService.get<string>(
          'JWT_SECRET',
          'lac-lac-default-secret-32-characters-minimum',
        );
        const payload = await this.jwtService.verifyAsync<{
          sub: string;
          email: string;
          role: 'user' | 'admin';
        }>(token, { secret });
        userId = payload.sub;
      } catch (e) {
        // Ignore invalid token, fallback to guest
      }
    }

    if (!userId && req?.headers) {
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
      const bypassFlag = this.configService.get<string>('ADMIN_DEV_BYPASS', 'true');
      if (nodeEnv !== 'production' && bypassFlag === 'true') {
        userId = 'dev-admin';
      } else {
        const bypassHeader = req.headers['x-admin-dev-bypass'];
        const host = req.headers['host']?.toLowerCase() ?? '';
        if (bypassHeader === 'true' && (host.startsWith('localhost') || host.startsWith('127.0.0.1'))) {
          userId = 'dev-admin';
        }
      }
    }

    const excludeObjectIds = (dto.excludeFoodIds ?? [])
      .filter((id) => isValidObjectId(id))
      .map((id) => new Types.ObjectId(id));

    let customFoodMatch: any = null;
    if (userId && dto.collectionIds && dto.collectionIds.length > 0) {
      const collectionObjectIds = dto.collectionIds
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));

      customFoodMatch = {
        collectionId: { $in: collectionObjectIds },
        userId,
        isRandomEnabled: true,
        isDeleted: false,
      };
    }

    const includeSystem = dto.includeSystem ?? (dto.collectionIds && dto.collectionIds.length > 0 ? false : true);
    let systemFoodMatch: any = null;
    if (includeSystem) {
      systemFoodMatch = this.buildFilter(filters);
    }

    // Tải thông tin tổng số lượng trước để check hết món
    const totalCustom = customFoodMatch ? await this.customFoodModel.countDocuments(customFoodMatch) : 0;
    const totalSystem = systemFoodMatch ? await this.foodModel.countDocuments(systemFoodMatch) : 0;

    if (totalCustom + totalSystem === 0) {
      return {
        sessionId: dto.sessionId,
        triggerType: dto.triggerType,
        food: null,
        resetRequired: false,
        actionHint: {
          sessionId: dto.sessionId,
          actionType: 'shake_result',
          context: dto.context ?? 'none',
          triggerType: dto.triggerType,
          filterSnapshot: filters,
          deviceType: dto.deviceType,
        },
      };
    }

    // Tải thông tin số lượng món chưa bị loại trừ
    let activeCustomQuery: any = null;
    if (customFoodMatch) {
      activeCustomQuery = {
        ...customFoodMatch,
        _id: { $nin: excludeObjectIds },
      };
    }
    const activeCustomCount = activeCustomQuery ? await this.customFoodModel.countDocuments(activeCustomQuery) : 0;

    let activeSystemQuery: any = null;
    if (systemFoodMatch) {
      activeSystemQuery = {
        ...systemFoodMatch,
        _id: { $nin: excludeObjectIds },
      };
    }
    const activeSystemCount = activeSystemQuery ? await this.foodModel.countDocuments(activeSystemQuery) : 0;

    if (activeCustomCount + activeSystemCount === 0) {
      // Đã hết món ăn chưa lắc trong lượt hiện tại
      return {
        sessionId: dto.sessionId,
        triggerType: dto.triggerType,
        food: null,
        resetRequired: true,
        actionHint: {
          sessionId: dto.sessionId,
          actionType: 'shake_result',
          context: dto.context ?? 'none',
          triggerType: dto.triggerType,
          filterSnapshot: filters,
          deviceType: dto.deviceType,
        },
      };
    }

    // Random chọn từ tập active
    const randomIndex = Math.floor(Math.random() * (activeCustomCount + activeSystemCount));
    let selectedFood: any = null;

    if (randomIndex < activeCustomCount) {
      const customFood = await this.customFoodModel
        .findOne(activeCustomQuery)
        .skip(randomIndex)
        .lean()
        .exec();

      if (customFood) {
        const collection = await this.collectionModel.findById(customFood.collectionId).lean().exec();
        selectedFood = {
          _id: customFood._id,
          name: { vi: customFood.name, en: '' },
          description: { vi: customFood.description || '', en: '' },
          thumbnailImage: customFood.imageUrl || '',
          images: customFood.imageUrl ? [customFood.imageUrl] : [],
          category: { name: { vi: customFood.category || 'Món tự tạo', en: 'Custom' } },
          priceRange: 'medium',
          tags: { vi: [customFood.category].filter(Boolean), en: [] },
          origin: 'Custom',
          isCustom: true,
          collectionName: collection ? collection.name : '',
        };
      }
    } else {
      const systemIndex = randomIndex - activeCustomCount;
      const systemFood = await this.foodModel
        .findOne(activeSystemQuery)
        .skip(systemIndex)
        .lean()
        .exec();
      selectedFood = systemFood;
    }

    const foodId = this.resolveFoodId(selectedFood);

    return {
      sessionId: dto.sessionId,
      triggerType: dto.triggerType,
      food: selectedFood,
      resetRequired: false,
      actionHint: {
        sessionId: dto.sessionId,
        foodId,
        actionType: 'shake_result',
        context: dto.context ?? 'none',
        triggerType: dto.triggerType,
        filterSnapshot: filters,
        deviceType: dto.deviceType,
      },
    };
  }

  async swipeQueue(filters: FilterDto): Promise<Food[]> {
    const match = this.buildFilter(filters);
    return this.foodModel.aggregate([{ $match: match }, { $sample: { size: 10 } }]).exec();
  }

  async filter(dto: FilterDto): Promise<Food[]> {
    const match = this.buildFilter(dto);
    return this.foodModel
      .find(match)
      .sort({ popularityScore: -1 })
      .limit(50)
      .lean()
      .exec() as Promise<Food[]>;
  }

  async byContext(dto: ContextRequestDto): Promise<Food[]> {
    const baseMatch = this.buildFilter(dto.filters ?? {});
    const match = applyContextRules(dto.context, baseMatch);

    return this.foodModel
      .find(match)
      .sort({ popularityScore: -1, averageRating: -1 })
      .limit(50)
      .lean()
      .exec() as Promise<Food[]>;
  }

  async create(dto: CreateFoodDto): Promise<Food> {
    const nameSlug = toSlug(dto.name.vi);

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

    return created.toObject() as Food;
  }

  async update(foodId: string, dto: UpdateFoodDto): Promise<Food> {
    if (!isValidObjectId(foodId)) {
      throw new BadRequestException('Food id khong hop le');
    }

    const existing = await this.foodModel.findById(foodId).exec();
    if (!existing) {
      throw new NotFoundException('Khong tim thay mon an');
    }

    const updateData: Record<string, any> = { ...dto };

    if (dto.name && dto.name.vi !== existing.name?.vi) {
      const slug = toSlug(dto.name.vi);
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

    return updated as Food;
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
    const andConditions: FilterQuery<FoodDocument>[] = [];

    if (filters.priceRange) {
      query.priceRange = filters.priceRange;
    }

    if (filters.budgetBucket) {
      switch (filters.budgetBucket) {
        case 'under_30k':
          andConditions.push({ priceMax: { $lte: 30000 } });
          break;
        case 'from_30k_to_50k':
          andConditions.push({ priceMin: { $lte: 50000 } });
          andConditions.push({ priceMax: { $gte: 30000 } });
          break;
        case 'from_50k_to_100k':
          andConditions.push({ priceMin: { $lte: 100000 } });
          andConditions.push({ priceMax: { $gte: 50000 } });
          break;
        case 'over_100k':
          andConditions.push({
            $or: [{ priceMin: { $gte: 100000 } }, { priceMax: { $gt: 100000 } }],
          });
          break;
      }
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

    if (filters.dishType && !filters.cookingStyle) {
      if (filters.dishType === 'liquid') {
        query.cookingStyle = 'soup';
      }

      if (filters.dishType === 'dry') {
        query.cookingStyle = 'dry';
      }

      if (filters.dishType === 'fried_grilled') {
        query.cookingStyle = { $in: ['fried', 'grilled'] };
      }
    }

    if (filters.cuisineType) {
      const cuisineRegexMap: Record<'vietnamese' | 'asian' | 'european', RegExp> = {
        vietnamese: /viet|ha noi|hue|sai gon|mien/i,
        asian: /asia|chau a|thai|nhat|han/i,
        european: /europe|chau au|france|italy|germany/i,
      };

      const cuisineRegex = cuisineRegexMap[filters.cuisineType];
      andConditions.push({
        $or: [
          { origin: { $regex: cuisineRegex } },
          { tags: { $elemMatch: { $regex: cuisineRegex } } },
        ],
      });
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

    if (filters.allergensFree && filters.allergensFree.length > 0) {
      if (!query.allergens) {
        query.allergens = { $nin: filters.allergensFree };
      } else {
        (query.allergens as any).$nin = Array.from(
          new Set([...((query.allergens as any).$nin || []), ...filters.allergensFree])
        );
      }
    }

    if (filters.maxCalories !== undefined || filters.minCalories !== undefined) {
      query.caloriesPerServing = {};
      if (filters.maxCalories !== undefined) {
        query.caloriesPerServing.$lte = filters.maxCalories;
      }
      if (filters.minCalories !== undefined) {
        query.caloriesPerServing.$gte = filters.minCalories;
      }
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      query['recipe.difficulty'] = { $in: filters.difficulty };
    }

    if (filters.maxPrepTime !== undefined) {
      query['recipe.prepTimeMinutes'] = { $lte: filters.maxPrepTime };
    }

    if (filters.origin && filters.origin.length > 0) {
      const originRegexes = filters.origin.map(o => new RegExp(o, 'i'));
      andConditions.push({ origin: { $in: originRegexes } });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    return query;
  }

  private resolveFoodId(food: any): string | undefined {
    if (!food || typeof food !== 'object') {
      return undefined;
    }

    const candidate = food as { _id?: any };
    if (candidate._id === undefined || candidate._id === null) {
      return undefined;
    }

    return String(candidate._id);
  }
}
