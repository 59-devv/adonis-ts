import Tag from 'App/Models/Tag'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from '../../database/factories/index';
import UnAuthorizedException from '../../app/Exceptions/UnAuthorizedException';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// TAG 조회 - [GET]: /tag
test.group('전체 TAG 조회 테스트 - [GET]: /tag', () => {
    test('1. 성공 - 전체 TAG 조회', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const allTagLength = (await Tag.all()).length

        const { body } = await supertest(BASE_URL)
            .get(`/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.typeOf(body, 'array')
        assert.property(body[0], 'id')
        assert.equal(body.length, allTagLength)
    })

    test('2. 실패 - 유저 정보 없음', async (assert) => {
        const { body } = await supertest(BASE_URL)
            .get(`/tag`)
            .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })
})

// 로그인 한 User의 TAG 조회 - [GET]: /user/tag
test.group('전체 TAG 조회 테스트 - [GET]: /user/tag', () => {
    test('1. 성공 - 유저의 TAG 조회', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get(`/user/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)


        // 유저당 Todo가 2개, Todo당 Tag가 2개이므로, 한 유저의 태그는 총 4개
        assert.lengthOf(body, 4)
    })

    test('2. 성공 - 유저의 TAG가 없을 때 빈 배열', async (assert) => {
        const user = await UserFactory.create()

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get(`/user/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.lengthOf(body, 0)
        assert.typeOf(body, 'array')
    })

    test('3. 실패 - 유저 정보 없음', async (assert) => {
        const { body } = await supertest(BASE_URL)
            .get(`/user/tag`)
            .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })
})

// TODO별 TAG 조회 - [GET]: /todo/:todoId/tag
test.group('TODO별 TAG 조회 테스트 - [GET]: /todo/:todoId/tag', () => {
    test('1. 성공 - TODO ID를 통한 TAG 조회', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        await user.load('todos')
        const todo = user.todos[0]

        const { body } = await supertest(BASE_URL)
            .get(`/todo/${todo.id}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.lengthOf(body, 2)
        assert.equal(body[0].todoId, todo.id)
    })

    test('2. 실패 - TODO ID 없을 때', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { error } = await supertest(BASE_URL)
            .get(`/todo/99999/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(error['text'], 'Todo Not Found')
        assert.equal(error['status'], 404)
    })

    test('3. 실패 - 유저 정보 없을 때', async (assert) => {
        const { error } = await supertest(BASE_URL)
            .get(`/todo/1/tag`)
            .expect(401)

        assert.deepInclude(error['text'], 'You are Unauthorized.')
        assert.equal(error['status'], 401)
    })
})