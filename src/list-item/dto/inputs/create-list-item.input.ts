import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateListItemInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity? = 0;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  completed? = false;

  @Field(() => ID)
  @IsUUID()
  listId: string;

  @Field(() => ID)
  @IsUUID()
  itemId: string;
}
