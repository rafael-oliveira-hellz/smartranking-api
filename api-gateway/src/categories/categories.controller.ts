import {
  Controller,
  Get,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { UpdateCategoryDto } from 'src/categories/dtos/update-category.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Controller('api/v1/categories')
export class CategoriesController {
  private logger = new Logger(CategoriesController.name);

  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  async consultarCategories(@Query('idCategory') _id: string) {
    return await this.categoriesService.getCategories(_id);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('_id') _id: string,
  ) {
    this.categoriesService.updateCategory(updateCategoryDto, _id);
  }
}
