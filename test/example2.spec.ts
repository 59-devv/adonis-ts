import User from 'App/Models/User'
import test from 'japa'
import { JSDOM } from 'jsdom'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Welcome', () => {
  test('ensure home page works', async (assert) => {
    /**
     * Make request
     */
    const { text } = await supertest(BASE_URL).get('/').expect(200)

    /**
     * Construct JSDOM instance using the response HTML
     */
    const { document } = new JSDOM(text).window

    assert.exists(text)
    assert.equal(text.trim(), 'Adonis!')
  })

  test('ensure user password gets hashed during save', async (assert) => {
    const user = new User()
    user.email = 'user1@user.com'
    user.nickname = '55'
    user.password = 'secret'
    await user.save()

    assert.notEqual(user.password, 'secret')
  })
})
