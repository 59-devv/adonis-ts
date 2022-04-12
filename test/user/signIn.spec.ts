import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// 회원가입 - [POST]: /register
test.group('회원가입 테스트 - [POST]: /register' , () => {
    test('1. 성공 - 회원가입', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: 'test1234!',
            nickname: '테스트닉네임'
        }

        const { body } = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(201)
            
        assert.exists(body.id)
        assert.exists(body.email)
        assert.exists(body.nickname)
        // TODO: email 발송 EVENT 호출되는지 확인하는 방법이 있는지?
    }).timeout(10000)

    test('2. 실패 - Email 형식', async (assert) => {
        const userPayload = {
            email: 'test1.com',
            password: 'test1234!',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '올바른 Email 형식이 아닙니다.')
    })

    test('3. 실패 - 중복된 Email', async (assert) => {
        const userPayload = {
            email: 'test1@test.com',
            password: 'test1234!',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '중복된 Email이 존재합니다.')
    })

    test('4. 실패 - Email 공백', async (assert) => {
        const userPayload = {
            email: '',
            password: 'test1234!',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, 'Email 주소는 필수 입력값입니다.')
    })

    test('5. 실패 - 비밀번호 8자리 미만', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test123',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('6. 실패 - 비밀번호 숫자 미포함', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'testtes!',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('7. 실패 - 비밀번호 문자 미포함', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: '1234123!',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('8. 실패 - 비밀번호 특수문자 미포함', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test1234',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('9. 실패 - 비밀번호 공백', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: '',
            nickname: '테스트닉네임1'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 필수 입력값입니다.')
    })

    test('10. 실패 - 닉네임 공백', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test1234!',
            nickname: ''
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '닉네임은 필수 입력값입니다.')
    })


    test('11. 실패 - 닉네임 중복', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test1234!',
            nickname: '테스트닉네임'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '중복된 닉네임이 존재합니다.')
    })

    test('12. 실패 - 닉네임 2자 미만', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test1234!',
            nickname: '왓'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.')
    })

    test('13. 실패 - 닉네임 8자 초과', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test1234!',
            nickname: '동해물과백두산이마'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.')
    })

    test('14. 실패 - 닉네임 특수문자 포함', async (assert) => {
        const userPayload = {
            email: 'test2@test.com',
            password: 'test1234!',
            nickname: '독도는우리땅!'
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.')
    })
})