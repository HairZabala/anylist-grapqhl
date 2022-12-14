import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchArgs } from 'src/common/dtos/args';
import { PaginationArgs } from 'src/common/dtos/args/pagination.args';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger('ItemsService');

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const item = this.itemsRepository.create({ ...createItemInput, user });
    return await this.itemsRepository.save(item);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .skip(paginationArgs.offset)
      .take(paginationArgs.limit)
      .where('"userId" = :userId', { userId: user.id });

    if (searchArgs.search) {
      queryBuilder.andWhere('LOWER("name") LIKE LOWER(:search)', {
        search: `%${searchArgs.search}%`,
      });
    }

    return queryBuilder.getMany();
    // const items = await this.itemsRepository.find({
    //   where: { user: { id: user.id } },
    //   skip: paginationArgs.offset,
    //   take: paginationArgs.limit,
    // });
    // return items;
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: { id: user.id },
    });
    if (!item) throw new BadRequestException(`Item with id ${id} not found`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemsRepository.preload(updateItemInput);
    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: soft delete, integridad referencial, etc
    const item = await this.findOne(id, user);
    await this.itemsRepository.remove(item);
    return { ...item, user, id };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemsRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
