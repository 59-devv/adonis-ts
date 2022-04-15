import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException';
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import fs from 'fs';
import Todo from 'App/Models/Todo';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// Upload File 테스트 - [POST]: /todo
test.group('Upload File 테스트 - [POST]: /todo/upload', () => {
    test('1. 성공 - TODO 파일 업로드', async (assert) => {
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

        const lengthBeforeUpload = (await Todo.all()).length

        const result = await supertest(BASE_URL)
            .post(`/todo/upload`)
            .attach('file', fs.realpathSync('todo_files/todoList_성공.csv', 'utf-8'))
            .set('Authorization', `${tokenType} ${token}`)
            .expect(201)

        const lengthAfterUpload = (await Todo.all()).length

        assert.equal(result.status, 201)
        assert.equal(result.text, 'TodoList upload success.')
        assert.equal((lengthAfterUpload - lengthBeforeUpload), 6)
    })

    test('2. 실패 - 확장자가 CSV가 아님', async (assert) => {
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

        const result = await supertest(BASE_URL)
            .post(`/todo/upload`)
            .attach('file', fs.realpathSync('todo_files/todoList_다른파일형식.rtf', 'utf-8'))
            .set('Authorization', `${tokenType} ${token}`)
            .expect(415)

        assert.equal(result.status, 415)
        assert.equal(result.text, '확장자가 CSV인 파일만 업로드 가능합니다.')
    })

    test('3. 실패 - 유저 정보 없음', async (assert) => {
        const result = await supertest(BASE_URL)
            .post(`/todo/upload`)
            .attach('file', fs.realpathSync('todo_files/todoList_다른파일형식.rtf', 'utf-8'))
            .expect(401)

        assert.equal(result.status, 401)
        assert.equal(result.body.message, 'You are Unauthorized.')
    })
})