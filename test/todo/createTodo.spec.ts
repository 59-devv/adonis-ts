import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// TODO 생성 - [POST]: /todo
test.group('TODO 생성 테스트 - [POST]: /todo', () => {
    test('1. 성공 - TODO 생성', async (assert) => {
        const userPayload = {
            email: "todoTest@test.com",
            password: "test1234!",
            nickname: "테스트투두1",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: '테스트 투두',
                status: 'OnGoing',
                userId: user.id
            })
            .expect(201)

        assert.exists(body['id'])
        assert.equal(body['content'], '테스트 투두')
        assert.equal(body['status'], 'OnGoing')
        assert.equal(body['userId'], user.id)
    })

    test('2. 실패 - 로그인 정보 없음', async (assert) => {
        const { body } = await supertest(BASE_URL)
            .post('/todo')
            .send({
                content: '테스트 투두',
                status: 'OnGoing',
                userId: 1
            })
            .expect(401)

        assert.equal(body['code'], 'UNAUTHORIZED')
        assert.equal(body['message'], 'You are Unauthorized.')
        assert.equal(body['status'], 401)
    })

    test('3. 실패 - Content Type이 String이 아님', async (assert) => {
        const userPayload = {
            email: "todoTest2@test.com",
            password: "test1234!",
            nickname: "테스트투두2",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: 1,
                status: 'OnGoing',
                userId: user.id
            })
            .expect(422)
            
        assert.equal(result.status, 422)
        assert.equal(result.body.errors[0].message, 'content must be a type of string.')
    })

    test('4. 실패 - Content 공백', async (assert) => {
        const userPayload = {
            email: "todoTest3@test.com",
            password: "test1234!",
            nickname: "테스트투두3",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: '',
                status: 'OnGoing',
                userId: user.id
            })
            .expect(422)
            
        assert.equal(result.status, 422)
        assert.equal(result.body.errors[0].message, 'content is required to create a new Todo')
    })

    test('4. 실패 - Content 4자 미만', async (assert) => {
        const userPayload = {
            email: "todoTest4@test.com",
            password: "test1234!",
            nickname: "테스트투두4",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: '투두',
                status: 'OnGoing',
                userId: user.id
            })
            .expect(422)
            
        assert.equal(result.status, 422)
        assert.equal(result.body.errors[0].message, 'content length should over 4 letters.')
    })

    test('5. 실패 - Content 15자 초과', async (assert) => {
        const userPayload = {
            email: "todoTest5@test.com",
            password: "test1234!",
            nickname: "테스트투두5",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: '1234567890123456',
                status: 'OnGoing',
                userId: user.id
            })
            .expect(422)
            
        assert.equal(result.status, 422)
        assert.equal(result.body.errors[0].message, 'content length should under 15 letters.')
    })

    test('5. 실패 - Content 15자 초과', async (assert) => {
        const userPayload = {
            email: "todoTest5@test.com",
            password: "test1234!",
            nickname: "테스트투두5",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: '1234567890123456',
                status: 'OnGoing',
                userId: user.id
            })
            .expect(422)
            
        assert.equal(result.status, 422)
        assert.equal(result.body.errors[0].message, 'content length should under 15 letters.')
    })

    test('6. 실패 - Status가 Enum에 포함되지 않음', async (assert) => {
        const userPayload = {
            email: "todoTest6@test.com",
            password: "test1234!",
            nickname: "테스트투두6",
        }

        const user: User = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const result = await supertest(BASE_URL)
            .post('/todo')
            .set('Authorization', `${tokenType} ${token}`)
            .send({
                content: '테스트 투두쓰',
                status: 'Tomorrow',
                userId: user.id
            })
            .expect(422)
            
        assert.equal(result.status, 422)
        assert.equal(result.body.errors[0].message, 'status have to be one of the Status codes.')
    })
})