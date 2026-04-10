import {
  ActionType,
  BudgetBucket,
  CategoryType,
  ContextTag,
  CookingStyle,
  CuisineType,
  DeviceType,
  DietType,
  DishType,
  FavoriteListType,
  MealType,
  PriceRange,
  ShakeTriggerType,
  UserRole,
} from './enums';

export interface DietPreferences {
  type: DietType;
  allergies: string[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  dietPreferences: DietPreferences;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionInfo {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface Food {
  _id: string;
  name: string;
  nameSlug: string;
  description?: string;
  images: string[];
  thumbnailImage?: string;
  category?: string;
  mealTypes: MealType[];
  priceRange: PriceRange;
  priceMin?: number;
  priceMax?: number;
  cookingStyle?: CookingStyle;
  dietTags: Exclude<DietType, 'normal'>[];
  allergens: string[];
  calories?: number;
  nutritionInfo?: NutritionInfo;
  ingredients: string[];
  tags: string[];
  origin?: string;
  contextTags: ContextTag[];
  popularityScore: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Review {
  _id: string;
  userId: string;
  foodId: string;
  rating: number;
  comment?: string;
  images: string[];
  isHidden: boolean;
  createdAt: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  foodId: string;
  listType: FavoriteListType;
  addedAt: string;
}

export interface FilterSnapshot {
  priceRange?: PriceRange;
  budgetBucket?: BudgetBucket;
  dishType?: DishType;
  cuisineType?: CuisineType;
  mealType?: MealType;
  dietTag?: Exclude<DietType, 'normal'>;
  category?: string;
}

export interface UserAction {
  _id: string;
  userId?: string;
  sessionId: string;
  foodId?: string;
  actionType: ActionType;
  context: ContextTag | 'none';
  triggerType?: ShakeTriggerType;
  filterSnapshot: FilterSnapshot;
  deviceType: DeviceType;
  sessionDurationMs?: number;
  createdAt: string;
}
