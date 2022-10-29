import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Field(() => [String])
  @Column({ array: true, default: ['user'], type: 'text' })
  roles: string[];

  @Field(() => Boolean)
  @Column({ default: true, type: 'boolean' })
  isActive = true;

  // Relaciones y otras cosas
}
