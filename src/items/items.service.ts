import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const item = this.itemsRepository.create(createItemInput);
    return await this.itemsRepository.save(item);
  }

  findAll(): Promise<Item[]> {
    // TODO: filtrar, paginar, por usuario, etc
    return this.itemsRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) throw new BadRequestException(`Item with id ${id} not found`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    console.log(updateItemInput);
    const item = await this.itemsRepository.preload(updateItemInput);
    console.log({ item });
    return this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    // TODO: soft delete, integridad referencial, etc
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
