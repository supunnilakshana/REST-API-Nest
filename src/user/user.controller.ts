import { Controller, Get, UseGuards } from '@nestjs/common';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getHello(@GetUser() user: User) {
    return user;
  }
}
