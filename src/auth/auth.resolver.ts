import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './../users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignUpInput, LoginInput } from './dto/inputs/';
import { ValidRoles } from './enums/valid-roles';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse } from './types/auth-response.type';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signUp' })
  async signUp(
    @Args('signUpInput') signUpInput: SignUpInput,
  ): Promise<AuthResponse> {
    return this.authService.signUp(signUpInput);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(@GetUser([ValidRoles.admin]) user: User): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
