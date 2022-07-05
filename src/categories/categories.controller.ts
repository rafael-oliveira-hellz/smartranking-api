import {
  Body,
  Controller,
  Delete,
  Get, Param, Post,
  Put, Query, UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { ICategory } from './interfaces/category.interface';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ICategory> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Get()
  async getCategories(
    @Query() params: string[]
  ): Promise<Array<ICategory> | ICategory> {
    const categoryId = params['categotyId'];
    const playerId = params['playerId'];

    if (categoryId) {
      return await this.categoryService.getCategory(categoryId);
    }

    if (playerId) {
      return await this.categoryService.getPlayerCategory(playerId);
    }

    return await this.categoryService.listAllCategories();
  }

  @Put(':category')
  @UsePipes(ValidationPipe)
  async update(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('category') category: string,
  ): Promise<void> {
    await this.categoryService.updateCategory(category, updateCategoryDto);
  }

  @Delete(':category')
  async delete(
    @Param('category') category: string,
  ): Promise<void> {
    await this.categoryService.deleteCategory(category);
  }

  @Post(':category/player/:playerId')
  async attachPlayerToCategory(
    @Param() params: string[],
  ): Promise<void> {
    await this.categoryService.attachPlayerToCategory(params);
  }
}
