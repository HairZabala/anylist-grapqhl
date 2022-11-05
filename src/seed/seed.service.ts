import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from 'src/items/items.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
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

    return true;
  }

  private async deleteDatabase() {
    // delete items
    await this.itemsRepository.query('DELETE FROM items');

    // delete users
    await this.usersRepository.query('DELETE FROM users');
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
}
