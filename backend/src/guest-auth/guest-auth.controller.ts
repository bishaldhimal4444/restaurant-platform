// Purpose:
// - Endpoint to get/refresh guest token
// - Useful for testing and explicit token generation
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GuestAuthService } from './guest-auth.service';
import { GuestAuthGuard } from './guest-auth.guard';
import type { Request, Response } from 'express';

@Controller('guest-auth')
export class GuestAuthController {
  constructor(private readonly guestAuthService: GuestAuthService) {}

  @Get('token')
  @UseGuards(GuestAuthGuard)
  getOrCreateToken(@Req() req: Request) {
    // The guard ensures guestToken exists on request
    return {
      token: (req as any).guestToken,
      message: 'Guest token retrieved or created'
    };
  }

  @Post('clear')
  clearToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.guestAuthService.clearGuestCookie(res);
    return { message: 'Guest token cleared' };
  }
}
