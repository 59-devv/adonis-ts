import Todo from 'App/Models/Todo'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// TAG 생성 - [POST]: /todo/:todoId/tag
test.group('TAG 생성 테스트 - [POST]: /todo/:todoId/tag', () => {
    test('1. 성공 - TAG 생성', async (assert) => {
        const userPayload = {
            email: 'todoTest16@test.com',
            password: 'test1234!',
            nickname: '테스트투두16',
        }

        const user = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: 'todoTest16@test.com',
                password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            content: 'TAG 테스트',
            status : 'OnGoing',
            userId: user.id
        }

        const todo: Todo = await Todo.create(todoPayload)

        const { body } = await supertest(BASE_URL)
            .post(`/todo/${todo.id}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .send({ tagName: 'TAG TAG' })
            .expect(201)

        assert.exists(body.id)
        assert.equal(body.todoId, todo.id)
        assert.equal(body.tag, 'TAG TAG')
    })

    test('2. 실패 - 유저 정보 없음', async (assert) => {
        const todoPayload = {
            content: 'TAG 테스트2',
            status : 'OnGoing',
        }

        const todo: Todo = await Todo.create(todoPayload)

        const { body } = await supertest(BASE_URL)
            .post(`/todo/${todo.id}/tag`)
            .send({ tagName: 'TAG TAG2' })
            .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })

    test('3. 실패 - 없는 TODO ID', async (assert) => {
        const userPayload = {
            email: 'todoTest17@test.com',
            password: 'test1234!',
            nickname: '테스트투두17',
        }

        await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: 'todoTest17@test.com',
                password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { error } = await supertest(BASE_URL)
            .post(`/todo/99999/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .send({ tagName: 'TAGTAG' })
            .expect(404)

        assert.equal(error['status'], 404)
        assert.equal(error['text'], 'Not Found')
    })

    test('4. 실패 - 태그 내용 없음', async (assert) => {
        const userPayload = {
            email: 'todoTest17@test.com',
            password: 'test1234!',
            nickname: '테스트투두17',
        }

        await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: 'todoTest17@test.com',
                password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            content: 'TAG 테스트2',
            status : 'OnGoing',
        }

        const todo: Todo = await Todo.create(todoPayload)

        const { error } = await supertest(BASE_URL)
            .post(`/todo/${todo.id}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .send({ tagName: '' })
            .expect(400)

        assert.equal(error['status'], 400)
        assert.equal(error['text'], 'Bad Request')
    })
})