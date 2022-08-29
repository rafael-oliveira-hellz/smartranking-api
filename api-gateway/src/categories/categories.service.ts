import { Injectable } from '@nestjs/common';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  createCategory(createCategoryDto: CreateCategoryDto) {
    this.clientAdminBackend.emit('criar-categoria', createCategoryDto);
  }

  async getCategories(_id: string): Promise<any> {
    return await this.clientAdminBackend
      .send('get-categories', _id ? _id : '')
      .toPromise();
  }

  updateCategory(updateCategoryDto: UpdateCategoryDto, _id: string) {
    this.clientAdminBackend.emit('update-category', {
      id: _id,
      category: updateCategoryDto,
    });
  }
}
