import { ActionType, ContextTag, DeviceType, FavoriteListType, MealType, PriceRange } from '../common/enums';

export interface ActionDto {
  userId?: string;
  sessionId: string;
  foodId?: string;
  actionType: ActionType;
  context: ContextTag | 'none';
  filterSnapshot: {
    priceRange?: PriceRange;
    mealType?: MealType;
    dietTag?: string;
    category?: string;
  };
  deviceType: DeviceType;
  sessionDurationMs?: number;
}

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
