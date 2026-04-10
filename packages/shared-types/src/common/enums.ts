export type UserRole = 'user' | 'admin';

export type DietType = 'normal' | 'vegetarian' | 'vegan' | 'keto' | 'clean';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type PriceRange = 'cheap' | 'medium' | 'expensive';

export type BudgetBucket = 'under_30k' | 'from_30k_to_50k' | 'from_50k_to_100k' | 'over_100k';

export type DishType = 'liquid' | 'dry' | 'fried_grilled';

export type CuisineType = 'vietnamese' | 'asian' | 'european';

export type CookingStyle = 'soup' | 'dry' | 'fried' | 'grilled' | 'raw' | 'steamed';

export type ContextTag = 'solo' | 'date' | 'group' | 'travel' | 'office';

export type FavoriteListType = 'favorite' | 'want_to_try' | 'eaten_often';

export type DeviceType = 'mobile' | 'web';

export type ShakeTriggerType = 'shake' | 'button';

export type ActionType =
  | 'swipe_right'
  | 'swipe_left'
  | 'view_detail'
  | 'shake_result'
  | 'favorite_add'
  | 'favorite_remove'
  | 'review_submit';

export type CategoryType = 'cuisine' | 'meal_type' | 'diet';
