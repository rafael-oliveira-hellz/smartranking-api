import { Controller, Logger } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  Payload,
  EventPattern,
  MessagePattern,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { ICategory } from './interfaces/category.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  logger = new Logger(CategoriesController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: ICategory,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`data: ${JSON.stringify(category)}`);

    try {
      await this.categoriesService.createCategory(category);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
        return;
      }

      await channel.nack(originalMsg);
    }
  }

  @MessagePattern('get-categories')
  async getCategories(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      if (_id) {
        return await this.categoriesService.getCategoryById(_id);
      } else {
        return await this.categoriesService.gellAllCategories();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('update-category')
  async updateCategory(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`data: ${JSON.stringify(data)}`);
    try {
      const _id: string = data.id;
      const category: ICategory = data.categoria;
      await this.categoriesService.updateCategory(_id, category);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
        return;
      }

      await channel.nack(originalMsg);
    }
  }
}
