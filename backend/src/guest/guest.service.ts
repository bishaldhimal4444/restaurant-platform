import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class GuestService {
  generateToken(): string {
    return randomUUID();
  }
}
