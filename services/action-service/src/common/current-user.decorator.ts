import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestUser } from './request-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): RequestUser | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    return request.user;
  },
);
