import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpInput } from './../auth/dto/inputs/signup.input';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginationArgs, SearchArgs } from 'src/common/dtos/args';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(signUpInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signUpInput,
        password: bcrypt.hashSync(signUpInput.password, 10),
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    roles: ValidRoles[],
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder()
      .skip(paginationArgs.offset)
      .take(paginationArgs.limit);

    if (roles.length > 0) {
      queryBuilder.andWhere('ARRAY[roles] && ARRAY[:...roles]', { roles });
    }

    if (searchArgs.search) {
      queryBuilder.andWhere(
        'LOWER("fullName") LIKE LOWER(:search) OR LOWER("email") LIKE LOWER(:search)',
        { search: `%${searchArgs.search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['email', 'password', 'id'],
    });

    if (!user) throw new NotFoundException(`${email} not found.`);

    return user;
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`user with id ${id} not found.`);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    adminUser: User,
  ): Promise<User> {
    try {
      if (updateUserInput.password) {
        updateUserInput.password = bcrypt.hashSync(
          updateUserInput.password,
          10,
        );
      }

      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id,
      });
      user.lastUpdateBy = adminUser;
      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    return await this.usersRepository.save(userToBlock);
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
