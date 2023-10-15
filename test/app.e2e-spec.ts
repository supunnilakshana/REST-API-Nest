/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import * as pactum from 'pactum';
import { EditUserDto } from 'src/user/dto';

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
      it('should thrown error email empty', () => {
        const dto: AuthDto = {
          email: '',
          password: '123456',
        };
        return pactum
          .spec()
          .post('auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });
      it('should thrown error no body provided', () => {
        return pactum.spec().post('auth/signup').expectStatus(400);
      });
      it('shouldsignup', () => {
        const dto: AuthDto = {
          email: 'supun@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('auth/signup')
          .withBody(dto)
          .expectStatus(201);
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
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('fetch user by token', () => {
        return pactum
          .spec()
          .get('users/me')
          .withBearerToken('$S{userAt}')
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('edit user by id', () => {
        const dto: EditUserDto = {
          email: 'supun@gmail.com',
          firstName: 'supantha',
          lastName: 'nilaa',
        };
        return pactum
          .spec()
          .patch('users/edit')
          .withBody(dto)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .inspect();
      });
    });
  });
  describe('Bookmark', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Edit bokmark', () => {});
    describe('Delete bokmark', () => {});
  });
});
