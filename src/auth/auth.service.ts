import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtservice: JwtService,
    private config: ConfigService,
  ) {}

  async signup(authdto: AuthDto): Promise<User> {
    try {
      const hash: string = await argon.hash(authdto.password);
      const user: User = await this.prismaService.user.create({
        data: {
          email: authdto.email,
          hash: hash,
          firstName: 's',
          lastName: 'd',
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential Taken');
        }
      }
      throw error;
    }
  }
  async signin(authdto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: authdto.email },
    });

    if (!user) throw new ForbiddenException('Cretantial  incorrect');

    const pwMatches: boolean = await argon.verify(user.hash, authdto.password);

    if (pwMatches) {
      delete user.hash;
      return this.genarateJWT(user.id, user.email);
    } else {
      throw new ForbiddenException('Cretantial  incorrect');
    }
  }

  async genarateJWT(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
    };
    const jwtsecrete = this.config.get('JWT_SCRETE');
    const token = await this.jwtservice.signAsync(payload, {
      expiresIn: '20h',
      secret: jwtsecrete,
    });
    return { access_token: token };
  }
}
