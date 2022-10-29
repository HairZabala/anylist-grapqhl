import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from '../enums/valid-roles';

export const GetUser = createParamDecorator(
  (roles: ValidRoles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user)
      throw new InternalServerErrorException('User not found (Request)');

    if (roles.length === 0) return user;

    for (const role of user.roles) {
      if (roles.includes(role)) {
        return user;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${roles}]`,
    );
  },
);
