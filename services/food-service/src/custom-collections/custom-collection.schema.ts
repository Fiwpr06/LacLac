import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomCollectionDocument = HydratedDocument<CustomCollection>;

@Schema({ timestamps: true, collection: 'custom_collections' })
export class CustomCollection {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: '' })
  imageUrl?: string;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const CustomCollectionSchema = SchemaFactory.createForClass(CustomCollection);

CustomCollectionSchema.index({ userId: 1, isDeleted: 1 });
CustomCollectionSchema.index({ _id: 1, isDeleted: 1 });
