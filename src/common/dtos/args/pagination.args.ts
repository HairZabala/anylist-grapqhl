import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @IsOptional()
  @Min(1)
  @IsPositive()
  @Field(() => Int, { nullable: true })
  limit = 10;

  @IsOptional()
  @Min(0)
  @Field(() => Int, { nullable: true })
  offset = 0;
}
