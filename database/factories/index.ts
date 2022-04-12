import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'
import Todo from '../../app/Models/Todo';

export const UserFactory = Factory
    .define(User, ({ faker }) => {
        return {
            email: faker.internet.email(),
            password: faker.internet.password(),
            nickname: faker.internet.userName()
        }
    }).build()


export const TodoFactory = Factory
    .define(Todo, ({ faker }) => {
        return {
            content: faker.internet.domainName(),
            status: 'OnGoing',
        }
    }).build()