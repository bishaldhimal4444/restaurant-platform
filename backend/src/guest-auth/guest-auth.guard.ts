// Purpose:
// - Extract guest token from cookies
// - Attach it to the request object
// - Allow access only if token exists (or create one)
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GuestAuthService } from './guest-auth.service';
import type { Request, Response } from 'express';

@Injectable()
export class GuestAuthGuard implements CanActivate {
  constructor(private readonly guestAuthService: GuestAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    let token = this.guestAuthService.extractTokenFromRequest(request);

    // If no token exists, create one and set cookie
    if (!token) {
      token = this.guestAuthService.generateToken();
      this.guestAuthService.setGuestCookie(response, token);
    }

    // Attach token to request for use in controllers
    (request as any).guestToken = token;
    return true;
  }
}
