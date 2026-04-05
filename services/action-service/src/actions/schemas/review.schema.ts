import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
  foodId!: Types.ObjectId;

  @Prop({ min: 1, max: 5, required: true })
  rating!: number;

  @Prop()
  comment?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ default: false })
  isHidden!: boolean;

  createdAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ userId: 1, foodId: 1 }, { unique: true });
