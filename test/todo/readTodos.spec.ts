import Todo from 'App/Models/Todo';
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import { TodoFactory } from '../../database/factories/index';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// TODO 조회 - [GET]: /todo
test.group('TODO 리스트 조회 테스트 - [GET]: /todo', (group) => {
    group.before(async () => {
        const userPayload = {
            email: "todoTest11@test.com",
            password: "test1234!",
            nickname: "테스트투두11",
        }

        const user: User = await User.create(userPayload)

        await TodoFactory.merge([
            { content: "test1", status: "OnGoing", userId: user.id },
            { content: "test2", status: "OnGoing", userId: user.id },
            { content: "test3", status: "OnGoing", userId: user.id },
        ]).createMany(3)
    })

    test('1. 성공 - 본인이 작성한 Todo 목록 조회', async (assert) => {
        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: "todoTest11@test.com",
                password: "test1234!",
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.equal(body.length, 3)
        assert.equal(body[0].status, 'OnGoing')
    })

    test('2. 성공 - Todo 없을 경우 빈 배열', async (assert) => {
        const userPayload = {
            email: "todoTest12@test.com",
            password: "test1234!",
            nickname: "테스트투두12",
        }

        await User.create(userPayload)
        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: "todoTest12@test.com",
                password: "test1234!",
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.equal(body.length, 0)
        assert.typeOf(body, 'array')
    })

    test('3. 실패 - 로그인 정보 없음', async (assert) => {
        const { body } = await supertest(BASE_URL)
            .get('/todo')
            .expect(401)

        assert.equal(body['code'], 'UNAUTHORIZED')
        assert.equal(body['message'], 'You are Unauthorized.')
        assert.equal(body['status'], 401)
    })
})

// TODO 조회 - [GET]: /todo:todoId
test.group('TODO 조회 테스트 - [GET]: /todo:todoId', (group) => {
    group.before(async () => {
        const userPayload = {
            email: "todoTest13@test.com",
            password: "test1234!",
            nickname: "테스트투두13",
        }

        await User.create(userPayload)
    })

    test('1. 성공 - Todo 조회', async (assert) => {
        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: "todoTest13@test.com",
                password: "test1234!",
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            content: "TODO 조회",
            status: "OnGoing"
        }

        const todo = await Todo.create(todoPayload)

        const { body } = await supertest(BASE_URL)
            .get(`/todo/${todo.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.exists(body.id)
        assert.equal(body.content, todoPayload.content)
        assert.equal(body.status, todoPayload.status)
    })

    test('2. 실패 - 없는 todoId를 요청했을 경우', async (assert) => {
        const userPayload = {
            email: "todoTest14@test.com",
            password: "test1234!",
            nickname: "테스트투두14",
        }

        await User.create(userPayload)
        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: "todoTest14@test.com",
                password: "test1234!",
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { error } = await supertest(BASE_URL)
            .get('/todo/99999')
            .set('Authorization', `${tokenType} ${token}`)
            .expect(400)

        assert.equal(error['status'], 400)
        assert.equal(error['text'], '잘못된 요청입니다.')
    })

    test('3. 실패 - 로그인 정보 없음', async (assert) => {
        const { body } = await supertest(BASE_URL)
            .get('/todo')
            .expect(401)

        assert.equal(body['code'], 'UNAUTHORIZED')
        assert.equal(body['message'], 'You are Unauthorized.')
        assert.equal(body['status'], 401)
    })
})