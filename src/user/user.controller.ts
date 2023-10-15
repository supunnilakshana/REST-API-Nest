import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userservice: UserService) {}
  @UseGuards(JwtGuard)
  @Get('me')
  getme(@GetUser() user: User) {
    return user;
  }
  @UseGuards(JwtGuard)
  @Patch('edit')
  edituser(@GetUser('id') id: number, @Body() dto: EditUserDto) {
    console.log(id);
    return this.userservice.edituser(id, dto);
  }
}
