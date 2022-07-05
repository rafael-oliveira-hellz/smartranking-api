import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { ICategory } from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<ICategory>,
    private readonly playersService: PlayersService
  ) { }

  /** Create Method */
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ICategory> {
    const { category } = createCategoryDto;

    const categoryFound = await this.categoryModel.findOne({ category }).exec();

    if (categoryFound) {
      throw new BadRequestException('Category [ ' + category + ' ] already exists');
    }

    return await this.create(createCategoryDto);
  }

  private async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ICategory> {
    const createCategory = new this.categoryModel(createCategoryDto);

    return createCategory.save();
  }
  /** End of the Create Method */

  /** Listing Methods */
  async listAllCategories(): Promise<Array<ICategory>> {
    return await this.categoryModel.find().populate("players").exec();
  }

  async getCategory(category: string): Promise<ICategory> {
    const categoryFound = await this.categoryModel.findOne({ category }).populate("players").exec();

    if (!categoryFound) {
      throw new NotFoundException('Category [ ' + category + ' ] does not exist');
    }

    return categoryFound;
  }

  async getPlayerCategory(playerId: any): Promise<ICategory> {
    const players = await this.playersService.getAllPlayers();

    const playerFiltered = players.filter(player => player.id === playerId);

    if (playerFiltered.length === 0) {
      throw new NotFoundException('Player [ ' + playerId + ' ] not found');
    }

    return await this.categoryModel.findOne().where('players').in(playerId).exec();
  }
  /** End of the Listing Method */

  /** Update Methods */
  private async update(
    category: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ICategory> {
    return await this.categoryModel.findOneAndUpdate(
      { category },
      { $set: updateCategoryDto },
      { new: true },
    ).exec();
  }

  async updateCategory(category: string, updateCategoryDto: UpdateCategoryDto): Promise<void> {
    const categoryFound = await this.categoryModel.findOne({ category }).exec();

    if (categoryFound) {
      await this.update(category, updateCategoryDto);
    } else {
      throw new NotFoundException('Category [ ' + category + ' ] not found');
    }
  }
  /** End of the Update Method */

  /** Delete Methods */
  private async delete(category: string): Promise<ICategory> {
    return await this.categoryModel.findOneAndDelete({ category }).exec();
  }

  async deleteCategory(category: string): Promise<void> {
    const categoryFound = await this.categoryModel.findOne({ category }).exec();

    if (categoryFound) {
      await this.delete(category);
    } else {
      throw new NotFoundException('Category [ ' + category + ' ] not found');
    }
  }
  /** End of the Delete Method */

  /** Attach Player to a Category */
  async attachPlayerToCategory(
    params: string[]
  ): Promise<void> {
    const category = params['category'];
    const playerId = params['playerId'];

    const categoryFound = await this.categoryModel.findOne({ category }).exec();

    const playerExistsInCategory = await this.categoryModel
      .findOne()
      .where('players')
      .in(playerId)
      .exec();

    const players = await this.playersService.getAllPlayers();

    const playerFiltered = players.filter(player => player.id === playerId);

    if (playerFiltered.length === 0) {
      throw new BadRequestException('Player [ ' + playerId + ' ] not found');
    }

    if (!categoryFound) {
      throw new BadRequestException('Category [ ' + category + ' ] not found');
    }

    if (playerExistsInCategory) {
      throw new BadRequestException('Player [ ' + playerId + ' ] already exists in Category [ ' + category + ' ]');
    }

    categoryFound.players.push(playerId);

    await this.categoryModel.findOneAndUpdate(
      { category },
      { $set: categoryFound },
      { new: true },
    ).exec();

  }
  /** End of the Attach Player to a Category */
}
