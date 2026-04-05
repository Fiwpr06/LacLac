import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FavoriteDocument = HydratedDocument<Favorite>;

@Schema({ timestamps: false, collection: 'favorites' })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
  foodId!: Types.ObjectId;

  @Prop({ type: String, enum: ['favorite', 'want_to_try', 'eaten_often'], required: true })
  listType!: 'favorite' | 'want_to_try' | 'eaten_often';

  @Prop({ type: Date, default: Date.now })
  addedAt!: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
FavoriteSchema.index({ userId: 1, foodId: 1, listType: 1 }, { unique: true });
