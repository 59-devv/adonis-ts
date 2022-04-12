import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// 로그인 - [POST]: /login
test.group('로그인 테스트 - [POST]: /login', () => {
    test('1. 성공 - 로그인', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: 'test1234!'
        }

        const { body } = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(200)

        assert.exists(body.token)
        assert.equal(body.token.type, 'bearer')
    })

    test('2. 실패 - Email 형식', async (assert) => {
        const userPayload = {
            email: 'test1.com',
            password: 'test1234!'
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '올바른 Email 형식이 아닙니다.')
    })

    test('3. 실패 - Email 공백', async (assert) => {
        const userPayload = {
            email: '',
            password: 'test1234!'
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, 'Email 주소는 필수 입력값입니다.')
    })

    test('4. 실패 - 비밀번호 8자 미만', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: 'test12!'
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('5. 실패 - 비밀번호 8자 숫자 미포함', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: 'testtest!'
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('6. 실패 - 비밀번호 8자 문자 미포함', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: '12341234!'
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('7. 실패 - 비밀번호 공백', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: ''
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 필수 입력값입니다.')
    })

    test('8. 실패 - 회원정보 불일치', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: 'test12345!'
        }

        const result = await supertest(BASE_URL)
            .post('/login')
            .send(userPayload)
            .expect(400)

        assert.notEqual(result.ok, true)
    })
})
