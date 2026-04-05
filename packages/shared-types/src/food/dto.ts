import { ContextTag, CookingStyle, DietType, MealType, PriceRange } from '../common/enums';
import { NutritionInfo } from '../common/entities';

export interface FilterDto {
  priceRange?: PriceRange;
  category?: string;
  mealType?: MealType;
  dietTag?: Exclude<DietType, 'normal'>;
  allergenExclude?: string[];
  cookingStyle?: CookingStyle;
  context?: ContextTag;
}

export interface ContextFilterDto {
  context: ContextTag;
  filters?: FilterDto;
}

export interface CreateFoodDto {
  name: string;
  description?: string;
  images?: string[];
  thumbnailImage?: string;
  category?: string;
  mealTypes: MealType[];
  priceRange: PriceRange;
  priceMin?: number;
  priceMax?: number;
  cookingStyle?: CookingStyle;
  dietTags?: Exclude<DietType, 'normal'>[];
  allergens?: string[];
  calories?: number;
  nutritionInfo?: NutritionInfo;
  ingredients: string[];
  tags?: string[];
  origin?: string;
  contextTags?: ContextTag[];
  isActive?: boolean;
}

export type UpdateFoodDto = Partial<CreateFoodDto>;
