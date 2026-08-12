import { Module } from '@nestjs/common';
import { GuestAuthService } from './guest-auth.service';
import { GuestAuthGuard } from './guest-auth.guard';
import { GuestAuthController } from './guest-auth.controller';

@Module({
  controllers: [GuestAuthController],
  providers: [GuestAuthService, GuestAuthGuard],
  exports: [GuestAuthService, GuestAuthGuard],
})
export class GuestAuthModule {}
