import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async edituser(id: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: id },
      data: { ...dto },
    });
    delete user.hash;
    return user;
  }
}
