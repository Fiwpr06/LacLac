import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { CustomCollection, CustomCollectionSchema } from './custom-collection.schema';
import { CustomFood, CustomFoodSchema } from './custom-food.schema';
import { CustomCollectionsController } from './custom-collections.controller';
import { CustomCollectionsService } from './custom-collections.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: CustomCollection.name, schema: CustomCollectionSchema },
      { name: CustomFood.name, schema: CustomFoodSchema },
    ]),
  ],
  controllers: [CustomCollectionsController],
  providers: [CustomCollectionsService, JwtAuthGuard, RolesGuard],
  exports: [CustomCollectionsService, MongooseModule],
})
export class CustomCollectionsModule {}
