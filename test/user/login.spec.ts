import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const PASSWORD = 'test1234!'

// 로그인 - [POST]: /login
test.group('로그인 테스트 - [POST]: /login', () => {
    test('1. 성공 - 로그인', async (assert) => {
        const allUsers = await User.all()
        const user: User = allUsers[Math.floor(Math.random() * allUsers.length)]
        const loginPayload = {
            email: user.email,
            password: PASSWORD
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(200)

        assert.exists(body.token)
        assert.equal(body.token.type, 'bearer')
    })

    test('2. 실패 - Email 형식', async (assert) => {
        const loginPayload = {
            email: 'test1.com',
            password: PASSWORD
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, '올바른 Email 형식이 아닙니다.')
    })

    test('3. 실패 - Email 공백', async (assert) => {
        const loginPayload = {
            email: '',
            password: PASSWORD
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, 'Email 주소는 필수 입력값입니다.')
    })

    test('4. 실패 - 비밀번호 8자 미만', async (assert) => {
        const allUsers = await User.all()
        const user: User = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginPayload = {
            email: user.email,
            password: 'test12!'
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('5. 실패 - 비밀번호 숫자 미포함', async (assert) => {
        const allUsers = await User.all()
        const user: User = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginPayload = {
            email: user.email,
            password: 'testtest!'
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('6. 실패 - 비밀번호 문자 미포함', async (assert) => {
        const allUsers = await User.all()
        const user: User = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginPayload = {
            email: user.email,
            password: '12341234!'
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('7. 실패 - 비밀번호 공백', async (assert) => {
        const allUsers = await User.all()
        const user: User = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginPayload = {
            email: user.email,
            password: ''
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, '비밀번호는 필수 입력값입니다.')
    })

    test('8. 실패 - 회원정보 불일치', async (assert) => {
        const allUsers = await User.all()
        const user: User = allUsers[Math.floor(Math.random() * allUsers.length)]

        const loginPayload = {
            email: `${user.email}12`,
            password: 'test12345!'
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(loginPayload)
            .expect(422)

        assert.equal(body.errors[0].message, '올바른 Email 형식이 아닙니다.')
    })
})
