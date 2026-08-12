import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { randomUUID, createHmac, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GuestAuthService {
  private readonly COOKIE_NAME = 'guest_token';
  private readonly COOKIE_MAX_AGE = 6 * 60 * 60 * 1000; // 6 hours
  private readonly QR_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180; // 6 months

  constructor(private readonly config: ConfigService) {}

  generateToken(): string {
    return randomUUID();
  }

  setGuestCookie(response: Response, token: string): void {
    response.cookie(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.COOKIE_MAX_AGE,
      path: '/',
    });
  }

  clearGuestCookie(response: Response): void {
    response.clearCookie(this.COOKIE_NAME, { path: '/' });
  }

  extractTokenFromRequest(request: any): string | null {
    return request.cookies?.[this.COOKIE_NAME] || null;
  }

  // --- QR signing ---

  private getSecret(): string {
    const secret = this.config.get<string>('QR_SECRET');
    if (!secret) {
      throw new Error('QR_SECRET is not configured');
    }
    return secret;
  }

  signTablePayload(tableId: string): { ts: string; sig: string } {
    const ts = Date.now().toString();
    const sig = createHmac('sha256', this.getSecret())
      .update(`${tableId}.${ts}`)
      .digest('hex');
    return { ts, sig };
  }

  verifyTablePayload(tableId: string, ts: string, sig: string): boolean {
    const expected = createHmac('sha256', this.getSecret())
      .update(`${tableId}.${ts}`)
      .digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }
    if (!timingSafeEqual(sigBuf, expectedBuf)) {
      return false;
    }

    const age = Date.now() - Number(ts);
    if (Number.isNaN(age) || age < 0 || age > this.QR_MAX_AGE_MS) {
      return false;
    }
    return true;
  }
}
