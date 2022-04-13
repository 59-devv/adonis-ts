import Tag from 'App/Models/Tag'
import Todo from 'App/Models/Todo'
import User from 'App/Models/User'
import execa from 'execa'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

// TAG 조회 - [GET]: /tag
test.group('전체 TAG 조회 테스트 - [GET]: /tag', () => {
    test('1. 성공 - 전체 TAG 조회', async (assert) => {
        const userPayload = {
            email: 'todoTest18@test.com',
            password: 'test1234!',
            nickname: '테스트투두18',
        }

        const user = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
        .post('/login')
        .send({
            email: 'todoTest18@test.com',
            password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            content: 'TAG 조회',
            status: 'OnGoing',
            userId: user.id
        }

        const todo = await Todo.create(todoPayload)

        const tagNameList = ['Get Tag1', 'Get Tag2', 'Get Tag3']

        // console.time('calculatingTime')
        await Promise.all(tagNameList.map(async (item) => {
            let tag: Tag = new Tag()
            tag.tag = item,
            tag.userId = user.id,
            tag.todoId = todo.id

            await tag.save()
            await tag.related('todoTags').attach([todo.id])
            return tag
        }))
        // console.timeEnd('calculatingTime')

        const { body } = await supertest(BASE_URL)
        .get(`/tag`)
        .set('Authorization', `${tokenType} ${token}`)
        .expect(200)

        const foundTag3 = body.filter(item => 
            item['tag'] === 'Get Tag3')[0]

        assert.typeOf(body, 'array')
        assert.property(body[0], 'id')
        assert.equal(foundTag3.tag, 'Get Tag3')
    })

    test('2. 성공 - TAG 없을 때', async (assert) => {
        // DB Rollback
        await Tag.truncate(true)
        
        // // DB Migration
        // await execa.node('ace', ['migration:run'], {
        //     stdio: 'inherit',
        // })
        
        const userPayload = {
            email: 'todoTest19@test.com',
            password: 'test1234!',
            nickname: '테스트투두19',
        }

        const user = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
        .post('/login')
        .send({
            email: 'todoTest19@test.com',
            password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            content: 'TAG 조회2',
            status: 'OnGoing',
            userId: user.id
        }

        await Todo.create(todoPayload)

        const { body } = await supertest(BASE_URL)
        .get(`/tag`)
        .set('Authorization', `${tokenType} ${token}`)
        .expect(200)

        assert.typeOf(body, 'array')
        assert.equal(body.length, 0)
    })

    test('3. 실패 - 유저 정보 없음', async (assert) => {
        const userPayload = {
            email: 'todoTest20@test.com',
            password: 'test1234!',
            nickname: '테스트투두20',
        }

        const user = await User.create(userPayload)

        const todoPayload = {
            content: 'TAG 조회2',
            status: 'OnGoing',
            userId: user.id
        }

        await Todo.create(todoPayload)

        const { body } = await supertest(BASE_URL)
        .get(`/tag`)
        .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })
})

// 로그인 한 User의 TAG 조회 - [GET]: /user/tag
test.group('전체 TAG 조회 테스트 - [GET]: /user/tag', () => {
    test('1. 성공 - 유저의 TAG 조회', async (assert) => {
        const userPayload = {
            email: 'todoTest21@test.com',
            password: 'test1234!',
            nickname: '테스트투두21',
        }

        const user = await User.create(userPayload)

        const loginResult = await supertest(BASE_URL)
        .post('/login')
        .send({
            email: 'todoTest21@test.com',
            password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const todoPayload = {
            content: 'User TAG',
            status: 'OnGoing',
            userId: user.id
        }

        const todo = await Todo.create(todoPayload)

        const tagNameList = ['User Tag1', 'User Tag2', 'User Tag3']

        await Promise.all(tagNameList.map(async (item) => {
            let tag: Tag = new Tag()
            tag.tag = item,
            tag.userId = user.id,
            tag.todoId = todo.id

            await tag.save()
            await tag.related('todoTags').attach([todo.id])
        }))

        const { body } = await supertest(BASE_URL)
        .get(`/user/tag`)
        .set('Authorization', `${tokenType} ${token}`)
        .expect(200)

        assert.lengthOf(body, 3)
        assert.equal(body[0].userId, user.id)
    })

    test('2. 성공 - 유저의 TAG가 없을 때 빈 배열', async (assert) => {
        // DB Rollback
        await Tag.truncate(true)
        
        const userPayload = {
            email: 'todoTest21@test.com',
            password: 'test1234!',
            nickname: '테스트투두21',
        }

        await User.create(userPayload)


        const loginResult = await supertest(BASE_URL)
        .post('/login')
        .send({
            email: 'todoTest21@test.com',
            password: 'test1234!',
        })

        const tokenType: string = loginResult.body.token.type
        const token: string = loginResult.body.token.token

        const { body } = await supertest(BASE_URL)
        .get(`/user/tag`)
        .set('Authorization', `${tokenType} ${token}`)
        .expect(200)

        assert.lengthOf(body, 0)
        assert.typeOf(body, 'array')
    })

    test('3. 실패 - 유저 정보 없음', async (assert) => {
        const { body } = await supertest(BASE_URL)
        .get(`/user/tag`)
        .expect(401)

        assert.equal(body.code, 'UNAUTHORIZED')
        assert.equal(body.message, 'You are Unauthorized.')
        assert.equal(body.status, 401)
    })
})

// TODO별 TAG 조회 - [GET]: /todo/:todoId/tag
test.group('TODO별 TAG 조회 테스트 - [GET]: /todo/:todoId/tag', () => {
    test('1. 성공 - TODO ID를 통한 TAG 조회', async (assert) => {
        const userPayload = {
            email: 'todoTest22@test.com',
            password: 'test1234!',
            nickname: '테스트투두22',
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

        const todoPayload1 = {
            content: 'Todo\'s TAG1',
            status: 'OnGoing',
            userId: user.id
        }

        const todoPayload2 = {
            content: 'Todo\'s TAG2',
            status: 'OnGoing',
            userId: user.id
        }

        const todo1 = await Todo.create(todoPayload1)
        const todo2 = await Todo.create(todoPayload2)

        const tagNameList1 = ['User Tag11', 'User Tag33', 'User Tag55']
        const tagNameList2 = ['User Tag22', 'User Tag44']

        await Promise.all(tagNameList1.map(async (item) => {
            let tag: Tag = new Tag()
            tag.tag = item,
            tag.todoId = todo1.id

            await tag.save()
            await tag.related('todoTags').attach([todo1.id])
            return tag
        }))

        await Promise.all(tagNameList2.map(async (item) => {
            let tag: Tag = new Tag()
            tag.tag = item,
            tag.todoId = todo2.id

            await tag.save()
            await tag.related('todoTags').attach([todo2.id])
        }))

        // console.log(`todo id from test: ${todo1.id}`)
        // const savedTags = await Tag.all()
        // console.log(savedTags)

        const { body } = await supertest(BASE_URL)
            .get(`/todo/${todo1.id}/tag`)
            .set('Authorization', `${tokenType} ${token}`)
            .expect(200)

        console.log(body)
        
    })
})