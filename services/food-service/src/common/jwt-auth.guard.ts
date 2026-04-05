import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RequestUser } from './request-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; user?: RequestUser }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thieu token xac thuc');
    }

    const token = authHeader.slice(7);
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: 'user' | 'admin';
      }>(token, {
        secret: this.configService.get<string>(
          'JWT_SECRET',
          'lac-lac-default-secret-32-characters-minimum',
        ),
      });

      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token khong hop le');
    }
  }
}
