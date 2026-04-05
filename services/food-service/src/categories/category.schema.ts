import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: false, collection: 'categories' })
export class Category {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, enum: ['cuisine', 'meal_type', 'diet'], required: true })
  type!: 'cuisine' | 'meal_type' | 'diet';

  @Prop()
  icon?: string;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
