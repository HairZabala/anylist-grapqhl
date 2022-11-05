import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => Boolean, {
    name: 'executeSeed',
    description: 'Execute seed database',
  })
  async executeSeed(): Promise<boolean> {
    await this.seedService.seed();
    return true;
  }
}
