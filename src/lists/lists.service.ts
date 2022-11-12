import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateListInput, UpdateListInput } from './dto/inputs/';
import { List } from './entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dtos/args';

@Injectable()
export class ListsService {
  private readonly logger = new Logger('ListsService');

  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const list = this.listsRepository.create({ ...createListInput, user });
    return await this.listsRepository.save(list);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<List[]> {
    const queryBuilder = this.listsRepository
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
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listsRepository.findOneBy({
      id,
      user: { id: user.id },
    });

    if (!list) throw new BadRequestException(`list with id ${id} not found`);
    return list;
  }

  async update(
    id: string,
    updateListInput: UpdateListInput,
    user: User,
  ): Promise<List> {
    await this.findOne(id, user);
    const list = await this.listsRepository.preload(updateListInput);
    return this.listsRepository.save(list);
  }

  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne(id, user);
    await this.listsRepository.remove(list);
    return { ...list, user, id };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async listsCountByUser(user: User): Promise<number> {
    return await this.listsRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
