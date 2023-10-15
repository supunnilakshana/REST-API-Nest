/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import * as pactum from 'pactum';

describe('appe2etest', () => {
  let app: NestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);
    prisma = await app.get(PrismaService);
    await prisma.cleanDb();
    await pactum.request.setBaseUrl('http://localhost:3000/');
  });

  afterAll(() => {
    app.close();
  });
  it.todo('shoud pass');
  describe('Auth', () => {
    describe('Signup', () => {
      it('shouldsignup', () => {
        const dto: AuthDto = {
          email: 'supun@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe('Signin', () => {
      it('should signin', () => {
        const dto: AuthDto = {
          email: 'supun@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('auth/signin')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {});
    describe('Edit user', () => {});
  });
  describe('Bookmark', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Edit bokmark', () => {});
    describe('Delete bokmark', () => {});
  });
});
