import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from 'src/list-item/list-item.service';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LIST, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,

    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
    private readonly listService: ListsService,
    private readonly listItemsService: ListItemService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async seed(): Promise<boolean> {
    if (this.isProd) {
      throw new UnauthorizedException('We cannot run seed in production');
    }

    // delete all data
    await this.deleteDatabase();

    // create users
    const user = await this.loadUsers();

    // insert items
    await this.loadItems(user);

    // insert lists
    const list = await this.loadLists(user);

    // insert list items
    const items = await this.itemService.findAll(
      user,
      { limit: 10, offset: 0 },
      {},
    );
    await this.loadListItems(list, items);

    return true;
  }

  private async deleteDatabase() {
    await this.listItemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // delete items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // delete users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  private async loadUsers(): Promise<User> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.userService.create(user));
    }

    return users[0];
  }

  private async loadItems(user: User): Promise<boolean> {
    const itemsPromises = [];

    for (const item of SEED_ITEMS) {
      itemsPromises.push(this.itemService.create(item, user));
    }

    await Promise.all(itemsPromises);
    return true;
  }

  private async loadLists(user: User): Promise<List> {
    const lists = [];

    for (const item of SEED_LIST) {
      lists.push(await this.listService.create(item, user));
    }

    return lists[0];
  }

  private async loadListItems(list: List, items: Item[]): Promise<boolean> {
    const itemsPromises = [];

    for (const item of items) {
      itemsPromises.push(
        this.listItemsService.create({
          listId: list.id,
          itemId: item.id,
          quantity: Math.floor(Math.random() * 20) + 1,
          completed: false,
        }),
      );
    }

    await Promise.all(itemsPromises);
    return true;
  }
}
