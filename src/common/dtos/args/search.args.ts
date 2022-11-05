import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SearchArgs {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  search?: string;
}
