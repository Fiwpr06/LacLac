import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, isValidObjectId } from 'mongoose';

import { CustomCollection, CustomCollectionDocument } from './custom-collection.schema';
import { CustomFood, CustomFoodDocument } from './custom-food.schema';
import { CreateCustomCollectionDto, UpdateCustomCollectionDto } from './dto/create-custom-collection.dto';
import { CreateCustomFoodDto, UpdateCustomFoodDto } from './dto/create-custom-food.dto';

@Injectable()
export class CustomCollectionsService {
  constructor(
    @InjectModel(CustomCollection.name)
    private readonly collectionModel: Model<CustomCollectionDocument>,
    @InjectModel(CustomFood.name)
    private readonly foodModel: Model<CustomFoodDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  // ==========================================
  // COLLECTION CRUD
  // ==========================================

  async create(userId: string, dto: CreateCustomCollectionDto): Promise<CustomCollection> {
    const activeCount = await this.collectionModel.countDocuments({ userId, isDeleted: false }).exec();
    if (activeCount >= 20) {
      throw new BadRequestException('Mỗi người dùng chỉ được tạo tối đa 20 bộ món ăn');
    }

    const created = await this.collectionModel.create({
      userId,
      ...dto,
    });
    return created.toObject() as CustomCollection;
  }

  async findAll(userId: string): Promise<CustomCollection[]> {
    return this.collectionModel
      .find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<CustomCollection[]>;
  }

  async findOne(userId: string, id: string): Promise<CustomCollection> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID bộ sưu tập không hợp lệ');
    }

    const collection = await this.collectionModel
      .findOne({ _id: id, userId, isDeleted: false })
      .lean()
      .exec();

    if (!collection) {
      throw new NotFoundException('Không tìm thấy bộ sưu tập');
    }

    return collection as CustomCollection;
  }

  async update(userId: string, id: string, dto: UpdateCustomCollectionDto): Promise<CustomCollection> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID bộ sưu tập không hợp lệ');
    }

    const updated = await this.collectionModel
      .findOneAndUpdate({ _id: id, userId, isDeleted: false }, dto, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Không tìm thấy bộ sưu tập');
    }

    return updated as CustomCollection;
  }

  async remove(userId: string, id: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID bộ sưu tập không hợp lệ');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updated = await this.collectionModel
        .findOneAndUpdate(
          { _id: id, userId, isDeleted: false },
          { isDeleted: true, deletedAt: new Date() },
          { new: true, session },
        )
        .exec();

      if (!updated) {
        throw new NotFoundException('Không tìm thấy bộ sưu tập');
      }

      // Soft delete all custom foods within this collection
      await this.foodModel
        .updateMany(
          { collectionId: new Types.ObjectId(id), userId, isDeleted: false },
          { isDeleted: true, deletedAt: new Date() },
          { session },
        )
        .exec();

      await session.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async copyCollection(userId: string, id: string): Promise<CustomCollection> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID bộ sưu tập không hợp lệ');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Lấy bộ sưu tập gốc
      const originalCollection = await this.collectionModel
        .findOne({ _id: id, userId, isDeleted: false })
        .session(session)
        .exec();

      if (!originalCollection) {
        throw new NotFoundException('Không tìm thấy bộ sưu tập cần sao chép');
      }

      // Kiểm tra giới hạn bộ sưu tập
      const activeCount = await this.collectionModel
        .countDocuments({ userId, isDeleted: false })
        .session(session)
        .exec();

      if (activeCount >= 20) {
        throw new BadRequestException('Mỗi người dùng chỉ được tạo tối đa 20 bộ món ăn');
      }

      // 2. Tạo bộ sưu tập mới
      const newCollection = new this.collectionModel({
        userId,
        name: `${originalCollection.name} (Bản sao)`,
        description: originalCollection.description,
        imageUrl: originalCollection.imageUrl,
      });
      const savedCollection = await newCollection.save({ session });

      // 3. Sao chép toàn bộ món ăn bên trong
      const foods = await this.foodModel
        .find({ collectionId: new Types.ObjectId(id), userId, isDeleted: false })
        .session(session)
        .exec();

      if (foods.length > 0) {
        const copiedFoods = foods.map((food) => ({
          collectionId: savedCollection._id,
          userId,
          name: food.name,
          description: food.description,
          category: food.category,
          imageUrl: food.imageUrl,
          note: food.note,
          isRandomEnabled: food.isRandomEnabled,
          sortOrder: food.sortOrder,
          isDeleted: false,
        }));
        await this.foodModel.insertMany(copiedFoods, { session });
      }

      await session.commitTransaction();
      return savedCollection.toObject() as CustomCollection;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ==========================================
  // FOOD CRUD WITHIN COLLECTION
  // ==========================================

  async addFood(userId: string, collectionId: string, dto: CreateCustomFoodDto): Promise<CustomFood> {
    if (!isValidObjectId(collectionId)) {
      throw new BadRequestException('ID bộ sưu tập không hợp lệ');
    }

    // Xác nhận bộ sưu tập tồn tại và thuộc sở hữu của user
    const collectionExists = await this.collectionModel.exists({
      _id: collectionId,
      userId,
      isDeleted: false,
    });
    if (!collectionExists) {
      throw new NotFoundException('Không tìm thấy bộ sưu tập');
    }

    // Kiểm tra giới hạn món ăn trong bộ sưu tập (tối đa 100)
    const activeFoodCount = await this.foodModel
      .countDocuments({ collectionId: new Types.ObjectId(collectionId), isDeleted: false })
      .exec();

    if (activeFoodCount >= 100) {
      throw new BadRequestException('Mỗi bộ món ăn chỉ được chứa tối đa 100 món');
    }

    const created = await this.foodModel.create({
      collectionId: new Types.ObjectId(collectionId),
      userId,
      ...dto,
    });
    return created.toObject() as CustomFood;
  }

  async getFoods(userId: string, collectionId: string): Promise<CustomFood[]> {
    if (!isValidObjectId(collectionId)) {
      throw new BadRequestException('ID bộ sưu tập không hợp lệ');
    }

    // Xác nhận bộ sưu tập tồn tại
    const collectionExists = await this.collectionModel.exists({
      _id: collectionId,
      userId,
      isDeleted: false,
    });
    if (!collectionExists) {
      throw new NotFoundException('Không tìm thấy bộ sưu tập');
    }

    return this.foodModel
      .find({ collectionId: new Types.ObjectId(collectionId), userId, isDeleted: false })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec() as Promise<CustomFood[]>;
  }

  async updateFood(
    userId: string,
    collectionId: string,
    foodId: string,
    dto: UpdateCustomFoodDto,
  ): Promise<CustomFood> {
    if (!isValidObjectId(collectionId) || !isValidObjectId(foodId)) {
      throw new BadRequestException('ID bộ sưu tập hoặc ID món ăn không hợp lệ');
    }

    const updated = await this.foodModel
      .findOneAndUpdate(
        {
          _id: foodId,
          collectionId: new Types.ObjectId(collectionId),
          userId,
          isDeleted: false,
        },
        dto,
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Không tìm thấy món ăn trong bộ sưu tập');
    }

    return updated as CustomFood;
  }

  async removeFood(userId: string, collectionId: string, foodId: string): Promise<{ deleted: boolean }> {
    if (!isValidObjectId(collectionId) || !isValidObjectId(foodId)) {
      throw new BadRequestException('ID bộ sưu tập hoặc ID món ăn không hợp lệ');
    }

    const updated = await this.foodModel
      .findOneAndUpdate(
        {
          _id: foodId,
          collectionId: new Types.ObjectId(collectionId),
          userId,
          isDeleted: false,
        },
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Không tìm thấy món ăn trong bộ sưu tập');
    }

    return { deleted: true };
  }
}
