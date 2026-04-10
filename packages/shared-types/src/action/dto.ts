import {
  ActionType,
  BudgetBucket,
  ContextTag,
  CuisineType,
  DeviceType,
  DishType,
  FavoriteListType,
  MealType,
  PriceRange,
  ShakeTriggerType,
} from '../common/enums';

export interface ActionDto {
  userId?: string;
  sessionId: string;
  foodId?: string;
  actionType: ActionType;
  context: ContextTag | 'none';
  triggerType?: ShakeTriggerType;
  filterSnapshot: {
    priceRange?: PriceRange;
    budgetBucket?: BudgetBucket;
    dishType?: DishType;
    cuisineType?: CuisineType;
    mealType?: MealType;
    dietTag?: string;
    category?: string;
  };
  deviceType: DeviceType;
  sessionDurationMs?: number;
}

export type UserActionDto = ActionDto;

export type ShakeResultActionDto = ActionDto & {
  actionType: 'shake_result';
  triggerType: ShakeTriggerType;
};

export interface FavoriteDto {
  userId: string;
  foodId: string;
  listType: FavoriteListType;
}

export interface ReviewDto {
  userId: string;
  foodId: string;
  rating: number;
  comment?: string;
  images?: string[];
}
