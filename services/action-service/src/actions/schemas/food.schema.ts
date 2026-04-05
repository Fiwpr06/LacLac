import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FoodDocument = HydratedDocument<Food>;

@Schema({ timestamps: true, collection: 'foods' })
export class Food {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: 0 })
  popularityScore!: number;

  @Prop({ default: 0 })
  averageRating!: number;

  @Prop({ default: 0 })
  totalReviews!: number;
}

export const FoodSchema = SchemaFactory.createForClass(Food);
