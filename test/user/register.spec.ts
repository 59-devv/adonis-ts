import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from '../../database/factories/index';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// 회원가입 - [POST]: /register
test.group('회원가입 테스트 - [POST]: /register', () => {
    test('1. 성공 - 회원가입', async (assert) => {
        const { email, password, nickname } = await UserFactory.make()

        const userPayload = {
            email,
            password,
            nickname,
        }

        const { body } = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)

        assert.exists(body.email)
        assert.exists(body.nickname)
        // TODO: email 발송 EVENT 호출되는지 확인하는 방법이 있는지?
    }).timeout(10000)

    test('2. 실패 - Email 형식', async (assert) => {
        const { email, password, nickname } = await UserFactory.merge({ email: 'factoryTest.com' }).make()

        const userPayload = {
            email: email,
            password: password,
            nickname: nickname,
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '올바른 Email 형식이 아닙니다.')
    })

    test('3. 실패 - 중복된 Email', async (assert) => {
        await UserFactory.merge({ email: 'adonis2@gmail.com' }).create()

        const { email, password, nickname } = await UserFactory.merge({ email: 'adonis2@gmail.com' }).make()
        const userPayload = {
            email: email,
            password: password,
            nickname: nickname,
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '중복된 Email이 존재합니다.')
    })

    test('4. 실패 - Email 공백', async (assert) => {
        const { password, nickname } = await UserFactory.make()

        const userPayload = {
            email: '',
            password: password,
            nickname: nickname,
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, 'Email 주소는 필수 입력값입니다.')
    })

    test('5. 실패 - 비밀번호 8자리 미만', async (assert) => {
        const { email, nickname } = await UserFactory.make()
        const userPayload = {
            email: email,
            password: 'test123',
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('6. 실패 - 비밀번호 숫자 미포함', async (assert) => {
        const { email, nickname } = await UserFactory.make()
        const userPayload = {
            email: email,
            password: 'testtes!',
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('7. 실패 - 비밀번호 문자 미포함', async (assert) => {
        const { email, nickname } = await UserFactory.make()
        const userPayload = {
            email: email,
            password: '1234123!',
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('8. 실패 - 비밀번호 특수문자 미포함', async (assert) => {
        const { email, nickname } = await UserFactory.make()
        const userPayload = {
            email: email,
            password: 'test1234',
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 최소 8자로 문자와 숫자를 모두 포함해야합니다.')
    })

    test('9. 실패 - 비밀번호 공백', async (assert) => {
        const { email, nickname } = await UserFactory.make()
        const userPayload = {
            email: email,
            password: '',
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '비밀번호는 필수 입력값입니다.')
    })

    test('10. 실패 - 닉네임 공백', async (assert) => {
        const { email, password } = await UserFactory.make()
        const userPayload = {
            email: email,
            password: password,
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
        await UserFactory.merge({ nickname: '테스트닉네임' }).create()

        const { email, password, nickname } = await UserFactory.merge({ nickname: '테스트닉네임' }).create()
        const userPayload = {
            email: email,
            password: password,
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '중복된 닉네임이 존재합니다.')
    })

    test('12. 실패 - 닉네임 2자 미만', async (assert) => {
        const { email, password, nickname } = await UserFactory.merge({ nickname: '왓' }).make()
        const userPayload = {
            email: email,
            password: password,
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.')
    })

    test('13. 실패 - 닉네임 8자 초과', async (assert) => {
        const { email, password, nickname } = await UserFactory.merge({ nickname: '동해물과백두산이마' }).make()
        const userPayload = {
            email: email,
            password: password,
            nickname: nickname
        }

        const result = await supertest(BASE_URL)
            .post('/register')
            .send(userPayload)
            .expect(422)

        assert.notEqual(result.ok, true)
        assert.deepInclude(result.text, '닉네임은 2자 이상, 8자 이하로 특수문자를 포함할 수 없습니다.')
    })

    test('14. 실패 - 닉네임 특수문자 포함', async (assert) => {
        const { email, password, nickname } = await UserFactory.merge({ nickname: '독도는우리땅!' }).make()
        const userPayload = {
            email: email,
            password: password,
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