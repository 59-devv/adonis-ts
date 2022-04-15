import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'
import Todo from 'App/Models/Todo'
import User from 'App/Models/User'
import { TodoFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import { TagFactory } from '../../database/factories/index';
import NotFoundException from '../../app/Exceptions/NotFoundException';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// TAG 생성 - [POST]: /todo/:todoId/tag
test.group('TAG 생성 테스트 - [POST]: /todo/:todoId/tag', () => {
    test('1. 성공 - TAG 생성', async (assert) => {
        const user = await User.find(3)
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

        const todo = await Todo.find(3)
        if (!todo) {
            throw new NotFoundException('Todo not Found')
        }

        const tag = await TagFactory.make()

        const { body } = await supertest(BASE_URL)
            .post(`/todo/${todo.id}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .send({ tagName: tag.tag })
            .expect(201)

        assert.exists(body.id)
        assert.equal(body.todoId, todo.id)
        assert.equal(body.tag, tag.tag)
    })

    test('2. 실패 - 유저 정보 없음', async (assert) => {
        const allTodos = await Todo.all()
        const todo = allTodos[Math.floor(Math.random() * allTodos.length)]

        const tag = await TagFactory.make()

        const { body } = await supertest(BASE_URL)
            .post(`/todo/${todo.id}/tag`)
            .send({ tagName: tag.tag })
            .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })

    test('3. 실패 - 없는 TODO ID', async (assert) => {
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

        const tag = await TagFactory.make()

        const { error } = await supertest(BASE_URL)
            .post(`/todo/${allTodosLength + 1}}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .send({ tagName: tag.tag })
            .expect(404)

        assert.equal(error['status'], 404)
        assert.equal(error['text'], 'Todo Not Found')
    })

    test('4. 실패 - 태그 내용 없음', async (assert) => {
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

        const { error } = await supertest(BASE_URL)
            .post(`/todo/${todo.id}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .send({ tagName: '' })
            .expect(400)

        assert.equal(error['status'], 400)
        assert.equal(error['text'], 'Bad Request')
    })
})