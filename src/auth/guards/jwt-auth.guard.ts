import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
