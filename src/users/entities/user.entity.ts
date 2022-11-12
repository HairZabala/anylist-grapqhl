import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { Item } from 'src/items/entities/item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  fullName: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Field(() => [ValidRoles])
  @Column({ array: true, default: ['user'], type: 'text' })
  roles: ValidRoles[];

  @Field(() => Boolean)
  @Column({ default: true, type: 'boolean' })
  isActive = true;

  // Relations
  @ManyToOne(() => User, (user) => user.lastUpdateBy, {
    nullable: true,
    lazy: true,
  })
  @JoinColumn({ name: 'lastUpdateBy' })
  @Field(() => User, { nullable: true })
  lastUpdateBy?: User;

  @OneToMany(() => Item, (item) => item.user, { lazy: true })
  items: Item[];

  @OneToMany(() => Item, (item) => item.user)
  lists: Item[];
}
