import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class DietPreferences {
  @Prop({
    type: String,
    enum: ['normal', 'vegetarian', 'vegan', 'keto', 'clean'],
    default: 'normal',
  })
  type!: 'normal' | 'vegetarian' | 'vegan' | 'keto' | 'clean';

  @Prop({ type: [String], default: [] })
  allergies!: string[];
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ type: DietPreferences, default: () => ({ type: 'normal', allergies: [] }) })
  dietPreferences!: DietPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
