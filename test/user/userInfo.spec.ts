import User from 'App/Models/User';
import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from '../../database/factories/index';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// 유저 리스트 - [GET]: /user
test.group('전체 유저 리스트 조회 - [GET]: /user', () => {
    test('1. 성공 - 전체 회원 조회', async (assert) => {
        const allUsers = await User.all()
        const { email } = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get('/user')
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.property(body[0], 'id')
    })

    test('2. 실패 - 로그인 정보 없을 경우', async (assert) => {
        const result = await supertest(BASE_URL)
            .get('/user')
            .expect(401)

        assert.equal(result.status, 401)
        assert.equal(result.body['code'], 'UNAUTHORIZED')
        assert.equal(result.body['message'], 'You are Unauthorized.')
    })
})

// 로그인 유저 정보 - [GET]: /profile
test.group('로그인 유저 정보 조회 - [GET]: /profile', () => {
    test('1. 성공 - 로그인 유저 정보 조회', async (assert) => {
        const allUsers = await User.all()
        const { email } = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginResult = await supertest(BASE_URL)
            .post('/login')
            .send({
                email: email,
                password: PASSWORD,
            })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
            .get('/profile')
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        assert.property(body, '메일주소')
        assert.property(body, '닉네임')
        assert.property(body, '가입일')
        assert.equal(body['메일주소'], email)
    })

    test('2. 실패 - 로그인 정보 없을 경우', async (assert) => {
        const result = await supertest(BASE_URL)
            .get('/profile')
            .expect(401)

        assert.equal(result.status, 401)
        assert.equal(result.body['code'], 'UNAUTHORIZED')
        assert.equal(result.body['message'], 'You are Unauthorized.')
    })
})