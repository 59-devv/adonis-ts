import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException';
import Todo from 'App/Models/Todo';
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// TODO 수정 - [PUT] /todo/:todoId
test.group('TODO 수정 테스트 - [PUT] /todo/:todoId', () => {
    test('1. 성공 - TODO 수정', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            'status': 'OnGoing'
        }

        const { body } = await supertest(BASE_URL)
            .put(`/todo/${todo.id}`)
            .send(todoPayload)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(201)

        assert.equal(body.id, todo.id)
        assert.equal(body.status, todoPayload.status)
        assert.equal(body.userId, user.id)
    })

    test('2. 실패 - 유저 정보 없음', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            'status': 'OnGoing'
        }

        const { error } = await supertest(BASE_URL)
            .put(`/todo/${todo.id}`)
            .send(todoPayload)
            .expect(401)

        assert.equal(error['status'], 401)
        assert.deepInclude(error['text'], 'You are Unauthorized.')
    })

    test('3. 실패 - Todo Status 빈값', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            'status': ''
        }

        const { error } = await supertest(BASE_URL)
            .put(`/todo/${todo.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .send(todoPayload)
            .expect(422)

        assert.equal(error['status'], 422)
        assert.deepInclude(error['text'], 'required validation failed')
    })

    test('4. 실패 - Todo Status 다른 값', async (assert) => {
        const user = await User.find(1)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            'status': 'what'
        }

        const { error } = await supertest(BASE_URL)
            .put(`/todo/${todo.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .send(todoPayload)
            .expect(422)

        assert.equal(error['status'], 422)
        assert.deepInclude(error['text'], 'OnGoing, Complete 중 하나만 입력 가능합니다.')
    })
})

// TODO 삭제 - [DELETE] /todo/:todoId
test.group('TODO 삭제 테스트 - [DELETE] /todo/:todoId', () => {
    test('1. 성공 - TODO 삭제', async (assert) => {
        const user = await User.find(3)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .delete(`/todo/${todo.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        const deletedTodo = await Todo.find(todo.id)

        assert.equal(result.status, 200)
        assert.isNull(deletedTodo)
    })

    test('2. 실패 - 유저 정보 없음', async (assert) => {
        const user = await User.find(3)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .delete(`/todo/${todo.id}`)
            .expect(401)

        assert.equal(result.status, 401)
    })

    test('3. 실패 - Todo 정보 없음', async (assert) => {
        const user = await User.find(3)
        if (!user) {
            throw new UnAuthorizedException('User Unauthorized')
        }
        await user.load('todos')
        const todo = user.todos[0]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: user.email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .delete(`/todo/99999`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(result.status, 404)
    })
})
