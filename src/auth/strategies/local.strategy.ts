import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ApiErrorResponse } from 'src/common/api-error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      const errorResponse: ApiErrorResponse = {
        errorCode: 'AUTH',
        errorMessage: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      };
      throw new UnauthorizedException(errorResponse);
    }
    return user;
  }
}
