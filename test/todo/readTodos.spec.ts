import Todo from 'App/Models/Todo';
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from '../../database/factories/index';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// TODO 조회 - [GET]: /todo
test.group('TODO 리스트 조회 테스트 - [GET]: /todo', () => {
    test('1. 성공 - 본인이 작성한 Todo 목록 조회', async (assert) => {
        const allUsers = await User.all()
        const user = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.equal(body[0].userId, user.id)
    })

    test('2. 성공 - Todo 없을 경우 빈 배열', async (assert) => {
        const { email } = await UserFactory.create()

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email,
                password: PASSWORD,
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
test.group('TODO 조회 테스트 - [GET]: /todo:todoId', () => {
    test('1. 성공 - Todo 조회', async (assert) => {
        const allUsers = await User.all()
        const user = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const allTodos = await Todo.all()
        const todo = allTodos[Math.floor(Math.random() * allTodos.length)]

        const { body } = await supertest(BASE_URL)
            .get(`/todo/${todo.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.exists(body.id)
        assert.equal(body.content, todo.content)
        assert.equal(body.status, todo.status)
    })

    test('2. 실패 - 없는 todoId를 요청했을 경우', async (assert) => {
        const allUsers = await User.all()
        const user = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const allTodosLength = (await Todo.all()).length

        const { error } = await supertest(BASE_URL)
            .get(`/todo/${allTodosLength + 1}`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(error['status'], 404)
        assert.equal(error['text'], 'Todo Not Found')
    })

    test('3. 실패 - 로그인 정보 없음', async (assert) => {
        const allTodosLength = (await Todo.all()).length

        const { body } = await supertest(BASE_URL)
            .get(`/todo/${allTodosLength + 1}`)
            .expect(401)

        assert.equal(body['code'], 'UNAUTHORIZED')
        assert.equal(body['message'], 'You are Unauthorized.')
        assert.equal(body['status'], 401)
    })
})