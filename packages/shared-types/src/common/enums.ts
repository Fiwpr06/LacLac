export type UserRole = 'user' | 'admin';

export type DietType = 'normal' | 'vegetarian' | 'vegan' | 'keto' | 'clean';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type PriceRange = 'cheap' | 'medium' | 'expensive';

export type CookingStyle = 'soup' | 'dry' | 'fried' | 'grilled' | 'raw' | 'steamed';

export type ContextTag = 'solo' | 'date' | 'group' | 'travel' | 'office';

export type FavoriteListType = 'favorite' | 'want_to_try' | 'eaten_often';

export type DeviceType = 'mobile' | 'web';

export type ActionType =
  | 'swipe_right'
  | 'swipe_left'
  | 'view_detail'
  | 'shake_result'
  | 'favorite_add'
  | 'favorite_remove'
  | 'review_submit';

export type CategoryType = 'cuisine' | 'meal_type' | 'diet';
