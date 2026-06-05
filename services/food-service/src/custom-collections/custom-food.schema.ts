import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CustomFoodDocument = HydratedDocument<CustomFood>;

@Schema({ timestamps: true, collection: 'custom_foods' })
export class CustomFood {
  @Prop({ type: Types.ObjectId, ref: 'CustomCollection', required: true })
  collectionId!: Types.ObjectId;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: '' })
  category?: string;

  @Prop({ default: '' })
  imageUrl?: string;

  @Prop({ default: '' })
  note?: string;

  @Prop({ default: true })
  isRandomEnabled!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const CustomFoodSchema = SchemaFactory.createForClass(CustomFood);

CustomFoodSchema.index({ collectionId: 1, isDeleted: 1 });
CustomFoodSchema.index({ userId: 1, isDeleted: 1 });
CustomFoodSchema.index({ _id: 1, isDeleted: 1 });
CustomFoodSchema.index({ collectionId: 1, isRandomEnabled: 1, isDeleted: 1 });
