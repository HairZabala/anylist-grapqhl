import { InputType, Int, Field, ID } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

@InputType()
export class CreateListItemInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  quantity = 0;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  completed = false;

  @Field(() => ID)
  @IsUUID()
  listId: string;

  @Field(() => ID)
  @IsUUID()
  itemId: string;
}
