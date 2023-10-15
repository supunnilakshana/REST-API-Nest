/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import * as pactum from 'pactum';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

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
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        titel: 'My First Bookmark',
        link: 'https://docs.nestjs.com/',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('bookmarks')
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        titel: 'Nest Js documentation',
        description: 'all the thing in nest js here',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.titel)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAt}')
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
