import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ContentType = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.headers['content-type'];
  },
);
