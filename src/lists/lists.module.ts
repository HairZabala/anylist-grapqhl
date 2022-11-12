import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List } from './entities/list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [TypeOrmModule.forFeature([List])],
  exports: [TypeOrmModule, ListsService],
})
export class ListsModule {}
