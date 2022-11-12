import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@ObjectType()
@Entity('listItems')
@Unique('listItem-item', ['list', 'item'])
export class ListItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  quantity: number;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  completed: boolean;

  // relations
  @ManyToOne(() => List, (list) => list.listItem, {
    nullable: false,
    lazy: true,
  })
  @Index('listId-listItems-index')
  @Field(() => List)
  list: List;

  @ManyToOne(() => Item, (item) => item.listItem, {
    nullable: false,
    lazy: true,
  })
  @Index('itemId-listItems-index')
  @Field(() => Item)
  item: Item;
}
