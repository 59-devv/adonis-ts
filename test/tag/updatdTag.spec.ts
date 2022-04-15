import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'
import Tag from 'App/Models/Tag'
import User from 'App/Models/User'
import test, { group } from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// TAG 수정 - [PUT]: /tag/:tagId
test.group('태그 수정 테스트 - [PUT]: /tag/:tagId', (group) => {
    test('1. 성공 - 태그 수정', async (assert) => {
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

        const tag = (await user.related('tags').query())[0]
        const tagPayload = {
            'newTagName': 'Modified'
        }

        const { body } = await supertest(BASE_URL)
            .put(`/tag/${tag.id}`)
            .send(tagPayload)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(201)

        assert.equal(body.tag, tagPayload.newTagName)
    })

    test('2. 실패 - 유저 정보 없음', async (assert) => {
        const tagPayload = {
            'newTagName': 'Modified'
        }

        const { error } = await supertest(BASE_URL)
            .put(`/tag/1`)
            .send(tagPayload)
            .expect(401)

        assert.equal(error['status'], 401)
        assert.deepInclude(error['text'], 'You are Unauthorized.')
    })

    test('3. 실패 - 태그 공백', async (assert) => {
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

        const tag = (await user.related('tags').query())[0]
        const tagPayload = {
            'newTagName': ''
        }

        const { error } = await supertest(BASE_URL)
            .put(`/tag/${tag.id}`)
            .send(tagPayload)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(400)

        assert.equal(error['status'], 400)
        assert.deepInclude(error['text'], 'Bad Request')
    })

    test('4. 실패 - 태그Id 없음', async (assert) => {
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

        const tagPayload = {
            'newTagName': 'Modified'
        }

        const { body } = await supertest(BASE_URL)
            .put(`/tag/`)
            .send(tagPayload)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(body.status, 404)
        assert.equal(body.code, 'Not Found')
        assert.equal(body.message, 'Undefined URL')
    })

    test('5. 실패 - 해당 태그 없음', async (assert) => {
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

        const tagPayload = {
            'newTagName': 'Modified'
        }

        const { error } = await supertest(BASE_URL)
            .put(`/tag/99999`)
            .send(tagPayload)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(error['status'], 404)
        assert.equal(error['text'], 'Not Found')
    })

    test('6. 실패 - 본인이 작성한 태그가 아님', async (assert) => {
        const user = await User.find(1)
        const otherUser = await User.find(2)
        if (!user || !otherUser) {
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

        const tag = (await otherUser.related('tags').query())[0]
        const tagPayload = {
            'newTagName': 'Modified'
        }

        const { error } = await supertest(BASE_URL)
            .put(`/tag/${tag.id}`)
            .send(tagPayload)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(403)

        assert.equal(error['status'], 403)
        assert.equal(error['text'], 'You are Forbidden')
    })
})

// TAG 삭제 - [DELETE]: /tag/:tagId
test.group('태그 삭제 테스트 - [DELETE]: /tag/:tagId', () => {
    test('1. 성공 - 태그 삭제', async (assert) => {
        const user = await User.find(5)
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

        const tag = (await user.related('tags').query())[0]

        const result = await supertest(BASE_URL)
            .delete(`/todo/${todo.id}/tag/${tag.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        const deletedTag = await Tag.find(tag.id)

        assert.isNull(deletedTag)
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

        const tag = (await user.related('tags').query())[0]

        const { body } = await supertest(BASE_URL)
            .delete(`/todo/${todo.id}/tag/${tag.id}`)
            .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })

    test('3. 실패 - Todo 없음', async (assert) => {
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

        const tag = (await user.related('tags').query())[0]

        const { error } = await supertest(BASE_URL)
            .delete(`/todo/99999/tag/${tag.id}`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(error['text'], 'Todo Not Found')
        assert.equal(error['status'], 404)
    })

    test('4. 실패 - Tag 없음', async (assert) => {
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

        const tag = (await user.related('tags').query())[0]

        const { error } = await supertest(BASE_URL)
            .delete(`/todo/${todo.id}/tag/99999`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(404)

        assert.equal(error['text'], 'Tag Not Found')
        assert.equal(error['status'], 404)
    })
})
