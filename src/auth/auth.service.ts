import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './../users/users.service';
import { SignUpInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpInput: SignUpInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signUpInput);
    const token = this.getJwToken({ id: user.id });
    return {
      token,
      user,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Email/Password do not match.');
    }

    const token = this.getJwToken({ id: user.id });

    return {
      token,
      user,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user.isActive) throw new UnauthorizedException('User not active.');

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    return {
      token: this.getJwToken({ id: user.id }),
      user,
    };
  }

  private getJwToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
